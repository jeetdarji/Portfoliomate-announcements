import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ANNOUNCEMENTS_KEY } from './useAnnouncements'
import { toast } from 'sonner'
import { sanitizeSupabaseError } from '@/lib/utils'

export const commentsKey = (announcementId) =>
  ['comments', announcementId]

const fetchComments = async (announcementId) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('announcement_id', announcementId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export function useComments(announcementId) {
  const queryClient = useQueryClient()
  const { profile } = useAuthStore()

  // ── READ: Fetch comments for this announcement ───────────────────
  const query = useQuery({
    queryKey: commentsKey(announcementId),
    queryFn: () => fetchComments(announcementId),
    enabled: !!announcementId && !!profile,
    staleTime: 1000 * 30,
  })

  // ── REALTIME: Subscribe to new comments on this announcement ─────
  useEffect(() => {
    if (!announcementId || !profile) return

    const channelName = `comments-${announcementId}-${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelName)
    
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `announcement_id=eq.${announcementId}`,
      },
      () => {
        queryClient.invalidateQueries({
          queryKey: commentsKey(announcementId)
        })
        queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
      }
    ).subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [announcementId, profile, queryClient])

  // ── WRITE: Add a comment ─────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async ({ content, parentId = null }) => {
      if (!profile) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('comments')
        .insert({
          firm_id:         profile.firm_id,
          announcement_id: announcementId,
          author_id:       profile.id,
          content,
          parent_id:       parentId,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentsKey(announcementId)
      })
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
    },
    onError: (err) => {
      toast.error(sanitizeSupabaseError(err) || 'Failed to add comment')
    },
  })

  // ── WRITE: Toggle pin a comment ──────────────────────────────────
  const togglePinMutation = useMutation({
    mutationFn: async ({ commentId, isPinned }) => {
      if (!profile) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('comments')
        .update({ is_pinned: isPinned })
        .eq('id', commentId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(announcementId) })
    },
    onError: (err) => {
      toast.error(sanitizeSupabaseError(err) || 'Failed to pin comment')
    },
  })

  return {
    comments:   query.data ?? [],
    isLoading:  query.isLoading,
    addComment: (content, parentId) =>
      addMutation.mutateAsync({ content, parentId }),
    isAdding:   addMutation.isPending,
    togglePinComment: (commentId, isPinned) => 
      togglePinMutation.mutateAsync({ commentId, isPinned }),
  }
}