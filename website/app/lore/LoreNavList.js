'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const LoreNavList = ({ sections }) => {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {sections.map((section) => {
        const href = `/lore/${section.slug}`;
        const isActive = pathname === href || (pathname === '/lore' && section.slug === '01_world_setting');

        return (
          <Link
            key={section.slug}
            href={href}
            className={`w-full text-left p-3.5 rounded-xs transition-colors flex items-start gap-3.5 group border ${
              isActive
                ? 'bg-foreground text-background border-foreground shadow-xs'
                : 'bg-background hover:bg-surface text-foreground border-transparent hover:border-border'
            }`}
          >
            {/* Chapter Index Badge */}
            <div
              className={`w-8 h-8 shrink-0 rounded-xs border font-mono text-xs font-bold flex items-center justify-center ${
                isActive
                  ? 'border-background/40 bg-background/10 text-background'
                  : 'border-border bg-surface text-accent'
              }`}
            >
              {String(section.order || 1).padStart(2, '0')}
            </div>

            {/* Chapter Text */}
            <div className="min-w-0 flex-1">
              <span className="font-bold tracking-tight text-sm block truncate group-hover:text-accent transition-colors">
                {section.title}
              </span>
              {section.subtitle && (
                <p
                  className={`text-xs truncate mt-0.5 ${
                    isActive ? 'text-background/75' : 'text-muted'
                  }`}
                >
                  {section.subtitle}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
