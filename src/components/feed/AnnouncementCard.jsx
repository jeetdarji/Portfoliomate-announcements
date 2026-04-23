import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostAuthorHeader } from './PostAuthorHeader';
import { TopicTag } from './TopicTag';
import { ImageGrid } from './ImageGrid';
import { AttachmentRow } from './AttachmentRow';
import { LikeCommentBar } from './LikeCommentBar';
import { CommentThread } from './CommentThread';
import { PinnedBanner } from './PinnedBanner';
import { AISummaryCard } from './AISummaryCard';

export function AnnouncementCard({
  id,
  author,
  timestamp,
  title,
  bodyText,
  isPinned: initialIsPinned,
  isFirstPinned = false,
  topicTag,
  images = [],
  attachments = [],
  likesCount = 0,
  commentsCount = 0,
  isLiked = false,
  comments = [],
  aiSummary = null,
  currentUser = { name: '', avatarUrl: null },
  onToggleLike,
  onSubmitComment,
  onTogglePinComment,
  onTogglePinPost,
  className = '',
  motionProps = {},
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [showMenu, setShowMenu] = useState(false);

  // Sync state if initial prop changes
  useEffect(() => {
    setIsPinned(initialIsPinned);
  }, [initialIsPinned]);

  const textRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textRef.current) {
      if (textRef.current.scrollHeight > textRef.current.clientHeight) {
        setShowToggle(true);
      }
    }
  }, [bodyText]);

  const handleTogglePinPost = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    if (onTogglePinPost) {
      onTogglePinPost(newPinnedState);
    }
    setShowMenu(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`bg-white rounded-[14px] overflow-hidden ${className}`}
      style={{ filter: 'drop-shadow(0px 0px 10px rgba(216,216,216,0.25))' }}
      {...motionProps}
    >
      {isFirstPinned && <PinnedBanner />}
      <div className="px-4 pt-4 pb-[14px] lg:px-6 lg:pt-6 lg:pb-[18px]">
        <div className="flex justify-between items-start relative">
          <div className="flex flex-col">
            {isPinned && (
              <div className="flex items-center gap-1 text-[#696975] mb-2">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M9.828.122A.5.5 0 0 1 10 .5V2h1a1.5 1.5 0 0 1 1.5 1.5c0 .324-.103.626-.278.867l-1.396 2.093A3.5 3.5 0 0 0 10.5 8.5v3.793l.854.853A.5.5 0 0 1 11 14H8.5v1.5a.5.5 0 0 1-1 0V14H5a.5.5 0 0 1-.354-.854l.854-.853V8.5a3.5 3.5 0 0 0-.326-2.04l-1.396-2.093A1.5 1.5 0 0 1 3.5 2h1V.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .328.122z"/>
                </svg>
                <span className="text-xs font-medium">Pinned</span>
              </div>
            )}
            <PostAuthorHeader 
              name={author.name} 
              role={author.role} 
              avatarUrl={author.avatarUrl} 
              timestamp={timestamp} 
            />
          </div>
          
          <div className="relative flex items-center justify-end" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1"
                >
                  <button 
                    onClick={handleTogglePinPost}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.828.122A.5.5 0 0 1 10 .5V2h1a1.5 1.5 0 0 1 1.5 1.5c0 .324-.103.626-.278.867l-1.396 2.093A3.5 3.5 0 0 0 10.5 8.5v3.793l.854.853A.5.5 0 0 1 11 14H8.5v1.5a.5.5 0 0 1-1 0V14H5a.5.5 0 0 1-.354-.854l.854-.853V8.5a3.5 3.5 0 0 0-.326-2.04l-1.396-2.093A1.5 1.5 0 0 1 3.5 2h1V.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .328.122z"/>
                    </svg>
                    {isPinned ? 'Unpin post' : 'Pin post'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {topicTag && (
          <TopicTag 
            label={topicTag.label} 
          />
        )}

        <h2 className="font-display font-bold text-[16px] lg:text-[18px] leading-[24px] lg:leading-[28px] tracking-[-0.439453px] text-[#0F172B] mt-3">
          {title}
        </h2>

        <div className="relative">
          <p
            ref={textRef}
            className={`font-display font-normal text-[14px] leading-[23px] tracking-[-0.150391px] text-[#45556C] mt-2 ${
              isExpanded ? '' : 'line-clamp-3'
            }`}
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {bodyText}
          </p>

          {showToggle && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="block mt-1 font-display font-extrabold text-[14px] text-[#010080] hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              {isExpanded ? 'Show Less' : 'Read More...'}
            </button>
          )}
        </div>

        {/* ── AI Summary Card ── */}
        <AISummaryCard summary={aiSummary} />

        {/* ── Image Grid ── */}
        <ImageGrid images={images} />

        {/* ── Attachments ── */}
        <AttachmentRow attachments={attachments} announcementId={id} />

        {/* ── Like + Comment Bar ── */}
        <LikeCommentBar
          likesCount={likesCount}
          commentsCount={commentsCount}
          isLiked={isLiked}
          onToggleLike={onToggleLike}
          onToggleComments={() => setShowComments(prev => !prev)}
          showComments={showComments}
        />

        {/* ── Comment Thread (conditional) ── */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <CommentThread 
                comments={comments} 
                currentUser={currentUser} 
                onSubmitComment={onSubmitComment}
                onTogglePinComment={onTogglePinComment}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export default AnnouncementCard;