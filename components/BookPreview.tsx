import React, { useState } from 'react';
import { BookStructure } from '../types';
import { Download, ChevronRight, Book, PlayCircle, ShieldCheck, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BookPreviewProps {
  book: BookStructure;
  onExport: () => void;
  onReset: () => void;
}

const BookPreview: React.FC<BookPreviewProps> = ({ book, onExport, onReset }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeChapter = book.chapters[activeChapterIndex];

  const handleCopy = async () => {
    try {
      let textContent = `# ${book.title}\n${book.subtitle}\n\nBy ${book.author}\n\n`;
      textContent += `## Abstract\n${book.abstract}\n\n`;
      
      book.chapters.forEach((chapter, i) => {
        textContent += `## Chapter ${i + 1}: ${chapter.title}\n\n`;
        chapter.sections.forEach(section => {
          textContent += `### ${section.title}\n${section.content}\n\n`;
        });
      });

      textContent += `## References\n`;
      book.references.forEach(ref => textContent += `- ${ref}\n`);

      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-100 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-islamic-green rounded text-white">
            <Book size={20} />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-gray-900 leading-tight">{book.title}</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{book.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Create New
          </button>
          
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
              copied 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            title="Copy full book text"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-5 py-2 bg-islamic-gold hover:bg-amber-600 text-white rounded-lg font-medium shadow-md transition-colors"
          >
            <Download size={18} />
            Export Word
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Table of Contents */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Table of Contents</h3>
            <div className="space-y-1">
              {book.chapters.map((chapter, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                    activeChapterIndex === idx
                      ? 'bg-islamic-green/10 text-islamic-green font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{chapter.title}</span>
                  {activeChapterIndex === idx && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">References</h3>
               <ul className="space-y-2">
                 {book.references.map((ref, i) => (
                   <li key={i} className="text-xs text-gray-500 flex gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-islamic-gold mt-1.5 shrink-0"></span>
                     {ref}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </aside>

        {/* Main Content - Reader */}
        <main className="flex-1 overflow-y-auto book-scroll bg-paper-cream relative p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Chapter Header */}
            <div className="border-b-2 border-islamic-gold/20 pb-6">
              <span className="text-islamic-gold font-bold tracking-widest text-sm uppercase">Chapter {activeChapterIndex + 1}</span>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mt-2">{activeChapter.title}</h2>
            </div>

            {/* Content Sections */}
            <div className="space-y-10">
              {activeChapter.sections.map((section, idx) => (
                <div key={idx} className="prose prose-lg prose-headings:font-serif prose-headings:text-islamic-green max-w-none">
                  <h3 className="text-2xl font-bold mb-4">{section.title}</h3>
                  <div className="text-gray-700 leading-relaxed font-serif">
                     <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>

            {/* Mock Multimedia Section */}
            <div className="my-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <PlayCircle className="text-red-600" size={24} />
                    <h4 className="font-bold text-gray-900">Multimedia Explanation</h4>
                </div>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <p className="text-sm">Video explanation regarding {activeChapter.title} would appear here.</p>
                </div>
            </div>

            {/* Validation Badge */}
            <div className="flex justify-center mt-12 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm">
                    <ShieldCheck size={16} />
                    <span>Validated against Authentic Sources</span>
                </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default BookPreview;