# DevKitra Gaming

DevKitra Gaming is a browser-based instant-play gaming platform. Games run locally in the browser — no downloads, installations, or user accounts required.

## Games

- **Snake** — Arcade reflex game
- **2048** — Number-merging puzzle
- **Memory Match** — Card-pair memory game
- **Breakout** — Paddle-and-ball arcade game
- **Reaction Test** — Reflex challenge

Each game is an independent, self-contained module under `public/games/<id>/` and is embedded on `/game/<id>` through an isolated iframe.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:5173

## Tests and production build

```sh
npm test
npm run build
npm run preview
```

## Publishing a new game

1. Create `public/games/<id>/` with a standalone `index.html` and `thumbnail.svg`.
2. Add an entry to `src/games/registry.js` (id, title, description, genres, route `/game/<id>`, standalone path, tags, inputs, save support).
3. Add any new genres to the registry genre list.
4. Run `npm run dev` and verify `/game/<id>` works, including restart behavior and keyboard/touch controls.
5. Run `npm test` and `npm run build`, then `npm run preview` to check the production output.
6. Commit and push to `main`; Cloudflare Workers Builds deploys automatically (build: `npm run build`, deploy: `npx wrangler deploy`).

## Deployment

Static hosting via Cloudflare Workers (`wrangler.jsonc`, `dist/` output, SPA fallback). Connect this repository as a Worker with production branch `main`. HTTPS is managed by the host.

## Constraints

Frontend only (HTML, CSS, vanilla JavaScript). No backend, database, authentication, API keys, or cloud functions. High scores are stored in browser local storage and are not globally verified leaderboards.
