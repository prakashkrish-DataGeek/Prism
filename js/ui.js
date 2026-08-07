/* ============================================================
   ui.js — tiny DOM helpers + shared components
   ============================================================ */

/** hyperscript-ish element builder. h('div.card', {id:'x'}, [child, 'text']) */
export function h(sel, props = {}, children = []) {
  const [tag, ...classes] = sel.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');
  for (const k in props) {
    if (k === 'class') node.className += ' ' + props[k];
    else if (k === 'html') node.innerHTML = props[k];
    else if (k === 'style') node.setAttribute('style', props[k]);
    else if (k.startsWith('on') && typeof props[k] === 'function') node.addEventListener(k.slice(2).toLowerCase(), props[k]);
    else if (k === 'dataset') Object.assign(node.dataset, props[k]);
    else if (props[k] != null && props[k] !== false) node.setAttribute(k, props[k]);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null || c === false) return;
    node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c);
  });
  return node;
}

export function icon(id, cls = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.style.flex = 'none';
  if (cls) svg.setAttribute('class', cls);
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#' + id);
  svg.appendChild(use);
  return svg;
}

/** Standard "learning purposes only" line under every calculator result. */
export function resultDisclaimer() {
  return h('p.disclaimer', { html: '<b>For learning purposes only.</b> Past performance is not indicative of future results. Returns shown are category-level assumptions, not guarantees.' });
}

export function instrumentDisclaimer() {
  return h('p.disclaimer', { html: 'Educational overview. Not a recommendation to buy or sell. Prism is not a SEBI Registered Investment Advisor.' });
}

export function moduleDisclaimer() {
  return h('p.disclaimer', { html: 'This content is for financial education only and is not investment advice. Mutual fund investments are subject to market risks; read all scheme-related documents carefully.' });
}

export function banner(text, variant = '') {
  return h('div.banner' + (variant ? '.' + variant : ''), {}, [icon('i-info'), h('span', { html: text })]);
}

let toastTimer;
export function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = h('div.toast', {}, msg);
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 2600);
}

/** A labelled slider field that reports its value live. */
export function slider({ label, min, max, step, value, format = v => v, onInput }) {
  const val = h('span.field-value', {}, format(value));
  const input = h('input', { type: 'range', min, max, step, value, 'aria-label': label });
  input.addEventListener('input', () => { val.textContent = format(+input.value); onInput(+input.value); });
  const field = h('div.field', {}, [
    h('div.field-label', {}, [h('span', {}, label), val]),
    input,
  ]);
  field.getValue = () => +input.value;
  return field;
}

/** A ₹ text input field. */
export function moneyField({ label, value, onInput, prefix = '₹' }) {
  const input = h('input', { type: 'number', value, inputmode: 'numeric', 'aria-label': label });
  input.addEventListener('input', () => onInput(+input.value || 0));
  return h('div.textfield', {}, [
    h('label', {}, label),
    h('div.input-wrap', {}, [h('span.prefix', {}, prefix), input]),
  ]);
}

export function behaviourLab(title, body, cite) {
  return h('div.behaviour-lab', {}, [
    h('h4', {}, [icon('i-lab'), title]),
    h('p', { html: body, style: 'margin:0' }),
    cite ? h('div.cite', {}, cite) : null,
  ]);
}

export function share(caption) {
  if (navigator.share) {
    navigator.share({ title: 'Prism', text: caption }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(caption).then(() => toast('Insight copied to clipboard ✓')).catch(() => toast('Copy failed'));
  }
}
