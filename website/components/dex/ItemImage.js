'use client';

import React, { useState, useEffect } from 'react';
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const hasValidImage = Boolean(src) && !hasError;

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
          src={src}
          alt={alt || name || id || 'Item image'}
          fill
          sizes="(max-width: 768px) 100vw, 100vw"
          className={`${
            objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'
          } group-hover/img:scale-[1.02] transition-transform duration-300`}
          onError={() => setHasError(true)}
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
            No Image Available
          </span>
          <span className="text-[10px] text-muted mt-0.5 uppercase tracking-widest">
            [{isBot ? 'CHASSIS SCHEMATIC' : isPart ? 'SOCKET BLUEPRINT' : 'ENGRAM MATRIX'}]
          </span>
        </div>
      )}
    </div>
  );
};
