'use client';

import React, { useEffect, useState } from 'react';
import { AniBot } from '../types/dex';
import { playBeep, playSelectSound } from '../utils/audio';
import { ItemImage } from './ItemImage';

interface AniBotDetailModalProps {
  bot: AniBot | null;
  onClose: () => void;
  onSelectChip?: (chipId: string) => void;
}

export const AniBotDetailModal: React.FC<AniBotDetailModalProps> = ({
  bot,
  onClose,
  onSelectChip,
}) => {
  const [activePartTab, setActivePartTab] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!bot) return null;

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

  const totalPayload =
    (bot.parts?.head?.payload || 0) +
    (bot.parts?.left_arm?.payload || 0) +
    (bot.parts?.right_arm?.payload || 0);

  const handleChipNavigation = () => {
    if (bot.preferred_chip && onSelectChip) {
      playSelectSound();
      onSelectChip(bot.preferred_chip);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded border border-amber-800">
              {bot.model_code}
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {bot.name}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                {bot.series} SERIES • {bot.affinity} AFFINITY
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
            {/* Dedicated Hero Image Display Slot */}
            <div className="md:col-span-5">
              <ItemImage
                src={bot.image}
                defaultPath={`/images/anibots/${bot.id}.png`}
                alt={bot.name}
                type="anibot"
                aspectRatio="aspect-square"
                size="lg"
              />
            </div>

            {/* Archetype & Description Column */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
                  ARCHETYPE: {bot.archetype}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{bot.description}</p>
              </div>

              {/* Affinity Synergy & Preferred Chip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Affinity Synergy */}
                <div className="bg-gradient-to-br from-amber-950/30 to-slate-900 p-3.5 rounded-xl border border-amber-900/40">
                  <div className="text-xs font-mono font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <span>⚡ SYNERGY</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-normal">
                    {bot.affinity_synergy_bonus}
                  </p>
                </div>

                {/* Preferred Core Chip Link */}
                <div className="bg-gradient-to-br from-cyan-950/30 to-slate-900 p-3.5 rounded-xl border border-cyan-900/40 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                      <span>💾 CORE CHIP</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">
                      {bot.preferred_chip ? bot.preferred_chip.toUpperCase() : 'NONE'}
                    </p>
                  </div>

                  {bot.preferred_chip && (
                    <button
                      onClick={handleChipNavigation}
                      className="mt-2 w-full py-1.5 px-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <span>VIEW SPECS</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Combat Totals Bar */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-mono text-slate-400 font-bold mb-3 uppercase tracking-wider">
              TOTAL FRAME INTEGRITY &amp; STATS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">TOTAL HP</div>
                <div className="text-lg font-bold text-amber-400">{totalIntegrity}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">PAYLOAD POWER</div>
                <div className="text-lg font-bold text-cyan-400">{totalPayload}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">FRAME WEIGHT</div>
                <div className="text-lg font-bold text-slate-200">{totalWeight}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">COOLING RATE</div>
                <div className="text-lg font-bold text-emerald-400">
                  {bot.parts?.torso?.cooling || 0}/s
                </div>
              </div>
            </div>
          </div>

          {/* Parts Section Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-mono font-bold text-amber-400 tracking-wider">
                PARTS BREAKDOWN (5 SLOTS)
              </h3>
              <div className="flex gap-1">
                {['all', 'head', 'torso', 'arms', 'legs'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      playBeep(800, 0.02);
                      setActivePartTab(tab);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded uppercase transition-colors ${
                      activePartTab === tab
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Parts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* HEAD */}
              {(activePartTab === 'all' || activePartTab === 'head') && bot.parts?.head && (
                <PartCard title="HEAD" part={bot.parts.head} accentColor="border-amber-500/40" />
              )}

              {/* TORSO */}
              {(activePartTab === 'all' || activePartTab === 'torso') && bot.parts?.torso && (
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      TORSO: {bot.parts.torso.name}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {bot.parts.torso.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{bot.parts.torso.description}</p>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[9px] text-slate-400">INTEGRITY</div>
                      <div className="text-amber-400 font-bold">{bot.parts.torso.integrity}</div>
                    </div>
                    {bot.parts.torso.firewall !== undefined && (
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400">FIREWALL</div>
                        <div className="text-cyan-400 font-bold">{bot.parts.torso.firewall}</div>
                      </div>
                    )}
                    {bot.parts.torso.cooling !== undefined && (
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400">COOLING</div>
                        <div className="text-emerald-400 font-bold">
                          {bot.parts.torso.cooling}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LEFT ARM */}
              {(activePartTab === 'all' || activePartTab === 'arms') && bot.parts?.left_arm && (
                <PartCard
                  title="LEFT ARM"
                  part={bot.parts.left_arm}
                  accentColor="border-cyan-500/40"
                />
              )}

              {/* RIGHT ARM */}
              {(activePartTab === 'all' || activePartTab === 'arms') && bot.parts?.right_arm && (
                <PartCard
                  title="RIGHT ARM"
                  part={bot.parts.right_arm}
                  accentColor="border-cyan-500/40"
                />
              )}

              {/* LEGS */}
              {(activePartTab === 'all' || activePartTab === 'legs') && bot.parts?.legs && (
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      LEGS: {bot.parts.legs.name}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {bot.parts.legs.protocol || bot.parts.legs.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{bot.parts.legs.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-center">
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[9px] text-slate-400">INTEGRITY</div>
                      <div className="text-amber-400 font-bold">{bot.parts.legs.integrity}</div>
                    </div>
                    {bot.parts.legs.clock_speed !== undefined && (
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400">CLOCK SPEED</div>
                        <div className="text-cyan-400 font-bold">
                          {bot.parts.legs.clock_speed} GHz
                        </div>
                      </div>
                    )}
                    {bot.parts.legs.direct_connect !== undefined && (
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400">DIRECT CONNECT</div>
                        <div className="text-emerald-400 font-bold">
                          +{bot.parts.legs.direct_connect}%
                        </div>
                      </div>
                    )}
                    {bot.parts.legs.packet_loss !== undefined && (
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400">PACKET LOSS</div>
                        <div className="text-purple-400 font-bold">
                          {bot.parts.legs.packet_loss}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>ANIDEX TACTICAL SCHEMATIC</span>
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

const PartCard: React.FC<{
  title: string;
  part: {
    name: string;
    type: string;
    description: string;
    integrity: number;
    payload?: number;
    precision?: number;
    execution_time?: number;
    weight?: number;
  };
  accentColor?: string;
}> = ({ title, part }) => (
  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
      <span className="font-mono text-xs font-bold text-amber-400">
        {title}: {part.name}
      </span>
      <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
        {part.type}
      </span>
    </div>
    <p className="text-xs text-slate-300">{part.description}</p>
    <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
        <div className="text-[9px] text-slate-400">INTEGRITY</div>
        <div className="text-amber-400 font-bold">{part.integrity}</div>
      </div>
      {part.payload !== undefined && (
        <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
          <div className="text-[9px] text-slate-400">PAYLOAD</div>
          <div className="text-cyan-400 font-bold">{part.payload}</div>
        </div>
      )}
      {part.precision !== undefined && (
        <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
          <div className="text-[9px] text-slate-400">PRECISION</div>
          <div className="text-emerald-400 font-bold">{part.precision}%</div>
        </div>
      )}
      {part.weight !== undefined && (
        <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
          <div className="text-[9px] text-slate-400">WEIGHT</div>
          <div className="text-slate-300 font-bold">{part.weight}</div>
        </div>
      )}
    </div>
  </div>
);
