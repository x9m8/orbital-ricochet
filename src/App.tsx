/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PhysicsEngine } from './game/physics';
import { GameRenderer } from './game/renderer';
import { CAMPAIGN_LEVELS, generateEndlessWave } from './game/levels';
import { BallType, GameMode, LevelConfig, PlayState, PegType } from './game/types';
import { soundEngine } from './game/audio';
import { Header } from './components/Header';
import { GameHUD } from './components/GameHUD';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ExternalLink } from 'lucide-react';
import { SandboxEditor, ToolMode } from './components/SandboxEditor';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsRef = useRef<PhysicsEngine>(new PhysicsEngine());
  const rendererRef = useRef<GameRenderer>(new GameRenderer());
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Game Mode & Level State
  const [gameMode, setGameMode] = useState<GameMode>('CAMPAIGN');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [endlessWave, setEndlessWave] = useState<number>(1);
  const [customLevel, setCustomLevel] = useState<LevelConfig>({
    id: 'sandbox_custom',
    name: 'Custom Arena',
    world: 0,
    worldName: 'Sandbox Studio',
    description: 'Design your own physics layout and playtest it!',
    initialBalls: 10,
    gravity: 0.22,
    pegs: [
      { type: 'bumper', x: 400, y: 300, radius: 26 },
      { type: 'target', x: 300, y: 250 },
      { type: 'target', x: 500, y: 250 },
      { type: 'standard', x: 350, y: 380 },
      { type: 'standard', x: 450, y: 380 },
      { type: 'tnt', x: 400, y: 440, radius: 20 },
    ]
  });

  // Sandbox Tool state
  const [sandboxTool, setSandboxTool] = useState<ToolMode>('standard');
  const [isSandboxTesting, setIsSandboxTesting] = useState<boolean>(false);

  // HUD & UI States
  const [stats, setStats] = useState(physicsRef.current.stats);
  const [playState, setPlayState] = useState<PlayState>('READY');
  const [selectedBallType, setSelectedBallType] = useState<BallType>('standard');
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());

  // Modals
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Saved Records
  const [levelStars, setLevelStars] = useState<Record<string, number>>({});
  const [levelScores, setLevelScores] = useState<Record<string, number>>({});
  const [endlessHighScore, setEndlessHighScore] = useState<number>(0);

  // Load saved high scores from localStorage
  useEffect(() => {
    try {
      const savedStars = localStorage.getItem('x9m8_stars') || localStorage.getItem('orbital_ricochet_stars');
      if (savedStars) setLevelStars(JSON.parse(savedStars));

      const savedScores = localStorage.getItem('x9m8_scores') || localStorage.getItem('orbital_ricochet_scores');
      if (savedScores) setLevelScores(JSON.parse(savedScores));

      const savedEndless = localStorage.getItem('x9m8_endless_hs') || localStorage.getItem('orbital_ricochet_endless_hs');
      if (savedEndless) setEndlessHighScore(parseInt(savedEndless, 10) || 0);
    } catch {
      // Ignore local storage parsing issues
    }
  }, []);

  // Initialize or reload level
  const loadStage = useCallback((index: number, mode: GameMode) => {
    const physics = physicsRef.current;
    if (mode === 'CAMPAIGN') {
      const config = CAMPAIGN_LEVELS[index] || CAMPAIGN_LEVELS[0];
      physics.loadLevel(config);
      setStats({ ...physics.stats });
      setPlayState(physics.playState);
    } else if (mode === 'ENDLESS') {
      const config = generateEndlessWave(endlessWave);
      physics.loadLevel(config, endlessWave > 1); // keep score across waves!
      setStats({ ...physics.stats });
      setPlayState(physics.playState);
    } else if (mode === 'SANDBOX') {
      physics.loadLevel(customLevel);
      setStats({ ...physics.stats });
      setPlayState(physics.playState);
    }
  }, [endlessWave, customLevel]);

  // Handle stage change when mode or index updates
  useEffect(() => {
    loadStage(currentLevelIndex, gameMode);
  }, [currentLevelIndex, gameMode, loadStage]);

  // Main 60 FPS animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const physics = physicsRef.current;
    const renderer = rendererRef.current;

    let isRunning = true;

    const loop = (timestamp: number) => {
      if (!isRunning) return;

      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Update physics simulation
      physics.update(dt);

      // Render scene
      renderer.render(ctx, physics, showTrajectory);

      // Sync React state when changes occur
      setStats({ ...physics.stats });
      setPlayState(physics.playState);

      // Check level cleared in Campaign / Endless
      if (physics.playState === 'CLEARED') {
        const levelId = gameMode === 'CAMPAIGN' ? CAMPAIGN_LEVELS[currentLevelIndex].id : `endless_${endlessWave}`;
        
        // Save score if beaten
        const currentBest = levelScores[levelId] || 0;
        if (physics.stats.score > currentBest) {
          const updatedScores = { ...levelScores, [levelId]: physics.stats.score };
          setLevelScores(updatedScores);
          localStorage.setItem('x9m8_scores', JSON.stringify(updatedScores));
        }

        // Save stars
        let stars = 1;
        if (physics.stats.ballsRemaining >= 3 || physics.stats.score >= 50000) stars = 2;
        if (physics.stats.ballsRemaining >= 5 && physics.stats.score >= 80000) stars = 3;
        const currentStarBest = levelStars[levelId] || 0;
        if (stars > currentStarBest) {
          const updatedStars = { ...levelStars, [levelId]: stars };
          setLevelStars(updatedStars);
          localStorage.setItem('x9m8_stars', JSON.stringify(updatedStars));
        }

        // Update endless high score
        if (gameMode === 'ENDLESS' && physics.stats.score > endlessHighScore) {
          setEndlessHighScore(physics.stats.score);
          localStorage.setItem('x9m8_endless_hs', String(physics.stats.score));
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showTrajectory, currentLevelIndex, gameMode, endlessWave, levelScores, levelStars, endlessHighScore]);

  // Canvas mouse/touch coordinate transformation
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 400, y: 500 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = physicsRef.current.width / rect.width;
    const scaleY = physicsRef.current.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Update launcher angle on pointer move
  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // If in sandbox mode and not testing, don't swivel launcher
    if (gameMode === 'SANDBOX' && !isSandboxTesting) return;

    const coords = getCanvasCoordinates(e);
    const physics = physicsRef.current;

    const dx = coords.x - physics.launcherX;
    const dy = coords.y - physics.launcherY;

    // Calculate angle from vertical down
    let angle = Math.atan2(dx, dy);
    // Clamp to -72 deg to +72 deg
    const maxAngle = (72 * Math.PI) / 180;
    angle = Math.max(-maxAngle, Math.min(maxAngle, angle));

    physics.launcherAngle = angle;
  }, [gameMode, isSandboxTesting, getCanvasCoordinates]);

  // Primary firing or sandbox placement action
  const handlePointerDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const physics = physicsRef.current;

    // If in Sandbox builder mode and not playtesting: place or erase entities!
    if (gameMode === 'SANDBOX' && !isSandboxTesting) {
      const coords = getCanvasCoordinates(e);
      // Ensure entity placed inside bounds
      if (coords.x > physics.leftWall + 20 && coords.x < physics.rightWall - 20 && coords.y > 140 && coords.y < 780) {
        soundEngine.playClick();
        if (sandboxTool === 'erase') {
          // Erase nearest peg or brick
          const updatedPegs = customLevel.pegs.filter(p => {
            const d = Math.hypot(p.x - coords.x, p.y - coords.y);
            return d > 30;
          });
          const updatedLevel = { ...customLevel, pegs: updatedPegs };
          setCustomLevel(updatedLevel);
          physics.loadLevel(updatedLevel);
        } else if (sandboxTool === 'brick') {
          const newBrick = { x: Math.round(coords.x), y: Math.round(coords.y), width: 90, height: 20, hp: 2 };
          const updatedLevel = { ...customLevel, bricks: [...(customLevel.bricks || []), newBrick] };
          setCustomLevel(updatedLevel);
          physics.loadLevel(updatedLevel);
        } else if (sandboxTool === 'gravity_well') {
          const newGw = { x: Math.round(coords.x), y: Math.round(coords.y), mass: 500, radius: 160 };
          const updatedLevel = { ...customLevel, gravityWells: [...(customLevel.gravityWells || []), newGw] };
          setCustomLevel(updatedLevel);
          physics.loadLevel(updatedLevel);
        } else {
          // Peg or Bumper or TNT
          const newPeg = { type: sandboxTool as PegType, x: Math.round(coords.x), y: Math.round(coords.y) };
          const updatedLevel: LevelConfig = { ...customLevel, pegs: [...customLevel.pegs, newPeg] };
          setCustomLevel(updatedLevel);
          physics.loadLevel(updatedLevel);
        }
      }
      return;
    }

    // Otherwise in active play: check cluster detonate or fire
    if (physics.playState === 'FIRING') {
      const detonated = physics.triggerBallAbility();
      if (detonated) return;
    }

    if (physics.playState === 'READY') {
      physics.selectedBallType = selectedBallType;
      physics.fireBall();
      setStats({ ...physics.stats });
      setPlayState(physics.playState);
    }
  }, [gameMode, isSandboxTesting, sandboxTool, customLevel, selectedBallType, getCanvasCoordinates]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const physics = physicsRef.current;

      if (e.code === 'Space') {
        e.preventDefault();
        if (physics.playState === 'FIRING') {
          physics.triggerBallAbility();
        } else if (physics.playState === 'READY') {
          physics.selectedBallType = selectedBallType;
          physics.fireBall();
          setStats({ ...physics.stats });
          setPlayState(physics.playState);
        }
      } else if (e.key === '1') {
        setSelectedBallType('standard');
        physics.selectedBallType = 'standard';
        soundEngine.playClick();
      } else if (e.key === '2') {
        setSelectedBallType('bomb');
        physics.selectedBallType = 'bomb';
        soundEngine.playClick();
      } else if (e.key === '3') {
        setSelectedBallType('meteor');
        physics.selectedBallType = 'meteor';
        soundEngine.playClick();
      } else if (e.key === '4') {
        setSelectedBallType('tesla');
        physics.selectedBallType = 'tesla';
        soundEngine.playClick();
      } else if (e.key === '5') {
        setSelectedBallType('splitter');
        physics.selectedBallType = 'splitter';
        soundEngine.playClick();
      } else if (e.key.toLowerCase() === 'r') {
        loadStage(currentLevelIndex, gameMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBallType, currentLevelIndex, gameMode, loadStage]);

  // Ball type selection handler
  const handleSelectBallType = (type: BallType) => {
    setSelectedBallType(type);
    physicsRef.current.selectedBallType = type;
  };

  // Check if detonatable bomb is currently active
  const hasActiveDetonatableBall = physicsRef.current.balls.some(
    b => b.canClusterDetonate && !b.isDetonated && !b.isDead
  );

  const activeLevelName = gameMode === 'CAMPAIGN'
    ? CAMPAIGN_LEVELS[currentLevelIndex].name
    : gameMode === 'ENDLESS'
    ? `Wave ${endlessWave}`
    : customLevel.name;

  const activeWorldName = gameMode === 'CAMPAIGN'
    ? CAMPAIGN_LEVELS[currentLevelIndex].worldName
    : gameMode === 'ENDLESS'
    ? 'Endless Cosmos'
    : 'Custom Sandbox';

  const currentLevelId = gameMode === 'CAMPAIGN'
    ? CAMPAIGN_LEVELS[currentLevelIndex].id
    : `endless_${endlessWave}`;

  const currentHighScore = gameMode === 'ENDLESS'
    ? endlessHighScore
    : (levelScores[currentLevelId] || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* Top Bar Header */}
      <Header
        currentMode={gameMode}
        onSelectMode={(mode) => {
          setGameMode(mode);
          setIsSandboxTesting(false);
          if (mode === 'ENDLESS') setEndlessWave(1);
        }}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        isMuted={isMuted}
        onToggleMute={() => {
          const newMute = !isMuted;
          soundEngine.setMuted(newMute);
          setIsMuted(newMute);
        }}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center gap-4">
        {/* HUD Controls */}
        <GameHUD
          levelName={activeLevelName}
          worldName={activeWorldName}
          stats={stats}
          highScore={currentHighScore}
          playState={playState}
          selectedBallType={selectedBallType}
          onSelectBallType={handleSelectBallType}
          showTrajectory={showTrajectory}
          onToggleTrajectory={() => setShowTrajectory(!showTrajectory)}
          onRestart={() => loadStage(currentLevelIndex, gameMode)}
          onFire={() => {
            const physics = physicsRef.current;
            physics.selectedBallType = selectedBallType;
            physics.fireBall();
          }}
          onTriggerAbility={() => {
            physicsRef.current.triggerBallAbility();
          }}
          hasActiveDetonatableBall={hasActiveDetonatableBall}
        />

        {/* Sandbox Builder Controls (when active) */}
        {gameMode === 'SANDBOX' && (
          <SandboxEditor
            currentLevel={customLevel}
            activeTool={sandboxTool}
            onSelectTool={setSandboxTool}
            onUpdateLevel={(lvl) => {
              setCustomLevel(lvl);
              physicsRef.current.loadLevel(lvl);
            }}
            onPlaytest={() => {
              setIsSandboxTesting(true);
              physicsRef.current.loadLevel(customLevel);
            }}
            onClear={() => {
              const emptyLevel = { ...customLevel, pegs: [], bricks: [], gravityWells: [] };
              setCustomLevel(emptyLevel);
              physicsRef.current.loadLevel(emptyLevel);
            }}
          />
        )}

        {/* The Game Canvas Arena */}
        <div className="relative w-full flex justify-center items-center">
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-sky-500/20 via-slate-800/60 to-purple-500/20 shadow-2xl shadow-sky-500/10 border border-slate-800/80">
            <canvas
              ref={canvasRef}
              width={800}
              height={950}
              onMouseMove={handlePointerMove}
              onTouchMove={handlePointerMove}
              onMouseDown={handlePointerDown}
              className="w-full max-w-[620px] h-auto aspect-[800/950] rounded-xl bg-slate-950 cursor-crosshair block shadow-inner"
            />
          </div>
        </div>

        {/* Quick Instructions Footer */}
        <div className="w-full max-w-xl text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
          <span>Aim: Mouse / Touch</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Launch: Click or Space</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Ball Select: 1–5 Keys</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Restart: R</span>
        </div>

        {/* Orbital Ricochet by x9m8.com Brand & Website Link */}
        <div className="w-full max-w-xl flex items-center justify-center gap-2 pt-1 pb-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Orbital Ricochet</span>
          <span className="text-slate-600">by</span>
          <a
            href="https://x9m8.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-4 decoration-sky-500/50 hover:decoration-sky-300"
            title="Visit x9m8.com"
          >
            <span>x9m8.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </main>

      {/* Victory / Extreme Fever Cleared Modal */}
      {playState === 'CLEARED' && (
        <VictoryModal
          levelName={activeLevelName}
          stats={stats}
          isLastLevel={gameMode === 'CAMPAIGN' && currentLevelIndex >= CAMPAIGN_LEVELS.length - 1}
          onNextLevel={() => {
            if (gameMode === 'CAMPAIGN') {
              setCurrentLevelIndex(prev => prev + 1);
            } else if (gameMode === 'ENDLESS') {
              setEndlessWave(prev => prev + 1);
            }
          }}
          onReplay={() => loadStage(currentLevelIndex, gameMode)}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
        />
      )}

      {/* Game Over / Out of Balls Modal */}
      {playState === 'FAILED' && (
        <GameOverModal
          levelName={activeLevelName}
          stats={stats}
          onRetry={() => loadStage(currentLevelIndex, gameMode)}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
        />
      )}

      {/* Level Selection Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          currentLevelIndex={currentLevelIndex}
          levelStars={levelStars}
          levelScores={levelScores}
          onSelectLevel={(idx) => {
            setCurrentLevelIndex(idx);
            setGameMode('CAMPAIGN');
          }}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}
