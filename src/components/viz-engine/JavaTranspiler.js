/**
 * JavaTranspiler v3 — Line-by-line approach for maximum robustness
 * 
 * Key change: method signatures detected by checking if a line ends with '{'
 * and contains 'name(params)', NOT by complex multiline regex.
 */

const JAVA_TYPES = /\b(?:int|long|float|double|boolean|char|String|byte|short|void)\b/;
const CONTROL = new Set(['if', 'while', 'for', 'else', 'switch', 'try', 'catch', 'finally', 'do']);

export function transpileJavaToJS(javaCode) {
  if (!javaCode) return '';

  // Phase 0: Protect string/char literals
  const strings = [];
  let code = javaCode.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, (m) => {
    strings.push(m); return `__S${strings.length - 1}__`;
  });

  // Phase 1: Remove boilerplate
  code = code.replace(/^\s*(package|import)\s+[^;]+;\s*$/gm, '');
  code = code.replace(/\bpublic\s+class\s+\w+\s*\{/, '');
  code = code.replace(/\b(public|private|protected)\s+/g, '');
  code = code.replace(/\bstatic\s+/g, '');
  code = code.replace(/\bfinal\s+/g, '');
  code = code.replace(/@\w+(\([^)]*\))?\s*/g, '');

  // Phase 2: Process line by line
  const lines = code.split('\n');
  const output = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    const indent = line.match(/^(\s*)/)?.[1] || '';

    // Skip empty/comments
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      output.push(line);
      continue;
    }

    // ── Method signature: ends with '{', has 'name(params)' ──
    if (trimmed.endsWith('{') && !trimmed.startsWith('//')) {
      const funcMatch = trimmed.match(/(\w+)\s*\(([^)]*)\)\s*\{$/);
      if (funcMatch && !CONTROL.has(funcMatch[1]) && !trimmed.startsWith('function ')) {
        const funcName = funcMatch[1];
        const rawParams = funcMatch[2];
        // Strip Java types from parameters
        const cleanParams = rawParams.split(',').map((p) => {
          const clean = p.replace(/<[^>]*(?:<[^>]*>)?>/g, '').replace(/\[\]/g, '').replace(/\.\.\./g, '').trim();
          const parts = clean.split(/\s+/);
          return parts.length > 0 ? parts[parts.length - 1] : '';
        }).filter(Boolean).join(', ');
        output.push(`${indent}function ${funcName}(${cleanParams}) {`);
        continue;
      }
    }

    // ── 2D array creation ──
    line = line.replace(/\b(?:int|long|double|float|boolean|char|byte|short)\s*\[\]\[\]\s+(\w+)\s*=\s*new\s+\w+\[([^\]]+)\]\[([^\]]+)\]/g,
      'let $1 = Array.from({length:$2},()=>new Array($3).fill(0))');
    // ── 1D array creation ──
    line = line.replace(/\b(?:int|long|double|float|boolean|char|byte|short)\s*\[\]\s+(\w+)\s*=\s*new\s+\w+\[([^\]]+)\]/g,
      'let $1 = new Array($2).fill(0)');
    line = line.replace(/\bboolean\s*\[\]\s+(\w+)\s*=\s*new\s+boolean\[([^\]]+)\]/g,
      'let $1 = new Array($2).fill(false)');
    // ── Array init with values ──
    line = line.replace(/\b(?:int|long|double|float|char|byte|short)\s*\[\]\s+(\w+)\s*=\s*\{([^}]*)\}/g,
      'let $1 = [$2]');
    // ── Array declaration only ──
    line = line.replace(/\b(?:int|long|double|float|boolean|char|byte|short)\s*\[\]\s+(\w+)\s*;/g, 'let $1 = [];');
    line = line.replace(/\b(?:int|long|double|float|boolean|char|byte|short)\s*\[\]\s+(\w+)/g, 'let $1');

    // ── Collections ──
    line = line.replace(/\b(?:List|ArrayList|LinkedList)\s*<[^>]*(?:<[^>]*>)?>\s+(\w+)\s*=\s*new\s+(?:ArrayList|LinkedList)\s*<[^>]*(?:<[^>]*>)?>\s*\([^)]*\)/g, 'let $1 = []');
    line = line.replace(/\b(?:Map|HashMap|TreeMap|LinkedHashMap)\s*<[^>]*(?:<[^>]*>)?>\s+(\w+)\s*=\s*new\s+\w+\s*<[^>]*(?:<[^>]*>)?>\s*\([^)]*\)/g, 'let $1 = new Map()');
    line = line.replace(/\b(?:Set|HashSet|TreeSet|LinkedHashSet)\s*<[^>]*>\s+(\w+)\s*=\s*new\s+\w+\s*<[^>]*>\s*\([^)]*\)/g, 'let $1 = new Set()');
    line = line.replace(/\b(?:Queue|Deque|ArrayDeque)\s*<[^>]*>\s+(\w+)\s*=\s*new\s+\w+\s*<[^>]*>\s*\([^)]*\)/g, 'let $1 = []');
    line = line.replace(/\bStack\s*<[^>]*>\s+(\w+)\s*=\s*new\s+Stack\s*<[^>]*>\s*\([^)]*\)/g, 'let $1 = []');
    line = line.replace(/\bPriorityQueue\s*<[^>]*>\s+(\w+)\s*=\s*new\s+PriorityQueue\s*<[^>]*>\s*\([^)]*\)/g, 'let $1 = []');
    // Generic collection type without init
    line = line.replace(/\b(?:List|ArrayList|LinkedList|Map|HashMap|Set|HashSet|Queue|Stack|Deque|PriorityQueue|TreeMap|TreeSet)\s*<[^>]*(?:<[^>]*>)?>\s+(\w+)\s*;/g, 'let $1;');
    line = line.replace(/\b(?:List|ArrayList|LinkedList|Map|HashMap|Set|HashSet|Queue|Stack|Deque|PriorityQueue)\s*<[^>]*(?:<[^>]*>)?>\s+(\w+)\s*=/g, 'let $1 =');

    // ── Primitives ──
    line = line.replace(/\b(?:int|long|float|double|byte|short)\s+(\w+)\s*=/g, 'let $1 =');
    line = line.replace(/\b(?:int|long|float|double|byte|short)\s+(\w+)\s*;/g, 'let $1 = 0;');
    line = line.replace(/\bboolean\s+(\w+)\s*=/g, 'let $1 =');
    line = line.replace(/\bboolean\s+(\w+)\s*;/g, 'let $1 = false;');
    line = line.replace(/\bchar\s+(\w+)\s*=/g, 'let $1 =');
    line = line.replace(/\bString\s+(\w+)\s*=/g, 'let $1 =');
    line = line.replace(/\bString\s+(\w+)\s*;/g, 'let $1 = "";');

    // ── for-each → for-of ──
    line = line.replace(/for\s*\(\s*(?:final\s+)?(?:[\w<>\[\]]+)\s+(\w+)\s*:\s*([^)]+)\)/g, 'for (const $1 of $2)');
    line = line.replace(/for\s*\(\s*(?:int|long)\s+/g, 'for (let ');

    // ── Inline new expressions ──
    line = line.replace(/new\s+\w+\[\]\s*\{([^}]*)\}/g, '[$1]');
    line = line.replace(/new\s+int\[([^\]]+)\]\[([^\]]+)\]/g, 'Array.from({length:$1},()=>new Array($2).fill(0))');
    line = line.replace(/new\s+int\[([^\]]+)\]/g, 'new Array($1).fill(0)');
    line = line.replace(/new\s+boolean\[([^\]]+)\]/g, 'new Array($1).fill(false)');
    line = line.replace(/new\s+(?:long|double|float|char|byte|short)\[([^\]]+)\]/g, 'new Array($1).fill(0)');
    line = line.replace(/new\s+(?:ArrayList|LinkedList)\s*<[^>]*(?:<[^>]*>)?>\s*\([^)]*\)/g, '[]');
    line = line.replace(/new\s+(?:HashMap|TreeMap)\s*<[^>]*(?:<[^>]*>)?>\s*\([^)]*\)/g, 'new Map()');
    line = line.replace(/new\s+(?:HashSet|TreeSet)\s*<[^>]*>\s*\([^)]*\)/g, 'new Set()');
    line = line.replace(/new\s+(?:LinkedList|ArrayDeque)\s*<[^>]*>\s*\([^)]*\)/g, '[]');

    // ── Collection methods ──
    line = line.replace(/\.poll\(\)/g, '.shift()');
    line = line.replace(/\.offer\(/g, '.push(');
    line = line.replace(/\.size\(\)/g, '.length');
    line = line.replace(/\.isEmpty\(\)/g, '.length === 0');
    line = line.replace(/\.containsKey\(/g, '.has(');
    line = line.replace(/\.contains\(/g, '.includes(');
    line = line.replace(/\.put\(/g, '.set(');
    line = line.replace(/(\w+)\.getOrDefault\(([^,]+),\s*([^)]+)\)/g, '($1.has($2)?$1.get($2):$3)');
    line = line.replace(/\.keySet\(\)/g, '.keys()');
    line = line.replace(/\.entrySet\(\)/g, '.entries()');
    line = line.replace(/(\w+)\.peek\(\)/g, '$1[$1.length-1]');

    // ── Utilities ──
    line = line.replace(/Arrays\.fill\((\w+),\s*([^)]+)\)/g, '$1.fill($2)');
    line = line.replace(/Arrays\.sort\((\w+)\)/g, '$1.sort((a,b)=>a-b)');
    line = line.replace(/Arrays\.sort\((\w+),\s*(.*?)\)/g, '$1.sort($2)');
    line = line.replace(/Arrays\.asList\(([^)]+)\)/g, '[$1]');
    line = line.replace(/Collections\.sort\((\w+)\)/g, '$1.sort((a,b)=>a-b)');
    line = line.replace(/Integer\.MAX_VALUE/g, 'Infinity');
    line = line.replace(/Integer\.MIN_VALUE/g, '-Infinity');
    line = line.replace(/Long\.MAX_VALUE/g, 'Infinity');
    line = line.replace(/System\.out\.println?\(/g, 'console.log(');

    // ── String methods ──
    line = line.replace(/(\w+)\.length\(\)/g, '$1.length');
    line = line.replace(/(\w+)\.charAt\(([^)]+)\)/g, '$1[$2]');
    line = line.replace(/(\w+)\.toCharArray\(\)/g, '[...$1]');
    line = line.replace(/\.equals\(([^)]+)\)/g, ' === $1');
    line = line.replace(/\.substring\(/g, '.slice(');

    // ── Cleanup ──
    line = line.replace(/\(int\)\s*/g, '');
    line = line.replace(/\(long\)\s*/g, '');
    line = line.replace(/\(double\)\s*/g, '');
    line = line.replace(/\(char\)\s*/g, '');
    line = line.replace(/\bvar\s+(\w+)/g, 'let $1');

    output.push(line);
  }

  code = output.join('\n');

  // Phase 3: Remove outer class brace
  const codeLines = code.split('\n');
  for (let i = codeLines.length - 1; i >= 0; i--) {
    if (codeLines[i].trim() === '}') { codeLines.splice(i, 1); break; }
    if (codeLines[i].trim()) break;
  }
  code = codeLines.join('\n');

  // ═══ Phase 4: FINAL SAFETY PASS — catch ANY remaining Java method signatures ═══
  // In valid JS, you NEVER have `type identifier(` at the start of a line.
  // So anything matching that pattern is an unconverted Java method.
  // We run this AFTER all other transforms so it's a safety net.

  // Helper: strip Java types from a parameter list string
  function stripParamTypes(paramStr) {
    return paramStr.split(',').map((p) => {
      const clean = p.replace(/<[^>]*(?:<[^>]*>)?>/g, '').replace(/\[\]/g, '').replace(/\.\.\./g, '').trim();
      const parts = clean.split(/\s+/);
      return parts.length > 0 ? parts[parts.length - 1] : '';
    }).filter(Boolean).join(', ');
  }

  // Pattern A: simple types — void/int/long/boolean/String/etc + name(
  code = code.replace(/^(\s*)(?:void|int|long|float|double|boolean|char|byte|short|String)\s+(\w+)\s*\(([^)]*)\)/gm,
    (match, indent, name, params) => {
      if (CONTROL.has(name)) return match;
      return `${indent}function ${name}(${stripParamTypes(params)})`;
    });

  // Pattern B: array return type — int[]/boolean[] + name(
  code = code.replace(/^(\s*)(?:int|long|float|double|boolean|char|byte|short|String)\s*\[\](?:\[\])?\s+(\w+)\s*\(([^)]*)\)/gm,
    (match, indent, name, params) => {
      if (CONTROL.has(name)) return match;
      return `${indent}function ${name}(${stripParamTypes(params)})`;
    });

  // Pattern C: generic return type — List<...>/Map<...>/Set<...> + name(
  code = code.replace(/^(\s*)(?:List|Map|Set|Queue|Deque|Stack|PriorityQueue|ArrayList|HashMap|HashSet|TreeMap|TreeSet|LinkedList|ArrayDeque)\s*<[^>]*(?:<[^>]*>)?>\s+(\w+)\s*\(([^)]*)\)/gm,
    (match, indent, name, params) => {
      if (CONTROL.has(name)) return match;
      return `${indent}function ${name}(${stripParamTypes(params)})`;
    });

  // Pattern D: array of generic — List<Integer>[] + name(  
  code = code.replace(/^(\s*)\w+(?:<[^>]*>)?\s*\[\]\s+(\w+)\s*\(([^)]*)\)/gm,
    (match, indent, name, params) => {
      if (CONTROL.has(name)) return match;
      return `${indent}function ${name}(${stripParamTypes(params)})`;
    });

  // Phase 5: Restore strings
  code = code.replace(/__S(\d+)__/g, (_, idx) => strings[parseInt(idx)]);

  return code.trim();
}
