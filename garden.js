
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
    this.chillingDude=new ChillingDude();this.pikachu=new Pikachu();

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
    this.dragon=new Dragon();this.magicCarpet=new MagicCarpet();this.snowflakeStorm=new SnowflakeStorm();

    // All events can happen early — randomize initial timers to short values
    // Repeat timers (set when events end) keep their designed longer intervals
    const earlyEvents=[this.aurora,this.rainbow,this.eclipse,this.snowfall,this.rainEvent,
      this.fogBank,this.windGust,this.blossomStorm,this.lanternFestival,this.willOWisp,
      this.hotAirBalloon,this.skyWhale,this.greatBloom,this.ufoSystem,this.grandRose,
      this.giantBloom,this.satellite,this.planet,this.wishingStar,this.fireflySwarm,
      this.distantTrain,this.lighthouse,this.bannerPlane,this.paperLantern,this.musicNotes,
      this.northStar,this.meteorImpact,this.deathStar,this.dragon,this.magicCarpet,
      this.chillingDude,this.pikachu,this.snowflakeStorm];
    for(const e of earlyEvents){if(e.timer!==undefined)e.timer=R(5,45);}

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
  _countMajor(){let n=0;
    if(this.aurora.active)n++;if(this.rainbow.active)n++;if(this.eclipse.active)n++;
    if(this.snowfall.active)n++;if(this.rainEvent.active)n++;if(this.fogBank.active)n++;
    if(this.blossomStorm.active)n++;if(this.lanternFestival.active)n++;if(this.windGust.active)n++;
    if(this.deathStar.phase!=='idle')n++;if(this.meteorImpact.phase!=='idle')n++;
    if(this.greatBloom.phase!=='idle')n++;if(this.skyWhale.active)n++;
    if(this.hotAirBalloon.active)n++;if(this.ufoSystem.active)n++;if(this.dragon.active)n++;if(this.snowflakeStorm.active)n++;return n;}
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
    this.chillingDude.update(dt,this.time);this.pikachu.update(dt,this.time);

    // Weather & rare events — max 2 major events at once to avoid clutter
    // Major events only tick timers when slots available; active ones always update
    const mj=this._countMajor()<2;
    // Always update (small visual, no slot needed)
    this.lightning.update(dt);
    this.paperLantern.update(dt,this.time);this.fireflySwarm.update(dt,this.time);
    this.distantTrain.update(dt);this.musicNotes.update(dt);this.lighthouse.update(dt);this.bannerPlane.update(dt);
    this.magicCarpet.update(dt,this.time);
    this.willOWisp.update(dt,this.time);this.grandRose.update(dt,this.time,this);this.giantBloom.update(dt,this.time,this);
    // Major events — gated (idle timers pause when 2 slots full)
    if(mj||this.aurora.active)this.aurora.update(dt,this.time);
    if(mj||this.rainbow.active)this.rainbow.update(dt);
    if(mj||this.eclipse.active)this.eclipse.update(dt);
    if(mj||this.snowfall.active)this.snowfall.update(dt,this.time);
    if(mj||this.rainEvent.active)this.rainEvent.update(dt);
    if(mj||this.fogBank.active)this.fogBank.update(dt);
    if(mj||this.windGust.active)this.windGust.update(dt);
    if(mj||this.blossomStorm.active)this.blossomStorm.update(dt,this.time);
    if(mj||this.lanternFestival.active)this.lanternFestival.update(dt,this.time);
    if(mj||this.hotAirBalloon.active)this.hotAirBalloon.update(dt,this.time);
    if(mj||this.skyWhale.active)this.skyWhale.update(dt,this.time);
    if(mj||this.ufoSystem.active)this.ufoSystem.update(dt,this.time);
    if(mj||this.greatBloom.phase!=='idle')this.greatBloom.update(dt,this.time,this);
    if(mj||this.meteorImpact.phase!=='idle')this.meteorImpact.update(dt,this.time,this);
    if(mj||this.deathStar.phase!=='idle')this.deathStar.update(dt,this.time,this);
    if(mj||this.dragon.active)this.dragon.update(dt,this.time,this);
    if(mj||this.snowflakeStorm.active)this.snowflakeStorm.update(dt,this.time);
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
    this.magicCarpet.draw(this.time);
    this.dragon.draw(this.time);
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
    this.chillingDude.draw(this.time);
    this.pikachu.draw(this.time);
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
    this.snowflakeStorm.draw();
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
(function(){let h;function djb2(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return h;}const base=location.href.split('?')[0].replace(/\/[^\/]*$/,'/');const jsFiles=['core.js','sky.js','creatures.js','ground.js','events.js','garden.js'];setInterval(async()=>{try{let all='';for(const f of jsFiles){const r=await fetch(base+f+'?_='+Date.now(),{cache:'no-store'});all+=await r.text();}const nh=djb2(all);if(h===undefined)h=nh;else if(nh!==h)location.reload();}catch(e){}},60000);})();

