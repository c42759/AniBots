'use client';

import React from 'react';
import { playSelectSound } from '../../utils/audio';
import { ItemImage } from './ItemImage';

const SLOT_CODE_MAP = {
  HEAD: 'SLT-01 // HEAD',
  TORSO: 'SLT-02 // TORSO',
  LEFT_ARM: 'SLT-03 // LEFT ARM',
  RIGHT_ARM: 'SLT-04 // RIGHT ARM',
  LEGS: 'SLT-05 // LEGS',
};

export const PartCard = ({ part, onSelect, onSelectBot }) => {
  const handleCardClick = () => {
    playSelectSound();
    onSelect(part);
  };

  const handleBotClick = (e) => {
    e.stopPropagation();
    if (onSelectBot && part.botId) {
      playSelectSound();
      onSelectBot(part.botId);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-6 border-r border-b border-border bg-background hover:bg-surface/60 transition-colors cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Slot & Type Header */}
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-4">
          <span className="text-accent font-bold uppercase tracking-wider">
            {SLOT_CODE_MAP[part.slot] || part.slot}
          </span>
          <span className="px-2 py-0.5 bg-surface border border-border text-foreground text-[11px] uppercase">
            {part.type}
          </span>
        </div>

        {/* Blueprint Image */}
        <div className="mb-4">
          <ItemImage
            id={part.id}
            name={part.name}
            alt={part.name}
            type="part"
            aspectRatio="aspect-video"
          />
        </div>

        {/* Part Name */}
        <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
          {part.name}
        </h3>

        {/* Parent Bot Button */}
        <div className="mt-1 mb-3">
          <button
            type="button"
            onClick={handleBotClick}
            className="font-mono text-[11px] text-muted hover:text-accent uppercase tracking-wider flex items-center gap-1.5 text-left transition-colors cursor-pointer"
            title="Inspect parent frame"
          >
            <span className="text-foreground font-semibold">[{part.botModelCode}]</span>
            <span className="truncate">{part.botName}</span>
          </button>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-3 border-t border-l border-border font-mono text-[11px] mb-4">
          <div className="p-2 border-r border-b border-border bg-surface/40">
            <span className="block text-[9px] text-muted uppercase">INTEGRITY</span>
            <span className="text-foreground font-semibold">{part.integrity}</span>
          </div>

          {part.slot === 'TORSO' ? (
            <>
              <div className="p-2 border-r border-b border-border bg-surface/40">
                <span className="block text-[9px] text-muted uppercase">FIREWALL</span>
                <span className="text-foreground font-semibold">{part.firewall ?? '-'}</span>
              </div>
              <div className="p-2 border-r border-b border-border bg-surface/40">
                <span className="block text-[9px] text-muted uppercase">COOLING</span>
                <span className="text-foreground font-semibold">{part.cooling ?? '-'}</span>
              </div>
            </>
          ) : part.slot === 'LEGS' ? (
            <>
              <div className="p-2 border-r border-b border-border bg-surface/40">
                <span className="block text-[9px] text-muted uppercase">CLOCK SPD</span>
                <span className="text-foreground font-semibold">{part.clock_speed ?? '-'}</span>
              </div>
              <div className="p-2 border-r border-b border-border bg-surface/40">
                <span className="block text-[9px] text-muted uppercase">EVASION</span>
                <span className="text-foreground font-semibold">{part.packet_loss ?? 0}%</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 border-r border-b border-border bg-surface/40">
                <span className="block text-[9px] text-muted uppercase">PAYLOAD</span>
                <span className="text-foreground font-semibold">{part.payload ?? 0}</span>
              </div>
              <div className="p-2 border-r border-b border-border bg-surface/40">
                <span className="block text-[9px] text-muted uppercase">WEIGHT</span>
                <span className="text-foreground font-semibold">{part.weight ?? '-'}</span>
              </div>
            </>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-4">
          {part.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-border flex items-center justify-between font-mono text-[11px] text-muted">
        <span className="uppercase">
          {part.series} • {part.affinity}
        </span>
        <span className="text-foreground group-hover:text-accent font-semibold uppercase transition-colors">
          SPEC SHEET →
        </span>
      </div>
    </div>
  );
};
