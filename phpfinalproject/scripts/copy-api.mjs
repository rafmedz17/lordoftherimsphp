// Copies the PHP API into dist/ after `vite build`, so dist/ is the complete site
// to upload to the server. api/config.php is skipped on purpose: the server keeps its own.
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Only these exact files are skipped (api/lib/config.php must still be copied).
const SKIP = new Set([resolve('api/config.php'), resolve('api/dev-router.php')]);

if (!existsSync('dist')) {
  console.error('dist/ not found. Run `vite build` first.');
  process.exit(1);
}

cpSync('api', 'dist/api', {
  recursive: true,
  filter: (src) => !SKIP.has(resolve(src)),
});

console.log('Copied api/ into dist/api (without config.php).');
