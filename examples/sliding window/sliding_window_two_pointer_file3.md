# Number of Substrings Containing All Three Characters

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/
**GFG:** https://www.geeksforgeeks.org/number-of-substrings-containing-all-three-characters/

## Description

Given a string `s` consisting only of characters 'a', 'b', and 'c', return the number of substrings that contain at least one occurrence of all three characters 'a', 'b', and 'c'.

**Input:** A string `s` containing only 'a', 'b', and 'c'.
**Output:** An integer — the count of substrings containing all three characters.

**Constraints:**
- `3 <= s.length <= 5 * 10^4`
- `s` consists only of 'a', 'b', and 'c'

**Example 1:**
Input: `s = "abcabc"`
Output: `10`
Explanation: The substrings containing all three characters are: "abc" (0-2), "abca" (0-3), "abcab" (0-4), "abcabc" (0-5), "bca" (1-3), "bcab" (1-4), "bcabc" (1-5), "cab" (2-4), "cabc" (2-5), "abc" (3-5). Total = 10.

**Example 2:**
Input: `s = "aaacb"`
Output: `3`
Explanation: "aaacb" (0-4), "aacb" (1-4), "acb" (2-4). Total = 3.

**Example 3:**
Input: `s = "abc"`
Output: `1`
Explanation: Only "abc" itself contains all three.

**Edge Cases:**
- Missing one character entirely → 0
- All same character → 0
- Minimum length 3 with one of each → 1

## In-depth Explanation

**Reframe:** Count substrings where each of 'a', 'b', 'c' appears at least once. This is a "count subarrays satisfying a minimum constraint" problem.

**Pattern recognition:** This is a **sliding window counting** problem. The key insight: once a window [left, right] contains all three characters, EVERY extension of right further to the right also contains all three. So we count by finding the smallest valid window for each left, then adding the number of valid extensions.

**Real-world analogy:** You're scanning a document for paragraphs that mention all three topics A, B, and C. Once you find the shortest paragraph starting at position `left` that mentions all three, every longer paragraph starting at the same `left` also mentions all three. So you count them all at once: `n - right + 1` (from the shortest valid endpoint to the end of the document).

**Why naive fails:** Checking all O(n²) substrings and verifying all three characters is too slow for n = 50,000.

**Approach roadmap:**
- **Brute Force:** For each (i, j), check if all three characters present → O(n²)
- **Optimal (Sliding Window):** For each left, find the smallest right where all three present. Count = n - right (all extensions valid) → O(n)

**Interview cheat sheet:**
- **Keywords:** "number of substrings", "containing all three", "at least one of each"
- **What makes this different:** Instead of "longest/shortest window," we COUNT windows. The trick is: once valid, all extensions are valid.
- **The "aha moment":** For a valid window ending at right, there are `n - right` valid substrings starting at left (from right to n-1 as the ending point).
- **Memory hook:** "Find smallest valid window, count all extensions: n - minRight"

## Brute Force Intuition

For every pair (i, j) where j ≥ i+2, check if the substring s[i..j] contains at least one 'a', one 'b', and one 'c'. If so, increment count. Use frequency tracking to check the condition.

## Brute Force Step-by-Step Solution

Trace: `s = "aaacb"`.

**Step 1: Initialize**

Code executing: `int count = 0;`
- count = 0. We try every pair (i, j).

**Step 2: i=0, extend j, tracking character presence**

Code executing: `freq[s.charAt(j) - 'a']++;`

j=0: 'a', freq={a:1,b:0,c:0}. Not all three present. Continue.
j=1: 'a', freq={a:2,b:0,c:0}. Missing b and c.
j=2: 'a', freq={a:3,b:0,c:0}. Missing b and c.
j=3: 'c', freq={a:3,b:0,c:1}. Missing b.
j=4: 'b', freq={a:3,b:1,c:1}. All three present! count=1.
End of string.

**Step 3: i=1, extend j**

j=1: freq={a:1}. j=2: freq={a:2}. j=3: freq={a:2,c:1}. j=4: freq={a:2,b:1,c:1}. All present! count=2.

**Step 4: i=2, extend j**

j=2: freq={a:1}. j=3: freq={a:1,c:1}. j=4: freq={a:1,b:1,c:1}. All present! count=3.

**Step 5: i=3 and i=4**

From i=3: "cb" — only 2 chars, max length 2, can't have all three. From i=4: "b" — too short.

**Final:** count = 3.

**Correctness argument:** Exhaustive check of all substrings. The frequency array correctly tracks character presence.

**Key invariant:** freq[ch] holds the count of character ch in s[i..j].

**Common mistakes:**
1. Checking only substrings of length exactly 3 — longer substrings can also be valid.
2. Resetting frequency array inside the wrong loop — must reset for each new i.

**30-second interview pitch:** "I check every substring by fixing a start, extending right while tracking character frequencies. When all three characters have count ≥ 1, it's valid. O(n²) time."

## Brute Force In-depth Intuition

The brute force is straightforward: we maintain a frequency array of size 3 (for 'a', 'b', 'c'). As we extend j rightward, we increment the corresponding frequency. The substring is valid when all three frequencies are ≥ 1. Once valid, ALL further extensions (j+1, j+2, ..., n-1) are also valid because we're only adding characters. We could optimize by counting `n - j` instead of continuing, but the pure brute force checks each.

## Brute Force Algorithm

```
function numberOfSubstrings(s):
    count = 0
    n = length(s)
    for i from 0 to n-1:
        freq = [0, 0, 0]
        for j from i to n-1:
            freq[s[j] - 'a']++
            if freq[0] >= 1 and freq[1] >= 1 and freq[2] >= 1:
                count++
    return count
```

The outer loop fixes the start. The inner loop extends the end. We check if all three characters are present at each step.

## Brute Force Code

```java
class Solution {
    public int numberOfSubstrings(String s) {
        int count = 0;
        int n = s.length();
        for (int i = 0; i < n; i++) {
            int[] freq = new int[3];
            for (int j = i; j < n; j++) {
                freq[s.charAt(j) - 'a']++;
                if (freq[0] >= 1 && freq[1] >= 1 && freq[2] >= 1) {
                    count++;
                }
            }
        }
        return count;
    }
}
```

## Brute Force Complexity

**Time: O(n²)** — Two nested loops. The check inside is O(1) since we only check 3 elements.

**Space: O(1)** — Frequency array of fixed size 3.

## Brute Force Hints

1. What makes a substring valid? It contains at least one 'a', one 'b', and one 'c'.
2. If s[i..j] is valid, is s[i..j+1] also valid? Yes — adding characters can't remove existing ones.
3. So once you find the first valid j for a given i, every j beyond it is also valid.
4. How many valid substrings starting at i if the first valid j is `minJ`? Answer: n - minJ.
5. Can you use this observation to avoid the inner loop?

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz7a-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz7a-grid{grid-template-columns:1fr}}
.viz7a-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz7a-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz7a-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz7a-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz7a-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz7a-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz7a-btn:disabled{opacity:0.3}
.viz7a-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar7a"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz7a-btn" id="prev7a" onclick="prev7a()">← Prev</button>
  <button class="viz7a-btn" id="next7a" onclick="next7a()">Next →</button>
  <button class="viz7a-btn" id="auto7a" onclick="toggleAuto7a()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel7a">Ready</span>
</div>
<div class="viz7a-grid">
  <div>
    <div class="viz7a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">String & Window</div>
      <svg id="svg7a" width="100%" viewBox="0 0 450 120"></svg>
    </div>
    <div class="viz7a-state" id="state7a"></div>
    <div class="viz7a-code" id="code7a"></div>
  </div>
  <div>
    <div class="viz7a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz7a-log" id="log7a"></div>
    </div>
    <div class="viz7a-expl" id="expl7a"></div>
  </div>
</div>
<script>
const TCS_7a=[{name:"abcabc",data:"abcabc"},{name:"aaacb",data:"aaacb"},{name:"abc",data:"abc"}];
let steps7a=[],stepIdx7a=-1,autoInt7a=null,tcIdx7a=0;
const CODE_LINES_7a=["for i from 0 to n-1:","    freq = [0,0,0]","    for j from i to n-1:","        freq[s[j]-'a']++","        if all freq>=1: count++","return count"];
function buildSteps7a(tc){
    steps7a=[];const s=tc.data,n=s.length;let count=0;
    steps7a.push({msg:"Init: count=0",hl:{},lb:{},vars:{i:"-",j:"-","freq[a]":0,"freq[b]":0,"freq[c]":0,valid:"no",count:0},changed:new Set(["count"]),codeLine:-1,explanation:"Count substrings containing at least one 'a', one 'b', and one 'c'."});
    for(let i=0;i<n&&steps7a.length<55;i++){
        const freq=[0,0,0];
        for(let j=i;j<n;j++){
            freq[s.charCodeAt(j)-97]++;
            const valid=freq[0]>=1&&freq[1]>=1&&freq[2]>=1;
            const hl={};for(let x=i;x<=j;x++)hl[x]=valid?'#22c55e':'#2563eb';hl[j]='#4f8ff7';
            const lb={};lb[i]="i";lb[j]=j===i?"i,j":"j";
            if(valid){count++;
                steps7a.push({msg:`i=${i},j=${j}: "${s.substring(i,j+1)}" ✓ count=${count}`,hl,lb,vars:{i,j,"freq[a]":freq[0],"freq[b]":freq[1],"freq[c]":freq[2],valid:"YES",count},changed:new Set(["j","freq["+s[j]+"]","count","valid"]),codeLine:4,explanation:`"${s.substring(i,j+1)}" has a:${freq[0]}, b:${freq[1]}, c:${freq[2]}. All ≥1! Valid substring. count=${count}.`});
            }else{
                steps7a.push({msg:`i=${i},j=${j}: "${s.substring(i,j+1)}" ✗`,hl,lb,vars:{i,j,"freq[a]":freq[0],"freq[b]":freq[1],"freq[c]":freq[2],valid:"no",count},changed:new Set(["j","freq["+s[j]+"]"]),codeLine:3,explanation:`"${s.substring(i,j+1)}" has a:${freq[0]}, b:${freq[1]}, c:${freq[2]}. Missing ${freq[0]===0?'a':''}${freq[1]===0?'b':''}${freq[2]===0?'c':''}.`});
            }
            if(steps7a.length>=55)break;
        }
    }
    steps7a.push({msg:`Done! Answer=${count}`,hl:{},lb:{},vars:{i:"done",j:"done","freq[a]":"-","freq[b]":"-","freq[c]":"-",valid:"-",count},changed:new Set(["count"]),codeLine:5,explanation:`All substrings checked. Total substrings with all three characters = ${count}.`});
    stepIdx7a=0;
}
function render7a(){
    const s=steps7a[stepIdx7a];if(!s)return;const arr=TCS_7a[tcIdx7a].data.split('');
    const boxW=48,boxH=40,gap=4,startX=20,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg7a').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state7a').innerHTML=stHtml;
    let cHtml='';CODE_LINES_7a.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code7a').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx7a;i++){logHtml+=`<div style="color:${i===stepIdx7a?'#93c5fd':'#52525b'}">${i===stepIdx7a?'▶ ':'  '}${steps7a[i].msg}</div>`;}document.getElementById('log7a').innerHTML=logHtml;document.getElementById('log7a').scrollTop=99999;
    document.getElementById('expl7a').innerHTML=s.explanation;document.getElementById('stepLabel7a').textContent=`Step ${stepIdx7a+1} / ${steps7a.length}`;document.getElementById('prev7a').disabled=stepIdx7a<=0;document.getElementById('next7a').disabled=stepIdx7a>=steps7a.length-1;
}
function next7a(){if(stepIdx7a<steps7a.length-1){stepIdx7a++;render7a();}}
function prev7a(){if(stepIdx7a>0){stepIdx7a--;render7a();}}
function toggleAuto7a(){if(autoInt7a){clearInterval(autoInt7a);autoInt7a=null;document.getElementById('auto7a').textContent='▶ Auto';}else{autoInt7a=setInterval(()=>{if(stepIdx7a>=steps7a.length-1){toggleAuto7a();return;}next7a();},800);document.getElementById('auto7a').textContent='⏸ Pause';}}
function loadTc7a(idx){tcIdx7a=idx;stepIdx7a=0;buildSteps7a(TCS_7a[idx]);document.querySelectorAll('[data-tc7a]').forEach((b,i)=>{b.className=i===idx?'viz7a-btn active':'viz7a-btn';});render7a();}
const tcBar7a=document.getElementById('tcBar7a');TCS_7a.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz7a-btn active':'viz7a-btn';b.setAttribute('data-tc7a','');b.onclick=()=>loadTc7a(i);tcBar7a.appendChild(b);});
buildSteps7a(TCS_7a[0]);render7a();
</script>
</div>

## Optimal Intuition

Use a sliding window with a twist: instead of finding the longest/shortest window, we COUNT valid windows. For each `right`, we expand the window. Once [left, right] contains all three characters, we shrink `left` as far as possible while maintaining validity. At that point, all left positions from 0 to `left` would produce a valid window ending at `right`. So we add `left + 1` to the count. Alternatively, for each `left`, find the minimum `right` where the window is valid, then add `n - right` (all extensions are valid).

## Optimal Step-by-Step Solution

Trace: `s = "abcabc"`, using the approach: for each `right`, shrink left while window has all three, then count += left.

Actually, let's use the cleaner approach: track `lastSeen` positions for each character. For each `right`, the smallest valid starting position is `min(lastSeen['a'], lastSeen['b'], lastSeen['c'])`. All starting positions from 0 to that minimum produce valid substrings. So count += `min(lastSeen) + 1`.

**Step 1: Initialize**

Code executing: `int[] last = {-1, -1, -1}; int count = 0;`
- last = [-1, -1, -1] (last seen positions of a, b, c). count = 0.

**Step 2: right=0, character 'a'**

Code executing: `last[s.charAt(right) - 'a'] = right;`

Update last['a'] = 0. last = [0, -1, -1]. min(last) = -1. Since -1 < 0, no valid substrings yet.
- count += (-1) + 1 = 0. count = 0.

Why: We haven't seen 'b' or 'c' yet, so no substring ending here can contain all three.

**Step 3: right=1, character 'b'**

Update last['b'] = 1. last = [0, 1, -1]. min(last) = -1. Still missing 'c'.
- count += 0. count = 0.

**Step 4: right=2, character 'c'**

Update last['c'] = 2. last = [0, 1, 2]. min(last) = 0. All three present!
- count += 0 + 1 = 1. count = 1.

Why: The only valid starting position for a substring ending at index 2 is index 0 (giving "abc"). Starting at 1 gives "bc" (no 'a'), starting at 2 gives "c" (no 'a','b').

**Step 5: right=3, character 'a'**

Update last['a'] = 3. last = [3, 1, 2]. min(last) = 1. 
- count += 1 + 1 = 2. count = 3.

Why: Substrings ending at index 3 that contain all three: starting at 0 → "abca" ✓, starting at 1 → "bca" ✓. Starting at 2 → "ca" (no 'b'). So 2 valid substrings.

**Step 6: right=4, character 'b'**

Update last['b'] = 4. last = [3, 4, 2]. min(last) = 2.
- count += 2 + 1 = 3. count = 6.

Why: Starting at 0 → "abcab" ✓, 1 → "bcab" ✓, 2 → "cab" ✓. Starting at 3 → "ab" (no 'c'). So 3 valid.

**Step 7: right=5, character 'c'**

Update last['c'] = 5. last = [3, 4, 5]. min(last) = 3.
- count += 3 + 1 = 4. count = 10.

Why: Starting at 0,1,2,3 all produce valid substrings ending at 5. Starting at 4 → "bc" (no 'a').

**Final:** count = 10.

**Correctness argument:** For each ending position `right`, we need the earliest required starting position. The last-seen array tells us: to include all three characters, we must start at or before the minimum of the three last-seen positions. So starting positions 0 through min(last) are all valid, giving min(last) + 1 substrings.

**Key invariant:** last[ch] is always the most recent index where character ch appeared. min(last) gives the tightest constraint on the starting position.

**Common mistakes:**
1. Using `max(last)` instead of `min(last)` — we need the character that was seen EARLIEST (the bottleneck).
2. Forgetting to add 1 to the count (it's min(last) + 1, not min(last), since positions are 0-indexed).

**30-second interview pitch:** "I track the last-seen index of each character. For each position right, the number of valid substrings ending there is min(lastSeen['a'], lastSeen['b'], lastSeen['c']) + 1, because any start position from 0 to that minimum guarantees all three characters are included. O(n) time, O(1) space."

## Optimal In-depth Intuition

The mathematical insight is elegant: a substring s[i..right] contains all three characters if and only if i ≤ last['a'] AND i ≤ last['b'] AND i ≤ last['c'], which simplifies to i ≤ min(last['a'], last['b'], last['c']). The number of valid i values is min(last) + 1 (from 0 to min(last) inclusive).

This is fundamentally different from the atMost trick used in counting problems. Here, we don't need two passes because the constraint is "at least" rather than "exactly." The "at least" constraint has a nice property: once satisfied, extending the starting position leftward (earlier) only adds more characters, maintaining validity. So we count from the right end backward.

This pattern generalizes to any "count substrings containing at least one of each character in a set" problem. For a set of K characters, track last-seen positions and count += min(lastSeen) + 1 at each step.

## Optimal Algorithm

```
function numberOfSubstrings(s):
    last = [-1, -1, -1]     // last seen index of a, b, c
    count = 0
    for right from 0 to n-1:
        last[s[right] - 'a'] = right
        count += min(last[0], last[1], last[2]) + 1
    return count
```

At each step, update the last-seen index and add the number of valid starting positions. The min of the three last-seen values is the furthest-right character that constrains us.

## Optimal Code

```java
class Solution {
    public int numberOfSubstrings(String s) {
        int[] last = {-1, -1, -1}; // last seen index of 'a', 'b', 'c'
        int count = 0;
        for (int right = 0; right < s.length(); right++) {
            last[s.charAt(right) - 'a'] = right;
            // All starting positions from 0 to min(last) are valid
            count += Math.min(last[0], Math.min(last[1], last[2])) + 1;
        }
        return count;
    }
}
```

## Optimal Complexity

**Time: O(n)** — Single pass through the string. Each iteration does O(1) work (update last, compute min of 3 values).

**Space: O(1)** — Only an array of size 3 and a counter. Constant extra space.

## Optimal Hints

1. If the window [i..right] is valid, is [i-1..right] also valid (if i > 0)? Yes — a wider window still has all three characters.
2. So for each right, what's the LATEST i can be while still being valid?
3. That latest i is determined by which character was seen LEAST recently.
4. Track when you last saw each character. The minimum of these three values is the critical boundary.
5. Valid starting positions: 0, 1, ..., min(lastSeen). That's min(lastSeen) + 1 substrings.
6. If any character hasn't been seen yet (lastSeen = -1), min is -1, giving 0 valid substrings. Correct!

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz7b-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz7b-grid{grid-template-columns:1fr}}
.viz7b-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz7b-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz7b-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz7b-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz7b-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz7b-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz7b-btn:disabled{opacity:0.3}
.viz7b-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar7b"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz7b-btn" id="prev7b" onclick="prev7b()">← Prev</button>
  <button class="viz7b-btn" id="next7b" onclick="next7b()">Next →</button>
  <button class="viz7b-btn" id="auto7b" onclick="toggleAuto7b()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel7b">Ready</span>
</div>
<div class="viz7b-grid">
  <div>
    <div class="viz7b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">String & Last Seen</div>
      <svg id="svg7b" width="100%" viewBox="0 0 450 140"></svg>
    </div>
    <div class="viz7b-state" id="state7b"></div>
    <div class="viz7b-code" id="code7b"></div>
  </div>
  <div>
    <div class="viz7b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz7b-log" id="log7b"></div>
    </div>
    <div class="viz7b-expl" id="expl7b"></div>
  </div>
</div>
<script>
const TCS_7b=[{name:"abcabc",data:"abcabc"},{name:"aaacb",data:"aaacb"},{name:"abbbcba",data:"abbbcba"}];
let steps7b=[],stepIdx7b=-1,autoInt7b=null,tcIdx7b=0;
const CODE_LINES_7b=["for right from 0 to n-1:","    last[s[right]-'a'] = right","    minLast = min(last[0],last[1],last[2])","    count += minLast + 1","return count"];

function buildSteps7b(tc){
    steps7b=[];const s=tc.data,n=s.length;let count=0;const last=[-1,-1,-1];
    steps7b.push({msg:"Init: last=[-1,-1,-1], count=0",hl:{},lb:{},vars:{"last[a]":-1,"last[b]":-1,"last[c]":-1,minLast:-1,added:0,count:0},changed:new Set(["count"]),codeLine:-1,explanation:"Track the last seen index of each character. Initially all -1 (unseen)."});
    for(let right=0;right<n;right++){
        const ch=s[right];const ci=ch.charCodeAt(0)-97;
        last[ci]=right;
        const minL=Math.min(last[0],Math.min(last[1],last[2]));
        const added=minL+1;
        count+=added;
        const hl={};
        // Highlight valid starting range in green
        for(let x=0;x<=minL;x++)hl[x]='#22c55e';
        // Highlight current position
        for(let x=Math.max(0,minL+1);x<=right;x++)hl[x]='#2563eb';
        hl[right]='#4f8ff7';
        // Mark last seen positions
        const lb={};
        if(last[0]>=0)lb[last[0]]=(lb[last[0]]||"")+"a";
        if(last[1]>=0)lb[last[1]]=(lb[last[1]]||"")+"b";
        if(last[2]>=0)lb[last[2]]=(lb[last[2]]||"")+"c";
        lb[right]=(lb[right]||"")+"→";
        steps7b.push({msg:`r=${right}: '${ch}', min=${minL}, +${added}, count=${count}`,hl,lb,vars:{"last[a]":last[0],"last[b]":last[1],"last[c]":last[2],minLast:minL,added,count},changed:new Set(["last["+ch+"]","minLast","added","count"]),codeLine:3,explanation:`Update last['${ch}']=${right}. last=[${last}]. min(last)=${minL}. ${minL>=0?`Valid starts: 0..${minL} = ${added} substrings ending at ${right}.`:'Some character not yet seen, 0 valid substrings.'} count=${count}.`});
    }
    steps7b.push({msg:`Done! Answer=${count}`,hl:{},lb:{},vars:{"last[a]":last[0],"last[b]":last[1],"last[c]":last[2],minLast:"-",added:"-",count},changed:new Set(["count"]),codeLine:4,explanation:`All positions processed. Total substrings with all three characters = ${count}.`});
    stepIdx7b=0;
}
function render7b(){
    const s=steps7b[stepIdx7b];if(!s)return;const arr=TCS_7b[tcIdx7b].data.split('');
    const boxW=48,boxH=40,gap=4,startX=20,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="9" font-weight="600" fill="#fbbf24" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg7b').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state7b').innerHTML=stHtml;
    let cHtml='';CODE_LINES_7b.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code7b').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx7b;i++){logHtml+=`<div style="color:${i===stepIdx7b?'#93c5fd':'#52525b'}">${i===stepIdx7b?'▶ ':'  '}${steps7b[i].msg}</div>`;}document.getElementById('log7b').innerHTML=logHtml;document.getElementById('log7b').scrollTop=99999;
    document.getElementById('expl7b').innerHTML=s.explanation;document.getElementById('stepLabel7b').textContent=`Step ${stepIdx7b+1} / ${steps7b.length}`;document.getElementById('prev7b').disabled=stepIdx7b<=0;document.getElementById('next7b').disabled=stepIdx7b>=steps7b.length-1;
}
function next7b(){if(stepIdx7b<steps7b.length-1){stepIdx7b++;render7b();}}
function prev7b(){if(stepIdx7b>0){stepIdx7b--;render7b();}}
function toggleAuto7b(){if(autoInt7b){clearInterval(autoInt7b);autoInt7b=null;document.getElementById('auto7b').textContent='▶ Auto';}else{autoInt7b=setInterval(()=>{if(stepIdx7b>=steps7b.length-1){toggleAuto7b();return;}next7b();},800);document.getElementById('auto7b').textContent='⏸ Pause';}}
function loadTc7b(idx){tcIdx7b=idx;stepIdx7b=0;buildSteps7b(TCS_7b[idx]);document.querySelectorAll('[data-tc7b]').forEach((b,i)=>{b.className=i===idx?'viz7b-btn active':'viz7b-btn';});render7b();}
const tcBar7b=document.getElementById('tcBar7b');TCS_7b.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz7b-btn active':'viz7b-btn';b.setAttribute('data-tc7b','');b.onclick=()=>loadTc7b(i);tcBar7b.appendChild(b);});
buildSteps7b(TCS_7b[0]);render7b();
</script>
</div>

---

# Maximum Points You Can Obtain from Cards

**Difficulty:** Medium
**LeetCode:** https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/
**GFG:** https://www.geeksforgeeks.org/maximum-points-you-can-obtain-from-cards/

## Description

There are several cards arranged in a row, and each card has an associated number of points given by `cardPoints[i]`. In one step, you can take one card from the beginning or the end of the row. You must take exactly `k` cards. Your score is the sum of the points of the cards you have taken. Return the maximum score you can obtain.

**Input:** An integer array `cardPoints` and an integer `k`.
**Output:** The maximum sum of exactly k cards taken from the beginning and/or end.

**Constraints:**
- `1 <= cardPoints.length <= 10^5`
- `1 <= cardPoints[i] <= 10^4`
- `1 <= k <= cardPoints.length`

**Example 1:**
Input: `cardPoints = [1,2,3,4,5,6,1], k = 3`
Output: `12`
Explanation: Take 1 from the right, then 6 and 5. Total = 1 + 6 + 5 = 12. Or take the three rightmost: 1+6+5=12. Actually the best: take 6,5,1 from right = 12.

**Example 2:**
Input: `cardPoints = [2,2,2], k = 2`
Output: `4`
Explanation: Take any 2 cards, each worth 2. Total = 4.

**Example 3:**
Input: `cardPoints = [9,7,7,9,7,7,9], k = 7`
Output: `55`
Explanation: Take all 7 cards. Sum = 55.

**Edge Cases:**
- k = n → take all cards, return total sum
- k = 1 → return max(first, last)
- All equal values → return k × value

## In-depth Explanation

**Reframe:** Taking k cards from the beginning and/or end is equivalent to leaving a contiguous subarray of size (n - k) in the middle. Maximize points taken = Total sum - minimize the sum of the remaining (n - k) contiguous cards. So we need the **minimum sum subarray of size (n - k)**.

**Pattern recognition:** This is a **fixed-size sliding window** problem in disguise. Instead of directly choosing from ends, we find the minimum-sum window of size (n - k), then subtract from the total.

**Real-world analogy:** You have a necklace of beads with values. You must remove a contiguous section of (n-k) beads and keep the rest. To maximize what you keep, minimize what you remove. Slide a window of size (n-k) across the necklace to find the minimum-value section.

**Why naive fails:** Trying all 2^k combinations of "take from left" vs "take from right" is exponential. Even trying all (k+1) splits (take i from left, k-i from right) is O(k), which is fine — but the sliding window approach is also O(n) and introduces a powerful technique.

**Approach roadmap:**
- **Brute Force:** Try all k+1 ways to split: take i from left, k-i from right → O(k)
- **Optimal (Sliding Window):** Find minimum sum window of size (n-k), answer = totalSum - minWindowSum → O(n)

**Interview cheat sheet:**
- **Keywords:** "take from beginning or end", "exactly k cards", "maximum score"
- **What makes this different:** The "take from ends" constraint maps to "leave a window in the middle" — a classic inversion
- **The "aha moment":** Maximize taken = Total - Minimize remaining. Remaining is a contiguous window of size n-k.
- **Memory hook:** "Flip it: minimize the middle window to maximize the edges"

## Brute Force Intuition

We must pick exactly k cards, some from the left end and some from the right end. If we take `i` from the left (0 ≤ i ≤ k), we take `k - i` from the right. Compute the sum for each split and return the maximum. We can precompute prefix sums for O(1) per split.

## Brute Force Step-by-Step Solution

Trace: `cardPoints = [1,2,3,4,5,6,1], k = 3`.

**Step 1: Compute prefix sums from left and suffix sums from right**

Code executing: `leftSum[i] = sum of first i cards; rightSum[i] = sum of last i cards;`

leftSum: [0, 1, 3, 6, 10, 15, 21, 22]
rightSum: [0, 1, 7, 12, 16, 19, 21, 22]

(leftSum[i] = sum of cardPoints[0..i-1], rightSum[i] = sum of cardPoints[n-i..n-1])

**Step 2: Try split i=0 (take 0 from left, 3 from right)**

sum = leftSum[0] + rightSum[3] = 0 + 12 = 12.
Taking cards: [6, 1, ...wait]. rightSum[3] = 1 + 6 + 5 = 12. Yes, take the last 3: [5, 6, 1].
- maxScore = 12.

**Step 3: Try split i=1 (take 1 from left, 2 from right)**

sum = leftSum[1] + rightSum[2] = 1 + 7 = 8.
Taking cards: [1] from left + [6, 1] from right.
- maxScore stays 12.

**Step 4: Try split i=2 (take 2 from left, 1 from right)**

sum = leftSum[2] + rightSum[1] = 3 + 1 = 4.
- maxScore stays 12.

**Step 5: Try split i=3 (take 3 from left, 0 from right)**

sum = leftSum[3] + rightSum[0] = 6 + 0 = 6.
- maxScore stays 12.

**Final:** maxScore = 12.

**Correctness argument:** We try every possible way to split k picks between left and right. Prefix/suffix sums give O(1) per query.

**Key invariant:** leftSum[i] + rightSum[k-i] gives the exact score for taking i from the left and k-i from the right.

**Common mistakes:**
1. Not handling the edge case where k = n (take all cards).
2. Off-by-one in prefix/suffix sum indices.

**30-second interview pitch:** "I precompute prefix sums from the left and suffix sums from the right. Then I try all k+1 ways to split the picks: take i from left, k-i from right. For each, the score is prefixLeft[i] + suffixRight[k-i]. O(k) time."

## Brute Force In-depth Intuition

This approach directly models the decision: at each step, we take from the left or right. But instead of simulating step-by-step (which would require recursion/DP), we observe that the final selection must consist of some prefix of length i and some suffix of length k-i. Since these don't overlap (as long as i + (k-i) = k ≤ n), we can independently compute their sums using prefix arrays. This is O(k) for the enumeration and O(n) for the precomputation.

## Brute Force Algorithm

```
function maxScore(cardPoints, k):
    n = length(cardPoints)
    // Compute prefix sums (left) and suffix sums (right)
    leftSum = array of size k+1, leftSum[0] = 0
    for i from 1 to k:
        leftSum[i] = leftSum[i-1] + cardPoints[i-1]
    rightSum = array of size k+1, rightSum[0] = 0
    for i from 1 to k:
        rightSum[i] = rightSum[i-1] + cardPoints[n-i]
    // Try all splits
    maxScore = 0
    for i from 0 to k:
        maxScore = max(maxScore, leftSum[i] + rightSum[k-i])
    return maxScore
```

Precompute prefix and suffix sums of length up to k. Enumerate all splits.

## Brute Force Code

```java
class Solution {
    public int maxScore(int[] cardPoints, int k) {
        int n = cardPoints.length;
        int[] leftSum = new int[k + 1];
        int[] rightSum = new int[k + 1];
        for (int i = 1; i <= k; i++) {
            leftSum[i] = leftSum[i - 1] + cardPoints[i - 1];
        }
        for (int i = 1; i <= k; i++) {
            rightSum[i] = rightSum[i - 1] + cardPoints[n - i];
        }
        int maxScore = 0;
        for (int i = 0; i <= k; i++) {
            maxScore = Math.max(maxScore, leftSum[i] + rightSum[k - i]);
        }
        return maxScore;
    }
}
```

## Brute Force Complexity

**Time: O(k)** — Building prefix/suffix arrays takes O(k). Enumerating splits takes O(k). Total O(k). Since k ≤ n, this is efficient.

**Space: O(k)** — Two arrays of size k+1.

## Brute Force Hints

1. If you take i cards from the left, how many from the right? k - i.
2. Can you precompute the sum of the first i cards efficiently? Prefix sum.
3. Can you precompute the sum of the last i cards? Suffix sum.
4. How many possible splits are there? k + 1 (i from 0 to k).
5. What's the relationship between this and a sliding window approach?

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz8a-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz8a-grid{grid-template-columns:1fr}}
.viz8a-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz8a-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz8a-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz8a-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz8a-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz8a-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz8a-btn:disabled{opacity:0.3}
.viz8a-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar8a"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz8a-btn" id="prev8a" onclick="prev8a()">← Prev</button>
  <button class="viz8a-btn" id="next8a" onclick="next8a()">Next →</button>
  <button class="viz8a-btn" id="auto8a" onclick="toggleAuto8a()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel8a">Ready</span>
</div>
<div class="viz8a-grid">
  <div>
    <div class="viz8a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Cards (green=taken, gray=left)</div>
      <svg id="svg8a" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz8a-state" id="state8a"></div>
    <div class="viz8a-code" id="code8a"></div>
  </div>
  <div>
    <div class="viz8a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz8a-log" id="log8a"></div>
    </div>
    <div class="viz8a-expl" id="expl8a"></div>
  </div>
</div>
<script>
const TCS_8a=[{name:"[1,2,3,4,5,6,1] k=3",data:[1,2,3,4,5,6,1],k:3},{name:"[2,2,2] k=2",data:[2,2,2],k:2},{name:"[9,7,7,9,7,7,9] k=7",data:[9,7,7,9,7,7,9],k:7}];
let steps8a=[],stepIdx8a=-1,autoInt8a=null,tcIdx8a=0;
const CODE_LINES_8a=["compute leftSum[0..k]","compute rightSum[0..k]","for i from 0 to k:","    score = leftSum[i]+rightSum[k-i]","    maxScore = max(maxScore, score)","return maxScore"];

function buildSteps8a(tc){
    steps8a=[];const cards=tc.data,k=tc.k,n=cards.length;
    const ls=[0],rs=[0];
    for(let i=1;i<=k;i++)ls.push(ls[i-1]+cards[i-1]);
    for(let i=1;i<=k;i++)rs.push(rs[i-1]+cards[n-i]);
    steps8a.push({msg:`Init: k=${k}, n=${n}`,hl:{},lb:{},vars:{k,n,leftSum:JSON.stringify(ls),rightSum:JSON.stringify(rs),i:"-",score:"-",maxScore:0},changed:new Set(["k","leftSum","rightSum"]),codeLine:0,explanation:`Precompute prefix sums: leftSum[i]=sum of first i cards, rightSum[i]=sum of last i cards.`});
    let maxScore=0;
    for(let i=0;i<=k;i++){
        const score=ls[i]+rs[k-i];
        maxScore=Math.max(maxScore,score);
        const hl={};
        for(let x=0;x<i;x++)hl[x]='#22c55e';
        for(let x=n-(k-i);x<n;x++)hl[x]='#22c55e';
        for(let x=i;x<n-(k-i);x++)hl[x]='#2a2a33';
        const lb={};if(i>0)lb[0]="←"+i;if(k-i>0)lb[n-1]=(k-i)+"→";
        steps8a.push({msg:`split ${i}L+${k-i}R: ${ls[i]}+${rs[k-i]}=${score}`,hl,lb,vars:{k,n,i,"fromLeft":i,"fromRight":k-i,leftScore:ls[i],rightScore:rs[k-i],score,maxScore},changed:new Set(["i","score","maxScore"]),codeLine:3,explanation:`Take ${i} from left (sum=${ls[i]}) and ${k-i} from right (sum=${rs[k-i]}). Total score = ${score}. maxScore = ${maxScore}.`});
    }
    steps8a.push({msg:`Done! Answer=${maxScore}`,hl:{},lb:{},vars:{k,n,i:"done",score:"-",maxScore},changed:new Set(["maxScore"]),codeLine:5,explanation:`Tried all ${k+1} splits. Maximum score = ${maxScore}.`});
    stepIdx8a=0;
}
function render8a(){
    const s=steps8a[stepIdx8a];if(!s)return;const arr=TCS_8a[tcIdx8a].data;
    const boxW=48,boxH=40,gap=4,startX=10,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=color==='#22c55e'?'#fafaf9':(color==='#2a2a33'?'#52525b':'#a1a1aa');svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg8a').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state8a').innerHTML=stHtml;
    let cHtml='';CODE_LINES_8a.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code8a').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx8a;i++){logHtml+=`<div style="color:${i===stepIdx8a?'#93c5fd':'#52525b'}">${i===stepIdx8a?'▶ ':'  '}${steps8a[i].msg}</div>`;}document.getElementById('log8a').innerHTML=logHtml;document.getElementById('log8a').scrollTop=99999;
    document.getElementById('expl8a').innerHTML=s.explanation;document.getElementById('stepLabel8a').textContent=`Step ${stepIdx8a+1} / ${steps8a.length}`;document.getElementById('prev8a').disabled=stepIdx8a<=0;document.getElementById('next8a').disabled=stepIdx8a>=steps8a.length-1;
}
function next8a(){if(stepIdx8a<steps8a.length-1){stepIdx8a++;render8a();}}
function prev8a(){if(stepIdx8a>0){stepIdx8a--;render8a();}}
function toggleAuto8a(){if(autoInt8a){clearInterval(autoInt8a);autoInt8a=null;document.getElementById('auto8a').textContent='▶ Auto';}else{autoInt8a=setInterval(()=>{if(stepIdx8a>=steps8a.length-1){toggleAuto8a();return;}next8a();},800);document.getElementById('auto8a').textContent='⏸ Pause';}}
function loadTc8a(idx){tcIdx8a=idx;stepIdx8a=0;buildSteps8a(TCS_8a[idx]);document.querySelectorAll('[data-tc8a]').forEach((b,i)=>{b.className=i===idx?'viz8a-btn active':'viz8a-btn';});render8a();}
const tcBar8a=document.getElementById('tcBar8a');TCS_8a.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz8a-btn active':'viz8a-btn';b.setAttribute('data-tc8a','');b.onclick=()=>loadTc8a(i);tcBar8a.appendChild(b);});
buildSteps8a(TCS_8a[0]);render8a();
</script>
</div>

## Optimal Intuition

Instead of choosing which cards to take, think about which cards to LEAVE. We leave exactly (n - k) contiguous cards. To maximize the taken score, minimize the sum of the left-behind cards. Slide a window of size (n - k) across the array, find the minimum sum window, and subtract from the total sum.

## Optimal Step-by-Step Solution

Trace: `cardPoints = [1,2,3,4,5,6,1], k = 3`. Window size = n - k = 7 - 3 = 4.

**Step 1: Compute total sum**

Code executing: `int totalSum = Arrays.stream(cardPoints).sum();`

totalSum = 1+2+3+4+5+6+1 = 22.
- totalSum = 22, windowSize = 4

**Step 2: Compute initial window sum (first 4 elements)**

Code executing: `for (int i = 0; i < windowSize; i++) windowSum += cardPoints[i];`

windowSum = 1+2+3+4 = 10. This is the sum of cards we'd leave behind if we took from the right.
- windowSum = 10, minWindowSum = 10
- Window: indices [0..3] = [1,2,3,4]

**Step 3: Slide window to [1..4]**

Code executing: `windowSum += cardPoints[right] - cardPoints[right - windowSize];`

Slide right: add cardPoints[4]=5, remove cardPoints[0]=1. windowSum = 10 + 5 - 1 = 14.
- windowSum = 14, minWindowSum = min(10, 14) = 10
- Window: [2,3,4,5]

**Step 4: Slide window to [2..5]**

Add cardPoints[5]=6, remove cardPoints[1]=2. windowSum = 14 + 6 - 2 = 18.
- windowSum = 18, minWindowSum = 10
- Window: [3,4,5,6]

**Step 5: Slide window to [3..6]**

Add cardPoints[6]=1, remove cardPoints[2]=3. windowSum = 18 + 1 - 3 = 16.
- windowSum = 16, minWindowSum = 10
- Window: [4,5,6,1]

**Step 6: All positions checked**

The minimum window sum is 10 (window [0..3] = [1,2,3,4]).
- Answer = totalSum - minWindowSum = 22 - 10 = 12.

Verification: leaving [1,2,3,4] means taking [5,6,1] = 5+6+1 = 12. ✓

**Correctness argument:** Every possible selection of k cards from the ends corresponds to leaving some contiguous (n-k) cards in the middle. Minimizing the left-behind sum maximizes the taken sum. The sliding window checks all possible middle windows.

**Key invariant:** windowSum always holds the sum of the current window of size (n-k). minWindowSum tracks the minimum seen.

**Common mistakes:**
1. Using window size k instead of n-k — we're finding the window to LEAVE, not to take.
2. Not handling k = n separately — window size becomes 0, just return total sum.

**30-second interview pitch:** "I flip the problem: instead of maximizing what I take, I minimize what I leave. The left-behind cards form a contiguous window of size n-k. I slide this window across the array to find its minimum sum, then subtract from the total. O(n) time, O(1) space."

## Optimal In-depth Intuition

The inversion trick (maximize taken ↔ minimize remaining) is a powerful technique that appears in many problems. It works here because the taken cards always form a prefix plus a suffix (which is the complement of a contiguous middle section). This structural insight converts a seemingly complex "choose from two ends" problem into a standard fixed-size sliding window problem.

The fixed-size window is simpler than a variable-size window because we don't need a shrink condition — we simply add the new right element and remove the leftmost element at each slide. The window sum changes by exactly `cardPoints[right] - cardPoints[right - windowSize]` at each step.

This approach also generalizes: if we could take cards from any k positions (not just ends), the problem would be NP-hard. But the "ends only" constraint gives us the contiguous complement structure that makes it O(n).

## Optimal Algorithm

```
function maxScore(cardPoints, k):
    n = length(cardPoints)
    windowSize = n - k
    totalSum = sum of all cardPoints
    if windowSize == 0: return totalSum
    
    // Initial window: first windowSize elements
    windowSum = sum of cardPoints[0..windowSize-1]
    minWindowSum = windowSum
    
    // Slide window
    for right from windowSize to n-1:
        windowSum += cardPoints[right] - cardPoints[right - windowSize]
        minWindowSum = min(minWindowSum, windowSum)
    
    return totalSum - minWindowSum
```

Compute total sum, then slide a window of size (n-k) to find minimum sum. Answer = total - min window.

## Optimal Code

```java
class Solution {
    public int maxScore(int[] cardPoints, int k) {
        int n = cardPoints.length;
        int windowSize = n - k;
        int totalSum = 0;
        for (int p : cardPoints) totalSum += p;
        if (windowSize == 0) return totalSum;

        // Compute initial window sum
        int windowSum = 0;
        for (int i = 0; i < windowSize; i++) {
            windowSum += cardPoints[i];
        }
        int minWindowSum = windowSum;

        // Slide the window
        for (int right = windowSize; right < n; right++) {
            windowSum += cardPoints[right] - cardPoints[right - windowSize];
            minWindowSum = Math.min(minWindowSum, windowSum);
        }

        return totalSum - minWindowSum;
    }
}
```

## Optimal Complexity

**Time: O(n)** — Computing total sum is O(n). Initial window sum is O(n-k). Sliding the window is O(k). Total: O(n).

**Space: O(1)** — Only a few integer variables. No additional data structures.

## Optimal Hints

1. If you take k cards from the ends, what's left in the middle?
2. What's the size of the remaining contiguous section? n - k.
3. How do you maximize taken? Minimize remaining.
4. Can you find the minimum sum contiguous window of a fixed size efficiently?
5. At each slide, the sum changes by: +new_right - old_left.
6. What if k = n? Window size is 0, just return total sum.

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz8b-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz8b-grid{grid-template-columns:1fr}}
.viz8b-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz8b-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz8b-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz8b-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz8b-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz8b-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz8b-btn:disabled{opacity:0.3}
.viz8b-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar8b"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz8b-btn" id="prev8b" onclick="prev8b()">← Prev</button>
  <button class="viz8b-btn" id="next8b" onclick="next8b()">Next →</button>
  <button class="viz8b-btn" id="auto8b" onclick="toggleAuto8b()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel8b">Ready</span>
</div>
<div class="viz8b-grid">
  <div>
    <div class="viz8b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Cards (red=leave window, green=take)</div>
      <svg id="svg8b" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz8b-state" id="state8b"></div>
    <div class="viz8b-code" id="code8b"></div>
  </div>
  <div>
    <div class="viz8b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz8b-log" id="log8b"></div>
    </div>
    <div class="viz8b-expl" id="expl8b"></div>
  </div>
</div>
<script>
const TCS_8b=[{name:"[1,2,3,4,5,6,1] k=3",data:[1,2,3,4,5,6,1],k:3},{name:"[2,2,2] k=2",data:[2,2,2],k:2},{name:"[1,79,80,1,1,1,200,1] k=3",data:[1,79,80,1,1,1,200,1],k:3}];
let steps8b=[],stepIdx8b=-1,autoInt8b=null,tcIdx8b=0;
const CODE_LINES_8b=["totalSum = sum(cardPoints)","windowSize = n - k","windowSum = sum(first windowSize)","for right from windowSize to n-1:","    windowSum += cards[r]-cards[r-ws]","    minWindowSum = min(minWS, windowSum)","return totalSum - minWindowSum"];

function buildSteps8b(tc){
    steps8b=[];const cards=tc.data,k=tc.k,n=cards.length;
    const ws=n-k;const total=cards.reduce((a,b)=>a+b,0);
    if(ws===0){
        steps8b.push({msg:`k=n, take all. Answer=${total}`,hl:{},lb:{},vars:{totalSum:total,windowSize:0,answer:total},changed:new Set(["answer"]),codeLine:0,explanation:`k equals n, so take all cards. Answer = ${total}.`});
        stepIdx8b=0;return;
    }
    let wSum=0;for(let i=0;i<ws;i++)wSum+=cards[i];
    let minWS=wSum,minPos=0;
    const makeHl=(wl,wr)=>{
        const hl={};
        for(let x=0;x<n;x++){
            if(x>=wl&&x<=wr)hl[x]='#ef4444';
            else hl[x]='#22c55e';
        }
        return hl;
    };
    steps8b.push({msg:`total=${total}, ws=${ws}`,hl:{},lb:{},vars:{totalSum:total,windowSize:ws,windowSum:"-",minWindowSum:"-",answer:"?"},changed:new Set(["totalSum","windowSize"]),codeLine:0,explanation:`Total sum = ${total}. We leave a window of size ${ws} in the middle. Find its minimum sum.`});
    steps8b.push({msg:`Initial window [0..${ws-1}]: sum=${wSum}`,hl:makeHl(0,ws-1),lb:{0:"wL",[ws-1]:"wR"},vars:{totalSum:total,windowSize:ws,windowSum:wSum,minWindowSum:wSum,taken:total-wSum,answer:"?"},changed:new Set(["windowSum","minWindowSum"]),codeLine:2,explanation:`First window: cards[0..${ws-1}] = [${cards.slice(0,ws)}]. Sum=${wSum}. If we leave these, we take ${total-wSum}. minWindowSum=${wSum}.`});
    for(let right=ws;right<n;right++){
        const removed=cards[right-ws];const added=cards[right];
        wSum+=added-removed;
        if(wSum<minWS){minWS=wSum;minPos=right-ws+1;}
        const wl=right-ws+1,wr=right;
        steps8b.push({msg:`slide→[${wl}..${wr}]: +${added}-${removed}=${wSum}`,hl:makeHl(wl,wr),lb:{[wl]:"wL",[wr]:"wR"},vars:{totalSum:total,windowSize:ws,windowSum:wSum,minWindowSum:minWS,taken:total-minWS,answer:"?"},changed:new Set(["windowSum","minWindowSum","taken"]),codeLine:4,explanation:`Slide window: remove cards[${right-ws}]=${removed}, add cards[${right}]=${added}. windowSum=${wSum}. Window [${wl}..${wr}]=[${cards.slice(wl,wr+1)}]. minWindowSum=${minWS}. Best taken so far: ${total}-${minWS}=${total-minWS}.`});
    }
    const ans=total-minWS;
    steps8b.push({msg:`Done! ${total}-${minWS}=${ans}`,hl:makeHl(minPos,minPos+ws-1),lb:{},vars:{totalSum:total,windowSize:ws,windowSum:"-",minWindowSum:minWS,taken:ans,answer:ans},changed:new Set(["answer"]),codeLine:6,explanation:`Minimum window sum = ${minWS} at position [${minPos}..${minPos+ws-1}]. Answer = ${total} - ${minWS} = ${ans}. These are the cards we leave; everything else we take.`});
    stepIdx8b=0;
}
function render8b(){
    const s=steps8b[stepIdx8b];if(!s)return;const arr=TCS_8b[tcIdx8b].data;
    const boxW=48,boxH=40,gap=4,startX=10,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg8b').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state8b').innerHTML=stHtml;
    let cHtml='';CODE_LINES_8b.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code8b').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx8b;i++){logHtml+=`<div style="color:${i===stepIdx8b?'#93c5fd':'#52525b'}">${i===stepIdx8b?'▶ ':'  '}${steps8b[i].msg}</div>`;}document.getElementById('log8b').innerHTML=logHtml;document.getElementById('log8b').scrollTop=99999;
    document.getElementById('expl8b').innerHTML=s.explanation;document.getElementById('stepLabel8b').textContent=`Step ${stepIdx8b+1} / ${steps8b.length}`;document.getElementById('prev8b').disabled=stepIdx8b<=0;document.getElementById('next8b').disabled=stepIdx8b>=steps8b.length-1;
}
function next8b(){if(stepIdx8b<steps8b.length-1){stepIdx8b++;render8b();}}
function prev8b(){if(stepIdx8b>0){stepIdx8b--;render8b();}}
function toggleAuto8b(){if(autoInt8b){clearInterval(autoInt8b);autoInt8b=null;document.getElementById('auto8b').textContent='▶ Auto';}else{autoInt8b=setInterval(()=>{if(stepIdx8b>=steps8b.length-1){toggleAuto8b();return;}next8b();},800);document.getElementById('auto8b').textContent='⏸ Pause';}}
function loadTc8b(idx){tcIdx8b=idx;stepIdx8b=0;buildSteps8b(TCS_8b[idx]);document.querySelectorAll('[data-tc8b]').forEach((b,i)=>{b.className=i===idx?'viz8b-btn active':'viz8b-btn';});render8b();}
const tcBar8b=document.getElementById('tcBar8b');TCS_8b.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz8b-btn active':'viz8b-btn';b.setAttribute('data-tc8b','');b.onclick=()=>loadTc8b(i);tcBar8b.appendChild(b);});
buildSteps8b(TCS_8b[0]);render8b();
</script>
</div>
