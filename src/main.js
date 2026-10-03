import './style.css';
import './redesign.css';
import { format as formatSql } from 'sql-formatter';
import { convertJsonToCsv, createUuidV4 } from './utils.js';

const tools = [
  { name: 'JSON Formatter', slug: 'json-formatter', category: 'Data & Formatting', icon: '{ }', description: 'Format and validate JSON with configurable indentation.', keywords: ['json', 'format', 'validate', 'indent'] },
  { name: 'JSON Minifier', slug: 'json-minifier', category: 'Data & Formatting', icon: 'min', description: 'Compact JSON by removing whitespace while keeping valid data.', keywords: ['json', 'minify', 'compress'] },
  { name: 'JSON to CSV', slug: 'json-to-csv', category: 'Data & Formatting', icon: 'csv', description: 'Convert arrays of objects into CSV output for spreadsheets.', keywords: ['json', 'csv', 'convert'] },
  { name: 'Base64 Encoder / Decoder', slug: 'base64', category: 'Encoding & Decoding', icon: '64', description: 'Encode or decode text in Base64 with Unicode-safe handling.', keywords: ['base64', 'encode', 'decode', 'text'] },
  { name: 'JWT Decoder', slug: 'jwt-decoder', category: 'Encoding & Decoding', icon: 'jwt', description: 'Inspect a JWT header, payload and expiration details locally.', keywords: ['jwt', 'token', 'decode', 'auth'] },
  { name: 'UUID Generator', slug: 'uuid-generator', category: 'Generators & Utilities', icon: 'id', description: 'Generate one or many UUIDs using the browser crypto API.', keywords: ['uuid', 'guid', 'generate'] },
  { name: 'Unix Timestamp Converter', slug: 'timestamp-converter', category: 'Generators & Utilities', icon: 'ts', description: 'Convert between Unix timestamps and human-readable dates.', keywords: ['timestamp', 'date', 'time', 'utc'] },
  { name: 'Regex Tester', slug: 'regex-tester', category: 'Generators & Utilities', icon: '/.*', description: 'Test JS regular expressions and inspect match groups.', keywords: ['regex', 'regexp', 'match'] },
  { name: 'URL Encoder / Decoder', slug: 'url-encoder-decoder', category: 'Encoding & Decoding', icon: 'url', description: 'Encode or decode URL components and full URLs safely.', keywords: ['url', 'uri', 'encode', 'decode'] },
  { name: 'Hash Generator', slug: 'hash-generator', category: 'Generators & Utilities', icon: '#', description: 'Create SHA-1, SHA-256, SHA-384, and SHA-512 digests.', keywords: ['hash', 'sha', 'crypto'] },
  { name: 'SQL Formatter', slug: 'sql-formatter', category: 'Data & Formatting', icon: 'sql', description: 'Format SQL statements for readability without executing them.', keywords: ['sql', 'format', 'query'] },
  { name: 'XML Formatter', slug: 'xml-formatter', category: 'Data & Formatting', icon: 'xml', description: 'Format and validate XML content using the browser parser.', keywords: ['xml', 'format', 'validate'] },
];

const toolMap = new Map(tools.map((tool) => [tool.slug, tool]));
const toolGuides = {
  'json-formatter': {
    intro: 'Use this when a JSON response or configuration file is hard to scan, or when you need to catch a syntax error before using it.',
    steps: ['Paste JSON or choose Load sample to see the formatter in action.', 'Choose the indentation width, then select Format JSON.', 'Review the result or copy it into your editor.'],
    example: '{"name":"Mina","active":true}  →  readable, indented JSON',
    note: 'Formatting checks JSON syntax; it does not validate your data against an application schema.',
  },
  'json-minifier': {
    intro: 'Minification removes insignificant whitespace from valid JSON. It is useful when you need a compact payload for transport or comparison.',
    steps: ['Paste a complete JSON value into the input.', 'Select Minify JSON.', 'Copy the compact result where it is needed.'],
    example: '{ "mode": "test", "enabled": true }  →  {"mode":"test","enabled":true}',
    note: 'The JSON data remains the same, but the result is harder for people to read. Minification is not encryption.',
  },
  'json-to-csv': {
    intro: 'Convert a JSON array into comma-separated values that can be opened in spreadsheet software.',
    steps: ['Paste a JSON array, preferably an array of objects with similar fields.', 'Select Convert to CSV and review the header and rows.', 'Copy the result or use Download CSV to save it.'],
    example: '[{"name":"Ada","role":"Engineer"}]  →  name,role\n                                      Ada,Engineer',
    note: 'Object keys become columns. Missing values are blank; nested values are represented as JSON text in a cell.',
  },
  base64: {
    intro: 'Base64 represents bytes as printable text, often for transporting data in text-only formats.',
    steps: ['Enter the text to convert.', 'Choose Encode to create Base64, or Decode to turn Base64 text back into readable text.', 'Copy the output and verify it in the format that will consume it.'],
    example: 'Hello, world!  →  SGVsbG8sIHdvcmxkIQ==',
    note: 'Base64 is an encoding, not encryption. Anyone with the text can decode it, so never use it to protect secrets.',
  },
  'jwt-decoder': {
    intro: 'Inspect the readable header and payload portions of a JSON Web Token when debugging authentication or claims.',
    steps: ['Paste the complete three-part token, including its period separators.', 'Select Decode token.', 'Review the header, payload, and expiration status shown by the tool.'],
    example: 'A JWT has the form header.payload.signature; the decoded payload may contain claims such as sub and exp.',
    note: 'Decoding does not verify the signature, issuer, audience, or trustworthiness. Do not treat displayed claims as authenticated.',
  },
  'uuid-generator': {
    intro: 'Generate UUID version 4 identifiers for records, test fixtures, or local development.',
    steps: ['Select Generate ID for one identifier, or set a quantity and select Generate multiple.', 'Choose uppercase or hyphenated output if your destination requires it.', 'Copy the generated value or list.'],
    example: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx  (UUID v4 format)',
    note: 'UUIDs are identifiers, not credentials or access tokens. Avoid using an identifier as proof of authorization.',
  },
  'timestamp-converter': {
    intro: 'Translate between Unix timestamps and calendar dates when investigating logs, APIs, or scheduled events.',
    steps: ['Enter a Unix timestamp and choose Convert to date, or select a local date and time and choose Convert to timestamp.', 'Use the output’s UTC or ISO 8601 value when sharing a timezone-independent time.', 'Copy the representation required by your system.'],
    example: '1716356700 (seconds)  →  2024-05-22T05:45:00.000Z',
    note: 'The tool accepts seconds or milliseconds for timestamp input. Date-time input is interpreted in the browser’s displayed local timezone.',
  },
  'regex-tester': {
    intro: 'Try a JavaScript regular expression against sample text and inspect matches and captured groups before using it in code.',
    steps: ['Enter the pattern without surrounding slash delimiters.', 'Set JavaScript flags such as g, i, or m in the Flags field.', 'Enter test text and select Run test; inspect matches and captured groups.'],
    example: 'Pattern: \\b[A-Z][a-z]+\\b   Flags: g   Text: Ada met Lin.   →   Ada, Lin',
    note: 'This tests JavaScript regular-expression behavior. Input is limited to 50,000 characters and each run has a one-second time limit.',
  },
  'url-encoder-decoder': {
    intro: 'Encode or decode a URL component when placing user-provided text inside a query parameter or inspecting escaped text.',
    steps: ['Paste the component or text into the input.', 'Select Encode to escape reserved characters, or Decode to read percent-encoded text.', 'Review the output before placing it into a URL.'],
    example: 'name=Ada Lovelace  →  name%3DAda%20Lovelace',
    note: 'This encodes the entire input as one component. Do not use it on a complete URL when you need to preserve its separators.',
  },
  'hash-generator': {
    intro: 'Calculate a SHA digest of text for checksums, test vectors, or comparing known values.',
    steps: ['Enter the exact text to hash.', 'Choose SHA-1, SHA-256, SHA-384, or SHA-512.', 'Select Generate hash and compare the output with a digest made using the same algorithm and exact bytes.'],
    example: 'Input: hello  |  SHA-256: 2cf24dba… (64 hexadecimal characters)',
    note: 'A plain SHA digest is not a password-storage scheme and does not encrypt data. SHA-1 is available for compatibility, not for new security designs.',
  },
  'sql-formatter': {
    intro: 'Reflow a SQL statement to make clauses and expressions easier to review during development.',
    steps: ['Paste a SQL statement into the input.', 'Select Format SQL.', 'Review the layout and copy the formatted statement into your editor or SQL client.'],
    example: 'select id,name from users where active=true  →  SELECT id, name\n                                                   FROM users\n                                                   WHERE active = true',
    note: 'This changes presentation only. It does not connect to a database, validate your schema, or execute the statement.',
  },
  'xml-formatter': {
    intro: 'Make XML easier to inspect by formatting its element tree, or compact valid XML for transfer.',
    steps: ['Paste a complete XML document into the input.', 'Choose Format XML to indent the structure or Minify to remove inter-element whitespace.', 'Review the result and copy it into the tool that needs it.'],
    example: '<item><name>Desk</name></item>  →  nested, indented XML',
    note: 'The browser parser checks well-formed XML, not validity against a DTD or XML Schema. Preserve and review whitespace-sensitive text content.',
  },
};
const app = document.querySelector('#app');
let navigationController;

function normalizePath(path = window.location.pathname) {
  return path === '/' ? '/' : path.replace(/\/+$/, '') || '/';
}

function renderNotFoundPage() {
  return `
    <main class="container page-shell narrow-shell">
      <section class="not-found">
        <p class="eyebrow">404 / NOT FOUND</p>
        <h1>This tool isn't in the kit.</h1>
        <p>That address may have changed, or the page may not exist.</p>
        <a href="/tools" data-route class="primary-btn">Browse all tools</a>
      </section>
    </main>
  `;
}

function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', next === 'dark');
  document.documentElement.dataset.theme = next;
  localStorage.setItem('devkitra-theme', next);
}

function getTheme() {
  const saved = localStorage.getItem('devkitra-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function navigateTo(path) {
  const normalized = normalizePath(path);
  window.history.pushState({}, '', normalized);
  renderCurrentPage();
}

function setupRouteHandling() {
  app.addEventListener('click', (event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-route]');
    const href = link?.getAttribute('href');
    if (
      !href
      || href.startsWith('http')
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || link.target
      || link.hasAttribute('download')
    ) return;
    event.preventDefault();
    navigateTo(href);
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

async function copyText(value, message = 'Copied to clipboard.') {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard not available');
    await navigator.clipboard.writeText(value);
    showToast(message, 'success');
    return true;
  } catch (error) {
    showToast('Clipboard access was denied. Please copy manually.', 'error');
    return false;
  }
}

function setFeedback(id, message, type = 'info') {
  const node = document.getElementById(id);
  if (!node) return;
  const classes = {
    error: 'feedback error',
    success: 'feedback success',
    warning: 'feedback warning',
    info: 'feedback',
  };
  node.className = classes[type] || classes.info;
  node.setAttribute('role', type === 'error' ? 'alert' : 'status');
  node.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  node.textContent = message;
}

const outputInvalidation = {
  'json-formatter': {
    sources: ['#json-input', '#json-indent'],
    outputs: [['#json-output', '']],
    feedback: 'json-feedback',
  },
  'json-minifier': {
    sources: ['#json-minify-input'],
    outputs: [['#json-minify-output', '']],
    feedback: 'json-minify-feedback',
  },
  'json-to-csv': {
    sources: ['#json-csv-input'],
    outputs: [['#csv-output', '']],
    feedback: 'csv-feedback',
  },
  base64: {
    sources: ['#base64-input'],
    outputs: [['#base64-output', '']],
    feedback: 'base64-feedback',
  },
  'jwt-decoder': {
    sources: ['#jwt-input'],
    outputs: [['#jwt-header', ''], ['#jwt-payload', '']],
    feedback: 'jwt-feedback',
    status: ['#jwt-status', 'Waiting for a token.'],
  },
  'uuid-generator': {
    sources: ['#uuid-quantity', '#uuid-uppercase', '#uuid-hyphen'],
    outputs: [['#uuid-output', '']],
    feedback: 'uuid-feedback',
  },
  'timestamp-converter': {
    sources: ['#timestamp-input', '#date-input'],
    outputs: [['#timestamp-result', ''], ['#date-result', '']],
    sourceOutputs: {
      '#timestamp-input': [['#date-result', '']],
      '#date-input': [['#timestamp-result', '']],
    },
    feedback: 'timestamp-feedback',
  },
  'url-encoder-decoder': {
    sources: ['#url-input'],
    outputs: [['#url-output', '']],
    feedback: 'url-feedback',
  },
  'hash-generator': {
    sources: ['#hash-input', '#hash-algorithm'],
    outputs: [['#hash-output', '']],
    feedback: 'hash-feedback',
  },
  'sql-formatter': {
    sources: ['#sql-input'],
    outputs: [['#sql-output', '']],
    feedback: 'sql-feedback',
  },
  'xml-formatter': {
    sources: ['#xml-input'],
    outputs: [['#xml-output', '']],
    feedback: 'xml-feedback',
  },
};

function setupOutputInvalidation(slug) {
  const config = outputInvalidation[slug];
  if (!config) return;

  const invalidate = (sourceSelector) => {
    (config.sourceOutputs?.[sourceSelector] || config.outputs).forEach(([selector, emptyText]) => {
      const output = document.querySelector(selector);
      if (!output) return;
      if ('value' in output) output.value = emptyText;
      else output.textContent = emptyText;
    });
    if (config.status) {
      const [selector, text] = config.status;
      const status = document.querySelector(selector);
      if (status) {
        status.className = 'status-box';
        status.textContent = text;
      }
    }
    setFeedback(config.feedback, 'Input changed. Run the tool again to refresh its output.', 'info');
  };

  config.sources.forEach((selector) => {
    const source = document.querySelector(selector);
    source?.addEventListener('input', () => invalidate(selector));
    source?.addEventListener('change', () => invalidate(selector));
  });
}

function toolCard(tool) {
  return `
    <a href="/tools/${tool.slug}" data-route class="tool-card">
      <div class="tool-card-header">
        <span class="tool-icon" aria-hidden="true">${tool.icon}</span>
        <span class="tool-index">${String(tools.indexOf(tool) + 1).padStart(2, '0')}</span>
      </div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <span class="tool-link">Open utility <span aria-hidden="true">↗</span></span>
    </a>
  `;
}

function renderHeader() {
  const path = normalizePath();
  const navItems = [
    { label: 'Tools', href: '/tools' },
    { label: 'About', href: '/about' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Contact', href: '/contact' },
  ];

  const navMarkup = navItems
    .map(({ label, href }) => {
      const active = (path === href || (href === '/tools' && path.startsWith('/tools'))) ? 'active' : '';
      return `<a href="${href}" data-route class="nav-link ${active}" ${active ? 'aria-current="page"' : ''}>${label}</a>`;
    })
    .join('');

  return `
    <div class="app-layout">
      <div class="app-main">
        <header class="site-header">
          <div class="topbar">
        <a href="/" data-route class="brand" aria-label="DevKitra home">
          <span class="brand-name"><span>Dev</span><span>Kitra</span></span>
        </a>
            <button id="nav-toggle" type="button" class="icon-button nav-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="main-nav">☰</button>
            <nav class="main-nav" id="main-nav" aria-label="Main navigation">${navMarkup}</nav>
            <div class="header-actions">
              <div class="search-shell">
                <input id="global-search" type="search" placeholder="Search tools..." aria-label="Search developer tools" />
                <span class="search-icon">⌕</span>
                <div id="search-results" class="search-results hidden" role="listbox" aria-label="Tool search results"></div>
              </div>
              <button id="theme-toggle" type="button" class="icon-button" aria-label="Toggle color theme">☀️</button>
            </div>
          </div>
        </header>
        <div id="toast" class="toast" aria-live="polite"></div>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div><strong>DevKitra</strong> <span>Developer tools. Simplified.</span></div>
        <div class="footer-links">
          <a href="/tools" data-route>Tools</a>
          <a href="/privacy" data-route>Privacy</a>
          <a href="/about" data-route>About</a>
          <a href="/contact" data-route>Contact</a>
        </div>
      </div>
    </footer>
  `;
}

function renderHomePage() {
  const categoryGroups = ['Data & Formatting', 'Encoding & Decoding', 'Generators & Utilities'];

  const categoryMarkup = categoryGroups
    .map((group) => {
      const list = tools
        .filter((tool) => tool.category === group)
        .map((tool) => `<a href="/tools/${tool.slug}" data-route class="directory-link"><span class="directory-icon" aria-hidden="true">${tool.icon}</span><span class="directory-copy"><strong>${tool.name}</strong><small>${tool.description}</small></span><span class="directory-arrow" aria-hidden="true">↗</span></a>`)
        .join('');
      return `
        <div class="category-section">
          <h3><span>${group}</span><span>${String(tools.filter((tool) => tool.category === group).length).padStart(2, '0')}</span></h3>
          <div class="directory-list">${list}</div>
        </div>
      `;
    })
    .join('');

  return `
    <main class="home-page">
      <section class="home-hero">
        <div class="home-hero-inner">
          <div class="hero-copy">
            <p class="eyebrow"><span class="live-dot"></span> A SMALLER TOOLKIT FOR THE DAILY WORK</p>
            <h1>Good tools.<br /><span>No detours.</span></h1>
            <p class="hero-description">Format, convert, decode and generate in one focused workspace. Your input stays in your browser.</p>
            <div class="home-search-shell">
              <label class="sr-only" for="home-search">Find a developer tool</label>
              <span class="home-search-symbol" aria-hidden="true">⌕</span>
              <input id="home-search" type="search" placeholder="Find a tool — JSON, timestamp, regex..." autocomplete="off" aria-controls="home-search-results" aria-expanded="false" aria-autocomplete="list" />
              <kbd aria-hidden="true">↵</kbd>
              <div id="home-search-results" class="search-results hidden" role="listbox" aria-label="Tool search results" aria-live="polite"></div>
            </div>
            <div class="hero-footnote"><span>12 utilities</span><span class="footnote-rule"></span><span>Runs locally in your browser</span></div>
          </div>
          <div class="terminal-preview" aria-label="Example developer tool workflow">
            <div class="terminal-topline">
              <div class="terminal-lights" aria-hidden="true"><i></i><i></i><i></i></div>
              <span>DEVKITRA / JSON FORMATTER</span>
              <span class="terminal-state"><i></i> READY</span>
            </div>
            <div class="terminal-content">
              <div class="terminal-file"><span>INPUT</span><span>payload.json</span></div>
              <pre><code><span class="code-punct">{</span>
  <span class="code-key">"build"</span>: <span class="code-string">"clean"</span>,
  <span class="code-key">"focus"</span>: <span class="code-string">"the work"</span>,
  <span class="code-key">"noise"</span>: <span class="code-bool">false</span>
<span class="code-punct">}</span></code></pre>
              <div class="terminal-result"><span class="result-check">✓</span><span>Valid JSON</span><span class="result-time">Formatted instantly</span></div>
            </div>
            <div class="terminal-bottom"><span>PROCESSING: LOCAL</span><span>NO UPLOADS <b>●</b></span></div>
          </div>
          <span class="hero-coordinate" aria-hidden="true">DK / 001 — EVERYDAY UTILITIES</span>
        </div>
      </section>

      <section class="home-features" aria-label="Why DevKitra">
        <div class="home-features-inner">
          <article class="feature-note">
            <span class="feature-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            <p class="feature-kicker">01 / FIND YOUR FLOW</p>
            <h2>The useful bits,<br />close at hand.</h2>
            <p>Small, dependable utilities for the little tasks that show up in every build.</p>
          </article>
          <article class="feature-note">
            <span class="feature-mark feature-mark-brackets" aria-hidden="true"><span>{</span><span>}</span></span>
            <p class="feature-kicker">02 / KEEP IT LOCAL</p>
            <h2>Your data stays<br />on your device.</h2>
            <p>Tool operations run in the browser. Nothing needs to be uploaded to get started.</p>
          </article>
          <article class="feature-note">
            <span class="feature-mark feature-mark-arrow" aria-hidden="true">↗</span>
            <p class="feature-kicker">03 / BACK TO WORK</p>
            <h2>Less setup.<br />More momentum.</h2>
            <p>No account or project setup. Open a tool, get an answer, carry on.</p>
          </article>
        </div>
      </section>

      <section class="tool-index-section">
        <div class="tool-index-inner">
          <div class="index-heading">
            <div>
              <p class="eyebrow">THE DEVKITRA TOOLBOX <span>/</span> 12 UTILITIES</p>
              <h2>Pick up where<br />the work needs you.</h2>
            </div>
            <p>One clean place for the practical stuff. Choose a category or jump straight into a utility.</p>
          </div>
          <div class="category-grid">${categoryMarkup}</div>
          <div class="privacy-strip">
            <span class="privacy-strip-mark" aria-hidden="true">↳</span>
            <span><strong>Local by design.</strong> Most tools process input on your device; no processing server is involved.</span>
            <a href="/privacy" data-route>Privacy notes <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderToolsDirectoryPage() {
  return `
    <main class="container page-shell">
      <div class="directory-top">
        <div>
          <p class="eyebrow">THE FULL KIT <span>/</span> 12 UTILITIES</p>
          <h1>Tools for the in-between.</h1>
          <p class="directory-intro">Small jobs, handled without leaving your browser.</p>
        </div>
        <div class="search-input-wrap">
          <input id="tool-directory-search" type="search" placeholder="Search for a tool..." aria-label="Search tools" />
        </div>
      </div>
      <div class="filter-row" aria-label="Filter by category">
        <button type="button" class="filter-chip active" data-filter="all" aria-pressed="true">All</button>
        <button type="button" class="filter-chip" data-filter="Data & Formatting" aria-pressed="false">Data & Formatting</button>
        <button type="button" class="filter-chip" data-filter="Encoding & Decoding" aria-pressed="false">Encoding & Decoding</button>
        <button type="button" class="filter-chip" data-filter="Generators & Utilities" aria-pressed="false">Generators & Utilities</button>
      </div>
      <p id="directory-count" class="directory-count" aria-live="polite">${tools.length} tools</p>
      <div id="directory-results" class="tool-grid">${tools.map(toolCard).join('')}</div>
      <div id="directory-empty" class="empty-state hidden">No tools match your current search.</div>
    </main>
  `;
}

function renderAboutPage() {
  return `
    <main class="container page-shell narrow-shell">
      <div class="card about-card">
        <p class="eyebrow">About DevKitra</p>
        <h1>Built for fast, private development work</h1>
        <p>DevKitra brings common developer tasks together in a single, lightweight browser application. Each utility is designed to run locally, stay fast, and avoid unnecessary account or server complexity.</p>
        <div class="feature-grid">
          <div class="card mini-card"><h3>Privacy</h3><p>Inputs stay in the browser whenever possible.</p></div>
          <div class="card mini-card"><h3>Simplicity</h3><p>Every utility has a clear workflow without the noise.</p></div>
          <div class="card mini-card"><h3>Performance</h3><p>The site is sized for quick static hosting and mobile use.</p></div>
        </div>
      </div>
    </main>
  `;
}

function renderPrivacyPage() {
  return `
    <main class="container page-shell narrow-shell">
      <div class="card about-card">
        <p class="eyebrow">Privacy</p>
        <h1>How DevKitra handles your data</h1>
        <ul class="privacy-list">
          <li><strong>Local processing:</strong> Most utility operations run inside the browser without sending your content to a server.</li>
          <li><strong>No account needed:</strong> There is no sign-up flow or user profile storage for the tools.</li>
          <li><strong>No local data storage:</strong> We do not store input or output in localStorage or sessionStorage.</li>
          <li><strong>No secret transmission:</strong> JWTs, API keys, and related secrets are not sent to external services by the tool logic.</li>
          <li><strong>Analytics and ads:</strong> Any analytics, ad services, or hosting infrastructure may still receive technical metadata required by those platforms.</li>
          <li><strong>Safe rendering:</strong> We avoid unsafe HTML insertion and use browser-native APIs to display user content.</li>
        </ul>
      </div>
    </main>
  `;
}

function renderContactPage() {
  return `
    <main class="container page-shell narrow-shell">
      <section class="card about-card contact-card">
        <p class="eyebrow">Contact</p>
        <h1>Get in touch with DevKitra</h1>
        <p>Have a question, found a problem, or want to suggest a tool? Email is the best way to reach us. Please include the tool name and the steps to reproduce a problem, if relevant.</p>
        <a class="contact-email" href="mailto:tejaskrishna.as@gmail.com">tejaskrishna.as@gmail.com</a>
        <p class="contact-note">Please do not email passwords, private keys, access tokens, or other sensitive information.</p>
      </section>
    </main>
  `;
}

function renderJsonFormatterTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="json-format" class="primary-btn small-btn">Format JSON</button>
        <button type="button" data-action="json-minify" class="secondary-btn small-btn">Minify</button>
        <button type="button" data-action="load-json-sample" class="secondary-btn small-btn">Load sample</button>
        <button type="button" data-copy-target="json-output" class="secondary-btn small-btn">Copy output</button>
        <button type="button" data-action="clear-json" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="json-input">Input</label>
          <textarea id="json-input" placeholder="Paste JSON here..."></textarea>
        </div>
        <div>
          <div class="label-row">
            <label for="json-output">Output</label>
            <label for="json-indent" class="sr-only">Output indentation</label>
            <select id="json-indent">
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </select>
          </div>
          <textarea id="json-output" readonly placeholder="Formatted JSON appears here..."></textarea>
        </div>
      </div>
      <div id="json-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderJsonMinifierTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="json-minify-only" class="primary-btn small-btn">Minify JSON</button>
        <button type="button" data-copy-target="json-minify-output" class="secondary-btn small-btn">Copy output</button>
        <button type="button" data-action="clear-json-minify" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="json-minify-input">Input</label>
          <textarea id="json-minify-input" placeholder="Paste JSON to compact..."></textarea>
        </div>
        <div>
          <label for="json-minify-output">Minified output</label>
          <textarea id="json-minify-output" readonly placeholder="Minified JSON appears here..."></textarea>
        </div>
      </div>
      <div id="json-minify-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderJsonToCsvTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="convert-to-csv" class="primary-btn small-btn">Convert to CSV</button>
        <button type="button" data-copy-target="csv-output" class="secondary-btn small-btn">Copy CSV</button>
        <button type="button" data-action="download-csv" class="secondary-btn small-btn">Download CSV</button>
        <button type="button" data-action="clear-csv" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="json-csv-input">JSON input</label>
          <textarea id="json-csv-input" placeholder='[{"name":"Ada","role":"Engineer"}]'></textarea>
        </div>
        <div>
          <label for="csv-output">CSV output</label>
          <textarea id="csv-output" readonly placeholder="CSV output appears here..."></textarea>
        </div>
      </div>
      <div id="csv-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderBase64Tool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="base64-encode" class="primary-btn small-btn">Encode</button>
        <button type="button" data-action="base64-decode" class="secondary-btn small-btn">Decode</button>
        <button type="button" data-copy-target="base64-output" class="secondary-btn small-btn">Copy output</button>
        <button type="button" data-action="clear-base64" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="base64-input">Input</label>
          <textarea id="base64-input" placeholder="Type or paste text"></textarea>
        </div>
        <div>
          <label for="base64-output">Output</label>
          <textarea id="base64-output" readonly placeholder="Base64 output appears here..."></textarea>
        </div>
      </div>
      <div id="base64-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderJwtTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="decode-jwt" class="primary-btn small-btn">Decode token</button>
        <button type="button" data-copy-target="jwt-payload" class="secondary-btn small-btn">Copy payload</button>
        <button type="button" data-action="clear-jwt" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid jwt-grid">
        <div>
          <label for="jwt-input">JWT</label>
          <textarea id="jwt-input" placeholder="eyJhbGciOi..."></textarea>
        </div>
        <div>
          <span class="field-label" id="jwt-status-label">Status</span>
          <div id="jwt-status" class="status-box" role="status" aria-labelledby="jwt-status-label" aria-live="polite">Waiting for a token.</div>
        </div>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="jwt-header">Header</label>
          <textarea id="jwt-header" readonly placeholder="Decoded header appears here..."></textarea>
        </div>
        <div>
          <label for="jwt-payload">Payload</label>
          <textarea id="jwt-payload" readonly placeholder="Decoded payload appears here..."></textarea>
        </div>
      </div>
      <div id="jwt-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderUuidTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="generate-uuid" class="primary-btn small-btn">Generate ID</button>
        <button type="button" data-action="generate-many-uuid" class="secondary-btn small-btn">Generate multiple</button>
        <button type="button" data-copy-target="uuid-output" class="secondary-btn small-btn">Copy output</button>
        <button type="button" data-action="clear-uuid" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="uuid-controls">
        <label>Quantity <input id="uuid-quantity" type="number" min="1" max="50" value="5" /></label>
        <label class="check-label"><input id="uuid-uppercase" type="checkbox" /> Uppercase</label>
        <label class="check-label"><input id="uuid-hyphen" type="checkbox" checked /> Hyphenated</label>
      </div>
      <label for="uuid-output">Generated UUIDs</label>
      <textarea id="uuid-output" readonly placeholder="UUID output appears here..."></textarea>
      <div id="uuid-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderTimestampTool() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local timezone';
  return `
    <div class="tool-panel">
      <div class="tool-grid two-col">
        <div>
          <label for="timestamp-input">Timestamp</label>
          <input id="timestamp-input" type="text" placeholder="1716356700" />
          <div class="inline-actions">
            <button type="button" data-action="timestamp-to-date" class="primary-btn small-btn">Convert to date</button>
            <button type="button" data-copy-target="timestamp-result" class="secondary-btn small-btn">Copy</button>
          </div>
        </div>
        <div>
          <label for="date-input">Local date and time <span class="timezone-note">(${timeZone})</span></label>
          <input id="date-input" type="datetime-local" />
          <div class="inline-actions">
            <button type="button" data-action="date-to-timestamp" class="primary-btn small-btn">Convert to timestamp</button>
            <button type="button" data-copy-target="date-result" class="secondary-btn small-btn">Copy</button>
          </div>
        </div>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="timestamp-result">Timestamp result</label>
          <textarea id="timestamp-result" readonly></textarea>
        </div>
        <div>
          <label for="date-result">Date result</label>
          <textarea id="date-result" readonly></textarea>
        </div>
      </div>
      <div id="timestamp-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderRegexTool() {
  return `
    <div class="tool-panel">
      <div class="tool-grid two-col">
        <div>
          <label for="regex-pattern">Pattern</label>
          <input id="regex-pattern" type="text" value="\\b[a-z]+\\b" />
          <label for="regex-flags">Flags</label>
          <input id="regex-flags" type="text" value="g" />
        </div>
        <div>
          <label for="regex-text">Test text</label>
          <textarea id="regex-text" placeholder="Type text to test...">hello world from devkitra</textarea>
          <small class="field-hint">Up to 50,000 characters; matching runs in a worker with a 1-second time limit.</small>
        </div>
      </div>
      <div class="tool-actions">
        <button type="button" data-action="run-regex" class="primary-btn small-btn">Run test</button>
        <button type="button" data-action="clear-regex" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <span class="field-label" id="regex-matches-label">Matches</span>
          <div id="regex-matches" class="result-box" aria-labelledby="regex-matches-label">No matches yet.</div>
        </div>
        <div>
          <span class="field-label" id="regex-groups-label">Captured groups</span>
          <div id="regex-groups" class="result-box" aria-labelledby="regex-groups-label">No groups yet.</div>
        </div>
      </div>
      <div id="regex-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderUrlTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="url-encode" class="primary-btn small-btn">Encode</button>
        <button type="button" data-action="url-decode" class="secondary-btn small-btn">Decode</button>
        <button type="button" data-copy-target="url-output" class="secondary-btn small-btn">Copy output</button>
        <button type="button" data-action="clear-url" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="url-input">Input</label>
          <textarea id="url-input" placeholder="Paste URL or component"></textarea>
        </div>
        <div>
          <label for="url-output">Output</label>
          <textarea id="url-output" readonly placeholder="Encoded or decoded output appears here..."></textarea>
        </div>
      </div>
      <div id="url-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderHashTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions hash-actions">
        <label for="hash-algorithm">Algorithm</label>
        <select id="hash-algorithm">
          <option value="SHA-1">SHA-1</option>
          <option value="SHA-256" selected>SHA-256</option>
          <option value="SHA-384">SHA-384</option>
          <option value="SHA-512">SHA-512</option>
        </select>
        <button type="button" data-action="generate-hash" class="primary-btn small-btn">Generate hash</button>
        <button type="button" data-copy-target="hash-output" class="secondary-btn small-btn">Copy output</button>
        <button type="button" data-action="clear-hash" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="hash-input">Text input</label>
          <textarea id="hash-input" placeholder="Enter text to hash"></textarea>
        </div>
        <div>
          <label for="hash-output">Hash output</label>
          <textarea id="hash-output" readonly placeholder="Hash appears here..."></textarea>
        </div>
      </div>
      <div id="hash-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderSqlTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="format-sql" class="primary-btn small-btn">Format SQL</button>
        <button type="button" data-copy-target="sql-output" class="secondary-btn small-btn">Copy output</button>
        <button type="button" data-action="clear-sql" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="sql-input">SQL input</label>
          <textarea id="sql-input" placeholder="SELECT * FROM users WHERE active = true;"></textarea>
        </div>
        <div>
          <label for="sql-output">Formatted SQL</label>
          <textarea id="sql-output" readonly placeholder="Formatted SQL output..."></textarea>
        </div>
      </div>
      <div id="sql-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderXmlTool() {
  return `
    <div class="tool-panel">
      <div class="tool-actions">
        <button type="button" data-action="format-xml" class="primary-btn small-btn">Format XML</button>
        <button type="button" data-action="minify-xml" class="secondary-btn small-btn">Minify</button>
        <button type="button" data-copy-target="xml-output" class="secondary-btn small-btn">Copy output</button>
        <button type="button" data-action="clear-xml" class="secondary-btn small-btn">Clear</button>
      </div>
      <div class="tool-grid two-col">
        <div>
          <label for="xml-input">XML input</label>
          <textarea id="xml-input" placeholder="<items><item>value</item></items>"></textarea>
        </div>
        <div>
          <label for="xml-output">Formatted XML</label>
          <textarea id="xml-output" readonly placeholder="Formatted XML output..."></textarea>
        </div>
      </div>
      <div id="xml-feedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderToolPageContent(slug) {
  const contentMap = {
    'json-formatter': renderJsonFormatterTool(),
    'json-minifier': renderJsonMinifierTool(),
    'json-to-csv': renderJsonToCsvTool(),
    base64: renderBase64Tool(),
    'jwt-decoder': renderJwtTool(),
    'uuid-generator': renderUuidTool(),
    'timestamp-converter': renderTimestampTool(),
    'regex-tester': renderRegexTool(),
    'url-encoder-decoder': renderUrlTool(),
    'hash-generator': renderHashTool(),
    'sql-formatter': renderSqlTool(),
    'xml-formatter': renderXmlTool(),
  };

  const tool = toolMap.get(slug);
  if (!tool) return '<main class="container page-shell"><div class="empty-state">Tool not found.</div></main>';

  const related = tools.filter((item) => item.slug !== slug).slice(0, 4);
  const guide = toolGuides[slug];
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

  return `
    <main class="container page-shell tool-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/" data-route>Home</a>
        <span>›</span>
        <a href="/tools" data-route>All tools</a>
        <span>›</span>
        <span>${tool.name}</span>
      </nav>
      <div class="page-title-wrap">
        <div class="tool-heading-mark" aria-hidden="true">${tool.icon}</div>
        <div class="tool-heading-copy">
          <p class="eyebrow">${tool.category} <span>/</span> UTILITY ${String(tools.indexOf(tool) + 1).padStart(2, '0')}</p>
          <h1>${tool.name}</h1>
          <p class="subtitle">${tool.description}</p>
        </div>
      </div>
      <section class="tool-workspace" aria-label="${tool.name} workspace">
        <div class="workspace-topline">
          <span><i class="workspace-state-dot"></i> READY TO USE</span>
          <span>PROCESSING <b>LOCAL</b></span>
        </div>
        ${contentMap[slug]}
      </section>
      <section class="tool-guide" aria-labelledby="tool-guide-title">
        <p class="eyebrow">PRACTICAL GUIDE</p>
        <h2 id="tool-guide-title">How to use ${tool.name}</h2>
        <p class="tool-guide-intro">${guide.intro}</p>
        <div class="tool-guide-grid">
          <div>
            <h3>Steps</h3>
            <ol>${guide.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
          </div>
          <div class="tool-guide-example">
            <h3>Example</h3>
            <pre><code>${escapeHtml(guide.example)}</code></pre>
            <p><strong>Good to know:</strong> ${guide.note}</p>
          </div>
        </div>
      </section>
      <div class="tool-meta-row">
        <span><span class="proof-mark" aria-hidden="true">✓</span> Runs locally in your browser. Your input stays on this device.</span>
        <nav class="related-tools" aria-label="Related tools">
          <span>Related</span>
          ${related.slice(0, 3).map((item) => `<a href="/tools/${item.slug}" data-route>${item.name}<span aria-hidden="true">↗</span></a>`).join('')}
        </nav>
      </div>
    </main>
  `;
}

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

    const matches = tools.filter((tool) => `${tool.name} ${tool.description} ${tool.category} ${tool.keywords.join(' ')}`.toLowerCase().includes(q));
    if (!matches.length) {
      list.classList.remove('hidden');
      list.innerHTML = '<div class="search-empty">No tools match your search.</div>';
      return;
    }

    list.classList.remove('hidden');
    list.innerHTML = matches.slice(0, 6).map((tool) => `<button type="button" role="option" class="search-item" data-search-link="/tools/${tool.slug}">${tool.name}<span>${tool.category}</span></button>`).join('');
    list.querySelectorAll('[data-search-link]').forEach((button) => {
      button.addEventListener('click', () => navigateTo(button.dataset.searchLink));
    });
  };

  input.addEventListener('input', update);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && input.value.trim()) {
      const matches = tools.filter((tool) => `${tool.name} ${tool.description} ${tool.category} ${tool.keywords.join(' ')}`.toLowerCase().includes(input.value.trim().toLowerCase()));
      if (matches[0]) navigateTo(`/tools/${matches[0].slug}`);
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#global-search') && !event.target.closest('#search-results')) {
      list.classList.add('hidden');
    }
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
  };

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')), { signal });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  }, { signal });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  }, { signal });
}

function setupHomeSearch() {
  const input = document.getElementById('home-search');
  const results = document.getElementById('home-search-results');
  if (!input || !results) return;

  const update = () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      results.classList.add('hidden');
      input.setAttribute('aria-expanded', 'false');
      results.replaceChildren();
      return;
    }

    const matches = tools.filter((tool) => `${tool.name} ${tool.description} ${tool.category} ${tool.keywords.join(' ')}`.toLowerCase().includes(query)).slice(0, 5);
    results.classList.remove('hidden');
    input.setAttribute('aria-expanded', 'true');
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">No tools found. Try another search.</div>';
      return;
    }

    results.innerHTML = matches.map((tool) => `<a href="/tools/${tool.slug}" role="option" data-route class="search-item"><strong>${tool.name}</strong><span>${tool.category}</span></a>`).join('');
  };

  input.addEventListener('input', update);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const query = input.value.trim().toLowerCase();
      if (!query) return;
      const match = tools.find((tool) => `${tool.name} ${tool.description} ${tool.category} ${tool.keywords.join(' ')}`.toLowerCase().includes(query));
      if (match) navigateTo(`/tools/${match.slug}`);
    } else if (event.key === 'Escape') {
      results.classList.add('hidden');
      input.setAttribute('aria-expanded', 'false');
    }
  });
  results.addEventListener('click', (event) => {
    const link = event.target.closest('[data-route]');
    if (!link) return;
    event.preventDefault();
    navigateTo(link.getAttribute('href'));
  });
  document.querySelectorAll('[data-home-query]').forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.dataset.homeQuery;
      update();
      input.focus();
    });
  });
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  toggle.textContent = getTheme() === 'dark' ? '◐' : '☼';
  toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    toggle.textContent = next === 'dark' ? '◐' : '☼';
  });
}

function setupDirectory() {
  const search = document.getElementById('tool-directory-search');
  const results = document.getElementById('directory-results');
  const empty = document.getElementById('directory-empty');
  const chips = [...document.querySelectorAll('.filter-chip')];
  let category = 'all';

  const apply = () => {
    const q = (search?.value || '').trim().toLowerCase();
    const filtered = tools.filter((tool) => {
      const categoryMatch = category === 'all' || tool.category === category;
      const textMatch = !q || `${tool.name} ${tool.description} ${tool.keywords.join(' ')}`.toLowerCase().includes(q);
      return categoryMatch && textMatch;
    });
    results.innerHTML = filtered.map(toolCard).join('');
    empty.classList.toggle('hidden', filtered.length > 0);
    document.getElementById('directory-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'tool' : 'tools'}`;
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      category = chip.dataset.filter || 'all';
      chips.forEach((item) => {
        item.classList.toggle('active', item === chip);
        item.setAttribute('aria-pressed', String(item === chip));
      });
      apply();
    });
  });

  search?.addEventListener('input', apply);
}

function bindToolActions(slug) {
  const copyButtons = [...document.querySelectorAll('[data-copy-target]')];
  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target || !target.value) {
        showToast('Nothing to copy yet.', 'error');
        return;
      }
      await copyText(target.value);
    });
  });

  if (slug === 'json-formatter') {
    const input = document.getElementById('json-input');
    const output = document.getElementById('json-output');
    document.querySelector('[data-action="json-format"]').addEventListener('click', () => {
      output.value = '';
      const value = input.value.trim();
      if (!value) {
        setFeedback('json-feedback', 'Enter JSON before formatting.', 'error');
        return;
      }
      try {
        const parsed = JSON.parse(value);
        const indent = Number(document.getElementById('json-indent').value);
        output.value = JSON.stringify(parsed, null, indent);
        setFeedback('json-feedback', 'JSON formatted successfully.', 'success');
      } catch (error) {
        setFeedback('json-feedback', `Invalid JSON: ${error.message}`, 'error');
      }
    });
    document.querySelector('[data-action="json-minify"]').addEventListener('click', () => {
      output.value = '';
      const value = input.value.trim();
      if (!value) {
        setFeedback('json-feedback', 'Enter JSON before minifying.', 'error');
        return;
      }
      try {
        output.value = JSON.stringify(JSON.parse(value));
        setFeedback('json-feedback', 'JSON minified successfully.', 'success');
      } catch (error) {
        setFeedback('json-feedback', `Invalid JSON: ${error.message}`, 'error');
      }
    });
    document.querySelector('[data-action="load-json-sample"]').addEventListener('click', () => {
      input.value = '{"name":"DevKitra","features":["JSON","Regex"],"active":true}';
      output.value = '';
      setFeedback('json-feedback', 'Sample JSON loaded.', 'success');
    });
    document.querySelector('[data-action="clear-json"]').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setFeedback('json-feedback', 'Input and output cleared.', 'success');
    });
  }

  if (slug === 'json-minifier') {
    const input = document.getElementById('json-minify-input');
    const output = document.getElementById('json-minify-output');
    document.querySelector('[data-action="json-minify-only"]').addEventListener('click', () => {
      output.value = '';
      const value = input.value.trim();
      if (!value) {
        setFeedback('json-minify-feedback', 'Enter JSON before minifying.', 'error');
        return;
      }
      try {
        output.value = JSON.stringify(JSON.parse(value));
        setFeedback('json-minify-feedback', 'JSON minified successfully.', 'success');
      } catch (error) {
        setFeedback('json-minify-feedback', `Invalid JSON: ${error.message}`, 'error');
      }
    });
    document.querySelector('[data-action="clear-json-minify"]').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setFeedback('json-minify-feedback', 'Input and output cleared.', 'success');
    });
  }

  if (slug === 'json-to-csv') {
    const input = document.getElementById('json-csv-input');
    const output = document.getElementById('csv-output');
    document.querySelector('[data-action="convert-to-csv"]').addEventListener('click', () => {
      output.value = '';
      const value = input.value.trim();
      if (!value) {
        setFeedback('csv-feedback', 'Enter JSON before converting.', 'error');
        return;
      }
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of objects.');
        if (!parsed.length) {
          setFeedback('csv-feedback', 'The JSON array is empty.', 'warning');
          return;
        }
        output.value = convertJsonToCsv(parsed);
        setFeedback('csv-feedback', 'CSV converted successfully.', 'success');
      } catch (error) {
        setFeedback('csv-feedback', error.message, 'error');
      }
    });
    document.querySelector('[data-action="download-csv"]').addEventListener('click', () => {
      if (!output.value.trim()) {
        setFeedback('csv-feedback', 'Generate CSV before downloading.', 'error');
        return;
      }
      const blob = new Blob([output.value], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = 'devkitra-export.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setFeedback('csv-feedback', 'CSV file downloaded.', 'success');
    });
    document.querySelector('[data-action="clear-csv"]').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setFeedback('csv-feedback', 'Input and output cleared.', 'success');
    });
  }

  if (slug === 'base64') {
    const input = document.getElementById('base64-input');
    const output = document.getElementById('base64-output');
    const run = (mode) => {
      output.value = '';
      const value = input.value;
      if (!value) {
        setFeedback('base64-feedback', 'Enter text to convert.', 'error');
        return;
      }
      try {
        if (mode === 'base64-encode') {
          const binary = Array.from(new TextEncoder().encode(value), (byte) => String.fromCharCode(byte)).join('');
          output.value = btoa(binary);
        } else {
          const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
          const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
          const binary = atob(padded);
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
          output.value = new TextDecoder().decode(bytes);
        }
        setFeedback('base64-feedback', `Base64 ${mode.includes('encode') ? 'encode' : 'decode'} complete.`, 'success');
      } catch (error) {
        setFeedback('base64-feedback', `Unable to ${mode.includes('encode') ? 'encode' : 'decode'}: ${error.message}`, 'error');
      }
    };
    document.querySelector('[data-action="base64-encode"]').addEventListener('click', () => run('base64-encode'));
    document.querySelector('[data-action="base64-decode"]').addEventListener('click', () => run('base64-decode'));
    document.querySelector('[data-action="clear-base64"]').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setFeedback('base64-feedback', 'Input and output cleared.', 'success');
    });
  }

  if (slug === 'jwt-decoder') {
    const decodeJwt = () => {
      const token = document.getElementById('jwt-input').value.trim();
      const status = document.getElementById('jwt-status');
      const header = document.getElementById('jwt-header');
      const payload = document.getElementById('jwt-payload');
      header.value = '';
      payload.value = '';
      status.className = 'status-box';

      if (!token) {
        setFeedback('jwt-feedback', 'Enter a JWT to decode.', 'error');
        status.textContent = 'Waiting for a token.';
        return;
      }

      try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('JWTs must contain three segments separated by periods.');
        const decodeSegment = (segment) => {
          const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
          const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
          const binary = atob(padded);
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
          return JSON.parse(new TextDecoder().decode(bytes));
        };
        const headerJson = decodeSegment(parts[0]);
        const payloadJson = decodeSegment(parts[1]);
        header.value = JSON.stringify(headerJson, null, 2);
        payload.value = JSON.stringify(payloadJson, null, 2);

        if (payloadJson.exp !== undefined) {
          const expMs = Number(payloadJson.exp) * 1000;
          if (!Number.isFinite(expMs) || Number.isNaN(new Date(expMs).getTime())) {
            status.textContent = 'Invalid expiration claim. Signature not verified.';
            status.className = 'status-box error';
            setFeedback('jwt-feedback', 'JWT decoded, but its expiration claim is invalid. Signature not verified.', 'warning');
            return;
          }
          const expired = Date.now() > expMs;
          status.textContent = expired
            ? `Expired at ${new Date(expMs).toISOString()}. Signature not verified.`
            : `Not expired; expires ${new Date(expMs).toISOString()}. Signature not verified.`;
          status.className = `status-box ${expired ? 'expired' : 'valid'}`;
        } else {
          status.textContent = 'No expiration claim. Signature not verified.';
          status.className = 'status-box';
        }
        setFeedback('jwt-feedback', 'JWT decoded locally. Its signature was not verified.', 'success');
      } catch (error) {
        header.value = '';
        payload.value = '';
        status.textContent = 'Token could not be decoded.';
        status.className = 'status-box error';
        setFeedback('jwt-feedback', error.message, 'error');
      }
    };
    document.querySelector('[data-action="decode-jwt"]').addEventListener('click', decodeJwt);
    document.querySelector('[data-action="clear-jwt"]').addEventListener('click', () => {
      document.getElementById('jwt-input').value = '';
      document.getElementById('jwt-header').value = '';
      document.getElementById('jwt-payload').value = '';
      document.getElementById('jwt-status').className = 'status-box';
      document.getElementById('jwt-status').textContent = 'Waiting for a token.';
      setFeedback('jwt-feedback', 'Token inputs cleared.', 'success');
    });
  }

  if (slug === 'uuid-generator') {
    const output = document.getElementById('uuid-output');
    const formatValue = (value) => {
      const upper = document.getElementById('uuid-uppercase').checked;
      const hyphenated = document.getElementById('uuid-hyphen').checked;
      const normalized = upper ? value.toUpperCase() : value;
      return hyphenated ? normalized : normalized.replace(/-/g, '');
    };
    const generate = (single = false) => {
      const quantityField = document.getElementById('uuid-quantity');
      const requestedQuantity = single ? 1 : Number(quantityField.value);
      if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > 50) {
        output.value = '';
        setFeedback('uuid-feedback', 'Enter a whole number from 1 to 50.', 'error');
        return;
      }
      const quantity = requestedQuantity;
      try {
        const items = Array.from({ length: quantity }, () => createUuidV4(window.crypto));
        output.value = items.map(formatValue).join('\n');
        setFeedback('uuid-feedback', `${items.length} UUID(s) generated securely.`, 'success');
      } catch (error) {
        output.value = '';
        setFeedback('uuid-feedback', `UUID generation failed: ${error.message}`, 'error');
      }
    };
    document.querySelector('[data-action="generate-uuid"]').addEventListener('click', () => generate(true));
    document.querySelector('[data-action="generate-many-uuid"]').addEventListener('click', () => generate());
    document.querySelector('[data-action="clear-uuid"]').addEventListener('click', () => {
      output.value = '';
      setFeedback('uuid-feedback', 'UUID output cleared.', 'success');
    });
  }

  if (slug === 'timestamp-converter') {
    document.getElementById('timestamp-input').value = String(Math.floor(Date.now() / 1000));
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
    document.getElementById('date-input').value = localDateTime;

    document.querySelector('[data-action="timestamp-to-date"]').addEventListener('click', () => {
      document.getElementById('date-result').value = '';
      const value = document.getElementById('timestamp-input').value.trim();
      if (!value) {
        setFeedback('timestamp-feedback', 'Enter a timestamp before converting.', 'error');
        return;
      }
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        setFeedback('timestamp-feedback', 'The timestamp must be numeric.', 'error');
        return;
      }
      const date = new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric);
      if (Number.isNaN(date.getTime())) {
        setFeedback('timestamp-feedback', 'The timestamp is outside the supported range.', 'error');
        return;
      }
      document.getElementById('date-result').value = `Unix timestamp: ${numeric}\nUTC: ${date.toUTCString()}\nLocal: ${date.toString()}\nISO 8601: ${date.toISOString()}`;
      setFeedback('timestamp-feedback', 'Timestamp converted to date.', 'success');
    });

    document.querySelector('[data-action="date-to-timestamp"]').addEventListener('click', () => {
      document.getElementById('timestamp-result').value = '';
      const value = document.getElementById('date-input').value;
      if (!value) {
        setFeedback('timestamp-feedback', 'Select a date before converting.', 'error');
        return;
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        setFeedback('timestamp-feedback', 'The selected date is invalid.', 'error');
        return;
      }
      const ms = date.getTime();
      document.getElementById('timestamp-result').value = `Unix timestamp (seconds): ${Math.floor(ms / 1000)}\nUnix timestamp (milliseconds): ${ms}\nUTC: ${date.toUTCString()}\nLocal: ${date.toString()}\nISO 8601: ${date.toISOString()}`;
      setFeedback('timestamp-feedback', 'Date converted to timestamp.', 'success');
    });
  }

  if (slug === 'regex-tester') {
    const runButton = document.querySelector('[data-action="run-regex"]');
    let activeWorker;
    let cancelActiveRun;
    let runToken = 0;
    const clearResults = () => {
      document.getElementById('regex-matches').textContent = 'No matches yet.';
      document.getElementById('regex-groups').textContent = 'No groups yet.';
    };
    const invalidate = () => {
      runToken += 1;
      activeWorker?.terminate();
      activeWorker = undefined;
      cancelActiveRun?.();
      cancelActiveRun = undefined;
      runButton.disabled = false;
      runButton.removeAttribute('aria-busy');
      clearResults();
      setFeedback('regex-feedback', 'Pattern or test text changed. Run the test again.', 'info');
    };
    ['#regex-pattern', '#regex-flags', '#regex-text'].forEach((selector) => {
      const input = document.querySelector(selector);
      input.addEventListener('input', invalidate);
      input.addEventListener('change', invalidate);
    });
    const run = async () => {
      const pattern = document.getElementById('regex-pattern').value;
      const flags = document.getElementById('regex-flags').value;
      const sourceText = document.getElementById('regex-text').value;
      if (sourceText.length > 50000) {
        clearResults();
        setFeedback('regex-feedback', 'Test text is limited to 50,000 characters.', 'error');
        return;
      }

      const text = sourceText;
      const currentRun = ++runToken;
      activeWorker?.terminate();
      activeWorker = undefined;
      clearResults();
      runButton.disabled = true;
      runButton.setAttribute('aria-busy', 'true');
      let worker;
      try {
        worker = new Worker(new URL('./regex-worker.js', import.meta.url), { type: 'module' });
        activeWorker = worker;
        const result = await new Promise((resolve, reject) => {
          let settled = false;
          const finish = (callback, value) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            if (cancelActiveRun === cancel) cancelActiveRun = undefined;
            callback(value);
          };
          const cancel = () => finish(resolve, { cancelled: true });
          cancelActiveRun = cancel;
          const timeout = window.setTimeout(() => {
            worker.terminate();
            finish(reject, new Error('Regex timed out after 1 second. Try a simpler pattern or shorter test text.'));
          }, 1000);
          worker.onmessage = (event) => finish(resolve, event.data);
          worker.onerror = (event) => finish(reject, new Error(event.message || 'Regex worker failed.'));
          worker.postMessage({ pattern, flags, text, maxMatches: 1000 });
        });
        if (result.cancelled) return;
        if (result.error) throw new Error(result.error);
        const matches = result.matches;
        const builds = matches.length
          ? matches.map((match, index) => `Match ${index + 1}: ${JSON.stringify(match.full)}${match.groups.length ? ` | groups: ${JSON.stringify(match.groups)}` : ''}`).join('\n')
          : 'No matches found.';
        const groups = matches.length
          ? matches.map((match, index) => `#${index + 1}: ${match.groups.map((group) => group ?? 'null').join(', ') || 'No capture groups'}`).join('\n')
          : 'No capture groups were found.';
        document.getElementById('regex-matches').textContent = builds;
        document.getElementById('regex-groups').textContent = groups;
        const cappedMessage = result.truncated ? ' Display limited to the first 1,000 matches.' : '';
        setFeedback('regex-feedback', `Regex executed successfully. ${matches.length}${result.truncated ? '+' : ''} match(es) found.${cappedMessage}`, 'success');
      } catch (error) {
        setFeedback('regex-feedback', `Regex test failed: ${error.message}`, 'error');
      } finally {
        worker?.terminate();
        if (currentRun === runToken) {
          if (activeWorker === worker) activeWorker = undefined;
          runButton.disabled = false;
          runButton.removeAttribute('aria-busy');
        }
      }
    };
    runButton.addEventListener('click', run);
    document.querySelector('[data-action="clear-regex"]').addEventListener('click', () => {
      invalidate();
      document.getElementById('regex-pattern').value = '';
      document.getElementById('regex-flags').value = 'g';
      document.getElementById('regex-text').value = '';
      clearResults();
      setFeedback('regex-feedback', 'Regex input cleared.', 'success');
    });
  }

  if (slug === 'url-encoder-decoder') {
    const input = document.getElementById('url-input');
    const output = document.getElementById('url-output');
    const run = (mode) => {
      output.value = '';
      const value = input.value.trim();
      if (!value) {
        setFeedback('url-feedback', 'Enter URL content before converting.', 'error');
        return;
      }
      try {
        output.value = mode === 'url-encode' ? encodeURIComponent(value) : decodeURIComponent(value);
        setFeedback('url-feedback', `URL ${mode === 'url-encode' ? 'encode' : 'decode'} complete.`, 'success');
      } catch (error) {
        setFeedback('url-feedback', `Malformed URL input: ${error.message}`, 'error');
      }
    };
    document.querySelector('[data-action="url-encode"]').addEventListener('click', () => run('url-encode'));
    document.querySelector('[data-action="url-decode"]').addEventListener('click', () => run('url-decode'));
    document.querySelector('[data-action="clear-url"]').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setFeedback('url-feedback', 'URL input cleared.', 'success');
    });
  }

  if (slug === 'hash-generator') {
    const input = document.getElementById('hash-input');
    const output = document.getElementById('hash-output');
    const algorithm = document.getElementById('hash-algorithm');
    const generateButton = document.querySelector('[data-action="generate-hash"]');
    const run = async () => {
      output.value = '';
      const value = input.value;
      if (!value) {
        setFeedback('hash-feedback', 'Enter text before generating a hash.', 'error');
        return;
      }
      generateButton.disabled = true;
      generateButton.setAttribute('aria-busy', 'true');
      try {
        const digest = await crypto.subtle.digest(algorithm.value, new TextEncoder().encode(value));
        output.value = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
        setFeedback('hash-feedback', `${algorithm.value} generated successfully.`, 'success');
      } catch (error) {
        setFeedback('hash-feedback', `Hash generation failed: ${error.message}`, 'error');
      } finally {
        generateButton.disabled = false;
        generateButton.removeAttribute('aria-busy');
      }
    };
    document.querySelector('[data-action="generate-hash"]').addEventListener('click', run);
    document.querySelector('[data-action="clear-hash"]').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setFeedback('hash-feedback', 'Hash input cleared.', 'success');
    });
  }

  if (slug === 'sql-formatter') {
    const input = document.getElementById('sql-input');
    const output = document.getElementById('sql-output');
    document.querySelector('[data-action="format-sql"]').addEventListener('click', () => {
      output.value = '';
      const value = input.value.trim();
      if (!value) {
        setFeedback('sql-feedback', 'Enter SQL before formatting.', 'error');
        return;
      }
      try {
        output.value = formatSql(value, { language: 'sql', keywordCase: 'upper', tabWidth: 2 });
        setFeedback('sql-feedback', 'SQL formatted successfully.', 'success');
      } catch (error) {
        setFeedback('sql-feedback', `Formatting failed: ${error.message}`, 'error');
      }
    });
    document.querySelector('[data-action="clear-sql"]').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setFeedback('sql-feedback', 'SQL input cleared.', 'success');
    });
  }

  if (slug === 'xml-formatter') {
    const input = document.getElementById('xml-input');
    const output = document.getElementById('xml-output');
    const formatXml = (value, minify = false) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(value, 'application/xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) throw new Error('Malformed XML. Check that tags are properly nested and entities are escaped.');
      const serializer = new XMLSerializer();
      if (minify) return serializer.serializeToString(doc).replace(/>\s+</g, '><').trim();
      const serializeNode = (node, depth = 0) => {
        const pad = '  '.repeat(depth);
        if (node.nodeType !== Node.ELEMENT_NODE) return `${pad}${serializer.serializeToString(node)}`;
        const children = [...node.childNodes].filter((child) => !(child.nodeType === Node.TEXT_NODE && !child.textContent.trim()));
        if (!children.length) return `${pad}${serializer.serializeToString(node)}`;
        const hasSignificantText = children.some((child) => child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE);
        if (hasSignificantText) return `${pad}${serializer.serializeToString(node)}`;

        const openTag = serializer.serializeToString(node.cloneNode(false)).replace(/\/>$/, '>');
        const closeTag = `</${node.tagName}>`;
        if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
          return `${pad}${serializer.serializeToString(node)}`;
        }
        return `${pad}${openTag}\n${children.map((child) => serializeNode(child, depth + 1)).join('\n')}\n${pad}${closeTag}`;
      };
      return [...doc.childNodes].map((node) => serializeNode(node)).join('\n');
    };
    document.querySelector('[data-action="format-xml"]').addEventListener('click', () => {
      output.value = '';
      const value = input.value.trim();
      if (!value) {
        setFeedback('xml-feedback', 'Enter XML before formatting.', 'error');
        return;
      }
      try {
        output.value = formatXml(value);
        setFeedback('xml-feedback', 'XML formatted successfully.', 'success');
      } catch (error) {
        setFeedback('xml-feedback', `Invalid XML: ${error.message}`, 'error');
      }
    });
    document.querySelector('[data-action="minify-xml"]').addEventListener('click', () => {
      output.value = '';
      const value = input.value.trim();
      if (!value) {
        setFeedback('xml-feedback', 'Enter XML before minifying.', 'error');
        return;
      }
      try {
        output.value = formatXml(value, true);
        setFeedback('xml-feedback', 'XML minified successfully.', 'success');
      } catch (error) {
        setFeedback('xml-feedback', `Invalid XML: ${error.message}`, 'error');
      }
    });
    document.querySelector('[data-action="clear-xml"]').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setFeedback('xml-feedback', 'XML input cleared.', 'success');
    });
  }

  setupOutputInvalidation(slug);
}

function updatePageMetadata(path) {
  const toolSlug = path.startsWith('/tools/') ? path.slice('/tools/'.length) : '';
  const tool = toolMap.get(toolSlug);
  const page = path === '/'
    ? { title: 'DevKitra | Developer tools. Simplified.', description: 'Fast, privacy-focused browser tools for formatting, converting, decoding and generating developer data.' }
    : path === '/tools'
      ? { title: 'Developer tools | DevKitra', description: 'Browse DevKitra’s browser-based JSON, encoding, timestamp, regex, hashing, SQL and XML utilities.' }
      : path === '/about'
        ? { title: 'About DevKitra | Developer tools. Simplified.', description: 'Learn about DevKitra’s lightweight developer utilities and browser-local processing approach.' }
        : path === '/privacy'
          ? { title: 'Privacy | DevKitra', description: 'Understand how DevKitra processes data locally in your browser and what the tools do not verify.' }
            : path === '/contact'
              ? { title: 'Contact DevKitra', description: 'Contact DevKitra with questions, bug reports, and suggestions for developer tools.' }
            : tool
            ? { title: `${tool.name} | DevKitra`, description: tool.description }
            : { title: 'Page not found | DevKitra', description: 'The requested DevKitra page could not be found.' };

  document.title = page.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', page.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', page.description);

  const siteUrl = import.meta.env.VITE_SITE_URL?.trim()
    || (window.location.protocol === 'https:' ? window.location.origin : '');
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!siteUrl) {
    canonical?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
    return;
  }

  try {
    const parsedSiteUrl = new URL(siteUrl);
    if (parsedSiteUrl.protocol !== 'https:') throw new Error('VITE_SITE_URL must use HTTPS.');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    const pageUrl = new URL(path, `${parsedSiteUrl.origin}/`);
    canonical.href = pageUrl.href;

    let openGraphUrl = document.querySelector('meta[property="og:url"]');
    if (!openGraphUrl) {
      openGraphUrl = document.createElement('meta');
      openGraphUrl.setAttribute('property', 'og:url');
      document.head.append(openGraphUrl);
    }
    openGraphUrl.content = pageUrl.href;
  } catch (error) {
    canonical?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
    console.error(`Unable to set canonical metadata: ${error.message}`);
  }
}

function renderCurrentPage() {
  const path = normalizePath();
  setTheme(getTheme());
  updatePageMetadata(path);
  const isTool = path.startsWith('/tools/') && toolMap.has(path.replace('/tools/', ''));

  app.innerHTML = `${renderHeader()}${
    path === '/tools'
      ? renderToolsDirectoryPage()
      : path === '/about'
        ? renderAboutPage()
        : path === '/privacy'
          ? renderPrivacyPage()
            : path === '/contact'
              ? renderContactPage()
            : isTool
            ? renderToolPageContent(path.replace('/tools/', ''))
            : path === '/'
              ? renderHomePage()
              : renderNotFoundPage()
  }${renderFooter()}</div></div>`;

  setupGlobalSearch();
  setupThemeToggle();
  setupNavigationToggle();
  setupHomeSearch();
  if (path === '/tools') setupDirectory();

  if (isTool) {
    const slug = path.replace('/tools/', '');
    bindToolActions(slug);
  }
}

window.addEventListener('popstate', renderCurrentPage);
setupRouteHandling();
renderCurrentPage();
