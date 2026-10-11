/**
 * Convert Markdown (CommonMark + GFM + common extensions) into Route2Hire blog blocks.
 * Tuned against a full-feature "ultimate" markdown test document.
 */

import { normalizeCodeLang } from './blog-blocks.js';

const EMOJI_MAP = {
  smile: '😄', rocket: '🚀', tada: '🎉', warning: '⚠️', check: '✅',
  x: '❌', fire: '🔥', test_tube: '🧪', eyes: '👀', star: '⭐',
  heart: '❤️', thumbsup: '👍', clap: '👏', wave: '👋',
};

function normalizeLang(raw) {
  return normalizeCodeLang(raw);
}

function parseFrontmatter(source) {
  const text = String(source || '').replace(/^\uFEFF/, '');
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    return { meta: {}, body: text };
  }
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: text };

  const rawMeta = text.slice(4, end).replace(/\r/g, '');
  let body = text.slice(end + 4);
  if (body.startsWith('\r\n')) body = body.slice(2);
  else if (body.startsWith('\n')) body = body.slice(1);

  const meta = {};
  for (const line of rawMeta.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim().toLowerCase();
    let value = trimmed.slice(colon + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key === 'tags' || key === 'keywords') {
      meta[key] = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (value !== '') {
      meta[key] = value;
    }
  }
  return { meta, body };
}

function isHr(line) {
  return /^(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim());
}

function isTableSeparator(line) {
  return /^\s*\|?(?:\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(line);
}

/** Split a table row without breaking on escaped pipes. */
function splitTableRow(line) {
  let row = String(line || '').trim();
  if (row.startsWith('|')) row = row.slice(1);
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);

  const cells = [];
  let cur = '';
  for (let i = 0; i < row.length; i += 1) {
    const ch = row[i];
    if (ch === '\\' && i + 1 < row.length) {
      cur += row[i + 1];
      i += 1;
      continue;
    }
    if (ch === '|') {
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function listMarker(line) {
  const bullet = line.match(/^(\s*)([-*+])\s+(?:(\[[ xX]\])\s+)?(.*)$/);
  if (bullet) {
    let taskPrefix = '';
    if (bullet[3]) {
      taskPrefix = /[xX]/.test(bullet[3]) ? '☑ ' : '☐ ';
    }
    return {
      kind: 'bullets',
      indent: bullet[1].replace(/\t/g, '    ').length,
      text: `${taskPrefix}${bullet[4] || ''}`,
    };
  }
  const numbered = line.match(/^(\s*)(\d{1,9})([.)])\s+(.*)$/);
  if (numbered) {
    return {
      kind: 'numbered',
      indent: numbered[1].replace(/\t/g, '    ').length,
      text: numbered[4] || '',
      start: Number(numbered[2]),
    };
  }
  return null;
}

function indentWidth(line) {
  const m = String(line || '').replace(/\t/g, '    ').match(/^ */);
  return m ? m[0].length : 0;
}

function isIndentedCodeLine(line) {
  return /^(?: {4}|\t)/.test(line) && line.trim() !== '';
}

function stripIndentCode(line) {
  if (line.startsWith('\t')) return line.slice(1);
  if (line.startsWith('    ')) return line.slice(4);
  return line.replace(/^ {1,4}/, '');
}

function unescapeMarkdown(text) {
  return String(text || '').replace(/\\([\\`*_{}[\]()#+\-.!|])/g, '$1');
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(Number(n)); } catch { return _; }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => {
      try { return String.fromCodePoint(parseInt(n, 16)); } catch { return _; }
    });
}

function expandEmojiShortcodes(text) {
  return String(text || '').replace(/:([a-z0-9_+-]+):/gi, (full, name) => {
    const key = name.toLowerCase();
    return EMOJI_MAP[key] || full;
  });
}

function protectCodeSpans(text) {
  const slots = [];
  const replaced = String(text || '').replace(
    /(`+)([\s\S]*?)\1/g,
    (full) => {
      const token = `\u0000CODE${slots.length}\u0000`;
      slots.push(full);
      return token;
    },
  );
  return {
    text: replaced,
    restore: (value) => value.replace(/\u0000CODE(\d+)\u0000/g, (_, n) => slots[Number(n)] || ''),
  };
}

function normalizeInlineHtml(text) {
  const protectedSpans = protectCodeSpans(text);
  let s = protectedSpans.text;

  // Remove dangerous blocks entirely (outside code spans)
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  // Autolinks before generic tag strip
  s = s.replace(/<(https?:\/\/[^>\s]+)>/gi, '[$1]($1)');
  s = s.replace(/<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g, '[$1](mailto:$1)');
  s = s.replace(/<(mailto:[^>\s]+)>/gi, '[$1]($1)');

  // Preserve semantic inline HTML that parseInline understands
  const keep = [];
  s = s.replace(/<\/?(?:sub|sup|kbd|mark)\b[^>]*>/gi, (tag) => {
    const token = `\u0000KEEP${keep.length}\u0000`;
    keep.push(tag);
    return token;
  });

  // Semantic HTML → markdown
  s = s.replace(/<\/?(?:strong|b)>/gi, '**');
  s = s.replace(/<\/?(?:em|i)>/gi, '*');
  s = s.replace(/<\/?code>/gi, '`');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  s = s.replace(/<\/?p[^>]*>/gi, '');

  s = s.replace(
    /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\balt=["']([^"']*)["'][^>]*\/?>/gi,
    '![$2]($1)',
  );
  s = s.replace(
    /<img\b[^>]*\balt=["']([^"']*)["'][^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/gi,
    '![$1]($2)',
  );
  s = s.replace(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/gi, '![]($1)');
  s = s.replace(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Drop remaining tags (keep text)
  s = s.replace(/<\/?[^>]+>/g, '');
  s = s.replace(/\u0000KEEP(\d+)\u0000/g, (_, n) => keep[Number(n)] || '');
  s = decodeEntities(s);
  return protectedSpans.restore(s);
}

function extractReferenceDefs(lines) {
  const defs = new Map();
  const footnotes = new Map();
  const kept = [];

  const absorbContinuation = (startIdx, initial) => {
    let text = initial;
    let i = startIdx;
    while (i + 1 < lines.length) {
      const next = lines[i + 1];
      const nextTrim = next.trim();
      // blank then indented → footnote/link multi-paragraph
      if (!nextTrim) {
        let j = i + 2;
        while (j < lines.length && !lines[j].trim()) j += 1;
        if (j < lines.length && indentWidth(lines[j]) >= 2) {
          text += '\n\n';
          i += 1;
          continue;
        }
        break;
      }
      if (indentWidth(next) >= 2 || /^\s/.test(next)) {
        i += 1;
        text += (text.endsWith('\n') ? '' : ' ') + nextTrim;
        continue;
      }
      break;
    }
    return { text: text.trim(), end: i };
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // Footnote definition [^id]:
    const fn = line.match(/^\s{0,3}\[\^([^\]]+)\]:\s*(.*)$/);
    if (fn) {
      const absorbed = absorbContinuation(i, fn[2] || '');
      footnotes.set(fn[1].trim().toLowerCase(), absorbed.text);
      i = absorbed.end;
      continue;
    }

    // Link/image reference definition
    const linkDef = line.match(
      /^\s{0,3}\[([^\]]+)\]:\s*<?(\S+?)>?(?:\s+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?\s*$/,
    );
    if (linkDef) {
      const id = linkDef[1].trim().toLowerCase();
      defs.set(id, {
        url: linkDef[2],
        title: linkDef[3] || linkDef[4] || linkDef[5] || '',
      });
      continue;
    }

    kept.push(line);
  }

  return { lines: kept, defs, footnotes };
}

function resolveReferences(text, defs) {
  let s = String(text || '');

  // Images / links with explicit ref ids
  s = s.replace(/!\[([^\]]*)\]\[([^\]]+)\]/g, (full, alt, id) => {
    const def = defs.get(id.trim().toLowerCase());
    return def ? `![${alt}](${def.url})` : full;
  });
  s = s.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (full, label, id) => {
    const def = defs.get(id.trim().toLowerCase());
    return def ? `[${label}](${def.url})` : full;
  });
  s = s.replace(/\[([^\]]+)\]\[\]/g, (full, label) => {
    const def = defs.get(label.trim().toLowerCase());
    return def ? `[${label}](${def.url})` : full;
  });

  // Shortcut reference: [GitHub] (not already a link/image)
  s = s.replace(/(^|[^!])\[([^\]]+)\](?!\(|\[)/g, (full, prefix, label) => {
    const def = defs.get(label.trim().toLowerCase());
    return def ? `${prefix}[${label}](${def.url})` : full;
  });

  return s;
}

/** Normalize link destinations like (<url with spaces>) and titles. */
function normalizeLinkDestinations(text) {
  return String(text || '')
    .replace(
      /(!?\[[^\]]*\])\(\s*<([^>]+)>\s*(?:("[^"]*"|'[^']*')\s*)?\)/g,
      (_, label, url, title) => (title ? `${label}(${url} ${title})` : `${label}(${url})`),
    );
}

function normalizeParagraphText(parts, defs) {
  const joined = parts
    .map((part, idx) => {
      if (idx === parts.length - 1) return part.replace(/[ \t]+$/, '');
      if (/ {2}$/.test(part) || /\\$/.test(part)) {
        return `${part.replace(/[ \t]+$/, '').replace(/\\$/, '')}\n`;
      }
      return `${part.replace(/[ \t]+$/, '')} `;
    })
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  let text = normalizeLinkDestinations(joined);
  text = resolveReferences(text, defs);
  text = normalizeInlineHtml(text);
  text = expandEmojiShortcodes(text);
  // Keep \* \_ \` etc. so parseInline can treat them as literals.

  // GFM bare URLs (whitespace/start only — avoids rewriting markdown destinations)
  {
    const protectedSpans = protectCodeSpans(text);
    text = protectedSpans.text.replace(
      /(^|[\s])(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g,
      (full, pre, url) => `${pre}[${url}](${url})`,
    );
    text = protectedSpans.restore(text);
  }

  // Inline footnotes ^[text]
  text = text.replace(/\^\[([^\]]+)\]/g, ' (Note: $1)');

  return text;
}

function startsStructural(line, nextLine) {
  const trimmed = (line || '').trim();
  if (!trimmed) return true;
  if (/^(`{3,}|~{3,})/.test(trimmed)) return true;
  if (/^#{1,6}(?:\s|$)/.test(trimmed)) return true;
  if (isHr(trimmed)) return true;
  if (/^\s*>/.test(line)) return true;
  if (listMarker(line)) return true;
  if (trimmed.includes('|') && nextLine && isTableSeparator(nextLine)) return true;
  if (isIndentedCodeLine(line)) return true;
  if (/^<!--/.test(trimmed)) return true;
  if (/^\$\$/.test(trimmed)) return true;
  if (/^<\/?[a-zA-Z]/.test(trimmed)) return true;
  return false;
}

function parseHtmlTable(html) {
  const rows = [];
  const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr;
  while ((tr = trRe.exec(html)) !== null) {
    const cells = [];
    const cellRe = /<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let cell;
    while ((cell = cellRe.exec(tr[1])) !== null) {
      cells.push(normalizeInlineHtml(cell[2]).trim());
    }
    if (cells.length) rows.push(cells);
  }
  if (rows.length < 1) return null;
  const headers = rows[0];
  const body = rows.slice(1);
  const width = Math.max(...rows.map((r) => r.length));
  const norm = (r) => {
    const copy = [...r];
    while (copy.length < width) copy.push('');
    return copy.slice(0, width);
  };
  return {
    type: 'table',
    headers: norm(headers),
    rows: body.length ? body.map(norm) : [norm([])],
  };
}

/**
 * Collect a list into a nested tree:
 * items: [{ text, children?: [{ type: 'bullets'|'numbered', items: [...] }] }]
 */
function collectList(lines, start, defs, minIndent = 0) {
  const first = listMarker(lines[start]);
  if (!first || first.indent < minIndent) return null;

  const kind = first.kind;
  const baseIndent = first.indent;
  const items = [];
  let i = start;
  let current = null;
  let interrupted = null;

  const flush = () => {
    if (!current) return;
    const text = normalizeParagraphText(current.parts, defs);
    const node = { text: text || '' };
    if (current.children?.length) node.children = current.children;
    items.push(node);
    current = null;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j += 1;
      if (j >= lines.length) break;
      const peek = listMarker(lines[j]);
      const contIndent = indentWidth(lines[j]);

      if (!peek && contIndent > baseIndent) {
        const nextTrim = lines[j].trim();
        if (/^(`{3,}|~{3,})/.test(nextTrim) || /^>/.test(nextTrim) || isIndentedCodeLine(lines[j])) {
          flush();
          interrupted = { at: j, reason: 'nested_block' };
          break;
        }
      }
      if (peek && peek.indent > baseIndent) {
        i += 1;
        continue;
      }
      if (peek && peek.indent === baseIndent && peek.kind === kind) {
        i += 1;
        continue;
      }
      if (!peek && contIndent > baseIndent && current) {
        i += 1;
        continue;
      }
      break;
    }

    const marker = listMarker(line);

    // Dedented — parent list owns this line
    if (marker && marker.indent < baseIndent) break;

    // Nested list — attach under current item
    if (marker && marker.indent > baseIndent) {
      if (!current) current = { parts: [''], children: [] };
      const nested = collectList(lines, i, defs, marker.indent);
      if (nested?.items?.length) {
        if (!current.children) current.children = [];
        // Merge consecutive nested lists of the same type
        const last = current.children[current.children.length - 1];
        if (last && last.type === nested.kind) {
          last.items.push(...nested.items);
        } else {
          current.children.push({ type: nested.kind, items: nested.items });
        }
        i = nested.end;
        continue;
      }
    }

    // Same-level different kind — end this list (sibling list follows)
    if (marker && marker.indent === baseIndent && marker.kind !== kind) break;

    // Same-level same kind — new item
    if (marker && marker.indent === baseIndent && marker.kind === kind) {
      flush();
      current = { parts: [marker.text], children: [] };
      i += 1;
      continue;
    }

    // Continuation lines for current item
    const indent = indentWidth(line);
    if (current && (indent > baseIndent || !marker)) {
      if (/^(`{3,}|~{3,})/.test(trimmed)) {
        flush();
        interrupted = { at: i, reason: 'nested_block' };
        break;
      }
      if (/^>/.test(trimmed)) {
        current.parts.push(trimmed.replace(/^>\s?/, ''));
        i += 1;
        continue;
      }
      if (!marker && !startsStructural(line, lines[i + 1])) {
        current.parts.push(trimmed);
        i += 1;
        continue;
      }
      if (marker) {
        current.parts.push(trimmed);
        i += 1;
        continue;
      }
    }

    if (current && !marker && !startsStructural(line, lines[i + 1])) {
      current.parts.push(trimmed);
      i += 1;
      continue;
    }

    break;
  }

  flush();
  if (!items.length && !interrupted) items.push({ text: '' });
  return {
    kind,
    items,
    end: interrupted ? interrupted.at : i,
    interrupted: Boolean(interrupted),
  };
}

/**
 * @param {string} markdown
 */
export function markdownToBlogBlocks(markdown) {
  const { meta: frontmatter, body } = parseFrontmatter(markdown);
  const normalized = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const { lines, defs, footnotes } = extractReferenceDefs(normalized.split('\n'));

  const blocks = [];
  const meta = { ...frontmatter };
  let i = 0;
  let sawH1Title = false;

  // Resume same-kind lists across nested interruptions
  let pendingList = null; // { kind, items }

  const flushPendingList = () => {
    if (pendingList?.items?.length) {
      blocks.push({ type: pendingList.kind, items: pendingList.items });
    }
    pendingList = null;
  };

  const pushParagraph = (parts) => {
    flushPendingList();
    const text = normalizeParagraphText(parts, defs);
    if (text && text !== '[TOC]') blocks.push({ type: 'paragraph', text });
  };

  const pushBlock = (block) => {
    flushPendingList();
    blocks.push(block);
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // HTML comments
    if (trimmed.startsWith('<!--')) {
      if (!trimmed.includes('-->')) {
        i += 1;
        while (i < lines.length && !lines[i].includes('-->')) i += 1;
      }
      i += 1;
      continue;
    }

    // TOC marker
    if (/^\[\[?toc\]\]?$/i.test(trimmed) || trimmed === '[TOC]') {
      i += 1;
      continue;
    }

    // Math block $$ ... $$
    if (trimmed.startsWith('$$')) {
      flushPendingList();
      if (trimmed !== '$$' && trimmed.endsWith('$$') && trimmed.length > 4) {
        blocks.push({ type: 'code', lang: 'math', code: trimmed.slice(2, -2).trim() });
        i += 1;
        continue;
      }
      const mathLines = [];
      if (trimmed.length > 2) mathLines.push(trimmed.slice(2));
      i += 1;
      while (i < lines.length) {
        const cur = lines[i];
        if (cur.trim().endsWith('$$')) {
          const bodyLine = cur.trim() === '$$' ? '' : cur.trim().slice(0, -2);
          if (bodyLine) mathLines.push(bodyLine);
          i += 1;
          break;
        }
        mathLines.push(cur);
        i += 1;
      }
      blocks.push({ type: 'code', lang: 'math', code: mathLines.join('\n').trim() });
      continue;
    }

    // Fenced code
    const fence = trimmed.match(/^(`{3,}|~{3,})\s*(.*)$/);
    if (fence) {
      flushPendingList();
      const marker = fence[1][0];
      const fenceLen = fence[1].length;
      const info = fence[2] || '';
      const lang = normalizeLang(info.trim().split(/[\s{:]/)[0] || '');
      const codeLines = [];
      const baseIndent = indentWidth(line);
      i += 1;
      while (i < lines.length) {
        const raw = lines[i];
        const closeTrim = raw.trim();
        if (
          closeTrim.length >= fenceLen &&
          new RegExp(`^\\${marker}{${fenceLen},}\\s*$`).test(closeTrim)
        ) {
          i += 1;
          break;
        }
        codeLines.push(baseIndent ? (indentWidth(raw) >= baseIndent ? raw.slice(baseIndent) : raw) : raw);
        i += 1;
      }
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') });
      continue;
    }

    // Indented code (skip if this looks like footnote leftover — already extracted)
    if (isIndentedCodeLine(line)) {
      flushPendingList();
      const codeLines = [];
      while (i < lines.length) {
        const cur = lines[i];
        if (isIndentedCodeLine(cur)) {
          codeLines.push(stripIndentCode(cur));
          i += 1;
          continue;
        }
        if (!cur.trim()) {
          let j = i;
          while (j < lines.length && !lines[j].trim()) j += 1;
          if (j < lines.length && isIndentedCodeLine(lines[j])) {
            while (i < j) {
              codeLines.push('');
              i += 1;
            }
            continue;
          }
        }
        break;
      }
      while (codeLines.length && codeLines[codeLines.length - 1] === '') codeLines.pop();
      blocks.push({ type: 'code', lang: 'plaintext', code: codeLines.join('\n') });
      continue;
    }

    // ATX heading — requires space after # (so "#not-a-heading" stays paragraph)
    if (trimmed === '#') {
      pushParagraph([trimmed]);
      i += 1;
      continue;
    }
    const atx = trimmed.match(/^(#{1,6})\s+(.*?)\s*$/);
    if (atx) {
      const level = atx[1].length;
      const text = normalizeParagraphText([atx[2].replace(/\s+#*$/, '')], defs);
      if (!text) {
        pushParagraph([trimmed]);
        i += 1;
        continue;
      }
      flushPendingList();
      if (level === 1 && !sawH1Title) {
        if (!meta.title) meta.title = text;
        sawH1Title = true;
      } else {
        blocks.push({ type: 'heading', level: level <= 2 ? 2 : 3, text });
      }
      i += 1;
      continue;
    }

    // Setext heading
    if (
      i + 1 < lines.length &&
      trimmed &&
      !listMarker(line) &&
      !trimmed.includes('|') &&
      /^(?:=+|-+)\s*$/.test(lines[i + 1].trim())
    ) {
      flushPendingList();
      const text = normalizeParagraphText([trimmed], defs);
      const isH1 = lines[i + 1].trim().startsWith('=');
      if (isH1 && !sawH1Title) {
        if (!meta.title && text) meta.title = text;
        sawH1Title = true;
      } else if (text) {
        blocks.push({ type: 'heading', level: isH1 ? 2 : 3, text });
      }
      i += 2;
      continue;
    }

    // Horizontal rule
    if (isHr(trimmed)) {
      pushBlock({ type: 'divider' });
      i += 1;
      continue;
    }

    // GFM table
    if (trimmed.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushPendingList();
      const headers = splitTableRow(lines[i]).map((h) => normalizeParagraphText([h], defs));
      i += 2;
      const rows = [];
      while (i < lines.length) {
        const rowLine = lines[i].trim();
        if (!rowLine || isHr(rowLine) || !rowLine.includes('|')) break;
        if (listMarker(lines[i]) || /^#{1,6}\s/.test(rowLine) || /^(`{3,}|~{3,})/.test(rowLine)) break;
        const cells = splitTableRow(lines[i]).map((c) => normalizeParagraphText([c], defs));
        while (cells.length < headers.length) cells.push('');
        rows.push(cells.slice(0, headers.length));
        i += 1;
      }
      blocks.push({
        type: 'table',
        headers: headers.length ? headers : ['Column 1'],
        rows: rows.length ? rows : [headers.map(() => '')],
      });
      continue;
    }

    // Definition list
    if (
      trimmed &&
      !listMarker(line) &&
      i + 1 < lines.length &&
      /^:\s+\S/.test(lines[i + 1].trim())
    ) {
      flushPendingList();
      const items = [];
      while (i < lines.length) {
        while (i < lines.length && !lines[i].trim()) i += 1;
        if (
          i >= lines.length ||
          listMarker(lines[i]) ||
          i + 1 >= lines.length ||
          !/^:\s+\S/.test(lines[i + 1].trim())
        ) break;

        const term = normalizeParagraphText([lines[i].trim()], defs);
        i += 1;
        const defParts = [lines[i].replace(/^\s*:\s+/, '')];
        i += 1;
        while (i < lines.length && lines[i].trim()) {
          if (listMarker(lines[i]) || /^:\s+\S/.test(lines[i].trim())) break;
          if (i + 1 < lines.length && /^:\s+\S/.test(lines[i + 1].trim())) break;
          if (
            startsStructural(lines[i], lines[i + 1]) &&
            !/^\s/.test(lines[i])
          ) break;
          defParts.push(lines[i].trim());
          i += 1;
        }
        const def = normalizeParagraphText(defParts, defs);
        items.push(`**${term}** — ${def}`);
      }
      if (items.length) blocks.push({ type: 'bullets', items });
      continue;
    }

    // Blockquote / admonitions
    if (/^\s*>/.test(line)) {
      flushPendingList();
      const quoteLines = [];
      while (i < lines.length) {
        const cur = lines[i];
        if (/^\s*>/.test(cur)) {
          quoteLines.push(cur.replace(/^\s*>\s?/, ''));
          i += 1;
          continue;
        }
        if (cur.trim() && !startsStructural(cur, lines[i + 1]) && quoteLines.length) {
          quoteLines.push(cur);
          i += 1;
          continue;
        }
        break;
      }
      let raw = quoteLines.join('\n');
      const adm = raw.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|INFO)\]\s*/i);
      let prefix = '';
      if (adm) {
        prefix = `**${adm[1].toUpperCase()}:** `;
        raw = raw.slice(adm[0].length);
      }
      // Flatten nested quote markers for storage
      raw = raw.replace(/^>\s?/gm, '');
      const text = normalizeParagraphText([raw], defs);
      if (text) blocks.push({ type: 'quote', text: `${prefix}${text}` });
      continue;
    }

    // Lists
    if (listMarker(line)) {
      const parsed = collectList(lines, i, defs);
      if (parsed) {
        if (pendingList && pendingList.kind === parsed.kind) {
          pendingList.items.push(...parsed.items);
        } else {
          flushPendingList();
          pendingList = { kind: parsed.kind, items: [...parsed.items] };
        }
        i = parsed.end;
        if (!parsed.interrupted) {
          flushPendingList();
        }
        continue;
      }
    }

    // Raw HTML blocks
    if (/^<\/?[a-zA-Z]/.test(trimmed)) {
      flushPendingList();
      const htmlLines = [line];
      i += 1;
      const tagMatch = trimmed.match(/^<([a-zA-Z][\w-]*)/);
      const tag = tagMatch?.[1]?.toLowerCase();
      const voidish = /^(br|img|hr|meta|input)$/.test(tag || '');
      if (!voidish && tag && !trimmed.includes(`</${tag}`)) {
        while (i < lines.length) {
          htmlLines.push(lines[i]);
          if (lines[i].toLowerCase().includes(`</${tag}`)) {
            i += 1;
            break;
          }
          i += 1;
        }
      } else {
        while (i < lines.length && lines[i].trim() && !startsStructural(lines[i], lines[i + 1])) {
          // stop if next is clearly markdown structural at column 0
          if (/^#{1,6}\s/.test(lines[i].trim()) || listMarker(lines[i])) break;
          htmlLines.push(lines[i]);
          i += 1;
        }
      }

      const html = htmlLines.join('\n');
      if (/<table\b/i.test(html)) {
        const table = parseHtmlTable(html);
        if (table) {
          blocks.push(table);
          continue;
        }
      }
      if (/<details\b/i.test(html)) {
        const summary = html.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || 'Details';
        const inner = html
          .replace(/<\/?details[^>]*>/gi, '')
          .replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '')
          .trim();
        // Re-parse inner markdown simply as paragraphs/lists via recursive call
        const innerBlocks = markdownToBlogBlocks(inner).blocks.filter(
          (b) => !(b.type === 'paragraph' && !b.text),
        );
        blocks.push({
          type: 'quote',
          text: `**${normalizeInlineHtml(summary).trim()}**`,
        });
        for (const b of innerBlocks) blocks.push(b);
        continue;
      }

      const text = normalizeParagraphText(htmlLines, defs);
      if (text) blocks.push({ type: 'paragraph', text });
      continue;
    }

    // Paragraph
    const para = [line];
    i += 1;
    while (i < lines.length) {
      const next = lines[i];
      if (!next.trim()) break;
      if (startsStructural(next, lines[i + 1])) break;
      if (
        para.length === 1 &&
        /^(?:=+|-+)\s*$/.test(next.trim()) &&
        !para[0].includes('|')
      ) break;
      para.push(next);
      i += 1;
    }

    if (
      i < lines.length &&
      para.length === 1 &&
      /^(?:=+|-+)\s*$/.test(lines[i].trim())
    ) {
      flushPendingList();
      const text = normalizeParagraphText(para, defs);
      const isH1 = lines[i].trim().startsWith('=');
      if (isH1 && !sawH1Title) {
        if (!meta.title && text) meta.title = text;
        sawH1Title = true;
      } else if (text) {
        blocks.push({ type: 'heading', level: isH1 ? 2 : 3, text });
      }
      i += 1;
      continue;
    }

    pushParagraph(para);
  }

  flushPendingList();

  if (footnotes.size) {
    blocks.push({ type: 'divider' });
    blocks.push({ type: 'heading', level: 3, text: 'Footnotes' });
    const items = [];
    for (const [id, text] of footnotes.entries()) {
      items.push(`[[fn:${id}]] ${normalizeParagraphText([text], defs)}`);
    }
    blocks.push({ type: 'footnotes', items });
  }

  if (!blocks.length) blocks.push({ type: 'paragraph', text: '' });

  if (!meta.excerpt && meta.description) meta.excerpt = meta.description;

  return { blocks, meta };
}

export function isBlankBlogContent(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return true;
  if (blocks.length !== 1) return false;
  const only = blocks[0];
  return only?.type === 'paragraph' && !String(only.text || '').trim();
}
