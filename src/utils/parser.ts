export type BlockType = 'Question' | 'Answer' | 'Section' | 'Math' | 'Note' | 'Text' | 'PageBreak';

export interface ParsedBlock {
  id: string;
  type: BlockType;
  content: string;
}

const MATH_PATTERNS = [/\\frac/, /\\int/, /\\sqrt/, /\\sum/, /\^/, /=/, /\\alpha/, /\\beta/, /\\gamma/];

const isMath = (text: string) => {
  // If it has multiple math indicators, or starts with standard math symbols
  if (text.includes('\\') || (/^[x-z]\^?\d*/).test(text.trim())) {
      if (MATH_PATTERNS.some(p => p.test(text))) return true;
  }
  return false;
}

export const parseText = (rawText: string): ParsedBlock[] => {
  // Pre-process text to insert double newlines before explicit markers so they become separate blocks
  const processedText = rawText.replace(
    /\n(?=(?:Q|Question)\s*(?:\d+)?[.\-:\]\)]|Ans(?:wer)?\s*[.\-:]|\d+\.|---|##)/gi, 
    '\n\n'
  );
  
  const rawBlocks = processedText.split(/\n\s*\n/).filter(b => b.trim() !== '');
  
  return rawBlocks.map((block, index) => {
    const trimmed = block.trim();
    let type: BlockType = 'Text';
    
    if (trimmed === '---' || trimmed === '***') {
      type = 'PageBreak';
    } else if (/^(?:Q|Question)\s*(?:\d+)?[.\-:\]\)]/i.test(trimmed) || /^\d+\./.test(trimmed)) {
      type = 'Question';
    } else if (/^(?:Ans|Answer)\s*[.\-:]/i.test(trimmed)) {
      type = 'Answer';
    } else if (/^(?:MCQ|True\/False|Extract Questions|Long Questions|Notes|Activities|Section|Chapter|##|ଉଦାହରଣ)/i.test(trimmed)) {
      type = 'Section';
    } else if (/^(?:Note|Important):/i.test(trimmed)) {
      type = 'Note';
    } else if (isMath(trimmed) && trimmed.split('\n').length <= 2) {
      // Very crude math detection for blocks that are likely standalone equations
      type = 'Math';
    }

    return {
      id: `block-${index}`,
      type,
      content: block // preserve original formatting
    };
  });
};

