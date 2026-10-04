"""Small copies of the photos (480px wide) for places that show many at once, like the moving grid in the hero.

Run from the repository root after adding photos:  python3 tools/thumbs.py
Writes assets/img/mini/<project>/<photo>.jpg (needs Pillow: pip install pillow).
"""
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from places import PLACES, photo_path  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

for p in PLACES:
    for i in range(len(p["photos"])):
        src = os.path.join(ROOT, photo_path(p, i))
        dst = os.path.join(ROOT, mini := photo_path(p, i).replace("img/lugares/", "img/mini/"))
        if os.path.exists(dst) and os.path.getmtime(dst) > os.path.getmtime(src):
            continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im = Image.open(src).convert("RGB")
        im.thumbnail((480, 600), Image.LANCZOS)
        im.save(dst, quality=74, optimize=True, progressive=True)
        print("wrote", mini)
