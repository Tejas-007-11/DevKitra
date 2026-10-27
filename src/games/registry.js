/**
 * DevKitra Gaming — central game registry.
 *
 * Each entry describes one independent, self-contained browser game.
 * Games live under public/games/<id>/ as standalone HTML files and are
 * embedded on /game/<id> through isolated iframes.
 */

export const genres = [
  { slug: 'arcade', label: 'Arcade', description: 'Fast reflexes, high scores, and responsive mechanics.' },
  { slug: 'action', label: 'Action', description: 'Real-time navigation, flight, and high intensity.' },
  { slug: 'racing', label: 'Racing', description: 'High-speed track navigation and obstacle avoidance.' },
  { slug: 'puzzle', label: 'Puzzle & Logic', description: 'Spatial reasoning, number synthesis, and strategy.' },
  { slug: 'physics-skill', label: 'Physics & Skill', description: 'Orbital momentum, deflection angles, and timing.' },
  { slug: 'quick-play', label: 'Quick Play', description: 'Instant challenges designed for short gaming sessions.' },
  { slug: 'sports', label: 'Sports', description: 'Precision paddle deflection and competitive AI.' },
  { slug: 'casual', label: 'Casual', description: 'Intuitive mechanics with deep replayability.' },
  { slug: 'board-card', label: 'Memory & Cards', description: 'Pattern recognition and sequence matching.' },
];

const GENRE_BY_SLUG = Object.fromEntries(genres.map((g) => [g.slug, g]));

export function genre(slug) {
  return GENRE_BY_SLUG[slug] || null;
}

export const games = [
  {
    id: 'astro-drift',
    title: 'Astro Drift',
    description: 'Master orbital gravity, precision thrusters, and planetary navigation across 3 deep-space sectors.',
    genres: ['arcade', 'physics-skill', 'action'],
    thumbnail: '/games/astro-drift/thumbnail.svg',
    standalone: '/games/astro-drift/index.html',
    route: '/game/astro-drift',
    status: 'published',
    featured: true,
    tags: ['space', 'physics', 'orbit', 'flight'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-27',
    controls: 'Up Arrow / W / Space to thrust. Left & Right Arrows / A-D to rotate.',
  },
  {
    id: 'speed-dash',
    title: 'Speed Dash',
    description: 'High-velocity 3-lane neon highway runner. Shift lanes, dodge hazard barricades, and collect hyper orbs.',
    genres: ['racing', 'arcade', 'action'],
    thumbnail: '/games/speed-dash/thumbnail.svg',
    standalone: '/games/speed-dash/index.html',
    route: '/game/speed-dash',
    status: 'published',
    featured: true,
    tags: ['racing', 'speed', 'dodge', 'reflex'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-27',
    controls: 'Left & Right Arrows or A-D to shift lanes.',
  },
  {
    id: 'cyber-flap',
    title: 'Cyber Flap',
    description: 'Navigate an agile drone through fluctuating laser barriers using pulse-thrust propulsion.',
    genres: ['arcade', 'quick-play', 'action'],
    thumbnail: '/games/cyber-flap/thumbnail.svg',
    standalone: '/games/cyber-flap/index.html',
    route: '/game/cyber-flap',
    status: 'published',
    featured: true,
    tags: ['arcade', 'reflex', 'flight'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: true,
    pause: true,
    added: '2026-10-27',
    controls: 'Space, Click, or Tap to thrust upwards.',
  },
  {
    id: 'neon-pong',
    title: 'Neon Pong AI',
    description: 'Competitive table tennis with curve-ball spin physics and 3 adaptive AI difficulty tiers.',
    genres: ['sports', 'arcade', 'action'],
    thumbnail: '/games/neon-pong/thumbnail.svg',
    standalone: '/games/neon-pong/index.html',
    route: '/game/neon-pong',
    status: 'published',
    featured: true,
    tags: ['sports', 'pong', 'ai'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: false,
    pause: true,
    added: '2026-10-27',
    controls: 'Move paddle with Mouse, Touch, or Up/Down arrows.',
  },
  {
    id: 'tower-stack',
    title: 'Tower Stack',
    description: 'Construct soaring neon monoliths with rhythmic timing and precision overhang cuts.',
    genres: ['arcade', 'casual', 'physics-skill'],
    thumbnail: '/games/tower-stack/thumbnail.svg',
    standalone: '/games/tower-stack/index.html',
    route: '/game/tower-stack',
    status: 'published',
    featured: true,
    tags: ['arcade', 'stack', 'timing'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: true,
    pause: true,
    added: '2026-10-27',
    controls: 'Space, Click, or Tap to drop the moving slab.',
  },
  {
    id: 'breakout',
    title: 'Breakout',
    description: 'Demolish 4 handcrafted brick citadels with multiball, wide paddle, and extra life power-ups.',
    genres: ['arcade', 'physics-skill'],
    thumbnail: '/games/breakout/thumbnail.svg',
    standalone: '/games/breakout/index.html',
    route: '/game/breakout',
    status: 'published',
    featured: true,
    tags: ['arcade', 'reflex', 'breakout'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: false,
    pause: true,
    added: '2026-10-22',
    controls: 'Move paddle with Mouse, Touch, or Left/Right arrow keys.',
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Classic arcade serpent reimagined with 3 distinct arenas and progressive combo multipliers.',
    genres: ['arcade'],
    thumbnail: '/games/snake/thumbnail.svg',
    standalone: '/games/snake/index.html',
    route: '/game/snake',
    status: 'published',
    featured: false,
    tags: ['arcade', 'retro', 'reflex'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-25',
    controls: 'Arrow keys or WASD to navigate. On touch devices, use the direction buttons.',
  },
  {
    id: '2048',
    title: '2048',
    description: 'Slide and combine matching numeric tiles to synthesize the prestigious 2048 quantum block.',
    genres: ['puzzle'],
    thumbnail: '/games/2048/thumbnail.svg',
    standalone: '/games/2048/index.html',
    route: '/game/2048',
    status: 'published',
    featured: false,
    tags: ['puzzle', 'numbers', 'logic'],
    inputs: ['keyboard', 'touch'],
    save: true,
    added: '2026-10-24',
    controls: 'Arrow keys, WASD, or swipe gestures to slide tiles.',
  },
  {
    id: 'reaction-test',
    title: 'Reaction Test',
    description: 'Benchmark neurological reflexes with millisecond radar tracking and ranked performance tiers.',
    genres: ['quick-play'],
    thumbnail: '/games/reaction-test/thumbnail.svg',
    standalone: '/games/reaction-test/index.html',
    route: '/game/reaction-test',
    status: 'published',
    featured: false,
    tags: ['quick-play', 'reflex', 'benchmark'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-21',
    controls: 'Press Space or tap the screen instantly when the radar turns green.',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Uncover paired cybernetic glyphs across 3 grid scales with streak multipliers.',
    genres: ['board-card'],
    thumbnail: '/games/memory-match/thumbnail.svg',
    standalone: '/games/memory-match/index.html',
    route: '/game/memory-match',
    status: 'published',
    featured: false,
    tags: ['memory', 'cards', 'pattern'],
    inputs: ['touch', 'keyboard'],
    save: true,
    added: '2026-10-23',
    controls: 'Click or tap cards to flip and match pairs.',
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
