import React from 'react';

export const PixelTrack: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none opacity-30 z-0 overflow-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,24,1,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,24,1,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)]"></div>
      
      {/* The Track Container */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] max-w-none" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        
        {/* Track Outline (Decorative) */}
        <path 
          id="trackPath"
          d="M 100,300 C 100,100 400,100 400,200 C 400,300 200,300 200,400 C 200,550 800,550 800,400 C 800,200 600,200 600,100 C 600,50 900,50 900,300 C 900,550 100,550 100,300"
          fill="none"
          stroke="#330000"
          strokeWidth="60"
          strokeLinecap="round"
        />
        <path 
          d="M 100,300 C 100,100 400,100 400,200 C 400,300 200,300 200,400 C 200,550 800,550 800,400 C 800,200 600,200 600,100 C 600,50 900,50 900,300 C 900,550 100,550 100,300"
          fill="none"
          stroke="#FF1801"
          strokeWidth="2"
          strokeDasharray="10 10"
          className="opacity-20"
        />

        {/* The Animated Car Group */}
        {/* We use CSS offset-path (motion-path) to follow the SVG path */}
        <g style={{ 
            offsetPath: `path('M 100,300 C 100,100 400,100 400,200 C 400,300 200,300 200,400 C 200,550 800,550 800,400 C 800,200 600,200 600,100 C 600,50 900,50 900,300 C 900,550 100,550 100,300')`,
            animation: 'drive 12s linear infinite'
          }}>
          
          {/* Pixel Car Graphic - Top Down */}
          <g transform="rotate(90) scale(2)">
             {/* Rear Wing */}
             <rect x="-8" y="-12" width="16" height="4" fill="#FF1801" />
             {/* Body */}
             <rect x="-4" y="-10" width="8" height="20" fill="#cc0000" />
             {/* Front Wing */}
             <rect x="-8" y="8" width="16" height="3" fill="#FF1801" />
             {/* Tires */}
             <rect x="-10" y="-8" width="4" height="6" fill="#111" /> {/* RL */}
             <rect x="6" y="-8" width="4" height="6" fill="#111" />  {/* RR */}
             <rect x="-10" y="4" width="4" height="6" fill="#111" />  {/* FL */}
             <rect x="6" y="4" width="4" height="6" fill="#111" />   {/* FR */}
             {/* Helmet */}
             <rect x="-2" y="-2" width="4" height="4" fill="#FFFF00" />
          </g>
          
          {/* Speed Lines */}
          <line x1="-30" y1="-5" x2="-50" y2="-5" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <line x1="-30" y1="5" x2="-50" y2="5" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};