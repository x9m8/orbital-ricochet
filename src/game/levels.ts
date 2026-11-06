/**
 * Handcrafted Campaign Levels & Level Generation Helpers
 * Dimensions standardized to an internal coordinate space: 800 x 950
 */

import { LevelConfig } from './types';

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  // --- WORLD 1: NEON CITADEL ---
  {
    id: 'lvl_1',
    name: 'First Trajectory',
    world: 1,
    worldName: 'Neon Citadel',
    description: 'Learn the bounce! Hit all golden target orbs. Catch the ball in the bucket for a free shot!',
    initialBalls: 10,
    gravity: 0.22,
    pegs: [
      // Top arch
      { type: 'standard', x: 250, y: 180 },
      { type: 'target', x: 320, y: 150 },
      { type: 'standard', x: 400, y: 140 },
      { type: 'target', x: 480, y: 150 },
      { type: 'standard', x: 550, y: 180 },

      // Center cluster
      { type: 'bumper', x: 400, y: 260, radius: 24 },
      { type: 'target', x: 300, y: 280 },
      { type: 'standard', x: 350, y: 320 },
      { type: 'standard', x: 450, y: 320 },
      { type: 'target', x: 500, y: 280 },

      // Lower ring
      { type: 'standard', x: 220, y: 400 },
      { type: 'target', x: 280, y: 430 },
      { type: 'standard', x: 340, y: 460 },
      { type: 'target', x: 400, y: 480 },
      { type: 'standard', x: 460, y: 460 },
      { type: 'target', x: 520, y: 430 },
      { type: 'standard', x: 580, y: 400 },

      // Side bounce guides
      { type: 'standard', x: 160, y: 300 },
      { type: 'standard', x: 640, y: 300 },
    ]
  },
  {
    id: 'lvl_2',
    name: 'Pinball Cascade',
    world: 1,
    worldName: 'Neon Citadel',
    description: 'Heavy bumper alley! High-bounce springs launch your ball back up for massive combo streaks.',
    initialBalls: 9,
    gravity: 0.22,
    pegs: [
      // 3 High-energy bumpers
      { type: 'bumper', x: 260, y: 220, radius: 26 },
      { type: 'bumper', x: 540, y: 220, radius: 26 },
      { type: 'bumper', x: 400, y: 350, radius: 30 },

      // Surrounding target orbs
      { type: 'target', x: 260, y: 140 },
      { type: 'target', x: 540, y: 140 },
      { type: 'target', x: 400, y: 180 },
      { type: 'target', x: 190, y: 280 },
      { type: 'target', x: 610, y: 280 },
      { type: 'target', x: 330, y: 420 },
      { type: 'target', x: 470, y: 420 },

      // Field of score pegs
      { type: 'standard', x: 330, y: 200 },
      { type: 'standard', x: 470, y: 200 },
      { type: 'standard', x: 260, y: 310 },
      { type: 'standard', x: 540, y: 310 },
      { type: 'standard', x: 150, y: 380 },
      { type: 'standard', x: 650, y: 380 },
      { type: 'standard', x: 260, y: 480 },
      { type: 'standard', x: 400, y: 510 },
      { type: 'standard', x: 540, y: 480 },
      { type: 'tnt', x: 400, y: 270, radius: 18 }
    ]
  },
  {
    id: 'lvl_3',
    name: 'Tower of Brickton',
    world: 1,
    worldName: 'Neon Citadel',
    description: 'Destructible rectangular bricks form a fortified tower. Break through the ramparts!',
    initialBalls: 8,
    gravity: 0.23,
    pegs: [
      { type: 'target', x: 400, y: 280 },
      { type: 'target', x: 350, y: 350 },
      { type: 'target', x: 450, y: 350 },
      { type: 'target', x: 400, y: 420 },
      { type: 'target', x: 250, y: 380 },
      { type: 'target', x: 550, y: 380 },
      { type: 'tnt', x: 400, y: 350, radius: 20 },
      { type: 'standard', x: 180, y: 260 },
      { type: 'standard', x: 620, y: 260 },
      { type: 'standard', x: 200, y: 480 },
      { type: 'standard', x: 600, y: 480 }
    ],
    bricks: [
      // Top roof
      { x: 400, y: 190, width: 140, height: 22, angle: 0, hp: 2 },
      // Left and right pillared walls
      { x: 310, y: 270, width: 24, height: 120, angle: 0, hp: 2 },
      { x: 490, y: 270, width: 24, height: 120, angle: 0, hp: 2 },
      // Middle floor
      { x: 400, y: 330, width: 150, height: 20, angle: 0, hp: 1 },
      // Lower angled deflectors
      { x: 250, y: 440, width: 90, height: 18, angle: 0.35, hp: 2 },
      { x: 550, y: 440, width: 90, height: 18, angle: -0.35, hp: 2 }
    ]
  },
  {
    id: 'lvl_4',
    name: 'Chain Reaction Foundry',
    world: 1,
    worldName: 'Neon Citadel',
    description: 'TNT barrels cluster near high-density target matrices. One spark ignites the whole board!',
    initialBalls: 8,
    gravity: 0.22,
    pegs: [
      // 3 TNT core nodes
      { type: 'tnt', x: 280, y: 250, radius: 20 },
      { type: 'tnt', x: 520, y: 250, radius: 20 },
      { type: 'tnt', x: 400, y: 390, radius: 22 },

      // Targets tightly packed around TNT
      { type: 'target', x: 280, y: 200 },
      { type: 'target', x: 240, y: 250 },
      { type: 'target', x: 320, y: 250 },
      { type: 'target', x: 520, y: 200 },
      { type: 'target', x: 480, y: 250 },
      { type: 'target', x: 560, y: 250 },
      { type: 'target', x: 350, y: 390 },
      { type: 'target', x: 450, y: 390 },
      { type: 'target', x: 400, y: 440 },

      // Outer score pegs
      { type: 'standard', x: 180, y: 180 },
      { type: 'standard', x: 620, y: 180 },
      { type: 'standard', x: 200, y: 360 },
      { type: 'standard', x: 600, y: 360 },
      { type: 'standard', x: 280, y: 490 },
      { type: 'standard', x: 520, y: 490 },
      { type: 'bumper', x: 400, y: 220, radius: 24 }
    ]
  },

  // --- WORLD 2: COSMIC VORTEX ---
  {
    id: 'lvl_5',
    name: 'The Singularity Well',
    world: 2,
    worldName: 'Cosmic Vortex',
    description: 'A black hole in the center bends your trajectory. Slingshot your shots around the gravitational vortex!',
    initialBalls: 9,
    gravity: 0.18,
    gravityWells: [
      { x: 400, y: 320, mass: 680, radius: 190 }
    ],
    pegs: [
      // Orbiting target ring
      { type: 'target', x: 310, y: 240 },
      { type: 'target', x: 490, y: 240 },
      { type: 'target', x: 290, y: 320 },
      { type: 'target', x: 510, y: 320 },
      { type: 'target', x: 310, y: 400 },
      { type: 'target', x: 490, y: 400 },
      { type: 'target', x: 400, y: 190 },
      { type: 'target', x: 400, y: 450 },

      // Outer celestial pegs
      { type: 'bumper', x: 180, y: 320, radius: 24 },
      { type: 'bumper', x: 620, y: 320, radius: 24 },
      { type: 'standard', x: 220, y: 200 },
      { type: 'standard', x: 580, y: 200 },
      { type: 'standard', x: 220, y: 440 },
      { type: 'standard', x: 580, y: 440 },
      { type: 'standard', x: 400, y: 530 }
    ]
  },
  {
    id: 'lvl_6',
    name: 'Wormhole Nexus',
    world: 2,
    worldName: 'Cosmic Vortex',
    description: 'Quantum portals teleport incoming balls from lower traps right back to the top of the board!',
    initialBalls: 8,
    gravity: 0.22,
    portals: [
      { entryX: 200, entryY: 480, exitX: 600, exitY: 180 },
      { entryX: 600, entryY: 480, exitX: 200, exitY: 180 }
    ],
    pegs: [
      { type: 'target', x: 200, y: 240 },
      { type: 'target', x: 600, y: 240 },
      { type: 'target', x: 330, y: 300 },
      { type: 'target', x: 470, y: 300 },
      { type: 'target', x: 400, y: 220 },
      { type: 'target', x: 400, y: 380 },
      { type: 'target', x: 280, y: 420 },
      { type: 'target', x: 520, y: 420 },
      { type: 'bumper', x: 400, y: 300, radius: 26 },
      { type: 'standard', x: 260, y: 190 },
      { type: 'standard', x: 540, y: 190 },
      { type: 'standard', x: 330, y: 470 },
      { type: 'standard', x: 470, y: 470 }
    ]
  },
  {
    id: 'lvl_7',
    name: 'The Kinetic Pendulum',
    world: 2,
    worldName: 'Cosmic Vortex',
    description: 'A heavy mechanical kinetic bar swings horizontally across the central target vault. Time your fire!',
    initialBalls: 8,
    gravity: 0.22,
    movers: [
      { type: 'horizontal', x: 400, y: 260, width: 140, height: 22, range: 180, speed: 0.035 }
    ],
    pegs: [
      // Protected targets underneath the mover
      { type: 'target', x: 350, y: 330 },
      { type: 'target', x: 400, y: 330 },
      { type: 'target', x: 450, y: 330 },
      { type: 'target', x: 375, y: 380 },
      { type: 'target', x: 425, y: 380 },
      { type: 'tnt', x: 400, y: 430, radius: 22 },

      // Upper targets
      { type: 'target', x: 220, y: 180 },
      { type: 'target', x: 580, y: 180 },
      { type: 'bumper', x: 220, y: 350, radius: 24 },
      { type: 'bumper', x: 580, y: 350, radius: 24 },
      { type: 'standard', x: 300, y: 170 },
      { type: 'standard', x: 500, y: 170 },
      { type: 'standard', x: 280, y: 470 },
      { type: 'standard', x: 520, y: 470 }
    ]
  },
  {
    id: 'lvl_8',
    name: 'Twin Binary Pulsars',
    world: 2,
    worldName: 'Cosmic Vortex',
    description: 'Two opposing gravitational wells generate an intergalactic figure-eight slingshot!',
    initialBalls: 9,
    gravity: 0.16,
    gravityWells: [
      { x: 260, y: 320, mass: 540, radius: 170 },
      { x: 540, y: 320, mass: 540, radius: 170 }
    ],
    pegs: [
      // Center figure-8 targets
      { type: 'target', x: 400, y: 220 },
      { type: 'target', x: 400, y: 320 },
      { type: 'target', x: 400, y: 420 },
      { type: 'target', x: 260, y: 220 },
      { type: 'target', x: 260, y: 420 },
      { type: 'target', x: 540, y: 220 },
      { type: 'target', x: 540, y: 420 },
      { type: 'target', x: 160, y: 320 },
      { type: 'target', x: 640, y: 320 },

      // Bumper anchors
      { type: 'bumper', x: 400, y: 150, radius: 24 },
      { type: 'bumper', x: 400, y: 490, radius: 24 },
      { type: 'standard', x: 200, y: 230 },
      { type: 'standard', x: 600, y: 230 },
      { type: 'standard', x: 200, y: 410 },
      { type: 'standard', x: 600, y: 410 }
    ]
  },

  // --- WORLD 3: DEMOLITION FOUNDRY & BOSS SIEGE ---
  {
    id: 'lvl_9',
    name: 'Laser Bastion',
    world: 3,
    worldName: 'Demolition Foundry',
    description: 'Precision angled deflectors require trick bank shots to ricochet into buried targets.',
    initialBalls: 8,
    gravity: 0.22,
    pegs: [
      { type: 'target', x: 400, y: 220 },
      { type: 'target', x: 400, y: 300 },
      { type: 'target', x: 400, y: 380 },
      { type: 'target', x: 260, y: 260 },
      { type: 'target', x: 540, y: 260 },
      { type: 'target', x: 220, y: 400 },
      { type: 'target', x: 580, y: 400 },
      { type: 'tnt', x: 260, y: 330, radius: 20 },
      { type: 'tnt', x: 540, y: 330, radius: 20 }
    ],
    bricks: [
      // Angled funnel ramps
      { x: 300, y: 180, width: 110, height: 18, angle: -0.4, hp: 3 },
      { x: 500, y: 180, width: 110, height: 18, angle: 0.4, hp: 3 },
      { x: 320, y: 430, width: 100, height: 18, angle: 0.5, hp: 2 },
      { x: 480, y: 430, width: 100, height: 18, angle: -0.5, hp: 2 },
      // Side bumpers
      { x: 150, y: 300, width: 20, height: 130, angle: 0, hp: 3 },
      { x: 650, y: 300, width: 20, height: 130, angle: 0, hp: 3 }
    ]
  },
  {
    id: 'lvl_10',
    name: 'The Mega Colosseum',
    world: 3,
    worldName: 'Demolition Foundry',
    description: 'A stadium of multi-tiered bumpers and double TNT igniters. Achieve huge combo multipliers!',
    initialBalls: 9,
    gravity: 0.23,
    pegs: [
      // 4 Bumper corners
      { type: 'bumper', x: 220, y: 220, radius: 26 },
      { type: 'bumper', x: 580, y: 220, radius: 26 },
      { type: 'bumper', x: 220, y: 430, radius: 26 },
      { type: 'bumper', x: 580, y: 430, radius: 26 },

      // Ring of targets
      { type: 'target', x: 400, y: 180 },
      { type: 'target', x: 320, y: 250 },
      { type: 'target', x: 480, y: 250 },
      { type: 'target', x: 280, y: 330 },
      { type: 'target', x: 520, y: 330 },
      { type: 'target', x: 340, y: 400 },
      { type: 'target', x: 460, y: 400 },
      { type: 'target', x: 400, y: 470 },

      // Central TNT cross
      { type: 'tnt', x: 400, y: 325, radius: 22 },
      { type: 'standard', x: 350, y: 190 },
      { type: 'standard', x: 450, y: 190 },
      { type: 'standard', x: 220, y: 330 },
      { type: 'standard', x: 580, y: 330 },
      { type: 'standard', x: 350, y: 460 },
      { type: 'standard', x: 450, y: 460 }
    ]
  },
  {
    id: 'lvl_11',
    name: 'Dual Orbital Blades',
    world: 3,
    worldName: 'Demolition Foundry',
    description: 'Two rotating mechanical blades create timed windows of opportunity. Aim between the spinning spokes!',
    initialBalls: 8,
    gravity: 0.22,
    movers: [
      { type: 'rotator', x: 280, y: 300, width: 120, height: 18, range: 0, speed: 0.03 },
      { type: 'rotator', x: 520, y: 300, width: 120, height: 18, range: 0, speed: -0.03 }
    ],
    pegs: [
      { type: 'target', x: 280, y: 190 },
      { type: 'target', x: 520, y: 190 },
      { type: 'target', x: 400, y: 230 },
      { type: 'target', x: 400, y: 300 },
      { type: 'target', x: 400, y: 370 },
      { type: 'target', x: 280, y: 410 },
      { type: 'target', x: 520, y: 410 },
      { type: 'target', x: 170, y: 300 },
      { type: 'target', x: 630, y: 300 },
      { type: 'bumper', x: 400, y: 150, radius: 24 },
      { type: 'bumper', x: 400, y: 450, radius: 24 },
      { type: 'tnt', x: 400, y: 300, radius: 20 }
    ]
  },
  {
    id: 'lvl_12',
    name: 'Boss: The Aegis Core',
    world: 3,
    worldName: 'Demolition Foundry',
    description: 'FINAL SHOWDOWN! The Aegis Core rotates shielding plates with synchronized gravity fields. Destroy the Core!',
    initialBalls: 10,
    gravity: 0.21,
    gravityWells: [
      { x: 400, y: 330, mass: 450, radius: 150 }
    ],
    movers: [
      { type: 'horizontal', x: 400, y: 200, width: 130, height: 20, range: 140, speed: 0.035 },
      { type: 'rotator', x: 400, y: 330, width: 180, height: 20, range: 0, speed: 0.025 }
    ],
    pegs: [
      // Core target cluster
      { type: 'target', x: 400, y: 330, radius: 20 },
      { type: 'target', x: 350, y: 280 },
      { type: 'target', x: 450, y: 280 },
      { type: 'target', x: 350, y: 380 },
      { type: 'target', x: 450, y: 380 },
      { type: 'target', x: 280, y: 330 },
      { type: 'target', x: 520, y: 330 },
      { type: 'target', x: 400, y: 250 },
      { type: 'target', x: 400, y: 410 },

      // Bumper defenses
      { type: 'bumper', x: 220, y: 200, radius: 26 },
      { type: 'bumper', x: 580, y: 200, radius: 26 },
      { type: 'bumper', x: 220, y: 460, radius: 26 },
      { type: 'bumper', x: 580, y: 460, radius: 26 },

      // TNT explosive breach points
      { type: 'tnt', x: 300, y: 440, radius: 20 },
      { type: 'tnt', x: 500, y: 440, radius: 20 }
    ],
    bricks: [
      { x: 400, y: 140, width: 160, height: 18, angle: 0, hp: 3 },
      { x: 230, y: 330, width: 18, height: 120, angle: 0, hp: 2 },
      { x: 570, y: 330, width: 18, height: 120, angle: 0, hp: 2 }
    ]
  }
];

/**
 * Generate procedural Endless Wave board
 */
export function generateEndlessWave(waveNumber: number): LevelConfig {
  const targetCount = 6 + Math.min(10, Math.floor(waveNumber * 1.2));
  const standardCount = 14 + Math.min(16, waveNumber * 2);
  const tntCount = Math.min(3, 1 + Math.floor(waveNumber / 3));
  const bumperCount = Math.min(4, 1 + Math.floor(waveNumber / 2));

  const pegs: LevelConfig['pegs'] = [];
  const occupied = new Set<string>();

  const getGridKey = (x: number, y: number) => `${Math.round(x / 45)}_${Math.round(y / 45)}`;

  // Populate pegs in rows from y=160 to y=520
  const tryAddPeg = (type: 'standard' | 'target' | 'bumper' | 'tnt', x: number, y: number, radius?: number) => {
    const key = getGridKey(x, y);
    if (!occupied.has(key)) {
      occupied.add(key);
      pegs.push({ type, x, y, radius });
      return true;
    }
    return false;
  };

  // Add target pegs
  let placedTargets = 0;
  let attempts = 0;
  while (placedTargets < targetCount && attempts < 200) {
    attempts++;
    const x = 180 + Math.floor(Math.random() * 10) * 45;
    const y = 170 + Math.floor(Math.random() * 8) * 45;
    if (tryAddPeg('target', x, y)) {
      placedTargets++;
    }
  }

  // Add TNT
  for (let i = 0; i < tntCount; i++) {
    const x = 200 + Math.floor(Math.random() * 9) * 45;
    const y = 200 + Math.floor(Math.random() * 7) * 45;
    tryAddPeg('tnt', x, y, 20);
  }

  // Add Bumpers
  for (let i = 0; i < bumperCount; i++) {
    const x = 200 + Math.floor(Math.random() * 9) * 45;
    const y = 200 + Math.floor(Math.random() * 7) * 45;
    tryAddPeg('bumper', x, y, 26);
  }

  // Add standard score pegs
  for (let i = 0; i < standardCount; i++) {
    const x = 160 + Math.floor(Math.random() * 11) * 45;
    const y = 160 + Math.floor(Math.random() * 9) * 45;
    tryAddPeg('standard', x, y);
  }

  return {
    id: `endless_wave_${waveNumber}`,
    name: `Wave ${waveNumber}`,
    world: 0,
    worldName: 'Endless Cosmos',
    description: `Survive wave ${waveNumber}! Clear all target orbs before running out of shots.`,
    initialBalls: Math.max(5, 10 - Math.floor(waveNumber / 3)),
    gravity: 0.22 + Math.min(0.08, waveNumber * 0.008),
    pegs
  };
}
