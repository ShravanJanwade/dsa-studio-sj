/**
 * SVG Renderers for the Viz Engine
 * 
 * Each renderer takes: (data, highlights, width, height) → SVG string
 * Highlights map element IDs to color keys: 'active', 'done', 'alert', 'compare', 'special'
 */
import { C } from './StepRecorder';

const COLORS = {
  active:  { fill: C.BG_ACTIVE,  stroke: C.ACTIVE,  text: '#93c5fd' },
  done:    { fill: C.BG_DONE,    stroke: C.DONE,    text: '#6ee7b7' },
  alert:   { fill: C.BG_ALERT,   stroke: C.ALERT,   text: '#fca5a5' },
  compare: { fill: C.BG_COMPARE, stroke: C.COMPARE,  text: '#fde68a' },
  special: { fill: C.BG_SPECIAL, stroke: C.SPECIAL,  text: '#c4b5fd' },
  none:    { fill: C.BG_DARK,    stroke: C.INACTIVE, text: '#a1a1aa' },
};

function gc(hlState) { return COLORS[hlState] || COLORS.none; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ═══════════════════════════════════════════════
// ARRAY RENDERER
// ═══════════════════════════════════════════════
export function renderArray(data, highlights = {}, w = 440, h = 100) {
  const { values = [], label = '', pointers = {} } = data;
  // pointers: { index: 'label', ... } e.g. { 0: 'left', 4: 'right', 2: 'mid' }
  // highlights.cells: { index: 'active'|'done'|... }

  const n = values.length;
  if (n === 0) return `<svg viewBox="0 0 ${w} 60"><text x="${w/2}" y="30" text-anchor="middle" fill="#3f3f46" font-size="12" font-family="JetBrains Mono,monospace">Empty array</text></svg>`;

  const boxW = Math.min(52, (w - 40) / n - 4);
  const boxH = 38;
  const gap = 4;
  const totalW = n * (boxW + gap) - gap;
  const startX = Math.max(10, (w - totalW) / 2);
  const startY = label ? 22 : 10;
  const cells = highlights.cells || {};

  let svg = `<svg viewBox="0 0 ${w} ${startY + boxH + (Object.keys(pointers).length ? 40 : 20)}" xmlns="http://www.w3.org/2000/svg">`;

  // Label
  if (label) {
    svg += `<text x="${startX}" y="14" font-size="11" font-weight="600" fill="#52525b" font-family="JetBrains Mono,monospace">${esc(label)}</text>`;
  }

  // Index labels
  values.forEach((_, i) => {
    const x = startX + i * (boxW + gap);
    svg += `<text x="${x + boxW / 2}" y="${startY}" text-anchor="middle" font-size="9" fill="#3f3f46" font-family="JetBrains Mono,monospace">${i}</text>`;
  });

  // Boxes
  const boxY = startY + 6;
  values.forEach((val, i) => {
    const x = startX + i * (boxW + gap);
    const c = gc(cells[i]);
    svg += `<rect x="${x}" y="${boxY}" width="${boxW}" height="${boxH}" rx="5" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
    svg += `<text x="${x + boxW / 2}" y="${boxY + boxH / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="600" fill="${c.text}" font-family="JetBrains Mono,monospace">${val === null || val === undefined ? '—' : esc(val)}</text>`;
  });

  // Pointers below
  Object.entries(pointers).forEach(([idx, lbl]) => {
    const i = parseInt(idx);
    if (i < 0 || i >= n) return;
    const x = startX + i * (boxW + gap) + boxW / 2;
    const py = boxY + boxH + 8;
    svg += `<line x1="${x}" y1="${boxY + boxH}" x2="${x}" y2="${py}" stroke="#4f8ff7" stroke-width="1.5"/>`;
    svg += `<polygon points="${x - 4},${py - 4} ${x + 4},${py - 4} ${x},${py}" fill="#4f8ff7"/>`;
    svg += `<text x="${x}" y="${py + 12}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${esc(lbl)}</text>`;
  });

  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════════════
// GRAPH RENDERER
// ═══════════════════════════════════════════════
export function renderGraph(data, highlights = {}, w = 440, h = 280) {
  const { nodes = [], edges = [], directed = false } = data;
  // nodes: [{ id, x, y, label?, sub? }]
  // edges: [{ from, to, weight?, label? }]
  // highlights.nodes: { id: 'active'|... }, highlights.edges: { 'from-to': 'active'|... }

  const hn = highlights.nodes || {};
  const he = highlights.edges || {};
  const R = 20;

  let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;

  // Edges
  edges.forEach((e) => {
    const n1 = nodes.find((n) => n.id === e.from);
    const n2 = nodes.find((n) => n.id === e.to);
    if (!n1 || !n2) return;
    const key1 = `${e.from}-${e.to}`, key2 = `${e.to}-${e.from}`;
    const hlState = he[key1] || he[key2] || 'none';
    const c = gc(hlState);
    const sw = hlState !== 'none' ? 3 : 1.5;
    const dash = hlState === 'special' ? 'stroke-dasharray="6 4"' : '';

    svg += `<line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" stroke="${c.stroke}" stroke-width="${sw}" stroke-linecap="round" ${dash}/>`;

    // Edge weight/label
    if (e.weight !== undefined) {
      const mx = (n1.x + n2.x) / 2, my = (n1.y + n2.y) / 2;
      svg += `<rect x="${mx - 12}" y="${my - 8}" width="24" height="16" rx="4" fill="#0e0e12" stroke="none"/>`;
      svg += `<text x="${mx}" y="${my + 1}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="${c.text}" font-family="JetBrains Mono,monospace">${e.weight}</text>`;
    }

    // Edge label (like BRIDGE)
    if (e.label) {
      const mx = (n1.x + n2.x) / 2, my = (n1.y + n2.y) / 2;
      svg += `<text x="${mx}" y="${my - 14}" text-anchor="middle" font-size="9" font-weight="700" fill="${c.stroke}" font-family="JetBrains Mono,monospace">${esc(e.label)}</text>`;
    }

    // Arrow for directed graphs
    if (directed) {
      const dx = n2.x - n1.x, dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const ux = dx / dist, uy = dy / dist;
        const ax = n2.x - ux * (R + 4), ay = n2.y - uy * (R + 4);
        const px = -uy, py = ux;
        svg += `<polygon points="${ax},${ay} ${ax - ux * 8 + px * 4},${ay - uy * 8 + py * 4} ${ax - ux * 8 - px * 4},${ay - uy * 8 - py * 4}" fill="${c.stroke}"/>`;
      }
    }
  });

  // Nodes
  nodes.forEach((n) => {
    const hlState = hn[n.id] || 'none';
    const c = gc(hlState);
    const r = hlState !== 'none' ? R + 2 : R;

    svg += `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>`;
    svg += `<text x="${n.x}" y="${n.y}${n.sub ? ' dy="-3"' : ''}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="700" fill="${c.text}" font-family="JetBrains Mono,monospace">${esc(n.label !== undefined ? n.label : n.id)}</text>`;

    // Sub-text (like disc/low values)
    if (n.sub) {
      svg += `<text x="${n.x}" y="${n.y + 10}" text-anchor="middle" font-size="9" fill="${c.text}" opacity="0.7" font-family="JetBrains Mono,monospace">${esc(n.sub)}</text>`;
    }
  });

  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════════════
// TREE RENDERER (BST, generic trees, heaps)
// ═══════════════════════════════════════════════
export function renderTree(data, highlights = {}, w = 440, h = 260) {
  const { nodes = [], edges = [], label = '' } = data;
  // nodes: [{ id, x, y, value, sub? }]
  // edges: [{ from, to }]

  const hn = highlights.nodes || {};
  const he = highlights.edges || {};

  let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;
  if (label) {
    svg += `<text x="10" y="16" font-size="11" font-weight="600" fill="#52525b" font-family="JetBrains Mono,monospace">${esc(label)}</text>`;
  }

  // Edges first
  edges.forEach((e) => {
    const n1 = nodes.find((n) => n.id === e.from);
    const n2 = nodes.find((n) => n.id === e.to);
    if (!n1 || !n2) return;
    const key = `${e.from}-${e.to}`;
    const c = gc(he[key] || 'none');
    svg += `<line x1="${n1.x}" y1="${n1.y + 14}" x2="${n2.x}" y2="${n2.y - 14}" stroke="${c.stroke}" stroke-width="1.5" stroke-linecap="round"/>`;
  });

  // Nodes
  nodes.forEach((n) => {
    const c = gc(hn[n.id] || 'none');
    svg += `<circle cx="${n.x}" cy="${n.y}" r="16" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
    svg += `<text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="${c.text}" font-family="JetBrains Mono,monospace">${esc(n.value !== undefined ? n.value : n.id)}</text>`;
    if (n.sub) {
      svg += `<text x="${n.x}" y="${n.y + 24}" text-anchor="middle" font-size="9" fill="${c.text}" opacity="0.6" font-family="JetBrains Mono,monospace">${esc(n.sub)}</text>`;
    }
  });

  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════════════
// STACK / QUEUE RENDERER
// ═══════════════════════════════════════════════
export function renderStack(data, highlights = {}, w = 120, h = 220) {
  const { values = [], label = 'Stack' } = data;
  const hl = highlights.cells || {};
  const boxH = 28, boxW = 80, gap = 3;
  const startX = (w - boxW) / 2;
  const topY = 24;

  let svg = `<svg viewBox="0 0 ${w} ${Math.max(h, topY + values.length * (boxH + gap) + 20)}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<text x="${w / 2}" y="14" text-anchor="middle" font-size="10" font-weight="600" fill="#52525b" font-family="JetBrains Mono,monospace">${esc(label)}</text>`;

  // Stack: top at top (index 0 = top of visual stack = last pushed)
  const display = [...values].reverse();
  display.forEach((val, vi) => {
    const realIdx = values.length - 1 - vi;
    const y = topY + vi * (boxH + gap);
    const c = gc(hl[realIdx] || (vi === 0 ? 'active' : 'none'));
    svg += `<rect x="${startX}" y="${y}" width="${boxW}" height="${boxH}" rx="5" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
    svg += `<text x="${startX + boxW / 2}" y="${y + boxH / 2}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="${c.text}" font-family="JetBrains Mono,monospace">${esc(val)}</text>`;
    if (vi === 0) {
      svg += `<text x="${startX - 8}" y="${y + boxH / 2}" text-anchor="end" dominant-baseline="central" font-size="9" fill="#4f8ff7" font-family="JetBrains Mono,monospace">top→</text>`;
    }
  });

  if (values.length === 0) {
    svg += `<text x="${w / 2}" y="${topY + 20}" text-anchor="middle" font-size="11" fill="#3f3f46" font-family="JetBrains Mono,monospace">Empty</text>`;
  }

  svg += '</svg>';
  return svg;
}

export function renderQueue(data, highlights = {}, w = 440, h = 70) {
  const { values = [], label = 'Queue' } = data;
  const hl = highlights.cells || {};
  const boxW = Math.min(50, (w - 80) / Math.max(values.length, 1));
  const boxH = 32;
  const startX = 50;
  const y = 24;

  let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<text x="${w / 2}" y="14" text-anchor="middle" font-size="10" font-weight="600" fill="#52525b" font-family="JetBrains Mono,monospace">${esc(label)}</text>`;

  values.forEach((val, i) => {
    const x = startX + i * (boxW + 3);
    const c = gc(hl[i] || (i === 0 ? 'compare' : 'none'));
    svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="5" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
    svg += `<text x="${x + boxW / 2}" y="${y + boxH / 2}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="${c.text}" font-family="JetBrains Mono,monospace">${esc(val)}</text>`;
  });

  if (values.length > 0) {
    svg += `<text x="${startX - 6}" y="${y + boxH / 2}" text-anchor="end" dominant-baseline="central" font-size="9" fill="#fbbf24" font-family="JetBrains Mono,monospace">front→</text>`;
  }

  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════════════
// LINKED LIST RENDERER
// ═══════════════════════════════════════════════
export function renderLinkedList(data, highlights = {}, w = 440, h = 70) {
  const { values = [], label = '' } = data;
  const hl = highlights.cells || {};
  const boxW = 50, boxH = 32, arrowW = 24;
  const totalW = values.length * (boxW + arrowW);
  const startX = Math.max(10, (w - totalW) / 2);
  const y = label ? 28 : 14;

  let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;
  if (label) svg += `<text x="${startX}" y="14" font-size="10" font-weight="600" fill="#52525b" font-family="JetBrains Mono,monospace">${esc(label)}</text>`;

  values.forEach((val, i) => {
    const x = startX + i * (boxW + arrowW);
    const c = gc(hl[i] || 'none');
    svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="5" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
    svg += `<text x="${x + boxW / 2}" y="${y + boxH / 2}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="${c.text}" font-family="JetBrains Mono,monospace">${esc(val)}</text>`;
    // Arrow
    if (i < values.length - 1) {
      const ax = x + boxW, ay = y + boxH / 2;
      svg += `<line x1="${ax}" y1="${ay}" x2="${ax + arrowW - 6}" y2="${ay}" stroke="#3f3f46" stroke-width="1.5"/>`;
      svg += `<polygon points="${ax + arrowW - 6},${ay - 4} ${ax + arrowW - 6},${ay + 4} ${ax + arrowW},${ay}" fill="#3f3f46"/>`;
    }
  });
  // null at end
  if (values.length > 0) {
    const x = startX + values.length * (boxW + arrowW) - arrowW + boxW + 8;
    svg += `<text x="${x}" y="${y + boxH / 2}" dominant-baseline="central" font-size="10" fill="#3f3f46" font-family="JetBrains Mono,monospace">null</text>`;
  }

  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════════════
// HASHMAP RENDERER
// ═══════════════════════════════════════════════
export function renderHashMap(data, highlights = {}, w = 440, h = 140) {
  const { entries = [], label = 'HashMap' } = data;
  // entries: [{ key, value }]
  const hl = highlights.cells || {};
  const boxW = 90, boxH = 44, gap = 8;
  const cols = Math.max(1, Math.floor((w - 20) / (boxW + gap)));

  let svg = `<svg viewBox="0 0 ${w} ${Math.max(h, 30 + Math.ceil(entries.length / cols) * (boxH + gap))}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<text x="10" y="16" font-size="10" font-weight="600" fill="#52525b" font-family="JetBrains Mono,monospace">${esc(label)}</text>`;

  entries.forEach((e, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = 10 + col * (boxW + gap);
    const y = 26 + row * (boxH + gap);
    const c = gc(hl[i] || hl[e.key] || 'none');
    svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
    svg += `<text x="${x + boxW / 2}" y="${y + 16}" text-anchor="middle" font-size="10" font-weight="600" fill="${c.text}" font-family="JetBrains Mono,monospace">${esc(e.key)}</text>`;
    svg += `<text x="${x + boxW / 2}" y="${y + 32}" text-anchor="middle" font-size="12" font-weight="700" fill="${c.text}" font-family="JetBrains Mono,monospace">${esc(e.value)}</text>`;
  });

  if (entries.length === 0) svg += `<text x="${w / 2}" y="50" text-anchor="middle" fill="#3f3f46" font-size="11" font-family="JetBrains Mono,monospace">Empty</text>`;
  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════════════
// MATRIX / GRID RENDERER
// ═══════════════════════════════════════════════
export function renderMatrix(data, highlights = {}, w = 440, h = 300) {
  const { grid = [], label = '' } = data;
  const hl = highlights.cells || {}; // 'row-col' → color
  if (grid.length === 0) return `<svg viewBox="0 0 ${w} 40"><text x="${w/2}" y="20" text-anchor="middle" fill="#3f3f46" font-size="11">Empty</text></svg>`;

  const rows = grid.length, cols = grid[0].length;
  const cellW = Math.min(40, (w - 20) / cols);
  const cellH = cellW;
  const startX = Math.max(10, (w - cols * cellW) / 2);
  const startY = label ? 24 : 10;

  let svg = `<svg viewBox="0 0 ${w} ${startY + rows * cellH + 10}" xmlns="http://www.w3.org/2000/svg">`;
  if (label) svg += `<text x="${startX}" y="14" font-size="10" font-weight="600" fill="#52525b" font-family="JetBrains Mono,monospace">${esc(label)}</text>`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cellW;
      const y = startY + r * cellH;
      const key = `${r}-${c}`;
      const co = gc(hl[key] || 'none');
      svg += `<rect x="${x}" y="${y}" width="${cellW - 1}" height="${cellH - 1}" rx="3" fill="${co.fill}" stroke="${co.stroke}" stroke-width="1"/>`;
      svg += `<text x="${x + cellW / 2 - 0.5}" y="${y + cellH / 2}" text-anchor="middle" dominant-baseline="central" font-size="${Math.min(12, cellW * 0.4)}" font-weight="600" fill="${co.text}" font-family="JetBrains Mono,monospace">${esc(grid[r][c])}</text>`;
    }
  }
  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════════════
// DISPATCHER — picks the right renderer by type
// ═══════════════════════════════════════════════
const RENDERERS = {
  array: renderArray,
  graph: renderGraph,
  tree: renderTree,
  stack: renderStack,
  queue: renderQueue,
  linkedlist: renderLinkedList,
  hashmap: renderHashMap,
  matrix: renderMatrix,
};

export function renderStructure(type, data, highlights, w, h) {
  const fn = RENDERERS[type];
  return fn ? fn(data, highlights, w, h) : `<svg viewBox="0 0 ${w} 40"><text x="${w/2}" y="20" text-anchor="middle" fill="#3f3f46" font-size="11">Unknown: ${type}</text></svg>`;
}
