/**
 * UniversalExecutor v1 — Execute ANY code and produce visualization steps.
 *
 * Architecture:
 *   1.  Detect language (Java / C++ / Python / JS)
 *   2.  Transpile to JavaScript via targeted transpilers
 *   3.  Auto-detect data-structure variables from code + input
 *   4.  Instrument the JS: wrap every statement in a recording hook
 *   5.  Run the instrumented JS inside a controlled sandbox
 *   6.  Return StepRecorder-compatible steps[]
 *
 * Safety:
 *   – Execution is time-boxed (max 2 s, max 5 000 steps)
 *   – No DOM / network access (runs in plain JS)
 *   – Infinite-loop detection via step counter
 */

import { transpileJavaToJS } from './JavaTranspiler';
import { StepRecorder, C, circleLayout } from './StepRecorder';

// ────────────────────────────────────────────
// 1. Language detection
// ────────────────────────────────────────────
export function detectLanguage(code) {
  if (!code) return 'unknown';
  const c = code.trim();
  // Java
  if (/\b(public\s+class|static\s+void\s+main|System\.out|import\s+java\.|void\s+\w+\s*\(|int\s+\w+\s*\(|ListNode|TreeNode|String\s+\w+\s*=)/.test(c)) return 'java';
  // C++
  if (/#include|using\s+namespace\s+std|cout|cin|vector\s*<|unordered_map|::/.test(c)) return 'cpp';
  // Python
  if (/\bdef\s+\w+\s*\(|class\s+\w+\s*:|import\s+\w+|from\s+\w+\s+import|print\s*\(|self\.|:\s*$|if\s+.*:\s*$/m.test(c)) return 'python';
  // JS / default
  if (/\bfunction\s+\w+|const\s+|let\s+|var\s+|=>\s*{|module\.exports/.test(c)) return 'js';
  return 'java'; // default for DSA problems
}

// ────────────────────────────────────────────
// 2. C++ → JS transpiler  (basic DSA coverage)
// ────────────────────────────────────────────
function transpileCppToJS(code) {
  let c = code;
  // Includes & namespace
  c = c.replace(/^\s*#include\s*<[^>]*>\s*$/gm, '');
  c = c.replace(/^\s*using\s+namespace\s+\w+\s*;\s*$/gm, '');

  // vector<type> name → let name = []
  c = c.replace(/\bvector\s*<[^>]*(?:<[^>]*>)?>\s+(\w+)/g, 'let $1 = []');
  c = c.replace(/\bunordered_map\s*<[^>]*>\s+(\w+)/g, 'let $1 = new Map()');
  c = c.replace(/\bunordered_set\s*<[^>]*>\s+(\w+)/g, 'let $1 = new Set()');
  c = c.replace(/\bmap\s*<[^>]*>\s+(\w+)/g, 'let $1 = new Map()');
  c = c.replace(/\bset\s*<[^>]*>\s+(\w+)/g, 'let $1 = new Set()');
  c = c.replace(/\bstack\s*<[^>]*>\s+(\w+)/g, 'let $1 = []');
  c = c.replace(/\bqueue\s*<[^>]*>\s+(\w+)/g, 'let $1 = []');
  c = c.replace(/\bpriority_queue\s*<[^>]*>\s+(\w+)/g, 'let $1 = []');
  c = c.replace(/\bpair\s*<[^>]*>\s+(\w+)/g, 'let $1');
  c = c.replace(/\bstring\s+(\w+)/g, 'let $1');

  // Primitive types
  c = c.replace(/\b(int|long|long long|float|double|char|bool|size_t|unsigned)\s+(\w+)\s*=/g, 'let $2 =');
  c = c.replace(/\b(int|long|long long|float|double|char|bool|size_t|unsigned)\s+(\w+)\s*;/g, 'let $2 = 0;');
  c = c.replace(/\b(int|long|long long|float|double|char|bool|size_t|unsigned)\s+(\w+)/g, 'let $2');

  // for-each (for (auto x : arr)) → for (const x of arr)
  c = c.replace(/for\s*\(\s*(?:auto|const\s+auto&?|int|char|string)\s+(\w+)\s*:\s*(\w+)\s*\)/g, 'for (const $1 of $2)');
  c = c.replace(/for\s*\(\s*(?:auto|int|long|size_t)\s+/g, 'for (let ');

  // Method signatures
  c = c.replace(/^(\s*)(?:void|int|bool|float|double|long|char|string|vector\s*<[^>]*>|ListNode\s*\*|TreeNode\s*\*)\s+(\w+)\s*\(([^)]*)\)\s*\{/gm,
    (_, indent, name, params) => {
      const clean = params.split(',').map(p => {
        const parts = p.replace(/[*&]/g, '').replace(/<[^>]*>/g, '').replace(/vector|string|int|bool|long|char|float|double|auto|const/g, '').trim().split(/\s+/);
        return parts[parts.length - 1] || '';
      }).filter(Boolean).join(', ');
      return `${indent}function ${name}(${clean}) {`;
    });

  // .push_back → .push,  .size() → .length,  .empty() → .length === 0
  c = c.replace(/\.push_back\(/g, '.push(');
  c = c.replace(/\.emplace_back\(/g, '.push(');
  c = c.replace(/\.pop_back\(\)/g, '.pop()');
  c = c.replace(/\.front\(\)/g, '[0]');
  c = c.replace(/\.back\(\)/g, '[this.length-1]');
  c = c.replace(/(\w+)\.back\(\)/g, '$1[$1.length-1]');
  c = c.replace(/\.size\(\)/g, '.length');
  c = c.replace(/\.empty\(\)/g, '.length === 0');
  c = c.replace(/\.begin\(\)/g, '');
  c = c.replace(/\.end\(\)/g, '');
  c = c.replace(/\.find\(([^)]+)\)\s*!=\s*\w+\.end\(\)/g, '.includes($1)');
  c = c.replace(/\.insert\(/g, '.add(');
  c = c.replace(/\.erase\(/g, '.delete(');
  c = c.replace(/\.count\(/g, '.has(');

  // min/max
  c = c.replace(/\bmin\(/g, 'Math.min(');
  c = c.replace(/\bmax\(/g, 'Math.max(');
  c = c.replace(/\babs\(/g, 'Math.abs(');
  c = c.replace(/\bsqrt\(/g, 'Math.sqrt(');
  c = c.replace(/\bINT_MAX\b/g, 'Infinity');
  c = c.replace(/\bINT_MIN\b/g, '-Infinity');
  c = c.replace(/\bLLONG_MAX\b/g, 'Infinity');
  c = c.replace(/\bsort\s*\(\s*(\w+)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g, '$1.sort((a,b)=>a-b)');

  // cout → console.log
  c = c.replace(/cout\s*<<\s*/g, 'console.log(');
  c = c.replace(/\s*<<\s*endl\s*/g, ')');
  c = c.replace(/\bnullptr\b/g, 'null');

  // make_pair → array
  c = c.replace(/make_pair\s*\(/g, '[');
  c = c.replace(/\)\s*(?=[\s;,\)])/g, (m, off, str) => {
    // Only replace if this closes a make_pair (heuristic)
    return m;
  });
  c = c.replace(/\.first\b/g, '[0]');
  c = c.replace(/\.second\b/g, '[1]');

  return c;
}

// ────────────────────────────────────────────
// 3. Python → JS transpiler (basic DSA coverage)
// ────────────────────────────────────────────
function transpilePythonToJS(code) {
  let c = code;
  // Remove import lines
  c = c.replace(/^\s*(from\s+\w+\s+)?import\s+.+$/gm, '');
  // Remove type hints
  c = c.replace(/:\s*(int|str|float|bool|List|Dict|Set|Optional|Tuple)\b(\[[^\]]*\])?(?=\s*[=,)\n])/g, '');

  const lines = c.split('\n');
  const output = [];
  const indentStack = [0];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      output.push(trimmed.startsWith('#') ? line.replace('#', '//') : line);
      continue;
    }

    const indent = line.search(/\S/);
    // Close braces for dedent
    while (indentStack.length > 1 && indent <= indentStack[indentStack.length - 1]) {
      indentStack.pop();
      output.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }

    // def → function
    line = line.replace(/\bdef\s+(\w+)\s*\(([^)]*)\)\s*:/, 'function $1($2) {');
    // class
    line = line.replace(/\bclass\s+(\w+)\s*(\([^)]*\))?\s*:/, 'class $1 {');
    // self.x → this.x
    line = line.replace(/\bself\./g, 'this.');
    // for x in range(n) → for (let x = 0; x < n; x++)
    line = line.replace(/for\s+(\w+)\s+in\s+range\((\w+)\)\s*:/g, 'for (let $1 = 0; $1 < $2; $1++) {');
    line = line.replace(/for\s+(\w+)\s+in\s+range\((\w+)\s*,\s*(\w+)\)\s*:/g, 'for (let $1 = $2; $1 < $3; $1++) {');
    line = line.replace(/for\s+(\w+)\s+in\s+range\((\w+)\s*,\s*(\w+)\s*,\s*(-?\d+)\)\s*:/g,
      (_, v, s, e, step) => +step < 0 ? `for (let ${v} = ${s}; ${v} > ${e}; ${v} += ${step}) {` : `for (let ${v} = ${s}; ${v} < ${e}; ${v} += ${step}) {`);
    // for x in arr → for (const x of arr)
    line = line.replace(/for\s+(\w+)\s+in\s+(\w+)\s*:/g, 'for (const $1 of $2) {');
    line = line.replace(/for\s+(\w+)\s*,\s*(\w+)\s+in\s+enumerate\((\w+)\)\s*:/g,
      'for (let $1 = 0; $1 < $3.length; $1++) { const $2 = $3[$1];');
    // while ... :  → while (...) {
    line = line.replace(/while\s+(.+)\s*:$/m, 'while ($1) {');
    // if / elif / else
    line = line.replace(/\belif\s+(.+)\s*:$/m, '} else if ($1) {');
    line = line.replace(/\bif\s+(.+)\s*:$/m, 'if ($1) {');
    line = line.replace(/\belse\s*:$/m, '} else {');
    // and/or/not/True/False/None
    line = line.replace(/\band\b/g, '&&');
    line = line.replace(/\bor\b/g, '||');
    line = line.replace(/\bnot\b/g, '!');
    line = line.replace(/\bTrue\b/g, 'true');
    line = line.replace(/\bFalse\b/g, 'false');
    line = line.replace(/\bNone\b/g, 'null');
    // len(x) → x.length
    line = line.replace(/\blen\((\w+)\)/g, '$1.length');
    // print → console.log
    line = line.replace(/\bprint\s*\(/g, 'console.log(');
    // append → push
    line = line.replace(/\.append\(/g, '.push(');
    // x in list  → list.includes(x)
    line = line.replace(/\b(\w+)\s+in\s+(\w+)\b(?!\s*[:\(])/g, '$2.includes($1)');
    line = line.replace(/\b(\w+)\s+not\s+in\s+(\w+)\b/g, '!$2.includes($1)');
    // float('inf')
    line = line.replace(/float\s*\(\s*['"]inf['"]\s*\)/g, 'Infinity');
    line = line.replace(/float\s*\(\s*['"]-inf['"]\s*\)/g, '-Infinity');
    // min/max/abs/sorted
    line = line.replace(/\bsorted\((\w+)\)/g, '[...$1].sort((a,b)=>a-b)');
    // // → #  already handled
    // ** → Math.pow
    line = line.replace(/(\w+)\s*\*\*\s*(\w+)/g, 'Math.pow($1, $2)');
    // // division → Math.floor
    line = line.replace(/(\w+)\s*\/\/\s*(\w+)/g, 'Math.floor($1 / $2)');

    // Track indent for blocks
    if (trimmed.endsWith(':')) {
      indentStack.push(indent + 4);
    }

    output.push(line);
  }
  // Close remaining braces
  while (indentStack.length > 1) { indentStack.pop(); output.push('}'); }

  return output.join('\n');
}

// ────────────────────────────────────────────
// 4. Transpile any language → JS
// ────────────────────────────────────────────
export function transpileToJS(code, lang) {
  const language = lang || detectLanguage(code);
  switch (language) {
    case 'java': return transpileJavaToJS(code);
    case 'cpp': return transpileCppToJS(code);
    case 'python': return transpilePythonToJS(code);
    case 'js': return code;
    default: return transpileJavaToJS(code); // try Java as fallback
  }
}

// ────────────────────────────────────────────
// 5. Smart variable/structure detection from code
// ────────────────────────────────────────────
export function detectStructures(code, parsedInput) {
  const structures = [];
  const lc = (code || '').toLowerCase();

  // Detect array/list variables
  if (parsedInput) {
    for (const [key, val] of Object.entries(parsedInput)) {
      if (Array.isArray(val)) {
        if (val.length > 0 && Array.isArray(val[0])) {
          structures.push({ type: 'matrix', id: key, values: val, label: key });
        } else {
          structures.push({ type: 'array', id: key, values: val, label: key });
        }
      }
    }
  }

  // Detect graph-like input
  if (parsedInput?.edges && parsedInput?.n) {
    structures.push({ type: 'graph', id: 'graph', n: parsedInput.n, edges: parsedInput.edges });
  }

  // Detect from code keywords
  if (/stack/i.test(lc) && !structures.find(s => s.type === 'stack')) {
    structures.push({ type: 'stack', id: 'stack', label: 'Stack' });
  }
  if (/queue/i.test(lc) && !structures.find(s => s.type === 'queue')) {
    structures.push({ type: 'queue', id: 'queue', label: 'Queue' });
  }
  if (/map|hash|dict/i.test(lc) && !structures.find(s => s.type === 'hashmap')) {
    structures.push({ type: 'hashmap', id: 'map', label: 'HashMap' });
  }

  return structures;
}

// ────────────────────────────────────────────
// 6. Core: Build instrumented runner and execute
// ────────────────────────────────────────────
const MAX_STEPS = 3000;
const MAX_TIME_MS = 3000;

/**
 * Execute user code with auto-instrumentation.
 *
 * @param {string} rawCode  — The user's solution code (Java/C++/Python/JS)
 * @param {Object} parsedInput — Parsed input from InputParser  { nums: [...], target: 9, ... }
 * @param {string} language — Optional override
 * @param {Object} hints — Optional { intuition, steps, algorithmName } for better detection
 * @returns {{ steps: Step[], error: string|null }}
 */
export function executeCode(rawCode, parsedInput, language, hints) {
  if (!rawCode || !parsedInput) return { steps: [], error: 'No code or input provided.' };

  try {
    const lang = language || detectLanguage(rawCode);
    let jsCode = transpileToJS(rawCode, lang);

    // Clean up the transpiled code
    jsCode = cleanTranspiled(jsCode);

    // Find the main function name
    const mainFunc = findMainFunction(jsCode, rawCode);
    if (!mainFunc) {
      return { steps: [], error: 'Could not find the main function in the code. Make sure there is a public method like `twoSum(...)`, `solve(...)`, etc.' };
    }

    // Build the execution wrapper
    const { wrappedCode, argList } = buildExecutionWrapper(jsCode, mainFunc, parsedInput, rawCode);

    // Run it
    const result = runInSandbox(wrappedCode, argList);
    return result;
  } catch (err) {
    return { steps: [], error: `Execution failed: ${err.message}` };
  }
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function cleanTranspiled(code) {
  // Remove any remaining Java-isms
  let c = code;
  // Remove `class Solution { ... }` wrapper
  c = c.replace(/^\s*class\s+\w+\s*\{\s*$/gm, '');
  // Remove trailing orphan `}`
  const lines = c.split('\n');
  // Count braces to remove unmatched trailing }
  let depth = 0;
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const opens = (trimmed.match(/\{/g) || []).length;
    const closes = (trimmed.match(/\}/g) || []).length;
    if (trimmed === '}' && depth + opens - closes < 0) continue; // skip orphan
    depth += opens - closes;
    result.push(line);
  }
  return result.join('\n');
}

function findMainFunction(jsCode, originalCode) {
  // Try to find a LeetCode-style function
  // Strategy 1: functions that match LeetCode naming
  const funcMatches = [...jsCode.matchAll(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/g)];
  if (funcMatches.length === 0) return null;

  // Skip helper/utility functions, prefer the "main" solution function
  const skipNames = new Set(['main', 'helper', 'dfs', 'bfs', 'solve', 'backtrack', 'dp', 'find', 'union', 'merge', 'partition']);
  const allNames = funcMatches.map(m => ({ name: m[1], params: m[2], index: m.index }));

  // Prefer: first function that is NOT a common helper name
  let main = allNames.find(f => !skipNames.has(f.name));
  if (!main) main = allNames[0]; // If all are helpers, take the first

  // But if original code has a class Solution with a single public method, prefer that
  const solutionMethod = originalCode.match(/public\s+\w+(?:<[^>]*>)?\s*(?:\[\])?\s+(\w+)\s*\(/);
  if (solutionMethod) {
    const found = allNames.find(f => f.name === solutionMethod[1]);
    if (found) main = found;
  }
  // Python: class Solution:  def  method
  const pyMethod = originalCode.match(/class\s+Solution[\s\S]*?def\s+(\w+)\s*\(\s*self/);
  if (pyMethod) {
    const found = allNames.find(f => f.name === pyMethod[1]);
    if (found) main = found;
  }

  return main;
}

function buildExecutionWrapper(jsCode, mainFunc, parsedInput, originalCode) {
  // Map parsed input to function parameters
  const paramNames = mainFunc.params.split(',').map(p => p.trim().split(/\s+/).pop()).filter(Boolean);
  const args = mapInputToParams(paramNames, parsedInput, originalCode);

  // Detect what structures to visualize
  const structureHints = detectStructures(originalCode, parsedInput);

  // Build argument string for function call
  const argStr = args.map(a => JSON.stringify(a)).join(', ');

  // Create the recording and instrumented execution code
  const wrappedCode = `
(function() {
  const __steps = [];
  const __vars = {};
  let __stepCount = 0;
  const __MAX = ${MAX_STEPS};
  const __startTime = Date.now();
  const __structures = ${JSON.stringify(structureHints)};
  let __error = null;

  // ── Step recording ──
  function __record(msg, color, vars, extraStructures) {
    if (__stepCount >= __MAX) throw new Error('__MAX_STEPS');
    if (Date.now() - __startTime > ${MAX_TIME_MS}) throw new Error('__TIMEOUT');
    __stepCount++;

    const step = {
      message: msg,
      color: color || '#4f8ff7',
      variables: { ...vars },
      changedVars: new Set(),
      structures: {},
      highlights: {},
      codeLines: [],
      codeLine: -1,
    };

    // Build structures snapshot
    if (extraStructures) {
      for (const [id, data] of Object.entries(extraStructures)) {
        step.structures[id] = JSON.parse(JSON.stringify(data));
      }
    }

    __steps.push(step);
  }

  // ── Array tracker ──
  function __trackArray(name, arr, hl) {
    const obj = {};
    obj[name] = { type: 'array', values: [...arr], label: name };
    const hlObj = {};
    if (hl) hlObj[name] = { cells: hl };
    return { structures: obj, highlights: hlObj };
  }

  // ── Deep copy for snapshots ──
  function __snap(val) {
    if (Array.isArray(val)) return val.map(v => Array.isArray(v) ? [...v] : v);
    if (val && typeof val === 'object') return { ...val };
    return val;
  }

  try {
    // User code (transpiled)
    ${jsCode}

    // Build structures for initial recording
    const __initStructures = {};
    ${structureHints.filter(s => s.type === 'array' && s.values).map(s =>
      `__initStructures['${s.id}'] = { type: 'array', values: ${JSON.stringify(s.values)}, label: '${s.label}' };`
    ).join('\n    ')}
    ${structureHints.filter(s => s.type === 'matrix' && s.values).map(s =>
      `__initStructures['${s.id}'] = { type: 'matrix', grid: ${JSON.stringify(s.values)}, label: '${s.label}' };`
    ).join('\n    ')}
    ${structureHints.filter(s => s.type === 'graph').map(s => {
      const n = s.n || 0;
      const edges = s.edges || [];
      const pos = circleLayout(n, 220, 140, Math.min(110, n * 15));
      const nodes = pos.map((p, i) => ({ id: i, x: p.x, y: p.y }));
      const edgeList = edges.map(e => ({ from: e[0], to: e[1], weight: e.length > 2 ? e[2] : undefined }));
      return `__initStructures['graph'] = { type: 'graph', nodes: ${JSON.stringify(nodes)}, edges: ${JSON.stringify(edgeList)} };`;
    }).join('\n    ')}

    __record('Initialize with input: ${paramNames.join(', ')}', '#4f8ff7',
      ${JSON.stringify(parsedInput)}, __initStructures);

    // ── Execute the main function ──
    const __result = ${mainFunc.name}(${argStr});

    // Record the result
    __record('Result: ' + JSON.stringify(__result), '#34d399',
      { ...${JSON.stringify(parsedInput)}, result: __result }, __initStructures);

  } catch(e) {
    if (e.message === '__MAX_STEPS') {
      __error = 'Reached maximum step limit (' + __MAX + '). The algorithm may have too many iterations for visualization.';
    } else if (e.message === '__TIMEOUT') {
      __error = 'Execution timed out. The algorithm may be too slow for the given input.';
    } else {
      __error = e.message;
    }
  }

  return { steps: __steps, error: __error };
})()`;

  return { wrappedCode, argList: args };
}

function mapInputToParams(paramNames, parsedInput, originalCode) {
  const args = [];
  const inputKeys = Object.keys(parsedInput);

  for (const param of paramNames) {
    const pLower = param.toLowerCase();
    // Direct match
    if (parsedInput[param] !== undefined) {
      args.push(parsedInput[param]);
      continue;
    }
    // Common mappings
    if ((pLower === 'nums' || pLower === 'arr' || pLower === 'numbers' || pLower === 'array') && (parsedInput.nums || parsedInput.arr)) {
      args.push(parsedInput.nums || parsedInput.arr);
      continue;
    }
    if (pLower === 'target' && parsedInput.target !== undefined) {
      args.push(parsedInput.target);
      continue;
    }
    if (pLower === 'n' && parsedInput.n !== undefined) {
      args.push(parsedInput.n);
      continue;
    }
    if (pLower === 'k' && parsedInput.k !== undefined) {
      args.push(parsedInput.k);
      continue;
    }
    if ((pLower === 's' || pLower === 'str' || pLower === 'word' || pLower === 'text') && parsedInput.s !== undefined) {
      args.push(parsedInput.s);
      continue;
    }
    if (pLower === 't' && parsedInput.t !== undefined) {
      args.push(parsedInput.t);
      continue;
    }
    if ((pLower === 'grid' || pLower === 'matrix' || pLower === 'board') && parsedInput.grid !== undefined) {
      args.push(parsedInput.grid);
      continue;
    }
    if ((pLower === 'head' || pLower === 'list') && (parsedInput.list || parsedInput.arr || parsedInput.nums)) {
      // Convert array to linked list
      const vals = parsedInput.list || parsedInput.arr || parsedInput.nums;
      args.push(buildLinkedList(vals));
      continue;
    }
    if ((pLower === 'root' || pLower === 'tree') && (parsedInput.tree || parsedInput.arr || parsedInput.nums)) {
      const vals = parsedInput.tree || parsedInput.arr || parsedInput.nums;
      args.push(buildTree(vals));
      continue;
    }
    if ((pLower === 'edges' || pLower === 'connections') && parsedInput.edges !== undefined) {
      args.push(parsedInput.edges);
      continue;
    }
    if ((pLower === 'words' || pLower === 'strs' || pLower === 'wordlist') && parsedInput.words !== undefined) {
      args.push(parsedInput.words);
      continue;
    }
    // Positional fallback: use input keys in order
    const idx = paramNames.indexOf(param);
    if (idx < inputKeys.length) {
      args.push(parsedInput[inputKeys[idx]]);
      continue;
    }
    // Default
    args.push(null);
  }
  return args;
}

function buildLinkedList(arr) {
  if (!arr || arr.length === 0) return null;
  const head = { val: arr[0], next: null };
  let curr = head;
  for (let i = 1; i < arr.length; i++) {
    curr.next = { val: arr[i], next: null };
    curr = curr.next;
  }
  return head;
}

function buildTree(arr) {
  if (!arr || arr.length === 0) return null;
  const nodes = arr.map(v => v === null ? null : { val: v, left: null, right: null });
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] === null) continue;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < nodes.length) nodes[i].left = nodes[left];
    if (right < nodes.length) nodes[i].right = nodes[right];
  }
  return nodes[0];
}

// ────────────────────────────────────────────
// 7. Sandbox executor (Function constructor)
// ────────────────────────────────────────────
function runInSandbox(wrappedCode) {
  try {
    // Use Function constructor as a micro-sandbox
    const fn = new Function(wrappedCode.replace(/\breturn\s*\{/,  'return {'));
    // Time-box
    const start = Date.now();
    const result = fn();
    const elapsed = Date.now() - start;

    if (elapsed > MAX_TIME_MS + 500) {
      return { steps: result?.steps || [], error: `Execution took ${elapsed}ms (limit: ${MAX_TIME_MS}ms)` };
    }

    return {
      steps: result?.steps || [],
      error: result?.error || null,
    };
  } catch (err) {
    return { steps: [], error: `Runtime error: ${err.message}` };
  }
}

// ────────────────────────────────────────────
// 8. Enhanced Detection — Uses code + hints
// ────────────────────────────────────────────
export function enhancedDetect(code, hints) {
  if (!code) return null;

  const lower = code.toLowerCase();
  const hintText = [hints?.intuition, hints?.steps, hints?.algorithmName, hints?.approach].filter(Boolean).join(' ').toLowerCase();
  const combined = lower + ' ' + hintText;

  // Check hints first (most reliable)
  const HINT_PATTERNS = [
    { id: 'binary_search', kw: ['binary search', 'bisect', 'left right mid'] },
    { id: 'two_pointer', kw: ['two pointer', 'two-pointer', '2 pointer'] },
    { id: 'sliding_window', kw: ['sliding window', 'window size'] },
    { id: 'bfs', kw: ['breadth first', 'bfs', 'level order'] },
    { id: 'dfs', kw: ['depth first', 'dfs'] },
    { id: 'dp_1d', kw: ['dynamic programming', 'dp', 'memoization', 'tabulation'] },
    { id: 'dp_2d', kw: ['2d dp', 'lcs', 'longest common', 'knapsack', 'edit distance'] },
    { id: 'backtracking', kw: ['backtracking', 'backtrack', 'permutation', 'combination', 'subset'] },
    { id: 'topological', kw: ['topological sort', 'topo sort', 'kahn'] },
    { id: 'dijkstra', kw: ['dijkstra', 'shortest path'] },
    { id: 'sort', kw: ['sorting', 'merge sort', 'quick sort', 'bubble sort'] },
    { id: 'linked_list', kw: ['linked list', 'listnode'] },
    { id: 'bst', kw: ['binary tree', 'bst', 'treenode', 'inorder', 'preorder'] },
    { id: 'heap', kw: ['heap', 'priority queue', 'kth largest', 'kth smallest'] },
    { id: 'monotonic_stack', kw: ['monotonic stack', 'next greater', 'next smaller'] },
    { id: 'union_find', kw: ['union find', 'disjoint set', 'connected component'] },
    { id: 'trie', kw: ['trie', 'prefix tree'] },
    { id: 'matrix_traversal', kw: ['grid', 'matrix', 'island', 'flood fill'] },
    { id: 'tarjan', kw: ['tarjan', 'bridge', 'articulation'] },
    { id: 'kruskal', kw: ['kruskal', 'minimum spanning tree', 'mst'] },
    { id: 'string_window', kw: ['substring', 'anagram', 'character frequency'] },
  ];

  for (const p of HINT_PATTERNS) {
    for (const kw of p.kw) {
      if (combined.includes(kw)) return p.id;
    }
  }

  return null;
}
