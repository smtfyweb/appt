import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Identifica dist/ e public/img
const candidateDistDirs = [
  path.resolve(__dirname, '../dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), 'astro-site/dist')
];

const distDir = candidateDistDirs.find(d => fs.existsSync(d));

if (!distDir) {
  console.log('⚠️ Diretório dist/ ainda não existe (será executado após o build).');
  process.exit(0);
}

const candidateImgDirs = [
  path.join(distDir, 'img'),
  path.resolve(__dirname, '../public/img'),
  path.resolve(process.cwd(), 'public/img'),
  path.resolve(process.cwd(), 'img')
];

function findLocalImage(imgSrc) {
  // Limpa leading slash ou query params
  const cleanPath = imgSrc.replace(/^\//, '').replace(/\?.*$/, '');
  for (const base of candidateImgDirs) {
    // se imgSrc começa com "img/", tenta diretamente em base ou tirando o prefixo img/
    let testPath = path.resolve(base, '..', cleanPath);
    if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) return testPath;

    testPath = path.resolve(base, cleanPath.replace(/^img\//, ''));
    if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) return testPath;
  }
  return null;
}

async function getHtmlFiles(dir) {
  let results = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

// Metadados em cache para evitar leituras repetidas
const dimCache = new Map();

async function getImageDimensions(filePath) {
  if (dimCache.has(filePath)) return dimCache.get(filePath);
  try {
    const meta = await sharp(filePath).metadata();
    const dims = { width: meta.width, height: meta.height };
    dimCache.set(filePath, dims);
    return dims;
  } catch (e) {
    return null;
  }
}

// Lista de imagens conhecidas de baixa resolução para upgrade automático
const lowResKnown = {
  'icon-1.png': {
    idealWidth: 420,
    idealHeight: 128,
    displayWidth: 210,
    displayHeight: 64
  }
};

async function fixLowResolution(imgFilePath, targetW, targetH) {
  try {
    const currentMeta = await sharp(imgFilePath).metadata();
    if (currentMeta.width < targetW || currentMeta.height < targetH) {
      console.log(`  🔧 Corrigindo resolução de ${path.basename(imgFilePath)}: ${currentMeta.width}x${currentMeta.height} -> ${targetW}x${targetH}`);
      const buffer = await sharp(imgFilePath)
        .resize(targetW, targetH, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          kernel: 'lanczos3'
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

      await fs.promises.writeFile(imgFilePath, buffer);

      // Atualiza também na cópia em dist/ ou public/ caso diferente
      for (const base of candidateImgDirs) {
        const alt = path.join(base, 'icons', path.basename(imgFilePath));
        if (fs.existsSync(alt) && alt !== imgFilePath) {
          try { await fs.promises.writeFile(alt, buffer); } catch (e) {}
        }
      }

      // Se existir .webp ao lado, atualiza
      const webpPath = `${imgFilePath}.webp`;
      if (fs.existsSync(webpPath)) {
        await sharp(buffer).webp({ quality: 78 }).toFile(webpPath);
      }
    }
  } catch (err) {
    console.warn(`  ⚠️ Não foi possível otimizar resolução de ${imgFilePath}: ${err.message}`);
  }
}

async function run() {
  console.log(`🔍 [postbuild-img] Verificando tags <img> em: ${distDir}`);
  const htmlFiles = await getHtmlFiles(distDir);
  let totalImgsFixed = 0;
  let lowResReported = [];

  for (const htmlPath of htmlFiles) {
    let content = await fs.promises.readFile(htmlPath, 'utf8');
    let modified = false;

    // Regex para tags <img>
    const imgRegex = /<img\b([^>]*?)>/gi;
    let match;
    let newContent = content;

    const matches = [...content.matchAll(imgRegex)];

    for (const m of matches) {
      const fullTag = m[0];
      const attrs = m[1];

      // Ignora tags de imagem dentro de atributos como data-dot="<img ...>"
      const lookback = content.substring(Math.max(0, m.index - 120), m.index);
      if (lookback.includes('data-dot')) continue;

      // Ignora SVGs ou imagens sem src
      const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
      if (!srcMatch) continue;

      const imgSrc = srcMatch[1];
      if (!imgSrc.includes('img/')) continue;

      const hasWidth = /\bwidth=["'][^"']+["']/i.test(attrs);
      const hasHeight = /\bheight=["'][^"']+["']/i.test(attrs);

      const localFile = findLocalImage(imgSrc);
      if (!localFile) continue;

      const webpPath = `${localFile}.webp`;
      let effectiveFile = localFile;
      if (fs.existsSync(webpPath) && !imgSrc.endsWith('.webp') && !imgSrc.includes('carousel-')) {
        effectiveFile = webpPath;
      }

      const dims = await getImageDimensions(effectiveFile);
      if (!dims) continue;

      const fileName = path.basename(localFile);

      // Checa se é imagem de baixa resolução (ex: icon-1.png exibido a 210x64 com DPR 1.5x/2x exigindo 315x96 ou 420x128)
      if (lowResKnown[fileName]) {
        const conf = lowResKnown[fileName];
        if (dims.width < conf.idealWidth) {
          lowResReported.push({
            file: fileName,
            src: imgSrc,
            current: `${dims.width}x${dims.height}`,
            ideal: `${conf.idealWidth}x${conf.idealHeight}`,
            displayed: `${conf.displayWidth}x${conf.displayHeight}`
          });
          // Aplica a correção de resolução sem mudar o tamanho exibido
          await fixLowResolution(localFile, conf.idealWidth, conf.idealHeight);
        }
      }

      let replacement = fullTag;

      // Se for uma imagem com tamanho exibido específico (como icon-1.png = 210x64), usamos o tamanho exibido nos atributos
      let targetWidth = dims.width;
      let targetHeight = dims.height;

      if (lowResKnown[fileName]) {
        targetWidth = lowResKnown[fileName].displayWidth;
        targetHeight = lowResKnown[fileName].displayHeight;
      }

      if (!hasWidth && !hasHeight) {
        replacement = replacement.replace(/<img\b/i, `<img width="${targetWidth}" height="${targetHeight}"`);
      } else if (!hasWidth) {
        replacement = replacement.replace(/<img\b/i, `<img width="${targetWidth}"`);
      } else if (!hasHeight) {
        replacement = replacement.replace(/<img\b/i, `<img height="${targetHeight}"`);
      }

      // Se existir versão .webp mais leve para esta imagem, atualiza o src para .webp (exceto carousel hero)
      if (fs.existsSync(webpPath) && !imgSrc.endsWith('.webp') && !imgSrc.includes('carousel-')) {
        replacement = replacement.replace(imgSrc, `${imgSrc}.webp`);
      }

      if (replacement !== fullTag) {
        newContent = newContent.replace(fullTag, replacement);
        modified = true;
        totalImgsFixed++;
      }
    }

    // Se houver subcaminho configurado (ex: GitHub Pages sob /appt/), ajusta atributos de caminhos raiz
    const basePath = process.env.BASE_PATH || (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '');
    if (basePath && basePath !== '/') {
      const cleanBase = basePath.replace(/\/$/, '');
      const prev = newContent;
      newContent = newContent.replace(/\b(href|src|action)=["']\/([^"']*)["']/gi, (match, attr, val) => {
        if (val.startsWith('/') || val.startsWith(cleanBase.replace(/^\//, '') + '/')) {
          return match;
        }
        return `${attr}="${cleanBase}/${val}"`;
      });
      if (newContent !== prev) modified = true;
    }

    // Preload do CSS bundle principal para eliminar aviso de bloqueio de renderização
    const cssMatch = newContent.match(/<link\s+rel=["']stylesheet["']\s+href=["'](\/_astro\/[^"']+\.css)["']/i);
    if (cssMatch && !newContent.includes(`rel="preload" as="style" href="${cssMatch[1]}"`)) {
      const preloadTag = `<link rel="preload" as="style" href="${cssMatch[1]}">`;
      newContent = newContent.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, `$1${preloadTag}`);
      modified = true;
    }

    if (modified) {
      await fs.promises.writeFile(htmlPath, newContent, 'utf8');
      console.log(`  ✓ Dimensões e caminhos atualizados em: ${path.relative(distDir, htmlPath)}`);
    }

  }

  console.log(`\n✅ [postbuild-img] Concluído: ${totalImgsFixed} tags <img> atualizadas com width/height.`);

  if (lowResReported.length > 0) {
    console.log('\n📊 Relatório de Imagens com Baixa Resolução Detectadas e Corrigidas:');
    for (const item of lowResReported) {
      console.log(`  • ${item.file}: Dimensão real anterior ${item.current} < Ideal DPR ${item.ideal}. Tamanho de exibição preservado em ${item.displayed}.`);
    }
  } else {
    console.log('✨ Nenhuma imagem com baixa resolução identificada.');
  }
}

run().catch(err => {
  console.error('❌ Erro no postbuild-img:', err);
  process.exit(1);
});
