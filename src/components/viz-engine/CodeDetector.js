/**
 * CodeDetector — Analyzes solution code text to identify the DSA pattern.
 * Returns { id, name, inputHint } or null.
 * 
 * This is KEYWORD-based analysis of the code TEXT, not execution.
 * The detected pattern selects which pre-built tracer to use.
 */

const PATTERNS = [
  { id: 'tarjan', name: "Tarjan's Bridges/AP", kw: ['disc', 'low', 'bridge', 'articulat', 'critical.connection'], input: 'n = 5, edges = [[0,1],[1,2],[2,0],[1,3],[3,4]]' },
  { id: 'dijkstra', name: "Dijkstra's", kw: ['dijkstra', 'dist\\[', 'shortest.path', 'relaxation', 'priority.*dist'], input: 'n = 4, edges = [[0,1,4],[0,2,1],[2,1,2],[1,3,1]]' },
  { id: 'kruskal', name: "Kruskal's MST", kw: ['kruskal', 'minimum.spanning', 'mst', 'sort.*edge.*weight', 'union.*find.*mst'], input: 'n = 4, edges = [[0,1,10],[0,2,6],[0,3,5],[1,3,15],[2,3,4]]' },
  { id: 'union_find', name: 'Union-Find', kw: ['union', 'find', 'parent\\[', 'rank\\[', 'disjoint', 'connected.component', 'path.compress'], input: 'n = 5, edges = [[0,1],[1,2],[3,4]]' },
  { id: 'topological', name: 'Topological Sort', kw: ['topolog', 'indegree', 'in.degree', 'kahn', 'course.schedule', 'prerequisit'], input: 'n = 4, edges = [[1,0],[2,0],[3,1],[3,2]]' },
  { id: 'trie', name: 'Trie', kw: ['trie', 'TrieNode', 'children\\[', 'prefix', 'startsWith', 'isEnd'], input: 'words = ["apple","app","bat"]' },
  { id: 'bfs', name: 'BFS', kw: ['bfs', 'breadth.first', 'queue.*add', 'queue.*poll', 'queue.*offer', 'level.order', 'LinkedList.*Queue'], input: 'n = 6, edges = [[0,1],[0,2],[1,3],[2,4],[3,5]]' },
  { id: 'dfs', name: 'DFS', kw: ['dfs', 'depth.first', 'visited.*recur', 'backtrack'], input: 'n = 6, edges = [[0,1],[0,2],[1,3],[2,4],[3,5]]' },
  { id: 'binary_search', name: 'Binary Search', kw: ['binary.search', 'left.*right.*mid', 'lo.*hi.*mid', 'mid.*=.*left.*\\+.*right', 'binarySearch'], input: 'nums = [1,3,5,7,9,11,13], target = 7' },
  { id: 'sliding_window', name: 'Sliding Window', kw: ['sliding.window', 'window', 'shrink.*expand', 'left.*right.*while.*left', 'windowSum', 'maxLen.*left', 'end.*start.*map'], input: 'nums = [1,4,2,10,2,3,1,0,20], k = 3' },
  { id: 'two_pointer', name: 'Two Pointer', kw: ['two.pointer', 'left.*<.*right', 'left\\+\\+.*right--', 'i.*<.*j'], input: 'nums = [2,7,11,15], target = 9' },
  { id: 'monotonic_stack', name: 'Monotonic Stack', kw: ['stack', 'next.greater', 'next.smaller', 'previous.greater', 'monoton', 'stack.*while.*pop'], input: 'nums = [4,5,2,10,8]' },
  { id: 'heap', name: 'Heap/PQ', kw: ['PriorityQueue', 'heapif', 'kth.largest', 'kth.smallest', 'min.heap', 'max.heap', 'top.k'], input: 'nums = [3,1,4,1,5,9,2,6], k = 3' },
  { id: 'dp_1d', name: 'DP (1D)', kw: ['dp\\[i\\]', 'dp\\[i.1\\]', 'dp\\[i.2\\]', 'fibonacci', 'climbing.stair', 'house.robb'], input: 'n = 10' },
  { id: 'dp_2d', name: 'DP (2D)', kw: ['dp\\[i\\]\\[j\\]', 'dp\\[i.1\\]\\[j', 'lcs', 'knapsack', 'edit.dist', 'longest.common'], input: 's1 = "abcde", s2 = "ace"' },
  { id: 'linked_list', name: 'Linked List', kw: ['ListNode', '\\.next', 'head', 'slow.*fast', 'reverse.*list'], input: 'list = [1,2,3,4,5]' },
  { id: 'bst', name: 'BST/Tree', kw: ['TreeNode', 'root.*left.*right', 'inorder', 'preorder', 'postorder', 'bst'], input: 'tree = [5,3,7,1,4,6,8]' },
  { id: 'sort', name: 'Sorting', kw: ['sort', 'merge.sort', 'quick.sort', 'bubble', 'insertion.sort', 'partition.*pivot'], input: 'nums = [38,27,43,3,9,82,10]' },
  { id: 'matrix_traversal', name: 'Grid/Matrix', kw: ['grid\\[', 'matrix\\[', 'numRows', 'numCols', 'island', 'directions.*4', 'dx.*dy'], input: 'grid = [[1,1,0],[1,0,0],[0,0,1]]' },
  { id: 'backtracking', name: 'Backtracking', kw: ['backtrack', 'permut', 'combinat', 'subset', 'generate.*paren', 'n.queen'], input: 'nums = [1,2,3]' },
  { id: 'string_window', name: 'String Sliding Window', kw: ['substring', 'anagram', 'window.*map', 'charCount', 'frequency.*map', 'left.*right.*char'], input: 's = "abcabcbb"' },
];

export function detectPattern(code) {
  if (!code) return null;
  const lower = code.toLowerCase().replace(/\s+/g, ' ');
  let best = null, bestScore = 0;
  for (const p of PATTERNS) {
    let hits = 0;
    for (const kw of p.kw) {
      try { if (new RegExp(kw, 'i').test(lower)) hits++; } catch { if (lower.includes(kw)) hits++; }
    }
    const score = hits / p.kw.length;
    if (hits >= 2 && score > bestScore) { bestScore = score; best = p; }
  }
  return best;
}

export function getAllPatterns() {
  return PATTERNS.map((p) => ({ id: p.id, name: p.name, inputHint: p.input }));
}
