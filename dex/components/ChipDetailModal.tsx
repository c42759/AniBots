'use client';

import React, { useEffect } from 'react';
import { AnimaChip, AniBot } from '../types/dex';
import { playBeep, playSelectSound } from '../utils/audio';
import { ItemImage } from './ItemImage';

interface ChipDetailModalProps {
  chip: AnimaChip | null;
  allBots: AniBot[];
  onClose: () => void;
  onSelectBot?: (bot: AniBot) => void;
}

export const ChipDetailModal: React.FC<ChipDetailModalProps> = ({
  chip,
  allBots,
  onClose,
  onSelectBot,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!chip) return null;

  const diodeColor = chip.diode_color || '#00f0ff';

  // Find AniBots that prefer this chip
  const compatibleBots = allBots.filter(
    (b) => b.preferred_chip?.toLowerCase() === chip.id?.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        style={{ borderColor: `${diodeColor}66` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Diode Accent Bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(to right, ${diodeColor}22, ${diodeColor}, ${diodeColor}22)`,
          }}
        ></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full animate-diode shrink-0"
              style={{
                backgroundColor: diodeColor,
                boxShadow: `0 0 12px ${diodeColor}`,
              }}
            ></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                {chip.name}
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                {chip.personality_engram} • {chip.series} SERIES
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playBeep(350, 0.04);
              onClose();
            }}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Visual Image & Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Dedicated Hero Chip Core Image Slot */}
            <div className="md:col-span-5">
              <ItemImage
                src={chip.image}
                defaultPath={`/images/chips/${chip.id}.png`}
                alt={chip.name}
                type="chip"
                diodeColor={diodeColor}
                aspectRatio="aspect-square"
                size="lg"
              />
            </div>

            {/* Quote & Personality Column */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  PERSONALITY &amp; VOICE ENGRAM
                </div>
                <p className="text-sm text-slate-200">{chip.personality}</p>

                {chip.quote && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 italic text-cyan-200 text-xs leading-relaxed">
                    "{chip.quote}"
                  </div>
                )}
              </div>

              {/* Core Specs Box */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs grid grid-cols-2 gap-2">
                <div>
                  <div className="text-slate-400">DIODE SPECTRUM:</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-4 h-4 rounded border border-white/20"
                      style={{ backgroundColor: diodeColor }}
                    ></span>
                    <span className="font-bold text-slate-100">{diodeColor}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">TARGET PRIORITY:</div>
                  <div className="text-amber-400 font-semibold mt-1">{chip.target_priority}</div>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">VOICE STYLE: </span>
                  <span className="text-slate-200 font-sans">{chip.voice_style}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Base Stats Gauges */}
          {chip.base_stats && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-mono text-slate-400 font-bold mb-4 uppercase tracking-wider">
                BASE CORE STATS &amp; OVERCLOCK PARAMETERS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Integrity */}
                <StatBar
                  label="INTEGRITY (HP)"
                  value={chip.base_stats.integrity}
                  max={300}
                  color="#d4af37"
                />
                {/* Target Accuracy */}
                <StatBar
                  label="ACCURACY"
                  value={chip.base_stats.target_accuracy}
                  max={100}
                  unit="%"
                  color="#00f0ff"
                />
                {/* Evasion */}
                <StatBar
                  label="EVASION"
                  value={chip.base_stats.evasion}
                  max={50}
                  unit="%"
                  color="#10b981"
                />
                {/* Overclock Charge */}
                <StatBar
                  label="OVERCLOCK RATE"
                  value={chip.base_stats.overclock_charge_rate}
                  max={2.0}
                  unit="x"
                  color="#ff007f"
                />
              </div>
            </div>
          )}

          {/* Passive Trait */}
          {chip.passive_trait && (
            <div className="bg-gradient-to-br from-amber-950/30 to-slate-900 p-4 rounded-xl border border-amber-900/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm">✨</span>
                <h3 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider">
                  PASSIVE TRAIT: {chip.passive_trait.name}
                </h3>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {chip.passive_trait.description}
              </p>
            </div>
          )}

          {/* Ultimate Abilities */}
          {chip.ultimate_abilities && chip.ultimate_abilities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                ULTIMATE ABILITIES ({chip.ultimate_abilities.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chip.ultimate_abilities.map((ability) => (
                  <div
                    key={ability.skill_id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-cyan-300">{ability.name}</span>
                      <span className="font-mono text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded">
                        LVL {ability.unlock_level}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                      <span>COST: <strong className="text-cyan-400">{ability.gauge_cost} GAUGE</strong></span>
                      <span>•</span>
                      <span>POWER: <strong className="text-amber-400">{ability.power}</strong></span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ability.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatible AniBot Frames */}
          {compatibleBots.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                OPTIMIZED PREFERRED ANIBOTS ({compatibleBots.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {compatibleBots.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      if (onSelectBot) {
                        playSelectSound();
                        onSelectBot(b);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/80 border border-amber-800/60 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>🤖 {b.name} ({b.model_code})</span>
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>ANIDEX CORE SCHEMATIC</span>
          <button
            onClick={() => {
              playBeep(350, 0.04);
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBar: React.FC<{
  label: string;
  value: number;
  max: number;
  unit?: string;
  color: string;
}> = ({ label, value, max, unit = '', color }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
      <div className="flex justify-between text-[10px] font-mono text-slate-400">
        <span>{label}</span>
        <span className="font-bold text-white">
          {value}
          {unit}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};
