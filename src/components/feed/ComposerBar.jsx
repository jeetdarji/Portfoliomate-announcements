import { Image as ImageIcon, Paperclip } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function ComposerBar({ user = { name: "Navya Suvarna", avatarUrl: null }, onOpenModal }) {
  return (
    <div className="bg-white rounded-[14px] p-4 lg:p-5 w-full" style={{ boxShadow: '0px 4px 10.2px rgba(216,216,216,0.25)' }}>
      {/* Top Row */}
      <div className="flex items-center gap-3">
        <Avatar size="md" src={user.avatarUrl} name={user.name} />
        
        <div 
          role="button"
          tabIndex={0}
          aria-label="Create announcement"
          onClick={onOpenModal}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenModal?.();
            }
          }}
          className="flex-1 bg-[#F9FAFB] rounded-[8px] px-4 py-2 text-[14px] font-display font-normal text-[#90A1B9] cursor-pointer flex items-center border-none"
        >
          What's on your mind, {user.name?.split(' ')[0]}?
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#EBEAF2] mt-3" />

      {/* Bottom Row */}
      <div className="flex items-center gap-1 pt-3">
        <button className="flex items-center gap-2 cursor-pointer hover:bg-[#F8FAFC] transition-colors duration-150 bg-transparent border-none rounded-md px-1 py-1">
          <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FE] flex items-center justify-center flex-shrink-0">
            <ImageIcon size={16} className="text-[#010080]" />
          </div>
          <span className="font-display font-medium text-[14px] text-[#45556C]">
            Image
          </span>
        </button>
        <button className="flex items-center gap-2 cursor-pointer hover:bg-[#F8FAFC] transition-colors duration-150 bg-transparent border-none rounded-md px-1 py-1">
          <div className="w-8 h-8 rounded-[8px] bg-[#EEFCF5] flex items-center justify-center flex-shrink-0">
            <Paperclip size={16} className="text-[#22C55E]" />
          </div>
          <span className="font-display font-medium text-[14px] text-[#45556C]">
            Attachment
          </span>
        </button>
        
        <button 
          onClick={onOpenModal}
          className="ml-auto bg-[#F9FAFB] rounded-[10px] px-4 py-1 h-[24px] font-display font-semibold text-[12px] text-[#BBBFC6] border-none flex-shrink-0 cursor-pointer transition duration-150 hidden lg:inline-flex items-center"
        >
          Quick Post
        </button>
      </div>
    </div>
  );
}

export default ComposerBar;