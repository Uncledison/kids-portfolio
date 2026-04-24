"use client";

export default function Footer({ dark = false }: { dark?: boolean }) {
  return (
    <footer style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      pointerEvents: 'none',
    }}>
      <a
        href="https://qr.kakaopay.com/Ej8uiFQwS"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '7px 18px',
          borderRadius: '20px',
          background: dark ? 'rgba(28,28,30,0.5)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
          fontSize: '0.72rem',
          fontWeight: 500,
          color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.85)',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
          transition: 'background 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s',
          boxShadow: dark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#FEE500';
          e.currentTarget.style.color = '#000';
          e.currentTarget.style.borderColor = '#FEE500';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(254,229,0,0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = dark ? 'rgba(28,28,30,0.5)' : 'rgba(255,255,255,0.85)';
          e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.85)';
          e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
          e.currentTarget.style.boxShadow = dark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.1)';
        }}
      >
        ☕ <strong style={{ fontWeight: 700, marginRight: '0px' }}>에디슨삼촌에게</strong> 커피보내기
      </a>
    </footer>
  );
}
