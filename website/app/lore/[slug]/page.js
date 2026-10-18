import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllLoreSections, getLoreSectionBySlug, renderMarkdownToHtml } from '../../../utils/markdown';

export async function generateStaticParams() {
  const sections = getAllLoreSections();
  return sections.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const section = getLoreSectionBySlug(slug);
  if (!section) return { title: 'Lore Chapter Not Found' };

  return {
    title: `${section.title} — AniBots Canon Lore`,
    description: section.subtitle || 'Canon Lore & Story Bible for the AniBots universe.',
  };
}

export default async function LoreDetailPage({ params }) {
  const { slug } = await params;
  const section = getLoreSectionBySlug(slug);

  if (!section) {
    notFound();
  }

  const allSections = getAllLoreSections();
  const currentIndex = allSections.findIndex((s) => s.slug === slug);
  const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
  const nextSection = currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;

  const htmlContent = renderMarkdownToHtml(section.content);

  return (
    <article className="p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb & Chapter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border font-mono text-xs text-muted">
        <div className="flex items-center gap-3">
          <Link href="/lore/" className="hover:text-foreground transition-colors">
            INDEX 02 // CANON LORE
          </Link>
          <span>/</span>
          <span className="text-foreground font-bold tracking-wider uppercase">
            CHAPTER {String(section.order || currentIndex + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-accent font-semibold">3047 AD ARCHIVE</span>
          <span>•</span>
          <span>CANON BIBLE</span>
        </div>
      </div>

      {/* Chapter Title Header */}
      <div className="border border-border p-6 sm:p-8 bg-surface/30 space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-accent uppercase font-bold tracking-widest">
          <span className="w-2 h-2 bg-accent inline-block" />
          <span>CHAPTER {String(section.order || currentIndex + 1).padStart(2, '0')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {section.title}
        </h1>
        {section.subtitle && (
          <p className="text-base text-muted font-mono pt-1">
            {section.subtitle}
          </p>
        )}
      </div>

      {/* Rendered Markdown Body Content */}
      <div
        className="prose prose-invert max-w-none pt-4 border-t border-border"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Bottom Chapter Navigation */}
      <div className="pt-8 border-t border-border grid grid-cols-2 gap-4 font-mono text-xs">
        {prevSection ? (
          <Link
            href={`/lore/${prevSection.slug}`}
            className="p-4 border border-border bg-surface/40 hover:bg-surface text-left group transition-colors"
          >
            <span className="text-muted text-[10px] uppercase block mb-1">← PREVIOUS CHAPTER</span>
            <span className="font-bold text-foreground group-hover:text-accent transition-colors block truncate">
              {prevSection.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextSection ? (
          <Link
            href={`/lore/${nextSection.slug}`}
            className="p-4 border border-border bg-surface/40 hover:bg-surface text-right group transition-colors"
          >
            <span className="text-muted text-[10px] uppercase block mb-1">NEXT CHAPTER →</span>
            <span className="font-bold text-foreground group-hover:text-accent transition-colors block truncate">
              {nextSection.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}
