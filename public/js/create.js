// ============================================
// CYMOR LOVE HUB — CREATE PAGE JS
// ============================================

// State
const state = {
  currentStep: 1,
  writingStyle: 'Romantic',
  letterLength: 'Medium',
  language: 'English',
  theme: 'Rose Garden',
  musicType: 'built-in',
  musicTrack: 'soft-piano',
  musicFile: null,
  photoFiles: []
};

// ── STEP NAVIGATION ──────────────────────────
function goToStep(n) {
  if (n > state.currentStep && !validateStep(state.currentStep)) return;

  document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${n}`).classList.add('active');
  document.querySelectorAll('.nav-step').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.step) === n);
  });
  state.currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
  if (step === 1) {
    const sender = document.getElementById('senderName').value.trim();
    const recipient = document.getElementById('recipientName').value.trim();
    if (!sender || !recipient) {
      alert('Please enter both your name and your partner\'s name.');
      return false;
    }
  }
  if (step === 2) {
    const howMet = document.getElementById('howMet').value.trim();
    if (!howMet) {
      alert('Please share how you met — even a sentence helps the AI.');
      return false;
    }
  }
  return true;
}

// ── CHIP SELECTORS ──────────────────────────
function makeChipSelector(gridId, stateKey) {
  document.getElementById(gridId).addEventListener('click', e => {
    const chip = e.target.closest('[data-val]');
    if (!chip) return;
    document.querySelectorAll(`#${gridId} .style-chip`).forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    state[stateKey] = chip.dataset.val;
  });
}

makeChipSelector('writingStyleGrid', 'writingStyle');
makeChipSelector('letterLengthGrid', 'letterLength');
makeChipSelector('languageGrid', 'language');

document.getElementById('musicGrid').addEventListener('click', e => {
  const chip = e.target.closest('[data-val]');
  if (!chip) return;
  document.querySelectorAll('#musicGrid .music-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  state.musicTrack = chip.dataset.val;
});

document.getElementById('themeGrid').addEventListener('click', e => {
  const opt = e.target.closest('[data-val]');
  if (!opt) return;
  document.querySelectorAll('#themeGrid .theme-opt').forEach(o => o.classList.remove('selected'));
  opt.classList.add('selected');
  state.theme = opt.dataset.val;
});

// ── PHOTO UPLOAD ──────────────────────────
const photoZone = document.getElementById('photoZone');
const photoInput = document.getElementById('photoInput');
const photoPreviews = document.getElementById('photoPreviews');

photoZone.addEventListener('click', () => photoInput.click());

photoZone.addEventListener('dragover', e => {
  e.preventDefault();
  photoZone.classList.add('dragover');
});

photoZone.addEventListener('dragleave', () => photoZone.classList.remove('dragover'));

photoZone.addEventListener('drop', e => {
  e.preventDefault();
  photoZone.classList.remove('dragover');
  addPhotos(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
});

photoInput.addEventListener('change', () => {
  addPhotos(Array.from(photoInput.files));
  photoInput.value = '';
});

function addPhotos(files) {
  const remaining = 10 - state.photoFiles.length;
  const toAdd = files.slice(0, remaining);
  state.photoFiles.push(...toAdd);
  renderPhotoThumbs();
}

function removePhoto(idx) {
  state.photoFiles.splice(idx, 1);
  renderPhotoThumbs();
}

function renderPhotoThumbs() {
  photoPreviews.innerHTML = '';
  state.photoFiles.forEach((file, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'photo-thumb-wrap';
    const img = document.createElement('img');
    img.className = 'photo-thumb';
    img.src = URL.createObjectURL(file);
    img.alt = `Photo ${idx + 1}`;
    const btn = document.createElement('button');
    btn.className = 'photo-remove';
    btn.textContent = '×';
    btn.onclick = () => removePhoto(idx);
    wrap.appendChild(img);
    wrap.appendChild(btn);
    photoPreviews.appendChild(wrap);
  });
  photoZone.querySelector('p').textContent = state.photoFiles.length >= 10 ? 'Maximum 10 photos reached' : 'Tap to add photos';
}

// ── MUSIC TABS ──────────────────────────
function switchMusicTab(tab) {
  document.querySelectorAll('.music-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.music-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`panel-${tab}`).classList.add('active');
  state.musicType = tab === 'builtin' ? 'built-in' : 'upload';
}

const musicZone = document.getElementById('musicZone');
const musicInput = document.getElementById('musicInput');

musicZone.addEventListener('click', () => musicInput.click());

musicInput.addEventListener('change', () => {
  if (musicInput.files[0]) {
    state.musicFile = musicInput.files[0];
    document.getElementById('musicFileName').textContent = `♪ ${musicInput.files[0].name}`;
  }
});

// ── BACKGROUND CANVAS ──────────────────────────
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let bgTime = 0;
function drawBg() {
  bgTime += 0.5;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createRadialGradient(
    canvas.width * (0.3 + Math.sin(bgTime * 0.001) * 0.2),
    canvas.height * 0.3, 0,
    canvas.width * 0.5, canvas.height * 0.5,
    canvas.width * 0.8
  );
  grad.addColorStop(0, 'rgba(120,40,80,0.15)');
  grad.addColorStop(0.5, 'rgba(80,20,60,0.08)');
  grad.addColorStop(1, 'rgba(8,8,16,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(drawBg);
}
drawBg();

// ── GENERATE ──────────────────────────────
async function generateExperience() {
  const btn = document.getElementById('generateBtn');
  const spinner = document.getElementById('generateSpinner');
  const btnText = document.getElementById('generateText');
  const errorEl = document.getElementById('generateError');

  errorEl.textContent = '';

  // Collect all form data
  const formData = new FormData();

  const fields = [
    'senderName','recipientName','occasion','relationshipDuration','nickname',
    'favoritePlace','futureDream','firstDate','howMet','loveMost','favoriteMemory',
    'secretThings','specialMoments','futureDreamsTogether','funnyMemory',
    'promises','extraDetails'
  ];

  for (const f of fields) {
    const el = document.getElementById(f);
    if (el && el.value.trim()) formData.append(f, el.value.trim());
  }

  formData.append('writingStyle', state.writingStyle);
  formData.append('letterLength', state.letterLength);
  formData.append('language', state.language);
  formData.append('theme', state.theme);
  formData.append('musicType', state.musicType);
  formData.append('musicTrack', state.musicTrack);

  // Add photos
  state.photoFiles.forEach(file => formData.append('images', file));

  // Add music file
  if (state.musicType === 'upload' && state.musicFile) {
    formData.append('music', state.musicFile);
  }

  // Validate required
  if (!formData.get('senderName') || !formData.get('recipientName')) {
    errorEl.textContent = 'Please go back and fill in the names.';
    return;
  }

  btn.disabled = true;
  btnText.textContent = 'Crafting your experience...';
  spinner.style.display = 'block';

  try {
    const res = await fetch('/api/letters/generate', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Generation failed. Please try again.');
    }

    // Show success
    document.getElementById('shareUrl').value = data.shareUrl;
    document.getElementById('previewBtn').href = data.shareUrl;
    goToStep('success');

  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btnText.textContent = '✦ Generate My Experience';
    spinner.style.display = 'none';
  }
}

function goToStep(n) {
  document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
  if (n === 'success') {
    document.getElementById('step-success').classList.add('active');
  } else {
    if (n > state.currentStep && !validateStep(state.currentStep)) return;
    document.getElementById(`step-${n}`).classList.add('active');
    document.querySelectorAll('.nav-step').forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.step) === n);
    });
    state.currentStep = n;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyLink() {
  const url = document.getElementById('shareUrl').value;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy Link', 2000);
  }).catch(() => {
    document.getElementById('shareUrl').select();
    document.execCommand('copy');
  });
}
