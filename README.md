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

## Static hosting

Deploy the contents of `dist/` over HTTPS and configure the host to serve `index.html` for application routes such as `/tools/json-formatter`. Runtime page titles and descriptions are updated for each route. Canonical URLs use the current HTTPS origin; set `VITE_SITE_URL` at build time only when the canonical origin should differ from the hosting origin.

### Cloudflare Workers with GitHub auto-deploy

This repository includes `wrangler.jsonc` for deploying the Vite `dist/` output as static assets on Workers. The single-page-app setting serves `index.html` for application routes. Wrangler is a pinned project dev dependency so Cloudflare does not need to download an unpinned CLI during every build.

In Cloudflare, connect this GitHub repository as a **Worker** and use:

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/` (or leave the default repository root)
- Preview builds: optional
- Cloudflare Access: off for a public website
- API token: use Cloudflare's automatically created token; do not paste a token into a build variable

Commit and push changes to `main`; Workers Builds will build and deploy the Worker automatically. Cloudflare provides HTTPS on its `workers.dev` hostname. Test a nested tool route directly and refresh it after deployment.

### Beginner-friendly deployment with Netlify

1. Open the project folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Run `npm run build` and wait until it says the build completed. This creates the `dist` folder.
4. In your browser, open [Netlify Drop](https://app.netlify.com/drop) and sign in or create a free account.
5. Drag the project's `dist` folder onto the Netlify Drop page. Upload the folder itself, not the whole project.
6. Netlify publishes the site and gives you a link ending in `netlify.app`. Open that link and test a tool page, then refresh the page. The refresh should still show the tool instead of a 404.

The `public/_redirects` file is copied into `dist` by Vite. It lets direct links and refreshes on app routes work. Netlify provides HTTPS for its hosted address automatically; you do not need to buy a domain to get started.

Whenever you change the site, run `npm run build` again and upload the new `dist` folder to the same site in Netlify's **Deploys** section.
