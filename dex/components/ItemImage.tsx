'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';

interface ItemImageProps {
  id?: string;
  name?: string;
  src?: string;
  alt: string;
  type: 'anibot' | 'chip';
  diodeColor?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
  size?: 'sm' | 'md' | 'lg';
}

export const ItemImage: React.FC<ItemImageProps> = ({
  id,
  name,
  src,
  alt,
  type,
  diodeColor = '#00f0ff',
  aspectRatio = 'aspect-video',
  objectFit = 'cover',
}) => {
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (src) list.push(src);

    const cleanId = id || '';
    const cleanName1 = (name || '').replace(/[^a-zA-Z0-9]/g, '');
    const cleanName2 = (name || '').replace(/\s+/g, '_');
    const typePlural = type === 'anibot' ? 'anibots' : 'chips';

    // 1. Primary CHIP-[CORE_NAME].jpg convention for chips
    if (type === 'chip') {
      const chipIdCore = cleanId.replace(/^chip[_\-]/i, '').toUpperCase();
      const chipNameCore = (name || '').replace(/\bchip\b/gi, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

      if (chipIdCore) {
        list.push(`/images/CHIP-${chipIdCore}.jpg`);
        list.push(`/images/CHIP-${chipIdCore}.png`);
        list.push(`/images/CHIP-${chipIdCore}.jpeg`);
        list.push(`/images/CHIP-${chipIdCore}.webp`);
      }
      if (chipNameCore && chipNameCore !== chipIdCore) {
        list.push(`/images/CHIP-${chipNameCore}.jpg`);
        list.push(`/images/CHIP-${chipNameCore}.png`);
      }
    }

    // 2. ANIBOT-[CORE_NAME].jpg or BOT-[CORE_NAME].jpg convention for bots
    if (type === 'anibot') {
      const botIdCore = cleanId.replace(/^anibot[_\-]/i, '').toUpperCase();
      if (botIdCore) {
        list.push(`/images/ANIBOT-${botIdCore}.jpg`);
        list.push(`/images/ANIBOT-${botIdCore}.png`);
        list.push(`/images/BOT-${botIdCore}.jpg`);
        list.push(`/images/BOT-${botIdCore}.png`);
      }
    }

    // 3. Fallback standard patterns
    if (cleanId) {
      list.push(`/images/${cleanId}.png`);
      list.push(`/images/${cleanId}.jpg`);
      list.push(`/images/${cleanId}.jpeg`);
      list.push(`/images/${cleanId}.webp`);
      list.push(`/images/${typePlural}/${cleanId}.png`);
      list.push(`/images/${typePlural}/${cleanId}.jpg`);
      list.push(`/images/${cleanId}_Schematic.jpg`);
      list.push(`/images/${cleanId}_Schematic.png`);
    }

    if (cleanName1) {
      list.push(`/images/${cleanName1}.png`);
      list.push(`/images/${cleanName1}.jpg`);
      list.push(`/images/${cleanName1}_Schematic.jpg`);
      list.push(`/images/${cleanName1}_Schematic.png`);
      list.push(`/images/${typePlural}/${cleanName1}.png`);
      list.push(`/images/${typePlural}/${cleanName1}.jpg`);
    }

    if (cleanName2) {
      list.push(`/images/${cleanName2}.png`);
      list.push(`/images/${cleanName2}.jpg`);
      list.push(`/images/${cleanName2}_Schematic.jpg`);
    }

    // Deduplicate
    return Array.from(new Set(list));
  }, [id, name, src, type]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index if candidates change
  useEffect(() => {
    setCurrentIndex(0);
  }, [candidates]);

  const currentSrc = candidates[currentIndex];
  const hasValidImage = currentIndex < candidates.length && currentSrc;

  const handleImageError = () => {
    setCurrentIndex((prev) => prev + 1);
  };

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
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-slate-600 z-10"></div>
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-slate-600 z-10"></div>
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-slate-600 z-10"></div>
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-slate-600 z-10"></div>

      {hasValidImage ? (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 100vw"
          className={`${
            objectFit === 'contain' ? 'object-contain p-1' : 'object-cover'
          } group-hover/img:scale-[1.02] transition-transform duration-300`}
          onError={handleImageError}
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
