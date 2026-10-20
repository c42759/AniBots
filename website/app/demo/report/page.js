'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteFooter';
import anibotsData from '../../../data/anibots.json';
import chipsData from '../../../data/anima_chips.json';
import { simulateHeadlessBattle, getBotAvatarUrl, TERRAINS } from '../../../utils/combatEngine';
import { AniBotDetailModal } from '../../../components/dex/AniBotDetailModal';
import { ChipDetailModal } from '../../../components/dex/ChipDetailModal';

export default function SimulationReportPage() {
  const [roundsPerMatchup, setRoundsPerMatchup] = useState(10);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  const [useDefaultChip, setUseDefaultChip] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState('CITY'); // 'CITY' | 'RUBBLE' | 'MUD' | 'FLOODED' | 'ROCKY' | 'RANDOM'
  const [searchQuery, setSearchQuery] = useState('');
  const [affinityFilter, setAffinityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('WIN_RATE_DESC'); // 'WIN_RATE_DESC' | 'WIN_RATE_ASC' | 'LOSE_RATE_DESC' | 'NAME_ASC' | 'NAME_DESC' | 'DEFAULT'
  const [selectedBotModal, setSelectedBotModal] = useState(null);
  const [selectedChipModal, setSelectedChipModal] = useState(null);

  // Map each bot to its chip (either universal chip_default or bot's preferred chip)
  const botChipMap = useMemo(() => {
    const map = new Map();
    const defaultChip = chipsData.find((c) => c.id === 'chip_default') || chipsData[0];
    anibotsData.forEach((bot) => {
      if (useDefaultChip) {
        map.set(bot.id, defaultChip);
      } else {
        const chip = chipsData.find((c) => c.id === bot.preferred_chip) || chipsData[0];
        map.set(bot.id, chip);
      }
    });
    return map;
  }, [useDefaultChip]);

  // Aggregated stats per bot: id -> { wins, losses, ties, total, winRate, loseRate }
  const [botStats, setBotStats] = useState(() => {
    const initial = {};
    anibotsData.forEach((b) => {
      initial[b.id] = { wins: 0, losses: 0, ties: 0, total: 0, winRate: 0, loseRate: 0 };
    });
    return initial;
  });

  // Progress tracking
  const [totalCompletedBattles, setTotalCompletedBattles] = useState(0);
  const [currentMatchup, setCurrentMatchup] = useState(null);
  const [battlesPerSec, setBattlesPerSec] = useState(0);

  // Simulation execution refs
  const simulationRef = useRef({
    isRunning: false,
    isPaused: false,
    queueIndex: 0,
    roundIndex: 0,
    startTime: 0,
    lastSecTime: 0,
    completedSinceLastSec: 0,
    totalBattlesGoal: 0,
  });

  // Keep a mutable copy of stats for high-frequency in-loop updates without closure staleness
  const liveStatsRef = useRef(botStats);
  liveStatsRef.current = botStats;

  const animFrameRef = useRef(null);

  // All bot affinities for filter dropdown
  const affinities = useMemo(() => {
    const list = anibotsData.map((b) => b.affinity).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, []);

  // Total possible pairings: N * N bots
  const totalPairings = useMemo(() => anibotsData.length * anibotsData.length, []);
  const totalBattlesGoal = totalPairings * roundsPerMatchup;

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      simulationRef.current.isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Reset all stats
  const handleReset = useCallback(() => {
    simulationRef.current.isRunning = false;
    simulationRef.current.isPaused = false;
    simulationRef.current.queueIndex = 0;
    simulationRef.current.roundIndex = 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const fresh = {};
    anibotsData.forEach((b) => {
      fresh[b.id] = { wins: 0, losses: 0, ties: 0, total: 0, winRate: 0, loseRate: 0 };
    });
    setBotStats(fresh);
    setTotalCompletedBattles(0);
    setCurrentMatchup(null);
    setBattlesPerSec(0);
    setStatus('IDLE');
  }, []);

  // Start or resume simulation
  const handleStartOrResume = useCallback(() => {
    if (status === 'RUNNING') return;

    if (status === 'PAUSED') {
      simulationRef.current.isRunning = true;
      simulationRef.current.isPaused = false;
      setStatus('RUNNING');
      scheduleNextBatch();
      return;
    }

    // Fresh start: reset stats first if previously completed
    if (status === 'COMPLETED') {
      handleReset();
    }

    const goal = anibotsData.length * anibotsData.length * roundsPerMatchup;
    simulationRef.current = {
      isRunning: true,
      isPaused: false,
      queueIndex: 0,
      roundIndex: 0,
      startTime: performance.now(),
      lastSecTime: performance.now(),
      completedSinceLastSec: 0,
      totalBattlesGoal: goal,
    };

    setStatus('RUNNING');
    scheduleNextBatch();
  }, [status, roundsPerMatchup, handleReset]);

  // Pause simulation
  const handlePause = useCallback(() => {
    simulationRef.current.isRunning = false;
    simulationRef.current.isPaused = true;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setStatus('PAUSED');
  }, []);

  // Chunked execution runner to keep 60 FPS while running hundreds of headless duels
  const scheduleNextBatch = useCallback(() => {
    if (!simulationRef.current.isRunning || simulationRef.current.isPaused) return;

    animFrameRef.current = requestAnimationFrame(() => {
      const state = simulationRef.current;
      if (!state.isRunning || state.isPaused) return;

      const numBots = anibotsData.length;
      const totalPairs = numBots * numBots;
      const currentStats = { ...liveStatsRef.current };

      const batchStartTime = performance.now();
      const maxBatchDurationMs = 12; // Run for max 12ms per frame to leave 4ms for rendering
      let completedInBatch = 0;
      let lastMatchupSeen = null;

      while (
        state.queueIndex < totalPairs &&
        performance.now() - batchStartTime < maxBatchDurationMs
      ) {
        const botAIndex = Math.floor(state.queueIndex / numBots);
        const botBIndex = state.queueIndex % numBots;
        const botA = anibotsData[botAIndex];
        const botB = anibotsData[botBIndex];
        const chipA = botChipMap.get(botA.id);
        const chipB = botChipMap.get(botB.id);

        lastMatchupSeen = {
          botA: botA.name,
          botB: botB.name,
          round: state.roundIndex + 1,
          totalRounds: roundsPerMatchup,
        };

        // Determine terrain for this duel
        const duelTerrainId =
          selectedTerrain === 'RANDOM'
            ? TERRAINS[Math.floor(Math.random() * TERRAINS.length)].id
            : selectedTerrain;

        // Run one fast headless battle
        const result = simulateHeadlessBattle(botA, chipA, botB, chipB, { terrainId: duelTerrainId });

        // Update stats
        const statA = currentStats[botA.id] || { wins: 0, losses: 0, ties: 0, total: 0 };
        const statB = currentStats[botB.id] || { wins: 0, losses: 0, ties: 0, total: 0 };

        if (result.winner === 'A') {
          statA.wins += 1;
          statB.losses += 1;
        } else if (result.winner === 'B') {
          statB.wins += 1;
          statA.losses += 1;
        } else {
          statA.ties += 1;
          statB.ties += 1;
        }

        statA.total += 1;
        statB.total += 1;
        statA.winRate = statA.total > 0 ? (statA.wins / statA.total) * 100 : 0;
        statA.loseRate = statA.total > 0 ? (statA.losses / statA.total) * 100 : 0;
        statB.winRate = statB.total > 0 ? (statB.wins / statB.total) * 100 : 0;
        statB.loseRate = statB.total > 0 ? (statB.losses / statB.total) * 100 : 0;

        currentStats[botA.id] = { ...statA };
        currentStats[botB.id] = { ...statB };

        completedInBatch += 1;
        state.completedSinceLastSec += 1;

        state.roundIndex += 1;
        if (state.roundIndex >= roundsPerMatchup) {
          state.roundIndex = 0;
          state.queueIndex += 1;
        }
      }

      // Commit live updates after each animation frame
      setBotStats(currentStats);
      setTotalCompletedBattles((prev) => prev + completedInBatch);
      if (lastMatchupSeen) setCurrentMatchup(lastMatchupSeen);

      // Speed calculation
      const now = performance.now();
      if (now - state.lastSecTime >= 500) {
        const elapsedSec = (now - state.lastSecTime) / 1000;
        const rate = Math.round(state.completedSinceLastSec / elapsedSec);
        setBattlesPerSec(rate);
        state.completedSinceLastSec = 0;
        state.lastSecTime = now;
      }

      // Check completion
      if (state.queueIndex >= totalPairs) {
        state.isRunning = false;
        setStatus('COMPLETED');
        setCurrentMatchup(null);
        setBattlesPerSec(0);
      } else {
        scheduleNextBatch();
      }
    });
  }, [anibotsData, botChipMap, roundsPerMatchup, selectedTerrain]);

  // Filtered and Sorted Bots List
  const displayedBots = useMemo(() => {
    let list = anibotsData.filter((bot) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        bot.name.toLowerCase().includes(q) ||
        bot.model_code.toLowerCase().includes(q) ||
        bot.series.toLowerCase().includes(q);
      const matchesAffinity = affinityFilter === 'ALL' || bot.affinity === affinityFilter;
      return matchesQuery && matchesAffinity;
    });

    list = [...list].sort((a, b) => {
      const statA = botStats[a.id] || { winRate: 0, loseRate: 0, wins: 0, total: 0 };
      const statB = botStats[b.id] || { winRate: 0, loseRate: 0, wins: 0, total: 0 };

      switch (sortBy) {
        case 'WIN_RATE_DESC':
          if (statB.winRate !== statA.winRate) return statB.winRate - statA.winRate;
          return statB.wins - statA.wins;
        case 'WIN_RATE_ASC':
          if (statA.winRate !== statB.winRate) return statA.winRate - statB.winRate;
          return statA.wins - statB.wins;
        case 'LOSE_RATE_DESC':
          return statB.loseRate - statA.loseRate;
        case 'NAME_ASC':
          return a.name.localeCompare(b.name);
        case 'NAME_DESC':
          return b.name.localeCompare(a.name);
        case 'DEFAULT':
        default:
          return anibotsData.indexOf(a) - anibotsData.indexOf(b);
      }
    });

    return list;
  }, [anibotsData, searchQuery, affinityFilter, sortBy, botStats]);

  const progressPercent = totalBattlesGoal > 0 ? Math.min(100, (totalCompletedBattles / totalBattlesGoal) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SiteHeader currentSection="demo" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col gap-5">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider mb-1">
              <span>Arena Telemetry</span>
              <span>•</span>
              <span>Round-Robin Matrix</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight uppercase text-foreground">
              AniBots Simulation Report
            </h1>
            <p className="text-xs text-muted font-mono mt-0.5">
              Headless ATB Combat Benchmark across all {anibotsData.length} chassis models
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/demo/"
              className="px-3.5 py-1.5 border border-border bg-surface hover:border-foreground text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <span>← Interactive 1v1 Arena</span>
            </Link>
          </div>
        </div>

        {/* Control Console */}
        <div className="border border-border bg-surface p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Setting: Number of Battles per matchup */}
              <div className="flex items-center gap-2.5">
                <label htmlFor="battles-input" className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                  Battles:
                </label>
                <input
                  id="battles-input"
                  type="number"
                  min="1"
                  max="100"
                  disabled={status === 'RUNNING'}
                  value={roundsPerMatchup}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1));
                    setRoundsPerMatchup(val);
                  }}
                  className="w-16 px-2 py-1.5 border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:border-accent disabled:opacity-50"
                />
                <span className="text-[11px] font-mono text-muted hidden md:inline">
                  ({totalPairings} × {roundsPerMatchup} = {totalBattlesGoal.toLocaleString()})
                </span>
              </div>

              {/* Setting: Terrain Selection */}
              <div className="flex items-center gap-2">
                <label htmlFor="terrain-select" className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                  Terrain:
                </label>
                <select
                  id="terrain-select"
                  disabled={status === 'RUNNING'}
                  value={selectedTerrain}
                  onChange={(e) => {
                    setSelectedTerrain(e.target.value);
                    if (status !== 'IDLE') handleReset();
                  }}
                  className="px-2.5 py-1.5 border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer"
                >
                  {TERRAINS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.shortName || t.name} {t.id === 'CITY' ? '(Default)' : ''}
                    </option>
                  ))}
                  <option value="RANDOM">🎲 Randomize Per Duel</option>
                </select>
              </div>

              {/* Setting: Default Chip Toggle */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="default-chip-toggle"
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted font-semibold cursor-pointer select-none"
                >
                  <input
                    id="default-chip-toggle"
                    type="checkbox"
                    checked={useDefaultChip}
                    disabled={status === 'RUNNING'}
                    onChange={(e) => {
                      setUseDefaultChip(e.target.checked);
                      if (status !== 'IDLE') handleReset();
                    }}
                    className="w-4 h-4 accent-accent cursor-pointer disabled:opacity-50"
                  />
                  <span>Use Default Chip (chip_default)</span>
                </label>
              </div>
            </div>

            {/* Execution Buttons */}
            <div className="flex items-center gap-2">
              {status === 'RUNNING' ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-4 py-2 border border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  ⏸ Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartOrResume}
                  className="px-5 py-2 border border-accent bg-accent text-accent-foreground hover:opacity-90 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-opacity flex items-center gap-2 shadow-sm"
                >
                  <span>{status === 'PAUSED' ? '▶ Resume' : status === 'COMPLETED' ? '↺ Re-run Simulation' : '▶ Start Benchmark'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                disabled={status === 'IDLE' && totalCompletedBattles === 0}
                className="px-3.5 py-2 border border-border bg-surface hover:border-foreground text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Telemetry Progress Bar */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  status === 'RUNNING'
                    ? 'bg-emerald-500 animate-pulse'
                    : status === 'PAUSED'
                    ? 'bg-amber-500'
                    : status === 'COMPLETED'
                    ? 'bg-sky-500'
                    : 'bg-muted'
                }`} />
                <span className="font-bold uppercase tracking-wider">
                  Status: {status}
                </span>
                {status === 'RUNNING' && battlesPerSec > 0 && (
                  <span className="text-muted">
                    ({battlesPerSec.toLocaleString()} battles/sec)
                  </span>
                )}
              </div>

              <div className="text-right text-muted">
                <strong className="text-foreground">{totalCompletedBattles.toLocaleString()}</strong> / {totalBattlesGoal.toLocaleString()} duels ({progressPercent.toFixed(1)}%)
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2.5 bg-background border border-border overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-150 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Active Simulation Parameters Summary */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted pt-0.5">
              <span>
                Terrain:{' '}
                <strong className="text-foreground">
                  {selectedTerrain === 'RANDOM'
                    ? '🎲 Random Per Duel'
                    : TERRAINS.find((t) => t.id === selectedTerrain)?.shortName || selectedTerrain}
                </strong>
              </span>
              <span>•</span>
              <span>
                Chip Config:{' '}
                <strong className={useDefaultChip ? 'text-amber-500 font-bold' : 'text-foreground'}>
                  {useDefaultChip ? 'Standardized (chip_default)' : 'Preferred Spec'}
                </strong>
              </span>
            </div>

            {/* Currently Simulating Matchup Sub-HUD */}
            {currentMatchup && (() => {
              const botAObj = anibotsData.find((b) => b.name === currentMatchup.botA);
              const botBObj = anibotsData.find((b) => b.name === currentMatchup.botB);
              return (
                <div className="text-[11px] font-mono text-muted flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    <span>Simulating:</span>
                    <div className="flex items-center gap-1">
                      {botAObj && (
                        <img
                          src={getBotAvatarUrl(botAObj, anibotsData)}
                          alt={botAObj.name}
                          className="w-4 h-4 rounded-xs object-cover border border-border"
                        />
                      )}
                      <span className="text-foreground font-semibold">{currentMatchup.botA}</span>
                    </div>
                    <span className="text-accent font-bold">VS</span>
                    <div className="flex items-center gap-1">
                      {botBObj && (
                        <img
                          src={getBotAvatarUrl(botBObj, anibotsData)}
                          alt={botBObj.name}
                          className="w-4 h-4 rounded-xs object-cover border border-border"
                        />
                      )}
                      <span className="text-foreground font-semibold">{currentMatchup.botB}</span>
                    </div>
                  </div>
                  <span>
                    Round {currentMatchup.round} / {currentMatchup.totalRounds}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Filters and Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search bot name, model, series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-border bg-surface text-foreground font-mono text-xs focus:outline-none focus:border-accent w-full sm:w-64"
            />

            {/* Affinity Filter */}
            <select
              value={affinityFilter}
              onChange={(e) => setAffinityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-border bg-surface text-foreground font-mono text-xs focus:outline-none focus:border-accent"
            >
              {affinities.map((aff) => (
                <option key={aff} value={aff}>
                  Affinity: {aff}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2">
            <span className="text-muted uppercase text-[11px]">Sort By:</span>
            <div className="inline-flex border border-border bg-surface">
              <button
                type="button"
                onClick={() => setSortBy('WIN_RATE_DESC')}
                className={`px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  sortBy === 'WIN_RATE_DESC' ? 'bg-accent text-accent-foreground font-bold' : 'hover:text-foreground text-muted'
                }`}
              >
                Win Rate ↓
              </button>
              <button
                type="button"
                onClick={() => setSortBy('WIN_RATE_ASC')}
                className={`px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider border-l border-border transition-colors ${
                  sortBy === 'WIN_RATE_ASC' ? 'bg-accent text-accent-foreground font-bold' : 'hover:text-foreground text-muted'
                }`}
              >
                Win Rate ↑
              </button>
              <button
                type="button"
                onClick={() => setSortBy('LOSE_RATE_DESC')}
                className={`px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider border-l border-border transition-colors ${
                  sortBy === 'LOSE_RATE_DESC' ? 'bg-accent text-accent-foreground font-bold' : 'hover:text-foreground text-muted'
                }`}
              >
                Lose Rate ↓
              </button>
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'NAME_ASC' ? 'NAME_DESC' : 'NAME_ASC')}
                className={`px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider border-l border-border transition-colors ${
                  sortBy === 'NAME_ASC' || sortBy === 'NAME_DESC'
                    ? 'bg-accent text-accent-foreground font-bold'
                    : 'hover:text-foreground text-muted'
                }`}
              >
                Name {sortBy === 'NAME_ASC' ? 'A→Z' : sortBy === 'NAME_DESC' ? 'Z→A' : '↕'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Standings Table */}
        <div className="border border-border bg-surface overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-background/60 uppercase tracking-wider text-[11px] text-muted">
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-4 min-w-[200px]">AniBot Unit</th>
                <th className="py-2.5 px-3 text-center w-28">Affinity</th>
                <th className="py-2.5 px-3 text-center w-36">Chip Engram</th>
                <th className="py-2.5 px-3 text-center w-24">Duels</th>
                <th className="py-2.5 px-3 text-center w-32">W / L Record</th>
                <th className="py-2.5 px-4 min-w-[220px]">Win Rate (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {displayedBots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No AniBots matched your query.
                  </td>
                </tr>
              ) : (
                displayedBots.map((bot, index) => {
                  const stat = botStats[bot.id] || { wins: 0, losses: 0, ties: 0, total: 0, winRate: 0, loseRate: 0 };
                  const chip = botChipMap.get(bot.id);
                  const isFightingNow = currentMatchup && (currentMatchup.botA === bot.name || currentMatchup.botB === bot.name);

                  // Win rate bar color coding
                  const winRateColor =
                    stat.winRate >= 60
                      ? 'bg-emerald-500'
                      : stat.winRate >= 45
                      ? 'bg-sky-500'
                      : stat.winRate >= 30
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                  return (
                    <tr
                      key={bot.id}
                      onClick={() => setSelectedBotModal(bot)}
                      title={`Click to inspect ${bot.name} chassis specifications`}
                      className={`transition-colors hover:bg-accent/10 cursor-pointer group ${
                        isFightingNow ? 'bg-accent/15 border-l-2 border-accent' : ''
                      }`}
                    >
                      {/* Rank Index */}
                      <td className="py-2.5 px-3 text-center text-muted font-bold">
                        {index + 1}
                      </td>

                      {/* Bot Avatar + Name + Model */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 border border-border bg-background relative shrink-0 overflow-hidden">
                            <Image
                              src={getBotAvatarUrl(bot, anibotsData)}
                              alt={bot.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm tracking-tight flex items-center gap-1.5">
                              {bot.name}
                              {isFightingNow && (
                                <span className="text-[10px] px-1 py-0.2 rounded-xs bg-accent text-accent-foreground font-mono animate-pulse">
                                  BATTLE
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-muted font-mono">
                              {bot.model_code} • {bot.series}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Affinity */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 border border-border text-[10px] font-mono uppercase bg-background text-foreground">
                          {bot.affinity || 'NEUTRAL'}
                        </span>
                      </td>

                      {/* Chip Engram */}
                      <td className="py-2.5 px-3 text-center text-muted text-[11px]">
                        <span
                          className={`truncate block max-w-[130px] mx-auto ${useDefaultChip ? 'text-amber-500 font-semibold' : ''}`}
                          title={chip?.name}
                        >
                          {chip?.name?.replace(' Chip', '') || 'Standard'}
                        </span>
                      </td>

                      {/* Duels Played */}
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className="text-foreground font-semibold">{stat.total.toLocaleString()}</span>
                      </td>

                      {/* Win / Loss Record */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                        <span className="text-emerald-500 font-bold">{stat.wins}W</span>
                        <span className="text-muted mx-1">-</span>
                        <span className="text-rose-400 font-bold">{stat.losses}L</span>
                        {stat.ties > 0 && (
                          <span className="text-muted ml-1">({stat.ties}T)</span>
                        )}
                      </td>

                      {/* Win Rate Bar & Percentage */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-background border border-border overflow-hidden">
                            <div
                              className={`h-full ${winRateColor} transition-all duration-75`}
                              style={{ width: `${Math.min(100, stat.winRate)}%` }}
                            />
                          </div>
                          <span className="font-bold font-mono text-sm min-w-[50px] text-right">
                            {stat.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* AniBot Chassis Specification Modal (reused from AniDex) */}
      {selectedBotModal && (
        <AniBotDetailModal
          bot={selectedBotModal}
          onClose={() => setSelectedBotModal(null)}
          onSelectChip={(chipId) => {
            const found = chipsData.find((c) => c.id === chipId);
            if (found) setSelectedChipModal(found);
          }}
        />
      )}

      {/* Anima Chip Specification Modal */}
      {selectedChipModal && (
        <ChipDetailModal
          chip={selectedChipModal}
          onClose={() => setSelectedChipModal(null)}
        />
      )}

      <SiteFooter />
    </div>
  );
}
