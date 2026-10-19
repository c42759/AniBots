'use client';

import React, { useState, useMemo } from 'react';
import anibotsData from '../../data/anibots.json';
import chipsData from '../../data/anima_chips.json';
import { getBotAvatarUrl } from '../../utils/combatEngine';
import { battleAudio } from '../../utils/battleAudio';

export const OpponentSelectionScene = ({ playerBot, onSelectOpponent, onBack }) => {
  const [selectedOpponentId, setSelectedOpponentId] = useState(
    anibotsData.find((b) => b.id !== playerBot?.botConfig?.id)?.id || anibotsData[1]?.id
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [affinityFilter, setAffinityFilter] = useState('ALL');

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

  const activeOpponent = anibotsData.find((b) => b.id === selectedOpponentId) || anibotsData[1];
  const opponentChip = chipsData.find((c) => c.id === activeOpponent.preferred_chip) || chipsData[1];

  const handleRandomOpponent = () => {
    battleAudio.playClick();
    const available = anibotsData.filter((b) => b.id !== playerBot?.botConfig?.id);
    const randomBot = available[Math.floor(Math.random() * available.length)];
    setSelectedOpponentId(randomBot.id);
  };

  const handleLaunchBattle = () => {
    battleAudio.playLaser();
    onSelectOpponent({
      botConfig: activeOpponent,
      chipConfig: opponentChip,
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-surface/50 font-mono text-xs overflow-y-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <span className="text-[10px] tracking-widest uppercase text-accent font-bold">{'Scene 02 // Rival Matchmaking'}</span>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground uppercase">
            Select Opponent AniBot
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomOpponent}
            className="px-3 py-1.5 border border-border bg-background hover:border-foreground text-foreground text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
          >
            🎲 Random Opponent
          </button>
          <button
            onClick={onBack}
            className="px-3 py-1.5 border border-border bg-surface text-muted hover:text-foreground text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      {/* Matchup Duel Preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-auto py-2">
        {/* Opponent Bot List */}
        <div className="md:col-span-5 max-h-[340px] flex flex-col border border-border bg-background p-2">
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
                const isSelected = bot.id === selectedOpponentId;
                return (
                  <button
                    key={bot.id}
                    onClick={() => { battleAudio.playClick(); setSelectedOpponentId(bot.id); }}
                    className={`w-full text-left p-2 border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-foreground font-bold'
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
        <div className="md:col-span-7 border border-border bg-background p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b border-border pb-2 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={getBotAvatarUrl(activeOpponent, anibotsData)}
                  alt={activeOpponent.name}
                  className="w-12 h-12 rounded border border-border object-cover shadow-sm bg-surface shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <span className="text-[10px] font-bold text-accent uppercase">{`AI CHALLENGER // ${activeOpponent.model_code}`}</span>
                  <h3 className="text-base font-bold text-foreground">{activeOpponent.name}</h3>
                  <p className="text-[11px] text-muted">{activeOpponent.archetype}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block mr-1.5"
                  style={{ backgroundColor: opponentChip.diode_color || '#FFA500' }}
                />
                <span className="text-[11px] font-bold text-foreground">{opponentChip.name}</span>
                <span className="text-[10px] text-muted block italic">&ldquo;{opponentChip.quote}&rdquo;</span>
              </div>
            </div>

            {/* Armament summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] mb-3">
              <div className="border border-border p-2 bg-surface">
                <span className="text-muted block text-[9px] uppercase">HEAD ARSENAL</span>
                <div className="font-bold text-foreground truncate">{activeOpponent.parts?.head?.name}</div>
                <div className="text-muted">Type: {activeOpponent.parts?.head?.type} (Cache: {activeOpponent.parts?.head?.cache ?? 3})</div>
              </div>
              <div className="border border-border p-2 bg-surface">
                <span className="text-muted block text-[9px] uppercase">LEFT WEAPON</span>
                <div className="font-bold text-foreground truncate">{activeOpponent.parts?.left_arm?.name}</div>
                <div className="text-accent font-semibold">Pwr: {activeOpponent.parts?.left_arm?.payload}</div>
              </div>
              <div className="border border-border p-2 bg-surface">
                <span className="text-muted block text-[9px] uppercase">RIGHT WEAPON</span>
                <div className="font-bold text-foreground truncate">{activeOpponent.parts?.right_arm?.name}</div>
                <div className="text-accent font-semibold">Pwr: {activeOpponent.parts?.right_arm?.payload}</div>
              </div>
            </div>

            <div className="p-2 border border-border bg-surface/50 text-[11px]">
              <span className="text-muted">Matchup:</span>{' '}
              <strong className="text-foreground">{playerBot.botConfig.name}</strong> vs{' '}
              <strong className="text-accent">{activeOpponent.name}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-border mt-3 flex items-center justify-between">
            <span className="text-[10px] text-muted">1v1 Speed Relay Combat • Standard Arena</span>
            <button
              onClick={handleLaunchBattle}
              className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
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
