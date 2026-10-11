import { Fragment, useEffect, useId, useRef, useState } from 'react';
import hljs from 'highlight.js';
import katex from 'katex';
import mermaid from 'mermaid';
import { Hash, Quote } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  codeLangLabel,
  hljsLanguageId,
  normalizeCodeLang,
  parseInline,
  renderRuns,
} from '../../lib/blog-blocks';
import './blog-code-highlight.css';
import 'katex/dist/katex.min.css';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'strict',
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
});

function Heading({ block, chapterNumber }) {
  const { id, level, text } = block;

  const copyLink = () => {
    if (!id) return;
    navigator.clipboard.writeText(`${window.location.href.split('#')[0]}#${id}`);
    toast.success('Section link copied');
  };

  if (level === 3) {
    return (
      <h3 id={id} className="font-display mt-7 scroll-mt-28 text-xl font-semibold text-[#1C1917]">
        {renderRuns(parseInline(text))}
      </h3>
    );
  }

  return (
    <h2 id={id} className="group relative mt-14 mb-5 flex scroll-mt-28 items-start gap-4">
      {chapterNumber !== undefined && (
        <span className="mt-1 shrink-0 font-mono text-sm font-bold tabular-nums text-[#C4A574]/70">
          {String(chapterNumber).padStart(2, '0')}
        </span>
      )}
      <span className="font-display flex-1 text-2xl font-semibold text-[#1C1917]">
        {renderRuns(parseInline(text))}
      </span>
      <button
        type="button"
        aria-label="Copy link to section"
        onClick={copyLink}
        className="mt-2 shrink-0 text-[#78716C] opacity-0 transition-opacity hover:text-[#C4A574] group-hover:opacity-100"
      >
        <Hash className="h-4 w-4" />
      </button>
    </h2>
  );
}

function InlineMathHydrator({ children, deps }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll('.blog-inline-math[data-math]').forEach((el) => {
      const expr = el.getAttribute('data-math') || '';
      try {
        katex.render(expr, el, { throwOnError: false, displayMode: false });
      } catch {
        el.textContent = expr;
      }
    });
  }, [deps]);

  return <span ref={ref}>{children}</span>;
}

function MathBlock({ code }) {
  let html = '';
  try {
    html = katex.renderToString(code || '', { throwOnError: false, displayMode: true });
  } catch {
    html = '';
  }

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-5 text-center">
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="m-0 whitespace-pre-wrap text-left text-sm text-[#57534E]">{code}</pre>
      )}
    </div>
  );
}

function MermaidBlock({ code }) {
  const reactId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const id = `mermaid-${reactId}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg: out } = await mermaid.render(id, code || '');
        if (!cancelled) {
          setSvg(out);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setSvg('');
          setError(err?.message || 'Failed to render diagram');
        }
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [code, reactId]);

  if (error) {
    return (
      <div className="not-prose my-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Mermaid error: {error}
      </div>
    );
  }

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-5">
      {svg ? (
        <div className="flex justify-center [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="m-0 text-center text-sm text-[#78716C]">Rendering diagram…</p>
      )}
    </div>
  );
}

function CodeBlock({ lang, code }) {
  const canonical = normalizeCodeLang(lang);

  if (canonical === 'mermaid') {
    return <MermaidBlock code={code} />;
  }
  if (canonical === 'math' || canonical === 'latex') {
    return <MathBlock code={code} />;
  }

  const hljsId = hljsLanguageId(canonical);
  let html = code;

  try {
    if (hljsId && hljs.getLanguage(hljsId)) {
      html = hljs.highlight(code || '', { language: hljsId }).value;
    } else if (!hljsId) {
      // plaintext / unknown special langs — never auto-detect into wrong labels
      html = (code || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } else {
      html = hljs.highlightAuto(code || '').value;
    }
  } catch {
    html = code || '';
  }

  return (
    <div className="blog-code-block not-prose my-6 overflow-hidden rounded-xl border border-[#2C241B]/25 bg-[#1A1510] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#241c16] px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="font-mono text-[10px] font-medium tracking-wide text-[#C4B8A8]">
          {codeLangLabel(canonical)}
        </span>
      </div>
      <pre className="m-0 overflow-x-auto bg-[#1A1510] p-4 text-[13px] leading-relaxed text-[#e8e4dc]">
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

function Footnotes({ items = [] }) {
  return (
    <ol className="not-prose my-4 list-decimal space-y-3 pl-5 text-[14px] leading-relaxed text-[#57534E]">
      {items.map((item, i) => {
        const match = String(item).match(/^\[\[fn:([^\]]+)\]\]\s*([\s\S]*)$/);
        const legacy = String(item).match(/^\[\^([^\]]+)\]:\s*([\s\S]*)$/);
        const id = match?.[1] || legacy?.[1] || String(i + 1);
        const body = match?.[2] || legacy?.[2] || item;
        return (
          <li key={id} id={`fn-${id}`} className="scroll-mt-28">
            <InlineMathHydrator deps={body}>
              {renderRuns(parseInline(body))}
            </InlineMathHydrator>{' '}
            <a
              href={`#fnref-${id}`}
              className="text-[#C4A574] no-underline hover:underline"
              aria-label="Back to reference"
            >
              ↩
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function RichText({ text, className }) {
  return (
    <InlineMathHydrator deps={text}>
      <span className={className}>{renderRuns(parseInline(text))}</span>
    </InlineMathHydrator>
  );
}

function listItemText(item) {
  return typeof item === 'string' ? item : item?.text || '';
}

function listItemChildren(item) {
  if (!item || typeof item === 'string') return null;
  return Array.isArray(item.children) && item.children.length ? item.children : null;
}

function ListBlock({ type, items = [] }) {
  const Tag = type === 'numbered' ? 'ol' : 'ul';
  return (
    <Tag>
      {items.map((item, j) => {
        const children = listItemChildren(item);
        return (
          <li key={j}>
            <RichText text={listItemText(item)} />
            {children?.map((child, k) => (
              <ListBlock
                key={`${j}-${k}`}
                type={child.type === 'numbered' ? 'numbered' : 'bullets'}
                items={child.items || []}
              />
            ))}
          </li>
        );
      })}
    </Tag>
  );
}

export default function BlogBlocks({ blocks = [] }) {
  const chapterNumbers = [];
  let n = 0;
  for (const block of blocks) {
    chapterNumbers.push(block.type === 'heading' && block.level === 2 ? (n += 1) : 0);
  }
  const firstParagraphIndex = blocks.findIndex((b) => b.type === 'paragraph');

  return (
    <div
      className="prose prose-neutral max-w-none
      prose-headings:font-display prose-headings:text-[#1C1917]
      prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-[#57534E]
      prose-a:text-[#C4A574] prose-a:no-underline hover:prose-a:underline
      prose-strong:font-semibold prose-strong:text-[#2C241B]
      prose-code:before:content-none prose-code:after:content-none
      prose-table:text-[14px] prose-th:bg-[#F7F3EC] prose-th:font-semibold prose-td:text-[#57534E]
      prose-ul:list-disc prose-ol:list-decimal
      prose-li:text-[15px] prose-li:leading-[1.8] prose-li:text-[#57534E] prose-li:marker:text-[#C4A574]/50
      prose-hr:my-8 prose-hr:border-[#E5DCCE]"
    >
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <Heading
                key={i}
                block={block}
                chapterNumber={block.level === 2 ? chapterNumbers[i] : undefined}
              />
            );
          case 'paragraph': {
            // Legacy footnote definition paragraphs
            const fn = String(block.text || '').match(/^\[\^([^\]]+)\]:\s*([\s\S]*)$/);
            if (fn) {
              return (
                <Footnotes
                  key={i}
                  items={[`[[fn:${fn[1]}]] ${fn[2]}`]}
                />
              );
            }
            const isFirst = i === firstParagraphIndex;
            return (
              <p
                key={i}
                className={
                  isFirst
                    ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-[#C4A574]'
                    : undefined
                }
              >
                <RichText text={block.text} />
              </p>
            );
          }
          case 'bullets':
            return <ListBlock key={i} type="bullets" items={block.items} />;
          case 'numbered':
            return <ListBlock key={i} type="numbered" items={block.items} />;
          case 'footnotes':
            return <Footnotes key={i} items={block.items || []} />;
          case 'code':
            return <CodeBlock key={i} lang={block.lang} code={block.code} />;
          case 'quote':
            return (
              <blockquote
                key={i}
                className="not-prose relative my-8 rounded-r-xl border-l-4 border-[#C4A574] bg-[#F7F3EC]/80 py-5 pl-8 pr-5"
              >
                <Quote className="absolute left-3 top-4 h-5 w-5 rotate-180 text-[#C4A574]/40" />
                <div className="text-[15px] italic leading-relaxed text-[#57534E]">
                  <p className="my-0">
                    <RichText text={block.text} />
                  </p>
                </div>
              </blockquote>
            );
          case 'table':
            return (
              <div key={i} className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      {block.headers.map((h, j) => (
                        <th key={j}>
                          <RichText text={h} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k}>
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'divider':
            return <hr key={i} />;
          default:
            return <Fragment key={i} />;
        }
      })}
    </div>
  );
}
