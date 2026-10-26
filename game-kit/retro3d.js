/* =====================================================================
   CLASSROOM GAME KIT  ·  RETRO 3D ADD-ON  v2   (PSX / N64 look)
   Optional. Paste between the KIT:3D markers (update-kit.py does it) AFTER the three.js script tag:
     the script tag for https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
   Everything lives on window.Kit3D.

   The look, and why it is cheap on Chromebooks:
     - draws at about 240 pixels tall and scales up with crisp pixels (few pixels = fast)
     - vertices snap to the pixel grid, so models wobble a little like on a PlayStation
     - 15-bit color with ordered dithering, distance fog, tiny pixel-art textures
     - capped at 30 frames per second and paused when the screen is hidden
   Nothing here flashes. Keep it that way: no strobing lights or fast color changes.

   Parts
     Kit3D.stage({mount, height:240, bg, fog:[near,far]})  scene, camera, lights, low-res renderer
     Kit3D.mat(color, {map, emissive, flat})                a material with the retro look
     Kit3D.facet(geometry)                                  faceted (flat-shaded) low-poly geometry
     Kit3D.tex(size, draw(g,size,rand)) / Kit3D.TEX.*        tiny pixel textures (grass, checker, wood, water, sand)
     Kit3D.critter({kind} or {recipe})                      a cute low-poly character built from parts (Kit3D.CRITTERS, PARTS)
     Kit3D.sign(content, {size, board})                     a picture or word on a post, always facing the camera
     Kit3D.tree() / Kit3D.rock()                            scenery
     Kit3D.loop(stage, fn(dt, t))                           30 fps game loop, returns {stop()}
     Kit3D.move()                                           arrow keys / WASD as {x, z}
     Kit3D.groundPoint(stage, event)                        where a click lands on the ground (click-to-walk)
     Kit3D.follow(camera, target, offset, ease)             smooth follow camera
   ===================================================================== */
(function(){
"use strict";
const THREE=window.THREE;
if(!THREE){console.warn("Kit3D: load three.js r128 before the retro 3D add-on");window.Kit3D=null;return;}
const Kit3D={version:2};

/* ---------- the retro shader patch (vertex snap + dithered 15-bit color) ---------- */
const U={uSnap:{value:new THREE.Vector2(160,120)},uLevels:{value:31}};
const DITHER="float kitB2(vec2 a){a=floor(a);return fract(a.x/2.0+a.y*a.y*0.75);}\nfloat kitB4(vec2 a){return kitB2(0.5*a)*0.25+kitB2(a);}\n";
function retro(m){
  m.onBeforeCompile=sh=>{
    sh.uniforms.uSnap=U.uSnap;sh.uniforms.uLevels=U.uLevels;
    sh.vertexShader="uniform vec2 uSnap;\n"+sh.vertexShader.replace("#include <project_vertex>",
      "#include <project_vertex>\n{vec4 p=gl_Position;p.xy=floor(p.xy/p.w*uSnap+0.5)/uSnap*p.w;gl_Position=p;}");
    sh.fragmentShader="uniform float uLevels;\n"+DITHER+sh.fragmentShader.replace(/}\s*$/,
      "gl_FragColor.rgb=floor(clamp(gl_FragColor.rgb,0.0,1.0)*uLevels+kitB4(gl_FragCoord.xy))/uLevels;\n}");
  };
  m.customProgramCacheKey=()=>"kit-retro";
  return m;
}
Kit3D.retro=retro;
Kit3D.mat=function(color,o){o=o||{};
  const m=new THREE.MeshLambertMaterial({color:color??0xffffff,map:o.map||null,emissive:o.emissive??0x000000,transparent:!!o.transparent,side:o.side||THREE.FrontSide});
  return retro(m);};
Kit3D.basic=function(color,o){o=o||{};return retro(new THREE.MeshBasicMaterial({color:color??0xffffff,map:o.map||null,transparent:!!o.transparent,alphaTest:o.alphaTest||0}));};
Kit3D.facet=function(g){const n=g.index?g.toNonIndexed():g;n.computeVertexNormals();return n;};
const mesh=(g,m,flat)=>new THREE.Mesh(flat===false?g:Kit3D.facet(g),m);
Kit3D.mesh=mesh;

/* ---------- tiny pixel textures ---------- */
function nearest(t){t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
Kit3D.tex=function(size,draw,seed){
  const c=document.createElement("canvas");c.width=c.height=size;const g=c.getContext("2d");
  let s=(seed||1)>>>0;const rand=()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  draw(g,size,rand);return nearest(new THREE.CanvasTexture(c));
};
const speckle=(base,dots)=>(g,n,r)=>{g.fillStyle=base;g.fillRect(0,0,n,n);for(let i=0;i<n*n/5;i++){g.fillStyle=dots[Math.floor(r()*dots.length)];g.fillRect(Math.floor(r()*n),Math.floor(r()*n),1,1);}};
Kit3D.TEX={
  grass:()=>Kit3D.tex(16,speckle("#5fbf4a",["#4ea83c","#74d05a","#56b443","#8fdc6a"]),3),
  sand:()=>Kit3D.tex(16,speckle("#f1d58a",["#e5c574","#f8e2a4","#d9b965"]),5),
  water:()=>Kit3D.tex(16,(g,n,r)=>{g.fillStyle="#3aa3e0";g.fillRect(0,0,n,n);g.fillStyle="#6cc4f2";for(let y=2;y<n;y+=5)for(let x=0;x<n;x++)if((x+y*3)%8<3)g.fillRect(x,y,1,1);},7),
  wood:()=>Kit3D.tex(16,(g,n,r)=>{g.fillStyle="#a8703f";g.fillRect(0,0,n,n);g.fillStyle="#8a5a33";for(let x=0;x<n;x+=4)g.fillRect(x,0,1,n);for(let i=0;i<10;i++)g.fillRect(Math.floor(r()*n),Math.floor(r()*n),1,2);},9),
  checker:(a,b,n)=>Kit3D.tex(n||8,(g,s)=>{for(let y=0;y<s;y++)for(let x=0;x<s;x++){g.fillStyle=((x>>1)+(y>>1))%2?(b||"#ffffff"):(a||"#ffd23f");g.fillRect(x,y,1,1);}}),
  stone:()=>Kit3D.tex(16,speckle("#9aa0aa",["#868c96","#b3b8c0","#7b808a"]),11)
};

/* ---------- stage ---------- */
Kit3D.stage=function(o){
  const mount=typeof o.mount==="string"?document.querySelector(o.mount):o.mount;
  const H=o.height||240;
  const r=new THREE.WebGLRenderer({antialias:false,powerPreference:"low-power",alpha:false});
  r.setPixelRatio(1);r.domElement.className="k3d-canvas";
  mount.classList.add("k3d-stage");mount.appendChild(r.domElement);
  const scene=new THREE.Scene();const bg=new THREE.Color(o.bg??0x9fd8ff);scene.background=bg;
  if(o.fog!==false){const f=o.fog||[18,42];scene.fog=new THREE.Fog(bg,f[0],f[1]);}
  const cam=new THREE.PerspectiveCamera(o.fov||50,4/3,0.1,200);
  const hemi=new THREE.HemisphereLight(0xffffff,0x7a6a55,0.75);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffffff,0.75);sun.position.set(5,10,6);scene.add(sun);
  const st={scene,camera:cam,renderer:r,canvas:r.domElement,mount,sun,hemi,width:0,height:H};
  st.resize=function(){const w=mount.clientWidth||640,h=mount.clientHeight||480;const W=Math.max(80,Math.round(H*w/h));
    if(W!==st.width){st.width=W;r.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();U.uSnap.value.set(W/2*(o.snap??1),H/2*(o.snap??1));}};
  st.render=()=>r.render(scene,cam);
  let ro=null;try{ro=new ResizeObserver(()=>st.resize());ro.observe(mount);}catch(e){window.addEventListener("resize",st.resize);}
  st.resize();
  st.dispose=()=>{try{ro&&ro.disconnect();}catch(e){}r.dispose();r.domElement.remove();};
  return st;
};

/* ---------- 30 fps loop; pauses when the tab is hidden or the stage is off screen ---------- */
Kit3D.loop=function(st,fn,fps){
  const step=1/(fps||30);let last=performance.now(),acc=0,t=0,id=0,on=true;
  function frame(now){if(!on)return;id=requestAnimationFrame(frame);
    if(document.hidden||!st.mount.offsetParent){last=now;return;}
    acc+=Math.min(0.25,(now-last)/1000);last=now;if(acc<step)return;
    const dt=acc;acc=0;t+=dt;fn(dt,t);st.render();}
  id=requestAnimationFrame(frame);
  return {stop(){on=false;cancelAnimationFrame(id);},get time(){return t;}};
};

/* ---------- input ---------- */
Kit3D.move=function(){
  const k=new Set();const map={ArrowUp:"u",KeyW:"u",ArrowDown:"d",KeyS:"d",ArrowLeft:"l",KeyA:"l",ArrowRight:"r",KeyD:"r"};
  const dn=e=>{const m=map[e.code];if(!m)return;const t=e.target;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return;k.add(m);if(e.code.startsWith("Arrow"))e.preventDefault();};
  const up=e=>{const m=map[e.code];if(m)k.delete(m);};
  document.addEventListener("keydown",dn);document.addEventListener("keyup",up);window.addEventListener("blur",()=>k.clear());
  return {get x(){return (k.has("r")?1:0)-(k.has("l")?1:0);},get z(){return (k.has("d")?1:0)-(k.has("u")?1:0);},get any(){return k.size>0;},clear(){k.clear();}};
};
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
Kit3D.groundPoint=function(st,e,y){const b=st.canvas.getBoundingClientRect();ndc.set(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1);
  ray.setFromCamera(ndc,st.camera);plane.constant=-(y||0);const p=new THREE.Vector3();return ray.ray.intersectPlane(plane,p)?p:null;};
Kit3D.pick=function(st,e,objects){const b=st.canvas.getBoundingClientRect();ndc.set(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1);
  ray.setFromCamera(ndc,st.camera);const h=ray.intersectObjects(objects,true);return h[0]||null;};
Kit3D.follow=function(cam,target,offset,ease){const want=target.position.clone().add(offset);cam.position.lerp(want,ease??0.12);cam.lookAt(target.position.x,target.position.y+0.8,target.position.z);};

/* ---------- cute critters, built from parts ----------
   const c=Kit3D.critter({kind:"cat"}) or Kit3D.critter({recipe:{...}}); scene.add(c.group)
   each frame: c.update(dt, speed01). Actions: c.hop(), c.spin() (dizzy), c.cheer(), c.face(angle).
   A recipe is plain data, so a new character is ONE entry in Kit3D.CRITTERS, for example
     shiba:{name:["Shiba","しば犬"], c:[18,5,6], ears:"cat", mouth:"snout", tail:"curl"}
   c = [main, belly, accent] colors: positions in Kit3D.PALETTE (or 0xRRGGBB numbers).
   Every other key is a part name from Kit3D.PARTS; leave a key out for "none" (body: "round", eyes: "dot").
   Kit3D.critterFields + Kit3D.recipeToCode/recipeFromCode turn a recipe into numbers for a critter code.
   PALETTE and every PARTS list are only ever ADDED to at the end: critter codes store positions,
   so reordering would change students' saved critters. */
Kit3D.PALETTE=[0xffa860,0xf4f0ff,0xb07a4f,0x7fd36b,0xffd84a,0xffffff,0x2a2630,0x9aa0aa,
  0xff9db5,0xe8483f,0x5aa0ff,0x9fe0ff,0xa77bff,0xd6c2ff,0x9fefd0,0x2fb5a5,
  0x34407a,0xffd2b0,0xe0b07a,0x6b4a33,0xffc23a,0xc6f26b,0xe85ab0,0xfff3a0];
Kit3D.PARTS={
  body:["round","tall","chubby","tiny"],
  ears:["none","cat","bunny","bear","fox","pointy","floppy","mouse","frills"],
  eyes:["dot","sparkle","sleepy","happy","big","angry","shades","frog"],
  cheeks:["none","pink","red","accent"],
  mouth:["none","smile","cat","beak","fang","tongue","snout"],
  tail:["none","cat","puff","zigzag","fox","dragon","curl","fish"],
  back:["none","wings","bat","shell","spikes","cape","leaf"],
  head:["none","horn","horns","antenna","sprout","flame","crest","halo","tuft"],
  pattern:["none","stripes","spots","mask","panda","socks","tips"],
  hat:["none","cap","crown","party","bow","straw","wizard","headband","flower"]
};
/* English + Japanese names for the Critter Maker buttons */
Kit3D.PART_NAMES={
  body:["Body","からだ"],ears:["Ears","耳"],eyes:["Eyes","目"],cheeks:["Cheeks","ほっぺ"],mouth:["Mouth","口"],tail:["Tail","しっぽ"],
  back:["Back","せなか"],head:["Head","あたま"],pattern:["Pattern","もよう"],hat:["Hat","ぼうし"]
};
Kit3D.CRITTERS={
  cat:    {name:["Cat","ネコ"],        c:[0,17,8],  ears:"cat",   mouth:"cat",   cheeks:"pink", tail:"cat"},
  bunny:  {name:["Bunny","ウサギ"],    c:[1,5,8],   ears:"bunny", cheeks:"pink", tail:"puff"},
  bear:   {name:["Bear","クマ"],       c:[2,18,6],  ears:"bear",  mouth:"snout", cheeks:"pink"},
  frog:   {name:["Frog","カエル"],     c:[3,21,6],  eyes:"frog",  mouth:"smile", cheeks:"pink"},
  chick:  {name:["Chick","ヒヨコ"],    c:[4,23,20], mouth:"beak", head:"tuft",   cheeks:"pink"},
  shiba:  {name:["Shiba","しば犬"],    c:[0,5,6],   ears:"cat",   mouth:"snout", tail:"curl", body:"chubby"},
  panda:  {name:["Panda","パンダ"],    c:[5,5,6],   ears:"bear",  mouth:"snout", pattern:"panda", body:"chubby"},
  penguin:{name:["Penguin","ペンギン"],c:[16,5,20], mouth:"beak", cheeks:"pink", pattern:"socks", body:"tall"},
  tanuki: {name:["Tanuki","タヌキ"],   c:[19,18,6], ears:"bear",  mouth:"snout", pattern:"mask", tail:"fox", head:"sprout"},
  dragon: {name:["Dragon","ドラゴン"], c:[12,23,20],eyes:"sparkle",mouth:"fang", tail:"dragon", back:"bat", head:"horns"}
};
const PART_KEYS=["ears","eyes","cheeks","mouth","tail","back","head","pattern","hat"];
Kit3D.critterFields=[{k:"body",n:8},{k:"c0",n:32},{k:"c1",n:32},{k:"c2",n:32},{k:"ears",n:16},{k:"eyes",n:16},{k:"cheeks",n:8},
  {k:"mouth",n:16},{k:"tail",n:16},{k:"back",n:16},{k:"head",n:16},{k:"pattern",n:16},{k:"hat",n:32}];
Kit3D.recipeToCode=function(r){const o={body:Math.max(0,Kit3D.PARTS.body.indexOf(r.body||"round"))};
  [0,1,2].forEach(i=>{const v=(r.c||[])[i];o["c"+i]=typeof v==="number"&&v<Kit3D.PALETTE.length?v:Math.max(0,Kit3D.PALETTE.indexOf(v));});
  PART_KEYS.forEach(k=>o[k]=Math.max(0,Kit3D.PARTS[k].indexOf(r[k]||(k==="eyes"?"dot":"none"))));return o;};
Kit3D.recipeFromCode=function(o){const r={body:Kit3D.PARTS.body[o.body]||"round",c:[0,1,2].map(i=>Math.min(o["c"+i]||0,Kit3D.PALETTE.length-1))};
  PART_KEYS.forEach(k=>r[k]=Kit3D.PARTS[k][o[k]]||(k==="eyes"?"dot":"none"));return r;};

Kit3D.critter=function(o){
  o=o||{};const kind=o.kind||"cat";
  const R=Object.assign({},o.recipe||Kit3D.CRITTERS[kind]||Kit3D.CRITTERS.cat);
  const color=v=>new THREE.Color(typeof v==="number"&&v<Kit3D.PALETTE.length?Kit3D.PALETTE[v]:(v??0xffa860));
  const cc=R.c||[];const col=o.color!=null?new THREE.Color(o.color):color(cc[0]??0);
  const bellyC=cc[1]!=null?color(cc[1]):col.clone().lerp(new THREE.Color(0xffffff),0.55),acc=cc[2]!=null?color(cc[2]):new THREE.Color(0x2a2630);
  const dark=col.clone().multiplyScalar(0.7),pat=R.pattern||"none";
  const M=Kit3D.mat(col),Ml=Kit3D.mat(bellyC),Md=Kit3D.mat(dark),Ma=Kit3D.mat(acc),Mk=Kit3D.basic(0x1a1420),Mw=Kit3D.basic(0xffffff),Mp=Kit3D.basic(0xff9db5);
  const Mg=Kit3D.mat(0xffc23a),Mr=Kit3D.mat(0xe8483f),Mo=Kit3D.mat(0xff8a2a);
  const group=new THREE.Group(),rig=new THREE.Group(),body=new THREE.Group();group.add(rig);rig.add(body);
  const add=(parent,g,m,x,y,z,sx,sy,sz)=>{const me=mesh(g,m);me.position.set(x,y,z);if(sx)me.scale.set(sx,sy??sx,sz??sx);parent.add(me);return me;};
  const S=(r,w,h)=>new THREE.SphereGeometry(r,w||8,h||6),Cone=(r,h,s)=>new THREE.ConeGeometry(r,h,s||4),Cyl=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||5);
  /* body shape: the round "mochi" body is scaled; everything on its surface lives in `shell`, scaled the same way */
  const BS={round:[1,1,1],tall:[0.92,1.2,0.95],chubby:[1.14,0.9,1.1],tiny:[0.86,0.86,0.86]}[R.body]||[1,1,1];
  add(body,S(0.62),M,0,0.62,0,BS[0],0.92*BS[1],0.95*BS[2]);
  const shell=new THREE.Group();shell.position.y=0.62;shell.scale.set(BS[0],BS[1],BS[2]);body.add(shell);
  const sadd=(g,m,x,y,z,sx,sy,sz)=>add(shell,g,m,x,y-0.62,z,sx,sy,sz);
  /* a flat patch stuck on the body surface, pointing outward (spots, stripes, masks) */
  const patch=(dx,dy,dz,r,m,sx,sy)=>{const v=new THREE.Vector3(dx,dy,dz).normalize();const p=sadd(S(r,6,4),m,v.x*0.62,0.62+v.y*0.57,v.z*0.59,sx||1,sy||1,0.35);
    p.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v);return p;};
  if(String(cc[1])!==String(cc[0]))sadd(S(0.4,8,5),Ml,0,0.48,0.3,1,0.85,0.6);              /* tummy */
  /* eyes */
  const eyes=new THREE.Group();shell.add(eyes);eyes.position.y=0.78-0.62;
  const eadd=(g,m,x,y,z,sx,sy,sz)=>add(eyes,g,m,x,y-0.78,z,sx,sy,sz);
  const E=R.eyes||"dot";let blinks=true;
  if(pat==="mask"||pat==="panda"){[-1,1].forEach(s=>patch(s*0.36,0.3,1,0.15,Ma,1.1,1.3));}
  if(E==="frog"){blinks=false;[-1,1].forEach(s=>sadd(S(0.17,6,4),M,s*0.24,1.08,0.15));eadd(S(0.085,6,4),Mk,-0.24,1.12,0.3);eadd(S(0.085,6,4),Mk,0.24,1.12,0.3);
    eadd(S(0.03,4,3),Mw,-0.21,1.16,0.36);eadd(S(0.03,4,3),Mw,0.27,1.16,0.36);}
  else if(E==="sparkle"){[-1,1].forEach(s=>{eadd(S(0.12,6,5),Mk,s*0.21,0.78,0.52,0.85,1.15,0.5);eadd(S(0.045,4,3),Mw,s*0.21-0.03,0.84,0.58);eadd(S(0.022,4,3),Mw,s*0.21+0.04,0.73,0.58);});}
  else if(E==="sleepy"){blinks=false;[-1,1].forEach(s=>eadd(new THREE.BoxGeometry(0.17,0.035,0.04),Mk,s*0.2,0.76,0.56));}
  else if(E==="happy"){blinks=false;[-1,1].forEach(s=>[-1,1].forEach(t=>{const b=eadd(new THREE.BoxGeometry(0.1,0.035,0.04),Mk,s*0.2+t*0.035,0.79,0.56);b.rotation.z=t*0.6;}));}
  else if(E==="big"){[-1,1].forEach(s=>{eadd(S(0.14,8,6),Mw,s*0.21,0.8,0.5,1,1.1,0.6);eadd(S(0.075,6,4),Mk,s*0.21,0.78,0.58);eadd(S(0.025,4,3),Mw,s*0.21+0.02,0.81,0.63);});}
  else if(E==="shades"){blinks=false;[-1,1].forEach(s=>eadd(new THREE.BoxGeometry(0.22,0.12,0.05),Mk,s*0.19,0.79,0.56));eadd(new THREE.BoxGeometry(0.2,0.03,0.04),Mk,0,0.82,0.57);}
  else{[-1,1].forEach(s=>{eadd(S(0.085,6,4),Mk,s*0.2,0.78,0.53);eadd(S(0.03,4,3),Mw,s*0.2+0.03,0.82,0.6);});
    if(E==="angry")[-1,1].forEach(s=>{const b=eadd(new THREE.BoxGeometry(0.16,0.035,0.04),Mk,s*0.2,0.9,0.53);b.rotation.z=s*0.4;});}
  /* cheeks */
  const CH={pink:Mp,red:Kit3D.basic(0xe8483f),accent:Kit3D.basic(acc.getHex())}[R.cheeks];
  if(CH)[-1,1].forEach(s=>sadd(new THREE.CircleGeometry(R.cheeks==="red"?0.1:0.08,6),CH,s*0.36,0.64,0.47).lookAt(s*1.2,0.64,1.6));
  /* mouth */
  const mo=R.mouth||"none";
  if(mo==="cat")sadd(S(0.07,5,4),Mp,0,0.68,0.6);
  if(mo==="smile"){const m=sadd(new THREE.TorusGeometry(0.06,0.018,3,6,Math.PI),Mk,0,0.68,0.585);m.rotation.z=Math.PI;}
  if(mo==="beak"){const b=sadd(Cone(0.1,0.22),Mo,0,0.68,0.66);b.rotation.x=Math.PI/2;}
  if(mo==="fang"){sadd(new THREE.BoxGeometry(0.12,0.025,0.03),Mk,0,0.66,0.59);const f=sadd(Cone(0.03,0.08,3),Mw,0.04,0.625,0.6);f.rotation.x=Math.PI;}
  if(mo==="tongue"){sadd(S(0.06,6,4),Mk,0,0.66,0.57,1,0.7,0.5);sadd(S(0.045,5,3),Mp,0,0.62,0.6,1,0.8,0.6);}
  if(mo==="snout"){sadd(S(0.17,6,4),Ml,0,0.62,0.55,1,0.75,0.6);sadd(S(0.05,5,3),Mk,0,0.67,0.67);}
  /* pattern on the body */
  const tipsOn=pat==="tips";
  if(pat==="stripes")[[0,1,-0.2],[0.5,0.8,-0.4],[-0.5,0.8,-0.4],[0.8,0.2,-0.4],[-0.8,0.2,-0.4]].forEach(([x,y,z])=>patch(x,y,z,0.16,Ma,1.6,0.45));
  if(pat==="spots")[[0.5,0.5,-0.6],[-0.6,0.2,-0.5],[0.1,0.9,-0.4],[-0.3,-0.1,-0.9],[0.8,-0.1,0.1],[-0.8,0.3,0.2]].forEach(([x,y,z])=>patch(x,y,z,0.13,Ma));
  /* ears (on top of the head) */
  const ear=R.ears||"none",EM=pat==="panda"?Ma:M,tip=(e,h,r)=>{if(tipsOn){const t=add(e,Cone(r*0.52,h*0.4,4),Ma,0,h*0.31,0);t.scale.set(1.02,1,1.02);}};
  if(ear==="cat")[-1,1].forEach(s=>{const e=sadd(Cone(0.17,0.32),EM,s*0.32,1.17,0);e.rotation.z=-s*0.35;tip(e,0.32,0.17);});
  if(ear==="fox")[-1,1].forEach(s=>{const e=sadd(Cone(0.22,0.5),EM,s*0.33,1.25,-0.02);e.rotation.z=-s*0.3;tip(e,0.5,0.22);});
  if(ear==="pointy")[-1,1].forEach(s=>{const e=sadd(Cone(0.12,0.62),EM,s*0.3,1.4,-0.02);e.rotation.z=-s*0.45;tip(e,0.62,0.12);});
  if(ear==="bunny")[-1,1].forEach(s=>{const e=sadd(S(0.13,6,4),EM,s*0.2,1.38,-0.05,0.8,2.4,0.6);e.rotation.z=-s*0.15;
    sadd(S(0.08,6,4),tipsOn?Ma:Mp,s*0.2,1.38,0.01,0.7,2.2,0.3).rotation.z=-s*0.15;});
  if(ear==="bear")[-1,1].forEach(s=>sadd(S(0.16,6,4),EM,s*0.36,1.1,0,1,1,0.6));
  if(ear==="mouse")[-1,1].forEach(s=>{const e=sadd(Cyl(0.27,0.27,0.06,8),EM,s*0.42,1.18,-0.05);e.rotation.x=Math.PI/2;e.rotation.z=s*0.3;
    const i=sadd(Cyl(0.17,0.17,0.07,8),tipsOn?Ma:Mp,s*0.42,1.18,-0.03);i.rotation.x=Math.PI/2;i.rotation.z=s*0.3;});
  if(ear==="floppy")[-1,1].forEach(s=>{const e=sadd(S(0.16,6,4),pat==="tips"?Ma:Md,s*0.56,0.86,0,0.55,1.5,0.9);e.rotation.z=s*0.35;});
  if(ear==="frills")[-1,1].forEach(s=>[0,1,2].forEach(i=>{const f=sadd(Cone(0.06,0.34,4),Mp,s*(0.6+i*0.02),0.95+i*0.14-0.14,-0.05);f.rotation.z=-s*(1.1-i*0.35);}));
  /* tail (behind) */
  const tl=R.tail||"none",tails=[];
  if(tl==="cat"){const t=sadd(Cyl(0.05,0.07,0.6),M,0,0.45,-0.62);t.rotation.x=-0.9;tails.push(t);if(tipsOn)sadd(S(0.08,5,4),Ma,0,0.68,-0.85);}
  if(tl==="puff")sadd(S(0.18,6,4),pat==="none"?Mw:Ma,0,0.35,-0.6);
  if(tl==="zigzag"){const z=new THREE.Group();shell.add(z);z.position.set(0,0.35-0.62,-0.55);tails.push(z);
    [[0,0,0.1,0.3,0.6],[0.12,0.28,-0.12,0.32,-0.7],[0.02,0.55,-0.25,0.42,0.7]].forEach(([x,y,zz,h,r],i)=>{const b=add(z,new THREE.BoxGeometry(0.1,h,0.22),i===0&&tipsOn?Ma:M,x,y,zz-0.1);b.rotation.z=r;});}
  if(tl==="fox"){const t=sadd(S(0.2,6,4),M,0,0.42,-0.75,0.9,0.9,2.1);t.rotation.x=-0.6;tails.push(t);sadd(S(0.12,5,4),pat==="none"?Mw:Ma,0,0.62,-1.05,1,1,1.4);}
  if(tl==="dragon"){const t=sadd(Cone(0.18,0.8,5),M,0,0.25,-0.75);t.rotation.x=-1.9;tails.push(t);const f=sadd(Cone(0.12,0.2,3),Ma,0,0.12,-1.12);f.rotation.x=-1.9;}
  if(tl==="curl"){const t=sadd(new THREE.TorusGeometry(0.16,0.07,4,7),M,0,0.85,-0.55);t.rotation.y=Math.PI/2;tails.push(t);}
  if(tl==="fish"){const t=sadd(Cone(0.22,0.3,3),Ma,0,0.3,-0.72);t.rotation.x=-Math.PI/2;t.scale.z=0.3;tails.push(t);}
  /* back */
  const bk=R.back||"none",wings=[];
  if(bk==="wings")[-1,1].forEach(s=>{const w=new THREE.Group();shell.add(w);w.position.set(s*0.3,0.85-0.62,-0.45);add(w,S(0.2,6,4),Mw,s*0.25,0.08,-0.05,1.6,0.9,0.3);wings.push([w,s]);});
  if(bk==="bat")[-1,1].forEach(s=>{const w=new THREE.Group();shell.add(w);w.position.set(s*0.3,0.85-0.62,-0.45);const m=add(w,Cone(0.26,0.6,3),Ma,s*0.3,0.05,-0.05);m.rotation.z=-s*1.3;m.scale.z=0.25;wings.push([w,s]);});
  if(bk==="shell")sadd(S(0.5,8,5),Ma,0,0.6,-0.32,1.05,1,0.6);
  if(bk==="spikes")[0,1,2].forEach(i=>{const c=sadd(Cone(0.1,0.25,4),Ma,0,1.1-i*0.27,-0.18-i*0.22);c.rotation.x=-0.5-i*0.45;});
  if(bk==="cape"){const c=sadd(new THREE.BoxGeometry(0.9,0.8,0.04),Mr,0,0.55,-0.62);c.rotation.x=0.15;}
  if(bk==="leaf"){const l=sadd(S(0.35,6,4),Kit3D.mat(0x3f9e4a),0,0.95,-0.45,1,0.25,1.3);l.rotation.x=-0.5;}
  /* on the head */
  const hd=R.head||"none",sway=[];
  if(hd==="horn"){sadd(Cone(0.08,0.4,5),Mg,0,1.3,0.2).rotation.x=0.3;}
  if(hd==="horns")[-1,1].forEach(s=>{const h=sadd(Cone(0.07,0.3,4),Mg,s*0.22,1.22,0.05);h.rotation.z=-s*0.5;});
  if(hd==="antenna")[-1,1].forEach(s=>{const a=sadd(Cyl(0.015,0.015,0.4,3),Mk,s*0.15,1.32,0.05);a.rotation.z=-s*0.35;sadd(S(0.07,5,4),Ma,s*0.22,1.5,0.05);});
  if(hd==="sprout"){const g=new THREE.Group();shell.add(g);g.position.y=1.15-0.62;add(g,Cyl(0.02,0.02,0.2,3),Kit3D.mat(0x3f9e4a),0,0.1,0);
    [-1,1].forEach(s=>{const l=add(g,S(0.1,5,3),Kit3D.mat(0x6ad15a),s*0.1,0.22,0,1,0.35,0.6);l.rotation.z=s*0.4;});sway.push(g);}
  if(hd==="flame"){const g=new THREE.Group();shell.add(g);g.position.y=1.12-0.62;add(g,Cone(0.17,0.45,5),Mo,0,0.2,0);add(g,Cone(0.1,0.3,5),Kit3D.mat(0xffd84a),0,0.17,0.06);sway.push(g);}
  if(hd==="crest")[0,1,2].forEach(i=>sadd(Cone(0.08,0.26,4),Ma,0,1.2-i*0.04,0.15-i*0.18).rotation.x=-0.2-i*0.2);
  if(hd==="halo"){const h=sadd(new THREE.TorusGeometry(0.28,0.04,4,10),Mg,0,1.45,0);h.rotation.x=Math.PI/2;sway.push(h);}
  if(hd==="tuft")sadd(Cone(0.08,0.22),M,0,1.28,0).rotation.z=0.3;
  /* hat */
  const ht=R.hat||"none";
  if(ht==="cap"){sadd(S(0.4,8,4,),Ma,0,1.08,0,1,0.55,1);const b=sadd(Cyl(0.32,0.32,0.04,8),Ma,0,1.08,0.32,1,1,0.8);}
  if(ht==="crown"){sadd(Cyl(0.24,0.24,0.14,8),Mg,0,1.25,0);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;sadd(Cone(0.06,0.16,4),Mg,Math.sin(a)*0.2,1.38,Math.cos(a)*0.2);}sadd(S(0.05,4,3),Mr,0,1.25,0.24);}
  if(ht==="party"){sadd(Cone(0.2,0.5,6),Kit3D.mat(0xffffff,{map:Kit3D.TEX.checker("#ff6fa8","#ffd84a",8)}),0.08,1.42,0).rotation.z=-0.2;sadd(S(0.06,4,3),Mg,0.18,1.68,0);}
  if(ht==="bow")[-1,1].forEach(s=>{const b=sadd(Cone(0.12,0.24,4),Ma,0.3+s*0.12,1.17,0.05);b.rotation.z=s*Math.PI/2;});
  if(ht==="straw"){sadd(Cyl(0.55,0.55,0.04,10),Kit3D.mat(0xe8c870),0,1.12,0);sadd(Cyl(0.3,0.32,0.22,8),Kit3D.mat(0xe8c870),0,1.22,0);sadd(Cyl(0.325,0.325,0.07,8),Mr,0,1.16,0);}
  if(ht==="wizard"){sadd(Cyl(0.5,0.5,0.04,10),Kit3D.mat(0x34407a),0,1.12,0);sadd(Cone(0.3,0.75,6),Kit3D.mat(0x34407a),0,1.5,-0.05).rotation.x=-0.15;}
  if(ht==="headband"){const h=sadd(new THREE.TorusGeometry(0.56,0.05,4,12),Mw,0,0.98,0,1,1,1);h.rotation.x=Math.PI/2;h.scale.set(1.05,1.02,1);sadd(S(0.07,6,4),Mr,0,1.0,0.6,1,1,0.4);}
  if(ht==="flower"){const g=new THREE.Group();shell.add(g);g.position.set(0.3,1.1-0.62,0.15);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;add(g,S(0.07,4,3),Mp,Math.cos(a)*0.09,Math.sin(a)*0.09,0);}add(g,S(0.05,4,3),Mg,0,0,0.03);}
  /* arms + feet */
  const LM=pat==="panda"?Ma:M,FM=(pat==="panda"||pat==="socks")?Ma:Md;
  const armL=add(body,S(0.13,6,4),LM,-0.58*BS[0],0.5,0.1),armR=add(body,S(0.13,6,4),LM,0.58*BS[0],0.5,0.1);
  const footL=add(rig,S(0.17,6,4),FM,-0.25,0.08,0.12,1,0.55,1.3),footR=add(rig,S(0.17,6,4),FM,0.25,0.08,0.12,1,0.55,1.3);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(0.62*BS[0],10),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.22,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=0.02;group.add(shadow);
  let t=0,hopT=-1,spinT=-1,cheerT=-1,walk=0,blink=2;
  const api={group,kind,recipe:R,
    hop(){if(hopT<0)hopT=0;},spin(){spinT=0;},cheer(){cheerT=0;hopT=0;},
    face(a){const d=((a-rig.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;rig.rotation.y+=d*0.25;},
    get busy(){return spinT>=0;},
    update(dt,speed){t+=dt;speed=Math.min(1,speed||0);walk+=dt*speed*14;
      const bob=Math.sin(t*3)*0.03*(1-speed);
      body.position.y=bob+Math.abs(Math.sin(walk))*0.08*speed;body.rotation.z=Math.sin(walk)*0.1*speed;
      body.scale.set(1+bob*0.6,1-bob,1+bob*0.6);
      footL.position.z=0.12+Math.sin(walk)*0.22*speed;footR.position.z=0.12-Math.sin(walk)*0.22*speed;
      armL.position.y=0.5+Math.sin(walk)*0.06*speed;armR.position.y=0.5-Math.sin(walk)*0.06*speed;
      if(cheerT>=0){cheerT+=dt;const k=cheerT/0.9;armL.position.y=armR.position.y=k<1?0.5+Math.sin(k*Math.PI)*0.45:0.5;if(k>=1)cheerT=-1;}
      if(blinks){blink-=dt;const sc=blink<0?0.15:1;eyes.scale.y=sc;if(blink<-0.12)blink=2+Math.random()*3;}
      wings.forEach(([w,s])=>w.rotation.y=s*(0.25+Math.sin(t*(speed?10:3))*0.25));
      tails.forEach(tt=>tt.rotation.y=Math.sin(t*2.5)*0.25);
      sway.forEach(g=>g.rotation.z=Math.sin(t*2)*0.12);
      if(hopT>=0){hopT+=dt;const k=hopT/0.5;rig.position.y=k<1?Math.sin(k*Math.PI)*0.9:0;if(k>=1)hopT=-1;}
      if(spinT>=0){spinT+=dt;const k=spinT/1.4;body.rotation.y=k<1?k*Math.PI*4:0;if(k>=1)spinT=-1;}
      shadow.scale.setScalar(1-rig.position.y*0.3);}
  };
  if(o.scale)group.scale.setScalar(o.scale);
  return api;
};

/* ---------- signs, scenery ---------- */
/* Kit3D.sign("🍎"), Kit3D.sign("apple",{text:true}), or Kit3D.sign("apple") when Kit.pics has a drawn "apple". The picture is drawn small so it looks like pixel art. */
Kit3D.sign=function(content,o){
  o=o||{};const g=new THREE.Group(),px=o.px||40;
  const c=document.createElement("canvas");c.width=c.height=px;const x=c.getContext("2d");
  x.fillStyle="#fffaf0";x.fillRect(0,0,px,px);x.strokeStyle="#3b2a1a";x.lineWidth=2;x.strokeRect(1,1,px-2,px-2);
  x.textAlign="center";x.textBaseline="middle";x.fillStyle="#1b1a17";
  if(o.text){let fs=Math.floor(px*0.42);x.font=`700 ${fs}px Andika, sans-serif`;while(x.measureText(content).width>px-6&&fs>8){fs--;x.font=`700 ${fs}px Andika, sans-serif`;}x.fillText(content,px/2,px/2+1);}
  else if(window.Kit&&Kit.pics&&Kit.pics.has(content)){x.imageSmoothingEnabled=false;x.drawImage(Kit.pics.canvas(content,32),4,4,px-8,px-8);}
  else{x.font=`${Math.floor(px*0.66)}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif`;x.fillText(content,px/2,px/2+2);}
  const tex=nearest(new THREE.CanvasTexture(c));
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,fog:true}));const s=o.size||1.4;sp.scale.set(s,s,1);sp.position.y=(o.height||1.6)+s/2;g.add(sp);
  const post=mesh(new THREE.CylinderGeometry(0.07,0.09,(o.height||1.6)+0.2,5),Kit3D.mat(0x8a5a33));post.position.y=((o.height||1.6)+0.2)/2;g.add(post);
  g.userData.sprite=sp;return g;
};
Kit3D.tree=function(o){o=o||{};const g=new THREE.Group(),h=o.h||1;
  const trunk=mesh(new THREE.CylinderGeometry(0.15*h,0.2*h,0.9*h,5),Kit3D.mat(0x8a5a33));trunk.position.y=0.45*h;g.add(trunk);
  [[1.1,1.1,1.2],[0.85,0.9,1.85],[0.55,0.7,2.4]].forEach(([r,hh,y])=>{const c=mesh(new THREE.ConeGeometry(r*h,hh*h,6),Kit3D.mat(o.color??0x3f9e4a));c.position.y=y*h;c.rotation.y=Math.random();g.add(c);});
  return g;};
Kit3D.rock=function(o){o=o||{};const m=mesh(new THREE.DodecahedronGeometry(o.r||0.5,0),Kit3D.mat(0x9aa0aa));m.scale.y=0.7;m.position.y=(o.r||0.5)*0.3;m.rotation.y=Math.random()*3;return m;};

window.Kit3D=Kit3D;
})();
