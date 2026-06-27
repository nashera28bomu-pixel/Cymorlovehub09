// ============================================
// CYMOR LOVE HUB — EXPERIENCE PAGE JS
// Cinematic sequence, typewriter, slideshow
// ============================================

const shareId = window.location.pathname.split('/').pop();
let letterData = null;
let musicPlaying = false;
let slideInterval = null;
let currentSlide = 0;
let reacted = false;

// ── THEME MAP ──────────────────────────────
const THEME_CLASSES = {
  'Rose Garden': 'theme-rose',
  'Golden Romance': 'theme-golden',
  'Cherry Blossom': 'theme-cherry',
  'Midnight Sky': 'theme-midnight',
  'Royal Gold': 'theme-royal',
  'Ocean Love': 'theme-ocean',
  'Minimal Luxury': 'theme-minimal'
};

// ── BUILT-IN MUSIC (using Web Audio API tones as fallback) ──
const MUSIC_URLS = {
  'soft-piano': null,
  'romantic-strings': null,
  'golden-sunset': null,
  'moonlight': null,
  'rain-dance': null,
  'acoustic-love': null
};

// ── INIT ──────────────────────────────────
async function init() {
  try {
    const res = await fetch(`/api/letters/${shareId}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      showError(data.error || 'Experience not found.');
      return;
    }

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
  const cls = THEME_CLASSES[theme] || 'theme-rose';
  document.body.className = cls;
}

// ── INTRO SCENE ──────────────────────────
function setupIntroScene() {
  // Stars
  const starsEl = document.getElementById('introStars');
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'intro-star';
    const size = 1 + Math.random() * 2;
    star.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${size}px;
      height:${size}px;
      animation-duration:${2+Math.random()*4}s;
      animation-delay:${Math.random()*4}s;
    `;
    starsEl.appendChild(star);
  }

  // Recipient name (typewriter effect)
  const nameEl = document.getElementById('introName');
  const recipientName = letterData.recipientName || 'My Love';
  const fromEl = document.getElementById('introFrom');

  // Animate name letter by letter after 1.8s
  setTimeout(() => {
    typeText(nameEl, recipientName, 120, () => {
      fromEl.textContent = `With love, ${letterData.senderName}`;
    });
  }, 1800);
}

// ── BEGIN EXPERIENCE (after button click) ──
function beginExperience() {
  const sceneIntro = document.getElementById('scene-intro');
  const sceneMain = document.getElementById('scene-main');

  sceneIntro.style.opacity = '1';
  sceneIntro.style.transition = 'opacity 1.5s ease';
  sceneIntro.style.opacity = '0';

  setTimeout(() => {
    sceneIntro.style.display = 'none';
    sceneMain.style.display = 'block';
    sceneMain.style.opacity = '0';
    sceneMain.style.transition = 'opacity 1.5s ease';
    setTimeout(() => sceneMain.style.opacity = '1', 50);

    setupMainScene();
    setupMusic();
    setupScrollReveal();

    // Show reactions after 5s
    setTimeout(() => {
      document.getElementById('reactionBar').classList.add('visible');
    }, 5000);

  }, 1500);
}

// ── MAIN SCENE ──────────────────────────
function setupMainScene() {
  const ai = letterData.aiContent;
  if (!ai) return;

  // Populate text fields
  setEl('expTitle', ai.title);
  setEl('expIntro', ai.intro);
  setEl('expQuote', ai.quote);
  setEl('endingTitle', ai.endingTitle);
  setEl('endingMessage', ai.endingMessage);
  setEl('expCta', ai.cta);
  setEl('galleryTitle', ai.galleryTitle);
  setEl('gallerySubtitle', ai.gallerySubtitle);

  // Letter body - will be typewritten
  document.getElementById('letterSignature').textContent = ai.signature;

  // Photo background
  setupPhotoBackground();

  // Gallery
  setupGallery(ai.photoCaptions);

  // Update page title
  if (ai.title) document.title = `${ai.title} — Cymor Love Hub`;
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

// ── PHOTO BACKGROUND SLIDESHOW ──────────
function setupPhotoBackground() {
  if (!letterData.images || letterData.images.length === 0) {
    // No photos: use gradient bg
    document.querySelector('.photo-bg').style.display = 'none';
    return;
  }

  const photos = letterData.images;
  const slides = [document.getElementById('photoSlide0'), document.getElementById('photoSlide1')];

  // Set first photo immediately
  slides[0].style.backgroundImage = `url(${photos[0].url})`;
  slides[0].classList.add('active');

  if (photos.length === 1) return;

  let current = 0;
  slideInterval = setInterval(() => {
    const next = (current + 1) % photos.length;
    const nextSlideIdx = (current + 1) % 2;
    const currentSlideIdx = current % 2;

    slides[nextSlideIdx].style.backgroundImage = `url(${photos[next].url})`;
    slides[nextSlideIdx].classList.add('active');
    slides[currentSlideIdx].classList.remove('active');
    current = next;
  }, 7000);
}

// ── GALLERY ──────────────────────────────
function setupGallery(captions) {
  if (!letterData.images || letterData.images.length === 0) return;

  const section = document.getElementById('gallerySection');
  const grid = document.getElementById('galleryGrid');
  section.style.display = 'flex';

  letterData.images.forEach((img, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    const image = document.createElement('img');
    image.src = img.url;
    image.alt = captions[idx] || `Photo ${idx+1}`;
    image.loading = 'lazy';

    const caption = document.createElement('div');
    caption.className = 'gallery-caption';
    caption.textContent = captions[idx] || '';

    item.appendChild(image);
    if (captions[idx]) item.appendChild(caption);
    grid.appendChild(item);
  });
}

// ── MUSIC ──────────────────────────────
function setupMusic() {
  const audio = document.getElementById('bgMusic');

  if (letterData.musicType === 'upload' && letterData.musicUrl) {
    audio.src = letterData.musicUrl;
    tryPlayMusic();
  }
  // Built-in tracks: no actual audio files, just ambient silence
  // In production, add actual audio files to /public/audio/
}

function tryPlayMusic() {
  const audio = document.getElementById('bgMusic');
  audio.volume = 0;
  audio.play().then(() => {
    musicPlaying = true;
    document.getElementById('musicToggle').classList.remove('muted');
    // Fade in
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(0.5, vol + 0.02);
      audio.volume = vol;
      if (vol >= 0.5) clearInterval(fadeIn);
    }, 100);
  }).catch(() => {
    // Autoplay blocked — user will click music toggle
  });
}

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggle');

  if (!audio.src) return;

  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    btn.classList.add('muted');
    btn.textContent = '♩';
  } else {
    audio.play();
    musicPlaying = true;
    btn.classList.remove('muted');
    btn.textContent = '♪';
  }
}

// ── TYPEWRITER LETTER ──────────────────
function startTypewriterLetter() {
  const letterEl = document.getElementById('letterBody');
  const text = letterData.aiContent?.letter || '';

  if (!text) return;

  // Add cursor
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  letterEl.appendChild(cursor);

  let idx = 0;
  const words = text.split(' ');
  let currentText = '';

  function typeWord() {
    if (idx >= words.length) {
      // Done
      cursor.remove();
      document.getElementById('letterSignature').classList.add('revealed');
      return;
    }

    const word = words[idx];
    idx++;
    currentText += (idx === 1 ? '' : ' ') + word;
    letterEl.textContent = currentText;
    letterEl.appendChild(cursor);

    // Natural pacing: pause after punctuation
    let delay = 60 + Math.random() * 40;
    if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) delay = 400;
    else if (word.endsWith(',') || word.endsWith(';')) delay = 200;
    else if (word.endsWith('\n')) delay = 300;

    setTimeout(typeWord, delay);
  }

  typeWord();
}

// ── SCROLL REVEAL ──────────────────────
function setupScrollReveal() {
  const sections = document.querySelectorAll('.reveal-section');
  let letterStarted = false;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');

        // Start typewriter when letter section is visible
        if (entry.target.classList.contains('section-letter') && !letterStarted) {
          letterStarted = true;
          setTimeout(startTypewriterLetter, 800);
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(s => obs.observe(s));
}

// ── PARTICLES ──────────────────────────
function setupParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Get accent color from CSS variable
  const accentColors = {
    'theme-rose': [194, 96, 122],
    'theme-golden': [201, 168, 76],
    'theme-cherry': [192, 96, 128],
    'theme-midnight': [96, 128, 192],
    'theme-royal': [201, 168, 76],
    'theme-ocean': [64, 160, 160],
    'theme-minimal': [160, 160, 160]
  };

  const themeClass = document.body.className;
  const [r, g, b] = accentColors[themeClass] || [194, 96, 122];

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: 1 + Math.random() * 2,
    alpha: 0.1 + Math.random() * 0.4,
    alphaDir: (Math.random() > 0.5 ? 1 : -1) * 0.005
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.alphaDir;
      if (p.alpha <= 0.05 || p.alpha >= 0.5) p.alphaDir *= -1;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ── PETALS ──────────────────────────────
function setupPetals() {
  const container = document.getElementById('petalLayer');
  const petalChars = ['🌸', '·', '✦', '❋', '·', '·'];

  function createPetal() {
    const p = document.createElement('div');
    p.className = 'float-petal';
    p.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.fontSize = (8 + Math.random() * 10) + 'px';
    p.style.animationDuration = (10 + Math.random() * 15) + 's';
    p.style.animationDelay = (Math.random() * 5) + 's';
    container.appendChild(p);
    setTimeout(() => p.remove(), 26000);
  }

  for (let i = 0; i < 15; i++) setTimeout(createPetal, i * 600);
  setInterval(createPetal, 1500);
}

// ── REACTIONS ──────────────────────────
async function react(emoji) {
  const btns = document.querySelectorAll('.reaction-btn');
  btns.forEach(b => b.classList.remove('reacted'));
  event.currentTarget.classList.add('reacted');

  try {
    await fetch(`/api/letters/${shareId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji })
    });
  } catch (_) {}
}

// ── UTILITY ────────────────────────────
function typeText(el, text, delay, callback) {
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) setTimeout(callback, 500);
    }
  }, delay);
}

// ── START ────────────────────────────
init();
