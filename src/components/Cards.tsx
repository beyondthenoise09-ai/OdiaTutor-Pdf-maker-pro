import React from 'react';
import { cn } from '../lib/utils';
import { MathRenderer } from './MathRenderer';

const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Always split by explicit $...$ or $$...$$
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  
  return (
    <div className="whitespace-pre-wrap font-sans text-[var(--text-color)]">
      {parts.map((part, i) => {
         const trimmedPart = part.trim();
         if (trimmedPart.startsWith('$$') && trimmedPart.endsWith('$$') && trimmedPart.length >= 4) {
            return <MathRenderer key={i} math={trimmedPart} />;
         } else if (trimmedPart.startsWith('$') && trimmedPart.endsWith('$') && trimmedPart.length >= 2) {
            return <span key={i}><MathRenderer math={trimmedPart} inline /></span>;
         }
         
         // For text parts, we can look for simple equations on their own lines like "F = ma", "E=mc^2"
         const lines = part.split(/(\n)/);
         return (
           <React.Fragment key={i}>
             {lines.map((line, j) => {
               if (line === '\n') return '\n';
               
               const trimmed = line.trim();
               const cleanedForTest = trimmed.replace(/\\[a-zA-Z]+/g, ''); // Remove latex commands for word check
               // Very strict auto-math detection: only variables, =, basic math, no long words
               const isEquationLine = /^[A-Za-z0-9\s()^+*/\\_{}-]+=[A-Za-z0-9\s()^+*/\\_{}-]+$/.test(trimmed) 
                                      && trimmed.length < 60 
                                      && !/[a-zA-Z]{4,}/.test(cleanedForTest); // No words longer than 3 chars
               
               if (isEquationLine && !trimmed.toLowerCase().includes('http')) {
                 return (
                   <span key={j} className="block w-full my-2">
                     <MathRenderer math={trimmed} />
                   </span>
                 );
               }
               
               // Let's also check for isolated fractions or powers that the user didn't wrap in $
               if ((trimmed.includes('\\frac') || trimmed.includes('^2') || trimmed.includes('\\times')) && trimmed.length < 40 && !/[a-zA-Z]{4,}/.test(cleanedForTest)) {
                 return (
                   <span key={j} className="inline-block mx-1">
                     <MathRenderer math={trimmed} inline />
                   </span>
                 );
               }

               return <span key={j}>{line}</span>;
             })}
           </React.Fragment>
         );
      })}
    </div>
  );
};

export const QuestionCard: React.FC<{ content: string; className?: string }> = ({ content, className }) => (
  <div className={cn(
    "page-break-avoid mb-6 rounded-xl bg-[var(--card-bg)] p-6 border-l-4",
    "border-l-[var(--primary)] text-lg font-semibold text-[color:var(--text-color)] w-full",
    className
  )} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <ContentRenderer content={content} />
  </div>
);

export const AnswerCard: React.FC<{ content: string; className?: string }> = ({ content, className }) => (
  <div className={cn(
    "page-break-avoid mb-6 rounded-xl bg-[var(--answer-bg)] p-6 border-l-4",
    "border-l-[var(--answer-border)] text-base font-medium text-[color:var(--text-color)] w-full",
    className
  )} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <ContentRenderer content={content} />
  </div>
);

export const SectionCard: React.FC<{ content: string; className?: string }> = ({ content, className }) => (
  <div className={cn(
    "page-break-avoid mt-8 mb-6 rounded-2xl bg-[var(--primary-light)] p-5 text-center w-full",
    className
  )} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <h2 className="text-xl font-bold uppercase tracking-wide text-[color:var(--primary)]">{content}</h2>
  </div>
);

export const TextCard: React.FC<{ content: string; className?: string }> = ({ content, className }) => (
  <div className={cn("page-break-avoid mb-4 text-base w-full", className)}>
    <ContentRenderer content={content} />
  </div>
);

export const PageBreakCard: React.FC = () => (
  <div className="html2pdf__page-break" style={{ pageBreakAfter: 'always', clear: 'both', margin: 0, padding: 0, height: 0, border: 'none' }} />
);

export const NoteCard: React.FC<{ content: string; className?: string }> = ({ content, className }) => (
  <div className={cn(
    "page-break-avoid mb-6 rounded-xl bg-[#fefce8] p-6 border-l-4 border-[#facc15] w-full",
    className
  )} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <ContentRenderer content={content} />
  </div>
);
