import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCharacters, getCharacterBySlug, renderMarkdownToHtml } from '../../../utils/markdown';

export async function generateStaticParams() {
  const characters = getAllCharacters();
  return characters.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const character = getCharacterBySlug(slug);
  if (!character) return { title: 'Character Not Found' };

  return {
    title: `${character.name} — AniBots Character Profile`,
    description: `${character.role} in the 3047 AD AniBots universe. Partner Machine: ${character.partner_bot || 'None'}.`,
  };
}

export default async function CharacterDetailPage({ params }) {
  const { slug } = await params;
  const character = getCharacterBySlug(slug);

  if (!character) {
    notFound();
  }

  const allCharacters = getAllCharacters();
  const currentIndex = allCharacters.findIndex((c) => c.slug === slug);
  const prevCharacter = currentIndex > 0 ? allCharacters[currentIndex - 1] : null;
  const nextCharacter = currentIndex < allCharacters.length - 1 ? allCharacters[currentIndex + 1] : null;

  const htmlContent = renderMarkdownToHtml(character.content);

  return (
    <article className="p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto space-y-10">
      {/* Top Breadcrumb & Index Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border font-mono text-xs text-muted">
        <div className="flex items-center gap-3">
          <Link href="/characters/" className="hover:text-foreground transition-colors">
            INDEX 01 // CHARACTERS
          </Link>
          <span>/</span>
          <span className="text-foreground font-bold tracking-wider uppercase">
            {character.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-accent font-semibold">ENTRY #{String(character.order || currentIndex + 1).padStart(2, '0')}</span>
          <span>•</span>
          <span>3047 AD</span>
        </div>
      </div>

      {/* Character Dossier Hero Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border border-border p-6 sm:p-8 bg-surface/30">
        {/* Character Portrait */}
        <div className="md:col-span-5 relative">
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-surface group">
            {character.avatar ? (
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center font-mono text-muted text-xs p-4 text-center">
                <span className="w-3 h-3 bg-accent mb-2 inline-block" />
                <span className="font-bold text-foreground uppercase">PORTRAIT PENDING</span>
                <span className="text-[10px] mt-1 text-muted">[{character.id}]</span>
              </div>
            )}
            <div className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-widest bg-background/90 px-2 py-0.5 border border-border backdrop-blur-xs">
              DOSSIER FILE
            </div>
          </div>
        </div>

        {/* Character Key Intelligence */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground uppercase">
                {character.name}
              </h1>
              {character.japanese_name && (
                <span className="font-mono text-sm text-muted">
                  ({character.japanese_name})
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-accent uppercase tracking-wider font-semibold">
              {character.role}
            </p>
          </div>

          {/* Quote Block */}
          {character.quote && (
            <div className="p-4 bg-background border-l-2 border-accent text-sm italic text-foreground/90 font-serif leading-relaxed">
              &ldquo;{character.quote}&rdquo;
            </div>
          )}

          {/* Data Attribute Grid */}
          <dl className="grid grid-cols-2 gap-3 font-mono text-xs pt-3 border-t border-border">
            {character.age && (
              <div className="p-2.5 bg-background border border-border">
                <dt className="text-muted text-[10px] uppercase">AGE</dt>
                <dd className="text-foreground font-bold mt-0.5">{character.age}</dd>
              </div>
            )}
            {character.location && (
              <div className="p-2.5 bg-background border border-border">
                <dt className="text-muted text-[10px] uppercase">LOCATION</dt>
                <dd className="text-foreground font-bold mt-0.5 truncate">{character.location}</dd>
              </div>
            )}
            {character.partner_bot && (
              <div className="p-2.5 bg-background border border-border">
                <dt className="text-muted text-[10px] uppercase">PARTNER ANIBOT</dt>
                <dd className="text-foreground font-bold mt-0.5 truncate">{character.partner_bot}</dd>
              </div>
            )}
            {character.partner_chip && (
              <div className="p-2.5 bg-background border border-border">
                <dt className="text-muted text-[10px] uppercase">CORE ANICHIP</dt>
                <dd className="text-foreground font-bold mt-0.5 truncate">{character.partner_chip}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Rendered Markdown Body Content */}
      <div
        className="prose prose-invert max-w-none pt-4 border-t border-border"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Bottom Pagination Links */}
      <div className="pt-8 border-t border-border grid grid-cols-2 gap-4 font-mono text-xs">
        {prevCharacter ? (
          <Link
            href={`/characters/${prevCharacter.slug}`}
            className="p-4 border border-border bg-surface/40 hover:bg-surface text-left group transition-colors"
          >
            <span className="text-muted text-[10px] uppercase block mb-1">← PREVIOUS</span>
            <span className="font-bold text-foreground group-hover:text-accent transition-colors block truncate">
              {prevCharacter.name}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextCharacter ? (
          <Link
            href={`/characters/${nextCharacter.slug}`}
            className="p-4 border border-border bg-surface/40 hover:bg-surface text-right group transition-colors"
          >
            <span className="text-muted text-[10px] uppercase block mb-1">NEXT →</span>
            <span className="font-bold text-foreground group-hover:text-accent transition-colors block truncate">
              {nextCharacter.name}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}
