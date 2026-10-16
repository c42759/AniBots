'use client';

import React, { useEffect } from 'react';
import { playBeep, playSelectSound } from '../../utils/audio';
import { ItemImage } from './ItemImage';

export const PartDetailModal = ({ part, onClose, onSelectBot }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  const getSlotRoleExplanation = (slot) => {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-foreground/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-background border border-border flex flex-col overflow-hidden text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold text-background bg-foreground px-2.5 py-1 uppercase">
              {part.slot.replace('_', ' ')}
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {part.name}
              </h2>
              <p className="text-xs font-mono text-muted uppercase tracking-wider">
                TYPE: {part.type} // ID: {part.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playBeep(350, 0.04);
              onClose();
            }}
            className="px-3 py-1.5 border border-border bg-background hover:bg-foreground hover:text-background text-foreground font-mono text-xs uppercase transition-colors cursor-pointer"
          >
            ESC // ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
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
          <div className="p-5 bg-surface/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest block mb-1">
                MOUNTED CHASSIS FRAME
              </span>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-accent">
                  [{part.botModelCode}]
                </span>
                <span className="text-base font-bold text-foreground">{part.botName}</span>
                <span className="text-xs font-mono text-muted">({part.series} SERIES)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBotNavigation}
              className="px-4 py-2.5 bg-foreground text-background hover:bg-accent hover:text-white font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
            >
              <span>INSPECT FRAME</span>
              <span>→</span>
            </button>
          </div>

          {/* Telemetry Stat Gauges */}
          <div>
            <h3 className="font-mono text-xs font-bold text-muted uppercase tracking-wider pb-3 border-b border-border">
              PART TELEMETRY SPECIFICATIONS
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 border-l border-border font-mono text-xs">
              <div className="p-4 bg-background border-r border-b border-border">
                <span className="text-[10px] text-muted block mb-1">INTEGRITY (HP)</span>
                <span className="text-xl font-bold text-foreground">{part.integrity}</span>
              </div>

              {part.slot === 'TORSO' ? (
                <>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">FIREWALL</span>
                    <span className="text-xl font-bold text-foreground">
                      {part.firewall ?? '0'}
                    </span>
                  </div>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">COOLING</span>
                    <span className="text-xl font-bold text-foreground">
                      {part.cooling ?? '0'}
                    </span>
                  </div>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">MAX LOADOUT</span>
                    <span className="text-xl font-bold text-foreground">
                      {part.max_loadout ?? '0'}
                    </span>
                  </div>
                </>
              ) : part.slot === 'LEGS' ? (
                <>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">CLOCK SPEED</span>
                    <span className="text-xl font-bold text-foreground">
                      {part.clock_speed ?? '0'}
                    </span>
                  </div>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">PACKET LOSS</span>
                    <span className="text-xl font-bold text-foreground">
                      {part.packet_loss ?? 0}%
                    </span>
                  </div>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">PROTOCOL</span>
                    <span className="text-sm font-bold text-accent uppercase">
                      {part.protocol || part.type}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">PAYLOAD</span>
                    <span className="text-xl font-bold text-accent">
                      {part.payload ?? 0}
                    </span>
                  </div>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">PRECISION</span>
                    <span className="text-xl font-bold text-foreground">
                      {part.precision ? `${part.precision}%` : '-'}
                    </span>
                  </div>
                  <div className="p-4 bg-background border-r border-b border-border">
                    <span className="text-[10px] text-muted block mb-1">WEIGHT</span>
                    <span className="text-xl font-bold text-foreground">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 border-l border-border font-mono text-xs">
                {part.execution_time !== undefined && (
                  <div className="p-3 bg-surface/40 border-r border-b border-border">
                    <span className="text-[9px] text-muted block">EXECUTION TIME</span>
                    <span className="text-foreground font-bold">{part.execution_time}s</span>
                  </div>
                )}
                {part.latency !== undefined && (
                  <div className="p-3 bg-surface/40 border-r border-b border-border">
                    <span className="text-[9px] text-muted block">LATENCY COOLDOWN</span>
                    <span className="text-foreground font-bold">{part.latency}s</span>
                  </div>
                )}
                {part.cache !== undefined && part.cache > 0 && (
                  <div className="p-3 bg-surface/40 border-r border-b border-border">
                    <span className="text-[9px] text-muted block">CACHE AMMO</span>
                    <span className="text-accent font-bold">{part.cache} uses</span>
                  </div>
                )}
                {part.direct_connect !== undefined && (
                  <div className="p-3 bg-surface/40 border-r border-b border-border">
                    <span className="text-[9px] text-muted block">DIRECT CONNECT</span>
                    <span className="text-foreground font-bold">
                      {part.direct_connect > 0 ? `+${part.direct_connect}%` : `${part.direct_connect}%`}
                    </span>
                  </div>
                )}
                {part.remote_uplink !== undefined && (
                  <div className="p-3 bg-surface/40 border-r border-b border-border">
                    <span className="text-[9px] text-muted block">REMOTE UPLINK</span>
                    <span className="text-foreground font-bold">
                      {part.remote_uplink > 0 ? `+${part.remote_uplink}%` : `${part.remote_uplink}%`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description & Tactical Notes */}
          <div className="p-5 bg-surface/50 border border-border space-y-2">
            <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider block">
              DESCRIPTION &amp; TACTICAL NOTES
            </span>
            <p className="text-sm text-foreground leading-relaxed">{part.description}</p>
            <div className="pt-3 mt-3 text-xs text-muted font-mono border-t border-border">
              <span className="font-semibold text-foreground uppercase">SLOT MECHANICS:</span>{' '}
              {getSlotRoleExplanation(part.slot)}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between font-mono text-xs text-muted">
          <span>PART SPECIFICATION SHEET // {part.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-foreground text-background hover:bg-accent hover:text-white font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            CLOSE SPEC
          </button>
        </div>
      </div>
    </div>
  );
};
