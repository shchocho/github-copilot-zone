import json, os, re, sys

root, ko_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
ko = json.load(open(ko_path, encoding='utf-8'))['contents']
pat = re.compile(r"""localize2?\(\s*(?:\{[^}]*key:\s*)?['"]([^'"]+)['"][^,]*?,\s*(['"`])((?:\\.|(?!\2).)*)\2""", re.S)
rows = []
for d, _, fs in os.walk(os.path.join(root, 'src')):
    for f in fs:
        if not f.endswith('.ts') or f.endswith('.test.ts'):
            continue
        p = os.path.join(d, f)
        mod = os.path.relpath(p, os.path.join(root, 'src')).replace(os.sep, '/')[:-3]
        src = open(p, encoding='utf-8').read()
        for m in pat.finditer(src):
            key, en = m.group(1), m.group(3)
            rows.append((mod, key, en, ko.get(mod, {}).get(key, '')))
with open(out, 'w', encoding='utf-8') as w:
    for r in rows:
        w.write('\t'.join(x.replace('\t', ' ').replace('\n', ' ') for x in r) + '\n')
print(len(rows), 'labels;', sum(1 for r in rows if r[3]), 'translated')
