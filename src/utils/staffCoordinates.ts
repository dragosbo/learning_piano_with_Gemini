/**
 * Calculates staff coordinates and ledger lines for treble and bass clef notes.
 * Treble Staff: Top line (F5) = 32, Bottom line (E4) = 64 (5 lines, step = 8px)
 * Bass Staff: Top line (A3) = 112, Bottom line (G2) = 144 (5 lines, step = 8px)
 */
export function getStaffY(pitch: string, clef: 'treble' | 'bass'): { y: number; ledgerLines: number[] } {
  const notePitches = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const regex = /^([A-G])(b|#)?(\d)$/;
  const match = pitch.match(regex);
  if (!match) return { y: 50, ledgerLines: [] };

  const letter = match[1];
  const octave = parseInt(match[3], 10);
  const stepIndex = notePitches.indexOf(letter);
  const diatonicIndex = octave * 7 + stepIndex;

  const ledgerLines: number[] = [];

  if (clef === 'treble') {
    // E4 is line 1 at y = 64. Diatonic index of E4 = 4*7 + 2 = 30.
    const baseE4Index = 4 * 7 + 2; // 30
    const diff = diatonicIndex - baseE4Index;
    const y = 64 - diff * 4;

    // Middle C (C4, index 28) has ledger line at y = 72
    if (diff <= -2) {
      ledgerLines.push(72);
      if (diff <= -4) ledgerLines.push(80);
    }
    // High A5 (index 37, y = 20) has ledger line at y = 24
    if (diff >= 7) {
      ledgerLines.push(24);
      if (diff >= 9) ledgerLines.push(16);
    }

    return { y, ledgerLines };
  } else {
    // Bass staff: G2 is line 1 at y = 144. Diatonic index of G2 = 2*7 + 4 = 18.
    const baseG2Index = 2 * 7 + 4; // 18
    const diff = diatonicIndex - baseG2Index;
    const y = 144 - diff * 4;

    // Middle C (C4, index 28, y = 104)
    if (diff >= 10) {
      ledgerLines.push(104);
    }
    // Low E2 (index 16, y = 152)
    if (diff <= -2) {
      ledgerLines.push(152);
      if (diff <= -4) ledgerLines.push(160);
      if (diff <= -6) ledgerLines.push(168);
      if (diff <= -8) ledgerLines.push(176);
    }

    return { y, ledgerLines };
  }
}
