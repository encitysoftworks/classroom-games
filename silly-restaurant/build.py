#!/usr/bin/env python3
"""Build "Silly Restaurant.html" from template.html: embeds the food pictures from ../food-art/ (small webp,
keyed by lower-case file name) and copies in the game kit. Run:  python3 /mnt/project-files/silly-restaurant/build.py"""
import base64, io, json, pathlib, subprocess, sys
from PIL import Image
HERE = pathlib.Path(__file__).resolve().parent
ART = HERE.parent / "food-art"
imgs = {}
SILLY = HERE.parent / "silly-art"   # Wyatt's "Silly Things" pictures for the wrong-order surprises
files = sorted(ART.glob("*.png")) + sorted(p for p in SILLY.glob("*") if p.suffix.lower() in (".png", ".jpg", ".jpeg"))
for f in files:
    im = Image.open(f).convert("RGBA"); im.thumbnail((280, 280))
    b = io.BytesIO(); im.save(b, "WEBP", quality=78, method=6)
    imgs[f.stem.lower().strip()] = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()
t = (HERE / "template.html").read_text(encoding="utf-8")
t = t.replace("/*FOOD_IMGS*/{}", json.dumps(imgs))
out = HERE / "Silly Restaurant.html"
out.write_text(t, encoding="utf-8")
subprocess.run([sys.executable, str(HERE.parent / "game-kit" / "update-kit.py"), "--no-words", str(out)], check=True)
print(len(imgs), "pictures:", ", ".join(sorted(imgs)))
