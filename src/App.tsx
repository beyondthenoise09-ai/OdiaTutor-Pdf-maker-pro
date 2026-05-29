/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseText } from './utils/parser';
import { LivePreview } from './components/LivePreview';
import { Download, Settings, Menu, LayoutTemplate, X, Settings2, Code, MoveLeft, Moon, Sun, Type } from 'lucide-react';
import html2pdf from 'html2pdf.js';

type Theme = 'orange' | 'dark' | 'blue' | 'glass';

const exampleText = `Section: Physics Notes

Q1. What is Force?

Ans:
Force is a push or pull upon an object resulting from the object's interaction with another object. 
Whenever there is an interaction between two objects, there is a force upon each of the objects.

Activity: Think of examples of force.

Note: Force is a vector quantity.

Q2. What is the formula for Force?

Ans:
According to Newton's Second Law:
$ F = m \\times a $
Where:
m = mass
a = acceleration

Extract Questions:

Q3. Solve the following expression:
$$ \\frac{x^2 + 2x + 1}{x + 1} $$

Ans:
The expression simplifies to x + 1.`;

export default function App() {
  const [text, setText] = useState(exampleText);
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('Forces and Laws of Motion');
  const [theme, setTheme] = useState<Theme>('orange');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [scale, setScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(1123);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const parsedBlocks = parseText(text);

  useEffect(() => {
    // Apply theme
    document.documentElement.className = theme === 'orange' ? '' : `theme-${theme}`;
  }, [theme]);

  // Window resize scale logic
  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const { clientWidth } = previewContainerRef.current;
        const availableWidth = clientWidth - 32; // 16px padding on each side
        if (availableWidth < 794) {
          setScale(availableWidth / 794);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Resize observer to track the actual height of the PDF content layout
  useEffect(() => {
     if (!previewRef.current) return;
     const ro = new ResizeObserver((entries) => {
        for (let entry of entries) {
           setPreviewHeight(Math.max(1123, entry.target.clientHeight));
        }
     });
     ro.observe(previewRef.current);
     return () => ro.disconnect();
  }, [activeTab]);

  const generatePDF = async () => {
    if (!previewRef.current) return;
    setIsGenerating(true);
    
    const element = previewRef.current;
    
    const opt = {
      margin: [15, 10, 25, 10] as [number, number, number, number], // top, left, bottom, right
      filename: `${subject || 'Document'}_${chapter || 'Chapter'}_OdiaTutor.pdf`.replace(/\s+/g, '_'),
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: 794,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'], avoid: '.page-break-avoid' },
    };

    try {
      // Small delay for UI updates
      await new Promise(r => setTimeout(r, 200));

      const worker: any = html2pdf().set(opt).from(element);
      
      await worker.toPdf().get('pdf').then((pdf: any) => {
        // Add footer with page numbering and watermark globally
        const totalPages = pdf.internal.getNumberOfPages();
        const pWidth = pdf.internal.pageSize.getWidth();
        const pHeight = pdf.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          // --- Footer Orange Line ---
          pdf.setDrawColor(249, 115, 22);
          pdf.setLineWidth(0.5);
          pdf.line(15, pHeight - 15, pWidth - 15, pHeight - 15);

          // --- Footer Text ---
          pdf.setFontSize(10);
          pdf.setTextColor(120, 120, 120);
          
          // Left Side: Subject Name, Class, By Odia Tutor
          pdf.text(
            `Subject: ${subject || 'General'} | By ODIA TUTOR`,
            15, 
            pHeight - 10,
            { align: 'left' }
          );

          // Right Side: Page Number
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pWidth - 15,
            pHeight - 10,
            { align: 'right' }
          );
        }
      });
      
      await worker.save();
    } catch (e: any) {
      console.error("PDF Gen Error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-2 rounded-lg shadow-md">
            <LayoutTemplate size={24} />
          </div>
          <div>
             <h1 className="font-bold text-xl tracking-tight text-gray-900">ODIA TUTOR</h1>
             <p className="text-xs text-gray-500 font-medium -mt-1 tracking-wide">PDF MAKER PRO</p>
          </div>
        </div>
        
        <div className="flex flex-1 max-w-xl mx-8 gap-4 hidden md:flex">
             <input 
               type="text" 
               placeholder="Subject Name (e.g. English)" 
               value={subject}
               onChange={(e) => setSubject(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
             />
             <input 
               type="text" 
               placeholder="Chapter Name" 
               value={chapter}
               onChange={(e) => setChapter(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
             />
        </div>

        <div className="flex items-center gap-3">
           <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg border-none outline-none cursor-pointer hidden sm:block transition-colors"
           >
              <option value="orange">Premium Orange</option>
              <option value="blue">Blue Professional</option>
              <option value="dark">Dark Mode</option>
              <option value="glass">Glassmorphism</option>
           </select>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <Download size={18} />
            )}
            {isGenerating ? 'Generating...' : 'Export PDF'}
          </motion.button>
        </div>
      </nav>

      {/* Mobile inputs & Tabs */}
      <div className="lg:hidden flex flex-col bg-white border-b border-gray-200 shrink-0">
          <div className="flex gap-2 p-4 pb-2">
            <input 
                type="text" 
                placeholder="Subject Name" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input 
                type="text" 
                placeholder="Chapter Name" 
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="flex border-t border-gray-100">
             <button 
               onClick={() => setActiveTab('editor')}
               className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'editor' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50' : 'text-gray-500'}`}
             >
                <Code size={16} /> Editor
             </button>
             <button 
               onClick={() => setActiveTab('preview')}
               className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50' : 'text-gray-500'}`}
             >
                <LayoutTemplate size={16} /> Preview
             </button>
          </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
        
        {/* Editor Panel */}
        <div className={`w-full lg:w-1/2 flex-col bg-white border-r border-gray-200 h-full ${activeTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
           <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                 <Code size={16} />
                 <span>Raw Content Editor</span>
              </div>
           </div>
           <div className="flex-1 p-0 relative">
             <textarea
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Type or paste your raw educational text here...\n\nExample:\nQ1. What is force?\nAns: It is a push or pull."
               className="w-full h-full resize-none outline-none p-6 text-gray-700 font-mono text-[15px] leading-relaxed relative z-10 bg-transparent"
               spellCheck="false"
             />
           </div>
        </div>

        {/* Preview Panel */}
        <div className={`w-full lg:w-1/2 flex-col bg-gray-100 h-full overflow-hidden relative ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
           <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/50 backdrop-blur-sm z-10 sticky top-0 shadow-sm hidden lg:flex">
              <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                 <LayoutTemplate size={16} />
                 <span>Live PDF Preview</span>
              </div>
           </div>
           
           <div ref={previewContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-gray-200 custom-scrollbar relative">
              <div 
                 className="mx-auto flex justify-center" 
                 style={{ 
                    width: `${794 * scale}px`, 
                    height: `${previewHeight * scale}px` 
                 }}
              >
                <div 
                  className="origin-top-left bg-white"
                  style={{ 
                    transform: `scale(${scale})`,
                    width: '794px', 
                    minHeight: '1123px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                  }}
                >
                   <LivePreview ref={previewRef} blocks={parsedBlocks} subject={subject} chapter={chapter} />
                </div>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
