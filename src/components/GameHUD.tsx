/**
 * In-Game HUD: Score, Ball Magazine, Arsenal Selector, and Status indicators
 */

import React from 'react';
import { BallType, GameStats, PlayState } from '../game/types';
import { RotateCcw, Target, Sparkles, Bomb, Flame, Zap, Split, Disc } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface GameHUDProps {
  levelName: string;
  worldName: string;
  stats: GameStats;
  highScore: number;
  playState: PlayState;
  selectedBallType: BallType;
  onSelectBallType: (type: BallType) => void;
  showTrajectory: boolean;
  onToggleTrajectory: () => void;
  onRestart: () => void;
  onFire: () => void;
  onTriggerAbility: () => void;
  hasActiveDetonatableBall: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelName,
  worldName,
  stats,
  highScore,
  playState,
  selectedBallType,
  onSelectBallType,
  showTrajectory,
  onToggleTrajectory,
  onRestart,
  onFire,
  onTriggerAbility,
  hasActiveDetonatableBall
}) => {
  const ballTypes: { type: BallType; name: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { type: 'standard', name: 'Plasma', desc: 'Balanced bounce', icon: <Disc className="w-4 h-4 text-sky-400" />, color: 'hover:border-sky-500' },
    { type: 'bomb', name: 'Cluster', desc: 'Mid-air burst', icon: <Bomb className="w-4 h-4 text-amber-400" />, color: 'hover:border-amber-500' },
    { type: 'meteor', name: 'Meteor', desc: 'Heavy wrecker', icon: <Flame className="w-4 h-4 text-rose-400" />, color: 'hover:border-rose-500' },
    { type: 'tesla', name: 'Tesla', desc: 'Chain lightning', icon: <Zap className="w-4 h-4 text-cyan-400" />, color: 'hover:border-cyan-500' },
    { type: 'splitter', name: 'Splitter', desc: '3x Triplicate', icon: <Split className="w-4 h-4 text-purple-400" />, color: 'hover:border-purple-500' }
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Telemetry Strip */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Stage Identity */}
        <div>
          <div className="text-xs text-slate-400 font-medium">
            <span>{worldName}</span>
            <span className="mx-1.5 text-slate-600">·</span>
            <span className="text-sky-400">{levelName}</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {stats.targetsRemaining === 0 ? 'Target Cleared!' : `${stats.targetsRemaining} Targets Left`}
          </div>
        </div>

        {/* Core Metrics */}
        <div className="flex items-center gap-6">
          {/* Targets Counter */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Objectives</div>
              <div className="text-sm font-mono font-semibold text-amber-400 tabular-nums">
                {stats.totalTargets - stats.targetsRemaining} / {stats.totalTargets}
              </div>
            </div>
          </div>

          {/* Multiplier Combo */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              stats.currentMultiplier > 1 
                ? 'bg-purple-500/20 border border-purple-500/50 shadow-md shadow-purple-500/20 scale-105' 
                : 'bg-slate-800/60 border border-slate-700/40'
            }`}>
              <Sparkles className={`w-4 h-4 ${stats.currentMultiplier > 1 ? 'text-purple-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <div className="text-xs text-slate-400">Combo Multiplier</div>
              <div className={`text-sm font-mono font-bold tabular-nums ${
                stats.currentMultiplier > 1 ? 'text-purple-300' : 'text-slate-300'
              }`}>
                x{stats.currentMultiplier}
              </div>
            </div>
          </div>

          {/* Current Score */}
          <div className="text-right">
            <div className="text-xs text-slate-400">Score / Best</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-mono font-bold text-white tabular-nums">
                {stats.score.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                ({highScore.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        {/* Trajectory Guide & Restart Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleTrajectory();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showTrajectory
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Guide: {showTrajectory ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            title="Restart Stage"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Arsenal Selection & Ball Magazine */}
      <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Ball Types */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">Ball Arsenal:</span>
          {ballTypes.map((item) => {
            const isSelected = selectedBallType === item.type;
            return (
              <button
                key={item.type}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectBallType(item.type);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-sky-400 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                } ${item.color}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Magazine (Balls Remaining) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Balls:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(10, stats.ballsRemaining) }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-3 h-3 rounded-full bg-gradient-to-tr from-sky-500 to-sky-300 shadow-sm shadow-sky-500/40"
                />
              ))}
              {stats.ballsRemaining > 10 && (
                <span className="text-xs font-mono text-sky-400 ml-1">
                  +{stats.ballsRemaining - 10}
                </span>
              )}
            </div>
            <span className="text-sm font-mono font-bold text-white ml-1 tabular-nums">
              {stats.ballsRemaining}
            </span>
          </div>

          {/* Trigger mid-air cluster bomb detonate or Fire action */}
          {hasActiveDetonatableBall ? (
            <button
              onClick={onTriggerAbility}
              className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-lg shadow-amber-600/30 transition-all animate-pulse"
            >
              💥 DETONATE CLUSTER
            </button>
          ) : (
            <button
              onClick={onFire}
              disabled={playState === 'FIRING' || stats.ballsRemaining <= 0}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                playState === 'FIRING' || stats.ballsRemaining <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/25 active:scale-95'
              }`}
            >
              {playState === 'FIRING' ? 'BALL IN FLIGHT' : 'FIRE (SPACE)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
