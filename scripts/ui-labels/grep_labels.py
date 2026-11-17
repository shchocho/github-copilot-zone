"""정규식으로 영어 문구를 찾아 한국어 번역과 함께 보여 준다. 사용: python grep_labels.py <모듈 정규식> <문구 정규식> [최대]"""
import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')
here = os.path.dirname(os.path.abspath(__file__))
mod_re, en_re = re.compile(sys.argv[1]), re.compile(sys.argv[2])
limit = int(sys.argv[3]) if len(sys.argv) > 3 else 80
seen, n = {}, 0
for line in open(os.path.join(here, 'ref', 'labels.tsv'), encoding='utf-8'):
    r = line.rstrip('\n').split('\t')
    if len(r) != 4 or not mod_re.search(r[0]) or not en_re.search(r[2]):
        continue
    prev = seen.get(r[2])
    if prev is None or (not prev[0] and r[3]):
        seen[r[2]] = (r[3], r[0].split('/')[-1])
for en, (ko, mod) in list(seen.items())[:limit]:
    print(f"{en[:90]} => {ko[:90] if ko else '(영어)'}   [{mod}]")
