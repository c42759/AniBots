'use client';

import React from 'react';
import anibotsData from '../../data/anibots.json';
import { PartSlot, SlotNames, getBotAvatarUrl } from '../../utils/combatEngine';
import { battleAudio } from '../../utils/battleAudio';

export const OutcomeScene = ({
  playerWon,
  playerUnit,
  enemyUnit,
  onRematch,
  onNewOpponent,
  onRebuildBot,
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-surface/80 font-mono text-xs overflow-y-auto">
      {/* Result Masthead */}
      <div className="text-center my-auto py-2">
        <span className="text-[10px] tracking-widest uppercase font-bold text-accent">
          Match Telemetry // Duel Concluded
        </span>
        <h2
          className={`text-2xl sm:text-4xl font-extrabold uppercase tracking-tight mt-1 ${
            playerWon ? 'text-emerald-500' : 'text-accent'
          }`}
        >
          {playerWon ? '★ BATTLE VICTORY ★' : '☠ SYSTEM FAILURE ☠'}
        </h2>
        <p className="text-xs text-muted mt-1">
          {playerWon
            ? `Opponent Leader ${enemyUnit?.name || 'Rival'}'s Head was dismantled! Clean match victory achieved.`
            : `Your Leader ${playerUnit?.name || 'Unit'}'s Head was destroyed! Critical squad system failure.`}
        </p>

        {/* Combatant Final Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto my-4 text-left">
          {/* Player Bot Post-Mortem */}
          <div className="border border-border bg-background p-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={getBotAvatarUrl(playerUnit, anibotsData)}
                  alt={playerUnit?.name}
                  className="w-8 h-8 rounded-sm object-cover border border-border bg-surface shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <span className="font-bold text-foreground text-xs block">
                    👑 {playerUnit?.name} (Player Leader)
                  </span>
                  <span className="text-[9px] text-muted">{playerUnit?.chip?.name}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              {[PartSlot.HEAD, PartSlot.TORSO, PartSlot.LEFT_ARM, PartSlot.RIGHT_ARM, PartSlot.LEGS].map((slot) => {
                const hp = playerUnit?.integrities?.[slot] || 0;
                const max = playerUnit?.maxIntegrities?.[slot] || 1;
                const pct = Math.max(0, Math.min(100, Math.round((hp / max) * 100)));
                const isHead = slot === PartSlot.HEAD;
                return (
                  <div key={slot} className="py-1 border-b border-border/40 last:border-b-0 space-y-0.5">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-muted font-semibold">{SlotNames[slot]}</span>
                      <span className={hp <= 0 ? 'text-accent font-bold' : 'text-foreground'}>
                        {hp > 0 ? `${hp} / ${max} HP (${pct}%)` : '[DESTROYED]'}
                      </span>
                    </div>
                    <div className="w-full bg-border h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          hp <= 0 ? 'bg-zinc-600' : isHead ? 'bg-accent' : pct > 40 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enemy Bot Post-Mortem */}
          <div className="border border-border bg-background p-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={getBotAvatarUrl(enemyUnit, anibotsData)}
                  alt={enemyUnit?.name}
                  className="w-8 h-8 rounded-sm object-cover border border-border bg-surface shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <span className="font-bold text-rose-400 text-xs block">
                    👑 {enemyUnit?.name} (Rival Leader)
                  </span>
                  <span className="text-[9px] text-muted">{enemyUnit?.chip?.name}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              {[PartSlot.HEAD, PartSlot.TORSO, PartSlot.LEFT_ARM, PartSlot.RIGHT_ARM, PartSlot.LEGS].map((slot) => {
                const hp = enemyUnit?.integrities?.[slot] || 0;
                const max = enemyUnit?.maxIntegrities?.[slot] || 1;
                const pct = Math.max(0, Math.min(100, Math.round((hp / max) * 100)));
                const isHead = slot === PartSlot.HEAD;
                return (
                  <div key={slot} className="py-1 border-b border-border/40 last:border-b-0 space-y-0.5">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-muted font-semibold">{SlotNames[slot]}</span>
                      <span className={hp <= 0 ? 'text-accent font-bold' : 'text-foreground'}>
                        {hp > 0 ? `${hp} / ${max} HP (${pct}%)` : '[DESTROYED]'}
                      </span>
                    </div>
                    <div className="w-full bg-border h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          hp <= 0 ? 'bg-zinc-600' : isHead ? 'bg-accent' : pct > 40 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Options */}
      <div className="pt-3 border-t border-border flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => { battleAudio.playClick(); onRematch(); }}
          className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-sm"
        >
          ⚔️ Instant Rematch
        </button>
        <button
          onClick={() => { battleAudio.playClick(); onNewOpponent(); }}
          className="px-4 py-2 border border-border bg-surface hover:border-foreground text-foreground uppercase tracking-wider transition-colors cursor-pointer"
        >
          Select Another Rival
        </button>
        <button
          onClick={() => { battleAudio.playClick(); onRebuildBot(); }}
          className="px-4 py-2 border border-border bg-surface hover:border-foreground text-muted hover:text-foreground uppercase tracking-wider transition-colors cursor-pointer"
        >
          Reconfigure Format & Squad
        </button>
      </div>
    </div>
  );
};
