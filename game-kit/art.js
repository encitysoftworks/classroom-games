/* =====================================================================
   CLASSROOM GAME KIT  ·  ART ADD-ON  v1
   Detailed word pictures drawn as SVG (smooth, big, easy to read on a projector).
   Bigger and clearer than the pixel pictures in pictures.js; use these where a picture is shown large.
   Optional. A page that wants it has a script tag holding the two markers
   KIT:ART START and KIT:ART END (written as comments); update-kit.py copies this file between them.
   Everything lives on Kit.art:
     Kit.art.has("apple")            is there a picture for this word?
     Kit.art.svg("apple")            the picture as an <svg> string (scales to its box)
     Kit.art.url("apple")            a data: URL for <img src>
     Kit.art.add("koala", d=>...)    add your own picture: return SVG inside a 200 x 200 box
                                     (use the helpers on d, see below)
   Words are matched by their English text, lower case. Numbers (one..twenty), colors and shapes
   are made by small generators, so they all look alike in style.
   Make look-alike words clearly different (hello = two kids meeting, goodbye = one walking away,
   see you = waving with a calendar for "tomorrow").
   ===================================================================== */
(function(){
"use strict";
const Kit=window.Kit||(window.Kit={});
const O="#2b2118";
const C={skin:"#ffd9b8",skin2:"#f2b98f",hair:"#3a2a20",red:"#e8483f",red2:"#b8302a",blue:"#4a8fe8",blue2:"#2f69b8",
  yellow:"#ffd23f",yellow2:"#e0a91f",green:"#55b84a",green2:"#3a8a33",orange:"#ff9a3c",orange2:"#d9711c",
  purple:"#9b6be0",pink:"#ff8fb8",pink2:"#e86a98",white:"#ffffff",black:"#2a2630",brown:"#9a6338",brown2:"#6e4325",
  grey:"#a7adb7",grey2:"#7d838d",sky:"#d7efff",paper:"#fffaf0",cream:"#fff1d6",gold:"#ffc23a",cheek:"#ff9a9a",leaf:"#3fae4a"};

/* ---------- helpers: each returns an SVG string. Outline is dark and 4 wide unless o/w given ---------- */
const st=(f,o,w)=>`fill="${f||"none"}"`+(o===null?"":` stroke="${o||O}" stroke-width="${w||4}" stroke-linejoin="round" stroke-linecap="round"`);
const d={C,O,
  c:(x,y,r,f,o,w)=>`<circle cx="${x}" cy="${y}" r="${r}" ${st(f,o,w)}/>`,
  e:(x,y,rx,ry,f,o,rot,w)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${rot?`transform="rotate(${rot} ${x} ${y})"`:""} ${st(f,o,w)}/>`,
  r:(x,y,w,h,rx,f,o,lw)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx||0}" ${st(f,o,lw)}/>`,
  p:(path,f,o,w)=>`<path d="${path}" ${st(f,o,w)}/>`,
  l:(path,col,w)=>`<path d="${path}" fill="none" stroke="${col||O}" stroke-width="${w||4}" stroke-linecap="round" stroke-linejoin="round"/>`,
  t:(x,y,s,size,f,weight,extra)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${f||O}" font-weight="${weight||800}" text-anchor="middle" font-family="Andika,'M PLUS Rounded 1c',Arial,sans-serif" ${extra||""}>${s}</text>`,
  shine:(x,y,rx,ry,rot)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55" ${rot?`transform="rotate(${rot} ${x} ${y})"`:""}/>`,
  shadow:(x,y,rx)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx*0.16}" fill="#000" opacity=".12"/>`,
  g:(inner,tr)=>`<g transform="${tr}">${inner}</g>`,
  star:(x,y,r,f,o,w)=>{let s="";for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*0.45:r;s+=(i?"L":"M")+(x+Math.cos(a)*rr).toFixed(1)+" "+(y+Math.sin(a)*rr).toFixed(1);}return `<path d="${s}Z" ${st(f,o,w)}/>`;},
  heart:(x,y,s,f,o,w)=>`<path d="M${x} ${y+s*0.9}C${x-s*1.4} ${y+s*0.1} ${x-s*1.1} ${y-s*0.9} ${x} ${y-s*0.35}C${x+s*1.1} ${y-s*0.9} ${x+s*1.4} ${y+s*0.1} ${x} ${y+s*0.9}Z" ${st(f,o,w)}/>`,
  sparkle:(x,y,s,f)=>`<path d="M${x} ${y-s}Q${x+s*0.15} ${y-s*0.15} ${x+s} ${y}Q${x+s*0.15} ${y+s*0.15} ${x} ${y+s}Q${x-s*0.15} ${y+s*0.15} ${x-s} ${y}Q${x-s*0.15} ${y-s*0.15} ${x} ${y-s}Z" fill="${f||C.gold}" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>`,
  poly:(pts,f,o,w)=>`<polygon points="${pts}" ${st(f,o,w)}/>`
};

/* a front-facing kid, feet at (x,y). opt: s scale, hair, shirt, pants, arm "wave"|"down"|"up"|"both", mood, girl */
function kid(x,y,opt){
  opt=opt||{};const s=opt.s||1,shirt=opt.shirt||C.blue,pants=opt.pants||"#4a4f6b",hair=opt.hair||C.hair;
  const arm=(side,pose)=>{const sx=side*20;let path;
    if(pose==="up")path=`M${sx} -78 L${side*38} -128`;
    else if(pose==="wave")path=`M${sx} -78 Q${side*44} -92 ${side*40} -126`;
    else path=`M${sx} -78 L${side*30} -40`;
    const end=pose==="down"?[side*30,-40]:pose==="up"?[side*38,-128]:[side*40,-126];
    return d.l(path,O,16)+d.l(path,shirt,9)+d.c(end[0],end[1],8,C.skin);};
  let a=opt.arm||"down";
  let g="";
  g+=d.shadow(0,0,34);
  g+=d.r(-15,-36,12,34,5,pants)+d.r(3,-36,12,34,5,pants);
  g+=d.e(-10,-3,10,5,"#5a4636")+d.e(10,-3,10,5,"#5a4636");
  g+=arm(-1,a==="both"?"wave":(a==="wave-left"?"wave":"down"))+arm(1,a==="wave"||a==="both"?"wave":a==="up"?"up":"down");
  g+=opt.girl?d.p("M-24 -84 Q-26 -40 -34 -26 L34 -26 Q26 -40 24 -84 Z",shirt):d.r(-24,-86,48,54,14,shirt);
  g+=headFace(0,-116,30,{hair,mood:opt.mood||"smile",girl:opt.girl});
  return d.g(g,`translate(${x} ${y}) scale(${s})`);
}
/* a simple head at (x,y) radius r. mood: smile|grin|open|o|flat */
function headFace(x,y,r,opt){
  opt=opt||{};const hair=opt.hair||C.hair,k=r/30;let g="";
  if(opt.girl)g+=d.p(`M${x-r*1.05} ${y} Q${x-r*1.2} ${y+r*1.1} ${x-r*0.6} ${y+r*1.05} L${x+r*0.6} ${y+r*1.05} Q${x+r*1.2} ${y+r*1.1} ${x+r*1.05} ${y} Z`,hair);
  g+=d.c(x-r*0.98,y+r*0.08,r*0.22,C.skin)+d.c(x+r*0.98,y+r*0.08,r*0.22,C.skin);
  g+=d.c(x,y,r,C.skin);
  g+=d.p(`M${x-r} ${y-r*0.05} Q${x-r*1.02} ${y-r*1.05} ${x} ${y-r*1.04} Q${x+r*1.02} ${y-r*1.05} ${x+r} ${y-r*0.05} Q${x+r*0.6} ${y-r*0.55} ${x+r*0.1} ${y-r*0.5} Q${x-r*0.5} ${y-r*0.62} ${x-r} ${y-r*0.05} Z`,hair);
  g+=d.c(x-r*0.36,y+r*0.12,r*0.1,O,null)+d.c(x+r*0.36,y+r*0.12,r*0.1,O,null);
  g+=d.e(x-r*0.62,y+r*0.42,r*0.15,r*0.09,C.cheek,null)+d.e(x+r*0.62,y+r*0.42,r*0.15,r*0.09,C.cheek,null);
  const m=opt.mood||"smile";
  if(m==="smile")g+=d.l(`M${x-r*0.25} ${y+r*0.42} Q${x} ${y+r*0.65} ${x+r*0.25} ${y+r*0.42}`,O,3*k);
  else if(m==="open"||m==="grin")g+=d.p(`M${x-r*0.28} ${y+r*0.38} Q${x} ${y+r*0.85} ${x+r*0.28} ${y+r*0.38} Z`,"#c4473f",O,3*k);
  else if(m==="o")g+=d.e(x,y+r*0.5,r*0.12,r*0.15,"#c4473f",O,0,3*k);
  else g+=d.l(`M${x-r*0.2} ${y+r*0.5} L${x+r*0.2} ${y+r*0.5}`,O,3*k);
  return g;
}

/* ---------- big face for feelings: head fills the picture ---------- */
function face(mood){
  const x=100,y=108,r=66;let g="",extra="",top="";
  g+=d.shadow(100,190,60);
  g+=d.c(x-r*0.98,y+6,15,C.skin)+d.c(x+r*0.98,y+6,15,C.skin);
  const skin=mood==="sick"?"#d8e8b8":C.skin;
  g+=d.c(x,y,r,skin);
  g+=d.p(`M${x-r} ${y-4} Q${x-r} ${y-r-2} ${x} ${y-r-2} Q${x+r} ${y-r-2} ${x+r} ${y-4} Q${x+40} ${y-36} ${x+6} ${y-34} Q${x-30} ${y-44} ${x-r} ${y-4} Z`,C.hair);
  const eye=(ex,kind)=>{switch(kind){
    case "dot":return d.c(ex,y+6,8,O,null)+d.c(ex+3,y+3,2.5,"#fff",null);
    case "happy":return d.l(`M${ex-11} ${y+10} Q${ex} ${y-6} ${ex+11} ${y+10}`,O,5);
    case "star":return d.star(ex,y+6,15,C.gold,O,3);
    case "half":return d.l(`M${ex-11} ${y+8} L${ex+11} ${y+8}`,O,5)+d.p(`M${ex-10} ${y+8} Q${ex} ${y+16} ${ex+10} ${y+8} Z`,O,null);
    case "tired":return d.c(ex,y+8,6,O,null)+d.l(`M${ex-10} ${y+20} Q${ex} ${y+25} ${ex+10} ${y+20}`,"#9a7f9a",3);
    case "sad":return d.c(ex,y+8,8,O,null)+d.c(ex+3,y+5,2.5,"#fff",null);
    case "angry":return d.c(ex,y+10,7,O,null);
    case "x":return d.l(`M${ex-8} ${y} L${ex+8} ${y+16} M${ex+8} ${y} L${ex-8} ${y+16}`,O,4);
  }};
  const cheeks=d.e(x-42,y+30,12,7,C.cheek,null)+d.e(x+42,y+30,12,7,C.cheek,null);
  const two=(k)=>eye(x-26,k)+eye(x+26,k);
  switch(mood){
    case "fine":g+=two("dot")+cheeks+d.l(`M${x-18} ${y+32} Q${x} ${y+44} ${x+18} ${y+32}`,O,5);
      extra=d.c(166,48,24,C.green)+d.l("M154 48 L163 58 L179 38",C.white,7);break;
    case "happy":g+=two("happy")+cheeks+d.p(`M${x-26} ${y+26} Q${x} ${y+66} ${x+26} ${y+26} Z`,"#c4473f")+d.p(`M${x-12} ${y+44} Q${x} ${y+38} ${x+12} ${y+44} Q${x} ${y+52} ${x-12} ${y+44}Z`,"#ff8a8a",null);
      extra=d.heart(30,46,13,C.pink)+d.heart(172,40,10,C.pink);break;
    case "good":g+=two("dot")+cheeks+d.p(`M${x-20} ${y+28} Q${x} ${y+50} ${x+20} ${y+28} Z`,"#c4473f");
      extra=d.g(d.r(-14,-4,30,34,9,C.skin)+d.r(-6,-36,14,38,7,C.skin)+d.l("M-12 8 L14 8 M-12 18 L14 18",C.skin2,3),"translate(160 150) rotate(-8)");break;
    case "great":g+=two("star")+cheeks+d.p(`M${x-30} ${y+24} Q${x} ${y+72} ${x+30} ${y+24} Z`,"#c4473f");
      extra=d.sparkle(26,40,14)+d.sparkle(176,46,16)+d.sparkle(170,150,10)+d.sparkle(30,150,10);break;
    case "sad":top=d.l(`M${x-38} ${y-16} L${x-16} ${y-24} M${x+38} ${y-16} L${x+16} ${y-24}`,O,4);
      g+=two("sad")+d.l(`M${x-18} ${y+42} Q${x} ${y+28} ${x+18} ${y+42}`,O,5)+d.p(`M${x-28} ${y+18} Q${x-34} ${y+34} ${x-28} ${y+38} Q${x-22} ${y+34} ${x-28} ${y+18}Z`,"#7cc4ff",O,2.5);
      extra=d.e(170,52,22,14,"#c9d3e3")+d.e(150,48,16,12,"#c9d3e3")+d.l("M146 70 L142 82 M160 70 L156 82 M174 70 L170 82",C.blue,3);break;
    case "sleepy":g+=two("half")+cheeks+d.e(x,y+38,9,11,"#c4473f");
      extra=d.t(158,58,"Z",34,C.blue2,800)+d.t(178,34,"z",24,C.blue2,800)+d.t(140,78,"z",18,C.blue2,800);break;
    case "tired":g+=two("tired")+d.l(`M${x-18} ${y+40} Q${x-9} ${y+34} ${x} ${y+40} Q${x+9} ${y+46} ${x+18} ${y+40}`,O,4);
      top=d.l(`M${x-36} ${y-20} L${x-16} ${y-14} M${x+36} ${y-20} L${x+16} ${y-14}`,O,4);
      extra=d.p("M162 70 Q150 92 162 98 Q174 92 162 70Z","#a8dcff",O,3)+d.l("M24 150 Q14 160 26 168",C.grey2,3)+d.l("M14 132 Q4 142 16 150",C.grey2,3);break;
    case "hungry":g+=two("dot")+d.p(`M${x-20} ${y+28} Q${x} ${y+56} ${x+20} ${y+28} Z`,"#c4473f")+d.p(`M${x+12} ${y+44} Q${x+12} ${y+58} ${x+18} ${y+60} Q${x+22} ${y+52} ${x+16} ${y+42}Z`,"#a8dcff",O,2);
      extra=d.c(150,34,6,C.white,O,3)+d.c(140,20,0,C.white)+d.e(170,30,30,22,C.white,O,0,3)+d.c(144,56,5,C.white,O,3)+
        d.p("M150 30 Q170 50 190 30 Z",C.white)+d.e(170,28,18,6,C.white,O,0,3)+d.c(164,22,4,"#fff",O,2)+d.c(172,20,4,"#fff",O,2)+d.c(178,24,4,"#fff",O,2)+d.l("M184 6 L168 30 M192 10 L176 32",C.brown,3);break;
    case "angry":top=d.l(`M${x-40} ${y-18} L${x-14} ${y-6} M${x+40} ${y-18} L${x+14} ${y-6}`,O,6);
      g+=two("angry")+d.e(x-42,y+30,14,8,"#ff6b6b",null)+d.e(x+42,y+30,14,8,"#ff6b6b",null)+d.r(x-20,y+32,40,16,6,"#fff")+d.l(`M${x-20} ${y+40} L${x+20} ${y+40}`,O,2.5);
      extra=d.l("M156 32 Q164 40 156 48 M176 32 Q168 40 176 48 M150 38 Q158 30 166 38 M182 38 Q174 30 166 38",C.red,5)+d.p("M20 70 Q12 54 22 42 Q28 54 36 46 Q34 64 20 70Z",C.grey,O,3);break;
    case "sick":g+=two("tired")+d.l(`M${x-14} ${y+42} Q${x} ${y+36} ${x+14} ${y+42}`,O,4)+d.r(x+6,y+34,46,8,4,C.white)+d.c(x+52,y+38,7,C.red);
      top=d.r(x-44,y-58,88,24,10,"#cfe8ff")+d.l(`M${x-30} ${y-46} L${x+30} ${y-46}`,"#9cc7ef",3);
      extra=d.p("M30 78 Q20 96 30 102 Q40 96 30 78Z","#a8dcff",O,3);break;
  }
  return g+top+extra;
}

/* ring + arrow to point at a part */
const ring=(x,y,rx,ry)=>d.e(x,y,rx,ry,"none","#ffb000",0,7)+d.e(x,y,rx,ry,"none","#fff3",0,2);
const arrowTo=(x,y,fx,fy)=>{const a=Math.atan2(y-fy,x-fx),hx=x-Math.cos(a)*4,hy=y-Math.sin(a)*4;
  const L=(ang)=>`${(hx-Math.cos(a+ang)*16).toFixed(1)} ${(hy-Math.sin(a+ang)*16).toFixed(1)}`;
  return d.l(`M${fx} ${fy} L${hx} ${hy}`,O,10)+d.l(`M${fx} ${fy} L${hx} ${hy}`,"#ffb000",5)+d.p(`M${hx} ${hy} L${L(0.5)} L${L(-0.5)} Z`,"#ffb000",O,3);};
function bodyPart(part){
  const x=100,y=104,r=62;let g=d.shadow(100,190,58);
  g+=d.c(x-r*0.98,y+6,15,C.skin)+d.c(x+r*0.98,y+6,15,C.skin)+d.l(`M${x-r*0.98-4} ${y+2} Q${x-r*0.98} ${y+12} ${x-r*0.98+6} ${y+10}`,C.skin2,3);
  g+=d.c(x,y,r,C.skin);
  g+=d.p(`M${x-r} ${y-4} Q${x-r} ${y-r-2} ${x} ${y-r-2} Q${x+r} ${y-r-2} ${x+r} ${y-4} Q${x+40} ${y-34} ${x+6} ${y-32} Q${x-30} ${y-42} ${x-r} ${y-4} Z`,C.hair);
  g+=d.e(x-24,y+4,9,11,"#fff")+d.e(x+24,y+4,9,11,"#fff")+d.c(x-23,y+6,5.5,O,null)+d.c(x+25,y+6,5.5,O,null);
  g+=d.p(`M${x} ${y+12} Q${x-8} ${y+26} ${x} ${y+28} Q${x+6} ${y+28} ${x+5} ${y+24}`,"none",C.skin2,4);
  g+=d.p(`M${x-18} ${y+38} Q${x} ${y+54} ${x+18} ${y+38} Z`,"#c4473f");
  if(part==="head")g+=d.e(x,y-6,r+20,r+18,"none","#ffb000",0,8)+arrowTo(x+52,y-62,182,14);
  if(part==="eyes")g+=ring(x-24,y+5,18,17)+ring(x+24,y+5,18,17)+arrowTo(x,y-14,100,6);
  if(part==="ears")g+=ring(x-r+2,y+6,18,24)+ring(x+r-2,y+6,18,24)+arrowTo(x-r-6,y-22,12,20)+arrowTo(x+r+6,y-22,188,20);
  if(part==="nose")g+=ring(x,y+20,16,17)+arrowTo(x+16,y+20,186,18);
  if(part==="mouth")g+=ring(x,y+44,28,17)+arrowTo(x+28,y+52,186,170);
  return g;
}

/* compare two of the same thing, ring the target one. kind big|small|long|short */
function compare(kind){
  let g="";
  if(kind==="big"||kind==="small"){
    const blob=(x,y,r,hl)=>d.shadow(x,y+r,r)+d.c(x,y,r,hl?C.orange:"#f3c9a0")+d.shine(x-r*0.35,y-r*0.4,r*0.25,r*0.15,-30)+d.c(x-r*0.3,y-r*0.05,r*0.09,O,null)+d.c(x+r*0.3,y-r*0.05,r*0.09,O,null)+d.l(`M${x-r*0.18} ${y+r*0.25} Q${x} ${y+r*0.4} ${x+r*0.18} ${y+r*0.25}`,O,3);
    g+=blob(70,110,56,kind==="big")+blob(162,148,20,kind==="small");
    g+=kind==="big"?d.c(70,110,68,"none","#ffb000",7):d.c(162,148,30,"none","#ffb000",6);
  }else{
    const snake=(y,len,hl)=>{const col=hl?C.green:"#b9dcb0";return d.l(`M30 ${y} L${30+len} ${y}`,O,26)+d.l(`M30 ${y} L${30+len} ${y}`,col,18)+d.c(30+len,y,16,col)+d.c(30+len+4,y-5,3.5,O,null)+d.l(`M${30+len+14} ${y+2} l10 0 m0 0 l5 -4 m-5 4 l5 4`,C.red,2.5);};
    g+=snake(70,kind==="long"?130:130,kind==="long")+snake(140,kind==="short"?44:44,kind==="short");
    g+=kind==="long"?d.r(10,42,186,56,28,"none","#ffb000",7):d.r(10,112,104,56,28,"none","#ffb000",7);
  }
  return g;
}

/* ---------- numbers: big numeral + counters in ten-frames ---------- */
const NUM=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
function number(n){
  const big=n>10,h=big?54:60,ch=h/2;
  let g=d.t(100,big?62:92,String(n),big?62:90,O,800);
  const frame=(fx,fy,count)=>{let s=d.r(fx,fy,150,h,8,"#fff",O,3);
    for(let i=1;i<5;i++)s+=d.l(`M${fx+i*30} ${fy} L${fx+i*30} ${fy+h}`,"#c9bfae",2);s+=d.l(`M${fx} ${fy+ch} L${fx+150} ${fy+ch}`,"#c9bfae",2);
    for(let i=0;i<count;i++){const cx=fx+15+(i%5)*30,cy=fy+ch/2+Math.floor(i/5)*ch;s+=d.c(cx,cy,big?10:11,C.red,O,2.5)+d.c(cx-3,cy-4,3,"#fff",null);}
    return s;};
  if(!big)g+=frame(25,118,n);
  else g+=frame(25,76,10)+frame(25,138,n-10);
  return g;
}

/* ---------- colors: paint splash + crayon ---------- */
const COLORS={red:C.red,blue:C.blue,yellow:C.yellow,green:C.green,orange:C.orange,purple:C.purple,pink:C.pink,white:"#ffffff",black:"#2a2630",brown:C.brown,
  gray:"#9aa0aa",grey:"#9aa0aa",gold:C.gold,silver:"#c9cfd8","light blue":"#8fd0ff"};
function color(name){
  const c=COLORS[name];
  let g=d.p("M100 30 Q124 22 132 44 Q160 34 162 62 Q186 76 168 98 Q184 124 158 132 Q160 162 130 156 Q112 180 92 160 Q64 172 58 146 Q28 140 38 114 Q18 92 42 78 Q38 48 66 50 Q76 24 100 30Z",c);
  g+=d.c(176,46,9,c)+d.c(28,150,7,c)+d.c(170,160,6,c);
  g+=d.shine(80,64,18,9,-25);
  g+=d.g(d.r(-11,-60,22,104,4,c)+d.p("M-11 -60 L0 -84 L11 -60 Z",c)+d.r(-11,-34,22,48,0,"#fff",O,3)+d.l("M-11 -26 L11 -26 M-11 6 L11 6",c,3),"translate(140 150) rotate(35)");
  return g;
}

/* ---------- shapes ---------- */
function shape(name){
  const f={circle:C.red,triangle:C.green,square:C.blue,rectangle:C.orange,star:C.yellow,heart:C.pink,diamond:C.purple,oval:"#5ec6c0"}[name];
  let g=d.shadow(100,184,62);
  if(name==="circle")g+=d.c(100,100,72,f);
  if(name==="triangle")g+=d.p("M100 22 L178 168 L22 168 Z",f,O,5);
  if(name==="square")g+=d.r(30,30,140,140,6,f,O,5);
  if(name==="rectangle")g+=d.r(12,54,176,96,6,f,O,5);
  if(name==="star")g+=d.star(100,104,84,f,O,5);
  if(name==="heart")g+=d.heart(100,104,70,f,O,5);
  if(name==="diamond")g+=d.p("M100 16 L166 100 L100 184 L34 100 Z",f,O,5);
  if(name==="oval")g+=d.e(100,100,86,58,f,O,0,5);
  return g+d.shine(70,62,20,10,-30);
}

/* ---------- hand-drawn pictures. 200 x 200 box ---------- */
const PIC={
"hello":()=>{let g=d.r(0,150,200,50,0,"#cfeac0",null)+d.c(100,30,16,C.gold)+d.l("M100 4 L100 8 M74 30 L78 30 M122 30 L126 30 M82 12 L85 15 M118 12 L115 15",C.gold,4);
  g+=kid(54,180,{s:0.95,shirt:C.blue,arm:"wave-left",mood:"open"})+kid(146,180,{s:0.95,shirt:C.pink,arm:"wave",mood:"open",girl:true});
  return g;},
"hi":()=>PIC.hello(),
"goodbye":()=>{let g=d.r(0,150,200,50,0,"#cfeac0",null)+d.p("M150 150 L190 40 L196 150Z","#f3e0c4",null);
  g+=d.r(150,30,46,120,4,"#c08850")+d.c(158,94,4,C.gold);
  g+=kid(52,182,{s:0.95,shirt:C.blue,arm:"wave",mood:"smile"});
  g+=kid(132,148,{s:0.55,shirt:C.pink,arm:"wave-left",mood:"smile",girl:true});
  g+=d.l("M96 176 L108 170 M112 166 L122 160",C.grey2,4)+d.p("M110 138 L132 120 L130 132 L144 132 L144 144 L130 144 L132 156Z","#ffb000",O,3);
  return g;},
"see you":()=>{let g=kid(64,184,{s:1,shirt:C.green,arm:"wave",mood:"open"});
  g+=d.r(116,26,76,80,8,"#fff")+d.r(116,26,76,22,8,C.red)+d.l("M132 20 L132 34 M176 20 L176 34",O,5)+d.t(154,88,"→",34,C.blue2,800);
  g+=d.c(150,140,20,C.gold)+d.l("M150 108 L150 114 M150 166 L150 172 M118 140 L124 140 M176 140 L182 140 M128 118 L132 122 M172 118 L168 122",C.gold,4)+d.c(144,136,3,O,null)+d.c(156,136,3,O,null)+d.l("M144 146 Q150 151 156 146",O,2.5);
  return g;},
"name":()=>{let g=d.shadow(100,180,70)+d.r(22,48,156,112,14,"#fff")+d.r(22,48,156,34,14,C.blue)+d.r(22,66,156,16,0,C.blue,null)+d.t(100,74,"Hello! I'm",19,"#fff",800);
  g+=d.t(100,132,"Sakura",36,O,800,`font-style="italic"`)+d.l("M44 144 L156 144","#c9bfae",3)+d.r(88,30,24,28,5,C.grey)+d.c(100,40,5,"#fff");return g;},
"fine":()=>face("fine"),"happy":()=>face("happy"),"good":()=>face("good"),"great":()=>face("great"),"sad":()=>face("sad"),
"sleepy":()=>face("sleepy"),"tired":()=>face("tired"),"hungry":()=>face("hungry"),"angry":()=>face("angry"),"sick":()=>face("sick"),
"head":()=>bodyPart("head"),"eyes":()=>bodyPart("eyes"),"eye":()=>bodyPart("eyes"),"ears":()=>bodyPart("ears"),"ear":()=>bodyPart("ears"),"nose":()=>bodyPart("nose"),"mouth":()=>bodyPart("mouth"),
"big":()=>compare("big"),"small":()=>compare("small"),"long":()=>compare("long"),"short":()=>compare("short"),
"apple":()=>d.shadow(100,184,60)+d.p("M100 56 Q66 34 42 62 Q20 96 44 142 Q66 186 100 168 Q134 186 156 142 Q180 96 158 62 Q134 34 100 56Z",C.red)+d.shine(62,84,12,22,20)+d.l("M100 58 Q98 40 106 22",C.brown2,7)+d.p("M108 36 Q130 14 154 24 Q136 50 108 36Z",C.leaf),
"strawberry":()=>{let g=d.shadow(100,184,50)+d.p("M100 182 Q40 140 40 86 Q40 52 100 56 Q160 52 160 86 Q160 140 100 182Z",C.red);
  [[70,90],[100,84],[130,90],[82,116],[118,116],[100,144],[66,120],[134,120]].forEach(([x,y])=>g+=d.e(x,y,3.5,5,C.yellow,null));
  g+=d.p("M60 62 L76 40 L88 58 L100 34 L112 58 L124 40 L140 62 Q100 74 60 62Z",C.leaf)+d.l("M100 40 L100 18",C.green2,6)+d.shine(62,96,8,16,15);return g;},
"pencil":()=>d.g(d.r(-18,-70,36,120,4,C.yellow)+d.r(-6,-70,12,120,0,C.yellow2,null)+d.r(-18,-70,36,120,4,"none")+d.r(-18,-92,36,24,6,C.pink)+d.r(-18,-72,36,10,0,C.grey)+d.p("M-18 50 L0 92 L18 50Z",C.cream)+d.p("M-6 78 L0 92 L6 78Z",O,null),"translate(100 100) rotate(40)")+d.shadow(100,186,60),
"ball":()=>d.shadow(100,186,64)+d.c(100,104,74,"#fff")+d.p("M100 30 A74 74 0 0 1 172 90 Q136 96 100 104Z",C.red,O,3)+d.p("M100 104 Q120 140 112 178 A74 74 0 0 0 166 136Z",C.blue,O,3)+d.p("M100 104 Q60 120 34 140 A74 74 0 0 1 28 84Z",C.yellow,O,3)+d.c(100,104,10,"#fff",O,3)+d.shine(66,62,18,10,-30),
"soccer":()=>{let g=d.p("M14 40 L186 40 L186 150 L14 150",C.white,O,5);for(let i=1;i<9;i++)g+=d.l(`M${14+i*19} 40 L${14+i*19} 150`,"#c9cfd8",2);for(let i=1;i<5;i++)g+=d.l(`M14 ${40+i*22} L186 ${40+i*22}`,"#c9cfd8",2);
  g+=d.r(0,150,200,50,0,"#8fd07f",null)+d.shadow(100,190,52)+d.c(100,140,48,"#fff");
  g+=d.poly("100,124 115,135 109,152 91,152 85,135",O,null)+d.p("M100 92 L100 106 L100 124 M115 135 L140 128 M109 152 L124 176 M91 152 L76 176 M85 135 L60 128",null,O,3)+d.p("M88 94 L100 106 L112 94 Z",O,null)+d.p("M144 120 L140 128 L148 148 Z",O,null)+d.p("M56 120 L60 128 L52 148 Z",O,null);return g;},
"baseball":()=>{let g=d.g(d.p("M-9 -86 Q-14 -10 -6 64 L6 64 Q14 -10 9 -86 Q0 -92 -9 -86Z",C.wood||"#c98d4e")+d.r(-8,58,16,26,4,O,null),"translate(126 104) rotate(35)");
  g+=d.shadow(80,186,50)+d.c(78,128,48,"#fff")+d.l("M44 98 Q62 128 44 160",C.red,4)+d.l("M112 98 Q94 128 112 160",C.red,4);
  for(let i=0;i<5;i++){g+=d.l(`M${48+i*0.5} ${108+i*11} l9 -3`,C.red,2.5)+d.l(`M${108-i*0.5} ${108+i*11} l-9 -3`,C.red,2.5);}
  return g;},
"basketball":()=>{let g=d.r(120,10,72,50,4,"#fff")+d.r(140,26,32,22,2,"none",C.red,3)+d.r(130,58,52,6,3,C.red)+d.l("M134 64 L142 92 L170 92 L178 64 M146 64 L152 92 M166 64 L160 92 M138 76 L174 76",O,2.5);
  g+=d.shadow(80,190,52)+d.c(80,128,56,C.orange)+d.l("M24 128 L136 128 M80 72 L80 184",O,4)+d.l("M40 88 Q66 128 40 168 M120 88 Q94 128 120 168",O,4)+d.shine(54,96,14,8,-30);return g;},
"volleyball":()=>{let g=d.r(0,30,200,8,2,O,null)+d.l("M0 40 L200 40",O,1);for(let i=0;i<10;i++)g+=d.l(`M${i*22} 38 L${i*22} 70`,"#7d838d",2);g+=d.l("M0 70 L200 70 M0 54 L200 54","#7d838d",2);
  g+=d.shadow(100,190,52)+d.c(100,128,56,"#fff")+d.p("M100 72 Q70 110 82 182 A56 56 0 0 1 46 112 Q70 92 100 72Z",C.blue,O,3)+d.p("M100 128 Q130 100 156 120 A56 56 0 0 0 128 80 Q112 100 100 128Z",C.yellow,O,3)+d.p("M100 128 Q120 160 110 183 A56 56 0 0 0 154 144Z",C.blue,O,3)+d.shine(72,98,12,7,-30);return g;},
"tennis":()=>{let g=d.g(d.e(0,-34,40,54,"#fff",O,0,7)+d.e(0,-34,40,54,"none",C.red,0,6),"translate(84 96) rotate(-30)");
  let s="";for(let i=-3;i<=3;i++)s+=d.l(`M${i*10} -84 L${i*10} 16`,"#9aa0aa",2)+d.l(`M-40 ${-34+i*12} L40 ${-34+i*12}`,"#9aa0aa",2);
  g=d.g(`<clipPath id="tr"><ellipse cx="0" cy="-34" rx="36" ry="50"/></clipPath><g clip-path="url(#tr)">${s}</g>`,"translate(84 96) rotate(-30)")+g;
  g+=d.g(d.r(-8,20,16,22,3,C.red)+d.r(-9,40,18,46,6,"#3a3f50"),"translate(84 96) rotate(-30)");
  g+=d.shadow(150,188,28)+d.c(150,150,28,"#d8f04a")+d.l("M126 136 Q150 150 128 168 M174 132 Q150 150 172 166","#fff",4);return g;},
"swimming":()=>{let g=d.r(0,96,200,104,0,"#7cc4ff",null);
  g+=headFace(96,98,34,{mood:"o"})+d.p("M62 92 Q62 56 96 56 Q130 56 130 92 Q96 80 62 92Z",C.red)+d.r(68,98,24,16,8,"#bfe6ff",O,3)+d.r(100,98,24,16,8,"#bfe6ff",O,3)+d.l("M92 106 L100 106",O,3);
  g+=d.l("M128 106 Q150 50 176 70",O,18)+d.l("M128 106 Q150 50 176 70",C.skin,11)+d.c(178,72,9,C.skin);
  g+=d.p("M0 120 Q25 108 50 120 T100 120 T150 120 T200 120 L200 200 L0 200Z","#4aa8f0")+d.l("M0 120 Q25 108 50 120 T100 120 T150 120 T200 120","#fff",4)+d.l("M20 156 Q40 146 60 156 M120 170 Q140 160 160 170","#bfe6ff",4);return g;},
"dodgeball":()=>{let g=d.r(0,170,200,30,0,"#e9d6b0",null)+d.l("M0 172 L200 172","#fff",4);
  g+=d.g(kid(0,0,{s:1,shirt:C.green,arm:"up",mood:"o"}),"translate(132 186) rotate(-14)");
  g+=d.c(46,90,26,C.red)+d.shine(38,80,8,5,-30)+d.l("M6 70 L-10 66 M6 92 L-14 92 M8 112 L-10 118",O,4)+d.l("M150 34 L156 22 M164 42 L176 34",O,3);return g;},
"ice cream":()=>d.p("M60 98 L100 190 L140 98Z","#e4a85a")+d.l("M72 110 L118 160 M90 102 L128 136 M128 110 L84 160 M110 102 L72 136",C.orange2,3)+d.c(100,72,36,C.pink)+d.c(76,92,22,"#fff6e0")+d.c(124,92,22,"#8a5a3a")+d.e(100,100,44,12,"#fff6e0")+d.c(100,30,8,C.red)+d.shine(88,58,10,6,-30),
"cake":()=>{let g=d.shadow(100,184,80)+d.e(100,170,86,18,"#fff")+d.p("M28 100 L28 150 Q100 178 172 150 L172 100Z","#f6d9a8")+d.p("M28 124 Q100 150 172 124 L172 132 Q100 158 28 132Z",C.pink,null)+d.e(100,100,72,22,"#fffaf0");
  g+=d.p("M30 102 Q36 118 44 106 Q52 122 60 108 Q68 124 76 110 Q84 126 92 112 Q100 128 108 112 Q116 126 124 110 Q132 124 140 108 Q148 122 156 106 Q164 118 170 102","#fffaf0",null);
  [[60,92],[100,86],[140,92]].forEach(([x,y])=>g+=d.p(`M${x} ${y+10} Q${x-12} ${y-2} ${x-8} ${y-8} Q${x} ${y-12} ${x+8} ${y-8} Q${x+12} ${y-2} ${x} ${y+10}Z`,C.red,O,3)+d.p(`M${x-5} ${y-9} L${x} ${y-15} L${x+5} ${y-9}`,C.leaf,O,2));
  g+=d.r(94,40,12,40,3,"#9fd0ff")+d.p("M100 20 Q90 32 100 38 Q110 32 100 20Z",C.orange,O,3);return g;},
"pudding":()=>d.shadow(100,184,80)+d.e(100,170,84,18,"#fff")+d.p("M54 70 L36 160 Q100 180 164 160 L146 70Z","#ffd66b")+d.e(100,70,46,13,"#8a4a1c")+d.p("M54 70 Q56 92 64 88 Q70 104 78 88 Q90 102 100 84 Q110 102 122 88 Q130 104 136 88 Q144 92 146 70Z","#8a4a1c",null)+d.shine(62,126,6,20,10)+d.c(100,50,10,C.red)+d.l("M100 40 Q104 26 114 22",C.green2,3),
"milk":()=>{let g=d.shadow(100,188,60)+d.p("M58 70 L100 40 L142 70 L142 180 L58 180Z","#fff")+d.p("M58 70 L100 40 L142 70Z","#cfe8ff")+d.r(88,24,24,16,3,"#cfe8ff");
  g+=d.r(66,94,68,54,8,C.blue)+d.t(100,130,"MILK",22,"#fff",800)+d.e(80,166,10,6,O,null)+d.e(118,160,8,5,O,null);return g;},
"banana":()=>d.shadow(100,184,70)+d.p("M30 60 Q36 150 110 160 Q160 162 176 130 Q172 124 160 128 Q110 140 78 110 Q58 88 54 56Z",C.yellow)+d.l("M50 74 Q66 132 130 146",C.yellow2,4)+d.r(46,40,12,20,3,C.brown2)+d.p("M176 130 L184 126 L182 138Z",O,null),
"tomato":()=>d.shadow(100,184,64)+d.p("M100 58 Q172 52 172 116 Q172 178 100 178 Q28 178 28 116 Q28 52 100 58Z",C.red)+d.shine(62,94,12,22,20)+d.p("M100 52 L118 42 L114 60 L136 62 L116 72 L100 66 L84 72 L64 62 L86 60 L82 42Z",C.leaf)+d.l("M100 56 L100 34",C.green2,6),
"carrot":()=>d.p("M78 64 Q72 50 56 40 Q66 34 80 52 Q78 28 92 20 Q96 38 92 58 Q108 36 124 40 Q110 54 100 70Z",C.leaf)+d.p("M68 62 Q110 46 132 72 Q120 120 52 176 Q46 176 46 168 Q70 110 68 62Z",C.orange)+d.l("M84 84 L98 88 M72 112 L88 116 M62 140 L74 142",C.orange2,4)+d.shine(80,80,6,14,30),
"onion":()=>d.shadow(100,184,62)+d.p("M100 36 Q104 70 150 92 Q180 112 162 150 Q140 182 100 182 Q60 182 38 150 Q20 112 50 92 Q96 70 100 36Z","#d99a52")+d.l("M100 60 Q80 120 96 178 M100 60 Q124 120 110 178 M100 60 Q54 110 66 170 M100 60 Q146 110 136 170","#a86a2c",3)+d.l("M86 182 L80 192 M100 184 L100 194 M114 182 L120 192","#c9a070",3)+d.shine(62,118,8,18,20),
"green pepper":()=>d.shadow(100,184,62)+d.p("M100 56 Q140 40 164 70 Q182 104 162 148 Q146 182 120 170 Q104 186 92 172 Q60 186 46 152 Q22 108 40 74 Q62 42 100 56Z",C.green)+d.l("M100 58 Q92 112 104 172 M72 66 Q54 112 72 168 M132 66 Q146 112 132 162",C.green2,4)+d.r(90,30,20,30,6,C.green2)+d.shine(60,96,8,20,20),
"cucumber":()=>{let g=d.shadow(100,184,80)+d.g(d.r(-86,-22,172,44,22,C.green)+d.r(-76,-14,152,10,5,"#7fcc6e",null),"translate(100 110) rotate(-25)");
  [[50,124],[78,112],[106,100],[134,86],[64,140],[96,128],[126,114],[152,100]].forEach(([x,y])=>g+=d.c(x,y,3,C.green2,null));
  g+=d.p("M168 70 L180 60 L184 70 Z",C.yellow,O,2);return g;},
"fish":()=>d.shadow(100,180,60)+d.p("M150 100 L190 66 L184 100 L190 134Z",C.orange2)+d.p("M20 100 Q60 44 130 72 Q160 86 162 100 Q160 114 130 128 Q60 156 20 100Z",C.orange)+d.p("M80 68 Q96 40 120 64Z",C.orange2)+d.l("M100 76 Q112 100 100 124 M120 80 Q130 100 120 120",C.orange2,3)+d.c(50,94,9,"#fff")+d.c(52,94,5,O,null)+d.l("M24 104 Q32 110 40 106",O,3)+d.c(42,58,6,"#cfe8ff",O,2)+d.c(30,40,4,"#cfe8ff",O,2),
"octopus":()=>{let g=d.shadow(100,188,70);const L=[[-60,0],[-36,0],[-12,0],[12,0],[36,0],[60,0]];
  L.forEach(([x],i)=>g+=d.p(`M${100+x*0.7} 120 Q${100+x*1.1} ${150+(i%2)*10} ${100+x*1.3} 176 Q${100+x*1.3+(x<0?-14:14)} 184 ${100+x*1.3+(x<0?-8:8)} 170`,"none",O,22)+d.p(`M${100+x*0.7} 120 Q${100+x*1.1} ${150+(i%2)*10} ${100+x*1.3} 176 Q${100+x*1.3+(x<0?-14:14)} 184 ${100+x*1.3+(x<0?-8:8)} 170`,"none",C.red,14));
  g+=d.e(100,84,62,56,C.red)+d.shine(76,56,14,8,-30)+d.c(78,92,10,"#fff")+d.c(122,92,10,"#fff")+d.c(80,94,5,O,null)+d.c(124,94,5,O,null)+d.e(100,118,10,8,C.red2)+d.e(100,118,5,4,O,null);return g;},
"insect":()=>{let g=d.shadow(100,186,66)+d.l("M64 112 L36 98 M62 132 L30 140 M70 150 L46 176 M136 112 L164 98 M138 132 L170 140 M130 150 L154 176",O,6);
  g+=d.e(100,130,52,56,"#8a4a1c")+d.l("M100 76 L100 186",O,4)+d.shine(78,112,8,18,20)+d.shine(122,112,8,18,-20);
  g+=d.e(100,70,30,22,O,null)+d.p("M100 50 Q100 18 120 10 Q112 30 118 36 Q110 36 106 48Z","#5a3216")+d.c(88,66,5,"#fff",null)+d.c(112,66,5,"#fff",null)+d.l("M86 52 Q76 36 66 34 M114 52 Q124 40 134 40",O,3);return g;},
"fruit":()=>{let g=d.p("M14 120 Q20 186 100 186 Q180 186 186 120Z","#c98d4e")+d.l("M24 140 L176 140 M36 162 L164 162",C.brown2,3);
  g+=d.p("M38 116 Q40 52 92 70 Q74 104 96 120Z",C.yellow)+d.c(130,90,32,C.red)+d.l("M130 60 Q128 48 136 40",C.brown2,5);
  [[70,96],[86,96],[78,82],[94,82],[62,82],[78,68],[70,110],[86,110]].forEach(([x,y])=>g+=d.c(x,y,10,C.purple,O,3));
  g+=d.c(164,108,18,C.orange)+d.e(108,116,30,8,"#c98d4e",null)+d.p("M14 120 L186 120",null,O,4);return g;},
"vegetable":()=>{let g=d.p("M14 110 L186 110 L170 186 L30 186Z","#c98d4e")+d.l("M22 136 L178 136 M28 160 L172 160",C.brown2,3);
  g+=d.c(60,86,30,"#9bd36a")+d.l("M60 60 Q44 86 60 112 M60 60 Q76 86 60 112",C.green2,3);
  g+=d.p("M104 102 Q118 40 132 30 Q140 60 118 108Z",C.orange)+d.p("M128 34 L120 12 M132 32 L140 12 M130 32 L132 8",null,C.leaf,6);
  g+=d.c(156,92,22,C.red)+d.p("M156 70 L164 64 L162 74 L170 76 L156 78 L142 76 L150 74 L148 64Z",C.leaf,O,2);
  g+=d.p("M14 110 L186 110",null,O,4);return g;},
"animal":()=>{let g=d.r(0,150,200,50,0,"#cfeac0",null);
  g+=d.g(PIC.dog(),"translate(4 70) scale(.48)")+d.g(PIC.cat(),"translate(100 70) scale(.48)")+d.g(PIC.rabbit(),"translate(52 2) scale(.48)");return g;},
"dog":()=>{let g=d.shadow(100,186,60)+d.e(100,170,52,22,"#d9a066");
  g+=d.p("M38 54 Q24 110 46 124 Q60 100 58 64Z",C.brown2)+d.p("M162 54 Q176 110 154 124 Q140 100 142 64Z",C.brown2);
  g+=d.e(100,100,58,54,"#e0aa6a")+d.e(100,128,32,24,C.cream)+d.e(100,114,12,9,O,null)+d.c(76,94,7,O,null)+d.c(124,94,7,O,null)+d.c(78,91,2.5,"#fff",null)+d.c(126,91,2.5,"#fff",null);
  g+=d.l("M100 122 L100 132 M88 136 Q100 144 112 136",O,3.5)+d.p("M94 140 Q100 158 106 140Z",C.pink,O,2.5);return g;},
"cat":()=>{let g=d.shadow(100,186,60)+d.e(100,170,48,20,"#9aa0aa");
  g+=d.p("M44 80 L40 22 L82 52Z","#9aa0aa")+d.p("M156 80 L160 22 L118 52Z","#9aa0aa")+d.p("M50 66 L48 36 L72 54Z",C.pink,null)+d.p("M150 66 L152 36 L128 54Z",C.pink,null);
  g+=d.e(100,104,62,54,"#b9bec7")+d.l("M86 56 L90 72 M100 52 L100 70 M114 56 L110 72","#7d838d",4);
  g+=d.e(76,100,9,12,"#c6e86a")+d.e(124,100,9,12,"#c6e86a")+d.e(76,100,3,10,O,null)+d.e(124,100,3,10,O,null);
  g+=d.p("M94 118 L106 118 L100 126Z",C.pink,O,2.5)+d.l("M100 126 Q92 136 84 130 M100 126 Q108 136 116 130",O,3)+d.l("M60 120 L28 114 M60 128 L30 132 M140 120 L172 114 M140 128 L170 132",O,2.5);return g;},
"rabbit":()=>{let g=d.shadow(100,186,58)+d.e(100,170,46,20,"#fff");
  g+=d.e(76,46,15,42,"#fff",O,-10)+d.e(76,48,7,32,C.pink,null,-10)+d.e(124,46,15,42,"#fff",O,10)+d.e(124,48,7,32,C.pink,null,10);
  g+=d.e(100,116,56,50,"#fff")+d.c(78,110,7,O,null)+d.c(122,110,7,O,null)+d.c(80,107,2.5,"#fff",null)+d.c(124,107,2.5,"#fff",null);
  g+=d.e(100,126,6,4.5,C.pink,O,0,2.5)+d.l("M100 130 L100 138 M92 142 Q100 146 100 138 Q100 146 108 142",O,3)+d.e(70,130,9,5,C.cheek,null)+d.e(130,130,9,5,C.cheek,null);return g;},
"mouse":()=>{let g=d.shadow(100,186,58)+d.l("M150 160 Q190 150 182 120 Q176 100 190 92",C.pink2,5);
  g+=d.c(52,62,32,"#b9bec7")+d.c(52,62,20,C.pink,null)+d.c(148,62,32,"#b9bec7")+d.c(148,62,20,C.pink,null);
  g+=d.p("M100 176 Q40 176 46 120 Q52 74 100 74 Q148 74 154 120 Q160 176 100 176Z","#b9bec7")+d.c(80,116,7,O,null)+d.c(120,116,7,O,null)+d.c(82,113,2.5,"#fff",null)+d.c(122,113,2.5,"#fff",null);
  g+=d.c(100,140,8,C.pink)+d.l("M80 140 L46 132 M80 148 L48 152 M120 140 L154 132 M120 148 L152 152",O,2.5)+d.r(92,150,8,9,2,"#fff",O,2)+d.r(100,150,8,9,2,"#fff",O,2);return g;},
"pig":()=>{let g=d.shadow(100,186,60)+d.p("M48 70 L40 30 L80 52Z",C.pink2)+d.p("M152 70 L160 30 L120 52Z",C.pink2);
  g+=d.e(100,106,64,58,"#ffb3c8")+d.c(76,92,7,O,null)+d.c(124,92,7,O,null)+d.e(100,124,26,19,C.pink)+d.e(92,124,5,8,C.pink2,null)+d.e(108,124,5,8,C.pink2,null);
  g+=d.l("M88 150 Q100 158 112 150",O,3)+d.e(60,118,10,6,C.cheek,null)+d.e(140,118,10,6,C.cheek,null);return g;},
"cow":()=>{let g=d.shadow(100,186,60)+d.p("M58 46 Q44 30 50 14 Q62 26 74 40Z","#f3e0c4")+d.p("M142 46 Q156 30 150 14 Q138 26 126 40Z","#f3e0c4");
  g+=d.e(40,66,22,12,"#fff",O,-20)+d.e(160,66,22,12,"#fff",O,20);
  g+=d.e(100,92,56,52,"#fff")+d.p("M60 64 Q76 50 94 62 Q86 84 64 82Z",O,null)+d.p("M130 100 Q150 92 154 108 Q144 122 132 114Z",O,null);
  g+=d.c(80,92,7,O,null)+d.c(120,92,7,O,null)+d.e(100,144,46,30,"#ffb3c8")+d.e(84,144,7,9,C.pink2,null)+d.e(116,144,7,9,C.pink2,null);return g;},
"bird":()=>d.shadow(100,186,50)+d.p("M150 100 L190 84 L186 112Z",C.blue2)+d.e(100,110,60,46,C.blue)+d.e(96,128,36,26,"#d7efff")+d.p("M78 100 Q110 80 140 110 Q110 120 78 100Z",C.blue2)+d.c(64,92,7,O,null)+d.p("M40 96 L22 104 L40 110Z",C.orange)+d.l("M86 156 L80 176 M110 156 L116 176",C.orange2,4),
"stop":()=>{let pts="";for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;pts+=`${(100+Math.cos(a)*80).toFixed(1)},${(96+Math.sin(a)*80).toFixed(1)} `;}
  return d.r(94,150,12,48,2,C.grey)+d.poly(pts,C.red,O,5)+d.t(100,114,"STOP",50,"#fff",800);},
"bus":()=>d.shadow(100,190,80)+d.r(24,24,152,150,20,C.yellow)+d.r(38,40,124,60,8,"#cfe8ff")+d.r(60,30,80,22,4,O,null)+d.t(100,48,"BUS",18,"#fff",800)+d.c(52,140,10,"#fff")+d.c(148,140,10,"#fff")+d.r(80,130,40,20,4,"#fff")+d.r(38,174,30,20,6,O,null)+d.r(132,174,30,20,6,O,null)+d.l("M100 40 L100 100",O,3),
"taxi":()=>d.shadow(100,186,86)+d.r(76,42,48,22,4,C.yellow)+d.t(100,59,"TAXI",15,O,800)+d.p("M40 110 L62 70 L138 70 L160 110Z","#cfe8ff")+d.r(14,106,172,54,14,C.yellow)+d.r(14,124,172,10,0,O,null)+d.c(56,162,18,O,null)+d.c(56,162,7,C.grey,null)+d.c(144,162,18,O,null)+d.c(144,162,7,C.grey,null)+d.l("M100 70 L100 110",O,4)+d.r(16,112,16,10,3,"#fff"),
"wc":()=>{let g=d.r(16,16,168,168,16,C.blue);
  g+=d.c(62,54,13,"#fff",null)+d.p("M44 72 L80 72 L84 124 L72 124 L72 170 L52 170 L52 124 L40 124Z","#fff",null);
  g+=d.c(138,54,13,"#fff",null)+d.p("M124 72 L152 72 L168 140 L108 140Z","#fff",null)+d.r(122,140,10,30,2,"#fff",null)+d.r(144,140,10,30,2,"#fff",null)+d.l("M100 40 L100 170","#fff",4);
  return g;},
"a–z (uppercase)":()=>{let g="";const L="ABCDEFGHI";const col=[C.red,C.blue,C.green,C.orange,C.purple,C.pink,C.yellow,"#5ec6c0",C.red];
  for(let i=0;i<9;i++){const x=22+(i%3)*56,y=22+Math.floor(i/3)*56;g+=d.r(x,y,48,48,8,col[i])+d.t(x+24,y+38,L[i],34,"#fff",800,`stroke="${O}" stroke-width="1.5"`);}return g;},
"star":()=>shape("star"),"heart":()=>shape("heart"),"circle":()=>shape("circle"),"triangle":()=>shape("triangle"),"square":()=>shape("square"),"rectangle":()=>shape("rectangle"),"diamond":()=>shape("diamond"),"oval":()=>shape("oval")
};
NUM.forEach((w,i)=>{if(i>0)PIC[w]=()=>number(i);});
Object.keys(COLORS).forEach(c=>{if(!PIC[c])PIC[c]=()=>color(c);});

const key=w=>String(w||"").trim().toLowerCase();
const wrap=inner=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${inner}</svg>`;
const cache={};
Kit.art={
  has:w=>!!PIC[key(w)],
  svg:w=>{const k=key(w);if(!PIC[k])return "";return cache[k]||(cache[k]=wrap(PIC[k](d)));},
  url:w=>{const s=Kit.art.svg(w);return s?"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s):"";},
  add:(w,fn)=>{PIC[key(w)]=()=>fn(d);delete cache[key(w)];},
  list:()=>Object.keys(PIC),
  helpers:d
};
})();
