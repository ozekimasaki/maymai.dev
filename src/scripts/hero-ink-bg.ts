export {};

// ===========================================
// Hero "Aurora Flow" background
//
// GPU-friendly particle field that swirls with cursor-driven orbital
// attraction + curl noise turbulence, post-processed with heavy blur and
// iridescent color shifting. Click/tap fires a radial shockwave.
//
// Built on Pixi.js v8 (already a project dependency).
// ===========================================

type PixiApplication = import('pixi.js').Application;
type PixiSprite = import('pixi.js').Sprite;
type PixiTexture = import('pixi.js').Texture;
type PixiContainer = import('pixi.js').Container;
type PixiColorMatrixFilter = import('pixi.js').ColorMatrixFilter;
type PixiBlurFilter = import('pixi.js').BlurFilter;

type Viewport = { width: number; height: number; mobile: boolean };

type Particle = {
  sprite: PixiSprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  hueOffset: number;
};

const HERO_SELECTOR = '.Hero';
const HERO_BG_SELECTOR = '.js-hero-bg';
const MOBILE_BREAKPOINT = 768;
const PARTICLE_TEX_SIZE = 128;

const DESKTOP = {
  particles: 380,
  blur: 22,
  resolutionCap: 1.75,
  curlScale: 0.0022,
  swirlRadius: 260,
  swirlStrength: 22,
  pullStrength: 0.65,
};

const MOBILE = {
  particles: 180,
  blur: 16,
  resolutionCap: 1.25,
  curlScale: 0.0028,
  swirlRadius: 180,
  swirlStrength: 18,
  pullStrength: 0.55,
};

// Iridescent palette (HSL-based). Tuned for the cream Hero background:
// muted enough to keep copy readable but rich enough to feel alive.
const HUE_BASE = 215; // indigo blue starting point
const HUE_RANGE = 110; // shifts toward magenta / cyan
const SATURATION = 62;
const LIGHTNESS = 58;

// ===========================================
// Utilities
// ===========================================

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

function hslToHex(h: number, s: number, l: number): number {
  // h in [0, 360), s/l in [0, 100]
  const hh = ((h % 360) + 360) % 360 / 360;
  const ss = s / 100;
  const ll = l / 100;
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const hue2rgb = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  const r = Math.round(hue2rgb(hh + 1 / 3) * 255);
  const g = Math.round(hue2rgb(hh) * 255);
  const b = Math.round(hue2rgb(hh - 1 / 3) * 255);
  return (r << 16) | (g << 8) | b;
}

// Cheap pseudo-curl-noise built from layered sin/cos. Not a true simplex
// curl noise, but visually very close at this fidelity and zero deps.
function noise2(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 1.0 + t * 0.30) * Math.cos(y * 1.1 - t * 0.22) +
    Math.sin(x * 1.7 - y * 1.3 + t * 0.55) * 0.5 +
    Math.cos(x * 2.3 + y * 1.9 - t * 0.18) * 0.35
  );
}
function curl(x: number, y: number, t: number): { fx: number; fy: number } {
  const eps = 0.6;
  const n1 = noise2(x, y + eps, t);
  const n2 = noise2(x, y - eps, t);
  const n3 = noise2(x + eps, y, t);
  const n4 = noise2(x - eps, y, t);
  // curl of scalar field -> (dN/dy, -dN/dx)
  return { fx: (n1 - n2) / (2 * eps), fy: -(n3 - n4) / (2 * eps) };
}

function createParticleTexture(Texture: typeof import('pixi.js').Texture): PixiTexture {
  const canvas = document.createElement('canvas');
  canvas.width = PARTICLE_TEX_SIZE;
  canvas.height = PARTICLE_TEX_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Texture.WHITE;
  const r = PARTICLE_TEX_SIZE * 0.5;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.78)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.30)');
  grad.addColorStop(0.85, 'rgba(255,255,255,0.06)');
  grad.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, PARTICLE_TEX_SIZE, PARTICLE_TEX_SIZE);
  return Texture.from(canvas);
}

// ===========================================
// Background controller
// ===========================================

class HeroAuroraBackground {
  private readonly section: HTMLElement;
  private readonly container: HTMLElement;
  private readonly motionQuery: MediaQueryList;

  private app: PixiApplication | null = null;
  private layer: PixiContainer | null = null;
  private highlightLayer: PixiContainer | null = null;
  private texture: PixiTexture | null = null;
  private particles: Particle[] = [];

  private params = DESKTOP;
  private viewport: Viewport = { width: 1, height: 1, mobile: false };

  private destroyed = false;
  private reducedMotion = false;
  private isVisible = true;
  private isIntersecting = true;

  private pointerX = -9999;
  private pointerY = -9999;
  private pointerActive = false;
  private lastTickMs = 0;
  private timeSec = 0;

  // Shockwave state for click bursts. Only one active wave at a time is
  // enough: bursts feel snappier when they overwrite the previous wave.
  private waveX = 0;
  private waveY = 0;
  private waveAgeMs = Infinity;
  private waveLifeMs = 700;

  private hueRotateMatrix: PixiColorMatrixFilter | null = null;
  private hueRotation = 0;

  private resizeFrame = 0;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(section: HTMLElement, container: HTMLElement) {
    this.section = section;
    this.container = container;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
  }

  async init() {
    const { Application, Container, Texture, Sprite, BlurFilter, ColorMatrixFilter } = await import('pixi.js');

    if (!this.container.isConnected || !this.section.isConnected) {
      activeBackground = null;
      delete this.container.dataset.heroBgLoading;
      return;
    }

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.params = isMobile ? MOBILE : DESKTOP;

    const app = new Application();
    await app.init({
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, this.params.resolutionCap),
      // 'high-performance' nudges hybrid GPU systems to use the discrete GPU.
      powerPreference: 'high-performance',
    });

    if (!this.container.isConnected || !this.section.isConnected) {
      app.destroy();
      activeBackground = null;
      delete this.container.dataset.heroBgLoading;
      return;
    }

    this.app = app;
    this.texture = createParticleTexture(Texture);

    // Main particle layer: heavy blur + color-matrix hue rotation produce
    // the iridescent "aurora" look from individually colored sprites.
    const layer = new Container();
    const blur = new BlurFilter({ strength: this.params.blur, quality: 4 });
    const colorMatrix = new ColorMatrixFilter();
    layer.filters = [blur, colorMatrix];
    app.stage.addChild(layer);
    this.layer = layer;
    this.hueRotateMatrix = colorMatrix;

    // Sharper top layer for click shockwave ring (no blur).
    const highlight = new Container();
    app.stage.addChild(highlight);
    this.highlightLayer = highlight;

    // Spawn initial particles.
    for (let i = 0; i < this.params.particles; i += 1) {
      const sprite = new Sprite(this.texture);
      sprite.anchor.set(0.5);
      const baseSize = rand(0.45, 1.05);
      sprite.scale.set(baseSize);
      sprite.alpha = rand(0.22, 0.46);
      layer.addChild(sprite);
      this.particles.push({
        sprite,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: 0,
        vy: 0,
        baseSize,
        hueOffset: Math.random(),
      });
    }

    app.canvas.classList.add('Hero__pixiCanvas');
    app.canvas.setAttribute('aria-hidden', 'true');
    app.canvas.setAttribute('role', 'presentation');
    app.canvas.setAttribute('focusable', 'false');
    this.container.append(app.canvas);

    this.handleResize();
    this.scatterParticles();
    this.bindEvents();
    this.lastTickMs = performance.now();
    app.ticker.add(this.tick);
    this.syncTicker();

    delete this.container.dataset.heroBgLoading;
    this.container.dataset.heroBgReady = 'true';
  }

  destroy = () => {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);

    this.section.removeEventListener('pointermove', this.handlePointerMove);
    this.section.removeEventListener('pointerdown', this.handlePointerDown);
    this.section.removeEventListener('pointerleave', this.handlePointerLeave);
    this.section.removeEventListener('pointercancel', this.handlePointerLeave);
    this.motionQuery.removeEventListener('change', this.handleMotionChange);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('pagehide', this.destroy);
    window.removeEventListener('beforeunload', this.destroy);

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

    this.app?.ticker.remove(this.tick);
    this.app?.ticker.stop();

    if (this.app && this.app.canvas.parentNode === this.container) {
      this.container.removeChild(this.app.canvas);
    }

    this.app?.destroy(true, { children: true, texture: true });
    this.texture = null;
    this.particles = [];
    this.layer = null;
    this.highlightLayer = null;
    activeBackground = null;
    delete this.container.dataset.heroBgLoading;
    delete this.container.dataset.heroBgReady;
  };

  // -----------------------------------------
  // Event wiring
  // -----------------------------------------

  private bindEvents() {
    this.motionQuery.addEventListener('change', this.handleMotionChange);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('pagehide', this.destroy, { once: true });
    window.addEventListener('beforeunload', this.destroy, { once: true });

    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = window.requestAnimationFrame(() => {
        if (this.destroyed) return;
        this.resizeFrame = 0;
        this.handleResize();
      });
    });
    this.resizeObserver.observe(this.container);

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.isIntersecting = Boolean(entries[0]?.isIntersecting);
        this.syncTicker();
      },
      { threshold: 0.05 },
    );
    this.intersectionObserver.observe(this.section);

    // Click shockwave is available even when reduced motion is on -- it is
    // user-initiated, brief, and is the main "rewarding" interaction.
    this.section.addEventListener('pointerdown', this.handlePointerDown);

    if (!this.reducedMotion) {
      this.section.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      this.section.addEventListener('pointerleave', this.handlePointerLeave);
      this.section.addEventListener('pointercancel', this.handlePointerLeave);
    }
  }

  private handleResize() {
    if (!this.app || this.destroyed) return;
    const width = Math.max(1, Math.round(this.container.clientWidth));
    const height = Math.max(1, Math.round(this.container.clientHeight));
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.viewport = { width, height, mobile };
    this.params = mobile ? MOBILE : DESKTOP;
    this.app.renderer.resize(width, height);

    // Re-distribute particles within the new viewport.
    if (this.particles.length) this.scatterParticles();
  }

  private scatterParticles() {
    const { width, height } = this.viewport;
    for (const p of this.particles) {
      // Bias spawn slightly to the right so they accumulate where copy
      // doesn't sit, keeping the headline crisp at first paint.
      p.x = rand(width * 0.1, width * 0.98);
      p.y = rand(height * 0.05, height * 0.95);
      p.vx = rand(-8, 8);
      p.vy = rand(-8, 8);
    }
  }

  private readonly handlePointerMove = (e: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.pointerX = e.clientX - rect.left;
    this.pointerY = e.clientY - rect.top;
    this.pointerActive = true;
  };

  private readonly handlePointerDown = (e: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.triggerShockwave(x, y);
  };

  private readonly handlePointerLeave = () => {
    this.pointerActive = false;
    this.pointerX = -9999;
    this.pointerY = -9999;
  };

  private readonly handleMotionChange = (e: MediaQueryListEvent) => {
    this.reducedMotion = e.matches;
    this.section.removeEventListener('pointermove', this.handlePointerMove);
    this.section.removeEventListener('pointerleave', this.handlePointerLeave);
    this.section.removeEventListener('pointercancel', this.handlePointerLeave);
    if (!this.reducedMotion) {
      this.section.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      this.section.addEventListener('pointerleave', this.handlePointerLeave);
      this.section.addEventListener('pointercancel', this.handlePointerLeave);
    } else {
      this.pointerActive = false;
    }
  };

  private readonly handleVisibilityChange = () => {
    this.isVisible = !document.hidden;
    this.syncTicker();
  };

  private syncTicker() {
    if (!this.app) return;
    const shouldRun = this.isVisible && this.isIntersecting && !this.destroyed;
    if (shouldRun) {
      if (!this.app.ticker.started) {
        this.lastTickMs = performance.now();
        this.app.ticker.start();
      }
    } else {
      this.app.ticker.stop();
    }
  }

  // -----------------------------------------
  // Shockwave (click) effect
  // -----------------------------------------

  private async triggerShockwave(x: number, y: number) {
    this.waveX = x;
    this.waveY = y;
    this.waveAgeMs = 0;

    // Push every particle outward radially. Falloff so distant particles
    // get a gentle nudge while nearby ones get a strong kick.
    const maxRadius = Math.max(this.viewport.width, this.viewport.height) * 0.55;
    for (const p of this.particles) {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1 || dist > maxRadius) continue;
      const falloff = 1 - dist / maxRadius;
      const impulse = falloff * falloff * 520;
      p.vx += (dx / dist) * impulse;
      p.vy += (dy / dist) * impulse;
    }

    // Highlight ring drawn on the un-blurred top layer so the rim reads
    // crisply through the cream background.
    if (!this.highlightLayer || !this.app) return;
    const { Sprite } = await import('pixi.js');
    if (this.destroyed || !this.highlightLayer || !this.texture) return;

    const ring = new Sprite(this.texture);
    ring.anchor.set(0.5);
    ring.x = x;
    ring.y = y;
    ring.alpha = 0.55;
    ring.tint = hslToHex(HUE_BASE + 80, 70, 65);
    ring.scale.set(0.18);
    this.highlightLayer.addChild(ring);

    const start = performance.now();
    const duration = 720;
    const targetScale = 4.6;
    const animate = () => {
      if (this.destroyed || !this.highlightLayer) {
        ring.destroy();
        return;
      }
      const t = (performance.now() - start) / duration;
      if (t >= 1) {
        ring.destroy();
        return;
      }
      const e = 1 - (1 - t) * (1 - t); // easeOutQuad
      ring.scale.set(lerp(0.18, targetScale, e));
      ring.alpha = (1 - t) * 0.55;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  // -----------------------------------------
  // Per-frame update
  // -----------------------------------------

  private readonly tick = () => {
    if (!this.app || !this.layer || this.destroyed) return;

    const now = performance.now();
    const dtMs = Math.min(50, now - this.lastTickMs);
    const dt = dtMs / 1000;
    this.lastTickMs = now;
    this.timeSec += dt;
    this.waveAgeMs += dtMs;

    // Slow global hue rotation so the iridescence breathes over time.
    this.hueRotation += dt * 8; // degrees per second
    if (this.hueRotateMatrix) {
      this.hueRotateMatrix.reset();
      this.hueRotateMatrix.hue(this.hueRotation, false);
    }

    const { width, height, mobile } = this.viewport;
    const params = this.params;
    const damping = mobile ? 0.92 : 0.945;
    const t = this.timeSec;
    const swirlR2 = params.swirlRadius * params.swirlRadius;

    for (const p of this.particles) {
      // 1) Curl noise turbulence -- alive even with no cursor.
      const { fx, fy } = curl(p.x * params.curlScale, p.y * params.curlScale, t);
      p.vx += fx * 60 * dt;
      p.vy += fy * 60 * dt;

      // 2) Cursor swirl: tangential + radial attraction inside swirlRadius.
      if (this.pointerActive) {
        const dx = this.pointerX - p.x;
        const dy = this.pointerY - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < swirlR2 && d2 > 0.01) {
          const dist = Math.sqrt(d2);
          const f = 1 - dist / params.swirlRadius; // 0..1
          // Tangent (perpendicular CCW) drives orbital motion.
          const tx = -dy / dist;
          const ty = dx / dist;
          const swirl = params.swirlStrength * f;
          const pull = params.pullStrength * f;
          p.vx += tx * swirl * 12 * dt + (dx / dist) * pull * 60 * dt;
          p.vy += ty * swirl * 12 * dt + (dy / dist) * pull * 60 * dt;
        }
      }

      // 3) Integrate + damping (frame-rate independent via dt^60).
      const dampF = Math.pow(damping, dt * 60);
      p.vx *= dampF;
      p.vy *= dampF;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      // 4) Soft wrap so particles never disappear (keeps density even).
      if (p.x < -40) p.x = width + 40;
      if (p.x > width + 40) p.x = -40;
      if (p.y < -40) p.y = height + 40;
      if (p.y > height + 40) p.y = -40;

      // 5) Color: hue varies along x + per-particle offset + time drift.
      const norm = clamp((p.x / Math.max(1, width)) * 0.7 + p.hueOffset * 0.3, 0, 1);
      const hue = HUE_BASE + norm * HUE_RANGE + Math.sin(t * 0.4 + p.hueOffset * TAU) * 14;
      const sat = SATURATION + Math.sin(t * 0.6 + p.hueOffset * 4) * 8;
      const light = LIGHTNESS + Math.cos(t * 0.5 + p.hueOffset * 3) * 6;
      p.sprite.tint = hslToHex(hue, sat, light);
      p.sprite.x = p.x;
      p.sprite.y = p.y;

      // 6) Subtle breathing scale -- keeps the field feeling organic.
      const breathe = 1 + Math.sin(t * 0.9 + p.hueOffset * 6) * 0.08;
      p.sprite.scale.set(p.baseSize * breathe);
    }
  };
}

// ===========================================
// Bootstrap
// ===========================================

let activeBackground: HeroAuroraBackground | null = null;

async function boot() {
  const container = document.querySelector<HTMLElement>(HERO_BG_SELECTOR);
  const section = container?.closest<HTMLElement>(HERO_SELECTOR);

  if (!container || !section || container.dataset.heroBgLoading === 'true' || activeBackground) return;

  container.dataset.heroBgLoading = 'true';

  try {
    const background = new HeroAuroraBackground(section, container);
    activeBackground = background;
    await background.init();
  } catch (error) {
    activeBackground = null;
    delete container.dataset.heroBgLoading;
    console.error('[hero-ink-bg] Failed to initialize aurora hero background.', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void boot();
  }, { once: true });
} else {
  void boot();
}
