'use client';

import React, { useEffect } from 'react';
import { ModularPart } from '../types/dex';
import { playBeep, playSelectSound } from '../utils/audio';
import { ItemImage } from './ItemImage';

interface PartDetailModalProps {
  part: ModularPart | null;
  onClose: () => void;
  onSelectBot?: (botId: string) => void;
}

export const PartDetailModal: React.FC<PartDetailModalProps> = ({
  part,
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

  if (!part) return null;

  const handleBotNavigation = () => {
    if (part.botId && onSelectBot) {
      playSelectSound();
      onSelectBot(part.botId);
      onClose();
    }
  };

  const getSlotRoleExplanation = (slot: string) => {
    switch (slot) {
      case 'HEAD':
        return 'Tactical burst & utility slot. Finite cache charges per combat match. System Failure win-condition: reaching 0 Head HP causes robot shutdown.';
      case 'TORSO':
        return 'The central motherboard and chassis armor. Provides firewall damage reduction, heat cooling, and weight loadout capacity.';
      case 'LEFT_ARM':
      case 'RIGHT_ARM':
        return 'Active combat arm. Executes melee strikes, ballistic fire, shields, or support buffs. Infinite standard usage with sprint execution & latency cooldown.';
      case 'LEGS':
        return 'Propulsion platform. Dictates ATB gauge recharge velocity, evasion friction, combat range multipliers, and terrain adaptation.';
      default:
        return 'Modular cybernetic component.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-500/10 flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              {part.slot.replace('_', ' ')}
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {part.name}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                TYPE: {part.type} • ID: {part.id}
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
          {/* Blueprint Image Display */}
          <div className="w-full">
            <ItemImage
              id={part.id}
              name={part.name}
              alt={part.name}
              type="part"
              aspectRatio="aspect-video sm:aspect-[21/9]"
            />
          </div>

          {/* Parent Bot Banner */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">
                MOUNTED FRAME
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                  {part.botModelCode}
                </span>
                <span className="text-base font-bold text-slate-100">{part.botName}</span>
                <span className="text-xs font-mono text-slate-400">({part.series} SERIES)</span>
              </div>
            </div>

            <button
              onClick={handleBotNavigation}
              className="px-3.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <span>INSPECT FRAME</span>
              <span>→</span>
            </button>
          </div>

          {/* Telemetry Stat Gauges */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span>📊 PART TELEMETRY SPECIFICATIONS</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block mb-1">INTEGRITY (HP)</span>
                <span className="text-xl font-black text-amber-400">{part.integrity}</span>
              </div>

              {part.slot === 'TORSO' ? (
                <>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">FIREWALL</span>
                    <span className="text-xl font-black text-cyan-400">
                      {part.firewall ?? '0'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">COOLING</span>
                    <span className="text-xl font-black text-emerald-400">
                      {part.cooling ?? '0'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">MAX LOADOUT</span>
                    <span className="text-xl font-black text-purple-400">
                      {part.max_loadout ?? '0'}
                    </span>
                  </div>
                </>
              ) : part.slot === 'LEGS' ? (
                <>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">CLOCK SPEED</span>
                    <span className="text-xl font-black text-cyan-400">
                      {part.clock_speed ?? '0'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">PACKET LOSS</span>
                    <span className="text-xl font-black text-emerald-400">
                      {part.packet_loss ?? 0}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">PROTOCOL</span>
                    <span className="text-sm font-bold text-amber-300">
                      {part.protocol || part.type}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">PAYLOAD</span>
                    <span className="text-xl font-black text-rose-400">
                      {part.payload ?? 0}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">PRECISION</span>
                    <span className="text-xl font-black text-cyan-400">
                      {part.precision ? `${part.precision}%` : '-'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">WEIGHT</span>
                    <span className="text-xl font-black text-slate-200">
                      {part.weight ?? '-'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Extra timing / scaling row for combat parts */}
            {(part.execution_time !== undefined ||
              part.latency !== undefined ||
              part.cache !== undefined ||
              part.direct_connect !== undefined ||
              part.remote_uplink !== undefined) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
                {part.execution_time !== undefined && (
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">EXECUTION TIME</span>
                    <span className="text-slate-100 font-bold">{part.execution_time}s</span>
                  </div>
                )}
                {part.latency !== undefined && (
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">LATENCY COOLDOWN</span>
                    <span className="text-slate-100 font-bold">{part.latency}s</span>
                  </div>
                )}
                {part.cache !== undefined && part.cache > 0 && (
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">CACHE AMMO</span>
                    <span className="text-purple-400 font-bold">{part.cache} uses</span>
                  </div>
                )}
                {part.direct_connect !== undefined && (
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">DIRECT CONNECT</span>
                    <span className="text-amber-400 font-bold">
                      {part.direct_connect > 0 ? `+${part.direct_connect}%` : `${part.direct_connect}%`}
                    </span>
                  </div>
                )}
                {part.remote_uplink !== undefined && (
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">REMOTE UPLINK</span>
                    <span className="text-cyan-400 font-bold">
                      {part.remote_uplink > 0 ? `+${part.remote_uplink}%` : `${part.remote_uplink}%`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description & Tactical Notes */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider block">
              DESCRIPTION &amp; TACTICAL NOTES
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">{part.description}</p>
            <div className="pt-2 text-xs text-slate-400 font-mono border-t border-slate-800/80">
              💡 <span className="font-semibold text-slate-300">Slot Mechanics:</span>{' '}
              {getSlotRoleExplanation(part.slot)}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between font-mono text-xs text-slate-400">
          <span>PART SCHEMATIC SECURE</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
