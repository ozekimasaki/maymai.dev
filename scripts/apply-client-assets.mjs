import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

async function walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.vite') continue;
      files.push(...await walkHtml(full));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }

  return files;
}

function toPublicPath(file) {
  return `/${String(file).replaceAll('\\', '/')}`;
}

function findChunk(manifest, predicate) {
  return Object.values(manifest).find((chunk) => chunk && predicate(chunk)) ?? null;
}

function collectModulePreloads(manifest, entry) {
  const hrefs = [];
  const seen = new Set();

  const visit = (chunk) => {
    if (!chunk) return;
    for (const key of chunk.imports ?? []) {
      if (seen.has(key)) continue;
      seen.add(key);
      const imported = manifest[key];
      if (!imported?.file) continue;
      hrefs.push(toPublicPath(imported.file));
      visit(imported);
    }
  };

  visit(entry);
  return hrefs;
}

function applyBundle(html, kind, entry, manifest) {
  if (!entry?.file) {
    throw new Error(`Vite manifest is missing the ${kind} entry.`);
  }

  const cssHrefs = (entry.css ?? []).map(toPublicPath);
  const jsHref = toPublicPath(entry.file);
  const extraHead = [
    ...cssHrefs.slice(1).map((href) => `<link rel="stylesheet" href="${href}">`),
    ...collectModulePreloads(manifest, entry).map((href) => `<link rel="modulepreload" href="${href}">`),
  ].join('');

  let next = html.replaceAll(`/assets/${kind}.js`, jsHref);

  if (cssHrefs[0]) {
    next = next.replaceAll(`/assets/${kind}.css`, cssHrefs[0]);
  }

  if (extraHead) {
    next = next.replace('</head>', `${extraHead}</head>`);
  }

  return next;
}

export async function applyClientAssets(outDir) {
  const manifestPath = join(outDir, '.vite', 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const site = findChunk(manifest, (chunk) => (
    chunk.isEntry && (chunk.name === 'site' || String(chunk.src ?? '').includes('site-client'))
  ));
  const mp = findChunk(manifest, (chunk) => (
    chunk.isEntry && (chunk.name === 'mp' || String(chunk.src ?? '').includes('mp-client'))
  ));
  const gallery = findChunk(manifest, (chunk) => (
    Boolean(chunk.isDynamicEntry) && String(chunk.src ?? chunk.file ?? '').includes('init-mp-gallery')
  ));
  const files = await walkHtml(outDir);

  for (const file of files) {
    let html = await readFile(file, 'utf8');
    const kind = html.includes('/assets/mp.js') || html.includes('/assets/mp.css') || html.includes('class="MpBody"')
      ? 'mp'
      : 'site';
    html = applyBundle(html, kind, kind === 'mp' ? mp : site, manifest);

    if (gallery && html.includes('js-mp-gallery-splide')) {
      const galleryHead = [
        `<link rel="modulepreload" href="${toPublicPath(gallery.file)}">`,
        ...(gallery.css ?? []).map((href) => `<link rel="stylesheet" href="${toPublicPath(href)}">`),
      ].join('');
      html = html.replace('</head>', `${galleryHead}</head>`);
    }

    await writeFile(file, html, 'utf8');
  }
}
