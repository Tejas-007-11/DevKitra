import './style.css';
import {
  genres,
  genre,
  gameByRoute,
  publishedGames,
  featuredGames,
  gamesInGenre,
  genreGameCount,
} from './games/registry.js';

const app = document.querySelector('#app');
const SITE_NAME = 'DevKitra Gaming';

const NAV = [
  { label: 'Featured', href: '/' },
  { label: 'All Games', href: '/explore' },
  { label: 'Architecture', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/* Professional Metadata Badges */
const GAME_BADGES = {
  'astro-drift': '3 SECTORS',
  'speed-dash': 'HIGH SPEED',
  'cyber-flap': 'ARCADE FLIGHT',
  'neon-pong': '3 AI TIERS',
  'tower-stack': 'PHYSICS TIMING',
  'breakout': '4 LEVELS',
  'snake': '3 ARENAS',
  '2048': 'LOGIC MATRIX',
  'reaction-test': 'RADAR TIERS',
  'memory-match': '3 MODES',
};

/* ------------------------------------------------------------------ */
/* Web Audio API Sound Engine (Synthesized, 0 kB assets)              */
/* ------------------------------------------------------------------ */

let audioCtx = null;
let soundEnabled = (() => {
  try {
    const s = localStorage.getItem('dk:sound');
    return s !== 'false';
  } catch (_) {
    return true;
  }
})();

function playUiSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.025);
      osc.start(now); osc.stop(now + 0.025);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'switch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.06);
      osc.start(now); osc.stop(now + 0.06);
    } else if (type === 'launch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.06);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    }
  } catch (_) {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  try { localStorage.setItem('dk:sound', String(soundEnabled)); } catch (_) {}
  if (soundEnabled) playUiSound('click');
  return soundEnabled;
}

/* ------------------------------------------------------------------ */
/* Theme                                                              */
/* ------------------------------------------------------------------ */

function setTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.classList.toggle('light', isLight);
  try { localStorage.setItem('devkitra-theme', theme); } catch (_) {}
}

function getTheme() {
  try {
    const saved = localStorage.getItem('devkitra-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {}
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/* ------------------------------------------------------------------ */
/* Routing                                                            */
/* ------------------------------------------------------------------ */

function normalizePath(path = window.location.pathname) {
  return path === '/' ? '/' : path.replace(/\/+$/, '') || '/';
}

function matchRoute(path) {
  if (path === '/') return { page: 'home' };
  if (path === '/explore') return { page: 'explore' };
  if (path === '/about') return { page: 'about' };
  if (path === '/privacy') return { page: 'privacy' };
  if (path === '/contact') return { page: 'contact' };
  const genreMatch = path.match(/^\/genre\/([^/]+)$/);
  if (genreMatch) return { page: 'genre', slug: genreMatch[1] };
  const gameMatch = path.match(/^\/game\/([^/]+)$/);
  if (gameMatch) return { page: 'game', slug: gameMatch[1] };
  return { page: 'not-found' };
}

/* ------------------------------------------------------------------ */
/* Random Game Launcher                                               */
/* ------------------------------------------------------------------ */

function launchRandomGame(excludeId = '') {
  playUiSound('launch');
  const all = publishedGames().filter((g) => g.id !== excludeId);
  if (!all.length) return;
  const picked = all[Math.floor(Math.random() * all.length)];
  showToast(`Launching ${picked.title}...`, 'success');
  navigateTo(picked.route);
}

/* ------------------------------------------------------------------ */
/* Metadata                                                           */
/* ------------------------------------------------------------------ */

function siteUrl() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return configured;
  if (window.location.protocol === 'https:') return window.location.origin;
  return '';
}

function updatePageMetadata(route) {
  const pages = {
    '/': { title: `${SITE_NAME} — High-Performance Browser Gaming Platform`, description: 'Play instant, zero-install browser games crafted with 60fps canvas physics and client-side isolation.' },
    '/explore': { title: `All Games | ${SITE_NAME}`, description: 'Search and filter the complete DevKitra instant games collection.' },
    '/about': { title: `Architecture & Privacy | ${SITE_NAME}`, description: 'DevKitra Gaming operates as a standalone, client-side browser runtime.' },
    '/privacy': { title: `Privacy Guarantee | ${SITE_NAME}`, description: 'All game progress and scores run 100% locally in your browser.' },
    '/contact': { title: `Contact & Submissions | ${SITE_NAME}`, description: 'Contact DevKitra Gaming for suggestions and technical inquiries.' },
  };

  let page;
  if (route.page === 'game' && gameByRoute(route.path)) {
    const g = gameByRoute(route.path);
    page = { title: `${g.title} — Play Online | ${SITE_NAME}`, description: g.description };
  } else if (route.page === 'genre' && genre(route.slug)) {
    const g = genre(route.slug);
    page = { title: `${g.label} Games | ${SITE_NAME}`, description: `Browse verified ${g.label.toLowerCase()} games.` };
  } else if (pages[route.path]) {
    page = pages[route.path];
  } else {
    page = { title: `Page Not Found | ${SITE_NAME}`, description: 'That address does not exist.' };
  }

  document.title = page.title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', page.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', page.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', page.description);

  const base = siteUrl();
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!base) {
    canonical?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
    return;
  }
  try {
    const parsed = new URL(base);
    if (parsed.protocol !== 'https:') throw new Error('VITE_SITE_URL must use HTTPS.');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = new URL(route.path, `${parsed.origin}/`).href;
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.append(ogUrl);
    }
    ogUrl.content = canonical.href;
  } catch (error) {
    canonical?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
  }
}

/* ------------------------------------------------------------------ */
/* UI helpers                                                         */
/* ------------------------------------------------------------------ */

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch] || ch);
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('dk-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dk-toast';
    toast.className = 'toast';
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ------------------------------------------------------------------ */
/* Header & Footer Components                                         */
/* ------------------------------------------------------------------ */

function brandMarkup() {
  return `
    <a href="/" data-nav class="brand" aria-label="${SITE_NAME} home">
      <span class="brand-mark">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      </span>
      <span class="brand-name">
        <span class="brand-main">DEVKITRA</span>
        <span class="brand-sub">GAMING</span>
      </span>
    </a>
  `;
}

function soundIcon(enabled) {
  if (enabled) {
    return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M7 3L3.5 6H1v4h2.5L7 13V3z" fill="currentColor"/><path d="M10 5a4 4 0 010 6M12 3a7 7 0 010 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M7 3L3.5 6H1v4h2.5L7 13V3z" fill="currentColor"/><path d="M10 6l4 4M14 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
}

function themeIcon(theme) {
  if (theme === 'light') {
    return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5v1.5m0 10v1.5m-4.6-11.1 1.06 1.06m7.08 7.08 1.06 1.06M1.5 8H3m10 0h1.5M3.4 12.6l1.06-1.06m7.08-7.08 1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M14 9.2A6 6 0 0 1 6.8 2a6 6 0 1 0 7.2 7.2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function searchSvg() {
  return `<svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/><path d="m11 11 3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
}

function diceSvg() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/></svg>`;
}

function menuSvg(open) {
  if (open) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
}

function renderHeader(path) {
  const navMarkup = NAV.map(({ label, href }) => {
    const active = path === href || (href === '/explore' && (path.startsWith('/genre/') || path.startsWith('/game/')));
    return `<a href="${href}" data-nav class="nav-link${active ? ' active' : ''}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');

  return `
    <div class="layout">
      <div class="app-main">
        <header class="site-header">
          <div class="topbar">
            ${brandMarkup()}
            <nav class="main-nav" id="main-nav" aria-label="Main navigation">${navMarkup}</nav>
            <div class="header-actions">
              <button id="surprise-btn" type="button" class="btn-surprise" title="Launch Random Game">
                ${diceSvg()}
                <span class="btn-surprise-text">Random Game</span>
              </button>
              <div class="search-shell header-search" id="header-search">
                <input id="global-search" type="search" placeholder="Search games (Press /)…" aria-label="Search games" />
                ${searchSvg()}
                <div id="search-results" class="search-results hidden" role="listbox" aria-label="Game search results"></div>
              </div>
              <button id="search-toggle" type="button" class="icon-button" aria-label="Search games">${searchSvg()}</button>
              <button id="sound-toggle" type="button" class="icon-button ${soundEnabled ? 'active' : ''}" aria-label="Toggle sound FX" title="Toggle sound FX">${soundIcon(soundEnabled)}</button>
              <button id="theme-toggle" type="button" class="icon-button" aria-label="Toggle color theme">${themeIcon(getTheme())}</button>
              <button id="nav-toggle" type="button" class="icon-button nav-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="main-nav">${menuSvg(false)}</button>
            </div>
          </div>
        </header>
        <div id="dk-toast" class="toast" aria-live="polite"></div>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <div class="footer-brand">${SITE_NAME}</div>
          <div class="brand-sub" style="margin-top:0.25rem;">Browser Gaming Platform · Standalone Client Architecture</div>
        </div>
        <div class="footer-links">
          <a href="/explore" data-nav>Games Catalogue</a>
          <a href="/about" data-nav>Architecture</a>
          <a href="/contact" data-nav>Submissions</a>
          <a href="/privacy" data-nav>Privacy Guarantee</a>
        </div>
      </div>
      <div class="footer-copy">© ${new Date().getFullYear()} DevKitra Gaming. All titles run client-side in browser memory with zero tracking cookies and zero installations.</div>
    </footer>
    </div></div>
  `;
}

/* ------------------------------------------------------------------ */
/* Game Card                                                          */
/* ------------------------------------------------------------------ */

function gameCard(game, customBadge = '') {
  const badgeText = customBadge || GAME_BADGES[game.id] || (game.featured ? 'FEATURED' : '');
  const genreLabels = game.genres.map((g) => genre(g)?.label).filter(Boolean).join(' · ') || 'Game';
  const thumb = game.thumbnail
    ? `<img src="${game.thumbnail}" alt="${escapeHtml(game.title)} cover" loading="lazy" />`
    : `<div style="width:100%;height:100%;display:grid;place-items:center;color:var(--dk-quiet);font-size:1.6rem;font-weight:900;">${escapeHtml(game.title[0])}</div>`;

  return `
    <a href="${game.route}" data-nav class="game-card" data-game-card="${game.id}">
      <div class="game-card-thumb">
        ${thumb}
        ${badgeText ? `<div class="game-badge">${escapeHtml(badgeText)}</div>` : ''}
        <div class="game-card-play" aria-hidden="true">
          <span class="play-pill">PLAY NOW ▶</span>
        </div>
      </div>
      <div class="game-card-body">
        <span class="game-card-genre">${genreLabels}</span>
        <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
        <p class="game-card-desc">${escapeHtml(game.description)}</p>
      </div>
      <div class="game-card-foot">
        <span>${game.inputs.map((inp) => inp === 'keyboard' ? 'Keyboard' : inp === 'touch' ? 'Touch' : 'Mouse').join(' · ')}</span>
        <span class="game-card-cta">Instant Play →</span>
      </div>
    </a>
  `;
}

/* ------------------------------------------------------------------ */
/* Pages                                                              */
/* ------------------------------------------------------------------ */

function renderHomePage() {
  const all = [...publishedGames()];
  const featured = featuredGames();
  const populatedGenres = genres.filter((g) => genreGameCount(g.slug) > 0);
  const spotlightGame = all.find((g) => g.id === 'astro-drift') || all[0];

  const actionPicks = all.filter((g) => ['astro-drift', 'speed-dash', 'cyber-flap', 'neon-pong'].includes(g.id));
  const arcadePicks = all.filter((g) => ['breakout', 'tower-stack', 'snake', 'reaction-test'].includes(g.id));
  const puzzlePicks = all.filter((g) => ['2048', 'memory-match'].includes(g.id));

  return `
    <main class="page-shell home-page">
      <!-- High-End Marquee Hero Showcase -->
      <section class="hero-showcase">
        <div class="spotlight-banner">
          <div class="spotlight-poster">
            <img src="${spotlightGame.thumbnail}" alt="${escapeHtml(spotlightGame.title)}" id="spotlight-bg-img" />
            <div class="spotlight-overlay"></div>
          </div>
          <div class="spotlight-content">
            <div class="spotlight-tag">
              <span class="status-indicator"></span>
              <span id="spotlight-badge">FEATURED RELEASE · 60 FPS ENGINE</span>
            </div>
            <h1 id="spotlight-title">${escapeHtml(spotlightGame.title)}</h1>
            <p id="spotlight-desc" class="spotlight-summary">${escapeHtml(spotlightGame.description)}</p>
            <div class="spotlight-actions">
              <a href="${spotlightGame.route}" data-nav class="btn btn-primary" id="spotlight-play-btn">Launch Game ▶</a>
              <a href="/explore" data-nav class="btn btn-ghost">Browse Catalogue</a>
              <button type="button" class="btn btn-ghost" id="hero-random-btn">${diceSvg()} Random Match</button>
            </div>
          </div>
        </div>

        <!-- Spotlight Quick Selector Carousel Strip -->
        <div class="spotlight-selector" id="spotlight-selector">
          ${featured.slice(0, 5).map((g, idx) => `
            <button type="button" class="spotlight-tab ${g.id === spotlightGame.id ? 'active' : ''}"
              data-id="${g.id}"
              data-title="${escapeHtml(g.title)}"
              data-desc="${escapeHtml(g.description)}"
              data-route="${g.route}"
              data-thumb="${g.thumbnail}"
              data-badge="${GAME_BADGES[g.id] || 'FEATURED'}">
              <span class="tab-index">0${idx + 1}</span>
              <span class="tab-title">${escapeHtml(g.title)}</span>
            </button>
          `).join('')}
        </div>

        <!-- Metric Specs Strip -->
        <div class="specs-bar">
          <div class="spec-unit">
            <span class="spec-value">${all.length}</span>
            <span class="spec-label">Native Games</span>
          </div>
          <div class="spec-divider"></div>
          <div class="spec-unit">
            <span class="spec-value">60 FPS</span>
            <span class="spec-label">Hardware Render</span>
          </div>
          <div class="spec-divider"></div>
          <div class="spec-unit">
            <span class="spec-value">0 KB</span>
            <span class="spec-label">Install Footprint</span>
          </div>
          <div class="spec-divider"></div>
          <div class="spec-unit">
            <span class="spec-value">100%</span>
            <span class="spec-label">Local Client Privacy</span>
          </div>
        </div>
      </section>

      <!-- Category Dock -->
      <section class="section" style="margin-top: 2rem;">
        <div class="category-dock">
          <a href="/explore" data-nav class="cat-pill active">All Categories (${all.length})</a>
          ${populatedGenres.map((g) => `
            <a href="/genre/${g.slug}" data-nav class="cat-pill">${escapeHtml(g.label)} (${genreGameCount(g.slug)})</a>
          `).join('')}
        </div>
      </section>

      <!-- Curated Shelf 1: Action & Speed -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">High Velocity</div>
            <h2>Action & Speed Arcades</h2>
            <p>Rapid navigation, particle thrusters, laser barriers, and responsive momentum.</p>
          </div>
          <a href="/explore" data-nav class="btn btn-ghost btn-sm">Explore All →</a>
        </div>
        <div class="featured-grid">${actionPicks.map((g) => gameCard(g)).join('')}</div>
      </section>

      <!-- Curated Shelf 2: Skill & Timing -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">Precision Timing</div>
            <h2>Skill, Reflection & Accuracy</h2>
            <p>Brick fortresses, slab stacking, agile snake arenas, and neurological radar testing.</p>
          </div>
        </div>
        <div class="game-grid">${arcadePicks.map((g) => gameCard(g)).join('')}</div>
      </section>

      <!-- Curated Shelf 3: Logic & Strategy -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">Cognitive Focus</div>
            <h2>Logic & Memory Puzzles</h2>
            <p>Spatial calculation, tile merging, and paired glyph sequences.</p>
          </div>
        </div>
        <div class="game-grid">${puzzlePicks.map((g) => gameCard(g)).join('')}</div>
      </section>

      <!-- Complete Collection Shelf -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">Complete Catalogue</div>
            <h2>All Verified Games</h2>
            <p>Every title built for zero downloads, offline memory saves, and maximum frame rates.</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="section-random-btn">${diceSvg()} Random Match</button>
        </div>
        <div class="game-grid">${all.map((g) => gameCard(g)).join('')}</div>
      </section>
    </main>
  `;
}

function setupHeroShowcase() {
  const tabs = document.querySelectorAll('#spotlight-selector .spotlight-tab');
  const bgImg = document.getElementById('spotlight-bg-img');
  const titleEl = document.getElementById('spotlight-title');
  const descEl = document.getElementById('spotlight-desc');
  const playBtn = document.getElementById('spotlight-play-btn');
  const badgeEl = document.getElementById('spotlight-badge');
  const randomHeroBtn = document.getElementById('hero-random-btn');
  const randomSecBtn = document.getElementById('section-random-btn');

  if (randomHeroBtn) {
    randomHeroBtn.addEventListener('click', () => launchRandomGame());
  }
  if (randomSecBtn) {
    randomSecBtn.addEventListener('click', () => launchRandomGame());
  }

  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      playUiSound('switch');
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const title = tab.dataset.title;
      const desc = tab.dataset.desc;
      const route = tab.dataset.route;
      const thumb = tab.dataset.thumb;
      const badge = tab.dataset.badge;

      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
      if (playBtn) playBtn.href = route;
      if (bgImg && thumb) bgImg.src = thumb;
      if (badgeEl) badgeEl.textContent = `${badge} · 60 FPS ENGINE`;
    });
  });
}

function renderExplorePage() {
  const all = publishedGames();
  const populatedGenres = genres.filter((g) => genreGameCount(g.slug) > 0);

  return `
    <main class="page-shell explore-page">
      <div class="section-header">
        <div class="copy">
          <div class="eyebrow">DevKitra Games Library</div>
          <h1>All Browser Games</h1>
          <p>Instant search by title, category, tags, or control mechanics. Filter with real-time responsive speed.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="explore-random-btn">${diceSvg()} Random Pick</button>
      </div>
      <div class="search-sort">
        <div class="search-shell explore-search">
          <input id="explore-search" type="search" placeholder="Search by game title, genre, or tag (e.g. space, racing, arcade, puzzle)…" aria-label="Search games" />
          ${searchSvg()}
        </div>
        <div class="select-shell">
          <select id="explore-sort" aria-label="Sort games">
            <option value="added">Newest First</option>
            <option value="title">Alphabetical (A–Z)</option>
          </select>
        </div>
      </div>
      <div id="explore-genre-filters" class="chip-list explore-filters">
        <button type="button" class="genre-chip active" data-genre="all" aria-pressed="true">All Genres (${all.length})</button>
        ${populatedGenres.map((g) => `<button type="button" class="genre-chip" data-genre="${g.slug}" aria-pressed="false">${escapeHtml(g.label)} (${genreGameCount(g.slug)})</button>`).join('')}
      </div>
      <p id="explore-count" class="directory-count">${all.length} games available</p>
      <div id="explore-results" class="game-grid">${all.map((g) => gameCard(g)).join('')}</div>
      <div id="explore-empty" class="empty-state hidden">
        <h2>No games found.</h2>
        <p>Try searching for "space", "racing", "arcade", or "pong".</p>
      </div>
    </main>
  `;
}

function setupExplore() {
  const search = document.getElementById('explore-search');
  const results = document.getElementById('explore-results');
  const empty = document.getElementById('explore-empty');
  const count = document.getElementById('explore-count');
  const chips = [...document.querySelectorAll('#explore-genre-filters .genre-chip')];
  const sort = document.getElementById('explore-sort');
  const randomBtn = document.getElementById('explore-random-btn');

  if (randomBtn) {
    randomBtn.addEventListener('click', () => launchRandomGame());
  }

  let genreSel = 'all';
  let q = '';
  const all = publishedGames();

  const apply = () => {
    const filtered = all.filter((g) => {
      const genreMatch = genreSel === 'all' || g.genres.includes(genreSel);
      const searchText = `${g.title} ${g.description} ${g.tags.join(' ')} ${g.genres.map((ge) => genre(ge)?.label).join(' ')}`.toLowerCase();
      const textMatch = !q || searchText.includes(q);
      return genreMatch && textMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort.value === 'title') return a.title.localeCompare(b.title);
      return (b.added || '').localeCompare(a.added || '');
    });

    results.innerHTML = sorted.map((g) => gameCard(g)).join('');
    empty.classList.toggle('hidden', sorted.length > 0);
    count.textContent = `${sorted.length} ${sorted.length === 1 ? 'game available' : 'games available'}`;
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      playUiSound('switch');
      chips.forEach((c) => {
        c.classList.toggle('active', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      genreSel = chip.dataset.genre || 'all';
      apply();
    });
  });

  if (search) {
    search.addEventListener('input', (event) => {
      q = event.target.value.trim().toLowerCase();
      apply();
    });
  }
  if (sort) {
    sort.addEventListener('change', () => {
      playUiSound('switch');
      apply();
    });
  }
}

function renderGenrePage(slug) {
  const g = genre(slug);
  if (!g) return renderNotFoundPage();
  const list = gamesInGenre(slug);

  return `
    <main class="page-shell genre-page">
      <div class="section-header">
        <div class="copy">
          <div class="eyebrow">${escapeHtml(g.label)}</div>
          <h1>${escapeHtml(g.label)} Games</h1>
          <p>${escapeHtml(g.description)}</p>
        </div>
        <a href="/explore" data-nav class="btn btn-ghost btn-sm">All Genres →</a>
      </div>
      <p class="directory-count">${list.length} game${list.length === 1 ? '' : 's'} in this category</p>
      ${list.length
        ? `<div class="game-grid">${list.map((game) => gameCard(game)).join('')}</div>`
        : `<div class="empty-state"><h2>No ${escapeHtml(g.label)} games yet.</h2><p>Check back soon — new games added regularly.</p></div>`
      }
    </main>
  `;
}

/* ------------------------------------------------------------------ */
/* Game Screen Console / Theater Architecture                        */
/* ------------------------------------------------------------------ */

function renderGamePage(slug) {
  const game = gameByRoute(`/game/${slug}`);
  if (!game) return renderNotFoundPage();

  const related = publishedGames()
    .filter((g) => g.id !== game.id)
    .slice(0, 4);

  const pauseMarkup = game.pause
    ? `<button type="button" class="console-btn" data-action="pause" aria-pressed="false" title="Pause / Resume [P]"><span class="btn-icon">⏸</span> Pause</button>`
    : '';

  const genreLabels = game.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ');

  return `
    <main class="page-shell game-page" id="game-page-root">
      <!-- Game Info Header -->
      <div class="game-meta-header">
        <div class="meta-left">
          <a href="/explore" data-nav class="back-link">← Games Library</a>
          <span class="meta-genre">${genreLabels}</span>
          <h1 class="game-main-title">${escapeHtml(game.title)}</h1>
          <p class="game-main-lede">${escapeHtml(game.description)}</p>
        </div>
        <div class="meta-right">
          <button type="button" class="btn btn-ghost btn-sm" id="game-next-btn">${diceSvg()} Next Game</button>
        </div>
      </div>

      <!-- Gaming Console Theater Stage -->
      <div class="console-stage" id="console-stage">
        <!-- Floating HUD Control Ribbon -->
        <div class="console-ribbon">
          <div class="ribbon-left">
            <span class="status-chip running" id="console-status"><span class="chip-dot"></span> LIVE RUNTIME</span>
            <span class="fps-badge">60 FPS</span>
          </div>
          <div class="ribbon-actions">
            ${pauseMarkup}
            <button type="button" class="console-btn" data-action="restart" title="Restart Match [R]"><span class="btn-icon">↺</span> Restart</button>
            <button type="button" class="console-btn" data-action="theater" id="theater-toggle" title="Toggle Cinema Theater Mode [T]"><span class="btn-icon">⛶</span> Theater Mode</button>
            <button type="button" class="console-btn" data-action="fullscreen" id="fs-toggle" title="Full Screen [F]"><span class="btn-icon">⛶</span> Fullscreen</button>
            <button type="button" class="console-btn ${soundEnabled ? 'active' : ''}" id="game-sound-btn" title="Toggle Game Audio">${soundIcon(soundEnabled)}</button>
          </div>
        </div>

        <!-- Frame Viewport -->
        <div class="game-viewport-wrap" id="game-viewport" role="region" aria-label="${escapeHtml(game.title)} gameplay canvas">
          <iframe class="game-viewport-frame" id="active-game-frame" src="${game.standalone}${game.pause ? '?embed=1' : ''}" title="${escapeHtml(game.title)}" allowfullscreen></iframe>
        </div>
      </div>

      <!-- Controls & Details Section -->
      <div class="game-details-layout">
        <section class="details-card">
          <h2>Controls & Instructions</h2>
          <div class="controls-list">
            ${game.inputs.map((input) => `<span class="kbd">${escapeHtml(input)}</span>`).join('')}
          </div>
          <p class="controls-hint">${escapeHtml(game.controls)}</p>
          ${game.save ? '<p class="controls-hint" style="color:var(--dk-success);font-weight:700;margin-top:0.75rem;">● Highscores and session progress are stored locally on your device.</p>' : ''}
          <div class="hotkeys-guide">
            <span class="hotkey-pill"><kbd>R</kbd> Restart</span>
            ${game.pause ? '<span class="hotkey-pill"><kbd>P</kbd> Pause</span>' : ''}
            <span class="hotkey-pill"><kbd>T</kbd> Theater Mode</span>
            <span class="hotkey-pill"><kbd>F</kbd> Fullscreen</span>
          </div>
        </section>

        <!-- Recommended Games Shelf -->
        <section class="details-card">
          <h2>More Titles In Rotation</h2>
          <div class="related-stack">${related.map((r) => `
            <a href="${r.route}" data-nav class="related-tile">
              ${r.thumbnail ? `<img class="related-tile-thumb" src="${r.thumbnail}" alt="" loading="lazy" />` : ''}
              <div class="related-tile-info">
                <span class="related-tile-title">${escapeHtml(r.title)}</span>
                <span class="related-tile-genre">${r.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ') || 'Game'}</span>
              </div>
              <span class="related-tile-badge">${GAME_BADGES[r.id] || 'PLAY'}</span>
            </a>
          `).join('')}</div>
        </section>
      </div>
    </main>
  `;
}

function setupGamePage(slug) {
  const game = gameByRoute(`/game/${slug}`);
  if (!game) return;

  const stage = document.getElementById('console-stage');
  const viewport = document.getElementById('game-viewport');
  const frame = document.getElementById('active-game-frame');
  const restart = document.querySelector('[data-action="restart"]');
  const pauseBtn = document.querySelector('[data-action="pause"]');
  const fsBtn = document.getElementById('fs-toggle');
  const theaterBtn = document.getElementById('theater-toggle');
  const nextBtn = document.getElementById('game-next-btn');
  const soundBtn = document.getElementById('game-sound-btn');
  const statusChip = document.getElementById('console-status');
  const origin = window.location.origin;

  if (nextBtn) {
    nextBtn.addEventListener('click', () => launchRandomGame(game.id));
  }

  function postToGame(payload) {
    if (frame && frame.contentWindow) {
      try { frame.contentWindow.postMessage(payload, origin); } catch (_) {}
    }
  }

  let paused = false;

  if (restart) {
    restart.addEventListener('click', () => {
      playUiSound('click');
      paused = false;
      if (pauseBtn) {
        pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
        pauseBtn.setAttribute('aria-pressed', 'false');
      }
      if (statusChip) {
        statusChip.className = 'status-chip running';
        statusChip.innerHTML = '<span class="chip-dot"></span> LIVE RUNTIME';
      }
      postToGame({ type: 'dk:restart' });
      frame.focus();
    });
  }

  if (pauseBtn && game.pause) {
    pauseBtn.addEventListener('click', () => {
      playUiSound('click');
      paused = !paused;
      pauseBtn.innerHTML = paused ? '<span class="btn-icon">▶</span> Resume' : '<span class="btn-icon">⏸</span> Pause';
      pauseBtn.setAttribute('aria-pressed', String(paused));
      if (statusChip) {
        statusChip.className = paused ? 'status-chip paused' : 'status-chip running';
        statusChip.innerHTML = paused ? '<span class="chip-dot"></span> PAUSED' : '<span class="chip-dot"></span> LIVE RUNTIME';
      }
      postToGame(paused ? { type: 'dk:pause' } : { type: 'dk:resume' });
      frame.focus();
    });
  }

  // Theater Mode Toggle
  if (theaterBtn && stage) {
    theaterBtn.addEventListener('click', () => {
      playUiSound('click');
      const isTheater = stage.classList.toggle('theater-mode');
      theaterBtn.classList.toggle('active', isTheater);
      theaterBtn.innerHTML = isTheater ? '<span class="btn-icon">🗗</span> Standard View' : '<span class="btn-icon">⛶</span> Theater Mode';
      if (isTheater) {
        stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      frame.focus();
    });
  }

  // Fullscreen Mode
  if (fsBtn && viewport) {
    fsBtn.addEventListener('click', () => {
      playUiSound('click');
      if (!document.fullscreenElement) {
        if (viewport.requestFullscreen) viewport.requestFullscreen();
        else if (viewport.webkitRequestFullscreen) viewport.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
      frame.focus();
    });
  }

  // Audio Toggle on Game Bar
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = toggleSound();
      soundBtn.innerHTML = soundIcon(enabled);
      soundBtn.classList.toggle('active', enabled);
      showToast(enabled ? 'Sound FX Enabled' : 'Sound FX Muted');
    });
  }

  /* Hotkeys helper */
  const onKeydown = (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      if (document.querySelector('.game-page')) event.preventDefault();
    }
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    if (event.key === 'r' || event.key === 'R') {
      restart?.click();
    } else if (event.key === 'p' || event.key === 'P') {
      pauseBtn?.click();
    } else if (event.key === 'f' || event.key === 'F') {
      fsBtn?.click();
    } else if (event.key === 't' || event.key === 'T') {
      theaterBtn?.click();
    }
  };

  window.addEventListener('keydown', onKeydown);
  pageCleanups.push(() => window.removeEventListener('keydown', onKeydown));
}

window.addEventListener('message', (event) => {
  const origin = siteUrl() || window.location.origin;
  if (event.origin !== origin) return;
  const { type, score } = event.data || {};
  if (type === 'dk:gameover' && score !== undefined && document.querySelector('.game-viewport-frame')) {
    showToast(`Game Over · Final Score: ${score}`, 'error');
  }
});

function renderAboutPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">Engine Architecture</div>
        <h1>Instant Games, Client-Side Runtime</h1>
        <p>DevKitra Gaming is engineered for instantaneous playability. No 50 GB downloads, no loading screens, and zero registration walls. Every title is executed locally within isolated browser canvas memory with GPU acceleration.</p>
        <p>Games operate as isolated sandbox modules, communicating with the platform frame via standardized postMessage protocols for state synchronization and event dispatching.</p>
        <h2>Data & Privacy Standards</h2>
        <ul>
          <li>All gameplay loops, high scores, and preferences reside solely in your device's window.localStorage.</li>
          <li>Zero tracking scripts, zero third-party advertising cookies, and zero user account requirements.</li>
          <li>Compatible with modern desktop browsers, mobile touch devices, Chromebooks, and tablets.</li>
        </ul>
      </div>
    </main>
  `;
}

function renderPrivacyPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">Data & Security</div>
        <h1>Privacy Guarantee</h1>
        <ul>
          <li><strong>Local Execution:</strong> 100% of game physics and logic execute on your client device.</li>
          <li><strong>No Login Wall:</strong> No email, credentials, or personal profiles are collected.</li>
          <li><strong>Local Storage Scoped:</strong> Best scores are stored in your device's window.localStorage.</li>
          <li><strong>Zero Remote Paywalls:</strong> Completely open and playable without fees or subscriptions.</li>
        </ul>
      </div>
    </main>
  `;
}

function renderContactPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">Connect</div>
        <h1>Contact & Game Submissions</h1>
        <p>Have an original browser game suggestion, performance feedback, or technical inquiry? Reach out directly:</p>
        <a href="mailto:tejaskrishna.as@gmail.com" style="display:inline-block;margin-top:0.75rem;font-size:1.1rem;color:var(--dk-primary);font-weight:700;">tejaskrishna.as@gmail.com</a>
        <p style="font-size:0.85rem;color:var(--dk-quiet);margin-top:0.75rem;">Please include browser specifications and reproduction steps for bug reports.</p>
      </div>
    </main>
  `;
}

function renderNotFoundPage() {
  return `
    <main class="page-shell">
      <section class="not-found">
        <div class="eyebrow">404 ERROR</div>
        <h1>Page Not Found</h1>
        <p>The requested destination does not exist in the DevKitra rotation.</p>
        <a href="/explore" data-nav class="btn btn-primary">Return to Games Library ▶</a>
      </section>
    </main>
  `;
}

/* ------------------------------------------------------------------ */
/* Global Search                                                      */
/* ------------------------------------------------------------------ */

let pageCleanups = [];

function setupGlobalSearch() {
  const input = document.getElementById('global-search');
  const list = document.getElementById('search-results');
  if (!input || !list) return;

  const update = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      list.classList.add('hidden');
      list.innerHTML = '';
      return;
    }
    const matches = publishedGames().filter(
      (g) => `${g.title} ${g.description} ${g.tags.join(' ')} ${g.genres.map((ge) => genre(ge)?.label).join(' ')}`.toLowerCase().includes(q)
    );
    if (!matches.length) {
      list.classList.remove('hidden');
      list.innerHTML = '<div class="search-empty">No games match that query.</div>';
      return;
    }
    list.classList.remove('hidden');
    list.innerHTML = matches.slice(0, 8).map((g) =>
      `<button type="button" role="option" class="search-item" data-search-link="${g.route}">
        ${g.thumbnail ? `<img src="${g.thumbnail}" alt="" class="search-item-thumb" />` : ''}
        <div class="search-item-text">
          <span class="search-item-title">${escapeHtml(g.title)}</span>
          <span class="search-item-genre">${g.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ') || 'Game'}</span>
        </div>
        <span class="search-item-badge">${GAME_BADGES[g.id] || 'PLAY'}</span>
      </button>`
    ).join('');
    list.querySelectorAll('[data-search-link]').forEach((button) => {
      button.addEventListener('click', () => {
        playUiSound('click');
        navigateTo(button.dataset.searchLink);
        input.value = '';
        list.classList.add('hidden');
      });
    });
  };

  input.addEventListener('input', update);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && input.value.trim()) {
      const matches = publishedGames().filter(
        (g) => `${g.title} ${g.description}`.toLowerCase().includes(input.value.trim().toLowerCase())
      );
      if (matches[0]) {
        playUiSound('click');
        navigateTo(matches[0].route);
        input.value = '';
        list.classList.add('hidden');
      }
    }
    if (event.key === 'Escape') {
      input.value = '';
      list.classList.add('hidden');
      input.blur();
    }
  });

  const onDocClick = (event) => {
    if (!event.target.closest('#global-search') && !event.target.closest('#search-results')) {
      list.classList.add('hidden');
    }
  };
  document.addEventListener('click', onDocClick);
  pageCleanups.push(() => document.removeEventListener('click', onDocClick));

  const onGlobalSlash = (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      input.focus();
    }
  };
  window.addEventListener('keydown', onGlobalSlash);
  pageCleanups.push(() => window.removeEventListener('keydown', onGlobalSlash));
}

/* ------------------------------------------------------------------ */
/* Router & Navigation                                                */
/* ------------------------------------------------------------------ */

let navigationController;

function navigateTo(path) {
  playUiSound('click');
  const normalized = normalizePath(path);
  window.history.pushState({}, '', normalized);
  renderCurrentPage();
}

function setupRouteHandling() {
  app.addEventListener('click', (event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-nav]');
    const href = link?.getAttribute('href');
    if (
      !href || href.startsWith('http') || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      link.target || link.hasAttribute('download')
    ) return;
    event.preventDefault();
    navigateTo(href);
  });
}

function setupNavigationToggle() {
  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('nav-toggle');
  const navigation = document.getElementById('main-nav');
  if (!header || !toggle || !navigation) return;

  navigationController?.abort();
  navigationController = new AbortController();
  const { signal } = navigationController;

  const setOpen = (open) => {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    toggle.innerHTML = menuSvg(open);
  };

  toggle.addEventListener('click', () => {
    playUiSound('click');
    setOpen(!header.classList.contains('nav-open'));
  }, { signal });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  }, { signal });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  }, { signal });
}

function setupSearchToggle() {
  const searchToggle = document.getElementById('search-toggle');
  const searchShell = document.getElementById('header-search');
  const input = document.getElementById('global-search');
  if (!searchToggle || !searchShell) return;

  searchToggle.addEventListener('click', () => {
    playUiSound('click');
    const isOpen = searchShell.classList.toggle('open');
    if (isOpen && input) {
      input.focus();
    }
  });

  const onSearchDocClick = (event) => {
    if (!event.target.closest('#header-search') && !event.target.closest('#search-toggle')) {
      searchShell.classList.remove('open');
    }
  };
  document.addEventListener('click', onSearchDocClick);
  pageCleanups.push(() => document.removeEventListener('click', onSearchDocClick));
}

function setupSoundToggle() {
  const toggle = document.getElementById('sound-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const enabled = toggleSound();
    toggle.innerHTML = soundIcon(enabled);
    toggle.classList.toggle('active', enabled);
    showToast(enabled ? 'Sound FX Enabled' : 'Sound FX Muted');
  });
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    playUiSound('switch');
    const current = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    toggle.innerHTML = themeIcon(next);
  });
}

function setupSurpriseButton() {
  const btn = document.getElementById('surprise-btn');
  if (!btn) return;
  btn.addEventListener('click', () => launchRandomGame());
}

function setupCardHoverSounds() {
  document.querySelectorAll('.game-card, .btn, .cat-pill, .btn-surprise, .spotlight-tab').forEach((el) => {
    el.addEventListener('mouseenter', () => playUiSound('hover'), { passive: true });
  });
}

function renderCurrentPage() {
  pageCleanups.forEach((fn) => fn());
  pageCleanups = [];

  const path = normalizePath();
  setTheme(getTheme());

  const route = matchRoute(path);
  updatePageMetadata({ page: route.page, path, slug: route.slug });

  const pageContent = (() => {
    switch (route.page) {
      case 'home': return renderHomePage();
      case 'explore': return renderExplorePage();
      case 'genre': return renderGenrePage(route.slug);
      case 'game': return renderGamePage(route.slug);
      case 'about': return renderAboutPage();
      case 'privacy': return renderPrivacyPage();
      case 'contact': return renderContactPage();
      default: return renderNotFoundPage();
    }
  })();

  app.innerHTML = `${renderHeader(path)}${pageContent}${renderFooter()}`;

  window.scrollTo(0, 0);

  setupGlobalSearch();
  setupThemeToggle();
  setupSoundToggle();
  setupSurpriseButton();
  setupNavigationToggle();
  setupSearchToggle();
  setupCardHoverSounds();

  if (route.page === 'home') setupHeroShowcase();
  if (route.page === 'explore') setupExplore();
  if (route.page === 'game') setupGamePage(route.slug);
}

window.addEventListener('popstate', renderCurrentPage);
setupRouteHandling();
renderCurrentPage();
