/* ═══════════════════════════════════════════════════
   JOHN MACKLEMORE — script.js
   Western / Desert Theme
   Features:
     - Custom cursor tracking
     - Scroll reveal (IntersectionObserver)
     - Navbar scroll behaviour + mobile toggle
     - 3D tilt cards
     - Dust mote particle system (hero)
     - Night sky stars (footer)
     - Stat counter animation
     - Soundboard (Web Audio API) — 12 cowboy sounds
     - Keyboard shortcuts (Q W E R / A S D F / Z X C V)
     - Animated visualizer bars
     - Smooth anchor navigation
     - Back-to-top button
     - Footer year
   ═══════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────── */
const cursorDot  = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

document.addEventListener('click', () => {
  const shot = new Audio('gunshot.mp3');
  shot.play();
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();


/* ─────────────────────────────────────────
   2. NAVBAR
───────────────────────────────────────── */
const navbar     = document.getElementById('navbar');
const navToggle  = document.getElementById('navToggle');
const navLinksCt = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinksCt.classList.toggle('open');
  document.body.style.overflow = navLinksCt.classList.contains('open') ? 'hidden' : '';
});

navLinksCt.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinksCt.classList.remove('open');
    document.body.style.overflow = '';
  });
});


/* ─────────────────────────────────────────
   3. SCROLL REVEAL
───────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(entry.target.parentElement.children);
    const idx      = siblings.indexOf(entry.target);
    const delay    = (idx % 5) * 90;
    entry.target.style.transitionDelay = delay + 'ms';
    entry.target.classList.add('visible');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .reveal-img').forEach(el => revealObs.observe(el));


/* ─────────────────────────────────────────
   4. 3D TILT CARDS
───────────────────────────────────────── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r   = card.getBoundingClientRect();
    const dx  = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy  = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(700px) rotateX(${-dy * 7}deg) rotateY(${dx * 7}deg) scale(1.03)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});


/* ─────────────────────────────────────────
   5. STAT COUNTER
───────────────────────────────────────── */
const statObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el  = entry.target;
    const end = parseInt(el.dataset.target, 10);
    if (!end) return;
    let cur   = 0;
    const inc = Math.max(1, Math.floor(end / 55));
    const t   = setInterval(() => {
      cur += inc;
      if (cur >= end) { cur = end; clearInterval(t); }
      el.textContent = cur;
    }, 25);
    statObs.unobserve(el);
  });
}, { threshold: 0.6 });

document.querySelectorAll('.stat-num').forEach(el => statObs.observe(el));


/* ─────────────────────────────────────────
   6. DUST MOTES PARTICLE SYSTEM (HERO)
───────────────────────────────────────── */
function initDustMotes() {
  const container = document.getElementById('dustMotes');
  if (!container) return;
  container.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:3;overflow:hidden;';

  const count = 38;
  for (let i = 0; i < count; i++) {
    const mote  = document.createElement('div');
    const size  = Math.random() * 3.5 + 1;
    const x     = Math.random() * 100;
    const startY = Math.random() * 100;
    const dur   = Math.random() * 20 + 15;
    const delay = Math.random() * -25;
    const drift = (Math.random() - 0.5) * 60;

    mote.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${startY}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(${212 + Math.random()*20 | 0}, ${150 + Math.random()*30 | 0}, ${40 + Math.random()*20 | 0}, ${Math.random() * 0.5 + 0.15});
      animation: moteFloat ${dur}s ${delay}s ease-in-out infinite;
      --drift: ${drift}px;
    `;
    container.appendChild(mote);
  }

  // Inject mote keyframes once
  if (!document.getElementById('moteKF')) {
    const s = document.createElement('style');
    s.id = 'moteKF';
    s.textContent = `
      @keyframes moteFloat {
        0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
        10%  { opacity: 1; }
        50%  { transform: translateY(-38vh) translateX(var(--drift)) scale(1.3); }
        90%  { opacity: 0.6; }
        100% { transform: translateY(-80vh) translateX(calc(var(--drift)*1.5)) scale(0.7); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }
}
initDustMotes();


/* ─────────────────────────────────────────
   7. NIGHT SKY STARS (FOOTER)
───────────────────────────────────────── */
function initNightSky() {
  const sky = document.getElementById('footerSky');
  if (!sky) return;
  sky.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';

  const starCount = 120;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    const s    = Math.random() * 2.5 + 0.5;
    const twinkle = Math.random() > 0.4;
    const dur  = Math.random() * 3 + 2;
    const del  = Math.random() * -5;

    star.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 80}%;
      width: ${s}px; height: ${s}px;
      border-radius: 50%;
      background: rgba(212,184,140, ${Math.random() * 0.6 + 0.3});
      ${twinkle ? `animation: starTwinkle ${dur}s ${del}s ease-in-out infinite;` : ''}
    `;
    sky.appendChild(star);
  }

  // Occasional shooting star
  function shootingStar() {
    const el = document.createElement('div');
    const y  = Math.random() * 40;
    el.style.cssText = `
      position: absolute;
      top: ${y}%;
      left: -5%;
      width: 120px; height: 2px;
      background: linear-gradient(90deg, transparent, rgba(232,184,75,0.9), transparent);
      border-radius: 50%;
      animation: shootStar 1.2s ease forwards;
      transform: rotate(-25deg);
    `;
    sky.appendChild(el);
    setTimeout(() => el.remove(), 1400);
    setTimeout(shootingStar, Math.random() * 8000 + 4000);
  }
  setTimeout(shootingStar, 3000);

  if (!document.getElementById('skyKF')) {
    const s = document.createElement('style');
    s.id = 'skyKF';
    s.textContent = `
      @keyframes starTwinkle {
        0%, 100% { opacity: 1;   transform: scale(1); }
        50%       { opacity: 0.15; transform: scale(0.6); }
      }
      @keyframes shootStar {
        0%   { transform: rotate(-25deg) translateX(0);     opacity: 0; }
        10%  { opacity: 1; }
        100% { transform: rotate(-25deg) translateX(110vw); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }
}
initNightSky();


/* ─────────────────────────────────────────
   8. SMOOTH ANCHOR SCROLLING
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────
   9. FOOTER YEAR + BACK TO TOP
───────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ─────────────────────────────────────────
   10. TRACK ITEM INTERACTION
───────────────────────────────────────── */
document.querySelectorAll('.track-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.track-item').forEach(t => t.style.background = '');
    item.style.background = 'rgba(212,150,26,0.18)';
  });
});


/* ─────────────────────────────────────────
   11. SOUNDBOARD — WEB AUDIO API
       All 12 cowboy sounds synthesised
       with no external files
───────────────────────────────────────── */
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function masterOut(ctx, vol = 0.7) {
  const g = ctx.createGain();
  g.gain.value = vol;
  g.connect(ctx.destination);
  return g;
}

function distCurve(amt) {
  const n = 256, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    c[i] = ((Math.PI + amt) * x) / (Math.PI + amt * Math.abs(x));
  }
  return c;
}

/* ── 12 Sound definitions ── */
const sounds = {

  // BOOT STOMP (kick)
  kick(ctx) {
    const out = masterOut(ctx);
    const osc = ctx.createOscillator(), env = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);
    env.gain.setValueAtTime(1.1, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(env); env.connect(out);
    osc.start(t); osc.stop(t + 0.5);
  },

  // WHIP CRACK (snare)
  snare(ctx) {
    const out = masterOut(ctx);
    const t = ctx.currentTime;
    const len = ctx.sampleRate * 0.18;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const nEnv = ctx.createGain(), filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 2200; filt.Q.value = 0.7;
    nEnv.gain.setValueAtTime(1.2, t);
    nEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    ns.connect(filt); filt.connect(nEnv); nEnv.connect(out);
    ns.start(t); ns.stop(t + 0.22);
    // crack transient
    const osc = ctx.createOscillator(), oEnv = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.value = 240;
    oEnv.gain.setValueAtTime(0.6, t); oEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(oEnv); oEnv.connect(out); osc.start(t); osc.stop(t + 0.08);
  },

  // SPUR JINGLE (hi-hat)
  hihat(ctx) {
    const out = masterOut(ctx, 0.55);
    const t = ctx.currentTime;
    // Two pitched osc mix = metallic spur rattle
    [3200, 4800, 7200].forEach(freq => {
      const osc = ctx.createOscillator(), env = ctx.createGain();
      osc.type = 'square'; osc.frequency.value = freq;
      env.gain.setValueAtTime(0.15, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      const filt = ctx.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 5000;
      osc.connect(filt); filt.connect(env); env.connect(out);
      osc.start(t); osc.stop(t + 0.08);
    });
  },

  // RODEO CLAP (clap)
  clap(ctx) {
    const out = masterOut(ctx);
    const t = ctx.currentTime;
    [0, 0.012, 0.025].forEach(delay => {
      const len = Math.floor(ctx.sampleRate * 0.045);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource(); ns.buffer = buf;
      const env = ctx.createGain(), filt = ctx.createBiquadFilter();
      filt.type = 'bandpass'; filt.frequency.value = 1100; filt.Q.value = 0.6;
      env.gain.setValueAtTime(0.9, t + delay);
      env.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
      ns.connect(filt); filt.connect(env); env.connect(out);
      ns.start(t + delay); ns.stop(t + delay + 0.12);
    });
  },

  // TUMBLEWEED BASS (bass drop)
  bass(ctx) {
    const out = masterOut(ctx);
    const osc = ctx.createOscillator(), env = ctx.createGain(), dist = ctx.createWaveShaper();
    dist.curve = distCurve(60);
    osc.type = 'sawtooth';
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.55);
    env.gain.setValueAtTime(1.1, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    osc.connect(dist); dist.connect(env); env.connect(out);
    osc.start(t); osc.stop(t + 0.7);
  },

  // SALOON PIANO (honky-tonk chord)
  synth(ctx) {
    const out = masterOut(ctx, 0.5);
    const t = ctx.currentTime;
    // Major chord: C4-E4-G4 with slight detuning for saloon effect
    const notes = [261.6, 329.6, 392.0, 523.2];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator(), env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq + (Math.random() - 0.5) * 3; // slight detune
      env.gain.setValueAtTime(0.35, t);
      env.gain.setValueAtTime(0.35, t + 0.05);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.9 + i * 0.06);
      osc.connect(env); env.connect(out);
      osc.start(t); osc.stop(t + 1.1);
    });
  },

  // LASSO SWING (laser sweep)
  laser(ctx) {
    const out = masterOut(ctx);
    const osc = ctx.createOscillator(), env = ctx.createGain();
    osc.type = 'sawtooth';
    const t = ctx.currentTime;
    // Circular sweep like a lasso
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.15);
    osc.frequency.linearRampToValueAtTime(400, t + 0.3);
    osc.frequency.linearRampToValueAtTime(900, t + 0.45);
    env.gain.setValueAtTime(0.7, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(env); env.connect(out);
    osc.start(t); osc.stop(t + 0.6);
  },

  // CATTLE CALL (air horn — big chord)
  airhorn(ctx) {
    const out = masterOut(ctx, 0.45);
    const t = ctx.currentTime;
    // Mooing intervals
    [220, 277, 330, 440].forEach(freq => {
      const osc = ctx.createOscillator(), env = ctx.createGain(), dist = ctx.createWaveShaper();
      dist.curve = distCurve(35);
      osc.type = 'sawtooth'; osc.frequency.value = freq;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.45, t + 0.07);
      env.gain.setValueAtTime(0.45, t + 0.5);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
      osc.connect(dist); dist.connect(env); env.connect(out);
      osc.start(t); osc.stop(t + 0.9);
    });
  },

  // SADDLE SCRATCH (vinyl scratch)
  vinyl(ctx) {
    const out = masterOut(ctx);
    const t = ctx.currentTime;
    const dur = 0.5;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const mod = Math.sin(i / len * Math.PI * 8) * (1 - i / len * 0.5);
      d[i] = (Math.random() * 2 - 1) * Math.abs(mod);
    }
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'peaking'; filt.frequency.value = 2500; filt.gain.value = 10;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.7, t);
    env.gain.linearRampToValueAtTime(0.001, t + dur);
    ns.connect(filt); filt.connect(env); env.connect(out);
    ns.start(t); ns.stop(t + dur + 0.05);
  },

  // DESERT WIND (woosh)
  woosh(ctx) {
    const out = masterOut(ctx, 0.6);
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.6);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(180, t);
    filt.frequency.exponentialRampToValueAtTime(3000, t + 0.35);
    filt.frequency.exponentialRampToValueAtTime(500, t + 0.6);
    filt.Q.value = 0.5;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + 0.12);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    ns.connect(filt); filt.connect(env); env.connect(out);
    ns.start(t); ns.stop(t + 0.7);
  },

  // CHURCH BELLS (chime sequence)
  chime(ctx) {
    const out = masterOut(ctx, 0.6);
    const t = ctx.currentTime;
    // Church bell partial series
    const partials = [
      { f: 523.25, a: 0.5 },  // C5
      { f: 659.25, a: 0.4 },  // E5
      { f: 783.99, a: 0.35 }, // G5
      { f: 1046.5, a: 0.3 },  // C6
    ];
    partials.forEach(({ f, a }, i) => {
      const osc = ctx.createOscillator(), env = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      const st = t + i * 0.1;
      env.gain.setValueAtTime(0, st);
      env.gain.linearRampToValueAtTime(a, st + 0.008);
      env.gain.exponentialRampToValueAtTime(0.001, st + 1.6);
      osc.connect(env); env.connect(out);
      osc.start(st); osc.stop(st + 1.7);
    });
  },

  // THUNDER ROLL (boom)
  boom(ctx) {
    const out = masterOut(ctx);
    const t = ctx.currentTime;
    // Sub oscillator
    const sub = ctx.createOscillator(), subEnv = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(85, t);
    sub.frequency.exponentialRampToValueAtTime(22, t + 0.9);
    subEnv.gain.setValueAtTime(1.3, t);
    subEnv.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    sub.connect(subEnv); subEnv.connect(out);
    sub.start(t); sub.stop(t + 1.2);
    // Rumble noise burst
    const len = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 320;
    const nEnv = ctx.createGain();
    nEnv.gain.setValueAtTime(0.55, t);
    nEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    ns.connect(filt); filt.connect(nEnv); nEnv.connect(out);
    ns.start(t); ns.stop(t + 0.55);
  }
};


/* ─── Visualiser ─── */
const vizBarsEl = document.querySelectorAll('.vb');
const soundDisplayEl = document.getElementById('soundDisplay');
let vizTimer = null;

const padColors = {
  kick:    '#C1440E',
  snare:   '#A03010',
  hihat:   '#D4961A',
  clap:    '#C4813A',
  bass:    '#6B3B2A',
  synth:   '#8B5A2B',
  laser:   '#C1440E',
  airhorn: '#A03010',
  vinyl:   '#8B5A2B',
  woosh:   '#7A9B6E',
  chime:   '#D4961A',
  boom:    '#6B3B2A'
};

function runViz(colour) {
  if (vizTimer) clearInterval(vizTimer);
  vizBarsEl.forEach(b => b.style.background = `linear-gradient(to top, ${colour || '#C1440E'}, #D4961A)`);
  let frames = 0;
  const total = 35;
  vizTimer = setInterval(() => {
    frames++;
    vizBarsEl.forEach(b => {
      const h = frames < total
        ? Math.random() * 42 + 6
        : Math.max(5, parseFloat(b.style.height || '5') * 0.88);
      b.style.height = h + 'px';
    });
    if (frames >= total + 18) clearInterval(vizTimer);
  }, 55);
}

function triggerSound(name, padEl) {
  const ctx = getCtx();
  if (sounds[name]) sounds[name](ctx);

  if (padEl) {
    padEl.classList.add('active');
    setTimeout(() => padEl.classList.remove('active'), 220);
  }

  const label = padEl ? padEl.dataset.label : name.toUpperCase();
  soundDisplayEl.textContent = '▶  ' + label;
  soundDisplayEl.style.color = padColors[name] || '#D4961A';
  clearTimeout(soundDisplayEl._timer);
  soundDisplayEl._timer = setTimeout(() => {
    soundDisplayEl.textContent = '— Mosey on over and press a pad —';
    soundDisplayEl.style.color = '';
  }, 1800);

  runViz(padColors[name]);

  // Screen flash on pad
  spawnDustBurst(padEl);
}

/* ── Click events ── */
document.querySelectorAll('.sound-pad').forEach(pad => {
  pad.addEventListener('click', () => triggerSound(pad.dataset.sound, pad));
});

/* ── Keyboard map ── */
const keyMap = {
  q: 'kick',   w: 'snare',  e: 'hihat',   r: 'clap',
  a: 'bass',   s: 'synth',  d: 'laser',   f: 'airhorn',
  z: 'vinyl',  x: 'woosh',  c: 'chime',   v: 'boom'
};
document.addEventListener('keydown', e => {
  if (e.repeat || e.target.tagName === 'INPUT') return;
  const key  = e.key.toLowerCase();
  const snd  = keyMap[key];
  if (!snd) return;
  const pad  = document.querySelector(`[data-sound="${snd}"]`);
  triggerSound(snd, pad);
});


/* ─────────────────────────────────────────
   12. DUST BURST on sound pad press
───────────────────────────────────────── */
function spawnDustBurst(pad) {
  if (!pad) return;
  const rect = pad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    const angle = (i / 8) * Math.PI * 2;
    const dist  = Math.random() * 50 + 25;
    const dx    = Math.cos(angle) * dist;
    const dy    = Math.sin(angle) * dist;
    const s     = Math.random() * 5 + 3;

    p.style.cssText = `
      position: fixed;
      left: ${cx}px; top: ${cy}px;
      width: ${s}px; height: ${s}px;
      border-radius: 50%;
      background: rgba(${193 + Math.random()*30 | 0}, ${120 + Math.random()*30 | 0}, ${20 + Math.random()*30 | 0}, 0.75);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      animation: dustBurst 0.55s ease-out forwards;
      --dx: ${dx}px; --dy: ${dy}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

if (!document.getElementById('dustBurstKF')) {
  const s = document.createElement('style');
  s.id = 'dustBurstKF';
  s.textContent = `
    @keyframes dustBurst {
      0%   { opacity: 1;   transform: translate(-50%,-50%) scale(1); }
      100% { opacity: 0;   transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.4); }
    }
  `;
  document.head.appendChild(s);
}


/* ─────────────────────────────────────────
   13. PAGE LOAD FADE IN
───────────────────────────────────────── */
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.7s ease';
window.addEventListener('load', () => {
  requestAnimationFrame(() => { document.body.style.opacity = '1'; });
});
