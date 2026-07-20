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

  // Use larger font on mobile = fewer columns = much better performance
  const fontSize = window.innerWidth <= 768 ? 20 : 13;
  // On mobile draw every other frame to halve GPU load
  let frame = 0;
  const skipFrames = window.innerWidth <= 768 ? 1 : 0;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    cols  = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -50);
  }

  function draw() {
    animId = requestAnimationFrame(draw);
    if (skipFrames && frame++ % 2 !== 0) return;

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

// ─── 5. THEME SWITCHER ────────────────────────────────
const THEMES = {
  default: { label: 'DEFAULT', icon: '◉' },
  mono:    { label: 'MONO',    icon: '◈' },
  '8bit':  { label: '8-BIT',  icon: '▩' },
  cat:     { label: 'CAT',     icon: '🐱' },
};

function initThemeSwitcher() {
  const panel     = $('#theme-panel');
  const toggleBtn = $('#theme-toggle-btn');
  const btnIcon   = $('#theme-btn-icon');
  const btnLabel  = $('#theme-btn-label');
  const options   = $$('.theme-option');
  if (!panel || !toggleBtn) return;

  // Restore saved theme
  const saved = localStorage.getItem('portfolio-theme') || 'default';
  applyTheme(saved);

  // Toggle panel open/close
  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle('open');
    toggleBtn.classList.toggle('active', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    panel.setAttribute('aria-hidden', String(!isOpen));
  });

  // Click outside to close
  document.addEventListener('click', e => {
    if (!$('#theme-switcher').contains(e.target)) {
      panel.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }
  });

  // Theme option clicks — with glitch transition
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      const current = document.body.getAttribute('data-theme') || 'default';
      // Close panel immediately
      panel.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      
      if (theme === 'crash') {
        playCrashSequence();
        return;
      }
      
      if (current === theme) return;
      // Play glitch, then switch at 50% through
      playThemeGlitch(theme, () => {
        applyTheme(theme);
        localStorage.setItem('portfolio-theme', theme);
      });
    });
  });

  function applyTheme(theme) {
    const t = THEMES[theme] || THEMES.default;
    // Set body attribute
    if (theme === 'default') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
    // Update button display
    if (btnIcon)  btnIcon.textContent  = t.icon;
    if (btnLabel) btnLabel.textContent = t.label;
    // Update aria-selected on options
    options.forEach(opt => {
      opt.setAttribute('aria-selected', opt.dataset.theme === theme ? 'true' : 'false');
    });
    // Show toast
    const labels = { default: 'DEFAULT MODE', mono: 'MONOCHROME MODE', '8bit': '8-BIT MODE', cat: 'CAT MODE 🐱' };
    showToast(`[THEME: ${labels[theme] || theme.toUpperCase()}]`, theme === 'default' ? 'granted' : 'granted');
  }
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
const isMobile  = () => window.innerWidth <= 768;
const isTouch   = () => window.matchMedia('(pointer: coarse)').matches;
const isReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  if (!isReduced()) initMatrixRain();
  initBootSequence();
  initScrollProgress();
  initUptimeCounter();
  initThemeSwitcher();
  initActiveNav();
  initSkillBars();
  initNetworkGraph();
  initContactForm();
  initSmoothScroll();
  initNavScroll();
  initMobileNav();        // ← hamburger menu
  initCardGlitch();
  initSectionReveal();
  initClickRipple();
  if (!isReduced()) initTerminalBg();
  initHiddenTerminal();
  // ── Cat animations ──
  initGhostCats();
  if (!isTouch()) initPawTrail();      // paw trail only on pointer devices
  initCatButtonEffect();
  if (!isTouch()) initCatCursorFollower(); // cursor follower: desktop only
});

// ─── MOBILE NAV — HAMBURGER ───────────────────────────────────
function initMobileNav() {
  const btn   = document.getElementById('nav-hamburger');
  const links = document.getElementById('nav-links-list');
  if (!btn || !links) return;

  function close() {
    btn.classList.remove('open');
    links.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const opening = btn.classList.toggle('open');
    links.classList.toggle('open', opening);
    btn.setAttribute('aria-expanded', String(opening));
  });

  // Close when a link is clicked
  links.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) close();
  });

  // Close on resize back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) close();
  }, { passive: true });
}


// ─── LOADING SCREEN ──────────────────────────────────────────
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  const log    = document.getElementById('ls-log');
  const bar    = document.getElementById('ls-bar');
  const skip   = document.getElementById('ls-skip');
  if (!screen || !log) return;

  const LINES = [
    { type: 'head',  text: 'PORTFOLIO_OS v1.0 — Security Suite' },
    { type: 'head',  text: '─'.repeat(40) },
    { type: 'ok',    text: 'BIOS v2.4.1 initialized' },
    { type: 'ok',    text: 'CPU: Cyber-Analyst-Core @ 3.6GHz' },
    { type: 'ok',    text: 'RAM: 16384 MB threat-detection buffer' },
    { type: 'load',  text: 'Importing security modules...' },
    { type: 'ok',    text: 'Wazuh SIEM daemon started' },
    { type: 'ok',    text: 'Suricata IDS: active, monitoring' },
    { type: 'ok',    text: 'Firewall: 1,337 rules loaded' },
    { type: 'ok',    text: 'Certificate store: 6 certs verified' },
    { type: 'ok',    text: 'Threat intel feeds synced' },
    { type: 'load',  text: 'Mounting /home/jobi-bl...' },
    { type: 'ok',    text: 'Portfolio interface ready' },
    { type: 'grant', text: '> ACCESS GRANTED' },
  ];
  // Cumulative delay for each line (ms)
  const DELAYS = [0,30,110,130,110,90,210,140,160,120,110,180,150,450];

  let done = false;
  function finish() {
    if (done) return;
    done = true;
    screen.classList.add('ls-fade');
    setTimeout(() => screen.remove(), 620);
  }

  skip.addEventListener('click', finish);
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') { finish(); document.removeEventListener('keydown', onEsc); }
  }, { once: false });

  let cumDelay = 0;
  LINES.forEach((line, i) => {
    cumDelay += DELAYS[i] || 100;
    const pct = Math.round((i / (LINES.length - 1)) * 100);
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'ls-line';
      if (line.type === 'ok') {
        div.innerHTML = `<span class="ls-status ls-status--ok">[  OK  ]</span><span class="ls-text">${line.text}</span>`;
      } else if (line.type === 'load') {
        div.innerHTML = `<span class="ls-status ls-status--load">[ LOAD ]</span><span class="ls-text">${line.text}</span>`;
      } else if (line.type === 'grant') {
        div.innerHTML = `<span class="ls-text ls-text--grant">${line.text}</span>`;
      } else {
        div.innerHTML = `<span class="ls-text ls-text--head">${line.text}</span>`;
      }
      log.appendChild(div);
      if (bar) bar.style.width = `${pct}%`;
      if (i === LINES.length - 1) setTimeout(finish, 700);
    }, cumDelay);
  });
}

// ─── SCROLL PROGRESS ─────────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ─── HIDDEN TERMINAL ─────────────────────────────────────────
function initHiddenTerminal() {
  // ── Build DOM ──
  const term = document.createElement('div');
  term.id = 'hterm';
  term.setAttribute('aria-label', 'Hidden terminal');
  term.innerHTML = `
    <div class="hterm-bar" id="hterm-bar">
      <span class="hterm-dot hterm-dot--r"></span>
      <span class="hterm-dot hterm-dot--y"></span>
      <span class="hterm-dot hterm-dot--g"></span>
      <span class="hterm-title">jobi@soc-lab: ~</span>
      <button class="hterm-close" id="hterm-close" aria-label="Close terminal">×</button>
    </div>
    <div class="hterm-output" id="hterm-output"></div>
    <div class="hterm-input-row">
      <span class="hterm-prompt-label">jobi@soc-lab:~$&nbsp;</span>
      <input type="text" class="hterm-input" id="hterm-input"
             autocomplete="off" autocorrect="off" spellcheck="false"
             aria-label="Terminal input" placeholder="">
    </div>`;
  document.body.appendChild(term);

  const hint = document.createElement('div');
  hint.className = 'hterm-kbd-hint';
  hint.textContent = '[ ` ] terminal';
  document.body.appendChild(hint);

  const out    = document.getElementById('hterm-output');
  const inp    = document.getElementById('hterm-input');
  const closeB = document.getElementById('hterm-close');

  // ── Command definitions ──
  let cmdHistory = [], hIdx = -1;
  const CMDS = {
    help: () =>
`\nAvailable commands:\n
  whoami          identity & contact info
  ls              list portfolio sections
  ls certs        list all certifications
  ls skills       list technical skills
  ls projects     list projects with details
  cat about.txt   profile summary
  cat contact.txt contact details
  nmap localhost  scan this machine
  uname -a        system info
  uptime          how long running
  date            current date/time
  ping [target]   ping a target
  ssh soc-lab     connect to home lab
  sudo [cmd]      try your luck
  history         command history
  clear           clear terminal
  exit            close terminal\n`,

    whoami: () =>
`\njobi-bl\n${'─'.repeat(40)}
Name:     JOBI B L
Role:     Aspiring SOC Analyst | Cybersecurity Intern
Location: Trivandrum, Kerala, India
Email:    jobibl777@gmail.com
GitHub:   github.com/Jobi-bl
LinkedIn: linkedin.com/in/jobi-b-l\n`,

    ls: () =>
`\ntotal 7\ndrwxr-xr-x  hero/\ndrwxr-xr-x  skills/\ndrwxr-xr-x  experience/\ndrwxr-xr-x  projects/\ndrwxr-xr-x  certifications/\ndrwxr-xr-x  contact/\n-rw-r--r--  Jobi_BL_CV.pdf\n`,

    'ls certs': () =>
`\n-rwxr--r--  Certified SOC Analyst (CSA) v2            EC-Council        Jun 2026
-rw-r--r--  Cybersecurity Job Simulation               Mastercard/Forage Feb 2026
-rw-r--r--  Cybersecurity Analyst Job Simulation       Tata/Forage       Feb 2026
-rw-r--r--  Certified IT Infrastructure & SOC Analyst  RedTeam HA        Jun 2026
-rwxr--r--  Certified LLM Security Professional        Red Team Leaders  Jul 2026
-rwxr--r--  CICSA v3                                   RedTeam HA        Jul 2026
-rw-r--r--  Cyber Job Simulation                       Deloitte/Forage   Jul 2026\n`,

    'ls skills': () =>
`\n── Defensive ──────────────────────────────────
  Wazuh SIEM    Suricata IDS    Incident Response
  Log Analysis  Alert Triage    MITRE ATT&CK

── Offensive / Assessment ─────────────────────
  Nmap          Metasploit      Burp Suite
  Kali Linux    OSINT           Vulnerability Scanning

── Development ────────────────────────────────
  Python        Bash            SQL
  Secure Auth   REST APIs

── Active Practice ────────────────────────────
  TryHackMe     HackTheBox      OverTheWire\n`,

    'ls projects': () =>
`\n01. Python Vulnerability Scanner
    ├─ Engineered during Thiranex internship (Jun–Jul 2026)
    └─ Tests auth endpoints, SQLi, XSS attack vectors

02. Home SOC Lab
    ├─ Stack: Wazuh + Kali Linux + Ubuntu VMs
    └─ Real attack simulation & alert triage practice

03. Phishing Email Detector
    ├─ NLP + ML classification model
    └─ github.com/Jobi-bl/Phishing-email-detection-model

04. Secure Login System
    └─ github.com/Jobi-bl/Secure-login-system-\n`,

    'cat about.txt': () =>
`\nCybersecurity intern with hands-on project experience in
vulnerability scanning, secure authentication, SIEM-based
detection, and network fundamentals.

Built a home SOC lab using Wazuh, Kali Linux, and Ubuntu
to practice real attack simulation and alert triage.

Currently completing a project-based internship at Thiranex
with an EC-Council Certified SOC Analyst (CSA) certification
and active practice on TryHackMe, HackTheBox, OverTheWire.\n`,

    'cat contact.txt': () =>
`\nEmail:    jobibl777@gmail.com
Phone:    +91 7736240524
GitHub:   github.com/Jobi-bl
LinkedIn: linkedin.com/in/jobi-b-l
Location: Trivandrum, Kerala, India\n`,

    'nmap localhost': () =>
`\nStarting Nmap 7.94 ( https://nmap.org )
Host: localhost (127.0.0.1) is up (0.0001s latency)

PORT     STATE    SERVICE   VERSION
80/tcp   open     http      Portfolio OS v1.0
443/tcp  open     https     TLS 1.3 (ECDHE-RSA-AES256-GCM)
22/tcp   filtered ssh       [firewall drop]
3306/tcp filtered mysql     [firewall drop]

Nmap done: 1 IP address scanned in 0.42s\n`,

    'uname -a': () =>
`\nPortfolioOS 5.15.0-soc-analyst #1 SMP ${new Date().getFullYear()}
Architecture: x86_64   Defense Level: MAXIMUM
Threat Status: MONITORING   Incidents: 0\n`,

    uptime: () => {
      const t = new Date();
      return `\n${t.toLocaleTimeString()} up 365 days, always monitoring, 1 user (jobi)\nload average: 0.00 threats, 0.00 breaches, 0.00 incidents\n`;
    },
    date: () => `\n${new Date().toString()}\n`,

    'ssh soc-lab': () =>
`\nConnecting to soc-lab.local (192.168.1.100)...
Warning: Permanently added 'soc-lab.local' to known hosts.

Last login: ${new Date().toDateString()} from 192.168.1.42

 ██╗  ██╗ ██████╗ ███╗   ███╗███████╗    ██╗      █████╗ ██████╗
 ██║  ██║██╔═══██╗████╗ ████║██╔════╝    ██║     ██╔══██╗██╔══██╗
 ███████║██║   ██║██╔████╔██║█████╗      ██║     ███████║██████╔╝
 ██╔══██║██║   ██║██║╚██╔╝██║██╔══╝      ██║     ██╔══██║██╔══██╗
 ██║  ██║╚██████╔╝██║ ╚═╝ ██║███████╗    ███████╗██║  ██║██████╔╝
 ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝    ╚══════╝╚═╝  ╚═╝╚═════╝

[jobi@kali-soc ~]$ _\n`,
  };

  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function print(cmd, result, isErr) {
    if (cmd !== null) {
      const row = document.createElement('div');
      row.innerHTML = `<span class="hterm-row-prompt">jobi@soc-lab:~$</span> <span class="hterm-row-cmd">${esc(cmd)}</span>`;
      out.appendChild(row);
    }
    if (result !== null && result !== undefined) {
      const r = document.createElement('span');
      r.className = isErr ? 'hterm-out-err' : 'hterm-out-text';
      r.textContent = result;
      out.appendChild(r);
    }
    out.scrollTop = out.scrollHeight;
  }

  let welcomed = false;
  function welcome() {
    if (welcomed) return;
    welcomed = true;
    const w = document.createElement('span');
    w.className = 'hterm-out-ok';
    w.textContent =
`\nPortfolioOS Terminal v1.0 — Jobi BL Security Suite
Type 'help' for available commands. Press \` to toggle.\n${'─'.repeat(50)}\n`;
    out.appendChild(w);
  }

  function runCmd(raw) {
    const t = raw.trim();
    if (!t) return;
    if (cmdHistory[cmdHistory.length - 1] !== t) cmdHistory.push(t);
    hIdx = cmdHistory.length;

    if (t === 'clear') { out.innerHTML = ''; return; }
    if (t === 'exit')  { closeTerm(); return; }
    if (t === 'history') {
      print(t, '\n' + cmdHistory.map((h, i) => `  ${String(i+1).padStart(3)}  ${h}`).join('\n') + '\n', false);
      return;
    }

    const parts = t.split(' ');
    const base  = parts[0].toLowerCase();

    // sudo
    if (base === 'sudo') {
      const sub = parts.slice(1).join(' ');
      if (sub.includes('rm') && sub.includes('-rf')) {
        print(t, '\nPermission denied. Nice try! 😄 Your portfolio is safe.\n', true);
      } else {
        print(t, `\n[sudo] password for jobi: ****\njobi is not in the sudoers file. This incident will be reported.\n`, true);
      }
      return;
    }

    // ping
    if (base === 'ping') {
      const tgt = parts[1] || 'localhost';
      print(t, `\nPING ${tgt} 56(84) bytes of data\n64 bytes from ${tgt}: icmp_seq=1 ttl=64 time=0.042 ms\n64 bytes from ${tgt}: icmp_seq=2 ttl=64 time=0.039 ms\n64 bytes from ${tgt}: icmp_seq=3 ttl=64 time=0.041 ms\n\n--- ${tgt} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss\n`, false);
      return;
    }

    if (base === 'nmap') { print(t, CMDS['nmap localhost'](), false); return; }
    if (base === 'ssh')  { print(t, CMDS['ssh soc-lab'](),  false); return; }

    // easter eggs
    const EGGS = {
      'hack':           '\n  [HACK THE PLANET!] 💻🔥\n\n  "Hackers are the immune system of the internet."\n                    — Unknown SOC Analyst\n',
      'hack the planet':'\n  [HACK THE PLANET!] 💻🔥\n\n  Wake up, Neo. Follow the white rabbit. 🐇\n',
      'matrix':         '\n  Wake up, Neo...\n  The Matrix has you.\n  Follow the white rabbit. 🐇\n',
      'cat flag.txt':   '\n  flag{s0c_4n4lyst_1n_th3_mak1ng} 🏆\n  Nice try — keep hacking!\n',
      'ls /':           '\nbin/  boot/  dev/  etc/  home/  jobi/  proc/  secrets/  var/\n',
      'cat /jobi/secrets': '\nPermission denied.\n(There are no secrets — just hard work and consistency.)\n',
      'hello':          '\nHello! 👋 Welcome to my portfolio terminal.\nType "help" to see what I can do.\n',
      'pwd':            '\n/home/jobi-bl/portfolio\n',
      'whoami --full':  '\nA passionate cybersecurity intern who loves\nbuilding SOC labs, chasing flags, and defending networks.\n',
    };

    if (EGGS[t]) { print(t, EGGS[t], false); return; }

    if (CMDS[t])    { print(t, CMDS[t](),    false); return; }
    if (CMDS[base]) { print(t, CMDS[base](), false); return; }

    print(t, `\nbash: ${esc(base)}: command not found\nType 'help' for available commands.\n`, true);
  }

  // ── Input events ──
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = inp.value; inp.value = '';
      runCmd(v);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIdx > 0) { hIdx--; inp.value = cmdHistory[hIdx] || ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx < cmdHistory.length - 1) { hIdx++; inp.value = cmdHistory[hIdx]; }
      else { hIdx = cmdHistory.length; inp.value = ''; }
    }
  });

  function closeTerm() { term.classList.remove('open'); }
  closeB.addEventListener('click', closeTerm);

  // ── Toggle with backtick ──
  document.addEventListener('keydown', e => {
    if (e.key === '`' && !e.target.matches('input,textarea,[contenteditable]')) {
      e.preventDefault();
      const opening = term.classList.toggle('open');
      if (opening) { welcome(); inp.focus(); }
    }
    if (e.key === 'Escape' && term.classList.contains('open')) closeTerm();
  });

  // ── Drag ──
  let dragging = false, ox = 0, oy = 0;
  document.getElementById('hterm-bar').addEventListener('mousedown', e => {
    dragging = true;
    const r = term.getBoundingClientRect();
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    term.style.left      = `${e.clientX - ox}px`;
    term.style.top       = `${e.clientY - oy}px`;
    term.style.transform = 'none';
    term.style.bottom    = 'auto';
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });
}



// ─── THEME GLITCH TRANSITION ─────────────────────────────────
function playThemeGlitch(toTheme, onDone) {
  const DURATION = 400;
  const W = window.innerWidth;
  const H = window.innerHeight;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  Object.assign(canvas.style, {
    position:      'fixed',
    inset:         '0',
    zIndex:        '99998',
    pointerEvents: 'none',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let applied = false;
  const start  = performance.now();

  (function frame(now) {
    const t = Math.min((now - start) / DURATION, 1);
    const intensity = Math.sin(t * Math.PI); // peaks at t=0.5

    // Apply theme at halfway point
    if (!applied && t >= 0.5) { applied = true; onDone(); }

    ctx.clearRect(0, 0, W, H);

    if      (toTheme === 'default') glitchChromatic(ctx, intensity, W, H);
    else if (toTheme === 'mono')    glitchStatic(ctx, intensity, W, H);
    else if (toTheme === '8bit')    glitchPixels(ctx, intensity, W, H);
    else if (toTheme === 'cat')     glitchCat(ctx, intensity, W, H);
    else                            glitchChromatic(ctx, intensity, W, H);

    if (t < 1) requestAnimationFrame(frame);
    else { if (!applied) onDone(); canvas.remove(); }
  })(start);
}

// chromatic aberration — red/blue scan bands
function glitchChromatic(ctx, k, W, H) {
  const bands = 6 + Math.floor(Math.random() * 8);
  for (let i = 0; i < bands; i++) {
    const y   = Math.random() * H;
    const h   = 1 + Math.random() * 38 * k;
    const off = (Math.random() - 0.5) * 40 * k;
    ctx.fillStyle = `rgba(255,0,60,${0.35 * k})`;
    ctx.fillRect(off, y, W, h);
    ctx.fillStyle = `rgba(0,80,255,${0.25 * k})`;
    ctx.fillRect(-off, y + 3, W, h * 0.7);
    if (Math.random() > 0.6) {
      ctx.fillStyle = `rgba(255,255,255,${0.12 * k})`;
      ctx.fillRect(0, y, W, 1 + Math.random() * 3);
    }
  }
  // horizontal offset slice
  if (Math.random() > 0.5) {
    const sy = Math.floor(Math.random() * H);
    const sh = 4 + Math.floor(Math.random() * 20);
    try {
      const slice = ctx.getImageData(0, sy, W, sh);
      ctx.putImageData(slice, (Math.random() - 0.5) * 20 * k, sy);
    } catch(_) {}
  }
}

// tv static noise — rapid pixel flicker
function glitchStatic(ctx, k, W, H) {
  const count = Math.floor(3000 * k);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const s = 1 + Math.floor(Math.random() * 4);
    const v = Math.floor(Math.random() * 255);
    ctx.fillStyle = `rgba(${v},${v},${v},${0.7 * k})`;
    ctx.fillRect(x, y, s, s);
  }
  // dark scanlines
  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = `rgba(0,0,0,${0.12 * k})`;
    ctx.fillRect(0, y, W, 1);
  }
}

// NES pixel blocks — chunky retro glitch
function glitchPixels(ctx, k, W, H) {
  const PAL = ['#FF2A00','#FFFF00','#00FF44','#00DDFF','#FF00FF','#FFFFFF','#FF8800','#0033FF'];
  const blockW = 16;
  const num = Math.floor(14 * k) + 2;
  for (let i = 0; i < num; i++) {
    const bx = Math.floor(Math.random() * (W / blockW)) * blockW;
    const by = Math.floor(Math.random() * (H / blockW)) * blockW;
    const bw = blockW * (1 + Math.floor(Math.random() * 8));
    const bh = blockW * (1 + Math.floor(Math.random() * 3));
    ctx.globalAlpha = 0.45 + Math.random() * 0.45;
    ctx.fillStyle   = PAL[Math.floor(Math.random() * PAL.length)];
    ctx.fillRect(bx, by, bw, bh);
  }
  ctx.globalAlpha = 1;
  // vertical colour split
  if (Math.random() > 0.4) {
    const sx = Math.floor(Math.random() * W);
    ctx.fillStyle = `rgba(255,255,0,${0.08 * k})`;
    ctx.fillRect(sx, 0, 4, H);
  }
}

// Catppuccin pink/mauve bands + 🐾
function glitchCat(ctx, k, W, H) {
  // soft pink bloom
  ctx.fillStyle = `rgba(243,139,168,${0.18 * k})`;
  ctx.fillRect(0, 0, W, H);
  // mauve/blue bands
  const COLS = ['#f38ba8','#cba6f7','#89b4fa','#a6e3a1','#f5c2e7'];
  const num = Math.floor(8 * k) + 2;
  for (let i = 0; i < num; i++) {
    const y = Math.random() * H;
    const h = 1 + Math.random() * 25 * k;
    ctx.fillStyle = COLS[Math.floor(Math.random() * COLS.length)] + Math.floor(k * 99).toString(16).padStart(2,'0');
    ctx.fillRect(0, y, W, h);
  }
  // paw text scatter
  const PAWS = ['🐾','=^.^=','ฅ','(=ↀωↀ=)','>^ω^<'];
  ctx.font = '1.2rem "JetBrains Mono", monospace';
  ctx.fillStyle = `rgba(245,194,231,${0.5 * k})`;
  const np = Math.floor(6 * k);
  for (let i = 0; i < np; i++) {
    ctx.fillText(PAWS[Math.floor(Math.random() * PAWS.length)],
      Math.random() * W, Math.random() * H);
  }
}

// ─── CRASH SEQUENCE — TEXT CORRUPTION VIRUS ──────────────────
function playCrashSequence() {
  if (document.body.classList.contains('crash-glitch')) return; // prevent double-fire

  // Glitch characters pool
  const CORRUPT = '█▓▒░▄▀■□▪▫◘◙◆◇○●◎✦✧⚡⊗⊕⊘⊙±×÷∞∅∆∇∏∑∫≈≠≡≤≥01#@$%&!?';

  // ── 1. Collect all text nodes (skip scripts / styles) ──
  const textNodes = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (['SCRIPT','STYLE','NOSCRIPT'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (p.closest('#crash-overlay,#loading-screen,#hterm,#scroll-progress')) return NodeFilter.FILTER_REJECT;
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;
    textNodes.push({ node, original: node.textContent });
  }

  if (textNodes.length === 0) return;

  // ── 2. Start page glitch ──
  document.body.classList.add('crash-glitch');

  // ── 3. Corruption spread — wave from top to bottom ──
  // Build a flat list of all characters across all nodes
  let allChars = [];
  textNodes.forEach(({ node, original }, ni) => {
    for (let ci = 0; ci < original.length; ci++) {
      if (original[ci].trim()) allChars.push({ ni, ci });
    }
  });

  // Shuffle to spread randomly like a virus
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  // Build mutable char arrays for each node
  const mutable = textNodes.map(({ original }) => original.split(''));

  let idx = 0;
  const batchSize = Math.max(1, Math.floor(allChars.length / 80)); // ~80 frames
  const corruptInterval = setInterval(() => {
    for (let b = 0; b < batchSize && idx < allChars.length; b++, idx++) {
      const { ni, ci } = allChars[idx];
      mutable[ni][ci] = CORRUPT[Math.floor(Math.random() * CORRUPT.length)];
    }
    // Re-render changed nodes
    const changedNodes = new Set(allChars.slice(Math.max(0, idx - batchSize), idx).map(c => c.ni));
    changedNodes.forEach(ni => {
      textNodes[ni].node.textContent = mutable[ni].join('');
    });

    if (idx >= allChars.length) {
      clearInterval(corruptInterval);
      // Show pitch-black for 2s, then recover
      const blackout = document.createElement('div');
      Object.assign(blackout.style, {
        position: 'fixed', inset: '0', zIndex: '999999',
        background: '#000', pointerEvents: 'none',
      });
      document.body.appendChild(blackout);
      setTimeout(recoverAll, 2000);
    }
  }, 18); // ~55fps

  // ── 4. Recover — restore all original text ──
  function recoverAll() {
    document.body.classList.remove('crash-glitch');

    // Remove blackout
    const blackout = document.querySelector('div[style*="999999"]');
    if (blackout) blackout.remove();

    // White flash like a reboot
    const flash = document.createElement('div');
    flash.className = 'crash-recover-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);

    // Restore text nodes
    textNodes.forEach(({ node, original }) => { node.textContent = original; });
  }
}



// ─── CLICK RIPPLE — VIRUS BURST ──────────────────────────────
function initClickRipple() {
  // ── Character pool: binary, hex, symbols, katakana ──
  const POOL = [
    // binary bias
    '0','1','0','1','0','1','0','1',
    // hex
    'A','B','C','D','E','F','a','b','c','d','e','f',
    '0','1','2','3','4','5','6','7','8','9',
    // symbols
    '#','$','%','@','!','>','<','{','}','[',']',
    '|','/','\\','^','&','*','~','+','=','?',
    // katakana (hacker aesthetic)
    'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ',
    'サ','シ','ス','セ','ソ','ナ','ニ','ヌ','ネ','ノ',
  ];

  // ── Theme colours [r, g, b] ──
  const COLORS = {
    default: [255,  30,  70],   // red
    mono:    [210, 210, 210],   // white
    '8bit':  [255, 220,   0],   // yellow
    cat:     [203, 166, 247],   // catppuccin mauve
  };

  function rgb(alpha) {
    const t = document.body.getAttribute('data-theme') || 'default';
    const [r, g, b] = COLORS[t] || COLORS.default;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── Click listener — skip interactive elements ──
  document.addEventListener('click', e => {
    if (e.target.closest(
      'a, button, input, textarea, select, label, ' +
      '.btn, .nav-link, .theme-toggle-btn, .theme-panel, ' +
      '.contact-link, .skill-bar, [role="button"]'
    )) return;
    burst(e.clientX, e.clientY);
  });

  // ── Main burst function ──
  function burst(cx, cy) {
    shockwave(cx, cy);
    flash(cx, cy);
    // Primary burst — dense cluster
    const count = 45 + Math.floor(Math.random() * 18);
    for (let i = 0; i < count; i++) particle(cx, cy, 30, 280);
    // Secondary cascade — far fliers covering full screen
    setTimeout(() => {
      const maxDist = Math.hypot(window.innerWidth, window.innerHeight);
      const count2 = 28 + Math.floor(Math.random() * 14);
      for (let i = 0; i < count2; i++) particle(cx, cy, 280, maxDist * 0.9);
    }, 190);
  }

  // ── Expanding shockwave ring ──
  function shockwave(cx, cy) {
    const ring = document.createElement('div');
    Object.assign(ring.style, {
      position:      'fixed',
      left:          `${cx}px`,
      top:           `${cy}px`,
      width:         '6px',
      height:        '6px',
      borderRadius:  '50%',
      border:        `1.5px solid ${rgb(0.9)}`,
      transform:     'translate(-50%,-50%)',
      pointerEvents: 'none',
      zIndex:        '9997',
    });
    document.body.appendChild(ring);
    ring.animate([
      { width:'6px',   height:'6px',   opacity:1,   borderWidth:'1.5px' },
      { width:'180px', height:'180px', opacity:0,   borderWidth:'0.3px' },
    ], { duration:600, easing:'ease-out', fill:'forwards' })
      .onfinish = () => ring.remove();

    // Second slower ring
    const ring2 = ring.cloneNode();
    ring2.style.border = `1px solid ${rgb(0.5)}`;
    document.body.appendChild(ring2);
    ring2.animate([
      { width:'6px',   height:'6px',   opacity:0.6, borderWidth:'1px' },
      { width:'280px', height:'280px', opacity:0,   borderWidth:'0.2px' },
    ], { duration:900, easing:'ease-out', fill:'forwards' })
      .onfinish = () => ring2.remove();
  }

  // ── Brief bright centre flash ──
  function flash(cx, cy) {
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position:      'fixed',
      left:          `${cx}px`,
      top:           `${cy}px`,
      width:         '8px',
      height:        '8px',
      borderRadius:  '50%',
      background:    rgb(1),
      transform:     'translate(-50%,-50%)',
      pointerEvents: 'none',
      zIndex:        '9999',
      boxShadow:     `0 0 12px 4px ${rgb(0.6)}`,
    });
    document.body.appendChild(dot);
    dot.animate([
      { opacity:1, transform:'translate(-50%,-50%) scale(1)' },
      { opacity:0, transform:'translate(-50%,-50%) scale(3)' },
    ], { duration:250, easing:'ease-out', fill:'forwards' })
      .onfinish = () => dot.remove();
  }

  // ── Individual particle ──
  function particle(cx, cy, minDist = 30, maxDist = 280) {
    const el   = document.createElement('span');
    el.textContent = POOL[Math.floor(Math.random() * POOL.length)];

    const angle = Math.random() * Math.PI * 2;
    const dist  = minDist + Math.pow(Math.random(), 0.45) * (maxDist - minDist);
    const dx    = Math.cos(angle) * dist;
    const dy    = Math.sin(angle) * dist;
    const rot   = (Math.random() - 0.5) * 220;         // ±110° rotation
    const size  = 0.4 + Math.random() * 0.9;           // rem
    const bold  = Math.random() > 0.55;
    const dur   = 400 + Math.random() * 700;           // 400–1100ms

    Object.assign(el.style, {
      position:    'fixed',
      left:        `${cx}px`,
      top:         `${cy}px`,
      fontFamily:  '"JetBrains Mono", monospace',
      fontSize:    `${size}rem`,
      fontWeight:  bold ? '700' : '400',
      color:       rgb(0.95),
      pointerEvents:'none',
      zIndex:      '9998',
      userSelect:  'none',
      willChange:  'transform, opacity',
    });

    document.body.appendChild(el);

    el.animate([
      {
        opacity:   1,
        transform: `translate(-50%,-50%) translate(0px,0px) rotate(0deg) scale(1.4)`,
        textShadow:`0 0 8px ${rgb(0.8)}`,
      },
      {
        opacity:   0,
        transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) rotate(${rot}deg) scale(0.1)`,
        textShadow:`0 0 2px ${rgb(0.1)}`,
      },
    ], {
      duration: dur,
      easing:   'cubic-bezier(0.05, 0.6, 0.25, 1)',
      fill:     'forwards',
    }).onfinish = () => el.remove();
  }
}



// ─── TERMINAL BACKGROUND LINES ───────────────────────────────
function initTerminalBg() {
  // ── Line pools ──
  const COMMANDS = [
    'nmap -sV -p 1-65535 192.168.1.0/24',
    'sudo tail -f /var/log/syslog',
    'tcpdump -i eth0 -n port 443',
    'grep -r "FAILED" /var/log/auth.log',
    'ssh -i ~/.ssh/id_rsa root@10.0.0.1',
    'wireshark -k -i wlan0',
    'hydra -l admin -P rockyou.txt ssh://10.10.14.1',
    'hashcat -m 0 hash.txt rockyou.txt',
    'airmon-ng start wlan0',
    'netstat -tulnp | grep LISTEN',
    'ps aux | grep suspicious',
    'find / -perm -4000 -type f 2>/dev/null',
    'ls -la /etc/passwd /etc/shadow',
    'curl -s http://10.10.10.1/api/v1/users',
    'john --wordlist=rockyou.txt hashes.txt',
    'volatility -f mem.raw imageinfo',
    'sqlmap -u "http://target.com/?id=1" --dbs',
    'msfconsole -q -x "use exploit/multi/handler"',
    'chmod 600 ~/.ssh/id_rsa && ssh-keygen -t ed25519',
    'dig @8.8.8.8 target.com ANY',
  ];

  const BINARY = [
    '01001010 01001111 01000010 01001001',
    '0xDEADBEEF 0xCAFEBABE 0xFF00FF00',
    '48 65 6C 6C 6F 20 57 6F 72 6C 64',
    '11001010 00110011 10101010 01010101',
    '0x7F454C46 0x02010100 0x00000000',
    '01110011 01100101 01100011 01110101',
    '0xA3F2 >> 0x04 | 0x1B && 0xFF',
    'SHA256: e3b0c44298fc1c149afb4c8996fb92427a',
    'MD5: 098f6bcd4621d373cade4e832627b4f6',
    '4a 6f 62 69 20 42 4c 20 7c 20 53 4f 43',
  ];

  const LOGS = [
    '[INFO]  Wazuh SIEM: 0 critical alerts',
    '[ALERT] Intrusion attempt detected — src 185.220.101.47',
    '[INFO]  TLS handshake complete — cipher AES256-GCM',
    '[WARN]  Port scan detected from 10.0.0.54',
    '[INFO]  Firewall rule applied: DROP IN tcp dpt:22',
    '[OK]    Vulnerability scan complete — 3 findings',
    '[INFO]  SIEM correlation rule triggered: brute-force',
    '[ALERT] Anomalous outbound traffic: 10.0.0.12 → 104.21.x.x',
    '[INFO]  Suricata: ET SCAN potential ssh scan',
    '[INFO]  Deploying honeypot on 192.168.99.1:2222',
    '[OK]    Patch applied: CVE-2024-3094 (XZ backdoor)',
    '[WARN]  Privilege escalation attempt — uid 1001 → 0',
    '[INFO]  Hash verified: SHA256 match confirmed',
    '[ALERT] C2 beacon pattern detected — interval 60s',
    '[INFO]  Network topology updated: 14 hosts online',
  ];

  const ALL = [...COMMANDS, ...BINARY, ...LOGS];

  // ── Container ──
  const layer = document.createElement('div');
  layer.id = 'terminal-bg';
  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, {
    position:      'fixed',
    inset:         '0',
    zIndex:        '0',
    pointerEvents: 'none',
    overflow:      'hidden',
  });
  document.body.appendChild(layer);

  // ── Theme colour map ──
  const THEME_COLOR = {
    default:  'rgba(255,0,60,VAR)',      // red
    mono:     'rgba(220,220,220,VAR)',   // white
    '8bit':   'rgba(255,255,0,VAR)',     // yellow
    cat:      'rgba(203,166,247,VAR)',   // catppuccin mauve
  };

  function themeColor(opacity) {
    const t = document.body.getAttribute('data-theme') || 'default';
    return (THEME_COLOR[t] || THEME_COLOR.default).replace('VAR', opacity);
  }

  function randomLine() {
    const text = ALL[Math.floor(Math.random() * ALL.length)];
    const el   = document.createElement('span');
    el.textContent = text;

    const top   = Math.random() * 96;       // % of viewport height
    const left  = Math.random() * 80;       // % of viewport width
    const dur   = 1800 + Math.random() * 2400; // ms total life
    const delay = Math.random() * 200;

    Object.assign(el.style, {
      position:      'absolute',
      top:           `${top}vh`,
      left:          `${left}vw`,
      fontFamily:    '"JetBrains Mono", monospace',
      fontSize:      `${0.52 + Math.random() * 0.22}rem`,
      letterSpacing: '0.04em',
      whiteSpace:    'nowrap',
      color:         themeColor('0.18'),
      opacity:       '0',
      userSelect:    'none',
      animation:     `tbg-flash ${dur}ms ${delay}ms ease-in-out forwards`,
    });

    layer.appendChild(el);
    setTimeout(() => el.remove(), dur + delay + 100);
  }

  // ── Inject keyframe once ──
  if (!document.getElementById('tbg-keyframe')) {
    const style = document.createElement('style');
    style.id = 'tbg-keyframe';
    style.textContent = `
      @keyframes tbg-flash {
        0%   { opacity: 0; transform: translateY(4px); }
        12%  { opacity: 1; }
        75%  { opacity: 1; }
        100% { opacity: 0; transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Spawn loop — stagger initial burst then steady pace ──
  let spawnTimer = null;

  function spawnBatch() {
    const count = 2 + Math.floor(Math.random() * 2); // 2-3 at once
    for (let i = 0; i < count; i++) {
      setTimeout(randomLine, i * 160);
    }
    const next = 600 + Math.random() * 900; // every 0.6–1.5s
    spawnTimer = setTimeout(spawnBatch, next);
  }

  // Initial burst
  for (let i = 0; i < 8; i++) setTimeout(randomLine, i * 250);
  spawnTimer = setTimeout(spawnBatch, 2500);
}


// ─── CAT CURSOR FOLLOWER (oneko.gif) ─────────────────────────
function initCatCursorFollower() {
  const SPRITE = 'oneko.gif';
  const SIZE   = 32;

  // Sprite sheet offsets (multiply by SIZE for background-position px)
  const SPRITES = {
    idle:        [[-3,-3]],
    alert:       [[-7,-3]],
    tired:       [[-3,-2]],
    sleeping:    [[-2, 0],[-2,-1]],
    scratchSelf: [[-5, 0],[-6, 0],[-7, 0]],
    N:  [[-1,-2],[-1,-3]],
    NE: [[ 0,-2],[ 0,-3]],
    E:  [[-3, 0],[-3,-1]],
    SE: [[-5,-1],[-5,-2]],
    S:  [[-6,-3],[-7,-2]],
    SW: [[-5,-3],[-6,-1]],
    W:  [[-4,-2],[-4,-3]],
    NW: [[-1, 0],[-1,-1]],
  };

  // Build div element
  const el = document.createElement('div');
  el.id = 'cat-cursor';
  el.setAttribute('aria-hidden', 'true');
  Object.assign(el.style, {
    width:             `${SIZE}px`,
    height:            `${SIZE}px`,
    position:          'fixed',
    zIndex:            '9995',
    pointerEvents:     'none',
    backgroundImage:   `url("${SPRITE}")`,
    backgroundRepeat:  'no-repeat',
    imageRendering:    'pixelated',
    opacity:           '0',
    transition:        'opacity 0.3s ease',
    transform:         'scale(1.8)',
    transformOrigin:   'top left',
    filter:            'drop-shadow(0 2px 4px rgba(243,139,168,0.5))',
  });
  document.body.appendChild(el);

  function setSprite(name, frame) {
    const set = SPRITES[name] || SPRITES.idle;
    const [sx, sy] = set[Math.abs(frame) % set.length];
    el.style.backgroundPosition = `${sx * SIZE}px ${sy * SIZE}px`;
  }

  let posX = 32, posY = 32;
  let mouseX = 0, mouseY = 0;
  let frame = 0, idleTime = 0;
  let idleAnim = null, idleFrame = 0;
  let active = false, rafId = null;
  const SPEED = 10;

  function resetIdle() { idleAnim = null; idleFrame = 0; }

  function doIdle() {
    idleTime++;
    if (idleTime > 25 && !idleAnim && Math.random() < 0.005) {
      idleAnim = ['sleeping','scratchSelf'][Math.floor(Math.random() * 2)];
    }
    if (idleAnim === 'sleeping') {
      if (idleFrame < 8) { setSprite('tired', 0); }
      else               { setSprite('sleeping', Math.floor(idleFrame / 4)); }
      if (idleFrame > 192) resetIdle();
    } else if (idleAnim === 'scratchSelf') {
      setSprite('scratchSelf', idleFrame);
      if (idleFrame > 9) resetIdle();
    } else {
      setSprite('idle', 0);
    }
    idleFrame++;
  }

  function tick() {
    if (!active) return;
    frame++;
    const dx = posX - mouseX;
    const dy = posY - mouseY;
    const dist = Math.hypot(dx, dy);

    if (dist < SPEED) {
      doIdle();
      rafId = requestAnimationFrame(tick);
      return;
    }

    idleAnim = null; idleFrame = 0; idleTime = 0;

    let dir = '';
    dir += dy / dist < -0.5 ? 'N' : dy / dist > 0.5 ? 'S' : '';
    dir += dx / dist < -0.5 ? 'W' : dx / dist > 0.5 ? 'E' : '';
    setSprite(dir || 'idle', Math.floor(frame / 8));

    posX -= (dx / dist) * SPEED;
    posY -= (dy / dist) * SPEED;
    el.style.left = `${Math.round(posX - SIZE / 2)}px`;
    el.style.top  = `${Math.round(posY - SIZE / 2)}px`;
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function show() {
    if (active) return;
    active = true;
    el.style.opacity = '1';
    rafId = requestAnimationFrame(tick);
  }
  function hide() {
    active = false;
    el.style.opacity = '0';
    cancelAnimationFrame(rafId);
  }

  new MutationObserver(() => {
    document.body.getAttribute('data-theme') === 'cat' ? show() : hide();
  }).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  if (document.body.getAttribute('data-theme') === 'cat') show();
}

// ─── CAT BUTTON HOVER (oneko.gif alert pose) ─────────────────
function initCatButtonEffect() {
  const SPRITE = 'oneko.gif';
  const SIZE   = 32;

  // Hover sequence: alert → scratchSelf loop
  const HOVER_SEQ = [
    { sx: -7, sy: -3, d: 400 }, // alert
    { sx: -3, sy: -3, d: 200 }, // idle
    { sx: -5, sy:  0, d: 150 }, // scratch 1
    { sx: -6, sy:  0, d: 150 }, // scratch 2
    { sx: -7, sy:  0, d: 150 }, // scratch 3
    { sx: -6, sy:  0, d: 150 }, // scratch 2
    { sx: -5, sy:  0, d: 150 }, // scratch 1
    { sx: -7, sy: -3, d: 300 }, // alert again
    { sx: -3, sy: -3, d: 300 }, // idle
  ];

  // Build sprite element
  const el = document.createElement('div');
  el.id = 'cat-sprite';
  el.setAttribute('aria-hidden', 'true');
  Object.assign(el.style, {
    width:             `${SIZE}px`,
    height:            `${SIZE}px`,
    position:          'fixed',
    zIndex:            '9996',
    pointerEvents:     'none',
    backgroundImage:   `url("${SPRITE}")`,
    backgroundRepeat:  'no-repeat',
    imageRendering:    'pixelated',
    backgroundPosition:'-224px -96px',
    opacity:           '0',
    transition:        'opacity 0.18s ease',
    transform:         'scale(2)',
    transformOrigin:   'top left',
    filter:            'drop-shadow(0 2px 6px rgba(243,139,168,0.6))',
  });
  document.body.appendChild(el);

  let seqIdx = 0;
  let animTimer = null;

  function setFrame(sx, sy) {
    el.style.backgroundPosition = `${sx * SIZE}px ${sy * SIZE}px`;
  }

  function startAnim(target) {
    if (document.body.getAttribute('data-theme') !== 'cat') return;
    const rect = target.getBoundingClientRect();
    // Position: to left of element, centered vertically
    const spriteW = SIZE * 2; // accounting for scale(2)
    const spriteH = SIZE * 2;
    const x = rect.left - spriteW - 8;
    const y = rect.top + (rect.height - spriteH) / 2;
    el.style.left    = `${Math.max(4, x < 4 ? rect.right + 6 : x)}px`;
    el.style.top     = `${Math.max(4, Math.min(y, window.innerHeight - spriteH - 4))}px`;
    el.style.opacity = '1';

    seqIdx = 0;
    clearTimeout(animTimer);
    function step() {
      const { sx, sy, d } = HOVER_SEQ[seqIdx % HOVER_SEQ.length];
      setFrame(sx, sy);
      seqIdx++;
      animTimer = setTimeout(step, d);
    }
    step();
  }

  function stopAnim() {
    el.style.opacity = '0';
    clearTimeout(animTimer);
  }

  // Attach to interactive elements
  $$('.btn, .theme-option, .theme-toggle-btn, .nav-link, .contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => startAnim(el));
    el.addEventListener('mouseleave', stopAnim);
  });

  // Hide when theme changes away from cat
  new MutationObserver(() => {
    if (document.body.getAttribute('data-theme') !== 'cat') stopAnim();
  }).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  // ── Cat ear injection (unchanged) ──
  function addEars() {
    $$('.btn, .theme-toggle-btn').forEach(btn => {
      if (btn.querySelector('.cat-ear')) return;
      btn.insertAdjacentHTML('beforeend',
        '<span class="cat-ear cat-ear--l" aria-hidden="true"></span>' +
        '<span class="cat-ear cat-ear--r" aria-hidden="true"></span>'
      );
    });
  }
  function removeEars() { $$('.cat-ear').forEach(e => e.remove()); }

  if (document.body.getAttribute('data-theme') === 'cat') addEars();
  new MutationObserver(() => {
    document.body.getAttribute('data-theme') === 'cat' ? addEars() : removeEars();
  }).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
}


