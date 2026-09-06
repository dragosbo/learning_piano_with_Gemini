import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  ExternalLink,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  FileText,
  SlidersHorizontal,
  FileDown,
} from 'lucide-react';
import { MEASURES } from '../data/nuvoleBiancheData';
import { exportElementToPdf, triggerBrowserPrint } from '../utils/pdfExport';
import { getStaffY } from '../utils/staffCoordinates';
import { downloadChatHistoryMarkdown } from '../utils/downloadChatMarkdown';

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  showNoteNames: boolean;
  showFingerings: boolean;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  isOpen,
  onClose,
  showNoteNames: initialShowNoteNames,
  showFingerings: initialShowFingerings,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [printErrorNotice, setPrintErrorNotice] = useState<string | null>(null);

  // Print customization toggles
  const [includeGrandStaff, setIncludeGrandStaff] = useState(true);
  const [showNoteNames, setShowNoteNames] = useState(initialShowNoteNames);
  const [showFingerings, setShowFingerings] = useState(initialShowFingerings);

  const printableAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Detect if running inside iframe
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Direct PDF Download (Bypasses iframe sandbox restrictions completely)
  const handleDownloadPdf = async () => {
    if (!printableAreaRef.current) return;
    try {
      setIsExportingPdf(true);
      setExportSuccess(false);
      setPrintErrorNotice(null);
      await exportElementToPdf(
        printableAreaRef.current,
        'Nuvole_Bianche_Ludovico_Einaudi_Score.pdf',
        (status) => setExportStatus(status)
      );
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPrintErrorNotice(`PDF Generation error: ${msg}. Try opening in a new tab.`);
    } finally {
      setIsExportingPdf(false);
      setExportStatus('');
    }
  };

  // Browser print fallback
  const handleBrowserPrint = () => {
    setPrintErrorNotice(null);
    const result = triggerBrowserPrint();
    if (!result.success || isInIframe) {
      setPrintErrorNotice(
        'Embedded preview iframes restrict browser print dialogs. Please click "Download PDF (.pdf)" above to save your printable file directly, or use "Open App in New Tab".'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:static print:bg-white">
      <div className="bg-white text-stone-900 rounded-2xl w-full max-w-5xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col border border-stone-200 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Toolbar (hidden during native print) */}
        <div className="px-5 py-3.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 print:hidden shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                Print & PDF Score Generator
              </h3>
            </div>
            <p className="text-xs text-stone-500">
              Ludovico Einaudi: Nuvole Bianche (Complete 20-bar pedagogical score)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              id="download-pdf-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
              title="Generates a downloadable multi-page PDF directly on your computer"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{exportStatus || 'Generating PDF...'}</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Downloaded PDF!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Document (.pdf)</span>
                </>
              )}
            </button>

            {/* Download Chat Q&A and Guide in Markdown */}
            <button
              onClick={downloadChatHistoryMarkdown}
              id="download-chat-guide-btn"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-xs transition"
              title="Download all questions, answers, and piano tutorial notes as a Markdown (.md) file"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-700" />
              <span>Chat Q&A (.md)</span>
            </button>

            {/* System Print Button */}
            <button
              onClick={handleBrowserPrint}
              id="browser-print-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium text-xs transition shadow-xs"
              title="Triggers your browser system print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>System Print</span>
            </button>

            {/* Open in New Tab (For full native browser print & escape iframe restrictions) */}
            {isInIframe && (
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                id="open-in-new-tab-link"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-xs transition"
                title="Open app in a new tab without iframe sandbox constraints"
              >
                <span>New Tab</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              id="close-print-modal-btn"
              className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 transition"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar Sub-Bar: Customization Toggles & Status Messages */}
        <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              Print Options:
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900 select-none">
              <input
                type="checkbox"
                checked={includeGrandStaff}
                onChange={(e) => setIncludeGrandStaff(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Full Music Staff SVG</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900 select-none">
              <input
                type="checkbox"
                checked={showFingerings}
                onChange={(e) => setShowFingerings(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Fingerings (1–5)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900 select-none">
              <input
                type="checkbox"
                checked={showNoteNames}
                onChange={(e) => setShowNoteNames(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Pitch Names</span>
            </label>
          </div>

          <div className="text-[11px] text-stone-500 font-mono">
            Standard A4 / Letter format
          </div>
        </div>

        {/* Iframe or Print Error Notice */}
        {printErrorNotice && (
          <div className="mx-5 my-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 print:hidden">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Why didn&apos;t System Print open? </span>
              {printErrorNotice}
            </div>
            <button
              onClick={() => setPrintErrorNotice(null)}
              className="text-amber-700 hover:text-amber-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* The Printable Score Document Container */}
        <div
          ref={printableAreaRef}
          className="p-6 sm:p-10 font-serif bg-white text-stone-900"
          id="printable-sheet-area"
          style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}
        >
          {/* Printable Header Banner */}
          <div className="text-center pb-6 border-b-2 border-stone-900 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-stone-900 uppercase">
              Nuvole Bianche
            </h1>
            <p className="text-xs sm:text-sm italic text-stone-600 mb-3">
              Complete Piano Solo Score with Pedagogical Fingerings & Harmonic Analysis
            </p>

            <div className="flex justify-between items-end text-xs font-sans text-stone-700 px-2 pt-2 border-t border-stone-200">
              <div className="text-left font-mono leading-relaxed">
                <div><strong>Key:</strong> F minor (4 Flats: B♭, E♭, A♭, D♭)</div>
                <div><strong>Meter:</strong> 12/8 time • Andante con moto (♩. = 48–54)</div>
                <div><strong>Progression:</strong> Fm – D♭ – A♭ – E♭ (i – VI – III – VII)</div>
              </div>
              <div className="text-right leading-relaxed">
                <div className="font-bold text-sm text-stone-900">Ludovico Einaudi</div>
                <div className="text-stone-500 text-[11px]">Pedagogical Performance Edition</div>
                <div className="text-amber-800 font-mono text-[10px]">Jacob&apos;s Piano Reference</div>
              </div>
            </div>
          </div>

          {/* Measure Rows */}
          <div className="space-y-6">
            {MEASURES.map((meas) => {
              const svgWidth = 480;
              const startX = 64;
              const usableWidth = svgWidth - startX - 20;

              return (
                <div
                  key={meas.number}
                  className="border border-stone-300 rounded-xl p-4 bg-[#FFFDF9] break-inside-avoid shadow-2xs"
                  style={{ pageBreakInside: 'avoid' }}
                >
                  {/* Bar Meta Header */}
                  <div className="flex justify-between items-center text-xs font-sans mb-2.5 pb-1.5 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold font-mono text-xs flex items-center justify-center">
                        {meas.number}
                      </span>
                      <span className="font-bold text-base font-serif text-stone-900">
                        {meas.chord}
                      </span>
                      <span className="text-xs text-stone-500 font-mono">
                        ({meas.chordRoman})
                      </span>
                      <span className="italic font-serif ml-2 text-stone-700 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-xs">
                        {meas.dynamics}
                      </span>
                    </div>
                    <div className="text-right text-[11px] font-sans text-stone-600">
                      <span className="italic font-serif">{meas.tempoText}</span>
                      <span className="mx-1">•</span>
                      <span className="font-mono text-stone-500">{meas.pedalText}</span>
                    </div>
                  </div>

                  {/* Optional Grand Staff Vector Notation */}
                  {includeGrandStaff && (
                    <div className="mb-3 bg-white p-2 rounded-lg border border-stone-200 overflow-x-auto">
                      <svg
                        viewBox={`0 0 ${svgWidth} 190`}
                        className="w-full h-auto select-none"
                        style={{ minWidth: '380px' }}
                      >
                        {/* Bracket */}
                        <line x1="8" y1="32" x2="8" y2="144" stroke="#44403C" strokeWidth="2.5" />
                        <path
                          d="M 8 32 C 3 32, 2 88, 2 88 C 2 88, 3 144, 8 144"
                          fill="none"
                          stroke="#44403C"
                          strokeWidth="2"
                        />

                        {/* Treble Lines */}
                        {[32, 40, 48, 56, 64].map((y) => (
                          <line
                            key={`p-treble-${y}`}
                            x1="8"
                            y1={y}
                            x2={svgWidth - 6}
                            y2={y}
                            stroke="#78716C"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Bass Lines */}
                        {[112, 120, 128, 136, 144].map((y) => (
                          <line
                            key={`p-bass-${y}`}
                            x1="8"
                            y1={y}
                            x2={svgWidth - 6}
                            y2={y}
                            stroke="#78716C"
                            strokeWidth="1"
                          />
                        ))}

                        {/* End Bar */}
                        <line x1={svgWidth - 6} y1="32" x2={svgWidth - 6} y2="144" stroke="#44403C" strokeWidth="2" />

                        {/* Clefs */}
                        <text x="14" y="58" fontSize="32" fontFamily="serif" fill="#292524">
                          𝄞
                        </text>
                        <text x="14" y="136" fontSize="26" fontFamily="serif" fill="#292524">
                          𝄢
                        </text>

                        {/* Key Sig Flats */}
                        <text x="36" y="50" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                        <text x="42" y="38" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                        <text x="48" y="54" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                        <text x="54" y="42" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                        <text x="36" y="130" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                        <text x="42" y="118" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                        <text x="48" y="134" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>
                        <text x="54" y="122" fontSize="15" fill="#44403C" fontFamily="sans-serif">♭</text>

                        {/* Time Signature */}
                        {meas.number === 1 && (
                          <>
                            <text x="63" y="46" fontSize="12" fontWeight="bold" fill="#292524">12</text>
                            <text x="65" y="60" fontSize="12" fontWeight="bold" fill="#292524">8</text>
                            <text x="63" y="126" fontSize="12" fontWeight="bold" fill="#292524">12</text>
                            <text x="65" y="140" fontSize="12" fontWeight="bold" fill="#292524">8</text>
                          </>
                        )}

                        {/* Left Hand Notes */}
                        {meas.lhNotes.map((note) => {
                          const x = startX + (note.beat / 12) * usableWidth + 12;
                          const { y, ledgerLines } = getStaffY(note.pitch, 'bass');

                          return (
                            <g key={`p-lh-${note.id}`}>
                              {ledgerLines.map((ly) => (
                                <line
                                  key={`p-lh-led-${ly}`}
                                  x1={x - 8}
                                  y1={ly}
                                  x2={x + 14}
                                  y2={ly}
                                  stroke="#57534E"
                                  strokeWidth="1.2"
                                />
                              ))}
                              <ellipse
                                cx={x + 3}
                                cy={y}
                                rx="5"
                                ry="3.8"
                                transform={`rotate(-25 ${x + 3} ${y})`}
                                fill="#1C1917"
                              />
                              <line x1={x + 7.5} y1={y} x2={x + 7.5} y2={y - 20} stroke="#1C1917" strokeWidth="1.2" />

                              {showFingerings && (
                                <g transform={`translate(${x - 4}, ${y + 8})`}>
                                  <rect
                                    x="0"
                                    y="0"
                                    width="13"
                                    height="13"
                                    rx="3"
                                    fill="#ECFDF5"
                                    stroke="#059669"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x="6.5"
                                    y="9.5"
                                    textAnchor="middle"
                                    fontSize="9"
                                    fontWeight="bold"
                                    fill="#047857"
                                    fontFamily="monospace"
                                  >
                                    {note.finger}
                                  </text>
                                </g>
                              )}

                              {showNoteNames && (
                                <text
                                  x={x + 3}
                                  y={y - 7}
                                  textAnchor="middle"
                                  fontSize="7.5"
                                  fontWeight="600"
                                  fill="#047857"
                                >
                                  {note.pitch}
                                </text>
                              )}
                            </g>
                          );
                        })}

                        {/* Right Hand Notes */}
                        {meas.rhNotes.map((note) => {
                          const x = startX + (note.beat / 12) * usableWidth + 12;
                          const { y, ledgerLines } = getStaffY(note.pitch, 'treble');

                          return (
                            <g key={`p-rh-${note.id}`}>
                              {ledgerLines.map((ly) => (
                                <line
                                  key={`p-rh-led-${ly}`}
                                  x1={x - 8}
                                  y1={ly}
                                  x2={x + 14}
                                  y2={ly}
                                  stroke="#57534E"
                                  strokeWidth="1.2"
                                />
                              ))}
                              <ellipse
                                cx={x + 3}
                                cy={y}
                                rx="5"
                                ry="3.8"
                                transform={`rotate(-25 ${x + 3} ${y})`}
                                fill="#1C1917"
                              />
                              <line x1={x + 7.5} y1={y} x2={x + 7.5} y2={y - 20} stroke="#1C1917" strokeWidth="1.2" />

                              {showFingerings && (
                                <g transform={`translate(${x - 4}, ${y - 23})`}>
                                  <rect
                                    x="0"
                                    y="0"
                                    width="13"
                                    height="13"
                                    rx="3"
                                    fill="#EFF6FF"
                                    stroke="#2563EB"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x="6.5"
                                    y="9.5"
                                    textAnchor="middle"
                                    fontSize="9"
                                    fontWeight="bold"
                                    fill="#1D4ED8"
                                    fontFamily="monospace"
                                  >
                                    {note.finger}
                                  </text>
                                </g>
                              )}

                              {showNoteNames && (
                                <text
                                  x={x + 3}
                                  y={y + 12}
                                  textAnchor="middle"
                                  fontSize="7.5"
                                  fontWeight="600"
                                  fill="#1D4ED8"
                                >
                                  {note.pitch}
                                </text>
                              )}
                            </g>
                          );
                        })}

                        {/* Pedal Marking */}
                        <g transform="translate(10, 178)">
                          <text x="0" y="0" fontSize="10" fontStyle="italic" fontFamily="serif" fill="#78716C">
                            Ped.
                          </text>
                          <line x1="28" y1="-3" x2={svgWidth - 28} y2="-3" stroke="#A8A29E" strokeWidth="1" />
                        </g>
                      </svg>
                    </div>
                  )}

                  {/* Note Breakdown Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {/* RH notes */}
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <div className="flex justify-between items-center font-bold text-blue-900 mb-1 pb-1 border-b border-stone-200">
                        <span>𝄞 Right Hand (RH)</span>
                        <span className="text-[10px] font-mono text-stone-500">
                          {meas.rhNotes.length} notes
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meas.rhNotes.map((note) => (
                          <span
                            key={note.id}
                            className="px-1.5 py-0.5 rounded bg-white border border-stone-300 text-stone-800 text-[11px] font-mono flex items-center gap-1"
                          >
                            <strong>{note.pitch}</strong>
                            {showFingerings && (
                              <span className="text-blue-700 font-bold">f.{note.finger}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* LH notes */}
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <div className="flex justify-between items-center font-bold text-emerald-900 mb-1 pb-1 border-b border-stone-200">
                        <span>𝄢 Left Hand (LH)</span>
                        <span className="text-[10px] font-mono text-stone-500">
                          {meas.lhNotes.length} notes
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meas.lhNotes.map((note) => (
                          <span
                            key={note.id}
                            className="px-1.5 py-0.5 rounded bg-white border border-stone-300 text-stone-800 text-[11px] font-mono flex items-center gap-1"
                          >
                            <strong>{note.pitch}</strong>
                            {showFingerings && (
                              <span className="text-emerald-700 font-bold">f.{note.finger}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fingering Technique Advice */}
                  <div className="mt-2 text-[11px] text-stone-700 font-sans flex items-start gap-1">
                    <span className="font-bold text-amber-900 shrink-0">Technique note:</span>
                    <span>{meas.techniqueTip}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Document Footer */}
          <div className="pt-8 text-center text-xs text-stone-500 border-t border-stone-300 mt-8">
            <p className="font-serif">
              Ludovico Einaudi: Nuvole Bianche • Complete Pedagogical Score & Fingering Analysis
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">
              Jacob&apos;s Piano Performance Analysis • Generated with high-resolution vector staves
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
