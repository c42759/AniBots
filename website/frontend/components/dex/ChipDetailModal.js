'use client';

import React, { useEffect } from 'react';
import { playBeep, playSelectSound } from '../../utils/audio';
import { ItemImage } from './ItemImage';

export const ChipDetailModal = ({ chip, allBots, onClose, onSelectBot }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!chip) return null;

  const diodeColor = chip.diode_color || '#D9381E';

  const compatibleBots = allBots.filter(
    (b) => b.preferred_chip?.toLowerCase() === chip.id?.toLowerCase()
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-foreground/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-border flex flex-col overflow-hidden text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Diode Accent Bar */}
        <div
          className="h-1 w-full"
          style={{
            backgroundColor: diodeColor,
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-3.5">
            <span
              className="w-3.5 h-3.5 rounded-full animate-diode shrink-0"
              style={{
                backgroundColor: diodeColor,
                boxShadow: `0 0 10px ${diodeColor}`,
              }}
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {chip.name}
              </h2>
              <p className="text-xs font-mono text-muted uppercase tracking-wider">
                {chip.personality_engram} // {chip.series} SERIES
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
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Top Grid: Schematic + Core Specs */}
          <div className="grid lg:grid-cols-12 border border-border">
            <div className="lg:col-span-7 p-4 bg-surface/40 lg:border-r border-b lg:border-b-0 border-border flex items-center justify-center">
              <ItemImage
                id={chip.id}
                name={chip.name}
                src={chip.image}
                alt={chip.name}
                type="chip"
                diodeColor={diodeColor}
                aspectRatio="aspect-video"
                objectFit="contain"
              />
            </div>

            <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-background">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold pb-2 border-b border-border">
                  PERSONALITY &amp; VOICE ENGRAM
                </div>
                <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">
                  {chip.personality}
                </p>

                {chip.quote && (
                  <div className="mt-4 p-3 bg-surface border border-border italic text-foreground text-xs leading-relaxed">
                    &quot;{chip.quote}&quot;
                  </div>
                )}
              </div>

              <dl className="mt-6 divide-y divide-border border-t border-border font-mono text-xs">
                <div className="py-2.5 flex justify-between items-center gap-4">
                  <dt className="text-muted">DIODE SPECTRUM</dt>
                  <dd className="flex items-center gap-2 text-foreground font-bold">
                    <span
                      className="w-3 h-3 border border-border inline-block"
                      style={{ backgroundColor: diodeColor }}
                    />
                    {diodeColor}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-muted">TARGET PRIORITY</dt>
                  <dd className="text-foreground font-bold text-right">{chip.target_priority}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-muted">VOICE STYLE</dt>
                  <dd className="text-foreground font-medium text-right">{chip.voice_style}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Base Stats Gauges */}
          {chip.base_stats && (
            <div>
              <h3 className="text-xs font-mono text-muted font-bold pb-3 border-b border-border uppercase tracking-wider">
                BASE CORE STATS &amp; OVERCLOCK PARAMETERS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-border">
                <StatBar
                  label="INTEGRITY (HP)"
                  value={chip.base_stats.integrity}
                  max={300}
                />
                <StatBar
                  label="ACCURACY"
                  value={chip.base_stats.target_accuracy}
                  max={100}
                  unit="%"
                />
                <StatBar
                  label="EVASION"
                  value={chip.base_stats.evasion}
                  max={50}
                  unit="%"
                />
                <StatBar
                  label="OVERCLOCK RATE"
                  value={chip.base_stats.overclock_charge_rate}
                  max={2.0}
                  unit="x"
                />
              </div>
            </div>
          )}

          {/* Passive Trait */}
          {chip.passive_trait && (
            <div className="p-5 border border-border bg-surface/50 space-y-2">
              <div className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                PASSIVE TRAIT // {chip.passive_trait.name}
              </div>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {chip.passive_trait.description}
              </p>
            </div>
          )}

          {/* Ultimate Abilities */}
          {chip.ultimate_abilities && chip.ultimate_abilities.length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-foreground font-bold pb-3 border-b border-border uppercase tracking-wider">
                ULTIMATE ABILITIES ({chip.ultimate_abilities.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 border-l border-border">
                {chip.ultimate_abilities.map((ability) => (
                  <div
                    key={ability.skill_id}
                    className="p-5 border-r border-b border-border bg-background space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{ability.name}</span>
                      <span className="font-mono text-[10px] bg-surface border border-border text-foreground px-2 py-0.5">
                        LVL {ability.unlock_level}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-muted">
                      <span>
                        COST: <strong className="text-foreground">{ability.gauge_cost} GAUGE</strong>
                      </span>
                      <span>•</span>
                      <span>
                        POWER: <strong className="text-accent">{ability.power}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {ability.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatible AniBot Frames */}
          {compatibleBots.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-xs font-mono text-muted font-bold uppercase tracking-wider">
                OPTIMIZED PREFERRED ANIBOTS ({compatibleBots.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {compatibleBots.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      if (onSelectBot) {
                        playSelectSound();
                        onSelectBot(b);
                      }
                    }}
                    className="px-4 py-2 bg-foreground text-background hover:bg-accent hover:text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {b.name} [{b.model_code}]
                    </span>
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between text-xs font-mono text-muted">
          <span>ANIDEX AI CORE SPECIFICATION // {chip.id}</span>
          <button
            type="button"
            onClick={() => {
              playBeep(350, 0.04);
              onClose();
            }}
            className="px-5 py-2 bg-foreground text-background hover:bg-accent hover:text-white font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            CLOSE SPEC
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ label, value, max, unit = '' }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="p-4 bg-background border-r border-b border-border space-y-2">
      <div className="flex justify-between text-[11px] font-mono text-muted">
        <span>{label}</span>
        <span className="font-bold text-foreground">
          {value}
          {unit}
        </span>
      </div>
      <div className="w-full h-1.5 bg-surface border border-border overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
