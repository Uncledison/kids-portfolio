"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';

const CATEGORIES = [
  { id: 'vision', label: '비전' },
  { id: 'experience', label: '경험' },
  { id: 'achievement', label: '성취' }
];

interface Props {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  title: string;
  currentTheme: 'white' | 'dark';
  onThemeToggle: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export default function PremiumHeader({ activeCategory, onCategoryChange, title, currentTheme, onThemeToggle, isMuted, onMuteToggle }: Props) {
  const router = useRouter();
  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-colors duration-500 h-20 ${
      currentTheme === 'dark' 
        ? 'bg-transparent border-none' 
        : 'bg-white/80 border-b border-black/5 backdrop-blur-md'
    }`}>
      <div className="max-w-[1400px] h-full px-6 flex items-center justify-center relative" style={{ margin: '0 auto' }}>
        {/* Left: Signature Name (White mode only) */}
        {currentTheme === 'white' && (
          <div className="absolute left-6 h-full flex items-center">
            <span
              onClick={() => router.push('/admin')}
              className="text-lg font-medium tracking-tight font-apple transition-colors duration-500 text-black/40 cursor-pointer hover:text-black/70"
            >
              {title}
            </span>
          </div>
        )}

        {/* Centered Navigation (White mode only) */}
        {currentTheme === 'white' && (
          <nav className="flex gap-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`text-base tracking-tight transition-all duration-300 font-apple ${
                  activeCategory === cat.id
                    ? 'text-black font-semibold'
                    : 'text-black/30 hover:text-black/60 font-medium'
                }`}
              >
                {cat.label === '경험' ? '체험' : cat.label}
              </button>
            ))}
          </nav>
        )}

        {/* Theme Toggle - Positioned to match branding badge in Dark Mode */}
        {currentTheme === 'dark' ? (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            padding: '30px',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <button
              onClick={onMuteToggle}
              className="w-[32px] h-[32px] flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 bg-[rgba(28,28,30,0.4)] border border-[rgba(255,255,255,0.1)] text-white/50 hover:text-white pointer-events-auto mr-4 shadow-2xl"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {isMuted ? <VolumeX size={15} strokeWidth={1.5} /> : <Volume2 size={15} strokeWidth={1.5} />}
            </button>
            <button
              onClick={onThemeToggle}
              className="w-[32px] h-[32px] flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 bg-[rgba(28,28,30,0.4)] border border-[rgba(255,255,255,0.1)] text-white/50 hover:text-white pointer-events-auto shadow-2xl"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <Sun size={15} strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="absolute right-6 h-full flex items-center">
            <button
              onClick={onMuteToggle}
              className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 bg-white border border-black/5 text-black/20 shadow-sm mr-2"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {isMuted ? <VolumeX size={12} strokeWidth={1.5} /> : <Volume2 size={12} strokeWidth={1.5} />}
            </button>
            <button
              onClick={onThemeToggle}
              className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 bg-white border border-black/5 text-black/20 shadow-sm"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <Moon size={12} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}