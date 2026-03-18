/**
 * SandboxExecutor v3 — Maximum robustness
 * 
 * Pre-checks syntax before executing. Provides Array polyfills for Java compat.
 * Wraps everything in try/catch. Never crashes the app.
 */

const MAX_STEPS = 500;
const MAX_TIME_MS = 5000;

export function executeTraced(instrumentedCode, inputVars = {}) {
  const steps = [];
  const startTime = Date.now();

  function __step(lineNum, message, newVars) {
    if (steps.length >= MAX_STEPS || Date.now() - startTime > MAX_TIME_MS) return;
    const snapshot = {};
    if (newVars) {
      for (const [k, v] of Object.entries(newVars)) {
        if (k && !k.startsWith('__')) snapshot[k] = dc(v);
      }
    }
    steps.push({ line: lineNum, message: String(message || '').substring(0, 200), vars: snapshot, changedKeys: newVars ? new Set(Object.keys(newVars)) : new Set(), ts: steps.length });
  }

  function __sf(v) {
    try {
      if (v == null) return 'null';
      if (v instanceof Map) return `Map(${v.size})`;
      if (v instanceof Set) return `Set(${v.size})`;
      if (Array.isArray(v)) return v.length > 15 ? `[${v.slice(0, 10)}...(${v.length})]` : JSON.stringify(v);
      return String(v);
    } catch { return '?'; }
  }

  function __cl(v) { return dc(v); }

  // Runtime polyfills
  const runtime = `
    if(!Array.prototype.add) Object.defineProperty(Array.prototype,'add',{value:function(x){this.push(x);return true},configurable:true});
    if(!Array.prototype.get) Object.defineProperty(Array.prototype,'get',{value:function(i){return this[i]},configurable:true});
    if(!Array.prototype.remove) Object.defineProperty(Array.prototype,'remove',{value:function(x){const i=typeof x==='number'&&x<this.length&&Number.isInteger(x)?x:this.indexOf(x);if(i>=0)return this.splice(i,1)[0]},configurable:true});
    if(!Set.prototype.includes) Object.defineProperty(Set.prototype,'includes',{value:function(x){return this.has(x)},configurable:true});
    Object.defineProperty(Set.prototype,'length',{get:function(){return this.size},configurable:true});
    Object.defineProperty(Map.prototype,'length',{get:function(){return this.size},configurable:true});
  `;

  const paramNames = Object.keys(inputVars);
  const paramValues = Object.values(inputVars).map(dc);

  // Record initial state
  __step(0, 'Initial state', inputVars);

  const fullCode = `"use strict";\n${runtime}\n${instrumentedCode}`;

  try {
    // Try to construct the function — this catches syntax errors
    const fn = new Function('__step', '__sf', '__cl', ...paramNames, fullCode);
    fn(__step, __sf, __cl, ...paramValues);
    return { steps, error: null };
  } catch (err) {
    // Syntax error or runtime error
    return { steps, error: err.message };
  }
}

// ═══ Auto-detect structures from variable values ═══
export function detectStructures(allVars) {
  const out = [];
  for (const [name, value] of Object.entries(allVars)) {
    if (!value || name.startsWith('__')) continue;
    const s = classify(name, value);
    if (s) out.push(s);
  }
  return out;
}

function classify(name, value) {
  if (value == null) return null;
  if (value instanceof Map) {
    try {
      return { id: name, type: 'hashmap', data: { entries: [...value.entries()].slice(0, 20).map(([k, v]) => ({ key: String(k), value: String(v) })), label: name } };
    } catch { return null; }
  }
  if (value instanceof Set) {
    try {
      return { id: name, type: 'hashmap', data: { entries: [...value].slice(0, 20).map((v) => ({ key: String(v), value: '✓' })), label: name + ' (Set)' } };
    } catch { return null; }
  }
  if (Array.isArray(value)) {
    if (value.length > 50) return null;
    if (value.length > 0 && Array.isArray(value[0])) {
      if (name.toLowerCase().includes('adj') || name.toLowerCase().includes('graph')) return mkGraph(name, value);
      return { id: name, type: 'matrix', data: { grid: value.map((r) => Array.isArray(r) ? r.map(fc) : [fc(r)]), label: name } };
    }
    return { id: name, type: 'array', data: { values: value.map(fc), label: name } };
  }
  return null;
}

function fc(v) { return v == null ? '—' : v === Infinity ? '∞' : v === -Infinity ? '-∞' : v === true ? 'T' : v === false ? 'F' : v; }

function mkGraph(name, adj) {
  const V = adj.length;
  if (V > 20) return null;
  const R = Math.min(120, 20 + V * 12), cx = 210, cy = 140;
  const nodes = [], edges = [], seen = new Set();
  for (let i = 0; i < V; i++) {
    const a = (2 * Math.PI * i) / V - Math.PI / 2;
    nodes.push({ id: i, x: Math.round(cx + R * Math.cos(a)), y: Math.round(cy + R * Math.sin(a)) });
  }
  for (let u = 0; u < V; u++) {
    if (!Array.isArray(adj[u])) continue;
    for (const nb of adj[u]) {
      const v = Array.isArray(nb) ? nb[0] : typeof nb === 'number' ? nb : null;
      if (v == null || v >= V || v < 0) continue;
      const w = Array.isArray(nb) && nb.length > 1 ? nb[1] : undefined;
      const k = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (!seen.has(k)) { seen.add(k); edges.push({ from: u, to: v, weight: w }); }
    }
  }
  return { id: name, type: 'graph', data: { nodes, edges, label: name } };
}

export function serializeForDisplay(vars) {
  const r = {};
  for (const [k, v] of Object.entries(vars)) {
    if (k.startsWith('__')) continue;
    try {
      if (v instanceof Map) r[k] = `Map{${[...v.entries()].slice(0, 8).map(([a, b]) => `${a}:${b}`).join(', ')}}`;
      else if (v instanceof Set) r[k] = `{${[...v].slice(0, 8).join(', ')}}`;
      else if (Array.isArray(v)) r[k] = v.length <= 20 ? v.map(fc) : `[${v.slice(0, 10).join(',')}...(${v.length})]`;
      else if (v === Infinity) r[k] = '∞';
      else if (v == null) r[k] = '—';
      else r[k] = v;
    } catch { r[k] = '?'; }
  }
  return r;
}

function dc(v) {
  try {
    if (v == null || typeof v !== 'object') return v;
    if (v instanceof Map) return new Map([...v].map(([a, b]) => [dc(a), dc(b)]));
    if (v instanceof Set) return new Set([...v].map(dc));
    if (Array.isArray(v)) return v.map(dc);
    const r = {}; for (const k of Object.keys(v)) r[k] = dc(v[k]); return r;
  } catch { return v; }
}
