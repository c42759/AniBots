'use client';

import React from 'react';
import { CategoryMode } from '../types/dex';
import { playBeep, playSelectSound } from '../utils/audio';

interface FilterBarProps {
  mode: CategoryMode;
  onModeChange: (mode: CategoryMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSeries: string;
  onSeriesChange: (s: string) => void;
  selectedAffinity: string;
  onAffinityChange: (a: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  availableSeries: string[];
  availableAffinities: string[];
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  mode,
  onModeChange,
  searchQuery,
  onSearchChange,
  selectedSeries,
  onSeriesChange,
  selectedAffinity,
  onAffinityChange,
  sortBy,
  onSortChange,
  availableSeries,
  availableAffinities,
  totalResults,
}) => {
  const handleReset = () => {
    playBeep(400, 0.05, 'square');
    onSearchChange('');
    onSeriesChange('ALL');
    onAffinityChange('ALL');
    onSortChange('name');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 space-y-4">
      {/* Top Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              playSelectSound();
              onModeChange('anibots');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === 'anibots'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🤖 ANIBOTS</span>
          </button>
          <button
            onClick={() => {
              playSelectSound();
              onModeChange('chips');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === 'chips'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>💾 ANIMA CHIPS</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>MATCHES FOUND:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold text-sm">
            {totalResults}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Bar */}
        <div className="lg:col-span-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              mode === 'anibots'
                ? 'Search name, model code, archetype...'
                : 'Search name, personality, quote, trait...'
            }
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 pl-9 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>

        {/* Series Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedSeries}
            onChange={(e) => {
              playBeep(700, 0.03);
              onSeriesChange(e.target.value);
            }}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Series</option>
            {availableSeries.map((s) => (
              <option key={s} value={s}>
                Series: {s}
              </option>
            ))}
          </select>
        </div>

        {/* Affinity Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedAffinity}
            onChange={(e) => {
              playBeep(700, 0.03);
              onAffinityChange(e.target.value);
            }}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Affinities</option>
            {availableAffinities.map((a) => (
              <option key={a} value={a}>
                Affinity: {a}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By & Reset */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => {
              playBeep(750, 0.03);
              onSortChange(e.target.value);
            }}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="name">Sort: Name</option>
            <option value="code">Sort: Code / ID</option>
            <option value="integrity">Sort: Max Integrity</option>
          </select>

          {(searchQuery || selectedSeries !== 'ALL' || selectedAffinity !== 'ALL') && (
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 hover:bg-red-900/60 text-xs font-mono shrink-0"
              title="Reset Filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
