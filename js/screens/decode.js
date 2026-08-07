import { h, icon, instrumentDisclaimer } from '../ui.js';
import { INSTRUMENTS, CATEGORIES, instrumentById } from '../data/instruments.js';
import { footer } from './home.js';

export function renderDecode(nav, sub) {
  if (sub) { const i = instrumentById(sub); if (i) return renderDetail(i, nav); }
  return renderList(nav);
}

function fuzzy(q, i) {
  q = q.toLowerCase().trim();
  if (!q) return true;
  return (i.name + ' ' + i.tldr + ' ' + i.cat + ' ' + i.explain).toLowerCase().includes(q)
    || q.split(' ').every(w => (i.name + ' ' + i.cat).toLowerCase().includes(w));
}

function riskMeter(risk) {
  const m = h('div.risk-meter');
  for (let i = 1; i <= 5; i++) m.appendChild(h('span', { class: 'risk-dot' + (i <= risk ? ' on-' + risk : '') }));
  m.appendChild(h('span.muted', { style: 'font-size:.72rem;margin-left:4px' }, ['Very low', 'Low', 'Moderate', 'High', 'Very high'][risk - 1]));
  return m;
}

function renderList(nav) {
  const wrap = h('div.fade-up');
  let query = '', cat = 'All';
  const grid = h('div.grid.grid-3', { style: 'margin-top:16px' });

  const searchInput = h('input', { placeholder: 'Search 19 instruments… (e.g. "gold", "tax", "safe")', 'aria-label': 'Search instruments' });
  searchInput.addEventListener('input', () => { query = searchInput.value; paint(); });
  const searchBar = h('div.search-bar', {}, [icon('i-search'), searchInput]);

  const chips = h('div.chips', { style: 'margin:12px 0 0' }, CATEGORIES.map(c =>
    h('button.chip' + (c === cat ? '.selected' : ''), { onclick: e => { cat = c; [...e.target.parentElement.children].forEach(x => x.classList.remove('selected')); e.target.classList.add('selected'); paint(); } }, c)));

  function paint() {
    const list = INSTRUMENTS.filter(i => (cat === 'All' || i.cat === cat) && fuzzy(query, i));
    grid.replaceChildren(...(list.length ? list.map(i => card(i, nav)) : [h('p.muted', { style: 'padding:20px' }, 'No instruments match. Try a different word.')]));
  }
  paint();

  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [
    h('div.eyebrow', {}, 'Instrument Decoder'),
    h('h1', { style: 'margin-top:4px' }, 'Decode'),
    h('p.lead', { style: 'max-width:54ch' }, 'Nineteen ways Indians grow (and sometimes lose) money — explained in plain English, with the risks front and centre.'),
    searchBar, chips, grid,
    instrumentDisclaimer(),
  ])]));
  wrap.appendChild(footer(nav));
  return wrap;
}

function card(i, nav) {
  return h('div.card.card-hover', { onclick: () => nav('decode', i.id), style: 'display:flex;flex-direction:column;gap:8px' }, [
    h('div.row.between', {}, [h('div', { style: 'font-size:1.8rem' }, i.emoji), i.warn ? h('span.tag.warn', {}, '⚠ High caution') : h('span.chip.chip-static.chip-cat', {}, i.cat)]),
    h('h3', { style: 'margin:2px 0 0;font-size:1.05rem' }, i.name),
    h('p.muted', { style: 'margin:0;font-size:.88rem;flex:1' }, i.tldr),
    riskMeter(i.risk),
  ]);
}

function renderDetail(i, nav) {
  const wrap = h('div.fade-up');
  const body = h('div', { style: 'max-width:760px;margin:0 auto' }, [
    h('button.btn.btn-text', { onclick: () => nav('decode'), style: 'padding-left:0' }, ['← All instruments']),
    h('div.row', { style: 'gap:14px;align-items:flex-start' }, [
      h('div', { style: 'font-size:3rem' }, i.emoji),
      h('div', { style: 'flex:1' }, [
        h('h1', { style: 'margin:0 0 6px' }, i.name),
        h('p.muted', { style: 'margin:0' }, i.tldr),
        h('div', { style: 'margin-top:10px' }, [riskMeter(i.risk)]),
      ]),
    ]),
    i.warn ? h('div.banner.banner-error', { style: 'margin-top:16px' }, [icon('i-info'), h('span', { html: '<b>High-caution instrument.</b> Read the risks carefully. This is not an endorsement.' })]) : null,
    h('p', { style: 'margin-top:16px;font-size:1.05rem' }, i.explain),
    h('div.card', { style: 'margin-top:16px' }, [
      h('dl.kv', {}, [
        h('dt', {}, 'Ideal horizon'), h('dd', {}, i.horizon),
        h('dt', {}, 'Liquidity'), h('dd', {}, i.liquidity),
        h('dt', {}, 'Taxation'), h('dd', {}, i.taxation),
        h('dt', {}, 'Category'), h('dd', {}, i.cat),
      ]),
    ]),
    h('div.grid.grid-2', { style: 'margin-top:16px' }, [
      h('div.card', {}, [h('h3', { style: 'margin-top:0;color:var(--md-primary)' }, '👍 Where it shines'), h('ul', { style: 'margin:0;padding-left:18px' }, i.good.map(g => h('li', {}, g)))]),
      h('div.card', {}, [h('h3', { style: 'margin-top:0;color:var(--saffron)' }, '👀 Watch out for'), h('ul', { style: 'margin:0;padding-left:18px' }, i.watch.map(w => h('li', {}, w)))]),
    ]),
    instrumentDisclaimer(),
  ]);
  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [body])]));
  wrap.appendChild(footer(nav));
  return wrap;
}
