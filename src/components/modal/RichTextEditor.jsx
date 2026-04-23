import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  ListOrdered,
  List,
  Link2,
  Eraser,
  ChevronDown,
} from 'lucide-react';

function ToolbarButton({ onClick, isActive, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        'p-1 rounded bg-transparent border-none cursor-pointer transition-colors hover:bg-[#F1F5F9] ' +
        (isActive ? 'text-[#4F39F5]' : 'text-[#555C69]')
      }
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ onContentChange }) {
  const [headingOpen, setHeadingOpen] = useState(false);
  const dropdownRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'What would you like to share?',
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'outline-none min-h-[200px] p-4 font-display font-normal text-[14px] leading-[20px] text-[#171727]',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      onContentChange?.(json, text);
    },
  });

  // Close heading dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setHeadingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!editor) return null;

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    return 'Normal';
  };

  const headingOptions = [
    { label: 'Normal', action: () => editor.chain().focus().setParagraph().run() },
    { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  ];

  const handleLinkClick = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="font-display font-semibold text-[12px] leading-[16px] uppercase text-[#BBBFC6]">
        MESSAGE CONTENT
      </span>

      <div className="border border-[#EBEAF2] rounded-[14px] overflow-hidden">
        {/* Toolbar */}
        <div className="bg-[#FAFBFC] border-b border-[#EBEAF2] px-3 min-h-[52px] flex items-center gap-[13px]">
          {/* Heading dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setHeadingOpen(!headingOpen)}
              className="flex items-center justify-between w-[104px] h-[26px] px-1 bg-transparent border-none cursor-pointer font-display font-medium text-[14px] text-[#464646]"
            >
              <span>{getCurrentHeading()}</span>
              <ChevronDown size={12} />
            </button>

            {headingOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#EBEAF2] rounded-[8px] z-10 shadow-sm min-w-[104px] py-1">
                {headingOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      opt.action();
                      setHeadingOpen(false);
                    }}
                    className={
                      'w-full text-left px-3 py-1.5 font-display text-[13px] cursor-pointer bg-transparent border-none hover:bg-[#F1F5F9] transition-colors ' +
                      (getCurrentHeading() === opt.label ? 'text-[#4F39F5] font-semibold' : 'text-[#464646]')
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formatting buttons */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            ariaLabel="Bold"
          >
            <Bold size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            ariaLabel="Italic"
          >
            <Italic size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            ariaLabel="Underline"
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            ariaLabel="Strikethrough"
          >
            <Strikethrough size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            ariaLabel="Ordered list"
          >
            <ListOrdered size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            ariaLabel="Bullet list"
          >
            <List size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleLinkClick}
            isActive={editor.isActive('link')}
            ariaLabel="Insert link"
          >
            <Link2 size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            isActive={false}
            ariaLabel="Clear formatting"
          >
            <Eraser size={16} />
          </ToolbarButton>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />
      </div>
    </div>
  );
}

export default RichTextEditor;