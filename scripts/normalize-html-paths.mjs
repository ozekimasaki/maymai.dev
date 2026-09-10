import { mkdir, readdir, rename, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

export async function normalizeHtmlPaths(outDir) {
  const files = await walk(outDir);
  for (const file of files) {
    const rel = relative(outDir, file).replaceAll('\\', '/');
    if (rel === 'index.html' || rel === '404.html') continue;
    if (rel.endsWith('/index.html')) continue;
    if (!rel.endsWith('.html')) continue;

    const destDir = file.slice(0, -'.html'.length);
    const dest = join(destDir, 'index.html');
    await mkdir(destDir, { recursive: true });
    await rename(file, dest);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const outDir = join(process.cwd(), 'dist');
  const info = await stat(outDir).catch(() => null);
  if (!info) {
    console.log('dist missing, skip html path normalize');
  } else {
    await normalizeHtmlPaths(outDir);
    console.log('normalized html paths');
  }
}
