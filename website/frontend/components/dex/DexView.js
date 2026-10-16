'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import anibotsData from '../../data/anibots.json';
import chipsData from '../../data/anima_chips.json';
import { Header } from './Header';
import { FilterBar } from './FilterBar';
import { AniBotCard } from './AniBotCard';
import { ChipCard } from './ChipCard';
import { PartCard } from './PartCard';
import { AniBotDetailModal } from './AniBotDetailModal';
import { ChipDetailModal } from './ChipDetailModal';
import { PartDetailModal } from './PartDetailModal';

const GITHUB_REPO = 'https://github.com/c42759/AniBots/';
const GITHUB_DISCUSSIONS = 'https://github.com/c42759/AniBots/discussions';
const GITHUB_ISSUES = 'https://github.com/c42759/AniBots/issues';
const DISCORD_INVITE_URL = 'https://discord.gg/FEjMjNGRFg';

const allBots = anibotsData;
const allChips = chipsData;

const SLOT_ORDER = {
  HEAD: 1,
  TORSO: 2,
  LEFT_ARM: 3,
  RIGHT_ARM: 4,
  LEGS: 5,
};

export const DexView = ({ mode = 'anibots' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  const [selectedAffinity, setSelectedAffinity] = useState('ALL');
  const [selectedSlot, setSelectedSlot] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');

  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedChip, setSelectedChip] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);

  // Extract all 190 modular parts across all 38 AniBots
  const allParts = useMemo(() => {
    const list = [];
    allBots.forEach((bot) => {
      if (!bot.parts) return;
      const meta = {
        botId: bot.id,
        botName: bot.name,
        botModelCode: bot.model_code,
        series: bot.series,
        affinity: bot.affinity,
        image: bot.image,
      };

      if (bot.parts.head) {
        list.push({ ...bot.parts.head, ...meta, slot: 'HEAD' });
      }
      if (bot.parts.torso) {
        list.push({ ...bot.parts.torso, ...meta, slot: 'TORSO' });
      }
      if (bot.parts.left_arm) {
        list.push({ ...bot.parts.left_arm, ...meta, slot: 'LEFT_ARM' });
      }
      if (bot.parts.right_arm) {
        list.push({ ...bot.parts.right_arm, ...meta, slot: 'RIGHT_ARM' });
      }
      if (bot.parts.legs) {
        list.push({ ...bot.parts.legs, ...meta, slot: 'LEGS' });
      }
    });
    return list;
  }, []);

  // Derive unique series and affinities
  const availableSeries = useMemo(() => {
    const seriesSet = new Set();
    allBots.forEach((b) => b.series && seriesSet.add(b.series));
    allChips.forEach((c) => c.series && seriesSet.add(c.series));
    return Array.from(seriesSet).sort();
  }, []);

  const availableAffinities = useMemo(() => {
    const affinitySet = new Set();
    allBots.forEach((b) => b.affinity && affinitySet.add(b.affinity));
    allChips.forEach((c) => c.affinity && affinitySet.add(c.affinity));
    return Array.from(affinitySet).sort();
  }, []);

  const availableSlots = useMemo(() => {
    return ['ALL', 'HEAD', 'TORSO', 'LEFT_ARM', 'RIGHT_ARM', 'LEGS'];
  }, []);

  // Filtered AniBots
  const filteredBots = useMemo(() => {
    return allBots
      .filter((bot) => {
        if (selectedSeries !== 'ALL' && bot.series !== selectedSeries) return false;
        if (selectedAffinity !== 'ALL' && bot.affinity !== selectedAffinity) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = bot.name.toLowerCase().includes(q);
          const matchCode = bot.model_code.toLowerCase().includes(q);
          const matchArch = bot.archetype.toLowerCase().includes(q);
          const matchDesc = bot.description.toLowerCase().includes(q);
          const matchChip = bot.preferred_chip?.toLowerCase().includes(q);
          return matchName || matchCode || matchArch || matchDesc || matchChip;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'code') return a.model_code.localeCompare(b.model_code);
        if (sortBy === 'integrity') {
          const getHp = (bot) =>
            (bot.parts?.head?.integrity || 0) +
            (bot.parts?.torso?.integrity || 0) +
            (bot.parts?.left_arm?.integrity || 0) +
            (bot.parts?.right_arm?.integrity || 0) +
            (bot.parts?.legs?.integrity || 0);
          return getHp(b) - getHp(a);
        }
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, selectedSeries, selectedAffinity, sortBy]);

  // Filtered Anima Chips
  const filteredChips = useMemo(() => {
    return allChips
      .filter((chip) => {
        if (selectedSeries !== 'ALL' && chip.series !== selectedSeries) return false;
        if (selectedAffinity !== 'ALL' && chip.affinity !== selectedAffinity) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = chip.name.toLowerCase().includes(q);
          const matchEngram = chip.personality_engram?.toLowerCase().includes(q);
          const matchPersonality = chip.personality?.toLowerCase().includes(q);
          const matchQuote = chip.quote?.toLowerCase().includes(q);
          const matchTrait = chip.passive_trait?.name?.toLowerCase().includes(q);
          return matchName || matchEngram || matchPersonality || matchQuote || matchTrait;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'code') return a.id.localeCompare(b.id);
        if (sortBy === 'integrity') {
          return (b.base_stats?.integrity || 0) - (a.base_stats?.integrity || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, selectedSeries, selectedAffinity, sortBy]);

  // Filtered Modular Parts
  const filteredParts = useMemo(() => {
    return allParts
      .filter((part) => {
        if (selectedSlot !== 'ALL' && part.slot !== selectedSlot) return false;
        if (selectedSeries !== 'ALL' && part.series !== selectedSeries) return false;
        if (selectedAffinity !== 'ALL' && part.affinity !== selectedAffinity) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = part.name.toLowerCase().includes(q);
          const matchSlot = part.slot.toLowerCase().includes(q);
          const matchType = part.type.toLowerCase().includes(q);
          const matchBotName = part.botName.toLowerCase().includes(q);
          const matchBotCode = part.botModelCode.toLowerCase().includes(q);
          const matchDesc = part.description.toLowerCase().includes(q);
          const matchProtocol = part.protocol?.toLowerCase().includes(q);
          return (
            matchName ||
            matchSlot ||
            matchType ||
            matchBotName ||
            matchBotCode ||
            matchDesc ||
            matchProtocol
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'slot') {
          const diff = (SLOT_ORDER[a.slot] || 99) - (SLOT_ORDER[b.slot] || 99);
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'integrity') {
          return b.integrity - a.integrity;
        }
        if (sortBy === 'bot') {
          return a.botModelCode.localeCompare(b.botModelCode);
        }
        return a.name.localeCompare(b.name);
      });
  }, [allParts, selectedSlot, selectedSeries, selectedAffinity, searchQuery, sortBy]);

  // Navigation handlers
  const handleSelectChipById = (chipId) => {
    const foundChip = allChips.find(
      (c) => c.id.toLowerCase() === chipId.toLowerCase()
    );
    if (foundChip) {
      setSelectedBot(null);
      setSelectedPart(null);
      setSelectedChip(foundChip);
    }
  };

  const handleSelectBot = (bot) => {
    setSelectedChip(null);
    setSelectedPart(null);
    setSelectedBot(bot);
  };

  const handleSelectBotById = (botId) => {
    const foundBot = allBots.find(
      (b) => b.id.toLowerCase() === botId.toLowerCase()
    );
    if (foundBot) {
      setSelectedChip(null);
      setSelectedPart(null);
      setSelectedBot(foundBot);
    }
  };

  const handleSelectPart = (part) => {
    setSelectedBot(null);
    setSelectedChip(null);
    setSelectedPart(part);
  };

  const totalResults =
    mode === 'anibots'
      ? filteredBots.length
      : mode === 'chips'
      ? filteredChips.length
      : filteredParts.length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      {/* Header */}
      <Header
        mode={mode}
        botCount={allBots.length}
        chipCount={allChips.length}
        partCount={allParts.length}
      />

      {/* Main Filter & Content Area */}
      <main className="flex-1 pb-20">
        <FilterBar
          mode={mode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSeries={selectedSeries}
          onSeriesChange={setSelectedSeries}
          selectedAffinity={selectedAffinity}
          onAffinityChange={setSelectedAffinity}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
          availableSlots={availableSlots}
          sortBy={sortBy}
          onSortChange={setSortBy}
          availableSeries={availableSeries}
          availableAffinities={availableAffinities}
          totalResults={totalResults}
          botCount={allBots.length}
          chipCount={allChips.length}
          partCount={allParts.length}
        />

        {/* Grid Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
          {mode === 'anibots' ? (
            filteredBots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-border">
                {filteredBots.map((bot) => (
                  <AniBotCard
                    key={bot.id}
                    bot={bot}
                    onSelect={handleSelectBot}
                    onSelectChip={handleSelectChipById}
                  />
                ))}
              </div>
            ) : (
              <EmptyState searchQuery={searchQuery} />
            )
          ) : mode === 'chips' ? (
            filteredChips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-border">
                {filteredChips.map((chip) => (
                  <ChipCard key={chip.id} chip={chip} onSelect={setSelectedChip} />
                ))}
              </div>
            ) : (
              <EmptyState searchQuery={searchQuery} />
            )
          ) : filteredParts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-border">
              {filteredParts.map((part) => (
                <PartCard
                  key={`${part.botId}_${part.id}_${part.slot}`}
                  part={part}
                  onSelect={handleSelectPart}
                  onSelectBot={handleSelectBotById}
                />
              ))}
            </div>
          ) : (
            <EmptyState searchQuery={searchQuery} />
          )}
        </div>
      </main>

      {/* Editorial Footer matching website */}
      <footer className="border-t border-border bg-surface/50 py-10 font-mono text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span className="text-foreground font-semibold">ANIDEX PROTOCOL</span>
            <span>— ANIBOTS DATABANK SYSTEM</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-accent font-semibold transition-colors">
              ← Main Portal
            </Link>
            <Link href="/dex/bots/" className="hover:text-foreground transition-colors">
              Bots
            </Link>
            <Link href="/dex/chips/" className="hover:text-foreground transition-colors">
              Chips
            </Link>
            <Link href="/dex/parts/" className="hover:text-foreground transition-colors">
              Parts
            </Link>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href={GITHUB_DISCUSSIONS} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Discussions
            </a>
            <a href={GITHUB_ISSUES} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Issues
            </a>
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Discord
            </a>
          </div>

          <div>MIT LICENSE • GODOT 4.X</div>
        </div>
      </footer>

      {/* Modals */}
      <AniBotDetailModal
        bot={selectedBot}
        onClose={() => setSelectedBot(null)}
        onSelectChip={handleSelectChipById}
      />

      <ChipDetailModal
        chip={selectedChip}
        allBots={allBots}
        onClose={() => setSelectedChip(null)}
        onSelectBot={handleSelectBot}
      />

      <PartDetailModal
        part={selectedPart}
        onClose={() => setSelectedPart(null)}
        onSelectBot={handleSelectBotById}
      />
    </div>
  );
};

const EmptyState = ({ searchQuery }) => (
  <div className="py-20 text-center flex flex-col items-center justify-center border border-border bg-surface/40">
    <span className="w-3 h-3 bg-accent mb-4 inline-block" />
    <h3 className="text-lg font-bold text-foreground font-mono uppercase tracking-wider">
      NO ANIDEX RECORDS MATCH QUERY
    </h3>
    <p className="text-xs text-muted mt-1.5 max-w-sm font-mono">
      {searchQuery
        ? `No entries matching "${searchQuery}". Try refining search terms or clearing active filters.`
        : 'No entries available under the selected filter criteria.'}
    </p>
  </div>
);
