import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const out = join(root, 'dist');
const allowed = new Set(['.html', '.css', '.js']);

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const file of readdirSync(root)) {
  const src = join(root, file);
  if (statSync(src).isDirectory()) continue;
  const ext = `.${file.split('.').pop()}`;
  if (!allowed.has(ext)) continue;
  cpSync(src, join(out, file));
}
console.log('dist prêt');
