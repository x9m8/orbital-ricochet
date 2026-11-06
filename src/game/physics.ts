/**
 * High-Precision 2D Physics & Collision Simulation Engine for Orbital Ricochet
 * Standard logical resolution: 800 x 950
 */

import {
  Ball,
  Peg,
  Brick,
  GravityWell,
  PortalPair,
  MovingObstacle,
  CatcherBasket,
  BallType,
  LevelConfig,
  PlayState,
  GameStats
} from './types';
import { ParticleSystem } from './particles';
import { soundEngine } from './audio';

export interface TrajectoryPoint {
  x: number;
  y: number;
  isBounce?: boolean;
}

export class PhysicsEngine {
  public width = 800;
  public height = 950;
  public leftWall = 90;
  public rightWall = 710;
  public ceiling = 70;
  public floor = 930;

  public balls: Ball[] = [];
  public pegs: Peg[] = [];
  public bricks: Brick[] = [];
  public gravityWells: GravityWell[] = [];
  public portals: PortalPair[] = [];
  public movers: MovingObstacle[] = [];
  public catcher: CatcherBasket = {
    x: 400,
    y: 890,
    width: 120,
    height: 24,
    vx: 140,
    speed: 140,
    minX: 180,
    maxX: 620
  };

  public particles: ParticleSystem = new ParticleSystem();

  // Launcher state
  public launcherX = 400;
  public launcherY = 75;
  public launcherAngle = 0; // 0 is straight down, positive is right, negative is left
  public launcherPower = 580; // Launch initial speed
  public selectedBallType: BallType = 'standard';

  // Game flow & stats
  public playState: PlayState = 'READY';
  public gravity = 0.22;
  public globalTimeScale = 1.0;
  public feverTriggered = false;
  public feverBonusTriggered = false;
  public cameraShake = 0;

  public stats: GameStats = {
    score: 0,
    comboHits: 0,
    maxCombo: 0,
    targetsRemaining: 0,
    totalTargets: 0,
    ballsRemaining: 10,
    ballsLaunched: 0,
    freeBallsEarned: 0,
    currentMultiplier: 1
  };

  // High score cups for Fever mode: [x, scoreValue, label]
  public bonusCups = [
    { x: 150, score: 10000, label: '10K', color: '#38bdf8' },
    { x: 275, score: 25000, label: '25K', color: '#a855f7' },
    { x: 400, score: 100000, label: '100K', color: '#f59e0b' },
    { x: 525, score: 25000, label: '25K', color: '#a855f7' },
    { x: 650, score: 10000, label: '10K', color: '#38bdf8' }
  ];

  constructor() {
    this.resetStats();
  }

  public resetStats() {
    this.stats = {
      score: 0,
      comboHits: 0,
      maxCombo: 0,
      targetsRemaining: 0,
      totalTargets: 0,
      ballsRemaining: 10,
      ballsLaunched: 0,
      freeBallsEarned: 0,
      currentMultiplier: 1
    };
    this.balls = [];
    this.particles.clear();
    this.playState = 'READY';
    this.feverTriggered = false;
    this.feverBonusTriggered = false;
    this.globalTimeScale = 1.0;
    this.cameraShake = 0;
  }

  /**
   * Load and initialize level structures
   */
  public loadLevel(config: LevelConfig, keepScore: boolean = false) {
    if (!keepScore) {
      this.resetStats();
      this.stats.ballsRemaining = config.initialBalls;
    } else {
      this.balls = [];
      this.particles.clear();
      this.playState = 'READY';
      this.feverTriggered = false;
      this.feverBonusTriggered = false;
      this.globalTimeScale = 1.0;
    }

    this.gravity = config.gravity;
    this.pegs = [];
    this.bricks = [];
    this.gravityWells = [];
    this.portals = [];
    this.movers = [];

    // Load pegs
    let targets = 0;
    config.pegs.forEach((p, idx) => {
      const radius = p.radius || (p.type === 'bumper' ? 24 : p.type === 'tnt' ? 20 : 13);
      const isTarget = p.type === 'target';
      if (isTarget) targets++;

      this.pegs.push({
        id: `peg_${idx}_${Date.now()}`,
        type: p.type,
        x: p.x,
        y: p.y,
        radius,
        hit: false,
        hp: p.hp || 1,
        maxHp: p.hp || 1,
        scoreValue: p.type === 'target' ? 500 : p.type === 'bumper' ? 250 : p.type === 'tnt' ? 300 : 100,
        pulseTimer: Math.random() * Math.PI * 2
      });
    });

    this.stats.targetsRemaining = targets;
    this.stats.totalTargets = targets;

    // Load bricks
    if (config.bricks) {
      config.bricks.forEach((b, idx) => {
        this.bricks.push({
          id: `brick_${idx}`,
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          angle: b.angle || 0,
          hp: b.hp || 2,
          maxHp: b.hp || 2,
          isTarget: b.isTarget || false,
          isInvulnerable: b.isInvulnerable || false,
          hit: false
        });
        if (b.isTarget) {
          this.stats.targetsRemaining++;
          this.stats.totalTargets++;
        }
      });
    }

    // Load gravity wells
    if (config.gravityWells) {
      config.gravityWells.forEach((gw, idx) => {
        this.gravityWells.push({
          id: `gw_${idx}`,
          x: gw.x,
          y: gw.y,
          mass: gw.mass || 500,
          radius: gw.radius || 180,
          pulseAngle: 0
        });
      });
    }

    // Load portals
    if (config.portals) {
      config.portals.forEach((pt, idx) => {
        this.portals.push({
          id: `portal_${idx}`,
          entry: { x: pt.entryX, y: pt.entryY, radius: 22, color: '#38bdf8' },
          exit: { x: pt.exitX, y: pt.exitY, radius: 22, color: '#ec4899' },
          cooldownFrames: 0
        });
      });
    }

    // Load kinetic movers
    if (config.movers) {
      config.movers.forEach((m, idx) => {
        this.movers.push({
          id: `mover_${idx}`,
          type: m.type,
          x: m.x,
          y: m.y,
          baseX: m.x,
          baseY: m.y,
          width: m.width,
          height: m.height,
          angle: 0,
          angularVelocity: m.type === 'rotator' ? m.speed : 0,
          range: m.range,
          speed: m.speed,
          time: 0
        });
      });
    }
  }

  /**
   * Fire a ball from the launcher
   */
  public fireBall(): boolean {
    if (this.playState !== 'READY' && this.playState !== 'FIRING') return false;
    if (this.stats.ballsRemaining <= 0) return false;

    const angle = this.launcherAngle;
    const speed = this.launcherPower;
    const vx = Math.sin(angle) * speed;
    const vy = Math.cos(angle) * speed;

    const ballProps = this.getBallProperties(this.selectedBallType);

    const newBall: Ball = {
      id: `ball_${Date.now()}_${Math.random()}`,
      x: this.launcherX + Math.sin(angle) * 35,
      y: this.launcherY + Math.cos(angle) * 35,
      vx,
      vy,
      radius: ballProps.radius,
      mass: ballProps.mass,
      restitution: ballProps.restitution,
      type: this.selectedBallType,
      color: ballProps.color,
      glowColor: ballProps.glowColor,
      trail: [],
      hitCount: 0,
      isDead: false,
      canClusterDetonate: this.selectedBallType === 'bomb'
    };

    this.balls.push(newBall);
    this.stats.ballsRemaining--;
    this.stats.ballsLaunched++;
    this.playState = 'FIRING';

    soundEngine.playLaunch(1.0);
    this.cameraShake = Math.max(this.cameraShake, 3);

    // Initial muzzle spark
    this.particles.addPegHitSparks(newBall.x, newBall.y, newBall.color, 8);

    return true;
  }

  /**
   * Secondary trigger action (e.g. cluster bomb detonation while in flight)
   */
  public triggerBallAbility(): boolean {
    let detonated = false;
    for (const ball of this.balls) {
      if (ball.canClusterDetonate && !ball.isDetonated && !ball.isDead) {
        ball.isDetonated = true;
        detonated = true;

        soundEngine.playExplosion();
        this.cameraShake = Math.max(this.cameraShake, 14);
        this.particles.addExplosion(ball.x, ball.y, 80);

        // Spawn 4 bouncy cluster fragments
        const angles = [-0.6, -0.2, 0.2, 0.6];
        angles.forEach(offsetAngle => {
          const fragSpeed = 350 + Math.random() * 80;
          const currentHeading = Math.atan2(ball.vy, ball.vx);
          const launchAngle = currentHeading + offsetAngle;

          this.balls.push({
            id: `frag_${Date.now()}_${Math.random()}`,
            x: ball.x,
            y: ball.y,
            vx: Math.cos(launchAngle) * fragSpeed,
            vy: Math.sin(launchAngle) * fragSpeed,
            radius: 7,
            mass: 0.6,
            restitution: 0.88,
            type: 'standard',
            color: '#fbbf24',
            glowColor: '#f59e0b',
            trail: [],
            hitCount: ball.hitCount,
            isDead: false
          });
        });

        // Kill parent ball
        ball.isDead = true;
      }
    }
    return detonated;
  }

  private getBallProperties(type: BallType) {
    switch (type) {
      case 'bomb':
        return { radius: 11, mass: 1.2, restitution: 0.82, color: '#f97316', glowColor: '#ea580c' };
      case 'meteor':
        return { radius: 14, mass: 3.5, restitution: 0.65, color: '#e11d48', glowColor: '#be123c' };
      case 'tesla':
        return { radius: 10, mass: 0.9, restitution: 0.85, color: '#06b6d4', glowColor: '#0891b2' };
      case 'splitter':
        return { radius: 10, mass: 0.95, restitution: 0.84, color: '#a855f7', glowColor: '#9333ea' };
      case 'standard':
      default:
        return { radius: 10, mass: 1.0, restitution: 0.84, color: '#38bdf8', glowColor: '#0284c7' };
    }
  }

  /**
   * Main game loop physics tick
   * @param dt Delta time in seconds
   */
  public update(dt: number) {
    if (this.playState === 'PAUSED' || this.playState === 'CLEARED' || this.playState === 'FAILED') {
      return;
    }

    // Time scale for extreme fever slow-mo
    const effectiveDt = Math.min(0.04, dt) * this.globalTimeScale;
    const substeps = 3;
    const subDt = effectiveDt / substeps;

    // Decay camera shake
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 25);
    }

    // Update kinetic movers
    this.updateMovers(effectiveDt);

    // Update bottom catcher basket
    this.updateCatcher(effectiveDt);

    // Multi-step physics simulation
    for (let step = 0; step < substeps; step++) {
      this.simulateSubstep(subDt);
    }

    // Update visual particle effects
    this.particles.update(effectiveDt * 60);

    // If in Fever mode, spawn continuous celebration sparkles
    if (this.feverTriggered) {
      this.particles.addFeverSparks(this.width, this.height);
    }

    // Cleanup dead balls and check round conclusion
    this.postUpdateCheck();
  }

  private updateMovers(dt: number) {
    for (const m of this.movers) {
      m.time += dt * m.speed * 60;
      if (m.type === 'horizontal') {
        m.x = m.baseX + Math.sin(m.time) * m.range;
      } else if (m.type === 'vertical') {
        m.y = m.baseY + Math.sin(m.time) * m.range;
      } else if (m.type === 'rotator') {
        m.angle += m.angularVelocity * dt * 60;
      } else if (m.type === 'pendulum') {
        m.angle = Math.sin(m.time) * (Math.PI / 4);
      }
    }

    // Portal cooldowns
    for (const p of this.portals) {
      if (p.cooldownFrames > 0) p.cooldownFrames--;
    }
  }

  private updateCatcher(dt: number) {
    this.catcher.x += this.catcher.vx * dt;
    if (this.catcher.x <= this.catcher.minX) {
      this.catcher.x = this.catcher.minX;
      this.catcher.vx = Math.abs(this.catcher.speed);
    } else if (this.catcher.x >= this.catcher.maxX) {
      this.catcher.x = this.catcher.maxX;
      this.catcher.vx = -Math.abs(this.catcher.speed);
    }
  }

  private simulateSubstep(dt: number) {
    const gravityAccel = this.gravity * 980; // px/s^2

    for (let bIdx = this.balls.length - 1; bIdx >= 0; bIdx--) {
      const ball = this.balls[bIdx];
      if (ball.isDead) continue;

      // Apply Gravity
      ball.vy += gravityAccel * dt;

      // Apply Gravity Wells
      for (const gw of this.gravityWells) {
        const dx = gw.x - ball.x;
        const dy = gw.y - ball.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist > 15 && dist < gw.radius) {
          const force = (gw.mass * 850) / (distSq + 600);
          ball.vx += (dx / dist) * force * dt;
          ball.vy += (dy / dist) * force * dt;
        }
      }

      // Air resistance / terminal velocity clamp
      ball.vx *= 0.9995;
      ball.vy *= 0.9995;
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (speed > 1400) {
        ball.vx = (ball.vx / speed) * 1400;
        ball.vy = (ball.vy / speed) * 1400;
      }

      // Integrate position
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Add to motion blur trail
      if (ball.trail.length > 8) ball.trail.shift();
      ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.65 });

      // Wall collisions
      if (ball.x - ball.radius < this.leftWall) {
        ball.x = this.leftWall + ball.radius;
        ball.vx = -ball.vx * ball.restitution;
        this.particles.addPegHitSparks(ball.x, ball.y, ball.color, 4);
      } else if (ball.x + ball.radius > this.rightWall) {
        ball.x = this.rightWall - ball.radius;
        ball.vx = -ball.vx * ball.restitution;
        this.particles.addPegHitSparks(ball.x, ball.y, ball.color, 4);
      }

      if (ball.y - ball.radius < this.ceiling) {
        ball.y = this.ceiling + ball.radius;
        ball.vy = -ball.vy * ball.restitution;
      }

      // Collisions with Pegs
      this.checkPegCollisions(ball);

      // Collisions with Bricks
      this.checkBrickCollisions(ball);

      // Collisions with Portals
      this.checkPortalCollisions(ball);

      // Collisions with Kinetic Movers
      this.checkMoverCollisions(ball);

      // Collisions with Catcher Basket
      this.checkCatcherCollision(ball);

      // Fever Bonus Cups Collision
      if (this.feverTriggered) {
        this.checkFeverBonusCups(ball);
      }

      // Check Floor Drain
      if (ball.y > this.floor + 40) {
        ball.isDead = true;
      }
    }
  }

  private checkPegCollisions(ball: Ball) {
    for (const peg of this.pegs) {
      if (peg.hp <= 0) continue;

      const dx = ball.x - peg.x;
      const dy = ball.y - peg.y;
      const distSq = dx * dx + dy * dy;
      const minDist = ball.radius + peg.radius;

      if (distSq < minDist * minDist) {
        const dist = Math.max(0.1, Math.sqrt(distSq));
        const nx = dx / dist;
        const ny = dy / dist;

        // Separate bodies
        const overlap = minDist - dist;
        ball.x += nx * overlap;
        ball.y += ny * overlap;

        // Velocity along collision normal
        const kx = ball.vx;
        const ky = ball.vy;
        const p = 2 * (nx * kx + ny * ky) / (ball.mass + 1.0);

        // Bumper has high restitution + extra impulse kick
        const bounceRestitution = peg.type === 'bumper' ? 1.35 : ball.restitution;
        ball.vx = (kx - p * nx) * bounceRestitution;
        ball.vy = (ky - p * ny) * bounceRestitution;

        if (peg.type === 'bumper') {
          ball.vx += nx * 220;
          ball.vy += ny * 220;
          this.cameraShake = Math.max(this.cameraShake, 6);
          soundEngine.playBumper();
          this.particles.addBumperShockwave(peg.x, peg.y);
        }

        // Handle hit state & scoring
        this.handlePegHit(ball, peg);
      }
    }
  }

  private handlePegHit(ball: Ball, peg: Peg) {
    ball.hitCount++;
    this.stats.comboHits++;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.comboHits);

    // Multiplier increases every 5 combo hits in a single shot
    this.stats.currentMultiplier = 1 + Math.floor(this.stats.comboHits / 5);

    const hitScore = peg.scoreValue * this.stats.currentMultiplier;
    this.stats.score += hitScore;

    // Visual sparks & sounds
    const isTarget = peg.type === 'target';
    const hitColor = isTarget ? '#f59e0b' : peg.type === 'bumper' ? '#38bdf8' : peg.type === 'tnt' ? '#ef4444' : '#38bdf8';
    
    this.particles.addPegHitSparks(peg.x, peg.y, hitColor, isTarget ? 18 : 10);
    this.particles.addScorePopup(peg.x, peg.y, `+${hitScore}`, hitColor, isTarget ? 1.25 : 1.0);

    if (peg.type !== 'bumper') {
      soundEngine.playPegHit(this.stats.comboHits, isTarget);
    }

    // Damage peg
    const damage = ball.type === 'meteor' ? 3 : 1;
    peg.hp -= damage;
    peg.hit = true;

    // Check TNT blast
    if (peg.type === 'tnt' && peg.hp <= 0) {
      this.detonateTNT(peg.x, peg.y, 110);
    }

    // Tesla chain lightning effect
    if (ball.type === 'tesla') {
      this.triggerTeslaLightning(peg.x, peg.y);
    }

    // Splitter ball trigger on first hit
    if (ball.type === 'splitter' && !ball.isDetonated) {
      ball.isDetonated = true;
      this.triggerSplitterBall(ball);
    }

    // Check if target was destroyed
    if (isTarget && peg.hp <= 0) {
      this.stats.targetsRemaining--;

      // Check for EXTREME FEVER!
      if (this.stats.targetsRemaining <= 0 && !this.feverTriggered) {
        this.triggerExtremeFever();
      }
    }
  }

  private triggerTeslaLightning(sourceX: number, sourceY: number) {
    soundEngine.playTeslaZap();
    let targetsHit = 0;

    for (const peg of this.pegs) {
      if (peg.hp <= 0 || targetsHit >= 3) continue;
      const dx = peg.x - sourceX;
      const dy = peg.y - sourceY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 5 && dist < 170) {
        targetsHit++;
        this.particles.addLightning(sourceX, sourceY, peg.x, peg.y);
        peg.hp--;
        peg.hit = true;
        const zapScore = 150 * this.stats.currentMultiplier;
        this.stats.score += zapScore;
        this.particles.addScorePopup(peg.x, peg.y, `+${zapScore}`, '#38bdf8', 0.9);

        if (peg.type === 'target' && peg.hp <= 0) {
          this.stats.targetsRemaining--;
          if (this.stats.targetsRemaining <= 0 && !this.feverTriggered) {
            this.triggerExtremeFever();
          }
        }
      }
    }
  }

  private triggerSplitterBall(ball: Ball) {
    soundEngine.playSplitter();
    this.particles.addBumperShockwave(ball.x, ball.y, '#a855f7');

    // Spawn 2 split companion balls
    const currentHeading = Math.atan2(ball.vy, ball.vx);
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

    [-0.35, 0.35].forEach(offset => {
      const angle = currentHeading + offset;
      this.balls.push({
        id: `split_${Date.now()}_${Math.random()}`,
        x: ball.x,
        y: ball.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 9,
        mass: 0.85,
        restitution: 0.86,
        type: 'standard',
        color: '#c084fc',
        glowColor: '#a855f7',
        trail: [],
        hitCount: ball.hitCount,
        isDead: false
      });
    });
  }

  private detonateTNT(x: number, y: number, radius: number) {
    soundEngine.playExplosion();
    this.cameraShake = Math.max(this.cameraShake, 16);
    this.particles.addExplosion(x, y, radius);

    // Destroy/damage surrounding pegs
    for (const peg of this.pegs) {
      if (peg.hp <= 0) continue;
      const dx = peg.x - x;
      const dy = peg.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        peg.hp -= 3;
        peg.hit = true;
        this.stats.score += 300 * this.stats.currentMultiplier;
        this.particles.addScorePopup(peg.x, peg.y, `BOOM!`, '#f97316', 1.1);

        if (peg.type === 'target' && peg.hp <= 0) {
          this.stats.targetsRemaining--;
          if (this.stats.targetsRemaining <= 0 && !this.feverTriggered) {
            this.triggerExtremeFever();
          }
        }
      }
    }

    // Push away active balls
    for (const b of this.balls) {
      const dx = b.x - x;
      const dy = b.y - y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      if (dist < radius * 1.5) {
        const force = (1 - dist / (radius * 1.5)) * 600;
        b.vx += (dx / dist) * force;
        b.vy += (dy / dist) * force;
      }
    }
  }

  private checkBrickCollisions(ball: Ball) {
    for (const brick of this.bricks) {
      if (brick.hp <= 0) continue;

      // Transform ball into brick's local unrotated coordinate space
      const cosA = Math.cos(-brick.angle);
      const sinA = Math.sin(-brick.angle);
      const localX = cosA * (ball.x - brick.x) - sinA * (ball.y - brick.y);
      const localY = sinA * (ball.x - brick.x) + cosA * (ball.y - brick.y);

      const halfW = brick.width / 2;
      const halfH = brick.height / 2;

      // Find closest point on local box
      const clampedX = Math.max(-halfW, Math.min(halfW, localX));
      const clampedY = Math.max(-halfH, Math.min(halfH, localY));

      const dx = localX - clampedX;
      const dy = localY - clampedY;
      const distSq = dx * dx + dy * dy;

      if (distSq < ball.radius * ball.radius) {
        const dist = Math.max(0.01, Math.sqrt(distSq));
        const localNx = dx / dist;
        const localNy = dy / dist;

        // Transform normal back to world space
        const worldNx = Math.cos(brick.angle) * localNx - Math.sin(brick.angle) * localNy;
        const worldNy = Math.sin(brick.angle) * localNx + Math.cos(brick.angle) * localNy;

        // Separate ball
        const overlap = ball.radius - dist;
        ball.x += worldNx * overlap;
        ball.y += worldNy * overlap;

        // Reflect velocity
        const dot = ball.vx * worldNx + ball.vy * worldNy;
        if (dot < 0) {
          ball.vx -= 2 * dot * worldNx * ball.restitution;
          ball.vy -= 2 * dot * worldNy * ball.restitution;
        }

        // Damage brick if destructible
        if (!brick.isInvulnerable) {
          const dmg = ball.type === 'meteor' ? 3 : 1;
          brick.hp -= dmg;
          brick.hit = true;
          this.stats.comboHits++;
          const score = 150 * this.stats.currentMultiplier;
          this.stats.score += score;
          soundEngine.playPegHit(this.stats.comboHits, brick.isTarget);
          this.particles.addPegHitSparks(ball.x, ball.y, brick.isTarget ? '#f59e0b' : '#94a3b8', 8);

          if (brick.isTarget && brick.hp <= 0) {
            this.stats.targetsRemaining--;
            if (this.stats.targetsRemaining <= 0 && !this.feverTriggered) {
              this.triggerExtremeFever();
            }
          }
        }
      }
    }
  }

  private checkPortalCollisions(ball: Ball) {
    for (const portal of this.portals) {
      if (portal.cooldownFrames > 0) continue;

      // Entry test
      const dx1 = ball.x - portal.entry.x;
      const dy1 = ball.y - portal.entry.y;
      if (dx1 * dx1 + dy1 * dy1 < portal.entry.radius * portal.entry.radius) {
        soundEngine.playVortex();
        this.particles.addBumperShockwave(portal.entry.x, portal.entry.y, portal.entry.color);
        this.particles.addBumperShockwave(portal.exit.x, portal.exit.y, portal.exit.color);
        ball.x = portal.exit.x;
        ball.y = portal.exit.y + 15;
        ball.vy = Math.abs(ball.vy); // Push down through exit
        portal.cooldownFrames = 30;
        return;
      }

      // Exit test
      const dx2 = ball.x - portal.exit.x;
      const dy2 = ball.y - portal.exit.y;
      if (dx2 * dx2 + dy2 * dy2 < portal.exit.radius * portal.exit.radius) {
        soundEngine.playVortex();
        this.particles.addBumperShockwave(portal.exit.x, portal.exit.y, portal.exit.color);
        this.particles.addBumperShockwave(portal.entry.x, portal.entry.y, portal.entry.color);
        ball.x = portal.entry.x;
        ball.y = portal.entry.y + 15;
        ball.vy = Math.abs(ball.vy);
        portal.cooldownFrames = 30;
        return;
      }
    }
  }

  private checkMoverCollisions(ball: Ball) {
    for (const m of this.movers) {
      // Rotated OBB test
      const cosA = Math.cos(-m.angle);
      const sinA = Math.sin(-m.angle);
      const localX = cosA * (ball.x - m.x) - sinA * (ball.y - m.y);
      const localY = sinA * (ball.x - m.x) + cosA * (ball.y - m.y);

      const halfW = m.width / 2;
      const halfH = m.height / 2;

      const clampedX = Math.max(-halfW, Math.min(halfW, localX));
      const clampedY = Math.max(-halfH, Math.min(halfH, localY));

      const dx = localX - clampedX;
      const dy = localY - clampedY;
      const distSq = dx * dx + dy * dy;

      if (distSq < ball.radius * ball.radius) {
        const dist = Math.max(0.01, Math.sqrt(distSq));
        const localNx = dx / dist;
        const localNy = dy / dist;

        const worldNx = Math.cos(m.angle) * localNx - Math.sin(m.angle) * localNy;
        const worldNy = Math.sin(m.angle) * localNx + Math.cos(m.angle) * localNy;

        ball.x += worldNx * (ball.radius - dist);
        ball.y += worldNy * (ball.radius - dist);

        const dot = ball.vx * worldNx + ball.vy * worldNy;
        if (dot < 0) {
          ball.vx -= 2 * dot * worldNx * 0.95;
          ball.vy -= 2 * dot * worldNy * 0.95;
        }

        soundEngine.playBumper();
        this.particles.addPegHitSparks(ball.x, ball.y, '#f59e0b', 8);
      }
    }
  }

  private checkCatcherCollision(ball: Ball) {
    const c = this.catcher;
    const halfW = c.width / 2;
    const leftLip = c.x - halfW;
    const rightLip = c.x + halfW;
    const top = c.y - c.height / 2;
    const bottom = c.y + c.height / 2;

    // Check if ball caught inside the basket rim
    if (
      ball.x > leftLip + 12 &&
      ball.x < rightLip - 12 &&
      ball.y + ball.radius >= top &&
      ball.y - ball.radius <= bottom &&
      ball.vy > 0
    ) {
      // FREE BALL CATCH!
      ball.isDead = true;
      this.stats.ballsRemaining++;
      this.stats.freeBallsEarned++;
      const catchScore = 5000;
      this.stats.score += catchScore;

      soundEngine.playCatch();
      this.cameraShake = Math.max(this.cameraShake, 8);
      this.particles.addBumperShockwave(c.x, c.y, '#10b981');
      this.particles.addScorePopup(c.x, c.y - 20, 'FREE BALL! +5K', '#10b981', 1.4);
      return;
    }

    // Outer lip ricochet
    if (
      ball.x > leftLip - ball.radius &&
      ball.x < rightLip + ball.radius &&
      ball.y > top - ball.radius &&
      ball.y < bottom + ball.radius
    ) {
      ball.vy = -Math.abs(ball.vy) * 0.75;
      ball.vx += c.vx * 0.4;
      this.particles.addPegHitSparks(ball.x, ball.y, '#38bdf8', 4);
    }
  }

  private checkFeverBonusCups(ball: Ball) {
    const cupY = 880;
    const cupRadius = 38;

    for (const cup of this.bonusCups) {
      const dx = ball.x - cup.x;
      const dy = ball.y - cupY;
      if (dx * dx + dy * dy < cupRadius * cupRadius && ball.vy > 0) {
        ball.isDead = true;
        this.stats.score += cup.score;
        soundEngine.playCatch();
        this.cameraShake = Math.max(this.cameraShake, 10);
        this.particles.addBumperShockwave(cup.x, cupY, cup.color);
        this.particles.addScorePopup(cup.x, cupY - 25, `+${cup.label}!`, cup.color, 1.5);
        return;
      }
    }
  }

  private triggerExtremeFever() {
    this.feverTriggered = true;
    this.globalTimeScale = 0.25; // Dramatic slow-mo!
    soundEngine.playFeverFanfare();
    this.cameraShake = 20;
    this.particles.addScorePopup(400, 260, 'EXTREME FEVER!!', '#f59e0b', 2.0);

    // Smoothly restore normal time scale after slow-mo impact
    setTimeout(() => {
      this.globalTimeScale = 1.0;
    }, 2200);
  }

  private postUpdateCheck() {
    // Filter out dead balls
    this.balls = this.balls.filter(b => !b.isDead);

    // If firing and no active balls remain
    if (this.playState === 'FIRING' && this.balls.length === 0) {
      // Remove all pegs that were hit this turn
      this.removeHitPegs();

      // Reset turn streak
      this.stats.comboHits = 0;
      this.stats.currentMultiplier = 1;

      // Check win or loss condition
      if (this.stats.targetsRemaining <= 0) {
        this.playState = 'CLEARED';
      } else if (this.stats.ballsRemaining <= 0) {
        this.playState = 'FAILED';
      } else {
        this.playState = 'READY';
      }
    }
  }

  private removeHitPegs() {
    for (let i = this.pegs.length - 1; i >= 0; i--) {
      const p = this.pegs[i];
      if (p.hit && p.type !== 'bumper') {
        this.particles.addPegHitSparks(p.x, p.y, p.type === 'target' ? '#f59e0b' : '#38bdf8', 6);
        this.pegs.splice(i, 1);
      }
    }

    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const b = this.bricks[i];
      if (b.hp <= 0) {
        this.bricks.splice(i, 1);
      }
    }
  }

  /**
   * Calculate trajectory prediction path for aiming
   */
  public calculateTrajectory(maxSteps: number = 240): TrajectoryPoint[] {
    const points: TrajectoryPoint[] = [];
    let x = this.launcherX + Math.sin(this.launcherAngle) * 35;
    let y = this.launcherY + Math.cos(this.launcherAngle) * 35;
    let vx = Math.sin(this.launcherAngle) * this.launcherPower;
    let vy = Math.cos(this.launcherAngle) * this.launcherPower;
    const simRadius = 10;
    const simDt = 0.016;
    const gravityAccel = this.gravity * 980;

    points.push({ x, y });

    for (let i = 0; i < maxSteps; i++) {
      vy += gravityAccel * simDt;
      x += vx * simDt;
      y += vy * simDt;

      let bounced = false;

      // Left and right walls
      if (x - simRadius < this.leftWall) {
        x = this.leftWall + simRadius;
        vx = -vx * 0.85;
        bounced = true;
      } else if (x + simRadius > this.rightWall) {
        x = this.rightWall - simRadius;
        vx = -vx * 0.85;
        bounced = true;
      }

      // Check first peg collision
      for (const peg of this.pegs) {
        if (peg.hp <= 0) continue;
        const dx = x - peg.x;
        const dy = y - peg.y;
        const minDist = simRadius + peg.radius;
        if (dx * dx + dy * dy < minDist * minDist) {
          points.push({ x, y, isBounce: true });
          return points; // Stop trajectory line at first peg impact
        }
      }

      if (i % 3 === 0 || bounced) {
        points.push({ x, y, isBounce: bounced });
      }

      if (y > this.floor) break;
    }

    return points;
  }
}
