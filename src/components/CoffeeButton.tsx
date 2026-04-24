"use client";
import { useState, useRef } from "react";

export default function CoffeeButton() {
  const [expanded, setExpanded] = useState(false);
  const expandedRef = useRef(false);

  const handleClick = (e: React.MouseEvent) => {
    // 데스크탑: 항상 바로 이동
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!expandedRef.current) {
      // 첫 터치 — 펼치기만, 이동 막기
      e.preventDefault();
      expandedRef.current = true;
      setExpanded(true);
      // 3초 후 자동 닫힘
      setTimeout(() => {
        expandedRef.current = false;
        setExpanded(false);
      }, 3000);
    }
    // 두 번째 터치는 preventDefault 안 함 → 링크 이동
  };

  return (
    <a
      href="https://qr.kakaopay.com/Ej8uiFQwS"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(false); expandedRef.current = false; }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: '32px',
        borderRadius: '16px',
        background: '#FEE500',
        boxShadow: expanded
          ? '0 4px 20px rgba(254,229,0,0.55)'
          : '0 2px 10px rgba(0,0,0,0.12)',
        textDecoration: 'none',
        color: '#000',
        overflow: 'hidden',
        transition: 'box-shadow 0.25s',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {/* 텍스트 — 왼쪽으로 펼쳐짐 */}
      <span style={{
        maxWidth: expanded ? '90px' : '0px',
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-width 0.3s ease, opacity 0.25s ease',
        fontSize: '0.72rem',
        fontWeight: 600,
        paddingLeft: expanded ? '12px' : '0px',
      }}>
        커피보내기
      </span>
      {/* 원형 아이콘 */}
      <span style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        flexShrink: 0,
      }}>
        ☕
      </span>
    </a>
  );
}
