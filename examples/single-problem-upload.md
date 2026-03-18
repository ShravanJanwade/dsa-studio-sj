# Critical Connections in a Network

**Difficulty:** Hard  
**LeetCode:** https://leetcode.com/problems/critical-connections-in-a-network/  
**GFG:** https://www.geeksforgeeks.org/bridge-in-a-graph/

## Description

There are n servers numbered from 0 to n-1 connected by undirected server-to-server connections forming a network where connections[i] = [ai, bi] represents a connection between servers ai and bi.

A critical connection is a connection that, if removed, will make some server unable to reach some other server. Return all critical connections in the network in any order.

**Constraints:**
- 2 <= n <= 10^5
- n - 1 <= connections.length <= 10^5
- 0 <= ai, bi <= n - 1
- ai != bi

## In-depth Explanation

This problem is essentially asking us to find all **bridges** in an undirected graph. A bridge is an edge whose removal disconnects the graph (or increases the number of connected components).

Think of it like a road network — a bridge is a road that, if destroyed, isolates some towns from others. Any road that's part of a cycle is NOT a bridge, because traffic can reroute through the other side of the cycle.

The key insight: **cycles protect edges**. If an edge is part of a cycle, removing it doesn't disconnect anything. Only edges that are NOT part of any cycle are bridges.

## Brute Force Intuition

The most straightforward approach — literally test every edge:
1. Pick an edge
2. Remove it from the graph
3. Run BFS/DFS to check if the two endpoints can still reach each other
4. If NOT reachable → this edge is a **bridge**
5. Put the edge back and try the next one

## Brute Force In-depth Intuition

Why does this work? By definition, a bridge is an edge whose removal disconnects part of the graph. So we're directly testing each edge against this definition.

The critical subtlety: don't check `count == V` (global connectivity). Instead, check if the two **endpoints** of the removed edge can still reach each other. This correctly handles graphs with multiple connected components.

For example, if the graph already has two disconnected components {0,1,2} and {3,4}, removing edge 0-1 and checking `count == 5` would wrongly say every edge is a bridge.

## Brute Force Algorithm

```
For every edge (u, v) in graph:
    Remove edge (u, v)
    BFS from u → check if v is reachable
    If NOT reachable → BRIDGE
    Add edge (u, v) back
```

## Brute Force Code

```java
import java.util.*;

public class BridgeBruteForce {
    
    static boolean endpointsConnected(int V, List<int[]> edges, int skipU, int skipV) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());
        
        for (int[] e : edges) {
            if ((e[0] == skipU && e[1] == skipV) || (e[0] == skipV && e[1] == skipU)) continue;
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }
        
        boolean[] visited = new boolean[V];
        Queue<Integer> queue = new LinkedList<>();
        queue.add(skipU);
        visited[skipU] = true;
        
        while (!queue.isEmpty()) {
            int node = queue.poll();
            if (node == skipV) return true;
            for (int nb : adj.get(node)) {
                if (!visited[nb]) { visited[nb] = true; queue.add(nb); }
            }
        }
        return false;
    }
    
    static List<int[]> findBridges(int V, List<int[]> edges) {
        List<int[]> bridges = new ArrayList<>();
        for (int[] edge : edges) {
            if (!endpointsConnected(V, edges, edge[0], edge[1]))
                bridges.add(edge);
        }
        return bridges;
    }
}
```

## Brute Force Complexity

Time: O(E × (V + E))
Space: O(V + E)

## Brute Force Hints

- What happens when you remove an edge that's part of a cycle?
- Check endpoint reachability, not global count == V
- This rebuilds the adjacency list E times — that's the bottleneck
- Think about what makes this slow and what info is being recomputed

## Optimal Intuition

DFS creates a **tree** from the graph. Every edge becomes either a **tree edge** (discovers new nodes) or a **back edge** (connects to an already-visited ancestor, creating a cycle).

Back edges are "safety nets" — they protect tree edges from being bridges. If a subtree has a back edge reaching above a tree edge, that tree edge has an alternate path.

**Bridge condition:** `low[v] > disc[u]` for tree edge u→v — meaning v's subtree has NO back edge reaching u or above.

## Optimal In-depth Intuition

Let's build this step by step:

**Step 1: DFS Tree.** When you run DFS, you get a spanning tree. Every non-tree edge connects a node to one of its ancestors (back edge). This is a property of DFS specifically — BFS doesn't give you this.

**Step 2: disc[] array.** `disc[u]` records when node u was first discovered. Earlier nodes get smaller numbers. This gives us a timeline.

**Step 3: low[] array.** `low[u]` is the earliest discovery time reachable from u's entire subtree using back edges. It starts as `disc[u]` and gets updated:
- When we find a back edge u→v: `low[u] = min(low[u], disc[v])`
- When we return from a child v: `low[u] = min(low[u], low[v])` (propagate upward)

**Step 4: Bridge detection.** For tree edge u→v, if `low[v] > disc[u]`, it means v's subtree cannot "see" u or anything above u through back edges. Therefore, removing u→v isolates v's subtree.

## Optimal Algorithm

```
function dfs(u, parent):
    disc[u] = low[u] = timer++
    
    for each neighbor v of u:
        if v not visited:
            dfs(v, u)
            low[u] = min(low[u], low[v])  // propagate
            if low[v] > disc[u]:           // BRIDGE!
                add (u, v) to bridges
        else if v != parent:
            low[u] = min(low[u], disc[v])  // back edge
```

## Optimal Code

```java
import java.util.*;

public class TarjanBridges {
    static int timer = 0;

    static void dfs(int u, int parent, List<List<Integer>> adj,
                    int[] disc, int[] low, boolean[] visited,
                    List<int[]> bridges) {
        visited[u] = true;
        disc[u] = low[u] = timer++;

        for (int v : adj.get(u)) {
            if (!visited[v]) {
                dfs(v, u, adj, disc, low, visited, bridges);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) {
                    bridges.add(new int[]{u, v});
                }
            } else if (v != parent) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }

    static List<int[]> findBridges(int V, List<int[]> edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }
        int[] disc = new int[V], low = new int[V];
        boolean[] visited = new boolean[V];
        List<int[]> bridges = new ArrayList<>();
        timer = 0;
        for (int i = 0; i < V; i++) {
            if (!visited[i]) dfs(i, -1, adj, disc, low, visited, bridges);
        }
        return bridges;
    }
}
```

## Optimal Complexity

Time: O(V + E)
Space: O(V + E)

## Optimal Hints

- DFS classifies edges into tree and back edges automatically
- Back edges create cycles — cycles protect tree edges from being bridges
- low[] propagates cycle information upward through the DFS tree
- The bridge condition is just one comparison: low[v] > disc[u]
