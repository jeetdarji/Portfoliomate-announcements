-- ══════════════════════════════════════════════════════════════════════
-- Chat with Deck — Database Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ══════════════════════════════════════════════════════════════════════

-- ── 1. chat_sessions table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id         UUID NOT NULL REFERENCES firms(id),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attachment_url  TEXT NOT NULL,
  attachment_name TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  -- One session per user per PDF per announcement
  UNIQUE(announcement_id, user_id, attachment_url)
);

-- ── 2. chat_messages table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  firm_id     UUID NOT NULL REFERENCES firms(id),
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient conversation loading (ordered by time)
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_time
  ON chat_messages (session_id, created_at ASC);

-- ── 3. updated_at trigger on chat_sessions ──────────────────────────
-- Reuses the existing update_updated_at() trigger function
CREATE TRIGGER set_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── 4. Enable RLS ───────────────────────────────────────────────────
ALTER TABLE chat_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages  ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS Policies — chat_sessions ─────────────────────────────────
-- Users can only see/manage their own sessions within their firm
CREATE POLICY "chat_sessions_select" ON chat_sessions
  FOR SELECT USING (firm_id = get_my_firm_id() AND user_id = auth.uid());

CREATE POLICY "chat_sessions_insert" ON chat_sessions
  FOR INSERT WITH CHECK (firm_id = get_my_firm_id() AND user_id = auth.uid());

CREATE POLICY "chat_sessions_update" ON chat_sessions
  FOR UPDATE USING (firm_id = get_my_firm_id() AND user_id = auth.uid());

CREATE POLICY "chat_sessions_delete" ON chat_sessions
  FOR DELETE USING (firm_id = get_my_firm_id() AND user_id = auth.uid());

-- ── 6. RLS Policies — chat_messages ─────────────────────────────────
-- Firm-level read (session ownership enforced by join to chat_sessions)
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (firm_id = get_my_firm_id());

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "chat_messages_delete" ON chat_messages
  FOR DELETE USING (firm_id = get_my_firm_id());

-- No UPDATE policy — chat messages are immutable

-- ── 7. Realtime publication ─────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions, chat_messages;
