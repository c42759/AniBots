'use client';

import React from 'react';
import { playSelectSound } from '../../utils/audio';
import { ItemImage } from './ItemImage';

export const AniBotCard = ({ bot, onSelect, onSelectChip }) => {
  const totalIntegrity =
    (bot.parts?.head?.integrity || 0) +
    (bot.parts?.torso?.integrity || 0) +
    (bot.parts?.left_arm?.integrity || 0) +
    (bot.parts?.right_arm?.integrity || 0) +
    (bot.parts?.legs?.integrity || 0);

  const totalWeight =
    (bot.parts?.head?.weight || 0) +
    (bot.parts?.left_arm?.weight || 0) +
    (bot.parts?.right_arm?.weight || 0);

  const handleCardClick = () => {
    playSelectSound();
    onSelect(bot);
  };

  const handleChipClick = (e) => {
    e.stopPropagation();
    if (onSelectChip && bot.preferred_chip) {
      playSelectSound();
      onSelectChip(bot.preferred_chip);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-6 border-r border-b border-border bg-background hover:bg-surface/60 transition-colors cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Metadata Row */}
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-4">
          <span className="text-foreground font-bold tracking-wider">
            {bot.model_code}
          </span>
          <span className="px-2 py-0.5 bg-surface border border-border text-foreground text-[11px] uppercase">
            {bot.series}
          </span>
        </div>

        {/* Schematic Image */}
        <div className="mb-4">
          <ItemImage
            id={bot.id}
            name={bot.name}
            src={bot.image}
            alt={bot.name}
            type="anibot"
            aspectRatio="aspect-video"
          />
        </div>

        {/* Name & Archetype */}
        <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
          {bot.name}
        </h3>
        <div className="font-mono text-[11px] text-accent uppercase tracking-wider mt-0.5 mb-3 line-clamp-1">
          {bot.archetype}
        </div>

        {/* Description */}
        <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-4">
          {bot.description}
        </p>

        {/* Key Stat Strip */}
        <div className="grid grid-cols-3 border-t border-l border-border font-mono text-[11px] mb-4">
          <div className="p-2 border-r border-b border-border bg-surface/40">
            <span className="block text-[9px] text-muted uppercase">INTEGRITY</span>
            <span className="text-foreground font-semibold">{totalIntegrity} HP</span>
          </div>
          <div className="p-2 border-r border-b border-border bg-surface/40">
            <span className="block text-[9px] text-muted uppercase">WEIGHT</span>
            <span className="text-foreground font-semibold">{totalWeight || '-'}</span>
          </div>
          <div className="p-2 border-r border-b border-border bg-surface/40">
            <span className="block text-[9px] text-muted uppercase">AFFINITY</span>
            <span className="text-foreground font-semibold truncate block">{bot.affinity}</span>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="pt-3 border-t border-border flex items-center justify-between font-mono text-[11px] text-muted">
        <span>5-PART CHASSIS</span>
        {bot.preferred_chip ? (
          <button
            type="button"
            onClick={handleChipClick}
            className="text-foreground hover:text-accent font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            CORE: {bot.preferred_chip.replace(/^chip[_\-]/i, '')} →
          </button>
        ) : (
          <span className="text-foreground font-medium">INSPECT →</span>
        )}
      </div>
    </div>
  );
};
