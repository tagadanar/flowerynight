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

// ══════════════════════════════════════════
// SKY: STARS
// ══════════════════════════════════════════
class StarField{
  constructor(){this.stars=[];for(let i=0;i<250;i++){const y=R(0,.92);this.stars.push({x:R(0,1),y,size:R(.3,2.2),ts:R(.5,4),tp:R(0,6.28),ba:R(.15,.7),hue:pick([220,230,240,200,45,30,0,350]),sat:R(5,40),lit:R(80,100),hf:1-y*y*y});}}
  draw(time){for(const s of this.stars){const tw=.5+.5*Math.sin(time*s.ts+s.tp);const a=s.ba*tw*s.hf;if(a<.02)continue;const sy=s.y*HOR,x=s.x*W;if(s.size>1.2){ctx.beginPath();ctx.arc(x,sy,s.size*3,0,6.28);ctx.fillStyle=hsl(s.hue,s.sat,s.lit,a*.08);ctx.fill();}ctx.beginPath();ctx.arc(x,sy,s.size*(.7+tw*.3),0,6.28);ctx.fillStyle=hsl(s.hue,s.sat,s.lit,a);ctx.fill();}}
}

// ══════════════════════════════════════════
// SKY: STAR BLOOMING
// ══════════════════════════════════════════
class StarBloom{
  constructor(){this.blooms=[];this.timer=R(3,8);}
  update(dt,time){this.timer-=dt;if(this.timer<=0){this.timer=R(5,12);this.blooms.push({x:R(W*.05,W*.95),y:R(HOR*.05,HOR*.75),rays:RI(4,8),maxSize:R(15,45),duration:R(4,8),time:0,hue:pick([220,260,340,45,180,300]),sat:R(30,70),lit:R(70,95),rot:R(0,6.28),rs:R(-.15,.15)});}for(const b of this.blooms)b.time+=dt;this.blooms=this.blooms.filter(b=>b.time<b.duration);}
  draw(time){for(const b of this.blooms){const t=b.time/b.duration;let I;if(t<.4)I=ease.elastic(t/.4);else if(t<.7)I=1;else I=1-ease.in((t-.7)/.3);const sz=b.maxSize*I,a=I*.7;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot+b.time*b.rs);const gg=ctx.createRadialGradient(0,0,0,0,0,sz*1.5);gg.addColorStop(0,hsl(b.hue,b.sat,b.lit,a*.25));gg.addColorStop(1,hsl(b.hue,b.sat,b.lit,0));ctx.beginPath();ctx.arc(0,0,sz*1.5,0,6.28);ctx.fillStyle=gg;ctx.fill();for(let i=0;i<b.rays;i++){const an=(i/b.rays)*6.28;ctx.save();ctx.rotate(an);ctx.beginPath();ctx.moveTo(0,0);const rw=sz*.2,rh=sz;ctx.bezierCurveTo(-rw,-rh*.3,-rw*.8,-rh*.8,0,-rh);ctx.bezierCurveTo(rw*.8,-rh*.8,rw,-rh*.3,0,0);ctx.fillStyle=hsl(b.hue,b.sat,b.lit,a*.5);ctx.fill();ctx.restore();}ctx.beginPath();ctx.arc(0,0,sz*.12,0,6.28);ctx.fillStyle=hsl(b.hue,b.sat-10,98,a);ctx.fill();ctx.restore();}}
}

// ══════════════════════════════════════════
// SKY: SHOOTING STARS
// ══════════════════════════════════════════
class ShootingStars{
  constructor(){this.stars=[];this.timer=R(5,15);}
  update(dt){this.timer-=dt;if(this.timer<=0){this.timer=R(8,22);const sx=R(W*.1,W*.9),sy=R(HOR*.02,HOR*.4),an=R(.3,1.2)*(Math.random()>.5?1:-1);this.stars.push({x:sx,y:sy,vx:Math.cos(an)*R(400,900),vy:Math.sin(an>0?an:an+.5)*R(200,500),trail:[],life:R(.6,1.5),size:R(1.5,3)});}for(const s of this.stars){s.trail.push({x:s.x,y:s.y,a:1});s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(const t of s.trail)t.a-=dt*3;s.trail=s.trail.filter(t=>t.a>0);}this.stars=this.stars.filter(s=>s.life>0||s.trail.length>0);}
  draw(){for(const s of this.stars){for(let i=1;i<s.trail.length;i++){const t=s.trail[i],p=s.trail[i-1];const a=cl(t.a,0,1)*.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(t.x,t.y);ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=s.size*t.a;ctx.stroke();}if(s.life>0){const a=cl(s.life/.3,0,1);ctx.beginPath();ctx.arc(s.x,s.y,s.size*1.5,0,6.28);ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fill();ctx.beginPath();ctx.arc(s.x,s.y,s.size*4,0,6.28);ctx.fillStyle=`rgba(200,220,255,${a*.15})`;ctx.fill();}}}
  // Meteor shower: spawn many at once
  shower(){for(let i=0;i<RI(10,20);i++){const sx=R(W*.05,W*.95),sy=R(HOR*.02,HOR*.3),an=R(.4,1.0)*(Math.random()>.5?1:-1);this.stars.push({x:sx,y:sy,vx:Math.cos(an)*R(300,800),vy:Math.sin(an>0?an:an+.5)*R(150,450),trail:[],life:R(.5,1.8),size:R(1,3)});}}
}

// ══════════════════════════════════════════
// SKY: MOON (offscreen canvas)
// ══════════════════════════════════════════
class Moon{
  constructor(){this.phase=R(0,1);this.x=-80;this.y=HOR*.25;this.speed=R(8,18);this.size=R(25,40);this.opacity=0;this.active=false;this.timer=R(15,40);this.hue=R(40,55);this._oc=null;}
  update(dt){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.x=-this.size*2;this.y=R(HOR*.1,HOR*.4);this.speed=R(8,18);this.phase=(this.phase+R(.15,.3))%1;this.size=R(25,40);}return;}
    this.x+=this.speed*dt;
    if(this.x<W*.1)this.opacity=cl((this.x+this.size*2)/(W*.1),0,1);else if(this.x>W*.9)this.opacity=cl((W+this.size*2-this.x)/(W*.1),0,1);else this.opacity=1;
    this.y+=Math.sin(this.x/W*Math.PI)*.08*dt;
    if(this.x>W+this.size*2){this.active=false;this.timer=R(20,50);}
  }
  draw(){
    if(!this.active||this.opacity<.01)return;const a=this.opacity;
    // Glow
    const gg=ctx.createRadialGradient(this.x,this.y,this.size*.5,this.x,this.y,this.size*6);
    gg.addColorStop(0,hsl(this.hue,20,90,a*.08));gg.addColorStop(.3,hsl(this.hue,15,80,a*.04));gg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(this.x,this.y,this.size*6,0,6.28);ctx.fillStyle=gg;ctx.fill();
    // Offscreen render
    const pad=4,dim=(this.size+pad)*2;
    if(!this._oc||this._oc.width!==Math.ceil(dim)){this._oc=document.createElement('canvas');this._oc.width=Math.ceil(dim);this._oc.height=Math.ceil(dim);}
    const oc=this._oc,ox=oc.getContext('2d');ox.clearRect(0,0,dim,dim);
    const cx=this.size+pad,cy=this.size+pad;
    ox.beginPath();ox.arc(cx,cy,this.size,0,6.28);ox.fillStyle=hsl(this.hue,12,92,.9);ox.fill();
    ox.globalAlpha=.08;for(let i=0;i<5;i++){const crx=cx+Math.cos(i*1.8+1)*this.size*.5,cry=cy+Math.sin(i*2.3+.5)*this.size*.4;ox.beginPath();ox.arc(crx,cry,this.size*(.08+(i*37%10)/100),0,6.28);ox.fillStyle=hsl(this.hue,8,78);ox.fill();}
    ox.globalAlpha=1;const pa=this.phase*Math.PI*2,so=Math.cos(pa)*this.size*1.2;
    ox.globalCompositeOperation='destination-out';ox.beginPath();ox.arc(cx+so,cy,this.size*.95,0,6.28);ox.fillStyle='rgba(0,0,0,1)';ox.fill();ox.globalCompositeOperation='source-over';
    ctx.save();ctx.globalAlpha=a;ctx.drawImage(oc,this.x-cx,this.y-cy);ctx.restore();
  }
}

// ══════════════════════════════════════════
// SKY: MOON BIKER
// ══════════════════════════════════════════
class MoonBiker{
  constructor(){this.active=false;this.cooldown=R(20,40);this.elapsed=0;this.duration=5;this.mx=0;this.my=0;this.ms=0;this.dir=1;this._lastPhase=-1;}
  update(dt,moon){
    if(this.active){this.elapsed+=dt;this.mx=moon.x;this.my=moon.y;if(this.elapsed>=this.duration){this.active=false;this.cooldown=R(15,30);}return;}
    this.cooldown-=dt;if(this.cooldown>0)return;
    if(moon.active&&moon.opacity>.5&&Math.abs(Math.cos(moon.phase*6.28))>.55){this.active=true;this.elapsed=0;this.mx=moon.x;this.my=moon.y;this.ms=moon.size;this.dir=Math.random()>.5?1:-1;}
  }
  draw(){
    if(!this.active)return;const t=this.elapsed/this.duration,r=this.ms,s=r*.042;
    const lx=(t*3-1.5)*r*this.dir,ly=-Math.sin(t*Math.PI)*r*.35;
    ctx.save();ctx.translate(this.mx+lx,this.my+ly);
    if(this.dir<0)ctx.scale(-1,1);ctx.rotate(-.1-Math.sin(t*Math.PI)*.06);ctx.scale(s,s);
    const col='rgba(8,8,12,.93)';ctx.fillStyle=col;ctx.strokeStyle=col;
    // Wheels — with tire thickness and hub
    ctx.lineWidth=.8;
    ctx.beginPath();ctx.arc(-9,5,4,0,6.28);ctx.stroke();ctx.beginPath();ctx.arc(9,5,4,0,6.28);ctx.stroke();
    ctx.beginPath();ctx.arc(-9,5,4.5,0,6.28);ctx.stroke();ctx.beginPath();ctx.arc(9,5,4.5,0,6.28);ctx.stroke();
    ctx.beginPath();ctx.arc(-9,5,.6,0,6.28);ctx.arc(9,5,.6,0,6.28);ctx.fill();
    // Spokes (spinning)
    ctx.lineWidth=.25;ctx.beginPath();
    for(let i=0;i<6;i++){const a=i*1.047+t*12,cs=Math.cos(a)*3.8,sn=Math.sin(a)*3.8;
      ctx.moveTo(-9+cs,5+sn);ctx.lineTo(-9,5);ctx.moveTo(9+cs,5+sn);ctx.lineTo(9,5);}ctx.stroke();
    // Frame
    ctx.lineWidth=1.2;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    // Seat tube + down tube
    ctx.moveTo(-9,5);ctx.lineTo(-2,-1);ctx.lineTo(9,5);
    // Top tube + head tube
    ctx.moveTo(-2,-1);ctx.lineTo(5,-1.5);ctx.lineTo(9,5);
    // Seat stay
    ctx.moveTo(-9,5);ctx.lineTo(-3,-1.5);
    // Seat post
    ctx.moveTo(-3,-2);ctx.lineTo(-2,-4);
    // Seat
    ctx.moveTo(-4,-4);ctx.lineTo(0,-3.8);
    // Handlebar post
    ctx.moveTo(5,-1.5);ctx.lineTo(6.5,-5.5);
    // Handlebars (curved)
    ctx.moveTo(5,-6);ctx.quadraticCurveTo(7,-6.5,8,-5.5);
    // Pedal cranks
    const pa=t*15;
    ctx.moveTo(-3,2);ctx.lineTo(-3+Math.cos(pa)*2,2+Math.sin(pa)*2);
    ctx.moveTo(-3,2);ctx.lineTo(-3+Math.cos(pa+Math.PI)*2,2+Math.sin(pa+Math.PI)*2);
    ctx.stroke();
    // Rider body (filled silhouette)
    ctx.beginPath();
    // Torso — leaning forward
    ctx.moveTo(-2,-4);ctx.lineTo(1,-11);
    // Shoulders
    ctx.lineTo(3,-11.5);
    // Back arm to handlebar
    ctx.lineTo(7,-6);
    ctx.moveTo(1,-11);ctx.lineTo(6.5,-5.5);
    ctx.lineWidth=1.6;ctx.stroke();
    // Legs
    ctx.lineWidth=1.4;ctx.beginPath();
    const lpx=-3+Math.cos(pa)*2,lpy=2+Math.sin(pa)*2;
    const rpx=-3+Math.cos(pa+Math.PI)*2,rpy=2+Math.sin(pa+Math.PI)*2;
    ctx.moveTo(-1.5,-3.5);ctx.quadraticCurveTo(-4,1,lpx,lpy);
    ctx.moveTo(-1.5,-3.5);ctx.quadraticCurveTo(0,1,rpx,rpy);
    ctx.stroke();
    // Head
    ctx.beginPath();ctx.arc(2,-13.5,2.5,0,6.28);ctx.fill();
    // Hair flowing back
    ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(.5,-14);ctx.quadraticCurveTo(-1,-14.5,-3,-13);
    ctx.moveTo(.5,-13.5);ctx.quadraticCurveTo(-1,-14,-2.5,-12.5);ctx.stroke();
    // Front basket — wire basket shape
    ctx.lineWidth=.8;ctx.beginPath();
    ctx.moveTo(7,-5.5);ctx.lineTo(7.5,-6);ctx.lineTo(12,-6);ctx.lineTo(12.5,-5.5);
    ctx.lineTo(12,-2);ctx.lineTo(7.5,-2);ctx.lineTo(7,-2.5);
    ctx.moveTo(7.5,-6);ctx.lineTo(7.5,-2);ctx.moveTo(9.5,-6);ctx.lineTo(9.5,-2);
    ctx.moveTo(12,-6);ctx.lineTo(12,-2);
    ctx.moveTo(7.5,-4);ctx.lineTo(12,-4);
    ctx.stroke();
    // Basket passenger — alien silhouette
    // Body hunched in basket
    ctx.beginPath();ctx.ellipse(9.8,-2.5,1.3,1.8,-.1,0,6.28);ctx.fill();
    // Long thin neck
    ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(9.5,-3.8);ctx.quadraticCurveTo(9,-5,9.2,-6);ctx.stroke();
    // Large oblong head
    ctx.beginPath();ctx.ellipse(9.5,-7,2.2,1.6,.15,0,6.28);ctx.fill();
    // Big eye
    ctx.beginPath();ctx.arc(10.2,-7.2,.5,0,6.28);ctx.fillStyle='rgba(120,160,200,.3)';ctx.fill();
    // Long arm pointing upward
    ctx.strokeStyle=col;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(10.5,-3.5);ctx.quadraticCurveTo(12,-5,12.8,-7.5);ctx.stroke();
    // Long finger
    ctx.beginPath();ctx.moveTo(12.8,-7.5);ctx.lineTo(13.2,-9);ctx.stroke();
    // Iconic fingertip glow
    const glow=ctx.createRadialGradient(13.2,-9,0,13.2,-9,2.5);
    glow.addColorStop(0,'rgba(180,200,255,.3)');glow.addColorStop(.4,'rgba(130,170,240,.1)');glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(13.2,-9,2.5,0,6.28);ctx.fillStyle=glow;ctx.fill();
    ctx.beginPath();ctx.arc(13.2,-9,.4,0,6.28);ctx.fillStyle='rgba(200,220,255,.5)';ctx.fill();
    // Glowing heart-light on chest
    ctx.beginPath();ctx.arc(9.8,-2.8,.6,0,6.28);ctx.fillStyle='rgba(255,100,80,.15)';ctx.fill();
    ctx.beginPath();ctx.arc(9.8,-2.8,.25,0,6.28);ctx.fillStyle='rgba(255,120,100,.3)';ctx.fill();
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// SKY: COMET
// ══════════════════════════════════════════
class CometSystem{
  constructor(){this.comets=[];this.timer=R(20,40);}
  update(dt,time){this.timer-=dt;if(this.timer<=0){this.timer=R(25,50);const fl=Math.random()>.5;this.comets.push({x:fl?-30:W+30,y:R(HOR*.05,HOR*.45),vx:(fl?1:-1)*R(40,100),vy:R(-8,15),particles:[],life:R(8,16),hue:pick([200,220,170,45,280]),sat:R(40,80),lit:R(70,90),size:R(3,6)});}
    for(const c of this.comets){c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=Math.sin(time*.3+c.hue)*3*dt;c.life-=dt;if(c.life>0&&Math.random()<dt*60)c.particles.push({x:c.x,y:c.y,vx:-c.vx*R(.01,.08)+R(-5,5),vy:R(-3,3),life:R(.8,2.5),size:R(1,3.5),a:1});for(const p of c.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.a=cl(p.life/.5,0,1);}c.particles=c.particles.filter(p=>p.life>0);}this.comets=this.comets.filter(c=>c.life>0||c.particles.length>0);}
  draw(){for(const c of this.comets){for(const p of c.particles){ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.a,0,6.28);ctx.fillStyle=hsl(c.hue,c.sat-10,c.lit,p.a*.5);ctx.fill();}if(c.life>0){const f=cl(c.life/2,0,1);ctx.beginPath();ctx.arc(c.x,c.y,c.size*5,0,6.28);ctx.fillStyle=hsl(c.hue,c.sat,c.lit,f*.12);ctx.fill();ctx.beginPath();ctx.arc(c.x,c.y,c.size,0,6.28);ctx.fillStyle=hsl(c.hue,c.sat-15,97,f*.9);ctx.fill();}}}
}

// ══════════════════════════════════════════
// SKY: SUPERNOVA
// ══════════════════════════════════════════
class SupernovaSystem{
  constructor(){this.novas=[];this.timer=R(35,70);}
  update(dt){this.timer-=dt;if(this.timer<=0){this.timer=R(45,90);const n={x:R(W*.1,W*.9),y:R(HOR*.05,HOR*.55),time:0,duration:R(10,16),maxR:R(60,140),h1:pick([280,220,340,200,30]),h2:pick([45,300,180,60,350]),sat:R(50,80),lit:R(60,80),rings:RI(1,3),debris:[]};for(let i=0;i<RI(12,25);i++){const a=R(0,6.28);n.debris.push({angle:a,speed:R(15,80),dist:0,size:R(.5,2.5),hue:R(n.h1,n.h2)});}this.novas.push(n);}for(const n of this.novas){n.time+=dt;for(const d of n.debris)d.dist+=d.speed*dt;}this.novas=this.novas.filter(n=>n.time<n.duration);}
  draw(){for(const n of this.novas){const t=n.time/n.duration;let I,r;if(t<.08){I=ease.out(t/.08);r=n.maxR*.1*I;}else if(t<.4){I=1;r=n.maxR*ease.out((t-.08)/.32);}else if(t<.65){I=1-(t-.4)/.25*.3;r=n.maxR;}else{I=.7*(1-ease.in((t-.65)/.35));r=n.maxR*(1+(t-.65)*.3);}if(I<.01)continue;ctx.save();ctx.translate(n.x,n.y);const ng=ctx.createRadialGradient(0,0,0,0,0,r);ng.addColorStop(0,hsl(n.h1,n.sat,n.lit+15,I*.35));ng.addColorStop(.3,hsl(n.h2,n.sat-10,n.lit,I*.2));ng.addColorStop(.6,hsl((n.h1+n.h2)/2,n.sat-20,n.lit-10,I*.1));ng.addColorStop(1,'rgba(0,0,0,0)');ctx.beginPath();ctx.arc(0,0,r,0,6.28);ctx.fillStyle=ng;ctx.fill();for(let ri=0;ri<n.rings;ri++){const rt=cl(t-ri*.08,0,1);if(rt<.05||rt>.7)continue;const rr=r*(1+ri*.2)*ease.out(rt/.7),ra=I*.25*(1-rt/.7);ctx.beginPath();ctx.arc(0,0,rr,0,6.28);ctx.strokeStyle=hsl(n.h1,n.sat,n.lit+10,ra);ctx.lineWidth=1.5-ri*.3;ctx.stroke();}if(t<.3){const ca=t<.08?I:(1-(t-.08)/.22)*.8;ctx.beginPath();ctx.arc(0,0,4+r*.05,0,6.28);ctx.fillStyle=`rgba(255,255,255,${ca})`;ctx.fill();ctx.beginPath();ctx.arc(0,0,15,0,6.28);ctx.fillStyle=`rgba(255,250,240,${ca*.3})`;ctx.fill();}for(const d of n.debris){const dx=Math.cos(d.angle)*d.dist,dy=Math.sin(d.angle)*d.dist;const da=I*cl(1-d.dist/(n.maxR*2),0,1);if(da<.02)continue;ctx.beginPath();ctx.arc(dx,dy,d.size,0,6.28);ctx.fillStyle=hsl(d.hue,n.sat,n.lit+10,da*.6);ctx.fill();}ctx.restore();}}
}

// ══════════════════════════════════════════
// SKY: NEBULA WISPS
// ══════════════════════════════════════════
class NebulaWisps{
  constructor(){this.wisps=[];for(let i=0;i<5;i++)this.wisps.push({x:R(.1,.9),y:R(.1,.7),size:R(80,200),hue:pick([260,220,300,200,340]),sat:R(20,50),lit:R(30,55),alpha:R(.012,.035),seed:R(0,1000),speed:R(.003,.01)});}
  draw(time){for(const w of this.wisps){const x=w.x*W+noise.fbm(w.seed+time*w.speed,0,3)*100,y=w.y*HOR+noise.fbm(0,w.seed+time*w.speed,3)*60;const p=w.alpha+Math.sin(time*.15+w.seed)*w.alpha*.3;const g=ctx.createRadialGradient(x,y,0,x,y,w.size);g.addColorStop(0,hsl(w.hue,w.sat,w.lit,p));g.addColorStop(.5,hsl(w.hue+20,w.sat-10,w.lit-10,p*.4));g.addColorStop(1,'rgba(0,0,0,0)');ctx.beginPath();ctx.arc(x,y,w.size,0,6.28);ctx.fillStyle=g;ctx.fill();}}
}

// ══════════════════════════════════════════
// SKY: METEOR SHOWER (rare event)
// ══════════════════════════════════════════
// (handled via ShootingStars.shower() method)

// ══════════════════════════════════════════
// SKY: AURORA BOREALIS (rare)
// ══════════════════════════════════════════
class Aurora{
  constructor(){this.active=false;this.timer=R(45,90);this.time=0;this.duration=0;this.bands=[];}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.time=0;this.duration=R(18,35);this.bands=[];
      const n=RI(2,5);for(let i=0;i<n;i++){
        const rays=[];for(let r=0;r<RI(5,10);r++)rays.push({x:R(W*.05,W*.95),w:R(1,3),speed:R(.4,1.8)});
        this.bands.push({y:HOR*R(.12,.5),amplitude:R(15,40),wavelength:R(.002,.006),speed:R(.3,.7),
          hue:pick([120,135,150,165,180]),hue2:pick([200,260,280,300,320]),
          sat:R(45,75),lit:R(50,70),height:R(40,100),seed:R(0,1000),rays});}
    }return;}
    this.time+=dt;if(this.time>=this.duration){this.active=false;this.timer=R(50,100);}
  }
  draw(time){
    if(!this.active)return;
    const t=this.time/this.duration;
    let alpha;if(t<.15)alpha=ease.out(t/.15);else if(t>.8)alpha=1-ease.in((t-.8)/.2);else alpha=1;
    alpha*=.28;
    for(const b of this.bands){
      const pulse=.5+.5*Math.sin(time*.25+b.seed);
      ctx.save();ctx.globalAlpha=alpha*pulse;
      // Curtain shape
      ctx.beginPath();ctx.moveTo(0,b.y);
      for(let x=0;x<=W;x+=8){
        const wave=Math.sin(x*b.wavelength+time*b.speed+b.seed)*b.amplitude;
        const wave2=Math.sin(x*b.wavelength*2.3+time*b.speed*1.3+b.seed+2)*b.amplitude*.3;
        ctx.lineTo(x,b.y+wave+wave2);
      }
      for(let x=W;x>=0;x-=8){
        const wave=Math.sin(x*b.wavelength+time*b.speed+b.seed)*b.amplitude;
        const wave2=Math.sin(x*b.wavelength*2.3+time*b.speed*1.3+b.seed+2)*b.amplitude*.3;
        ctx.lineTo(x,b.y+wave+wave2-b.height);
      }
      ctx.closePath();
      // Color-shifting gradient (green → teal → purple)
      const hs=Math.sin(time*.08+b.seed)*18;
      const g=ctx.createLinearGradient(0,b.y-b.height,0,b.y+b.amplitude);
      g.addColorStop(0,hsl(b.hue2+hs,b.sat-10,b.lit+5,0));
      g.addColorStop(.12,hsl(b.hue2+hs,b.sat-5,b.lit,.15));
      g.addColorStop(.35,hsl(b.hue+hs,b.sat+5,b.lit+8,.55));
      g.addColorStop(.6,hsl(b.hue+hs*.5,b.sat,b.lit,.45));
      g.addColorStop(.8,hsl(b.hue2+hs,b.sat-5,b.lit-5,.18));
      g.addColorStop(1,hsl(b.hue+hs,b.sat,b.lit,0));
      ctx.fillStyle=g;ctx.fill();
      // Vertical bright rays (shimmer curtain effect)
      for(const r of b.rays){
        const rx=r.x+Math.sin(time*r.speed+r.x*.005)*25;
        const br=Math.pow(Math.max(0,Math.sin(time*r.speed*1.5+r.x*.01+b.seed)),3);
        if(br<.08)continue;
        const wave=Math.sin(rx*b.wavelength+time*b.speed+b.seed)*b.amplitude;
        const topY=b.y+wave-b.height*.85,botY=b.y+wave+b.amplitude*.2;
        ctx.strokeStyle=hsl(b.hue+hs,b.sat+10,b.lit+20,br*.3);ctx.lineWidth=r.w;
        ctx.beginPath();ctx.moveTo(rx,topY);ctx.lineTo(rx+Math.sin(topY*.03)*2,botY);ctx.stroke();
      }
      // Bottom edge glow (brighter wavering line)
      ctx.lineWidth=1.5;ctx.strokeStyle=hsl(b.hue+hs,b.sat+8,b.lit+12,.18);
      ctx.beginPath();ctx.moveTo(0,b.y);
      for(let x=0;x<=W;x+=12){
        const wave=Math.sin(x*b.wavelength+time*b.speed+b.seed)*b.amplitude;
        const wave2=Math.sin(x*b.wavelength*2.3+time*b.speed*1.3+b.seed+2)*b.amplitude*.3;
        ctx.lineTo(x,b.y+wave+wave2);
      }ctx.stroke();
      ctx.restore();
    }
  }
}

// ══════════════════════════════════════════
// SKY: RAINBOW (rare)
// ══════════════════════════════════════════
class Rainbow{
  constructor(){this.active=false;this.timer=R(30,70);this.time=0;this.duration=0;this.cx=0;this.cy=0;this.r=0;}
  update(dt){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.time=0;this.duration=R(15,25);this.cx=R(W*.2,W*.8);this.cy=HOR+R(20,80);this.r=R(W*.25,W*.45);}return;}
    this.time+=dt;if(this.time>=this.duration){this.active=false;this.timer=R(25,50);}
  }
  draw(){
    if(!this.active)return;
    const t=this.time/this.duration;
    let alpha;if(t<.2)alpha=ease.out(t/.2);else if(t>.75)alpha=1-ease.in((t-.75)/.25);else alpha=1;
    alpha*=.12; // very subtle
    const colors=[0,25,50,120,200,260,300];
    const bw=this.r*.03;
    ctx.save();ctx.globalAlpha=alpha;
    for(let i=0;i<colors.length;i++){
      const cr=this.r-i*bw;
      ctx.beginPath();ctx.arc(this.cx,this.cy,cr,Math.PI,0,true);
      ctx.strokeStyle=hsl(colors[i],70,60);
      ctx.lineWidth=bw;ctx.stroke();
    }
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// CREATURES: BIRD FLOCK (improved)
// ══════════════════════════════════════════
class BirdFlock{
  constructor(){this.flocks=[];this.timer=R(18,40);}
  update(dt,time){
    this.timer-=dt;
    if(this.timer<=0){
      this.timer=R(25,65);
      const count=RI(7,22);const fromLeft=Math.random()>.5;
      const baseY=R(HOR*.06,HOR*.5);const speed=R(35,85);
      const formation=pick(['v','v','v','asym_v','echelon','loose_v','arc','cluster','stagger']);
      const birds=[];const leaderSize=R(5,7.5);
      // V-shape parameters randomized per flock
      const vAngle=R(25,50); // degrees of the V arms
      const vSpacing=R(18,30); // spacing along the arm
      const vJitter=R(3,10); // positional noise
      const armBias=R(.6,1.4); // asymmetric V: one arm longer
      for(let i=0;i<count;i++){
        let ox=0,oy=0;
        switch(formation){
          case 'v': {
            if(i===0){ox=0;oy=0;}else{
              const side=i%2===0?-1:1;const row=Math.ceil(i/2);
              const rad=vAngle*Math.PI/180;
              ox=side*row*vSpacing*Math.sin(rad)+R(-vJitter,vJitter);
              oy=row*vSpacing*Math.cos(rad)+R(-vJitter,vJitter);
            }break;}
          case 'asym_v': {
            if(i===0){ox=0;oy=0;}else{
              const side=i%2===0?-1:1;const row=Math.ceil(i/2);
              const bias=side>0?armBias:2-armBias;
              const rad=vAngle*Math.PI/180;
              ox=side*row*vSpacing*Math.sin(rad)*bias+R(-vJitter,vJitter);
              oy=row*vSpacing*Math.cos(rad)*bias+R(-vJitter,vJitter);
            }break;}
          case 'loose_v': {
            if(i===0){ox=0;oy=0;}else{
              const side=i%2===0?-1:1;const row=Math.ceil(i/2);
              const rad=R(20,55)*Math.PI/180; // each bird slightly different angle
              ox=side*row*vSpacing*Math.sin(rad)+R(-12,12);
              oy=row*vSpacing*Math.cos(rad)+R(-10,10);
            }break;}
          case 'echelon': {
            // Diagonal line
            const side=Math.random()>.5?1:-1;
            ox=side*i*R(14,22)+R(-5,5);
            oy=i*R(8,14)+R(-5,5);
            break;}
          case 'arc': {
            // Curved arc
            const t=(i/(count-1))-.5; // -0.5 to 0.5
            const arcW=count*R(12,20);
            const arcH=R(25,60);
            ox=t*arcW+R(-5,5);
            oy=t*t*arcH*4+R(-4,4); // parabola
            break;}
          case 'cluster': {
            const angle=R(0,6.28);const dist=R(5,45);
            ox=Math.cos(angle)*dist;oy=Math.sin(angle)*dist*.6;
            break;}
          case 'stagger': {
            // Staggered rows
            const row=Math.floor(i/3);const col=i%3;
            ox=(col-1)*R(18,28)+R(-8,8);
            oy=row*R(14,22)+R(-6,6);
            break;}
        }
        birds.push({ox,oy,wingP:R(0,6.28),wingS:R(3.5,6.5),size:i===0?leaderSize:R(3.5,6),drift:{x:0,y:0}});
      }
      this.flocks.push({x:fromLeft?-100:W+100,y:baseY,vx:(fromLeft?1:-1)*speed,vy:R(-5,5),birds,seed:R(0,1000)});
    }
    for(const f of this.flocks){
      f.x+=f.vx*dt;
      f.y+=f.vy*dt+Math.sin(time*.3+f.seed)*8*dt;
      for(const b of f.birds){
        b.wingP+=b.wingS*dt;
        b.drift.x+=noise.get(b.wingP*.1+f.seed,time*.2)*18*dt;
        b.drift.y+=noise.get(time*.2,b.wingP*.1+f.seed)*12*dt;
        b.drift.x*=.97;b.drift.y*=.97;
      }
    }
    this.flocks=this.flocks.filter(f=>f.x>-250&&f.x<W+250);
  }
  draw(){
    for(const f of this.flocks){
      for(const b of f.birds){
        const bx=f.x+b.ox+b.drift.x;const by=f.y+b.oy+b.drift.y;
        if(bx<-40||bx>W+40||by<-40||by>HOR+20)continue;
        const wing=Math.sin(b.wingP)*.6;const s=b.size;
        ctx.save();ctx.translate(bx,by);
        if(f.vx<0)ctx.scale(-1,1);
        ctx.strokeStyle='rgba(25,20,35,.55)';ctx.lineWidth=s*.3;ctx.lineCap='round';
        // Wider wingspan, more visible
        ctx.beginPath();
        ctx.moveTo(-s*1.6,-wing*s*1.1);
        ctx.quadraticCurveTo(-s*.4,-wing*s*.35,0,0);
        ctx.quadraticCurveTo(s*.4,-wing*s*.35,s*1.6,-wing*s*1.1);
        ctx.stroke();
        // Body
        if(s>4){ctx.beginPath();ctx.arc(0,0,s*.18,0,6.28);ctx.fillStyle='rgba(25,20,35,.35)';ctx.fill();}
        ctx.restore();
      }
    }
  }
}

// ══════════════════════════════════════════
// CREATURES: BUTTERFLY
// ══════════════════════════════════════════
class Butterfly{
  constructor(){this.reset();}
  reset(){this.x=R(-50,W+50);this.y=R(HOR*.7,H*.85);this.tx=R(W*.05,W*.95);this.ty=R(HOR*.6,H*.8);this.speed=R(25,55);this.wp=R(0,6.28);this.ws=R(8,14);this.size=R(4,8);this.hue=pick([R(30,55),R(200,250),R(280,320),R(340,360),R(15,30)]);this.sat=R(50,85);this.lit=R(55,78);this.life=R(12,25);this.maxLife=this.life;this.seed=R(0,1000);this.retT=0;}
  update(dt,time){this.wp+=this.ws*dt;this.retT-=dt;if(this.retT<=0){this.tx=R(W*.05,W*.95);this.ty=R(HOR*.6,H*.8);this.retT=R(2,6);}const dx=this.tx-this.x,dy=this.ty-this.y,d=Math.sqrt(dx*dx+dy*dy);if(d>1){this.x+=(dx/d)*this.speed*dt;this.y+=(dy/d)*this.speed*dt;}this.x+=noise.get(this.seed+time*.5,0)*30*dt;this.y+=noise.get(0,this.seed+time*.5)*20*dt;this.life-=dt;if(this.life<=0)this.reset();}
  draw(){const wing=Math.sin(this.wp)*.7;const fi=cl((this.maxLife-this.life)/1.5,0,1),fo=cl(this.life/1.5,0,1);const a=Math.min(fi,fo)*.7;const s=this.size;ctx.save();ctx.translate(this.x,this.y);ctx.globalAlpha=a;const ang=Math.atan2(this.ty-this.y,this.tx-this.x);ctx.rotate(ang*.3);for(const side of[-1,1]){ctx.save();ctx.scale(side,1);ctx.save();ctx.transform(1,0,0,Math.abs(wing),0,0);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(s*.6,-s*.8,s*1.5,-s*1.1,s*1.2,-s*.2);ctx.bezierCurveTo(s*1.3,s*.3,s*.6,s*.5,0,0);ctx.fillStyle=hsl(this.hue,this.sat,this.lit,.8);ctx.fill();ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(s*.5,s*.2,s*1.1,s*.5,s*.8,s*.9);ctx.bezierCurveTo(s*.3,s*.7,s*.1,s*.4,0,0);ctx.fillStyle=hsl(this.hue+10,this.sat-5,this.lit-8,.7);ctx.fill();ctx.restore();ctx.restore();}ctx.beginPath();ctx.ellipse(0,0,s*.12,s*.4,0,0,6.28);ctx.fillStyle='rgba(20,15,10,.7)';ctx.fill();ctx.restore();}
}

// ══════════════════════════════════════════
// CREATURES: BEE
// ══════════════════════════════════════════
class Bee{
  constructor(){this.reset();}
  reset(){this.x=R(W*.05,W*.95);this.y=R(HOR,H*.8);this.tx=this.x+R(-100,100);this.ty=R(HOR*.85,H*.82);this.speed=R(40,80);this.seed=R(0,1000);this.size=R(2.5,4.5);this.wingP=R(0,6.28);this.life=R(15,30);this.maxLife=this.life;this.retT=0;this.buzzAmp=R(3,8);}
  update(dt,time){this.wingP+=25*dt;this.retT-=dt;if(this.retT<=0){this.tx=R(W*.05,W*.95);this.ty=R(HOR*.85,H*.82);this.retT=R(1,4);}const dx=this.tx-this.x,dy=this.ty-this.y,d=Math.sqrt(dx*dx+dy*dy);if(d>1){this.x+=(dx/d)*this.speed*dt;this.y+=(dy/d)*this.speed*dt;}this.x+=Math.sin(time*12+this.seed)*this.buzzAmp*dt*10;this.y+=Math.cos(time*15+this.seed)*this.buzzAmp*.6*dt*10;this.life-=dt;if(this.life<=0)this.reset();}
  draw(){const fi=cl((this.maxLife-this.life)/1,0,1),fo=cl(this.life/1,0,1);const a=Math.min(fi,fo)*.8;const s=this.size;ctx.save();ctx.translate(this.x,this.y);ctx.globalAlpha=a;ctx.beginPath();ctx.ellipse(0,0,s*.5,s*.35,0,0,6.28);ctx.fillStyle='#d4a017';ctx.fill();ctx.beginPath();ctx.ellipse(-s*.15,0,s*.12,s*.38,0,0,6.28);ctx.fillStyle='rgba(30,20,0,.6)';ctx.fill();ctx.beginPath();ctx.ellipse(s*.15,0,s*.1,s*.35,0,0,6.28);ctx.fillStyle='rgba(30,20,0,.5)';ctx.fill();const wf=Math.sin(this.wingP)*.3+.7;ctx.globalAlpha=a*.4;ctx.beginPath();ctx.ellipse(-s*.1,-s*.35*wf,s*.4,s*.2,-.3,0,6.28);ctx.fillStyle='rgba(200,220,255,.6)';ctx.fill();ctx.beginPath();ctx.ellipse(s*.1,-s*.35*wf,s*.35,s*.18,.3,0,6.28);ctx.fillStyle='rgba(200,220,255,.5)';ctx.fill();ctx.restore();}
}

// ══════════════════════════════════════════
// CREATURES: TAUPIQUEUR / TRIOPIKEUR
// ══════════════════════════════════════════
class Diglett{
  constructor(){this.moles=[];this.timer=R(20,45);}
  update(dt,time){
    this.timer-=dt;
    if(this.timer<=0){
      this.timer=R(25,55);
      const isTriple=Math.random()>.6;
      const count=isTriple?3:1;
      const cx=R(W*.12,W*.88);
      const cy=R(HOR+50,H*.88);
      const members=[];
      for(let i=0;i<count;i++){
        const offset=count===1?0:(i-1)*R(22,32);
        const h=count===1?R(28,38):R(24,34);
        // Middle one slightly taller in trio
        const extraH=count===3&&i===1?6:0;
        members.push({
          x:cx+offset,y:cy,
          riseH:h+extraH,
          w:count===1?R(13,17):R(11,15), // body half-width
          blinkTimer:R(2,5),blinkDur:0,isBlinking:false,
          lookDir:0,lookTimer:R(1,3),
          hat:RI(0,9),hatColor:pick([0,15,30,45,120,200,220,260,280,330,340]),
        });
      }
      this.moles.push({members,time:0,duration:R(3.5,7),phase:'rise',seed:R(0,1000)});
    }
    for(const g of this.moles){
      g.time+=dt;
      const t=g.time/g.duration;
      if(t<.18)g.phase='rise';
      else if(t<.78)g.phase='peek';
      else if(t<1)g.phase='hide';
      else g.phase='gone';
      // Per-member updates
      for(const m of g.members){
        // Blink
        m.blinkTimer-=dt;
        if(m.isBlinking){m.blinkDur-=dt;if(m.blinkDur<=0)m.isBlinking=false;}
        else if(m.blinkTimer<=0){m.isBlinking=true;m.blinkDur=R(.1,.2);m.blinkTimer=R(2,5);}
        // Look direction
        m.lookTimer-=dt;
        if(m.lookTimer<=0){m.lookDir=pick([-1,0,0,1]);m.lookTimer=R(1.5,4);}
      }
    }
    this.moles=this.moles.filter(m=>m.phase!=='gone');
  }
  draw(time){
    for(const group of this.moles){
      const t=group.time/group.duration;
      let riseAmt;
      if(t<.18)riseAmt=ease.out(t/.18);
      else if(t<.78)riseAmt=1+Math.sin(time*3+group.seed)*.02;
      else riseAmt=1-ease.in((t-.78)/.22);

      // Draw dirt mounds first (behind bodies)
      for(const m of group.members){
        const s=m.w;
        ctx.save();
        // Dirt mound — irregular shape
        ctx.beginPath();
        ctx.moveTo(m.x-s*2,m.y+1);
        ctx.quadraticCurveTo(m.x-s*1.2,m.y-s*.5,m.x-s*.3,m.y-s*.25);
        ctx.quadraticCurveTo(m.x,m.y-s*.55,m.x+s*.3,m.y-s*.25);
        ctx.quadraticCurveTo(m.x+s*1.2,m.y-s*.5,m.x+s*2,m.y+1);
        ctx.closePath();
        ctx.fillStyle='#6b5930';ctx.fill();
        // Lighter dirt highlights
        ctx.beginPath();
        ctx.ellipse(m.x-s*.6,m.y-s*.15,s*.35,s*.15,-.2,0,6.28);
        ctx.fillStyle='rgba(130,110,70,.4)';ctx.fill();
        ctx.beginPath();
        ctx.ellipse(m.x+s*.5,m.y-s*.08,s*.25,s*.12,.15,0,6.28);
        ctx.fillStyle='rgba(120,100,60,.3)';ctx.fill();
        // Dirt crumbs flying when rising
        if(riseAmt>.05&&t<.25){
          const pa=cl(riseAmt,0,1)*.6;
          for(let d=0;d<6;d++){
            const dx=m.x+R(-s*1.5,s*1.5);
            const dy=m.y-R(s*.2,s*.6+riseAmt*8);
            ctx.beginPath();ctx.arc(dx,dy,R(1,3),0,6.28);
            ctx.fillStyle=`rgba(100,82,45,${pa*R(.3,.8)})`;ctx.fill();
          }
        }
        ctx.restore();
      }

      // Draw bodies (clipped to ground)
      for(const m of group.members){
        const rise=m.riseH*riseAmt;
        const w=m.w; // half-width
        const bodyH=m.riseH*1.6; // total body height (most hidden underground)

        ctx.save();
        // Clip: only show above ground line
        ctx.beginPath();
        ctx.rect(m.x-w*3,0,w*6,m.y-1);
        ctx.clip();

        const topY=m.y-rise; // top of visible body

        // === BODY ===
        // Diglett body: capsule shape (rounded top, straight sides, extends below ground)
        ctx.beginPath();
        // Rounded top (semicircle)
        ctx.arc(m.x,topY+w*.1,w,Math.PI,0,false);
        // Right side straight down
        ctx.lineTo(m.x+w,topY+bodyH);
        // Bottom (hidden, but needed for fill)
        ctx.lineTo(m.x-w,topY+bodyH);
        // Left side back up
        ctx.closePath();

        // Body gradient: brown with highlight
        const bg=ctx.createLinearGradient(m.x-w,topY,m.x+w,topY);
        bg.addColorStop(0,'#7a5a18');
        bg.addColorStop(.3,'#c49a3c');
        bg.addColorStop(.5,'#d4a840');
        bg.addColorStop(.7,'#c49a3c');
        bg.addColorStop(1,'#7a5a18');
        ctx.fillStyle=bg;ctx.fill();

        // Subtle outline
        ctx.strokeStyle='rgba(80,55,15,.3)';ctx.lineWidth=.8;ctx.stroke();

        // Top highlight (shiny head)
        const hg=ctx.createRadialGradient(m.x-w*.2,topY+w*.15,0,m.x,topY+w*.3,w*1.2);
        hg.addColorStop(0,'rgba(255,230,160,.25)');
        hg.addColorStop(1,'rgba(255,230,160,0)');
        ctx.fillStyle=hg;
        ctx.beginPath();ctx.arc(m.x,topY+w*.1,w*.95,Math.PI,0,false);
        ctx.lineTo(m.x+w*.95,topY+w*.8);ctx.lineTo(m.x-w*.95,topY+w*.8);ctx.closePath();
        ctx.fill();

        // === FACE ===
        const faceY=topY+w*.55; // center of face
        const lookOff=m.lookDir*w*.06; // slight eye shift when looking

        // Eyes - white sclera
        const eyeSpacing=w*.52;
        const eyeW=w*.22,eyeH=w*.28;
        for(const side of[-1,1]){
          const ex=m.x+side*eyeSpacing+lookOff;
          const ey=faceY-w*.12;

          if(m.isBlinking){
            // Closed eye: horizontal line
            ctx.beginPath();
            ctx.moveTo(ex-eyeW,ey);
            ctx.lineTo(ex+eyeW,ey);
            ctx.strokeStyle='#1a1a1a';ctx.lineWidth=1.5;ctx.stroke();
          }else{
            // White of eye
            ctx.beginPath();
            ctx.ellipse(ex,ey,eyeW,eyeH,0,0,6.28);
            ctx.fillStyle='#fff';ctx.fill();
            ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=.5;ctx.stroke();

            // Pupil (follows look direction)
            const px=ex+lookOff*1.5+side*w*.02;
            const py=ey+w*.02;
            ctx.beginPath();
            ctx.ellipse(px,py,eyeW*.6,eyeH*.65,0,0,6.28);
            ctx.fillStyle='#1a1010';ctx.fill();

            // Eye highlight (top-left shine)
            ctx.beginPath();
            ctx.arc(px-eyeW*.25,py-eyeH*.25,eyeW*.28,0,6.28);
            ctx.fillStyle='rgba(255,255,255,.85)';ctx.fill();
            // Smaller secondary highlight
            ctx.beginPath();
            ctx.arc(px+eyeW*.15,py+eyeH*.1,eyeW*.12,0,6.28);
            ctx.fillStyle='rgba(255,255,255,.4)';ctx.fill();
          }
        }

        // Nose — pink/red oval, prominent
        const noseX=m.x+lookOff*.5;
        const noseY=faceY+w*.28;
        ctx.beginPath();
        ctx.ellipse(noseX,noseY,w*.2,w*.16,0,0,6.28);
        // Nose gradient
        const ng=ctx.createRadialGradient(noseX-w*.05,noseY-w*.04,0,noseX,noseY,w*.2);
        ng.addColorStop(0,'#f0a0a0');ng.addColorStop(.5,'#e07070');ng.addColorStop(1,'#c05555');
        ctx.fillStyle=ng;ctx.fill();
        // Nose highlight
        ctx.beginPath();ctx.arc(noseX-w*.06,noseY-w*.05,w*.07,0,6.28);
        ctx.fillStyle='rgba(255,200,200,.5)';ctx.fill();

        ctx.restore();
      }

      // Draw hats (outside clip so they show above ground)
      for(const m of group.members){
        const rise=m.riseH*riseAmt;if(rise<3)continue;
        const w=m.w,topY=m.y-rise;
        const hx=m.x,hy=topY-w*.8; // hat anchor point (top of head)
        ctx.save();ctx.translate(hx,hy);
        this._drawHat(ctx,w,m.hat,m.hatColor);
        ctx.restore();
      }
    }
  }
  _drawHat(c,w,type,hue){
    const s=w*.9; // hat scale
    switch(type){
      case 0:{ // Top hat — dark grey cylinder, visible band
        c.fillStyle='#3a3845';c.beginPath();c.rect(-s*.6,-s*1.6,s*1.2,s*1.4);c.fill();
        c.fillStyle='#444250';c.beginPath();c.ellipse(0,-s*1.6,s*.65,s*.2,0,0,6.28);c.fill();
        c.fillStyle='#2e2c38';c.beginPath();c.ellipse(0,-s*.2,s*.9,s*.24,0,0,6.28);c.fill();
        c.fillStyle=hsl(hue,70,55,.9);c.fillRect(-s*.62,-s*.55,s*1.24,s*.2);
        c.fillStyle='rgba(255,255,255,.1)';c.fillRect(-s*.55,-s*1.5,s*.3,s*1.2);
        break;}
      case 1:{ // Cowboy hat — warm brown, visible
        c.fillStyle=hsl(28,45,42);c.beginPath();c.ellipse(0,-s*.15,s*1.3,s*.28,0,0,6.28);c.fill();
        c.beginPath();c.moveTo(-s*.5,-s*.2);c.bezierCurveTo(-s*.55,-s*.9,-s*.3,-s*1.2,0,-s*1);
        c.bezierCurveTo(s*.3,-s*1.2,s*.55,-s*.9,s*.5,-s*.2);c.closePath();
        c.fillStyle=hsl(28,42,36);c.fill();
        c.strokeStyle=hsl(hue,55,55,.8);c.lineWidth=1.5;c.beginPath();c.moveTo(-s*.48,-s*.25);c.quadraticCurveTo(0,-s*.38,s*.48,-s*.25);c.stroke();
        c.fillStyle=hsl(45,85,68,.8);c.beginPath();for(let i=0;i<5;i++){const a=i*1.256-1.57,r2=i*1.256-1.57+.628;
          c.lineTo(Math.cos(a)*s*.14,-s*.58+Math.sin(a)*s*.14);c.lineTo(Math.cos(r2)*s*.06,-s*.58+Math.sin(r2)*s*.06);}c.fill();
        break;}
      case 2:{ // Party hat — bright striped cone
        c.beginPath();c.moveTo(-s*.5,-s*.1);c.lineTo(0,-s*1.7);c.lineTo(s*.5,-s*.1);c.closePath();
        c.fillStyle=hsl(hue,70,58);c.fill();
        c.save();c.clip();for(let i=0;i<5;i++){c.fillStyle=i%2?hsl(hue+40,75,72,.6):'rgba(255,255,255,.3)';
          c.fillRect(-s,-s*.1-i*s*.34,s*2,s*.17);}c.restore();
        c.fillStyle=hsl(hue+180,65,72);c.beginPath();c.arc(0,-s*1.7,s*.22,0,6.28);c.fill();
        c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(-s*.05,-s*1.76,s*.08,0,6.28);c.fill();
        break;}
      case 3:{ // Crown — bright gold with jewels
        c.fillStyle=hsl(45,85,58);c.beginPath();
        c.moveTo(-s*.65,-s*.1);c.lineTo(-s*.65,-s*.65);c.lineTo(-s*.38,-s*.45);c.lineTo(-s*.18,-s*.9);
        c.lineTo(0,-s*.55);c.lineTo(s*.18,-s*.9);c.lineTo(s*.38,-s*.45);c.lineTo(s*.65,-s*.65);
        c.lineTo(s*.65,-s*.1);c.closePath();c.fill();
        c.strokeStyle='rgba(180,140,30,.5)';c.lineWidth=.6;c.stroke();
        c.fillStyle=hsl(45,75,48);c.fillRect(-s*.65,-s*.22,s*1.3,s*.14);
        c.fillStyle='rgba(230,40,40,.8)';c.beginPath();c.arc(0,-s*.15,s*.09,0,6.28);c.fill();
        c.fillStyle='rgba(40,120,230,.8)';c.beginPath();c.arc(-s*.32,-s*.15,s*.07,0,6.28);c.fill();
        c.fillStyle='rgba(40,210,90,.8)';c.beginPath();c.arc(s*.32,-s*.15,s*.07,0,6.28);c.fill();
        c.fillStyle='rgba(255,250,200,.4)';c.beginPath();c.arc(-s*.1,-s*.75,s*.05,0,6.28);c.arc(s*.1,-s*.8,s*.04,0,6.28);c.fill();
        break;}
      case 4:{ // Beret — colorful French cap
        c.fillStyle=hsl(hue,50,45);c.beginPath();c.ellipse(0,-s*.25,s*.8,s*.38,-.1,0,6.28);c.fill();
        c.fillStyle=hsl(hue,45,38);c.beginPath();c.ellipse(0,-s*.1,s*.7,s*.16,0,0,6.28);c.fill();
        c.fillStyle=hsl(hue,45,40);c.beginPath();c.arc(s*.05,-s*.58,s*.09,0,6.28);c.fill();
        c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.ellipse(-s*.2,-s*.35,s*.25,s*.15,.2,0,6.28);c.fill();
        break;}
      case 5:{ // Wizard hat — deep purple with bright decorations
        c.beginPath();c.moveTo(-s*.7,-s*.1);c.quadraticCurveTo(-s*.2,-s*.8,s*.15,-s*1.9);
        c.quadraticCurveTo(s*.1,-s*.9,s*.65,-s*.1);c.closePath();
        c.fillStyle=hsl(260,45,32);c.fill();
        c.fillStyle=hsl(260,40,28);c.beginPath();c.ellipse(0,-s*.05,s*.85,s*.2,0,0,6.28);c.fill();
        c.fillStyle=hsl(50,85,75,.75);
        c.beginPath();c.arc(-s*.1,-s*.95,s*.09,0,6.28);c.fill();
        c.beginPath();c.arc(s*.22,-s*.55,s*.07,0,6.28);c.fill();
        c.beginPath();c.arc(-s*.28,-s*.6,s*.06,0,6.28);c.fill();
        c.beginPath();c.arc(s*.05,-s*1.3,s*.11,0,6.28);c.fill();
        c.fillStyle=hsl(260,45,32);c.beginPath();c.arc(s*.12,-s*1.24,s*.09,0,6.28);c.fill();
        break;}
      case 6:{ // Flower crown — colorful wreath
        c.strokeStyle='rgba(80,140,45,.7)';c.lineWidth=2;
        c.beginPath();c.ellipse(0,-s*.3,s*.65,s*.28,.05,Math.PI,.01);c.stroke();
        const fh=[340,45,280,30,310];
        for(let i=0;i<5;i++){const fa=Math.PI+i*.7-.2;
          const fx=Math.cos(fa)*s*.65,fy=-s*.3+Math.sin(fa)*s*.28;
          c.fillStyle=hsl(fh[i],60,68,.8);c.beginPath();
          for(let p=0;p<5;p++){c.save();c.translate(fx,fy);c.rotate(p*1.256);
            c.moveTo(s*.08,0);c.ellipse(0,-s*.09,s*.07,s*.05,0,0,6.28);c.restore();}c.fill();
          c.fillStyle='rgba(255,230,80,.7)';c.beginPath();c.arc(fx,fy,s*.04,0,6.28);c.fill();}
        break;}
      case 7:{ // Santa hat — bright red
        c.beginPath();c.moveTo(-s*.6,-s*.1);c.quadraticCurveTo(-s*.1,-s*.55,s*.4,-s*1.5);
        c.quadraticCurveTo(s*.55,-s*1.3,s*.6,-s*.1);c.closePath();
        c.fillStyle='rgba(210,35,35,.9)';c.fill();
        c.fillStyle='rgba(245,245,250,.85)';c.beginPath();c.ellipse(0,-s*.1,s*.7,s*.2,0,0,6.28);c.fill();
        c.fillStyle='rgba(250,250,255,.9)';c.beginPath();c.arc(s*.4,-s*1.5,s*.22,0,6.28);c.fill();
        c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(s*.37,-s*1.56,s*.08,0,6.28);c.fill();
        break;}
      case 8:{ // Chef toque — tall white puffy
        c.fillStyle='rgba(248,248,252,.9)';
        c.beginPath();c.arc(-s*.2,-s*.95,s*.38,0,6.28);c.fill();
        c.beginPath();c.arc(s*.15,-s*1.05,s*.33,0,6.28);c.fill();
        c.beginPath();c.arc(0,-s*1.15,s*.35,0,6.28);c.fill();
        c.beginPath();c.arc(-s*.1,-s*.8,s*.3,0,6.28);c.fill();
        c.beginPath();c.arc(s*.05,-s*.85,s*.32,0,6.28);c.fill();
        c.fillStyle='rgba(240,240,245,.95)';c.fillRect(-s*.55,-s*.28,s*1.1,s*.22);
        c.strokeStyle='rgba(200,200,210,.3)';c.lineWidth=.5;c.strokeRect(-s*.55,-s*.28,s*1.1,s*.22);
        break;}
      case 9:{ // Pirate tricorn — dark with gold trim & skull
        c.fillStyle='#35333e';c.beginPath();
        c.moveTo(-s*.85,-s*.15);c.quadraticCurveTo(-s*.65,-s*.55,-s*.22,-s*.75);
        c.lineTo(0,-s*1.05);c.lineTo(s*.22,-s*.75);
        c.quadraticCurveTo(s*.65,-s*.55,s*.85,-s*.15);
        c.quadraticCurveTo(s*.35,s*.06,-s*.35,s*.06);
        c.quadraticCurveTo(-s*.65,0,-s*.85,-s*.15);c.fill();
        c.strokeStyle='rgba(100,85,55,.4)';c.lineWidth=.6;c.stroke();
        c.strokeStyle=hsl(45,75,62,.6);c.lineWidth=1;
        c.beginPath();c.moveTo(-s*.75,-s*.12);c.quadraticCurveTo(0,s*.1,s*.75,-s*.12);c.stroke();
        c.fillStyle='rgba(245,245,235,.7)';c.beginPath();c.arc(0,-s*.48,s*.17,0,6.28);c.fill();
        c.fillStyle='#35333e';c.beginPath();c.arc(-s*.07,-s*.5,s*.05,0,6.28);c.arc(s*.07,-s*.5,s*.05,0,6.28);c.fill();
        c.strokeStyle='rgba(245,245,235,.55)';c.lineWidth=1.2;c.lineCap='round';
        c.beginPath();c.moveTo(-s*.17,-s*.32);c.lineTo(s*.17,-s*.58);c.moveTo(s*.17,-s*.32);c.lineTo(-s*.17,-s*.58);c.stroke();
        break;}
    }
  }
}

// ══════════════════════════════════════════
// CREATURES: FIREFLIES
// ══════════════════════════════════════════
class Fireflies{
  constructor(){this.flies=[];for(let i=0;i<10;i++)this.flies.push(this.make());}
  make(){return{x:R(W*.05,W*.95),y:R(HOR+20,H*.88),seed:R(0,1000),blinkSpeed:R(1,3),blinkPhase:R(0,6.28),size:R(1.5,3),speed:R(5,15),drift:R(0,6.28)};}
  update(dt,time){for(const f of this.flies){f.x+=Math.cos(f.drift)*f.speed*dt+noise.get(f.seed+time*.1,0)*10*dt;f.y+=Math.sin(f.drift)*f.speed*.5*dt+noise.get(0,f.seed+time*.1)*8*dt;f.drift+=R(-.5,.5)*dt;if(f.x<-20||f.x>W+20||f.y<HOR||f.y>H+20)Object.assign(f,this.make());}}
  draw(time){for(const f of this.flies){const blink=Math.pow(Math.max(0,Math.sin(time*f.blinkSpeed+f.blinkPhase)),3);if(blink<.05)continue;const a=blink*.7;ctx.beginPath();ctx.arc(f.x,f.y,f.size*4,0,6.28);ctx.fillStyle=`rgba(180,220,80,${a*.12})`;ctx.fill();ctx.beginPath();ctx.arc(f.x,f.y,f.size,0,6.28);ctx.fillStyle=`rgba(200,240,100,${a})`;ctx.fill();}}
}

// ══════════════════════════════════════════
// DANDELION BURST (event)
// ══════════════════════════════════════════
class DandelionBursts{
  constructor(){this.bursts=[];this.timer=R(15,35);}
  update(dt,time){
    this.timer-=dt;
    if(this.timer<=0){
      this.timer=R(20,45);
      const x=R(W*.1,W*.9),y=R(HOR+30,H*.8);
      const seeds=[];
      for(let i=0;i<RI(12,25);i++){
        const a=R(0,6.28);const sp=R(8,35);
        seeds.push({x,y,vx:Math.cos(a)*sp+R(-5,5),vy:Math.sin(a)*sp-R(5,20),rot:R(0,6.28),rs:R(-2,2),size:R(2,4),fils:RI(5,8),life:R(5,12)});
      }
      this.bursts.push({seeds,time:0});
    }
    for(const b of this.bursts){
      b.time+=dt;
      for(const s of b.seeds){
        s.x+=s.vx*dt;s.y+=s.vy*dt;
        s.vy-=2*dt; // float upward slowly
        s.vx+=noise.get(s.x*.003,time*.2)*20*dt;
        s.vy+=noise.get(time*.2,s.y*.003)*10*dt;
        s.rot+=s.rs*dt;s.life-=dt;
      }
      b.seeds=b.seeds.filter(s=>s.life>0&&s.y>-50&&s.x>-50&&s.x<W+50);
    }
    this.bursts=this.bursts.filter(b=>b.seeds.length>0);
  }
  draw(time){
    for(const b of this.bursts){
      for(const s of b.seeds){
        const a=cl(s.life/2,0,1)*.65;
        ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);
        for(let i=0;i<s.fils;i++){
          const an=(i/s.fils)*6.28;
          ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(an)*s.size*2.2,Math.sin(an)*s.size*2.2);
          ctx.strokeStyle=`rgba(255,250,240,${a*.5})`;ctx.lineWidth=.3;ctx.stroke();
        }
        ctx.beginPath();ctx.arc(0,0,s.size*.25,0,6.28);
        ctx.fillStyle=`rgba(255,250,230,${a})`;ctx.fill();
        ctx.restore();
      }
    }
  }
}

// ══════════════════════════════════════════
// GROUND PARTICLES
// ══════════════════════════════════════════
class Particle{
  constructor(type){this.type=type||pick(['pollen','pollen','pollen','mote','seed']);this.reset();}
  reset(){this.x=R(-20,W+20);this.y=R(HOR*.7,H*.9);this.seed=R(0,1000);if(this.type==='pollen'){this.size=R(.5,2.2);this.speed=R(4,14);this.opacity=R(.12,.4);this.hue=pick([45,50,55,340,200]);this.sat=R(20,50);this.lit=R(75,95);}else if(this.type==='mote'){this.size=R(1,3);this.speed=R(2,8);this.opacity=R(.08,.3);this.hue=R(35,55);this.sat=R(30,60);this.lit=R(85,100);this.glow=true;this.ps=R(1.5,4);}else{this.size=R(2,4.5);this.speed=R(5,18);this.opacity=R(.2,.5);this.hue=45;this.sat=5;this.lit=95;this.fils=RI(5,9);}this.life=R(8,22);this.maxLife=this.life;this.angle=R(0,6.28);this.wAmp=R(10,35);}
  update(dt,time){const wx=noise.get(this.seed+time*.08,0)*this.wAmp,wy=noise.get(0,this.seed+time*.08)*this.wAmp*.4;this.x+=(Math.cos(this.angle)*this.speed+wx*.4)*dt;this.y+=(Math.sin(this.angle)*this.speed*.2-this.speed*.15+wy*.25)*dt;this.life-=dt;if(this.life<=0||this.x<-30||this.x>W+30||this.y<HOR*.6||this.y>H+30)this.reset();}
  draw(time){const fade=cl(this.life<2?this.life/2:this.life>this.maxLife-1?this.maxLife-this.life:1,0,1);let a=this.opacity*fade;if(this.glow){const pulse=.5+.5*Math.sin(time*this.ps+this.seed);a*=(.5+pulse*.5);ctx.beginPath();ctx.arc(this.x,this.y,this.size*5,0,6.28);ctx.fillStyle=hsl(this.hue,this.sat,this.lit,a*.12);ctx.fill();}if(this.type==='seed'){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(time*.3+this.seed);for(let i=0;i<this.fils;i++){const an=(i/this.fils)*6.28;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(an)*this.size*2,Math.sin(an)*this.size*2);ctx.strokeStyle=hsl(this.hue,this.sat,this.lit,a*.6);ctx.lineWidth=.3;ctx.stroke();}ctx.beginPath();ctx.arc(0,0,this.size*.3,0,6.28);ctx.fillStyle=hsl(this.hue,this.sat,this.lit,a);ctx.fill();ctx.restore();}else{ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,6.28);ctx.fillStyle=hsl(this.hue,this.sat,this.lit,a);ctx.fill();}}
}

// ══════════════════════════════════════════
// GRASS
// ══════════════════════════════════════════
class GrassBlade{
  constructor(x){this.x=x;this.y=groundY(x)+R(-3,8);this.h=R(12,50);this.curve=R(-10,10);this.w=R(1,2.8);this.hue=R(80,140);this.sat=R(20,45);this.lit=R(12,30);this.seed=R(0,1000);}
  draw(time){if(!this._wt||time-this._wt>.05){this._wt=time;this._wx=noise.get(this.seed+time*.2,0)*8;}const wx=this._wx+gustForce;ctx.strokeStyle=hsl(this.hue,this.sat,this.lit,.55);ctx.lineWidth=this.w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.quadraticCurveTo(this.x+this.curve+wx,this.y-this.h*.6,this.x+this.curve*1.5+wx*1.5,this.y-this.h);ctx.stroke();}
}

// ══════════════════════════════════════════
// WAVE EVENTS (ground only) — now with flower_wave
// ══════════════════════════════════════════
const WTYPES=['burst','sweep','rain','scatter','garden_row','spiral','meadow','flower_wave'];
class WaveEvent{
  constructor(type){this.type=type||pick(WTYPES);this.queue=[];this.done=false;this.time=0;this.init();}
  init(){
    const gMin=HOR+10,gMax=H*.95;
    switch(this.type){
      case 'burst':{const cx=R(W*.15,W*.85),cy=R(gMin+20,gMax-20),n=RI(5,14);const sp=Math.random()>.6?pick(SPECIES):null;for(let i=0;i<n;i++){const a=(i/n)*6.28+R(-.3,.3),d=R(15,100);this.queue.push({x:cx+Math.cos(a)*d,y:cy+Math.sin(a)*d*.4,delay:i*R(.15,.4),sp});}break;}
      case 'sweep':{const dir=Math.random()>.5?1:-1,n=RI(8,18),by=R(gMin+15,gMax-30);for(let i=0;i<n;i++){const t=i/n;this.queue.push({x:dir>0?t*W*.9+W*.05:(1-t)*W*.9+W*.05,y:by+noise.get(i*.5,0)*50+R(-15,15),delay:t*R(3,6)});}break;}
      case 'rain':{const n=RI(6,15);for(let i=0;i<n;i++)this.queue.push({x:R(W*.05,W*.95),y:R(gMin+20,gMax),delay:R(0,3)});break;}
      case 'scatter':{const n=RI(5,10);for(let i=0;i<n;i++)this.queue.push({x:R(W*.05,W*.95),y:R(gMin+10,gMax),delay:R(0,5)});break;}
      case 'garden_row':{const n=RI(6,12),sx=R(W*.05,W*.3),ex=R(W*.7,W*.95),by=R(gMin+20,gMax-30),ca=R(-35,35);const sp=Math.random()>.5?pick(SPECIES):null;for(let i=0;i<n;i++){const t=i/(n-1);this.queue.push({x:sx+t*(ex-sx)+R(-10,10),y:by+Math.sin(t*Math.PI)*ca+R(-8,8),delay:t*R(2,5),sp});}break;}
      case 'spiral':{const cx=R(W*.25,W*.75),cy=R(gMin+30,gMax-40),n=RI(8,16);const ga=137.508*Math.PI/180;for(let i=0;i<n;i++){const a=i*ga,r=15+i*R(7,13);this.queue.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r*.4,delay:i*R(.2,.5)});}break;}
      case 'meadow':{const cx=R(W*.15,W*.85),cy=R(gMin+30,gMax-30),n=RI(10,22);for(let i=0;i<n;i++){const a=R(0,6.28),d=(R(0,1)+R(0,1))/2*R(30,120);this.queue.push({x:cx+Math.cos(a)*d,y:cy+Math.sin(a)*d*.35,delay:R(0,4)});}break;}
      case 'flower_wave':{
        // Wall of flowers sweeping across the screen
        const dir=Math.random()>.5?1:-1;
        const n=RI(25,45);
        const sweepDuration=R(5,9);
        for(let i=0;i<n;i++){
          const t=i/n;
          const bandX=dir>0?t*W:W*(1-t);
          const y=R(gMin+10,gMax);
          // Stagger within the band
          this.queue.push({x:bandX+R(-20,20),y,delay:t*sweepDuration+R(0,.4),sp:null});
        }
        break;
      }
    }
  }
  update(dt,garden){
    this.time+=dt;
    const ready=this.queue.filter(s=>s.delay<=this.time);
    for(const s of ready){const x=cl(s.x,W*.03,W*.97),y=cl(s.y,HOR+5,H*.96);if(garden.pond&&garden.pond.contains(x,y))continue;const ds=.3+(y-HOR)/(H-HOR)*.9;garden.flowers.push(new Flower(x,y,ds*R(.65,1.3),s.sp));}
    this.queue=this.queue.filter(s=>s.delay>this.time);
    if(this.queue.length===0)this.done=true;
  }
}

// ══════════════════════════════════════════
// RARE: CHERRY BLOSSOM STORM (every 3-6 min)
// ══════════════════════════════════════════
class BlossomStorm{
  constructor(){this.active=false;this.timer=R(40,80);this.petals=[];}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(90,180);
      const dir=Math.random()>.5?1:-1;
      for(let i=0;i<120;i++){
        const delay=R(0,2);
        this.petals.push({
          x:dir>0?R(-50,-10):R(W+10,W+50),
          y:R(-20,H*.9),
          vx:dir*R(120,350),vy:R(-30,30),
          size:R(3,8),rot:R(0,6.28),rs:R(-4,4),
          hue:R(330,355),sat:R(40,70),lit:R(78,95),
          life:R(5,10),delay,wobble:R(2,5),wobSeed:R(0,1000),
          alpha:R(.5,.9),
        });
      }
    }return;}
    let alive=false;
    for(const p of this.petals){
      if(p.delay>0){p.delay-=dt;alive=true;continue;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      p.vy+=20*dt; // gravity
      p.vx*=.995; // wind drag
      p.vy+=Math.sin(time*p.wobble+p.wobSeed)*40*dt; // flutter
      p.vx+=noise.get(p.wobSeed+time*.2,p.y*.01)*50*dt;
      p.rot+=p.rs*dt;
      p.life-=dt;
      if(p.life>0)alive=true;
    }
    this.petals=this.petals.filter(p=>p.life>0||p.delay>0);
    if(!alive)this.active=false;
  }
  draw(){
    if(!this.active)return;
    for(const p of this.petals){
      if(p.delay>0)continue;
      const a=cl(p.life/1.5,0,1)*p.alpha;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      // Petal shape — slightly curved ellipse
      ctx.beginPath();
      ctx.moveTo(0,-p.size*.5);
      ctx.bezierCurveTo(p.size*.4,-p.size*.3,p.size*.4,p.size*.3,0,p.size*.5);
      ctx.bezierCurveTo(-p.size*.3,p.size*.2,-p.size*.3,-p.size*.2,0,-p.size*.5);
      ctx.fillStyle=hsl(p.hue,p.sat,p.lit,a);
      ctx.fill();
      ctx.restore();
    }
  }
}

// ══════════════════════════════════════════
// RARE: GRAND ROSE (every 8-15 min)
// ══════════════════════════════════════════
const GRAND_ROSE_SP={n:'grandrose',pc:[8,12],pt:'cupped',ps:[22,32],ly:[5,7],pl:'rose',cs:.12,sc:[0,0]};
class GrandRose{
  constructor(){this.timer=R(45,120);this.rose=null;}
  update(dt,time,garden){
    if(this.rose){this.rose.update(dt,time);if(this.rose.isDead)this.rose=null;return;}
    this.timer-=dt;if(this.timer<=0){this.timer=R(45,120);
      const x=R(W*.15,W*.85),y=R(HOR+60,H*.82);
      this.rose=new Flower(x,y,R(2.5,3.5),GRAND_ROSE_SP);
      this.rose.fullDur=R(35,60);this.rose.bloomDur=R(6,10);this.rose.stemDur=R(3,5);this.rose.wiltDur=R(5,9);
      // Override petal offsets for tighter, more detailed layering
      for(let l=0;l<this.rose.layers;l++){for(let i=0;i<this.rose.petalCount;i++){this.rose.pOff[l][i].a=R(-.05,.05);this.rose.pOff[l][i].s=R(.92,1.08);this.rose.pOff[l][i].d=R(0,.15+l*.06);}}
      // Richer color variation per layer — inner petals lighter
      for(let l=0;l<this.rose.layers;l++){for(let i=0;i<this.rose.petalCount;i++){this.rose.petalColors[l][i].l+=l*3;this.rose.petalColors[l][i].s-=l*2;}}
      // Rebuild cached petal paths with new offsets
      this.rose._petPaths=[];for(let l=0;l<this.rose.layers;l++){const lp=[];const ls=1-l*.1;for(let i=0;i<this.rose.petalCount;i++)lp.push(petalPath(l<2?'ruffled':'cupped',this.rose.petalSize*ls*this.rose.pOff[l][i].s));this.rose._petPaths.push(lp);}
      garden.flowers.push(this.rose);
    }
  }
}

// ══════════════════════════════════════════
// RARE: GIANT BLOOM (every 3-6 min)
// ══════════════════════════════════════════
class GiantBloom{
  constructor(){this.timer=R(90,180);this.giant=null;}
  update(dt,time,garden){
    if(this.giant){this.giant.update(dt,time);if(this.giant.isDead)this.giant=null;return;}
    this.timer-=dt;
    if(this.timer<=0){
      this.timer=R(90,180);
      const x=R(W*.2,W*.8),y=R(HOR+60,H*.85);
      this.giant=new Flower(x,y,R(2.8,4));
      this.giant.fullDur=R(25,45); // lives longer
      this.giant.bloomDur=R(5,9); // blooms slower
      this.giant.stemDur=R(3,5);
      garden.flowers.push(this.giant);
    }
  }
}

// ══════════════════════════════════════════
// VERY RARE: LANTERN FESTIVAL (every 8-15 min)
// ══════════════════════════════════════════
class LanternFestival{
  constructor(){this.active=false;this.timer=R(45,120);this.lanterns=[];}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(45,120);
      const count=RI(18,35);
      for(let i=0;i<count;i++){
        this.lanterns.push({
          x:R(W*.08,W*.92),y:R(HOR+40,H*.9),
          vx:0,vy:0,
          targetVy:R(-18,-35),
          size:R(8,14),
          hue:pick([15,25,35,40,5,350]),sat:R(70,95),lit:R(55,70),
          delay:R(0,5),life:R(20,40),
          wobSeed:R(0,1000),flickerSpeed:R(4,10),flickerPhase:R(0,6.28),
          swayAmp:R(8,20),
        });
      }
    }return;}
    let alive=false;
    for(const l of this.lanterns){
      if(l.delay>0){l.delay-=dt;alive=true;continue;}
      l.vy+=(l.targetVy-l.vy)*.02; // ease toward target speed
      l.x+=noise.fbm(l.wobSeed+time*.05,0,3)*l.swayAmp*dt;
      l.y+=l.vy*dt;
      l.life-=dt;
      if(l.life>0&&l.y>-50)alive=true;
    }
    this.lanterns=this.lanterns.filter(l=>(l.life>0&&l.y>-50)||l.delay>0);
    if(!alive)this.active=false;
  }
  draw(time){
    if(!this.active)return;
    for(const l of this.lanterns){
      if(l.delay>0)continue;
      const fadeIn=cl((l.delay<=0?1:0)*3,0,1);
      const fadeOut=cl(l.life/3,0,1);
      const a=Math.min(fadeIn,fadeOut);
      if(a<.02)continue;
      const s=l.size;
      const flicker=.7+.3*Math.sin(time*l.flickerSpeed+l.flickerPhase);
      ctx.save();ctx.translate(l.x,l.y);ctx.globalAlpha=a;
      // Warm glow halo
      const gg=ctx.createRadialGradient(0,0,s*.3,0,0,s*4);
      gg.addColorStop(0,hsl(l.hue,l.sat,l.lit,flicker*.2));
      gg.addColorStop(.5,hsl(l.hue,l.sat-10,l.lit-10,flicker*.06));
      gg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath();ctx.arc(0,0,s*4,0,6.28);ctx.fillStyle=gg;ctx.fill();
      // Lantern body — rounded rectangle shape
      ctx.beginPath();
      ctx.moveTo(-s*.45,-s*.7);
      ctx.bezierCurveTo(-s*.5,-s*.7,-s*.55,-s*.4,-s*.55,0);
      ctx.bezierCurveTo(-s*.55,s*.4,-s*.5,s*.65,-s*.35,s*.7);
      ctx.lineTo(s*.35,s*.7);
      ctx.bezierCurveTo(s*.5,s*.65,s*.55,s*.4,s*.55,0);
      ctx.bezierCurveTo(s*.55,-s*.4,s*.5,-s*.7,s*.45,-s*.7);
      ctx.closePath();
      const bg=ctx.createRadialGradient(0,0,0,0,0,s*.6);
      bg.addColorStop(0,hsl(l.hue,l.sat,l.lit+15,flicker*.95));
      bg.addColorStop(.6,hsl(l.hue,l.sat,l.lit,flicker*.8));
      bg.addColorStop(1,hsl(l.hue+5,l.sat-5,l.lit-15,.7));
      ctx.fillStyle=bg;ctx.fill();
      ctx.strokeStyle=hsl(l.hue+10,l.sat-20,l.lit-25,.3);ctx.lineWidth=.5;ctx.stroke();
      // Top cap
      ctx.beginPath();ctx.rect(-s*.2,-s*.78,s*.4,s*.1);
      ctx.fillStyle=hsl(l.hue,l.sat-30,l.lit-30,.6);ctx.fill();
      // Flame inside (small bright core)
      ctx.beginPath();ctx.ellipse(0,-s*.05,s*.12,s*.2,0,0,6.28);
      ctx.fillStyle=hsl(40,95,90,flicker*.6);ctx.fill();
      ctx.restore();
    }
  }
}

// ══════════════════════════════════════════
// VERY RARE: WILL-O-THE-WISP (every 8-15 min)
// ══════════════════════════════════════════
class WillOWisp{
  constructor(){this.active=false;this.timer=R(45,120);this.wisp=null;this.trail=[];}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(45,120);
      this.wisp={x:R(W*.1,W*.9),y:R(HOR+30,H*.75),life:R(12,22),maxLife:0,
        seed:R(0,1000),hue:pick([160,180,200,140,100,280]),sat:R(50,80),lit:R(65,85),
        size:R(5,9),speed:R(20,45),
        tx:R(W*.1,W*.9),ty:R(HOR+20,H*.7),retT:0};
      this.wisp.maxLife=this.wisp.life;this.trail=[];
    }return;}
    const w=this.wisp;
    w.retT-=dt;
    if(w.retT<=0){w.tx=R(W*.05,W*.95);w.ty=R(HOR+15,H*.75);w.retT=R(1.5,4);}
    const dx=w.tx-w.x,dy=w.ty-w.y,d=Math.sqrt(dx*dx+dy*dy);
    if(d>1){w.x+=(dx/d)*w.speed*dt;w.y+=(dy/d)*w.speed*dt;}
    w.x+=noise.get(w.seed+time*.3,0)*25*dt;
    w.y+=noise.get(0,w.seed+time*.3)*18*dt;
    w.life-=dt;
    // Emit trail sparkles
    if(Math.random()<dt*15){
      this.trail.push({x:w.x+R(-4,4),y:w.y+R(-4,4),life:R(.8,2),size:R(1,3),
        vx:R(-8,8),vy:R(-12,-3)});
    }
    for(const t of this.trail){t.x+=t.vx*dt;t.y+=t.vy*dt;t.life-=dt;}
    this.trail=this.trail.filter(t=>t.life>0);
    if(w.life<=0&&this.trail.length===0)this.active=false;
  }
  draw(time){
    if(!this.active)return;
    const w=this.wisp;
    // Trail sparkles
    for(const t of this.trail){
      const a=cl(t.life/.8,0,1)*.6;
      ctx.beginPath();ctx.arc(t.x,t.y,t.size*a,0,6.28);
      ctx.fillStyle=hsl(w.hue,w.sat-10,w.lit+10,a);ctx.fill();
    }
    if(w.life<=0)return;
    const fadeIn=cl((w.maxLife-w.life)/1.5,0,1);
    const fadeOut=cl(w.life/2,0,1);
    const a=Math.min(fadeIn,fadeOut);
    const pulse=.7+.3*Math.sin(time*3+w.seed);
    // Area illumination (additive)
    ctx.save();ctx.globalCompositeOperation='screen';
    const ig=ctx.createRadialGradient(w.x,w.y,0,w.x,w.y,w.size*12);
    ig.addColorStop(0,hsl(w.hue,w.sat-20,w.lit,a*pulse*.08));
    ig.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(w.x,w.y,w.size*12,0,6.28);ctx.fillStyle=ig;ctx.fill();
    ctx.restore();
    // Outer glow
    const og=ctx.createRadialGradient(w.x,w.y,0,w.x,w.y,w.size*3);
    og.addColorStop(0,hsl(w.hue,w.sat,w.lit,a*pulse*.35));
    og.addColorStop(.5,hsl(w.hue,w.sat,w.lit,a*pulse*.1));
    og.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(w.x,w.y,w.size*3,0,6.28);ctx.fillStyle=og;ctx.fill();
    // Core
    ctx.beginPath();ctx.arc(w.x,w.y,w.size*.6,0,6.28);
    ctx.fillStyle=hsl(w.hue,w.sat-10,95,a*pulse);ctx.fill();
  }
}

// ══════════════════════════════════════════
// VERY RARE: HOT AIR BALLOON (every 12-20 min)
// ══════════════════════════════════════════
class HotAirBalloon{
  constructor(){this.active=false;this.timer=R(40,90);this.balloon=null;}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(40,90);
      const fromLeft=Math.random()>.5;
      const colors=[];const nc=RI(4,6);
      for(let i=0;i<nc;i++)colors.push({h:R(0,360),s:R(50,90),l:R(45,70)});
      this.balloon={
        x:fromLeft?-40:W+40,y:R(HOR*.3,HOR*.7),
        vx:(fromLeft?1:-1)*R(10,22),vy:R(-3,-1),
        size:R(18,28),colors,
        sway:0,swaySpeed:R(.8,1.5),seed:R(0,1000),
      };
    }return;}
    const b=this.balloon;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    b.y+=Math.sin(time*.5+b.seed)*2*dt;
    b.sway=Math.sin(time*b.swaySpeed+b.seed)*.06;
    if(b.x<-60||b.x>W+60)this.active=false;
  }
  draw(time){
    if(!this.active)return;
    const b=this.balloon;const s=b.size;
    const fadeIn=cl((b.vx>0?b.x+40:W+40-b.x)/80,0,1);
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.sway);ctx.globalAlpha=fadeIn;
    // Envelope (balloon) — inverted teardrop
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0,-s*1.4);
    ctx.bezierCurveTo(-s*.2,-s*1.4,-s*.9,-s*1.2,-s*.95,-s*.5);
    ctx.bezierCurveTo(-s*1,-s*.1,-s*.7,s*.2,-s*.35,s*.35);
    ctx.lineTo(s*.35,s*.35);
    ctx.bezierCurveTo(s*.7,s*.2,s*1,-s*.1,s*.95,-s*.5);
    ctx.bezierCurveTo(s*.9,-s*1.2,s*.2,-s*1.4,0,-s*1.4);
    ctx.closePath();
    ctx.clip();
    // Draw colored stripes
    const stripeW=s*2/b.colors.length;
    for(let i=0;i<b.colors.length;i++){
      const c=b.colors[i];
      ctx.fillStyle=hsl(c.h,c.s,c.l);
      ctx.fillRect(-s+i*stripeW,-s*1.5,stripeW+1,s*2);
    }
    ctx.restore();
    // Envelope outline
    ctx.beginPath();
    ctx.moveTo(0,-s*1.4);
    ctx.bezierCurveTo(-s*.2,-s*1.4,-s*.9,-s*1.2,-s*.95,-s*.5);
    ctx.bezierCurveTo(-s*1,-s*.1,-s*.7,s*.2,-s*.35,s*.35);
    ctx.lineTo(s*.35,s*.35);
    ctx.bezierCurveTo(s*.7,s*.2,s*1,-s*.1,s*.95,-s*.5);
    ctx.bezierCurveTo(s*.9,-s*1.2,s*.2,-s*1.4,0,-s*1.4);
    ctx.strokeStyle='rgba(60,40,20,.3)';ctx.lineWidth=.6;ctx.stroke();
    // Ropes
    ctx.strokeStyle='rgba(80,60,30,.4)';ctx.lineWidth=.4;
    ctx.beginPath();ctx.moveTo(-s*.35,s*.35);ctx.lineTo(-s*.2,s*.7);ctx.stroke();
    ctx.beginPath();ctx.moveTo(s*.35,s*.35);ctx.lineTo(s*.2,s*.7);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-s*.1,s*.38);ctx.lineTo(-s*.08,s*.7);ctx.stroke();
    ctx.beginPath();ctx.moveTo(s*.1,s*.38);ctx.lineTo(s*.08,s*.7);ctx.stroke();
    // Basket
    ctx.beginPath();
    ctx.rect(-s*.22,s*.68,s*.44,s*.22);
    ctx.fillStyle='#8B6914';ctx.fill();
    ctx.strokeStyle='rgba(60,40,10,.5)';ctx.lineWidth=.5;ctx.stroke();
    // Basket weave lines
    ctx.strokeStyle='rgba(100,70,20,.3)';ctx.lineWidth=.3;
    ctx.beginPath();ctx.moveTo(-s*.22,s*.78);ctx.lineTo(s*.22,s*.78);ctx.stroke();
    // Flame glow at top of basket
    const flicker=.6+.4*Math.sin(time*6+b.seed);
    ctx.beginPath();ctx.arc(0,s*.6,s*.12,0,6.28);
    ctx.fillStyle=`rgba(255,180,50,${flicker*.4})`;ctx.fill();
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// ULTRA RARE: SKY WHALE (every 15-30 min)
// ══════════════════════════════════════════
class SkyWhale{
  constructor(){this.active=false;this.timer=R(360,720);this.whale=null;this.sparkles=[];}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(360,720);
      const fromLeft=Math.random()>.5;
      this.whale={
        x:fromLeft?-200:W+200,y:R(HOR*.12,HOR*.5),
        vx:(fromLeft?1:-1)*R(12,25),vy:0,
        size:R(70,120),seed:R(0,1000),
        hue:pick([200,220,240,180,260]),sat:R(20,45),lit:R(55,75),
      };
      this.sparkles=[];
    }return;}
    const w=this.whale;
    w.x+=w.vx*dt;
    w.y+=Math.sin(time*.3+w.seed)*5*dt; // gentle undulation
    w.vy=Math.sin(time*.3+w.seed)*5;
    // Sparkle trail
    if(Math.random()<dt*8){
      const tx=w.vx>0?w.x-w.size*.4:w.x+w.size*.4;
      this.sparkles.push({x:tx+R(-15,15),y:w.y+R(-10,10),life:R(1,3),size:R(.5,2)});
    }
    for(const s of this.sparkles){s.life-=dt;s.y-=3*dt;}
    this.sparkles=this.sparkles.filter(s=>s.life>0);
    if((w.vx>0&&w.x>W+250)||(w.vx<0&&w.x<-250))this.active=false;
  }
  draw(time){
    if(!this.active)return;
    const w=this.whale;const s=w.size;
    const fadeIn=cl(w.vx>0?(w.x+200)/200:(W+200-w.x)/200,0,1);
    const fadeOut=cl(w.vx>0?(W+250-w.x)/200:(w.x+250)/200,0,1);
    const a=Math.min(fadeIn,fadeOut)*.25; // very translucent
    // Sparkle trail
    for(const sp of this.sparkles){
      const sa=cl(sp.life/1,0,1)*.4;
      ctx.beginPath();ctx.arc(sp.x,sp.y,sp.size,0,6.28);
      ctx.fillStyle=hsl(w.hue,w.sat,w.lit+20,sa);ctx.fill();
    }
    ctx.save();ctx.translate(w.x,w.y);
    if(w.vx<0)ctx.scale(-1,1); // flip if going left
    ctx.globalAlpha=a;
    // Tail undulation
    const tailWave=Math.sin(time*1.5+w.seed)*.03;
    ctx.rotate(tailWave);
    // Whale body — humpback silhouette
    ctx.beginPath();
    // Start at tail
    ctx.moveTo(-s*.55,0);
    // Upper body: tail → dorsal → head
    ctx.bezierCurveTo(-s*.4,-s*.12,-s*.2,-s*.17,-s*.05,-s*.15);
    ctx.bezierCurveTo(s*.1,-s*.14,s*.25,-s*.12,s*.35,-s*.08);
    ctx.quadraticCurveTo(s*.48,-s*.04,s*.5,0);
    // Head front
    ctx.quadraticCurveTo(s*.48,s*.04,s*.42,s*.06);
    // Lower body: chin → belly → tail
    ctx.bezierCurveTo(s*.3,s*.1,s*.1,s*.14,-s*.05,s*.12);
    ctx.bezierCurveTo(-s*.2,s*.1,-s*.4,s*.06,-s*.55,0);
    ctx.closePath();
    // Body gradient
    const bg=ctx.createLinearGradient(0,-s*.17,0,s*.14);
    bg.addColorStop(0,hsl(w.hue,w.sat,w.lit+10));
    bg.addColorStop(.5,hsl(w.hue,w.sat,w.lit));
    bg.addColorStop(1,hsl(w.hue,w.sat-5,w.lit+15));
    ctx.fillStyle=bg;ctx.fill();
    // Inner glow
    const ig=ctx.createRadialGradient(s*.1,0,0,0,0,s*.35);
    ig.addColorStop(0,`rgba(200,220,255,.15)`);ig.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ig;ctx.fill();
    // Tail flukes
    ctx.beginPath();
    ctx.moveTo(-s*.55,0);
    ctx.bezierCurveTo(-s*.6,-s*.02,-s*.7,-s*.1,-s*.72,-s*.08);
    ctx.bezierCurveTo(-s*.68,-s*.04,-s*.6,0,-s*.55,0);
    ctx.fillStyle=hsl(w.hue,w.sat,w.lit);ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s*.55,0);
    ctx.bezierCurveTo(-s*.6,s*.02,-s*.7,s*.1,-s*.72,s*.08);
    ctx.bezierCurveTo(-s*.68,s*.04,-s*.6,0,-s*.55,0);
    ctx.fill();
    // Pectoral fin
    ctx.beginPath();
    ctx.moveTo(s*.1,s*.1);
    ctx.bezierCurveTo(s*.05,s*.18,s*.15,s*.22,s*.2,s*.14);
    ctx.bezierCurveTo(s*.18,s*.1,s*.14,s*.1,s*.1,s*.1);
    ctx.fillStyle=hsl(w.hue,w.sat-5,w.lit+5);ctx.fill();
    // Eye
    ctx.beginPath();ctx.arc(s*.38,-s*.02,s*.015,0,6.28);
    ctx.fillStyle=`rgba(255,255,255,.5)`;ctx.fill();
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// ULTRA RARE: THE GREAT BLOOM (every 15-25 min)
// ══════════════════════════════════════════
class GreatBloom{
  constructor(){this.timer=R(360,720);this.phase='idle';this.phaseTime=0;}
  update(dt,time,garden){
    if(this.phase==='idle'){this.timer-=dt;if(this.timer<=0){this.phase='wilt';this.phaseTime=0;this.timer=R(360,720);}return;}
    this.phaseTime+=dt;
    if(this.phase==='wilt'){
      // Accelerate all flowers to wilt
      for(const f of garden.flowers){
        if(f.phase<PH.WILT){f.phase=PH.WILT;f.pt=0;f.wiltDur=R(1.5,3);}
      }
      if(this.phaseTime>3.5){this.phase='pause';this.phaseTime=0;}
    }
    if(this.phase==='pause'){
      if(this.phaseTime>1.5){this.phase='bloom';this.phaseTime=0;}
    }
    if(this.phase==='bloom'){
      // Massive spawn wave
      if(this.phaseTime<.1){
        for(let i=0;i<30;i++){
          let x,y;do{x=R(W*.03,W*.97);y=R(HOR+8,H*.95);}while(garden.pond&&garden.pond.contains(x,y));
          const ds=.3+(y-HOR)/(H-HOR)*.9;
          const f=new Flower(x,y,ds*R(.6,1.35));
          f.bloomDur=R(1.5,3); // fast bloom
          garden.flowers.push(f);
        }
      }
      if(this.phaseTime>5){this.phase='idle';this.phaseTime=0;}
    }
  }
}

// ══════════════════════════════════════════
// ULTRA RARE: ECLIPSE (every 20-40 min)
// ══════════════════════════════════════════
class Eclipse{
  constructor(){this.active=false;this.timer=R(45,120);this.time=0;this.duration=0;this.darkX=0;this.darkY=0;}
  update(dt){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(45,120);
      this.time=0;this.duration=R(12,20);
      this.darkX=R(W*.3,W*.7);this.darkY=R(HOR*.15,HOR*.4);
    }return;}
    this.time+=dt;if(this.time>=this.duration){this.active=false;}
  }
  draw(){
    if(!this.active)return;
    const t=this.time/this.duration;
    let darkness;
    if(t<.2)darkness=ease.out(t/.2);
    else if(t>.75)darkness=1-ease.in((t-.75)/.25);
    else darkness=1;
    darkness*=.35;
    // Darken entire scene
    ctx.save();
    ctx.fillStyle=`rgba(5,3,15,${darkness})`;
    ctx.fillRect(0,0,W,H);
    // Corona ring around the dark disc
    const coronaA=darkness*.6;
    const cg=ctx.createRadialGradient(this.darkX,this.darkY,15,this.darkX,this.darkY,60);
    cg.addColorStop(0,'rgba(0,0,0,0)');
    cg.addColorStop(.3,`rgba(255,200,100,${coronaA*.3})`);
    cg.addColorStop(.6,`rgba(255,160,80,${coronaA*.15})`);
    cg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(this.darkX,this.darkY,60,0,6.28);
    ctx.fillStyle=cg;ctx.fill();
    // Dark disc
    ctx.beginPath();ctx.arc(this.darkX,this.darkY,18,0,6.28);
    ctx.fillStyle=`rgba(3,1,8,${darkness*2.5})`;ctx.fill();
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// LEGENDARY: UFO (every 20-45 min)
// ══════════════════════════════════════════
class UFO{
  constructor(){this.active=false;this.timer=R(45,120);this.ufo=null;}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(45,120);
      const fromLeft=Math.random()>.5;
      this.ufo={
        x:fromLeft?-30:W+30,y:R(HOR*.08,HOR*.4),
        vx:(fromLeft?1:-1)*R(60,140),vy:0,
        size:R(8,14),seed:R(0,1000),
        lightPhase:R(0,6.28),wobble:R(1,3),
      };
    }return;}
    const u=this.ufo;
    u.x+=u.vx*dt;
    u.y+=Math.sin(time*u.wobble+u.seed)*8*dt;
    if(u.x<-50||u.x>W+50)this.active=false;
  }
  draw(time){
    if(!this.active)return;
    const u=this.ufo;const s=u.size;
    const a=.4; // subtle
    ctx.save();ctx.translate(u.x,u.y);ctx.globalAlpha=a;
    // Glow underneath
    const ug=ctx.createRadialGradient(0,s*.1,0,0,s*.3,s*2);
    ug.addColorStop(0,'rgba(150,200,255,.15)');ug.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(0,s*.3,s*2,0,6.28);ctx.fillStyle=ug;ctx.fill();
    // Disc body
    ctx.beginPath();ctx.ellipse(0,0,s,s*.28,0,0,6.28);
    const dg=ctx.createLinearGradient(0,-s*.28,0,s*.28);
    dg.addColorStop(0,'#aab8cc');dg.addColorStop(.5,'#8899aa');dg.addColorStop(1,'#667788');
    ctx.fillStyle=dg;ctx.fill();
    // Dome
    ctx.beginPath();ctx.ellipse(0,-s*.2,s*.4,s*.3,0,Math.PI,0);
    ctx.fillStyle='rgba(180,210,240,.6)';ctx.fill();
    // Rim lights
    const lightCount=5;
    for(let i=0;i<lightCount;i++){
      const la=(i/lightCount)*6.28+time*2;
      const lx=Math.cos(la)*s*.8;
      const ly=Math.sin(la)*s*.12;
      const on=Math.sin(time*4+i*1.5+u.lightPhase)>.2;
      if(on){
        ctx.beginPath();ctx.arc(lx,ly,s*.08,0,6.28);
        ctx.fillStyle=pick(['rgba(255,100,100,.8)','rgba(100,255,100,.8)','rgba(100,100,255,.8)','rgba(255,255,100,.8)']);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// LEGENDARY: SNOWFALL (every 30-60 min)
// ══════════════════════════════════════════
class Snowfall{
  constructor(){this.active=false;this.timer=R(600,1080);this.flakes=[];this.time=0;this.duration=0;}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(600,1080);
      this.time=0;this.duration=R(18,30);this.flakes=[];
      for(let i=0;i<140;i++){
        this.flakes.push({
          x:R(-20,W+20),y:R(-H*.5,H),
          size:R(.8,3.5),speed:R(15,40),
          drift:R(-10,10),wobSpeed:R(1,3),wobAmp:R(10,30),
          wobSeed:R(0,1000),alpha:R(.3,.8),
        });
      }
    }return;}
    this.time+=dt;
    const t=this.time/this.duration;
    const intensity=t<.15?ease.out(t/.15):t>.8?1-ease.in((t-.8)/.2):1;
    for(const f of this.flakes){
      f.y+=f.speed*intensity*dt;
      f.x+=f.drift*dt+Math.sin(time*f.wobSpeed+f.wobSeed)*f.wobAmp*dt;
      if(f.y>H+10){f.y=-10;f.x=R(-20,W+20);}
      if(f.x<-30)f.x=W+20;if(f.x>W+30)f.x=-20;
    }
    if(this.time>=this.duration){this.active=false;this.flakes=[];}
  }
  draw(){
    if(!this.active||this.flakes.length===0)return;
    const t=this.time/this.duration;
    const intensity=t<.15?ease.out(t/.15):t>.8?1-ease.in((t-.8)/.2):1;
    // Slight cool tint overlay
    ctx.save();
    ctx.fillStyle=`rgba(150,170,220,${intensity*.06})`;
    ctx.fillRect(0,0,W,H);
    ctx.restore();
    // Snowflakes
    for(const f of this.flakes){
      const a=f.alpha*intensity;
      if(a<.02)continue;
      // Soft glow
      if(f.size>2){
        ctx.beginPath();ctx.arc(f.x,f.y,f.size*2.5,0,6.28);
        ctx.fillStyle=`rgba(220,230,255,${a*.08})`;ctx.fill();
      }
      ctx.beginPath();ctx.arc(f.x,f.y,f.size,0,6.28);
      ctx.fillStyle=`rgba(240,245,255,${a})`;ctx.fill();
    }
  }
}

// ══════════════════════════════════════════
// SKY: CONSTELLATIONS
// ══════════════════════════════════════════
class Constellations{
  constructor(){
    // Real constellation patterns (normalized coords, scaled to sky)
    const defs=[
      {name:'Orion',stars:[[0,0],[.02,-.08],[.04,-.15],[.01,-.22],[-.02,-.28],[.06,-.22],[.09,-.27],[.04,-.04],[-.03,-.04]],
        lines:[[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[0,7],[0,8],[7,8]],bright:[2,3,0]},
      {name:'Big Dipper',stars:[[0,0],[.05,-.02],[.1,-.01],[.14,-.04],[.18,-.02],[.22,-.05],[.25,-.03]],
        lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,6]],bright:[0,6]},
      {name:'Cassiopeia',stars:[[0,0],[.04,-.06],[.09,-.02],[.14,-.07],[.19,-.03]],
        lines:[[0,1],[1,2],[2,3],[3,4]],bright:[2]},
      {name:'Cygnus',stars:[[0,-.12],[.03,-.06],[.06,0],[.09,-.06],[.12,-.12],[-.02,-.06],[.08,-.06]],
        lines:[[0,1],[1,2],[2,3],[3,4],[5,1],[1,6]],bright:[1]},
      {name:'Leo',stars:[[0,0],[.04,-.03],[.07,-.06],[.1,-.04],[.08,-.01],[.04,.01],[.12,0],[.15,-.02]],
        lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,6],[6,7]],bright:[0,2]},
      {name:'Scorpius',stars:[[0,0],[.03,-.02],[.06,-.01],[.09,-.03],[.11,-.06],[.13,-.09],[.11,-.11],[.09,-.1]],
        lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],bright:[0,5]},
      {name:'Lyra',stars:[[0,-.06],[.02,0],[.05,0],[.05,-.04],[.02,-.04]],
        lines:[[0,1],[0,4],[1,2],[2,3],[3,4],[1,4]],bright:[0]},
      {name:'Gemini',stars:[[0,0],[.02,-.05],[.04,-.09],[.06,-.05],[.08,-.01],[.03,-.12],[.07,-.11]],
        lines:[[0,1],[1,2],[2,5],[3,4],[3,6],[1,3]],bright:[5,6]},
    ];
    // Pick 4-5 and place them across the sky
    const chosen=[];const used=new Set();
    for(let i=0;i<Math.min(RI(4,5),defs.length);i++){let idx;do{idx=RI(0,defs.length-1);}while(used.has(idx));used.add(idx);chosen.push(defs[idx]);}
    this.groups=[];const scale=R(.6,.9);
    for(let i=0;i<chosen.length;i++){
      const d=chosen[i],ox=R(.08,.85),oy=R(.08,.65);
      const st=d.stars.map(s=>({x:ox+s[0]*scale,y:oy+s[1]*scale,bright:false}));
      for(const b of(d.bright||[]))if(st[b])st[b].bright=true;
      this.groups.push({st,ln:d.lines,a:R(.08,.18),name:d.name,labelA:0,labelX:ox+.05,labelY:oy-.02,seed:R(0,1000)});
    }
  }
  draw(time){
    for(const g of this.groups){
      const a=g.a*(.55+.45*Math.sin(time*.06+g.seed));
      // Connecting lines — faint dashed feel
      ctx.strokeStyle=`rgba(150,180,240,${a*.7})`;ctx.lineWidth=.4;ctx.beginPath();
      for(const[i,j] of g.ln){ctx.moveTo(g.st[i].x*W,g.st[i].y*HOR);ctx.lineTo(g.st[j].x*W,g.st[j].y*HOR);}ctx.stroke();
      // Stars — brighter for key stars
      for(const s of g.st){const sz=s.bright?1.8:1;const sa=s.bright?a*2.5:a*1.6;
        if(s.bright){ctx.beginPath();ctx.arc(s.x*W,s.y*HOR,4,0,6.28);ctx.fillStyle=`rgba(200,220,255,${a*.06})`;ctx.fill();}
        ctx.beginPath();ctx.arc(s.x*W,s.y*HOR,sz,0,6.28);ctx.fillStyle=`rgba(220,230,255,${sa})`;ctx.fill();}
      // Constellation name — very faint, fades in and out
      const la=a*.35*(.5+.5*Math.sin(time*.04+g.seed+1));
      if(la>.02){ctx.font='7px sans-serif';ctx.fillStyle=`rgba(160,180,220,${la})`;ctx.fillText(g.name,g.labelX*W,g.labelY*HOR);}
    }
  }
}

// ══════════════════════════════════════════
// SKY: MILKY WAY
// ══════════════════════════════════════════
class MilkyWay{
  constructor(){this.angle=R(.3,.6);this.off=R(-.15,.15);this.stars=[];for(let i=0;i<150;i++){const t=R(0,1),ac=R(-.12,.12);this.stars.push({t,ac,size:R(.2,1),a:R(.04,.18)});}}
  draw(){for(const s of this.stars){const x=(s.t+s.ac*Math.sin(this.angle))*W;const y=(s.t*this.angle+s.ac*Math.cos(this.angle)+this.off+.15)*HOR;if(y<0||y>HOR||x<0||x>W)continue;ctx.beginPath();ctx.arc(x,y,s.size,0,6.28);ctx.fillStyle=`rgba(200,210,240,${s.a})`;ctx.fill();}}
}

// ══════════════════════════════════════════
// SKY: SATELLITE
// ══════════════════════════════════════════
class Satellite{
  constructor(){this.active=false;this.timer=R(60,180);}
  update(dt){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(60,180);const fl=Math.random()>.5;this.x=fl?-10:W+10;this.y=R(HOR*.05,HOR*.5);this.vx=(fl?1:-1)*R(50,90);this.vy=R(-3,3);}return;}this.x+=this.vx*dt;this.y+=this.vy*dt;if(this.x<-20||this.x>W+20)this.active=false;}
  draw(){if(!this.active)return;ctx.beginPath();ctx.arc(this.x,this.y,1,0,6.28);ctx.fillStyle='rgba(255,255,255,.65)';ctx.fill();}
}

// ══════════════════════════════════════════
// SKY: PLANET TRANSIT
// ══════════════════════════════════════════
class PlanetTransit{
  constructor(){this.active=false;this.timer=R(40,90);}
  update(dt){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(40,90);this.x=-15;this.y=R(HOR*.08,HOR*.45);this.speed=R(3,8);this.size=R(3,5.5);this.hue=pick([30,45,200,350,15]);this.ring=Math.random()>.6;}return;}this.x+=this.speed*dt;if(this.x>W+20)this.active=false;}
  draw(){if(!this.active)return;ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,6.28);ctx.fillStyle=hsl(this.hue,40,65,.75);ctx.fill();if(this.ring){ctx.beginPath();ctx.ellipse(this.x,this.y,this.size*2.2,this.size*.35,.3,0,6.28);ctx.strokeStyle=hsl(this.hue,30,72,.35);ctx.lineWidth=.8;ctx.stroke();}}
}

// ══════════════════════════════════════════
// SKY: BINARY STARS
// ══════════════════════════════════════════
class BinaryStars{
  constructor(){this.pairs=[];for(let i=0;i<3;i++)this.pairs.push({cx:R(.1,.9),cy:R(.05,.55),d:R(3,6),sp:R(.5,1.5),ph:R(0,6.28),sz:R(.8,1.4),hue:pick([220,200,45,350]),a:R(.3,.55)});}
  draw(time){for(const p of this.pairs){const a1=time*p.sp+p.ph,tw=.5+.5*Math.sin(time*2.5+p.ph);ctx.fillStyle=hsl(p.hue,30,85,p.a*tw);ctx.beginPath();ctx.arc(p.cx*W+Math.cos(a1)*p.d,p.cy*HOR+Math.sin(a1)*p.d*.4,p.sz,0,6.28);ctx.arc(p.cx*W+Math.cos(a1+Math.PI)*p.d,p.cy*HOR+Math.sin(a1+Math.PI)*p.d*.4,p.sz,0,6.28);ctx.fill();}}
}

// ══════════════════════════════════════════
// SKY: WISHING STAR
// ══════════════════════════════════════════
class WishingStar{
  constructor(){this.active=false;this.timer=R(40,80);this.time=0;this.phase='fly';this.trail=[];}
  update(dt){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(90,180);this.time=0;this.phase='fly';this.x=R(W*.1,W*.8);this.y=R(HOR*.05,HOR*.35);this.vx=R(100,250);this.vy=R(30,80);this.trail=[];this.pauseAt=R(.5,1);this.pauseDur=R(1.5,2.5);}return;}
    this.time+=dt;if(this.phase==='fly'){this.trail.push({x:this.x,y:this.y,a:1});this.x+=this.vx*dt;this.y+=this.vy*dt;this.vx*=.97;this.vy*=.97;if(this.time>this.pauseAt){this.phase='pause';this.time=0;}}else if(this.phase==='pause'){if(this.time>this.pauseDur){this.phase='fade';this.time=0;}}else{if(this.time>1.5)this.active=false;}for(const t of this.trail)t.a-=dt*2;this.trail=this.trail.filter(t=>t.a>0);}
  draw(){if(!this.active)return;for(let i=1;i<this.trail.length;i++){const t=this.trail[i],p=this.trail[i-1];ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(t.x,t.y);ctx.strokeStyle=`rgba(255,255,255,${cl(t.a,0,1)*.4})`;ctx.lineWidth=1.5*t.a;ctx.stroke();}let a;if(this.phase==='fly')a=1;else if(this.phase==='pause')a=.8+.2*Math.sin(this.time*8);else a=1-this.time/1.5;if(a<.01)return;const glow=this.phase==='pause'?2:1;ctx.beginPath();ctx.arc(this.x,this.y,3*glow,0,6.28);ctx.fillStyle=`rgba(255,250,200,${a*.15*glow})`;ctx.fill();ctx.beginPath();ctx.arc(this.x,this.y,1.5,0,6.28);ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fill();}
}

// ══════════════════════════════════════════
// SKY: NORTH STAR PULSE
// ══════════════════════════════════════════
class NorthStarPulse{
  constructor(){this.timer=R(90,180);this.pulsing=false;this.time=0;this.x=R(W*.3,W*.7);this.y=R(HOR*.05,HOR*.2);}
  update(dt){if(!this.pulsing){this.timer-=dt;if(this.timer<=0){this.pulsing=true;this.time=0;this.timer=R(90,180);}return;}this.time+=dt;if(this.time>5)this.pulsing=false;}
  draw(){if(!this.pulsing)return;const a=Math.sin(this.time/5*Math.PI)*.6;ctx.beginPath();ctx.arc(this.x,this.y,6+a*4,0,6.28);ctx.fillStyle=`rgba(220,230,255,${a*.08})`;ctx.fill();ctx.beginPath();ctx.arc(this.x,this.y,2+a*2,0,6.28);ctx.fillStyle=`rgba(255,255,255,${.4+a*.5})`;ctx.fill();}
}

// ══════════════════════════════════════════
// CREATURES: OWL
// ══════════════════════════════════════════
class Owl{
  constructor(){this.active=false;this.timer=R(30,60);this.blinkTimer=R(3,8);this.isBlinking=false;this.blinkDur=0;this.perchTime=0;this.flying=false;this.fx=0;this.fy=0;this.fvx=0;}
  update(dt){
    if(this.flying){this.fx+=this.fvx*dt;this.fy+=Math.sin(this.fx*.02)*2*dt;if(this.fx<-50||this.fx>W+50){this.flying=false;this.active=false;this.timer=R(30,60);}return;}
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.x=R(W*.1,W*.9);this.y=R(HOR+10,HOR+60);this.perchTime=R(15,40);}return;}
    this.perchTime-=dt;this.blinkTimer-=dt;if(this.isBlinking){this.blinkDur-=dt;if(this.blinkDur<=0)this.isBlinking=false;}else if(this.blinkTimer<=0){this.isBlinking=true;this.blinkDur=R(.12,.2);this.blinkTimer=R(2,6);}
    if(this.perchTime<=0){this.flying=true;this.fx=this.x;this.fy=this.y;this.fvx=(Math.random()>.5?1:-1)*R(60,120);}
  }
  draw(){
    if(this.flying){const s=6;ctx.save();ctx.translate(this.fx,this.fy);if(this.fvx<0)ctx.scale(-1,1);ctx.fillStyle='rgba(30,25,20,.8)';ctx.beginPath();ctx.ellipse(0,0,s*.5,s*.7,0,0,6.28);ctx.fill();const wing=Math.sin(this.fx*.08)*s;ctx.beginPath();ctx.moveTo(0,-s*.2);ctx.quadraticCurveTo(s*1.2,-s*.5-wing,s*1.5,0);ctx.quadraticCurveTo(s*.8,s*.2,0,s*.1);ctx.fill();ctx.restore();return;}
    if(!this.active)return;const s=5;ctx.save();ctx.translate(this.x,this.y);
    ctx.fillStyle='rgba(50,40,30,.85)';ctx.beginPath();ctx.ellipse(0,0,s*.6,s*.9,0,0,6.28);ctx.fill();
    ctx.beginPath();ctx.moveTo(-s*.3,-s*.7);ctx.lineTo(-s*.5,-s*1.3);ctx.lineTo(-s*.1,-s*.8);ctx.fill();ctx.beginPath();ctx.moveTo(s*.3,-s*.7);ctx.lineTo(s*.5,-s*1.3);ctx.lineTo(s*.1,-s*.8);ctx.fill();
    if(this.isBlinking){ctx.strokeStyle='rgba(200,180,80,.8)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-s*.25,-s*.2);ctx.lineTo(-s*.05,-s*.2);ctx.moveTo(s*.05,-s*.2);ctx.lineTo(s*.25,-s*.2);ctx.stroke();}
    else{ctx.fillStyle='rgba(220,200,50,.9)';ctx.beginPath();ctx.arc(-s*.15,-s*.2,s*.12,0,6.28);ctx.arc(s*.15,-s*.2,s*.12,0,6.28);ctx.fill();ctx.fillStyle='rgba(10,10,10,.9)';ctx.beginPath();ctx.arc(-s*.15,-s*.2,s*.06,0,6.28);ctx.arc(s*.15,-s*.2,s*.06,0,6.28);ctx.fill();}
    ctx.fillStyle='rgba(180,160,80,.7)';ctx.beginPath();ctx.moveTo(-s*.06,-.05*s);ctx.lineTo(0,s*.15);ctx.lineTo(s*.06,-.05*s);ctx.fill();
    ctx.strokeStyle='rgba(80,60,30,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-s*1.5,s*.9);ctx.lineTo(s*1.5,s*.9);ctx.stroke();ctx.restore();}
}

// ══════════════════════════════════════════
// CREATURES: FROG
// ══════════════════════════════════════════
class FrogSystem{
  constructor(){this.frogs=[];this.timer=R(20,40);}
  update(dt){this.timer-=dt;if(this.timer<=0){this.timer=R(25,50);if(this.frogs.length<3)this.frogs.push({x:R(W*.05,W*.95),y:R(HOR+40,H*.9),ht:R(2,6),hop:false,hy:0,hvy:0,life:R(20,45),ct:R(5,12),croak:false,cTime:0});}
    for(const f of this.frogs){f.life-=dt;f.ht-=dt;f.ct-=dt;if(f.hop){f.hvy+=120*dt;f.hy+=f.hvy*dt;if(f.hy>=0){f.hy=0;f.hop=false;f.ht=R(2,8);f.x+=R(-20,20);}}else if(f.ht<=0){f.hop=true;f.hvy=R(-80,-50);}if(f.croak){f.cTime+=dt;if(f.cTime>.8)f.croak=false;}else if(f.ct<=0){f.croak=true;f.cTime=0;f.ct=R(5,15);}}this.frogs=this.frogs.filter(f=>f.life>0);}
  draw(){for(const f of this.frogs){const y=f.y+f.hy;ctx.save();ctx.translate(f.x,y);ctx.fillStyle='rgba(40,80,30,.7)';ctx.beginPath();ctx.ellipse(0,0,5,3.5,0,0,6.28);ctx.fill();ctx.beginPath();ctx.arc(-2.5,-2.5,1.5,0,6.28);ctx.arc(2.5,-2.5,1.5,0,6.28);ctx.fillStyle='rgba(50,90,35,.8)';ctx.fill();ctx.fillStyle='rgba(20,20,10,.8)';ctx.beginPath();ctx.arc(-2.5,-2.5,.7,0,6.28);ctx.arc(2.5,-2.5,.7,0,6.28);ctx.fill();if(f.croak){const r=f.cTime*40;ctx.strokeStyle=`rgba(150,200,150,${.3*(1-f.cTime/.8)})`;ctx.lineWidth=.5;ctx.beginPath();ctx.arc(0,0,r,0,6.28);ctx.stroke();}ctx.restore();}}
}

// ══════════════════════════════════════════
// CREATURES: SNAIL
// ══════════════════════════════════════════
class SnailSystem{
  constructor(){this.snails=[];this.timer=R(30,60);}
  update(dt){this.timer-=dt;if(this.timer<=0){this.timer=R(35,70);if(this.snails.length<2)this.snails.push({x:R(W*.05,W*.95),y:R(HOR+30,H*.88),dir:Math.random()>.5?1:-1,trail:[],life:R(25,50)});}
    for(const s of this.snails){s.x+=s.dir*3*dt;s.life-=dt;if(Math.random()<dt*.5)s.trail.push({x:s.x,y:s.y,a:1});for(const t of s.trail)t.a-=dt*.15;s.trail=s.trail.filter(t=>t.a>0);}this.snails=this.snails.filter(s=>s.life>0&&s.x>-20&&s.x<W+20);}
  draw(){for(const s of this.snails){for(const t of s.trail){ctx.beginPath();ctx.arc(t.x,t.y,1,0,6.28);ctx.fillStyle=`rgba(180,200,160,${t.a*.15})`;ctx.fill();}ctx.save();ctx.translate(s.x,s.y);if(s.dir<0)ctx.scale(-1,1);ctx.fillStyle='rgba(140,120,80,.7)';ctx.beginPath();ctx.ellipse(2,0,4,2,0,0,6.28);ctx.fill();ctx.fillStyle='rgba(120,90,50,.8)';ctx.beginPath();ctx.arc(-1,-1,3,0,6.28);ctx.fill();ctx.strokeStyle='rgba(140,120,80,.6)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(4,-1);ctx.lineTo(6,-4);ctx.moveTo(3.5,-1);ctx.lineTo(5,-3.5);ctx.stroke();ctx.fillStyle='rgba(20,20,20,.6)';ctx.beginPath();ctx.arc(6,-4,.5,0,6.28);ctx.arc(5,-3.5,.5,0,6.28);ctx.fill();ctx.restore();}}
}

// ══════════════════════════════════════════
// CREATURES: LADYBUG
// ══════════════════════════════════════════
class LadybugSystem{
  constructor(){this.bugs=[];this.timer=R(15,30);}
  update(dt,time){this.timer-=dt;if(this.timer<=0){this.timer=R(20,40);if(this.bugs.length<3)this.bugs.push({x:R(W*.1,W*.9),y:R(HOR+20,H*.85),vx:R(-8,8),vy:R(-5,5),life:R(10,25),seed:R(0,1000)});}
    for(const b of this.bugs){b.x+=b.vx*dt+noise.get(b.seed+time*.2,0)*5*dt;b.y+=b.vy*dt;b.life-=dt;b.vx*=.99;b.vy*=.99;if(Math.random()<dt*.3){b.vx=R(-8,8);b.vy=R(-5,5);}}this.bugs=this.bugs.filter(b=>b.life>0);}
  draw(){for(const b of this.bugs){ctx.save();ctx.translate(b.x,b.y);const s=2.5;ctx.fillStyle='rgba(200,30,20,.85)';ctx.beginPath();ctx.arc(0,0,s,0,6.28);ctx.fill();ctx.fillStyle='rgba(15,15,10,.8)';ctx.beginPath();ctx.arc(-s*.3,s*.1,s*.25,0,6.28);ctx.arc(s*.3,s*.1,s*.25,0,6.28);ctx.arc(0,-s*.3,s*.25,0,6.28);ctx.fill();ctx.fillStyle='rgba(15,15,10,.9)';ctx.beginPath();ctx.ellipse(0,-s*.7,s*.4,s*.3,0,0,6.28);ctx.fill();ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(0,s);ctx.strokeStyle='rgba(15,15,10,.5)';ctx.lineWidth=.3;ctx.stroke();ctx.restore();}}
}

// ══════════════════════════════════════════
// CREATURES: CAT SILHOUETTE
// ══════════════════════════════════════════
class CatSilhouette{
  constructor(){this.active=false;this.timer=R(45,90);this.walking=false;this.walkDir=0;this.walkTime=0;this.sitTime=0;}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.x=R(W*.1,W*.9);this.y=R(HOR+25,H*.85);this.sitTime=R(15,35);this.walking=false;}return;}
    this.tailPhase=time;this.sitTime-=dt;if(this.walking){this.x+=this.walkDir*15*dt;this.walkTime-=dt;if(this.walkTime<=0||this.x<-30||this.x>W+30){this.active=false;this.timer=R(25,50);}}else if(this.sitTime<=0){this.walking=true;this.walkDir=Math.random()>.5?1:-1;this.walkTime=R(5,12);}
  }
  draw(){if(!this.active)return;const s=8;ctx.save();ctx.translate(this.x,this.y);
    if(this.walking){if(this.walkDir<0)ctx.scale(-1,1);ctx.fillStyle='rgba(20,18,25,.75)';ctx.beginPath();ctx.ellipse(0,0,s*.8,s*.4,0,0,6.28);ctx.fill();ctx.beginPath();ctx.arc(-s*.5,-s*.5,s*.3,0,6.28);ctx.fill();ctx.beginPath();ctx.moveTo(-s*.6,-s*.7);ctx.lineTo(-s*.7,-s*1.1);ctx.lineTo(-s*.45,-s*.75);ctx.fill();ctx.beginPath();ctx.moveTo(-s*.35,-s*.7);ctx.lineTo(-s*.3,-s*1);ctx.lineTo(-s*.2,-s*.7);ctx.fill();const tw=Math.sin(this.tailPhase*3)*.4;ctx.beginPath();ctx.moveTo(s*.7,-.1*s);ctx.quadraticCurveTo(s*1.2,-s*.3+tw*s,s*1.4,-s*.6+tw*s);ctx.strokeStyle='rgba(20,18,25,.75)';ctx.lineWidth=1.5;ctx.stroke();}
    else{ctx.fillStyle='rgba(20,18,25,.75)';ctx.beginPath();ctx.ellipse(0,s*.1,s*.35,s*.5,0,0,6.28);ctx.fill();ctx.beginPath();ctx.arc(0,-s*.5,s*.3,0,6.28);ctx.fill();ctx.beginPath();ctx.moveTo(-s*.2,-s*.7);ctx.lineTo(-s*.35,-s*1.1);ctx.lineTo(-s*.05,-s*.75);ctx.fill();ctx.beginPath();ctx.moveTo(s*.2,-s*.7);ctx.lineTo(s*.35,-s*1.1);ctx.lineTo(s*.05,-s*.75);ctx.fill();ctx.fillStyle='rgba(180,200,80,.5)';ctx.beginPath();ctx.ellipse(-s*.1,-s*.5,s*.06,s*.04,0,0,6.28);ctx.ellipse(s*.1,-s*.5,s*.06,s*.04,0,0,6.28);ctx.fill();const tw=Math.sin(this.tailPhase*1.5)*.3;ctx.beginPath();ctx.moveTo(s*.3,s*.3);ctx.quadraticCurveTo(s*.7,tw*s,s*.9,-s*.3+tw*s);ctx.strokeStyle='rgba(20,18,25,.75)';ctx.lineWidth=1.5;ctx.stroke();}ctx.restore();}
}

// ══════════════════════════════════════════
// CREATURES: DRAGONFLY
// ══════════════════════════════════════════
class DragonflySystem{
  constructor(){this.flies=[];this.timer=R(20,40);}
  update(dt,time){this.timer-=dt;if(this.timer<=0){this.timer=R(25,45);if(this.flies.length<2){const x=R(W*.1,W*.9),y=R(HOR*.8,H*.7);this.flies.push({x,y,tx:x+R(-80,80),ty:y+R(-40,40),speed:R(40,80),wp:R(0,6.28),life:R(12,25),seed:R(0,1000)});}}
    for(const d of this.flies){d.wp+=18*dt;const dx=d.tx-d.x,dy=d.ty-d.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist>2){d.x+=(dx/dist)*d.speed*dt;d.y+=(dy/dist)*d.speed*dt;}if(dist<10||Math.random()<dt*.3){d.tx=d.x+R(-100,100);d.ty=cl(d.y+R(-50,50),HOR*.6,H*.8);}d.life-=dt;}this.flies=this.flies.filter(d=>d.life>0);}
  draw(time){for(const d of this.flies){const a=cl(d.life/2,0,1)*.8,s=5;ctx.save();ctx.translate(d.x,d.y);ctx.globalAlpha=a;ctx.fillStyle='rgba(30,60,80,.8)';ctx.beginPath();ctx.ellipse(0,0,s*.15,s*.6,0,0,6.28);ctx.fill();const wf=Math.sin(d.wp)*.3+.7;const hue=180+Math.sin(time*2+d.seed)*30;ctx.fillStyle=hsl(hue,40,70,.3*wf);ctx.beginPath();ctx.ellipse(-s*.4,-s*.1*wf,s*.7,s*.15,-.2,0,6.28);ctx.ellipse(s*.4,-s*.1*wf,s*.7,s*.15,.2,0,6.28);ctx.fill();ctx.fillStyle=hsl(hue+20,35,65,.25*wf);ctx.beginPath();ctx.ellipse(-s*.3,s*.15*wf,s*.55,s*.12,-.1,0,6.28);ctx.ellipse(s*.3,s*.15*wf,s*.55,s*.12,.1,0,6.28);ctx.fill();ctx.restore();}}
}

// ══════════════════════════════════════════
// CREATURES: WORM
// ══════════════════════════════════════════
class WormSystem{
  constructor(){this.worms=[];this.timer=R(25,50);}
  update(dt){this.timer-=dt;if(this.timer<=0){this.timer=R(20,45);if(this.worms.length<2)this.worms.push({x:R(W*.1,W*.9),y:R(HOR+30,H*.9),time:0,duration:R(2,4),maxH:R(8,16)});}for(const w of this.worms)w.time+=dt;this.worms=this.worms.filter(w=>w.time<w.duration);}
  draw(){for(const w of this.worms){const t=w.time/w.duration;let rise;if(t<.3)rise=ease.out(t/.3);else if(t<.6)rise=1;else rise=1-ease.in((t-.6)/.4);const h=w.maxH*rise;ctx.save();ctx.translate(w.x,w.y);ctx.strokeStyle='rgba(180,140,120,.7)';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(3,-h*.5,Math.sin(w.time*5)*3,-h);ctx.stroke();ctx.restore();}}
}

// ══════════════════════════════════════════
// GROUND: GLOWING MUSHROOMS
// ══════════════════════════════════════════
class GlowMushrooms{
  constructor(){this.clusters=[];this.timer=R(20,50);}
  update(dt){this.timer-=dt;if(this.timer<=0){this.timer=R(25,55);if(this.clusters.length<4){const cx=R(W*.05,W*.95),cy=R(HOR+30,H*.9),shrooms=[];for(let i=0,n=RI(2,5);i<n;i++)shrooms.push({ox:R(-12,12),oy:R(-4,4),size:R(3,7),hue:pick([140,160,180,280,300]),ph:R(0,6.28)});this.clusters.push({x:cx,y:cy,shrooms,life:R(30,70)});}}for(const c of this.clusters)c.life-=dt;this.clusters=this.clusters.filter(c=>c.life>0);}
  draw(time){for(const c of this.clusters){const fade=cl(c.life<3?c.life/3:1,0,1);for(const m of c.shrooms){const x=c.x+m.ox,y=c.y+m.oy,s=m.size,pulse=.6+.4*Math.sin(time*1.5+m.ph),a=fade*pulse;
    ctx.globalAlpha=a*.1;ctx.beginPath();ctx.arc(x,y-s*.5,s*2.5,0,6.28);ctx.fillStyle=hsl(m.hue,50,60);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=hsl(m.hue-20,20,75,a*.6);ctx.fillRect(x-s*.12,y-s*.3,s*.24,s*.5);ctx.beginPath();ctx.ellipse(x,y-s*.4,s*.5,s*.35,0,Math.PI,0);ctx.fillStyle=hsl(m.hue,45,55,a*.8);ctx.fill();ctx.fillStyle=hsl(m.hue,30,80,a*.5);ctx.beginPath();ctx.arc(x-s*.15,y-s*.55,s*.08,0,6.28);ctx.arc(x+s*.2,y-s*.5,s*.06,0,6.28);ctx.fill();}}}
}

// ══════════════════════════════════════════
// GROUND: POND
// ══════════════════════════════════════════
class Pond{
  constructor(){
    this.x=R(W*.25,W*.7);this.y=R(HOR+75,H*.82);this.w=R(220,340);this.h=R(70,110);
    this.ripples=[];this.rt=R(1,4);this.rw=this.w*.55;this.rh=this.h*.55;
    // Lily pads
    this.lilies=[];for(let i=0;i<RI(7,16);i++){const a=R(0,6.28),d=R(.15,.85);this.lilies.push({ox:Math.cos(a)*this.w*.4*d,oy:Math.sin(a)*this.h*.35*d,size:R(7,15),rot:R(0,6.28),hasFlower:Math.random()>.55,flowerHue:pick([340,350,45,300,320]),bobPhase:R(0,6.28),bobSpeed:R(.5,1.2)});}
    // Reeds around edge
    this.reeds=[];for(let i=0;i<RI(14,26);i++){const side=R(0,6.28);const edge=R(.85,1.1);this.reeds.push({ox:Math.cos(side)*this.w*.5*edge,oy:Math.sin(side)*this.h*.45*edge,h:R(22,50),w:R(1.5,3),seed:R(0,1000),hasTop:Math.random()>.4});}
    // Fish
    this.fish=[];for(let i=0;i<RI(2,5);i++)this.fish.push({ox:R(-.3,.3)*this.w,oy:R(-.2,.2)*this.h,speed:R(5,15),dir:Math.random()>.5?1:-1,size:R(2,4),seed:R(0,1000),jumpTimer:R(8,25),jumping:false,jumpY:0,jumpVy:0});
  }
  contains(x,y){const dx=(x-this.x)/this.rw,dy=(y-this.y)/this.rh;return dx*dx+dy*dy<1.15;}
  update(dt,time){
    this.rt-=dt;if(this.rt<=0){this.rt=R(1.5,5);this.ripples.push({x:this.x+R(-this.w*.35,this.w*.35),y:this.y+R(-this.h*.25,this.h*.25),r:0,a:1});}
    for(const r of this.ripples){r.r+=12*dt;r.a-=dt*.35;}this.ripples=this.ripples.filter(r=>r.a>0);
    // Fish
    for(const f of this.fish){
      f.ox+=f.dir*f.speed*dt;if(Math.abs(f.ox)>this.w*.35){f.dir*=-1;}
      f.ox+=noise.get(f.seed+time*.15,0)*3*dt;
      f.jumpTimer-=dt;
      if(f.jumping){f.jumpVy+=80*dt;f.jumpY+=f.jumpVy*dt;if(f.jumpY>=0){f.jumpY=0;f.jumping=false;f.jumpTimer=R(10,30);this.ripples.push({x:this.x+f.ox,y:this.y+f.oy,r:0,a:1});}}
      else if(f.jumpTimer<=0){f.jumping=true;f.jumpVy=R(-50,-30);this.ripples.push({x:this.x+f.ox,y:this.y+f.oy,r:0,a:.7});}
    }
  }
  draw(time,moon){
    const cx=this.x,cy=this.y,rw=this.w*.55,rh=this.h*.55;
    // Muddy bank
    ctx.beginPath();ctx.ellipse(cx,cy,rw+6,rh+4,0,0,6.28);
    const bg=ctx.createRadialGradient(cx,cy,rw*.5,cx,cy,rw+6);
    bg.addColorStop(0,'rgba(60,50,30,0)');bg.addColorStop(.7,'rgba(60,50,30,.3)');bg.addColorStop(1,'rgba(50,45,25,.15)');
    ctx.fillStyle=bg;ctx.fill();
    // Clip to pond shape
    ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,rw,rh,0,0,6.28);ctx.clip();
    // Water base — deep gradient
    const wg=ctx.createRadialGradient(cx,cy-rh*.2,0,cx,cy,rw);
    wg.addColorStop(0,hsl(215,30,12,.75));wg.addColorStop(.4,hsl(210,28,15,.7));wg.addColorStop(.8,hsl(205,22,20,.6));wg.addColorStop(1,hsl(200,18,25,.4));
    ctx.fillStyle=wg;ctx.fillRect(cx-rw,cy-rh,rw*2,rh*2);
    // Animated water shimmer waves
    ctx.globalAlpha=.06;
    for(let i=0;i<6;i++){
      const wy=cy-rh+i*rh*.35+Math.sin(time*.4+i*1.3)*3;
      ctx.beginPath();ctx.moveTo(cx-rw,wy);
      for(let x=-rw;x<=rw;x+=8){ctx.lineTo(cx+x,wy+Math.sin(x*.04+time*1.2+i)*2.5);}
      ctx.lineTo(cx+rw,wy+rh*.3);ctx.lineTo(cx-rw,wy+rh*.3);ctx.closePath();
      ctx.fillStyle=i%2===0?'rgba(150,180,220,.8)':'rgba(120,150,200,.5)';ctx.fill();
    }
    ctx.globalAlpha=1;
    // Star reflections (more and animated)
    for(let i=0;i<10;i++){
      const sx=cx+Math.sin(i*2.1+time*.15)*rw*.7;
      const sy=cy+Math.cos(i*1.7+time*.12)*rh*.6;
      const tw=.5+.5*Math.sin(time*1.2+i*3.7);
      const sa=tw*.12;
      ctx.beginPath();ctx.arc(sx,sy,.8,0,6.28);
      ctx.fillStyle=`rgba(200,215,255,${sa})`;ctx.fill();
    }
    // Moon reflection
    if(moon&&moon.active&&moon.opacity>.3){
      const pa=moon.phase*6.28,so=Math.abs(Math.cos(pa));
      if(so>.4){// Moon is fairly full
        const ma=moon.opacity*so*.25;
        const mrx=cx+Math.sin(time*.3)*rw*.1;
        const mry=cy-rh*.15+Math.sin(time*.5)*3;
        const mrs=moon.size*.5;
        // Bright reflection blob
        const mg=ctx.createRadialGradient(mrx,mry,0,mrx,mry,mrs*2);
        mg.addColorStop(0,`rgba(255,250,220,${ma*.5})`);
        mg.addColorStop(.3,`rgba(255,245,200,${ma*.25})`);
        mg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath();ctx.arc(mrx,mry,mrs*2,0,6.28);ctx.fillStyle=mg;ctx.fill();
        // Wavering column of light below
        ctx.globalAlpha=ma*.3;
        ctx.beginPath();ctx.moveTo(mrx-mrs*.4,mry);
        for(let y=0;y<rh*.6;y+=3){ctx.lineTo(mrx+Math.sin(y*.15+time*1.5)*mrs*.6,mry+y);}
        for(let y=rh*.6;y>=0;y-=3){ctx.lineTo(mrx+Math.sin(y*.15+time*1.5)*mrs*.3,mry+y);}
        ctx.fillStyle='rgba(255,250,230,.4)';ctx.fill();
        ctx.globalAlpha=1;
      }
    }
    // Ripples
    for(const r of this.ripples){
      ctx.beginPath();ctx.ellipse(r.x,r.y,r.r,r.r*.4,0,0,6.28);
      ctx.strokeStyle=`rgba(180,200,220,${r.a*.2})`;ctx.lineWidth=.6;ctx.stroke();
      if(r.r>5){ctx.beginPath();ctx.ellipse(r.x,r.y,r.r*.6,r.r*.25,0,0,6.28);ctx.strokeStyle=`rgba(180,200,220,${r.a*.1})`;ctx.stroke();}
    }
    // Fish shadows under water
    for(const f of this.fish){
      if(f.jumping)continue;
      const fx=cx+f.ox,fy=cy+f.oy;
      ctx.save();ctx.translate(fx,fy);if(f.dir<0)ctx.scale(-1,1);
      ctx.fillStyle='rgba(30,40,50,.15)';ctx.beginPath();
      ctx.moveTo(f.size,0);ctx.quadraticCurveTo(f.size*.3,-f.size*.4,-f.size,0);ctx.quadraticCurveTo(f.size*.3,f.size*.4,f.size,0);
      ctx.fill();
      // Tail
      ctx.beginPath();ctx.moveTo(-f.size,0);ctx.lineTo(-f.size*1.5,-f.size*.3);ctx.lineTo(-f.size*1.5,f.size*.3);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    // Lily pads
    for(const l of this.lilies){
      const lx=cx+l.ox+Math.sin(time*.3+l.bobPhase)*2;
      const ly=cy+l.oy+Math.sin(time*l.bobSpeed+l.bobPhase)*1.5;
      const ls=l.size;
      ctx.save();ctx.translate(lx,ly);ctx.rotate(l.rot+Math.sin(time*.2+l.bobPhase)*.05);
      // Pad
      ctx.beginPath();ctx.arc(0,0,ls,0,6.28);
      // Notch
      ctx.moveTo(0,0);ctx.lineTo(ls*.3,-ls*.1);ctx.lineTo(ls,0);
      ctx.fillStyle='rgba(35,90,30,.55)';ctx.fill();
      // Pad veins
      ctx.strokeStyle='rgba(30,70,25,.2)';ctx.lineWidth=.3;ctx.beginPath();
      for(let v=0;v<5;v++){const va=v*1.2+.3;ctx.moveTo(0,0);ctx.lineTo(Math.cos(va)*ls*.85,Math.sin(va)*ls*.85);}ctx.stroke();
      // Flower
      if(l.hasFlower){
        const fh=l.flowerHue;
        for(let p=0;p<5;p++){ctx.save();ctx.rotate(p*1.256);ctx.beginPath();ctx.ellipse(0,-ls*.4,ls*.18,ls*.35,0,0,6.28);ctx.fillStyle=hsl(fh,55,75,.65);ctx.fill();ctx.restore();}
        ctx.beginPath();ctx.arc(0,0,ls*.15,0,6.28);ctx.fillStyle='rgba(255,220,80,.6)';ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();// end clip
    // Edge — soft grassy border
    ctx.beginPath();ctx.ellipse(cx,cy,rw,rh,0,0,6.28);
    ctx.strokeStyle='rgba(45,70,30,.35)';ctx.lineWidth=2;ctx.stroke();
    // Reeds (throttle noise like grass)
    for(const r of this.reeds){
      const rx=cx+r.ox,ry=cy+r.oy;
      if(!r._wt||time-r._wt>.08){r._wt=time;r._sw=noise.get(r.seed+time*.2,0)*4;}
      const sw=(r._sw||0)+gustForce*.3;
      ctx.strokeStyle='rgba(55,85,35,.6)';ctx.lineWidth=r.w;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(rx,ry);ctx.quadraticCurveTo(rx+sw*.5,ry-r.h*.5,rx+sw,ry-r.h);ctx.stroke();
      if(r.hasTop){ctx.fillStyle='rgba(90,60,30,.5)';ctx.beginPath();ctx.ellipse(rx+sw,ry-r.h,r.w*1.2,r.w*3,sw*.02,0,6.28);ctx.fill();}
    }
    // Jumping fish (above water)
    for(const f of this.fish){
      if(!f.jumping)continue;
      const fx=cx+f.ox,fy=cy+f.oy+f.jumpY;
      ctx.save();ctx.translate(fx,fy);if(f.dir<0)ctx.scale(-1,1);
      ctx.fillStyle='rgba(160,170,180,.7)';ctx.beginPath();
      ctx.moveTo(f.size*1.2,0);ctx.quadraticCurveTo(f.size*.3,-f.size*.6,-f.size*1.2,0);ctx.quadraticCurveTo(f.size*.3,f.size*.6,f.size*1.2,0);ctx.fill();
      ctx.beginPath();ctx.moveTo(-f.size*1.2,0);ctx.lineTo(-f.size*1.8,-f.size*.4);ctx.lineTo(-f.size*1.8,f.size*.4);ctx.closePath();ctx.fill();
      // Eye
      ctx.beginPath();ctx.arc(f.size*.6,-f.size*.15,f.size*.12,0,6.28);ctx.fillStyle='rgba(20,20,20,.6)';ctx.fill();
      // Sparkle
      ctx.beginPath();ctx.arc(f.size*.3,-f.size*.25,f.size*.08,0,6.28);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fill();
      ctx.restore();
    }
  }
}

// ══════════════════════════════════════════
// GROUND: SPIDER WEB
// ══════════════════════════════════════════
class SpiderWeb{
  constructor(){this.webs=[];this.timer=R(25,50);}
  update(dt){this.timer-=dt;if(this.timer<=0){this.timer=R(25,50);if(this.webs.length<2)this.webs.push({x:R(W*.1,W*.9),y:R(HOR+20,HOR+80),size:R(12,22),life:R(40,80),seed:R(0,1000)});}for(const w of this.webs)w.life-=dt;this.webs=this.webs.filter(w=>w.life>0);}
  draw(time){for(const w of this.webs){const a=cl(w.life<3?w.life/3:1,0,1)*.35,s=w.size,sway=noise.get(w.seed+time*.15,0)*2;ctx.save();ctx.translate(w.x+sway,w.y);ctx.strokeStyle=`rgba(220,220,240,${a})`;ctx.lineWidth=.3;ctx.beginPath();for(let i=0;i<8;i++){const an=i*Math.PI/4;ctx.moveTo(0,0);ctx.lineTo(Math.cos(an)*s,Math.sin(an)*s);}ctx.stroke();ctx.beginPath();for(let r=s*.2;r<s;r+=s*.15){for(let i=0;i<8;i++){const a1=i*Math.PI/4,a2=(i+1)*Math.PI/4,wb=Math.sin(r+i)*.08;ctx.moveTo(Math.cos(a1)*(r+wb*s),Math.sin(a1)*(r+wb*s));ctx.lineTo(Math.cos(a2)*(r+wb*s),Math.sin(a2)*(r+wb*s));}}ctx.stroke();ctx.fillStyle=`rgba(200,220,255,${a*1.5})`;ctx.beginPath();for(let i=0;i<8;i++){const an=i*Math.PI/4;for(let r2=s*.3;r2<s;r2+=s*.25){const dx=Math.cos(an)*r2,dy=Math.sin(an)*r2;ctx.moveTo(dx+.8,dy);ctx.arc(dx,dy,.8,0,6.28);}}ctx.fill();ctx.restore();}}
}

// ══════════════════════════════════════════
// GROUND: CLOVER PATCH
// ══════════════════════════════════════════
class CloverPatch{
  constructor(){this.patches=[];for(let i=0;i<RI(1,3);i++){const clovers=[],cx=R(W*.05,W*.95),cy=R(HOR+30,H*.9);for(let j=0;j<RI(5,12);j++)clovers.push({x:cx+R(-20,20),y:cy+R(-8,8),size:R(2,3.5),rot:R(0,6.28),four:Math.random()<.02});this.patches.push(clovers);}}
  draw(time){for(const patch of this.patches){for(const c of patch){const s=c.size,sw=Math.sin(time*.5+c.x*.1)*1.5;ctx.save();ctx.translate(c.x+sw,c.y);ctx.rotate(c.rot);ctx.strokeStyle='rgba(60,120,40,.4)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,s*1.5);ctx.stroke();const leaves=c.four?4:3;ctx.fillStyle=c.four?'rgba(50,160,50,.6)':'rgba(50,120,40,.45)';for(let i=0;i<leaves;i++){ctx.save();ctx.rotate(i*(6.28/leaves));ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-s*.3,-s*.2,-s*.4,-s*.7,0,-s*.6);ctx.bezierCurveTo(s*.4,-s*.7,s*.3,-s*.2,0,0);ctx.fill();ctx.restore();}ctx.restore();}}}
}

// ══════════════════════════════════════════
// GROUND: FALLEN LOG
// ══════════════════════════════════════════
class FallenLog{
  constructor(){
    this.x=R(W*.1,W*.65);this.y=R(HOR+50,H*.85);this.w=R(160,250);this.rot=R(-.05,.05);this.th=R(12,20);
    this.bark=[];for(let i=0;i<RI(10,18);i++)this.bark.push({ox:R(-this.w*.46,this.w*.46),w:R(.5,2.5),len:R(4,12),c1:R(-.5,.5),c2:R(-.5,.5)});
    this.moss=[];for(let i=0;i<RI(5,10);i++)this.moss.push({ox:R(-this.w*.42,this.w*.38),sz:R(4,10),szh:R(2,5),r:R(-.3,.3),hue:R(85,145)});
    this.shrooms=[];for(let i=0;i<RI(1,5);i++)this.shrooms.push({ox:R(-this.w*.38,this.w*.38),sz:R(2.5,5),hue:pick([28,35,350,42]),side:Math.random()>.5?-1:1});
    this.knots=[];for(let i=0;i<RI(2,4);i++)this.knots.push({ox:R(-this.w*.35,this.w*.35),sz:R(2.5,5)});
    this.cracks=[];for(let i=0;i<RI(1,3);i++)this.cracks.push({ox:R(-this.w*.3,this.w*.3),len:R(6,14),ang:R(-.3,.3)});
    // Broken branch stubs
    this.stubs=[];for(let i=0;i<RI(1,3);i++)this.stubs.push({ox:R(-this.w*.3,this.w*.35),h:R(6,14),w:R(2,4),side:Math.random()>.5?-1:1});
  }
  draw(){
    const w=this.w,t=this.th;ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.rot);
    // Ground shadow
    ctx.fillStyle='rgba(15,10,5,.12)';ctx.beginPath();ctx.ellipse(3,t*.6,w*.53,t*.6,.02,0,6.28);ctx.fill();
    // Main log body — organic cylindrical shape with irregularities
    ctx.beginPath();
    ctx.moveTo(-w*.5,-t*.35);
    ctx.bezierCurveTo(-w*.3,-t*.4,-w*.1,-t*.32,0,-t*.35);
    ctx.bezierCurveTo(w*.15,-t*.38,w*.35,-t*.33,w*.45,-t*.36);
    ctx.quadraticCurveTo(w*.55,-t*.15,w*.5,t*.1);
    ctx.bezierCurveTo(w*.35,t*.35,w*.1,t*.32,0,t*.35);
    ctx.bezierCurveTo(-w*.2,t*.38,-w*.4,t*.32,-w*.5,t*.36);
    ctx.quadraticCurveTo(-w*.58,t*.12,-w*.53,-t*.08);
    ctx.closePath();
    const lg=ctx.createLinearGradient(0,-t*1.2,0,t*1.2);
    lg.addColorStop(0,'#7a5a28');lg.addColorStop(.25,'#6b4a1e');lg.addColorStop(.5,'#5e4018');lg.addColorStop(.75,'#503514');lg.addColorStop(1,'#3e2a0e');
    ctx.fillStyle=lg;ctx.fill();ctx.strokeStyle='rgba(35,25,10,.25)';ctx.lineWidth=.7;ctx.stroke();
    // Bark texture — deep grooves
    ctx.lineCap='round';
    for(const b of this.bark){ctx.strokeStyle='rgba(30,20,8,.18)';ctx.lineWidth=b.w;
      ctx.beginPath();ctx.moveTo(b.ox,-t*.33);ctx.bezierCurveTo(b.ox+b.c1,0,b.ox+b.w*.3,t*.15,b.ox+b.w,t*.33);ctx.stroke();
      ctx.strokeStyle='rgba(90,65,30,.05)';ctx.lineWidth=b.w*.4;ctx.beginPath();ctx.moveTo(b.ox+b.w*.3,-t*.3);ctx.lineTo(b.ox+b.w*.5,t*.3);ctx.stroke();}
    // Cracks
    for(const cr of this.cracks){ctx.strokeStyle='rgba(20,14,5,.2)';ctx.lineWidth=.8;
      ctx.beginPath();ctx.moveTo(cr.ox,-t*.15);ctx.bezierCurveTo(cr.ox+cr.len*.3,-t*.1+cr.ang*5,cr.ox+cr.len*.7,cr.ang*8,cr.ox+cr.len,cr.ang*12);ctx.stroke();}
    // Knots with depth
    for(const k of this.knots){ctx.fillStyle='rgba(30,20,10,.25)';ctx.beginPath();ctx.ellipse(k.ox,0,k.sz,k.sz*.75,.1,0,6.28);ctx.fill();
      ctx.strokeStyle='rgba(50,35,15,.2)';ctx.lineWidth=.4;for(let r=k.sz*.2;r<k.sz;r+=k.sz*.2){ctx.beginPath();ctx.ellipse(k.ox,0,r,r*.75,0,0,6.28);ctx.stroke();}
      ctx.fillStyle='rgba(15,10,5,.2)';ctx.beginPath();ctx.ellipse(k.ox,0,k.sz*.25,k.sz*.2,0,0,6.28);ctx.fill();}
    // Cut end (left) — visible growth rings
    ctx.beginPath();ctx.ellipse(-w*.51,0,t*.5,t*.55,0,0,6.28);
    const eg=ctx.createRadialGradient(-w*.51,0,0,-w*.51,0,t*.5);
    eg.addColorStop(0,'#d4b070');eg.addColorStop(.2,'#c4a060');eg.addColorStop(.5,'#a88548');eg.addColorStop(.8,'#8a6a35');eg.addColorStop(1,'#6a5025');
    ctx.fillStyle=eg;ctx.fill();ctx.strokeStyle='rgba(50,35,15,.3)';ctx.lineWidth=.6;ctx.stroke();
    ctx.strokeStyle='rgba(60,42,18,.15)';ctx.lineWidth=.3;
    for(let r=t*.08;r<t*.48;r+=t*.06){ctx.beginPath();ctx.ellipse(-w*.51,0,r,r*1.1,0,0,6.28);ctx.stroke();}
    // Pith at center
    ctx.fillStyle='rgba(140,110,60,.2)';ctx.beginPath();ctx.arc(-w*.51,0,t*.06,0,6.28);ctx.fill();
    // Broken end (right) — jagged splintered wood
    ctx.beginPath();ctx.moveTo(w*.44,-t*.35);
    ctx.lineTo(w*.48,-t*.5);ctx.lineTo(w*.46,-t*.42);ctx.lineTo(w*.52,-t*.55);ctx.lineTo(w*.5,-t*.35);
    ctx.fillStyle='#5e4018';ctx.fill();
    // Branch stubs
    for(const st of this.stubs){const sy=st.side*t*.3;ctx.fillStyle='#4a3518';
      ctx.beginPath();ctx.moveTo(st.ox-st.w*.5,sy);ctx.lineTo(st.ox-st.w*.3,sy+st.side*-st.h);
      ctx.lineTo(st.ox+st.w*.3,sy+st.side*-st.h*.85);ctx.lineTo(st.ox+st.w*.5,sy);ctx.fill();
      ctx.beginPath();ctx.ellipse(st.ox,sy+st.side*-st.h*.9,st.w*.4,st.w*.3,0,0,6.28);ctx.fillStyle='rgba(160,120,60,.3)';ctx.fill();}
    // Moss on top
    for(const m of this.moss){ctx.beginPath();ctx.ellipse(m.ox,-t*.33+m.szh*.2,m.sz,m.szh,m.r,0,6.28);ctx.fillStyle=hsl(m.hue,42,32,.5);ctx.fill();
      ctx.beginPath();ctx.ellipse(m.ox,-t*.33+m.szh*.1,m.sz*.7,m.szh*.5,m.r,0,6.28);ctx.fillStyle=hsl(m.hue+10,38,38,.3);ctx.fill();}
    // Mushrooms
    for(const s of this.shrooms){const ss=s.sz,sy=s.side*t*.32;
      ctx.fillStyle=hsl(s.hue,22,60,.5);ctx.beginPath();ctx.moveTo(s.ox-ss*.08,sy);ctx.lineTo(s.ox-ss*.05,sy+s.side*-ss*.5);ctx.lineTo(s.ox+ss*.05,sy+s.side*-ss*.5);ctx.lineTo(s.ox+ss*.08,sy);ctx.fill();
      ctx.beginPath();ctx.ellipse(s.ox,sy+s.side*-ss*.5,ss*.55,ss*.3,0,s.side>0?Math.PI:0,s.side>0?0:Math.PI);ctx.fillStyle=hsl(s.hue,28,50,.6);ctx.fill();
      ctx.fillStyle=hsl(s.hue,20,75,.3);ctx.beginPath();ctx.arc(s.ox-ss*.15,sy+s.side*-ss*.55,ss*.08,0,6.28);ctx.arc(s.ox+ss*.2,sy+s.side*-ss*.52,ss*.06,0,6.28);ctx.fill();}
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// WEATHER: RAIN
// ══════════════════════════════════════════
class RainEvent{
  constructor(){this.active=false;this.timer=R(40,90);this.drops=[];this.time=0;this.duration=0;}
  update(dt){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(40,90);this.time=0;this.duration=R(15,30);this.drops=[];for(let i=0;i<180;i++)this.drops.push({x:R(-20,W+20),y:R(-H,H),speed:R(300,500),len:R(8,18),drift:R(-15,5)});}return;}this.time+=dt;const t=this.time/this.duration,I=t<.1?ease.out(t/.1):t>.8?1-ease.in((t-.8)/.2):1;for(const d of this.drops){d.y+=d.speed*I*dt;d.x+=d.drift*dt;if(d.y>H+10){d.y=-d.len;d.x=R(-20,W+20);}}if(this.time>=this.duration){this.active=false;this.drops=[];}}
  draw(){if(!this.active)return;const t=this.time/this.duration,I=t<.1?ease.out(t/.1):t>.8?1-ease.in((t-.8)/.2):1;ctx.fillStyle=`rgba(100,120,140,${I*.04})`;ctx.fillRect(0,0,W,H);ctx.strokeStyle=`rgba(180,200,220,${I*.25})`;ctx.lineWidth=.5;ctx.beginPath();for(const d of this.drops){ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+d.drift*.03,d.y+d.len);}ctx.stroke();}
}

// ══════════════════════════════════════════
// WEATHER: DISTANT LIGHTNING
// ══════════════════════════════════════════
class DistantLightning{
  constructor(){this.timer=R(40,90);this.flash=0;this.flashX=0;}
  update(dt){this.timer-=dt;if(this.flash>0)this.flash-=dt;if(this.timer<=0){this.timer=R(40,90);this.flash=R(.1,.25);this.flashX=R(W*.1,W*.9);}}
  draw(){if(this.flash<=0)return;const a=this.flash/.25;const lg=ctx.createLinearGradient(0,HOR*.6,0,HOR);lg.addColorStop(0,'rgba(0,0,0,0)');lg.addColorStop(.5,`rgba(200,200,255,${a*.06})`);lg.addColorStop(1,`rgba(200,200,255,${a*.12})`);ctx.fillStyle=lg;ctx.fillRect(this.flashX-W*.15,HOR*.5,W*.3,HOR*.5);}
}

// ══════════════════════════════════════════
// WEATHER: FOG BANK
// ══════════════════════════════════════════
class FogBank{
  constructor(){this.active=false;this.timer=R(40,80);this.time=0;this.duration=0;this.blobs=[];}
  update(dt){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(90,180);this.time=0;this.duration=R(20,40);this.x=-W*.3;this.blobs=[];for(let i=0;i<4;i++)this.blobs.push({ox:i*W*.25,oy:i*15,r:R(80,160)});}return;}this.time+=dt;this.x+=8*dt;if(this.time>=this.duration)this.active=false;}
  draw(){if(!this.active)return;const t=this.time/this.duration,a=t<.15?ease.out(t/.15):t>.8?1-ease.in((t-.8)/.2):.35;for(const b of this.blobs){const fx=this.x+b.ox,fy=HOR+30+b.oy;const fg=ctx.createRadialGradient(fx,fy,0,fx,fy,b.r);fg.addColorStop(0,`rgba(160,170,150,${a*.08})`);fg.addColorStop(1,'rgba(160,170,150,0)');ctx.beginPath();ctx.arc(fx,fy,b.r,0,6.28);ctx.fillStyle=fg;ctx.fill();}}
}

// ══════════════════════════════════════════
// WEATHER: WIND GUST
// ══════════════════════════════════════════
let gustForce=0;
class WindGust{
  constructor(){this.active=false;this.timer=R(60,120);this.time=0;this.duration=3;this.dir=1;}
  update(dt){if(!this.active){gustForce=0;this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(60,120);this.time=0;this.dir=Math.random()>.5?1:-1;}return;}this.time+=dt;if(this.time>=this.duration){this.active=false;gustForce=0;return;}const t=this.time/this.duration;gustForce=(t<.3?ease.out(t/.3):1-ease.in((t-.3)/.7))*this.dir*25;}
}

// ══════════════════════════════════════════
// RARE: PAPER LANTERN (single)
// ══════════════════════════════════════════
class PaperLanternSingle{
  constructor(){this.active=false;this.timer=R(45,120);}
  update(dt,time){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(45,120);this.x=R(W*.2,W*.8);this.y=H*.85;this.vy=-12;this.seed=R(0,1000);this.life=R(20,35);}return;}this.x+=noise.get(this.seed+time*.05,0)*8*dt;this.y+=this.vy*dt;this.vy+=(-22-this.vy)*.01;this.life-=dt;if(this.life<=0||this.y<-30)this.active=false;}
  draw(time){if(!this.active)return;const a=cl(this.life/3,0,1),s=6,flicker=.7+.3*Math.sin(time*7+this.seed);ctx.save();ctx.translate(this.x,this.y);ctx.globalAlpha=a;const gg=ctx.createRadialGradient(0,0,s*.3,0,0,s*3.5);gg.addColorStop(0,`rgba(255,180,60,${flicker*.15})`);gg.addColorStop(1,'rgba(0,0,0,0)');ctx.beginPath();ctx.arc(0,0,s*3.5,0,6.28);ctx.fillStyle=gg;ctx.fill();ctx.beginPath();ctx.moveTo(-s*.35,-s*.6);ctx.bezierCurveTo(-s*.4,-s*.3,-s*.4,s*.3,-s*.25,s*.5);ctx.lineTo(s*.25,s*.5);ctx.bezierCurveTo(s*.4,s*.3,s*.4,-s*.3,s*.35,-s*.6);ctx.closePath();ctx.fillStyle=`rgba(255,200,100,${flicker*.8})`;ctx.fill();ctx.restore();}
}

// ══════════════════════════════════════════
// RARE: FIREFLY SWARM
// ══════════════════════════════════════════
class FireflySwarm{
  constructor(){this.active=false;this.timer=R(40,90);this.flies=[];this.time=0;this.phase='gather';}
  update(dt,time){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(40,90);this.time=0;this.phase='gather';this.cx=R(W*.2,W*.8);this.cy=R(HOR+30,H*.7);this.flies=[];for(let i=0;i<30;i++)this.flies.push({x:this.cx+R(-100,100),y:this.cy+R(-60,60),tx:0,ty:0,seed:R(0,1000)});}return;}
    this.time+=dt;const pd=this.phase==='gather'?4:this.phase==='shape'?5:3;if(this.time>pd){if(this.phase==='gather'){this.phase='shape';this.time=0;const ga=Math.PI*(3-Math.sqrt(5));for(let i=0;i<this.flies.length;i++){const a=i*ga,r=Math.sqrt(i/this.flies.length)*25;this.flies[i].tx=this.cx+Math.cos(a)*r;this.flies[i].ty=this.cy+Math.sin(a)*r;}}else if(this.phase==='shape'){this.phase='scatter';this.time=0;for(const f of this.flies){f.tx=f.x+R(-120,120);f.ty=f.y+R(-80,80);}}else{this.active=false;return;}}
    for(const f of this.flies){const tx=this.phase==='gather'?this.cx+R(-20,20):f.tx,ty=this.phase==='gather'?this.cy+R(-15,15):f.ty;f.x+=(tx-f.x)*.03;f.y+=(ty-f.y)*.03;f.x+=noise.get(f.seed+time*.3,0)*5*dt;f.y+=noise.get(0,f.seed+time*.3)*4*dt;}}
  draw(time){if(!this.active)return;for(const f of this.flies){const blink=Math.pow(Math.max(0,Math.sin(time*2+f.seed)),2);ctx.beginPath();ctx.arc(f.x,f.y,1.5,0,6.28);ctx.fillStyle=`rgba(180,220,80,${blink*.7})`;ctx.fill();if(blink>.5){ctx.beginPath();ctx.arc(f.x,f.y,4,0,6.28);ctx.fillStyle=`rgba(180,220,80,${blink*.1})`;ctx.fill();}}}
}

// ══════════════════════════════════════════
// RARE: DISTANT TRAIN
// ══════════════════════════════════════════
class DistantTrain{
  constructor(){this.active=false;this.timer=R(40,90);this.cars=0;}
  update(dt){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(40,90);this.cars=RI(4,8);const fl=Math.random()>.5;this.x=fl?-this.cars*18-20:W+20;this.speed=(fl?1:-1)*R(15,30);this.y=HOR+R(2,12);}return;}this.x+=this.speed*dt;if((this.speed>0&&this.x>W+50)||(this.speed<0&&this.x<-this.cars*18-50))this.active=false;}
  draw(){if(!this.active)return;ctx.save();ctx.translate(this.x,this.y);for(let i=0;i<this.cars;i++){const cx=i*16;ctx.fillStyle='rgba(30,25,20,.25)';ctx.fillRect(cx,0,14,5);ctx.fillStyle='rgba(255,220,140,.2)';ctx.fillRect(cx+2,1,3,2.5);ctx.fillRect(cx+7,1,3,2.5);ctx.fillStyle='rgba(40,35,25,.25)';ctx.beginPath();ctx.arc(cx+3,5.5,1.2,0,6.28);ctx.arc(cx+11,5.5,1.2,0,6.28);ctx.fill();}ctx.restore();}
}

// ══════════════════════════════════════════
// RARE: MUSIC NOTES
// ══════════════════════════════════════════
class MusicNotes{
  constructor(){this.notes=[];this.timer=R(45,120);}
  update(dt){this.timer-=dt;if(this.timer<=0){this.timer=R(45,120);const x=R(W*.1,W*.9),y=R(HOR+40,H*.8);for(let i=0;i<RI(3,6);i++)this.notes.push({x:x+R(-10,10),y,vx:R(-8,8),vy:R(-20,-35),life:R(3,6),size:R(3,5),hue:pick([45,200,300,340]),delay:i*R(.3,.6)});}for(const n of this.notes){if(n.delay>0){n.delay-=dt;continue;}n.x+=n.vx*dt;n.y+=n.vy*dt;n.life-=dt;}this.notes=this.notes.filter(n=>n.life>0||n.delay>0);}
  draw(){for(const n of this.notes){if(n.delay>0)continue;const a=cl(n.life/1.5,0,1)*.6,s=n.size;ctx.save();ctx.translate(n.x,n.y);ctx.fillStyle=hsl(n.hue,50,70,a);ctx.beginPath();ctx.ellipse(0,0,s*.4,s*.3,.3,0,6.28);ctx.fill();ctx.strokeStyle=hsl(n.hue,50,70,a);ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(s*.3,-s*.1);ctx.lineTo(s*.3,-s*1.2);ctx.stroke();ctx.restore();}}
}

// ══════════════════════════════════════════
// RARE: LIGHTHOUSE
// ══════════════════════════════════════════
class Lighthouse{
  constructor(){this.active=false;this.timer=R(45,120);this.side=1;this.sa=0;this.time=0;this.duration=0;}
  update(dt){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(45,120);this.side=Math.random()>.5?1:-1;this.time=0;this.duration=R(15,30);}return;}this.time+=dt;this.sa+=.8*dt;if(this.time>=this.duration)this.active=false;}
  draw(){if(!this.active)return;const t=this.time/this.duration,a=t<.15?ease.out(t/.15):t>.85?1-ease.in((t-.85)/.15):.15;const bx=this.side>0?W+5:-5,by=HOR+10,beam=Math.sin(this.sa);if(beam<0)return;ctx.save();ctx.globalAlpha=a*beam;const angle=this.side>0?Math.PI-.4+beam*.3:.4+Math.PI-beam*.3;const len=W*.6,ex=bx+Math.cos(angle)*len,ey=by+Math.sin(angle)*len;const bg=ctx.createLinearGradient(bx,by,ex,ey);bg.addColorStop(0,'rgba(255,250,200,.06)');bg.addColorStop(.5,'rgba(255,250,200,.02)');bg.addColorStop(1,'rgba(0,0,0,0)');ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(ex-25,ey);ctx.lineTo(ex+25,ey);ctx.closePath();ctx.fillStyle=bg;ctx.fill();ctx.restore();}
}

// ══════════════════════════════════════════
// RARE: BANNER PLANE
// ══════════════════════════════════════════
class BannerPlane{
  constructor(){this.active=false;this.timer=R(40,90);}
  update(dt){if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(40,90);const fl=Math.random()>.5;this.x=fl?-180:W+180;this.y=R(HOR*.12,HOR*.4);this.vx=(fl?1:-1)*R(30,55);this.sway=0;}return;}
    this.x+=this.vx*dt;this.sway=Math.sin(this.x*.008)*3;if((this.vx>0&&this.x>W+200)||(this.vx<0&&this.x<-200))this.active=false;}
  draw(){if(!this.active)return;const py=this.y+this.sway;ctx.save();ctx.translate(this.x,py);if(this.vx<0)ctx.scale(-1,1);
    // Plane body
    ctx.fillStyle='rgba(200,200,210,.5)';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-8,-2);ctx.lineTo(-10,0);ctx.lineTo(-8,2);ctx.closePath();ctx.fill();
    // Wings
    ctx.beginPath();ctx.moveTo(2,-1);ctx.lineTo(6,-6);ctx.lineTo(-2,-5);ctx.lineTo(-2,-1);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(2,1);ctx.lineTo(6,5);ctx.lineTo(-2,4);ctx.lineTo(-2,1);ctx.closePath();ctx.fill();
    // Tail
    ctx.beginPath();ctx.moveTo(-8,-2);ctx.lineTo(-12,-5);ctx.lineTo(-10,-2);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-8,2);ctx.lineTo(-12,4);ctx.lineTo(-10,2);ctx.closePath();ctx.fill();
    // Rope to banner
    ctx.strokeStyle='rgba(150,150,150,.3)';ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-22,2+Math.sin(this.x*.01)*1.5);ctx.stroke();
    // Banner
    const bx=-22,by=2+Math.sin(this.x*.01)*1.5;const bw=65,bh=11;
    const wave=Math.sin(this.x*.015)*.8;
    ctx.save();ctx.translate(bx,by);
    // Banner shape (wavy trailing edge)
    ctx.beginPath();ctx.moveTo(0,-bh/2);ctx.lineTo(-bw,-bh/2+wave);
    ctx.lineTo(-bw-4,wave);ctx.lineTo(-bw,bh/2+wave);ctx.lineTo(0,bh/2);ctx.closePath();
    ctx.fillStyle='rgba(255,245,240,.65)';ctx.fill();ctx.strokeStyle='rgba(180,160,140,.3)';ctx.lineWidth=.4;ctx.stroke();
    // Text
    ctx.save();if(this.vx<0)ctx.scale(-1,1); // un-mirror text
    const tx=this.vx>0?-bw/2:bw/2;
    ctx.fillStyle='rgba(180,60,80,.7)';ctx.font='bold 7px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('Tafsut \u2764',tx,wave*.5);
    ctx.restore();
    ctx.restore();
    ctx.restore();}
}

// ══════════════════════════════════════════
// GROUND: BACKGROUND TREES
// ══════════════════════════════════════════
class BackgroundTrees{
  constructor(){this.trees=[];for(let i=0;i<RI(2,4);i++){const x=R(W*.05,W*.7);const y=groundY(x)-R(3,10);
    const h=R(80,160),tw=R(4,9);
    const blobs=[];for(let j=0;j<RI(3,6);j++)blobs.push({ox:R(-h*.2,h*.2),oy:R(-h*.15,h*.05),sz:R(15,35),rot:R(-.2,.2)});
    this.trees.push({x,y,h,tw,blobs,hue:R(100,130),lit:R(12,22),lean:R(-3,3)});}this._oc=null;}
  _cache(){const d=Math.min(window.devicePixelRatio||1,2);this._oc=document.createElement('canvas');this._oc.width=W*d;this._oc.height=H*d;
    const c=this._oc.getContext('2d');c.setTransform(d,0,0,d,0,0);
    for(const t of this.trees){c.strokeStyle='rgba(30,22,12,.3)';c.lineWidth=t.tw;c.lineCap='round';
      c.beginPath();c.moveTo(t.x,t.y);c.quadraticCurveTo(t.x+t.lean,t.y-t.h*.5,t.x+t.lean*1.5,t.y-t.h);c.stroke();
      c.lineWidth=t.tw*.3;c.beginPath();c.moveTo(t.x+t.lean*.7,t.y-t.h*.6);c.lineTo(t.x+t.lean+t.h*.12,t.y-t.h*.7);
      c.moveTo(t.x+t.lean*.8,t.y-t.h*.5);c.lineTo(t.x+t.lean-t.h*.1,t.y-t.h*.55);c.stroke();
      for(const b of t.blobs){c.beginPath();c.ellipse(t.x+t.lean*1.5+b.ox,t.y-t.h*.82+b.oy,b.sz,b.sz*.65,b.rot,0,6.28);c.fillStyle=hsl(t.hue,20,t.lit,.35);c.fill();}}}
  draw(){if(!this._oc)this._cache();ctx.drawImage(this._oc,0,0,W,H);}
}

// ══════════════════════════════════════════
// GROUND: BIG TREE
// ══════════════════════════════════════════
class BigTree{
  constructor(){
    this.x=W*R(.78,.9);this.baseY=groundY(this.x);
    const h=H*R(.45,.58);this.h=h;this.tw=R(22,32);
    // Generate branches recursively
    this.branches=[];
    this._branch(this.x,this.baseY-h*.55,h*.35,-.05,4);
    this._branch(this.x,this.baseY-h*.45,h*.3,.7,3);
    this._branch(this.x,this.baseY-h*.6,h*.32,-.6,3);
    this._branch(this.x,this.baseY-h*.7,h*.25,.4,3);
    this._branch(this.x,this.baseY-h*.65,h*.2,-.9,2);
    if(Math.random()>.4)this._branch(this.x,this.baseY-h*.5,h*.28,.85,2);
    this.ccx=this.x-this.tw*.2;this.ccy=this.baseY-h*.74;
    // Canopy — layered leaf clusters with depth
    this.canopy=[];const cw=h*.55,ch=h*.4;
    for(let i=0;i<RI(32,45);i++){const a=R(0,6.28),d=R(.02,.95);
      const depth=d<.35?0:d<.65?1:2;
      this.canopy.push({ox:Math.cos(a)*cw*d,oy:Math.sin(a)*ch*d-ch*.3,size:R(25,55),
        hue:R(90,145),sat:R(18,45),lit:R(10+depth*4,20+depth*4),seed:R(0,1000),a:R(.5+depth*.1,.8+depth*.06),rot:R(-.15,.15),depth});}
    this.canopy.sort((a,b)=>a.depth-b.depth||(a.oy+a.size)-(b.oy+b.size));
    // Roots — thick, gnarled
    this.roots=[];for(let i=0;i<RI(4,7);i++){const side=(i%2===0?-1:1)*(1+i*.15);
      this.roots.push({dx:side*R(8,this.tw*2),len:R(20,55),w:R(2.5,6),crv:R(-8,8),bump:R(.3,.7)});}
    // Bark — deep crevices
    this.bark=[];for(let i=0;i<RI(12,20);i++)this.bark.push({y:R(.03,.92),x:R(-.45,.45),w:R(.5,2.5),len:R(6,18)});
    this.knots=[];for(let i=0;i<RI(2,4);i++)this.knots.push({y:R(.15,.75),x:R(-.25,.25),s:R(2.5,5)});
    // Hollow/cavity in trunk
    this.hollow=Math.random()>.5?{y:R(.3,.55),s:R(4,7)}:null;
    this.leaves=[];this.lt=R(1,4);this._oc=null;
  }
  _branch(sx,sy,len,ang,depth){
    if(depth<=0||len<8)return;
    const ex=sx+Math.sin(ang)*len,ey=sy-Math.cos(ang)*len*.65;
    this.branches.push({sx,sy,ex,ey,w:Math.max(.8,depth*2.2+R(-.5,.5)),crv:R(-18,18)});
    const n=RI(1,Math.min(depth,3));
    for(let i=0;i<n;i++){const t=R(.4,.85);const bx=sx+(ex-sx)*t,by=sy+(ey-sy)*t;
      this._branch(bx,by,len*R(.35,.65),ang+R(-.7,.7),depth-1);}
  }
  _cacheTrunk(){
    const tw=this.tw,h=this.h,bx=this.x,by=this.baseY;
    const allX=[bx-tw*2,...this.branches.map(b=>b.ex),...this.roots.map(r=>bx+r.dx)];
    const allY=[by+10,...this.branches.map(b=>b.ey)];
    const pad=40;const x0=Math.min(...allX)-pad,y0=Math.min(...allY)-pad;
    const cw=Math.max(...allX)+pad-x0,ch=Math.max(...allY.map(()=>by))+pad-y0+20;
    const d=Math.min(window.devicePixelRatio||1,2);
    this._oc=document.createElement('canvas');this._oc.width=Math.ceil(cw*d);this._oc.height=Math.ceil(ch*d);
    const c=this._oc.getContext('2d');c.setTransform(d,0,0,d,0,0);c.translate(-x0,-y0);
    // Ground shadow
    c.fillStyle='rgba(8,6,3,.1)';c.beginPath();c.ellipse(bx+10,by+2,tw*2.5,8,.05,0,6.28);c.fill();
    // Roots — thick, gnarly, with bumps
    for(const r of this.roots){const startX=bx+(r.dx>0?tw*.45:-tw*.45);
      c.lineWidth=r.w;c.lineCap='round';c.strokeStyle='#4a3520';
      c.beginPath();c.moveTo(startX,by);
      c.bezierCurveTo(bx+r.dx*r.bump,by+r.crv-r.w*.5,bx+r.dx*.8,by+r.crv+2,bx+r.dx,by+4);c.stroke();
      // Root highlight
      c.lineWidth=r.w*.3;c.strokeStyle='rgba(100,75,40,.12)';
      c.beginPath();c.moveTo(startX,by-1);c.bezierCurveTo(bx+r.dx*r.bump,by+r.crv-r.w,bx+r.dx*.8,by+r.crv,bx+r.dx,by+3);c.stroke();}
    // Trunk — organic shape with bulges
    c.beginPath();
    c.moveTo(bx-tw*.65,by);
    c.bezierCurveTo(bx-tw*.7,by-h*.15,bx-tw*.6,by-h*.35,bx-tw*.45,by-h*.55);
    c.bezierCurveTo(bx-tw*.35,by-h*.7,bx-tw*.3,by-h*.82,bx-tw*.2,by-h*.9);
    c.lineTo(bx+tw*.15,by-h*.9);
    c.bezierCurveTo(bx+tw*.25,by-h*.82,bx+tw*.4,by-h*.65,bx+tw*.5,by-h*.45);
    c.bezierCurveTo(bx+tw*.6,by-h*.25,bx+tw*.65,by-h*.1,bx+tw*.6,by);
    c.closePath();
    const tg=c.createLinearGradient(bx-tw*.8,0,bx+tw*.8,0);
    tg.addColorStop(0,'#2e1e0e');tg.addColorStop(.2,'#4a3218');tg.addColorStop(.4,'#5e4225');tg.addColorStop(.55,'#6a4a2a');tg.addColorStop(.7,'#5a3e20');tg.addColorStop(.85,'#4a3015');tg.addColorStop(1,'#2e1e0e');
    c.fillStyle=tg;c.fill();c.strokeStyle='rgba(25,18,8,.25)';c.lineWidth=.8;c.stroke();
    // Deep bark crevices
    c.lineCap='round';
    for(const b of this.bark){const bky=by-h*b.y;const bkx=bx+tw*b.x;
      c.strokeStyle='rgba(18,12,5,.2)';c.lineWidth=b.w;
      c.beginPath();c.moveTo(bkx,bky-b.len*.5);c.bezierCurveTo(bkx+R(-2,2),bky,bkx+R(-1,1),bky+b.len*.3,bkx+b.w*.3,bky+b.len*.5);c.stroke();
      c.strokeStyle='rgba(90,65,30,.06)';c.lineWidth=b.w*.5;
      c.beginPath();c.moveTo(bkx+b.w*.4,bky-b.len*.4);c.lineTo(bkx+b.w*.5,bky+b.len*.4);c.stroke();}
    // Knots with depth
    for(const k of this.knots){const kx=bx+tw*k.x,ky=by-h*k.y;
      c.fillStyle='rgba(30,20,10,.3)';c.beginPath();c.ellipse(kx,ky,k.s,k.s*.8,R(-.2,.2),0,6.28);c.fill();
      c.strokeStyle='rgba(50,35,15,.2)';c.lineWidth=.6;
      for(let r=k.s*.3;r<k.s;r+=k.s*.25){c.beginPath();c.ellipse(kx,ky,r,r*.8,0,0,6.28);c.stroke();}
      c.fillStyle='rgba(20,12,5,.25)';c.beginPath();c.ellipse(kx,ky,k.s*.3,k.s*.25,0,0,6.28);c.fill();}
    // Hollow/cavity
    if(this.hollow){const hy=by-h*this.hollow.y,hs=this.hollow.s;
      c.fillStyle='rgba(10,8,5,.5)';c.beginPath();c.ellipse(bx,hy,hs,hs*1.4,.1,0,6.28);c.fill();
      c.strokeStyle='rgba(50,35,15,.3)';c.lineWidth=1;c.beginPath();c.ellipse(bx,hy,hs+.5,hs*1.4+.5,.1,0,6.28);c.stroke();}
    // Branches — thicker, with bark color gradient
    this.branches.sort((a,b)=>b.w-a.w);
    for(const br of this.branches){
      c.strokeStyle=br.w>3?'#3e2a15':'#4a3520';c.lineWidth=br.w;c.lineCap='round';
      c.beginPath();c.moveTo(br.sx,br.sy);
      const mx=(br.sx+br.ex)/2+br.crv,my=(br.sy+br.ey)/2;
      c.quadraticCurveTo(mx,my,br.ex,br.ey);c.stroke();
      if(br.w>2){c.strokeStyle='rgba(80,55,25,.08)';c.lineWidth=br.w*.4;
        c.beginPath();c.moveTo(br.sx,br.sy-br.w*.2);c.quadraticCurveTo(mx,my-br.w*.15,br.ex,br.ey-br.w*.1);c.stroke();}}
    this._ox=x0;this._oy=y0;this._ow=cw;this._oh=ch;
  }
  update(dt,time){
    this.lt-=dt;if(this.lt<=0){this.lt=R(1.5,5);
      this.leaves.push({x:this.ccx+R(-this.h*.35,this.h*.3),y:this.ccy+R(-this.h*.15,this.h*.1),vx:R(-8,10),vy:R(5,15),rot:R(0,6.28),rs:R(-2,2),size:R(2,5),life:R(4,10),hue:pick([100,110,120,40,30,35])});}
    for(const l of this.leaves){l.x+=l.vx*dt+noise.get(l.x*.01,time*.3)*12*dt+gustForce*.4*dt;l.y+=l.vy*dt;l.vy+=3*dt;l.rot+=l.rs*dt;l.life-=dt;}
    this.leaves=this.leaves.filter(l=>l.life>0&&l.y<H+20);
  }
  drawTrunk(){if(!this._oc)this._cacheTrunk();ctx.drawImage(this._oc,this._ox,this._oy,this._ow,this._oh);}
  drawCanopy(time){
    // Throttle canopy sway noise (~10fps is plenty for gentle tree sway)
    if(!this._cst||time-this._cst>.1){this._cst=time;
      for(const c of this.canopy){const sp=[.06,.08,.1][c.depth];const gf=[.1,.15,.2][c.depth];
        c._sx=noise.get(c.seed+time*sp,0)*[3,4,5][c.depth]+gustForce*gf;
        c._sy=noise.get(0,c.seed+time*(sp-.01))*[1.5,2,2.5][c.depth];}}
    // Single pass over canopy (already sorted by depth)
    for(const c of this.canopy){const szm=c.depth<2?1:.85,szh=c.depth<2?[.6,.65][c.depth]:.55;
      ctx.beginPath();ctx.ellipse(this.ccx+c.ox+c._sx,this.ccy+c.oy+c._sy,c.size*szm,c.size*szh,c.rot,0,6.28);
      ctx.fillStyle=c._fill||(c._fill=hsl(c.hue,c.sat+(c.depth>1?5:0),c.lit+(c.depth>1?3:0),c.a));ctx.fill();}
    // Moonlight highlight on top (skip edge texture — too expensive for minor visual)
    const cx=this.ccx,cy=this.ccy,cw=this.h*.5,ch=this.h*.35;
    const hg=ctx.createRadialGradient(cx-cw*.1,cy-ch*.5,0,cx,cy-ch*.3,cw*.6);
    hg.addColorStop(0,'rgba(160,190,140,.04)');hg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(cx,cy-ch*.3,cw*.6,0,6.28);ctx.fillStyle=hg;ctx.fill();
    // Falling leaves
    for(const l of this.leaves){const a=cl(l.life/2,0,1)*.55;ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.rot);
      ctx.fillStyle=hsl(l.hue,30,28,a);ctx.beginPath();
      ctx.moveTo(0,-l.size*.3);ctx.bezierCurveTo(l.size*.4,-l.size*.2,l.size*.3,l.size*.2,0,l.size*.3);ctx.bezierCurveTo(-l.size*.3,l.size*.15,-l.size*.35,-l.size*.15,0,-l.size*.3);
      ctx.fill();ctx.restore();}
  }
}

// ══════════════════════════════════════════
// VERY RARE: METEOR IMPACT (every 12-25 min)
// ══════════════════════════════════════════
class MeteorImpact{
  constructor(){this.phase='idle';this.timer=R(720,1500);this.time=0;this.x=0;this.y=0;this.ix=0;this.iy=0;this.trail=[];this.debris=[];this.craterAlpha=0;}
  update(dt,time,garden){
    if(this.phase==='idle'){this.timer-=dt;if(this.timer<=0){this.phase='fall';this.time=0;this.timer=R(720,1500);
      this.x=R(W*.1,W*.5);this.y=-30;this.ix=R(W*.3,W*.7);this.iy=R(HOR+40,H*.75);this.trail=[];this.debris=[];}return;}
    this.time+=dt;
    if(this.phase==='fall'){
      // Meteor falls from sky to impact point over 2s
      const t=Math.min(this.time/2,1);
      this.x=this.x+(this.ix-this.x)*t*t;this.y=-30+(this.iy+30)*t*t;
      // Trail
      if(Math.random()<dt*40)this.trail.push({x:this.x+R(-3,3),y:this.y+R(-3,3),life:R(.5,1.5),size:R(1,4)});
      for(const p of this.trail)p.life-=dt;this.trail=this.trail.filter(p=>p.life>0);
      if(this.time>=2){this.phase='impact';this.time=0;
        // Spawn debris
        for(let i=0;i<30;i++){const a=R(0,6.28),sp=R(30,150);
          this.debris.push({x:this.ix,y:this.iy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-R(20,80),life:R(1,4),size:R(1,5),hue:pick([15,25,35,40,45])});}
        // Destroy nearby flowers
        garden.flowers=garden.flowers.filter(f=>{const dx=f.x-this.ix,dy=f.y-this.iy;return dx*dx+dy*dy>120*120;});
      }
    }else if(this.phase==='impact'){
      // Explosion + shockwave
      for(const d of this.debris){d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=60*dt;d.life-=dt;}
      this.debris=this.debris.filter(d=>d.life>0);
      this.craterAlpha=Math.max(0,1-this.time/15);
      for(const p of this.trail)p.life-=dt;this.trail=this.trail.filter(p=>p.life>0);
      if(this.time>15){this.phase='idle';this.debris=[];this.trail=[];}
    }
  }
  draw(time){
    if(this.phase==='idle')return;
    // Trail
    for(const p of this.trail){const a=cl(p.life/.8,0,1);
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fillStyle=hsl(25,80,60,a*.6);ctx.fill();}
    // Falling meteor
    if(this.phase==='fall'){
      const s=4+this.time*3;
      // Glow
      const mg=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,s*4);
      mg.addColorStop(0,'rgba(255,200,100,.4)');mg.addColorStop(.5,'rgba(255,150,50,.1)');mg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath();ctx.arc(this.x,this.y,s*4,0,6.28);ctx.fillStyle=mg;ctx.fill();
      // Core
      ctx.beginPath();ctx.arc(this.x,this.y,s,0,6.28);ctx.fillStyle='rgba(255,240,200,.9)';ctx.fill();
      ctx.beginPath();ctx.arc(this.x,this.y,s*.5,0,6.28);ctx.fillStyle='rgba(255,255,255,.8)';ctx.fill();
    }
    // Impact flash + shockwave
    if(this.phase==='impact'&&this.time<2){
      const flash=Math.max(0,1-this.time/.5);
      if(flash>.01){ctx.fillStyle=`rgba(255,240,200,${flash*.2})`;ctx.fillRect(0,0,W,H);}
      // Shockwave ring
      const sw=ease.out(Math.min(this.time/1.5,1))*200;const swa=Math.max(0,1-this.time/1.5)*.4;
      ctx.beginPath();ctx.arc(this.ix,this.iy,sw,0,6.28);ctx.strokeStyle=`rgba(255,200,100,${swa})`;ctx.lineWidth=3;ctx.stroke();
    }
    // Crater
    if(this.craterAlpha>.01){
      ctx.beginPath();ctx.ellipse(this.ix,this.iy,35,15,0,0,6.28);ctx.fillStyle=`rgba(30,25,15,${this.craterAlpha*.5})`;ctx.fill();
      ctx.beginPath();ctx.ellipse(this.ix,this.iy,25,10,0,0,6.28);ctx.fillStyle=`rgba(20,15,8,${this.craterAlpha*.6})`;ctx.fill();
      // Scorched ring
      ctx.beginPath();ctx.ellipse(this.ix,this.iy,55,22,0,0,6.28);ctx.strokeStyle=`rgba(50,35,15,${this.craterAlpha*.25})`;ctx.lineWidth=8;ctx.stroke();
    }
    // Debris
    for(const d of this.debris){const a=cl(d.life/1.5,0,1);
      ctx.beginPath();ctx.arc(d.x,d.y,d.size*a,0,6.28);ctx.fillStyle=hsl(d.hue,70,50,a*.7);ctx.fill();
      if(d.size>2){ctx.beginPath();ctx.arc(d.x,d.y,d.size*2,0,6.28);ctx.fillStyle=hsl(d.hue,60,45,a*.08);ctx.fill();}}
  }
}

// ══════════════════════════════════════════
// ULTRA RARE: DEATH STAR (every 20-40 min)
// ══════════════════════════════════════════
class DeathStar{
  constructor(){this.phase='idle';this.timer=R(1200,2400);this.time=0;this.x=0;this.y=0;this.size=0;this.laserY=0;this.ashAlpha=0;this.shake=0;this.embers=[];}
  update(dt,time,garden){
    if(this.phase==='idle'){this.timer-=dt;if(this.timer<=0){this.phase='enter';this.time=0;this.timer=R(1200,2400);this.x=W*.8;this.y=HOR*.15;this.size=2;this.embers=[];}return;}
    this.time+=dt;
    if(this.phase==='enter'){
      // Grow from tiny dot to large sphere over 10s
      this.size=2+ease.out(Math.min(this.time/10,1))*65;
      this.x=W*.8-this.time*3;this.y=HOR*.15+Math.sin(this.time*.2)*5;
      if(this.time>10){this.phase='charge';this.time=0;}
    }else if(this.phase==='charge'){
      // Dish glows green, pulsing
      if(this.time>4){this.phase='fire';this.time=0;}
    }else if(this.phase==='fire'){
      // Laser shoots down to ground
      this.laserY=HOR*.3+ease.out(Math.min(this.time/.8,1))*(H-HOR*.3);
      this.shake=Math.max(0,(1-this.time/2))*6;
      if(this.time>.5){
        // Kill all flowers
        for(const f of garden.flowers){if(f.phase<5){f.phase=5;f.pt=0;f.wiltDur=.5;f.opacity=0;}}
        garden.flowers=[];
      }
      if(this.time>2){this.phase='ash';this.time=0;this.ashAlpha=1;}
    }else if(this.phase==='ash'){
      // Scorched ground, embers
      this.ashAlpha=Math.max(0,1-this.time/12);
      if(Math.random()<dt*8&&this.embers.length<40){
        this.embers.push({x:R(0,W),y:R(HOR+10,H),vx:R(-5,5),vy:R(-15,-5),life:R(1,3),size:R(1,3)});
      }
      for(const e of this.embers){e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;}
      this.embers=this.embers.filter(e=>e.life>0);
      if(this.time>12){this.phase='leave';this.time=0;}
    }else if(this.phase==='leave'){
      this.x+=25*dt;this.size=Math.max(2,this.size-dt*5);
      if(this.time>8){this.phase='idle';this.embers=[];}
    }
  }
  draw(time){
    if(this.phase==='idle')return;
    const sx=this.shake>0?(Math.random()-.5)*this.shake:0;
    const sy=this.shake>0?(Math.random()-.5)*this.shake:0;
    if(sx||sy){ctx.save();ctx.translate(sx,sy);}
    // Ash overlay on ground
    if(this.ashAlpha>.01){
      ctx.fillStyle=`rgba(20,18,15,${this.ashAlpha*.6})`;ctx.fillRect(0,HOR,W,H-HOR);
      // Scorched patches
      if(!this._ashPatches){this._ashPatches=[];for(let i=0;i<8;i++)this._ashPatches.push({x:W*(.1+i*.11),y:HOR+R(20,80),w:R(30,60),h:R(10,25)});}
      ctx.fillStyle=`rgba(40,30,20,${this.ashAlpha*.3})`;
      for(const p of this._ashPatches){ctx.beginPath();ctx.ellipse(p.x,p.y,p.w,p.h,0,0,6.28);ctx.fill();}
      // Embers
      for(const e of this.embers){const a=cl(e.life/1,0,1);
        ctx.beginPath();ctx.arc(e.x,e.y,e.size,0,6.28);ctx.fillStyle=hsl(pick([15,25,35]),80,55,a*.7);ctx.fill();
        ctx.beginPath();ctx.arc(e.x,e.y,e.size*2,0,6.28);ctx.fillStyle=hsl(20,60,50,a*.1);ctx.fill();}
    }
    // Death Star sphere
    if(this.phase!=='ash'||this.time<3){
      const ds=this.size,dx=this.x,dy=this.y;
      const fadeOut=this.phase==='leave'?Math.max(0,1-this.time/5):1;
      ctx.save();ctx.globalAlpha=fadeOut;
      // Base sphere
      const sg=ctx.createRadialGradient(dx-ds*.15,dy-ds*.15,0,dx,dy,ds);
      sg.addColorStop(0,'#8a8a8a');sg.addColorStop(.3,'#6a6a6a');sg.addColorStop(.7,'#4a4a4a');sg.addColorStop(1,'#2a2a2a');
      ctx.beginPath();ctx.arc(dx,dy,ds,0,6.28);ctx.fillStyle=sg;ctx.fill();
      // Equatorial trench (dark band)
      if(ds>15){
        ctx.save();ctx.beginPath();ctx.arc(dx,dy,ds,0,6.28);ctx.clip();
        ctx.fillStyle='rgba(15,15,15,.4)';ctx.fillRect(dx-ds,dy-ds*.06,ds*2,ds*.12);
        // Surface detail lines
        ctx.strokeStyle='rgba(30,30,30,.2)';ctx.lineWidth=.5;ctx.beginPath();
        for(let i=0;i<6;i++){const ly=dy-ds*.8+i*ds*.32;ctx.moveTo(dx-ds,ly);ctx.lineTo(dx+ds,ly);}
        for(let i=0;i<6;i++){const a=i*.5+.3;ctx.moveTo(dx+Math.cos(a)*ds,dy+Math.sin(a)*ds*.3);ctx.lineTo(dx+Math.cos(a+.3)*ds,dy-Math.sin(a+.3)*ds*.3);}
        ctx.stroke();
        // Superlaser dish (concave circle in upper-right)
        const dishX=dx+ds*.35,dishY=dy-ds*.25,dishR=ds*.22;
        ctx.beginPath();ctx.arc(dishX,dishY,dishR,0,6.28);
        ctx.fillStyle='rgba(10,10,10,.5)';ctx.fill();
        ctx.beginPath();ctx.arc(dishX,dishY,dishR*.6,0,6.28);
        ctx.fillStyle='rgba(5,5,5,.6)';ctx.fill();
        ctx.restore();
        // Charge glow
        if(this.phase==='charge'){
          const cp=Math.min(this.time/4,1);const pulse=.5+.5*Math.sin(this.time*6);
          const cg=ctx.createRadialGradient(dishX,dishY,0,dishX,dishY,dishR*2);
          cg.addColorStop(0,`rgba(100,255,100,${cp*pulse*.4})`);
          cg.addColorStop(.5,`rgba(50,200,50,${cp*pulse*.15})`);
          cg.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath();ctx.arc(dishX,dishY,dishR*2,0,6.28);ctx.fillStyle=cg;ctx.fill();
        }
        // Laser beam
        if(this.phase==='fire'){
          const la=Math.min(this.time/.3,1);
          const lx=dishX,ly2=dishY;
          // Main beam
          ctx.save();ctx.globalAlpha=la;
          const lg=ctx.createLinearGradient(lx-8,0,lx+8,0);
          lg.addColorStop(0,'rgba(0,100,0,0)');lg.addColorStop(.3,`rgba(50,255,50,.3)`);
          lg.addColorStop(.5,`rgba(150,255,150,.6)`);lg.addColorStop(.7,`rgba(50,255,50,.3)`);
          lg.addColorStop(1,'rgba(0,100,0,0)');
          ctx.fillStyle=lg;ctx.fillRect(lx-15,ly2,30,this.laserY-ly2);
          // Bright core
          ctx.fillStyle=`rgba(200,255,200,${la*.5})`;ctx.fillRect(lx-2,ly2,4,this.laserY-ly2);
          // Impact glow
          if(this.laserY>HOR){
            const ig=ctx.createRadialGradient(lx,this.laserY,0,lx,this.laserY,80*la);
            ig.addColorStop(0,`rgba(150,255,100,${la*.3})`);ig.addColorStop(.5,`rgba(100,200,50,${la*.1})`);
            ig.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath();ctx.arc(lx,this.laserY,80*la,0,6.28);ctx.fillStyle=ig;ctx.fill();
            // Spreading destruction wave
            const spread=ease.out(Math.min((this.time-.3)/1.5,1))*W;
            ctx.fillStyle=`rgba(255,200,100,${la*.08})`;ctx.fillRect(lx-spread,HOR,spread*2,H-HOR);
          }
          ctx.restore();
        }
      }
      // Outline glow
      ctx.beginPath();ctx.arc(dx,dy,ds+1,0,6.28);ctx.strokeStyle='rgba(100,100,120,.15)';ctx.lineWidth=1;ctx.stroke();
      ctx.restore();
    }
    if(sx||sy)ctx.restore();
  }
}

// ══════════════════════════════════════════
// GARDEN ORCHESTRATOR
// ══════════════════════════════════════════
class Garden{
  constructor(){
    this.flowers=[];this.particles=[];this.butterflies=[];this.bees=[];this.grass=[];this.waves=[];this.time=0;
    this.maxFlowers=55;

    // Sky
    this.starField=new StarField();this.starBloom=new StarBloom();this.shootingStars=new ShootingStars();
    this.moon=new Moon();this.moonBiker=new MoonBiker();this.cometSystem=new CometSystem();this.supernovaSystem=new SupernovaSystem();
    this.nebulaWisps=new NebulaWisps();this.birdFlock=new BirdFlock();this.aurora=new Aurora();this.rainbow=new Rainbow();
    this.constellations=new Constellations();this.milkyWay=new MilkyWay();this.satellite=new Satellite();
    this.planet=new PlanetTransit();this.binaryStars=new BinaryStars();this.wishingStar=new WishingStar();this.northStar=new NorthStarPulse();

    // Ground
    this.diglett=new Diglett();this.fireflies=new Fireflies();this.dandelionBursts=new DandelionBursts();
    this.glowMushrooms=new GlowMushrooms();this.pond=new Pond();this.spiderWeb=new SpiderWeb();
    this.cloverPatch=new CloverPatch();this.fallenLog=new FallenLog();
    this.bgTrees=new BackgroundTrees();this.bigTree=new BigTree();

    // Creatures
    this.owl=new Owl();this.frogSystem=new FrogSystem();this.snailSystem=new SnailSystem();
    this.ladybugSystem=new LadybugSystem();this.cat=new CatSilhouette();this.dragonflySystem=new DragonflySystem();this.wormSystem=new WormSystem();

    // Weather
    this.rainEvent=new RainEvent();this.lightning=new DistantLightning();this.fogBank=new FogBank();this.windGust=new WindGust();

    // Rare events
    this.blossomStorm=new BlossomStorm();
    this.grandRose=new GrandRose();this.giantBloom=new GiantBloom();
    this.lanternFestival=new LanternFestival();
    this.willOWisp=new WillOWisp();
    this.hotAirBalloon=new HotAirBalloon();
    this.skyWhale=new SkyWhale();
    this.greatBloom=new GreatBloom();
    this.eclipse=new Eclipse();
    this.ufoSystem=new UFO();
    this.snowfall=new Snowfall();
    this.paperLantern=new PaperLanternSingle();this.fireflySwarm=new FireflySwarm();
    this.distantTrain=new DistantTrain();this.musicNotes=new MusicNotes();this.lighthouse=new Lighthouse();this.bannerPlane=new BannerPlane();
    this.meteorImpact=new MeteorImpact();this.deathStar=new DeathStar();

    this.ambientTimer=0;this.ambientInterval=R(1.5,3);
    this.waveTimer=R(3,7);
    this.meteorTimer=R(100,200);
    this.flowerWaveTimer=R(60,120);

    this._hillsOC=null;this._mistR=[];for(let i=0;i<5;i++)this._mistR.push(R(80,220));
    this._skyFrame=0;this._skyGrad=null;this._skyC=0;
    this.initGrass();
    for(let i=0;i<30;i++)this.particles.push(new Particle());
    for(let i=0;i<4;i++)this.particles.push(new Particle('seed'));
    for(let i=0;i<5;i++)this.particles.push(new Particle('mote'));
    for(let i=0;i<3;i++)this.butterflies.push(new Butterfly());
    for(let i=0;i<4;i++)this.bees.push(new Bee());

    this.skyPhase=R(0,6.28);

    // Dense initial meadow
    for(let i=0;i<28;i++){
      let x,y;do{x=R(W*.03,W*.97);y=R(HOR+8,H*.95);}while(this._inPond(x,y));
      const ds=.3+(y-HOR)/(H-HOR)*.9;
      const f=new Flower(x,y,ds*R(.6,1.35));
      const skip=R(2,22);for(let s=0;s<skip/.016;s++)f.update(.016,s*.016);
      this.flowers.push(f);
    }
  }

  _inPond(x,y){return this.pond.contains(x,y);}
  initGrass(){this.grass=[];for(let x=0;x<W;x+=R(5,12)){if(Math.random()>.3)this.grass.push(new GrassBlade(x));}this._renderHills();}

  update(dt){
    this.time+=dt;
    // Ambient spawn
    this.ambientTimer+=dt;
    if(this.ambientTimer>=this.ambientInterval&&this.flowers.length<this.maxFlowers){
      this.ambientTimer=0;this.ambientInterval=R(1.2,3);
      const x=R(W*.05,W*.95),y=R(HOR+10,H*.92);
      if(!this._inPond(x,y)){const ds=.3+(y-HOR)/(H-HOR)*.9;
      this.flowers.push(new Flower(x,y,ds*R(.65,1.3)));}
    }
    // Normal waves
    this.waveTimer-=dt;
    if(this.waveTimer<=0){if(this.flowers.length<this.maxFlowers*.7)this.waves.push(new WaveEvent());this.waveTimer=R(10,25);}
    // Rare flower wave
    this.flowerWaveTimer-=dt;
    if(this.flowerWaveTimer<=0){this.waves.push(new WaveEvent('flower_wave'));this.flowerWaveTimer=R(70,150);}
    // Meteor shower
    this.meteorTimer-=dt;
    if(this.meteorTimer<=0){this.shootingStars.shower();this.meteorTimer=R(60,120);}

    for(const w of this.waves)w.update(dt,this);this.waves=this.waves.filter(w=>!w.done);
    for(const f of this.flowers)f.update(dt,this.time);this.flowers=this.flowers.filter(f=>!f.isDead);this.flowers.sort((a,b)=>a.y-b.y);

    // Sky
    this.starBloom.update(dt,this.time);this.shootingStars.update(dt);this.moon.update(dt);this.moonBiker.update(dt,this.moon);
    this.cometSystem.update(dt,this.time);this.supernovaSystem.update(dt);
    this.birdFlock.update(dt,this.time);this.aurora.update(dt,this.time);this.rainbow.update(dt);
    this.satellite.update(dt);this.planet.update(dt);this.wishingStar.update(dt);this.northStar.update(dt);

    // Ground
    for(const p of this.particles)p.update(dt,this.time);
    for(const b of this.butterflies)b.update(dt,this.time);
    for(const b of this.bees)b.update(dt,this.time);
    this.diglett.update(dt,this.time);this.fireflies.update(dt,this.time);this.dandelionBursts.update(dt,this.time);
    this.glowMushrooms.update(dt);this.pond.update(dt,this.time);this.spiderWeb.update(dt);this.wormSystem.update(dt);this.bigTree.update(dt,this.time);

    // Creatures
    this.owl.update(dt);this.frogSystem.update(dt);this.snailSystem.update(dt);
    this.ladybugSystem.update(dt,this.time);this.cat.update(dt,this.time);this.dragonflySystem.update(dt,this.time);

    // Weather
    this.rainEvent.update(dt);this.lightning.update(dt);this.fogBank.update(dt);this.windGust.update(dt);

    // Rare events
    this.blossomStorm.update(dt,this.time);
    this.grandRose.update(dt,this.time,this);this.giantBloom.update(dt,this.time,this);
    this.lanternFestival.update(dt,this.time);
    this.willOWisp.update(dt,this.time);
    this.hotAirBalloon.update(dt,this.time);
    this.skyWhale.update(dt,this.time);
    this.greatBloom.update(dt,this.time,this);
    this.eclipse.update(dt);
    this.ufoSystem.update(dt,this.time);
    this.snowfall.update(dt,this.time);
    this.paperLantern.update(dt,this.time);this.fireflySwarm.update(dt,this.time);
    this.distantTrain.update(dt);this.musicNotes.update(dt);this.lighthouse.update(dt);this.bannerPlane.update(dt);
    this.meteorImpact.update(dt,this.time,this);this.deathStar.update(dt,this.time,this);
  }

  draw(){
    // SKY
    this.drawSky();
    this.milkyWay.draw();
    this.nebulaWisps.draw(this.time);
    this.constellations.draw(this.time);
    this.aurora.draw(this.time);
    this.starField.draw(this.time);
    this.binaryStars.draw(this.time);
    this.starBloom.draw(this.time);
    this.northStar.draw();
    this.cometSystem.draw();
    this.supernovaSystem.draw();
    this.shootingStars.draw();
    this.wishingStar.draw();
    this.satellite.draw();
    this.planet.draw();
    this.moon.draw();this.moonBiker.draw();
    this.rainbow.draw();
    this.skyWhale.draw(this.time);
    this.hotAirBalloon.draw(this.time);
    this.ufoSystem.draw(this.time);
    this.birdFlock.draw();
    this.bannerPlane.draw();
    this.distantTrain.draw();

    // GROUND
    this.drawHills();
    this.bgTrees.draw();
    this.bigTree.drawTrunk();
    this.pond.draw(this.time,this.moon);
    this.fallenLog.draw();
    this.cloverPatch.draw(this.time);
    for(const g of this.grass)g.draw(this.time);
    for(const p of this.particles){if(p.type==='pollen')p.draw(this.time);}
    for(const f of this.flowers)f.draw(this.time);
    this.diglett.draw(this.time);
    this.wormSystem.draw();
    this.spiderWeb.draw(this.time);
    for(const p of this.particles){if(p.type!=='pollen')p.draw(this.time);}
    this.glowMushrooms.draw(this.time);
    this.dandelionBursts.draw(this.time);
    for(const b of this.butterflies)b.draw();
    for(const b of this.bees)b.draw();
    this.owl.draw();
    this.frogSystem.draw();
    this.snailSystem.draw();
    this.ladybugSystem.draw();
    this.cat.draw();
    this.dragonflySystem.draw(this.time);
    this.bigTree.drawCanopy(this.time);
    this.fireflies.draw(this.time);
    this.fireflySwarm.draw(this.time);
    this.willOWisp.draw(this.time);
    this.musicNotes.draw();
    this.blossomStorm.draw();
    this.lanternFestival.draw(this.time);
    this.paperLantern.draw(this.time);
    this.drawMist();
    this.fogBank.draw();
    this.lighthouse.draw();
    this.drawSunlight();
    // Post-processing overlays (on top of everything)
    this.meteorImpact.draw(this.time);
    this.deathStar.draw(this.time);
    this.eclipse.draw();
    this.lightning.draw();
    this.snowfall.draw();
    this.rainEvent.draw();
    // Cursor firefly
    if(mouseX>0&&mouseY>0){const pulse=.5+.5*Math.sin(this.time*4);ctx.beginPath();ctx.arc(mouseX,mouseY,8,0,6.28);ctx.fillStyle=`rgba(180,220,80,${pulse*.06})`;ctx.fill();ctx.beginPath();ctx.arc(mouseX,mouseY,2,0,6.28);ctx.fillStyle=`rgba(200,240,100,${pulse*.5})`;ctx.fill();}
  }

  drawSky(){
    this._skyFrame++;
    if(!this._skyGrad||this._skyFrame%8===0){const c=Math.sin(this.time*.006+this.skyPhase)*.5+.5;this._skyC=c;
    const sg=ctx.createLinearGradient(0,0,0,HOR+30);
    sg.addColorStop(0,hsl(228+c*10,35+c*10,6+c*5));sg.addColorStop(.25,hsl(235+c*8,30+c*8,10+c*8));
    sg.addColorStop(.5,hsl(250+c*10,25+c*12,18+c*12));sg.addColorStop(.75,hsl(280-c*40,30+c*15,28+c*15));
    sg.addColorStop(.92,hsl(35+c*10,40+c*15,28+c*12));sg.addColorStop(1,hsl(30+c*8,35+c*12,20+c*8));
    this._skyGrad=sg;}
    ctx.fillStyle=this._skyGrad;ctx.fillRect(0,0,W,HOR+30);
    const c=this._skyC;const sunX=W*(.55+Math.sin(this.time*.002)*.15);
    const gg=ctx.createRadialGradient(sunX,HOR,0,sunX,HOR,HOR*.6);
    gg.addColorStop(0,`rgba(255,210,130,${.12+c*.06})`);gg.addColorStop(.3,`rgba(255,180,100,${.06+c*.03})`);gg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gg;ctx.fillRect(0,0,W,HOR+30);
  }

  drawHills(){if(this._hillsOC)ctx.drawImage(this._hillsOC,0,0,W,H);}
  _renderHills(){const d=window.devicePixelRatio||1;this._hillsOC=document.createElement('canvas');this._hillsOC.width=W*d;this._hillsOC.height=H*d;const hc=this._hillsOC.getContext('2d');hc.setTransform(d,0,0,d,0,0);const layers=[{yOff:-30,col:[130,22,14],alpha:.55,freq:.0005},{yOff:-12,col:[120,26,12],alpha:.7,freq:.001},{yOff:0,col:[110,32,10],alpha:.88,freq:.0015}];for(const l of layers){hc.beginPath();hc.moveTo(0,H);for(let x=0;x<=W;x+=4){const y=groundY(x)+l.yOff+noise.get(x*l.freq+hillSeed+l.yOff,0)*25;hc.lineTo(x,y);}hc.lineTo(W,H);hc.closePath();const hg=hc.createLinearGradient(0,HOR-20,0,H);hg.addColorStop(0,hsl(l.col[0],l.col[1],l.col[2]+12,l.alpha));hg.addColorStop(.5,hsl(l.col[0]-5,l.col[1]+5,l.col[2],l.alpha));hg.addColorStop(1,hsl(l.col[0]-10,l.col[1]+8,l.col[2]-8,l.alpha));hc.fillStyle=hg;hc.fill();}}

  drawMist(){for(let i=0;i<5;i++){const x=W*.5+noise.fbm(i*3+this.time*.025,0,2)*W*.6,y=HOR+30+i*20+noise.get(i*7,this.time*.04)*20,r=this._mistR[i];const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(180,200,160,${.018+Math.sin(this.time*.4+i)*.006})`);g.addColorStop(1,'rgba(180,200,160,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}}

  drawSunlight(){const c=Math.sin(this.time*.006+this.skyPhase)*.5+.5;const sunX=W*(.55+Math.sin(this.time*.002)*.15);ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<3;i++){const angle=(.25+i*.18)+Math.sin(this.time*.015+i)*.04;const len=H*1.2;const x2=sunX+Math.cos(angle)*len,y2=HOR+Math.sin(angle)*len;const rg=ctx.createLinearGradient(sunX,HOR,x2,y2);rg.addColorStop(0,`rgba(255,210,130,${.01+c*.006})`);rg.addColorStop(.4,`rgba(255,190,90,${.004})`);rg.addColorStop(1,'rgba(0,0,0,0)');ctx.beginPath();ctx.moveTo(sunX,HOR);const sp=35+i*20;ctx.lineTo(x2-sp,y2);ctx.lineTo(x2+sp,y2);ctx.closePath();ctx.fillStyle=rg;ctx.fill();}ctx.restore();}
}

// ── MAIN LOOP ──
const garden=new Garden();let lastTime=performance.now();
let _fpsSamples=[],_fpsCheck=0;
function frame(now){
  const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;
  if(dt>0)_fpsSamples.push(1/dt);if(_fpsSamples.length>90)_fpsSamples.shift();
  if(now-_fpsCheck>4000&&_fpsSamples.length>30){_fpsCheck=now;
    const avg=_fpsSamples.reduce((a,b)=>a+b,0)/_fpsSamples.length;
    if(avg<22){
      garden.maxFlowers=Math.max(18,garden.maxFlowers-8);
      if(garden.starField.stars.length>80)garden.starField.stars.length=Math.max(80,garden.starField.stars.length-40);
      while(garden.particles.length>15)garden.particles.pop();
      while(garden.grass.length>80)garden.grass.pop();
      while(garden.fireflies.flies.length>4)garden.fireflies.flies.pop();
      garden.glowMushrooms.clusters=garden.glowMushrooms.clusters.slice(0,1);
      garden.spiderWeb.webs=[];garden.frogSystem.frogs=[];garden.snailSystem.snails=[];
      garden.ladybugSystem.bugs=[];garden.dragonflySystem.flies=[];
      if(garden.bigTree.canopy.length>18)garden.bigTree.canopy.length=18;
      garden.pond.lilies=garden.pond.lilies.slice(0,4);garden.pond.reeds=garden.pond.reeds.slice(0,6);
    }else if(avg<30){
      garden.maxFlowers=Math.max(25,garden.maxFlowers-3);
    }
  }
  garden.update(dt);garden.draw();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.addEventListener('resize',()=>{resize();garden.initGrass();garden._skyGrad=null;});
// ── INTERACTIVE ──
let mouseX=-100,mouseY=-100;
canvas.addEventListener('mousemove',e=>{mouseX=e.clientX;mouseY=e.clientY;});
canvas.addEventListener('mouseleave',()=>{mouseX=-100;mouseY=-100;});
canvas.addEventListener('click',e=>{const x=e.clientX,y=e.clientY;if(y>HOR+10&&!garden._inPond(x,y)){const ds=.3+(y-HOR)/(H-HOR)*.9;garden.flowers.push(new Flower(x,y,ds*R(.65,1.3)));}});
canvas.addEventListener('touchstart',e=>{const t=e.touches[0];mouseX=t.clientX;mouseY=t.clientY;},{passive:true});
canvas.addEventListener('touchmove',e=>{const t=e.touches[0];mouseX=t.clientX;mouseY=t.clientY;},{passive:true});
canvas.addEventListener('touchend',e=>{if(mouseY>HOR+10&&!garden._inPond(mouseX,mouseY)){const ds=.3+(mouseY-HOR)/(H-HOR)*.9;garden.flowers.push(new Flower(mouseX,mouseY,ds*R(.65,1.3)));}mouseX=-100;mouseY=-100;},{passive:true});
// ── AUTO-RELOAD ON DEPLOY ──
(function(){let h;function djb2(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return h;}const base=location.href.split('?')[0].replace(/\/[^\/]*$/,'/');setInterval(async()=>{try{const r=await fetch(base+'script.js?_='+Date.now(),{cache:'no-store'});const t=await r.text();const nh=djb2(t);if(h===undefined)h=nh;else if(nh!==h)location.reload();}catch(e){}},60000);})();
