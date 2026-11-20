#!/usr/bin/env python3
"""Build "Mystery Lunchbox.html" from template.html: embeds the food pictures from ../food-art/ (as small webp)
and copies in the game kit. Run:  python3 /mnt/project-files/mystery-lunchbox/build.py"""
import base64, io, json, pathlib, subprocess, sys
from PIL import Image
HERE = pathlib.Path(__file__).resolve().parent
ART = HERE.parent / "food-art"
imgs = {}
for f in sorted(ART.glob("*.png")):
    im = Image.open(f).convert("RGBA"); im.thumbnail((320, 320))
    b = io.BytesIO(); im.save(b, "WEBP", quality=80, method=6)
    imgs[f.stem] = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()
t = (HERE / "template.html").read_text(encoding="utf-8")
t = t.replace("/*FOOD_IMGS*/{}", json.dumps(imgs))
# Shape Shop ingredient pictures (already small webp) for the Fruits / Vegetables / Meat / All themes
ss = (HERE.parent / "shape-shop" / "Shape Shop.html").read_text(encoding="utf-8")
i = ss.index("const FOODS=") + len("const FOODS=")
foods, _ = json.JSONDecoder().raw_decode(ss[i:])
t = t.replace("/*SS_FOODS*/[]", json.dumps([{"en": f["en"], "ja": f["ja"], "d": f["d"]} for f in foods], ensure_ascii=False))
out = HERE / "Mystery Lunchbox.html"
out.write_text(t, encoding="utf-8")
subprocess.run([sys.executable, str(HERE.parent / "game-kit" / "update-kit.py"), "--no-words", str(out)], check=True)
