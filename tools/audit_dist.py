#!/usr/bin/env python3
"""Auditoria técnica do dist/ (somente biblioteca padrão do Python).
Uso: python3 audit_dist.py [pasta_dist] [base_url]
Saída: ERRO (reprova o build), AVISO (revisar), e código de saída 1 se houver ERRO."""
import sys, os, re, json
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

DIST = sys.argv[1] if len(sys.argv) > 1 else "dist"
BASE = (sys.argv[2] if len(sys.argv) > 2 else "https://www.opportunity-painting.com").rstrip("/")
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"}

class Page(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.title = ""; s.in_title = False; s.meta = {}; s.canonical = None; s.lang = None
        s.headings = []; s.cur_h = None; s.images = []; s.links = []; s.ids = []
        s.jsonld = []; s.in_jsonld = False; s.buf = ""; s.form_depth = 0
        s.loose_fields = []; s.forms = []; s.scripts_ext = []; s.viewport = False; s.charset = False
        s.http_assets = []
    def handle_starttag(s, t, a):
        a = {k: (v or "") for k, v in a}
        if "id" in a: s.ids.append(a["id"])
        if t == "html": s.lang = a.get("lang")
        elif t == "title": s.in_title = True
        elif t == "meta":
            if a.get("charset"): s.charset = True
            n = (a.get("name") or a.get("property") or "").lower()
            if n: s.meta[n] = a.get("content", "")
            if n == "viewport": s.viewport = True
        elif t == "link":
            if "canonical" in a.get("rel", "").lower().split(): s.canonical = a.get("href")
            if a.get("href", "").startswith("http://") and "stylesheet" in a.get("rel", ""): s.http_assets.append(a["href"])
        elif re.fullmatch(r"h[1-6]", t): s.cur_h = [int(t[1]), ""]
        elif t == "img": s.images.append(a)
        elif t == "a" and "href" in a: s.links.append(a)
        elif t == "form": s.form_depth += 1; s.forms.append(a)
        elif t in ("input", "textarea", "select") and s.form_depth == 0 and a.get("type") not in ("hidden", "submit", "button"):
            s.loose_fields.append(a.get("name") or a.get("placeholder") or t)
        elif t == "script":
            if a.get("type") == "application/ld+json": s.in_jsonld = True; s.buf = ""
            elif a.get("src"):
                s.scripts_ext.append(a["src"])
                if a["src"].startswith("http://"): s.http_assets.append(a["src"])
    def handle_endtag(s, t):
        if t == "title": s.in_title = False
        elif re.fullmatch(r"h[1-6]", t) and s.cur_h: s.headings.append(tuple(s.cur_h)); s.cur_h = None
        elif t == "form" and s.form_depth: s.form_depth -= 1
        elif t == "script" and s.in_jsonld: s.in_jsonld = False; s.jsonld.append(s.buf)
    def handle_data(s, d):
        if s.in_title: s.title += d
        if s.cur_h is not None: s.cur_h[1] += d
        if s.in_jsonld: s.buf += d

errors, warns = [], []
def err(p, m): errors.append(f"[ERRO]  {p}: {m}")
def warn(p, m): warns.append(f"[AVISO] {p}: {m}")

files = sorted(f for f in os.listdir(DIST) if f.endswith(".html"))
pages, titles, descs = {}, {}, {}
for f in files:
    p = Page(); p.feed(open(os.path.join(DIST, f), encoding="utf-8", errors="ignore").read()); pages[f] = p

def resolve(href, cur):
    u = urlparse(href)
    if u.scheme in ("mailto", "tel", "javascript", "sms", "whatsapp"): return None
    if u.scheme in ("http", "https"):
        if urlparse(BASE).netloc.replace("www.", "") != u.netloc.replace("www.", ""): return None
        path = u.path
    else:
        path = u.path
        if not path: return (cur, u.fragment)
        if not path.startswith("/"): path = "/" + path
    path = unquote(path)
    target = "index.html" if path in ("", "/") else path.lstrip("/")
    return (target, u.fragment)

for f, p in pages.items():
    noindex = "noindex" in p.meta.get("robots", "").lower()
    if not p.lang: err(f, "<html> sem atributo lang")
    if not p.charset: warn(f, "sem <meta charset>")
    if not p.viewport: err(f, "sem <meta name=viewport>")
    t = p.title.strip()
    if not t: err(f, "sem <title>")
    elif len(t) > 65: warn(f, f"title com {len(t)} caracteres (ideal até ~60)")
    d = p.meta.get("description", "").strip()
    if not noindex:
        if not d: err(f, "sem meta description")
        elif len(d) < 70 or len(d) > 165: warn(f, f"meta description com {len(d)} caracteres (ideal 70-160)")
        if not p.canonical: err(f, "sem canonical")
        else:
            exp = BASE + "/" if f == "index.html" else f"{BASE}/{f}"
            if p.canonical != exp: err(f, f"canonical inesperado: {p.canonical} (esperado {exp})")
        for k in ("og:title", "og:description", "og:image", "og:url"):
            if k not in p.meta: warn(f, f"falta {k}")
    titles.setdefault(t, []).append(f)
    if d and not noindex: descs.setdefault(d, []).append(f)
    h1 = [h for h in p.headings if h[0] == 1]
    if len(h1) != 1: err(f, f"{len(h1)} tags <h1> (esperado 1)")
    if any(not h[1].strip() for h in p.headings): err(f, "heading vazio")
    prev = 0
    for lvl, txt in p.headings:
        if prev and lvl > prev + 1: warn(f, f"salto de heading h{prev} -> h{lvl} ('{txt.strip()[:40]}')")
        prev = lvl
    dup = {i for i in p.ids if p.ids.count(i) > 1}
    if dup: err(f, f"ids duplicados: {sorted(dup)[:5]}")
    for im in p.images:
        src = im.get("src", "?")
        if "alt" not in im: err(f, f"<img> sem alt: {src}")
        if not (im.get("width") and im.get("height")): warn(f, f"<img> sem width/height (risco de CLS): {src}")
    for h in p.http_assets: err(f, f"recurso inseguro (http://): {h}")
    for fld in p.loose_fields[:6]:
        if fld == "Your email": warn(f, "newsletter inerte (campo 'Your email' sem formulário; decisão pendente)")
        else: err(f, f"campo fora de <form> (não será enviado): {fld}")
    for fm in p.forms:
        if not fm.get("action"): warn(f, "<form> sem action")
    for i, raw in enumerate(p.jsonld):
        try:
            j = json.loads(raw)
        except Exception as e:
            err(f, f"JSON-LD #{i+1} inválido: {e}"); continue
        for node in (j if isinstance(j, list) else [j]):
            if "@type" not in node and "@graph" not in node: err(f, f"JSON-LD #{i+1} sem @type")
        if re.search(r"#\s*\[|\[(Registration|License)|lorem|TODO", raw, re.I): err(f, f"JSON-LD #{i+1} com placeholder")
    for a in p.links:
        href = a["href"].strip()
        if href in ("#", ""): warn(f, f"link morto href='{href}'"); continue
        if a.get("target") == "_blank" and "noopener" not in a.get("rel", ""): warn(f, f"target=_blank sem rel=noopener: {href[:60]}")
        r = resolve(href, f)
        if not r: continue
        tgt, frag = r
        if tgt not in pages and not os.path.exists(os.path.join(DIST, tgt)): err(f, f"link interno quebrado: {href}"); continue
        if frag and tgt in pages and frag not in pages[tgt].ids and frag != "top": err(f, f"âncora inexistente: {href}")

for t, fs in titles.items():
    if t and len(fs) > 1: warn(", ".join(fs), f"title duplicado: '{t[:50]}'")
for d, fs in descs.items():
    if len(fs) > 1: warn(", ".join(fs), "meta description duplicada")

sm = os.path.join(DIST, "sitemap.xml")
if not os.path.exists(sm): err("sitemap.xml", "não existe")
else:
    locs = re.findall(r"<loc>([^<]+)</loc>", open(sm, encoding="utf-8").read())
    inmap = set()
    for u in locs:
        r = resolve(u, "")
        if not r: err("sitemap.xml", f"URL fora do domínio: {u}"); continue
        inmap.add(r[0])
        if r[0] not in pages: err("sitemap.xml", f"URL sem página no dist: {u}")
    for f, p in pages.items():
        if "noindex" not in p.meta.get("robots", "").lower() and f not in inmap: warn("sitemap.xml", f"página indexável fora do sitemap: {f}")
if not os.path.exists(os.path.join(DIST, "robots.txt")): err("robots.txt", "não existe")

print(f"\n=== Auditoria de {len(pages)} páginas em '{DIST}' ===")
for line in errors + warns: print(line)
print(f"\nResumo: {len(errors)} erro(s), {len(warns)} aviso(s)")
sys.exit(1 if errors else 0)
