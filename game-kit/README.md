# Classroom Game Kit

Shared parts for Wyatt's English classroom games: pair games, team games, whole-class projector games and solo practice. Each game is still one HTML file, so the kit gets **copied into** each game rather than linked.

| File | What it is |
|---|---|
| `classroom-kit.js` | All shared code, on `window.Kit` |
| `classroom-kit.css` | Shared look: dark "game console" style, buttons, HUD, traps, teacher page, end screen |
| `starters/Picture Lock.html` | Pair information-gap starter (two Chromebooks, class code, traps, swap roles). Live: https://claude.ai/artifact/1ysuzRH3Dk7gRoJ9y9VLq7 |
| `starters/Word Party.html` | Whole-class + solo starter: projector Team Quiz, Bingo (caller + a card per student), Practice Quiz. Live: https://claude.ai/artifact/XFSCqtnPSjxCBsdgDHfLNd |
| `retro3d.js` | Optional retro 3D add-on (PSX/N64 look) on `window.Kit3D`, for 3D games |
| `starters/Word Island.html` | Retro 3D starter: walk a cute low-poly critter to the picture you hear. Live: https://claude.ai/artifact/RKRbpLmjb54JizK61SZ7NN |
| `../Word Island.html` | The full Word Island adventure (sea map, island stages, Critter Maker, save codes) built from that starter. Live: https://claude.ai/artifact/7schAnCRJjhEZxLvKqqZRe |
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
| Retro 3D | Explore, find, collect, mazes | Word Island | `Kit3D.stage`, `critter`, `sign`, `loop`, `move`, `groundPoint`, plus `Kit.traps` over the 3D view |
| No textbook words | Shapes, numbers, clock games | either | run `update-kit.py --no-words` and skip `Kit.words` |

All styles share: the 日本語 switch, sound, the teacher page with class code + QR, the toast, and the end screen. The no-flashing rule and funny traps instead of penalties apply to every style.

Quiz question types (`Kit.quiz.TYPES`): picture → word, listen → picture, word → picture, Japanese → English, and spelling (pick the correct spelling). Types that need pictures switch off automatically for units with too few emoji.

## Retro 3D (PSX / N64 look)

Wyatt's chosen style for 3D: low-poly and cute, light enough for school Chromebooks. A 3D game adds two script tags (see Word Island):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>/*KIT:3D START*/ /*KIT:3D END*/</script>
```

`update-kit.py` fills the 3D block from `retro3d.js`. What the add-on gives you:
- `Kit3D.stage({mount, height:240})` draws at about 240 pixels tall and scales up with crisp pixels. Models wobble slightly as their corners snap to the pixel grid, colors are dithered to 15-bit, and there is distance fog.
- `Kit3D.mat(color, {map})` gives any material the same look. Use `Kit3D.mesh(geometry, material)` for faceted low-poly shapes.
- `Kit3D.TEX.grass() / sand() / water() / wood() / stone() / checker()` are tiny pixel textures. Make your own with `Kit3D.tex(16, draw)`.
- `Kit3D.critter({kind})` or `Kit3D.critter({recipe})` builds a cute critter from parts, with idle bob, blinking, a walk waddle, `hop()`, `spin()` (dizzy), `cheer()` and `face(angle)`. Built in: cat, bunny, bear, frog, chick, shiba, panda, penguin, tanuki, dragon.
- A critter is one line of data, so adding one is easy: `Kit3D.CRITTERS.koala={name:["Koala","コアラ"], c:[7,5,6], ears:"mouse", mouth:"snout"}`. `c` is [main, belly, accent] as positions in `Kit3D.PALETTE`; the other keys are part names from `Kit3D.PARTS` (body, ears, eyes, cheeks, mouth, tail, back, head, pattern, hat). Only ever add to the END of `PALETTE` and the `PARTS` lists, because critter codes store positions.
- `Kit3D.critterFields` + `Kit3D.recipeToCode()` / `recipeFromCode()` turn a recipe into a short critter code with `Kit.codec`.
- `Kit3D.sign("🍎")` puts a pixel-art picture or word on a post. `Kit3D.tree()` and `Kit3D.rock()` are scenery.
- `Kit3D.loop(stage, fn)` runs at 30 fps and pauses when the tab is hidden. `Kit3D.move()` reads the arrow keys and WASD. `Kit3D.groundPoint()` supports click-to-walk. `Kit3D.follow()` is the follow camera.

Keep scenes small, with a few hundred low-poly shapes at most. No flashing lights or fast color changes.

## When the kit or word bank changes

Run `update-kit.py` on every game that uses the kit (`python3 update-kit.py starters/*.html "../Some Game.html"`). It also escapes any literal closing script tag in the kit code, which would otherwise break the page., then republish each one. The word bank is the copy in `textbook-db/all-books.json`. When Wyatt fixes units from the PDFs, a single run carries the fixed words into every game.

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

`$ $$ esc bi store` · `rng hash32 hashStr ri shuffle pickN bag RND randomSeeds` · `codec link qr` · `sound.play/add speech.say/sayEach/hush` · `toggle setupToggles seg screens toast` · `timer fmtTime score STAR` · `traps({layer,target,area}).next(done)` · `codeEntry badges teacher result soloPartner` · `words` · `keys fullscreen countdown teams TEAMS quiz bingo` · 3D add-on: `Kit3D.stage mat basic mesh facet tex TEX critter CRITTERS sign tree rock loop move groundPoint pick follow`

The comments at the top of each section in `classroom-kit.js` give the details.
