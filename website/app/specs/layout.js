import React from 'react';
import { getAllSpecs } from '../../utils/markdown';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { SpecNavList } from './SpecNavList';

export const metadata = {
  title: 'Game System Specs & Architecture — AniBots 3047 AD',
  description: 'Technical architecture, combat loop, modular parts taxonomy, and Anima Chip specifications for AniBots.',
};

export default function SpecsLayout({ children }) {
  const specs = getAllSpecs();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      <SiteHeader currentSection="specs" />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row border-x border-border">
        {/* Left Sidebar: Spec Navigator */}
        <aside className="w-full md:w-80 lg:w-96 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface/30 flex flex-col">
          {/* Sidebar Masthead */}
          <div className="p-4 sm:p-5 border-b border-border bg-surface/60 flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-accent font-bold">
                SYSTEM SPECS
              </span>
              <h2 className="text-base font-bold tracking-tight text-foreground uppercase">
                Game Specs ({specs.length} Docs)
              </h2>
            </div>
            <span className="font-mono text-xs text-muted">
              GODOT 4.X
            </span>
          </div>

          {/* Interactive Spec Nav List */}
          <div className="p-2 md:p-3 overflow-y-auto max-h-[50vh] md:max-h-[calc(100vh-8rem)] divide-y divide-border/50">
            <SpecNavList specs={specs} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-background overflow-hidden min-w-0">
          {children}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
