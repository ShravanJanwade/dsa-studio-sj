/**
 * Algorithm Tracers
 * 
 * Each function: (input) → StepRecorder steps[]
 * The VizEngine calls these with user-provided test cases.
 */
import { StepRecorder, C, circleLayout } from './StepRecorder';

// ═══════════════════════════════════════════════
// BINARY SEARCH
// ═══════════════════════════════════════════════
export function traceBinarySearch({ arr, target }) {
  const r = new StepRecorder();
  const a = [...arr].sort((a, b) => a - b);
  r.setCode([
    'left = 0, right = n - 1',
    'while left <= right:',
    '    mid = (left + right) / 2',
    '    if arr[mid] == target: return mid',
    '    if arr[mid] < target: left = mid + 1',
    '    else: right = mid - 1',
    'return -1  // not found',
  ]);
  r.addStructure('array', 'arr', { values: a, label: `Searching for ${target}` });
  let left = 0, right = a.length - 1;
  r.setVars({ left, right, mid: '—', target, found: false });
  r.highlight('arr', { cells: {} });
  r.step(0, `Initialize: left=0, right=${right}`, { explanation: `We search the sorted array [${a.join(',')}] for target ${target}. Search space is the entire array.`, color: C.ACTIVE });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    r.setVars({ left, right, mid });
    const cells = {};
    for (let i = 0; i < a.length; i++) {
      if (i < left || i > right) cells[i] = 'done';
    }
    cells[left] = 'compare';
    cells[right] = 'compare';
    cells[mid] = 'active';
    r.highlight('arr', { cells });
    r.step(2, `mid = (${left}+${right})/2 = ${mid}, arr[${mid}] = ${a[mid]}`, {
      explanation: `Calculate mid index. arr[${mid}] = ${a[mid]}. Compare with target ${target}.`,
    });

    if (a[mid] === target) {
      r.setVar('found', true);
      cells[mid] = 'alert';
      r.highlight('arr', { cells });
      r.step(3, `FOUND! arr[${mid}] = ${target}`, { explanation: `Target ${target} found at index ${mid}!`, color: C.ALERT });
      return r.getSteps();
    } else if (a[mid] < target) {
      r.step(4, `${a[mid]} < ${target} → move left to ${mid + 1}`, {
        explanation: `arr[mid]=${a[mid]} is less than target=${target}. Target must be in the right half. Discard indices 0..${mid}.`,
        color: C.COMPARE,
      });
      left = mid + 1;
      r.setVar('left', left);
    } else {
      r.step(5, `${a[mid]} > ${target} → move right to ${mid - 1}`, {
        explanation: `arr[mid]=${a[mid]} is greater than target=${target}. Target must be in the left half. Discard indices ${mid}..${right}.`,
        color: C.COMPARE,
      });
      right = mid - 1;
      r.setVar('right', right);
    }
  }

  r.step(6, `Not found — left (${left}) > right (${right})`, { explanation: `Search space is empty. Target ${target} does not exist in the array.`, color: C.ALERT });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// BFS (Graph)
// ═══════════════════════════════════════════════
export function traceBFS({ adjList, start = 0, nodeCount }) {
  const r = new StepRecorder();
  const V = nodeCount || adjList.length;
  const pos = circleLayout(V, 220, 140, Math.min(110, V * 15));
  const nodes = pos.map((p, i) => ({ id: i, x: p.x, y: p.y }));
  const edges = [];
  for (let u = 0; u < V; u++) (adjList[u] || []).forEach((v) => { if (u < v) edges.push({ from: u, to: v }); });

  r.setCode([
    'queue = [start]; visited[start] = true',
    'while queue not empty:',
    '    node = queue.dequeue()',
    '    for neighbor in adj[node]:',
    '        if not visited[neighbor]:',
    '            visited[neighbor] = true',
    '            queue.enqueue(neighbor)',
  ]);
  r.addStructure('graph', 'g', { nodes, edges });
  r.addStructure('queue', 'q', { values: [], label: 'Queue' });

  const visited = new Array(V).fill(false);
  const queue = [start];
  visited[start] = true;
  const order = [];

  r.setVars({ visited: visited.map((v, i) => v ? '✓' : '—'), order: [], current: '—' });
  r.highlight('g', { nodes: { [start]: 'active' }, edges: {} });
  r.updateStructure('q', { values: [...queue] });
  r.step(0, `Start BFS from node ${start}`, { explanation: `Initialize: mark node ${start} as visited, add to queue.`, color: C.ACTIVE });

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    r.setVars({ current: node, order: [...order] });
    r.updateStructure('q', { values: [...queue] });

    const nh = {};
    order.forEach((n) => { nh[n] = 'done'; });
    nh[node] = 'active';
    r.highlight('g', { nodes: nh, edges: {} });
    r.step(2, `Dequeue node ${node}`, { explanation: `Process node ${node}. Check its neighbors: [${(adjList[node] || []).join(', ')}].` });

    for (const nb of (adjList[node] || [])) {
      const eh = { [`${Math.min(node, nb)}-${Math.max(node, nb)}`]: 'compare' };
      r.highlight('g', { nodes: { ...nh, [nb]: visited[nb] ? 'done' : 'compare' }, edges: eh });

      if (!visited[nb]) {
        visited[nb] = true;
        queue.push(nb);
        r.setVar('visited', visited.map((v, i) => v ? '✓' : '—'));
        r.updateStructure('q', { values: [...queue] });
        r.highlight('g', { nodes: { ...nh, [nb]: 'active' }, edges: eh });
        r.step(6, `Visit neighbor ${nb} → enqueue`, { explanation: `Node ${nb} not yet visited. Mark visited and add to queue.`, color: C.DONE });
      } else {
        r.step(4, `Neighbor ${nb} already visited — skip`, { explanation: `Node ${nb} was already visited. Skip.`, color: C.INACTIVE });
      }
    }
  }

  const finalH = {}; order.forEach((n) => { finalH[n] = 'done'; });
  r.highlight('g', { nodes: finalH, edges: {} });
  r.step(1, `BFS complete! Order: [${order.join(', ')}]`, { explanation: `All reachable nodes visited. BFS traversal order: ${order.join(' → ')}.`, color: C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// DFS (Graph)
// ═══════════════════════════════════════════════
export function traceDFS({ adjList, start = 0, nodeCount }) {
  const r = new StepRecorder();
  const V = nodeCount || adjList.length;
  const pos = circleLayout(V, 220, 140, Math.min(110, V * 15));
  const nodes = pos.map((p, i) => ({ id: i, x: p.x, y: p.y }));
  const edges = [];
  for (let u = 0; u < V; u++) (adjList[u] || []).forEach((v) => { if (u < v) edges.push({ from: u, to: v }); });

  r.setCode([
    'visited[u] = true',
    'for neighbor v in adj[u]:',
    '    if not visited[v]:',
    '        dfs(v)',
    '    // backtrack',
  ]);
  r.addStructure('graph', 'g', { nodes, edges });
  r.addStructure('stack', 'stk', { values: [], label: 'Call Stack' });

  const visited = new Array(V).fill(false);
  const order = [];
  const nh = {};

  r.setVars({ visited: visited.map((v) => v ? '✓' : '—'), order: [], depth: 0 });

  function dfs(u, depth) {
    visited[u] = true;
    order.push(u);
    nh[u] = 'active';
    r.setVars({ visited: visited.map((v) => v ? '✓' : '—'), order: [...order], depth, current: u });
    r.updateStructure('stk', { values: [...order] });
    r.highlight('g', { nodes: { ...nh }, edges: {} });
    r.step(0, `Visit node ${u} (depth ${depth})`, { explanation: `DFS reaches node ${u}. Mark as visited. Explore neighbors.`, color: C.ACTIVE });

    for (const v of (adjList[u] || [])) {
      const eKey = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (!visited[v]) {
        r.highlight('g', { nodes: { ...nh, [v]: 'compare' }, edges: { [eKey]: 'active' } });
        r.step(3, `DFS → ${v} (unvisited)`, { explanation: `Neighbor ${v} not visited. Recurse deeper.`, color: C.ACTIVE });
        dfs(v, depth + 1);
        nh[u] = 'active';
        r.highlight('g', { nodes: { ...nh }, edges: {} });
        r.step(4, `Backtrack to ${u}`, { explanation: `Returned from DFS(${v}). Back at node ${u}, continue checking other neighbors.`, color: C.SPECIAL });
      }
    }
    nh[u] = 'done';
  }

  dfs(start, 0);
  r.highlight('g', { nodes: nh, edges: {} });
  r.step(0, `DFS complete! Order: [${order.join(', ')}]`, { explanation: `All reachable nodes visited. DFS order: ${order.join(' → ')}.`, color: C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// TARJAN'S BRIDGES
// ═══════════════════════════════════════════════
export function traceTarjan({ adjList, nodeCount }) {
  const r = new StepRecorder();
  const V = nodeCount || adjList.length;
  const pos = circleLayout(V, 220, 140, Math.min(110, V * 15));
  const nodes = pos.map((p, i) => ({ id: i, x: p.x, y: p.y }));
  const edgeList = [];
  const edgeSet = new Set();
  for (let u = 0; u < V; u++) (adjList[u] || []).forEach((v) => {
    const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (!edgeSet.has(key)) { edgeSet.add(key); edgeList.push({ from: Math.min(u, v), to: Math.max(u, v) }); }
  });

  r.setCode([
    'disc[u] = low[u] = timer++',
    'for each neighbor v of u:',
    '    if not visited[v]: dfs(v, u)',
    '    low[u] = min(low[u], low[v])',
    '    if low[v] > disc[u]: BRIDGE!',
    '    else if v ≠ parent: low[u] = min(low[u], disc[v])',
  ]);

  r.addStructure('graph', 'g', { nodes, edges: edgeList });
  const disc = new Array(V).fill(-1), low = new Array(V).fill(-1);
  const bridges = [];
  let timer = 0;
  const nh = {}, eh = {};

  r.addStructure('array', 'disc_arr', { values: [...disc], label: 'disc[]' });
  r.addStructure('array', 'low_arr', { values: [...low], label: 'low[]' });
  r.setVars({ timer: 0, bridges: '[]' });

  function dfs(u, parent) {
    disc[u] = low[u] = timer++;
    r.updateStructure('disc_arr', { values: disc.map((d) => d === -1 ? '—' : d) });
    r.updateStructure('low_arr', { values: low.map((l) => l === -1 ? '—' : l) });

    // Update node sub-labels with disc/low
    nodes.forEach((n) => { n.sub = disc[n.id] >= 0 ? `${disc[n.id]}/${low[n.id]}` : ''; });
    r.updateStructure('g', { nodes: [...nodes], edges: edgeList });

    nh[u] = 'active';
    r.setVars({ timer, current: u, bridges: bridges.map((b) => `${b[0]}-${b[1]}`).join(', ') || '[]' });
    r.highlight('g', { nodes: { ...nh }, edges: { ...eh } });
    r.highlight('disc_arr', { cells: { [u]: 'active' } });
    r.highlight('low_arr', { cells: { [u]: 'active' } });
    r.step(0, `Visit ${u}: disc=${disc[u]}, low=${low[u]}`, { explanation: `Node ${u} discovered. Assign disc[${u}]=${disc[u]}, low[${u}]=${low[u]}. Timer advances to ${timer}.` });

    for (const v of (adjList[u] || [])) {
      const eKey = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (disc[v] === -1) {
        eh[eKey] = 'active';
        r.highlight('g', { nodes: { ...nh, [v]: 'compare' }, edges: { ...eh } });
        r.step(2, `Tree edge ${u} → ${v}`, { explanation: `Neighbor ${v} unvisited — tree edge. Go deeper.`, color: C.ACTIVE });
        dfs(v, u);

        const oldLow = low[u];
        low[u] = Math.min(low[u], low[v]);
        if (oldLow !== low[u]) {
          r.updateStructure('low_arr', { values: low.map((l) => l === -1 ? '—' : l) });
          nodes[u].sub = `${disc[u]}/${low[u]}`;
          r.updateStructure('g', { nodes: [...nodes], edges: edgeList });
          r.highlight('low_arr', { cells: { [u]: 'compare' } });
          r.setVars({ timer, current: u });
          r.step(3, `Propagate: low[${u}] = min(${oldLow}, low[${v}]=${low[v]}) = ${low[u]}`, { explanation: `Back from DFS(${v}). Parent ${u} inherits child's reachability.`, color: C.COMPARE });
        }

        if (low[v] > disc[u]) {
          bridges.push([u, v]);
          eh[eKey] = 'alert';
          r.setVar('bridges', bridges.map((b) => `${b[0]}-${b[1]}`).join(', '));
          r.highlight('g', { nodes: { ...nh }, edges: { ...eh } });
          r.step(4, `BRIDGE: ${u}-${v} (low[${v}]=${low[v]} > disc[${u}]=${disc[u]})`, { explanation: `low[${v}]=${low[v]} > disc[${u}]=${disc[u]}. Node ${v}'s subtree has NO back edge reaching above ${u}. Edge ${u}-${v} is a BRIDGE!`, color: C.ALERT });
        } else {
          eh[eKey] = 'done';
          r.highlight('g', { nodes: { ...nh }, edges: { ...eh } });
          r.step(4, `Safe: ${u}-${v} (low[${v}]=${low[v]} ≤ disc[${u}]=${disc[u]})`, { explanation: `low[${v}]=${low[v]} ≤ disc[${u}]=${disc[u]}. A back edge protects this tree edge.`, color: C.DONE });
        }
      } else if (v !== parent) {
        eh[eKey] = 'special';
        const oldLow = low[u];
        low[u] = Math.min(low[u], disc[v]);
        r.updateStructure('low_arr', { values: low.map((l) => l === -1 ? '—' : l) });
        nodes[u].sub = `${disc[u]}/${low[u]}`;
        r.updateStructure('g', { nodes: [...nodes], edges: edgeList });
        r.highlight('g', { nodes: { ...nh, [v]: 'special' }, edges: { ...eh } });
        r.highlight('low_arr', { cells: { [u]: 'compare' } });
        r.step(5, `Back edge ${u} → ${v}: low[${u}] = min(${oldLow}, disc[${v}]=${disc[v]}) = ${low[u]}`, { explanation: `Node ${v} already visited — back edge! A cycle exists. low[${u}] updates to reach ancestor ${v}.`, color: C.SPECIAL });
      }
    }
    nh[u] = 'done';
  }

  r.step(-1, 'Starting Tarjan\'s algorithm', { explanation: `Find all bridges in a graph with ${V} nodes and ${edgeList.length} edges using DFS with disc[] and low[] arrays.` });
  for (let i = 0; i < V; i++) { if (disc[i] === -1) dfs(i, -1); }

  r.highlight('g', { nodes: nh, edges: eh });
  r.step(-1, `Complete! ${bridges.length} bridge(s): [${bridges.map((b) => b.join('-')).join(', ')}]`, { explanation: `Tarjan's found ${bridges.length} bridge(s) in a single O(V+E) DFS pass.`, color: C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// SLIDING WINDOW (Max sum of k elements)
// ═══════════════════════════════════════════════
export function traceSlidingWindow({ arr, k }) {
  const r = new StepRecorder();
  r.setCode([
    'windowSum = sum(arr[0..k-1])',
    'maxSum = windowSum',
    'for i in range(k, n):',
    '    windowSum += arr[i] - arr[i-k]',
    '    maxSum = max(maxSum, windowSum)',
  ]);
  r.addStructure('array', 'arr', { values: [...arr], label: `Array (window size k=${k})` });
  let windowSum = 0;
  for (let i = 0; i < k && i < arr.length; i++) windowSum += arr[i];
  let maxSum = windowSum, maxStart = 0;

  r.setVars({ windowSum, maxSum, windowStart: 0, windowEnd: k - 1 });
  const cells = {};
  for (let i = 0; i < k; i++) cells[i] = 'active';
  r.highlight('arr', { cells });
  r.step(0, `Initial window [0..${k - 1}], sum = ${windowSum}`, { explanation: `First window: indices 0 to ${k - 1}, sum = ${windowSum}. This is our starting maxSum.` });

  for (let i = k; i < arr.length; i++) {
    const removing = arr[i - k], adding = arr[i];
    windowSum = windowSum + adding - removing;
    r.setVars({ windowSum, windowStart: i - k + 1, windowEnd: i });

    const c = {};
    for (let j = i - k + 1; j <= i; j++) c[j] = 'active';
    c[i] = 'done';        // just added
    c[i - k] = 'alert';   // just removed
    r.highlight('arr', { cells: c });
    r.step(3, `Slide: remove arr[${i - k}]=${removing}, add arr[${i}]=${adding} → sum=${windowSum}`, {
      explanation: `Window slides right. Remove ${removing} (left edge), add ${adding} (right edge). New sum = ${windowSum}.`,
      color: C.COMPARE,
    });

    if (windowSum > maxSum) {
      maxSum = windowSum;
      maxStart = i - k + 1;
      r.setVar('maxSum', maxSum);
      r.step(4, `New max! sum ${windowSum} > previous ${maxSum - adding + removing}`, { explanation: `This window has a higher sum. Update maxSum = ${maxSum}.`, color: C.DONE });
    }
  }

  const fc = {};
  for (let j = maxStart; j < maxStart + k; j++) fc[j] = 'done';
  r.highlight('arr', { cells: fc });
  r.step(4, `Result: maxSum = ${maxSum} at window [${maxStart}..${maxStart + k - 1}]`, { explanation: `Maximum subarray sum of length ${k} is ${maxSum}.`, color: C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// TWO POINTER (Two Sum on sorted array)
// ═══════════════════════════════════════════════
export function traceTwoPointer({ arr, target }) {
  const r = new StepRecorder();
  const a = [...arr].sort((x, y) => x - y);
  r.setCode([
    'left = 0, right = n - 1',
    'while left < right:',
    '    sum = arr[left] + arr[right]',
    '    if sum == target: return [left, right]',
    '    if sum < target: left++',
    '    else: right--',
  ]);
  r.addStructure('array', 'arr', { values: a, label: `Sorted array, target=${target}` });
  let left = 0, right = a.length - 1;
  r.setVars({ left, right, sum: '—', target });

  r.highlight('arr', { cells: { [left]: 'active', [right]: 'active' } });
  r.step(0, `Initialize: left=0, right=${right}`, { explanation: `Start with two pointers at opposite ends of the sorted array.` });

  while (left < right) {
    const sum = a[left] + a[right];
    r.setVars({ left, right, sum });
    r.highlight('arr', { cells: { [left]: 'active', [right]: 'active' } });
    r.step(2, `sum = ${a[left]} + ${a[right]} = ${sum}`, { explanation: `arr[${left}]=${a[left]} + arr[${right}]=${a[right]} = ${sum}. Compare with target ${target}.` });

    if (sum === target) {
      r.highlight('arr', { cells: { [left]: 'alert', [right]: 'alert' } });
      r.step(3, `FOUND! Indices [${left}, ${right}]`, { explanation: `Sum equals target! Pair found: (${a[left]}, ${a[right]}).`, color: C.ALERT });
      return r.getSteps();
    } else if (sum < target) {
      r.step(4, `${sum} < ${target} → left++`, { explanation: `Sum too small. Move left pointer right to increase sum.`, color: C.COMPARE });
      left++;
      r.setVar('left', left);
    } else {
      r.step(5, `${sum} > ${target} → right--`, { explanation: `Sum too large. Move right pointer left to decrease sum.`, color: C.COMPARE });
      right--;
      r.setVar('right', right);
    }
  }

  r.step(1, 'No pair found', { explanation: `Pointers crossed without finding target sum ${target}.`, color: C.ALERT });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// STACK — Next Greater Element
// ═══════════════════════════════════════════════
export function traceNextGreater({ arr }) {
  const r = new StepRecorder();
  r.setCode([
    'result = [-1] * n',
    'stack = []',
    'for i in range(n):',
    '    while stack and arr[i] > arr[stack.top]:',
    '        result[stack.pop()] = arr[i]',
    '    stack.push(i)',
  ]);
  const result = new Array(arr.length).fill(-1);
  const stack = [];
  r.addStructure('array', 'arr', { values: [...arr], label: 'Input' });
  r.addStructure('array', 'res', { values: [...result], label: 'Result (next greater)' });
  r.addStructure('stack', 'stk', { values: [], label: 'Stack (indices)' });
  r.setVars({ i: '—' });
  r.step(-1, 'Initialize: result all -1, stack empty', { explanation: 'For each element, find the next element to its right that is greater.' });

  for (let i = 0; i < arr.length; i++) {
    r.setVar('i', i);
    r.highlight('arr', { cells: { [i]: 'active' } });
    r.step(2, `Process arr[${i}] = ${arr[i]}`, { explanation: `Look at element ${arr[i]}. Check if it's greater than elements represented by stack top.` });

    while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
      const top = stack.pop();
      result[top] = arr[i];
      r.updateStructure('stk', { values: stack.map((s) => `${s}(${arr[s]})`) });
      r.updateStructure('res', { values: [...result] });
      r.highlight('arr', { cells: { [i]: 'done', [top]: 'alert' } });
      r.highlight('res', { cells: { [top]: 'done' } });
      r.step(4, `Pop ${top}: next greater of arr[${top}]=${arr[top]} is ${arr[i]}`, {
        explanation: `arr[${i}]=${arr[i]} > arr[${top}]=${arr[top]}. So next greater element for index ${top} is ${arr[i]}.`,
        color: C.DONE,
      });
    }

    stack.push(i);
    r.updateStructure('stk', { values: stack.map((s) => `${s}(${arr[s]})`) });
    r.highlight('arr', { cells: { [i]: 'active' } });
    r.step(5, `Push index ${i} (value ${arr[i]})`, { explanation: `Push index ${i} onto stack. We haven't found its next greater yet.`, color: C.ACTIVE });
  }

  r.highlight('res', { cells: {} });
  r.step(-1, `Done! Result: [${result.join(', ')}]`, { explanation: `Remaining stack elements have no next greater element (result stays -1).`, color: C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// DIJKSTRA'S SHORTEST PATH
// ═══════════════════════════════════════════════
export function traceDijkstra({ adjList, start = 0, nodeCount }) {
  const r = new StepRecorder();
  const V = nodeCount || adjList.length;
  const pos = circleLayout(V, 220, 140, Math.min(110, V * 15));
  const nodes = pos.map((p, i) => ({ id: i, x: p.x, y: p.y }));
  const edgeList = [];
  const edgeSet = new Set();
  for (let u = 0; u < V; u++) {
    for (const [v, w] of (adjList[u] || [])) {
      const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (!edgeSet.has(key)) { edgeSet.add(key); edgeList.push({ from: Math.min(u, v), to: Math.max(u, v), weight: w }); }
    }
  }

  r.setCode([
    'dist[start] = 0, others = INF',
    'pq = [(0, start)]',
    'while pq not empty:',
    '    (d, u) = pq.extractMin()',
    '    if d > dist[u]: skip',
    '    for (v, w) in adj[u]:',
    '        if dist[u]+w < dist[v]: relax',
  ]);
  r.addStructure('graph', 'g', { nodes, edges: edgeList });

  const dist = new Array(V).fill(Infinity);
  const visited = new Array(V).fill(false);
  dist[start] = 0;
  const pq = [[0, start]]; // [dist, node]

  r.addStructure('array', 'dist_arr', { values: dist.map((d) => d === Infinity ? '∞' : d), label: 'dist[]' });
  r.setVars({ current: '—' });
  r.highlight('g', { nodes: { [start]: 'active' }, edges: {} });
  r.highlight('dist_arr', { cells: { [start]: 'active' } });
  r.step(0, `Start: dist[${start}] = 0, all others = ∞`, { explanation: `Initialize shortest distances. Source node ${start} has distance 0.` });

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    visited[u] = true;

    const nh = {};
    for (let i = 0; i < V; i++) { if (visited[i]) nh[i] = 'done'; }
    nh[u] = 'active';
    nodes[u].sub = `d=${dist[u]}`;
    r.updateStructure('g', { nodes: [...nodes], edges: edgeList });
    r.highlight('g', { nodes: nh, edges: {} });
    r.setVar('current', u);
    r.step(3, `Extract node ${u} (dist=${d})`, { explanation: `Process node ${u} with current shortest distance ${d}.` });

    for (const [v, w] of (adjList[u] || [])) {
      const eKey = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
        nodes[v].sub = `d=${dist[v]}`;
        r.updateStructure('g', { nodes: [...nodes], edges: edgeList });
        r.updateStructure('dist_arr', { values: dist.map((dd) => dd === Infinity ? '∞' : dd) });
        r.highlight('g', { nodes: { ...nh, [v]: 'compare' }, edges: { [eKey]: 'compare' } });
        r.highlight('dist_arr', { cells: { [v]: 'compare' } });
        r.step(6, `Relax ${u}→${v}: ${dist[u]}+${w}=${dist[v]} < old`, { explanation: `Found shorter path to ${v}: ${dist[u]} + ${w} = ${dist[v]}.`, color: C.COMPARE });
      }
    }
  }

  r.step(-1, `Done! Shortest distances from ${start}: [${dist.join(', ')}]`, { explanation: `All shortest paths from node ${start} computed.`, color: C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// STRING SLIDING WINDOW
// ═══════════════════════════════════════════════
export function traceStringWindow({ s }) {
  const r = new StepRecorder();
  const str = String(s || '');
  r.setCode(['left = 0, maxLen = 0', 'charMap = {}', 'for right in 0..n-1:', '  if s[right] in charMap and >= left:', '    left = charMap[s[right]] + 1', '  charMap[s[right]] = right', '  maxLen = max(maxLen, right-left+1)']);
  const chars = [...str];
  r.addStructure('array', 'str', { values: chars, label: 's = "' + str + '"' });
  const map = {};
  let left = 0, maxLen = 0, maxStart = 0;
  r.setVars({ left, right: '—', maxLen, window: '' });
  r.step(0, 'Initialize', { explanation: 'Find longest substring without repeating characters in "' + str + '".' });
  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    const cells = {};
    for (let j = left; j <= right; j++) cells[j] = 'active';
    cells[right] = 'compare';
    if (map[ch] !== undefined && map[ch] >= left) {
      const oldLeft = left;
      left = map[ch] + 1;
      r.setVars({ left, right, maxLen, window: str.substring(left, right + 1) });
      for (let j = oldLeft; j < left; j++) cells[j] = 'alert';
      cells[right] = 'alert';
      r.highlight('str', { cells });
      r.step(4, 'Dup "' + ch + '" → left=' + left, { explanation: '"' + ch + '" seen at ' + map[ch] + '. Shrink window.', color: C.ALERT });
    }
    map[ch] = right;
    const curLen = right - left + 1;
    if (curLen > maxLen) { maxLen = curLen; maxStart = left; }
    r.setVars({ left, right, maxLen, window: str.substring(left, right + 1) });
    for (let j = left; j <= right; j++) cells[j] = 'done';
    cells[right] = 'active';
    r.highlight('str', { cells });
    r.step(6, 'Window [' + left + '..' + right + '] len=' + curLen, { explanation: '"' + str.substring(left, right + 1) + '" (' + curLen + '). Max: ' + maxLen + '.', color: curLen >= maxLen ? C.DONE : C.ACTIVE });
  }
  r.step(-1, 'Result: len=' + maxLen, { explanation: 'Longest: "' + str.substring(maxStart, maxStart + maxLen) + '".', color: C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// TOPOLOGICAL SORT
// ═══════════════════════════════════════════════
export function traceTopological({ adjList, nodeCount }) {
  const r = new StepRecorder();
  const V = nodeCount || (adjList ? adjList.length : 0);
  const pos = circleLayout(V, 220, 140, Math.min(110, V * 15));
  const nodes = pos.map((p, i) => ({ id: i, x: p.x, y: p.y }));
  const edges = [];
  const indegree = new Array(V).fill(0);
  for (let u = 0; u < V; u++) (adjList[u] || []).forEach((v) => { edges.push({ from: u, to: v }); indegree[v]++; });
  r.setCode(['compute indegree', 'queue = indegree-0 nodes', 'while queue:', '  u = dequeue, add to order', '  for v in adj[u]: indegree[v]--', '  if indegree[v]==0: enqueue']);
  r.addStructure('graph', 'g', { nodes, edges, directed: true });
  r.addStructure('array', 'ind', { values: [...indegree], label: 'indegree[]' });
  const order = [], queue = [];
  for (let i = 0; i < V; i++) if (indegree[i] === 0) queue.push(i);
  r.setVars({ order: [] }); r.step(0, 'Init indegrees', {});
  const nh = {};
  while (queue.length > 0) {
    const u = queue.shift(); order.push(u); nh[u] = 'done';
    r.setVars({ order: [...order], current: u });
    r.highlight('g', { nodes: { ...nh, [u]: 'active' }, edges: {} });
    r.step(3, 'Process ' + u, { explanation: 'Add ' + u + ' to order.' });
    for (const v of (adjList[u] || [])) {
      indegree[v]--;
      r.updateStructure('ind', { values: [...indegree] });
      if (indegree[v] === 0) { queue.push(v); r.step(5, 'indegree[' + v + ']=0 → enqueue', { color: C.DONE }); }
      else r.step(4, 'indegree[' + v + ']=' + indegree[v], { color: C.COMPARE });
    }
  }
  r.step(-1, 'Order: [' + order.join('→') + ']' + (order.length < V ? ' CYCLE!' : ''), { color: order.length < V ? C.ALERT : C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// BACKTRACKING (Subsets)
// ═══════════════════════════════════════════════
export function traceBacktracking({ arr }) {
  const r = new StepRecorder();
  const nums = arr || [];
  r.setCode(['backtrack(start, current):', '  result.add(current)', '  for i=start to n-1:', '    current.add(nums[i])', '    backtrack(i+1)', '    current.removeLast()']);
  r.addStructure('array', 'nums', { values: [...nums], label: 'nums' });
  const result = [], current = [];
  r.setVars({ result: [], current: [], depth: 0 }); r.step(0, 'Start backtracking', {});
  function bt(start, depth) {
    result.push([...current]);
    r.setVars({ result: result.map(function(s){return '['+s+']'}), current: [...current], depth });
    r.step(1, 'Add [' + current + ']', { explanation: 'Subset #' + result.length, color: C.DONE });
    if (result.length > 50) return;
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      r.setVars({ current: [...current] });
      const cells = {}; current.forEach(function(v){ cells[nums.indexOf(v)] = 'active'; });
      r.highlight('nums', { cells });
      r.step(3, 'Pick ' + nums[i], { color: C.ACTIVE });
      bt(i + 1, depth + 1);
      current.pop();
      r.step(5, 'Backtrack: undo ' + nums[i], { color: C.SPECIAL });
    }
  }
  bt(0, 0);
  r.step(-1, result.length + ' subsets', { color: C.DONE });
  return r.getSteps();
}

// ═══════════════════════════════════════════════
// INPUT NORMALIZER
// ═══════════════════════════════════════════════
function buildAdj(n, edges, directed) {
  const adj = Array.from({ length: n }, function() { return []; });
  for (const e of edges) { adj[e[0]].push(e[1]); if (!directed) adj[e[1]].push(e[0]); }
  return adj;
}
function buildWAdj(n, edges) {
  const adj = Array.from({ length: n }, function() { return []; });
  for (const e of edges) { adj[e[0]].push([e[1], e[2]]); adj[e[1]].push([e[0], e[2]]); }
  return adj;
}

export function normalizeInput(patternId, parsed) {
  if (!parsed) return parsed;
  const p = { ...parsed };
  if (p.edges && p.n && !p.adjList) {
    if (patternId === 'dijkstra' || patternId === 'kruskal') p.adjList = buildWAdj(p.n, p.edges);
    else if (patternId === 'topological') p.adjList = buildAdj(p.n, p.edges, true);
    else p.adjList = buildAdj(p.n, p.edges, false);
    p.nodeCount = p.n;
  }
  if (p.nums && !p.arr) p.arr = p.nums;
  if (p.arr && !p.nums) p.nums = p.arr;
  return p;
}

// ═══════════════════════════════════════════════
// REGISTRY — maps pattern IDs → tracers + defaults
// ═══════════════════════════════════════════════
export const TRACER_REGISTRY = {
  binary_search: { tracer: traceBinarySearch, defaults: [
    { name: 'Basic', input: 'arr = [1,3,5,7,9,11,13], target = 7' },
    { name: 'Not found', input: 'arr = [1,3,5,7,9], target = 4' },
  ]},
  bfs: { tracer: traceBFS, defaults: [
    { name: 'Simple', input: 'n = 5, edges = [[0,1],[0,2],[1,3],[2,4]]' },
  ]},
  dfs: { tracer: traceDFS, defaults: [
    { name: 'Simple', input: 'n = 5, edges = [[0,1],[0,2],[1,3],[2,4]]' },
  ]},
  tarjan: { tracer: traceTarjan, defaults: [
    { name: 'Triangle+tail', input: 'n = 5, edges = [[0,1],[1,2],[2,0],[1,3],[3,4]]' },
    { name: 'All bridges', input: 'n = 4, edges = [[0,1],[1,2],[2,3]]' },
  ]},
  sliding_window: { tracer: traceSlidingWindow, defaults: [
    { name: 'k=3', input: 'arr = [1,4,2,10,2,3,1,0,20], k = 3' },
  ]},
  string_window: { tracer: traceStringWindow, defaults: [
    { name: 'abcabcbb', input: 's = "abcabcbb"' },
    { name: 'bbbbb', input: 's = "bbbbb"' },
    { name: 'pwwkew', input: 's = "pwwkew"' },
  ]},
  two_pointer: { tracer: traceTwoPointer, defaults: [
    { name: 'Found', input: 'arr = [2,7,11,15], target = 9' },
    { name: 'Negatives', input: 'arr = [-3,-1,0,2,4,6], target = 3' },
  ]},
  monotonic_stack: { tracer: traceNextGreater, defaults: [
    { name: 'Basic', input: 'arr = [4,5,2,10,8]' },
  ]},
  dijkstra: { tracer: traceDijkstra, defaults: [
    { name: 'Simple', input: 'n = 4, edges = [[0,1,4],[0,2,1],[2,1,2],[1,3,1]]' },
  ]},
  topological: { tracer: traceTopological, defaults: [
    { name: 'Courses', input: 'n = 4, edges = [[1,0],[2,0],[3,1],[3,2]]' },
  ]},
  backtracking: { tracer: traceBacktracking, defaults: [
    { name: '[1,2,3]', input: 'arr = [1,2,3]' },
  ]},
  sort: { tracer: function({ arr, nums }) {
    const r = new StepRecorder();
    const a = [...(arr || nums || [])];
    r.setCode(['for i=1 to n-1:', '  key = arr[i], j = i-1', '  while j≥0 and arr[j]>key:', '    arr[j+1] = arr[j]; j--', '  arr[j+1] = key']);
    r.addStructure('array', 'arr', { values: [...a], label: 'Insertion Sort' });
    r.setVars({ comparisons: 0, swaps: 0 });
    r.step(-1, 'Start sorting ' + a.length + ' elements', { explanation: 'Insertion sort: build sorted portion left to right.' });
    let comps = 0, swaps = 0;
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      r.setVars({ i, key, comparisons: comps, swaps });
      r.highlight('arr', { cells: { [i]: 'active' } });
      r.step(1, 'key = arr[' + i + '] = ' + key, { explanation: 'Insert ' + key + ' into sorted portion [0..' + (i-1) + '].' });
      let j = i - 1;
      while (j >= 0 && a[j] > key) {
        comps++; swaps++; a[j + 1] = a[j];
        r.updateStructure('arr', { values: [...a] });
        r.setVars({ comparisons: comps, swaps });
        r.highlight('arr', { cells: { [j]: 'compare', [j+1]: 'alert' } });
        r.step(3, 'Shift ' + a[j+1] + ' right', { explanation: a[j+1] + ' > ' + key + '. Shift right.', color: C.COMPARE });
        j--;
      }
      a[j + 1] = key;
      r.updateStructure('arr', { values: [...a] });
      const done = {}; for (let k = 0; k <= i; k++) done[k] = 'done';
      r.highlight('arr', { cells: done });
      r.step(4, 'Place ' + key + ' at [' + (j+1) + ']', { explanation: 'Sorted: [' + a.slice(0, i+1).join(',') + '].', color: C.DONE });
    }
    r.step(-1, 'Sorted: [' + a.join(',') + ']', { explanation: comps + ' comparisons, ' + swaps + ' shifts.', color: C.DONE });
    return r.getSteps();
  }, defaults: [
    { name: 'Basic', input: 'arr = [38,27,43,3,9,82,10]' },
    { name: 'Nearly sorted', input: 'arr = [1,2,4,3,5,6]' },
  ]},
  heap: { tracer: function({ arr, nums, k }) {
    const r = new StepRecorder();
    const a = [...(arr || nums || [])];
    const K = k || 3;
    r.setCode(['minHeap of size k', 'for each num:', '  if heap.size < k: add', '  elif num > heap[0]: replace top', '  sort heap after each op']);
    r.addStructure('array', 'arr', { values: [...a], label: 'Input (find ' + K + 'th largest)' });
    r.addStructure('array', 'heap', { values: [], label: 'Min-Heap (size ' + K + ')' });
    const heap = [];
    r.setVars({ k: K, heapSize: 0 });
    r.step(-1, 'Find ' + K + 'th largest', { explanation: 'Maintain a min-heap of size ' + K + '. Top = ' + K + 'th largest.' });
    for (let i = 0; i < a.length; i++) {
      r.highlight('arr', { cells: { [i]: 'active' } });
      if (heap.length < K) {
        heap.push(a[i]); heap.sort(function(x,y){return x-y});
        r.updateStructure('heap', { values: [...heap] });
        r.setVar('heapSize', heap.length);
        r.step(2, 'Add ' + a[i] + ' (size=' + heap.length + ')', { explanation: 'Heap not full. Add ' + a[i] + '. Heap: [' + heap.join(',') + '].', color: C.DONE });
      } else if (a[i] > heap[0]) {
        const old = heap[0]; heap[0] = a[i]; heap.sort(function(x,y){return x-y});
        r.updateStructure('heap', { values: [...heap] });
        r.step(3, a[i] + ' > ' + old + ' → replace', { explanation: 'Replace min ' + old + ' with ' + a[i] + '. Heap: [' + heap.join(',') + '].', color: C.COMPARE });
      } else {
        r.step(3, a[i] + ' ≤ ' + heap[0] + ' → skip', { explanation: a[i] + ' too small. Skip.', color: C.INACTIVE });
      }
    }
    const cells = {}; heap.forEach(function(_,i){ cells[i] = 'done'; });
    r.highlight('heap', { cells });
    r.step(-1, K + 'th largest = ' + heap[0], { explanation: 'Heap top = ' + heap[0] + '.', color: C.DONE });
    return r.getSteps();
  }, defaults: [
    { name: 'k=3', input: 'nums = [3,1,4,1,5,9,2,6], k = 3' },
    { name: 'k=1 (max)', input: 'nums = [7,3,8,2,5], k = 1' },
  ]},
  union_find: { tracer: function({ n, edges, nodeCount, adjList }) {
    const r = new StepRecorder();
    const V = n || nodeCount || (adjList ? adjList.length : 5);
    const E = edges || [];
    const pos = circleLayout(V, 220, 140, Math.min(110, V * 15));
    const nodes = pos.map(function(p, i) { return { id: i, x: p.x, y: p.y }; });
    const edgeList = E.map(function(e) { return { from: e[0], to: e[1] }; });
    r.setCode(['parent[i] = i for all i', 'for each edge (u,v):', '  if find(u) ≠ find(v):', '    union(u,v); components--', '  else: redundant edge']);
    r.addStructure('graph', 'g', { nodes, edges: edgeList });
    const parent = Array.from({ length: V }, function(_, i) { return i; });
    const rank = new Array(V).fill(0);
    r.addStructure('array', 'par', { values: [...parent], label: 'parent[]' });
    let comps = V;
    r.setVars({ components: comps });
    r.step(0, 'Init: ' + V + ' components', { explanation: 'Each node is its own component.' });
    function find(x) { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
    for (const e of E) {
      const u = e[0], v = e[1], pu = find(u), pv = find(v);
      const ek = Math.min(u,v) + '-' + Math.max(u,v);
      if (pu !== pv) {
        if (rank[pu] < rank[pv]) parent[pu] = pv;
        else if (rank[pu] > rank[pv]) parent[pv] = pu;
        else { parent[pv] = pu; rank[pu]++; }
        comps--;
        r.updateStructure('par', { values: [...parent] });
        r.setVar('components', comps);
        r.highlight('g', { nodes: { [u]: 'active', [v]: 'active' }, edges: { [ek]: 'done' } });
        r.highlight('par', { cells: { [u]: 'compare', [v]: 'compare' } });
        r.step(3, 'Union ' + u + '-' + v + ' (comps=' + comps + ')', { explanation: 'Different sets (root ' + pu + ' vs ' + pv + '). Merge.', color: C.DONE });
      } else {
        r.highlight('g', { nodes: { [u]: 'alert', [v]: 'alert' }, edges: { [ek]: 'alert' } });
        r.step(4, u + '-' + v + ' same set (redundant)', { explanation: 'Both in set rooted at ' + pu + '.', color: C.ALERT });
      }
    }
    r.step(-1, 'Done: ' + comps + ' component(s)', { explanation: 'Final parent[]: [' + parent.join(',') + '].', color: C.DONE });
    return r.getSteps();
  }, defaults: [
    { name: 'Basic', input: 'n = 6, edges = [[0,1],[1,2],[3,4],[4,5]]' },
    { name: 'All connected', input: 'n = 4, edges = [[0,1],[1,2],[2,3],[0,3]]' },
  ]},
  matrix_traversal: { tracer: function({ grid, matrix }) {
    const r = new StepRecorder();
    const g = (grid || matrix || []).map(function(row) { return [...row]; });
    if (!g.length) { r.step(-1, 'Empty grid', {}); return r.getSteps(); }
    const rows = g.length, cols = g[0].length;
    r.setCode(['for each cell (r,c):', '  if grid[r][c]==1 and !visited:', '    islands++', '    DFS/BFS flood fill island']);
    r.addStructure('matrix', 'grid', { grid: g.map(function(row) { return [...row]; }), label: rows + '×' + cols + ' grid' });
    const vis = Array.from({ length: rows }, function() { return new Array(cols).fill(false); });
    let islands = 0;
    r.setVars({ islands: 0 });
    r.step(0, 'Scan ' + rows + '×' + cols + ' grid', { explanation: 'Find connected components of 1s (islands).' });
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    function dfs(row, col) {
      if (row < 0 || row >= rows || col < 0 || col >= cols || g[row][col] === 0 || vis[row][col]) return;
      vis[row][col] = true;
      const cells = {};
      for (let rr = 0; rr < rows; rr++) for (let cc = 0; cc < cols; cc++) { if (vis[rr][cc]) cells[rr + '-' + cc] = 'done'; }
      cells[row + '-' + col] = 'active';
      r.highlight('grid', { cells });
      r.step(3, 'Visit (' + row + ',' + col + ')', { explanation: 'Part of island #' + islands + '.', color: C.ACTIVE });
      for (const d of dirs) dfs(row + d[0], col + d[1]);
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (g[i][j] === 1 && !vis[i][j]) {
          islands++;
          r.setVar('islands', islands);
          r.highlight('grid', { cells: { [i + '-' + j]: 'alert' } });
          r.step(1, 'New island #' + islands + ' at (' + i + ',' + j + ')', { explanation: 'Unvisited land found. Start flood fill.', color: C.ALERT });
          dfs(i, j);
        }
      }
    }
    r.step(-1, 'Total: ' + islands + ' island(s)', { explanation: 'Scanned entire grid.', color: C.DONE });
    return r.getSteps();
  }, defaults: [
    { name: '3 islands', input: 'grid = [[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,0,0,0]]' },
    { name: '1 island', input: 'grid = [[1,1],[1,1]]' },
    { name: 'Checkerboard', input: 'grid = [[1,0,1],[0,1,0],[1,0,1]]' },
  ]},
  dp_1d: { tracer: function({ n }) {
    const r = new StepRecorder();
    const N = Math.min(n || 10, 25);
    r.setCode(['dp[0] = 1, dp[1] = 1', 'for i from 2 to n:', '  dp[i] = dp[i-1] + dp[i-2]', 'return dp[n]']);
    const dp = new Array(N + 1).fill(0);
    dp[0] = 1; if (N >= 1) dp[1] = 1;
    r.addStructure('array', 'dp', { values: [...dp], label: 'dp[] (Fibonacci / Climbing Stairs)' });
    r.setVars({ n: N });
    r.highlight('dp', { cells: { 0: 'done', 1: 'done' } });
    r.step(0, 'Base: dp[0]=1, dp[1]=1', { explanation: 'Initialize base cases. dp[i] = number of ways to reach step i.' });
    for (let i = 2; i <= N; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      r.updateStructure('dp', { values: [...dp] });
      r.setVar('current_i', i);
      r.highlight('dp', { cells: { [i]: 'active', [i-1]: 'compare', [i-2]: 'compare' } });
      r.step(2, 'dp[' + i + '] = ' + dp[i-1] + ' + ' + dp[i-2] + ' = ' + dp[i], { explanation: 'dp[' + i + '] = dp[' + (i-1) + '] + dp[' + (i-2) + '] = ' + dp[i] + '.', color: C.DONE });
    }
    r.step(-1, 'dp[' + N + '] = ' + dp[N], { explanation: 'Answer: ' + dp[N] + ' ways.', color: C.DONE });
    return r.getSteps();
  }, defaults: [
    { name: 'n=10', input: 'n = 10' },
    { name: 'n=6', input: 'n = 6' },
    { name: 'n=20', input: 'n = 20' },
  ]},
  kruskal: { tracer: function({ n, edges, nodeCount }) {
    const r = new StepRecorder();
    const V = n || nodeCount || 4;
    const E = [...(edges || [])].sort(function(a,b) { return a[2] - b[2]; });
    const pos = circleLayout(V, 220, 140, Math.min(110, V * 15));
    const nodes = pos.map(function(p, i) { return { id: i, x: p.x, y: p.y }; });
    const edgeList = E.map(function(e) { return { from: e[0], to: e[1], weight: e[2] }; });
    r.setCode(['sort edges by weight', 'for each edge (u,v,w):', '  if find(u) ≠ find(v):', '    union; mstWeight += w', '  else: skip (cycle)']);
    r.addStructure('graph', 'g', { nodes, edges: edgeList });
    const parent = Array.from({ length: V }, function(_, i) { return i; });
    r.addStructure('array', 'par', { values: [...parent], label: 'parent[]' });
    let mstW = 0, used = 0;
    r.setVars({ mstWeight: 0, edgesUsed: 0 });
    r.step(0, 'Sorted ' + E.length + ' edges', { explanation: 'Edges by weight: ' + E.map(function(e){ return e[0]+'-'+e[1]+'('+e[2]+')'; }).join(', ') + '.' });
    function find(x) { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
    const nh = {}, eh = {};
    for (const e of E) {
      const u = e[0], v = e[1], w = e[2];
      const ek = Math.min(u,v) + '-' + Math.max(u,v);
      const pu = find(u), pv = find(v);
      if (pu !== pv) {
        parent[pu] = pv; mstW += w; used++;
        r.updateStructure('par', { values: [...parent] });
        r.setVars({ mstWeight: mstW, edgesUsed: used });
        nh[u] = 'done'; nh[v] = 'done'; eh[ek] = 'done';
        r.highlight('g', { nodes: { ...nh }, edges: { ...eh } });
        r.step(3, 'Add ' + u + '-' + v + ' (w=' + w + ') MST=' + mstW, { explanation: 'Different components. Add. Used: ' + used + '/' + (V-1) + '.', color: C.DONE });
        if (used === V - 1) break;
      } else {
        r.highlight('g', { nodes: { ...nh, [u]: 'alert', [v]: 'alert' }, edges: { ...eh, [ek]: 'alert' } });
        r.step(4, 'Skip ' + u + '-' + v + ' (cycle)', { explanation: 'Same component. Skip.', color: C.ALERT });
      }
    }
    r.step(-1, 'MST weight = ' + mstW, { explanation: 'Minimum spanning tree: ' + used + ' edges, weight ' + mstW + '.', color: C.DONE });
    return r.getSteps();
  }, defaults: [
    { name: 'Simple', input: 'n = 4, edges = [[0,1,10],[0,2,6],[0,3,5],[1,3,15],[2,3,4]]' },
  ]},
  dp_2d: { tracer: function({ s1, s2 }) {
    const r = new StepRecorder();
    const a = s1 || 'abcde', b = s2 || 'ace';
    const m = a.length, n = b.length;
    r.setCode(['dp[i][j] = LCS of a[0..i-1], b[0..j-1]', 'if a[i-1]==b[j-1]: dp[i][j]=dp[i-1][j-1]+1', 'else: max(dp[i-1][j], dp[i][j-1])']);
    const dp = Array.from({ length: m + 1 }, function() { return new Array(n + 1).fill(0); });
    r.addStructure('matrix', 'dp', { grid: dp.map(function(row){ return [...row]; }), label: 'LCS dp[][] ' + a + ' vs ' + b });
    r.setVars({ s1: a, s2: b }); r.step(-1, 'LCS of "' + a + '" and "' + b + '"', {});
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      const cells = {}; cells[i+'-'+j] = 'active';
      if (a[i-1] === b[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1; cells[(i-1)+'-'+(j-1)] = 'compare';
        r.updateStructure('dp', { grid: dp.map(function(row){ return [...row]; }) }); r.highlight('dp', { cells });
        r.step(1, a[i-1]+'=='+b[j-1]+' dp['+i+']['+j+']='+dp[i][j], { color: C.DONE });
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]); cells[(i-1)+'-'+j]='compare'; cells[i+'-'+(j-1)]='compare';
        r.updateStructure('dp', { grid: dp.map(function(row){ return [...row]; }) }); r.highlight('dp', { cells });
        r.step(2, a[i-1]+'≠'+b[j-1]+' max='+dp[i][j], { color: C.COMPARE });
      }
    }
    r.step(-1, 'LCS = ' + dp[m][n], { color: C.DONE }); return r.getSteps();
  }, defaults: [
    { name: 'abcde/ace', input: 's1 = "abcde", s2 = "ace"' },
    { name: 'abc/def', input: 's1 = "abc", s2 = "def"' },
  ]},
  linked_list: { tracer: function({ list, arr, nums }) {
    const r = new StepRecorder();
    const vals = list || arr || nums || [1,2,3,4,5];
    r.setCode(['prev=null, curr=head', 'while curr:', '  next=curr.next', '  curr.next=prev', '  prev=curr; curr=next']);
    r.addStructure('linkedlist', 'll', { values: [...vals], label: 'Reverse Linked List' });
    r.setVars({ prev: 'null', curr: vals[0] }); r.step(0, 'Reverse [' + vals.join('→') + ']', {});
    const rev = [];
    for (let i = 0; i < vals.length; i++) {
      rev.unshift(vals[i]);
      r.setVars({ prev: i > 0 ? vals[i-1] : 'null', curr: vals[i], next: i+1 < vals.length ? vals[i+1] : 'null' });
      r.highlight('ll', { cells: { [i]: 'active' } });
      r.step(3, 'Reverse ' + vals[i] + '.next → ' + (i > 0 ? vals[i-1] : 'null'), { color: C.ACTIVE });
    }
    r.updateStructure('ll', { values: [...rev], label: 'Reversed' });
    r.step(-1, 'Done: [' + rev.join('→') + ']', { color: C.DONE }); return r.getSteps();
  }, defaults: [
    { name: '[1..5]', input: 'list = [1,2,3,4,5]' },
  ]},
  bst: { tracer: function({ tree, arr, nums }) {
    const r = new StepRecorder();
    const vals = tree || arr || nums || [5,3,7,1,4,6,8];
    r.setCode(['for each val:', '  if val<node: go left', '  if val>node: go right', '  place at empty spot']);
    r.addStructure('array', 'input', { values: [...vals], label: 'Insert order' });
    r.step(-1, 'Build BST from [' + vals.join(',') + ']', {});
    const ins = [];
    for (let i = 0; i < vals.length; i++) {
      ins.push(vals[i]); r.setVars({ inserting: vals[i], count: ins.length });
      r.highlight('input', { cells: { [i]: 'active' } });
      r.step(0, 'Insert ' + vals[i], { explanation: 'BST now has ' + ins.length + ' nodes.', color: C.ACTIVE });
    }
    const sorted = [...vals].sort(function(a,b){return a-b;});
    r.addStructure('array', 'inorder', { values: sorted, label: 'Inorder (sorted)' });
    r.step(-1, 'Inorder: [' + sorted.join(',') + ']', { color: C.DONE }); return r.getSteps();
  }, defaults: [
    { name: 'Balanced', input: 'tree = [5,3,7,1,4,6,8]' },
  ]},
  trie: { tracer: function({ words }) {
    const r = new StepRecorder();
    const w = words || ['apple','app','bat'];
    r.setCode(['for each word:', '  traverse/create nodes', '  mark end']);
    let nodes = 1; r.setVars({ words: w.length, nodes: 1 }); r.step(-1, 'Build Trie', {});
    for (let i = 0; i < w.length; i++) {
      const chars = [...w[i]];
      r.addStructure('array', 'w'+i, { values: chars, label: '"' + w[i] + '"' });
      for (let j = 0; j < chars.length; j++) {
        nodes++; r.highlight('w'+i, { cells: { [j]: 'active' } });
        r.step(1, '"' + chars[j] + '" at depth ' + j, { explanation: 'Path: "' + w[i].substring(0,j+1) + '".', color: C.ACTIVE });
      }
      r.setVars({ words: i + 1, nodes }); r.step(2, 'End "' + w[i] + '"', { color: C.DONE });
    }
    r.step(-1, w.length + ' words, ~' + nodes + ' nodes', { color: C.DONE }); return r.getSteps();
  }, defaults: [
    { name: 'Basic', input: 'words = ["apple","app","bat"]' },
  ]},
};
