import { formatDistanceToNow } from 'date-fns';
import { Pin } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { CommentInput } from './CommentInput';

function CommentItem({ comment, onReply, onTogglePin }) {
  const timeFormatted = comment.timestamp
    ? formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })
    : '';

  return (
    <div className={`group flex gap-2.5 items-start ${comment.isPinned ? 'bg-[#EEF2FE] border-l-2 border-indigo-500 pl-2 p-2 -my-2 rounded-[8px]' : ''}`}>
      <Avatar size="sm" src={comment.avatarUrl} name={comment.author} />

      <div className="flex-1 flex flex-col gap-0.5">
        <div className={`flex-1 ${comment.isPinned ? 'bg-transparent border-transparent' : 'bg-[#FAFAFA] border-[#EBEAF2]'} border rounded-[8px] px-3 py-2 flex flex-col gap-[3px]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-semibold text-sm leading-[20px] text-[#0F172B]">
                {comment.author}
              </span>
              {comment.isPinned && (
                <Pin size={12} className="text-indigo-500 fill-indigo-500 transform rotate-45" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-normal text-xs leading-[16px] text-[#62748E]">
                {timeFormatted}
              </span>
              {onTogglePin && (
                <button
                  onClick={() => onTogglePin(comment.id, comment.isPinned)}
                  className="opacity-0 group-hover:opacity-100 font-sans font-medium text-xs text-[#90A1B9] hover:text-[#0F172B] bg-transparent border-none p-0 transition-opacity cursor-pointer outline-none flex items-center"
                  title={comment.isPinned ? "Unpin comment" : "Pin comment"}
                >
                  <Pin size={14} className="mr-1" />
                </button>
              )}
            </div>
          </div>
          
          {/* Comment text */}
          <p className="font-display font-normal text-[14px] leading-[20px] text-[#314158]">
            {comment.text}
          </p>
        </div>

        <div>
          <button
            onClick={() => onReply?.(comment.id)}
            className="font-sans font-medium text-sm text-[#62748E] hover:text-[#0F172B] bg-transparent border-none p-0 mt-1 transition-colors cursor-pointer outline-none"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommentThread({
  comments = [],
  onReply,
  onSubmitComment,
  onTogglePinComment,
  currentUser = { name: '', avatarUrl: null },
}) {
  const handleSubmit = (text) => {
    if (onSubmitComment) {
      onSubmitComment(text);
    }
  };

  return (
    <div className="flex flex-col gap-0 mt-3">
      <CommentInput 
        currentUser={currentUser} 
        onSubmit={handleSubmit} 
        placeholder="Add a comment..."
      />

      {comments && comments.length > 0 && (
        <div className="flex flex-col gap-4 mt-4 mb-2 pl-12">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReply={onReply} 
              onTogglePin={onTogglePinComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentThread;