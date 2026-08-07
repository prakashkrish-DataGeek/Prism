import { h, icon, slider, moneyField, behaviourLab, moduleDisclaimer, share, toast } from '../ui.js';
import { MODULES, moduleById, EXPENSES } from '../data/modules.js';
import * as F from '../finance.js';
import * as C from '../charts.js';
import { footer, moduleCard } from './home.js';

const CATS = ['All', 'Basics', 'Investing', 'Tax', 'Behaviour', 'India-Specific'];
const RET = { primary: '#1d6b3a', accent: '#e07b1a', grey: '#8a938a', blue: '#2f6fd0' };

export function renderLearn(nav, sub) {
  if (sub) { const m = moduleById(sub); if (m) return renderArticle(m, nav); }
  return renderGrid(nav);
}

function renderGrid(nav) {
  const wrap = h('div.fade-up');
  let cat = 'All';
  const grid = h('div.grid.grid-3');
  const chips = h('div.chips', { style: 'margin:16px 0' }, CATS.map(c =>
    h('button.chip' + (c === cat ? '.selected' : ''), { onclick: (e) => { cat = c; [...e.target.parentElement.children].forEach(x => x.classList.remove('selected')); e.target.classList.add('selected'); paint(); } }, c.replace('-', ' '))));
  function paint() {
    grid.replaceChildren(...MODULES.filter(m => cat === 'All' || m.category === cat).map(m => moduleCard(m, nav)));
  }
  paint();
  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [
    h('div.eyebrow', {}, 'Prism University'),
    h('h1', { style: 'margin-top:4px' }, 'Learn'),
    h('p.lead', { style: 'max-width:52ch' }, 'Ten free lessons on money and the mind. No jargon, no paywalls, no account needed. Each one ends with something you can actually do.'),
    chips, grid,
  ])]));
  wrap.appendChild(footer(nav));
  return wrap;
}

function renderArticle(m, nav) {
  const wrap = h('div.fade-up');
  const art = h('article.article');

  art.appendChild(h('button.btn.btn-text', { onclick: () => nav('learn'), style: 'padding-left:0;margin-bottom:6px' }, ['← All lessons']));
  art.appendChild(h('div.row', { style: 'gap:8px;margin-bottom:6px' }, [
    h('span.chip.chip-cat.' + m.category.replace(/\s/g, '-'), {}, m.category),
    h('span.muted', { style: 'font-size:.85rem' }, `${m.read} min read · Lesson ${m.n} of 10`),
  ]));
  art.appendChild(h('h1', {}, m.title));

  m.body.forEach(block => {
    if (block.lede) art.appendChild(h('p.lede', {}, block.lede));
    else if (block.h2) art.appendChild(h('h2', {}, block.h2));
    else if (block.p) art.appendChild(h('p', { html: block.p }));
    else if (block.ul) art.appendChild(h('ul', {}, block.ul.map(li => h('li', { html: li }))));
    else if (block.lab) art.appendChild(behaviourLab(block.lab.title, block.lab.body, block.lab.cite));
    else if (block.interactive) art.appendChild(buildInteractive(block.interactive));
    else if (block.takeaway) art.appendChild(h('div.takeaway', {}, [
      h('div.k', {}, [icon('i-star'), 'Key Takeaway']),
      h('p', {}, block.takeaway),
    ]));
  });

  // Share + CTA
  art.appendChild(h('div.row', { style: 'gap:10px;margin:22px 0 6px' }, [
    h('button.btn.btn-tonal', { onclick: () => share(m.share) }, [icon('i-share'), 'Share this insight']),
    ctaButton(m, nav),
  ]));
  art.appendChild(moduleDisclaimer());

  // Next lesson
  const next = MODULES[(m.n) % MODULES.length];
  art.appendChild(h('div.card.card-hover', { style: 'margin-top:20px', onclick: () => nav('learn', next.id) }, [
    h('div.muted', { style: 'font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em' }, 'Next lesson →'),
    h('h3', { style: 'margin:4px 0 0' }, `${next.emoji} ${next.title}`),
  ]));

  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [art])]));
  wrap.appendChild(footer(nav));
  return wrap;
}

function ctaButton(m, nav) {
  const map = { classifier: ['budget', 'Try the Budget Planner'], compound: ['sip', 'Try the SIP Calculator'], sipfd: ['sip', 'Compare SIP vs FD'], ter: ['sip', 'See the cost drag'], elss: ['fire', 'Plan with ELSS'], epf: ['fire', 'Try the FIRE tool'], inflation: ['opportunity', 'Try Opportunity Cost'] };
  const inter = m.body.find(b => b.interactive)?.interactive;
  const target = map[inter] || ['sip', 'Open the Simulator'];
  return h('button.btn.btn-filled', { onclick: () => nav('simulate', target[0]) }, [target[1], icon('i-arrow')]);
}

/* ---------------- Interactive widgets ---------------- */
function buildInteractive(kind) {
  switch (kind) {
    case 'classifier': return classifier();
    case 'compound': return compoundSlider();
    case 'sipfd': return sipVsFd();
    case 'ter': return terDrag();
    case 'elss': return elssCalc();
    case 'epf': return epfCalc();
    case 'inflation': return inflationWidget();
    default: return h('div');
  }
}

function widgetShell(title, ...kids) {
  return h('div.card', { style: 'margin:22px 0' }, [
    h('div.eyebrow', { style: 'margin-bottom:8px' }, ['🧪 Try it · ' + title]),
    ...kids,
  ]);
}

/* Drag-and-drop wants vs needs */
function classifier() {
  const pool = h('div.drag-pool');
  const needZone = h('div.dropzone', { dataset: { bucket: 'need' } }, [h('h4', {}, '✅ Needs')]);
  const wantZone = h('div.dropzone', { dataset: { bucket: 'want' } }, [h('h4', {}, '✨ Wants')]);
  const score = h('p.muted', { style: 'text-align:center;margin:8px 0 0' }, 'Drag each expense into a bucket.');
  let placed = 0, correct = 0;

  const items = EXPENSES.slice(0, 10);
  items.forEach((it, i) => {
    const el = h('div.drag-item', { draggable: 'true', dataset: { hint: it.hint } }, it.t);
    el.addEventListener('dragstart', e => { e.dataTransfer.setData('text', it.t); el.classList.add('dragging'); window.__drag = { el, hint: it.hint }; });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    // touch fallback: tap to cycle need/want
    el.addEventListener('click', () => {
      if (el.parentElement === pool) { placeInto(needZone, el); }
      else if (el.parentElement === needZone) { placeInto(wantZone, el); }
      else { pool.appendChild(el); recount(); }
    });
    pool.appendChild(el);
  });

  [needZone, wantZone].forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('over'); if (window.__drag) { placeInto(zone, window.__drag.el); } });
  });

  function placeInto(zone, el) { zone.appendChild(el); recount(); }
  function recount() {
    placed = needZone.querySelectorAll('.drag-item').length + wantZone.querySelectorAll('.drag-item').length;
    correct = 0;
    needZone.querySelectorAll('.drag-item').forEach(e => { if (e.dataset.hint === 'need') correct++; });
    wantZone.querySelectorAll('.drag-item').forEach(e => { if (e.dataset.hint === 'want') correct++; });
    if (placed === items.length) score.innerHTML = `You matched <b>${correct}/${items.length}</b>. There are no wrong answers for your life — but noticing the difference is the whole point.`;
    else score.textContent = `${placed}/${items.length} sorted — keep going.`;
  }

  return widgetShell('Wants vs Needs classifier',
    h('p.muted', { style: 'margin-top:0;font-size:.88rem' }, 'On mobile, tap an item to move it between buckets.'),
    pool,
    h('div.classifier', { style: 'margin-top:14px' }, [needZone, wantZone]),
    score,
  );
}

/* Compound effect slider */
function compoundSlider() {
  const s = { monthly: 2000, years: 20 };
  const out = h('div');
  const render = () => {
    const r = F.sip(s.monthly, s.years, 12);
    out.replaceChildren(
      h('div.stat-grid', {}, [
        stat('You invest', F.inr(r.invested)),
        stat('Becomes', F.inr(r.corpus), 'pos'),
        stat('Pure compounding', F.inr(r.gains), 'accent'),
      ]),
      h('div.chart-wrap', { style: 'margin-top:12px' }, [C.lineChart([
        { label: 'Corpus', color: RET.primary, area: true, points: r.series.map(p => ({ x: p.year, y: p.corpus })) },
        { label: 'Invested', color: RET.grey, points: r.series.map(p => ({ x: p.year, y: p.invested })) },
      ], { fmtY: F.inr, xUnit: 'y', area: true })]),
      C.legend([{ label: 'Corpus', color: RET.primary }, { label: 'Invested', color: RET.grey }]),
    );
  };
  const w = widgetShell('Watch money grow (12% assumed)',
    slider({ label: 'Monthly investment', min: 500, max: 20000, step: 500, value: s.monthly, format: F.inr, onInput: v => { s.monthly = v; render(); } }),
    slider({ label: 'Years', min: 5, max: 40, step: 1, value: s.years, format: v => v + ' yr', onInput: v => { s.years = v; render(); } }),
    out);
  render();
  return w;
}

/* SIP vs FD side-by-side */
function sipVsFd() {
  const s = { monthly: 5000, years: 10 };
  const out = h('div');
  const render = () => {
    const sip = F.sip(s.monthly, s.years, 11);
    const fd = F.rdFD(s.monthly, s.years, 7);
    const fdPostTax = F.rdFD(s.monthly, s.years, 7 * 0.7); // 30% slab approx
    out.replaceChildren(
      h('div.grid.grid-2', {}, [
        stat('SIP @ 11%', F.inr(sip.corpus), 'pos'),
        stat('FD @ 7% (post-tax)', F.inr(fdPostTax.corpus), 'neg'),
      ]),
      h('p.muted', { style: 'margin:10px 0 0', html: `Same ${F.inr(s.monthly)}/mo. The equity route ends about <b>${F.inr(sip.corpus - fdPostTax.corpus)}</b> ahead over ${s.years} years — before counting inflation, which eats the FD further.` }),
    );
  };
  const w = widgetShell('SIP vs FD (same monthly amount)',
    slider({ label: 'Monthly', min: 1000, max: 25000, step: 1000, value: s.monthly, format: F.inr, onInput: v => { s.monthly = v; render(); } }),
    slider({ label: 'Years', min: 3, max: 25, step: 1, value: s.years, format: v => v + ' yr', onInput: v => { s.years = v; render(); } }),
    out);
  render();
  return w;
}

/* Direct vs Regular TER drag */
function terDrag() {
  const s = { monthly: 5000, years: 20 };
  const out = h('div');
  const render = () => {
    const r = F.terDrag(s.monthly, s.years, 12, 0.4, 1.5);
    out.replaceChildren(
      h('div.grid.grid-2', {}, [stat('Direct plan', F.inr(r.direct), 'pos'), stat('Regular plan', F.inr(r.regular), 'neg')]),
      h('p', { style: 'margin:10px 0 0;font-weight:600', html: `The ~1.1% extra fee quietly costs you <b style="color:var(--md-error)">${F.inr(r.lost)}</b> over ${s.years} years — same fund, same manager.` }),
    );
  };
  const w = widgetShell('Direct vs Regular expense drag',
    slider({ label: 'Monthly SIP', min: 1000, max: 25000, step: 1000, value: s.monthly, format: F.inr, onInput: v => { s.monthly = v; render(); } }),
    slider({ label: 'Years', min: 5, max: 30, step: 1, value: s.years, format: v => v + ' yr', onInput: v => { s.years = v; render(); } }),
    out);
  render();
  return w;
}

/* ELSS tax saved */
function elssCalc() {
  const s = { invest: 150000, slab: 30 };
  const out = h('div');
  const render = () => {
    const saved = F.taxSaved(s.invest, s.slab);
    const grown = F.lumpsum(s.invest, 3, 11).corpus;
    out.replaceChildren(h('div.stat-grid', {}, [
      stat('Tax saved this year', F.inr(saved), 'accent'),
      stat('Value after 3-yr lock', F.inr(grown), 'pos'),
    ]));
  };
  const slabChips = h('div.chips', {}, [5, 20, 30].map(p => h('button.chip' + (p === s.slab ? '.selected' : ''), { onclick: e => { s.slab = p; [...e.target.parentElement.children].forEach(x => x.classList.remove('selected')); e.target.classList.add('selected'); render(); } }, p + '% slab')));
  const w = widgetShell('ELSS tax-saving',
    slider({ label: 'ELSS investment (80C)', min: 10000, max: 150000, step: 10000, value: s.invest, format: F.inr, onInput: v => { s.invest = v; render(); } }),
    h('div.field-label', { style: 'margin-bottom:8px' }, [h('span', {}, 'Your tax slab')]), slabChips, out);
  render();
  return w;
}

/* EPF corpus */
function epfCalc() {
  const s = { basic: 30000, years: 30 };
  const out = h('div');
  const render = () => {
    const r = F.epf({ monthlyBasic: s.basic, years: s.years });
    out.replaceChildren(h('div.stat-grid', {}, [
      stat('Monthly contribution', F.inr(r.contribMonthly)),
      stat('EPF corpus at retirement', F.inr(r.corpus), 'pos'),
    ]), h('p.muted', { style: 'margin:8px 0 0' }, 'Half of that monthly contribution comes from your employer — money you’d never otherwise see.'));
  };
  const w = widgetShell('EPF corpus estimator',
    slider({ label: 'Monthly basic salary', min: 15000, max: 150000, step: 5000, value: s.basic, format: F.inr, onInput: v => { s.basic = v; render(); } }),
    slider({ label: 'Years to retirement', min: 5, max: 40, step: 1, value: s.years, format: v => v + ' yr', onInput: v => { s.years = v; render(); } }),
    out);
  render();
  return w;
}

/* Inflation purchasing power */
function inflationWidget() {
  const s = { amount: 100000, inflation: 6 };
  const out = h('div');
  const render = () => {
    out.replaceChildren(h('div.stat-grid', {}, [
      stat('Today', F.inr(s.amount)),
      stat('In 10 years buys', F.inr(F.realValue(s.amount, 10, s.inflation)), 'neg'),
      stat('In 20 years buys', F.inr(F.realValue(s.amount, 20, s.inflation)), 'neg'),
    ]));
  };
  const w = widgetShell('What your money will buy',
    slider({ label: 'Amount today', min: 10000, max: 1000000, step: 10000, value: s.amount, format: F.inr, onInput: v => { s.amount = v; render(); } }),
    slider({ label: 'Inflation', min: 3, max: 9, step: 1, value: s.inflation, format: v => v + '%', onInput: v => { s.inflation = v; render(); } }),
    out);
  render();
  return w;
}

function stat(label, value, cls) { return h('div.stat', {}, [h('div.label', {}, label), h('div.value' + (cls ? '.' + cls : ''), {}, value)]); }
