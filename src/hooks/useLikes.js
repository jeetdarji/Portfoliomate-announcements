import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ANNOUNCEMENTS_KEY } from './useAnnouncements'
import { toast } from 'sonner'
import { sanitizeSupabaseError } from '@/lib/utils'

export const LIKES_KEY = ['likes', 'user']

// Fetch all announcement IDs that the current user has liked
const fetchUserLikes = async (userId) => {
  const { data, error } = await supabase
    .from('likes')
    .select('announcement_id')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  // Return a Set for O(1) lookup
  return new Set(data.map(l => l.announcement_id))
}

export function useLikes() {
  const queryClient = useQueryClient()
  const { profile } = useAuthStore()

  // ── READ: Which announcements has this user liked? ───────────────
  const { data: likedSet = new Set() } = useQuery({
    queryKey: LIKES_KEY,
    queryFn: () => fetchUserLikes(profile.id),
    enabled: !!profile,
    staleTime: 1000 * 60 * 5,
  })

  // ── WRITE: Toggle like ───────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: async ({ announcementId, currentlyLiked }) => {
      if (!profile) throw new Error('Not authenticated')

      if (currentlyLiked) {
        // Unlike: delete the row
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('announcement_id', announcementId)
          .eq('user_id', profile.id)

        if (error) throw new Error(error.message)
      } else {
        // Like: insert a row
        const { error } = await supabase
          .from('likes')
          .insert({
            firm_id:         profile.firm_id,
            announcement_id: announcementId,
            user_id:         profile.id,
          })

        if (error) throw new Error(error.message)
      }
    },

    // ── OPTIMISTIC UPDATE ─────────────────────────────────────────
    onMutate: async ({ announcementId, currentlyLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: LIKES_KEY })
      await queryClient.cancelQueries({ queryKey: ANNOUNCEMENTS_KEY })

      // Snapshot current state for rollback
      const previousLikes = queryClient.getQueryData(LIKES_KEY)
      const previousAnnouncements = queryClient.getQueryData(ANNOUNCEMENTS_KEY)

      // Optimistically update liked set
      queryClient.setQueryData(LIKES_KEY, (old = new Set()) => {
        const next = new Set(old)
        if (currentlyLiked) {
          next.delete(announcementId)
        } else {
          next.add(announcementId)
        }
        return next
      })

      // Optimistically update likes_count in announcements list
      queryClient.setQueryData(ANNOUNCEMENTS_KEY, (old = []) =>
        old.map(a => {
          if (a.id !== announcementId) return a
          return {
            ...a,
            likes_count: currentlyLiked
              ? Math.max(a.likes_count - 1, 0)
              : a.likes_count + 1,
          }
        })
      )

      return { previousLikes, previousAnnouncements }
    },

    onError: (err, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousLikes) {
        queryClient.setQueryData(LIKES_KEY, context.previousLikes)
      }
      if (context?.previousAnnouncements) {
        queryClient.setQueryData(
          ANNOUNCEMENTS_KEY, context.previousAnnouncements
        )
      }
      toast.error(sanitizeSupabaseError(err) || 'Failed to update like')
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      queryClient.invalidateQueries({ queryKey: LIKES_KEY })
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
    },
  })

  const toggleLike = (announcementId) => {
    const currentlyLiked = likedSet.has(announcementId)
    toggleMutation.mutate({ announcementId, currentlyLiked })
  }

  return {
    likedSet,
    toggleLike,
    isToggling: toggleMutation.isPending,
  }
}