import { h, icon, slider, moneyField, banner, resultDisclaimer, behaviourLab } from '../ui.js';
import * as F from '../finance.js';
import * as C from '../charts.js';
import { footer } from './home.js';

const TABS = [
  { id: 'sip', label: 'SIP', build: sipTab },
  { id: 'lumpsip', label: 'Lumpsum vs SIP', build: lumpSipTab },
  { id: 'fire', label: 'FIRE', build: fireTab },
  { id: 'opportunity', label: 'Opportunity Cost', build: oppTab },
  { id: 'budget', label: 'Budget', build: budgetTab },
  { id: 'stress', label: 'Stress Test', build: stressTab },
];

const RET = { primary: '#1d6b3a', accent: '#e07b1a', blue: '#2f6fd0', grey: '#8a938a' };

export function renderSimulate(nav, sub) {
  const wrap = h('div.fade-up');
  wrap.appendChild(h('section.section', {}, [h('div.container', {}, [
    h('div.eyebrow', {}, 'Investment Playground'),
    h('h1', { style: 'margin-top:4px' }, 'Simulate'),
    banner('<b>This is a learning simulator.</b> No real money, no real accounts — just the maths, so you can see how choices play out.'),
  ])]));

  const container = h('div.container');
  const panel = h('div', { style: 'margin-top:8px' });

  const start = TABS.findIndex(t => t.id === sub);
  let activeIndex = start >= 0 ? start : 0;

  const tabBar = h('div.tabs', { role: 'tablist' }, TABS.map((t, i) =>
    h('button.tab', { role: 'tab', onclick: () => select(i) }, t.label)));

  function select(i) {
    activeIndex = i;
    [...tabBar.children].forEach((b, idx) => b.classList.toggle('active', idx === i));
    panel.replaceChildren(TABS[i].build(nav));
    panel.classList.remove('fade-up'); void panel.offsetWidth; panel.classList.add('fade-up');
  }

  container.append(tabBar, panel);
  wrap.appendChild(h('section.section', { style: 'padding-top:0' }, [container]));
  wrap.appendChild(footer(nav));
  select(activeIndex);
  return wrap;
}

/* ---------------- Tab 1: SIP ---------------- */
function sipTab() {
  const state = { monthly: 5000, years: 15, rate: 11, compareFD: false };
  const out = h('div');

  const presets = h('div.chips', { style: 'margin-top:8px' }, [
    ['₹1,000 · 10y', 1000, 10], ['₹5,000 · 20y', 5000, 20], ['₹500 · 30y', 500, 30],
  ].map(([lbl, m, y]) => h('button.chip', { onclick: () => { state.monthly = m; state.years = y; sM.querySelector('input').value = m; sY.querySelector('input').value = y; sM.querySelector('.field-value').textContent = F.inr(m); sY.querySelector('.field-value').textContent = y + ' yr'; render(); } }, lbl)));

  const rateChips = h('div.chips', {}, [['Conservative', 8], ['Moderate', 11], ['Aggressive', 14]].map(([lbl, r]) =>
    h('button.chip' + (state.rate === r ? '.selected' : ''), { onclick: (e) => { state.rate = r; [...e.target.parentElement.children].forEach(c => c.classList.remove('selected')); e.target.classList.add('selected'); render(); } }, `${lbl} ${r}%`)));

  const sM = slider({ label: 'Monthly SIP', min: 500, max: 50000, step: 500, value: state.monthly, format: F.inr, onInput: v => { state.monthly = v; render(); } });
  const sY = slider({ label: 'Duration', min: 1, max: 30, step: 1, value: state.years, format: v => v + ' yr', onInput: v => { state.years = v; render(); } });

  const inputs = h('div.card', {}, [sM, sY,
    h('div.field-label', { style: 'margin-bottom:8px' }, [h('span', {}, 'Expected return')]), rateChips,
    h('div.field-label', { style: 'margin:14px 0 8px' }, [h('span', {}, 'Quick scenarios')]), presets,
    h('label.row', { style: 'margin-top:14px;cursor:pointer;gap:8px' }, [h('input', { type: 'checkbox', onchange: e => { state.compareFD = e.target.checked; render(); } }), h('span', { style: 'font-weight:600' }, 'Compare vs Fixed Deposit @ 7%')]),
  ]);

  const result = h('div.card.card-elevated');

  function render() {
    const r = F.sip(state.monthly, state.years, state.rate);
    const donut = C.donut([
      { label: 'Invested', value: r.invested, color: RET.grey },
      { label: 'Returns', value: r.gains, color: RET.primary },
    ], { centerLabel: 'Corpus', centerValue: F.inr(r.corpus) });

    const series = [
      { label: 'Corpus', color: RET.primary, area: true, points: r.series.map(s => ({ x: s.year, y: s.corpus })) },
      { label: 'Invested', color: RET.grey, points: r.series.map(s => ({ x: s.year, y: s.invested })) },
    ];
    const legendItems = [{ label: 'Corpus', color: RET.primary }, { label: 'Invested', color: RET.grey }];
    if (state.compareFD) {
      const fd = F.rdFD(state.monthly, state.years, 7);
      series.push({ label: 'FD @ 7%', color: RET.accent, dashed: true, points: fd.series.map(s => ({ x: s.year, y: s.corpus })) });
      legendItems.push({ label: 'FD @ 7%', color: RET.accent });
    }

    result.replaceChildren(
      h('div', { style: 'display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center' }, [
        donut,
        h('div', { style: 'flex:1;min-width:200px' }, [
          h('div.stat-grid', {}, [
            statBox('You invest', F.inr(r.invested), ''),
            statBox('Returns generated', F.inr(r.gains), 'pos'),
            statBox('Final corpus', F.inr(r.corpus), 'accent'),
            statBox('Growth multiple', (r.corpus / r.invested).toFixed(1) + '×', 'pos'),
          ]),
        ]),
      ]),
      h('p', { style: 'text-align:center;font-family:var(--font-display);font-weight:600;margin:18px 0 6px', html: `You invest <b>${F.inr(r.invested)}</b>, you get <b style="color:var(--md-primary)">${F.inr(r.corpus)}</b>. Your money worked harder than you did 🚀` }),
      h('div.chart-wrap', { style: 'margin-top:10px' }, [C.lineChart(series, { fmtY: F.inr, xUnit: 'y', dashed: true, area: true })]),
      C.legend(legendItems),
      behaviourLab('Compounding is back-loaded', 'Notice how the corpus curve is nearly flat for years, then bends sharply upward. That’s why so many people quit early — the exciting growth arrives last. Staying invested through the boring middle is the whole skill.', 'See Module 2 · Present bias (Laibson, 1997).'),
      resultDisclaimer(),
    );
  }

  render();
  return grid2(inputs, h('div', {}, [result]));
}

/* ---------------- Tab 2: Lumpsum vs SIP ---------------- */
function lumpSipTab() {
  const state = { amount: 600000, years: 10, rate: 11 };
  const inputs = h('div.card', {}, [
    slider({ label: 'Total amount to invest', min: 50000, max: 5000000, step: 50000, value: state.amount, format: F.inr, onInput: v => { state.amount = v; render(); } }),
    slider({ label: 'Horizon', min: 1, max: 30, step: 1, value: state.years, format: v => v + ' yr', onInput: v => { state.years = v; render(); } }),
    slider({ label: 'Expected return', min: 6, max: 16, step: 1, value: state.rate, format: v => v + '%', onInput: v => { state.rate = v; render(); } }),
    banner('SIP spreads the same amount evenly over the whole period, so it buys through the dips too — rupee-cost averaging in action.'),
  ]);
  const result = h('div.card.card-elevated');
  function render() {
    const lump = F.lumpsum(state.amount, state.years, state.rate);
    const monthly = state.amount / (state.years * 12);
    const sipR = F.sip(monthly, state.years, state.rate);
    const winner = lump.corpus >= sipR.corpus ? 'Lumpsum' : 'SIP';
    result.replaceChildren(
      h('div.grid.grid-2', {}, [
        h('div.stat', {}, [h('div.label', {}, 'Lumpsum today'), h('div.value.pos', {}, F.inr(lump.corpus)), h('p.muted', { style: 'margin:6px 0 0;font-size:.8rem' }, `Invest all ${F.inr(state.amount)} now`)]),
        h('div.stat', {}, [h('div.label', {}, 'SIP over ' + state.years + 'y'), h('div.value.accent', {}, F.inr(sipR.corpus)), h('p.muted', { style: 'margin:6px 0 0;font-size:.8rem' }, `${F.inr(monthly)}/mo`)]),
      ]),
      h('p', { style: 'text-align:center;margin:16px 0 6px;font-family:var(--font-display);font-weight:600', html: `In a steadily rising market, a lumpsum invested early usually wins on paper. But most people don’t have a lakh lying idle — and in <b>volatile</b> markets, SIP’s averaging cushions the ride.` }),
      h('div.chart-wrap', {}, [C.lineChart([
        { label: 'SIP', color: RET.accent, points: sipR.series.map(s => ({ x: s.year, y: s.corpus })) },
        { label: 'Lumpsum path', color: RET.primary, points: Array.from({ length: state.years + 1 }, (_, y) => ({ x: y, y: F.lumpsum(state.amount, y, state.rate).corpus })) },
      ], { fmtY: F.inr, xUnit: 'y' })]),
      C.legend([{ label: 'SIP', color: RET.accent }, { label: 'Lumpsum', color: RET.primary }]),
      behaviourLab('Regret aversion favours SIP', 'Investing a large sum right before a crash triggers intense regret — so people freeze and never invest at all. A SIP removes the single high-stakes decision, which is why most investors actually stick with it.', 'Loss & regret aversion (Kahneman & Tversky, 1979).'),
      resultDisclaimer(),
    );
  }
  render();
  return grid2(inputs, result);
}

/* ---------------- Tab 3: FIRE ---------------- */
function fireTab() {
  const s = { currentAge: 25, retireAge: 50, expense: 40000, savings: 200000, sip: 20000, rate: 11, inflation: 6 };
  const inputs = h('div.card', {}, [
    grid2f(
      moneyField({ label: 'Current age', value: s.currentAge, prefix: '🎂', onInput: v => { s.currentAge = v; render(); } }),
      moneyField({ label: 'Target retirement age', value: s.retireAge, prefix: '🏖️', onInput: v => { s.retireAge = v; render(); } }),
    ),
    moneyField({ label: 'Current monthly expenses', value: s.expense, onInput: v => { s.expense = v; render(); } }),
    grid2f(
      moneyField({ label: 'Current savings', value: s.savings, onInput: v => { s.savings = v; render(); } }),
      moneyField({ label: 'Monthly SIP you can start', value: s.sip, onInput: v => { s.sip = v; render(); } }),
    ),
    slider({ label: 'Expected annual return', min: 6, max: 15, step: 1, value: s.rate, format: v => v + '%', onInput: v => { s.rate = v; render(); } }),
    slider({ label: 'Expected inflation', min: 3, max: 9, step: 1, value: s.inflation, format: v => v + '%', onInput: v => { s.inflation = v; render(); } }),
  ]);
  const result = h('div.card.card-elevated');
  function render() {
    const r = F.fire({ currentAge: s.currentAge, retireAge: s.retireAge, monthlyExpense: s.expense, currentSavings: s.savings, monthlySip: s.sip, returnPct: s.rate, inflationPct: s.inflation });
    const bump = F.fire({ ...{ currentAge: s.currentAge, retireAge: s.retireAge, monthlyExpense: s.expense, currentSavings: s.savings, returnPct: s.rate, inflationPct: s.inflation }, monthlySip: s.sip + 500 });
    // years earlier if +500/mo: find age where bump corpus hits fireNumber
    let earlierAge = s.retireAge;
    for (const pt of bump.series) { if (pt.corpus >= r.fireNumber) { earlierAge = Math.round(pt.age); break; } }
    const yearsEarlier = Math.max(0, s.retireAge - earlierAge);

    result.replaceChildren(
      h('div.center', { style: 'margin-bottom:12px' }, [
        h('div.eyebrow', {}, 'Your FIRE Number'),
        h('div.big-number', { style: `color:${r.onTrack ? 'var(--md-primary)' : 'var(--saffron)'}` }, F.inr(r.fireNumber)),
        h('p.muted', { style: 'margin:2px 0 0;font-size:.85rem' }, `The corpus that funds ${F.inr(s.expense)}/mo (grown for inflation) using the 4% rule`),
      ]),
      h('div.stat-grid', {}, [
        statBox('Projected corpus', F.inr(r.projectedCorpus), r.onTrack ? 'pos' : ''),
        statBox(r.onTrack ? 'Surplus' : 'Shortfall', F.inr(Math.abs(r.surplus)), r.onTrack ? 'pos' : 'neg'),
        statBox('SIP to hit target', F.inr(r.requiredSip), 'accent'),
        statBox('Years to retire', r.yearsToRetire + ' yr', ''),
      ]),
      h('div.banner' + (r.onTrack ? '' : '.banner-warn'), { style: 'margin-top:14px' }, [icon('i-info'), h('span', { html: r.onTrack ? `You’re on track to retire at <b>${s.retireAge}</b> with a surplus. 🎉` : `At ${F.inr(s.sip)}/mo you fall short. Try ~<b>${F.inr(r.requiredSip)}/mo</b> to hit your number.` })]),
      yearsEarlier > 0 ? h('p', { style: 'text-align:center;margin:14px 0 4px;font-weight:600', html: `💡 Increase your SIP by just <b>₹500/mo</b> → retire about <b>${yearsEarlier} year${yearsEarlier > 1 ? 's' : ''} earlier</b>.` }) : null,
      h('div.chart-wrap', { style: 'margin-top:8px' }, [C.lineChart([
        { label: 'Corpus', color: RET.primary, area: true, points: r.series.map(p => ({ x: p.age, y: p.corpus })) },
        { label: 'FIRE target', color: RET.accent, dashed: true, points: [{ x: r.series[0]?.age || s.currentAge, y: r.fireNumber }, { x: s.retireAge, y: r.fireNumber }] },
      ], { fmtY: F.inr, fmtX: v => Math.round(v), xUnit: '', dashed: true, area: true })]),
      C.legend([{ label: 'Your corpus', color: RET.primary }, { label: 'FIRE number', color: RET.accent }]),
      h('div.banner', { style: 'margin-top:8px' }, [icon('i-info'), h('span', { html: '<b>Tax tip:</b> use ELSS for 80C (₹1.5L limit) before plain equity funds; long-term equity gains are taxed at just 12.5% above ₹1.25L/yr.' })]),
      resultDisclaimer(),
    );
  }
  render();
  return grid2(inputs, result);
}

/* ---------------- Tab 4: Opportunity Cost ---------------- */
function oppTab() {
  const s = { amount: 5000, rate: 12 };
  const input = h('div.card', {}, [
    h('h3', { style: 'margin-top:0' }, 'I’m thinking of spending…'),
    moneyField({ label: 'Amount', value: s.amount, onInput: v => { s.amount = v; render(); } }),
    h('div.field-label', { style: 'margin-bottom:8px' }, [h('span', {}, 'Quick examples')]),
    h('div.chips', {}, [['☕ ₹200', 200], ['🍽️ ₹1,500', 1500], ['📱 ₹5,000', 5000], ['✈️ ₹15,000', 15000]].map(([l, v]) =>
      h('button.chip', { onclick: () => { s.amount = v; input.querySelector('input').value = v; render(); } }, l))),
    slider({ label: 'Assumed return (CAGR)', min: 6, max: 15, step: 1, value: s.rate, format: v => v + '%', onInput: v => { s.rate = v; render(); } }),
    h('p.muted', { style: 'font-size:.85rem;margin-top:6px' }, 'We’re not saying don’t spend — just know the trade-off.'),
  ]);
  const result = h('div.card.card-elevated');
  function render() {
    const y10 = F.opportunityCost(s.amount, 10, s.rate);
    const y20 = F.opportunityCost(s.amount, 20, s.rate);
    const y30 = F.opportunityCost(s.amount, 30, s.rate);
    result.replaceChildren(
      h('p', { style: 'text-align:center;margin:0 0 6px', html: `That <b>${F.inr(s.amount)}</b>, if invested instead, could become:` }),
      h('div.stat-grid', {}, [
        statBox('In 10 years', F.inr(y10), 'pos'),
        statBox('In 20 years', F.inr(y20), 'accent'),
        statBox('In 30 years', F.inr(y30), 'pos'),
      ]),
      h('div.chart-wrap', { style: 'margin-top:14px' }, [C.lineChart([
        { label: 'Growth', color: RET.primary, area: true, points: Array.from({ length: 31 }, (_, y) => ({ x: y, y: F.opportunityCost(s.amount, y, s.rate) })) },
      ], { fmtY: F.inr, xUnit: 'y', area: true })]),
      behaviourLab('Present bias, made visible', 'Our brains discount the future steeply — ₹5,000 today feels far more real than a bigger number in 20 years. Seeing the future value on screen is a deliberate nudge to weigh the trade-off your instincts ignore.', 'Hyperbolic discounting (Frederick, Loewenstein & O’Donoghue, 2002).'),
      resultDisclaimer(),
    );
  }
  render();
  return grid2(input, result);
}

/* ---------------- Tab 5: Budget Planner ---------------- */
function budgetTab() {
  const s = { income: 50000, needs: 50, wants: 30, invest: 20 };
  const income = moneyField({ label: 'Monthly take-home income', value: s.income, onInput: v => { s.income = v; render(); } });

  const sliders = ['needs', 'wants', 'invest'].map(key => slider({
    label: key[0].toUpperCase() + key.slice(1), min: 0, max: 100, step: 5, value: s[key], format: v => v + '%',
    onInput: v => { rebalance(key, v); render(); },
  }));
  function rebalance(changed, v) {
    s[changed] = v;
    const others = ['needs', 'wants', 'invest'].filter(k => k !== changed);
    let remaining = 100 - v;
    const otherTotal = s[others[0]] + s[others[1]] || 1;
    s[others[0]] = Math.round(remaining * (s[others[0]] / otherTotal) / 5) * 5;
    s[others[1]] = 100 - v - s[others[0]];
    // sync slider UIs
    sliders.forEach((sl, i) => { const key = ['needs', 'wants', 'invest'][i]; sl.querySelector('input').value = s[key]; sl.querySelector('.field-value').textContent = s[key] + '%'; });
  }

  const inputs = h('div.card', {}, [income, h('div.field-label', { style: 'margin-bottom:8px' }, [h('span', {}, 'Adjust to my life (must total 100%)')]), ...sliders]);
  const result = h('div.card.card-elevated');
  function render() {
    const b = F.budget(s.income, { needs: s.needs, wants: s.wants, invest: s.invest });
    const total = s.needs + s.wants + s.invest;
    result.replaceChildren(
      total !== 100 ? banner(`Your split adds to <b>${total}%</b> — adjust to 100%.`, 'banner-warn') : null,
      C.bars([
        { label: `Needs (${s.needs}%)`, value: b.needs, color: RET.primary, valueText: F.inr(b.needs), sub: 'Rent, food, transport, utilities, insurance' },
        { label: `Wants (${s.wants}%)`, value: b.wants, color: RET.accent, valueText: F.inr(b.wants), sub: 'Dining out, OTT, shopping, trips' },
        { label: `Invest (${s.invest}%)`, value: b.invest, color: RET.blue, valueText: F.inr(b.invest), sub: 'SIP, PPF, emergency fund' },
      ]),
      h('div.stat', { style: 'margin-top:6px' }, [h('div.label', {}, 'Invested per year'), h('div.value.pos', {}, F.inr(b.invest * 12)), h('p.muted', { style: 'margin:4px 0 0;font-size:.82rem' }, `At 11% for 20 years that’s about ${F.inr(F.sip(b.invest, 20, 11).corpus)}.`)]),
      behaviourLab('Mental accounting works for you here', 'Splitting income into labelled buckets — needs, wants, invest — is "mental accounting". Usually a bias, but deliberately bucketing your salary the day it lands makes the invest bucket feel spent-for-a-purpose, so you’re far less likely to raid it.', 'Thaler (1999), mental accounting.'),
      resultDisclaimer(),
    );
  }
  render();
  return grid2(inputs, result);
}

/* ---------------- Tab 6: Stress Test ---------------- */
function stressTab() {
  const s = { portfolio: 500000, crash: F.CRASHES[0] };
  const cards = h('div.chips', {}, F.CRASHES.map(c =>
    h('button.chip' + (c.id === s.crash.id ? '.selected' : ''), { onclick: (e) => { s.crash = c; [...e.target.parentElement.children].forEach(x => x.classList.remove('selected')); e.target.classList.add('selected'); render(); } }, c.label)));
  const inputs = h('div.card', {}, [
    h('h3', { style: 'margin-top:0' }, 'What if the market crashed today?'),
    moneyField({ label: 'Your portfolio value', value: s.portfolio, onInput: v => { s.portfolio = v; render(); } }),
    h('div.field-label', { style: 'margin-bottom:8px' }, [h('span', {}, 'Pick a historic scenario')]), cards,
  ]);
  const result = h('div.card.card-elevated');
  function render() {
    const st = F.stressTest(s.portfolio, s.crash.drop, s.crash.recoveryMonths);
    result.replaceChildren(
      h('div.stat-grid', {}, [
        statBox('Drop', '-' + s.crash.drop + '%', 'neg'),
        statBox('Portfolio bottoms at', F.inr(st.bottom), 'neg'),
        statBox('Historic recovery', s.crash.recoveryMonths + ' months', 'pos'),
      ]),
      h('p.muted', { style: 'margin:12px 0 6px' }, s.crash.note),
      h('div.chart-wrap', {}, [C.lineChart([
        { label: 'Recovery', color: RET.primary, area: true, points: st.path.map(p => ({ x: p.month, y: p.value })) },
        { label: 'Pre-crash', color: RET.grey, dashed: true, points: [{ x: 0, y: s.portfolio }, { x: s.crash.recoveryMonths, y: s.portfolio }] },
      ], { fmtY: F.inr, xUnit: 'mo', dashed: true, area: true })]),
      C.legend([{ label: 'Portfolio value', color: RET.primary }, { label: 'Pre-crash level', color: RET.grey }]),
      h('p', { style: 'text-align:center;margin:14px 0 4px;font-family:var(--font-display);font-weight:600', html: `SIP investors who <b>stayed invested</b> — and kept buying cheap units — recovered in about <b>${s.crash.recoveryMonths} months</b>.` }),
      behaviourLab('Loss aversion is why crashes hurt', 'The pain of a paper loss feels about twice as strong as the pleasure of an equal gain — so a red portfolio screams "sell!" exactly when you should hold or buy. Panic selling is how a temporary dip becomes a permanent loss.', 'Prospect theory (Kahneman & Tversky, 1979).'),
      resultDisclaimer(),
    );
  }
  render();
  return grid2(inputs, result);
}

/* ---------------- shared bits ---------------- */
function statBox(label, value, cls) {
  return h('div.stat', {}, [h('div.label', {}, label), h('div.value' + (cls ? '.' + cls : ''), {}, value)]);
}
function grid2(a, b) {
  const g = h('div.sim-grid');
  g.append(a, b);
  return g;
}
function grid2f(a, b) { const g = h('div.grid.grid-2'); g.append(a, b); return g; }
