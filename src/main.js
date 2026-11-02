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
const SITE_EMAIL = 'orynvero@gmail.com';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'All Games', href: '/explore' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const GAME_TAGS = {
  'tetris': 'CLASSIC',
  'sky-jump': 'POPULAR',
  'snake': 'RETRO',
  '2048': 'PUZZLE',
  'breakout': 'ARCADE',
  'tower-stack': 'CASUAL',
  'neon-pong': '2-PLAYER AI',
  'cyber-flap': 'REFLEX',
  'memory-match': 'MEMORY',
  'reaction-test': 'BENCHMARK',
};

/* ------------------------------------------------------------------ */
/* Web Audio API Sound Engine (Gentle, Decent & Tasteful)              */
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
      osc.frequency.setValueAtTime(420, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.025);
      osc.start(now); osc.stop(now + 0.025);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'switch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.06);
      osc.start(now); osc.stop(now + 0.06);
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
  if (gameMatch) {
    const slug = gameMatch[1];
    if (slug === 'speed-dash') return { page: 'redirect', target: '/game/road-hopper' };
    if (slug === 'graviton') return { page: 'redirect', target: '/game/sky-jump' };
    if (slug === 'archery' || slug === 'void-strike') return { page: 'redirect', target: '/game/loopbreak' };
    if (slug === 'driftlab') return { page: 'redirect', target: '/game/beltbound' };
    return { page: 'game', slug: slug };
  }
  return { page: 'not-found' };
}

/* ------------------------------------------------------------------ */
/* Random Game Launcher                                               */
/* ------------------------------------------------------------------ */

function launchRandomGame(excludeId = '') {
  playUiSound('click');
  const all = publishedGames().filter((g) => g.id !== excludeId);
  if (!all.length) return;
  const picked = all[Math.floor(Math.random() * all.length)];
  showToast(`Opening ${picked.title}...`, 'info');
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
    '/': { title: `${SITE_NAME} — Free Instant Browser Games`, description: 'Play instant arcade, puzzle, classic, and reflex games right in your browser. Zero installs, no accounts needed.' },
    '/explore': { title: `All Games | ${SITE_NAME}`, description: 'Browse and search our complete collection of free instant browser games.' },
    '/about': { title: `About DevKitra — Free Instant Online Games & Arcade Platform`, description: 'Discover DevKitra: The free instant browser gaming platform. Play original arcade, puzzle, reflex, and retro games with zero downloads, no accounts, and no paywalls.' },
    '/privacy': { title: `Privacy Policy | ${SITE_NAME}`, description: 'Games run 100% locally in your browser. No trackers, no cookies.' },
    '/contact': { title: `Contact & Feedback | ${SITE_NAME}`, description: 'Send feedback and bug reports to DevKitra Gaming.' },
  };

  let page;
  if (route.page === 'game' && gameByRoute(route.path)) {
    const g = gameByRoute(route.path);
    page = { title: `${g.title} — Play Free Online | ${SITE_NAME}`, description: g.description };
  } else if (route.page === 'genre' && genre(route.slug)) {
    const g = genre(route.slug);
    page = { title: `${g.label} Games | ${SITE_NAME}`, description: `Play top ${g.label.toLowerCase()} games online for free.` };
  } else if (pages[route.path]) {
    page = pages[route.path];
  } else {
    page = { title: `Page Not Found | ${SITE_NAME}`, description: 'That page does not exist.' };
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
/* Header & Footer                                                    */
/* ------------------------------------------------------------------ */

function brandMarkup() {
  return `
    <a href="/" data-nav class="brand" aria-label="${SITE_NAME} home">
      <span class="brand-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </span>
      <span class="brand-text">
        <span class="brand-name">Devkitra</span>
        <span class="brand-tag">GAMES</span>
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
              <button id="surprise-btn" type="button" class="btn-random" title="Play a random game">
                ${diceSvg()}
                <span class="btn-random-text">Random</span>
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
          <div class="footer-sub">Free Instant Browser Gaming Platform</div>
        </div>
        <div class="footer-links">
          <a href="/explore" data-nav>All Games</a>
          <a href="/about" data-nav>About Platform</a>
          <a href="/contact" data-nav>Contact & Submissions</a>
          <a href="/privacy" data-nav>Privacy Policy</a>
        </div>
      </div>
      <div class="footer-copy">© ${new Date().getFullYear()} DevKitra Gaming. All games execute 100% client-side in browser memory with zero tracking cookies and zero downloads.</div>
    </footer>
    </div></div>
  `;
}

/* ------------------------------------------------------------------ */
/* Game Card                                                          */
/* ------------------------------------------------------------------ */

function gameCard(game) {
  const badgeText = GAME_TAGS[game.id] || (game.featured ? 'POPULAR' : '');
  const genreLabels = game.genres.map((g) => genre(g)?.label).filter(Boolean).join(' · ') || 'Game';
  const thumb = game.thumbnail
    ? `<img src="${game.thumbnail}" alt="${escapeHtml(game.title)} cover" loading="lazy" />`
    : `<div class="card-fallback">${escapeHtml(game.title[0])}</div>`;

  return `
    <a href="${game.route}" data-nav class="game-card" data-game-card="${game.id}">
      <div class="game-card-thumb">
        ${thumb}
        ${badgeText ? `<div class="game-badge">${escapeHtml(badgeText)}</div>` : ''}
        <div class="game-card-play" aria-hidden="true">
          <span class="play-pill">Play Now ▶</span>
        </div>
      </div>
      <div class="game-card-body">
        <span class="game-card-genre">${genreLabels}</span>
        <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
        <p class="game-card-desc">${escapeHtml(game.description)}</p>
      </div>
      <div class="game-card-foot">
        <span>${game.inputs.map((inp) => inp === 'keyboard' ? 'Keyboard' : inp === 'touch' ? 'Touch' : 'Mouse').join(' · ')}</span>
        <span class="game-card-cta">Play →</span>
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
  const spotlightGame = all.find((g) => g.id === 'neon-bastion') || all[0];

  const reflexPicks = all.filter((g) => ['neon-bastion', 'road-hopper', 'sky-jump', 'snake', 'breakout'].includes(g.id));
  const puzzlePicks = all.filter((g) => ['tetris', '2048', 'memory-match', 'tower-stack'].includes(g.id));

  return `
    <main class="page-shell home-page">
      <!-- Clean Spotlight Hero Banner -->
      <section class="hero-spotlight">
        <div class="spotlight-card">
          <div class="spotlight-content">
            <div class="spotlight-badge-row">
              <span class="spotlight-tag">FEATURED GAME</span>
              <span class="spotlight-genre">${spotlightGame.genres.map((g) => genre(g)?.label).filter(Boolean).join(' · ')}</span>
            </div>
            <h1 id="spotlight-title">${escapeHtml(spotlightGame.title)}</h1>
            <p id="spotlight-desc" class="spotlight-desc">${escapeHtml(spotlightGame.description)}</p>
            <div class="spotlight-actions">
              <a href="${spotlightGame.route}" data-nav class="btn btn-primary" id="spotlight-play-btn">Play Now ▶</a>
              <a href="/explore" data-nav class="btn btn-secondary">Explore All Games</a>
              <button type="button" class="btn btn-secondary" id="hero-random-btn">${diceSvg()} Surprise Me</button>
            </div>
          </div>
          <div class="spotlight-media">
            <img src="${spotlightGame.thumbnail}" alt="${escapeHtml(spotlightGame.title)}" id="spotlight-img" />
          </div>
        </div>

        <!-- Featured Selector Tabs -->
        <div class="featured-tabs" id="featured-tabs">
          ${featured.slice(0, 5).map((g) => `
            <button type="button" class="ft-tab ${g.id === spotlightGame.id ? 'active' : ''}"
              data-id="${g.id}"
              data-title="${escapeHtml(g.title)}"
              data-desc="${escapeHtml(g.description)}"
              data-route="${g.route}"
              data-thumb="${g.thumbnail}"
              data-genre="${g.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ')}">
              ${escapeHtml(g.title)}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Category Navigation Dock -->
      <section class="section" style="margin-top: 2rem;">
        <div class="category-dock">
          <a href="/explore" data-nav class="cat-pill active">All Games (${all.length})</a>
          ${populatedGenres.map((g) => `
            <a href="/genre/${g.slug}" data-nav class="cat-pill">${escapeHtml(g.label)} (${genreGameCount(g.slug)})</a>
          `).join('')}
        </div>
      </section>

      <!-- Shelf 1: Top Rated / Popular Hits -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">POPULAR HITS</div>
            <h2>Featured Games</h2>
            <p>Our most played instant browser games with responsive controls and highscore tracking.</p>
          </div>
          <a href="/explore" data-nav class="btn btn-secondary btn-sm">View All →</a>
        </div>
        <div class="featured-grid">${featured.map((g) => gameCard(g)).join('')}</div>
      </section>

      <!-- Shelf 2: Fast Reflex & Arcade -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">FAST ACTION</div>
            <h2>Reflex & Arcade Games</h2>
            <p>Jump, dodge, bounce, and react with precision timing.</p>
          </div>
        </div>
        <div class="game-grid">${reflexPicks.map((g) => gameCard(g)).join('')}</div>
      </section>

      <!-- Shelf 3: Puzzles & Brain Teasers -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">BRAIN TEASERS</div>
            <h2>Puzzles & Casual Games</h2>
            <p>Match tiles, arrange blocks, and exercise your memory.</p>
          </div>
        </div>
        <div class="game-grid">${puzzlePicks.map((g) => gameCard(g)).join('')}</div>
      </section>

      <!-- Shelf 4: Complete Catalogue -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">FULL CATALOGUE</div>
            <h2>All 10 Games</h2>
            <p>Every game is 100% free, runs instantly in your browser, and requires no downloads.</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="section-random-btn">${diceSvg()} Random Game</button>
        </div>
        <div class="game-grid">${all.map((g) => gameCard(g)).join('')}</div>
      </section>
    </main>
  `;
}

function setupHeroShowcase() {
  const tabs = document.querySelectorAll('#featured-tabs .ft-tab');
  const imgEl = document.getElementById('spotlight-img');
  const titleEl = document.getElementById('spotlight-title');
  const descEl = document.getElementById('spotlight-desc');
  const playBtn = document.getElementById('spotlight-play-btn');
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

      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
      if (playBtn) playBtn.href = route;
      if (imgEl && thumb) imgEl.src = thumb;
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
          <div class="eyebrow">LIBRARY</div>
          <h1>All Games (${all.length})</h1>
          <p>Instant search by title, category, or tags. Filter by genre in real time.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="explore-random-btn">${diceSvg()} Random Pick</button>
      </div>
      <div class="search-sort">
        <div class="search-shell explore-search">
          <input id="explore-search" type="search" placeholder="Search by game title, category, or tag…" aria-label="Search games" />
          ${searchSvg()}
        </div>
        <div class="select-shell">
          <select id="explore-sort" aria-label="Sort games">
            <option value="added">Newest Added</option>
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
        <p>Try searching for "tetris", "snake", "jump", or "puzzle".</p>
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
          <div class="eyebrow">CATEGORY</div>
          <h1>${escapeHtml(g.label)} Games</h1>
          <p>${escapeHtml(g.description)}</p>
        </div>
        <a href="/explore" data-nav class="btn btn-secondary btn-sm">All Categories →</a>
      </div>
      <p class="directory-count">${list.length} game${list.length === 1 ? '' : 's'} in this category</p>
      ${list.length
        ? `<div class="game-grid">${list.map((game) => gameCard(game)).join('')}</div>`
        : `<div class="empty-state"><h2>No ${escapeHtml(g.label)} games yet.</h2><p>Check back soon.</p></div>`
      }
    </main>
  `;
}

/* ------------------------------------------------------------------ */
/* Game Screen                                                        */
/* ------------------------------------------------------------------ */

function renderGamePage(slug) {
  const game = gameByRoute(`/game/${slug}`);
  if (!game) return renderNotFoundPage();

  const related = publishedGames()
    .filter((g) => g.id !== game.id)
    .slice(0, 4);

  const pauseMarkup = game.pause
    ? `<button type="button" class="game-tool-btn" data-action="pause" aria-pressed="false" title="Pause / Resume [P]">⏸ Pause</button>`
    : '';

  const genreLabels = game.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ');

  return `
    <main class="page-shell game-page">
      <!-- Breadcrumb navigation -->
      <div class="game-top-bar">
        <a href="/explore" data-nav class="back-link">← Back to All Games</a>
        <div class="game-top-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="game-random-btn">${diceSvg()} Next Game</button>
        </div>
      </div>

      <!-- Main Game Canvas Container -->
      <div class="game-player-card" id="game-player-card">
        <div class="player-toolbar">
          <div class="toolbar-title-wrap">
            <span class="game-badge-chip">${escapeHtml(genreLabels)}</span>
            <span class="toolbar-game-title">${escapeHtml(game.title)}</span>
          </div>
          <div class="toolbar-tools">
            ${pauseMarkup}
            <button type="button" class="game-tool-btn" data-action="restart" title="Restart [R]">↺ Restart</button>
            <button type="button" class="game-tool-btn" data-action="theater" id="theater-toggle" title="Toggle Theater View (Expands to screen width)">🗖 Theater</button>
            <button type="button" class="game-tool-btn game-tool-btn-primary" data-action="fullscreen" id="fs-toggle" title="Full Screen [F]">⛶ Fullscreen</button>
          </div>
        </div>

        <div class="game-viewport-wrap" id="game-viewport">
          <iframe class="game-viewport-frame" id="active-game-frame" src="${game.standalone}${game.pause ? '?embed=1' : ''}" title="${escapeHtml(game.title)}" allowfullscreen allow="autoplay"></iframe>
        </div>
      </div>

      <!-- Instructions & Details -->
      <div class="game-info-grid">
        <div class="info-card">
          <h2>How to Play & Controls</h2>
          <p class="game-desc-p">${escapeHtml(game.description)}</p>
          <div class="controls-keys-row">
            ${game.inputs.map((input) => `<span class="kbd">${escapeHtml(input)}</span>`).join('')}
          </div>
          <p class="controls-detail">${escapeHtml(game.controls)}</p>
          ${game.save ? '<p class="save-status">✓ Highscores & progress save automatically in your browser.</p>' : ''}
          <div class="hotkey-helpers">
            <span class="hotkey-pill"><kbd>R</kbd> Restart</span>
            ${game.pause ? '<span class="hotkey-pill"><kbd>P</kbd> Pause</span>' : ''}
            <span class="hotkey-pill"><kbd>F</kbd> Fullscreen</span>
          </div>
        </div>

        <!-- Related Games -->
        <div class="info-card">
          <h2>More Games You'll Enjoy</h2>
          <div class="related-list">${related.map((r) => `
            <a href="${r.route}" data-nav class="related-item">
              ${r.thumbnail ? `<img class="related-thumb" src="${r.thumbnail}" alt="" loading="lazy" />` : ''}
              <div class="related-text">
                <span class="related-title">${escapeHtml(r.title)}</span>
                <span class="related-genre">${r.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ')}</span>
              </div>
              <span class="related-play">Play →</span>
            </a>
          `).join('')}</div>
        </div>
      </div>
    </main>
  `;
}

function setupGamePage(slug) {
  const game = gameByRoute(`/game/${slug}`);
  if (!game) return;

  const viewport = document.getElementById('game-viewport');
  const playerCard = document.getElementById('game-player-card');
  const frame = document.getElementById('active-game-frame');
  const restart = document.querySelector('[data-action="restart"]');
  const pauseBtn = document.querySelector('[data-action="pause"]');
  const theaterBtn = document.getElementById('theater-toggle');
  const fsBtn = document.getElementById('fs-toggle');
  const randomBtn = document.getElementById('game-random-btn');
  const origin = window.location.origin;

  if (randomBtn) {
    randomBtn.addEventListener('click', () => launchRandomGame(game.id));
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
        pauseBtn.textContent = '⏸ Pause';
        pauseBtn.setAttribute('aria-pressed', 'false');
      }
      postToGame({ type: 'dk:restart' });
      frame.focus();
    });
  }

  if (pauseBtn && game.pause) {
    pauseBtn.addEventListener('click', () => {
      playUiSound('click');
      paused = !paused;
      pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
      pauseBtn.setAttribute('aria-pressed', String(paused));
      postToGame(paused ? { type: 'dk:pause' } : { type: 'dk:resume' });
      frame.focus();
    });
  }

  /* Theater mode toggle */
  if (theaterBtn && playerCard) {
    theaterBtn.addEventListener('click', () => {
      playUiSound('click');
      const isTheater = playerCard.classList.toggle('theater-mode');
      theaterBtn.textContent = isTheater ? '🗗 Standard' : '🗖 Theater';
      theaterBtn.setAttribute('aria-pressed', String(isTheater));
      if (isTheater) {
        playerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      postToGame({ type: 'dk:resize' });
      frame.focus();
    });
  }

  if (fsBtn && viewport) {
    fsBtn.addEventListener('click', () => {
      playUiSound('click');
      const target = playerCard || viewport;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (target.requestFullscreen) target.requestFullscreen();
        else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
      frame.focus();
    });
  }

  const handleFsChange = () => {
    const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    if (playerCard) playerCard.classList.toggle('is-fullscreen', isFs);
    if (fsBtn) fsBtn.textContent = isFs ? '✕ Exit Fullscreen' : '⛶ Fullscreen';
    postToGame({ type: 'dk:fullscreen', fullscreen: isFs });
    postToGame({ type: 'dk:resize' });
  };

  document.addEventListener('fullscreenchange', handleFsChange);
  document.addEventListener('webkitfullscreenchange', handleFsChange);
  pageCleanups.push(() => {
    document.removeEventListener('fullscreenchange', handleFsChange);
    document.removeEventListener('webkitfullscreenchange', handleFsChange);
  });

  if (frame) {
    frame.addEventListener('load', () => {
      try { frame.focus(); } catch (_) {}
    });
  }

  if (viewport) {
    viewport.addEventListener('click', () => {
      try { frame?.focus(); } catch (_) {}
    });
  }

  /* Hotkeys helper & Gameplay Key Forwarder */
  const onKeydown = (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyC', 'Space'];
    if (gameKeys.includes(event.code)) {
      if (document.querySelector('.game-page')) {
        event.preventDefault();
        postToGame({ type: 'dk:keydown', code: event.code, key: event.key });
      }
    }

    if (event.key === 'r' || event.key === 'R') {
      restart?.click();
    } else if (event.key === 'p' || event.key === 'P') {
      pauseBtn?.click();
    } else if (event.key === 'f' || event.key === 'F') {
      fsBtn?.click();
    }
  };

  const onKeyup = (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyC', 'Space'];
    if (gameKeys.includes(event.code)) {
      if (document.querySelector('.game-page')) {
        event.preventDefault();
        postToGame({ type: 'dk:keyup', code: event.code, key: event.key });
      }
    }
  };

  window.addEventListener('keydown', onKeydown);
  window.addEventListener('keyup', onKeyup);
  pageCleanups.push(() => {
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('keyup', onKeyup);
  });
}

window.addEventListener('message', (event) => {
  const origin = siteUrl() || window.location.origin;
  if (event.origin !== origin) return;
  const { type, score } = event.data || {};
  if (type === 'dk:gameover' && score !== undefined && document.querySelector('.game-viewport-frame')) {
    showToast(`Game Over · Score: ${score}`, 'info');
  }
});

function renderAboutPage() {
  return `
    <main class="page-shell about-page">
      <div class="about-container">
        <!-- Hero Section -->
        <header class="about-hero">
          <div class="eyebrow">ABOUT DEVKITRA</div>
          <h1>Free Instant Online Games — Play Instantly in Your Browser</h1>
          <p class="about-lead">
            Welcome to DevKitra Games, your home for fast, fun, and lightweight browser games. We build premium, original games you can play directly on any screen with <strong>zero downloads</strong>, <strong>no account sign-ups</strong>, and <strong>no paywalls</strong>.
          </p>
          <div class="about-hero-actions">
            <a href="/explore" class="btn btn-primary btn-lg" data-nav>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Explore All Games
            </a>
            <a href="/genre/arcade" class="btn btn-secondary btn-lg" data-nav>
              Arcade & Action
            </a>
          </div>
        </header>

        <!-- Why Players Love DevKitra (Core Player Benefits) -->
        <section class="about-section">
          <div class="about-section-header">
            <span class="eyebrow">THE DEVKITRA ADVANTAGE</span>
            <h2>Gaming The Way It Should Be</h2>
            <p>No waiting. No massive downloads. Pure, responsive fun on any screen.</p>
          </div>
          
          <div class="about-features-grid">
            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">⚡</div>
              <h3>Instant Play in Seconds</h3>
              <p>Forget 50GB downloads, painful installations, and slow loading bars. Click any game and jump right into the action within seconds in Chrome, Safari, Edge, or Firefox.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">🎮</div>
              <h3>100% Free Forever</h3>
              <p>Every single game on DevKitra is completely free. No subscription fees, no locked levels, and no predatory pay-to-win mechanics. Just pure gameplay.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">🛡️</div>
              <h3>No Accounts or Sign-Ups</h3>
              <p>We respect your time and privacy. There are no passwords to remember, no mandatory emails, and zero marketing spam. Simply visit the site and play.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">📱</div>
              <h3>Any Device, Anywhere</h3>
              <p>Play effortlessly on mobile phones, tablets, Chromebooks, laptops, and desktop PCs. Every title includes responsive touch controls and precision keyboard support.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">🏆</div>
              <h3>Automatic High Scores</h3>
              <p>Your high scores, best wave records, and personal preferences are safely remembered on your device, allowing you to challenge your records whenever you return.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">☕</div>
              <h3>Perfect for Quick Breaks</h3>
              <p>Whether you have 3 minutes between classes, a coffee break at work, or an hour to unwind at home, our bite-sized arcade and puzzle challenges fit your day.</p>
            </div>
          </div>
        </section>

        <!-- Curated Categories (SEO rich internal linking) -->
        <section class="about-section">
          <div class="about-section-header">
            <span class="eyebrow">BROWSE POPULAR GENRES</span>
            <h2>Find Your Next Favorite Game</h2>
            <p>From adrenaline-pumping survival action to relaxing brain puzzles, we have games for every mood.</p>
          </div>

          <div class="about-genres-grid">
            <a href="/genre/arcade" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">🚀</div>
              <div class="genre-details">
                <h3>Arcade & Survival</h3>
                <p>High-energy survival shooters, arena defense, and cosmic combat games designed to test your reflexes.</p>
                <span class="genre-link-text">Play Arcade Games &rarr;</span>
              </div>
            </a>

            <a href="/genre/puzzle" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">🧩</div>
              <div class="genre-details">
                <h3>Brain Teasers & Puzzles</h3>
                <p>Smart, satisfying number match games like 2048, spatial logic challenges, and strategic grid puzzles.</p>
                <span class="genre-link-text">Play Puzzle Games &rarr;</span>
              </div>
            </a>

            <a href="/genre/reflex" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">⚡</div>
              <div class="genre-details">
                <h3>Reflex & Gravity Runners</h3>
                <p>One-touch gravity switching, rhythm courses, and precision obstacle runs where every millisecond counts.</p>
                <span class="genre-link-text">Play Reflex Games &rarr;</span>
              </div>
            </a>

            <a href="/genre/classic" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">👾</div>
              <div class="genre-details">
                <h3>Retro & Timeless Classics</h3>
                <p>Modernized homages to golden-era arcade legends: classic snake, paddle tennis, brick breakers, and minesweeper.</p>
                <span class="genre-link-text">Play Classic Games &rarr;</span>
              </div>
            </a>
          </div>
        </section>

        <!-- Mission & Player-First Philosophy Card -->
        <section class="about-story-card">
          <div class="eyebrow">OUR MISSION</div>
          <h2>Bringing Back the Pure Fun of Web Gaming</h2>
          <p>
            Remember when online games were simple, instant, and fun? You opened a webpage, clicked play, and lost yourself in pure entertainment without installing 100MB apps, consenting to dozens of ad tracking cookies, or dodging paywalls.
          </p>
          <p>
            At <strong>DevKitra</strong>, we are dedicated to revitalizing that golden era of web gaming with modern web technology. Every game is handcrafted with crisp 60 FPS graphics, silky-smooth physics, and responsive controls — all packaged into ultralight pages that load in the blink of an eye.
          </p>
          <p>
            Whether you are a casual player looking to pass time, a student taking a break between assignments, or a retro enthusiast hunting for high scores, DevKitra is built for you.
          </p>
        </section>

        <!-- Frequently Asked Questions (SEO Supportive FAQ) -->
        <section class="about-section">
          <div class="about-section-header">
            <span class="eyebrow">COMMON QUESTIONS</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about playing free online games on DevKitra.</p>
          </div>

          <div class="about-faq-grid">
            <div class="faq-item">
              <h3>Are games on DevKitra really free?</h3>
              <p>Yes, 100%! All games on DevKitra are completely free to play. There are no subscriptions, no locked paid levels, and no in-app purchases.</p>
            </div>

            <div class="faq-item">
              <h3>Do I need to download or install anything?</h3>
              <p>Never. All games run directly inside your web browser (Chrome, Edge, Safari, Firefox) on both desktop and mobile devices. Just tap or click to play.</p>
            </div>

            <div class="faq-item">
              <h3>Can I play on my mobile phone or tablet?</h3>
              <p>Yes. DevKitra games are fully responsive and touch-optimized. They work smoothly on iPhones, iPads, Android phones, tablets, and Chromebooks.</p>
            </div>

            <div class="faq-item">
              <h3>Are my high scores and settings saved?</h3>
              <p>Yes! Your personal high scores, best wave records, and sound preferences are automatically saved in your browser's local memory so your achievements remain intact.</p>
            </div>

            <div class="faq-item">
              <h3>Is DevKitra safe for kids and school/work breaks?</h3>
              <p>DevKitra is a family-safe, clean web gaming hub. We don't distribute executable files, spam downloads, or harmful links, making it ideal for quick, harmless fun.</p>
            </div>

            <div class="faq-item">
              <h3>How can I suggest a game or report an issue?</h3>
              <p>We'd love to hear your feedback! You can reach us anytime through our <a href="/contact" data-nav>Contact Page</a> or by emailing us directly at <a href="mailto:orynvero@gmail.com">orynvero@gmail.com</a>.</p>
            </div>
          </div>
        </section>

        <!-- Bottom Call To Action Banner -->
        <section class="about-cta-banner">
          <h2>Ready to Jump Into the Action?</h2>
          <p>Pick a game, beat your high score, and have fun — no downloads required.</p>
          <a href="/explore" class="btn btn-primary btn-lg" data-nav>
            Explore All Free Games
          </a>
        </section>
      </div>
    </main>
  `;
}

function renderPrivacyPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">PRIVACY</div>
        <h1>Privacy Guarantee</h1>
        <ul>
          <li><strong>100% Client-Side:</strong> Games execute locally in your browser memory.</li>
          <li><strong>No User Accounts:</strong> No email addresses, phone numbers, or passwords collected.</li>
          <li><strong>Local Progress:</strong> Scores and settings reside exclusively on your computer/phone.</li>
          <li><strong>No Paywalls:</strong> Completely free to play for everyone.</li>
        </ul>
      </div>
    </main>
  `;
}

function renderContactPage() {
  const games = publishedGames();
  const gameOptions = games.map((g) => `<option value="${escapeHtml(g.title)}">${escapeHtml(g.title)}</option>`).join('');

  return `
    <main class="page-shell contact-page">
      <div class="contact-container">
        <!-- Hero Header -->
        <header class="contact-hero">
          <div class="eyebrow">GET IN TOUCH</div>
          <h1>Contact & Support</h1>
          <p>Have a question, feedback, or a bug report? Reach out directly or compose a quick message below.</p>
        </header>

        <!-- Direct Email Card -->
        <div class="contact-email-card">
          <div class="email-card-info">
            <div class="email-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <div>
              <div class="email-card-meta">
                <span class="meta-label">DIRECT EMAIL</span>
                <span class="meta-status"><span class="status-dot"></span>Replies within 24h</span>
              </div>
              <a href="mailto:${SITE_EMAIL}" class="email-card-link" id="contact-email-val">${SITE_EMAIL}</a>
            </div>
          </div>
          <div class="email-card-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-email" title="Copy email address to clipboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span id="copy-email-text">Copy Email</span>
            </button>
            <a href="mailto:${SITE_EMAIL}" class="btn btn-primary btn-sm" id="btn-direct-mailto">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <span>Send Email</span>
            </a>
          </div>
        </div>

        <!-- Quick Message Composer -->
        <div class="contact-composer-card">
          <div class="composer-header">
            <h2>Quick Message Composer</h2>
            <p>Prepares a structured draft for your email client with optional device specs.</p>
          </div>

          <form id="contact-composer-form" class="composer-form" onsubmit="return false;">
            <div class="form-row">
              <div class="form-group flex-1">
                <label for="contact-name" class="form-label">Your Name <span class="label-optional">(optional)</span></label>
                <input type="text" id="contact-name" class="form-input" placeholder="e.g. Alex" autocomplete="name" />
              </div>
              <div class="form-group flex-1">
                <label for="contact-topic" class="form-label">Inquiry Topic</label>
                <select id="contact-topic" class="form-select">
                  <option value="Bug Report / Glitch">Bug Report / Glitch</option>
                  <option value="Game Suggestion">Game Suggestion</option>
                  <option value="Developer Game Submission">Developer Game Submission</option>
                  <option value="Performance Feedback">Performance / Audio Issue</option>
                  <option value="General Inquiry">General Inquiry / Other</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="contact-game" class="form-label">Related Game <span class="label-optional">(optional)</span></label>
              <select id="contact-game" class="form-select">
                <option value="General Platform">General Platform (No specific game)</option>
                ${gameOptions}
              </select>
            </div>

            <div class="form-group">
              <label for="contact-message" class="form-label">Message Details <span class="label-required">*</span></label>
              <textarea id="contact-message" class="form-textarea" rows="4" placeholder="Describe your question, bug report, or game proposal..."></textarea>
            </div>

            <div class="form-group checkbox-group">
              <label class="form-checkbox-label">
                <input type="checkbox" id="contact-sysinfo" checked />
                <span>Include browser & device specs to speed up troubleshooting</span>
              </label>
            </div>

            <div class="composer-actions">
              <button type="button" class="btn btn-primary" id="btn-composer-send">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span>Compose in Email App</span>
              </button>
              <button type="button" class="btn btn-secondary" id="btn-composer-copy">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                <span id="composer-copy-text">Copy Formatted Text</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  `;
}

function setupContactPage() {
  const copyEmailBtn = document.getElementById('btn-copy-email');
  const copyEmailText = document.getElementById('copy-email-text');
  const sendBtn = document.getElementById('btn-composer-send');
  const copyMsgBtn = document.getElementById('btn-composer-copy');
  const copyMsgText = document.getElementById('composer-copy-text');
  const nameInput = document.getElementById('contact-name');
  const topicSelect = document.getElementById('contact-topic');
  const gameSelect = document.getElementById('contact-game');
  const messageInput = document.getElementById('contact-message');
  const sysinfoCheck = document.getElementById('contact-sysinfo');

  function copyTextToClipboard(text, successCb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(successCb).catch(() => fallbackCopy(text, successCb));
    } else {
      fallbackCopy(text, successCb);
    }
  }

  function fallbackCopy(text, successCb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      successCb();
    } catch (_) {
      showToast('Please copy manually: ' + text, 'info');
    }
    ta.remove();
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      playUiSound('click');
      copyTextToClipboard(SITE_EMAIL, () => {
        if (copyEmailText) copyEmailText.textContent = 'Copied!';
        showToast('Email address copied to clipboard!', 'success');
        setTimeout(() => {
          if (copyEmailText) copyEmailText.textContent = 'Copy Email';
        }, 2200);
      });
    });
  }

  function buildMessagePayload() {
    const name = nameInput?.value.trim() || 'Player / Developer';
    const topic = topicSelect?.value || 'General Inquiry';
    const game = gameSelect?.value || 'General Platform';
    const message = messageInput?.value.trim() || '';

    let diagnostics = '';
    if (sysinfoCheck?.checked) {
      const screenRes = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;
      const ua = navigator.userAgent;
      diagnostics = `\n\n--- System Diagnostic Specs ---\nTarget Game: ${game}\nURL: ${window.location.origin}\nScreen: ${screenRes}\nUser Agent: ${ua}\nTimestamp: ${new Date().toISOString()}`;
    }

    const subject = `[DevKitra ${topic}] ${game !== 'General Platform' ? game + ' - ' : ''}from ${name}`;
    const body = `Hello DevKitra Team,\n\nSender: ${name}\nTopic: ${topic}\nGame: ${game}\n\nMessage:\n${message}${diagnostics}\n`;

    return { name, topic, game, message, subject, body };
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      playUiSound('click');
      const payload = buildMessagePayload();
      if (!payload.message) {
        showToast('Please enter a brief message before sending.', 'info');
        messageInput?.focus();
        return;
      }
      const mailtoUrl = `mailto:${encodeURIComponent(SITE_EMAIL)}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;
      showToast('Opening your email client...', 'info');
      window.location.href = mailtoUrl;
    });
  }

  if (copyMsgBtn) {
    copyMsgBtn.addEventListener('click', () => {
      playUiSound('click');
      const payload = buildMessagePayload();
      if (!payload.message) {
        showToast('Please enter a brief message first.', 'info');
        messageInput?.focus();
        return;
      }
      copyTextToClipboard(`To: ${SITE_EMAIL}\nSubject: ${payload.subject}\n\n${payload.body}`, () => {
        if (copyMsgText) copyMsgText.textContent = 'Copied!';
        showToast('Formatted message copied! Paste directly into Gmail/Outlook.', 'success');
        setTimeout(() => {
          if (copyMsgText) copyMsgText.textContent = 'Copy Formatted Text';
        }, 2200);
      });
    });
  }
}

function renderNotFoundPage() {
  return `
    <main class="page-shell">
      <section class="not-found">
        <div class="eyebrow">404</div>
        <h1>Game Not Found</h1>
        <p>The page or game you requested does not exist.</p>
        <a href="/explore" data-nav class="btn btn-primary">Browse All Games ▶</a>
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
        <span class="search-item-badge">${GAME_TAGS[g.id] || 'PLAY'}</span>
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
    showToast(enabled ? 'Sound FX Enabled' : 'Sound FX Muted', 'info');
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
  document.querySelectorAll('.game-card, .btn, .cat-pill, .btn-random, .ft-tab').forEach((el) => {
    el.addEventListener('mouseenter', () => playUiSound('hover'), { passive: true });
  });
}

function renderCurrentPage() {
  pageCleanups.forEach((fn) => fn());
  pageCleanups = [];

  const path = normalizePath();
  setTheme(getTheme());

  const route = matchRoute(path);
  if (route.page === 'redirect') {
    navigateTo(route.target);
    return;
  }
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
  if (route.page === 'contact') setupContactPage();
}

window.addEventListener('popstate', renderCurrentPage);
setupRouteHandling();
renderCurrentPage();
