import React, { useState } from 'react';

const CATEGORY_ART = {
  'Взуття': {
    gradient: 'from-zinc-900 via-neutral-900 to-emerald-950/50',
    accent: '#10b981',
    code: 'FOOTWEAR // ARCHIVE'
  },
  'Штани': {
    gradient: 'from-zinc-900 via-stone-900 to-amber-950/40',
    accent: '#f59e0b',
    code: 'DENIM & CARGO // 14.5OZ'
  },
  'Кофти': {
    gradient: 'from-zinc-900 via-slate-900 to-purple-950/40',
    accent: '#a855f7',
    code: 'HEAVY KNIT // 540 GSM'
  },
  'Футболки': {
    gradient: 'from-zinc-900 via-neutral-900 to-cyan-950/40',
    accent: '#06b6d4',
    code: 'HEAVY TEE // 310 GSM'
  },
  'Прикраси': {
    gradient: 'from-zinc-900 via-zinc-800 to-slate-900',
    accent: '#e4e4e7',
    code: 'S925 STERLING // HARDWARE'
  },
  'Аксесуари': {
    gradient: 'from-zinc-900 via-neutral-900 to-rose-950/40',
    accent: '#f43f5e',
    code: 'LEATHER & METAL // STUDIO'
  },
  'Чохли': {
    gradient: 'from-zinc-900 via-zinc-950 to-indigo-950/50',
    accent: '#6366f1',
    code: 'MAGSAFE ARMOR // CNC'
  }
};

export default function ProductImage({ src, alt, brand, category, className = '' }) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const meta = CATEGORY_ART[category] || CATEGORY_ART['Взуття'];

  return (
    <div className={`relative overflow-hidden bg-zinc-900 select-none ${className}`}>
      {!hasError && src ? (
        <>
          {!loaded && (
            <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} animate-pulse`} />
          )}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${
              loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover:scale-105`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15 pointer-events-none" />
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${meta.gradient} flex flex-col justify-between p-4 relative`}>
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.35) 1px, transparent 0)',
              backgroundSize: '18px 18px'
            }}
          />
          <div className="relative z-10 flex justify-between items-center">
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 border border-zinc-700/80 px-2 py-0.5 rounded bg-black/40">
              {meta.code}
            </span>
          </div>
          <div className="relative z-10 my-auto text-center py-4">
            <div className="text-xl font-black tracking-tighter uppercase text-white/90">
              {brand || 'ARCHIVE'}
            </div>
            <div className="text-xs text-zinc-400 mt-1 line-clamp-1">{alt}</div>
          </div>
          <div className="relative z-10 h-1 w-12 rounded-full mx-auto" style={{ backgroundColor: meta.accent }} />
        </div>
      )}
    </div>
  );
}
