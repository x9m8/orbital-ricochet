/**
 * Top Navigation Bar adhering to the Top Bar Contract:
 * [Brand title, one line] — [4–5 nav links, 1–2 word labels, single-line] — [1 primary action]
 */

import React from 'react';
import { Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface HeaderProps {
  currentMode: 'CAMPAIGN' | 'ENDLESS' | 'SANDBOX';
  onSelectMode: (mode: 'CAMPAIGN' | 'ENDLESS' | 'SANDBOX') => void;
  onOpenHowToPlay: () => void;
  onOpenLevelSelect: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenHowToPlay,
  onOpenLevelSelect,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark linking to x9m8.com */}
      <a
        href="https://x9m8.com"
        target="_blank"
        rel="noopener noreferrer"
        title="Orbital Ricochet by x9m8.com"
        className="flex items-center gap-3 shrink-0 group focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg p-0.5"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 group-hover:shadow-sky-500/40 transition-all">
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-inner" />
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap leading-tight group-hover:text-sky-300 transition-colors">
            Orbital Ricochet
          </span>
          <span className="text-[11px] font-mono text-amber-400 font-semibold tracking-wide flex items-center gap-1">
            by <span className="underline decoration-amber-400/50 group-hover:decoration-amber-300">x9m8.com</span>
          </span>
        </div>
      </a>

      {/* Zone 2: 4-5 Clean single-line text links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectMode('CAMPAIGN');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'CAMPAIGN' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          Campaign
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenLevelSelect();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Select Stage
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectMode('ENDLESS');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'ENDLESS' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          Endless Waves
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectMode('SANDBOX');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'SANDBOX' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          Level Builder
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenHowToPlay();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          How to Play
        </button>
      </nav>

      {/* Zone 3: Actions & Link to x9m8.com */}
      <div className="flex items-center gap-2.5 shrink-0">
        <a
          href="https://x9m8.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/20 rounded-md transition-all whitespace-nowrap shrink-0 group focus:outline-none focus:ring-2 focus:ring-sky-400"
          title="Visit x9m8.com"
        >
          <span>x9m8.com</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>

        <button
          onClick={() => {
            onToggleMute();
            soundEngine.playClick();
          }}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>
      </div>
    </header>
  );
};
