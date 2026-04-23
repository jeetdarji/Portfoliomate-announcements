// ── AI PDF Summarizer using Groq API (Llama 3.3) ───────────────────
// Exports: extractPDFSummary(pdfFile) → { startup_name, funding_amount, summary } | null
// Uses: Groq cloud (free tier: 30 req/min) with client-side PDF text extraction
// NEVER throws — always returns null on any failure so the announcement still publishes.

import { extractTextFromPDFFile } from '@/lib/pdfTextExtractor'

// TODO [SECURITY]: VITE_GROQ_API_KEY is exposed in the frontend bundle.
// Move this to a Supabase Edge Function and proxy requests server-side.
// The API key should be set as a Supabase Edge Function secret, not a VITE_ env var.
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const TIMEOUT_MS = 30_000

// ── System prompt ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AI analyst for a PE/VC investment platform called Portfoliomate. You are analyzing text extracted from a startup pitch deck or financial document uploaded by a fund manager or analyst.

Your audience is sophisticated investors who want facts, not marketing language. Be extremely concise and data-focused.

You MUST respond ONLY with valid JSON — no preamble, no markdown code blocks, no explanation, no extra text. Just the raw JSON object.

The JSON schema you must follow exactly:
{
  "startup_name": "The exact name of the company/startup",
  "funding_amount": "The amount they are raising (e.g. '₹50 Lakhs', '$2M Seed', 'Series A: $5M'). If not found, write 'Not disclosed'.",
  "summary": "Exactly 2 sentences. Sentence 1: what the company does. Sentence 2: their current traction or stage."
}

If the text does NOT contain startup/company information, return:
{ "startup_name": "Unknown", "funding_amount": "Not disclosed", "summary": "This document does not appear to be a startup pitch deck." }`

// ── Timeout wrapper ──────────────────────────────────────────────────
function withTimeout(promise, ms) {
  const timeout = new Promise((resolve) => {
    setTimeout(() => {
      if (import.meta.env.DEV) console.warn(`[AI Summary] Timed out after ${ms / 1000}s`)
      resolve(null)
    }, ms)
  })
  return Promise.race([promise, timeout])
}

// ── Main export ──────────────────────────────────────────────────────
export async function extractPDFSummary(pdfFile) {
  try {
    if (!GROQ_API_KEY) {
      if (import.meta.env.DEV) console.warn('[AI Summary] VITE_GROQ_API_KEY not set — skipping')
      return null
    }

    // 1. Extract text from PDF client-side
    const pdfText = await extractTextFromPDFFile(pdfFile)
    if (!pdfText || pdfText.length < 20) {
      if (import.meta.env.DEV) console.warn('[AI Summary] Insufficient text extracted from PDF')
      return null
    }

    // 2. Call Groq API (OpenAI-compatible format)
    const requestBody = {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Here is the text extracted from a pitch deck PDF:\n\n---\n${pdfText.substring(0, 30000)}\n---\n\nPlease analyze this and extract the startup name, funding ask, and a 2-sentence summary. Respond only with the JSON object as specified.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
    }

    const result = await withTimeout(
      fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }),
      TIMEOUT_MS
    )

    if (!result) return null

    if (!result.ok) {
      const errBody = await result.text().catch(() => '')
      if (import.meta.env.DEV) console.warn('[AI Summary] API error:', result.status, errBody)
      return null
    }

    const data = await result.json()
    const textContent = data?.choices?.[0]?.message?.content
    if (!textContent) {
      if (import.meta.env.DEV) console.warn('[AI Summary] Empty response from AI')
      return null
    }

    // 3. Parse JSON — strip markdown fences if present
    let cleaned = textContent.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleaned)

    // 4. Validate shape
    if (
      typeof parsed.startup_name === 'string' &&
      typeof parsed.funding_amount === 'string' &&
      typeof parsed.summary === 'string'
    ) {
      return parsed
    }

    if (import.meta.env.DEV) console.warn('[AI Summary] Unexpected response shape')
    return null
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[AI Summary] Failed, publishing without summary:', err.message)
    return null
  }
}
