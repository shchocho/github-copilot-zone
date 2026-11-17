"""영어 문구 → VS Code 한국어 언어 팩 번역(없으면 영어 그대로). 사용: python t.py "Allow Once" "Skip" ..."""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
rows = [l.rstrip('\n').split('\t') for l in open(os.path.join(here, 'ref', 'labels.tsv'), encoding='utf-8')]
for q in sys.argv[1:]:
    hits = [r for r in rows if len(r) == 4 and r[2] == q]
    ko = next((r[3] for r in hits if r[3]), None)
    mods = sorted({r[0].split('/')[-1] for r in hits})[:3]
    print(f"{q} => {ko if ko else '(번역 없음: 영어 그대로)' if hits else '(소스에 없음)'}   [{', '.join(mods)}]")
