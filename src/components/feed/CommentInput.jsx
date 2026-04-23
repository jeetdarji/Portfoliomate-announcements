import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function CommentInput({
  currentUser = { name: '', avatarUrl: null },
  onSubmit,
  placeholder = "Add a comment...",
}) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit?.(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasValue = value.trim().length > 0;

  return (
    <div className="flex items-center gap-2.5 mt-3">
      <Avatar size="sm" src={currentUser.avatarUrl} name={currentUser.name} />

      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Comment input"
          className="w-full rounded-[12px] border border-[#E2E8F0] px-3 py-2 font-display font-normal text-[10px] text-[#0F172B] placeholder:text-[#90A1B9] focus:outline-none focus:ring-2 focus:ring-[#4F39F5]/20 focus:border-[#4F39F5] transition-all duration-150 bg-white"
        />

        <button
          onClick={handleSubmit}
          disabled={!hasValue}
          aria-label="Send comment"
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F0F0F0] rounded-[8px] flex items-center justify-center flex-shrink-0 border-none transition-colors ${
            hasValue ? 'opacity-100 cursor-pointer pointer-events-auto hover:bg-[#E2E8F0]' : 'opacity-50 cursor-default pointer-events-none'
          }`}
        >
          <SendHorizonal size={12} className="text-[#696975]" />
        </button>
      </div>
    </div>
  );
}

export default CommentInput;