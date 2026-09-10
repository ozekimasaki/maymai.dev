/** @jsxImportSource @ox-content/vite-plugin */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { raw, type JSXNode } from '@ox-content/vite-plugin';

const html = readFileSync(
  join(process.cwd(), 'theme/components/mp-guidelines.html'),
  'utf8',
);

export function MpGuidelines(): JSXNode {
  return raw(html);
}
