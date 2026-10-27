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
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

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
      osc.frequency.setValueAtTime(480, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.035);
      osc.start(now); osc.stop(now + 0.035);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.06);
      osc.start(now); osc.stop(now + 0.06);
    } else if (type === 'switch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.09);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.09);
      osc.start(now); osc.stop(now + 0.09);
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
    '/': { title: `${SITE_NAME} — Instant Browser Gaming Platform`, description: 'Play instant arcade, puzzle, physics and reflex games with zero installs or accounts.' },
    '/explore': { title: `Explore Games Library | ${SITE_NAME}`, description: 'Browse and search DevKitra Gaming instant games catalogue.' },
    '/about': { title: `About Platform | ${SITE_NAME}`, description: 'DevKitra Gaming is a standalone, client-side browser gaming destination.' },
    '/privacy': { title: `Privacy Policy | ${SITE_NAME}`, description: 'Games run 100% locally in your browser. No trackers, no accounts.' },
    '/contact': { title: `Contact & Feedback | ${SITE_NAME}`, description: 'Send feedback and bug reports to DevKitra Gaming.' },
  };

  let page;
  if (route.page === 'game' && gameByRoute(route.path)) {
    const g = gameByRoute(route.path);
    page = { title: `${g.title} — Play Free Online | ${SITE_NAME}`, description: g.description };
  } else if (route.page === 'genre' && genre(route.slug)) {
    const g = genre(route.slug);
    page = { title: `${g.label} Browser Games | ${SITE_NAME}`, description: `Play top ${g.label.toLowerCase()} games right in your browser.` };
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
    console.error(`Unable to set canonical metadata: ${error.message}`);
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
/* Shared UI Components                                               */
/* ------------------------------------------------------------------ */

function brandMarkup() {
  return `
    <a href="/" data-nav class="brand" aria-label="${SITE_NAME} home">
      <span class="brand-mark">DK</span>
      <span class="brand-name">
        <span class="brand-main">DevKitra</span>
        <span class="brand-sub">Gaming</span>
      </span>
    </a>
  `;
}

function soundIcon(enabled) {
  if (enabled) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M7 3L3.5 6H1v4h2.5L7 13V3z" fill="currentColor"/><path d="M10 5a4 4 0 010 6M12 3a7 7 0 010 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M7 3L3.5 6H1v4h2.5L7 13V3z" fill="currentColor"/><path d="M10 6l4 4M14 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
}

function themeIcon(theme) {
  if (theme === 'light') {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5v1.5m0 10v1.5m-4.6-11.1 1.06 1.06m7.08 7.08 1.06 1.06M1.5 8H3m10 0h1.5M3.4 12.6l1.06-1.06m7.08-7.08 1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M14 9.2A6 6 0 0 1 6.8 2a6 6 0 1 0 7.2 7.2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function searchSvg() {
  return `<svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/><path d="m11 11 3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
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
              <div class="search-shell header-search" id="header-search">
                <input id="global-search" type="search" placeholder="Search games…" aria-label="Search games" />
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
          <div class="brand-sub" style="margin-top:0.2rem;">Client-Side Gaming Architecture</div>
        </div>
        <div class="footer-links">
          <a href="/explore" data-nav>Explore</a>
          <a href="/about" data-nav>About</a>
          <a href="/contact" data-nav>Contact</a>
          <a href="/privacy" data-nav>Privacy</a>
        </div>
      </div>
      <div class="footer-copy">© ${new Date().getFullYear()} DevKitra Gaming. Games run locally in browser memory. No tracking cookies. Zero installations.</div>
    </footer>
    </div></div>
  `;
}

/* ------------------------------------------------------------------ */
/* Game card                                                          */
/* ------------------------------------------------------------------ */

function gameCard(game, badge = '') {
  const genreLabels = game.genres.map((g) => genre(g)?.label).filter(Boolean).join(' · ') || 'Game';
  const thumb = game.thumbnail
    ? `<img src="${game.thumbnail}" alt="${escapeHtml(game.title)} cover" loading="lazy" />`
    : `<div style="width:100%;height:100%;display:grid;place-items:center;color:var(--dk-quiet);font-size:1.6rem;font-weight:900;">${escapeHtml(game.title[0])}</div>`;

  return `
    <a href="${game.route}" data-nav class="game-card" data-game-card="${game.id}">
      <div class="game-card-thumb">
        ${thumb}
        ${badge ? `<div class="game-badge">${badge}</div>` : ''}
        <div class="game-card-play" aria-hidden="true">
          <span class="play-pill">Play Game ▶</span>
        </div>
      </div>
      <div class="game-card-body">
        <span class="game-card-genre">${genreLabels}</span>
        <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
        <p class="game-card-desc">${escapeHtml(game.description)}</p>
      </div>
      <div class="game-card-foot">
        <span>${game.inputs.map((inp) => inp === 'keyboard' ? '⌨ Keyboard' : inp === 'touch' ? '📱 Touch' : '🖱 Mouse').join(' · ')}</span>
        <span class="game-card-cta">Instant Play →</span>
      </div>
    </a>
  `;
}

/* ------------------------------------------------------------------ */
/* Pages                                                              */
/* ------------------------------------------------------------------ */

function renderHomePage() {
  const featured = featuredGames();
  const all = [...publishedGames()].sort((a, b) => (b.added || '').localeCompare(a.added || ''));
  const populatedGenres = genres.filter((g) => genreGameCount(g.slug) > 0);
  const activeSpotlight = featured[0] || all[0];

  return `
    <main class="page-shell home-page">
      <!-- Hero Arcade Showcase -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-copy">
            <div class="eyebrow">DevKitra Arcade Arena</div>
            <h1>Next-Gen Gaming.<br /><span>Instant Play. Zero Lag.</span></h1>
            <p class="hero-description">Experience high-speed browser games designed with reactive controls, fluid physics, and zero downloads. Select any title to play immediately.</p>
            <div class="hero-actions">
              <a href="${activeSpotlight.route}" data-nav class="btn btn-primary" id="hero-play-btn">Play ${escapeHtml(activeSpotlight.title)} Now ▶</a>
              <a href="/explore" data-nav class="btn btn-ghost">Browse Catalogue</a>
            </div>
            <div class="hero-meta">
              <span><span class="dot"></span>${all.length} Verified Games</span>
              <span><span class="dot"></span>60fps Canvas Tech</span>
              <span><span class="dot"></span>Local Highscores</span>
            </div>
          </div>
          <!-- Hero Arcade Cabinet Console -->
          <div class="hero-arcade">
            <div class="hero-tabs" id="hero-switcher">
              ${all.map((g, idx) => `
                <button type="button" class="hero-tab ${g.id === activeSpotlight.id ? 'active' : ''}" data-hero-id="${g.id}" data-hero-src="${g.standalone}?embed=1" data-hero-title="${escapeHtml(g.title)}" data-hero-route="${g.route}">
                  ${g.id === 'snake' ? '🐍 Snake' : g.id === 'breakout' ? '🧱 Breakout' : g.id === 'reaction-test' ? '⚡ Reflex' : g.id === '2048' ? '🔢 2048' : '🃏 Memory'}
                </button>
              `).join('')}
            </div>
            <div class="hero-cabinet">
              <iframe id="hero-cabinet-frame" src="${activeSpotlight.standalone}?embed=1" title="${escapeHtml(activeSpotlight.title)} preview" tabindex="-1"></iframe>
              <button type="button" class="cabinet-overlay-btn" id="hero-fullscreen-btn" title="Fullscreen Play">Fullscreen ⛶</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Dock -->
      <section class="section" style="margin-top:2rem;">
        <div class="category-dock">
          <a href="/explore" data-nav class="cat-pill active"><span class="cat-icon">🎮</span> All Categories (${all.length})</a>
          ${populatedGenres.map((g) => {
            const icon = g.slug === 'arcade' ? '🕹️' : g.slug === 'puzzle' ? '🧩' : g.slug === 'quick-play' ? '⚡' : g.slug === 'board-card' ? '🃏' : '🪐';
            return `<a href="/genre/${g.slug}" data-nav class="cat-pill"><span class="cat-icon">${icon}</span> ${escapeHtml(g.label)} (${genreGameCount(g.slug)})</a>`;
          }).join('')}
        </div>
      </section>

      <!-- Featured Picks -->
      ${featured.length ? `
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">Curated Showcase</div>
            <h2>Featured Recommendations</h2>
            <p>Hand-tuned games with particle effects, reactive physics, and instant action.</p>
          </div>
        </div>
        <div class="featured-grid">${featured.map((g) => gameCard(g, 'TOP PICK')).join('')}</div>
      </section>
      ` : ''}

      <!-- Complete Catalogue Grid -->
      <section class="section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">The Arena</div>
            <h2>Every Game Ready to Play</h2>
            <p>Runs 100% client-side. Local score tracking active.</p>
          </div>
          <a href="/explore" data-nav class="btn btn-ghost btn-sm">Filter & Search →</a>
        </div>
        <div class="game-grid">${all.map((g) => gameCard(g, g.featured ? 'FEATURED' : '')).join('')}</div>
      </section>
    </main>
  `;
}

function setupHeroArcade() {
  const tabs = document.querySelectorAll('#hero-switcher .hero-tab');
  const frame = document.getElementById('hero-cabinet-frame');
  const playBtn = document.getElementById('hero-play-btn');
  const fsBtn = document.getElementById('hero-fullscreen-btn');
  if (!tabs.length || !frame) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      playUiSound('switch');
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const src = tab.dataset.heroSrc;
      const title = tab.dataset.heroTitle;
      const route = tab.dataset.heroRoute;
      frame.src = src;
      frame.title = `${title} preview`;
      if (playBtn) {
        playBtn.textContent = `Play ${title} Now ▶`;
        playBtn.href = route;
      }
    });
  });

  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      playUiSound('click');
      if (frame.requestFullscreen) frame.requestFullscreen();
      else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
    });
  }
}

function renderExplorePage() {
  const all = publishedGames();
  const populatedGenres = genres.filter((g) => genreGameCount(g.slug) > 0);

  return `
    <main class="page-shell explore-page">
      <div class="section-header">
        <div class="copy">
          <div class="eyebrow">DevKitra Games Vault</div>
          <h1>Explore The Catalogue</h1>
          <p>Search by title, genre, tags, or controls. Real-time filtering enabled.</p>
        </div>
      </div>
      <div class="search-sort">
        <div class="search-shell explore-search">
          <input id="explore-search" type="search" placeholder="Type title, genre, or tag (e.g. reflex, retro, arcade)…" aria-label="Search games" />
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
        <p>Try searching for arcade, reflex, puzzle, or snake.</p>
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

  search.addEventListener('input', (event) => {
    q = event.target.value.trim().toLowerCase();
    apply();
  });
  sort.addEventListener('change', () => {
    playUiSound('switch');
    apply();
  });
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
      </div>
      <p class="directory-count">${list.length} game${list.length === 1 ? '' : 's'} in this category</p>
      ${list.length
        ? `<div class="game-grid">${list.map((game) => gameCard(game)).join('')}</div>`
        : `<div class="empty-state"><h2>No ${escapeHtml(g.label)} games yet.</h2><p>Check back soon — new games added regularly.</p></div>`
      }
    </main>
  `;
}

function renderGamePage(slug) {
  const game = gameByRoute(`/game/${slug}`);
  if (!game) return renderNotFoundPage();

  const related = publishedGames()
    .filter((g) => g.id !== game.id && g.genres.some((ge) => game.genres.includes(ge)))
    .slice(0, 4);

  const pauseMarkup = game.pause
    ? `<button type="button" class="btn btn-sm btn-ghost" data-action="pause" aria-pressed="false">Pause [P]</button>`
    : '';

  const genreLabels = game.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ');

  return `
    <main class="page-shell game-page">
      <header class="game-header">
        <div class="game-identity">
          ${game.thumbnail ? `<img class="game-thumb" src="${game.thumbnail}" alt="${escapeHtml(game.title)}" />` : ''}
          <div class="copy">
            <span class="game-eyebrow">${genreLabels}</span>
            <h1>${escapeHtml(game.title)}</h1>
            <p class="game-lede">${escapeHtml(game.description)}</p>
          </div>
        </div>
        <div class="game-actions">
          ${pauseMarkup}
          <button type="button" class="btn btn-primary btn-sm" data-action="restart">Restart [R]</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="fullscreen" title="Fullscreen [F]">Fullscreen ⛶</button>
          <a href="/explore" data-nav class="btn btn-ghost btn-sm">All Games</a>
        </div>
      </header>
      <div class="game-body">
        <div class="game-frame-wrap" id="game-container" role="region" aria-label="${escapeHtml(game.title)} game">
          <iframe class="game-frame" id="active-game-frame" src="${game.standalone}${game.pause ? '?embed=1' : ''}" title="${escapeHtml(game.title)}" allowfullscreen></iframe>
        </div>
        <aside class="game-sidebar">
          <section class="game-section">
            <h2>Controls & Instructions</h2>
            <p>${escapeHtml(game.description)}</p>
            <div class="controls-list">
              ${game.inputs.map((input) => `<span class="kbd">${escapeHtml(input)}</span>`).join('')}
            </div>
            <p class="controls-hint">${escapeHtml(game.controls)}</p>
            ${game.save ? '<p class="controls-hint"><span style="color:var(--dk-success);font-weight:800;">●</span> Highscores saved locally in your browser.</p>' : ''}
          </section>
          ${related.length ? `
          <section class="game-section">
            <h2>Similar Titles</h2>
            <div class="related-grid">${related.map((r) => `
              <a href="${r.route}" data-nav class="related-card">
                ${r.thumbnail ? `<img class="related-card-thumb" src="${r.thumbnail}" alt="" loading="lazy" />` : ''}
                <span class="related-card-title">${escapeHtml(r.title)}</span>
              </a>
            `).join('')}</div>
          </section>
          ` : ''}
        </aside>
      </div>
    </main>
  `;
}

function setupGamePage(slug) {
  const game = gameByRoute(`/game/${slug}`);
  if (!game) return;

  const wrap = document.getElementById('game-container');
  const frame = document.getElementById('active-game-frame');
  const restart = document.querySelector('[data-action="restart"]');
  const pauseBtn = document.querySelector('[data-action="pause"]');
  const fsBtn = document.querySelector('[data-action="fullscreen"]');
  const origin = window.location.origin;

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
        pauseBtn.textContent = 'Pause [P]';
        pauseBtn.setAttribute('aria-pressed', 'false');
        pauseBtn.disabled = false;
      }
      postToGame({ type: 'dk:restart' });
      frame.focus();
    });
  }

  if (pauseBtn && game.pause) {
    pauseBtn.addEventListener('click', () => {
      playUiSound('click');
      paused = !paused;
      pauseBtn.textContent = paused ? 'Resume [P]' : 'Pause [P]';
      pauseBtn.setAttribute('aria-pressed', String(paused));
      postToGame(paused ? { type: 'dk:pause' } : { type: 'dk:resume' });
      frame.focus();
    });
  }

  if (fsBtn && wrap) {
    fsBtn.addEventListener('click', () => {
      playUiSound('click');
      if (!document.fullscreenElement) {
        if (wrap.requestFullscreen) wrap.requestFullscreen();
        else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
      frame.focus();
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
    }
  };

  window.addEventListener('keydown', onKeydown);
  pageCleanups.push(() => window.removeEventListener('keydown', onKeydown));
}

window.addEventListener('message', (event) => {
  const origin = siteUrl() || window.location.origin;
  if (event.origin !== origin) return;
  const { type, score } = event.data || {};
  if (type === 'dk:gameover' && score !== undefined && document.querySelector('.game-frame')) {
    showToast(`Game Over! Score: ${score}`, 'error');
  }
});

function renderAboutPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">Architecture</div>
        <h1>Instant Games, Client-Side Runtime</h1>
        <p>DevKitra Gaming is a lightweight, zero-download gaming destination. Every title is compiled to run locally in browser memory with full hardware acceleration.</p>
        <p>Games operate as isolated canvas sandbox modules, communicating via standardized postMessage protocols.</p>
        <h2>Your Privacy is Absolute</h2>
        <ul>
          <li>All gameplay loops, high scores, and settings reside in your device's local storage.</li>
          <li>Zero tracking scripts, zero third-party advertising cookies, and zero user account requirements.</li>
          <li>Instant performance on desktop, Chromebooks, tablets, and smartphones.</li>
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
          <li><strong>No Login Wall:</strong> No email, credentials, or personal profiles collected.</li>
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
        <p>Have an original browser game suggestion, performance feedback, or bug report? Reach out directly:</p>
        <a href="mailto:tejaskrishna.as@gmail.com" style="display:inline-block;margin-top:0.75rem;font-size:1.1rem;">tejaskrishna.as@gmail.com</a>
        <p style="font-size:0.8rem;color:var(--dk-quiet);margin-top:0.5rem;">Please include browser specifications and reproduction steps for bug reports.</p>
      </div>
    </main>
  `;
}

function renderNotFoundPage() {
  return `
    <main class="page-shell">
      <section class="not-found">
        <div class="eyebrow">404</div>
        <h1>Out of Bounds</h1>
        <p>That level does not exist in the DevKitra rotation.</p>
        <a href="/explore" data-nav class="btn btn-primary">Return to Games Vault ▶</a>
      </section>
    </main>
  `;
}

/* ------------------------------------------------------------------ */
/* Global search                                                      */
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
    list.innerHTML = matches.slice(0, 6).map((g) =>
      `<button type="button" role="option" class="search-item" data-search-link="${g.route}">${escapeHtml(g.title)}<span>${g.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ') || 'Game'}</span></button>`
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
    showToast(enabled ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇');
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

function setupCardHoverSounds() {
  document.querySelectorAll('.game-card, .btn, .cat-pill').forEach((el) => {
    el.addEventListener('mouseenter', () => playUiSound('hover'), { passive: true });
  });
}

function renderCurrentPage() {
  /* Clean up previous page event listeners */
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

  /* Scroll to top on navigation */
  window.scrollTo(0, 0);

  setupGlobalSearch();
  setupThemeToggle();
  setupSoundToggle();
  setupNavigationToggle();
  setupSearchToggle();
  setupCardHoverSounds();

  if (route.page === 'home') setupHeroArcade();
  if (route.page === 'explore') setupExplore();
  if (route.page === 'game') setupGamePage(route.slug);
}

window.addEventListener('popstate', renderCurrentPage);
setupRouteHandling();
renderCurrentPage();
