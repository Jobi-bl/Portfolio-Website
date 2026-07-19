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

  // Theme option clicks
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      applyTheme(theme);
      localStorage.setItem('portfolio-theme', theme);
      // Close panel
      panel.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
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
document.addEventListener('DOMContentLoaded', () => {
  initMatrixRain();
  initBootSequence();
  initUptimeCounter();
  initThemeSwitcher();
  initActiveNav();
  initSkillBars();
  initNetworkGraph();
  initContactForm();
  initSmoothScroll();
  initNavScroll();
  initCardGlitch();
  initSectionReveal();
  initClickRipple();
  initTerminalBg();
  // ── Cat animations ──
  initGhostCats();
  initPawTrail();
  initCatButtonEffect();
  initCatCursorFollower();
});

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
    shockwave(cx, cy);                              // expanding ring
    flash(cx, cy);                                  // brief centre flash
    const count = 45 + Math.floor(Math.random() * 18); // 45–62 particles
    for (let i = 0; i < count; i++) particle(cx, cy);
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
  function particle(cx, cy) {
    const el   = document.createElement('span');
    el.textContent = POOL[Math.floor(Math.random() * POOL.length)];

    const angle = Math.random() * Math.PI * 2;
    // sqrt bias: dense cluster near center, sparse far fliers — true virus feel
    const dist  = 30 + Math.pow(Math.random(), 0.45) * 280;
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


