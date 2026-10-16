'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toggleSound, isSoundEnabled, playSelectSound } from '../../utils/audio';

const GITHUB_REPO = 'https://github.com/c42759/AniBots/';

export const Header = ({ mode, botCount, chipCount, partCount }) => {
  const [audioActive, setAudioActive] = useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const nextState = toggleSound();
    setAudioActive(nextState);
  };

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextTheme = isCurrentlyDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    try {
      localStorage.setItem('anibots-theme', nextTheme);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xs border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Masthead */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-baseline gap-2.5 group">
            <span className="w-2.5 h-2.5 bg-accent inline-block transition-transform group-hover:scale-125" />
            <span className="font-bold tracking-tight text-lg uppercase text-foreground">
              AniBots
            </span>
          </Link>
          <span className="text-border font-mono text-xs hidden sm:inline">/</span>
          <Link
            href="/dex/bots/"
            className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold hover:text-accent transition-colors hidden sm:inline-flex items-center gap-2"
          >
            <span>ANIDEX</span>
            <span className="text-[11px] text-muted font-normal">SPEC // v2.0</span>
          </Link>
        </div>

        {/* Center Category Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-muted">
          <Link
            href="/dex/bots/"
            onClick={() => playSelectSound()}
            className={`transition-colors ${
              mode === 'anibots'
                ? 'text-foreground font-semibold'
                : 'hover:text-foreground'
            }`}
          >
            01. Anibots ({botCount})
          </Link>
          <Link
            href="/dex/chips/"
            onClick={() => playSelectSound()}
            className={`transition-colors ${
              mode === 'chips'
                ? 'text-foreground font-semibold'
                : 'hover:text-foreground'
            }`}
          >
            02. Chips ({chipCount})
          </Link>
          <Link
            href="/dex/parts/"
            onClick={() => playSelectSound()}
            className={`transition-colors ${
              mode === 'parts'
                ? 'text-foreground font-semibold'
                : 'hover:text-foreground'
            }`}
          >
            03. Parts ({partCount})
          </Link>
        </nav>

        {/* Right Controls: Audio FX, Theme Toggle, Main Site, GitHub */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSoundToggle}
            type="button"
            aria-label="Toggle audio feedback"
            className={`px-3 py-1.5 border text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              audioActive
                ? 'border-accent/50 bg-accent/10 text-accent font-semibold'
                : 'border-border bg-surface text-muted hover:border-foreground hover:text-foreground'
            }`}
            title="Toggle Audio Feedback"
          >
            <span
              className={`w-1.5 h-1.5 ${
                audioActive ? 'bg-accent' : 'bg-muted/50'
              }`}
            />
            <span>{audioActive ? 'FX ON' : 'FX OFF'}</span>
          </button>

          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle color theme"
            className="px-3 py-1.5 border border-border bg-surface hover:border-foreground text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 text-foreground"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-foreground" />
            <span className="dark:hidden">Light</span>
            <span className="hidden dark:inline">Dark</span>
          </button>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-border bg-background hover:border-foreground text-foreground text-xs font-mono uppercase tracking-wider font-medium transition-colors"
          >
            ← Portal
          </Link>

          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-foreground text-background hover:bg-accent hover:text-white text-xs font-mono uppercase tracking-wider font-medium transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
};
