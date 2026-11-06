/**
 * How to Play Guide Modal with Mechanics & Arsenal Explanations
 */

import React from 'react';
import { X, Target, Disc, Bomb, Flame, Zap, Split, Award, ExternalLink } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">How to Play</h2>
            <p className="text-xs text-slate-400">Master the physics of Orbital Ricochet by x9m8.com</p>
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

        {/* Scrollable Rules List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-slate-300">
          {/* Rule 1: Aim & Objectives */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5">Primary Objective: Golden Orbs</div>
              <p className="text-slate-400 leading-relaxed">
                Aim the cannon with your mouse or finger. Click or press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">SPACE</kbd> to launch.
                Destroy all golden target orbs before running out of balls to trigger <span className="text-amber-400 font-semibold">EXTREME FEVER</span>!
              </p>
            </div>
          </div>

          {/* Rule 2: Free Ball Catcher */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5">The Bottom Catcher Basket</div>
              <p className="text-slate-400 leading-relaxed">
                A motorized catcher trolley patrols the bottom edge. Catch your falling ball inside the net to earn an <span className="text-emerald-400 font-semibold">EXTRA BALL (+1 Shot)</span> and a <span className="text-emerald-400 font-semibold">+5,000 PTS</span> bonus!
              </p>
            </div>
          </div>

          {/* Rule 3: Pinball Bumpers & Multipliers */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Disc className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5">Bumpers & Combo Ladders</div>
              <p className="text-slate-400 leading-relaxed">
                Large circular pinball bumpers launch your ball back into the air with explosive spring force. Every 5 consecutive hits in a single shot increases your score multiplier (x2, x3, x4...)!
              </p>
            </div>
          </div>

          {/* Rule 4: Ball Types */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <div className="text-sm font-bold text-white mb-2">Tactical Ball Arsenal</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <Disc className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Plasma (Standard)</div>
                  <div className="text-[11px] text-slate-400">Crisp, high-restitution ricochet.</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <Bomb className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Cluster Bomb</div>
                  <div className="text-[11px] text-slate-400">Click in flight to split into 4 bouncy bombs.</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Heavy Meteor</div>
                  <div className="text-[11px] text-slate-400">3x mass; crushes fortified brick barricades.</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Tesla Lightning</div>
                  <div className="text-[11px] text-slate-400">Strikes 3 adjacent pegs with electric arcs.</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800 sm:col-span-2">
                <Split className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Splitter Prism</div>
                  <div className="text-[11px] text-slate-400">Spawns 2 additional balls upon the very first impact!</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://x9m8.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1.5 underline underline-offset-4 decoration-sky-500/40 hover:decoration-sky-300 transition-colors"
          >
            <span>Visit x9m8.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
