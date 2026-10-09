import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distIndexPath = path.resolve(__dirname, 'dist/index.html');

if (!fs.existsSync(distIndexPath)) {
  console.error("❌ [Trava Legal] Falha no postbuild: 'dist/index.html' não foi encontrado.");
  process.exit(1);
}

const htmlContent = fs.readFileSync(distIndexPath, 'utf-8');

// Validação legal: exige 'Registration #' seguido de dígitos
const registrationRegex = /Registration\s*#\s*\d+/i;

if (!registrationRegex.test(htmlContent)) {
  console.error("❌ [Trava Legal] Falha no postbuild: 'dist/index.html' não contém 'Registration #' seguido de dígitos.");
  console.error("   Conforme a legislação de Massachusetts, o número de registro HIC deve estar configurado antes da publicação.");
  process.exit(1);
}

console.log("✅ [Trava Legal] Validação concluída: 'Registration #' com dígitos encontrado em 'dist/index.html'.");
process.exit(0);
