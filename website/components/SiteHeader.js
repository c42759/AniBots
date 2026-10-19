'use client';

import React from 'react';
import Link from 'next/link';

export const SiteHeader = ({ currentSection = '' }) => {
  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextTheme = isCurrentlyDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    try {
      localStorage.setItem('anibots-theme', nextTheme);
    } catch {
      // ignore
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
            <span className="font-mono text-[11px] text-muted hidden sm:inline-block">
              3047 AD
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-5 sm:gap-8 text-xs font-mono uppercase tracking-wider text-muted">
          <Link
            href="/"
            className={`transition-colors hidden md:inline-block ${
              currentSection === 'home' ? 'text-foreground font-semibold' : 'hover:text-foreground'
            }`}
          >
            Overview
          </Link>
          <Link
            href="/characters/"
            className={`transition-colors ${
              currentSection === 'characters'
                ? 'text-foreground font-bold border-b-2 border-accent pb-0.5'
                : 'hover:text-foreground'
            }`}
          >
            Characters
          </Link>
          <Link
            href="/lore/"
            className={`transition-colors ${
              currentSection === 'lore'
                ? 'text-foreground font-bold border-b-2 border-accent pb-0.5'
                : 'hover:text-foreground'
            }`}
          >
            Lore
          </Link>
          <Link
            href="/demo/"
            className={`transition-colors ${
              currentSection === 'demo'
                ? 'text-foreground font-bold border-b-2 border-accent pb-0.5'
                : 'hover:text-foreground'
            }`}
          >
            Battle Demo
          </Link>
          <Link
            href="/dex/"
            className={`transition-colors ${
              currentSection === 'dex'
                ? 'text-foreground font-bold border-b-2 border-accent pb-0.5'
                : 'hover:text-foreground'
            }`}
          >
            AniDex ↗
          </Link>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle color theme"
            className="px-3 py-1.5 border border-border bg-surface hover:border-foreground text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-foreground" />
            <span className="dark:hidden">Light</span>
            <span className="hidden dark:inline">Dark</span>
          </button>

          <a
            href="https://github.com/c42759/AniBots/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-3.5 py-1.5 bg-foreground text-background hover:bg-accent hover:text-white text-xs font-mono uppercase tracking-wider font-medium transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
};
