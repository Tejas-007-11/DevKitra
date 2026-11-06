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
const SITE_EMAIL = 'devkitragaming@gmail.com';

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

const GAME_SCORE_KEYS = {
  'neon-bastion': 'dk:neon-bastion-best',
  'road-hopper': 'dk:hopper-best',
  'loopbreak': 'dk:loopbreak-best-standard',
  'beltbound': 'dk:beltbound-unlocked',
  'flipshift': 'dk:flipshift-best-endless',
  'tetris': 'dk:tetris-best',
  'sky-jump': 'dk:skyjump-best',
  'snake': 'dk:snake-best',
  '2048': 'dk:2048-best',
  'breakout': 'dk:breakout-best',
  'tower-stack': 'dk:stack-best',
  'cyber-flap': 'dk:flap-best',
  'memory-match': 'dk:memory-best',
  'reaction-test': 'dk:reaction-best',
  'neon-pong': 'dk:neon-pong-best',
};

function getGameBestScore(gameId) {
  try {
    const key = GAME_SCORE_KEYS[gameId];
    if (!key) return null;
    const val = localStorage.getItem(key);
    if (!val) return null;
    const num = parseInt(val, 10);
    return isNaN(num) || num <= 0 ? null : num;
  } catch (_) {
    return null;
  }
}

function formatGameScore(gameId, score) {
  if (score === null || score === undefined || isNaN(score) || score <= 0) return null;
  if (gameId === 'reaction-test') return `${score} ms`;
  if (gameId === 'memory-match') return `${score} moves`;
  if (gameId === 'beltbound') return `Level ${score}`;
  return `${score.toLocaleString()} pts`;
}

function isScoreBetter(gameId, newScore, prevBest) {
  if (prevBest === null || prevBest === undefined || prevBest <= 0) return true;
  if (gameId === 'reaction-test' || gameId === 'memory-match') {
    return newScore < prevBest;
  }
  return newScore > prevBest;
}

function updateGameBestScore(gameId, newScore) {
  try {
    const key = GAME_SCORE_KEYS[gameId];
    if (!key || newScore <= 0 || isNaN(newScore)) return false;
    const curVal = localStorage.getItem(key);
    const cur = curVal ? parseInt(curVal, 10) : null;
    if (isScoreBetter(gameId, newScore, cur)) {
      localStorage.setItem(key, String(newScore));
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Daily Challenge System (Deterministic, Date-Based, Pure Frontend)  */
/* ------------------------------------------------------------------ */

function getDailyChallengeDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateDisplay(dateStr) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (_) {
    return dateStr;
  }
}

function getDailyChallenge() {
  const dateStr = getDailyChallengeDate();
  const all = publishedGames();
  if (!all.length) return null;

  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const game = all[hash % all.length];

  const goals = {
    'neon-bastion': { target: 1200, label: 'Score 1,200+ points defending your bastion' },
    'road-hopper': { target: 30, label: 'Cross 30+ roads and rivers safely' },
    'loopbreak': { target: 600, label: 'Connect loops to score 600+ points' },
    'beltbound': { target: 4, label: 'Complete puzzle stages through Level 4' },
    'flipshift': { target: 250, label: 'Dodge obstacles for 250+ meters' },
    'tetris': { target: 1000, label: 'Clear lines to reach 1,000+ points' },
    'sky-jump': { target: 1500, label: 'Bounce to 1,500+ meters altitude' },
    'snake': { target: 120, label: 'Guide the snake to score 120+ points' },
    '2048': { target: 1024, label: 'Slide and merge tiles to reach 1,024+ score' },
    'breakout': { target: 400, label: 'Break bricks to score 400+ points' },
    'tower-stack': { target: 18, label: 'Stack 18+ blocks with steady timing' },
    'neon-pong': { target: 5, label: 'Score 5 points against the paddle AI' },
    'cyber-flap': { target: 12, label: 'Fly cleanly through 12+ energy gates' },
    'memory-match': { target: 26, label: 'Clear the board in 26 moves or fewer', lowerIsBetter: true },
    'reaction-test': { target: 320, label: 'Clock a reaction time under 320 ms', lowerIsBetter: true },
  };

  const goal = goals[game.id] || { target: 500, label: `Score 500+ points in ${game.title}` };
  const completedKey = `dk:daily:${dateStr}:${game.id}`;
  let isCompleted = false;
  try {
    isCompleted = localStorage.getItem(completedKey) === 'true';
  } catch (_) {}

  return {
    date: dateStr,
    game,
    goal,
    completedKey,
    isCompleted,
  };
}

/* ------------------------------------------------------------------ */
/* Web Share API & Clipboard Sharing Helper                           */
/* ------------------------------------------------------------------ */

function shareGameScore(gameId, currentScore = null) {
  playUiSound('click');
  const game = gameByRoute(`/game/${gameId}`);
  if (!game) return;
  const best = currentScore || getGameBestScore(gameId);
  const origin = window.location.origin;
  const shareUrl = `${origin}${game.route}`;

  const scoreStr = best ? formatGameScore(gameId, best) : null;
  const scoreText = scoreStr ? `I scored ${scoreStr}` : `Can you beat my score`;
  const shareData = {
    title: `${game.title} — DevKitra Games`,
    text: `🎮 ${scoreText} in ${game.title} on DevKitra! Play free in your browser with zero installs:`,
    url: shareUrl,
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    copyTextToClipboard(`${shareData.text} ${shareData.url}`, () => {
      showToast('📋 Game link & score copied to clipboard!', 'success');
    });
  }
}

function getFavorites() {
  try {
    const favs = JSON.parse(localStorage.getItem('dk:favorites') || '[]');
    return Array.isArray(favs) ? favs : [];
  } catch (_) {
    return [];
  }
}

function isGameFavorited(gameId) {
  return getFavorites().includes(gameId);
}

function toggleFavorite(gameId) {
  const favs = getFavorites();
  const next = favs.includes(gameId) ? favs.filter((id) => id !== gameId) : [...favs, gameId];
  try { localStorage.setItem('dk:favorites', JSON.stringify(next)); } catch (_) {}
  return next.includes(gameId);
}

function getRecentGames() {
  try {
    const recents = JSON.parse(localStorage.getItem('dk:recent-games') || '[]');
    return Array.isArray(recents) ? recents : [];
  } catch (_) {
    return [];
  }
}

function recordRecentGame(gameId) {
  const recents = getRecentGames().filter((id) => id !== gameId);
  const updated = [gameId, ...recents].slice(0, 6);
  try { localStorage.setItem('dk:recent-games', JSON.stringify(updated)); } catch (_) {}
}

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
  if (path === '/terms') return { page: 'terms' };
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
    if (slug === 'polarity' || slug === 'velocity-3d') return { page: 'redirect', target: '/game/neon-bastion' };
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
    '/': { title: `${SITE_NAME} — Free Online Games | Play Instant Browser Games No Download`, description: 'Play 15 free instant browser games online on DevKitra. Enjoy original arcade, puzzle, retro, action, and reflex games with zero downloads, no accounts, and no paywalls.' },
    '/explore': { title: `All Free Online Games | Play in Browser | ${SITE_NAME}`, description: 'Explore the complete library of free online browser games on DevKitra. Play instant arcade, puzzle, runner, and reflex titles on desktop and mobile.' },
    '/about': { title: `About DevKitra — Free Instant Online Games & Arcade Platform`, description: 'Discover DevKitra: The free instant browser gaming platform. Play original arcade, puzzle, reflex, and retro games with zero downloads, no accounts, and no paywalls.' },
    '/privacy': { title: `Privacy Policy | ${SITE_NAME}`, description: 'Learn how DevKitra Gaming respects player privacy, data safety, and third-party advertising transparency.' },
    '/terms': { title: `Terms of Service | ${SITE_NAME}`, description: 'Terms of service and usage guidelines for playing free browser games on DevKitra.' },
    '/contact': { title: `Contact & Feedback | ${SITE_NAME}`, description: 'Send feedback, game suggestions, and bug reports to DevKitra Gaming.' },
  };

  let page;
  if (route.page === 'game' && gameByRoute(route.path)) {
    const g = gameByRoute(route.path);
    const primaryGenre = genre(g.genres[0])?.label || 'Arcade';
    page = {
      title: `Play ${g.title} Free Online — ${primaryGenre} Game | ${SITE_NAME}`,
      description: `Play ${g.title} online for free in your browser. ${g.description} ${g.objective ? g.objective + ' ' : ''}No downloads or accounts needed.`,
    };
  } else if (route.page === 'genre' && genre(route.slug)) {
    const g = genre(route.slug);
    page = {
      title: `Free ${g.label} Games Online | Play Instant in Browser | ${SITE_NAME}`,
      description: `Play top free ${g.label.toLowerCase()} games online in your browser on DevKitra. ${g.description} Instant play, no install required.`,
    };
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

  const base = siteUrl() || window.location.origin;
  let imageUrl = `${base}/favicon.png`;
  if (route.page === 'game' && gameByRoute(route.path)) {
    const g = gameByRoute(route.path);
    if (g.thumbnail) imageUrl = new URL(g.thumbnail, base).href;
  }

  let ogImg = document.querySelector('meta[property="og:image"]');
  if (!ogImg) {
    ogImg = document.createElement('meta');
    ogImg.setAttribute('property', 'og:image');
    document.head.append(ogImg);
  }
  ogImg.content = imageUrl;

  let twImg = document.querySelector('meta[name="twitter:image"]');
  if (!twImg) {
    twImg = document.createElement('meta');
    twImg.setAttribute('name', 'twitter:image');
    document.head.append(twImg);
  }
  twImg.content = imageUrl;

  let twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.content = page.title;
  let twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.content = page.description;

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!base) {
    canonical?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
    return;
  }
  try {
    const parsed = new URL(base);
    if (parsed.protocol !== 'https:' && window.location.protocol === 'https:') throw new Error('VITE_SITE_URL must use HTTPS.');
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

    // Structured Data (JSON-LD)
    let schemaScript = document.getElementById('dk-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'dk-schema';
      document.head.append(schemaScript);
    }

    if (route.page === 'game' && gameByRoute(route.path)) {
      const g = gameByRoute(route.path);
      const gameUrl = canonical.href;
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': ['VideoGame', 'WebApplication'],
            '@id': `${gameUrl}#game`,
            'name': g.title,
            'description': `${g.description} ${g.objective || ''}`.trim(),
            'url': gameUrl,
            'image': imageUrl,
            'inLanguage': 'en',
            'operatingSystem': 'Any',
            'applicationCategory': 'Game',
            'genre': g.genres.map((s) => genre(s)?.label).filter(Boolean),
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock',
            },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${gameUrl}#breadcrumbs`,
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${parsed.origin}/` },
              { '@type': 'ListItem', 'position': 2, 'name': genre(g.genres[0])?.label || 'Games', 'item': `${parsed.origin}/genre/${g.genres[0]}` },
              { '@type': 'ListItem', 'position': 3, 'name': g.title, 'item': gameUrl },
            ],
          },
        ],
      });
    } else if (route.page === 'home') {
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${parsed.origin}/#website`,
            'name': SITE_NAME,
            'url': `${parsed.origin}/`,
            'description': pages['/'].description,
            'potentialAction': {
              '@type': 'SearchAction',
              'target': `${parsed.origin}/explore?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
            'publisher': {
              '@id': `${parsed.origin}/#organization`,
            },
          },
          {
            '@type': 'Organization',
            '@id': `${parsed.origin}/#organization`,
            'name': SITE_NAME,
            'url': `${parsed.origin}/`,
            'logo': `${parsed.origin}/favicon.png`,
            'description': 'DevKitra is an independent web gaming platform offering free, lightweight, instant browser games.',
            'sameAs': [
              'https://github.com/devkitra'
            ],
          },
        ],
      });
    } else if (route.page === 'genre' && genre(route.slug)) {
      const gen = genre(route.slug);
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${canonical.href}#webpage`,
            'name': page.title,
            'description': page.description,
            'url': canonical.href,
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical.href}#breadcrumbs`,
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${parsed.origin}/` },
              { '@type': 'ListItem', 'position': 2, 'name': `${gen.label} Games`, 'item': canonical.href },
            ],
          },
        ],
      });
    } else {
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${canonical.href}#webpage`,
            'name': page.title,
            'description': page.description,
            'url': canonical.href,
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical.href}#breadcrumbs`,
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${parsed.origin}/` },
              { '@type': 'ListItem', 'position': 2, 'name': page.title.split(' | ')[0], 'item': canonical.href },
            ],
          },
        ],
      });
    }
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
  const currentYear = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-col footer-col-brand">
            <div class="footer-brand">${SITE_NAME}</div>
            <p class="footer-desc">
              DevKitra is an independent browser gaming platform delivering fast, original, 100% free 2D games with zero downloads, no account registrations, and offline score saving.
            </p>
            <div class="footer-contact-badge">
              <span class="footer-contact-label">Official Inquiries:</span>
              <a href="mailto:${SITE_EMAIL}" class="footer-email-link">${SITE_EMAIL}</a>
            </div>
          </div>

          <div class="footer-col">
            <h4>Game Catalogue</h4>
            <ul>
              <li><a href="/explore" data-nav>All 15 Free Games</a></li>
              <li><a href="/genre/arcade" data-nav>Arcade & Survival</a></li>
              <li><a href="/genre/puzzle" data-nav>Brain & Logic Puzzles</a></li>
              <li><a href="/genre/reflex" data-nav>Reflex & Reaction</a></li>
              <li><a href="/genre/classic" data-nav>Retro Classics</a></li>
              <li><a href="/genre/casual" data-nav>Casual & Quick Play</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Platform & Trust</h4>
            <ul>
              <li><a href="/about" data-nav>About DevKitra</a></li>
              <li><a href="/contact" data-nav>Contact & Bug Reports</a></li>
              <li><a href="/about#faq" data-nav>Frequently Asked Questions</a></li>
              <li><a href="/contact" data-nav>Developer Submissions</a></li>
              <li><a href="/explore" data-nav>Daily Challenges</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Legal & Policies</h4>
            <ul>
              <li><a href="/privacy" data-nav>Privacy Policy</a></li>
              <li><a href="/terms" data-nav>Terms of Service</a></li>
              <li><a href="/privacy#advertising" data-nav>Cookie & Ad Choices</a></li>
              <li><a href="/terms#dmca" data-nav>DMCA & Copyright Notice</a></li>
              <li><a href="/privacy#localstorage" data-nav>Data & Local Storage</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-copy">
            © ${currentYear} DevKitra Gaming. All original games run 100% client-side in modern web browsers with zero installation and privacy-focused local storage.
          </div>
          <div class="footer-bottom-links">
            <a href="/privacy" data-nav>Privacy</a>
            <span class="footer-sep">·</span>
            <a href="/terms" data-nav>Terms</a>
            <span class="footer-sep">·</span>
            <a href="/contact" data-nav>Support</a>
          </div>
        </div>
      </div>
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
    ? `<img src="${game.thumbnail}" alt="${escapeHtml(game.title)} cover" loading="lazy" width="400" height="250" decoding="async" />`
    : `<div class="card-fallback">${escapeHtml(game.title[0])}</div>`;
  const bestScore = getGameBestScore(game.id);
  const scoreBadge = bestScore !== null ? `<span class="card-score-badge" title="Your Personal Best Score">🏆 ${escapeHtml(formatGameScore(game.id, bestScore))}</span>` : '';
  const isFav = isGameFavorited(game.id);

  return `
    <div class="game-card" data-game-card="${game.id}">
      <div class="game-card-thumb">
        <a href="${game.route}" data-nav class="thumb-link" aria-label="Play ${escapeHtml(game.title)}">
          ${thumb}
          ${badgeText ? `<div class="game-badge">${escapeHtml(badgeText)}</div>` : ''}
          <div class="game-card-play" aria-hidden="true">
            <span class="play-pill">Play Now ▶</span>
          </div>
        </a>
        <button type="button" class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-id="${game.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFav ? '★' : '☆'}
        </button>
      </div>
      <div class="game-card-body">
        <span class="game-card-genre">${genreLabels}</span>
        <h3 class="game-card-title"><a href="${game.route}" data-nav>${escapeHtml(game.title)}</a></h3>
        <p class="game-card-desc">${escapeHtml(game.description)}</p>
      </div>
      <div class="game-card-foot">
        <span class="card-inputs" title="Supported inputs">${game.inputs.map((inp) => inp === 'keyboard' ? '⌨️ Key' : inp === 'touch' ? '📱 Touch' : '🖱️ Mouse').join(' · ')}</span>
        ${scoreBadge}
        <a href="${game.route}" data-nav class="game-card-cta" aria-label="Play ${escapeHtml(game.title)}">Play ▶</a>
      </div>
    </div>
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
  const recentIds = getRecentGames();
  const recentGames = recentIds.map((id) => all.find((g) => g.id === id)).filter(Boolean);
  const favCount = getFavorites().length;
  const daily = getDailyChallenge();

  const reflexPicks = all.filter((g) => ['neon-bastion', 'road-hopper', 'sky-jump', 'snake', 'breakout'].includes(g.id));
  const puzzlePicks = all.filter((g) => ['tetris', '2048', 'memory-match', 'tower-stack'].includes(g.id));

  return `
    <main class="page-shell home-page">
      <!-- Visible Hero Header: Clear Purpose & Value Proposition -->
      <section class="hero-intro-banner">
        <div class="hero-intro-content">
          <div class="hero-pill-badge">
            <span class="live-dot" aria-hidden="true"></span>
            <span>Free 2D Instant Browser Games</span>
            <span class="badge-separator">·</span>
            <span class="badge-highlight">Zero Installs</span>
          </div>
          <h1 class="hero-main-title">Play Instant Games in Your Browser. <span class="highlight-text">No Installs.</span></h1>
          <p class="hero-main-lead">Jump directly into 15 original arcade, puzzle, retro, and reflex games. 100% free, lightweight, instant loading on mobile and desktop, with high scores saved automatically.</p>
          <div class="hero-highlights-row">
            <a href="#catalogue-section" class="btn btn-primary" id="hero-explore-cta">Browse 15 Games ↓</a>
            <button type="button" class="btn btn-secondary" id="hero-quick-random-btn">${diceSvg()} Surprise Me</button>
            <div class="hero-trust-pills">
              <span class="trust-pill">⚡ Instant Play</span>
              <span class="trust-pill">🎮 15 Free Games</span>
              <span class="trust-pill">🏆 Score Saving</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Clean Spotlight Hero Banner -->
      <section class="hero-spotlight">
        <div class="spotlight-card">
          <div class="spotlight-content">
            <div class="spotlight-badge-row">
              <span class="spotlight-tag">FEATURED GAME</span>
              <span class="spotlight-genre">${spotlightGame.genres.map((g) => genre(g)?.label).filter(Boolean).join(' · ')}</span>
            </div>
            <h2 id="spotlight-title">${escapeHtml(spotlightGame.title)}</h2>
            <p id="spotlight-desc" class="spotlight-desc">${escapeHtml(spotlightGame.description)}</p>
            <div class="spotlight-actions">
              <a href="${spotlightGame.route}" data-nav class="btn btn-primary" id="spotlight-play-btn">Play Now ▶</a>
              <a href="#catalogue-section" class="btn btn-secondary" id="spotlight-browse-btn">Explore All 15 Games</a>
              <button type="button" class="btn btn-secondary" id="hero-random-btn">${diceSvg()} Surprise Me</button>
            </div>
          </div>
          <div class="spotlight-media">
            <img src="${spotlightGame.thumbnail}" alt="${escapeHtml(spotlightGame.title)}" id="spotlight-img" width="480" height="300" decoding="async" fetchpriority="high" />
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

      ${daily ? `
      <!-- Daily Challenge Feature Shelf -->
      <section class="section section-daily" id="daily-challenge-section">
        <div class="daily-challenge-card ${daily.isCompleted ? 'is-complete' : ''}">
          <div class="daily-card-header">
            <div class="daily-card-badge-row">
              <span class="daily-tag">📅 DAILY CHALLENGE</span>
              <span class="daily-date">${formatDateDisplay(daily.date)}</span>
              ${daily.isCompleted ? '<span class="daily-pill-status complete">✓ Completed</span>' : '<span class="daily-pill-status active">Active Mission</span>'}
            </div>
            <span class="daily-reset-clock">Resets daily at midnight</span>
          </div>

          <div class="daily-card-content">
            <div class="daily-thumb-box">
              <a href="${daily.game.route}" data-nav class="daily-thumb-link" aria-label="Play ${escapeHtml(daily.game.title)}">
                <img src="${daily.game.thumbnail}" alt="${escapeHtml(daily.game.title)}" class="daily-thumb-img" width="160" height="100" loading="lazy" decoding="async" />
                <div class="daily-thumb-overlay" aria-hidden="true">
                  <span class="play-pill">Play ▶</span>
                </div>
              </a>
            </div>
            <div class="daily-details">
              <span class="daily-game-genre">${daily.game.genres.map((ge) => genre(ge)?.label).filter(Boolean).join(' · ')}</span>
              <h3 class="daily-title"><a href="${daily.game.route}" data-nav>${escapeHtml(daily.game.title)}</a></h3>
              <div class="daily-goal-box">
                <span class="goal-icon">🎯</span>
                <span class="goal-text"><strong>Mission:</strong> ${escapeHtml(daily.goal.label)}</span>
              </div>
              <p class="daily-desc">${escapeHtml(daily.game.description)}</p>
            </div>
            <div class="daily-cta-wrap">
              <a href="${daily.game.route}" data-nav class="btn btn-primary daily-cta-btn">
                ${daily.isCompleted ? 'Replay Challenge ▶' : 'Accept Challenge ▶'}
              </a>
              ${daily.isCompleted ? `
                <button type="button" class="btn btn-secondary btn-sm" id="btn-share-daily" title="Share your daily challenge victory">
                  Share Victory 🏆
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </section>
      ` : ''}

      ${recentGames.length > 0 ? `
        <!-- Shelf: Continue Playing (Recent Games) -->
        <section class="section section-recents" id="recents-section">
          <div class="section-header">
            <div class="copy">
              <div class="eyebrow">PICK UP WHERE YOU LEFT OFF</div>
              <h2>Continue Playing</h2>
              <p>Jump back into your recently played games with saved scores and progress.</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-recents" title="Clear recently played history">Clear History</button>
          </div>
          <div class="game-grid">${recentGames.map((g) => gameCard(g)).join('')}</div>
        </section>
      ` : `
        <!-- Quick Start Picks for New Visitors -->
        <section class="section section-quickstart">
          <div class="section-header">
            <div class="copy">
              <div class="eyebrow">QUICK START</div>
              <h2>Instant Play Picks</h2>
              <p>Jump straight in — our top original arcade and puzzle games ready to play in 1 click.</p>
            </div>
          </div>
          <div class="game-grid">${all.filter((g) => ['neon-bastion', 'tetris', 'road-hopper', 'snake'].includes(g.id)).map((g) => gameCard(g)).join('')}</div>
        </section>
      `}

      <!-- Policy-Compliant Advertisement Placement Candidate (Non-intrusive Billboard) -->
      <div class="ad-slot-wrapper ad-billboard" aria-label="Advertisement container">
        <span class="ad-label">ADVERTISEMENT</span>
        <div class="ad-slot">
          <span class="ad-slot-placeholder-text">Reserved Billboard Placement · DevKitra Gaming · Non-Intrusive Layout</span>
        </div>
      </div>

      <!-- Interactive Game Discovery & Complete Catalogue -->
      <section class="section section-catalogue" id="catalogue-section">
        <div class="section-header">
          <div class="copy">
            <div class="eyebrow">DISCOVER GAMES</div>
            <h2>All Games (${all.length})</h2>
            <p>Filter by genre, sort by popularity or release date, or search by game name in real time.</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="section-random-btn">${diceSvg()} Random Game</button>
        </div>

        <!-- Interactive Discovery Toolbar -->
        <div class="catalogue-toolbar">
          <div class="search-shell home-search-shell">
            <input id="home-game-search" type="search" placeholder="Search by game name, genre, or tag…" aria-label="Search all games" autocomplete="off" />
            ${searchSvg()}
          </div>
          <div class="select-shell">
            <select id="home-sort" aria-label="Sort games">
              <option value="popular">Most Popular</option>
              <option value="added">Newest Added</option>
              <option value="title">Alphabetical (A–Z)</option>
            </select>
          </div>
        </div>

        <!-- Genre Filter Chips -->
        <div id="home-genre-chips" class="chip-list catalogue-chips">
          <button type="button" class="genre-chip active" data-genre="all" aria-pressed="true">All Games (${all.length})</button>
          ${favCount > 0 ? `<button type="button" class="genre-chip" data-genre="favorites" aria-pressed="false">★ Favorites (${favCount})</button>` : ''}
          ${populatedGenres.map((g) => `<button type="button" class="genre-chip" data-genre="${g.slug}" aria-pressed="false">${escapeHtml(g.label)} (${genreGameCount(g.slug)})</button>`).join('')}
        </div>

        <div class="catalogue-meta-row">
          <span id="home-games-count" class="directory-count">${all.length} games available</span>
        </div>

        <div id="home-games-grid" class="game-grid">${all.map((g) => gameCard(g)).join('')}</div>

        <div id="home-games-empty" class="empty-state hidden">
          <h2>No games found.</h2>
          <p id="home-empty-msg">No games match your query. Try searching for "tetris", "snake", or "neon".</p>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-reset-home-filter" style="margin-top: 0.75rem;">Reset Filters</button>
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
  const quickRandomBtn = document.getElementById('hero-quick-random-btn');
  const spotlightBrowseBtn = document.getElementById('spotlight-browse-btn');

  if (randomHeroBtn) {
    randomHeroBtn.addEventListener('click', () => launchRandomGame());
  }
  if (randomSecBtn) {
    randomSecBtn.addEventListener('click', () => launchRandomGame());
  }
  if (quickRandomBtn) {
    quickRandomBtn.addEventListener('click', () => launchRandomGame());
  }
  if (spotlightBrowseBtn) {
    spotlightBrowseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('catalogue-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        const searchInput = document.getElementById('home-game-search');
        if (searchInput) searchInput.focus();
      }
    });
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

function setupHomePageDiscovery() {
  const searchInput = document.getElementById('home-game-search');
  const sortSelect = document.getElementById('home-sort');
  const chips = [...document.querySelectorAll('#home-genre-chips .genre-chip')];
  const grid = document.getElementById('home-games-grid');
  const countEl = document.getElementById('home-games-count');
  const emptyEl = document.getElementById('home-games-empty');
  const emptyMsg = document.getElementById('home-empty-msg');
  const resetBtn = document.getElementById('btn-reset-home-filter');
  const clearRecentsBtn = document.getElementById('btn-clear-recents');
  const recentsSection = document.getElementById('recents-section');
  const heroExploreCta = document.getElementById('hero-explore-cta');

  if (heroExploreCta) {
    heroExploreCta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('catalogue-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        if (searchInput) searchInput.focus();
      }
    });
  }

  const daily = getDailyChallenge();
  const shareDailyBtn = document.getElementById('btn-share-daily');
  if (shareDailyBtn && daily) {
    shareDailyBtn.addEventListener('click', () => {
      shareGameScore(daily.game.id);
    });
  }

  if (clearRecentsBtn && recentsSection) {
    clearRecentsBtn.addEventListener('click', () => {
      playUiSound('click');
      try { localStorage.removeItem('dk:recent-games'); } catch (_) {}
      recentsSection.style.transition = 'opacity 0.25s ease';
      recentsSection.style.opacity = '0';
      setTimeout(() => {
        recentsSection.remove();
      }, 250);
      showToast('Recently played history cleared', 'info');
    });
  }

  if (!grid || !chips.length) return;

  const all = publishedGames();
  let genreSel = 'all';
  let query = '';

  const applyFilters = () => {
    const filtered = all.filter((g) => {
      const genreMatch = genreSel === 'all'
        ? true
        : genreSel === 'favorites'
          ? isGameFavorited(g.id)
          : g.genres.includes(genreSel);
      const text = `${g.title} ${g.description} ${g.tags.join(' ')} ${g.genres.map((ge) => genre(ge)?.label).join(' ')}`.toLowerCase();
      const textMatch = !query || text.includes(query);
      return genreMatch && textMatch;
    });

    const sortVal = sortSelect?.value || 'popular';
    const sorted = [...filtered].sort((a, b) => {
      if (sortVal === 'popular') {
        if (Boolean(b.featured) !== Boolean(a.featured)) {
          return b.featured ? 1 : -1;
        }
        return a.title.localeCompare(b.title);
      }
      if (sortVal === 'title') return a.title.localeCompare(b.title);
      return (b.added || '').localeCompare(a.added || '');
    });

    grid.innerHTML = sorted.map((g) => gameCard(g)).join('');
    setupCardFavorites();
    setupCardHoverSounds();

    if (countEl) {
      countEl.textContent = `Showing ${sorted.length} ${sorted.length === 1 ? 'game' : 'games'}${genreSel !== 'all' ? ` in ${genreSel === 'favorites' ? 'Favorites' : (genre(genreSel)?.label || genreSel)}` : ''}`;
    }

    if (emptyEl) {
      emptyEl.classList.toggle('hidden', sorted.length > 0);
      if (genreSel === 'favorites' && sorted.length === 0) {
        const h2 = emptyEl.querySelector('h2');
        if (h2) h2.textContent = 'No favorites saved yet.';
        if (emptyMsg) emptyMsg.textContent = 'Click the ★ star on any game card to bookmark your favorites here!';
      } else {
        const h2 = emptyEl.querySelector('h2');
        if (h2) h2.textContent = 'No games found.';
        if (emptyMsg) emptyMsg.textContent = query ? `No games match "${escapeHtml(query)}". Try searching for "tetris", "snake", or "neon".` : 'No games match the selected filters.';
      }
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      playUiSound('switch');
      chips.forEach((c) => {
        c.classList.toggle('active', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      genreSel = chip.dataset.genre || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      query = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      playUiSound('switch');
      applyFilters();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      playUiSound('click');
      query = '';
      genreSel = 'all';
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'popular';
      chips.forEach((c) => {
        const isAll = c.dataset.genre === 'all';
        c.classList.toggle('active', isAll);
        c.setAttribute('aria-pressed', String(isAll));
      });
      applyFilters();
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
            <option value="popular">Most Popular</option>
            <option value="added">Newest Added</option>
            <option value="title">Alphabetical (A–Z)</option>
          </select>
        </div>
      </div>
      <div id="explore-genre-filters" class="chip-list explore-filters">
        <button type="button" class="genre-chip active" data-genre="all" aria-pressed="true">All Genres (${all.length})</button>
        <button type="button" class="genre-chip" data-genre="favorites" aria-pressed="false">★ Favorites (${getFavorites().length})</button>
        ${populatedGenres.map((g) => `<button type="button" class="genre-chip" data-genre="${g.slug}" aria-pressed="false">${escapeHtml(g.label)} (${genreGameCount(g.slug)})</button>`).join('')}
      </div>
      <p id="explore-count" class="directory-count">${all.length} games available</p>
      <div id="explore-results" class="game-grid">${all.map((g) => gameCard(g)).join('')}</div>
      <div id="explore-empty" class="empty-state hidden">
        <h2>No games found.</h2>
        <p>Try searching for "tetris", "snake", "jump", or "puzzle".</p>
      </div>

      <!-- Policy-Compliant Advertisement Placement Candidate -->
      <div class="ad-slot-wrapper" aria-label="Advertisement container">
        <span class="ad-label">ADVERTISEMENT</span>
        <div class="ad-slot">
          <span class="ad-slot-placeholder-text">Reserved Leaderboard Placement · DevKitra Gaming · Non-Intrusive Layout</span>
        </div>
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

  const params = new URLSearchParams(window.location.search);
  if (params.get('genre') === 'favorites') {
    genreSel = 'favorites';
    chips.forEach((c) => {
      const isFavChip = c.dataset.genre === 'favorites';
      c.classList.toggle('active', isFavChip);
      c.setAttribute('aria-pressed', String(isFavChip));
    });
  }

  const apply = () => {
    const filtered = all.filter((g) => {
      const genreMatch = genreSel === 'all'
        ? true
        : genreSel === 'favorites'
          ? isGameFavorited(g.id)
          : g.genres.includes(genreSel);
      const searchText = `${g.title} ${g.description} ${g.tags.join(' ')} ${g.genres.map((ge) => genre(ge)?.label).join(' ')}`.toLowerCase();
      const textMatch = !q || searchText.includes(q);
      return genreMatch && textMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort.value === 'popular') {
        if (Boolean(b.featured) !== Boolean(a.featured)) {
          return b.featured ? 1 : -1;
        }
        return a.title.localeCompare(b.title);
      }
      if (sort.value === 'title') return a.title.localeCompare(b.title);
      return (b.added || '').localeCompare(a.added || '');
    });

    results.innerHTML = sorted.map((g) => gameCard(g)).join('');
    setupCardFavorites();
    setupCardHoverSounds();
    empty.classList.toggle('hidden', sorted.length > 0);
    if (genreSel === 'favorites' && sorted.length === 0) {
      empty.innerHTML = '<h2>No favorites saved yet.</h2><p>Click the ★ star on any game card to bookmark your favorites here!</p>';
    } else {
      empty.innerHTML = '<h2>No games found.</h2><p>Try searching for "tetris", "snake", "jump", or "puzzle".</p>';
    }
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
  const bestScore = getGameBestScore(game.id);
  const isFav = isGameFavorited(game.id);
  const daily = getDailyChallenge();
  const isDaily = daily && daily.game.id === game.id;

  return `
    <main class="page-shell game-page">
      <!-- Breadcrumb navigation -->
      <div class="game-top-bar">
        <nav class="game-breadcrumb" aria-label="Breadcrumb navigation">
          <a href="/" data-nav class="crumb-link">Home</a>
          <span class="crumb-sep">/</span>
          <a href="/explore" data-nav class="crumb-link">All Games</a>
          <span class="crumb-sep">/</span>
          <a href="/genre/${game.genres[0]}" data-nav class="crumb-link">${escapeHtml(genre(game.genres[0])?.label || 'Games')}</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current" aria-current="page">${escapeHtml(game.title)}</span>
        </nav>
        <div class="game-top-actions">
          <a href="/explore" data-nav class="btn btn-secondary btn-sm" title="Return to complete game catalogue">← Catalogue</a>
          <button type="button" class="btn btn-secondary btn-sm" id="game-random-btn">${diceSvg()} Next Game</button>
        </div>
      </div>

      <!-- Main Game Canvas Container -->
      <div class="game-player-card" id="game-player-card">
        <div class="player-toolbar">
          <div class="toolbar-title-wrap">
            <span class="game-badge-chip">${escapeHtml(genreLabels)}</span>
            <h1 class="toolbar-game-title">${escapeHtml(game.title)}</h1>
            <span class="toolbar-best-chip ${bestScore !== null ? '' : 'hidden'}" id="toolbar-best-score" title="Your saved personal best score">🏆 Best: <strong>${escapeHtml(formatGameScore(game.id, bestScore) || '')}</strong></span>
          </div>
          <div class="toolbar-tools">
            <button type="button" class="game-tool-btn ${isFav ? 'active' : ''}" data-action="favorite" id="game-fav-btn" title="Add to Favorites">${isFav ? '★ Favorited' : '☆ Favorite'}</button>
            ${pauseMarkup}
            <button type="button" class="game-tool-btn" data-action="restart" title="Restart [R]">↺ Restart</button>
            <button type="button" class="game-tool-btn" data-action="share" id="game-share-btn" title="Share score and game link">Share 🔗</button>
            <button type="button" class="game-tool-btn" data-action="theater" id="theater-toggle" title="Toggle Theater View (Expands to screen width)">🗖 Theater</button>
            <button type="button" class="game-tool-btn game-tool-btn-primary" data-action="fullscreen" id="fs-toggle" title="Full Screen [F]">⛶ Fullscreen</button>
          </div>
        </div>

        ${isDaily ? `
          <div class="game-daily-banner ${daily.isCompleted ? 'completed' : ''}">
            <span class="daily-banner-tag">📅 TODAY'S DAILY CHALLENGE</span>
            <span class="daily-banner-goal">🎯 <strong>Mission:</strong> ${escapeHtml(daily.goal.label)}</span>
            ${daily.isCompleted ? '<span class="daily-done-pill">✓ Conquered!</span>' : '<span class="daily-pending-pill">Active Goal</span>'}
          </div>
        ` : ''}

        <div class="game-viewport-wrap" id="game-viewport">
          <iframe class="game-viewport-frame" id="active-game-frame" src="${game.standalone}${game.pause ? '?embed=1' : ''}" title="${escapeHtml(game.title)}" allowfullscreen allow="autoplay"></iframe>
        </div>

        <!-- Post-Round Completion & Score Feedback Card -->
        <div class="game-round-feedback hidden" id="game-round-feedback" aria-live="polite">
          <div class="feedback-inner">
            <div class="feedback-copy">
              <span class="feedback-eyebrow">ROUND FINISHED</span>
              <div class="feedback-score-row">
                <span class="feedback-score-num" id="feedback-score-val">0 pts</span>
                <span class="feedback-badge-pill hidden" id="feedback-best-badge">🎉 New Personal Best!</span>
                <span class="feedback-badge-pill daily-pass hidden" id="feedback-daily-badge">🏆 Daily Challenge Conquered!</span>
              </div>
              <p class="feedback-note">Saved in your browser · Zero tracking</p>
            </div>
            <div class="feedback-actions">
              <button type="button" class="btn btn-primary btn-sm" id="feedback-replay-btn">↺ Play Again</button>
              <button type="button" class="btn btn-secondary btn-sm" id="feedback-share-btn">Share Score 🔗</button>
              <a href="/explore" data-nav class="btn btn-secondary btn-sm">← More Games</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Policy-Compliant Advertisement Placement Candidate (Non-intrusive, isolated from controls) -->
      <div class="ad-slot-wrapper" aria-label="Advertisement container">
        <span class="ad-label">ADVERTISEMENT</span>
        <div class="ad-slot">
          <span class="ad-slot-placeholder-text">Reserved Leaderboard Placement · DevKitra Gaming · Non-Intrusive Layout</span>
        </div>
      </div>

      <!-- Instructions & Details -->
      <div class="game-info-grid">
        <div class="info-card">
          <h2>About ${escapeHtml(game.title)} & How to Play</h2>
          <p class="game-desc-p">${escapeHtml(game.description)}</p>

          ${game.objective ? `
          <div class="game-meta-block">
            <h3 class="game-subhead">🎯 Objective & Win Conditions</h3>
            <p class="game-objective-text">${escapeHtml(game.objective)}</p>
          </div>
          ` : ''}

          <div class="game-meta-block">
            <h3 class="game-subhead">🎮 Controls & Keybindings</h3>
            <div class="controls-keys-row">
              ${game.inputs.map((input) => `<span class="kbd">${escapeHtml(input)}</span>`).join('')}
            </div>
            <p class="controls-detail">${escapeHtml(game.controls)}</p>
          </div>

          ${game.tips && game.tips.length ? `
          <div class="game-meta-block">
            <h3 class="game-subhead">💡 High Score Tips & Strategy</h3>
            <ul class="game-tips-list">
              ${game.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <!-- Game Specifications & Technical Profile -->
          <div class="game-meta-block">
            <h3 class="game-subhead">⚙️ Technical Profile & Specifications</h3>
            <div class="game-specs-grid">
              <div class="spec-item">
                <span class="spec-label">Engine & Format</span>
                <span class="spec-value">HTML5 Canvas 2D</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Audio Synth</span>
                <span class="spec-value">Web Audio API</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Performance</span>
                <span class="spec-value">60 FPS Hardware-Accelerated</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Progress Saving</span>
                <span class="spec-value">HTML5 Local Storage (Offline)</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Input Methods</span>
                <span class="spec-value">${game.inputs.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Publisher</span>
                <span class="spec-value">DevKitra Gaming</span>
              </div>
            </div>
          </div>

          <div class="legal-callout">
            <strong>DevKitra Player Guarantee:</strong> This game runs 100% locally in your web browser. There are no executable files to download, no account credentials required, and your high scores save strictly inside your device's browser memory.
          </div>

          <div class="game-status-block">
            ${bestScore !== null ? `<p class="save-status">🏆 Your Personal Best: <strong>${bestScore.toLocaleString()}</strong></p>` : ''}
            ${game.save ? '<p class="save-status">✓ Highscores & progress save automatically in your browser.</p>' : ''}
          </div>

          <div class="hotkey-helpers">
            <span class="hotkey-pill"><kbd>R</kbd> Restart</span>
            ${game.pause ? '<span class="hotkey-pill"><kbd>P</kbd> Pause</span>' : ''}
            <span class="hotkey-pill"><kbd>F</kbd> Fullscreen</span>
          </div>
        </div>

        <!-- Related Games -->
        <div class="info-card">
          <h2>More Games You'll Enjoy</h2>
          <div class="game-genre-chips">
            <span class="chips-label">Browse Genres:</span>
            ${game.genres.map((ge) => {
              const gen = genre(ge);
              return gen ? `<a href="/genre/${ge}" data-nav class="genre-tag-link">${escapeHtml(gen.label)}</a>` : '';
            }).filter(Boolean).join('')}
          </div>
          <div class="related-list">${related.map((r) => `
            <a href="${r.route}" data-nav class="related-item">
              ${r.thumbnail ? `<img class="related-thumb" src="${r.thumbnail}" alt="" loading="lazy" width="80" height="50" decoding="async" />` : ''}
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

  recordRecentGame(game.id);

  const viewport = document.getElementById('game-viewport');
  const playerCard = document.getElementById('game-player-card');
  const frame = document.getElementById('active-game-frame');
  const restart = document.querySelector('[data-action="restart"]');
  const pauseBtn = document.querySelector('[data-action="pause"]');
  const theaterBtn = document.getElementById('theater-toggle');
  const fsBtn = document.getElementById('fs-toggle');
  const favBtn = document.getElementById('game-fav-btn');
  const randomBtn = document.getElementById('game-random-btn');
  const origin = window.location.origin;

  if (favBtn) {
    favBtn.addEventListener('click', () => {
      playUiSound('click');
      const isNowFav = toggleFavorite(game.id);
      favBtn.textContent = isNowFav ? '★ Favorited' : '☆ Favorite';
      favBtn.classList.toggle('active', isNowFav);
      showToast(isNowFav ? 'Saved to your Favorites!' : 'Removed from Favorites', 'info');
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener('click', () => launchRandomGame(game.id));
  }

  function postToGame(payload) {
    if (frame && frame.contentWindow) {
      try { frame.contentWindow.postMessage(payload, origin); } catch (_) {}
    }
  }

  let paused = false;

  function dismissFeedback() {
    const feedbackCard = document.getElementById('game-round-feedback');
    if (feedbackCard) feedbackCard.classList.add('hidden');
  }

  if (restart) {
    restart.addEventListener('click', () => {
      playUiSound('click');
      paused = false;
      if (pauseBtn) {
        pauseBtn.textContent = '⏸ Pause';
        pauseBtn.setAttribute('aria-pressed', 'false');
      }
      dismissFeedback();
      postToGame({ type: 'dk:restart' });
      frame.focus();
    });
  }

  const feedbackReplayBtn = document.getElementById('feedback-replay-btn');
  if (feedbackReplayBtn) {
    feedbackReplayBtn.addEventListener('click', () => {
      playUiSound('click');
      dismissFeedback();
      postToGame({ type: 'dk:restart' });
      frame.focus();
    });
  }

  const feedbackShareBtn = document.getElementById('feedback-share-btn');
  if (feedbackShareBtn) {
    feedbackShareBtn.addEventListener('click', () => {
      shareGameScore(game.id);
    });
  }

  const gameShareBtn = document.getElementById('game-share-btn');
  if (gameShareBtn) {
    gameShareBtn.addEventListener('click', () => {
      shareGameScore(game.id);
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

  const onGameVisibilityChange = () => {
    if (document.hidden) {
      if (pauseBtn && pauseBtn.getAttribute('aria-pressed') !== 'true') {
        pauseBtn.textContent = '▶ Resume';
        pauseBtn.setAttribute('aria-pressed', 'true');
      }
      postToGame({ type: 'dk:pause' });
    }
  };
  document.addEventListener('visibilitychange', onGameVisibilityChange);
  pageCleanups.push(() => {
    document.removeEventListener('visibilitychange', onGameVisibilityChange);
  });

  if (frame) {
    frame.addEventListener('load', () => {
      try { frame.focus(); } catch (_) {}
    });
    pageCleanups.push(() => {
      try {
        postToGame({ type: 'dk:pause' });
        frame.src = 'about:blank';
      } catch (_) {}
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

function handleGameOverEvent(gameId, score) {
  const isNewBest = updateGameBestScore(gameId, score);
  const daily = getDailyChallenge();
  let dailyCompletedNow = false;

  if (daily && daily.game.id === gameId && !daily.isCompleted) {
    const goal = daily.goal;
    const isSuccess = goal.lowerIsBetter
      ? (score > 0 && score <= goal.target)
      : (score >= goal.target);

    if (isSuccess) {
      try {
        localStorage.setItem(daily.completedKey, 'true');
        dailyCompletedNow = true;
      } catch (_) {}
    }
  }

  // Update toolbar personal best score live
  const bestScore = getGameBestScore(gameId);
  const toolbarBestEl = document.getElementById('toolbar-best-score');
  if (toolbarBestEl && bestScore) {
    toolbarBestEl.classList.remove('hidden');
    toolbarBestEl.innerHTML = `🏆 Best: <strong>${escapeHtml(formatGameScore(gameId, bestScore))}</strong>`;
  }

  // Show feedback banner under game player
  const feedbackCard = document.getElementById('game-round-feedback');
  const scoreValEl = document.getElementById('feedback-score-val');
  const bestBadge = document.getElementById('feedback-best-badge');
  const dailyBadge = document.getElementById('feedback-daily-badge');

  if (feedbackCard && scoreValEl) {
    scoreValEl.textContent = formatGameScore(gameId, score) || `${score} pts`;
    if (bestBadge) bestBadge.classList.toggle('hidden', !isNewBest);
    if (dailyBadge) dailyBadge.classList.toggle('hidden', !dailyCompletedNow);
    feedbackCard.classList.remove('hidden');
    try {
      feedbackCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (_) {}
  }

  if (dailyCompletedNow) {
    showToast('🎉 Daily Challenge Completed! Amazing job!', 'success');
  } else if (isNewBest) {
    showToast(`🎉 New Personal Best: ${formatGameScore(gameId, score)}!`, 'success');
  } else {
    showToast(`Round Finished · ${formatGameScore(gameId, score)}`, 'info');
  }
}

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  const { type, score } = event.data || {};
  if (type === 'dk:gameover' && score !== undefined && document.querySelector('.game-viewport-frame')) {
    const slugMatch = window.location.pathname.match(/^\/game\/([^/]+)$/);
    if (slugMatch) {
      handleGameOverEvent(slugMatch[1], Number(score));
    }
  }
});

function renderAboutPage() {
  return `
    <main class="page-shell about-page">
      <div class="about-container">
        <!-- Hero Section -->
        <header class="about-hero">
          <div class="eyebrow">ABOUT DEVKITRA GAMING</div>
          <h1>Free Instant Browser Games — Zero Downloads, Infinite Play</h1>
          <p class="about-lead">
            Welcome to DevKitra Games, your premier destination for fast, fun, and lightweight online gaming. We build original, high-performance web games designed to run instantly on any device with <strong>zero downloads</strong>, <strong>no account sign-ups</strong>, and <strong>no paywalls</strong>.
          </p>
          <div class="about-hero-actions">
            <a href="/explore" class="btn btn-primary btn-lg" data-nav>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Explore All Games
            </a>
            <a href="/genre/arcade" class="btn btn-secondary btn-lg" data-nav>
              Play Arcade Hits
            </a>
          </div>
          
          <!-- Key Badges Strip -->
          <div class="about-badge-strip">
            <span class="about-pill"><span class="pill-dot"></span> 100% Free Forever</span>
            <span class="about-pill"><span class="pill-dot"></span> Zero Downloads</span>
            <span class="about-pill"><span class="pill-dot"></span> Touch & Keyboard Ready</span>
            <span class="about-pill"><span class="pill-dot"></span> Privacy-Focused</span>
          </div>
        </header>

        <!-- Stats / Impact Counter -->
        <section class="about-stats-bar">
          <div class="stat-cell">
            <span class="stat-number">15+</span>
            <span class="stat-label">Handcrafted Games</span>
          </div>
          <div class="stat-cell">
            <span class="stat-number">0 MB</span>
            <span class="stat-label">Downloads Needed</span>
          </div>
          <div class="stat-cell">
            <span class="stat-number">60 FPS</span>
            <span class="stat-label">Hardware Performance</span>
          </div>
          <div class="stat-cell">
            <span class="stat-number">100%</span>
            <span class="stat-label">Free & Unrestricted</span>
          </div>
        </section>

        <!-- Why Players Love DevKitra (Core Player Benefits) -->
        <section class="about-section">
          <div class="about-section-header">
            <span class="eyebrow">THE DEVKITRA ADVANTAGE</span>
            <h2>Gaming The Way It Should Be</h2>
            <p>No waiting. No massive 50GB downloads. Pure, instant entertainment for everyone.</p>
          </div>
          
          <div class="about-features-grid">
            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">⚡</div>
              <h3>Instant Play in Seconds</h3>
              <p>Forget painful installations, app store approvals, and endless loading bars. Click any game and jump into the action in under a second directly in Chrome, Safari, Edge, or Firefox.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">🎮</div>
              <h3>100% Free to Play</h3>
              <p>Every single game on DevKitra is completely free. No subscription fees, no locked game modes, and no aggressive pay-to-win microtransactions. Just pure gameplay.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">🛡️</div>
              <h3>No Accounts or Passwords</h3>
              <p>We respect your privacy. There are no passwords to remember, no mandatory emails, and zero marketing spam. Simply visit DevKitra and start playing immediately.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">📱</div>
              <h3>Any Screen, Anywhere</h3>
              <p>Play effortlessly on smartphones, tablets, Chromebooks, laptops, and desktop workstations. Every title includes responsive touch controls and precision keyboard support.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">🏆</div>
              <h3>Automatic High Scores</h3>
              <p>Your records, highest waves, and personal settings are automatically saved right in your browser's local memory so you can return and beat your personal best anytime.</p>
            </div>

            <div class="about-feature-card">
              <div class="feature-icon" aria-hidden="true">☕</div>
              <h3>Ideal for Quick Breaks</h3>
              <p>Whether you have 3 minutes between study sessions, a coffee break at work, or an hour to unwind in the evening, our bite-sized challenges fit into any schedule.</p>
            </div>
          </div>
        </section>

        <!-- Curated Categories (SEO rich internal linking) -->
        <section class="about-section">
          <div class="about-section-header">
            <span class="eyebrow">CURATED COLLECTION</span>
            <h2>Explore Popular Game Categories</h2>
            <p>From adrenaline-pumping survival action to relaxing brain teasers, find games tailored to your mood.</p>
          </div>

          <div class="about-genres-grid">
            <a href="/genre/arcade" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">🚀</div>
              <div class="genre-details">
                <h3>Arcade & Survival</h3>
                <p>High-energy survival shooters, circular arena defense, and cosmic combat games built to test your reflexes.</p>
                <span class="genre-link-text">Browse Arcade Games &rarr;</span>
              </div>
            </a>

            <a href="/genre/puzzle" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">🧩</div>
              <div class="genre-details">
                <h3>Brain & Logic Puzzles</h3>
                <p>Smart, satisfying number match games like 2048, spatial logic challenges, and strategic grid puzzles.</p>
                <span class="genre-link-text">Browse Puzzle Games &rarr;</span>
              </div>
            </a>

            <a href="/genre/reflex" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">⚡</div>
              <div class="genre-details">
                <h3>Reflex & Gravity Runners</h3>
                <p>One-touch gravity flipping, rhythm courses, reaction benchmarks, and precision obstacle runs.</p>
                <span class="genre-link-text">Browse Reflex Games &rarr;</span>
              </div>
            </a>

            <a href="/genre/classic" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">👾</div>
              <div class="genre-details">
                <h3>Retro & Timeless Classics</h3>
                <p>Modernized homages to golden-era arcade legends: classic snake, paddle tennis, brick breakers, and minesweeper.</p>
                <span class="genre-link-text">Browse Classic Games &rarr;</span>
              </div>
            </a>

            <a href="/genre/casual" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">🎯</div>
              <div class="genre-details">
                <h3>Casual & Pick-up-and-Play</h3>
                <p>Relaxing loop connection puzzles, color matching, and soothing physics challenges designed for quick stress relief.</p>
                <span class="genre-link-text">Browse Casual Games &rarr;</span>
              </div>
            </a>

            <a href="/genre/sports" class="about-genre-card" data-nav>
              <div class="genre-badge-icon" aria-hidden="true">🏓</div>
              <div class="genre-details">
                <h3>Sports & Competitive Duels</h3>
                <p>Fast-paced table tennis action, smart AI opponents, and competitive arcade physics showdowns.</p>
                <span class="genre-link-text">Browse Sports Games &rarr;</span>
              </div>
            </a>
          </div>
        </section>

        <!-- Mission & Player-First Philosophy Card -->
        <section class="about-story-card">
          <div class="eyebrow">OUR MISSION</div>
          <h2>Bringing Back the Pure Joy of Web Gaming</h2>
          <p>
            Remember when online games were simple, instant, and fun? You opened a webpage, clicked play, and lost yourself in pure entertainment without installing 100MB apps, consenting to dozens of tracking cookies, or dodging paywalls.
          </p>
          <p>
            At <strong>DevKitra</strong>, we are committed to revitalizing that golden era of web gaming using modern web standards. Every game is handcrafted with crisp 60 FPS graphics, silky-smooth physics, and responsive controls — all packaged into ultralight pages that load in the blink of an eye.
          </p>
          <p>
            Whether you are a casual player looking to pass time, a student taking a break between assignments, or a retro enthusiast hunting for high scores, DevKitra is built for you.
          </p>
        </section>

        <!-- Editorial & Publishing Standards (Trust & Transparency for AdSense) -->
        <section class="about-story-card">
          <div class="eyebrow">EDITORIAL STANDARDS & PLATFORM INTEGRITY</div>
          <h2>Our Commitment to Quality, Safety & Transparency</h2>
          <p>
            At <strong>DevKitra Gaming</strong>, we operate under strict principles of content originality, digital safety, and non-intrusive design:
          </p>
          <ul>
            <li><strong>100% Original Game Code:</strong> Every title in our library is built and maintained by DevKitra with custom HTML5 Canvas rendering and procedural Web Audio synthesizers. We do not aggregate pirated flash conversions or scrape low-quality third-party clones.</li>
            <li><strong>Zero Harmful Software:</strong> We never distribute <code>.exe</code> files, browser extensions, intrusive toolbars, or download managers. Every game runs purely within your browser's sandboxed environment.</li>
            <li><strong>Monetization & Advertising Ethics:</strong> Advertisements on DevKitra are thoughtfully placed to support hosting infrastructure without ever intruding upon or obstructing game controls, buttons, or active canvas viewports.</li>
            <li><strong>Direct Support & Developer Outreach:</strong> We provide transparent human support via <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a>, actively reviewing community suggestions, bug reports, and independent game submissions.</li>
          </ul>
        </section>

        <!-- Frequently Asked Questions (SEO Supportive FAQ) -->
        <section class="about-section" id="faq">
          <div class="about-section-header">
            <span class="eyebrow">HELP & INFORMATION</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about playing free online games on DevKitra.</p>
          </div>

          <div class="about-faq-grid">
            <div class="faq-item">
              <h3>Are games on DevKitra really 100% free?</h3>
              <p>Yes! Every game in the DevKitra catalog is completely free to play. There are no subscriptions, no locked paid levels, and no microtransactions.</p>
            </div>

            <div class="faq-item">
              <h3>Do I need to download or install anything?</h3>
              <p>Never. All games run directly inside your web browser (Chrome, Edge, Safari, Firefox) on both desktop and mobile devices. Just click or tap to play.</p>
            </div>

            <div class="faq-item">
              <h3>Can I play on school Chromebooks, phones, and tablets?</h3>
              <p>Yes! DevKitra games are fully responsive and touch-optimized. They run smoothly on iPhones, iPads, Android phones, tablets, and Chromebooks without special permissions.</p>
            </div>

            <div class="faq-item">
              <h3>Are my high scores and settings saved?</h3>
              <p>Yes. Your personal high scores, best wave records, and sound preferences are automatically remembered on your device so your progress remains intact.</p>
            </div>

            <div class="faq-item">
              <h3>Is DevKitra safe for kids and family friendly?</h3>
              <p>DevKitra is a family-safe, clean web gaming platform. We do not distribute executable files, spam downloads, or harmful popups, making it safe for all ages.</p>
            </div>

            <div class="faq-item">
              <h3>How can I suggest a game or report an issue?</h3>
              <p>We welcome community feedback! You can reach us anytime through our <a href="/contact" data-nav>Contact Page</a> or by emailing us directly at <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a>.</p>
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
        <div class="eyebrow">PRIVACY POLICY & DISCLOSURES</div>
        <h1>Privacy Policy & Player Data Transparency</h1>
        <p><em>Effective Date: October 1, 2026 · Last Updated: November 6, 2026</em></p>
        <p>Welcome to <strong>DevKitra Gaming</strong> (<a href="/" data-nav>https://devkitra.in</a>). We are dedicated to delivering fast, fun, and lightweight browser games while holding the highest standards of player privacy, data minimization, and regulatory transparency.</p>
        
        <div class="legal-callout">
          <strong>Privacy Summary:</strong> DevKitra requires <strong>zero account registration</strong>, zero passwords, and zero personal profiles. All game progress and settings are stored locally on your device via HTML5 Local Storage and never leave your web browser.
        </div>

        <h2>1. Information We Do Not Collect</h2>
        <p>Because DevKitra is designed as an instant, barrier-free browser gaming platform, we do not require or collect:</p>
        <ul>
          <li>User account registrations, usernames, or passwords.</li>
          <li>Personal contact numbers, physical postal addresses, or financial/payment information.</li>
          <li>Email addresses (unless you voluntarily contact our support desk via direct email).</li>
          <li>User-generated social profiles or biometric data.</li>
        </ul>

        <h2 id="localstorage">2. HTML5 Local Storage & Device Preferences</h2>
        <p>To enable returning players to resume game progress and maintain preferred audio settings without requiring a server database or login system, DevKitra utilizes standard HTML5 <code>localStorage</code> directly on your device. The following data keys are stored strictly within your browser's private sandbox:</p>
        
        <table>
          <thead>
            <tr>
              <th>Storage Key</th>
              <th>Purpose & Data Stored</th>
              <th>Scope & Persistence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>dk:theme</code></td>
              <td>Stores your interface visual preference (<code>"dark"</code> or <code>"light"</code> mode).</td>
              <td>Client-side only · Persistent until cleared</td>
            </tr>
            <tr>
              <td><code>dk:sound-enabled</code></td>
              <td>Stores your global audio toggle preference (<code>"true"</code> or <code>"false"</code>).</td>
              <td>Client-side only · Persistent until cleared</td>
            </tr>
            <tr>
              <td><code>dk:favorites</code></td>
              <td>Array of bookmarked game IDs selected via the star icon.</td>
              <td>Client-side only · Persistent until cleared</td>
            </tr>
            <tr>
              <td><code>dk:recents</code></td>
              <td>List of your recently opened games with local timestamps.</td>
              <td>Client-side only · Persistent until cleared</td>
            </tr>
            <tr>
              <td><code>dk:&lt;game-id&gt;-best</code></td>
              <td>Your personal high score or deepest level record for each game.</td>
              <td>Client-side only · Persistent until cleared</td>
            </tr>
            <tr>
              <td><code>dk:daily-conquered:&lt;date&gt;</code></td>
              <td>Deterministic local status indicating completion of today's Daily Challenge.</td>
              <td>Client-side only · Persistent until cleared</td>
            </tr>
          </tbody>
        </table>

        <p><strong>Managing Local Storage:</strong> You maintain total control over this data. You can inspect, modify, or erase all local keys at any time through your browser's Developer Tools or by selecting "Clear Browsing Data / Cookies and Site Data" in your web browser settings.</p>

        <h2 id="advertising">3. Third-Party Advertising & Cookies (Google AdSense Disclosures)</h2>
        <p>To keep every game on DevKitra 100% free for players worldwide without paywalls or subscriptions, we work with third-party advertising partners, including <strong>Google AdSense</strong>, to serve advertisements on the platform.</p>
        
        <h3>Required Google Advertising Disclosures:</h3>
        <ul>
          <li>Third-party vendors, including Google, use cookies, web beacons, and mobile device identifiers to serve ads based on a user's prior visits to this website (<code>devkitra.in</code>) or other websites across the Internet.</li>
          <li>Google's use of advertising cookies enables it and its partners to serve personalized or contextual advertisements to you based on your visits to DevKitra and/or other sites on the World Wide Web.</li>
          <li>Users may opt out of personalized advertising by visiting Google's official settings page: <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
          <li>Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting the <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance (DAA) Consumer Choice Page</a> or the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer">Network Advertising Initiative (NAI) Opt-Out Page</a>.</li>
          <li>European and UK visitors may also manage advertising preferences and opt out of behavioral targeting through the <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer">Your Online Choices (EDAA) Portal</a>.</li>
        </ul>

        <h2>4. European Economic Area (EEA), UK & Swiss Users (GDPR & ePrivacy)</h2>
        <p>If you are accessing DevKitra from the European Economic Area (EEA), the United Kingdom, or Switzerland:</p>
        <ul>
          <li><strong>Legal Basis for Processing:</strong> We rely on legitimate interests to provide our core website functionality and deliver secure, edge-cached web content. Where third-party advertising cookies or personalized identifiers are deployed, processing relies upon your explicit consent.</li>
          <li><strong>Consent Management Platform (CMP):</strong> When advertising is active, DevKitra utilizes a Google-certified Consent Management Platform adhering to the IAB Europe Transparency and Consent Framework (TCF v2.2), allowing you to customize your vendor preferences or withdraw consent at any time.</li>
          <li><strong>Data Subject Rights:</strong> Under the General Data Protection Regulation (GDPR) and UK Data Protection Act, you have the right to access, rectify, or request erasure of any personal data you have directly provided to us (e.g., via support correspondence). Inquiries may be submitted to <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a>.</li>
        </ul>

        <h2>5. California & US State Privacy Rights (CCPA / CPRA)</h2>
        <p>Under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA), and related privacy laws in Virginia, Colorado, Connecticut, and Utah, residents of these jurisdictions possess specific privacy rights:</p>
        <ul>
          <li><strong>Right to Know & Access:</strong> You may request disclosure of any personal data collected about you over the preceding 12 months.</li>
          <li><strong>Right to Delete & Correct:</strong> You may request the deletion or correction of personal information held by us.</li>
          <li><strong>Right to Opt-Out of Sale or Sharing:</strong> DevKitra does not sell your personal data for monetary consideration. To the extent that third-party advertising cookies constitute "sharing" under California law for cross-context behavioral advertising, you may exercise your opt-out rights via <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">optout.aboutads.info</a> or via your browser's Global Privacy Control (GPC) signal.</li>
        </ul>

        <h2>6. Children's Online Privacy Protection (COPPA Compliance)</h2>
        <p>DevKitra is a general-audience web gaming platform featuring family-friendly, non-violent arcade, reflex, and puzzle challenges. We do not knowingly collect, request, or maintain personally identifiable information from children under the age of 13. If you believe that a child has submitted personal details through email correspondence, please contact us immediately at <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a> so we can purge the information promptly.</p>

        <h2>7. Edge Network Logs & Platform Security</h2>
        <p>DevKitra is distributed across a secure global Content Delivery Network (Cloudflare). Cloudflare may automatically record standard, non-identifying server diagnostic logs (including client IP address, HTTP headers, browser user-agent string, referral URL, and request timestamp) strictly for DDoS mitigation, bot defense, rate limiting, and technical uptime monitoring.</p>

        <h2>8. Updates to This Policy</h2>
        <p>We may periodically update this Privacy Policy to reflect platform enhancements, operational changes, or evolving regulatory requirements. Any revisions will be reflected with an updated "Last Updated" date at the top of this page.</p>

        <h2>9. Contact & Inquiries</h2>
        <p>For any questions, privacy concerns, or data rights inquiries regarding DevKitra Gaming, please reach out to our team:</p>
        <p>
          <strong>DevKitra Gaming</strong><br />
          Platform Inquiries & Privacy Officer: <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a><br />
          Official Website: <a href="/" data-nav>https://devkitra.in</a><br />
          Interactive Support: <a href="/contact" data-nav>Contact & Feedback Page</a>
        </p>
      </div>
    </main>
  `;
}

function renderTermsPage() {
  return `
    <main class="page-shell static-page">
      <div class="static-card">
        <div class="eyebrow">TERMS OF SERVICE</div>
        <h1>Terms of Service</h1>
        <p><em>Effective Date: October 1, 2026 · Last Updated: November 6, 2026</em></p>
        <p>Welcome to <strong>DevKitra Gaming</strong> (<a href="/" data-nav>https://devkitra.in</a>). By accessing, browsing, or playing games on DevKitra, you agree to be bound by these Terms of Service ("Terms") and our <a href="/privacy" data-nav>Privacy Policy</a>. If you do not agree with any portion of these Terms, please discontinue use of the platform.</p>
        
        <h2>1. Free Personal Use License</h2>
        <p>DevKitra grants you a revocable, non-exclusive, non-transferable, and royalty-free license to access, view, and play our catalog of browser-based games strictly for personal, non-commercial entertainment. You agree not to:</p>
        <ul>
          <li>Sell, sub-license, rent, or commercially exploit any game, asset, or sound element from DevKitra.</li>
          <li>Embed, iframe, or hotlink our games within external websites or commercial wrappers without prior explicit written authorization from DevKitra.</li>
          <li>Reverse-engineer, decompile, or extract the proprietary source code of games published on the platform.</li>
        </ul>

        <h2>2. Acceptable Conduct & Prohibited Activities</h2>
        <p>When interacting with DevKitra, you agree to use the platform in a lawful and respectful manner. Specifically, you agree not to:</p>
        <ul>
          <li>Launch denial-of-service (DDoS) attacks, automated scrapers, web spiders, or data mining operations against our edge infrastructure.</li>
          <li>Inject malicious scripts, exploits, worms, or automated bots designed to alter platform behavior or spoof game scores.</li>
          <li>Circumvent or tamper with security measures, headers, or client-side integrity checks.</li>
        </ul>

        <h2>3. Intellectual Property Rights</h2>
        <p>All brand names, trademarks, logos, custom user interface graphics, sound synthesis scripts, original gameplay designs, and website documentation on DevKitra are the intellectual property of DevKitra Gaming or its respective content licensors, protected under applicable domestic and international copyright and trademark laws.</p>

        <h2 id="dmca">4. DMCA & Copyright Infringement Policy</h2>
        <p>DevKitra respects the intellectual property rights of creators and adheres to the Digital Millennium Copyright Act (17 U.S.C. § 512). If you are a copyright owner or an authorized agent and believe that content hosted on DevKitra infringes your copyright, you may submit a formal notification containing the following statutory details:</p>
        
        <ol>
          <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          <li>Clear identification of the copyrighted work claimed to have been infringed, or a representative list of such works.</li>
          <li>Identification of the material that is claimed to be infringing, including the exact URL or route on DevKitra where the material is located.</li>
          <li>Information reasonably sufficient to permit DevKitra to contact you, including your name, physical address, telephone number, and email address.</li>
          <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
        </ol>

        <p>Please transmit formal copyright notices to our designated contact at:</p>
        <p><strong>DMCA & Copyright Agent:</strong> <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a><br />Subject Line: <code>[DMCA Notice] DevKitra Content Review</code></p>

        <h2>5. Third-Party Advertisements, Content & External Hyperlinks</h2>
        <p>DevKitra displays third-party advertisements (such as Google AdSense) and may contain hyperlinks to external third-party websites or services. We do not endorse, sponsor, control, or assume liability for the content, privacy policies, products, or practices of any third-party advertiser or external website. Interactions with third-party advertisements are conducted solely between you and the respective advertiser.</p>

        <h2>6. Disclaimer of Warranties</h2>
        <p>DevKitra is provided on an <strong>"as-is"</strong> and <strong>"as-available"</strong> basis without warranties of any kind, whether express, statutory, or implied. To the maximum extent permitted under applicable law, DevKitra disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, uptime availability, or error-free gameplay performance.</p>

        <h2>7. Limitation of Liability</h2>
        <p>In no event shall DevKitra Gaming, its developers, operators, or affiliates be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your access to, use of, or inability to use the platform, including but not limited to loss of device data, loss of high scores, or interruptions in service.</p>

        <h2>8. Modifications to Service & Terms</h2>
        <p>We reserve the right to add, update, modify, or retire games, features, or sections of DevKitra at any time without prior notice. We may likewise modify these Terms periodically. Your continued use of the website following the posting of revised Terms constitutes your binding acceptance of the updated terms.</p>

        <h2>9. Contact Information</h2>
        <p>If you have any questions or legal inquiries regarding these Terms of Service, please contact our team at <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a> or visit our <a href="/contact" data-nav>Contact Page</a>.</p>
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
          <h1>Contact & Player Support</h1>
          <p>Have a question, gameplay feedback, bug report, or business inquiry? We are here to help.</p>
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
                <span class="meta-label">OFFICIAL INBOX</span>
                <span class="meta-status"><span class="status-dot"></span>Replies within 24–48 hours</span>
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
            <p>Prepares a structured draft for your email client with optional browser diagnostic specs.</p>
          </div>

          <form id="contact-composer-form" class="composer-form" onsubmit="return false;">
            <div class="form-row">
              <div class="form-group flex-1">
                <label for="contact-name" class="form-label">Your Name <span class="label-optional">(optional)</span></label>
                <input type="text" id="contact-name" class="form-input" placeholder="e.g. Alex" autocomplete="name" />
              </div>
              <div class="form-group flex-1">
                <label for="contact-topic" class="form-label">Inquiry Category</label>
                <select id="contact-topic" class="form-select">
                  <option value="Bug Report / Gameplay Issue">Bug Report / Gameplay Issue</option>
                  <option value="Feature or Game Suggestion">Feature or Game Suggestion</option>
                  <option value="Developer Game Submission">Developer Game Submission</option>
                  <option value="Advertising & Business Partnership">Advertising & Business Partnership</option>
                  <option value="Copyright & DMCA Inquiry">Copyright & DMCA Inquiry</option>
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
              <textarea id="contact-message" class="form-textarea" rows="4" placeholder="Describe your question, bug report, proposal, or inquiry..."></textarea>
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
        ${g.thumbnail ? `<img src="${g.thumbnail}" alt="" class="search-item-thumb" width="40" height="25" loading="lazy" decoding="async" />` : ''}
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
  const searchShell = document.getElementById('header-search');
  if (!header || !toggle || !navigation) return;

  navigationController?.abort();
  navigationController = new AbortController();
  const { signal } = navigationController;

  const setOpen = (open) => {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    toggle.innerHTML = menuSvg(open);
    if (open && searchShell) {
      searchShell.classList.remove('open');
    }
  };

  toggle.addEventListener('click', () => {
    playUiSound('click');
    setOpen(!header.classList.contains('nav-open'));
  }, { signal });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  }, { signal });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      searchShell?.classList.remove('open');
    }
  }, { signal });
}

function setupSearchToggle() {
  const searchToggle = document.getElementById('search-toggle');
  const searchShell = document.getElementById('header-search');
  const input = document.getElementById('global-search');
  const header = document.querySelector('.site-header');
  const navToggle = document.getElementById('nav-toggle');
  if (!searchToggle || !searchShell) return;

  searchToggle.addEventListener('click', () => {
    playUiSound('click');
    if (header && header.classList.contains('nav-open')) {
      header.classList.remove('nav-open');
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation');
        navToggle.innerHTML = menuSvg(false);
      }
    }
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

function setupCardFavorites() {
  document.querySelectorAll('.card-fav-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playUiSound('click');
      const gameId = btn.dataset.favId;
      if (!gameId) return;
      const isNowFav = toggleFavorite(gameId);
      btn.classList.toggle('active', isNowFav);
      btn.textContent = isNowFav ? '★' : '☆';
      btn.setAttribute('aria-label', isNowFav ? 'Remove from favorites' : 'Add to favorites');
      btn.setAttribute('title', isNowFav ? 'Remove from favorites' : 'Add to favorites');
      showToast(isNowFav ? 'Game added to your Favorites!' : 'Game removed from Favorites', 'info');
      const countEl = document.getElementById('fav-count');
      if (countEl) countEl.textContent = getFavorites().length;
    });
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
      case 'terms': return renderTermsPage();
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
  setupCardFavorites();

  if (route.page === 'home') {
    setupHeroShowcase();
    setupHomePageDiscovery();
  }
  if (route.page === 'explore') setupExplore();
  if (route.page === 'game') setupGamePage(route.slug);
  if (route.page === 'contact') setupContactPage();
}

window.addEventListener('popstate', renderCurrentPage);
setupRouteHandling();
renderCurrentPage();
