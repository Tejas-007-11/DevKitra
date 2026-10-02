# DevKitra

DevKitra is a browser-based collection of developer utilities. Tool input is processed in the browser; the regex tester uses a Web Worker with a one-second execution limit.

## Local development

```sh
npm install
npm run dev
```

## Tests and production build

```sh
npm test
npm run build
npm run preview
```

### Cloudflare Workers with GitHub auto-deploy

This repository includes `wrangler.jsonc` for deploying the Vite `dist/` output as static assets on Workers. Its single-page-app setting serves `index.html` for application routes. Wrangler is a pinned project dev dependency so Cloudflare does not need to download an unpinned CLI during every build. Do not add a competing `_redirects` fallback file; Workers handles app routes from `wrangler.jsonc`.

In Cloudflare, connect this GitHub repository as a **Worker** and use:

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/` (or leave the default repository root)
- Preview builds: optional
- Cloudflare Access: off for a public website
- API token: use Cloudflare's automatically created token; do not paste a token into a build variable

Commit and push changes to `main`; Workers Builds will build and deploy the Worker automatically. Cloudflare provides HTTPS on its `workers.dev` hostname. Test a nested tool route directly and refresh it after deployment.
