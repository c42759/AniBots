'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const GITHUB_REPO = 'https://github.com/c42759/AniBots/';

export const SiteHeader = ({ currentSection = '' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-muted">
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
            Dex
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
            className="md:hidden p-2 border border-border bg-surface hover:border-foreground text-foreground flex flex-col justify-center items-center gap-1 w-9 h-9 cursor-pointer transition-colors"
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
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-md px-4 py-4 flex flex-col gap-2 font-mono text-xs uppercase tracking-wider shadow-lg">
          <Link
            href="/characters/"
            onClick={() => setIsMobileOpen(false)}
            className={`px-3 py-2.5 border transition-colors flex items-center justify-between ${
              currentSection === 'characters'
                ? 'border-accent bg-accent/10 text-foreground font-bold'
                : 'border-transparent hover:bg-surface text-muted hover:text-foreground'
            }`}
          >
            <span>Characters</span>
            <span className="text-[10px] text-muted font-normal">Databank</span>
          </Link>
          <Link
            href="/lore/"
            onClick={() => setIsMobileOpen(false)}
            className={`px-3 py-2.5 border transition-colors flex items-center justify-between ${
              currentSection === 'lore'
                ? 'border-accent bg-accent/10 text-foreground font-bold'
                : 'border-transparent hover:bg-surface text-muted hover:text-foreground'
            }`}
          >
            <span>Lore</span>
            <span className="text-[10px] text-muted font-normal">Canon Bible</span>
          </Link>
          <Link
            href="/demo/"
            onClick={() => setIsMobileOpen(false)}
            className={`px-3 py-2.5 border transition-colors flex items-center justify-between ${
              currentSection === 'demo'
                ? 'border-accent bg-accent/10 text-foreground font-bold'
                : 'border-transparent hover:bg-surface text-muted hover:text-foreground'
            }`}
          >
            <span>Battle Demo</span>
            <span className="text-[10px] text-muted font-normal">1v1 Combat</span>
          </Link>
          <Link
            href="/dex/"
            onClick={() => setIsMobileOpen(false)}
            className={`px-3 py-2.5 border transition-colors flex items-center justify-between ${
              currentSection === 'dex'
                ? 'border-accent bg-accent/10 text-foreground font-bold'
                : 'border-transparent hover:bg-surface text-muted hover:text-foreground'
            }`}
          >
            <span>Dex</span>
            <span className="text-[10px] text-accent font-semibold">AniDex ↗</span>
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
