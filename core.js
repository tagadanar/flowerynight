const canvas=document.getElementById('c');
let ctx=canvas.getContext('2d');
let W,H,HOR;

function resize(){
  const d=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  HOR=H*0.55; // 55% sky, 45% ground
  canvas.width=W*d;canvas.height=H*d;
  ctx.setTransform(d,0,0,d,0,0);
}
window.addEventListener('resize',resize);resize();

// ── NOISE ──
class Noise{
  constructor(seed=42){this.p=new Uint8Array(512);const pm=new Uint8Array(256);for(let i=0;i<256;i++)pm[i]=i;let s=seed;for(let i=255;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[pm[i],pm[j]]=[pm[j],pm[i]];}for(let i=0;i<512;i++)this.p[i]=pm[i&255];}
  fade(t){return t*t*t*(t*(t*6-15)+10);}lerp(a,b,t){return a+t*(b-a);}
  grad(h,x,y){const v=h&3;return((v&1)?-1:1)*(v<2?x:y)+((v&2)?-1:1)*(v<2?y:x);}
  get(x,y){const X=Math.floor(x)&255,Y=Math.floor(y)&255;x-=Math.floor(x);y-=Math.floor(y);const u=this.fade(x),v=this.fade(y),A=this.p[X]+Y,B=this.p[X+1]+Y;return this.lerp(this.lerp(this.grad(this.p[A],x,y),this.grad(this.p[B],x-1,y),u),this.lerp(this.grad(this.p[A+1],x,y-1),this.grad(this.p[B+1],x-1,y-1),u),v);}
  fbm(x,y,o=4){let v=0,a=1,f=1,m=0;for(let i=0;i<o;i++){v+=this.get(x*f,y*f)*a;m+=a;a*=.5;f*=2;}return v/m;}
}
const noise=new Noise(Math.random()*99999);

// ── UTILS ──
const R=(a,b)=>Math.random()*(b-a)+a;
const RI=(a,b)=>Math.floor(R(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const cl=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const ease={out:t=>1-Math.pow(1-t,3),in:t=>t*t*t,inOut:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,elastic:t=>t===0||t===1?t:Math.pow(2,-8*t)*Math.sin((t*8-.5)*1.8)+1};
function hsl(h,s,l,a=1){return`hsla(${h},${s}%,${l}%,${a})`;}

// ── GROUND ──
const hillSeed=R(0,1000);
function groundY(x){return HOR+noise.get(x*.0008+hillSeed,0)*40+noise.get(x*.003+hillSeed+50,0)*15;}

// ── PALETTES ──
const PAL={
  cherry:{p:()=>({h:R(330,348),s:R(50,75),l:R(78,92)}),c:()=>({h:R(42,56),s:R(75,95),l:R(60,75)}),st:()=>({h:R(100,135),s:R(30,50),l:R(32,48)})},
  rose:{p:()=>({h:R(342,365)%360,s:R(55,85),l:R(50,72)}),c:()=>({h:R(38,52),s:R(80,95),l:R(52,68)}),st:()=>({h:R(110,138),s:R(32,52),l:R(26,40)})},
  sun:{p:()=>({h:R(38,55),s:R(80,98),l:R(55,72)}),c:()=>({h:R(25,40),s:R(60,80),l:R(18,30)}),st:()=>({h:R(95,125),s:R(35,55),l:R(30,45)})},
  lav:{p:()=>({h:R(258,282),s:R(35,60),l:R(62,82)}),c:()=>({h:R(48,62),s:R(50,70),l:R(80,92)}),st:()=>({h:R(90,120),s:R(22,42),l:R(32,48)})},
  daisy:{p:()=>({h:R(45,60),s:R(5,15),l:R(92,99)}),c:()=>({h:R(42,55),s:R(85,98),l:R(58,72)}),st:()=>({h:R(100,130),s:R(35,55),l:R(35,50)})},
  poppy:{p:()=>({h:R(0,18),s:R(75,98),l:R(48,62)}),c:()=>({h:R(0,10),s:R(10,25),l:R(10,22)}),st:()=>({h:R(100,128),s:R(32,52),l:R(30,45)})},
  corn:{p:()=>({h:R(215,240),s:R(55,80),l:R(55,72)}),c:()=>({h:R(260,280),s:R(40,60),l:R(35,50)}),st:()=>({h:R(105,135),s:R(30,48),l:R(32,48)})},
  wrose:{p:()=>({h:R(340,355),s:R(35,55),l:R(82,94)}),c:()=>({h:R(42,58),s:R(80,95),l:R(62,78)}),st:()=>({h:R(100,130),s:R(28,48),l:R(30,45)})},
  butt:{p:()=>({h:R(48,62),s:R(88,100),l:R(58,68)}),c:()=>({h:R(40,50),s:R(70,90),l:R(42,55)}),st:()=>({h:R(95,120),s:R(40,58),l:R(30,44)})},
  fox:{p:()=>({h:pick([R(290,320),R(340,355)]),s:R(40,65),l:R(65,82)}),c:()=>({h:R(340,355),s:R(30,50),l:R(90,97)}),st:()=>({h:R(100,130),s:R(25,45),l:R(30,45)})},
  cosm:{p:()=>({h:pick([R(320,345),R(0,12),R(290,310)]),s:R(50,75),l:R(68,85)}),c:()=>({h:R(45,58),s:R(80,98),l:R(55,68)}),st:()=>({h:R(100,128),s:R(30,50),l:R(32,46)})},
  bell:{p:()=>({h:R(225,260),s:R(45,70),l:R(50,68)}),c:()=>({h:R(55,70),s:R(40,60),l:R(85,95)}),st:()=>({h:R(95,125),s:R(28,45),l:R(30,45)})},
  tulipRed:{p:()=>({h:R(350,370)%360,s:R(70,95),l:R(45,60)}),c:()=>({h:R(55,65),s:R(70,90),l:R(55,70)}),st:()=>({h:R(105,130),s:R(30,50),l:R(28,42)})},
  tulipYel:{p:()=>({h:R(45,58),s:R(85,100),l:R(60,75)}),c:()=>({h:R(38,48),s:R(60,80),l:R(40,55)}),st:()=>({h:R(100,125),s:R(32,50),l:R(28,42)})},
  tulipPink:{p:()=>({h:R(320,345),s:R(55,80),l:R(65,82)}),c:()=>({h:R(48,60),s:R(65,85),l:R(58,72)}),st:()=>({h:R(105,130),s:R(30,48),l:R(28,42)})},
  tulipPurp:{p:()=>({h:R(270,295),s:R(45,70),l:R(40,58)}),c:()=>({h:R(50,62),s:R(60,80),l:R(60,75)}),st:()=>({h:R(100,128),s:R(28,45),l:R(28,42)})},
};

// ── PETAL SHAPES ──
const PSHAPES={
  round:(c,s,o)=>{const w=s*.45*o,h=s*o;c.moveTo(0,0);c.bezierCurveTo(-w*.3,-h*.3,-w,-h*.6,-w*.6,-h);c.bezierCurveTo(-w*.2,-h*1.12,w*.2,-h*1.12,w*.6,-h);c.bezierCurveTo(w,-h*.6,w*.3,-h*.3,0,0);},
  pointed:(c,s,o)=>{const w=s*.35*o,h=s*1.1*o;c.moveTo(0,0);c.bezierCurveTo(-w*.6,-h*.2,-w*1.2,-h*.5,-w*.4,-h*.85);c.quadraticCurveTo(0,-h*1.15,w*.4,-h*.85);c.bezierCurveTo(w*1.2,-h*.5,w*.6,-h*.2,0,0);},
  wide:(c,s,o)=>{const w=s*.6*o,h=s*.9*o;c.moveTo(0,0);c.bezierCurveTo(-w*.1,-h*.15,-w*1.1,-h*.3,-w*.9,-h*.7);c.bezierCurveTo(-w*.7,-h*1.05,w*.7,-h*1.05,w*.9,-h*.7);c.bezierCurveTo(w*1.1,-h*.3,w*.1,-h*.15,0,0);},
  tiny:(c,s,o)=>{const w=s*.3*o,h=s*.7*o;c.moveTo(0,0);c.bezierCurveTo(-w,-h*.4,-w*.8,-h,0,-h*1.05);c.bezierCurveTo(w*.8,-h,w,-h*.4,0,0);},
  ruffled:(c,s,o)=>{const w=s*.32*o,h=s*1.05*o;c.moveTo(0,0);c.bezierCurveTo(-w*.5,-h*.15,-w*1.3,-h*.35,-w*.7,-h*.6);c.bezierCurveTo(-w*1.1,-h*.75,-w*.5,-h*.95,0,-h);c.bezierCurveTo(w*.5,-h*.95,w*1.1,-h*.75,w*.7,-h*.6);c.bezierCurveTo(w*1.3,-h*.35,w*.5,-h*.15,0,0);},
  bell:(c,s,o)=>{const w=s*.35*o,h=s*.65*o;c.moveTo(0,0);c.bezierCurveTo(-w*.2,-h*.1,-w*1.3,-h*.5,-w*.5,-h);c.quadraticCurveTo(0,-h*1.2,w*.5,-h);c.bezierCurveTo(w*1.3,-h*.5,w*.2,-h*.1,0,0);},
  cupped:(c,s,o)=>{const w=s*.5*o,h=s*.95*o;c.moveTo(0,0);c.bezierCurveTo(-w*.4,-h*.25,-w*1.15,-h*.55,-w*.65,-h*.92);c.quadraticCurveTo(0,-h*1.2,w*.65,-h*.92);c.bezierCurveTo(w*1.15,-h*.55,w*.4,-h*.25,0,0);},
  spiky:(c,s,o)=>{const w=s*.18*o,h=s*1.2*o;c.moveTo(0,0);c.bezierCurveTo(-w*.8,-h*.2,-w*1.5,-h*.5,-w*.3,-h*.8);c.quadraticCurveTo(0,-h*1.1,w*.3,-h*.8);c.bezierCurveTo(w*1.5,-h*.5,w*.8,-h*.2,0,0);},
  heart:(c,s,o)=>{const w=s*.42*o,h=s*.95*o;c.moveTo(0,0);c.bezierCurveTo(-w*.3,-h*.1,-w*1.2,-h*.4,-w*.85,-h*.75);c.bezierCurveTo(-w*.5,-h*1.1,0,-h*.85,0,-h*.7);c.bezierCurveTo(0,-h*.85,w*.5,-h*1.1,w*.85,-h*.75);c.bezierCurveTo(w*1.2,-h*.4,w*.3,-h*.1,0,0);},
  elongated:(c,s,o)=>{const w=s*.22*o,h=s*1.3*o;c.moveTo(0,0);c.bezierCurveTo(-w,-h*.3,-w*.9,-h*.7,-w*.4,-h*.95);c.quadraticCurveTo(0,-h*1.05,w*.4,-h*.95);c.bezierCurveTo(w*.9,-h*.7,w,-h*.3,0,0);},
  tulip:(c,s,o)=>{const w=s*.4*o,h=s*1.1*o;c.moveTo(0,0);c.bezierCurveTo(-w*.3,-h*.15,-w*1.1,-h*.4,-w*.8,-h*.75);c.bezierCurveTo(-w*.5,-h*1.05,0,-h*1.15,0,-h);c.bezierCurveTo(0,-h*1.15,w*.5,-h*1.05,w*.8,-h*.75);c.bezierCurveTo(w*1.1,-h*.4,w*.3,-h*.15,0,0);},
};
function petalPath(type,size){const fn=PSHAPES[type]||PSHAPES.round;return{draw:(c2,o)=>{c2.beginPath();fn(c2,size,o);c2.closePath();}};}

// ── SPECIES ──
const SPECIES=[
  {n:'cherry',pc:[5,5],pt:'round',ps:[20,34],ly:1,pl:'cherry',cs:.25,sc:[5,8]},
  {n:'rose',pc:[5,7],pt:'pointed',ps:[24,40],ly:[2,4],pl:'rose',cs:.14,sc:[0,0]},
  {n:'sun',pc:[14,20],pt:'elongated',ps:[24,36],ly:1,pl:'sun',cs:.35,sc:[0,0]},
  {n:'lav',pc:[4,6],pt:'bell',ps:[8,15],ly:1,pl:'lav',cs:.12,sc:[0,2]},
  {n:'daisy',pc:[10,16],pt:'tiny',ps:[13,22],ly:1,pl:'daisy',cs:.28,sc:[3,6]},
  {n:'poppy',pc:[4,6],pt:'cupped',ps:[28,48],ly:1,pl:'poppy',cs:.22,sc:[10,18]},
  {n:'corn',pc:[7,9],pt:'spiky',ps:[16,26],ly:1,pl:'corn',cs:.2,sc:[3,5]},
  {n:'wrose',pc:[5,5],pt:'heart',ps:[24,36],ly:1,pl:'wrose',cs:.22,sc:[8,14]},
  {n:'butt',pc:[5,5],pt:'round',ps:[10,18],ly:1,pl:'butt',cs:.2,sc:[4,8]},
  {n:'fox',pc:[5,6],pt:'bell',ps:[13,22],ly:1,pl:'fox',cs:.15,sc:[0,2]},
  {n:'cosm',pc:[8,8],pt:'wide',ps:[20,34],ly:1,pl:'cosm',cs:.18,sc:[5,8]},
  {n:'bell',pc:[5,6],pt:'bell',ps:[10,18],ly:1,pl:'bell',cs:.12,sc:[0,2]},
  {n:'tulipR',pc:[6,6],pt:'tulip',ps:[22,36],ly:[1,2],pl:'tulipRed',cs:.1,sc:[0,0]},
  {n:'tulipY',pc:[6,6],pt:'tulip',ps:[22,36],ly:[1,2],pl:'tulipYel',cs:.1,sc:[0,0]},
  {n:'tulipP',pc:[6,6],pt:'tulip',ps:[20,32],ly:[1,2],pl:'tulipPink',cs:.1,sc:[0,0]},
  {n:'tulipV',pc:[6,6],pt:'tulip',ps:[20,32],ly:[1,2],pl:'tulipPurp',cs:.1,sc:[0,0]},
];

// ══════════════════════════════════════════
// FLOWER
// ══════════════════════════════════════════
const PH={STEM:0,BUD:1,BLOOM:2,FULL:3,WILT:4,DEAD:5};
class Flower{
  constructor(x,y,scale,specOver){
    this.x=x;this.y=y;this.scale=scale;
    this.sp=specOver||pick(SPECIES);this.pal=PAL[this.sp.pl];this.id=Math.random();
    this.petalCount=RI(this.sp.pc[0],this.sp.pc[1]);
    this.petalSize=R(this.sp.ps[0],this.sp.ps[1])*scale;
    this.layers=typeof this.sp.ly==='number'?this.sp.ly:RI(this.sp.ly[0],this.sp.ly[1]);
    this.stamenCount=RI(this.sp.sc[0],this.sp.sc[1]);
    this.petalColors=[];for(let l=0;l<this.layers;l++){const b=this.pal.p();const lc=[];for(let i=0;i<this.petalCount;i++)lc.push({h:b.h+R(-10,10),s:b.s+R(-6,6),l:b.l+R(-6,6)-l*5});this.petalColors.push(lc);}
    this.cc=this.pal.c();this.stc=this.pal.st();
    this.stemH=R(35,120)*scale;this.stemCurve=R(-22,22)*scale;this.stemW=R(1.5,3.2)*scale;
    this.leaves=[];for(let i=0,n=RI(0,3);i<n;i++)this.leaves.push({t:R(.2,.7),side:Math.random()>.5?1:-1,size:R(5,14)*scale,angle:R(20,55)});
    this.phase=PH.STEM;this.pt=0;this.stemP=0;this.budP=0;this.bloomP=0;this.wiltP=0;this.opacity=1;
    this.stemDur=R(1.8,3.5);this.budDur=R(1.2,2.5);this.bloomDur=R(2.5,5.5);this.fullDur=R(14,40);this.wiltDur=R(3,7);
    this.ws=Math.random()*1000;this.wSens=R(.4,1.6);
    this.pOff=[];for(let l=0;l<this.layers;l++){const o=[];for(let i=0;i<this.petalCount;i++)o.push({a:R(-.1,.1),s:R(.88,1.12),d:R(0,.35)});this.pOff.push(o);}
    this._petPaths=[];for(let l=0;l<this.layers;l++){const lp=[];const ls=1-l*.14;for(let i=0;i<this.petalCount;i++)lp.push(petalPath(this.sp.pt,this.petalSize*ls*this.pOff[l][i].s));this._petPaths.push(lp);}
    this._petalGrads=[];
    this.fallen=[];
  }
  update(dt,t){
    this.pt+=dt;
    switch(this.phase){
      case PH.STEM:this.stemP=cl(this.pt/this.stemDur,0,1);if(this.stemP>=1){this.phase=PH.BUD;this.pt=0;}break;
      case PH.BUD:this.budP=cl(this.pt/this.budDur,0,1);if(this.budP>=1){this.phase=PH.BLOOM;this.pt=0;}break;
      case PH.BLOOM:this.bloomP=cl(this.pt/this.bloomDur,0,1);if(this.bloomP>=1){this.phase=PH.FULL;this.pt=0;}break;
      case PH.FULL:if(this.pt>=this.fullDur){this.phase=PH.WILT;this.pt=0;}break;
      case PH.WILT:this.wiltP=cl(this.pt/this.wiltDur,0,1);if(Math.random()<.025*dt*60&&this.wiltP>.1)this.shed(t);this.opacity=1-ease.in(this.wiltP)*.6;if(this.wiltP>=1)this.phase=PH.DEAD;break;
    }
    for(const p of this.fallen){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=15*dt;p.vx+=noise.get(p.x*.004,t*.3)*35*dt;p.r+=p.rs*dt;p.life-=dt;}
    this.fallen=this.fallen.filter(p=>p.life>0&&p.y<H+50);
  }
  shed(t){if(this.fallen.length>8)return;const top=this.getTop();const c=this.petalColors[0][RI(0,this.petalCount-1)];this.fallen.push({x:top.x+R(-8,8),y:top.y+R(-8,5),vx:R(-30,30),vy:R(-45,-8),r:R(0,6.28),rs:R(-3,3),size:this.petalSize*R(.35,.7),color:c,life:R(3,8)});}
  getTop(){const t=cl(this.stemP,0,1);return{x:this.x+Math.sin(t*Math.PI)*this.stemCurve,y:this.y-this.stemH*t};}
  _cacheHead(time){
    const pad=this.petalSize*2.2;const dim=Math.ceil(pad*2);const d=Math.min(window.devicePixelRatio||1,2);
    this._headOC=document.createElement('canvas');this._headOC.width=dim*d;this._headOC.height=dim*d;
    const hc=this._headOC.getContext('2d');hc.setTransform(d,0,0,d,0,0);hc.translate(pad,pad);
    const sv=ctx;ctx=hc;this.drawPetals(1,time);this.drawCenter(1);if(this.stamenCount>0)this.drawStamens(1,time);ctx=sv;
    this._headPad=pad;this._headDim=dim;
  }
  draw(time){
    const wx=noise.fbm(this.ws+time*.13,0,2)*14*this.wSens+gustForce*this.wSens;
    const wa=noise.fbm(this.ws+100,time*.1,2)*.07*this.wSens;
    ctx.save();ctx.globalAlpha=this.opacity;
    if(this.stemP>0)this.drawStem(wx,wa);
    if(this.budP>0){const top=this.getTop();ctx.save();ctx.translate(top.x+wx,top.y);ctx.rotate(wa);
      if(this.phase<=PH.BUD)this.drawBud();
      else if(this.phase===PH.FULL){if(!this._headOC)this._cacheHead(time);ctx.drawImage(this._headOC,-this._headPad,-this._headPad,this._headDim,this._headDim);}
      else{const o=this.phase===PH.BLOOM?ease.elastic(this.bloomP):1-ease.in(this.wiltP)*.35;this.drawPetals(o,time);this.drawCenter(o);if(this.stamenCount>0&&o>.5)this.drawStamens(o,time);}
      ctx.restore();}
    for(const p of this.fallen){const a=cl(p.life/2,0,1)*.75;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.beginPath();ctx.ellipse(0,0,p.size*.35,p.size*.55,0,0,6.28);ctx.fillStyle=hsl(p.color.h,p.color.s,p.color.l,a);ctx.fill();ctx.restore();}
    ctx.restore();
  }
  drawStem(wx,wa){
    const pr=ease.out(this.stemP);const sc=this.stc;
    ctx.strokeStyle=hsl(sc.h,sc.s,sc.l,.88);ctx.lineWidth=this.stemW;ctx.lineCap='round';ctx.beginPath();
    for(let i=0,n=24;i<=n*pr;i++){const t=i/n;const x=this.x+Math.sin(t*Math.PI)*this.stemCurve+wx*t*t;const y=this.y-this.stemH*t;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    for(const lf of this.leaves){if(lf.t>pr)continue;const lt=lf.t;const lx=this.x+Math.sin(lt*Math.PI)*this.stemCurve+wx*lt*lt;const ly=this.y-this.stemH*lt;const lo=cl((pr-lf.t)*4,0,1);ctx.save();ctx.translate(lx,ly);ctx.rotate((lf.side>0?-1:1)*(lf.angle*Math.PI/180)+wa*.4);ctx.scale(lo,lo);const ls=lf.size;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(lf.side*ls*.4,-ls*.3,lf.side*ls*.5,-ls*.8,lf.side*ls*.1,-ls);ctx.bezierCurveTo(-lf.side*ls*.1,-ls*.6,-lf.side*ls*.05,-ls*.3,0,0);ctx.fillStyle=hsl(sc.h+R(-4,4),sc.s+10,sc.l+10,.82);ctx.fill();ctx.restore();}
  }
  drawBud(){const pr=ease.out(this.budP);const sz=this.petalSize*.38*pr;const sc=this.stc;for(let i=0;i<3;i++){ctx.save();ctx.rotate((i/3)*6.28-1.57);ctx.beginPath();ctx.ellipse(0,-sz*.3,sz*.35,sz*.7,0,0,6.28);ctx.fillStyle=hsl(sc.h,sc.s+5,sc.l+5,.78);ctx.fill();ctx.restore();}if(pr>.5){const pk=(pr-.5)*2;const c=this.petalColors[0][0];ctx.beginPath();ctx.arc(0,-sz*.2,sz*.25*pk,0,6.28);ctx.fillStyle=hsl(c.h,c.s,c.l,pk*.55);ctx.fill();}}
  drawPetals(op,time){
    for(let layer=this.layers-1;layer>=0;layer--){
      const lo=cl(op*1.3-layer*.25,0,1);if(lo<=0)continue;const ls=1-layer*.14;const lr=layer*(Math.PI/this.petalCount/2);
      for(let i=0;i<this.petalCount;i++){
        const off=this.pOff[layer][i];const angle=(i/this.petalCount)*6.28+lr+off.a;const po=cl(lo-off.d,0,1);if(po<=0)continue;
        const c=this.petalColors[layer][i];const pt=this._petPaths[layer][i];
        const br=1+Math.sin(time*1.1+i+layer*2.3+this.id*10)*.018;
        ctx.save();ctx.rotate(angle);ctx.scale(br,br);pt.draw(ctx,po);
        let gr;const gk=layer*100+i;
        if(this.phase===PH.FULL&&this._petalGrads[gk]){gr=this._petalGrads[gk];}
        else{gr=ctx.createRadialGradient(0,0,0,0,-this.petalSize*po*.5,this.petalSize*po);
        gr.addColorStop(0,hsl(c.h,c.s,c.l+12,.93));gr.addColorStop(.5,hsl(c.h,c.s,c.l,.88));gr.addColorStop(1,hsl(c.h,c.s-5,c.l-10,.82));
        if(this.phase===PH.FULL)this._petalGrads[gk]=gr;}
        ctx.fillStyle=gr;ctx.fill();
        ctx.restore();
      }
    }
  }
  drawCenter(op){if(op<.3)return;const c=this.cc;const r=this.petalSize*this.sp.cs*op;const a=cl((op-.3)/.4,0,1);const gr=ctx.createRadialGradient(0,0,0,0,0,r);gr.addColorStop(0,hsl(c.h,c.s,c.l+10,a));gr.addColorStop(.7,hsl(c.h,c.s,c.l,a*.9));gr.addColorStop(1,hsl(c.h,c.s+10,c.l-15,a*.55));ctx.beginPath();ctx.arc(0,0,r,0,6.28);ctx.fillStyle=gr;ctx.fill();if(op>.6){const da=cl((op-.6)/.3,0,1)*.65;const ga=Math.PI*(3-Math.sqrt(5));const dc=Math.floor(r*3);ctx.fillStyle=hsl(c.h+15,c.s-20,c.l-20,da);ctx.beginPath();for(let i=0;i<dc;i++){const an=i*ga,d=Math.sqrt(i/dc)*r*.85,dx=Math.cos(an)*d,dy=Math.sin(an)*d,dr=.4+(i/dc)*.8;ctx.moveTo(dx+dr,dy);ctx.arc(dx,dy,dr,0,6.28);}ctx.fill();}}
  drawStamens(op,time){if(op<.6)return;const a=cl((op-.6)/.3,0,1);const c=this.cc;for(let i=0;i<this.stamenCount;i++){const an=(i/this.stamenCount)*6.28+.3;const len=this.petalSize*R(.3,.5)*op;const sw=Math.sin(time*.4+i*1.5+this.id*5)*.012;ctx.save();ctx.rotate(an+sw);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-len);ctx.strokeStyle=hsl(c.h+10,c.s-20,c.l+20,a*.55);ctx.lineWidth=.5;ctx.stroke();ctx.beginPath();ctx.arc(0,-len,1.1*this.scale,0,6.28);ctx.fillStyle=hsl(c.h+20,c.s,c.l-5,a*.75);ctx.fill();ctx.restore();}}
  get isDead(){return this.phase===PH.DEAD&&this.fallen.length===0;}
}
