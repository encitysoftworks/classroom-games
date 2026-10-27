# Classroom Games

Co-op English speaking games for Japanese elementary and junior high students, made by Wyatt (ALT, Miyazaki). Students play in pairs on two Chromebooks: one partner sees something the other can't, and they talk in English to solve it.

Every game is a single HTML file. Open it in a browser and it works. Nothing to install.

## Where to play

The **Claude links** on the hub are the main student links. They are known to work on school wifi.

If GitHub Pages is turned on, the same pages are also here (replace `encitysoftworks` if the account name changes):

| Page | GitHub Pages link |
|---|---|
| Hub (all games) | https://encitysoftworks.github.io/classroom-games/ |
| The Keypad Game (grades 3–4) | https://encitysoftworks.github.io/classroom-games/keypad.html |
| The Maze Game (grades 5–6) | https://encitysoftworks.github.io/classroom-games/maze.html |
| Picture Lock (kit demo game) | https://encitysoftworks.github.io/classroom-games/game-kit/starters/picture-lock.html |
| Word Party (kit starter game) | https://encitysoftworks.github.io/classroom-games/game-kit/starters/word-party.html |
| Textbook word bank | https://encitysoftworks.github.io/classroom-games/textbook-db/viewer/word-bank.html |
| Vocab Intro (teacher tool) | https://encitysoftworks.github.io/classroom-games/vocab-intro.html |
| Sentence Box | https://encitysoftworks.github.io/classroom-games/sentence-box/ (needs setup, see `sentence-box/Code.gs`) |

Note: the hub's **Edit page** button only works on the Claude link. The QR codes inside each game still point at the Claude links.

## What's in this repository

| Folder or file | What it is |
|---|---|
| `index.html` | The hub page that lists every game |
| `keypad.html`, `maze.html` | Finished games |
| `vocab-intro.html` | Teacher tool for introducing a unit's new words on the projector |
| `game-kit/` | Shared code and look for new games, plus starter games. See `game-kit/README.md` |
| `textbook-db/` | Vocabulary and phrases for each textbook unit (Let's Try, Junior Sunshine, Sunshine). Still a draft until checked against the textbooks |
| `sentence-box/` | A page where students send sentences anonymously to a Google Sheet |
| `tools/sync-from-project.py` | Copies the latest files from the Claude project into this repository |

## How updates work

The games are made in the Claude project, and that copy is the master. When something changes there, Claude runs `tools/sync-from-project.py` and saves the new versions here. Please don't edit files here directly, or the next sync will overwrite your changes.
