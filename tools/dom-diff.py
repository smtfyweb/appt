import sys, collections
from html.parser import HTMLParser
class C(HTMLParser):
    def __init__(s): super().__init__(); s.t=collections.Counter(); s.c=collections.Counter()
    def handle_starttag(s,t,a):
        s.t[t]+=1
        for k,v in a:
            if k=='class' and v:
                for cl in v.split(): s.c[cl]+=1
def load(p):
    c=C(); c.feed(open(p,encoding='utf-8',errors='ignore').read()); return c
A,B=sys.argv[1],sys.argv[2]
for page in sys.argv[3:]:
    a=load(f"{A}/{page}.html"); b=load(f"{B}/{page}.html")
    print("==",page)
    for k in sorted(set(a.t)|set(b.t)):
        if a.t[k]!=b.t[k] and k not in ('script','style','link','meta'): print(f"  <{k}>  ar={a.t[k]}  novo={b.t[k]}")
    for k in sorted(set(a.c)|set(b.c)):
        if a.c[k]!=b.c[k] and not k.startswith('astro'): print(f"  .{k}  ar={a.c[k]}  novo={b.c[k]}")
