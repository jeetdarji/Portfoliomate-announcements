import { ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// ── Progress step dots ───────────────────────────────────────────────
function StepDots({ stage }) {
  const steps = ['uploading', 'analyzing', 'done'];
  const currentIdx = steps.indexOf(stage);
  if (currentIdx < 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5"
    >
      {steps.map((step, i) => (
        <div
          key={step}
          style={{
            width: i <= currentIdx ? 16 : 6,
            height: 6,
            borderRadius: 3,
            background: i <= currentIdx ? '#4F39F5' : '#CBD5E1',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </motion.div>
  );
}

export function ModalFooter({ onClose, onPublish, isPublishing, publishStage = 'idle' }) {
  const isBusy = isPublishing || (publishStage !== 'idle' && publishStage !== 'done');

  const buttonAriaLabel = {
    idle: 'Publish announcement',
    uploading: 'Uploading files, please wait',
    analyzing: 'Analyzing PDF with AI, please wait',
    done: 'Publish announcement',
  }[publishStage] || 'Publish announcement';

  const renderButtonContent = () => {
    if (publishStage === 'analyzing') {
      return (
        <motion.span
          key="analyzing"
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles size={14} className="animate-pulse" />
          <span>Analyzing document...</span>
        </motion.span>
      );
    }

    if (publishStage === 'uploading' || isBusy) {
      return (
        <motion.span
          key="uploading"
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Loader2 size={14} className="animate-spin" />
          <span>Uploading...</span>
        </motion.span>
      );
    }

    return (
      <motion.span
        key="idle"
        className="flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <span>Publish Now</span>
        <ChevronRight size={18} className="text-white" />
      </motion.span>
    );
  };

  return (
    <div
      className="flex items-center justify-between py-6 px-8"
      style={{ borderTop: '0.991071px solid #E2E8F0' }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.149048px] text-[#62748E] bg-transparent border-none cursor-pointer px-[23px] py-[9px] rounded-[10px] hover:bg-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <StepDots stage={publishStage} />
      </div>

      <button
        type="button"
        onClick={onPublish}
        disabled={isBusy}
        aria-label={buttonAriaLabel}
        aria-busy={isBusy}
        className="flex items-center gap-4 font-sans font-semibold text-[14px] leading-[20px] tracking-[-0.149048px] text-white px-6 py-[11px] rounded-[10px] cursor-pointer border-none hover:bg-[#2D2D6B] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: isBusy ? '#4F39F5' : '#33337B',
          boxShadow:
            '0px 0.991071px 2.97321px rgba(0,0,0,0.1), 0px 0.991071px 1.98214px -0.991071px rgba(0,0,0,0.1)',
          transition: 'background 0.3s ease',
        }}
      >
        <AnimatePresence mode="wait">
          {renderButtonContent()}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default ModalFooter;