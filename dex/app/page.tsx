'use client';

import React, { useState, useMemo } from 'react';
import { AniBot, AnimaChip, CategoryMode } from '../types/dex';
import anibotsData from '../data/anibots.json';
import chipsData from '../data/anima_chips.json';
import { Header } from '../components/Header';
import { FilterBar } from '../components/FilterBar';
import { AniBotCard } from '../components/AniBotCard';
import { ChipCard } from '../components/ChipCard';
import { AniBotDetailModal } from '../components/AniBotDetailModal';
import { ChipDetailModal } from '../components/ChipDetailModal';

const allBots = anibotsData as unknown as AniBot[];
const allChips = chipsData as unknown as AnimaChip[];

export default function Home() {
  const [mode, setMode] = useState<CategoryMode>('anibots');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeries, setSelectedSeries] = useState<string>('ALL');
  const [selectedAffinity, setSelectedAffinity] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');

  const [selectedBot, setSelectedBot] = useState<AniBot | null>(null);
  const [selectedChip, setSelectedChip] = useState<AnimaChip | null>(null);

  // Derive unique series and affinities
  const availableSeries = useMemo(() => {
    const seriesSet = new Set<string>();
    allBots.forEach((b) => b.series && seriesSet.add(b.series));
    allChips.forEach((c) => c.series && seriesSet.add(c.series));
    return Array.from(seriesSet).sort();
  }, []);

  const availableAffinities = useMemo(() => {
    const affinitySet = new Set<string>();
    allBots.forEach((b) => b.affinity && affinitySet.add(b.affinity));
    allChips.forEach((c) => c.affinity && affinitySet.add(c.affinity));
    return Array.from(affinitySet).sort();
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
          const getHp = (bot: AniBot) =>
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

  // Navigation handlers
  const handleSelectChipById = (chipId: string) => {
    const foundChip = allChips.find(
      (c) => c.id.toLowerCase() === chipId.toLowerCase()
    );
    if (foundChip) {
      setSelectedBot(null);
      setSelectedChip(foundChip);
    }
  };

  const handleSelectBot = (bot: AniBot) => {
    setSelectedChip(null);
    setSelectedBot(bot);
  };

  const totalResults = mode === 'anibots' ? filteredBots.length : filteredChips.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 scanline-overlay">
      {/* Header */}
      <Header botCount={allBots.length} chipCount={allChips.length} />

      {/* Main Filter & Content Area */}
      <main className="flex-1 pb-16">
        <FilterBar
          mode={mode}
          onModeChange={setMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSeries={selectedSeries}
          onSeriesChange={setSelectedSeries}
          selectedAffinity={selectedAffinity}
          onAffinityChange={setSelectedAffinity}
          sortBy={sortBy}
          onSortChange={setSortBy}
          availableSeries={availableSeries}
          availableAffinities={availableAffinities}
          totalResults={totalResults}
        />

        {/* Grid Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
          {mode === 'anibots' ? (
            filteredBots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBots.map((bot) => (
                  <AniBotCard
                    key={bot.id}
                    bot={bot}
                    onSelect={setSelectedBot}
                    onSelectChip={handleSelectChipById}
                  />
                ))}
              </div>
            ) : (
              <EmptyState searchQuery={searchQuery} />
            )
          ) : filteredChips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredChips.map((chip) => (
                <ChipCard key={chip.id} chip={chip} onSelect={setSelectedChip} />
              ))}
            </div>
          ) : (
            <EmptyState searchQuery={searchQuery} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 text-center font-mono text-xs text-slate-500">
        <p>ANIDEX PROTOCOL • ANIBOTS DATABANK SYSTEM • ALL SPECS LOADED</p>
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
    </div>
  );
}

const EmptyState: React.FC<{ searchQuery: string }> = ({ searchQuery }) => (
  <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
    <span className="text-4xl mb-3">📡</span>
    <h3 className="text-lg font-bold text-slate-300 font-mono">NO ANIDEX RECORDS MATCH QUERY</h3>
    <p className="text-xs text-slate-500 mt-1 max-w-sm">
      {searchQuery
        ? `No entries matching "${searchQuery}". Try refining search terms or clearing active filters.`
        : 'No entries available under the selected filter criteria.'}
    </p>
  </div>
);
