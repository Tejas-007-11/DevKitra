import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { games, genres, gameById, gameByRoute, publishedGames } from '../src/games/registry.js';

test('Game registry integrity', () => {
  assert.ok(games.length >= 8, `Expected at least 8 games, found ${games.length}`);
  const genreSlugs = new Set(genres.map((g) => g.slug));

  for (const game of games) {
    assert.ok(game.id, 'Game has id');
    assert.ok(game.title, `Game ${game.id} has title`);
    assert.ok(game.description, `Game ${game.id} has description`);
    assert.ok(game.controls, `Game ${game.id} has controls`);
    assert.ok(game.route.startsWith('/game/'), `Game ${game.id} route starts with /game/`);

    // Genres must exist
    for (const g of game.genres) {
      assert.ok(genreSlugs.has(g), `Game ${game.id} references valid genre: ${g}`);
    }

    // Files exist in public
    const publicPath = path.resolve('public');
    const htmlPath = path.join(publicPath, game.standalone.replace(/^\//, ''));
    const thumbPath = path.join(publicPath, game.thumbnail.replace(/^\//, ''));

    assert.ok(fs.existsSync(htmlPath), `Standalone HTML exists for ${game.id}: ${htmlPath}`);
    assert.ok(fs.existsSync(thumbPath), `Thumbnail SVG exists for ${game.id}: ${thumbPath}`);
  }
});

test('Game lookup helpers', () => {
  assert.equal(gameById('snake')?.id, 'snake');
  assert.equal(gameById('cyber-flap')?.id, 'cyber-flap');
  assert.equal(gameById('tower-stack')?.id, 'tower-stack');
  assert.equal(gameById('neon-pong')?.id, 'neon-pong');
  assert.equal(gameByRoute('/game/breakout')?.id, 'breakout');
  assert.equal(publishedGames().length, games.length);
});

