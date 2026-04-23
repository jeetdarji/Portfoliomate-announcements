import { useState, useEffect } from 'react';
import { Pin } from 'lucide-react';

export function PinToggle({ onPinChange }) {
  const [isPinned, setIsPinned] = useState(false);

  // Notify parent whenever pin state changes
  useEffect(() => {
    onPinChange?.(isPinned);
  }, [isPinned]);

  return (
    <div className="flex flex-col gap-3">
      <span className="font-display font-semibold text-[12px] leading-[16px] uppercase text-[#BBBFC6]">
        CLASSIFICATION TAGS
      </span>

      <div className="flex items-center gap-[10px] bg-[#F8FAFB] border border-[#E2E8F0] rounded-[10px] p-4 min-h-[71px]">
        {/* Pin icon box */}
        <div
          className="w-10 h-[39px] bg-white rounded-[8px] flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '0px 0px 4px rgba(196,196,196,0.25)' }}
        >
          <Pin size={18} className="text-[#BBBFC6]" />
        </div>

        {/* Text column */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="font-display font-semibold text-[14px] leading-[18px] tracking-[0.3px] text-[#171727]">
            Pin Announcement
          </span>
          <span className="font-display font-semibold text-[10px] leading-[14px] tracking-[0.3px] text-[#696975]">
            Keep at the top of organization feed
          </span>
        </div>

        {/* Toggle switch */}
        <div
          onClick={() => setIsPinned(!isPinned)}
          role="switch"
          aria-checked={isPinned}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsPinned(!isPinned);
            }
          }}
          style={{
            width: '42px',
            height: '26px',
            borderRadius: '9999px',
            background: isPinned ? '#4F39F5' : '#CBD4E0',
            padding: '4px',
            paddingRight: '20px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0px 0px 4px rgba(167,167,167,0.25)',
              transform: isPinned ? 'translateX(16px)' : 'translateX(0)',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PinToggle;