# MST Theory

**Difficulty:** Easy
**GFG:** https://www.geeksforgeeks.org/minimum-spanning-tree/

## Description

Given a weighted, undirected, and connected graph of V vertices and E edges. The task is to find the sum of weights of the edges of the Minimum Spanning Tree.

A spanning tree of a graph is a subset of edges that forms a tree including every vertex. The minimum spanning tree (MST) is the spanning tree with the minimum total edge weight.

## In-depth Explanation

A **Minimum Spanning Tree** connects all V vertices using exactly V-1 edges with the minimum possible total weight. Key properties:
- A graph can have multiple MSTs (if edges have equal weights)
- MST always has exactly V-1 edges
- Adding any edge to an MST creates exactly one cycle
- Removing the heaviest edge from that cycle gives another MST (or the same one)

Two classic algorithms: **Kruskal's** (sort edges, greedily add if no cycle via Union-Find) and **Prim's** (grow tree from a source, always pick cheapest edge leaving the tree).

## Brute Force Intuition

Generate all possible spanning trees and find the one with minimum weight. A graph with E edges has up to C(E, V-1) spanning trees — exponential.

## Brute Force Complexity

Time: O(2^E)
Space: O(V)

## Optimal Intuition

**Kruskal's Algorithm:** Sort all edges by weight. Process edges in order — add an edge to MST if it doesn't create a cycle. Use Union-Find to detect cycles in near O(1).

Why greedy works: the Cut Property guarantees that the lightest edge crossing any cut must be in the MST.

## Optimal In-depth Intuition

**The Cut Property (why greedy is correct):** For any cut of the graph (partition of vertices into two sets), the minimum weight edge crossing the cut MUST be in every MST. This is provable by contradiction — if it weren't included, swapping it for a heavier crossing edge would reduce total weight.

Kruskal's exploits this: sorting by weight and adding edges that connect different components is equivalent to repeatedly finding the lightest crossing edge for the cut between each component and the rest of the graph.

## Optimal Algorithm

```
Kruskal's:
1. Sort all edges by weight
2. Initialize Union-Find with V vertices
3. For each edge (u, v, w) in sorted order:
   a. If find(u) != find(v):  // different components
      - Union(u, v)
      - Add edge to MST
      - mstWeight += w
4. Return mstWeight
```

## Optimal Code

```java
import java.util.*;

class KruskalMST {
    int[] parent, rank;
    
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }
    
    void union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) return;
        if (rank[pa] < rank[pb]) { int t = pa; pa = pb; pb = t; }
        parent[pb] = pa;
        if (rank[pa] == rank[pb]) rank[pa]++;
    }
    
    int spanningTree(int V, int E, int[][] edges) {
        Arrays.sort(edges, (a, b) -> a[2] - b[2]);
        parent = new int[V];
        rank = new int[V];
        for (int i = 0; i < V; i++) parent[i] = i;
        
        int mstWeight = 0, edgesUsed = 0;
        for (int[] edge : edges) {
            if (find(edge[0]) != find(edge[1])) {
                union(edge[0], edge[1]);
                mstWeight += edge[2];
                if (++edgesUsed == V - 1) break;
            }
        }
        return mstWeight;
    }
}
```

## Optimal Complexity

Time: O(E log E)
Space: O(V)

## Optimal Hints

- Sort edges first — greedy picks cheapest available
- Union-Find detects cycles in near O(1) with path compression + rank
- You need exactly V-1 edges for a spanning tree
- The Cut Property proves greedy correctness

---

# Prim's Algorithm

**Difficulty:** Hard
**GFG:** https://www.geeksforgeeks.org/prims-minimum-spanning-tree-mst-greedy-algo-5/
**LeetCode:** https://leetcode.com/problems/min-cost-to-connect-all-points/

## Description

Given a weighted, undirected graph, find the MST using Prim's algorithm. Start from any vertex and greedily grow the tree by always adding the cheapest edge that connects a tree vertex to a non-tree vertex.

## In-depth Explanation

Prim's is like Dijkstra's but for MST. Instead of tracking shortest distance from source, we track the cheapest edge connecting each non-tree vertex to the current tree. Key difference from Kruskal's: Prim's grows one connected tree, while Kruskal's merges separate components.

Best when graph is dense (E close to V^2) — use adjacency matrix + O(V^2). For sparse graphs, use min-heap + O(E log V).

## Optimal Intuition

Start from vertex 0. Maintain a min-heap of (weight, vertex) for all edges leaving the current MST. Always extract the minimum, add that vertex to MST, and push its new edges.

## Optimal In-depth Intuition

Think of it as growing a crystal: at each step, the cheapest edge bridging the boundary between "in the tree" and "not in the tree" gets added. The min-heap efficiently finds this cheapest boundary edge.

**Why it's correct:** Each step adds the lightest edge crossing the cut between the MST-so-far and the rest — exactly the Cut Property.

## Optimal Algorithm

```
function primMST(V, adj):
    inMST = [false] * V
    minHeap = [(0, 0)]  // (weight, vertex)
    mstWeight = 0
    
    while heap not empty:
        (w, u) = extractMin(heap)
        if inMST[u]: continue
        inMST[u] = true
        mstWeight += w
        
        for (v, edgeWeight) in adj[u]:
            if not inMST[v]:
                heap.add((edgeWeight, v))
    
    return mstWeight
```

## Optimal Code

```java
import java.util.*;

class PrimMST {
    int spanningTree(int V,
            List<List<int[]>> adj) {
        boolean[] inMST = new boolean[V];
        // {weight, vertex}
        PriorityQueue<int[]> pq =
            new PriorityQueue<>(
                (a, b) -> a[0] - b[0]);
        pq.offer(new int[]{0, 0});
        int mstWeight = 0;
        
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int w = top[0], u = top[1];
            if (inMST[u]) continue;
            inMST[u] = true;
            mstWeight += w;
            
            for (int[] edge : adj.get(u)) {
                int v = edge[0], ew = edge[1];
                if (!inMST[v]) {
                    pq.offer(new int[]{ew, v});
                }
            }
        }
        return mstWeight;
    }
}
```

## Optimal Complexity

Time: O(E log V)
Space: O(V + E)

## Optimal Hints

- Prim's is almost identical to Dijkstra's — just change what you're minimizing
- The min-heap stores edges by weight, not distance from source
- Skip vertices already in MST when popping from heap
- Works from any starting vertex — MST is the same

---

# Disjoint Set

**Difficulty:** Hard
**GFG:** https://www.geeksforgeeks.org/disjoint-set-data-structures/

## Description

Implement a Disjoint Set Union (DSU) / Union-Find data structure that supports:
- `find(x)`: Find the representative (root) of the set containing x
- `union(x, y)`: Merge the sets containing x and y
- With Path Compression and Union by Rank for near O(1) amortized operations

## In-depth Explanation

DSU is a data structure that tracks a collection of disjoint sets. Each set has a representative (root). Two key optimizations make it blazing fast:

**Path Compression:** During find(x), make every node on the path point directly to the root. This flattens the tree so future finds are O(1).

**Union by Rank:** When merging, attach the shorter tree under the taller tree. This keeps trees balanced so height is at most O(log n).

Together: amortized O(α(n)) per operation where α is the inverse Ackermann function — effectively O(1) for all practical purposes.

## Optimal Intuition

Each element starts as its own set (parent[i] = i). Union merges two sets by linking one root to another. Find follows parent pointers to the root, compressing the path along the way.

## Optimal In-depth Intuition

**Path Compression in detail:** Without it, find() walks up the parent chain which could be O(n). With it, every node visited during find() gets its parent set directly to the root. After one find(), subsequent finds for any node on that path are O(1).

**Union by Rank in detail:** Rank approximates tree height. When unioning, the smaller-rank tree goes under the larger-rank tree. Rank only increases when two equal-rank trees merge. This ensures max rank is O(log n).

**Why it matters for DSA:** DSU is the backbone of Kruskal's MST, connected components in dynamic graphs, cycle detection, and many graph problems where you need to track "are these in the same group?"

## Optimal Algorithm

```
class DSU:
    parent[0..n-1] = [0, 1, 2, ..., n-1]
    rank[0..n-1] = [0, 0, 0, ..., 0]
    
    find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])  // path compression
        return parent[x]
    
    union(a, b):
        pa = find(a), pb = find(b)
        if pa == pb: return false  // already same set
        if rank[pa] < rank[pb]: swap(pa, pb)
        parent[pb] = pa
        if rank[pa] == rank[pb]: rank[pa]++
        return true
```

## Optimal Code

```java
class DisjointSet {
    int[] parent, rank;
    int components;
    
    DisjointSet(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;
        for (int i = 0; i < n; i++)
            parent[i] = i;
    }
    
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }
    
    boolean union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) return false;
        if (rank[pa] < rank[pb]) {
            int t = pa; pa = pb; pb = t;
        }
        parent[pb] = pa;
        if (rank[pa] == rank[pb])
            rank[pa]++;
        components--;
        return true;
    }
    
    boolean connected(int a, int b) {
        return find(a) == find(b);
    }
}
```

## Optimal Complexity

Time: O(α(n)) per operation (amortized)
Space: O(n)

## Optimal Hints

- Path compression: parent[x] = find(parent[x]) — one line, massive speedup
- Union by rank keeps trees balanced — prevents O(n) degeneration
- Track component count for problems that ask "how many groups?"
- find() returns the root — two nodes are in the same set iff find(a) == find(b)

---

# Find the MST Weight

**Difficulty:** Hard
**GFG:** https://www.geeksforgeeks.org/kruskals-minimum-spanning-tree-algorithm-greedy-algo-2/

## Description

Given a weighted undirected graph with V vertices and E edges, find the total weight of the Minimum Spanning Tree using Kruskal's algorithm.

## In-depth Explanation

This is the direct application of Kruskal's: sort edges by weight, use Union-Find to greedily add edges that don't form cycles. The answer is the sum of weights of the V-1 edges in the MST.

## Optimal Intuition

Sort all edges. Iterate through them. If the current edge connects two different components (checked via Union-Find), add it to MST. Stop after V-1 edges.

## Optimal Code

```java
class Solution {
    int[] parent, rank;
    
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }
    
    void union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) return;
        if (rank[pa] < rank[pb]) {
            int t = pa; pa = pb; pb = t;
        }
        parent[pb] = pa;
        if (rank[pa] == rank[pb]) rank[pa]++;
    }
    
    int kruskalMST(int V, int[][] edges) {
        Arrays.sort(edges, (a, b) -> a[2] - b[2]);
        parent = new int[V];
        rank = new int[V];
        for (int i = 0; i < V; i++) parent[i] = i;
        
        int total = 0, count = 0;
        for (int[] e : edges) {
            if (find(e[0]) != find(e[1])) {
                union(e[0], e[1]);
                total += e[2];
                if (++count == V - 1) break;
            }
        }
        return total;
    }
}
```

## Optimal Complexity

Time: O(E log E)
Space: O(V)

## Optimal Hints

- Sorting dominates the time complexity
- Union-Find operations are nearly O(1)
- Early termination: stop after V-1 edges accepted

---

# Number of Operations to Make Network Connected

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/number-of-operations-to-make-network-connected/

## Description

There are n computers numbered from 0 to n-1 connected by ethernet cables given as connections[i] = [ai, bi]. You can remove a cable between two directly connected computers and place it between any pair of disconnected computers to make them directly connected. Return the minimum number of cables you need to move to make all computers connected, or -1 if it's not possible.

## In-depth Explanation

Key insight: to connect n nodes, you need at least n-1 edges. If you have fewer edges, it's impossible (-1). If you have enough edges, some will be redundant (connecting already-connected nodes). The answer is simply: **number of connected components - 1**.

Every redundant edge (connecting two nodes already in the same component) is a "spare cable" that can be moved. We need (components - 1) spare cables to connect all components.

## Optimal Intuition

Use Union-Find. For each edge, if the two nodes are already connected, it's a spare cable. Count components at the end. If spare cables >= components - 1, answer is components - 1. Otherwise -1.

## Optimal Code

```java
class Solution {
    int[] parent, rank;
    
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }
    
    public int makeConnected(int n,
            int[][] connections) {
        if (connections.length < n - 1)
            return -1;
        
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++)
            parent[i] = i;
        
        int components = n;
        for (int[] c : connections) {
            int pa = find(c[0]), pb = find(c[1]);
            if (pa != pb) {
                if (rank[pa] < rank[pb]) {
                    int t = pa; pa = pb; pb = t;
                }
                parent[pb] = pa;
                if (rank[pa] == rank[pb])
                    rank[pa]++;
                components--;
            }
        }
        return components - 1;
    }
}
```

## Optimal Complexity

Time: O(E × α(n))
Space: O(n)

## Optimal Hints

- Minimum edges needed: n - 1. If fewer, return -1.
- Answer = number of components - 1
- You don't need to track spare cables separately — just count components
- This is a pure Union-Find application

---

# Most Stones Removed with Same Row or Column

**Difficulty:** Medium
**LeetCode:** https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/

## Description

On a 2D plane, we place n stones at some integer coordinate points. A stone can be removed if it shares a row or column with another stone that has not been removed. Given stones as an array of [xi, yi], return the maximum number of stones that can be removed.

## In-depth Explanation

Two stones sharing a row or column are "connected." Connected stones form a group where you can remove all except one (the last one standing). So: **answer = total stones - number of connected components**.

The trick: instead of connecting stones directly (O(n^2)), connect each stone's row index to its column index in a Union-Find. Use offset for columns (e.g., column j becomes j + 10001) to avoid row/column index collision.

## Optimal Intuition

Every stone connects its row to its column. All stones sharing a row get transitively connected. All stones sharing a column get transitively connected. Count unique components, subtract from total.

## Optimal Code

```java
class Solution {
    Map<Integer, Integer> parent = new HashMap<>();
    Map<Integer, Integer> rank = new HashMap<>();
    int components = 0;
    
    int find(int x) {
        if (!parent.containsKey(x)) {
            parent.put(x, x);
            rank.put(x, 0);
            components++;
        }
        if (parent.get(x) != x)
            parent.put(x, find(parent.get(x)));
        return parent.get(x);
    }
    
    void union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) return;
        int ra = rank.get(pa), rb = rank.get(pb);
        if (ra < rb) { int t = pa; pa = pb; pb = t; }
        parent.put(pb, pa);
        if (ra == rb)
            rank.put(pa, ra + 1);
        components--;
    }
    
    public int removeStones(int[][] stones) {
        for (int[] s : stones) {
            // Connect row i to column j+offset
            union(s[0], s[1] + 10001);
        }
        return stones.length - components;
    }
}
```

## Optimal Complexity

Time: O(n × α(n))
Space: O(n)

## Optimal Hints

- Stones on same row or column are connected — think Union-Find
- Connect row index to column index (with offset) for each stone
- Answer = total stones - number of connected components
- Use HashMap-based DSU since indices can be large

---

# Accounts Merge

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/accounts-merge/

## Description

Given a list of accounts where accounts[i] = [name, email1, email2, ...], merge accounts that share at least one common email. Two accounts with the same name but no common email remain separate. Return merged accounts with emails sorted.

## In-depth Explanation

This is a connected components problem. If account A has email X, and account B also has email X, they must be the same person — merge them. Use Union-Find where each unique email maps to an account index. When an email appears in multiple accounts, union those accounts.

## Optimal Intuition

Map each email to the first account index that owns it. If an email is already mapped, union the current account with the previously mapped account. After all unions, group emails by their root account.

## Optimal Code

```java
class Solution {
    int[] parent, rank;
    
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }
    
    void union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) return;
        if (rank[pa] < rank[pb]) {
            int t = pa; pa = pb; pb = t;
        }
        parent[pb] = pa;
        if (rank[pa] == rank[pb]) rank[pa]++;
    }
    
    public List<List<String>> accountsMerge(
            List<List<String>> accounts) {
        int n = accounts.size();
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        
        // Map email -> first account index
        Map<String, Integer> emailToIdx =
            new HashMap<>();
        for (int i = 0; i < n; i++) {
            for (int j = 1;
                    j < accounts.get(i).size();
                    j++) {
                String email =
                    accounts.get(i).get(j);
                if (emailToIdx.containsKey(email))
                    union(i, emailToIdx.get(email));
                else
                    emailToIdx.put(email, i);
            }
        }
        
        // Group emails by root
        Map<Integer, TreeSet<String>> groups =
            new HashMap<>();
        for (Map.Entry<String, Integer> e :
                emailToIdx.entrySet()) {
            int root = find(e.getValue());
            groups.computeIfAbsent(root,
                k -> new TreeSet<>())
                .add(e.getKey());
        }
        
        List<List<String>> result =
            new ArrayList<>();
        for (Map.Entry<Integer, TreeSet<String>> e
                : groups.entrySet()) {
            List<String> merged =
                new ArrayList<>();
            merged.add(
                accounts.get(e.getKey()).get(0));
            merged.addAll(e.getValue());
            result.add(merged);
        }
        return result;
    }
}
```

## Optimal Complexity

Time: O(n × k × α(n)) where k = avg emails per account
Space: O(n × k)

## Optimal Hints

- Union accounts that share an email — not emails themselves
- Map each email to the first account that owns it
- Use TreeSet for automatic email sorting in the result
- The name comes from the root account of each group

---

# Number of Islands II

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/number-of-islands-ii/

## Description

Given an m x n grid initially filled with water (0). You are given positions where land (1) is added one at a time. After each addition, return the number of islands. An island is a group of connected lands (4-directional).

## In-depth Explanation

This is a dynamic connectivity problem — perfect for Union-Find. For each new land cell, check its 4 neighbors. If a neighbor is also land, union them. Track component count: increment for each new land, decrement for each successful union.

## Optimal Intuition

Maintain DSU over the grid. When adding land at (r,c): mark it as land, increment count by 1. Then check all 4 neighbors — if neighbor is land and in a different component, union and decrement count.

## Optimal Code

```java
class Solution {
    int[] parent, rank;
    int count = 0;
    
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }
    
    void union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) return;
        if (rank[pa] < rank[pb]) {
            int t = pa; pa = pb; pb = t;
        }
        parent[pb] = pa;
        if (rank[pa] == rank[pb]) rank[pa]++;
        count--;
    }
    
    public List<Integer> numIslands2(int m, int n,
            int[][] positions) {
        parent = new int[m * n];
        rank = new int[m * n];
        Arrays.fill(parent, -1);
        
        int[][] dirs =
            {{0,1},{0,-1},{1,0},{-1,0}};
        List<Integer> result = new ArrayList<>();
        
        for (int[] pos : positions) {
            int r = pos[0], c = pos[1];
            int id = r * n + c;
            
            if (parent[id] != -1) {
                result.add(count);
                continue;
            }
            
            parent[id] = id;
            count++;
            
            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                int nid = nr * n + nc;
                if (nr >= 0 && nr < m &&
                        nc >= 0 && nc < n &&
                        parent[nid] != -1) {
                    union(id, nid);
                }
            }
            result.add(count);
        }
        return result;
    }
}
```

## Optimal Complexity

Time: O(k × α(m×n)) where k = number of operations
Space: O(m × n)

## Optimal Hints

- Initialize parent to -1 (water) — only set to self when land is added
- Each land addition: count++ then union with land neighbors: count--
- Handle duplicate positions (same cell added twice)
- Flatten 2D to 1D: id = row * cols + col

---

# Making a Large Island

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/making-a-large-island/

## Description

You are given an n x n binary matrix grid. You are allowed to change at most one 0 to a 1. Return the size of the largest island in grid after applying this operation. An island is a 4-directionally connected group of 1s.

## In-depth Explanation

First, identify all islands and their sizes using Union-Find (or BFS). Then, for each 0 cell, check its 4 neighbors. If flipping this 0 to 1 connects multiple distinct islands, the new island size = 1 + sum of unique neighbor island sizes. Track the maximum.

## Optimal Intuition

Phase 1: Use Union-Find to find all components and their sizes.
Phase 2: For each 0 cell, collect unique component roots from its 4 neighbors. The potential island size = 1 + sum of those component sizes.

## Optimal Code

```java
class Solution {
    int[] parent, rank, size;
    
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }
    
    void union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) return;
        if (rank[pa] < rank[pb]) {
            int t = pa; pa = pb; pb = t;
        }
        parent[pb] = pa;
        size[pa] += size[pb];
        if (rank[pa] == rank[pb]) rank[pa]++;
    }
    
    public int largestIsland(int[][] grid) {
        int n = grid.length;
        parent = new int[n * n];
        rank = new int[n * n];
        size = new int[n * n];
        for (int i = 0; i < n * n; i++) {
            parent[i] = i; size[i] = 1;
        }
        
        int[][] dirs =
            {{0,1},{0,-1},{1,0},{-1,0}};
        
        // Phase 1: Union all 1-cells
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                if (grid[r][c] == 1)
                    for (int[] d : dirs) {
                        int nr = r+d[0], nc = c+d[1];
                        if (nr>=0 && nr<n &&
                                nc>=0 && nc<n &&
                                grid[nr][nc] == 1)
                            union(r*n+c, nr*n+nc);
                    }
        
        int max = 0;
        // Check max existing island
        for (int i = 0; i < n*n; i++)
            if (grid[i/n][i%n] == 1)
                max = Math.max(max,
                    size[find(i)]);
        
        // Phase 2: Try flipping each 0
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                if (grid[r][c] == 0) {
                    Set<Integer> seen =
                        new HashSet<>();
                    int total = 1;
                    for (int[] d : dirs) {
                        int nr=r+d[0], nc=c+d[1];
                        if (nr>=0 && nr<n &&
                                nc>=0 && nc<n &&
                                grid[nr][nc]==1) {
                            int root =
                                find(nr*n+nc);
                            if (seen.add(root))
                                total += size[root];
                        }
                    }
                    max = Math.max(max, total);
                }
        return max == 0 ? 1 : max;
    }
}
```

## Optimal Complexity

Time: O(n^2 × α(n^2))
Space: O(n^2)

## Optimal Hints

- Phase 1: build components. Phase 2: try each flip.
- Use a Set to avoid counting the same island twice from different neighbors
- Don't forget the edge case where entire grid is already 1s
- Track component size in the Union-Find root

---

# Swim in Rising Water

**Difficulty:** Medium
**LeetCode:** https://leetcode.com/problems/swim-in-rising-water/

## Description

You are given an n x n grid where grid[i][j] represents the elevation at cell (i,j). At time t, the water level is t. You can swim from cell to cell if both cells have elevation <= t. Starting from (0,0), find the minimum time to reach (n-1, n-1).

## In-depth Explanation

This is a minimum bottleneck path problem. We want the path from (0,0) to (n-1,n-1) where the maximum elevation along the path is minimized. Three approaches work: binary search + BFS, Dijkstra-like with max instead of sum, or Union-Find with sorted cells.

The Union-Find approach is elegant: sort all cells by elevation. Process cells in order — at time t, all cells with elevation <= t are "available." Union each available cell with its available neighbors. The answer is the time when (0,0) and (n-1,n-1) become connected.

## Optimal Intuition

Sort all cells by elevation. Process from lowest to highest. For each cell, union it with its already-processed neighbors. The moment source and destination are in the same component, we have our answer.

## Optimal Code

```java
class Solution {
    int[] parent, rank;
    
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }
    
    void union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) return;
        if (rank[pa] < rank[pb]) {
            int t = pa; pa = pb; pb = t;
        }
        parent[pb] = pa;
        if (rank[pa] == rank[pb]) rank[pa]++;
    }
    
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        parent = new int[n * n];
        rank = new int[n * n];
        for (int i = 0; i < n*n; i++)
            parent[i] = i;
        
        // Sort cells by elevation
        int[][] cells = new int[n * n][3];
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                cells[r*n+c] =
                    new int[]{grid[r][c], r, c};
        Arrays.sort(cells,
            (a, b) -> a[0] - b[0]);
        
        boolean[][] processed =
            new boolean[n][n];
        int[][] dirs =
            {{0,1},{0,-1},{1,0},{-1,0}};
        
        for (int[] cell : cells) {
            int t = cell[0], r = cell[1],
                c = cell[2];
            processed[r][c] = true;
            
            for (int[] d : dirs) {
                int nr = r+d[0], nc = c+d[1];
                if (nr>=0 && nr<n &&
                        nc>=0 && nc<n &&
                        processed[nr][nc])
                    union(r*n+c, nr*n+nc);
            }
            
            if (find(0) ==
                    find(n*n - 1))
                return t;
        }
        return grid[n-1][n-1];
    }
}
```

## Optimal Complexity

Time: O(n^2 log n)
Space: O(n^2)

## Optimal Hints

- Sort cells by elevation — process in time order
- Union each cell with its already-processed (available) neighbors
- Answer is the elevation of the cell that finally connects source to destination
- Alternative: binary search on answer + BFS to verify, or Dijkstra with max-heap
