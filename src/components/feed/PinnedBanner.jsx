import { Pin } from 'lucide-react';

export function PinnedBanner() {
  return (
    <div 
      className="w-full bg-[#4F39F5] px-[18px] py-[4px] flex items-center gap-[7px]"
      aria-label="Pinned announcements section"
    >
      <Pin 
        size={10}
        className="text-white flex-shrink-0"
        fill="white"
        strokeWidth={0}
      />
      <span 
        className="font-display font-semibold text-[8px] leading-[8px] uppercase tracking-widest text-white"
      >
        PINNED ANNOUNCEMENTS
      </span>
    </div>
  );
}

export default PinnedBanner;