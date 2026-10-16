'use client';

import React, { useEffect, useState } from 'react';
import { playBeep, playSelectSound } from '../../utils/audio';
import { ItemImage } from './ItemImage';

export const AniBotDetailModal = ({ bot, onClose, onSelectChip }) => {
  const [activePartTab, setActivePartTab] = useState('all');

  useEffect(() => {
    const handleKeyDown = (e) => {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-foreground/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-border flex flex-col overflow-hidden text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Editorial Specification Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold text-background bg-foreground px-2.5 py-1 uppercase tracking-wider">
              {bot.model_code}
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {bot.name}
              </h2>
              <p className="text-xs font-mono text-muted uppercase tracking-wider">
                {bot.series} SERIES // {bot.affinity} AFFINITY
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
          {/* Top Grid: Hero Image + Specification Summary */}
          <div className="grid lg:grid-cols-12 border border-border">
            <div className="lg:col-span-7 p-4 bg-surface/40 lg:border-r border-b lg:border-b-0 border-border flex items-center justify-center">
              <ItemImage
                id={bot.id}
                name={bot.name}
                src={bot.image}
                alt={bot.name}
                type="anibot"
                aspectRatio="aspect-video"
                objectFit="contain"
              />
            </div>

            <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-background">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold pb-2 border-b border-border">
                  CHASSIS DOSSIER // {bot.archetype}
                </div>
                <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">
                  {bot.description}
                </p>
              </div>

              <dl className="mt-6 divide-y divide-border border-t border-border font-mono text-xs">
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-muted">TOTAL INTEGRITY</dt>
                  <dd className="text-foreground font-bold">{totalIntegrity} HP</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-muted">COMBINED PAYLOAD</dt>
                  <dd className="text-foreground font-bold">{totalPayload}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-muted">LOADOUT WEIGHT</dt>
                  <dd className="text-foreground font-bold">{totalWeight}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-muted">COOLING RATE</dt>
                  <dd className="text-foreground font-bold">
                    {bot.parts?.torso?.cooling || 0}/s
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Affinity Synergy & Preferred Core Chip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-border">
            <div className="p-5 border-r border-b border-border bg-surface/40">
              <div className="font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                01 // AFFINITY SYNERGY ({bot.affinity})
              </div>
              <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                {bot.affinity_synergy_bonus}
              </p>
            </div>

            <div className="p-5 border-r border-b border-border bg-surface/40 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                  02 // DESIGNATED ANIMA CORE
                </div>
                <p className="font-mono text-sm font-bold text-foreground">
                  {bot.preferred_chip ? bot.preferred_chip.toUpperCase() : 'NONE DESIGNATED'}
                </p>
              </div>

              {bot.preferred_chip && (
                <button
                  type="button"
                  onClick={handleChipNavigation}
                  className="mt-4 w-full py-2.5 px-4 bg-foreground text-background hover:bg-accent hover:text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>INSPECT {bot.preferred_chip.toUpperCase()}</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </div>

          {/* 5-Slot Modular Anatomy Breakdown */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border mb-4">
              <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                FIVE-SLOT MODULAR ANATOMY BREAKDOWN
              </h3>
              <div className="flex border border-border">
                {['all', 'head', 'torso', 'arms', 'legs'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      playBeep(800, 0.02);
                      setActivePartTab(tab);
                    }}
                    className={`px-3 py-1 text-[11px] font-mono uppercase transition-colors cursor-pointer border-r last:border-r-0 border-border ${
                      activePartTab === tab
                        ? 'bg-foreground text-background font-bold'
                        : 'bg-background text-muted hover:text-foreground hover:bg-surface'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
              {/* HEAD */}
              {(activePartTab === 'all' || activePartTab === 'head') && bot.parts?.head && (
                <PartSubCard code="SLT-01" title="HEAD" part={bot.parts.head} />
              )}

              {/* TORSO */}
              {(activePartTab === 'all' || activePartTab === 'torso') && bot.parts?.torso && (
                <div className="p-5 border-r border-b border-border bg-background space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      <span className="text-accent mr-1.5">SLT-02</span>
                      TORSO: {bot.parts.torso.name}
                    </span>
                    <span className="font-mono text-[10px] bg-surface border border-border px-2 py-0.5 text-foreground uppercase">
                      {bot.parts.torso.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {bot.parts.torso.description}
                  </p>
                  <div className="grid grid-cols-3 border-t border-l border-border font-mono text-xs">
                    <div className="p-2 border-r border-b border-border bg-surface/40">
                      <div className="text-[9px] text-muted">INTEGRITY</div>
                      <div className="text-foreground font-bold">{bot.parts.torso.integrity}</div>
                    </div>
                    {bot.parts.torso.firewall !== undefined && (
                      <div className="p-2 border-r border-b border-border bg-surface/40">
                        <div className="text-[9px] text-muted">FIREWALL</div>
                        <div className="text-foreground font-bold">{bot.parts.torso.firewall}</div>
                      </div>
                    )}
                    {bot.parts.torso.cooling !== undefined && (
                      <div className="p-2 border-r border-b border-border bg-surface/40">
                        <div className="text-[9px] text-muted">COOLING</div>
                        <div className="text-foreground font-bold">{bot.parts.torso.cooling}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LEFT ARM */}
              {(activePartTab === 'all' || activePartTab === 'arms') && bot.parts?.left_arm && (
                <PartSubCard code="SLT-03" title="LEFT ARM" part={bot.parts.left_arm} />
              )}

              {/* RIGHT ARM */}
              {(activePartTab === 'all' || activePartTab === 'arms') && bot.parts?.right_arm && (
                <PartSubCard code="SLT-04" title="RIGHT ARM" part={bot.parts.right_arm} />
              )}

              {/* LEGS */}
              {(activePartTab === 'all' || activePartTab === 'legs') && bot.parts?.legs && (
                <div className="p-5 border-r border-b border-border bg-background space-y-3 col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      <span className="text-accent mr-1.5">SLT-05</span>
                      LEGS: {bot.parts.legs.name}
                    </span>
                    <span className="font-mono text-[10px] bg-surface border border-border px-2 py-0.5 text-foreground uppercase">
                      {bot.parts.legs.protocol || bot.parts.legs.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {bot.parts.legs.description}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-l border-border font-mono text-xs">
                    <div className="p-2 border-r border-b border-border bg-surface/40">
                      <div className="text-[9px] text-muted">INTEGRITY</div>
                      <div className="text-foreground font-bold">{bot.parts.legs.integrity}</div>
                    </div>
                    {bot.parts.legs.clock_speed !== undefined && (
                      <div className="p-2 border-r border-b border-border bg-surface/40">
                        <div className="text-[9px] text-muted">CLOCK SPEED</div>
                        <div className="text-foreground font-bold">
                          {bot.parts.legs.clock_speed} GHz
                        </div>
                      </div>
                    )}
                    {bot.parts.legs.direct_connect !== undefined && (
                      <div className="p-2 border-r border-b border-border bg-surface/40">
                        <div className="text-[9px] text-muted">DIRECT CONNECT</div>
                        <div className="text-foreground font-bold">
                          +{bot.parts.legs.direct_connect}%
                        </div>
                      </div>
                    )}
                    {bot.parts.legs.packet_loss !== undefined && (
                      <div className="p-2 border-r border-b border-border bg-surface/40">
                        <div className="text-[9px] text-muted">PACKET LOSS</div>
                        <div className="text-foreground font-bold">
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
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between text-xs font-mono text-muted">
          <span>ANIDEX SPECIFICATION SHEET // {bot.model_code}</span>
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

const PartSubCard = ({ code, title, part }) => (
  <div className="p-5 border-r border-b border-border bg-background space-y-3">
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="font-mono text-xs font-bold text-foreground">
        <span className="text-accent mr-1.5">{code}</span>
        {title}: {part.name}
      </span>
      <span className="font-mono text-[10px] bg-surface border border-border px-2 py-0.5 text-foreground uppercase">
        {part.type}
      </span>
    </div>
    <p className="text-xs text-muted leading-relaxed">{part.description}</p>
    <div className="grid grid-cols-4 border-t border-l border-border font-mono text-xs">
      <div className="p-2 border-r border-b border-border bg-surface/40">
        <div className="text-[9px] text-muted">INTEGRITY</div>
        <div className="text-foreground font-bold">{part.integrity}</div>
      </div>
      {part.payload !== undefined && (
        <div className="p-2 border-r border-b border-border bg-surface/40">
          <div className="text-[9px] text-muted">PAYLOAD</div>
          <div className="text-foreground font-bold">{part.payload}</div>
        </div>
      )}
      {part.precision !== undefined && (
        <div className="p-2 border-r border-b border-border bg-surface/40">
          <div className="text-[9px] text-muted">PRECISION</div>
          <div className="text-foreground font-bold">{part.precision}%</div>
        </div>
      )}
      {part.weight !== undefined && (
        <div className="p-2 border-r border-b border-border bg-surface/40">
          <div className="text-[9px] text-muted">WEIGHT</div>
          <div className="text-foreground font-bold">{part.weight}</div>
        </div>
      )}
    </div>
  </div>
);
