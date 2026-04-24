"use client";
import { useState } from "react";

export default function CoffeeButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://qr.kakaopay.com/Ej8uiFQwS"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 1500)}
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '20px',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 14px',
        borderRadius: '22px 22px 4px 22px',
        background: '#FEE500',
        boxShadow: hovered
          ? '0 6px 24px rgba(254,229,0,0.6)'
          : '0 4px 14px rgba(0,0,0,0.15)',
        textDecoration: 'none',
        color: '#000',
        fontWeight: 600,
        fontSize: '0.78rem',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        transition: 'box-shadow 0.25s, padding 0.25s',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>☕</span>
      <span style={{
        maxWidth: hovered ? '90px' : '0px',
        overflow: 'hidden',
        transition: 'max-width 0.3s ease',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}>
        커피보내기
      </span>
      {/* 말풍선 꼬리 */}
      <span style={{
        position: 'absolute',
        bottom: '-7px',
        right: '10px',
        width: '14px',
        height: '8px',
        background: '#FEE500',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
      }} />
    </a>
  );
}
