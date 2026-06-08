import sharp from 'sharp';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { basename, dirname, extname, resolve } from 'path';
import { generateWorksThumbnails } from './generate-works-thumbnails.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const gallerySourceDir = resolve(__dirname, '..', 'Gallery');
const galleryOutputDir = resolve(publicDir, 'gallery');
const galleryManifestDir = resolve(__dirname, '..', 'src', 'data', 'generated');
const galleryManifestPath = resolve(galleryManifestDir, 'mp-gallery-manifest.json');
const galleryCacheDir = resolve(__dirname, '..', '.astro', 'cache');
const galleryCachePath = resolve(galleryCacheDir, 'mp-gallery-cache.json');
const GALLERY_SOURCE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const GALLERY_OUTPUT_EXTENSIONS = new Set(['.avif', '.webp']);
const DEFAULT_GALLERY_PRESET = 'webp-light';
const GALLERY_PRESETS = {
  'webp-light': {
    format: 'webp',
    extension: '.webp',
    maxDimension: 1600,
    options: {
      quality: 82,
      effort: 1,
    },
    jobs: 1,
    sharpConcurrency: 1,
  },
  'webp-medium': {
    format: 'webp',
    extension: '.webp',
    maxDimension: 1600,
    options: {
      quality: 86,
      effort: 2,
    },
    jobs: 1,
    sharpConcurrency: 1,
  },
  'avif-light': {
    format: 'avif',
    extension: '.avif',
    maxDimension: 1600,
    options: {
      quality: 58,
      effort: 2,
      chromaSubsampling: '4:2:0',
    },
    jobs: 1,
    sharpConcurrency: 1,
  },
  'avif-quality': {
    format: 'avif',
    extension: '.avif',
    maxDimension: 1600,
    options: {
      quality: 58,
      effort: 6,
      chromaSubsampling: '4:4:4',
    },
    jobs: 1,
    sharpConcurrency: 1,
  },
};
const GALLERY_SORTER = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const cliArgs = process.argv.slice(2);
const shouldGenerateGallery = cliArgs.includes('--gallery')
  || cliArgs.includes('--only-gallery')
  || process.env.GENERATE_GALLERY === '1';
const shouldGenerateOnlyGallery = cliArgs.includes('--only-gallery');

const BRAND = {
  bg: '#1a1b1e',
  bgLight: '#fcfaf5',
  text: '#fcfaf5',
  label: '#8c9299',
  accent: '#c85b17',
};

async function generateOgImage() {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${BRAND.bg}"/>

    <line x1="80" y1="0" x2="80" y2="630" stroke="${BRAND.label}" stroke-width=".5" opacity=".15"/>
    <line x1="400" y1="0" x2="400" y2="630" stroke="${BRAND.label}" stroke-width=".5" opacity=".15"/>
    <line x1="800" y1="0" x2="800" y2="630" stroke="${BRAND.label}" stroke-width=".5" opacity=".15"/>
    <line x1="1120" y1="0" x2="1120" y2="630" stroke="${BRAND.label}" stroke-width=".5" opacity=".15"/>
    <line x1="0" y1="80" x2="1200" y2="80" stroke="${BRAND.label}" stroke-width=".5" opacity=".15"/>
    <line x1="0" y1="550" x2="1200" y2="550" stroke="${BRAND.label}" stroke-width=".5" opacity=".15"/>

    <path d="M100 380V240l40 80 40-80v140" stroke="${BRAND.text}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="210" cy="370" r="8" fill="${BRAND.accent}"/>

    <text x="300" y="310" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="400" fill="${BRAND.text}" letter-spacing="-1">Maymai.dev</text>
    <text x="302" y="370" font-family="'Courier New', monospace" font-size="22" fill="${BRAND.label}">Frontend Engineer</text>

    <text x="302" y="430" font-family="'Courier New', monospace" font-size="16" fill="${BRAND.label}" opacity=".6">Code with AI, Create for Someone.</text>

    <text x="80" y="590" font-family="'Courier New', monospace" font-size="13" fill="${BRAND.label}" opacity=".4">https://maymai.dev</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(resolve(publicDir, 'og-image.png'));
  console.log('Generated: public/og-image.png');
}

async function generateIcon(size, filename) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="6" fill="${BRAND.bg}"/>
    <path d="M6 24V8l5 10 5-10v16" stroke="${BRAND.text}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="24.5" cy="21.5" r="2.5" fill="${BRAND.accent}"/>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(publicDir, filename));
  console.log(`Generated: public/${filename}`);
}

function hasErrorCode(error, code) {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === code;
}

function getCliOption(name) {
  const prefix = `--${name}=`;
  return cliArgs.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function getPositiveInteger(value, fallback, name) {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function resolveGalleryPreset() {
  const presetName = getCliOption('preset')
    ?? process.env.GALLERY_PRESET
    ?? DEFAULT_GALLERY_PRESET;
  const basePreset = GALLERY_PRESETS[presetName];

  if (!basePreset) {
    throw new Error(`Unknown gallery preset "${presetName}". Available presets: ${Object.keys(GALLERY_PRESETS).join(', ')}`);
  }

  return {
    ...basePreset,
    name: presetName,
    jobs: getPositiveInteger(process.env.GALLERY_JOBS, basePreset.jobs, 'GALLERY_JOBS'),
    maxDimension: getPositiveInteger(process.env.GALLERY_MAX_DIMENSION, basePreset.maxDimension, 'GALLERY_MAX_DIMENSION'),
    sharpConcurrency: getPositiveInteger(process.env.SHARP_CONCURRENCY, basePreset.sharpConcurrency, 'SHARP_CONCURRENCY'),
  };
}

function getGalleryCacheVersion(preset) {
  return JSON.stringify({
    format: preset.format,
    maxDimension: preset.maxDimension,
    options: preset.options,
    rotate: true,
    version: 2,
  });
}

async function readJsonFile(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return fallback;
    throw error;
  }
}

async function getFileStat(path) {
  try {
    return await stat(path);
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return null;
    throw error;
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, items.length) },
      () => worker(),
    ),
  );

  return results;
}

async function generateGalleryImages() {
  const preset = resolveGalleryPreset();
  const cacheVersion = getGalleryCacheVersion(preset);
  const previousSharpConcurrency = sharp.concurrency();
  sharp.concurrency(preset.sharpConcurrency);

  await mkdir(galleryOutputDir, { recursive: true });
  await mkdir(galleryManifestDir, { recursive: true });
  await mkdir(galleryCacheDir, { recursive: true });

  const sourceEntries = (await readdir(gallerySourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .filter((entry) => GALLERY_SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase()))
    .sort((a, b) => GALLERY_SORTER.compare(a.name, b.name));

  const sourceStems = new Set(sourceEntries.map((entry) => basename(entry.name, extname(entry.name))));
  const outputEntries = (await readdir(galleryOutputDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile());

  await Promise.all(
    outputEntries.map(async (entry) => {
      const extension = extname(entry.name).toLowerCase();
      const stem = basename(entry.name, extension);
      const isGeneratedOutput = GALLERY_OUTPUT_EXTENSIONS.has(extension);
      const shouldDeleteOtherFormat = sourceStems.has(stem)
        && isGeneratedOutput
        && extension !== preset.extension;
      const shouldDeleteStaleOutput = isGeneratedOutput && !sourceStems.has(stem);

      if (!shouldDeleteOtherFormat && !shouldDeleteStaleOutput) return;

      await rm(resolve(galleryOutputDir, entry.name));
      console.log(`Removed: public/gallery/${entry.name}`);
    }),
  );

  const galleryCache = await readJsonFile(galleryCachePath, { version: '', entries: {} });
  const cacheEntries = galleryCache.version === cacheVersion
    ? galleryCache.entries ?? {}
    : {};
  const previousManifest = await readJsonFile(galleryManifestPath, []);
  const previousManifestBySrc = new Map(
    previousManifest.map((slide) => [slide.src, slide]),
  );

  const generatedItems = await mapWithConcurrency(
    sourceEntries,
    preset.jobs,
    async (entry) => {
      const startedAt = Date.now();
      const sourcePath = resolve(gallerySourceDir, entry.name);
      const stem = basename(entry.name, extname(entry.name));
      const outputName = `${stem}${preset.extension}`;
      const outputPath = resolve(galleryOutputDir, outputName);
      const sourceStats = await stat(sourcePath);
      const outputStats = await getFileStat(outputPath);
      const cached = cacheEntries[entry.name];
      const src = `/gallery/${outputName}`;
      const previousSlide = previousManifestBySrc.get(src);
      const canReuseCache = cached
        && outputStats
        && cached.outputName === outputName
        && cached.outputSize === outputStats.size
        && cached.sourceSize === sourceStats.size
        && cached.sourceMtimeMs === sourceStats.mtimeMs;
      const canReuseExistingOutput = outputStats
        && previousSlide
        && typeof previousSlide.width === 'number'
        && typeof previousSlide.height === 'number'
        && outputStats.mtimeMs >= sourceStats.mtimeMs;

      if (canReuseCache || canReuseExistingOutput) {
        const width = canReuseCache ? cached.width : previousSlide.width;
        const height = canReuseCache ? cached.height : previousSlide.height;

        console.log(`Skipped: public/gallery/${outputName} (unchanged, ${Date.now() - startedAt}ms)`);

        return {
          slide: { src, width, height },
          cacheEntry: {
            outputName,
            outputSize: outputStats.size,
            sourceSize: sourceStats.size,
            sourceMtimeMs: sourceStats.mtimeMs,
            width,
            height,
          },
        };
      }

      const image = sharp(sourcePath)
        .rotate()
        .resize({
          width: preset.maxDimension,
          height: preset.maxDimension,
          fit: 'inside',
          withoutEnlargement: true,
        });
      const info = await image[preset.format](preset.options).toFile(outputPath);

      console.log(`Generated: public/gallery/${outputName} (${info.width}x${info.height}, ${info.size} bytes, ${Date.now() - startedAt}ms)`);

      return {
        slide: {
          src,
          width: info.width,
          height: info.height,
        },
        cacheEntry: {
          outputName,
          outputSize: info.size,
          sourceSize: sourceStats.size,
          sourceMtimeMs: sourceStats.mtimeMs,
          width: info.width,
          height: info.height,
        },
      };
    },
  );

  const slides = generatedItems.map((item) => item.slide);
  const manifest = slides.map((slide, index) => ({
    ...slide,
    alt: `MAY PROJECT ギャラリーイラスト ${String(index + 1).padStart(2, '0')}`,
  }));
  const nextCache = {
    version: cacheVersion,
    entries: Object.fromEntries(
      generatedItems.map((item, index) => [
        sourceEntries[index].name,
        item.cacheEntry,
      ]),
    ),
  };

  await writeFile(galleryManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(galleryCachePath, `${JSON.stringify(nextCache, null, 2)}\n`, 'utf8');
  sharp.concurrency(previousSharpConcurrency);
  console.log(`Generated: src/data/generated/mp-gallery-manifest.json (${preset.name}, ${preset.format}, jobs=${preset.jobs}, sharp.concurrency=${preset.sharpConcurrency})`);
}

async function main() {
  const generators = [];

  if (!shouldGenerateOnlyGallery) {
    generators.push(
      generateOgImage(),
      generateIcon(180, 'apple-touch-icon.png'),
      generateIcon(192, 'icon-192.png'),
      generateIcon(512, 'icon-512.png'),
      generateWorksThumbnails(),
    );
  }

  if (shouldGenerateGallery) {
    generators.push(generateGalleryImages());
  }

  await Promise.all(generators);

  if (!shouldGenerateGallery) {
    console.log('Skipped: gallery conversion.');
  }

  console.log('All assets generated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
