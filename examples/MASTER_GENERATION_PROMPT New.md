# DSA Studio — Master Problem Generation Prompt v2

---

## HOW TO USE

1. Copy the entire prompt between the ═══ lines
2. Replace `[SUBTOPIC]` and the problem list
3. Paste into Claude / ChatGPT / any AI
4. If it's too long, tell it to split: "Give me File 1 (problems 1-3). I'll ask for File 2 next."
5. Upload the .md file into DSA Studio

---

═══════════════════════════════════════════════════════════════════

You are generating a comprehensive DSA study file in markdown format for the subtopic **[SUBTOPIC]** containing these problems:

1. [Problem 1] — [Difficulty] — [LeetCode link]
2. [Problem 2] — [Difficulty] — [LeetCode link]
... (list all)

**SIZE RULE:** If total exceeds ~15,000 words, split into multiple files. Each file is self-contained. Separate problems within a file with `---` on its own line.

---

## ABSOLUTE RULES — READ BEFORE ANYTHING ELSE

**RULE 1 — VISUALIZATION HTML MUST NOT BE IN CODE FENCES.**
The `## [Approach] Visualization` section contains raw HTML that will be rendered in an iframe. Do NOT wrap it in triple backticks (```). Write the `<div>`, `<style>`, `<script>` tags directly in the markdown. If you put them inside a code fence, they render as plain text and the entire visualization is broken. This is the #1 most common mistake.

Correct:
```
## Brute Force Visualization

<div style="font-family:system-ui,sans-serif">
<style>...</style>
<script>...</script>
</div>
```

WRONG (broken):
```
## Brute Force Visualization

` ` `html
<div>...</div>
` ` `
```

**RULE 2 — EVERY VISUALIZATION MUST USE SVG FOR DIAGRAMS.**
Do NOT render data structures using `<div>` elements with margin/padding. Use `<svg>` with `<circle>`, `<rect>`, `<line>`, `<text>`, and `<path>`. Text-based rendering (├─ └─ with margin-left) is NOT acceptable. The visualization must look like a professional diagram, not a terminal output.

**RULE 3 — UNIQUE IDS FOR EACH PROBLEM'S VISUALIZATION.**
In a multi-problem file, every element ID must be unique. Suffix with the problem number: `id="svg1"`, `id="log1"`, `id="state1"` for problem 1, `id="svg2"`, `id="log2"` for problem 2, etc. Same for function names: `render1()`, `next1()`, `buildSteps1()`. If IDs collide, only one visualization works.

**RULE 4 — STEP-BY-STEP MUST TRACE CODE LINE BY LINE.**
Not "Step 1: Initialize. Step 2: Loop. Step 3: Return." Each step must show: which code line is executing, what variables change, the before/after state of data structures, and WHY this step matters. Minimum 300 words per step-by-step section.

**RULE 5 — EVERY APPROACH GETS EQUAL DEPTH.**
Brute force gets the same depth as optimal. Do NOT write 3 lines for brute and 30 for optimal. Each approach independently has ALL 10 sections at full depth.

---

## STRUCTURE FOR EVERY PROBLEM

```
# [Problem Name]

**Difficulty:** Easy/Medium/Hard
**LeetCode:** [full URL]
**GFG:** [full URL if exists]
```

---

### SECTION 1: ## Description

- Plain English explanation of what the problem asks
- Input/output format with types
- All constraints with ranges
- 2-3 examples: Input → Output → Explanation (trace through why that's the answer)
- Notable edge cases

---

### SECTION 2: ## In-depth Explanation

- **Reframe:** What is this REALLY asking? (strip the story)
- **Pattern recognition:** What DSA pattern is this? What keywords hint at it?
- **Real-world analogy:** Make the concept click with a familiar comparison
- **Why naive fails:** What most people try first and why it's too slow
- **Approach roadmap:** Brute → Better → Optimal, one sentence each
- **Interview cheat sheet:**
  - Keywords that signal this pattern
  - What makes this different from similar problems
  - The "aha moment" insight
  - 1-sentence memory hook

---

### SECTION 3: ## [Approach] Intuition

3-5 sentences. The core idea in one breath. "If you had 10 seconds to describe this approach, what would you say?"

---

### SECTION 4: ## [Approach] Step-by-Step Solution

**THIS SECTION MUST BE 400+ WORDS.** Trace through a concrete example showing what happens at each line of code.

**FORMAT — for every step:**
```
**Step N: [what happens]**

Code executing: `line of code being run`

We are at [position in data structure]. The current state is:
- variable1 = value (was previousValue)
- variable2 = value
- dataStructure = [show contents]

[Decision explanation]: We check [condition]. This is [true/false] because [reason].
[Action]: So we [do action], which changes [variable] from [old] to [new].
[Why this matters]: This step is important because [connection to algorithm's correctness].

State after this step:
- variable1 = newValue ← changed
- variable2 = value (unchanged)
- result so far = [partial result]
```

**After the walkthrough include:**
- **Correctness argument:** Why does this give the right answer? (2-3 sentences)
- **Key invariant:** What property is maintained throughout?
- **Common mistakes:** At least 2 specific pitfalls
- **30-second interview pitch:** How to explain this approach in one breath

**BAD example (too shallow — DO NOT do this):**
```
Step 1: Insert "apple" into the trie. Traverse nodes.
Step 2: Search for "apple". Found it. Return true.
```

**GOOD example (correct depth):**
```
Step 1: Insert "apple" — processing character 'a' (index 0)

Code executing: `node = node.children[ch - 'a']`

We start at the root node. Root has 26 child slots, all currently null.
We look at character 'a', which maps to index 0 (since 'a' - 'a' = 0).
children[0] is null — this child doesn't exist yet.

So we CREATE a new TrieNode and assign it: root.children[0] = new TrieNode().
We then move our pointer: node = root.children[0].

Why: We're building the path for "apple". The root → 'a' edge now exists.
Any future word starting with 'a' will share this node.

State after step 1:
- current node: the 'a' node (depth 1)
- path so far: root → a
- characters remaining: ['p', 'p', 'l', 'e']
- nodes created so far: 1
- endCount at current node: 0 (we haven't finished a word yet)
```

---

### SECTION 5: ## [Approach] In-depth Intuition

Go deeper: WHY this data structure? What mathematical property are we exploiting? What would break if constraints changed? Connection to other problems.

---

### SECTION 6: ## [Approach] Algorithm

Pseudocode with 4-space indentation. After the code block, explain each block (2-3 sentences).

---

### SECTION 7: ## [Approach] Code

```java
// Compilable Java code with 4-space indentation
// Comments on non-obvious lines
// LeetCode's exact function signature
```

---

### SECTION 8: ## [Approach] Complexity

Time: O(...) — explain WHY (which loop contributes what)
Space: O(...) — explain what's stored

---

### SECTION 9: ## [Approach] Hints

4-6 progressive hints from gentle nudge to near-answer.

---

### SECTION 10: ## [Approach] Visualization

**THIS IS THE MOST IMPORTANT SECTION. READ EVERY RULE.**

Generate raw HTML (NOT inside code fences) with `<style>` and `<script>` that creates an interactive visualization.

#### CRITICAL RENDERING RULES

**Use SVG for ALL data structure rendering. Here are the EXACT patterns:**

**Arrays:**
```javascript
// Render array as horizontal SVG boxes
function drawArray(svgEl, arr, highlights, labels) {
    const boxW = 48, boxH = 40, gap = 4, startX = 20, startY = 30;
    let svg = '';
    // Index labels on top
    arr.forEach((val, i) => {
        const x = startX + i * (boxW + gap);
        svg += `<text x="${x + boxW/2}" y="${startY - 8}" text-anchor="middle" 
                  font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;
    });
    // Boxes with values
    arr.forEach((val, i) => {
        const x = startX + i * (boxW + gap);
        const color = highlights[i] || '#2a2a33';
        const textColor = highlights[i] ? '#fafaf9' : '#a1a1aa';
        svg += `<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" 
                  fill="${color}" stroke="${color === '#2a2a33' ? '#3f3f46' : color}" stroke-width="1.5"/>`;
        svg += `<text x="${x + boxW/2}" y="${startY + boxH/2 + 1}" text-anchor="middle" 
                  dominant-baseline="central" font-size="14" font-weight="600" 
                  fill="${textColor}" font-family="JetBrains Mono,monospace">${val}</text>`;
    });
    // Pointer labels below (e.g., "left", "right", "mid")
    if (labels) {
        Object.entries(labels).forEach(([idx, label]) => {
            const x = startX + parseInt(idx) * (boxW + gap);
            svg += `<text x="${x + boxW/2}" y="${startY + boxH + 16}" text-anchor="middle" 
                      font-size="10" font-weight="600" fill="#4f8ff7" 
                      font-family="JetBrains Mono,monospace">${label}</text>`;
        });
    }
    svgEl.innerHTML = svg;
}
```

**Graphs (nodes + edges):**
```javascript
function drawGraph(svgEl, nodes, edges, nodeColors, edgeColors) {
    let svg = '';
    // Edges first (behind nodes)
    edges.forEach(([u, v], i) => {
        const n1 = nodes[u], n2 = nodes[v];
        const color = edgeColors[i] || '#2a2a33';
        const sw = edgeColors[i] ? 2.5 : 1.5;
        svg += `<line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" 
                  stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
    });
    // Nodes on top
    nodes.forEach((n, i) => {
        const fill = nodeColors[i]?.fill || '#1a1a20';
        const stroke = nodeColors[i]?.stroke || '#3f3f46';
        const textColor = nodeColors[i]?.text || '#a1a1aa';
        const r = nodeColors[i]?.r || 20;
        svg += `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${fill}" 
                  stroke="${stroke}" stroke-width="2"/>`;
        svg += `<text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="central" 
                  font-size="13" font-weight="700" fill="${textColor}" 
                  font-family="JetBrains Mono,monospace">${n.label || i}</text>`;
        // Show extra info below node (like disc/low values)
        if (n.sub) {
            svg += `<text x="${n.x}" y="${n.y + 14}" text-anchor="middle" font-size="9" 
                      fill="${textColor}" opacity="0.7" 
                      font-family="JetBrains Mono,monospace">${n.sub}</text>`;
        }
    });
    svgEl.innerHTML = svg;
}
```

**Trees (with proper layout):**
```javascript
function drawTree(svgEl, treeNodes, highlights) {
    // treeNodes: [{label, children:[], x, y, data:{}}]
    // First pass: compute positions with level-order, spacing
    // Then draw edges (parent to each child), then draw nodes
    let svg = '';
    function drawEdges(node) {
        (node.children || []).forEach(child => {
            svg += `<line x1="${node.x}" y1="${node.y + 16}" x2="${child.x}" y2="${child.y - 16}" 
                      stroke="#3f3f46" stroke-width="1.5" stroke-linecap="round"/>`;
            drawEdges(child);
        });
    }
    function drawNodes(node) {
        const hl = highlights?.includes(node.id);
        const fill = hl ? 'rgba(79,143,247,0.15)' : '#1a1a20';
        const stroke = hl ? '#4f8ff7' : '#3f3f46';
        const textC = hl ? '#93c5fd' : '#a1a1aa';
        svg += `<circle cx="${node.x}" cy="${node.y}" r="16" fill="${fill}" 
                  stroke="${stroke}" stroke-width="1.5"/>`;
        svg += `<text x="${node.x}" y="${node.y}" text-anchor="middle" dominant-baseline="central" 
                  font-size="12" font-weight="600" fill="${textC}" 
                  font-family="JetBrains Mono,monospace">${node.label}</text>`;
        (node.children || []).forEach(child => drawNodes(child));
    }
    drawEdges(treeNodes); drawNodes(treeNodes);
    svgEl.innerHTML = svg;
}
```

#### VARIABLE STATE PANEL — MANDATORY FORMAT

Show ALL variables as a table. Highlight changes in amber. This is what makes the visualization educational:

```javascript
function renderState(stateEl, vars, changes) {
    // vars: {name: value, ...}
    // changes: Set of variable names that changed this step
    let html = '<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';
    Object.entries(vars).forEach(([name, value]) => {
        const changed = changes.has(name);
        const bg = changed ? 'rgba(251,191,36,0.1)' : 'transparent';
        const nameColor = changed ? '#fbbf24' : '#52525b';
        const valColor = changed ? '#fbbf24' : '#b8b8be';
        html += `<tr style="background:${bg}">
            <td style="padding:4px 10px;color:${nameColor};font-weight:600;width:40%">${name}</td>
            <td style="padding:4px 10px;color:${valColor}">${
                Array.isArray(value) ? '[' + value.map((v,i) => 
                    changes.has(name+'['+i+']') ? `<span style="color:#fbbf24;font-weight:700">${v}</span>` : v
                ).join(', ') + ']' : value
            }${changed ? ' ← changed' : ''}</td>
        </tr>`;
    });
    html += '</table>';
    stateEl.innerHTML = html;
}
```

#### CODE HIGHLIGHT PANEL

```javascript
const CODE_LINES = [
    "disc[u] = low[u] = timer++",
    "for each neighbor v of u:",
    "    if v not visited: dfs(v, u)",
    "    low[u] = min(low[u], low[v])",
    "    if low[v] > disc[u]: BRIDGE!",
    "    else if v ≠ parent: low[u] = min(low[u], disc[v])"
];

function renderCode(codeEl, activeLine) {
    let html = '';
    CODE_LINES.forEach((line, i) => {
        const isActive = i === activeLine;
        const bg = isActive ? 'rgba(79,143,247,0.15)' : 'transparent';
        const color = isActive ? '#93c5fd' : '#3f3f46';
        const weight = isActive ? '600' : '400';
        html += `<div style="padding:2px 8px;border-radius:4px;background:${bg};
                    color:${color};font-weight:${weight};font-size:12px;line-height:2;
                    font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;
    });
    codeEl.innerHTML = html;
}
```

#### COMPLETE HTML TEMPLATE

Every visualization MUST follow this structure. Replace `N` with a unique number per problem:

```
<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.vizN-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.vizN-grid{grid-template-columns:1fr}}
.vizN-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.vizN-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.vizN-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.vizN-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.vizN-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.vizN-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.vizN-btn:disabled{opacity:0.3}
.vizN-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>

<!-- Test case buttons -->
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBarN"></div>

<!-- Step controls -->
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="vizN-btn" id="prevN" onclick="prevN()">← Prev</button>
  <button class="vizN-btn" id="nextN" onclick="nextN()">Next →</button>
  <button class="vizN-btn" id="autoN" onclick="toggleAutoN()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabelN">Ready</span>
</div>

<div class="vizN-grid">
  <!-- LEFT COLUMN -->
  <div>
    <!-- Panel 1: SVG Data Structure -->
    <div class="vizN-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Data Structure</div>
      <svg id="svgN" width="100%" viewBox="0 0 450 280"></svg>
    </div>
    <!-- Panel 2: Variables & Memory -->
    <div class="vizN-state" id="stateN"></div>
    <!-- Panel 3: Code with line highlight -->
    <div class="vizN-code" id="codeN"></div>
  </div>
  <!-- RIGHT COLUMN -->
  <div>
    <!-- Panel 4: Algorithm Log -->
    <div class="vizN-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="vizN-log" id="logN"></div>
    </div>
    <!-- Panel 5: Step Explanation -->
    <div class="vizN-expl" id="explN"></div>
  </div>
</div>

<script>
// === UNIQUE FUNCTION NAMES (suffix with N) ===
const TCS_N = [
    { name: "Basic", data: ... },
    { name: "Complex", data: ... },
    { name: "Edge case", data: ... },
];

let stepsN = [], stepIdxN = -1, autoIntN = null, tcIdxN = 0;

function buildStepsN(tc) {
    stepsN = [];
    // SIMULATE the algorithm step by step
    // Each step captures:
    // { type, msg, svgState, variables, changedVars, codeLine, explanation }
    // svgState: data needed to render the SVG (node positions, colors, values)
    // variables: ALL algorithm variables as key-value pairs
    // changedVars: Set of variable names that changed this step
    // codeLine: which line of CODE_LINES_N is executing
    // explanation: 2-3 sentence natural language explanation
}

function renderN() {
    const s = stepsN[stepIdxN];
    if (!s) return;
    
    // 1. Draw SVG data structure
    const svg = document.getElementById('svgN');
    // ... use drawArray/drawGraph/drawTree patterns above ...
    
    // 2. Render variable state table
    renderState(document.getElementById('stateN'), s.variables, s.changedVars);
    
    // 3. Highlight current code line
    renderCode(document.getElementById('codeN'), s.codeLine);
    
    // 4. Update log (all steps up to current)
    let logHtml = '';
    for (let i = 0; i <= stepIdxN; i++) {
        const marker = i === stepIdxN ? '▶ ' : '  ';
        logHtml += `<div style="color:${stepsN[i].color}">${marker}${stepsN[i].msg}</div>`;
    }
    document.getElementById('logN').innerHTML = logHtml;
    document.getElementById('logN').scrollTop = 99999;
    
    // 5. Show explanation
    document.getElementById('explN').innerHTML = s.explanation;
    
    // 6. Update step counter
    document.getElementById('stepLabelN').textContent = `Step ${stepIdxN + 1} / ${stepsN.length}`;
    document.getElementById('prevN').disabled = stepIdxN <= 0;
    document.getElementById('nextN').disabled = stepIdxN >= stepsN.length - 1;
}

function nextN() { if (stepIdxN < stepsN.length - 1) { stepIdxN++; renderN(); } }
function prevN() { if (stepIdxN > 0) { stepIdxN--; renderN(); } }
function toggleAutoN() {
    if (autoIntN) { clearInterval(autoIntN); autoIntN = null; document.getElementById('autoN').textContent = '▶ Auto'; }
    else { autoIntN = setInterval(() => { if (stepIdxN >= stepsN.length - 1) { toggleAutoN(); return; } nextN(); }, 1000);
        document.getElementById('autoN').textContent = '⏸ Pause'; }
}
function loadTcN(idx) {
    tcIdxN = idx; stepIdxN = 0;
    buildStepsN(TCS_N[idx]);
    document.querySelectorAll('[data-tcn]').forEach((b, i) => { b.className = i === idx ? 'vizN-btn active' : 'vizN-btn'; });
    renderN();
}

// Initialize
const tcBar = document.getElementById('tcBarN');
TCS_N.forEach((tc, i) => {
    const b = document.createElement('button');
    b.textContent = tc.name;
    b.className = i === 0 ? 'vizN-btn active' : 'vizN-btn';
    b.setAttribute('data-tcn', '');
    b.onclick = () => loadTcN(i);
    tcBar.appendChild(b);
});
buildStepsN(TCS_N[0]); renderN();
</script>
</div>
```

#### STEP GRANULARITY FOR VISUALIZATION

Each algorithmic operation should be broken into MULTIPLE steps in the visualization. For example, inserting "apple" into a Trie should NOT be one step. It should be 5-6 steps:

1. Start at root, look at character 'a'
2. Create node for 'a', move to it
3. Look at character 'p', create node, move
4. Look at character 'p', create node, move
5. Look at character 'l', create node, move
6. Look at character 'e', create node, mark endOfWord=true

Each step updates the SVG to show the tree growing, highlights the current node, updates the variable state panel, highlights the executing code line, and shows an explanation.

For graph algorithms (DFS, BFS, Dijkstra), each node visit, edge exploration, and backtrack should be a separate step.

For array algorithms (two pointer, sliding window, binary search), each pointer movement or comparison should be a separate step.

---

### QUALITY CHECKLIST

Before outputting, verify:

- [ ] Visualization HTML is NOT inside triple backtick code fences
- [ ] Visualization uses SVG `<circle>`, `<rect>`, `<line>`, `<text>` — NOT div-based rendering
- [ ] Every element ID and function name is unique per problem (suffixed with problem number)
- [ ] Variable state panel shows ALL variables as a table with change highlighting
- [ ] Code panel highlights the currently executing line
- [ ] At least 3 test cases per visualization
- [ ] Step-by-Step Solution is 400+ words with per-line code tracing
- [ ] Every approach (brute, better, optimal) has ALL 10 sections at equal depth
- [ ] Code inside ```java blocks has proper 4-space indentation
- [ ] Complexity explains WHY, not just states the Big-O
- [ ] Problems separated by `---`
- [ ] Description includes constraints and 2+ examples
- [ ] In-depth Explanation includes interview cheat sheet with memory hook

---

### BAD vs GOOD VISUALIZATION — STUDY THIS

**BAD (text-based tree — NEVER do this):**
```javascript
// This renders as plain text, not a visual diagram
html += `<div style="margin-left:${depth*24}px">├─ ${label}</div>`;
```

**GOOD (SVG-based tree):**
```javascript
// This renders as a proper visual diagram with circles and lines
svg += `<line x1="${parent.x}" y1="${parent.y+16}" x2="${child.x}" y2="${child.y-16}" 
          stroke="#3f3f46" stroke-width="1.5"/>`;
svg += `<circle cx="${child.x}" cy="${child.y}" r="16" fill="#0e1a2e" stroke="#4f8ff7"/>`;
svg += `<text x="${child.x}" y="${child.y}" text-anchor="middle" dominant-baseline="central" 
          font-size="12" fill="#93c5fd">${child.label}</text>`;
```

**BAD (minimal state display):**
```javascript
statePanel.innerHTML = `Operation: ${s.msg}. Map size: ${s.size}`;
```

**GOOD (full variable table with highlights):**
```javascript
statePanel.innerHTML = `
<table>
  <tr><td>current_node</td><td style="color:#fbbf24">node_3 ← moved from node_2</td></tr>
  <tr><td>disc[]</td><td>[0, 1, 2, <span style="color:#fbbf24">3</span>, -]</td></tr>
  <tr><td>low[]</td><td>[0, 1, <span style="color:#fbbf24">0</span>, 3, -]</td></tr>
  <tr><td>stack</td><td>[0, 1, 3]</td></tr>
  <tr><td>bridges</td><td>[]</td></tr>
</table>`;
```

═══════════════════════════════════════════════════════════════════

---

## QUICK-USE EXAMPLES

**Single subtopic:**
```
Generate the markdown for subtopic "Trie" with these problems:
1. Implement Trie — Hard — https://leetcode.com/problems/implement-trie-prefix-tree/
2. Longest Word With All Prefixes — Medium — [GFG link]
3. Count Distinct Substrings — Hard — [GFG link]
```

**Requesting a split:**
```
This has 10 problems. Generate File 1 (problems 1-3) now. I'll ask for File 2 next.
```

**Fixing a bad visualization:**
```
The visualization for problem 2 uses div-based tree rendering. 
Regenerate ONLY the ## Optimal Visualization section using SVG 
with circles for nodes and lines for edges. Follow the SVG patterns 
in the prompt. Remember: NO code fences around the HTML.
```

---

## HEADING → FIELD MAPPING

```
## Description                           → description
## In-depth Explanation                  → in_depth_explanation
## [Approach] Intuition                  → solutions[].intuition
## [Approach] Step-by-Step Solution      → solutions[].in_depth_intuition
## [Approach] In-depth Intuition         → solutions[].in_depth_intuition (merged)
## [Approach] Algorithm                  → solutions[].algorithm
## [Approach] Code                       → solutions[].code
## [Approach] Complexity                 → solutions[].time_complexity + space_complexity
## [Approach] Hints                      → solutions[].hints
## [Approach] Visualization              → solutions[].visualization_html

Approach keywords: "brute force/brute/naive" → Brute Force
                   "better/improved" → Better
                   "optimal/efficient/best" → Optimal
```
