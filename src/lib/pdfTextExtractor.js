// ── PDF Text Extractor ──────────────────────────────────────────────
// Extracts readable text from a PDF given a URL or File object.
// Uses pdf.js loaded from CDN for proper handling of compressed streams,
// font encoding, and all modern PDF features.
// Used by: useChatWithPDF hook, aiSummarizer

const PDFJS_VERSION = '4.4.168'
const PDFJS_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build`

// Lazy-load pdf.js from CDN — cached after first load
let _pdfjsLib = null
async function getPdfJs() {
  if (_pdfjsLib) return _pdfjsLib
  const lib = await import(/* @vite-ignore */ `${PDFJS_CDN}/pdf.min.mjs`)
  lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.mjs`
  _pdfjsLib = lib
  return lib
}

/**
 * Extract text from a PDF using pdf.js.
 * Handles compressed streams, CID fonts, ToUnicode maps, etc.
 * @param {Uint8Array | ArrayBuffer} data - PDF binary data
 * @returns {Promise<string>}
 */
async function extractTextWithPdfJs(data) {
  const pdfjsLib = await getPdfJs()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pageTexts = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    // Build page text preserving line breaks from pdf.js
    const parts = []
    for (const item of content.items) {
      if (item.str) parts.push(item.str)
      if (item.hasEOL) parts.push('\n')
    }
    pageTexts.push(parts.join(''))
  }

  return pageTexts.join('\n').replace(/[ \t]+/g, ' ').trim()
}

/**
 * Extract text from a PDF File object (client-side upload).
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromPDFFile(file) {
  const buffer = await file.arrayBuffer()
  return extractTextWithPdfJs(new Uint8Array(buffer))
}

/**
 * Download a PDF from a URL and extract its text.
 * Used for the "Chat with this Deck" feature where the PDF is already in Supabase Storage.
 * @param {string} url - Public Supabase Storage URL of the PDF
 * @returns {Promise<{text: string, sizeBytes: number}>}
 */
export async function extractTextFromPDFUrl(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  const sizeBytes = buffer.byteLength

  // Size guard: reject PDFs over 10MB
  if (sizeBytes > 10 * 1024 * 1024) {
    throw new Error('PDF too large for analysis (max 10MB)')
  }

  const text = await extractTextWithPdfJs(new Uint8Array(buffer))
  return { text, sizeBytes }
}
