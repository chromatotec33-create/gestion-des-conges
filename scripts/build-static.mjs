import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'dist');
const allowedExtensions = new Set(['.html', '.css', '.js']);

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(root)) {
  const source = join(root, file);
  if (statSync(source).isDirectory()) continue;
  const extension = `.${file.split('.').pop()}`;
  if (!allowedExtensions.has(extension)) continue;
  cpSync(source, join(outDir, file));
}

console.log('Build statique terminé dans /dist');
