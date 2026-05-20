export {};

// ===========================================
// Hero "Ink Bloom" background
// Cursor-reactive sumi-nagashi style blobs rendered via Pixi.js v8.
// ===========================================

type PixiApplication = import('pixi.js').Application;
type PixiSprite = import('pixi.js').Sprite;
type PixiTexture = import('pixi.js').Texture;
type PixiContainer = import('pixi.js').Container;

type Viewport = {
  width: number;
  height: number;
  mobile: boolean;
};

type Blob = {
  sprite: PixiSprite;
  active: boolean;
  age: number;
  life: number;
  startScale: number;
  endScale: number;
  startAlpha: number;
  vx: number;
  vy: number;
};

const HERO_SELECTOR = '.Hero';
const HERO_BG_SELECTOR = '.js-hero-bg';
const MOBILE_BREAKPOINT = 768;

const INK_PRIMARY = 0x3a3430;
const INK_ACCENT = 0x8a6a4a;
const BLOB_TEX_SIZE = 256;

// Sub-system tuning
const DESKTOP = {
  maxBlobs: 96,
  trailStep: 12,
  ambientIntervalMs: 1100,
  resolutionCap: 2,
};

const MOBILE = {
  maxBlobs: 48,
  trailStep: 18,
  ambientIntervalMs: 1500,
  resolutionCap: 1.5,
};

// ===========================================
// Utilities
// ===========================================

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function createBlobTexture(Texture: typeof import('pixi.js').Texture): PixiTexture {
  const canvas = document.createElement('canvas');
  canvas.width = BLOB_TEX_SIZE;
  canvas.height = BLOB_TEX_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Texture.WHITE;

  const r = BLOB_TEX_SIZE * 0.5;
  // Slightly off-centre core gives the bloom a more organic, ink-like feel.
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.78)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.32)');
  grad.addColorStop(0.78, 'rgba(255,255,255,0.08)');
  grad.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, BLOB_TEX_SIZE, BLOB_TEX_SIZE);

  return Texture.from(canvas);
}

// ===========================================
// Background controller
// ===========================================

class HeroInkBackground {
  private readonly section: HTMLElement;
  private readonly container: HTMLElement;
  private readonly motionQuery: MediaQueryList;

  private app: PixiApplication | null = null;
  private layer: PixiContainer | null = null;
  private texture: PixiTexture | null = null;
  private blobs: Blob[] = [];

  private viewport: Viewport = { width: 1, height: 1, mobile: false };
  private params = DESKTOP;

  private destroyed = false;
  private reducedMotion = false;
  private isVisible = true;
  private isIntersecting = true;

  private lastPointerX = 0;
  private lastPointerY = 0;
  private hasPointer = false;
  private lastSpawnX = -Infinity;
  private lastSpawnY = -Infinity;
  private lastTickMs = 0;
  private ambientAccumMs = 0;

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
    const { Application, Container, Texture, Sprite } = await import('pixi.js');

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
    });

    if (!this.container.isConnected || !this.section.isConnected) {
      app.destroy();
      activeBackground = null;
      delete this.container.dataset.heroBgLoading;
      return;
    }

    this.app = app;
    this.texture = createBlobTexture(Texture);
    this.layer = new Container();
    app.stage.addChild(this.layer);

    this.spriteFactory = (tex: PixiTexture) => {
      const s = new Sprite(tex);
      s.anchor.set(0.5);
      return s;
    };

    app.canvas.classList.add('Hero__pixiCanvas');
    app.canvas.setAttribute('aria-hidden', 'true');
    app.canvas.setAttribute('role', 'presentation');
    app.canvas.setAttribute('focusable', 'false');
    this.container.append(app.canvas);

    this.bindEvents();
    this.handleResize();
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
    this.blobs = [];
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

    // Click bursts are always available (even with reduced motion) because they
    // are a discrete, user-initiated reward. Trail is suppressed below.
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
  }

  private readonly handlePointerMove = (e: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!this.hasPointer) {
      this.lastPointerX = x;
      this.lastPointerY = y;
      this.lastSpawnX = x;
      this.lastSpawnY = y;
      this.hasPointer = true;
      return;
    }

    const dx = x - this.lastSpawnX;
    const dy = y - this.lastSpawnY;
    const dist = Math.hypot(dx, dy);

    if (dist >= this.params.trailStep) {
      const stepDx = x - this.lastPointerX;
      const stepDy = y - this.lastPointerY;
      const speed = Math.hypot(stepDx, stepDy);
      this.spawnTrailBlob(x, y, speed);
      this.lastSpawnX = x;
      this.lastSpawnY = y;
    }

    this.lastPointerX = x;
    this.lastPointerY = y;
  };

  private readonly handlePointerDown = (e: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.spawnClickBurst(x, y);
  };

  private readonly handlePointerLeave = () => {
    this.hasPointer = false;
  };

  private readonly handleMotionChange = (e: MediaQueryListEvent) => {
    this.reducedMotion = e.matches;
    // Re-bind move listeners depending on the new preference.
    this.section.removeEventListener('pointermove', this.handlePointerMove);
    this.section.removeEventListener('pointerleave', this.handlePointerLeave);
    this.section.removeEventListener('pointercancel', this.handlePointerLeave);
    if (!this.reducedMotion) {
      this.section.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      this.section.addEventListener('pointerleave', this.handlePointerLeave);
      this.section.addEventListener('pointercancel', this.handlePointerLeave);
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
  // Blob pool
  // -----------------------------------------

  // Sprite factory wired up after pixi import in init().
  private spriteFactory: ((tex: PixiTexture) => PixiSprite) | null = null;

  private acquireBlob(): Blob | null {
    for (let i = 0; i < this.blobs.length; i += 1) {
      const b = this.blobs[i];
      if (!b.active) return b;
    }

    if (this.blobs.length >= this.params.maxBlobs) {
      // At capacity: recycle the blob closest to the end of its life.
      let oldest = this.blobs[0];
      let oldestT = oldest.age / oldest.life;
      for (let i = 1; i < this.blobs.length; i += 1) {
        const t = this.blobs[i].age / this.blobs[i].life;
        if (t > oldestT) {
          oldest = this.blobs[i];
          oldestT = t;
        }
      }
      return oldest;
    }

    return null;
  }

  // -----------------------------------------
  // Spawning
  // -----------------------------------------

  private spawnTrailBlob(x: number, y: number, speed: number) {
    if (!this.spriteFactory || !this.texture || !this.layer) return;
    const speedT = clamp(speed / 60, 0, 1);
    const radius = lerp(28, 64, speedT) * (this.viewport.mobile ? 0.78 : 1);
    const life = rand(1.6, 2.4);
    const alpha = lerp(0.14, 0.26, speedT);
    const tint = Math.random() < 0.08 ? INK_ACCENT : INK_PRIMARY;
    this.spawnBlob(x, y, radius, radius * rand(2.6, 3.4), life, alpha, tint, rand(-8, 8), rand(-6, 4));
  }

  private spawnClickBurst(x: number, y: number) {
    if (!this.spriteFactory || !this.texture || !this.layer) return;
    const baseRadius = (this.viewport.mobile ? 64 : 88);
    this.spawnBlob(x, y, baseRadius, baseRadius * 4.6, 2.6, 0.32, INK_PRIMARY, 0, 0);

    const ringCount = this.viewport.mobile ? 6 : 8;
    const ringDist = baseRadius * 0.7;
    for (let i = 0; i < ringCount; i += 1) {
      const angle = (i / ringCount) * Math.PI * 2 + Math.random() * 0.4;
      const rx = x + Math.cos(angle) * ringDist * rand(0.6, 1.2);
      const ry = y + Math.sin(angle) * ringDist * rand(0.6, 1.2);
      const tint = Math.random() < 0.18 ? INK_ACCENT : INK_PRIMARY;
      this.spawnBlob(
        rx,
        ry,
        baseRadius * rand(0.4, 0.7),
        baseRadius * rand(1.8, 2.8),
        rand(1.8, 2.4),
        rand(0.16, 0.24),
        tint,
        Math.cos(angle) * 22,
        Math.sin(angle) * 22,
      );
    }
  }

  private spawnAmbientBlob() {
    if (!this.spriteFactory || !this.texture || !this.layer) return;
    // Bias ambient blobs to the right half where copy is sparse.
    const x = this.viewport.width * rand(0.4, 0.95);
    const y = this.viewport.height * rand(0.1, 0.9);
    const radius = rand(38, 72);
    this.spawnBlob(x, y, radius, radius * rand(2.2, 3.0), rand(3.2, 4.6), rand(0.05, 0.10), INK_PRIMARY, rand(-4, 4), rand(-4, 2));
  }

  private spawnBlob(
    x: number,
    y: number,
    startRadius: number,
    endRadius: number,
    life: number,
    alpha: number,
    tint: number,
    vx: number,
    vy: number,
  ) {
    if (!this.spriteFactory || !this.texture || !this.layer) return;

    let blob = this.acquireBlob();
    if (!blob) {
      const sprite = this.spriteFactory(this.texture);
      this.layer.addChild(sprite);
      blob = {
        sprite,
        active: false,
        age: 0,
        life: 0,
        startScale: 1,
        endScale: 1,
        startAlpha: 0,
        vx: 0,
        vy: 0,
      };
      this.blobs.push(blob);
    }

    const startScale = (startRadius * 2) / BLOB_TEX_SIZE;
    const endScale = (endRadius * 2) / BLOB_TEX_SIZE;

    blob.active = true;
    blob.age = 0;
    blob.life = life;
    blob.startScale = startScale;
    blob.endScale = endScale;
    blob.startAlpha = alpha;
    blob.vx = vx;
    blob.vy = vy;

    blob.sprite.visible = true;
    blob.sprite.x = x;
    blob.sprite.y = y;
    blob.sprite.tint = tint;
    blob.sprite.scale.set(startScale);
    blob.sprite.alpha = alpha;
    blob.sprite.rotation = Math.random() * Math.PI * 2;
  }

  // -----------------------------------------
  // Frame update
  // -----------------------------------------

  private readonly tick = () => {
    if (!this.app || this.destroyed || !this.spriteFactory) return;

    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTickMs) / 1000);
    this.lastTickMs = now;

    // Ambient spawn timer
    this.ambientAccumMs += dt * 1000;
    const ambientInterval = this.params.ambientIntervalMs * rand(0.85, 1.25);
    if (this.ambientAccumMs >= ambientInterval) {
      this.ambientAccumMs = 0;
      this.spawnAmbientBlob();
    }

    // Update each active blob.
    for (let i = 0; i < this.blobs.length; i += 1) {
      const b = this.blobs[i];
      if (!b.active) continue;

      b.age += dt;
      const t = b.age / b.life;

      if (t >= 1) {
        b.active = false;
        b.sprite.visible = false;
        continue;
      }

      const e = easeOutQuad(t);
      const scale = lerp(b.startScale, b.endScale, e);
      const alpha = b.startAlpha * (1 - t);
      b.sprite.scale.set(scale);
      b.sprite.alpha = alpha;
      b.sprite.x += b.vx * dt;
      b.sprite.y += b.vy * dt;
    }
  };
}

// ===========================================
// Bootstrap
// ===========================================

let activeBackground: HeroInkBackground | null = null;

async function boot() {
  const container = document.querySelector<HTMLElement>(HERO_BG_SELECTOR);
  const section = container?.closest<HTMLElement>(HERO_SELECTOR);

  if (!container || !section || container.dataset.heroBgLoading === 'true' || activeBackground) return;

  container.dataset.heroBgLoading = 'true';

  try {
    const background = new HeroInkBackground(section, container);
    activeBackground = background;
    await background.init();
  } catch (error) {
    activeBackground = null;
    delete container.dataset.heroBgLoading;
    console.error('[hero-ink-bg] Failed to initialize ink hero background.', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void boot();
  }, { once: true });
} else {
  void boot();
}
