/**
 * Types & Data Models for Orbital Ricochet: Arcade Deluxe
 */

export type BallType = 'standard' | 'bomb' | 'meteor' | 'tesla' | 'splitter';

export interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  restitution: number;
  type: BallType;
  color: string;
  glowColor: string;
  trail: { x: number; y: number; alpha: number }[];
  isDetonated?: boolean;
  hitCount: number;
  isDead: boolean;
  canClusterDetonate?: boolean;
}

export type PegType =
  | 'standard'       // blue crystal peg
  | 'target'         // orange fever target
  | 'bumper'         // pinball round bumper
  | 'tnt';           // explosive barrel

export interface BaseEntity {
  id: string;
  x: number;
  y: number;
}

export interface Peg extends BaseEntity {
  type: PegType;
  radius: number;
  hit: boolean;          // Hit this turn, awaiting removal at end of shot or glowing
  hp: number;           // For multi-hit bricks/pegs
  maxHp: number;
  scoreValue: number;
  pulseTimer: number;   // Visual animation state
  portalTargetId?: string;
}

export interface Brick extends BaseEntity {
  id: string;
  width: number;
  height: number;
  angle: number;        // Radians
  hp: number;
  maxHp: number;
  isTarget?: boolean;
  isInvulnerable?: boolean;
  hit: boolean;
  color?: string;
}

export interface GravityWell extends BaseEntity {
  id: string;
  mass: number;         // Positive for pull, negative for push
  radius: number;       // Effect radius
  pulseAngle: number;
}

export interface PortalPair {
  id: string;
  entry: { x: number; y: number; radius: number; color: string };
  exit: { x: number; y: number; radius: number; color: string };
  cooldownFrames: number; // Prevent immediate re-teleport loop
}

export interface MovingObstacle {
  id: string;
  type: 'horizontal' | 'vertical' | 'rotator' | 'pendulum';
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  width: number;
  height: number;
  angle: number;
  angularVelocity: number;
  range: number;
  speed: number;
  time: number;
  isBumper?: boolean;
}

export interface CatcherBasket {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  speed: number;
  minX: number;
  maxX: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  gravity?: number;
  sparkle?: boolean;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  scale: number;
  fontWeight?: string;
}

export interface LevelConfig {
  id: string;
  name: string;
  world: number;
  worldName: string;
  description: string;
  targetCountToWin?: number;
  initialBalls: number;
  gravity: number;
  pegs: {
    type: PegType;
    x: number;
    y: number;
    radius?: number;
    hp?: number;
  }[];
  bricks?: {
    x: number;
    y: number;
    width: number;
    height: number;
    angle?: number;
    hp?: number;
    isTarget?: boolean;
    isInvulnerable?: boolean;
  }[];
  gravityWells?: {
    x: number;
    y: number;
    mass?: number;
    radius?: number;
  }[];
  portals?: {
    entryX: number;
    entryY: number;
    exitX: number;
    exitY: number;
  }[];
  movers?: {
    type: 'horizontal' | 'vertical' | 'rotator' | 'pendulum';
    x: number;
    y: number;
    width: number;
    height: number;
    range: number;
    speed: number;
  }[];
}

export type GameMode = 'CAMPAIGN' | 'ENDLESS' | 'SANDBOX';

export type PlayState = 
  | 'READY'         // Aiming launcher
  | 'FIRING'        // Ball(s) in active flight
  | 'FEVER'         // Extreme fever slow-mo finale
  | 'CLEARED'       // Stage won
  | 'FAILED'        // Out of balls and remaining targets
  | 'PAUSED';

export interface GameStats {
  score: number;
  comboHits: number;
  maxCombo: number;
  targetsRemaining: number;
  totalTargets: number;
  ballsRemaining: number;
  ballsLaunched: number;
  freeBallsEarned: number;
  currentMultiplier: number;
}
