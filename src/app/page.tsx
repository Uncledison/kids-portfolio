"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import PremiumHeader from "@/components/PremiumHeader";
import PremiumGallery from "@/components/PremiumGallery";
import ImmersiveGallery from "@/components/ImmersiveGallery";
import Footer from "@/components/Footer";
import CoffeeButton from "@/components/CoffeeButton";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, PortfolioItem } from "@/lib/supabase";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  category: string;
  isRepresentative: boolean;
  isVideo?: boolean;
}

export default function Home() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [childName, setChildName] = useState("");
  const [bgmTracks, setBgmTracks] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("vision");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleActiveIndexChange = (index: number | null) => {
    if (index !== activeIndex) setActiveIndex(index);
  };

  const [theme, setTheme] = useState<'white' | 'dark'>('white');
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = [
    { id: "vision", title: "비전", desc: "꿈과 미래를 그립니다", color: "#0071e3" },
    { id: "experience", title: "경험", desc: "함께 배우고 성장한 시간들", color: "#34c759" },
    { id: "achievement", title: "성취", desc: "포기하지 않고 일궈낸 보람", color: "#ac39ff" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [portfolioRes, settingsRes] = await Promise.all([
          supabase.from('portfolio').select('*').order('created_at', { ascending: false }),
          fetch('/api/settings'),
        ]);

        if (portfolioRes.error) throw portfolioRes.error;

        if (portfolioRes.data) {
          const parsedItems = portfolioRes.data.map((item: PortfolioItem) => ({
            id: item.id,
            title: item.title,
            imageUrl: item.video_url || item.image_url || '',
            description: item.description || '',
            category: (item.category || 'vision').toLowerCase(),
            isRepresentative: !!item.is_representative,
            isVideo: !!item.video_url,
          })) as GalleryItem[];
          setItems(parsedItems);
        }

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setChildName(settings.child_name || "");
          const urls = [settings.bgm_1, settings.bgm_2, settings.bgm_3].filter(Boolean) as string[];
          setBgmTracks(urls);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (bgmTracks.length === 0) return;

    const shuffled = [...bgmTracks].sort(() => Math.random() - 0.5);
    let currentIdx = 0;

    const audio = new Audio(shuffled[currentIdx]);
    audio.volume = 0.5;
    audio.muted = isMuted;

    const handleEnded = () => {
      currentIdx = (currentIdx + 1) % shuffled.length;
      audio.src = shuffled[currentIdx];
      audio.play().catch(e => console.log("Loop play failed:", e));
    };

    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;

    const startPlayback = () => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.log("Initial play failed:", e));
      }
      window.removeEventListener('click', startPlayback);
    };
    window.addEventListener('click', startPlayback);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      window.removeEventListener('click', startPlayback);
      audio.pause();
      audioRef.current = null;
    };
  }, [bgmTracks]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!isMuted) {
        audioRef.current.play().catch(e => console.log("Toggle play failed:", e));
      }
    }
  }, [isMuted]);

  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.category === activeCategory)
      .sort((a, b) => (b.isRepresentative ? 1 : 0) - (a.isRepresentative ? 1 : 0));
  }, [items, activeCategory]);

  const activeCatObj = categories.find(c => c.id === activeCategory) || categories[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const categoryIds = ["vision", "experience", "achievement"];
  const handleSwipe = (direction: number) => {
    const currentIndex = categoryIds.indexOf(activeCategory);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = categoryIds.length - 1;
    if (nextIndex >= categoryIds.length) nextIndex = 0;
    setActiveIndex(0);
    setActiveCategory(categoryIds[nextIndex]);
  };

  const displayTitle = childName || "성장일기";

  return (
    <div className={`min-h-screen transition-colors duration-700 selection:bg-black selection:text-white overflow-x-hidden ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <PremiumHeader
        activeCategory={activeCategory}
        onCategoryChange={(cat) => { setActiveIndex(null); setActiveCategory(cat); }}
        title={displayTitle}
        currentTheme={theme}
        onThemeToggle={() => setTheme(prev => prev === 'white' ? 'dark' : 'white')}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(prev => !prev)}
      />

      <Footer dark={theme === 'dark'} />
      <CoffeeButton />

      {/* Branding badge - dark mode only */}
      {theme === 'dark' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          padding: '30px', zIndex: 100,
          display: 'flex', justifyContent: 'center', pointerEvents: 'none'
        }}>
          <div
            onClick={() => window.location.href = '/admin'}
            style={{
              padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.05em',
              color: 'rgba(255,255,255,0.9)', pointerEvents: 'auto',
              background: 'rgba(28, 28, 30, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeCatObj.color }} />
            <span>{displayTitle} 성장일기</span>
          </div>
        </div>
      )}

      <main>
          <motion.div
            drag={activeIndex === null ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (activeIndex !== null) return;
              if (info.offset.x > 100) handleSwipe(-1);
              else if (info.offset.x < -100) handleSwipe(1);
            }}
            className={activeIndex === null ? "cursor-grab active:cursor-grabbing" : ""}
          >
            {theme === 'white' ? (
              <PremiumGallery
                items={filteredItems}
                category={activeCategory}
                onCategoryChange={handleSwipe}
                activeIndex={activeIndex}
                onActiveIndexChange={handleActiveIndexChange}
              />
            ) : (
              <div style={{ backgroundColor: '#000', overflowY: 'auto', height: '100vh', touchAction: 'pan-y' }}>
                <motion.div
                  drag={activeIndex === null ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.05}
                  onDragEnd={(e, info) => {
                    if (activeIndex !== null) return;
                    if (info.offset.x > 100) handleSwipe(-1);
                    else if (info.offset.x < -100) handleSwipe(1);
                  }}
                  style={{ width: '100%', minHeight: '100%' }}
                >
                  {/* Hero Section */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
                        {/* Background Media */}
                        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                          {filteredItems[0]?.isVideo ? (
                            <video
                              key={filteredItems[0].imageUrl}
                              src={filteredItems[0].imageUrl}
                              autoPlay loop muted playsInline
                              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }}
                            />
                          ) : (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                              <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(90deg, #000 25%, #111 50%, #000 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s infinite linear', zIndex: 1
                              }} />
                              <img
                                src={filteredItems[0]?.imageUrl || ''}
                                style={{
                                  position: 'absolute', height: '100%', width: '100%',
                                  left: 0, top: 0, objectFit: 'cover',
                                  filter: 'brightness(0.65)', zIndex: 2
                                }}
                                alt=""
                              />
                            </div>
                          )}
                        </div>

                        {/* Gradient Overlay */}
                        <div style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                          background: `
                            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 35%),
                            linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%),
                            radial-gradient(circle at center, ${activeCatObj.color}22 0%, transparent 75%)
                          `,
                          zIndex: 1
                        }} />

                        {/* Center Content */}
                        <div style={{
                          position: 'relative', padding: '0 24px',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          height: '100%', textAlign: 'center', zIndex: 2
                        }}>
                          <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            padding: '6px 14px', borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '16px'
                          }}>
                            <span style={{
                              color: activeCatObj.color, fontWeight: 600,
                              letterSpacing: '0.3em', textTransform: 'uppercase',
                              fontSize: '0.7rem', display: 'block'
                            }}>
                              {activeCatObj.id.toUpperCase()}
                            </span>
                          </div>
                          <h1 style={{
                            marginBottom: '20px',
                            fontSize: 'clamp(3.5rem, 12vw, 5.5rem)',
                            fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.04em',
                            textShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif'
                          }}>
                            {activeCatObj.title}
                          </h1>
                          <p style={{
                            maxWidth: '400px', margin: '0 auto',
                            fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)',
                            lineHeight: '1.7', fontWeight: 400,
                            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                            fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif'
                          }}>
                            {activeCatObj.desc}
                          </p>
                        </div>
                      </section>
                    </motion.div>
                  </AnimatePresence>

                  {/* Gallery Section */}
                  <section style={{ minHeight: '100vh', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                          <h2 style={{ fontSize: '2.5rem' }}>{activeCatObj.title} 갤러리</h2>
                          <p style={{ color: '#86868b' }}>{filteredItems.length}개의 기록이 있습니다.</p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <div className="px-6 md:px-12">
                      <ImmersiveGallery
                        items={filteredItems}
                        onCategoryChange={handleSwipe}
                        activeIndex={activeIndex}
                        onActiveIndexChange={handleActiveIndexChange}
                      />
                    </div>
                  </section>

                </motion.div>
              </div>
            )}
          </motion.div>
      </main>
    </div>
  );
}
