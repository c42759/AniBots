'use client';

import React, { useState, useMemo, useEffect } from 'react';
import anibotsData from '../../data/anibots.json';
import chipsData from '../../data/anima_chips.json';
import { isBuildOverweight, getBotAvatarUrl } from '../../utils/combatEngine';
import { battleAudio } from '../../utils/battleAudio';

export const BotSelectionScene = ({ onSelectBot, onSelectTeam, teamSize = 1, onBack }) => {
  const [tab, setTab] = useState('preset'); // 'preset' | 'custom'
  const [activeSlot, setActiveSlot] = useState(0);

  // Initialize team array of length teamSize
  const [team, setTeam] = useState(() => {
    return Array.from({ length: teamSize }).map((_, idx) => {
      const bot = anibotsData[idx % anibotsData.length];
      const chip = chipsData.find((c) => c.id === bot.preferred_chip) || chipsData[0];
      return {
        botConfig: bot,
        chipConfig: chip,
        mode: 'preset',
        isLeader: idx === 0,
      };
    });
  });

  // Keep team synchronized if teamSize changes
  useEffect(() => {
    setTeam((prev) => {
      const updated = Array.from({ length: teamSize }).map((_, idx) => {
        if (prev[idx]) return prev[idx];
        const bot = anibotsData[idx % anibotsData.length];
        const chip = chipsData.find((c) => c.id === bot.preferred_chip) || chipsData[0];
        return {
          botConfig: bot,
          chipConfig: chip,
          mode: 'preset',
          isLeader: idx === 0,
        };
      });
      return updated;
    });
  }, [teamSize]);

  const currentSlotBot = team[activeSlot] || team[0];
  const [selectedBotId, setSelectedBotId] = useState(currentSlotBot?.botConfig?.id || anibotsData[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [affinityFilter, setAffinityFilter] = useState('ALL');

  // Synchronize selectedBotId when switching active slots
  useEffect(() => {
    if (team[activeSlot]?.botConfig?.id) {
      setSelectedBotId(team[activeSlot].botConfig.id);
    }
  }, [activeSlot, team]);

  const affinities = useMemo(() => {
    const list = anibotsData.map((b) => b.affinity).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, []);

  const filteredPresets = useMemo(() => {
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

  // Custom Assembly State
  const allParts = useMemo(() => {
    const head = [];
    const torso = [];
    const leftArm = [];
    const rightArm = [];
    const legs = [];

    anibotsData.forEach((bot) => {
      if (bot.parts?.head) head.push({ ...bot.parts.head, botName: bot.name });
      if (bot.parts?.torso) torso.push({ ...bot.parts.torso, botName: bot.name });
      if (bot.parts?.left_arm) leftArm.push({ ...bot.parts.left_arm, botName: bot.name });
      if (bot.parts?.right_arm) rightArm.push({ ...bot.parts.right_arm, botName: bot.name });
      if (bot.parts?.legs) legs.push({ ...bot.parts.legs, botName: bot.name });
    });

    return { head, torso, leftArm, rightArm, legs };
  }, []);

  const [customBotName, setCustomBotName] = useState('Iron Vindicator');
  const [customChipId, setCustomChipId] = useState(chipsData[0]?.id || '');
  const [customHeadId, setCustomHeadId] = useState(allParts.head[0]?.id || '');
  const [customTorsoId, setCustomTorsoId] = useState(allParts.torso[0]?.id || '');
  const [customLArmId, setCustomLArmId] = useState(allParts.leftArm[0]?.id || '');
  const [customRArmId, setCustomRArmId] = useState(allParts.rightArm[0]?.id || '');
  const [customLegsId, setCustomLegsId] = useState(allParts.legs[0]?.id || '');

  // LocalStorage Custom Build Persistence
  const [savedBuild] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('anibots_custom_build');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return null;
  });

  const [showRestorePrompt, setShowRestorePrompt] = useState(() => Boolean(savedBuild));

  const handleRestoreSavedBuild = () => {
    if (!savedBuild) return;
    battleAudio.playClick();
    if (savedBuild.name) setCustomBotName(savedBuild.name);
    if (savedBuild.chipId) setCustomChipId(savedBuild.chipId);
    if (savedBuild.headId) setCustomHeadId(savedBuild.headId);
    if (savedBuild.torsoId) setCustomTorsoId(savedBuild.torsoId);
    if (savedBuild.lArmId) setCustomLArmId(savedBuild.lArmId);
    if (savedBuild.rArmId) setCustomRArmId(savedBuild.rArmId);
    if (savedBuild.legsId) setCustomLegsId(savedBuild.legsId);
    setShowRestorePrompt(false);
  };

  // Preset Selection Lookup
  const activePreset = useMemo(() => {
    return anibotsData.find((b) => b.id === selectedBotId) || anibotsData[0];
  }, [selectedBotId]);

  const presetChip = useMemo(() => {
    if (!activePreset) return chipsData[0];
    const match = chipsData.find((c) => c.id === activePreset.preferred_chip);
    return match || chipsData[0];
  }, [activePreset]);

  // Custom Assembly Lookups
  const activeCustomChip = useMemo(() => chipsData.find((c) => c.id === customChipId) || chipsData[0], [customChipId]);
  const activeCustomHead = useMemo(() => allParts.head.find((p) => p.id === customHeadId) || allParts.head[0], [allParts, customHeadId]);
  const activeCustomTorso = useMemo(() => allParts.torso.find((p) => p.id === customTorsoId) || allParts.torso[0], [allParts, customTorsoId]);
  const activeCustomLArm = useMemo(() => allParts.leftArm.find((p) => p.id === customLArmId) || allParts.leftArm[0], [allParts, customLArmId]);
  const activeCustomRArm = useMemo(() => allParts.rightArm.find((p) => p.id === customRArmId) || allParts.rightArm[0], [allParts, customRArmId]);
  const activeCustomLegs = useMemo(() => allParts.legs.find((p) => p.id === customLegsId) || allParts.legs[0], [allParts, customLegsId]);

  const customWeight = (activeCustomHead?.weight || 0) + (activeCustomLArm?.weight || 0) + (activeCustomRArm?.weight || 0);
  const customMaxLoadout = activeCustomTorso?.max_loadout || 30;
  const isCustomOverweight = isBuildOverweight(activeCustomHead, activeCustomLArm, activeCustomRArm, activeCustomTorso);

  // Assign a bot to activeSlot
  const handleSelectPresetForSlot = (bot) => {
    setSelectedBotId(bot.id);
    const chip = chipsData.find((c) => c.id === bot.preferred_chip) || chipsData[0];
    setTeam((prev) => {
      const next = [...prev];
      next[activeSlot] = {
        botConfig: bot,
        chipConfig: chip,
        mode: 'preset',
        isLeader: activeSlot === 0,
      };
      return next;
    });
  };

  const handleRandomizeTeam = () => {
    battleAudio.playClick();
    const shuffled = [...anibotsData].sort(() => 0.5 - Math.random());
    const newTeam = Array.from({ length: teamSize }).map((_, idx) => {
      const bot = shuffled[idx % shuffled.length];
      const chip = chipsData.find((c) => c.id === bot.preferred_chip) || chipsData[0];
      return {
        botConfig: bot,
        chipConfig: chip,
        mode: 'preset',
        isLeader: idx === 0,
      };
    });
    setTeam(newTeam);
    setSelectedBotId(newTeam[activeSlot]?.botConfig?.id || newTeam[0].botConfig.id);
  };

  const handleConfirmDeploy = () => {
    battleAudio.playClick();
    if (onSelectTeam) {
      onSelectTeam(team);
    } else if (onSelectBot) {
      onSelectBot(team[0]);
    }
  };

  const handleConfirmCustom = () => {
    battleAudio.playClick();
    const finalName = customBotName.trim() || `Custom [${activeCustomChip.name.replace(' Chip', '')}]`;

    // Persist to localStorage
    try {
      localStorage.setItem(
        'anibots_custom_build',
        JSON.stringify({
          name: finalName,
          chipId: customChipId,
          headId: customHeadId,
          torsoId: customTorsoId,
          lArmId: customLArmId,
          rArmId: customRArmId,
          legsId: customLegsId,
          updatedAt: Date.now(),
        })
      );
    } catch {
      // Ignore storage write errors
    }

    const customBot = {
      id: `custom_${Date.now()}`,
      name: finalName,
      model_code: 'MOD-CUSTOM',
      archetype: 'Custom Hybrid Build',
      parts: {
        head: activeCustomHead,
        torso: activeCustomTorso,
        left_arm: activeCustomLArm,
        right_arm: activeCustomRArm,
        legs: activeCustomLegs,
      },
    };

    const newUnit = {
      botConfig: customBot,
      chipConfig: activeCustomChip,
      mode: 'custom',
      isLeader: activeSlot === 0,
    };

    setTeam((prev) => {
      const next = [...prev];
      next[activeSlot] = newUnit;
      return next;
    });

    if (teamSize === 1) {
      if (onSelectTeam) onSelectTeam([newUnit]);
      else if (onSelectBot) onSelectBot(newUnit);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 bg-surface/50 font-mono text-xs overflow-y-auto">
      {/* Top Selector Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-2.5 gap-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1 border border-border bg-surface hover:border-foreground text-muted hover:text-foreground text-[10px] uppercase cursor-pointer"
            >
              ← Mode
            </button>
          )}
          <div>
            <span className="text-[10px] tracking-widest uppercase text-accent font-bold">
              {'Scene 01 // Squad Configuration'}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground uppercase">
              {teamSize > 1 ? `Deploy Player Squad (${teamSize} AniBots)` : 'Deploy Player AniBot'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {teamSize > 1 && (
            <button
              type="button"
              onClick={handleRandomizeTeam}
              className="px-3 py-1 border border-border bg-background hover:border-foreground text-foreground text-[11px] uppercase font-semibold cursor-pointer"
            >
              🎲 Randomize Squad
            </button>
          )}
          <div className="flex items-center gap-1 bg-background border border-border p-0.5">
            <button
              onClick={() => { battleAudio.playClick(); setTab('preset'); }}
              className={`px-3 py-1 font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                tab === 'preset' ? 'bg-accent text-white font-bold' : 'text-muted hover:text-foreground'
              }`}
            >
              Preset Catalog
            </button>
            <button
              onClick={() => { battleAudio.playClick(); setTab('custom'); }}
              className={`px-3 py-1 font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                tab === 'custom' ? 'bg-accent text-white font-bold' : 'text-muted hover:text-foreground'
              }`}
            >
              Custom Garage
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Bot Slot Selector Tabs (When teamSize > 1) */}
      {teamSize > 1 && (
        <div className="flex flex-wrap items-center gap-2 py-2 border-b border-border bg-surface/30">
          <span className="text-[10px] uppercase font-bold text-muted pl-1">Assign Slot:</span>
          {Array.from({ length: teamSize }).map((_, i) => {
            const unit = team[i];
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
                    ? 'border-accent bg-accent/15 text-accent font-bold shadow-xs'
                    : 'border-border bg-background text-muted hover:text-foreground'
                }`}
              >
                <span>{i === 0 ? '👑 Leader (Slot 1)' : `Support (Slot ${i + 1})`}</span>
                <span className="text-[10px] text-foreground font-semibold">
                  [{unit?.botConfig?.name || 'Empty'}]
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Mode Body */}
      {tab === 'preset' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-auto py-2">
          {/* Left: Bot List Scroll */}
          <div className="md:col-span-5 max-h-[300px] flex flex-col border border-border bg-background p-2">
            <div className="space-y-1.5 pb-2 mb-1.5 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                  Catalog Frames ({filteredPresets.length}/{anibotsData.length})
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
                placeholder="Search frame name, code..."
                className="w-full bg-surface border border-border px-2 py-1 text-[11px] text-foreground placeholder:text-muted focus:outline-accent font-mono"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {filteredPresets.length === 0 ? (
                <div className="text-center py-6 text-muted text-[11px] italic">No frames matching filter</div>
              ) : (
                filteredPresets.map((bot) => {
                  const isSelected = bot.id === selectedBotId;
                  return (
                    <button
                      key={bot.id}
                      onClick={() => {
                        battleAudio.playClick();
                        handleSelectPresetForSlot(bot);
                      }}
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

          {/* Right: Selected Bot Specs & Preview */}
          <div className="md:col-span-7 border border-border bg-background p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between border-b border-border pb-2 mb-2">
                <div className="flex items-center gap-3">
                  <img
                    src={getBotAvatarUrl(activePreset, anibotsData)}
                    alt={activePreset.name}
                    className="w-12 h-12 rounded border border-border object-cover bg-surface shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
                      <span>{activePreset.name}</span>
                      {activeSlot === 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono">
                          👑 LEADER
                        </span>
                      )}
                    </h3>
                    <div className="text-[10px] text-muted">
                      {activePreset.model_code} • {activePreset.series} • {activePreset.archetype}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-accent font-bold uppercase">{activePreset.affinity}</div>
                  <div className="text-[9px] text-muted">Weight: {activePreset.total_weight || 45}t</div>
                </div>
              </div>

              {/* Anima Chip Preview */}
              <div className="bg-surface border border-border p-2 mb-2">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-accent font-bold uppercase">Anima Core: {presetChip.name}</span>
                  <span className="text-muted font-mono">{presetChip.affinity} Spec</span>
                </div>
                <div className="text-[10px] text-muted italic">&ldquo;{presetChip.quote}&rdquo;</div>
              </div>

              {/* 5 Part Loadout Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                <div className="p-1.5 bg-surface border border-border/80">
                  <div className="text-muted uppercase text-[9px] font-bold">Head</div>
                  <div className="font-semibold text-foreground truncate">{activePreset.parts?.head?.name}</div>
                  <div className="text-muted">HP: {activePreset.parts?.head?.integrity} | {activePreset.parts?.head?.type}</div>
                </div>

                <div className="p-1.5 bg-surface border border-border/80">
                  <div className="text-muted uppercase text-[9px] font-bold">Left Arm</div>
                  <div className="font-semibold text-foreground truncate">{activePreset.parts?.left_arm?.name}</div>
                  <div className="text-muted">Pwr: {activePreset.parts?.left_arm?.payload} | {activePreset.parts?.left_arm?.type}</div>
                </div>

                <div className="p-1.5 bg-surface border border-border/80">
                  <div className="text-muted uppercase text-[9px] font-bold">Right Arm</div>
                  <div className="font-semibold text-foreground truncate">{activePreset.parts?.right_arm?.name}</div>
                  <div className="text-muted">Pwr: {activePreset.parts?.right_arm?.payload} | {activePreset.parts?.right_arm?.type}</div>
                </div>

                <div className="p-1.5 bg-surface border border-border/80">
                  <div className="text-muted uppercase text-[9px] font-bold">Torso</div>
                  <div className="font-semibold text-foreground truncate">{activePreset.parts?.torso?.name}</div>
                  <div className="text-muted">Max: {activePreset.parts?.torso?.max_loadout}t | Armor: {activePreset.parts?.torso?.firewall}</div>
                </div>

                <div className="p-1.5 bg-surface border border-border/80 col-span-2 sm:col-span-1">
                  <div className="text-muted uppercase text-[9px] font-bold">Legs</div>
                  <div className="font-semibold text-foreground truncate">{activePreset.parts?.legs?.name}</div>
                  <div className="text-muted">Spd: {activePreset.parts?.legs?.clock_speed} | {activePreset.parts?.legs?.protocol}</div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-border mt-2 flex items-center justify-between">
              <span className="text-[10px] text-muted">
                Synergy: <strong className="text-foreground">{activePreset.affinity_synergy_bonus}</strong>
              </span>
              <button
                type="button"
                onClick={handleConfirmDeploy}
                className="px-5 py-2 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-sm"
              >
                {teamSize > 1 ? `Deploy Squad (${teamSize} Units) ➔` : 'Confirm AniBot ➔'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Blank Slate Custom Assembly */
        <div className="my-auto py-2">
          {showRestorePrompt && savedBuild && (
            <div className="bg-accent/10 border border-accent p-2.5 mb-2 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="text-accent font-bold">💾</span>
                <span className="text-[11px] text-foreground">
                  Previous custom loadout detected: <strong>{savedBuild.name}</strong>. Restore saved configuration?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestoreSavedBuild}
                  className="px-2.5 py-1 bg-accent text-white font-bold text-[10px] uppercase tracking-wider hover:bg-accent/90 cursor-pointer"
                >
                  Restore Build
                </button>
                <button
                  onClick={() => setShowRestorePrompt(false)}
                  className="px-2 py-1 border border-border text-muted hover:text-foreground text-[10px] uppercase cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Custom Name & Avatar Header */}
          <div className="border border-border bg-background p-3 mb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <img
                src={getBotAvatarUrl({ model_code: 'MOD-CUSTOM', parts: { head: activeCustomHead } }, anibotsData)}
                alt="Custom Avatar"
                className="w-12 h-12 rounded border border-border object-cover bg-surface shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-accent block mb-1">
                  Bot Designation (Slot {activeSlot + 1}{activeSlot === 0 ? ' • LEADER' : ''})
                </label>
                <input
                  type="text"
                  value={customBotName}
                  onChange={(e) => setCustomBotName(e.target.value)}
                  placeholder="Enter custom bot name..."
                  className="w-full sm:w-64 bg-surface border border-border px-2 py-1 text-xs text-foreground placeholder:text-muted focus:outline-accent font-mono"
                />
              </div>
            </div>
            <div className="text-right text-[10px] text-muted">
              Avatar Origin: <span className="text-foreground font-semibold">{activeCustomHead?.botName || 'Chassis Frame'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 border border-border bg-background p-3">
            {/* Chip Picker */}
            <div className="md:col-span-1 border-r border-border pr-2">
              <label className="text-[10px] uppercase font-bold text-accent block mb-1">Anima Core</label>
              <select
                value={customChipId}
                onChange={(e) => setCustomChipId(e.target.value)}
                className="w-full bg-surface border border-border p-1.5 text-xs text-foreground focus:outline-accent"
              >
                {chipsData.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.affinity})
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[10px] text-muted italic">
                &ldquo;{activeCustomChip.quote}&rdquo;
              </div>
            </div>

            {/* Head Picker */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted block mb-1">Head Slot</label>
              <select
                value={customHeadId}
                onChange={(e) => setCustomHeadId(e.target.value)}
                className="w-full bg-surface border border-border p-1.5 text-[11px] text-foreground focus:outline-accent"
              >
                {allParts.head.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[10px] text-muted">HP: {activeCustomHead.integrity}</div>
            </div>

            {/* Torso Picker */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted block mb-1">Torso Core</label>
              <select
                value={customTorsoId}
                onChange={(e) => setCustomTorsoId(e.target.value)}
                className="w-full bg-surface border border-border p-1.5 text-[11px] text-foreground focus:outline-accent"
              >
                {allParts.torso.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Max {p.max_loadout}t)
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[10px] text-muted">Firewall: {activeCustomTorso.firewall}</div>
            </div>

            {/* Left Arm Picker */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted block mb-1">Left Arm</label>
              <select
                value={customLArmId}
                onChange={(e) => setCustomLArmId(e.target.value)}
                className="w-full bg-surface border border-border p-1.5 text-[11px] text-foreground focus:outline-accent"
              >
                {allParts.leftArm.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Pwr: {p.payload}, W: {p.weight})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[10px] text-muted">Latency: {activeCustomLArm.latency}s</div>
            </div>

            {/* Right Arm Picker */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted block mb-1">Right Arm</label>
              <select
                value={customRArmId}
                onChange={(e) => setCustomRArmId(e.target.value)}
                className="w-full bg-surface border border-border p-1.5 text-[11px] text-foreground focus:outline-accent"
              >
                {allParts.rightArm.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Pwr: {p.payload}, W: {p.weight})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[10px] text-muted">Latency: {activeCustomRArm.latency}s</div>
            </div>

            {/* Legs Picker */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted block mb-1">Legs Base</label>
              <select
                value={customLegsId}
                onChange={(e) => setCustomLegsId(e.target.value)}
                className="w-full bg-surface border border-border p-1.5 text-[11px] text-foreground focus:outline-accent"
              >
                {allParts.legs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.protocol})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[10px] text-muted">Clock: {activeCustomLegs.clock_speed}</div>
            </div>
          </div>

          {/* Validation & Stat Diff */}
          <div className="flex items-center justify-between bg-surface border border-border p-3 mt-3">
            <div className="flex items-center gap-4">
              <span className={`text-[11px] font-bold ${isCustomOverweight ? 'text-amber-500' : 'text-emerald-500'}`}>
                Weight: {customWeight} / {customMaxLoadout} {isCustomOverweight && '(OVERWEIGHT +50% LATENCY PENALTY!)'}
              </span>
              <span className="text-[11px] text-muted">
                Total Integrity: {(activeCustomHead?.integrity || 0) + (activeCustomTorso?.integrity || 0) + (activeCustomLArm?.integrity || 0) + (activeCustomRArm?.integrity || 0) + (activeCustomLegs?.integrity || 0)} HP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmCustom}
                className="px-4 py-2 border border-accent bg-accent/15 text-accent font-bold uppercase tracking-wider hover:bg-accent/25 cursor-pointer"
              >
                Save To Slot {activeSlot + 1}
              </button>
              {teamSize > 1 && (
                <button
                  type="button"
                  onClick={handleConfirmDeploy}
                  className="px-5 py-2 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider cursor-pointer"
                >
                  Deploy Squad ➔
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
