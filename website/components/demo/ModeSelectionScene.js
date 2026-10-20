'use client';

import React from 'react';
import { battleAudio } from '../../utils/battleAudio';

export const ModeSelectionScene = ({ onSelectMode }) => {
  const modes = [
    {
      id: '1v1',
      title: '1v1 Duel',
      subtitle: 'Single Unit Sparring',
      badge: 'CLASSIC',
      description: 'Pure 1-on-1 clash. Fast-paced single-lane tactical combat.',
      unitsPerSide: 1,
      icon: '⚔️',
      accentColor: 'border-accent text-accent',
    },
    {
      id: '2v2',
      title: '2v2 Team Clash',
      subtitle: 'Leader + Support Duo',
      badge: 'DUO CO-OP',
      description: 'Two parallel combat lanes. Protect your Leader while maneuvering support fire.',
      unitsPerSide: 2,
      icon: '👥',
      accentColor: 'border-sky-500 text-sky-400',
    },
    {
      id: '3v3',
      title: '3v3 Full Relay',
      subtitle: '3-Unit Tournament Roster',
      badge: 'ANIBOT TOURNAMENT',
      description: 'Three stacked lanes. Defeat the enemy Leader unit to achieve instant system failure!',
      unitsPerSide: 3,
      icon: '🎖️',
      accentColor: 'border-amber-500 text-amber-400',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 bg-surface/50 font-mono text-xs overflow-y-auto">
      {/* Top Header */}
      <div className="border-b border-border pb-3">
        <span className="text-[10px] tracking-widest uppercase text-accent font-bold">
          Combat Protocol // Mode Initialization
        </span>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground uppercase mt-0.5">
          Select Battle Format
        </h2>
        <p className="text-muted text-[11px] mt-1">
          Choose team size before deploying your AniBot squad. Elimination of the first bot (Leader Head) results in immediate match defeat.
        </p>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto py-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => {
              battleAudio.playClick();
              onSelectMode(mode.id);
            }}
            className="group relative p-5 border border-border bg-background hover:border-accent hover:bg-accent/5 transition-all text-left flex flex-col justify-between gap-4 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{mode.icon}</span>
                <span className="text-[10px] px-2 py-0.5 border border-border bg-surface text-muted uppercase font-bold tracking-wider group-hover:border-accent group-hover:text-accent">
                  {mode.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-tight group-hover:text-accent transition-colors">
                {mode.title}
              </h3>
              <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">
                {mode.subtitle}
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                {mode.description}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted group-hover:text-foreground">
              <span>{mode.unitsPerSide} vs {mode.unitsPerSide} Units</span>
              <span className="text-accent group-hover:translate-x-1 transition-transform">Deploy ➔</span>
            </div>
          </button>
        ))}
      </div>

      {/* Rule Notice Footer */}
      <div className="p-3 border border-border bg-surface text-[11px] text-muted flex items-center gap-2.5">
        <span className="text-amber-500 font-bold text-base">👑</span>
        <span>
          <strong className="text-foreground">Leader Rule:</strong> The first bot chosen for each side is the <strong>Leader</strong>. If the Leader&apos;s Head is destroyed, that team instantly loses!
        </span>
      </div>
    </div>
  );
};
