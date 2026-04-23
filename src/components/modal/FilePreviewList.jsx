import { X, FileText } from 'lucide-react';

export function FilePreviewList({ images = [], files = [], onRemoveImage, onRemoveFile }) {
  if (images.length === 0 && files.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((file, index) => (
            <div key={index} className="relative w-16 h-16 rounded-[8px] overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-1 right-1 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center cursor-pointer border-none p-0 hover:bg-white transition-colors"
              >
                <X size={10} className="text-[#555C69]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File attachments */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-[#F8FAFC] rounded-[8px] px-3 py-2">
              <FileText size={14} className="text-[#90A1B9] flex-shrink-0" />
              <span className="font-sans text-[12px] text-[#0F172B] flex-1 truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="bg-transparent border-none p-0 cursor-pointer"
              >
                <X size={12} className="text-[#90A1B9] hover:text-[#62748E]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilePreviewList;