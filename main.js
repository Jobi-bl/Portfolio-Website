/* ═══════════════════════════════════════════════════════════
   JOBI BL — Cybersecurity Portfolio
   main.js: All interactions, animations, canvas effects
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─── CONSTANTS ───────────────────────────────────────────────
// Cat glyphs mixed into the matrix — appears ~1 in 12 drops
const MATRIX_CHARS  = '01アイウエオカキクケコ#$%@!?><{}[]|/\\^&*';
const CAT_CHARS     = ['=^.^=', '>^ω^<', 'ฅ', '=ω=', '^=^', '≽^•⩊•^≼', '(=ↀωↀ=)'];
const TYPEWRITER_TEXT = 'Detecting threats. Analyzing logs. Defending networks.';
const TYPEWRITER_SPEED = 52; // ms per character

// ─── UTILS ───────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── 1. MATRIX RAIN ──────────────────────────────────────────
function initMatrixRain() {
  const canvas = $('#matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let cols, drops, animId;

  const fontSize = 13;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    cols  = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -50);
  }

  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.045)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff1e1e';
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      // ~1 in 14 columns shows a cat glyph instead
      const isCat  = Math.random() > 0.928;
      const char   = isCat
        ? CAT_CHARS[Math.floor(Math.random() * CAT_CHARS.length)]
        : MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      ctx.fillStyle = isCat
        ? 'rgba(63,185,80,0.45)'   // cat glyphs glow green
        : (Math.random() > 0.97 ? '#e0e0e0' : 'rgba(255,30,30,0.55)');
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5;
    }
    animId = requestAnimationFrame(draw);
  }

  resize();
  draw();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
}

// ─── 2. NAME HACK REVEAL ANIMATION ───────────────────────────
async function initNameReveal() {
  const hackEl = $('#name-hack');
  const realEl = $('#name-real');
  if (!hackEl || !realEl) return;

  const targetName = 'JOBI BL';
  const hackChars  = '!@#$%^&*0123456789ABCDEF';
  const steps      = 14;
  const delay      = 55;

  // Phase 1: Show scrambled hacker text
  hackEl.textContent = '';
  for (let s = 0; s < steps; s++) {
    await sleep(delay);
    hackEl.textContent = Array.from({ length: targetName.length }, () =>
      hackChars[Math.floor(Math.random() * hackChars.length)]
    ).join('');
  }

  // Phase 2: Resolve character by character
  let resolved = Array(targetName.length).fill(null);
  for (let i = 0; i < targetName.length; i++) {
    await sleep(delay + 20);
    resolved[i] = targetName[i];
    // Flash remaining chars
    hackEl.textContent = resolved.map((c, idx) =>
      c !== null ? '' : hackChars[Math.floor(Math.random() * hackChars.length)]
    ).join('');
    realEl.textContent = resolved.filter(c => c !== null).join('');
  }

  // Phase 3: Clear hack, show full real name
  hackEl.textContent = '';
  realEl.textContent = targetName;

  // Start typewriter after name resolves
  await sleep(300);
  initTypewriter();
}

// ─── 3. TYPEWRITER ───────────────────────────────────────────
async function initTypewriter() {
  const el = $('#hero-tagline');
  if (!el) return;

  el.textContent = '';
  for (let i = 0; i < TYPEWRITER_TEXT.length; i++) {
    await sleep(TYPEWRITER_SPEED + Math.random() * 30);
    el.textContent += TYPEWRITER_TEXT[i];
  }

  // Remove the border-right typing cursor indicator
  el.classList.add('done');
}

// ─── 4. UPTIME COUNTER ───────────────────────────────────────
function initUptimeCounter() {
  const el = $('#uptime-counter');
  if (!el) return;

  const start = Date.now();
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

// ─── 5. CRT TOGGLE ───────────────────────────────────────────
function initCRTToggle() {
  const btn     = $('#crt-toggle');
  const overlay = $('#crt-overlay');
  if (!btn || !overlay) return;

  let crtOn = false;

  btn.addEventListener('click', () => {
    crtOn = !crtOn;
    overlay.classList.toggle('active', crtOn);
    btn.classList.toggle('crt-on', crtOn);
    btn.querySelector('.crt-label').textContent = crtOn ? 'CRT ON' : 'CRT';
    showToast(crtOn ? '[CRT MODE: ENABLED]' : '[CRT MODE: DISABLED]', crtOn ? 'granted' : 'denied');
  });
}

// ─── 6. ACCESS TOAST ─────────────────────────────────────────
let toastTimer = null;

function showToast(message, type = 'granted') {
  const toast = $('#access-toast');
  const text  = $('#access-toast-text');
  if (!toast || !text) return;

  clearTimeout(toastTimer);
  toast.className = `access-toast ${type} show`;
  text.textContent = message;

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// ─── 7. ACTIVE NAV (IntersectionObserver) ────────────────────
function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => obs.observe(s));
}

// ─── 8. SKILL BAR ANIMATION ──────────────────────────────────
function initSkillBars() {
  const fills = $$('.skill-fill');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(f => obs.observe(f));
}

// ─── 9. NETWORK GRAPH NAVIGATION ─────────────────────────────
function initNetworkGraph() {
  const nodes = $$('.net-node[data-target]');

  nodes.forEach(node => {
    node.style.pointerEvents = 'all';
    node.style.cursor = 'pointer';

    node.addEventListener('mouseenter', () => {
      node.style.fill   = 'rgba(255,30,30,0.25)';
      node.style.stroke = '#ff6666';
    });

    node.addEventListener('mouseleave', () => {
      node.style.fill   = '';
      node.style.stroke = '';
    });

    node.addEventListener('click', () => {
      const target = node.dataset.target;
      const section = document.getElementById(target);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        showToast(`[NAVIGATING TO /${target.toUpperCase()}]`, 'granted');
      }
    });
  });
}

// ─── 10. CONTACT FORM VALIDATION ─────────────────────────────
function initContactForm() {
  const form    = $('#contact-form');
  const btnText = form?.querySelector('.btn-text');
  if (!form) return;

  const rules = {
    name:    { el: $('#field-name'),  err: $('#err-name'),  validate: v => v.trim().length >= 2 ? '' : '[ERROR] Name must be at least 2 characters.' },
    email:   { el: $('#field-email'), err: $('#err-email'), validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : '[ERROR] Invalid email address.' },
    message: { el: $('#field-msg'),   err: $('#err-msg'),   validate: v => v.trim().length >= 10 ? '' : '[ERROR] Message must be at least 10 characters.' },
  };

  // Live validation
  Object.values(rules).forEach(({ el, err, validate }) => {
    el?.addEventListener('blur', () => {
      err.textContent = validate(el.value);
    });
    el?.addEventListener('input', () => {
      if (err.textContent) err.textContent = validate(el.value);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    let valid = true;
    Object.values(rules).forEach(({ el, err, validate }) => {
      const msg = validate(el.value);
      err.textContent = msg;
      if (msg) valid = false;
    });

    if (!valid) {
      showToast('[ACCESS DENIED] — Fix validation errors.', 'denied');
      return;
    }

    // Simulate sending
    if (btnText) btnText.textContent = '$ ./send --encrypting...';
    await sleep(1200);
    if (btnText) btnText.textContent = '$ ./send --transmitting...';
    await sleep(800);

    showToast('[ACCESS GRANTED] — Message transmitted successfully.', 'granted');
    form.reset();
    if (btnText) btnText.textContent = '$ ./send --encrypt';
  });
}

// ─── 11. SMOOTH SCROLL NAV LINKS ─────────────────────────────
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id      = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      e.preventDefault();
      section.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ─── 12. NAV SCROLL BEHAVIOR ─────────────────────────────────
function initNavScroll() {
  const nav = $('#nav');
  if (!nav) return;

  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      nav.style.borderBottomColor = 'rgba(34,34,34,0.8)';
    } else {
      nav.style.borderBottomColor = '';
    }
    lastY = y;
  }, { passive: true });
}

// ─── 13. CARD GLITCH ON HOVER (JS augmentation) ──────────────
function initCardGlitch() {
  $$('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.setProperty('--glitch-active', '1');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--glitch-active', '0');
    });
  });
}

// ─── 14. SECTION REVEAL ANIMATION ────────────────────────────
function initSectionReveal() {
  const cards = $$('.card, .cert-entry, .project-card');

  cards.forEach(c => {
    c.style.opacity    = '0';
    c.style.transform  = 'translateY(16px)';
    c.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(c => obs.observe(c));
}

// ─── 15. FLOATING GHOST CATS ────────────────────────────────
function initGhostCats() {
  const ASCII_CATS = [
    '(=^･ω･^=)',
    '( ´ω` )',
    '≽^•⩊•^≼',
    '(=ↀωↀ=)',
    '/>  フ',
    '(˘ω˘)',
    '^ↀᴥↀ^',
    '(=^ ^=)',
    'ฅ^•ﻌ•^ฅ',
  ];

  const container = document.createElement('div');
  container.id = 'ghost-cats';
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = [
    'position:fixed',
    'inset:0',
    'pointer-events:none',
    'z-index:0',
    'overflow:hidden',
  ].join(';');
  document.body.prepend(container);

  function spawnCat() {
    const el   = document.createElement('span');
    const cat  = ASCII_CATS[Math.floor(Math.random() * ASCII_CATS.length)];
    const startX = Math.random() * 90;    // vw
    const startY = Math.random() * 80 + 10; // vh — avoid nav
    const dur    = 18 + Math.random() * 20; // seconds to drift
    const driftX = (Math.random() - 0.5) * 8; // vw drift
    const driftY = -(Math.random() * 12 + 6); // always drifts up
    const rot    = (Math.random() - 0.5) * 15;

    el.textContent = cat;
    el.style.cssText = [
      'position:absolute',
      `left:${startX}vw`,
      `top:${startY}vh`,
      'font-family:"JetBrains Mono",monospace',
      'font-size:0.7rem',
      'color:rgba(224,224,224,0.06)',
      'white-space:nowrap',
      'will-change:transform,opacity',
      `transition:none`,
    ].join(';');

    container.appendChild(el);

    // Animate using WAAPI for performance
    const anim = el.animate([
      { opacity: 0, transform: 'translate(0,0) rotate(0deg)' },
      { opacity: 1, offset: 0.1 },
      { opacity: 0.06, offset: 0.9 },
      { opacity: 0, transform: `translate(${driftX}vw,${driftY}vh) rotate(${rot}deg)` },
    ], {
      duration: dur * 1000,
      easing: 'linear',
      fill: 'forwards',
    });

    anim.onfinish = () => { el.remove(); spawnCat(); };
  }

  // Stagger initial spawns
  for (let i = 0; i < 9; i++) {
    setTimeout(spawnCat, i * 2200);
  }
}

// ─── 16. CAT PAW CURSOR TRAIL ────────────────────────────────
function initPawTrail() {
  const PAWS = ['🐾', '·͜·', '∙ω∙'];
  // Alternate left/right paw offset
  let side = 1;
  let lastX = -999, lastY = -999;
  const MIN_DIST = 48; // px before spawning next paw

  document.addEventListener('mousemove', e => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.hypot(dx, dy) < MIN_DIST) return;

    lastX = e.clientX;
    lastY = e.clientY;
    side *= -1;

    const el  = document.createElement('span');
    el.textContent = '🐾';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
      'position:fixed',
      `left:${e.clientX + side * 10}px`,
      `top:${e.clientY + 6}px`,
      'font-size:0.75rem',
      'pointer-events:none',
      'z-index:9997',
      'opacity:0.55',
      `transform:scaleX(${side}) rotate(${side * 12}deg)`,
      'transition:none',
      'will-change:opacity,transform',
    ].join(';');

    document.body.appendChild(el);

    el.animate([
      { opacity: 0.55, transform: `scaleX(${side}) rotate(${side * 12}deg) scale(1)` },
      { opacity: 0,    transform: `scaleX(${side}) rotate(${side * 20}deg) scale(0.5) translateY(-8px)` },
    ], { duration: 900, easing: 'ease-out', fill: 'forwards' })
      .onfinish = () => el.remove();
  });
}

// ─── 17. BOOT SEQUENCE (Hero micro-effect) ───────────────────
async function initBootSequence() {
  // Small delay to let fonts load
  await sleep(200);
  await initNameReveal();
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMatrixRain();
  initBootSequence();
  initUptimeCounter();
  initCRTToggle();
  initActiveNav();
  initSkillBars();
  initNetworkGraph();
  initContactForm();
  initSmoothScroll();
  initNavScroll();
  initCardGlitch();
  initSectionReveal();
  // ── Cat animations ──
  initGhostCats();
  initPawTrail();
});
