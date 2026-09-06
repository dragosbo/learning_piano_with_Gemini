import React from 'react';
import { Measure, SheetNote } from '../types/music';
import { getStaffY } from '../utils/staffCoordinates';

interface GrandStaffSheetProps {
  measures: Measure[];
  currentMeasure: number;
  currentBeat: number;
  activeNoteIds: Set<string>;
  showNoteNames: boolean;
  showFingerings: boolean;
  onSelectMeasure: (measureNum: number) => void;
  onNoteClick: (note: SheetNote) => void;
  handMode: 'both' | 'rh' | 'lh';
}

export const GrandStaffSheet: React.FC<GrandStaffSheetProps> = ({
  measures,
  currentMeasure,
  currentBeat,
  activeNoteIds,
  showNoteNames,
  showFingerings,
  onSelectMeasure,
  onNoteClick,
  handMode,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {measures.map((measure) => {
          const isCurrent = measure.number === currentMeasure;
          const svgWidth = 480;
          const startX = 64;
          const usableWidth = svgWidth - startX - 20;

          return (
            <div
              key={measure.number}
              id={`measure-card-${measure.number}`}
              onClick={() => onSelectMeasure(measure.number)}
              className={`rounded-2xl transition-all duration-200 border cursor-pointer overflow-hidden relative shadow-sm ${
                isCurrent
                  ? 'bg-amber-50/90 dark:bg-stone-900/90 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-stone-50/95 dark:bg-stone-900/70 border-stone-200 dark:border-stone-800 hover:border-amber-400/60'
              }`}
            >
              {/* Measure Header Banner */}
              <div className="px-4 py-2.5 bg-stone-100 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900 text-xs font-bold font-mono flex items-center justify-center">
                    {measure.number}
                  </span>
                  <span className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                    {measure.chord}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    ({measure.chordRoman})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-serif italic">
                    {measure.dynamics}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-sans hidden sm:inline">
                    {measure.tempoText}
                  </span>
                </div>
              </div>

              {/* Music Sheet Canvas SVG */}
              <div className="p-3 sm:p-4 overflow-x-auto bg-[#FFFDF9] dark:bg-[#1A1816]">
                <svg
                  viewBox={`0 0 ${svgWidth} 190`}
                  className="w-full h-auto select-none"
                  style={{ minWidth: '400px' }}
                >
                  {/* Background Texture & Clef Bracket */}
                  <line x1="8" y1="32" x2="8" y2="144" stroke="#44403C" strokeWidth="2.5" />
                  <path d="M 8 32 C 3 32, 2 88, 2 88 C 2 88, 3 144, 8 144" fill="none" stroke="#44403C" strokeWidth="2" />

                  {/* Treble Clef Staff Lines (5 lines) */}
                  {[32, 40, 48, 56, 64].map((y) => (
                    <line key={`treble-${y}`} x1="8" y1={y} x2={svgWidth - 6} y2={y} stroke="#78716C" strokeWidth="1" />
                  ))}

                  {/* Bass Clef Staff Lines (5 lines) */}
                  {[112, 120, 128, 136, 144].map((y) => (
                    <line key={`bass-${y}`} x1="8" y1={y} x2={svgWidth - 6} y2={y} stroke="#78716C" strokeWidth="1" />
                  ))}

                  {/* End Bar Line */}
                  <line x1={svgWidth - 6} y1="32" x2={svgWidth - 6} y2="144" stroke="#44403C" strokeWidth="2" />

                  {/* Clef Glyphs */}
                  {/* Treble Clef 𝄞 */}
                  <text x="14" y="58" fontSize="32" fontFamily="serif" fill="#292524" className="select-none">
                    𝄞
                  </text>
                  {/* Bass Clef 𝄢 */}
                  <text x="14" y="136" fontSize="26" fontFamily="serif" fill="#292524" className="select-none">
                    𝄢
                  </text>

                  {/* Key Signature: 4 Flats (Bb, Eb, Ab, Db) */}
                  {/* Treble Flats */}
                  <text x="36" y="50" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text> {/* Bb */}
                  <text x="42" y="38" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text> {/* Eb */}
                  <text x="48" y="54" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text> {/* Ab */}
                  <text x="54" y="42" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text> {/* Db */}

                  {/* Bass Flats */}
                  <text x="36" y="130" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                  <text x="42" y="118" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                  <text x="48" y="134" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                  <text x="54" y="122" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>

                  {/* Time Signature 12/8 on measure 1 or first measures */}
                  {measure.number === 1 && (
                    <>
                      <text x="63" y="46" fontSize="12" fontWeight="bold" fontFamily="sans-serif" fill="#292524">12</text>
                      <text x="65" y="60" fontSize="12" fontWeight="bold" fontFamily="sans-serif" fill="#292524">8</text>
                      <text x="63" y="126" fontSize="12" fontWeight="bold" fontFamily="sans-serif" fill="#292524">12</text>
                      <text x="65" y="140" fontSize="12" fontWeight="bold" fontFamily="sans-serif" fill="#292524">8</text>
                    </>
                  )}

                  {/* Active Playhead Cursor Line */}
                  {isCurrent && (
                    <line
                      x1={startX + (currentBeat / 12) * usableWidth}
                      y1="24"
                      x2={startX + (currentBeat / 12) * usableWidth}
                      y2="152"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      opacity="0.85"
                    />
                  )}

                  {/* LEFT HAND NOTES (Bass Clef) */}
                  {handMode !== 'rh' &&
                    measure.lhNotes.map((note) => {
                      const x = startX + (note.beat / 12) * usableWidth + 12;
                      const { y, ledgerLines } = getStaffY(note.pitch, 'bass');
                      const isActive = activeNoteIds.has(note.id);

                      return (
                        <g
                          key={note.id}
                          className="cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNoteClick(note);
                          }}
                        >
                          {/* Ledger Lines */}
                          {ledgerLines.map((ly) => (
                            <line
                              key={`lh-ledger-${note.id}-${ly}`}
                              x1={x - 8}
                              y1={ly}
                              x2={x + 14}
                              y2={ly}
                              stroke="#57534E"
                              strokeWidth="1.2"
                            />
                          ))}

                          {/* Active Note Aura */}
                          {isActive && (
                            <circle cx={x + 3} cy={y} r="12" fill="#10B981" opacity="0.35" className="animate-ping" />
                          )}

                          {/* Notehead */}
                          <ellipse
                            cx={x + 3}
                            cy={y}
                            rx="5"
                            ry="3.8"
                            transform={`rotate(-25 ${x + 3} ${y})`}
                            fill={isActive ? '#059669' : '#1C1917'}
                            stroke={isActive ? '#10B981' : 'none'}
                            strokeWidth={isActive ? '1.5' : '0'}
                          />

                          {/* Upward Stem */}
                          <line x1={x + 7.5} y1={y} x2={x + 7.5} y2={y - 20} stroke="#1C1917" strokeWidth="1.2" />

                          {/* Finger Badge (Emerald for Left Hand) */}
                          {showFingerings && (
                            <g transform={`translate(${x - 4}, ${y + 9})`}>
                              <rect
                                x="0"
                                y="0"
                                width="14"
                                height="14"
                                rx="3.5"
                                fill={isActive ? '#059669' : '#ECFDF5'}
                                stroke={isActive ? '#10B981' : '#059669'}
                                strokeWidth="1"
                              />
                              <text
                                x="7"
                                y="10.5"
                                textAnchor="middle"
                                fontSize="9.5"
                                fontWeight="bold"
                                fill={isActive ? '#FFFFFF' : '#047857'}
                                fontFamily="monospace"
                              >
                                {note.finger}
                              </text>
                            </g>
                          )}

                          {/* Note Name Tag */}
                          {showNoteNames && (
                            <text
                              x={x + 3}
                              y={y - 7}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="600"
                              fill="#047857"
                              fontFamily="sans-serif"
                            >
                              {note.pitch}
                            </text>
                          )}
                        </g>
                      );
                    })}

                  {/* RIGHT HAND NOTES (Treble Clef) */}
                  {handMode !== 'lh' &&
                    measure.rhNotes.map((note) => {
                      const x = startX + (note.beat / 12) * usableWidth + 12;
                      const { y, ledgerLines } = getStaffY(note.pitch, 'treble');
                      const isActive = activeNoteIds.has(note.id);

                      return (
                        <g
                          key={note.id}
                          className="cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNoteClick(note);
                          }}
                        >
                          {/* Ledger lines */}
                          {ledgerLines.map((ly) => (
                            <line
                              key={`rh-ledger-${note.id}-${ly}`}
                              x1={x - 8}
                              y1={ly}
                              x2={x + 14}
                              y2={ly}
                              stroke="#57534E"
                              strokeWidth="1.2"
                            />
                          ))}

                          {/* Active Note Aura */}
                          {isActive && (
                            <circle cx={x + 3} cy={y} r="12" fill="#3B82F6" opacity="0.35" className="animate-ping" />
                          )}

                          {/* Notehead */}
                          <ellipse
                            cx={x + 3}
                            cy={y}
                            rx="5"
                            ry="3.8"
                            transform={`rotate(-25 ${x + 3} ${y})`}
                            fill={isActive ? '#2563EB' : '#1C1917'}
                            stroke={isActive ? '#60A5FA' : 'none'}
                            strokeWidth={isActive ? '1.5' : '0'}
                          />

                          {/* Downward/Upward Stem */}
                          <line x1={x + 7.5} y1={y} x2={x + 7.5} y2={y - 20} stroke="#1C1917" strokeWidth="1.2" />

                          {/* Finger Badge (Indigo/Blue for Right Hand) */}
                          {showFingerings && (
                            <g transform={`translate(${x - 4}, ${y - 24})`}>
                              <rect
                                x="0"
                                y="0"
                                width="14"
                                height="14"
                                rx="3.5"
                                fill={isActive ? '#2563EB' : '#EFF6FF'}
                                stroke={isActive ? '#3B82F6' : '#2563EB'}
                                strokeWidth="1"
                              />
                              <text
                                x="7"
                                y="10.5"
                                textAnchor="middle"
                                fontSize="9.5"
                                fontWeight="bold"
                                fill={isActive ? '#FFFFFF' : '#1D4ED8'}
                                fontFamily="monospace"
                              >
                                {note.finger}
                              </text>
                            </g>
                          )}

                          {/* Note Name Tag */}
                          {showNoteNames && (
                            <text
                              x={x + 3}
                              y={y + 13}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="600"
                              fill="#1D4ED8"
                              fontFamily="sans-serif"
                            >
                              {note.pitch}
                            </text>
                          )}
                        </g>
                      );
                    })}

                  {/* Pedal Marking Line */}
                  <g transform="translate(10, 178)">
                    <text x="0" y="0" fontSize="10" fontStyle="italic" fontFamily="serif" fill="#78716C">
                      Ped.
                    </text>
                    <line x1="28" y1="-3" x2={svgWidth - 28} y2="-3" stroke="#A8A29E" strokeWidth="1" />
                    <polyline points={`${svgWidth - 28},-3 ${svgWidth - 24},-8 ${svgWidth - 20},-3`} fill="none" stroke="#A8A29E" strokeWidth="1" />
                  </g>
                </svg>
              </div>

              {/* Measure Technique & Fingering Advice Footer */}
              <div className="px-3.5 py-2 bg-stone-100/90 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800/80 text-xs flex items-center justify-between gap-2">
                <p className="text-stone-600 dark:text-stone-400 leading-snug">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 mr-1">Fingering Tip:</span>
                  {measure.techniqueTip}
                </p>
                <span className="text-[10px] text-stone-400 font-mono whitespace-nowrap hidden sm:inline">
                  {measure.pedalText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
