import { ThumbsUp, MessageCircle } from 'lucide-react';

export function LikeCommentBar({
  likesCount = 0,
  commentsCount = 0,
  isLiked = false,
  onToggleLike,
  onToggleComments,
  showComments = false,
}) {
  return (
    <div className="border-b border-[#EBEAF2] py-2 lg:py-3 flex items-center mt-4">
      <button
        onClick={onToggleLike}
        className={`flex flex-1 items-center justify-center gap-2 py-[2px] min-h-[40px] lg:min-h-0 font-display font-medium text-[14px] transition-colors bg-transparent border-none outline-none cursor-pointer hover:text-[#0F172B] ${
          isLiked ? 'text-[#4F39F5]' : 'text-[#45556C]'
        }`}
      >
        <ThumbsUp 
          size={16} 
          strokeWidth={1.5} 
          fill={isLiked ? 'currentColor' : 'none'} 
        />
        <span>Like ({likesCount})</span>
      </button>

      <button
        onClick={onToggleComments}
        className={`flex flex-1 items-center justify-center gap-2 py-[2px] min-h-[40px] lg:min-h-0 font-display font-medium text-[14px] transition-colors bg-transparent border-none outline-none cursor-pointer hover:text-[#0F172B] ${
          showComments ? 'text-[#0F172B]' : 'text-[#45556C]'
        }`}
      >
        <MessageCircle 
          size={16} 
          strokeWidth={1.5} 
        />
        <span>Comment ({commentsCount})</span>
      </button>
    </div>
  );
}

export default LikeCommentBar;