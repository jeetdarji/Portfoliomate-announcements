import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Sparkles, SendHorizonal, RotateCcw } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useChatWithPDF } from '@/hooks/useChatWithPDF'

// ── Suggestion pills for empty state ────────────────────────────────
const SUGGESTIONS = [
  'What is the funding ask?',
  'Summarize the business model',
  'What are the key risks?',
  'Who are the founders?',
]

// ── Typing indicator (3-dot pulse) ──────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end max-w-[85%]">
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-[#94A3B8]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Lightweight markdown renderer (no external dependency) ──────────
// Handles: **bold**, bullet lists (- / *), numbered lists, line breaks
function SimpleMarkdown({ content }) {
  const lines = content.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Bullet list block
    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-4 my-1 space-y-0.5">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list block
    if (/^\s*\d+[.)\s]/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)\s]/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)\s]+/, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-4 my-1 space-y-0.5">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>
      )
      continue
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      i++
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1">{renderInline(line)}</p>
    )
    i++
  }

  return <>{elements}</>
}

// Inline formatting: **bold**
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>
    }
    return <span key={idx}>{part}</span>
  })
}

// ── Message bubble ──────────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <div className="bg-[#010080] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] ml-auto whitespace-pre-wrap">
          {message.content}
        </div>
        {time && <span className="text-[11px] text-[#94A3B8] mr-1">{time}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172B] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%]">
        <SimpleMarkdown content={message.content} />
      </div>
      {time && <span className="text-[11px] text-[#94A3B8] ml-1">{time}</span>}
    </div>
  )
}

// ── Error bubble ────────────────────────────────────────────────────
function ErrorBubble({ error, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%]">
        <p className="font-medium text-xs mb-1">Something went wrong</p>
        <p className="text-xs text-red-600">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-xs text-[#010080] hover:underline ml-1 bg-transparent border-none cursor-pointer"
      >
        <RotateCcw size={12} />
        Retry
      </button>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────
function EmptyState({ onSuggestionClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
      <Sparkles size={32} className="text-[#010080] opacity-60" />
      <h3 className="font-display font-semibold text-[15px] text-[#0F172B]">
        Ask anything about this deck
      </h3>
      <p className="text-[13px] text-[#62748E] max-w-[280px]">
        Get instant answers grounded in the document. Try one of these:
      </p>
      <div className="flex flex-wrap gap-2 justify-center mt-1">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className="text-[12px] text-[#010080] bg-[#EEEEFF] hover:bg-[#DDDDF8] rounded-full px-3 py-1.5 border-none cursor-pointer transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main Panel Component ────────────────────────────────────────────
export function ChatWithDeckPanel() {
  const { isOpen, attachment, announcementId, closeChat } = useChatStore()
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearSession,
    loadExistingSession,
    setError,
    abortRequest,
  } = useChatWithPDF(announcementId, attachment)

  const [inputValue, setInputValue] = useState('')
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Load existing session from DB when panel opens or PDF changes
  useEffect(() => {
    if (isOpen && announcementId && attachment) {
      loadExistingSession()
    }
  }, [isOpen, announcementId, attachment?.url, loadExistingSession])

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, error])

  // ESC key closes panel
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) closeChat()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, closeChat])

  // Lock body scroll when panel is open; abort in-flight requests on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      abortRequest()
    }
    return () => {
      document.body.style.overflow = ''
      abortRequest()
    }
  }, [isOpen, abortRequest])

  // Auto-expand textarea
  const handleTextareaInput = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }, [])

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue)
    setInputValue('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [inputValue, isLoading, sendMessage])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleSuggestionClick = useCallback(
    (text) => {
      sendMessage(text)
    },
    [sendMessage]
  )

  const handleRetry = useCallback(() => {
    setError(null)
    // Resend the last user message (isRetry avoids duplicate user message)
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content, { isRetry: true })
    }
  }, [messages, sendMessage, setError])

  return (
    <AnimatePresence>
      {isOpen && attachment && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeChat}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 z-[70] w-full lg:w-[420px] bg-white border-l border-[#E2E8F0] shadow-xl flex flex-col"
            style={{ height: '100dvh' }}
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── HEADER ─────────────────────────────────────────── */}
            <div className="h-auto min-h-[64px] border-b border-[#E2E8F0] px-5 py-3 flex flex-col gap-1.5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#EEEEFF] flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-[#010080]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#0F172B] truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-[#62748E]">AI Document Assistant</p>
                  </div>
                </div>
                <button
                  onClick={closeChat}
                  className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#62748E] hover:text-[#0F172B] transition-colors border-none bg-transparent cursor-pointer flex-shrink-0"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="inline-flex items-center gap-1 self-start">
                <span className="text-[11px] text-[#010080] bg-[#EEEEFF] rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                  <Sparkles size={10} />
                  Powered by Groq AI
                </span>
              </div>
            </div>

            {/* ── CHAT HISTORY ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.length === 0 && !isLoading ? (
                <EmptyState onSuggestionClick={handleSuggestionClick} />
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && <TypingIndicator />}
                  {error && !isLoading && (
                    <ErrorBubble error={error} onRetry={handleRetry} />
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ── INPUT AREA ─────────────────────────────────────── */}
            <div className="border-t border-[#E2E8F0] px-4 py-3 bg-white flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onInput={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about this deck..."
                  className="flex-1 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm resize-none min-h-[44px] max-h-[120px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] transition-colors placeholder:text-[#94A3B8]"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="rounded-xl bg-[#010080] p-2.5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0100A0] transition-colors border-none cursor-pointer flex-shrink-0"
                  aria-label="Send message"
                >
                  <SendHorizonal size={18} />
                </button>
              </div>
              <p className="text-[11px] text-[#94A3B8] text-center mt-1.5">
                Responses are based on document content only
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ChatWithDeckPanel
