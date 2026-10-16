'use client';

import React from 'react';
import { playSelectSound } from '../../utils/audio';
import { ItemImage } from './ItemImage';

export const ChipCard = ({ chip, onSelect }) => {
  const handleClick = () => {
    playSelectSound();
    onSelect(chip);
  };

  const diodeColor = chip.diode_color || '#D9381E';

  return (
    <div
      onClick={handleClick}
      className="p-6 border-r border-b border-border bg-background hover:bg-surface/60 transition-colors cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Diode Indicator & Series */}
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-diode inline-block shrink-0"
              style={{
                backgroundColor: diodeColor,
                boxShadow: `0 0 8px ${diodeColor}`,
              }}
            />
            <span className="text-foreground font-bold uppercase tracking-wider truncate">
              {chip.personality_engram || 'AI CORE'}
            </span>
          </div>

          <span className="px-2 py-0.5 bg-surface border border-border text-foreground text-[11px] uppercase shrink-0">
            {chip.series}
          </span>
        </div>

        {/* Schematic Image */}
        <div className="mb-4">
          <ItemImage
            id={chip.id}
            name={chip.name}
            src={chip.image}
            alt={chip.name}
            type="chip"
            diodeColor={diodeColor}
            aspectRatio="aspect-video"
          />
        </div>

        {/* Name & Affinity */}
        <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
          {chip.name}
        </h3>
        <div className="font-mono text-[11px] text-accent uppercase tracking-wider mt-0.5 mb-3">
          {chip.affinity} AFFINITY // VOICE: {chip.voice_gender}
        </div>

        {/* Quote Block */}
        {chip.quote && (
          <div className="p-3 bg-surface border border-border text-xs italic text-muted mb-4 line-clamp-2">
            &quot;{chip.quote}&quot;
          </div>
        )}

        {/* Passive Trait Preview */}
        {chip.passive_trait && (
          <div className="font-mono text-xs mb-4">
            <span className="text-muted uppercase text-[10px] block">PASSIVE TRAIT</span>
            <span className="text-foreground font-semibold">{chip.passive_trait.name}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-border flex items-center justify-between font-mono text-[11px] text-muted">
        <div>
          ACC: <span className="text-foreground font-semibold">{chip.base_stats?.target_accuracy}%</span>
          {' • '}
          HP: <span className="text-foreground font-semibold">+{chip.base_stats?.integrity || 0}</span>
        </div>

        <span className="text-accent font-semibold uppercase">
          {chip.ultimate_abilities?.length || 0} ULTS →
        </span>
      </div>
    </div>
  );
};
