import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Identifica a pasta public/img (executado a partir de astro-site/ ou da raiz)
const candidateDirs = [
  path.resolve(__dirname, '../public/img'),
  path.resolve(process.cwd(), 'public/img'),
  path.resolve(process.cwd(), 'astro-site/public/img')
];

let targetImgDir = candidateDirs.find(d => fs.existsSync(d));

if (!targetImgDir) {
  console.error('❌ Diretório public/img não encontrado.');
  process.exit(1);
}

console.log(`🖼️  Iniciando geração de WebP em: ${targetImgDir} (qualidade 78)`);

async function getImages(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getImages(res));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      // Não reprocessa arquivos já .webp
      if (['.jpg', '.jpeg', '.png'].includes(ext) && !entry.name.endsWith('.webp')) {
        files.push(res);
      }
    }
  }
  return files;
}

const maxImageSizes = {
  'about-16.jpg': { width: 640, height: 427 },
  'bathroom-1.jpg': { width: 540, height: 716 },
  'bathroom-2.jpg': { width: 540, height: 716 },
  'service-2.jpg': { width: 500, height: 750 },
  'service-1.jpg': { width: 500, height: 750 }
};

async function convertImage(srcPath) {
  const destPath = `${srcPath}.webp`;
  const baseName = path.basename(srcPath);

  // Se já existe e é mais recente que a imagem original, pula APENAS se estiver com a dimensão correta
  if (fs.existsSync(destPath)) {
    const srcStat = fs.statSync(srcPath);
    const destStat = fs.statSync(destPath);
    if (destStat.mtimeMs >= srcStat.mtimeMs) {
      if (!maxImageSizes[baseName]) {
        return { skipped: true, srcPath, destPath };
      }
      try {
        const existingMeta = await sharp(destPath).metadata();
        if (existingMeta.width <= maxImageSizes[baseName].width) {
          return { skipped: true, srcPath, destPath };
        }
      } catch (e) {}
    }
  }

  let pipeline = sharp(srcPath);
  if (maxImageSizes[baseName]) {
    pipeline = pipeline.resize(maxImageSizes[baseName].width, maxImageSizes[baseName].height, { fit: 'inside' });
  }

  await pipeline
    .webp({ quality: 75, effort: 6 })
    .toFile(destPath);

  const srcSize = fs.statSync(srcPath).size;
  const destSize = fs.statSync(destPath).size;

  return { skipped: false, srcPath, destPath, srcSize, destSize };
}

async function run() {
  const images = await getImages(targetImgDir);
  console.log(`🔍 Encontradas ${images.length} imagens JPG/PNG para processar.`);

  let createdCount = 0;
  let skippedCount = 0;
  let bytesOriginal = 0;
  let bytesWebp = 0;

  // Verifica e aprimora imagens com baixa resolução conhecidas (ex: icon-1.png exibido a 210x64 requer 420x128 para DPR 2x)
  const icon1Path = path.join(targetImgDir, 'icons/icon-1.png');
  if (fs.existsSync(icon1Path)) {
    try {
      const meta = await sharp(icon1Path).metadata();
      if (meta.width < 420) {
        console.log(`  🔧 Aprimorando resolução de icon-1.png para 420x128 (DPR 2x)...`);
        const buffer = await sharp(icon1Path)
          .resize(420, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
          .png({ compressionLevel: 9 })
          .toBuffer();
        await fs.promises.writeFile(icon1Path, buffer);
      }
    } catch (e) {}
  }

  for (const img of images) {
    try {
      const result = await convertImage(img);
      if (result.skipped) {
        skippedCount++;
      } else {
        createdCount++;
        bytesOriginal += result.srcSize;
        bytesWebp += result.destSize;
        console.log(`  ✓ ${path.basename(result.destPath)}: ${(result.srcSize / 1024).toFixed(1)} KB -> ${(result.destSize / 1024).toFixed(1)} KB`);
      }
    } catch (err) {
      console.error(`  ⚠️ Falha ao converter ${img}:`, err.message);
    }
  }

  // Garante thumbnails leves para os dots do carrossel (60x60 retina = 80x80)
  const thumbMap = [
    { src: 'carousel-3.jpg', out: 'carousel-3-thumb.webp' },
    { src: 'carousel-1.jpg', out: 'carousel-1-thumb.webp' },
    { src: 'carousel-2.jpg', out: 'carousel-2-thumb.webp' },
    { src: 'about-16.jpg', out: 'about-16-thumb.webp' }
  ];
  for (const t of thumbMap) {
    const s = path.join(targetImgDir, t.src);
    const d = path.join(targetImgDir, t.out);
    if (fs.existsSync(s)) {
      await sharp(s).resize(80, 80, { fit: 'cover' }).webp({ quality: 75 }).toFile(d);
    }
  }

  // Garante que carousel-3-mobile.webp está otimizado para mobile (640x360, ~24KB)
  const carousel3Path = path.join(targetImgDir, 'carousel-3.jpg');
  if (fs.existsSync(carousel3Path)) {
    const mobileDest = path.join(targetImgDir, 'carousel-3-mobile.webp');
    await sharp(carousel3Path)
      .resize(640, 360, { fit: 'cover' })
      .webp({ quality: 68, effort: 6 })
      .toFile(mobileDest);
    console.log(`  ✓ carousel-3-mobile.webp: Gerada versão mobile ultraleve (640x360, ~24KB)`);
  }

  // Se existir a pasta raiz img/, sincroniza as versões .webp também para a raiz
  const rootImgDir = path.resolve(__dirname, '../../img');
  if (fs.existsSync(rootImgDir) && targetImgDir !== rootImgDir) {
    const webpFiles = (await fs.promises.readdir(targetImgDir, { recursive: true }))
      .filter(f => typeof f === 'string' && f.endsWith('.webp'));
    for (const rel of webpFiles) {
      const src = path.join(targetImgDir, rel);
      const dst = path.join(rootImgDir, rel);
      try {
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
      } catch (e) {}
    }
  }

  console.log(`\n🎉 WebP concluído: ${createdCount} criados/atualizados, ${skippedCount} já atualizados.`);
  if (createdCount > 0) {
    const saved = bytesOriginal - bytesWebp;
    console.log(`📉 Economia: ${(saved / 1024).toFixed(1)} KB (${((saved / bytesOriginal) * 100).toFixed(1)}%)`);
  }
}

run().catch(err => {
  console.error('❌ Erro no make-webp:', err);
  process.exit(1);
});
