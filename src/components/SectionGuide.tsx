import React, { useState } from 'react';
import { BookOpen, Sparkles, HandMetal, CheckCircle2, ChevronRight, Waves } from 'lucide-react';
import { SECTIONS } from '../data/nuvoleBiancheData';

interface SectionGuideProps {
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
  onJumpToMeasure: (meas: number) => void;
}

export const SectionGuide: React.FC<SectionGuideProps> = ({
  activeSectionId,
  onSelectSection,
  onJumpToMeasure,
}) => {
  const [selectedTab, setSelectedTab] = useState(activeSectionId || 'intro');

  const currentSection = SECTIONS.find((s) => s.id === selectedTab) || SECTIONS[0];

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 text-stone-100 shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-stone-100">
              Pianist&apos;s Section-by-Section Masterclass & Fingering Guide
            </h2>
            <p className="text-xs text-stone-400">
              Technique, hand weight distribution, and fingering choreography for Ludovico Einaudi&apos;s Nuvole Bianche
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onSelectSection(currentSection.id);
            onJumpToMeasure(currentSection.measures[0]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition shadow-sm"
        >
          <span>Practice Section (Bars {currentSection.measures[0]}–{currentSection.measures[1]})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
        {SECTIONS.map((sec) => {
          const isSelected = selectedTab === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setSelectedTab(sec.id)}
              className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-stone-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                Bars {sec.measures[0]}–{sec.measures[1]}
              </div>
              <div className="font-serif font-bold text-xs leading-tight text-stone-200">
                {sec.name.split(':')[1]?.trim() || sec.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Section Deep Dive */}
      <div className="bg-stone-950/70 rounded-xl p-5 border border-stone-800/80 space-y-5">
        {/* Title & Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-300">
              {currentSection.name}
            </h3>
            <p className="text-xs text-stone-400">{currentSection.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-stone-900 border border-stone-800 text-stone-300">
              Progression: <strong className="text-amber-400">{currentSection.chordProgression}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-900 border border-stone-800 text-stone-300">
              Tempo: <strong className="text-stone-100">{currentSection.tempoBpm} BPM</strong> (12/8)
            </span>
          </div>
        </div>

        {/* Fingering Highlights (LH vs RH) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSection.fingeringHighlights.map((f, idx) => {
            const isRH = f.hand === 'RH';
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  isRH
                    ? 'bg-blue-950/20 border-blue-800/40 text-blue-100'
                    : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                      isRH ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {f.hand}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-stone-100">
                    {f.title}
                  </h4>
                </div>

                <div className="mb-2 p-2 rounded-lg bg-stone-900/80 border border-stone-800 font-mono text-xs text-amber-300 flex items-center gap-1.5">
                  <HandMetal className="w-3.5 h-3.5 shrink-0" />
                  <span>{f.pattern}</span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Practice Strategy & Pedaling Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Practice Routine */}
          <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
            <h5 className="font-semibold text-xs text-amber-400 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              Practice Strategy
            </h5>
            <p className="text-xs text-stone-300 leading-relaxed">
              {currentSection.practiceStrategy}
            </p>
          </div>

          {/* Pedaling */}
          <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
            <h5 className="font-semibold text-xs text-cyan-400 mb-1.5 flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              Pedaling Choreography
            </h5>
            <p className="text-xs text-stone-300 leading-relaxed">
              {currentSection.pedalingGuide}
            </p>
          </div>
        </div>

        {/* Hand Size & Ergonomics Note */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Ergonomics & Hand Size Adjustment:</span>{' '}
            If you have smaller hands and reaching the octaves or tenths causes forearm tension, do not stretch
            stiffly. Allow your left wrist to pivot and roll gently from the low note (5) to the upper chord tones
            (2 and 1). Never hold tension in your knuckles!
          </div>
        </div>
      </div>
    </div>
  );
};
