// @ts-nocheck — heerich has no type declarations

const IS_SP = window.matchMedia('(max-width: 767px)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const BASE_ANGLE = IS_SP ? 330 : 336;
const BASE_DISTANCE = IS_SP ? 14 : 18;
const TILE = IS_SP ? [18, 18] : [24, 24];
const VIEWBOX_PADDING = IS_SP ? 34 : 48;
const CAMERA_FRAME_INTERVAL_MS = IS_SP ? 1600 : 1400;
const CAMERA_FRAME_OFFSETS = IS_SP ? [0, 3, 5.5, 3, 0, -2.5, -4.5, -2.5] : [0, 4, 7, 4, 0, -3, -6, -3];
const STATIC_SCENE_STATE = {
  intro: 1,
  sway: IS_SP ? .22 : .34,
  pulse: Math.PI * .45,
  scatter: 0,
};
const heerichReady = import('heerich');

const STAND_STYLE = {
  default: { fill: '#b0a294', stroke: 'rgba(67, 52, 40, .78)', strokeWidth: .55 },
  top: { fill: '#ddd4cc', stroke: 'rgba(67, 52, 40, .78)', strokeWidth: .55 },
  front: { fill: '#b8ab9e', stroke: 'rgba(67, 52, 40, .78)', strokeWidth: .55 },
  right: { fill: '#9c8b7d', stroke: 'rgba(67, 52, 40, .78)', strokeWidth: .55 },
  left: { fill: '#c4b8ad', stroke: 'rgba(67, 52, 40, .78)', strokeWidth: .55 },
  back: { fill: '#8c7a6b', stroke: 'rgba(67, 52, 40, .78)', strokeWidth: .55 },
};

const POT_STYLE = {
  default: { fill: '#cfaa90', stroke: 'rgba(94, 66, 47, .82)', strokeWidth: .58 },
  top: { fill: '#f0d9cb', stroke: 'rgba(94, 66, 47, .82)', strokeWidth: .58 },
  front: { fill: '#ddbaa5', stroke: 'rgba(94, 66, 47, .82)', strokeWidth: .58 },
  right: { fill: '#c59074', stroke: 'rgba(94, 66, 47, .82)', strokeWidth: .58 },
  left: { fill: '#dbaf98', stroke: 'rgba(94, 66, 47, .82)', strokeWidth: .58 },
  back: { fill: '#b98267', stroke: 'rgba(94, 66, 47, .82)', strokeWidth: .58 },
};

const POT_INNER_STYLE = {
  default: { fill: '#7e6658', stroke: 'rgba(76, 55, 44, .72)', strokeWidth: .48 },
  top: { fill: '#9a7a68', stroke: 'rgba(76, 55, 44, .72)', strokeWidth: .48 },
  front: { fill: '#71594c', stroke: 'rgba(76, 55, 44, .72)', strokeWidth: .48 },
  right: { fill: '#674f43', stroke: 'rgba(76, 55, 44, .72)', strokeWidth: .48 },
  left: { fill: '#84695b', stroke: 'rgba(76, 55, 44, .72)', strokeWidth: .48 },
  back: { fill: '#5d483e', stroke: 'rgba(76, 55, 44, .72)', strokeWidth: .48 },
};

const SOIL_STYLE = {
  default: { fill: '#655244', stroke: 'rgba(50, 38, 31, .7)', strokeWidth: .44 },
  top: { fill: '#7a6453', stroke: 'rgba(50, 38, 31, .7)', strokeWidth: .44 },
  front: { fill: '#5d4c40', stroke: 'rgba(50, 38, 31, .7)', strokeWidth: .44 },
  right: { fill: '#55453a', stroke: 'rgba(50, 38, 31, .7)', strokeWidth: .44 },
  left: { fill: '#6a5748', stroke: 'rgba(50, 38, 31, .7)', strokeWidth: .44 },
  back: { fill: '#4f4036', stroke: 'rgba(50, 38, 31, .7)', strokeWidth: .44 },
};

const TRUNK_STYLE = {
  default: { fill: '#6d513d', stroke: 'rgba(45, 31, 21, .82)', strokeWidth: .58 },
  top: { fill: '#8c694f', stroke: 'rgba(45, 31, 21, .82)', strokeWidth: .58 },
  front: { fill: '#755742', stroke: 'rgba(45, 31, 21, .82)', strokeWidth: .58 },
  right: { fill: '#5d4434', stroke: 'rgba(45, 31, 21, .82)', strokeWidth: .58 },
  left: { fill: '#7d5e48', stroke: 'rgba(45, 31, 21, .82)', strokeWidth: .58 },
  back: { fill: '#563e31', stroke: 'rgba(45, 31, 21, .82)', strokeWidth: .58 },
};

const STONE_STYLE = {
  default: { fill: '#b9b1a9', stroke: 'rgba(78, 75, 71, .62)', strokeWidth: .42 },
  top: { fill: '#e0dad4', stroke: 'rgba(78, 75, 71, .62)', strokeWidth: .42 },
  front: { fill: '#b8b0a8', stroke: 'rgba(78, 75, 71, .62)', strokeWidth: .42 },
  right: { fill: '#9a9087', stroke: 'rgba(78, 75, 71, .62)', strokeWidth: .42 },
  left: { fill: '#c7bfb7', stroke: 'rgba(78, 75, 71, .62)', strokeWidth: .42 },
  back: { fill: '#8e857d', stroke: 'rgba(78, 75, 71, .62)', strokeWidth: .42 },
};

const MOSS_STYLE = {
  default: { fill: '#68784c', stroke: 'rgba(55, 64, 39, .72)', strokeWidth: .42 },
  top: { fill: '#8c9b67', stroke: 'rgba(55, 64, 39, .72)', strokeWidth: .42 },
  front: { fill: '#5a6742', stroke: 'rgba(55, 64, 39, .72)', strokeWidth: .42 },
  right: { fill: '#52603b', stroke: 'rgba(55, 64, 39, .72)', strokeWidth: .42 },
  left: { fill: '#708054', stroke: 'rgba(55, 64, 39, .72)', strokeWidth: .42 },
  back: { fill: '#495637', stroke: 'rgba(55, 64, 39, .72)', strokeWidth: .42 },
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const easeOutCubic = (value: number) => 1 - (1 - clamp(value)) ** 3;
const segmentProgress = (progress: number, start: number, end: number) =>
  easeOutCubic(clamp((progress - start) / (end - start)));

function hash3(x: number, y: number, z: number, seed = 0) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 19.19) * 43758.5453;
  return value - Math.floor(value);
}

function roundPoint(point: number[]) {
  return point.map((value) => Math.round(value));
}

function offsetPoint(point: number[], dx = 0, dy = 0, dz = 0) {
  return roundPoint([point[0] + dx, point[1] + dy, point[2] + dz]);
}

function interpolatePoint(from: number[], to: number[], amount: number) {
  return roundPoint([
    lerp(from[0], to[0], amount),
    lerp(from[1], to[1], amount),
    lerp(from[2], to[2], amount),
  ]);
}

function createLeafFace(seed: number, lightnessShift: number, saturationShift = 0) {
  return (x: number, y: number, z: number) => {
    const noise = hash3(x, y, z, seed);
    const hue = 98 + Math.round(noise * 18);
    const saturation = 30 + Math.round(noise * 16) + saturationShift;
    const lightness = Math.round(28 + -y * .55 + noise * 6 + lightnessShift);

    return {
      fill: `hsl(${hue}, ${Math.max(18, saturation)}%, ${clamp(lightness, 24, 58)}%)`,
      stroke: `hsla(${hue}, 20%, 18%, .5)`,
      strokeWidth: .48,
    };
  };
}

function createLeafStyle(seed: number) {
  return {
    default: createLeafFace(seed, 0),
    top: createLeafFace(seed + 2, 8, 4),
    front: createLeafFace(seed + 4, -1),
    right: createLeafFace(seed + 6, -4, -2),
    left: createLeafFace(seed + 8, 2, 1),
    back: createLeafFace(seed + 10, -5, -2),
  };
}

const LEAF_CLUSTERS = [
  {
    center: [3, -19, 1],
    radius: [5, 4, 4],
    drift: [1.2, -.2, .45],
    explode: [6, 3, 2],
    seed: 11,
    start: .04,
    end: .58,
    style: createLeafStyle(11),
  },
  {
    center: [-7, -15, -3],
    radius: [4, 3, 3],
    drift: [1.3, -.08, -.9],
    explode: [-5, 2, -3],
    seed: 17,
    start: .18,
    end: .72,
    style: createLeafStyle(17),
  },
  {
    center: [8, -15, 2],
    radius: [4, 3, 3],
    drift: [1.45, -.08, .7],
    explode: [5, 2, 3],
    seed: 23,
    start: .22,
    end: .78,
    style: createLeafStyle(23),
  },
  {
    center: [-1, -15, 6],
    radius: [3, 2, 3],
    drift: [.9, -.05, 1.2],
    explode: [-3, 2, 4],
    seed: 29,
    start: .3,
    end: .88,
    style: createLeafStyle(29),
  },
  {
    center: [5, -10, -5],
    radius: [2, 2, 2],
    drift: [1.05, 0, -1.2],
    explode: [3, 1, -5],
    seed: 31,
    start: .46,
    end: 1,
    style: createLeafStyle(31),
  },
];

const STONES = [
  { center: [-3, 1, 2], radius: 1.8, seed: 41 },
  { center: [3, 1, -1], radius: 1.5, seed: 47 },
  { center: [1, 1, 3], radius: 1.2, seed: 53 },
];

function drawGrowingLine(engine: any, from: number[], to: number[], radius: number, reveal: number) {
  if (reveal <= .02) return;

  const tip = interpolatePoint(from, to, reveal);
  engine.addLine({
    from: roundPoint(from),
    to: tip,
    radius,
    shape: 'rounded',
    style: TRUNK_STYLE,
  });
}

function addStand(engine: any, progress: number) {
  const reveal = Math.max(.08, progress);

  engine.addBox({
    position: [-10, 7, -7],
    size: [20, 1, 14],
    style: STAND_STYLE,
    scale: [1, reveal, 1],
    scaleOrigin: [0.5, 1, 0.5],
  });

  [
    [-8, 6, -5],
    [6, 6, -5],
    [-8, 6, 3],
    [6, 6, 3],
  ].forEach((position) => {
    engine.addBox({
      position,
      size: [2, 1, 2],
      style: STAND_STYLE,
      scale: [1, reveal, 1],
      scaleOrigin: [0.5, 1, 0.5],
    });
  });
}

function addPot(engine: any, progress: number) {
  const reveal = Math.max(.08, progress);

  engine.addBox({
    position: [-7, 1, -4],
    size: [14, 5, 8],
    style: POT_STYLE,
    scale: [1, reveal, 1],
    scaleOrigin: [0.5, 1, 0.5],
  });

  engine.addBox({
    position: [-8, 0, -5],
    size: [16, 1, 10],
    style: POT_STYLE,
    scale: [1, reveal, 1],
    scaleOrigin: [0.5, 1, 0.5],
  });

  const cavityReveal = Math.max(.08, segmentProgress(progress, .22, .78));

  engine.removeBox({
    position: [-5, 1, -3],
    size: [10, 4, 6],
    style: POT_INNER_STYLE,
    scale: [1, cavityReveal, 1],
    scaleOrigin: [0.5, 1, 0.5],
  });

  engine.addBox({
    position: [-5, 1, -3],
    size: [10, 1, 6],
    style: SOIL_STYLE,
    scale: [1, cavityReveal, 1],
    scaleOrigin: [0.5, 1, 0.5],
  });
}

function addMoss(engine: any, progress: number, pulse: number, scatter: number) {
  const reveal = segmentProgress(progress, .2, .72) * (1 - scatter * .5);
  if (reveal <= .02) return;

  engine.addWhere({
    bounds: [[-4, 1, -2], [5, 3, 3]],
    test: (x: number, y: number, z: number) => {
      if (y !== 1) return false;
      return hash3(x, y, z, 61) < reveal * .44;
    },
    style: MOSS_STYLE,
    scale: (x: number, y: number, z: number) => {
      const noise = hash3(x, y, z, 67);
      const wave = Math.sin(pulse + noise * Math.PI * 2) * .08 * reveal;
      const height = clamp(.36 + reveal * .4 + wave - scatter * .12, .22, .84);
      return [.62, height, .62];
    },
    scaleOrigin: [0.5, 1, 0.5],
  });
}

function addStones(engine: any, progress: number, pulse: number) {
  const reveal = segmentProgress(progress, .16, .58);
  if (reveal <= .04) return;

  STONES.forEach((stone) => {
    engine.addSphere({
      center: stone.center,
      radius: stone.radius,
      style: STONE_STYLE,
      scale: (x: number, y: number, z: number) => {
        const noise = hash3(x, y, z, stone.seed);
        const wave = Math.sin(pulse * .7 + noise * Math.PI * 2) * .06;
        const size = clamp(.72 + reveal * .22 + wave, .58, 1);
        return [size, size * (1 - noise * .14), size];
      },
      scaleOrigin: [0.5, 1, 0.5],
    });
  });
}

function addTrunk(engine: any, progress: number, sway: number, scatter: number) {
  const reveal = progress * (1 - scatter * .28);
  const root = [0, 1, 0];
  const trunkA = [0, -4, 0];
  const trunkB = [1, -9, 0];
  const trunkC = offsetPoint([2, -14, 1], sway * .35 + scatter * .4, -sway * .08, sway * .12);
  const trunkD = offsetPoint([3, -18, 1], sway * .9 + scatter * .8, -sway * .12 - scatter * .4, sway * .45 + scatter * .2);

  drawGrowingLine(engine, root, trunkA, 2, segmentProgress(reveal, 0, .28));
  drawGrowingLine(engine, trunkA, trunkB, 2, segmentProgress(reveal, .14, .5));
  drawGrowingLine(engine, trunkB, trunkC, 1, segmentProgress(reveal, .38, .74));
  drawGrowingLine(engine, trunkC, trunkD, 1, segmentProgress(reveal, .62, 1));

  drawGrowingLine(engine, root, [3, 2, 1], 1, segmentProgress(reveal, .04, .26));
  drawGrowingLine(engine, root, [-3, 2, -1], 1, segmentProgress(reveal, .06, .28));
  drawGrowingLine(engine, root, [1, 2, -3], 1, segmentProgress(reveal, .08, .32));
}

function addBranches(engine: any, progress: number, sway: number, scatter: number) {
  const reveal = progress * (1 - scatter * .38);
  const leftA = offsetPoint([-3, -12, -2], sway * .45 - scatter * .2, 0, -sway * .7 - scatter * .7);
  const leftB = offsetPoint([-7, -14, -3], sway * 1.1 - scatter * 1.2, -scatter * .4, -sway * 1.4 - scatter);
  const rightA = offsetPoint([7, -15, 3], sway * 1.15 + scatter, -scatter * .3, sway * .62 + scatter * .8);
  const rightB = offsetPoint([8, -13, 1], sway * .9 + scatter * 1.3, -scatter * .2, sway * .24 + scatter * .4);
  const rear = offsetPoint([-1, -14, 5], -sway * .32 - scatter * .4, -scatter * .3, sway * 1.05 + scatter * 1.1);
  const frontRoot = offsetPoint([2, -10, -1], sway * .28 + scatter * .1, 0, -sway * .35 - scatter * .3);
  const front = offsetPoint([5, -9, -5], sway * .78 + scatter * .9, -scatter * .4, -sway * .98 - scatter * 1.2);

  drawGrowingLine(engine, [1, -9, 0], leftA, 1, segmentProgress(reveal, 0, .36));
  drawGrowingLine(engine, leftA, leftB, 1, segmentProgress(reveal, .18, .62));

  drawGrowingLine(engine, [2, -14, 1], rightA, 1, segmentProgress(reveal, .08, .46));
  drawGrowingLine(engine, rightA, rightB, 1, segmentProgress(reveal, .28, .76));

  drawGrowingLine(engine, [1, -9, 0], rear, 1, segmentProgress(reveal, .16, .58));
  drawGrowingLine(engine, frontRoot, front, 1, segmentProgress(reveal, .34, .92));
}

function addLeafCluster(
  engine: any,
  cluster: any,
  progress: number,
  sway: number,
  pulse: number,
  scatter: number,
) {
  const reveal = progress * (1 - scatter * .62);
  if (reveal <= .04) return;

  const center = [
    cluster.center[0] + sway * cluster.drift[0] + scatter * cluster.explode[0],
    cluster.center[1] + sway * cluster.drift[1] - scatter * cluster.explode[1],
    cluster.center[2] + sway * cluster.drift[2] + scatter * cluster.explode[2],
  ];

  const [rx, ry, rz] = cluster.radius;
  const bounds = [
    [Math.floor(center[0] - rx - 1), Math.floor(center[1] - ry - 1), Math.floor(center[2] - rz - 1)],
    [Math.ceil(center[0] + rx + 2), Math.ceil(center[1] + ry + 2), Math.ceil(center[2] + rz + 2)],
  ];

  engine.addWhere({
    bounds,
    test: (x: number, y: number, z: number) => {
      const dx = (x - center[0]) / rx;
      const dy = (y - center[1]) / ry;
      const dz = (z - center[2]) / rz;
      const distance = dx * dx + dy * dy + dz * dz;
      if (distance > 1.08) return false;

      const shell = 1 - Math.min(1, distance);
      const threshold = clamp(reveal * .76 + shell * .42 - scatter * .18);
      return hash3(x, y, z, cluster.seed) < threshold;
    },
    style: cluster.style,
    scale: (x: number, y: number, z: number) => {
      const noise = hash3(x, y, z, cluster.seed + 7);
      const wave = Math.sin(pulse + noise * Math.PI * 2) * .08 * reveal;
      const size = clamp(.74 + reveal * .22 + wave - scatter * .18, .5, 1);
      return [size, size, size];
    },
    scaleOrigin: [0.5, 0.5, 0.5],
  });
}

function buildScene(engine: any, state: { intro: number; sway: number; pulse: number; scatter: number; }) {
  engine.clear();

  addStand(engine, segmentProgress(state.intro, 0, .24));
  addPot(engine, segmentProgress(state.intro, 0, .34));
  addMoss(engine, state.intro, state.pulse, state.scatter);
  addStones(engine, state.intro, state.pulse);
  addTrunk(engine, segmentProgress(state.intro, .08, .78), state.sway, state.scatter);
  addBranches(engine, segmentProgress(state.intro, .3, .94), state.sway, state.scatter);

  LEAF_CLUSTERS.forEach((cluster) => {
    addLeafCluster(engine, cluster, segmentProgress(state.intro, .42, 1), state.sway, state.pulse, state.scatter);
  });
}

async function init() {
  const container = document.querySelector<HTMLElement>('.js-hero-bg');
  if (!container || container.dataset.heroBgReady === 'true') return;

  const heroSection = container.closest<HTMLElement>('.Hero');
  if (!heroSection) return;

  container.dataset.heroBgReady = 'true';
  container.dataset.heroBgActive = 'true';

  const { Heerich } = await heerichReady;

  const engine = new Heerich({
    tile: TILE,
    camera: { type: 'oblique', angle: BASE_ANGLE, distance: BASE_DISTANCE },
    style: { fill: 'none', stroke: 'rgba(26, 27, 30, .14)', strokeWidth: .44 },
  });

  buildScene(engine, STATIC_SCENE_STATE);
  const fixedViewBox = engine.getOptimalViewBox(VIEWBOX_PADDING + (IS_SP ? 10 : 14));
  container.innerHTML = '<div class="Hero__scene"></div>';

  const scene = container.querySelector<HTMLElement>('.Hero__scene');
  if (!scene) return;

  function applySvgMetadata() {
    const svg = scene.querySelector<SVGSVGElement>('svg');
    if (!svg) return;

    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('role', 'presentation');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.overflow = 'visible';
  }

  function getSceneSvg(angle: number, distance: number) {
    engine.setCamera({ type: 'oblique', angle, distance });
    return engine.toSVG({ viewBox: fixedViewBox });
  }

  function renderScene(svgMarkup: string) {
    scene.innerHTML = svgMarkup;
    applySvgMetadata();
  }

  const frameSvgs = CAMERA_FRAME_OFFSETS.map((offset) => getSceneSvg(BASE_ANGLE + offset, BASE_DISTANCE));
  renderScene(frameSvgs[0]);

  if (REDUCED_MOTION) return;

  let isVisible = true;
  let timerId = 0;
  let frameIndex = 0;

  function clearCameraTimer() {
    if (!timerId) return;
    clearTimeout(timerId);
    timerId = 0;
  }

  function scheduleNextFrame() {
    clearCameraTimer();
    if (!isVisible || document.hidden) return;

    timerId = window.setTimeout(() => {
      frameIndex = (frameIndex + 1) % frameSvgs.length;
      renderScene(frameSvgs[frameIndex]);
      scheduleNextFrame();
    }, CAMERA_FRAME_INTERVAL_MS);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !isVisible) {
      clearCameraTimer();
      return;
    }

    scheduleNextFrame();
  });

  const observer = new IntersectionObserver((entries) => {
    isVisible = Boolean(entries[0]?.isIntersecting);

    if (!isVisible) {
      clearCameraTimer();
      return;
    }

    scheduleNextFrame();
  }, { threshold: .08 });

  observer.observe(heroSection);
  scheduleNextFrame();
}

function deferInit() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => init(), { timeout: 2000 });
    return;
  }

  setTimeout(init, 180);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', deferInit);
} else {
  deferInit();
}
