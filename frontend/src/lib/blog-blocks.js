import { createElement, Fragment } from 'react';

export const BLOG_BLOCK_TYPES = [
  'heading', 'paragraph', 'bullets', 'numbered', 'code', 'quote', 'table', 'divider',
];

/**
 * Parse balanced link/image destination, allowing nested () in URLs.
 */
function readDestination(source, start) {
  if (source[start] !== '(') return null;
  let i = start + 1;
  while (i < source.length && /\s/.test(source[i])) i += 1;

  let href = '';
  if (source[i] === '<') {
    const end = source.indexOf('>', i + 1);
    if (end === -1) return null;
    href = source.slice(i + 1, end);
    i = end + 1;
  } else {
    let depth = 0;
    const hrefStart = i;
    while (i < source.length) {
      const ch = source[i];
      if (ch === '\\' && i + 1 < source.length) {
        i += 2;
        continue;
      }
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        if (depth === 0) break;
        depth -= 1;
      } else if (/\s/.test(ch) && depth === 0) break;
      i += 1;
    }
    href = source.slice(hrefStart, i).replace(/\\([()])/g, '$1');
  }

  while (i < source.length && /\s/.test(source[i])) i += 1;
  if (source[i] === '"' || source[i] === "'") {
    const q = source[i];
    const end = source.indexOf(q, i + 1);
    if (end === -1) return null;
    i = end + 1;
    while (i < source.length && /\s/.test(source[i])) i += 1;
  }
  if (source[i] !== ')') return null;
  return { href, end: i + 1 };
}

function findClosingMarker(source, from, marker) {
  let i = from;
  while (i < source.length) {
    if (source[i] === '\\' && i + 1 < source.length) {
      i += 2;
      continue;
    }
    if (source.startsWith(marker, i)) {
      // For single *, don't match the start of **
      if (marker === '*' && source[i + 1] === '*') {
        i += 2;
        continue;
      }
      if (marker === '_' && source[i + 1] === '_') {
        i += 2;
        continue;
      }
      return i;
    }
    i += 1;
  }
  return -1;
}

function applyFlags(runs, flags) {
  return runs.map((run) => {
    if (run.image) return run;
    const next = {
      ...run,
      bold: Boolean(run.bold || flags.bold),
      italic: Boolean(run.italic || flags.italic),
      strike: Boolean(run.strike || flags.strike),
      mark: Boolean(run.mark || flags.mark),
      code: Boolean(run.code || flags.code),
      kbd: Boolean(run.kbd || flags.kbd),
      sub: Boolean(run.sub || flags.sub),
      sup: Boolean(run.sup || flags.sup),
    };
    if (run.children) next.children = applyFlags(run.children, flags);
    return next;
  });
}

function readHtmlTag(source, start, tag) {
  const open = new RegExp(`^<${tag}\\b[^>]*>`, 'i');
  const slice = source.slice(start);
  const m = slice.match(open);
  if (!m) return null;
  const contentStart = start + m[0].length;
  const closeTag = `</${tag}>`;
  const close = source.toLowerCase().indexOf(closeTag, contentStart);
  if (close === -1) return null;
  return {
    content: source.slice(contentStart, close),
    end: close + closeTag.length,
  };
}

/**
 * Inline formatter with nesting, math, sub/sup, footnotes, kbd, etc.
 */
export function parseInline(text) {
  const source = String(text || '');
  const runs = [];
  let i = 0;

  const pushText = (value) => {
    if (value) runs.push({ text: value });
  };

  const pushParsed = (inner, flags = {}) => {
    const nested = parseInline(inner);
    runs.push(...applyFlags(nested, flags));
  };

  while (i < source.length) {
    // Escaped special character → literal
    if (source[i] === '\\' && i + 1 < source.length && /[\\`*_{}[\]()#+\-.!|$]/.test(source[i + 1])) {
      pushText(source[i + 1]);
      i += 2;
      continue;
    }

    // Inline math $...$ (not $$)
    if (source[i] === '$' && source[i + 1] !== '$') {
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === '\\') {
          j += 2;
          continue;
        }
        if (source[j] === '$') break;
        j += 1;
      }
      if (j < source.length && j > i + 1 && !/\s/.test(source[i + 1]) && !/\s/.test(source[j - 1])) {
        runs.push({ text: source.slice(i + 1, j), math: true });
        i = j + 1;
        continue;
      }
    }

    // HTML sub / sup / kbd / mark
    if (source[i] === '<') {
      const sub = readHtmlTag(source, i, 'sub');
      if (sub) {
        pushParsed(sub.content, { sub: true });
        i = sub.end;
        continue;
      }
      const sup = readHtmlTag(source, i, 'sup');
      if (sup) {
        pushParsed(sup.content, { sup: true });
        i = sup.end;
        continue;
      }
      const kbd = readHtmlTag(source, i, 'kbd');
      if (kbd) {
        pushParsed(kbd.content, { kbd: true });
        i = kbd.end;
        continue;
      }
      const mark = readHtmlTag(source, i, 'mark');
      if (mark) {
        pushParsed(mark.content, { mark: true });
        i = mark.end;
        continue;
      }
    }

    // Unicode-ish wrappers from older imports: ₍x₎ / ⁽x⁾
    if (source[i] === '₍') {
      const end = source.indexOf('₎', i + 1);
      if (end !== -1) {
        pushParsed(source.slice(i + 1, end), { sub: true });
        i = end + 1;
        continue;
      }
    }
    if (source[i] === '⁽') {
      const end = source.indexOf('⁾', i + 1);
      if (end !== -1) {
        pushParsed(source.slice(i + 1, end), { sup: true });
        i = end + 1;
        continue;
      }
    }

    // Footnote ref [^id]
    if (source.startsWith('[^', i)) {
      const end = source.indexOf(']', i + 2);
      if (end !== -1) {
        const id = source.slice(i + 2, end).trim();
        if (id && !id.includes(' ')) {
          runs.push({ text: id, footnoteRef: true });
          i = end + 1;
          continue;
        }
      }
    }

    // Linked image: [![alt](src)](href)
    if (source.startsWith('[![', i)) {
      const altEnd = source.indexOf(']', i + 3);
      if (altEnd !== -1 && source[altEnd + 1] === '(') {
        const imgDest = readDestination(source, altEnd + 1);
        if (imgDest && source[imgDest.end] === ']' && source[imgDest.end + 1] === '(') {
          const linkDest = readDestination(source, imgDest.end + 1);
          if (linkDest) {
            const alt = source.slice(i + 3, altEnd);
            runs.push({
              text: alt,
              alt,
              src: imgDest.href,
              href: linkDest.href,
              image: true,
            });
            i = linkDest.end;
            continue;
          }
        }
      }
    }

    // Image ![alt](src)
    if (source.startsWith('![', i)) {
      const altEnd = source.indexOf(']', i + 2);
      if (altEnd !== -1 && source[altEnd + 1] === '(') {
        const dest = readDestination(source, altEnd + 1);
        if (dest) {
          const alt = source.slice(i + 2, altEnd);
          runs.push({ text: alt, alt, src: dest.href, image: true });
          i = dest.end;
          continue;
        }
      }
    }

    // Link [text](href)
    if (source[i] === '[') {
      const labelEnd = source.indexOf(']', i + 1);
      if (labelEnd !== -1 && source[labelEnd + 1] === '(') {
        const dest = readDestination(source, labelEnd + 1);
        if (dest) {
          const label = source.slice(i + 1, labelEnd);
          if (label.startsWith('![') && label.includes('](')) {
            const nested = parseInline(label);
            const img = nested.find((r) => r.image);
            if (img) {
              runs.push({ ...img, href: dest.href });
              i = dest.end;
              continue;
            }
          }
          const labelRuns = parseInline(label);
          if (labelRuns.length === 1 && !labelRuns[0].image) {
            runs.push({ ...labelRuns[0], href: dest.href });
          } else {
            runs.push({ text: label, href: dest.href, children: labelRuns });
          }
          i = dest.end;
          continue;
        }
      }
    }

    // Code fences ``...`` / `...`
    if (source[i] === '`') {
      let n = 0;
      while (source[i + n] === '`') n += 1;
      const fence = '`'.repeat(n);
      const close = source.indexOf(fence, i + n);
      if (close !== -1) {
        runs.push({
          text: source.slice(i + n, close).replace(/^\s+|\s+$/g, ''),
          code: true,
        });
        i = close + n;
        continue;
      }
    }

    // Highlight ==text==
    if (source.startsWith('==', i)) {
      const close = source.indexOf('==', i + 2);
      if (close !== -1) {
        pushParsed(source.slice(i + 2, close), { mark: true });
        i = close + 2;
        continue;
      }
    }

    // Bold+italic *** / ___
    if (source.startsWith('***', i) || source.startsWith('___', i)) {
      const marker = source.slice(i, i + 3);
      const close = findClosingMarker(source, i + 3, marker);
      if (close !== -1) {
        pushParsed(source.slice(i + 3, close), { bold: true, italic: true });
        i = close + 3;
        continue;
      }
    }

    // Bold ** / __
    if (source.startsWith('**', i) || source.startsWith('__', i)) {
      const marker = source.slice(i, i + 2);
      const close = findClosingMarker(source, i + 2, marker);
      if (close !== -1 && close > i + 2) {
        pushParsed(source.slice(i + 2, close), { bold: true });
        i = close + 2;
        continue;
      }
    }

    // Strikethrough ~~
    if (source.startsWith('~~', i)) {
      const close = source.indexOf('~~', i + 2);
      if (close !== -1) {
        pushParsed(source.slice(i + 2, close), { strike: true });
        i = close + 2;
        continue;
      }
    }

    // Italic *text* (supports nested **)
    if (source[i] === '*' && source[i + 1] !== '*') {
      const close = findClosingMarker(source, i + 1, '*');
      if (close !== -1 && close > i + 1) {
        pushParsed(source.slice(i + 1, close), { italic: true });
        i = close + 1;
        continue;
      }
    }

    // Italic _text_ at word boundaries
    if (source[i] === '_' && source[i + 1] !== '_') {
      const prev = i === 0 ? ' ' : source[i - 1];
      if (!/\w/.test(prev)) {
        const close = findClosingMarker(source, i + 1, '_');
        if (close !== -1 && close > i + 1) {
          const next = source[close + 1] || ' ';
          if (!/\w/.test(next)) {
            pushParsed(source.slice(i + 1, close), { italic: true });
            i = close + 1;
            continue;
          }
        }
      }
    }

    // Autolink <http...>
    if (source[i] === '<' && /^<https?:\/\/[^>\s]+>/.test(source.slice(i))) {
      const end = source.indexOf('>', i + 1);
      const href = source.slice(i + 1, end);
      runs.push({ text: href, href });
      i = end + 1;
      continue;
    }

    // Plain text until next special char
    let j = i + 1;
    while (j < source.length) {
      const ch = source[j];
      // Keep snake_case underscores inside words
      if (ch === '_' && /\w/.test(source[j - 1] || '')) {
        j += 1;
        continue;
      }
      if ('*`~[<!$\\₍⁽'.includes(ch) || ch === '_') break;
      if (ch === '=' && source[j + 1] === '=') break;
      if (ch === '*') break;
      j += 1;
    }
    pushText(source.slice(i, j));
    i = j;
  }

  return runs;
}

function renderRunNode(run, key) {
  if (run.image) {
    const img = createElement('img', {
      key: `img-${key}`,
      src: run.src,
      alt: run.alt || '',
      className: 'my-4 max-h-[420px] w-auto max-w-full rounded-xl border border-[#E5DCCE]',
      loading: 'lazy',
    });
    if (run.href) {
      return createElement(
        'a',
        {
          key: `imglink-${key}`,
          href: run.href,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        img,
      );
    }
    return img;
  }

  if (run.math) {
    return createElement(
      'span',
      {
        key: `math-${key}`,
        className: 'blog-inline-math',
        'data-math': run.text,
      },
      run.text,
    );
  }

  if (run.footnoteRef) {
    return createElement(
      'a',
      {
        key: `fnref-${key}`,
        href: `#fn-${run.text}`,
        id: `fnref-${run.text}`,
        className: 'ml-0.5 align-super text-[11px] font-semibold text-[#C4A574] no-underline hover:underline',
      },
      `[${run.text}]`,
    );
  }

  let node = run.children?.length
    ? renderRuns(run.children)
    : run.text;

  if (run.kbd) {
    node = createElement(
      'kbd',
      {
        key: `kbd-${key}`,
        className:
          'rounded border border-[#E5DCCE] bg-[#FFFDF8] px-1.5 py-0.5 font-mono text-[12px] text-[#2C241B] shadow-[0_1px_0_#E5DCCE]',
      },
      node,
    );
  }
  if (run.sub) node = createElement('sub', { key: `sub-${key}` }, node);
  if (run.sup) node = createElement('sup', { key: `sup-${key}` }, node);
  if (run.bold) node = createElement('strong', { key: `b-${key}` }, node);
  if (run.italic) node = createElement('em', { key: `i-${key}` }, node);
  if (run.strike) {
    node = createElement('s', { key: `s-${key}`, className: 'text-[#78716C]' }, node);
  }
  if (run.mark) {
    node = createElement(
      'mark',
      {
        key: `m-${key}`,
        className: 'rounded bg-[#F5E6C8] px-1 text-[#2C241B]',
      },
      node,
    );
  }
  if (run.code) {
    node = createElement(
      'code',
      {
        key: `c-${key}`,
        className: 'rounded bg-[#F7F3EC] px-1.5 py-0.5 font-mono text-[13px] text-[#6B5A48]',
      },
      node,
    );
  }
  if (run.href) {
    node = createElement(
      'a',
      {
        key: `a-${key}`,
        href: run.href,
        className: 'text-[#C4A574] underline-offset-2 hover:underline',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      node,
    );
  }
  return createElement(Fragment, { key }, node);
}

export function renderRuns(runs) {
  return createElement(
    Fragment,
    null,
    ...runs.map((run, i) => renderRunNode(run, i)),
  );
}

/** Canonical id → display label for blog code blocks. */
export const CODE_LANG_LABELS = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  kotlin: 'Kotlin',
  swift: 'Swift',
  ruby: 'Ruby',
  php: 'PHP',
  dart: 'Dart',
  bash: 'Bash',
  powershell: 'PowerShell',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  markdown: 'Markdown',
  diff: 'Diff',
  mermaid: 'Mermaid',
  math: 'Math',
  latex: 'LaTeX',
  dockerfile: 'Dockerfile',
  plaintext: 'Plain text',
  text: 'Plain text',
};

/** Normalize fence/info-string aliases to a canonical lang id. */
export function normalizeCodeLang(raw) {
  const key = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/^language-/, '');
  if (!key) return 'plaintext';

  const aliases = {
    js: 'javascript',
    javascript: 'javascript',
    jsx: 'javascript',
    node: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    typescript: 'typescript',
    tsx: 'typescript',
    py: 'python',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    'c++': 'cpp',
    cxx: 'cpp',
    cc: 'cpp',
    c: 'c',
    h: 'c',
    cs: 'csharp',
    csharp: 'csharp',
    'c#': 'csharp',
    go: 'go',
    golang: 'go',
    rust: 'rust',
    rs: 'rust',
    kotlin: 'kotlin',
    kt: 'kotlin',
    swift: 'swift',
    ruby: 'ruby',
    rb: 'ruby',
    php: 'php',
    dart: 'dart',
    bash: 'bash',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    powershell: 'powershell',
    ps1: 'powershell',
    sql: 'sql',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    less: 'css',
    md: 'markdown',
    markdown: 'markdown',
    diff: 'diff',
    patch: 'diff',
    mermaid: 'mermaid',
    math: 'math',
    latex: 'latex',
    tex: 'latex',
    text: 'plaintext',
    txt: 'plaintext',
    plaintext: 'plaintext',
    plain: 'plaintext',
    dockerfile: 'dockerfile',
    docker: 'dockerfile',
    conf: 'plaintext',
    ini: 'plaintext',
    toml: 'plaintext',
  };

  return aliases[key] || key;
}

/** Human-readable language name for UI (editor + rendered blog). */
export function codeLangLabel(lang) {
  const id = normalizeCodeLang(lang);
  if (CODE_LANG_LABELS[id]) return CODE_LANG_LABELS[id];
  if (!id) return 'Plain text';
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** highlight.js language id for a canonical lang (null = skip / auto). */
export function hljsLanguageId(lang) {
  const id = normalizeCodeLang(lang);
  const map = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'csharp',
    go: 'go',
    rust: 'rust',
    kotlin: 'kotlin',
    swift: 'swift',
    ruby: 'ruby',
    php: 'php',
    dart: 'dart',
    bash: 'bash',
    shell: 'bash',
    powershell: 'powershell',
    sql: 'sql',
    json: 'json',
    yaml: 'yaml',
    xml: 'xml',
    html: 'xml',
    css: 'css',
    scss: 'scss',
    markdown: 'markdown',
    diff: 'diff',
    dockerfile: 'dockerfile',
    plaintext: null,
    mermaid: null,
    math: null,
    latex: null,
  };
  return map[id] !== undefined ? map[id] : id;
}

export const CODE_LANG_OPTIONS = Object.entries(CODE_LANG_LABELS)
  .filter(([id]) => !['text', 'latex', 'scss'].includes(id))
  .map(([value, label]) => ({ value, label }));

export function createEmptyBlock(type) {
  switch (type) {
    case 'heading':
      return { type: 'heading', level: 2, text: '' };
    case 'paragraph':
      return { type: 'paragraph', text: '' };
    case 'bullets':
      return { type: 'bullets', items: [''] };
    case 'numbered':
      return { type: 'numbered', items: [''] };
    case 'code':
      return { type: 'code', lang: 'javascript', code: '' };
    case 'quote':
      return { type: 'quote', text: '' };
    case 'table':
      return { type: 'table', headers: ['Column 1', 'Column 2'], rows: [['', '']] };
    case 'divider':
      return { type: 'divider' };
    default:
      return { type: 'paragraph', text: '' };
  }
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
