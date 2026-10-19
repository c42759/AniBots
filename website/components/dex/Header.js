'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toggleSound, isSoundEnabled, playSelectSound } from '../../utils/audio';

const GITHUB_REPO = 'https://github.com/c42759/AniBots/';

export const Header = ({ mode, botCount, chipCount, partCount }) => {
  const [audioActive, setAudioActive] = useState(isSoundEnabled());
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

        {/* Global Nav Links (Always: Characters, Lore, Battle Demo, Dex) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-mono uppercase tracking-wider text-muted">
          <Link
            href="/characters/"
            className="hover:text-foreground transition-colors"
          >
            Characters
          </Link>
          <Link
            href="/lore/"
            className="hover:text-foreground transition-colors"
          >
            Lore
          </Link>
          <Link
            href="/demo/"
            className="hover:text-foreground transition-colors"
          >
            Battle Demo
          </Link>
          <Link
            href="/dex/"
            className="text-foreground font-bold border-b-2 border-accent pb-0.5"
          >
            Dex
          </Link>
        </nav>

        {/* Right Controls: Audio FX, Theme Toggle, Main Site, GitHub, Mobile Menu */}
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
            <span className="hidden sm:inline">{audioActive ? 'FX ON' : 'FX OFF'}</span>
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

          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-3.5 py-1.5 bg-foreground text-background hover:bg-accent hover:text-white text-xs font-mono uppercase tracking-wider font-medium transition-colors"
          >
            GitHub ↗
          </a>

          {/* Mobile Burger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileOpen}
            className="lg:hidden p-2 border border-border bg-surface hover:border-foreground text-foreground flex flex-col justify-center items-center gap-1 w-9 h-9 cursor-pointer transition-colors"
          >
            <span
              className={`w-4 h-0.5 bg-foreground transition-transform duration-200 ${
                isMobileOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-foreground transition-opacity duration-200 ${
                isMobileOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-foreground transition-transform duration-200 ${
                isMobileOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileOpen && (
        <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-md px-4 py-4 flex flex-col gap-2 font-mono text-xs uppercase tracking-wider shadow-lg">
          <Link
            href="/characters/"
            onClick={() => setIsMobileOpen(false)}
            className="px-3 py-2 border border-transparent hover:bg-surface text-muted hover:text-foreground transition-colors flex items-center justify-between"
          >
            <span>Characters</span>
            <span className="text-[10px] text-muted font-normal">Databank</span>
          </Link>
          <Link
            href="/lore/"
            onClick={() => setIsMobileOpen(false)}
            className="px-3 py-2 border border-transparent hover:bg-surface text-muted hover:text-foreground transition-colors flex items-center justify-between"
          >
            <span>Lore</span>
            <span className="text-[10px] text-muted font-normal">Canon Bible</span>
          </Link>
          <Link
            href="/demo/"
            onClick={() => setIsMobileOpen(false)}
            className="px-3 py-2 border border-transparent hover:bg-surface text-muted hover:text-foreground transition-colors flex items-center justify-between"
          >
            <span>Battle Demo</span>
            <span className="text-[10px] text-muted font-normal">1v1 Combat</span>
          </Link>
          <Link
            href="/dex/"
            onClick={() => setIsMobileOpen(false)}
            className="px-3 py-2 border border-accent bg-accent/10 text-foreground font-bold transition-colors flex items-center justify-between"
          >
            <span>Dex</span>
            <span className="text-[10px] text-accent font-semibold">Active</span>
          </Link>

          <div className="pt-2 mt-1 border-t border-border flex items-center justify-between gap-2">
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className="px-3 py-1.5 text-muted hover:text-foreground text-[11px]"
            >
              ← Overview
            </Link>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-foreground text-background text-[11px] font-medium"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
