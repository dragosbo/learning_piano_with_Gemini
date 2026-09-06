/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { PlaybackControls } from './components/PlaybackControls';
import { GrandStaffSheet } from './components/GrandStaffSheet';
import { InteractivePianoKeyboard } from './components/InteractivePianoKeyboard';
import { HandDiagram } from './components/HandDiagram';
import { SectionGuide } from './components/SectionGuide';
import { PrintSheetModal } from './components/PrintSheetModal';
import { MEASURES, SECTIONS } from './data/nuvoleBiancheData';
import { pianoEngine } from './audio/pianoAudio';
import { SheetNote, HandSoloMode } from './types/music';
import { Info, HelpCircle, ArrowRight, Music2 } from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMeasure, setCurrentMeasure] = useState(1);
  const [currentBeat, setCurrentBeat] = useState(0); // 0 to 11
  const [tempoBpm, setTempoBpm] = useState(48); // dotted quarter notes per minute
  const [handMode, setHandMode] = useState<HandSoloMode>('both');
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [loopMode, setLoopMode] = useState<'none' | 'measure' | 'section'>('none');
  const [activeSectionId, setActiveSectionId] = useState('intro');

  // Display toggles
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showFingerings, setShowFingerings] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<'all' | string>('all');

  // Modals & Panels
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Selected note for deep pedagogical inspect
  const [selectedNote, setSelectedNote] = useState<SheetNote | null>(null);

  // Active note IDs on the current beat
  const [activeNoteIds, setActiveNoteIds] = useState<Set<string>>(new Set());

  // References for playback loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentMeasureRef = useRef(currentMeasure);
  currentMeasureRef.current = currentMeasure;

  const currentBeatRef = useRef(currentBeat);
  currentBeatRef.current = currentBeat;

  const tempoRef = useRef(tempoBpm);
  tempoRef.current = tempoBpm;

  const handModeRef = useRef(handMode);
  handModeRef.current = handMode;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const isMetronomeRef = useRef(isMetronomeOn);
  isMetronomeRef.current = isMetronomeOn;

  const loopModeRef = useRef(loopMode);
  loopModeRef.current = loopMode;

  const activeSectionIdRef = useRef(activeSectionId);
  activeSectionIdRef.current = activeSectionId;

  // Active notes derived from active note IDs
  const currentMeasureData = useMemo(() => {
    return MEASURES.find((m) => m.number === currentMeasure) || MEASURES[0];
  }, [currentMeasure]);

  const activeNotesList = useMemo(() => {
    const list: SheetNote[] = [];
    currentMeasureData.rhNotes.forEach((n) => {
      if (activeNoteIds.has(n.id)) list.push(n);
    });
    currentMeasureData.lhNotes.forEach((n) => {
      if (activeNoteIds.has(n.id)) list.push(n);
    });
    return list;
  }, [currentMeasureData, activeNoteIds]);

  // Update active section ID based on current measure
  useEffect(() => {
    const sec = SECTIONS.find(
      (s) => currentMeasure >= s.measures[0] && currentMeasure <= s.measures[1]
    );
    if (sec && sec.id !== activeSectionId) {
      setActiveSectionId(sec.id);
    }
  }, [currentMeasure, activeSectionId]);

  // Handle note click from Sheet
  const handleNoteClick = useCallback((note: SheetNote) => {
    pianoEngine.resume();
    setSelectedNote(note);
    if (!isMutedRef.current) {
      pianoEngine.playNote(note.midi, 1.5, 0.85);
    }
  }, []);

  // Handle key click from Piano Keyboard
  const handleKeyClick = useCallback((midi: number, pitch: string) => {
    pianoEngine.resume();
    if (!isMutedRef.current) {
      pianoEngine.playNote(midi, 1.5, 0.85);
    }

    // Try to find matching note in current measure
    const found =
      currentMeasureData.rhNotes.find((n) => n.midi === midi) ||
      currentMeasureData.lhNotes.find((n) => n.midi === midi);
    if (found) {
      setSelectedNote(found);
    } else {
      setSelectedNote({
        id: `custom-${midi}`,
        pitch,
        midi,
        hand: midi >= 60 ? 'RH' : 'LH',
        finger: 1,
        beat: 0,
        duration: 1,
        fingerReason: `Pitch ${pitch} on 88-key piano`,
        clef: midi >= 60 ? 'treble' : 'bass',
      });
    }
  }, [currentMeasureData]);

  // Playback engine tick
  const stepTick = useCallback(() => {
    if (!isPlayingRef.current) return;

    const measureIndex = currentMeasureRef.current - 1;
    const meas = MEASURES[measureIndex] || MEASURES[0];
    const beat = currentBeatRef.current;

    // Metronome tick
    if (isMetronomeRef.current && !isMutedRef.current) {
      if (beat === 0) {
        pianoEngine.playClick(true);
      } else if (beat === 3 || beat === 6 || beat === 9) {
        pianoEngine.playClick(false);
      }
    }

    // Find notes at current beat
    const newActiveIds = new Set<string>();
    const eighthDurationSec = 20 / tempoRef.current;

    // Right Hand notes
    if (handModeRef.current !== 'lh') {
      meas.rhNotes.forEach((note) => {
        if (note.beat === beat) {
          newActiveIds.add(note.id);
          if (!isMutedRef.current) {
            pianoEngine.playNote(
              note.midi,
              note.duration * eighthDurationSec,
              meas.dynamics === 'ff' ? 0.95 : meas.dynamics === 'f' ? 0.85 : meas.dynamics === 'mf' ? 0.75 : 0.65
            );
          }
        }
      });
    }

    // Left Hand notes
    if (handModeRef.current !== 'rh') {
      meas.lhNotes.forEach((note) => {
        if (note.beat === beat) {
          newActiveIds.add(note.id);
          if (!isMutedRef.current) {
            pianoEngine.playNote(
              note.midi,
              note.duration * eighthDurationSec * 1.5,
              meas.dynamics === 'ff' ? 0.85 : meas.dynamics === 'f' ? 0.75 : 0.55
            );
          }
        }
      });
    }

    setActiveNoteIds(newActiveIds);

    // Advance beat or measure
    let nextBeat = beat + 1;
    let nextMeasure = currentMeasureRef.current;

    if (nextBeat >= 12) {
      nextBeat = 0;

      // Handle Loop Modes
      if (loopModeRef.current === 'measure') {
        // Stay on current measure
      } else if (loopModeRef.current === 'section') {
        const currentSec = SECTIONS.find((s) => s.id === activeSectionIdRef.current);
        if (currentSec && nextMeasure >= currentSec.measures[1]) {
          nextMeasure = currentSec.measures[0];
        } else {
          nextMeasure = Math.min(20, nextMeasure + 1);
        }
      } else {
        // Normal sequential play
        if (nextMeasure >= 20) {
          nextMeasure = 1;
          setIsPlaying(false);
          return;
        } else {
          nextMeasure += 1;
        }
      }
    }

    setCurrentBeat(nextBeat);
    setCurrentMeasure(nextMeasure);
  }, []);

  // Main playback timer
  useEffect(() => {
    if (!isPlaying) {
      setActiveNoteIds(new Set());
      return;
    }

    pianoEngine.resume();

    // In 12/8 time: 1 dotted quarter = 3 eighth notes.
    // Interval per eighth note in ms = (60,000 / (BPM * 3)) = 20,000 / BPM
    const intervalMs = 20000 / tempoBpm;
    const timer = setInterval(stepTick, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, tempoBpm, stepTick]);

  // Keyboard shortcut: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentMeasure((prev) => Math.min(20, prev + 1));
        setCurrentBeat(0);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentMeasure((prev) => Math.max(1, prev - 1));
        setCurrentBeat(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTogglePlay = () => {
    pianoEngine.resume();
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentMeasure(1);
    setCurrentBeat(0);
    setActiveNoteIds(new Set());
  };

  const handleSelectMeasure = (measNum: number) => {
    setCurrentMeasure(measNum);
    setCurrentBeat(0);
    setActiveNoteIds(new Set());
  };

  const handleSelectSection = (secId: string) => {
    const sec = SECTIONS.find((s) => s.id === secId);
    if (sec) {
      setActiveSectionId(secId);
      setCurrentMeasure(sec.measures[0]);
      setCurrentBeat(0);
      setActiveNoteIds(new Set());
    }
  };

  const handleCycleLoopMode = () => {
    setLoopMode((prev) => (prev === 'none' ? 'measure' : prev === 'measure' ? 'section' : 'none'));
  };

  // Measures filtered for the sheet view
  const visibleMeasures = useMemo(() => {
    if (selectedSectionFilter === 'all') return MEASURES;
    const sec = SECTIONS.find((s) => s.id === selectedSectionFilter);
    if (!sec) return MEASURES;
    return MEASURES.filter((m) => m.number >= sec.measures[0] && m.number <= sec.measures[1]);
  }, [selectedSectionFilter]);

  return (
    <div className="min-h-screen bg-[#141210] text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950">
      {/* Top Sticky Navbar */}
      <Navbar
        showNoteNames={showNoteNames}
        setShowNoteNames={setShowNoteNames}
        showFingerings={showFingerings}
        setShowFingerings={setShowFingerings}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenGuide={() => setIsGuideOpen((prev) => !prev)}
      />

      {/* Playback Controls & Master Scrubber */}
      <PlaybackControls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        currentMeasure={currentMeasure}
        onSelectMeasure={handleSelectMeasure}
        tempoBpm={tempoBpm}
        onChangeTempo={setTempoBpm}
        handMode={handMode}
        onSetHandMode={setHandMode}
        isMetronomeOn={isMetronomeOn}
        onToggleMetronome={() => setIsMetronomeOn((prev) => !prev)}
        loopMode={loopMode}
        onCycleLoopMode={handleCycleLoopMode}
        activeSectionId={activeSectionId}
        onSelectSection={handleSelectSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Composition Summary & Quick Context Banner */}
        <div className="bg-stone-900/70 border border-stone-800/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Jacob&apos;s Piano Performance Analysis
              </span>
              <span className="text-xs text-stone-400">Ludovico Einaudi (Una Mattina, 2004)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-100">
              Interactive Sheet Music & Section Fingering Architecture
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Featuring complete grand staff notation in 12/8 time (F minor), synchronized audio
              synthesis, note-by-note fingering (Right Hand 1–5 / Left Hand 1–5), wrist rotation guides, and
              hand isolation for practice.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGuideOpen((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition flex items-center gap-1.5"
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span>{isGuideOpen ? 'Hide Masterclass' : 'Read Masterclass'}</span>
            </button>
          </div>
        </div>

        {/* Section Masterclass Accordion (if open or active) */}
        {isGuideOpen && (
          <SectionGuide
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
            onJumpToMeasure={handleSelectMeasure}
          />
        )}

        {/* Live Interactive Tools Grid: Piano Keyboard + Hand Diagram */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Piano Keyboard Visualizer (2 Cols on XL) */}
          <div className="xl:col-span-2">
            <InteractivePianoKeyboard
              activeNotes={activeNotesList}
              onKeyClick={handleKeyClick}
            />
          </div>

          {/* Anatomical Hand & Finger Architecture (1 Col on XL) */}
          <div className="xl:col-span-1">
            <HandDiagram activeNotes={activeNotesList} selectedNote={selectedNote} />
          </div>
        </div>

        {/* Section Filter Pills for Sheet Music */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-bold text-base text-stone-200">Grand Staff Sheet Music</h3>
            <span className="text-xs text-stone-400 font-mono">
              ({visibleMeasures.length} Measures Displayed)
            </span>
          </div>

          {/* Filter by section */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-stone-500 mr-1">View:</span>
            <button
              onClick={() => setSelectedSectionFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedSectionFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
            >
              All 20 Measures
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionFilter(sec.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                  selectedSectionFilter === sec.id
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {sec.name.split(':')[0]} (m.{sec.measures[0]}–{sec.measures[1]})
              </button>
            ))}
          </div>
        </div>

        {/* The Grand Staff Sheet Music Renderer */}
        <GrandStaffSheet
          measures={visibleMeasures}
          currentMeasure={currentMeasure}
          currentBeat={currentBeat}
          activeNoteIds={activeNoteIds}
          showNoteNames={showNoteNames}
          showFingerings={showFingerings}
          onSelectMeasure={handleSelectMeasure}
          onNoteClick={handleNoteClick}
          handMode={handMode}
        />

        {/* Section Fingering Quick Reference Footnotes */}
        <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 text-xs text-stone-400 space-y-3">
          <div className="flex items-center gap-2 text-stone-200 font-semibold text-sm">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Ludovico Einaudi Fingering Rules & Conventions Summary</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed">
            <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <span className="font-bold text-emerald-400 block mb-1">
                1. Left-Hand 5-2-1-2-1-2 Wave Rule
              </span>
              Pinky (5) drops with gentle arm weight onto the deep root note (F2, D♭2, A♭1, E♭2). Fingers 2 and 1 swing with subtle wrist rotation rather than finger muscle tension. Keep fingers close to the key surface.
            </div>
            <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <span className="font-bold text-blue-400 block mb-1">
                2. Right-Hand Phrasing & Voicing
              </span>
              In Theme A (Bars 5-8), Thumb (1) anchors lower melody intervals while Pinky (5) reaches high E♭5 and D♭5. During the Fortissimo Climax (Bars 13-16), apply firmer weight to fingers 4 and 5 so the highest soprano notes cut through the chord accompaniment.
            </div>
            <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <span className="font-bold text-amber-400 block mb-1">
                3. Syncopated Pedaling Technique
              </span>
              Change the damper pedal right after Beat 1 and Beat 7 (or whenever the underlying harmony shifts). Do not hold the pedal continuously through chord transitions to avoid muddiness in the lower octave resonance.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 text-stone-500 text-xs py-5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Nuvole Bianche by Ludovico Einaudi • Dedicated to piano students learning with Jacob&apos;s Piano YouTube tutorial
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>F minor (4 Flats)</span>
            <span>•</span>
            <span>12/8 Meter</span>
            <span>•</span>
            <button
              onClick={() => setIsPrintOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Print / Save PDF <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>

      {/* Print / Save as PDF Modal */}
      <PrintSheetModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        showNoteNames={showNoteNames}
        showFingerings={showFingerings}
      />
    </div>
  );
}
