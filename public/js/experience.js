// CYMOR LOVE HUB v2 — EXPERIENCE JS (all types)
const shareId = window.location.pathname.split('/').pop();
let expData = null;
let musicPlaying = false;

const THEMES = {
  'Rose Garden':'theme-rose','Golden Romance':'theme-golden','Cherry Blossom':'theme-cherry',
  'Midnight Sky':'theme-midnight','Royal Gold':'theme-royal','Ocean Love':'theme-ocean','Minimal Luxury':'theme-minimal'
};

const TYPE_ICONS = { letter:'❦', poem:'✦', apology:'♥', proposal:'💍', timeline:'◉', quiz:'❋', playlist:'♪' };
const TYPE_ORNAMENTS = { letter:'❦', poem:'✦', apology:'♥', proposal:'💍', timeline:'◉', quiz:'❋', playlist:'♪' };

// ── INIT ──────────────────────────────────
async function init() {
  try {
    const res = await fetch(`/api/experiences/${shareId}`);
    const data = await res.json();
    if (!res.ok || !data.success) { showError(data.error || 'Experience not found.'); return; }
    expData = data.experience;
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('experienceWrapper').style.display = 'block';
    applyTheme(expData.theme);
    setupIntro();
    setupParticles();
    setupPetals();
  } catch(e) { showError('Could not load this experience. Please check your link.'); }
}

function showError(msg) {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('errorMsg').textContent = msg;
  document.getElementById('errorScreen').style.display = 'flex';
}

function applyTheme(theme) { document.body.className = THEMES[theme] || 'theme-rose'; }

// ── INTRO ──────────────────────────────────
function setupIntro() {
  const starsEl = document.getElementById('introStars');
  for (let i = 0; i < 100; i++) {
    const s = document.createElement('div'); s.className = 'intro-star';
    const sz = 1 + Math.random() * 2;
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;animation-duration:${2+Math.random()*4}s;animation-delay:${Math.random()*4}s`;
    starsEl.appendChild(s);
  }
  setTimeout(() => {
    typeCharInto(document.getElementById('introName'), expData.recipientName || 'My Love', 110, () => {
      document.getElementById('introFrom').textContent = `With love, ${expData.senderName}`;
    });
  }, 1800);
}

// ── BEGIN ──────────────────────────────────
function beginExperience() {
  const intro = document.getElementById('scene-intro');
  const main = document.getElementById('scene-main');
  intro.style.transition = 'opacity 1.5s ease';
  intro.style.opacity = '0';
  setTimeout(() => {
    intro.style.display = 'none';
    main.style.display = 'block'; main.style.opacity = '0'; main.style.transition = 'opacity 1.5s ease';
    setTimeout(() => { main.style.opacity = '1'; }, 50);
    populateContent();
    setupPhotoBackground();
    setupMusic();
    setupScrollReveal();
    setTimeout(() => document.getElementById('reactionBar').classList.add('visible'), 6000);
  }, 1500);
}

// ── POPULATE CONTENT BY TYPE ──────────────
function populateContent() {
  const ai = expData.aiContent;
  const type = expData.type;
  if (!ai) return;

  // Opening icon
  document.getElementById('openingIcon').textContent = TYPE_ICONS[type] || '✦';
  document.getElementById('bodyOrnament').textContent = TYPE_ORNAMENTS[type] || '❦';

  // Always set title + intro
  setEl('expTitle', ai.title);
  setEl('expIntro', ai.intro || ai.opening);

  // Quote, ending — hide if empty
  if (ai.quote) setEl('expQuote', ai.quote);
  else document.getElementById('quoteSection').style.display = 'none';

  setEl('endingTitle', ai.endingTitle || ai.closingTitle);
  setEl('endingMessage', ai.endingMessage || ai.closingMessage);
  setEl('expCta', ai.cta);
  if (ai.signature) setEl('letterSignature', ai.signature);

  // TYPE-SPECIFIC
  if (type === 'letter' || type === 'apology' || type === 'proposal') {
    // typewriter letter
    document.getElementById('bodySection').style.display = 'flex';
  } else if (type === 'poem') {
    document.getElementById('bodySection').style.display = 'none';
    document.getElementById('poemSection').style.display = 'flex';
    buildPoem(ai.poem, ai.dedication);
  } else if (type === 'timeline') {
    document.getElementById('bodySection').style.display = 'none';
    document.getElementById('timelineSection').style.display = 'flex';
    buildTimeline(ai.milestoneNarratives, expData.inputData?.milestones);
  } else if (type === 'quiz') {
    document.getElementById('bodySection').style.display = 'none';
    document.getElementById('quizSection').style.display = 'flex';
    buildQuiz(ai);
  } else if (type === 'playlist') {
    document.getElementById('bodySection').style.display = 'none';
    document.getElementById('playlistSection').style.display = 'flex';
    buildPlaylist(ai);
  }

  // Gallery (letter/apology/proposal only)
  if (expData.images?.length && (type === 'letter' || type === 'apology' || type === 'proposal')) {
    setupGallery(ai.photoCaptions);
  }

  if (ai.title) document.title = `${ai.title} — Cymor Love Hub`;
}

function setEl(id, text) { const el = document.getElementById(id); if (el && text) el.textContent = text; }

// ── POEM RENDERER ──────────────────────────
function buildPoem(poemText, dedication) {
  const container = document.getElementById('poemLines');
  if (!poemText) return;
  const lines = poemText.split('\n');
  lines.forEach(line => {
    const el = document.createElement('div');
    el.className = line.trim() === '' ? 'poem-line blank' : 'poem-line';
    el.textContent = line;
    container.appendChild(el);
  });
  if (dedication) {
    const ded = document.getElementById('poemDedication');
    ded.textContent = `— ${dedication}`;
  }
}

function revealPoemLines() {
  const lines = document.querySelectorAll('.poem-line');
  lines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('revealed');
      if (i === lines.length - 1) {
        setTimeout(() => {
          document.getElementById('poemDedication').classList.add('revealed');
          showCTA();
        }, 800);
      }
    }, 400 + i * 280);
  });
}

// ── TIMELINE RENDERER ──────────────────────
function buildTimeline(narratives, milestones) {
  const wrap = document.getElementById('timelineWrap');
  if (!milestones || !milestones.length) return;
  milestones.forEach((m, i) => {
    const el = document.createElement('div'); el.className = 'tl-item reveal-section';
    el.innerHTML = `
      <div class="tl-dot"></div>
      ${m.date ? `<div class="tl-date">${m.date}</div>` : ''}
      <div class="tl-title">${m.title || ''}</div>
      <div class="tl-narrative">${narratives?.[i] || m.description || ''}</div>
    `;
    wrap.appendChild(el);
  });
}

// ── QUIZ RENDERER ──────────────────────────
function buildQuiz(ai) {
  const container = document.getElementById('quizResults');
  const p1 = ai.person1; const p2 = ai.person2;
  if (!p1 || !p2) return;

  container.innerHTML = `
    <div style="display:grid;gap:20px;margin-bottom:32px">
      ${renderPersonCard(p1)}
      ${renderPersonCard(p2)}
    </div>
    <div style="background:rgba(0,0,0,.4);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:28px;margin-bottom:20px">
      <p style="font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:10px">Compatibility</p>
      <p style="font-family:var(--fd);font-style:italic;font-size:1.05rem;color:var(--text);line-height:1.8">${ai.compatibility||''}</p>
    </div>
    <div style="background:rgba(0,0,0,.4);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:28px">
      <p style="font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:10px">Daily Practice</p>
      <p style="font-family:var(--fd);font-style:italic;font-size:1rem;color:var(--text);line-height:1.8">${ai.dailyTip||''}</p>
    </div>
  `;
}

function renderPersonCard(p) {
  return `<div style="background:rgba(0,0,0,.4);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:28px">
    <p style="font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:6px">${p.name}</p>
    <p style="font-family:var(--fd);font-size:1.5rem;font-weight:300;color:var(--text);margin-bottom:4px">${p.primaryLanguage||''}</p>
    <p style="font-size:.72rem;color:var(--muted);margin-bottom:14px">Also: ${p.secondaryLanguage||''}</p>
    <p style="font-family:var(--fd);font-style:italic;font-size:.95rem;color:var(--muted);line-height:1.75;margin-bottom:14px">${p.description||''}</p>
    <ul style="list-style:none;display:flex;flex-direction:column;gap:8px">
      ${(p.tips||[]).map(t=>`<li style="font-size:.8rem;color:var(--text);padding:8px 14px;background:rgba(255,255,255,.04);border-radius:8px;border-left:2px solid var(--accent)">✦ ${t}</li>`).join('')}
    </ul>
  </div>`;
}

// ── PLAYLIST RENDERER ──────────────────────
function buildPlaylist(ai) {
  const card = document.getElementById('playlistCard');
  if (!ai.tracks) return;
  card.innerHTML = `
    <h2 class="playlist-title">${ai.title||''}</h2>
    <p class="playlist-desc">${ai.description||''}</p>
    <div class="track-list">
      ${(ai.tracks||[]).map(t=>`
        <div class="track">
          <div class="track-num">${t.number||'·'}</div>
          <div class="track-info">
            <h4>${t.title||''}</h4>
            <p class="track-artist">${t.artist||''}</p>
            <p class="track-why">${t.why||''}</p>
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent((t.title||'')+' '+(t.artist||''))}" target="_blank" class="track-search">Search on YouTube ↗</a>
          </div>
        </div>
      `).join('')}
    </div>
    <p style="font-family:var(--fd);font-style:italic;font-size:.95rem;color:var(--muted);line-height:1.8;margin-bottom:16px">${ai.closingNote||''}</p>
  `;
}

// ── PHOTO SLIDESHOW ──────────────────────
function setupPhotoBackground() {
  const photos = expData.images;
  if (!photos || !photos.length) { document.querySelector('.photo-bg').style.display = 'none'; return; }
  const slides = [document.getElementById('photoSlide0'), document.getElementById('photoSlide1')];
  slides[0].style.backgroundImage = `url(${photos[0].url})`;
  slides[0].classList.add('active');
  if (photos.length === 1) return;
  let cur = 0;
  setInterval(() => {
    const next = (cur + 1) % photos.length;
    slides[next % 2].style.backgroundImage = `url(${photos[next].url})`;
    slides[next % 2].classList.add('active');
    slides[cur % 2].classList.remove('active');
    cur = next;
  }, 7000);
}

// ── GALLERY ──────────────────────────────
function setupGallery(captions) {
  if (!expData.images?.length) return;
  document.getElementById('gallerySection').style.display = 'flex';
  const grid = document.getElementById('galleryGrid');
  expData.images.forEach((img, i) => {
    const item = document.createElement('div'); item.className = 'gallery-item';
    const image = document.createElement('img'); image.src = img.url; image.alt = captions?.[i] || `Photo ${i+1}`; image.loading = 'lazy';
    item.appendChild(image);
    if (captions?.[i]) { const cap = document.createElement('div'); cap.className = 'gallery-caption'; cap.textContent = captions[i]; item.appendChild(cap); }
    grid.appendChild(item);
  });
}

// ── MUSIC ──────────────────────────────
function setupMusic() {
  const audio = document.getElementById('bgMusic');
  if (expData.musicType === 'upload' && expData.musicUrl) {
    audio.src = expData.musicUrl; audio.volume = 0;
    audio.play().then(() => {
      musicPlaying = true;
      let v = 0; const fi = setInterval(() => { v = Math.min(.5, v + .02); audio.volume = v; if (v >= .5) clearInterval(fi); }, 100);
    }).catch(() => {});
  }
}

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggle');
  if (!audio.src) return;
  if (musicPlaying) { audio.pause(); musicPlaying = false; btn.classList.add('muted'); btn.textContent = '♩'; }
  else { audio.play(); musicPlaying = true; btn.classList.remove('muted'); btn.textContent = '♪'; }
}

// ── TYPEWRITER ──────────────────────────
function startTypewriter() {
  const ai = expData.aiContent;
  const type = expData.type;
  let text = '';
  if (type === 'letter') text = ai.letter || '';
  else if (type === 'apology') text = (ai.apology || '') + '\n\n' + (ai.acknowledgment ? ai.acknowledgment + '\n\n' : '') + (ai.promise || '');
  else if (type === 'proposal') text = ai.speech || '';
  if (!text) { showCTA(); return; }

  const textNode = document.getElementById('typewriterText');
  const cursor = document.getElementById('twCursor');
  cursor.style.display = 'inline-block';
  textNode.textContent = '';
  let i = 0;

  function typeChar() {
    if (i >= text.length) {
      cursor.style.display = 'none';
      setTimeout(() => { document.getElementById('letterSignature').classList.add('revealed'); }, 600);
      setTimeout(showCTA, 2200);
      return;
    }
    const ch = text[i++];
    if (ch === '\n') textNode.innerHTML += '<br>';
    else textNode.textContent += ch;
    let delay = 18 + Math.random() * 12;
    const prev = text[i - 1];
    if (prev === '.' || prev === '!' || prev === '?') delay = 300;
    else if (prev === ',') delay = 130;
    else if (prev === '\n') delay = 240;
    setTimeout(typeChar, delay);
  }
  typeChar();
}

function showCTA() {
  const cta = document.getElementById('section-cta');
  cta.style.display = 'flex'; cta.style.opacity = '0'; cta.style.transition = 'opacity 1.2s ease';
  setTimeout(() => { cta.style.opacity = '1'; }, 50);
}

// ── SCROLL REVEAL ──────────────────────
function setupScrollReveal() {
  document.getElementById('section-cta').style.display = 'none';
  let letterStarted = false; let poemStarted = false; let tlStarted = false;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');

      if (entry.target.classList.contains('section-letter') && !letterStarted) {
        letterStarted = true; setTimeout(startTypewriter, 600);
      }
      if (entry.target.id === 'poemSection' && !poemStarted) {
        poemStarted = true; setTimeout(revealPoemLines, 400);
      }
      if (entry.target.id === 'timelineSection' && !tlStarted) {
        tlStarted = true;
        setTimeout(() => {
          document.querySelectorAll('.tl-item').forEach((el, i) => setTimeout(() => el.classList.add('revealed'), i * 400));
          setTimeout(showCTA, document.querySelectorAll('.tl-item').length * 400 + 800);
        }, 400);
      }
      // For quiz and playlist — show CTA after reveal
      if ((entry.target.id === 'quizSection' || entry.target.id === 'playlistSection')) {
        setTimeout(showCTA, 1200);
      }

      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-section').forEach(s => obs.observe(s));
}

// ── PARTICLES ──────────────────────────
function setupParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const accentMap = {'theme-rose':[194,96,122],'theme-golden':[201,168,76],'theme-cherry':[192,96,128],'theme-midnight':[96,128,192],'theme-royal':[201,168,76],'theme-ocean':[64,160,160],'theme-minimal':[160,160,160]};
  const [r,g,b] = accentMap[document.body.className] || [194,96,122];
  const particles = Array.from({length:55}, () => ({
    x:Math.random()*canvas.width,y:Math.random()*canvas.height,
    vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,
    size:1+Math.random()*2,alpha:.1+Math.random()*.4,alphaDir:(Math.random()>.5?1:-1)*.005
  }));
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.x+=p.vx;p.y+=p.vy;p.alpha+=p.alphaDir;
      if(p.alpha<=.05||p.alpha>=.5)p.alphaDir*=-1;
      if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;
      if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},${p.alpha})`;ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ── PETALS ──────────────────────────────
function setupPetals() {
  const container = document.getElementById('petalLayer');
  const chars = ['🌸','·','✦','❋','·'];
  function mk() {
    const p = document.createElement('div'); p.className = 'float-petal';
    p.textContent = chars[Math.floor(Math.random()*chars.length)];
    p.style.left = Math.random()*100+'vw'; p.style.fontSize = (8+Math.random()*10)+'px';
    p.style.animationDuration = (10+Math.random()*15)+'s'; p.style.animationDelay = (Math.random()*5)+'s';
    container.appendChild(p); setTimeout(()=>p.remove(), 26000);
  }
  for(let i=0;i<15;i++)setTimeout(mk,i*600);
  setInterval(mk,1500);
}

// ── REACTIONS ──────────────────────────
async function react(emoji) {
  document.querySelectorAll('.reaction-btn').forEach(b=>b.classList.remove('reacted'));
  event.currentTarget.classList.add('reacted');
  try { await fetch(`/api/experiences/${shareId}/react`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({emoji})}); } catch(_){}
}

// ── UTILITY ────────────────────────────
function typeCharInto(el, text, delay, cb) {
  el.textContent = ''; let i = 0;
  const iv = setInterval(() => { el.textContent += text[i++]; if(i>=text.length){clearInterval(iv);if(cb)setTimeout(cb,500);} }, delay);
}

init();
