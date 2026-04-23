-- ══════════════════════════════════════════════════════════════════════
-- Security Hardening Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ══════════════════════════════════════════════════════════════════════

-- ── SECTION 1: Pin search_path on four functions ─────────────────────
-- A mutable search_path is a schema injection vector. Pinning it to
-- 'public' ensures these functions always resolve objects from the
-- correct schema, regardless of the caller's session search_path.

-- 1a. get_my_firm_id
CREATE OR REPLACE FUNCTION public.get_my_firm_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT firm_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 1b. update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1c. update_likes_count
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.announcements
    SET likes_count = likes_count + 1
    WHERE id = NEW.announcement_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.announcements
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.announcement_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 1d. update_comments_count
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.announcements
    SET comments_count = comments_count + 1
    WHERE id = NEW.announcement_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.announcements
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.announcement_id;
  END IF;
  RETURN NULL;
END;
$$;


-- ── SECTION 2: Drop broad SELECT policies on storage buckets ─────────
-- Public buckets serve files at their public URL without any policy
-- check. The SELECT policy on storage.objects only controls who can
-- LIST (enumerate) objects — which is overly permissive when it allows
-- any authenticated user to list ALL files across all firms.
--
-- The frontend only accesses files by direct public URL (confirmed by
-- code audit: no supabase.storage.from(...).list() calls exist).
-- Therefore Part A (drop) alone is sufficient — no replacement policy
-- is needed.

DROP POLICY IF EXISTS "images_select" ON storage.objects;
DROP POLICY IF EXISTS "files_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;


-- ── SECTION 1 (supplement): Add TODO to handle_new_user trigger ──────
-- The handle_new_user trigger assigns new OAuth users to the first firm
-- in the firms table (LIMIT 1). This is a known limitation that is only
-- correct for single-firm deployments. In production multi-tenant mode,
-- this must be replaced with invite-based firm assignment.
--
-- TODO: Replace LIMIT 1 firm assignment with invite-based or
--       domain-restricted firm lookup for multi-tenant deployments.
