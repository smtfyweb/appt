#!/usr/bin/env bash
# Auditoria técnica completa do projeto. Uso: ./audit.sh [--sem-lighthouse]
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/astro-site" || exit 2
FAIL=0; PUBLISH_BLOCK=0
step() { printf '\n━━ %s\n' "$1"; }

step "1/8  Astro check (tipos, componentes e templates)"
npm ls @astrojs/check >/dev/null 2>&1 || npm i -D @astrojs/check typescript >/dev/null 2>&1
npx astro check 2>&1 | tail -15
[ "${PIPESTATUS[0]}" -eq 0 ] || FAIL=1

step "2/8  Build de produção"
npx astro build >/tmp/audit-build.log 2>&1 || { tail -15 /tmp/audit-build.log; FAIL=1; }
grep -i -E "warn|error" /tmp/audit-build.log | head -10
ls dist >/dev/null 2>&1 || { echo "  dist/ não existe"; FAIL=1; }

step "3/8  Trava legal (número do HIC no footer)"
node check-dist.js >/tmp/audit-legal.log 2>&1 && echo "  OK" || { cat /tmp/audit-legal.log | head -3; PUBLISH_BLOCK=1; }

step "4/8  Estrutura, SEO, links, formulários e JSON-LD"
python3 "$ROOT/tools/audit_dist.py" dist https://www.opportunity-painting.com || FAIL=1

step "5/8  Validação de HTML (html-validate)"
npx --yes html-validate "dist/*.html" 2>&1 | tail -25
[ "${PIPESTATUS[0]}" -eq 0 ] || echo "  (revisar: itens acima; não reprova sozinho)"

step "6/8  Higiene do pacote e segredos"
BAD=$(find dist -type f \( -name "*.map" -o -name "*.md" -o -name "*.env*" -o -name "*.log" -o -name "*.bak" -o -iname "*copy*" -o -iname "*backup*" \) 2>/dev/null | head -20)
EXTRA=$(find dist -maxdepth 2 -type f -name "*.txt" ! -name robots.txt 2>/dev/null | head -20)
[ -n "$BAD$EXTRA" ] && { echo "  ARQUIVOS SUSPEITOS EM dist/:"; echo "$BAD$EXTRA"; FAIL=1; } || echo "  dist/ sem arquivos suspeitos"
for f in robots.txt sitemap.xml 404.html .htaccess; do [ -e "dist/$f" ] || { echo "  FALTA dist/$f"; FAIL=1; }; done
SEC=$(grep -rnE "(gsk_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|sk-[A-Za-z0-9]{20,}|BEGIN (RSA |EC )?PRIVATE KEY)" src public 2>/dev/null | cut -c1-120)
[ -n "$SEC" ] && { echo "  POSSÍVEL SEGREDO NO CÓDIGO:"; echo "$SEC"; FAIL=1; } || echo "  nenhum segredo detectado"
BIG=$(find dist -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) -size +300k 2>/dev/null | wc -l)
echo "  imagens acima de 300 KB: $BIG (alvo: 0)"

step "7/8  Preservação (links, contatos, chat, formulários do site no ar)"
"$ROOT/check-preserve.sh" || FAIL=1

if [ "${1:-}" != "--sem-lighthouse" ]; then
  step "8/8  Lighthouse mobile (metas: acessibilidade ≥95, boas práticas ≥90, SEO 100)"
  (npx astro preview --port 4321 >/tmp/audit-preview.log 2>&1 &); sleep 4
  for u in index service-interior-painting about contact; do
    echo " /$u.html"
    npx --yes lighthouse "http://localhost:4321/$u.html" --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/audit-lh.json --chrome-flags="--headless" --quiet >/dev/null 2>&1 || { echo "  falha ao rodar o Lighthouse"; FAIL=1; continue; }
    node -e '
const r=require("/tmp/audit-lh.json"),c=r.categories,s=k=>Math.round(c[k].score*100);
const p=s("performance"),a=s("accessibility"),b=s("best-practices"),q=s("seo"),ok=a>=95&&b>=90&&q===100;
console.log("  perf "+p+" | a11y "+a+" | boas-práticas "+b+" | seo "+q+" | LCP "+r.audits["largest-contentful-paint"].displayValue+" | TBT "+r.audits["total-blocking-time"].displayValue+" | CLS "+r.audits["cumulative-layout-shift"].displayValue+"  "+(ok?"OK":"ABAIXO DA META"));
process.exit(ok?0:1)' || FAIL=1
  done
  pkill -f "astro preview" >/dev/null 2>&1
fi

printf '\n━━ RESULTADO\n'
[ $FAIL -eq 0 ] && echo "  TÉCNICO: APROVADO" || echo "  TÉCNICO: REPROVADO (ver itens acima)"
[ $PUBLISH_BLOCK -eq 0 ] && echo "  LEGAL: OK" || echo "  LEGAL: BLOQUEADO para publicar (falta o número do HIC)"
[ $FAIL -eq 0 ] && [ $PUBLISH_BLOCK -eq 0 ] && echo "  >>> PRONTO PARA PUBLICAR" || exit 1
