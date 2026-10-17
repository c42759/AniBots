'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const CharacterNavList = ({ characters }) => {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {characters.map((char) => {
        const href = `/characters/${char.slug}`;
        const isActive = pathname === href || (pathname === '/characters' && char.slug === 'kura_ato');

        return (
          <Link
            key={char.slug}
            href={href}
            className={`w-full text-left p-3 rounded-xs transition-colors flex items-center gap-3.5 group border ${
              isActive
                ? 'bg-foreground text-background border-foreground shadow-xs'
                : 'bg-background hover:bg-surface text-foreground border-transparent hover:border-border'
            }`}
          >
            {/* Avatar Thumbnail */}
            <div className="w-11 h-11 shrink-0 rounded-xs overflow-hidden border border-border/80 bg-surface flex items-center justify-center relative">
              {char.avatar ? (
                <img
                  src={char.avatar}
                  alt={char.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="font-mono text-xs font-bold text-muted uppercase">
                  {char.name.substring(0, 2)}
                </div>
              )}
            </div>

            {/* Character Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold tracking-tight text-sm truncate">
                  {char.name}
                </span>
                {char.age && char.age !== 'Deceased' && char.age !== 'Ancient' && (
                  <span
                    className={`font-mono text-[10px] shrink-0 px-1 py-0.2 border ${
                      isActive
                        ? 'border-background/30 text-background'
                        : 'border-border text-muted bg-surface'
                    }`}
                  >
                    {char.age}Y
                  </span>
                )}
              </div>
              <p
                className={`text-xs truncate mt-0.5 ${
                  isActive ? 'text-background/80' : 'text-muted'
                }`}
              >
                {char.role}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
