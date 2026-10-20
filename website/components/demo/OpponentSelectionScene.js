'use client';

import React, { useState, useMemo, useEffect } from 'react';
import anibotsData from '../../data/anibots.json';
import chipsData from '../../data/anima_chips.json';
import { getBotAvatarUrl, TERRAINS, getTerrainModifiers } from '../../utils/combatEngine';
import { battleAudio } from '../../utils/battleAudio';

export const OpponentSelectionScene = ({
  playerBot,
  playerTeam,
  teamSize = 1,
  onSelectOpponent,
  onSelectOpponents,
  onBack,
}) => {
  const playerLeader = playerTeam?.[0] || playerBot;

  // Initialize rival roster
  const [opponentRoster, setOpponentRoster] = useState(() => {
    const available = anibotsData.filter((b) => b.id !== playerLeader?.botConfig?.id);
    return Array.from({ length: teamSize }).map((_, idx) => {
      return available[idx % available.length] || anibotsData[idx % anibotsData.length];
    });
  });

  const [activeSlot, setActiveSlot] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [affinityFilter, setAffinityFilter] = useState('ALL');
  const [selectedTerrainId, setSelectedTerrainId] = useState('RANDOM');

  // Keep roster synced with teamSize
  useEffect(() => {
    setOpponentRoster((prev) => {
      const available = anibotsData.filter((b) => b.id !== playerLeader?.botConfig?.id);
      return Array.from({ length: teamSize }).map((_, idx) => {
        if (prev[idx]) return prev[idx];
        return available[idx % available.length] || anibotsData[idx % anibotsData.length];
      });
    });
  }, [teamSize, playerLeader]);

  const activeOpponent = opponentRoster[activeSlot] || opponentRoster[0] || anibotsData[1];
  const opponentChip = chipsData.find((c) => c.id === activeOpponent.preferred_chip) || chipsData[1];

  const affinities = useMemo(() => {
    const list = anibotsData.map((b) => b.affinity).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, []);

  const filteredOpponents = useMemo(() => {
    return anibotsData.filter((bot) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        bot.name.toLowerCase().includes(q) ||
        bot.model_code.toLowerCase().includes(q) ||
        bot.series.toLowerCase().includes(q);
      const matchesAffinity = affinityFilter === 'ALL' || bot.affinity === affinityFilter;
      return matchesQuery && matchesAffinity;
    });
  }, [searchQuery, affinityFilter]);

  const handleSelectOpponentForSlot = (bot) => {
    setOpponentRoster((prev) => {
      const next = [...prev];
      next[activeSlot] = bot;
      return next;
    });
  };

  const handleRandomOpponentTeam = () => {
    battleAudio.playClick();
    const available = anibotsData.filter((b) => b.id !== playerLeader?.botConfig?.id);
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const newRoster = Array.from({ length: teamSize }).map((_, idx) => {
      return shuffled[idx % shuffled.length];
    });
    setOpponentRoster(newRoster);
  };

  const handleLaunchBattle = () => {
    battleAudio.playLaser();
    const resolvedTerrain =
      selectedTerrainId === 'RANDOM'
        ? TERRAINS[Math.floor(Math.random() * TERRAINS.length)]
        : TERRAINS.find((t) => t.id === selectedTerrainId) || TERRAINS[0];

    const fullOpponents = opponentRoster.map((bot, idx) => ({
      botConfig: bot,
      chipConfig: chipsData.find((c) => c.id === bot.preferred_chip) || chipsData[0],
      terrain: resolvedTerrain,
      isLeader: idx === 0,
    }));

    if (onSelectOpponents) {
      onSelectOpponents(fullOpponents, resolvedTerrain);
    } else if (onSelectOpponent) {
      onSelectOpponent(fullOpponents[0]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 bg-surface/50 font-mono text-xs overflow-y-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div>
          <span className="text-[10px] tracking-widest uppercase text-accent font-bold">
            {'Scene 02 // Rival Matchmaking'}
          </span>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground uppercase">
            {teamSize > 1 ? `Select Rival Squad (${teamSize} AniBots)` : 'Select Opponent AniBot'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomOpponentTeam}
            className="px-3 py-1.5 border border-border bg-background hover:border-foreground text-foreground text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
          >
            🎲 {teamSize > 1 ? 'Randomize Rival Squad' : 'Random Opponent'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 border border-border bg-surface text-muted hover:text-foreground text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      {/* Multi-Bot Slot Selector Tabs (When teamSize > 1) */}
      {teamSize > 1 && (
        <div className="flex flex-wrap items-center gap-2 py-2 border-b border-border bg-surface/30">
          <span className="text-[10px] uppercase font-bold text-muted pl-1">Rival Slot:</span>
          {Array.from({ length: teamSize }).map((_, i) => {
            const bot = opponentRoster[i];
            const isSelected = activeSlot === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  battleAudio.playClick();
                  setActiveSlot(i);
                }}
                className={`px-3 py-1.5 border text-xs font-mono uppercase cursor-pointer flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'border-rose-500 bg-rose-500/15 text-rose-400 font-bold shadow-xs'
                    : 'border-border bg-background text-muted hover:text-foreground'
                }`}
              >
                <span>{i === 0 ? '👑 Rival Leader' : `Rival Support ${i}`}</span>
                <span className="text-[10px] text-foreground font-semibold">
                  [{bot?.name || 'Empty'}]
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Matchup Duel Preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-auto py-2">
        {/* Opponent Bot List */}
        <div className="md:col-span-5 max-h-[300px] flex flex-col border border-border bg-background p-2">
          <div className="space-y-1.5 pb-2 mb-1.5 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                Rival Chassis ({filteredOpponents.length}/{anibotsData.length})
              </span>
              <select
                value={affinityFilter}
                onChange={(e) => setAffinityFilter(e.target.value)}
                className="bg-surface border border-border text-[9px] px-1 py-0.5 text-foreground focus:outline-accent cursor-pointer"
              >
                {affinities.map((aff) => (
                  <option key={aff} value={aff}>
                    {aff === 'ALL' ? 'ALL AFFINITIES' : aff}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rival name, code..."
              className="w-full bg-surface border border-border px-2 py-1 text-[11px] text-foreground placeholder:text-muted focus:outline-accent font-mono"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {filteredOpponents.length === 0 ? (
              <div className="text-center py-6 text-muted text-[11px] italic">No rivals matching filter</div>
            ) : (
              filteredOpponents.map((bot) => {
                const isSelected = bot.id === activeOpponent.id;
                return (
                  <button
                    key={bot.id}
                    onClick={() => {
                      battleAudio.playClick();
                      handleSelectOpponentForSlot(bot);
                    }}
                    className={`w-full text-left p-2 border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/10 text-foreground font-bold'
                        : 'border-border/60 bg-surface/40 hover:border-foreground/40 text-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getBotAvatarUrl(bot, anibotsData)}
                        alt={bot.name}
                        className="w-8 h-8 rounded-sm object-cover border border-border shrink-0 bg-surface"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div>
                        <div className="text-xs">{bot.name}</div>
                        <div className="text-[10px] text-muted">{bot.model_code} • {bot.affinity}</div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 bg-surface border border-border uppercase">
                      {bot.series}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Rival Specs & Matchup card */}
        <div className="md:col-span-7 border border-border bg-background p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b border-border pb-2 mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={getBotAvatarUrl(activeOpponent, anibotsData)}
                  alt={activeOpponent.name}
                  className="w-12 h-12 rounded border border-border object-cover bg-surface shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
                    <span>{activeOpponent.name}</span>
                    {activeSlot === 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/15 border border-rose-500/40 text-rose-400 font-mono">
                        👑 RIVAL LEADER
                      </span>
                    )}
                  </h3>
                  <div className="text-[10px] text-muted">
                    {activeOpponent.model_code} • {activeOpponent.series} • {activeOpponent.archetype}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-rose-400 font-bold uppercase">{activeOpponent.affinity}</div>
                <div className="text-[9px] text-muted">Weight: {activeOpponent.total_weight || 45}t</div>
              </div>
            </div>

            {/* Anima Chip Preview */}
            <div className="bg-surface border border-border p-2 mb-2">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-rose-400 font-bold uppercase">Anima Core: {opponentChip.name}</span>
                <span className="text-muted font-mono">{opponentChip.affinity} Spec</span>
              </div>
              <div className="text-[10px] text-muted italic">&ldquo;{opponentChip.quote}&rdquo;</div>
            </div>

            {/* Battlefield Terrain Selector */}
            <div className="bg-surface border border-border p-2 mb-2">
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <label htmlFor="terrain-select" className="text-accent font-bold uppercase flex items-center gap-1.5">
                  <span>Battlefield Terrain Ground</span>
                </label>
                <span className="text-[9px] text-muted font-mono">Affects Protocol Speeds</span>
              </div>
              <select
                id="terrain-select"
                value={selectedTerrainId}
                onChange={(e) => {
                  battleAudio.playClick();
                  setSelectedTerrainId(e.target.value);
                }}
                className="w-full bg-background border border-border p-1 text-[11px] text-foreground focus:outline-accent font-mono cursor-pointer mb-1"
              >
                <option value="RANDOM">🎲 Randomize Terrain (Dynamic Environment)</option>
                {TERRAINS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>

              {selectedTerrainId !== 'RANDOM' ? (
                (() => {
                  const t = TERRAINS.find((item) => item.id === selectedTerrainId);
                  const pProto = playerLeader?.botConfig?.parts?.legs?.protocol;
                  const eProto = activeOpponent?.parts?.legs?.protocol;
                  const pMod = getTerrainModifiers(pProto, t?.id, playerLeader?.chipConfig?.id);
                  const eMod = getTerrainModifiers(eProto, t?.id, opponentChip?.id);
                  return (
                    <div className="p-1.5 bg-background/60 border border-border/60 text-[9px] space-y-0.5">
                      <div className="text-muted leading-tight">{t?.description}</div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 font-mono text-[9px]">
                        <span className={pMod.speedMult >= 1.0 ? 'text-emerald-400' : 'text-amber-400'}>
                          Player ({pProto || 'BIPEDAL'}): {Math.round(pMod.speedMult * 100)}% Speed
                        </span>
                        <span className={eMod.speedMult >= 1.0 ? 'text-emerald-400' : 'text-amber-400'}>
                          Rival ({eProto || 'BIPEDAL'}): {Math.round(eMod.speedMult * 100)}% Speed
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-1.5 bg-background/60 border border-border/60 text-[9px] text-muted flex items-center justify-between">
                  <span>🎲 <em>Battlefield terrain dynamically determined upon launch.</em></span>
                  <span className="text-[8px] text-accent font-semibold">1 of 5 Environments</span>
                </div>
              )}
            </div>

            <div className="p-2 border border-border bg-surface/50 text-[11px]">
              <span className="text-muted">Matchup:</span>{' '}
              <strong className="text-foreground">{playerLeader?.botConfig?.name || 'Player'}</strong> vs{' '}
              <strong className="text-rose-400">{opponentRoster[0]?.name || activeOpponent.name}</strong>
              {teamSize > 1 && (
                <span className="text-muted ml-2">
                  (+ {teamSize - 1} support {teamSize - 1 === 1 ? 'unit' : 'units'})
                </span>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-border mt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted">
              {teamSize}v{teamSize} Relay Combat • Leader Elimination Rule
            </span>
            <button
              onClick={handleLaunchBattle}
              className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span>Engage In Battle</span>
              <span>⚔️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
