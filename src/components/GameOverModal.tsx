/**
 * Game Over / Stage Failed Modal
 */

import React from 'react';
import { RotateCcw, LayoutGrid, AlertCircle, ExternalLink } from 'lucide-react';
import { GameStats } from '../game/types';
import { soundEngine } from '../game/audio';

interface GameOverModalProps {
  levelName: string;
  stats: GameStats;
  onRetry: () => void;
  onOpenLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  levelName,
  stats,
  onRetry,
  onOpenLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center">
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/10">
          <AlertCircle className="w-7 h-7 text-rose-400" />
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-rose-400 mb-1">
          Out of Balls
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">
          {levelName}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {stats.targetsRemaining} target {stats.targetsRemaining === 1 ? 'orb' : 'orbs'} remained uncleared.
        </p>

        {/* Score Card */}
        <div className="w-full bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-5 flex justify-between items-center text-left">
          <div>
            <div className="text-xs text-slate-400">Score Earned</div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Max Combo</div>
            <div className="text-sm font-mono font-bold text-sky-400 tabular-nums">
              {stats.maxCombo} Hits
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onRetry();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenLevelSelect();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Select Stage</span>
          </button>

          <a
            href="https://x9m8.com"
            target="_blank"
            rel="noopener noreferrer"
            className="pt-1 text-[11px] text-slate-500 hover:text-sky-400 transition-colors inline-flex items-center justify-center gap-1"
          >
            <span>Visit x9m8.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
