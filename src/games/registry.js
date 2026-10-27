/**
 * DevKitra Gaming — central game registry.
 *
 * Each entry describes one independent, self-contained browser game.
 * Games live under public/games/<id>/ as standalone HTML files and are
 * embedded on /game/<id> through isolated iframes. Adding a game requires:
 *   1. Create public/games/<id>/ (index.html + thumbnail.svg)
 *   2. Add an entry below (and genre entries if the genre is new)
 *   3. Rebuild — no routes, navigation, or sitemap entries change by hand.
 */

export const genres = [
  { slug: 'arcade', label: 'Arcade', description: 'Fast reflexes, high scores, instant restarts.' },
  { slug: 'action', label: 'Action', description: 'Combat, movement, and intensity.' },
  { slug: 'puzzle', label: 'Puzzle and Logic', description: 'Think a few moves ahead.' },
  { slug: 'casual', label: 'Casual', description: 'Pick up and play in seconds.' },
  { slug: 'quick-play', label: 'Quick Play', description: 'Reflex challenges under a minute.' },
  { slug: 'racing', label: 'Racing', description: 'Speed, laps, and leaderboards.' },
  { slug: 'sports', label: 'Sports', description: 'Courts, pitches, and competitions.' },
  { slug: 'strategy', label: 'Strategy', description: 'Plan, build, and outmaneuver.' },
  { slug: 'board-card', label: 'Board and Card Games', description: 'Match, pair, and strategize.' },
  { slug: 'adventure-rpg', label: 'Adventure and RPG', description: 'Stories, quests, and progression.' },
  { slug: 'simulation', label: 'Simulation and Management', description: 'Build systems and manage worlds.' },
  { slug: 'physics-skill', label: 'Physics and Skill', description: 'Bounce, aim, and time it right.' },
  { slug: 'word', label: 'Word Games', description: 'Letters, words, and vocabulary.' },
  { slug: 'idle', label: 'Idle and Incremental', description: 'Numbers that grow while you watch.' },
  { slug: 'educational', label: 'Educational and Brain Training', description: 'Learn while you play.' },
  { slug: 'platformers', label: 'Platformers', description: 'Jump, run, and explore levels.' },
  { slug: 'survival', label: 'Survival', description: 'Last as long as you can.' },
  { slug: 'creative', label: 'Creative and Sandbox Games', description: 'Build, paint, and experiment.' },
];

const GENRE_BY_SLUG = Object.fromEntries(genres.map((g) => [g.slug, g]));

export function genre(slug) {
  return GENRE_BY_SLUG[slug] || null;
}

export const games = [
  {
    id: 'snake',
    title: 'Snake',
    description: 'Eat food, grow longer, and avoid the walls and your own tail.',
    genres: ['arcade'],
    thumbnail: '/games/snake/thumbnail.svg',
    standalone: '/games/snake/index.html',
    route: '/game/snake',
    status: 'published',
    featured: true,
    tags: ['arcade', 'reflex', 'retro'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-25',
    controls: 'Arrow keys or WASD to turn. On mobile, use the direction pad.',
  },
  {
    id: '2048',
    title: '2048',
    description: 'Slide tiles to merge equal numbers and reach the 2048 tile.',
    genres: ['puzzle'],
    thumbnail: '/games/2048/thumbnail.svg',
    standalone: '/games/2048/index.html',
    route: '/game/2048',
    status: 'published',
    featured: false,
    tags: ['puzzle', 'numbers', 'keyboard', 'touch'],
    inputs: ['keyboard', 'touch'],
    save: true,
    added: '2026-10-24',
    controls: 'Arrow keys, WASD, or swipe to slide all tiles at once.',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cards and find matching pairs in as few moves as possible.',
    genres: ['board-card'],
    thumbnail: '/games/memory-match/thumbnail.svg',
    standalone: '/games/memory-match/index.html',
    route: '/game/memory-match',
    status: 'published',
    featured: false,
    tags: ['memory', 'cards', 'touch'],
    inputs: ['touch', 'keyboard'],
    save: true,
    added: '2026-10-23',
    controls: 'Tap or click cards to flip them. Match identical pairs to clear them.',
  },
  {
    id: 'breakout',
    title: 'Breakout',
    description: 'Bounce the ball off the paddle and clear every brick.',
    genres: ['arcade', 'physics-skill'],
    thumbnail: '/games/breakout/thumbnail.svg',
    standalone: '/games/breakout/index.html',
    route: '/game/breakout',
    status: 'published',
    featured: true,
    tags: ['arcade', 'reflex', 'keyboard', 'touch', 'mouse'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: false,
    pause: true,
    added: '2026-10-22',
    controls: 'Move the paddle with the mouse, touch, or left/right arrow keys.',
  },
  {
    id: 'reaction-test',
    title: 'Reaction Test',
    description: 'Wait for the screen to turn green, then tap as fast as you can.',
    genres: ['quick-play'],
    thumbnail: '/games/reaction-test/thumbnail.svg',
    standalone: '/games/reaction-test/index.html',
    route: '/game/reaction-test',
    status: 'published',
    featured: false,
    tags: ['quick-play', 'reflex', 'touch'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-21',
    controls: 'Press Space or tap the screen when the color turns green.',
  },
];

export function gameById(id) {
  return games.find((g) => g.id === id) || null;
}

export function gameByRoute(route) {
  return games.find((g) => g.route === route) || null;
}

export function publishedGames() {
  return games.filter((g) => g.status === 'published');
}

export function featuredGames() {
  return games.filter((g) => g.status === 'published' && g.featured);
}

export function gamesInGenre(slug) {
  return games.filter((g) => g.status === 'published' && g.genres.includes(slug));
}

export function genreGameCount(slug) {
  return gamesInGenre(slug).length;
}

export function allGenreSlugs() {
  return genres.map((g) => g.slug);
}
