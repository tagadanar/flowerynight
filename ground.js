
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
    // Animated water shimmer waves (reduced from 6 to 4)
    ctx.globalAlpha=.06;
    for(let i=0;i<4;i++){
      const wy=cy-rh+i*rh*.5+Math.sin(time*.4+i*1.3)*3;
      ctx.beginPath();ctx.moveTo(cx-rw,wy);
      for(let x=-rw;x<=rw;x+=12){ctx.lineTo(cx+x,wy+Math.sin(x*.04+time*1.2+i)*2.5);}
      ctx.lineTo(cx+rw,wy+rh*.3);ctx.lineTo(cx-rw,wy+rh*.3);ctx.closePath();
      ctx.fillStyle=i%2===0?'rgba(150,180,220,.8)':'rgba(120,150,200,.5)';ctx.fill();
    }
    ctx.globalAlpha=1;
    // Star reflections
    for(let i=0;i<6;i++){
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
  constructor(){this.patches=[];for(let i=0;i<RI(1,3);i++){const clovers=[],cx=R(W*.05,W*.95),cy=R(HOR+30,H*.9);for(let j=0;j<RI(5,12);j++)clovers.push({x:cx+R(-20,20),y:cy+R(-8,8),size:R(2,3.5),rot:R(0,6.28),four:Math.random()<.02});this.patches.push(clovers);}this._oc=null;}
  draw(time){for(const patch of this.patches){for(const c of patch){const s=c.size;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.strokeStyle='rgba(60,120,40,.4)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,s*1.5);ctx.stroke();const leaves=c.four?4:3;ctx.fillStyle=c.four?'rgba(50,160,50,.6)':'rgba(50,120,40,.45)';for(let i=0;i<leaves;i++){ctx.save();ctx.rotate(i*(6.28/leaves));ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-s*.3,-s*.2,-s*.4,-s*.7,0,-s*.6);ctx.bezierCurveTo(s*.4,-s*.7,s*.3,-s*.2,0,0);ctx.fill();ctx.restore();}ctx.restore();}}}
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
    this._oc=null;
  }
  _cache(){
    const w=this.w,t=this.th,pad=30;const cw=w+pad*2,ch=t*2+pad*2;
    const d=Math.min(window.devicePixelRatio||1,2);
    this._oc=document.createElement('canvas');this._oc.width=Math.ceil(cw*d);this._oc.height=Math.ceil(ch*d);
    const c=this._oc.getContext('2d');c.setTransform(d,0,0,d,0,0);c.translate(cw/2,ch/2);c.rotate(this.rot);
    c.fillStyle='rgba(15,10,5,.12)';c.beginPath();c.ellipse(3,t*.6,w*.53,t*.6,.02,0,6.28);c.fill();
    c.beginPath();c.moveTo(-w*.5,-t*.35);c.bezierCurveTo(-w*.3,-t*.4,-w*.1,-t*.32,0,-t*.35);c.bezierCurveTo(w*.15,-t*.38,w*.35,-t*.33,w*.45,-t*.36);c.quadraticCurveTo(w*.55,-t*.15,w*.5,t*.1);c.bezierCurveTo(w*.35,t*.35,w*.1,t*.32,0,t*.35);c.bezierCurveTo(-w*.2,t*.38,-w*.4,t*.32,-w*.5,t*.36);c.quadraticCurveTo(-w*.58,t*.12,-w*.53,-t*.08);c.closePath();
    const lg=c.createLinearGradient(0,-t*1.2,0,t*1.2);lg.addColorStop(0,'#7a5a28');lg.addColorStop(.25,'#6b4a1e');lg.addColorStop(.5,'#5e4018');lg.addColorStop(.75,'#503514');lg.addColorStop(1,'#3e2a0e');
    c.fillStyle=lg;c.fill();c.strokeStyle='rgba(35,25,10,.25)';c.lineWidth=.7;c.stroke();
    c.lineCap='round';for(const b of this.bark){c.strokeStyle='rgba(30,20,8,.18)';c.lineWidth=b.w;c.beginPath();c.moveTo(b.ox,-t*.33);c.bezierCurveTo(b.ox+b.c1,0,b.ox+b.w*.3,t*.15,b.ox+b.w,t*.33);c.stroke();}
    for(const cr of this.cracks){c.strokeStyle='rgba(20,14,5,.2)';c.lineWidth=.8;c.beginPath();c.moveTo(cr.ox,-t*.15);c.bezierCurveTo(cr.ox+cr.len*.3,-t*.1+cr.ang*5,cr.ox+cr.len*.7,cr.ang*8,cr.ox+cr.len,cr.ang*12);c.stroke();}
    for(const k of this.knots){c.fillStyle='rgba(30,20,10,.25)';c.beginPath();c.ellipse(k.ox,0,k.sz,k.sz*.75,.1,0,6.28);c.fill();c.strokeStyle='rgba(50,35,15,.2)';c.lineWidth=.4;for(let r=k.sz*.2;r<k.sz;r+=k.sz*.2){c.beginPath();c.ellipse(k.ox,0,r,r*.75,0,0,6.28);c.stroke();}c.fillStyle='rgba(15,10,5,.2)';c.beginPath();c.ellipse(k.ox,0,k.sz*.25,k.sz*.2,0,0,6.28);c.fill();}
    c.beginPath();c.ellipse(-w*.51,0,t*.5,t*.55,0,0,6.28);const eg=c.createRadialGradient(-w*.51,0,0,-w*.51,0,t*.5);eg.addColorStop(0,'#d4b070');eg.addColorStop(.2,'#c4a060');eg.addColorStop(.5,'#a88548');eg.addColorStop(.8,'#8a6a35');eg.addColorStop(1,'#6a5025');c.fillStyle=eg;c.fill();c.strokeStyle='rgba(50,35,15,.3)';c.lineWidth=.6;c.stroke();
    c.strokeStyle='rgba(60,42,18,.15)';c.lineWidth=.3;for(let r=t*.08;r<t*.48;r+=t*.06){c.beginPath();c.ellipse(-w*.51,0,r,r*1.1,0,0,6.28);c.stroke();}
    c.fillStyle='rgba(140,110,60,.2)';c.beginPath();c.arc(-w*.51,0,t*.06,0,6.28);c.fill();
    c.beginPath();c.moveTo(w*.44,-t*.35);c.lineTo(w*.48,-t*.5);c.lineTo(w*.46,-t*.42);c.lineTo(w*.52,-t*.55);c.lineTo(w*.5,-t*.35);c.fillStyle='#5e4018';c.fill();
    for(const st of this.stubs){const sy=st.side*t*.3;c.fillStyle='#4a3518';c.beginPath();c.moveTo(st.ox-st.w*.5,sy);c.lineTo(st.ox-st.w*.3,sy+st.side*-st.h);c.lineTo(st.ox+st.w*.3,sy+st.side*-st.h*.85);c.lineTo(st.ox+st.w*.5,sy);c.fill();c.beginPath();c.ellipse(st.ox,sy+st.side*-st.h*.9,st.w*.4,st.w*.3,0,0,6.28);c.fillStyle='rgba(160,120,60,.3)';c.fill();}
    for(const m of this.moss){c.beginPath();c.ellipse(m.ox,-t*.33+m.szh*.2,m.sz,m.szh,m.r,0,6.28);c.fillStyle=hsl(m.hue,42,32,.5);c.fill();c.beginPath();c.ellipse(m.ox,-t*.33+m.szh*.1,m.sz*.7,m.szh*.5,m.r,0,6.28);c.fillStyle=hsl(m.hue+10,38,38,.3);c.fill();}
    for(const s of this.shrooms){const ss=s.sz,sy=s.side*t*.32;c.fillStyle=hsl(s.hue,22,60,.5);c.beginPath();c.moveTo(s.ox-ss*.08,sy);c.lineTo(s.ox-ss*.05,sy+s.side*-ss*.5);c.lineTo(s.ox+ss*.05,sy+s.side*-ss*.5);c.lineTo(s.ox+ss*.08,sy);c.fill();c.beginPath();c.ellipse(s.ox,sy+s.side*-ss*.5,ss*.55,ss*.3,0,s.side>0?Math.PI:0,s.side>0?0:Math.PI);c.fillStyle=hsl(s.hue,28,50,.6);c.fill();}
    this._cw=cw;this._ch=ch;
  }
  draw(){if(!this._oc)this._cache();ctx.drawImage(this._oc,this.x-this._cw/2,this.y-this._ch/2,this._cw,this._ch);}
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
