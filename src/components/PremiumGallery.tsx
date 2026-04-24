"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  category: string;
  isVideo?: boolean;
}

interface Props {
  items: GalleryItem[];
  category: string;
  onCategoryChange?: (direction: number) => void;
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
}

export default function PremiumGallery({ items, category, onCategoryChange, activeIndex, onActiveIndexChange }: Props) {
  const selectedItem = activeIndex !== null ? items[activeIndex] : null;

  const navigate = (direction: number) => {
    if (activeIndex === null) return;
    const nextIndex = (activeIndex + direction + items.length) % items.length;
    onActiveIndexChange(nextIndex);
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 20;
    const velocityThreshold = 200;
    
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x < -threshold || velocity.x < -velocityThreshold) onCategoryChange?.(1);
      else if (offset.x > threshold || velocity.x > velocityThreshold) onCategoryChange?.(-1);
    } else {
      if (offset.y < -threshold || velocity.y < -velocityThreshold) navigate(1);
      else if (offset.y > threshold || velocity.y > velocityThreshold) navigate(-1);
    }
  };

  return (
    <section className="gallery-section bg-white min-h-screen pt-28">
      <div className="max-w-[1400px] px-8 md:px-12" style={{ margin: '0 auto' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-x-8 md:gap-y-12">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
              onClick={(e) => {
                e.stopPropagation();
                onActiveIndexChange(index);
              }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden bg-[#fafafa] rounded-[24px] shadow-sm ring-1 ring-black/5">
                {item.isVideo ? (
                  <video
                    src={item.imageUrl}
                    className="w-full h-auto block transition-transform duration-1000 group-hover:scale-105"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto block transition-transform duration-1000 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            drag={true}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 md:p-12 touch-none overflow-hidden"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
            }}
          >
            <button
              onClick={() => onActiveIndexChange(null)}
              className="absolute top-8 right-8 z-[110] p-4 text-black/50 hover:text-black hover:scale-110 transition-all"
            >
              <X size={32} strokeWidth={1} />
            </button>

            <div className="max-w-4xl w-full flex flex-col items-center gap-12">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={selectedItem.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                   className="w-full max-h-[70vh] flex items-center justify-center"
                 >
                   {selectedItem.isVideo ? (
                     <video
                      src={selectedItem.imageUrl}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      controls
                      autoPlay
                      muted={false}
                     />
                   ) : (
                     <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                     />
                   )}
                 </motion.div>
               </AnimatePresence>

               <AnimatePresence mode="wait">
                 <motion.div 
                   key={selectedItem.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="text-center font-apple"
                 >
                    <h2 className="text-2xl font-bold text-black mb-3">
                      {selectedItem.title}
                    </h2>
                    <p className="text-black/50 font-medium max-w-lg leading-relaxed">
                      {selectedItem.description}
                    </p>
                 </motion.div>
               </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}