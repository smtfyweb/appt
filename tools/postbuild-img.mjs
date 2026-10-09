import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importa o postbuild-img de astro-site/tools/postbuild-img.mjs
const astroScript = path.resolve(__dirname, '../astro-site/tools/postbuild-img.mjs');
if (fs.existsSync(astroScript)) {
  await import(astroScript);
} else {
  console.error('❌ Script astro-site/tools/postbuild-img.mjs não encontrado.');
  process.exit(1);
}
