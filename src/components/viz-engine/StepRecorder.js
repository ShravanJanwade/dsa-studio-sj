/**
 * StepRecorder — The core of the visualization engine.
 * 
 * Algorithms call recorder methods to log each step.
 * Each step captures: data structures state, variable values,
 * code line, log message, and explanation.
 * 
 * Usage:
 *   const rec = new StepRecorder();
 *   rec.setCode(['line1', 'line2', ...]);
 *   rec.addStructure('graph', 'g', { nodes, edges });
 *   rec.addStructure('array', 'disc', { values: disc, labels: 'disc[]' });
 *   rec.step(0, 'Visiting node 0', { explanation: '...', color: '#4f8ff7' });
 *   rec.highlight('g', { nodes: { 0: 'active' }, edges: {} });
 *   rec.updateVar('timer', 1);
 *   rec.step(1, 'Set disc[0] = 0', { explanation: '...' });
 *   ...
 *   const steps = rec.getSteps();
 */

// Color palette
export const C = {
  ACTIVE:    '#4f8ff7', // Blue — currently processing
  DONE:      '#34d399', // Green — completed / safe
  ALERT:     '#f87171', // Red — important finding
  COMPARE:   '#fbbf24', // Amber — comparing / updating
  SPECIAL:   '#a78bfa', // Purple — back edge, recursive
  INACTIVE:  '#3f3f46', // Gray — not yet visited
  BG_DARK:   '#1a1a20',
  BG_ACTIVE: '#0e1a2e',
  BG_DONE:   '#0e2a1f',
  BG_ALERT:  '#2a0e0e',
  BG_COMPARE:'#2a1f0e',
  BG_SPECIAL:'#1e0e2a',
};

export class StepRecorder {
  constructor() {
    this.steps = [];
    this.structures = {};    // id → { type, config }
    this.highlights = {};    // id → highlight state
    this.variables = {};     // name → value
    this.changedVars = new Set();
    this.codeLines = [];
    this.currentLine = -1;
  }

  /** Define pseudocode lines (shown in code panel) */
  setCode(lines) {
    this.codeLines = lines;
  }

  /** Register a data structure for visualization */
  addStructure(type, id, config) {
    this.structures[id] = { type, ...config };
    this.highlights[id] = {};
  }

  /** Update a data structure's data */
  updateStructure(id, updates) {
    this.structures[id] = { ...this.structures[id], ...updates };
  }

  /** Set highlight state for a structure */
  highlight(id, hl) {
    this.highlights[id] = hl;
  }

  /** Clear all highlights */
  clearHighlights() {
    for (const id of Object.keys(this.highlights)) {
      this.highlights[id] = {};
    }
  }

  /** Set/update a variable (tracks changes) */
  setVar(name, value) {
    if (JSON.stringify(this.variables[name]) !== JSON.stringify(value)) {
      this.changedVars.add(name);
    }
    this.variables[name] = value;
  }

  /** Set multiple variables at once */
  setVars(obj) {
    for (const [k, v] of Object.entries(obj)) this.setVar(k, v);
  }

  /** Record a step */
  step(codeLine, message, opts = {}) {
    const {
      explanation = '',
      color = C.ACTIVE,
    } = opts;

    this.currentLine = codeLine;

    this.steps.push({
      // Deep clone everything to capture this moment in time
      structures: JSON.parse(JSON.stringify(this.structures)),
      highlights: JSON.parse(JSON.stringify(this.highlights)),
      variables: { ...this.variables },
      changedVars: new Set(this.changedVars),
      codeLine,
      codeLines: this.codeLines,
      message,
      explanation,
      color,
    });

    this.changedVars.clear();
  }

  /** Get all recorded steps */
  getSteps() {
    return this.steps;
  }

  /** Reset for new test case */
  reset() {
    this.steps = [];
    this.structures = {};
    this.highlights = {};
    this.variables = {};
    this.changedVars.clear();
  }
}

/**
 * Graph layout utility — positions nodes in a circle or force-directed layout
 */
export function circleLayout(nodeCount, cx = 200, cy = 140, r = 100) {
  const positions = [];
  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    positions.push({
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    });
  }
  return positions;
}

/**
 * Tree layout utility — positions nodes in a hierarchical tree
 */
export function treeLayout(root, startX = 20, startY = 40, levelH = 60, minGap = 50) {
  const positions = {};
  let nextX = startX;

  function dfs(node, depth) {
    if (!node) return;
    if (node.children) {
      for (const child of node.children) dfs(child, depth + 1);
    }
    if (!node.children || node.children.length === 0) {
      positions[node.id] = { x: nextX, y: startY + depth * levelH };
      nextX += minGap;
    } else {
      const childXs = node.children.map((c) => positions[c.id]?.x || 0);
      const midX = (Math.min(...childXs) + Math.max(...childXs)) / 2;
      positions[node.id] = { x: midX, y: startY + depth * levelH };
    }
  }

  dfs(root, 0);
  return positions;
}
