import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function TagInput({ onTagsChange }) {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Notify parent whenever tags change
  useEffect(() => {
    onTagsChange?.(tags);
  }, [tags]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags(prev => [...prev, trimmed]);
        setInputValue('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="font-display font-semibold text-[12px] leading-[16px] uppercase text-[#BBBFC6]">
        CLASSIFICATION TAGS
      </span>

      <div className="flex flex-wrap items-center gap-1.5 bg-[#F8FAFB] border border-[#EBEAF2] rounded-[12px] px-4 py-3.5 min-h-[48px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[#EEF2FE] text-[#010080] rounded-full px-2 py-0.5 font-display font-medium text-[11px]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="bg-transparent border-none p-0 cursor-pointer text-[#010080] opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Add tags and press enter' : ''}
          className="bg-transparent border-none outline-none flex-1 min-w-[120px] font-display font-bold text-[12px] text-[#171727] placeholder:text-[#BBBFC6] placeholder:font-bold"
        />
      </div>
    </div>
  );
}

export default TagInput;