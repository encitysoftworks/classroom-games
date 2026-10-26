# Classroom Game Kit

Shared parts for Wyatt's English classroom games: pair games, team games, whole-class projector games and solo practice. Each game is still one HTML file, so the kit gets **copied into** each game rather than linked.

| File | What it is |
|---|---|
| `classroom-kit.js` | All shared code, on `window.Kit` |
| `classroom-kit.css` | Shared look: dark "game console" style, buttons, HUD, traps, teacher page, end screen |
| `starters/Picture Lock.html` | Pair information-gap starter (two Chromebooks, class code, traps, swap roles). Live: https://claude.ai/artifact/1ysuzRH3Dk7gRoJ9y9VLq7 |
| `starters/Word Party.html` | Whole-class + solo starter: projector Team Quiz, Bingo (caller + a card per student), Practice Quiz. Live: https://claude.ai/artifact/XFSCqtnPSjxCBsdgDHfLNd |
| `update-kit.py` | Copies the latest kit and textbook word bank into one or more game files |

## Starting a new game

1. Copy the starter closest to the new game's style (see below) to `/mnt/project-files/<New Game>.html`.
2. Keep the three kit blocks (`/*KIT:CSS*/`, `/*KIT:JS*/`, `<script id="kit-wordbank">`). Replace the GAME style and GAME script with the new game.
3. Run `python3 /mnt/project-files/game-kit/update-kit.py "/mnt/project-files/<New Game>.html"`. Add `--no-words` if the game doesn't use textbook words.
4. Publish it, paste its artifact link into `ARTIFACT_URL`, then republish so the teacher page's QR code and link point at the game.
5. Add it to the Classroom Games Hub.

## Which parts for which game style

| Style | Example | Start from | Main parts |
|---|---|---|---|
| Pair information gap (two Chromebooks) | Keypad, Maze, Picture Lock | Picture Lock | `codec` class or pair codes, `traps`, `soloPartner`, `result({swap:true})` |
| Whole class on the projector | Bingo caller, quiz show, "what's missing?" | Word Party | `keys`, `fullscreen`, `countdown`, `quiz`, `bingo` |
| Teams vs teams | Team quiz, relay, karuta | Word Party | `teams`, `countdown`, `result({nums})` (no stars) |
| One per student, synced by code | Bingo cards, find-someone-who sheets | Word Party (My Bingo Card) | `rng(code, game, studentNumber)`; the projector rebuilds any student's card to check it |
| Solo drill | Practice quiz, spelling, listening | Word Party (Practice) | `quiz.render`, `traps`, `timer` + `score` + stars |
| No textbook words | Shapes, numbers, clock games | either | run `update-kit.py --no-words` and skip `Kit.words` |

All styles share: the 日本語 switch, sound, the teacher page with class code + QR, the toast, and the end screen. The no-flashing rule and funny traps instead of penalties apply to every style.

Quiz question types (`Kit.quiz.TYPES`): picture → word, listen → picture, word → picture, Japanese → English, and spelling (pick the correct spelling). Types that need pictures switch off automatically for units with too few emoji.

## When the kit or word bank changes

Run `update-kit.py` on every game that uses the kit (`python3 update-kit.py starters/*.html "../Some Game.html"`), then republish each one. The word bank is the copy in `textbook-db/all-books.json`. When Wyatt fixes units from the PDFs, a single run carries the fixed words into every game.

## Project conventions the kit already follows

- English first. Japanese goes in `<span class="ja">`, shown only when the 日本語サポート switch is on. Use `Kit.bi(["English","日本語"])`.
- Wrong answers set off a funny trap (`Kit.traps`): a boxing glove, chicken, soot, water, a duck, a bear or a cat. Traps use movement and sound only and never flash. There is no game over.
- Score = time + mistakes (`Kit.score`): 1000 points, minus 100 per oops, minus 4 per second over par, never below 100. 850+ earns 3 stars and 600+ earns 2. Every finished game gets at least 1 star.
- The end screen (`Kit.result`) shows stars for time + mistakes games, team scores for team games, and **Swap roles!** when you pass `swap:true` (pair games).
- Solo practice uses the computer voice (`Kit.speech`, `Kit.soloPartner`), with a written fallback when the device has no voice.
- No internet sync between partners. Both screens build the same content from a short code.

## Codes: class code or pair codes

`Kit.codec({game, fields, seed})` turns settings into a short code and back. It has a checksum, so typos are rejected, and a game never loads another game's codes. It reads `#CODE` from the link through `codec.fromHash()`.

- **Class code** (`seed: 0`, like The Keypad Game): the whole class types one code. Each round picks a random page or card locally, so neighbouring pairs see different puzzles. Picture Lock's code is 5 characters.
- **Pair codes** (`seed: 262144`, like The Maze Game): each pair gets its own puzzle. Pass `pairs: {make(seed){return codec.encode(S,seed)}}` to `Kit.teacher` and it adds a "Make codes for N pairs" list with a Copy button.

Field order is permanent. Adding or reordering fields changes every code, so set generous sizes up front. The word bank's fields (`Kit.words.fields`) allow 8 books and 16 units.

## Word bank

`Kit.words.picker(mount, S, onChange)` shows Book and Unit buttons. Shift-click a second unit to mix a range of units. `Kit.words.pick(S)` returns `{words:[{en,ja,emoji}], phrases}`. Books are stored in the code by their position in `all-books.json`, so new books must go **at the end**.

The database is still a draft (every unit has `verified:false`). Games built on it pick up corrections when `update-kit.py` runs.

## Kit.* at a glance

`$ $$ esc bi store` · `rng hash32 hashStr ri shuffle pickN bag RND randomSeeds` · `codec link qr` · `sound.play/add speech.say/sayEach/hush` · `toggle setupToggles seg screens toast` · `timer fmtTime score STAR` · `traps({layer,target,area}).next(done)` · `codeEntry badges teacher result soloPartner` · `words` · `keys fullscreen countdown teams TEAMS quiz bingo`

The comments at the top of each section in `classroom-kit.js` give the details.
