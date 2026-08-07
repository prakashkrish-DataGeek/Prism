/* ============================================================
   charts.js — dependency-free SVG charts (offline, <5KB)
   Themed via CSS variables read at render time.
   ============================================================ */

const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs = {}, text) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (text != null) n.textContent = text;
  return n;
}
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Animated donut chart. data: [{label, value, color}] */
export function donut(data, opts = {}) {
  const size = opts.size || 200, stroke = opts.stroke || 26, r = (size - stroke) / 2, c = size / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const svg = el('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, role: 'img' });
  svg.appendChild(el('circle', { cx: c, cy: c, r, fill: 'none', stroke: cssVar('--md-surface-container-highest'), 'stroke-width': stroke }));
  let offset = 0;
  data.forEach(d => {
    const frac = d.value / total;
    const arc = el('circle', {
      cx: c, cy: c, r, fill: 'none', stroke: d.color, 'stroke-width': stroke,
      'stroke-dasharray': `${frac * circ} ${circ}`, 'stroke-dashoffset': -offset,
      transform: `rotate(-90 ${c} ${c})`, 'stroke-linecap': 'butt',
    });
    arc.style.transition = 'stroke-dasharray .6s ease';
    svg.appendChild(arc);
    offset += frac * circ;
  });
  if (opts.centerLabel) {
    svg.appendChild(el('text', { x: c, y: c - 4, 'text-anchor': 'middle', fill: cssVar('--md-on-surface-variant'), 'font-size': 11, 'font-family': 'inherit' }, opts.centerLabel));
    svg.appendChild(el('text', { x: c, y: c + 16, 'text-anchor': 'middle', fill: cssVar('--md-on-surface'), 'font-size': 18, 'font-weight': 700, 'font-family': 'inherit' }, opts.centerValue || ''));
  }
  return svg;
}

/**
 * Multi-line chart. series: [{label, color, points:[{x,y}]}]
 * fmtY optional formatter for axis + tooltip.
 */
export function lineChart(series, opts = {}) {
  const W = opts.width || 640, H = opts.height || 260;
  const padL = 46, padR = 14, padT = 14, padB = 28;
  const iw = W - padL - padR, ih = H - padT - padB;
  const allX = series.flatMap(s => s.points.map(p => p.x));
  const allY = series.flatMap(s => s.points.map(p => p.y));
  const minX = Math.min(...allX), maxX = Math.max(...allX);
  const minY = 0, maxY = Math.max(...allY) * 1.08 || 1;
  const sx = x => padL + (maxX === minX ? 0 : (x - minX) / (maxX - minX)) * iw;
  const sy = y => padT + ih - (y - minY) / (maxY - minY) * ih;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', preserveAspectRatio: 'none', style: `max-width:100%;height:${H}px` });

  // gridlines + y labels
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const v = minY + (maxY - minY) * i / ticks;
    const y = sy(v);
    svg.appendChild(el('line', { x1: padL, y1: y, x2: W - padR, y2: y, class: 'grid-line', opacity: i === 0 ? .8 : .35 }));
    svg.appendChild(el('text', { x: padL - 6, y: y + 3, 'text-anchor': 'end', class: 'axis-text' }, opts.fmtY ? opts.fmtY(v) : v.toFixed(0)));
  }
  // x labels (first/mid/last)
  [minX, (minX + maxX) / 2, maxX].forEach(xv => {
    svg.appendChild(el('text', { x: sx(xv), y: H - 8, 'text-anchor': 'middle', class: 'axis-text' }, (opts.fmtX ? opts.fmtX(xv) : Math.round(xv)) + (opts.xUnit || '')));
  });

  series.forEach(s => {
    if (opts.area && s.area) {
      const d = 'M' + s.points.map(p => `${sx(p.x)},${sy(p.y)}`).join(' L ') +
        ` L ${sx(s.points.at(-1).x)},${sy(0)} L ${sx(s.points[0].x)},${sy(0)} Z`;
      svg.appendChild(el('path', { d, fill: s.color, opacity: .12 }));
    }
    const d = 'M' + s.points.map(p => `${sx(p.x)},${sy(p.y)}`).join(' L ');
    const path = el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    if (opts.dashed && s.dashed) path.setAttribute('stroke-dasharray', '6 5');
    const len = path.getTotalLength ? 0 : 0;
    svg.appendChild(path);
    // end dot
    const last = s.points.at(-1);
    svg.appendChild(el('circle', { cx: sx(last.x), cy: sy(last.y), r: 3.5, fill: s.color }));
  });
  return svg;
}

/** Horizontal animated bars. data:[{label, value, color, sub}] */
export function bars(data, opts = {}) {
  const max = Math.max(...data.map(d => d.value)) || 1;
  const wrap = document.createElement('div');
  data.forEach((d, i) => {
    const row = document.createElement('div');
    row.style.marginBottom = '14px';
    const top = document.createElement('div');
    top.className = 'row between';
    top.style.marginBottom = '4px';
    top.innerHTML = `<span style="font-weight:600">${d.label}</span><span style="font-family:var(--font-display);font-weight:700;color:${d.color}">${d.valueText ?? d.value}</span>`;
    const track = document.createElement('div');
    track.style.cssText = 'height:12px;border-radius:999px;background:var(--md-surface-container-highest);overflow:hidden';
    const fill = document.createElement('div');
    fill.style.cssText = `height:100%;border-radius:999px;background:${d.color};width:0;transition:width .6s ease ${i * 0.08}s`;
    track.appendChild(fill);
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = (d.value / max * 100) + '%'; }));
    row.append(top, track);
    if (d.sub) {
      const sub = document.createElement('div');
      sub.className = 'muted';
      sub.style.cssText = 'font-size:.78rem;margin-top:4px';
      sub.textContent = d.sub;
      row.appendChild(sub);
    }
    wrap.appendChild(row);
  });
  return wrap;
}

/** Simple legend helper. */
export function legend(items) {
  const div = document.createElement('div');
  div.className = 'legend';
  items.forEach(i => {
    div.innerHTML += `<span><span class="sw" style="background:${i.color}"></span>${i.label}</span>`;
  });
  return div;
}

/** Animate a number counting up into an element. */
export function countUp(node, to, fmt = (v) => Math.round(v), dur = 550) {
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = fmt(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
