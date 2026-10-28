#!/usr/bin/env python3
"""Copy the latest files from the Claude project folder into this repository.

    python3 tools/sync-from-project.py [/mnt/project-files]

The project folder is where the games are made, so it is the master copy.
This script mirrors it here, giving the games short web-friendly names.
"""
import pathlib, shutil, sys

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files")
REPO = pathlib.Path(__file__).resolve().parent.parent

# project file -> repo file (folders not listed here keep their names)
RENAME = {
    "Classroom Games Hub.html": "index.html",
    "The Keypad Game.html": "keypad.html",
    "The Maze Game.html": "maze.html",
    "game-kit/starters/Picture Lock.html": "game-kit/starters/picture-lock.html",
    "game-kit/starters/Word Party.html": "game-kit/starters/word-party.html",
    "game-kit/starters/Word Island.html": "game-kit/starters/word-island.html",
    "Word Island.html": "word-island.html",
    "sentence-box/Sentence Box.html": "sentence-box/index.html",
    "vocab-intro/Vocab Intro.html": "vocab-intro.html",
    "memory-imposter/Memory Imposter.html": "memory-imposter.html",
    "word-dash/Word Dash.html": "word-dash.html",
}
FOLDERS = ["game-kit", "textbook-db", "sentence-box", "vocab-intro", "memory-imposter", "word-dash"]
SKIP_DIRS = {"uploads", "__pycache__"}

def files():
    for name in RENAME:
        if "/" not in name:
            yield SRC / name
    for d in FOLDERS:
        for p in sorted((SRC / d).rglob("*")):
            if p.is_file() and not SKIP_DIRS & set(p.relative_to(SRC).parts) and not p.name.startswith("."):
                yield p

for p in files():
    rel = p.relative_to(SRC).as_posix()
    out = REPO / RENAME.get(rel, rel)
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(p, out)
    print(f"{rel} -> {out.relative_to(REPO)}")
