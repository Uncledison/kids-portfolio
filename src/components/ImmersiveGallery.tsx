"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  isVideo?: boolean;
}

interface Props {
  items: GalleryItem[];
  onCategoryChange?: (direction: number) => void;
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
}

export default function ImmersiveGallery({ items, onCategoryChange, activeIndex, onActiveIndexChange }: Props) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const navigate = useCallback((direction: number) => {
    if (activeIndex === null) return;
    const nextIndex = (activeIndex + direction + items.length) % items.length;
    onActiveIndexChange(nextIndex);
  }, [activeIndex, items.length, onActiveIndexChange]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 20;
    const velocityThreshold = 200;
    const { offset, velocity } = info;

    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x < -threshold || velocity.x < -velocityThreshold) {
        onCategoryChange?.(1);
      } else if (offset.x > threshold || velocity.x > velocityThreshold) {
        onCategoryChange?.(-1);
      }
    } else {
      if (offset.y < -threshold || velocity.y < -velocityThreshold) {
        navigate(1);
      } else if (offset.y > threshold || velocity.y > velocityThreshold) {
        navigate(-1);
      }
    }
  };

  const onImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px',
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          layoutId={item.id}
          onClick={(e) => {
            e.stopPropagation();
            onActiveIndexChange(index);
          }}
          className="glass-morphism"
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            cursor: 'pointer',
            height: '400px',
            position: 'relative',
            background: '#111'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {!loadedImages[item.id] && !item.isVideo && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(90deg, #111 25%, #222 50%, #111 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite linear'
            }} />
          )}

          {item.isVideo ? (
            <video
              src={item.imageUrl}
              autoPlay loop muted playsInline
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
            />
          ) : (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              opacity: loadedImages[item.id] ? 0.6 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                onLoadingComplete={() => onImageLoad(item.id)}
              />
            </div>
          )}

          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: '100%',
            padding: '24px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.9) 80%)',
            backdropFilter: 'blur(4px)',
            zIndex: 2
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{item.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '6px', fontWeight: 400 }}>
              {item.description.substring(0, 60)}{item.description.length > 60 ? '...' : ''}
            </p>
          </div>

          <style jsx global>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </motion.div>
      ))}

      <AnimatePresence>
        {activeIndex !== null && items[activeIndex] && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); onActiveIndexChange(null); }}
              style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.92)', zIndex: 100, backdropFilter: 'blur(20px)'
              }}
            />
            <motion.div
              layoutId={items[activeIndex].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              drag={true}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={handleDragEnd}
              style={{
                position: 'fixed', top: '5%', left: '5%', width: '90%', height: '90%',
                zIndex: 101, background: '#000', borderRadius: '32px', overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                display: 'flex', flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)',
                touchAction: 'none'
              }}
            >
              <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 110 }}>
                <button
                  onClick={() => onActiveIndexChange(null)}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    color: '#fff', padding: '8px 16px', borderRadius: '20px',
                    cursor: 'pointer', backdropFilter: 'blur(15px)',
                    fontWeight: 500, fontSize: '0.85rem'
                  }}
                >
                  Close
                </button>
              </div>

              <div style={{ width: '100%', height: '55%', overflow: 'hidden', position: 'relative', background: '#000' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={items[activeIndex].id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                  >
                    {items[activeIndex].isVideo ? (
                      <video
                        src={items[activeIndex].imageUrl}
                        controls autoPlay
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Image
                          src={items[activeIndex].imageUrl}
                          alt={items[activeIndex].title}
                          fill style={{ objectFit: 'contain' }} priority
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, width: '100%', height: '120px',
                  background: 'linear-gradient(to top, #000, transparent)',
                  pointerEvents: 'none', zIndex: 5
                }} />
              </div>

              <div style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={items[activeIndex].id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                      {items[activeIndex].title}
                    </h2>
                    <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)', fontWeight: 400, marginBottom: '32px' }}>
                      {items[activeIndex].description || "기록된 상세 설명이 없습니다."}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
