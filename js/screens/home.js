import { h, icon } from '../ui.js';
import { factOfTheDay } from '../data/facts.js';
import { MODULES } from '../data/modules.js';

const TOOLS = [
  { id: 'sip', name: 'SIP Calculator', emoji: '📈', desc: 'See your money grow' },
  { id: 'fire', name: 'FIRE Calculator', emoji: '🔥', desc: 'When can you retire?' },
  { id: 'opportunity', name: 'Opportunity Cost', emoji: '⏳', desc: 'The true cost of a spend' },
  { id: 'budget', name: 'Budget Planner', emoji: '🧮', desc: '50/30/20, your way' },
  { id: 'stress', name: 'Stress Test', emoji: '🌊', desc: 'Survive a crash' },
  { id: 'decoder', name: 'Instrument Decoder', emoji: '🔎', desc: '19 instruments' },
];

export function renderHome(nav) {
  const wrap = h('div.fade-up');

  // Hero
  wrap.appendChild(h('section.hero', {}, [h('div.container', {}, [
    h('span.hero-eyebrow', {}, [icon('i-bolt'), 'No login · No data collected · Free forever']),
    h('h1', {}, 'Your money is making decisions. Are you?'),
    h('p.lead', {}, 'Free financial tools for India’s next generation of investors — powered by the science of how people actually decide.'),
    h('div.hero-cta', {}, [
      h('button.btn.btn-filled', { onclick: () => nav('simulate') }, ['Try the Simulator', icon('i-arrow')]),
      h('button.btn.btn-tonal', { onclick: () => nav('learn') }, ['Start Learning']),
    ]),
  ])]));

  // Today's fact
  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [
    h('div.fact-card', {}, [
      h('div.k', {}, "Today’s Financial Fact"),
      h('p.fact-text', {}, factOfTheDay()),
    ]),
  ])]));

  // Popular tools
  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [
    h('div.row.between', { style: 'margin-bottom:12px' }, [h('h2', { style: 'margin:0' }, 'Popular tools'), h('button.btn.btn-text', { onclick: () => nav('simulate') }, ['See all', icon('i-arrow')])]),
    h('div.hscroll', {}, TOOLS.map(t => h('div.card.card-hover', {
      style: 'width:190px',
      onclick: () => nav(t.id === 'decoder' ? 'decode' : 'simulate', t.id === 'decoder' ? null : t.id),
    }, [
      h('div', { style: 'font-size:2rem' }, t.emoji),
      h('h3', { style: 'margin:8px 0 2px;font-size:1rem' }, t.name),
      h('p.muted', { style: 'margin:0;font-size:.85rem' }, t.desc),
    ]))),
  ])]));

  // Did you know — featured modules
  const featured = [MODULES[1], MODULES[8], MODULES[9]]; // compounding, inflation, wants-needs
  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [
    h('div.row.between', { style: 'margin-bottom:12px' }, [h('h2', { style: 'margin:0' }, 'Did you know?'), h('button.btn.btn-text', { onclick: () => nav('learn') }, ['All lessons', icon('i-arrow')])]),
    h('div.grid.grid-3', {}, featured.map(m => moduleCard(m, nav))),
  ])]));

  // Behaviour hook banner
  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [
    h('div.card.card-elevated', { style: 'display:flex;gap:16px;align-items:center;flex-wrap:wrap' }, [
      h('div', { style: 'font-size:2.4rem' }, '🧠'),
      h('div', { style: 'flex:1;min-width:220px' }, [
        h('div.eyebrow', {}, 'Behaviour Lab'),
        h('h3', { style: 'margin:2px 0 4px' }, 'Money is 80% psychology'),
        h('p.muted', { style: 'margin:0' }, 'Every lesson and tool here is built on real behavioural-science research — loss aversion, present bias, mental accounting — so you understand not just the maths, but your own mind.'),
      ]),
      h('button.btn.btn-outline', { onclick: () => nav('learn', 'wants-needs') }, ['Explore']),
    ]),
  ])]));

  wrap.appendChild(footer(nav));
  return wrap;
}

export function moduleCard(m, nav) {
  return h('div.card.card-hover.module-card', { onclick: () => nav('learn', m.id) }, [
    h('div.thumb', { style: `background:${m.tint}` }, m.emoji),
    h('div.meta', {}, [h('span.chip.chip-cat.' + m.category.replace(/\s/g, '-'), {}, m.category), h('span', {}, `${m.read} min read`)]),
    h('h3', {}, m.title),
    h('p.muted', { style: 'margin:0;font-size:.9rem' }, m.summary),
  ]);
}

export function footer(nav) {
  return h('footer.footer', {}, [h('div.container', {}, [
    h('div.cols', {}, [
      h('div', {}, [
        h('div.brand', { style: 'margin-bottom:8px' }, [h('span.logo', { html: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 3 19h18z"/><path fill="#e07b1a" d="M12 8 8 16h8z"/></svg>' }), h('span', {}, 'Prism')]),
        h('p.muted', { style: 'font-size:.9rem;max-width:38ch' }, 'Financial literacy is a right, not a privilege. Built for Gen Z India — no signup, no agenda.'),
      ]),
      h('div', {}, [
        h('div.eyebrow', { style: 'margin-bottom:6px' }, 'Explore'),
        h('a', { onclick: () => nav('simulate'), role: 'button', tabindex: '0' }, 'Simulate'),
        h('a', { onclick: () => nav('learn'), role: 'button', tabindex: '0' }, 'Learn'),
        h('a', { onclick: () => nav('decode'), role: 'button', tabindex: '0' }, 'Decode'),
      ]),
      h('div', {}, [
        h('div.eyebrow', { style: 'margin-bottom:6px' }, 'More'),
        h('a', { onclick: () => nav('about'), role: 'button', tabindex: '0' }, 'About'),
        h('a', { onclick: () => nav('about', 'disclaimer'), role: 'button', tabindex: '0' }, 'Disclaimers'),
        h('a', { href: 'https://www.mutualfundssahihai.com', target: '_blank', rel: 'noopener' }, 'Mutual Fund Sahi Hai ↗'),
      ]),
    ]),
    h('div.legal', { html: '<b>Prism is a financial education platform.</b> We do not provide investment advice. We are not a SEBI Registered Investment Advisor (RIA). All calculators are for learning purposes only. Mutual Fund investments are subject to market risks; please read all scheme-related documents carefully.' }),
  ])]);
}
