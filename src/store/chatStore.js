import { create } from 'zustand'

// Global state for the Chat with Deck slide-in panel.
// Any AnnouncementCard can trigger it; the panel renders once at the app/page level.
export const useChatStore = create((set) => ({
  isOpen: false,
  attachment: null,       // { name, url, size, type }
  announcementId: null,   // UUID of the announcement

  openChat: (announcementId, attachment) =>
    set({ isOpen: true, announcementId, attachment }),

  closeChat: () =>
    set({ isOpen: false }),

  // Full reset (clears attachment info too)
  resetChat: () =>
    set({ isOpen: false, attachment: null, announcementId: null }),
}))
