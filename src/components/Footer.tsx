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
        href="https://ai.uncledison.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: dark ? 'rgba(28,28,30,0.4)' : 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          fontSize: '0.7rem',
          fontWeight: 500,
          color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)',
          textDecoration: 'none',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
          transition: 'color 0.2s',
          boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.08)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)')}
      >
        Designed by <strong style={{ fontWeight: 700, marginLeft: '4px' }}>에디슨삼촌</strong>
      </a>
    </footer>
  );
}
