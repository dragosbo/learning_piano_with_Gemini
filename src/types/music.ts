export type Hand = 'LH' | 'RH';
export type Finger = 1 | 2 | 3 | 4 | 5;

export interface SheetNote {
  id: string;
  pitch: string; // e.g., "F2", "C3", "Ab3", "C5", "Db5"
  midi: number; // MIDI note number, e.g., 41 for F2
  hand: Hand;
  finger: Finger;
  fingerAlt?: Finger; // Alternative fingering option (e.g. for small/large hands)
  fingerReason: string; // Why this finger is recommended
  beat: number; // 0 to 11 in 12/8 time (eighth note subdivision)
  duration: number; // duration in eighth notes (e.g., 1, 2, 3 = dotted quarter, 6 = dotted half, 12 = full measure)
  isTied?: boolean;
  accidental?: 'b' | '#' | 'n';
  clef: 'treble' | 'bass';
  staffY?: number; // Calculated vertical position on staff
  ledgerLines?: number[]; // Ledger line offsets if note extends above/below staff
}

export interface Measure {
  number: number;
  chord: string;
  chordRoman: string;
  sectionId: string;
  sectionName: string;
  dynamics: 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff';
  tempoText: string;
  pedalText: string;
  rhNotes: SheetNote[];
  lhNotes: SheetNote[];
  techniqueTip: string;
}

export interface SectionAnalysis {
  id: string;
  name: string;
  subtitle: string;
  measures: [number, number]; // [start, end]
  key: string;
  timeSignature: string;
  tempoBpm: number;
  mood: string;
  chordProgression: string;
  fingeringHighlights: {
    hand: Hand;
    title: string;
    description: string;
    pattern: string;
  }[];
  pedalingGuide: string;
  practiceStrategy: string;
}

export type HandSoloMode = 'both' | 'rh' | 'lh';
