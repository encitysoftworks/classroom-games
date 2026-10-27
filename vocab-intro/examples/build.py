#!/usr/bin/env python3
"""Build examples.json from the checked example files and copy it into Vocab Intro.

Usage: python3 build.py            (check, build, embed)
       python3 build.py --show     (also print every grammar swap as it will appear)
The files elementary.txt and junior-high.txt hold one checked example sentence per word,
and for each grammar point the words that fit its blank. See the top of elementary.txt.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "..", "..", "textbook-db", "all-books.json")
PAGE = os.path.join(HERE, "..", "Vocab Intro.html")
OUT = os.path.join(HERE, "examples.json")


def parse(path, data):
    book = unit = None
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        line = line.rstrip("\n")
        if not line.strip():
            continue
        m = re.match(r"# (.+)\|(\d+)\s*$", line)
        if m:
            book, unit = m.group(1), m.group(2)
            data.setdefault(book, {})[unit] = {"ex": {}, "swap": {}}
            continue
        if line.startswith("#"):
            continue
        u = data[book][unit]
        m = re.match(r"@(\d+)(?:\[(.+?)\])?\s+(.*)$", line)
        if m:
            slots = [s.strip() for s in m.group(2).split(",")] if m.group(2) else None
            fill = []
            for f in m.group(3).split("|"):
                f = f.strip()
                v, _, pic = f.partition(">")
                vals = [x.strip() for x in v.split("~")]
                fill.append({"v": vals, "pic": (pic.strip() or re.sub(r"^(a|an|the)\s+", "", vals[0], flags=re.I)).lower()})
            u["swap"][m.group(1)] = {"slots": slots, "fill": fill}
            continue
        w, sep, s = line.partition(" = ")
        if not sep:
            sys.exit(f"{path}:{n}: can't read: {line}")
        u["ex"][w.strip()] = s.strip()
    return data


def slots_in(t):
    return re.findall(r"\(([^)]+)\)", t or "")


def texts(g):
    out = [g["pattern"]]
    for qa in g.get("qa") or []:
        out += [x for x in qa if x]
    out += [x for x in (g.get("neg"), g.get("q")) if x]
    return out


def main_slot(p, words):
    """same rule as the page: first slot holding one of the unit's words, else the last non-number slot"""
    base = lambda t: re.sub(r"^(a|an|the)\s+", "", t.lower())
    ws = {base(w) for w in words}
    ss = slots_in(p)
    for s in ss:
        if base(s) in ws or base(s).rstrip("s") in ws:
            return s
    return ss[-1] if ss else None


def main():
    data = {}
    for f in ("elementary.txt", "junior-high.txt"):
        parse(os.path.join(HERE, f), data)
    db = json.load(open(DB, encoding="utf-8"))
    problems, show = [], "--show" in sys.argv
    for b in db["books"]:
        for u in b["units"]:
            e = data.get(b["book"], {}).get(str(u["unit"]))
            if not e:
                problems.append(f"{b['book']} unit {u['unit']}: no examples")
                continue
            words = [w["en"] for w in u["words"]]
            for w in words:
                if w not in e["ex"]:
                    problems.append(f"{b['book']} {u['unit']}: no sentence for '{w}'")
            for w in e["ex"]:
                if w not in words:
                    problems.append(f"{b['book']} {u['unit']}: '{w}' is not a word in this unit")
            gs = u.get("grammar") or []
            for gi, sw in e["swap"].items():
                gi = int(gi)
                if gi >= len(gs):
                    problems.append(f"{b['book']} {u['unit']}: no grammar point @{gi}")
                    continue
                g = gs[gi]
                allslots = [s for t in texts(g) for s in slots_in(t)]
                if not sw["slots"]:
                    sw["slots"] = [main_slot(g["pattern"], words)]
                for s in sw["slots"]:
                    if s not in allslots:
                        problems.append(f"{b['book']} {u['unit']} @{gi}: slot '{s}' not in {allslots}")
                for f in sw["fill"]:
                    if len(f["v"]) != len(sw["slots"]):
                        problems.append(f"{b['book']} {u['unit']} @{gi}: '{'~'.join(f['v'])}' needs {len(sw['slots'])} parts")
                if show:
                    print(f"## {b['book']} {u['unit']} @{gi}")
                    for f in [{"v": sw["slots"]}] + sw["fill"]:
                        m = dict(zip(sw["slots"], f["v"]))
                        print("   " + "  //  ".join(re.sub(r"\(([^)]+)\)", lambda x: m.get(x.group(1), x.group(1)), t) for t in texts(g)))
    if problems:
        print("\n".join(problems))
        sys.exit(1)
    json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    page = open(PAGE, encoding="utf-8").read()
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    new, k = re.subn(r'(<script type="application/json" id="vi-examples">).*?(</script>)', lambda m: m.group(1) + blob + m.group(2), page, flags=re.S)
    if not k:
        sys.exit("Vocab Intro has no vi-examples block")
    open(PAGE, "w", encoding="utf-8").write(new)
    n = sum(len(u["ex"]) for b in data.values() for u in b.values())
    s = sum(len(u["swap"]) for b in data.values() for u in b.values())
    print(f"ok: {n} sentences, {s} grammar swap lists, copied into Vocab Intro")


main()
