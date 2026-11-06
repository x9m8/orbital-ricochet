/**
 * Sandbox Level Builder & Custom Physics Laboratory
 * Allows players to place pegs, bumpers, TNT, gravity vortexes, and bricks,
 * customize gravity parameters, and test play immediately!
 */

import React, { useState } from 'react';
import { Target, Disc, Bomb, Play, Trash2, Download, Upload, Copy, Check } from 'lucide-react';
import { LevelConfig, PegType } from '../game/types';
import { soundEngine } from '../game/audio';

export type ToolMode = PegType | 'brick' | 'gravity_well' | 'erase';

interface SandboxEditorProps {
  currentLevel: LevelConfig;
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  onUpdateLevel: (level: LevelConfig) => void;
  onPlaytest: () => void;
  onClear: () => void;
}

export const SandboxEditor: React.FC<SandboxEditorProps> = ({
  currentLevel,
  activeTool,
  onSelectTool,
  onUpdateLevel,
  onPlaytest,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);

  const tools: { mode: ToolMode; label: string; icon: React.ReactNode; color: string }[] = [
    { mode: 'standard', label: 'Standard Peg', icon: <Disc className="w-4 h-4 text-sky-400" />, color: 'hover:border-sky-500' },
    { mode: 'target', label: 'Target Orb', icon: <Target className="w-4 h-4 text-amber-400" />, color: 'hover:border-amber-500' },
    { mode: 'bumper', label: 'Bumper', icon: <Disc className="w-4 h-4 text-sky-400" />, color: 'hover:border-sky-400' },
    { mode: 'tnt', label: 'TNT Barrel', icon: <Bomb className="w-4 h-4 text-rose-400" />, color: 'hover:border-rose-500' },
    { mode: 'brick', label: 'Brick Barrier', icon: <div className="w-4 h-2 bg-slate-400 rounded-sm" />, color: 'hover:border-slate-400' },
    { mode: 'gravity_well', label: 'Gravity Well', icon: <div className="w-3.5 h-3.5 rounded-full border border-purple-400" />, color: 'hover:border-purple-400' },
    { mode: 'erase', label: 'Eraser', icon: <Trash2 className="w-4 h-4 text-rose-400" />, color: 'hover:border-rose-400' },
  ];

  const handleExport = () => {
    soundEngine.playClick();
    const jsonStr = JSON.stringify(currentLevel, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyImport = () => {
    try {
      const parsed = JSON.parse(importJson) as LevelConfig;
      if (parsed && parsed.pegs) {
        onUpdateLevel(parsed);
        setShowImport(false);
        setImportJson('');
        soundEngine.playClick();
      }
    } catch {
      alert('Invalid level JSON code.');
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md shadow-xl flex flex-col gap-3">
      {/* Top row: Mode title & Playtest */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-sky-400">Level Builder</div>
          <div className="text-sm text-slate-300">
            Click on the canvas area to place entities or erase them.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onPlaytest();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-sky-500/25 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>TEST PLAY STAGE</span>
          </button>
        </div>
      </div>

      {/* Palette Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Placement Tools */}
        <div className="flex flex-wrap items-center gap-1.5">
          {tools.map((t) => {
            const isActive = activeTool === t.mode;
            return (
              <button
                key={t.mode}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectTool(t.mode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 border-sky-400 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                } ${t.color}`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Physics Tuning & Utility */}
        <div className="flex items-center gap-3">
          {/* Gravity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Gravity:</span>
            <select
              value={currentLevel.gravity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateLevel({ ...currentLevel, gravity: val });
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-2 py-1 outline-none focus:border-sky-500"
            >
              <option value="0.12">Low (Moon)</option>
              <option value="0.22">Standard (Earth)</option>
              <option value="0.32">Heavy (Jupiter)</option>
            </select>
          </div>

          {/* Balls Count */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Balls:</span>
            <select
              value={currentLevel.initialBalls}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onUpdateLevel({ ...currentLevel, initialBalls: val });
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-2 py-1 outline-none focus:border-sky-500"
            >
              <option value="5">5 Balls</option>
              <option value="8">8 Balls</option>
              <option value="10">10 Balls</option>
              <option value="15">15 Balls</option>
            </select>
          </div>

          {/* Actions: Clear, Copy, Import */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onClear();
            }}
            title="Clear all entities"
            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExport}
            title="Export Level Code"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Export'}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setShowImport(!showImport);
            }}
            title="Import Custom Level Code"
            className="p-1.5 text-slate-400 hover:text-sky-400 bg-slate-950 border border-slate-800 rounded-md transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Import Modal Flyout */}
      {showImport && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2 mt-2">
          <div className="text-xs text-slate-400">Paste JSON level code below:</div>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            rows={3}
            placeholder='{"id":"custom_1", "pegs":[...]}'
            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 outline-none focus:border-sky-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowImport(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyImport}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded"
            >
              Load Level
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
