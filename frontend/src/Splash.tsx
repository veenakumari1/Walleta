import React, { useEffect, useId, useRef, useState } from 'react';
import { playWelcomeSound } from './welcomeSound';

export const APP_NAME = 'Walleta';

interface SplashProps {
  onDone: () => void;
  duration?: number; // ms
}

type Phase = 'checking' | 'gate' | 'playing';

const Splash: React.FC<SplashProps> = ({ onDone, duration = 2800 }) => {
  const uid = useId().replace(/:/g, '');
  const bg = `bg-${uid}`;
  const st = `st-${uid}`;
  const gl = `gl-${uid}`;

  const [phase, setPhase] = useState<Phase>('checking');
  const stopRef = useRef<() => void>(() => {});

  // Try autoplay first; if blocked, show the "Enter" gate
  useEffect(() => {
    stopRef.current = playWelcomeSound(
      APP_NAME,
      () => setPhase('gate'),
      () => setPhase('playing'),
    );
    return () => stopRef.current();
  }, []);

  // Timer starts only when the animation starts
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [phase, onDone, duration]);

  const handleEnter = () => {
    stopRef.current();
    stopRef.current = playWelcomeSound(APP_NAME, undefined, () => setPhase('playing'));
  };

  if (phase !== 'playing') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: '#0a0604',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {phase === 'gate' && (
          <button
            onClick={handleEnter}
            style={{
              padding: '14px 34px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '.04em',
              background: 'linear-gradient(135deg,#FFA24D,#FF5E1A)',
              boxShadow: '0 0 40px rgba(255,106,31,.45)',
            }}
          >
            Enter {APP_NAME}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="wl-splash">
      <style>{`
        .wl-splash{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;
          align-items:center;justify-content:center;background:#0a0604;overflow:hidden;color:#fff}
        .wl-splash::before{content:"";position:absolute;width:760px;height:560px;border-radius:50%;
          background:radial-gradient(closest-side,rgba(255,106,31,.22),transparent);
          animation:wl-aura 3s ease-in-out infinite alternate}
        @keyframes wl-aura{from{transform:scale(.9);opacity:.6}to{transform:scale(1.08);opacity:1}}

        .wl-tile{transform-origin:center;animation:wl-tile .9s cubic-bezier(.2,1.3,.4,1) both}
        @keyframes wl-tile{from{transform:scale(.2) rotate(-14deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}

        .wl-w{stroke-dasharray:1;stroke-dashoffset:1;animation:wl-draw 1.1s .7s cubic-bezier(.6,0,.2,1) forwards}
        @keyframes wl-draw{to{stroke-dashoffset:0}}

        .wl-coin{transform-box:fill-box;transform-origin:center;opacity:0;animation:wl-pop .5s 1.7s cubic-bezier(.2,1.6,.4,1) forwards}
        @keyframes wl-pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}

        .wl-float{animation:wl-float 3s 2s ease-in-out infinite alternate}
        @keyframes wl-float{to{transform:translateY(-6px)}}

        .wl-welcome{margin-top:22px;font-size:15px;letter-spacing:.18em;text-transform:uppercase;
          color:rgba(255,255,255,.55);opacity:0;animation:wl-fade .7s 1.2s forwards}
        @keyframes wl-fade{to{opacity:1}}

        .wl-name{display:flex;margin-top:8px;font-size:64px;font-weight:800;letter-spacing:-.02em}
        .wl-ch{display:inline-block;opacity:0;filter:blur(14px);transform:translateY(14px);
          animation:wl-ch .7s forwards}
        @keyframes wl-ch{to{opacity:1;filter:blur(0);transform:none}}

        .wl-line{margin-top:14px;height:3px;width:0;border-radius:3px;
          background:linear-gradient(90deg,transparent,#FF8A3D,#FF5E1A,transparent);
          animation:wl-line .9s 2.5s ease-out forwards}
        @keyframes wl-line{to{width:150px}}

        .wl-out{animation:wl-out .5s ${(duration - 500) / 1000}s forwards}
        @keyframes wl-out{to{opacity:0;transform:scale(1.04)}}

        @media (prefers-reduced-motion:reduce){
          .wl-splash *,.wl-splash::before{animation-duration:.01ms!important;animation-delay:0s!important}
        }
      `}</style>

      <div className="wl-out flex flex-col items-center">
        <div className="wl-float">
          <svg className="wl-tile" width="110" height="110" viewBox="0 0 64 64" fill="none" aria-label={`${APP_NAME} logo`}>
            <defs>
              <linearGradient id={bg} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFA24D" /><stop offset="1" stopColor="#FF5E1A" />
              </linearGradient>
              <linearGradient id={st} x1="12" y1="20" x2="52" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" /><stop offset="1" stopColor="#FFE3CC" />
              </linearGradient>
              <filter id={gl} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.6" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#${bg})`} />
            <path d="M2 24C2 11 11 2 24 2H40C53 2 62 11 62 24C48 18 20 18 2 24Z" fill="#fff" fillOpacity=".14" />
            <path d="M10 22C10 17 14 14 19 14H45C50 14 54 17 54 22V46C54 51 50 54 45 54H19C14 54 10 51 10 46V22Z" fill="#000" fillOpacity=".12" />
            <path
              className="wl-w"
              pathLength={1}
              d="M15 22C17 38 20 46 24 46C28 46 29.5 36 32 30C34.5 36 36 46 40 46C44 46 47 38 49 22"
              stroke={`url(#${st})`} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"
              filter={`url(#${gl})`}
            />
            <g className="wl-coin">
              <circle cx="49" cy="22" r="4" fill="#FFF4E8" />
              <circle cx="49" cy="22" r="1.6" fill="#FF6A1F" />
            </g>
          </svg>
        </div>

        <p className="wl-welcome">Welcome to</p>

        <h1 className="wl-name" aria-label={APP_NAME}>
          {APP_NAME.split('').map((c, i) => (
            <span key={i} className="wl-ch" style={{ animationDelay: `${1.5 + i * 0.07}s` }}>
              {c}
            </span>
          ))}
        </h1>

        <div className="wl-line" />
      </div>
    </div>
  );
};

export default Splash;