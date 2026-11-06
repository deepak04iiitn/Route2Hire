/**
 * Convert Markdown into an interview question set using the shared blog MD parser.
 *
 * Expected shape:
 *   ---
 *   topic: Selenium WebDriver
 *   description: Core WebDriver questions for QA/SDET
 *   ---
 *
 *   # Selenium WebDriver
 *
 *   Optional intro → description (if frontmatter description is missing).
 *
 *   ## What is Selenium WebDriver?
 *
 *   Answer body (paragraphs, lists, code, tables, ### subsections…)
 *
 *   ## Explain implicit vs explicit waits
 *
 *   …
 *
 * Question delimiters are ## headings (H2). If the file has no H2s, ### is used.
 */

import { markdownToBlogBlocks } from './markdown-to-blog-blocks.js';

function listItemToMd(item, kind, index, indent) {
  const pad = '  '.repeat(indent);
  const prefix = kind === 'numbered' ? `${index + 1}. ` : '- ';
  const text = typeof item === 'string' ? item : item?.text || '';
  let out = `${pad}${prefix}${text}`;
  const children = typeof item === 'object' && item?.children ? item.children : [];
  for (const child of children) {
    if (!child?.items?.length) continue;
    out += `\n${listToMd(child, indent + 1)}`;
  }
  return out;
}

function listToMd(list, indent = 0) {
  const kind = list.type === 'numbered' ? 'numbered' : 'bullets';
  return (list.items || [])
    .map((item, i) => listItemToMd(item, kind, i, indent))
    .join('\n');
}

/** Serialize blog blocks back to Markdown for storage in answer textareas / DB. */
export function blocksToMarkdown(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return '';

  const parts = [];
  for (const block of blocks) {
    if (!block?.type) continue;
    switch (block.type) {
      case 'heading': {
        const level = Math.min(6, Math.max(1, Number(block.level) || 2));
        const text = String(block.text || '').trim();
        if (text) parts.push(`${'#'.repeat(level)} ${text}`);
        break;
      }
      case 'paragraph': {
        const text = String(block.text || '').trim();
        if (text) parts.push(text);
        break;
      }
      case 'bullets':
      case 'numbered': {
        const md = listToMd(block);
        if (md.trim()) parts.push(md);
        break;
      }
      case 'code': {
        const lang = block.lang && block.lang !== 'plaintext' ? block.lang : '';
        parts.push(`\`\`\`${lang}\n${String(block.code || '')}\n\`\`\``);
        break;
      }
      case 'quote': {
        const text = String(block.text || '');
        if (text.trim()) {
          parts.push(
            text
              .split('\n')
              .map((line) => `> ${line}`)
              .join('\n'),
          );
        }
        break;
      }
      case 'table': {
        const headers = Array.isArray(block.headers) ? block.headers : [];
        const rows = Array.isArray(block.rows) ? block.rows : [];
        if (!headers.length && !rows.length) break;
        const cols = Math.max(headers.length, ...rows.map((r) => (r || []).length), 1);
        const padRow = (cells) => {
          const c = [...(cells || [])];
          while (c.length < cols) c.push('');
          return `| ${c.join(' | ')} |`;
        };
        const head = padRow(headers.length ? headers : Array(cols).fill(''));
        const sep = `| ${Array(cols).fill('---').join(' | ')} |`;
        const body = rows.map((r) => padRow(r)).join('\n');
        parts.push([head, sep, body].filter(Boolean).join('\n'));
        break;
      }
      case 'divider':
        parts.push('---');
        break;
      case 'footnotes': {
        const items = Array.isArray(block.items) ? block.items : [];
        const md = items
          .map((item) => `- ${typeof item === 'string' ? item : item?.text || ''}`)
          .filter((line) => line.trim() !== '-')
          .join('\n');
        if (md) parts.push(md);
        break;
      }
      default: {
        const text = String(block.text || '').trim();
        if (text) parts.push(text);
      }
    }
  }

  return parts.join('\n\n').trim();
}

function cleanQuestionTitle(text) {
  return String(text || '')
    .replace(/^(?:Q(?:uestion)?\s*)?\d+[.):\-]\s*/i, '')
    .replace(/^Q\s*[:\-]\s*/i, '')
    .trim();
}

/**
 * @param {string} markdown
 * @returns {{ topic: string, description: string, questions: Array<{ question: string, answer: string, images: [] }>, meta: object }}
 */
export function markdownToInterviewQuestions(markdown) {
  const source = String(markdown || '');
  if (!source.trim()) {
    throw new Error('Markdown file is empty');
  }

  const { blocks, meta } = markdownToBlogBlocks(source);

  let topic = String(meta.topic || meta.title || '').trim();
  let description = String(meta.description || meta.excerpt || '').trim();

  const headingLevels = blocks
    .filter((b) => b.type === 'heading')
    .map((b) => b.level);
  const hasH2 = headingLevels.includes(2);
  const hasH3 = headingLevels.includes(3);
  const questionLevel = hasH2 ? 2 : hasH3 ? 3 : 2;

  const questions = [];
  let currentQ = null;
  let answerBlocks = [];
  const prefaceBlocks = [];

  const flush = () => {
    if (currentQ == null) return;
    const answer = blocksToMarkdown(answerBlocks);
    questions.push({
      question: currentQ,
      answer,
      images: [],
    });
    currentQ = null;
    answerBlocks = [];
  };

  for (const block of blocks) {
    if (block.type === 'heading' && block.level === 1) {
      if (!topic) topic = String(block.text || '').trim();
      continue;
    }

    if (block.type === 'heading' && block.level === questionLevel) {
      if (currentQ == null && !description && prefaceBlocks.length) {
        description = blocksToMarkdown(prefaceBlocks);
        prefaceBlocks.length = 0;
      }
      flush();
      currentQ = cleanQuestionTitle(block.text);
      continue;
    }

    if (currentQ != null) {
      answerBlocks.push(block);
    } else {
      prefaceBlocks.push(block);
    }
  }
  flush();

  if (!description && prefaceBlocks.length) {
    description = blocksToMarkdown(prefaceBlocks);
  }

  if (!topic) {
    throw new Error('Missing topic. Add a # Title or frontmatter `topic:` field.');
  }

  const valid = questions.filter((q) => q.question.trim() && q.answer.trim());
  if (!valid.length) {
    throw new Error(
      'No questions found. Use ## headings for each question, with answer content underneath.',
    );
  }

  if (!description.trim()) {
    description = `Interview questions on ${topic}`;
  }

  return { topic, description, questions: valid, meta };
}
