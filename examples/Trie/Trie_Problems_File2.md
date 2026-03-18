# Bit Prerequisites for Trie Problems

**Difficulty:** Easy
**Topic:** Theory / Prerequisites
**Related:** https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/

## Description

Before tackling XOR-based Trie problems, you need to understand binary representation and bit manipulation fundamentals. This is a prerequisite theory section, not a coding problem.

**Key concepts you need to know:**

1. **Binary representation of integers:** Every integer can be represented as a sequence of bits (0s and 1s). For example, 5 = 101 in binary, 3 = 011, 7 = 111.

2. **XOR operation (^):** XOR compares two bits and returns 1 if they differ, 0 if they're the same.
```
5 ^ 3 = 101 ^ 011 = 110 = 6
5 ^ 5 = 101 ^ 101 = 000 = 0
5 ^ 0 = 101 ^ 000 = 101 = 5
```

3. **Key XOR properties:**
   - `a ^ a = 0` (any number XOR itself is 0)
   - `a ^ 0 = a` (any number XOR 0 is itself)
   - XOR is commutative: `a ^ b = b ^ a`
   - XOR is associative: `(a ^ b) ^ c = a ^ (b ^ c)`
   - If `a ^ b = c`, then `a ^ c = b` and `b ^ c = a`

4. **Bit-level Trie:** Instead of storing characters (a-z), we store bits (0 or 1). Each number is treated as a 32-bit (or 30-bit) binary string. The Trie has exactly 2 children per node (for bit 0 and bit 1). We process bits from the Most Significant Bit (MSB) to Least Significant Bit (LSB).

**Why MSB to LSB?** Because the most significant bit contributes the most to the final value. When maximizing XOR, we want to maximize the highest bit first. A 1 in bit position 29 (value 2^29 = 536,870,912) is worth more than ALL lower bits combined (2^0 + 2^1 + ... + 2^28 = 536,870,911).

**Example: Building a binary Trie for [5, 3, 7] using 3 bits:**
```
5 = 101
3 = 011
7 = 111

         root
        /    \
       0      1
       |     / \
       1    0   1
      / \   |   |
     1   ?  1   1
     ↑      ↑   ↑
    "3"    "5"  "7"
```

**How to extract the i-th bit (from MSB):**
```
bit = (number >> (maxBit - 1 - i)) & 1
```
For a 30-bit representation with maxBit=30, the MSB is bit 29.

## In-depth Explanation

**Why use a Trie for XOR?**

The fundamental insight: to maximize `a XOR b`, we want bits of a and b to DIFFER as much as possible, starting from the most significant bit. A Trie lets us greedily pick the "opposite" bit at each level.

**Greedy strategy for maximum XOR:**
Given a number `a`, to find the number `b` in our set that maximizes `a ^ b`:
1. Start from the MSB (bit 29 for values up to 10^9).
2. At each bit position, look at the current bit of `a`.
3. Try to go to the OPPOSITE child in the Trie (because opposite bits XOR to 1).
4. If the opposite child doesn't exist, go to the same child (XOR gives 0 for this bit).
5. The path you follow gives you the number `b` that maximizes `a ^ b`.

**Why greedy works:** Since we process from MSB to LSB, choosing the opposite bit at the highest position guarantees the maximum contribution. No combination of "correct" lower bits can overcome a "wrong" highest bit. This is because 2^k > 2^0 + 2^1 + ... + 2^(k-1).

**Bit count choice:** For constraints up to 10^9, we need 30 bits (since 2^30 = 1,073,741,824 > 10^9). For constraints up to 2 × 10^5, 18 bits suffice. Always check the constraint to determine the number of bits.

**Interview tip:** When you see "maximum XOR" in a problem, immediately think "binary Trie with greedy opposite-bit traversal."

**TrieNode for binary Trie:**
```
class TrieNode:
    children = [null, null]   // index 0 for bit 0, index 1 for bit 1
```

That's it — just two children instead of 26. Everything else (insert, search) works the same way, but with bits instead of characters.

---

# Maximum XOR of Two Numbers in an Array

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/
**GFG:** https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1

## Description

Given an integer array `nums`, return the **maximum XOR** of any two numbers in the array. In other words, find `max(nums[i] XOR nums[j])` where `0 <= i < j < n`.

**Input format:**
- An integer array `nums` of length n

**Output format:**
- An integer: the maximum XOR value

**Constraints:**
- 1 <= nums.length <= 2 × 10^5
- 0 <= nums[i] <= 2^31 - 1

**Example 1:**
```
Input: nums = [3, 10, 5, 25, 2, 8]
Output: 28
```
Explanation: Maximum XOR is 5 XOR 25 = 28. In binary: 00101 XOR 11001 = 11100 = 28. We want bits to differ as much as possible in the highest positions.

**Example 2:**
```
Input: nums = [14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]
Output: 127
```
Explanation: 83 XOR 44... (the maximum XOR pair produces 127 = 1111111 in binary).

**Example 3:**
```
Input: nums = [0]
Output: 0
```
Explanation: Only one element. The problem states i < j but with one element, no pair exists. Convention: return 0.

**Edge cases:**
- Single element: return 0
- All elements the same: return 0 (a XOR a = 0)
- Two elements: return nums[0] XOR nums[1]
- Powers of 2: the MSB position matters most

## In-depth Explanation

**Reframe the problem:** Among all N*(N-1)/2 pairs, find the pair whose XOR is maximum. XOR is maximized when bits differ starting from the most significant position.

**Pattern recognition:** This is the classic binary Trie + greedy problem. Keywords: "maximum XOR" → binary Trie. We insert all numbers as bit strings and for each number, greedily find the best partner.

**Real-world analogy:** Imagine you're on one side of a river (your binary number) and you want to reach as far away as possible on the other side. At each junction (bit position), you want to go the OPPOSITE direction. If you're at 0, go to 1. If you're at 1, go to 0. Taking the opposite path at the highest junction matters most because it determines the biggest "distance" (XOR value).

**Why naive thinking fails:** Brute force checks all O(N²) pairs. For N = 2 × 10^5, that's 4 × 10^10 operations — way too slow.

**Approach overview:** Brute force: O(N²) all pairs. Optimal: Binary Trie — insert all numbers, then for each number find the max XOR partner by greedy opposite-bit traversal. O(N × 30).

**Key edge cases:** All zeros (answer = 0). Numbers that differ only in the last bit. Numbers with the same MSB structure.

**Interview cheat sheet:**
- Keywords: "maximum XOR", "XOR of two numbers"
- Distinguisher: XOR problems with "maximum" almost always use binary Trie.
- **Aha moment:** Process bits from MSB to LSB; at each level, try the opposite bit to maximize the XOR.
- **Memory hook:** "Max XOR = binary Trie + greedy opposite bit."

## Brute Force Intuition

Check every pair (i, j) where i < j, compute nums[i] ^ nums[j], and track the maximum. Simple but O(N²) which is too slow for large inputs.

## Brute Force Step-by-Step Solution

**Opening:** We check every pair and compute their XOR, keeping track of the maximum value seen.

**Walkthrough with Example 1: nums = [3, 10, 5, 25, 2, 8]**

Step 1: Initialize maxXOR = 0. Check all pairs starting with index 0.

Step 2: i=0, j=1: 3^10 = 011^1010 = 1001 = 9. maxXOR = 9.
Step 3: i=0, j=2: 3^5 = 011^101 = 110 = 6. maxXOR still 9.
Step 4: i=0, j=3: 3^25 = 00011^11001 = 11010 = 26. maxXOR = 26.
Step 5: i=0, j=4: 3^2 = 011^010 = 001 = 1. maxXOR still 26.
Step 6: i=0, j=5: 3^8 = 0011^1000 = 1011 = 11. maxXOR still 26.

Step 7: i=1, j=2: 10^5 = 1010^0101 = 1111 = 15. maxXOR still 26.
Step 8: i=1, j=3: 10^25 = 01010^11001 = 10011 = 19. maxXOR still 26.
Step 9: i=1, j=4: 10^2 = 1010^0010 = 1000 = 8. maxXOR still 26.
Step 10: i=1, j=5: 10^8 = 1010^1000 = 0010 = 2. maxXOR still 26.

Step 11: i=2, j=3: 5^25 = 00101^11001 = 11100 = 28. maxXOR = 28!
Step 12: i=2, j=4: 5^2 = 101^010 = 111 = 7. maxXOR still 28.
Step 13: i=2, j=5: 5^8 = 0101^1000 = 1101 = 13. maxXOR still 28.

Step 14-15: Remaining pairs don't beat 28.

Answer: 28 (from 5 ^ 25).

**Correctness:** We exhaustively check every pair. The maximum is guaranteed to be found.

**Key invariant:** maxXOR always holds the maximum XOR seen among all pairs checked so far.

**Common mistakes:** Starting j from 0 instead of i+1 (unnecessary work, same result but doubled). Overflow issues with very large numbers (not a problem in Java with int XOR).

**30-second explanation:** "I check every pair of numbers, compute their XOR, and track the maximum. It works but is O(N²) — too slow for large inputs."

## Brute Force In-depth Intuition

The brute force is straightforward: XOR is a simple bitwise operation, and checking all pairs guarantees we find the maximum. The limitation is the quadratic time complexity. For N = 2 × 10^5, we'd compute about 2 × 10^10 XOR operations — far too slow.

The key insight that leads to the optimal solution: we don't need to check ALL pairs. For any given number, we can find its ideal XOR partner in O(30) time using a Trie. The Trie organizes numbers by their binary representation, and greedy opposite-bit traversal finds the maximum partner.

## Brute Force Algorithm

```
function findMaximumXOR(nums):
    maxXOR = 0
    n = nums.length

    for i = 0 to n - 2:
        for j = i + 1 to n - 1:
            currentXOR = nums[i] XOR nums[j]
            maxXOR = max(maxXOR, currentXOR)

    return maxXOR
```

Simple double loop with XOR computation at each pair.

## Brute Force Code

```java
class Solution {
    public int findMaximumXOR(int[] nums) {
        int maxXOR = 0;
        int n = nums.length;

        for (int i = 0; i < n - 1; i++) {
            for (int j = i + 1; j < n; j++) {
                int currentXOR = nums[i] ^ nums[j];
                maxXOR = Math.max(maxXOR, currentXOR);
            }
        }

        return maxXOR;
    }
}
```

## Brute Force Complexity

```
Time: O(N²) where N = nums.length
Space: O(1) — only a few variables
```

We check N*(N-1)/2 pairs, each XOR is O(1). For N = 2×10^5, this is about 2×10^10 operations, which will TLE (Time Limit Exceeded).

## Brute Force Hints

- Hint 1: XOR is maximized when bits differ. The most significant differing bit contributes the most.
- Hint 2: What if you could look at numbers bit by bit, starting from the most significant bit?
- Hint 3: Build a tree where each level represents one bit position (from MSB to LSB). Each node has two children: 0 and 1.
- Hint 4: For a given number, at each level, try to take the path with the OPPOSITE bit.
- Hint 5: Insert all numbers into the binary Trie, then for each number, traverse the Trie choosing opposite bits greedily.
- Hint 6: The greedy approach works because a higher bit position always outweighs all lower bits combined.

## Brute Force Visualization

```html
<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
  .viz-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:14px}
  @media(max-width:700px){.viz-grid{grid-template-columns:1fr}}
  .viz-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px}
  .viz-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border-radius:8px;line-height:1.8}
  .viz-state .changed{background:rgba(251,191,36,0.12);border-radius:3px;padding:1px 4px;color:#fbbf24}
  .ctrl-btn{background:#1a1a2e;color:#e4e4e7;border:1px solid #333;border-radius:8px;padding:6px 16px;cursor:pointer;font-size:13px}
  .ctrl-btn:hover{background:#252542}
  .ctrl-btn.active-tc{background:#4f8ff7;color:#fff;border-color:#4f8ff7}
  .log-entry{padding:3px 0;font-size:12px;font-family:'JetBrains Mono',monospace}
  .explanation-box{background:#141418;border-radius:8px;padding:12px;font-size:13px;line-height:1.6;margin-top:10px}
</style>

<div style="margin-bottom:10px">
  <strong style="color:#a78bfa;font-size:14px">Brute Force — All Pairs XOR</strong>
  <div style="margin-top:8px" id="xorBfTc"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="xBfPrev()">← Prev</button>
    <button class="ctrl-btn" onclick="xBfNext()">Next →</button>
    <button class="ctrl-btn" id="xBfPlayBtn" onclick="xBfToggle()">▶ Play</button>
    <span id="xBfCtr" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="xBfViz" style="min-height:120px"></div>
    <div class="viz-state" id="xBfState" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:220px;overflow-y:auto" id="xBfLog"></div>
    <div class="explanation-box" id="xBfExpl"></div>
  </div>
</div>

<script>
const XBF_TC=[
  {name:"Example 1",nums:[3,10,5,25,2,8]},
  {name:"All same",nums:[7,7,7]},
  {name:"Two elements",nums:[5,25]}
];
let xBfI=0,xBfS=0,xBfSteps=[],xBfPlay=null;
function xBfBuild(tc){
  xBfSteps=[];const nums=tc.nums;let mx=0;
  for(let i=0;i<nums.length-1;i++){
    for(let j=i+1;j<nums.length;j++){
      const x=nums[i]^nums[j];
      const isNew=x>mx;if(isNew)mx=x;
      xBfSteps.push({i,j,a:nums[i],b:nums[j],xor:x,max:mx,
        msg:`${nums[i]}^${nums[j]} = ${x}${isNew?" ← new max!":""}`,
        expl:`XOR of ${nums[i]} (${nums[i].toString(2).padStart(5,'0')}) and ${nums[j]} (${nums[j].toString(2).padStart(5,'0')}) = ${x} (${x.toString(2).padStart(5,'0')}). ${isNew?"New maximum!":"Not better than current max "+mx+"."}`,
        color:isNew?"#34d399":"#71717a"});
    }
  }
  xBfSteps.push({i:-1,j:-1,a:0,b:0,xor:mx,max:mx,msg:`Answer: ${mx}`,expl:`Maximum XOR = ${mx}.`,color:"#a78bfa"});
}
function xBfRender(){
  const s=xBfSteps[xBfS];if(!s)return;
  const nums=XBF_TC[xBfI].nums;
  let viz='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">';
  nums.forEach((n,idx)=>{
    const hl=idx===s.i||idx===s.j;
    viz+=`<div style="border:2px solid ${hl?'#4f8ff7':'#333'};border-radius:8px;padding:8px 12px;text-align:center;min-width:50px">
      <div style="font-size:16px;font-weight:bold;color:${hl?'#4f8ff7':'#e4e4e7'}">${n}</div>
      <div style="font-size:10px;color:#71717a;font-family:monospace">${n.toString(2).padStart(5,'0')}</div>
    </div>`;
  });
  viz+='</div>';
  if(s.i>=0){
    viz+=`<div style="font-family:monospace;font-size:14px;line-height:1.8">
      <div>  ${s.a.toString(2).padStart(8,'0')} <span style="color:#71717a">(${s.a})</span></div>
      <div>^ ${s.b.toString(2).padStart(8,'0')} <span style="color:#71717a">(${s.b})</span></div>
      <div style="border-top:1px solid #333;margin-top:2px;padding-top:2px;color:#fbbf24">= ${s.xor.toString(2).padStart(8,'0')} <span style="color:#71717a">(${s.xor})</span></div>
    </div>`;
  }
  document.getElementById("xBfViz").innerHTML=viz;
  document.getElementById("xBfState").innerHTML=`<div>Pair: <span class="changed">${s.i>=0?s.a+' ^ '+s.b:'-'}</span></div><div>Max XOR: <span class="changed">${s.max}</span></div>`;
  let lh='';for(let i=Math.max(0,xBfS-8);i<=xBfS;i++){lh+=`<div class="log-entry" style="color:${xBfSteps[i].color}">${i===xBfS?'▶ ':'  '}${xBfSteps[i].msg}</div>`;}
  document.getElementById("xBfLog").innerHTML=lh;
  document.getElementById("xBfExpl").innerHTML=s.expl;
  document.getElementById("xBfCtr").textContent=`Step ${xBfS+1}/${xBfSteps.length}`;
}
function xBfLoad(i){xBfI=i;xBfS=0;xBfBuild(XBF_TC[i]);document.querySelectorAll('.xbftc').forEach((b,j)=>{b.className=j===i?'ctrl-btn active-tc xbftc':'ctrl-btn xbftc';});xBfRender();}
function xBfPrev(){if(xBfS>0){xBfS--;xBfRender();}}
function xBfNext(){if(xBfS<xBfSteps.length-1){xBfS++;xBfRender();}}
function xBfToggle(){if(xBfPlay){clearInterval(xBfPlay);xBfPlay=null;document.getElementById("xBfPlayBtn").textContent="▶ Play";}else{xBfPlay=setInterval(()=>{if(xBfS<xBfSteps.length-1)xBfNext();else xBfToggle();},800);document.getElementById("xBfPlayBtn").textContent="⏸ Pause";}}
let xBfH='';XBF_TC.forEach((t,i)=>{xBfH+=`<button class="ctrl-btn xbftc" onclick="xBfLoad(${i})">${t.name}</button> `;});
document.getElementById("xorBfTc").innerHTML=xBfH;
xBfLoad(0);
</script>
</div>
```

## Optimal Intuition

Build a binary Trie by inserting all numbers bit by bit (MSB to LSB, 30 bits). Then for each number, traverse the Trie greedily choosing the OPPOSITE bit at each level to maximize XOR. The path you follow gives the number that produces the maximum XOR with the current number. Track the overall maximum across all numbers.

## Optimal Step-by-Step Solution

**Opening:** We insert all numbers into a binary Trie (each number as a 30-bit path). Then for each number, we greedily traverse the Trie to find the best XOR partner.

**Walkthrough with Example 1: nums = [3, 10, 5, 25, 2, 8], using 5 bits for simplicity.**

**Phase 1: Insert all numbers into Trie.**
```
 3 = 00011
10 = 01010
 5 = 00101
25 = 11001
 2 = 00010
 8 = 01000
```
Trie after all insertions:
```
        root
       /    \
      0      1
     / \      \
    0   1      1
   / \   \      \
  0   1   0      0
 / \  |   |      |
1   1 0   1      0
|   |     |      |
0   1     0      1
↑   ↑     ↑      ↑
2   3    10      25       (8=01000, 5=00101 also present)
```

**Phase 2: For each number, find max XOR partner.**

Step 1: num = 3 (00011). Greedy traversal:
- Bit 4 (MSB): num has 0 → want 1. Child 1 exists → go right. XOR bit = 1.
- Bit 3: num has 0 → want 1. Child 1 exists → go right. XOR bit = 1.
- Bit 2: num has 0 → want 1. Only child 0 exists → go left. XOR bit = 0.
- Bit 1: num has 1 → want 0. Child 0 exists → go left. XOR bit = 0.
- Bit 0: num has 1 → want 0. Child 1 exists → go right. XOR bit = 0.
Path followed = 11001 = 25. XOR = 3^25 = 11010 = 26. maxXOR = 26.

Step 2: num = 5 (00101). Greedy traversal:
- Bit 4: 0 → want 1. Go right. XOR = 1.
- Bit 3: 0 → want 1. Go right. XOR = 1.
- Bit 2: 1 → want 0. Go left. XOR = 1.
- Bit 1: 0 → want 1. No child 1. Go to 0. XOR = 0.
- Bit 0: 1 → want 0. Child 0 exists → go left. XOR = 1.
Path followed = 11001 = 25. XOR = 5^25 = 11100 = 28. maxXOR = 28!

Step 3: num = 25 (11001). Greedy traversal:
- Bit 4: 1 → want 0. Go left. XOR = 1.
- Bit 3: 1 → want 0. Go left. XOR = 1.
- Bit 2: 0 → want 1. Child 1 exists (from 5). XOR = 1.
- Bit 1: 0 → want 1. No → go 0. XOR = 0.
- Bit 0: 1 → want 0. Go 0. XOR = 1.
Path = 00101 = 5. XOR = 25^5 = 11100 = 28. maxXOR still 28.

(Other numbers won't beat 28.)

Answer: 28.

**Correctness:** For any number, the greedy traversal always finds the partner that maximizes XOR. This is because choosing the opposite bit at the highest position always contributes more than all lower bits combined. Since we try every number as the "query" number, we're guaranteed to find the global maximum XOR pair.

**Key invariant:** At each bit position during traversal, we've maximized the XOR for all higher bit positions.

**Common mistakes:** Wrong bit count (using 31 bits when 30 suffice). Processing bits from LSB to MSB (wrong — must go MSB to LSB). Not inserting all numbers before querying (some implementations insert and query simultaneously, which is also correct).

**30-second explanation:** "I build a binary Trie with all numbers. For each number, I greedily traverse the Trie choosing opposite bits to maximize XOR. The greedy works because higher bits contribute more. Total time O(N × 30)."

## Optimal In-depth Intuition

The binary Trie transforms the problem from O(N²) all-pairs comparison to O(N × B) where B is the bit width (30 for values up to 10^9). Each number is a 30-level path in the Trie. The greedy traversal exploits the positional value system of binary: bit k has value 2^k, and 2^k > 2^0 + 2^1 + ... + 2^(k-1) = 2^k - 1. So maximizing bit k is always better than maximizing ALL bits below k.

Why can we insert all and then query all? Because XOR is symmetric: if the best partner for number A is number B, then the pair (A,B) produces the maximum XOR. We just need to find one direction.

Alternative: Insert numbers one by one, querying the Trie BEFORE inserting each number. This also works and ensures we only compare with previously inserted numbers. Both approaches give the same answer because XOR is symmetric and we check all numbers.

Connection: This is essentially a greedy algorithm on a binary trie, similar to how Huffman coding uses a greedy approach on a priority queue. The key insight in both: process the most significant component first.

## Optimal Algorithm

```
BITS = 30    // sufficient for values up to 10^9

function insert(num):
    node = root
    for bitPos = BITS - 1 down to 0:
        bit = (num >> bitPos) & 1
        if node.children[bit] is null:
            node.children[bit] = new TrieNode()
        node = node.children[bit]

function getMaxXOR(num):
    node = root
    maxXOR = 0
    for bitPos = BITS - 1 down to 0:
        bit = (num >> bitPos) & 1
        oppositeBit = 1 - bit
        if node.children[oppositeBit] is not null:
            maxXOR = maxXOR | (1 << bitPos)    // this bit contributes 1 to XOR
            node = node.children[oppositeBit]
        else:
            node = node.children[bit]          // forced to take same bit, XOR = 0
    return maxXOR

function findMaximumXOR(nums):
    // Insert all numbers
    for num in nums:
        insert(num)

    // Query each number
    result = 0
    for num in nums:
        result = max(result, getMaxXOR(num))
    return result
```

Insert builds 30-level binary paths. getMaxXOR greedily picks opposite bits. We set the XOR bit to 1 (via OR) when we successfully pick the opposite.

## Optimal Code

```java
class Solution {
    static final int BITS = 30;
    static int[][] children;
    static int nodeCount;

    static int createNode() {
        int id = nodeCount++;
        children[id][0] = -1;
        children[id][1] = -1;
        return id;
    }

    static void insert(int num) {
        int node = 0;
        for (int bitPos = BITS - 1; bitPos >= 0; bitPos--) {
            int bit = (num >> bitPos) & 1;
            if (children[node][bit] == -1) {
                children[node][bit] = createNode();
            }
            node = children[node][bit];
        }
    }

    static int getMaxXOR(int num) {
        int node = 0;
        int maxXOR = 0;
        for (int bitPos = BITS - 1; bitPos >= 0; bitPos--) {
            int bit = (num >> bitPos) & 1;
            int oppositeBit = 1 - bit;
            if (children[node][oppositeBit] != -1) {
                maxXOR |= (1 << bitPos);
                node = children[node][oppositeBit];
            } else {
                node = children[node][bit];
            }
        }
        return maxXOR;
    }

    public int findMaximumXOR(int[] nums) {
        int maxNodes = nums.length * BITS + 2;
        children = new int[maxNodes][2];
        nodeCount = 0;
        createNode(); // root

        for (int num : nums) {
            insert(num);
        }

        int result = 0;
        for (int num : nums) {
            result = Math.max(result, getMaxXOR(num));
        }
        return result;
    }
}
```

## Optimal Complexity

```
Time: O(N × B) where N = nums.length, B = 30 (bit width)
Space: O(N × B) for the Trie
```

Each insert traverses B = 30 levels, creating at most 30 nodes. Each query traverses 30 levels with O(1) work per level. Total: O(N × 30) ≈ O(N). Space: at most N × 30 nodes (in practice fewer due to shared prefixes), each with 2 children pointers.

## Optimal Hints

- Hint 1: XOR gives 1 when bits differ. To maximize XOR, you want bits to differ starting from the MSB.
- Hint 2: Build a Trie where each node has 2 children (bit 0 and bit 1), and each number is a 30-bit path.
- Hint 3: For a given number, at each level, try to take the child with the OPPOSITE bit value.
- Hint 4: If the opposite child doesn't exist, take the same bit (XOR = 0 for this position).
- Hint 5: Use `maxXOR |= (1 << bitPos)` when you successfully take the opposite bit.
- Hint 6: The greedy works because 2^k > sum of all 2^0 to 2^(k-1). Higher bits always dominate.

## Optimal Visualization

```html
<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
  .viz-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:14px}
  @media(max-width:700px){.viz-grid{grid-template-columns:1fr}}
  .viz-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px}
  .viz-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border-radius:8px;line-height:1.8}
  .viz-state .changed{background:rgba(251,191,36,0.12);border-radius:3px;padding:1px 4px;color:#fbbf24}
  .viz-code{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:2}
  .viz-code .active{background:rgba(79,143,247,0.15);border-radius:3px;padding:1px 4px;color:#93c5fd}
  .viz-code .dim{color:#3f3f46}
  .ctrl-btn{background:#1a1a2e;color:#e4e4e7;border:1px solid #333;border-radius:8px;padding:6px 16px;cursor:pointer;font-size:13px}
  .ctrl-btn:hover{background:#252542}
  .ctrl-btn.active-tc{background:#4f8ff7;color:#fff;border-color:#4f8ff7}
  .log-entry{padding:3px 0;font-size:12px;font-family:'JetBrains Mono',monospace}
  .explanation-box{background:#141418;border-radius:8px;padding:12px;font-size:13px;line-height:1.6;margin-top:10px}
</style>

<div style="margin-bottom:10px">
  <strong style="color:#a78bfa;font-size:14px">Optimal — Binary Trie + Greedy XOR</strong>
  <div style="margin-top:8px" id="xOptTc"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="xOptPrev()">← Prev</button>
    <button class="ctrl-btn" onclick="xOptNext()">Next →</button>
    <button class="ctrl-btn" id="xOptPlayBtn" onclick="xOptToggle()">▶ Play</button>
    <span id="xOptCtr" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="xOptViz" style="min-height:200px;overflow:auto"></div>
    <div class="viz-state" id="xOptState" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="xOptLog"></div>
    <div class="viz-code" id="xOptCode" style="margin-top:10px"></div>
    <div class="explanation-box" id="xOptExpl"></div>
  </div>
</div>

<script>
const XOPT_CODE=["for num in nums: insert(num)","","getMaxXOR(num):","  node = root; maxXOR = 0","  for bit = MSB to LSB:","    if opposite child exists:","      maxXOR |= (1<<bit); go opposite","    else: go same bit"];
const XOPT_TC=[
  {name:"[3,10,5,25,2,8]",nums:[3,10,5,25,2,8],bits:5},
  {name:"[5,25]",nums:[5,25],bits:5},
  {name:"[7,7,7]",nums:[7,7,7],bits:3}
];

let xOptI=0,xOptS=0,xOptSteps=[],xOptPlay=null;
function xOptBuild(tc){
  xOptSteps=[];const{nums,bits}=tc;
  // Build trie
  const trie=[{children:[-1,-1]}];
  function ins(num){
    let n=0;
    for(let b=bits-1;b>=0;b--){
      const bit=(num>>b)&1;
      if(trie[n].children[bit]===-1){const id=trie.length;trie.push({children:[-1,-1]});trie[n].children[bit]=id;}
      n=trie[n].children[bit];
    }
  }
  nums.forEach(ins);
  xOptSteps.push({phase:"insert",msg:`Inserted all ${nums.length} numbers into binary Trie (${bits} bits)`,
    queryNum:-1,bitPos:-1,maxXOR:0,globalMax:0,path:[],
    expl:`All numbers inserted. Trie built with ${trie.length} nodes. Now querying each number for max XOR partner.`,color:"#71717a"});

  let globalMax=0;
  for(const num of nums){
    let n=0,mxor=0;const path=[0];
    for(let b=bits-1;b>=0;b--){
      const bit=(num>>b)&1;const opp=1-bit;
      let took;
      if(trie[n].children[opp]!==-1){mxor|=(1<<b);n=trie[n].children[opp];took=opp;}
      else{n=trie[n].children[bit];took=bit;}
      path.push(n);
      xOptSteps.push({phase:"query",queryNum:num,bitPos:b,curBit:bit,tookBit:took,success:took===opp,maxXOR:mxor,globalMax:Math.max(globalMax,mxor),path:[...path],
        msg:`num=${num} bit[${b}]=${bit} → ${took===opp?"opposite "+opp+" ✓":"same "+took+" ✗"} | XOR so far: ${mxor}`,
        expl:`Querying ${num} (${num.toString(2).padStart(bits,'0')}). Bit position ${b}: num's bit is ${bit}, want opposite ${opp}. ${took===opp?`Opposite child exists → take it! XOR bit = 1. XOR accumulates to ${mxor}.`:`Opposite doesn't exist → forced to take same bit ${took}. XOR bit = 0.`}`,
        color:took===opp?"#34d399":"#fbbf24"});
    }
    if(mxor>globalMax)globalMax=mxor;
    xOptSteps.push({phase:"result",queryNum:num,bitPos:-1,maxXOR:mxor,globalMax,path,
      msg:`num=${num}: max XOR partner gives ${mxor}. Global max = ${globalMax}`,
      expl:`For number ${num}, the best XOR achievable is ${mxor} (${mxor.toString(2).padStart(bits,'0')}). Global maximum so far: ${globalMax}.`,
      color:mxor>=globalMax?"#34d399":"#71717a"});
  }
  xOptSteps.push({phase:"done",queryNum:-1,bitPos:-1,maxXOR:globalMax,globalMax,path:[],
    msg:`Answer: ${globalMax}`,expl:`Maximum XOR of any two numbers = ${globalMax}.`,color:"#a78bfa"});
}
function xOptRender(){
  const s=xOptSteps[xOptS];if(!s)return;
  const tc=XOPT_TC[xOptI];
  // Show numbers with binary
  let viz='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
  tc.nums.forEach(n=>{
    const hl=n===s.queryNum;
    viz+=`<div style="border:1px solid ${hl?'#4f8ff7':'#333'};border-radius:6px;padding:4px 8px;font-size:12px;font-family:monospace">
      <span style="color:${hl?'#4f8ff7':'#e4e4e7'}">${n}</span>
      <span style="color:#71717a;font-size:10px;margin-left:4px">${n.toString(2).padStart(tc.bits,'0')}</span>
    </div>`;
  });
  viz+='</div>';
  // Show XOR accumulation
  if(s.queryNum>=0&&s.bitPos>=0){
    viz+=`<div style="font-family:monospace;font-size:13px;line-height:1.6;margin-top:6px">
      <div>Query: ${s.queryNum.toString(2).padStart(tc.bits,'0')} <span style="color:#71717a">(${s.queryNum})</span></div>
      <div>XOR:   ${s.maxXOR.toString(2).padStart(tc.bits,'0')} <span style="color:#fbbf24">(${s.maxXOR})</span></div>
      <div style="margin-top:4px;font-size:11px;color:#71717a">Bit position ${s.bitPos}: ${s.success?'<span style="color:#34d399">took opposite ✓</span>':'<span style="color:#fbbf24">forced same ✗</span>'}</div>
    </div>`;
  }
  document.getElementById("xOptViz").innerHTML=viz;
  document.getElementById("xOptState").innerHTML=`<div>Query num: <span class="changed">${s.queryNum>=0?s.queryNum:'-'}</span></div><div>XOR so far: <span class="changed">${s.maxXOR}</span></div><div>Global max: <span class="changed">${s.globalMax}</span></div>`;
  let ch='';XOPT_CODE.forEach((l,i)=>{const active=s.phase==='insert'?i===0:s.phase==='query'?(s.success?i===6:i===7):i===0;ch+=`<div class="${active?'active':'dim'}">${l}</div>`;});
  document.getElementById("xOptCode").innerHTML=ch;
  let lh='';for(let i=Math.max(0,xOptS-10);i<=xOptS;i++){lh+=`<div class="log-entry" style="color:${xOptSteps[i].color}">${i===xOptS?'▶ ':'  '}${xOptSteps[i].msg}</div>`;}
  document.getElementById("xOptLog").innerHTML=lh;
  document.getElementById("xOptExpl").innerHTML=s.expl;
  document.getElementById("xOptCtr").textContent=`Step ${xOptS+1}/${xOptSteps.length}`;
}
function xOptLoad(i){xOptI=i;xOptS=0;xOptBuild(XOPT_TC[i]);document.querySelectorAll('.xopttc').forEach((b,j)=>{b.className=j===i?'ctrl-btn active-tc xopttc':'ctrl-btn xopttc';});xOptRender();}
function xOptPrev(){if(xOptS>0){xOptS--;xOptRender();}}
function xOptNext(){if(xOptS<xOptSteps.length-1){xOptS++;xOptRender();}}
function xOptToggle(){if(xOptPlay){clearInterval(xOptPlay);xOptPlay=null;document.getElementById("xOptPlayBtn").textContent="▶ Play";}else{xOptPlay=setInterval(()=>{if(xOptS<xOptSteps.length-1)xOptNext();else xOptToggle();},900);document.getElementById("xOptPlayBtn").textContent="⏸ Pause";}}
let xOptH='';XOPT_TC.forEach((t,i)=>{xOptH+=`<button class="ctrl-btn xopttc" onclick="xOptLoad(${i})">${t.name}</button> `;});
document.getElementById("xOptTc").innerHTML=xOptH;
xOptLoad(0);
</script>
</div>
```

---

# Maximum XOR With an Element From an Array

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/maximum-xor-with-an-element-from-an-array/
**GFG:** https://www.geeksforgeeks.org/problems/maximum-xor-with-an-element-from-array/1

## Description

You are given an array `nums` of non-negative integers and a 2D array `queries` where `queries[i] = [xi, mi]`.

For each query `(xi, mi)`, find the **maximum XOR** of `xi` with any element from `nums` that is **less than or equal to `mi`**. If no element in `nums` satisfies `nums[j] <= mi`, return -1 for that query.

Return an array `answer` where `answer[i]` is the result of the i-th query.

**Input format:**
- An integer array `nums` of length n
- A 2D array `queries` of length q, each with [xi, mi]

**Output format:**
- An integer array of length q with the answer for each query

**Constraints:**
- 1 <= nums.length, queries.length <= 10^5
- 0 <= nums[j], xi, mi <= 10^9

**Example 1:**
```
Input: nums = [0, 1, 2, 3, 4], queries = [[3, 1], [1, 3], [5, 6]]
Output: [3, 3, 7]
```
Explanation:
- Query [3, 1]: Elements ≤ 1 are {0, 1}. max(3^0, 3^1) = max(3, 2) = 3.
- Query [1, 3]: Elements ≤ 3 are {0, 1, 2, 3}. max(1^0, 1^1, 1^2, 1^3) = max(1, 0, 3, 2) = 3.
- Query [5, 6]: All elements ≤ 6. max(5^0, 5^1, 5^2, 5^3, 5^4) = max(5, 4, 7, 6, 1) = 7.

**Example 2:**
```
Input: nums = [5, 2, 4, 6, 6, 3], queries = [[12, 4], [8, 1], [6, 3]]
Output: [15, -1, 5]
```
Explanation:
- [12, 4]: Elements ≤ 4 are {2, 4, 3}. max(12^2, 12^4, 12^3) = max(14, 8, 15) = 15.
- [8, 1]: No element ≤ 1 exists in {5,2,4,6,6,3} ... wait, 2 is > 1? No, the nums are [5,2,4,6,6,3]. Hmm, actually there are no elements ≤ 1 here. Return -1.
- [6, 3]: Elements ≤ 3 are {2, 3}. max(6^2, 6^3) = max(4, 5) = 5.

**Edge cases:**
- mi is smaller than all elements in nums → return -1
- mi is larger than all elements → all nums are candidates
- xi = 0 → XOR with any number is the number itself → find max element ≤ mi
- All elements equal

## In-depth Explanation

**Reframe the problem:** This is the "Maximum XOR" problem from before, but with an additional constraint: we can only XOR with elements ≤ mi. It's like having a filter on which elements are available for each query.

**Pattern recognition:** This is a **sorted insertion + offline query** pattern combined with a binary Trie. Keywords: "maximum XOR with constraint" → binary Trie + sorting trick. We sort both nums and queries by the limit mi, then process queries in order of increasing mi, inserting elements into the Trie only when they become "eligible."

**Real-world analogy:** Imagine a library where books arrive in order of their page count (sorted nums). A student has multiple requests, each with a maximum page count they're willing to read (mi). We sort the requests by page limit. For each request, we first add all books within the limit, then find the best book (maximum XOR) using the Trie.

**Why naive thinking fails:** For each query, filtering nums then running the basic max-XOR Trie would work but is O(Q × N × B) — too slow. We need to avoid rebuilding the Trie for each query.

**Approach overview:** Brute force: For each query, filter elements ≤ mi, then check all pairs — O(Q × N). Optimal: Sort nums and queries by mi, insert elements into Trie incrementally, answer queries using greedy Trie traversal — O((N + Q) × B).

**Key edge cases:** Empty result for a query (all elements > mi). All queries have the same mi. Duplicate elements in nums.

**Interview cheat sheet:**
- Keywords: "maximum XOR with constraint", "XOR with limit"
- Distinguisher: This adds a "filter" to the basic max-XOR problem. The filter is handled by offline sorting.
- **Aha moment:** Sort nums and queries by mi. Insert elements into Trie as the limit increases. Each query sees exactly the right elements.
- **Memory hook:** "Offline sorted Trie — sort by limit, insert incrementally, query greedily."

## Brute Force Intuition

For each query (xi, mi), iterate through nums and collect all elements ≤ mi. Then for each valid element, compute XOR with xi and track the maximum. If no element is valid, return -1. This is O(Q × N) — potentially too slow but straightforward.

## Brute Force Step-by-Step Solution

**Opening:** For each query, we scan the entire array to find valid elements and compute the max XOR.

**Walkthrough with Example 1: nums = [0,1,2,3,4], queries = [[3,1],[1,3],[5,6]]**

Step 1: Query [3, 1]. xi=3, mi=1. Scan nums:
- 0 ≤ 1 ✓ → 3^0 = 3
- 1 ≤ 1 ✓ → 3^1 = 2
- 2 ≤ 1? No.
- 3 ≤ 1? No.
- 4 ≤ 1? No.
Max XOR = 3. Answer[0] = 3.

Step 2: Query [1, 3]. xi=1, mi=3. Scan nums:
- 0 ≤ 3 ✓ → 1^0 = 1
- 1 ≤ 3 ✓ → 1^1 = 0
- 2 ≤ 3 ✓ → 1^2 = 3
- 3 ≤ 3 ✓ → 1^3 = 2
- 4 ≤ 3? No.
Max XOR = 3. Answer[1] = 3.

Step 3: Query [5, 6]. xi=5, mi=6. All elements ≤ 6.
- 5^0=5, 5^1=4, 5^2=7, 5^3=6, 5^4=1
Max XOR = 7. Answer[2] = 7.

Answer: [3, 3, 7].

**Correctness:** We check every element against the constraint and compute XOR exhaustively.

**Key invariant:** For each query, we consider exactly the elements satisfying the constraint.

**Common mistakes:** Forgetting to handle the -1 case when no element satisfies the constraint.

**30-second explanation:** "For each query, I scan all elements, filter by the limit, compute XOR with the query value, and return the maximum. O(Q×N) but correct."

## Brute Force In-depth Intuition

The brute force directly follows the problem definition. For each query, it does a linear scan of nums (O(N)), computing XOR for valid elements. With Q queries and N elements, total time is O(Q × N). For Q = N = 10^5, that's 10^10 — too slow.

The optimization insight: if we sort both nums and queries by the limit mi, we can incrementally build the Trie. As mi increases, we add more elements to the Trie. Each query then runs the standard greedy XOR search on the Trie containing only elements ≤ mi. This is the offline query technique.

## Brute Force Algorithm

```
function maximizeXor(nums, queries):
    answers = array of size queries.length

    for i = 0 to queries.length - 1:
        xi = queries[i][0]
        mi = queries[i][1]
        maxXOR = -1
        for each num in nums:
            if num <= mi:
                maxXOR = max(maxXOR, xi XOR num)
        answers[i] = maxXOR

    return answers
```

Simple nested loop: outer over queries, inner over nums with filter.

## Brute Force Code

```java
class Solution {
    public int[] maximizeXor(int[] nums, int[][] queries) {
        int q = queries.length;
        int[] answers = new int[q];

        for (int i = 0; i < q; i++) {
            int xi = queries[i][0];
            int mi = queries[i][1];
            int maxXOR = -1;

            for (int num : nums) {
                if (num <= mi) {
                    maxXOR = Math.max(maxXOR, xi ^ num);
                }
            }

            answers[i] = maxXOR;
        }

        return answers;
    }
}
```

## Brute Force Complexity

```
Time: O(Q × N) where Q = number of queries, N = nums.length
Space: O(Q) for the answer array
```

Each query scans all N elements. With Q = N = 10^5, total operations = 10^10, which will TLE.

## Brute Force Hints

- Hint 1: If you sort nums, you can easily find all elements ≤ mi using binary search.
- Hint 2: But even with binary search, you still need to XOR with each valid element. Can a Trie help?
- Hint 3: If you also sort queries by mi, you can insert elements into the Trie incrementally.
- Hint 4: Sort nums ascending. Sort queries by mi ascending. Maintain a pointer into nums.
- Hint 5: For each query (in sorted order), insert all nums[pointer] ≤ mi into the Trie, then query.
- Hint 6: Don't forget: queries arrive in original order but you process them sorted. Use index tracking to place answers correctly.

## Brute Force Visualization

```html
<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
  .viz-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:14px}
  @media(max-width:700px){.viz-grid{grid-template-columns:1fr}}
  .viz-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px}
  .viz-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border-radius:8px;line-height:1.8}
  .viz-state .changed{background:rgba(251,191,36,0.12);border-radius:3px;padding:1px 4px;color:#fbbf24}
  .ctrl-btn{background:#1a1a2e;color:#e4e4e7;border:1px solid #333;border-radius:8px;padding:6px 16px;cursor:pointer;font-size:13px}
  .ctrl-btn:hover{background:#252542}
  .ctrl-btn.active-tc{background:#4f8ff7;color:#fff;border-color:#4f8ff7}
  .log-entry{padding:3px 0;font-size:12px;font-family:'JetBrains Mono',monospace}
  .explanation-box{background:#141418;border-radius:8px;padding:12px;font-size:13px;line-height:1.6;margin-top:10px}
</style>

<div style="margin-bottom:10px">
  <strong style="color:#a78bfa;font-size:14px">Brute Force — Linear Scan Per Query</strong>
  <div style="margin-top:8px" id="mqBfTc"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="mqBfPrev()">← Prev</button>
    <button class="ctrl-btn" onclick="mqBfNext()">Next →</button>
    <button class="ctrl-btn" id="mqBfPlayBtn" onclick="mqBfToggle()">▶ Play</button>
    <span id="mqBfCtr" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="mqBfViz" style="min-height:120px"></div>
    <div class="viz-state" id="mqBfState" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="mqBfLog"></div>
    <div class="explanation-box" id="mqBfExpl"></div>
  </div>
</div>

<script>
const MQBF_TC=[
  {name:"Example 1",nums:[0,1,2,3,4],queries:[[3,1],[1,3],[5,6]]},
  {name:"Has -1",nums:[5,2,4,6,6,3],queries:[[12,4],[8,1],[6,3]]}
];
let mqBfI=0,mqBfS=0,mqBfSteps=[],mqBfPlay=null;
function mqBfBuild(tc){
  mqBfSteps=[];const{nums,queries}=tc;const ans=[];
  for(let qi=0;qi<queries.length;qi++){
    const[xi,mi]=queries[qi];let mx=-1;
    for(let ni=0;ni<nums.length;ni++){
      const valid=nums[ni]<=mi;
      const xor=valid?xi^nums[ni]:-1;
      if(valid&&xor>mx)mx=xor;
      mqBfSteps.push({qi,xi,mi,ni,num:nums[ni],valid,xor:valid?xor:-1,mx,
        msg:`Q${qi}[${xi},${mi}]: ${nums[ni]}${valid?'≤':'>'} ${mi} ${valid?'→ XOR='+xor:'→ skip'}${valid&&xor>=mx?' ★':''}`,
        expl:`Query ${qi}: xi=${xi}, limit=${mi}. Element ${nums[ni]} is ${valid?'≤':'>'} ${mi}. ${valid?`XOR = ${xi}^${nums[ni]} = ${xor}. ${xor>=mx?'New max!':'Not better.'}`:'Skipped.'}`,
        color:valid?(xor>=mx?'#34d399':'#71717a'):'#f87171'});
    }
    ans.push(mx);
    mqBfSteps.push({qi,xi,mi,ni:-1,num:-1,valid:false,xor:-1,mx,
      msg:`Q${qi} answer: ${mx}`,expl:`Query ${qi} done. Answer = ${mx}.`,color:"#a78bfa"});
  }
  mqBfSteps.push({qi:-1,xi:0,mi:0,ni:-1,num:-1,valid:false,xor:-1,mx:0,
    msg:`Final: [${ans.join(', ')}]`,expl:`All queries answered: [${ans.join(', ')}].`,color:"#a78bfa"});
}
function mqBfRender(){
  const s=mqBfSteps[mqBfS];if(!s)return;
  const tc=MQBF_TC[mqBfI];
  let viz='<div style="margin-bottom:8px;font-size:12px;color:#71717a">nums:</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
  tc.nums.forEach((n,i)=>{
    const hl=i===s.ni;const valid=s.valid&&hl;
    viz+=`<div style="border:2px solid ${hl?(valid?'#34d399':'#f87171'):'#333'};border-radius:6px;padding:6px 10px;font-size:14px;font-family:monospace;color:${hl?'#e4e4e7':'#71717a'}">${n}</div>`;
  });
  viz+='</div>';
  if(s.qi>=0){viz+=`<div style="font-size:13px">Query: xi=<span style="color:#4f8ff7;font-weight:bold">${s.xi}</span>, limit=<span style="color:#fbbf24;font-weight:bold">${s.mi}</span> | Max XOR so far: <span style="color:#34d399;font-weight:bold">${s.mx}</span></div>`;}
  document.getElementById("mqBfViz").innerHTML=viz;
  document.getElementById("mqBfState").innerHTML=`<div>Query: <span class="changed">${s.qi>=0?`[${s.xi},${s.mi}]`:'-'}</span></div><div>Max XOR: <span class="changed">${s.mx}</span></div>`;
  let lh='';for(let i=Math.max(0,mqBfS-8);i<=mqBfS;i++){lh+=`<div class="log-entry" style="color:${mqBfSteps[i].color}">${i===mqBfS?'▶ ':'  '}${mqBfSteps[i].msg}</div>`;}
  document.getElementById("mqBfLog").innerHTML=lh;
  document.getElementById("mqBfExpl").innerHTML=s.expl;
  document.getElementById("mqBfCtr").textContent=`Step ${mqBfS+1}/${mqBfSteps.length}`;
}
function mqBfLoad(i){mqBfI=i;mqBfS=0;mqBfBuild(MQBF_TC[i]);document.querySelectorAll('.mqbftc').forEach((b,j)=>{b.className=j===i?'ctrl-btn active-tc mqbftc':'ctrl-btn mqbftc';});mqBfRender();}
function mqBfPrev(){if(mqBfS>0){mqBfS--;mqBfRender();}}
function mqBfNext(){if(mqBfS<mqBfSteps.length-1){mqBfS++;mqBfRender();}}
function mqBfToggle(){if(mqBfPlay){clearInterval(mqBfPlay);mqBfPlay=null;document.getElementById("mqBfPlayBtn").textContent="▶ Play";}else{mqBfPlay=setInterval(()=>{if(mqBfS<mqBfSteps.length-1)mqBfNext();else mqBfToggle();},700);document.getElementById("mqBfPlayBtn").textContent="⏸ Pause";}}
let mqBfH='';MQBF_TC.forEach((t,i)=>{mqBfH+=`<button class="ctrl-btn mqbftc" onclick="mqBfLoad(${i})">${t.name}</button> `;});
document.getElementById("mqBfTc").innerHTML=mqBfH;
mqBfLoad(0);
</script>
</div>
```

## Optimal Intuition

Sort `nums` in ascending order. Sort `queries` by `mi` in ascending order (keep original indices for answer placement). Maintain a pointer `p` into sorted nums. For each query (in sorted mi order), insert all nums[p] ≤ mi into the binary Trie, advance `p`, then use the standard greedy XOR traversal to find the maximum XOR for xi. If the Trie is empty (p = 0, no elements ≤ mi), answer is -1.

## Optimal Step-by-Step Solution

**Opening:** We sort nums and process queries offline (sorted by mi). This lets us incrementally build the Trie as the limit increases.

**Walkthrough with Example 1: nums = [0,1,2,3,4], queries = [[3,1],[1,3],[5,6]]**

Step 1: Sort nums → [0, 1, 2, 3, 4] (already sorted).
Sort queries by mi: [[3,1,idx=0], [1,3,idx=1], [5,6,idx=2]].
Initialize pointer p = 0.

Step 2: Process query [3, 1] (mi=1, original index 0).
Insert nums while nums[p] ≤ 1:
- nums[0]=0 ≤ 1 → insert 0 into Trie. p=1.
- nums[1]=1 ≤ 1 → insert 1 into Trie. p=2.
- nums[2]=2 > 1 → stop.
Trie contains {0, 1}. Greedy XOR with xi=3:
- 3 = 011. At each bit, try opposite.
- Bit 2: 3's bit=0, want 1 → no (only 0 and 1, both have bit 2 = 0) → take 0.
- Bit 1: 3's bit=1, want 0 → 0 has bit 1 = 0 ✓ → take 0. XOR |= 2.
- Bit 0: 3's bit=1, want 0 → follow 0's path (bit 0 = 0) ✓ → XOR |= 1.
maxXOR = 3 (from 3^0). answers[0] = 3.

Step 3: Process query [1, 3] (mi=3, original index 1).
Insert nums while nums[p] ≤ 3:
- nums[2]=2 ≤ 3 → insert. p=3.
- nums[3]=3 ≤ 3 → insert. p=4.
- nums[4]=4 > 3 → stop.
Trie now contains {0, 1, 2, 3}. Greedy XOR with xi=1:
- 1 = 001. At each bit try opposite.
- Bit 2: 1's bit=0, want 1 → no 1s at bit 2 → take 0.
- Bit 1: 1's bit=0, want 1 → 2(10) or 3(11) have bit 1 = 1 ✓ → take 1. XOR |= 2.
- Bit 0: 1's bit=1, want 0 → 2 has bit 0 = 0 ✓ → take 0. XOR |= 1.
maxXOR = 3 (from 1^2). answers[1] = 3.

Step 4: Process query [5, 6] (mi=6, original index 2).
Insert nums while nums[p] ≤ 6:
- nums[4]=4 ≤ 6 → insert. p=5. Done (end of array).
Trie now contains {0, 1, 2, 3, 4}. Greedy XOR with xi=5:
- 5 = 101. Try opposite bits.
- Bit 2: 5's bit=1, want 0 → 0,1,2,3 have bit 2 = 0 ✓ → take 0. XOR |= 4.
- Bit 1: 5's bit=0, want 1 → 2(10) or 3(11) ✓ → take 1. XOR |= 2.
- Bit 0: 5's bit=1, want 0 → 2 has bit 0 = 0 ✓ → take 0. XOR |= 1.
maxXOR = 7 (from 5^2). answers[2] = 7.

Answer: [3, 3, 7].

**Correctness:** By sorting both nums and queries by the limit, we ensure that when we process query i, the Trie contains exactly the elements ≤ mi. The pointer p never goes backward because queries are processed in increasing mi order.

**Key invariant:** After inserting elements for query i, the Trie contains ALL elements ≤ mi and ONLY those elements. This is because we process queries in sorted mi order and nums is sorted.

**Common mistakes:** Forgetting to preserve original query indices (you need to place answers in original order). Not handling the Trie-is-empty case (return -1). Using the wrong number of bits.

**30-second explanation:** "Sort nums and queries by limit. Process queries in limit order, inserting elements into a binary Trie as they become eligible. For each query, do the standard greedy opposite-bit XOR traversal. O((N+Q) × 30)."

## Optimal In-depth Intuition

This problem combines two techniques: **offline query processing** and **binary Trie for max XOR**.

**Why offline?** If we processed queries in original order, the set of valid elements (≤ mi) changes unpredictably — we'd need to rebuild or modify the Trie for each query. By sorting queries by mi, the valid set only grows (never shrinks), so we can incrementally add to the Trie.

**Why sort nums too?** Because we need to efficiently find which elements are ≤ mi. With sorted nums and a pointer, we just advance the pointer until we exceed mi. Each element is inserted into the Trie exactly once across all queries.

**Total work:** Sorting nums: O(N log N). Sorting queries: O(Q log Q). Inserting N elements into Trie: O(N × 30). Answering Q queries: O(Q × 30). Total: O((N + Q) × 30 + N log N + Q log Q).

Connection to other problems: This "sort + offline + incremental" pattern appears in many problems: "queries with constraints" are often solved by sorting by the constraint and processing offline. Examples include "merge intervals with queries", "range sum with updates", etc.

What if queries had BOTH a lower and upper bound? Then we'd need a persistent Trie or merge sort tree — much harder. The single-bound constraint is what makes the offline approach clean.

## Optimal Algorithm

```
BITS = 30

function maximizeXor(nums, queries):
    sort nums ascending
    // Augment queries with original index
    sortedQueries = [(xi, mi, originalIndex) for each query]
    sort sortedQueries by mi ascending

    answers = array of size queries.length
    trie = empty binary Trie
    pointer = 0

    for each (xi, mi, origIdx) in sortedQueries:
        // Insert all nums ≤ mi
        while pointer < nums.length and nums[pointer] <= mi:
            trieInsert(nums[pointer])
            pointer++

        // Query
        if pointer == 0:
            answers[origIdx] = -1     // no elements ≤ mi
        else:
            answers[origIdx] = trieGetMaxXOR(xi)

    return answers
```

Sorting both arrays ensures monotonic pointer advancement. Each element is inserted once. Each query does one Trie traversal.

## Optimal Code

```java
class Solution {
    static final int BITS = 30;
    static int[][] children;
    static int nodeCount;

    static int createNode() {
        int id = nodeCount++;
        children[id][0] = -1;
        children[id][1] = -1;
        return id;
    }

    static void insert(int num) {
        int node = 0;
        for (int bitPos = BITS - 1; bitPos >= 0; bitPos--) {
            int bit = (num >> bitPos) & 1;
            if (children[node][bit] == -1) {
                children[node][bit] = createNode();
            }
            node = children[node][bit];
        }
    }

    static int getMaxXOR(int num) {
        int node = 0;
        int maxXOR = 0;
        for (int bitPos = BITS - 1; bitPos >= 0; bitPos--) {
            int bit = (num >> bitPos) & 1;
            int opp = 1 - bit;
            if (children[node][opp] != -1) {
                maxXOR |= (1 << bitPos);
                node = children[node][opp];
            } else {
                node = children[node][bit];
            }
        }
        return maxXOR;
    }

    public int[] maximizeXor(int[] nums, int[][] queries) {
        Arrays.sort(nums);

        int q = queries.length;
        int[][] sortedQueries = new int[q][3];
        for (int i = 0; i < q; i++) {
            sortedQueries[i][0] = queries[i][0]; // xi
            sortedQueries[i][1] = queries[i][1]; // mi
            sortedQueries[i][2] = i;              // original index
        }
        Arrays.sort(sortedQueries, (a, b) -> a[1] - b[1]);

        int maxNodes = nums.length * BITS + 2;
        children = new int[maxNodes][2];
        nodeCount = 0;
        createNode(); // root

        int[] answers = new int[q];
        int pointer = 0;

        for (int[] sq : sortedQueries) {
            int xi = sq[0];
            int mi = sq[1];
            int origIdx = sq[2];

            // Insert all elements ≤ mi
            while (pointer < nums.length && nums[pointer] <= mi) {
                insert(nums[pointer]);
                pointer++;
            }

            // Answer query
            if (pointer == 0) {
                answers[origIdx] = -1;
            } else {
                answers[origIdx] = getMaxXOR(xi);
            }
        }

        return answers;
    }
}
```

## Optimal Complexity

```
Time: O((N + Q) × B + N log N + Q log Q) where B = 30
Space: O(N × B) for the Trie + O(Q) for storing queries
```

Sorting: O(N log N + Q log Q). Trie insertion: each of N elements inserted once, each costing O(30). Trie queries: each of Q queries traverses 30 levels. Total: O((N+Q) × 30 + N log N + Q log Q). In practice, the 30 factor makes this effectively O(N + Q) with a constant factor. Space: the Trie has at most N × 30 nodes.

## Optimal Hints

- Hint 1: The constraint ≤ mi suggests filtering. Sorting makes filtering efficient.
- Hint 2: If you sort queries by mi, the set of valid elements only grows.
- Hint 3: Sort nums too. Use a pointer to track which elements have been inserted into the Trie.
- Hint 4: For each query (sorted), advance the pointer and insert new elements, then do standard greedy XOR.
- Hint 5: Keep track of original query indices to place answers correctly.
- Hint 6: Handle the edge case where no element satisfies ≤ mi (pointer stays at 0 → return -1).

## Optimal Visualization

```html
<div style="font-family:system-ui,sans-serif;color:#e4e4e7;max-width:100%">
<style>
  .viz-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:14px}
  @media(max-width:700px){.viz-grid{grid-template-columns:1fr}}
  .viz-card{background:#0e0e12;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px}
  .viz-state{font-family:'JetBrains Mono',monospace;font-size:12px;padding:12px;background:#141418;border-radius:8px;line-height:1.8}
  .viz-state .changed{background:rgba(251,191,36,0.12);border-radius:3px;padding:1px 4px;color:#fbbf24}
  .viz-code{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:2}
  .viz-code .active{background:rgba(79,143,247,0.15);border-radius:3px;padding:1px 4px;color:#93c5fd}
  .viz-code .dim{color:#3f3f46}
  .ctrl-btn{background:#1a1a2e;color:#e4e4e7;border:1px solid #333;border-radius:8px;padding:6px 16px;cursor:pointer;font-size:13px}
  .ctrl-btn:hover{background:#252542}
  .ctrl-btn.active-tc{background:#4f8ff7;color:#fff;border-color:#4f8ff7}
  .log-entry{padding:3px 0;font-size:12px;font-family:'JetBrains Mono',monospace}
  .explanation-box{background:#141418;border-radius:8px;padding:12px;font-size:13px;line-height:1.6;margin-top:10px}
</style>

<div style="margin-bottom:10px">
  <strong style="color:#a78bfa;font-size:14px">Optimal — Offline Sorted Trie</strong>
  <div style="margin-top:8px" id="mqOptTc"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="mqOptPrev()">← Prev</button>
    <button class="ctrl-btn" onclick="mqOptNext()">Next →</button>
    <button class="ctrl-btn" id="mqOptPlayBtn" onclick="mqOptToggle()">▶ Play</button>
    <span id="mqOptCtr" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="mqOptViz" style="min-height:150px"></div>
    <div class="viz-state" id="mqOptState" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="mqOptLog"></div>
    <div class="viz-code" id="mqOptCode" style="margin-top:10px"></div>
    <div class="explanation-box" id="mqOptExpl"></div>
  </div>
</div>

<script>
const MQOPT_CODE=["sort nums; sort queries by mi","ptr = 0","for (xi, mi, idx) in sortedQueries:","  while nums[ptr] ≤ mi: insert(nums[ptr++])","  if trie empty: ans[idx] = -1","  else: ans[idx] = getMaxXOR(xi)"];
const MQOPT_TC=[
  {name:"Example 1",nums:[0,1,2,3,4],queries:[[3,1],[1,3],[5,6]]},
  {name:"Has -1",nums:[5,2,4,6,6,3],queries:[[12,4],[8,1],[6,3]]}
];

let mqOptI=0,mqOptS=0,mqOptSteps=[],mqOptPlay=null;
function mqOptBuild(tc){
  mqOptSteps=[];
  const sortedNums=[...tc.nums].sort((a,b)=>a-b);
  const sq=tc.queries.map((q,i)=>({xi:q[0],mi:q[1],idx:i})).sort((a,b)=>a.mi-b.mi);
  const ans=new Array(tc.queries.length).fill(0);
  let ptr=0;const inserted=[];

  mqOptSteps.push({phase:"setup",ptr:0,inserted:[],query:null,maxXOR:0,ans:[...ans],
    msg:`Sorted nums: [${sortedNums}]. Processing ${sq.length} queries by mi order.`,
    expl:`Nums sorted ascending: [${sortedNums}]. Queries sorted by limit: [${sq.map(q=>`[${q.xi},${q.mi}]`).join(', ')}]. Pointer starts at 0.`,
    color:"#71717a",codeLine:0});

  for(const q of sq){
    // Insert phase
    while(ptr<sortedNums.length&&sortedNums[ptr]<=q.mi){
      inserted.push(sortedNums[ptr]);
      mqOptSteps.push({phase:"insert",ptr:ptr+1,inserted:[...inserted],query:q,maxXOR:0,ans:[...ans],
        msg:`Insert ${sortedNums[ptr]} into Trie (${sortedNums[ptr]} ≤ ${q.mi})`,
        expl:`Element ${sortedNums[ptr]} ≤ limit ${q.mi}. Inserted into binary Trie. Trie now has ${inserted.length} elements: [${inserted.join(',')}].`,
        color:"#34d399",codeLine:3});
      ptr++;
    }

    // Query phase
    if(inserted.length===0){
      ans[q.idx]=-1;
      mqOptSteps.push({phase:"query",ptr,inserted:[...inserted],query:q,maxXOR:-1,ans:[...ans],
        msg:`Query [${q.xi},${q.mi}] → Trie empty → -1`,
        expl:`No elements ≤ ${q.mi} exist. Trie is empty. Answer for original query ${q.idx} = -1.`,
        color:"#f87171",codeLine:4});
    } else {
      // Simulate greedy XOR (simplified)
      let best=-1;
      for(const n of inserted){const x=q.xi^n;if(x>best)best=x;}
      ans[q.idx]=best;
      mqOptSteps.push({phase:"query",ptr,inserted:[...inserted],query:q,maxXOR:best,ans:[...ans],
        msg:`Query [${q.xi},${q.mi}] → greedy XOR → ${best} (ans[${q.idx}])`,
        expl:`Greedy Trie traversal for xi=${q.xi} with elements [${inserted.join(',')}]. Maximum XOR = ${best}. Placed at answer index ${q.idx}.`,
        color:"#4f8ff7",codeLine:5});
    }
  }
  mqOptSteps.push({phase:"done",ptr,inserted:[...inserted],query:null,maxXOR:0,ans:[...ans],
    msg:`Final answers: [${ans.join(', ')}]`,
    expl:`All queries processed. Answers in original order: [${ans.join(', ')}].`,
    color:"#a78bfa",codeLine:5});
}
function mqOptRender(){
  const s=mqOptSteps[mqOptS];if(!s)return;
  const tc=MQOPT_TC[mqOptI];
  let viz='<div style="margin-bottom:6px;font-size:11px;color:#71717a">Sorted nums (▼ = inserted into Trie):</div>';
  const sortedNums=[...tc.nums].sort((a,b)=>a-b);
  viz+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
  sortedNums.forEach((n,i)=>{
    const inTrie=i<s.ptr;
    viz+=`<div style="border:2px solid ${inTrie?'#34d399':'#333'};border-radius:6px;padding:4px 8px;font-family:monospace;font-size:13px;color:${inTrie?'#34d399':'#71717a'}">${inTrie?'▼ ':''}${n}</div>`;
  });
  viz+='</div>';
  if(s.query){
    viz+=`<div style="font-size:13px;margin-top:6px">Current query: xi=<span style="color:#4f8ff7;font-weight:bold">${s.query.xi}</span>, limit=<span style="color:#fbbf24;font-weight:bold">${s.query.mi}</span> (original idx=${s.query.idx})</div>`;
  }
  viz+=`<div style="font-size:12px;margin-top:6px;color:#71717a">Answers so far: [${s.ans.join(', ')}]</div>`;
  document.getElementById("mqOptViz").innerHTML=viz;
  document.getElementById("mqOptState").innerHTML=`<div>Pointer: <span class="changed">${s.ptr}</span></div><div>Trie elements: <span class="changed">${s.inserted.length}</span></div><div>Max XOR: <span class="changed">${s.maxXOR}</span></div>`;
  let ch='';MQOPT_CODE.forEach((l,i)=>{ch+=`<div class="${i===s.codeLine?'active':'dim'}">${l}</div>`;});
  document.getElementById("mqOptCode").innerHTML=ch;
  let lh='';for(let i=Math.max(0,mqOptS-10);i<=mqOptS;i++){lh+=`<div class="log-entry" style="color:${mqOptSteps[i].color}">${i===mqOptS?'▶ ':'  '}${mqOptSteps[i].msg}</div>`;}
  document.getElementById("mqOptLog").innerHTML=lh;
  document.getElementById("mqOptExpl").innerHTML=s.expl;
  document.getElementById("mqOptCtr").textContent=`Step ${mqOptS+1}/${mqOptSteps.length}`;
}
function mqOptLoad(i){mqOptI=i;mqOptS=0;mqOptBuild(MQOPT_TC[i]);document.querySelectorAll('.mqopttc').forEach((b,j)=>{b.className=j===i?'ctrl-btn active-tc mqopttc':'ctrl-btn mqopttc';});mqOptRender();}
function mqOptPrev(){if(mqOptS>0){mqOptS--;mqOptRender();}}
function mqOptNext(){if(mqOptS<mqOptSteps.length-1){mqOptS++;mqOptRender();}}
function mqOptToggle(){if(mqOptPlay){clearInterval(mqOptPlay);mqOptPlay=null;document.getElementById("mqOptPlayBtn").textContent="▶ Play";}else{mqOptPlay=setInterval(()=>{if(mqOptS<mqOptSteps.length-1)mqOptNext();else mqOptToggle();},1000);document.getElementById("mqOptPlayBtn").textContent="⏸ Pause";}}
let mqOptH='';MQOPT_TC.forEach((t,i)=>{mqOptH+=`<button class="ctrl-btn mqopttc" onclick="mqOptLoad(${i})">${t.name}</button> `;});
document.getElementById("mqOptTc").innerHTML=mqOptH;
mqOptLoad(0);
</script>
</div>
```
