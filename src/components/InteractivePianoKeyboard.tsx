import React from 'react';
import { SheetNote } from '../types/music';

interface InteractivePianoKeyboardProps {
  activeNotes: SheetNote[];
  onKeyClick: (midi: number, pitch: string) => void;
}

interface KeyData {
  midi: number;
  pitch: string;
  isBlack: boolean;
  octave: number;
  noteName: string;
}

// Generate keyboard keys from F1 (MIDI 29) to C6 (MIDI 84), perfectly covering Nuvole Bianche
const NOTES_LIST = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ALL_KEYS: KeyData[] = [];
for (let midi = 28; midi <= 84; midi++) {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = NOTES_LIST[noteIndex];
  const isBlack = noteName.includes('#');

  // Convert sharp notation to flat equivalent matching F minor key signature:
  // C# -> Db, D# -> Eb, F# -> Gb, G# -> Ab, A# -> Bb
  let pitch = `${noteName}${octave}`;
  if (noteName === 'C#') pitch = `Db${octave}`;
  else if (noteName === 'D#') pitch = `Eb${octave}`;
  else if (noteName === 'G#') pitch = `Ab${octave}`;
  else if (noteName === 'A#') pitch = `Bb${octave}`;

  ALL_KEYS.push({
    midi,
    pitch,
    isBlack,
    octave,
    noteName,
  });
}

export const InteractivePianoKeyboard: React.FC<InteractivePianoKeyboardProps> = ({
  activeNotes,
  onKeyClick,
}) => {
  // Map of active note by MIDI
  const activeMap = new Map<number, SheetNote>();
  activeNotes.forEach((n) => {
    activeMap.set(n.midi, n);
  });

  const whiteKeys = ALL_KEYS.filter((k) => !k.isBlack);

  return (
    <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-lg text-stone-100">
      {/* Keyboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-stone-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-sm text-stone-200">Interactive Piano Visualizer</span>
          <span className="text-stone-500 font-mono hidden sm:inline">(F1 – C6 Range)</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">
              RH
            </span>
            <span className="text-blue-300 font-medium">Right Hand (1-5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-white">
              LH
            </span>
            <span className="text-emerald-300 font-medium">Left Hand (1-5)</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-stone-400">Middle C (C4)</span>
          </div>
        </div>
      </div>

      {/* Piano Keyboard Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-700">
        <div className="relative h-36 select-none mx-auto" style={{ width: `${whiteKeys.length * 28}px` }}>
          {/* White Keys */}
          <div className="absolute inset-0 flex">
            {whiteKeys.map((key) => {
              const active = activeMap.get(key.midi);
              const isMiddleC = key.midi === 60;

              return (
                <div
                  key={key.midi}
                  onClick={() => onKeyClick(key.midi, key.pitch)}
                  id={`piano-key-${key.pitch}`}
                  className={`w-7 h-36 border-r border-stone-300 dark:border-stone-800 rounded-b-md cursor-pointer transition-all duration-100 flex flex-col justify-end items-center pb-2 relative group shadow-sm ${
                    active
                      ? active.hand === 'RH'
                        ? 'bg-blue-400 text-white shadow-inner ring-2 ring-blue-500 z-10'
                        : 'bg-emerald-400 text-white shadow-inner ring-2 ring-emerald-500 z-10'
                      : 'bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-600'
                  }`}
                >
                  {/* Finger Number Badge if Active */}
                  {active && (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shadow-md mb-2 ${
                        active.hand === 'RH' ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                      }`}
                    >
                      {active.finger}
                    </div>
                  )}

                  {/* Middle C Indicator */}
                  {isMiddleC && !active && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 mb-1" title="Middle C (C4)" />
                  )}

                  {/* Note Pitch Name */}
                  <span className={`text-[9px] font-mono font-medium ${isMiddleC ? 'font-bold text-amber-600' : ''}`}>
                    {key.pitch}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Black Keys */}
          {ALL_KEYS.filter((k) => k.isBlack).map((blackKey) => {
            // Find preceding white key index
            const whiteIndex = whiteKeys.findIndex((w) => w.midi === blackKey.midi - 1);
            if (whiteIndex === -1) return null;

            const active = activeMap.get(blackKey.midi);
            const leftPx = whiteIndex * 28 + 18;

            return (
              <div
                key={blackKey.midi}
                onClick={() => onKeyClick(blackKey.midi, blackKey.pitch)}
                id={`piano-key-black-${blackKey.pitch}`}
                style={{ left: `${leftPx}px` }}
                className={`absolute top-0 w-4.5 h-22 rounded-b-sm cursor-pointer z-20 transition-all duration-100 flex flex-col justify-end items-center pb-1 shadow-md ${
                  active
                    ? active.hand === 'RH'
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                      : 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                    : 'bg-stone-900 hover:bg-stone-800 active:bg-stone-950 border-x border-b border-black text-stone-300'
                }`}
              >
                {active && (
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm mb-1 ${
                      active.hand === 'RH' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {active.finger}
                  </div>
                )}
                <span className="text-[8px] font-mono leading-none">{blackKey.pitch}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
