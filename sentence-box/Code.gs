/**
 * SENTENCE BOX
 * Anonymous example-sentence submissions from student tablets, with a
 * teacher/projector view. Runs free on Google Sheets + Apps Script.
 * =========================================================================
 *
 * ONE-TIME SETUP (about 15 minutes)
 *
 *  1. Sign in to a PERSONAL Gmail account (not a school account) and create
 *     a new Google Sheet. Name it something like "Sentence Box".
 *
 *  2. In the sheet, click Extensions > Apps Script. Delete everything in the
 *     editor, paste in this whole file, and click the save (disk) icon.
 *
 *  3. At the top of the editor, pick "setup" in the function menu (next to
 *     "Debug") and click Run. Google will ask for permission:
 *       Review permissions > your account > Advanced >
 *       Go to (project name) (unsafe) > Allow
 *     "Unsafe" only means Google hasn't reviewed a script you wrote yourself.
 *
 *  4. Go back to the sheet. You now have two tabs: Settings and Responses.
 *     CHANGE THE TEACHER PIN on the Settings tab to something only you know.
 *
 *  5. In Apps Script: Deploy > New deployment > gear icon > Web app
 *       Execute as:      Me
 *       Who has access:  Anyone      <- so students don't have to sign in
 *     Click Deploy and copy the Web app URL. That is the STUDENT link.
 *
 *  6. TEACHER / PROJECTOR link = the same URL with  ?view=teacher  on the end.
 *     The teacher page has a "QR" button that shows the student QR code.
 *
 *  USING "Sentence Box.html" INSTEAD (same Sheet, games-site look)
 *     Open Sentence Box.html in a text editor, paste the Web app URL from
 *     step 5 into API_URL near the top, and host the file (see that file).
 *
 * EACH LESSON
 *   Edit Prompt, Example, Japanese hint and Grammar point on the Settings tab.
 *   Class names can be changed on the teacher page (Classes button) or in the
 *   Classes row of the Settings tab.
 *   Every sentence is saved on the Responses tab with date, class and
 *   grammar point.
 *
 * IF YOU EVER CHANGE THIS CODE
 *   Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
 *   (Doing it this way keeps the same link, so your QR code keeps working.)
 * =========================================================================
 */

var TZ = 'Asia/Tokyo';
var SETTINGS = 'Settings';
var RESPONSES = 'Responses';
var MAX_LEN = 300;
var MAX_ITEMS = 500;
var MAX_CLASSES = 20;
var MAX_CLASS_LEN = 20;
var HEADERS = ['Timestamp', 'Date', 'Class', 'Grammar point', 'Prompt', 'Sentence', 'Status', 'ID'];
var DEFAULTS = [
  ['Prompt', 'Write a sentence using "have to".'],
  ['Example', 'I have to do my homework.'],
  ['Japanese hint', '「〜しなければならない」の文を作ろう！'],
  ['Grammar point', 'have to'],
  ['Classes', '1-A, 2-A, 3-A'],
  ['Accepting answers', 'YES'],
  ['Require approval', 'YES'],
  ['Teacher PIN', '1234']
];

/* ---------------------------------------------------------------- pages */

function doGet(e) {
  var view = (e && e.parameter && e.parameter.view) || '';
  var teacher = view === 'teacher';
  return HtmlService.createHtmlOutput(teacher ? teacherHtml_() : studentHtml_())
    .setTitle(teacher ? 'Sentence Box - Teacher' : 'Sentence Box')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ------------------------------------------- API for Sentence Box.html */
// The HTML file sends POST requests with a JSON body {fn, args} and gets JSON back.
var API = {
  getStudentConfig: getStudentConfig,
  submitSentence: submitSentence,
  getTeacherData: getTeacherData,
  setStatus: setStatus,
  setAccepting: setAccepting,
  setClasses: setClasses
};

function doPost(e) {
  var req = {};
  try { req = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) {}
  var fn = API.hasOwnProperty(req.fn) ? API[req.fn] : null;
  var out;
  if (!fn) out = { ok: false, error: 'fn' };
  else {
    try { out = fn.apply(null, Array.isArray(req.args) ? req.args.slice(0, 4) : []); }
    catch (err) { out = { ok: false, error: 'server' }; }
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------------------------------------------------------- setup */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open Apps Script from the Google Sheet (Extensions > Apps Script) and run setup again.');
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone(TZ);
  ensureSheets_(ss);

  // Add any settings rows that are missing (safe to run again).
  var s = ss.getSheetByName(SETTINGS);
  var keys = s.getRange(1, 1, Math.max(s.getLastRow(), 1), 1).getValues()
    .map(function (r) { return String(r[0]).trim().toLowerCase(); });
  DEFAULTS.forEach(function (d) {
    if (keys.indexOf(d[0].toLowerCase()) < 0) s.appendRow(d);
  });

  // Remove the empty default tab if there is one.
  ['Sheet1', 'シート1'].forEach(function (name) {
    var d = ss.getSheetByName(name);
    if (d && d.getLastRow() === 0 && ss.getSheets().length > 2) ss.deleteSheet(d);
  });
}

function book_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets_(ss);
  return ss;
}

function ensureSheets_(ss) {
  var s = ss.getSheetByName(SETTINGS);
  if (!s) {
    s = ss.insertSheet(SETTINGS);
    s.getRange(1, 1, 1, 2).setValues([['Setting', 'Value']]).setFontWeight('bold');
    s.getRange(2, 1, DEFAULTS.length, 2).setValues(DEFAULTS);
    s.setColumnWidth(1, 170);
    s.setColumnWidth(2, 460);
    s.setFrozenRows(1);
  }
  var r = ss.getSheetByName(RESPONSES);
  if (!r) {
    r = ss.insertSheet(RESPONSES);
    r.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    r.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    r.getRange('B:H').setNumberFormat('@');   // keep everything else as plain text
    r.setColumnWidth(1, 150);
    r.setColumnWidth(5, 220);
    r.setColumnWidth(6, 420);
    r.setFrozenRows(1);
  }
}

/* ------------------------------------------------------------- helpers */

function readSettings_(ss) {
  var vals = ss.getSheetByName(SETTINGS).getDataRange().getValues();
  var map = {};
  for (var i = 1; i < vals.length; i++) {
    var k = String(vals[i][0]).trim().toLowerCase();
    if (k) map[k] = String(vals[i][1] === null ? '' : vals[i][1]).trim();
  }
  return map;
}

function yes_(v) {
  return /^(yes|y|true|on|1|はい)$/i.test(String(v || '').trim());
}

function classes_(s) {
  return String(s['classes'] || '').split(/[,、，]/)
    .map(function (c) { return c.trim(); })
    .filter(function (c) { return c; });
}

function pinOk_(s, pin) {
  var real = String(s['teacher pin'] || '').trim();
  return real !== '' && String(pin || '').trim() === real;
}

function setSetting_(ss, key, value) {
  var sh = ss.getSheetByName(SETTINGS);
  var vals = sh.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toLowerCase() === key.toLowerCase()) {
      sh.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sh.appendRow([key, value]);
}

function publicSettings_(s) {
  return {
    prompt: s['prompt'] || '',
    example: s['example'] || '',
    hint: s['japanese hint'] || '',
    grammar: s['grammar point'] || '',
    classes: classes_(s),
    open: yes_(s['accepting answers']),
    requireApproval: yes_(s['require approval'])
  };
}

/* ------------------------------------------------ called by student page */

function getStudentConfig() {
  var s = publicSettings_(readSettings_(book_()));
  delete s.requireApproval;
  return s;
}

function submitSentence(cls, sentence) {
  var ss = book_();
  var s = readSettings_(ss);
  if (!yes_(s['accepting answers'])) return { ok: false, error: 'closed' };

  cls = String(cls || '').trim();
  if (classes_(s).indexOf(cls) < 0) return { ok: false, error: 'class' };

  sentence = String(sentence || '').replace(/\s+/g, ' ').trim();
  if (!sentence) return { ok: false, error: 'empty' };
  if (sentence.length > MAX_LEN) sentence = sentence.slice(0, MAX_LEN);
  if (/^[=+\-@]/.test(sentence)) sentence = ' ' + sentence;   // never let a sentence become a formula

  var now = new Date();
  var row = [
    now,
    Utilities.formatDate(now, TZ, 'yyyy-MM-dd'),
    cls,
    s['grammar point'] || '',
    s['prompt'] || '',
    sentence,
    yes_(s['require approval']) ? 'pending' : 'approved',
    Utilities.getUuid().slice(0, 8)
  ];

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, error: 'busy' };
  try {
    ss.getSheetByName(RESPONSES).appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

/* ------------------------------------------------ called by teacher page */

function getTeacherData(pin, cls, todayOnly) {
  var ss = book_();
  var s = readSettings_(ss);
  if (!pinOk_(s, pin)) return { ok: false, error: 'pin' };

  var sh = ss.getSheetByName(RESPONSES);
  var last = sh.getLastRow();
  var items = [];
  if (last > 1) {
    var vals = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
    var today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
    for (var i = vals.length - 1; i >= 0 && items.length < MAX_ITEMS; i--) {
      var r = vals[i];
      var text = String(r[5] === null ? '' : r[5]).trim();
      if (!text) continue;
      var ts = r[0];
      var isDate = ts instanceof Date || Object.prototype.toString.call(ts) === '[object Date]';
      var day = isDate ? Utilities.formatDate(ts, TZ, 'yyyy-MM-dd') : String(r[1]);
      if (todayOnly && day !== today) continue;
      if (cls && cls !== 'all' && String(r[2]).trim() !== cls) continue;
      var st = String(r[6] || '').trim().toLowerCase();
      if (st !== 'pending' && st !== 'hidden') st = 'approved';
      items.push({
        id: String(r[7] || ''),
        cls: String(r[2]),
        text: text,
        status: st,
        time: isDate ? Utilities.formatDate(ts, TZ, 'HH:mm') : '',
        day: day
      });
    }
  }
  return {
    ok: true,
    settings: publicSettings_(s),
    items: items,
    url: ScriptApp.getService().getUrl()
  };
}

function setStatus(pin, ids, status) {
  if (['approved', 'hidden', 'pending'].indexOf(status) < 0) return { ok: false, error: 'status' };
  var ss = book_();
  if (!pinOk_(readSettings_(ss), pin)) return { ok: false, error: 'pin' };
  if (!Array.isArray(ids)) ids = [ids];
  var want = {};
  ids.forEach(function (id) { if (id) want[String(id)] = true; });

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, error: 'busy' };
  try {
    var sh = ss.getSheetByName(RESPONSES);
    var last = sh.getLastRow();
    if (last < 2) return { ok: true, changed: 0 };
    var vals = sh.getRange(2, 7, last - 1, 2).getValues();
    var n = 0;
    for (var i = 0; i < vals.length; i++) {
      if (vals[i][1] && want[String(vals[i][1])]) { vals[i][0] = status; n++; }
    }
    if (n) sh.getRange(2, 7, last - 1, 1).setValues(vals.map(function (v) { return [v[0]]; }));
    return { ok: true, changed: n };
  } finally {
    lock.releaseLock();
  }
}

function setClasses(pin, names) {
  var ss = book_();
  if (!pinOk_(readSettings_(ss), pin)) return { ok: false, error: 'pin' };
  if (!Array.isArray(names)) return { ok: false, error: 'classes' };
  var clean = [];
  names.forEach(function (n) {
    n = String(n || '').replace(/[,、，]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_CLASS_LEN);
    if (/^[=+\-@]/.test(n)) n = n.slice(1).trim();   // never let a class name become a formula
    if (n && n.toLowerCase() !== 'all' && clean.indexOf(n) < 0) clean.push(n);
  });
  if (!clean.length) return { ok: false, error: 'empty' };
  setSetting_(ss, 'Classes', clean.slice(0, MAX_CLASSES).join(', '));
  return { ok: true, classes: clean.slice(0, MAX_CLASSES) };
}

function setAccepting(pin, open) {
  var ss = book_();
  if (!pinOk_(readSettings_(ss), pin)) return { ok: false, error: 'pin' };
  setSetting_(ss, 'Accepting answers', open ? 'YES' : 'NO');
  return { ok: true };
}

/* ======================================================== STUDENT PAGE */

function studentHtml_() {
  return String.raw`<!DOCTYPE html>
<html><head><base target="_top"><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bungee&family=M+PLUS+Rounded+1c:wght@500;700;800&display=swap" rel="stylesheet">
<style>
/* Same dark look as the Classroom Games site. --c is Sentence Box's color on the hub. */
:root{--bg:#14161d;--panel:#1e212b;--panel2:#272b37;--edge:#3a3f50;--text:#f2eee5;--muted:#aeacba;--dim:#7d7b8c;--c:#7cc4ff;--accent:#8ad1c2;--ink:#1b1a17;--warn:#ff8f6b;--ok:#7fd88f;
  --f-display:"Bungee","Arial Black",Impact,sans-serif;--f-body:"M PLUS Rounded 1c","Hiragino Maru Gothic ProN","Hiragino Sans","Noto Sans JP",system-ui,sans-serif;color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text);font-family:var(--f-body);-webkit-text-size-adjust:100%}
body{background-image:radial-gradient(1000px 480px at 50% -10%,#262a3a 0%,rgba(20,22,29,0) 65%);min-height:100vh}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.wrap{max-width:640px;margin:0 auto;padding:18px 16px 48px}
.brand{font-family:var(--f-display);font-weight:400;color:var(--c);font-size:22px;margin:2px 0 14px;letter-spacing:.02em}
.prompt-card{background:var(--panel);border:2px solid var(--edge);border-radius:12px;padding:18px;box-shadow:0 4px 0 #07080b;border-top:8px solid var(--c)}
.chip{display:inline-block;background:var(--c);color:var(--ink);font-weight:800;font-size:14px;padding:4px 12px;border-radius:999px;margin-bottom:10px}
h1{font-size:25px;line-height:1.35;margin:0 0 10px}
.example{margin:0;font-size:19px;color:var(--muted)}
.example b{color:var(--text)}
.hint{margin:10px 0 0;font-size:15px;color:var(--muted)}
.label{font-weight:800;margin:24px 0 8px;font-size:15px;color:var(--muted)}
.seg{display:flex;gap:10px;flex-wrap:wrap}
.seg button{flex:1 1 0;min-width:84px;font:inherit;font-weight:800;font-size:21px;padding:13px 8px;border-radius:10px;border:2px solid var(--edge);background:var(--panel2);color:var(--text);cursor:pointer;box-shadow:0 3px 0 #07080b}
.seg button:hover{border-color:var(--dim)}
.seg button.on{background:var(--accent);color:var(--ink);border-color:var(--accent)}
textarea{width:100%;font:inherit;font-size:22px;line-height:1.4;padding:14px;border-radius:10px;border:2px solid var(--edge);background:var(--panel);color:var(--text);resize:vertical;min-height:124px}
textarea::placeholder{color:var(--dim)}
textarea:focus{outline:none;border-color:var(--c)}
.count{text-align:right;color:var(--dim);font-size:13px;margin-top:4px}
.primary{display:block;width:100%;margin-top:14px;font:inherit;font-weight:800;font-size:22px;padding:16px;border:0;border-radius:10px;background:var(--c);color:var(--ink);box-shadow:0 4px 0 #07080b;cursor:pointer}
.primary:active{transform:translateY(2px);box-shadow:0 2px 0 #07080b}
.primary:disabled{opacity:.6}
.err{color:var(--warn);font-weight:800;min-height:1.4em;margin:12px 0 0}
.state{text-align:center;padding:56px 8px}
.state h2{font-family:var(--f-display);font-weight:400;font-size:28px;margin:14px 0 6px}
.state p{color:var(--muted);font-size:17px;line-height:1.6;margin:0 0 18px}
.big{font-size:60px}
.check{width:100px;height:100px;border-radius:50%;background:var(--ok);color:var(--ink);font-size:58px;line-height:100px;margin:0 auto;font-weight:800}
.pop{animation:pop .45s ease-out}
@keyframes pop{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.pop{animation:none}}
.ghost{font:inherit;font-weight:800;font-size:18px;padding:12px 24px;border-radius:10px;border:2px solid var(--edge);background:var(--panel2);color:var(--text);cursor:pointer;box-shadow:0 3px 0 #07080b}
.hidden{display:none !important}
</style></head>
<body>
<main class="wrap">
  <div class="brand">Sentence Box</div>

  <section id="loading" class="state"><p id="loadMsg">Loading… 読み込み中…</p><button id="reload" class="ghost hidden">Try again / もう一度</button></section>

  <section id="closed" class="state hidden">
    <div class="big">⏸</div>
    <h2>Not open right now</h2>
    <p>Wait for your teacher.<br>先生の合図を待ってね。</p>
    <button id="checkAgain" class="ghost">Check again / 更新</button>
  </section>

  <section id="form" class="hidden">
    <div class="prompt-card">
      <span id="gp" class="chip"></span>
      <h1 id="prompt"></h1>
      <p id="example" class="example"></p>
      <p id="hint" class="hint"></p>
    </div>
    <div class="label">Your class / クラス</div>
    <div id="classes" class="seg"></div>
    <div class="label">Your sentence / 英文</div>
    <textarea id="text" rows="3" maxlength="300" placeholder="Write your sentence here."
      autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false"></textarea>
    <div id="count" class="count">0 / 300</div>
    <button id="submit" class="primary">Send / 送信 ▶</button>
    <p id="err" class="err"></p>
  </section>

  <section id="done" class="state hidden">
    <div id="check" class="check">✓</div>
    <h2>Sent!</h2>
    <p>送信しました！</p>
    <button id="again" class="primary">Write another / もう一文</button>
  </section>
</main>

<script>
var cls = null, busy = false;
function $(id){ return document.getElementById(id); }
function show(id){ ['loading','closed','form','done'].forEach(function(s){ $(s).classList.toggle('hidden', s !== id); }); }
function store(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

function load(){
  show('loading');
  $('loadMsg').textContent = 'Loading… 読み込み中…';
  $('reload').classList.add('hidden');
  callServer('getStudentConfig', [], 2, render, function(){
    $('loadMsg').textContent = 'Could not connect. 接続できませんでした。';
    $('reload').classList.remove('hidden');
  });
}

/* Calls the server and quietly retries a couple of times if it is busy. */
function callServer(fn, args, retries, ok, fail){
  var runner = google.script.run.withSuccessHandler(function(r){
    if (r && r.error === 'busy' && retries > 0) { setTimeout(function(){ callServer(fn, args, retries - 1, ok, fail); }, 600 + Math.random() * 1200); return; }
    ok(r);
  }).withFailureHandler(function(e){
    if (retries > 0) { setTimeout(function(){ callServer(fn, args, retries - 1, ok, fail); }, 600 + Math.random() * 1200); return; }
    fail(e);
  });
  runner[fn].apply(runner, args);
}

function render(c){
  if (!c || !c.open) { show('closed'); return; }
  $('gp').textContent = c.grammar;
  $('gp').classList.toggle('hidden', !c.grammar);
  $('prompt').textContent = c.prompt;
  var ex = $('example');
  ex.textContent = '';
  if (c.example) { var b = document.createElement('b'); b.textContent = 'Ex: '; ex.appendChild(b); ex.appendChild(document.createTextNode(c.example)); }
  ex.classList.toggle('hidden', !c.example);
  $('hint').textContent = c.hint;
  $('hint').classList.toggle('hidden', !c.hint);

  var saved = store('sb_class');
  if (c.classes.indexOf(cls) < 0) cls = c.classes.indexOf(saved) >= 0 ? saved : null;
  var box = $('classes');
  box.textContent = '';
  c.classes.forEach(function(name){
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = name;
    if (name === cls) b.className = 'on';
    b.onclick = function(){
      cls = name; store('sb_class', name);
      Array.prototype.forEach.call(box.children, function(x){ x.classList.toggle('on', x === b); });
      $('err').textContent = '';
    };
    box.appendChild(b);
  });
  $('err').textContent = '';
  show('form');
}

function setBusy(on){
  busy = on;
  $('submit').disabled = on;
  $('submit').textContent = on ? 'Sending… 送信中…' : 'Send / 送信 ▶';
}

function submit(){
  if (busy) return;
  var t = $('text').value.trim();
  if (!cls) { $('err').textContent = 'Choose your class. クラスを選んでね。'; return; }
  if (!t) { $('err').textContent = 'Write a sentence first. 英文を書いてね。'; $('text').focus(); return; }
  $('err').textContent = '';
  setBusy(true);
  callServer('submitSentence', [cls, t], 3, function(r){
    setBusy(false);
    if (r && r.ok) {
      $('text').value = ''; updateCount();
      var ck = $('check'); ck.classList.remove('pop'); void ck.offsetWidth; ck.classList.add('pop');
      show('done');
    } else if (r && r.error === 'closed') {
      show('closed');
    } else if (r && r.error === 'class') {
      load();
    } else {
      $('err').textContent = 'Could not send. Try again. もう一度送ってね。';
    }
  }, function(){
    setBusy(false);
    $('err').textContent = 'Could not send. Try again. もう一度送ってね。';
  });
}

function updateCount(){ $('count').textContent = $('text').value.length + ' / 300'; }

$('submit').onclick = submit;
$('text').oninput = updateCount;
$('again').onclick = load;
$('checkAgain').onclick = load;
$('reload').onclick = load;
load();
</script>
</body></html>`;
}

/* ======================================================== TEACHER PAGE */

function teacherHtml_() {
  return String.raw`<!DOCTYPE html>
<html><head><base target="_top"><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bungee&family=M+PLUS+Rounded+1c:wght@500;700;800&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<style>
/* Same dark look as the Classroom Games site. Sentence cards stay light so they read well on a projector. */
:root{--bg:#14161d;--panel:#1e212b;--panel2:#272b37;--edge:#3a3f50;--text:#f2eee5;--muted:#aeacba;--dim:#7d7b8c;--c:#7cc4ff;--accent:#8ad1c2;--ink:#1b1a17;--ok:#7fd88f;--bad:#ff8f6b;--fs:34px;
  --f-display:"Bungee","Arial Black",Impact,sans-serif;--f-body:"M PLUS Rounded 1c","Hiragino Maru Gothic ProN","Hiragino Sans","Noto Sans JP",system-ui,sans-serif;color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text);font-family:var(--f-body)}
button{font:inherit;cursor:pointer}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.hidden{display:none !important}
.gate{max-width:360px;margin:14vh auto 0;text-align:center;padding:0 16px}
.gate h1{font-family:var(--f-display);font-weight:400;color:var(--c);margin:0 0 6px;font-size:34px}
.gate p{color:var(--muted);margin:0 0 16px}
.gate input{font:inherit;font-size:28px;text-align:center;letter-spacing:.3em;width:100%;padding:12px;border-radius:10px;border:2px solid var(--edge);background:var(--panel);color:var(--text)}
.gate .go{margin-top:12px;width:100%;font-weight:800;font-size:20px;padding:14px;border:0;border-radius:10px;background:var(--c);color:var(--ink);box-shadow:0 4px 0 #07080b}
.err{color:var(--bad);font-weight:800;min-height:1.4em}
.bar{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:2px dashed var(--edge);padding:10px 16px;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:space-between}
.now{display:flex;align-items:center;gap:10px;min-width:0;flex:1 1 300px}
.chip{background:var(--c);color:var(--ink);font-weight:800;font-size:14px;padding:4px 12px;border-radius:999px;white-space:nowrap}
#prompt{font-weight:800;font-size:20px;line-height:1.3}
.controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.seg{display:flex;border:2px solid var(--edge);border-radius:10px;overflow:hidden;background:var(--panel2)}
.seg button{font-weight:800;border:0;background:var(--panel2);padding:8px 12px;color:var(--text)}
.seg button+button{border-left:2px solid var(--edge)}
.seg button.on{background:var(--accent);color:var(--ink)}
.btn{font-weight:800;border:2px solid var(--edge);background:var(--panel2);border-radius:8px;padding:8px 12px;color:var(--text);box-shadow:0 3px 0 #07080b}
.btn:hover{border-color:var(--dim)}
.btn.open{background:var(--ok);border-color:var(--ok);color:var(--ink)}
.btn.closed{color:var(--bad);border-color:var(--bad)}
.btn.ok{background:var(--ok);border-color:var(--ok);color:var(--ink)}
.btn.primary{background:var(--c);border-color:var(--c);color:var(--ink)}
.tog{display:flex;align-items:center;gap:6px;font-weight:800;font-size:14px;color:var(--muted)}
.sub{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 16px 0}
.tabs{display:flex;gap:6px}
.tabs button{font-weight:800;border:2px solid var(--edge);background:var(--panel2);border-radius:8px;padding:8px 14px;color:var(--text)}
.tabs button.on{background:var(--accent);color:var(--ink);border-color:var(--accent)}
.badge{background:var(--bad);color:var(--ink);border-radius:999px;padding:1px 8px;font-size:14px;margin-left:4px}
.right{display:flex;gap:8px;align-items:center}
.conn{font-size:13px;color:var(--muted);font-weight:800}
.conn::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--ok);margin-right:6px;vertical-align:1px}
.conn.off::before{background:var(--bad)}
.wall{padding:18px 16px 48px;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,calc(var(--fs) * 11)),1fr));gap:16px;align-items:start}
.card{position:relative;border-radius:12px;padding:18px 40px 16px 20px;color:var(--ink);box-shadow:0 4px 0 #07080b}
.card .text{font-size:var(--fs);line-height:1.3;font-weight:800;margin:0;word-break:break-word}
.t0{background:#FFE3CC}.t1{background:#D6EAFB}.t2{background:#DDF1D8}.t3{background:#F7DDEB}
.tag{display:inline-block;margin-top:8px;font-size:14px;font-weight:800;color:#5d574f}
.x{position:absolute;top:6px;right:8px;border:0;background:transparent;font-size:24px;line-height:1;color:var(--ink);opacity:.3;padding:4px}
.x:hover{opacity:1;color:#B3261E}
.pop{animation:pop .5s ease-out}
@keyframes pop{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.pop{animation:none}}
.empty{grid-column:1/-1;text-align:center;color:var(--muted);font-size:24px;font-weight:800;padding:70px 0}
.empty small{display:block;font-size:16px;margin-top:8px}
#review{padding:16px 16px 48px;max-width:900px}
.rhead{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.rhead h2{margin:0;font-size:20px}
.tip{color:var(--muted);font-size:14px;margin:6px 0 14px}
.row{display:flex;gap:10px;align-items:center;background:var(--panel);border:2px solid var(--edge);border-radius:10px;padding:12px 14px;margin-bottom:10px}
.row .rt{flex:1;font-size:20px;font-weight:800;word-break:break-word;min-width:0}
.meta{display:block;color:var(--muted);font-size:13px;font-weight:500;margin-top:2px}
details{margin-top:18px}
summary{font-weight:800;color:var(--muted);cursor:pointer}
.none{color:var(--muted);padding:12px 0}
.overlay{position:fixed;inset:0;background:rgba(8,9,12,.93);display:flex;align-items:center;justify-content:center;z-index:20;padding:16px}
.qrbox{background:var(--panel);border:2px solid var(--edge);border-radius:14px;padding:28px;text-align:center;max-width:100%}
#qrcode{display:inline-block;background:#fff;border-radius:8px;padding:10px;line-height:0}
#qrcode img,#qrcode canvas{width:min(62vh,80vw) !important;height:auto !important;max-width:520px}
.qrbox h2{font-family:var(--f-display);font-weight:400;margin:16px 0 4px;font-size:28px}
.qrbox p{margin:4px 0;color:var(--muted);word-break:break-all;font-size:13px}
.panel{background:var(--panel);border:2px solid var(--edge);border-radius:14px;padding:22px;width:min(440px,100%);max-height:90vh;overflow:auto}
.panel h2{font-family:var(--f-display);font-weight:400;margin:0 0 4px;font-size:24px}
.panel .tip{margin:0 0 14px}
.crow{display:flex;gap:8px;margin-bottom:8px}
.crow input{flex:1;min-width:0;font:inherit;font-size:18px;font-weight:800;padding:8px 10px;border-radius:8px;border:2px solid var(--edge);background:var(--bg);color:var(--text)}
.crow input:focus{outline:none;border-color:var(--c)}
.pacts{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px}
</style></head>
<body>

<section id="gate" class="gate">
  <h1>Sentence Box</h1>
  <p>Teacher PIN</p>
  <input id="pin" type="password" inputmode="numeric" autocomplete="off">
  <button id="enter" class="go">Enter</button>
  <p id="gateErr" class="err"></p>
</section>

<div id="app" class="hidden">
  <header class="bar">
    <div class="now"><span id="gp" class="chip"></span><span id="prompt"></span></div>
    <div class="controls">
      <div id="classes" class="seg"></div>
      <label class="tog"><input type="checkbox" id="todayOnly" checked> Today only</label>
      <button id="acceptBtn" class="btn"></button>
      <button id="classesBtn" class="btn" title="Change class names">Classes ✎</button>
      <button id="qrBtn" class="btn">QR</button>
    </div>
  </header>

  <div class="sub">
    <div class="tabs">
      <button data-tab="display" class="on">Display <span id="nShown"></span></button>
      <button data-tab="review">Review <span id="nPending" class="badge hidden"></span></button>
    </div>
    <div class="right">
      <span id="conn" class="conn">Live</span>
      <button id="smaller" class="btn" title="Smaller text">A−</button>
      <button id="bigger" class="btn" title="Bigger text">A+</button>
    </div>
  </div>

  <section id="display" class="wall"></section>

  <section id="review" class="hidden">
    <div class="rhead">
      <h2>Waiting for approval</h2>
      <button id="approveAll" class="btn ok">Approve all</button>
    </div>
    <p class="tip">Tip: open this page on your phone to check sentences privately while the projector stays on Display.</p>
    <div id="pendingList"></div>
    <details><summary>Hidden (<span id="nHidden">0</span>)</summary><div id="hiddenList"></div></details>
  </section>

  <div id="qr" class="overlay hidden" title="Click to close">
    <div class="qrbox">
      <div id="qrcode"></div>
      <h2>Scan to send your sentence</h2>
      <p>QRコードを読み取ってね</p>
      <p id="qrUrl"></p>
    </div>
  </div>
</div>

<div id="classEdit" class="overlay hidden">
  <div class="panel" role="dialog" aria-labelledby="ceTitle">
    <h2 id="ceTitle">Class names</h2>
    <p class="tip">These are the buttons students pick from. Old sentences keep the class name they were sent with.</p>
    <div id="ceRows"></div>
    <button id="ceAdd" class="btn" type="button">+ Add class</button>
    <p id="ceErr" class="err"></p>
    <div class="pacts">
      <button id="ceCancel" class="btn" type="button">Cancel</button>
      <button id="ceSave" class="btn primary" type="button">Save</button>
    </div>
  </div>
</div>

<script>
var PIN = null, cls = 'all', todayOnly = true, tab = 'display', data = null;
var inflight = false, seen = {}, firstPaint = true, lastWallKey = '', classKey = '', qrDrawn = false;
var fs = 34;

function $(id){ return document.getElementById(id); }
function sess(k, v){ try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
function local(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
function el(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
function tint(id){ var n = 0; for (var i = 0; i < id.length; i++) n += id.charCodeAt(i); return 't' + (n % 4); }

/* ---------- PIN ---------- */
function tryPin(){
  PIN = $('pin').value.trim();
  if (!PIN) return;
  $('gateErr').textContent = 'Checking…';
  fetchData(true);
}
function lockOut(msg){
  PIN = null; sess('sb_pin', '');
  $('app').classList.add('hidden'); $('gate').classList.remove('hidden');
  $('gateErr').textContent = msg;
}

/* ---------- data ---------- */
function fetchData(fromGate){
  if (inflight || !PIN) return;
  inflight = true;
  google.script.run.withSuccessHandler(function(r){
    inflight = false;
    if (!r || !r.ok) {
      if (r && r.error === 'pin') lockOut('Wrong PIN. Check the Settings tab.');
      return;
    }
    if (fromGate) { sess('sb_pin', PIN); $('gate').classList.add('hidden'); $('app').classList.remove('hidden'); }
    data = r;
    setConn(true);
    render();
  }).withFailureHandler(function(){
    inflight = false;
    setConn(false);
    if (fromGate) $('gateErr').textContent = 'Could not connect. Try again.';
  }).getTeacherData(PIN, cls, todayOnly);
}
function setConn(ok){ var c = $('conn'); c.classList.toggle('off', !ok); c.textContent = ok ? 'Live' : 'Reconnecting…'; }

function act(ids, status){
  if (!ids.length) return;
  var want = {}; ids.forEach(function(i){ want[i] = true; });
  data.items.forEach(function(it){ if (want[it.id]) it.status = status; });
  render();
  google.script.run.withSuccessHandler(function(){ fetchData(false); })
    .withFailureHandler(function(){ setConn(false); fetchData(false); })
    .setStatus(PIN, ids, status);
}

/* ---------- render ---------- */
function render(){
  var s = data.settings;
  $('gp').textContent = s.grammar; $('gp').classList.toggle('hidden', !s.grammar);
  $('prompt').textContent = s.prompt;

  var ab = $('acceptBtn');
  ab.textContent = s.open ? 'Open ●' : 'Closed';
  ab.className = 'btn ' + (s.open ? 'open' : 'closed');
  ab.title = s.open ? 'Students can send. Click to close.' : 'Students cannot send. Click to open.';

  var ck = s.classes.join('|');
  if (ck !== classKey) {
    classKey = ck;
    if (cls !== 'all' && s.classes.indexOf(cls) < 0) cls = 'all';
    var box = $('classes'); box.textContent = '';
    ['all'].concat(s.classes).forEach(function(name){
      var b = el('button', name === cls ? 'on' : '', name === 'all' ? 'All' : name);
      b.onclick = function(){
        cls = name; lastWallKey = ''; firstPaint = true;
        Array.prototype.forEach.call(box.children, function(x){ x.classList.toggle('on', x === b); });
        fetchData(false);
      };
      box.appendChild(b);
    });
  }

  var shown = [], pending = [], hidden = [];
  data.items.forEach(function(it){ (it.status === 'pending' ? pending : it.status === 'hidden' ? hidden : shown).push(it); });

  $('nShown').textContent = shown.length ? '(' + shown.length + ')' : '';
  $('nPending').textContent = pending.length;
  $('nPending').classList.toggle('hidden', !pending.length);
  $('nHidden').textContent = hidden.length;

  renderWall(shown, pending.length, s);
  renderList($('pendingList'), pending, 'pending');
  renderList($('hiddenList'), hidden, 'hidden');
  $('approveAll').classList.toggle('hidden', !pending.length);
  firstPaint = false;
}

function renderWall(shown, nPending, s){
  var key = cls + '|' + fs + '|' + shown.map(function(i){ return i.id; }).join(',');
  if (key === lastWallKey) return;
  lastWallKey = key;
  var wall = $('display'); wall.textContent = '';
  if (!shown.length) {
    var e = el('div', 'empty', s.open ? 'Waiting for sentences…' : 'Submissions are closed.');
    if (nPending) e.appendChild(el('small', '', nPending + ' waiting in Review'));
    wall.appendChild(e);
    return;
  }
  shown.forEach(function(it){
    var c = el('div', 'card ' + tint(it.id));
    if (!firstPaint && !seen[it.id]) c.classList.add('pop');
    seen[it.id] = true;
    c.appendChild(el('p', 'text', it.text));
    if (cls === 'all') c.appendChild(el('span', 'tag', it.cls));
    var x = el('button', 'x', '×'); x.title = 'Hide from display';
    x.onclick = function(){ act([it.id], 'hidden'); };
    c.appendChild(x);
    wall.appendChild(c);
  });
}

function renderList(box, items, kind){
  box.textContent = '';
  if (!items.length) { box.appendChild(el('div', 'none', kind === 'pending' ? 'Nothing waiting.' : 'Nothing hidden.')); return; }
  items.forEach(function(it){
    var r = el('div', 'row');
    var t = el('div', 'rt', it.text);
    t.appendChild(el('span', 'meta', it.cls + (it.time ? ' · ' + it.time : '') + (todayOnly ? '' : ' · ' + it.day)));
    r.appendChild(t);
    if (kind === 'pending') {
      var ok = el('button', 'btn ok', '✓ Show'); ok.onclick = function(){ act([it.id], 'approved'); };
      var no = el('button', 'btn', 'Hide'); no.onclick = function(){ act([it.id], 'hidden'); };
      r.appendChild(ok); r.appendChild(no);
    } else {
      var back = el('button', 'btn', 'Restore'); back.onclick = function(){ act([it.id], 'approved'); };
      r.appendChild(back);
    }
    box.appendChild(r);
  });
}

/* ---------- controls ---------- */
function setTab(t){
  tab = t;
  Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function(b){ b.classList.toggle('on', b.getAttribute('data-tab') === t); });
  $('display').classList.toggle('hidden', t !== 'display');
  $('review').classList.toggle('hidden', t !== 'review');
}
function setFs(v){
  fs = Math.max(18, Math.min(80, v));
  document.documentElement.style.setProperty('--fs', fs + 'px');
  local('sb_fs', String(fs));
  if (data) { lastWallKey = ''; render(); }
}

$('enter').onclick = tryPin;
$('pin').onkeydown = function(e){ if (e.key === 'Enter') tryPin(); };
Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function(b){ b.onclick = function(){ setTab(b.getAttribute('data-tab')); }; });
$('todayOnly').onchange = function(){ todayOnly = this.checked; lastWallKey = ''; firstPaint = true; fetchData(false); };
$('smaller').onclick = function(){ setFs(fs - 4); };
$('bigger').onclick = function(){ setFs(fs + 4); };
$('approveAll').onclick = function(){
  var ids = data.items.filter(function(i){ return i.status === 'pending'; }).map(function(i){ return i.id; });
  act(ids, 'approved');
};
$('acceptBtn').onclick = function(){
  var next = !data.settings.open;
  data.settings.open = next; lastWallKey = ''; render();
  google.script.run.withSuccessHandler(function(){ fetchData(false); })
    .withFailureHandler(function(){ setConn(false); }).setAccepting(PIN, next);
};
$('qrBtn').onclick = function(){
  $('qr').classList.remove('hidden');
  $('qrUrl').textContent = data.url || '';
  if (!qrDrawn && data.url && window.QRCode) {
    new QRCode($('qrcode'), { text: data.url, width: 512, height: 512, correctLevel: QRCode.CorrectLevel.M });
    qrDrawn = true;
  }
};
$('qr').onclick = function(){ $('qr').classList.add('hidden'); };

/* ---------- class names ---------- */
function ceRow(name){
  var r = el('div', 'crow');
  var inp = el('input'); inp.type = 'text'; inp.value = name; inp.maxLength = 20; inp.placeholder = 'e.g. 1-B';
  inp.onkeydown = function(e){ if (e.key === 'Enter') $('ceSave').click(); };
  var x = el('button', 'btn', '×'); x.type = 'button'; x.title = 'Remove';
  x.onclick = function(){ r.remove(); };
  r.appendChild(inp); r.appendChild(x);
  $('ceRows').appendChild(r);
  return inp;
}
$('classesBtn').onclick = function(){
  $('ceRows').textContent = ''; $('ceErr').textContent = '';
  data.settings.classes.forEach(ceRow);
  $('classEdit').classList.remove('hidden');
};
$('ceAdd').onclick = function(){ ceRow('').focus(); };
$('ceCancel').onclick = function(){ $('classEdit').classList.add('hidden'); };
$('ceSave').onclick = function(){
  var names = Array.prototype.map.call($('ceRows').querySelectorAll('input'), function(i){ return i.value.trim(); })
    .filter(function(n){ return n; });
  if (!names.length) { $('ceErr').textContent = 'Add at least one class.'; return; }
  var btn = $('ceSave'); btn.disabled = true; btn.textContent = 'Saving…';
  google.script.run.withSuccessHandler(function(r){
    btn.disabled = false; btn.textContent = 'Save';
    if (!r || !r.ok) { $('ceErr').textContent = r && r.error === 'pin' ? 'Wrong PIN.' : 'Could not save. Try again.'; return; }
    data.settings.classes = r.classes; render();
    $('classEdit').classList.add('hidden');
    fetchData(false);
  }).withFailureHandler(function(){
    btn.disabled = false; btn.textContent = 'Save';
    $('ceErr').textContent = 'Could not save. Try again.';
  }).setClasses(PIN, names);
};

var savedFs = parseInt(local('sb_fs'), 10);
if (savedFs) setFs(savedFs);
var savedPin = sess('sb_pin');
if (savedPin) { PIN = savedPin; fetchData(true); }
setInterval(function(){ if (PIN && !document.hidden) fetchData(false); }, 4000);
</script>
</body></html>`;
}
