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
    '/': { title: `${SITE_NAME} — Instant browser games`, description: 'Play instant arcade, puzzle, and reflex games in your browser. No downloads, accounts, or installations required.' },
    '/explore': { title: `Explore games | ${SITE_NAME}`, description: 'Browse the DevKitra Gaming library. Search, filter by genre, and sort the growing collection of instant-play browser games.' },
    '/about': { title: `About | ${SITE_NAME}`, description: 'DevKitra Gaming is a free, browser-based platform for original instant-play games.' },
    '/privacy': { title: `Privacy | ${SITE_NAME}`, description: 'DevKitra Gaming runs games locally in your browser. No accounts, no personal data collection.' },
    '/contact': { title: `Contact | ${SITE_NAME}`, description: 'Get in touch with DevKitra Gaming for questions, bug reports, and game suggestions.' },
  };

  let page;
  if (route.page === 'game' && gameByRoute(route.path)) {
    const g = gameByRoute(route.path);
    page = { title: `${g.title} | ${SITE_NAME}`, description: g.description };
  } else if (route.page === 'genre' && genre(route.slug)) {
    const g = genre(route.slug);
    page = { title: `${g.label} games | ${SITE_NAME}`, description: `Play ${g.label.toLowerCase()} browser games on DevKitra Gaming. ${g.description}` };
  } else if (pages[route.path]) {
    page = pages[route.path];
  } else {
    page = { title: `Page not found | ${SITE_NAME}`, description: 'That page does not exist.' };
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
/* Shared components                                                  */
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
          <div class="brand-sub" style="margin-top:0.15rem;">Instant-play browser games</div>
        </div>
        <div class="footer-links">
          <a href="/explore" data-nav>Explore</a>
          <a href="/about" data-nav>About</a>
          <a href="/contact" data-nav>Contact</a>
          <a href="/privacy" data-nav>Privacy</a>
        </div>
      </div>
      <div class="footer-copy">© ${new Date().getFullYear()} DevKitra Gaming. All games run locally in your browser — no data leaves your device.</div>
    </footer>
    </div></div>
  `;
}

/* ------------------------------------------------------------------ */
/* Game card                                                          */
/* ------------------------------------------------------------------ */

function gameCard(game, featured = false) {
  const cls = `game-card${featured ? ' featured' : ''}`;
  const genreLabels = game.genres.map((g) => genre(g)?.label).filter(Boolean).join(' · ') || 'Game';
  const thumb = game.thumbnail
    ? `<img src="${game.thumbnail}" alt="" loading="lazy" />`
    : `<div style="width:100%;height:100%;display:grid;place-items:center;color:var(--dk-quiet);font-size:1.5rem;font-weight:900;">${escapeHtml(game.title[0])}</div>`;

  return `
    <a href="${game.route}" data-nav class="${cls}">
      <div class="game-card-thumb">
        ${thumb}
        <span class="game-card-play" aria-hidden="true"></span>
      </div>
      <div class="game-card-body">
        <span class="game-card-genre">${genreLabels}</span>
        <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
        <p class="game-card-desc">${escapeHtml(game.description)}</p>
      </div>
      <div class="game-card-foot">
        <span>${game.inputs.join(' · ')}</span>
        <span class="game-card-cta">Play →</span>
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
  const heroGame = featured[0];
  const populatedGenres = genres.filter((g) => genreGameCount(g.slug) > 0);

  return `
    <main class="page-shell home-page">
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-copy">
            <div class="eyebrow">${SITE_NAME}</div>
            <h1>Play instantly.<br /><span>No downloads. No accounts.</span></h1>
            <p class="hero-description">A growing collection of original browser games built for quick sessions. Pick a game and start playing — everything runs right here.</p>
            <div class="hero-actions">
              ${heroGame ? `<a href="${heroGame.route}" data-nav class="btn btn-primary">Play ${escapeHtml(heroGame.title)}</a>` : ''}
              <a href="/explore" data-nav class="btn btn-ghost">Explore games</a>
            </div>
            <div class="hero-meta">
              <span><span class="dot"></span>${publishedGames().length} games</span>
              <span><span class="dot"></span>${populatedGenres.length} genres</span>
              <span><span class="dot"></span>Runs in your browser</span>
            </div>
          </div>
          <div class="hero-game" aria-label="${escapeHtml(heroGame ? heroGame.title : 'Featured game')} preview">
            <iframe class="hero-frame" src="${heroGame ? heroGame.standalone + '?embed=1' : '#'}" loading="lazy" title="${escapeHtml(heroGame ? heroGame.title : 'Featured game')}" tabindex="-1"></iframe>
          </div>
        </div>
      </section>

      ${featured.length ? `
      <section class="section">
        <div class="section-header">
          <div class="eyebrow">Featured</div>
          <h2>Games we recommend</h2>
          <p>Tried and tested — start with these.</p>
        </div>
        <div class="featured-grid">${featured.map((g) => gameCard(g, true)).join('')}</div>
      </section>
      ` : ''}

      <section class="section">
        <div class="section-header">
          <div class="eyebrow">All games</div>
          <h2>The full collection</h2>
          <p>Every game in the library, newest first.</p>
        </div>
        <div class="game-grid">${all.map((g) => gameCard(g)).join('')}</div>
      </section>

      ${populatedGenres.length ? `
      <section class="section">
        <div class="section-header">
          <div class="eyebrow">Categories</div>
          <h2>Browse by genre</h2>
        </div>
        <div class="chip-list">
          ${populatedGenres.map((g) => `<a href="/genre/${g.slug}" data-nav class="genre-chip">${escapeHtml(g.label)}<span style="margin-left:0.3rem;opacity:0.6;font-size:0.7rem;">${genreGameCount(g.slug)}</span></a>`).join('')}
        </div>
      </section>
      ` : ''}
    </main>
  `;
}

function renderExplorePage() {
  const all = publishedGames();
  const populatedGenres = genres.filter((g) => genreGameCount(g.slug) > 0);

  return `
    <main class="page-shell explore-page">
      <div class="section-header">
        <div class="eyebrow">Game library</div>
        <h1>Explore games</h1>
        <p>Search, filter, and sort the full collection.</p>
      </div>
      <div class="search-sort">
        <div class="search-shell explore-search">
          <input id="explore-search" type="search" placeholder="Search games…" aria-label="Search games" />
          ${searchSvg()}
        </div>
        <div class="select-shell">
          <select id="explore-sort" aria-label="Sort games">
            <option value="added">Newest first</option>
            <option value="title">A–Z</option>
          </select>
        </div>
      </div>
      <div id="explore-genre-filters" class="chip-list explore-filters">
        <button type="button" class="genre-chip active" data-genre="all" aria-pressed="true">All genres</button>
        ${populatedGenres.map((g) => `<button type="button" class="genre-chip" data-genre="${g.slug}" aria-pressed="false">${escapeHtml(g.label)}</button>`).join('')}
      </div>
      <p id="explore-count" class="directory-count">${all.length} games</p>
      <div id="explore-results" class="game-grid">${all.map((g) => gameCard(g)).join('')}</div>
      <div id="explore-empty" class="empty-state hidden">
        <h2>No games match your search.</h2>
        <p>Try a different keyword or genre filter.</p>
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
    count.textContent = `${sorted.length} ${sorted.length === 1 ? 'game' : 'games'}`;
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
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
  sort.addEventListener('change', apply);
}

function renderGenrePage(slug) {
  const g = genre(slug);
  if (!g) return renderNotFoundPage();
  const list = gamesInGenre(slug);

  return `
    <main class="page-shell genre-page">
      <div class="section-header">
        <div class="eyebrow">${escapeHtml(g.label)}</div>
        <h1>${escapeHtml(g.label)} games</h1>
        <p>${escapeHtml(g.description)}</p>
      </div>
      <p class="directory-count">${list.length} game${list.length === 1 ? '' : 's'}</p>
      ${list.length
        ? `<div class="game-grid">${list.map((game) => gameCard(game)).join('')}</div>`
        : `<div class="empty-state"><h2>No ${escapeHtml(g.label)} games yet.</h2><p>Check back soon — new games are added regularly.</p></div>`
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
    ? `<button type="button" class="btn btn-sm btn-ghost" data-action="pause" aria-pressed="false">Pause</button>`
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
          <button type="button" class="btn btn-primary btn-sm" data-action="restart">Restart</button>
          <a href="/explore" data-nav class="btn btn-ghost btn-sm">All games</a>
        </div>
      </header>
      <div class="game-body">
        <div class="game-frame-wrap" role="region" aria-label="${escapeHtml(game.title)} game">
          <iframe class="game-frame" src="${game.standalone}${game.pause ? '?embed=1' : ''}" title="${escapeHtml(game.title)}"></iframe>
        </div>
        <aside class="game-sidebar">
          <section class="game-section">
            <h2>How to play</h2>
            <p>${escapeHtml(game.description)}</p>
            <h3 style="margin:0.65rem 0 0.2rem;font-size:0.75rem;font-weight:700;color:var(--dk-quiet);text-transform:uppercase;letter-spacing:0.1em;">Controls</h3>
            <div class="controls-list">
              ${game.inputs.map((input) => `<span class="kbd">${escapeHtml(input)}</span>`).join('')}
            </div>
            <p class="controls-hint">${escapeHtml(game.controls)}</p>
            ${game.save ? '<p class="controls-hint"><span style="color:var(--dk-success);font-weight:700;">●</span> Progress saved locally on your device.</p>' : ''}
          </section>
          ${related.length ? `
          <section class="game-section">
            <h2>Related games</h2>
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

  const frame = document.querySelector('.game-frame');
  const restart = document.querySelector('[data-action="restart"]');
  const pauseBtn = document.querySelector('[data-action="pause"]');
  const origin = window.location.origin;

  function postToGame(payload) {
    if (frame && frame.contentWindow) {
      try { frame.contentWindow.postMessage(payload, origin); } catch (_) {}
    }
  }

  let paused = false;

  if (restart) {
    restart.addEventListener('click', () => {
      paused = false;
      if (pauseBtn) {
        pauseBtn.textContent = 'Pause';
        pauseBtn.setAttribute('aria-pressed', 'false');
        pauseBtn.disabled = false;
      }
      postToGame({ type: 'dk:restart' });
    });
  }

  if (pauseBtn && game.pause) {
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.textContent = paused ? 'Resume' : 'Pause';
      pauseBtn.setAttribute('aria-pressed', String(paused));
      postToGame(paused ? { type: 'dk:pause' } : { type: 'dk:resume' });
    });
  }

  /* Prevent arrow/space keys from scrolling the page while game is focused */
  const gameKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
  function preventGameKeyScroll(event) {
    if (gameKeys.has(event.code) && document.querySelector('.game-page')) {
      event.preventDefault();
    }
  }
  window.addEventListener('keydown', preventGameKeyScroll);
  pageCleanups.push(() => window.removeEventListener('keydown', preventGameKeyScroll));
}

window.addEventListener('message', (event) => {
  const origin = siteUrl() || window.location.origin;
  if (event.origin !== origin) return;
  const { type, score } = event.data || {};
  if (type === 'dk:gameover' && score !== undefined && document.querySelector('.game-frame')) {
    showToast(`Game over — score: ${score}`, 'error');
  }
});

function renderAboutPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">About</div>
        <h1>Instant games, locally run</h1>
        <p>DevKitra Gaming is a free platform for original browser games. Every game runs entirely in your browser — nothing is downloaded, nothing is uploaded, and no account is required.</p>
        <p>Games are independent, self-contained modules. New games can be added without rebuilding the site, and each game is isolated so it cannot affect the rest of the platform.</p>
        <h2>Your data stays on your device</h2>
        <ul>
          <li>High scores and settings are stored in browser local storage only.</li>
          <li>No personal data is collected by the games themselves.</li>
          <li>There are no accounts, no logins, and no servers processing your data.</li>
        </ul>
      </div>
    </main>
  `;
}

function renderPrivacyPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">Privacy</div>
        <h1>How DevKitra Gaming handles your data</h1>
        <ul>
          <li><strong>Local processing:</strong> All game logic runs inside your browser. Nothing is sent to a server.</li>
          <li><strong>No account needed:</strong> There is no sign-up flow or user profile.</li>
          <li><strong>Local storage only:</strong> Game high scores and settings may be saved to localStorage on your device. You can clear them anytime through your browser settings.</li>
          <li><strong>No secret transmission:</strong> No passwords, keys, or tokens are used or collected.</li>
          <li><strong>Analytics and ads:</strong> Hosting infrastructure may receive standard technical metadata. No intrusive advertising is served.</li>
        </ul>
        <p style="font-size:0.82rem;color:var(--dk-quiet);margin-top:1rem;">Scores are local to your device and are not globally verified leaderboards.</p>
      </div>
    </main>
  `;
}

function renderContactPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">Contact</div>
        <h1>Get in touch</h1>
        <p>Found a bug, have a game idea, or want to say hello? Email is the best way to reach us. Please include the game name and the steps to reproduce a problem if relevant.</p>
        <a href="mailto:tejaskrishna.as@gmail.com" style="display:inline-block;margin-top:0.75rem;">tejaskrishna.as@gmail.com</a>
        <p style="font-size:0.78rem;color:var(--dk-quiet);margin-top:0.4rem;">Please do not email passwords, private keys, access tokens, or other sensitive information.</p>
      </div>
    </main>
  `;
}

function renderNotFoundPage() {
  return `
    <main class="page-shell">
      <section class="not-found">
        <div class="eyebrow">404</div>
        <h1>Page not found</h1>
        <p>That address may have changed, or the page may not exist.</p>
        <a href="/explore" data-nav class="btn btn-primary">Browse games</a>
      </section>
    </main>
  `;
}

/* ------------------------------------------------------------------ */
/* Global search (header)                                             */
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
      list.innerHTML = '<div class="search-empty">No games match your search.</div>';
      return;
    }
    list.classList.remove('hidden');
    list.innerHTML = matches.slice(0, 6).map((g) =>
      `<button type="button" role="option" class="search-item" data-search-link="${g.route}">${escapeHtml(g.title)}<span>${g.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ') || 'Game'}</span></button>`
    ).join('');
    list.querySelectorAll('[data-search-link]').forEach((button) => {
      button.addEventListener('click', () => {
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
/* Router                                                             */
/* ------------------------------------------------------------------ */

let navigationController;

function navigateTo(path) {
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

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')), { signal });
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

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const current = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    toggle.innerHTML = themeIcon(next);
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
  setupNavigationToggle();
  setupSearchToggle();

  if (route.page === 'explore') setupExplore();
  if (route.page === 'game') setupGamePage(route.slug);
}

window.addEventListener('popstate', renderCurrentPage);
setupRouteHandling();
renderCurrentPage();
