// @ts-nocheck — heerich has no type declarations

const IS_SP = window.matchMedia('(max-width: 767px)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const BASE_ANGLE = 315;
const BASE_DISTANCE = 20;

const heerichReady = import('heerich');
const animejsReady = REDUCED_MOTION ? null : import('animejs');

function buildScene(h: any) {
  h.clear();
  const s = IS_SP ? 6 : 8;
  const half = s / 2;

  h.addBox({ position: [0, 0, 0], size: [s, s, s] });
  h.removeSphere({ center: [half, half, half], radius: half + .5 });

  const arm = IS_SP ? 2 : 3;
  const off = Math.floor((s - arm) / 2);

  h.addBox({ position: [off, -2, off], size: [arm, s + 4, arm], mode: 'union' });
  h.addBox({ position: [-2, off, off], size: [s + 4, arm, arm], mode: 'union' });
  h.addBox({ position: [off, off, -2], size: [arm, arm, s + 4], mode: 'union' });
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

async function init() {
  const container = document.querySelector<HTMLElement>('.js-hero-bg');
  if (!container) return;
  const heroSection = container.closest('.Hero') as HTMLElement;
  if (!heroSection) return;

  const { Heerich } = await heerichReady!;

  const engine = new Heerich({
    tile: IS_SP ? [18, 18] : [28, 28],
    camera: { type: 'oblique', angle: BASE_ANGLE, distance: BASE_DISTANCE },
    style: { fill: 'none', stroke: 'rgba(26, 27, 30, 0.14)', strokeWidth: .5 },
  });
  buildScene(engine);

  // ===========================================
  // State
  // ===========================================

  let currentAngle = BASE_ANGLE;
  let currentDistance = BASE_DISTANCE;
  let targetAngle = BASE_ANGLE;
  let targetDistance = BASE_DISTANCE;
  let frozenAngle = BASE_ANGLE;
  let frozenDistance = BASE_DISTANCE;
  let isIdle = !IS_SP;
  let idleTimer: ReturnType<typeof setTimeout>;
  let scrollLocked = false;
  let rafId: number | null = null;

  interface ScatterItem {
    el: SVGPolygonElement;
    tx: number;
    ty: number;
    rot: number;
    nd: number;
  }
  let scatterData: ScatterItem[] = [];

  // ===========================================
  // Render
  // ===========================================

  function renderSvg(angle: number, distance: number) {
    engine.setCamera({ type: 'oblique', angle, distance });
    container.innerHTML = engine.toSVG({ padding: 10 });
  }

  renderSvg(BASE_ANGLE, BASE_DISTANCE);

  // ===========================================
  // Entrance animation (anime.js — lazy loaded)
  // ===========================================

  async function playEntrance(onDone: () => void) {
    const svgEl = container.querySelector('svg');
    if (!svgEl) { onDone(); return; }

    const bbox = svgEl.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const maxDist = Math.hypot(bbox.width / 2, bbox.height / 2) || 1;

    const polys = container.querySelectorAll('polygon');
    polys.forEach(p => { p.style.opacity = '0'; });

    const { animate } = await animejsReady!;

    animate(polys, {
      opacity: [0, 1],
      delay: (el: SVGPolygonElement) => {
        const b = el.getBBox();
        const d = Math.hypot(b.x + b.width / 2 - cx, b.y + b.height / 2 - cy);
        return (d / maxDist) * 500;
      },
      duration: 600,
      ease: 'outExpo',
      onComplete: () => {
        polys.forEach(p => { p.style.opacity = ''; });
        onDone();
      },
    });
  }

  // ===========================================
  // Animation loop (always running)
  // ===========================================

  const LERP = .05;
  const IDLE_SPEED = .012;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  function tick() {
    if (isIdle && !scrollLocked) {
      targetAngle += IDLE_SPEED;
      targetDistance = BASE_DISTANCE;
    }

    const pa = currentAngle;
    const pd = currentDistance;
    currentAngle = lerp(currentAngle, targetAngle, LERP);
    currentDistance = lerp(currentDistance, targetDistance, LERP);

    const moved =
      Math.abs(currentAngle - pa) > .005 ||
      Math.abs(currentDistance - pd) > .005;

    if (scrollLocked) {
      const svgEl = container.querySelector('svg');
      if (svgEl) {
        const clamp = (v: number, lo: number, hi: number) =>
          Math.max(lo, Math.min(hi, v));
        const ry = clamp((currentAngle - frozenAngle) * .5, -15, 15);
        const rx = clamp(-(currentDistance - frozenDistance) * .5, -8, 8);
        svgEl.style.transformOrigin = '50% 50%';
        svgEl.style.transform =
          `perspective(800px) rotateY(${ry}deg) rotateX(${rx}deg)`;
      }
    } else {
      if (moved) renderSvg(currentAngle, currentDistance);
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLive() {
    if (!rafId && !REDUCED_MOTION) rafId = requestAnimationFrame(tick);
  }

  // ===========================================
  // PC: mouse tracking
  // ===========================================

  if (!IS_SP && !REDUCED_MOTION) {
    heroSection.addEventListener('mousemove', ((e: MouseEvent) => {
      isIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { isIdle = true; targetAngle = currentAngle; }, 3000);

      const rect = heroSection.getBoundingClientRect();
      targetAngle = BASE_ANGLE + ((e.clientX - rect.left) / rect.width - .5) * 30;
      targetDistance = BASE_DISTANCE + ((e.clientY - rect.top) / rect.height - .5) * 6;
    }) as EventListener);
  }

  // ===========================================
  // SP: gyroscope tracking
  // ===========================================

  if (IS_SP && !REDUCED_MOTION) {
    let gyroActive = false;

    function handleOrientation(e: DeviceOrientationEvent) {
      if (!gyroActive) { gyroActive = true; startLive(); }

      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      targetAngle = BASE_ANGLE + (gamma / 90) * 15;
      targetDistance = BASE_DISTANCE + ((beta - 70) / 90) * 4;
    }

    function startGyro() {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE !== 'undefined' && typeof DOE.requestPermission === 'function') {
      document.addEventListener('touchstart', async () => {
        try {
          if (await DOE.requestPermission() === 'granted') startGyro();
        } catch { /* permission denied or unavailable */ }
      }, { once: true });
    } else if ('DeviceOrientationEvent' in window) {
      startGyro();
    }
  }

  // ===========================================
  // Scroll: voxel disassembly
  // ===========================================

  function getScrollProgress(): number {
    const rect = heroSection.getBoundingClientRect();
    return Math.max(0, Math.min(1, -rect.top / (rect.height * .4)));
  }

  function prepareScatter() {
    frozenAngle = currentAngle;
    frozenDistance = currentDistance;

    const svgEl = container.querySelector('svg');
    if (!svgEl) return;
    const polygons = svgEl.querySelectorAll('polygon');
    if (!polygons.length) return;

    const bbox = svgEl.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const maxDist = Math.hypot(bbox.width / 2, bbox.height / 2) || 1;

    scatterData = Array.from(polygons).map(poly => {
      const pb = poly.getBBox();
      const px = pb.x + pb.width / 2;
      const py = pb.y + pb.height / 2;
      const dx = px - cx;
      const dy = py - cy;
      const d = Math.hypot(dx, dy) || 1;
      const scatter = IS_SP ? 120 + Math.random() * 200 : 200 + Math.random() * 400;

      return {
        el: poly,
        tx: (dx / d) * scatter + (Math.random() - .5) * 80,
        ty: (dy / d) * scatter + (Math.random() - .5) * 80,
        rot: (Math.random() - .5) * 240,
        nd: d / maxDist,
      };
    });
  }

  function applyScatter(progress: number) {
    for (const { el, tx, ty, rot, nd } of scatterData) {
      const staggered = Math.max(0, Math.min(1,
        (progress * 1.6 - (1 - nd) * .6)
      ));
      const e = easeOutCubic(staggered);
      el.style.transform = `translate(${tx * e}px, ${ty * e}px) rotate(${rot * e}deg)`;
      el.style.opacity = String(Math.max(0, 1 - e * 1.3));
    }
  }

  function clearScatter() {
    const svgEl = container.querySelector('svg');
    if (svgEl) {
      svgEl.style.transform = '';
      svgEl.style.transformOrigin = '';
    }
    for (const { el } of scatterData) {
      el.style.transform = '';
      el.style.opacity = '';
    }
    scatterData = [];
  }

  let lastProgress = -1;
  let scrollRaf: number | null = null;

  window.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      const p = getScrollProgress();
      if (Math.abs(p - lastProgress) < .001) return;
      lastProgress = p;

      if (p > .005 && !scrollLocked) {
        scrollLocked = true;
        prepareScatter();
      }

      if (scrollLocked) applyScatter(p);

      if (p <= .005 && scrollLocked) {
        scrollLocked = false;
        clearScatter();
      }
    });
  }, { passive: true });

  // ===========================================
  // Boot
  // ===========================================

  if (REDUCED_MOTION) return;

  playEntrance(() => {
    startLive();
  });
}

function deferInit() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => init(), { timeout: 2000 });
  } else {
    setTimeout(init, 200);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', deferInit);
} else {
  deferInit();
}
