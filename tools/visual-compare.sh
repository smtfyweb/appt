#!/usr/bin/env bash
# Comparação visual: site no ar x Astro (preview em :4321).
# Uso: tools/visual-compare.sh [pagina ...]   (sem extensão; padrão: index service-interior-painting)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT" || exit 2
PAGES=("$@"); [ ${#PAGES[@]} -eq 0 ] && PAGES=(index service-interior-painting)
command -v convert >/dev/null || { echo "Instale o ImageMagick: sudo apt install -y imagemagick"; exit 2; }
mkdir -p tools/shots shots3 pares && rm -f shots3/*.png pares/*.jpg
if [ ! -d tools/shots/node_modules/playwright ]; then
  echo "Instalando o Playwright (uma vez)..."; (cd tools/shots && npm init -y >/dev/null 2>&1 && npm i playwright@1.63.0 >/dev/null 2>&1)
fi
cat > tools/shots/shoot.mjs <<'JS'
import { chromium } from 'playwright';
const LIVE = 'https://www.opportunity-painting.com/', NEW = 'http://localhost:4322/';
const views = [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]];
const pages = process.argv.slice(2);
const browser = await chromium.launch();
for (const name of pages) for (const [tag, vp] of views) for (const [side, base] of [['atual', LIVE], ['novo', NEW]]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  try {
    await page.goto(`${base}${name}.html`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2500);
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important} .wow{visibility:visible!important;opacity:1!important}' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `../../shots3/${side}-${name}-${tag}.png`, fullPage: true });
  } catch (e) { console.error(`FALHA ${side} ${name} ${tag}: ${e.message}`); }
  await ctx.close();
}
await browser.close();
JS
curl -s -o /dev/null http://localhost:4322/index.html || { (cd astro-site && npx astro preview --port 4322 >/tmp/preview.log 2>&1 &); sleep 5; }
(cd tools/shots && node shoot.mjs "${PAGES[@]}") || exit 1
cd shots3 || exit 1
for n in "${PAGES[@]}"; do for t in d m; do
  A="atual-$n-$t.png"; N="novo-$n-$t.png"; [ -f "$A" ] && [ -f "$N" ] || { echo "$n-$t: captura ausente"; continue; }
  if [ "$t" = d ]; then W=1440; H=700; else W=390; H=900; fi
  ha=$(identify -format %h "$A"); hn=$(identify -format %h "$N")
  echo "$n-$t  altura atual=$ha novo=$hn  (diferença $((hn-ha)) px)"
  rm -f /tmp/ba_*.png /tmp/bn_*.png
  convert "$A" -crop "${W}x${H}" +repage /tmp/ba_%02d.png; convert "$N" -crop "${W}x${H}" +repage /tmp/bn_%02d.png
  for a in /tmp/ba_*.png; do i=${a##*ba_}; i=${i%.png}; b=/tmp/bn_$i.png
    [ -f "$b" ] || { echo "  faixa $i: só existe no atual"; continue; }
    wa=$(identify -format "%wx%h" "$a"); wb=$(identify -format "%wx%h" "$b")
    [ "$wa" = "$wb" ] || { echo "  faixa $i: tamanhos diferentes ($wa x $wb)"; continue; }
    ae=$(compare -metric AE -fuzz 12% "$a" "$b" null: 2>&1 | awk '{print $1}'); tot=$(identify -format "%[fx:w*h]" "$a")
    pct=$(awk -v a="$ae" -v t="$tot" 'BEGIN{printf "%.1f", 100*a/t}')
    if awk -v p="$pct" 'BEGIN{exit !(p>3)}'; then
      echo "  faixa $i: $pct% diferente  <-- REVISAR"
      convert -background '#777' "$a" "$b" +append +repage -resize 1800x "../pares/$n-$t-$i.jpg"
    else echo "  faixa $i: $pct% diferente"; fi
  done
  for b in /tmp/bn_*.png; do i=${b##*bn_}; i=${i%.png}; [ -f "/tmp/ba_$i.png" ] || echo "  faixa $i: só existe no novo"; done
done; done
echo; echo "Anexe os arquivos de pares/ marcados como REVISAR (atual à esquerda, novo à direita):"; ls ../pares 2>/dev/null
