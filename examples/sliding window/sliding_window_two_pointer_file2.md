# Longest Repeating Character Replacement

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/longest-repeating-character-replacement/
**GFG:** https://www.geeksforgeeks.org/longest-repeating-character-replacement/

## Description

You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English letter. You can perform this operation at most `k` times. Return the length of the longest substring containing the same letter you can get after performing the above operations.

**Input:** A string `s` of uppercase English letters, and an integer `k`.
**Output:** An integer — the length of the longest substring with all identical characters achievable with at most k replacements.

**Constraints:**
- `1 <= s.length <= 10^5`
- `s` consists of only uppercase English letters
- `0 <= k <= s.length`

**Example 1:**
Input: `s = "ABAB", k = 2`
Output: `4`
Explanation: Replace both 'A's with 'B' (or both 'B's with 'A'). The entire string becomes "BBBB" or "AAAA", length 4.

**Example 2:**
Input: `s = "AABABBA", k = 1`
Output: `4`
Explanation: Replace the 'B' at index 3 with 'A'. We get "AAAAABA..." — the substring "AAAA" (indices 0-3) has length 4. Alternatively, replace index 5's 'B' to get "AABABAA" and substring "ABBA"→"AAAA" at indices 3-6.

**Edge Cases:**
- k ≥ s.length → return s.length (can change everything)
- All same character → return s.length
- k = 0 → find the longest run of a single character
- Single character string → return 1

## In-depth Explanation

**Reframe:** Find the longest substring where (window length - count of most frequent character in window) ≤ k. The characters that are NOT the most frequent one are the ones we'd need to replace. If the number of replacements needed ≤ k, the window is valid.

**Pattern recognition:** This is a **sliding window** problem with a character frequency constraint. Keywords: "longest substring", "at most k changes", "same letter." The constraint is: `windowLen - maxFreq ≤ k`.

**Real-world analogy:** Imagine painting a fence where each plank is a different color. You have k cans of paint. You want the longest stretch of fence you can make one uniform color. You'd keep the most common color and repaint the minority planks. If minority count exceeds k, shrink the stretch.

**Why naive fails:** Checking all O(n²) substrings, finding the max frequency character in each (O(26) or O(n)), is O(n² × 26) which is borderline for n = 100,000.

**Approach roadmap:**
- **Brute Force:** For each (i, j), count frequencies, check if j-i+1-maxFreq ≤ k → O(n² × 26)
- **Optimal (Sliding Window):** Maintain freq array and maxFreq. Expand right, shrink left when windowLen - maxFreq > k → O(n)

**Interview cheat sheet:**
- **Keywords:** "longest substring", "at most k replacements", "same character"
- **What makes this different:** The constraint involves the MOST frequent character, not a simple sum or count
- **The "aha moment":** `windowLen - maxFreq` gives the number of characters that need replacing
- **Memory hook:** "Keep the majority, replace the minority. If minority > k, shrink."

## Brute Force Intuition

For every pair (i, j), count the frequency of each character in s[i..j]. The most frequent character stays, and all others need replacement. If the number of characters to replace (window length minus max frequency) exceeds k, the window is invalid. Track the longest valid window.

## Brute Force Step-by-Step Solution

Trace: `s = "AABABBA", k = 1`.

**Step 1: Initialize**

Code executing: `int maxLen = 0;`
- maxLen = 0. We try every starting position.

**Step 2: i=0, extend j, tracking frequencies**

Code executing: `freq[s.charAt(j) - 'A']++; maxFreq = max of freq array;`

j=0: 'A', freq={A:1}, maxFreq=1. replacements = 1-1 = 0 ≤ 1. Length=1. maxLen=1.
j=1: 'A', freq={A:2}, maxFreq=2. replacements = 2-2 = 0 ≤ 1. Length=2. maxLen=2.
j=2: 'B', freq={A:2,B:1}, maxFreq=2. replacements = 3-2 = 1 ≤ 1. Length=3. maxLen=3.
j=3: 'A', freq={A:3,B:1}, maxFreq=3. replacements = 4-3 = 1 ≤ 1. Length=4. maxLen=4.
j=4: 'B', freq={A:3,B:2}, maxFreq=3. replacements = 5-3 = 2 > 1. INVALID. Break.

**Step 3: i=1, extend j**

Reset freq. j=1:'A' freq={A:1}, j=2:'B' freq={A:1,B:1}, maxF=1, repl=2-1=1 ≤ 1, len=2. j=3:'A' freq={A:2,B:1}, maxF=2, repl=3-2=1 ≤ 1, len=3. j=4:'B' freq={A:2,B:2}, maxF=2, repl=4-2=2 > 1. Break.
- maxLen stays 4.

**Step 4: Continue for remaining i values**

No starting position yields a window longer than 4 that's valid.

**Final:** maxLen = 4.

**Correctness argument:** We exhaustively check all windows. For each, we correctly compute the number of replacements needed as windowLen - maxFreq. The maximum valid window is tracked.

**Key invariant:** For the current window [i..j], freq tracks exact character counts, and maxFreq is the maximum frequency among all characters.

**Common mistakes:**
1. Forgetting to reset the frequency array for each new i — causes incorrect freq counts.
2. Computing maxFreq as the global max instead of the window-local max.

**30-second interview pitch:** "For each starting index, I extend right, tracking character frequencies. The window is valid if windowLen minus the max frequency is at most k. I break when it becomes invalid. O(n²) time."

## Brute Force In-depth Intuition

The key insight behind the validity check is that within any window, the optimal strategy is always to keep the most frequent character and replace everything else. This minimizes replacements. So `windowLen - maxFreq` gives the exact minimum number of replacements needed. If this exceeds k, no assignment of replacements can make the window uniform. This greedy observation holds because we're looking for ALL same characters, and keeping the majority minimizes changes.

## Brute Force Algorithm

```
function characterReplacement(s, k):
    n = length(s)
    maxLen = 0
    for i from 0 to n-1:
        freq = array of 26 zeros
        for j from i to n-1:
            freq[s[j] - 'A']++
            maxFreq = max value in freq
            if (j - i + 1) - maxFreq > k:
                break
            maxLen = max(maxLen, j - i + 1)
    return maxLen
```

The inner loop maintains a running frequency array. At each extension, we recompute maxFreq (scanning 26 entries, so O(1)) and check the validity condition.

## Brute Force Code

```java
class Solution {
    public int characterReplacement(String s, int k) {
        int n = s.length();
        int maxLen = 0;
        for (int i = 0; i < n; i++) {
            int[] freq = new int[26];
            int maxFreq = 0;
            for (int j = i; j < n; j++) {
                freq[s.charAt(j) - 'A']++;
                maxFreq = Math.max(maxFreq, freq[s.charAt(j) - 'A']);
                if ((j - i + 1) - maxFreq > k) break;
                maxLen = Math.max(maxLen, j - i + 1);
            }
        }
        return maxLen;
    }
}
```

## Brute Force Complexity

**Time: O(n²)** — Two nested loops. The maxFreq update is O(1) since we only check the newly added character against the current maxFreq. Overall O(n²).

**Space: O(1)** — The frequency array has a fixed size of 26 (uppercase English letters), which is O(1).

## Brute Force Hints

1. What's the minimum number of replacements needed to make a window all one character?
2. Which character should you keep (not replace) in a window? The most frequent one.
3. So the formula for replacements is: windowLen - maxFreq.
4. If replacements > k, can extending further help? No — break early.
5. How do you efficiently track maxFreq as you extend? Just compare the new character's count.

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz4a-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz4a-grid{grid-template-columns:1fr}}
.viz4a-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz4a-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz4a-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz4a-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz4a-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz4a-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz4a-btn:disabled{opacity:0.3}
.viz4a-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar4a"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz4a-btn" id="prev4a" onclick="prev4a()">← Prev</button>
  <button class="viz4a-btn" id="next4a" onclick="next4a()">Next →</button>
  <button class="viz4a-btn" id="auto4a" onclick="toggleAuto4a()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel4a">Ready</span>
</div>
<div class="viz4a-grid">
  <div>
    <div class="viz4a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">String & Window</div>
      <svg id="svg4a" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz4a-state" id="state4a"></div>
    <div class="viz4a-code" id="code4a"></div>
  </div>
  <div>
    <div class="viz4a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz4a-log" id="log4a"></div>
    </div>
    <div class="viz4a-expl" id="expl4a"></div>
  </div>
</div>
<script>
const TCS_4a=[{name:"AABABBA k=1",data:"AABABBA",k:1},{name:"ABAB k=2",data:"ABAB",k:2},{name:"AAAA k=0",data:"AAAA",k:0}];
let steps4a=[],stepIdx4a=-1,autoInt4a=null,tcIdx4a=0;
const CODE_LINES_4a=["for i from 0 to n-1:","    freq = [0]*26, maxFreq=0","    for j from i to n-1:","        freq[s[j]]++; maxFreq=max","        if (j-i+1)-maxFreq > k: break","        maxLen = max(maxLen, j-i+1)","return maxLen"];

function buildSteps4a(tc){
    steps4a=[];const s=tc.data,k=tc.k,n=s.length;let maxLen=0;
    steps4a.push({msg:`Init: k=${k}, maxLen=0`,hl:{},lb:{},vars:{i:"-",j:"-",maxFreq:0,replacements:"-",k,maxLen:0},changed:new Set(["k","maxLen"]),codeLine:-1,explanation:`Starting brute force. For each starting position, extend right and check if windowLen - maxFreq ≤ k.`});
    for(let i=0;i<n&&steps4a.length<55;i++){
        const freq={};let maxFreq=0;
        for(let j=i;j<n;j++){
            const ch=s[j];freq[ch]=(freq[ch]||0)+1;maxFreq=Math.max(maxFreq,freq[ch]);
            const wLen=j-i+1,repl=wLen-maxFreq;
            const hl={};for(let x=i;x<=j;x++)hl[x]='#2563eb';hl[j]='#4f8ff7';
            const lb={};lb[i]="i";lb[j]=j===i?"i,j":"j";
            const freqStr=Object.entries(freq).map(([c,v])=>c+":"+v).join(",");
            if(repl>k){
                hl[j]='#ef4444';
                steps4a.push({msg:`i=${i},j=${j}: '${ch}' repl=${repl}>${k} BREAK`,hl,lb,vars:{i,j,maxFreq,replacements:repl,k,maxLen,"freq":"{"+freqStr+"}"},changed:new Set(["j","replacements"]),codeLine:4,explanation:`Window "${s.substring(i,j+1)}" needs ${repl} replacements (len ${wLen} - maxFreq ${maxFreq}), but k=${k}. Too many! Break.`});
                break;
            }
            maxLen=Math.max(maxLen,wLen);
            steps4a.push({msg:`i=${i},j=${j}: '${ch}' repl=${repl}≤${k} len=${wLen}`,hl,lb,vars:{i,j,maxFreq,replacements:repl,k,maxLen,"freq":"{"+freqStr+"}"},changed:new Set(["j","maxFreq","maxLen","freq"]),codeLine:5,explanation:`Window "${s.substring(i,j+1)}": maxFreq=${maxFreq}, need ${repl} replacements ≤ k=${k}. Valid! Length=${wLen}. maxLen=${maxLen}.`});
            if(steps4a.length>=55)break;
        }
    }
    steps4a.push({msg:`Done! Answer=${maxLen}`,hl:{},lb:{},vars:{i:"done",j:"done",maxFreq:"-",replacements:"-",k,maxLen},changed:new Set(["maxLen"]),codeLine:6,explanation:`All starting positions checked. Longest repeating character replacement = ${maxLen}.`});
    stepIdx4a=0;
}
function render4a(){
    const s=steps4a[stepIdx4a];if(!s)return;const arr=TCS_4a[tcIdx4a].data.split('');
    const boxW=48,boxH=40,gap=4,startX=20,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg4a').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state4a').innerHTML=stHtml;
    let cHtml='';CODE_LINES_4a.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code4a').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx4a;i++){logHtml+=`<div style="color:${i===stepIdx4a?'#93c5fd':'#52525b'}">${i===stepIdx4a?'▶ ':'  '}${steps4a[i].msg}</div>`;}document.getElementById('log4a').innerHTML=logHtml;document.getElementById('log4a').scrollTop=99999;
    document.getElementById('expl4a').innerHTML=s.explanation;document.getElementById('stepLabel4a').textContent=`Step ${stepIdx4a+1} / ${steps4a.length}`;document.getElementById('prev4a').disabled=stepIdx4a<=0;document.getElementById('next4a').disabled=stepIdx4a>=steps4a.length-1;
}
function next4a(){if(stepIdx4a<steps4a.length-1){stepIdx4a++;render4a();}}
function prev4a(){if(stepIdx4a>0){stepIdx4a--;render4a();}}
function toggleAuto4a(){if(autoInt4a){clearInterval(autoInt4a);autoInt4a=null;document.getElementById('auto4a').textContent='▶ Auto';}else{autoInt4a=setInterval(()=>{if(stepIdx4a>=steps4a.length-1){toggleAuto4a();return;}next4a();},800);document.getElementById('auto4a').textContent='⏸ Pause';}}
function loadTc4a(idx){tcIdx4a=idx;stepIdx4a=0;buildSteps4a(TCS_4a[idx]);document.querySelectorAll('[data-tc4a]').forEach((b,i)=>{b.className=i===idx?'viz4a-btn active':'viz4a-btn';});render4a();}
const tcBar4a=document.getElementById('tcBar4a');TCS_4a.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz4a-btn active':'viz4a-btn';b.setAttribute('data-tc4a','');b.onclick=()=>loadTc4a(i);tcBar4a.appendChild(b);});
buildSteps4a(TCS_4a[0]);render4a();
</script>
</div>

## Optimal Intuition

Maintain a sliding window [left, right] with a frequency array. Track `maxFreq` — the count of the most frequent character in the window. Expand right each step. When `windowLen - maxFreq > k` (too many replacements needed), shrink left by one. The critical insight: we don't need to precisely decrease `maxFreq` when shrinking — it only matters that `maxFreq` stays correct enough to grow the window, because the answer can only improve when `maxFreq` increases.

## Optimal Step-by-Step Solution

Trace: `s = "AABABBA", k = 1`.

**Step 1: Initialize**

Code executing: `int[] freq = new int[26]; int left = 0, maxFreq = 0, maxLen = 0;`
- left=0, maxFreq=0, maxLen=0, freq all zeros.

**Step 2: right=0, character 'A'**

Code executing: `freq[s.charAt(right) - 'A']++; maxFreq = Math.max(maxFreq, freq[...]);`

freq['A'] becomes 1. maxFreq = max(0, 1) = 1. Window length = 1. Replacements = 1 - 1 = 0 ≤ 1. Valid.
- left=0, right=0, freq={A:1}, maxFreq=1, maxLen=max(0,1)=1
- Window: "A", replacements needed: 0

**Step 3: right=1, character 'A'**

freq['A'] = 2. maxFreq = 2. Window "AA", length 2. Replacements = 2-2 = 0 ≤ 1.
- maxLen = 2

**Step 4: right=2, character 'B'**

freq['B'] = 1. maxFreq stays 2 (A still has 2). Window "AAB", length 3. Replacements = 3-2 = 1 ≤ 1.
- maxLen = 3

**Step 5: right=3, character 'A'**

freq['A'] = 3. maxFreq = 3. Window "AABA", length 4. Replacements = 4-3 = 1 ≤ 1.
- maxLen = 4

**Step 6: right=4, character 'B'**

Code executing: `while ((right - left + 1) - maxFreq > k) { freq[s.charAt(left) - 'A']--; left++; }`

freq['B'] = 2. maxFreq stays 3. Window "AABAB", length 5. Replacements = 5-3 = 2 > 1. INVALID!

Shrink: freq[s[0]]='A' decremented: freq['A']=2. left moves to 1. Window "ABAB", length 4. Replacements = 4-3 = 1... but wait, maxFreq is still 3 from before. Actually freq['A']=2, freq['B']=2, true maxFreq should be 2. But we keep maxFreq=3 (we don't decrease it).

This seems wrong but it's actually fine! With maxFreq=3 (stale), 4-3=1 ≤ 1, so we stop shrinking. The window "ABAB" length 4. maxLen = max(4, 4) = 4.

Why this works: maxFreq is a "high-water mark." If it was 3 before, we know a window of size maxFreq + k = 4 was valid. We only care about finding LONGER windows, which requires maxFreq to INCREASE. So stale maxFreq never causes us to miss a better answer.

**Step 7: right=5, character 'B'**

freq['B'] = 3. maxFreq = max(3, 3) = 3. Window "ABABB", length 5. Replacements = 5-3 = 2 > 1.
Shrink: freq[s[1]]='A' decremented: freq['A']=1. left=2. Length=4. 4-3=1 ≤ 1.
- maxLen stays 4.

**Step 8: right=6, character 'A'**

freq['A'] = 2. maxFreq stays 3. Window "BABBA", length 5. 5-3=2 > 1.
Shrink: freq[s[2]]='B' decremented: freq['B']=2. left=3. Length=4. 4-3=1 ≤ 1.
- maxLen stays 4.

**Final:** maxLen = 4.

**Correctness argument:** The maxFreq variable acts as a high-water mark. It only increases, never decreases. This is correct because the answer (maxLen) can only improve when we find a window with a HIGHER maxFreq. If maxFreq is stale (too high), it only makes us shrink less aggressively, but since the window is bounded by maxFreq + k, we'll never wrongly record a longer invalid window.

**Key invariant:** maxLen ≤ maxFreq + k at all times. The window size never exceeds maxFreq + k.

**Common mistakes:**
1. Trying to decrease maxFreq when shrinking — this requires scanning all 26 frequencies and is unnecessary. The high-water mark trick avoids this.
2. Using `if` instead of `while` for shrinking — though with the high-water mark trick, `if` actually works here since we shrink at most once per expansion.

**30-second interview pitch:** "I use a sliding window with a frequency array. The key formula is: replacements needed = windowLen - maxFreq. When this exceeds k, I shrink from the left. I keep maxFreq as a high-water mark that only increases. This gives O(n) time because both pointers traverse the string once."

## Optimal In-depth Intuition

The non-obvious part of this algorithm is why we can keep `maxFreq` as a non-decreasing value. Here's the mathematical reasoning:

The answer is determined by the formula: `maxLen = maxFreq + k` (at best). So a larger answer requires a larger `maxFreq`. If our current `maxFreq = M` and we shrink the window, the true max frequency might drop below M. But that doesn't matter — any window with true maxFreq < M can have length at most (M-1) + k, which is less than the already-recorded maxLen of M + k. So we'd never record a better answer with a decreased maxFreq anyway.

This means we can use `if` instead of `while` — at most one shrink per expansion. The window either grows (when maxFreq increases or stays sufficient) or slides (same size) — it never shrinks below its maximum achieved size. This is sometimes called the "non-shrinking window" technique.

## Optimal Algorithm

```
function characterReplacement(s, k):
    freq = array of 26 zeros
    left = 0
    maxFreq = 0
    maxLen = 0
    for right from 0 to n-1:
        freq[s[right] - 'A']++
        maxFreq = max(maxFreq, freq[s[right] - 'A'])
        while (right - left + 1) - maxFreq > k:
            freq[s[left] - 'A']--
            left++
        maxLen = max(maxLen, right - left + 1)
    return maxLen
```

The loop expands right and updates frequency. maxFreq only increases. When the window is invalid, we shrink left (the while loop runs at most once per iteration due to the high-water mark). We update maxLen with each valid window.

## Optimal Code

```java
class Solution {
    public int characterReplacement(String s, int k) {
        int[] freq = new int[26];
        int left = 0, maxFreq = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            freq[s.charAt(right) - 'A']++;
            maxFreq = Math.max(maxFreq, freq[s.charAt(right) - 'A']);
            while ((right - left + 1) - maxFreq > k) {
                freq[s.charAt(left) - 'A']--;
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
```

## Optimal Complexity

**Time: O(n)** — right traverses n characters. left moves at most n times total. All operations inside the loop are O(1). The while loop body executes at most once per outer iteration (due to the high-water mark property), giving amortized O(1) per iteration.

**Space: O(1)** — The frequency array has a fixed size of 26. No other data structures scale with input.

## Optimal Hints

1. Within a window, which character would you keep and which would you replace?
2. The number of characters to replace = windowLen - count of the most frequent char.
3. Do you need to recompute the max frequency from scratch when shrinking? Think about what happens to the answer...
4. The answer is always maxFreq + k (bounded by string length). So a better answer requires a bigger maxFreq.
5. If maxFreq doesn't increase, the window can't grow — it just slides.
6. This means `maxFreq` only needs to be a "high-water mark" that never decreases.

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz4b-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz4b-grid{grid-template-columns:1fr}}
.viz4b-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz4b-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz4b-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz4b-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz4b-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz4b-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz4b-btn:disabled{opacity:0.3}
.viz4b-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar4b"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz4b-btn" id="prev4b" onclick="prev4b()">← Prev</button>
  <button class="viz4b-btn" id="next4b" onclick="next4b()">Next →</button>
  <button class="viz4b-btn" id="auto4b" onclick="toggleAuto4b()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel4b">Ready</span>
</div>
<div class="viz4b-grid">
  <div>
    <div class="viz4b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Sliding Window</div>
      <svg id="svg4b" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz4b-state" id="state4b"></div>
    <div class="viz4b-code" id="code4b"></div>
  </div>
  <div>
    <div class="viz4b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz4b-log" id="log4b"></div>
    </div>
    <div class="viz4b-expl" id="expl4b"></div>
  </div>
</div>
<script>
const TCS_4b=[{name:"AABABBA k=1",data:"AABABBA",k:1},{name:"ABAB k=2",data:"ABAB",k:2},{name:"ABCDE k=1",data:"ABCDE",k:1}];
let steps4b=[],stepIdx4b=-1,autoInt4b=null,tcIdx4b=0;
const CODE_LINES_4b=["for right from 0 to n-1:","    freq[s[right]]++","    maxFreq = max(maxFreq, freq[s[r]])","    while (r-l+1)-maxFreq > k:","        freq[s[left]]--, left++","    maxLen = max(maxLen, r-l+1)","return maxLen"];

function buildSteps4b(tc){
    steps4b=[];const s=tc.data,k=tc.k,n=s.length;let left=0,maxFreq=0,maxLen=0;const freq={};
    const freqStr=()=>{const e=Object.entries(freq).filter(([,v])=>v>0);return e.length?"{"+e.map(([c,v])=>c+":"+v).join(",")+"}":"{}"};
    steps4b.push({msg:`Init: k=${k}`,hl:{},lb:{},vars:{left:0,right:"-",maxFreq:0,replacements:"-",k,maxLen:0,freq:"{}"},changed:new Set(["left","maxFreq","maxLen"]),codeLine:-1,explanation:`Initialize sliding window. freq tracks character counts. maxFreq is the high-water mark.`});
    for(let right=0;right<n;right++){
        const ch=s[right];freq[ch]=(freq[ch]||0)+1;maxFreq=Math.max(maxFreq,freq[ch]);
        const wLen=right-left+1,repl=wLen-maxFreq;
        let hl={};for(let x=left;x<=right;x++)hl[x]='#2563eb';hl[right]='#22c55e';
        let lb={};lb[left]="left";lb[right]=right===left?"L,R":"right";
        steps4b.push({msg:`r=${right}: '${ch}', maxFreq=${maxFreq}, repl=${repl}`,hl:{...hl},lb:{...lb},vars:{left,right,maxFreq,replacements:repl,k,maxLen,freq:freqStr()},changed:new Set(["right","maxFreq","freq","replacements"]),codeLine:2,explanation:`Add '${ch}'. freq[${ch}]=${freq[ch]}. maxFreq=${maxFreq}. Window "${s.substring(left,right+1)}" len=${wLen}. Replacements needed = ${wLen} - ${maxFreq} = ${repl}.`});
        let shrank=false;
        while((right-left+1)-maxFreq>k){
            shrank=true;const lc=s[left];freq[lc]--;left++;
            const wLen2=right-left+1,repl2=wLen2-maxFreq;
            hl={};for(let x=left;x<=right;x++)hl[x]='#2563eb';if(left>0)hl[left-1]='#ef4444';hl[right]='#4f8ff7';
            lb={};lb[left]="left";lb[right]=right===left?"L,R":"right";
            steps4b.push({msg:`  shrink: eject '${lc}', left→${left}`,hl:{...hl},lb:{...lb},vars:{left,right,maxFreq,replacements:repl2,k,maxLen,freq:freqStr()},changed:new Set(["left","freq","replacements"]),codeLine:4,explanation:`${repl}>${k}: invalid! Eject '${lc}' from left. Note: maxFreq stays at ${maxFreq} (high-water mark). Window "${s.substring(left,right+1)}" now needs ${repl2} replacements.`});
        }
        maxLen=Math.max(maxLen,right-left+1);
        hl={};for(let x=left;x<=right;x++)hl[x]='#2563eb';hl[right]='#4f8ff7';
        lb={};lb[left]="left";lb[right]=right===left?"L,R":"right";
        steps4b.push({msg:`  valid: len=${right-left+1}, maxLen=${maxLen}`,hl:{...hl},lb:{...lb},vars:{left,right,maxFreq,replacements:(right-left+1)-maxFreq,k,maxLen,freq:freqStr()},changed:new Set(["maxLen"]),codeLine:5,explanation:`Window valid. Length=${right-left+1}. maxLen=${maxLen}.`});
    }
    steps4b.push({msg:`Done! Answer=${maxLen}`,hl:{},lb:{},vars:{left,right:"done",maxFreq,replacements:"-",k,maxLen,freq:"-"},changed:new Set(["maxLen"]),codeLine:6,explanation:`All characters processed. Longest repeating character replacement = ${maxLen}.`});
    stepIdx4b=0;
}
function render4b(){
    const s=steps4b[stepIdx4b];if(!s)return;const arr=TCS_4b[tcIdx4b].data.split('');
    const boxW=48,boxH=40,gap=4,startX=20,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg4b').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state4b').innerHTML=stHtml;
    let cHtml='';CODE_LINES_4b.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code4b').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx4b;i++){logHtml+=`<div style="color:${i===stepIdx4b?'#93c5fd':'#52525b'}">${i===stepIdx4b?'▶ ':'  '}${steps4b[i].msg}</div>`;}document.getElementById('log4b').innerHTML=logHtml;document.getElementById('log4b').scrollTop=99999;
    document.getElementById('expl4b').innerHTML=s.explanation;document.getElementById('stepLabel4b').textContent=`Step ${stepIdx4b+1} / ${steps4b.length}`;document.getElementById('prev4b').disabled=stepIdx4b<=0;document.getElementById('next4b').disabled=stepIdx4b>=steps4b.length-1;
}
function next4b(){if(stepIdx4b<steps4b.length-1){stepIdx4b++;render4b();}}
function prev4b(){if(stepIdx4b>0){stepIdx4b--;render4b();}}
function toggleAuto4b(){if(autoInt4b){clearInterval(autoInt4b);autoInt4b=null;document.getElementById('auto4b').textContent='▶ Auto';}else{autoInt4b=setInterval(()=>{if(stepIdx4b>=steps4b.length-1){toggleAuto4b();return;}next4b();},800);document.getElementById('auto4b').textContent='⏸ Pause';}}
function loadTc4b(idx){tcIdx4b=idx;stepIdx4b=0;buildSteps4b(TCS_4b[idx]);document.querySelectorAll('[data-tc4b]').forEach((b,i)=>{b.className=i===idx?'viz4b-btn active':'viz4b-btn';});render4b();}
const tcBar4b=document.getElementById('tcBar4b');TCS_4b.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz4b-btn active':'viz4b-btn';b.setAttribute('data-tc4b','');b.onclick=()=>loadTc4b(i);tcBar4b.appendChild(b);});
buildSteps4b(TCS_4b[0]);render4b();
</script>
</div>

---

# Binary Subarrays With Sum

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/binary-subarrays-with-sum/
**GFG:** https://www.geeksforgeeks.org/binary-subarrays-with-sum/

## Description

Given a binary array `nums` and an integer `goal`, return the number of non-empty subarrays with a sum equal to `goal`. A binary array contains only 0s and 1s.

**Input:** An integer array `nums` (binary) and an integer `goal`.
**Output:** The count of subarrays whose elements sum to exactly `goal`.

**Constraints:**
- `1 <= nums.length <= 3 * 10^4`
- `nums[i]` is either `0` or `1`
- `0 <= goal <= nums.length`

**Example 1:**
Input: `nums = [1,0,1,0,1], goal = 2`
Output: `4`
Explanation: The subarrays with sum 2 are: [1,0,1] (indices 0-2), [1,0,1,0] (0-3), [0,1,0,1] (1-4), [1,0,1] (2-4). Total = 4.

**Example 2:**
Input: `nums = [0,0,0,0,0], goal = 0`
Output: `15`
Explanation: Every subarray has sum 0. There are n(n+1)/2 = 15 subarrays total.

**Edge Cases:**
- goal = 0 → count subarrays with all zeros (tricky with sliding window)
- All 1s → subarrays of length exactly `goal`
- Single element → 1 if element equals goal, else 0

## In-depth Explanation

**Reframe:** Count the number of contiguous subarrays where the count of 1s equals exactly `goal`.

**Pattern recognition:** This is a **counting subarrays with exact constraint** problem. Direct sliding window finds "at most" constraints, not "exactly." The trick: **exactly(goal) = atMost(goal) - atMost(goal - 1)**. This converts the "exact" problem into two "at most" problems, each solvable with sliding window.

**Real-world analogy:** Imagine counting groups of consecutive light switches where exactly `goal` switches are ON. Instead of counting "exactly goal" directly, you count "at most goal" and subtract "at most goal-1." The difference gives you "exactly goal."

**Why naive fails:** Brute force checks all O(n²) subarrays — too slow for n = 30,000.

**Approach roadmap:**
- **Brute Force:** For each (i, j), compute sum and check if equals goal → O(n²)
- **Optimal (Sliding Window with atMost trick):** Define atMost(k) = count of subarrays with sum ≤ k. Answer = atMost(goal) - atMost(goal-1) → O(n)

**Interview cheat sheet:**
- **Keywords:** "number of subarrays", "sum equals exactly", "binary array"
- **What makes this different:** "Exactly equal" requires the atMost subtraction trick, unlike simple max/min window problems
- **The "aha moment":** exactly(k) = atMost(k) - atMost(k-1)
- **Memory hook:** "Exact = AtMost(k) minus AtMost(k-1)"

## Brute Force Intuition

For every starting index `i`, extend `j` rightward, maintaining a running sum. Whenever the sum equals `goal`, increment the count. When sum exceeds `goal`, we can break early (since all elements are non-negative, the sum can only increase).

## Brute Force Step-by-Step Solution

Trace: `nums = [1,0,1,0,1], goal = 2`.

**Step 1: Initialize**

Code executing: `int count = 0;`
- count = 0. We try every starting position.

**Step 2: i=0, extend j**

j=0: sum=1. sum≠2. Continue.
j=1: sum=1. sum≠2. Continue.
j=2: sum=2. sum==2! count=1. Continue (sum could stay at 2 with trailing 0s).
j=3: sum=2. sum==2! count=2.
j=4: sum=3. sum>2. Break.

**Step 3: i=1, extend j**

j=1: sum=0. j=2: sum=1. j=3: sum=1. j=4: sum=2. count=3.
End of array.

**Step 4: i=2, extend j**

j=2: sum=1. j=3: sum=1. j=4: sum=2. count=4.

**Step 5: i=3 and i=4**

From i=3: [0,1] sum=1, never reaches 2. From i=4: [1] sum=1.

**Final:** count = 4.

**Correctness argument:** We check every subarray and count those with sum exactly equal to goal. Can't miss any since we're exhaustive.

**Key invariant:** `sum` holds the exact sum of nums[i..j] at each step.

**Common mistakes:**
1. Breaking when sum == goal instead of continuing — trailing zeros can keep the sum equal to goal.
2. Breaking when sum > goal — correct, since array is binary so sum only increases.

**30-second interview pitch:** "I check every subarray by fixing start, extending right with a running sum. When sum equals goal, I increment count. When it exceeds goal in a binary array, I break. O(n²) time."

## Brute Force In-depth Intuition

In a binary array, the sum equals the count of 1s. The sum monotonically increases as we extend right. Once sum exceeds goal, no further extension from this start can achieve goal. However, we must NOT stop at the first match — after finding sum == goal, trailing zeros keep the sum at goal, so we continue collecting valid subarrays. The break only triggers when sum > goal.

## Brute Force Algorithm

```
function numSubarraysWithSum(nums, goal):
    count = 0
    n = length(nums)
    for i from 0 to n-1:
        sum = 0
        for j from i to n-1:
            sum += nums[j]
            if sum == goal:
                count++
            else if sum > goal:
                break
    return count
```

For each start i, extend j and maintain a running sum. Count whenever sum matches goal. Break when sum exceeds goal (optimization for binary arrays).

## Brute Force Code

```java
class Solution {
    public int numSubarraysWithSum(int[] nums, int goal) {
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                if (sum == goal) {
                    count++;
                } else if (sum > goal) {
                    break;
                }
            }
        }
        return count;
    }
}
```

## Brute Force Complexity

**Time: O(n²)** — Two nested loops. The early break helps in practice but worst case (all zeros, goal=0) is still O(n²).

**Space: O(1)** — Only integer variables.

## Brute Force Hints

1. For a binary array, can the sum decrease as you extend right? No — it only increases or stays the same.
2. When sum exceeds goal, should you keep extending? No — break.
3. When sum equals goal, should you stop? No — trailing zeros keep the sum at goal.
4. How many subarrays start at index i and have sum exactly goal? All those from the first match to the last before sum exceeds goal.
5. Can you solve this in O(n) using the "atMost" trick?

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz5a-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz5a-grid{grid-template-columns:1fr}}
.viz5a-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz5a-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz5a-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz5a-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz5a-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz5a-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz5a-btn:disabled{opacity:0.3}
.viz5a-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar5a"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz5a-btn" id="prev5a" onclick="prev5a()">← Prev</button>
  <button class="viz5a-btn" id="next5a" onclick="next5a()">Next →</button>
  <button class="viz5a-btn" id="auto5a" onclick="toggleAuto5a()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel5a">Ready</span>
</div>
<div class="viz5a-grid">
  <div>
    <div class="viz5a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Binary Array</div>
      <svg id="svg5a" width="100%" viewBox="0 0 400 120"></svg>
    </div>
    <div class="viz5a-state" id="state5a"></div>
    <div class="viz5a-code" id="code5a"></div>
  </div>
  <div>
    <div class="viz5a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz5a-log" id="log5a"></div>
    </div>
    <div class="viz5a-expl" id="expl5a"></div>
  </div>
</div>
<script>
const TCS_5a=[{name:"[1,0,1,0,1] g=2",data:[1,0,1,0,1],goal:2},{name:"[0,0,0,0,0] g=0",data:[0,0,0,0,0],goal:0},{name:"[1,1,1] g=2",data:[1,1,1],goal:2}];
let steps5a=[],stepIdx5a=-1,autoInt5a=null,tcIdx5a=0;
const CODE_LINES_5a=["for i from 0 to n-1:","    sum = 0","    for j from i to n-1:","        sum += nums[j]","        if sum == goal: count++","        else if sum > goal: break","return count"];
function buildSteps5a(tc){
    steps5a=[];const nums=tc.data,goal=tc.goal,n=nums.length;let count=0;
    steps5a.push({msg:`Init: goal=${goal}, count=0`,hl:{},lb:{},vars:{i:"-",j:"-",sum:"-",goal,count:0},changed:new Set(["goal","count"]),codeLine:-1,explanation:`Starting brute force. Count subarrays with sum exactly ${goal}.`});
    for(let i=0;i<n&&steps5a.length<55;i++){
        let sum=0;
        for(let j=i;j<n;j++){
            sum+=nums[j];
            const hl={};for(let x=i;x<=j;x++)hl[x]=nums[x]===1?'#22c55e':'#2563eb';hl[j]='#4f8ff7';
            const lb={};lb[i]="i";lb[j]=j===i?"i,j":"j";
            if(sum===goal){count++;
                steps5a.push({msg:`i=${i},j=${j}: sum=${sum}==goal → count=${count}`,hl,lb,vars:{i,j,sum,goal,count},changed:new Set(["j","sum","count"]),codeLine:4,explanation:`Window [${i}..${j}] = [${nums.slice(i,j+1)}] has sum ${sum} = goal. Found a valid subarray! count = ${count}.`});
            }else if(sum>goal){
                hl[j]='#ef4444';
                steps5a.push({msg:`i=${i},j=${j}: sum=${sum}>${goal} → break`,hl,lb,vars:{i,j,sum,goal,count},changed:new Set(["j","sum"]),codeLine:5,explanation:`Sum ${sum} exceeds goal ${goal}. Since array is binary, sum can only increase. Break.`});
                break;
            }else{
                steps5a.push({msg:`i=${i},j=${j}: sum=${sum}<${goal}`,hl,lb,vars:{i,j,sum,goal,count},changed:new Set(["j","sum"]),codeLine:3,explanation:`Sum ${sum} < goal ${goal}. Keep extending right.`});
            }
            if(steps5a.length>=55)break;
        }
    }
    steps5a.push({msg:`Done! Answer=${count}`,hl:{},lb:{},vars:{i:"done",j:"done",sum:"-",goal,count},changed:new Set(["count"]),codeLine:6,explanation:`All subarrays checked. Total subarrays with sum ${goal} = ${count}.`});
    stepIdx5a=0;
}
function render5a(){
    const s=steps5a[stepIdx5a];if(!s)return;const arr=TCS_5a[tcIdx5a].data;
    const boxW=48,boxH=40,gap=4,startX=20,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg5a').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state5a').innerHTML=stHtml;
    let cHtml='';CODE_LINES_5a.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code5a').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx5a;i++){logHtml+=`<div style="color:${i===stepIdx5a?'#93c5fd':'#52525b'}">${i===stepIdx5a?'▶ ':'  '}${steps5a[i].msg}</div>`;}document.getElementById('log5a').innerHTML=logHtml;document.getElementById('log5a').scrollTop=99999;
    document.getElementById('expl5a').innerHTML=s.explanation;document.getElementById('stepLabel5a').textContent=`Step ${stepIdx5a+1} / ${steps5a.length}`;document.getElementById('prev5a').disabled=stepIdx5a<=0;document.getElementById('next5a').disabled=stepIdx5a>=steps5a.length-1;
}
function next5a(){if(stepIdx5a<steps5a.length-1){stepIdx5a++;render5a();}}
function prev5a(){if(stepIdx5a>0){stepIdx5a--;render5a();}}
function toggleAuto5a(){if(autoInt5a){clearInterval(autoInt5a);autoInt5a=null;document.getElementById('auto5a').textContent='▶ Auto';}else{autoInt5a=setInterval(()=>{if(stepIdx5a>=steps5a.length-1){toggleAuto5a();return;}next5a();},800);document.getElementById('auto5a').textContent='⏸ Pause';}}
function loadTc5a(idx){tcIdx5a=idx;stepIdx5a=0;buildSteps5a(TCS_5a[idx]);document.querySelectorAll('[data-tc5a]').forEach((b,i)=>{b.className=i===idx?'viz5a-btn active':'viz5a-btn';});render5a();}
const tcBar5a=document.getElementById('tcBar5a');TCS_5a.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz5a-btn active':'viz5a-btn';b.setAttribute('data-tc5a','');b.onclick=()=>loadTc5a(i);tcBar5a.appendChild(b);});
buildSteps5a(TCS_5a[0]);render5a();
</script>
</div>

## Optimal Intuition

Use the **atMost trick**: define `atMost(k)` as the number of subarrays with sum ≤ k. Then `exactly(goal) = atMost(goal) - atMost(goal - 1)`. Each `atMost(k)` call uses a standard sliding window: expand right, add to sum, shrink left while sum > k. For each valid window [left, right], the number of valid subarrays ending at right is `right - left + 1`.

## Optimal Step-by-Step Solution

Trace: `nums = [1,0,1,0,1], goal = 2`.

We compute `atMost(2) - atMost(1)`.

**Computing atMost(2):**

**Step 1: right=0, sum=1 ≤ 2.** Window [0..0], subarrays ending here: 1. Total: 1.
**Step 2: right=1, sum=1 ≤ 2.** Window [0..1], subarrays: 2. Total: 3.
**Step 3: right=2, sum=2 ≤ 2.** Window [0..2], subarrays: 3. Total: 6.
**Step 4: right=3, sum=2 ≤ 2.** Window [0..3], subarrays: 4. Total: 10.
**Step 5: right=4, sum=3 > 2.** Shrink: left=0 (nums[0]=1), sum=2. left=1. Window [1..4], subarrays: 4. Total: 14.

atMost(2) = 14.

**Computing atMost(1):**

**Step 1: right=0, sum=1 ≤ 1.** Subarrays: 1. Total: 1.
**Step 2: right=1, sum=1 ≤ 1.** Subarrays: 2. Total: 3.
**Step 3: right=2, sum=2 > 1.** Shrink: left=0→1, sum=1. Subarrays: 2. Total: 5.
**Step 4: right=3, sum=1 ≤ 1.** Subarrays: 3. Total: 8.
**Step 5: right=4, sum=2 > 1.** Shrink: left=1→2, sum=1. Still >1? No, sum=1. Wait: nums[1]=0, so sum stays 2 after removing 0. Shrink more: left=2→3, sum=2-1=1. Subarrays: 2. Total: 10.

atMost(1) = 10.

**Final: exactly(2) = 14 - 10 = 4.** ✓

**Why `right - left + 1`?** For a window [left, right], the subarrays ending at right with sum ≤ k are: [left..right], [left+1..right], ..., [right..right]. That's right - left + 1 subarrays, and all have sum ≤ k because the window [left..right] already has sum ≤ k, and any sub-window from a later start has an equal or smaller sum.

**Correctness argument:** The atMost function counts all subarrays with sum ≤ k by ensuring the window always satisfies sum ≤ k and counting all valid sub-windows. The subtraction eliminates subarrays with sum < goal, leaving only those with sum exactly = goal.

**Key invariant:** After the while loop, sum = sum of nums[left..right] ≤ k.

**Common mistakes:**
1. Trying to directly count "exactly equal" with a single sliding window — this doesn't work because the window shrinks past valid answers.
2. Forgetting the edge case: if goal = 0, atMost(-1) should return 0 (handle the base case).

**30-second interview pitch:** "I use the atMost trick: exactly(goal) = atMost(goal) - atMost(goal-1). Each atMost uses a sliding window where I expand right, shrink left when sum exceeds k, and count subarrays as right-left+1. Two passes give O(n) total."

## Optimal In-depth Intuition

The atMost trick works because the set of subarrays with sum ≤ k is a superset of those with sum ≤ k-1. The difference is exactly those with sum = k. More formally:

{subarrays with sum = k} = {subarrays with sum ≤ k} \ {subarrays with sum ≤ k-1}

So |sum = k| = |sum ≤ k| - |sum ≤ k-1| = atMost(k) - atMost(k-1).

The counting trick `right - left + 1` works because within a valid window [left, right], every subarray [i..right] for i in [left, right] also has sum ≤ k (since removing elements from the left can only decrease the sum in a non-negative array). There are right - left + 1 such sub-windows.

This pattern (atMost subtraction) is essential for any "count subarrays with exact property" problem where the property is monotonic. It generalizes to: count subarrays with exactly K distinct elements, count subarrays with exactly K odd numbers, etc.

## Optimal Algorithm

```
function numSubarraysWithSum(nums, goal):
    return atMost(nums, goal) - atMost(nums, goal - 1)

function atMost(nums, k):
    if k < 0: return 0
    left = 0, sum = 0, count = 0
    for right from 0 to n-1:
        sum += nums[right]
        while sum > k:
            sum -= nums[left]
            left++
        count += right - left + 1
    return count
```

The main function calls atMost twice. Each atMost runs a standard sliding window, counting valid subarrays at each step.

## Optimal Code

```java
class Solution {
    public int numSubarraysWithSum(int[] nums, int goal) {
        return atMost(nums, goal) - atMost(nums, goal - 1);
    }

    private int atMost(int[] nums, int k) {
        if (k < 0) return 0;
        int left = 0, sum = 0, count = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum > k) {
                sum -= nums[left];
                left++;
            }
            count += right - left + 1; // all subarrays ending at right
        }
        return count;
    }
}
```

## Optimal Complexity

**Time: O(n)** — We call atMost twice, each running in O(n) (two pointers traverse the array once). Total: O(2n) = O(n).

**Space: O(1)** — Only integer variables in each pass. No additional data structures.

## Optimal Hints

1. Can you count subarrays with sum "at most k" using a sliding window? Yes — expand right, shrink left when sum > k.
2. For a valid window [left, right], how many subarrays end at right? Answer: right - left + 1.
3. How do you convert "at most" to "exactly"? Subtraction: exactly(k) = atMost(k) - atMost(k-1).
4. What happens when goal = 0? atMost(-1) = 0, so exactly(0) = atMost(0).
5. Why can't you do "exactly" with a single sliding window pass?
6. This atMost trick works for any monotonic constraint on subarrays.

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz5b-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz5b-grid{grid-template-columns:1fr}}
.viz5b-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz5b-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz5b-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz5b-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz5b-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz5b-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz5b-btn:disabled{opacity:0.3}
.viz5b-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar5b"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz5b-btn" id="prev5b" onclick="prev5b()">← Prev</button>
  <button class="viz5b-btn" id="next5b" onclick="next5b()">Next →</button>
  <button class="viz5b-btn" id="auto5b" onclick="toggleAuto5b()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel5b">Ready</span>
</div>
<div class="viz5b-grid">
  <div>
    <div class="viz5b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Sliding Window (atMost passes)</div>
      <svg id="svg5b" width="100%" viewBox="0 0 400 120"></svg>
    </div>
    <div class="viz5b-state" id="state5b"></div>
    <div class="viz5b-code" id="code5b"></div>
  </div>
  <div>
    <div class="viz5b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz5b-log" id="log5b"></div>
    </div>
    <div class="viz5b-expl" id="expl5b"></div>
  </div>
</div>
<script>
const TCS_5b=[{name:"[1,0,1,0,1] g=2",data:[1,0,1,0,1],goal:2},{name:"[0,0,0,0,0] g=0",data:[0,0,0,0,0],goal:0},{name:"[1,1,1] g=2",data:[1,1,1],goal:2}];
let steps5b=[],stepIdx5b=-1,autoInt5b=null,tcIdx5b=0;
const CODE_LINES_5b=["// atMost(k) pass:","for right from 0 to n-1:","    sum += nums[right]","    while sum > k: sum-=nums[l], l++","    count += right - left + 1","// answer = atMost(goal)-atMost(goal-1)"];

function runAtMost(nums,k){
    const res=[];let left=0,sum=0,count=0;
    for(let right=0;right<nums.length;right++){
        sum+=nums[right];
        let shrinks=[];
        while(sum>k){shrinks.push({l:left,v:nums[left]});sum-=nums[left];left++;}
        count+=right-left+1;
        res.push({right,left,sum,count,added:right-left+1,shrinks});
    }
    return {total:count,steps:res};
}

function buildSteps5b(tc){
    steps5b=[];const nums=tc.data,goal=tc.goal;
    const pass1=runAtMost(nums,goal);
    const pass2=goal>0?runAtMost(nums,goal-1):{total:0,steps:[]};
    steps5b.push({msg:`Goal=${goal}. Compute atMost(${goal}) - atMost(${goal-1})`,hl:{},lb:{},vars:{pass:"—",k:"—",left:"-",right:"-",sum:"-",count:"-","atMost(g)":"?","atMost(g-1)":"?",answer:"?"},changed:new Set(["pass"]),codeLine:-1,explanation:`We use the atMost trick: exactly(${goal}) = atMost(${goal}) - atMost(${goal>0?goal-1:goal-1}). Let's run both passes.`});
    // Pass 1
    steps5b.push({msg:`--- Pass 1: atMost(${goal}) ---`,hl:{},lb:{},vars:{pass:`atMost(${goal})`,k:goal,left:0,right:"-",sum:0,count:0,"atMost(g)":"?","atMost(g-1)":"?",answer:"?"},changed:new Set(["pass","k"]),codeLine:0,explanation:`First pass: count subarrays with sum ≤ ${goal}.`});
    for(const st of pass1.steps){
        const hl={};for(let x=st.left;x<=st.right;x++)hl[x]='#2563eb';hl[st.right]='#4f8ff7';
        const lb={};lb[st.left]="left";lb[st.right]=st.right===st.left?"L,R":"right";
        if(st.shrinks.length>0){
            steps5b.push({msg:`  r=${st.right}: shrink ${st.shrinks.length}x, +${st.added} subs`,hl,lb,vars:{pass:`atMost(${goal})`,k:goal,left:st.left,right:st.right,sum:st.sum,count:st.count,"atMost(g)":"?","atMost(g-1)":"?",answer:"?"},changed:new Set(["left","right","sum","count"]),codeLine:3,explanation:`right=${st.right}, sum exceeded ${goal}. After shrinking: left=${st.left}, sum=${st.sum}. Valid subarrays ending here: ${st.added}. Running count: ${st.count}.`});
        }else{
            steps5b.push({msg:`  r=${st.right}: sum=${st.sum}≤${goal}, +${st.added} subs`,hl,lb,vars:{pass:`atMost(${goal})`,k:goal,left:st.left,right:st.right,sum:st.sum,count:st.count,"atMost(g)":"?","atMost(g-1)":"?",answer:"?"},changed:new Set(["right","sum","count"]),codeLine:4,explanation:`right=${st.right}, sum=${st.sum} ≤ ${goal}. Window [${st.left}..${st.right}]. Subarrays ending here: ${st.added}. Running count: ${st.count}.`});
        }
    }
    steps5b.push({msg:`atMost(${goal}) = ${pass1.total}`,hl:{},lb:{},vars:{pass:`atMost(${goal})`,k:goal,left:"-",right:"-",sum:"-",count:pass1.total,"atMost(g)":pass1.total,"atMost(g-1)":"?",answer:"?"},changed:new Set(["atMost(g)"]),codeLine:5,explanation:`First pass complete. atMost(${goal}) = ${pass1.total}.`});
    // Pass 2
    if(goal>0){
        steps5b.push({msg:`--- Pass 2: atMost(${goal-1}) ---`,hl:{},lb:{},vars:{pass:`atMost(${goal-1})`,k:goal-1,left:0,right:"-",sum:0,count:0,"atMost(g)":pass1.total,"atMost(g-1)":"?",answer:"?"},changed:new Set(["pass","k"]),codeLine:0,explanation:`Second pass: count subarrays with sum ≤ ${goal-1}.`});
        for(const st of pass2.steps){
            const hl={};for(let x=st.left;x<=st.right;x++)hl[x]='#a855f7';hl[st.right]='#c084fc';
            const lb={};lb[st.left]="left";lb[st.right]=st.right===st.left?"L,R":"right";
            steps5b.push({msg:`  r=${st.right}: sum=${st.sum}, +${st.added} subs, total=${st.count}`,hl,lb,vars:{pass:`atMost(${goal-1})`,k:goal-1,left:st.left,right:st.right,sum:st.sum,count:st.count,"atMost(g)":pass1.total,"atMost(g-1)":"?",answer:"?"},changed:new Set(["right","sum","count","left"]),codeLine:st.shrinks.length?3:4,explanation:`right=${st.right}${st.shrinks.length?', shrunk':''}. sum=${st.sum}. Subarrays: ${st.added}. Running: ${st.count}.`});
        }
        steps5b.push({msg:`atMost(${goal-1}) = ${pass2.total}`,hl:{},lb:{},vars:{pass:`atMost(${goal-1})`,k:goal-1,left:"-",right:"-",sum:"-",count:pass2.total,"atMost(g)":pass1.total,"atMost(g-1)":pass2.total,answer:"?"},changed:new Set(["atMost(g-1)"]),codeLine:5,explanation:`Second pass complete. atMost(${goal-1}) = ${pass2.total}.`});
    }else{
        steps5b.push({msg:`atMost(${goal-1}) = 0 (k<0)`,hl:{},lb:{},vars:{pass:"-",k:goal-1,left:"-",right:"-",sum:"-",count:0,"atMost(g)":pass1.total,"atMost(g-1)":0,answer:"?"},changed:new Set(["atMost(g-1)"]),codeLine:5,explanation:`goal-1 = ${goal-1} < 0, so atMost(${goal-1}) = 0.`});
    }
    const ans=pass1.total-pass2.total;
    steps5b.push({msg:`Answer = ${pass1.total} - ${pass2.total} = ${ans}`,hl:{},lb:{},vars:{pass:"Final",k:"-",left:"-",right:"-",sum:"-",count:"-","atMost(g)":pass1.total,"atMost(g-1)":pass2.total,answer:ans},changed:new Set(["answer"]),codeLine:5,explanation:`exactly(${goal}) = atMost(${goal}) - atMost(${goal-1}) = ${pass1.total} - ${pass2.total} = ${ans}.`});
    stepIdx5b=0;
}
function render5b(){
    const s=steps5b[stepIdx5b];if(!s)return;const arr=TCS_5b[tcIdx5b].data;
    const boxW=48,boxH=40,gap=4,startX=20,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg5b').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state5b').innerHTML=stHtml;
    let cHtml='';CODE_LINES_5b.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code5b').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx5b;i++){logHtml+=`<div style="color:${i===stepIdx5b?'#93c5fd':'#52525b'}">${i===stepIdx5b?'▶ ':'  '}${steps5b[i].msg}</div>`;}document.getElementById('log5b').innerHTML=logHtml;document.getElementById('log5b').scrollTop=99999;
    document.getElementById('expl5b').innerHTML=s.explanation;document.getElementById('stepLabel5b').textContent=`Step ${stepIdx5b+1} / ${steps5b.length}`;document.getElementById('prev5b').disabled=stepIdx5b<=0;document.getElementById('next5b').disabled=stepIdx5b>=steps5b.length-1;
}
function next5b(){if(stepIdx5b<steps5b.length-1){stepIdx5b++;render5b();}}
function prev5b(){if(stepIdx5b>0){stepIdx5b--;render5b();}}
function toggleAuto5b(){if(autoInt5b){clearInterval(autoInt5b);autoInt5b=null;document.getElementById('auto5b').textContent='▶ Auto';}else{autoInt5b=setInterval(()=>{if(stepIdx5b>=steps5b.length-1){toggleAuto5b();return;}next5b();},800);document.getElementById('auto5b').textContent='⏸ Pause';}}
function loadTc5b(idx){tcIdx5b=idx;stepIdx5b=0;buildSteps5b(TCS_5b[idx]);document.querySelectorAll('[data-tc5b]').forEach((b,i)=>{b.className=i===idx?'viz5b-btn active':'viz5b-btn';});render5b();}
const tcBar5b=document.getElementById('tcBar5b');TCS_5b.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz5b-btn active':'viz5b-btn';b.setAttribute('data-tc5b','');b.onclick=()=>loadTc5b(i);tcBar5b.appendChild(b);});
buildSteps5b(TCS_5b[0]);render5b();
</script>
</div>

---

# Count Number of Nice Subarrays

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/count-number-of-nice-subarrays/
**GFG:** https://www.geeksforgeeks.org/count-number-of-nice-subarrays/

## Description

Given an array of integers `nums` and an integer `k`, a subarray is called **nice** if there are `k` odd numbers in it. Return the number of nice subarrays.

**Input:** An integer array `nums` and an integer `k`.
**Output:** The count of subarrays containing exactly k odd numbers.

**Constraints:**
- `1 <= nums.length <= 50000`
- `1 <= nums[i] <= 10^5`
- `1 <= k <= nums.length`

**Example 1:**
Input: `nums = [1,1,2,1,1], k = 3`
Output: `2`
Explanation: The subarrays with exactly 3 odd numbers are [1,1,2,1] (indices 0-3) and [1,2,1,1] (indices 1-4).

**Example 2:**
Input: `nums = [2,4,6], k = 1`
Output: `0`
Explanation: No odd numbers exist, so no nice subarrays.

**Example 3:**
Input: `nums = [2,2,2,1,2,2,1,2,2,2], k = 2`
Output: `16`

**Edge Cases:**
- No odd numbers → 0
- All odd numbers → number of subarrays of length ≥ k
- k > count of odd numbers → 0

## In-depth Explanation

**Reframe:** Count subarrays with exactly k odd numbers. This is equivalent to: replace each element with 1 if odd, 0 if even, then count subarrays with sum exactly k. This is identical to "Binary Subarrays With Sum"!

**Pattern recognition:** Same **atMost trick**: exactly(k) = atMost(k) - atMost(k-1). The "odd count" is just a sum after converting to a binary representation.

**Real-world analogy:** You have a row of boxes, some marked (odd) and some unmarked (even). You want to find all contiguous groups that contain exactly k marked boxes. Same as Binary Subarrays With Sum but with a different "marking" criterion.

**Why naive fails:** O(n²) checking all subarrays is too slow for n = 50,000.

**Approach roadmap:**
- **Brute Force:** For each (i, j), count odd numbers → O(n²)
- **Optimal (atMost trick):** Convert to binary, use atMost(k) - atMost(k-1) → O(n)

**Interview cheat sheet:**
- **Keywords:** "exactly k odd numbers", "count subarrays", "nice subarrays"
- **What makes this different:** It's "Binary Subarrays With Sum" in disguise — convert parity to binary
- **The "aha moment":** Reduce to binary by checking `nums[i] % 2`, then apply the atMost trick
- **Memory hook:** "Odd/even → 0/1 → Binary Subarrays With Sum → atMost trick"

## Brute Force Intuition

For each starting index, extend rightward counting odd numbers. When the count equals k, that's a nice subarray. Count all such subarrays.

## Brute Force Step-by-Step Solution

Trace: `nums = [1,1,2,1,1], k = 3`.

**Step 1: Initialize**

Code executing: `int count = 0;`
- count = 0.

**Step 2: i=0, extend j**

j=0: nums[0]=1 (odd), odds=1. odds<3. Continue.
j=1: nums[1]=1 (odd), odds=2. odds<3. Continue.
j=2: nums[2]=2 (even), odds=2. odds<3. Continue.
j=3: nums[3]=1 (odd), odds=3. odds==3! count=1.
j=4: nums[4]=1 (odd), odds=4. odds>3. Break.

**Step 3: i=1, extend j**

j=1: odds=1. j=2: odds=1. j=3: odds=2. j=4: nums[4]=1, odds=3. count=2.
End of array.

**Step 4: i=2 through i=4**

From i=2: max odds achievable = 2 (indices 2-4 have 2 odd). Never reaches 3.
From i=3: max odds = 2. From i=4: max odds = 1.

**Final:** count = 2.

**Correctness argument:** Exhaustive check of all subarrays. We count odds incrementally and match against k.

**Key invariant:** `odds` tracks the count of odd numbers in nums[i..j].

**Common mistakes:**
1. Breaking when odds == k instead of continuing — even numbers after the k-th odd keep odds at k.
2. Not recognizing this is identical to Binary Subarrays With Sum after parity conversion.

**30-second interview pitch:** "For each start, I extend right counting odd numbers. When odds equals k, I count it. When odds exceeds k, I break. O(n²) but correctly handles trailing even numbers."

## Brute Force In-depth Intuition

The odd count in a subarray behaves like the sum in a binary array: it can only increase or stay the same as we extend right (since we're adding a non-negative contribution). When it exceeds k, no further extension helps. When it equals k, even numbers can follow without changing the count, so we must continue (not break). Only when a new odd number pushes it above k do we break.

## Brute Force Algorithm

```
function numberOfSubarrays(nums, k):
    count = 0
    n = length(nums)
    for i from 0 to n-1:
        odds = 0
        for j from i to n-1:
            if nums[j] is odd: odds++
            if odds == k: count++
            else if odds > k: break
    return count
```

The inner loop tracks odd count. We count at equality and break at excess.

## Brute Force Code

```java
class Solution {
    public int numberOfSubarrays(int[] nums, int k) {
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            int odds = 0;
            for (int j = i; j < nums.length; j++) {
                if (nums[j] % 2 != 0) odds++;
                if (odds == k) count++;
                else if (odds > k) break;
            }
        }
        return count;
    }
}
```

## Brute Force Complexity

**Time: O(n²)** — Two nested loops. The break optimization helps but doesn't change worst case.

**Space: O(1)** — Only integer variables.

## Brute Force Hints

1. How do you check if a number is odd? `nums[i] % 2 != 0`.
2. As you extend the window, can the odd count decrease? No.
3. When odds == k, should you stop or continue? Continue — even numbers don't change odds.
4. When odds > k, should you continue? No — it can only get worse.
5. Can you convert this to a problem you've already solved? Think binary.

## Brute Force Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz6a-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz6a-grid{grid-template-columns:1fr}}
.viz6a-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz6a-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz6a-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz6a-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz6a-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz6a-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz6a-btn:disabled{opacity:0.3}
.viz6a-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar6a"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz6a-btn" id="prev6a" onclick="prev6a()">← Prev</button>
  <button class="viz6a-btn" id="next6a" onclick="next6a()">Next →</button>
  <button class="viz6a-btn" id="auto6a" onclick="toggleAuto6a()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel6a">Ready</span>
</div>
<div class="viz6a-grid">
  <div>
    <div class="viz6a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Array (odd=highlighted)</div>
      <svg id="svg6a" width="100%" viewBox="0 0 400 120"></svg>
    </div>
    <div class="viz6a-state" id="state6a"></div>
    <div class="viz6a-code" id="code6a"></div>
  </div>
  <div>
    <div class="viz6a-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz6a-log" id="log6a"></div>
    </div>
    <div class="viz6a-expl" id="expl6a"></div>
  </div>
</div>
<script>
const TCS_6a=[{name:"[1,1,2,1,1] k=3",data:[1,1,2,1,1],k:3},{name:"[2,4,6] k=1",data:[2,4,6],k:1},{name:"[2,2,2,1,2,2,1,2,2,2] k=2",data:[2,2,2,1,2,2,1,2,2,2],k:2}];
let steps6a=[],stepIdx6a=-1,autoInt6a=null,tcIdx6a=0;
const CODE_LINES_6a=["for i from 0 to n-1:","    odds = 0","    for j from i to n-1:","        if nums[j] odd: odds++","        if odds==k: count++","        else if odds>k: break","return count"];
function buildSteps6a(tc){
    steps6a=[];const nums=tc.data,k=tc.k,n=nums.length;let count=0;
    steps6a.push({msg:`Init: k=${k}, count=0`,hl:{},lb:{},vars:{i:"-",j:"-",odds:0,k,count:0},changed:new Set(["k","count"]),codeLine:-1,explanation:`Count subarrays with exactly ${k} odd numbers.`});
    for(let i=0;i<n&&steps6a.length<55;i++){
        let odds=0;
        for(let j=i;j<n;j++){
            if(nums[j]%2!==0)odds++;
            const hl={};for(let x=i;x<=j;x++)hl[x]=nums[x]%2!==0?'#f59e0b':'#2563eb';hl[j]='#4f8ff7';
            const lb={};lb[i]="i";lb[j]=j===i?"i,j":"j";
            if(odds===k){count++;
                steps6a.push({msg:`i=${i},j=${j}: odds=${odds}==k → count=${count}`,hl,lb,vars:{i,j,odds,k,count},changed:new Set(["j","odds","count"]),codeLine:4,explanation:`Window [${i}..${j}] has ${odds} odd numbers = k=${k}. Nice subarray! count=${count}.`});
            }else if(odds>k){
                hl[j]='#ef4444';
                steps6a.push({msg:`i=${i},j=${j}: odds=${odds}>${k} → break`,hl,lb,vars:{i,j,odds,k,count},changed:new Set(["j","odds"]),codeLine:5,explanation:`${odds} odd numbers > k=${k}. Break.`});
                break;
            }else{
                steps6a.push({msg:`i=${i},j=${j}: odds=${odds}<${k}`,hl,lb,vars:{i,j,odds,k,count},changed:new Set(["j","odds"]),codeLine:3,explanation:`Only ${odds} odd numbers so far, need ${k}. Keep extending.`});
            }
            if(steps6a.length>=55)break;
        }
    }
    steps6a.push({msg:`Done! Answer=${count}`,hl:{},lb:{},vars:{i:"done",j:"done",odds:"-",k,count},changed:new Set(["count"]),codeLine:6,explanation:`All subarrays checked. Nice subarrays = ${count}.`});
    stepIdx6a=0;
}
function render6a(){
    const s=steps6a[stepIdx6a];if(!s)return;const arr=TCS_6a[tcIdx6a].data;
    const boxW=42,boxH=40,gap=4,startX=10,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg6a').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state6a').innerHTML=stHtml;
    let cHtml='';CODE_LINES_6a.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code6a').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx6a;i++){logHtml+=`<div style="color:${i===stepIdx6a?'#93c5fd':'#52525b'}">${i===stepIdx6a?'▶ ':'  '}${steps6a[i].msg}</div>`;}document.getElementById('log6a').innerHTML=logHtml;document.getElementById('log6a').scrollTop=99999;
    document.getElementById('expl6a').innerHTML=s.explanation;document.getElementById('stepLabel6a').textContent=`Step ${stepIdx6a+1} / ${steps6a.length}`;document.getElementById('prev6a').disabled=stepIdx6a<=0;document.getElementById('next6a').disabled=stepIdx6a>=steps6a.length-1;
}
function next6a(){if(stepIdx6a<steps6a.length-1){stepIdx6a++;render6a();}}
function prev6a(){if(stepIdx6a>0){stepIdx6a--;render6a();}}
function toggleAuto6a(){if(autoInt6a){clearInterval(autoInt6a);autoInt6a=null;document.getElementById('auto6a').textContent='▶ Auto';}else{autoInt6a=setInterval(()=>{if(stepIdx6a>=steps6a.length-1){toggleAuto6a();return;}next6a();},800);document.getElementById('auto6a').textContent='⏸ Pause';}}
function loadTc6a(idx){tcIdx6a=idx;stepIdx6a=0;buildSteps6a(TCS_6a[idx]);document.querySelectorAll('[data-tc6a]').forEach((b,i)=>{b.className=i===idx?'viz6a-btn active':'viz6a-btn';});render6a();}
const tcBar6a=document.getElementById('tcBar6a');TCS_6a.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz6a-btn active':'viz6a-btn';b.setAttribute('data-tc6a','');b.onclick=()=>loadTc6a(i);tcBar6a.appendChild(b);});
buildSteps6a(TCS_6a[0]);render6a();
</script>
</div>

## Optimal Intuition

Convert the problem to "Binary Subarrays With Sum": treat each element as 1 if odd, 0 if even. Then apply the **atMost trick**: exactly(k) = atMost(k) - atMost(k-1). Each atMost uses a sliding window counting odd numbers.

## Optimal Step-by-Step Solution

Trace: `nums = [1,1,2,1,1], k = 3`. Binary view: [1,1,0,1,1].

**Computing atMost(3):**

right=0: odds=1≤3. subarrays=1. total=1.
right=1: odds=2≤3. subarrays=2. total=3.
right=2: odds=2≤3. subarrays=3. total=6.
right=3: odds=3≤3. subarrays=4. total=10.
right=4: odds=4>3. Shrink: left=0 (odd), odds=3. left=1. subarrays=4. total=14.

atMost(3) = 14.

**Computing atMost(2):**

right=0: odds=1≤2. subarrays=1. total=1.
right=1: odds=2≤2. subarrays=2. total=3.
right=2: odds=2≤2. subarrays=3. total=6.
right=3: odds=3>2. Shrink: left=0(odd), odds=2. left=1. subarrays=3. total=9.
right=4: odds=3>2. Shrink: left=1(odd), odds=2. left=2. subarrays=3. total=12.

atMost(2) = 12.

**Answer = 14 - 12 = 2.** ✓

**Correctness argument:** Same as Binary Subarrays With Sum. The parity conversion makes odd count equivalent to binary sum.

**Key invariant:** odds = count of odd numbers in nums[left..right] ≤ k after the while loop.

**Common mistakes:**
1. Forgetting the parity conversion — treating the actual values as the "sum" instead of their parity.
2. Off-by-one in atMost(k-1) when k=0 (handle k<0 returning 0).

**30-second interview pitch:** "This is 'Binary Subarrays With Sum' in disguise. I convert each element to 1 (odd) or 0 (even), then use the atMost trick: exactly(k) = atMost(k) - atMost(k-1). Each atMost is a standard sliding window. O(n) time."

## Optimal In-depth Intuition

The reduction to Binary Subarrays With Sum is the key insight. Once you recognize that "count of odd numbers in a subarray" is the same as "sum of the parity-converted array," the entire machinery of sliding window with the atMost trick applies directly. This is a powerful pattern: many "count subarrays with exactly K of some property" problems reduce to this framework. Examples include: exactly K distinct elements, exactly K vowels, exactly K primes, etc.

## Optimal Algorithm

```
function numberOfSubarrays(nums, k):
    return atMost(nums, k) - atMost(nums, k - 1)

function atMost(nums, k):
    if k < 0: return 0
    left = 0, odds = 0, count = 0
    for right from 0 to n-1:
        if nums[right] is odd: odds++
        while odds > k:
            if nums[left] is odd: odds--
            left++
        count += right - left + 1
    return count
```

The atMost function counts subarrays with at most k odd numbers using a sliding window. The subtraction gives exactly k.

## Optimal Code

```java
class Solution {
    public int numberOfSubarrays(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }

    private int atMost(int[] nums, int k) {
        if (k < 0) return 0;
        int left = 0, odds = 0, count = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] % 2 != 0) odds++;
            while (odds > k) {
                if (nums[left] % 2 != 0) odds--;
                left++;
            }
            count += right - left + 1;
        }
        return count;
    }
}
```

## Optimal Complexity

**Time: O(n)** — Two calls to atMost, each O(n). Total: O(2n) = O(n).

**Space: O(1)** — Only integer variables.

## Optimal Hints

1. How is this related to "Binary Subarrays With Sum"?
2. What does "odd count" correspond to in a binary array?
3. Can you use the atMost trick here? exactly(k) = atMost(k) - atMost(k-1).
4. In the atMost function, what determines if you shrink the window?
5. For each valid window ending at right, how many subarrays end there?
6. What's the edge case when k = 0?

## Optimal Visualization

<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
.viz6b-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:12px}
@media(max-width:700px){.viz6b-grid{grid-template-columns:1fr}}
.viz6b-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px}
.viz6b-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz6b-code{font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 12px;background:#141418;border:1px solid rgba(255,255,255,0.04);border-radius:8px;margin-top:8px}
.viz6b-log{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.9;max-height:250px;overflow-y:auto}
.viz6b-expl{padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.7;background:#141418;border:1px solid rgba(255,255,255,0.04);margin-top:8px}
.viz6b-btn{padding:6px 16px;font-size:12px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:#1a1a20;color:#a1a1aa;cursor:pointer;font-family:inherit}
.viz6b-btn:disabled{opacity:0.3}
.viz6b-btn.active{background:rgba(79,143,247,0.15);color:#93c5fd;border-color:rgba(79,143,247,0.3)}
</style>
<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap" id="tcBar6b"></div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
  <button class="viz6b-btn" id="prev6b" onclick="prev6b()">← Prev</button>
  <button class="viz6b-btn" id="next6b" onclick="next6b()">Next →</button>
  <button class="viz6b-btn" id="auto6b" onclick="toggleAuto6b()">▶ Auto</button>
  <span style="flex:1;text-align:center;font-size:12px;color:#71717a" id="stepLabel6b">Ready</span>
</div>
<div class="viz6b-grid">
  <div>
    <div class="viz6b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Array (odd=orange)</div>
      <svg id="svg6b" width="100%" viewBox="0 0 500 120"></svg>
    </div>
    <div class="viz6b-state" id="state6b"></div>
    <div class="viz6b-code" id="code6b"></div>
  </div>
  <div>
    <div class="viz6b-card">
      <div style="font-size:10px;color:#52525b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Algorithm Log</div>
      <div class="viz6b-log" id="log6b"></div>
    </div>
    <div class="viz6b-expl" id="expl6b"></div>
  </div>
</div>
<script>
const TCS_6b=[{name:"[1,1,2,1,1] k=3",data:[1,1,2,1,1],k:3},{name:"[2,4,6] k=1",data:[2,4,6],k:1},{name:"[2,2,2,1,2,2,1,2,2,2] k=2",data:[2,2,2,1,2,2,1,2,2,2],k:2}];
let steps6b=[],stepIdx6b=-1,autoInt6b=null,tcIdx6b=0;
const CODE_LINES_6b=["// atMost(k) pass:","for right 0..n-1:","    if nums[r] odd: odds++","    while odds>k: if nums[l] odd odds--, l++","    count += right-left+1","// answer=atMost(k)-atMost(k-1)"];

function runAtMost6(nums,k){
    const res=[];if(k<0)return{total:0,steps:res};
    let left=0,odds=0,count=0;
    for(let right=0;right<nums.length;right++){
        if(nums[right]%2!==0)odds++;
        let shrinks=0;
        while(odds>k){if(nums[left]%2!==0)odds--;left++;shrinks++;}
        count+=right-left+1;
        res.push({right,left,odds,count,added:right-left+1,shrinks});
    }
    return{total:count,steps:res};
}

function buildSteps6b(tc){
    steps6b=[];const nums=tc.data,k=tc.k;
    const pass1=runAtMost6(nums,k);const pass2=runAtMost6(nums,k-1);
    steps6b.push({msg:`k=${k}. Compute atMost(${k})-atMost(${k-1})`,hl:{},lb:{},vars:{pass:"—",limit:"—",left:"-",right:"-",odds:"-",count:"-","atMost(k)":"?","atMost(k-1)":"?",answer:"?"},changed:new Set(["pass"]),codeLine:-1,explanation:`Nice subarrays = exactly ${k} odd numbers = atMost(${k}) - atMost(${k-1}).`});
    steps6b.push({msg:`--- Pass 1: atMost(${k}) ---`,hl:{},lb:{},vars:{pass:`atMost(${k})`,limit:k,left:0,right:"-",odds:0,count:0,"atMost(k)":"?","atMost(k-1)":"?",answer:"?"},changed:new Set(["pass","limit"]),codeLine:0,explanation:`Count subarrays with at most ${k} odd numbers.`});
    for(const st of pass1.steps){
        const hl={};for(let x=st.left;x<=st.right;x++)hl[x]=nums[x]%2!==0?'#f59e0b':'#2563eb';hl[st.right]='#4f8ff7';
        const lb={};lb[st.left]="left";lb[st.right]=st.right===st.left?"L,R":"right";
        steps6b.push({msg:`r=${st.right}: odds=${st.odds}${st.shrinks?', shrunk '+st.shrinks+'x':''}, +${st.added}`,hl,lb,vars:{pass:`atMost(${k})`,limit:k,left:st.left,right:st.right,odds:st.odds,count:st.count,"atMost(k)":"?","atMost(k-1)":"?",answer:"?"},changed:new Set(["right","odds","count","left"]),codeLine:st.shrinks?3:4,explanation:`right=${st.right}, nums=${nums[st.right]}${nums[st.right]%2!==0?' (odd)':' (even)'}. ${st.shrinks?'Shrunk '+st.shrinks+'x. ':''}odds=${st.odds}≤${k}. +${st.added} subarrays. Total=${st.count}.`});
    }
    steps6b.push({msg:`atMost(${k})=${pass1.total}`,hl:{},lb:{},vars:{pass:`atMost(${k})`,limit:k,left:"-",right:"-",odds:"-",count:pass1.total,"atMost(k)":pass1.total,"atMost(k-1)":"?",answer:"?"},changed:new Set(["atMost(k)"]),codeLine:5,explanation:`First pass done. atMost(${k})=${pass1.total}.`});
    steps6b.push({msg:`--- Pass 2: atMost(${k-1}) ---`,hl:{},lb:{},vars:{pass:`atMost(${k-1})`,limit:k-1,left:0,right:"-",odds:0,count:0,"atMost(k)":pass1.total,"atMost(k-1)":"?",answer:"?"},changed:new Set(["pass","limit"]),codeLine:0,explanation:`Count subarrays with at most ${k-1} odd numbers.`});
    for(const st of pass2.steps){
        const hl={};for(let x=st.left;x<=st.right;x++)hl[x]=nums[x]%2!==0?'#a855f7':'#6366f1';hl[st.right]='#c084fc';
        const lb={};lb[st.left]="left";lb[st.right]=st.right===st.left?"L,R":"right";
        steps6b.push({msg:`r=${st.right}: odds=${st.odds}${st.shrinks?', shrunk':''},+${st.added}, tot=${st.count}`,hl,lb,vars:{pass:`atMost(${k-1})`,limit:k-1,left:st.left,right:st.right,odds:st.odds,count:st.count,"atMost(k)":pass1.total,"atMost(k-1)":"?",answer:"?"},changed:new Set(["right","odds","count","left"]),codeLine:st.shrinks?3:4,explanation:`right=${st.right}. odds=${st.odds}. +${st.added} subarrays. Running total=${st.count}.`});
    }
    steps6b.push({msg:`atMost(${k-1})=${pass2.total}`,hl:{},lb:{},vars:{pass:`atMost(${k-1})`,limit:k-1,left:"-",right:"-",odds:"-",count:pass2.total,"atMost(k)":pass1.total,"atMost(k-1)":pass2.total,answer:"?"},changed:new Set(["atMost(k-1)"]),codeLine:5,explanation:`Second pass done. atMost(${k-1})=${pass2.total}.`});
    const ans=pass1.total-pass2.total;
    steps6b.push({msg:`Answer=${pass1.total}-${pass2.total}=${ans}`,hl:{},lb:{},vars:{pass:"Final",limit:"-",left:"-",right:"-",odds:"-",count:"-","atMost(k)":pass1.total,"atMost(k-1)":pass2.total,answer:ans},changed:new Set(["answer"]),codeLine:5,explanation:`exactly(${k}) = ${pass1.total} - ${pass2.total} = ${ans} nice subarrays.`});
    stepIdx6b=0;
}
function render6b(){
    const s=steps6b[stepIdx6b];if(!s)return;const arr=TCS_6b[tcIdx6b].data;
    const boxW=42,boxH=40,gap=4,startX=10,startY=30;let svg='';
    arr.forEach((val,i)=>{const x=startX+i*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY-8}" text-anchor="middle" font-size="10" fill="#52525b" font-family="JetBrains Mono,monospace">${i}</text>`;const color=s.hl[i]||'#2a2a33';const tc=s.hl[i]?'#fafaf9':'#a1a1aa';svg+=`<rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${color==='#2a2a33'?'#3f3f46':color}" stroke-width="1.5"/>`;svg+=`<text x="${x+boxW/2}" y="${startY+boxH/2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="600" fill="${tc}" font-family="JetBrains Mono,monospace">${val}</text>`;});
    if(s.lb){Object.entries(s.lb).forEach(([idx,label])=>{const x=startX+parseInt(idx)*(boxW+gap);svg+=`<text x="${x+boxW/2}" y="${startY+boxH+16}" text-anchor="middle" font-size="10" font-weight="600" fill="#4f8ff7" font-family="JetBrains Mono,monospace">${label}</text>`;});}
    document.getElementById('svg6b').innerHTML=svg;
    let stHtml='<table style="width:100%;font-family:JetBrains Mono,monospace;font-size:12px;border-collapse:collapse">';Object.entries(s.vars).forEach(([nm,vl])=>{const ch=s.changed.has(nm);stHtml+=`<tr style="background:${ch?'rgba(251,191,36,0.1)':'transparent'}"><td style="padding:4px 10px;color:${ch?'#fbbf24':'#52525b'};font-weight:600;width:40%">${nm}</td><td style="padding:4px 10px;color:${ch?'#fbbf24':'#b8b8be'}">${vl}${ch?' ← changed':''}</td></tr>`;});stHtml+='</table>';document.getElementById('state6b').innerHTML=stHtml;
    let cHtml='';CODE_LINES_6b.forEach((line,i)=>{const act=i===s.codeLine;cHtml+=`<div style="padding:2px 8px;border-radius:4px;background:${act?'rgba(79,143,247,0.15)':'transparent'};color:${act?'#93c5fd':'#3f3f46'};font-weight:${act?'600':'400'};font-size:12px;line-height:2;font-family:JetBrains Mono,monospace;white-space:pre">${line}</div>`;});document.getElementById('code6b').innerHTML=cHtml;
    let logHtml='';for(let i=0;i<=stepIdx6b;i++){logHtml+=`<div style="color:${i===stepIdx6b?'#93c5fd':'#52525b'}">${i===stepIdx6b?'▶ ':'  '}${steps6b[i].msg}</div>`;}document.getElementById('log6b').innerHTML=logHtml;document.getElementById('log6b').scrollTop=99999;
    document.getElementById('expl6b').innerHTML=s.explanation;document.getElementById('stepLabel6b').textContent=`Step ${stepIdx6b+1} / ${steps6b.length}`;document.getElementById('prev6b').disabled=stepIdx6b<=0;document.getElementById('next6b').disabled=stepIdx6b>=steps6b.length-1;
}
function next6b(){if(stepIdx6b<steps6b.length-1){stepIdx6b++;render6b();}}
function prev6b(){if(stepIdx6b>0){stepIdx6b--;render6b();}}
function toggleAuto6b(){if(autoInt6b){clearInterval(autoInt6b);autoInt6b=null;document.getElementById('auto6b').textContent='▶ Auto';}else{autoInt6b=setInterval(()=>{if(stepIdx6b>=steps6b.length-1){toggleAuto6b();return;}next6b();},800);document.getElementById('auto6b').textContent='⏸ Pause';}}
function loadTc6b(idx){tcIdx6b=idx;stepIdx6b=0;buildSteps6b(TCS_6b[idx]);document.querySelectorAll('[data-tc6b]').forEach((b,i)=>{b.className=i===idx?'viz6b-btn active':'viz6b-btn';});render6b();}
const tcBar6b=document.getElementById('tcBar6b');TCS_6b.forEach((tc,i)=>{const b=document.createElement('button');b.textContent=tc.name;b.className=i===0?'viz6b-btn active':'viz6b-btn';b.setAttribute('data-tc6b','');b.onclick=()=>loadTc6b(i);tcBar6b.appendChild(b);});
buildSteps6b(TCS_6b[0]);render6b();
</script>
</div>
