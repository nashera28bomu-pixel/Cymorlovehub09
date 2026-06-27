// ============================================
// CYMOR LOVE HUB — EXPERIENCE PAGE JS
// ============================================

const shareId = window.location.pathname.split('/').pop();
let letterData = null;
let musicPlaying = false;
let slideInterval = null;

const THEME_CLASSES = {
  'Rose Garden': 'theme-rose',
  'Golden Romance': 'theme-golden',
  'Cherry Blossom': 'theme-cherry',
  'Midnight Sky': 'theme-midnight',
  'Royal Gold': 'theme-royal',
  'Ocean Love': 'theme-ocean',
  'Minimal Luxury': 'theme-minimal'
};

// ── INIT ──────────────────────────────────
async function init() {
  try {
    const res = await fetch(`/api/letters/${shareId}`);
    const data = await res.json();
    if (!res.ok || !data.success) { showError(data.error || 'Experience not found.'); return; }
    letterData = data.letter;
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('experienceWrapper').style.display = 'block';
    applyTheme(letterData.theme);
    setupIntroScene();
    setupParticles();
    setupPetals();
  } catch (err) {
    showError('Could not load this experience. Please check your link.');
  }
}

function showError(msg) {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('errorMsg').textContent = msg;
  document.getElementById('errorScreen').style.display = 'flex';
}

function applyTheme(theme) {
  document.body.className = THEME_CLASSES[theme] || 'theme-rose';
}

// ── INTRO SCENE ──────────────────────────
function setupIntroScene() {
  const starsEl = document.getElementById('introStars');
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'intro-star';
    const size = 1 + Math.random() * 2;
    star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;animation-duration:${2+Math.random()*4}s;animation-delay:${Math.random()*4}s;`;
    starsEl.appendChild(star);
  }
  setTimeout(() => {
    typeText(document.getElementById('introName'), letterData.recipientName || 'My Love', 120, () => {
      document.getElementById('introFrom').textContent = `With love, ${letterData.senderName}`;
    });
  }, 1800);
}

// ── BEGIN EXPERIENCE ──────────────────────
function beginExperience() {
  const sceneIntro = document.getElementById('scene-intro');
  const sceneMain = document.getElementById('scene-main');
  sceneIntro.style.transition = 'opacity 1.5s ease';
  sceneIntro.style.opacity = '0';
  setTimeout(() => {
    sceneIntro.style.display = 'none';
    sceneMain.style.display = 'block';
    sceneMain.style.opacity = '0';
    sceneMain.style.transition = 'opacity 1.5s ease';
    setTimeout(() => { sceneMain.style.opacity = '1'; }, 50);
    setupMainScene();
    setupMusic();
    setupScrollReveal();
    setTimeout(() => document.getElementById('reactionBar').classList.add('visible'), 6000);
  }, 1500);
}

// ── MAIN SCENE ──────────────────────────
function setupMainScene() {
  const ai = letterData.aiContent;
  if (!ai) return;
  setEl('expTitle', ai.title);
  setEl('expIntro', ai.intro);
  setEl('expQuote', ai.quote);
  setEl('endingTitle', ai.endingTitle);
  setEl('endingMessage', ai.endingMessage);
  setEl('expCta', ai.cta);
  setEl('galleryTitle', ai.galleryTitle);
  setEl('gallerySubtitle', ai.gallerySubtitle);
  // Signature stored but hidden — revealed after typewriter finishes
  document.getElementById('letterSignature').textContent = ai.signature || '';
  setupPhotoBackground();
  setupGallery(ai.photoCaptions);
  if (ai.title) document.title = `${ai.title} — Cymor Love Hub`;
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

// ── PHOTO SLIDESHOW ──────────────────────
function setupPhotoBackground() {
  if (!letterData.images || !letterData.images.length) {
    document.querySelector('.photo-bg').style.display = 'none';
    return;
  }
  const photos = letterData.images;
  const slides = [document.getElementById('photoSlide0'), document.getElementById('photoSlide1')];
  slides[0].style.backgroundImage = `url(${photos[0].url})`;
  slides[0].classList.add('active');
  if (photos.length === 1) return;
  let current = 0;
  slideInterval = setInterval(() => {
    const next = (current + 1) % photos.length;
    slides[next % 2].style.backgroundImage = `url(${photos[next].url})`;
    slides[next % 2].classList.add('active');
    slides[current % 2].classList.remove('active');
    current = next;
  }, 7000);
}

// ── GALLERY ──────────────────────────────
function setupGallery(captions) {
  if (!letterData.images || !letterData.images.length) return;
  document.getElementById('gallerySection').style.display = 'flex';
  const grid = document.getElementById('galleryGrid');
  letterData.images.forEach((img, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    const image = document.createElement('img');
    image.src = img.url;
    image.alt = captions?.[idx] || `Photo ${idx+1}`;
    image.loading = 'lazy';
    item.appendChild(image);
    if (captions?.[idx]) {
      const cap = document.createElement('div');
      cap.className = 'gallery-caption';
      cap.textContent = captions[idx];
      item.appendChild(cap);
    }
    grid.appendChild(item);
  });
}

// ── MUSIC ──────────────────────────────
function setupMusic() {
  const audio = document.getElementById('bgMusic');
  if (letterData.musicType === 'upload' && letterData.musicUrl) {
    audio.src = letterData.musicUrl;
    audio.volume = 0;
    audio.play().then(() => {
      musicPlaying = true;
      let vol = 0;
      const fi = setInterval(() => {
        vol = Math.min(0.5, vol + 0.02);
        audio.volume = vol;
        if (vol >= 0.5) clearInterval(fi);
      }, 100);
    }).catch(() => {});
  }
}

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggle');
  if (!audio.src) return;
  if (musicPlaying) {
    audio.pause(); musicPlaying = false;
    btn.classList.add('muted'); btn.textContent = '♩';
  } else {
    audio.play(); musicPlaying = true;
    btn.classList.remove('muted'); btn.textContent = '♪';
  }
}

// ── TYPEWRITER — CHARACTER BY CHARACTER ──
function startTypewriterLetter() {
  const letterEl = document.getElementById('letterBody');
  const sigEl = document.getElementById('letterSignature');
  const ctaEl = document.getElementById('section-cta');
  const text = letterData.aiContent?.letter || '';
  if (!text) return;

  letterEl.innerHTML = '';

  // Create a text node + cursor span
  const textNode = document.createElement('span');
  textNode.id = 'typewriterText';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  letterEl.appendChild(textNode);
  letterEl.appendChild(cursor);

  let i = 0;

  function typeChar() {
    if (i >= text.length) {
      // Typing done
      cursor.remove();

      // 1. Reveal signature with fade
      setTimeout(() => {
        sigEl.classList.add('revealed');
      }, 600);

      // 2. Show CTA section after signature
      setTimeout(() => {
        if (ctaEl) {
          ctaEl.style.display = 'flex';
          ctaEl.style.opacity = '0';
          ctaEl.style.transition = 'opacity 1.2s ease';
          setTimeout(() => ctaEl.style.opacity = '1', 50);
        }
      }, 2000);

      return;
    }

    const char = text[i];
    i++;

    // Handle newlines as <br>
    if (char === '\n') {
      textNode.innerHTML += '<br>';
    } else {
      textNode.textContent += char;
    }

    // Natural pacing
    let delay = 18 + Math.random() * 14; // fast but readable
    const prev = text[i - 1];
    if (prev === '.' || prev === '!' || prev === '?') delay = 320;
    else if (prev === ',') delay = 140;
    else if (prev === '\n') delay = 260;

    setTimeout(typeChar, delay);
  }

  typeChar();
}

// ── SCROLL REVEAL ──────────────────────
function setupScrollReveal() {
  // Hide CTA until typewriter done
  const ctaEl = document.getElementById('section-cta');
  if (ctaEl) ctaEl.style.display = 'none';

  const sections = document.querySelectorAll('.reveal-section');
  let letterStarted = false;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        if (entry.target.classList.contains('section-letter') && !letterStarted) {
          letterStarted = true;
          setTimeout(startTypewriterLetter, 600);
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(s => obs.observe(s));
}

// ── PARTICLES ──────────────────────────
function setupParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const accentColors = {
    'theme-rose':[194,96,122],'theme-golden':[201,168,76],'theme-cherry':[192,96,128],
    'theme-midnight':[96,128,192],'theme-royal':[201,168,76],'theme-ocean':[64,160,160],'theme-minimal':[160,160,160]
  };
  const [r,g,b] = accentColors[document.body.className] || [194,96,122];

  const particles = Array.from({length:60}, () => ({
    x:Math.random()*canvas.width, y:Math.random()*canvas.height,
    vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4,
    size:1+Math.random()*2, alpha:0.1+Math.random()*0.4,
    alphaDir:(Math.random()>0.5?1:-1)*0.005
  }));

  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.alpha+=p.alphaDir;
      if(p.alpha<=0.05||p.alpha>=0.5) p.alphaDir*=-1;
      if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
      if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},${p.alpha})`; ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ── PETALS ──────────────────────────────
function setupPetals() {
  const container = document.getElementById('petalLayer');
  const chars = ['🌸','·','✦','❋','·'];
  function createPetal() {
    const p = document.createElement('div');
    p.className = 'float-petal';
    p.textContent = chars[Math.floor(Math.random()*chars.length)];
    p.style.left = Math.random()*100+'vw';
    p.style.fontSize = (8+Math.random()*10)+'px';
    p.style.animationDuration = (10+Math.random()*15)+'s';
    p.style.animationDelay = (Math.random()*5)+'s';
    container.appendChild(p);
    setTimeout(() => p.remove(), 26000);
  }
  for(let i=0;i<15;i++) setTimeout(createPetal, i*600);
  setInterval(createPetal, 1500);
}

// ── REACTIONS ──────────────────────────
async function react(emoji) {
  document.querySelectorAll('.reaction-btn').forEach(b => b.classList.remove('reacted'));
  event.currentTarget.classList.add('reacted');
  try {
    await fetch(`/api/letters/${shareId}/react`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({emoji})
    });
  } catch(_) {}
}

// ── UTILITY ────────────────────────────
function typeText(el, text, delay, callback) {
  el.textContent = '';
  let i = 0;
  const iv = setInterval(() => {
    el.textContent += text[i++];
    if(i>=text.length) { clearInterval(iv); if(callback) setTimeout(callback,500); }
  }, delay);
}

init();
