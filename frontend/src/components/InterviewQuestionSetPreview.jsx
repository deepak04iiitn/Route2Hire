import { useState } from 'react';
import { ChevronDown, Hash } from 'lucide-react';
import InterviewAnswer from './InterviewAnswer';
import { focusRing } from '../theme/tokens';

/**
 * Read-only preview of an interview topic set (matches public Q&A reveal style).
 */
export default function InterviewQuestionSetPreview({
  topic = '',
  description = '',
  questions = [],
}) {
  const [openMap, setOpenMap] = useState({});
  const items = Array.isArray(questions) ? questions : [];
  const filled = items.filter((q) => String(q?.question || '').trim() || String(q?.answer || '').trim());

  if (!String(topic || '').trim() && !filled.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#E5DCCE] bg-[#F7F3EC]/50 px-4 py-10 text-center">
        <p className="text-sm text-[#78716C]">Add a topic and questions to preview this set.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="space-y-2 border-b border-[#E5DCCE] pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">Preview</p>
        <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
          {topic.trim() || 'Untitled topic'}
        </h3>
        {description.trim() ? (
          <p className="text-sm leading-relaxed text-[#6B5A48]">{description}</p>
        ) : null}
        <p className="inline-flex items-center gap-1 text-[11px] text-[#78716C]">
          <Hash className="h-3 w-3" aria-hidden />
          {filled.length} question{filled.length === 1 ? '' : 's'}
        </p>
      </header>

      <ul className="space-y-3">
        {filled.map((qa, index) => {
          const isOpen = Boolean(openMap[index]);
          return (
            <li key={index} className="rounded-xl border border-[#E5DCCE] bg-[#FFFDF8]">
              <button
                type="button"
                onClick={() => setOpenMap((prev) => ({ ...prev, [index]: !prev[index] }))}
                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#F7F3EC]/70 ${focusRing}`}
              >
                <span className="font-display mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFE8DC] text-xs font-semibold text-[#C4A574]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium leading-snug text-[#1C1917] sm:text-[15px]">
                    {qa.question?.trim() || 'Untitled question'}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
                    {isOpen ? 'Hide answer' : 'Reveal answer'}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-[#E5DCCE] px-4 py-4 sm:pl-[3.75rem]">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                    Model answer
                  </p>
                  {qa.answer?.trim() ? (
                    <InterviewAnswer answer={qa.answer} />
                  ) : (
                    <p className="text-sm italic text-[#A89B8A]">No answer yet.</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
