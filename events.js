
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
  constructor(){this.active=false;this.timer=R(360,600);this.flakes=[];this.time=0;this.duration=0;}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(360,600);
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
// VERY RARE: METEOR IMPACT (every 12-25 min)
// ══════════════════════════════════════════
class MeteorImpact{
  constructor(){this.phase='idle';this.timer=R(360,540);this.time=0;this.x=0;this.y=0;this.ix=0;this.iy=0;this.trail=[];this.debris=[];this.fire=[];this.craterAlpha=0;this.shake=0;}
  update(dt,time,garden){
    if(this.phase==='idle'){this.timer-=dt;if(this.timer<=0){this.phase='fall';this.time=0;this.timer=R(360,540);
      this.startX=R(W*.05,W*.4);this.x=this.startX;this.y=-50;this.ix=R(W*.25,W*.7);this.iy=R(HOR+50,H*.75);this.trail=[];this.debris=[];this.fire=[];this._ashPatches=null;}return;}
    this.time+=dt;
    if(this.phase==='fall'){
      const t=Math.min(this.time/2.5,1);
      this.x=this.startX+(this.ix-this.startX)*t*t;this.y=-50+(this.iy+50)*t*t;
      // Dense fiery trail
      for(let i=0;i<3;i++)if(Math.random()<dt*50)this.trail.push({x:this.x+R(-4,4),y:this.y+R(-4,4),vx:R(-15,15),vy:R(-10,5),life:R(.4,1.8),size:R(1,6),hue:pick([10,20,30,40,50])});
      for(const p of this.trail){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}this.trail=this.trail.filter(p=>p.life>0);
      // Sky turns orange as meteor approaches
      if(this.time>=2.5){this.phase='impact';this.time=0;this.shake=12;
        // Massive debris explosion
        for(let i=0;i<60;i++){const a=R(0,6.28),sp=R(40,250);
          this.debris.push({x:this.ix,y:this.iy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-R(30,120),life:R(1,5),size:R(1,7),hue:pick([10,20,30,40,50]),glow:Math.random()>.5});}
        // Ground fire
        for(let i=0;i<20;i++)this.fire.push({x:this.ix+R(-80,80),y:this.iy+R(-20,20),size:R(8,25),life:R(3,8),hue:pick([10,20,30,40]),seed:R(0,1000)});
        // Destroy flowers in large radius
        garden.flowers=garden.flowers.filter(f=>{const dx=f.x-this.ix,dy=f.y-this.iy;return dx*dx+dy*dy>180*180;});
      }
    }else if(this.phase==='impact'){
      this.shake=Math.max(0,this.shake-dt*4);
      for(const d of this.debris){d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=80*dt;d.life-=dt;}
      this.debris=this.debris.filter(d=>d.life>0);
      for(const f of this.fire){f.life-=dt;f.size*=.995;}
      this.fire=this.fire.filter(f=>f.life>0);
      // Spawn embers from fires
      if(this.time<6&&Math.random()<dt*15)this.trail.push({x:this.ix+R(-100,100),y:this.iy+R(-30,10),vx:R(-3,3),vy:R(-20,-8),life:R(1,3),size:R(1,3),hue:30});
      for(const p of this.trail){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}this.trail=this.trail.filter(p=>p.life>0);
      this.craterAlpha=Math.max(0,1-this.time/18);
      if(this.time>18){this.phase='idle';this.debris=[];this.trail=[];this.fire=[];}
    }
  }
  draw(time){
    if(this.phase==='idle')return;
    // Screen shake
    const sx=this.shake>0?(Math.random()-.5)*this.shake:0;
    const sy=this.shake>0?(Math.random()-.5)*this.shake:0;
    if(sx||sy){ctx.save();ctx.translate(sx,sy);}
    // Trail particles
    for(const p of this.trail){const a=cl(p.life/.8,0,1);
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fillStyle=hsl(p.hue||25,85,55,a*.7);ctx.fill();
      if(p.size>3){ctx.beginPath();ctx.arc(p.x,p.y,p.size*1.5,0,6.28);ctx.fillStyle=hsl(p.hue||25,70,50,a*.12);ctx.fill();}}
    // Falling meteor
    if(this.phase==='fall'){
      const s=5+this.time*4;const t=this.time/2.5;
      // Sky warning tint (grows as meteor approaches)
      ctx.fillStyle=`rgba(255,150,50,${t*.04})`;ctx.fillRect(0,0,W,H);
      // Huge outer glow
      const mg=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,s*6);
      mg.addColorStop(0,'rgba(255,220,100,.5)');mg.addColorStop(.3,'rgba(255,150,50,.2)');mg.addColorStop(.6,'rgba(255,100,30,.05)');mg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath();ctx.arc(this.x,this.y,s*6,0,6.28);ctx.fillStyle=mg;ctx.fill();
      // Fireball
      ctx.beginPath();ctx.arc(this.x,this.y,s,0,6.28);ctx.fillStyle='rgba(255,200,80,.9)';ctx.fill();
      ctx.beginPath();ctx.arc(this.x,this.y,s*.6,0,6.28);ctx.fillStyle='rgba(255,240,200,.95)';ctx.fill();
      ctx.beginPath();ctx.arc(this.x,this.y,s*.25,0,6.28);ctx.fillStyle='rgba(255,255,255,.9)';ctx.fill();
    }
    // Impact effects
    if(this.phase==='impact'){
      // Initial blinding flash
      if(this.time<.8){const flash=Math.max(0,1-this.time/.4);
        ctx.fillStyle=`rgba(255,250,230,${flash*.5})`;ctx.fillRect(0,0,W,H);}
      // Multiple shockwave rings
      for(let i=0;i<3;i++){const delay=i*.3;const st=Math.max(0,this.time-delay);
        if(st<2){const sw=ease.out(Math.min(st/1.5,1))*(200+i*80);const swa=Math.max(0,1-st/2)*(.4-i*.1);
          ctx.beginPath();ctx.arc(this.ix,this.iy,sw,0,6.28);ctx.strokeStyle=`rgba(255,${180-i*40},${60-i*20},${swa})`;ctx.lineWidth=4-i;ctx.stroke();}}
      // Ground fire
      for(const f of this.fire){const a=cl(f.life/2,0,1);const flicker=.6+.4*Math.sin(time*8+f.seed);
        const fg=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y-f.size*.5,f.size);
        fg.addColorStop(0,hsl(f.hue,90,60,a*flicker*.6));fg.addColorStop(.4,hsl(f.hue+10,80,50,a*flicker*.3));fg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath();ctx.arc(f.x,f.y-f.size*.3,f.size,0,6.28);ctx.fillStyle=fg;ctx.fill();}
    }
    // Crater
    if(this.craterAlpha>.01){
      ctx.beginPath();ctx.ellipse(this.ix,this.iy,50,20,0,0,6.28);ctx.fillStyle=`rgba(25,20,10,${this.craterAlpha*.5})`;ctx.fill();
      ctx.beginPath();ctx.ellipse(this.ix,this.iy,35,14,0,0,6.28);ctx.fillStyle=`rgba(15,10,5,${this.craterAlpha*.6})`;ctx.fill();
      ctx.beginPath();ctx.ellipse(this.ix,this.iy,70,28,0,0,6.28);ctx.strokeStyle=`rgba(50,35,15,${this.craterAlpha*.2})`;ctx.lineWidth=10;ctx.stroke();
      // Smoke wisps rising from crater
      if(this.craterAlpha>.1){for(let i=0;i<3;i++){const sx2=this.ix+Math.sin(time*.5+i*2)*20;const sy2=this.iy-15-Math.sin(time*.3+i*1.5)*10-i*12;
        ctx.beginPath();ctx.arc(sx2,sy2,8+i*4,0,6.28);ctx.fillStyle=`rgba(60,50,40,${this.craterAlpha*.04})`;ctx.fill();}}
    }
    // Debris
    for(const d of this.debris){const a=cl(d.life/1.5,0,1);
      ctx.beginPath();ctx.arc(d.x,d.y,d.size*a,0,6.28);ctx.fillStyle=hsl(d.hue,80,55,a*.8);ctx.fill();
      if(d.glow){ctx.beginPath();ctx.arc(d.x,d.y,d.size*2.5,0,6.28);ctx.fillStyle=hsl(d.hue,70,50,a*.1);ctx.fill();}}
    if(sx||sy)ctx.restore();
  }
}

// ══════════════════════════════════════════
// ULTRA RARE: DEATH STAR (every 20-40 min)
// ══════════════════════════════════════════
class DeathStar{
  constructor(){this.phase='idle';this.timer=R(420,600);this.time=0;this.x=0;this.y=0;this.size=0;this.laserY=0;this.ashAlpha=0;this.shake=0;this.embers=[];this.fires=[];}
  update(dt,time,garden){
    if(this.phase==='idle'){this.timer-=dt;if(this.timer<=0){this.phase='enter';this.time=0;this.timer=R(420,600);this.x=W+80;this.y=HOR*.18;this.size=2;this.embers=[];this.fires=[];this._ashPatches=null;}return;}
    this.time+=dt;
    if(this.phase==='enter'){
      this.size=2+ease.out(Math.min(this.time/12,1))*80;
      this.x=W+80-this.time*12;this.y=HOR*.18+Math.sin(this.time*.15)*8;
      if(this.time>12){this.phase='charge';this.time=0;}
    }else if(this.phase==='charge'){
      if(this.time>5){this.phase='fire';this.time=0;this.shake=15;}
    }else if(this.phase==='fire'){
      this.laserY=HOR*.2+ease.out(Math.min(this.time/.6,1))*(H-HOR*.2);
      this.shake=Math.max(0,15-this.time*3);
      if(this.time>.4){
        for(const f of garden.flowers){if(f.phase<5){f.phase=5;f.pt=0;f.wiltDur=.3;f.opacity=0;}}
        garden.flowers=[];
      }
      // Spawn ground fires along laser sweep
      if(this.time<2&&Math.random()<dt*20){const dishX=this.x+this.size*.35;
        this.fires.push({x:dishX+R(-100,100),y:R(HOR+10,H*.9),size:R(10,30),life:R(4,10),seed:R(0,1000),hue:pick([10,20,30])});}
      if(this.time>3){this.phase='ash';this.time=0;this.ashAlpha=1;
        // Massive ember burst
        for(let i=0;i<60;i++)this.embers.push({x:R(0,W),y:R(HOR,H),vx:R(-8,8),vy:R(-25,-5),life:R(1.5,5),size:R(1,4),hue:pick([10,20,30,40])});}
    }else if(this.phase==='ash'){
      this.ashAlpha=Math.max(0,1-this.time/14);
      if(Math.random()<dt*12&&this.embers.length<80)this.embers.push({x:R(0,W),y:R(HOR+10,H),vx:R(-5,5),vy:R(-18,-5),life:R(1,3),size:R(1,3),hue:pick([15,25,35])});
      for(const e of this.embers){e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;}this.embers=this.embers.filter(e=>e.life>0);
      for(const f of this.fires){f.life-=dt;f.size*=.99;}this.fires=this.fires.filter(f=>f.life>0);
      if(this.time>14){this.phase='leave';this.time=0;}
    }else if(this.phase==='leave'){
      this.x+=30*dt;this.y-=5*dt;this.size=Math.max(2,this.size-dt*4);
      if(this.time>10){this.phase='idle';this.embers=[];this.fires=[];}
    }
  }
  draw(time){
    if(this.phase==='idle')return;
    const sx=this.shake>0?(Math.random()-.5)*this.shake:0;
    const sy=this.shake>0?(Math.random()-.5)*this.shake:0;
    if(sx||sy){ctx.save();ctx.translate(sx,sy);}
    // Ash overlay
    if(this.ashAlpha>.01){
      ctx.fillStyle=`rgba(15,12,8,${this.ashAlpha*.65})`;ctx.fillRect(0,HOR,W,H-HOR);
      if(!this._ashPatches){this._ashPatches=[];for(let i=0;i<12;i++)this._ashPatches.push({x:R(W*.05,W*.95),y:HOR+R(15,H*.4),w:R(30,80),h:R(10,30)});}
      ctx.fillStyle=`rgba(35,25,15,${this.ashAlpha*.25})`;
      for(const p of this._ashPatches){ctx.beginPath();ctx.ellipse(p.x,p.y,p.w,p.h,0,0,6.28);ctx.fill();}
      // Ground fires
      for(const f of this.fires){const a=cl(f.life/2,0,1);const flicker=.6+.4*Math.sin(time*10+f.seed);
        const fg=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y-f.size*.4,f.size);
        fg.addColorStop(0,hsl(f.hue,90,55,a*flicker*.5));fg.addColorStop(.5,hsl(f.hue+15,80,45,a*flicker*.2));fg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath();ctx.arc(f.x,f.y-f.size*.2,f.size,0,6.28);ctx.fillStyle=fg;ctx.fill();}
      // Embers
      for(const e of this.embers){const a=cl(e.life/1,0,1);
        ctx.beginPath();ctx.arc(e.x,e.y,e.size,0,6.28);ctx.fillStyle=hsl(e.hue,85,55,a*.8);ctx.fill();
        ctx.beginPath();ctx.arc(e.x,e.y,e.size*2.5,0,6.28);ctx.fillStyle=hsl(e.hue,70,50,a*.08);ctx.fill();}
    }
    // Death Star sphere
    if(this.phase!=='ash'||this.time<4){
      const ds=this.size,dx=this.x,dy=this.y;
      const fadeOut=this.phase==='leave'?Math.max(0,1-this.time/6):1;
      ctx.save();ctx.globalAlpha=fadeOut;
      // Menacing green tint in sky during approach
      if(this.phase==='enter'||this.phase==='charge'){const ap=this.phase==='enter'?this.time/12:.5+this.time/10;
        ctx.fillStyle=`rgba(20,60,20,${ap*.03})`;ctx.fillRect(0,0,W,HOR);}
      // Base sphere with better shading
      const sg=ctx.createRadialGradient(dx-ds*.2,dy-ds*.2,ds*.1,dx,dy,ds);
      sg.addColorStop(0,'#9a9a9a');sg.addColorStop(.3,'#7a7a7a');sg.addColorStop(.6,'#4a4a4a');sg.addColorStop(1,'#1a1a1a');
      ctx.beginPath();ctx.arc(dx,dy,ds,0,6.28);ctx.fillStyle=sg;ctx.fill();
      if(ds>15){
        ctx.save();ctx.beginPath();ctx.arc(dx,dy,ds,0,6.28);ctx.clip();
        // Equatorial trench
        ctx.fillStyle='rgba(10,10,10,.5)';ctx.fillRect(dx-ds,dy-ds*.07,ds*2,ds*.14);
        // Surface panels
        ctx.strokeStyle='rgba(40,40,40,.2)';ctx.lineWidth=.5;ctx.beginPath();
        for(let i=0;i<8;i++){const ly=dy-ds*.9+i*ds*.25;ctx.moveTo(dx-ds,ly);ctx.lineTo(dx+ds,ly);}
        for(let i=0;i<8;i++){const a=i*.4+.2;ctx.moveTo(dx+Math.cos(a)*ds,dy+Math.sin(a)*ds*.4);ctx.lineTo(dx+Math.cos(a+.25)*ds,dy-Math.sin(a+.25)*ds*.4);}
        ctx.stroke();
        // Superlaser dish
        const dishX=dx+ds*.35,dishY=dy-ds*.25,dishR=ds*.25;
        ctx.beginPath();ctx.arc(dishX,dishY,dishR,0,6.28);ctx.fillStyle='rgba(8,8,8,.6)';ctx.fill();
        ctx.beginPath();ctx.arc(dishX,dishY,dishR*.65,0,6.28);ctx.fillStyle='rgba(3,3,3,.7)';ctx.fill();
        ctx.beginPath();ctx.arc(dishX,dishY,dishR*.3,0,6.28);ctx.fillStyle='rgba(0,0,0,.8)';ctx.fill();
        ctx.restore();
        // Charge glow — increasingly dramatic
        if(this.phase==='charge'){
          const cp=ease.out(Math.min(this.time/5,1));const pulse=.5+.5*Math.sin(this.time*4+this.time*this.time*.5);
          // Multiple converging beams toward dish
          for(let i=0;i<6;i++){const a=i*1.047+this.time*.5;const bx=dx+Math.cos(a)*ds*.8,by=dy+Math.sin(a)*ds*.8;
            ctx.strokeStyle=`rgba(100,255,100,${cp*pulse*.15})`;ctx.lineWidth=1;
            ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(dishX,dishY);ctx.stroke();}
          // Central glow growing
          const cg=ctx.createRadialGradient(dishX,dishY,0,dishX,dishY,dishR*(1+cp*2));
          cg.addColorStop(0,`rgba(120,255,120,${cp*pulse*.5})`);cg.addColorStop(.3,`rgba(80,220,80,${cp*pulse*.2})`);
          cg.addColorStop(.7,`rgba(40,150,40,${cp*pulse*.06})`);cg.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath();ctx.arc(dishX,dishY,dishR*(1+cp*2),0,6.28);ctx.fillStyle=cg;ctx.fill();
          // Screen flicker on charge pulses
          if(pulse>.9){ctx.fillStyle=`rgba(50,255,50,${cp*.02})`;ctx.fillRect(0,0,W,H);}
        }
        // FIRE — massive laser
        if(this.phase==='fire'){
          const la=Math.min(this.time/.2,1);const dishX2=dx+ds*.35,dishY2=dy-ds*.25;
          ctx.save();ctx.globalAlpha=la;
          // Green flash across entire sky
          if(this.time<.5){const gf=Math.max(0,1-this.time/.3);ctx.fillStyle=`rgba(50,255,50,${gf*.15})`;ctx.fillRect(0,0,W,H);}
          // Wide outer beam glow
          const lg2=ctx.createLinearGradient(dishX2-30,0,dishX2+30,0);
          lg2.addColorStop(0,'rgba(0,80,0,0)');lg2.addColorStop(.2,'rgba(30,200,30,.15)');lg2.addColorStop(.5,'rgba(80,255,80,.35)');lg2.addColorStop(.8,'rgba(30,200,30,.15)');lg2.addColorStop(1,'rgba(0,80,0,0)');
          ctx.fillStyle=lg2;ctx.fillRect(dishX2-30,dishY2,60,this.laserY-dishY2);
          // Inner beam
          const lg=ctx.createLinearGradient(dishX2-8,0,dishX2+8,0);
          lg.addColorStop(0,'rgba(0,150,0,0)');lg.addColorStop(.3,'rgba(100,255,100,.5)');lg.addColorStop(.5,'rgba(200,255,200,.8)');lg.addColorStop(.7,'rgba(100,255,100,.5)');lg.addColorStop(1,'rgba(0,150,0,0)');
          ctx.fillStyle=lg;ctx.fillRect(dishX2-8,dishY2,16,this.laserY-dishY2);
          // White-hot core
          ctx.fillStyle=`rgba(220,255,220,${la*.6})`;ctx.fillRect(dishX2-2,dishY2,4,this.laserY-dishY2);
          // Impact explosion at ground
          if(this.laserY>HOR){
            const ig=ctx.createRadialGradient(dishX2,this.laserY,0,dishX2,this.laserY,120*la);
            ig.addColorStop(0,`rgba(200,255,150,${la*.4})`);ig.addColorStop(.3,`rgba(150,255,100,${la*.2})`);
            ig.addColorStop(.6,`rgba(100,200,50,${la*.08})`);ig.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath();ctx.arc(dishX2,this.laserY,120*la,0,6.28);ctx.fillStyle=ig;ctx.fill();
            // Destruction wave sweeping across ground
            const spread=ease.out(Math.min((this.time-.2)/2,1))*W*.6;
            const waveA=Math.max(0,1-this.time/2.5)*.12;
            ctx.fillStyle=`rgba(255,220,100,${waveA})`;ctx.fillRect(dishX2-spread,HOR,spread*2,H-HOR);
            // Fire tongues at impact point
            for(let i=0;i<5;i++){const fx=dishX2+Math.sin(time*8+i*1.3)*15;const fh=20+Math.sin(time*6+i*2)*10;
              ctx.fillStyle=`rgba(255,${150+i*20},50,${la*.15})`;ctx.fillRect(fx-3,this.laserY-fh,6,fh);}
          }
          ctx.restore();
        }
      }
      ctx.beginPath();ctx.arc(dx,dy,ds+1,0,6.28);ctx.strokeStyle='rgba(80,100,80,.12)';ctx.lineWidth=1;ctx.stroke();
      ctx.restore();
    }
    if(sx||sy)ctx.restore();
  }
}
