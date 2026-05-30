/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseText } from './utils/parser';
import { LivePreview } from './components/LivePreview';
import { Download, LayoutTemplate, Code, X, Printer, FileText } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [scale, setScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(1123);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
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

  // Set document title for PDF print filename
  useEffect(() => {
    const filename = `${subject || 'Document'}_${chapter || 'Chapter'}_OdiaTutor`.replace(/\s+/g, '_');
    document.title = filename;
  }, [subject, chapter]);

  const generatePDF = () => {
    if (activeTab === 'editor' && window.innerWidth < 1024) {
        setActiveTab('preview');
        setTimeout(() => setShowPrintModal(true), 300);
    } else {
        setShowPrintModal(true);
    }
  };

  const executePrint = () => {
      setShowPrintModal(false);
      setTimeout(() => window.print(), 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="print-hide h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-20 sticky top-0 shadow-sm">
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
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm shadow-orange-500/20 transition-colors"
          >
            <Download size={18} />
            Export High-Quality PDF
          </motion.button>
        </div>
      </nav>

      {/* Mobile inputs & Tabs */}
      <div className="print-hide lg:hidden flex flex-col bg-white border-b border-gray-200 shrink-0">
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
        <div className={`print-hide w-full lg:w-1/2 flex-col bg-white border-r border-gray-200 h-full ${activeTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
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
        <div className={`print-show-full w-full lg:w-1/2 flex-col bg-gray-100 h-full overflow-hidden relative ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
           <div className="print-hide flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/50 backdrop-blur-sm z-10 sticky top-0 shadow-sm hidden lg:flex">
              <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                 <LayoutTemplate size={16} />
                 <span>Live PDF Preview</span>
              </div>
           </div>
           
           <div ref={previewContainerRef} className="print-show-full flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-gray-200 custom-scrollbar relative">
              <div 
                 className="mx-auto flex justify-center print-show-full printable-pdf-wrapper" 
                 style={{ 
                    width: `${794 * scale}px`, 
                    height: `${previewHeight * scale}px` 
                 }}
              >
                <div 
                  className="origin-top-left bg-white printable-pdf"
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

      <AnimatePresence>
        {showPrintModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                   <Printer size={20} className="text-orange-500" />
                   High-Quality PDF Export
                </h3>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  To ensure perfect clarity and support for any number of pages, we use the browser's native PDF engine. 
                  When the print dialog opens:
                </p>
                <ol className="space-y-4 mb-8">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">1</span>
                    <span className="text-gray-700">Change the <strong>Destination</strong> to <strong>Save as PDF</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">2</span>
                    <span className="text-gray-700">Ensure <strong>Headers and Footers</strong> are turned <strong>off</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">3</span>
                    <span className="text-gray-700">Click <strong>Save</strong>.</span>
                  </li>
                </ol>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowPrintModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executePrint}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Open Print Dialog
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
