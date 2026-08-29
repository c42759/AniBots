'use client';

import React from 'react';
import { AnimaChip } from '../types/dex';
import { playSelectSound } from '../utils/audio';
import { ItemImage } from './ItemImage';

interface ChipCardProps {
  chip: AnimaChip;
  onSelect: (chip: AnimaChip) => void;
}

export const ChipCard: React.FC<ChipCardProps> = ({ chip, onSelect }) => {
  const handleClick = () => {
    playSelectSound();
    onSelect(chip);
  };

  const diodeColor = chip.diode_color || '#00f0ff';

  return (
    <div
      onClick={handleClick}
      className="cyber-panel cyber-panel-hover rounded-xl p-4 cursor-pointer relative flex flex-col justify-between group overflow-hidden border border-slate-800 bg-slate-900/70 hover:border-cyan-500/50"
    >
      {/* Diode Top Border Accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${diodeColor}33, ${diodeColor}, ${diodeColor}33)`,
        }}
      ></div>

      <div>
        {/* Diode Indicator & Series */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full animate-diode inline-block"
              style={{
                backgroundColor: diodeColor,
                boxShadow: `0 0 10px ${diodeColor}`,
              }}
            ></span>
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {chip.personality_engram || 'AI CORE'}
            </span>
          </div>

          <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wide">
            {chip.series}
          </span>
        </div>

        {/* Image Display Slot */}
        <div className="mb-3">
          <ItemImage
            src={chip.image}
            defaultPath={`/images/chips/${chip.id}.png`}
            alt={chip.name}
            type="chip"
            diodeColor={diodeColor}
            aspectRatio="aspect-video"
          />
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-1">
          {chip.name}
        </h3>

        {/* Affinity & Voice Gender */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            {chip.affinity} AFFINITY
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            VOICE: {chip.voice_gender}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
            HP +{chip.base_stats?.integrity || 0}
          </span>
        </div>

        {/* Quote Card */}
        {chip.quote && (
          <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-xs italic text-slate-300 mb-2.5 line-clamp-2">
            "{chip.quote}"
          </div>
        )}

        {/* Passive Trait Preview */}
        {chip.passive_trait && (
          <div className="text-xs text-slate-400 mb-2.5">
            <span className="text-amber-400 font-semibold font-mono">TRAIT: </span>
            <span className="text-slate-300 font-medium">{chip.passive_trait.name}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1 text-slate-400">
          <span>ACC:</span>
          <span className="text-cyan-400 font-semibold">{chip.base_stats?.target_accuracy}%</span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <span>⚡ {chip.ultimate_abilities?.length || 0} ULTS</span>
        </div>
      </div>
    </div>
  );
};
