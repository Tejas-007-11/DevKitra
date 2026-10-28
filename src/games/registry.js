/**
 * DevKitra Gaming — central game registry.
 *
 * Each entry describes one independent, self-contained browser game.
 * Games live under public/games/<id>/ as standalone modules and are
 * embedded on /game/<id> through isolated iframes.
 */

export const genres = [
  { slug: 'arcade', label: 'Arcade', description: 'Fast reflexes, timeless gameplay, and high scores.' },
  { slug: 'puzzle', label: 'Puzzle & Logic', description: 'Brain teasers, tile sliding, and block matching.' },
  { slug: 'physics-skill', label: 'Physics & Skill', description: 'Trajectory physics, momentum, and target accuracy.' },
  { slug: 'classic', label: 'Classics', description: 'The all-time greatest retro browser hits.' },
  { slug: 'reflex', label: 'Reflex', description: 'Precision timing, quick jumps, and reaction tests.' },
  { slug: 'casual', label: 'Casual', description: 'Relaxing mechanics and pick-up-and-play fun.' },
  { slug: 'sports', label: 'Sports', description: 'Competitive table tennis and AI duels.' },
  { slug: 'cards', label: 'Card Games', description: 'Memory matching and sequence recognition.' },
];

const GENRE_BY_SLUG = Object.fromEntries(genres.map((g) => [g.slug, g]));

export function genre(slug) {
  return GENRE_BY_SLUG[slug] || null;
}

export const games = [
  {
    id: 'road-hopper',
    title: 'Road Hopper',
    description: 'Hop across busy highways, floating river logs, and high-speed train tracks while collecting gold coins.',
    genres: ['arcade', 'reflex', 'casual'],
    thumbnail: '/games/road-hopper/thumbnail.svg',
    standalone: '/games/road-hopper/index.html',
    route: '/game/road-hopper',
    status: 'published',
    featured: true,
    tags: ['crossy', 'road', 'hopper', 'traffic'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-28',
    controls: 'Arrow keys, WASD, or swipe to hop forward, back, left, and right.',
  },
  {
    id: 'archery',
    title: 'Archery Master',
    description: 'Pull back the bow, calculate wind resistance and gravity, and nail bullseyes and balloons across 4 stages.',
    genres: ['physics-skill', 'arcade'],
    thumbnail: '/games/archery/thumbnail.svg',
    standalone: '/games/archery/index.html',
    route: '/game/archery',
    status: 'published',
    featured: true,
    tags: ['archery', 'bow', 'physics', 'target'],
    inputs: ['mouse', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-28',
    controls: 'Click/Touch and drag back to aim the bow string. Release to shoot.',
  },
  {
    id: 'tetris',
    title: 'Block Drop (Tetris)',
    description: 'The legendary falling block puzzle. Rotate, position, and clear lines with classic tetrominoes.',
    genres: ['puzzle', 'classic', 'arcade'],
    thumbnail: '/games/tetris/thumbnail.svg',
    standalone: '/games/tetris/index.html',
    route: '/game/tetris',
    status: 'published',
    featured: true,
    tags: ['tetris', 'blocks', 'puzzle', 'retro'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-28',
    controls: 'Left/Right to move, Up/Z to rotate, Down for soft drop, Space for hard drop, C to hold piece.',
  },
  {
    id: 'sky-jump',
    title: 'Sky Jump',
    description: 'Bounce your way up floating clouds, moving platforms, and high-velocity springs to reach the stratosphere.',
    genres: ['arcade', 'reflex', 'casual'],
    thumbnail: '/games/sky-jump/thumbnail.svg',
    standalone: '/games/sky-jump/index.html',
    route: '/game/sky-jump',
    status: 'published',
    featured: true,
    tags: ['jump', 'platforms', 'doodle', 'climb'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: true,
    pause: true,
    added: '2026-10-28',
    controls: 'Left & Right Arrows or A/D keys to steer. Move mouse or tilt touch screen.',
  },
  {
    id: 'snake',
    title: 'Classic Snake',
    description: 'Eat apples, grow your tail, and navigate 3 distinct arenas with multiplier combo streaks.',
    genres: ['arcade', 'classic'],
    thumbnail: '/games/snake/thumbnail.svg',
    standalone: '/games/snake/index.html',
    route: '/game/snake',
    status: 'published',
    featured: true,
    tags: ['snake', 'retro', 'arcade', 'classic'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-25',
    controls: 'Arrow keys or WASD to turn. On touch devices, use the directional pad.',
  },
  {
    id: '2048',
    title: '2048',
    description: 'Slide numbered tiles on the grid, merge identical numbers, and reach the prestigious 2048 tile.',
    genres: ['puzzle', 'casual'],
    thumbnail: '/games/2048/thumbnail.svg',
    standalone: '/games/2048/index.html',
    route: '/game/2048',
    status: 'published',
    featured: false,
    tags: ['puzzle', 'numbers', '2048', 'math'],
    inputs: ['keyboard', 'touch'],
    save: true,
    added: '2026-10-24',
    controls: 'Arrow keys, WASD, or swipe gestures to slide all tiles in that direction.',
  },
  {
    id: 'breakout',
    title: 'Breakout',
    description: 'Smash through colorful brick fortresses with paddle ball deflection, multiball, and extra life power-ups.',
    genres: ['arcade', 'classic', 'reflex'],
    thumbnail: '/games/breakout/thumbnail.svg',
    standalone: '/games/breakout/index.html',
    route: '/game/breakout',
    status: 'published',
    featured: false,
    tags: ['breakout', 'brick', 'paddle', 'retro'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: false,
    pause: true,
    added: '2026-10-22',
    controls: 'Move paddle with Mouse, Touch, or Left/Right arrow keys.',
  },
  {
    id: 'tower-stack',
    title: 'Tower Stack',
    description: 'Stack moving colored slabs as high as you can with precision timing and slice physics.',
    genres: ['casual', 'reflex'],
    thumbnail: '/games/tower-stack/thumbnail.svg',
    standalone: '/games/tower-stack/index.html',
    route: '/game/tower-stack',
    status: 'published',
    featured: false,
    tags: ['stack', 'timing', 'relaxing', 'casual'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: true,
    pause: true,
    added: '2026-10-27',
    controls: 'Space, Click, or Tap screen to drop the sliding block.',
  },
  {
    id: 'neon-pong',
    title: 'Table Tennis (Pong AI)',
    description: 'Crisp 2D table tennis duel against smart AI with curve spin and 3 difficulty tiers.',
    genres: ['sports', 'arcade'],
    thumbnail: '/games/neon-pong/thumbnail.svg',
    standalone: '/games/neon-pong/index.html',
    route: '/game/neon-pong',
    status: 'published',
    featured: false,
    tags: ['pong', 'tennis', 'sports', 'ai'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: false,
    pause: true,
    added: '2026-10-27',
    controls: 'Move paddle up and down with Mouse, Touch, or Up/Down arrow keys.',
  },
  {
    id: 'cyber-flap',
    title: 'Flappy Flight',
    description: 'Tap to flap through obstacle pipes with precision flight dynamics and highscore tracking.',
    genres: ['arcade', 'reflex'],
    thumbnail: '/games/cyber-flap/thumbnail.svg',
    standalone: '/games/cyber-flap/index.html',
    route: '/game/cyber-flap',
    status: 'published',
    featured: false,
    tags: ['flappy', 'bird', 'flight', 'dodge'],
    inputs: ['keyboard', 'touch', 'mouse'],
    save: true,
    pause: true,
    added: '2026-10-27',
    controls: 'Press Space, Click, or Tap screen to flap upward.',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cards and match identical symbols across Casual (8), Classic (16), and Master (24) grids.',
    genres: ['cards', 'casual'],
    thumbnail: '/games/memory-match/thumbnail.svg',
    standalone: '/games/memory-match/index.html',
    route: '/game/memory-match',
    status: 'published',
    featured: false,
    tags: ['memory', 'cards', 'brain', 'matching'],
    inputs: ['touch', 'keyboard'],
    save: true,
    added: '2026-10-23',
    controls: 'Click or tap cards to flip them and locate matching pairs.',
  },
  {
    id: 'reaction-test',
    title: 'Reaction Benchmark',
    description: 'Measure your click reaction time in milliseconds with visual stimulus and 5 performance percentiles.',
    genres: ['reflex', 'casual'],
    thumbnail: '/games/reaction-test/thumbnail.svg',
    standalone: '/games/reaction-test/index.html',
    route: '/game/reaction-test',
    status: 'published',
    featured: false,
    tags: ['reaction', 'benchmark', 'reflex', 'speed'],
    inputs: ['keyboard', 'touch'],
    save: true,
    pause: true,
    added: '2026-10-21',
    controls: 'Click or tap screen as fast as possible the instant it turns green.',
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
