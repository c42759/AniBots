'use client';

import React from 'react';
import { AniBot } from '../types/dex';
import { playSelectSound } from '../utils/audio';
import { ItemImage } from './ItemImage';

interface AniBotCardProps {
  bot: AniBot;
  onSelect: (bot: AniBot) => void;
  onSelectChip?: (chipId: string) => void;
}

export const AniBotCard: React.FC<AniBotCardProps> = ({ bot, onSelect, onSelectChip }) => {
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

  const handleChipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectChip && bot.preferred_chip) {
      playSelectSound();
      onSelectChip(bot.preferred_chip);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="cyber-panel cyber-panel-hover rounded-xl p-4 cursor-pointer relative flex flex-col justify-between group overflow-hidden border border-slate-800 bg-slate-900/70 hover:border-amber-500/50"
    >
      {/* Decorative top border glow bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 via-amber-400 to-amber-600/40 group-hover:from-amber-400 group-hover:to-yellow-300 transition-colors"></div>

      <div>
        {/* Model Code & Series */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 tracking-wider">
            {bot.model_code}
          </span>
          <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wide">
            {bot.series}
          </span>
        </div>

        {/* Image Display Slot */}
        <div className="mb-3">
          <ItemImage
            id={bot.id}
            name={bot.name}
            src={bot.image}
            alt={bot.name}
            type="anibot"
            aspectRatio="aspect-video"
          />
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-0.5">
          {bot.name}
        </h3>

        {/* Archetype */}
        <p className="text-xs text-slate-400 mb-2.5 line-clamp-1 italic font-sans">
          {bot.archetype}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            {bot.affinity} AFFINITY
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            HP {totalIntegrity}
          </span>
          {totalWeight > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              WT {totalWeight}
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {bot.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>PARTS:</span>
          <span className="text-amber-400 font-semibold">5/5</span>
        </div>

        {bot.preferred_chip && (
          <button
            onClick={handleChipClick}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 border border-cyan-900/60 text-[11px] transition-colors"
          >
            <span>💾 CORE CHIP</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};
