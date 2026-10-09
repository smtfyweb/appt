import re, glob
R = 'astro-site'
def read(p): return open(p, encoding='utf-8', errors='ignore').read()
def css_classes(t):
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    t = re.sub(r'url\([^)]*\)', '', t)
    t = re.sub(r'\{[^{}]*\}', '{}', t); t = re.sub(r'\{[^{}]*\}', '{}', t)
    return set(m.replace('\\', '') for m in re.findall(r'\.(-?[_a-zA-Z](?:[_a-zA-Z0-9-]|\\.)*)', t))
html = set(); inline = ''
for p in glob.glob(f'{R}/dist/**/*.html', recursive=True):
    s = read(p)
    for m in re.finditer(r'class="([^"]*)"', s): html.update(m.group(1).split())
    for m in re.finditer(r'<style[^>]*>(.*?)</style>', s, re.S): inline += m.group(1)
src = set()
for p in glob.glob(f'{R}/src/styles/*.css') + glob.glob(f'{R}/public/css/*.css') + glob.glob(f'{R}/public/lib/**/*.css', recursive=True): src |= css_classes(read(p))
fin = css_classes(inline)
for p in glob.glob(f'{R}/dist/**/*.css', recursive=True): fin |= css_classes(read(p))
lost = sorted(c for c in html if c in src and c not in fin)
print(f'classes no HTML: {len(html)} | no CSS original: {len(src)} | no CSS final: {len(fin)}')
print('USADAS NO HTML, EXISTEM NO CSS ORIGINAL E SUMIRAM NO FINAL:', len(lost))
for c in lost[:60]: print('  .' + c)
