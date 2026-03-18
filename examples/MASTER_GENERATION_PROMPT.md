# DSA Studio — Ultimate Problem Generation Prompt

---

## HOW TO USE THIS PROMPT

1. Copy the prompt below (everything between the ═══ lines)
2. Replace `[SUBTOPIC]` with your subtopic name
3. Replace the problem list with your actual problems
4. Paste into any AI (Claude, ChatGPT, etc.)
5. If the AI says it's too long, tell it: "Split into multiple files. File 1: problems 1-3. File 2: problems 4-6. Separate each problem with ---"
6. Upload the generated .md file(s) into your DSA Studio app

---

## THE PROMPT (copy everything below)

═══════════════════════════════════════════════════════════════════

You are a DSA interview coach creating a comprehensive study file. Generate a markdown file for the subtopic **[SUBTOPIC]** containing these problems:

1. [Problem 1 name] — [Difficulty] — [LeetCode/GFG link]
2. [Problem 2 name] — [Difficulty] — [LeetCode/GFG link]
3. [Problem 3 name] — [Difficulty] — [LeetCode/GFG link]
... (list all problems)

**IMPORTANT SIZE RULE:** If total content would exceed ~15,000 words, split into multiple files:
- File 1: Problems 1–3 (output this first, then I'll ask for the next)
- File 2: Problems 4–6
- etc.
Each file must be self-contained. Separate problems within each file with `---` on its own line.

---

### STRUCTURE FOR EVERY SINGLE PROBLEM

Every problem MUST have ALL of these sections in this EXACT order. Do NOT skip any section for any approach. Brute force deserves the same depth as optimal.

```
# [Problem Name]

**Difficulty:** [Easy/Medium/Hard]
**LeetCode:** [full URL]
**GFG:** [full URL if exists]
```

---

#### SECTION 1: ## Description

Write a complete problem statement including:
- What the problem asks in plain, simple English (as if explaining to someone who has never seen it)
- Input format with types (e.g., "an integer array nums of length n")
- Output format with types
- ALL constraints with ranges (2 <= n <= 10^5, etc.)
- 2-3 examples with Input → Output → step-by-step explanation of why that's the answer
- Edge cases worth noting (empty input, single element, all same values, etc.)

---

#### SECTION 2: ## In-depth Explanation

This is the "what should I think when I see this problem in an interview" section. Include:

- **Reframe the problem**: What is this REALLY asking? Strip away the story and state the core computational question.
- **Pattern recognition**: What category does this fall into? (sliding window, two pointer, BFS, union-find, DP, etc.) What are the clues in the problem statement that hint at this pattern?
- **Real-world analogy**: A simple analogy that makes the concept click (e.g., "Think of Union-Find as groups of friends — if Alice knows Bob and Bob knows Charlie, they're all in one friend group")
- **Why naive thinking fails**: What's the first thing most people try and why doesn't it work?
- **Approach overview**: Brief roadmap of brute → better → optimal, what each improves
- **Key edge cases**: Which inputs break naive solutions and why

**Interview cheat sheet — How to recognize this problem type:**
- What keywords in the problem hint at the approach? (e.g., "shortest path" → BFS, "all subsets" → backtracking, "maximum/minimum with constraint" → DP or binary search on answer)
- What distinguishes this from similar-looking problems?
- What's the "aha moment" — the one insight that unlocks the solution?
- Quick memory hook: a 1-sentence mnemonic or pattern name (e.g., "This is a 'monotonic stack — next greater element' pattern")

---

#### SECTION 3: ## [Approach] Intuition
(where [Approach] = "Brute Force" or "Better" or "Optimal")

3-5 sentences capturing the CORE idea. Answer: "If someone asked you the approach in one breath, what would you say?"

---

#### SECTION 4: ## [Approach] Step-by-Step Solution

THIS IS THE MOST CRITICAL SECTION. Write it as if you are tutoring someone who is completely stuck. Include:

**Opening:** State what we're about to do and why this approach works.

**Detailed walkthrough using a CONCRETE example** (use Example 1 from the Description):
- Number every step: Step 1, Step 2, Step 3...
- For EACH step show:
  - What we're looking at (which element, which node, which edge)
  - What decision we make and WHY (not just "we add it to the result" but "we add it because it satisfies condition X which means Y")
  - The current state of ALL data structures (array values, stack contents, queue, visited set, dp table row, etc.)
  - What changes after this step

**After the walkthrough:**
- Why does this approach give the correct answer? (correctness argument in simple terms)
- What's the key invariant being maintained?
- Common mistakes and how to avoid them (off-by-one, forgetting to handle X, wrong initialization)
- How would you explain this approach to your interviewer in 30 seconds?

**DEPTH REQUIREMENT:** This section should be 300-500 words minimum. Do NOT rush through it. Every single approach (brute, better, optimal) gets this level of detail. The brute force step-by-step is just as important as the optimal one because it builds understanding.

---

#### SECTION 5: ## [Approach] In-depth Intuition

Go deeper than the Step-by-Step. Explain:
- WHY this data structure / algorithm was chosen over alternatives
- The mathematical or logical proof of why it works (informal, interview-level)
- What property of the input we're exploiting
- Connection to other problems (e.g., "This is essentially Dijkstra's but with max instead of sum")
- What breaks if we change a constraint (e.g., "If edges had negative weights, this wouldn't work because...")

---

#### SECTION 6: ## [Approach] Algorithm

Write clear pseudocode with PROPER INDENTATION (4 spaces per level). The pseudocode must:
- Use descriptive variable names (not i, j, k — use left, right, current, etc.)
- Include comments explaining non-obvious lines
- Show initialization, main loop, and return
- Be translatable to any language

```
function solveProblem(input):
    // Initialize data structures
    result = []
    seen = HashSet()
    
    // Main processing loop
    for each element in input:
        // Check condition
        if element satisfies property:
            // Update state
            seen.add(element)
            result.append(transform(element))
        else:
            // Handle alternative case
            backtrack(state)
    
    return result
```

After the pseudocode, briefly explain each major block (2-3 sentences).

---

#### SECTION 7: ## [Approach] Code

```java
// Full, compilable Java code
// MUST have proper 4-space indentation at every level
// Include brief comments for non-obvious logic
// Use LeetCode's exact method signature
// Use descriptive variable names

class Solution {
    public ReturnType methodName(Parameters params) {
        // Initialization
        int n = params.length;
        
        // Main logic with proper nesting
        for (int i = 0; i < n; i++) {
            if (condition) {
                for (int j = 0; j < m; j++) {
                    // Nested logic properly indented
                    doSomething();
                }
            }
        }
        
        return result;
    }
}
```

CRITICAL: Every level of nesting MUST have 4 more spaces of indentation. The code must compile and pass on LeetCode.

---

#### SECTION 8: ## [Approach] Complexity

```
Time: O(exact complexity)
Space: O(exact complexity)
```

After stating the complexity, explain WHY in 2-3 sentences:
- Time: "We iterate through n elements once (O(n)), and for each element we do a binary search (O(log n)), giving O(n log n) total."
- Space: "We store at most n elements in the hash map, so O(n) extra space."

---

#### SECTION 9: ## [Approach] Hints

Write 4-6 progressive hints, from gentle to almost-the-answer:
- Hint 1: Points toward the right data structure or technique without naming it
- Hint 2: Names the technique but doesn't explain how to apply it
- Hint 3: Explains the key insight but doesn't give the implementation
- Hint 4: Nearly the algorithm but missing one detail
- Hint 5: The complete approach in one sentence
- Hint 6: An edge case they probably forgot

---

#### SECTION 10: ## [Approach] Visualization

Generate a COMPLETE, self-contained HTML block that creates an interactive step-by-step visualization. This is the most important visual feature of the app.

**THE VISUALIZATION MUST INCLUDE ALL OF THESE PANELS:**

**Panel 1 — Data Structure Visualization (top-left, ~60% width):**
- Render the actual data structure using SVG/Canvas:
  - Arrays: horizontal boxes with values and index labels
  - Graphs: circles (nodes) with lines (edges), with node labels
  - Trees: proper tree layout with parent-child edges
  - Linked lists: boxes with arrows
  - Stacks/Queues: vertical/horizontal boxes showing contents
  - Hash maps: key-value pairs in buckets
- Color coding per step:
  - `#4f8ff7` (blue) — currently being processed
  - `#34d399` (green) — completed / confirmed / in result
  - `#f87171` (red) — important finding (bridge, cycle, target found)
  - `#fbbf24` (amber) — being compared / under consideration
  - `#a78bfa` (purple) — special state (back edge, recursive call)
  - `#3f3f46` (gray) — not yet visited / inactive
- Labels and values must be clearly readable (font-size >= 12px)

**Panel 2 — Variables & Memory State (below data structure):**
This is CRITICAL — show ALL algorithm variables at each step:
- All arrays (disc[], low[], visited[], dp[], parent[], rank[], etc.)
- All scalar variables (timer, count, result, maxSoFar, left, right, etc.)
- Stack/queue contents if used
- Current function call / recursion depth if applicable
- Display as a clean table or key-value grid
- HIGHLIGHT values that changed in this step (use amber background)
- Show previous value → new value for changes

**Panel 3 — Algorithm / Code with Current Line Highlighted (right side or below):**
- Show the pseudocode or simplified code (5-8 lines)
- At each step, highlight the currently executing line with a blue background
- Dim all other lines to gray
- This lets the viewer connect "what happened visually" to "which code line caused it"

**Panel 4 — Algorithm Log (right side):**
- Scrollable log showing every action taken
- Color-coded by type:
  - Blue: visiting/processing
  - Green: success/safe/complete
  - Red: important finding
  - Amber: comparison/update
- Current step has a ▶ marker
- Previous steps remain visible (scrollable history)

**Panel 5 — Step Explanation (bottom):**
- Natural language explanation of what happened in THIS step and WHY
- Different explanation for each step type
- Should read like a tutor explaining: "We're visiting node 3. Its disc value is set to 3. Now we check its neighbors..."

**CONTROLS (top):**
- Test case selector buttons (minimum 3-4 test cases):
  - Basic/simple case
  - Complex case showing the main algorithm behavior
  - Edge case (empty, single element, all same, etc.)
  - Large or tricky case
- Step controls: ← Prev | Next → | ▶ Auto play / ⏸ Pause
- Step counter: "Step 5 / 23"

**TECHNICAL REQUIREMENTS:**
```
1. Fully self-contained HTML with <style> and <script>
2. Dark theme: background #111114, text #e4e4e7
3. Font: system-ui, sans-serif; monospace: JetBrains Mono
4. Works inside an iframe with sandbox="allow-scripts"
5. No external dependencies (no CDN links)
6. Responsive: works at both inline (400px height) and fullscreen (88vh)
7. All steps are PRE-COMPUTED (build all steps array first, then render based on index)
8. Auto-play interval: 900-1200ms per step
9. SVG viewBox sized to fit content (calculate from node positions)
10. Grid layout: use CSS grid or flexbox that adapts to container width
```

**TEMPLATE STRUCTURE:**
```html
<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
  /* Layout: 2-column grid */
  .viz-grid { display:grid; grid-template-columns:1.1fr 0.9fr; gap:14px; }
  @media(max-width:700px) { .viz-grid { grid-template-columns:1fr; } }
  /* Cards for each panel */
  .viz-card { background:#0e0e12; border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:16px; }
  /* State/memory display */
  .viz-state { font-family:'JetBrains Mono',monospace; font-size:12px; padding:12px; background:#141418; border-radius:8px; line-height:1.8; }
  .viz-state .changed { background:rgba(251,191,36,0.12); border-radius:3px; padding:1px 4px; color:#fbbf24; }
  /* Code with highlighting */
  .viz-code { font-family:'JetBrains Mono',monospace; font-size:11px; line-height:2; }
  .viz-code .active { background:rgba(79,143,247,0.15); border-radius:3px; padding:1px 4px; color:#93c5fd; }
  .viz-code .dim { color:#3f3f46; }
  /* Test case buttons, step controls, log, etc. */
</style>

<div>
  <!-- Test case buttons -->
  <!-- Step controls: Prev, Next, Auto play -->
  <div class="viz-grid">
    <div>
      <!-- Panel 1: SVG data structure visualization -->
      <div class="viz-card"><svg ...></svg></div>
      <!-- Panel 2: Variables & Memory state -->
      <div class="viz-state" id="state">...</div>
      <!-- Panel 3: Code with highlighted line -->
      <div class="viz-code" id="code">...</div>
    </div>
    <div>
      <!-- Panel 4: Algorithm log -->
      <div class="viz-card"><div id="log">...</div></div>
      <!-- Panel 5: Step explanation -->
      <div id="explanation">...</div>
    </div>
  </div>
</div>

<script>
  // TEST CASES with different inputs
  const TEST_CASES = [
    { name:"Basic", ... },
    { name:"Complex", ... },
    { name:"Edge case", ... },
  ];
  
  // PRE-COMPUTE all steps for current test case
  function buildSteps() {
    steps = [];
    // Simulate algorithm step by step
    // Each step: { type, msg, visualization_state, variables, code_line, explanation }
    // MUST capture state of ALL variables at each step
  }
  
  function render() {
    // Update Panel 1: SVG with colors based on current step
    // Update Panel 2: Variables table, highlight changed values
    // Update Panel 3: Code with current line highlighted
    // Update Panel 4: Log with all steps up to current
    // Update Panel 5: Natural language explanation
  }
</script>
</div>
```

**VARIABLE STATE DISPLAY EXAMPLE:**
```
┌─────────────────────────────────────────┐
│ Variables & Memory                       │
├─────────────────────────────────────────┤
│ timer = 3                                │
│ disc[] = [0, 1, 2, -, -]               │
│ low[]  = [0, 1, *0*, -, -]  ← changed! │
│ visited = {0, 1, 2}                     │
│ parent[] = [-1, 0, 1, -, -]            │
│ bridges = []                             │
│ stack = [0, 1]  (DFS call stack)        │
│ current edge: 2 → 0 (BACK EDGE)        │
└─────────────────────────────────────────┘
```

---

### APPROACH RULES — EQUAL DEPTH FOR ALL

**CRITICAL:** Every approach (Brute Force, Better, Optimal) MUST have ALL 10 sections above with EQUAL depth and detail. Do NOT:
- Write a short brute force and a long optimal
- Skip the visualization for brute force
- Give a brief step-by-step for better but detailed one for optimal
- Say "similar to above" for any section

Each approach is independent. Someone reading only the Brute Force sections should get a complete understanding. Someone reading only the Optimal sections should also get a complete understanding.

If a problem only has 2 approaches (brute + optimal), that's fine — but both get full treatment.

---

### QUALITY CHECKLIST — VERIFY BEFORE OUTPUT

Before outputting the file, mentally verify:

- [ ] Every code block has correct 4-space indentation (check nested for/if/while)
- [ ] Every approach has ALL 10 sections (Intuition, Step-by-Step, In-depth Intuition, Algorithm, Code, Complexity, Hints, Visualization)
- [ ] Step-by-Step traces through a concrete example with numbered steps and all variable states
- [ ] In-depth Explanation includes pattern recognition, interview cheat sheet, and memory hook
- [ ] Visualization HTML has all 5 panels (data structure, variables, code highlight, log, explanation)
- [ ] Visualization shows variable/memory state at every step (disc[], low[], dp[], etc.)
- [ ] Visualization has 3+ test cases with different scenarios
- [ ] Visualization code highlighting shows which line is executing
- [ ] Complexity explains WHY (not just states the Big-O)
- [ ] Hints are progressive (6 hints from gentle to explicit)
- [ ] Code compiles and would pass on LeetCode
- [ ] Problems are separated by `---`
- [ ] LeetCode/GFG URLs are included
- [ ] Description has constraints and 2+ examples

---

### EXAMPLE OF EXPECTED STEP-BY-STEP DEPTH

Bad (too shallow):
```
Step 1: Initialize two pointers left=0, right=n-1
Step 2: While left < right, check middle
Step 3: Return answer
```

Good (proper depth):
```
Step 1: Initialize. Set left = 0, right = 4 (array length - 1). 
Our search space is the entire array [2, 3, 5, 7, 11]. 
We're looking for target = 7.
State: left=0, right=4, array=[2,3,5,7,11], target=7

Step 2: Calculate mid = (0 + 4) / 2 = 2. Look at arr[2] = 5.
Is 5 == 7? No. Is 5 < 7? Yes.
Since arr[mid] < target, the target must be in the RIGHT half.
Why? Because the array is sorted — everything to the left of index 2 
is ≤ 5, which is less than 7. So we can safely discard the left half.
Update: left = mid + 1 = 3.
State: left=3, right=4, search space=[7, 11]

Step 3: Calculate mid = (3 + 4) / 2 = 3. Look at arr[3] = 7.
Is 7 == 7? YES! We found the target at index 3.
Return 3.
State: FOUND at index 3, total comparisons = 2

Why only 2 comparisons for 5 elements? Because binary search 
halves the search space each time: 5 → 2 → 1. 
log₂(5) ≈ 2.3, so at most 3 comparisons needed.
```

---

### EXAMPLE OF EXPECTED VISUALIZATION VARIABLE STATE

Bad (no variables shown):
```
[Just a graph with colored nodes]
```

Good (full state):
```
┌─────────────────────────┐  ┌──────────────────────┐
│  Graph Visualization    │  │  Algorithm Log        │
│  [SVG with colored      │  │  ▶ Visit node 2      │
│   nodes and edges]      │  │    Back edge 2→0      │
│                         │  │    low[2] = min(2,0)  │
└─────────────────────────┘  └──────────────────────┘
┌─────────────────────────┐  ┌──────────────────────┐
│  Variables & Memory     │  │  Code (line 5 active) │
│  timer = 3              │  │  dim: disc[u]=low[u]  │
│  disc = [0,1,*2*,-,-]  │  │  dim: for v in adj:   │
│  low  = [0,1,*0*,-,-]  │  │  dim:   if !visited   │
│  parent = [-1,0,1,-,-] │  │  dim:   propagate low │
│  visited = {0,1,2}     │  │  ACTIVE: low[u]=min() │
│  bridges = []           │  └──────────────────────┘
│  call stack: dfs(0)→    │
│    dfs(1)→dfs(2)        │
│  current: back edge 2→0 │
└─────────────────────────┘
[Explanation: "Node 2 found a back edge to node 0 (already visited ancestor). 
This means a cycle exists: 0→1→2→0. low[2] updates from 2 to 0, meaning 
node 2's subtree can reach all the way back to node 0."]
```

═══════════════════════════════════════════════════════════════════

---

## QUICK-USE EXAMPLES

### Example 1: Single subtopic request

```
Generate the markdown for subtopic "Binary Search" with these problems:
1. Binary Search — Easy — https://leetcode.com/problems/binary-search/
2. Search Insert Position — Easy — https://leetcode.com/problems/search-insert-position/
3. Find First and Last Position — Medium — https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/
4. Search in Rotated Sorted Array — Medium — https://leetcode.com/problems/search-in-rotated-sorted-array/
5. Median of Two Sorted Arrays — Hard — https://leetcode.com/problems/median-of-two-sorted-arrays/
```

### Example 2: Requesting a split

```
This subtopic has 10 problems. Generate File 1 (problems 1-4) now. 
I'll ask for File 2 (problems 5-7) and File 3 (problems 8-10) next.

[paste the full prompt with all 10 problems listed]
```

### Example 3: Requesting more depth on visualization

```
The visualization for problem 3 needs more detail. Specifically:
- Show the dp[] table being filled cell by cell
- Highlight which previous cells are being referenced for each computation
- Show the recurrence relation being applied at each step
- Display the optimal substructure (which subproblems contribute to current)
```

---

## FILE FORMAT CHEAT SHEET

```
# Problem Name                          ← H1 = problem separator
**Difficulty:** Hard                     ← auto-detected
**LeetCode:** https://...                ← auto-detected

## Description                           ← maps to: description field
## In-depth Explanation                  ← maps to: in_depth_explanation field
## Brute Force Intuition                 ← maps to: Brute Force → intuition
## Brute Force Step-by-Step Solution     ← maps to: Brute Force → in_depth_intuition
## Brute Force In-depth Intuition        ← maps to: Brute Force → in_depth_intuition (merged)
## Brute Force Algorithm                 ← maps to: Brute Force → algorithm
## Brute Force Code                      ← maps to: Brute Force → code
## Brute Force Complexity                ← maps to: Brute Force → time/space
## Brute Force Hints                     ← maps to: Brute Force → hints
## Brute Force Visualization             ← maps to: Brute Force → visualization_html
## Optimal Intuition                     ← maps to: Optimal → intuition
## Optimal Step-by-Step Solution         ← maps to: Optimal → in_depth_intuition
... (same pattern)

---                                      ← problem separator for bulk upload

# Next Problem Name
...
```

Heading keywords the parser recognizes:
- Approach: "brute force/brute/naive" → Brute Force, "better/improved" → Better, "optimal/efficient/best" → Optimal
- Sections: "intuition/core idea", "step-by-step/walkthrough/detailed solution", "algorithm/pseudocode", "code/implementation", "complexity/time and space", "hint/tips", "visualization/dry run", "description/problem statement", "in-depth explanation/deep explanation"
