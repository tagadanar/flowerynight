
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
// CREATURES: CHILLING DUDE
// ══════════════════════════════════════════
class ChillingDude{
  constructor(){this.active=false;this.timer=R(60,120);this.x=0;this.y=0;this.smokeRings=[];this.puffTimer=0;this.sitTime=0;this.seed=0;}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(60,120);this.x=R(W*.1,W*.85);this.y=R(HOR+35,H*.85);this.smokeRings=[];this.puffTimer=R(2,4);this.sitTime=R(20,45);this.seed=R(0,1000);}return;}
    this.sitTime-=dt;this.puffTimer-=dt;
    if(this.puffTimer<=0){this.puffTimer=R(2.5,5);
      this.smokeRings.push({x:this.x+8,y:this.y-18,r:2,vx:R(1,4),vy:R(-8,-4),life:R(3,6),maxLife:0});
      this.smokeRings[this.smokeRings.length-1].maxLife=this.smokeRings[this.smokeRings.length-1].life;}
    for(const s of this.smokeRings){s.x+=s.vx*dt+noise.get(s.x*.01+this.seed,time*.2)*3*dt;s.y+=s.vy*dt;s.r+=3*dt;s.life-=dt;}
    this.smokeRings=this.smokeRings.filter(s=>s.life>0);
    if(this.sitTime<=0){this.active=false;this.smokeRings=[];}
  }
  draw(time){
    if(!this.active)return;const s=10;
    ctx.save();ctx.translate(this.x,this.y);
    // Smoke rings
    for(const sr of this.smokeRings){const a=cl(sr.life/sr.maxLife,0,1)*.25;
      ctx.beginPath();ctx.arc(sr.x-this.x,sr.y-this.y,sr.r,0,6.28);
      ctx.strokeStyle=`rgba(180,180,190,${a})`;ctx.lineWidth=1.5;ctx.stroke();}
    // Legs (stretched out)
    ctx.strokeStyle='rgba(35,30,45,.8)';ctx.lineWidth=2.5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-s*.2,s*.1);ctx.quadraticCurveTo(s*.5,s*.3,s*1.2,s*.2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-s*.1,s*.15);ctx.quadraticCurveTo(s*.3,s*.5,s*1,s*.45);ctx.stroke();
    // Body (leaning back)
    ctx.fillStyle='rgba(35,30,45,.85)';
    ctx.beginPath();ctx.ellipse(-s*.1,-s*.15,s*.35,s*.5,-.2,0,6.28);ctx.fill();
    // Arm holding item
    ctx.strokeStyle='rgba(35,30,45,.8)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(s*.1,-s*.3);ctx.quadraticCurveTo(s*.5,-s*.5,s*.7,-s*.6);ctx.stroke();
    // Item (small stick)
    ctx.strokeStyle='rgba(120,100,70,.6)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(s*.7,-s*.6);ctx.lineTo(s*.9,-s*.7);ctx.stroke();
    // Smoke wisp from tip
    const puff=Math.sin(time*3+this.seed)*.3+.5;
    ctx.fillStyle=`rgba(180,180,190,${puff*.15})`;ctx.beginPath();ctx.arc(s*.95,-s*.75,2+puff,0,6.28);ctx.fill();
    // Head
    ctx.fillStyle='rgba(35,30,45,.85)';ctx.beginPath();ctx.arc(0,-s*.8,s*.3,0,6.28);ctx.fill();
    // Sunglasses — cool
    ctx.fillStyle='rgba(10,10,15,.8)';
    ctx.beginPath();ctx.ellipse(-s*.12,-s*.82,s*.12,s*.08,0,0,6.28);ctx.fill();
    ctx.beginPath();ctx.ellipse(s*.1,-s*.82,s*.12,s*.08,0,0,6.28);ctx.fill();
    ctx.strokeStyle='rgba(10,10,15,.7)';ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(-s*.01,-s*.82);ctx.lineTo(s*.01,-s*.82);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-s*.24,-s*.82);ctx.lineTo(-s*.3,-s*.78);ctx.stroke();
    ctx.beginPath();ctx.moveTo(s*.22,-s*.82);ctx.lineTo(s*.3,-s*.78);ctx.stroke();
    // Beanie/cap
    ctx.fillStyle='rgba(60,40,80,.7)';ctx.beginPath();
    ctx.ellipse(0,-s*1,s*.3,s*.12,-.1,0,6.28);ctx.fill();
    ctx.beginPath();ctx.arc(0,-s*.95,s*.28,Math.PI,.05);ctx.fill();
    // Slight smile
    ctx.strokeStyle='rgba(180,160,140,.4)';ctx.lineWidth=.6;
    ctx.beginPath();ctx.arc(0,-s*.72,s*.1,.2,.9);ctx.stroke();
    // Shoes
    ctx.fillStyle='rgba(45,35,30,.7)';
    ctx.beginPath();ctx.ellipse(s*1.2,s*.2,s*.15,s*.1,.3,0,6.28);ctx.fill();
    ctx.beginPath();ctx.ellipse(s*1,s*.45,s*.14,s*.09,.2,0,6.28);ctx.fill();
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// CREATURES: PIKACHU
// ══════════════════════════════════════════
class Pikachu{
  constructor(){this.active=false;this.timer=R(120,240);this.x=0;this.y=0;this.dir=1;this.moveTimer=0;this.sparkTimer=0;this.sparks=[];this.sitTime=0;}
  update(dt,time){
    if(!this.active){this.timer-=dt;if(this.timer<=0){this.active=true;this.timer=R(120,240);this.x=R(W*.1,W*.85);this.y=R(HOR+30,H*.85);this.dir=Math.random()>.5?1:-1;this.moveTimer=R(2,5);this.sparkTimer=R(4,8);this.sparks=[];this.sitTime=R(15,30);}return;}
    this.sitTime-=dt;this.moveTimer-=dt;this.sparkTimer-=dt;
    if(this.moveTimer<=0){this.dir*=-1;this.moveTimer=R(2,5);this.x+=this.dir*R(10,30);}
    // Occasional electric sparks
    if(this.sparkTimer<=0){this.sparkTimer=R(3,7);
      for(let i=0;i<RI(3,6);i++){const a=R(0,6.28);this.sparks.push({x:this.x+R(-8,8),y:this.y-10+R(-8,4),vx:Math.cos(a)*R(15,40),vy:Math.sin(a)*R(15,40),life:R(.3,.8)});}}
    for(const s of this.sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;}
    this.sparks=this.sparks.filter(s=>s.life>0);
    if(this.sitTime<=0){this.active=false;this.sparks=[];}
  }
  draw(time){
    if(!this.active)return;const s=8;
    ctx.save();ctx.translate(this.x,this.y);if(this.dir<0)ctx.scale(-1,1);
    // Electric sparks
    ctx.strokeStyle='rgba(255,255,80,.6)';ctx.lineWidth=1;
    for(const sp of this.sparks){const a=cl(sp.life/.3,0,1);ctx.globalAlpha=a;
      ctx.beginPath();ctx.moveTo(sp.x-this.x,sp.y-this.y);ctx.lineTo(sp.x-this.x+R(-3,3),sp.y-this.y+R(-3,3));ctx.stroke();}
    ctx.globalAlpha=1;
    // Body — yellow
    ctx.fillStyle='rgba(255,220,40,.85)';ctx.beginPath();ctx.ellipse(0,0,s*.55,s*.65,0,0,6.28);ctx.fill();
    // Head
    ctx.beginPath();ctx.arc(0,-s*.8,s*.45,0,6.28);ctx.fill();
    // Ears — long with black tips
    ctx.fillStyle='rgba(255,220,40,.85)';
    ctx.beginPath();ctx.moveTo(-s*.25,-s*1.1);ctx.lineTo(-s*.45,-s*1.8);ctx.lineTo(-s*.05,-s*1.2);ctx.fill();
    ctx.beginPath();ctx.moveTo(s*.15,-s*1.1);ctx.lineTo(s*.4,-s*1.75);ctx.lineTo(s*.05,-s*1.15);ctx.fill();
    // Black ear tips
    ctx.fillStyle='rgba(30,25,20,.8)';
    ctx.beginPath();ctx.moveTo(-s*.4,-s*1.6);ctx.lineTo(-s*.45,-s*1.8);ctx.lineTo(-s*.3,-s*1.55);ctx.fill();
    ctx.beginPath();ctx.moveTo(s*.35,-s*1.55);ctx.lineTo(s*.4,-s*1.75);ctx.lineTo(s*.25,-s*1.5);ctx.fill();
    // Red cheeks
    ctx.fillStyle='rgba(220,60,50,.6)';ctx.beginPath();ctx.arc(-s*.3,-s*.7,s*.12,0,6.28);ctx.fill();
    ctx.beginPath();ctx.arc(s*.25,-s*.7,s*.12,0,6.28);ctx.fill();
    // Eyes
    ctx.fillStyle='rgba(15,15,10,.85)';ctx.beginPath();ctx.arc(-s*.15,-s*.85,s*.08,0,6.28);ctx.arc(s*.1,-s*.85,s*.08,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(-s*.17,-s*.87,s*.03,0,6.28);ctx.arc(s*.08,-s*.87,s*.03,0,6.28);ctx.fill();
    // Mouth
    ctx.strokeStyle='rgba(30,20,10,.5)';ctx.lineWidth=.5;
    ctx.beginPath();ctx.moveTo(-s*.05,-s*.7);ctx.quadraticCurveTo(0,-s*.65,s*.05,-s*.7);ctx.stroke();
    // Lightning bolt tail
    ctx.fillStyle='rgba(255,220,40,.85)';ctx.beginPath();
    ctx.moveTo(s*.3,s*.1);ctx.lineTo(s*.6,-s*.3);ctx.lineTo(s*.45,-s*.1);
    ctx.lineTo(s*.8,-s*.5);ctx.lineTo(s*.55,-s*.15);ctx.lineTo(s*.7,-s*.45);
    ctx.lineTo(s*.35,s*.05);ctx.closePath();ctx.fill();
    // Brown base of tail
    ctx.fillStyle='rgba(140,90,30,.6)';ctx.beginPath();ctx.ellipse(s*.32,s*.08,s*.08,s*.05,.3,0,6.28);ctx.fill();
    // Feet
    ctx.fillStyle='rgba(255,220,40,.85)';
    ctx.beginPath();ctx.ellipse(-s*.2,s*.6,s*.12,s*.06,0,0,6.28);ctx.fill();
    ctx.beginPath();ctx.ellipse(s*.15,s*.6,s*.12,s*.06,0,0,6.28);ctx.fill();
    ctx.restore();
  }
}
