import { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, Paperclip } from 'lucide-react';
import { FilePreviewList } from './FilePreviewList';

export function TitleInput({ title: controlledTitle, onTitleChange, onImagesChange, onFilesChange }) {
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const [title, setTitle] = useState(controlledTitle || '');
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);

  // Sync controlled title prop
  useEffect(() => {
    if (controlledTitle !== undefined && controlledTitle !== title) {
      setTitle(controlledTitle);
    }
  }, [controlledTitle]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    onTitleChange?.(val);
  };

  const handleImageSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const updated = [...images, ...selected];
    setImages(updated);
    onImagesChange?.(updated);
    e.target.value = '';
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const updated = [...files, ...selected];
    setFiles(updated);
    onFilesChange?.(updated);
    e.target.value = '';
  };

  const handleRemoveImage = (i) => {
    const updated = images.filter((_, idx) => idx !== i);
    setImages(updated);
    onImagesChange?.(updated);
  };

  const handleRemoveFile = (i) => {
    const updated = files.filter((_, idx) => idx !== i);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="font-display font-semibold text-[12px] leading-[16px] uppercase text-[#BBBFC6]">
        ANNOUNCEMENT TITLE
      </span>

      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Enter a compelling title..."
        className="w-full bg-transparent border-none outline-none font-display font-bold text-[24px] leading-[33px] text-[#171727] placeholder:text-[#E2E8F0] placeholder:font-bold py-3"
        autoFocus
      />

      <FilePreviewList
        images={images}
        files={files}
        onRemoveImage={handleRemoveImage}
        onRemoveFile={handleRemoveFile}
      />

      <div className="flex justify-end gap-[10px]">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-[10px] px-4 py-2 rounded-[10px] bg-transparent border-none cursor-pointer hover:bg-[#EEF2FE] transition-colors"
        >
          <ImageIcon size={18} style={{ color: '#010080' }} />
          <span className="font-display font-medium text-[14px] leading-[18px] tracking-[-0.149048px] text-[#010080]">
            Add Images
          </span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-[10px] px-4 py-2 rounded-[10px] bg-transparent border-none cursor-pointer hover:bg-[#EEF2FE] transition-colors"
        >
          <Paperclip size={18} style={{ color: '#010080' }} />
          <span className="font-display font-medium text-[14px] leading-[18px] tracking-[-0.149048px] text-[#010080]">
            Attach Files
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default TitleInput;