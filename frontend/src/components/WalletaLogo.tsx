import React, { useId } from 'react';

interface WalletaLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const WalletaLogo: React.FC<WalletaLogoProps> = ({
  size = 40,
  showText = true,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const bg = `bg-${uid}`;
  const stroke = `st-${uid}`;
  const glow = `gl-${uid}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Walleta logo"
      >
        <defs>
          <linearGradient id={bg} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFA24D" />
            <stop offset="1" stopColor="#FF5E1A" />
          </linearGradient>
          <linearGradient id={stroke} x1="12" y1="20" x2="52" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFE3CC" />
          </linearGradient>
          <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rounded tile */}
        <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#${bg})`} />

        {/* Soft inner highlight */}
        <path d="M2 24C2 11 11 2 24 2H40C53 2 62 11 62 24C48 18 20 18 2 24Z" fill="#fff" fillOpacity="0.14" />

        {/* Wallet flap (artistic fold behind the W) */}
        <path
          d="M10 22C10 17 14 14 19 14H45C50 14 54 17 54 22V46C54 51 50 54 45 54H19C14 54 10 51 10 46V22Z"
          fill="#000"
          fillOpacity="0.12"
        />

        {/* Flowing ribbon W */}
        <path
          d="M15 22C17 38 20 46 24 46C28 46 29.5 36 32 30C34.5 36 36 46 40 46C44 46 47 38 49 22"
          stroke={`url(#${stroke})`}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glow})`}
        />

        {/* Coin / clasp dot */}
        <circle cx="49" cy="22" r="4" fill="#FFF4E8" />
        <circle cx="49" cy="22" r="1.6" fill="#FF6A1F" />
      </svg>

      {showText && (
        <span
          className="font-extrabold tracking-tight text-white"
          style={{ fontSize: size * 0.55 }}
        >
          Walleta
        </span>
      )}
    </div>
  );
};