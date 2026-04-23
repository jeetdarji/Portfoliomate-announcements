import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { extractPDFSummary } from '@/lib/aiSummarizer'
import { sanitizeSupabaseError } from '@/lib/utils'

// ── QUERY KEY ──────────────────────────────────────────────────────
export const ANNOUNCEMENTS_KEY = ['announcements']

// ── FETCH ALL ANNOUNCEMENTS ────────────────────────────────────────
// Fetches announcements for the current user's firm, ordered by:
//   pinned first, then by created_at descending
// Joins the author's profile for name, avatar_url, role
const fetchAnnouncements = async (firmId) => {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      author:profiles!announcements_author_id_fkey (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('firm_id', firmId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// ── UPLOAD FILE TO STORAGE ─────────────────────────────────────────
// bucket: 'announcement-images' or 'announcement-files'
// Returns the public URL of the uploaded file
export const uploadFile = async (file, bucket, firmId, userId) => {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${firmId}/${userId}/${timestamp}_${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

// ── MAIN HOOK ──────────────────────────────────────────────────────
export function useAnnouncements() {
  const queryClient = useQueryClient()
  const { profile } = useAuthStore()

  // ── READ: Fetch announcements ────────────────────────────────────
  const query = useQuery({
    queryKey: ANNOUNCEMENTS_KEY,
    queryFn: () => fetchAnnouncements(profile.firm_id),
    enabled: !!profile?.firm_id,  // Only fetch when profile is loaded
    staleTime: 1000 * 60 * 2,
  })

  // ── REALTIME: Subscribe to new/updated/deleted announcements ─────
  useEffect(() => {
    if (!profile) return

    const channelName = `announcements-feed-${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelName)
    
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'announcements',
      },
      () => {
        // Refetch the full list when anything changes
        // (handles INSERT, UPDATE, DELETE)
        queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
      }
    ).subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile, queryClient])

  // ── WRITE: Create announcement ───────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      if (!profile) throw new Error('Not authenticated')
      const setPublishStage = payload.setPublishStage || (() => {})

      // 1. Upload all images to Storage
      setPublishStage('uploading')
      const imageUrls = await Promise.all(
        (payload.imageFiles || []).map(file =>
          uploadFile(file, 'announcement-images', profile.firm_id, profile.id)
        )
      )

      // 2. Upload all attachment files to Storage
      const attachments = await Promise.all(
        (payload.attachmentFiles || []).map(async (file) => {
          const url = await uploadFile(
            file, 'announcement-files', profile.firm_id, profile.id
          )
          return {
            name: file.name,
            size: formatFileSize(file.size),
            url,
            type: file.type,
          }
        })
      )

      // 3. AI PDF Summary — find first PDF and extract summary
      let ai_summary = null
      const pdfFile = (payload.attachmentFiles || []).find(
        (f) => f.type === 'application/pdf'
      )
      if (pdfFile) {
        setPublishStage('analyzing')
        ai_summary = await extractPDFSummary(pdfFile)
      }

      // 4. Insert announcement row into Supabase
      setPublishStage('done')
      const insertPayload = {
        firm_id:      profile.firm_id,
        author_id:    profile.id,
        title:        payload.title,
        content:      payload.content || '',
        content_text: payload.content_text || '',
        tags:         payload.tags || [],
        is_pinned:    payload.is_pinned || false,
        image_urls:   imageUrls,
        attachments:  attachments,
        ai_summary:   ai_summary,
      }
      const { data, error } = await supabase
        .from('announcements')
        .insert(insertPayload)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
      toast.success('Announcement published!')
    },
    onError: (err) => {
      toast.error(sanitizeSupabaseError(err) || 'Failed to publish announcement')
    },
  })

  // ── WRITE: Toggle pin announcement ───────────────────────────────
  const togglePinMutation = useMutation({
    mutationFn: async ({ announcementId, isPinned }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update({ is_pinned: isPinned })
        .eq('id', announcementId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
    },
    onError: (err) => {
      toast.error(sanitizeSupabaseError(err) || 'Failed to pin announcement')
    },
  })

  return {
    announcements: query.data ?? [],
    isLoading:     query.isLoading,
    isError:       query.isError,
    error:         query.error,
    createAnnouncement: createMutation.mutateAsync,
    isCreating:    createMutation.isPending,
    togglePinAnnouncement: togglePinMutation.mutateAsync,
  }
}

// ── HELPER: Format bytes to readable size ─────────────────────────
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}