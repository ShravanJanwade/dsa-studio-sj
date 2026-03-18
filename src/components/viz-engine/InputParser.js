/**
 * InputParser v2 — Parses LeetCode-style text input
 * 
 * Handles:
 *   "s = 'hello'"  or  's = "hello"'        → { s: "hello" }
 *   "nums = [2, 7, 11, 15], target = 9"     → { nums: [2,7,11,15], target: 9 }
 *   "n = 5, edges = [[0,1],[1,2]]"           → { n: 5, edges: [[0,1],[1,2]] }
 *   "grid = [[1,0],[0,1]]"                   → { grid: [[1,0],[0,1]] }
 *   "[1, 2, 3]"                              → { nums: [1,2,3] }
 *   "5"                                      → { n: 5 }
 *   "hello"                                  → { s: "hello" }
 *   "s = 'abcabcbb'"                         → { s: "abcabcbb" }
 */

export function parseInput(text) {
  if (!text || !text.trim()) return null;
  const t = text.trim();

  // Named params: "key = value, key2 = value2"
  if (t.includes('=')) {
    return parseNamedParams(t);
  }

  // Bare value
  const val = parseSingleValue(t);
  if (val === null) return null;
  if (Array.isArray(val)) {
    if (val.length > 0 && Array.isArray(val[0])) return { grid: val }; // 2D
    return { nums: val };
  }
  if (typeof val === 'number') return { n: val };
  if (typeof val === 'string') return { s: val };
  return { input: val };
}

function parseNamedParams(text) {
  const result = {};
  const parts = splitTopLevel(text, ',');
  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.substring(0, eqIdx).trim();
    const valStr = part.substring(eqIdx + 1).trim();
    const val = parseSingleValue(valStr);
    if (val !== null) result[key] = val;
  }
  return Object.keys(result).length > 0 ? result : null;
}

function parseSingleValue(str) {
  let s = str.trim();
  // Remove outer quotes if present: "hello" or 'hello'
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  // Try JSON parse (handles arrays, numbers, booleans)
  try {
    const normalized = s.replace(/'/g, '"');
    return JSON.parse(normalized);
  } catch {}
  // Bare number
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  // Bare string (no quotes, no brackets)
  if (!s.startsWith('[') && !s.startsWith('{')) return s;
  return null;
}

function splitTopLevel(text, delimiter) {
  const parts = [];
  let depth = 0, current = '', inStr = false, strChar = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      current += ch;
      if (ch === strChar && text[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'") { inStr = true; strChar = ch; current += ch; continue; }
    if (ch === '[' || ch === '(' || ch === '{') depth++;
    if (ch === ']' || ch === ')' || ch === '}') depth--;
    if (ch === delimiter && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Auto-generate input hint from code's function signature
 */
export function guessInputHint(code) {
  if (!code) return '';
  // Find the main method signature
  const sig = code.match(/(?:public\s+)?(?:[\w<>\[\],\s?]+)\s+(\w+)\s*\(([^)]+)\)/);
  if (!sig) return 'nums = [1, 2, 3], target = 3';
  const params = sig[2];
  const hints = [];
  const parts = params.split(',').map((p) => p.trim());
  for (const p of parts) {
    const pLower = p.toLowerCase();
    // Get the variable name (last word)
    const name = p.replace(/<[^>]*>/g, '').replace(/\[\]/g, '').trim().split(/\s+/).pop();
    if (!name) continue;

    if (pLower.includes('string') && (name === 's' || name === 'str' || name === 'word' || name === 'text'))
      hints.push(`${name} = "abcabcbb"`);
    else if (pLower.includes('string') && name === 't')
      hints.push(`${name} = "abc"`);
    else if (pLower.includes('string[]') || pLower.includes('list<string'))
      hints.push(`${name} = ["eat","tea","tan","ate","nat","bat"]`);
    else if (pLower.includes('int[][]') || pLower.includes('list<list'))
      hints.push(`${name} = [[0,1],[1,2],[2,0],[1,3]]`);
    else if (pLower.includes('int[]'))
      hints.push(`${name} = [2, 7, 11, 15]`);
    else if (pLower.includes('char[][]'))
      hints.push(`${name} = [["1","1","0"],["1","0","0"],["0","0","1"]]`);
    else if (name === 'n' || name === 'numCourses' || name === 'numNodes')
      hints.push(`${name} = 5`);
    else if (name === 'target' || name === 'sum' || name === 'val')
      hints.push(`${name} = 9`);
    else if (name === 'k')
      hints.push(`${name} = 3`);
    else if (pLower.includes('int'))
      hints.push(`${name} = 5`);
    else if (pLower.includes('string'))
      hints.push(`${name} = "hello"`);
  }
  return hints.join(', ') || 'nums = [1, 2, 3]';
}
