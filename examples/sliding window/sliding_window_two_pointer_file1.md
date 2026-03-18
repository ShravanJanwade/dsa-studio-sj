# Longest Substring Without Repeating Characters

**Difficulty:** Medium
**LeetCode:** https://leetcode.com/problems/longest-substring-without-repeating-characters/
**GFG:** https://www.geeksforgeeks.org/length-of-the-longest-substring-without-repeating-characters/

## Description

Given a string `s`, find the length of the **longest substring** without repeating characters. A substring is a contiguous sequence of characters within the string.

**Input:** A string `s` consisting of English letters, digits, symbols, and spaces.
**Output:** An integer representing the length of the longest substring with all unique characters.

**Constraints:**
- `0 <= s.length <= 5 * 10^4`
- `s` consists of English letters, digits, symbols, and spaces.

**Example 1:**
Input: `s = "abcabcbb"`
Output: `3`
Explanation: The longest substring without repeating characters is `"abc"`, which has length 3. Starting from index 0, we have 'a','b','c' all unique. At index 3, 'a' repeats, so the window must shrink.

**Example 2:**
Input: `s = "bbbbb"`
Output: `1`
Explanation: Every character is 'b', so the longest substring with unique characters is just `"b"` with length 1.

**Example 3:**
Input: `s = "pwwkew"`
Output: `3`
Explanation: The longest substring is `"wke"` (length 3). Note that `"pwke"` is a subsequence, not a substring — it must be contiguous.

**Edge Cases:**
- Empty string → return 0
- All unique characters → return length of entire string
- All same characters → return 1
- Single character → return 1

## In-depth Explanation

**Reframe:** You're looking for the longest contiguous window within the string where every character appears at most once.

**Pattern recognition:** This is a classic **sliding window** problem. The keywords are "longest substring" and "without repeating" — whenever you see "longest/shortest subarray/substring" with a constraint, think sliding window. The constraint here is uniqueness of characters.

**Real-world analogy:** Imagine you're reading a book and highlighting a passage. You want the longest highlighted section where no word appears twice. As you extend your highlight to the right, the moment you see a repeated word, you must pull the left edge of the highlight forward past the previous occurrence of that word.

**Why naive fails:** A brute force approach checks every possible substring (O(n²) substrings) and verifies uniqueness for each (O(n) per check), yielding O(n³). For n = 50,000, this is ~125 trillion operations — far too slow.

**Approach roadmap:**
- **Brute Force:** Check every pair (i, j) and verify all characters in s[i..j] are unique → O(n³)
- **Optimal (Sliding Window + HashMap):** Maintain a window [left, right] expanding right, shrinking left when a duplicate is found, using a map to track last seen positions → O(n)

**Interview cheat sheet:**
- **Keywords:** "longest substring", "without repeating", "unique characters", "contiguous"
- **What makes this different:** Unlike problems with a numeric constraint (sum ≤ k), the constraint here is character uniqueness, so we track last-seen indices rather than a running sum
- **The "aha moment":** When you see a repeated character, you don't shrink one-by-one — you jump `left` directly to `lastSeen[char] + 1`
- **Memory hook:** "Expand right, jump left past the last duplicate"

## Brute Force Intuition

For every possible starting index `i`, try every ending index `j ≥ i`. For each substring `s[i..j]`, check if all characters are unique using a HashSet. Track the maximum length among all valid substrings.

## Brute Force Step-by-Step Solution

Let's trace through `s = "abcabcbb"`.

**Step 1: Outer loop i=0, inner loop starts j=0**

Code executing: `for (int i = 0; i < n; i++)`

We begin with i=0. For each i, we'll try all possible ending positions j from i to n-1. We create a fresh HashSet for this starting position.
- i = 0
- set = {} (empty)
- maxLen = 0

**Step 2: Inner loop j=0, character 'a'**

Code executing: `if (set.contains(s.charAt(j))) break;`

We check if 'a' is in the set. Set is empty, so no duplicate. We add 'a' to the set and update maxLen.
- set = {'a'}
- current window length = j - i + 1 = 1
- maxLen = max(0, 1) = 1

**Step 3: Inner loop j=1, character 'b'**

Code executing: `set.add(s.charAt(j)); maxLen = Math.max(maxLen, j - i + 1);`

'b' is not in set. Add it. Window "ab" has length 2.
- set = {'a', 'b'}
- maxLen = max(1, 2) = 2

**Step 4: Inner loop j=2, character 'c'**

'c' is not in set. Add it. Window "abc" has length 3.
- set = {'a', 'b', 'c'}
- maxLen = max(2, 3) = 3

**Step 5: Inner loop j=3, character 'a'**

Code executing: `if (set.contains(s.charAt(j))) break;`

'a' IS in the set. We break out of the inner loop. The longest substring starting at i=0 is "abc" with length 3.

**Step 6: Outer loop i=1, fresh set, j starts at 1**

We reset the set and try starting from index 1. We process 'b', 'c', 'a', 'b' — at j=4, 'b' is already in {'b','c','a'}, so we break. Longest from i=1 is "bca" with length 3.
- maxLen remains 3

**Steps 7-14: Continue for i=2 through i=7**

Each starting position explores rightward until a duplicate is found. No window exceeds length 3. For i=3: "abcb" fails at 'b'. For i=4: "bcbb" fails at 'b'. For i=7: just "b", length 1.

**Final:** maxLen = 3.

**Correctness argument:** We exhaustively check every possible substring, so we cannot miss the optimal one. The HashSet correctly detects duplicates within each window.

**Key invariant:** For each (i, j) pair, the set contains exactly the characters in s[i..j], and we only update maxLen when all are unique.

**Common mistakes:**
1. Forgetting to reset the HashSet for each new starting index `i` — this causes false duplicate detections across different windows.
2. Using `j - i` instead of `j - i + 1` for window length — off-by-one error that under-counts by 1.

**30-second interview pitch:** "I check every substring by fixing a start index, extending right until I hit a duplicate, then moving the start forward. I use a set to track characters in the current window. It's O(n³) worst case since each substring check costs O(n)."

## Brute Force In-depth Intuition

The brute force exploits the simplest possible observation: a valid answer is some substring s[i..j]. There are O(n²) such substrings. For each, we verify uniqueness in O(n) time. We could optimize the inner check to O(1) amortized using a HashSet that grows with j, but the outer two loops still dominate at O(n²). The key weakness is redundancy — when we move from i to i+1, we throw away all the work from the previous window and start fresh. The sliding window approach eliminates this waste by reusing the window state.

## Brute Force Algorithm

```
function lengthOfLongestSubstring(s):
    n = length(s)
    maxLen = 0
    for i from 0 to n-1:
        set = empty HashSet
        for j from i to n-1:
            if s[j] is in set:
                break
            add s[j] to set
            maxLen = max(maxLen, j - i + 1)
    return maxLen
```

The outer loop fixes the left boundary. The inner loop extends the right boundary one character at a time. When a duplicate is detected, we stop extending (any further extension also contains the duplicate). We track the maximum valid window size seen.

## Brute Force Code

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        int n = s.length();
        int maxLen = 0;
        for (int i = 0; i < n; i++) {
            HashSet<Character> set = new HashSet<>();
            for (int j = i; j < n; j++) {
                if (set.contains(s.charAt(j))) {
                    break; // duplicate found, no point extending further
                }
                set.add(s.charAt(j));
                maxLen = Math.max(maxLen, j - i + 1);
            }
        }
        return maxLen;
    }
}
```

## Brute Force Complexity

**Time: O(n²)** — The outer loop runs n times. For each, the inner loop runs at most n times. The HashSet operations (contains, add) are O(1) amortized. So total is O(n²). Note: some analyses say O(n³) if you rebuild the set each time, but with early break and set reuse per starting index, it's O(n²).

**Space: O(min(n, m))** — Where m is the character set size (128 for ASCII). The HashSet stores at most min(n, m) characters.

## Brute Force Hints

1. What's the simplest way to check all possible substrings? Fix a start and extend the end.
2. How do you efficiently check if a character already exists in the current window? Think HashSet.
3. Once you find a duplicate, do you need to keep extending? No — break early.
4. Can you compute the window length from just the two indices? Yes: `j - i + 1`.
5. What resets between different starting positions? The set of seen characters.

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz1a-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz1a-grid{grid-template-columns:1fr}}
.viz1a-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz1a-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz1a-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz1a-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz1a-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz1a-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz1a-btn:disabled{opacity:0.3}
.viz1a-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>

<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar1a"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz1a-btn" id="prev1a" onclick="prev1a()">← Prev</button>
  <button class="viz1a-btn" id="next1a" onclick="next1a()">Next →</button>
  <button class="viz1a-btn" id="auto1a" onclick="toggleAuto1a()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel1a">Ready</span>
</div>

<div class="viz1a-grid">
  <div>
    <div class="viz1a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Array & Window</div>
      <svg id="svg1a" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz1a-state" id="state1a"></div>
    <div class="viz1a-code" id="code1a"></div>
  </div>
  <div>
    <div class="viz1a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz1a-log" id="log1a"></div>
    </div>
    <div class="viz1a-expl" id="expl1a"></div>
  </div>
</div>

<script>
const TCS_1a = [
    { name: "abcabcbb", data: "abcabcbb" },
    { name: "bbbbb", data: "bbbbb" },
    { name: "pwwkew", data: "pwwkew" }
];

let steps1a = [], stepIdx1a = -1, autoInt1a = null, tcIdx1a = 0;

const CODE_LINES_1a = [
    "for i from 0 to n-1:",
    "    set = new HashSet()",
    "    for j from i to n-1:",
    "        if set.contains(s[j]): break",
    "        set.add(s[j])",
    "        maxLen = max(maxLen, j-i+1)",
    "return maxLen"
];

function buildSteps1a(tc) {
    steps1a = [];
    const s = tc.data;
    const n = s.length;
    let maxLen = 0;
    steps1a.push({ msg: "Initialize maxLen=0", highlights: {}, labels: {}, vars: { i: "-", j: "-", "s[j]": "-", set: "{}", maxLen: 0 }, changed: new Set(["maxLen"]), codeLine: -1, explanation: "We start by initializing maxLen to 0. We'll iterate over all starting positions." });
    for (let i = 0; i < n; i++) {
        const set = new Set();
        const hl = {}; const lb = {};
        lb[i] = "i";
        steps1a.push({ msg: `i=${i}: start new window`, highlights: hl, labels: {...lb}, vars: { i, j: "-", "s[j]": "-", set: "{}", maxLen }, changed: new Set(["i","set"]), codeLine: 0, explanation: `Outer loop: fix left boundary at i=${i}. Create a fresh empty HashSet for this starting position.` });
        let broke = false;
        for (let j = i; j < n; j++) {
            const ch = s[j];
            const hlJ = {};
            for (let k = i; k <= j; k++) hlJ[k] = k === j ? '#4f8ff7' : '#2563eb';
            const lbJ = {}; lbJ[i] = "i"; lbJ[j] = j === i ? "i,j" : "j";
            if (set.has(ch)) {
                steps1a.push({ msg: `i=${i},j=${j}: '${ch}' in set → BREAK`, highlights: {...hlJ, [j]: '#ef4444'}, labels: {...lbJ}, vars: { i, j, "s[j]": `'${ch}'`, set: "{" + [...set].map(c=>"'"+c+"'").join(",") + "}", maxLen }, changed: new Set(["j","s[j]"]), codeLine: 3, explanation: `Character '${ch}' at j=${j} is already in the set. A duplicate is found, so we break out of the inner loop. The longest valid substring starting at i=${i} has been found.` });
                broke = true;
                break;
            }
            set.add(ch);
            maxLen = Math.max(maxLen, j - i + 1);
            const oldMax = maxLen - (j - i + 1 === maxLen ? 0 : 0);
            steps1a.push({ msg: `i=${i},j=${j}: add '${ch}', len=${j-i+1}`, highlights: hlJ, labels: {...lbJ}, vars: { i, j, "s[j]": `'${ch}'`, set: "{" + [...set].map(c=>"'"+c+"'").join(",") + "}", maxLen }, changed: new Set(["j","s[j]","set","maxLen"]), codeLine: 5, explanation: `Character '${ch}' is NOT in the set. Add it. Current window is s[${i}..${j}] = "${s.substring(i,j+1)}" with length ${j-i+1}. Update maxLen = max(maxLen, ${j-i+1}) = ${maxLen}.` });
            if(steps1a.length > 60) { broke = true; break; }
        }
        if(steps1a.length > 60) break;
    }
    steps1a.push({ msg: `Done! maxLen = ${maxLen}`, highlights: {}, labels: {}, vars: { i: "done", j: "done", "s[j]": "-", set: "-", maxLen }, changed: new Set(["maxLen"]), codeLine: 6, explanation: `All starting positions have been tried. The longest substring without repeating characters has length ${maxLen}.` });
    stepIdx1a = 0;
}

function render1a() {
    const s = steps1a[stepIdx1a];
    if (!s) return;
    const arr = TCS_1a[tcIdx1a].data.split('');
    const boxW = 48, boxH = 40, gap = 4, startX = 20, startY = 30;
    let svg = '';
    arr.forEach((val, i) => {
        const x = startX + i * (boxW + gap);
        svg += `<text x="${x + boxW/2}" y="${startY - 8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;
        const color = s.highlights[i] || '#2a2a33';
        const tc = s.highlights[i] ? '#fafaf9' : '#a1a1aa';
        svg += `<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;
        svg += `<text x="${x + boxW/2}" y="${startY + boxH/2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;
    });
    if (s.labels) {
        Object.entries(s.labels).forEach(([idx, label]) => {
            const x = startX + parseInt(idx) * (boxW + gap);
            svg += `<text x="${x + boxW/2}" y="${startY + boxH + 16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;
        });
    }
    document.getElementById('svg1a').innerHTML = svg;

    let stHtml = '<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';
    Object.entries(s.vars).forEach(([name, value]) => {
        const ch = s.changed.has(name);
        const bg = ch ? 'rgba(251,191,36,0.1)' : 'transparent';
        const nc = ch ? '#fbbf24' : '#52525b';
        const vc = ch ? '#fbbf24' : '#b8b8be';
        stHtml += `<tr style="background:${bg}"><td style="padding:4px 10px;color:${nc};font-weight:600;width:40%">${name}</td><td style="padding:4px 10px;color:${vc}">${value}${ch?' ← changed':''}</td></tr>`;
    });
    stHtml += '</table>';
    document.getElementById('state1a').innerHTML = stHtml;

    let cHtml = '';
    CODE_LINES_1a.forEach((line, i) => {
        const act = i === s.codeLine;
        cHtml += `<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;
    });
    document.getElementById('code1a').innerHTML = cHtml;

    let logHtml = '';
    for (let i = 0; i <= stepIdx1a; i++) {
        const marker = i === stepIdx1a ? '▶ ' : '  ';
        logHtml += `<div style="color:${i===stepIdx1a?'#93c5fd':'#52525b'}">${marker}${steps1a[i].msg}</div>`;
    }
    document.getElementById('log1a').innerHTML = logHtml;
    document.getElementById('log1a').scrollTop = 99999;
    document.getElementById('expl1a').innerHTML = s.explanation;
    document.getElementById('stepLabel1a').textContent = `Step ${stepIdx1a + 1} / ${steps1a.length}`;
    document.getElementById('prev1a').disabled = stepIdx1a <= 0;
    document.getElementById('next1a').disabled = stepIdx1a >= steps1a.length - 1;
}

function next1a() { if (stepIdx1a < steps1a.length - 1) { stepIdx1a++; render1a(); } }
function prev1a() { if (stepIdx1a > 0) { stepIdx1a--; render1a(); } }
function toggleAuto1a() {
    if (autoInt1a) { clearInterval(autoInt1a); autoInt1a = null; document.getElementById('auto1a').textContent = '▶ Auto'; }
    else { autoInt1a = setInterval(() => { if (stepIdx1a >= steps1a.length - 1) { toggleAuto1a(); return; } next1a(); }, 800); document.getElementById('auto1a').textContent = '⏸ Pause'; }
}
function loadTc1a(idx) {
    tcIdx1a = idx; stepIdx1a = 0;
    buildSteps1a(TCS_1a[idx]);
    document.querySelectorAll('[data-tc1a]').forEach((b, i) => { b.className = i === idx ? 'viz1a-btn active' : 'viz1a-btn'; });
    render1a();
}

const tcBar1a = document.getElementById('tcBar1a');
TCS_1a.forEach((tc, i) => {
    const b = document.createElement('button');
    b.textContent = tc.name;
    b.className = i === 0 ? 'viz1a-btn active' : 'viz1a-btn';
    b.setAttribute('data-tc1a', '');
    b.onclick = () => loadTc1a(i);
    tcBar1a.appendChild(b);
});
buildSteps1a(TCS_1a[0]); render1a();
</script>
</div>

## Optimal Intuition

Maintain a sliding window [left, right] over the string. Expand `right` one character at a time. Use a HashMap to store the last-seen index of each character. When `right` encounters a character already in the window, jump `left` to `max(left, lastSeen[char] + 1)` — directly past the previous occurrence. This way, each character is processed at most twice (once by `right`, once by `left`), giving O(n) time.

## Optimal Step-by-Step Solution

Let's trace through `s = "abcabcbb"` using the sliding window approach.

**Step 1: Initialize variables**

Code executing: `int left = 0, maxLen = 0; HashMap<Character, Integer> map = new HashMap<>();`

We set up our window starting at left=0. The map will store each character's most recent index. maxLen tracks our best answer.
- left = 0, right = 0 (about to start), maxLen = 0, map = {}

**Step 2: right=0, character 'a'**

Code executing: `map.put(s.charAt(right), right);`

We check if 'a' is in the map. It's not (map is empty), so left stays at 0. We put 'a' → 0 in the map. Window is "a", length = 0 - 0 + 1 = 1.
- left = 0, right = 0, map = {'a':0}, maxLen = max(0, 1) = 1

**Step 3: right=1, character 'b'**

'b' is not in the map. left stays at 0. Put 'b' → 1. Window is "ab", length = 2.
- left = 0, right = 1, map = {'a':0, 'b':1}, maxLen = max(1, 2) = 2

**Step 4: right=2, character 'c'**

'c' is not in the map. Put 'c' → 2. Window is "abc", length = 3.
- left = 0, right = 2, map = {'a':0, 'b':1, 'c':2}, maxLen = 3

**Step 5: right=3, character 'a'**

Code executing: `if (map.containsKey(ch)) left = Math.max(left, map.get(ch) + 1);`

'a' IS in the map at index 0. We must move left to max(0, 0+1) = 1. This jumps past the previous 'a'. Update map: 'a' → 3. Window is now "bca" (indices 1-3), length = 3.
- left = 1 (was 0) ← changed
- right = 3, map = {'a':3, 'b':1, 'c':2}, maxLen = max(3, 3) = 3

Why this matters: Instead of shrinking left one-by-one (which would be O(n²)), we jump directly to the position after the duplicate. This is the key insight that makes the algorithm O(n).

**Step 6: right=4, character 'b'**

'b' is in the map at index 1. left = max(1, 1+1) = 2. Update 'b' → 4. Window is "cab" (indices 2-4), length = 3.
- left = 2 (was 1), right = 4, map = {'a':3, 'b':4, 'c':2}, maxLen = 3

**Step 7: right=5, character 'c'**

'c' is in the map at index 2. left = max(2, 2+1) = 3. Update 'c' → 5. Window is "abc" (indices 3-5), length = 3.
- left = 3 (was 2), right = 5, map = {'a':3, 'b':4, 'c':5}, maxLen = 3

**Step 8: right=6, character 'b'**

'b' is in the map at index 4. left = max(3, 4+1) = 5. Update 'b' → 6. Window is "cb" (indices 5-6), length = 2.
- left = 5, right = 6, maxLen = 3 (unchanged, 2 < 3)

**Step 9: right=7, character 'b'**

'b' is in the map at index 6. left = max(5, 6+1) = 7. Update 'b' → 7. Window is "b" (index 7), length = 1.
- left = 7, right = 7, maxLen = 3

**Final:** Return maxLen = 3.

**Correctness argument:** The window [left, right] always contains unique characters because whenever we encounter a duplicate, we move left past the previous occurrence. The `max` operation ensures left never moves backward (critical when map contains stale entries from before the current window).

**Key invariant:** At every moment, s[left..right] contains no duplicate characters, and map[ch] stores the most recent index of character ch.

**Common mistakes:**
1. Using `left = map.get(ch) + 1` without `Math.max` — this can move left BACKWARD if the duplicate is from before the current window (e.g., "abba").
2. Not updating the map after moving left — you must always update map[ch] = right regardless of whether a duplicate was found.

**30-second interview pitch:** "I use a sliding window with a hashmap tracking each character's last index. I expand right each step. If the character already exists in my window, I jump left past its last occurrence. This ensures O(n) time since each index is visited at most twice."

## Optimal In-depth Intuition

The mathematical property we exploit is that if s[left..right] has a duplicate, then s[left..right+1], s[left..right+2], etc. also have that duplicate. So there's no point checking longer windows with the same left boundary — we must advance left. Furthermore, we can advance it directly to the position after the duplicate (not one-by-one), because any intermediate position would still include the duplicate.

The `Math.max(left, map.get(ch) + 1)` is subtle but critical. Consider "abba": when right reaches the second 'a' at index 3, map['a'] = 0. But left is already at 2 (moved past 'b'). Without the max, we'd set left = 1, moving it backward and including the duplicate 'b'. The max ensures monotonicity of left.

This pattern (expand right, conditionally shrink left, track with a map) generalizes to many sliding window problems: "longest substring with at most K distinct characters", "minimum window substring", etc.

## Optimal Algorithm

```
function lengthOfLongestSubstring(s):
    map = empty HashMap<Character, Integer>
    left = 0
    maxLen = 0
    for right from 0 to n-1:
        ch = s[right]
        if ch exists in map:
            left = max(left, map[ch] + 1)
        map[ch] = right
        maxLen = max(maxLen, right - left + 1)
    return maxLen
```

The loop processes each character exactly once with `right`. When a duplicate is found, `left` jumps forward. The map is always updated to reflect the latest index of each character. The window [left, right] is always valid (no duplicates).

## Optimal Code

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            if (map.containsKey(ch)) {
                left = Math.max(left, map.get(ch) + 1); // jump past duplicate
            }
            map.put(ch, right); // always update latest position
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
```

## Optimal Complexity

**Time: O(n)** — The `right` pointer traverses the string once (n iterations). The `left` pointer only moves forward, never backward. HashMap operations are O(1) amortized. Total: O(n).

**Space: O(min(n, m))** — Where m is the size of the character set (128 for ASCII, 256 for extended ASCII). The HashMap stores at most one entry per unique character. In the worst case (all unique), this is min(n, m).

## Optimal Hints

1. Can you avoid re-scanning the window when a duplicate appears? Think about storing WHERE you last saw each character.
2. When you find a duplicate at position `right`, where exactly should `left` move to?
3. Why might simply setting `left = map.get(ch) + 1` be wrong? Consider "abba".
4. The key insight: `left` should only ever move forward, never backward.
5. You don't need to remove old entries from the map — the `Math.max` handles stale entries.
6. Each character is processed exactly once by `right`. Left jumps forward but never revisits.

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz1b-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz1b-grid{grid-template-columns:1fr}}
.viz1b-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz1b-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz1b-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz1b-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz1b-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz1b-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz1b-btn:disabled{opacity:0.3}
.viz1b-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>

<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar1b"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz1b-btn" id="prev1b" onclick="prev1b()">← Prev</button>
  <button class="viz1b-btn" id="next1b" onclick="next1b()">Next →</button>
  <button class="viz1b-btn" id="auto1b" onclick="toggleAuto1b()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel1b">Ready</span>
</div>

<div class="viz1b-grid">
  <div>
    <div class="viz1b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Sliding Window</div>
      <svg id="svg1b" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz1b-state" id="state1b"></div>
    <div class="viz1b-code" id="code1b"></div>
  </div>
  <div>
    <div class="viz1b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz1b-log" id="log1b"></div>
    </div>
    <div class="viz1b-expl" id="expl1b"></div>
  </div>
</div>

<script>
const TCS_1b = [
    { name: "abcabcbb", data: "abcabcbb" },
    { name: "bbbbb", data: "bbbbb" },
    { name: "abba", data: "abba" }
];

let steps1b = [], stepIdx1b = -1, autoInt1b = null, tcIdx1b = 0;

const CODE_LINES_1b = [
    "for right from 0 to n-1:",
    "    ch = s[right]",
    "    if ch in map:",
    "        left = max(left, map[ch]+1)",
    "    map[ch] = right",
    "    maxLen = max(maxLen, right-left+1)",
    "return maxLen"
];

function buildSteps1b(tc) {
    steps1b = [];
    const s = tc.data;
    const n = s.length;
    let left = 0, maxLen = 0;
    const map = {};
    steps1b.push({ msg: "Init: left=0, maxLen=0, map={}", left, right: -1, highlights: {}, labels: {}, vars: { left: 0, right: "-", ch: "-", "map": "{}", maxLen: 0, window: '""' }, changed: new Set(["left","maxLen"]), codeLine: -1, explanation: "Initialize the sliding window. left=0 marks the start of our window. The HashMap is empty. We'll expand right one character at a time." });

    for (let right = 0; right < n; right++) {
        const ch = s[right];
        let oldLeft = left;
        const mapStr = () => "{" + Object.entries(map).map(([k,v])=>`'${k}':${v}`).join(", ") + "}";

        if (ch in map && map[ch] >= left) {
            left = Math.max(left, map[ch] + 1);
            const hl = {};
            for (let k = left; k <= right; k++) hl[k] = '#2563eb';
            hl[right] = '#4f8ff7';
            if (oldLeft < left) for (let k = oldLeft; k < left; k++) hl[k] = '#ef4444';
            const lb = {}; lb[left] = "left"; lb[right] = right===left ? "L,R" : "right";
            steps1b.push({ msg: `r=${right}: '${ch}' duplicate! left ${oldLeft}→${left}`, left, right, highlights: hl, labels: lb, vars: { left, right, ch: `'${ch}'`, map: mapStr(), maxLen, window: `"${s.substring(left,right+1)}"` }, changed: new Set(["left","right","ch","window"]), codeLine: 3, explanation: `Character '${ch}' at right=${right} was last seen at index ${map[ch]}. Since ${map[ch]} >= old left (${oldLeft}), we have a duplicate in our window! Move left from ${oldLeft} to ${map[ch]+1} = ${left}. This jumps past the previous '${ch}'.` });
        } else {
            const hl = {};
            for (let k = left; k <= right; k++) hl[k] = '#2563eb';
            hl[right] = '#22c55e';
            const lb = {}; lb[left] = "left"; lb[right] = right===left ? "L,R" : "right";
            steps1b.push({ msg: `r=${right}: '${ch}' new, window="${s.substring(left,right+1)}"`, left, right, highlights: hl, labels: lb, vars: { left, right, ch: `'${ch}'`, map: mapStr(), maxLen, window: `"${s.substring(left,right+1)}"` }, changed: new Set(["right","ch","window"]), codeLine: 1, explanation: `Character '${ch}' is either not in the map or its last index is before our window. Safe to include! Window expands to "${s.substring(left,right+1)}".` });
        }

        map[ch] = right;
        maxLen = Math.max(maxLen, right - left + 1);
        const hl2 = {};
        for (let k = left; k <= right; k++) hl2[k] = '#2563eb';
        hl2[right] = '#4f8ff7';
        const lb2 = {}; lb2[left] = "left"; lb2[right] = right===left ? "L,R" : "right";
        steps1b.push({ msg: `r=${right}: update map, maxLen=${maxLen}`, left, right, highlights: hl2, labels: lb2, vars: { left, right, ch: `'${ch}'`, map: mapStr(), maxLen, window: `"${s.substring(left,right+1)}"` }, changed: new Set(["map","maxLen"]), codeLine: 5, explanation: `Update map['${ch}'] = ${right}. Window "${s.substring(left,right+1)}" has length ${right-left+1}. maxLen = max(${maxLen === right-left+1 ? maxLen : maxLen}, ${right-left+1}) = ${maxLen}.` });
    }
    steps1b.push({ msg: `Done! Answer = ${maxLen}`, left, right: n-1, highlights: {}, labels: {}, vars: { left, right: "done", ch: "-", map: "{...}", maxLen, window: "-" }, changed: new Set(["maxLen"]), codeLine: 6, explanation: `All characters processed. The longest substring without repeating characters has length ${maxLen}.` });
    stepIdx1b = 0;
}

function render1b() {
    const s = steps1b[stepIdx1b];
    if (!s) return;
    const arr = TCS_1b[tcIdx1b].data.split('');
    const boxW = 48, boxH = 40, gap = 4, startX = 20, startY = 30;
    let svg = '';
    arr.forEach((val, i) => {
        const x = startX + i * (boxW + gap);
        svg += `<text x="${x + boxW/2}" y="${startY - 8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;
        const color = s.highlights[i] || '#2a2a33';
        const tc = s.highlights[i] ? '#fafaf9' : '#a1a1aa';
        svg += `<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;
        svg += `<text x="${x + boxW/2}" y="${startY + boxH/2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;
    });
    if (s.labels) {
        Object.entries(s.labels).forEach(([idx, label]) => {
            const x = startX + parseInt(idx) * (boxW + gap);
            svg += `<text x="${x + boxW/2}" y="${startY + boxH + 16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;
        });
    }
    document.getElementById('svg1b').innerHTML = svg;

    let stHtml = '<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';
    Object.entries(s.vars).forEach(([name, value]) => {
        const ch = s.changed.has(name);
        const bg = ch ? 'rgba(251,191,36,0.1)' : 'transparent';
        const nc = ch ? '#fbbf24' : '#52525b';
        const vc = ch ? '#fbbf24' : '#b8b8be';
        stHtml += `<tr style="background:${bg}"><td style="padding:4px 10px;color:${nc};font-weight:600;width:40%">${name}</td><td style="padding:4px 10px;color:${vc}">${value}${ch?' ← changed':''}</td></tr>`;
    });
    stHtml += '</table>';
    document.getElementById('state1b').innerHTML = stHtml;

    let cHtml = '';
    CODE_LINES_1b.forEach((line, i) => {
        const act = i === s.codeLine;
        cHtml += `<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;
    });
    document.getElementById('code1b').innerHTML = cHtml;

    let logHtml = '';
    for (let i = 0; i <= stepIdx1b; i++) {
        const marker = i === stepIdx1b ? '▶ ' : '  ';
        logHtml += `<div style="color:${i===stepIdx1b?'#93c5fd':'#52525b'}">${marker}${steps1b[i].msg}</div>`;
    }
    document.getElementById('log1b').innerHTML = logHtml;
    document.getElementById('log1b').scrollTop = 99999;
    document.getElementById('expl1b').innerHTML = s.explanation;
    document.getElementById('stepLabel1b').textContent = `Step ${stepIdx1b + 1} / ${steps1b.length}`;
    document.getElementById('prev1b').disabled = stepIdx1b <= 0;
    document.getElementById('next1b').disabled = stepIdx1b >= steps1b.length - 1;
}

function next1b() { if (stepIdx1b < steps1b.length - 1) { stepIdx1b++; render1b(); } }
function prev1b() { if (stepIdx1b > 0) { stepIdx1b--; render1b(); } }
function toggleAuto1b() {
    if (autoInt1b) { clearInterval(autoInt1b); autoInt1b = null; document.getElementById('auto1b').textContent = '▶ Auto'; }
    else { autoInt1b = setInterval(() => { if (stepIdx1b >= steps1b.length - 1) { toggleAuto1b(); return; } next1b(); }, 800); document.getElementById('auto1b').textContent = '⏸ Pause'; }
}
function loadTc1b(idx) {
    tcIdx1b = idx; stepIdx1b = 0;
    buildSteps1b(TCS_1b[idx]);
    document.querySelectorAll('[data-tc1b]').forEach((b, i) => { b.className = i === idx ? 'viz1b-btn active' : 'viz1b-btn'; });
    render1b();
}

const tcBar1b = document.getElementById('tcBar1b');
TCS_1b.forEach((tc, i) => {
    const b = document.createElement('button');
    b.textContent = tc.name;
    b.className = i === 0 ? 'viz1b-btn active' : 'viz1b-btn';
    b.setAttribute('data-tc1b', '');
    b.onclick = () => loadTc1b(i);
    tcBar1b.appendChild(b);
});
buildSteps1b(TCS_1b[0]); render1b();
</script>
</div>

---

# Max Consecutive Ones III

**Difficulty:** Medium
**LeetCode:** https://leetcode.com/problems/max-consecutive-ones-iii/
**GFG:** https://www.geeksforgeeks.org/max-consecutive-ones-iii/

## Description

Given a binary array `nums` and an integer `k`, return the maximum number of consecutive 1's in the array if you can flip at most `k` 0's.

**Input:** An integer array `nums` containing only 0s and 1s, and an integer `k`.
**Output:** The maximum number of consecutive 1's achievable after flipping at most k zeros.

**Constraints:**
- `1 <= nums.length <= 10^5`
- `nums[i]` is either `0` or `1`
- `0 <= k <= nums.length`

**Example 1:**
Input: `nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2`
Output: `6`
Explanation: Flip the zeros at positions 5 and 10 (0-indexed). The resulting array is [1,1,1,0,0,**1**,1,1,1,1,**1**], and the longest consecutive 1's run is indices 5-10, length 6.

**Example 2:**
Input: `nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3`
Output: `10`
Explanation: Flip zeros at positions 4, 5, and 9. The longest consecutive run of 1's becomes length 10.

**Edge Cases:**
- All 1's → return nums.length (no flips needed)
- All 0's → return k (flip k of them)
- k = 0 → find the longest existing run of 1's
- k ≥ number of 0's → return nums.length

## In-depth Explanation

**Reframe:** Find the longest subarray that contains at most k zeros. "Flipping at most k zeros" is equivalent to "allowing at most k zeros in a contiguous window."

**Pattern recognition:** This is a **sliding window** problem with a constraint on a count within the window. Keywords: "consecutive", "at most k flips", "maximum length" — all point to sliding window where the window is valid as long as zero-count ≤ k.

**Real-world analogy:** Imagine a conveyor belt of light bulbs (1=on, 0=off). You have k spare bulbs to replace broken ones. You want to find the longest continuous stretch you can light up. Slide a window along the belt, and when you've used all k replacements, shrink the window from the left until you free up a replacement.

**Why naive fails:** Brute force checks every subarray and counts zeros — O(n²). With n = 100,000, that's 10 billion operations.

**Approach roadmap:**
- **Brute Force:** For every (i, j), count zeros in nums[i..j], track max length where zeros ≤ k → O(n²)
- **Optimal (Sliding Window):** Expand right, count zeros; when zeros > k, shrink left until zeros ≤ k → O(n)

**Interview cheat sheet:**
- **Keywords:** "consecutive ones", "at most k flips", "binary array", "maximum length"
- **What makes this different:** The "flip" wording disguises a simple constraint: count of zeros in window ≤ k
- **The "aha moment":** Reframe "flip at most k zeros" as "find longest window with at most k zeros"
- **Memory hook:** "Longest window with at most k zeros = max consecutive ones with k flips"

## Brute Force Intuition

Check every pair (i, j) representing a subarray. For each, count the number of zeros. If zeros ≤ k, the window is valid and its length is a candidate for the answer. Track the maximum.

## Brute Force Step-by-Step Solution

Let's trace `nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2`.

**Step 1: Initialize**

Code executing: `int maxLen = 0;`

We set maxLen = 0. We'll try every starting position i.
- maxLen = 0, i = 0 (about to start)

**Step 2: i=0, extend j, counting zeros**

Code executing: `for (int j = i; j < n; j++) { if (nums[j] == 0) zeros++; ... }`

Starting from i=0: j=0 (num=1, zeros=0), j=1 (num=1, zeros=0), j=2 (num=1, zeros=0), j=3 (num=0, zeros=1), j=4 (num=0, zeros=2), j=5 (num=0, zeros=3 > k=2 → break).
- Window [0..4] has 2 zeros ≤ k, length = 5. maxLen = 5.
- At j=5, zeros exceed k, so we stop extending from i=0.

**Step 3: i=1, extend j**

zeros resets to 0. j=1(1,0), j=2(1,0), j=3(0,1), j=4(0,2), j=5(0,3>k → break). Longest from i=1: [1..4] = length 4. maxLen stays 5.

**Step 4: i=3, extend j (interesting case)**

Start at the first zero. j=3(0,1), j=4(0,2), j=5(0,3>k → break). Longest from i=3: length 2. Not helpful.

**Step 5: i=5, extend j**

j=5(0,1), j=6(1,1), j=7(1,1), j=8(1,1), j=9(1,1), j=10(0,2). All valid! Length = 6. maxLen = 6.

**Step 6: Continue for remaining i values**

No starting position yields a longer valid window than 6.

**Final:** maxLen = 6.

**Correctness argument:** We check every possible subarray, so the optimal window cannot be missed. The zero count is maintained incrementally for efficiency within each starting position.

**Key invariant:** For each i, we extend j as far as possible while keeping zeros ≤ k.

**Common mistakes:**
1. Forgetting to reset the zero counter for each new starting index i.
2. Breaking too early or too late — break when zeros > k, not when zeros == k.

**30-second interview pitch:** "I try every starting index, extend as far right as possible while keeping the number of zeros ≤ k, and track the longest valid window. It's O(n²) because of the nested loops."

## Brute Force In-depth Intuition

The brute force works by exploiting the monotonicity of zero count: as we extend j rightward from a fixed i, the zero count only increases. Once it exceeds k, no further extension from this i can be valid, so we break and try the next i. This gives an optimization over checking all O(n²) pairs — we prune early. However, the worst case (e.g., alternating 0s and 1s with large k) still leads to O(n²). The sliding window removes the need for the outer loop entirely.

## Brute Force Algorithm

```
function longestOnes(nums, k):
    n = length(nums)
    maxLen = 0
    for i from 0 to n-1:
        zeros = 0
        for j from i to n-1:
            if nums[j] == 0:
                zeros++
            if zeros > k:
                break
            maxLen = max(maxLen, j - i + 1)
    return maxLen
```

The outer loop fixes the left boundary. The inner loop extends right while counting zeros. When zeros exceed k, we stop (no point continuing). We update maxLen for each valid window length.

## Brute Force Code

```java
class Solution {
    public int longestOnes(int[] nums, int k) {
        int n = nums.length;
        int maxLen = 0;
        for (int i = 0; i < n; i++) {
            int zeros = 0;
            for (int j = i; j < n; j++) {
                if (nums[j] == 0) zeros++;
                if (zeros > k) break;
                maxLen = Math.max(maxLen, j - i + 1);
            }
        }
        return maxLen;
    }
}
```

## Brute Force Complexity

**Time: O(n²)** — For each of the n starting positions, we may scan up to n elements. The early break optimization helps in practice but doesn't change worst-case.

**Space: O(1)** — Only a few integer variables are used. No additional data structures.

## Brute Force Hints

1. How would you check if a subarray is valid? Count the zeros — if ≤ k, it's valid.
2. For a fixed start, does extending the end ever make the zero count decrease? No — it only increases.
3. So once zeros > k, can you stop early for this starting index? Yes — break.
4. Can you maintain the zero count incrementally instead of recounting? Yes — just add 1 when nums[j] == 0.
5. What's the time complexity if we try all pairs? O(n²) with the early break.

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz2a-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz2a-grid{grid-template-columns:1fr}}
.viz2a-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz2a-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz2a-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz2a-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz2a-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz2a-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz2a-btn:disabled{opacity:0.3}
.viz2a-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>

<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar2a"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz2a-btn" id="prev2a" onclick="prev2a()">← Prev</button>
  <button class="viz2a-btn" id="next2a" onclick="next2a()">Next →</button>
  <button class="viz2a-btn" id="auto2a" onclick="toggleAuto2a()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel2a">Ready</span>
</div>

<div class="viz2a-grid">
  <div>
    <div class="viz2a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Array & Window</div>
      <svg id="svg2a" width="100%" viewBox="0 0 600 120"></svg>
    </div>
    <div class="viz2a-state" id="state2a"></div>
    <div class="viz2a-code" id="code2a"></div>
  </div>
  <div>
    <div class="viz2a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz2a-log" id="log2a"></div>
    </div>
    <div class="viz2a-expl" id="expl2a"></div>
  </div>
</div>

<script>
const TCS_2a = [
    { name: "Basic", data: [1,1,1,0,0,0,1,1,1,1,0], k: 2 },
    { name: "All ones", data: [1,1,1,1,1], k: 1 },
    { name: "All zeros", data: [0,0,0,0], k: 2 }
];

let steps2a = [], stepIdx2a = -1, autoInt2a = null, tcIdx2a = 0;
const CODE_LINES_2a = ["for i from 0 to n-1:","    zeros = 0","    for j from i to n-1:","        if nums[j]==0: zeros++","        if zeros > k: break","        maxLen = max(maxLen, j-i+1)","return maxLen"];

function buildSteps2a(tc) {
    steps2a = [];
    const nums = tc.data, k = tc.k, n = nums.length;
    let maxLen = 0;
    steps2a.push({ msg: `Init: k=${k}, maxLen=0`, hl: {}, lb: {}, vars: { i:"-", j:"-", zeros:"-", k, maxLen:0 }, changed: new Set(["k","maxLen"]), codeLine: -1, explanation: `Starting brute force. We can flip at most ${k} zeros. We try every starting position.` });
    for (let i = 0; i < n && steps2a.length < 50; i++) {
        let zeros = 0;
        for (let j = i; j < n; j++) {
            if (nums[j] === 0) zeros++;
            const hl = {};
            for (let x = i; x <= j; x++) hl[x] = nums[x] === 0 ? '#f59e0b' : '#2563eb';
            if (zeros > k) {
                hl[j] = '#ef4444';
                const lb = {}; lb[i] = "i"; lb[j] = j===i?"i,j":"j";
                steps2a.push({ msg: `i=${i},j=${j}: zeros=${zeros}>${k} BREAK`, hl, lb, vars: { i, j, zeros, k, maxLen }, changed: new Set(["j","zeros"]), codeLine: 4, explanation: `At j=${j}, nums[${j}]=${nums[j]}. Zero count is now ${zeros} which exceeds k=${k}. Break out of inner loop. Best from i=${i} was length ${j-i}.` });
                break;
            }
            maxLen = Math.max(maxLen, j - i + 1);
            const lb = {}; lb[i] = "i"; lb[j] = j===i?"i,j":"j";
            steps2a.push({ msg: `i=${i},j=${j}: zeros=${zeros}≤${k}, len=${j-i+1}`, hl, lb, vars: { i, j, zeros, k, maxLen }, changed: new Set(["j","maxLen"]), codeLine: 5, explanation: `Window [${i}..${j}] has ${zeros} zeros ≤ k=${k}. Valid! Length = ${j-i+1}. maxLen = ${maxLen}.` });
            if (steps2a.length >= 50) break;
        }
    }
    steps2a.push({ msg: `Done! Answer = ${maxLen}`, hl: {}, lb: {}, vars: { i:"done", j:"done", zeros:"-", k, maxLen }, changed: new Set(["maxLen"]), codeLine: 6, explanation: `All starting positions exhausted. Maximum consecutive ones with ${k} flips = ${maxLen}.` });
    stepIdx2a = 0;
}

function render2a() {
    const s = steps2a[stepIdx2a]; if (!s) return;
    const arr = TCS_2a[tcIdx2a].data;
    const boxW = 42, boxH = 40, gap = 4, startX = 10, startY = 30;
    let svg = '';
    arr.forEach((val, i) => {
        const x = startX + i * (boxW + gap);
        svg += `<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;
        const color = s.hl[i] || '#2a2a33';
        const tc = s.hl[i] ? '#fafaf9' : '#a1a1aa';
        svg += `<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;
        svg += `<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;
    });
    if (s.lb) { Object.entries(s.lb).forEach(([idx, label]) => { const x = startX + parseInt(idx) * (boxW + gap); svg += `<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`; }); }
    document.getElementById('svg2a').innerHTML = svg;
    let stHtml = '<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';
    Object.entries(s.vars).forEach(([nm, vl]) => { const ch = s.changed.has(nm); stHtml += `<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`; });
    stHtml += '</table>'; document.getElementById('state2a').innerHTML = stHtml;
    let cHtml = ''; CODE_LINES_2a.forEach((line, i) => { const act = i === s.codeLine; cHtml += `<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`; });
    document.getElementById('code2a').innerHTML = cHtml;
    let logHtml = ''; for (let i = 0; i <= stepIdx2a; i++) { logHtml += `<div style="color:${i===stepIdx2a?'#93c5fd':'#52525b'}">${i===stepIdx2a?'▶ ':'  '}${steps2a[i].msg}</div>`; }
    document.getElementById('log2a').innerHTML = logHtml; document.getElementById('log2a').scrollTop = 99999;
    document.getElementById('expl2a').innerHTML = s.explanation;
    document.getElementById('stepLabel2a').textContent = `Step ${stepIdx2a+1} / ${steps2a.length}`;
    document.getElementById('prev2a').disabled = stepIdx2a <= 0;
    document.getElementById('next2a').disabled = stepIdx2a >= steps2a.length - 1;
}
function next2a(){if(stepIdx2a<steps2a.length-1){stepIdx2a++;render2a();}}
function prev2a(){if(stepIdx2a>0){stepIdx2a--;render2a();}}
function toggleAuto2a(){if(autoInt2a){clearInterval(autoInt2a);autoInt2a=null;document.getElementById('auto2a').textContent='▶ Auto';}else{autoInt2a=setInterval(()=>{if(stepIdx2a>=steps2a.length-1){toggleAuto2a();return;}next2a();},800);document.getElementById('auto2a').textContent='⏸ Pause';}}
function loadTc2a(idx){tcIdx2a=idx;stepIdx2a=0;buildSteps2a(TCS_2a[idx]);document.querySelectorAll('[data-tc2a]').forEach((b,i)=>{b.className=i===idx?'viz2a-btn active':'viz2a-btn';});render2a();}
const tcBar2a=document.getElementById('tcBar2a');TCS_2a.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz2a-btn active':'viz2a-btn';b.setAttribute('data-tc2a','');b.onclick=()=>loadTc2a(i);tcBar2a.appendChild(b);});
buildSteps2a(TCS_2a[0]);render2a();
</script>
</div>

## Optimal Intuition

Use a sliding window [left, right]. Expand `right` one position at a time. Whenever we encounter a zero, increment a zero counter. If the zero counter exceeds k, shrink the window from the left (incrementing `left`) until the zero counter drops back to k. At each step, `right - left + 1` is the current valid window size. Track the maximum.

## Optimal Step-by-Step Solution

Trace: `nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2`.

**Step 1: Initialize**

Code executing: `int left = 0, zeros = 0, maxLen = 0;`

Window starts empty. left=0, zeros=0, maxLen=0.
- left = 0, right = about to start, zeros = 0, maxLen = 0

**Step 2: right=0, nums[0]=1**

Code executing: `if (nums[right] == 0) zeros++;`

nums[0] = 1, not a zero. zeros unchanged at 0. zeros ≤ k, window is valid. Length = 1.
- left=0, right=0, zeros=0, maxLen = max(0, 1) = 1
- Window: [1] — all ones

**Step 3: right=1, nums[1]=1**

Another 1. zeros still 0. Window [0..1] = [1,1], length 2.
- maxLen = 2

**Step 4: right=2, nums[2]=1**

Another 1. zeros still 0. Window [0..2] = [1,1,1], length 3.
- maxLen = 3

**Step 5: right=3, nums[3]=0**

Code executing: `if (nums[right] == 0) zeros++;`

First zero encountered! zeros becomes 1. Since 1 ≤ k=2, window is still valid.
- left=0, right=3, zeros=1, maxLen = max(3, 4) = 4
- Window: [1,1,1,0] — 1 zero flipped

**Step 6: right=4, nums[4]=0**

Second zero! zeros becomes 2. 2 ≤ 2, still valid.
- left=0, right=4, zeros=2, maxLen = max(4, 5) = 5
- Window: [1,1,1,0,0] — 2 zeros flipped, at our limit

**Step 7: right=5, nums[5]=0**

Code executing: `while (zeros > k) { if (nums[left] == 0) zeros--; left++; }`

Third zero! zeros becomes 3 > k=2. Window is INVALID. We must shrink from left.
- left=0, nums[0]=1. Not a zero, so zeros stays 3. left moves to 1.
- left=1, nums[1]=1. Not a zero. left moves to 2.
- left=2, nums[2]=1. Not a zero. left moves to 3.
- left=3, nums[3]=0. This IS a zero! zeros decrements to 2. left moves to 4.
- Now zeros=2 ≤ k. Stop shrinking.
- Window: [0,0,0] = indices 4-5... wait, left=4, right=5, zeros=2. Window [0,0,0] would have too many zeros. Let me recalculate.

Actually: after shrinking, left=4, right=5. Window is nums[4..5] = [0,0]. zeros = 2 (the two zeros at indices 4 and 5). Length = 2. maxLen stays 5.

Why this matters: We had to eject elements from the left until we removed a zero, bringing our zero count back within budget. This is the core shrink mechanism.

**Step 8: right=6, nums[6]=1**

nums[6]=1, zeros unchanged at 2. Window [4..6] = [0,0,1], length 3.
- maxLen stays 5

**Step 9: right=7 through right=9, all 1's**

Each step adds a 1. zeros stays 2. Window grows: [4..7], [4..8], [4..9].
- At right=9: Window [4..9] = [0,0,1,1,1,1], length 6.
- maxLen = max(5, 6) = 6

**Step 10: right=10, nums[10]=0**

Third zero again! zeros = 3 > k. Shrink: left=4, nums[4]=0, zeros→2, left→5. Now zeros=2 ≤ k.
- Window [5..10] = [0,1,1,1,1,0], length 6. maxLen = max(6, 6) = 6.

**Final:** maxLen = 6.

**Correctness argument:** The window always contains at most k zeros. We try every possible right endpoint and optimally shrink left only as much as needed. This explores all valid windows.

**Key invariant:** At every iteration's end, zeros = count of zeros in nums[left..right], and zeros ≤ k.

**Common mistakes:**
1. Using `if` instead of `while` to shrink — a single shrink step may not remove a zero, so you need a loop.
2. Decrementing zeros when shrinking a 1 instead of only when shrinking a 0.

**30-second interview pitch:** "I reframe the problem as finding the longest subarray with at most k zeros. I use a sliding window — expand right, count zeros. When zeros exceed k, shrink left until a zero is ejected. Both pointers move forward, so it's O(n)."

## Optimal In-depth Intuition

The key mathematical insight is **monotonicity of the constraint**: adding elements to the right can only increase (or maintain) the zero count, and removing elements from the left can only decrease (or maintain) it. This means once the window becomes invalid (zeros > k), we need to shrink from the left, and once it becomes valid again, we can resume expanding right.

A subtle optimization: instead of shrinking with `while`, you can use a non-shrinking window technique where you never shrink the window (just slide it forward). The idea is that the answer can only improve if the window grows. When zeros > k, instead of shrinking until valid, just move left by 1 (same as right moving by 1), maintaining window size. This still gives the correct answer because we're tracking the maximum window size, and smaller windows aren't interesting.

## Optimal Algorithm

```
function longestOnes(nums, k):
    left = 0
    zeros = 0
    maxLen = 0
    for right from 0 to n-1:
        if nums[right] == 0:
            zeros++
        while zeros > k:
            if nums[left] == 0:
                zeros--
            left++
        maxLen = max(maxLen, right - left + 1)
    return maxLen
```

The outer loop expands the window by advancing right. If the new element is a zero, we increment zeros. The while loop then shrinks from the left until the constraint is satisfied. Finally, we update maxLen with the current valid window size.

## Optimal Code

```java
class Solution {
    public int longestOnes(int[] nums, int k) {
        int left = 0, zeros = 0, maxLen = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zeros++;
            while (zeros > k) {
                if (nums[left] == 0) zeros--; // releasing a zero frees up a flip
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
```

## Optimal Complexity

**Time: O(n)** — The right pointer moves from 0 to n-1, and the left pointer also moves from 0 to at most n-1. Each pointer moves at most n times total. So the combined work is O(n + n) = O(n).

**Space: O(1)** — Only a few integer variables: left, zeros, maxLen. No additional data structures.

## Optimal Hints

1. Reframe the problem: what does "flip at most k zeros" really mean for a subarray?
2. If your window has too many zeros, which end should you shrink from?
3. When you eject an element from the left, how do you know if it was a zero?
4. Why does `left` never need to move backward?
5. What's the maximum distance `left` can travel across the entire algorithm? (Hint: at most n)
6. Can you solve this without ever shrinking the window? (Advanced: non-shrinking window trick)

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz2b-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz2b-grid{grid-template-columns:1fr}}
.viz2b-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz2b-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz2b-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz2b-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz2b-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz2b-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz2b-btn:disabled{opacity:0.3}
.viz2b-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>

<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar2b"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz2b-btn" id="prev2b" onclick="prev2b()">← Prev</button>
  <button class="viz2b-btn" id="next2b" onclick="next2b()">Next →</button>
  <button class="viz2b-btn" id="auto2b" onclick="toggleAuto2b()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel2b">Ready</span>
</div>

<div class="viz2b-grid">
  <div>
    <div class="viz2b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Sliding Window</div>
      <svg id="svg2b" width="100%" viewBox="0 0 600 120"></svg>
    </div>
    <div class="viz2b-state" id="state2b"></div>
    <div class="viz2b-code" id="code2b"></div>
  </div>
  <div>
    <div class="viz2b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz2b-log" id="log2b"></div>
    </div>
    <div class="viz2b-expl" id="expl2b"></div>
  </div>
</div>

<script>
const TCS_2b = [
    { name: "Basic k=2", data: [1,1,1,0,0,0,1,1,1,1,0], k: 2 },
    { name: "All ones k=1", data: [1,1,1,1,1], k: 1 },
    { name: "All zeros k=2", data: [0,0,0,0], k: 2 }
];
let steps2b=[],stepIdx2b=-1,autoInt2b=null,tcIdx2b=0;
const CODE_LINES_2b=["for right from 0 to n-1:","    if nums[right]==0: zeros++","    while zeros > k:","        if nums[left]==0: zeros--","        left++","    maxLen = max(maxLen, right-left+1)","return maxLen"];

function buildSteps2b(tc){
    steps2b=[];const nums=tc.data,k=tc.k,n=nums.length;let left=0,zeros=0,maxLen=0;
    steps2b.push({msg:`Init: k=${k}`,hl:{},lb:{},vars:{left:0,right:"-",zeros:0,k,maxLen:0,"window":"[]"},changed:new Set(["left","zeros","maxLen"]),codeLine:-1,explanation:`Initialize sliding window. left=0, zeros=0. We can tolerate at most ${k} zeros in our window.`});
    for(let right=0;right<n;right++){
        if(nums[right]===0)zeros++;
        let hl={},lb={};
        for(let x=left;x<=right;x++)hl[x]=nums[x]===0?'#f59e0b':'#2563eb';
        hl[right]=nums[right]===0?'#f59e0b':'#22c55e';
        lb[left]="left";lb[right]=right===left?"L,R":"right";
        const winStr=nums.slice(left,right+1).join(',');
        steps2b.push({msg:`r=${right}: nums[${right}]=${nums[right]}, zeros=${zeros}`,hl:{...hl},lb:{...lb},vars:{left,right,zeros,k,maxLen,"window":`[${winStr}]`},changed:new Set(["right","zeros","window"]),codeLine:nums[right]===0?1:0,explanation:`Expand right to ${right}. nums[${right}]=${nums[right]}${nums[right]===0?', increment zeros to '+zeros:''}. Window has ${zeros} zero(s).`});
        let shrank=false;
        while(zeros>k){
            shrank=true;
            const ejected=nums[left];
            if(ejected===0)zeros--;
            left++;
            const hl2={};for(let x=left;x<=right;x++)hl2[x]=nums[x]===0?'#f59e0b':'#2563eb';
            if(left<=right)hl2[right]='#4f8ff7';
            const lb2={};lb2[left]="left";lb2[right]=right===left?"L,R":"right";
            if(left>0)hl2[left-1]='#ef4444';
            const winStr2=nums.slice(left,right+1).join(',');
            steps2b.push({msg:`  shrink: eject ${ejected}, left→${left}, zeros=${zeros}`,hl:{...hl2},lb:{...lb2},vars:{left,right,zeros,k,maxLen,"window":`[${winStr2}]`},changed:new Set(["left","zeros","window"]),codeLine:ejected===0?3:4,explanation:`zeros=${zeros+( ejected===0?1:0)} > k=${k}. Eject nums[${left-1}]=${ejected} from left.${ejected===0?' It was a zero, decrement zeros to '+zeros:' It was a 1, zeros unchanged.'} Move left to ${left}.`});
        }
        maxLen=Math.max(maxLen,right-left+1);
        if(!shrank||true){
            const hl3={};for(let x=left;x<=right;x++)hl3[x]=nums[x]===0?'#f59e0b':'#2563eb';
            hl3[right]='#4f8ff7';
            const lb3={};lb3[left]="left";lb3[right]=right===left?"L,R":"right";
            const winStr3=nums.slice(left,right+1).join(',');
            steps2b.push({msg:`  valid! len=${right-left+1}, maxLen=${maxLen}`,hl:{...hl3},lb:{...lb3},vars:{left,right,zeros,k,maxLen,"window":`[${winStr3}]`},changed:new Set(["maxLen"]),codeLine:5,explanation:`Window [${left}..${right}] = [${winStr3}] has ${zeros} zeros ≤ k=${k}. Length = ${right-left+1}. maxLen = ${maxLen}.`});
        }
        if(steps2b.length>70)break;
    }
    steps2b.push({msg:`Done! Answer=${maxLen}`,hl:{},lb:{},vars:{left,right:"done",zeros,k,maxLen,"window":"-"},changed:new Set(["maxLen"]),codeLine:6,explanation:`Finished processing all elements. The maximum consecutive ones with at most ${k} flips = ${maxLen}.`});
    stepIdx2b=0;
}

function render2b(){
    const s=steps2b[stepIdx2b];if(!s)return;
    const arr=TCS_2b[tcIdx2b].data;
    const boxW=42,boxH=40,gap=4,startX=10,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg2b').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state2b').innerHTML=stHtml;
    let cHtml='';CODE_LINES_2b.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code2b').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx2b;i++){logHtml+=`<div style="color:${i===stepIdx2b?'#93c5fd':'#52525b'}">${i===stepIdx2b?'▶ ':'  '}${steps2b[i].msg}</div>`;}document.getElementById('log2b').innerHTML=logHtml;document.getElementById('log2b').scrollTop=99999;
    document.getElementById('expl2b').innerHTML=s.explanation;
    document.getElementById('stepLabel2b').textContent=`Step ${stepIdx2b+1} / ${steps2b.length}`;
    document.getElementById('prev2b').disabled=stepIdx2b<=0;document.getElementById('next2b').disabled=stepIdx2b>=steps2b.length-1;
}
function next2b(){if(stepIdx2b<steps2b.length-1){stepIdx2b++;render2b();}}
function prev2b(){if(stepIdx2b>0){stepIdx2b--;render2b();}}
function toggleAuto2b(){if(autoInt2b){clearInterval(autoInt2b);autoInt2b=null;document.getElementById('auto2b').textContent='▶ Auto';}else{autoInt2b=setInterval(()=>{if(stepIdx2b>=steps2b.length-1){toggleAuto2b();return;}next2b();},800);document.getElementById('auto2b').textContent='⏸ Pause';}}
function loadTc2b(idx){tcIdx2b=idx;stepIdx2b=0;buildSteps2b(TCS_2b[idx]);document.querySelectorAll('[data-tc2b]').forEach((b,i)=>{b.className=i===idx?'viz2b-btn active':'viz2b-btn';});render2b();}
const tcBar2b=document.getElementById('tcBar2b');TCS_2b.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz2b-btn active':'viz2b-btn';b.setAttribute('data-tc2b','');b.onclick=()=>loadTc2b(i);tcBar2b.appendChild(b);});
buildSteps2b(TCS_2b[0]);render2b();
</script>
</div>

---

# Fruit Into Baskets

**Difficulty:** Medium
**LeetCode:** https://leetcode.com/problems/fruit-into-baskets/
**GFG:** https://www.geeksforgeeks.org/fruit-into-baskets-problem/

## Description

You are visiting a farm with a row of fruit trees. Each tree produces one type of fruit, given by `fruits[i]`. You have **two baskets**, and each basket can only hold **one type** of fruit. There is no limit on the amount of fruit per basket. Starting from any tree, you move to the right, picking one fruit from each tree. You stop when you encounter a third type of fruit (since you only have two baskets). Return the maximum number of fruits you can pick.

**Input:** An integer array `fruits` where `fruits[i]` is the type of fruit at tree i.
**Output:** The maximum number of fruits you can collect.

**Constraints:**
- `1 <= fruits.length <= 10^5`
- `0 <= fruits[i] < fruits.length`

**Example 1:**
Input: `fruits = [1,2,1]`
Output: `3`
Explanation: All trees can be picked. We have types 1 and 2, which fit in 2 baskets. Total = 3.

**Example 2:**
Input: `fruits = [0,1,2,2]`
Output: `3`
Explanation: Start at tree 1 (type 1), then tree 2 (type 2), tree 3 (type 2). We get [1,2,2] = 3 fruits. Starting at tree 0 gives [0,1,2,2] but that has 3 types — we'd have to stop at tree 2.

**Example 3:**
Input: `fruits = [1,2,3,2,2]`
Output: `4`
Explanation: Start at tree 1: [2,3,2,2] has only types 2 and 3 → 4 fruits.

**Edge Cases:**
- All same type → return fruits.length
- Two types only → return fruits.length
- Alternating types → need to track window carefully
- Single element → return 1

## In-depth Explanation

**Reframe:** Find the longest subarray containing at most 2 distinct values. The "fruit" and "basket" story is just flavor — the core problem is: **longest subarray with at most K distinct elements, where K=2**.

**Pattern recognition:** This is a **sliding window with a frequency map** problem. The constraint is on the number of distinct elements in the window. Keywords: "maximum", "contiguous", "at most K types."

**Real-world analogy:** You're streaming music and can only save songs from 2 artists. You go through a playlist sequentially and keep saving songs. The moment a third artist appears, you must drop all songs from one artist before continuing. You want the longest streak.

**Why naive fails:** Checking all O(n²) subarrays and counting distinct elements is too slow for n = 100,000.

**Approach roadmap:**
- **Brute Force:** For every (i, j), check if distinct types ≤ 2 → O(n²)
- **Optimal (Sliding Window + HashMap):** Expand right, track frequencies. When distinct > 2, shrink left until a type is fully removed → O(n)

**Interview cheat sheet:**
- **Keywords:** "at most K distinct", "longest subarray", "two baskets", "maximum fruits"
- **What makes this different:** It's "Longest Substring with At Most K Distinct Characters" with K=2, disguised as a fruit problem
- **The "aha moment":** Track frequencies in a map; shrink left until map size ≤ 2
- **Memory hook:** "Two baskets = at most 2 distinct in the window"

## Brute Force Intuition

For each starting index, extend rightward while tracking distinct fruit types using a set or map. When we encounter a third type, stop. Track the maximum window length across all starting positions.

## Brute Force Step-by-Step Solution

Trace: `fruits = [1,2,3,2,2]`.

**Step 1: Initialize**

Code executing: `int maxLen = 0;`
- maxLen = 0. We try every starting position.

**Step 2: i=0, extend j**

Code executing: `for (int j = i; j < n; j++) { map.put(fruits[j], map.getOrDefault(fruits[j], 0) + 1); ... }`

j=0: type 1, map={1:1}, distinct=1 ≤ 2. Length=1.
j=1: type 2, map={1:1, 2:1}, distinct=2 ≤ 2. Length=2.
j=2: type 3, map={1:1, 2:1, 3:1}, distinct=3 > 2 → BREAK.
- maxLen = max(0, 2) = 2.

**Step 3: i=1, extend j**

j=1: type 2, map={2:1}, distinct=1. Length=1.
j=2: type 3, map={2:1, 3:1}, distinct=2. Length=2.
j=3: type 2, map={2:2, 3:1}, distinct=2. Length=3.
j=4: type 2, map={2:3, 3:1}, distinct=2. Length=4.
End of array.
- maxLen = max(2, 4) = 4.

**Step 4: i=2, extend j**

j=2: type 3, j=3: type 2, j=4: type 2. map={3:1, 2:2}, always ≤ 2. Length=3.
- maxLen stays 4.

**Steps 5-6: i=3 and i=4**

From i=3: [2,2], length 2. From i=4: [2], length 1. Neither improves maxLen.

**Final:** maxLen = 4.

**Correctness argument:** We check every possible contiguous window. The distinct count is maintained via the map. We never miss a valid window.

**Key invariant:** For each i, the map contains exactly the frequencies of fruits in fruits[i..j].

**Common mistakes:**
1. Using a Set instead of a Map — you need counts to know when to remove a type during window shrinking.
2. Forgetting to reset the map for each new starting index i.

**30-second interview pitch:** "I try every starting tree, extend right while tracking fruit types in a map. When I see a third type, I stop. Track the max window. O(n²) time."

## Brute Force In-depth Intuition

The brute force directly translates the problem statement into nested loops. For each starting tree, we greedily pick as many fruits as possible until we encounter a third type. The HashMap tracks both which types are in the current window and their counts. The outer loop provides O(n) starting positions, and the inner loop extends at most O(n) for each, giving O(n²). The sliding window optimization avoids restarting from scratch for each i by reusing the window state.

## Brute Force Algorithm

```
function totalFruit(fruits):
    n = length(fruits)
    maxLen = 0
    for i from 0 to n-1:
        map = empty HashMap
        for j from i to n-1:
            map[fruits[j]]++
            if map.size > 2:
                break
            maxLen = max(maxLen, j - i + 1)
    return maxLen
```

For each starting position, we build a frequency map as we extend right. The moment the map has more than 2 keys (i.e., more than 2 fruit types), we break.

## Brute Force Code

```java
class Solution {
    public int totalFruit(int[] fruits) {
        int n = fruits.length;
        int maxLen = 0;
        for (int i = 0; i < n; i++) {
            HashMap<Integer, Integer> map = new HashMap<>();
            for (int j = i; j < n; j++) {
                map.put(fruits[j], map.getOrDefault(fruits[j], 0) + 1);
                if (map.size() > 2) break;
                maxLen = Math.max(maxLen, j - i + 1);
            }
        }
        return maxLen;
    }
}
```

## Brute Force Complexity

**Time: O(n²)** — Two nested loops, each running up to n. HashMap operations are O(1) amortized.

**Space: O(1)** — The HashMap has at most 3 entries (we break at 3), so space is constant.

## Brute Force Hints

1. Strip the story: what are you really looking for? Longest subarray with at most 2 distinct values.
2. For a fixed start, what structure tracks how many distinct types you have?
3. Once you have a third type, can extending further help? No — break early.
4. How do you go from O(n²) to O(n)? Avoid restarting the window from scratch.
5. What if you kept the window from the previous iteration and just adjusted it?

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz3a-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz3a-grid{grid-template-columns:1fr}}
.viz3a-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz3a-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz3a-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz3a-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz3a-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz3a-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz3a-btn:disabled{opacity:0.3}
.viz3a-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar3a"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz3a-btn" id="prev3a" onclick="prev3a()">← Prev</button>
  <button class="viz3a-btn" id="next3a" onclick="next3a()">Next →</button>
  <button class="viz3a-btn" id="auto3a" onclick="toggleAuto3a()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel3a">Ready</span>
</div>
<div class="viz3a-grid">
  <div>
    <div class="viz3a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Fruit Array</div>
      <svg id="svg3a" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz3a-state" id="state3a"></div>
    <div class="viz3a-code" id="code3a"></div>
  </div>
  <div>
    <div class="viz3a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz3a-log" id="log3a"></div>
    </div>
    <div class="viz3a-expl" id="expl3a"></div>
  </div>
</div>
<script>
const TCS_3a=[{name:"[1,2,3,2,2]",data:[1,2,3,2,2]},{name:"[1,2,1]",data:[1,2,1]},{name:"[0,1,2,2]",data:[0,1,2,2]}];
let steps3a=[],stepIdx3a=-1,autoInt3a=null,tcIdx3a=0;
const CODE_LINES_3a=["for i from 0 to n-1:","    map = {}","    for j from i to n-1:","        map[fruits[j]]++","        if map.size > 2: break","        maxLen = max(maxLen, j-i+1)","return maxLen"];
function buildSteps3a(tc){
    steps3a=[];const fruits=tc.data,n=fruits.length;let maxLen=0;
    steps3a.push({msg:"Init: maxLen=0",hl:{},lb:{},vars:{i:"-",j:"-",map:"{}",distinct:0,maxLen:0},changed:new Set(["maxLen"]),codeLine:-1,explanation:"Starting brute force. Try every starting position and extend right."});
    for(let i=0;i<n&&steps3a.length<50;i++){
        const map={};
        for(let j=i;j<n;j++){
            map[fruits[j]]=(map[fruits[j]]||0)+1;
            const dist=Object.keys(map).length;
            const hl={};for(let x=i;x<=j;x++)hl[x]='#2563eb';hl[j]='#4f8ff7';
            const lb={};lb[i]="i";lb[j]=j===i?"i,j":"j";
            const mapStr="{"+Object.entries(map).map(([k,v])=>k+":"+v).join(",")+"}";
            if(dist>2){
                hl[j]='#ef4444';
                steps3a.push({msg:`i=${i},j=${j}: type ${fruits[j]}, 3rd type! BREAK`,hl,lb,vars:{i,j,map:mapStr,distinct:dist,maxLen},changed:new Set(["j","map","distinct"]),codeLine:4,explanation:`At j=${j}, fruit type ${fruits[j]} is a 3rd distinct type. Map has ${dist} types > 2. Break.`});
                break;
            }
            maxLen=Math.max(maxLen,j-i+1);
            steps3a.push({msg:`i=${i},j=${j}: type ${fruits[j]}, ${dist} types, len=${j-i+1}`,hl,lb,vars:{i,j,map:mapStr,distinct:dist,maxLen},changed:new Set(["j","map","maxLen"]),codeLine:5,explanation:`Window [${i}..${j}] has ${dist} distinct types ≤ 2. Valid! Length=${j-i+1}. maxLen=${maxLen}.`});
            if(steps3a.length>=50)break;
        }
    }
    steps3a.push({msg:`Done! Answer=${maxLen}`,hl:{},lb:{},vars:{i:"done",j:"done",map:"-",distinct:"-",maxLen},changed:new Set(["maxLen"]),codeLine:6,explanation:`All starting positions checked. Maximum fruits = ${maxLen}.`});
    stepIdx3a=0;
}
function render3a(){
    const s=steps3a[stepIdx3a];if(!s)return;const arr=TCS_3a[tcIdx3a].data;
    const boxW=48,boxH=40,gap=4,startX=20,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg3a').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state3a').innerHTML=stHtml;
    let cHtml='';CODE_LINES_3a.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code3a').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx3a;i++){logHtml+=`<div style="color:${i===stepIdx3a?'#93c5fd':'#52525b'}">${i===stepIdx3a?'▶ ':'  '}${steps3a[i].msg}</div>`;}document.getElementById('log3a').innerHTML=logHtml;document.getElementById('log3a').scrollTop=99999;
    document.getElementById('expl3a').innerHTML=s.explanation;document.getElementById('stepLabel3a').textContent=`Step ${stepIdx3a+1} / ${steps3a.length}`;document.getElementById('prev3a').disabled=stepIdx3a<=0;document.getElementById('next3a').disabled=stepIdx3a>=steps3a.length-1;
}
function next3a(){if(stepIdx3a<steps3a.length-1){stepIdx3a++;render3a();}}
function prev3a(){if(stepIdx3a>0){stepIdx3a--;render3a();}}
function toggleAuto3a(){if(autoInt3a){clearInterval(autoInt3a);autoInt3a=null;document.getElementById('auto3a').textContent='▶ Auto';}else{autoInt3a=setInterval(()=>{if(stepIdx3a>=steps3a.length-1){toggleAuto3a();return;}next3a();},800);document.getElementById('auto3a').textContent='⏸ Pause';}}
function loadTc3a(idx){tcIdx3a=idx;stepIdx3a=0;buildSteps3a(TCS_3a[idx]);document.querySelectorAll('[data-tc3a]').forEach((b,i)=>{b.className=i===idx?'viz3a-btn active':'viz3a-btn';});render3a();}
const tcBar3a=document.getElementById('tcBar3a');TCS_3a.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz3a-btn active':'viz3a-btn';b.setAttribute('data-tc3a','');b.onclick=()=>loadTc3a(i);tcBar3a.appendChild(b);});
buildSteps3a(TCS_3a[0]);render3a();
</script>
</div>

## Optimal Intuition

Use a sliding window [left, right] with a HashMap tracking fruit type frequencies. Expand right one step at a time, adding the new fruit to the map. When the map has more than 2 keys (3+ distinct types), shrink from the left: decrement frequencies and remove types that hit zero count, until only 2 types remain. Track the maximum window size throughout.

## Optimal Step-by-Step Solution

Trace: `fruits = [1,2,3,2,2]`.

**Step 1: Initialize**

Code executing: `int left = 0, maxLen = 0; HashMap<Integer, Integer> map = new HashMap<>();`
- left = 0, maxLen = 0, map = {}

**Step 2: right=0, fruit type 1**

Code executing: `map.put(fruits[right], map.getOrDefault(fruits[right], 0) + 1);`

Add type 1 to map. map = {1:1}. Distinct types = 1 ≤ 2. Valid window.
- left=0, right=0, map={1:1}, maxLen = max(0, 1) = 1
- Window: [1]

**Step 3: right=1, fruit type 2**

Add type 2. map = {1:1, 2:1}. Distinct = 2 ≤ 2. Valid.
- left=0, right=1, map={1:1, 2:1}, maxLen = max(1, 2) = 2
- Window: [1, 2]

**Step 4: right=2, fruit type 3**

Code executing: `while (map.size() > 2) { ... shrink left ... }`

Add type 3. map = {1:1, 2:1, 3:1}. Distinct = 3 > 2! Must shrink.

Shrink: left=0, fruits[0]=1. Decrement: map={1:0, 2:1, 3:1}. Count hit 0, so remove type 1: map={2:1, 3:1}. left moves to 1. Now distinct = 2 ≤ 2. Stop shrinking.
- left=1, right=2, map={2:1, 3:1}, maxLen = max(2, 2) = 2
- Window: [2, 3]

Why this matters: We removed all occurrences of type 1 from the window by advancing left past them. Now the window only has types 2 and 3.

**Step 5: right=3, fruit type 2**

Add type 2. map = {2:2, 3:1}. Distinct = 2 ≤ 2. Valid.
- left=1, right=3, map={2:2, 3:1}, maxLen = max(2, 3) = 3
- Window: [2, 3, 2]

**Step 6: right=4, fruit type 2**

Add type 2. map = {2:3, 3:1}. Distinct = 2 ≤ 2. Valid.
- left=1, right=4, map={2:3, 3:1}, maxLen = max(3, 4) = 4
- Window: [2, 3, 2, 2]

**Final:** maxLen = 4.

**Correctness argument:** The window always satisfies the constraint (≤ 2 types). We try every right endpoint and minimally shrink left. This guarantees we find the longest valid window.

**Key invariant:** map.size() ≤ 2 after the while loop, and map contains exact frequencies for fruits[left..right].

**Common mistakes:**
1. Forgetting to remove the key from the map when its count reaches 0 — this causes map.size() to report more types than actually present.
2. Decrementing the wrong element — always decrement `fruits[left]`, not `fruits[right]`.

**30-second interview pitch:** "This is 'longest subarray with at most 2 distinct values.' I use a sliding window with a frequency map. Expand right, add to map. When map has 3+ types, shrink left until a type is fully removed. O(n) time, O(1) space."

## Optimal In-depth Intuition

This problem is a specific instance of the "Longest Substring/Subarray with At Most K Distinct Elements" pattern (with K=2). The frequency map is essential because when we shrink the window, we need to know when a type's count drops to zero so we can remove it from the map, reducing the distinct count.

The monotonicity property holds: expanding right can only add types (increase or maintain distinct count), and shrinking left can only remove types (decrease or maintain). This ensures the two-pointer approach is correct — we never need to "backtrack" left.

A subtle point: this problem has an equivalent formulation as "picking from a contiguous segment of trees" — the contiguity requirement is what makes it a sliding window problem rather than a greedy or DP problem.

## Optimal Algorithm

```
function totalFruit(fruits):
    map = empty HashMap<Integer, Integer>
    left = 0
    maxLen = 0
    for right from 0 to n-1:
        map[fruits[right]]++
        while map.size > 2:
            map[fruits[left]]--
            if map[fruits[left]] == 0:
                remove fruits[left] from map
            left++
        maxLen = max(maxLen, right - left + 1)
    return maxLen
```

Expand right and add the fruit type. If the map has too many types, shrink left until a type is fully ejected (count drops to 0 and is removed from the map). Update maxLen with each valid window.

## Optimal Code

```java
class Solution {
    public int totalFruit(int[] fruits) {
        HashMap<Integer, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < fruits.length; right++) {
            map.put(fruits[right], map.getOrDefault(fruits[right], 0) + 1);
            while (map.size() > 2) {
                int leftFruit = fruits[left];
                map.put(leftFruit, map.get(leftFruit) - 1);
                if (map.get(leftFruit) == 0) map.remove(leftFruit);
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
```

## Optimal Complexity

**Time: O(n)** — Each element is added to the window once (by right) and removed at most once (by left). The total work across both pointers is O(n + n) = O(n). HashMap operations are O(1) amortized.

**Space: O(1)** — The HashMap holds at most 3 entries at any point (it shrinks back to 2 immediately). So space is O(1), independent of input size.

## Optimal Hints

1. What's the real constraint? At most 2 distinct types in a contiguous window.
2. What data structure tracks both which types are present AND their counts?
3. When you have 3 types, what determines when you can stop shrinking?
4. Why do you need to remove the key when count hits 0?
5. Can left ever move right of right? No — that would be an empty window.
6. This is exactly "Longest Substring with At Most K Distinct Characters" with K=2.

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz3b-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz3b-grid{grid-template-columns:1fr}}
.viz3b-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz3b-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz3b-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz3b-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz3b-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz3b-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz3b-btn:disabled{opacity:0.3}
.viz3b-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar3b"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz3b-btn" id="prev3b" onclick="prev3b()">← Prev</button>
  <button class="viz3b-btn" id="next3b" onclick="next3b()">Next →</button>
  <button class="viz3b-btn" id="auto3b" onclick="toggleAuto3b()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel3b">Ready</span>
</div>
<div class="viz3b-grid">
  <div>
    <div class="viz3b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Sliding Window</div>
      <svg id="svg3b" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz3b-state" id="state3b"></div>
    <div class="viz3b-code" id="code3b"></div>
  </div>
  <div>
    <div class="viz3b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz3b-log" id="log3b"></div>
    </div>
    <div class="viz3b-expl" id="expl3b"></div>
  </div>
</div>
<script>
const TCS_3b=[{name:"[1,2,3,2,2]",data:[1,2,3,2,2]},{name:"[1,2,1]",data:[1,2,1]},{name:"[3,3,3,1,2,1,1,2,3,3,4]",data:[3,3,3,1,2,1,1,2,3,3,4]}];
let steps3b=[],stepIdx3b=-1,autoInt3b=null,tcIdx3b=0;
const CODE_LINES_3b=["for right from 0 to n-1:","    map[fruits[right]]++","    while map.size > 2:","        map[fruits[left]]--","        if count==0: remove key","        left++","    maxLen = max(maxLen, right-left+1)","return maxLen"];

function buildSteps3b(tc){
    steps3b=[];const fruits=tc.data,n=fruits.length;let left=0,maxLen=0;const map={};
    const mapStr=()=>"{"+Object.entries(map).map(([k,v])=>k+":"+v).join(",")+"}";
    steps3b.push({msg:"Init: left=0, maxLen=0",hl:{},lb:{},vars:{left:0,right:"-",map:"{}",distinct:0,maxLen:0},changed:new Set(["left","maxLen"]),codeLine:-1,explanation:"Initialize sliding window with empty frequency map."});
    for(let right=0;right<n;right++){
        map[fruits[right]]=(map[fruits[right]]||0)+1;
        const dist=Object.keys(map).length;
        let hl={};for(let x=left;x<=right;x++)hl[x]='#2563eb';hl[right]='#22c55e';
        let lb={};lb[left]="left";lb[right]=right===left?"L,R":"right";
        steps3b.push({msg:`r=${right}: add type ${fruits[right]}, ${dist} types`,hl:{...hl},lb:{...lb},vars:{left,right,map:mapStr(),distinct:dist,maxLen},changed:new Set(["right","map","distinct"]),codeLine:1,explanation:`Add fruit type ${fruits[right]} at right=${right}. Map now has ${dist} distinct types.`});
        while(Object.keys(map).length>2){
            const lf=fruits[left];map[lf]--;
            if(map[lf]===0)delete map[lf];
            left++;
            const dist2=Object.keys(map).length;
            hl={};for(let x=left;x<=right;x++)hl[x]='#2563eb';if(left>0)hl[left-1]='#ef4444';hl[right]='#4f8ff7';
            lb={};lb[left]="left";lb[right]=right===left?"L,R":"right";
            steps3b.push({msg:`  shrink: eject type ${lf}, left→${left}`,hl:{...hl},lb:{...lb},vars:{left,right,map:mapStr(),distinct:dist2,maxLen},changed:new Set(["left","map","distinct"]),codeLine:3,explanation:`Too many types! Eject fruits[${left-1}]=${lf}. ${map[lf]===undefined?`Type ${lf} fully removed.`:`Type ${lf} count decremented.`} Now ${dist2} types.`});
        }
        maxLen=Math.max(maxLen,right-left+1);
        hl={};for(let x=left;x<=right;x++)hl[x]='#2563eb';hl[right]='#4f8ff7';
        lb={};lb[left]="left";lb[right]=right===left?"L,R":"right";
        steps3b.push({msg:`  valid: len=${right-left+1}, maxLen=${maxLen}`,hl:{...hl},lb:{...lb},vars:{left,right,map:mapStr(),distinct:Object.keys(map).length,maxLen},changed:new Set(["maxLen"]),codeLine:6,explanation:`Window [${left}..${right}] has ≤2 types. Length=${right-left+1}. maxLen=${maxLen}.`});
        if(steps3b.length>70)break;
    }
    steps3b.push({msg:`Done! Answer=${maxLen}`,hl:{},lb:{},vars:{left,right:"done",map:"-",distinct:"-",maxLen},changed:new Set(["maxLen"]),codeLine:7,explanation:`All elements processed. Maximum fruits collectible = ${maxLen}.`});
    stepIdx3b=0;
}
function render3b(){
    const s=steps3b[stepIdx3b];if(!s)return;const arr=TCS_3b[tcIdx3b].data;
    const boxW=42,boxH=40,gap=4,startX=10,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg3b').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state3b').innerHTML=stHtml;
    let cHtml='';CODE_LINES_3b.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code3b').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx3b;i++){logHtml+=`<div style="color:${i===stepIdx3b?'#93c5fd':'#52525b'}">${i===stepIdx3b?'▶ ':'  '}${steps3b[i].msg}</div>`;}document.getElementById('log3b').innerHTML=logHtml;document.getElementById('log3b').scrollTop=99999;
    document.getElementById('expl3b').innerHTML=s.explanation;document.getElementById('stepLabel3b').textContent=`Step ${stepIdx3b+1} / ${steps3b.length}`;document.getElementById('prev3b').disabled=stepIdx3b<=0;document.getElementById('next3b').disabled=stepIdx3b>=steps3b.length-1;
}
function next3b(){if(stepIdx3b<steps3b.length-1){stepIdx3b++;render3b();}}
function prev3b(){if(stepIdx3b>0){stepIdx3b--;render3b();}}
function toggleAuto3b(){if(autoInt3b){clearInterval(autoInt3b);autoInt3b=null;document.getElementById('auto3b').textContent='▶ Auto';}else{autoInt3b=setInterval(()=>{if(stepIdx3b>=steps3b.length-1){toggleAuto3b();return;}next3b();},800);document.getElementById('auto3b').textContent='⏸ Pause';}}
function loadTc3b(idx){tcIdx3b=idx;stepIdx3b=0;buildSteps3b(TCS_3b[idx]);document.querySelectorAll('[data-tc3b]').forEach((b,i)=>{b.className=i===idx?'viz3b-btn active':'viz3b-btn';});render3b();}
const tcBar3b=document.getElementById('tcBar3b');TCS_3b.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz3b-btn active':'viz3b-btn';b.setAttribute('data-tc3b','');b.onclick=()=>loadTc3b(i);tcBar3b.appendChild(b);});
buildSteps3b(TCS_3b[0]);render3b();
</script>
</div>
