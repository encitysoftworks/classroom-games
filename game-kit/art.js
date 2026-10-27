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
"ui:kid-a":()=>d.c(100,100,96,"#d7efff",null)+d.p("M30 200 Q30 140 100 140 Q170 140 170 200Z",C.blue)+headFace(100,92,52,{mood:"open"}),
"ui:kid-b":()=>d.c(100,100,96,"#ffe3ec",null)+d.p("M30 200 Q30 140 100 140 Q170 140 170 200Z",C.pink)+headFace(100,92,52,{mood:"smile",girl:true,hair:"#5a3a24"}),
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
/* ---------- more numbers: zero, 21-29, thirty ... sixty (tens as rods of ten, ones as dots) ---------- */
function bigNumber(n){
  let g=d.t(100,70,String(n),64,O,800);
  if(n===0)return d.t(100,104,"0",100,O,800)+d.r(25,130,150,50,8,"#fff",O,3);
  const tens=Math.floor(n/10),ones=n%10,rodW=16,gap=8,total=tens*(rodW+gap)+(ones?gap+34:0)-gap,x0=100-total/2;
  for(let t=0;t<tens;t++){const x=x0+t*(rodW+gap);g+=d.r(x,88,rodW,100,3,C.blue,O,2.5);for(let i=1;i<10;i++)g+=d.l(`M${x} ${88+i*10} L${x+rodW} ${88+i*10}`,"#2f69b8",1.5);}
  for(let i=0;i<ones;i++){const cx=x0+tens*(rodW+gap)+gap+8+(i%2)*18,cy=96+Math.floor(i/2)*20;g+=d.c(cx,cy,7.5,C.red,O,2);}
  return g;
}
const TENS={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
const ONES={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9};
PIC.zero=()=>bigNumber(0);
Object.keys(TENS).forEach(t=>{if(TENS[t]>20)PIC[t]=()=>bigNumber(TENS[t]);Object.keys(ONES).forEach(o=>{PIC[t+"-"+o]=()=>bigNumber(TENS[t]+ONES[o]);});});

/* ---------- Let's Try 1 ---------- */
const plate=(y,rx)=>d.e(100,y,rx||80,(rx||80)*0.24,"#fff")+d.e(100,y-2,(rx||80)*0.72,(rx||80)*0.15,"none","#e3dccd",0,3);
const fruitLeaf=(x,y,rot)=>d.e(x,y,12,5,C.leaf,O,rot||-30,3);
Object.assign(PIC,{
"friend":()=>d.r(0,150,200,50,0,"#cfeac0",null)+kid(66,184,{s:0.95,shirt:C.orange,arm:"down",mood:"open"})+kid(134,184,{s:0.95,shirt:C.green,arm:"down",mood:"open",hair:"#6b3f22"})+d.l("M84 104 Q100 92 116 104",O,14)+d.l("M84 104 Q100 92 116 104",C.skin,8)+d.heart(100,34,14,C.pink),
"counter":()=>{let g=d.shadow(100,180,70);[[60,150,C.red],[96,156,C.blue],[132,150,C.yellow],[78,124,C.green],[116,126,C.red],[98,98,C.blue]].forEach(([x,y,c])=>g+=d.e(x,y,24,12,c)+d.e(x,y-3,24,12,c)+d.e(x-8,y-6,6,2.5,"#fff",null));return g;},
"eraser":()=>d.shadow(100,170,70)+d.g(d.r(-60,-24,120,48,8,"#fff")+d.r(-14,-26,74,52,4,C.blue)+d.t(23,6,"ERASER",11,"#fff",800),"translate(100 120) rotate(-12)")+d.c(36,168,3,"#ddd",O,1.5)+d.c(48,174,2.5,"#ddd",O,1.5),
"ruler":()=>{let g=d.g(d.r(-90,-20,180,40,4,"#ffe58a"),"translate(100 100) rotate(-20)");let t="";for(let i=0;i<=16;i++)t+=d.l(`M${-82+i*10.25} -20 L${-82+i*10.25} ${i%5?-10:-2}`,O,2);
  for(let i=0;i<4;i++)t+=d.t(-82+i*51.25,14,String(i*5),11,O,800);return g+d.g(t,"translate(100 100) rotate(-20)")+d.shadow(100,176,80);},
"crayon":()=>{let g=d.shadow(100,184,70);[[60,C.red,-14],[100,C.blue,0],[140,C.green,14]].forEach(([x,c,r])=>g+=d.g(d.r(-12,-50,24,100,4,c)+d.p("M-12 -50 L0 -76 L12 -50Z",c)+d.r(-12,-26,24,40,0,"#fff",O,3)+d.l("M-12 -18 L12 -18 M-12 6 L12 6",c,3),`translate(${x} 110) rotate(${r})`));return g;},
"cross":()=>d.shadow(100,184,62)+d.p("M76 24 L124 24 L124 76 L176 76 L176 124 L124 124 L124 176 L76 176 L76 124 L24 124 L24 76 L76 76Z",C.green,O,5)+d.shine(92,46,8,14),
"orange juice":()=>d.shadow(100,186,50)+d.p("M58 60 L68 182 L132 182 L142 60Z","#fff")+d.p("M61 84 L69 178 L131 178 L139 84Z",C.orange,null)+d.p("M58 60 L68 182 L132 182 L142 60Z","none")+d.l("M112 68 L132 18",C.red,7)+d.g(d.c(0,0,26,C.orange)+d.c(0,0,19,"#ffc979",null)+d.l("M0 -19 L0 19 M-19 0 L19 0 M-13 -13 L13 13 M13 -13 L-13 13",C.orange,2.5),"translate(146 70)")+d.shine(78,120,5,24),
"rainbow":()=>{let g="";[C.red,C.orange,C.yellow,C.green,C.blue,C.purple].forEach((c,i)=>{const r=86-i*11;g+=d.p(`M${100-r} 150 A${r} ${r} 0 0 1 ${100+r} 150`,"none",c,11);});
  return g+d.e(28,152,26,16,"#fff")+d.e(48,158,20,12,"#fff")+d.e(172,152,26,16,"#fff")+d.e(152,158,20,12,"#fff");},
"color":()=>{let g=d.shadow(100,184,80)+d.p("M100 30 Q176 30 184 96 Q188 150 130 160 Q112 162 116 142 Q120 124 100 126 Q80 128 70 150 Q56 176 30 150 Q10 120 26 80 Q44 32 100 30Z","#f0d6a8");
  [[64,64,C.red],[104,52,C.yellow],[146,70,C.blue],[156,112,C.green],[48,108,C.purple]].forEach(([x,y,c])=>g+=d.c(x,y,14,c,O,3));return g+d.e(98,140,10,12,"#fffaf0");},
"sport":()=>{let g=d.shadow(100,186,84);
  g+=d.g(d.e(0,-30,24,32,"#fff",O,0,6)+d.e(0,-30,24,32,"none",C.red,0,5)+d.r(-6,2,12,40,4,"#3a3f50"),"translate(160 112) rotate(20)");
  g+=d.c(62,140,38,"#fff")+d.poly("62,128 73,136 69,150 55,150 51,136",O,null)+d.c(118,158,26,C.orange)+d.l("M92 158 L144 158 M118 132 L118 184",O,3)+d.c(140,62,18,"#fff")+d.l("M128 52 Q136 62 128 74 M152 52 Q144 62 152 74",C.red,3);return g;},
"table tennis":()=>{let g=d.p("M0 150 L200 120 L200 140 L0 172Z","#2f8a5c")+d.l("M0 150 L200 120",C.white,4)+d.l("M100 136 L100 110",O,3)+d.p("M100 110 L100 136",null);
  g+=d.g(d.c(0,-30,34,C.red)+d.r(-8,0,16,46,6,"#c98d4e"),"translate(66 86) rotate(-30)")+d.c(150,56,10,"#fff")+d.l("M126 70 L116 76 M128 82 L118 90","#bbb",3);return g;},
"food":()=>plate(160,88)+d.g(PIC.hamburger(),"translate(14 30) scale(.55)")+d.g(PIC["rice ball"](),"translate(96 52) scale(.5)")+d.l("M10 120 L10 186 M4 120 L4 140 M16 120 L16 140",C.grey2,5)+d.p("M190 120 Q198 150 190 160 L190 186","none",C.grey2,6),
"hamburger":()=>d.shadow(100,184,76)+d.p("M30 96 Q30 40 100 40 Q170 40 170 96Z","#e8a54a")+[[70,60],[100,52],[130,60],[86,76],[118,76]].map(([x,y])=>d.e(x,y,4,2.5,"#fff4d6",null)).join("")+d.p("M24 104 Q44 92 64 104 Q84 92 104 104 Q124 92 144 104 Q164 92 178 104 L178 112 L24 112Z",C.leaf)+d.r(26,108,148,22,10,"#7a3f1c")+d.p("M28 128 L172 128 L160 144 L140 132 L120 146 L100 132 L80 146 L60 132 L40 144Z",C.yellow)+d.r(30,140,140,30,14,"#e8a54a"),
"pizza":()=>{let g=d.shadow(100,186,70)+d.p("M100 180 L30 50 Q100 20 170 50Z","#ffd66b")+d.p("M30 50 Q100 20 170 50 L164 62 Q100 34 36 62Z","#d9963a");
  [[100,72],[80,104],[118,108],[100,140]].forEach(([x,y])=>g+=d.c(x,y,11,C.red,O,3));g+=d.e(70,80,7,4,C.green,O,20,2)+d.e(128,84,7,4,C.green,O,-20,2)+d.e(96,112,7,4,C.green,O,0,2);return g;},
"spaghetti":()=>{let g=plate(150,90);for(let i=0;i<7;i++)g+=d.l(`M${48+i*14} 150 Q${40+i*16} 110 ${70+i*9} 96 Q${100+i*4} 86 ${120+i*6} 104 Q${150-i*4} 128 ${130-i*8} 148`,"#f2cf6b",5);
  return g+d.c(88,112,12,"#8a3a1c")+d.c(116,120,11,"#8a3a1c")+d.l("M150 40 L118 118",C.grey2,6)+d.l("M146 36 L156 40 L160 30",C.grey2,4);},
"steak":()=>plate(150,90)+d.p("M44 120 Q40 76 92 72 Q140 66 160 96 Q170 128 130 136 Q80 146 44 120Z","#8a3a1c")+d.l("M70 96 L82 112 M96 90 L108 108 M122 90 L134 108",C.brown2,5)+d.p("M134 132 Q150 118 166 132 Q150 146 134 132Z",C.green)+d.c(60,134,9,C.orange),
"salad":()=>{let g=d.shadow(100,184,80)+d.p("M20 100 Q24 176 100 176 Q176 176 180 100Z","#fff");
  g+=d.p("M30 102 Q40 60 70 82 Q84 50 110 76 Q136 50 150 84 Q172 70 172 102Z","#7fcc6e")+d.c(70,90,12,C.red)+d.c(132,88,10,C.red)+d.e(102,92,14,7,"#fff6c8",O,0,3)+d.c(100,80,4,C.yellow,null);
  return g+d.p("M20 100 L180 100",null)+d.l("M40 120 L160 120","#e3dccd",3);},
"noodle":()=>{let g=d.shadow(100,186,80)+d.p("M20 96 Q22 176 100 176 Q178 176 180 96Z",C.red)+d.l("M36 122 L164 122 M30 104 L170 104","#fff",3)+d.e(100,96,80,16,"#f6e2b0");
  for(let i=0;i<6;i++)g+=d.l(`M${48+i*20} 96 Q${54+i*20} 60 ${44+i*20} 30`,"#f2cf6b",4);
  return g+d.c(70,92,10,"#fff")+d.c(70,92,5,C.yellow,null)+d.l("M128 18 L166 98 M144 14 L178 94",C.brown,5);},
"egg":()=>d.shadow(100,186,74)+d.e(62,110,34,46,"#fff3dc")+d.shine(52,92,7,14,-15)+d.p("M100 150 Q96 120 126 116 Q140 96 162 110 Q188 118 182 146 Q184 172 150 172 Q120 180 100 150Z","#fff")+d.c(144,144,17,C.yellow)+d.shine(138,138,5,4),
"rice ball":()=>d.shadow(100,186,70)+d.p("M100 30 Q124 30 160 116 Q178 168 100 168 Q22 168 40 116 Q76 30 100 30Z","#fff")+d.r(66,118,68,52,6,"#2c3a2c")+d.c(84,82,3,"#e9e3d6",null)+d.c(112,70,3,"#e9e3d6",null)+d.c(124,100,3,"#e9e3d6",null)+d.c(76,104,3,"#e9e3d6",null),
"jam":()=>d.shadow(100,186,56)+d.r(50,70,100,110,18,"#e8483f")+d.shine(68,110,6,24)+d.r(44,46,112,30,6,"#fff")+d.l("M50 54 L150 54 M50 66 L150 66",C.red,4)+d.r(64,104,72,44,8,C.cream)+d.c(100,126,13,C.red,O,2.5)+d.l("M100 113 L104 106",C.leaf,3),
"grapes":()=>{let g=d.shadow(100,186,50)+d.l("M100 40 Q104 22 116 14",C.brown2,6)+d.p("M104 34 Q136 8 160 30 Q132 50 104 34Z",C.leaf);
  [[80,58],[104,56],[128,58],[68,82],[92,80],[116,80],[140,82],[80,104],[104,104],[128,104],[92,128],[116,128],[104,152]].forEach(([x,y])=>g+=d.c(x,y,14,C.purple,O,3)+d.c(x-4,y-5,3,"#d9c4ff",null));return g;},
"pineapple":()=>{let h="";for(let i=-4;i<=4;i++)h+=d.l(`M${100+i*18-40} 62 L${100+i*18+40} 186`,"#b77a1c",2.5)+d.l(`M${100+i*18+40} 62 L${100+i*18-40} 186`,"#b77a1c",2.5);
  return d.shadow(100,188,52)+d.p("M100 58 L84 14 L98 38 L100 6 L104 38 L118 14Z",C.leaf)+d.p("M100 56 L70 30 L92 56 M100 56 L132 30 L110 56",C.leaf)+d.e(100,124,48,62,"#f2b33a")+`<clipPath id="pnc"><ellipse cx="100" cy="124" rx="46" ry="60"/></clipPath><g clip-path="url(#pnc)">${h}</g>`+d.e(100,124,48,62,"none");},
"peach":()=>d.shadow(100,184,62)+d.p("M100 58 Q40 40 34 104 Q34 170 100 174 Q166 170 166 104 Q160 40 100 58Z","#ffb3a7")+d.p("M100 58 Q84 110 100 174","none","#ef8f86",4)+d.e(60,100,16,24,"#ff8f8f",null,20)+d.shine(58,92,8,14,20)+d.l("M100 58 L104 36",C.brown2,5)+fruitLeaf(124,40,-20),
"melon":()=>{let g=d.shadow(100,186,70)+d.c(100,110,70,"#a8d47a");for(let i=-3;i<=3;i++)g+=d.l(`M${100+i*20} 44 Q${100+i*26} 110 ${100+i*20} 178`,"#e8f2d6",2.5)+d.l(`M34 ${110+i*20} Q100 ${110+i*26} 166 ${110+i*20}`,"#e8f2d6",2.5);
  return g+d.c(100,110,70,"none")+d.l("M100 40 L100 16 M88 18 L112 18",C.green2,6)+d.shine(68,76,12,8,-30);},
"kiwi fruit":()=>d.shadow(100,186,74)+d.e(62,110,40,48,"#8a6a3a")+d.c(132,116,50,"#7fbf3f")+d.c(132,116,40,"#a6d65a",null)+d.c(132,116,14,"#f6f2c8",null)+[...Array(12)].map((_,i)=>{const a=i*Math.PI/6;return d.e(132+Math.cos(a)*24,116+Math.sin(a)*24,2.5,4.5,O,null,i*30+90);}).join(""),
"lemon":()=>d.shadow(100,184,70)+d.p("M20 110 Q30 60 100 56 Q170 60 180 110 Q170 160 100 164 Q30 160 20 110Z",C.yellow)+d.p("M20 110 L8 104 L10 118Z",C.yellow,O,3)+d.p("M180 110 L192 104 L190 118Z",C.yellow,O,3)+d.shine(70,86,20,8,-10)+d.c(70,110,2,C.yellow2,null)+d.c(120,130,2,C.yellow2,null)+d.c(140,90,2,C.yellow2,null),
"card":()=>d.shadow(100,186,50)+d.g(d.r(-50,-72,100,144,10,"#fff")+d.t(-30,-44,"A",26,C.red,800)+d.heart(0,4,30,C.red)+d.g(d.t(0,0,"A",26,C.red,800),"translate(30 60) rotate(180)"),"translate(100 100) rotate(-6)"),
"book":()=>d.shadow(100,184,80)+d.p("M100 48 Q60 30 20 44 L20 160 Q60 146 100 164Z","#fff")+d.p("M100 48 Q140 30 180 44 L180 160 Q140 146 100 164Z","#fff")+d.l("M36 66 Q60 58 86 66 M36 86 Q60 78 86 86 M36 106 Q60 98 86 106 M114 66 Q140 58 164 66 M114 86 Q140 78 164 86 M114 106 Q140 98 164 106","#bfb6a4",3)+d.p("M14 52 L14 170 Q60 156 100 172 Q140 156 186 170 L186 52","none",C.blue,6),
"drum":()=>{let g=d.shadow(100,186,70)+d.r(36,78,128,90,6,C.red)+d.e(100,168,64,14,C.red)+d.r(38,84,124,80,0,C.red,null);for(let i=0;i<5;i++)g+=d.l(`M${40+i*30} ${84} L${55+i*30} 164`,C.gold,4);
  return g+d.e(100,78,64,16,"#fff6e0")+d.l("M40 40 L94 74 M160 40 L106 74",C.brown,6)+d.c(40,40,8,"#fff")+d.c(160,40,8,"#fff");},
"gorilla":()=>{let g=d.shadow(100,186,64)+d.c(40,96,16,"#3e3a40")+d.c(160,96,16,"#3e3a40")+d.e(100,100,62,64,"#3e3a40");
  return g+d.p("M58 96 Q60 64 100 66 Q140 64 142 96 Q146 150 100 156 Q54 150 58 96Z","#8a7a72")+d.e(100,76,40,10,"#3e3a40",null)+d.c(82,94,6,O,null)+d.c(118,94,6,O,null)+d.e(92,118,5,4,O,null)+d.e(108,118,5,4,O,null)+d.l("M84 138 Q100 132 116 138",O,4);},
"hat":()=>d.shadow(100,176,86)+d.e(100,150,90,24,"#c98d4e")+d.p("M46 148 Q46 60 100 60 Q154 60 154 148Z","#e0a55a")+d.r(46,118,108,20,0,C.red,O,3)+d.e(100,150,90,24,"none"),
"ink":()=>d.shadow(100,186,60)+d.p("M44 100 L44 176 L156 176 L156 100 Q156 78 132 74 L68 74 Q44 78 44 100Z","#2c3566")+d.r(76,46,48,30,4,O,null)+d.r(56,112,88,40,6,"#fff")+d.t(100,140,"INK",22,"#2c3566",800)+d.shine(54,130,4,16),
"jet":()=>d.g(d.p("M-80 0 Q-80 -14 -60 -14 L70 -14 Q96 -10 100 0 Q96 10 70 14 L-60 14 Q-80 14 -80 0Z","#fff")+d.p("M-10 -12 L-40 -64 L-20 -64 L30 -12Z",C.blue)+d.p("M-10 12 L-40 64 L-20 64 L30 12Z",C.blue)+d.p("M-62 -12 L-80 -40 L-68 -40 L-46 -12Z",C.red)+[...Array(5)].map((_,i)=>d.c(-30+i*18,-2,4,"#9fd0ff",O,2)).join(""),"translate(96 100) rotate(-24)")+d.l("M18 170 L40 150 M8 150 L30 132",C.grey,4),
"king":()=>d.shadow(100,190,60)+d.p("M44 196 Q44 150 100 150 Q156 150 156 196Z",C.red)+d.p("M72 150 L100 196 L128 150Z","#fff",O,3)+headFace(100,112,40,{mood:"smile"})+d.p("M58 68 L64 30 L82 52 L100 22 L118 52 L136 30 L142 68Z",C.gold)+d.c(100,46,5,C.red,O,2)+d.c(70,52,4,C.blue,O,2)+d.c(130,52,4,C.blue,O,2)+d.p("M84 140 Q100 166 116 140","none","#6b4a2a",10),
"queen":()=>d.shadow(100,190,60)+d.p("M40 196 Q44 150 100 150 Q156 150 160 196Z",C.purple)+headFace(100,112,40,{mood:"smile",girl:true,hair:"#c58a2a"})+d.p("M66 74 L70 46 L86 62 L100 40 L114 62 L130 46 L134 74Z",C.gold)+d.c(100,56,5,C.pink,O,2)+d.l("M60 160 Q100 178 140 160","#fff",5),
"monkey":()=>d.shadow(100,186,60)+d.c(38,98,20,"#b97a4a")+d.c(38,98,12,"#f2c9a0",null)+d.c(162,98,20,"#b97a4a")+d.c(162,98,12,"#f2c9a0",null)+d.c(100,100,60,"#b97a4a")+d.p("M64 104 Q60 70 86 72 Q100 80 114 72 Q140 70 136 104 Q140 152 100 152 Q60 152 64 104Z","#f2c9a0")+d.c(84,96,6,O,null)+d.c(116,96,6,O,null)+d.e(94,118,3,2,O,null)+d.e(106,118,3,2,O,null)+d.l("M84 132 Q100 142 116 132",O,3.5),
"notebook":()=>{let g=d.shadow(100,186,70)+d.r(46,26,112,156,8,C.green)+d.r(62,26,96,156,0,"#7fcc6e",null)+d.r(46,26,112,156,8,"none")+d.r(76,52,66,36,4,"#fff");for(let i=0;i<6;i++)g+=d.c(46,44+i*26,6,"#fff",O,3);return g+d.l("M84 64 L134 64 M84 76 L120 76","#bfb6a4",3);},
"sun":()=>{let g="";for(let i=0;i<12;i++){const a=i*Math.PI/6;g+=d.l(`M${100+Math.cos(a)*62} ${100+Math.sin(a)*62} L${100+Math.cos(a)*86} ${100+Math.sin(a)*86}`,C.orange,8);}
  return g+d.c(100,100,52,C.gold)+d.c(84,94,5,O,null)+d.c(116,94,5,O,null)+d.l("M82 114 Q100 128 118 114",O,4)+d.e(72,110,8,5,C.cheek,null)+d.e(128,110,8,5,C.cheek,null);},
"tree":()=>d.shadow(100,190,60)+d.r(86,120,28,70,4,C.brown)+d.c(100,74,50,C.leaf)+d.c(60,100,34,C.leaf)+d.c(140,100,34,C.leaf)+d.c(100,110,30,C.leaf,null)+d.shine(80,52,12,8,-30)+d.c(70,90,6,C.red,O,2)+d.c(126,70,6,C.red,O,2)+d.c(120,116,6,C.red,O,2),
"umbrella":()=>d.p("M100 30 L100 160 Q100 180 84 180 Q70 180 70 166","none",O,6)+d.p("M14 104 Q20 30 100 28 Q180 30 186 104 Q164 88 142 104 Q120 88 100 104 Q80 88 58 104 Q36 88 14 104Z",C.red)+d.l("M100 30 Q78 60 58 104 M100 30 Q122 60 142 104",C.red2,3)+d.c(100,26,5,O,null),
"violin":()=>d.g(d.p("M0 -60 Q-34 -60 -34 -30 Q-34 -12 -20 -6 Q-36 2 -36 26 Q-36 60 0 60 Q36 60 36 26 Q36 2 20 -6 Q34 -12 34 -30 Q34 -60 0 -60Z","#c0682a")+d.r(-6,-110,12,60,3,O,null)+d.e(0,-114,9,12,"#c0682a")+d.l("M-12 -14 Q-6 -8 -12 -2 M12 -14 Q6 -8 12 -2",O,3)+d.r(-12,30,24,6,2,O,null)+d.l("M-2 -100 L-2 30 M2 -100 L2 30","#eee",1.5),"translate(92 110) rotate(-25)")+d.l("M140 30 L60 180",C.brown2,4),
"watch":()=>d.r(80,10,40,60,8,C.blue)+d.r(80,130,40,60,8,C.blue)+d.c(100,100,46,C.grey)+d.c(100,100,36,"#fff")+d.l("M100 100 L100 74 M100 100 L118 108",O,5)+d.c(100,100,4,O,null)+d.l("M100 68 L100 72 M132 100 L128 100 M100 132 L100 128 M68 100 L72 100",O,3)+d.r(146,94,8,12,2,C.grey),
"box":()=>d.shadow(100,184,80)+d.p("M30 80 L100 104 L170 80 L170 160 L100 184 L30 160Z","#d9a066")+d.p("M30 80 L100 56 L170 80 L100 104Z","#e8b97f")+d.l("M100 104 L100 184",O,4)+d.p("M30 80 L10 56 L80 32 L100 56Z","#e8b97f")+d.p("M170 80 L190 56 L120 32 L100 56Z","#e8b97f"),
"yacht":()=>d.r(0,150,200,50,0,"#7cc4ff",null)+d.l("M0 156 Q25 148 50 156 T100 156 T150 156 T200 156","#fff",4)+d.p("M30 140 L170 140 L150 168 L50 168Z","#fff")+d.r(30,140,140,8,0,C.red,null)+d.l("M100 140 L100 20",O,5)+d.p("M104 24 L160 128 L104 128Z","#fff")+d.p("M96 36 L40 128 L96 128Z",C.yellow),
"flower":()=>{let g=d.l("M100 110 Q96 150 100 190",C.green2,7)+d.e(78,160,20,9,C.leaf,O,-30)+d.e(122,150,20,9,C.leaf,O,30);for(let i=0;i<6;i++){const a=i*Math.PI/3;g+=d.e(100+Math.cos(a)*36,74+Math.sin(a)*36,22,16,C.pink,O,i*60);}return g+d.c(100,74,20,C.yellow)+d.c(94,70,3,O,null)+d.c(106,70,3,O,null)+d.l("M94 80 Q100 85 106 80",O,2.5);},
"shop":()=>{let g=d.r(24,70,152,116,4,"#fff6e0");for(let i=0;i<6;i++)g+=d.p(`M${24+i*25.3} 50 L${49.3+i*25.3} 50 L${49.3+i*25.3} 74 Q${36.6+i*25.3} 90 ${24+i*25.3} 74Z`,i%2?"#fff":C.red,O,3);
  return g+d.r(20,34,160,18,4,C.brown)+d.t(100,48,"SHOP",15,"#fff",800)+d.r(40,100,56,46,4,"#cfe8ff")+d.r(110,100,46,86,4,C.brown)+d.c(146,146,4,C.gold)+d.c(56,124,8,C.red,O,2)+d.c(78,128,8,C.orange,O,2)+d.c(66,112,7,C.yellow,O,2);},
"balloon":()=>d.l("M100 136 Q90 160 104 196",O,3)+d.e(100,78,50,60,C.red)+d.p("M92 136 L108 136 L100 144Z",C.red)+d.shine(80,52,10,18,20),
"house":()=>d.shadow(100,186,82)+d.r(36,90,128,94,2,"#fff3d6")+d.p("M20 96 L100 30 L180 96Z",C.red)+d.r(126,38,20,34,2,C.brown)+d.r(86,124,30,60,3,C.brown)+d.c(110,156,3,C.gold,null)+d.r(48,108,28,28,3,"#cfe8ff")+d.l("M62 108 L62 136 M48 122 L76 122",O,3)+d.r(130,108,26,28,3,"#cfe8ff"),
"car":()=>d.shadow(100,184,86)+d.p("M44 104 L68 66 L132 66 L156 104Z","#cfe8ff")+d.r(14,100,172,54,16,C.red)+d.l("M100 66 L100 104",O,4)+d.c(56,156,20,O,null)+d.c(56,156,8,C.grey,null)+d.c(144,156,20,O,null)+d.c(144,156,8,C.grey,null)+d.r(16,110,16,10,3,C.yellow)+d.r(168,110,16,10,3,"#fff"),
"candy":()=>d.shadow(100,170,70)+d.p("M60 100 L20 70 L26 100 L20 130Z",C.pink)+d.p("M140 100 L180 70 L174 100 L180 130Z",C.pink)+d.c(100,100,44,C.pink)+d.l("M70 80 Q100 100 130 80 M64 104 Q100 124 136 104",C.white,6)+d.shine(84,80,10,6,-30),
"panda":()=>d.shadow(100,186,60)+d.c(48,52,22,O,null)+d.c(152,52,22,O,null)+d.c(100,104,64,"#fff")+d.e(76,100,16,20,O,null,-25)+d.e(124,100,16,20,O,null,25)+d.c(78,98,5,"#fff",null)+d.c(122,98,5,"#fff",null)+d.e(100,128,10,7,O,null)+d.l("M100 134 L100 142 M90 146 Q100 152 110 146",O,3),
"bear":()=>d.shadow(100,186,60)+d.c(48,54,22,"#9a6338")+d.c(48,54,11,"#e0aa6a",null)+d.c(152,54,22,"#9a6338")+d.c(152,54,11,"#e0aa6a",null)+d.c(100,104,64,"#9a6338")+d.e(100,128,30,24,"#e0aa6a")+d.c(78,96,7,O,null)+d.c(122,96,7,O,null)+d.e(100,118,10,7,O,null)+d.l("M100 124 L100 134 M90 140 Q100 146 110 140",O,3),
"hint":()=>d.shadow(100,190,40)+d.c(100,80,50,C.yellow)+d.shine(80,60,10,16,20)+d.r(80,124,40,30,6,C.grey)+d.l("M80 134 L120 134 M80 144 L120 144",O,3)+d.l("M86 100 Q86 80 100 80 Q114 80 114 100 M100 80 L100 120",C.orange2,4)+d.l("M100 4 L100 18 M30 30 L40 40 M170 30 L160 40 M18 86 L32 86 M182 86 L168 86",C.orange,5),
"sea":()=>d.r(0,0,200,90,0,C.sky,null)+d.c(156,50,18,C.gold,null)+d.r(0,90,200,110,0,"#3f9be8",null)+d.l("M0 90 L200 90",O,3)+d.l("M10 120 Q30 110 50 120 T90 120 M110 140 Q130 130 150 140 T190 140 M30 170 Q50 160 70 170 T110 170","#fff",4)+d.p("M40 72 Q50 60 60 72 M70 60 Q80 48 90 60",null,O,3),
"elephant":()=>d.shadow(100,186,70)+d.e(40,96,34,44,"#a9b3c9")+d.e(160,96,34,44,"#a9b3c9")+d.e(40,96,22,32,C.pink,null)+d.e(160,96,22,32,C.pink,null)+d.c(100,92,52,"#b9c3d9")+d.p("M86 120 Q84 170 108 184 Q120 186 118 174 Q100 166 112 120Z","#b9c3d9")+d.c(80,86,6,O,null)+d.c(120,86,6,O,null)+d.p("M84 132 Q76 146 70 140 Z","#fff",O,3),
"horse":()=>d.shadow(100,192,50)+d.p("M66 52 L62 14 L86 40Z","#b8682e")+d.p("M134 52 L138 14 L114 40Z","#b8682e")+d.e(100,104,44,70,"#c0773a")+d.e(100,160,38,30,"#e6b48a")+d.e(88,162,5,8,O,null)+d.e(112,162,5,8,O,null)+d.l("M90 180 Q100 186 110 180",O,3)+d.c(72,96,7,O,null)+d.c(128,96,7,O,null)+d.c(74,93,2.5,"#fff",null)+d.c(130,93,2.5,"#fff",null)+d.p("M84 34 Q100 22 116 34 Q112 60 100 70 Q96 52 84 34Z","#5a3216"),
"spider":()=>{let g=d.l("M100 0 L100 60","#9aa0aa",2);for(let s of [-1,1])for(let i=0;i<4;i++)g+=d.l(`M100 ${100+i*8} Q${100+s*50} ${60+i*20} ${100+s*80} ${100+i*28}`,O,6);
  return g+d.c(100,110,36,"#3e3a40")+d.c(100,70,20,"#3e3a40")+d.c(92,66,6,"#fff")+d.c(108,66,6,"#fff")+d.c(92,67,3,O,null)+d.c(108,67,3,O,null);},
"dragon":()=>d.shadow(100,190,60)+d.p("M150 150 Q190 130 180 100 Q170 80 186 70","none",C.green2,10)+d.p("M60 70 L40 30 L80 56 M140 70 L160 30 L120 56",C.yellow)+d.e(100,150,52,40,C.green)+d.c(100,92,48,C.green)+d.e(100,112,28,20,"#bfe6a0")+d.c(92,108,3,O,null)+d.c(108,108,3,O,null)+d.c(82,82,9,"#fff")+d.c(118,82,9,"#fff")+d.c(83,83,5,O,null)+d.c(119,83,5,O,null)+d.p("M60 140 Q20 110 30 80 Q50 110 70 120Z","#ffb04a")+d.p("M140 140 Q180 110 170 80 Q150 110 130 120Z","#ffb04a"),
"snake":()=>d.l("M30 170 Q30 130 80 140 Q140 150 140 110 Q140 70 90 80 Q60 86 70 60",O,30)+d.l("M30 170 Q30 130 80 140 Q140 150 140 110 Q140 70 90 80 Q60 86 70 60",C.green,22)+d.e(78,48,26,20,C.green)+d.c(70,42,4,O,null)+d.c(88,42,4,O,null)+d.l("M78 66 L78 80 M78 80 L72 88 M78 80 L84 88",C.red,3)+d.l("M50 156 L60 150 M100 146 L110 140 M126 120 L134 112",C.yellow,4),
"tiger":()=>d.shadow(100,186,60)+d.c(50,54,20,"#f29a3a")+d.c(150,54,20,"#f29a3a")+d.c(100,104,64,"#f29a3a")+d.e(100,132,34,26,"#fff")+d.l("M100 44 L100 66 M84 46 L88 62 M116 46 L112 62 M40 96 L60 100 M36 116 L58 114 M160 96 L140 100 M164 116 L142 114",O,5)+d.c(78,98,7,O,null)+d.c(122,98,7,O,null)+d.p("M92 122 L108 122 L100 132Z",C.pink,O,2.5)+d.l("M100 132 Q92 142 84 136 M100 132 Q108 142 116 136",O,3),
"sheep":()=>{let g=d.shadow(100,186,64);[[60,80],[100,62],[140,80],[48,118],[152,118],[70,150],[130,150],[100,160]].forEach(([x,y])=>g+=d.c(x,y,30,"#fff"));
  return g+d.c(100,110,52,"#fff",null)+d.e(100,112,30,36,"#3e3a40")+d.e(64,102,14,7,"#3e3a40",O,-20)+d.e(136,102,14,7,"#3e3a40",O,20)+d.c(90,106,5,"#fff",null)+d.c(110,106,5,"#fff",null)+d.l("M92 130 Q100 136 108 130","#fff",3);},
"chicken":()=>d.shadow(100,186,50)+d.e(100,124,52,50,"#fff")+d.p("M140 110 Q176 90 170 132 Q160 150 140 140Z","#fff")+d.c(84,66,32,"#fff")+d.p("M76 34 Q78 18 88 26 Q94 14 100 28 Q110 22 106 40Z",C.red)+d.p("M56 66 L38 74 L56 80Z",C.orange)+d.e(62,92,6,10,C.red,O)+d.c(80,62,5,O,null)+d.l("M90 172 L84 194 M110 172 L116 194",C.orange2,5),
"wild boar":()=>d.shadow(100,186,70)+d.e(110,120,72,52,"#7a5a3c")+d.l("M60 76 L150 76",O,0)+[...Array(6)].map((_,i)=>d.l(`M${70+i*18} 72 l6 -14`,"#5a3e28",5)).join("")+d.e(46,128,30,26,"#8a6a48")+d.e(24,132,12,14,"#c9a07a")+d.e(20,128,3,5,O,null)+d.e(28,128,3,5,O,null)+d.p("M36 148 Q30 158 20 156",null,"#fff",5)+d.c(52,116,5,O,null)+d.p("M60 98 L58 84 L72 96Z","#5a3e28")+d.l("M70 168 L70 186 M150 168 L150 186",O,8),
"shiny":()=>d.shadow(100,186,60)+d.p("M60 60 L140 60 L170 96 L100 176 L30 96Z","#9fe0ff")+d.l("M30 96 L170 96 M60 60 L80 96 L100 176 L120 96 L140 60 M100 60 L80 96 M100 60 L120 96",C.blue2,3)+d.sparkle(40,40,16,"#fff")+d.sparkle(166,44,12,"#fff")+d.sparkle(162,150,10,C.gold)+d.sparkle(36,150,9,C.gold),
"scary":()=>d.shadow(100,190,50)+d.p("M44 186 L44 90 Q44 30 100 30 Q156 30 156 90 L156 186 L136 170 L118 186 L100 170 L82 186 L64 170Z","#fff")+d.e(80,92,10,14,O,null)+d.e(120,92,10,14,O,null)+d.e(100,132,14,18,O,null)+d.l("M18 40 L30 50 M182 40 L170 50 M14 80 L28 80 M186 80 L172 80",C.purple,4),
"round":()=>d.shadow(100,184,70)+d.c(100,100,74,C.orange)+d.shine(70,66,20,12,-30)+d.c(100,100,90,"none",C.gold,3)+d.l("M100 0 L100 10 M190 100 L200 100 M100 190 L100 200 M0 100 L10 100",C.gold,4),
"furry":()=>{let g=d.shadow(100,186,64);for(let i=0;i<28;i++){const a=i*Math.PI*2/28,r=i%2?70:60;g+=d.l(`M100 108 L${(100+Math.cos(a)*r).toFixed(1)} ${(108+Math.sin(a)*r).toFixed(1)}`,"#f2d0a8",14);}
  return g+d.c(100,108,56,"#f2d0a8",null)+d.c(80,100,8,O,null)+d.c(120,100,8,O,null)+d.c(83,97,3,"#fff",null)+d.c(123,97,3,"#fff",null)+d.e(100,122,6,4,C.pink,O,0,2)+d.l("M88 132 Q100 140 112 132",O,3);},
"shoulders":()=>kid(100,196,{s:1.3,shirt:C.blue,mood:"smile"})+ring(70,98,17,15)+ring(130,98,17,15),
"knees":()=>kid(100,196,{s:1.3,shirt:C.blue,mood:"smile",pants:"#4a4f6b"})+ring(88,172,14,13)+ring(112,172,14,13),
"toes":()=>kid(100,196,{s:1.3,shirt:C.blue,mood:"smile"})+ring(86,192,17,9)+ring(114,192,17,9)
});
PIC["alphabet"]=()=>PIC["a–z (uppercase)"]();
PIC["noodles"]=PIC["noodle"];PIC["rice balls"]=PIC["rice ball"];

/* ---------- Let's Try 2 ---------- */
/* clock face at (x,y) radius r showing h:m */
function clock(x,y,r,h,m,face){let g=d.c(x,y,r,face||"#fff",O,Math.max(3,r/12));
  for(let i=0;i<12;i++){const a=i*Math.PI/6,l=i%3?0.88:0.8;g+=d.l(`M${(x+Math.sin(a)*r*l).toFixed(1)} ${(y-Math.cos(a)*r*l).toFixed(1)} L${(x+Math.sin(a)*r*0.95).toFixed(1)} ${(y-Math.cos(a)*r*0.95).toFixed(1)}`,O,i%3?2:3.5);}
  const ha=((h%12)+m/60)*Math.PI/6,ma=m*Math.PI/30;
  g+=d.l(`M${x} ${y} L${(x+Math.sin(ha)*r*0.5).toFixed(1)} ${(y-Math.cos(ha)*r*0.5).toFixed(1)}`,O,Math.max(4,r/9));
  g+=d.l(`M${x} ${y} L${(x+Math.sin(ma)*r*0.75).toFixed(1)} ${(y-Math.cos(ma)*r*0.75).toFixed(1)}`,C.red,Math.max(3,r/14));
  return g+d.c(x,y,Math.max(3,r/14),O,null);}
const moon=(x,y,r)=>d.p(`M${x+r*0.3} ${y-r} A${r} ${r} 0 1 0 ${x+r*0.3} ${y+r} A${r*0.75} ${r*0.75} 0 1 1 ${x+r*0.3} ${y-r}Z`,C.gold);
const sunIcon=(x,y,r)=>{let g="";for(let i=0;i<8;i++){const a=i*Math.PI/4;g+=d.l(`M${(x+Math.cos(a)*r*1.25).toFixed(1)} ${(y+Math.sin(a)*r*1.25).toFixed(1)} L${(x+Math.cos(a)*r*1.6).toFixed(1)} ${(y+Math.sin(a)*r*1.6).toFixed(1)}`,C.orange,Math.max(3,r/5));}return g+d.c(x,y,r,C.gold);};
const cloud=(x,y,s,f)=>d.g(d.p("M-40 14 Q-56 14 -54 -2 Q-52 -18 -34 -14 Q-30 -36 -6 -34 Q14 -46 28 -26 Q52 -30 52 -6 Q62 14 40 14Z",f||"#fff"),`translate(${x} ${y}) scale(${s})`);
const stars=pts=>pts.map(([x,y,r])=>d.star(x,y,r,C.gold,O,2)).join("");
/* a small inset picture of another word, in a white circle */
const inset=(w,x,y,r)=>d.c(x,y,r,"#fff",O,3)+d.g(PIC[w]?PIC[w]():"",`translate(${x-r*0.8} ${y-r*0.8}) scale(${r*1.6/200})`);
/* calendar page for a weekday: English abbreviation, Japanese kanji and the kanji's own picture */
function weekday(ab,kanji,col,icon){return d.shadow(100,190,74)+d.r(26,30,148,152,12,"#fff")+d.r(26,30,148,40,12,col)+d.r(26,58,148,12,0,col,null)+d.l("M58 22 L58 40 M142 22 L142 40",O,6)+
  d.t(100,62,ab,26,"#fff",800)+d.t(70,140,kanji,52,col,800)+icon;}
/* a room seen from the front: wall, floor and a door sign */
const room=(wall,floor,inner,sign)=>d.r(8,14,184,176,10,wall)+d.p("M10 140 L190 140 L190 186 Q190 188 186 188 L14 188 Q10 188 10 186Z",floor,null)+d.l("M10 140 L190 140",O,3)+inner+(sign?d.r(64,18,72,20,4,"#fff",O,2.5)+d.t(100,33,sign,12,O,800):"");
const sitKid=(x,y,shirt)=>d.g(d.r(-28,-6,56,8,3,"#c98d4e")+d.r(-26,0,6,44,2,"#c98d4e")+d.r(20,0,6,44,2,"#c98d4e")+d.r(20,-60,6,60,2,"#c98d4e")+
  d.r(-24,-14,40,14,6,"#4a4f6b")+d.r(-28,-14,12,48,5,"#4a4f6b")+d.e(-26,36,10,5,"#5a4636")+d.r(-14,-66,30,56,12,shirt||C.blue)+headFace(0,-92,24,{mood:"smile"}),`translate(${x} ${y})`);
Object.assign(PIC,{
"good morning":()=>d.r(8,8,184,184,14,"#ffe9c9",null)+d.p("M8 132 Q60 110 100 126 Q150 104 192 128 L192 192 L8 192Z","#9fd68a",null)+sunIcon(60,112,24)+d.p("M8 132 Q60 110 100 126 Q150 104 192 128",null,O,3)+kid(140,186,{s:0.85,shirt:C.yellow,arm:"wave",mood:"open"}),
"good afternoon":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.r(8,140,184,52,0,"#9fd68a",null)+sunIcon(100,44,22)+cloud(40,70,0.5)+kid(64,186,{s:0.85,shirt:C.green,arm:"wave",mood:"open"})+kid(140,186,{s:0.85,shirt:C.pink,arm:"wave-left",mood:"open",girl:true}),
"good night":()=>d.r(8,8,184,184,14,"#2c3566",null)+moon(60,52,24)+stars([[150,40,10],[118,70,7],[176,86,6]])+d.r(26,130,148,50,10,"#8fb5ff")+d.r(26,118,48,26,10,"#fff")+headFace(56,118,22,{mood:"flat"})+d.l("M48 120 L56 120 M58 120 L66 120",O,0)+d.p("M60 140 Q110 120 174 132 L174 150 L60 150Z","#cfe0ff")+d.t(110,110,"z",18,"#fff",800)+d.t(126,94,"Z",24,"#fff",800),
"morning":()=>d.r(8,8,184,184,14,"#ffe9c9",null)+d.c(100,140,40,C.gold)+[...Array(7)].map((_,i)=>{const a=Math.PI+i*Math.PI/6;return d.l(`M${(100+Math.cos(a)*52).toFixed(1)} ${(140+Math.sin(a)*52).toFixed(1)} L${(100+Math.cos(a)*72).toFixed(1)} ${(140+Math.sin(a)*72).toFixed(1)}`,C.orange,6);}).join("")+d.r(8,140,184,52,0,"#9fd68a",null)+d.l("M8 140 L192 140",O,3)+d.p("M30 60 Q36 52 42 60 M48 52 Q54 44 60 52",null,O,3),
"afternoon":()=>d.r(8,8,184,184,14,"#bfe6ff",null)+sunIcon(100,52,26)+d.r(8,150,184,42,0,"#9fd68a",null)+d.l("M8 150 L192 150",O,3)+clock(150,124,26,3,0),
"night":()=>d.r(8,8,184,184,14,"#2c3566",null)+moon(110,80,40)+stars([[40,40,10],[60,120,7],[160,40,8],[170,140,10],[40,170,6]]),
"world":()=>d.shadow(100,190,60)+d.c(100,100,80,"#5ab4f0")+d.p("M50 50 Q70 40 86 56 Q90 76 72 84 Q60 104 66 124 Q50 120 40 96 Q36 70 50 50Z",C.leaf,O,3)+d.p("M110 40 Q140 34 158 60 Q150 70 136 66 Q124 80 132 96 Q146 104 150 130 Q136 160 118 150 Q112 120 104 104 Q96 80 110 40Z",C.leaf,O,3)+d.p("M70 150 Q90 144 100 160 Q90 172 72 166Z",C.leaf,O,3)+d.shine(64,52,16,8,-30),
"weather":()=>sunIcon(64,64,26)+cloud(118,96,0.9)+d.l("M92 126 L84 144 M112 126 L104 144 M132 126 L124 144",C.blue,5)+d.g(d.p("M-8 -10 L8 -10 M0 -14 L0 14 M-10 6 L10 -6 M-10 -6 L10 6",null,C.blue2,4),"translate(150 160)")+d.g(d.p("M-8 -10 L8 -10 M0 -14 L0 14 M-10 6 L10 -6 M-10 -6 L10 6",null,C.blue2,4),"translate(40 150)"),
"sunny":()=>d.r(8,8,184,184,14,"#cfeeff",null)+sunIcon(100,96,44)+d.c(86,90,5,O,null)+d.c(114,90,5,O,null)+d.l("M84 108 Q100 120 116 108",O,4),
"rainy":()=>d.r(8,8,184,184,14,"#dfe6ee",null)+cloud(100,70,1.4,"#c9d3e3")+[[50,110],[80,130],[110,110],[140,130],[66,160],[126,160],[96,176]].map(([x,y])=>d.p(`M${x} ${y-12} Q${x-7} ${y} ${x} ${y+4} Q${x+7} ${y} ${x} ${y-12}Z`,"#5ab4f0",O,2.5)).join(""),
"cloudy":()=>d.r(8,8,184,184,14,"#e6eef6",null)+sunIcon(130,60,20)+cloud(90,90,1.3,"#fff")+cloud(130,140,1,"#d7dee8"),
"snowy":()=>d.r(8,8,184,184,14,"#e6eef6",null)+cloud(100,60,1.3,"#fff")+[[50,110],[90,130],[130,110],[160,150],[60,160],[110,170]].map(([x,y])=>d.c(x,y,9,"#fff",O,2.5)).join("")+d.p("M8 176 Q60 160 100 172 Q150 158 192 174 L192 192 L8 192Z","#fff",O,3),
"hot":()=>sunIcon(70,70,36)+d.c(58,64,4,O,null)+d.c(82,64,4,O,null)+d.p("M60 82 Q70 92 80 82Z","#c4473f",O,2.5)+d.r(136,40,24,110,12,"#fff")+d.c(148,160,20,C.red)+d.r(142,60,12,96,6,C.red,null)+d.l("M160 60 L168 60 M160 80 L168 80 M160 100 L168 100",O,3)+d.p("M30 140 Q20 156 30 162 Q40 156 30 140Z","#a8dcff",O,2.5)+d.l("M70 130 Q60 150 70 170 M96 130 Q86 150 96 170","#ffb04a",4),
"cold":()=>d.g(d.p("M-30 0 L30 0 M0 -30 L0 30 M-21 -21 L21 21 M21 -21 L-21 21",null,"#5ab4f0",7),"translate(56 56)")+d.r(136,40,24,110,12,"#fff")+d.c(148,160,20,C.blue)+d.r(142,128,12,28,6,C.blue,null)+d.l("M160 60 L168 60 M160 80 L168 80 M160 100 L168 100",O,3)+headFace(70,140,34,{mood:"o"})+d.r(36,160,70,16,8,C.red)+d.r(84,160,14,34,6,C.red)+d.l("M40 118 L30 112 M100 118 L110 112","#9fd0ff",3),
"stand up":()=>d.r(0,176,200,24,0,"#e9d6b0",null)+d.g(d.r(-28,-6,56,8,3,"#c98d4e")+d.r(-26,0,6,44,2,"#c98d4e")+d.r(20,0,6,44,2,"#c98d4e")+d.r(20,-60,6,60,2,"#c98d4e"),"translate(52 136)")+kid(120,184,{s:1,shirt:C.blue,arm:"up",mood:"open"})+d.p("M172 120 L172 50 L160 64 M172 50 L184 64",null,"#ffb000",7),
"sit down":()=>d.r(0,176,200,24,0,"#e9d6b0",null)+sitKid(100,136,C.green)+d.p("M164 50 L164 120 L152 106 M164 120 L176 106",null,"#ffb000",7),
"jump":()=>d.r(0,170,200,30,0,"#e9d6b0",null)+d.e(100,182,30,6,"#000",null)+d.g(kid(0,0,{s:0.95,shirt:C.orange,arm:"both",mood:"open"}),"translate(100 132)")+d.l("M60 150 L50 160 M140 150 L150 160 M100 150 L100 164",C.grey2,4),
"turn around":()=>kid(100,186,{s:1,shirt:C.purple,arm:"down",mood:"smile"})+d.p("M30 120 A72 26 0 1 0 170 120",null,"#ffb000",7)+d.p("M170 120 L176 100 L156 108Z","#ffb000",O,3),
"walk":()=>d.r(0,170,200,30,0,"#cfeac0",null)+d.g(kid(0,0,{s:0.95,shirt:C.blue,arm:"down",mood:"smile"}),"translate(120 182) rotate(4)")+[[30,186],[50,178],[70,186],[90,178]].map(([x,y])=>d.e(x,y,6,4,"#9a8a70",null)).join(""),
"run":()=>d.r(0,170,200,30,0,"#e9d6b0",null)+d.g(kid(0,0,{s:0.95,shirt:C.red,arm:"both",mood:"open"}),"translate(122 186) rotate(14)")+d.l("M20 80 L64 80 M10 104 L60 104 M24 128 L66 128",C.grey,5)+d.p("M150 50 Q144 60 150 64 Q156 60 150 50Z","#a8dcff",O,2),
"look":()=>headFace(100,110,70,{mood:"open"})+d.c(74,112,13,"#fff",O,3)+d.c(126,112,13,"#fff",O,3)+d.c(78,112,7,O,null)+d.c(130,112,7,O,null)+d.g(d.r(-40,-10,80,20,10,C.skin)+d.r(-40,-10,80,20,10,"none"),"translate(70 56) rotate(-12)")+d.l("M150 70 L190 60 M152 100 L194 100 M150 130 L190 140",C.orange,4),
"touch":()=>d.c(150,70,30,C.blue)+d.sparkle(150,70,14,"#fff")+d.g(d.p("M-14 0 L-14 -60 Q-14 -72 -4 -72 Q6 -72 6 -60 L6 -20 L40 -14 Q56 -10 54 8 L48 50 L-6 50 Q-20 40 -28 20 L-40 -6 Q-44 -16 -34 -18 Q-24 -18 -14 0Z",C.skin),"translate(110 140) rotate(30)")+d.l("M120 40 L110 30 M184 50 L194 44 M180 96 L192 104",C.orange,4),
"play":()=>d.r(0,160,200,40,0,"#cfeac0",null)+kid(50,186,{s:0.85,shirt:C.red,arm:"up",mood:"open"})+kid(150,186,{s:0.85,shirt:C.blue,arm:"wave",mood:"open"})+d.c(100,54,16,"#fff")+d.l("M90 46 Q100 54 90 62 M110 46 Q100 54 110 62",C.red,3)+d.l("M72 60 Q86 40 90 46",C.grey,3),
"left":()=>d.g(d.p("M-10 -60 L10 -60 L10 20 L50 20 L50 40 L-10 40Z",C.skin)+d.c(28,24,0,""),"translate(64 80)")+d.t(70,190,"L",0,O)+d.p("M196 100 L112 100 L112 70 L60 116 L112 162 L112 132 L196 132Z","#ffb000",O,5)+d.t(40,60,"",0),
"hand":()=>d.g(d.p("M-30 60 L-34 0 Q-34 -12 -24 -12 Q-14 -12 -14 0 L-14 -60 Q-14 -72 -4 -72 Q6 -72 6 -60 L6 -66 Q6 -78 16 -78 Q26 -78 26 -66 L26 -56 Q26 -68 36 -68 Q46 -68 46 -56 L46 -36 Q46 -48 56 -48 Q66 -48 66 -36 L64 30 Q60 60 40 70Z",C.skin),"translate(90 112)")+ring(110,140,74,64),
"leg":()=>kid(100,196,{s:1.3,shirt:C.blue,mood:"smile"})+d.r(74,142,30,56,14,"none","#ffb000",6),
"tag":()=>d.r(0,160,200,40,0,"#cfeac0",null)+d.g(kid(0,0,{s:0.8,shirt:C.blue,arm:"both",mood:"open"}),"translate(150 186) rotate(10)")+d.g(kid(0,0,{s:0.8,shirt:C.red,arm:"up",mood:"grin"}),"translate(64 186) rotate(12)")+d.l("M100 90 L120 84 M100 110 L124 108",C.grey,4)+d.p("M150 30 L154 50 M140 34 L148 50 M162 34 L156 50",null,O,3),
"jump rope":()=>d.r(0,170,200,30,0,"#e9d6b0",null)+d.p("M40 120 Q40 196 100 196 Q160 196 160 120",null,C.red,5)+d.p("M40 120 Q40 6 100 6 Q160 6 160 120",null,C.red,3)+d.g(kid(0,0,{s:0.9,shirt:C.yellow,arm:"down",mood:"open"}),"translate(100 162)")+d.e(100,184,26,5,"#000",null),
"bingo":()=>{let g=d.shadow(100,190,80)+d.r(20,20,160,166,10,"#fff")+d.r(20,20,160,34,10,C.red)+d.r(20,44,160,10,0,C.red,null)+d.t(100,46,"BINGO",24,"#fff",800);
  for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=28+c*30,y=60+r*30;g+=d.r(x,y,26,26,3,"#fff6e0",O,2);if((r+c)%3===0||r===1)g+=d.c(x+13,y+13,10,C.blue,null);}return g;},
"game":()=>d.shadow(100,184,80)+d.g(d.r(-30,-30,60,60,10,"#fff")+d.c(-14,-14,6,O,null)+d.c(14,14,6,O,null)+d.c(0,0,6,O,null),"translate(64 112) rotate(-14)")+d.g(d.r(-30,-30,60,60,10,C.red)+d.c(-14,-14,6,"#fff",null)+d.c(14,14,6,"#fff",null)+d.c(14,-14,6,"#fff",null)+d.c(-14,14,6,"#fff",null),"translate(138 128) rotate(16)")+d.c(140,50,14,C.blue)+d.p("M126 52 L120 86 L160 86 L154 52Z",C.blue),
"outside":()=>d.r(0,150,200,50,0,"#9fd68a",null)+sunIcon(160,40,16)+d.r(14,40,90,110,4,"#fff3d6")+d.p("M6 46 L59 8 L112 46Z",C.red)+d.r(46,94,28,56,3,C.brown)+kid(150,184,{s:0.8,shirt:C.blue,arm:"wave",mood:"open"})+d.p("M90 128 L120 128 L120 118 L136 134 L120 150 L120 140 L90 140Z","#ffb000",O,3),
"inside":()=>d.r(0,150,200,50,0,"#9fd68a",null)+d.r(20,50,160,120,4,"#fff3d6")+d.p("M10 56 L100 6 L190 56Z",C.red)+d.r(48,74,104,80,6,"#ffe9b8")+d.g(kid(0,0,{s:0.55,shirt:C.blue,arm:"wave",mood:"open"}),"translate(100 152)")+d.l("M100 74 L100 154 M48 112 L152 112",O,0)+d.r(48,74,104,80,6,"none",O,5),
"shirt":()=>d.shadow(100,186,70)+d.p("M70 30 L40 40 L14 80 L40 96 L52 80 L52 180 L148 180 L148 80 L160 96 L186 80 L160 40 L130 30 Q100 50 70 30Z",C.blue)+d.l("M100 46 L100 180",C.blue2,3)+[70,100,130,160].map(y=>d.c(108,y,3.5,"#fff",O,1.5)).join("")+d.p("M70 30 L90 52 L100 46 L110 52 L130 30",null,O,3),
"shorts":()=>d.shadow(100,184,70)+d.p("M40 40 L160 40 L172 150 L112 156 L100 90 L88 156 L28 150Z","#4a8fe8")+d.r(40,40,120,16,3,C.blue2)+d.l("M100 56 L100 90",O,3),
"sweater":()=>d.shadow(100,186,74)+d.p("M70 26 L36 40 L14 150 L42 156 L54 84 L54 180 L146 180 L146 84 L158 156 L186 150 L164 40 L130 26 Q100 46 70 26Z",C.red)+d.r(54,166,92,14,3,C.red2)+d.r(14,146,28,12,3,C.red2,O,3)+d.r(158,146,28,12,3,C.red2,O,3)+d.l("M64 100 L80 116 L96 100 L112 116 L128 100 L144 116 M64 126 L80 142 L96 126 L112 142 L128 126 L144 142","#fff",4),
"pants":()=>d.shadow(100,190,60)+d.p("M50 20 L150 20 L160 186 L112 186 L100 70 L88 186 L40 186Z","#4a4f6b")+d.r(50,20,100,16,3,"#3a3f50")+d.l("M64 50 L64 70 M136 50 L136 70",O,3),
"boots":()=>d.shadow(100,186,80)+d.p("M30 30 L74 30 L74 140 Q110 140 110 168 L110 180 L30 180Z",C.yellow)+d.p("M104 30 L148 30 L148 140 Q184 140 184 168 L184 180 L104 180Z",C.yellow)+d.r(26,22,52,16,4,C.yellow2)+d.r(100,22,52,16,4,C.yellow2)+d.r(28,170,84,12,3,O,null)+d.r(102,170,84,12,3,O,null),
"cap":()=>d.shadow(100,170,80)+d.p("M30 120 Q30 40 100 40 Q170 40 170 120Z",C.red)+d.p("M100 120 L196 120 Q196 146 150 140 L100 136Z",C.red2)+d.l("M100 40 L100 120 M60 50 Q80 80 76 120 M140 50 Q120 80 124 120",C.red2,3)+d.c(100,40,7,C.red)+d.r(30,114,140,10,3,"#fff"),
"day":()=>d.r(8,8,92,184,10,"#cfeeff",null)+d.r(100,8,92,184,10,"#2c3566",null)+sunIcon(54,80,22)+moon(146,80,22)+stars([[130,140,6],[166,150,8]])+d.l("M100 8 L100 192",O,3)+d.p("M30 150 Q54 140 78 150",null,O,3),
"monday":()=>weekday("MON","月","#3a6fc8",moon(150,130,24)),
"tuesday":()=>weekday("TUE","火",C.red,d.p("M150 104 Q170 124 166 146 Q160 166 150 166 Q134 166 132 146 Q130 130 140 124 Q140 136 146 138 Q144 118 150 104Z",C.orange)),
"wednesday":()=>weekday("WED","水","#2f8ac8",d.p("M150 100 Q172 132 172 148 Q172 168 150 168 Q128 168 128 148 Q128 132 150 100Z","#5ab4f0")),
"thursday":()=>weekday("THU","木",C.green2,d.r(144,140,12,28,2,C.brown)+d.c(150,126,22,C.leaf)),
"friday":()=>weekday("FRI","金","#c58a12",d.c(150,140,24,C.gold)+d.c(150,140,16,"none","#e0a91f",3)+d.t(150,148,"¥",20,"#9a6a00",800)),
"saturday":()=>weekday("SAT","土","#2f69b8",d.p("M122 166 Q130 128 150 120 Q170 128 178 166Z","#a0703c")+d.e(144,112,10,8,C.leaf,O,-30,3)),
"sunday":()=>weekday("SUN","日",C.red,sunIcon(150,138,16)),
"mushroom":()=>d.shadow(100,186,60)+d.p("M76 110 L72 176 Q100 186 128 176 L124 110Z","#fff3dc")+d.p("M20 116 Q24 36 100 36 Q176 36 180 116 Q100 132 20 116Z",C.red)+d.c(70,70,12,"#fff",O,3)+d.c(122,60,10,"#fff",O,3)+d.c(150,94,9,"#fff",O,3)+d.c(46,102,7,"#fff",O,3),
"watermelon":()=>{let g=d.shadow(100,186,84)+d.p("M10 80 A90 90 0 0 0 190 80Z",C.green)+d.p("M20 80 A80 80 0 0 0 180 80Z","#fff",null)+d.p("M28 80 A72 72 0 0 0 172 80Z",C.red,null)+d.l("M10 80 L190 80",O,4);
  [[60,100],[90,120],[120,110],[150,96],[100,140],[74,128]].forEach(([x,y])=>g+=d.e(x,y,3.5,5.5,O,null));return g;},
"soup":()=>d.shadow(100,186,80)+d.p("M20 90 Q22 172 100 172 Q178 172 180 90Z","#fff")+d.e(100,90,80,18,"#ffb04a")+d.c(70,88,7,C.orange,O,2)+d.c(118,92,8,C.green,O,2)+d.c(140,86,6,C.orange,O,2)+d.l("M70 64 Q60 50 70 36 M100 60 Q90 46 100 30 M130 64 Q120 50 130 36",C.grey,4)+d.p("M150 120 Q180 60 194 70",null,C.grey2,8),
"pie":()=>{let g=d.shadow(100,186,84)+d.e(100,130,86,40,"#e8b066")+d.p("M14 130 L14 146 Q100 196 186 146 L186 130",d.C.brown);
  for(let i=-3;i<=3;i++)g+=d.l(`M${100+i*22} 96 L${100+i*22} 166`,"#c98d4e",8);for(let i=-1;i<=1;i++)g+=d.l(`M24 ${130+i*18} L176 ${130+i*18}`,"#c98d4e",8);return g+d.e(100,130,86,40,"none");},
"sandwich":()=>d.shadow(100,186,84)+d.p("M20 150 L100 40 L180 150Z","#fff3d6")+d.p("M20 150 L100 40 L180 150Z","none","#e0a55a",8)+d.p("M30 146 L170 146 L176 160 L24 160Z",C.leaf)+d.p("M24 160 L176 160 L176 172 L24 172Z",C.red)+d.r(20,168,160,18,4,"#fff3d6")+d.r(20,168,160,18,4,"none","#e0a55a",6),
"fresh":()=>PIC.apple()+d.sparkle(40,40,16,"#fff")+d.sparkle(166,60,12,"#fff")+d.p("M170 120 Q160 136 170 142 Q180 136 170 120Z","#a8dcff",O,2.5)+d.p("M34 130 Q26 144 34 150 Q42 144 34 130Z","#a8dcff",O,2.5),
"a.m.":()=>d.r(8,8,184,184,14,"#ffe9c9",null)+d.c(60,150,30,C.gold)+d.r(8,150,184,42,0,"#9fd68a",null)+d.l("M8 150 L192 150",O,3)+clock(124,82,52,8,0)+d.t(40,46,"AM",22,"#c58a12",800),
"p.m.":()=>d.r(8,8,184,184,14,"#2c3566",null)+moon(52,50,20)+stars([[164,170,8],[30,140,6]])+clock(124,92,52,8,0)+d.t(52,170,"PM",22,"#ffd23f",800),
"wake-up time":()=>clock(90,96,74,6,30)+inset("wake up",162,160,34),
"breakfast time":()=>clock(90,96,74,7,0)+inset("have breakfast",162,160,34),
"study time":()=>clock(90,96,74,9,0)+inset("homework",162,160,34),
"lunch time":()=>clock(90,96,74,12,30)+inset("rice ball",162,160,34),
"snack time":()=>clock(90,96,74,3,0)+inset("candy",162,160,34),
"homework time":()=>clock(90,96,74,4,30)+inset("notebook",162,160,34),
"tv time":()=>clock(90,96,74,7,0)+inset("tv",162,160,34),
"dinner time":()=>clock(90,96,74,6,30)+inset("dinner",162,160,34),
"bath time":()=>clock(90,96,74,8,0)+inset("bath",162,160,34),
"bed time":()=>clock(90,96,74,9,0)+inset("good night",162,160,34),
"dream time":()=>clock(90,96,74,12,0,"#e6e9ff")+inset("dream",162,160,34),
"tv":()=>d.shadow(100,186,80)+d.r(16,40,168,120,14,"#3a3f50")+d.r(30,52,140,96,6,"#8fd0ff")+sunIcon(70,90,12)+d.p("M30 148 L80 110 L120 136 L150 116 L170 130 L170 148Z",C.leaf,null)+d.l("M70 40 L50 10 M130 40 L150 10",O,4)+d.r(70,160,60,12,4,"#3a3f50"),
"bath":()=>d.r(20,96,160,70,30,"#fff")+d.r(28,96,144,20,10,"#7cc4ff",null)+headFace(76,92,24,{mood:"smile"})+d.c(130,88,10,"#fff",O,2)+d.c(146,72,7,"#fff",O,2)+d.c(118,64,5,"#fff",O,2)+d.r(40,160,14,20,3,C.grey)+d.r(146,160,14,20,3,C.grey)+d.l("M70 50 Q64 40 70 30 M90 46 Q84 36 90 26",C.grey,3),
"dream":()=>d.r(8,8,184,184,14,"#2c3566",null)+d.c(150,50,32,"#fff",O,3)+d.c(116,98,10,"#fff",O,3)+d.c(100,118,6,"#fff",O,3)+d.star(150,50,16,C.gold,O,2)+d.r(16,140,168,40,10,"#8fb5ff")+headFace(50,138,22,{mood:"smile"})+d.l("M40 136 L48 138 M52 138 L60 136",O,3)+d.p("M60 156 Q120 136 184 146 L184 162 L60 162Z","#cfe0ff"),
"glue stick":()=>d.shadow(100,186,40)+d.r(70,60,60,120,10,C.yellow)+d.r(70,96,60,50,0,"#fff",O,3)+d.t(100,128,"GLUE",16,O,800)+d.r(76,30,48,34,8,"#fff6e0")+d.r(70,52,60,12,4,C.purple),
"scissors":()=>d.g(d.p("M0 0 L-12 -110 L4 -100 L8 0Z",C.grey)+d.p("M0 0 L12 -110 L-4 -100 L-8 0Z",C.grey)+d.e(-22,34,18,26,"none",C.red,-20,10)+d.e(22,34,18,26,"none",C.red,20,10)+d.c(0,0,5,O,null),"translate(100 116)"),
"pen":()=>d.g(d.r(-12,-80,24,140,8,C.blue)+d.r(-12,-30,24,50,0,"#e6f1fb",O,3)+d.p("M-12 60 L0 90 L12 60Z","#fff")+d.p("M-4 80 L0 90 L4 80Z",O,null)+d.r(10,-74,8,50,3,C.grey)+d.r(-12,-90,24,16,6,C.blue2),"translate(100 100) rotate(35)"),
"stapler":()=>d.shadow(100,170,80)+d.r(20,140,160,22,8,"#3a3f50")+d.p("M24 136 L168 108 Q184 106 184 120 L184 132 L24 140Z",C.red)+d.c(40,138,10,C.grey)+d.r(140,150,30,6,2,C.grey,null),
"magnet":()=>d.p("M40 40 L40 110 A60 60 0 0 0 160 110 L160 40 L120 40 L120 110 A20 20 0 0 1 80 110 L80 40Z",C.red)+d.r(40,40,40,30,0,C.grey)+d.r(120,40,40,30,0,C.grey)+d.l("M40 20 L30 4 M60 18 L60 0 M140 18 L140 0 M160 20 L170 4",C.blue,4),
"marker":()=>d.g(d.r(-16,-70,32,120,8,"#fff")+d.r(-16,-70,32,30,8,C.green)+d.r(-16,-46,32,6,0,C.green,null)+d.r(-10,-6,20,40,4,C.green,O,0)+d.p("M-10 50 L-6 76 L6 76 L10 50Z",C.green)+d.t(0,10,"",0),"translate(100 100) rotate(30)")+d.l("M40 170 Q80 150 120 172 Q150 186 180 160",C.green,8),
"pencil sharpener":()=>d.shadow(100,184,60)+d.r(50,80,100,90,10,C.blue)+d.c(100,116,18,"#3a3f50")+d.c(100,116,8,O,null)+d.g(d.r(-8,-70,16,70,2,C.yellow)+d.p("M-8 0 L0 16 L8 0Z",C.cream),"translate(100 100)")+d.l("M60 160 L140 160",C.blue2,4)+d.p("M150 110 L176 100 L178 140 L150 130Z",C.grey),
"pencil case":()=>d.shadow(100,180,80)+d.r(20,70,160,90,30,C.pink)+d.l("M30 92 L170 92",O,3)+[...Array(14)].map((_,i)=>d.l(`M${36+i*10} 88 L${36+i*10} 96`,O,2)).join("")+d.r(162,84,12,20,4,C.grey)+d.c(70,126,10,C.yellow,O,2)+d.c(100,130,10,C.blue,O,2)+d.c(130,126,10,C.green,O,2),
"desk":()=>d.shadow(100,186,84)+d.r(20,70,160,20,4,"#c98d4e")+d.r(30,90,140,30,2,"#e0b07a")+d.r(30,118,10,66,2,C.grey)+d.r(160,118,10,66,2,C.grey)+d.l("M30 104 L170 104",O,0)+d.r(70,52,50,18,3,C.blue),
"chair":()=>d.shadow(100,186,60)+d.r(56,30,88,70,10,"#c98d4e")+d.r(50,100,100,18,4,"#e0b07a")+d.r(58,118,10,66,2,C.grey)+d.r(132,118,10,66,2,C.grey)+d.r(66,44,68,10,4,"#e0b07a",null),
"clock":()=>clock(100,100,80,10,10),
"calendar":()=>{let g=d.shadow(100,190,74)+d.r(20,30,160,154,10,"#fff")+d.r(20,30,160,34,10,C.red)+d.r(20,54,160,10,0,C.red,null)+d.l("M54 20 L54 40 M146 20 L146 40",O,6);
  for(let r=0;r<4;r++)for(let c=0;c<6;c++)g+=d.r(30+c*24,72+r*26,18,18,3,r===1&&c===3?C.yellow:"#f4eee2",null);return g+d.c(111,107,14,"none",C.red,3);},
"letter":()=>d.shadow(100,180,80)+d.r(20,50,160,110,6,"#fff")+d.p("M20 50 L100 116 L180 50",null,O,4)+d.r(140,60,28,32,2,C.red)+d.heart(154,76,8,"#fff",null)+d.l("M36 130 L80 130 M36 144 L70 144","#bfb6a4",3),
"bookstore":()=>{let g=d.r(16,50,168,140,4,"#fff6e0")+d.r(10,30,180,26,4,C.blue)+d.t(100,49,"BOOKS",16,"#fff",800);
  for(let s=0;s<3;s++){g+=d.l(`M26 ${96+s*34} L174 ${96+s*34}`,C.brown,5);for(let i=0;i<9;i++)g+=d.r(30+i*16,70+s*34,12,24,2,[C.red,C.blue,C.green,C.yellow,C.purple][(i+s)%5],O,2);}return g;},
"juice":()=>d.shadow(100,186,50)+d.r(56,50,88,134,6,"#fff")+d.r(60,80,80,100,4,C.purple,null)+d.r(56,50,88,134,6,"none")+d.l("M112 56 L136 10",C.red,7)+d.c(78,120,8,"#d9c4ff",null)+d.c(96,140,8,"#d9c4ff",null)+d.c(116,118,8,"#d9c4ff",null),
"news":()=>d.shadow(100,186,80)+d.g(d.r(-74,-60,148,120,4,"#fff")+d.r(-64,-50,128,22,2,O,null)+d.t(0,-34,"NEWS",16,"#fff",800)+d.r(-64,-20,56,46,2,"#cfe8ff")+d.l("M4 -16 L64 -16 M4 -4 L64 -4 M4 8 L64 8 M4 20 L50 20 M-64 38 L64 38 M-64 48 L40 48","#9a948a",3),"translate(100 104) rotate(-6)"),
"school":()=>d.r(0,160,200,40,0,"#9fd68a",null)+d.r(14,70,172,96,4,"#fff6e0")+d.r(80,30,40,44,4,"#fff6e0")+d.c(100,50,12,"#fff")+d.l("M100 50 L100 42 M100 50 L106 52",O,2.5)+d.l("M100 30 L100 10",O,3)+d.p("M100 10 L118 16 L100 22Z",C.red)+[34,64,124,154].map(x=>d.r(x,86,20,20,2,"#cfe8ff")+d.r(x,120,20,20,2,"#cfe8ff")).join("")+d.r(88,124,24,42,2,C.brown),
"station":()=>d.r(0,150,200,50,0,"#c9bfae",null)+d.l("M0 172 L200 172 M0 188 L200 188",O,4)+d.p("M10 70 L100 30 L190 70Z",C.blue)+d.r(20,70,160,80,2,"#fff6e0")+d.r(60,46,80,20,4,"#fff")+d.t(100,61,"STATION",12,O,800)+d.r(30,90,30,30,2,"#cfe8ff")+d.r(140,90,30,30,2,"#cfe8ff")+d.r(80,100,40,50,2,C.brown),
"telephone":()=>d.shadow(100,186,80)+d.r(30,100,140,80,16,C.red)+d.p("M20 96 Q20 60 60 60 L140 60 Q180 60 180 96 L150 96 Q150 80 130 80 L70 80 Q50 80 50 96Z",C.red2)+d.c(100,140,24,"#fff")+[...Array(8)].map((_,i)=>{const a=i*Math.PI/4;return d.c(100+Math.cos(a)*14,140+Math.sin(a)*14,3,O,null);}).join(""),
"potato":()=>d.shadow(100,184,70)+d.p("M40 90 Q50 50 100 56 Q160 50 168 100 Q172 150 120 158 Q60 166 42 130 Q34 110 40 90Z","#d6a35a")+d.c(80,90,3,"#9a6a2a",null)+d.c(124,84,3,"#9a6a2a",null)+d.c(138,124,3,"#9a6a2a",null)+d.c(90,130,3,"#9a6a2a",null)+d.shine(70,80,10,6,-20),
"cabbage":()=>d.shadow(100,186,70)+d.c(100,110,70,"#9bd36a")+d.p("M100 44 Q60 80 74 176 M100 44 Q140 80 126 176 M40 90 Q80 110 70 170 M160 90 Q120 110 130 170",null,"#5aa03a",3)+d.p("M30 100 Q60 40 100 44 Q140 40 170 100",null,"#5aa03a",4)+d.shine(76,72,12,8,-30),
"corn":()=>{let g=d.p("M100 190 Q50 150 60 70 Q80 120 100 150Z",C.leaf)+d.p("M100 190 Q150 150 140 70 Q120 120 100 150Z",C.leaf)+d.e(100,100,30,76,C.yellow);for(let r=0;r<9;r++)for(let c=-1;c<=1;c++)g+=d.c(100+c*14,40+r*14,5,"#ffe58a",O,1.5);return g;},
"cherry":()=>d.shadow(100,186,64)+d.l("M70 140 Q80 60 110 30 M130 140 Q120 80 110 30",C.green2,5)+d.e(124,36,16,7,C.leaf,O,-20)+d.c(66,148,28,C.red)+d.c(134,148,28,C.red)+d.shine(58,138,6,9,20)+d.shine(126,138,6,9,20),
"sausage":()=>d.shadow(100,180,80)+d.g(d.r(-80,-24,160,48,24,"#c9583a")+d.l("M-50 -10 L-40 -18 M-10 -10 L0 -18 M30 -10 L40 -18",d.C.white,3),"translate(100 110) rotate(-14)")+d.l("M16 140 Q6 150 10 160 M184 80 Q194 70 190 60",O,4),
"go straight":()=>d.r(60,0,80,200,0,"#9aa0aa",null)+d.l("M100 10 L100 40 M100 60 L100 90 M100 110 L100 140",C.white,6)+d.p("M100 20 L140 70 L116 70 L116 170 L84 170 L84 70 L60 70Z","#ffb000",O,5),
"turn right":()=>d.r(60,40,80,160,0,"#9aa0aa",null)+d.r(60,40,140,80,0,"#9aa0aa",null)+d.p("M84 180 L84 90 Q84 70 104 70 L150 70 L150 46 L192 80 L150 114 L150 92 L116 92 L116 180Z","#ffb000",O,5),
"turn left":()=>d.r(60,40,80,160,0,"#9aa0aa",null)+d.r(0,40,140,80,0,"#9aa0aa",null)+d.p("M116 180 L116 90 Q116 70 96 70 L50 70 L50 46 L8 80 L50 114 L50 92 L84 92 L84 180Z","#ffb000",O,5),
"favorite":()=>d.heart(100,104,64,C.red)+d.star(100,96,30,C.gold,O,4)+d.sparkle(30,40,12)+d.sparkle(170,40,12),
"place":()=>d.r(10,30,180,150,10,"#d7efff")+d.p("M10 120 Q60 100 100 130 Q140 160 190 120",null,"#5ab4f0",10)+d.r(30,50,30,24,3,"#9fd68a",O,2)+d.r(140,140,30,24,3,"#9fd68a",O,2)+d.p("M100 120 Q70 80 70 64 Q70 34 100 34 Q130 34 130 64 Q130 80 100 120Z",C.red)+d.c(100,64,12,"#fff"),
"classroom":()=>room("#fff3d6","#d9b27a",d.r(30,40,140,60,4,"#2f6b4a",O,4)+d.l("M50 60 L90 60 M50 76 L110 76","#fff",3)+[44,100,156].map(x=>d.r(x-20,130,40,10,2,"#c98d4e")+d.r(x-16,140,4,26,1,C.grey)+d.r(x+12,140,4,26,1,C.grey)).join("")),
"restroom":()=>room("#e6f1fb","#c9d3e3",d.r(30,46,64,80,6,C.blue)+d.c(62,64,9,"#fff",null)+d.p("M52 76 L72 76 L74 110 L50 110Z","#fff",null)+d.r(106,46,64,80,6,C.red)+d.c(138,64,9,"#fff",null)+d.p("M128 76 L148 76 L156 110 L120 110Z","#fff",null)+d.e(100,160,20,10,"#fff")+d.r(88,140,24,20,6,"#fff")),
"science room":()=>room("#e6f6ee","#c9d3c0",d.p("M64 50 L64 90 L40 140 Q36 150 48 150 L104 150 Q116 150 112 140 L88 90 L88 50Z","#fff")+d.p("M54 118 L98 118 L110 142 Q112 150 104 150 L48 150 Q40 150 42 142Z",C.green,null)+d.c(70,132,4,"#fff",null)+d.c(84,124,3,"#fff",null)+d.r(124,60,20,80,4,C.grey)+d.r(116,130,46,14,4,"#3a3f50")+d.r(126,50,16,16,4,"#3a3f50")),
"music room":()=>room("#f3ecff","#d9c9b0",d.r(24,60,110,80,6,O,null)+d.r(28,100,102,30,0,"#fff",null)+[...Array(6)].map((_,i)=>d.r(36+i*16,100,8,18,1,O,null)).join("")+d.p("M150 40 L150 80 M150 40 L176 34 L176 74",null,O,4)+d.e(144,82,8,6,O,null)+d.e(170,76,8,6,O,null)),
"arts and crafts room":()=>room("#fff0e6","#d9b27a",d.l("M60 150 L84 50 L108 150 M84 50 L84 150",C.brown,5)+d.r(52,60,64,52,3,"#fff")+d.c(84,86,14,C.yellow,O,2)+d.p("M120 120 Q140 96 170 104 Q186 120 168 134 Q150 130 152 144 Q130 150 120 120Z","#f0d6a8")+d.c(140,114,5,C.red,null)+d.c(156,112,5,C.blue,null)+d.c(164,124,5,C.green,null)),
"computer room":()=>room("#e6f1fb","#c9d3e3",[60,140].map(x=>d.r(x-34,56,68,48,4,"#3a3f50")+d.r(x-28,62,56,36,2,"#8fd0ff",null)+d.r(x-6,104,12,14,0,C.grey)+d.r(x-24,118,48,8,2,C.grey)+d.r(x-34,132,68,10,2,"#c98d4e")).join("")),
"cooking room":()=>room("#fff6e6","#d9c9b0",d.r(30,96,140,50,4,"#fff")+d.c(70,96,0,"")+d.r(46,64,50,34,6,C.red)+d.r(40,62,62,8,3,C.red2)+d.l("M96 70 L112 66",O,5)+d.l("M60 50 Q54 40 60 30 M78 50 Q72 40 78 30",C.grey,3)+d.c(130,98,0,"")+d.e(140,94,22,6,C.grey)+d.l("M160 94 L184 86",O,4)+d.r(46,110,20,20,3,"#3a3f50")+d.r(130,110,20,20,3,"#3a3f50")),
"school nurse's office":()=>room("#eef8f6","#c9d3c0",d.r(26,96,110,30,6,"#fff")+d.r(26,86,30,20,6,"#cfe8ff")+d.r(30,124,6,28,1,C.grey)+d.r(126,124,6,28,1,C.grey)+d.r(140,40,48,48,8,"#fff")+d.p("M156 50 L172 50 L172 58 L180 58 L180 70 L172 70 L172 78 L156 78 L156 70 L148 70 L148 58 L156 58Z",C.red,null)+d.r(144,104,38,44,4,"#fff")+d.l("M150 116 L176 116 M150 126 L176 126",C.grey,3)),
"school principal's office":()=>room("#f6efe6","#b98a5a",d.r(28,40,46,56,3,"#fff6e0",O,4)+headFace(51,64,14,{mood:"smile",hair:C.grey})+d.r(110,40,70,50,4,"#fff")+d.star(145,60,12,C.gold,O,2)+d.r(130,74,30,10,2,C.gold)+d.r(40,108,120,30,4,"#9a6338")+d.r(46,138,8,24,1,"#6e4325")+d.r(146,138,8,24,1,"#6e4325")),
"teachers' office":()=>room("#f0f4f8","#c9d3c0",[60,140].map(x=>d.r(x-38,110,76,14,2,"#c98d4e")+d.r(x-36,124,6,30,1,C.grey)+d.r(x+30,124,6,30,1,C.grey)+headFace(x,82,18,{mood:"smile"})+d.r(x-16,96,32,16,6,C.blue)).join("")+d.r(84,40,34,24,2,"#fff")+d.l("M90 48 L112 48 M90 56 L106 56",C.grey,2)),
"entrance":()=>room("#f6efe6","#c9bfae",d.r(24,40,152,110,4,"#c98d4e")+[...Array(3)].map((_,r)=>[...Array(5)].map((_,c)=>d.r(32+c*29,48+r*34,24,28,2,"#fff6e0",O,2)+d.e(44+c*29,70+r*34,8,4,[C.red,C.blue,"#fff",C.yellow,C.green][(r+c)%5],O,1.5)).join("")).join("")),
"library":()=>{let g="";for(let s=0;s<4;s++){g+=d.l(`M24 ${76+s*30} L176 ${76+s*30}`,C.brown,5);for(let i=0;i<10;i++)g+=d.r(28+i*15,52+s*30,11,24,2,[C.red,C.blue,C.green,C.yellow,C.purple,C.orange][(i+s*2)%6],O,1.5);}return room("#f6efe6","#d9b27a",d.r(20,44,160,126,4,"#9a6338")+d.r(24,48,152,118,0,"#f3e0c4",null)+g);},
"gym":()=>room("#eef1f6","#e0b07a",d.r(70,34,60,44,3,"#fff")+d.r(88,48,24,18,2,"none",C.red,3)+d.r(84,76,32,4,2,C.red)+d.l("M86 80 L92 100 L108 100 L114 80",O,2.5)+d.c(150,150,18,C.orange)+d.l("M132 150 L168 150 M150 132 L150 168",O,2.5)+d.l("M14 160 L186 160",C.white,3)+d.e(70,164,28,8,"none","#fff",0,3)),
"playground":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.r(8,120,184,72,0,"#e9d6b0",null)+d.l("M8 120 L192 120",O,3)+d.l("M30 150 L30 60 L70 60 L70 150",C.red,6)+d.p("M70 70 L120 150",null,C.yellow,10)+d.l("M130 150 L130 70 L180 70 L180 150",C.blue,6)+d.l("M146 70 L146 120 M164 70 L164 120",O,2)+d.r(140,118,30,6,2,C.brown)+sunIcon(160,32,12),
"wake up":()=>d.r(8,8,184,184,14,"#ffe9c9",null)+d.r(10,120,180,50,10,"#8fb5ff")+d.g(kid(0,0,{s:0.7,shirt:C.yellow,arm:"both",mood:"open"}),"translate(70 150)")+d.p("M110 120 Q150 110 186 124 L186 150 L110 150Z","#cfe0ff")+clock(156,56,26,6,30)+d.l("M136 30 L128 22 M176 30 L184 22",O,4),
"wash my face":()=>d.r(30,120,140,50,10,"#fff")+d.e(100,124,58,12,"#9fd0ff")+headFace(100,72,36,{mood:"o"})+d.l("M40 40 L52 52 M160 40 L148 52",C.blue,4)+[[80,108],[120,108],[100,116]].map(([x,y])=>d.p(`M${x} ${y-8} Q${x-5} ${y} ${x} ${y+3} Q${x+5} ${y} ${x} ${y-8}Z`,"#5ab4f0",O,2)).join("")+d.r(84,160,32,20,4,C.grey),
"have breakfast":()=>d.r(10,124,180,60,6,"#c98d4e")+d.e(60,130,30,8,"#fff")+d.p("M36 118 Q40 140 60 140 Q80 140 84 118Z","#fff")+d.e(60,118,24,6,"#fff6e0")+d.e(130,126,34,10,"#fff")+d.c(130,120,12,"#fff")+d.c(130,120,7,C.yellow,null)+d.r(150,96,22,30,3,"#fff")+d.r(152,104,18,20,0,C.orange,null)+d.r(70,62,64,40,6,"#e8b066")+d.l("M70 82 L134 82",C.brown,2),
"brush my teeth":()=>headFace(90,100,58,{mood:"grin"})+d.g(d.r(-6,-6,90,12,6,C.blue)+d.r(-24,-12,24,10,3,"#fff",O,2),"translate(110 140) rotate(-10)")+d.c(60,150,6,"#fff",O,2)+d.c(70,160,4,"#fff",O,2)+d.sparkle(150,60,12,"#fff"),
"put away my futon":()=>d.r(8,8,184,184,14,"#f6efe6",null)+d.r(110,30,76,140,4,"#c98d4e")+d.r(116,36,64,128,2,"#e9d6b0",null)+d.r(120,120,56,20,6,"#8fb5ff")+d.r(120,100,56,20,6,"#ffb3c8")+d.g(kid(0,0,{s:0.75,shirt:C.green,arm:"both",mood:"open"}),"translate(60 186)")+d.r(30,70,64,22,8,"#8fb5ff"),
"check my school bag":()=>d.shadow(100,186,70)+d.r(40,70,120,110,16,C.red)+d.p("M40 70 Q40 40 100 40 Q160 40 160 70 L160 120 L40 120Z",C.red2)+d.r(90,110,20,14,3,C.gold)+d.r(56,30,16,40,4,C.yellow)+d.r(80,24,24,40,2,C.blue)+d.c(160,50,24,"#fff",O,3)+d.l("M148 50 L157 60 L172 40",C.green,6),
"leave my house":()=>d.r(0,150,200,50,0,"#9fd68a",null)+d.r(14,50,96,100,4,"#fff3d6")+d.p("M6 56 L62 16 L118 56Z",C.red)+d.r(46,96,30,54,3,C.brown)+kid(150,184,{s:0.8,shirt:C.blue,arm:"wave-left",mood:"open"})+d.p("M96 128 L124 128 L124 118 L140 134 L124 150 L124 140 L96 140Z","#ffb000",O,3),
"take out the garbage":()=>d.r(0,160,200,40,0,"#c9bfae",null)+d.p("M110 60 Q150 40 180 70 Q196 110 180 150 Q150 170 120 158 Q100 110 110 60Z","#9fd0ff")+d.p("M140 50 L150 30 L160 52",null,O,4)+kid(64,186,{s:0.85,shirt:C.orange,arm:"wave",mood:"smile"})+d.l("M100 74 L118 70",O,0),
"go to school":()=>d.r(0,150,200,50,0,"#9fd68a",null)+d.g(PIC.school(),"translate(100 20) scale(.5)")+kid(60,184,{s:0.8,shirt:C.blue,arm:"down",mood:"open"})+d.p("M90 160 L120 140 L114 136 L134 132 L130 152 L126 146 L96 166Z","#ffb000",O,2),
"go home":()=>d.r(8,8,184,184,14,"#ffd9b0",null)+d.r(8,150,184,42,0,"#9fd68a",null)+d.c(170,140,20,C.orange,null)+d.g(PIC.house(),"translate(100 30) scale(.5)")+kid(56,184,{s:0.8,shirt:C.blue,arm:"wave",mood:"open"}),
"homework":()=>d.r(10,120,180,70,6,"#c98d4e")+d.r(40,108,120,44,4,"#fff")+d.l("M100 108 L100 152",O,2)+d.l("M52 120 L90 120 M52 132 L84 132 M110 120 L150 120 M110 132 L140 132","#9a948a",3)+headFace(100,62,34,{mood:"flat"})+d.g(d.r(-4,-36,8,44,2,C.yellow)+d.p("M-4 8 L0 18 L4 8Z",C.cream),"translate(140 112) rotate(30)"),
"dinner":()=>d.r(8,8,184,184,14,"#2c3566",null)+moon(40,40,14)+d.r(10,120,180,70,6,"#c98d4e")+d.e(60,132,34,10,"#fff")+d.p("M30 120 Q34 142 60 142 Q86 142 90 120Z","#fff")+d.e(60,120,28,7,"#fff6e0")+d.e(136,132,40,12,"#fff")+d.p("M106 128 Q110 100 136 100 Q162 100 166 128Z","#9a4a1c")+d.l("M60 80 Q56 70 60 60 M136 84 Q132 74 136 64",C.grey,3),
"yummy":()=>face("happy")+d.e(116,152,10,8,C.pink2,O,20,2.5)+inset("cake",168,160,28),
"wonderful":()=>d.star(100,104,80,C.gold,O,5)+d.c(84,96,6,O,null)+d.c(116,96,6,O,null)+d.p("M82 112 Q100 134 118 112Z","#c4473f",O,3)+d.sparkle(26,36,14)+d.sparkle(176,40,14)+d.sparkle(170,170,10)+d.sparkle(30,170,10)
});

/* ---------- Junior Sunshine 5 ---------- */
/* month page: abbreviation, "1月" style number and a picture for that time of year in Japan */
function monthPage(n,ab,col,icon){return d.shadow(100,190,74)+d.r(20,26,160,160,12,"#fff")+d.r(20,26,160,40,12,col)+d.r(20,54,160,12,0,col,null)+d.l("M54 18 L54 36 M146 18 L146 36",O,6)+
  d.t(100,58,ab,26,"#fff",800)+d.t(62,140,n+"月",n>9?34:42,col,800)+icon;}
const sakura=(x,y,r)=>{let g="";for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;g+=d.e(x+Math.cos(a)*r*0.55,y+Math.sin(a)*r*0.55,r*0.42,r*0.3,"#ffc4d6",O,a*180/Math.PI,2);}return g+d.c(x,y,r*0.18,C.yellow,null);};
const leafMaple=(x,y,r,f)=>d.p(`M${x} ${y-r} L${x+r*0.25} ${y-r*0.3} L${x+r} ${y-r*0.5} L${x+r*0.5} ${y} L${x+r*0.8} ${y+r*0.5} L${x+r*0.1} ${y+r*0.3} L${x} ${y+r} L${x-r*0.1} ${y+r*0.3} L${x-r*0.8} ${y+r*0.5} L${x-r*0.5} ${y} L${x-r} ${y-r*0.5} L${x-r*0.25} ${y-r*0.3}Z`,f||C.red,O,2.5);
const carp=(x,y,s,f)=>d.g(d.p("M-40 -14 L30 -14 Q46 0 30 14 L-40 14 L-30 0Z",f)+d.c(22,-2,6,"#fff",O,2)+d.c(23,-2,3,O,null)+d.l("M-10 -14 Q-4 0 -10 14 M4 -14 Q10 0 4 14",O,2),`translate(${x} ${y}) scale(${s})`);
const firework=(x,y,r,f)=>{let g="";for(let i=0;i<12;i++){const a=i*Math.PI/6;g+=d.l(`M${(x+Math.cos(a)*r*0.3).toFixed(1)} ${(y+Math.sin(a)*r*0.3).toFixed(1)} L${(x+Math.cos(a)*r).toFixed(1)} ${(y+Math.sin(a)*r).toFixed(1)}`,f,5)+d.c(x+Math.cos(a)*r,y+Math.sin(a)*r,4,f,null);}return g;};
const hinaDoll=(x,y,s,f,girl)=>d.g(d.p("M-30 40 Q-30 -6 0 -10 Q30 -6 30 40Z",f)+d.p("M-14 -10 L0 30 L14 -10",null,"#fff",4)+headFace(0,-26,18,{mood:"smile",girl,hair:"#2a2630"})+(girl?d.p("M-10 -48 L0 -56 L10 -48Z",C.gold,O,2):d.r(-4,-56,8,14,2,O,null)),`translate(${x} ${y}) scale(${s})`);
Object.assign(PIC,{
"january":()=>monthPage(1,"JAN","#3a6fc8",sunIcon(146,140,14)+d.p("M118 168 Q146 150 174 168",null,O,3)),
"february":()=>monthPage(2,"FEB","#7a5ac8",d.heart(146,140,20,"#8a4a2a")),
"march":()=>monthPage(3,"MAR","#e86a98",hinaDoll(136,146,0.6,C.blue,false)+hinaDoll(160,146,0.6,C.red,true)),
"april":()=>monthPage(4,"APR","#e86a98",sakura(146,136,30)),
"may":()=>monthPage(5,"MAY","#2f8ac8",d.l("M118 110 L118 176",O,3)+carp(146,124,0.45,C.blue)+carp(146,152,0.45,C.red)),
"june":()=>monthPage(6,"JUN","#4a8fe8",d.g(PIC.umbrella(),"translate(114 104) scale(.32)")+d.c(166,166,8,"#9b6be0",O,2)+d.c(158,170,7,"#4a8fe8",O,2)),
"july":()=>monthPage(7,"JUL","#2e8a3c",d.l("M146 104 L146 180",C.green2,5)+d.r(124,114,12,26,2,C.yellow)+d.r(156,122,12,26,2,C.pink)+d.r(132,146,12,24,2,C.blue)+d.star(170,108,8,C.gold,O,2)),
"august":()=>monthPage(8,"AUG","#d9711c",firework(146,140,30,C.red)),
"september":()=>monthPage(9,"SEP","#6b5ac8",d.c(146,124,18,C.gold)+d.c(132,160,8,"#fff",O,2)+d.c(146,160,8,"#fff",O,2)+d.c(160,160,8,"#fff",O,2)+d.c(139,148,8,"#fff",O,2)+d.c(153,148,8,"#fff",O,2)),
"october":()=>monthPage(10,"OCT","#d9711c",d.e(146,146,28,22,C.orange)+d.l("M146 124 L150 112",C.green2,5)+d.p("M134 140 L140 134 L146 140Z M146 140 L152 134 L158 140Z",O,null)+d.p("M132 154 Q146 164 160 154",null,O,3)),
"november":()=>monthPage(11,"NOV","#b8302a",leafMaple(140,140,22,C.red)+leafMaple(166,160,12,C.orange)),
"december":()=>monthPage(12,"DEC","#2e8a3c",d.p("M146 104 L170 140 L158 140 L176 168 L116 168 L134 140 L122 140Z",C.green)+d.r(140,168,12,12,2,C.brown)+d.star(146,104,8,C.gold,O,2)),
"birthday":()=>PIC.cake()+d.g(d.r(-22,-22,44,44,4,C.blue)+d.r(-4,-22,8,44,0,C.yellow,null)+d.r(-22,-4,44,8,0,C.yellow,null),"translate(168 164)"),
"special day":()=>d.g(PIC.calendar(),"")+d.star(111,107,20,C.gold,O,3)+d.sparkle(170,40,12)+d.sparkle(28,60,10),
"doll's day":()=>d.r(20,150,160,36,4,C.red)+d.r(20,150,160,8,0,"#fff",null)+hinaDoll(70,130,1.1,"#2c3566",false)+hinaDoll(130,130,1.1,C.red,true)+d.c(30,60,10,"#ffc4d6",O,2)+d.c(170,60,10,"#ffc4d6",O,2),
"dolls' day":()=>PIC["doll's day"](),
"children's day":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.l("M40 20 L40 190",O,5)+d.c(40,18,7,C.gold)+carp(110,50,1,C.blue)+carp(110,96,0.95,C.red)+carp(110,140,0.8,C.orange)+d.l("M70 50 L40 50 M70 96 L40 96 M78 140 L40 140",O,2),
"star festival":()=>d.r(8,8,184,184,14,"#2c3566",null)+d.p("M60 20 Q80 120 70 192",null,C.green2,6)+d.e(90,70,20,6,C.leaf,O,20)+d.e(50,110,20,6,C.leaf,O,-20)+d.r(96,80,14,32,2,C.yellow)+d.r(30,120,14,32,2,C.pink)+d.r(88,130,14,32,2,C.blue)+stars([[150,40,10],[170,80,7],[140,120,8],[166,160,6]])+d.p("M120 20 Q150 100 196 120",null,"#bfd6ff",8),
"new year's eve":()=>d.r(8,8,184,184,14,"#2c3566",null)+clock(140,60,36,12,0)+d.p("M20 120 Q30 186 80 186 Q130 186 140 120Z","#fff")+d.e(80,120,60,14,"#c9a070")+d.l("M50 120 Q60 106 70 120 Q80 106 90 120 Q100 106 110 120",C.brown,3)+d.l("M110 100 L150 160 M120 96 L160 156",C.brown,4),
"new year's day":()=>d.r(8,8,184,184,14,"#fff1d6",null)+d.c(100,110,46,C.red,null)+d.p("M8 150 Q50 120 100 140 Q150 120 192 150 L192 192 L8 192Z","#3a6fc8",null)+d.p("M8 150 Q50 120 100 140 Q150 120 192 150",null,O,3)+[[40,60],[160,60]].map(([x,y])=>d.c(x,y,6,"#fff",O,2)).join("")+d.t(100,124,"",0),
"japanese":()=>d.shadow(100,186,64)+d.r(40,24,120,156,8,"#fff")+d.r(40,24,24,156,6,C.red)+d.t(112,100,"あ",60,O,800)+d.t(112,150,"国語",22,C.red,800),
"english":()=>d.shadow(100,186,64)+d.r(40,24,120,156,8,"#fff")+d.r(40,24,24,156,6,C.blue)+d.t(112,96,"ABC",34,O,800)+d.t(112,140,"abc",30,C.blue,800),
"math":()=>d.r(20,30,160,140,10,"#2f6b4a",O,5)+d.t(60,92,"+",50,"#fff",800)+d.t(140,92,"−",50,"#fff",800)+d.t(60,152,"×",50,"#fff",800)+d.t(140,152,"÷",50,"#fff",800)+d.r(60,170,80,10,2,"#c98d4e"),
"science":()=>d.shadow(100,190,60)+d.p("M82 30 L82 80 L40 160 Q34 176 52 176 L148 176 Q166 176 160 160 L118 80 L118 30Z","#fff")+d.p("M62 128 L138 128 L156 162 Q160 172 148 172 L52 172 Q40 172 44 162Z",C.green,null)+d.r(76,22,48,12,4,"#fff")+d.c(84,150,6,"#fff",null)+d.c(110,140,4,"#fff",null)+d.c(120,96,6,"#fff",O,2)+d.c(130,70,8,"#fff",O,2),
"social studies":()=>d.shadow(100,190,70)+d.r(20,40,160,120,6,"#e6f1fb")+d.p("M40 60 L80 52 L92 80 L70 110 L46 104Z",C.leaf,O,3)+d.p("M110 70 L160 60 L166 120 L130 140 L104 110Z",C.leaf,O,3)+d.l("M84 120 L110 96",C.red,4)+d.c(84,120,5,C.red,null)+d.p("M150 30 L156 40 L150 54 L144 40Z",C.red,O,2)+d.t(150,186,"",0),
"p.e.":()=>d.r(0,150,200,50,0,"#e9d6b0",null)+d.p("M60 40 L36 52 L24 90 L44 98 L52 76 L52 150 L148 150 L148 76 L156 98 L176 90 L164 52 L140 40 Q100 60 60 40Z","#fff")+d.r(70,70,60,30,4,"#fff",O,2)+d.t(100,92,"5-1",18,C.blue,800)+d.p("M52 140 L148 140 L148 186 L104 186 L100 166 L96 186 L52 186Z",C.blue)+d.c(170,170,14,C.red),
"music":()=>d.p("M60 150 L60 50 L150 30 L150 130",null,O,6)+d.e(46,152,18,13,O,null,-20)+d.e(136,132,18,13,O,null,-20)+d.l("M60 70 L150 50",O,10)+d.p("M30 60 L30 100 M30 60 L44 70",null,C.purple,4)+d.e(24,102,8,6,C.purple,null,-20),
"arts and crafts":()=>PIC.color()+d.g(d.r(-4,-50,8,70,3,C.brown)+d.p("M-6 20 L0 44 L6 20Z",C.red),"translate(160 120) rotate(30)"),
"home economics":()=>d.shadow(100,186,80)+d.r(30,100,90,60,10,C.red)+d.r(24,96,102,12,4,C.red2)+d.l("M120 110 L150 104",O,6)+d.l("M50 80 Q44 70 50 60 M74 80 Q68 70 74 60",C.grey,3)+d.c(150,150,22,"#ffc4d6")+d.l("M130 40 L170 130",C.grey,4)+d.e(128,36,4,7,"none",O,-25,2)+d.p("M170 130 Q180 160 150 160",null,C.red,2),
"calligraphy":()=>d.r(50,20,100,166,4,"#fff")+d.t(100,124,"書",80,O,800)+d.g(d.r(-6,-80,12,70,3,"#c98d4e")+d.p("M-8 -10 Q0 30 8 -10Z",O,null),"translate(170 110) rotate(20)")+d.r(20,170,160,18,3,"#2a2630"),
"moral education":()=>d.heart(100,90,60,C.pink)+d.g(d.p("M-60 0 Q-40 -20 -10 -8 L10 -8 Q30 -4 20 8 L-20 8",C.skin),"translate(80 160)")+d.g(d.p("M60 0 Q40 -20 10 -8 L-10 -8 Q-30 -4 -20 8 L20 8",C.skin),"translate(120 160)"),
"the period for integrated studies":()=>d.g(PIC.world(),"translate(10 10) scale(.6)")+d.c(140,120,34,"#cfe8ff",O,6)+d.l("M164 146 L190 176",O,12)+d.g(PIC.book(),"translate(4 116) scale(.4)"),
"class activities":()=>room("#fff3d6","#d9b27a",d.r(30,30,140,56,4,"#2f6b4a",O,4)+d.t(100,66,"クラス会",20,"#fff",800)+kid(60,184,{s:0.55,shirt:C.blue,arm:"up",mood:"open"})+kid(100,184,{s:0.55,shirt:C.pink,arm:"down",mood:"smile",girl:true})+kid(140,184,{s:0.55,shirt:C.green,arm:"up",mood:"open"})),
"recess":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.r(8,130,184,62,0,"#e9d6b0",null)+kid(60,184,{s:0.7,shirt:C.red,arm:"up",mood:"open"})+kid(140,184,{s:0.7,shirt:C.blue,arm:"both",mood:"open"})+d.c(100,50,12,C.red)+clock(160,40,20,10,30),
"cleaning time":()=>d.r(0,160,200,40,0,"#d9b27a",null)+kid(80,184,{s:0.85,shirt:"#fff",arm:"down",mood:"smile"})+d.l("M118 70 L104 186",C.brown,6)+d.p("M90 180 L120 180 L126 196 L84 196Z",C.yellow)+d.p("M140 150 L176 150 L172 190 L144 190Z",C.blue)+d.e(158,150,18,5,"#9fd0ff")+d.r(60,62,40,10,3,C.blue),
"spell":()=>[["C",C.red],["A",C.blue],["T",C.green]].map(([l,c],i)=>d.r(14+i*62,60,52,52,8,c)+d.t(40+i*62,100,l,36,"#fff",800)).join("")+d.l("M66 86 L76 86 M128 86 L138 86",O,4)+d.g(PIC.cat(),"translate(70 120) scale(.3)"),
"video games":()=>d.shadow(100,170,80)+d.p("M40 80 Q10 80 14 120 Q18 160 44 156 Q60 154 70 136 L130 136 Q140 154 156 156 Q182 160 186 120 Q190 80 160 80Z","#3a3f50")+d.r(46,96,10,30,2,"#fff",null)+d.r(36,106,30,10,2,"#fff",null)+d.c(146,100,7,C.red,null)+d.c(160,114,7,C.blue,null)+d.c(132,114,7,C.green,null)+d.c(146,128,7,C.yellow,null),
"racket":()=>d.g(d.e(0,-30,34,46,"#fff",O,0,6)+d.e(0,-30,34,46,"none",C.blue,0,5)+d.r(-6,16,12,24,2,C.blue)+d.r(-8,38,16,50,6,"#3a3f50"),"translate(90 96) rotate(-20)")+d.c(160,150,14,"#d8f04a"),
"t-shirt":()=>d.shadow(100,186,70)+d.p("M70 34 L36 46 L16 86 L44 98 L54 82 L54 180 L146 180 L146 82 L156 98 L184 86 L164 46 L130 34 Q100 54 70 34Z",C.yellow)+d.star(100,120,22,C.red,O,3),
"school bag":()=>d.shadow(100,188,70)+d.r(36,60,128,124,14,C.red)+d.p("M36 60 Q36 26 100 26 Q164 26 164 60 L164 128 L36 128Z",C.red2)+d.r(88,118,24,16,3,C.gold)+d.l("M50 36 L50 130 M150 36 L150 130",O,0)+d.r(60,140,80,30,6,C.red2,O,2),
"on":()=>d.r(40,110,120,70,6,"#d9a066")+d.l("M40 130 L160 130",O,0)+d.c(100,82,28,C.red)+d.shine(90,72,8,5,-30)+d.l("M100 30 L100 44",O,0),
"under":()=>d.r(20,60,160,22,4,"#c98d4e")+d.r(30,82,12,96,2,"#9a6338")+d.r(158,82,12,96,2,"#9a6338")+d.c(100,152,28,C.red)+d.shine(90,142,8,5,-30),
"in":()=>d.p("M40 80 L160 80 L150 180 L50 180Z","#d9a066")+d.c(100,104,28,C.red)+d.shine(90,94,8,5,-30)+d.p("M44 112 L156 112 L150 180 L50 180Z","#d9a066"),
"by":()=>d.r(20,100,90,80,6,"#d9a066")+d.c(144,152,28,C.red)+d.shine(134,142,8,5,-30),
"wall":()=>{let g="";for(let r=0;r<6;r++)for(let c=-1;c<5;c++)g+=d.r(10+c*46+(r%2)*23,20+r*28,44,26,2,"#d97a4a",O,2.5);return `<clipPath id="wlc"><rect x="10" y="20" width="180" height="168" rx="6"/></clipPath><g clip-path="url(#wlc)">${g}</g>`+d.r(10,20,180,168,6,"none");},
"basket":()=>{let g=d.shadow(100,186,70)+d.p("M100 50 Q30 50 40 110","none",C.brown,6)+d.p("M100 50 Q170 50 160 110","none",C.brown,6)+d.p("M30 100 L170 100 L150 180 L50 180Z","#d9a066");for(let i=0;i<5;i++)g+=d.l(`M${40+i*30} 100 L${54+i*24} 180`,C.brown,3);return g+d.l("M36 126 L164 126 M42 152 L158 152",C.brown,3);},
"park":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.r(8,130,184,62,0,"#9fd68a",null)+d.g(PIC.tree(),"translate(10 50) scale(.6)")+d.r(110,130,70,8,3,C.brown)+d.r(114,138,6,20,1,C.brown)+d.r(170,138,6,20,1,C.brown)+d.r(110,112,70,8,3,C.brown)+sunIcon(160,40,14),
"lake":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.p("M8 100 L50 50 L80 90 L120 40 L170 100Z","#8aa0b8",null)+d.p("M100 40 L120 40 L112 52Z","#fff",null)+d.r(8,100,184,92,0,"#9fd68a",null)+d.e(100,150,80,32,"#5ab4f0")+d.l("M60 150 Q70 144 80 150 M110 160 Q120 154 130 160","#fff",3),
"zoo":()=>d.r(8,8,184,184,14,"#e6f6ee",null)+d.r(20,30,160,24,6,C.green)+d.t(100,49,"ZOO",18,"#fff",800)+d.g(PIC.elephant(),"translate(14 64) scale(.5)")+d.g(PIC.panda(),"translate(98 74) scale(.46)")+[...Array(9)].map((_,i)=>d.l(`M${20+i*20} 60 L${20+i*20} 186`,C.brown,3)).join(""),
"hospital":()=>d.r(0,170,200,30,0,"#9fd68a",null)+d.r(30,40,140,134,4,"#fff")+d.r(80,20,40,40,6,"#fff")+d.p("M94 26 L106 26 L106 34 L114 34 L114 46 L106 46 L106 54 L94 54 L94 46 L86 46 L86 34 L94 34Z",C.red,null)+[50,80,120,150].map(x=>d.r(x-10,74,20,20,2,"#cfe8ff")+d.r(x-10,106,20,20,2,"#cfe8ff")).join("")+d.r(84,136,32,38,2,"#cfe8ff"),
"museum":()=>d.r(0,170,200,30,0,"#c9bfae",null)+d.p("M20 64 L100 24 L180 64Z","#f3ead8")+d.r(20,64,160,12,0,"#e9dcc0")+[40,72,104,136,160].map(x=>d.r(x-6,76,14,84,2,"#fff")).join("")+d.r(14,160,172,14,2,"#e9dcc0"),
"police station":()=>d.r(0,170,200,30,0,"#c9bfae",null)+d.r(20,60,160,114,4,"#e6f1fb")+d.r(20,40,160,24,4,"#2c3566")+d.t(100,58,"POLICE",16,"#fff",800)+d.c(100,96,18,C.gold)+d.star(100,96,10,"#fff",O,2)+d.r(84,130,32,44,2,C.brown)+d.r(40,124,30,24,2,"#cfe8ff")+d.r(130,124,30,24,2,"#cfe8ff")+d.c(100,28,10,C.red),
"fire station":()=>d.r(0,170,200,30,0,"#c9bfae",null)+d.r(20,50,160,124,4,"#fff1e6")+d.r(20,34,160,20,4,C.red)+d.t(100,49,"FIRE",14,"#fff",800)+d.r(34,90,132,84,4,"#3a3f50")+d.r(44,110,112,54,6,C.red)+d.r(60,118,36,20,3,"#cfe8ff")+d.c(70,164,10,O,null)+d.c(140,164,10,O,null)+d.l("M100 112 L150 98",C.grey,4),
"post office":()=>d.r(0,170,200,30,0,"#c9bfae",null)+d.r(24,60,152,114,4,"#fff")+d.r(24,40,152,24,4,C.red)+d.t(100,58,"〒",20,"#fff",800)+d.r(84,124,32,50,2,C.brown)+d.g(d.r(-12,-30,24,44,6,C.red)+d.r(-6,-22,12,4,1,O,null)+d.r(-3,14,6,20,1,C.red),"translate(160 150)")+d.r(40,90,30,24,2,"#cfe8ff"),
"convenience store":()=>d.r(0,170,200,30,0,"#c9bfae",null)+d.r(14,60,172,114,4,"#fff")+d.r(14,40,172,14,0,C.green)+d.r(14,54,172,8,0,C.orange)+d.r(14,62,172,8,0,C.red)+d.r(26,84,100,70,2,"#cfe8ff")+d.r(136,84,40,90,2,"#cfe8ff")+d.l("M156 84 L156 174",O,2)+d.t(76,52,"24",14,"#fff",800),
"flower shop":()=>{let g=d.r(20,60,160,120,4,"#fff6e0")+d.r(14,40,172,24,4,C.pink)+d.t(100,58,"FLOWERS",14,"#fff",800);
  [[50,C.red],[90,C.yellow],[130,C.purple],[160,C.pink]].forEach(([x,c])=>g+=d.r(x-14,140,28,30,3,"#c98d4e")+d.l(`M${x} 140 L${x} 116`,C.green2,3)+d.c(x,110,10,c,O,2)+d.c(x-8,120,7,c,O,2)+d.c(x+8,120,7,c,O,2));return g;},
"hamburger shop":()=>d.r(20,70,160,110,4,"#fff6e0")+d.r(14,50,172,24,4,C.red)+d.r(60,10,80,54,6,C.yellow)+d.g(PIC.hamburger(),"translate(72 14) scale(.28)")+d.r(30,96,80,60,2,"#cfe8ff")+d.r(124,96,40,84,2,C.brown),
"pizza shop":()=>d.r(20,70,160,110,4,"#fff6e0")+d.r(14,50,172,24,4,C.green)+d.r(60,8,80,56,6,"#fff")+d.g(PIC.pizza(),"translate(76 10) scale(.26)")+d.r(30,96,80,60,2,"#cfe8ff")+d.r(124,96,40,84,2,C.brown),
"movie theater":()=>d.r(8,8,184,184,14,"#2a2630",null)+d.r(26,30,148,80,4,"#fff6e0",O,4)+d.p("M60 50 L60 90 L96 70Z",C.red)+[...Array(3)].map((_,r)=>[...Array(6)].map((_,c)=>d.r(26+c*25,124+r*22,20,16,6,C.red,O,2)).join("")).join(""),
"amusement park":()=>{let g=d.r(8,8,184,184,14,"#cfeeff",null)+d.r(8,160,184,32,0,"#9fd68a",null)+d.c(100,84,64,"none",O,5)+d.l("M100 84 L60 186 M100 84 L140 186",O,5);for(let i=0;i<8;i++){const a=i*Math.PI/4;g+=d.l(`M100 84 L${(100+Math.cos(a)*64).toFixed(1)} ${(84+Math.sin(a)*64).toFixed(1)}`,O,2)+d.r(100+Math.cos(a)*64-10,84+Math.sin(a)*64-6,20,18,4,[C.red,C.yellow,C.blue,C.green][i%4],O,2);}return g+d.c(100,84,8,O,null);},
"supermarket":()=>d.r(0,170,200,30,0,"#c9bfae",null)+d.r(14,50,172,124,4,"#fff")+d.r(14,34,172,22,4,C.blue)+d.t(100,51,"SUPERMARKET",13,"#fff",800)+d.r(26,70,148,60,2,"#cfe8ff")+d.g(d.p("M0 0 L8 0 L16 30 L50 30 L56 10 L12 10",null,O,4)+d.c(20,40,5,O,null)+d.c(46,40,5,O,null),"translate(70 128)")+d.c(110,90,8,C.red,O,2)+d.c(130,92,8,C.orange,O,2),
"restaurant":()=>d.r(20,70,160,110,4,"#fff6e0")+d.p("M14 74 L40 40 L160 40 L186 74Z",C.red)+d.l("M70 106 L70 150 M64 106 L64 122 M76 106 L76 122",C.grey2,4)+d.e(100,128,20,20,"#fff")+d.p("M130 106 Q140 116 130 130 L130 150",null,C.grey2,5)+d.r(84,150,32,30,2,C.brown),
"department store":()=>d.r(0,176,200,24,0,"#c9bfae",null)+d.r(30,20,140,158,4,"#fff6e0")+[...Array(5)].map((_,r)=>[...Array(4)].map((_,c)=>d.r(42+c*32,32+r*26,24,18,2,"#cfe8ff")).join("")).join("")+d.r(80,160,40,18,2,C.brown)+d.r(26,14,148,10,3,C.red),
"stadium":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.e(100,130,90,50,"#9a9aa6")+d.e(100,134,70,34,"#7fcc6e")+d.p("M100 118 L120 134 L100 150 L80 134Z","none","#fff",3)+[30,170].map(x=>d.l(`M${x} 100 L${x} 30`,O,4)+d.r(x-12,24,24,12,2,"#fff")).join(""),
"temple":()=>d.r(0,170,200,30,0,"#c9bfae",null)+d.p("M10 90 Q100 60 190 90 L170 70 Q100 46 30 70Z","#3a3f50")+d.r(40,90,120,80,0,"#c0502a")+d.r(30,86,140,8,2,"#3a3f50")+d.r(84,120,32,50,2,"#8a3a1c")+d.p("M30 70 Q100 30 170 70 L150 50 Q100 26 50 50Z","#3a3f50")+d.r(50,104,24,24,0,"#fff6e0",O,2)+d.r(126,104,24,24,0,"#fff6e0",O,2),
"strawberry farm":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.p("M8 90 L192 90 L192 192 L8 192Z","#9fd68a",null)+d.p("M60 90 Q100 40 140 90Z","#fff",O,3)+[...Array(3)].map((_,r)=>d.e(100,120+r*26,90-r*0,10,"#7a5a3c",null)+[30,70,110,150].map(x=>d.g(PIC.strawberry(),`translate(${x-10+(r%2)*10} ${100+r*26}) scale(.12)`)).join("")).join(""),
"beach":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.r(8,80,184,40,0,"#3f9be8",null)+d.p("M8 120 Q100 100 192 120 L192 192 L8 192Z","#f3dfa8",null)+d.l("M20 96 Q40 88 60 96 M110 104 Q130 96 150 104","#fff",3)+sunIcon(160,40,14)+d.l("M50 170 L80 110",O,4)+d.p("M30 120 Q80 80 130 110Z",C.red)+d.e(140,170,20,8,C.blue),
"aquarium":()=>d.r(14,30,172,140,10,"#5ab4f0")+d.r(14,150,172,20,0,"#f3dfa8",null)+d.r(14,30,172,140,10,"none",O,6)+d.g(PIC.fish(),"translate(30 50) scale(.45)")+d.g(PIC.fish(),"translate(110 90) scale(.35)")+d.l("M40 168 Q36 130 46 110 M56 168 Q60 140 52 120",C.green,5)+d.c(150,60,5,"#fff",O,2)+d.c(160,46,4,"#fff",O,2),
"curry":()=>PIC["curry and rice"](),
"curry and rice":()=>d.shadow(100,184,90)+d.e(100,130,88,40,"#fff")+d.e(70,120,44,24,"#fff",O,0,2)+d.p("M90 104 Q150 96 170 124 Q160 152 110 150 Q80 140 90 104Z","#b8742a")+d.c(130,120,8,C.orange,O,2)+d.c(146,132,7,"#f2d79a",O,2)+d.c(114,132,7,"#9a4a1c",O,2)+d.l("M150 40 L120 116",C.grey2,7),
"sushi":()=>d.shadow(100,184,90)+d.r(14,140,172,34,6,"#c98d4e")+[50,100,150].map((x,i)=>d.r(x-22,110,44,30,10,"#fff")+d.p(`M${x-26} 112 Q${x} 96 ${x+26} 112 L${x+24} 122 Q${x} 110 ${x-24} 122Z`,[C.orange,C.red,"#ffe58a"][i])).join(""),
"borscht":()=>PIC.soup().replace(/#ffb04a/g,"#b8304a"),
"kebab":()=>d.l("M30 170 L170 30",C.brown,5)+[[60,140,"#9a4a1c"],[80,120,C.green],[100,100,"#9a4a1c"],[120,80,C.red],[140,60,"#9a4a1c"]].map(([x,y,c])=>d.r(x-14,y-14,28,28,6,c)).join(""),
"tacos":()=>d.shadow(100,184,80)+d.p("M20 150 Q20 60 100 60 Q180 60 180 150Z","#f2cf6b")+d.p("M36 140 Q40 80 100 76 Q160 80 164 140",C.leaf,O,3)+d.c(70,96,8,C.red,O,2)+d.c(120,92,8,C.red,O,2)+d.p("M60 110 Q100 90 140 110",null,"#9a4a1c",8)+d.l("M50 120 L150 120","#ffe58a",4),
"fish and chips":()=>d.shadow(100,186,80)+d.p("M20 90 L180 90 L160 180 L40 180Z","#fff")+d.l("M20 90 L180 90",O,0)+d.e(76,96,50,22,"#e8b066",O,-10)+[[130,70],[146,60],[160,76],[124,58]].map(([x,y])=>d.r(x-5,y-20,10,40,3,"#ffd66b",O,2)).join("")+d.r(40,110,120,6,0,C.blue,null),
"french fries":()=>d.shadow(100,186,50)+[...Array(7)].map((_,i)=>d.r(56+i*13,30+Math.abs(3-i)*8,12,80,3,"#ffd66b",O,2.5)).join("")+d.p("M44 90 L156 90 L140 184 L60 184Z",C.red)+d.c(100,130,16,"#fff",O,2)+d.l("M94 130 L106 130",C.red,3),
"tempura":()=>d.shadow(100,184,80)+d.e(100,150,84,26,"#fff")+d.g(d.p("M-60 0 Q-60 -22 -20 -22 L50 -16 Q64 -8 64 0 Q64 8 50 16 L-20 22 Q-60 22 -60 0Z","#f2c25a")+d.p("M60 -6 L84 -16 L80 0 L84 16 L60 6Z",C.red),"translate(96 120) rotate(-16)")+d.g(d.e(0,0,26,16,"#f2c25a"),"translate(60 150)"),
"rice":()=>d.shadow(100,184,70)+d.p("M30 100 Q34 176 100 176 Q166 176 170 100Z","#fff")+d.p("M36 102 Q50 60 100 60 Q150 60 164 102Z","#fffdf6")+[[80,80],[100,72],[120,82],[90,92],[110,90],[130,96],[70,96]].map(([x,y])=>d.e(x,y,4,2,"#e3dccd",null)).join("")+d.l("M44 130 L156 130",C.blue,4)+d.l("M150 30 L120 80 M164 36 L132 84",C.brown,4),
"miso soup":()=>d.shadow(100,184,70)+d.p("M30 96 Q34 176 100 176 Q166 176 170 96Z",C.red2)+d.e(100,96,70,16,"#c9905a")+d.r(70,90,12,10,1,"#fff",O,2)+d.r(110,92,12,10,1,"#fff",O,2)+d.c(90,100,4,C.green,null)+d.c(130,98,4,C.green,null)+d.l("M80 70 Q72 58 80 46 M120 70 Q112 58 120 46",C.grey,3),
"bread":()=>d.shadow(100,184,80)+d.p("M24 100 Q24 50 100 50 Q176 50 176 100 L170 160 L30 160Z","#e8b066")+d.p("M40 104 Q40 70 100 70 Q160 70 160 104 L156 150 L44 150Z","#fff3d6",null)+d.l("M60 90 L80 76 M90 90 L110 76 M120 90 L140 76","#e0c090",3),
"grilled fish":()=>d.shadow(100,184,90)+d.r(14,120,172,50,6,"#fff")+d.g(PIC.fish().replace(/#ff9a3c/g,"#c9905a").replace(/#d9711c/g,"#9a6a3a"),"translate(20 40) scale(.8)")+d.l("M60 100 L70 120 M90 100 L100 120 M120 100 L130 120","#6e4325",4)+d.p("M150 140 L176 140 L168 160 L158 160Z","#fff",O,2)+d.e(164,140,14,6,C.yellow),
"yogurt":()=>d.shadow(100,186,50)+d.p("M56 70 L66 180 L134 180 L144 70Z","#fff")+d.e(100,70,44,10,"#fff")+d.r(60,110,80,40,0,C.pink,null)+d.t(100,138,"YOGURT",12,"#fff",800)+d.c(100,56,14,C.red)+d.l("M100 44 L104 34",C.green2,3),
"coffee":()=>d.shadow(100,184,70)+d.e(100,170,70,14,"#fff")+d.p("M50 90 L56 160 Q100 172 144 160 L150 90Z","#fff")+d.e(100,90,50,10,"#6e4325")+d.p("M150 104 Q180 104 176 126 Q172 146 146 140",null,O,6)+d.l("M80 70 Q72 58 80 46 M100 70 Q92 58 100 46 M120 70 Q112 58 120 46",C.grey,3),
"tom yam kung":()=>PIC.soup().replace(/#ffb04a/g,"#ff7a3d")+d.g(d.p("M0 0 Q10 -14 24 -4 Q30 8 18 14",null,"#ff6b5a",6),"translate(80 80)")+d.l("M130 82 L140 66",C.green,4),
"yen":()=>d.shadow(100,186,70)+d.c(70,110,46,C.gold)+d.t(70,126,"¥",44,"#9a6a00",800)+d.c(140,140,30,"#c9cfd8")+d.t(140,151,"100",18,"#5a606a",800)+d.c(150,70,22,"#c08850")+d.t(150,78,"10",16,"#6e4325",800),
"high":()=>d.r(20,180,160,6,2,O,null)+d.l("M100 180 L100 40",C.grey,3)+d.c(100,40,22,C.red)+d.shine(92,32,6,4,-30)+d.l("M100 62 L100 180",O,0)+d.p("M150 150 L150 40 L136 56 M150 40 L164 56",null,"#ffb000",6),
"low":()=>d.r(20,180,160,6,2,O,null)+d.c(100,156,22,C.blue)+d.shine(92,148,6,4,-30)+d.p("M150 40 L150 150 L136 134 M150 150 L164 134",null,"#ffb000",6),
"old":()=>d.g(PIC.house(),"")+d.l("M50 120 L60 130 L54 140 M140 100 L150 110",O,3)+d.p("M150 40 Q140 30 150 20",null,C.grey,3)+d.r(36,90,128,94,2,"#9a8a70",null).replace(/fill="[^"]*"/,'fill="#c9b48a" opacity=".35"'),
"new":()=>PIC.house()+d.sparkle(30,40,14,"#fff")+d.sparkle(170,30,12,"#fff")+d.sparkle(176,160,10,C.gold),
"tall":()=>d.r(0,184,200,16,0,"#9fd68a",null)+d.r(70,10,60,176,4,"#cfe8ff")+[...Array(7)].map((_,r)=>d.r(78,20+r*22,18,14,1,"#fff",O,2)+d.r(104,20+r*22,18,14,1,"#fff",O,2)).join("")+d.r(20,140,40,46,3,"#fff3d6")+d.r(140,150,40,36,3,"#fff3d6")+d.p("M180 120 L180 20 L170 32 M180 20 L190 32",null,"#ffb000",5)
});

/* a grown-up, feet at (x,y), about 206 tall at s=1. opt: s, coat, pants, sleeve, shorts, skirt, hair, grey, girl, bun,
   mood, hat (police|pilot|chef|fire|hard|straw|nurse|beret|cap), capCol, glasses, beard, tie, apron, armL/armR (down|up|out|hold|salute|mic),
   behind/extra: SVG in the grown-up's own coordinates drawn before/after the body */
function adult(x,y,o){
  o=o||{};const s=o.s||1,coat=o.coat||C.blue,pants=o.pants||"#4a4f6b",hair=o.grey?"#d4d4d4":(o.hair||C.hair);
  const pose={down:[[34,-64]],up:[[42,-176]],out:[[60,-118]],hold:[[36,-98],[14,-88]],salute:[[50,-136],[26,-166]],mic:[[42,-112],[16,-144]]};
  const arm=(side,p)=>{const pts=pose[p||"down"].map(([a,b])=>[side*a,b]);const path=`M${side*22} -120`+pts.map(([a,b])=>` L${a} ${b}`).join("");const e=pts[pts.length-1];
    return d.l(path,O,17)+d.l(path,o.sleeve||coat,10)+d.c(e[0],e[1],8,C.skin);};
  const front=p=>p==="hold"||p==="salute"||p==="mic";
  let g=d.shadow(0,0,36)+(o.behind||"");
  if(o.skirt){g+=d.r(-12,-56,8,52,4,C.skin)+d.r(4,-56,8,52,4,C.skin);}
  else if(o.shorts){g+=d.r(-16,-62,12,58,5,C.skin)+d.r(4,-62,12,58,5,C.skin)+d.r(-20,-70,40,26,6,o.shorts);}
  else g+=d.r(-17,-66,14,62,5,pants)+d.r(3,-66,14,62,5,pants);
  g+=d.e(-11,-3,11,5,"#5a4636")+d.e(11,-3,11,5,"#5a4636");
  if(!front(o.armL))g+=arm(-1,o.armL);if(!front(o.armR))g+=arm(1,o.armR);
  g+=d.r(-26,-132,52,74,16,coat);
  if(o.skirt)g+=d.p("M-24 -70 L24 -70 L36 -40 L-36 -40Z",o.skirt);
  if(o.apron)g+=d.p("M-18 -118 L18 -118 L20 -50 L-20 -50Z",o.apron)+d.l("M-18 -118 L-12 -132 M18 -118 L12 -132",O,3);
  if(o.tie)g+=d.p("M-5 -130 L5 -130 L7 -96 L0 -88 L-7 -96Z",o.tie,O,3);
  g+=d.r(-8,-140,16,12,4,C.skin);
  g+=headFace(0,-158,26,{hair,mood:o.mood||"smile",girl:o.girl});
  if(o.bun)g+=d.c(0,-188,11,hair);
  if(o.glasses)g+=d.c(-9.4,-155,7,"none",O,2.5)+d.c(9.4,-155,7,"none",O,2.5)+d.l("M-2.4 -155 L2.4 -155",O,2.5);
  if(o.beard)g+=d.p("M-16 -146 Q0 -138 16 -146 Q12 -150 0 -146 Q-12 -150 -16 -146Z",hair,O,2.5);
  const h=o.hat;
  if(h==="police"||h==="pilot")g+=d.p("M-26 -174 L26 -174 L30 -192 Q0 -204 -30 -192Z",h==="police"?"#24356b":"#1f2a4a")+d.r(-28,-178,56,8,3,"#111a3a")+
    (h==="police"?d.star(0,-188,6,C.gold,O,2):d.l("M-12 -188 L-4 -186 M12 -188 L4 -186",C.gold,3)+d.c(0,-187,4,C.gold,O,2));
  if(h==="chef")g+=d.c(-14,-200,13,"#fff")+d.c(14,-200,13,"#fff")+d.c(0,-208,15,"#fff")+d.r(-22,-196,44,18,3,"#fff");
  if(h==="fire")g+=d.p("M-28 -170 Q-28 -206 0 -206 Q28 -206 28 -170Z",C.red)+d.p("M-38 -172 L38 -172 L32 -164 L-32 -164Z",C.red2)+d.p("M-8 -196 L8 -196 L8 -184 L0 -178 L-8 -184Z",C.gold,O,2);
  if(h==="hard")g+=d.p("M-28 -172 Q-28 -204 0 -204 Q28 -204 28 -172Z",C.yellow)+d.r(-34,-176,68,7,3,C.yellow2)+d.l("M0 -204 L0 -178",C.yellow2,3);
  if(h==="straw")g+=d.e(0,-176,48,9,"#f1d27a")+d.p("M-24 -178 Q-24 -204 0 -204 Q24 -204 24 -178Z","#f1d27a")+d.r(-24,-186,48,6,0,C.red,null);
  if(h==="nurse")g+=d.p("M-18 -180 L18 -180 L14 -198 L-14 -198Z","#fff")+d.p("M-2 -196 L2 -196 L2 -192 L6 -192 L6 -188 L2 -188 L2 -184 L-2 -184 L-2 -188 L-6 -188 L-6 -192 L-2 -192Z",C.red,null);
  if(h==="beret")g+=d.e(4,-184,28,10,"#c0392b",O,-8)+d.c(6,-196,3,O,null);
  if(h==="cap")g+=d.p("M-27 -174 Q-27 -204 0 -204 Q27 -204 27 -174Z",o.capCol||C.red)+d.p("M0 -176 L46 -176 Q48 -170 42 -168 L0 -168Z",o.capCol||C.red);
  if(front(o.armL))g+=arm(-1,o.armL);if(front(o.armR))g+=arm(1,o.armR);
  g+=o.extra||"";
  return d.g(g,`translate(${x} ${y}) scale(${s})`);
}
const note=(x,y,col)=>d.e(x,y,8,6,col||C.purple,O,-20,3)+d.l(`M${x+7} ${y-2} L${x+7} ${y-30} L${x+18} ${y-24}`,O,4);
const guitar=(x,y,s,rot)=>d.g(d.r(-5,-92,10,64,2,"#6e4325")+d.r(-8,-106,16,18,3,"#3a2a20")+d.p("M0 -30 Q-22 -30 -20 -10 Q-18 0 -26 12 Q-30 42 0 44 Q30 42 26 12 Q18 0 20 -10 Q22 -30 0 -30Z","#e08a2e")+d.c(0,6,8,O,null)+d.r(-10,24,20,5,1,O,null)+d.l("M-2 -100 L-2 26 M2 -100 L2 26","#fff6",1.5),`translate(${x} ${y}) rotate(${rot||0}) scale(${s})`);
const mic=(x,y,s,rot)=>d.g(d.r(-5,0,10,34,4,"#3a3f50")+d.c(0,-6,11,C.grey)+d.l("M-7 -10 L7 -10 M-8 -4 L8 -4",C.grey2,2),`translate(${x} ${y}) rotate(${rot||0}) scale(${s||1})`);
const bball=(x,y,r)=>d.c(x,y,r,"#ff8a2a")+d.l(`M${x-r} ${y} L${x+r} ${y} M${x} ${y-r} L${x} ${y+r} M${x-r*0.7} ${y-r*0.7} Q${x-r*0.2} ${y} ${x-r*0.7} ${y+r*0.7} M${x+r*0.7} ${y-r*0.7} Q${x+r*0.2} ${y} ${x+r*0.7} ${y+r*0.7}`,O,2.5);
const sball=(x,y,r)=>{let g=d.c(x,y,r,"#fff");const pent=(cx,cy,rr)=>{let p="";for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;p+=(cx+Math.cos(a)*rr).toFixed(1)+","+(cy+Math.sin(a)*rr).toFixed(1)+" ";}return d.poly(p,O,null);};
  return g+pent(x,y,r*0.36)+[0,1,2,3,4].map(i=>{const a=-Math.PI/2+i*Math.PI*2/5;return d.l(`M${(x+Math.cos(a)*r*0.36).toFixed(1)} ${(y+Math.sin(a)*r*0.36).toFixed(1)} L${(x+Math.cos(a)*r).toFixed(1)} ${(y+Math.sin(a)*r).toFixed(1)}`,O,2.5);}).join("");};
const flask=(x,y,s)=>d.g(d.p("M-8 -30 L-8 -8 L-26 26 Q-28 32 -22 32 L22 32 Q28 32 26 26 L8 -8 L8 -30Z","#e8f6ff")+d.p("M-16 10 L16 10 L25 27 Q26 31 22 31 L-22 31 Q-26 31 -25 27Z",C.green,null)+d.p("M-8 -30 L-8 -8 L-26 26 Q-28 32 -22 32 L22 32 Q28 32 26 26 L8 -8 L8 -30Z","none")+d.r(-11,-34,22,6,2,"#fff")+d.c(-4,-44,4,"#fff",O,2)+d.c(6,-54,6,"#fff",O,2),`translate(${x} ${y}) scale(${s||1})`);
const scope=d.l("M-14 -130 Q-20 -100 0 -96 Q20 -100 14 -130",O,3)+d.c(0,-92,5,C.grey,O,2);
const ground=(f)=>d.r(0,168,200,32,0,f||"#e9d6b0",null);
const speed=(x,y)=>d.l(`M${x} ${y} L${x+40} ${y} M${x-10} ${y+22} L${x+36} ${y+22} M${x+4} ${y+44} L${x+42} ${y+44}`,C.grey,5);
const desk=(screen,who)=>d.r(0,0,200,200,0,"#fdf3e3",null)+who+d.r(8,148,184,14,3,"#c98d4e")+d.r(18,162,12,38,2,"#a46b3a",null)+d.r(170,162,12,38,2,"#a46b3a",null)+screen;
const monitor=(inner)=>d.r(104,58,86,66,6,"#2a2f3a")+inner+d.r(140,124,14,14,0,"#555")+d.r(126,138,42,10,4,"#555");
const piano=(x,y,s,kidIn)=>{let g=d.r(-76,-34,152,70,6,"#2a2630")+d.r(-80,-46,160,22,3,"#fff");for(let i=1;i<14;i++)g+=d.l(`M${-80+i*11.4} -46 L${-80+i*11.4} -24`,"#bbb",2);
  [1,2,4,5,6,8,9,11,12,13].forEach(i=>{g+=d.r(-80+i*11.4-3.5,-46,7,13,1,O,null);});return d.g(g+d.r(-60,36,10,20,2,"#2a2630")+d.r(50,36,10,20,2,"#2a2630")+d.shine(-40,-4,20,4),`translate(${x} ${y}) scale(${s})`);};
const shogiPiece=(x,y,s,k)=>d.g(d.p("M0 -16 L12 -9 L14 14 L-14 14 L-12 -9Z","#f6dca0",O,2.5)+d.t(0,8,k,14,O,700),`translate(${x} ${y}) scale(${s})`);
const shogiBoard=(x,y,w,h)=>{let g=d.r(x,y,w,h,4,"#e9c37a");for(let i=1;i<5;i++)g+=d.l(`M${x+i*w/5} ${y+4} L${x+i*w/5} ${y+h-4} M${x+4} ${y+i*h/5} L${x+w-4} ${y+i*h/5}`,"#8a5a2b",2);return g;};
const kendama=(x,y,s)=>d.g(d.l("M0 -20 Q-26 -40 6 -70",O,2)+d.r(-5,-20,10,60,3,"#d9a866")+d.r(-20,-14,40,12,6,"#d9a866")+d.p("M-3 -20 L0 -34 L3 -20Z","#d9a866",O,2)+d.c(10,-80,15,C.red)+d.shine(6,-86,5,3),`translate(${x} ${y}) scale(${s})`);
const violinS=(x,y,s,rot)=>d.g(d.r(-5,-100,10,48,3,O,null)+d.p("M0 -60 Q-34 -60 -34 -30 Q-34 -12 -20 -6 Q-36 2 -36 26 Q-36 60 0 60 Q36 60 36 26 Q36 2 20 -6 Q34 -12 34 -30 Q34 -60 0 -60Z","#c0682a")+d.l("M-12 -10 Q-6 0 -12 10 M12 -10 Q6 0 12 10",O,3)+d.r(-12,30,24,6,2,O,null),`translate(${x} ${y}) rotate(${rot}) scale(${s})`);
const crane=(x,y,s,f)=>d.g(d.poly("-40,-10 0,-30 -14,4",f||C.pink,O,3)+d.poly("40,-10 0,-30 14,4",f||C.pink,O,3)+d.poly("-14,4 0,-30 14,4 0,14",f||C.pink,O,3)+d.poly("-14,4 -48,-34 -42,-36 -6,6",f||C.pink,O,3)+d.poly("-48,-34 -56,-28 -44,-30",f||C.pink,O,3)+d.poly("14,4 46,-24 10,10",f||C.pink,O,3),`translate(${x} ${y}) scale(${s})`);
const me=(x,y,s)=>kid(x,y,{s:s||0.58,shirt:C.yellow,arm:"down",mood:"smile"});
/* ordinal date: calendar page with "1st", "2nd" ... */
function ordinal(n){const suf=(n%10===1&&n!==11)?"st":(n%10===2&&n!==12)?"nd":(n%10===3&&n!==13)?"rd":"th";
  return d.shadow(100,190,74)+d.r(26,30,148,152,12,"#fff")+d.r(26,30,148,36,12,"#ff9a3c")+d.r(26,54,148,12,0,"#ff9a3c",null)+d.l("M58 22 L58 40 M142 22 L142 40",O,6)+
    [44,64,84,104,124,144].map(xx=>d.c(xx+6,48,3.5,"#fff",null)).join("")+d.t(100,146,`${n}<tspan font-size="40" fill="${C.orange2}">${suf}</tspan>`,n>9?70:82,O,800);}
for(let n=1;n<=31;n++){const suf=(n%10===1&&n!==11)?"st":(n%10===2&&n!==12)?"nd":(n%10===3&&n!==13)?"rd":"th";PIC[n+suf]=()=>ordinal(n);}
Object.assign(PIC,{
/* jobs */
"musician":()=>ground("#efe3f7")+adult(96,192,{s:0.82,coat:C.purple,armL:"hold",armR:"hold",mood:"open",extra:guitar(0,-84,0.85,-58)})+note(30,60,C.purple)+note(164,44,C.blue)+note(170,110,C.pink),
"scientist":()=>ground("#e8eef5")+adult(84,192,{s:0.82,coat:"#fff",glasses:true,armR:"out",mood:"open",extra:d.l("M-6 -128 L-6 -60",O,2)+flask(64,-150,0.9)})+d.r(134,150,58,8,3,"#9aa3ad")+flask(170,134,0.5),
"basketball player":()=>d.r(0,0,200,200,0,"#fff1e0",null)+ground("#d9a066")+d.r(10,20,46,32,3,"#fff")+d.r(20,30,26,16,2,"none",C.red,3)+d.e(33,56,16,4,"none",C.red,0,4)+d.l("M19 58 L25 80 L41 80 L47 58",O,2)+
  adult(110,192,{s:0.8,coat:C.orange,sleeve:C.skin,shorts:C.orange2,armR:"up",armL:"down",mood:"open",extra:d.t(0,-90,"23",24,"#fff",800)+bball(44,-198,18)}),
"programmer":()=>desk(monitor(d.r(110,64,74,52,3,"#1d2230",null)+d.t(147,96,"&lt;/&gt;",24,"#7be07b",800)+d.l("M116 74 L140 74 M116 108 L160 108 M120 102 L150 102","#7cc4ff",3))+d.r(70,142,62,8,3,"#ddd"),
  adult(62,236,{s:0.85,coat:C.green,glasses:true,armR:"hold",armL:"hold",mood:"smile"})),
"police officer":()=>ground("#dfe6ee")+adult(100,192,{s:0.82,coat:"#2f4a8a",pants:"#24356b",hat:"police",armR:"salute",mood:"smile",extra:d.star(-12,-112,8,C.gold,O,2)+d.r(-26,-74,52,7,0,O,null)}),
"vet":()=>ground("#e3f3ee")+adult(64,192,{s:0.82,coat:"#7fd1c0",armR:"out",mood:"open",extra:scope})+d.r(110,128,84,10,3,"#b8c2cc")+d.r(120,138,8,52,2,"#9aa3ad")+d.r(176,138,8,52,2,"#9aa3ad")+d.g(PIC.dog(),"translate(104 26) scale(.52)")+d.p("M150 30 L154 22 L158 30 L166 30 L160 36 L162 44 L154 40 L146 44 L148 36 L142 30Z",C.red,O,2),
"teacher":()=>d.r(0,0,200,200,0,"#fdf3e3",null)+ground("#d9c9b0")+d.r(86,26,106,74,6,"#2e6b4a",O,5)+d.r(86,96,106,6,2,"#c98d4e")+d.t(139,74,"ABC",30,"#fff",800)+
  adult(56,192,{s:0.82,coat:C.pink,girl:true,glasses:true,armR:"out",mood:"open",extra:d.l("M60 -118 L104 -150",C.brown,4)}),
"pilot":()=>d.r(8,8,184,184,14,"#cfeeff",null)+cloud(46,40,0.5)+d.g(d.p("M-40 0 Q-40 -8 -30 -8 L34 -8 Q46 -4 46 2 Q40 8 30 8 L-30 8 Q-40 8 -40 0Z","#fff")+d.p("M-4 -4 L-20 -30 L-10 -30 L12 -4Z","#fff")+d.p("M-4 4 L-16 22 L-6 22 L12 4Z","#fff")+d.p("M-36 -4 L-44 -20 L-36 -20 L-28 -6Z","#fff"),"translate(150 50) scale(.8)")+
  adult(92,200,{s:0.8,coat:"#1f2a4a",pants:"#1f2a4a",hat:"pilot",tie:"#1f2a4a",armR:"salute",mood:"smile",extra:d.l("M-20 -118 L-8 -118 M20 -118 L8 -118",C.gold,4)+d.p("M-4 -130 L4 -130 L4 -110 L-4 -110Z","#fff",null)}),
"doctor":()=>ground("#eef3f8")+d.c(156,52,26,"#fff",O,4)+d.p("M150 36 L162 36 L162 46 L172 46 L172 58 L162 58 L162 68 L150 68 L150 58 L140 58 L140 46 L150 46Z",C.red,O,2)+
  adult(84,192,{s:0.82,coat:"#fff",tie:C.blue,armR:"hold",mood:"smile",extra:scope+d.r(-28,-112,12,14,2,"none",O,2)}),
"nurse":()=>ground("#fdeef3")+adult(100,192,{s:0.82,coat:"#ff9fc0",girl:true,hat:"nurse",armR:"hold",armL:"hold",mood:"smile",extra:d.r(-14,-104,30,38,3,"#fff")+d.l("M-8 -94 L10 -94 M-8 -86 L10 -86 M-8 -78 L4 -78",C.grey2,2)+d.r(-6,-108,14,6,2,C.grey)}),
"cook":()=>ground("#f3ece2")+adult(80,192,{s:0.82,coat:"#fff",pants:"#3a3f50",hat:"chef",armR:"out",mood:"open",extra:d.p("M-12 -132 L12 -132 L0 -118Z",C.red,O,3)})+d.l("M130 96 L162 78",O,6)+d.e(126,100,26,9,"#3a3f50")+d.p("M114 96 Q118 88 128 92 Q138 88 138 96 Q130 102 120 100Z","#fff",O,2)+d.c(127,95,4,C.yellow,null)+d.l("M118 80 Q114 70 118 60 M132 80 Q128 70 132 60",C.grey,3),
"fire fighter":()=>ground("#f3e6d6")+d.p("M148 118 Q172 92 190 66","none","#7cc4ff",12)+[[192,54,6],[180,48,5],[196,70,5],[172,60,4],[186,38,4]].map(([x,y,r])=>d.c(x,y,r,"#7cc4ff",O,2)).join("")+
  adult(90,192,{s:0.82,coat:"#d9a84a",pants:"#d9a84a",hat:"fire",armR:"hold",armL:"hold",mood:"open",extra:d.r(-26,-100,52,7,0,C.yellow,O,2)+d.r(-26,-80,52,7,0,C.yellow,O,2)+d.l("M14 -88 L60 -86 M-14 -88 L-20 -40",C.black,8)+d.r(52,-92,20,12,3,C.grey)}),
"carpenter":()=>ground("#efe2c8")+d.r(118,152,76,18,3,"#e0b57a")+d.l("M128 152 L128 170 M184 152 L184 170","#a46b3a",2)+
  adult(80,192,{s:0.82,coat:C.blue,hat:"hard",armR:"up",apron:"#c98d4e",mood:"open",extra:d.g(d.r(-4,0,8,44,3,"#c98d4e")+d.r(-16,-10,32,14,3,C.grey),"translate(46 -184) rotate(30)")}),
"farmer":()=>ground("#9fd17a")+d.l("M10 172 L40 160 M60 176 L90 162 M150 176 L180 162",C.green2,3)+
  adult(90,192,{s:0.82,coat:C.red,pants:"#3d6fb8",hat:"straw",armR:"hold",armL:"hold",mood:"open",extra:d.p("M-20 -112 L20 -112 L22 -58 L-22 -58Z","#3d6fb8")+d.l("M-18 -112 L-14 -130 M18 -112 L14 -130","#3d6fb8",4)+
    d.p("M-30 -96 L30 -96 L24 -62 L-24 -62Z","#c98d4e")+d.c(-14,-100,9,C.red)+d.c(6,-102,9,"#ff6a3d")+d.p("M18 -96 L26 -120 L32 -96Z",C.orange)+d.l("M24 -118 L20 -126 M28 -118 L32 -126",C.leaf,3)}),
"game creator":()=>desk(monitor(d.r(110,64,74,52,3,"#7cc4ff",null)+d.r(110,100,74,16,0,C.green,null)+d.r(130,84,12,16,2,C.red,O,2)+d.c(160,80,5,C.gold,O,2)+d.c(174,80,5,C.gold,O,2)),
  adult(62,236,{s:0.85,coat:C.orange,armR:"hold",armL:"hold",mood:"open",extra:d.r(-26,-102,52,20,10,"#3a3f50")+d.c(14,-92,3,C.red,null)+d.c(20,-96,3,C.blue,null)+d.l("M-18 -92 L-8 -92 M-13 -97 L-13 -87","#fff",3)})),
"baker":()=>ground("#f6e7d2")+adult(100,192,{s:0.82,coat:"#fff",hat:"chef",apron:"#b07040",armR:"hold",armL:"hold",mood:"smile",
  extra:d.r(-52,-104,104,8,3,C.grey)+d.e(-30,-114,18,12,"#e3a35a")+d.e(0,-118,18,14,"#d98f45")+d.e(30,-114,18,12,"#e3a35a")+d.l("M-36 -118 L-30 -110 M-6 -122 L0 -114 M24 -118 L30 -110",O,2)}),
"singer":()=>d.r(0,0,200,200,0,"#2a2a4a",null)+d.p("M70 0 L130 0 L170 200 L30 200Z","#ffffff22",null)+d.e(100,190,70,10,"#ffffff33",null)+
  adult(100,194,{s:0.82,coat:C.pink,girl:true,skirt:C.purple,armR:"mic",mood:"open",extra:mic(14,-142,0.9,-25)})+note(34,56,C.yellow)+note(166,40,C.gold)+note(160,104,C.pink)+d.sparkle(40,120,8)+d.sparkle(154,150,7),
"soccer player":()=>ground("#7cc46a")+d.l("M0 168 L200 168","#fff",3)+adult(84,192,{s:0.82,coat:C.green,sleeve:C.green,shorts:"#fff",armL:"up",armR:"down",mood:"grin",extra:d.t(0,-90,"10",24,"#fff",800)})+sball(140,170,18),
"comedian":()=>d.r(0,0,200,200,0,"#ffe9a8",null)+d.p("M0 0 L40 0 Q30 80 0 120Z",C.red,null)+d.p("M200 0 L160 0 Q170 80 200 120Z",C.red,null)+ground("#c98d4e")+
  d.l("M132 196 L124 108",O,5)+d.e(132,196,20,5,O,null)+adult(88,192,{s:0.8,coat:"#5bc0eb",armL:"out",armR:"down",mood:"grin",extra:d.p("M-12 -132 L0 -126 L12 -132 L12 -120 L0 -126 L-12 -120Z",C.red,O,2)})+mic(122,94,0.8,-15)+
  d.t(34,150,"HA!",22,C.orange2,800,'transform="rotate(-14 34 150)"')+d.t(168,150,"HA!",22,C.orange2,800,'transform="rotate(14 168 150)"'),
"florist":()=>ground("#e6f4dc")+d.r(128,130,64,40,4,"#c98d4e")+[140,160,180].map((x,i)=>d.l(`M${x} 130 L${x} 104`,C.green2,3)+d.c(x,100,8,[C.red,C.yellow,C.pink][i],O,2)).join("")+
  adult(76,192,{s:0.82,coat:"#fff",girl:true,apron:C.green,armR:"hold",armL:"hold",mood:"smile",extra:d.p("M-14 -70 L14 -70 L28 -112 L-28 -112Z","#fff4d6")+d.c(-14,-118,9,C.red,O,2)+d.c(4,-124,9,C.yellow,O,2)+d.c(20,-114,9,C.pink,O,2)+d.c(-2,-110,8,C.purple,O,2)}),
"baseball player":()=>ground("#c9a36a")+d.r(0,150,200,20,0,"#7cc46a",null)+adult(96,194,{s:0.8,coat:"#fff",pants:"#fff",hat:"cap",capCol:C.blue2,armR:"up",armL:"down",mood:"open",
  extra:d.t(0,-90,"7",24,C.blue2,800)+d.l("M0 -110 L0 -70",C.blue2,2)+d.g(d.p("M-5 -100 Q-8 -40 -4 0 L4 0 Q8 -40 5 -100 Q0 -104 -5 -100Z","#c98d4e"),"translate(42 -168) rotate(40) scale(.8)")})+d.c(30,50,8,"#fff",O,3)+d.l("M10 54 L20 52 M12 44 L20 46",C.grey,3),
"comic creator":()=>desk(d.r(100,92,92,56,3,"#fff")+d.r(106,98,38,22,1,"none",O,2)+d.r(148,98,38,22,1,"none",O,2)+d.r(106,122,80,22,1,"none",O,2)+d.c(118,112,5,C.skin,O,2)+d.p("M154 104 L178 104 L174 114 L160 114Z","#fff",O,2)+d.star(130,132,7,C.gold,O,2)+d.l("M150 132 L176 132",O,2),
  adult(62,236,{s:0.85,coat:C.purple,hat:"beret",armR:"hold",mood:"open",extra:d.l("M14 -88 L40 -116",O,4)})),
"dancer":()=>d.r(0,0,200,200,0,"#f6ecff",null)+ground("#d9b9e8")+adult(100,192,{s:0.8,coat:C.purple,girl:true,skirt:C.pink,armL:"up",armR:"up",mood:"grin"})+note(34,60,C.purple)+note(162,70,C.pink)+d.sparkle(40,130,8)+d.sparkle(162,140,8),
/* JS5 unit 4 actions */
"play video games":()=>d.r(0,150,200,50,0,"#e8dccb",null)+d.r(98,40,94,66,6,"#2a2f3a")+d.r(104,46,82,54,3,"#7cc4ff",null)+d.r(104,86,82,14,0,C.green,null)+d.r(124,70,10,16,2,C.red,O,2)+d.c(160,64,5,C.gold,O,2)+d.r(136,106,14,10,0,"#555")+
  kid(56,190,{s:0.85,shirt:C.orange,arm:"down",mood:"open"})+d.r(26,146,60,18,9,"#3a3f50")+d.c(70,152,3,C.red,null)+d.c(76,158,3,C.blue,null)+d.l("M36 155 L46 155 M41 150 L41 160","#fff",3),
"shogi":()=>d.shadow(100,184,80)+d.r(24,150,152,26,4,"#c99a55")+shogiBoard(24,30,152,124)+shogiPiece(54,70,1.2,"王")+shogiPiece(100,96,1.2,"飛")+shogiPiece(146,120,1.2,"歩")+shogiPiece(84,130,1.2,"歩"),
"play shogi":()=>headFace(50,54,26,{mood:"o"})+headFace(150,54,26,{mood:"smile",hair:"#6b3f22"})+d.r(22,76,52,30,10,C.blue)+d.r(126,76,52,30,10,C.red)+shogiBoard(30,100,140,86)+shogiPiece(66,126,1,"王")+shogiPiece(126,150,1,"歩")+shogiPiece(98,170,1,"歩")+d.c(150,118,8,C.skin),
"play badminton":()=>ground("#bfe3c0")+kid(78,188,{s:0.85,shirt:C.blue,arm:"up",mood:"open"})+d.l("M112 79 L134 46","#555",4)+d.e(144,32,12,17,"#fff",O,35,4)+d.l("M138 24 L150 40 M144 22 L152 34 M136 32 L146 44","#bbb",1.5)+
  d.g(d.p("M-10 -16 L10 -16 L5 4 L-5 4Z","#fff",O,3)+d.l("M-4 -16 L-2 4 M4 -16 L2 4",C.grey,2)+d.c(0,9,6,C.red),"translate(50 50) rotate(-30)")+d.l("M66 68 L76 76 M60 76 L70 84",C.grey,3),
"dance":()=>d.r(0,0,200,200,0,"#fff4fb",null)+ground("#f3d7e6")+d.g(kid(0,0,{s:0.9,shirt:C.pink,pants:C.purple,arm:"both",mood:"grin",girl:true}),"translate(100 188) rotate(-10)")+note(34,60,C.purple)+note(166,52,C.pink)+note(160,120,C.blue)+d.l("M44 170 Q50 160 60 166 M140 166 Q150 158 158 168",C.grey2,3),
"draw pictures":()=>ground("#e8dccb")+d.l("M112 196 L132 60 M178 196 L158 60 M145 196 L145 110",C.brown,5)+d.r(102,30,86,72,3,"#fff")+sunIcon(124,48,8)+d.r(140,64,30,26,0,C.yellow,O,3)+d.p("M136 66 L155 48 L174 66Z",C.red,O,3)+d.r(112,76,8,14,0,C.brown,O,2)+d.c(116,72,8,C.leaf,O,2)+
  kid(54,190,{s:0.85,shirt:C.green,arm:"up",mood:"open"})+d.l("M86 82 L104 70",C.brown,4)+d.c(106,68,3,C.red,null),
"sing":()=>d.r(0,0,200,200,0,"#f2f8ff",null)+ground("#dde8f5")+kid(100,192,{s:1,shirt:C.blue,arm:"both",mood:"open"})+note(36,66,C.purple)+note(170,80,C.pink)+note(150,30,C.blue),
"sing well":()=>d.r(0,0,200,200,0,"#fff7df",null)+ground("#f3e3b8")+kid(100,192,{s:0.92,shirt:C.blue,arm:"both",mood:"open"})+note(30,96,C.purple)+note(176,104,C.pink)+d.star(64,30,14,C.gold,O,3)+d.star(100,22,16,C.gold,O,3)+d.star(136,30,14,C.gold,O,3)+d.sparkle(30,150,8)+d.sparkle(170,150,8),
"play the violin":()=>ground("#efe3d2")+kid(96,190,{s:0.92,shirt:C.red,arm:"down",mood:"smile"})+violinS(62,128,0.45,-62)+d.l("M36 110 L136 140",C.brown,3)+d.c(124,136,7,C.skin)+note(160,50,C.purple)+note(160,110,C.blue),
"piano":()=>d.shadow(100,190,80)+piano(100,140,1,false),
"play the piano":()=>d.r(0,0,200,200,0,"#f6f0ff",null)+kid(100,170,{s:0.9,shirt:C.purple,arm:"down",mood:"smile"})+piano(100,150,1)+d.c(78,108,7,C.skin)+d.c(122,108,7,C.skin)+note(30,40,C.purple)+note(166,30,C.pink),
"play the recorder":()=>ground("#e6f2e0")+kid(100,192,{s:0.95,shirt:C.green,arm:"down",mood:"flat"})+d.r(95,86,10,64,5,"#fff4dc")+d.r(93,146,14,8,3,"#fff4dc")+d.c(100,104,2.5,O,null)+d.c(100,116,2.5,O,null)+d.c(100,128,2.5,O,null)+d.c(100,112,7,C.skin)+d.c(100,134,7,C.skin)+note(160,60,C.purple)+note(40,70,C.blue),
"play the guitar":()=>ground("#efe3d2")+kid(100,190,{s:0.92,shirt:C.blue,arm:"down",mood:"open"})+guitar(100,136,0.62,-58)+d.c(74,110,7,C.skin)+d.c(112,140,7,C.skin)+note(160,46,C.purple)+note(34,56,C.pink),
"play baseball":()=>ground("#c9a36a")+d.r(0,140,200,30,0,"#7cc46a",null)+kid(96,188,{s:0.88,shirt:"#fff",pants:"#fff",arm:"up",mood:"open"})+d.g(d.p("M-5 -100 Q-8 -40 -4 0 L4 0 Q8 -40 5 -100 Q0 -104 -5 -100Z","#c98d4e"),"translate(130 82) rotate(40) scale(.7)")+
  d.c(34,70,9,"#fff",O,3)+d.l("M38 64 Q34 70 38 76",C.red,2)+d.l("M10 72 L20 70 M12 60 L22 63",C.grey,3),
"play soccer":()=>ground("#7cc46a")+d.r(130,40,62,80,2,"none","#fff",5)+d.l("M140 40 L140 120 M150 40 L150 120 M160 40 L160 120 M170 40 L170 120 M180 40 L180 120 M130 60 L192 60 M130 80 L192 80 M130 100 L192 100","#fff",1.5)+
  kid(70,188,{s:0.88,shirt:C.red,arm:"both",mood:"open"})+sball(112,170,16)+d.l("M128 162 L140 158 M128 174 L142 174",C.grey,3),
"play tennis":()=>ground("#5aa86a")+d.l("M0 176 L200 176","#fff",3)+kid(82,188,{s:0.88,shirt:"#fff",pants:C.green2,arm:"up",mood:"open"})+d.l("M116 76 L132 54",O,6)+d.e(146,32,22,26,"none",O,35,6)+d.e(146,32,22,26,"none",C.red,35,3)+d.l("M134 24 L158 40 M140 16 L162 32 M132 34 L152 48 M140 50 L156 18 M150 50 L162 28","#ccc",1.5)+d.c(46,44,10,"#d8f23a")+d.l("M38 40 Q46 44 38 50 M54 38 Q46 44 54 50","#fff",2),
"play basketball":()=>d.r(0,0,200,200,0,"#fff1e0",null)+ground("#d9a066")+d.r(140,10,52,36,3,"#fff")+d.e(150,48,16,4,"none",C.red,0,4)+d.l("M136 50 L142 72 M164 50 L158 72 M150 52 L150 72",O,2)+kid(84,188,{s:0.88,shirt:C.orange,pants:C.orange2,arm:"both",mood:"open"})+bball(84,50,20),
"swim":()=>PIC.swimming(),
"swim fast":()=>PIC.swimming()+d.l("M6 70 L46 70 M2 90 L40 90 M10 110 L44 110","#fff",5)+d.l("M6 70 L46 70 M2 90 L40 90 M10 110 L44 110",C.blue2,2),
"run fast":()=>PIC.run()+speed(4,40)+d.c(30,170,10,"#e9d6b0",O,2)+d.c(14,162,7,"#e9d6b0",O,2)+clock(170,36,22,0,10),
"do judo":()=>d.r(0,150,200,50,0,"#d8d68a",null)+d.l("M0 172 L200 172 M66 150 L66 200 M134 150 L134 200","#a8a660",2)+kid(100,186,{s:0.95,shirt:"#fff",pants:"#fff",arm:"both",mood:"flat"})+d.g(d.l("M-12 -86 L0 -60 L12 -86",O,3)+d.r(-25,-44,50,8,0,O,null)+d.l("M-6 -40 L-12 -24 M6 -40 L12 -24",O,5),"translate(100 186) scale(.95)"),
"do kendo":()=>d.r(0,150,200,50,0,"#e2c48e",null)+kid(96,188,{s:0.95,shirt:"#24356b",pants:"#24356b",arm:"up",mood:"flat"})+d.g(d.r(-28,-142,56,52,14,"none","#c8ccd4",3)+d.l("M-24 -128 L24 -128 M-24 -116 L24 -116 M-24 -104 L24 -104 M-14 -140 L-14 -92 M0 -142 L0 -90 M14 -140 L14 -92","#c8ccd4",2.5)+d.r(-24,-82,48,30,6,"#3a2a20"),"translate(96 188) scale(.95)")+
  d.l("M132 66 L170 8","#e0c27a",7)+d.l("M132 66 L170 8",O,1.5)+d.r(126,62,14,10,3,"#fff"),
"skateboard":()=>ground("#d4d8de")+d.g(kid(0,0,{s:0.85,shirt:C.green,arm:"both",mood:"grin"})+d.r(-54,2,108,10,5,C.red)+d.c(-36,18,7,"#555")+d.c(36,18,7,"#555"),"translate(100 158) rotate(-8)")+d.l("M18 140 L46 140 M10 120 L36 120",C.grey,4),
"kendama":()=>d.shadow(100,190,40)+kendama(96,160,1.3),
"play kendama":()=>ground("#e6eef8")+kid(84,190,{s:0.9,shirt:C.blue,arm:"up",mood:"o"})+kendama(122,96,0.9),
"make paper cranes":()=>d.r(0,150,200,50,0,"#e8dccb",null)+crane(100,104,1.4,C.pink)+crane(40,170,0.5,C.blue)+crane(160,172,0.5,C.yellow)+d.poly("150,34 176,42 168,66 142,58",C.green,O,3)+d.l("M150 34 L168 66",C.green2,2),
"snap my fingers":()=>{let g=d.r(70,150,60,50,0,C.blue,null)+d.r(70,140,60,14,4,C.blue2);
  g+=d.r(64,82,74,70,26,C.skin)+d.r(118,92,30,16,8,C.skin)+d.r(118,108,30,16,8,C.skin)+d.r(116,124,26,15,7,C.skin);
  g+=d.g(d.r(-9,-40,18,50,9,C.skin),"translate(100 92) rotate(20)")+d.e(76,80,12,26,C.skin,O,40);
  for(let i=0;i<7;i++){const a=-Math.PI*0.95+i*Math.PI*0.3/1.0*0.5;g+=d.l(`M${(90+Math.cos(a)*30).toFixed(1)} ${(52+Math.sin(a)*30).toFixed(1)} L${(90+Math.cos(a)*46).toFixed(1)} ${(52+Math.sin(a)*46).toFixed(1)}`,C.orange,5);}
  return g+d.sparkle(150,40,12)+d.sparkle(40,90,9);},
/* JS5 unit 8 people */
"hero":()=>d.r(0,0,200,200,0,"#e8f4ff",null)+ground("#cfe0f0")+d.p("M76 100 Q50 150 40 186 L160 186 Q150 150 124 100Z",C.red)+kid(100,188,{s:0.95,shirt:C.blue,pants:C.blue2,arm:"both",mood:"grin"})+d.star(100,128,13,C.gold,O,3)+d.sparkle(30,40,12)+d.sparkle(170,36,10),
"he":()=>ground("#eef0e6")+'<g opacity=".3">'+kid(140,186,{s:0.85,shirt:C.pink,arm:"down",mood:"smile",girl:true})+"</g>"+kid(62,186,{s:0.85,shirt:C.blue,arm:"down",mood:"smile"})+d.p("M50 8 L74 8 L74 20 L84 20 L62 38 L40 20 L50 20Z",C.gold,O,3),
"she":()=>ground("#eef0e6")+'<g opacity=".3">'+kid(62,186,{s:0.85,shirt:C.blue,arm:"down",mood:"smile"})+"</g>"+kid(140,186,{s:0.85,shirt:C.pink,arm:"down",mood:"smile",girl:true})+d.p("M128 8 L152 8 L152 20 L162 20 L140 38 L118 20 L128 20Z",C.gold,O,3),
"good at":()=>d.r(0,0,200,200,0,"#fff7df",null)+ground("#f3e3b8")+kid(100,190,{s:0.95,shirt:C.green,arm:"up",mood:"grin"})+d.l("M88 108 L100 128 L112 108",C.red,4)+d.c(100,136,10,C.gold,O,3)+d.star(100,136,5,"#fff",null)+d.sparkle(40,50,12)+d.sparkle(160,40,10)+d.sparkle(40,130,8),
"kind":()=>ground("#dfe8ef")+d.l("M10 20 L4 34 M30 50 L24 64 M180 20 L174 34 M190 60 L184 74 M14 100 L8 114 M186 110 L180 124","#6aa8e8",3)+
  kid(64,188,{s:0.85,shirt:C.green,arm:"up",mood:"smile"})+kid(140,188,{s:0.85,shirt:C.pink,arm:"down",mood:"open",girl:true})+d.l("M97 77 L104 72 L104 54",O,4)+d.p("M36 56 Q104 -10 172 56 Q155 46 138 56 Q121 46 104 56 Q87 46 70 56 Q53 46 36 56Z",C.red),
"strong":()=>ground("#e6e0ea")+kid(100,190,{s:0.9,shirt:C.red,arm:"both",mood:"grin"})+d.l("M28 76 L172 76",O,6)+d.r(22,52,14,48,4,"#3a3f50")+d.r(10,58,12,36,4,"#3a3f50")+d.r(164,52,14,48,4,"#3a3f50")+d.r(178,58,12,36,4,"#3a3f50")+d.c(64,77,7,C.skin)+d.c(136,77,7,C.skin)+d.p("M150 112 Q146 122 150 126 Q154 122 150 112Z","#a8dcff",O,2),
"brave":()=>d.r(0,0,200,200,0,"#efe8f6",null)+ground("#d8cfe2")+d.p("M6 186 Q0 80 50 60 Q90 44 100 100 L100 186Z","#6a4f8a")+d.e(38,92,8,5,"#ffe14d",O,20,2)+d.e(70,90,8,5,"#ffe14d",O,-20,2)+d.p("M34 120 L44 112 L52 122 L60 112 L68 122 L76 114 L80 126Z","#fff",O,2)+
  kid(140,190,{s:0.95,shirt:C.blue,arm:"up",mood:"flat"})+d.l("M118 64 L130 70 M122 52 L132 62",O,3),
"father":()=>ground("#e6eef4")+adult(76,192,{s:0.82,coat:C.blue,tie:C.red,armR:"down",mood:"smile",hair:"#3a2a20"})+me(150,190),
"mother":()=>ground("#f6e8ee")+adult(76,192,{s:0.82,coat:C.pink,girl:true,skirt:"#6a6fa8",armR:"down",mood:"smile",hair:"#6b3f22"})+me(150,190),
"brother":()=>ground("#e8f0e4")+kid(76,190,{s:1.05,shirt:C.green,arm:"down",mood:"open"})+me(150,190),
"sister":()=>ground("#f6eaf2")+kid(76,190,{s:1.05,shirt:C.pink,arm:"down",mood:"open",girl:true,hair:"#6b3f22"})+me(150,190),
"grandfather":()=>ground("#efe8dc")+adult(76,192,{s:0.8,coat:"#8a6a4a",grey:true,glasses:true,beard:true,armR:"down",mood:"smile",extra:d.l("M34 -64 L40 -2",C.brown,5)+d.l("M34 -64 Q36 -76 46 -72",C.brown,5)})+me(150,190),
"grandmother":()=>ground("#f2e8f2")+adult(76,192,{s:0.8,coat:C.purple,girl:true,skirt:"#7d6a9a",grey:true,bun:true,glasses:true,armR:"down",mood:"smile"})+me(150,190)
});
PIC["fire fighter"]&&(PIC["firefighter"]=PIC["fire fighter"]);
PIC["badminton"]=PIC["play badminton"];PIC["judo"]=PIC["do judo"];PIC["kendo"]=PIC["do kendo"];PIC["guitar"]=()=>d.shadow(100,190,40)+guitar(100,128,1.2,-20);
PIC["singing"]=PIC["sing"];PIC["cooking"]=PIC["cook"];PIC["dancing"]=PIC["dance"];PIC["recorder"]=()=>d.shadow(100,190,30)+d.g(d.r(-7,-80,14,150,7,"#fff4dc")+d.r(-10,62,20,14,5,"#fff4dc")+[-50,-30,-10,10,30].map(y=>d.c(0,y,3.5,O,null)).join(""),"translate(100 110) rotate(30)");

/* ---------- Junior Sunshine 6 ---------- */
/* flags: 150 x 100 at (25,50), with a pole on the left */
const flagBox=(inner,id)=>d.shadow(100,184,70)+d.r(14,40,8,150,3,"#b8a07a")+d.c(18,38,6,C.gold)+`<clipPath id="fc-${id}"><rect x="25" y="50" width="150" height="100"/></clipPath><g clip-path="url(#fc-${id})">${inner}</g>`+d.r(25,50,150,100,0,"none",O,4);
const ukJack=(x,y,w,h)=>{const L=`M${x} ${y} L${x+w} ${y+h} M${x+w} ${y} L${x} ${y+h}`;return d.r(x,y,w,h,0,"#1f3f8f",null)+d.l(L,"#fff",h*0.2)+d.l(L,"#d22a2a",h*0.07)+d.l(`M${x+w/2} ${y} L${x+w/2} ${y+h} M${x} ${y+h/2} L${x+w} ${y+h/2}`,"#fff",h*0.33)+d.l(`M${x+w/2} ${y} L${x+w/2} ${y+h} M${x} ${y+h/2} L${x+w} ${y+h/2}`,"#d22a2a",h*0.2);};
const wstar=(x,y,r,f)=>d.star(x,y,r,f||"#fff",null);
const FLAG={
  "japan":()=>d.r(25,50,150,100,0,"#fff",null)+d.c(100,100,30,"#d22a2a",null),
  "singapore":()=>d.r(25,50,150,50,0,"#e3262f",null)+d.r(25,100,150,50,0,"#fff",null)+d.c(50,75,15,"#fff",null)+d.c(56,75,14,"#e3262f",null)+[[66,64],[74,70],[71,80],[61,80],[58,70]].map(([x,y])=>wstar(x,y,3.5)).join(""),
  "the u.s.a.":()=>{let g="";for(let i=0;i<13;i++)g+=d.r(25,50+i*100/13,150,100/13+0.5,0,i%2?"#fff":"#c8283a",null);g+=d.r(25,50,64,54,0,"#2b3a7a",null);for(let r=0;r<5;r++)for(let c=0;c<6;c++)g+=wstar(32+c*10+(r%2)*5,57+r*10,3);return g;},
  "the u.k.":()=>ukJack(25,50,150,100),
  "france":()=>d.r(25,50,50,100,0,"#1f4fa8",null)+d.r(75,50,50,100,0,"#fff",null)+d.r(125,50,50,100,0,"#e3262f",null),
  "finland":()=>d.r(25,50,150,100,0,"#fff",null)+d.r(65,50,24,100,0,"#1f4fa8",null)+d.r(25,88,150,24,0,"#1f4fa8",null),
  "china":()=>d.r(25,50,150,100,0,"#de2910",null)+wstar(52,76,15,"#ffde00")+wstar(76,58,5,"#ffde00")+wstar(84,68,5,"#ffde00")+wstar(84,82,5,"#ffde00")+wstar(76,92,5,"#ffde00"),
  "italy":()=>d.r(25,50,50,100,0,"#169b47",null)+d.r(75,50,50,100,0,"#fff",null)+d.r(125,50,50,100,0,"#d22a2a",null),
  "kenya":()=>d.r(25,50,150,100,0,"#fff",null)+d.r(25,50,150,30,0,"#1a1a1a",null)+d.r(25,86,150,28,0,"#bb1d2a",null)+d.r(25,120,150,30,0,"#1f7a3a",null)+d.e(100,100,15,36,"#bb1d2a",O,0,3)+d.e(100,100,6,30,"#1a1a1a",null)+d.l("M86 70 L114 130 M114 70 L86 130","#fff",3),
  "korea":()=>d.r(25,50,150,100,0,"#fff",null)+d.p("M76 100 A24 24 0 0 1 124 100 A12 12 0 0 1 100 100 A12 12 0 0 0 76 100Z","#cd2e3a",null)+d.p("M76 100 A24 24 0 0 0 124 100 A12 12 0 0 1 100 100 A12 12 0 0 0 76 100Z","#0047a0",null)+
    [[46,66,-34],[154,66,34],[46,134,34],[154,134,-34]].map(([x,y,r])=>d.g(d.r(-12,-9,24,4,0,O,null)+d.r(-12,-2,24,4,0,O,null)+d.r(-12,5,24,4,0,O,null),`translate(${x} ${y}) rotate(${r})`)).join(""),
  "australia":()=>d.r(25,50,150,100,0,"#1f3f8f",null)+ukJack(25,50,75,50)+wstar(62,124,12)+wstar(140,70,6)+wstar(124,100,6)+wstar(158,96,6)+wstar(140,134,7)+wstar(150,112,3),
  "brazil":()=>d.r(25,50,150,100,0,"#169b47",null)+d.poly("100,60 165,100 100,140 35,100","#fedf00",null)+d.c(100,100,26,"#1f3f8f",null)+d.p("M76 94 Q100 88 124 104","none","#fff",5),
  "egypt":()=>d.r(25,50,150,34,0,"#ce1126",null)+d.r(25,84,150,32,0,"#fff",null)+d.r(25,116,150,34,0,"#1a1a1a",null)+d.p("M100 88 L108 96 L118 92 L112 106 L100 112 L88 106 L82 92 L92 96Z","#c09300",null)
};
Object.keys(FLAG).forEach(k=>{PIC[k]=()=>flagBox(FLAG[k](),k.replace(/[^a-z]/g,""));});
/* a week of check marks: n of 7 days */
function week(n,col){let g=d.r(8,46,184,108,12,"#fff");const days=["S","M","T","W","T","F","S"],on=[[],[3],[1,4],[1,3,5],[1,2,4,5],[1,2,3,4,5],[0,1,2,3,4,5],[0,1,2,3,4,5,6]][n];
  days.forEach((t,i)=>{const x=24+i*25.3;g+=d.t(x,72,t,16,C.grey2,800)+d.r(x-10,84,20,20,4,"#f4f1ea",O,2)+(on.indexOf(i)>=0?d.l(`M${x-7} ${94} L${x-2} ${100} L${x+8} ${86}`,col,4):(n===0?d.l(`M${x-6} 88 L${x+6} 100 M${x+6} 88 L${x-6} 100`,C.red,3):""));});
  g+=d.r(24,120,152,18,9,"#eee")+(n?d.r(24,120,152*n/7,18,9,col,null):"")+d.r(24,120,152,18,9,"none");return g+d.t(100,30,n===7?"7/7":n+"/7",22,col,800);}
/* a small "yesterday" mark for past-tense verbs: calendar page with an arrow going back */
const past=(x,y)=>d.g(d.r(-20,-18,40,38,5,"#fff")+d.r(-20,-18,40,11,5,C.red)+d.r(-20,-10,40,3,0,C.red,null)+d.l("M10 10 Q0 -2 -10 8",C.blue2,3)+d.p("M-14 4 L-10 12 L-4 6Z",C.blue2,null),`translate(${x} ${y})`);
/* three team-mates in the same shirt, and the team's thing above them */
const team=(shirt,item,pants)=>d.r(0,0,200,200,0,"#f4f7fb",null)+d.r(0,166,200,34,0,"#dfe6ee",null)+[40,160,100].map((x,i)=>kid(x,190,{s:0.6,shirt,pants:pants||"#4a4f6b",arm:i===2?"both":"down",mood:i===2?"grin":"open",girl:i===1})).join("")+item;
const lantern=(x,y,s)=>d.g(d.l("M0 -26 L0 -18",O,3)+d.e(0,0,16,20,C.red)+d.l("M-15 -6 L15 -6 M-15 6 L15 6",C.red2,2)+d.r(-8,-22,16,5,1,O,null)+d.r(-8,18,16,5,1,O,null),`translate(${x} ${y}) scale(${s||1})`);
const torii=(x,y,s)=>d.g(d.r(-46,-60,10,64,2,"#e0402a")+d.r(36,-60,10,64,2,"#e0402a")+d.r(-50,-46,100,8,2,"#e0402a")+d.p("M-62 -70 Q0 -62 62 -70 L58 -60 Q0 -54 -58 -60Z",O,null)+d.p("M-58 -64 Q0 -56 58 -64 L56 -58 Q0 -52 -56 -58Z","#e0402a",null),`translate(${x} ${y}) scale(${s||1})`);
const tent=(x,y,s,f)=>d.g(d.p("M-50 0 L0 -60 L50 0Z",f||C.orange)+d.p("M-14 0 L0 -36 L14 0Z","#5a3a20")+d.l("M0 -60 L0 -70",O,3),`translate(${x} ${y}) scale(${s||1})`);
const fire=(x,y,s)=>d.g(d.l("M-16 4 L16 -4 M-16 -4 L16 4",C.brown2,6)+d.p("M0 -34 Q16 -16 10 0 L-10 0 Q-16 -16 0 -34Z",C.orange)+d.p("M0 -18 Q7 -8 4 0 L-4 0 Q-7 -8 0 -18Z",C.yellow,null),`translate(${x} ${y}) scale(${s||1})`);
const bus=(x,y,s,f)=>d.g(d.r(-60,-46,120,52,10,f||"#3fae6a")+d.r(-52,-38,22,18,3,"#cfeeff")+d.r(-24,-38,22,18,3,"#cfeeff")+d.r(4,-38,22,18,3,"#cfeeff")+d.r(32,-38,20,30,3,"#cfeeff")+d.c(-36,8,10,"#3a3f50")+d.c(36,8,10,"#3a3f50")+d.l("M-60 -12 L28 -12","#fff",4),`translate(${x} ${y}) scale(${s||1})`);
const pagoda=(x,y,s)=>{let g=d.r(-10,-140,4,0,0,"none");for(let i=0;i<5;i++){const yy=-i*24,w=46-i*6;g+=d.r(-w*0.55,yy-20,w*1.1,20,0,"#c0502a")+d.p(`M${-w} ${yy-16} Q0 ${yy-26} ${w} ${yy-16} L${w*0.8} ${yy-26} Q0 ${yy-34} ${-w*0.8} ${yy-26}Z`,"#3a3f50");}return d.g(g+d.l("M0 -124 L0 -150",O,4)+d.c(0,-140,3,C.gold,null)+d.c(0,-132,3,C.gold,null),`translate(${x} ${y}) scale(${s||1})`);};
const bigHead=(mood,extra)=>d.shadow(100,190,60)+d.r(68,150,64,40,16,C.blue)+headFace(100,100,56,{mood})+(extra||"");
Object.assign(PIC,{
"glove":()=>d.shadow(100,186,64)+d.p("M44 150 Q20 100 40 60 Q58 30 96 32 Q140 30 158 64 Q176 104 150 150 Q100 176 44 150Z","#c98a4a")+d.p("M60 140 Q46 104 60 74 Q76 54 100 56 Q128 56 140 80 Q152 108 138 140 Q100 156 60 140Z","#a8692f")+d.l("M70 64 L64 40 M96 56 L96 32 M124 60 L134 38 M150 90 L172 84",O,3)+d.l("M80 80 L120 80 M78 100 L122 100 M82 120 L118 120",C.brown2,2)+d.c(130,118,14,"#fff",O,3)+d.l("M122 108 Q130 118 122 128",C.red,2),
/* seasons */
"spring":()=>d.r(8,8,184,184,14,"#e8f6ff",null)+d.r(8,146,184,46,0,"#a8dc8a",null)+d.l("M100 186 L100 110 M100 130 L76 104 M100 120 L128 98",C.brown,10)+[[70,80,34],[100,66,40],[134,82,34],[100,100,30]].map(([x,y,r])=>d.c(x,y,r,"#ffc4d6")).join("")+sakura(70,70,14)+sakura(124,64,14)+sakura(98,100,14)+sakura(40,150,10)+sakura(166,160,10)+sunIcon(164,34,10),
"summer":()=>d.r(8,8,184,184,14,"#bfe7ff",null)+sunIcon(56,52,24)+d.r(8,150,184,42,0,"#7cc46a",null)+d.l("M140 186 L140 106",C.green2,6)+d.e(126,140,14,6,C.leaf,O,-30,3)+[0,1,2,3,4,5,6,7,8,9].map(i=>{const a=i*Math.PI/5;return d.e(140+Math.cos(a)*24,86+Math.sin(a)*24,13,6,C.yellow,O,a*180/Math.PI,2.5);}).join("")+d.c(140,86,15,"#7a4a20"),
"fall":()=>d.r(8,8,184,184,14,"#fff1d9",null)+d.r(8,150,184,42,0,"#e3c08a",null)+d.l("M100 186 L100 110 M100 130 L76 106 M100 120 L128 100",C.brown,10)+[[70,82,34,"#ff9a3c"],[130,84,34,"#e8483f"],[100,66,40,"#ffb52e"],[100,100,28,"#e8603a"]].map(([x,y,r,f])=>d.c(x,y,r,f)).join("")+leafMaple(40,140,12,C.red)+leafMaple(160,130,10,C.orange)+leafMaple(150,172,9,C.red)+leafMaple(60,176,8,C.orange),
"winter":()=>d.r(8,8,184,184,14,"#d9e4f2",null)+d.r(8,146,184,46,0,"#fff",null)+d.c(100,140,34,"#fff")+d.c(100,88,24,"#fff")+d.c(92,84,3,O,null)+d.c(108,84,3,O,null)+d.p("M100 90 L114 94 L100 96Z",C.orange,O,2)+d.r(84,60,32,8,2,C.red)+d.r(90,44,20,18,2,C.red)+d.l("M70 126 L44 108 M130 126 L156 108",C.brown,4)+[[30,30],[60,50],[150,30],[176,60],[30,100],[170,110],[120,30]].map(([x,y])=>d.c(x,y,4,"#fff",O,2)).join(""),
/* Japan */
"festival":()=>d.r(8,8,184,184,14,"#2c3566",null)+d.l("M8 40 Q100 70 192 40",O,2)+lantern(40,62,0.8)+lantern(100,74,0.8)+lantern(160,62,0.8)+d.r(30,110,140,70,4,"#fff6e0")+d.p("M20 112 L180 112 L170 92 L30 92Z",C.red)+d.l("M50 92 L50 112 M90 92 L90 112 M130 92 L130 112",C.red2,2)+d.r(30,150,140,30,0,"#c98d4e")+d.t(100,140,"まつり",22,C.red,800),
"fireworks":()=>d.r(8,8,184,184,14,"#1d2350",null)+firework(64,64,40,C.pink)+firework(140,52,30,C.yellow)+firework(134,120,24,"#7be0ff")+d.r(8,160,184,32,0,"#11163a",null)+d.p("M8 170 L40 150 L60 166 L90 146 L130 168 L170 150 L192 166 L192 192 L8 192Z","#0c1030",null),
"hanami":()=>d.r(8,8,184,184,14,"#e8f6ff",null)+d.r(8,130,184,62,0,"#a8dc8a",null)+d.l("M150 150 L150 70 M150 100 L124 80",C.brown,10)+[[150,50,36],[120,70,28],[176,74,22]].map(([x,y,r])=>d.c(x,y,r,"#ffc4d6")).join("")+sakura(150,44,12)+sakura(124,68,10)+
  d.p("M14 160 L120 150 L134 186 L20 192Z","#4a8fe8")+d.r(50,148,40,24,4,C.red)+d.r(54,152,14,8,1,"#fff",null)+d.r(72,152,14,8,1,C.yellow,null)+kid(36,158,{s:0.5,shirt:C.yellow,arm:"wave",mood:"open"})+kid(104,158,{s:0.5,shirt:C.green,arm:"down",mood:"smile"})+sakura(40,40,8)+sakura(80,100,7),
"osechi":()=>d.shadow(100,190,80)+d.r(30,120,140,56,6,"#2a2630")+d.r(30,120,140,8,0,C.red,null)+d.r(24,60,152,70,8,"#2a2630")+d.r(32,68,136,54,4,C.red2)+d.l("M77 68 L77 122 M122 68 L122 122 M32 95 L168 95",C.gold,3)+
  d.c(54,82,8,C.yellow)+d.c(66,84,6,C.yellow)+d.e(100,82,14,7,C.pink,O,0,2)+d.e(144,82,12,8,"#3a2a20")+d.c(154,82,5,"#3a2a20",O,2)+d.e(54,108,14,7,C.orange)+d.e(100,108,14,8,"#fff",O,0,2)+d.l("M92 108 L108 108",C.pink,3)+d.c(140,108,7,C.green)+d.c(152,110,6,C.green),
"kashiwamochi":()=>d.shadow(100,184,70)+plate(170,70)+d.p("M30 150 Q20 90 70 70 Q120 54 160 80 Q190 110 170 150Z",C.leaf)+d.l("M40 140 Q100 70 166 90",C.green2,3)+d.l("M70 110 L60 86 M100 92 L96 70 M130 88 L134 70",C.green2,2)+d.p("M44 150 Q40 110 90 100 Q150 96 160 140 Q120 170 44 150Z","#fbf6ee")+d.shine(90,120,22,6,-10),
"soba":()=>d.shadow(100,186,80)+d.r(20,96,130,74,6,"#e7cf8e")+d.l("M30 104 L30 160 M50 104 L50 160 M70 104 L70 160 M90 104 L90 160 M110 104 L110 160 M130 104 L130 160","#c9ae6a",2)+
  d.p("M34 130 Q50 90 74 120 Q90 90 108 122 Q124 96 140 126 Q120 150 90 146 Q60 152 34 130Z","#9a8466")+d.l("M44 126 Q58 100 72 126 M82 126 Q96 100 110 126 M100 136 Q116 110 130 132","#7a6448",2)+d.e(160,148,24,10,"#2a2630")+d.p("M136 148 L140 178 L180 178 L184 148Z","#2a2630")+d.e(160,148,18,6,"#5a3a20",null)+d.l("M100 56 L186 96 M108 50 L190 88",C.brown,4),
"okonomiyaki":()=>d.r(10,130,180,60,6,"#3a3f50")+d.e(100,120,78,40,"#d9a056")+d.e(100,116,66,32,"#7a3a18",null)+d.l("M44 104 Q56 96 64 108 Q76 96 86 108 Q98 96 110 108 Q122 96 132 108 Q144 96 156 108",C.cream,4)+d.l("M48 124 Q60 116 70 128 Q82 116 94 128 Q106 116 118 128 Q130 116 144 128",C.cream,4)+[[70,112],[100,104],[130,118],[90,128],[120,128]].map(([x,y])=>d.c(x,y,2.5,C.leaf,null)).join("")+d.g(d.r(-20,-6,40,12,2,C.grey)+d.r(18,-3,30,6,3,C.brown),"translate(150 72) rotate(-20)"),
"mango":()=>d.shadow(100,186,56)+d.p("M60 70 Q110 40 150 90 Q176 140 130 170 Q80 190 56 150 Q40 110 60 70Z","#ffb02e")+d.p("M60 70 Q110 40 150 90 Q130 70 100 74 Q70 80 60 70Z","#e8483f",null)+d.p("M60 70 Q110 40 150 90 Q176 140 130 170 Q80 190 56 150 Q40 110 60 70Z","none")+d.shine(84,96,10,20,20)+d.l("M70 64 L64 50",C.brown,4)+d.e(84,44,20,8,C.leaf,O,-20,3),
"sumo":()=>d.r(0,140,200,60,0,"#e9d6b0",null)+d.e(100,170,90,22,"none","#c9a36a",0,6)+d.g(d.r(-30,-40,22,44,10,C.skin)+d.r(8,-40,22,44,10,C.skin)+d.e(-19,-1,14,6,C.skin)+d.e(19,-1,14,6,C.skin)+d.e(0,-86,52,56,C.skin)+d.p("M-50 -64 Q0 -48 50 -64 L50 -46 Q30 -38 10 -40 L0 -20 L-10 -40 Q-30 -38 -50 -46Z","#3a3f6a")+d.l("M-52 -96 L-74 -60 M52 -96 L74 -60",O,18)+d.l("M-52 -96 L-74 -60 M52 -96 L74 -60",C.skin,11)+headFace(0,-148,26,{mood:"flat",hair:"#1a1a1a"})+d.e(0,-178,12,7,"#1a1a1a"),"translate(100 186) scale(.9)"),
"kabuki":()=>d.r(8,8,184,184,14,"#3a2a20",null)+d.p("M44 120 Q30 40 100 30 Q170 40 156 120Z","#1a1a1a")+d.c(100,110,56,"#fdfaf4")+d.p("M44 90 Q60 50 100 52 Q140 50 156 90 Q140 70 100 70 Q60 70 44 90Z","#1a1a1a")+d.e(100,36,16,14,"#1a1a1a")+
  d.l("M60 96 Q72 80 90 92 M140 96 Q128 80 110 92",C.red,6)+d.l("M70 104 L88 106 M130 104 L112 106",O,5)+d.l("M56 120 Q66 140 64 158 M144 120 Q134 140 136 158",C.red,6)+d.p("M84 140 Q100 132 116 140 Q100 152 84 140Z",C.red,O,3),
"shrine":()=>d.r(0,0,200,200,0,"#eaf4ff",null)+d.r(0,160,200,40,0,"#d9cfbf",null)+d.r(64,96,72,62,0,"#fff6e0")+d.p("M50 98 Q100 76 150 98 L140 84 Q100 66 60 84Z","#5a6070")+d.r(88,118,24,40,0,"#c98d4e")+torii(100,184,1.3),
"castle":()=>d.r(8,8,184,184,14,"#d7efff",null)+d.p("M30 186 L44 140 L156 140 L170 186Z","#9a948a")+d.l("M50 158 L150 158 M40 172 L160 172 M70 140 L66 186 M100 140 L100 186 M130 140 L134 186","#7a746a",2)+
  d.r(50,114,100,28,0,"#fff")+d.p("M36 118 Q100 104 164 118 L150 104 Q100 92 50 104Z","#3a4250")+d.r(62,84,76,22,0,"#fff")+d.p("M48 88 Q100 76 152 88 L140 74 Q100 64 60 74Z","#3a4250")+d.r(74,54,52,22,0,"#fff")+d.p("M60 58 Q100 46 140 58 L124 40 Q100 32 76 40Z","#3a4250")+
  d.r(70,120,10,12,0,"#3a4250",null)+d.r(95,120,10,12,0,"#3a4250",null)+d.r(120,120,10,12,0,"#3a4250",null)+d.r(80,88,10,10,0,"#3a4250",null)+d.r(110,88,10,10,0,"#3a4250",null)+d.c(76,38,4,C.gold)+d.c(124,38,4,C.gold),
"mountain":()=>d.r(8,8,184,184,14,"#d7efff",null)+d.p("M8 170 L70 70 L110 130 L140 90 L192 170Z","#6fae5a")+d.p("M54 96 L70 70 L86 96 L78 92 L70 100 L62 92Z","#fff",O,3)+d.p("M130 104 L140 90 L150 104 L144 102 L140 108 L136 102Z","#fff",O,3)+d.r(8,166,184,26,0,"#9fd17a",null)+cloud(160,44,0.4),
"beautiful":()=>d.r(8,8,184,184,14,"#f2f8ff",null)+[[42,"#e8483f"],[52,"#ff9a3c"],[62,"#ffd23f"],[72,"#55b84a"],[82,"#4a8fe8"],[92,"#9b6be0"]].map(([r,f])=>d.p(`M${100-r} 130 A${r} ${r} 0 0 1 ${100+r} 130`,"none",f,9)).join("")+d.r(8,130,184,62,0,"#a8dc8a",null)+
  [[40,160,C.pink],[70,176,C.yellow],[130,170,C.red],[164,158,C.purple],[100,154,C.pink]].map(([x,y,f])=>d.l(`M${x} ${y} L${x} ${y+16}`,C.green2,3)+sakura(x,y,16).replace(/#ffc4d6/g,f)).join("")+d.sparkle(30,40,10)+d.sparkle(172,44,12)+d.sparkle(100,24,8),
"delicious":()=>bigHead("grin",d.p("M112 124 Q126 128 128 116 Q120 112 112 124Z",C.pink,O,2.5)+d.heart(30,50,12,C.pink)+d.heart(170,44,14,C.pink)+d.g(d.p("M0 0 L50 -14 L50 14Z",C.cream)+d.r(-2,0,52,14,0,"#fff6e0")+d.l("M2 6 L48 6",C.pink,4)+d.c(20,-12,6,C.red),"translate(130 150) rotate(-10)")),
"sweet":()=>d.r(8,8,184,184,14,"#fff0f6",null)+d.l("M70 110 L70 186",C.cream,8)+d.l("M70 110 L70 186",O,1)+d.c(70,82,36,C.pink)+d.p("M70 82 m-26 0 a26 26 0 1 1 26 26 a18 18 0 1 1 -18 -18 a10 10 0 1 1 10 10","none","#fff",5)+
  d.g(d.p("M-30 -14 L-50 -26 L-50 26 L-30 14Z",C.yellow)+d.p("M30 -14 L50 -26 L50 26 L30 14Z",C.yellow)+d.e(0,0,32,20,C.orange)+d.l("M-14 -18 L-4 18 M6 -18 L16 18",C.yellow,4),"translate(140 140) rotate(-20)")+d.sparkle(150,50,10)+d.sparkle(30,150,8)+d.sparkle(120,90,6),
"nice":()=>d.r(8,8,184,184,14,"#eaf7e8",null)+d.r(60,96,72,70,20,C.skin)+d.r(124,104,26,16,8,C.skin)+d.r(124,120,26,16,8,C.skin)+d.r(122,136,24,16,8,C.skin)+d.r(64,36,26,74,13,C.skin)+d.r(56,160,80,30,4,C.blue)+d.sparkle(150,46,14)+d.sparkle(40,80,9)+d.sparkle(170,96,8),
"exciting":()=>d.r(8,8,184,184,14,"#d7efff",null)+d.l("M8 150 Q40 40 80 60 Q110 80 120 150 Q140 190 192 70","#e8483f",6)+d.l("M8 162 Q40 52 80 72 Q110 92 120 162 Q140 202 192 82","#e8483f",6)+d.l("M30 150 L30 190 M70 70 L70 190 M110 120 L110 190 M160 140 L160 190",C.grey2,4)+
  d.g(d.r(-30,-14,60,24,8,C.yellow)+headFace(-14,-26,12,{mood:"grin"})+headFace(14,-26,12,{mood:"grin",girl:true})+d.l("M-22 -38 L-28 -56 M-6 -38 L-2 -56 M6 -38 L2 -56 M22 -38 L28 -56",C.skin,5),"translate(70 72) rotate(16)")+d.t(150,40,"!!",34,C.red,800),
"fantastic":()=>d.r(8,8,184,184,14,"#2c2a5a",null)+[[30,30],[170,40],[150,150],[40,160],[100,26],[176,110]].map(([x,y],i)=>d.sparkle(x,y,6+i%3*3,[C.gold,C.pink,"#7be0ff"][i%3])).join("")+d.g(d.r(-5,0,10,90,4,"#c98d4e"),"translate(80 110) rotate(-30)")+d.star(110,70,30,C.gold,O,4)+d.l("M86 98 Q60 120 40 120 M92 104 Q80 140 56 150",C.pink,4)+d.c(40,120,4,C.pink,null)+d.c(56,150,4,"#7be0ff",null),
"fun":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(8,166,184,26,0,"#a8dc8a",null)+d.p("M40 60 L150 160 L170 160 L60 60Z",C.yellow)+d.l("M40 60 L40 186 M60 60 L60 186",C.grey2,5)+d.l("M30 60 L30 186",C.grey2,5)+d.l("M30 80 L40 80 M30 110 L40 110 M30 140 L40 140",C.grey2,3)+d.g(kid(0,0,{s:0.6,shirt:C.red,arm:"both",mood:"grin"}),"translate(104 128) rotate(-40)")+d.sparkle(160,50,10)+d.sparkle(140,90,7),
/* daily life */
"study":()=>desk(d.r(60,130,80,16,2,"#fff")+d.l("M70 136 L130 136 M70 141 L120 141","#9a948a",2)+d.r(150,112,40,8,2,C.red)+d.r(152,120,38,8,2,C.blue)+d.r(148,128,42,8,2,C.green)+d.r(150,136,40,10,2,C.yellow),
  kid(100,200,{s:0.95,shirt:C.blue,arm:"down",mood:"flat"})+"")+d.g(d.r(-3,-30,6,34,2,C.yellow)+d.p("M-3 4 L0 12 L3 4Z",C.cream),"translate(118 132) rotate(30)")+d.c(118,130,7,C.skin),
"play with my friends":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(8,150,184,42,0,"#a8dc8a",null)+kid(44,188,{s:0.68,shirt:C.red,arm:"both",mood:"grin"})+kid(100,180,{s:0.68,shirt:C.yellow,arm:"both",mood:"grin",girl:true})+kid(156,188,{s:0.68,shirt:C.blue,arm:"both",mood:"grin"})+d.c(100,40,14,"#fff")+d.l("M90 34 Q100 40 90 46 M110 34 Q100 40 110 46",C.red,3),
"swimming club":()=>team(C.blue,d.r(30,10,140,56,8,"#7cc4ff")+d.l("M30 30 L170 30 M30 48 L170 48","#fff",3)+d.l("M30 30 L170 30 M30 48 L170 48",C.red,1.5)+d.p("M60 22 Q70 14 80 22 M110 40 Q120 32 130 40",null,O,3)+headFace(82,22,8,{mood:"smile"})+headFace(132,40,8,{mood:"smile"}),C.blue2),
"clean my room":()=>room("#fff6e6","#d9c9b0",kid(76,180,{s:0.8,shirt:C.green,arm:"down",mood:"smile"})+d.l("M102 146 L136 172",C.grey2,5)+d.r(130,162,40,18,6,C.red)+d.c(140,182,5,O,null)+d.c(162,182,5,O,null)+d.r(132,40,40,40,2,"#fff")+d.sparkle(40,60,10)+d.sparkle(170,110,8)),
"go to bed":()=>d.r(8,8,184,184,14,"#2c3566",null)+d.r(120,24,56,48,4,"#4a5a96")+moon(148,48,12)+d.r(20,110,160,50,10,"#8fb5ff")+d.r(18,90,14,90,4,"#c98d4e")+d.r(168,110,14,70,4,"#c98d4e")+d.e(54,108,22,12,"#fff")+headFace(56,100,20,{mood:"flat"})+d.l("M44 102 L52 102 M60 102 L68 102",O,3)+
  d.p("M64 112 Q120 96 176 112 L176 150 L64 150Z","#cfe0ff")+d.t(90,64,"Z",26,"#fff",800)+d.t(106,44,"z",18,"#fff",800),
"walk my dog":()=>d.r(0,160,200,40,0,"#cfeac0",null)+kid(64,188,{s:0.85,shirt:C.orange,arm:"down",mood:"open"})+d.l("M90 154 Q120 150 138 146",C.red,3)+d.g(PIC.dog(),"translate(110 100) scale(.45)"),
"always":()=>week(7,C.green),"usually":()=>week(5,C.blue),"sometimes":()=>week(2,C.orange),"never":()=>week(0,C.red),
"pancakes":()=>d.shadow(100,184,70)+plate(170,76)+[0,1,2,3].map(i=>d.e(100,156-i*18,58,14,"#e3a35a")+d.e(100,152-i*18,56,10,"#f1c27a",null)).join("")+d.r(86,90,28,16,3,"#fff2a8")+d.p("M60 102 Q80 96 100 98 Q120 96 142 102 L146 130 Q140 140 136 124 L132 116 Q120 110 100 112 Q80 110 66 116 Q60 140 56 122Z","#b8641e",null),
"natto":()=>d.shadow(100,186,70)+d.p("M30 110 Q34 170 100 172 Q166 170 170 110Z","#fff")+d.e(100,110,70,18,"#c9a066")+[[70,106],[86,112],[104,104],[120,112],[136,106],[94,100],[114,98],[80,100]].map(([x,y])=>d.e(x,y,8,6,"#8a5a20",O,0,2)).join("")+d.l("M70 100 Q90 60 100 40 M110 100 Q120 70 140 50 M90 104 Q110 70 120 46","#fff8",2)+d.l("M150 30 L100 96 M162 34 L112 100",C.brown,5),
"eat lunch":()=>d.r(8,8,184,184,14,"#fffbe9",null)+clock(166,40,22,12,0)+d.r(10,130,180,60,6,"#c98d4e")+kid(100,154,{s:0.8,shirt:"#fff",arm:"down",mood:"open"})+d.r(36,124,128,46,6,"#d9e4ef")+d.c(70,146,16,"#fff")+d.c(110,146,16,"#e8a050")+d.r(132,132,24,30,3,"#fff")+d.r(132,138,24,6,0,C.blue,null),
"get up":()=>PIC["wake up"](),"eat breakfast":()=>PIC["have breakfast"](),"do my homework":()=>PIC["homework"](),"eat dinner":()=>PIC["dinner"](),"take a bath":()=>PIC["bath"](),
/* summer vacation, past tense */
"went":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.p("M8 140 Q60 120 192 130 L192 192 L8 192Z","#a8dc8a",null)+d.p("M80 192 Q110 150 150 130 L162 132 Q130 156 120 192Z","#e9d6b0",null)+d.p("M120 120 L160 60 L192 110 L192 130Z","#6fae5a")+d.g(kid(0,0,{s:0.7,shirt:C.red,arm:"down",mood:"open"})+d.r(-30,-86,16,40,6,C.blue),"translate(76 186) rotate(4)")+past(36,40),
"enjoyed":()=>d.r(8,8,184,184,14,"#fff4e6",null)+d.r(8,160,184,32,0,"#f3d7b0",null)+kid(100,188,{s:0.95,shirt:C.yellow,arm:"both",mood:"grin"})+d.heart(40,90,12,C.pink)+d.heart(160,90,12,C.pink)+d.sparkle(150,40,10)+past(40,40),
"saw":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(8,130,184,62,0,"#3f9be8",null)+d.p("M100 140 Q130 110 170 124 Q186 130 186 144 L100 144Z","#4a6fa8")+d.l("M160 110 Q156 96 166 90 M160 110 Q168 96 178 96","#7cc4ff",3)+headFace(56,96,30,{mood:"o"})+d.r(36,86,40,18,8,"#3a3f50")+d.c(46,96,8,"#7cc4ff",O,3)+d.c(66,96,8,"#7cc4ff",O,3)+past(170,40),
"ate":()=>d.r(8,8,184,184,14,"#fffbe9",null)+plate(150,84)+d.c(80,140,4,C.cream,null)+d.c(110,148,3,C.cream,null)+d.c(120,138,3,"#e8a050",null)+d.l("M150 120 L180 80",C.grey2,5)+d.l("M50 120 L24 84 M44 124 L18 88",C.grey2,4)+headFace(100,70,30,{mood:"grin"})+d.heart(140,50,8,C.pink)+past(40,40),
"was":()=>d.r(8,8,184,184,14,"#f4f7fb",null)+kid(64,186,{s:0.85,shirt:C.orange,arm:"down",mood:"smile"})+d.r(110,40,80,60,8,"#fff")+d.p("M120 100 L110 118 L134 100Z","#fff")+d.c(150,70,18,"#fff")+headFace(150,70,18,{mood:"grin"})+past(150,150),
"swimming pool":()=>d.r(8,8,184,184,14,"#e9f2f8",null)+d.r(20,60,160,120,6,"#7cc4ff")+[84,108,132,156].map(y=>d.l(`M20 ${y} L180 ${y}`,"#fff",3)+d.l(`M20 ${y} L180 ${y}`,C.red,1)).join("")+d.l("M150 36 L150 80 M166 36 L166 80 M150 50 L166 50 M150 66 L166 66",C.grey2,4)+d.l("M40 120 Q50 114 60 120 T80 120 M110 150 Q120 144 130 150 T150 150","#fff",3),
"river":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(8,60,184,132,0,"#a8dc8a",null)+d.p("M100 60 Q60 90 90 120 Q130 150 60 192 L130 192 Q190 150 130 120 Q100 90 120 60Z","#5ab0f0")+d.l("M98 90 Q106 86 112 92 M98 150 Q106 146 114 152","#fff",3)+d.p("M8 60 L50 24 L90 60Z","#6fae5a")+d.p("M110 60 L160 18 L192 50 L192 60Z","#6fae5a")+d.g(d.e(0,0,12,6,"#ff9a3c")+d.p("M10 0 L18 -6 L18 6Z","#ff9a3c",O,2),"translate(110 168)"),
"camping":()=>d.r(8,8,184,184,14,"#2c3566",null)+moon(160,40,12)+d.r(8,150,184,42,0,"#4a7a4a",null)+tent(76,160,1.2,C.orange)+fire(150,170,1.2)+d.p("M30 150 L44 110 L58 150Z","#2e5a3a")+d.p("M170 150 L180 120 L190 150Z","#2e5a3a")+d.c(40,30,2,"#fff",null)+d.c(100,24,2,"#fff",null),
"whale":()=>d.r(8,8,184,184,14,"#d7efff",null)+d.r(8,120,184,72,0,"#3f9be8",null)+d.p("M30 120 Q30 70 96 70 Q150 70 160 110 L186 90 L182 130 L160 126 Q140 150 90 150 Q40 150 30 120Z","#4a6fa8")+d.p("M36 126 Q60 146 100 146 Q140 146 156 124 Q120 136 90 134 Q60 134 36 126Z","#cfe0ff",null)+d.c(64,100,5,O,null)+d.l("M54 116 Q66 122 78 116",O,3)+d.l("M90 70 Q86 50 74 44 M90 70 Q94 48 108 42 M90 70 L90 40","#7cc4ff",5),
"hokkaido":()=>d.r(8,8,184,184,14,"#5ab0f0",null)+d.p("M40 110 Q30 90 50 80 Q70 70 76 50 Q86 30 100 40 Q120 54 140 50 Q170 44 176 64 Q170 80 150 90 Q140 110 130 130 Q110 140 96 130 Q84 120 70 130 Q60 150 46 156 Q34 150 42 136 Q50 124 40 110Z","#7fcc6e")+d.p("M98 70 L110 54 L122 70Z","#fff",O,3)+d.c(150,64,4,C.red,O,2),
/* countries and travel */
"see":()=>d.r(8,8,184,184,14,"#f4f7fb",null)+d.p("M20 100 Q100 20 180 100 Q100 180 20 100Z","#fff")+d.c(100,100,38,"#5a8fd6")+d.c(100,100,18,O,null)+d.c(110,90,7,"#fff",null)+d.l("M30 70 L20 56 M60 46 L54 30 M100 38 L100 20 M140 46 L146 30 M170 70 L180 56",O,4),
"eat":()=>d.r(8,8,184,184,14,"#fffbe9",null)+bigHead("open","")+d.g(PIC["rice ball"](),"translate(118 100) scale(.4)"),
"visit":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(8,160,184,32,0,"#e9d6b0",null)+d.r(110,60,76,100,4,"#fff6e0")+d.p("M100 64 L148 30 L196 64Z",C.red)+d.r(134,110,26,50,2,C.brown)+d.c(154,136,3,C.gold,null)+kid(64,186,{s:0.8,shirt:C.blue,arm:"wave",mood:"open"})+d.r(18,140,30,38,6,C.orange)+d.l("M26 140 L26 132 L40 132 L40 140",O,3),
"buy":()=>d.r(8,8,184,184,14,"#fff6e6",null)+d.r(8,130,184,62,0,"#c98d4e",null)+[0,1,2,3,4,5,6,7].map(i=>d.r(20+i*20,30,20,34,0,i%2?"#fff":C.red,null)).join("")+d.r(20,30,160,34,4,"none")+d.p("M44 100 L80 100 L86 160 L38 160Z","#fff")+d.l("M50 100 Q62 80 74 100",O,3)+d.c(62,130,10,C.red)+
  d.g(d.r(-30,-12,60,24,10,C.skin)+d.r(-24,-18,48,22,3,"#9fd49a")+d.c(0,-7,7,"#5aa86a",null),"translate(140 140) rotate(-10)")+d.c(140,104,10,C.gold,O,3)+d.c(160,96,8,"#ddd",O,3),
"hot dog":()=>d.shadow(100,180,80)+d.p("M20 120 Q20 90 50 92 L150 92 Q180 90 180 120 Q180 150 150 150 L50 150 Q20 150 20 120Z","#e8b066")+d.r(14,104,172,24,12,"#c0502a")+d.l("M30 110 Q44 102 58 110 Q72 118 86 110 Q100 102 114 110 Q128 118 142 110 Q156 102 170 110",C.yellow,4)+d.p("M26 126 Q100 156 174 126 L174 132 Q160 150 150 150 L50 150 Q36 150 26 132Z","#f1c27a",null),
"pyramids":()=>d.r(8,8,184,184,14,"#ffe9b8",null)+sunIcon(160,40,14)+d.r(8,150,184,42,0,"#f1d27a",null)+d.p("M20 150 L70 64 L120 150Z","#e8b45a")+d.p("M70 64 L120 150 L90 150Z","#c9923a",null)+d.p("M100 150 L140 86 L180 150Z","#e8b45a")+d.p("M140 86 L180 150 L156 150Z","#c9923a",null)+d.p("M20 150 L70 64 L120 150Z","none")+d.p("M100 150 L140 86 L180 150Z","none"),
"ocean":()=>d.r(8,8,184,184,14,"#cfeeff",null)+d.r(8,70,184,122,0,"#2a6fc8",null)+d.l("M8 70 L192 70",O,3)+d.l("M20 100 Q40 90 60 100 T100 100 M100 130 Q120 120 140 130 T180 130 M20 160 Q40 150 60 160 T100 160","#9fd0ff",4)+d.p("M120 70 L130 52 L140 70Z","#fff")+d.l("M130 52 L130 70",O,3)+d.g(d.e(0,0,14,7,C.yellow)+d.p("M12 0 L20 -6 L20 6Z",C.yellow,O,2),"translate(60 130)")+d.l("M150 170 Q156 160 162 170 Q168 160 174 170",C.cream,3),
"baseball games":()=>d.r(8,8,184,184,14,"#1d2350",null)+d.p("M8 80 L192 80 L192 192 L8 192Z","#3fae4a",null)+d.p("M100 100 L150 140 L100 180 L50 140Z","#c9923a")+d.p("M100 110 L138 140 L100 170 L62 140Z","#3fae4a",null)+[[100,100],[150,140],[100,180],[50,140]].map(([x,y])=>d.r(x-5,y-5,10,10,1,"#fff",O,2)).join("")+
  d.r(60,22,80,40,4,"#2a2630")+d.t(100,50,"3 - 2",20,C.yellow,800)+[30,170].map(x=>d.l(`M${x} 80 L${x} 30`,C.grey,4)+d.r(x-12,22,24,10,2,"#fff8c0")).join(""),
/* school events */
"entrance ceremony":()=>d.r(8,8,184,184,14,"#eaf6ff",null)+d.r(8,160,184,32,0,"#d9cfbf",null)+d.r(110,40,10,130,2,"#9aa3ad")+d.r(176,40,10,130,2,"#9aa3ad")+d.r(110,70,76,26,2,"#fff")+d.c(130,83,6,C.red,O,2)+d.c(148,83,6,C.pink,O,2)+d.c(166,83,6,C.red,O,2)+
  d.r(30,110,60,48,10,C.red)+d.r(30,106,60,12,5,C.red2)+kid(60,186,{s:0.75,shirt:"#2a3a5a",arm:"down",mood:"open"})+sakura(30,40,12)+sakura(70,26,10)+sakura(94,56,8),
"swimming meet":()=>d.r(8,8,184,184,14,"#e9f2f8",null)+d.l("M8 30 L192 30",O,2)+[20,50,80,110,140,170].map((x,i)=>d.p(`M${x} 30 L${x+20} 30 L${x+10} 46Z`,[C.red,C.blue,C.yellow,C.green,C.red,C.blue][i],O,2)).join("")+d.r(8,60,184,132,0,"#7cc4ff",null)+[100,140].map(y=>d.l(`M8 ${y} L192 ${y}`,"#fff",3)).join("")+
  [[60,82],[100,122],[150,164]].map(([x,y],i)=>headFace(x,y,12,{mood:"open"})+d.r(x-12,y-12,24,8,4,[C.red,C.yellow,C.blue][i],null)+d.l(`M${x-34} ${y+2} L${x-18} ${y+2}`,"#fff",3)).join(""),
"sports day":()=>d.r(8,8,184,184,14,"#d7efff",null)+d.r(8,120,184,72,0,"#e9d6b0",null)+d.l("M8 30 Q100 50 192 30",O,2)+[20,50,80,110,140,170].map((x,i)=>d.p(`M${x} ${32+(x<100?x/12:(200-x)/12)} L${x+20} ${34+(x<100?x/12:(200-x)/12)} L${x+10} ${50+(x<100?x/12:(200-x)/12)}Z`,[C.red,C.blue,C.yellow,C.green,C.red,C.blue][i],O,2)).join("")+
  d.l("M20 168 L180 168","#fff",3)+d.g(kid(0,0,{s:0.7,shirt:"#fff",arm:"both",mood:"open"})+d.r(-22,-140,44,12,6,C.red),"translate(70 184) rotate(10)")+d.g(kid(0,0,{s:0.7,shirt:"#fff",arm:"both",mood:"open"})+d.r(-22,-140,44,12,6,"#fff"),"translate(140 184) rotate(10)"),
"music festival":()=>d.r(8,8,184,184,14,"#3a2a4a",null)+d.p("M8 8 L40 8 Q30 80 8 110Z",C.red,null)+d.p("M192 8 L160 8 Q170 80 192 110Z",C.red,null)+d.r(8,150,184,42,0,"#c98d4e",null)+[50,80,110,140].map((x,i)=>kid(x+5,170,{s:0.5,shirt:"#fff",pants:"#2a3a5a",arm:"down",mood:"open",girl:i%2===1})).join("")+note(40,50,C.yellow)+note(160,40,C.pink)+note(100,30,"#7be0ff"),
"volunteer day":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(8,150,184,42,0,"#a8dc8a",null)+kid(60,188,{s:0.75,shirt:C.yellow,arm:"down",mood:"smile"})+d.p("M90 120 L120 120 L126 176 L84 176Z","#cfe8ff")+d.l("M86 120 L124 120",O,3)+d.l("M40 160 L20 182",C.grey2,4)+
  kid(150,188,{s:0.75,shirt:C.yellow,arm:"down",mood:"smile",girl:true})+d.r(150,170,14,8,2,"#fff")+d.c(176,182,4,"#c9c9c9",O,2)+d.heart(100,40,14,C.pink)+d.heart(140,60,8,C.pink),
"hiking":()=>d.r(8,8,184,184,14,"#d7efff",null)+d.p("M8 192 L8 140 L80 70 L140 110 L192 60 L192 192Z","#6fae5a")+d.l("M30 192 Q70 150 90 120 Q110 96 160 80","#e9d6b0",8)+d.g(kid(0,0,{s:0.7,shirt:C.red,arm:"up",mood:"open"})+d.r(-30,-90,18,38,6,C.orange),"translate(80 168) rotate(-6)")+d.l("M108 76 L114 168",C.brown,4)+cloud(150,36,0.4),
"school trip":()=>d.r(8,8,184,184,14,"#d7efff",null)+pagoda(150,120,0.6)+d.r(8,130,184,62,0,"#c9cfd8",null)+d.p("M8 160 L150 160 Q192 160 192 136 Q190 120 150 118 L8 118Z","#fff")+d.p("M150 118 Q192 120 192 136 L160 136 Q150 128 150 118Z","#7cc4ff",null)+d.l("M8 148 L176 148",C.blue2,5)+[20,48,76,104].map(x=>d.r(x,124,20,14,3,"#7cc4ff")).join("")+d.l("M8 176 L192 176",O,3),
"field trip":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(8,150,184,42,0,"#cfeac0",null)+d.r(110,40,74,80,2,"#e6e0d4")+d.p("M104 44 L147 20 L190 44Z","#9aa3ad")+d.r(118,56,14,14,0,"#cfeeff",O,2)+d.r(162,56,14,14,0,"#cfeeff",O,2)+d.r(138,84,20,36,0,C.brown)+bus(64,150,0.85,C.yellow)+kid(160,190,{s:0.45,shirt:C.blue,arm:"down",mood:"open"})+kid(186,190,{s:0.45,shirt:C.red,arm:"down",mood:"open",girl:true}),
"graduation ceremony":()=>d.r(8,8,184,184,14,"#fff4f8",null)+d.r(8,160,184,32,0,"#d9cfbf",null)+kid(70,188,{s:0.9,shirt:"#2a3a5a",arm:"down",mood:"smile"})+d.c(84,98,8,C.red,O,2)+d.c(84,98,3,C.yellow,null)+d.g(d.r(-60,-9,120,18,8,"#3a3f50")+d.r(-6,-10,12,20,2,C.gold),"translate(140 120) rotate(-30)")+sakura(30,30,12)+sakura(170,40,14)+sakura(150,170,8),
"memory":()=>d.r(8,8,184,184,14,"#fff6e6",null)+headFace(50,150,30,{mood:"smile"})+d.c(84,110,6,"#fff",O,3)+d.c(96,94,9,"#fff",O,3)+d.p("M90 74 Q80 20 140 20 Q196 20 186 74 Q180 100 140 96 Q100 100 90 74Z","#fff")+
  d.g(d.r(-20,-16,40,32,2,"#fff")+d.r(-16,-12,32,20,0,"#7cc4ff",null)+d.p("M-16 8 L-6 -4 L4 6 L10 0 L16 8Z",C.green,null),"translate(118 58) rotate(-8)")+d.g(d.r(-20,-16,40,32,2,"#fff")+d.r(-16,-12,32,20,0,"#ffe9a8",null)+d.c(0,-2,5,C.red,null),"translate(158 58) rotate(8)"),
"kyoto":()=>d.r(8,8,184,184,14,"#ffe9d6",null)+d.p("M8 140 Q60 90 120 120 Q160 80 192 110 L192 192 L8 192Z","#b8d9a0",null)+pagoda(64,170,0.85)+torii(150,186,0.8)+torii(150,160,0.6)+sakura(170,40,10)+leafMaple(30,40,10,C.red),
"kinkakuji temple":()=>d.r(8,8,184,184,14,"#d7efff",null)+d.r(8,140,184,52,0,"#5ab0f0",null)+d.l("M30 160 Q50 154 70 160 M130 170 Q150 164 170 170","#fff",3)+d.p("M8 140 Q40 100 70 120 L70 140Z","#5a9a4a")+d.p("M192 140 Q170 96 140 116 L140 140Z","#5a9a4a")+
  d.r(56,104,88,36,0,"#e8c440")+d.p("M44 106 Q100 94 156 106 L146 92 Q100 84 54 92Z","#3a2a20")+d.r(66,66,68,28,0,C.gold)+d.p("M52 68 Q100 56 148 68 L136 54 Q100 46 64 54Z","#3a2a20")+d.r(76,38,48,18,0,C.gold)+d.p("M66 40 Q100 30 134 40 L120 28 Q100 22 80 28Z","#3a2a20")+d.c(100,20,4,C.gold)+d.l("M66 80 L134 80 M66 120 L144 120","#b8901e",2),
/* clubs, teams, subjects */
"science club":()=>team("#fff",flask(70,48,0.9)+d.g(d.r(-6,-36,12,40,3,"#3a3f50")+d.r(-20,4,40,8,3,"#3a3f50")+d.l("M0 -10 Q20 -10 20 10",O,4)+d.r(-10,-44,20,10,3,C.grey),"translate(136 64)")),
"baseball team":()=>team("#fff",d.c(80,40,22,"#fff")+d.l("M70 24 Q80 40 70 56 M90 24 Q80 40 90 56",C.red,2.5)+d.g(d.p("M-5 -50 Q-8 -10 -4 20 L4 20 Q8 -10 5 -50 Q0 -54 -5 -50Z","#c98d4e"),"translate(136 46) rotate(40)"),C.blue2),
"english class":()=>room("#fff6e6","#d9c9b0",d.r(36,26,128,70,6,"#2e6b4a",O,5)+d.t(100,58,"Hello!",24,"#fff",800)+d.t(100,84,"ABC",16,C.yellow,800)+[50,100,150].map((x,i)=>headFace(x,128,16,{mood:"open",girl:i===1})+d.r(x-24,146,48,12,2,"#c98d4e")).join("")),
"brass band":()=>team(C.red,d.g(d.r(-40,-6,60,12,3,C.gold)+d.p("M20 -6 L50 -22 L50 22 L20 6Z",C.gold)+d.r(-24,-14,6,10,1,C.yellow2)+d.r(-12,-14,6,10,1,C.yellow2),"translate(70 44) scale(.9)")+d.g(d.p("M-12 30 Q-30 -10 -10 -40 L10 -40 Q0 -10 12 30Z",C.gold)+d.e(0,-40,22,8,C.gold),"translate(144 52) rotate(20)"),"#2a3a5a"),
"soccer team":()=>team(C.green,sball(100,42,24),"#fff"),
"kendo club":()=>team("#24356b",d.g(d.r(-24,-24,48,44,12,"none","#c8ccd4",3)+d.l("M-20 -12 L20 -12 M-20 0 L20 0 M-20 12 L20 12 M-10 -22 L-10 18 M0 -24 L0 20 M10 -22 L10 18","#c8ccd4",2.5),"translate(70 44)")+d.l("M120 76 L170 12","#e0c27a",7)+d.r(116,72,14,10,3,"#fff"),"#24356b"),
"industrial arts":()=>d.r(8,8,184,184,14,"#f6efe2",null)+d.r(8,130,184,62,0,"#c98d4e",null)+d.r(40,70,70,60,0,"#e0b57a")+d.p("M30 74 L75 36 L120 74Z",C.red)+d.c(75,96,10,O,null)+d.r(70,110,10,20,0,"#a46b3a",null)+
  d.g(d.p("M0 -12 L80 -12 L80 12 L0 4Z","#c8ccd4")+d.l("M10 4 L14 12 M22 5 L26 12 M34 6 L38 12 M46 7 L50 12 M58 8 L62 12 M70 9 L74 12",O,2)+d.r(-26,-16,30,28,8,C.red),"translate(126 150) rotate(-20)")+d.g(d.r(-4,0,8,40,3,"#c98d4e")+d.r(-14,-8,28,12,3,C.grey),"translate(160 70) rotate(30)"),
"track and field team":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(8,140,184,52,0,"#d9604a",null)+d.l("M8 160 L192 160 M8 180 L192 180","#fff",3)+d.l("M120 140 L120 112 M170 140 L170 112",O,4)+d.r(114,108,62,8,2,"#fff")+d.l("M126 112 L164 112",C.red,4)+
  d.g(kid(0,0,{s:0.75,shirt:C.blue,arm:"both",mood:"open"}),"translate(70 150) rotate(20)")+speed(10,60),
"tennis team":()=>team(C.green,d.g(d.e(0,-34,30,40,"#fff",O,0,6)+d.e(0,-34,30,40,"none",C.red,0,4)+d.r(-4,4,8,34,3,O,null),"translate(80 60) rotate(-30) scale(.8)")+d.c(136,40,14,"#d8f23a")+d.l("M126 34 Q136 40 126 48 M146 32 Q136 40 146 48","#fff",2),"#fff"),
"chorus":()=>d.r(8,8,184,184,14,"#f4f0ff",null)+[0,1].map(r=>[0,1,2,3].map(i=>kid(40+i*40+(r?20:0)-(r?20:0),r?190:136,{s:0.5,shirt:"#fff",pants:"#2a3a5a",arm:"down",mood:"open",girl:(i+r)%2===0})).join("")).join("")+note(30,30,C.purple)+note(170,24,C.pink)+note(100,20,C.blue),
"volleyball team":()=>team(C.orange,d.g(d.c(0,0,24,"#fff")+d.l("M-24 0 Q0 -10 20 -14 M-10 22 Q-6 0 10 -22 M14 20 Q4 4 24 -4",C.blue,3),"translate(100 42)"),C.orange2),
"art club":()=>team(C.purple,d.l("M60 76 L76 10 M108 76 L92 10",C.brown,4)+d.r(52,14,64,48,3,"#fff")+sunIcon(70,30,6)+d.p("M60 56 L80 36 L96 50 L108 40 L112 56Z",C.green,null)+d.e(150,40,26,20,"#f1d27a")+d.c(140,32,5,C.red,null)+d.c(154,30,5,C.blue,null)+d.c(162,42,5,C.green,null)+d.c(146,48,5,"#f4f7fb",null)),
"study technology":()=>d.r(8,8,184,184,14,"#eef3fa",null)+d.r(8,140,184,52,0,"#c98d4e",null)+d.r(20,50,90,64,6,"#2a2f3a")+d.r(26,56,78,52,3,"#1d2230")+d.t(65,90,"&lt;/&gt;",22,"#7be07b",800)+d.r(56,114,18,14,0,"#555")+d.r(14,124,100,14,4,"#ddd")+
  d.g(d.r(-24,-30,48,40,8,C.grey)+d.c(-10,-12,6,"#7be0ff",O,3)+d.c(10,-12,6,"#7be0ff",O,3)+d.l("M0 -30 L0 -44",O,3)+d.c(0,-46,5,C.red)+d.r(-20,12,40,26,6,C.grey2)+d.l("M-24 18 L-36 30 M24 18 L36 30",O,5)+d.c(-14,42,7,"#555")+d.c(14,42,7,"#555"),"translate(150 96)"),
"join":()=>d.r(8,8,184,184,14,"#f4f7fb",null)+d.e(120,150,70,30,"#e9f4e3",null)+kid(100,170,{s:0.6,shirt:C.green,arm:"down",mood:"smile"})+kid(140,176,{s:0.6,shirt:C.green,arm:"down",mood:"smile",girl:true})+kid(170,160,{s:0.6,shirt:C.green,arm:"down",mood:"smile"})+
  kid(40,186,{s:0.7,shirt:C.yellow,arm:"wave",mood:"open"})+d.p("M60 60 L96 60 L96 50 L116 68 L96 86 L96 76 L60 76Z",C.orange,O,3)
});
PIC["firefighter"]=PIC["fire fighter"];

/* ---------- Sunshine English Course 1 ---------- */
const sky=(f)=>d.r(8,8,184,184,14,f||"#e9f7ff",null);
const future=(x,y)=>d.g(d.r(-20,-18,40,38,5,"#fff")+d.r(-20,-18,40,11,5,C.green)+d.r(-20,-10,40,3,0,C.green,null)+d.l("M-10 10 Q0 -2 10 8",C.blue2,3)+d.p("M14 4 L10 12 L4 6Z",C.blue2,null),`translate(${x} ${y})`);
const bubble=(x,y,w,h,txt,size,col)=>d.r(x,y,w,h,12,"#fff")+d.p(`M${x+18} ${y+h-2} L${x+10} ${y+h+16} L${x+34} ${y+h-2}Z`,"#fff")+d.l(`M${x+19} ${y+h-2} L${x+33} ${y+h-2}`,"#fff",5)+d.t(x+w/2,y+h/2+size*0.36,txt,size,col||O,800);
const bookOpen=(x,y,s,c1,c2)=>d.g(d.p("M0 -30 Q-26 -40 -54 -32 L-54 26 Q-26 18 0 28Z",c1||"#fff")+d.p("M0 -30 Q26 -40 54 -32 L54 26 Q26 18 0 28Z",c2||"#fff")+d.l("M-44 -18 L-10 -20 M-44 -6 L-10 -8 M-44 6 L-10 4 M10 -20 L44 -18 M10 -8 L44 -6 M10 4 L44 6","#b9b2a6",2.5),`translate(${x} ${y}) scale(${s||1})`);
const plane=(x,y,s,rot)=>d.g(d.p("M-56 0 Q-56 -10 -44 -10 L44 -10 Q62 -6 62 2 Q54 10 40 10 L-44 10 Q-56 10 -56 0Z","#fff")+d.p("M-6 -6 L-26 -44 L-12 -44 L18 -6Z","#cfe0ff")+d.p("M-6 6 L-22 36 L-8 36 L18 6Z","#cfe0ff")+d.p("M-50 -6 L-60 -30 L-48 -30 L-38 -8Z",C.red)+[-30,-16,-2,12,26].map(x=>d.c(x,-1,3,"#7cc4ff",null)).join("")+d.r(40,-6,12,7,3,"#7cc4ff",null),`translate(${x} ${y}) rotate(${rot||0}) scale(${s||1})`);
const bicycle=(x,y,s)=>d.g(d.c(-40,0,26,"none",O,6)+d.c(40,0,26,"none",O,6)+d.c(-40,0,4,O,null)+d.c(40,0,4,O,null)+d.l("M-40 0 L-10 -40 L30 -40 L40 0 M-10 -40 L0 0 L30 -40 M-40 0 L0 0",C.red,6)+d.l("M-14 -48 L-2 -48",O,6)+d.l("M30 -40 L26 -56 L38 -58",O,5),`translate(${x} ${y}) scale(${s||1})`);
const train=(x,y,s,f)=>d.g(d.r(-70,-50,140,56,10,f||"#3fae6a")+[-58,-30,-2,26].map(xx=>d.r(xx,-40,22,18,3,"#cfeeff")).join("")+d.r(50,-40,14,34,3,"#cfeeff")+d.l("M-70 -14 L70 -14","#fff",4)+d.c(-46,10,9,"#3a3f50")+d.c(-24,10,9,"#3a3f50")+d.c(24,10,9,"#3a3f50")+d.c(46,10,9,"#3a3f50"),`translate(${x} ${y}) scale(${s||1})`);
const laptop=(x,y,s,inner)=>d.g(d.r(-50,-60,100,64,6,"#3a3f50")+d.r(-44,-54,88,52,3,"#cfeeff",null)+(inner||"")+d.p("M-62 4 L62 4 L70 16 L-70 16Z","#c8ccd4"),`translate(${x} ${y}) scale(${s||1})`);
const robot=(x,y,s)=>d.g(d.l("M0 -96 L0 -110",O,4)+d.c(0,-112,6,C.red)+d.r(-30,-96,60,44,10,C.grey)+d.c(-12,-76,8,"#7be0ff",O,3)+d.c(12,-76,8,"#7be0ff",O,3)+d.r(-12,-62,24,5,2,O,null)+d.r(-36,-50,72,52,10,"#c8ccd4")+d.r(-16,-40,32,22,4,"#7cc4ff")+d.l("M-36 -40 L-52 -10 M36 -40 L52 -10",O,8)+d.c(-52,-8,7,C.grey)+d.c(52,-8,7,C.grey)+d.r(-28,2,18,20,4,C.grey2)+d.r(10,2,18,20,4,C.grey2),`translate(${x} ${y}) scale(${s||1})`);
const tree=(x,y,s,f)=>d.g(d.r(-8,-40,16,40,3,C.brown)+d.c(0,-60,30,f||C.leaf)+d.c(-20,-48,18,f||C.leaf)+d.c(20,-48,18,f||C.leaf),`translate(${x} ${y}) scale(${s||1})`);
const phone=(x,y,s,rot)=>d.g(d.r(-20,-36,40,72,8,"#3a3f50")+d.r(-15,-28,30,52,3,"#7cc4ff",null)+d.c(0,30,3,"#888",null),`translate(${x} ${y}) rotate(${rot||0}) scale(${s||1})`);
const pastOf=(base)=>()=>PIC[base]()+past(170,30);
Object.assign(PIC,{
/* personality */
"shy":()=>sky("#fff0f4")+kid(100,192,{s:1,shirt:C.pink,arm:"down",mood:"flat",girl:true})+d.e(78,90,10,6,"#ff7a8a",null)+d.e(122,90,10,6,"#ff7a8a",null)+d.c(70,96,9,C.skin)+d.c(130,96,9,C.skin)+d.l("M40 50 Q44 40 50 46 M150 46 Q156 40 160 50",C.pink,3),
"quiet":()=>sky("#eef3fa")+kid(100,192,{s:1,shirt:C.blue,arm:"down",mood:"flat"})+d.l("M126 130 Q130 116 106 112",O,16)+d.l("M126 130 Q130 116 106 112",C.blue,9)+d.c(102,110,10,C.skin)+d.r(97,82,8,26,4,C.skin)+d.t(160,60,"shh",24,C.grey2,800),
"polite":()=>sky("#f4f7fb")+d.r(8,160,184,32,0,"#e3d9c6",null)+kid(60,190,{s:0.9,shirt:C.green,arm:"down",mood:"smile"})+bubble(96,30,96,50,"Thank you.",15,C.green2)+adult(160,192,{s:0.6,coat:C.purple,girl:true,skirt:C.purple,grey:true,bun:true,mood:"smile"}),
"cheerful":()=>sky("#fff7df")+sunIcon(160,40,16)+kid(90,192,{s:1,shirt:C.yellow,arm:"both",mood:"grin"})+d.sparkle(30,50,10)+d.sparkle(40,140,8),
"careful":()=>sky("#f4f7fb")+d.r(8,150,184,42,0,"#9aa3ad",null)+[30,70,110,150].map(x=>d.r(x,164,24,8,0,"#fff",null)).join("")+kid(100,180,{s:0.8,shirt:C.yellow,arm:"wave",mood:"flat"})+d.l("M70 70 L60 66 M130 70 L140 66",O,3)+d.r(160,40,26,60,6,"#2a2630")+d.c(173,56,8,C.red)+d.c(173,82,8,"#555")+d.l("M173 100 L173 150",O,4),
"active":()=>sky("#e9f7ff")+d.r(8,160,184,32,0,"#a8dc8a",null)+d.g(kid(0,0,{s:0.9,shirt:C.orange,arm:"both",mood:"grin"}),"translate(100 158) rotate(-10)")+d.l("M70 180 L60 190 M130 176 L142 186",C.grey2,4)+sball(160,150,14)+d.sparkle(40,40,10),
"funny":()=>sky("#fff4df")+bigHead("grin",d.p("M90 130 Q100 150 110 130Z",C.pink,O,2)+d.t(36,60,"HA",24,C.orange2,800,'transform="rotate(-14 36 60)"')+d.t(166,56,"HA",24,C.orange2,800,'transform="rotate(14 166 56)"')+d.p("M40 80 Q46 90 40 98","none","#7cc4ff",3)),
"honest":()=>sky("#eef7ee")+kid(84,192,{s:1,shirt:C.green,arm:"up",mood:"smile"})+d.heart(160,90,20,C.pink)+d.c(160,150,16,C.green)+d.l("M152 150 L158 156 L170 142","#fff",4),
"fan":()=>sky("#2c2a5a")+kid(100,192,{s:1,shirt:C.pink,arm:"both",mood:"grin",girl:true})+d.l("M140 66 L160 20",O,5)+d.l("M140 66 L160 20",C.yellow,3)+d.l("M60 66 L40 20",O,5)+d.l("M60 66 L40 20","#7be0ff",3)+d.heart(100,30,12,C.pink),
"city":()=>sky("#d7efff")+[[14,80,40,"#9aa3ad"],[52,50,36,"#7d8fb0"],[86,96,30,"#b0b8c8"],[114,36,40,"#8a9ac0"],[152,70,40,"#a0a8b8"]].map(([x,y,w,f])=>d.r(x,y,w,192-y,2,f)+[0,1,2,3,4,5,6].map(r=>y+12+r*18<180?d.r(x+6,y+12+r*18,8,8,1,"#fff8c0",null)+d.r(x+w-14,y+12+r*18,8,8,1,"#fff8c0",null):"").join("")).join(""),
"canada":()=>flagBox(d.r(25,50,150,100,0,"#fff",null)+d.r(25,50,38,100,0,"#d52b1e",null)+d.r(137,50,38,100,0,"#d52b1e",null)+leafMaple(100,96,26,"#d52b1e").replace(/stroke="[^"]*"/,'stroke="none"')+d.r(97,114,6,16,0,"#d52b1e",null),"canada"),
"the u.s.":()=>PIC["the u.s.a."](),
/* school and daily life */
"home":()=>PIC.house(),
"frog":()=>d.shadow(100,184,64)+d.e(100,140,64,44,"#5cc45a")+d.c(66,86,22,"#5cc45a")+d.c(134,86,22,"#5cc45a")+d.c(66,84,12,"#fff",O,3)+d.c(134,84,12,"#fff",O,3)+d.c(68,86,6,O,null)+d.c(132,86,6,O,null)+d.l("M70 136 Q100 156 130 136",O,4)+d.e(72,148,8,5,C.cheek,null)+d.e(128,148,8,5,C.cheek,null)+d.e(50,178,22,8,"#4aa84a")+d.e(150,178,22,8,"#4aa84a"),
"grow":()=>sky("#eef8ff")+d.r(8,160,184,32,0,"#a8774a",null)+d.l("M40 160 L40 146",C.green2,4)+d.e(46,144,7,4,C.leaf,O,-30,2)+d.l("M100 160 L100 120",C.green2,4)+d.e(110,128,12,6,C.leaf,O,-30,2)+d.e(90,138,12,6,C.leaf,O,30,2)+d.l("M160 160 L160 70",C.green2,5)+d.e(174,110,16,7,C.leaf,O,-30,3)+d.e(146,126,16,7,C.leaf,O,30,3)+[0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3;return d.e(160+Math.cos(a)*16,60+Math.sin(a)*16,10,6,C.yellow,O,a*180/Math.PI,2);}).join("")+d.c(160,60,9,C.orange)+d.l("M60 130 L80 120 M120 100 L140 84",C.grey2,4),
"weekend":()=>{let g=d.r(8,46,184,108,12,"#fff");["S","M","T","W","T","F","S"].forEach((t,i)=>{const x=24+i*25.3,we=i===0||i===6;g+=(we?d.r(x-12,56,24,90,8,i===0?"#ffd6d6":"#d6e6ff",null):"")+d.t(x,80,t,18,we?(i===0?C.red:C.blue2):C.grey2,800)+d.r(x-9,96,18,18,4,we?"#fff":"#f4f1ea",O,2);});return g+d.star(24,128,7,C.gold,O,2)+d.star(176,128,7,C.gold,O,2);},
"after school":()=>sky("#ffe9c9")+d.r(80,40,104,110,2,"#f4f1ea")+d.p("M74 44 L132 16 L190 44Z",C.red)+clock(132,64,16,3,30)+[96,150].map(x=>d.r(x,96,20,20,1,"#cfeeff",O,2)).join("")+d.r(8,150,184,42,0,"#d9cfbf",null)+kid(40,190,{s:0.7,shirt:C.blue,arm:"wave",mood:"open"})+d.r(18,108,20,34,6,C.red),
"question":()=>sky("#f4f7fb")+kid(70,192,{s:0.95,shirt:C.blue,arm:"up",mood:"open"})+bubble(110,30,74,70,"?",56,C.blue2),
"tomorrow":()=>sky("#eef8ff")+d.r(40,40,120,120,12,"#fff")+d.r(40,40,120,32,12,C.green)+d.r(40,62,120,10,0,C.green,null)+d.t(100,134,"+1",50,C.green2,800)+future(150,160),
"picture":()=>sky("#f6efe2")+d.r(36,40,128,104,4,"#c98d4e")+d.r(48,52,104,80,0,"#cfeeff")+d.p("M48 132 L80 96 L104 116 L122 98 L152 132Z",C.green,null)+sunIcon(130,72,8)+d.l("M100 40 L80 20 L120 20 Z",O,3),
"draw":()=>PIC["draw pictures"](),"drawing":()=>PIC["draw pictures"](),
"watch movies":()=>sky("#2a2a3a")+d.r(20,30,160,90,4,"#fff")+d.r(28,38,144,74,0,"#7cc4ff",null)+d.p("M28 112 L70 70 L100 100 L130 76 L172 112Z",C.green,null)+[50,100,150].map((x,i)=>headFace(x,160,22,{mood:"open",girl:i===1})).join("")+d.p("M150 182 L170 182 L176 150 L144 150Z",C.red)+d.c(152,148,6,"#fff8d0")+d.c(162,144,6,"#fff8d0")+d.c(170,150,6,"#fff8d0"),
"watch a movie":()=>PIC["watch movies"](),
"read books":()=>sky("#f6efe2")+kid(100,200,{s:1,shirt:C.purple,arm:"down",mood:"smile"})+bookOpen(100,140,1,"#fff","#fff")+d.r(46,108,108,6,0,"none")+d.c(46,150,8,C.skin)+d.c(154,150,8,C.skin),
"read a book":()=>PIC["read books"](),"read":()=>PIC["read books"](),
"clean":()=>PIC["cleaning time"](),
"bicycle":()=>d.shadow(100,176,80)+bicycle(100,150,1.1),"bike":()=>d.shadow(100,176,80)+bicycle(100,150,1.1),
/* skills */
"ski":()=>sky("#d7efff")+d.p("M8 192 L8 130 L192 70 L192 192Z","#fff")+d.g(kid(0,0,{s:0.75,shirt:C.red,arm:"both",mood:"grin"})+d.l("M-50 4 L60 -8",C.blue2,6),"translate(100 130) rotate(-18)")+d.l("M60 80 L46 150 M136 60 L150 130",O,3),
"speak chinese":()=>sky("#fff0ee")+kid(56,192,{s:0.9,shirt:C.red,arm:"down",mood:"open"})+bubble(92,24,96,58,"你好",30,C.red2)+d.g(d.r(0,0,46,30,0,"#de2910",null)+d.star(12,11,7,"#ffde00",null)+d.r(0,0,46,30,0,"none",O,3),"translate(130 120)"),
"speak french":()=>sky("#eef3ff")+kid(56,192,{s:0.9,shirt:C.blue,arm:"down",mood:"open"})+bubble(84,24,108,58,"Bonjour!",22,C.blue2)+d.g(d.r(0,0,15,30,0,"#1f4fa8",null)+d.r(15,0,16,30,0,"#fff",null)+d.r(31,0,15,30,0,"#e3262f",null)+d.r(0,0,46,30,0,"none",O,3),"translate(130 120)"),
"do magic tricks":()=>sky("#2c2a5a")+d.p("M50 150 L150 150 L140 176 L60 176Z","#2a2630")+d.e(100,150,56,10,"#2a2630")+d.e(100,150,46,7,"#111",null)+d.e(90,120,14,24,"#fff")+d.e(110,120,14,24,"#fff")+d.c(100,140,20,"#fff")+d.e(90,104,6,14,"#fff")+d.e(110,104,6,14,"#fff")+d.c(93,138,3,O,null)+d.c(107,138,3,O,null)+
  d.g(d.r(-4,-50,8,60,2,O,null)+d.r(-4,-50,8,12,2,"#fff",null),"translate(160 100) rotate(30)")+d.sparkle(130,50,10)+d.sparkle(170,40,8)+d.sparkle(40,80,8),
"read a map":()=>sky("#eef8ff")+d.p("M30 60 L76 46 L124 60 L170 46 L170 160 L124 174 L76 160 L30 174Z","#fff4d6")+d.l("M76 46 L76 160 M124 60 L124 174",C.brown,2)+d.p("M40 100 Q70 80 100 110 Q130 140 160 100","none",C.blue,4)+d.l("M50 140 L90 130 L120 150 L150 130",C.red,3)+d.p("M140 70 Q150 56 160 70 Q160 80 150 92 Q140 80 140 70Z",C.red)+d.c(150,72,4,"#fff",null)+d.c(60,72,10,C.leaf,O,2),
"make sushi":()=>sky("#fff6e6")+d.r(8,140,184,52,0,"#c98d4e",null)+kid(100,150,{s:0.8,shirt:"#fff",arm:"down",mood:"smile"})+d.r(30,146,140,30,4,"#e7cf8e")+d.g(PIC.sushi(),"translate(60 108) scale(.4)")+d.c(76,148,7,C.skin)+d.c(124,148,7,C.skin),
"uncle":()=>ground("#e6eef4")+adult(76,192,{s:0.82,coat:C.green,armR:"down",mood:"grin",beard:true,hat:"cap",capCol:C.orange})+me(150,190),
"aunt":()=>ground("#f6e8ee")+adult(76,192,{s:0.82,coat:C.orange,girl:true,skirt:C.green2,armR:"down",mood:"grin",hair:"#a0522d",glasses:true})+me(150,190),
"cousin":()=>ground("#eef0e6")+kid(70,190,{s:0.9,shirt:C.purple,arm:"wave",mood:"grin",hair:"#8a5a2b"})+me(150,190),
"talent show":()=>sky("#3a2a4a")+d.p("M8 8 L40 8 Q30 80 8 110Z",C.red,null)+d.p("M192 8 L160 8 Q170 80 192 110Z",C.red,null)+d.r(8,150,184,42,0,"#c98d4e",null)+kid(100,170,{s:0.8,shirt:C.yellow,arm:"both",mood:"grin"})+d.star(40,40,12,C.gold,O,3)+d.star(160,40,12,C.gold,O,3)+d.star(100,24,14,C.gold,O,3),
"perform":()=>PIC["talent show"](),
"excited":()=>sky("#fff4e6")+d.g(kid(0,0,{s:0.95,shirt:C.orange,arm:"both",mood:"grin"}),"translate(100 176)")+d.e(100,188,30,5,"#000",null)+d.t(166,60,"!!",40,C.red,800)+d.sparkle(30,40,12)+d.sparkle(40,140,8),
"often":()=>week(4,C.purple),
"internet":()=>sky("#eef3fa")+laptop(100,150,1.2,d.c(0,-28,18,"#4a8fe8")+d.p("M-10 -40 Q0 -30 -6 -20 Q4 -16 6 -10",null,"#55b84a",5))+d.l("M70 40 Q100 20 130 40 M80 54 Q100 40 120 54",C.blue2,5)+d.c(100,64,5,C.blue2,null),
"robot":()=>d.shadow(100,188,50)+robot(100,170,1.2),
"carry":()=>ground("#e8e0d0")+kid(90,190,{s:0.95,shirt:C.green,arm:"both",mood:"open"})+d.r(56,30,68,48,4,"#d9a866")+d.l("M56 46 L124 46",C.brown,2)+d.l("M150 120 L178 120 L170 112 M178 120 L170 128",C.grey2,4),
"heavy":()=>ground("#e8e0d0")+kid(100,190,{s:0.9,shirt:C.red,arm:"both",mood:"o"})+d.r(54,24,92,50,6,"#5a6070")+d.t(100,58,"100kg",20,"#fff",800)+d.p("M150 110 Q146 120 150 124 Q154 120 150 110Z","#a8dcff",O,2)+d.p("M50 110 Q46 120 50 124 Q54 120 50 110Z","#a8dcff",O,2),
"find":()=>sky("#eef8ff")+d.r(8,150,184,42,0,"#a8dc8a",null)+d.c(90,100,46,"#e8f6ff",O,7)+d.l("M124 134 L170 180",O,14)+d.l("M124 134 L170 180",C.brown,8)+d.p("M80 84 Q90 70 100 84 Q100 96 90 110 Q80 96 80 84Z",C.red)+d.c(90,86,4,"#fff",null)+d.sparkle(150,40,10),
"fly":()=>sky("#d7efff")+cloud(50,150,0.5)+cloud(150,60,0.4)+d.g(PIC.bird(),"translate(40 30) scale(.65)")+d.l("M10 120 Q30 110 50 120",C.grey,3),
/* people and things */
"jelly":()=>d.shadow(100,184,70)+plate(170,70)+d.p("M50 166 L60 70 Q100 56 140 70 L150 166Z","#ff6a8a")+d.e(100,70,40,10,"#ff9ab0")+d.shine(76,110,6,24,8)+d.c(100,58,10,C.red)+d.l("M100 48 Q104 38 112 36",C.green2,3),
"butterfly":()=>d.e(70,74,34,30,C.orange,O,-20)+d.e(130,74,34,30,C.orange,O,20)+d.e(76,128,24,22,C.yellow,O,20)+d.e(124,128,24,22,C.yellow,O,-20)+d.c(64,72,8,"#fff",null)+d.c(136,72,8,"#fff",null)+d.e(100,100,8,40,"#3a2a20")+d.l("M96 62 Q86 40 76 36 M104 62 Q114 40 124 36",O,3),
"zebra":()=>{let g=d.shadow(100,186,70)+d.r(48,120,14,64,5,"#fff")+d.r(132,120,14,64,5,"#fff")+d.e(100,118,60,34,"#fff")+d.p("M130 100 L150 40 L176 44 L180 70 L156 110Z","#fff")+d.p("M150 40 Q148 18 164 30 L160 44Z","#fff");
  g+=d.l("M70 90 Q66 116 72 146 M88 86 Q84 116 90 150 M106 86 Q102 116 108 150 M124 92 Q120 116 126 146 M150 56 L170 60 M146 72 L172 74 M140 90 L164 92",O,6)+d.p("M148 40 Q140 70 130 100",null,O,5)+d.c(166,52,3,O,null)+d.e(176,66,6,8,"#3a3a3a");return g;},
"ant":()=>d.shadow(100,180,70)+d.c(46,110,22,"#3a2a20")+d.e(96,116,22,18,"#3a2a20")+d.e(150,120,34,26,"#3a2a20")+d.l("M80 130 L60 170 M96 132 L96 176 M112 130 L130 172 M80 102 L64 70 M112 102 L130 70",O,4)+d.l("M36 92 Q24 60 10 56 M50 90 Q54 60 66 50",O,3)+d.c(38,104,5,"#fff",null)+d.shine(140,108,10,6),
"cookie":()=>d.shadow(100,184,64)+d.c(100,104,70,"#d9a056")+d.c(100,104,60,"#e3b46a",null)+[[70,80],[120,74],[90,120],[134,118],[66,124],[104,92],[126,150]].map(([x,y])=>d.e(x,y,7,6,"#5a3418",null)).join(""),
"woman":()=>ground("#f6e8ee")+adult(100,192,{s:0.85,coat:C.pink,girl:true,skirt:"#6a6fa8",mood:"smile",hair:"#6b3f22"}),
"man":()=>ground("#e6eef4")+adult(100,192,{s:0.85,coat:C.blue,mood:"smile"}),
"boy":()=>ground("#e8f0e4")+kid(100,190,{s:1.1,shirt:C.green,arm:"down",mood:"smile"}),
"girl":()=>ground("#f6eaf2")+kid(100,190,{s:1.1,shirt:C.pink,arm:"down",mood:"smile",girl:true}),
"lady":()=>ground("#f6e8ee")+adult(100,192,{s:0.85,coat:C.purple,girl:true,skirt:C.purple,mood:"smile",hair:"#6b3f22",extra:d.e(0,-180,40,8,"#f1d27a")+d.p("M-22 -182 Q-22 -204 0 -204 Q22 -204 22 -182Z","#f1d27a")+d.c(14,-190,6,C.pink)}),
"classmate":()=>room("#fff6e6","#d9c9b0",[50,100,150].map((x,i)=>headFace(x,118,18,{mood:"open",girl:i===1})+d.r(x-18,134,36,20,8,[C.blue,C.pink,C.green][i])+d.r(x-26,150,52,10,2,"#c98d4e")).join("")+d.r(40,30,120,50,4,"#2e6b4a",O,4)),
"runner":()=>ground("#d9604a")+d.l("M0 180 L200 180","#fff",3)+d.g(adult(0,0,{s:0.82,coat:C.blue,sleeve:C.skin,shorts:C.blue2,armL:"out",armR:"out",mood:"open",extra:d.r(-16,-112,32,22,2,"#fff")+d.t(0,-95,"5",16,O,800)}),"translate(110 186) rotate(10)")+speed(8,80),
"street singer":()=>sky("#eef0f4")+d.r(8,150,184,42,0,"#bfbfc6",null)+d.l("M8 170 L192 170 M60 150 L60 192 M130 150 L130 192","#a8a8b0",2)+adult(84,192,{s:0.8,coat:C.orange,armL:"hold",armR:"hold",mood:"open",extra:guitar(0,-84,0.85,-58)})+d.p("M140 178 L176 178 L170 190 L146 190Z","#3a3f50")+d.c(158,180,4,C.gold,O,2)+note(160,60,C.purple)+note(30,50,C.pink),
"famous":()=>sky("#fff4df")+adult(100,192,{s:0.82,coat:C.red,mood:"grin",armR:"up",extra:d.r(-20,-164,18,10,4,O,null)+d.r(2,-164,18,10,4,O,null)+d.l("M-2 -160 L2 -160",O,3)})+d.star(40,60,14,C.gold,O,3)+d.star(160,140,12,C.gold,O,3)+d.g(d.r(-14,-10,28,20,4,"#3a3f50")+d.c(0,0,6,"#7cc4ff",O,2),"translate(34 140)")+d.g(d.r(-14,-10,28,20,4,"#3a3f50")+d.c(0,0,6,"#7cc4ff",O,2),"translate(170 60)"),
"udon":()=>d.shadow(100,186,80)+d.p("M20 96 Q24 172 100 174 Q176 172 180 96Z","#6a3a20")+d.e(100,96,80,20,"#d9a056")+d.l("M44 94 Q60 82 76 98 Q92 84 108 98 Q124 84 140 98 Q150 88 160 96","#fffbea",9)+d.l("M44 94 Q60 82 76 98 Q92 84 108 98 Q124 84 140 98 Q150 88 160 96",O,1)+d.e(130,88,16,6,"#d98f45")+d.c(70,86,5,C.leaf,null)+d.l("M120 50 L176 20 M126 58 L182 28",C.brown,5),
"meat":()=>d.shadow(100,184,70)+plate(170,76)+d.p("M44 140 Q36 100 70 94 Q110 84 140 104 Q164 120 150 150 Q120 168 70 162 Q48 158 44 140Z","#a8442a")+d.l("M70 120 Q100 110 130 128 M64 140 Q100 132 136 146",C.cream,3)+d.g(d.e(0,0,26,18,"#c0682a")+d.r(22,-4,30,8,4,"#fff4dc")+d.c(52,-6,6,"#fff4dc")+d.c(52,6,6,"#fff4dc"),"translate(120 70) rotate(-20)"),
"deep-fried tofu":()=>d.shadow(100,184,70)+plate(170,76)+d.p("M40 150 L60 70 L160 80 L150 160Z","#e3a35a")+d.p("M54 140 L70 82 L148 90 L140 150Z","#eebd76",null)+d.l("M70 100 L80 104 M100 120 L112 116 M120 96 L130 100",C.brown,2),
"chef":()=>PIC.cook(),
"custard pudding":()=>PIC.pudding(),
"excellent":()=>sky("#fff7df")+d.r(40,30,100,130,4,"#fff")+d.t(90,90,"100",40,C.red,800)+d.c(90,76,40,"none",C.red,4)+d.l("M54 120 L126 120 M54 136 L110 136","#c9c3b7",3)+d.g(d.l("M-10 -40 L0 -10 L10 -40",C.blue,6)+d.c(0,6,18,C.gold)+d.star(0,6,9,"#fff",null),"translate(158 130)")+d.sparkle(30,170,8),
/* clothes and design */
"design":()=>sky("#f4f7fb")+d.r(30,30,120,140,4,"#fff")+d.l("M60 70 L90 60 L120 70 L112 140 L68 140Z",C.blue,3)+d.l("M74 64 Q90 76 106 64",C.blue,2)+d.g(d.r(-4,-50,8,60,1,C.yellow)+d.p("M-4 10 L0 20 L4 10Z",C.cream),"translate(160 110) rotate(20)")+d.g(d.r(0,0,90,12,1,"#cfe8ff")+d.l("M10 0 L10 6 M20 0 L20 6 M30 0 L30 6 M40 0 L40 6 M50 0 L50 6 M60 0 L60 6 M70 0 L70 6 M80 0 L80 6",O,1.5),"translate(40 172) rotate(-6)"),
"sew":()=>sky("#fff0f6")+d.r(30,60,140,90,6,C.pink)+d.l("M40 110 L60 110 M70 110 L90 110 M100 110 L120 110",O,3)+d.l("M130 110 Q150 80 160 50",C.red,2)+d.g(d.r(-2,-34,4,44,2,C.grey)+d.e(0,-30,2,4,"none",O,0,1.5),"translate(160 46) rotate(30)")+d.c(60,40,16,C.red)+d.l("M50 32 Q60 40 70 32 M50 48 Q60 40 70 48","#fff",2),
"clothes":()=>sky("#eef3fa")+d.l("M10 40 L190 40",C.brown,4)+d.p("M20 50 L40 44 L56 44 L76 50 L70 70 L62 66 L62 120 L34 120 L34 66 L26 70Z",C.red)+d.p("M88 48 L132 48 L136 140 L114 140 L110 80 L106 140 L84 140Z",C.blue)+d.p("M150 50 Q164 44 180 50 L184 70 L176 72 L180 130 L150 130 L154 72 L146 70Z",C.yellow),
"pajamas":()=>sky("#2c3566")+moon(160,40,12)+d.p("M40 60 L70 50 L100 50 L130 60 L124 86 L112 82 L112 130 L58 130 L58 82 L46 86Z","#9fd0ff")+d.p("M58 130 L112 130 L114 186 L90 186 L85 150 L80 186 L56 186Z","#9fd0ff")+[[70,70],[96,80],[76,104],[100,112],[70,160],[100,166]].map(([x,y])=>d.star(x,y,5,C.yellow,null)).join("")+d.c(85,66,3,"#fff",O,2)+d.c(85,80,3,"#fff",O,2),
"ice hockey":()=>sky("#e6f4ff")+d.r(8,130,184,62,0,"#fff",null)+d.l("M8 160 L192 160",C.red,3)+d.g(adult(0,0,{s:0.7,coat:C.red,pants:"#2a2630",mood:"open",hat:"hard",armR:"hold",armL:"hold",extra:d.l("M14 -88 L70 -10 L100 -10",O,6)}),"translate(80 182)")+d.e(150,176,12,5,O,null),
"school uniform":()=>sky("#f4f7fb")+d.p("M40 60 L70 46 L100 60 L130 46 L160 60 L150 100 L136 92 L136 186 L64 186 L64 92 L50 100Z","#2a3a5a")+d.p("M70 46 L100 90 L130 46 L100 60Z","#fff")+d.p("M92 74 L108 74 L100 88Z",C.red)+d.c(100,110,3,C.gold,null)+d.c(100,130,3,C.gold,null)+d.c(100,150,3,C.gold,null),
"korean":()=>sky("#fff")+kid(56,192,{s:0.9,shirt:C.blue,arm:"down",mood:"open"})+bubble(92,24,96,58,"안녕",30,C.blue2)+d.g(d.r(0,0,46,30,0,"#fff",null)+d.c(23,15,8,"#cd2e3a",null)+d.p("M15 15 A8 8 0 0 0 31 15Z","#0047a0",null)+d.r(0,0,46,30,0,"none",O,3),"translate(130 120)"),
/* unit 6 */
"him":()=>PIC.he(),"her":()=>PIC.she(),
"detective":()=>ground("#efe8dc")+adult(76,192,{s:0.82,coat:"#b89a6a",mood:"flat",hat:"cap",capCol:"#8a6a3a",armR:"out",extra:d.c(70,-118,16,"#e8f6ff",O,5)+d.l("M58 -106 L48 -96",O,6)})+[[120,184],[140,170],[160,184],[180,170]].map(([x,y])=>d.e(x,y,6,9,"#9a8a70",null)).join(""),
"monster":()=>sky("#efe8f6")+d.shadow(100,190,70)+d.p("M40 190 Q30 70 100 50 Q170 70 160 190 L140 176 L120 190 L100 176 L80 190 L60 176Z","#7ac45a")+d.p("M60 66 L50 30 L76 56Z",C.yellow)+d.p("M140 66 L150 30 L124 56Z",C.yellow)+d.c(100,96,22,"#fff")+d.c(104,98,10,O,null)+d.p("M70 140 Q100 160 130 140 Q100 152 70 140Z",O)+d.p("M80 142 L86 150 L92 144Z M108 144 L114 150 L120 142Z","#fff",null),
"pirate":()=>ground("#d7c9a0")+adult(90,192,{s:0.82,coat:"#fff",pants:"#2a3a5a",beard:true,mood:"grin",armR:"out",extra:d.p("M-34 -176 Q0 -210 34 -176 Q0 -186 -34 -176Z","#2a2630")+d.c(0,-190,5,"#fff",null)+d.e(-10,-156,8,6,O,null)+d.l("M-30 -166 L20 -146",O,2)+d.r(-26,-100,52,12,0,C.red,null)+d.g(d.p("M0 0 L60 -4 L60 4Z","#c8ccd4")+d.r(-10,-6,10,12,2,C.gold),"translate(68 -118) rotate(-40)")}),
"early":()=>sky("#ffe9c9")+d.r(8,130,184,62,0,"#a8dc8a",null)+d.p("M20 130 A80 80 0 0 1 180 130Z","#ffd9a0",null)+d.c(100,130,34,C.orange)+d.r(8,130,184,62,0,"#a8dc8a",null)+clock(150,60,26,5,0)+d.l("M100 80 L100 66 M64 96 L54 86 M136 96 L146 86",C.orange,4),
"cute":()=>sky("#fff0f6")+d.g(PIC.cat(),"translate(20 30) scale(.8)")+d.heart(160,40,14,C.pink)+d.heart(40,50,10,C.pink)+d.sparkle(160,150,9),
"cool":()=>sky("#e6f4ff")+kid(100,192,{s:1,shirt:C.blue2,arm:"up",mood:"smile"})+d.r(74,64,24,14,5,O,null)+d.r(102,64,24,14,5,O,null)+d.l("M96 70 L104 70",O,3)+d.sparkle(40,50,10)+d.sparkle(160,130,8),
"romantic":()=>sky("#ffd9c9")+d.c(100,130,40,"#ff9a6a",null)+d.r(8,130,184,62,0,"#5a6aa8",null)+d.heart(100,60,26,C.pink)+d.heart(56,90,10,C.pink)+d.heart(150,96,12,C.pink),
"hour":()=>d.shadow(100,190,60)+d.c(100,104,74,"#fff",O,6)+d.p("M100 104 L100 36 A68 68 0 0 1 159 70Z","#cfe8ff",null)+clock(100,104,70,1,0),
"savanna":()=>sky("#ffe2a8")+sunIcon(150,40,14)+d.r(8,130,184,62,0,"#e3c06a",null)+d.l("M40 130 L40 90",C.brown,6)+d.e(40,84,40,12,"#7a9a3a")+d.g(PIC.elephant(),"translate(96 84) scale(.45)")+d.l("M20 160 L26 150 M60 170 L66 160 M100 150 L106 142",C.green2,3),
"kilometer":()=>sky("#e9f7ff")+d.r(8,140,184,52,0,"#9aa3ad",null)+d.l("M8 166 L192 166","#fff",4)+d.l("M100 140 L100 60",C.grey2,6)+d.r(50,30,100,44,6,C.green)+d.t(100,62,"1 km",28,"#fff",800),
/* unit 7 */
"shopping mall":()=>sky("#e9f7ff")+d.r(20,60,160,120,4,"#f4f1ea")+d.r(20,60,160,20,4,C.blue)+d.r(36,96,40,40,2,"#cfeeff")+d.r(124,96,40,40,2,"#cfeeff")+d.r(84,120,32,60,2,"#cfeeff")+d.p("M44 120 L56 104 L68 120Z",C.red,null)+d.c(144,116,10,C.yellow,null)+d.r(8,180,184,12,0,"#d9cfbf",null)+d.g(d.p("M-14 -12 L14 -12 L18 16 L-18 16Z",C.pink)+d.l("M-8 -12 Q0 -24 8 -12",O,3),"translate(160 40)"),
"college":()=>sky("#e9f7ff")+d.r(30,80,140,90,0,"#e8dcc6")+d.p("M20 82 L100 36 L180 82Z","#a8442a")+[46,76,106,136].map(x=>d.r(x,96,16,74,0,"#fff")).join("")+clock(100,62,12,10,10)+d.r(8,170,184,22,0,"#cfeac0",null)+tree(20,176,0.6)+tree(186,176,0.6),
"plane":()=>sky("#d7efff")+cloud(50,150,0.5)+cloud(150,46,0.4)+plane(100,100,1.3,-14),
"train":()=>sky("#e9f7ff")+d.r(8,150,184,42,0,"#a8a090",null)+d.l("M8 160 L192 160 M8 176 L192 176",O,3)+train(100,138,1.2),
"cake shop":()=>sky("#fff0f6")+d.r(20,60,160,120,2,"#fff6f0")+d.p("M14 60 L186 60 L176 36 L24 36Z",C.pink)+[0,1,2,3,4,5,6,7].map(i=>d.p(`M${20+i*20} 60 Q${30+i*20} 72 ${40+i*20} 60`,i%2?"#fff":C.pink,O,2)).join("")+d.r(36,90,80,60,2,"#cfeeff")+d.g(PIC.cake(),"translate(44 92) scale(.32)")+d.r(132,100,34,80,2,C.brown),
"near":()=>sky("#e9f7ff")+d.r(8,150,184,42,0,"#cfeac0",null)+kid(60,190,{s:0.9,shirt:C.blue,arm:"down",mood:"smile"})+d.g(PIC.house(),"translate(90 60) scale(.6)")+d.l("M76 70 L100 70",C.green2,4),
"far":()=>sky("#e9f7ff")+d.r(8,150,184,42,0,"#cfeac0",null)+kid(40,190,{s:0.9,shirt:C.blue,arm:"down",mood:"o"})+d.g(PIC.house(),"translate(160 126) scale(.16)")+d.l("M70 160 L150 140",C.grey2,3)+d.p("M140 132 L156 140 L140 148Z",C.grey2,null),
/* unit 8 */
"bathroom":()=>room("#eaf4ff","#cfdbe6",d.r(24,100,100,50,20,"#fff")+d.r(30,100,88,14,7,"#7cc4ff",null)+d.l("M40 70 L40 100",C.grey2,4)+d.e(48,70,10,4,C.grey)+d.r(140,84,40,30,6,"#fff")+d.r(150,114,20,40,0,"#fff")+d.r(146,56,30,24,4,"#cfeeff")),
"shower":()=>sky("#eaf4ff")+d.l("M140 20 L140 50 L110 50",C.grey2,6)+d.e(104,56,22,8,C.grey)+[[90,80],[100,90],[110,80],[120,96],[96,104],[86,96],[114,110]].map(([x,y])=>d.l(`M${x} ${y} L${x-2} ${y+10}`,"#4a8fe8",3)).join("")+kid(100,196,{s:0.7,shirt:C.skin,pants:C.skin,arm:"both",mood:"grin"})+d.c(70,130,8,"#fff",O,2)+d.c(130,120,6,"#fff",O,2),
"persimmon":()=>d.shadow(100,184,60)+d.e(100,118,68,58,"#ff8a1c")+d.shine(76,100,12,18,20)+d.p("M70 66 L100 74 L130 66 L118 84 L100 80 L82 84Z",C.green2,O,3)+d.l("M100 74 L100 52",C.brown,5),
"countdown":()=>sky("#1d2350")+firework(50,50,26,C.pink)+firework(150,46,22,C.yellow)+[5,4,3,2,1].map((n,i)=>d.c(28+i*36,130,16,i===4?C.red:"#fff")+d.t(28+i*36,138,""+n,20,i===4?"#fff":O,800)).join(""),
"listen to music":()=>sky("#f4f0ff")+kid(100,196,{s:1,shirt:C.purple,arm:"down",mood:"smile"})+d.p("M66 80 Q66 30 100 30 Q134 30 134 80","none",O,6)+d.r(58,70,16,28,6,C.red)+d.r(126,70,16,28,6,C.red)+note(40,60,C.purple)+note(166,50,C.pink),
"busy":()=>sky("#fff4e6")+kid(100,196,{s:0.9,shirt:C.orange,arm:"both",mood:"o"})+bookOpen(50,50,0.5)+phone(150,46,0.7,20)+clock(166,110,18,5,0)+d.p("M30 110 Q26 120 30 124 Q34 120 30 110Z","#a8dcff",O,2)+d.r(20,130,40,30,4,C.blue),
"today":()=>sky("#eef8ff")+d.r(40,40,120,120,12,"#fff")+d.r(40,40,120,32,12,C.red)+d.r(40,62,120,10,0,C.red,null)+d.c(100,118,30,"none",C.red,6)+d.t(100,132,"★",36,C.gold,800),
/* unit 9 */
"holiday":()=>d.r(8,8,184,184,14,"#e9f7ff",null)+d.r(30,40,90,90,10,"#fff")+d.r(30,40,90,24,10,C.red)+d.r(30,56,90,8,0,C.red,null)+d.c(75,100,20,"none",C.red,5)+d.p("M120 180 Q150 120 180 130",null,O,4)+d.p("M140 150 Q170 110 196 140Z",C.yellow)+d.r(8,170,184,22,0,"#f3dfa8",null)+sunIcon(160,50,12),
"relax":()=>sky("#e9f7ff")+d.r(8,160,184,32,0,"#a8dc8a",null)+tree(30,170,0.9)+tree(170,170,0.9)+d.p("M40 110 Q100 150 160 110 L160 118 Q100 160 40 118Z","#ff9a6a")+headFace(70,112,18,{mood:"smile"})+d.p("M84 118 Q120 136 150 116 L150 124 Q120 144 84 126Z",C.blue,null)+d.t(110,70,"z",18,C.blue2,800),
"yesterday":()=>sky("#eef8ff")+d.r(40,40,120,120,12,"#fff")+d.r(40,40,120,32,12,C.red)+d.r(40,62,120,10,0,C.red,null)+d.t(100,134,"−1",50,C.red2,800)+past(150,160),
"cooked":pastOf("cook"),"watched":pastOf("watch movies"),"played":pastOf("play"),"studied":pastOf("study"),"did":pastOf("homework"),
"aurora":()=>sky("#14183a")+d.p("M8 90 Q50 30 100 70 Q150 110 192 50 L192 90 Q150 140 100 100 Q50 60 8 120Z","#5affb0",null)+d.p("M8 70 Q60 20 110 60 Q150 90 192 30 L192 50 Q150 110 110 76 Q60 40 8 90Z","#a07aff",null)+d.r(8,150,184,42,0,"#2a3a5a",null)+d.p("M8 160 L50 130 L90 160 L130 120 L192 160 L192 192 L8 192Z","#1a2440",null)+[[30,30],[170,24],[150,150],[60,140]].map(([x,y])=>d.c(x,y,2,"#fff",null)).join(""),
"lucky":()=>d.shadow(100,186,40)+[0,90,180,270].map(a=>d.g(d.heart(0,-34,26,"#4aae4a"),`translate(100 100) rotate(${a})`)).join("")+d.c(100,100,8,"#3a8a33",null)+d.l("M100 108 Q110 150 130 180",C.green2,6)+d.sparkle(160,40,10)+d.sparkle(40,160,8),
"take a walk":()=>PIC.walk(),
"medical checkup":()=>ground("#eef3f8")+adult(56,192,{s:0.8,coat:"#fff",armR:"out",extra:scope})+kid(140,180,{s:0.75,shirt:"#fff",arm:"down",mood:"open"})+d.r(110,180,60,10,3,C.grey)+d.l("M176 40 L176 180",C.grey2,4)+d.l("M160 70 L176 70",C.grey2,4),
"jet lag":()=>sky("#2c3566")+bigHead("flat",d.l("M70 98 L88 98 M112 98 L130 98",O,4))+plane(150,40,0.5,-10)+clock(40,50,20,3,0)+d.t(150,110,"z",22,"#fff",800),
"sleep":()=>PIC["go to bed"](),
"win":()=>sky("#fff7df")+d.p("M60 40 L140 40 L134 90 Q100 120 66 90Z",C.gold)+d.p("M60 50 Q36 50 40 70 Q44 86 64 84","none",O,5)+d.p("M140 50 Q164 50 160 70 Q156 86 136 84","none",O,5)+d.r(90,110,20,30,0,C.gold)+d.r(66,140,68,20,4,C.brown)+d.star(100,70,14,"#fff",null)+d.sparkle(30,40,10)+d.sparkle(170,130,10),
"have a good time":()=>PIC.enjoyed(),
/* unit 10 */
"at a theater":()=>PIC["movie theater"](),"at a stadium":()=>PIC.stadium(),"at home":()=>PIC.house(),
"story":()=>sky("#fff6e6")+bookOpen(100,140,1.5,"#fff","#fff")+d.g(d.r(-20,-30,40,30,0,"#c8ccd4")+d.r(-28,-46,14,20,0,"#c8ccd4")+d.r(14,-46,14,20,0,"#c8ccd4")+d.p("M-30 -46 L-21 -60 L-12 -46Z",C.red)+d.p("M12 -46 L21 -60 L30 -46Z",C.red)+d.r(-6,-14,12,14,6,C.brown),"translate(100 92)")+d.star(50,40,8,C.gold,O,2)+d.star(150,40,8,C.gold,O,2),
"call":()=>sky("#eef8ff")+kid(70,192,{s:0.9,shirt:C.green,arm:"wave",mood:"open"})+phone(100,72,0.55,-20)+d.l("M120 50 Q132 60 120 70 M130 40 Q148 60 130 80",C.blue2,4),
"surprised":()=>sky("#f4f7fb")+bigHead("o",d.c(78,92,12,"#fff",O,3)+d.c(122,92,12,"#fff",O,3)+d.c(78,92,5,O,null)+d.c(122,92,5,O,null)+d.t(166,52,"!",44,C.red,800)),
"surf the internet":()=>PIC.internet(),
"watch videos":()=>sky("#f4f7fb")+kid(100,200,{s:0.95,shirt:C.blue,arm:"down",mood:"open"})+d.r(54,110,92,64,8,"#3a3f50")+d.r(60,116,80,52,3,"#7cc4ff",null)+d.p("M92 128 L114 142 L92 156Z","#fff",null),
"comic":()=>d.shadow(100,186,60)+d.r(46,30,108,150,4,C.yellow)+d.r(56,40,88,40,2,"#fff")+d.r(56,86,40,40,2,"#fff")+d.r(104,86,40,40,2,"#fff")+d.r(56,132,88,38,2,"#fff")+headFace(76,60,12,{mood:"grin"})+d.t(120,66,"POW",14,C.red,800)+d.star(76,106,9,C.gold,O,2)+headFace(124,106,12,{mood:"o"})+d.l("M66 150 L134 150",O,3),
"textbook":()=>d.shadow(100,186,60)+d.r(50,30,100,150,6,C.green)+d.r(50,30,14,150,4,C.green2)+d.r(70,50,70,40,4,"#fff")+d.t(105,78,"ABC",20,C.green2,800)+d.c(105,130,18,"#fff")+d.t(105,136,"Hi!",14,C.blue2,800),
"finish":()=>ground("#d9604a")+d.l("M30 186 L30 40 M170 186 L170 40",C.grey2,6)+d.l("M30 100 L170 100","#fff",6)+[0,1,2,3,4,5,6].map(i=>d.r(30+i*20,40,20,16,0,i%2?"#fff":O,null)).join("")+d.g(kid(0,0,{s:0.7,shirt:C.blue,arm:"both",mood:"grin"}),"translate(100 186)"),
"awesome":()=>PIC.great()
});

/* ---------- Sunshine English Course 2 and 3 ---------- */
const giftBox=(x,y,s,f,rib)=>d.g(d.r(-40,-20,80,60,4,f||C.red)+d.r(-46,-36,92,20,4,f||C.red)+d.r(-7,-36,14,76,0,rib||C.yellow)+d.p("M0 -36 Q-30 -66 -26 -40 Q-22 -32 0 -36 Q22 -32 26 -40 Q30 -66 0 -36Z",rib||C.yellow),`translate(${x} ${y}) scale(${s||1})`);
const pumpkin=(x,y,s)=>d.g(d.e(-22,0,26,36,"#ff8a1c")+d.e(22,0,26,36,"#ff8a1c")+d.e(0,0,26,38,"#ffa03c")+d.r(-4,-46,8,14,3,C.green2)+d.p("M-22 -8 L-12 -16 L-6 -6Z M22 -8 L12 -16 L6 -6Z",O,null)+d.p("M-20 12 Q0 26 20 12 L14 16 L8 12 L0 18 L-8 12 L-14 16Z",O,null),`translate(${x} ${y}) scale(${s||1})`);
const ruler=(x,y,w,lab)=>{let g=d.r(x,y,w,30,3,C.yellow);for(let i=0;i<=10;i++)g+=d.l(`M${x+i*w/10} ${y} L${x+i*w/10} ${y+(i%5?8:14)}`,O,2);return g+d.t(x+w/2,y+26,lab,12,O,800);};
const cup=(x,y,s,f,inner)=>d.g(d.p("M-26 -30 L26 -30 L20 30 L-20 30Z",f||"#fff")+d.e(0,-30,26,7,inner||"#7a4a20")+d.l("M24 -14 Q44 -10 40 10 Q36 20 22 18",O,4),`translate(${x} ${y}) scale(${s||1})`);
const bottle=(x,y,s,f,lab)=>d.g(d.p("M-10 -60 L10 -60 L10 -44 Q26 -36 26 -14 L26 50 Q26 56 20 56 L-20 56 Q-26 56 -26 50 L-26 -14 Q-26 -36 -10 -44Z",f||"#cfe8ff")+d.r(-12,-72,24,14,3,lab||C.blue)+d.r(-26,0,52,30,0,lab||C.blue,null)+d.shine(-14,-10,4,14),`translate(${x} ${y}) scale(${s||1})`);
const sofa=(x,y,s,f)=>d.g(d.r(-70,-50,140,50,14,f||"#6a8fd6")+d.r(-84,-30,24,50,10,f||"#6a8fd6")+d.r(60,-30,24,50,10,f||"#6a8fd6")+d.r(-62,-6,124,26,8,f||"#6a8fd6")+d.r(-70,18,8,12,2,C.brown)+d.r(62,18,8,12,2,C.brown),`translate(${x} ${y}) scale(${s||1})`);
const yatai=(x,y,s,txt,f)=>d.g(d.r(-60,-30,120,70,2,"#c98d4e")+d.p("M-70 -30 L70 -30 L60 -60 L-60 -60Z",f||C.red)+d.l("M-46 -60 L-46 -30 M-20 -60 L-20 -30 M6 -60 L6 -30 M32 -60 L32 -30","#fff6",4)+d.r(-40,-80,80,22,3,"#fff")+d.t(0,-63,txt,16,f||C.red,800)+lantern(-66,-14,0.55)+lantern(66,-14,0.55),`translate(${x} ${y}) scale(${s||1})`);
const goldfish=(x,y,s,f)=>d.g(d.e(0,0,16,11,f||"#ff6a2a")+d.p("M14 0 L28 -12 Q24 0 28 12Z",f||"#ff6a2a")+d.c(-8,-2,2.5,O,null),`translate(${x} ${y}) scale(${s||1})`);
const diner=(f)=>d.r(8,8,184,184,14,f||"#fff6e6",null)+d.r(8,140,184,52,0,"#c98d4e",null);
Object.assign(PIC,{
/* Course 2 unit 1 */
"go shopping":()=>sky("#fff0f6")+d.r(8,160,184,32,0,"#d9cfbf",null)+kid(96,190,{s:0.95,shirt:C.purple,arm:"down",mood:"grin",girl:true})+[[56,150,C.pink],[140,150,C.yellow],[150,164,C.blue]].map(([x,y,f])=>d.g(d.p("M-16 -14 L16 -14 L20 18 L-20 18Z",f)+d.l("M-8 -14 Q0 -28 8 -14",O,3),`translate(${x} ${y})`)).join(""),
"see a movie":()=>PIC["watch movies"](),
"stay home":()=>room("#fff6e6","#d9c9b0",sofa(100,150,0.95,"#6a8fd6")+headFace(100,104,22,{mood:"smile"})+d.r(80,122,40,26,8,C.green)+d.r(30,40,50,40,2,"#cfeeff")+d.l("M55 40 L55 80 M30 60 L80 60",O,2)+cup(160,126,0.4,"#fff","#7a4a20")),
"eat ramen":()=>diner("#fffbe9")+headFace(100,72,30,{mood:"open"})+d.g(PIC.noodle(),"translate(40 76) scale(.6)"),
"go fishing":()=>sky("#d7efff")+d.r(8,120,184,72,0,"#3f9be8",null)+d.p("M8 120 L70 120 L70 192 L8 192Z","#a8774a",null)+kid(40,124,{s:0.7,shirt:C.yellow,arm:"up",mood:"open"})+d.l("M66 34 Q120 20 160 40",C.brown,4)+d.l("M160 40 L160 140",O,1.5)+d.c(160,124,5,C.red,O,2)+goldfish(140,160,1,"#ffc040"),
"read manga":()=>sky("#fff6e6")+kid(100,200,{s:1,shirt:C.orange,arm:"down",mood:"grin"})+d.r(54,104,92,70,4,C.yellow)+d.r(60,110,38,26,1,"#fff")+d.r(102,110,38,26,1,"#fff")+d.r(60,140,80,28,1,"#fff")+d.star(79,123,8,C.red,O,2)+d.t(121,128,"!?",14,O,800)+d.c(54,150,8,C.skin)+d.c(146,150,8,C.skin),
"farewell party":()=>sky("#fff0f6")+d.l("M8 30 Q100 60 192 30",O,2)+[30,60,90,120,150].map((x,i)=>d.p(`M${x} ${36+(x<100?x/8:(200-x)/8)} l20 2 l-10 16Z`,[C.red,C.yellow,C.blue,C.green,C.pink][i],O,2)).join("")+d.r(30,62,140,30,4,"#fff")+d.t(100,84,"Goodbye!",20,C.pink2,800)+
  [50,100,150].map((x,i)=>kid(x,190,{s:0.55,shirt:[C.blue,C.pink,C.green][i],arm:i===1?"both":"wave",mood:"open",girl:i===1})).join("")+d.r(84,150,32,16,3,"#fff")+d.c(100,146,4,C.red),
"worried":()=>sky("#eef0f4")+bigHead("flat",d.l("M64 76 L86 84 M136 76 L114 84",O,4)+d.p("M150 70 Q146 82 150 86 Q154 82 150 70Z","#a8dcff",O,2)),
"cry":()=>sky("#eef3fa")+bigHead("o",d.l("M64 92 L88 92 M112 92 L136 92",O,4)+d.p("M70 100 Q60 130 70 150 Q80 130 76 100Z","#7cc4ff",O,2)+d.p("M130 100 Q140 130 130 150 Q120 130 124 100Z","#7cc4ff",O,2)),
"picnic":()=>sky("#e9f7ff")+d.r(8,120,184,72,0,"#a8dc8a",null)+d.p("M30 150 L170 140 L186 186 L20 190Z",C.red)+d.l("M60 148 L56 188 M100 145 L100 189 M140 142 L146 188 M26 168 L178 162","#fff",3)+d.p("M70 120 L130 120 L124 156 L76 156Z","#d9a866")+d.l("M80 120 Q100 92 120 120",C.brown,4)+d.c(150,156,10,C.red)+d.r(40,156,26,14,4,"#fff")+tree(30,124,0.7)+sunIcon(160,40,12),
"text":()=>sky("#eef8ff")+phone(100,104,2,0)+d.r(76,64,40,16,8,"#fff",null)+d.r(84,90,40,16,8,"#9fe0a0",null)+d.r(76,116,46,16,8,"#fff",null),
"overseas":()=>sky("#d7efff")+d.c(100,110,60,"#4a8fe8")+d.p("M60 80 Q80 70 90 90 Q80 110 64 104Z M110 70 Q140 70 150 100 Q130 120 116 100Z M90 130 Q110 126 120 150 Q100 160 90 150Z",C.green,null)+d.c(100,110,60,"none")+d.l("M30 70 Q100 0 170 60",C.grey2,3)+plane(160,50,0.4,20),
"forget":()=>sky("#f4f7fb")+headFace(70,130,40,{mood:"flat"})+d.c(110,90,6,"#fff",O,3)+d.c(124,72,9,"#fff",O,3)+d.c(150,44,30,"#fff")+d.t(150,58,"?",40,C.grey2,800),
"move":()=>sky("#e9f7ff")+d.r(8,160,184,32,0,"#c9cfd8",null)+d.r(20,70,110,90,4,"#fff")+d.r(130,100,56,60,4,C.blue)+d.r(140,108,30,22,3,"#cfeeff")+d.c(50,166,12,"#3a3f50")+d.c(110,166,12,"#3a3f50")+d.c(160,166,12,"#3a3f50")+d.r(30,96,40,36,2,"#d9a866")+d.r(76,106,40,30,2,"#d9a866")+d.l("M30 110 L70 110 M76 118 L116 118",C.brown,2),
/* unit 2 */
"hear":()=>sky("#f4f7fb")+d.p("M100 30 Q160 30 160 90 Q160 124 132 140 Q120 150 118 168 Q116 190 96 186 Q78 182 82 160 Q86 140 100 130 Q70 110 70 80 Q70 30 100 30Z",C.skin)+d.p("M100 60 Q130 60 130 90 Q130 110 110 114",null,O,4)+d.l("M50 70 Q40 90 50 110 M34 60 Q18 90 34 120",C.blue2,4),
"root for":()=>PIC.cheering(),
"cheering":()=>sky("#e9f7ff")+d.r(8,150,184,42,0,"#cfeac0",null)+[50,100,150].map((x,i)=>kid(x,190,{s:0.6,shirt:[C.red,C.yellow,C.blue][i],arm:"both",mood:"grin",girl:i===1})).join("")+d.l("M74 120 L90 60 M124 120 L140 60",C.brown,3)+d.p("M90 60 L120 66 L88 80Z",C.red)+d.p("M140 60 L170 66 L138 80Z",C.blue)+d.t(100,40,"GO!",28,C.red,800),
"easy":()=>sky("#eef8ee")+d.r(30,40,140,80,8,"#fff")+d.t(100,96,"1 + 1",40,O,800)+headFace(100,160,24,{mood:"grin"})+d.c(160,150,16,C.green)+d.l("M152 150 L158 156 L170 142","#fff",4),
"difficult":()=>sky("#fff0ee")+d.r(20,30,160,90,8,"#fff")+d.t(100,70,"x² + 7x",26,O,800)+d.t(100,104,"= 3y − ∫",22,O,800)+headFace(100,160,24,{mood:"o"})+d.p("M150 140 Q146 150 150 154 Q154 150 150 140Z","#a8dcff",O,2),
"history":()=>sky("#f6efe2")+d.p("M40 50 L160 50 L160 160 L40 160Z","#f1e2b8")+d.r(30,40,140,16,8,"#c9a36a")+d.r(30,154,140,16,8,"#c9a36a")+d.g(d.p("M-30 10 Q-30 -30 0 -32 Q30 -30 30 10Z","#5a6070")+d.p("M-36 4 L36 4 L30 16 L-30 16Z","#5a6070")+d.p("M0 -32 L-24 -54 L-8 -30 M0 -32 L24 -54 L8 -30",C.gold,O,3),"translate(100 104)")+d.l("M50 140 L150 140","#b9a070",2),
"interested":()=>sky("#fff7df")+kid(80,200,{s:1,shirt:C.blue,arm:"down",mood:"open"})+d.star(66,82,7,C.gold,null)+d.star(94,82,7,C.gold,null)+d.g(PIC.book(),"translate(110 30) scale(.45)")+d.sparkle(170,110,8),
"scarf":()=>d.shadow(100,186,60)+d.p("M40 60 Q100 90 160 60 L164 84 Q100 116 36 84Z",C.red)+d.p("M120 90 L140 180 L110 184 L100 98Z",C.red)+d.l("M60 70 L60 92 M80 78 L80 100 M100 82 L100 104 M120 80 L120 100 M140 72 L140 92","#fff",4)+d.l("M114 184 L112 196 M122 184 L122 196 M132 182 L134 194",C.red2,3),
"bag":()=>d.shadow(100,186,60)+d.r(40,70,120,110,14,C.blue)+d.p("M70 70 Q70 30 100 30 Q130 30 130 70","none",O,8)+d.r(40,90,120,20,0,C.blue2,null)+d.r(88,96,24,16,3,C.gold),
"flag":()=>d.shadow(100,184,40)+d.r(40,20,8,166,3,"#b8a07a")+d.p("M48 26 Q100 10 150 34 Q130 60 160 84 Q100 70 48 86Z",C.red)+d.star(94,56,12,"#fff",null),
"watch tv":()=>room("#fff6e6","#d9c9b0",d.r(100,40,80,60,6,"#2a2f3a")+d.r(106,46,68,48,3,"#7cc4ff",null)+d.c(140,70,10,C.yellow)+d.r(130,100,20,10,0,"#555")+kid(56,180,{s:0.8,shirt:C.green,arm:"down",mood:"open"})),
"study english":()=>sky("#eef8ff")+kid(100,200,{s:1,shirt:C.blue,arm:"down",mood:"open"})+d.r(50,104,100,70,4,C.green)+d.r(62,114,76,50,4,"#fff")+d.t(100,148,"ABC",26,C.green2,800)+d.c(50,150,8,C.skin)+d.c(150,150,8,C.skin),
"practice soccer":()=>PIC["play soccer"](),
"hit":()=>sky("#e9f7ff")+d.g(d.p("M-5 -100 Q-8 -40 -4 0 L4 0 Q8 -40 5 -100 Q0 -104 -5 -100Z","#c98d4e"),"translate(60 150) rotate(60) scale(1.1)")+d.c(150,90,14,"#fff",O,3)+d.l("M144 78 Q152 90 144 102",C.red,2)+[0,1,2,3,4,5].map(i=>{const a=Math.PI*0.7+i*Math.PI/8;return d.l(`M${(130+Math.cos(a)*26).toFixed(1)} ${(90+Math.sin(a)*26).toFixed(1)} L${(130+Math.cos(a)*42).toFixed(1)} ${(90+Math.sin(a)*42).toFixed(1)}`,C.orange,4);}).join(""),
"home run":()=>sky("#1d2350")+d.r(8,130,184,62,0,"#3fae4a",null)+d.r(8,120,184,14,0,"#2a6a3a")+d.p("M30 180 Q100 -10 170 40",null,"#fff8",3)+d.c(170,40,10,"#fff",O,3)+d.t(100,166,"HOME RUN!",22,C.yellow,800),
"go cycling":()=>sky("#e9f7ff")+d.r(8,160,184,32,0,"#c9cfd8",null)+bicycle(100,160,1)+d.g(kid(0,0,{s:0.7,shirt:C.red,arm:"down",mood:"grin"}),"translate(96 150)").replace(/<rect x="-15"[^>]*>|<rect x="3"[^>]*>/g,"")+speed(8,90),
"cycle":()=>PIC["go cycling"](),
"rain":()=>sky("#c9d3e3")+cloud(100,50,1,"#9aa3ad")+[[50,90],[80,110],[110,90],[140,110],[66,140],[96,160],[126,140],[156,160]].map(([x,y])=>d.p(`M${x} ${y} Q${x-6} ${y+12} ${x} ${y+16} Q${x+6} ${y+12} ${x} ${y}Z`,"#4a8fe8",O,2)).join(""),
"coach":()=>ground("#7cc46a")+adult(90,192,{s:0.82,coat:C.red,pants:"#2a2630",hat:"cap",capCol:C.red2,mood:"open",armR:"hold",armL:"down",extra:d.r(6,-110,30,38,3,"#fff")+d.l("M12 -100 L30 -100 M12 -90 L26 -90",C.grey2,2)+d.l("M-10 -132 L-14 -110",O,2)+d.e(-16,-106,6,4,C.grey)})+d.l("M150 40 L176 30 M150 50 L180 50",C.grey,3),
"university":()=>PIC.college(),
"peace":()=>sky("#e9f7ff")+d.p("M60 110 Q70 70 110 72 Q140 74 150 60 Q160 80 140 100 Q120 130 80 130 Q50 130 40 140 Q46 120 60 110Z","#fff")+d.p("M90 90 Q100 40 140 30 Q126 70 110 90Z","#fff")+d.c(140,64,3,O,null)+d.p("M154 62 L166 66 L154 70Z",C.orange)+d.l("M160 70 Q170 90 160 110",C.green2,3)+d.e(166,86,8,4,C.leaf,O,30,2)+d.e(156,100,8,4,C.leaf,O,-30,2),
"championship":()=>PIC.win(),
/* unit 3 */
"wait":()=>sky("#e9f7ff")+d.r(8,160,184,32,0,"#c9cfd8",null)+d.l("M150 186 L150 60",C.grey2,5)+d.c(150,56,18,"#fff",O,4)+d.t(150,62,"BUS",11,C.blue2,800)+kid(80,190,{s:0.9,shirt:C.yellow,arm:"down",mood:"flat"})+clock(36,50,22,3,15)+d.t(130,120,"...",30,C.grey2,800),
"play with my dog":()=>d.r(0,160,200,40,0,"#cfeac0",null)+kid(56,188,{s:0.85,shirt:C.blue,arm:"up",mood:"grin"})+d.g(PIC.dog(),"translate(96 100) scale(.5)")+d.c(130,40,10,C.red)+d.l("M100 66 Q116 40 120 44",C.grey,3),
"scoop":()=>sky("#e9f7ff")+d.e(100,150,80,30,"#7cc4ff")+goldfish(70,150,1)+goldfish(120,160,0.9,"#ff4a2a")+goldfish(140,140,0.8)+d.g(d.c(0,0,26,"#fff",O,5)+d.c(0,0,22,"#fff8",null)+d.r(-4,26,8,50,3,C.red),"translate(110 90) rotate(-30)")+goldfish(110,90,0.9),
"catch":()=>sky("#e9f7ff")+d.r(8,160,184,32,0,"#cfeac0",null)+kid(100,190,{s:0.95,shirt:C.orange,arm:"both",mood:"open"})+d.c(100,44,14,"#fff",O,3)+d.l("M94 32 Q100 44 94 56",C.red,2)+d.l("M70 24 L82 34 M60 40 L74 44",C.grey,3),
"bowl":()=>d.shadow(100,184,70)+d.p("M24 90 Q28 170 100 172 Q172 170 176 90Z","#e8483f")+d.e(100,90,76,18,"#fff")+d.e(100,92,66,12,"#f4ece0",null)+d.l("M50 130 Q100 146 150 130","#fff8",4),
"bitter":()=>sky("#eef0e6")+bigHead("flat",d.l("M66 92 L86 98 M134 92 L114 98",O,4)+d.p("M84 128 L92 122 L100 128 L108 122 L116 128",null,O,4))+cup(160,150,0.6,"#fff","#4a2a10"),
"sour":()=>sky("#fffbe0")+bigHead("o",d.l("M66 98 L86 92 M134 98 L114 92",O,5))+d.g(PIC.lemon(),"translate(118 112) scale(.4)"),
"soft":()=>sky("#f6f0ff")+d.p("M24 130 Q20 90 100 88 Q180 90 176 130 Q180 170 100 168 Q20 170 24 130Z","#fff")+d.l("M50 110 Q56 120 50 130 M150 110 Q144 120 150 130","#d0c8e0",3)+headFace(100,104,30,{mood:"smile"})+d.l("M86 106 L94 106 M106 106 L114 106",O,3)+d.p("M70 120 Q100 136 130 120 L130 128 Q100 144 70 128Z","#fff",null)+d.sparkle(40,50,9)+d.sparkle(164,44,8),
"present":()=>d.shadow(100,184,60)+giftBox(100,130,1.3),
"cheese":()=>d.shadow(100,184,70)+d.p("M30 150 L30 100 L170 70 L170 120Z","#ffd23f")+d.p("M30 100 L170 70 L120 50 Z","#ffe47a")+d.p("M170 70 L170 120 L176 118 L176 72Z","#e0a91f")+d.c(70,120,10,"#e0a91f",null)+d.c(120,112,7,"#e0a91f",null)+d.c(146,96,6,"#e0a91f",null)+d.c(100,74,8,"#e0a91f",null),
"corn dog":()=>d.shadow(100,186,40)+d.r(94,120,12,70,3,"#e7cf8e")+d.e(100,84,30,58,"#d98f45")+d.l("M78 70 Q90 64 100 70 M78 90 Q90 84 100 90",C.brown,2)+d.l("M86 40 Q110 60 90 80 Q112 100 92 120",C.red,4),
"cotton candy":()=>d.shadow(100,190,30)+d.r(94,110,12,80,3,"#fff")+[[100,70,40],[70,80,26],[130,80,26],[86,48,24],[116,48,24]].map(([x,y,r])=>d.c(x,y,r,"#ffb0d0")).join("")+[[100,70,32],[86,48,16],[116,48,16]].map(([x,y,r])=>d.c(x,y,r,"#ffc4dc",null)).join(""),
"food stand":()=>sky("#2c3566")+d.r(8,160,184,32,0,"#5a4a3a",null)+yatai(100,140,1.1,"やきそば",C.red),
"goldfish":()=>sky("#e9f7ff")+d.e(100,120,80,50,"#bfe7ff")+goldfish(80,110,2.2)+goldfish(140,140,1.2,"#ff4a2a")+d.c(60,70,6,"#fff",O,2)+d.c(70,52,4,"#fff",O,2),
/* unit 4 */
"deer":()=>d.shadow(100,186,60)+d.r(60,130,10,54,4,"#b07040")+d.r(130,130,10,54,4,"#b07040")+d.e(100,130,50,26,"#c98040")+[[80,120],[100,130],[116,118],[90,140]].map(([x,y])=>d.c(x,y,4,"#fff",null)).join("")+d.p("M130 120 L146 70 L164 76 L154 124Z","#c98040")+d.e(158,64,18,14,"#c98040")+d.c(160,62,3,O,null)+d.c(172,68,3,O,null)+d.l("M150 52 L140 30 L130 34 M144 40 L152 28 M164 50 L172 28 L182 30 M170 38 L162 26",C.brown2,4),
"guitarist":()=>PIC.musician(),
"see my cousin":()=>PIC.cousin(),
"get a new watch":()=>sky("#fff7df")+giftBox(70,140,0.8)+d.g(d.r(-12,-56,24,112,8,C.brown)+d.c(0,0,26,C.gold)+d.c(0,0,20,"#fff",O,3)+d.l("M0 0 L0 -12 M0 0 L10 4",O,3),"translate(140 90) rotate(20)")+d.sparkle(40,50,10)+d.sparkle(176,170,8),
"volume":()=>sky("#f4f7fb")+d.p("M30 80 L60 80 L96 50 L96 150 L60 120 L30 120Z",C.grey2)+[0,1,2,3,4].map(i=>d.r(110+i*16,130-i*16,12,20+i*16,2,i<4?C.green:"#ddd")).join(""),
"chips":()=>d.shadow(100,186,60)+d.p("M50 30 L150 30 L156 50 L150 170 L156 186 L44 186 L50 170 L44 50Z",C.red)+d.r(64,70,72,50,8,"#fff")+d.e(84,96,16,10,C.yellow,O,-20,2)+d.e(114,92,16,10,C.yellow,O,20,2)+d.t(100,150,"CHIPS",18,"#fff",800),
"hood":()=>sky("#eef3fa")+d.p("M50 120 Q40 40 100 36 Q160 40 150 120Z",C.green)+headFace(100,96,32,{mood:"smile"})+d.p("M58 86 Q60 50 100 48 Q140 50 142 86 Q136 64 100 62 Q64 64 58 86Z",C.green)+d.p("M40 186 L50 120 L150 120 L160 186Z",C.green)+d.l("M90 130 L88 160 M110 130 L112 160","#fff",3),
"cook dinner":()=>PIC.cook(),
"smartphone":()=>d.shadow(100,186,40)+phone(100,104,2.2,0)+d.r(80,60,40,30,4,C.green,null)+d.r(80,96,18,18,4,C.blue,null)+d.r(102,96,18,18,4,C.orange,null),
"hike":()=>PIC.hiking(),
"guide":()=>ground("#e6eef4")+adult(76,192,{s:0.82,coat:C.blue,hat:"cap",capCol:C.yellow,mood:"open",armR:"up",extra:d.l("M42 -176 L42 -230",O,3)})+d.p("M110 22 L150 28 L112 44Z",C.yellow)+kid(130,190,{s:0.5,shirt:C.red,arm:"down",mood:"open"})+kid(170,190,{s:0.5,shirt:C.green,arm:"down",mood:"open",girl:true}),
/* unit 5 */
"tablet":()=>d.shadow(100,186,60)+d.r(40,40,120,140,10,"#3a3f50")+d.r(50,50,100,116,3,"#cfeeff",null)+d.c(100,172,4,"#888",null)+d.r(60,62,36,26,4,C.blue,null)+d.r(104,62,36,26,4,C.green,null)+d.r(60,96,36,26,4,C.orange,null)+d.r(104,96,36,26,4,C.pink,null),
"chess":()=>d.shadow(100,186,70)+[0,1,2,3].map(r=>[0,1,2,3].map(c=>d.r(30+c*35,110+r*18,35,18,0,(r+c)%2?"#8a5a2b":"#f1d9a8",null)).join("")).join("")+d.r(30,110,140,72,0,"none")+
  d.g(d.p("M-14 30 L14 30 L10 4 Q16 -10 6 -16 Q12 -30 0 -36 Q-12 -30 -6 -16 Q-16 -10 -10 4Z","#fff")+d.l("M-4 -40 L4 -40 M0 -44 L0 -36",O,3),"translate(80 96)")+d.g(d.p("M-14 30 L14 30 L10 0 Q20 -10 10 -30 L-6 -20 L-10 -30 Q-16 -6 -10 0Z","#3a3f50"),"translate(130 96)"),
"play the drums":()=>sky("#f4f0ff")+kid(100,150,{s:0.8,shirt:C.red,arm:"both",mood:"grin"})+d.e(100,150,40,24,"#fff")+d.r(60,150,80,34,0,C.red)+d.e(100,184,40,8,C.red)+d.e(46,120,24,8,C.gold)+d.e(154,120,24,8,C.gold)+d.l("M68 60 L52 100 M132 60 L148 100",C.brown,4)+note(30,40,C.purple),
"ride a unicycle":()=>sky("#e9f7ff")+d.r(8,170,184,22,0,"#c9cfd8",null)+d.c(100,160,18,"none",O,5)+d.l("M100 160 L100 116",O,4)+d.e(100,114,12,5,O,null)+d.g(kid(0,0,{s:0.65,shirt:C.purple,arm:"both",mood:"grin"}),"translate(100 116)")+d.l("M40 60 Q30 70 40 80 M160 60 Q170 70 160 80",C.grey,3),
"meter":()=>sky("#f4f7fb")+ruler(10,90,180,"1 m")+d.l("M10 140 L190 140",C.red,3)+d.p("M10 140 L20 134 L20 146Z M190 140 L180 134 L180 146Z",C.red,null)+d.t(100,170,"100 cm",22,C.red2,800),
"athlete":()=>PIC.runner(),
"get first place":()=>sky("#fff7df")+d.r(70,120,60,70,0,C.gold)+d.r(10,146,60,44,0,"#c8ccd4")+d.r(130,156,60,34,0,"#d9a066")+d.t(100,166,"1",36,"#fff",800)+d.t(40,178,"2",26,"#fff",800)+d.t(160,182,"3",22,"#fff",800)+kid(100,120,{s:0.6,shirt:C.red,arm:"both",mood:"grin"})+d.star(100,20,10,C.gold,O,3),
"lend":()=>sky("#f4f7fb")+kid(50,190,{s:0.8,shirt:C.blue,arm:"wave",mood:"smile"})+kid(150,190,{s:0.8,shirt:C.pink,arm:"down",mood:"open",girl:true})+d.g(d.r(-4,-30,8,44,2,C.yellow)+d.p("M-4 14 L0 24 L4 14Z",C.cream),"translate(100 80) rotate(90)")+d.l("M80 60 L120 60",C.grey2,3)+d.p("M120 54 L130 60 L120 66Z",C.grey2,null),
"apron":()=>d.shadow(100,186,60)+d.p("M70 40 L130 40 L130 80 Q150 80 156 90 L150 180 L50 180 L44 90 Q50 80 70 80Z",C.pink)+d.r(80,120,40,30,4,C.pink2)+d.l("M70 40 L80 20 Q100 10 120 20 L130 40",O,4)+d.l("M44 92 L20 100 M156 92 L180 100",O,4),
"give":()=>sky("#fff4f8")+kid(50,190,{s:0.8,shirt:C.green,arm:"wave",mood:"smile"})+kid(150,190,{s:0.8,shirt:C.orange,arm:"down",mood:"grin"})+giftBox(100,70,0.5)+d.heart(150,40,8,C.pink),
"boat":()=>sky("#d7efff")+d.r(8,130,184,62,0,"#3f9be8",null)+d.p("M40 120 L160 120 L140 150 L60 150Z",C.red)+d.l("M100 120 L100 40",O,4)+d.p("M104 44 L150 110 L104 110Z","#fff")+d.p("M96 54 L60 110 L96 110Z","#fff")+d.l("M30 170 Q50 160 70 170 M120 176 Q140 166 160 176","#fff",3),
"paper":()=>d.shadow(100,186,60)+d.p("M50 30 L130 30 L150 50 L150 180 L50 180Z","#fff")+d.p("M130 30 L130 50 L150 50Z","#e6e0d4"),
/* unit 6 */
"cafe":()=>sky("#fff6e6")+d.r(20,60,160,120,2,"#fff")+d.p("M14 60 L186 60 L176 36 L24 36Z",C.green)+d.r(36,90,80,60,2,"#cfeeff")+cup(76,124,0.5,"#fff","#7a4a20")+d.r(132,100,34,80,2,C.brown),
"germany":()=>flagBox(d.r(25,50,150,34,0,"#1a1a1a",null)+d.r(25,84,150,33,0,"#dd0000",null)+d.r(25,117,150,33,0,"#ffce00",null),"germany"),
"parfait":()=>d.shadow(100,186,40)+d.p("M60 40 L140 40 L116 140 L84 140Z","#fff8")+d.p("M64 50 L136 50 L132 70 L68 70Z","#fff6e0",null)+d.p("M68 70 L132 70 L126 96 L74 96Z",C.pink,null)+d.p("M74 96 L126 96 L120 120 L80 120Z","#7a4a20",null)+d.p("M60 40 L140 40 L116 140 L84 140Z","none")+d.r(94,140,12,30,0,"#fff")+d.e(100,176,30,8,"#fff")+d.c(100,30,14,"#fff6e0")+d.c(100,18,8,C.red)+d.l("M120 30 L140 6",C.brown,4),
"london":()=>sky("#d7efff")+d.r(80,50,40,140,0,"#d9b27a")+d.p("M76 50 L100 10 L124 50Z","#5a6070")+clock(100,74,14,3,0)+d.l("M86 100 L114 100 M86 130 L114 130 M86 160 L114 160",C.brown,2)+d.g(bus(0,0,0.6,C.red),"translate(156 186)")+d.r(8,186,184,6,0,"#9aa3ad",null),
"stylish":()=>sky("#fff0f6")+kid(100,192,{s:1,shirt:C.pink,pants:"#2a3a5a",arm:"wave",mood:"smile",girl:true})+d.e(100,64,40,8,"#2a2630")+d.p("M78 64 Q80 40 100 40 Q120 40 122 64Z","#2a2630")+d.r(80,110,40,8,0,C.gold,null)+d.sparkle(40,50,10)+d.sparkle(164,130,8),
"centimeter":()=>sky("#f4f7fb")+ruler(20,90,160,"cm")+d.c(36,70,8,C.red)+d.l("M20 140 L36 140",C.red,4)+d.t(100,170,"1 cm",26,C.red2,800),
"expensive":()=>sky("#fff7df")+d.p("M100 40 L130 70 L100 140 L70 70Z","#9fe0ff")+d.l("M70 70 L130 70 M100 40 L88 70 L100 140 L112 70 Z",O,2)+d.g(d.p("M0 0 L60 0 L70 16 L60 32 L0 32Z","#fff")+d.c(60,16,4,O,null)+d.t(28,24,"¥¥¥",16,C.red,800),"translate(110 140) rotate(-10)")+d.sparkle(40,40,10)+d.sparkle(160,40,8),
"popular":()=>sky("#fff4f8")+kid(100,192,{s:0.75,shirt:C.yellow,arm:"both",mood:"grin"})+[[30,170],[170,170],[40,110],[160,110]].map(([x,y],i)=>headFace(x,y,16,{mood:"grin",girl:i%2===0})).join("")+d.heart(60,40,10,C.pink)+d.heart(140,40,10,C.pink)+d.heart(100,24,12,C.pink),
/* unit 7 */
"halloween":()=>sky("#2c2a5a")+moon(160,40,16)+d.r(8,160,184,32,0,"#3a2a4a",null)+pumpkin(100,140,1.3)+d.p("M30 60 Q40 50 50 60 Q60 50 70 60 Q60 66 50 64 Q40 66 30 60Z",O,null),
"pumpkin":()=>d.shadow(100,186,60)+pumpkin(100,130,1.6).replace(/<path d="M-22 -8[^>]*\/>|<path d="M-20 12[^>]*\/>/g,""),
"blossom":()=>sky("#fff0f6")+sakura(100,100,70)+sakura(40,40,20)+sakura(160,160,18),
"ticket":()=>d.shadow(100,184,70)+d.p("M20 60 L180 60 L180 90 Q168 100 180 110 L180 140 L20 140 L20 110 Q32 100 20 90Z",C.yellow)+d.l("M140 64 L140 136",O,2)+d.t(80,110,"TICKET",22,C.red,800)+d.star(160,100,10,C.red,null),
"penguin":()=>d.shadow(100,186,50)+d.e(100,120,48,64,"#2a2f3a")+d.e(100,128,32,52,"#fff",null)+d.c(84,80,5,"#fff",null)+d.c(116,80,5,"#fff",null)+d.c(85,80,3,O,null)+d.c(115,80,3,O,null)+d.p("M92 92 L108 92 L100 102Z",C.orange)+d.e(84,184,14,6,C.orange)+d.e(116,184,14,6,C.orange)+d.e(54,124,10,30,"#2a2f3a",O,20)+d.e(146,124,10,30,"#2a2f3a",O,-20),
"teach":()=>PIC.teacher(),
/* unit 8 */
"email":()=>sky("#eef8ff")+d.r(30,60,140,90,6,"#fff")+d.l("M30 66 L100 116 L170 66",O,4)+d.c(150,60,20,C.blue)+d.t(150,68,"@",22,"#fff",800),
"kitchen":()=>room("#fff6e6","#d9c9b0",d.r(20,100,160,50,2,"#fff")+d.r(20,96,160,8,2,"#c8ccd4")+d.e(60,94,18,5,"#3a3f50")+d.e(110,94,18,5,"#3a3f50")+d.r(50,70,30,24,4,C.red)+d.r(140,40,40,40,2,"#cfeeff")+d.r(150,110,20,30,2,"#c8ccd4")),
"stationery":()=>d.shadow(100,186,70)+d.r(30,60,80,110,4,C.blue)+d.r(36,66,68,98,2,"#fff",null)+d.l("M44 80 L96 80 M44 96 L96 96 M44 112 L96 112","#c9c3b7",2)+d.g(d.r(-5,-60,10,100,2,C.yellow)+d.p("M-5 40 L0 52 L5 40Z",C.cream),"translate(140 100) rotate(10)")+d.r(116,150,40,20,4,C.pink)+d.g(d.r(-4,-50,8,80,2,C.red),"translate(170 100) rotate(-6)"),
"store":()=>PIC.shop(),
"line":()=>sky("#f4f7fb")+d.r(8,160,184,32,0,"#d9cfbf",null)+d.r(150,40,40,120,2,"#fff")+d.p("M144 40 L196 40 L190 24 L150 24Z",C.red)+[30,64,98,132].map((x,i)=>kid(x,190,{s:0.55,shirt:[C.blue,C.pink,C.green,C.yellow][i],arm:"down",mood:"flat",girl:i%2===1})).join(""),
"tourist":()=>ground("#e6eef4")+adult(100,192,{s:0.82,coat:"#f6d04a",pants:"#c9a36a",hat:"straw",mood:"grin",armR:"hold",armL:"hold",extra:d.r(-20,-104,40,26,5,"#3a3f50")+d.c(0,-91,9,"#7cc4ff",O,3)+d.l("M-16 -104 L-10 -130 M16 -104 L10 -130",O,2)})+d.r(130,150,50,40,6,C.blue)+d.l("M146 150 L146 140 L164 140 L164 150",O,3),
"wood":()=>d.shadow(100,186,80)+[[60,150],[140,150],[100,110]].map(([x,y])=>d.r(x-50,y-20,100,40,20,"#b07040")+d.e(x+42,y,14,20,"#e3b46a")+d.e(x+42,y,6,10,"none","#b07040",0,2)).join(""),
"butter":()=>d.shadow(100,184,70)+plate(170,76)+d.p("M50 150 L60 100 L150 100 L150 150Z","#ffe47a")+d.p("M50 150 L150 150 L150 156 L50 156Z","#e0c040",null)+d.p("M60 100 L150 100 L140 86 L68 86Z","#fff2a8"),
"tofu":()=>d.shadow(100,184,70)+d.p("M40 150 L40 90 L140 90 L140 150Z","#fffaf0")+d.p("M40 90 L70 60 L170 60 L140 90Z","#fff")+d.p("M140 90 L170 60 L170 120 L140 150Z","#eee6d8"),
"table":()=>d.shadow(100,186,80)+d.r(20,80,160,16,4,"#c98d4e")+d.r(30,96,12,90,3,"#a46b3a")+d.r(158,96,12,90,3,"#a46b3a"),
"paint":()=>sky("#f4f7fb")+d.r(30,60,140,110,4,"#fff")+d.p("M30 60 L170 60 L170 110 Q150 130 130 110 Q110 140 90 110 Q70 130 50 110 L30 110Z",C.blue,null)+d.r(30,60,140,110,4,"none")+d.g(d.r(-6,-40,12,60,3,C.brown)+d.r(-10,20,20,16,3,C.grey)+d.p("M-10 36 L10 36 L6 52 L-6 52Z",C.blue),"translate(160 70) rotate(30)"),
/* Course 3 */
"bento":()=>d.shadow(100,186,80)+d.r(24,60,152,110,10,C.red)+d.r(32,68,136,94,6,"#2a2630")+d.r(36,72,64,86,4,"#fff")+d.c(68,114,8,C.red)+d.l("M100 72 L100 158",C.red2,4)+d.e(124,92,16,10,C.yellow)+d.e(150,92,12,10,"#a8442a")+d.c(124,132,10,C.leaf)+d.e(152,134,12,8,C.pink),
"lunch":()=>PIC["eat lunch"](),
"schoolyard":()=>sky("#e9f7ff")+d.r(8,110,184,82,0,"#e9d6b0",null)+d.r(110,40,80,70,2,"#f4f1ea")+d.p("M104 44 L150 20 L196 44Z",C.red)+clock(150,64,12,10,10)+d.l("M30 110 L30 60 L70 60 L70 110",C.grey2,5)+d.l("M40 60 L40 90 M60 60 L60 90",O,2)+d.r(34,90,12,6,1,C.red)+d.r(54,90,12,6,1,C.blue)+kid(100,186,{s:0.5,shirt:C.red,arm:"both",mood:"grin"})+kid(150,186,{s:0.5,shirt:C.blue,arm:"wave",mood:"grin"})+d.c(126,150,8,"#fff"),
"suitcase":()=>d.shadow(100,186,60)+d.r(46,60,108,120,12,C.orange)+d.l("M80 60 L80 40 L120 40 L120 60",O,6)+d.l("M70 60 L70 180 M130 60 L130 180",C.orange2,4)+d.c(64,180,6,"#3a3f50")+d.c(136,180,6,"#3a3f50")+d.r(84,100,32,22,3,"#fff"),
"walk the dog":()=>PIC["walk my dog"](),
"water the flowers":()=>sky("#e9f7ff")+d.r(8,160,184,32,0,"#a8774a",null)+[110,140,170].map((x,i)=>d.l(`M${x} 160 L${x} 120`,C.green2,3)+d.c(x,114,10,[C.red,C.yellow,C.pink][i],O,2)).join("")+kid(50,190,{s:0.8,shirt:C.blue,arm:"wave",mood:"smile"})+d.p("M70 80 L110 80 L106 110 L74 110Z",C.green)+d.l("M108 86 L134 70",O,5)+[[136,80],[140,92],[132,96]].map(([x,y])=>d.l(`M${x} ${y} L${x+2} ${y+10}`,"#4a8fe8",3)).join(""),
"window":()=>sky("#f6efe2")+d.r(40,30,120,140,4,"#fff")+d.r(50,40,100,120,0,"#bfe7ff",null)+d.l("M100 40 L100 160 M50 100 L150 100","#fff",8)+d.r(40,30,120,140,4,"none")+cloud(76,64,0.3)+d.r(30,166,140,12,3,"#c98d4e"),
"eel":()=>d.shadow(100,186,80)+d.r(20,120,160,56,6,"#2a2630")+d.r(26,126,148,44,4,"#fff")+d.r(34,110,132,30,8,"#8a4a1c")+d.l("M50 116 L60 136 M76 114 L86 136 M102 114 L112 136 M128 114 L138 136",O,2),
"musical instrument":()=>d.shadow(100,186,80)+guitar(60,120,0.8,-20)+violinS(150,100,0.5,20)+d.g(d.r(-8,-50,16,70,8,"#fff4dc")+[-36,-22,-8].map(y=>d.c(0,y,3,O,null)).join(""),"translate(110 140) rotate(-30)"),
"marathon":()=>sky("#e9f7ff")+d.r(8,150,184,42,0,"#9aa3ad",null)+[50,100,150].map((x,i)=>d.g(adult(0,0,{s:0.55,coat:[C.red,C.blue,C.yellow][i],sleeve:C.skin,shorts:C.blue2,armL:"out",armR:"out",mood:"open",extra:d.r(-14,-108,28,18,2,"#fff")}),`translate(${x} ${180-i*4}) rotate(8)`)).join("")+d.t(100,36,"42.195 km",22,C.blue2,800),
"run a marathon":()=>PIC.marathon(),
"cream puff":()=>d.shadow(100,184,60)+plate(170,70)+d.e(100,140,58,26,"#e8b066")+d.p("M44 130 Q100 116 156 130 Q150 116 100 112 Q50 116 44 130Z","#fffbe9")+d.p("M46 124 Q50 70 100 70 Q150 70 154 124 Q100 110 46 124Z","#e8b066")+d.c(80,90,4,"#fff",null)+d.c(110,84,4,"#fff",null)+d.c(130,98,4,"#fff",null),
"sell out":()=>sky("#f4f7fb")+d.r(30,60,140,80,8,"#fff")+d.g(d.r(-70,-20,140,40,6,C.red)+d.t(0,10,"SOLD OUT",24,"#fff",800),"translate(100 100) rotate(-12)")+d.l("M60 60 L60 30 M140 60 L140 30",O,3),
"in a hurry":()=>PIC.hurry(),
"hurry":()=>sky("#fff4e6")+d.r(8,160,184,32,0,"#d9cfbf",null)+d.g(kid(0,0,{s:0.85,shirt:C.blue,arm:"both",mood:"o"})+d.r(-32,-96,20,40,6,C.red),"translate(110 186) rotate(14)")+d.r(118,62,22,18,4,"#e3b46a")+clock(40,50,22,8,25)+speed(10,100),
"video game":()=>PIC["video games"](),
"diary":()=>d.shadow(100,186,60)+d.r(40,30,120,150,6,"#a8442a")+d.r(52,40,100,130,2,"#fff6e0")+d.t(100,76,"DIARY",20,"#a8442a",800)+d.l("M64 100 L140 100 M64 120 L140 120 M64 140 L120 140","#c9c3b7",3)+d.r(140,90,24,20,3,C.gold),
"keep a diary":()=>PIC.diary(),
"rope":()=>d.shadow(100,186,70)+d.e(100,130,60,40,"none","#c9a36a",0,10)+d.e(100,120,40,26,"none","#c9a36a",0,10)+d.l("M150 140 Q170 160 180 186","#c9a36a",10),
"dry":()=>PIC.hair(),
"hair":()=>sky("#f4f7fb")+headFace(80,110,46,{mood:"smile",girl:true,hair:"#6b3f22"})+d.g(d.r(0,-16,50,32,14,C.pink)+d.r(10,14,16,40,4,C.pink),"translate(124 60) rotate(10)")+d.l("M120 60 L100 70 M120 70 L100 82 M120 50 L102 58",C.grey,3),
"live here":()=>PIC.house(),
"family":()=>ground("#eef0e6")+adult(40,192,{s:0.7,coat:C.blue,mood:"smile"})+adult(90,192,{s:0.68,coat:C.pink,girl:true,skirt:"#6a6fa8",mood:"smile",hair:"#6b3f22"})+kid(136,190,{s:0.62,shirt:C.green,arm:"down",mood:"grin"})+kid(172,190,{s:0.5,shirt:C.yellow,arm:"wave",mood:"grin",girl:true})+d.heart(100,24,12,C.pink),
"health":()=>sky("#eef8ee")+d.heart(80,100,40,C.red)+d.l("M40 100 L66 100 L74 84 L84 120 L94 96 L120 96","#fff",4)+d.g(PIC.apple(),"translate(110 100) scale(.4)"),
"fall asleep":()=>diner("#2c3566")+moon(160,40,12)+headFace(100,118,28,{mood:"flat"})+d.l("M86 120 L94 120 M106 120 L114 120",O,3)+d.r(60,138,80,8,2,"#fff")+d.t(140,76,"Z",26,"#fff",800)+d.t(158,56,"z",18,"#fff",800),
"eating sweets":()=>diner("#fff0f6")+headFace(100,76,30,{mood:"grin"})+d.g(PIC.cake(),"translate(30 100) scale(.4)")+d.g(PIC["ice cream"](),"translate(110 96) scale(.4)"),
"playing sports":()=>PIC.sport(),"running":()=>PIC.run(),
"dessert":()=>PIC.parfait(),
"rest":()=>room("#fff6e6","#d9c9b0",sofa(100,150,0.95,"#9a7ad6")+d.r(40,110,120,24,12,C.green)+headFace(50,112,18,{mood:"smile"})+d.t(120,80,"z",20,C.blue2,800)),
"get rest":()=>PIC.rest(),
"laugh":()=>sky("#fff7df")+bigHead("grin",d.l("M66 96 Q76 88 86 96 M114 96 Q124 88 134 96",O,4)+d.t(36,60,"HA",22,C.orange2,800)+d.t(166,60,"HA",22,C.orange2,800)),
"bake":()=>room("#fff6e6","#d9c9b0",d.r(40,60,120,100,6,"#c8ccd4")+d.r(54,80,92,60,4,"#3a3f50")+d.r(60,86,80,48,2,"#ff9a3c",null)+[76,100,124].map(x=>d.c(x,116,9,"#d9a056",O,2)).join("")+d.c(60,70,4,O,null)+d.c(76,70,4,O,null)),
"smile":()=>sky("#fff7df")+bigHead("smile",d.sparkle(30,50,10)+d.sparkle(170,60,8)),
"wake":()=>PIC["wake up"](),
/* unit 4 */
"waiter":()=>ground("#efe8dc")+adult(90,192,{s:0.82,coat:"#fff",pants:"#2a2630",tie:O,mood:"smile",armR:"out",extra:d.e(70,-124,26,5,C.grey)+cup(60,-140,0.4,"#fff","#7a4a20")+d.p("M74 -152 L74 -128 L90 -128 Q90 -152 74 -152Z","#fff8",O,2)}),
"glasses":()=>d.shadow(100,170,70)+d.c(64,100,30,"#e6f6ffcc",O,6)+d.c(136,100,30,"#e6f6ffcc",O,6)+d.l("M94 96 Q100 88 106 96 M34 96 L14 84 M166 96 L186 84",O,5)+d.shine(54,90,8,4,-30)+d.shine(126,90,8,4,-30),
"behind":()=>d.r(0,150,200,50,0,"#e6e0d4",null)+d.c(130,104,24,C.red)+d.r(50,90,90,80,4,"#d9a866")+d.l("M50 110 L140 110",C.brown,2),
"in front of":()=>d.r(0,150,200,50,0,"#e6e0d4",null)+d.r(50,60,90,80,4,"#d9a866")+d.l("M50 80 L140 80",C.brown,2)+d.c(96,150,24,C.red),
"sit":()=>sky("#f4f7fb")+sitKid(100,140,C.blue),
"stand":()=>sky("#f4f7fb")+d.r(30,110,10,70,2,"#c98d4e")+d.r(30,110,60,8,3,"#c98d4e")+d.r(80,110,10,70,2,"#c98d4e")+kid(140,190,{s:0.95,shirt:C.blue,arm:"down",mood:"smile"}),
"eco-friendly":()=>sky("#eef8ee")+d.c(100,100,60,"#4a8fe8")+d.p("M60 70 Q80 60 90 80 Q80 100 64 96Z M110 64 Q140 64 150 94 Q130 112 116 94Z M90 124 Q110 120 120 144 Q100 154 90 144Z",C.green,null)+d.c(100,100,60,"none")+d.p("M140 60 Q180 20 186 70 Q150 90 140 60Z",C.leaf)+d.l("M140 60 Q160 56 178 50",C.green2,2),
"straw":()=>d.shadow(100,186,40)+d.p("M60 80 L140 80 L130 180 L70 180Z","#e6f6ffcc")+d.p("M64 110 L136 110 L130 180 L70 180Z",C.orange,null)+d.p("M60 80 L140 80 L130 180 L70 180Z","none")+d.l("M110 160 L130 30 L150 20",O,10)+d.l("M110 160 L130 30 L150 20","#fff",6)+d.l("M114 140 L120 100 M124 70 L128 44",C.red,6),
"song":()=>PIC.sing(),"movie":()=>PIC["watch movies"](),
"sign language":()=>sky("#f4f7fb")+d.g(d.r(-20,-20,40,46,14,C.skin)+d.r(-20,-56,10,40,5,C.skin)+d.r(-8,-62,10,46,5,C.skin)+d.r(4,-56,10,40,5,C.skin)+d.e(-26,4,8,18,C.skin,O,-40),"translate(70 120) rotate(-10)")+d.g(d.r(-20,-20,40,46,14,C.skin)+d.r(10,-60,10,46,5,C.skin)+d.e(26,4,8,18,C.skin,O,40),"translate(140 110) rotate(10)")+d.l("M90 50 Q100 40 110 50 M80 40 Q100 20 120 40",C.blue2,3),
"concert":()=>PIC.singer(),
"school festival":()=>sky("#e9f7ff")+d.r(110,30,80,80,2,"#f4f1ea")+d.p("M104 34 L150 10 L196 34Z",C.red)+d.r(8,150,184,42,0,"#e9d6b0",null)+yatai(70,130,0.7,"たこやき",C.blue)+d.l("M8 40 Q60 60 110 40",O,2)+[20,50,80].map((x,i)=>d.p(`M${x} ${44+i*3} l16 2 l-8 14Z`,[C.red,C.yellow,C.green][i],O,2)).join("")+kid(160,190,{s:0.5,shirt:C.pink,arm:"wave",mood:"grin",girl:true}),
"chorus contest":()=>PIC.chorus(),
/* unit 5 */
"manga artist":()=>PIC["comic creator"](),
"chocolate":()=>d.shadow(100,184,70)+d.r(40,50,120,120,6,"#6a3a1a")+[0,1,2].map(r=>[0,1].map(c=>d.r(50+c*52,60+r*36,48,32,4,"#7a4a20")).join("")).join("")+d.p("M40 120 L160 120 L160 176 L40 176Z","#c0c8d8",null)+d.p("M40 120 L160 108 L160 176 L40 176Z",C.red),
"stone":()=>d.shadow(100,184,70)+d.p("M40 150 Q30 110 60 90 Q90 70 130 80 Q170 96 166 140 Q150 170 100 170 Q56 170 40 150Z","#a7adb7")+d.l("M70 110 Q90 100 110 110",C.grey2,3)+d.shine(80,96,14,6,-10),
"hard":()=>sky("#f4f7fb")+d.p("M40 150 Q30 110 60 90 Q90 70 130 80 Q170 96 166 140 Q150 170 100 170 Q56 170 40 150Z","#a7adb7")+d.g(d.r(-4,0,8,44,3,"#c98d4e")+d.r(-16,-10,32,14,3,C.grey),"translate(140 40) rotate(-40)")+d.t(60,60,"KNOCK",16,C.grey2,800),
"neck":()=>sky("#ffe9b8")+d.p("M80 190 L90 50 L116 50 L126 190Z","#f1c04a")+d.e(104,40,24,18,"#f1c04a")+[[96,80],[110,110],[98,140],[112,170],[104,60]].map(([x,y])=>d.r(x-6,y-6,12,12,3,"#b07030",null)).join("")+d.c(112,36,3,O,null)+ring(103,120,28,44),
"stripe":()=>d.shadow(100,186,60)+d.p("M40 60 L70 46 L130 46 L160 60 L150 96 L136 90 L136 180 L64 180 L64 90 L50 96Z","#fff")+[66,86,106,126,146,166].map(y=>d.r(62,y,76,10,0,C.blue,null)).join("")+d.p("M40 60 L70 46 L130 46 L160 60 L150 96 L136 90 L136 180 L64 180 L64 90 L50 96Z","none"),
"trunk":()=>d.g(PIC.elephant(),"")+ring(100,140,30,46),
"magazine":()=>d.shadow(100,186,60)+d.r(46,30,108,150,4,"#fff")+d.r(46,30,108,40,4,C.pink)+d.t(100,60,"STYLE",20,"#fff",800)+headFace(100,116,28,{mood:"smile",girl:true})+d.l("M60 160 L140 160 M60 170 L120 170","#c9c3b7",3),
"jeans":()=>d.shadow(100,186,60)+d.p("M56 30 L144 30 L150 180 L110 180 L100 80 L90 180 L50 180Z","#3d6fb8")+d.l("M56 46 L144 46",C.blue2,3)+d.l("M100 46 L100 80",C.gold,2)+d.l("M64 60 Q76 70 88 56 M136 60 Q124 70 112 56",C.gold,2),
"tennis court":()=>sky("#e9f7ff")+d.p("M30 180 L60 60 L140 60 L170 180Z","#3f9a5a")+d.l("M30 180 L60 60 L140 60 L170 180Z M100 60 L100 180 M45 120 L155 120","#fff",3)+d.r(36,114,128,14,0,"#fff8")+d.l("M40 114 L160 114",O,3),
/* unit 6 */
"bottle":()=>d.shadow(100,186,40)+bottle(100,124,1.3,"#cfe8ff",C.blue),
"water bottle":()=>d.shadow(100,186,40)+d.r(70,50,60,130,16,C.blue)+d.r(76,36,48,22,6,C.blue2)+d.r(70,90,60,40,0,"#fff",null)+d.t(100,118,"H₂O",14,C.blue2,800)+d.r(70,50,60,130,16,"none"),
"green tea":()=>d.shadow(100,186,50)+d.p("M50 70 L150 70 L140 170 L60 170Z","#c9a36a")+d.e(100,70,50,10,"#9fd06a")+d.l("M80 50 Q76 36 80 24 M110 50 Q106 36 110 24",C.grey,3),
"honey":()=>d.shadow(100,186,60)+d.p("M50 70 Q50 60 60 60 L140 60 Q150 60 150 70 L150 170 Q150 180 140 180 L60 180 Q50 180 50 170Z","#ffb02e")+d.r(46,46,108,20,4,"#c98d4e")+d.r(66,100,68,40,4,"#fff6e0")+d.t(100,128,"HONEY",14,"#c07010",800)+d.e(150,40,14,8,C.yellow,O,20,2),
"skating":()=>sky("#e6f4ff")+d.e(100,170,90,20,"#fff")+d.g(kid(0,0,{s:0.9,shirt:C.purple,arm:"both",mood:"grin",girl:true})+d.l("M-20 4 L-2 4 M4 4 L22 4",C.grey2,3),"translate(100 170) rotate(-10)"),
"ice":()=>d.shadow(100,184,70)+[[70,130],[130,140],[100,90]].map(([x,y])=>d.p(`M${x-30} ${y-20} L${x+20} ${y-30} L${x+34} ${y+16} L${x-16} ${y+30}Z`,"#cfeeff")+d.shine(x-6,y-6,10,4,-20)).join(""),
"canadian":()=>PIC.canada(),
"beaver":()=>d.shadow(100,186,60)+d.e(150,160,30,14,"#5a3a20",O,-20)+d.e(96,130,50,46,"#9a6338")+d.c(80,80,30,"#9a6338")+d.c(62,58,8,"#9a6338")+d.c(100,58,8,"#9a6338")+d.c(70,76,4,O,null)+d.c(90,76,4,O,null)+d.e(80,88,8,5,O,null)+d.r(74,94,12,10,1,"#fff"),
"thirsty":()=>sky("#ffe9b8")+sunIcon(160,40,16)+bigHead("o",d.p("M92 132 Q100 150 108 132Z",C.pink,O,2)+d.p("M150 90 Q146 100 150 104 Q154 100 150 90Z","#a8dcff",O,2))+d.g(bottle(0,0,0.5,"#cfe8ff",C.blue),"translate(40 140)"),
"drink":()=>sky("#eef8ff")+headFace(80,90,36,{mood:"smile"})+d.p("M110 110 L150 110 L144 170 L116 170Z","#cfeeff")+d.p("M112 130 L148 130 L144 170 L116 170Z",C.orange,null)+d.l("M100 100 L130 120",O,6)+d.l("M100 100 L130 120","#fff",3),
"stick":()=>d.shadow(100,186,70)+d.l("M30 170 L170 40",C.brown,10)+d.l("M100 106 L130 120",C.brown,6),
"plastic":()=>sky("#eef8ff")+bottle(70,120,0.9,"#e8f6ff","#7cc4ff")+d.p("M120 80 L170 80 L176 170 L114 170Z","#fff8")+d.l("M128 80 L132 60 L158 60 L162 80",O,3)+d.p("M120 80 L170 80 L176 170 L114 170Z","none"),
"reduce":()=>sky("#eef8ee")+d.r(30,60,50,100,4,"#cfeeff")+d.r(80,100,40,60,4,"#cfeeff")+d.r(120,130,30,30,4,"#cfeeff")+d.l("M30 40 L160 120",C.green2,5)+d.p("M150 110 L166 124 L146 128Z",C.green2,null),
"waste":()=>sky("#f4f7fb")+d.p("M50 70 L150 70 L140 180 L60 180Z","#9aa3ad")+d.r(40,56,120,16,4,"#7d838d")+d.l("M80 90 L84 160 M100 90 L100 160 M120 90 L116 160",C.grey2,3)+bottle(160,150,0.4,"#e8f6ff","#7cc4ff")+d.e(40,176,20,8,"#d9d0c0"),
"environment":()=>sky("#e9f7ff")+d.c(100,100,64,"#4a8fe8")+d.p("M56 70 Q80 56 92 80 Q80 104 60 98Z M110 60 Q146 60 156 96 Q134 118 116 96Z M86 128 Q110 122 122 150 Q100 162 86 150Z",C.green,null)+d.c(100,100,64,"none")+tree(40,186,0.6)+tree(160,186,0.6),
"stew":()=>d.shadow(100,186,80)+d.p("M24 90 Q28 170 100 172 Q172 170 176 90Z","#fff")+d.e(100,90,76,18,"#b0502a")+d.c(70,88,8,C.orange)+d.c(110,84,9,"#f6e6c0")+d.c(134,92,7,C.orange)+d.c(92,96,6,C.leaf)+d.l("M80 60 Q76 46 80 34 M120 60 Q116 46 120 34",C.grey,3),
"dish":()=>PIC.plate?PIC.plate():d.shadow(100,184,80)+plate(150,84),
"fried chicken":()=>d.shadow(100,184,70)+plate(170,76)+[[70,130],[120,124],[96,100]].map(([x,y])=>d.p(`M${x-24} ${y} Q${x-26} ${y-24} ${x} ${y-24} Q${x+26} ${y-22} ${x+22} ${y+4} Q${x+10} ${y+24} ${x-10} ${y+20} Q${x-26} ${y+16} ${x-24} ${y}Z`,"#d9842a")+d.l(`M${x-10} ${y-10} L${x-6} ${y-4} M${x+6} ${y} L${x+10} ${y+6}`,"#a8551a",3)).join(""),
/* unit 7 */
"vacuum cleaner":()=>d.shadow(100,186,80)+d.r(30,130,70,46,20,C.red)+d.c(44,176,8,"#3a3f50")+d.c(86,176,8,"#3a3f50")+d.p("M96 146 Q140 140 140 90 L140 40",null,O,6)+d.r(130,30,22,16,4,"#3a3f50")+d.l("M140 40 L150 180",O,6)+d.r(130,176,50,10,3,"#3a3f50"),
"fever":()=>sky("#ffeef0")+bigHead("flat",d.e(70,120,12,8,"#ff7a7a",null)+d.e(130,120,12,8,"#ff7a7a",null)+d.r(70,40,60,14,6,"#cfeeff"))+d.g(d.r(-6,-50,12,70,6,"#fff")+d.r(-3,-30,6,40,3,C.red,null)+d.c(0,24,9,C.red),"translate(160 120) rotate(30)"),
"dictionary":()=>d.shadow(100,186,70)+d.r(36,40,128,140,6,C.blue2)+d.r(36,40,20,140,4,C.blue)+d.r(70,60,80,40,4,"#fff")+d.t(110,88,"A–Z",24,C.blue2,800)+d.r(160,50,10,120,2,"#fff",O,2)+d.l("M164 60 L164 160","#c9c3b7",1),
"sleep all day":()=>PIC["go to bed"]()+clock(50,50,22,3,0),
"swim in the deep sea":()=>d.r(8,8,184,184,14,"#1d4a8a",null)+d.l("M8 30 L192 30","#7cc4ff",4)+d.g(kid(0,0,{s:0.7,shirt:C.yellow,arm:"both",mood:"o"}),"translate(160 104) rotate(-80)")+d.c(150,60,5,"#fff8",O,2)+d.c(160,46,4,"#fff8",O,2)+goldfish(40,150,1,"#ffc040")+goldfish(160,170,0.8,"#ff7a7a"),
"belong to":()=>PIC.join(),
"rock":()=>PIC.band(),
"band":()=>sky("#2c2a5a")+d.r(8,150,184,42,0,"#3a2a4a",null)+adult(60,186,{s:0.65,coat:C.red,armL:"hold",armR:"hold",mood:"grin",extra:guitar(0,-84,0.85,-58)})+adult(140,186,{s:0.65,coat:C.blue,armR:"mic",mood:"open",extra:mic(14,-142,0.9,-25)})+note(100,40,C.yellow)+d.sparkle(30,40,8)+d.sparkle(170,40,8),
"vocalist":()=>PIC.singer(),
"musical":()=>PIC["talent show"](),
"abroad":()=>PIC.overseas(),
"travel":()=>sky("#d7efff")+plane(130,50,0.6,-10)+d.r(8,160,184,32,0,"#c9cfd8",null)+kid(70,190,{s:0.85,shirt:C.orange,arm:"wave",mood:"grin"})+d.g(PIC.suitcase(),"translate(100 100) scale(.45)"),
"powerful":()=>PIC.strong(),
"lift":()=>PIC.heavy(),
"heater":()=>d.shadow(100,186,70)+d.r(40,60,120,120,10,"#e8e0d0")+d.r(54,80,92,60,4,"#3a3f50")+d.l("M64 90 L136 90 M64 110 L136 110 M64 130 L136 130",C.orange,5)+d.l("M70 50 Q66 40 70 30 M100 50 Q96 40 100 30 M130 50 Q126 40 130 30",C.red,3),
"shake hands with":()=>sky("#f4f7fb")+d.r(8,100,50,40,4,C.blue)+d.r(142,100,50,40,4,C.red)+d.p("M56 100 L100 96 Q120 96 130 110 L144 110 L144 136 L120 140 Q100 146 80 140 L56 140Z",C.skin)+d.l("M86 112 L120 112 M86 124 L122 124",C.skin2,3)+d.sparkle(100,60,10),
"amazing":()=>PIC.great()
});

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
