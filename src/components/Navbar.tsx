import React from 'react';
import { Music, ExternalLink, Printer, Volume2, VolumeX, Eye, BookOpen, FileDown } from 'lucide-react';
import { downloadChatHistoryMarkdown } from '../utils/downloadChatMarkdown';

interface NavbarProps {
  showNoteNames: boolean;
  setShowNoteNames: (val: boolean | ((prev: boolean) => boolean)) => void;
  showFingerings: boolean;
  setShowFingerings: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenPrint: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  showNoteNames,
  setShowNoteNames,
  showFingerings,
  setShowFingerings,
  isMuted,
  setIsMuted,
  onOpenPrint,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title & Composition Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-stone-100">
                Nuvole Bianche
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                F minor • 12/8
              </span>
            </div>
            <p className="text-xs text-stone-400">
              By <span className="text-stone-300 font-medium">Ludovico Einaudi</span> • Master Sheet & Fingering Guide
            </p>
          </div>
        </div>

        {/* Video Link Badge & Toggles */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href="https://www.youtube.com/watch?v=IH2KrGjKXw0&list=RD7aLCIb4UVSU&index=13"
            target="_blank"
            rel="noopener noreferrer"
            id="youtube-clip-link"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-300 text-xs font-medium transition-all"
            title="Watch original YouTube performance by Jacob's Piano"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Jacob&apos;s Piano Clip</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* Guide button */}
          <button
            onClick={onOpenGuide}
            id="open-guide-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Section</span> Guide
          </button>

          {/* Toggle Note Names */}
          <button
            onClick={() => setShowNoteNames((prev) => !prev)}
            id="toggle-note-names-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showNoteNames
                ? 'bg-blue-900/40 border-blue-600/60 text-blue-300'
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Notes {showNoteNames ? 'On' : 'Off'}</span>
          </button>

          {/* Toggle Fingerings */}
          <button
            onClick={() => setShowFingerings((prev) => !prev)}
            id="toggle-fingerings-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showFingerings
                ? 'bg-emerald-900/40 border-emerald-600/60 text-emerald-300'
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            <span className="font-mono font-bold text-xs">1-5</span>
            <span>Fingers {showFingerings ? 'On' : 'Off'}</span>
          </button>

          {/* Audio Mute */}
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            id="toggle-mute-btn"
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Download Chat Q&A & Guide in Markdown */}
          <button
            onClick={downloadChatHistoryMarkdown}
            id="download-chat-history-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 font-medium text-xs transition"
            title="Download all Chat Q&A questions, answers, and study notes in Markdown (.md)"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Chat Q&A (.md)</span>
            <span className="sm:hidden">.md</span>
          </button>

          {/* Print & PDF Sheet Music */}
          <button
            onClick={onOpenPrint}
            id="print-sheet-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition shadow-sm"
            title="Download PDF Score or Print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF & Print</span>
          </button>
        </div>
      </div>
    </header>
  );
};
