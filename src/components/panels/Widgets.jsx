import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, Eye, Target, TrendingUp, Maximize2,
  Minimize2, X, AlertCircle, ChevronRight, Zap, Clock, HardDrive,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { IconButton } from '@/components/ui/Primitives';
import { APPROACHES } from '@/lib/constants';

// ═══════════════════════════════════════════════
// INTERVIEW TIMER
// ═══════════════════════════════════════════════
export function InterviewTimer() {
  const [running, setRunning] = useState(false);
  const [secs, setSecs] = useState(0);
  const [target, setTarget] = useState(25);
  const ref = useRef(null);

  useEffect(() => {
    if (running) ref.current = setInterval(() => setSecs((s) => s + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const pct = Math.min((secs / (target * 60)) * 100, 100);
  const over = secs > target * 60;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <select
        value={target}
        onChange={(e) => { setTarget(+e.target.value); setSecs(0); setRunning(false); }}
        className="bg-surface-3 border border-border-2 rounded-sm px-2 py-1 text-2xs text-ink-3 outline-none font-sans"
      >
        {[15, 20, 25, 30, 45, 60].map((m) => <option key={m} value={m}>{m}m</option>)}
      </select>
      <div className="w-20 h-1 bg-surface-3 rounded-full overflow-hidden relative">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300
            ${over ? 'bg-accent-red' : 'bg-accent-blue'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-sm font-semibold tabular-nums min-w-[52px]
        ${over ? 'text-accent-red' : 'text-ink-1'}`}>
        {mm}:{ss}
      </span>
      <IconButton icon={running ? Pause : Play} onClick={() => setRunning(!running)} size={13} />
      <IconButton icon={RotateCcw} onClick={() => { setSecs(0); setRunning(false); }} size={12} />
    </div>
  );
}

// ═══════════════════════════════════════════════
// VISUALIZATION PANEL — with fullscreen dialog
// ═══════════════════════════════════════════════
export function VizPanel({ html }) {
  const [fullscreen, setFullscreen] = useState(false);
  const inlineRef = useRef(null);
  const fullRef = useRef(null);

  if (!html) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-ink-4">
        <Eye size={36} className="opacity-25 mb-3" />
        <span className="text-sm font-medium">No visualization yet</span>
        <span className="text-xs text-ink-5 mt-1">Upload or paste HTML in the editor</span>
      </div>
    );
  }

  const iframeDoc = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>*{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#111114;color:#e4e4e7;padding:20px;line-height:1.6}
    </style></head><body>${html}</body></html>`;

  const resizeIframe = (ref) => {
    try {
      if (ref.current) {
        const h = ref.current.contentDocument.body.scrollHeight;
        ref.current.style.height = Math.max(400, h + 40) + 'px';
      }
    } catch {}
  };

  return (
    <>
      {/* Inline preview with expand button */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 5,
          display: 'flex', gap: 6,
        }}>
          <button
            onClick={() => setFullscreen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(79,143,247,0.15)', border: '1px solid rgba(79,143,247,0.3)',
              color: '#93c5fd', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(79,143,247,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(79,143,247,0.15)'; }}
          >
            <Maximize2 size={13} /> Full Screen
          </button>
        </div>
        <iframe
          ref={inlineRef}
          srcDoc={iframeDoc}
          sandbox="allow-scripts"
          style={{ width: '100%', border: 'none', borderRadius: 8, background: '#111114', minHeight: 400 }}
          onLoad={() => resizeIframe(inlineRef)}
        />
      </div>

      {/* Fullscreen dialog */}
      {fullscreen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setFullscreen(false); }}
        >
          <div style={{
            width: '92%', maxWidth: 1400,
            height: '88vh',
            background: '#0e0e12',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}>
            {/* Dialog header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(167,139,250,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Eye size={15} style={{ color: '#a78bfa' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fafaf9', letterSpacing: '-0.02em' }}>
                    Interactive Visualization & Dry Run
                  </div>
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 1 }}>
                    Step through the algorithm — watch data structures update in real time
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => setFullscreen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 14px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#a1a1aa', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Minimize2 size={13} /> Exit
                </button>
                <button
                  onClick={() => setFullscreen(false)}
                  style={{
                    padding: 6, borderRadius: 6,
                    background: 'transparent', border: 'none',
                    color: '#52525b', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Iframe fills remaining space */}
            <div style={{ flex: 1, overflow: 'hidden', padding: 2 }}>
              <iframe
                ref={fullRef}
                srcDoc={iframeDoc}
                sandbox="allow-scripts"
                style={{
                  width: '100%', height: '100%',
                  border: 'none', borderRadius: '0 0 14px 14px',
                  background: '#111114',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════
// HINTS PANEL
// ═══════════════════════════════════════════════
export function HintsPanel({ hints }) {
  const [revealed, setRevealed] = useState([]);
  const valid = (hints || []).filter((h) => {
    const text = typeof h === 'string' ? h : h?.text;
    return text?.trim();
  });

  useEffect(() => setRevealed([]), [hints]);

  if (!valid.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(248,113,113,0.1)' }}>
          <Target size={16} style={{ color: '#f87171' }} />
        </div>
        <span className="text-base font-bold text-ink-1">Hints</span>
        <span className="text-xs text-ink-4 ml-1">({revealed.length}/{valid.length} revealed)</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {valid.map((h, i) => {
          const text = typeof h === 'string' ? h : h.text;
          const shown = revealed.includes(i);
          return (
            <div
              key={i}
              onClick={() => !shown && setRevealed([...revealed, i])}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 18px', borderRadius: 10,
                cursor: shown ? 'default' : 'pointer',
                background: shown ? 'rgba(251,191,36,0.06)' : '#141418',
                border: shown ? '1px solid rgba(251,191,36,0.15)' : '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!shown) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { if (!shown) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
            >
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                fontWeight: 700, color: shown ? '#fbbf24' : '#35353d',
                marginTop: 1, minWidth: 20, flexShrink: 0,
              }}>{i + 1}</span>
              {shown
                ? <span style={{ fontSize: 14.5, color: '#b8b8be', lineHeight: 1.75 }}>{text}</span>
                : <span style={{ fontSize: 14.5, color: '#4e4e58', fontStyle: 'italic' }}>Click to reveal hint</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// COMPLEXITY EXPLANATIONS — interview-ready
// ═══════════════════════════════════════════════
const COMPLEXITY_REASONS = {
  'O(1)': { why: 'Constant time — the operation takes the same time regardless of input size. Usually direct array access, hash lookup, or math formula.', example: 'Accessing arr[i], HashMap.get(), or computing n*(n+1)/2 instead of looping.' },
  'O(log n)': { why: 'Logarithmic — we halve the search space each step. After k steps, we have n/2^k elements left. When n/2^k = 1, k = log₂(n).', example: 'Binary search: each comparison eliminates half the array. 1 billion elements → only ~30 comparisons.' },
  'O(n)': { why: 'Linear — we visit each element exactly once (or a constant number of times). Work scales directly with input size.', example: 'Single pass through array, two-pointer technique, or sliding window. Double the input → double the time.' },
  'O(n log n)': { why: 'Linearithmic — we do O(log n) work for each of n elements. This is the theoretical lower bound for comparison-based sorting.', example: 'Merge sort splits into log n levels, each level processes all n elements. Also: sorting + one-pass, or balanced BST operations on n items.' },
  'O(n^2)': { why: 'Quadratic — for each element, we potentially check every other element. Nested loops where both depend on n.', example: 'Brute force two-sum (check all pairs), bubble sort, or comparing every pair of points. 10x input → 100x time.' },
  'O(n²)': { why: 'Quadratic — for each element, we potentially check every other element. Nested loops where both depend on n.', example: 'Brute force two-sum (check all pairs), bubble sort, or comparing every pair of points. 10x input → 100x time.' },
  'O(n^3)': { why: 'Cubic — three nested loops each depending on n. Usually matrix multiplication or checking all triplets.', example: 'Floyd-Warshall (all-pairs shortest path), naive matrix multiply, or 3Sum brute force.' },
  'O(2^n)': { why: 'Exponential — the problem branches into 2 subproblems at each step without memoization. The recursion tree doubles at each level.', example: 'Naive Fibonacci, generating all subsets, or brute-force backtracking without pruning. Adding 1 to input DOUBLES the work.' },
  'O(n!)': { why: 'Factorial — we try all permutations. First position has n choices, second has n-1, etc. Grows astronomically fast.', example: 'Brute-force traveling salesman, generating all permutations. n=20 → 2.4 quintillion operations.' },
  'O(V + E)': { why: 'Linear in graph size — we visit each vertex once and traverse each edge once. This is the best possible for graph traversal.', example: 'BFS, DFS, topological sort, Tarjan\'s bridges. Single pass through adjacency list.' },
  'O(V+E)': { why: 'Linear in graph size — we visit each vertex once and traverse each edge once. This is the best possible for graph traversal.', example: 'BFS, DFS, topological sort, Tarjan\'s bridges. Single pass through adjacency list.' },
  'O(E log E)': { why: 'Sorting edges dominates. E edges sorted in O(E log E), then Union-Find operations are nearly O(1) each.', example: 'Kruskal\'s MST: sort all edges by weight, then greedily add edges using Union-Find.' },
  'O(E log V)': { why: 'For each edge, we do a heap operation (insert/extract) costing O(log V). V vertices in the heap at most.', example: 'Dijkstra\'s or Prim\'s with a min-heap. Each edge relaxation → one heap operation.' },
  'O(E × (V + E))': { why: 'For each of E edges, we run a full BFS/DFS taking O(V+E). Massively redundant — same graph explored E times.', example: 'Brute-force bridge detection: remove each edge, check connectivity. This is what Tarjan\'s O(V+E) eliminates.' },
  'O(α(n))': { why: 'Inverse Ackermann — effectively O(1) for all practical inputs. α(n) ≤ 4 for n up to 10^80 (atoms in universe).', example: 'Union-Find with path compression + union by rank. Each find/union is amortized nearly constant.' },
  'O(n × α(n))': { why: 'n operations on Union-Find, each amortized O(α(n)) ≈ O(1). Practically linear.', example: 'Processing n edges with Union-Find: Kruskal\'s, connected components, dynamic connectivity.' },
  'O(E × α(n))': { why: 'E union/find operations, each nearly O(1). Essentially O(E) for practical purposes.', example: 'Network connectivity: process each edge with Union-Find to count/merge components.' },
};

function findComplexityExplanation(tc) {
  if (!tc) return null;
  const normalized = tc.trim();
  // Direct match
  if (COMPLEXITY_REASONS[normalized]) return COMPLEXITY_REASONS[normalized];
  // Fuzzy match
  const lower = normalized.toLowerCase();
  for (const [key, val] of Object.entries(COMPLEXITY_REASONS)) {
    if (lower.includes(key.toLowerCase().replace('o(', '').replace(')', ''))) return val;
  }
  // Pattern match
  if (lower.includes('2^n') || lower.includes('2^')) return COMPLEXITY_REASONS['O(2^n)'];
  if (lower.includes('n^3') || lower.includes('n³')) return COMPLEXITY_REASONS['O(n^3)'];
  if (lower.includes('n^2') || lower.includes('n²')) return COMPLEXITY_REASONS['O(n^2)'];
  if (lower.includes('nlogn') || lower.includes('n log n')) return COMPLEXITY_REASONS['O(n log n)'];
  if (lower.includes('e log v')) return COMPLEXITY_REASONS['O(E log V)'];
  if (lower.includes('e log e')) return COMPLEXITY_REASONS['O(E log E)'];
  if (lower.includes('v + e') || lower.includes('v+e')) return COMPLEXITY_REASONS['O(V + E)'];
  if (lower.includes('e ×') || lower.includes('e*(')) return COMPLEXITY_REASONS['O(E × (V + E))'];
  if (lower.includes('α') || lower.includes('alpha') || lower.includes('ackermann')) return COMPLEXITY_REASONS['O(α(n))'];
  if (lower.includes('log')) return COMPLEXITY_REASONS['O(log n)'];
  if (lower.includes('n!')) return COMPLEXITY_REASONS['O(n!)'];
  if (lower === 'o(n)') return COMPLEXITY_REASONS['O(n)'];
  if (lower === 'o(1)') return COMPLEXITY_REASONS['O(1)'];
  return null;
}

// ═══════════════════════════════════════════════
// COMPLEXITY CHART + EXPLANATIONS
// ═══════════════════════════════════════════════
function genData(solutions) {
  return [10, 50, 100, 500, 1000, 5000, 10000].map((n) => {
    const row = { n };
    solutions.forEach((s) => {
      const tc = (s.time_complexity || '').toLowerCase();
      let ops = n;
      if (tc.includes('2^n')) ops = Math.min(2 ** Math.min(n, 25), 1e12);
      else if (tc.includes('n^3')) ops = n ** 3;
      else if (tc.includes('n^2') || tc.includes('n²')) ops = n * n;
      else if (tc.includes('nlogn') || tc.includes('n log n')) ops = n * Math.log2(Math.max(n, 2));
      else if (tc.includes('e × (v + e)') || tc.includes('e*(v+e)')) ops = 2 * n * 3 * n;
      else if (tc.includes('e log')) ops = 2 * n * Math.log2(Math.max(n, 2));
      else if (tc.includes('v + e') || tc.includes('v+e')) ops = 3 * n;
      else if (tc.includes('log')) ops = Math.log2(Math.max(n, 2));
      else if (tc.includes('α') || tc.includes('alpha')) ops = 5;
      else if (tc.includes('(1)')) ops = 1;
      else if (tc.includes('n!')) ops = Math.min(n <= 12 ? Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1) : 1e12, 1e12);
      row[s.approach_type] = Math.max(1, Math.round(ops));
    });
    return row;
  });
}

const CHART_COLORS = { 'Brute Force': '#f87171', 'Better': '#fbbf24', 'Optimal': '#34d399' };

export function ComplexityChart({ solutions }) {
  const data = useMemo(() => genData(solutions), [solutions]);
  const [expandedApproach, setExpandedApproach] = useState(null);

  // Build comparison explanations
  const comparisons = useMemo(() => {
    if (solutions.length < 2) return [];
    const result = [];
    for (let i = 0; i < solutions.length - 1; i++) {
      const a = solutions[i], b = solutions[i + 1];
      if (a.time_complexity && b.time_complexity) {
        // Calculate speedup at n=10000
        const aOps = data[data.length - 1]?.[a.approach_type] || 1;
        const bOps = data[data.length - 1]?.[b.approach_type] || 1;
        const speedup = Math.round(aOps / bOps);
        result.push({
          from: a.approach_type,
          to: b.approach_type,
          fromTC: a.time_complexity,
          toTC: b.time_complexity,
          speedup: speedup > 1 ? speedup : null,
        });
      }
    }
    return result;
  }, [solutions, data]);

  return (
    <div style={{ padding: 32 }}>
      {/* Chart */}
      <div style={{
        background: '#0e0e12', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.05)',
        padding: 28, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(79,143,247,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={17} style={{ color: '#4f8ff7' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fafaf9', letterSpacing: '-0.02em' }}>
              Time Complexity Comparison
            </div>
            <div style={{ fontSize: 12, color: '#71717a', marginTop: 1 }}>
              Operations count as input size grows (log scale)
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="n" tick={{ fontSize: 11, fill: '#4e4e58' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.07)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#4e4e58' }} scale="log" domain={['auto', 'auto']}
              tickFormatter={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(0)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v}
              axisLine={{ stroke: 'rgba(255,255,255,0.07)' }} tickLine={false} />
            <Tooltip contentStyle={{
              background: '#08080a', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", padding: '10px 14px',
            }} formatter={(v) => [v.toLocaleString() + ' ops', undefined]} />
            {solutions.map((s) => (
              <Area key={s.approach_type} type="monotone" dataKey={s.approach_type}
                stroke={CHART_COLORS[s.approach_type] || '#60a5fa'}
                fill={CHART_COLORS[s.approach_type] || '#60a5fa'}
                fillOpacity={0.08} strokeWidth={2.5} dot={false} />
            ))}
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Complexity cards */}
        <div style={{
          display: 'grid', gap: 12, marginTop: 24,
          gridTemplateColumns: `repeat(${solutions.length}, 1fr)`,
        }}>
          {solutions.map((s) => {
            const c = APPROACHES[s.approach_type] || APPROACHES.Optimal;
            return (
              <div key={s.approach_type} style={{
                padding: '18px 20px', borderRadius: 12,
                background: c.bg, border: `1px solid ${c.border}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, color: c.color, marginBottom: 6 }}>
                  {s.approach_type}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Clock size={14} style={{ color: c.color, opacity: 0.6 }} />
                  <span style={{ fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: c.color }}>
                    {s.time_complexity || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <HardDrive size={13} style={{ color: '#52525b' }} />
                  <span style={{ fontSize: 13, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.space_complexity || '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Speedup comparison arrows ─── */}
      {comparisons.length > 0 && (
        <div style={{
          background: '#0e0e12', borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.05)',
          padding: 24, marginBottom: 24,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fafaf9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={15} style={{ color: '#fbbf24' }} />
            Why does each optimization matter?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comparisons.map((comp, i) => {
              const fromC = APPROACHES[comp.from] || APPROACHES['Brute Force'];
              const toC = APPROACHES[comp.to] || APPROACHES.Optimal;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                  background: 'rgba(255,255,255,0.02)', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ textAlign: 'center', minWidth: 90 }}>
                    <div style={{ fontSize: 11, color: fromC.color, fontWeight: 600, marginBottom: 2 }}>{comp.from}</div>
                    <div style={{ fontSize: 16, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: fromC.color }}>
                      {comp.fromTC}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                    <ChevronRight size={20} style={{ color: '#4f8ff7' }} />
                    {comp.speedup && comp.speedup > 1 && (
                      <div style={{
                        fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700, color: '#34d399', marginTop: 2,
                      }}>
                        {comp.speedup >= 1000 ? `${(comp.speedup / 1000).toFixed(0)}K` : comp.speedup}x faster
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: '#52525b', marginTop: 1 }}>at n=10K</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 90 }}>
                    <div style={{ fontSize: 11, color: toC.color, fontWeight: 600, marginBottom: 2 }}>{comp.to}</div>
                    <div style={{ fontSize: 16, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: toC.color }}>
                      {comp.toTC}
                    </div>
                  </div>
                  <div style={{ flex: 1, marginLeft: 8 }}>
                    <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.7 }}>
                      {comp.from} does redundant work that {comp.to} eliminates.
                      {comp.speedup && comp.speedup > 100 && (
                        <span style={{ color: '#34d399', fontWeight: 600 }}> For n=10,000, that's {comp.speedup.toLocaleString()}x fewer operations.</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Detailed interview-ready explanations ─── */}
      <div style={{
        background: '#0e0e12', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.05)',
        padding: 28,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fafaf9', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={15} style={{ color: '#22d3ee' }} />
          Interview Explanation — How to explain each complexity
        </div>
        <div style={{ fontSize: 12, color: '#52525b', marginBottom: 20 }}>
          When asked "Why is this O(n log n)?" in an interview, here's exactly what to say:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {solutions.map((s) => {
            const c = APPROACHES[s.approach_type] || APPROACHES.Optimal;
            const timeExp = findComplexityExplanation(s.time_complexity);
            const spaceExp = findComplexityExplanation(s.space_complexity);
            const isExpanded = expandedApproach === s.approach_type;

            return (
              <div key={s.approach_type} style={{
                borderRadius: 12, overflow: 'hidden',
                border: `1px solid ${isExpanded ? c.border : 'rgba(255,255,255,0.04)'}`,
                transition: 'all 0.2s',
              }}>
                {/* Header — always visible */}
                <div
                  onClick={() => setExpandedApproach(isExpanded ? null : s.approach_type)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', cursor: 'pointer',
                    background: isExpanded ? c.bg : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%', background: c.color,
                    flexShrink: 0, opacity: isExpanded ? 1 : 0.5,
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 650, color: isExpanded ? c.color : '#b8b8be' }}>
                      {s.approach_type}
                    </span>
                    <span style={{
                      marginLeft: 10, fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600, color: isExpanded ? c.color : '#71717a',
                    }}>
                      Time: {s.time_complexity || '—'}
                    </span>
                    <span style={{
                      marginLeft: 14, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                      color: '#52525b',
                    }}>
                      Space: {s.space_complexity || '—'}
                    </span>
                  </div>
                  <ChevronRight size={16} style={{
                    color: '#52525b', transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                  }} />
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px' }}>
                    {/* Time complexity */}
                    {timeExp && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                        }}>
                          <Clock size={14} style={{ color: c.color }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>
                            Time: {s.time_complexity}
                          </span>
                        </div>
                        <div style={{
                          padding: '14px 18px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <div style={{ fontSize: 13.5, color: '#b8b8be', lineHeight: 1.8, marginBottom: 10 }}>
                            <strong style={{ color: '#e4e4e7' }}>Why:</strong> {timeExp.why}
                          </div>
                          <div style={{
                            fontSize: 12.5, color: '#71717a', lineHeight: 1.7,
                            padding: '10px 14px', background: 'rgba(79,143,247,0.04)',
                            borderRadius: 8, borderLeft: '3px solid rgba(79,143,247,0.3)',
                          }}>
                            <strong style={{ color: '#93c5fd' }}>Interview example:</strong> {timeExp.example}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Space complexity */}
                    {spaceExp && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                        }}>
                          <HardDrive size={14} style={{ color: '#71717a' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>
                            Space: {s.space_complexity}
                          </span>
                        </div>
                        <div style={{
                          padding: '14px 18px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <div style={{ fontSize: 13.5, color: '#b8b8be', lineHeight: 1.8 }}>
                            <strong style={{ color: '#e4e4e7' }}>Why:</strong> {spaceExp.why}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* No explanation found */}
                    {!timeExp && !spaceExp && (
                      <div style={{ marginTop: 12, fontSize: 13, color: '#52525b', fontStyle: 'italic' }}>
                        No detailed explanation available for this complexity.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}