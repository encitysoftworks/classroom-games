/* =====================================================================
   CLASSROOM GAME KIT  ·  PICTURES ADD-ON  v1
   Small pixel-art pictures drawn in code, used instead of emoji so every word has its own clear picture
   (emoji look different on every computer, and some words shared one: hello / goodbye were both a waving hand).
   Optional. A game that wants it has a script tag after the kit script holding the two markers
   KIT:PICS START and KIT:PICS END (written as comments); update-kit.py copies this file between them.
   Everything lives on Kit.pics:
     Kit.pics.has("apple")                  is there a picture for this word (or sprite name)?
     Kit.pics.canvas("apple", 64)           a <canvas> with the picture, size x size pixels (crisp pixels)
     Kit.pics.url("apple", 64)              a data: URL for <img src>
     Kit.pics.img("apple", 32, "alt")       '<img ...>' HTML (empty string if there is no picture)
     Kit.pics.add("koala", p=>{...})        add your own picture (see the drawing helpers below)
   Words are matched by their English text, lower case. Game sprites (seagull, shell, chest...) use names
   that start with "ui:" or "trap:".
   Every picture is drawn on a 32 x 32 grid with simple shapes, then edges are made crisp so it looks
   like pixel art. Keep pictures simple, like a diagram: one idea per picture, no tiny details,
   and make look-alike words clearly different (hello = two people meeting, goodbye = walking away).
   ===================================================================== */
(function(){
"use strict";
const Kit=window.Kit||(window.Kit={});
const O="#2b2118";                                         /* outline */
const C={skin:"#ffd6b0",hair:"#3a2a20",red:"#e8483f",blue:"#4a8fe8",yellow:"#ffd23f",green:"#55b84a",orange:"#ff9a3c",
  purple:"#9b6be0",pink:"#ff8fb8",white:"#ffffff",black:"#2a2630",brown:"#9a6338",grey:"#9aa0aa",sky:"#bfe6ff",
  night:"#2c3566",wood:"#c08850",paper:"#fffaf0",gold:"#ffc23a",dark:"#5a4636",leaf:"#3fae4a",water:"#5ab4f0",cream:"#fff3d6"};

/* ---------- drawing helpers. A picture is p=>{ ... } using these on the 32 x 32 grid ---------- */
function pen(g){
  const fs=(c,o,w)=>{if(c){g.fillStyle=c;g.fill();}if(o!==null&&o!==false){g.strokeStyle=o||O;g.lineWidth=w||1;g.stroke();}};
  const p={g,C,
    bg(c){p._bg=c;g.fillStyle=c;g.fillRect(0,0,32,32);},
    rect(x,y,w,h,c,o,lw){g.beginPath();g.rect(x+0.5,y+0.5,w-1,h-1);fs(c,o,lw);},
    rrect(x,y,w,h,r,c,o){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();fs(c,o);},
    circ(x,y,r,c,o,lw){g.beginPath();g.arc(x,y,r,0,Math.PI*2);fs(c,o,lw);},
    ell(x,y,rx,ry,c,o,rot){g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);fs(c,o);},
    arc(x,y,r,a0,a1,c,w){g.beginPath();g.arc(x,y,r,a0,a1);g.strokeStyle=c||O;g.lineWidth=w||1;g.stroke();},
    pie(x,y,r,a0,a1,c,o){g.beginPath();g.moveTo(x,y);g.arc(x,y,r,a0,a1);g.closePath();fs(c,o);},
    poly(pts,c,o,lw){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();fs(c,o,lw);},
    line(pts,c,w){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.strokeStyle=c||O;g.lineWidth=w||1;g.lineCap="round";g.lineJoin="round";g.stroke();},
    text(s,x,y,size,c,o){g.font=`900 ${size||10}px "Arial Black",Arial,sans-serif`;g.textAlign="center";g.textBaseline="middle";
      if(o){g.lineWidth=2.5;g.strokeStyle=o;g.strokeText(s,x,y);}g.fillStyle=c||O;g.fillText(s,x,y);},
    dot(x,y,c){g.fillStyle=c||O;g.fillRect(Math.round(x),Math.round(y),1,1);},
    /* --- bigger pieces --- */
    /* a face. mood: smile grin sad angry sleepy tired sick star yum cool laugh wow calm hungry */
    face(x,y,r,mood,skin){p.circ(x,y,r,skin||C.skin);const e=r*0.38,ey=y-r*0.15,m=y+r*0.42;
      const eyes=k=>{if(k==="closed"){p.line([x-e-1.5,ey,x-e+1.5,ey]);p.line([x+e-1.5,ey,x+e+1.5,ey]);}
        else if(k==="happy"){p.line([x-e-1.5,ey+0.8,x-e,ey-0.8,x-e+1.5,ey+0.8]);p.line([x+e-1.5,ey+0.8,x+e,ey-0.8,x+e+1.5,ey+0.8]);}
        else if(k==="star"){p.star(x-e,ey,2.2,C.yellow,O);p.star(x+e,ey,2.2,C.yellow,O);}
        else if(k==="x"){p.line([x-e-1,ey-1,x-e+1,ey+1]);p.line([x-e+1,ey-1,x-e-1,ey+1]);p.line([x+e-1,ey-1,x+e+1,ey+1]);p.line([x+e+1,ey-1,x+e-1,ey+1]);}
        else{p.circ(x-e,ey,r*0.12+0.4,O,null);p.circ(x+e,ey,r*0.12+0.4,O,null);}};
      const mood_=mood||"smile";
      if(mood_==="smile"||mood_==="calm"){eyes();p.arc(x,m-r*0.25,r*0.32,0.3,Math.PI-0.3,O,1);}
      if(mood_==="grin"||mood_==="laugh"||mood_==="star"){eyes(mood_==="star"?"star":"happy");p.pie(x,m-r*0.2,r*0.38,0,Math.PI,"#c0392b");}
      if(mood_==="sad"){eyes();p.arc(x,m+r*0.15,r*0.3,Math.PI+0.4,-0.4,O,1);p.ell(x+e+0.5,ey+3,0.8,1.6,C.water,null);}
      if(mood_==="angry"){eyes();p.line([x-e-2,ey-3,x-e+1.5,ey-1.5]);p.line([x+e+2,ey-3,x+e-1.5,ey-1.5]);p.arc(x,m+r*0.15,r*0.3,Math.PI+0.4,-0.4,O,1);}
      if(mood_==="sleepy"){eyes("closed");p.circ(x,m,r*0.16,"#7a2a20");}
      if(mood_==="tired"){eyes("closed");p.line([x-r*0.3,m,x-r*0.1,m-1,x+r*0.1,m,x+r*0.3,m-1]);p.ell(x+r*0.9,y-r*0.5,0.9,1.6,C.water,null);}
      if(mood_==="sick"){eyes("closed");p.line([x-r*0.3,m,x+r*0.3,m]);}
      if(mood_==="yum"){eyes("happy");p.arc(x,m-r*0.25,r*0.3,0.3,Math.PI-0.3,O,1);p.ell(x+r*0.2,m+0.5,1,1.3,C.pink,null);}
      if(mood_==="cool"){p.rect(x-r*0.85,ey-2,r*1.7,3.5,O,null);p.arc(x,m-r*0.25,r*0.3,0.3,Math.PI-0.3,O,1);}
      if(mood_==="wow"){eyes();p.circ(x,m,r*0.2,"#7a2a20");}
      if(mood_==="hungry"){eyes();p.ell(x,m,r*0.22,r*0.12,"#7a2a20");}
      if(mood_==="laugh"){p.ell(x-e-2,ey+1,0.8,1.5,C.water,null);p.ell(x+e+2,ey+1,0.8,1.5,C.water,null);}
      if(mood_!=="angry"&&mood_!=="sick"&&mood_!=="cool")p.cheeks(x,y,r);},
    cheeks(x,y,r){p.circ(x-r*0.62,y+r*0.25,r*0.14+0.3,"#ff9db5",null);p.circ(x+r*0.62,y+r*0.25,r*0.14+0.3,"#ff9db5",null);},
    /* a small person. o: {shirt, pants, wave:"l"|"r"|"both", hair, mood, walk, s (size), hold:"l"|"r" hand position returned} */
    kid(x,y,o){o=o||{};const s=o.s||1,sh=o.shirt||C.blue,pa=o.pants||"#3a4a7a";
      const lx=x-2.5*s,rx=x+0.5*s,ly=y+13*s;
      if(o.walk){p.line([x-1*s,y+12*s,x-3.5*s,y+17*s],pa,2.4*s);p.line([x+1*s,y+12*s,x+3.5*s,y+17*s],pa,2.4*s);}
      else{p.rect(lx,ly-1*s,2.2*s,5*s,pa,O);p.rect(rx,ly-1*s,2.2*s,5*s,pa,O);}
      const arm=(side,up)=>{const sx=x+side*4*s,sy=y+6.5*s,ex=up?x+side*7.5*s:x+side*5.5*s,ey=up?y+0.5*s:y+11*s;p.line([sx,sy,ex,ey],sh,2.4*s);p.circ(ex,ey,1.3*s,C.skin);return [ex,ey];};
      const hands={};
      hands.l=arm(-1,o.wave==="l"||o.wave==="both");hands.r=arm(1,o.wave==="r"||o.wave==="both");
      p.rrect(x-4*s,y+4.5*s,8*s,8.5*s,2*s,sh,O);
      p.face(x,y,4.6*s,o.mood||"smile");
      if(o.hair!==false){p.g.beginPath();p.g.arc(x,y,4.8*s,Math.PI*1.05,Math.PI*1.95);p.g.closePath();p.g.fillStyle=o.hair||C.hair;p.g.fill();}
      if(o.wave){const h=o.wave==="l"?hands.l:hands.r;p.line([h[0]-2.5*s,h[1]-1*s,h[0]-3.5*s,h[1]-2*s],O,0.8);p.line([h[0]+2.5*s,h[1]-1*s,h[0]+3.5*s,h[1]-2*s],O,0.8);}
      return hands;},
    star(x,y,r,c,o){const pts=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*0.45:r;pts.push(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}p.poly(pts,c||C.yellow,o);},
    heart(x,y,s,c){p.g.beginPath();p.g.moveTo(x,y+s*0.9);p.g.bezierCurveTo(x-s*1.4,y-s*0.1,x-s*0.7,y-s*1.1,x,y-s*0.35);p.g.bezierCurveTo(x+s*0.7,y-s*1.1,x+s*1.4,y-s*0.1,x,y+s*0.9);fs(c||C.red);},
    sun(x,y,r){for(let k=0;k<8;k++){const a=k*Math.PI/4;p.line([x+Math.cos(a)*(r+1.5),y+Math.sin(a)*(r+1.5),x+Math.cos(a)*(r+4),y+Math.sin(a)*(r+4)],C.orange,1.6);}p.circ(x,y,r,C.yellow);},
    moon(x,y,r){p.circ(x,y,r,C.yellow);p.circ(x+r*0.55,y-r*0.3,r*0.85,p._bg||C.night,null);},
    cloud(x,y,s,c){c=c||C.white;p.circ(x-4*s,y+1*s,3.5*s,c);p.circ(x+4*s,y+1*s,3.5*s,c);p.circ(x,y-1.5*s,4.5*s,c);p.rect(x-4*s,y+1*s,8*s,3.6*s,c,null);p.line([x-7*s,y+4.5*s,x+7*s,y+4.5*s],O,1);},
    arrow(x1,y1,x2,y2,c,w){w=w||2.5;const a=Math.atan2(y2-y1,x2-x1),h=w*2.2;p.line([x1,y1,x2-Math.cos(a)*h*0.6,y2-Math.sin(a)*h*0.6],c||C.red,w);
      p.poly([x2,y2,x2-Math.cos(a)*h-Math.sin(a)*h*0.8,y2-Math.sin(a)*h+Math.cos(a)*h*0.8,x2-Math.cos(a)*h+Math.sin(a)*h*0.8,y2-Math.sin(a)*h-Math.cos(a)*h*0.8],c||C.red,O);},
    clock(x,y,r,h,m,c){p.circ(x,y,r,c||C.white,O,1.2);for(let k=0;k<12;k+=3){const a=k*Math.PI/6;p.dot(x+Math.sin(a)*(r-1.8)-0.5,y-Math.cos(a)*(r-1.8)-0.5);}
      const ha=((h%12)+(m||0)/60)*Math.PI/6,ma=(m||0)*Math.PI/30;p.line([x,y,x+Math.sin(ha)*r*0.5,y-Math.cos(ha)*r*0.5],O,1.4);p.line([x,y,x+Math.sin(ma)*r*0.8,y-Math.cos(ma)*r*0.8],O,1);},
    bubble(x,y,w,h,txt,size,tail){p.rrect(x,y,w,h,3,C.white,O);const tx=tail==="r"?x+w-5:x+4;p.poly([tx,y+h-1,tx+3,y+h-1,tx+(tail==="r"?4:-1),y+h+3],C.white,null);
      p.line([tx,y+h-0.5,tx+(tail==="r"?4:-1),y+h+3,tx+3,y+h-0.5]);if(txt)p.text(txt,x+w/2,y+h/2+0.5,size||7);},
    house(x,y,w,h,roof,wall){p.rect(x,y,w,h,wall||C.cream);p.poly([x-2,y+1,x+w/2,y-h*0.6,x+w+2,y+1],roof||C.red);p.rect(x+w/2-2,y+h-6,4,6,C.wood);},
    building(x,y,w,h,c,roof){p.rect(x,y,w,h,c||C.cream);if(roof)p.rect(x-1,y-2,w+2,3,roof);
      for(let yy=y+3;yy<y+h-6;yy+=5)for(let xx=x+2;xx<x+w-3;xx+=5)p.rect(xx,yy,3,3,C.sky,O,0.6);p.rect(x+w/2-2.5,y+h-6,5,6,C.wood);},
    tree(x,y,s,c){s=s||1;p.rect(x-1.5*s,y,3*s,6*s,C.brown);p.circ(x,y-2*s,5.5*s,c||C.leaf);},
    book(x,y,w,h,c){p.rect(x,y,w,h,c||C.red);p.rect(x+w-3,y+1,2,h-2,C.paper,null);},
    ball(x,y,r,kind){
      if(kind==="soccer"){p.circ(x,y,r,C.white);const q=r*0.42;p.poly([x,y-q,x+q,y-q*0.3,x+q*0.6,y+q*0.8,x-q*0.6,y+q*0.8,x-q,y-q*0.3],O,null);
        [0,1,2,3,4].forEach(k=>{const a=-Math.PI/2+k*Math.PI*0.4;p.line([x+Math.cos(a)*q,y+Math.sin(a)*q,x+Math.cos(a)*r,y+Math.sin(a)*r],O,0.8);});}
      else if(kind==="base"){p.circ(x,y,r,C.white);p.arc(x-r*1.3,y,r*0.95,-0.7,0.7,C.red,1);p.arc(x+r*1.3,y,r*0.95,Math.PI-0.7,Math.PI+0.7,C.red,1);}
      else if(kind==="basket"){p.circ(x,y,r,C.orange);p.line([x-r,y,x+r,y],O,0.8);p.line([x,y-r,x,y+r],O,0.8);p.arc(x-r*1.2,y,r*0.9,-0.9,0.9,O,0.8);p.arc(x+r*1.2,y,r*0.9,Math.PI-0.9,Math.PI+0.9,O,0.8);}
      else if(kind==="volley"){p.circ(x,y,r,C.white);p.arc(x,y+r*1.1,r*1.1,-2.5,-0.6,C.blue,1.6);p.arc(x-r*1.1,y-r*0.3,r*1.1,-0.6,0.9,C.yellow,1.6);}
      else if(kind==="tennis"){p.circ(x,y,r,"#d8f04a");p.arc(x-r*1.2,y,r*0.95,-0.8,0.8,C.white,1.2);p.arc(x+r*1.2,y,r*0.95,Math.PI-0.8,Math.PI+0.8,C.white,1.2);}
      else if(kind==="rugby"){p.ell(x,y,r*1.3,r*0.8,C.brown,O,-0.5);p.line([x-r*0.4,y+r*0.25,x+r*0.4,y-r*0.25],C.white,1);}
      else p.circ(x,y,r,kind||C.red);},
    flag(x,y,w,h,draw){p.rect(x,y,w,h,C.white);p.g.save();p.g.beginPath();p.g.rect(x+1,y+1,w-2,h-2);p.g.clip();draw(x+1,y+1,w-2,h-2);p.g.restore();p.rect(x,y,w,h,null);p.rect(x-2,y,1.5,26,C.grey,null);},
    plate(x,y,r){p.ell(x,y,r,r*0.45,C.white);p.ell(x,y,r*0.7,r*0.3,"#f2f2f2",null);},
    bowl(x,y,w,c){p.g.beginPath();p.g.moveTo(x-w/2,y);p.g.quadraticCurveTo(x,y+w*0.75,x+w/2,y);p.g.closePath();fs(c||C.white);},
    cup(x,y,w,h,c){p.rect(x,y,w,h,c||C.white);p.arc(x+w,y+h/2,h/4+0.5,-Math.PI/2,Math.PI/2,O,1.2);},
    desk(x,y,w){p.rect(x,y,w,3,C.wood);p.rect(x+1,y+3,2,7,C.brown);p.rect(x+w-3,y+3,2,7,C.brown);},
    bed(x,y,w){p.rect(x,y+2,w,6,C.white);p.rect(x,y-3,3,12,C.wood);p.rect(x+w-2,y+1,2,8,C.wood);p.rect(x+3,y,6,4,C.white);p.rect(x+8,y+1,w-10,5,C.blue);},
    door(x,y,w,h,c){p.rect(x,y,w,h,c||C.wood);p.circ(x+w-2.5,y+h/2,0.9,C.gold,null);},
    zz(x,y){p.text("Z",x,y,7,C.blue,C.white);p.text("z",x+4,y-5,5,C.blue,C.white);},
    sparkle(x,y,r,c){p.poly([x,y-r,x+r*0.25,y-r*0.25,x+r,y,x+r*0.25,y+r*0.25,x,y+r,x-r*0.25,y+r*0.25,x-r,y,x-r*0.25,y-r*0.25],c||C.yellow,O);},
    ground(c,y){p.rect(-1,y??26,34,8,c||C.green,O);},
    water(y){p.rect(-1,y??20,34,14,C.water,null);for(let x=2;x<32;x+=7)p.arc(x,(y??20)+3,2,Math.PI,0,C.white,1);},
    num(n,x,y,size,c){p.text(String(n),x,y,size||16,c||C.white,O);},
    dots(n,y){const per=Math.min(n,5),rows=Math.ceil(n/5);for(let i=0;i<n;i++){const r=Math.floor(i/5),c=i%5,cols=r<rows-1?5:n-r*5||5;p.circ(16-(cols-1)*2.6+c*5.2,y+r*4.5,1.8,C.red);}},
    plus(x,y,s,c){p.rect(x-s/6,y-s/2,s/3,s,c||C.red);p.rect(x-s/2,y-s/6,s,s/3,c||C.red);}
  };
  return p;
}

const LIB={};
const pics={
  has:n=>!!LIB[key(n)],
  add(n,fn){LIB[key(n)]=fn;},
  addAll(map){for(const k in map)LIB[key(k)]=map[k];},
  names:()=>Object.keys(LIB),
  _cache:{},
  canvas(n,size){const fn=LIB[key(n)];if(!fn)return null;size=size||64;
    const src=document.createElement("canvas");src.width=src.height=32;const g=src.getContext("2d");
    try{const p=pen(g);fn(p);}catch(e){console.warn("Kit.pics: "+n,e);}
    /* crisp edges: every pixel is either solid or empty */
    const im=g.getImageData(0,0,32,32),d=im.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]<110?0:255;g.putImageData(im,0,0);
    if(size===32)return src;
    const c=document.createElement("canvas");c.width=c.height=size;const x=c.getContext("2d");x.imageSmoothingEnabled=false;x.drawImage(src,0,0,size,size);return c;},
  url(n,size){const k=key(n)+"@"+(size||64);if(!(k in pics._cache)){const c=pics.canvas(n,size);pics._cache[k]=c?c.toDataURL():"";}return pics._cache[k];},
  img(n,size,alt,cls){const u=pics.url(n,size*2||64);return u?`<img class="kit-pic${cls?" "+cls:""}" src="${u}" width="${size||32}" height="${size||32}" alt="${String(alt||"").replace(/"/g,"&quot;")}">`:"";}
};
function key(n){return String(n||"").trim().toLowerCase();}
Kit.pics=pics;
/* Kit.art(name, emoji): a sprite when there is one, the emoji otherwise (used by the traps and other kit parts) */
Kit.art=(n,fallback,size)=>pics.has(n)?pics.img(n,size||48,"",""):(fallback||"");
pics._pen=pen;pics._C=C;

/* ===================================================================== PICTURES ===================================================================== */
/*PICS:WORDS START*/
/* ---------- shared picture recipes ---------- */
const splat=c=>p=>{p.poly([16,4,20,7,25,5,24,11,29,14,25,18,27,24,21,23,18,28,14,24,8,27,8,21,3,17,8,13,5,7,11,8],c);p.circ(10,29,1.5,c);p.circ(26,28,1.2,c);p.line([22,9,25,6],C.white,1);};
const shape=fn=>p=>fn(p,"#55b84a");
const feel=(mood,extra)=>p=>{p.face(16,17,11,mood);if(extra)extra(p);};
const digit=n=>p=>{p.text(String(n),16,n>10?16:11,n>10?18:16,C.blue,C.white);p.text(String(n),16,n>10?16:11,n>10?18:16,C.blue);if(n<=10)p.dots(n,n>5?23:25);};
const timeOf=(h,m,scene)=>p=>{p.bg(C.cream);scene(p);p.clock(25,7,6,h,m);};
const animalHead=(c,ears,extra)=>p=>{ears(p,c);p.circ(16,18,10,c);extra&&extra(p);p.circ(12,16,1.4,O,null);p.circ(20,16,1.4,O,null);p.cheeks(16,18,10);};
const school=(p,c)=>{p.bg(C.sky);p.ground(C.green,27);p.building(5,10,22,17,c||C.cream,C.red);p.circ(16,7,2.2,C.white);p.clock(16,7,2.2,3,0);};
const room=(p,wall)=>{p.bg(wall||"#f6e7c8");p.rect(-1,24,34,9,"#c99a62",O);};
const highlight=(p,x,y,r)=>{p.circ(x,y,r,null,C.red,1.6);};
const note=(p,x,y,c)=>{p.ell(x,y,2.2,1.6,c||O,O,-0.4);p.line([x+1.8,y-0.5,x+1.8,y-8],O,1);p.line([x+1.8,y-8,x+4.5,y-5.5],O,1.2);};
const team=(p,icon,shirt)=>{[6,16,26].forEach((x,i)=>p.kid(x,18,{s:0.62,shirt:shirt||C.blue,hair:i===1?"#7a4a20":C.hair}));icon(p);};
const adult=(p,x,y,o)=>{o=o||{};p.kid(x,y,Object.assign({s:1.1},o));};
const store=(p,c,stripe)=>{p.bg(C.sky);p.ground("#c8c8c8",27);p.rect(2,8,28,19,C.white);p.rect(2,8,28,5,c||C.green);if(stripe)p.rect(2,13,28,2,stripe,null);p.rect(5,16,9,11,C.sky);p.rect(18,16,9,8,C.sky);};

pics.addAll({
/* ---- greetings: three clearly different scenes ---- */
"hello":p=>{p.bg(C.sky);p.ground(C.green,27);p.kid(9,12,{wave:"r",shirt:C.red});p.kid(23,12,{wave:"l",shirt:C.blue,hair:"#7a4a20"});p.bubble(11,1,11,7,"Hi!",6);},
"goodbye":p=>{p.bg("#ffd9a8");p.ground(C.green,27);p.house(1,14,9,12,C.red);p.kid(14,12,{wave:"r",shirt:C.red});p.kid(26,14,{walk:true,s:0.8,shirt:C.blue,hair:"#7a4a20"});p.arrow(24,4,31,4,C.red,1.8);},
"see you":p=>{p.bg(C.sky);p.kid(9,12,{wave:"r",shirt:C.red});p.rect(18,8,12,13,C.white);p.rect(18,8,12,4,C.red);p.rect(21,6,1.5,4,O,null);p.rect(26,6,1.5,4,O,null);p.text("2",24,17,7);p.circ(24,17,4,null,C.blue,1.2);p.ground(C.green,27);},
"name":p=>{p.rrect(3,7,26,18,3,C.white);p.rrect(3,7,26,6,3,C.red);p.rect(3,10,26,3,C.red,null);p.line([7,17,19,17],O,1.5);p.line([7,21,24,21],O,1.5);p.circ(16,5,2,C.grey);},
/* ---- feelings: big faces, each with its own clue ---- */
"fine":feel("smile",p=>{p.circ(26,6,4.5,C.green);p.line([24,6,25.5,8,28,4],C.white,1.5);}),
"happy":feel("grin",p=>{p.heart(5,6,3.2,C.pink);p.heart(27,7,3.2,C.pink);}),
"good":p=>{p.rrect(9,13,14,14,4,C.skin);for(let i=0;i<3;i++)p.line([12,18+i*3,21,18+i*3],O,0.8);p.rrect(11,3,6,13,3,C.skin);p.rect(6,24,20,6,C.blue);},
"great":feel("star",p=>{p.sparkle(4,5,3.5);p.sparkle(28,5,3.5);p.sparkle(28,27,2.5);}),
"sad":feel("sad",p=>{p.cloud(26,4,0.6,"#c8cfd8");p.line([24,9,23,12],C.water,1);p.line([28,9,27,12],C.water,1);}),
"sleepy":feel("sleepy",p=>{p.zz(25,7);}),
"tired":p=>{p.face(16,19,10,"tired");p.ell(26,12,1,2,C.water,null);p.ell(7,13,1,2,C.water,null);p.line([4,4,8,8],C.grey,1.2);p.line([28,4,24,8],C.grey,1.2);p.line([16,2,16,6],C.grey,1.2);},
"hungry":p=>{p.face(10,12,8,"hungry");p.plate(21,26,9);p.line([29,16,29,26],C.grey,1.4);p.line([4,24,5,22,6,24,7,22,8,24],C.brown,1);},
"angry":feel("angry",p=>{p.circ(6,5,2.5,C.white,C.grey);p.circ(9,3,2,C.white,C.grey);p.circ(26,5,2.5,C.white,C.grey);p.circ(23,3,2,C.white,C.grey);}),
"sick":p=>{p.face(16,18,10,"sick","#ffe0c8");p.rect(9,6,14,4,C.water);p.line([16,25,24,27],"#e0e0e0",1.6);p.circ(24,27,1.2,C.red,null);p.ell(9,20,2,1,"#ff8a8a",null);p.ell(23,20,2,1,"#ff8a8a",null);},
/* ---- numbers ---- */
"one":digit(1),"two":digit(2),"three":digit(3),"four":digit(4),"five":digit(5),"six":digit(6),"seven":digit(7),"eight":digit(8),"nine":digit(9),"ten":digit(10),
"eleven":digit(11),"twelve":digit(12),"thirteen":digit(13),"fourteen":digit(14),"fifteen":digit(15),"sixteen":digit(16),"seventeen":digit(17),"eighteen":digit(18),"nineteen":digit(19),"twenty":digit(20),
/* ---- things ---- */
"apple":p=>{p.circ(12,18,8,C.red,null);p.circ(20,18,8,C.red,null);p.ell(16,19,11,10,C.red);p.line([16,10,17,5],C.brown,1.6);p.ell(20,6,3,1.6,C.leaf,O,-0.4);p.ell(11,15,1.5,2.5,"#ff8a80",null);},
"pencil":p=>{p.poly([5,27,8,20,24,4,28,8,12,24],C.yellow);p.poly([5,27,8,20,12,24],C.cream);p.poly([5,27,6.5,23.5,8.5,25.5],O,null);p.poly([24,4,28,8,26,10,22,6],C.pink);},
"ball":p=>{p.circ(16,17,11,C.red);p.arc(16,17,8,3.6,4.6,C.white,2);p.ground(C.green,29);},
"strawberry":p=>{p.poly([16,29,6,13,9,9,23,9,26,13],C.red);for(let i=0;i<9;i++)p.dot(9+(i%3)*5+(Math.floor(i/3)%2)*2,12+Math.floor(i/3)*5,C.yellow);p.poly([9,10,12,5,16,9,20,5,23,10],C.leaf);},
/* ---- colors: paint splats ---- */
"red":splat(C.red),"blue":splat(C.blue),"yellow":splat(C.yellow),"green":splat(C.green),"orange":splat(C.orange),"purple":splat(C.purple),
"pink":splat(C.pink),"white":splat(C.white),"black":splat(C.black),"brown":splat(C.brown),
/* ---- sports ---- */
"soccer":p=>{p.bg(C.sky);p.ground(C.green,24);p.rect(3,6,19,18,null,C.white,1.5);for(let x=6;x<22;x+=4)p.line([x,7,x,23],"#ffffff99",0.6);p.ball(24,22,6,"soccer");},
"baseball":p=>{p.line([6,27,22,6],C.wood,4);p.line([6,27,8,24.5],O,4.5);p.ball(23,22,6,"base");},
"basketball":p=>{p.rect(8,3,16,9,C.white);p.rect(12,6,8,5,null,C.red);p.line([10,12,22,12],C.orange,1.6);for(let x=11;x<22;x+=3)p.line([x,12,x+1,17],C.white,0.7);p.ball(16,24,6,"basket");},
"volleyball":p=>{p.rect(0,18,32,3,C.white);for(let x=2;x<32;x+=3)p.line([x,15,x,22],O,0.5);p.line([0,15,32,15],O,1);p.line([1,15,1,31],C.grey,1.5);p.line([31,15,31,31],C.grey,1.5);p.ball(16,7,6,"volley");},
"tennis":p=>{p.line([17,19,26,29],C.brown,3.2);p.ell(12,12,8,10,C.cream,C.red,0.7);p.g.save();p.ell(12,12,8,10,null,null,0.7);p.g.clip();for(let k=-12;k<=12;k+=3){p.line([12+k-10,2,12+k+10,22],"#c0b090",0.9);p.line([12+k+10,2,12+k-10,22],"#c0b090",0.9);}p.g.restore();p.ell(12,12,8,10,null,C.red,0.7);p.ball(26,7,4.5,"tennis");},
"swimming":p=>{p.bg(C.sky);p.water(16);p.face(16,16,5,"smile");p.ell(16,13,5,2.5,C.red,O);p.line([10,18,4,14],C.skin,2.4);p.line([22,18,28,14],C.skin,2.4);p.arc(8,22,3,Math.PI,0,C.white,1);p.arc(24,24,3,Math.PI,0,C.white,1);},
"dodgeball":p=>{p.bg(C.sky);p.ground(C.green,28);p.kid(22,12,{shirt:C.blue,mood:"wow",wave:"both"});p.circ(7,15,4.5,C.red);p.line([1,13,3,13],O,0.8);p.line([1,17,3,17],O,0.8);},
/* ---- food ---- */
"ice cream":p=>{p.poly([10,15,22,15,16,30],C.wood);p.line([12,18,19,25],O,0.6);p.line([20,18,13,25],O,0.6);p.circ(16,11,7,C.pink);p.circ(13,6,3.5,C.cream);},
"cake":p=>{p.poly([4,16,26,10,28,13,28,25,4,27],C.cream);p.poly([4,16,26,10,28,13,6,19],C.white);p.rect(4,20,24,2,C.pink,null);p.circ(19,8,3.2,C.red);p.line([19,5,20,3],C.leaf,1);},
"pudding":p=>{p.ell(16,27,13,3,C.white);p.poly([8,26,11,10,21,10,24,26],C.yellow);p.ell(16,10,5,2,"#8a4a1a");p.poly([11,10,21,10,22,14,10,14],"#8a4a1a",null);},
"milk":p=>{p.poly([9,10,16,4,23,10],C.blue);p.rect(9,10,14,19,C.white);p.rect(9,15,14,7,C.blue);p.circ(16,18.5,2.2,C.white,null);},
"banana":p=>{p.g.beginPath();p.g.moveTo(5,10);p.g.quadraticCurveTo(8,26,27,22);p.g.quadraticCurveTo(12,22,9,8);p.g.closePath();p.g.fillStyle=C.yellow;p.g.fill();p.g.strokeStyle=O;p.g.stroke();p.rect(5,6,4,4,C.brown);},
"tomato":p=>{p.ell(16,19,12,10,C.red);p.poly([10,11,14,9,16,5,18,9,22,11,17,12,16,14,15,12],C.leaf);p.ell(11,16,2,3,"#ff8a80",null);},
"carrot":p=>{p.poly([7,27,10,14,22,8,25,11,13,24],C.orange);p.line([12,17,15,19],O,0.7);p.line([15,13,18,15],O,0.7);p.poly([22,8,25,2,25,8,30,5,26,11],C.leaf);},
"onion":p=>{p.poly([16,3,19,9,26,15,23,26,9,26,6,15,13,9],"#d8a26a");p.line([16,9,16,25],"#a0703a",0.8);p.line([11,12,10,24],"#a0703a",0.8);p.line([21,12,22,24],"#a0703a",0.8);p.line([14,27,13,30],O,0.8);p.line([18,27,19,30],O,0.8);},
"green pepper":p=>{p.poly([7,11,12,8,20,8,25,11,24,25,20,28,12,28,8,25],C.green);p.line([16,9,16,27],"#2f7a2a",0.8);p.rect(14,3,4,6,"#2f7a2a");},
"cucumber":p=>{p.rrect(3,12,26,8,4,"#3a9a3a");for(let x=7;x<27;x+=4)p.dot(x,14,"#d8f0a0");for(let x=9;x<27;x+=4)p.dot(x,17,"#d8f0a0");p.circ(4.5,16,2,C.yellow);},
/* ---- signs (the word on the sign is the point) ---- */
"stop":p=>{const pts=[];for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;pts.push(16+Math.cos(a)*14,16+Math.sin(a)*14);}p.poly(pts,C.red);p.text("STOP",16,16.5,8,C.white);},
"bus":p=>{p.rrect(2,7,28,18,3,C.yellow);for(let x=5;x<26;x+=6)p.rect(x,10,5,6,C.sky);p.rect(3,18,26,4,C.white,null);p.text("BUS",16,20,6,C.blue);p.circ(9,26,3,C.black);p.circ(23,26,3,C.black);},
"taxi":p=>{p.rrect(3,13,26,10,3,C.yellow);p.poly([8,13,11,7,21,7,24,13],C.yellow);p.rect(11,8,4,5,C.sky);p.rect(17,8,4,5,C.sky);p.rect(11,3,10,4,C.white);p.text("TAXI",16,5.3,4.5,O);p.circ(9,24,3,C.black);p.circ(23,24,3,C.black);},
"wc":p=>{p.rrect(2,4,28,24,3,C.white);p.text("WC",16,10,9,C.blue);p.circ(10,16,1.8,C.blue,null);p.poly([8,19,12,19,13,26,7,26],C.blue,null);p.line([16,15,16,27],C.grey,1);p.circ(22,16,1.8,C.red,null);p.poly([20,19,24,19,25.5,26,18.5,26],C.red,null);},
/* ---- shapes: all the same green, so only the shape changes ---- */
"circle":shape((p,c)=>p.circ(16,16,12,c)),
"triangle":shape((p,c)=>p.poly([16,3,29,27,3,27],c)),
"square":shape((p,c)=>p.rect(5,5,22,22,c)),
"rectangle":shape((p,c)=>p.rect(2,9,28,14,c)),
"star":shape((p,c)=>p.star(16,17,14,c,O)),
"heart":shape((p,c)=>p.heart(16,15,12,c)),
"diamond":shape((p,c)=>p.poly([16,2,28,16,16,30,4,16],c)),
/* ---- animals and nature ---- */
"fish":p=>{p.ell(14,16,10,7,C.orange);p.poly([23,16,30,9,30,23],C.orange);p.circ(9,14,1.6,C.white);p.dot(9,14);p.arc(14,16,5,-0.8,0.8,O,0.8);},
"octopus":p=>{for(let i=0;i<5;i++){const x=7+i*4.5;p.line([x,18,x+(i%2?2:-2),26,x,29],"#e8607a",2.6);}p.ell(16,13,10,9,"#e8607a");p.circ(12,13,1.6,O,null);p.circ(20,13,1.6,O,null);p.ell(16,17,2,1.5,"#b03050");},
"insect":p=>{p.line([12,8,9,3],O,1);p.line([20,8,23,3],O,1);p.ell(16,18,10,11,C.red);p.circ(16,8,4.5,C.black);p.line([16,10,16,29],O,1);[[11,15],[21,15],[10,22],[22,22],[13,26],[19,26]].forEach(([x,y])=>p.circ(x,y,1.8,C.black,null));},
"fruit":p=>{for(let i=0;i<6;i++)p.circ(9+(i%3)*4,12+Math.floor(i/3)*4+(i%3===1?2:0),2.8,C.purple);p.circ(13,22,2.8,C.purple);p.line([13,9,14,5],C.brown,1.2);p.ell(23,21,6,6,C.red);p.line([23,15,24,12],C.brown,1.2);p.ell(25,13,2.5,1.3,C.leaf,O,-0.3);},
"vegetable":p=>{p.rect(6,17,5,12,"#7ac04a");p.circ(5,13,4,C.green);p.circ(11,12,4,C.green);p.circ(8,8,4,C.green);p.poly([17,29,20,15,27,13,27,17,21,28],C.orange);p.poly([24,13,25,6,27,11,30,8,28,15],C.leaf);},
"animal":p=>{p.circ(10,9,3,C.brown);p.circ(16,6,3,C.brown);p.circ(22,9,3,C.brown);p.circ(6,15,2.6,C.brown);p.ell(15,20,8,7,C.brown);p.poly([25,22,30,20,31,26],C.brown,null);},
"dog":animalHead("#d8a26a",(p,c)=>{p.ell(6,13,3.5,7,"#8a5a33",O,0.3);p.ell(26,13,3.5,7,"#8a5a33",O,-0.3);},p=>{p.ell(16,22,4.5,3.5,C.cream);p.ell(16,20.5,1.8,1.2,O,null);}),
"cat":animalHead("#f0b060",(p,c)=>{p.poly([7,13,8,3,15,9],c);p.poly([25,13,24,3,17,9],c);},p=>{p.circ(16,20,1,C.pink,null);p.line([4,19,10,20],O,0.6);p.line([4,22,10,21],O,0.6);p.line([28,19,22,20],O,0.6);p.line([28,22,22,21],O,0.6);}),
"rabbit":animalHead(C.white,(p,c)=>{p.ell(11,6,3,8,c);p.ell(21,6,3,8,c);p.ell(11,6,1.3,6,C.pink,null);p.ell(21,6,1.3,6,C.pink,null);},p=>{p.circ(16,20,1,C.pink,null);}),
"mouse":animalHead(C.grey,(p,c)=>{p.circ(7,10,6,c);p.circ(25,10,6,c);p.circ(7,10,3.5,C.pink,null);p.circ(25,10,3.5,C.pink,null);},p=>{p.circ(16,21,1.5,C.pink);p.line([5,20,11,21],O,0.6);p.line([27,20,21,21],O,0.6);}),
"pig":animalHead("#ffb3c7",(p,c)=>{p.poly([6,13,7,5,13,9],c);p.poly([26,13,25,5,19,9],c);},p=>{p.ell(16,22,5,3.5,"#ff8fb0");p.circ(14,22,1,O,null);p.circ(18,22,1,O,null);}),
"cow":animalHead(C.white,(p,c)=>{p.poly([7,9,3,5,9,6],C.cream);p.poly([25,9,29,5,23,6],C.cream);p.ell(5,13,4,2.2,c);p.ell(27,13,4,2.2,c);},p=>{p.ell(11,12,3,2.5,C.black,null);p.ell(16,23,6,4,"#ffb3c7");p.circ(14,23,1,O,null);p.circ(18,23,1,O,null);}),
/* ---- size words: the one that matches the word is colored, the other is grey ---- */
"big":p=>{p.circ(26,24,3,"#d0d0d0");p.circ(12,16,11,C.red);p.arrow(3,4,28,4,C.blue,1.4);},
"small":p=>{p.circ(12,16,11,"#d0d0d0");p.circ(26,24,3.5,C.red);p.circ(26,24,7,null,C.blue,1.2);},
"long":p=>{p.rrect(2,8,28,6,3,C.green);p.circ(28,11,1,O,null);p.rrect(2,20,10,6,3,"#d0d0d0");},
"short":p=>{p.rrect(2,8,28,6,3,"#d0d0d0");p.rrect(2,20,10,6,3,C.green);p.circ(10,23,1,O,null);},
/* ---- face parts: one face, the part is circled ---- */
"head":p=>{p.face(16,17,9,"smile");p.g.beginPath();p.g.arc(16,17,9.3,Math.PI*1.05,Math.PI*1.95);p.g.closePath();p.g.fillStyle=C.hair;p.g.fill();p.circ(16,17,13,null,C.red,1.8);},
"eyes":p=>{p.face(16,18,12,"smile");p.ell(16,15,10,4.5,null,C.red,1.8);},
"ears":p=>{p.circ(4,18,3,C.skin);p.circ(28,18,3,C.skin);p.face(16,18,11,"smile");p.circ(4,18,4.5,null,C.red,1.6);p.circ(28,18,4.5,null,C.red,1.6);},
"nose":p=>{p.face(16,16,13,"calm");p.ell(16,18,2,2.5,"#f0b090");p.circ(16,18,5,null,C.red,1.6);},
"mouth":p=>{p.face(16,16,13,"grin");p.ell(16,24,7,4,null,C.red,1.6);}
});

/* ---- Let's Try! 2 ---- */
const kidAt=(p,o)=>p.kid(o.x||16,o.y||11,o);
pics.addAll({
"good morning":p=>{p.bg("#ffcf9a");p.circ(8,25,7,C.yellow);p.ground(C.green,25);p.kid(22,10,{wave:"r",shirt:C.red});},
"good afternoon":p=>{p.bg(C.sky);p.sun(7,6,3.5);p.ground(C.green,27);p.kid(20,12,{wave:"l",shirt:C.orange});p.clock(28,5,3.6,2,0);},
"good night":p=>{p.bg(C.night);p.moon(25,6,4.5);p.star(5,5,2,C.yellow,null);p.star(13,3,1.5,C.yellow,null);p.kid(12,13,{wave:"r",shirt:"#c9b6ff",pants:"#c9b6ff"});p.zz(25,20);},
"world":p=>{p.circ(16,16,13,C.water);p.poly([7,8,13,6,15,11,11,15,13,20,9,22,6,15],C.green,null);p.poly([18,6,25,8,27,14,22,15,20,12],C.green,null);p.poly([18,19,24,18,23,26,19,25],C.green,null);p.circ(16,16,13,null);},
/* weather: no people, just the sky */
"sunny":p=>{p.bg(C.sky);p.sun(16,16,8);},
"rainy":p=>{p.bg("#c8d2dc");p.cloud(16,10,1.4,"#9aa6b4");for(let i=0;i<6;i++)p.line([6+i*4,19+(i%2)*3,4.5+i*4,24+(i%2)*3],C.blue,1.4);},
"cloudy":p=>{p.bg(C.sky);p.cloud(11,12,1.1,"#e0e6ee");p.cloud(21,19,1.3,"#c8d0da");},
"snowy":p=>{p.bg("#dbe8f6");p.cloud(16,8,1.2,"#ffffff");for(let i=0;i<7;i++){const x=5+i*3.8,y=18+(i%3)*4;p.line([x-2,y,x+2,y],C.blue,0.8);p.line([x,y-2,x,y+2],C.blue,0.8);}},
"hot":p=>{p.bg("#ffe0a0");p.sun(25,6,3.5);p.face(14,18,10,"tired","#ffb08a");p.ell(4,10,1.2,2,C.water,null);p.ell(24,22,1.2,2,C.water,null);},
"cold":p=>{p.bg("#dbe8f6");p.face(16,15,9,"wow","#ffe6f0");p.rect(8,22,16,4,C.red);p.rect(19,22,3,9,C.red);p.line([3,4,7,8],C.blue,1);p.line([3,8,7,4],C.blue,1);p.line([26,5,30,9],C.blue,1);p.line([26,9,30,5],C.blue,1);p.line([4,14,6,16,4,18],C.grey,0.8);p.line([28,14,26,16,28,18],C.grey,0.8);},
"tag":p=>{p.bg(C.sky);p.ground(C.green,28);p.kid(8,13,{walk:true,s:0.85,shirt:C.red,wave:"r"});p.kid(24,13,{walk:true,s:0.85,shirt:C.blue,mood:"grin"});p.arrow(12,4,22,4,C.red,1.6);},
"cards":p=>{p.rrect(5,7,13,19,2,C.white,O);p.text("A",9,11,5,C.red);p.heart(11.5,17,3.5,C.red);p.g.save();p.g.translate(18,16);p.g.rotate(0.3);p.rrect(-6,-10,13,19,2,C.white,O);p.text("K",-2,-6,5);p.star(0.5,0,3.5,O,null);p.g.restore();},
"jump rope":p=>{p.bg(C.sky);p.ground(C.green,28);p.arc(16,13,13,Math.PI*0.95,Math.PI*0.05,C.red,1.4);p.kid(16,9,{wave:"both",shirt:C.orange,s:0.9});p.line([2,13,3,28],C.red,1);},
"stand up":p=>{p.rect(4,20,9,3,C.wood);p.rect(4,23,2,7,C.brown);p.rect(11,23,2,7,C.brown);p.rect(4,13,2,8,C.wood);p.kid(21,8,{shirt:C.blue,wave:"both"});p.arrow(30,22,30,4,C.red,1.8);},
"sit down":p=>{p.rect(10,22,13,3,C.wood);p.rect(10,25,2,6,C.brown);p.rect(21,25,2,6,C.brown);p.rect(10,10,2,13,C.wood);p.kid(17,9,{shirt:C.blue});p.arrow(29,3,29,22,C.red,1.8);},
"turn around":p=>{p.kid(16,9,{shirt:C.blue});p.arc(16,16,13,-Math.PI*0.1,Math.PI*1.1,C.red,1.8);p.poly([4,22,1,17,7,17],C.red);},
/* daily schedule: a small clock in the corner means "time" */
"wake-up time":timeOf(7,0,p=>{p.bed(2,18,26);p.kid(10,10,{s:0.8,wave:"both",shirt:"#c9b6ff"});}),
"breakfast time":timeOf(7,30,p=>{p.rect(2,24,28,6,C.wood);p.plate(14,22,9);p.ell(12,21,4,2,C.white,null);p.circ(12,21,1.6,C.yellow,null);p.rect(17,17,6,5,"#e0a050");}),
"study time":timeOf(4,0,p=>{p.desk(2,21,22);p.kid(13,10,{s:0.8,shirt:C.green});p.book(7,17,8,4,C.blue);}),
"lunch time":timeOf(12,0,p=>{p.rect(4,13,22,14,C.red);p.rect(6,15,9,10,C.white);p.rect(16,15,8,4,C.yellow);p.rect(16,20,8,5,C.green);p.circ(10,20,1.4,C.red,null);}),
"snack time":timeOf(3,0,p=>{p.plate(14,24,11);[[9,20],[16,19],[13,15]].forEach(([x,y])=>{p.circ(x,y,4,"#d8a050");p.dot(x-1,y-1,C.brown);p.dot(x+1,y+1,C.brown);});}),
"homework time":timeOf(6,0,p=>{p.rect(3,12,18,16,C.white);for(let y=16;y<27;y+=3)p.line([5,y,19,y],C.blue,0.5);p.text("1+2",11,17,5,O);p.poly([18,26,20,14,22,14,20,27],C.yellow);}),
"tv time":timeOf(7,0,p=>{p.rrect(3,12,20,14,2,C.black);p.rect(5,14,16,10,C.sky,null);p.circ(13,19,3,C.yellow,null);p.line([9,12,7,9],O);p.line([17,12,19,9],O);}),
"bath time":timeOf(8,0,p=>{p.rrect(2,19,24,9,3,C.white);p.face(12,15,4.5,"smile");[[18,16],[21,14],[8,18],[5,15]].forEach(([x,y])=>p.circ(x,y,2,C.sky));p.rect(4,28,2,3,C.grey);p.rect(22,28,2,3,C.grey);}),
"dream time":timeOf(9,0,p=>{p.bg(C.night);p.clock(25,7,6,9,0);p.bed(2,20,26);p.face(8,17,3,"sleepy");p.bubble(10,6,10,8,"",6);p.star(15,10,2.5);}),
"a.m.":p=>{p.bg("#ffe9b8");p.sun(9,8,4);p.clock(20,19,9,9,0);},
"p.m.":p=>{p.bg("#c8c4f0");p.moon(9,8,4);p.clock(20,19,9,3,0);},
/* school things */
"pen":p=>{p.poly([6,27,8,22,24,6,27,9,11,25],C.blue);p.poly([6,27,8,22,11,25],C.black);p.line([20,8,24,12],C.white,1);},
"eraser":p=>{p.poly([4,18,16,10,28,16,16,24],C.white);p.poly([4,18,16,24,16,28,4,22],"#e0e0e0");p.poly([16,24,28,16,28,20,16,28],"#d0d0d0");p.poly([4,18,10,14,22,20,16,24],C.blue);},
"ruler":p=>{p.poly([2,22,24,4,30,10,8,28],"#f8e08a");for(let i=0;i<9;i++){const x=6+i*2.5,y=21-i*2.1;p.line([x,y,x+(i%2?2:3),y+(i%2?2:3)],O,0.7);}},
"crayon":p=>{p.poly([5,26,8,19,22,6,26,10,12,23],C.red);p.poly([5,26,8,19,12,23],"#b02a20");p.rect(14,10,6,8,C.white,null);p.line([12,12,19,19],O,0.6);},
"marker":p=>{p.rrect(4,12,22,8,3,C.green);p.rect(4,12,6,8,"#2f7a2a");p.poly([26,13,30,16,26,19],C.green);p.rect(12,14,8,4,C.white,null);},
"glue stick":p=>{p.rrect(10,10,12,19,2,C.purple);p.rect(10,6,12,5,C.white);p.rect(12,3,8,4,"#f0f0f0");p.rect(12,16,8,6,C.white,null);},
"scissors":p=>{p.line([16,16,27,4],C.grey,2.2);p.line([16,16,27,9],C.grey,2.2);p.circ(9,22,4.5,null,C.red,2.4);p.circ(16,26,4.5,null,C.red,2.4);p.line([12,19,16,16,15,22],C.red,2.2);},
"stapler":p=>{p.rrect(3,18,26,6,2,C.black);p.poly([4,17,26,12,29,15,8,19],C.red);p.rect(3,24,26,3,C.grey);},
"notebook":p=>{p.rect(7,4,19,25,C.blue);p.rect(10,4,16,25,"#6aa6f0");p.rect(13,9,10,6,C.white);for(let y=6;y<28;y+=3)p.circ(7,y,1,C.white,O,0.6);},
"pencil case":p=>{p.rrect(3,11,26,13,4,C.orange);p.line([5,14,27,14],O,1);for(let x=7;x<27;x+=3)p.dot(x,14,C.grey);p.rect(20,12,5,3,C.grey);p.poly([22,7,24,4,26,7,26,11,22,11],C.yellow);},
"pencil sharpener":p=>{p.rect(8,10,16,14,C.red);p.rect(8,10,16,4,"#ff7a70",null);p.circ(16,18,3,C.black);p.poly([2,15,16,18,2,21],C.yellow);},
"calendar":p=>{p.rect(4,6,24,22,C.white);p.rect(4,6,24,6,C.red);p.rect(9,3,2,6,O,null);p.rect(21,3,2,6,O,null);for(let r=0;r<3;r++)for(let c=0;c<4;c++)p.rect(7+c*5.5,14+r*4.5,3,3,c===2&&r===1?C.red:"#c8c8c8",null);},
"magnet":p=>{p.arc(16,15,9,Math.PI,0,C.red,6);p.rect(4,15,6,10,C.red);p.rect(22,15,6,10,C.red);p.rect(4,22,6,4,C.grey);p.rect(22,22,6,4,C.grey);},
"bag":p=>{p.rrect(6,8,20,20,4,C.red);p.rrect(9,4,14,8,4,null,O);p.rect(6,14,20,4,"#b03030");p.rect(14,16,4,4,C.gold);},
"desk":p=>{p.rect(3,12,26,4,C.wood);p.rect(5,16,3,13,C.brown);p.rect(24,16,3,13,C.brown);p.rect(10,16,12,5,"#a06a3a");},
"chair":p=>{p.rect(9,4,14,12,C.wood);p.rect(8,16,16,3,C.wood);p.rect(9,19,2,10,C.brown);p.rect(21,19,2,10,C.brown);},
/* places in town */
"bus stop":p=>{p.bg(C.sky);p.ground("#c8c8c8",27);p.line([16,10,16,27],C.grey,2);p.circ(16,8,7,C.white,O,1.5);p.circ(16,8,5.5,null,C.blue,1.6);p.rrect(12,5,8,5,1,C.blue);p.rect(25,18,6,9,"#e0e0e0");},
"hospital":p=>{p.bg(C.sky);p.ground(C.green,28);p.building(4,8,24,20,C.white,C.red);p.rect(11,1,10,8,C.white);p.plus(16,5,6,C.red);},
"station":p=>{p.bg(C.sky);p.rect(0,22,32,3,C.grey);p.rect(0,25,32,7,"#c8c8c8");p.rect(-1,9,24,13,C.green);p.rect(1,11,5,5,C.sky);p.rect(8,11,5,5,C.sky);p.rect(15,11,5,5,C.sky);p.rect(23,6,8,16,C.cream);p.rect(23,4,8,3,C.red);},
"library":p=>{p.rect(3,2,26,28,C.wood);[10,18,26].forEach(y=>p.rect(3,y,26,2,C.brown));const cs=[C.red,C.blue,C.green,C.yellow,C.purple,C.orange];for(let r=0;r<3;r++)for(let i=0;i<6;i++)p.rect(5+i*4,4+r*8,3,6,cs[(i+r*2)%6],O,0.6);},
/* fruit and vegetables */
"grapes":p=>{for(let r=0;r<4;r++){const n=4-r;for(let i=0;i<n;i++)p.circ(16-(n-1)*3+i*6,10+r*5,3.4,C.purple);}p.line([16,7,17,2],C.brown,1.4);p.ell(21,5,3.5,1.8,C.leaf,O,-0.3);},
"lemon":p=>{p.ell(16,17,12,9,C.yellow);p.poly([3,17,1,15,1,19],C.yellow);p.poly([29,17,31,15,31,19],C.yellow);p.ell(11,14,3,1.5,"#fff3a0",null);},
"melon":p=>{p.circ(16,17,12,"#a8d870");for(let i=-2;i<=2;i++){p.arc(16+i*12,17,13,i<0?-0.6:Math.PI-0.6,i<0?0.6:Math.PI+0.6,"#e8f6c8",0.8);}p.line([6,11,26,23],"#e8f6c8",0.8);p.line([6,23,26,11],"#e8f6c8",0.8);p.line([16,5,16,2,19,1],C.brown,1.4);},
"orange":p=>{p.circ(16,17,12,C.orange);p.dot(12,13,"#ffc080");p.dot(18,20,"#d07020");p.dot(21,13,"#d07020");p.ell(19,5,4,2,C.leaf,O,-0.3);p.circ(16,6,1,C.brown,null);},
"peach":p=>{p.circ(16,18,11,"#ffb0a0");p.arc(19,18,10,Math.PI*0.75,Math.PI*1.25,"#e07a70",1);p.ell(10,15,3,4,"#ffd0c0",null);p.ell(12,6,4,2,C.leaf,O,0.4);p.ell(20,6,4,2,C.leaf,O,-0.4);},
"pineapple":p=>{p.ell(16,21,8,10,"#e8b040");for(let i=-2;i<=2;i++){p.line([8,16+i*4,24,24+i*4],"#a07020",0.8);p.line([24,16+i*4,8,24+i*4],"#a07020",0.8);}p.ell(16,21,8,10,null);p.poly([16,11,10,2,15,8,16,1,17,8,22,2],C.leaf);},
"kiwi fruit":p=>{p.circ(16,16,12,"#8a6a3a");p.circ(16,16,10,"#8ad04a",null);p.circ(16,16,4,"#f0f8d0",null);for(let k=0;k<12;k++){const a=k*Math.PI/6;p.dot(16+Math.cos(a)*6,16+Math.sin(a)*6,O);}},
"cabbage":p=>{p.circ(16,17,12,"#a8e080");p.arc(16,24,10,Math.PI*1.2,Math.PI*1.8,"#70b050",1);p.arc(10,17,8,-0.8,0.8,"#70b050",1);p.arc(22,17,8,Math.PI-0.8,Math.PI+0.8,"#70b050",1);p.line([16,8,16,26],"#e8f8d0",1);},
"mushroom":p=>{p.rrect(12,16,8,12,3,C.cream);p.pie(16,17,13,Math.PI,0,C.red);[[10,11],[19,8],[22,13],[14,14]].forEach(([x,y])=>p.circ(x,y,1.8,C.white,null));p.line([3,17,29,17]);},
"potato":p=>{p.ell(16,17,13,9,"#c89a5a",O,0.2);[[10,14],[18,20],[22,13],[13,21]].forEach(([x,y])=>p.dot(x,y,"#8a6030"));},
"sausage":p=>{p.rrect(3,12,26,9,4.5,"#b8503a");p.line([7,14,25,14],"#e88a70",1);p.line([2,16.5,0,15],O,1);p.line([30,16.5,32,15],O,1);},
"cheese":p=>{p.poly([3,22,26,8,29,13,29,25,3,27],C.yellow);p.poly([3,22,26,8,29,13,5,24],"#fff0a0");[[12,23],[22,20],[17,25]].forEach(([x,y])=>p.circ(x,y,1.6,"#e0b030",null));},
"parfait":p=>{p.poly([9,8,23,8,19,22,13,22],C.white);p.rect(10,16,12,4,C.red,null);p.rect(11,12,10,4,C.cream,null);p.poly([9,8,23,8,19,22,13,22],null);p.rect(15,22,2,5,C.white);p.ell(16,28,6,1.5,C.white);p.circ(16,6,4,C.white);p.circ(16,2.5,2,C.red);p.rect(19,1,1.5,7,C.brown,null);},
"pizza":p=>{p.poly([16,29,3,6,29,6],C.yellow);p.poly([3,6,29,6,28,3,4,3],"#d89040");[[12,10],[20,11],[16,17],[14,23]].forEach(([x,y])=>p.circ(x,y,2,C.red,null));p.dot(10,14,C.green);p.dot(21,16,C.green);},
/* school rooms */
"classroom":p=>{room(p,"#f3e3c3");p.rect(4,3,24,12,"#2f6a4a");p.line([7,7,14,7],C.white,0.8);p.line([7,10,18,10],C.white,0.8);p.rect(4,15,24,1.5,C.wood);p.desk(3,21,11);p.desk(18,21,11);},
"music room":p=>{room(p);p.rect(3,12,18,12,C.black);for(let i=0;i<7;i++)p.rect(4+i*2.4,18,2.2,6,C.white,O,0.5);note(p,24,9,C.purple);note(p,8,8,C.blue);},
"science room":p=>{room(p,"#e3eef3");p.rect(2,21,28,3,C.grey);p.poly([10,5,14,5,14,11,19,20,5,20,10,11],C.white);p.poly([7,17,17,17,19,20,5,20],C.green,null);p.rect(21,11,5,10,C.white);p.rect(21,15,5,6,C.purple,null);p.circ(13,14,1,C.green,null);},
"gym":p=>{p.bg("#e8d8b8");p.rect(-1,22,34,10,"#d8a868");for(let x=0;x<32;x+=6)p.line([x,22,x-4,32],"#b88848",0.8);p.rect(19,4,10,7,C.white);p.line([21,11,27,11],C.orange,1.5);p.ball(9,18,4,"basket");},
"playground":p=>{p.bg(C.sky);p.ground(C.green,26);p.line([3,26,9,8],C.red,2);p.line([15,26,9,8],C.red,2);p.line([9,9,27,26],C.yellow,3);p.line([20,8,20,26],C.blue,1.6);p.line([30,8,30,26],C.blue,1.6);p.line([20,8,30,8],C.blue,1.6);p.line([24,9,24,20],O,0.6);p.rect(22,20,5,2,C.red);},
"school nurse's office":p=>{room(p,"#eef6f6");p.bed(3,17,20);p.rect(23,4,7,7,C.white);p.plus(26.5,7.5,5,C.red);p.rect(25,14,4,9,C.white);},
"teachers' office":p=>{room(p);p.desk(2,20,13);p.desk(17,20,13);p.kid(9,8,{s:0.7,shirt:"#6a6a8a",hair:"#555"});p.rect(6,7.5,3,1.5,null,O,0.6);p.rect(10,7.5,3,1.5,null,O,0.6);p.rect(19,15,8,5,C.black);p.rect(20,16,6,3,C.sky,null);},
"principal's office":p=>{room(p,"#e8d6c0");p.rect(9,3,14,9,C.gold);p.rect(11,5,10,5,C.sky,null);p.face(16,7.5,2.2,"calm");p.rect(2,17,28,4,"#8a4a2a");p.rect(4,21,4,8,"#8a4a2a");p.rect(24,21,4,8,"#8a4a2a");p.poly([20,17,21,12,25,12,26,17],C.gold);},
"computer room":p=>{room(p,"#e6ecf3");for(let i=0;i<2;i++){const x=3+i*15;p.rect(x,8,12,9,C.black);p.rect(x+1,9,10,7,C.sky,null);p.rect(x+5,17,2,3,C.grey);p.rect(x,20,12,2,C.grey);}p.rect(2,22,28,2,C.wood);},
"cooking room":p=>{room(p,"#f6eee0");p.rect(4,15,24,13,C.white);p.circ(10,19,3,C.black);p.circ(22,19,3,C.black);p.rect(6,24,20,3,C.grey);p.rect(15,8,13,6,C.grey);p.rect(13,9,3,2,C.black);p.line([18,6,19,3],"#c0c0c0",1);p.line([23,6,24,3],"#c0c0c0",1);},
"toilet":p=>{p.bg("#e6f0f6");p.rect(8,4,16,9,C.white);p.ell(16,19,10,5,C.white);p.ell(16,19,6,3,C.sky,null);p.poly([10,22,22,22,20,29,12,29],C.white);},
"entrance":p=>{room(p,"#f0e6d6");p.rect(2,3,16,21,C.wood);for(let r=0;r<4;r++)for(let c=0;c<3;c++)p.rect(3+c*5,4+r*5,4,4,"#d8b080",O,0.6);p.door(21,6,9,18,C.sky);p.rect(5,26,4,2,C.red);p.rect(10,26,4,2,C.blue);},
/* directions: a road with an arrow */
"go straight":p=>{p.bg(C.green);p.poly([10,32,22,32,19,0,13,0],"#9a9aa4");p.arrow(16,28,16,5,C.white,3.5);},
"turn right":p=>{p.bg(C.green);p.rect(11,0,10,32,"#9a9aa4",null);p.rect(11,11,22,10,"#9a9aa4",null);p.line([16,28,16,16,27,16],C.white,3.5);p.poly([30,16,25,11,25,21],C.white);},
"turn left":p=>{p.bg(C.green);p.rect(11,0,10,32,"#9a9aa4",null);p.rect(-1,11,22,10,"#9a9aa4",null);p.line([16,28,16,16,5,16],C.white,3.5);p.poly([2,16,7,11,7,21],C.white);},
/* my day (actions, no clock) */
"wake up":p=>{p.bg("#ffe9b8");p.bed(2,19,28);p.kid(12,10,{s:0.8,wave:"both",shirt:"#c9b6ff",mood:"wow"});p.sun(27,5,3);},
"wash my face":p=>{p.face(16,13,9,"sleepy");p.rect(4,24,24,6,C.white);p.ell(16,24,10,2.5,C.sky);[[7,8],[25,10],[9,20],[24,19]].forEach(([x,y])=>p.ell(x,y,1.3,2,C.water,null));p.ell(5,15,2,3,C.skin);p.ell(27,15,2,3,C.skin);},
"brush my teeth":p=>{p.face(14,16,11,"grin");p.rect(9,18.5,10,2,C.white,null);p.line([18,20,30,13],C.blue,2.2);p.rect(26,10,4,3,C.white);},
"have breakfast":p=>{p.kid(16,7,{s:0.85,shirt:C.red,mood:"yum",wave:"r"});p.rect(1,22,30,4,C.wood);p.plate(12,21,7);p.circ(12,20,2,C.yellow,null);p.rect(20,16,5,6,C.white);},
"go to school":p=>{p.bg(C.sky);p.ground(C.green,27);p.building(17,10,14,17,C.cream,C.red);p.kid(7,12,{walk:true,shirt:C.blue,s:0.9});p.rect(3,15,5,6,C.red);p.arrow(11,6,17,6,C.red,1.6);},
"study":p=>{room(p,"#f3e3c3");p.rect(3,2,26,8,"#2f6a4a");p.line([6,5,15,5],C.white,0.7);p.desk(5,21,22);p.kid(16,11,{s:0.8,shirt:C.green});p.book(11,17,10,4,C.blue);},
"go home":p=>{p.bg("#ffd9a8");p.ground(C.green,27);p.house(19,15,11,12,C.red);p.kid(8,12,{walk:true,shirt:C.blue,s:0.9});p.arrow(11,6,18,6,C.red,1.6);},
"do my homework":p=>{p.bg("#fff0d0");p.rect(20,2,10,9,C.sky);p.line([25,2,25,11],O,0.8);p.rect(2,2,4,10,C.yellow);p.desk(4,22,24);p.kid(16,11,{s:0.8,shirt:C.orange});p.rect(10,18,10,4,C.white);p.text("1+2",15,20,4);},
"take a bath":p=>{p.bg("#e6f2f8");p.rrect(2,17,28,10,3,C.white);p.face(14,14,5,"smile");[[20,14],[24,12],[7,15],[22,9]].forEach(([x,y])=>p.circ(x,y,2.2,C.sky));p.line([28,3,28,8,25,8],C.grey,1.5);p.line([25,10,25,12],C.water,1);},
"go to bed":p=>{p.bg(C.night);p.moon(26,5,3.5);p.bed(2,19,28);p.face(8,16,3.5,"sleepy");p.zz(17,10);}
});

/* ---- Junior Sunshine 5 ---- */
const subjectBook=(c,draw)=>p=>{p.rect(5,4,22,25,c);p.rect(8,4,19,25,C.white,O);p.rect(5,4,4,25,c);draw(p);};
const prep=(where)=>p=>{p.bg(C.sky);p.rect(-1,27,34,6,"#d8c8a8",O);where(p);};
const boxAt=p=>{p.rect(9,15,14,12,"#d8a868");p.line([9,19,23,19],"#a07040",0.8);};
pics.addAll({
"nice to meet you":p=>{p.bg(C.sky);p.ground(C.green,28);p.kid(8,12,{shirt:C.red});p.kid(24,12,{shirt:C.blue,hair:"#7a4a20"});p.circ(16,21,2.6,C.skin);p.line([12,19,14,21],C.red,2.4);p.line([20,19,18,21],C.blue,2.4);p.heart(16,5,3,C.pink);},
"birthday":p=>{p.rect(5,17,22,11,C.pink);p.rect(5,17,22,3,C.white,null);p.rect(3,27,26,3,C.white);[10,16,22].forEach(x=>{p.rect(x-1,9,2.4,8,[C.blue,C.yellow,C.green][(x-10)/6]);p.ell(x+0.2,7,1.3,2,C.orange,null);});},
"present":p=>{p.rect(5,13,22,16,C.red);p.rect(4,10,24,5,"#ff6a60");p.rect(14,10,4,19,C.yellow);p.ell(12,8,4,2.5,C.yellow,O,0.3);p.ell(20,8,4,2.5,C.yellow,O,-0.3);},
"japanese":subjectBook(C.red,p=>p.text("あ",17,16,13,O)),
"english":subjectBook(C.blue,p=>p.text("ABC",17,16,7,C.blue)),
"math":subjectBook(C.green,p=>{p.text("+",13,12,8,C.red);p.text("−",21,12,8,C.blue);p.text("×",13,21,8,C.blue);p.text("÷",21,21,8,C.red);}),
"science":p=>{p.poly([12,3,20,3,20,11,28,26,4,26,12,11],C.white);p.poly([7,20,25,20,28,26,4,26],C.green,null);p.poly([12,3,20,3,20,11,28,26,4,26,12,11],null);p.rect(11,1,10,3,C.grey);p.circ(14,23,1.2,C.white,null);p.circ(19,16,1.5,C.green,null);},
"social studies":p=>{p.rect(3,4,26,24,C.sky);p.poly([22,6,25,9,21,14,18,18,14,20,11,23,7,24,9,20,14,17,18,12,20,8],C.green);p.circ(8,9,4,C.white);p.line([8,6,8,12],C.red,1);p.line([5,9,11,9],O,0.8);},
"music":p=>{note(p,10,24,C.purple);note(p,20,20,C.blue);p.line([4,8,28,8],O,0.6);p.line([4,11,28,11],O,0.6);p.line([4,14,28,14],O,0.6);},
"arts and crafts":p=>{p.ell(14,17,12,10,C.wood);p.circ(8,13,2.4,C.red);p.circ(13,10,2.4,C.yellow);p.circ(19,11,2.4,C.blue);p.circ(9,20,2.4,C.green);p.ell(18,21,3,2.5,"#f6e7c8");p.line([20,28,30,12],C.brown,2);p.line([28,15,30,12],C.purple,2.6);},
"p.e.":p=>{p.bg("#e8d8b8");p.rect(-1,24,34,9,"#d8a868");p.kid(16,9,{walk:true,shirt:C.white,pants:C.blue,wave:"both"});p.ell(16,4.5,5,2,C.red);},
"home economics":p=>{p.rect(9,8,16,12,C.pink);p.poly([9,8,12,3,22,3,25,8],C.pink);p.rect(12,12,10,5,C.white,null);p.line([4,26,14,20],C.grey,1);p.circ(14,20,1,null,O,0.6);p.line([14,20,20,26,26,22],C.red,0.9);p.ell(26,26,5,2.5,C.grey);},
"calligraphy":p=>{p.rect(4,3,16,26,C.white);p.text("書",12,16,14,O);p.line([22,28,28,6],C.brown,2);p.poly([27,5,30,2,29,7],O);},
"swim":p=>{p.bg(C.sky);p.water(15);p.line([8,15,13,10,18,14],C.skin,2.4);p.circ(19,17,4,C.skin);p.ell(19,15.5,4,2,C.yellow,O);p.line([23,18,29,20],C.skin,2.2);p.circ(4,15,2,C.white,null);p.circ(2,18,1.5,C.white,null);},
"run fast":p=>{p.bg(C.sky);p.ground(C.green,28);p.kid(20,10,{walk:true,shirt:C.red,wave:"r"});p.line([2,10,11,10],C.grey,1.2);p.line([4,15,12,15],C.grey,1.2);p.line([1,20,11,20],C.grey,1.2);},
"jump high":p=>{p.bg(C.sky);p.ground(C.green,28);p.line([3,28,3,16],C.grey,1.4);p.line([29,28,29,16],C.grey,1.4);p.line([3,17,29,17],C.red,1.4);p.kid(16,3,{s:0.75,wave:"both",shirt:C.blue});p.arrow(27,13,27,3,C.blue,1.4);},
"cook":p=>{p.kid(13,10,{shirt:C.white,s:0.9});p.rect(8,1,10,4,C.white);p.circ(10,1.5,2.4,C.white);p.circ(16,1.5,2.4,C.white);p.ell(24,24,6,2.5,C.black);p.line([18,24,10,22],C.black,1.6);p.circ(24,22,2,C.yellow,null);p.line([22,17,23,14],"#c0c0c0",0.8);p.line([26,17,27,14],"#c0c0c0",0.8);},
"sing well":p=>{p.kid(12,11,{shirt:C.pink,mood:"grin"});note(p,24,10,C.purple);note(p,27,22,C.blue);p.star(20,4,2.5);},
"play the piano":p=>{p.rect(2,17,28,12,C.black);for(let i=0;i<9;i++)p.rect(3+i*3,17,3,8,C.white,O,0.5);for(let i=0;i<8;i++)if(i%7!==2&&i%7!==6)p.rect(5+i*3,17,2,5,C.black,null);p.kid(16,4,{s:0.7,shirt:C.purple});},
"ride a unicycle":p=>{p.bg(C.sky);p.ground(C.green,29);p.circ(16,24,5,null,O,1.6);p.line([16,24,16,17],C.grey,1.4);p.rect(13,16,6,2,C.black);p.kid(16,3,{s:0.8,wave:"both",shirt:C.orange});},
"skate":p=>{p.poly([5,8,18,8,18,18,24,18,26,22,5,22],C.white);p.rect(5,6,10,3,C.white);p.line([6,13,15,13],O,0.6);p.line([3,26,29,26],C.grey,1.6);p.line([10,22,10,26],C.grey,1);p.line([22,22,22,26],C.grey,1);},
"ski":p=>{p.bg(C.white);p.poly([0,32,0,24,32,10,32,32],"#dbe8f6",null);p.line([4,26,28,16],C.red,1.6);p.line([6,28,30,18],C.red,1.6);p.kid(17,6,{s:0.75,shirt:C.blue,walk:true});p.line([10,10,7,24],C.grey,1);p.line([24,10,27,20],C.grey,1);},
"fly":p=>{p.bg(C.sky);p.cloud(8,24,0.8);p.poly([4,14,14,12,16,8,18,12,28,14,18,16,16,20,14,16],"#8a6a4a");p.circ(16,13,2.5,"#8a6a4a");p.arrow(18,28,28,22,C.white,1.4);},
"on":prep(p=>{boxAt(p);p.ball(16,11,4,C.red);}),
"in":prep(p=>{p.rect(9,15,14,12,"#d8a868");p.poly([9,15,4,11,9,15],null);p.ball(16,17,4,C.red);p.rect(9,19,14,8,"#d8a868");p.poly([9,15,5,10,9,10],"#c08850");p.poly([23,15,27,10,23,10],"#c08850");}),
"under":prep(p=>{p.rect(4,12,24,3,C.wood);p.rect(5,15,2,12,C.brown);p.rect(25,15,2,12,C.brown);p.ball(16,23,4,C.red);}),
"by":prep(p=>{p.rect(4,15,14,12,"#d8a868");p.line([4,19,18,19],"#a07040",0.8);p.ball(24,23,4,C.red);}),
"treasure":p=>{p.rect(4,14,24,14,C.wood);p.rect(4,19,24,2,C.gold);p.circ(9,11,3,C.red);p.circ(16,9,3.5,C.blue);p.circ(23,11,3,C.green);p.sparkle(27,5,3);p.rect(14,18,4,5,C.gold);},
"box":p=>{p.poly([4,12,16,8,28,12,16,16],"#e8c08a");p.poly([4,12,16,16,16,29,4,25],"#d8a868");p.poly([16,16,28,12,28,25,16,29],"#c08850");},
"cup":p=>{p.cup(7,10,15,16,C.white);p.ell(14.5,10.5,7.5,1.8,"#8a5a33");p.line([11,7,12,4],"#c0c0c0",0.8);p.line([16,7,17,4],"#c0c0c0",0.8);p.ell(15,27,11,2,C.white);},
"cap":p=>{p.pie(16,19,10,Math.PI,0,C.blue);p.ell(24,19,9,3,C.blue);p.circ(16,9,1.2,C.white,null);p.line([16,9,16,19],"#3a6ad0",0.8);},
"hero":p=>{p.poly([10,14,22,14,28,30,4,30],C.red);p.kid(16,8,{shirt:C.blue,wave:"r"});p.star(16,16,2.5,C.yellow,null);p.rect(11,5,10,2,C.black,null);},
"kind":p=>{p.bg(C.sky);p.ground(C.green,28);p.kid(9,12,{shirt:C.green});p.kid(23,15,{s:0.75,shirt:C.yellow,mood:"grin"});p.rect(13,18,5,5,C.red);p.heart(16,6,3,C.pink);},
"brave":p=>{p.kid(12,10,{shirt:C.blue,mood:"smile"});p.poly([18,12,30,12,30,20,24,28,18,20],C.grey);p.star(24,18,3,C.yellow);},
"strong":p=>{p.line([2,10,30,10],C.grey,1.6);p.rect(1,5,4,10,C.black);p.rect(27,5,4,10,C.black);p.kid(16,12,{shirt:C.red,mood:"grin",wave:"both"});},
"cool":p=>{p.face(16,17,12,"cool");p.sparkle(28,5,3,C.white);},
"funny":p=>{p.face(16,17,12,"laugh");p.text("HA",5,5,6,C.orange);p.text("HA",27,7,6,C.orange);},
"smart":p=>{p.kid(16,14,{shirt:C.green});p.circ(16,4,4,C.yellow);p.rect(14.5,8,3,2,C.grey);p.line([10,2,8,0],C.yellow,1);p.line([22,2,24,0],C.yellow,1);},
"friendly":p=>{p.bg(C.sky);p.ground(C.green,28);p.kid(11,12,{shirt:C.red,mood:"grin"});p.kid(21,12,{shirt:C.blue,mood:"grin",hair:"#7a4a20"});p.line([15,18,17,18],C.skin,2.4);},
"new year":p=>{for(let i=0;i<3;i++){const x=9+i*7;p.poly([x-2,26,x-2,8-i*3,x+2,6-i*3,x+2,26],"#6ab04a");p.ell(x,7-i*3,2,1,"#c0e8a0",null);}p.rect(5,20,22,10,"#d8b878");p.line([5,24,27,24],C.brown,0.8);p.poly([3,20,8,14,8,20],C.leaf);p.poly([29,20,24,14,24,20],C.leaf);},
"new year's card":p=>{p.rect(6,3,20,26,C.white);p.circ(16,11,5,C.red,null);p.text("賀",16,21,8,C.red);p.line([9,26,23,26],O,0.6);},
"rice cake":p=>{p.ell(16,27,12,3,C.wood);p.ell(16,21,10,5,C.white);p.ell(16,14,7,4,C.white);p.circ(16,8,3.2,C.orange);p.ell(18,6,2,1,C.leaf,null);},
"otoshidama":p=>{p.rect(9,4,14,24,C.red);p.rect(11,6,10,4,C.white,null);p.poly([9,4,16,10,23,4],"#c03028");p.circ(16,19,3.5,C.gold);p.circ(16,19,1.2,C.red,null);},
"shrine":p=>{p.bg(C.sky);p.ground("#d8c8a8",27);p.rect(2,6,28,3,C.red);p.rect(4,11,24,2,C.red);p.rect(7,6,3,21,C.red);p.rect(22,6,3,21,C.red);p.rect(14,9,4,4,C.black);p.rect(1,4,30,2,C.black);},
"spaghetti":p=>{p.plate(16,22,13);for(let i=0;i<6;i++)p.arc(16,19,3+i*1.2,Math.PI*1.1,Math.PI*1.9+i*0.1,C.yellow,1.2);p.ell(16,15,6,3,C.red);p.circ(14,14,1.2,"#a02a20",null);p.line([24,4,20,16],C.grey,1.2);},
"hamburger":p=>{p.pie(16,14,12,Math.PI,0,"#e0a050");p.dot(12,8,C.white);p.dot(18,7,C.white);p.dot(21,10,C.white);p.rect(3,14,26,3,C.green);p.rect(4,17,24,4,"#8a4a2a");p.rect(4,20,24,2,C.yellow);p.rrect(4,22,24,5,2,"#e0a050");},
"french fries":p=>{for(let i=0;i<6;i++)p.rect(8+i*2.8,4+(i%3)*2,2.6,14,C.yellow,O,0.6);p.poly([6,14,26,14,23,29,9,29],C.red);},
"salad":p=>{p.bowl(16,16,26,C.white);p.circ(10,14,4,C.green,null);p.circ(16,12,4.5,"#8ad04a",null);p.circ(22,14,4,C.green,null);p.circ(14,15,2,C.red,null);p.circ(20,13,2,C.red,null);p.bowl(16,16,26,null);p.ell(16,16,13,1.5,null);},
"soup":p=>{p.bowl(16,15,26,C.white);p.ell(16,15,12,2.5,"#e8b060");p.line([11,11,12,7,11,4],"#c0c0c0",0.9);p.line([18,11,19,7,18,4],"#c0c0c0",0.9);p.line([27,6,21,16],C.grey,1.6);p.ell(28,5,2,1.4,C.grey);},
"rice ball":p=>{p.poly([16,4,28,24,26,28,6,28,4,24],C.white);p.rect(10,19,12,10,C.black);},
"curry and rice":p=>{p.ell(16,19,14,8,C.white);p.ell(11,18,7,5,"#fffaf0",null);p.ell(20,19,8,5.5,"#c07a20",null);p.rect(18,17,3,3,C.orange,null);p.rect(21,20,3,2.5,"#f0d070",null);p.ell(16,19,14,8,null);},
"fried chicken":p=>{p.ell(14,15,9,8,"#c87830");[[10,12],[16,10],[18,17],[12,18]].forEach(([x,y])=>p.dot(x,y,"#e8a050"));p.rect(20,18,8,3,C.cream);p.circ(28,17,2,C.cream);p.circ(28,22,2,C.cream);p.ell(13,28,11,2,C.white);},
"juice":p=>{p.rect(9,8,14,21,C.orange);p.rect(9,8,14,4,C.white,null);p.rect(9,8,14,21,null);p.line([19,8,23,1],C.red,1.4);p.circ(16,20,3.5,"#ffc040",null);},
"hundred":p=>{p.circ(16,16,12,"#c0c0c8");p.circ(16,16,9,null,"#9a9aa4");p.text("100",16,17,7,O);},
"thousand":p=>{p.rect(2,8,28,16,"#e8f0e0");p.rect(4,10,24,12,null,"#6a9a6a");p.text("1000",16,16.5,7,"#3a6a3a");},
"yen":p=>{p.circ(11,19,8,"#c0c0c8");p.text("¥",11,19.5,9,O);p.circ(22,12,8,C.gold);p.text("¥",22,12.5,9,O);},
"park":p=>{p.bg(C.sky);p.ground(C.green,24);p.tree(7,14,1.1);p.tree(25,12,1);p.rect(12,20,10,2,C.wood);p.rect(12,23,10,2,C.wood);p.rect(13,24,1.5,4,C.brown);p.rect(19.5,24,1.5,4,C.brown);},
"zoo":p=>{p.bg(C.sky);p.ground(C.green,28);p.circ(16,15,8,"#d88a30");p.circ(16,15,5.5,"#ffc860",null);p.circ(14,14,0.9,O,null);p.circ(18,14,0.9,O,null);p.ell(16,17,1.5,1,O,null);for(let x=2;x<32;x+=5)p.line([x,4,x,28],C.grey,1.4);p.line([0,4,32,4],C.grey,1.4);},
"aquarium":p=>{p.rect(2,4,28,24,"#6ac0f0");p.rect(2,24,28,4,"#e8d8a0",null);p.ell(11,13,5,3,C.orange);p.poly([16,13,19,10,19,16],C.orange);p.circ(9,12,0.8,O,null);p.ell(22,19,4,2.5,C.yellow);p.poly([18,19,15,17,15,21],C.yellow);p.line([26,24,25,14],C.leaf,1.2);p.rect(2,4,28,24,null,O,1.4);},
"museum":p=>{p.bg(C.sky);p.ground("#d8d8d8",27);p.poly([2,10,16,2,30,10],C.white);p.rect(3,10,26,3,C.white);for(let x=5;x<28;x+=6)p.rect(x,13,3,12,C.white);p.rect(2,25,28,2,C.white);},
"supermarket":p=>{p.line([3,6,7,6,10,20,26,20,28,10,8,10],O,1.6);for(let x=11;x<27;x+=4)p.line([x,10,x+0.5,20],O,0.6);p.circ(12,25,2,C.black);p.circ(24,25,2,C.black);p.circ(14,8,3,C.red);p.rect(18,5,5,5,C.yellow);p.ell(24,7,2,3,C.green);},
"convenience store":p=>{store(p,"#3aa860",C.orange);p.text("24",16,10.5,5,C.white);},
"swimming pool":p=>{p.bg("#e8e8e8");p.rect(3,10,26,18,C.water);for(let y=14;y<28;y+=5)p.line([3,y,29,y],C.white,0.6);p.line([4,10,4,3,7,3],C.grey,1.4);p.line([9,10,9,3],C.grey,1.4);p.line([4,6,9,6],C.grey,1);},
"beach":p=>{p.bg(C.sky);p.rect(-1,16,34,8,C.water,null);p.rect(-1,23,34,10,"#f1d58a",null);p.line([10,30,14,12],O,1);p.pie(14,12,9,Math.PI*1.05,Math.PI*1.95,C.red);p.sun(27,5,3);},
"mountain":p=>{p.bg(C.sky);p.poly([0,28,14,6,30,28],"#6a8a5a");p.poly([10,12,14,6,18,12,15,14,13,12],C.white);p.poly([16,28,25,14,34,28],"#7aa06a");},
"river":p=>{p.bg(C.green);p.poly([12,0,20,0,16,10,24,20,22,32,10,32,12,20,6,10],C.water);p.line([14,4,16,6],C.white,0.8);p.line([12,15,14,17],C.white,0.8);p.line([16,26,18,28],C.white,0.8);p.tree(5,24,0.8);p.tree(28,8,0.8);},
"famous":p=>{p.bg("#3a3060");p.poly([6,0,26,0,22,28,10,28],"#6a5f98",null);p.kid(16,11,{shirt:C.red,wave:"r",mood:"grin"});p.star(5,6,2.5);p.star(27,5,2.5);p.star(27,24,2);},
"beautiful":p=>{p.line([16,30,16,16],C.leaf,1.6);p.ell(11,24,4,2,C.leaf,O,0.5);for(let k=0;k<5;k++){const a=k*Math.PI*0.4-Math.PI/2;p.circ(16+Math.cos(a)*5,12+Math.sin(a)*5,4,C.pink);}p.circ(16,12,3,C.yellow);p.sparkle(5,6,3);p.sparkle(27,9,3);p.sparkle(26,24,2);},
"old":p=>{p.bg("#e0d8c8");p.house(5,13,22,15,"#8a7a6a","#c8b898");p.line([9,17,12,20,10,23],O,0.8);p.line([22,15,20,19],O,0.8);p.line([2,3,8,9],"#bbb",0.6);p.line([8,3,2,9],"#bbb",0.6);p.arc(5,6,3,0,6.3,"#bbb",0.6);},
"new":p=>{p.bg(C.sky);p.house(6,13,20,15,C.blue,C.white);p.sparkle(5,6,3.5);p.sparkle(27,5,3);p.sparkle(28,22,2.5);},
"mango":p=>{p.ell(16,18,10,12,"#ffb030",O,0.6);p.ell(11,15,3,5,"#ffd060",null,0.6);p.ell(20,20,5,7,"#f06a30",null,0.6);p.ell(16,18,10,12,null,O,0.6);p.line([22,7,24,4],C.brown,1.4);p.ell(27,5,3,1.6,C.leaf,O,0.2);},
"chicken nanban":p=>{p.ell(16,26,14,3.5,C.white);p.ell(16,19,11,7,"#c87830");p.ell(16,16,8,4,C.cream);[[12,15],[16,14],[19,17],[14,18]].forEach(([x,y])=>p.dot(x,y,C.green));p.rect(4,21,4,2,C.green,null);}
});

/* ---- Junior Sunshine 6 ---- */
const flag=draw=>p=>{p.flag(5,5,24,16,(x,y,w,h)=>draw(p,x,y,w,h));p.rect(3,5,1.5,24,C.grey,null);};
const stripesV=(p,x,y,w,h,cs)=>cs.forEach((c,i)=>p.rect(x+i*w/cs.length,y,w/cs.length+0.5,h,c,null));
const stripesH=(p,x,y,w,h,cs)=>cs.forEach((c,i)=>p.rect(x,y+i*h/cs.length,w,h/cs.length+0.5,c,null));
const goTo=(dest)=>p=>{p.bg(C.sky);p.ground(C.green,28);dest(p);p.kid(6,13,{walk:true,s:0.8,shirt:C.orange});p.arrow(10,6,16,6,C.red,1.4);};
const job=(o,extra)=>p=>{p.bg(o.bg||"#e8eef6");p.kid(14,10,Object.assign({s:1.05},o));extra(p);};
pics.addAll({
"get up":p=>{p.bg("#ffe9b8");p.bed(1,20,18);p.kid(24,10,{shirt:"#c9b6ff",pants:"#c9b6ff",wave:"both"});p.sun(6,5,2.5);},
"eat breakfast":p=>{p.kid(16,7,{s:0.85,shirt:C.red,mood:"yum",wave:"r"});p.rect(1,22,30,4,C.wood);p.plate(12,21,7);p.circ(12,20,2,C.yellow,null);p.rect(20,16,5,6,C.white);},
"walk my dog":p=>{p.bg(C.sky);p.ground(C.green,28);p.kid(9,11,{walk:true,shirt:C.blue});p.ell(24,23,5,3,"#d8a26a");p.circ(28,19,3,"#d8a26a");p.ell(30,18,1.2,2.5,"#8a5a33",null);p.line([20,22,19,26],"#d8a26a",1.4);p.line([27,24,28,27],"#d8a26a",1.4);p.line([13,17,27,19],C.red,0.8);},
"japan":flag((p,x,y,w,h)=>p.circ(x+w/2,y+h/2,4.5,C.red,null)),
"america":flag((p,x,y,w,h)=>{stripesH(p,x,y,w,h,[C.red,C.white,C.red,C.white,C.red,C.white,C.red]);p.rect(x,y,10,8,"#2a3a8a",null);for(let i=0;i<6;i++)p.dot(x+2+(i%3)*3,y+2+Math.floor(i/3)*3,C.white);}),
"australia":flag((p,x,y,w,h)=>{p.rect(x,y,w,h,"#2a3a8a",null);p.rect(x,y,10,7,"#2a3a8a",null);p.line([x,y,x+10,y+7],C.white,1.5);p.line([x+10,y,x,y+7],C.white,1.5);p.line([x+5,y,x+5,y+7],C.red,1.4);p.line([x,y+3.5,x+10,y+3.5],C.red,1.4);p.star(x+5,y+11,2,C.white,null);p.star(x+17,y+4,1.4,C.white,null);p.star(x+18,y+10,1.4,C.white,null);}),
"brazil":flag((p,x,y,w,h)=>{p.rect(x,y,w,h,"#2a9a4a",null);p.poly([x+w/2,y+1,x+w-1,y+h/2,x+w/2,y+h-1,x+1,y+h/2],C.yellow,null);p.circ(x+w/2,y+h/2,3.5,"#2a3a8a",null);}),
"canada":flag((p,x,y,w,h)=>{stripesV(p,x,y,w,h,[C.red,C.white,C.white,C.red]);p.poly([x+11,y+3,x+12.5,y+6,x+15,y+5,x+14,y+9,x+15,y+10,x+11,y+12,x+7,y+10,x+8,y+9,x+7,y+5,x+9.5,y+6],C.red,null);}),
"china":flag((p,x,y,w,h)=>{p.rect(x,y,w,h,C.red,null);p.star(x+5,y+5,3,C.yellow,null);[[10,2],[12,4],[12,7],[10,9]].forEach(([a,b])=>p.star(x+a,y+b,1,C.yellow,null));}),
"egypt":flag((p,x,y,w,h)=>{stripesH(p,x,y,w,h,[C.red,C.white,C.black]);p.ell(x+w/2,y+h/2,1.8,1.5,C.gold,null);}),
"france":flag((p,x,y,w,h)=>stripesV(p,x,y,w,h,["#2a3a8a",C.white,C.red])),
"india":flag((p,x,y,w,h)=>{stripesH(p,x,y,w,h,[C.orange,C.white,"#2a9a4a"]);p.circ(x+w/2,y+h/2,2.2,null,"#2a3a8a",0.9);}),
"italy":flag((p,x,y,w,h)=>stripesV(p,x,y,w,h,["#2a9a4a",C.white,C.red])),
"korea":flag((p,x,y,w,h)=>{p.pie(x+w/2,y+h/2,4,Math.PI,0,C.red,null);p.pie(x+w/2,y+h/2,4,0,Math.PI,"#2a3a8a",null);[[3,3],[w-4,3],[3,h-4],[w-4,h-4]].forEach(([a,b])=>p.rect(x+a-1,y+b-1,3,2.5,C.black,null));}),
"the u.k.":flag((p,x,y,w,h)=>{p.rect(x,y,w,h,"#2a3a8a",null);p.line([x,y,x+w,y+h],C.white,3);p.line([x+w,y,x,y+h],C.white,3);p.line([x,y,x+w,y+h],C.red,1);p.line([x+w,y,x,y+h],C.red,1);p.rect(x+w/2-2.5,y,5,h,C.white,null);p.rect(x,y+h/2-2.5,w,5,C.white,null);p.rect(x+w/2-1.3,y,2.6,h,C.red,null);p.rect(x,y+h/2-1.3,w,2.6,C.red,null);}),
"spain":flag((p,x,y,w,h)=>{stripesH(p,x,y,w,h,[C.red,C.yellow,C.yellow,C.red]);p.rect(x+4,y+5,3,4,"#c03028",null);}),
"see":p=>{p.ell(16,16,13,8,C.white);p.circ(16,16,6,"#5a8ad0");p.circ(16,16,3,O,null);p.circ(18,14,1.2,C.white,null);p.ell(16,16,13,8,null,O);},
"eat":p=>{p.face(13,16,10,"yum");p.line([26,4,26,22],C.grey,1.6);for(let i=0;i<3;i++)p.line([24+i*2,4,24+i*2,9],C.grey,0.8);p.circ(22,20,2.5,C.orange);},
"visit":p=>{p.bg(C.sky);p.ground(C.green,28);p.house(17,15,12,13,C.red);p.kid(8,12,{shirt:C.blue,wave:"r"});p.rect(1,20,5,7,C.orange);p.line([2,20,3,18,5,20],O,0.8);},
"buy":p=>{p.rect(4,12,14,15,"#f0e0c0");p.rrect(7,7,8,8,3,null,O);p.circ(9,10,2.4,C.red,null);p.circ(23,16,6,C.gold);p.text("¥",23,16.5,7,O);p.arrow(19,26,29,26,C.green,1.4);},
"spring":p=>{p.bg(C.sky);p.ground(C.green,28);p.rect(14,14,4,14,C.brown);p.circ(10,12,7,"#ffc0d8");p.circ(22,12,7,"#ffc0d8");p.circ(16,7,7,"#ffc0d8");[[8,10],[18,6],[22,14],[13,14]].forEach(([x,y])=>p.dot(x,y,C.pink));p.dot(4,22,C.pink);p.dot(26,24,C.pink);},
"summer":p=>{p.bg(C.sky);p.sun(25,6,3.5);p.line([12,30,12,15],C.leaf,1.8);p.ell(8,22,3,1.5,C.leaf,O,0.6);for(let k=0;k<10;k++){const a=k*Math.PI/5;p.ell(12+Math.cos(a)*5,12+Math.sin(a)*5,2.6,1.4,C.yellow,O,a);}p.circ(12,12,3.5,"#8a5a20");},
"fall":p=>{p.bg("#ffe6c0");const leaf=(x,y,c,r)=>{p.poly([x,y-5*r,x+2*r,y-2*r,x+5*r,y-2*r,x+3*r,y+1*r,x+4*r,y+4*r,x,y+2*r,x-4*r,y+4*r,x-3*r,y+1*r,x-5*r,y-2*r,x-2*r,y-2*r],c);p.line([x,y+2*r,x,y+6*r],C.brown,1);};leaf(10,11,C.red,1.4);leaf(22,20,C.orange,1.2);leaf(24,6,C.yellow,0.8);},
"winter":p=>{p.bg("#dbe8f6");p.ground(C.white,27);p.circ(16,21,7,C.white);p.circ(16,10,5,C.white);p.circ(14,9,0.8,O,null);p.circ(18,9,0.8,O,null);p.poly([16,11,20,12,16,12.5],C.orange,null);p.rect(10,14,12,2.5,C.red);p.rect(12,2,8,4,C.black);p.rect(10,5,12,1.5,C.black);},
"festival":p=>{p.bg(C.night);p.line([0,6,32,4],O,0.8);[4,12,20,28].forEach((x,i)=>{p.ell(x,10,3,4,i%2?C.red:C.white);p.rect(x-1.5,5,3,1.5,C.black,null);p.rect(x-1.5,13.5,3,1.5,C.black,null);});p.rect(6,18,20,4,C.red);p.rect(8,22,2,10,C.wood);p.rect(22,22,2,10,C.wood);p.poly([4,18,16,13,28,18],C.wood);},
"fireworks":p=>{p.bg(C.night);const burst=(x,y,r,c)=>{for(let k=0;k<12;k++){const a=k*Math.PI/6;p.line([x+Math.cos(a)*r*0.35,y+Math.sin(a)*r*0.35,x+Math.cos(a)*r,y+Math.sin(a)*r],c,1.2);}p.circ(x,y,1.2,c,null);};burst(11,11,8,C.yellow);burst(23,17,6,C.pink);p.line([11,30,11,22],"#6a6a9a",0.8);},
"cherry blossom viewing":p=>{p.bg(C.sky);p.ground(C.green,25);p.rect(3,9,3,16,C.brown);p.circ(4,6,7,"#ffc0d8");p.circ(14,4,6,"#ffc0d8");p.poly([10,26,30,26,28,31,8,31],"#4a8fe8");p.kid(16,17,{s:0.55,shirt:C.red});p.kid(24,17,{s:0.55,shirt:C.green,hair:"#7a4a20"});p.rect(19,26,4,3,C.white);},
"snow festival":p=>{p.bg("#dbe8f6");p.ground(C.white,27);p.rect(5,13,22,14,"#e8f0fa");p.rect(5,10,4,4,"#e8f0fa");p.rect(14,8,4,6,"#e8f0fa");p.rect(23,10,4,4,"#e8f0fa");p.rect(13,19,6,8,"#a8c0e0");p.line([2,4,4,6],C.blue,0.8);p.line([28,3,30,5],C.blue,0.8);},
"hot spring":p=>{p.bg("#c8d8c0");p.ell(16,24,14,6,"#8ac8e8");p.ell(16,24,14,6,null);for(let i=0;i<5;i++)p.rect(2+i*6,20+(i%2),5,3,C.grey);p.face(16,21,4.5,"sleepy");p.rect(13,15,6,2,C.white);p.line([8,12,9,8,8,4],C.white,1.4);p.line([24,12,25,8,24,4],C.white,1.4);},
"sushi":p=>{p.ell(16,27,14,3,C.wood);p.rrect(4,15,11,8,3,C.white);p.rrect(3,12,13,5,2.5,"#ff8a60");p.line([6,13,8,16],C.white,0.6);p.line([10,13,12,16],C.white,0.6);p.rrect(17,15,11,8,3,C.white);p.rrect(16,12,13,5,2.5,C.yellow);p.rect(21,12,3,11,C.black,null);},
"tempura":p=>{p.ell(16,26,13,3.5,C.white);p.poly([4,22,22,8,27,10,10,24],"#f0c060");[[10,19],[15,15],[20,12],[13,21]].forEach(([x,y])=>p.dot(x,y,"#d09030"));p.poly([22,8,28,3,27,10],C.red);},
"kimono":p=>{p.poly([10,4,22,4,26,10,24,30,8,30,6,10],C.pink);p.poly([10,4,16,13,22,4],C.white);p.poly([12,4,16,11,20,4],C.red,null);p.rect(7,15,18,5,C.yellow);[[12,24],[19,26],[10,9],[21,9]].forEach(([x,y])=>p.circ(x,y,1.6,C.white,null));},
"go camping":p=>{p.bg(C.sky);p.ground(C.green,27);p.poly([3,27,13,8,23,27],C.orange);p.poly([10,27,13,16,16,27],"#a85020");p.tree(27,18,0.8);p.line([26,27,28,24,30,27],C.red,1);p.circ(28,25,1,C.yellow,null);},
"go to the sea":goTo(p=>{p.rect(14,16,19,12,C.water,null);p.line([16,19,19,19],C.white,0.8);p.line([24,23,28,23],C.white,0.8);p.rect(14,26,19,3,"#f1d58a",null);}),
"go to the zoo":goTo(p=>{p.rect(16,10,15,18,"#d8a868");p.rect(17,14,13,14,C.green,null);p.circ(23,19,4,"#d88a30");p.circ(23,19,2.6,"#ffc860",null);for(let x=17;x<31;x+=3)p.line([x,14,x,28],C.grey,0.8);}),
"see the milky way":p=>{p.bg(C.night);p.poly([0,24,8,12,22,2,32,0,32,6,22,10,10,20,0,30],"#5a5a9a",null);for(let i=0;i<20;i++)p.dot((i*7.3)%32,(i*11.7)%22,i%3?C.white:C.yellow);p.kid(22,22,{s:0.55,shirt:C.blue,wave:"l"});},
"eat shaved ice":p=>{p.bowl(16,22,22,C.white);p.poly([7,22,16,4,25,22],"#f0f6ff");p.poly([9,18,16,4,23,18,16,14],C.red,null);p.line([22,6,28,14],C.yellow,1.4);p.rect(13,26,6,4,C.white);},
"fun":p=>{p.face(16,18,10,"grin");[[4,4,C.red],[28,6,C.blue],[6,27,C.yellow],[27,26,C.green],[16,3,C.pink],[3,16,C.purple]].forEach(([x,y,c])=>p.rect(x-1.5,y-1,3,2,c,null));},
"exciting":p=>{p.bg(C.sky);p.line([0,26,6,8,12,24,20,4,26,20,32,12],C.red,2);p.line([0,30,6,12,12,28,20,8,26,24,32,16],C.red,1);p.rrect(17,1,8,5,2,C.yellow);p.face(21,1.5,2,"grin");},
"delicious":p=>{p.face(16,13,10,"yum");p.plate(16,27,11);p.rrect(10,23,12,4,2,C.orange);p.sparkle(4,24,2.5);p.sparkle(28,22,2.5);},
"watermelon":p=>{p.pie(16,10,14,0.1,Math.PI-0.1,"#2a9a3a");p.pie(16,10,12,0.1,Math.PI-0.1,C.white,null);p.pie(16,10,11,0.1,Math.PI-0.1,"#ff5a6a",null);[[10,14],[16,17],[22,14],[13,19],[19,19]].forEach(([x,y])=>p.ell(x,y,0.8,1.3,O,null));},
"grandparents' house":p=>{p.bg(C.sky);p.ground(C.green,28);p.poly([1,16,16,6,31,16],"#4a5a7a");p.rect(4,16,24,12,"#e8d8b8");p.rect(10,20,12,8,"#c08850");p.line([16,20,16,28],O,0.6);p.face(7,22,2.5,"smile");p.rect(5,19.5,4,1,C.white,null);p.face(25,22,2.5,"smile");p.rect(23,19.5,4,1,C.grey,null);},
"table tennis":p=>{p.circ(11,13,8,C.red);p.rect(9,20,4,9,C.wood);p.circ(24,8,2.6,C.white);p.rect(2,27,28,3,"#2a8a5a");},
"badminton":p=>{p.ell(10,10,6,7.5,C.cream,O,-0.5);p.line([13,16,20,28],C.grey,1.6);p.poly([22,6,28,2,30,8],C.white);p.circ(23,9,2.2,C.red);},
"rugby":p=>{p.ball(16,16,9,"rugby");p.line([12,14,20,18],C.white,0.8);for(let i=0;i<3;i++)p.line([14+i*2,13+i*1.5,15+i*2,15+i*1.5],C.white,0.8);},
"wheelchair basketball":p=>{p.circ(14,24,6,null,O,1.6);p.circ(14,24,1,O,null);p.line([9,18,20,18,22,26],C.grey,1.6);p.line([9,12,9,19],C.grey,1.6);p.kid(13,5,{s:0.75,shirt:C.blue,wave:"r"});p.ball(24,4,3.5,"basket");},
"skateboarding":p=>{p.bg(C.sky);p.ground("#c8c8c8",28);p.rrect(6,22,20,3,1.5,C.purple);p.circ(10,26,1.6,C.black);p.circ(22,26,1.6,C.black);p.kid(16,4,{s:0.8,wave:"both",shirt:C.orange,walk:true});},
"player":p=>{p.kid(16,10,{shirt:C.red,s:1.1});p.text("10",16,19,6,C.white);},
"olympics":p=>{[[8,12,C.blue],[16,12,C.black],[24,12,C.red],[12,17,C.yellow],[20,17,C.green]].forEach(([x,y,c])=>p.circ(x,y,4.2,null,c,1.6));},
"paralympics":p=>{[[8,C.red,-0.4],[16,C.blue,0],[24,C.green,0.4]].forEach(([x,c,r])=>{p.g.save();p.g.translate(x,16);p.g.rotate(r);p.g.beginPath();p.g.moveTo(-2,6);p.g.quadraticCurveTo(-4,-6,3,-7);p.g.quadraticCurveTo(-1,-2,2,6);p.g.closePath();p.g.fillStyle=c;p.g.fill();p.g.restore();});},
"sports day":p=>{p.bg(C.sky);p.ground("#d8c8a8",25);p.line([0,4,8,8,16,4,24,8,32,4],O,0.6);[[2,5,C.red],[10,7,C.blue],[18,5,C.yellow],[26,7,C.green]].forEach(([x,y,c])=>p.poly([x,y,x+4,y,x+2,y+4],c,null));p.line([20,14,20,30],C.grey,1);p.line([30,14,30,30],C.grey,1);p.line([20,20,30,20],C.red,1);p.kid(9,14,{s:0.75,walk:true,shirt:C.white,wave:"both"});p.ell(9,10.5,3.5,1.3,C.red);},
"school trip":p=>{p.bg(C.sky);p.ground("#c8c8c8",27);p.poly([20,22,26,4,32,22],"#8a6a4a");for(let y=8;y<22;y+=4)p.rect(22,y,8,1.5,"#5a4a3a",null);p.rrect(1,13,21,11,2,C.yellow);for(let x=3;x<19;x+=5)p.rect(x,15,4,4,C.sky);p.circ(6,25,2.4,C.black);p.circ(17,25,2.4,C.black);},
"field trip":p=>{p.bg(C.sky);p.ground(C.green,27);p.poly([14,27,24,10,34,27],"#7aa06a");p.kid(7,13,{walk:true,s:0.75,shirt:C.blue});p.rect(2,16,4,6,C.red);p.kid(16,15,{walk:true,s:0.65,shirt:C.yellow});p.rect(12,17,3,5,C.green);},
"music festival":p=>{p.bg("#3a3060");p.rect(-1,22,34,10,C.wood);p.kid(10,10,{s:0.8,shirt:C.red,mood:"grin"});p.rect(19,13,9,9,"#c08830");p.ell(23.5,13,4.5,1.5,"#e0b050");note(p,27,7,C.yellow);note(p,4,7,C.yellow);},
"drama festival":p=>{p.bg("#3a3060");p.rect(-1,0,6,32,C.red);p.rect(27,0,6,32,C.red);p.face(13,14,6,"grin",C.white);p.face(20,18,6,"sad",C.yellow);},
"swimming meet":p=>{p.bg("#e8e8e8");p.rect(1,10,30,20,C.water);for(let y=15;y<30;y+=5)for(let x=1;x<31;x+=3)p.dot(x,y,y%10?C.red:C.white);p.line([0,7,32,7],O,0.6);[3,9,15,21,27].forEach((x,i)=>p.poly([x,7,x+4,7,x+2,10],[C.red,C.yellow,C.blue,C.green,C.white][i],null));p.ell(12,18,3,2,C.yellow);p.line([15,18,20,16],C.skin,1.6);},
"volunteer day":p=>{p.bg(C.sky);p.ground(C.green,27);p.kid(11,11,{shirt:C.green,wave:"r"});p.poly([20,14,28,14,29,27,19,27],"#d0e0f0");p.line([18,9,20,14],C.grey,1);p.rect(16,24,3,2,C.blue);p.rect(5,26,3,1.5,C.red);},
"graduation ceremony":p=>{p.rect(4,12,24,6,C.white);p.circ(4,15,3,C.white);p.circ(28,15,3,C.white);p.rect(14,11,4,8,C.red);p.poly([8,6,16,2,24,6,16,10],C.black);p.rect(14,6,4,3,C.black);p.line([23,6,24,11],C.gold,0.8);p.text("祝",16,25,8,C.red);},
"entrance ceremony":p=>{p.bg(C.sky);p.ground(C.green,28);p.circ(4,6,6,"#ffc0d8");p.circ(28,5,6,"#ffc0d8");p.rect(14,8,4,20,C.grey);p.rect(26,8,4,20,C.grey);p.kid(8,14,{s:0.75,shirt:"#2a3a6a"});p.rrect(19,17,7,8,2,C.red);p.rect(20,19,5,1.5,"#b02a20",null);},
"teacher":job({shirt:"#6a6a8a",wave:"r"},p=>{p.rect(19,4,12,10,"#2f6a4a");p.text("A",25,9,6,C.white);p.line([20,10,23,4],C.wood,0.8);}),
"doctor":job({shirt:C.white},p=>{p.line([11,15,14,21,17,15],C.grey,0.9);p.circ(14,21.5,1.3,C.grey);p.plus(26,6,6,C.red);}),
"nurse":job({shirt:"#ffd0e0"},p=>{p.rect(10,3,8,3,C.white);p.plus(14,4.5,2.5,C.red);p.rect(22,14,7,10,C.white);p.rect(23,16,5,1,O,null);p.rect(23,19,5,1,O,null);}),
"vet":job({shirt:"#a8e0c8"},p=>{p.ell(25,24,5,3,"#d8a26a");p.circ(28,20,3,"#d8a26a");p.ell(30,19,1.2,2.5,"#8a5a33",null);p.plus(26,6,5,C.green);}),
"baker":job({shirt:C.white},p=>{p.rect(9,0,10,3,C.white);p.ell(25,24,6,3.5,"#e0a050");p.line([22,23,23,25],"#b07020",0.8);p.line([25,22,26,24],"#b07020",0.8);p.line([28,23,29,25],"#b07020",0.8);}),
"florist":job({shirt:C.green},p=>{p.poly([20,29,24,18,28,29],C.paper);[[22,15,C.pink],[26,14,C.red],[24,11,C.yellow],[28,18,C.purple],[20,18,C.white]].forEach(([x,y,c])=>p.circ(x,y,2.4,c));}),
"pilot":job({shirt:"#2a3a6a"},p=>{p.rect(9,2,10,3,"#2a3a6a");p.rect(13,2.5,2,1.5,C.gold,null);p.poly([18,14,32,11,32,13,24,15,28,20,26,20,20,16],C.white);}),
"flight attendant":job({shirt:"#2a5aa8"},p=>{p.poly([11,15,14,17,17,15,14,20],C.red,null);p.rrect(22,4,8,12,4,C.sky);p.rrect(22,4,8,12,4,null,O);p.cloud(26,10,0.3,C.white);}),
"police officer":job({shirt:"#2a3a6a"},p=>{p.rect(9,2,10,3.5,"#2a3a6a");p.rect(8,5,12,1,C.black,null);p.star(14,3.5,1.4,C.gold,null);p.star(12,17,1.6,C.gold,null);p.rect(22,18,7,5,"#2a3a6a");}),
"firefighter":job({shirt:"#c0a030"},p=>{p.pie(14,6,6,Math.PI,0,C.red);p.rect(7,5,14,2,C.red);p.line([20,22,28,14],C.grey,2.2);p.ell(29,10,1.5,3,C.water,null);p.ell(26,7,1.2,2,C.water,null);}),
"farmer":job({shirt:"#5a8ad0",bg:C.sky},p=>{p.ell(14,5,9,2,"#e8c870");p.pie(14,5,4.5,Math.PI,0,"#e8c870");p.rect(-1,27,34,6,"#8a5a33",null);p.poly([22,27,24,18,26,27],C.orange);p.poly([23,18,24,14,25,18],C.leaf);p.poly([27,27,29,20,31,27],C.orange);}),
"scientist":job({shirt:C.white},p=>{p.rect(10,6.5,3,1.6,null,O,0.6);p.rect(15,6.5,3,1.6,null,O,0.6);p.poly([23,12,27,12,27,17,30,25,20,25,23,17],C.white);p.poly([21,22,29,22,30,25,20,25],C.purple,null);}),
"astronaut":p=>{p.bg(C.night);p.star(4,4,1.5,C.white,null);p.star(28,26,1.5,C.white,null);p.rrect(9,14,14,13,4,C.white);p.circ(16,11,8,C.white);p.circ(16,11,5.5,"#5a8ad0");p.ell(14,9,1.5,1,C.white,null);p.rect(13,18,6,4,C.grey);p.circ(26,6,3,"#c8c8d8");},
"soccer player":p=>{p.bg(C.sky);p.ground(C.green,28);p.kid(12,9,{walk:true,shirt:C.blue,s:1.05});p.text("9",12,18,5,C.white);p.ball(25,24,4,"soccer");},
"singer":p=>{p.bg("#3a3060");p.poly([8,0,24,0,28,32,4,32],"#6a5f98",null);p.kid(16,9,{s:1.05,shirt:C.purple,mood:"grin",wave:"r"});p.line([24,4,22,9],O,1.4);p.circ(24,3,1.8,C.grey);p.star(4,5,2);p.star(28,22,2);},
"comedian":p=>{p.bg("#ffe0a0");p.kid(12,10,{shirt:C.red,mood:"laugh",wave:"r",s:1.05});p.poly([20,4,28,1,30,9],C.white);p.line([20,4,30,9],O,0.6);p.text("HA",26,22,6,C.orange);},
"youtuber":p=>{p.bg("#e8eefc");p.kid(9,14,{wave:"r",shirt:C.purple,mood:"grin"});p.line([24,18,21,30],O,1);p.line([24,18,27,30],O,1);p.rect(20,12,9,7,C.black);p.circ(24,15.5,2,C.sky);p.circ(28,11,1.4,C.red,null);},
"game creator":p=>{p.rect(3,3,26,15,C.black);p.rect(5,5,22,11,"#2a6a4a",null);p.rect(8,12,3,3,C.yellow,null);p.rect(18,8,4,4,C.red,null);p.rrect(6,21,20,9,4,C.grey);p.plus(11,25.5,4,C.black);p.circ(20,24,1.4,C.red,null);p.circ(23,26,1.4,C.blue,null);},
"baseball team":p=>team(p,p=>p.ball(27,6,4,"base"),C.white),
"soccer team":p=>team(p,p=>p.ball(27,6,4,"soccer"),C.blue),
"tennis team":p=>team(p,p=>p.ball(27,6,4,"tennis"),C.yellow),
"track and field team":p=>team(p,p=>{p.rect(20,2,11,2.5,C.red);p.rect(21,4,1.6,7,C.white);p.rect(28.4,4,1.6,7,C.white);},C.white),
"brass band":p=>{p.line([4,16,20,16],C.gold,2.4);p.poly([20,10,29,6,29,26,20,22],C.gold);p.rect(8,11,2,5,C.gold);p.rect(12,11,2,5,C.gold);p.rect(16,11,2,5,C.gold);p.circ(3,16,2,C.gold);},
"art club":p=>team(p,p=>{p.ell(26,7,6,5,C.wood);p.circ(24,6,1.2,C.red,null);p.circ(27,5,1.2,C.blue,null);p.circ(28,8,1.2,C.yellow,null);},C.orange),
"computer club":p=>team(p,p=>{p.rect(21,1,10,8,C.black);p.rect(22,2,8,6,C.sky,null);},C.green),
"science club":p=>team(p,p=>{p.poly([24,1,28,1,28,4,31,10,21,10,24,4],C.white);p.poly([22,8,30,8,31,10,21,10],C.green,null);},C.white),
"chorus":p=>{[7,16,25].forEach((x,i)=>p.kid(x,12,{s:0.7,shirt:"#2a3a6a",mood:"grin",hair:i===1?"#7a4a20":C.hair}));note(p,11,6,C.purple);note(p,22,5,C.blue);},
"kendo club":p=>{p.rrect(8,4,16,18,4,"#2a3a6a");for(let y=8;y<19;y+=3)p.line([10,y,22,y],C.grey,0.7);p.line([16,6,16,20],C.grey,0.7);p.rect(6,20,20,8,"#2a3a6a");p.line([2,30,30,2],"#e8d090",1.6);},
"geography":p=>{p.rect(3,5,26,22,"#e8dcc0");p.poly([5,9,12,7,14,12,9,16,6,14],C.green,null);p.poly([16,14,24,10,27,16,22,24,17,20],C.green,null);p.line([3,5,3,27]);p.circ(25,8,2.5,null,C.red,1);p.rect(3,5,26,22,null);},
"history":p=>{p.rect(6,6,20,20,"#f0e0b0");p.rect(3,4,26,4,C.wood);p.rect(3,24,26,4,C.wood);p.poly([10,20,13,13,16,10,19,13,22,20],"#6a6a6a",null);p.rect(13,16,6,4,C.white,null);p.poly([9,14,16,9,23,14],C.black,null);},
"technology":p=>{const gear=(x,y,r,c)=>{for(let k=0;k<8;k++){const a=k*Math.PI/4;p.rect(x+Math.cos(a)*r-1.5,y+Math.sin(a)*r-1.5,3,3,c,null);}p.circ(x,y,r,c);p.circ(x,y,r*0.4,C.white);};gear(11,12,6,C.grey);gear(22,21,5,C.orange);},
"homework":p=>{p.rect(5,4,22,25,C.white);for(let y=10;y<28;y+=4)p.line([7,y,25,y],C.blue,0.5);p.text("1+2=",14,10,5,O);p.poly([20,27,23,13,26,14,22,28],C.yellow);},
"test":p=>{p.rect(5,3,22,26,C.white);p.circ(21,9,5,null,C.red,1.4);p.text("100",21,9.5,5,C.red);for(let y=17;y<28;y+=3)p.line([8,y,24,y],O,0.5);p.line([8,15,10,17,13,13],C.red,1);}
});

/* ---- Sunshine 1-3 ---- */
const sign=(p,x,y,w,h,draw)=>{p.rect(x,y,w,h,C.white);draw(p,x+w/2,y+h/2);};
const town=(p,wall,roof)=>{p.bg(C.sky);p.ground("#c8c8c8",28);p.rect(3,9,26,19,wall||C.cream);p.rect(1,6,30,4,roof||C.red);p.door(13,19,6,9,C.wood);};
const person=(p,o)=>p.kid(16,9,Object.assign({s:1.1},o));
pics.addAll({
"post office":p=>{town(p,C.white,C.red);sign(p,4,12,7,6,(p,x,y)=>{p.line([x-2.2,y-1.6,x+2.2,y-1.6],C.red,1);p.line([x-2.2,y,x+2.2,y],C.red,1);p.line([x,y,x,y+2.4],C.red,1);});p.rect(22,17,5,11,C.red);p.rect(23,19,3,1,O,null);},
"bookstore":p=>{town(p,C.cream,C.blue);p.book(4,12,6,7,C.red);p.book(22,12,6,7,C.green);p.text("¥",25,24,6,C.red);},
"restaurant":p=>{town(p,C.cream,C.orange);p.plate(7,15,3.5);p.line([3,12,3,19],O,0.8);p.line([11,12,11,19],O,0.8);p.ell(25,14,2.4,1.4,C.yellow);p.text("OPEN",25,22,4.5,C.green);},
"frog":p=>{p.ell(16,21,11,7,C.green);p.circ(10,12,4,C.green);p.circ(22,12,4,C.green);p.circ(10,12,2,C.white);p.circ(22,12,2,C.white);p.dot(10,12);p.dot(22,12);p.arc(16,20,5,0.3,2.8,O,0.8);p.ell(6,27,4,2,C.leaf);p.ell(26,27,4,2,C.leaf);},
"bird":p=>{p.bg(C.sky);p.line([2,26,30,26],C.brown,1.6);p.ell(15,18,7,6,C.blue);p.circ(20,12,4.5,C.blue);p.circ(21,11,1,O,null);p.poly([24,12,28,13,24,14],C.orange);p.ell(12,18,4,2.5,"#2f6fc0",O,0.4);p.poly([8,20,2,22,7,17],C.blue);p.line([14,24,14,26],C.orange,1);p.line([17,24,17,26],C.orange,1);},
"play the guitar":p=>{p.bg("#f6e7c8");p.kid(12,7,{shirt:C.green,mood:"grin"});p.ell(16,21,5,4,C.wood,O,-0.5);p.circ(16,21,1.4,O,null);p.line([19,18,29,9],C.brown,1.6);p.rect(28,6,3,4,C.dark);note(p,26,26,C.purple);},
"dance":p=>{p.bg("#ffe1f0");p.kid(16,8,{wave:"both",shirt:C.pink,walk:true,mood:"laugh"});note(p,4,10,C.purple);note(p,27,14,C.blue);},
"draw":p=>{p.rect(3,4,26,22,C.white);p.circ(13,14,5,null,O,1);p.poly([9,10,10,6,12,9],null,O,0.8);p.poly([17,10,16,6,14,9],null,O,0.8);p.line([12,15,13,16,14,15],O,0.6);p.line([30,30,21,19],C.yellow,2.6);p.poly([21,19,19.5,16.5,22.5,18],C.wood,null);},
"drink":p=>{p.kid(13,8,{s:1,shirt:C.blue,wave:"r"});p.rect(18,2,5,8,C.sky);p.rect(18,5,5,5,C.orange,null);p.line([22,2,25,0],C.red,0.8);},
"art":p=>{p.bg("#f6e7c8");p.line([8,30,13,6],C.wood,1.6);p.line([24,30,19,6],C.wood,1.6);p.rect(6,5,20,16,C.white);p.sun(12,10,2);p.poly([7,20,13,13,18,18,21,15,25,20],C.green,null);p.ell(24,26,6,3.5,C.wood);p.circ(22,25,1,C.red,null);p.circ(25,25,1,C.blue,null);p.circ(27,27,1,C.yellow,null);},
"umbrella":p=>{p.bg("#dfe7ef");for(let i=0;i<7;i++)p.line([3+i*4.4,2+(i%3)*2,2+i*4.4,5+(i%3)*2],C.water,0.8);p.pie(16,15,12,Math.PI,Math.PI*2,C.red);p.line([16,15,16,27],O,1.2);p.arc(14,27,2,0,Math.PI,O,1.2);},
"steak":p=>{p.ell(16,19,14,6,"#333",O);p.ell(16,17,11,6,"#8a4528",O);p.line([10,14,20,19],"#5a2a15",1);p.line([13,13,23,18],"#5a2a15",1);p.ell(9,19,2,1,C.white,null);p.circ(25,14,2,C.orange,null);p.circ(27,17,1.5,C.green,null);},
"bank":p=>{town(p,"#e8eef6",C.grey);p.circ(8,16,4,C.gold);p.text("¥",8,16,5,C.dark);p.circ(24,16,4,C.gold);p.text("¥",24,16,5,C.dark);},
"temple":p=>{p.bg(C.sky);p.ground("#d8c8a8",28);p.poly([2,15,16,7,30,15,26,14,6,14],"#5a4a40");p.rect(7,15,18,13,"#b5413a");p.rect(9,18,14,10,C.wood);p.circ(16,4,2,C.gold);},
"sew":p=>{p.bg(C.cream);p.rect(3,12,26,14,C.pink);for(let i=0;i<6;i++)p.line([6+i*4,19,8+i*4,19],O,0.8);p.line([28,4,20,17],C.grey,1);p.circ(27.5,5,0.8,null,O,0.5);p.line([28,5,30,10,28,18],C.red,0.6);},
"home run":p=>{p.bg(C.sky);p.ground(C.green,26);p.rect(0,18,32,8,"#7ac25a",null);p.line([0,18,32,18],C.white,1.2);p.ball(26,6,3,"base");p.line([4,24,20,10],"#c99a62",0.8);p.line([8,22,23,8],"#c99a62",0.8);p.text("HR!",9,9,6,C.red,C.white);},
"cookie":p=>{p.circ(16,16,12,"#d9a05b");[[11,11],[20,12],[13,20],[21,20],[17,15]].forEach(([x,y])=>p.circ(x,y,1.8,C.dark,null));p.poly([24,6,30,4,29,10],C.white,null);},
"windy":p=>{p.bg(C.sky);p.line([2,9,18,9],C.white,1.6);p.arc(18,6,3,-1.6,1.6,C.white,1.6);p.line([4,16,24,16],C.white,1.6);p.arc(24,13,3,-1.6,1.6,C.white,1.6);p.line([2,23,14,23],C.white,1.6);p.arc(14,26,3,-1.6,1.6,C.white,1.6);p.ell(27,26,3,1.5,C.leaf,O,-0.6);p.ell(22,5,2.5,1.3,C.orange,O,0.6);},
"typhoon":p=>{p.bg("#9fb2c6");for(let k=0;k<3;k++)p.arc(16,16,4+k*4,k*1.5,k*1.5+4.2,C.white,1.6);p.circ(16,16,2,"#9fb2c6",C.white,1);for(let i=0;i<5;i++)p.line([3+i*6,26,1+i*6,31],C.water,0.8);},
"temperature":p=>{p.rect(12,3,8,21,C.white);p.circ(16,26,5,C.red);p.rect(14.5,10,3,15,C.red,null);for(let i=0;i<5;i++)p.line([20,6+i*3.5,23,6+i*3.5],O,0.6);p.text("°C",27,10,6,O);},
"bowl":p=>{p.bowl(16,14,22,C.white);p.rect(8,19,16,1.5,C.blue,null);p.line([11,8,23,13],C.wood,1);p.line([12,6,24,11],C.wood,1);},
"goldfish scooping":p=>{p.bg("#5ab4f0");p.ell(10,22,5,3,C.red,null);p.poly([14,22,18,19,18,25],C.red,null);p.ell(24,12,4,2.5,C.orange,null);p.poly([20,12,17,10,17,14],C.orange,null);p.circ(13,10,7,null,C.white,1.4);p.circ(13,10,6,"rgba(255,255,255,1)",null);p.line([18,15,28,26],C.pink,2);},
"doll":p=>{p.poly([10,30,22,30,19,16,13,16],C.red);p.rect(10,22,12,2,C.gold,null);p.circ(16,11,6,C.white);p.pie(16,11,6.2,Math.PI*1.05,Math.PI*1.95,O,null);p.dot(14,12);p.dot(18,12);p.dot(16,14.5,C.red);},
"king":p=>{p.bg("#f4e0ff");p.kid(16,11,{s:1,shirt:C.purple,mood:"cool"});p.poly([10,5,10,0,13,3,16,-1,19,3,22,0,22,5],C.gold);p.rect(8,20,16,2,C.red,null);},
"phone":p=>{p.rrect(9,2,14,28,3,C.black);p.rect(11,5,10,20,C.sky,null);p.circ(16,27.5,1,C.grey,null);p.bubble(12,7,8,5,"",4);p.rect(13,15,6,2,C.green,null);},
"volume":p=>{p.poly([4,12,9,12,15,6,15,26,9,20,4,20],C.grey);p.arc(16,16,5,-0.8,0.8,O,1.2);p.arc(16,16,9,-0.8,0.8,O,1.2);p.arc(16,16,13,-0.8,0.8,O,1.2);},
"surprised":p=>{p.face(16,18,11,"wow");p.line([6,4,8,7],O,1);p.line([16,2,16,5],O,1);p.line([26,4,24,7],O,1);},
"dessert":p=>{p.plate(16,26,13);p.poly([8,25,10,13,22,13,24,25],C.cream);p.rect(9,17,14,2,C.pink,null);p.ell(16,13,6,2,C.white);p.circ(16,10,2.5,C.red);p.line([16,8,17,6],C.leaf,1);},
"cafe":p=>{p.bg("#f6e7c8");p.cup(8,14,14,12,C.white);p.arc(22,20,3.5,-1.6,1.6,O,1.4);p.ell(15,14,7,1.6,"#7a4a20");for(let i=0;i<3;i++)p.arc(11+i*4,8,2,Math.PI*0.6,Math.PI*1.4,C.grey,0.8);p.ell(15,28,12,2,C.white);},
"email":p=>{p.rect(3,8,26,18,C.white);p.line([3,8,16,19,29,8],O,1);p.text("@",25,6,8,C.blue,C.white);},
"ship":p=>{p.bg(C.sky);p.water(24);p.poly([3,18,29,18,25,26,7,26],C.white);p.rect(7,18,18,2,C.red,null);p.rect(9,11,12,7,C.white);p.rect(12,5,4,6,C.red);p.circ(12,14,1,C.sky,null);p.circ(16,14,1,C.sky,null);p.cloud(25,6,0.6);},
"photo":p=>{p.rrect(3,9,26,17,3,C.grey);p.rect(10,6,8,4,C.grey);p.circ(16,17,6,C.black);p.circ(16,17,3.5,C.blue);p.circ(15,16,1,C.white,null);p.rect(23,11,3,2,C.yellow,null);},
"airport":p=>{p.bg(C.sky);p.ground("#bbb",26);p.rect(2,17,20,9,C.white);p.rect(2,17,20,3,C.blue,null);p.rect(24,9,4,17,C.grey);p.rect(22,6,8,4,C.sky);p.poly([10,8,22,6,24,4,25,6,22,8,16,11,19,13,18,14,13,11],C.white);},
"passport":p=>{p.rrect(7,3,18,26,2,"#7a1f2a");p.circ(16,14,5,null,C.gold,1);p.circ(16,14,2,C.gold,null);p.rect(10,23,12,1.5,C.gold,null);},
"video game":p=>{p.rrect(2,9,28,15,7,C.grey);p.rect(7,14,2,7,C.black,null);p.rect(4.5,16.5,7,2,C.black,null);p.circ(22,15,2,C.red);p.circ(26,18.5,2,C.blue);},
"train":p=>{p.bg(C.sky);p.line([0,29,32,29],C.dark,1.4);p.rrect(2,9,28,18,4,C.green);p.rect(2,13,28,2,C.cream,null);p.rect(5,17,6,5,C.sky);p.rect(13,17,6,5,C.sky);p.rect(21,17,6,5,C.sky);p.circ(8,27,2,C.dark);p.circ(24,27,2,C.dark);},
"glasses":p=>{p.circ(9,17,6,C.sky,O,1.4);p.circ(23,17,6,C.sky,O,1.4);p.arc(16,17,3,Math.PI*1.15,Math.PI*1.85,O,1.4);p.line([3,15,1,10],O,1.2);p.line([29,15,31,10],O,1.2);p.line([6,14,8,13],C.white,0.8);p.line([20,14,22,13],C.white,0.8);},
"chocolate":p=>{p.rect(5,6,22,22,"#6a3a20");for(let i=0;i<3;i++)for(let j=0;j<3;j++)p.rect(7+i*6.5,8+j*6.5,5.5,5.5,"#7a4628");p.poly([5,22,27,14,27,28,5,28],C.red);p.text("CHOCO",16,24,4.5,C.white);},
"stone":p=>{p.bg("#e8f0d8");p.poly([4,24,6,15,13,9,22,10,28,17,27,25,18,28,9,28],C.grey);p.line([12,14,16,13],C.white,0.8);p.line([18,20,22,22],"#777",0.8);},
"movie":p=>{p.bg(C.night);p.rect(3,4,26,15,C.white);p.circ(11,10,2,C.yellow,null);p.poly([5,18,12,12,17,16,21,13,27,18],C.green,null);[6,12,20,26].forEach(x=>p.circ(x,25,3,"#b03030"));},
"environment":p=>{p.circ(16,16,13,C.water);p.poly([7,9,13,6,15,11,11,16,7,14],C.green,null);p.poly([18,14,25,12,27,19,21,24,18,20],C.green,null);p.ell(24,5,3,1.5,C.leaf,O,-0.6);p.line([24,5,22,8],O,0.6);p.ell(7,27,3,1.5,C.leaf,O,0.6);},
"bottle":p=>{p.rect(12,2,8,3,C.blue);p.poly([12,5,20,5,24,10,24,29,8,29,8,10],"#cfeaff");p.rect(8,15,16,7,C.green,null);p.line([10,8,10,27],C.white,0.8);},
"reuse":p=>{p.bg("#fff3d6");p.rect(6,10,20,18,"#d8b27a");p.poly([6,10,10,4,22,4,26,10],"#c99a62");p.text("x2",16,19,9,C.green,C.white);},
"recycle":p=>{p.bg("#e8f6e8");for(let k=0;k<3;k++){const a=-Math.PI/2+k*Math.PI*2/3,b=a+Math.PI*2/3,r=10;p.arrow(16+Math.cos(a+0.35)*r,17+Math.sin(a+0.35)*r,16+Math.cos(b-0.35)*r,17+Math.sin(b-0.35)*r,C.green,2);}},
"robot":p=>{p.bg("#e8eef6");p.line([16,3,16,7],O,1);p.circ(16,3,1.5,C.red);p.rect(8,7,16,11,C.grey);p.circ(12,12,2,C.yellow);p.circ(20,12,2,C.yellow);p.rect(13,15,6,1.5,O,null);p.rect(10,19,12,9,C.blue);p.line([10,21,5,25],C.grey,2);p.line([22,21,27,25],C.grey,2);p.rect(11,28,4,3,C.grey);p.rect(17,28,4,3,C.grey);},
"education":p=>{p.bg(C.cream);p.book(3,14,13,14,C.blue);p.book(16,14,13,14,C.red);p.poly([16,2,30,7,16,12,2,7],C.black);p.line([26,8,27,14],C.gold,1);},
"peace":p=>{p.bg(C.sky);p.ell(15,17,9,6,C.white);p.circ(23,12,4,C.white);p.dot(24,11);p.poly([26,12,30,13,26,14],C.orange);p.poly([10,15,3,8,14,12],C.white);p.ell(29,19,3,1.5,C.leaf,O,0.4);p.line([27,14,29,19],C.brown,0.6);},
"chorus contest":p=>{p.bg("#30285a");[7,16,25].forEach((x,i)=>p.kid(x,14,{s:0.62,shirt:C.white,mood:"wow"}));p.poly([12,1,20,1,19,6,13,6],C.gold);p.rect(15,6,2,3,C.gold,null);p.rect(13,9,6,1.5,C.gold,null);note(p,4,8,C.yellow);note(p,26,8,C.yellow);},
"graduation":p=>{p.bg("#ffe1f0");p.kid(16,10,{s:1.05,shirt:C.black,mood:"grin",wave:"r"});p.poly([16,1,28,4,16,7,4,4],C.black);p.line([24,5,25,10],C.gold,1);p.rect(1,22,8,3,C.white);p.line([5,22,5,25],C.red,1);},

/* ---- game sprites (ui: names) ---- */
"ui:seagull":p=>{p.poly([3,10,9,14,15,17,9,17],C.white);p.poly([29,10,23,14,17,17,23,17],C.white);p.ell(16,19,6,4,C.white);p.circ(21,15,3,C.white);p.circ(22,14.5,0.8,O,null);p.poly([23.5,15,28,16,23.5,17],C.yellow);p.line([3,10,6,11],C.grey,1.2);p.line([29,10,26,11],C.grey,1.2);p.line([14,23,13,26],C.orange,0.8);p.line([18,23,19,26],C.orange,0.8);},
"ui:seagull2":p=>{p.poly([4,24,9,20,14,17,10,22],C.white);p.poly([28,24,23,20,18,17,22,22],C.white);p.ell(16,17,6,4,C.white);p.circ(21,13,3,C.white);p.circ(22,12.5,0.8,O,null);p.poly([23.5,13,28,14,23.5,15],C.yellow);p.line([4,24,7,22],C.grey,1.2);p.line([28,24,25,22],C.grey,1.2);p.line([14,21,13,24],C.orange,0.8);p.line([18,21,19,24],C.orange,0.8);},
"ui:shell":p=>{p.poly([16,27,3,14,6,8,11,5,16,4,21,5,26,8,29,14],"#ffc0c8");for(let i=-2;i<=2;i++)p.line([16,26,16+i*5.5,6+Math.abs(i)*1.6],"#e88a9a",0.8);p.poly([12,27,20,27,18,30,14,30],"#ffc0c8");p.line([8,9,10,8],C.white,1);},
"ui:island":p=>{p.ell(16,24,15,5,C.water,null);p.ell(16,22,11,4,"#f0d890");p.line([16,22,14,9],C.brown,1.6);[[-0.3,7],[0.5,6],[2.6,7],[3.3,6]].forEach(([a,l])=>p.ell(14+Math.cos(a)*l/1.5,9+Math.sin(a)*l/3-1,l/1.2,1.8,C.leaf,O,a));},
"ui:kaiju":p=>{p.poly([8,30,6,18,9,9,15,5,22,8,24,15,27,22,30,26,24,26,22,30],"#5bbf6a");p.poly([5,16,2,12,6,12,4,8,8,9],"#3d9a4a");p.circ(13,11,2.2,C.white);p.circ(19,11,2.2,C.white);p.dot(13.5,11.5);p.dot(19.5,11.5);p.line([11,8,14,9],O,1);p.line([21,8,18,9],O,1);p.line([12,16,14,17,16,16,18,17,20,16],O,0.8);p.poly([13,16.5,14,18.5,15,16.5],C.white,null);p.ell(15,24,5,4,"#c8f0c0",null);},
"ui:chest":p=>{p.rect(4,14,24,14,C.wood);p.poly([4,14,6,6,26,6,28,14],"#d89a5a");p.rect(4,13,24,2,C.gold,null);p.rect(14,12,4,6,C.gold);p.rect(15.3,14.5,1.4,2,O,null);p.line([4,22,28,22],C.dark,0.6);},
"ui:cart":p=>{p.line([2,6,7,6,10,22,26,22],O,1.4);p.poly([8,9,29,9,26,19,10,19],C.white);p.line([12,9,13,19],O,0.6);p.line([18,9,18,19],O,0.6);p.line([24,9,23,19],O,0.6);p.circ(12,26,2.2,C.dark);p.circ(24,26,2.2,C.dark);},
"ui:ear":p=>{p.g.beginPath();p.g.ellipse(14,16,8,12,0,0,Math.PI*2);p.g.fillStyle=C.skin;p.g.fill();p.g.strokeStyle="#2a2630";p.g.lineWidth=1;p.g.stroke();p.arc(14,14,4,Math.PI*1.1,Math.PI*2.3,"#d8a080",1.4);p.arc(25,16,3,-0.9,0.9,C.blue,1.2);p.arc(25,16,6,-0.9,0.9,C.blue,1.2);},
"ui:speech":p=>{p.rrect(2,4,28,18,6,C.white);p.poly([8,21,6,29,14,21],C.white,null);p.line([8,22,6,29,14,22],O,1);[10,16,22].forEach(x=>p.circ(x,13,1.8,C.blue,null));},
"ui:abc":p=>{p.rrect(2,6,28,20,3,C.white);p.text("ABC",16,16,9,C.blue);},
"ui:gift":p=>{p.rect(5,13,22,16,C.red);p.rect(3,8,26,6,"#ff6a60");p.rect(14,8,4,21,C.gold,null);p.ell(12,6,4,2.5,C.gold,O,0.4);p.ell(20,6,4,2.5,C.gold,O,-0.4);},
"ui:capsule":p=>{p.rrect(9,2,14,28,7,"#cfeaff");p.g.save();p.g.beginPath();p.g.rect(0,0,32,16);p.g.clip();p.rrect(9,2,14,28,7,C.purple);p.g.restore();p.line([9,16,23,16],O,1);p.star(16,22,3.5,C.yellow);p.line([12,6,12,11],C.white,1.2);},
"ui:machine":p=>{p.circ(16,11,10,"#cfeaff");p.circ(11,13,2.5,C.red);p.circ(17,8,2.5,C.yellow);p.circ(20,14,2.5,C.blue);p.circ(14,17,2.5,C.green);p.rect(7,19,18,11,C.red);p.circ(13,24,2.4,C.white);p.rect(19,24,4,4,C.dark);},
"ui:sword":p=>{p.line([6,26,24,8],"#dde4ee",3);p.poly([22,5,27,5,27,10],"#dde4ee");p.line([5,19,13,27],C.gold,2.2);p.line([3,29,8,24],C.brown,2.4);p.circ(3,29,1.4,C.gold);},
"ui:star":p=>p.star(16,16,13,C.yellow),
"ui:trophy":p=>{p.poly([8,4,24,4,22,16,10,16],C.gold);p.arc(8,9,4,Math.PI*0.5,Math.PI*1.5,C.gold,1.6);p.arc(24,9,4,-Math.PI*0.5,Math.PI*0.5,C.gold,1.6);p.rect(14,16,4,6,C.gold);p.rect(9,22,14,5,C.wood);},
"ui:boat":p=>{p.poly([3,20,29,20,24,28,8,28],C.wood);p.line([16,4,16,20],C.dark,1);p.poly([17,5,27,17,17,17],C.white);p.poly([15,8,7,17,15,17],"#ffd6d6");},
"ui:lock":p=>{p.arc(16,13,6,Math.PI,Math.PI*2,C.grey,2.4);p.line([10,13,10,16],C.grey,2.4);p.line([22,13,22,16],C.grey,2.4);p.rrect(7,15,18,14,2,C.gold);p.circ(16,21,2,O,null);p.rect(15.2,21,1.6,4,O,null);},
/* trap sprites */
"trap:glove":p=>{p.circ(14,16,10,C.red);p.ell(25,14,4.5,6,C.red,O,0.4);p.rect(5,22,14,8,C.white);p.line([10,12,16,10],"#ff8080",1.2);},
"trap:chicken":p=>{p.ell(16,20,10,8,C.white);p.circ(21,10,5,C.white);p.poly([22,4,24,1,25,4,27,2,26,6],C.red);p.poly([25,10,30,11,25,13],C.yellow);p.dot(22,9);p.ell(25,15,1.2,2,C.red,null);p.line([13,28,12,31],C.orange,1);p.line([19,28,20,31],C.orange,1);},
"trap:duck":p=>{p.ell(15,20,11,7,C.yellow);p.circ(21,10,6,C.yellow);p.poly([26,10,31,11,26,13],C.orange);p.dot(22,8);p.ell(12,19,5,3,"#ffc700",O,0.3);p.ell(16,29,13,2,C.water,null);},
"trap:bear":p=>{p.circ(7,8,4,"#9a6338");p.circ(25,8,4,"#9a6338");p.circ(16,17,12,"#9a6338");p.ell(16,22,5,4,C.cream);p.ell(16,20,2,1.4,O,null);p.arc(11,15,2,0.3,2.8,O,1);p.arc(21,15,2,0.3,2.8,O,1);},
"trap:cat":p=>{p.poly([6,14,8,3,15,9],C.orange);p.poly([26,14,24,3,17,9],C.orange);p.circ(16,18,11,C.orange);p.line([10,16,13,17],O,1);p.line([22,16,19,17],O,1);p.line([12,22,14,23,16,22,18,23,20,22],O,0.8);p.line([3,19,9,20],O,0.6);p.line([29,19,23,20],O,0.6);p.zz(27,4);},
"trap:heart":p=>p.heart(16,17,13,C.pink),
"trap:drop":p=>{p.poly([16,3,24,17,24,21,20,27,12,27,8,21,8,17],C.water);p.circ(16,20,8,C.water,null);p.arc(16,20,8,0.2,Math.PI-0.2,O,1);p.line([12,17,13,13],C.white,1.2);p.dot(13,20);p.dot(19,20);},
});

/*PICS:WORDS END*/
})();
