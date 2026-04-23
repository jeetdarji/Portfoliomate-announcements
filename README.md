<div align="center">

# Portfoliomate — Announcements Feed 

**A real-time, multi-tenant announcements platform for VC / PE firms with AI-powered document intelligence.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#) &nbsp;·&nbsp; [Features](#-features) &nbsp;·&nbsp; [Tech Stack](#-tech-stack) &nbsp;·&nbsp; [Getting Started](#-getting-started) &nbsp;·&nbsp; [Architecture](#-architecture-decisions)

</div>

---

## Overview

Portfoliomate Announcements is a **production-grade internal feed** built for investment firms. Fund managers and analysts can publish rich-text announcements with images, PDFs, and tags — while AI automatically extracts pitch-deck insights and enables multi-turn Q&A on any uploaded document.

Every row in the database is scoped by `firm_id` and protected by **PostgreSQL Row-Level Security (RLS)**, ensuring that employees at Firm A can never access data from Firm B.

---

## Features

| Category | What it does |
|---|---|
| **Authentication** | Email/password login + Google OAuth via Supabase Auth; session persisted & auto-refreshed |
| **Real-time Feed** | Announcements appear instantly across all connected clients via Supabase Realtime (Postgres Changes) |
| **Rich Text Editor** | Tiptap-based WYSIWYG editor with bold, italic, underline, links, bullet lists & placeholder |
| **Image Uploads** | Drag-and-drop or click-to-upload multiple images; stored in Supabase Storage; rendered in a responsive grid |
| **PDF Attachments** | Upload PDFs alongside announcements; download links rendered with file name, size & type |
| **Likes** | Optimistic toggle with instant UI update; count maintained by a Postgres trigger |
| **Comments** | Threaded comment system with realtime subscription; pinnable comments |
| **Search & Filter** | Client-side full-text search, topic/tag filter, pinned-only toggle, sort by newest/oldest, author filter |
| **Pinned Posts** | Pin important announcements to the top of the feed; visual pinned banner |
| **Delete** | Authors can delete their own announcements (cascade-deletes likes, comments, chat sessions) |
| **AI Auto-Summarizer** | Attach a PDF → Groq API (Llama 3.3 70B) reads it → extracts startup name, funding amount & 2-sentence summary → saved to `ai_summary` column → rendered as a collapsible "Pitch Deck Insights" card |
| **AI Chat with Deck** | Click "Chat with this Deck" on any PDF → slide-in panel → multi-turn Q&A powered by Groq → conversation persisted to `chat_sessions` + `chat_messages` tables |
| **Multi-Tenant Security** | Every table carries `firm_id`; RLS policies + `get_my_firm_id()` helper guarantee strict tenant isolation |

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| React Router | v7 | Client-side routing |
| Zustand | 5 | Lightweight global state (auth, feed filters, chat panel) |
| TanStack Query | v5 | Server-state caching, optimistic updates, realtime invalidation |
| Tiptap | 3 | Rich text editor (StarterKit + Link + Underline + Placeholder) |
| React Hook Form + Zod | 7 / 4 | Form validation (login page) |
| Framer Motion | 12 | Animations & transitions |
| Lucide React | 1.8 | Icon library |
| date-fns | 4 | Date formatting |
| Sonner | 2 | Toast notifications |
| pdf.js (CDN) | 4.4 | Client-side PDF text extraction |

### Backend

| Service | Purpose |
|---|---|
| **Supabase PostgreSQL** | Primary database with RLS policies on every table |
| **Supabase Auth** | Email/password + Google OAuth, JWT-based session management |
| **Supabase Realtime** | Postgres Changes subscriptions for live feed & comments |
| **Supabase Storage** | Three public buckets: `announcement-images`, `announcement-files`, `avatars` |

### AI

| Provider | Model | Purpose |
|---|---|---|
| **Groq** | `llama-3.3-70b-versatile` | PDF auto-summarization & Chat with Deck Q&A |

---

## Project Structure

```
portfoliomate-announcements/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                    # Static assets
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx      # Re-export wrapper
│   │   │   └── ProtectedRoute.jsx # Auth guard with loading spinner
│   │   ├── chat/
│   │   │   └── ChatWithDeckPanel.jsx  # Slide-in AI chat panel
│   │   ├── feed/
│   │   │   ├── AISummaryCard.jsx      # Collapsible AI insights card
│   │   │   ├── AnnouncementCard.jsx   # Main feed card
│   │   │   ├── AttachmentRow.jsx      # PDF/file download row
│   │   │   ├── CommentInput.jsx       # Comment text input
│   │   │   ├── CommentThread.jsx      # Threaded comments list
│   │   │   ├── ComposerBar.jsx        # "New Announcement" trigger bar
│   │   │   ├── ImageGrid.jsx          # Responsive image gallery
│   │   │   ├── LikeCommentBar.jsx     # Like/comment action buttons
│   │   │   ├── PinnedBanner.jsx       # "Pinned" label banner
│   │   │   ├── PostAuthorHeader.jsx   # Author avatar + name + timestamp
│   │   │   └── TopicTag.jsx           # Tag pill component
│   │   ├── layout/
│   │   │   ├── AppShell.jsx       # Main layout (sidebar + content + right panel)
│   │   │   ├── RightPanel.jsx     # Right sidebar (trending, filters)
│   │   │   ├── Sidebar.jsx        # Left navigation sidebar
│   │   │   └── TopBar.jsx         # Top navigation bar with search
│   │   ├── modal/
│   │   │   ├── CreateAnnouncementModal.jsx  # Full-screen create modal
│   │   │   ├── FilePreviewList.jsx          # Attached files preview
│   │   │   ├── ModalFooter.jsx              # Publish button + stage indicator
│   │   │   ├── ModalHeader.jsx              # Modal title bar
│   │   │   ├── PinToggle.jsx               # Pin announcement toggle
│   │   │   ├── RichTextEditor.jsx           # Tiptap editor wrapper
│   │   │   ├── TagInput.jsx                 # Tag input with chips
│   │   │   └── TitleInput.jsx               # Title field with validation
│   │   └── ui/
│   │       ├── Avatar.jsx         # User avatar with fallback
│   │       ├── Badge.jsx          # Status/role badge
│   │       ├── Button.jsx         # Reusable button component
│   │       └── Spinner.jsx        # Loading spinner
│   ├── hooks/
│   │   ├── useAnnouncements.js    # CRUD + realtime + AI summary integration
│   │   ├── useAuth.js             # Auth init + sign-in/out actions
│   │   ├── useChatWithPDF.js      # Multi-turn AI chat with PDF context
│   │   ├── useComments.js         # Comments CRUD + realtime
│   │   └── useLikes.js            # Optimistic like toggle
│   ├── lib/
│   │   ├── aiSummarizer.js        # Groq API call for PDF summarization
│   │   ├── pdfTextExtractor.js    # pdf.js-based text extraction
│   │   ├── queryClient.js         # TanStack Query client config
│   │   ├── supabase.js            # Supabase client initialization
│   │   └── utils.js               # Helpers (cn, sanitizeSupabaseError, etc.)
│   ├── pages/
│   │   ├── AnnouncementsPage.jsx  # Main feed page with filters & chat panel
│   │   └── LoginPage.jsx          # Login/signup page with form validation
│   ├── store/
│   │   ├── authStore.js           # Zustand: session, profile, loading
│   │   ├── chatStore.js           # Zustand: chat panel open/close state
│   │   └── feedStore.js           # Zustand: topic, search, sort, filters
│   ├── App.jsx                    # Route definitions
│   ├── index.css                  # Global styles + Tailwind directives
│   └── main.jsx                   # App entry point with providers
├── supabase/
│   └── migrations/
│       ├── security_hardening.sql # RLS hardening + function search_path fixes
│       └── chat_with_deck.sql     # Chat sessions & messages tables + RLS
├── .env.example                   # Template for environment variables
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## Database Schema

### Announcement Object

Each announcement is stored as a row in the `announcements` table with the following structure:

```json
{
  "id": "uuid",
  "firm_id": "uuid",
  "author_id": "uuid",
  "title": "Series A Announcement — Acme Corp",
  "content": { "type": "doc", "content": [ /* Tiptap JSON */ ] },
  "content_text": "Plain text version for search indexing",
  "tags": ["funding", "series-a", "fintech"],
  "is_pinned": false,
  "image_urls": [
    "https://<supabase-storage>/announcement-images/firm_id/user_id/timestamp_photo.jpg"
  ],
  "attachments": [
    {
      "name": "Acme_PitchDeck.pdf",
      "url": "https://<supabase-storage>/announcement-files/firm_id/user_id/timestamp_deck.pdf",
      "size": "2.45 MB",
      "type": "application/pdf"
    }
  ],
  "ai_summary": {
    "startup_name": "Acme Corp",
    "funding_amount": "$5M Series A",
    "summary": "Acme Corp is a fintech startup building embedded lending APIs for e-commerce platforms. They have 120+ enterprise clients and $2M ARR with 15% month-over-month growth."
  },
  "likes_count": 12,
  "comments_count": 4,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Core Tables

| Table | Purpose |
|---|---|
| `firms` | Tenant registry (one row per firm) |
| `profiles` | User profiles with `firm_id`, `full_name`, `avatar_url`, `role` |
| `announcements` | Main feed content (see schema above) |
| `likes` | Join table: `user_id` × `announcement_id` (unique constraint) |
| `comments` | Threaded comments with `parent_id`, `is_pinned` |
| `chat_sessions` | One session per user × announcement × PDF (unique constraint) |
| `chat_messages` | Immutable chat messages with `role` (user/assistant) |

---

## Multi-Tenant Security

Portfoliomate enforces strict tenant isolation at the **database level** using PostgreSQL Row-Level Security (RLS). This is not application-level filtering — it is impossible to bypass, even with direct SQL access through the Supabase client.

### How it works

1. **Every table has a `firm_id` column** — announcements, comments, likes, chat_sessions, chat_messages all carry `firm_id`
2. **`get_my_firm_id()` helper function** — a `SECURITY DEFINER` function that looks up the current user's firm from `profiles`
3. **RLS policies on every table** — every `SELECT`, `INSERT`, `UPDATE`, `DELETE` policy includes `firm_id = get_my_firm_id()`

### The Helper Function

```sql
CREATE OR REPLACE FUNCTION public.get_my_firm_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT firm_id FROM public.profiles WHERE id = auth.uid();
$$;
```

### Example RLS Policies

```sql
-- Announcements: users can only read announcements from their own firm
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT USING (firm_id = get_my_firm_id());

CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (firm_id = get_my_firm_id());

-- Chat sessions: users can only see their own sessions within their firm
CREATE POLICY "chat_sessions_select" ON chat_sessions
  FOR SELECT USING (firm_id = get_my_firm_id() AND user_id = auth.uid());

CREATE POLICY "chat_sessions_insert" ON chat_sessions
  FOR INSERT WITH CHECK (firm_id = get_my_firm_id() AND user_id = auth.uid());
```

### Security Hardening

The `security_hardening.sql` migration additionally:
- **Pins `search_path = public`** on all functions to prevent schema injection attacks
- **Drops overly broad `SELECT` policies** on storage buckets (files are accessed via public URLs, not listing)
- Uses `GREATEST(count - 1, 0)` in trigger functions to prevent negative counts

> **Result:** An employee at Firm A **can never** fetch, modify, or even discover announcements, comments, likes, or chat data belonging to Firm B.

---

## AI Integration

### Option A — Auto-Summarizer (on publish)

When a user attaches a PDF to a new announcement:

1. **Client-side extraction** — `pdfTextExtractor.js` uses pdf.js (loaded from CDN) to extract text from the PDF
2. **Groq API call** — `aiSummarizer.js` sends the extracted text (up to 30,000 chars) to `llama-3.3-70b-versatile` with a structured system prompt
3. **JSON response** — The model returns `{ startup_name, funding_amount, summary }` (2-sentence summary)
4. **Saved to database** — The parsed JSON is stored in the `ai_summary` JSONB column of the announcement
5. **Rendered in UI** — `AISummaryCard.jsx` displays a collapsible "Pitch Deck Insights" card with company name, funding amount, and summary

The summarizer **never throws** — if anything fails (no API key, timeout, bad PDF), it returns `null` and the announcement publishes normally without a summary.

### Option B — Chat with Deck (interactive Q&A)

When a user clicks "Chat with this Deck" on any PDF attachment:

1. **Slide-in panel** — `ChatWithDeckPanel.jsx` opens as a slide-in panel from the right
2. **PDF extraction** — The PDF text is extracted once and cached in memory (`pdfTextRef`)
3. **Multi-turn conversation** — Each message sends the full PDF text + conversation history (sliding window of last 10 exchange pairs) to Groq
4. **DB persistence** — Conversations are persisted to `chat_sessions` + `chat_messages` tables with full RLS protection
5. **Session restore** — Re-opening the same PDF restores the conversation from the in-memory cache or database
6. **AbortController** — In-flight requests are properly cancelled when switching PDFs or unmounting

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- A **Supabase** project (free tier works)
- A **Groq** API key ([console.groq.com](https://console.groq.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jeetdarji/Portfoliomate-announcements.git
cd Portfoliomate-announcements

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Fill in your keys in .env
#    VITE_SUPABASE_URL=https://your-project.supabase.co
#    VITE_SUPABASE_ANON_KEY=your-anon-key
#    VITE_GROQ_API_KEY=your-groq-api-key

# 5. Run the Supabase migrations
#    Go to Supabase Dashboard → SQL Editor → paste and run:
#    - supabase/migrations/security_hardening.sql
#    - supabase/migrations/chat_with_deck.sql

# 6. Start the dev server
npm run dev
```

The app will open at `http://localhost:5174`.

---

## Environment Variables

Create a `.env` file in the project root (already in `.gitignore`):

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key (safe to expose — RLS is the security layer) |
| `VITE_GROQ_API_KEY` | Yes | Groq API key for AI summarization & chat features |

> **Security Note:** `VITE_GROQ_API_KEY` is currently exposed in the client bundle. For production, move AI calls to a Supabase Edge Function and store the key as an Edge Function secret.

---

## Architecture Decisions

### Why Supabase over Firebase?

- **PostgreSQL** — Relational data model with joins, foreign keys, and constraints is a natural fit for structured announcement data with nested relationships (likes, comments, profiles)
- **Row-Level Security** — RLS policies enforce multi-tenancy at the database engine level, not in application code. This is fundamentally more secure than Firestore security rules
- **SQL migrations** — Schema changes are version-controlled `.sql` files, enabling reproducible deployments
- **Realtime built-in** — Postgres Changes subscriptions provide real-time feed updates without additional infrastructure

### Why Tiptap?

- **Headless architecture** — Full control over the editor UI while Tiptap handles the content model (ProseMirror under the hood)
- **JSON output** — Content is stored as structured Tiptap JSON, enabling server-side rendering, search indexing (`content_text`), and future format conversions
- **Extensible** — Easy to add extensions (Link, Underline, Placeholder) without bloating the bundle

### Why Zustand?

- **Minimal boilerplate** — Three stores (`authStore`, `feedStore`, `chatStore`) in ~40 lines total, compared to Redux which would require actions, reducers, and middleware
- **No providers needed** — Stores are imported directly, avoiding React Context re-render issues
- **Works with TanStack Query** — Zustand handles UI state (filters, panel open/close), while TanStack Query handles server state (announcements, comments, likes). Clean separation of concerns

### Why RLS at DB Level, not App Level?

- **Defense in depth** — Even if application code has a bug that forgets a `WHERE firm_id = ...` clause, RLS will still block the query
- **Single source of truth** — Security rules live in SQL migrations, not scattered across API routes or hooks
- **Supabase client is direct** — The Supabase JS client talks directly to PostgREST. There is no backend server to add middleware filters. RLS is the *only* enforcement layer

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5174 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Deployment

This project is designed for **Vercel** deployment:

1. Push to GitHub
2. Import the repository in Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY`
4. Update Supabase Auth redirect URLs with your Vercel production URL
5. Deploy

---

## Author

**Jeet Darji** — [@jeetdarji](https://github.com/jeetdarji)

---

## License

This project is open source under the [MIT License](LICENSE).
