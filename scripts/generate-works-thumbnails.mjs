import sharp from 'sharp';
import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises';
import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const worksContentDir = resolve(__dirname, '..', 'src', 'content', 'works');
const worksOutputDir = resolve(__dirname, '..', 'public', 'works');
const GITHUB_USER = 'ozekimasaki';
const FETCH_DELAY_MS = 1500;

function parseRepoName(markdown) {
  const match = markdown.match(/^repoUrl:\s*(.+)$/m);
  if (!match) return null;

  const repoUrl = match[1].trim();
  const repoMatch = repoUrl.match(/github\.com\/[^/]+\/([^/\s]+)/i);
  return repoMatch?.[1] ?? null;
}

function openGraphUrl(repoName) {
  return `https://opengraph.githubassets.com/1/${GITHUB_USER}/${repoName}`;
}

async function sleep(ms) {
  await new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function downloadThumbnail(repoName, outputPath) {
  const response = await fetch(openGraphUrl(repoName), {
    headers: {
      'User-Agent': 'portfolio_maymai-thumbnail-generator',
      Accept: 'image/*',
    },
  });

  if (!response.ok) {
    throw new Error(`${repoName}: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await sharp(buffer)
    .resize(1200, 630, { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(outputPath);
}

export async function generateWorksThumbnails({ force = false } = {}) {
  await mkdir(worksOutputDir, { recursive: true });

  const files = (await readdir(worksContentDir))
    .filter((file) => file.endsWith('.md'))
    .sort();

  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = basename(file, '.md');
    const outputPath = resolve(worksOutputDir, `${slug}.webp`);
    const markdown = await readFile(resolve(worksContentDir, file), 'utf8');
    const repoName = parseRepoName(markdown);

    if (!repoName) {
      console.warn(`Skipped: ${slug} (repoUrl not found)`);
      continue;
    }

    if (!force) {
      try {
        const outputStat = await stat(outputPath);
        if (outputStat.size > 0) {
          skipped += 1;
          continue;
        }
      } catch {
        // generate missing file
      }
    }

    if (generated > 0) {
      await sleep(FETCH_DELAY_MS);
    }

    await downloadThumbnail(repoName, outputPath);
    generated += 1;
    console.log(`Generated: public/works/${slug}.webp`);
  }

  console.log(`Works thumbnails: generated=${generated}, skipped=${skipped}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const force = process.argv.includes('--force');
  generateWorksThumbnails({ force }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
