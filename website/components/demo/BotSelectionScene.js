'use client';

import React, { useState, useMemo, useEffect } from 'react';
import anibotsData from '../../data/anibots.json';
import chipsData from '../../data/anima_chips.json';
import { isBuildOverweight, getBotAvatarUrl } from '../../utils/combatEngine';
import { battleAudio } from '../../utils/battleAudio';

export const BotSelectionScene = ({ onSelectBot }) => {
  const [tab, setTab] = useState('preset'); // 'preset' | 'custom'
  const [selectedBotId, setSelectedBotId] = useState(anibotsData[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [affinityFilter, setAffinityFilter] = useState('ALL');

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

  const handleConfirmPreset = () => {
    battleAudio.playClick();
    onSelectBot({
      botConfig: activePreset,
      chipConfig: presetChip,
      mode: 'preset',
    });
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
    onSelectBot({
      botConfig: customBot,
      chipConfig: activeCustomChip,
      mode: 'custom',
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-surface/50 font-mono text-xs overflow-y-auto">
      {/* Top Selector Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-3 gap-2">
        <div>
          <span className="text-[10px] tracking-widest uppercase text-accent font-bold">{'Scene 01 // Configuration'}</span>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground uppercase">
            Deploy Player AniBot
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-background border border-border p-0.5">
          <button
            onClick={() => { battleAudio.playClick(); setTab('preset'); }}
            className={`px-3 py-1 font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              tab === 'preset' ? 'bg-accent text-white font-bold' : 'text-muted hover:text-foreground'
            }`}
          >
            Full-Set Preset
          </button>
          <button
            onClick={() => { battleAudio.playClick(); setTab('custom'); }}
            className={`px-3 py-1 font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              tab === 'custom' ? 'bg-accent text-white font-bold' : 'text-muted hover:text-foreground'
            }`}
          >
            Blank-Slate Garage
          </button>
        </div>
      </div>

      {/* Main Mode Body */}
      {tab === 'preset' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-auto py-3">
          {/* Left: Bot List Scroll */}
          <div className="md:col-span-5 max-h-[340px] flex flex-col border border-border bg-background p-2">
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
                      onClick={() => { battleAudio.playClick(); setSelectedBotId(bot.id); }}
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
                          <div className="text-[10px] text-muted">{bot.model_code} • {bot.series}</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-surface border border-border uppercase">
                        {bot.affinity}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected Bot Detailed Specs */}
          <div className="md:col-span-7 border border-border bg-background p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between border-b border-border pb-2 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getBotAvatarUrl(activePreset, anibotsData)}
                    alt={activePreset.name}
                    className="w-12 h-12 rounded border border-border object-cover shadow-sm bg-surface shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div>
                    <span className="text-[10px] font-bold text-accent uppercase">{`${activePreset.model_code} // ${activePreset.series}`}</span>
                    <h3 className="text-base font-bold text-foreground">{activePreset.name}</h3>
                    <p className="text-[11px] text-muted line-clamp-1">{activePreset.archetype}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: presetChip.diode_color || '#00E5FF' }}
                    />
                    <span className="text-[11px] font-bold text-foreground">{presetChip.name}</span>
                  </div>
                  <span className="text-[10px] text-muted block italic">&ldquo;{presetChip.quote}&rdquo;</span>
                </div>
              </div>

              {/* 5-Slot Hardware Blueprint */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                <div className="border border-border p-2 bg-surface">
                  <span className="text-muted block text-[9px] uppercase">HEAD</span>
                  <div className="font-bold text-foreground truncate">{activePreset.parts?.head?.name}</div>
                  <div className="text-muted mt-1">HP: {activePreset.parts?.head?.integrity}</div>
                  <div className="text-accent font-semibold">Cache: {activePreset.parts?.head?.cache ?? 3}</div>
                </div>
                <div className="border border-border p-2 bg-surface">
                  <span className="text-muted block text-[9px] uppercase">TORSO</span>
                  <div className="font-bold text-foreground truncate">{activePreset.parts?.torso?.name}</div>
                  <div className="text-muted mt-1">HP: {activePreset.parts?.torso?.integrity}</div>
                  <div className="text-accent font-semibold">Armor: {activePreset.parts?.torso?.firewall}</div>
                </div>
                <div className="border border-border p-2 bg-surface">
                  <span className="text-muted block text-[9px] uppercase">L-ARM</span>
                  <div className="font-bold text-foreground truncate">{activePreset.parts?.left_arm?.name}</div>
                  <div className="text-muted mt-1">HP: {activePreset.parts?.left_arm?.integrity}</div>
                  <div className="text-accent font-semibold">Pwr: {activePreset.parts?.left_arm?.payload}</div>
                </div>
                <div className="border border-border p-2 bg-surface">
                  <span className="text-muted block text-[9px] uppercase">R-ARM</span>
                  <div className="font-bold text-foreground truncate">{activePreset.parts?.right_arm?.name}</div>
                  <div className="text-muted mt-1">HP: {activePreset.parts?.right_arm?.integrity}</div>
                  <div className="text-accent font-semibold">Pwr: {activePreset.parts?.right_arm?.payload}</div>
                </div>
                <div className="border border-border p-2 bg-surface">
                  <span className="text-muted block text-[9px] uppercase">LEGS</span>
                  <div className="font-bold text-foreground truncate">{activePreset.parts?.legs?.name}</div>
                  <div className="text-muted mt-1">HP: {activePreset.parts?.legs?.integrity}</div>
                  <div className="text-accent font-semibold">Spd: {activePreset.parts?.legs?.clock_speed}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-3 flex items-center justify-between">
              <span className="text-[10px] text-muted">
                Synergy: <strong className="text-foreground">{activePreset.affinity_synergy_bonus}</strong>
              </span>
              <button
                onClick={handleConfirmPreset}
                className="px-5 py-2 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer"
              >
                Confirm AniBot ➔
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Blank Slate Custom Assembly */
        <div className="my-auto py-2">
          {/* Restore Saved Build Banner */}
          {showRestorePrompt && savedBuild && (
            <div className="bg-accent/10 border border-accent p-2.5 mb-2.5 flex items-center justify-between animate-in fade-in">
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
                  Bot Designation (Custom Name)
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
                    {p.name} (HP: {p.integrity}, W: {p.weight})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[10px] text-muted">Payload: {activeCustomHead.payload || 0} | Cache: {activeCustomHead.cache ?? 3}</div>
            </div>

            {/* Torso Picker */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted block mb-1">Torso Chassis</label>
              <select
                value={customTorsoId}
                onChange={(e) => setCustomTorsoId(e.target.value)}
                className="w-full bg-surface border border-border p-1.5 text-[11px] text-foreground focus:outline-accent"
              >
                {allParts.torso.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (MaxLoad: {p.max_loadout})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[10px] text-muted">Firewall: {activeCustomTorso.firewall} | Cooling: {activeCustomTorso.cooling}</div>
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
                Weight Load: {customWeight} / {customMaxLoadout} {isCustomOverweight && '(OVERWEIGHT +50% LATENCY PENALTY!)'}
              </span>
              <span className="text-[11px] text-muted">
                Total Integrity: {(activeCustomHead?.integrity || 0) + (activeCustomTorso?.integrity || 0) + (activeCustomLArm?.integrity || 0) + (activeCustomRArm?.integrity || 0) + (activeCustomLegs?.integrity || 0)} HP
              </span>
            </div>
            <button
              onClick={handleConfirmCustom}
              className="px-5 py-2 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer"
            >
              Assemble & Deploy ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
