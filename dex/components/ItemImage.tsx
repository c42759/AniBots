'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ItemImageProps {
  src?: string;
  defaultPath?: string;
  alt: string;
  type: 'anibot' | 'chip';
  diodeColor?: string;
  aspectRatio?: string; // e.g. 'aspect-video' or 'aspect-square'
  size?: 'sm' | 'md' | 'lg';
}

export const ItemImage: React.FC<ItemImageProps> = ({
  src,
  defaultPath,
  alt,
  type,
  diodeColor = '#00f0ff',
  aspectRatio = 'aspect-video',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);
  const imageSrc = src || defaultPath;

  const isBot = type === 'anibot';
  const borderAccent = isBot ? 'border-amber-500/30' : 'border-cyan-500/30';
  const bgAccent = isBot ? 'bg-amber-950/20' : 'bg-cyan-950/20';

  return (
    <div
      className={`relative w-full ${aspectRatio} rounded-lg overflow-hidden border ${borderAccent} ${bgAccent} flex items-center justify-center group/img`}
    >
      {/* Background Cyber Grid Lines */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>

      {/* Target Crosshair Corners */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-slate-600"></div>
      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-slate-600"></div>
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-slate-600"></div>
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-slate-600"></div>

      {imageSrc && !imageError ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover/img:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Cyber Hologram / Placeholder View */
        <div className="flex flex-col items-center justify-center text-center p-3 z-10 font-mono">
          {isBot ? (
            <div className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg mb-1 group-hover/img:scale-110 transition-transform">
              🤖
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full border flex items-center justify-center text-lg mb-1 group-hover/img:scale-110 transition-transform animate-diode"
              style={{
                borderColor: `${diodeColor}88`,
                backgroundColor: `${diodeColor}22`,
                boxShadow: `0 0 12px ${diodeColor}44`,
              }}
            >
              💾
            </div>
          )}
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {isBot ? 'FRAME SCHEMATIC' : 'CORE ENGRAM'}
          </span>
          <span className="text-[9px] text-slate-600 mt-0.5">IMAGE SLOT RESERVED</span>
        </div>
      )}

      {/* Hologram Scanner Bar Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40"></div>
    </div>
  );
};
