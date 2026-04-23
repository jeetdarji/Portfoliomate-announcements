import { Pin, Search, ChevronDown, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFeedStore } from '@/store/feedStore';
import { useAnnouncements } from '@/hooks/useAnnouncements';

export const RightPanel = ({ onClose }) => {
  const { announcements } = useAnnouncements();
  const {
    activeTopic, setActiveTopic,
    showPinnedOnly, setShowPinnedOnly,
    sortOrder, setSortOrder,
    authorFilter, setAuthorFilter,
    searchQuery, setSearchQuery
  } = useFeedStore();

  // Derive topics dynamically from announcements
  const allTopics = ['ALL', ...new Set(
    announcements.flatMap(a => a.tags || [])
  )];

  // Get unique authors for the dropdown
  const authors = ['everyone', ...new Set(
    announcements.map(a => a.author?.full_name).filter(Boolean)
  )];

  return (
    <aside className="lg:sticky lg:top-[65px] flex h-full lg:h-fit w-full lg:w-[280px] shrink-0 lg:py-6 bg-white overflow-y-auto lg:overflow-visible lg:bg-transparent">
      <div 
        className="w-full lg:rounded-[14px] bg-white p-6 flex flex-col gap-6 relative"
        style={{ 
          boxShadow: typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? '0px 0px 10px rgba(216,216,216,0.25)' 
            : 'none' 
        }}
      >
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden p-2 text-gray-500 hover:text-[#4F39F5] focus:outline-none"
          aria-label="Close filters"
        >
          <X size={20} />
        </button>

        {/* Section 1: Search */}
        <div className="relative w-full text-[#90A1B9] focus-within:text-[#4F39F5] lg:mt-0 mt-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search right panel"
            className="block w-full h-[34px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] py-2 pl-9 pr-3 text-sm text-[#0F172B] placeholder:text-[#90A1B9] focus:outline-none focus:ring-2 focus:ring-[#4F39F5]/30 transition-shadow duration-150 ease-out"
          />
        </div>

        {/* Section 2: Filter by Author */}
        <div className="flex flex-col gap-2 relative">
          <label className="font-display font-semibold text-[12px] uppercase text-[#62748E]">
            FILTER BY AUTHOR
          </label>
          <div className="relative">
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full appearance-none rounded-[10px] border border-[#E2E8F0] bg-white px-3 h-[40px] cursor-pointer hover:border-[#4F39F5] transition-colors duration-150 font-display font-semibold text-[12px] tracking-[0.3px] text-[#171727] focus:outline-none focus:ring-2 focus:ring-[#4F39F5]/30 pr-8"
            >
              {authors.map(author => (
                <option key={author} value={author}>
                  {author === 'everyone' ? 'Everyone' : author}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <ChevronDown size={16} className="text-[#90A1B9]" />
            </div>
          </div>
        </div>

        {/* Section 3: Sort Order */}
        <div className="flex flex-col gap-2 relative">
          <label className="font-display font-semibold text-[12px] uppercase text-[#62748E]">
            SORT ORDER
          </label>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full appearance-none rounded-[10px] border border-[#E2E8F0] bg-white px-3 h-[40px] cursor-pointer hover:border-[#4F39F5] transition-colors duration-150 font-display font-semibold text-[12px] tracking-[0.3px] text-[#171727] focus:outline-none focus:ring-2 focus:ring-[#4F39F5]/30 pr-8"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <ChevronDown size={16} className="text-[#90A1B9]" />
            </div>
          </div>
        </div>

        {/* Section 4: Show Pinned Only */}
        <div className="flex items-center justify-between rounded-[10px] border border-[#E2E8F0] bg-white px-3 h-[43px]">
          <div className="flex items-center gap-2">
            <Pin size={16} className="text-[#696975]" />
            <span className="font-display font-semibold text-[12px] tracking-[0.3px] text-[#171727]">
              Show Pinned Only
            </span>
          </div>
          <button
            role="switch"
            aria-checked={showPinnedOnly}
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className="relative flex-shrink-0 border-none bg-transparent p-0 cursor-pointer"
            style={{
              width: '35px',
              height: '19px',
              borderRadius: '9999px',
              background: showPinnedOnly ? '#4F39F5' : '#E2E8F0',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              paddingRight: '18px',
            }}
          >
            <div style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: '#FFFFFF',
              transform: showPinnedOnly ? 'translateX(16px)' : 'translateX(0)',
              transition: 'transform 0.2s',
              flexShrink: 0,
            }} />
          </button>
        </div>

        <div className="w-full h-px bg-[#EBEAF2]" />

        {/* Section 5: Topics */}
        <div className="flex flex-col gap-2">
          <label className="font-display font-semibold text-[12px] uppercase text-[#62748E]">
            TOPICS
          </label>
          <div className="flex flex-wrap gap-2">
            {allTopics.map((topic) => {
              const isActive = activeTopic === topic;
              
              let classes = isActive
                ? 'bg-[#0F172B] text-white'
                : 'bg-[#F1F5F9] text-[#314158] hover:bg-[#E2E8F0]';

              return (
                <button
                  key={topic}
                  onClick={() => setActiveTopic(topic)}
                  className={`rounded-[8px] px-3 py-[5px] font-display font-semibold text-[12px] h-[26px] cursor-pointer border-none transition-colors duration-150 ${classes}`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;