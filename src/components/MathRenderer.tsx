import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';

interface MathRendererProps {
  math: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, inline }) => {
  // Try to remove $ or $$ for basic rendering
  const cleanMath = math.replace(/^\$+|\$+$/g, '').trim();
  
  if (inline) {
    return <InlineMath math={cleanMath} />;
  }

  return (
    <div className="my-4 overflow-x-auto text-xl">
      <BlockMath math={cleanMath} />
    </div>
  );
};
