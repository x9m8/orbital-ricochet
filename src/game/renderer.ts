/**
 * High-performance 2D Canvas Renderer for Orbital Ricochet
 * Features arcade neon aesthetics, glowing specular reflections,
 * trajectory laser dots, and smooth camera shake.
 */

import { PhysicsEngine } from './physics';
import { Ball } from './types';

export class GameRenderer {
  private gridOffset = 0;

  public render(
    ctx: CanvasRenderingContext2D,
    physics: PhysicsEngine,
    showTrajectory: boolean = true
  ) {
    const width = physics.width;
    const height = physics.height;

    // Apply Camera Screen Shake
    ctx.save();
    if (physics.cameraShake > 0) {
      const shakeX = (Math.random() - 0.5) * physics.cameraShake * 1.5;
      const shakeY = (Math.random() - 0.5) * physics.cameraShake * 1.5;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Background Grid & Atmosphere
    this.drawBackground(ctx, width, height, physics.feverTriggered);

    // 2. Draw Boundaries & Side Rails
    this.drawBorders(ctx, physics);

    // 3. Draw Gravity Wells
    this.drawGravityWells(ctx, physics);

    // 4. Draw Portals
    this.drawPortals(ctx, physics);

    // 5. Draw Bricks
    this.drawBricks(ctx, physics);

    // 6. Draw Kinetic Movers
    this.drawMovers(ctx, physics);

    // 7. Draw Pegs
    this.drawPegs(ctx, physics);

    // 8. Draw Bottom Catcher Basket OR Fever Bonus Cups
    if (physics.feverTriggered) {
      this.drawBonusCups(ctx, physics);
    } else {
      this.drawCatcher(ctx, physics);
    }

    // 9. Draw Trajectory Guide
    if (showTrajectory && (physics.playState === 'READY' || physics.playState === 'FIRING')) {
      this.drawTrajectory(ctx, physics);
    }

    // 10. Draw Active Balls & Trails
    this.drawBalls(ctx, physics);

    // 11. Draw Launcher Cannon
    this.drawLauncher(ctx, physics);

    // 12. Draw Visual Particles, Shockwaves, Floating Scores
    physics.particles.draw(ctx);

    ctx.restore();
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isFever: boolean
  ) {
    // Gradient dark slate background
    const bgGrad = ctx.createRadialGradient(
      width / 2, height / 2, 80,
      width / 2, height / 2, width * 0.75
    );

    if (isFever) {
      bgGrad.addColorStop(0, '#1e1136');
      bgGrad.addColorStop(1, '#090514');
    } else {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle perspective grid lines
    ctx.save();
    ctx.strokeStyle = isFever ? 'rgba(236, 72, 153, 0.07)' : 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    this.gridOffset = (this.gridOffset + 0.25) % 40;

    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = this.gridOffset; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawBorders(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    ctx.save();
    const lw = physics.leftWall;
    const rw = physics.rightWall;
    const top = physics.ceiling;
    const bottom = physics.floor;

    // Glowing Neon Rails
    ctx.strokeStyle = physics.feverTriggered ? '#ec4899' : '#0284c7';
    ctx.lineWidth = 3;
    ctx.shadowColor = physics.feverTriggered ? '#f43f5e' : '#38bdf8';
    ctx.shadowBlur = 12;

    // Left Rail
    ctx.beginPath();
    ctx.moveTo(lw, top + 30);
    ctx.lineTo(lw, bottom);
    ctx.stroke();

    // Right Rail
    ctx.beginPath();
    ctx.moveTo(rw, top + 30);
    ctx.lineTo(rw, bottom);
    ctx.stroke();

    // Top Arches
    ctx.beginPath();
    ctx.moveTo(lw, top + 30);
    ctx.quadraticCurveTo(lw, top, lw + 30, top);
    ctx.lineTo(physics.launcherX - 45, top);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(physics.launcherX + 45, top);
    ctx.lineTo(rw - 30, top);
    ctx.quadraticCurveTo(rw, top, rw, top + 30);
    ctx.stroke();

    ctx.restore();
  }

  private drawGravityWells(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    for (const gw of physics.gravityWells) {
      ctx.save();
      gw.pulseAngle += 0.03;

      // Swirling outer gravity accretion disk
      const grad = ctx.createRadialGradient(gw.x, gw.y, 10, gw.x, gw.y, gw.radius);
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      grad.addColorStop(0.6, 'rgba(126, 34, 206, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, gw.radius, 0, Math.PI * 2);
      ctx.fill();

      // Swirling spiral lines
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
      ctx.lineWidth = 1.5;
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        const baseAngle = gw.pulseAngle + (arm * Math.PI * 2) / 3;
        for (let r = 8; r < gw.radius * 0.75; r += 5) {
          const a = baseAngle + r * 0.06;
          const px = gw.x + Math.cos(a) * r;
          const py = gw.y + Math.sin(a) * r;
          if (r === 8) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Singularity Black Hole Core
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#05020a';
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.restore();
    }
  }

  private drawPortals(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    for (const p of physics.portals) {
      [p.entry, p.exit].forEach((node) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fill();

        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Inner glowing ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      });
    }
  }

  private drawBricks(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    for (const b of physics.bricks) {
      if (b.hp <= 0) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const halfW = b.width / 2;
      const halfH = b.height / 2;

      // Fill style based on target/hardness
      if (b.isTarget) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
      } else {
        const hpRatio = b.hp / b.maxHp;
        ctx.fillStyle = hpRatio > 0.6 ? '#475569' : hpRatio > 0.3 ? '#334155' : '#1e293b';
        ctx.shadowColor = '#64748b';
        ctx.shadowBlur = 4;
      }

      ctx.fillRect(-halfW, -halfH, b.width, b.height);

      // Border & cracks
      ctx.strokeStyle = b.isTarget ? '#fef08a' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-halfW, -halfH, b.width, b.height);

      // Draw health notches
      if (b.maxHp > 1) {
        ctx.fillStyle = '#ffffff';
        const notchWidth = 6;
        for (let i = 0; i < b.hp; i++) {
          ctx.fillRect(-halfW + 6 + i * (notchWidth + 4), halfH - 6, notchWidth, 2);
        }
      }

      ctx.restore();
    }
  }

  private drawMovers(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    for (const m of physics.movers) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.angle);

      const halfW = m.width / 2;
      const halfH = m.height / 2;

      // Rounded bar
      ctx.beginPath();
      ctx.roundRect(-halfW, -halfH, m.width, m.height, 8);
      ctx.fillStyle = '#334155';
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Center pivot bolt
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      ctx.restore();
    }
  }

  private drawPegs(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    for (const p of physics.pegs) {
      if (p.hp <= 0) continue;
      ctx.save();

      p.pulseTimer += 0.04;

      if (p.type === 'target') {
        // GOLDEN TARGET ORB
        const glowPulse = 8 + Math.sin(p.pulseTimer) * 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          p.x - p.radius * 0.35, p.y - p.radius * 0.35, p.radius * 0.1,
          p.x, p.y, p.radius
        );
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.4, '#f59e0b');
        grad.addColorStop(1, '#b45309');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = glowPulse;
        ctx.fill();

        // Inner specular sparkle
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.35, p.y - p.radius * 0.35, p.radius * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        // Rim ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

      } else if (p.type === 'bumper') {
        // HIGH-BOUNCE PINBALL BUMPER
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();

        // Score text on bumper
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.fillText('+250', p.x, p.y);

      } else if (p.type === 'tnt') {
        // TNT EXPLOSIVE BARREL
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.fillText('TNT', p.x, p.y);

      } else {
        // STANDARD BLUE CRYSTAL PEG
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.1,
          p.x, p.y, p.radius
        );
        grad.addColorStop(0, '#bae6fd');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#0369a1');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.fill();

        // Specular dot
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawCatcher(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    const c = physics.catcher;
    const halfW = c.width / 2;
    const halfH = c.height / 2;

    ctx.save();
    ctx.translate(c.x, c.y);

    // Basket body
    ctx.beginPath();
    ctx.roundRect(-halfW, -halfH, c.width, c.height, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#059669';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Catch zone energy net
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(-halfW + 10, -halfH + 4, c.width - 20, c.height - 8);

    // Label
    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#34d399';
    ctx.shadowBlur = 0;
    ctx.fillText('FREE BALL', 0, 0);

    ctx.restore();
  }

  private drawBonusCups(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    const cupY = 880;
    const radius = 34;

    for (const cup of physics.bonusCups) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cup.x, cupY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      ctx.strokeStyle = cup.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = cup.color;
      ctx.shadowBlur = 14;
      ctx.stroke();

      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = cup.color;
      ctx.shadowBlur = 0;
      ctx.fillText(cup.label, cup.x, cupY);

      ctx.restore();
    }
  }

  private drawTrajectory(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    const points = physics.calculateTrajectory(180);
    if (points.length < 2) return;

    ctx.save();
    ctx.lineWidth = 2;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const alpha = Math.max(0.15, 1 - (i / points.length) * 0.85);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.isBounce ? 4 : 2, 0, Math.PI * 2);
      ctx.fillStyle = p.isBounce ? '#f59e0b' : '#38bdf8';
      ctx.shadowColor = p.isBounce ? '#f59e0b' : '#38bdf8';
      ctx.shadowBlur = p.isBounce ? 8 : 4;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }

    ctx.restore();
  }

  private drawBalls(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    for (const ball of physics.balls) {
      if (ball.isDead) continue;
      ctx.save();

      // Motion blur trail
      for (let i = 0; i < ball.trail.length; i++) {
        const pt = ball.trail[i];
        const trailAlpha = (i / ball.trail.length) * 0.35;
        const trailRadius = ball.radius * (0.4 + (i / ball.trail.length) * 0.5);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, trailRadius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.globalAlpha = trailAlpha;
        ctx.shadowColor = ball.glowColor;
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      // Ball core
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(
        ball.x - ball.radius * 0.35, ball.y - ball.radius * 0.35, ball.radius * 0.1,
        ball.x, ball.y, ball.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, ball.color);
      grad.addColorStop(1, ball.glowColor);
      ctx.fillStyle = grad;
      ctx.shadowColor = ball.glowColor;
      ctx.shadowBlur = 12;
      ctx.fill();

      // Outer rim
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  private drawLauncher(ctx: CanvasRenderingContext2D, physics: PhysicsEngine) {
    ctx.save();
    ctx.translate(physics.launcherX, physics.launcherY);
    ctx.rotate(physics.launcherAngle);

    // Barrel
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, 0, 24, 38);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 8;
    ctx.strokeRect(-12, 0, 24, 38);

    // Barrel Muzzle Tip
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-14, 34, 28, 6);

    // Pivot mount ring
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chambered ball preview in launcher pivot
    const ballProps = this.getBallColor(physics.selectedBallType);
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = ballProps;
    ctx.shadowColor = ballProps;
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.restore();
  }

  private getBallColor(type: string): string {
    switch (type) {
      case 'bomb': return '#f97316';
      case 'meteor': return '#e11d48';
      case 'tesla': return '#06b6d4';
      case 'splitter': return '#a855f7';
      default: return '#38bdf8';
    }
  }
}
