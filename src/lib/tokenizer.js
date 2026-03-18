/**
 * Java Syntax Tokenizer
 * Produces an array of { type, text } tokens for proper rendering.
 * No innerHTML — each token renders as a React <span>.
 */

const KEYWORDS = new Set([
  'import','package','public','private','protected','static','void','class','interface',
  'extends','implements','return','if','else','for','while','do','switch','case','break',
  'continue','new','try','catch','finally','throw','throws','abstract','final',
  'synchronized','volatile','transient','native','default','enum','int','long','double',
  'float','boolean','char','byte','short','var','true','false','null','this','super',
  'instanceof','const','goto','assert','record','sealed','permits','yield',
]);

const TYPES = new Set([
  'String','List','Map','Set','Queue','Stack','Array','ArrayList','HashMap','LinkedList',
  'HashSet','TreeMap','TreeSet','PriorityQueue','Deque','ArrayDeque','Collections','Arrays',
  'Math','Integer','Long','Double','Boolean','Character','Object','Comparable','Iterator',
  'Optional','StringBuilder','Pair','Entry','Stream','Collectors','BiFunction',
  'Function','Consumer','Supplier','Predicate','Comparator','LinkedHashMap',
]);

export const TOKEN_COLORS = {
  keyword:    '#c084fc',
  type:       '#67e8f9',
  string:     '#86efac',
  number:     '#fdba74',
  comment:    '#3f3f46',
  annotation: '#f9a8d4',
  punctuation:'#525252',
  identifier: '#d4d4d8',
  plain:      '#d4d4d8',
};

export function tokenize(code) {
  if (!code) return [];
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    // Line comments
    if (code[i] === '/' && code[i + 1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ type: 'comment', text: code.slice(i, end) });
      i = end;
      continue;
    }

    // Block comments
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end === -1) end = code.length; else end += 2;
      tokens.push({ type: 'comment', text: code.slice(i, end) });
      i = end;
      continue;
    }

    // Strings
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let end = i + 1;
      while (end < code.length && code[end] !== quote) {
        if (code[end] === '\\') end++;
        end++;
      }
      if (end < code.length) end++;
      tokens.push({ type: 'string', text: code.slice(i, end) });
      i = end;
      continue;
    }

    // Annotations
    if (code[i] === '@') {
      let end = i + 1;
      while (end < code.length && /\w/.test(code[end])) end++;
      tokens.push({ type: 'annotation', text: code.slice(i, end) });
      i = end;
      continue;
    }

    // Identifiers / keywords / types
    if (/[a-zA-Z_$]/.test(code[i])) {
      let end = i + 1;
      while (end < code.length && /[\w$]/.test(code[end])) end++;
      const word = code.slice(i, end);
      if (KEYWORDS.has(word)) tokens.push({ type: 'keyword', text: word });
      else if (TYPES.has(word)) tokens.push({ type: 'type', text: word });
      else tokens.push({ type: 'identifier', text: word });
      i = end;
      continue;
    }

    // Numbers
    if (/\d/.test(code[i])) {
      let end = i + 1;
      while (end < code.length && /[\d._xXa-fA-FLl]/.test(code[end])) end++;
      tokens.push({ type: 'number', text: code.slice(i, end) });
      i = end;
      continue;
    }

    // Punctuation
    if ('(){}[]<>;,.=+-*/%&|!?:~^'.includes(code[i])) {
      tokens.push({ type: 'punctuation', text: code[i] });
      i++;
      continue;
    }

    // Whitespace / other
    tokens.push({ type: 'plain', text: code[i] });
    i++;
  }

  return tokens;
}

/** Split tokens into lines for rendering with line numbers */
export function tokenLines(code) {
  const tokens = tokenize(code);
  const lines = [[]];
  for (const tok of tokens) {
    const parts = tok.text.split('\n');
    parts.forEach((part, idx) => {
      if (idx > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ ...tok, text: part });
    });
  }
  return lines;
}
