'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';

export const ItemImage = ({
  id,
  name,
  src,
  alt,
  type,
  diodeColor = '#D9381E',
  aspectRatio = 'aspect-video',
  objectFit = 'cover',
}) => {
  const candidates = useMemo(() => {
    const list = [];
    if (src) list.push(src);

    const cleanId = id || '';
    const cleanName1 = (name || '').replace(/[^a-zA-Z0-9]/g, '');
    const cleanName2 = (name || '').replace(/\s+/g, '_');
    const typePlural = type === 'anibot' ? 'anibots' : 'chips';

    if (type === 'chip') {
      const chipIdCore = cleanId.replace(/^chip[_\-]/i, '').toUpperCase();
      const chipNameCore = (name || '')
        .replace(/\bchip\b/gi, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();

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

    if (type === 'anibot') {
      const botIdCore = cleanId.replace(/^anibot[_\-]/i, '').toUpperCase();
      if (botIdCore) {
        list.push(`/images/ANIBOT-${botIdCore}.jpg`);
        list.push(`/images/ANIBOT-${botIdCore}.png`);
        list.push(`/images/BOT-${botIdCore}.jpg`);
        list.push(`/images/BOT-${botIdCore}.png`);
      }
    }

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

    return Array.from(new Set(list));
  }, [id, name, src, type]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [candidates]);

  const currentSrc = candidates[currentIndex];
  const hasValidImage = currentIndex < candidates.length && currentSrc;

  const handleImageError = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const isBot = type === 'anibot';
  const isPart = type === 'part';

  return (
    <div
      className={`relative w-full ${aspectRatio} overflow-hidden border border-border bg-surface flex items-center justify-center group/img`}
    >
      {/* Subtle Architectural Corner Ticks */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-muted/50 z-10 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-muted/50 z-10 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-muted/50 z-10 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-muted/50 z-10 pointer-events-none" />

      {hasValidImage ? (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 100vw"
          className={`${
            objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'
          } group-hover/img:scale-[1.02] transition-transform duration-300`}
          onError={handleImageError}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-4 z-10 font-mono">
          {type === 'chip' ? (
            <span
              className="w-3 h-3 rounded-full animate-diode mb-2 inline-block"
              style={{
                backgroundColor: diodeColor,
                boxShadow: `0 0 8px ${diodeColor}`,
              }}
            />
          ) : (
            <span className="w-2.5 h-2.5 bg-accent mb-2 inline-block" />
          )}
          <span className="text-[11px] text-foreground font-semibold uppercase tracking-wider">
            {isBot ? 'CHASSIS SCHEMATIC' : isPart ? 'SOCKET BLUEPRINT' : 'ENGRAM MATRIX'}
          </span>
          <span className="text-[10px] text-muted mt-0.5 uppercase tracking-widest">
            [{id || 'ASSET PENDING'}]
          </span>
        </div>
      )}
    </div>
  );
};
