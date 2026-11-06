/**
 * High-performance 2D Canvas Particle & Visual FX System
 * Handles spark bursts, glowing shockwave rings, floating score popups,
 * and fever celebration fireworks.
 */

import { Particle, Shockwave, FloatingText } from './types';

export class ParticleSystem {
  public particles: Particle[] = [];
  public shockwaves: Shockwave[] = [];
  public floatingTexts: FloatingText[] = [];
  public lightningBolts: { x1: number; y1: number; x2: number; y2: number; alpha: number }[] = [];

  public clear() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.lightningBolts = [];
  }

  public addPegHitSparks(x: number, y: number, color: string, count: number = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2.5,
        color,
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.035,
        gravity: 0.08,
        sparkle: Math.random() > 0.5
      });
    }
  }

  public addExplosion(x: number, y: number, radius: number = 70) {
    // Blast shockwave
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: radius * 1.4,
      color: '#f97316',
      alpha: 1.0,
      lineWidth: 5
    });

    // Secondary inner white-hot shockwave
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: radius * 0.8,
      color: '#ffffff',
      alpha: 1.0,
      lineWidth: 3
    });

    // Debris & fire particles
    const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ffffff', '#ef4444'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.018 + Math.random() * 0.03,
        gravity: 0.12,
        sparkle: true
      });
    }
  }

  public addBumperShockwave(x: number, y: number, color: string = '#38bdf8') {
    this.shockwaves.push({
      x,
      y,
      radius: 20,
      maxRadius: 55,
      color,
      alpha: 1.0,
      lineWidth: 4
    });
  }

  public addScorePopup(x: number, y: number, text: string, color: string = '#fcd34d', scale: number = 1.0) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      x: x + (Math.random() * 16 - 8),
      y: y - 10,
      vy: -1.6,
      alpha: 1.0,
      color,
      scale,
      fontWeight: scale > 1.2 ? 'bold' : 'normal'
    });
  }

  public addLightning(x1: number, y1: number, x2: number, y2: number) {
    this.lightningBolts.push({
      x1,
      y1,
      x2,
      y2,
      alpha: 1.0
    });
  }

  public addFeverSparks(canvasWidth: number, canvasHeight: number) {
    const rainbowColors = ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#eab308'];
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * (canvasHeight * 0.85);
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 2,
        radius: 2 + Math.random() * 3.5,
        color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
        alpha: 1.0,
        decay: 0.015,
        gravity: 0.06,
        sparkle: true
      });
    }
  }

  public update(timeScale: number = 1.0) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      if (p.gravity) p.vy += p.gravity * timeScale;
      p.alpha -= p.decay * timeScale;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += ((s.maxRadius - s.radius) * 0.2 + 2) * timeScale;
      s.alpha -= 0.045 * timeScale;
      s.lineWidth = Math.max(1, s.lineWidth * 0.95);

      if (s.alpha <= 0 || s.radius >= s.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy * timeScale;
      t.alpha -= 0.018 * timeScale;

      if (t.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update lightning
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const b = this.lightningBolts[i];
      b.alpha -= 0.12 * timeScale;
      if (b.alpha <= 0) {
        this.lightningBolts.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Draw shockwaves
    for (const s of this.shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.lineWidth = s.lineWidth;
      ctx.stroke();
      ctx.restore();
    }

    // Draw lightning bolts with jagged subdivisions
    for (const b of this.lightningBolts) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      const segments = 5;
      for (let s = 1; s < segments; s++) {
        const t = s / segments;
        const midX = b.x1 + (b.x2 - b.x1) * t + (Math.random() - 0.5) * 16;
        const midY = b.y1 + (b.y2 - b.y1) * t + (Math.random() - 0.5) * 16;
        ctx.lineTo(midX, midY);
      }
      ctx.lineTo(b.x2, b.y2);
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      if (p.sparkle) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }
      ctx.fill();
      ctx.restore();
    }

    // Draw floating score texts
    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.font = `${t.fontWeight || 'normal'} ${Math.round(15 * t.scale)}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = t.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}
