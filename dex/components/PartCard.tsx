'use client';

import React from 'react';
import { ModularPart, PartSlotType } from '../types/dex';
import { playSelectSound } from '../utils/audio';
import { ItemImage } from './ItemImage';

interface PartCardProps {
  part: ModularPart;
  onSelect: (part: ModularPart) => void;
  onSelectBot?: (botId: string) => void;
}

const getSlotStyle = (slot: PartSlotType) => {
  switch (slot) {
    case 'HEAD':
      return {
        label: 'HEAD',
        bg: 'bg-purple-950/80',
        text: 'text-purple-300',
        border: 'border-purple-700/60',
        glow: 'from-purple-500/30 via-purple-400 to-purple-600/30',
        borderHover: 'hover:border-purple-500/50',
      };
    case 'TORSO':
      return {
        label: 'TORSO',
        bg: 'bg-sky-950/80',
        text: 'text-sky-300',
        border: 'border-sky-700/60',
        glow: 'from-sky-500/30 via-sky-400 to-sky-600/30',
        borderHover: 'hover:border-sky-500/50',
      };
    case 'LEFT_ARM':
      return {
        label: 'LEFT ARM',
        bg: 'bg-amber-950/80',
        text: 'text-amber-300',
        border: 'border-amber-700/60',
        glow: 'from-amber-500/30 via-amber-400 to-amber-600/30',
        borderHover: 'hover:border-amber-500/50',
      };
    case 'RIGHT_ARM':
      return {
        label: 'RIGHT ARM',
        bg: 'bg-amber-950/80',
        text: 'text-amber-300',
        border: 'border-amber-700/60',
        glow: 'from-amber-500/30 via-amber-400 to-amber-600/30',
        borderHover: 'hover:border-amber-500/50',
      };
    case 'LEGS':
      return {
        label: 'LEGS',
        bg: 'bg-emerald-950/80',
        text: 'text-emerald-300',
        border: 'border-emerald-700/60',
        glow: 'from-emerald-500/30 via-emerald-400 to-emerald-600/30',
        borderHover: 'hover:border-emerald-500/50',
      };
    default:
      return {
        label: slot,
        bg: 'bg-slate-900',
        text: 'text-slate-300',
        border: 'border-slate-700',
        glow: 'from-slate-500/30 via-slate-400 to-slate-600/30',
        borderHover: 'hover:border-slate-500/50',
      };
  }
};

export const PartCard: React.FC<PartCardProps> = ({ part, onSelect, onSelectBot }) => {
  const slotStyle = getSlotStyle(part.slot);

  const handleCardClick = () => {
    playSelectSound();
    onSelect(part);
  };

  const handleBotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectBot && part.botId) {
      playSelectSound();
      onSelectBot(part.botId);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`cyber-panel cyber-panel-hover rounded-xl p-4 cursor-pointer relative flex flex-col justify-between group overflow-hidden border border-slate-800 bg-slate-900/70 ${slotStyle.borderHover}`}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${slotStyle.glow} transition-colors`}
      ></div>

      <div>
        {/* Slot & Type Badges */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${slotStyle.bg} ${slotStyle.text} ${slotStyle.border} tracking-wider`}
          >
            {slotStyle.label}
          </span>
          <span className="font-mono text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 uppercase">
            {part.type}
          </span>
        </div>

        {/* Blueprint Display Slot */}
        <div className="mb-3">
          <ItemImage
            id={part.id}
            name={part.name}
            alt={part.name}
            type="part"
            aspectRatio="aspect-video"
          />
        </div>

        {/* Part Name */}
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mb-0.5">
          {part.name}
        </h3>

        {/* Parent AniBot Link */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <button
            onClick={handleBotClick}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 text-left"
            title="Inspect parent frame"
          >
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60 font-semibold">
              {part.botModelCode}
            </span>
            <span className="line-clamp-1">{part.botName}</span>
          </button>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-3 font-mono text-[11px]">
          <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/80 text-center">
            <span className="block text-[9px] text-slate-400">INTEGRITY</span>
            <span className="text-amber-400 font-bold">{part.integrity}</span>
          </div>

          {/* Slot-specific stats */}
          {part.slot === 'TORSO' ? (
            <>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/80 text-center">
                <span className="block text-[9px] text-slate-400">FIREWALL</span>
                <span className="text-cyan-400 font-bold">{part.firewall ?? '-'}</span>
              </div>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/80 text-center">
                <span className="block text-[9px] text-slate-400">COOLING</span>
                <span className="text-emerald-400 font-bold">{part.cooling ?? '-'}</span>
              </div>
            </>
          ) : part.slot === 'LEGS' ? (
            <>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/80 text-center">
                <span className="block text-[9px] text-slate-400">CLOCK SPD</span>
                <span className="text-cyan-400 font-bold">{part.clock_speed ?? '-'}</span>
              </div>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/80 text-center">
                <span className="block text-[9px] text-slate-400">EVASION</span>
                <span className="text-emerald-400 font-bold">{part.packet_loss ?? 0}%</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/80 text-center">
                <span className="block text-[9px] text-slate-400">PAYLOAD</span>
                <span className="text-rose-400 font-bold">{part.payload ?? 0}</span>
              </div>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/80 text-center">
                <span className="block text-[9px] text-slate-400">WEIGHT</span>
                <span className="text-slate-300 font-bold">{part.weight ?? '-'}</span>
              </div>
            </>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {part.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-[10px] text-slate-500 uppercase">
          {part.series} • {part.affinity}
        </span>
        <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform text-[11px] font-semibold flex items-center gap-1">
          <span>BLUEPRINT</span>
          <span>→</span>
        </span>
      </div>
    </div>
  );
};
