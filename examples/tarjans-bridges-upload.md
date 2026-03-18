# Critical Connections in a Network

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/critical-connections-in-a-network/
**GFG:** https://www.geeksforgeeks.org/bridge-in-a-graph/

## Description

There are `n` servers numbered from `0` to `n - 1` connected by undirected server-to-server connections forming a network where `connections[i] = [ai, bi]` represents a connection between servers `ai` and `bi`. Any server can reach other servers directly or indirectly through the network.

A **critical connection** is a connection that, if removed, will make some server unable to reach some other server.

Return all critical connections in the network in any order.

**Constraints:**
- 2 <= n <= 10^5
- n - 1 <= connections.length <= 10^5
- 0 <= ai, bi <= n - 1
- ai != bi
- There are no repeated connections

**Example 1:**
- Input: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]
- Output: [[1,3]]
- The connection [1,3] is the only bridge. Removing it disconnects server 3.

**Example 2:**
- Input: n = 2, connections = [[0,1]]
- Output: [[0,1]]

## In-depth Explanation

This problem is asking us to find all **bridges** in an undirected graph. A bridge is an edge whose removal increases the number of connected components — in other words, it disconnects part of the graph.

**Real-world analogy:** Think of a road network between cities. A bridge is a road that, if destroyed, isolates some cities from others. If there are multiple routes between two cities (a cycle), then no single road between them is critical. But if there's only one road connecting a region to the rest of the network, that road is a bridge.

**The key insight is about cycles:**
- If an edge is part of a cycle, it is NOT a bridge — traffic can reroute through the other side of the cycle
- Only edges that are NOT part of any cycle are bridges
- So the problem reduces to: find all edges that don't participate in any cycle

**What approach to think about:**
1. The brute force directly tests the definition — remove each edge and check connectivity
2. The optimal approach (Tarjan's) uses DFS properties to detect cycle participation in O(V+E)

**Edge cases to consider:**
- A tree (no cycles at all) — every edge is a bridge
- A single cycle — no bridges
- Multiple disconnected components — find bridges within each component
- Parallel edges between same nodes — neither is a bridge

## Brute Force Intuition

The most direct translation of the definition: an edge is a bridge if removing it disconnects the graph.

So for every edge:
1. Remove it
2. Check if the two endpoints can still reach each other via BFS/DFS
3. If they can't — this edge is a bridge
4. Put it back and try the next edge

This is correct but slow — we repeat nearly identical work E times.

## Brute Force In-depth Intuition

**Why check endpoint connectivity, not global connectivity?**

A common mistake is to BFS from node 0 and check `visited_count == V`. This fails on graphs that already have multiple components. For example, if the graph has components {0,1,2} and {3,4}, removing edge 0-1 gives visited_count=2 from node 0, which is less than V=5, so you'd wrongly call 0-1 a bridge even if 0,1,2 form a triangle.

The fix: after removing edge (u,v), BFS from u and check if v is reachable. This correctly asks "did removing this specific edge disconnect these specific endpoints?"

**Why is this O(E × (V+E))?**

For each of E edges, we:
- Rebuild the adjacency list: O(V + E)
- Run BFS: O(V + E)
- Total per edge: O(V + E)
- Total overall: O(E × (V + E))

For a graph with 100K nodes and 100K edges, that's ~10 billion operations — way too slow.

**What repeated work are we doing?**

Every BFS explores almost the same graph. Tarjan's insight was: instead of removing edges one by one, do a single DFS and use the DFS tree structure to answer "is this edge part of a cycle?" for all edges simultaneously.

## Brute Force Algorithm

```
function findBridges(V, edges):
    bridges = []
    
    for each edge (u, v) in edges:
        // Build adjacency list WITHOUT this edge
        adj = buildAdjacencyList(V, edges, skip=(u,v))
        
        // BFS from u — can we reach v?
        visited = BFS(adj, start=u)
        
        if v NOT in visited:
            bridges.add((u, v))    // It's a bridge!
    
    return bridges

function BFS(adj, start):
    visited = {start}
    queue = [start]
    while queue not empty:
        node = queue.dequeue()
        for neighbor in adj[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(neighbor)
    return visited
```

## Brute Force Code

```java
import java.util.*;

public class BridgeBruteForce {
    
    static boolean endpointsConnected(
            int V, List<int[]> edges,
            int skipU, int skipV) {
        // Build adjacency list WITHOUT (skipU, skipV)
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++)
            adj.add(new ArrayList<>());
        
        for (int[] e : edges) {
            if ((e[0] == skipU && e[1] == skipV) || 
                (e[0] == skipV && e[1] == skipU))
                continue;
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }
        
        // BFS from skipU — can we reach skipV?
        boolean[] visited = new boolean[V];
        Queue<Integer> queue = new LinkedList<>();
        queue.add(skipU);
        visited[skipU] = true;
        
        while (!queue.isEmpty()) {
            int node = queue.poll();
            if (node == skipV) return true;
            for (int nb : adj.get(node)) {
                if (!visited[nb]) {
                    visited[nb] = true;
                    queue.add(nb);
                }
            }
        }
        return false;
    }
    
    public static List<List<Integer>> criticalConnections(
            int n, List<List<Integer>> connections) {
        // Convert to int[] edges
        List<int[]> edges = new ArrayList<>();
        for (List<Integer> c : connections)
            edges.add(new int[]{c.get(0), c.get(1)});
        
        List<List<Integer>> bridges = new ArrayList<>();
        for (int[] edge : edges) {
            if (!endpointsConnected(n, edges,
                    edge[0], edge[1])) {
                bridges.add(
                    Arrays.asList(edge[0], edge[1]));
            }
        }
        return bridges;
    }
}
```

## Brute Force Complexity

Time: O(E × (V + E))
Space: O(V + E)

## Brute Force Hints

- What happens when you remove an edge that is part of a cycle? The graph stays connected.
- Don't check global connectivity (count == V). Check if the two endpoints of the removed edge can still reach each other.
- This rebuilds the adjacency list E times — that's the bottleneck Tarjan eliminates.
- Think about what information a single DFS could give you about ALL edges at once.

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7">
<style>
*{box-sizing:border-box;margin:0;padding:0}
.bf-wrap{max-width:680px}
.bf-tc{display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap}
.bf-tc button{padding:4px 10px;font-size:11px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:transparent;color:#a1a1aa;cursor:pointer;font-family:inherit}
.bf-tc button.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
.bf-ctrls{display:flex;gap:6px;align-items:center;margin-bottom:12px}
.bf-btn{padding:5px 14px;font-size:11px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.bf-btn:disabled{opacity:0.3;cursor:default}
.bf-lbl{flex:1;text-align:center;font-size:11px;color:#71717a}
.bf-row{display:flex;gap:12px;flex-wrap:wrap}
.bf-card{flex:1;min-width:250px;background:#141418;border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px}
.bf-ct{font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px}
.bf-log{font-family:'JetBrains Mono',monospace;font-size:10.5px;line-height:1.8;max-height:200px;overflow-y:auto}
.bf-log .bridge{color:#f87171;font-weight:600}
.bf-log .safe{color:#34d399}
.bf-log .removing{color:#fbbf24}
.bf-log .bfs{color:#4f8ff7}
.bf-bv{font-family:'JetBrains Mono',monospace;font-size:10.5px;padding:8px;background:#0e0e12;border-radius:6px;line-height:1.7;margin-top:6px}
</style>
<div class="bf-wrap">
<div class="bf-tc" id="bf-tc"></div>
<div class="bf-ctrls">
<button class="bf-btn" id="bf-prev" onclick="bfPrev()">Prev</button>
<button class="bf-btn" id="bf-next" onclick="bfNext()">Next</button>
<button class="bf-btn" id="bf-auto" onclick="bfTogAuto()">Auto play</button>
<span class="bf-lbl" id="bf-sl">Ready</span>
</div>
<div class="bf-row">
<div class="bf-card"><div class="bf-ct">Graph</div><svg id="bf-svg" width="100%" viewBox="0 0 360 240"></svg>
<div class="bf-bv" id="bf-bv">Click Next to begin</div></div>
<div class="bf-card"><div class="bf-ct">Algorithm log</div><div class="bf-log" id="bf-log"></div></div>
</div>
</div>
<script>
const BF_TCS=[
{name:"Ex 1: Triangle+tail",V:5,edges:[[0,1],[1,2],[2,0],[1,3],[3,4]],pos:[[50,60],[150,30],[150,130],[270,70],[350,140]],desc:"Cycle {0,1,2} + tail 1-3-4"},
{name:"Ex 2: Linear chain",V:4,edges:[[0,1],[1,2],[2,3]],pos:[[50,120],[140,60],[230,120],[320,60]],desc:"No cycles — all bridges"},
{name:"Ex 3: Full cycle",V:4,edges:[[0,1],[1,2],[2,3],[3,0]],pos:[[70,50],[270,50],[270,190],[70,190]],desc:"One cycle — no bridges"}
];
let bfCI=0,bfSteps=[],bfSI=-1,bfAI=null;
function bfInit(i){bfCI=i;bfStopA();document.querySelectorAll('#bf-tc button').forEach((b,j)=>{b.className=j===i?'active':''});bfBuild();bfSI=-1;bfRender()}
function bfBuild(){const tc=BF_TCS[bfCI];bfSteps=[];const br=[];
bfSteps.push({t:'start',msg:'Starting: '+tc.V+' nodes, '+tc.edges.length+' edges'});
for(let ei=0;ei<tc.edges.length;ei++){const e=tc.edges[ei];
bfSteps.push({t:'remove',ei,msg:'Remove edge '+e[0]+'—'+e[1]+'...'});
const adj=Array.from({length:tc.V},()=>[]);
for(let j=0;j<tc.edges.length;j++){if(j===ei)continue;adj[tc.edges[j][0]].push(tc.edges[j][1]);adj[tc.edges[j][1]].push(tc.edges[j][0])}
const vis=new Array(tc.V).fill(false),q=[e[0]];vis[e[0]]=true;const ord=[],be=[];let found=false;
while(q.length&&!found){const n=q.shift();ord.push(n);if(n===e[1]){found=true;break}
for(const nb of adj[n])if(!vis[nb]){vis[nb]=true;q.push(nb);be.push([n,nb])}}
bfSteps.push({t:'bfs',ei,ord,be,vis,found,src:e[0],tgt:e[1],msg:'BFS from '+e[0]+': '+ord.join('→')+(found?' ✓ reached '+e[1]:' ✗ cannot reach '+e[1])});
if(!found){br.push(e);bfSteps.push({t:'bridge',ei,msg:'BRIDGE: '+e[0]+'—'+e[1]})}
else bfSteps.push({t:'safe',ei,msg:'Safe: '+e[0]+'—'+e[1]+' (alternate path exists)'})}
bfSteps.push({t:'done',br,msg:'Done! '+br.length+' bridge(s): '+(br.length?br.map(b=>b[0]+'-'+b[1]).join(', '):'none')})}

function bfRender(){const tc=BF_TCS[bfCI],step=bfSI>=0?bfSteps[bfSI]:null;
document.getElementById('bf-prev').disabled=bfSI<=0;
document.getElementById('bf-next').disabled=bfSI>=bfSteps.length-1;
document.getElementById('bf-sl').textContent=bfSI<0?'Ready':'Step '+(bfSI+1)+'/'+bfSteps.length;
const dk=matchMedia('(prefers-color-scheme:dark)').matches||true;
const reI=step?step.ei:-1,isRem=step&&(step.t==='remove'||step.t==='bfs'),isBfs=step&&step.t==='bfs';
const bFound=[];for(let i=0;i<=bfSI&&i<bfSteps.length;i++)if(bfSteps[i].t==='bridge')bFound.push(tc.edges[bfSteps[i].ei]);
const bfsES=new Set();if(isBfs)for(const be of step.be)bfsES.add(be[0]+'-'+be[1]);
let s='';
for(let i=0;i<tc.edges.length;i++){const e=tc.edges[i],p1=tc.pos[e[0]],p2=tc.pos[e[1]];
let col='#3f3f46',sw=1.5,dash='';
const isB=bFound.some(b=>(b[0]===e[0]&&b[1]===e[1])||(b[0]===e[1]&&b[1]===e[0]));
if(isRem&&i===reI){col=step.t==='remove'?'#fbbf24':'transparent';sw=2;dash=step.t==='remove'?'6 4':''}
else if(isB){col='#f87171';sw=2.5}
else if(isBfs&&(bfsES.has(e[0]+'-'+e[1])||bfsES.has(e[1]+'-'+e[0]))){col='#4f8ff7';sw=2}
s+='<line x1="'+p1[0]+'" y1="'+p1[1]+'" x2="'+p2[0]+'" y2="'+p2[1]+'" stroke="'+col+'" stroke-width="'+sw+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
if(isRem&&i===reI&&step.t==='remove'){const mx=(p1[0]+p2[0])/2,my=(p1[1]+p2[1])/2;s+='<text x="'+(mx+6)+'" y="'+(my-4)+'" font-size="14" fill="#fbbf24" font-weight="600">✕</text>'}}
for(let i=0;i<tc.V;i++){const p=tc.pos[i];
let f='#1a1a20',sk='#3f3f46',tx='#a1a1aa';
if(isBfs){if(i===step.src){f='#0e2a1f';sk='#34d399';tx='#34d399'}
else if(i===step.tgt&&step.found){f='#0e2a1f';sk='#34d399';tx='#34d399'}
else if(i===step.tgt&&!step.found){f='#2a0e0e';sk='#f87171';tx='#f87171'}
else if(step.ord.includes(i)){f='#0e1a2e';sk='#4f8ff7';tx='#4f8ff7'}}
s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="16" fill="'+f+'" stroke="'+sk+'" stroke-width="1.5"/>';
s+='<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="'+tx+'" font-family="JetBrains Mono,monospace">'+i+'</text>'}
document.getElementById('bf-svg').innerHTML=s;
let lh='';for(let i=0;i<=bfSI&&i<bfSteps.length;i++){const st=bfSteps[i];let cls='';
if(st.t==='bridge')cls='bridge';else if(st.t==='safe')cls='safe';else if(st.t==='remove')cls='removing';else if(st.t==='bfs')cls='bfs';
lh+='<div class="'+cls+'">'+st.msg+'</div>'}
document.getElementById('bf-log').innerHTML=lh;
document.getElementById('bf-log').scrollTop=99999;
if(isBfs){let h='<b>BFS: '+step.src+' → target '+step.tgt+'</b><br>Path: '+step.ord.join(' → ')+'<br>';
h+=step.found?'<span style="color:#34d399">✓ Reachable — safe</span>':'<span style="color:#f87171">✗ Unreachable — BRIDGE</span>';
document.getElementById('bf-bv').innerHTML=h}
else if(step&&step.t==='done'){document.getElementById('bf-bv').innerHTML='<b>Result:</b> '+step.msg}
else{document.getElementById('bf-bv').innerHTML=step?step.msg:'Click Next to begin'}}

function bfNext(){if(bfSI<bfSteps.length-1){bfSI++;bfRender()}}
function bfPrev(){if(bfSI>0){bfSI--;bfRender()}}
function bfTogAuto(){if(bfAI){bfStopA();return}document.getElementById('bf-auto').textContent='Pause';bfAI=setInterval(()=>{if(bfSI>=bfSteps.length-1){bfStopA();return}bfNext()},900)}
function bfStopA(){clearInterval(bfAI);bfAI=null;document.getElementById('bf-auto').textContent='Auto play'}
const bfBar=document.getElementById('bf-tc');
BF_TCS.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'active':'';b.onclick=()=>bfInit(i);bfBar.appendChild(b)});
bfBuild();bfRender();
</script>
</div>

## Optimal Intuition

DFS creates a **tree** from the graph. Every edge becomes either:
- **Tree edge**: DFS travels through it to discover new nodes
- **Back edge**: connects to an already-visited ancestor (creates a cycle)

Back edges are "safety nets" — they protect tree edges from being bridges. We track two values per node:
- `disc[u]` — discovery timestamp
- `low[u]` — earliest ancestor reachable from u's subtree via back edges

**Bridge condition**: tree edge (u→v) is a bridge if `low[v] > disc[u]` — meaning v's subtree has NO back edge reaching above u.

## Optimal In-depth Intuition

Let's build the understanding step by step:

**Step 1 — DFS Tree property:** When you run DFS on an undirected graph, every non-tree edge connects a descendant to an ancestor (a "back edge"). This is unique to DFS — BFS doesn't give you this property. This means every cycle in the graph has exactly one back edge and a path of tree edges.

**Step 2 — disc[] array:** We number nodes in the order DFS first visits them. Node visited first gets disc=0, next gets disc=1, etc. Earlier nodes are "higher" in the tree.

**Step 3 — low[] array:** This is the key innovation. `low[u]` answers: "What is the earliest (lowest disc value) ancestor that u's entire subtree can reach through back edges?" It starts as disc[u] (worst case: can only reach itself) and gets updated:
- When DFS finds back edge u→v: `low[u] = min(low[u], disc[v])` — u can reach ancestor v
- When DFS returns from child v: `low[u] = min(low[u], low[v])` — anything v's subtree can reach, u can reach too

**Step 4 — The bridge test:** For tree edge u→v (u is parent, v is child):
- If `low[v] <= disc[u]`: v's subtree has a back edge reaching u or above — there's an alternate path — NOT a bridge
- If `low[v] > disc[u]`: v's subtree is completely isolated below u — removing u-v disconnects v's subtree — BRIDGE!

**Why this works in one pass:** The low[] values propagate cycle information upward through the DFS tree. A single back edge from deep in the tree to a high ancestor "protects" every tree edge along that path.

## Optimal Algorithm

```
timer = 0

function dfs(u, parent):
    disc[u] = low[u] = timer++
    visited[u] = true
    
    for each neighbor v of u:
        if v is not visited:
            // Tree edge: go deeper
            dfs(v, u)
            // Propagate: child's reach becomes parent's reach
            low[u] = min(low[u], low[v])
            // Bridge test
            if low[v] > disc[u]:
                output (u, v) as bridge
        
        else if v != parent:
            // Back edge: update low to reach ancestor
            low[u] = min(low[u], disc[v])

function findBridges(V, edges):
    build adjacency list
    for each unvisited node i:
        dfs(i, -1)    // handles multiple components
```

## Optimal Code

```java
import java.util.*;

public class Solution {
    static int timer = 0;
    
    public List<List<Integer>> criticalConnections(
            int n, List<List<Integer>> connections) {
        // Build adjacency list
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++)
            adj.add(new ArrayList<>());
        for (List<Integer> conn : connections) {
            adj.get(conn.get(0)).add(conn.get(1));
            adj.get(conn.get(1)).add(conn.get(0));
        }
        
        int[] disc = new int[n];
        int[] low = new int[n];
        boolean[] visited = new boolean[n];
        List<List<Integer>> bridges = new ArrayList<>();
        timer = 0;
        
        // Handle multiple components
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                dfs(i, -1, adj, disc, low,
                    visited, bridges);
            }
        }
        return bridges;
    }
    
    void dfs(int u, int parent,
             List<List<Integer>> adj,
             int[] disc, int[] low,
             boolean[] visited,
             List<List<Integer>> bridges) {
        visited[u] = true;
        disc[u] = low[u] = timer++;
        
        for (int v : adj.get(u)) {
            if (!visited[v]) {
                // Tree edge
                dfs(v, u, adj, disc, low,
                    visited, bridges);
                
                // Propagate low value up
                low[u] = Math.min(low[u], low[v]);
                
                // Bridge condition
                if (low[v] > disc[u]) {
                    bridges.add(
                        Arrays.asList(u, v));
                }
            } else if (v != parent) {
                // Back edge — update low
                low[u] = Math.min(
                    low[u], disc[v]);
            }
        }
    }
}
```

## Optimal Complexity

Time: O(V + E)
Space: O(V + E)

## Optimal Hints

- DFS naturally classifies every edge as either a tree edge or a back edge — this is the foundation.
- Back edges create cycles. A cycle through a back edge protects every tree edge along its path.
- low[u] is the "best reach" of u's entire subtree — the earliest ancestor reachable through any back edge below u.
- The bridge condition is just one comparison: low[v] > disc[u]. That's it.
- Handle multiple components with a loop: for each unvisited node, start a fresh DFS.
- Be careful with the parent check: `v != parent` prevents counting the edge you came from as a back edge.

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7">
<style>
.tj-wrap{max-width:700px}
.tj-tc{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}
.tj-tc button{padding:4px 10px;font-size:11px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:transparent;color:#a1a1aa;cursor:pointer;font-family:inherit}
.tj-tc button.act{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
.tj-ctrls{display:flex;gap:5px;align-items:center;margin-bottom:10px}
.tj-btn{padding:4px 12px;font-size:11px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.tj-btn:disabled{opacity:0.3}
.tj-lbl{flex:1;text-align:center;font-size:11px;color:#71717a}
.tj-row{display:flex;gap:10px;flex-wrap:wrap}
.tj-col{flex:1;min-width:240px}
.tj-card{background:#141418;border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px;margin-bottom:8px}
.tj-ct{font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px}
.tj-tbl{width:100%;font-family:'JetBrains Mono',monospace;font-size:10.5px;border-collapse:collapse}
.tj-tbl th{text-align:left;padding:2px 6px;font-weight:500;color:#52525b;border-bottom:1px solid rgba(255,255,255,0.05);font-size:9px}
.tj-tbl td{padding:2px 6px;border-bottom:1px solid rgba(255,255,255,0.03)}
.tj-tbl .hl{background:rgba(79,143,247,0.1);color:#93c5fd}
.tj-tbl .up{background:rgba(251,191,36,0.1);color:#fbbf24}
.tj-log{font-family:'JetBrains Mono',monospace;font-size:10px;line-height:1.8;max-height:220px;overflow-y:auto}
.tj-log .v{color:#4f8ff7}
.tj-log .te{color:#34d399}
.tj-log .be{color:#fbbf24}
.tj-log .br{color:#f87171;font-weight:600}
.tj-log .sf{color:#34d399}
.tj-log .lo{color:#fbbf24}
.tj-ins{padding:8px 10px;border-radius:8px;font-size:11.5px;line-height:1.6;background:#0e0e12;margin-top:8px}
.tj-leg{display:flex;gap:10px;font-size:10px;color:#71717a;margin-bottom:8px;flex-wrap:wrap}
.tj-leg span{display:flex;align-items:center;gap:4px}
.tj-leg i{width:14px;height:3px;border-radius:1px;display:inline-block}
</style>
<div class="tj-wrap">
<div class="tj-tc" id="tj-tc"></div>
<div class="tj-leg">
<span><i style="background:#4f8ff7"></i>Tree edge</span>
<span><i style="background:#fbbf24;border:1px dashed #fbbf24;background:transparent"></i>Back edge</span>
<span><i style="background:#f87171;height:4px"></i>Bridge</span>
</div>
<div class="tj-ctrls">
<button class="tj-btn" id="tj-prev" onclick="tjPrev()">Prev</button>
<button class="tj-btn" id="tj-next" onclick="tjNext()">Next</button>
<button class="tj-btn" id="tj-auto" onclick="tjTogA()">Auto play</button>
<span class="tj-lbl" id="tj-sl">Ready</span>
</div>
<div class="tj-row">
<div class="tj-col">
<div class="tj-card"><div class="tj-ct" id="tj-desc"></div><svg id="tj-svg" width="100%" viewBox="0 0 380 240"></svg></div>
<div class="tj-card"><div class="tj-ct">disc[] and low[]</div><table class="tj-tbl" id="tj-tbl"></table></div>
</div>
<div class="tj-col">
<div class="tj-card"><div class="tj-ct">Algorithm log</div><div class="tj-log" id="tj-log"></div></div>
<div class="tj-ins" id="tj-ins">Click Next to step through Tarjan's algorithm.</div>
</div>
</div>
</div>
<script>
const TJ_TCS=[
{name:"Triangle+tail",V:5,edges:[[0,1],[1,2],[2,0],[1,3],[3,4]],pos:[[50,70],[160,30],[160,150],[280,70],[370,150]],desc:"Cycle {0,1,2}, tail 1→3→4"},
{name:"Two triangles bridged",V:6,edges:[[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3]],pos:[[40,70],[140,30],[140,150],[260,70],[360,30],[360,150]],desc:"Bridge 1-3 connects two cycles"},
{name:"Linear chain",V:5,edges:[[0,1],[1,2],[2,3],[3,4]],pos:[[30,120],[110,60],[200,120],[290,60],[370,120]],desc:"No cycles — all bridges"},
{name:"Full cycle",V:5,edges:[[0,1],[1,2],[2,3],[3,4],[4,0]],pos:[[190,20],[340,90],[290,230],[90,230],[40,90]],desc:"All edges protected"},
{name:"Complex graph",V:7,edges:[[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,6],[6,4]],pos:[[30,70],[140,20],[140,140],[260,70],[370,20],[370,140],[260,170]],desc:"Two cycles + bridge chain"}
];
let tjCI=0,tjSteps=[],tjSI=-1,tjAI=null;
function tjInit(i){tjCI=i;tjStopA();document.querySelectorAll('#tj-tc button').forEach((b,j)=>{b.className=j===i?'act':''});tjBuild();tjSI=-1;tjRender()}
function tjBuild(){const tc=TJ_TCS[tjCI];tjSteps=[];
const adj=Array.from({length:tc.V},()=>[]);
for(const e of tc.edges){adj[e[0]].push(e[1]);adj[e[1]].push(e[0])}
const disc=new Array(tc.V).fill(-1),low=new Array(tc.V).fill(-1),par=new Array(tc.V).fill(-1);
const treeE=new Set(),backE=new Set(),bridges=new Set();let timer=0;
function snap(t,msg,hl,up){tjSteps.push({t,msg,disc:[...disc],low:[...low],treeE:new Set(treeE),backE:new Set(backE),bridges:new Set(bridges),hl:hl!==undefined?hl:-1,up:up!==undefined?up:-1})}
function dfs(u,p){disc[u]=low[u]=timer++;
snap('visit','Visit '+u+': disc='+disc[u]+', low='+low[u],u);
for(const v of adj[u]){if(disc[v]===-1){par[v]=u;treeE.add(u+','+v);
snap('tree','Tree edge '+u+'→'+v,v);dfs(v,u);
const old=low[u];low[u]=Math.min(low[u],low[v]);
if(old!==low[u])snap('low','low['+u+'] = min('+old+', low['+v+']='+low[v]+') = '+low[u],u,u);
if(low[v]>disc[u]){bridges.add(u+','+v);snap('bridge','BRIDGE! low['+v+']='+low[v]+' > disc['+u+']='+disc[u],u)}
else snap('safe','Safe: low['+v+']='+low[v]+' ≤ disc['+u+']='+disc[u],u)}
else if(v!==p){backE.add(u+','+v);const old=low[u];low[u]=Math.min(low[u],disc[v]);
snap('back','Back edge '+u+'→'+v+': low['+u+']=min('+old+','+disc[v]+')='+low[u],u,u)}}}
snap('start','Starting Tarjan\'s from node 0');dfs(0,-1);
snap('done','Complete! '+bridges.size+' bridge(s) found.')}
function tjRender(){const tc=TJ_TCS[tjCI],step=tjSI>=0?tjSteps[tjSI]:null;
const d=step?step.disc:new Array(tc.V).fill(-1),l=step?step.low:new Array(tc.V).fill(-1);
const tE=step?step.treeE:new Set(),bE=step?step.backE:new Set(),br=step?step.bridges:new Set();
const hl=step?step.hl:-1,up=step?step.up:-1;
document.getElementById('tj-prev').disabled=tjSI<=0;
document.getElementById('tj-next').disabled=tjSI>=tjSteps.length-1;
document.getElementById('tj-sl').textContent=tjSI<0?'Ready':'Step '+(tjSI+1)+'/'+tjSteps.length;
document.getElementById('tj-desc').textContent=tc.desc;
let svg='';
for(const e of tc.edges){const p1=tc.pos[e[0]],p2=tc.pos[e[1]];
const ek1=e[0]+','+e[1],ek2=e[1]+','+e[0];
let col='#2a2a33',sw=1.5,dash='';
if(br.has(ek1)||br.has(ek2)){col='#f87171';sw=3}
else if(tE.has(ek1)||tE.has(ek2)){col='#4f8ff7';sw=2}
else if(bE.has(ek1)||bE.has(ek2)){col='#fbbf24';sw=1.5;dash='5 3'}
svg+='<line x1="'+p1[0]+'" y1="'+p1[1]+'" x2="'+p2[0]+'" y2="'+p2[1]+'" stroke="'+col+'" stroke-width="'+sw+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
if(br.has(ek1)||br.has(ek2)){const cx=(p1[0]+p2[0])/2,cy=(p1[1]+p2[1])/2;
svg+='<text x="'+cx+'" y="'+(cy-8)+'" text-anchor="middle" font-size="9" font-weight="600" fill="#f87171" font-family="JetBrains Mono,monospace">BRIDGE</text>'}}
for(let i=0;i<tc.V;i++){const p=tc.pos[i];let f='#1a1a20',sk='#3f3f46',tx='#a1a1aa';
if(i===hl&&step&&step.t==='visit'){f='#0e2a1f';sk='#34d399';tx='#34d399'}
else if(i===up){f='#2a1f0e';sk='#fbbf24';tx='#fbbf24'}
else if(d[i]>=0){f='#0e1a2e';sk='#4f8ff7';tx='#4f8ff7'}
svg+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="18" fill="'+f+'" stroke="'+sk+'" stroke-width="1.5"/>';
svg+='<text x="'+p[0]+'" y="'+(p[1]-3)+'" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="'+tx+'" font-family="JetBrains Mono,monospace">'+i+'</text>';
if(d[i]>=0)svg+='<text x="'+p[0]+'" y="'+(p[1]+9)+'" text-anchor="middle" font-size="8" fill="'+tx+'" font-family="JetBrains Mono,monospace" opacity="0.7">'+d[i]+'/'+l[i]+'</text>'}
document.getElementById('tj-svg').innerHTML=svg;
let th='<tr><th>Node</th>';for(let i=0;i<tc.V;i++)th+='<th>'+i+'</th>';
th+='</tr><tr><td style="font-weight:500;color:#52525b">disc</td>';
for(let i=0;i<tc.V;i++){let c='';if(i===hl)c=' class="hl"';th+='<td'+c+'>'+(d[i]>=0?d[i]:'—')+'</td>'}
th+='</tr><tr><td style="font-weight:500;color:#52525b">low</td>';
for(let i=0;i<tc.V;i++){let c='';if(i===up)c=' class="up"';else if(i===hl)c=' class="hl"';th+='<td'+c+'>'+(l[i]>=0?l[i]:'—')+'</td>'}
th+='</tr>';document.getElementById('tj-tbl').innerHTML=th;
let lh='';for(let i=0;i<=tjSI&&i<tjSteps.length;i++){const s=tjSteps[i];let cls='';
if(s.t==='visit')cls='v';else if(s.t==='tree')cls='te';else if(s.t==='back')cls='be';
else if(s.t==='bridge')cls='br';else if(s.t==='safe')cls='sf';else if(s.t==='low')cls='lo';
lh+='<div class="'+cls+'">'+s.msg+'</div>'}
document.getElementById('tj-log').innerHTML=lh;
document.getElementById('tj-log').scrollTop=99999;
let ins='';
if(!step)ins='Click Next to begin. Each node shows disc/low inside.';
else if(step.t==='visit')ins='<b>Visiting node '+step.hl+'.</b> Gets disc='+d[step.hl]+', low starts at disc value.';
else if(step.t==='tree')ins='<b>Tree edge found.</b> DFS goes deeper.';
else if(step.t==='back')ins='<b>Back edge!</b> A cycle exists. low updates to reach ancestor.';
else if(step.t==='low')ins='<b>Backtracking.</b> Parent inherits best low from child.';
else if(step.t==='bridge')ins='<b style="color:#f87171">Bridge detected!</b> low[child] > disc[parent] — subtree has no back edge above.';
else if(step.t==='safe')ins='<b style="color:#34d399">Safe.</b> low[child] ≤ disc[parent] — back edge provides alternate path.';
else if(step.t==='done')ins='<b>Done!</b> '+step.bridges.size+' bridge(s) in single O(V+E) pass.';
else ins='Starting...';
document.getElementById('tj-ins').innerHTML=ins}
function tjNext(){if(tjSI<tjSteps.length-1){tjSI++;tjRender()}}
function tjPrev(){if(tjSI>0){tjSI--;tjRender()}}
function tjTogA(){if(tjAI){tjStopA();return}document.getElementById('tj-auto').textContent='Pause';tjAI=setInterval(()=>{if(tjSI>=tjSteps.length-1){tjStopA();return}tjNext()},800)}
function tjStopA(){clearInterval(tjAI);tjAI=null;document.getElementById('tj-auto').textContent='Auto play'}
const tjBar=document.getElementById('tj-tc');
TJ_TCS.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'act':'';b.onclick=()=>tjInit(i);tjBar.appendChild(b)});
tjBuild();tjRender();
</script>
</div>
