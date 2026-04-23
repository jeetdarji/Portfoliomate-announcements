import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { extractTextFromPDFUrl } from '@/lib/pdfTextExtractor'
import { sanitizeSupabaseError } from '@/lib/utils'

// ── Groq config ─────────────────────────────────────────────────────
// TODO [SECURITY]: VITE_GROQ_API_KEY is exposed in the frontend bundle.
// Move this to a Supabase Edge Function and proxy requests server-side.
// The API key should be set as a Supabase Edge Function secret, not a VITE_ env var.
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const TIMEOUT_MS = 60_000 // 60s for longer chat answers
const MAX_PDF_CHARS = 60_000 // Max chars of PDF text sent as context (Llama 3.3 has 128K token window)
const MAX_HISTORY_PAIRS = 10 // Keep last N exchange pairs to avoid context overflow

// ── System prompt for deck chat ─────────────────────────────────────
const SYSTEM_PROMPT = `You are a precise and helpful analyst assistant working for a private equity firm. The user has shared a document with you — it may be a pitch deck, financial report, investment overview, or company summary. Your job is to answer their questions clearly and concisely based strictly on what is in the document.

If a question cannot be answered from the document, say so explicitly — do not speculate or use outside knowledge to fill gaps. Be direct. Lead with the answer, then provide supporting detail. Use bullet points for lists of facts. Keep responses focused and scannable. Do not summarize the entire document unless explicitly asked.

The extracted text from the document is provided below. Base all your answers on this text only.`

// ── In-memory session cache (survives re-renders, cleared on page refresh) ──
// Keyed by attachment URL → { messages, sessionId, pdfText }
const sessionCache = new Map()

/**
 * Hook that encapsulates all Chat with PDF logic:
 * - PDF text extraction (cached)
 * - Groq API calls with conversation history
 * - Optimistic message state
 * - DB persistence (chat_sessions + chat_messages)
 */
export function useChatWithPDF(announcementId, attachment) {
  const { profile } = useAuthStore()
  const attachmentUrl = attachment?.url || ''

  // Restore from cache or start fresh
  const cached = sessionCache.get(attachmentUrl)
  const [messages, setMessages] = useState(cached?.messages || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(cached?.sessionId || null)

  // Ref for PDF text so we don't re-extract on every message
  const pdfTextRef = useRef(cached?.pdfText || null)
  const isExtractingRef = useRef(false)
  // AbortController ref for cancelling in-flight fetch requests (5E)
  const abortControllerRef = useRef(null)
  // Track previous attachment URL to detect PDF switches
  const prevUrlRef = useRef(attachmentUrl)

  // ── Reset state when switching to a different PDF ─────────────────
  useEffect(() => {
    if (prevUrlRef.current === attachmentUrl) return
    prevUrlRef.current = attachmentUrl

    // Abort any in-flight request from the previous PDF
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Restore from cache for the new URL, or start fresh
    const entry = sessionCache.get(attachmentUrl)
    setMessages(entry?.messages || [])
    setSessionId(entry?.sessionId || null)
    pdfTextRef.current = entry?.pdfText || null
    setError(null)
    setIsLoading(false)
  }, [attachmentUrl])

  // ── Persist to cache on every state change ────────────────────────
  const updateCache = useCallback(
    (msgs, sid, pdfText) => {
      if (!attachmentUrl) return
      sessionCache.set(attachmentUrl, {
        messages: msgs,
        sessionId: sid,
        pdfText: pdfText ?? pdfTextRef.current,
      })
    },
    [attachmentUrl]
  )

  // ── Load existing session from DB (called once on panel open) ─────
  const loadExistingSession = useCallback(async () => {
    if (!profile || !announcementId || !attachmentUrl) return

    // Check in-memory cache first
    const entry = sessionCache.get(attachmentUrl)
    if (entry?.messages?.length > 0) {
      setMessages(entry.messages)
      setSessionId(entry.sessionId || null)
      pdfTextRef.current = entry.pdfText || null
      setError(null)
      return
    }

    // Reset state for a fresh load
    setMessages([])
    setSessionId(null)
    setError(null)

    try {
      // Check if a session exists for this user + announcement + attachment
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('announcement_id', announcementId)
        .eq('user_id', profile.id)
        .eq('attachment_url', attachmentUrl)
        .maybeSingle()

      if (session) {
        setSessionId(session.id)
        // Load messages from DB
        const { data: dbMessages } = await supabase
          .from('chat_messages')
          .select('id, role, content, created_at')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true })

        if (dbMessages && dbMessages.length > 0) {
          const restored = dbMessages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.created_at,
          }))
          setMessages(restored)
          updateCache(restored, session.id, null)
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[ChatWithPDF] Failed to load existing session:', err.message)
    }
  }, [profile, announcementId, attachmentUrl, updateCache])

  // ── Extract PDF text (with caching) ───────────────────────────────
  const ensurePdfText = useCallback(async () => {
    if (pdfTextRef.current) return pdfTextRef.current
    if (isExtractingRef.current) {
      // Wait for ongoing extraction
      while (isExtractingRef.current) {
        await new Promise((r) => setTimeout(r, 100))
      }
      return pdfTextRef.current
    }

    isExtractingRef.current = true
    try {
      const { text } = await extractTextFromPDFUrl(attachmentUrl)
      pdfTextRef.current = text
      return text
    } finally {
      isExtractingRef.current = false
    }
  }, [attachmentUrl])

  // ── Persist messages to DB ────────────────────────────────────────
  const persistToDb = useCallback(
    async (sid, userContent, assistantContent, { skipUserMessage = false } = {}) => {
      if (!profile) return sid

      try {
        // Upsert session
        const { data: sessionRow } = await supabase
          .from('chat_sessions')
          .upsert(
            {
              id: sid || undefined,
              firm_id: profile.firm_id,
              announcement_id: announcementId,
              user_id: profile.id,
              attachment_url: attachmentUrl,
              attachment_name: attachment?.name || 'document.pdf',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'announcement_id,user_id,attachment_url' }
          )
          .select('id')
          .single()

        const finalSessionId = sessionRow?.id || sid

        // Insert user message (skip on retry to avoid duplicates)
        if (!skipUserMessage) {
          await supabase.from('chat_messages').insert({
            session_id: finalSessionId,
            firm_id: profile.firm_id,
            role: 'user',
            content: userContent,
          })
        }

        // Insert assistant message
        await supabase.from('chat_messages').insert({
          session_id: finalSessionId,
          firm_id: profile.firm_id,
          role: 'assistant',
          content: assistantContent,
        })

        return finalSessionId
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[ChatWithPDF] DB persist failed:', err.message)
        return sid
      }
    },
    [profile, announcementId, attachmentUrl, attachment?.name] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // ── Build Groq messages array ─────────────────────────────────────
  const buildGroqMessages = useCallback(
    (pdfText, conversationHistory, newMessage) => {
      const truncatedPdf = pdfText.substring(0, MAX_PDF_CHARS)

      const systemMsg = {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\n--- DOCUMENT TEXT ---\n${truncatedPdf}\n--- END DOCUMENT ---`,
      }

      // Sliding window: keep last N pairs of messages
      let history = conversationHistory
      if (history.length > MAX_HISTORY_PAIRS * 2) {
        history = history.slice(-MAX_HISTORY_PAIRS * 2)
      }

      const historyMsgs = history.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      return [systemMsg, ...historyMsgs, { role: 'user', content: newMessage }]
    },
    []
  )

  // ── Timeout wrapper ───────────────────────────────────────────────
  const withTimeout = (promise, ms, signal) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error('Request timed out')), ms)
        signal?.addEventListener('abort', () => clearTimeout(timer))
      }),
    ])
  }

  // ── Send message ──────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text, { isRetry = false } = {}) => {
      if (!text.trim() || isLoading) return
      if (!GROQ_API_KEY) {
        setError('AI chat is not configured. Please contact your administrator.')
        return
      }

      // Abort any previous in-flight request (5E: race condition guard)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      const controller = new AbortController()
      abortControllerRef.current = controller

      // For retry, user message is already in the list; for new messages, add it
      let updatedMessages
      if (isRetry) {
        updatedMessages = [...messages]
      } else {
        const userMsg = {
          id: crypto.randomUUID(),
          role: 'user',
          content: text.trim(),
          timestamp: new Date().toISOString(),
        }
        updatedMessages = [...messages, userMsg]
        setMessages(updatedMessages)
      }

      setIsLoading(true)
      setError(null)

      try {
        // 1. Ensure PDF text is extracted
        const pdfText = await ensurePdfText()
        if (!pdfText || pdfText.length < 20) {
          throw new Error(
            'Could not extract enough text from this PDF. The file may be image-based or encrypted.'
          )
        }

        // 2. Build Groq API request
        // History = all messages except the last user message (buildGroqMessages appends it)
        const historyForGroq = updatedMessages.slice(0, -1)
        const groqMessages = buildGroqMessages(pdfText, historyForGroq, text.trim())

        // 3. Call Groq API with AbortController signal
        const response = await withTimeout(
          fetch(GROQ_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: GROQ_MODEL,
              messages: groqMessages,
              temperature: 0.3,
              max_tokens: 1024,
            }),
            signal: controller.signal,
          }),
          TIMEOUT_MS,
          controller.signal
        )

        if (!response.ok) {
          const errBody = await response.text().catch(() => '')
          throw new Error(`API error (${response.status}): ${errBody}`)
        }

        const data = await response.json()
        const reply = data?.choices?.[0]?.message?.content

        if (!reply) {
          throw new Error('Empty response from AI')
        }

        // 4. Create assistant message
        const assistantMsg = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString(),
        }

        const finalMessages = [...updatedMessages, assistantMsg]
        setMessages(finalMessages)

        // 5. Persist to DB (skip user message insert on retry to avoid duplicates)
        const newSessionId = await persistToDb(
          sessionId, text.trim(), reply, { skipUserMessage: isRetry }
        )
        setSessionId(newSessionId)

        // 6. Update cache
        updateCache(finalMessages, newSessionId, pdfTextRef.current)
      } catch (err) {
        // Ignore abort errors (expected when user sends a new message or unmounts)
        if (err.name === 'AbortError') return
        if (import.meta.env.DEV) console.error('[ChatWithPDF] Error:', err.message)
        setError(err.message || 'Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [
      messages,
      isLoading,
      ensurePdfText,
      buildGroqMessages,
      persistToDb,
      sessionId,
      updateCache,
    ]
  )

  // ── Clear session (start fresh) ───────────────────────────────────
  const clearSession = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setError(null)
    pdfTextRef.current = null
    if (attachmentUrl) sessionCache.delete(attachmentUrl)
  }, [attachmentUrl])

  // ── Abort in-flight request (call on unmount) ──────────────────────
  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearSession,
    loadExistingSession,
    setError,
    abortRequest,
  }
}
