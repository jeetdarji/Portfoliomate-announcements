import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export function ImageGrid({ images = [] }) {
  const [aspectRatios, setAspectRatios] = useState({});
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageError = (index) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  // Placeholder for broken images
  const ImagePlaceholder = () => (
    <div className="w-full h-full bg-[#F1F5F9] flex items-center justify-center min-h-[100px]">
      <ImageOff size={24} className="text-[#94A3B8]" />
    </div>
  );

  const handleImageLoad = (index, event) => {
    const { naturalWidth, naturalHeight } = event.target;
    let ratioClass = 'aspect-square';
    
    if (naturalWidth > naturalHeight * 1.2) {
      ratioClass = naturalWidth / naturalHeight >= 1.6 ? 'aspect-video' : 'aspect-[4/3]';
    } else if (naturalHeight > naturalWidth * 1.2) {
      ratioClass = naturalHeight / naturalWidth >= 1.4 ? 'aspect-[2/3]' : 'aspect-[3/4]';
    }

    setAspectRatios(prev => ({ ...prev, [index]: ratioClass }));
  };

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showNext = useCallback(() => {
    setLightboxIndex(prev => (prev === null || prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const showPrev = useCallback(() => {
    setLightboxIndex(prev => (prev === null || prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  if (!images || images.length === 0) return null;

  const count = images.length;

  const renderGridComponent = () => {
    if (count === 1) {
      return (
        <div className="w-full mt-4 rounded-[14px] overflow-hidden bg-[#F8FAFC]">
          {failedImages.has(0) ? <ImagePlaceholder /> : (
            <img 
              src={images[0]} 
              alt="" 
              loading="lazy" 
              onLoad={(e) => handleImageLoad(0, e)}
              onError={() => handleImageError(0)}
              onClick={() => openLightbox(0)}
              className="w-full max-h-[500px] object-cover cursor-pointer select-none block" 
              style={{ objectFit: 'contain' }}
            />
          )}
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="flex gap-2 mt-4 items-stretch">
          <div className={`rounded-[14px] overflow-hidden flex-1 bg-[#F8FAFC] ${aspectRatios[0] || 'aspect-square'}`}>
            {failedImages.has(0) ? <ImagePlaceholder /> : (
              <img src={images[0]} alt="" loading="lazy" onLoad={(e) => handleImageLoad(0, e)} onError={() => handleImageError(0)} onClick={() => openLightbox(0)} className="w-full h-full object-cover cursor-pointer select-none block" />
            )}
          </div>
          <div className={`rounded-[14px] overflow-hidden flex-1 bg-[#F8FAFC] ${aspectRatios[1] || 'aspect-square'}`}>
            {failedImages.has(1) ? <ImagePlaceholder /> : (
              <img src={images[1]} alt="" loading="lazy" onLoad={(e) => handleImageLoad(1, e)} onError={() => handleImageError(1)} onClick={() => openLightbox(1)} className="w-full h-full object-cover cursor-pointer select-none block" />
            )}
          </div>
        </div>
      );
    }

    // 3 or more images
    const remaining = count - 3;
    
    return (
      <div className="flex flex-col lg:flex-row gap-2 mt-4 items-stretch" style={{ marginTop: '16px' }}>
        {/* Left: big image */}
        <div className={`rounded-[14px] overflow-hidden w-full lg:w-[272px] flex-shrink-0 bg-[#F8FAFC] cursor-pointer ${aspectRatios[0] || 'aspect-square'}`} onClick={() => openLightbox(0)}>
          {failedImages.has(0) ? <ImagePlaceholder /> : (
            <img src={images[0]} alt="" loading="lazy" onLoad={(e) => handleImageLoad(0, e)} onError={() => handleImageError(0)}
              className="w-full h-full object-cover" />
          )}
        </div>
        
        {/* Right: two stacked */}
        <div className="flex lg:flex-col flex-row gap-2 flex-1 items-stretch">
          <div className={`rounded-[14px] overflow-hidden flex-1 bg-[#F8FAFC] cursor-pointer ${aspectRatios[1] || 'aspect-video'}`} onClick={() => openLightbox(1)}>
            {failedImages.has(1) ? <ImagePlaceholder /> : (
              <img src={images[1]} alt="" loading="lazy" onLoad={(e) => handleImageLoad(1, e)} onError={() => handleImageError(1)}
                className="w-full h-full object-cover" />
            )}
          </div>
          
          {/* Third slot — with +N overlay if more images */}
          <div className={`rounded-[14px] overflow-hidden flex-1 relative bg-[#F8FAFC] cursor-pointer ${aspectRatios[2] || 'aspect-video'}`} onClick={() => openLightbox(2)}>
            {failedImages.has(2) ? <ImagePlaceholder /> : (
              <img src={images[2]} alt="" loading="lazy" onLoad={(e) => handleImageLoad(2, e)} onError={() => handleImageError(2)}
                className="w-full h-full object-cover" />
            )}
            {remaining > 0 && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(26,26,26,0.4)' }}>
                <span className="font-display font-bold text-[31px] leading-[42px] text-white">
                  +{remaining}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderGridComponent()}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 cursor-pointer"
              onClick={closeLightbox}
            />
            
            <button 
              className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-black/50 rounded-full transition-colors"
              onClick={closeLightbox}
            >
              <X size={24} />
            </button>

            {count > 1 && (
              <>
                <button 
                  className="absolute left-4 z-50 p-2 text-white/70 hover:text-white bg-black/50 rounded-full transition-colors"
                  onClick={(e) => { e.stopPropagation(); showPrev(); }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className="absolute right-4 z-50 p-2 text-white/70 hover:text-white bg-black/50 rounded-full transition-colors"
                  onClick={(e) => { e.stopPropagation(); showNext(); }}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.2 }}
              className="relative z-40 max-w-[95vw] max-h-[95vh] pointer-events-none"
            >
              <img 
                src={images[lightboxIndex]} 
                alt="Lightbox preview" 
                className="max-w-full max-h-[95vh] object-contain rounded-md"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ImageGrid;