import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ModalHeader } from './ModalHeader';
import { TitleInput } from './TitleInput';
import { RichTextEditor } from './RichTextEditor';
import { TagInput } from './TagInput';
import { PinToggle } from './PinToggle';
import { ModalFooter } from './ModalFooter';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { toast } from 'sonner';

export function CreateAnnouncementModal({ isOpen, onClose }) {
  const { createAnnouncement, isCreating } = useAnnouncements();
  const [publishStage, setPublishStage] = useState('idle');
  const [formErrors, setFormErrors] = useState({});
  // Increment to force child components (Tiptap, TagInput, PinToggle) to remount and reset
  const [resetKey, setResetKey] = useState(0);

  const [formState, setFormState] = useState({
    title: '',
    content: null,
    content_text: '',
    tags: [],
    is_pinned: false,
    imageFiles: [],
    attachmentFiles: [],
  });

  const validateForm = useCallback(() => {
    const errors = {};
    const titleTrimmed = formState.title.trim();
    if (!titleTrimmed) {
      errors.title = 'Title is required.';
    } else if (titleTrimmed.length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    } else if (titleTrimmed.length > 150) {
      errors.title = 'Title must be 150 characters or fewer.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState.title]);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handlePublish = async () => {
    if (!validateForm()) return;

    try {
      setPublishStage('uploading');
      await createAnnouncement({ ...formState, setPublishStage });

      // Reset form and close — increment resetKey to force child remount
      setFormState({
        title: '', content: null, content_text: '',
        tags: [], is_pinned: false, imageFiles: [], attachmentFiles: [],
      });
      setFormErrors({});
      setResetKey(k => k + 1);
      onClose();
    } catch (err) {
      if (import.meta.env.DEV) console.error('[Modal] Publish failed:', err);
    } finally {
      setPublishStage('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative w-full max-w-[888px] bg-white rounded-[14px] flex flex-col overflow-hidden mx-4"
            style={{
              boxShadow: '0px 24.7768px 49.5536px -11.8929px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
            }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader onClose={onClose} />

            {/* Scrollable body */}
            <div className="flex flex-col gap-6 p-6 overflow-y-auto flex-1">
              <TitleInput
                title={formState.title}
                onTitleChange={(title) => {
                  setFormState(s => ({...s, title}));
                  if (formErrors.title) setFormErrors(e => ({...e, title: undefined}));
                }}
                onImagesChange={(imageFiles) => setFormState(s => ({...s, imageFiles}))}
                onFilesChange={(attachmentFiles) => setFormState(s => ({...s, attachmentFiles}))}
              />
              {formErrors.title && (
                <p className="font-sans text-[12px] text-[#EF4444] -mt-2">{formErrors.title}</p>
              )}
              <RichTextEditor
                key={resetKey}
                onContentChange={(content, content_text) =>
                  setFormState(s => ({...s, content, content_text}))}
              />

              {/* Bottom row: Tags + Pin side by side */}
              <div className="flex gap-6">
                <div className="flex-1">
                  <TagInput
                    key={`tags-${resetKey}`}
                    onTagsChange={(tags) => setFormState(s => ({...s, tags}))}
                  />
                </div>
                <div className="flex-1">
                  <PinToggle
                    key={`pin-${resetKey}`}
                    onPinChange={(is_pinned) => setFormState(s => ({...s, is_pinned}))}
                  />
                </div>
              </div>
            </div>

            <ModalFooter
              onClose={onClose}
              onPublish={handlePublish}
              isPublishing={isCreating}
              publishStage={publishStage}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreateAnnouncementModal;