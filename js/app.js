/* ============================================================
   app.js — router, navigation, theme, PWA registration
   ============================================================ */
import { renderHome } from './screens/home.js';
import { renderSimulate } from './screens/simulate.js';
import { renderLearn } from './screens/learn.js';
import { renderDecode } from './screens/decode.js';
import { renderAbout } from './screens/about.js';

const view = document.getElementById('view');
const progress = document.getElementById('readingProgress');

const ROUTES = {
  home: renderHome,
  simulate: renderSimulate,
  learn: renderLearn,
  decode: renderDecode,
  about: renderAbout,
};

/** Navigate to a screen (updates the hash, which triggers render). */
function nav(screen, sub) {
  const hash = '#/' + screen + (sub ? '/' + sub : '');
  if (location.hash === hash) render(); // same hash: force re-render
  else location.hash = hash;
}

function parseHash() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const screen = parts[0] || 'home';
  return { screen: ROUTES[screen] ? screen : 'home', sub: parts[1] || null };
}

// Take control of scroll position ourselves (SPA hash routing).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

function render() {
  const { screen, sub } = parseHash();
  view.replaceChildren(ROUTES[screen](nav, sub));
  // update active nav states
  document.querySelectorAll('[data-link]').forEach(a => a.classList.toggle('active', a.dataset.link === screen));
  // reset scroll + focus for a11y (unless the screen requested an in-page anchor)
  if (sub !== 'disclaimer') {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }
  view.focus({ preventScroll: true });
  progress.style.width = '0';
}

/* ---- nav wiring ---- */
document.querySelectorAll('[data-link]').forEach(a => {
  const go = () => nav(a.dataset.link);
  a.addEventListener('click', go);
  a.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
});

/* ---- reading progress bar (article pages) ---- */
window.addEventListener('scroll', () => {
  const article = document.querySelector('.article');
  if (!article) { progress.style.width = '0'; return; }
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0) + '%';
}, { passive: true });

/* ---- theme ---- */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon').querySelector('use');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  themeIcon.setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#111612' : '#1d6b3a');
}
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let manual = localStorage.getItem('prism-theme'); // null unless user toggled
applyTheme(manual || (systemDark.matches ? 'dark' : 'light'));
// Follow the system setting until the user makes a manual choice.
systemDark.addEventListener?.('change', e => { if (!manual) applyTheme(e.matches ? 'dark' : 'light'); });
themeToggle.addEventListener('click', () => {
  manual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(manual);
  try { localStorage.setItem('prism-theme', manual); } catch {}
});

/* ---- routing ---- */
window.addEventListener('hashchange', render);
if (!location.hash) location.hash = '#/home';
render();

/* ---- PWA service worker ---- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
