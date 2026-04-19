export {};

// ===========================================
// Types
// ===========================================

type Vec2 = { x: number; y: number };

type PointerState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  energy: number;
  active: boolean;
};

type ClickPulse = {
  x: number;
  y: number;
  birth: number;
  strength: number;
};

type Viewport = {
  width: number;
  height: number;
  mobile: boolean;
};

type Palette = {
  bell: string;
  inner: string;
  vein: string;
  core: string;
  highlight: string;
  rim: string;
  glow: string;
  tentacle: string;
};

type TentacleConfig = {
  offset: number;
  length: number;
  thickness: number;
  sway: number;
  curl: number;
  phase: number;
  alpha: number;
  isOralArm: boolean;
};

type JellyfishPreset = {
  x: number;
  y: number;
  baseSize: number;
  depth: number;
  hueShift: number;
  phase: number;
};

type PixiApplication = import('pixi.js').Application;
type PixiGraphics = import('pixi.js').Graphics;

// ===========================================
// Constants
// ===========================================

const MOBILE_BREAKPOINT = 768;
const HERO_SELECTOR = '.Hero';
const HERO_BG_SELECTOR = '.js-hero-bg';
const TAU = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;
const CLICK_PULSE_DURATION = 1.4;
const CLICK_PULSE_STRENGTH = 0.8;
const COLLISION_SOFTNESS = 0.35;

// Desktop: 1 bold hero, 1 medium, 1 medium-small, 1 small accent
const DESKTOP_PRESETS: JellyfishPreset[] = [
  { x: 0.72, y: 0.36, baseSize: 215, depth: 1.0, hueShift: 0, phase: 0.0 },
  { x: 0.56, y: 0.13, baseSize: 118, depth: 0.36, hueShift: 0.3, phase: 2.1 },
  { x: 0.88, y: 0.58, baseSize: 158, depth: 0.72, hueShift: -0.15, phase: 4.0 },
  { x: 0.93, y: 0.82, baseSize: 90, depth: 0.28, hueShift: 0.5, phase: 5.5 },
];

// Mobile: 1 bold hero, 1 medium, 1 small
const MOBILE_PRESETS: JellyfishPreset[] = [
  { x: 0.66, y: 0.30, baseSize: 168, depth: 1.0, hueShift: 0, phase: 0.0 },
  { x: 0.84, y: 0.60, baseSize: 122, depth: 0.65, hueShift: -0.15, phase: 2.8 },
  { x: 0.74, y: 0.86, baseSize: 84, depth: 0.30, hueShift: 0.4, phase: 4.7 },
];

// ===========================================
// Math utilities
// ===========================================

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function seededRng(seed: number) {
  let s = seed >>> 0;

  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function rotate(p: Vec2, angle: number): Vec2 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

// ===========================================
// Drawing helpers
// ===========================================

function strokeCurve(g: PixiGraphics, pts: Vec2[], color: string, width: number, alpha: number) {
  if (pts.length < 2) return;

  g.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length - 1; i += 1) {
    const cur = pts[i];
    const nxt = pts[i + 1];

    g.quadraticCurveTo(cur.x, cur.y, (cur.x + nxt.x) / 2, (cur.y + nxt.y) / 2);
  }

  g.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  g.stroke({ color, width, alpha, cap: 'round', join: 'round' });
}

function fillClosed(g: PixiGraphics, pts: Vec2[], color: string, alpha: number) {
  if (pts.length < 3) return;

  const ring = [...pts, pts[0], pts[1]];
  const sx = (pts[0].x + pts[1].x) / 2;
  const sy = (pts[0].y + pts[1].y) / 2;

  g.moveTo(sx, sy);

  for (let i = 1; i < ring.length - 1; i += 1) {
    const cur = ring[i];
    const nxt = ring[i + 1];

    g.quadraticCurveTo(cur.x, cur.y, (cur.x + nxt.x) / 2, (cur.y + nxt.y) / 2);
  }

  g.closePath();
  g.fill({ color, alpha });
}

function scalePoints(pts: Vec2[], origin: Vec2, sx: number, sy: number, dy = 0): Vec2[] {
  return pts.map((p) => ({
    x: origin.x + (p.x - origin.x) * sx,
    y: origin.y + (p.y - origin.y) * sy + dy,
  }));
}

// ===========================================
// Bell geometry
// ===========================================

function buildBell(center: Vec2, w: number, h: number, pulse: number, tilt: number): Vec2[] {
  const squeeze = 1 - pulse * 0.08;
  const stretch = 1 + pulse * 0.04;
  const lift = pulse * h * 0.12;
  const hw = w * squeeze;
  const hh = h * stretch;

  const local: Vec2[] = [
    // Dome path (0–10): smooth broad arc
    { x: -hw * 0.48, y: hh * 0.02 - lift * 0.4 },
    { x: -hw * 0.56, y: -hh * 0.10 },
    { x: -hw * 0.54, y: -hh * 0.28 },
    { x: -hw * 0.44, y: -hh * 0.46 },
    { x: -hw * 0.26, y: -hh * 0.62 },
    { x: -hw * 0.02, y: -hh * 0.70 },
    { x: hw * 0.24, y: -hh * 0.64 },
    { x: hw * 0.44, y: -hh * 0.46 },
    { x: hw * 0.54, y: -hh * 0.26 },
    { x: hw * 0.56, y: -hh * 0.08 },
    { x: hw * 0.46, y: hh * 0.02 - lift * 0.4 },
    // Bottom margin (11–14): gentle scallop
    { x: hw * 0.26, y: hh * 0.10 },
    { x: hw * 0.02, y: hh * 0.14 + lift * 0.08 },
    { x: -hw * 0.18, y: hh * 0.12 + lift * 0.04 },
    { x: -hw * 0.34, y: hh * 0.08 },
  ];

  return local.map((p) => {
    const r = rotate(p, tilt);

    return { x: center.x + r.x, y: center.y + r.y };
  });
}

// ===========================================
// Palette
// ===========================================

function createPalette(): Palette {
  return {
    bell: '#ccc6f0',
    inner: '#e0dcff',
    vein: '#8ec8d4',
    core: '#e8e2ff',
    highlight: '#ffffff',
    rim: '#9890c0',
    glow: '#beb6f0',
    tentacle: '#c4bef0',
  };
}

// ===========================================
// Jellyfish entity
// ===========================================

class Jellyfish {
  private readonly preset: JellyfishPreset;
  private readonly tentacles: TentacleConfig[];
  private readonly depthAlpha: number;
  pos: Vec2 = { x: 0, y: 0 };
  vel: Vec2 = { x: 0, y: 0 };
  private nudgeVel: Vec2 = { x: 0, y: 0 };
  private bellW = 0;
  private bellH = 0;
  private tilt = 0;
  private pulse = 0;

  get collisionRadius(): number {
    return (this.bellW + this.bellH) * 0.38;
  }

  get depth(): number {
    return this.preset.depth;
  }

  constructor(preset: JellyfishPreset, seed: number) {
    this.preset = preset;
    this.tentacles = this.buildTentacles(seed);
    this.depthAlpha = lerp(0.38, 1.0, preset.depth);
  }

  resize(vp: Viewport) {
    const scale = vp.mobile ? 0.88 : 1;
    const size = this.preset.baseSize * scale;

    this.bellW = size * 0.52;
    this.bellH = size * 0.62;
    this.pos = { x: vp.width * this.preset.x, y: vp.height * this.preset.y };
    this.vel = { x: 0, y: 0 };
    this.nudgeVel = { x: 0, y: 0 };
    this.tilt = 0;
    this.pulse = 0.3;
  }

  nudge(fx: number, fy: number) {
    this.nudgeVel.x += fx;
    this.nudgeVel.y += fy;
  }

  update(time: number, dt: number, vp: Viewport, ptr: PointerState, pulses: ClickPulse[]) {
    const sec = time * 0.001;
    const phase = this.preset.phase;
    const speed = lerp(0.5, 0.85, this.preset.depth);
    const cycle = (Math.sin(sec * speed + phase) + 1) * 0.5;
    const pulsed = smoothstep(cycle);

    const driftX =
      Math.sin(sec * 0.10 + phase) * vp.width * 0.030
      + Math.sin(sec * 0.23 + phase * 1.7) * vp.width * 0.012;
    const driftY =
      Math.cos(sec * 0.14 + phase * 1.3) * vp.height * 0.025
      + Math.cos(sec * 0.31 + phase * 0.6) * vp.height * 0.010;
    const propLift = (0.5 - pulsed) * this.bellH * 0.32;

    const pdx = (ptr.x - this.pos.x) / Math.max(vp.width, 1);
    const pdy = (ptr.y - this.pos.y) / Math.max(vp.height, 1);
    const pdist = Math.hypot(pdx, pdy);
    const pInf = ptr.active
      ? clamp(1 - pdist * 2, 0, 1) * ptr.energy * lerp(0.35, 0.65, this.preset.depth)
      : 0;

    let pulseForceX = 0;
    let pulseForceY = 0;

    for (const p of pulses) {
      const age = (time - p.birth) * 0.001;

      if (age > CLICK_PULSE_DURATION) continue;

      const decay = 1 - age / CLICK_PULSE_DURATION;
      const eased = decay * decay;
      const cpx = this.pos.x - p.x;
      const cpy = this.pos.y - p.y;
      const cdist = Math.hypot(cpx, cpy);
      const radius = Math.max(vp.width, vp.height) * 0.3;

      if (cdist < 1 || cdist > radius) continue;

      const influence = clamp(1 - cdist / radius, 0, 1);
      const force = p.strength * eased * influence * 60;

      pulseForceX += (cpx / cdist) * force;
      pulseForceY += (cpy / cdist) * force;
    }

    const targetX =
      vp.width * this.preset.x + driftX
      + pdx * vp.width * 0.12 * pInf
      + pulseForceX * dt;
    const targetY =
      vp.height * this.preset.y + driftY + propLift
      - pdy * vp.height * 0.06 * pInf
      + pulseForceY * dt;
    const follow = 1 - Math.exp(-dt * (1.2 + this.preset.depth * 0.5));

    const nx = lerp(this.pos.x, targetX, follow) + this.nudgeVel.x;
    const ny = lerp(this.pos.y, targetY, follow) + this.nudgeVel.y;

    this.nudgeVel.x *= 0.88;
    this.nudgeVel.y *= 0.88;

    if (Math.abs(this.nudgeVel.x) < 0.01) this.nudgeVel.x = 0;
    if (Math.abs(this.nudgeVel.y) < 0.01) this.nudgeVel.y = 0;

    this.vel = { x: nx - this.pos.x, y: ny - this.pos.y };
    this.pos = { x: nx, y: ny };
    this.pulse = lerp(this.pulse, pulsed, 0.15);
    this.tilt = lerp(
      this.tilt,
      Math.sin(sec * 0.18 + phase) * 0.12
        + Math.sin(sec * 0.37 + phase * 2.1) * 0.04
        + this.vel.x * 0.03
        + pdx * pInf * 0.18,
      0.08,
    );
  }

  render(g: PixiGraphics, palette: Palette, time: number) {
    const da = this.depthAlpha;
    const bell = buildBell(this.pos, this.bellW, this.bellH, this.pulse, this.tilt);
    const dome = bell.slice(0, 11);
    const innerBell = scalePoints(bell, this.pos, 0.78, 0.72, -this.bellH * 0.04);
    const coreBell = scalePoints(bell, this.pos, 0.38, 0.42, this.bellH * 0.02);

    this.renderTentacles(g, palette, time);
    fillClosed(g, bell, palette.bell, 0.42 * da);
    fillClosed(g, innerBell, palette.inner, 0.26 * da);
    this.renderVeins(g, palette, da);
    fillClosed(g, coreBell, palette.core, 0.22 * da);
    strokeCurve(g, dome, palette.rim, Math.max(1.5, this.bellW * 0.028), 0.50 * da);

    const innerDome = scalePoints(dome, this.pos, 0.82, 0.76, -this.bellH * 0.03);

    strokeCurve(g, innerDome, palette.highlight, Math.max(1, this.bellW * 0.014), 0.20 * da);

    const hlSlice = dome.slice(2, 7);
    const hlScaled = scalePoints(hlSlice, this.pos, 0.62, 0.55, -this.bellH * 0.12);

    strokeCurve(g, hlScaled, palette.highlight, Math.max(1, this.bellW * 0.018), 0.28 * da);
  }

  private renderVeins(g: PixiGraphics, palette: Palette, da: number) {
    const cx = this.pos.x;
    const cy = this.pos.y;
    const count = 4;

    for (let i = 0; i < count; i += 1) {
      const angle = -HALF_PI + (i / (count - 1) - 0.5) * 1.4 + this.tilt;
      const len = this.bellH * lerp(0.30, 0.48, Math.abs(i / (count - 1) - 0.5) * 2);
      const startR = this.bellH * 0.08;
      const p1 = rotate({ x: 0, y: -startR }, angle);
      const p2 = rotate({ x: 0, y: -len }, angle);
      const mid = rotate({ x: this.bellW * 0.03 * (i % 2 === 0 ? 1 : -1), y: -len * 0.6 }, angle);

      g.moveTo(cx + p1.x, cy + p1.y);
      g.quadraticCurveTo(cx + mid.x, cy + mid.y, cx + p2.x, cy + p2.y);
      g.stroke({
        color: palette.vein,
        width: Math.max(0.5, this.bellW * 0.007),
        alpha: 0.12 * da,
        cap: 'round',
      });
    }
  }

  private buildTentacles(seed: number): TentacleConfig[] {
    const rng = seededRng(seed);
    const offsets = [-0.34, -0.20, -0.08, 0.05, 0.18, 0.32];

    return offsets.map((offset, i) => {
      const isCenter = i === 2 || i === 3;

      return {
        offset,
        length: isCenter ? 0.9 + rng() * 0.3 : 0.6 + rng() * 0.4,
        thickness: isCenter ? 1.1 + rng() * 0.3 : 0.7 + rng() * 0.5,
        sway: 0.8 + rng() * 0.8,
        curl: -0.5 + rng() * 1.0,
        phase: rng() * TAU,
        alpha: lerp(0.18, 0.32, rng()),
        isOralArm: i === 1 || i === 4,
      };
    });
  }

  private renderTentacles(g: PixiGraphics, palette: Palette, time: number) {
    const sec = time * 0.001;
    const da = this.depthAlpha;

    // Match bell geometry to anchor tentacles on the actual rim
    const squeeze = 1 - this.pulse * 0.08;
    const stretch = 1 + this.pulse * 0.04;
    const lift = this.pulse * this.bellH * 0.12;
    const hw = this.bellW * squeeze;
    const hh = this.bellH * stretch;

    for (const t of this.tentacles) {
      const segments = t.isOralArm ? 5 : 8;

      const rimX = hw * t.offset;
      const edgeFactor = clamp(Math.abs(t.offset) / 0.48, 0, 1);
      const ef2 = edgeFactor * edgeFactor;
      const rimY = lerp(hh * 0.12, hh * 0.02, ef2) + lerp(lift * 0.06, -lift * 0.3, ef2);

      const anchor = rotate({ x: rimX, y: rimY }, this.tilt);
      const start: Vec2 = { x: this.pos.x + anchor.x, y: this.pos.y + anchor.y };
      const pts: Vec2[] = [start];

      for (let s = 1; s <= segments; s += 1) {
        const prog = s / segments;
        const wave1 =
          Math.sin(sec * t.sway * 0.7 + t.phase + prog * 2.2) * this.bellW * 0.16;
        const wave2 =
          Math.sin(sec * t.sway * 1.4 + t.phase * 1.7 + prog * 3.6) * this.bellW * 0.07;
        const wave = (wave1 + wave2) * (0.3 + prog * 0.7);
        const drag = this.vel.x * 24 * prog;
        const curlX = t.curl * this.bellW * 0.24 * prog * prog;

        pts.push({
          x: start.x + drag + wave + curlX,
          y: start.y + this.bellH * t.length * prog + Math.abs(this.vel.y) * 18 * prog,
        });
      }

      const baseW = t.isOralArm
        ? Math.max(1.2, this.bellW * 0.02 * t.thickness)
        : Math.max(0.8, this.bellW * 0.014 * t.thickness);

      strokeCurve(g, pts, palette.tentacle, baseW, t.alpha * da);
    }
  }
}

// ===========================================
// Background orchestrator
// ===========================================

class HeroJellyfishBackground {
  private readonly container: HTMLElement;
  private readonly section: HTMLElement;
  private readonly motionQuery: MediaQueryList;
  private readonly palette = createPalette();
  private readonly pointer: PointerState = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    energy: 0,
    active: false,
  };
  private app: PixiApplication | null = null;
  private graphics: PixiGraphics | null = null;
  private jellyfish: Jellyfish[] = [];
  private clickPulses: ClickPulse[] = [];
  private viewport: Viewport = { width: 1, height: 1, mobile: false };
  private resizeFrame = 0;
  private reducedMotion = false;
  private isVisible = true;
  private isIntersecting = true;
  private destroyed = false;
  private lastTime = 0;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(section: HTMLElement, container: HTMLElement) {
    this.section = section;
    this.container = container;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
  }

  async init() {
    const { Application, Graphics } = await import('pixi.js');

    if (!this.container.isConnected || !this.section.isConnected) {
      activeBackground = null;
      delete this.container.dataset.heroBgLoading;
      return;
    }

    const app = new Application();

    await app.init({
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    if (!this.container.isConnected || !this.section.isConnected) {
      app.destroy();
      activeBackground = null;
      delete this.container.dataset.heroBgLoading;
      return;
    }

    const graphics = new Graphics();

    this.app = app;
    this.graphics = graphics;

    app.canvas.classList.add('Hero__pixiCanvas');
    app.canvas.setAttribute('aria-hidden', 'true');
    app.canvas.setAttribute('role', 'presentation');
    app.canvas.setAttribute('focusable', 'false');
    app.stage.addChild(graphics);
    this.container.append(app.canvas);

    this.bindEvents();
    this.handleResize();
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

    this.app?.destroy();
    activeBackground = null;
    delete this.container.dataset.heroBgLoading;
    delete this.container.dataset.heroBgReady;
  };

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
      { threshold: 0.08 },
    );
    this.intersectionObserver.observe(this.section);

    if (!this.reducedMotion) {
      this.section.addEventListener('pointermove', this.handlePointerMove);
      this.section.addEventListener('pointerdown', this.handlePointerDown);
      this.section.addEventListener('pointerleave', this.handlePointerLeave);
      this.section.addEventListener('pointercancel', this.handlePointerLeave);
    }
  }

  private handleResize() {
    if (!this.app || !this.graphics || this.destroyed) return;

    const width = Math.max(1, Math.round(this.container.clientWidth));
    const height = Math.max(1, Math.round(this.container.clientHeight));

    this.viewport = { width, height, mobile: window.innerWidth < MOBILE_BREAKPOINT };
    this.app.renderer.resize(width, height);
    this.pointer.x = width * 0.78;
    this.pointer.y = height * 0.42;
    this.pointer.targetX = this.pointer.x;
    this.pointer.targetY = this.pointer.y;
    this.jellyfish = this.createJellyfish();
    this.clickPulses = [];
    this.lastTime = performance.now();
    this.render(this.lastTime, !this.reducedMotion);
  }

  private createJellyfish() {
    const presets = this.viewport.mobile ? MOBILE_PRESETS : DESKTOP_PRESETS;

    return presets.map((preset, index) => {
      const jf = new Jellyfish(preset, 1000 + index * 97);

      jf.resize(this.viewport);
      return jf;
    });
  }

  private resolveCollisions() {
    const jfs = this.jellyfish;

    for (let i = 0; i < jfs.length; i += 1) {
      for (let j = i + 1; j < jfs.length; j += 1) {
        const a = jfs[i];
        const b = jfs[j];
        const dx = b.pos.x - a.pos.x;
        const dy = b.pos.y - a.pos.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.collisionRadius + b.collisionRadius;

        if (dist >= minDist || dist < 0.001) continue;

        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        const push = overlap * COLLISION_SOFTNESS;
        const totalDepth = a.depth + b.depth;
        const ratioA = totalDepth > 0 ? b.depth / totalDepth : 0.5;
        const ratioB = totalDepth > 0 ? a.depth / totalDepth : 0.5;

        a.nudge(-nx * push * ratioA, -ny * push * ratioA);
        b.nudge(nx * push * ratioB, ny * push * ratioB);
      }
    }
  }

  private render(time: number, animate: boolean) {
    const g = this.graphics;

    if (!g) return;

    if (animate) {
      const dt = clamp((time - this.lastTime) / 1000, 0.001, 0.04);

      this.lastTime = time;
      this.pointer.x = lerp(this.pointer.x, this.pointer.targetX, 0.06);
      this.pointer.y = lerp(this.pointer.y, this.pointer.targetY, 0.06);
      this.pointer.energy = lerp(this.pointer.energy, this.pointer.active ? 1 : 0, 0.08);

      this.clickPulses = this.clickPulses.filter(
        (p) => (time - p.birth) * 0.001 < CLICK_PULSE_DURATION,
      );

      this.jellyfish.forEach((jf) =>
        jf.update(time, dt, this.viewport, this.pointer, this.clickPulses),
      );
      this.resolveCollisions();
    }

    g.clear();
    this.jellyfish.forEach((jf) => jf.render(g, this.palette, time));
  }

  private syncTicker() {
    if (!this.app) return;

    if (this.reducedMotion || !this.isVisible || !this.isIntersecting) {
      this.app.ticker.stop();
      this.render(performance.now(), false);
      return;
    }

    this.lastTime = performance.now();
    this.app.ticker.start();
  }

  private readonly tick = () => {
    if (this.destroyed || !this.container.isConnected || !this.section.isConnected) {
      this.destroy();
      return;
    }

    this.render(performance.now(), true);
  };

  private readonly handlePointerMove = (event: PointerEvent) => {
    const bounds = this.section.getBoundingClientRect();

    if (!bounds.width || !bounds.height) {
      this.pointer.active = false;
      return;
    }

    this.pointer.targetX = clamp(event.clientX - bounds.left, 0, bounds.width);
    this.pointer.targetY = clamp(event.clientY - bounds.top, 0, bounds.height);
    this.pointer.active = true;
  };

  private readonly handlePointerDown = (event: PointerEvent) => {
    const bounds = this.section.getBoundingClientRect();

    if (!bounds.width || !bounds.height) return;

    const x = clamp(event.clientX - bounds.left, 0, bounds.width);
    const y = clamp(event.clientY - bounds.top, 0, bounds.height);

    this.clickPulses.push({
      x,
      y,
      birth: performance.now(),
      strength: CLICK_PULSE_STRENGTH,
    });

    if (this.clickPulses.length > 5) {
      this.clickPulses = this.clickPulses.slice(-5);
    }
  };

  private readonly handlePointerLeave = () => {
    this.pointer.targetX = this.viewport.width * 0.78;
    this.pointer.targetY = this.viewport.height * 0.42;
    this.pointer.active = false;
  };

  private readonly handleMotionChange = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;

    this.section.removeEventListener('pointermove', this.handlePointerMove);
    this.section.removeEventListener('pointerdown', this.handlePointerDown);
    this.section.removeEventListener('pointerleave', this.handlePointerLeave);
    this.section.removeEventListener('pointercancel', this.handlePointerLeave);

    if (!this.reducedMotion) {
      this.section.addEventListener('pointermove', this.handlePointerMove);
      this.section.addEventListener('pointerdown', this.handlePointerDown);
      this.section.addEventListener('pointerleave', this.handlePointerLeave);
      this.section.addEventListener('pointercancel', this.handlePointerLeave);
    } else {
      this.handlePointerLeave();
    }

    this.syncTicker();
    this.render(performance.now(), false);
  };

  private readonly handleVisibilityChange = () => {
    this.isVisible = !document.hidden;
    this.syncTicker();
  };
}

// ===========================================
// Bootstrap
// ===========================================

let activeBackground: HeroJellyfishBackground | null = null;

async function boot() {
  const container = document.querySelector<HTMLElement>(HERO_BG_SELECTOR);
  const section = container?.closest<HTMLElement>(HERO_SELECTOR);

  if (!container || !section || container.dataset.heroBgLoading === 'true' || activeBackground) return;

  container.dataset.heroBgLoading = 'true';

  try {
    const background = new HeroJellyfishBackground(section, container);

    activeBackground = background;
    await background.init();
  } catch (error) {
    activeBackground = null;
    delete container.dataset.heroBgLoading;
    console.error('[hero-pixi-bg] Failed to initialize jellyfish hero background.', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void boot();
  }, { once: true });
} else {
  void boot();
}
