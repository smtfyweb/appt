#!/usr/bin/env bash
cd "$(dirname "$0")"
IGN='tel:[+](0123456789|15082159441)|google\.com/search\?q=opportunity\+painting\+reviews&\.\.\."|yelp\.com/biz/opportunity-painting-holliston-3\?\.\.\. "'
ext() { grep -ohE 'href="(tel:|mailto:|https?://wa\.me|https?://api\.whatsapp\.com|https?://[a-z.]*(instagram|facebook|youtube|yelp|houzz|linkedin|tiktok|twitter|x)\.com|https?://www\.google\.com/(search|maps|business))[^"]*"|action="[^"]*"|GTM-[A-Z0-9]+|\bG-[A-Z0-9]{8,}\b|AW-[0-9]+|[^"[:space:]]*[Ll]eadster[^"[:space:]]*|5S5Ke1EYL55DdkQ3woVJP7zrt' "$1" | sort -u; }
fail=0; compared=0
for f in live/*.html; do b=$(basename "$f"); n="astro-site/dist/$b"
  [ -f "$n" ] || { echo "FALTA NO NOVO: $b"; fail=1; continue; }
  compared=$((compared+1))
  d=$(diff <(ext "$f") <(ext "$n") | grep -E '^[<>]' | grep -v -E "$IGN")
  if [ -n "$d" ]; then echo "--- $b"; echo "$d"; fail=1; fi
done
[ $compared -lt 14 ] && { echo "Só $compared páginas comparadas (esperado 14)"; fail=1; }
[ $fail -eq 0 ] && echo "PRESERVAÇÃO OK ($compared páginas comparadas)" || { echo "REPROVADO"; exit 1; }
