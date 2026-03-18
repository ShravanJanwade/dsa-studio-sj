# DSA Studio — Problem Generation Prompt

Copy and customize the prompt below. Replace `[PROBLEM_NAME]` and `[PROBLEM_DETAILS]` with the actual problem.

---

## PROMPT FOR SINGLE PROBLEM (copy everything below the line)

---

Generate a complete DSA problem study file in markdown format for my study app. The file must follow this EXACT structure with these EXACT heading names. Every section must be thorough, in-depth, and interview-ready.

**Problem:** [PROBLEM_NAME]
**LeetCode/GFG link:** [LINK]

### FILE FORMAT RULES

1. The file is a single `.md` file
2. Use `## Heading` for section headers (double hash)
3. Put code inside triple backtick fences with language tag: ```java ... ```
4. Code MUST have proper indentation (4 spaces per level) — this is critical
5. Separate sections clearly
6. Use markdown formatting: **bold**, `inline code`, bullet lists
7. For every approach (Brute Force / Better / Optimal), include ALL sections listed below

### REQUIRED SECTIONS (in this exact order)

```
# [Problem Name]

**Difficulty:** [Easy/Medium/Hard]
**LeetCode:** [full URL]
**GFG:** [full URL if available]

## Description
[Complete problem statement. Include:]
- What the problem asks in plain English
- Input/output format with types
- All constraints (ranges, limits)
- 2-3 examples with input → output → explanation
- Edge cases to be aware of

## In-depth Explanation
[Detailed analysis. Include:]
- What the problem is REALLY asking (reframe in simpler terms)
- Real-world analogy if possible
- What data structure / pattern this maps to
- Why naive thinking fails and what insight is needed
- Overview of all approaches from brute to optimal
- Key edge cases and why they matter

## [Approach] Intuition
(where [Approach] is "Brute Force" or "Better" or "Optimal")
[Brief, clear core idea in 3-5 sentences. Answer: "What's the key insight?"]

## [Approach] Step-by-Step Solution
[In-depth walkthrough. This is the MOST IMPORTANT section. Include:]
- Start from scratch — assume the reader knows nothing about this approach
- Explain WHY each step is needed, not just WHAT
- Use a concrete example and trace through it manually
- Show how you'd arrive at this approach during an interview
- Explain any non-obvious decisions (why this data structure? why this order?)
- Address common mistakes and how to avoid them
- If there's a theorem/property being used (cut property, DFS tree property), explain it from first principles

## [Approach] Algorithm
[Pseudocode with proper indentation. Example:]
```
function solve(input):
    initialize data structures
    
    for each element in input:
        if condition:
            process(element)
            update state
        else:
            handle alternative
    
    return result
```
[After the pseudocode, explain each step briefly]

## [Approach] Code
```java
// Full, compilable Java code
// MUST have proper 4-space indentation
// Include comments for non-obvious lines
// Use descriptive variable names
// Follow LeetCode's function signature exactly

class Solution {
    public ReturnType methodName(Parameters) {
        // Your code with proper indentation
        for (int i = 0; i < n; i++) {
            if (condition) {
                doSomething();
                for (int j = 0; j < m; j++) {
                    // Nested indentation preserved
                    innerOperation();
                }
            }
        }
        return result;
    }
}
```

## [Approach] Complexity
Time: O(exact complexity with explanation)
Space: O(exact complexity with explanation)

## [Approach] Hints
- Hint 1: A gentle nudge toward the right direction (don't give away the answer)
- Hint 2: A more specific pointer
- Hint 3: Almost the answer but not quite
- Hint 4: The key insight stated clearly (for when they're truly stuck)

## [Approach] Visualization
[CRITICAL — This is the main feature. Generate a COMPLETE, self-contained HTML block with embedded CSS and JavaScript that creates an interactive dry-run visualization. Requirements:]
```
VISUALIZATION REQUIREMENTS:
1. Self-contained HTML with <style> and <script> tags
2. Dark theme (background: #111114, text: #e4e4e7)
3. Font: system-ui, sans-serif
4. Multiple test cases selectable via buttons at the top
5. Step-by-step controls: Prev, Next, Auto Play/Pause buttons
6. Visual graph/array/tree rendering using SVG or Canvas
7. Color coding:
   - Blue (#4f8ff7) for current/visiting elements
   - Green (#34d399) for completed/safe elements
   - Red (#f87171) for important findings (bridges, pivots, etc.)
   - Amber (#fbbf24) for elements being processed/compared
   - Gray (#3f3f46) for unvisited elements
8. A state display panel showing current variable values
9. An algorithm log showing each step as it executes
10. An explanation panel that describes what's happening at each step
11. At least 3 different test cases covering:
    - Basic/simple case
    - Complex case with the main insight visible
    - Edge case
12. Smooth transitions where possible
13. Node labels, array indices, and values clearly visible
14. For graph problems: nodes as circles, edges as lines, with labels
15. For array problems: boxes with values and index labels
16. For tree problems: proper tree layout with parent-child connections
```

Example visualization structure:
<div style="font-family:system-ui,sans-serif;color:#e4e4e7">
<style>
  /* Compact CSS for layout, buttons, colors */
  .wrap { max-width: 680px; }
  .tc-bar { display: flex; gap: 4px; margin-bottom: 10px; }
  .tc-bar button { padding: 4px 10px; font-size: 11px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: transparent; color: #a1a1aa; cursor: pointer; }
  .tc-bar button.active { background: rgba(79,143,247,0.15); color: #93c5fd; }
  .controls { display: flex; gap: 6px; align-items: center; margin-bottom: 12px; }
  .btn { padding: 5px 14px; font-size: 11px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: #1a1a20; color: #a1a1aa; cursor: pointer; }
  .btn:disabled { opacity: 0.3; }
  /* ... more styles ... */
</style>
<div class="wrap">
  <!-- Test case buttons -->
  <div class="tc-bar" id="tc-bar"></div>
  <!-- Controls -->
  <div class="controls">
    <button class="btn" onclick="prev()">Prev</button>
    <button class="btn" onclick="next()">Next</button>
    <button class="btn" onclick="toggleAuto()">Auto play</button>
    <span id="step-label" style="flex:1;text-align:center;font-size:11px;color:#71717a">Ready</span>
  </div>
  <!-- Visual area -->
  <div style="display:flex;gap:12px;flex-wrap:wrap">
    <div style="flex:1;min-width:250px;background:#141418;border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px">
      <svg id="viz-svg" width="100%" viewBox="0 0 360 240"></svg>
      <div id="state-display" style="font-family:monospace;font-size:11px;margin-top:8px;padding:8px;background:#0e0e12;border-radius:6px"></div>
    </div>
    <div style="flex:1;min-width:240px;background:#141418;border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px">
      <div id="log" style="font-family:monospace;font-size:10.5px;line-height:1.8;max-height:200px;overflow-y:auto"></div>
    </div>
  </div>
  <div id="explanation" style="margin-top:10px;padding:10px;background:#0e0e12;border-radius:8px;font-size:12px;line-height:1.6"></div>
</div>
<script>
// Test case definitions
const TEST_CASES = [
  { name: "Basic", /* data */ },
  { name: "Complex", /* data */ },
  { name: "Edge case", /* data */ },
];

// Step builder — precompute ALL steps for current test case
let steps = [], stepIdx = -1, autoInterval = null;

function buildSteps() {
  steps = [];
  // Simulate the algorithm step by step
  // Each step: { type, msg, state, highlights }
}

function render() {
  // Update SVG, log, state display, explanation
  // Use color coding for different states
}

function next() { if (stepIdx < steps.length-1) { stepIdx++; render(); } }
function prev() { if (stepIdx > 0) { stepIdx--; render(); } }
function toggleAuto() { /* start/stop interval */ }

// Initialize
buildSteps();
render();
</script>
</div>
```

IMPORTANT FOR VISUALIZATION:
- The HTML must be COMPLETELY self-contained (no external dependencies)
- It must work when pasted into an iframe with sandbox="allow-scripts"
- Test cases should be comprehensive — show different scenarios
- Every step should update: the visual, the state variables, the log, AND the explanation
- Make the dry run actually educational — someone watching it should understand the algorithm

### REPEAT FOR EACH APPROACH

Include ALL sections above for EACH approach present:
- **Brute Force**: Always include this. Even if trivial, explain why it's slow.
- **Better** (if applicable): Include only if there's a meaningful middle-ground approach.
- **Optimal**: Always include this. This is the interview answer.

---

## PROMPT FOR BULK UPLOAD (multiple problems in one file)

---

Generate a bulk DSA study file containing multiple problems for the subtopic: [SUBTOPIC_NAME]

Problems to include:
1. [Problem 1 name] — [Difficulty] — [LeetCode link]
2. [Problem 2 name] — [Difficulty] — [LeetCode link]
...

### FORMAT RULES FOR BULK FILE

1. Separate each problem with a line containing only `---` (three dashes)
2. Each problem follows the EXACT same structure as the single problem format above
3. Every problem must have at minimum: Description, In-depth Explanation, and at least one approach with Intuition + Step-by-Step + Algorithm + Code + Complexity + Hints
4. Include Visualization HTML for at least the first 3 most complex problems
5. Code must have proper 4-space indentation inside ```java blocks

```
# Problem One Name

**Difficulty:** Medium
**LeetCode:** https://leetcode.com/problems/...

## Description
...

## In-depth Explanation
...

## Optimal Intuition
...

## Optimal Step-by-Step Solution
...

## Optimal Algorithm
...

## Optimal Code
```java
class Solution {
    // properly indented code
}
```

## Optimal Complexity
Time: O(...)
Space: O(...)

## Optimal Hints
- ...

---

# Problem Two Name
...
```

### QUALITY CHECKLIST

Before finishing, verify:
- [ ] Every code block has correct 4-space indentation
- [ ] Every approach has ALL required sections
- [ ] Step-by-Step Solution actually walks through with a concrete example
- [ ] Complexity is explained, not just stated (WHY is it O(n log n)?)
- [ ] Hints are progressive (easy → medium → nearly-the-answer)
- [ ] Description includes constraints and examples
- [ ] In-depth Explanation reframes the problem and discusses approach strategy
- [ ] Visualization HTML is self-contained and has 3+ test cases with step controls
- [ ] Problems are separated by `---`
- [ ] Code follows LeetCode's exact function signature

---

## EXAMPLE: How to request a specific problem

"Generate a complete DSA study file for **Number of Islands** (LeetCode 200, Medium). Include Brute Force (DFS for each cell) and Optimal (Union-Find) approaches. For each approach, include full intuition, step-by-step walkthrough with a 4x5 grid example, pseudocode with indentation, Java code, complexity analysis, 4 progressive hints, and an interactive HTML visualization showing the grid being processed cell by cell with BFS/DFS coloring and component counting."

---

## EXAMPLE: How to request a bulk subtopic

"Generate a bulk upload file for the **Binary Search** subtopic containing these problems:
1. Binary Search (Easy) — LC 704
2. Search Insert Position (Easy) — LC 35
3. Find First and Last Position (Medium) — LC 34
4. Search in Rotated Sorted Array (Medium) — LC 33
5. Median of Two Sorted Arrays (Hard) — LC 4

For each problem include Brute Force and Optimal solutions with all sections. Include interactive visualizations for problems 3, 4, and 5. Separate problems with ---."
