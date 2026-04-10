import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'dist');
const files = ['index.html', 'styles.css', 'app.js'];

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

for (const file of files) {
  cpSync(join(process.cwd(), file), join(outDir, file));
}

console.log('Build statique terminé dans /dist');
