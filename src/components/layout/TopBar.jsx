import { Search, Menu, SlidersHorizontal } from 'lucide-react';
import { useFeedStore } from '@/store/feedStore';

// Helper to get initials from full name
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const TopBar = ({ profile, onOpenDrawer, onOpenFilter }) => {
  const { searchQuery, setSearchQuery } = useFeedStore();

  return (
    <header className="sticky top-0 z-10 flex h-[65px] w-full items-center border-b border-[#EBEAF2] bg-white px-4 lg:px-6">
      <button 
        onClick={onOpenDrawer}
        className="lg:hidden p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Left: Breadcrumb */}
      <div className="flex-1 lg:flex-none text-center lg:text-left">
        <h1 className="whitespace-nowrap font-sans font-semibold text-[14px] leading-[20px] text-[#0F172B]">
          Announcements
        </h1>
      </div>

      {/* Center: Search */}
      <div className="hidden lg:flex flex-1 justify-center px-4">
        <div className="w-full max-w-[328px]">
          <div className="relative w-full text-text-tertiary focus-within:text-brand-primary">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-[#90A1B9]" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full h-[34px] bg-[#F8FAFC] rounded-[10px] border-none py-[7px] pl-9 pr-3 font-sans font-normal text-[14px] text-text-primary placeholder:font-sans placeholder:font-normal placeholder:text-[14px] placeholder:text-[#90A1B9] focus:outline-none focus:ring-2 focus:ring-[#4F39F5]/20 transition-colors duration-150 ease-out"
            />
          </div>
        </div>
      </div>

      {/* Right: User */}
      <div className="ml-auto flex items-center justify-end gap-3 flex-none lg:flex-1">
        <button
          onClick={onOpenFilter}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={20} />
        </button>
        <div className="hidden lg:flex flex-col text-right">
          <span className="font-sans font-semibold text-[14px] leading-[20px] text-[#0F172B]">
            {profile?.full_name ?? 'Loading...'}
          </span>
          <span className="font-sans font-normal text-[12px] leading-[16px] text-[#62748E]">
            {profile?.role ?? ''}
          </span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#E0E7FF]">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-brand-primary">
              {getInitials(profile?.full_name)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;