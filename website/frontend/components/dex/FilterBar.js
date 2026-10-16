'use client';

import React from 'react';
import Link from 'next/link';
import { playBeep, playSelectSound } from '../../utils/audio';

const CATEGORY_TABS = [
  {
    id: 'anibots',
    index: '01',
    label: 'AniBots Chassis Frames',
    shortLabel: 'ANIBOTS',
    href: '/dex/bots/',
    tag: '5-Part Assemblies',
  },
  {
    id: 'chips',
    index: '02',
    label: 'Anima Chip AI Cores',
    shortLabel: 'CHIPS',
    href: '/dex/chips/',
    tag: 'Utility Matrices',
  },
  {
    id: 'parts',
    index: '03',
    label: 'Modular Hardware Parts',
    shortLabel: 'PARTS',
    href: '/dex/parts/',
    tag: 'Swappable Sockets',
  },
];

export const FilterBar = ({
  mode,
  searchQuery,
  onSearchChange,
  selectedSeries,
  onSeriesChange,
  selectedAffinity,
  onAffinityChange,
  selectedSlot = 'ALL',
  onSlotChange,
  availableSlots = ['ALL', 'HEAD', 'TORSO', 'LEFT_ARM', 'RIGHT_ARM', 'LEGS'],
  sortBy,
  onSortChange,
  availableSeries,
  availableAffinities,
  totalResults,
  botCount,
  chipCount,
  partCount,
}) => {
  const handleReset = () => {
    playBeep(400, 0.05, 'square');
    onSearchChange('');
    onSeriesChange('ALL');
    onAffinityChange('ALL');
    if (onSlotChange) onSlotChange('ALL');
    onSortChange('name');
  };

  const isPartsMode = mode === 'parts';

  const getCountForTab = (id) => {
    if (id === 'anibots') return `${botCount} Frames`;
    if (id === 'chips') return `${chipCount} Cores`;
    return `${partCount} Parts`;
  };

  return (
    <section className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Metadata Sub-header bar */}
        <div className="py-4 border-b border-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted">
          <div className="flex items-center gap-4">
            <span className="text-foreground font-semibold">
              INDEX 01 — ANIDEX TACTICAL DATABANK
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">HARDWARE &amp; AI SPECIFICATION CATALOG</span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              ACTIVE VIEW:{' '}
              <strong className="text-foreground uppercase">{mode}</strong>
            </span>
            <span>•</span>
            <span className="text-accent font-semibold">
              MATCHES FOUND: {totalResults}
            </span>
          </div>
        </div>

        {/* Editorial Title & Summary Strip */}
        <div className="grid lg:grid-cols-12 gap-8 py-10 sm:py-12 border-b border-border items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
              Public Companion Database // 3047 AD Specifications
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-none text-foreground">
              {mode === 'anibots'
                ? 'AniBot Chassis Frames'
                : mode === 'chips'
                ? 'Anima Chip AI Matrices'
                : 'Modular Hardware Components'}
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {mode === 'anibots'
                ? 'Inspect complete 5-part robot assemblies, total frame integrity, weight tolerances, and preferred Anima Chip synergies.'
                : mode === 'chips'
                ? 'Explore autonomous AI cores, weighted target priorities, diode spectrums, passive traits, and overclock ultimate abilities.'
                : 'Filter all 190 individual Head, Torso, Left Arm, Right Arm, and Legs sockets across payload, firewall, and locomotion protocols.'}
            </p>
          </div>
        </div>

        {/* Category Navigation Tabs (Editorial Index Bar matching website Role Tabs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-l border-border">
          {CATEGORY_TABS.map((tab) => {
            const isActive = mode === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={() => playSelectSound()}
                className={`p-5 sm:p-6 text-left border-r border-b sm:border-b-0 border-border transition-colors flex flex-col justify-between ${
                  isActive
                    ? 'bg-foreground text-background'
                    : 'bg-background hover:bg-surface text-foreground'
                }`}
              >
                <div className="flex items-center justify-between w-full font-mono text-[11px] mb-3">
                  <span className={isActive ? 'text-accent font-bold' : 'text-muted'}>
                    CATALOG {tab.index}
                  </span>
                  <span
                    className={`px-2 py-0.5 border ${
                      isActive
                        ? 'border-background/30 text-background'
                        : 'border-border bg-surface text-muted'
                    }`}
                  >
                    {getCountForTab(tab.id)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-bold text-base sm:text-lg tracking-tight">
                    {tab.label}
                  </div>
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider ${
                      isActive ? 'text-background/75' : 'text-muted'
                    }`}
                  >
                    [{tab.shortLabel}]
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="py-5 bg-surface/40 -mx-4 px-4 sm:mx-0 sm:px-6 border-l border-r border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className={`${isPartsMode ? 'lg:col-span-3' : 'lg:col-span-4'} relative`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  mode === 'anibots'
                    ? 'Search name, model code, archetype...'
                    : mode === 'chips'
                    ? 'Search name, personality, quote, trait...'
                    : 'Search part name, slot, type, bot...'
                }
                className="w-full bg-background border border-border px-3.5 py-2.5 pr-8 text-xs font-mono text-foreground placeholder-muted focus:outline-none focus:border-foreground transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  type="button"
                  className="absolute right-2.5 top-2.5 text-muted hover:text-foreground text-xs font-mono cursor-pointer"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Slot Filter (Parts mode only) */}
            {isPartsMode && onSlotChange && (
              <div className="lg:col-span-2">
                <select
                  value={selectedSlot}
                  onChange={(e) => {
                    playBeep(700, 0.03);
                    onSlotChange(e.target.value);
                  }}
                  className="w-full bg-background border border-border px-3 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground uppercase cursor-pointer"
                >
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot === 'ALL' ? 'SLOT: ALL (5)' : `SLOT: ${slot.replace('_', ' ')}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Series Filter */}
            <div className={`${isPartsMode ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <select
                value={selectedSeries}
                onChange={(e) => {
                  playBeep(700, 0.03);
                  onSeriesChange(e.target.value);
                }}
                className="w-full bg-background border border-border px-3 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground uppercase cursor-pointer"
              >
                <option value="ALL">SERIES: ALL</option>
                {availableSeries.map((s) => (
                  <option key={s} value={s}>
                    SERIES: {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Affinity Filter */}
            <div className={`${isPartsMode ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <select
                value={selectedAffinity}
                onChange={(e) => {
                  playBeep(700, 0.03);
                  onAffinityChange(e.target.value);
                }}
                className="w-full bg-background border border-border px-3 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground uppercase cursor-pointer"
              >
                <option value="ALL">AFFINITY: ALL</option>
                {availableAffinities.map((a) => (
                  <option key={a} value={a}>
                    AFFINITY: {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By & Reset */}
            <div
              className={`${
                isPartsMode ? 'lg:col-span-3' : 'lg:col-span-2'
              } flex items-center gap-2`}
            >
              <select
                value={sortBy}
                onChange={(e) => {
                  playBeep(750, 0.03);
                  onSortChange(e.target.value);
                }}
                className="w-full bg-background border border-border px-2.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground uppercase cursor-pointer"
              >
                <option value="name">SORT: NAME</option>
                {isPartsMode ? (
                  <>
                    <option value="slot">SORT: SLOT ORDER</option>
                    <option value="integrity">SORT: INTEGRITY</option>
                    <option value="bot">SORT: PARENT BOT</option>
                  </>
                ) : (
                  <>
                    <option value="code">SORT: CODE / ID</option>
                    <option value="integrity">SORT: INTEGRITY</option>
                  </>
                )}
              </select>

              {(searchQuery ||
                selectedSeries !== 'ALL' ||
                selectedAffinity !== 'ALL' ||
                (isPartsMode && selectedSlot !== 'ALL')) && (
                <button
                  onClick={handleReset}
                  type="button"
                  className="px-3 py-2.5 bg-accent text-white font-mono text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
                  title="Reset Filters"
                >
                  RESET
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
