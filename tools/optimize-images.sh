#!/usr/bin/env bash
# Otimiza as imagens de img/ NO LUGAR (mesmos nomes; só reduz peso e dimensões excessivas).
# Faz backup em img-original/ na primeira execução. Uso: tools/optimize-images.sh
cd "$(dirname "$0")/.." || exit 1
[ -d img ] || { echo "pasta img/ não encontrada"; exit 1; }
command -v convert >/dev/null || { echo "Instale o ImageMagick: sudo apt install -y imagemagick"; exit 2; }
[ -d img-original ] || { cp -r img img-original && echo "backup criado em img-original/"; }
antes=$(du -sk img | cut -f1)
find img -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) | while read -r f; do
  case "$(basename "$f")" in carousel-*|bg*|banner*|header*) W=1920 ;; *) W=1200 ;; esac
  convert "$f" -auto-orient -strip -resize "${W}x>" -sampling-factor 4:2:0 -interlace Plane -quality 78 "$f"
done
find img -type f -iname '*.png' | while read -r f; do
  convert "$f" -strip -resize "1200x>" -define png:compression-level=9 "$f"
done
depois=$(du -sk img | cut -f1)
echo "img/: ${antes} KB -> ${depois} KB"
echo "Maiores arquivos agora:"; find img -type f -printf '%s %p\n' | sort -rn | head -8 | awk '{printf "  %6.0f KB  %s\n", $1/1024, $2}'
