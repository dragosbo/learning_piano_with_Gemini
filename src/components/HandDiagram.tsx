import React from 'react';
import { SheetNote, Hand, Finger } from '../types/music';

interface HandDiagramProps {
  activeNotes: SheetNote[];
  selectedNote?: SheetNote | null;
}

const FINGER_NAMES: Record<Finger, string> = {
  1: 'Thumb (Pollex)',
  2: 'Index Finger',
  3: 'Middle Finger',
  4: 'Ring Finger',
  5: 'Pinky (Little)',
};

export const HandDiagram: React.FC<HandDiagramProps> = ({ activeNotes, selectedNote }) => {
  // Find currently active fingers for LH and RH
  const activeLHFinger = activeNotes.find((n) => n.hand === 'LH')?.finger || (selectedNote?.hand === 'LH' ? selectedNote.finger : null);
  const activeRHFinger = activeNotes.find((n) => n.hand === 'RH')?.finger || (selectedNote?.hand === 'RH' ? selectedNote.finger : null);

  const activeLHNote = activeNotes.find((n) => n.hand === 'LH') || (selectedNote?.hand === 'LH' ? selectedNote : null);
  const activeRHNote = activeNotes.find((n) => n.hand === 'RH') || (selectedNote?.hand === 'RH' ? selectedNote : null);

  const renderHand = (hand: Hand, activeFinger: Finger | null, activeNote: SheetNote | null) => {
    const isRight = hand === 'RH';
    const accentColor = isRight ? '#3B82F6' : '#10B981';
    const activeFill = isRight ? '#2563EB' : '#059669';

    // SVG coordinates for hand outline and fingers (viewBox 0 0 200 220)
    // For Left hand: Pinky (5) on left, Thumb (1) on right
    // For Right hand: Thumb (1) on left, Pinky (5) on right
    const fingerPositions: Record<Finger, { cx: number; cy: number; labelX: number; labelY: number }> = isRight
      ? {
          1: { cx: 48, cy: 120, labelX: 48, labelY: 145 }, // Thumb (left on palm)
          2: { cx: 78, cy: 50, labelX: 78, labelY: 30 },  // Index
          3: { cx: 104, cy: 35, labelX: 104, labelY: 15 }, // Middle (tallest)
          4: { cx: 130, cy: 50, labelX: 130, labelY: 30 }, // Ring
          5: { cx: 156, cy: 80, labelX: 156, labelY: 60 }, // Pinky (right on palm)
        }
      : {
          5: { cx: 44, cy: 80, labelX: 44, labelY: 60 },   // Pinky (left on LH palm)
          4: { cx: 70, cy: 50, labelX: 70, labelY: 30 },   // Ring
          3: { cx: 96, cy: 35, labelX: 96, labelY: 15 },   // Middle (tallest)
          2: { cx: 122, cy: 50, labelX: 122, labelY: 30 }, // Index
          1: { cx: 152, cy: 120, labelX: 152, labelY: 145 }, // Thumb (right on LH palm)
        };

    return (
      <div className="flex-1 bg-stone-900/90 rounded-xl p-4 border border-stone-800 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isRight ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
          }`}>
            {isRight ? 'Right Hand (RH)' : 'Left Hand (LH)'}
          </span>
          <span className="text-[11px] text-stone-400 font-mono">
            {isRight ? 'Melody & Chords' : 'Arpeggio & Bass'}
          </span>
        </div>

        {/* Anatomical Hand SVG */}
        <div className="relative w-48 h-48 my-1">
          <svg viewBox="0 0 200 200" className="w-full h-full select-none">
            {/* Palm Shape */}
            <path
              d={
                isRight
                  ? 'M 60 170 C 50 130, 40 120, 48 110 C 55 100, 68 85, 75 75 C 80 75, 95 65, 104 65 C 115 65, 128 75, 132 80 C 145 90, 160 100, 160 120 C 160 150, 140 185, 100 185 C 80 185, 65 180, 60 170 Z'
                  : 'M 140 170 C 150 130, 160 120, 152 110 C 145 100, 132 85, 125 75 C 120 75, 105 65, 96 65 C 85 65, 72 75, 68 80 C 55 90, 40 100, 40 120 C 40 150, 60 185, 100 185 C 120 185, 135 180, 140 170 Z'
              }
              fill="#292524"
              stroke="#57534E"
              strokeWidth="2"
            />

            {/* Finger Nodes */}
            {([1, 2, 3, 4, 5] as Finger[]).map((finger) => {
              const pos = fingerPositions[finger];
              const isActive = activeFinger === finger;

              return (
                <g key={finger} className="cursor-pointer transition-all">
                  {/* Active Aura Pulse */}
                  {isActive && (
                    <circle cx={pos.cx} cy={pos.cy} r="18" fill={accentColor} opacity="0.3" className="animate-ping" />
                  )}

                  {/* Finger Tip Circle */}
                  <circle
                    cx={pos.cx}
                    cy={pos.cy}
                    r={isActive ? '13' : '10'}
                    fill={isActive ? activeFill : '#44403C'}
                    stroke={isActive ? accentColor : '#78716C'}
                    strokeWidth={isActive ? '2.5' : '1.5'}
                    className="transition-all duration-200"
                  />

                  {/* Finger Number */}
                  <text
                    x={pos.cx}
                    y={pos.cy + 4}
                    textAnchor="middle"
                    fontSize={isActive ? '12' : '10'}
                    fontWeight="bold"
                    fill={isActive ? '#FFFFFF' : '#D6D3D1'}
                    fontFamily="monospace"
                  >
                    {finger}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Current Active Finger Details & Rationale */}
        <div className="w-full bg-stone-950/70 p-2.5 rounded-lg border border-stone-800 text-xs min-h-[72px] flex flex-col justify-center">
          {activeFinger && activeNote ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isRight ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                  Finger {activeFinger} – {FINGER_NAMES[activeFinger]}
                </span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-300 font-bold">
                  {activeNote.pitch}
                </span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                {activeNote.fingerReason}
              </p>
            </div>
          ) : (
            <p className="text-stone-500 text-center italic text-[11px]">
              Play audio or click any note to inspect its finger placement
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 text-stone-100 shadow-md">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800 text-xs">
        <h3 className="font-serif font-bold text-sm text-stone-200">
          Hand & Finger Architecture
        </h3>
        <span className="text-stone-400 text-[11px]">Standard Classical Fingering (1 = Thumb ... 5 = Pinky)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderHand('LH', activeLHFinger, activeLHNote)}
        {renderHand('RH', activeRHFinger, activeRHNote)}
      </div>
    </div>
  );
};
