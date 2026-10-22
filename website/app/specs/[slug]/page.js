import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSpecs, getSpecBySlug, renderMarkdownToHtml } from '../../../utils/markdown';

export async function generateStaticParams() {
  const specs = getAllSpecs();
  return specs.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const spec = getSpecBySlug(slug);
  if (!spec) return { title: 'Spec Not Found' };

  return {
    title: `${spec.title} — AniBots Game Specs`,
    description: spec.subtitle || 'Technical specification and game design for AniBots.',
  };
}

export default async function SpecDetailPage({ params }) {
  const { slug } = await params;
  const spec = getSpecBySlug(slug);

  if (!spec) {
    notFound();
  }

  const allSpecs = getAllSpecs();
  const currentIndex = allSpecs.findIndex((s) => s.slug === slug);
  const prevSpec = currentIndex > 0 ? allSpecs[currentIndex - 1] : null;
  const nextSpec = currentIndex < allSpecs.length - 1 ? allSpecs[currentIndex + 1] : null;

  const htmlContent = renderMarkdownToHtml(spec.content);

  return (
    <article className="p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border font-mono text-xs text-muted">
        <div className="flex items-center gap-3">
          <Link href="/specs/" className="hover:text-foreground transition-colors">
            INDEX 03 // GAME SPECS
          </Link>
          <span>/</span>
          <span className="text-foreground font-bold tracking-wider uppercase">
            SPEC {String(spec.order || currentIndex + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-accent font-semibold">GODOT 4.X ARCHIVE</span>
          <span>•</span>
          <span>3047 AD SPEC</span>
        </div>
      </div>

      {/* Spec Title Header */}
      <div className="border border-border p-6 sm:p-8 bg-surface/30 space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-accent uppercase font-bold tracking-widest">
          <span className="w-2 h-2 bg-accent inline-block" />
          <span>SPEC {String(spec.order || currentIndex + 1).padStart(2, '0')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {spec.title}
        </h1>
        {spec.subtitle && (
          <p className="text-base text-muted font-mono pt-1">
            {spec.subtitle}
          </p>
        )}
      </div>

      {/* Rendered Markdown Body Content */}
      <div
        className="prose prose-invert max-w-none pt-4 border-t border-border"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Bottom Pagination */}
      <div className="pt-8 border-t border-border grid grid-cols-2 gap-4 font-mono text-xs">
        {prevSpec ? (
          <Link
            href={`/specs/${prevSpec.slug}`}
            className="p-4 border border-border bg-surface/40 hover:bg-surface text-left group transition-colors"
          >
            <span className="text-muted text-[10px] uppercase block mb-1">← PREVIOUS SPEC</span>
            <span className="font-bold text-foreground group-hover:text-accent transition-colors block truncate">
              {prevSpec.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextSpec ? (
          <Link
            href={`/specs/${nextSpec.slug}`}
            className="p-4 border border-border bg-surface/40 hover:bg-surface text-right group transition-colors"
          >
            <span className="text-muted text-[10px] uppercase block mb-1">NEXT SPEC →</span>
            <span className="font-bold text-foreground group-hover:text-accent transition-colors block truncate">
              {nextSpec.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}
