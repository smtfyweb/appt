import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sincroniza SOMENTE img/ (raiz -> public/). css/, js/ e lib/ são mantidos diretamente em astro-site/public/ (fonte única).
const dirs = ['img'];

for (const dir of dirs) {
  const src = path.resolve(__dirname, '..', dir);
  const dest = path.resolve(__dirname, 'public', dir);
  if (fs.existsSync(src)) {
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(src, dest, {
      recursive: true,
      force: true
    });
    console.log(`✅ Sincronizado: ${dir} -> public/${dir}`);
  } else {
    console.warn(`⚠️ Diretório ${src} não encontrado.`);
  }
}

// Garante bootstrap.min.css e style.css em src/styles/
const stylesDir = path.resolve(__dirname, 'src/styles');
if (!fs.existsSync(stylesDir)) fs.mkdirSync(stylesDir, { recursive: true });
const bSrc = path.resolve(__dirname, 'public/css/bootstrap.min.css');
const bDest = path.resolve(stylesDir, 'bootstrap.min.css');
if (fs.existsSync(bSrc) && !fs.existsSync(bDest)) {
  fs.copyFileSync(bSrc, bDest);
  console.log('✅ bootstrap.min.css sincronizado em src/styles/');
}

// Fotos reais já cadastradas para basement
const tempImgPairs = [];
for (const pair of tempImgPairs) {
  for (const dPath of [path.resolve(__dirname, '../img'), path.resolve(__dirname, 'public/img')]) {
    const s = path.join(dPath, pair.src);
    const d = path.join(dPath, pair.dst);
    if (fs.existsSync(s) && !fs.existsSync(d)) {
      try {
        fs.copyFileSync(s, d);
        console.log(`📸 Imagem temporária criada: ${pair.dst} em ${dPath}`);
      } catch (e) {}
    }
  }
}

// Remove arquivos mortos de public/ (moment, tempusdominus, waypoints, counterup, wow, easing, animate.min.css, main.js)
const publicDir = path.resolve(__dirname, 'public');
const deadPaths = [
  path.join(publicDir, 'lib/tempusdominus'),
  path.join(publicDir, 'lib/waypoints'),
  path.join(publicDir, 'lib/counterup'),
  path.join(publicDir, 'lib/wow'),
  path.join(publicDir, 'lib/easing'),
  path.join(publicDir, 'lib/animate'),
  path.join(publicDir, 'js/main.js'),
  path.join(publicDir, 'js/jQuery v3.6.4 min.js'),
  path.join(publicDir, 'js/jquery.min.js'),
  path.join(publicDir, 'js/owl-carousel.js'),
  path.join(publicDir, 'js/imagesloaded.js'),
  path.join(publicDir, 'js/custom.js'),
  path.join(publicDir, 'js/animation.js'),
  path.join(publicDir, 'css/animated.css'),
  path.join(publicDir, 'css/fontawesome.css'),
  path.join(publicDir, 'css/templatemo-digimedia-v1.css')
];

for (const p of deadPaths) {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`🗑️ Removido de public: ${path.relative(publicDir, p)}`);
    }
  } catch (e) {}
}

// Nunca copia nem mantém *.php, LICENSE* nem *.md em public/
function cleanForbidden(dir) {
  if (!fs.existsSync(dir)) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        cleanForbidden(fullPath);
      } else {
        if (entry.name.endsWith('.php') || entry.name.endsWith('.md') || entry.name.startsWith('LICENSE')) {
          try {
            fs.unlinkSync(fullPath);
            console.log(`🗑️ Removido arquivo proibido: ${path.relative(publicDir, fullPath)}`);
          } catch (e) {}
        }
      }
    }
  } catch (e) {}
}
cleanForbidden(publicDir);

// Move páginas pendentes (que não existem no ar) para _pending/
const pagesDir = path.resolve(__dirname, 'src/pages');
const pendingDir = path.join(pagesDir, '_pending');
const pendingList = [
  'cabinet-refinishing.astro',
  'interior-exterior-painting.astro'
];
for (const file of pendingList) {
  const src = path.join(pagesDir, file);
  const dest = path.join(pendingDir, file);
  if (fs.existsSync(src)) {
    try {
      if (!fs.existsSync(pendingDir)) fs.mkdirSync(pendingDir, { recursive: true });
      if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
      console.log(`📦 Movido para _pending: ${file}`);
    } catch (e) {}
  }
}
