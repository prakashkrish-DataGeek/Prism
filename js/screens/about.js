import { h, icon, toast } from '../ui.js';
import { FAQ } from '../data/faq.js';
import { footer } from './home.js';

export function renderAbout(nav, sub) {
  const wrap = h('div.fade-up');
  const c = h('div.container', { style: 'max-width:820px' });

  c.appendChild(h('div.eyebrow', {}, 'About'));
  c.appendChild(h('h1', { style: 'margin-top:4px' }, 'What is Prism?'));
  c.appendChild(h('p.lead', {}, 'Prism is a free financial-education platform built for Gen Z India. No signup, no data collection, no agenda. We believe financial literacy is a right, not a privilege.'));

  // What / Who
  c.appendChild(h('div.grid.grid-2', { style: 'margin:20px 0' }, [
    h('div.card', {}, [h('h3', { style: 'margin-top:0' }, '🎯 Why it exists'), h('p.muted', { style: 'margin:0' }, 'Most young Indians learn about money the expensive way — through mistakes. Prism turns the core ideas into tools you can play with and lessons you can finish in a coffee break, grounded in how people actually make decisions.')]),
    h('div.card', {}, [h('h3', { style: 'margin-top:0' }, '🔒 Our promise'), h('p.muted', { style: 'margin:0' }, 'No phone number, no email (except the optional waitlist below), no Aadhaar, no PAN — ever. Everything runs in your browser. Close the tab and nothing is stored. This is a learning playground, not a financial product.')]),
  ]));

  // Behaviour science strip
  c.appendChild(h('div.card.card-elevated', { style: 'margin-bottom:20px' }, [
    h('div.eyebrow', {}, 'Grounded in research'),
    h('h3', { style: 'margin:4px 0 8px' }, '🧠 The science behind Prism'),
    h('p.muted', { style: 'margin:0 0 10px' }, 'Every tool and lesson draws on published behavioural-science work, including:'),
    h('div.chips', {}, ['Prospect Theory · Kahneman & Tversky', 'Nudge · Thaler & Sunstein', 'Save More Tomorrow · Thaler & Benartzi', 'The Marshmallow Test · Mischel', 'Mental Accounting · Thaler', 'Present Bias · Laibson'].map(t => h('span.chip.chip-static', {}, t))),
  ]));

  // Quick Answers (FAQ)
  c.appendChild(h('h2', { style: 'margin-top:8px' }, 'Quick Answers'));
  c.appendChild(h('p.muted', {}, 'The 20 questions Gen Z asks us most. Static answers, education only.'));
  const faqWrap = h('div', { style: 'margin-bottom:24px' });
  FAQ.forEach(item => {
    const a = h('div.faq-a', {}, [h('div.faq-a-inner', { html: item.a })]);
    const el = h('div.faq-item', {}, [
      h('button.faq-q', { onclick: () => el.classList.toggle('open') }, [h('span', {}, item.q), icon('i-chevron')]),
      a,
    ]);
    faqWrap.appendChild(el);
  });
  c.appendChild(faqWrap);

  // Coming in Phase 2
  c.appendChild(h('div.card', { style: 'background:var(--md-secondary-container);color:var(--md-on-secondary-container);border:none;margin-bottom:20px' }, [
    h('div.eyebrow', { style: 'color:inherit' }, 'On the roadmap'),
    h('h2', { style: 'margin:4px 0 10px' }, 'Coming in Phase 2'),
    h('ul', { style: 'margin:0;padding-left:20px;line-height:1.9' }, [
      '✦ Personalised portfolio tracking',
      '✦ Goal-based SIP execution',
      '✦ Artha — a personalised AI money coach',
      '✦ Bank linking via RBI Account Aggregator',
      '✦ 1-on-1 sessions with a SEBI Registered Investment Advisor',
    ].map(t => h('li', {}, t))),
  ]));

  // Waitlist (the ONLY data field in Phase 1)
  c.appendChild(waitlist());

  // Disclaimers block
  c.appendChild(h('h2', { id: 'disclaimer', style: 'margin-top:28px' }, 'Disclaimers'));
  c.appendChild(h('div.card', {}, [
    h('p', { html: '<b>Prism provides financial literacy content and tools for educational purposes only.</b> We are <b>not</b> a SEBI Registered Investment Advisor (RIA). Nothing on this platform constitutes investment advice or a recommendation to buy or sell any security or product.' }),
    h('p', { html: 'All calculators use category-level assumptions and are labelled “for learning purposes only.” <b>Past performance is not indicative of future results.</b> Mutual fund investments are subject to market risks; please read all scheme-related documents carefully.' }),
    h('p.mb-0', { html: 'Classification: Financial Literacy / Investor Education (ref. SEBI investor-education initiatives). For questions or grievances, contact <b>hello@prism.example</b>.' }),
    h('div.row', { style: 'gap:10px;margin-top:12px' }, [
      h('a.btn.btn-outline', { href: 'https://www.sebi.gov.in', target: '_blank', rel: 'noopener' }, 'SEBI Investor Charter ↗'),
      h('a.btn.btn-outline', { href: 'https://www.mutualfundssahihai.com', target: '_blank', rel: 'noopener' }, 'Mutual Fund Sahi Hai ↗'),
    ]),
  ]));

  // Privacy note
  c.appendChild(h('div.card', { style: 'margin-top:16px' }, [
    h('h3', { style: 'margin-top:0' }, '🍪 Privacy & cookies'),
    h('p.muted.mb-0', {}, 'We use privacy-first, cookieless analytics (page views and tool completions only) — no individual tracking, no session recording, no consent banner needed. The only personal data we can collect is an email you voluntarily add to the Phase-2 waitlist.'),
  ]));

  wrap.appendChild(h('section.section', {}, [c]));
  wrap.appendChild(footer(nav));

  if (sub === 'disclaimer') setTimeout(() => document.getElementById('disclaimer')?.scrollIntoView({ behavior: 'smooth' }), 60);
  return wrap;
}

function waitlist() {
  const emailInput = h('input', { type: 'email', placeholder: 'you@email.com', 'aria-label': 'Email for waitlist' });
  const msg = h('p.muted', { style: 'margin:8px 0 0;font-size:.85rem' }, 'No phone, no name, no OTP. This is the only data field in all of Phase 1.');
  const form = h('form', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-top:12px' }, [
    h('div.input-wrap', { style: 'flex:1;min-width:220px;background:var(--md-surface-container-high);border-radius:8px 8px 0 0;border-bottom:2px solid var(--md-outline);padding:10px 14px;display:flex;align-items:center' }, [emailInput]),
    h('button.btn.btn-accent', { type: 'submit' }, 'Join waitlist'),
  ]);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = emailInput.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) { toast('Enter a valid email'); return; }
    // Phase 1: no backend — would POST to Resend/Mailchimp in production.
    emailInput.value = '';
    msg.innerHTML = '✅ You’re on the list! (Demo: no email is actually sent or stored in this Phase-1 build.)';
    toast('Added to the waitlist ✓');
  });
  return h('div.card.card-elevated', {}, [
    h('h3', { style: 'margin-top:0' }, '📬 Be first to know when Phase 2 launches'),
    form, msg,
  ]);
}
