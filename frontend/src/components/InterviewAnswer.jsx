import { useMemo } from 'react';
import BlogBlocks from './blog/BlogBlocks';
import { markdownToBlogBlocks, isBlankBlogContent } from '../lib/markdown-to-blog-blocks';

/**
 * Render an interview answer. Markdown (from MD import or rich answers) goes through
 * the shared blog parser; plain text still renders as a single paragraph.
 */
export default function InterviewAnswer({ answer }) {
  const blocks = useMemo(() => {
    const text = String(answer || '');
    if (!text.trim()) return [];
    const { blocks: parsed } = markdownToBlogBlocks(text);
    return isBlankBlogContent(parsed) ? [] : parsed;
  }, [answer]);

  if (!blocks.length) {
    return (
      <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#2C241B] sm:text-[15px]">
        {answer}
      </div>
    );
  }

  return (
    <div className="interview-answer text-[14px] leading-relaxed text-[#2C241B] sm:text-[15px] [&_.prose]:text-[inherit] [&_p]:my-2 [&_p:first-child]:mt-0 [&_ul]:my-2 [&_ol]:my-2 [&_pre]:my-3 [&_blockquote]:my-3 [&_hr]:my-4 [&_h2]:mt-4 [&_h2]:text-lg [&_h3]:mt-3 [&_h3]:text-base">
      <BlogBlocks blocks={blocks} compact />
    </div>
  );
}
