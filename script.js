/* ═══════════════════════════════════════════════════
   JOHN MACKLEMORE — script.js
   Features:
     - Custom cursor
     - Scroll reveal (Intersection Observer)
     - Navbar scroll behaviour
     - Tilt cards (3D hover)
     - Soundboard (Web Audio API)
     - Keyboard shortcuts for soundboard
     - Visualizer bars animation
     - Counter animation
     - Back-to-top
     - Mobile nav toggle
     - Parallax floaters
   ═══════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

// Smooth trail follow
function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();


/* ─────────────────────────────────────────
   2. NAVBAR SCROLL BEHAVIOUR
───────────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ─────────────────────────────────────────
   3. MOBILE NAV TOGGLE
───────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});


/* ─────────────────────────────────────────
   4. SCROLL REVEAL — Intersection Observer
───────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay based on siblings
      const siblings = Array.from(entry.target.parentElement.children);
      const index    = siblings.indexOf(entry.target);
      const delay    = (index % 6) * 80;
      entry.target.style.transitionDelay = delay + 'ms';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-img').forEach(el => {
  revealObserver.observe(el);
});


/* ─────────────────────────────────────────
   5. 3D TILT CARDS
───────────────────────────────────────── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect   = card.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    const tiltX  = -dy * 8;
    const tiltY  =  dx * 8;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ─────────────────────────────────────────
   6. STAT COUNTER ANIMATION
───────────────────────────────────────── */
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (!target) return;
      let current  = 0;
      const step   = Math.max(1, Math.floor(target / 60));
      const timer  = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current;
      }, 25);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));


/* ─────────────────────────────────────────
   7. PARALLAX FLOATERS
───────────────────────────────────────── */
const floaters = document.querySelectorAll('.floater');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  floaters.forEach((el, i) => {
    const speed  = (i % 3 + 1) * 0.08;
    const dir    = i % 2 === 0 ? 1 : -1;
    el.style.transform = `translateY(${scrollY * speed * dir}px)`;
  });
}, { passive: true });


/* ─────────────────────────────────────────
   8. FOOTER YEAR
───────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ─────────────────────────────────────────
   9. BACK TO TOP
───────────────────────────────────────── */
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ─────────────────────────────────────────
   10. SOUNDBOARD — Web Audio API
───────────────────────────────────────── */
let audioCtx = null;
let vizInterval = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Master gain
function getMasterGain(ctx) {
  const gain = ctx.createGain();
  gain.gain.value = 0.7;
  gain.connect(ctx.destination);
  return gain;
}

/* ── Sound generators ── */
const sounds = {

  kick(ctx) {
    const out   = getMasterGain(ctx);
    const osc   = ctx.createOscillator();
    const env   = ctx.createGain();
    osc.type    = 'sine';
    const t     = ctx.currentTime;
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
    env.gain.setValueAtTime(1,  t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(env); env.connect(out);
    osc.start(t); osc.stop(t + 0.5);
  },

  snare(ctx) {
    const out    = getMasterGain(ctx);
    const t      = ctx.currentTime;
    // Noise
    const bufLen = ctx.sampleRate * 0.2;
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const noiseEnv = ctx.createGain();
    noiseEnv.gain.setValueAtTime(0.8, t);
    noiseEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    const filter = ctx.createBiquadFilter();
    filter.type  = 'highpass';
    filter.frequency.value = 1000;
    noise.connect(filter); filter.connect(noiseEnv); noiseEnv.connect(out);
    noise.start(t); noise.stop(t + 0.25);
    // Tone
    const osc    = ctx.createOscillator();
    const tonEnv = ctx.createGain();
    osc.type     = 'triangle';
    osc.frequency.value = 180;
    tonEnv.gain.setValueAtTime(0.5, t);
    tonEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(tonEnv); tonEnv.connect(out);
    osc.start(t); osc.stop(t + 0.2);
  },

  hihat(ctx) {
    const out   = getMasterGain(ctx);
    const t     = ctx.currentTime;
    const bufLen = ctx.sampleRate * 0.05;
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const env    = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type  = 'highpass';
    filter.frequency.value = 7000;
    env.gain.setValueAtTime(0.4, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    noise.connect(filter); filter.connect(env); env.connect(out);
    noise.start(t); noise.stop(t + 0.1);
  },

  clap(ctx) {
    const out   = getMasterGain(ctx);
    const t     = ctx.currentTime;
    [0, 0.015, 0.03].forEach(delay => {
      const bufLen = Math.floor(ctx.sampleRate * 0.04);
      const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data   = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise  = ctx.createBufferSource();
      noise.buffer = buf;
      const env    = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type  = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.5;
      env.gain.setValueAtTime(0.8, t + delay);
      env.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);
      noise.connect(filter); filter.connect(env); env.connect(out);
      noise.start(t + delay); noise.stop(t + delay + 0.1);
    });
  },

  bass(ctx) {
    const out   = getMasterGain(ctx);
    const osc   = ctx.createOscillator();
    const env   = ctx.createGain();
    const dist  = ctx.createWaveShaper();
    dist.curve  = makeDistortionCurve(80);
    osc.type    = 'sawtooth';
    const t     = ctx.currentTime;
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
    env.gain.setValueAtTime(1, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(dist); dist.connect(env); env.connect(out);
    osc.start(t); osc.stop(t + 0.7);
  },

  synth(ctx) {
    const out   = getMasterGain(ctx);
    const t     = ctx.currentTime;
    [220, 330, 440].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type  = 'square';
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0.3, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.3 + i * 0.05);
      osc.connect(env); env.connect(out);
      osc.start(t); osc.stop(t + 0.4);
    });
  },

  laser(ctx) {
    const out   = getMasterGain(ctx);
    const osc   = ctx.createOscillator();
    const env   = ctx.createGain();
    osc.type    = 'sawtooth';
    const t     = ctx.currentTime;
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
    env.gain.setValueAtTime(0.6, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(env); env.connect(out);
    osc.start(t); osc.stop(t + 0.4);
  },

  airhorn(ctx) {
    const out   = getMasterGain(ctx);
    const t     = ctx.currentTime;
    const freqs = [466.16, 554.37, 698.46];
    freqs.forEach(freq => {
      const osc  = ctx.createOscillator();
      const env  = ctx.createGain();
      const dist = ctx.createWaveShaper();
      dist.curve = makeDistortionCurve(40);
      osc.type   = 'sawtooth';
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.5, t + 0.05);
      env.gain.setValueAtTime(0.5, t + 0.6);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      osc.connect(dist); dist.connect(env); env.connect(out);
      osc.start(t); osc.stop(t + 1);
    });
  },

  vinyl(ctx) {
    const out    = getMasterGain(ctx);
    const t      = ctx.currentTime;
    const dur    = 0.5;
    const bufLen = Math.floor(ctx.sampleRate * dur);
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      // Scratch: amplitude modulated noise
      const mod = Math.sin(i / bufLen * Math.PI * 6);
      data[i] = (Math.random() * 2 - 1) * Math.abs(mod);
    }
    const noise   = ctx.createBufferSource();
    noise.buffer  = buf;
    const filter  = ctx.createBiquadFilter();
    filter.type   = 'peaking';
    filter.frequency.value = 2000;
    filter.gain.value = 8;
    const env     = ctx.createGain();
    env.gain.setValueAtTime(0.6, t);
    env.gain.linearRampToValueAtTime(0.001, t + dur);
    noise.connect(filter); filter.connect(env); env.connect(out);
    noise.start(t); noise.stop(t + dur);
  },

  woosh(ctx) {
    const out    = getMasterGain(ctx);
    const t      = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.5);
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type  = 'bandpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(5000, t + 0.4);
    filter.Q.value = 0.4;
    const env    = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.8, t + 0.1);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    noise.connect(filter); filter.connect(env); env.connect(out);
    noise.start(t); noise.stop(t + 0.6);
  },

  chime(ctx) {
    const out   = getMasterGain(ctx);
    const t     = ctx.currentTime;
    const notes = [1046.5, 1318.5, 1568, 2093];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type  = 'sine';
      osc.frequency.value = freq;
      const st  = t + i * 0.08;
      env.gain.setValueAtTime(0, st);
      env.gain.linearRampToValueAtTime(0.4, st + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, st + 0.8);
      osc.connect(env); env.connect(out);
      osc.start(st); osc.stop(st + 0.9);
    });
  },

  boom(ctx) {
    const out   = getMasterGain(ctx);
    const t     = ctx.currentTime;
    // Sub osc
    const sub   = ctx.createOscillator();
    const subEnv = ctx.createGain();
    sub.type    = 'sine';
    sub.frequency.setValueAtTime(80, t);
    sub.frequency.exponentialRampToValueAtTime(20, t + 0.8);
    subEnv.gain.setValueAtTime(1.2, t);
    subEnv.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    sub.connect(subEnv); subEnv.connect(out);
    sub.start(t); sub.stop(t + 1.1);
    // Noise burst
    const bufLen = Math.floor(ctx.sampleRate * 0.3);
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const noiseEnv = ctx.createGain();
    const filter   = ctx.createBiquadFilter();
    filter.type    = 'lowpass';
    filter.frequency.value = 400;
    noiseEnv.gain.setValueAtTime(0.5, t);
    noiseEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    noise.connect(filter); filter.connect(noiseEnv); noiseEnv.connect(out);
    noise.start(t); noise.stop(t + 0.4);
  }
};

// Distortion curve helper
function makeDistortionCurve(amount) {
  const samples = 256;
  const curve   = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

/* ── Visualizer ── */
const vizBars    = document.querySelectorAll('.viz-bar');
const soundDisplay = document.getElementById('soundDisplay');

function runViz(color) {
  if (vizInterval) clearInterval(vizInterval);
  vizBars.forEach(b => b.style.background = color || 'var(--yellow)');
  let frames = 0;
  const totalFrames = 40;
  vizInterval = setInterval(() => {
    frames++;
    vizBars.forEach(bar => {
      const h = frames < totalFrames
        ? Math.random() * 45 + 5
        : Math.max(4, parseFloat(bar.style.height || '4') * 0.85);
      bar.style.height = h + 'px';
    });
    if (frames >= totalFrames + 20) clearInterval(vizInterval);
  }, 50);
}

/* ── Pad colours for display ── */
const padColors = {
  kick:    'var(--yellow)',
  snare:   'var(--pink)',
  hihat:   'var(--cyan)',
  clap:    'var(--orange)',
  bass:    'var(--purple)',
  synth:   'var(--blue)',
  laser:   'var(--yellow)',
  airhorn: 'var(--pink)',
  vinyl:   'var(--cyan)',
  woosh:   'var(--orange)',
  chime:   'var(--green)',
  boom:    'var(--purple)'
};

function triggerSound(soundName, padEl) {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  if (sounds[soundName]) sounds[soundName](ctx);

  // Flash pad
  if (padEl) {
    padEl.classList.add('active');
    setTimeout(() => padEl.classList.remove('active'), 200);
  }

  // Update display
  const label = padEl ? padEl.dataset.label : soundName.toUpperCase();
  soundDisplay.textContent = '▶ ' + label;
  soundDisplay.style.color = padColors[soundName] || 'var(--yellow)';
  setTimeout(() => {
    soundDisplay.textContent = '— Press a pad or use your keyboard! —';
    soundDisplay.style.color = 'var(--yellow)';
  }, 1500);

  // Visualizer
  runViz(padColors[soundName]);
}

/* ── Click events ── */
document.querySelectorAll('.sound-pad').forEach(pad => {
  pad.addEventListener('click', () => {
    triggerSound(pad.dataset.sound, pad);
  });
});

/* ── Keyboard shortcut map ── */
const keyMap = {
  'q': 'kick',   'w': 'snare', 'e': 'hihat',   'r': 'clap',
  'a': 'bass',   's': 'synth', 'd': 'laser',    'f': 'airhorn',
  'z': 'vinyl',  'x': 'woosh', 'c': 'chime',    'v': 'boom'
};

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  const key    = e.key.toLowerCase();
  const sound  = keyMap[key];
  if (!sound)  return;
  const padEl  = document.querySelector(`[data-sound="${sound}"]`);
  triggerSound(sound, padEl);
});


/* ─────────────────────────────────────────
   11. TRACK ITEM INTERACTION
───────────────────────────────────────── */
document.querySelectorAll('.track-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.track-item').forEach(t => t.style.background = '');
    item.style.background = 'rgba(255,221,0,0.06)';
  });
});


/* ─────────────────────────────────────────
   12. GALLERY LIGHTBOX (simple expand)
───────────────────────────────────────── */
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    item.style.zIndex = '100';
    item.style.transform = 'scale(1.04)';
    setTimeout(() => {
      item.style.transform = '';
      item.style.zIndex    = '';
    }, 400);
  });
});


/* ─────────────────────────────────────────
   13. SMOOTH ANCHOR LINKS
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 20;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────
   14. RANDOM IDLE FLOATER SPARKLES
───────────────────────────────────────── */
function createSparkle() {
  const el   = document.createElement('div');
  const x    = Math.random() * window.innerWidth;
  const y    = Math.random() * window.innerHeight;
  const size = Math.random() * 4 + 2;
  const col  = ['#ffdd00','#ff2d78','#00f5d4','#ff6b2b','#9b5de5'][Math.floor(Math.random()*5)];
  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${col};
    pointer-events: none;
    z-index: 9;
    animation: sparkleLife 1.2s ease forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// Inject sparkle keyframe
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
  @keyframes sparkleLife {
    0%   { opacity: 0; transform: scale(0) translateY(0); }
    30%  { opacity: 1; transform: scale(1) translateY(-10px); }
    100% { opacity: 0; transform: scale(0.5) translateY(-30px); }
  }
`;
document.head.appendChild(sparkleStyle);

// Spawn sparkles occasionally on mouse move
let sparkleThrottle = 0;
document.addEventListener('mousemove', () => {
  const now = Date.now();
  if (now - sparkleThrottle > 120) {
    sparkleThrottle = now;
    if (Math.random() > 0.6) createSparkle();
  }
});


/* ─────────────────────────────────────────
   15. PAGE LOAD ENTRANCE ANIMATION
───────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
