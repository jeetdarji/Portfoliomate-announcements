import { create } from 'zustand'

export const useFeedStore = create((set) => ({
  activeTopic: 'ALL',
  showPinnedOnly: false,
  sortOrder: 'newest',
  authorFilter: 'everyone',
  searchQuery: '',
  setActiveTopic: (topic) => set({ activeTopic: topic }),
  setShowPinnedOnly: (val) => set({ showPinnedOnly: val }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setAuthorFilter: (author) => set({ authorFilter: author }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
