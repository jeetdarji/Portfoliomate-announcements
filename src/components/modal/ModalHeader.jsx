import { Megaphone, X } from 'lucide-react';

export function ModalHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-6 pr-10 py-6"
      style={{ borderBottom: '0.991071px solid #E2E8F0' }}>
      {/* Left group */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-[12px] bg-[#E0E7FF] flex items-center justify-center flex-shrink-0">
          <Megaphone size={24} style={{ color: '#4F39F6' }} />
        </div>
        <div className="flex flex-col gap-0.5 pt-1">
          <h2
            id="modal-title"
            className="font-display font-bold text-[24px] leading-[31px] tracking-[0.0696847px] text-[#171727]"
          >
            New Announcement
          </h2>
          <p className="font-display font-normal text-[14px] leading-[18px] tracking-[-0.149048px] text-[#696975]">
            Broadcast an update to your organization
          </p>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="bg-transparent border-none p-1 cursor-pointer text-[#90A1B9] hover:text-[#62748E] transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
}

export default ModalHeader;