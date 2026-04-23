import { useState } from 'react'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useLikes } from '@/hooks/useLikes'
import { useComments } from '@/hooks/useComments'
import { useAuthStore } from '@/store/authStore'
import { useFeedStore } from '@/store/feedStore'
import { ComposerBar } from '@/components/feed/ComposerBar'
import { PinnedBanner } from '@/components/feed/PinnedBanner'
import { AnnouncementCard } from '@/components/feed/AnnouncementCard'
import { CreateAnnouncementModal } from '@/components/modal/CreateAnnouncementModal'
import { ChatWithDeckPanel } from '@/components/chat/ChatWithDeckPanel'
import { Spinner } from '@/components/ui/Spinner'

export function AnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { profile } = useAuthStore()
  const { announcements, isLoading, isError, togglePinAnnouncement } = useAnnouncements()
  const { likedSet, toggleLike } = useLikes()
  const { activeTopic, showPinnedOnly, authorFilter, sortOrder, searchQuery } = useFeedStore()

  // Apply filters from feedStore
  let filtered = announcements

  if (activeTopic !== 'ALL') {
    filtered = filtered.filter(a => a.tags?.includes(activeTopic))
  }
  if (showPinnedOnly) {
    filtered = filtered.filter(a => a.is_pinned)
  }
  if (authorFilter && authorFilter !== 'everyone') {
    filtered = filtered.filter(a => a.author?.full_name === authorFilter)
  }
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(a => 
      a.title?.toLowerCase().includes(q) || 
      a.content_text?.toLowerCase().includes(q) ||
      a.author?.full_name?.toLowerCase().includes(q)
    )
  }

  // Sort: pinned first, then by date descending/ascending
  filtered = [...filtered].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    const dateA = new Date(a.created_at || 0).getTime()
    const dateB = new Date(b.created_at || 0).getTime()
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
  })

  // Current user object passed to cards for avatar/name display
  const currentUser = {
    id:        profile?.id,
    name:      profile?.full_name ?? 'You',
    avatarUrl: profile?.avatar_url ?? null,
  }

  return (
    <div className="flex flex-col gap-3 lg:gap-4 w-full">

      {/* Page heading */}
      <header className="mb-1 lg:mb-2 mt-2 lg:mt-0">
        <h1 className="font-display font-extrabold text-[24px] lg:text-[36px] leading-[30px] lg:leading-[36px] text-[#171727]">
          Announcements
        </h1>
        <p className="font-sans font-normal text-[14px] leading-[20px] text-[#696975] mt-1 lg:mt-2">
          Get the latest news, updates, and events from exactly who matters.
        </p>
      </header>

      {/* Composer bar */}
      <ComposerBar
        user={currentUser}
        onOpenModal={() => setIsModalOpen(true)}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" color="indigo" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-[14px] bg-red-50 border border-red-100 p-4 lg:p-6 text-center">
          <p className="font-sans text-[14px] text-red-600">
            Failed to load announcements. Please refresh the page.
          </p>
        </div>
      )}

      {/* Feed */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3 lg:gap-4">

          {/* Render announcements */}
          {filtered.length > 0 && (
            <>
              {filtered.map((announcement, index) => {
                // If it's the very first pinned announcement, also render PinnedBanner above it
                const isFirstPinned = announcement.is_pinned && index === 0;
                
                return (
                  <div key={announcement.id}>
                    <AnnouncementCardWrapper
                      announcement={announcement}
                      currentUser={currentUser}
                      likedSet={likedSet}
                      toggleLike={toggleLike}
                      togglePinAnnouncement={togglePinAnnouncement}
                      isFirstPinned={isFirstPinned}
                    />
                  </div>
                );
              })}
            </>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="rounded-[14px] bg-white border border-[#E2E8F0] p-12 text-center"
              style={{
                boxShadow: '0px 0px 10px rgba(216,216,216,0.25)'
              }}>
              <p className="font-display font-semibold text-[16px] text-[#171727] mb-1">
                No announcements yet
              </p>
              <p className="font-sans text-[14px] text-[#696975]">
                Be the first to post an update to your organization.
              </p>
            </div>
          )}

        </div>
      )}

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Chat with Deck Panel — rendered at page level to avoid z-index issues */}
      <ChatWithDeckPanel />

    </div>
  )
}

// ── Card Wrapper ────────────────────────────────────────────────────
// Bridges the raw Supabase row shape to the AnnouncementCard prop shape
// and wires comments via useComments per card

function AnnouncementCardWrapper({
  announcement, currentUser, likedSet, toggleLike, togglePinAnnouncement, isFirstPinned
}) {
  const { comments, addComment, togglePinComment } = useComments(announcement.id)
  const isLiked = likedSet.has(announcement.id)

  const handleTogglePinComment = (commentId, currentPinState) => {
    if (togglePinComment) {
      togglePinComment(commentId, !currentPinState);
    }
  }

  const handleTogglePinPost = (newPinState) => {
    if (togglePinAnnouncement) {
      togglePinAnnouncement({ announcementId: announcement.id, isPinned: newPinState })
    }
  }

  // Map Supabase row → AnnouncementCard props
  return (
    <AnnouncementCard
      id={announcement.id}
      author={{
        name:      announcement.author?.full_name ?? 'Unknown',
        role:      announcement.author?.role ?? 'Employee',
        avatarUrl: announcement.author?.avatar_url ?? null,
      }}
      timestamp={announcement.created_at}
      topicTag={
        announcement.tags?.length > 0
          ? { label: announcement.tags[0], variant: 'indigo' }
          : null
      }
      title={announcement.title}

      // content is stored as Tiptap JSON — render as plain text for now
      bodyText={announcement.content_text ?? ''}

      isPinned={announcement.is_pinned}
      isFirstPinned={isFirstPinned}
      images={announcement.image_urls ?? []}
      attachments={announcement.attachments ?? []}
      aiSummary={announcement.ai_summary ?? null}
      likesCount={announcement.likes_count}
      commentsCount={announcement.comments_count}
      isLiked={isLiked}
      comments={comments.map(c => ({
        id:        c.id,
        author:    c.author?.full_name ?? 'Unknown',
        avatarUrl: c.author?.avatar_url ?? null,
        text:      c.content,
        timestamp: c.created_at,
        parentId:  c.parent_id,
        isPinned:  c.is_pinned,
      }))}
      currentUser={currentUser}
      onToggleLike={() => toggleLike(announcement.id)}
      onSubmitComment={(text) => addComment(text)}
      onTogglePinComment={handleTogglePinComment}
      onTogglePinPost={handleTogglePinPost}
    />
  )
}

export default AnnouncementsPage