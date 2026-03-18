import {
  GitBranch, Share2, ArrowRight, List, Triangle, Hash,
} from 'lucide-react';

// ═══════════════════════════════════════════════
// DATA STRUCTURE TEMPLATES — Auto-draw on canvas
// ═══════════════════════════════════════════════

const NODE_RADIUS = 20;
const NODE_COLOR = '#4f8ff7';
const EDGE_COLOR = '#52525b';
const LABEL_COLOR = '#e4e4e7';
const CELL_W = 50;
const CELL_H = 36;

function makeNode(x, y, label, color = NODE_COLOR) {
  return [
    { type: 'circle', x: x - NODE_RADIUS, y: y - NODE_RADIUS, w: NODE_RADIUS * 2, h: NODE_RADIUS * 2, color, strokeWidth: 2 },
    { type: 'text', x: x - (label.length > 1 ? 7 : 4), y: y + 5, text: label, color: LABEL_COLOR, fontSize: 14 },
  ];
}

function makeEdge(x1, y1, x2, y2, directed = false) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const sx = x1 + NODE_RADIUS * Math.cos(angle);
  const sy = y1 + NODE_RADIUS * Math.sin(angle);
  const ex = x2 - NODE_RADIUS * Math.cos(angle);
  const ey = y2 - NODE_RADIUS * Math.sin(angle);
  return [{ type: directed ? 'arrow' : 'line', x1: sx, y1: sy, x2: ex, y2: ey, color: EDGE_COLOR, strokeWidth: 1.5 }];
}

function makeArrayCell(x, y, value, index) {
  return [
    { type: 'rect', x, y, w: CELL_W, h: CELL_H, color: '#4f8ff7', strokeWidth: 1.5 },
    { type: 'text', x: x + CELL_W / 2 - (String(value).length > 1 ? 7 : 4), y: y + CELL_H / 2 + 5, text: String(value), color: LABEL_COLOR, fontSize: 14 },
    { type: 'text', x: x + CELL_W / 2 - (String(index).length > 1 ? 5 : 3), y: y + CELL_H + 14, text: String(index), color: '#52525b', fontSize: 10 },
  ];
}

function makeLLNode(x, y, value) {
  return [
    { type: 'rect', x, y, w: 60, h: 30, color: '#a78bfa', strokeWidth: 1.5 },
    { type: 'line', x1: x + 40, y1: y, x2: x + 40, y2: y + 30, color: '#52525b', strokeWidth: 1 },
    { type: 'text', x: x + 12, y: y + 19, text: String(value), color: LABEL_COLOR, fontSize: 13 },
    { type: 'filledCircle', x: x + 44, y: y + 11, w: 8, h: 8, color: '#71717a' },
  ];
}

// ═══ TEMPLATE GENERATORS ═══

function generateBST(offsetX = 100, offsetY = 40) {
  const els = [];
  const nodes = [
    { x: 200, y: 40, label: '8' },
    { x: 120, y: 100, label: '3' },
    { x: 280, y: 100, label: '10' },
    { x: 80, y: 160, label: '1' },
    { x: 160, y: 160, label: '6' },
    { x: 320, y: 160, label: '14' },
    { x: 130, y: 220, label: '4' },
    { x: 190, y: 220, label: '7' },
    { x: 290, y: 220, label: '13' },
  ];
  const edges = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [4, 6], [4, 7], [5, 8],
  ];
  nodes.forEach((n) => els.push(...makeNode(n.x + offsetX, n.y + offsetY, n.label)));
  edges.forEach(([a, b]) => {
    els.push(...makeEdge(
      nodes[a].x + offsetX, nodes[a].y + offsetY,
      nodes[b].x + offsetX, nodes[b].y + offsetY,
    ));
  });
  // Title
  els.push({ type: 'text', x: offsetX + 150, y: offsetY - 10, text: 'Binary Search Tree', color: '#71717a', fontSize: 12 });
  return els;
}

function generateDirectedGraph(offsetX = 100, offsetY = 40) {
  const els = [];
  const nodes = [
    { x: 60, y: 60, label: '0' },
    { x: 180, y: 40, label: '1' },
    { x: 300, y: 60, label: '2' },
    { x: 120, y: 150, label: '3' },
    { x: 240, y: 160, label: '4' },
    { x: 180, y: 240, label: '5' },
  ];
  const edges = [[0, 1], [1, 2], [0, 3], [1, 4], [3, 5], [4, 5], [2, 4]];
  nodes.forEach((n) => els.push(...makeNode(n.x + offsetX, n.y + offsetY, n.label, '#22d3ee')));
  edges.forEach(([a, b]) => {
    els.push(...makeEdge(
      nodes[a].x + offsetX, nodes[a].y + offsetY,
      nodes[b].x + offsetX, nodes[b].y + offsetY,
      true,
    ));
  });
  els.push({ type: 'text', x: offsetX + 100, y: offsetY - 10, text: 'Directed Graph', color: '#71717a', fontSize: 12 });
  return els;
}

function generateUndirectedGraph(offsetX = 100, offsetY = 40) {
  const els = [];
  const nodes = [
    { x: 80, y: 60, label: 'A' },
    { x: 200, y: 40, label: 'B' },
    { x: 300, y: 80, label: 'C' },
    { x: 60, y: 170, label: 'D' },
    { x: 200, y: 200, label: 'E' },
    { x: 320, y: 180, label: 'F' },
  ];
  const edges = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [1, 4], [0, 4]];
  nodes.forEach((n) => els.push(...makeNode(n.x + offsetX, n.y + offsetY, n.label, '#34d399')));
  edges.forEach(([a, b]) => {
    els.push(...makeEdge(
      nodes[a].x + offsetX, nodes[a].y + offsetY,
      nodes[b].x + offsetX, nodes[b].y + offsetY,
      false,
    ));
  });
  els.push({ type: 'text', x: offsetX + 110, y: offsetY - 10, text: 'Undirected Graph', color: '#71717a', fontSize: 12 });
  return els;
}

function generateLinkedList(offsetX = 60, offsetY = 100) {
  const els = [];
  const values = [1, 4, 7, 9, 12];
  values.forEach((v, i) => {
    const x = offsetX + i * 100;
    els.push(...makeLLNode(x, offsetY, v));
    if (i < values.length - 1) {
      els.push({ type: 'arrow', x1: x + 56, y1: offsetY + 15, x2: x + 100, y2: offsetY + 15, color: EDGE_COLOR, strokeWidth: 1.5 });
    }
  });
  // NULL
  els.push({ type: 'text', x: offsetX + values.length * 100 - 6, y: offsetY + 19, text: 'NULL', color: '#f87171', fontSize: 11 });
  // Head pointer
  els.push({ type: 'text', x: offsetX + 10, y: offsetY - 10, text: 'head', color: '#a78bfa', fontSize: 11 });
  els.push({ type: 'arrow', x1: offsetX + 30, y1: offsetY - 4, x2: offsetX + 30, y2: offsetY, color: '#a78bfa', strokeWidth: 1 });
  els.push({ type: 'text', x: offsetX + 100, y: offsetY - 30, text: 'Linked List', color: '#71717a', fontSize: 12 });
  return els;
}

function generateHeap(offsetX = 100, offsetY = 40) {
  const els = [];
  const nodes = [
    { x: 200, y: 40, label: '1' },
    { x: 120, y: 110, label: '3' },
    { x: 280, y: 110, label: '5' },
    { x: 80, y: 180, label: '7' },
    { x: 160, y: 180, label: '9' },
    { x: 240, y: 180, label: '8' },
    { x: 320, y: 180, label: '12' },
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
  nodes.forEach((n) => els.push(...makeNode(n.x + offsetX, n.y + offsetY, n.label, '#fbbf24')));
  edges.forEach(([a, b]) => {
    els.push(...makeEdge(
      nodes[a].x + offsetX, nodes[a].y + offsetY,
      nodes[b].x + offsetX, nodes[b].y + offsetY,
    ));
  });
  els.push({ type: 'text', x: offsetX + 150, y: offsetY - 10, text: 'Min Heap', color: '#71717a', fontSize: 12 });
  // Array representation below
  const arr = [1, 3, 5, 7, 9, 8, 12];
  arr.forEach((v, i) => {
    els.push(...makeArrayCell(offsetX + 60 + i * 44, offsetY + 240, v, i));
  });
  els.push({ type: 'text', x: offsetX + 60, y: offsetY + 233, text: 'Array representation:', color: '#52525b', fontSize: 10 });
  return els;
}

function generateArray(offsetX = 60, offsetY = 80) {
  const els = [];
  const values = [3, 7, 1, 9, 4, 6, 2, 8, 5];
  values.forEach((v, i) => {
    els.push(...makeArrayCell(offsetX + i * (CELL_W + 2), offsetY, v, i));
  });
  els.push({ type: 'text', x: offsetX, y: offsetY - 10, text: 'Array', color: '#71717a', fontSize: 12 });
  // i and j pointers
  els.push({ type: 'text', x: offsetX + 18, y: offsetY + CELL_H + 32, text: 'i', color: '#f87171', fontSize: 12 });
  els.push({ type: 'arrow', x1: offsetX + 22, y1: offsetY + CELL_H + 22, x2: offsetX + 22, y2: offsetY + CELL_H + 4, color: '#f87171', strokeWidth: 1.5 });
  els.push({ type: 'text', x: offsetX + (CELL_W + 2) * 4 + 18, y: offsetY + CELL_H + 32, text: 'j', color: '#34d399', fontSize: 12 });
  els.push({ type: 'arrow', x1: offsetX + (CELL_W + 2) * 4 + 22, y1: offsetY + CELL_H + 22, x2: offsetX + (CELL_W + 2) * 4 + 22, y2: offsetY + CELL_H + 4, color: '#34d399', strokeWidth: 1.5 });
  return els;
}

// ═══ TEMPLATE BUTTONS ═══

const TEMPLATES = [
  { key: 'bst', label: 'BST', icon: GitBranch, generate: generateBST, color: '#4f8ff7' },
  { key: 'dgraph', label: 'Directed Graph', icon: Share2, generate: generateDirectedGraph, color: '#22d3ee' },
  { key: 'ugraph', label: 'Undirected Graph', icon: Share2, generate: generateUndirectedGraph, color: '#34d399' },
  { key: 'llist', label: 'Linked List', icon: ArrowRight, generate: generateLinkedList, color: '#a78bfa' },
  { key: 'heap', label: 'Heap', icon: Triangle, generate: generateHeap, color: '#fbbf24' },
  { key: 'array', label: 'Array', icon: Hash, generate: generateArray, color: '#fb923c' },
];

export default function DSTemplates({ canvasAPI }) {
  if (!canvasAPI) return null;

  const handleInsert = (template) => {
    const elements = template.generate();
    canvasAPI.addElements(elements);
  };

  return (
    <div style={{
      display: 'flex', gap: 4, padding: '6px 10px', flexWrap: 'wrap',
      background: 'rgba(255,255,255,0.02)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#3f3f46',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'flex', alignItems: 'center', marginRight: 4,
      }}>
        Quick Add
      </span>
      {TEMPLATES.map((t) => {
        const Icon = t.icon;
        return (
          <button key={t.key} onClick={() => handleInsert(t)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 6,
            background: `${t.color}10`, border: `1px solid ${t.color}25`,
            color: t.color, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${t.color}20`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${t.color}10`; }}
          >
            <Icon size={11} /> {t.label}
          </button>
        );
      })}
    </div>
  );
}
