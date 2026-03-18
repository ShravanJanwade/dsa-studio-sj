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

## Brute Force Step-by-Step Solution

Let's trace through Example 1: n=4, edges = [[0,1],[1,2],[2,0],[1,3]] step by step.

**Step 1: Set up.** We have 4 edges to test. For each one, we'll remove it, then BFS from one endpoint to see if we can reach the other.

**Step 2: Test edge 0-1.**
- Remove 0-1 from the graph. Remaining: [1,2], [2,0], [1,3]
- BFS from node 0: start at 0 → visit 2 (via 2-0) → visit 1 (via 1-2) → we reached node 1!
- Node 1 is reachable from node 0 even without edge 0-1. Why? Because the path 0→2→1 exists (the cycle provides an alternate route).
- **Result: NOT a bridge.**

**Step 3: Test edge 1-2.**
- Remove 1-2. Remaining: [0,1], [2,0], [1,3]
- BFS from node 1: start at 1 → visit 0 (via 0-1) → visit 2 (via 2-0) → we reached node 2!
- Same reason — the cycle 0-1-2 means removing any single edge from it still leaves a path.
- **Result: NOT a bridge.**

**Step 4: Test edge 2-0.**
- Remove 2-0. Remaining: [0,1], [1,2], [1,3]
- BFS from node 2: start at 2 → visit 1 (via 1-2) → visit 0 (via 0-1) → we reached node 0!
- Again, the cycle protects this edge.
- **Result: NOT a bridge.**

**Step 5: Test edge 1-3.**
- Remove 1-3. Remaining: [0,1], [1,2], [2,0]
- BFS from node 1: start at 1 → visit 0 (via 0-1) → visit 2 (via 2-0 or 1-2) → DONE. We visited {0, 1, 2} but never reached node 3!
- Node 3 is isolated. There is no other path from 1 to 3.
- **Result: BRIDGE!**

**Step 6: Return answer.** Only edge [1,3] is a bridge. Output: [[1,3]].

**Why the cycle edges survived:** Edges 0-1, 1-2, and 2-0 form a triangle. In a cycle of length k, each edge has k-1 alternate paths. Removing one edge still leaves a path of length k-1 through the other side.

**Why 1-3 failed:** Node 3 has only one connection to the rest of the graph (through node 1). It's a "pendant" vertex — a leaf in the graph structure. Any edge connecting a leaf to the graph is always a bridge.

**Common mistake:** Using `count == V` instead of checking endpoint reachability. If the graph had two separate components {0,1,2} and {3,4}, BFS from 0 would visit 3 nodes even for safe edges, and you'd wrongly report everything as a bridge.

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

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
*{box-sizing:border-box;margin:0;padding:0}
.bf-w{width:100%}
.bf-tc{display:flex;gap:5px;margin-bottom:12px;flex-wrap:wrap}
.bf-tc button{padding:5px 14px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:transparent;color:#a1a1aa;cursor:pointer;font-family:inherit;transition:all .15s}
.bf-tc button:hover{border-color:rgba(255,255,255,0.2)}
.bf-tc button.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
.bf-ctrls{display:flex;gap:8px;align-items:center;margin-bottom:14px}
.bf-btn{padding:7px 18px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit;transition:all .15s}
.bf-btn:hover{background:#222229;border-color:rgba(255,255,255,0.15)}
.bf-btn:disabled{opacity:0.3;cursor:default}
.bf-lbl{flex:1;text-align:center;font-size:12px;color:#71717a}
.bf-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:700px){.bf-grid{grid-template-columns:1fr}}
.bf-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px}
.bf-ct{font-size:11px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.bf-ct i{width:8px;height:8px;border-radius:50%;display:inline-block}
.bf-log{font-family:'JetBrains Mono',monospace;font-size:12px;line-height:2;max-height:280px;overflow-y:auto}
.bf-log .bridge{color:#f87171;font-weight:600}
.bf-log .safe{color:#34d399}
.bf-log .removing{color:#fbbf24}
.bf-log .bfs{color:#4f8ff7}
.bf-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px 14px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;line-height:1.8;margin-top:10px}
.bf-code{font-family:'JetBrains Mono',monospace;font-size:11px;padding:12px 14px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;line-height:2;margin-top:10px}
.bf-code .hl{background:rgba(79,143,247,0.15);border-radius:3px;padding:1px 4px;color:#93c5fd}
.bf-code .dim{color:#3f3f46}
.bf-ins{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:12px}
</style>
<div class="bf-w">
<div class="bf-tc" id="bf-tc"></div>
<div class="bf-ctrls">
<button class="bf-btn" id="bf-prev" onclick="bfPrev()">← Prev</button>
<button class="bf-btn" id="bf-next" onclick="bfNext()">Next →</button>
<button class="bf-btn" id="bf-auto" onclick="bfTogAuto()">▶ Auto play</button>
<span class="bf-lbl" id="bf-sl">Ready</span>
</div>
<div class="bf-grid">
<div>
<div class="bf-card">
<div class="bf-ct"><i style="background:#4f8ff7"></i> Graph visualization</div>
<svg id="bf-svg" width="100%" viewBox="0 0 420 280"></svg>
<div class="bf-state" id="bf-state">edges[] = [[0,1],[1,2],[2,0],[1,3]]<br>bridges = []</div>
</div>
<div class="bf-code" id="bf-code">
<span class="dim">for each edge (u, v) in edges:</span><br>
<span class="dim">    remove edge (u, v)</span><br>
<span class="dim">    BFS from u → check if v reachable</span><br>
<span class="dim">    if not reachable → BRIDGE</span>
</div>
</div>
<div>
<div class="bf-card">
<div class="bf-ct"><i style="background:#34d399"></i> Algorithm log</div>
<div class="bf-log" id="bf-log"></div>
</div>
<div class="bf-ins" id="bf-ins">Click <b>Next</b> to begin the brute force dry run. For each edge, we remove it and BFS to check if the endpoints are still connected.</div>
</div>
</div>
</div>
<script>
const BF_TCS=[
{name:"Example 1: Triangle + tail",V:5,edges:[[0,1],[1,2],[2,0],[1,3],[3,4]],pos:[[60,80],[180,40],[180,170],[320,90],[400,180]],desc:"Cycle {0,1,2} + tail 1→3→4"},
{name:"Example 2: Linear chain",V:4,edges:[[0,1],[1,2],[2,3]],pos:[[60,140],[160,70],[280,140],[380,70]],desc:"No cycles at all — every edge is a bridge"},
{name:"Example 3: Full cycle",V:4,edges:[[0,1],[1,2],[2,3],[3,0]],pos:[[80,60],[320,60],[320,220],[80,220]],desc:"Complete cycle — no bridges exist"},
{name:"Example 4: Two triangles",V:6,edges:[[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3]],pos:[[50,80],[150,30],[150,160],[280,90],[380,30],[380,160]],desc:"Two cycles joined by bridge 1-3"}
];
let bfCI=0,bfSteps=[],bfSI=-1,bfAI=null;
function bfInit(i){bfCI=i;bfStopA();document.querySelectorAll('#bf-tc button').forEach((b,j)=>{b.className=j===i?'active':''});bfBuild();bfSI=-1;bfRender()}
function bfBuild(){const tc=BF_TCS[bfCI];bfSteps=[];
bfSteps.push({t:'start',msg:'Starting brute force: '+tc.V+' nodes, '+tc.edges.length+' edges to test',ei:-1,code:0});
for(let ei=0;ei<tc.edges.length;ei++){const e=tc.edges[ei];
bfSteps.push({t:'remove',ei,msg:'Remove edge '+e[0]+' — '+e[1]+', then BFS from '+e[0]+' to find '+e[1],code:1});
const adj=Array.from({length:tc.V},()=>[]);
for(let j=0;j<tc.edges.length;j++){if(j===ei)continue;adj[tc.edges[j][0]].push(tc.edges[j][1]);adj[tc.edges[j][1]].push(tc.edges[j][0])}
const vis=new Array(tc.V).fill(false),q=[e[0]];vis[e[0]]=true;const ord=[],be=[];let found=false;
while(q.length&&!found){const n=q.shift();ord.push(n);if(n===e[1]){found=true;break}for(const nb of adj[n])if(!vis[nb]){vis[nb]=true;q.push(nb);be.push([n,nb])}}
bfSteps.push({t:'bfs',ei,ord,be,vis,found,src:e[0],tgt:e[1],msg:'BFS from '+e[0]+': visited '+ord.join(' → ')+(found?' → reached '+e[1]+' ✓':' → cannot reach '+e[1]+' ✗'),code:2});
if(!found){bfSteps.push({t:'bridge',ei,msg:'BRIDGE FOUND: edge '+e[0]+' — '+e[1]+' disconnects the graph!',code:3})}
else{bfSteps.push({t:'safe',ei,msg:'Edge '+e[0]+' — '+e[1]+' is safe — alternate path exists',code:3})}}
bfSteps.push({t:'done',ei:-1,msg:'Complete! Found bridges.',code:4})}
function bfRender(){const tc=BF_TCS[bfCI],step=bfSI>=0?bfSteps[bfSI]:null;
document.getElementById('bf-prev').disabled=bfSI<=0;document.getElementById('bf-next').disabled=bfSI>=bfSteps.length-1;
document.getElementById('bf-sl').textContent=bfSI<0?'Ready — '+tc.desc:'Step '+(bfSI+1)+' / '+bfSteps.length;
const reI=step?step.ei:-1,isRem=step&&(step.t==='remove'||step.t==='bfs'),isBfs=step&&step.t==='bfs';
const bFound=[];for(let i=0;i<=bfSI&&i<bfSteps.length;i++)if(bfSteps[i].t==='bridge')bFound.push(tc.edges[bfSteps[i].ei]);
const bfsES=new Set();if(isBfs)for(const be of step.be)bfsES.add(be[0]+'-'+be[1]);
const mx=Math.max(...tc.pos.map(p=>p[0]))+40,my=Math.max(...tc.pos.map(p=>p[1]))+40;
document.getElementById('bf-svg').setAttribute('viewBox','0 0 '+Math.max(420,mx)+' '+Math.max(260,my));
let s='';
for(let i=0;i<tc.edges.length;i++){const e=tc.edges[i],p1=tc.pos[e[0]],p2=tc.pos[e[1]];
let col='#2a2a33',sw=2,dash='';
const isB=bFound.some(b=>(b[0]===e[0]&&b[1]===e[1])||(b[0]===e[1]&&b[1]===e[0]));
if(isRem&&i===reI){col=step.t==='remove'?'#fbbf24':'transparent';sw=2.5;dash=step.t==='remove'?'8 5':''}
else if(isB){col='#f87171';sw=3}
else if(isBfs&&(bfsES.has(e[0]+'-'+e[1])||bfsES.has(e[1]+'-'+e[0]))){col='#4f8ff7';sw=2.5}
s+='<line x1="'+p1[0]+'" y1="'+p1[1]+'" x2="'+p2[0]+'" y2="'+p2[1]+'" stroke="'+col+'" stroke-width="'+sw+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' stroke-linecap="round"/>';
if(isRem&&i===reI&&step.t==='remove'){const cx=(p1[0]+p2[0])/2,cy=(p1[1]+p2[1])/2;
s+='<text x="'+(cx+8)+'" y="'+(cy-6)+'" font-size="16" fill="#fbbf24" font-weight="700">✕</text>'}
if(isB){const cx=(p1[0]+p2[0])/2,cy=(p1[1]+p2[1])/2;
s+='<text x="'+cx+'" y="'+(cy-10)+'" text-anchor="middle" font-size="10" fill="#f87171" font-weight="600" font-family="JetBrains Mono,monospace">BRIDGE</text>'}}
for(let i=0;i<tc.V;i++){const p=tc.pos[i];let f='#1a1a20',sk='#3f3f46',tx='#a1a1aa',r=20;
if(isBfs){if(i===step.src){f='#0e2a1f';sk='#34d399';tx='#34d399';r=22}
else if(i===step.tgt&&step.found){f='#0e2a1f';sk='#34d399';tx='#34d399';r=22}
else if(i===step.tgt&&!step.found){f='#2a0e0e';sk='#f87171';tx='#f87171';r=22}
else if(step.ord.includes(i)){f='#0e1a2e';sk='#4f8ff7';tx='#4f8ff7'}}
s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+r+'" fill="'+f+'" stroke="'+sk+'" stroke-width="2"/>';
s+='<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="700" fill="'+tx+'" font-family="JetBrains Mono,monospace">'+i+'</text>'}
document.getElementById('bf-svg').innerHTML=s;
let lh='';for(let i=0;i<=bfSI&&i<bfSteps.length;i++){const st=bfSteps[i];let cls='';
if(st.t==='bridge')cls='bridge';else if(st.t==='safe')cls='safe';else if(st.t==='remove')cls='removing';else if(st.t==='bfs')cls='bfs';
lh+='<div class="'+cls+'">'+(i===bfSI?'▶ ':'')+st.msg+'</div>'}
document.getElementById('bf-log').innerHTML=lh;document.getElementById('bf-log').scrollTop=99999;
const codeLines=['<span class="dim">for each edge (u, v) in edges:</span>','<span class="dim">    remove edge (u, v)</span>','<span class="dim">    BFS from u → check v reachable</span>','<span class="dim">    if not reachable → BRIDGE</span>','<span class="dim">return bridges</span>'];
const ci=step?step.code:null;if(ci!==null&&ci<codeLines.length)codeLines[ci]=codeLines[ci].replace('class="dim"','class="hl"');
document.getElementById('bf-code').innerHTML=codeLines.join('<br>');
const br=bFound.map(b=>b[0]+'-'+b[1]);
let stateHtml='edges = ['+tc.edges.map(e=>e[0]+'-'+e[1]).join(', ')+']<br>';
stateHtml+='bridges found = ['+br.join(', ')+(br.length?'':' ')+']';
if(isBfs){stateHtml+='<br><span style="color:#4f8ff7">BFS queue: ['+step.ord.join(', ')+']</span>';
stateHtml+='<br>visited = {'+step.ord.join(', ')+'}';
stateHtml+='<br>target '+step.tgt+' '+(step.found?'<span style="color:#34d399">FOUND</span>':'<span style="color:#f87171">NOT FOUND</span>')}
document.getElementById('bf-state').innerHTML=stateHtml;
let ins='';if(!step)ins='Click <b>Next</b> to begin. We will remove each edge one by one and BFS to check if it disconnects the graph.';
else if(step.t==='remove'){const e=tc.edges[step.ei];ins='<b style="color:#fbbf24">Removing edge '+e[0]+' — '+e[1]+'</b>. Now we\'ll BFS from node '+e[0]+' to see if node '+e[1]+' is still reachable without this edge.'}
else if(step.t==='bfs')ins=step.found?'<b style="color:#34d399">BFS reached target!</b> The path <span style="color:#4f8ff7">'+step.ord.join(' → ')+'</span> exists without the removed edge. This edge is safe — the cycle provides an alternate route.':'<b style="color:#f87171">BFS could NOT reach target!</b> After visiting nodes {'+step.ord.join(', ')+'}, node '+step.tgt+' was never found. Removing this edge disconnects it.';
else if(step.t==='bridge')ins='<b style="color:#f87171">Bridge confirmed!</b> Edge '+tc.edges[step.ei][0]+' — '+tc.edges[step.ei][1]+' is critical. Without it, part of the graph is unreachable.';
else if(step.t==='safe')ins='<b style="color:#34d399">Edge is safe.</b> The cycle provides redundancy. We put the edge back and move to the next one.';
else if(step.t==='done')ins='<b>Algorithm complete!</b> Found '+bFound.length+' bridge(s): '+(bFound.length?bFound.map(b=>'<span style="color:#f87171">'+b[0]+'-'+b[1]+'</span>').join(', '):'none')+'. Total BFS runs: '+tc.edges.length+' (one per edge).';
else ins=step.msg;
document.getElementById('bf-ins').innerHTML=ins}
function bfNext(){if(bfSI<bfSteps.length-1){bfSI++;bfRender()}}
function bfPrev(){if(bfSI>0){bfSI--;bfRender()}}
function bfTogAuto(){if(bfAI){bfStopA();return}document.getElementById('bf-auto').textContent='⏸ Pause';bfAI=setInterval(()=>{if(bfSI>=bfSteps.length-1){bfStopA();return}bfNext()},1100)}
function bfStopA(){clearInterval(bfAI);bfAI=null;document.getElementById('bf-auto').textContent='▶ Auto play'}
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

## Optimal Step-by-Step Solution

Let's trace Tarjan's algorithm on Example 1: n=5, edges=[[0,1],[1,2],[2,0],[1,3],[3,4]].

**Step 1: Initialize.** Create disc[] and low[] arrays of size 5, all set to -1. Set timer=0.

**Step 2: DFS from node 0.** Visit node 0, set disc[0]=0, low[0]=0, timer becomes 1.

**Step 3: Explore neighbor 1.** Node 1 is unvisited → tree edge 0→1. Visit node 1, disc[1]=1, low[1]=1.

**Step 4: From node 1, explore neighbor 2.** Node 2 is unvisited → tree edge 1→2. Visit node 2, disc[2]=2, low[2]=2.

**Step 5: From node 2, explore neighbor 0.** Node 0 IS visited and is NOT the parent of 2 (parent is 1). This is a **back edge**! Update: low[2] = min(low[2], disc[0]) = min(2, 0) = **0**. This means node 2's subtree can reach all the way back to node 0 through this back edge.

**Step 6: DFS backtracks from 2 to 1.** Propagate: low[1] = min(low[1], low[2]) = min(1, 0) = **0**. Now node 1 also knows its subtree can reach node 0.

**Step 7: Bridge check for edge 1→2.** Is low[2] > disc[1]? Is 0 > 1? **NO.** So edge 1-2 is NOT a bridge. The back edge 2→0 provides an alternate path.

**Step 8: Bridge check for edge 0→1 (when we backtrack to 0).** Is low[1] > disc[0]? Is 0 > 0? **NO.** Edge 0-1 is NOT a bridge either. Same cycle protects it.

**Step 9: From node 1, explore neighbor 3.** Node 3 is unvisited → tree edge 1→3. Visit node 3, disc[3]=3, low[3]=3.

**Step 10: From node 3, explore neighbor 4.** Node 4 is unvisited → tree edge 3→4. Visit node 4, disc[4]=4, low[4]=4. Node 4 has no more neighbors. Backtrack.

**Step 11: Back at node 3.** low[3] = min(low[3], low[4]) = min(3, 4) = **3** (no improvement). Bridge check for edge 3→4: Is low[4] > disc[3]? Is 4 > 3? **YES!** Node 4's subtree (just node 4 itself) has no back edge reaching above node 3. **Edge 3-4 is a BRIDGE!**

**Step 12: Backtrack to node 1.** low[1] = min(low[1], low[3]) = min(0, 3) = **0** (no change). Bridge check for edge 1→3: Is low[3] > disc[1]? Is 3 > 1? **YES!** Node 3's subtree (nodes 3 and 4) has no back edge reaching above node 1. **Edge 1-3 is a BRIDGE!**

**Final state:** disc = [0, 1, 2, 3, 4], low = [0, 0, 0, 3, 4]. Bridges: [1-3, 3-4].

**Key observation:** Nodes 0, 1, 2 all have low=0 because the back edge 2→0 lets the entire cycle reach the earliest node. Nodes 3 and 4 have low equal to their own disc — they have no back edge escape route.

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
                dfs(v, u, adj, disc, low,
                    visited, bridges);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) {
                    bridges.add(
                        Arrays.asList(u, v));
                }
            } else if (v != parent) {
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

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
*{box-sizing:border-box;margin:0;padding:0}
.tj-w{width:100%}
.tj-tc{display:flex;gap:5px;margin-bottom:12px;flex-wrap:wrap}
.tj-tc button{padding:5px 14px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:transparent;color:#a1a1aa;cursor:pointer;font-family:inherit;transition:all .15s}
.tj-tc button:hover{border-color:rgba(255,255,255,0.2)}
.tj-tc button.act{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
.tj-ctrls{display:flex;gap:8px;align-items:center;margin-bottom:14px}
.tj-btn{padding:7px 18px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit;transition:all .15s}
.tj-btn:hover{background:#222229}
.tj-btn:disabled{opacity:0.3;cursor:default}
.tj-lbl{flex:1;text-align:center;font-size:12px;color:#71717a}
.tj-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:14px}
@media(max-width:700px){.tj-grid{grid-template-columns:1fr}}
.tj-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:10px}
.tj-ct{font-size:11px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.tj-ct i{width:8px;height:8px;border-radius:50%;display:inline-block}
.tj-tbl{width:100%;font-family:'JetBrains Mono',monospace;font-size:12px;border-collapse:collapse}
.tj-tbl th{text-align:center;padding:4px 8px;font-weight:500;color:#52525b;border-bottom:1px solid rgba(255,255,255,0.06);font-size:10px}
.tj-tbl td{text-align:center;padding:4px 8px;border-bottom:1px solid rgba(255,255,255,0.03)}
.tj-tbl .hl{background:rgba(79,143,247,0.12);color:#93c5fd;border-radius:3px}
.tj-tbl .up{background:rgba(251,191,36,0.12);color:#fbbf24;border-radius:3px}
.tj-log{font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:2;max-height:280px;overflow-y:auto}
.tj-log .v{color:#4f8ff7}.tj-log .te{color:#34d399}.tj-log .be{color:#fbbf24}
.tj-log .br{color:#f87171;font-weight:600}.tj-log .sf{color:#34d399}.tj-log .lo{color:#fbbf24}
.tj-code{font-family:'JetBrains Mono',monospace;font-size:11px;padding:12px 14px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;line-height:2}
.tj-code .hl{background:rgba(79,143,247,0.15);border-radius:3px;padding:1px 4px;color:#93c5fd}
.tj-code .dim{color:#3f3f46}
.tj-ins{padding:14px 18px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:10px}
.tj-leg{display:flex;gap:12px;font-size:11px;color:#71717a;margin-bottom:12px;flex-wrap:wrap}
.tj-leg span{display:flex;align-items:center;gap:5px}
.tj-leg em{width:16px;height:3px;border-radius:1px;display:inline-block;font-style:normal}
</style>
<div class="tj-w">
<div class="tj-tc" id="tj-tc"></div>
<div class="tj-leg">
<span><em style="background:#4f8ff7"></em>Tree edge</span>
<span><em style="border:1px dashed #fbbf24;width:14px;height:0"></em>Back edge</span>
<span><em style="background:#f87171;height:4px"></em>Bridge</span>
<span><em style="background:#34d399"></em>Current node</span>
</div>
<div class="tj-ctrls">
<button class="tj-btn" id="tj-prev" onclick="tjPrev()">← Prev</button>
<button class="tj-btn" id="tj-next" onclick="tjNext()">Next →</button>
<button class="tj-btn" id="tj-auto" onclick="tjTogA()">▶ Auto play</button>
<span class="tj-lbl" id="tj-sl">Ready</span>
</div>
<div class="tj-grid">
<div>
<div class="tj-card">
<div class="tj-ct"><i style="background:#4f8ff7"></i> Graph — nodes show disc/low</div>
<svg id="tj-svg" width="100%" viewBox="0 0 440 280"></svg>
</div>
<div class="tj-card">
<div class="tj-ct"><i style="background:#fbbf24"></i> Arrays state</div>
<table class="tj-tbl" id="tj-tbl"></table>
</div>
<div class="tj-code" id="tj-code">
<span class="dim">disc[u] = low[u] = timer++</span><br>
<span class="dim">for each neighbor v of u:</span><br>
<span class="dim">    if not visited: dfs(v,u); low[u]=min(low[u],low[v])</span><br>
<span class="dim">    if low[v]>disc[u]: BRIDGE</span><br>
<span class="dim">    else if v!=parent: low[u]=min(low[u],disc[v])</span>
</div>
</div>
<div>
<div class="tj-card">
<div class="tj-ct"><i style="background:#34d399"></i> Algorithm log</div>
<div class="tj-log" id="tj-log"></div>
</div>
<div class="tj-ins" id="tj-ins">Click <b>Next</b> to begin Tarjan's algorithm. Watch how disc[] and low[] values propagate cycle information upward through the DFS tree.</div>
</div>
</div>
</div>
<script>
const TJ_TCS=[
{name:"Example 1: Triangle + tail",V:5,edges:[[0,1],[1,2],[2,0],[1,3],[3,4]],pos:[[60,80],[190,40],[190,180],[340,90],[430,190]],desc:"Cycle {0,1,2}, tail 1→3→4 — bridges: 1-3, 3-4"},
{name:"Two triangles bridged",V:6,edges:[[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3]],pos:[[50,80],[160,30],[160,170],[300,90],[420,30],[420,170]],desc:"Bridge 1-3 connects two cycles"},
{name:"Linear chain (all bridges)",V:5,edges:[[0,1],[1,2],[2,3],[3,4]],pos:[[40,140],[130,60],[240,140],[340,60],[430,140]],desc:"No cycles — every edge is a bridge"},
{name:"Full cycle (no bridges)",V:5,edges:[[0,1],[1,2],[2,3],[3,4],[4,0]],pos:[[220,30],[400,110],[340,270],[100,270],[40,110]],desc:"One big cycle — all edges protected"},
{name:"Complex: two cycles + chain",V:7,edges:[[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,6],[6,4]],pos:[[40,80],[160,30],[160,170],[290,90],[420,30],[420,170],[290,200]],desc:"Bridges: 1-3 only"}
];
let tjCI=0,tjSteps=[],tjSI=-1,tjAI=null;
function tjInit(i){tjCI=i;tjStopA();document.querySelectorAll('#tj-tc button').forEach((b,j)=>{b.className=j===i?'act':''});tjBuild();tjSI=-1;tjRender()}
function tjBuild(){const tc=TJ_TCS[tjCI];tjSteps=[];
const adj=Array.from({length:tc.V},()=>[]);for(const e of tc.edges){adj[e[0]].push(e[1]);adj[e[1]].push(e[0])}
const disc=new Array(tc.V).fill(-1),low=new Array(tc.V).fill(-1);
const treeE=new Set(),backE=new Set(),bridges=new Set();let timer=0;
function snap(t,msg,hl,up,codeLine){tjSteps.push({t,msg,disc:[...disc],low:[...low],treeE:new Set(treeE),backE:new Set(backE),bridges:new Set(bridges),hl:hl!==undefined?hl:-1,up:up!==undefined?up:-1,cl:codeLine||0})}
function dfs(u,p){disc[u]=low[u]=timer++;
snap('visit','Visit node '+u+': disc['+u+']='+disc[u]+', low['+u+']='+low[u],u,-1,0);
for(const v of adj[u]){if(disc[v]===-1){treeE.add(u+','+v);
snap('tree','Tree edge '+u+' → '+v+' (unvisited, go deeper)',v,-1,1);
dfs(v,u);const old=low[u];low[u]=Math.min(low[u],low[v]);
if(old!==low[u])snap('low','Backtrack: low['+u+'] = min('+old+', low['+v+']='+low[v]+') = '+low[u],u,u,2);
if(low[v]>disc[u]){bridges.add(u+','+v);snap('bridge','BRIDGE! low['+v+']='+low[v]+' > disc['+u+']='+disc[u]+' → edge '+u+'-'+v,u,-1,3)}
else snap('safe','Safe: low['+v+']='+low[v]+' ≤ disc['+u+']='+disc[u]+' → edge '+u+'-'+v+' protected',u,-1,3)}
else if(v!==p){backE.add(u+','+v);const old=low[u];low[u]=Math.min(low[u],disc[v]);
snap('back','Back edge '+u+' → '+v+': low['+u+'] = min('+old+', disc['+v+']='+disc[v]+') = '+low[u],u,u,4)}}}
snap('start','Starting Tarjan\'s DFS from node 0',-1,-1,0);dfs(0,-1);
snap('done','Complete! '+bridges.size+' bridge(s) found in single O(V+E) pass.',-1,-1,0)}
function tjRender(){const tc=TJ_TCS[tjCI],step=tjSI>=0?tjSteps[tjSI]:null;
const d=step?step.disc:new Array(tc.V).fill(-1),l=step?step.low:new Array(tc.V).fill(-1);
const tE=step?step.treeE:new Set(),bE=step?step.backE:new Set(),br=step?step.bridges:new Set();
const hl=step?step.hl:-1,up=step?step.up:-1;
document.getElementById('tj-prev').disabled=tjSI<=0;document.getElementById('tj-next').disabled=tjSI>=tjSteps.length-1;
document.getElementById('tj-sl').textContent=tjSI<0?'Ready — '+tc.desc:'Step '+(tjSI+1)+' / '+tjSteps.length;
const mx=Math.max(...tc.pos.map(p=>p[0]))+40,my=Math.max(...tc.pos.map(p=>p[1]))+40;
document.getElementById('tj-svg').setAttribute('viewBox','0 0 '+Math.max(440,mx)+' '+Math.max(260,my));
let svg='';
for(const e of tc.edges){const p1=tc.pos[e[0]],p2=tc.pos[e[1]];
const ek1=e[0]+','+e[1],ek2=e[1]+','+e[0];let col='#2a2a33',sw=2,dash='';
if(br.has(ek1)||br.has(ek2)){col='#f87171';sw=3.5}
else if(tE.has(ek1)||tE.has(ek2)){col='#4f8ff7';sw=2.5}
else if(bE.has(ek1)||bE.has(ek2)){col='#fbbf24';sw=2;dash='6 4'}
svg+='<line x1="'+p1[0]+'" y1="'+p1[1]+'" x2="'+p2[0]+'" y2="'+p2[1]+'" stroke="'+col+'" stroke-width="'+sw+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' stroke-linecap="round"/>';
if(br.has(ek1)||br.has(ek2)){const cx=(p1[0]+p2[0])/2,cy=(p1[1]+p2[1])/2;
svg+='<text x="'+cx+'" y="'+(cy-12)+'" text-anchor="middle" font-size="10" font-weight="700" fill="#f87171" font-family="JetBrains Mono,monospace">BRIDGE</text>'}}
for(let i=0;i<tc.V;i++){const p=tc.pos[i];let f='#1a1a20',sk='#3f3f46',tx='#a1a1aa',r=22;
if(i===hl&&step&&step.t==='visit'){f='#0e2a1f';sk='#34d399';tx='#34d399';r=24}
else if(i===up){f='#2a1f0e';sk='#fbbf24';tx='#fbbf24'}
else if(d[i]>=0){f='#0e1a2e';sk='#4f8ff7';tx='#4f8ff7'}
svg+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+r+'" fill="'+f+'" stroke="'+sk+'" stroke-width="2"/>';
svg+='<text x="'+p[0]+'" y="'+(p[1]-4)+'" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="700" fill="'+tx+'" font-family="JetBrains Mono,monospace">'+i+'</text>';
if(d[i]>=0)svg+='<text x="'+p[0]+'" y="'+(p[1]+10)+'" text-anchor="middle" font-size="9.5" fill="'+tx+'" font-family="JetBrains Mono,monospace" opacity="0.7">'+d[i]+'/'+l[i]+'</text>'}
document.getElementById('tj-svg').innerHTML=svg;
let th='<tr><th>Node</th>';for(let i=0;i<tc.V;i++)th+='<th>'+i+'</th>';
th+='</tr><tr><td style="font-weight:600;color:#52525b">disc</td>';
for(let i=0;i<tc.V;i++){let c='';if(i===hl)c=' class="hl"';th+='<td'+c+'>'+(d[i]>=0?d[i]:'—')+'</td>'}
th+='</tr><tr><td style="font-weight:600;color:#52525b">low</td>';
for(let i=0;i<tc.V;i++){let c='';if(i===up)c=' class="up"';else if(i===hl)c=' class="hl"';th+='<td'+c+'>'+(l[i]>=0?l[i]:'—')+'</td>'}
th+='</tr>';document.getElementById('tj-tbl').innerHTML=th;
let lh='';for(let i=0;i<=tjSI&&i<tjSteps.length;i++){const s=tjSteps[i];let cls='';
if(s.t==='visit')cls='v';else if(s.t==='tree')cls='te';else if(s.t==='back')cls='be';
else if(s.t==='bridge')cls='br';else if(s.t==='safe')cls='sf';else if(s.t==='low')cls='lo';
lh+='<div class="'+cls+'">'+(i===tjSI?'▶ ':'')+s.msg+'</div>'}
document.getElementById('tj-log').innerHTML=lh;document.getElementById('tj-log').scrollTop=99999;
const codeLines=[
'<span class="dim">disc[u] = low[u] = timer++</span>',
'<span class="dim">for neighbor v: if !visited → dfs(v,u)</span>',
'<span class="dim">    low[u] = min(low[u], low[v])  // propagate</span>',
'<span class="dim">    if low[v] > disc[u] → BRIDGE!</span>',
'<span class="dim">    else if v≠parent → low[u] = min(low[u], disc[v])  // back edge</span>'
];
const ci=step?step.cl:null;if(ci!==null&&ci<codeLines.length)codeLines[ci]=codeLines[ci].replace('class="dim"','class="hl"');
document.getElementById('tj-code').innerHTML=codeLines.join('<br>');
let ins='';
if(!step)ins='Click <b>Next</b> to begin. Each node shows <b>disc/low</b> inside. Watch how back edges cause low values to drop, and how that information propagates upward.';
else if(step.t==='visit')ins='<b style="color:#34d399">Visiting node '+step.hl+'.</b> Assign disc['+step.hl+']='+d[step.hl]+', low starts at disc value. Timer advances to '+(d[step.hl]+1)+'.';
else if(step.t==='tree')ins='<b style="color:#4f8ff7">Tree edge found.</b> Neighbor is unvisited — DFS goes deeper. This edge becomes part of the DFS spanning tree.';
else if(step.t==='back')ins='<b style="color:#fbbf24">Back edge discovered!</b> This connects to an already-visited <b>ancestor</b> — it means a cycle exists. low['+step.hl+'] updates to reach that ancestor. This cycle now <b>protects</b> all tree edges along the path.';
else if(step.t==='low')ins='<b style="color:#fbbf24">Backtracking — propagating low value.</b> The parent inherits the best reachability from its child\'s subtree. If the child can reach high ancestors via back edges, the parent can too.';
else if(step.t==='bridge')ins='<b style="color:#f87171">BRIDGE DETECTED!</b> low[child] > disc[parent] means the child\'s entire subtree has <b>no back edge</b> reaching above this tree edge. Cutting it isolates the subtree completely.';
else if(step.t==='safe')ins='<b style="color:#34d399">Edge is safe.</b> low[child] ≤ disc[parent] means a back edge somewhere below reaches up past this edge. There\'s an alternate path — the cycle provides redundancy.';
else if(step.t==='done')ins='<b>Algorithm complete in a single DFS pass!</b> Found '+step.bridges.size+' bridge(s). Time: O(V+E). Compare this to brute force which would need '+tc.edges.length+' separate BFS runs.';
else ins=step.msg;
document.getElementById('tj-ins').innerHTML=ins}
function tjNext(){if(tjSI<tjSteps.length-1){tjSI++;tjRender()}}
function tjPrev(){if(tjSI>0){tjSI--;tjRender()}}
function tjTogA(){if(tjAI){tjStopA();return}document.getElementById('tj-auto').textContent='⏸ Pause';tjAI=setInterval(()=>{if(tjSI>=tjSteps.length-1){tjStopA();return}tjNext()},950)}
function tjStopA(){clearInterval(tjAI);tjAI=null;document.getElementById('tj-auto').textContent='▶ Auto play'}
const tjBar=document.getElementById('tj-tc');
TJ_TCS.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'act':'';b.onclick=()=>tjInit(i);tjBar.appendChild(b)});
tjBuild();tjRender();
</script>
</div>
