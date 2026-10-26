/* =====================================================================
   CLASSROOM GAME KIT  v1
   Shared parts for Wyatt's English classroom games (pair, team, whole-class or solo) (single-file HTML, Chromebooks, no server).
   Everything lives on window.Kit. Paste this file between the KIT:JS markers of a game
   (or run update-kit.py). Read README.md for the how-to.

   Parts
     Kit.$ / $$ / esc / bi / store(prefix)          DOM helpers, English+Japanese pairs, localStorage
     Kit.mulberry32 / hash32 / hashStr / rng / ri / shuffle / pickN / RND / randomSeeds
     Kit.codec({...})                                short class codes or pair codes, link#CODE
     Kit.link                                        the game's share link (handles the artifact URL)
     Kit.qr(canvas, text, px)                        QR code (needs the qrcode-generator script tag)
     Kit.sound / Kit.speech                          beeps and funny sounds, computer voice
     Kit.toggle / Kit.setupToggles                   日本語サポート and Sound switches (body.jp)
     Kit.seg                                         a row of pick-one buttons for settings
     Kit.screens                                     one <section class="screen"> at a time
     Kit.toast                                       small message at the bottom
     Kit.timer / fmtTime / score                     time + mistakes scoring and stars
     Kit.traps({...})                                funny traps for wrong answers (no flashing)
     Kit.codeEntry / Kit.badges                      "type the class code" box, code badges
     Kit.teacher({...})                              teacher page: code, QR, link, projector, pair codes
     Kit.result({...})                               end screen: stars, numbers, optional Swap roles!
     Kit.soloPartner({...})                          the computer partner bubble for solo practice
     Kit.words                                       textbook word bank (grade / book / unit picker)
   Other game styles (whole class, teams, solo drills)
     Kit.keys / Kit.fullscreen                       keyboard shortcuts and fullscreen for the projector
     Kit.countdown({...})                            countdown ring (no flashing)
     Kit.teams({...})                                team scoreboard with big +1 buttons
     Kit.quiz                                        multiple-choice questions from the word bank (5 types)
     Kit.bingo                                       bingo cards, calling order, line check
   ===================================================================== */
(function(){
"use strict";
const Kit={version:1};

/* ---------- DOM + text ---------- */
Kit.$=(s,r=document)=>r.querySelector(s);
Kit.$$=(s,r=document)=>[...r.querySelectorAll(s)];
Kit.esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* bi(["English","日本語"]) -> English with Japanese under it (shown only when body.jp). inline=true keeps it on one line. */
Kit.bi=(p,inline)=>`<span class="en">${p[0]}</span><span class="ja${inline?" inl":""}">${p[1]||""}</span>`;
Kit.store=prefix=>({
  get(k,d){try{const v=localStorage.getItem(prefix+"_"+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(prefix+"_"+k,JSON.stringify(v));}catch(e){}}
});
const $=Kit.$,$$=Kit.$$,bi=Kit.bi;

/* ---------- seeded random ----------
   rng(seed, salt) gives the same numbers on every Chromebook, so partners' screens match.
   RND is for things that should differ (which page a bomb picks, key order). */
Kit.mulberry32=function(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
Kit.hash32=function(x){x|=0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return(x^(x>>>16))>>>0;};
Kit.hashStr=function(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return Kit.hash32(h);};
Kit.rng=(...parts)=>{let h=0x51ed27;for(const p of parts)h=Kit.hash32(h^(typeof p==="number"?Kit.hash32(p):Kit.hashStr(String(p))));return Kit.mulberry32(h);};
Kit.ri=(r,n)=>Math.floor(r()*n);
Kit.shuffle=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=Kit.ri(r,i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
Kit.pickN=(r,arr,n)=>Kit.shuffle(arr.slice(),r).slice(0,n);
Kit.RND=Kit.mulberry32((Date.now()^(Math.random()*4294967296))>>>0);
Kit.randomSeeds=function(n,max){const a=new Uint32Array(n),used=new Set(),out=[];
  try{crypto.getRandomValues(a);}catch(e){for(let i=0;i<n;i++)a[i]=(Math.random()*4294967296)>>>0;}
  for(let i=0;i<n;i++){let s=a[i]%max;while(used.has(s))s=(s+1)%max;used.add(s);out.push(s);}return out;};
/* a bag: hands out items in random order with no repeats until all are used */
Kit.bag=(items,r)=>{let b=[];return ()=>{if(!b.length)b=Kit.shuffle(items.slice(),r||Kit.RND);return b.shift();};};

/* ---------- codes ----------
   Kit.codec({game:"pl", fields:[{k:"level",n:3},{k:"rounds",n:5,min:1}], seed:0, check:32})
     game    a short id; codes from one game never load in another
     fields  settings, each with n possible values (min..min+n-1). Order matters: only ever ADD fields at the END,
             and give them a default (def) so old codes keep working is NOT possible; adding a field changes codes.
             So pick generous n up front (e.g. n:16 for "unit").
     seed    0 for a class code (settings only, everyone in class types the same code, like The Keypad Game);
             a number like 262144 for pair codes (each pair gets its own puzzle, like The Maze Game).
     check   how many checksum values (32 = one typo in 32 slips through)
   Returns {encode(S, seed) -> "K7QM", decode(str) -> {S, seed, code} | null, fmt(code), length, fromHash()} */
const ALPH="23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
Kit.ALPH=ALPH;
Kit.codec=function(o){
  const fields=o.fields||[],SEEDS=BigInt(o.seed||1),C=BigInt(o.check||32),gid=Kit.hashStr("kit:"+(o.game||"game"));
  let N=1n;for(const f of fields)N*=BigInt(f.n);
  const M=N*SEEDS;let L=1;while(32n**BigInt(L)<M*C)L++;
  if(o.length&&o.length>L)L=o.length;
  const big=x=>{const lo=Number(x&0xFFFFFFFFn),hi=Number((x>>32n)&0xFFFFFFFFn);return Kit.hash32(lo^Kit.hash32(hi^gid));};
  const mix=c=>((BigInt(Kit.hash32(gid^(Number(c)*7919+101)))<<32n)|BigInt(Kit.hash32(gid+Number(c)*104729)))%M;
  function encode(S,seed){
    let x=0n;for(const f of fields){const v=(S[f.k]??f.def??f.min??0)-(f.min||0);if(!(v>=0&&v<f.n))throw new Error("Kit.codec: "+f.k+" out of range");x=x*BigInt(f.n)+BigInt(v);}
    x=x*SEEDS+BigInt(seed||0)%SEEDS;
    const c=BigInt(big(x))%C;let v=c*M+(x+mix(c))%M,out="";
    for(let i=0;i<L;i++){out=ALPH[Number(v%32n)]+out;v/=32n;}return out;
  }
  function clean(str){return (str||"").toUpperCase().replace(/[\s\-_.]/g,"").replace(/O/g,"0").replace(/I/g,"1");}
  function decode(str){
    const s=clean(str);if(s.length!==L)return null;
    let v=0n;for(const ch of s){const i=ALPH.indexOf(ch);if(i<0)return null;v=v*32n+BigInt(i);}
    if(v>=C*M)return null;
    const c=v/M,x=((v%M)-mix(c)+M)%M;if(BigInt(big(x))%C!==c)return null;
    let rest=x;const seed=Number(rest%SEEDS);rest/=SEEDS;const vals=[],S={};
    for(let i=fields.length-1;i>=0;i--){const n=BigInt(fields[i].n);vals[i]=Number(rest%n)+(fields[i].min||0);rest/=n;}
    fields.forEach((f,i)=>S[f.k]=vals[i]);
    if(o.valid&&!o.valid(S))return null;
    return {S,seed,code:s};
  }
  const fmt=c=>c.length>=6?c.slice(0,Math.ceil(c.length/2)-(c.length===7?1:0))+"-"+c.slice(Math.ceil(c.length/2)-(c.length===7?1:0)):c;
  function fromHash(){try{return decode(decodeURIComponent((location.hash||"").replace(/^#/,"")));}catch(e){return null;}}
  return {encode,decode,fmt,fromHash,length:L,fields};
};

/* ---------- the game's share link ----------
   Inside claude.ai the page runs in a sandbox, so we use the artifact URL you pass in.
   Hosted anywhere else (GitHub Pages later), it uses its own address. */
Kit.link={
  base(artifactUrl){try{const h=location.hostname||"";if(/^https?:$/.test(location.protocol)&&h&&!/claude|anthropic|claudeusercontent/i.test(h))return location.origin+location.pathname;}catch(e){}return artifactUrl||"";},
  withCode(base,code){return base?base.replace(/#.*$/,"")+(code?"#"+code:""):"";}
};

/* ---------- QR code (needs <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js">) ---------- */
Kit.qr=function(cv,text,px){
  if(typeof window.qrcode!=="function"||!text||!cv)return false;
  try{const q=window.qrcode(0,"M");q.addData(text);q.make();
    const n=q.getModuleCount(),size=n+8,scale=Math.max(2,Math.floor(px/size));
    cv.width=cv.height=size*scale;const g=cv.getContext("2d");
    g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);g.fillStyle="#000";
    for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))g.fillRect((c+4)*scale,(r+4)*scale,scale,scale);
    return true;}catch(e){return false;}
};

/* ---------- sound ----------
   Kit.sound.play("boing"). Add your own with Kit.sound.add("name", ()=>{tone(...)}).
   Built in: click key bump ok nope boing bawk achoo wipe splash quack snore boo meow purr done win */
const sound={on:true,_ac:null};
sound.ac=function(){if(!sound._ac){try{sound._ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){sound._ac=null;}}const a=sound._ac;if(a&&a.state==="suspended")a.resume().catch(()=>{});return a;};
sound.tone=function(f,dur,type,vol,f2,delay){
  const a=sound.on&&sound.ac();if(!a)return;
  try{const t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
  o.type=type||"square";o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(vol||0.05,t);g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+0.02);}catch(e){}
};
sound.noise=function(dur,vol,delay){const a=sound.on&&sound.ac();if(!a)return;try{const len=Math.floor(a.sampleRate*dur),buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  const src=a.createBufferSource(),g=a.createGain();src.buffer=buf;g.gain.value=vol;src.connect(g);g.connect(a.destination);src.start(a.currentTime+(delay||0));}catch(e){}};
const tone=sound.tone,noise=sound.noise;
const SFX={
  click:()=>tone(900,0.04,"triangle",0.04,700),
  key:()=>tone(660,0.05,"square",0.03,520),
  bump:()=>tone(110,0.12,"sawtooth",0.04,80),
  ok:()=>{tone(523,0.12,"triangle",0.05);tone(784,0.2,"triangle",0.05,null,0.1);},
  nope:()=>{tone(330,0.15,"square",0.04,300);tone(220,0.25,"square",0.04,200,0.15);},
  boing:()=>{tone(140,0.45,"sine",0.12,700);tone(700,0.4,"sine",0.08,180,0.3);},
  bawk:()=>[0,0.22,0.44].forEach(d=>tone(760,0.16,"sawtooth",0.04,520,d)),
  achoo:()=>{tone(500,0.3,"triangle",0.05,700);noise(0.4,0.12,0.35);},
  wipe:()=>noise(0.12,0.05),
  splash:()=>{noise(0.6,0.12);tone(900,0.3,"sine",0.03,300,0.05);},
  quack:()=>[0,0.35,0.7,1.05].forEach(d=>tone(330,0.14,"square",0.05,240,d)),
  snore:()=>{tone(70,0.9,"sawtooth",0.06,95);tone(95,0.9,"sawtooth",0.05,70,1.1);},
  boo:()=>{tone(180,0.7,"sine",0.07,90);tone(240,0.7,"triangle",0.04,120,0.05);},
  meow:()=>tone(650,0.45,"triangle",0.06,900),
  purr:()=>tone(60,0.35,"sawtooth",0.04,55),
  done:()=>[523,659,784].forEach((f,i)=>tone(f,0.18,"triangle",0.05,null,i*0.09)),
  win:()=>{[523,659,784,1046].forEach((f,i)=>tone(f,0.22,"square",0.04,null,i*0.11));tone(1318,0.5,"triangle",0.05,null,0.46);}
};
sound.play=n=>{if(SFX[n])SFX[n]();};
sound.add=(n,fn)=>{SFX[n]=fn;};
Kit.sound=sound;

/* ---------- computer voice ---------- */
const speech={can:(()=>{try{return "speechSynthesis" in window&&typeof SpeechSynthesisUtterance==="function";}catch(e){return false;}})(),voice:null,_t:[]};
speech.pick=function(){try{const vs=speechSynthesis.getVoices();speech.voice=vs.find(v=>/^en[-_]US/i.test(v.lang)&&/google|samantha|natural/i.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null;}catch(e){}};
if(speech.can){speech.pick();try{speechSynthesis.onvoiceschanged=speech.pick;}catch(e){}}
speech.say=function(t,rate){if(!speech.can||!sound.on)return false;try{const u=new SpeechSynthesisUtterance(t);u.lang="en-US";if(speech.voice)u.voice=speech.voice;u.rate=rate||0.85;speechSynthesis.speak(u);return true;}catch(e){return false;}};
/* say each item with a pause between (for "Slowly") */
speech.sayEach=function(list,gap,rate){speech.hush();list.forEach((w,i)=>speech._t.push(setTimeout(()=>speech.say(w,rate||0.75),i*(gap||1300))));return speech.can&&sound.on;};
speech.hush=function(){speech._t.forEach(clearTimeout);speech._t=[];try{speech.can&&speechSynthesis.cancel();}catch(e){}};
Kit.speech=speech;

/* ---------- switches ----------
   Kit.toggle(button, store, "jp", true, on=>{...}) keeps aria-pressed and the saved value in step.
   Kit.setupToggles(store, {jp:"#jpToggle", snd:"#sndToggle"}) wires the two standard ones. */
Kit.toggle=function(btn,st,key,def,onChange){
  if(typeof btn==="string")btn=$(btn);let v=st.get(key,def);
  const apply=()=>{if(btn)btn.setAttribute("aria-pressed",String(v));onChange&&onChange(v);};
  if(btn)btn.addEventListener("click",()=>{v=!v;st.set(key,v);sound.play("click");apply();});
  apply();return {get value(){return v;},set(x){v=!!x;st.set(key,v);apply();}};
};
Kit.setupToggles=function(st,sel){
  const out={};
  out.jp=Kit.toggle(sel.jp||"#jpToggle",st,"jp",sel.jpDefault??true,on=>document.body.classList.toggle("jp",on));
  out.snd=Kit.toggle(sel.snd||"#sndToggle",st,"snd",true,on=>{sound.on=on;if(!on)speech.hush();});
  return out;
};

/* ---------- pick-one buttons: Kit.seg(el, [{html, ...}], (o,i)=>isOn, (o,i)=>onPick) ---------- */
Kit.seg=function(el,opts,isOn,onPick){
  if(typeof el==="string")el=$(el);
  el.innerHTML=opts.map((o,i)=>`<button type="button" data-i="${i}" aria-pressed="${!!isOn(o,i)}">${o.html}</button>`).join("");
  $$("button",el).forEach(b=>b.onclick=()=>{sound.ac();sound.play("click");onPick(opts[+b.dataset.i],+b.dataset.i);});
};

/* ---------- screens: <section class="screen" id="home">. Kit.screens({onShow(id,prev)}) ---------- */
Kit.screens=function(o){
  const api={current:null,show(id){const prev=api.current;$$(".screen").forEach(el=>el.hidden=el.id!==id);api.current=id;
    speech.hush();o&&o.onShow&&o.onShow(id,prev);window.scrollTo(0,0);}};
  return api;
};

/* ---------- toast ---------- */
let toastT=0;
Kit.toast=function(html,ms){let el=$("#kitToast");if(!el){el=document.createElement("div");el.id="kitToast";el.className="kit-toast";el.setAttribute("role","status");document.body.appendChild(el);}
  el.innerHTML=html;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,ms||2600);};

/* ---------- time + mistakes ----------
   Kit.score({elapsed, oops, par}) : 1000 points, minus 100 per oops, minus 4 per second over par. Never below 100.
   Stars: 850+ = 3, 600+ = 2, otherwise 1. Every finished game gets at least one star. */
Kit.fmtTime=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");
Kit.timer=function(onTick){
  let t0=0,iv=0,el=0,run=false;
  const api={start(){t0=performance.now();el=0;run=true;clearInterval(iv);iv=setInterval(()=>{el=(performance.now()-t0)/1000;onTick&&onTick(el,Kit.fmtTime(el));},250);onTick&&onTick(0,"0:00");},
    stop(){if(run)el=(performance.now()-t0)/1000;run=false;clearInterval(iv);iv=0;return el;},
    get elapsed(){return run?(performance.now()-t0)/1000:el;},get running(){return run;}};
  return api;
};
Kit.score=function(o){
  const over=Math.max(0,(o.elapsed||0)-(o.par||60));
  const score=Math.max(100,Math.round((1000-(o.oops||0)*(o.perOops??100)-over*(o.perSec??4))/10)*10);
  return {score,stars:score>=850?3:score>=600?2:1};
};
Kit.STAR=on=>`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4l5.9 12.6 13.7 1.6-10.1 9.4 2.7 13.6L24 34.4l-12.2 6.8 2.7-13.6L4.4 18.2l13.7-1.6z" fill="${on?"#ffd23f":"none"}" stroke="${on?"#9a6f00":"#5b5f70"}" stroke-width="3" stroke-linejoin="round"/></svg>`;

/* ---------- funny traps ----------
   const T=Kit.traps({layer:"#trapLayer", target:"#chest", area:"#keys"});
   T.next(done)   plays a random trap (no repeats until all used), then calls done()
   T.run("cat",done) plays one by name.  T.clear() stops everything (call it when leaving the screen).
   layer = an empty .kit-trap-layer placed inside a position:relative stage.
   target = the thing being worked on (traps aim at it); area = the buttons (traps cover them for 2-3 seconds).
   All movement and sound, nothing flashes. Names: glove chicken soot water duck bear cat (+ any you add with T.add). */
Kit.traps=function(o){
  const layer=typeof o.layer==="string"?$(o.layer):o.layer;
  const R=o.rng||Kit.RND,ri=n=>Kit.ri(R,n);let timers=[];
  const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
  const clear=()=>{timers.forEach(clearTimeout);timers=[];layer.innerHTML="";layer.classList.remove("block");};
  const el=(cls,html,css)=>{const d=document.createElement("div");d.className="kt "+cls;d.innerHTML=html;Object.assign(d.style,css||{});layer.appendChild(d);return d;};
  const word=(w,left,top)=>el("kt-wordwrap",`<div class="kt-word">${w[0]}<span class="ja">${w[1]||""}</span></div>`,{left,top});
  const box=sel=>{const s=layer.getBoundingClientRect(),e=(typeof sel==="string"?$(sel):sel);if(!e)return {x:s.width/4,y:s.height/4,w:s.width/2,h:s.height/2};const b=e.getBoundingClientRect();return {x:b.left-s.left,y:b.top-s.top,w:b.width,h:b.height};};
  const tc=()=>{const b=box(o.target);return {x:b.x+b.w/2,y:b.y+b.h/2};},ar=()=>box(o.area);
  const play=sound.play;
  const T={
    glove(done){const c=tc();layer.classList.add("block");play("boing");el("kt-glove","\u{1F94A}",{left:c.x+"px",top:c.y+"px"});word(["BOING!","ボヨーン！"],"50%","8%");later(()=>{clear();done();},2100);},
    chicken(done){layer.classList.add("block");play("bawk");const k=ar();el("kt-chicken","\u{1F414}",{left:(k.x+k.w/2-60)+"px"});word(["BAWK!","コケーッ！"],"50%","8%");later(()=>{clear();done();},2500);},
    soot(done){
      play("achoo");const c=tc();word(["ACHOO!","ハックション！"],c.x+"px","6%");layer.classList.add("block");let fin=false;
      const finish=()=>{if(fin)return;fin=true;clear();done();};
      later(()=>{const k=ar();let left=0;
        for(let i=0;i<6;i++){const d=el("kt-soot","",{left:(k.x+(i%3)*k.w/3+ri(30))+"px",top:(k.y+Math.floor(i/3)*k.h/2+ri(20))+"px"});left++;
          d.onclick=()=>{if(d.classList.contains("gone"))return;d.classList.add("gone");play("wipe");left--;if(!left)finish();};}
        el("kt-hint",bi(["Click the soot to wipe it off!","すすをクリックしてふき取ろう！"]),{});
        later(finish,10000);},700);
    },
    water(done){layer.classList.add("block");play("splash");const k=ar();
      for(let i=0;i<16;i++){const d=el("kt-drop","\u{1F4A7}",{left:(10+ri(60))+"px",top:(10+ri(60))+"px",animationDelay:(i*0.05)+"s"});d.style.setProperty("--dx",(k.x+ri(Math.max(40,k.w)))+"px");d.style.setProperty("--dy",(k.y+ri(Math.max(40,k.h)))+"px");}
      word(["SPLASH!","バシャッ！"],"50%","8%");later(()=>{clear();done();},2200);},
    duck(done){layer.classList.add("block");play("quack");el("kt-duck","\u{1F986}",{});word(["QUACK! QUACK!","ガーガー！"],"50%","8%");later(()=>{clear();done();},3000);},
    bear(done){layer.classList.add("block");play("snore");el("kt-bear","\u{1F43B}",{});
      for(let i=0;i<3;i++)el("kt-zz","Z",{left:"55%",top:"40%",animationDelay:(i*0.6)+"s"});
      word(["ZZZ... SNORE!","グーグー…"],"50%","8%");later(()=>{clear();done();},2800);},
    cat(done){
      play("meow");const k=ar();layer.classList.add("block");let pets=0,fin=false;
      const cat=el("kt-cat","\u{1F431}",{left:(k.x+k.w/2-65)+"px",top:(k.y+k.h/2-75)+"px"});
      const hint=el("kt-hint",bi(["Pet the cat 3 times to move it!","ネコを3回なでて、どいてもらおう！"]),{});
      const bye=()=>{if(fin)return;fin=true;play("meow");cat.classList.add("bye");hint.remove();later(()=>{clear();done();},650);};
      cat.onclick=()=>{if(fin)return;pets++;play("purr");el("kt-heart","\u{1F497}",{left:(k.x+k.w/2+ri(40)-20)+"px",top:(k.y+k.h/2-80)+"px"});if(pets>=3)bye();};
      later(bye,12000);
    }
  };
  let names=o.names||Object.keys(T),bag=Kit.bag(names,R);
  return {
    run(n,done){clear();(T[n]||T.glove)(done||(()=>{}));},
    next(done){this.run(bag(),done);},
    add(n,fn){T[n]=(done)=>fn(done,{el,word,later,clear,tc,ar,layer,rng:R});names=names.concat(n);bag=Kit.bag(names,R);},
    use(list){names=list;bag=Kit.bag(names,R);},
    clear,word,el,later,get names(){return Object.keys(T);}
  };
};

/* ---------- class code helpers ---------- */
/* every element with class "kitCode" shows the current code */
Kit.badges=function(code,fmt){$$(".kitCode").forEach(e=>e.textContent=fmt?fmt(code):code);};
/* Kit.codeEntry(mount, {codec, onCode(decoded), label}) -> a "Type code / Use code" form */
Kit.codeEntry=function(mount,o){
  if(typeof mount==="string")mount=$(mount);
  const f=document.createElement("form");f.className="kit-entry";f.autocomplete="off";
  f.innerHTML=`<input maxlength="${o.codec.length+2}" placeholder="${o.placeholder||"Type code"}" aria-label="Type a code" spellcheck="false"><button class="btn small" type="submit">${bi(["Use code","このコードを使う"])}</button><p class="kit-err" aria-live="polite"></p>`;
  const inp=$("input",f),err=$(".kit-err",f);
  f.onsubmit=e=>{e.preventDefault();const d=o.codec.decode(inp.value);
    if(!d){err.innerHTML=bi(["That code doesn't work. Check it with your partner or teacher.","そのコードは使えません。パートナーか先生に確認しよう。"]);sound.play("nope");return;}
    err.innerHTML="";inp.value="";sound.play("ok");o.onCode(d);};
  mount.appendChild(f);return f;
};

/* ---------- teacher page ----------
   Kit.teacher({mount, title, steps:[[en,ja],...], note, artifactUrl, store,
                getCode()->code, getName()->[en,ja], fmt,
                pairs: {make(seed)->code, label:[en,ja], max, view(code)->{html} } })
   Builds: steps + a settings slot on the left; big code, QR, link, copy, projector view on the right.
   Returns {slot, refresh()}. Move your settings panel into .slot when the teacher screen opens.
   With pairs, it also makes a numbered list of pair codes to read out or copy. */
Kit.teacher=function(o){
  const mount=typeof o.mount==="string"?$(o.mount):o.mount,st=o.store||Kit.store("kit");
  const fmt=o.fmt||(c=>c);
  mount.innerHTML=`<div class="kit-teacher">
   <div class="kit-tcol">
    <div class="panel"><h2 class="kit-th">${bi(o.title||["Teacher page","先生用ページ"],true)}</h2>
     <ol class="kit-steps">${(o.steps||[]).map(s=>`<li>${bi(s)}</li>`).join("")}</ol>
     ${o.note?`<p class="note" style="margin-top:8px">${o.note}</p>`:""}</div>
    <div class="panel kit-slot"></div>
    ${o.pairs?`<div class="panel kit-pairs"><h3>${bi(o.pairs.label||["Codes for each pair","ペアごとのコード"],true)}</h3>
      <div class="kit-pairrow"><label>${bi(["Pairs","ペアの数"],true)} <input type="number" min="1" max="${o.pairs.max||40}" value="${st.get("pairs",16)}" class="kit-npairs"></label>
      <button class="btn primary small kit-make" type="button">${bi(["Make codes","コードを作る"])}</button>
      <button class="btn small kit-copycodes" type="button" hidden>${bi(["Copy list","リストをコピー"])}</button></div>
      <div class="kit-codelist"></div><textarea class="kit-copyarea" hidden rows="6"></textarea></div>`:""}
   </div>
   <div class="panel kit-share">
    <small class="note">${bi(o.pairs?["Game link","ゲームのリンク"]:["Class code","クラスコード"])}</small>
    ${o.pairs?"":`<div class="kit-bigcode kitCode">----</div><div class="kit-cname"></div>`}
    <div class="kit-qr"><canvas width="220" height="220"></canvas></div><p class="kit-err kit-qrerr"></p>
    <input class="kit-link" type="text" aria-label="Game link">
    <div class="rowbtns"><button class="btn small kit-copy" type="button">${bi(["Copy link","リンクをコピー"])}</button>
      <button class="btn small kit-reset" type="button">${bi(["Reset link","リセット"])}</button></div>
    <button class="btn primary kit-proj" type="button">${bi(["Show on the projector","大きく表示"])}</button>
   </div></div>`;
  let veil=$("#kitVeil");
  if(!veil){veil=document.createElement("div");veil.id="kitVeil";veil.className="kit-veil";veil.hidden=true;veil.setAttribute("role","dialog");veil.setAttribute("aria-label","Class code");
    veil.innerHTML=`<div class="kit-veil-card"><h2 class="kit-vtitle"></h2><div class="kit-bigcode kitCode kit-vcode">----</div><div class="kit-cname"></div><div class="kit-qr"><canvas width="300" height="300" style="width:300px;height:300px"></canvas></div><p class="note kit-vurl"></p><button class="btn kit-close" type="button">${bi(["Close","閉じる"])}</button></div>`;
    document.body.appendChild(veil);
    $(".kit-close",veil).onclick=()=>veil.hidden=true;
    document.addEventListener("keydown",e=>{if(e.key==="Escape")veil.hidden=true;});}
  const auto=()=>Kit.link.base(o.artifactUrl);
  let LINK=st.get("link","")||auto();
  const full=()=>o.pairs?LINK:Kit.link.withCode(LINK,o.getCode());
  const api={slot:$(".kit-slot",mount),codes:[],
    refresh(){
      if(!o.pairs){const code=o.getCode(),nm=o.getName?o.getName():null;Kit.badges(fmt(code));$$(".kit-cname").forEach(e=>e.innerHTML=nm?bi(nm):"");}
      $(".kit-link",mount).value=full();
      const ok=Kit.qr($(".kit-qr canvas",mount),full(),440);$(".kit-qr",mount).hidden=!ok;
      $(".kit-qrerr",mount).innerHTML=ok?"":(LINK?bi(["The QR code tool couldn't load. Check the internet connection, then reopen this page.","QRコードを作れませんでした。インターネット接続を確認してください。"]):bi(["Paste the game's link below to make a QR code.","QRコードを作るには、下にゲームのリンクを貼り付けてください。"]));
      if(!veil.hidden)drawBig();
    }};
  function drawBig(){$(".kit-vtitle",veil).innerHTML=bi(o.pairs?["Open the game","ゲームを開こう"]:["Class code","クラスコード"],true);$(".kit-vcode",veil).hidden=!!o.pairs;$(".kit-vurl",veil).textContent=full();Kit.qr($(".kit-qr canvas",veil),full(),600);}
  $(".kit-link",mount).addEventListener("change",e=>{LINK=e.target.value.trim().replace(/#.*$/,"")||auto();st.set("link",LINK===auto()?"":LINK);api.refresh();});
  $(".kit-reset",mount).onclick=()=>{LINK=auto();st.set("link","");api.refresh();};
  $(".kit-copy",mount).onclick=()=>copyText(full(),$(".kit-link",mount));
  $(".kit-proj",mount).onclick=()=>{veil.hidden=false;drawBig();$(".kit-close",veil).focus();};
  if(o.pairs){
    const list=$(".kit-codelist",mount),cp=$(".kit-copycodes",mount),area=$(".kit-copyarea",mount);
    $(".kit-make",mount).onclick=()=>{const n=Math.max(1,Math.min(o.pairs.max||40,+$(".kit-npairs",mount).value||1));st.set("pairs",n);
      api.codes=Kit.randomSeeds(n,o.pairs.seeds||262144).map(s=>o.pairs.make(s));
      list.innerHTML=`<div class="kit-codes">${api.codes.map((c,i)=>`<div class="kit-codecard"><small>${bi(["Pair "+(i+1),"ペア "+(i+1)],true)}</small><b>${fmt(c)}</b>${o.pairs.view?o.pairs.view(c):""}</div>`).join("")}</div>`;
      cp.hidden=false;area.hidden=true;sound.play("ok");};
    cp.onclick=()=>copyText(api.codes.map((c,i)=>`Pair ${i+1}: ${fmt(c)}`).join("\n"),area);
  }
  function copyText(t,fallbackEl){const fb=()=>{if(fallbackEl){fallbackEl.hidden=false;if(fallbackEl.tagName==="TEXTAREA")fallbackEl.value=t;fallbackEl.focus();fallbackEl.select();}Kit.toast(bi(["Press Ctrl+C to copy","Ctrl+C でコピー"]));};
    try{navigator.clipboard.writeText(t).then(()=>Kit.toast(bi(["Copied!","コピーしました"])),fb);}catch(e){fb();}}
  return api;
};

/* ---------- end screen ----------
   Kit.result(mount, {title:[en,ja], art:html, elapsed, oops, score, stars, swap, nums, labels, buttons})
     stars   1-3, or leave out for no stars (e.g. a team game)
     swap    true shows the "Swap roles!" card (pair games, not solo)
     nums    replace the Time / Oops / Score boxes: [{label:[en,ja], value}]  ([] for none)
     buttons [{label:[en,ja], primary, onClick, hidden}] */
Kit.result=function(mount,o){
  if(typeof mount==="string")mount=$(mount);
  const lab=Object.assign({time:["Time","タイム"],oops:["Oops","ミス"],score:["Score","スコア"]},o.labels||{});
  const msg=o.title||(o.stars===3?["Amazing!","すごい！"]:o.stars===2?["Great job!","よくできました！"]:["You did it!","クリア！"]);
  const nums=o.nums||[{label:lab.time,value:Kit.fmtTime(o.elapsed||0)},{label:lab.oops,value:o.oops||0},{label:lab.score,value:o.score}];
  mount.innerHTML=`<div class="kit-result">${o.art||""}
    <h1 class="kit-rtitle">${msg[0]}</h1><p class="ja">${msg[1]||""}</p>
    ${o.stars?`<div class="kit-stars">${[1,2,3].map(i=>Kit.STAR(o.stars>=i)).join("")}</div>`:""}
    ${nums.length?`<div class="kit-nums">${nums.map(n=>`<div><small>${bi(n.label)}</small><b>${n.value}</b></div>`).join("")}</div>`:""}
    ${o.swap?`<div class="kit-swap"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 18h28l-7-7M40 30H12l7 7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><div>${bi(["Swap roles!","役割を交代しよう！"])}</div></div>`:""}
    <div class="rowbtns"></div></div>`;
  const row=$(".rowbtns",mount);
  (o.buttons||[]).forEach(b=>{if(b.hidden)return;const btn=document.createElement("button");btn.type="button";btn.className="btn big"+(b.primary?" primary":"");btn.innerHTML=bi(b.label);btn.onclick=b.onClick;row.appendChild(btn);});
};

/* ---------- solo practice partner ----------
   const P=Kit.soloPartner({mount, speak(slow)}); P.tell(["Listen!","聞こう！"]); P.show(true/false)
   speak(slow) should call Kit.speech.say / sayEach. If the Chromebook has no voice, call P.tell with the words to read. */
Kit.soloPartner=function(o){
  const m=typeof o.mount==="string"?$(o.mount):o.mount;m.classList.add("kit-partner");
  m.innerHTML=`<span class="kit-robot" aria-hidden="true">\u{1F916}</span><div class="kit-bub"></div><button class="btn small" type="button" data-s="0">${bi(["Say it again","もう一度"])}</button><button class="btn small" type="button" data-s="1">${bi(["Slowly","ゆっくり"])}</button>`;
  $$("button",m).forEach(b=>b.onclick=()=>{sound.ac();o.speak(b.dataset.s==="1");});
  return {tell(p){$(".kit-bub",m).innerHTML=bi(p);},show(on){m.hidden=!on;}};
};

/* ---------- textbook word bank ----------
   Data: the JSON script tag with id kit-wordbank (copied from textbook-db/all-books.json by update-kit.py).
   Book order is the order in all-books.json. Codes store the book's position, so only ADD books at the end.
     Kit.words.books()                     [{i, name, grade, gradeLabel:[en,ja], units:[...]}]
     Kit.words.pick({book, from, to}, {needEmoji, minWords})  -> {words:[{en,ja,emoji}], phrases:[], units:[...]}
     Kit.words.label(sel)                  ["Let's Try! 2 · Unit 4", "小4 Let's Try! 2 Unit 4"]
     Kit.words.fields                      codec fields: book (8), from (16), to (16)
     Kit.words.picker(mount, sel, onChange, {needEmoji})  grade + book + unit range controls */
const GRADE=g=>{const m=/^(ES|JHS)(\d)$/.exec(g||"");if(!m)return [g||"",g||""];return m[1]==="ES"?["Grade "+m[2],"小"+m[2]]:["JHS "+m[2],"中"+m[2]];};
const words={_d:null};
words.load=function(){if(words._d)return words._d;let d={books:[]};try{const el=document.getElementById("kit-wordbank");if(el)d=JSON.parse(el.textContent);}catch(e){}
  words._d=(d.books||[]).map((b,i)=>({i,name:b.book,grade:b.grade,gradeLabel:GRADE(b.grade),units:(b.units||[]).map(u=>Object.assign({},u,{words:(u.words||[]).filter(w=>w&&w.en)}))}));return words._d;};
words.books=()=>words.load();
words.book=i=>words.load()[i]||null;
words.fields=[{k:"book",n:8,def:0},{k:"from",n:16,def:0},{k:"to",n:16,def:0}];
words.clamp=function(sel){const bs=words.load();const b=bs[sel.book]?sel.book:0,n=bs[b]?bs[b].units.length:1;let f=Math.min(sel.from||0,n-1),t=Math.min(sel.to??f,n-1);if(t<f)t=f;return {book:b,from:f,to:t};};
words.pick=function(sel,opt){opt=opt||{};const s=words.clamp(sel),b=words.book(s.book);if(!b)return {words:[],phrases:[],units:[]};
  const units=b.units.slice(s.from,s.to+1),seen=new Set(),out=[];let phrases=[];
  units.forEach(u=>{phrases=phrases.concat(u.phrases||[]);u.words.forEach(w=>{const k=w.en.toLowerCase();if(seen.has(k))return;if(opt.needEmoji&&!w.emoji)return;seen.add(k);out.push(w);});});
  return {words:out,phrases,units,book:b};};
words.label=function(sel){const s=words.clamp(sel),b=words.book(s.book);if(!b)return ["No word bank","単語データなし"];
  const u=b.units,us=s.from===s.to?"Unit "+u[s.from].unit:"Units "+u[s.from].unit+"–"+u[s.to].unit;
  return [b.name+" · "+us,b.gradeLabel[1]+" "+b.name+" "+us.replace("Units","Unit")];};
words.picker=function(mount,sel,onChange,opt){
  if(typeof mount==="string")mount=$(mount);opt=opt||{};const bs=words.load();
  const cur=()=>words.clamp(sel);
  function render(){
    const s=cur(),b=bs[s.book];
    mount.innerHTML=`<div class="set-row"><h3>${bi(["Book","教科書"])}</h3><div class="seg kw-book"></div></div>
     <div class="set-row"><h3>${bi(["Unit","ユニット"])}</h3><div class="seg kw-unit"></div></div>
     <p class="note kw-info"></p>`;
    Kit.seg($(".kw-book",mount),bs.map(x=>({html:`${x.gradeLabel[0]}<small>${Kit.esc(x.name)}</small><span class="ja">${x.gradeLabel[1]}</span>`})),(o,i)=>i===s.book,(o,i)=>{sel.book=i;sel.from=0;sel.to=0;done();});
    let anchor=null;
    Kit.seg($(".kw-unit",mount),b.units.map((u,i)=>({html:`${u.unit}<small>${Kit.esc(u.title||"")}</small>`})),(o,i)=>i>=s.from&&i<=s.to,(o,i)=>{
      /* click = one unit; shift-click (or click next to the current range) = a range */
      if(window.event&&window.event.shiftKey){sel.from=Math.min(s.from,i);sel.to=Math.max(s.to,i);}else{sel.from=i;sel.to=i;}done();});
    $$(".kw-unit button",mount).forEach((btn,i)=>{const u=b.units[i];btn.title=(u.topic||"")+(u.verified?"":" (not checked yet)");});
    const p=words.pick(s,opt),n=p.words.length;
    $(".kw-info",mount).innerHTML=`${n} words${opt.needEmoji?" with pictures":""}. Shift-click a second unit to mix several units.<span class="ja">${n}語${opt.needEmoji?"（絵あり）":""}。Shiftを押しながらクリックすると、複数のユニットを選べます。</span>`
      +(opt.minWords&&n<opt.minWords?`<span class="kit-err" style="display:block">${bi(["Not enough words here. Add another unit.","単語が足りません。ユニットを追加してください。"])}</span>`:"");
  }
  function done(){Object.assign(sel,cur());render();onChange&&onChange(sel);}
  render();return {render};
};
Kit.words=words;

/* =====================================================================
   PARTS FOR OTHER GAME STYLES
   whole-class projector games, team games, quizzes, bingo, solo drills
   ===================================================================== */

/* ---------- keyboard shortcuts (projector games: Space = next, 1-4 = answer) ----------
   const off=Kit.keys({" ":next, "ArrowRight":next, "1":()=>pick(0)}, ()=>scr.current==="quiz")
   Ignored while typing in a box. The second argument decides when the keys are live. */
Kit.keys=function(map,when){
  const h=e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable))return;
    if(when&&!when())return;const fn=map[e.key]||map[e.key.toLowerCase()];if(fn){e.preventDefault();fn(e);}};
  document.addEventListener("keydown",h);return ()=>document.removeEventListener("keydown",h);
};

/* ---------- fullscreen for the projector: Kit.fullscreen(button) ---------- */
Kit.fullscreen=function(btn){
  if(typeof btn==="string")btn=$(btn);if(!btn)return;
  const ok=!!(document.documentElement.requestFullscreen);if(!ok){btn.hidden=true;return;}
  btn.onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>Kit.toast(bi(["Fullscreen isn't allowed here","ここでは全画面にできません"])));}catch(e){}};
};

/* ---------- countdown ring ----------
   const C=Kit.countdown({mount, seconds:20, onEnd(){...}}); C.start(); C.pause(); C.reset(30); C.add(10)
   Ticks quietly in the last 5 seconds. Time's up is a sound and a word, never a flash. seconds:0 hides it. */
Kit.countdown=function(o){
  const m=typeof o.mount==="string"?$(o.mount):o.mount;m.classList.add("kit-count");
  m.innerHTML=`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="kc-bg"/><circle cx="50" cy="50" r="44" class="kc-fg" pathLength="100"/></svg><b></b>`;
  let total=o.seconds||0,left=total,iv=0,last=-1;
  const fg=$(".kc-fg",m),num=$("b",m);
  const draw=()=>{const s=Math.ceil(left);num.textContent=s;fg.style.strokeDashoffset=String(total?100-100*left/total:0);m.classList.toggle("low",s<=5&&left>0);m.hidden=!total;};
  const api={
    start(){if(!total)return;clearInterval(iv);let t0=performance.now(),l0=left;iv=setInterval(()=>{left=Math.max(0,l0-(performance.now()-t0)/1000);const s=Math.ceil(left);
      if(s!==last&&s<=5&&s>0)sound.tone(880,0.06,"triangle",0.04);last=s;draw();if(left<=0){clearInterval(iv);iv=0;sound.play("nope");o.onEnd&&o.onEnd();}},100);},
    pause(){clearInterval(iv);iv=0;},
    reset(sec){api.pause();if(sec!=null)total=sec;left=total;last=-1;draw();},
    add(sec){left=Math.min(left+sec,total=Math.max(total,left+sec));draw();},
    get left(){return left;},get running(){return !!iv;}
  };
  draw();return api;
};

/* ---------- team scoreboard ----------
   const TB=Kit.teams({mount, n:4, onChange(scores)}); TB.add(2, 1); TB.reset(); TB.scores; TB.leaders()
   Big + and - buttons for each team, readable from the back of the room. Teams are animals, so no team is "last". */
Kit.TEAMS=[{em:"\u{1F431}",name:["Cats","ネコ"],c:"#ff9f6b"},{em:"\u{1F436}",name:["Dogs","イヌ"],c:"#6bb8ff"},{em:"\u{1F43C}",name:["Pandas","パンダ"],c:"#c9c4d6"},
  {em:"\u{1F438}",name:["Frogs","カエル"],c:"#7fd18b"},{em:"\u{1F427}",name:["Penguins","ペンギン"],c:"#9aa7ff"},{em:"\u{1F98A}",name:["Foxes","キツネ"],c:"#ffc35a"}];
Kit.teams=function(o){
  const m=typeof o.mount==="string"?$(o.mount):o.mount;m.classList.add("kit-teams");
  let n=o.n||2,scores=Array(n).fill(0);
  const api={
    get scores(){return scores.slice();},get n(){return n;},
    set(k){n=k;scores=Array(n).fill(0);render();},
    add(i,pts){if(i<0||i>=n)return;scores[i]=Math.max(0,scores[i]+(pts??1));sound.play(pts<0?"click":"ok");render(i);o.onChange&&o.onChange(api.scores);},
    reset(){scores=Array(n).fill(0);render();},
    leaders(){const top=Math.max(...scores);return scores.map((s,i)=>s===top?i:-1).filter(i=>i>=0);},
    team:i=>Kit.TEAMS[i]
  };
  function render(bump){
    m.innerHTML=scores.map((s,i)=>{const T=Kit.TEAMS[i];return `<div class="kit-team${i===bump?" bump":""}" style="--tc:${T.c}"><span class="kt-em">${T.em}</span><span class="kt-nm">${bi(T.name)}</span><b>${s}</b>
      <div class="kt-btns"><button type="button" class="btn small" data-t="${i}" data-p="-1" aria-label="Minus one for ${T.name[0]}">−</button><button type="button" class="btn small primary" data-t="${i}" data-p="1" aria-label="Plus one for ${T.name[0]}">+1</button></div></div>`;}).join("");
    $$("button",m).forEach(b=>b.onclick=()=>api.add(+b.dataset.t,+b.dataset.p));
  }
  render();return api;
};

/* ---------- quiz questions from the word bank ----------
   Kit.quiz.make(words, {type, choices:4, rng}) -> {type, item, prompt:{html, say}, choices:[...], answer}
   Kit.quiz.types(words) -> which TYPES work for these words (picture types need emoji)
   Kit.quiz.render(mount, q, {onAnswer(ok, choice, i), reveal:false, letters:true})
     shows the prompt and A-D buttons. With reveal:false it only records the pick (projector games reveal later via .reveal()).
   Kit.quiz.deck(words, n, rng) -> n items with no repeats until all are used */
const QT={
  picture:{name:["Picture → word","絵 → 英語"],needs:w=>!!w.emoji,prompt:w=>({html:`<span class="kq-em">${w.emoji}</span>`,say:""}),choice:w=>Kit.esc(w.en)},
  listen:{name:["Listen → picture","聞いて → 絵"],needs:w=>!!w.emoji,prompt:w=>({html:`<span class="kq-ear" aria-hidden="true">\u{1F442}</span><span class="kq-listen">${bi(["Listen!","聞いて！"])}</span>`,say:w.en}),choice:w=>`<span class="kq-cem">${w.emoji}</span>`},
  word:{name:["Word → picture","英語 → 絵"],needs:w=>!!w.emoji,prompt:w=>({html:`<span class="kq-word">${Kit.esc(w.en)}</span>`,say:w.en}),choice:w=>`<span class="kq-cem">${w.emoji}</span>`},
  japanese:{name:["Japanese → English","日本語 → 英語"],needs:w=>!!w.ja,prompt:w=>({html:`<span class="kq-ja">${Kit.esc(w.ja)}</span>`,say:""}),choice:w=>Kit.esc(w.en)},
  spell:{name:["Spelling","つづり"],needs:w=>/^[a-z]{3,}$/i.test(w.en),prompt:w=>({html:w.emoji?`<span class="kq-em">${w.emoji}</span>`:`<span class="kq-ja">${Kit.esc(w.ja||"")}</span>`,say:w.en}),choice:x=>Kit.esc(x)}
};
function misspell(word,r){
  const out=new Set(),vow="aeiou",w=word.toLowerCase();let tries=0;
  while(out.size<3&&tries++<60){const i=Kit.ri(r,w.length),k=Kit.ri(r,4);let x=w;
    if(k===0&&i<w.length-1)x=w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2);
    else if(k===1)x=w.slice(0,i)+w[i]+w.slice(i);
    else if(k===2&&w.length>3)x=w.slice(0,i)+w.slice(i+1);
    else if(vow.includes(w[i]))x=w.slice(0,i)+vow[(vow.indexOf(w[i])+1+Kit.ri(r,4))%5]+w.slice(i+1);
    if(x!==w)out.add(word[0]===word[0].toUpperCase()?x[0].toUpperCase()+x.slice(1):x);}
  return [...out];
}
Kit.quiz={
  TYPES:QT,
  types(words){return Object.keys(QT).filter(t=>words.filter(QT[t].needs).length>=(t==="spell"?1:4));},
  deck(words,n,r){const b=Kit.bag(words,r||Kit.RND);return Array.from({length:n},()=>b());},
  make(words,o){
    o=o||{};const r=o.rng||Kit.RND,T=QT[o.type]||QT.picture,pool=words.filter(T.needs),n=o.choices||4;
    const item=o.item&&T.needs(o.item)?o.item:pool[Kit.ri(r,pool.length)];
    if(o.type==="spell"){const opts=Kit.shuffle([item.en].concat(misspell(item.en,r)).slice(0,n),r);
      return {type:"spell",item,prompt:T.prompt(item),choices:opts.map(x=>({html:T.choice(x),key:x})),answer:opts.indexOf(item.en)};}
    const key=w=>(o.type==="listen"||o.type==="word")?w.emoji:w.en.toLowerCase();
    const others=Kit.shuffle(pool.filter(w=>w!==item&&key(w)!==key(item)),r),seen=new Set([key(item)]),wrong=[];
    for(const w of others){if(wrong.length>=n-1)break;if(seen.has(key(w)))continue;seen.add(key(w));wrong.push(w);}
    const opts=Kit.shuffle([item].concat(wrong),r);
    return {type:o.type||"picture",item,prompt:T.prompt(item),choices:opts.map(w=>({html:T.choice(w),key:w.en})),answer:opts.indexOf(item)};
  },
  render(mount,q,o){
    if(typeof mount==="string")mount=$(mount);o=o||{};let picked=-1,done=false;
    mount.innerHTML=`<div class="kq"><div class="kq-prompt">${q.prompt.html}</div>
      <div class="kq-choices">${q.choices.map((c,i)=>`<button type="button" class="kq-c" data-i="${i}">${o.letters===false?"":`<i>${"ABCD"[i]||i+1}</i>`}<span>${c.html}</span></button>`).join("")}</div></div>`;
    const btns=$$(".kq-c",mount);
    const api={
      pick(i){if(done||i<0||i>=btns.length)return;sound.ac();picked=i;btns.forEach((b,j)=>b.classList.toggle("picked",j===i));
        if(o.reveal!==false){const ok=i===q.answer;if(ok){done=true;btns[i].classList.add("right");}else{btns[i].classList.add("wrong","kit-shake");setTimeout(()=>btns[i].classList.remove("kit-shake"),450);}
          o.onAnswer&&o.onAnswer(ok,q.choices[i],i);}else o.onAnswer&&o.onAnswer(null,q.choices[i],i);},
      reveal(){done=true;btns.forEach((b,j)=>{b.classList.toggle("right",j===q.answer);b.classList.toggle("dim",j!==q.answer);});},
      say(rate){if(q.prompt.say)speech.say(q.prompt.say,rate||0.8);},
      get picked(){return picked;},get done(){return done;}
    };
    btns.forEach((b,i)=>b.onclick=()=>api.pick(i));
    return api;
  }
};

/* ---------- bingo ----------
   Kit.bingo.card(words, size, rng) -> size*size items (centre is FREE when size is odd)
   Kit.bingo.calls(words, rng) -> the calling order (same on every screen with the same rng seed)
   Kit.bingo.lines(marked:boolean[], size) -> how many full rows, columns and diagonals
   Seed the card with the student's number and the caller with the game number, so a card can be checked on the projector. */
Kit.bingo={
  card(words,size,r){const n=size*size,mid=size%2?Math.floor(n/2):-1,pick=Kit.pickN(r,words,Math.min(words.length,n-(mid>=0?1:0)));
    const cells=[];let k=0;for(let i=0;i<n;i++)cells.push(i===mid?{free:true}:(pick[k++]||{free:true}));return cells;},
  calls(words,r){return Kit.shuffle(words.slice(),r);},
  lines(m,size){let c=0;const at=(r,k)=>m[r*size+k];
    for(let r=0;r<size;r++){let a=true,b=true;for(let k=0;k<size;k++){a=a&&at(r,k);b=b&&at(k,r);}c+=a+b;}
    let d1=true,d2=true;for(let i=0;i<size;i++){d1=d1&&at(i,i);d2=d2&&at(i,size-1-i);}return c+d1+d2;}
};

window.Kit=Kit;
})();
