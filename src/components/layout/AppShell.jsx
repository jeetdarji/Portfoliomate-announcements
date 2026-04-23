import { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RightPanel from './RightPanel';
import { useAuthStore } from '@/store/authStore';

export const AppShell = ({ children }) => {
  const scrollContainerRef = useRef(null);
  const { profile } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (isDrawerOpen || isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, isFilterDrawerOpen]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) return;

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: scrollContainerRef.current.firstElementChild,
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });

    let animationFrameId;

    const raf = (time) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-[#F9FAFB] font-sans text-text-primary selection:bg-brand-primary/20 relative">
      <Sidebar 
        profile={profile} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
      {/* Backdrop for mobile sidebar/filter panel */}
      {(isDrawerOpen || isFilterDrawerOpen) && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => {
            setIsDrawerOpen(false);
            setIsFilterDrawerOpen(false);
          }}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden w-full lg:w-auto">
        <TopBar profile={profile} onOpenDrawer={() => setIsDrawerOpen(true)} onOpenFilter={() => setIsFilterDrawerOpen(true)} />
        <div className="flex flex-1 overflow-hidden px-4 lg:px-6">
          <div className="flex w-full gap-[24px]">
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full pb-[48px] pt-[24px]"
              >
                {children}
              </motion.main>
            </div>
            <div className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isFilterDrawerOpen ? 'translate-x-0' : 'translate-x-full'} flex h-screen w-[280px] shrink-0 bg-[#F9FAFB] lg:bg-transparent lg:block`}>
              <RightPanel onClose={() => setIsFilterDrawerOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppShell;