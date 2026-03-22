
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
  draw(time){for(const w of this.wisps){if(!w._t||time-w._t>.15){w._t=time;w._px=w.x*W+noise.fbm(w.seed+time*w.speed,0,2)*100;w._py=w.y*HOR+noise.fbm(0,w.seed+time*w.speed,2)*60;}const x=w._px,y=w._py;const p=w.alpha+Math.sin(time*.15+w.seed)*w.alpha*.3;const g=ctx.createRadialGradient(x,y,0,x,y,w.size);g.addColorStop(0,hsl(w.hue,w.sat,w.lit,p));g.addColorStop(.5,hsl(w.hue+20,w.sat-10,w.lit-10,p*.4));g.addColorStop(1,'rgba(0,0,0,0)');ctx.beginPath();ctx.arc(x,y,w.size,0,6.28);ctx.fillStyle=g;ctx.fill();}}
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
  constructor(){this.angle=R(.3,.6);this.off=R(-.15,.15);this.stars=[];
    for(let i=0;i<150;i++){const t=R(0,1),ac=R(-.12,.12);
      const x=(t+ac*Math.sin(this.angle));const y=(t*this.angle+ac*Math.cos(this.angle)+this.off+.15);
      if(y<0||y>1)continue;this.stars.push({px:x,py:y,size:R(.2,1),a:R(.04,.18)});}}
  draw(){ctx.beginPath();for(const s of this.stars){ctx.moveTo(s.px*W+s.size,s.py*HOR);ctx.arc(s.px*W,s.py*HOR,s.size,0,6.28);}ctx.fillStyle='rgba(200,210,240,.1)';ctx.fill();}
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
