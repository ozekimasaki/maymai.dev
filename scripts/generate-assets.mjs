import sharp from 'sharp';
import { copyFile, mkdir, readdir, rm, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { basename, dirname, extname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const gallerySourceDir = resolve(__dirname, '..', 'Gallery');
const galleryOutputDir = resolve(publicDir, 'gallery');
const galleryManifestDir = resolve(__dirname, '..', 'src', 'data', 'generated');
const galleryManifestPath = resolve(galleryManifestDir, 'mp-gallery-manifest.json');
const GALLERY_SOURCE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const GALLERY_AVIF_OPTIONS = {
  quality: 58,
  effort: 6,
  chromaSubsampling: '4:4:4',
};
const GALLERY_SORTER = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

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

async function generateGalleryAvif() {
  await mkdir(galleryOutputDir, { recursive: true });
  await mkdir(galleryManifestDir, { recursive: true });

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
      const shouldDeleteOriginal = sourceStems.has(stem) && extension !== '.avif';
      const shouldDeleteStaleAvif = extension === '.avif' && !sourceStems.has(stem);

      if (!shouldDeleteOriginal && !shouldDeleteStaleAvif) return;

      await rm(resolve(galleryOutputDir, entry.name));
      console.log(`Removed: public/gallery/${entry.name}`);
    }),
  );

  const slides = await Promise.all(
    sourceEntries.map(async (entry) => {
      const sourcePath = resolve(gallerySourceDir, entry.name);
      const stem = basename(entry.name, extname(entry.name));
      const outputName = `${stem}.avif`;
      const outputPath = resolve(galleryOutputDir, outputName);
      const sourceExtension = extname(entry.name).toLowerCase();
      const image = sharp(sourcePath).rotate();
      const metadata = await image.metadata();

      if (sourceExtension === '.avif') {
        await copyFile(sourcePath, outputPath);
      } else {
        await image.avif(GALLERY_AVIF_OPTIONS).toFile(outputPath);
      }

      console.log(`Generated: public/gallery/${outputName} (${metadata.width}x${metadata.height})`);

      return {
        src: `/gallery/${outputName}`,
        width: metadata.width ?? 1,
        height: metadata.height ?? 1,
      };
    }),
  );

  const manifest = slides.map((slide, index) => ({
    ...slide,
    alt: `MAY PROJECT ギャラリーイラスト ${String(index + 1).padStart(2, '0')}`,
  }));

  await writeFile(galleryManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log('Generated: src/data/generated/mp-gallery-manifest.json');
}

async function main() {
  await Promise.all([
    generateOgImage(),
    generateIcon(180, 'apple-touch-icon.png'),
    generateIcon(192, 'icon-192.png'),
    generateIcon(512, 'icon-512.png'),
    generateGalleryAvif(),
  ]);
  console.log('All assets generated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
