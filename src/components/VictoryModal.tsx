/**
 * Victory & Extreme Fever Completion Modal with Star Rating and Fireworks
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, ArrowRight, RotateCcw, LayoutGrid, ExternalLink } from 'lucide-react';
import { GameStats } from '../game/types';
import { soundEngine } from '../game/audio';

interface VictoryModalProps {
  levelName: string;
  stats: GameStats;
  isLastLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelName,
  stats,
  isLastLevel,
  onNextLevel,
  onReplay,
  onOpenLevelSelect,
}) => {
  // Calculate star rating
  let stars = 1;
  if (stats.ballsRemaining >= 3 || stats.score >= 50000) stars = 2;
  if (stats.ballsRemaining >= 5 && stats.score >= 80000) stars = 3;

  useEffect(() => {
    // Launch festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-500/10 text-center flex flex-col items-center">
        {/* Trophy Glow */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-1">
          Extreme Fever Cleared!
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          {levelName}
        </h2>

        {/* 3-Star Rating */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((starNum) => (
            <div
              key={starNum}
              className={`p-1.5 rounded-lg transition-transform ${
                starNum <= stars ? 'text-amber-400 scale-110' : 'text-slate-700'
              }`}
            >
              <Star className="w-7 h-7 fill-current" />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-left">
          <div>
            <div className="text-xs text-slate-400">Final Score</div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Max Combo Streak</div>
            <div className="text-lg font-mono font-bold text-purple-400 tabular-nums">
              {stats.maxCombo} Hits
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Balls Preserved</div>
            <div className="text-lg font-mono font-bold text-sky-400 tabular-nums">
              {stats.ballsRemaining}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Free Balls Caught</div>
            <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
              +{stats.freeBallsEarned}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {!isLastLevel ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                onNextLevel();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 text-sm font-semibold text-amber-300 bg-amber-500/10 rounded-xl border border-amber-500/30">
              🎉 Congratulations! You conquered all campaign stages!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onReplay();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenLevelSelect();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Select Stage</span>
            </button>
          </div>

          <a
            href="https://x9m8.com"
            target="_blank"
            rel="noopener noreferrer"
            className="pt-1 text-[11px] text-slate-500 hover:text-sky-400 transition-colors inline-flex items-center justify-center gap-1"
          >
            <span>Play more at x9m8.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
