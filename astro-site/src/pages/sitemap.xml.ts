import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const GET: APIRoute = async () => {
  let pagesDir = __dirname;
  if (!fs.existsSync(path.join(pagesDir, 'index.astro'))) {
    if (fs.existsSync(path.resolve(process.cwd(), 'src/pages/index.astro'))) {
      pagesDir = path.resolve(process.cwd(), 'src/pages');
    } else if (fs.existsSync(path.resolve(process.cwd(), 'astro-site/src/pages/index.astro'))) {
      pagesDir = path.resolve(process.cwd(), 'astro-site/src/pages');
    }
  }
  const files = fs.readdirSync(pagesDir);

  const pendingFiles = new Set([
    'cabinet-refinishing.astro',
    'interior-exterior-painting.astro'
  ]);

  const astroFiles = files
    .filter((file) => 
      file.endsWith('.astro') && 
      !file.startsWith('404') && 
      !file.startsWith('thank-you') &&
      !file.startsWith('_') &&
      !pendingFiles.has(file)
    )
    .sort();

  const baseUrl = 'https://www.opportunity-painting.com';
  const urls: Array<{ loc: string; lastmod: string }> = [];

  // Home first
  const indexFile = 'index.astro';
  if (astroFiles.includes(indexFile)) {
    const filePath = path.join(pagesDir, indexFile);
    const stat = fs.statSync(filePath);
    const lastmod = stat.mtime.toISOString().split('T')[0];
    urls.push({
      loc: `${baseUrl}/`,
      lastmod
    });
  }

  // Demais páginas como /<arquivo>.html
  for (const file of astroFiles) {
    if (file === 'index.astro') continue;
    const filePath = path.join(pagesDir, file);
    const stat = fs.statSync(filePath);
    const lastmod = stat.mtime.toISOString().split('T')[0];
    const slug = file.replace(/\.astro$/, '');
    urls.push({
      loc: `${baseUrl}/${slug}.html`,
      lastmod
    });
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
