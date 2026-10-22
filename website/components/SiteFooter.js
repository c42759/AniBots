'use client';

import React from 'react';
import Link from 'next/link';

const GITHUB_REPO = 'https://github.com/c42759/AniBots/';
const GITHUB_DISCUSSIONS = 'https://github.com/c42759/AniBots/discussions';
const GITHUB_ISSUES = 'https://github.com/c42759/AniBots/issues';
const DISCORD_INVITE_URL = 'https://discord.gg/FEjMjNGRFg';

export const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-surface/50 py-10 font-mono text-xs text-muted mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-8">
        {/* Upper Row: Brand & Main Nav Links */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-accent inline-block" />
              <span className="text-foreground font-bold uppercase tracking-wider text-sm">
                ANIBOTS PROJECT
              </span>
              <span className="text-muted hidden sm:inline">— OPEN SOURCE TACTICAL RPG</span>
            </div>
            <p className="text-[11px] text-muted">
              Modular machines & autonomous AI cores. Built in Godot 4.x.
            </p>
          </div>

          {/* Primary Navigation Links */}
          <nav className="flex flex-wrap items-center gap-5 sm:gap-6 uppercase tracking-wider">
            <Link href="/" className="hover:text-foreground transition-colors">
              Overview
            </Link>
            <Link href="/characters/" className="hover:text-foreground transition-colors">
              Characters
            </Link>
            <Link href="/lore/" className="hover:text-foreground transition-colors">
              Lore
            </Link>
            <Link href="/specs/" className="hover:text-foreground transition-colors">
              Game Specs
            </Link>
            <Link href="/demo/" className="hover:text-foreground transition-colors">
              Battle Demo
            </Link>
            <Link href="/dex/" className="hover:text-foreground text-accent font-semibold transition-colors">
              Dex ↗
            </Link>
          </nav>
        </div>

        {/* Lower Row: External links & Spec info */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px]">
          <div className="flex flex-wrap items-center gap-5">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub ↗
            </a>
            <a
              href={GITHUB_DISCUSSIONS}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Discussions
            </a>
            <a
              href={GITHUB_ISSUES}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Issues
            </a>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Discord
            </a>
          </div>

          <div className="text-muted uppercase">
            MIT LICENSE • GODOT 4.X • 3047 AD
          </div>
        </div>
      </div>
    </footer>
  );
};
