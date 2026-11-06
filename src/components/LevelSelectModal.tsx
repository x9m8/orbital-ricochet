/**
 * Stage Selection Modal with World Groupings and Star Records
 */

import React from 'react';
import { X, Star, Play, ExternalLink } from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../game/levels';
import { soundEngine } from '../game/audio';

interface LevelSelectModalProps {
  currentLevelIndex: number;
  levelStars: Record<string, number>;
  levelScores: Record<string, number>;
  onSelectLevel: (index: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelIndex,
  levelStars,
  levelScores,
  onSelectLevel,
  onClose,
}) => {
  const worlds = [
    { id: 1, name: 'World 1: Neon Citadel', levels: CAMPAIGN_LEVELS.filter(l => l.world === 1) },
    { id: 2, name: 'World 2: Cosmic Vortex', levels: CAMPAIGN_LEVELS.filter(l => l.world === 2) },
    { id: 3, name: 'World 3: Demolition Foundry', levels: CAMPAIGN_LEVELS.filter(l => l.world === 3) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Select Stage</h2>
            <p className="text-xs text-slate-400">Choose a campaign sector to play</p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable World List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {worlds.map((world) => (
            <div key={world.id}>
              <div className="text-xs uppercase font-bold tracking-wider text-sky-400 mb-3 px-1">
                {world.name}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {world.levels.map((lvl) => {
                  const globalIdx = CAMPAIGN_LEVELS.findIndex(l => l.id === lvl.id);
                  const isCurrent = globalIdx === currentLevelIndex;
                  const stars = levelStars[lvl.id] || 0;
                  const best = levelScores[lvl.id] || 0;

                  return (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        soundEngine.playClick();
                        onSelectLevel(globalIdx);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-sky-950/40 border-sky-500/80 shadow-md shadow-sky-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{globalIdx + 1}
                          </span>
                          <span className="text-sm font-bold text-white tracking-tight">
                            {lvl.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {/* Stars */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= stars
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span>·</span>
                          <span className="font-mono text-slate-400 tabular-nums">
                            {best > 0 ? `${best.toLocaleString()} pts` : 'Unbeaten'}
                          </span>
                        </div>
                      </div>

                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrent ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Orbital Ricochet Sectors</span>
          <a
            href="https://x9m8.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1 underline underline-offset-4 decoration-sky-500/40 hover:decoration-sky-300 transition-colors"
          >
            <span>x9m8.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
