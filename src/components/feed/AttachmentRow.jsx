import { FileText, Download, MessageSquare } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

function isPdf(attachment) {
  if (attachment.type && attachment.type.includes('pdf')) return true;
  if (attachment.name && attachment.name.toLowerCase().endsWith('.pdf')) return true;
  return false;
}

export function AttachmentRow({ attachments = [], announcementId }) {
  const { openChat } = useChatStore();

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="font-sans font-semibold text-[12px] leading-[17px] text-[#0F172B] mb-2">
        Attachments
      </p>
      <div className="flex flex-col gap-1">
        {attachments.map((attachment, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-center justify-between bg-[#F8FAFC] rounded-[8px] px-3 py-3">
              
              {/* Left: icon + name/size */}
              <div className="flex items-center gap-2">
                <div className="w-[29px] h-[29px] flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-[#90A1B9]" />
                </div>
                <div className="flex flex-col gap-[1.5px]">
                  <span className="font-sans font-medium text-[10px] leading-[14px] text-[#0F172B] truncate max-w-[160px]">
                    {attachment.name}
                  </span>
                  <span className="font-sans font-normal text-[9px] leading-[12px] text-[#62748E]">
                    {attachment.size}
                  </span>
                </div>
              </div>
              
              {/* Right: download */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (attachment.url && attachment.url !== '#') {
                    window.open(attachment.url, '_blank');
                  }
                }}
                className="flex items-center justify-center text-[#90A1B9] hover:text-[#62748E] transition-colors bg-transparent border-none p-2 lg:p-1 min-h-[40px] min-w-[40px] lg:min-h-0 lg:min-w-0 cursor-pointer"
                aria-label="Download"
              >
                <Download size={14} />
              </button>
            </div>

            {/* Chat with this Deck — only for PDFs */}
            {isPdf(attachment) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openChat(announcementId, attachment);
                }}
                className="flex items-center gap-1.5 mt-1 ml-1 text-[#010080] hover:underline bg-transparent border-none cursor-pointer p-0 text-sm"
              >
                <MessageSquare size={13} />
                <span className="font-sans font-medium text-[11px] leading-[16px]">
                  Chat with this Deck
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttachmentRow;