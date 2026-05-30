import React, { forwardRef } from 'react';
import { ParsedBlock } from '../utils/parser';
import { QuestionCard, AnswerCard, SectionCard, TextCard, NoteCard, PageBreakCard } from './Cards';
import { MathRenderer } from './MathRenderer';

interface LivePreviewProps {
  blocks: ParsedBlock[];
  subject: string;
  chapter: string;
}

export const LivePreview = forwardRef<HTMLDivElement, LivePreviewProps>(
  ({ blocks, subject, chapter }, ref) => {
    return (
      <div 
        ref={ref} 
        className="w-full bg-[var(--pdf-bg)] text-[var(--text-color)] text-left relative printable-pdf"
      >
        <div className="relative z-10 px-8 py-10 md:px-12 md:py-16">
          {/* Header */}
          <div 
            className="mb-10 text-center rounded-2xl p-8 text-[#ffffff] page-break-avoid"
            style={{ 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              background: 'linear-gradient(to right, var(--header-grad-from), var(--header-grad-to))'
            }}
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">ODIA TUTOR</h1>
            <p className="font-medium uppercase tracking-widest text-sm mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>Premium Coaching Material</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-lg">
              {subject ? <span className="font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>Subject: {subject}</span> : null}
              {chapter ? <span className="font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>Chapter: {chapter}</span> : null}
            </div>
          </div>

          {/* Content */}
          <div className="block space-y-4">
            {blocks.map((block) => {
              switch (block.type) {
                case 'Question':
                  return <QuestionCard key={block.id} content={block.content} />;
                case 'Answer':
                  return <AnswerCard key={block.id} content={block.content} />;
                case 'Section':
                  return <SectionCard key={block.id} content={block.content} />;
                case 'Note':
                  return <NoteCard key={block.id} content={block.content} />;
                case 'PageBreak':
                  return <PageBreakCard key={block.id} />;
                case 'Math':
                  return <div key={block.id} className="page-break-avoid"><MathRenderer math={block.content} /></div>;
                default:
                  return <TextCard key={block.id} content={block.content} />;
              }
            })}
          </div>

          {!blocks.length && (
             <div className="text-center mt-20 font-medium h-full flex flex-col items-center justify-center" style={{ color: '#9ca3af' }}>
                 <p className="text-xl">Preview will appear here</p>
                 <p className="text-sm mt-2">Type text on the left to see magic</p>
             </div>
          )}
        </div>
      </div>
    );
  }
);
