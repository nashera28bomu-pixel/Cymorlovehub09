// CYMOR LOVE HUB v2 — GLOBAL JS

// NAV scroll
const nav = document.getElementById('nav');
if(nav) window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60));

// Aurora canvas
function initAurora(canvasId){
  const c=document.getElementById(canvasId);if(!c)return;
  const ctx=c.getContext('2d');
  function resize(){c.width=innerWidth;c.height=innerHeight;}resize();
  window.addEventListener('resize',resize);
  const waves=[
    {y:.3,c1:'rgba(120,40,80,',c2:'rgba(80,20,60,',sp:.0008,amp:.12,ph:0},
    {y:.5,c1:'rgba(80,30,120,',c2:'rgba(40,10,80,',sp:.0006,amp:.1,ph:2},
    {y:.7,c1:'rgba(201,168,76,',c2:'rgba(120,90,20,',sp:.0004,amp:.08,ph:4}
  ];
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    waves.forEach(w=>{
      w.ph+=w.sp;
      const by=c.height*w.y,amp=c.height*w.amp;
      const g=ctx.createLinearGradient(0,by-amp,0,by+amp*2);
      g.addColorStop(0,w.c1+'0)');g.addColorStop(.4,w.c1+'.15)');g.addColorStop(.6,w.c2+'.1)');g.addColorStop(1,w.c1+'0)');
      ctx.beginPath();ctx.moveTo(0,by);
      for(let x=0;x<=c.width;x+=4){const y=by+Math.sin(x*.003+w.ph)*amp+Math.cos(x*.005+w.ph*1.3)*amp*.5;ctx.lineTo(x,y);}
      ctx.lineTo(c.width,c.height);ctx.lineTo(0,c.height);ctx.closePath();ctx.fillStyle=g;ctx.fill();
    });
    requestAnimationFrame(draw);
  }draw();
}
initAurora('bgCanvas');

// Petals
function initPetals(containerId){
  const c=document.getElementById(containerId);if(!c)return;
  const chars=['🌸','·','✦','❋','·','·'];
  function mk(){
    const p=document.createElement('div');p.className='fp';
    p.textContent=chars[Math.floor(Math.random()*chars.length)];
    p.style.left=Math.random()*100+'vw';
    p.style.fontSize=(8+Math.random()*12)+'px';
    p.style.animationDuration=(9+Math.random()*12)+'s';
    p.style.animationDelay=(Math.random()*6)+'s';
    c.appendChild(p);setTimeout(()=>p.remove(),22000);
  }
  for(let i=0;i<20;i++)setTimeout(mk,i*350);
  setInterval(mk,1000);
}
initPetals('petals');

// Scroll reveal
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('shown');revObs.unobserve(e.target);}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

// Chip selector helper
function makeChips(gridId,stateKey,state){
  const el=document.getElementById(gridId);if(!el)return;
  el.addEventListener('click',e=>{
    const chip=e.target.closest('[data-val]');if(!chip)return;
    el.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
    chip.classList.add('on');
    state[stateKey]=chip.dataset.val;
  });
}

// Theme selector helper
function makeThemes(gridId,stateKey,state){
  const el=document.getElementById(gridId);if(!el)return;
  el.addEventListener('click',e=>{
    const opt=e.target.closest('[data-val]');if(!opt)return;
    el.querySelectorAll('.theme-opt').forEach(o=>o.classList.remove('on'));
    opt.classList.add('on');
    state[stateKey]=opt.dataset.val;
  });
}

// Share box copy
function copyLink(inputId,btnId){
  const url=document.getElementById(inputId)?.value;if(!url)return;
  navigator.clipboard.writeText(url).then(()=>{
    const btn=document.getElementById(btnId);
    if(btn){const old=btn.textContent;btn.textContent='Copied!';setTimeout(()=>btn.textContent=old,2000);}
  }).catch(()=>{document.getElementById(inputId)?.select();document.execCommand('copy');});
}

// Stagger reveal delays for grids
document.querySelectorAll('.features-grid,.testi-grid,.how-steps,.feat-card,.testi').forEach(parent=>{
  [...parent.children].forEach((child,i)=>child.style.transitionDelay=(i*.07)+'s');
});

// Add stagger to direct reveal children
document.querySelectorAll('.reveal').forEach((el,i)=>{
  if(!el.style.transitionDelay)el.style.transitionDelay=(i%4*.08)+'s';
});
