// ============================================
// CYMOR LOVE HUB — LANDING PAGE JS
// Aurora canvas, petals, scroll, FAQ
// ============================================

// NAV scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// FAQ toggle
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}

// ── AURORA CANVAS ──────────────────────────────
const canvas = document.getElementById('auroraCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const auroraWaves = [
  { y: 0.3, color1: 'rgba(120,40,80,', color2: 'rgba(80,20,60,', speed: 0.0008, amplitude: 0.12, phase: 0 },
  { y: 0.5, color1: 'rgba(80,30,120,', color2: 'rgba(40,10,80,', speed: 0.0006, amplitude: 0.1, phase: 2 },
  { y: 0.7, color1: 'rgba(201,168,76,', color2: 'rgba(120,90,20,', speed: 0.0004, amplitude: 0.08, phase: 4 }
];

let auroraTime = 0;

function drawAurora() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  auroraTime += 1;

  auroraWaves.forEach(wave => {
    wave.phase += wave.speed;
    const baseY = canvas.height * wave.y;
    const amp = canvas.height * wave.amplitude;

    const grad = ctx.createLinearGradient(0, baseY - amp, 0, baseY + amp * 2);
    grad.addColorStop(0, wave.color1 + '0)');
    grad.addColorStop(0.4, wave.color1 + '0.15)');
    grad.addColorStop(0.6, wave.color2 + '0.1)');
    grad.addColorStop(1, wave.color1 + '0)');

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= canvas.width; x += 4) {
      const y = baseY + Math.sin(x * 0.003 + wave.phase) * amp + Math.cos(x * 0.005 + wave.phase * 1.3) * amp * 0.5;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  });

  requestAnimationFrame(drawAurora);
}
drawAurora();

// ── ROSE PETALS ──────────────────────────────────
const petalsContainer = document.getElementById('petalsContainer');
const PETAL_CHARS = ['🌸', '🌹', '❤️', '✦', '·'];

function createPetal() {
  const petal = document.createElement('div');
  petal.className = 'petal';
  petal.textContent = PETAL_CHARS[Math.floor(Math.random() * PETAL_CHARS.length)];
  petal.style.left = Math.random() * 100 + 'vw';
  petal.style.fontSize = (8 + Math.random() * 14) + 'px';
  petal.style.animationDuration = (8 + Math.random() * 12) + 's';
  petal.style.animationDelay = (Math.random() * 8) + 's';
  petal.style.opacity = '0';
  petalsContainer.appendChild(petal);
  setTimeout(() => petal.remove(), 22000);
}

// Stagger initial petals
for (let i = 0; i < 20; i++) {
  setTimeout(createPetal, i * 400);
}
setInterval(createPetal, 1200);

// ── SCROLL REVEAL ──────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step, .feature, .testimonial, .theme-card, .section-title, .section-eyebrow').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.step, .feature, .testimonial, .theme-card, .section-title, .section-eyebrow').forEach(el => {
    el.addEventListener('transitionend', () => {}, { once: true });
  });
});

// Add visible class styles via JS (avoid extra CSS)
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

// Stagger children reveals
document.querySelectorAll('.features-grid, .steps, .themes-grid, .testimonials-grid').forEach(parent => {
  [...parent.children].forEach((child, i) => {
    child.style.transitionDelay = (i * 0.08) + 's';
  });
});
