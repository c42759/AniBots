import fs from 'fs';
import path from 'path';

/**
 * Parse simple YAML frontmatter and body from markdown
 */
export function parseFrontmatter(rawContent) {
  const normalized = rawContent.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---')) {
    return { frontmatter: {}, content: normalized };
  }

  const endIdx = normalized.indexOf('\n---\n', 3);
  if (endIdx === -1) {
    return { frontmatter: {}, content: normalized };
  }

  const rawYaml = normalized.substring(3, endIdx).trim();
  const content = normalized.substring(endIdx + 5).trim();

  const frontmatter = {};
  rawYaml.split('\n').forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.substring(0, colonIdx).trim();
    let val = line.substring(colonIdx + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    } else if (!isNaN(Number(val)) && val !== '') {
      val = Number(val);
    }
    frontmatter[key] = val;
  });

  return { frontmatter, content };
}

function resolveContentDir(subdir) {
  const p1 = path.join(process.cwd(), 'content', subdir);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(process.cwd(), 'website', 'content', subdir);
  if (fs.existsSync(p2)) return p2;
  return p1;
}

const CHARACTERS_DIR = resolveContentDir('characters');
const LORE_DIR = resolveContentDir('lore');
const SPECS_DIR = resolveContentDir('specs');

export function getAllCharacters() {
  if (!fs.existsSync(CHARACTERS_DIR)) return [];
  const files = fs.readdirSync(CHARACTERS_DIR).filter((f) => f.endsWith('.md'));

  const list = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(CHARACTERS_DIR, file), 'utf8');
    const { frontmatter, content } = parseFrontmatter(raw);
    return {
      slug,
      ...frontmatter,
      content,
    };
  });

  return list.sort((a, b) => (a.order || 99) - (b.order || 99));
}

export function getCharacterBySlug(slug) {
  const filePath = path.join(CHARACTERS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, content } = parseFrontmatter(raw);
  return {
    slug,
    ...frontmatter,
    content,
  };
}

export function getAllLoreSections() {
  if (!fs.existsSync(LORE_DIR)) return [];
  const files = fs.readdirSync(LORE_DIR).filter((f) => f.endsWith('.md'));

  const list = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(LORE_DIR, file), 'utf8');
    const { frontmatter, content } = parseFrontmatter(raw);
    return {
      slug,
      ...frontmatter,
      content,
    };
  });

  return list.sort((a, b) => (a.order || 99) - (b.order || 99));
}

export function getLoreSectionBySlug(slug) {
  const filePath = path.join(LORE_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, content } = parseFrontmatter(raw);
  return {
    slug,
    ...frontmatter,
    content,
  };
}

export function getAllSpecs() {
  if (!fs.existsSync(SPECS_DIR)) return [];
  const files = fs.readdirSync(SPECS_DIR).filter((f) => f.endsWith('.md'));

  const list = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(SPECS_DIR, file), 'utf8');
    const { frontmatter, content } = parseFrontmatter(raw);
    return {
      slug,
      ...frontmatter,
      content,
    };
  });

  return list.sort((a, b) => (a.order || 99) - (b.order || 99));
}

export function getSpecBySlug(slug) {
  const filePath = path.join(SPECS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, content } = parseFrontmatter(raw);
  return {
    slug,
    ...frontmatter,
    content,
  };
}

/**
 * Robust Zero-Dependency Markdown to HTML converter
 */
export function renderMarkdownToHtml(md) {
  if (!md) return '';

  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBuffer = [];
  let inList = false;
  let inTable = false;
  let tableRows = [];

  function flushList() {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  }

  function flushTable() {
    if (inTable && tableRows.length > 0) {
      let html = '<div class="overflow-x-auto my-6 border border-border"><table class="w-full text-left font-mono text-xs divide-y divide-border">';
      const [header, divider, ...body] = tableRows;

      if (header) {
        const ths = header
          .split('|')
          .slice(1, -1)
          .map((c) => `<th class="p-3 bg-surface font-semibold text-foreground uppercase tracking-wider">${formatInline(c.trim())}</th>`)
          .join('');
        html += `<thead><tr>${ths}</tr></thead>`;
      }

      if (body.length > 0) {
        html += '<tbody class="divide-y divide-border bg-background">';
        body.forEach((r) => {
          const tds = r
            .split('|')
            .slice(1, -1)
            .map((c) => `<td class="p-3 text-muted">${formatInline(c.trim())}</td>`)
            .join('');
          html += `<tr>${tds}</tr>`;
        });
        html += '</tbody>';
      }

      html += '</table></div>';
      out.push(html);
      inTable = false;
      tableRows = [];
    }
  }

  function formatInline(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold + Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 font-mono text-xs bg-surface border border-border text-foreground font-medium">$1</code>')
      // Images ![alt](url)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 border border-border max-w-full h-auto" />')
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline font-medium">$1</a>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code Block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const code = codeBuffer.join('\n')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        out.push(`<pre class="my-5 p-4 bg-surface border border-border font-mono text-xs overflow-x-auto text-foreground"><code>${code}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeBlockLang = line.trim().substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table Detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList();
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else {
      flushTable();
    }

    // Blank line
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      flushList();
      out.push(`<h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-10 mb-4">${formatInline(line.substring(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      out.push(`<h2 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-10 mb-3 border-b border-border pb-2">${formatInline(line.substring(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      flushList();
      out.push(`<h3 class="text-lg font-bold tracking-tight text-foreground mt-8 mb-2.5">${formatInline(line.substring(4))}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      flushList();
      out.push(`<h4 class="text-base font-bold tracking-tight text-foreground mt-6 mb-2">${formatInline(line.substring(5))}</h4>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      flushList();
      out.push('<hr class="my-8 border-t border-border" />');
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      out.push(`<blockquote class="my-4 pl-4 border-l-2 border-accent text-sm font-mono text-muted italic">${formatInline(line.substring(2))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        out.push('<ul class="my-3 space-y-1.5 pl-5 list-disc text-muted text-sm sm:text-base leading-relaxed">');
        inList = true;
      }
      const itemText = line.trim().substring(2);
      out.push(`<li>${formatInline(itemText)}</li>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trim())) {
      flushList();
      const match = line.trim().match(/^(\d+)\.\s(.*)$/);
      out.push(`<div class="my-1.5 flex items-baseline gap-2.5 text-sm sm:text-base text-muted"><span class="font-mono text-xs text-accent font-bold">${match[1]}.</span><span>${formatInline(match[2])}</span></div>`);
      continue;
    }

    // Regular paragraph
    flushList();
    out.push(`<p class="my-3.5 text-sm sm:text-base text-muted leading-relaxed">${formatInline(line)}</p>`);
  }

  flushList();
  flushTable();

  return out.join('\n');
}
