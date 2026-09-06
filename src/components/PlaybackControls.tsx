import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Gauge,
  Sliders,
} from 'lucide-react';
import { HandSoloMode } from '../types/music';
import { SECTIONS } from '../data/nuvoleBiancheData';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  currentMeasure: number;
  onSelectMeasure: (meas: number) => void;
  tempoBpm: number;
  onChangeTempo: (bpm: number) => void;
  handMode: HandSoloMode;
  onSetHandMode: (mode: HandSoloMode) => void;
  isMetronomeOn: boolean;
  onToggleMetronome: () => void;
  loopMode: 'none' | 'measure' | 'section';
  onCycleLoopMode: () => void;
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  currentMeasure,
  onSelectMeasure,
  tempoBpm,
  onChangeTempo,
  handMode,
  onSetHandMode,
  isMetronomeOn,
  onToggleMetronome,
  loopMode,
  onCycleLoopMode,
  activeSectionId,
  onSelectSection,
}) => {
  return (
    <div className="bg-stone-900 border-b border-stone-800 text-stone-200 py-3 px-4 sm:px-6 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top row: Section Jump Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-stone-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" /> Sections:
          </span>
          {SECTIONS.map((sec) => {
            const isActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                id={`section-tab-${sec.id}`}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/50'
                }`}
              >
                <span>{sec.name.split(':')[1] || sec.name}</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    isActive ? 'bg-amber-600/50 text-stone-950 font-bold' : 'bg-stone-700 text-stone-400'
                  }`}
                >
                  m.{sec.measures[0]}–{sec.measures[1]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom row: Main Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-800/80">
          {/* Play, Pause, Skips */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              id="rewind-btn"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              title="Return to Measure 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectMeasure(Math.max(1, currentMeasure - 1))}
              id="prev-measure-btn"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              title="Previous Measure"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              id="play-pause-btn"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center gap-2 transition shadow-md shadow-amber-500/20 active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-stone-950" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-stone-950" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSelectMeasure(Math.min(20, currentMeasure + 1))}
              id="next-measure-btn"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              title="Next Measure"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Current Measure Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800/90 border border-stone-700 rounded-lg text-xs font-mono">
              <span className="text-stone-400">Bar</span>
              <span className="text-amber-400 font-bold text-sm">{currentMeasure}</span>
              <span className="text-stone-500">/ 20</span>
            </div>
          </div>

          {/* Hands Practice Isolation */}
          <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-xl border border-stone-800 text-xs">
            <span className="text-[11px] text-stone-400 px-2 font-medium">Practice:</span>
            <button
              onClick={() => onSetHandMode('both')}
              id="hand-mode-both"
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                handMode === 'both'
                  ? 'bg-stone-800 text-white shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Both Hands
            </button>
            <button
              onClick={() => onSetHandMode('rh')}
              id="hand-mode-rh"
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                handMode === 'rh'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-400 hover:text-blue-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Right Hand (RH)
            </button>
            <button
              onClick={() => onSetHandMode('lh')}
              id="hand-mode-lh"
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                handMode === 'lh'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Left Hand (LH)
            </button>
          </div>

          {/* Tempo & Metronome & Loop */}
          <div className="flex items-center gap-3">
            {/* Loop Mode */}
            <button
              onClick={onCycleLoopMode}
              id="loop-mode-btn"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                loopMode !== 'none'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
              title="Cycle loop: Off -> Current Measure -> Current Section"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>
                {loopMode === 'none' ? 'Loop Off' : loopMode === 'measure' ? 'Loop Bar' : 'Loop Section'}
              </span>
            </button>

            {/* Metronome */}
            <button
              onClick={onToggleMetronome}
              id="metronome-btn"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isMetronomeOn
                  ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
              title="Toggle Metronome Clicks"
            >
              Metronome {isMetronomeOn ? 'On' : 'Off'}
            </button>

            {/* Tempo Slider */}
            <div className="flex items-center gap-2 bg-stone-950/80 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
              <Gauge className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono text-stone-300">{tempoBpm} BPM</span>
              <input
                type="range"
                min="32"
                max="68"
                step="2"
                value={tempoBpm}
                onChange={(e) => onChangeTempo(Number(e.target.value))}
                id="tempo-slider"
                className="w-20 sm:w-24 accent-amber-500 cursor-pointer"
                title="Adjust playback tempo (dotted quarter notes per minute)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
