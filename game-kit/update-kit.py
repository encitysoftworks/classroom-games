#!/usr/bin/env python3
"""Copy the latest Classroom Game Kit (CSS + JS) and textbook word bank into one or more game files.

    python3 /mnt/project-files/game-kit/update-kit.py "/mnt/project-files/My Game.html" [more.html ...]

A game needs these three spots (the starter game already has them):
    <style>/*KIT:CSS START*/ ... /*KIT:CSS END*/</style>
    <script type="application/json" id="kit-wordbank">...</script>
    <script>/*KIT:JS START*/ ... /*KIT:JS END*/</script>
3D games also have  <script>/*KIT:3D START*/ ... /*KIT:3D END*/</script>  after the three.js tag; it gets retro3d.js.
Add --no-words to leave the word bank out (games that don't use textbook words).
"""
import json, re, sys, pathlib

KIT = pathlib.Path(__file__).resolve().parent
DB = KIT.parent / "textbook-db" / "all-books.json"

def between(text, start, end, body, path):
    pat = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    if not pat.search(text):
        sys.exit(f"{path}: missing {start} ... {end} markers")
    return pat.sub(lambda m: start + "\n" + body.strip() + "\n" + end, text, count=1)

def main(args):
    words = "--no-words" not in args
    files = [a for a in args if not a.startswith("--")]
    if not files:
        sys.exit(__doc__)
    css = (KIT / "classroom-kit.css").read_text(encoding="utf-8")
    # a literal </script> inside the code would end the script tag early
    safe = lambda code: code.replace("</script", "<\\/script")
    js = safe((KIT / "classroom-kit.js").read_text(encoding="utf-8"))
    if words:
        data = json.loads(DB.read_text(encoding="utf-8"))
        # games only need what they show; drop the long source notes
        for b in data["books"]:
            b.pop("source", None)
        bank = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    for f in files:
        p = pathlib.Path(f)
        t = p.read_text(encoding="utf-8")
        t = between(t, "/*KIT:CSS START*/", "/*KIT:CSS END*/", css, p)
        t = between(t, "/*KIT:JS START*/", "/*KIT:JS END*/", js, p)
        if "/*KIT:3D START*/" in t:
            t = between(t, "/*KIT:3D START*/", "/*KIT:3D END*/", safe((KIT / "retro3d.js").read_text(encoding="utf-8")), p)
        wb = re.compile(r'(<script type="application/json" id="kit-wordbank">).*?(</script>)', re.S)
        if words:
            if not wb.search(t):
                sys.exit(f'{p}: missing <script type="application/json" id="kit-wordbank">')
            t = wb.sub(lambda m: m.group(1) + bank + m.group(2), t, count=1)
        p.write_text(t, encoding="utf-8")
        print(f"updated {p} ({len(t)//1024} KB)")

if __name__ == "__main__":
    main(sys.argv[1:])
