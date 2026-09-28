import React from 'react';

interface FenixBrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTaglines?: boolean;
}

export const FenixBrandLogo: React.FC<FenixBrandLogoProps> = ({ 
  size = 'md',
  showTaglines = false 
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className="flex items-center gap-3">
      {/* Flaming Phoenix Logo Mark */}
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg overflow-hidden border border-red-500/40 bg-neutral-950 shadow-[0_0_15px_rgba(239,68,68,0.25)] ${
        isSm ? 'h-8 w-8' : isLg ? 'h-14 w-14' : 'h-10 w-10'
      }`}>
        <img
          src="/images/fenix_logo_icon_1790557435957.jpg"
          alt="Fênix Multimarcas"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback Fire Icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-600/20 via-orange-600/10 to-transparent pointer-events-none">
          <span className="text-red-500 font-black text-xs">FX</span>
        </div>
      </div>

      {/* Brand Typographic Lockup */}
      <div className="flex flex-col">
        {/* FÊNIX Wordmark with signature red X */}
        <div className={`font-black tracking-wider leading-none uppercase flex items-center ${
          isSm ? 'text-base' : isLg ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
        }`}>
          <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            FÊN
          </span>
          <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            I
          </span>
          {/* Red X Accent */}
          <span className="relative inline-block text-red-500 font-extrabold drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] ml-0.5">
            X
          </span>
        </div>

        {/* — MULTIMARCAS — with red flanking bars */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="h-[2px] w-3 bg-red-600 rounded-full" />
          <span className={`font-bold tracking-[0.2em] text-neutral-200 uppercase ${
            isSm ? 'text-[8px]' : isLg ? 'text-xs' : 'text-[9px]'
          }`}>
            MULTIMARCAS
          </span>
          <span className="h-[2px] w-3 bg-red-600 rounded-full" />
        </div>

        {/* ORG CESAR MAIA */}
        <div className={`font-medium tracking-[0.25em] text-neutral-400 uppercase mt-0.5 ${
          isSm ? 'text-[7px]' : isLg ? 'text-[10px]' : 'text-[8px]'
        }`}>
          ORG CESAR MAIA
        </div>
      </div>

      {/* Optional Taglines Banner */}
      {showTaglines && (
        <div className="hidden lg:flex items-center gap-6 border-l border-neutral-800 pl-6 ml-4">
          <div className="text-[10px] uppercase tracking-wider font-semibold leading-tight">
            <div className="text-neutral-300">TECNOLOGIA</div>
            <div className="text-red-500">QUALIDADE</div>
            <div className="text-neutral-300">CONFIANÇA</div>
          </div>
          <div className="text-xs font-serif italic text-red-400 font-medium leading-tight">
            Sempre<br />com você!
          </div>
        </div>
      )}
    </div>
  );
};
