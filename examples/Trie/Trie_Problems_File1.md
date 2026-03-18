# Trie Implementation and Advanced Operations

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/implement-trie-prefix-tree/
**GFG:** https://www.geeksforgeeks.org/problems/trie-insert-and-search/1

## Description

You are asked to implement a Trie (pronounced "try"), also called a prefix tree, that supports the following operations:

1. **insert(word)** — Inserts the string `word` into the trie.
2. **search(word)** — Returns `true` if the string `word` is in the trie (was inserted before), and `false` otherwise.
3. **startsWith(prefix)** — Returns `true` if there is any previously inserted string that starts with the given `prefix`.

**Advanced extension (countWordsEqualTo / countWordsStartingWith / erase):**
4. **countWordsEqualTo(word)** — Returns the count of exact occurrences of `word` in the trie.
5. **countWordsStartingWith(prefix)** — Returns the count of words that start with the given `prefix`.
6. **erase(word)** — Removes one occurrence of `word` from the trie.

**Input format:**
- A series of operations given as strings and method calls.
- Each word or prefix consists of lowercase English letters (`a`-`z`).

**Output format:**
- For `search`/`startsWith`: boolean `true` or `false`.
- For `countWordsEqualTo`/`countWordsStartingWith`: an integer count.

**Constraints:**
- 1 <= word.length, prefix.length <= 2000
- word and prefix consist only of lowercase English letters
- At most 3 × 10^4 calls in total to insert, search, startsWith, erase
- It is guaranteed that for every call to erase, the word exists in the trie

**Example 1 (Basic Trie):**
```
Input:
  insert("apple")
  search("apple")    → true
  search("app")      → false
  startsWith("app")  → true
  insert("app")
  search("app")      → true
```
Explanation: After inserting "apple", searching for "apple" returns true because the exact word exists. Searching "app" returns false because "app" was not inserted yet — only "apple" was. However, startsWith("app") returns true because "apple" starts with "app". After inserting "app", search("app") now returns true.

**Example 2 (Advanced with counts):**
```
Input:
  insert("apple")
  insert("apple")
  insert("apps")
  countWordsEqualTo("apple")        → 2
  countWordsStartingWith("app")     → 3
  erase("apple")
  countWordsEqualTo("apple")        → 1
  countWordsStartingWith("app")     → 2
```
Explanation: "apple" was inserted twice and "apps" once. countWordsEqualTo("apple") returns 2 (two copies). countWordsStartingWith("app") returns 3 because all three insertions have prefix "app". After erasing one "apple", counts drop accordingly.

**Edge cases:**
- Inserting the same word multiple times
- Searching for an empty prefix (should return true since all strings start with "")
- One word being a prefix of another ("app" vs "apple")
- Erasing all copies of a word, then searching for it

## In-depth Explanation

**Reframe the problem:** You need to build a tree-based data structure where each path from root to a node represents a prefix. Every node has up to 26 children (one per letter). Words sharing a common prefix share the same path in the tree.

**Pattern recognition:** This is a pure data structure implementation problem. The Trie is a foundational structure for string problems. The clue is any time you need efficient prefix-based lookups, autocomplete, or dictionary operations.

**Real-world analogy:** Think of a phone book organized as a tree. The root is the start. First branch: what letter does the name start with? Second branch: what's the second letter? And so on. To look up "Smith", you follow S → m → i → t → h. Anyone whose name starts with "Smi" shares the same path up to that point. A Trie is exactly this — a letter-by-letter branching structure.

**Why naive thinking fails:** A naive approach using a HashSet can handle insert/search/erase in O(L) time. But startsWith requires scanning all words in the set to check if any starts with the prefix — O(N × L) per query where N is the number of words. The Trie answers startsWith in O(L) where L is the prefix length.

**Approach overview:** This problem really has one canonical approach — the Trie node-based structure. The "brute force" is using a list/set, and the "optimal" is the actual Trie. The advanced version simply adds integer counters to each node.

**Key edge cases:** One word being a strict prefix of another (you need an `endOfWord` flag or count to distinguish). Inserting duplicates (need a count). Erasing when multiple copies exist (decrement, don't destroy).

**Interview cheat sheet — How to recognize this problem type:**
- Keywords: "prefix", "dictionary", "autocomplete", "insert and search strings"
- Distinguisher: If you need prefix-based queries, Trie beats HashMap.
- **Aha moment:** Each node represents one character; a path from root = a prefix; the `endCount` marker distinguishes complete words from mere prefixes.
- **Memory hook:** "Trie = tree where each edge is a letter, each path is a prefix."

## Brute Force Intuition

Use a simple ArrayList (or HashSet) to store all inserted words. For `search`, check if the word exists in the list. For `startsWith`, iterate through all words and check if any begins with the given prefix. For `countWordsEqualTo`, count occurrences. For `erase`, remove one occurrence. This is straightforward but prefix queries are slow because you scan every word.

## Brute Force Step-by-Step Solution

**Opening:** We store every inserted word in a list. Search is a membership check, startsWith scans the entire list.

**Walkthrough with Example 1:**

Step 1: insert("apple"). Add "apple" to list.
State: list = ["apple"]

Step 2: search("apple"). Scan list — found "apple" at index 0.
Return: true. State: list = ["apple"]

Step 3: search("app"). Scan list — "apple" ≠ "app". No match.
Return: false. State: list = ["apple"]

Step 4: startsWith("app"). Scan list — does "apple".startsWith("app")? Yes!
Return: true. State: list = ["apple"]

Step 5: insert("app"). Add "app" to list.
State: list = ["apple", "app"]

Step 6: search("app"). Scan list — "apple" ≠ "app", "app" == "app". Found!
Return: true. State: list = ["apple", "app"]

**Why this works:** We literally store everything and check by scanning. It's always correct but slow for prefix operations.

**Key invariant:** The list always contains every inserted word (including duplicates).

**Common mistakes:** Forgetting that erase should only remove ONE copy, not all copies. Using a HashSet which auto-deduplicates (use HashMap<String, Integer> for counts instead).

**30-second interviewer explanation:** "I store all words in a list. Insert appends, search scans for exact match, startsWith scans checking each word's prefix. It works but prefix queries take O(N×L)."

## Brute Force In-depth Intuition

We use a list because it's the simplest possible storage. The fundamental limitation is that the list has no structure — words aren't organized by their characters, so finding all words with a given prefix requires examining every word. This is essentially a linear scan approach. The HashSet variant improves search to O(L) amortized but doesn't help startsWith. The HashMap<String, Integer> variant handles counts efficiently but still needs O(N×L) for prefix queries. The insight that leads to the Trie is: "What if we organized words by their characters, sharing common prefixes in a tree structure?"

## Brute Force Algorithm

```
class BruteForceTrie:
    wordList = HashMap<String, Integer>()   // word → count

    function insert(word):
        wordList[word] = wordList.getOrDefault(word, 0) + 1

    function search(word):
        return wordList.containsKey(word)

    function startsWith(prefix):
        for each word in wordList.keys():
            if word.startsWith(prefix):
                return true
        return false

    function countWordsEqualTo(word):
        return wordList.getOrDefault(word, 0)

    function countWordsStartingWith(prefix):
        count = 0
        for each word in wordList.keys():
            if word.startsWith(prefix):
                count += wordList[word]
        return count

    function erase(word):
        if wordList[word] == 1:
            wordList.remove(word)
        else:
            wordList[word] -= 1
```

The HashMap stores each unique word mapped to its insertion count. Insert increments the count. Search checks for key existence. startsWith and countWordsStartingWith must iterate all keys — this is the bottleneck.

## Brute Force Code

```java
class Trie {
    private HashMap<String, Integer> wordMap;

    public Trie() {
        wordMap = new HashMap<>();
    }

    public void insert(String word) {
        wordMap.put(word, wordMap.getOrDefault(word, 0) + 1);
    }

    public boolean search(String word) {
        return wordMap.containsKey(word);
    }

    public boolean startsWith(String prefix) {
        for (String word : wordMap.keySet()) {
            if (word.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    public int countWordsEqualTo(String word) {
        return wordMap.getOrDefault(word, 0);
    }

    public int countWordsStartingWith(String prefix) {
        int count = 0;
        for (Map.Entry<String, Integer> entry : wordMap.entrySet()) {
            if (entry.getKey().startsWith(prefix)) {
                count += entry.getValue();
            }
        }
        return count;
    }

    public void erase(String word) {
        int count = wordMap.getOrDefault(word, 0);
        if (count == 1) {
            wordMap.remove(word);
        } else if (count > 1) {
            wordMap.put(word, count - 1);
        }
    }
}
```

## Brute Force Complexity

```
Time:
  insert: O(L) — HashMap hashing of string of length L
  search: O(L) — HashMap lookup
  startsWith: O(N × L) — scan all N words, each check is O(L)
  countWordsStartingWith: O(N × L) — same scan
  erase: O(L) — HashMap operations

Space: O(N × L) — storing all N words of average length L
```

insert and search are efficient because HashMap gives O(L) amortized lookup (L for hashing the string). But startsWith must iterate every stored word and call startsWith on each, giving O(N × L) where N is the number of unique words. For 3 × 10^4 operations this can be too slow.

## Brute Force Hints

- Hint 1: What if instead of checking every word for the prefix, you could "walk" the prefix character by character through some structure?
- Hint 2: Think about a tree where each level represents one character position in the word.
- Hint 3: If "apple" and "app" share the first 3 characters, they should share the same path for those 3 characters.
- Hint 4: Each node needs 26 children (one per lowercase letter) and some marker to indicate "a word ends here."
- Hint 5: Build a tree where insert follows/creates child nodes for each character, and search follows existing children.
- Hint 6: Edge case — don't confuse "a path exists" with "a word ends here." The node for 'p' in "apple" exists but "app" wasn't inserted.

## Brute Force Visualization

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
  <strong style="color:#a78bfa;font-size:14px">Brute Force — HashMap Storage</strong>
  <div style="margin-top:8px" id="tcBtns"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="prevStep()">← Prev</button>
    <button class="ctrl-btn" onclick="nextStep()">Next →</button>
    <button class="ctrl-btn" id="playBtn" onclick="togglePlay()">▶ Play</button>
    <span id="stepCounter" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="vizPanel" style="min-height:180px"></div>
    <div class="viz-state" id="statePanel" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="logPanel"></div>
    <div class="viz-code" id="codePanel" style="margin-top:10px"></div>
    <div class="explanation-box" id="explPanel"></div>
  </div>
</div>

<script>
const CODE_LINES = [
  "function insert(word):",
  "  map[word] = map.getOrDefault(word,0)+1",
  "function search(word):",
  "  return map.containsKey(word)",
  "function startsWith(prefix):",
  "  for word in map.keys():",
  "    if word.startsWith(prefix): return true",
  "  return false"
];

const TEST_CASES = [
  {
    name: "Basic",
    ops: [
      {op:"insert",arg:"apple"},
      {op:"search",arg:"apple",expect:true},
      {op:"search",arg:"app",expect:false},
      {op:"startsWith",arg:"app",expect:true},
      {op:"insert",arg:"app"},
      {op:"search",arg:"app",expect:true}
    ]
  },
  {
    name: "Duplicates",
    ops: [
      {op:"insert",arg:"hello"},
      {op:"insert",arg:"hello"},
      {op:"countWordsEqualTo",arg:"hello",expect:2},
      {op:"erase",arg:"hello"},
      {op:"countWordsEqualTo",arg:"hello",expect:1}
    ]
  },
  {
    name: "Edge: Prefix overlap",
    ops: [
      {op:"insert",arg:"ab"},
      {op:"insert",arg:"abc"},
      {op:"search",arg:"ab",expect:true},
      {op:"search",arg:"abc",expect:true},
      {op:"startsWith",arg:"a",expect:true},
      {op:"startsWith",arg:"abd",expect:false}
    ]
  }
];

let currentTC=0,currentStep=0,steps=[],playInterval=null;
function buildSteps(tc){
  steps=[];
  const map={};
  for(const o of tc.ops){
    if(o.op==="insert"){
      map[o.arg]=(map[o.arg]||0)+1;
      steps.push({type:"insert",msg:`insert("${o.arg}")`,map:{...map},codeLine:1,
        expl:`Adding "${o.arg}" to HashMap. Count becomes ${map[o.arg]}.`,color:"#34d399"});
    } else if(o.op==="search"){
      const found=o.arg in map;
      steps.push({type:"search",msg:`search("${o.arg}") → ${found}`,map:{...map},codeLine:3,
        expl:`Checking if "${o.arg}" exists as a key in HashMap → ${found}.`,color:found?"#34d399":"#f87171"});
    } else if(o.op==="startsWith"){
      const keys=Object.keys(map);
      let found=false;
      for(const k of keys){if(k.startsWith(o.arg)){found=true;break;}}
      steps.push({type:"startsWith",msg:`startsWith("${o.arg}") → ${found}`,map:{...map},codeLine:5,scanKeys:keys,prefix:o.arg,
        expl:`Scanning all ${keys.length} keys to find one starting with "${o.arg}" → ${found}. This is O(N×L)!`,color:found?"#34d399":"#f87171"});
    } else if(o.op==="countWordsEqualTo"){
      const c=map[o.arg]||0;
      steps.push({type:"count",msg:`countWordsEqualTo("${o.arg}") → ${c}`,map:{...map},codeLine:3,
        expl:`Looking up count for "${o.arg}" in HashMap → ${c}.`,color:"#4f8ff7"});
    } else if(o.op==="erase"){
      if(map[o.arg]===1)delete map[o.arg];else map[o.arg]--;
      steps.push({type:"erase",msg:`erase("${o.arg}")`,map:{...map},codeLine:1,
        expl:`Removing one copy of "${o.arg}". ${o.arg in map?"Count now "+map[o.arg]:"Removed entirely."}.`,color:"#fbbf24"});
    }
  }
}
function render(){
  const s=steps[currentStep]||{map:{},msg:"Ready",codeLine:-1,expl:"Press Next to begin.",color:"#71717a"};
  // Viz panel - show HashMap as boxes
  let html='<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end">';
  html+='<div style="font-size:11px;color:#71717a;width:100%;margin-bottom:4px">HashMap Contents:</div>';
  for(const[k,v]of Object.entries(s.map)){
    html+=`<div style="background:#1a1a2e;border:2px solid ${s.msg&&s.msg.includes(k)?s.color:'#333'};border-radius:8px;padding:10px 14px;text-align:center">
      <div style="font-size:14px;font-weight:bold;color:#e4e4e7">"${k}"</div>
      <div style="font-size:11px;color:#71717a;margin-top:4px">count: ${v}</div>
    </div>`;
  }
  if(Object.keys(s.map).length===0)html+='<div style="color:#3f3f46;font-style:italic">Empty</div>';
  html+='</div>';
  document.getElementById("vizPanel").innerHTML=html;
  // State panel
  document.getElementById("statePanel").innerHTML=`<div>Operation: <span class="changed">${s.msg}</span></div><div>Map size: ${Object.keys(s.map).length}</div>`;
  // Code panel
  let codeHtml='';
  CODE_LINES.forEach((l,i)=>{
    const cls=i===s.codeLine?'active':'dim';
    codeHtml+=`<div class="${cls}">${l}</div>`;
  });
  document.getElementById("codePanel").innerHTML=codeHtml;
  // Log panel
  let logHtml='';
  for(let i=0;i<=currentStep&&i<steps.length;i++){
    const st=steps[i];
    const marker=i===currentStep?'▶ ':'  ';
    logHtml+=`<div class="log-entry" style="color:${st.color}">${marker}${st.msg}</div>`;
  }
  document.getElementById("logPanel").innerHTML=logHtml;
  // Explanation
  document.getElementById("explPanel").innerHTML=s.expl;
  document.getElementById("stepCounter").textContent=`Step ${currentStep+1}/${steps.length}`;
}
function loadTC(idx){
  currentTC=idx;currentStep=0;
  buildSteps(TEST_CASES[idx]);
  document.querySelectorAll('.tc-btn').forEach((b,i)=>{b.className=i===idx?'ctrl-btn active-tc tc-btn':'ctrl-btn tc-btn'});
  render();
}
function prevStep(){if(currentStep>0){currentStep--;render()}}
function nextStep(){if(currentStep<steps.length-1){currentStep++;render()}}
function togglePlay(){
  if(playInterval){clearInterval(playInterval);playInterval=null;document.getElementById("playBtn").textContent="▶ Play";}
  else{playInterval=setInterval(()=>{if(currentStep<steps.length-1)nextStep();else togglePlay();},1000);document.getElementById("playBtn").textContent="⏸ Pause";}
}
// Init
let tcHtml='';
TEST_CASES.forEach((tc,i)=>{tcHtml+=`<button class="ctrl-btn tc-btn" onclick="loadTC(${i})">${tc.name}</button> `;});
document.getElementById("tcBtns").innerHTML=tcHtml;
loadTC(0);
</script>
</div>
```

## Optimal Intuition

Build an actual tree where each node has an array of 26 children (one per character `a-z`). To insert a word, start at the root and traverse/create child nodes for each character. At the last character's node, increment an `endCount`. To search, traverse matching children — if you reach the end and `endCount > 0`, the word exists. For `startsWith`, you just need to reach the end of the prefix (no `endCount` check needed). For counting, maintain both `endCount` (words ending here) and `prefixCount` (words passing through this node). Erase decrements both counters along the path.

## Optimal Step-by-Step Solution

**Opening:** We build a tree of nodes. Each node holds: an array `children[26]` (pointers to child nodes), `endCount` (how many complete words end here), and `prefixCount` (how many words pass through this node). All operations walk the tree character by character.

**Walkthrough with Example 2 (Advanced):**

Step 1: insert("apple"). Start at root. Walk a→p→p→l→e, creating nodes along the way. Increment `prefixCount` at each node we touch. At node for 'e' (end), increment `endCount`.
State:
```
root (pCnt=1) → a (pCnt=1) → p (pCnt=1) → p (pCnt=1) → l (pCnt=1) → e (pCnt=1, eCnt=1)
```

Step 2: insert("apple") again. Walk same path a→p→p→l→e. Increment `prefixCount` at every node. Increment `endCount` at 'e'.
State:
```
root (pCnt=2) → a (pCnt=2) → p (pCnt=2) → p (pCnt=2) → l (pCnt=2) → e (pCnt=2, eCnt=2)
```

Step 3: insert("apps"). Walk a→p→p (existing) → s (NEW node created). Increment `prefixCount` along the way. At 's', set `endCount=1`.
State:
```
root (pCnt=3) → a (pCnt=3) → p (pCnt=3) → p (pCnt=3) → l (pCnt=2) → e (pCnt=2, eCnt=2)
                                                         → s (pCnt=1, eCnt=1)
```

Step 4: countWordsEqualTo("apple"). Walk a→p→p→l→e. Return `endCount` at 'e' = 2.

Step 5: countWordsStartingWith("app"). Walk a→p→p. Return `prefixCount` at second 'p' = 3.

Step 6: erase("apple"). Walk a→p→p→l→e. Decrement `prefixCount` at each node. Decrement `endCount` at 'e'.
State:
```
root (pCnt=2) → a (pCnt=2) → p (pCnt=2) → p (pCnt=2) → l (pCnt=1) → e (pCnt=1, eCnt=1)
                                                         → s (pCnt=1, eCnt=1)
```

Step 7: countWordsEqualTo("apple") → 1. countWordsStartingWith("app") → 2.

**Correctness:** Every insertion increments counters on the exact path. `prefixCount` at any node tells how many inserted words pass through that prefix. `endCount` tells how many words terminate there. Erase reverses exactly one insertion by decrementing.

**Key invariant:** `prefixCount` at any node = sum of `endCount` in its entire subtree.

**Common mistakes:**
- Forgetting to increment `prefixCount` at every node on the path (not just the end).
- Using `endCount > 0` as the check for `startsWith` (wrong — use node existence or `prefixCount > 0`).
- Not creating new nodes during insert (null pointer when you try to traverse).

**30-second explanation:** "I build a 26-ary tree where each edge is a letter. Insert walks/creates nodes per character. I keep two counters per node: prefixCount for words passing through, endCount for words ending here. All operations are O(L) where L is word length."

## Optimal In-depth Intuition

The Trie exploits the fact that English words share prefixes. Instead of storing "apple", "app", "application" as three separate strings (duplicating "app" three times), the Trie stores the shared prefix once. Each node in the Trie represents one character position. The 26-child array gives O(1) lookup per character (direct indexing via `ch - 'a'`).

Why this data structure over alternatives? A HashMap gives O(L) for search but O(N×L) for prefix queries. A sorted array with binary search gives O(L × log N) for search and can do prefix queries via lower/upper bound, but insert/delete are O(N). The Trie gives O(L) for ALL operations — it's the purpose-built structure for prefix operations.

The two-counter approach (prefixCount + endCount) is elegant because it answers both "does this exact word exist?" and "how many words start with this prefix?" without any additional scanning. Each counter is maintained locally at each node during insert/erase.

Connection to other problems: Tries are the backbone of autocomplete systems, spell checkers, IP routing (longest prefix match), and XOR-based problems (using binary Tries). Understanding this implementation is prerequisite for all advanced Trie problems.

## Optimal Algorithm

```
class TrieNode:
    children = array of 26 nulls    // one slot per letter a-z
    endCount = 0                     // words ending at this node
    prefixCount = 0                  // words passing through this node

class Trie:
    root = new TrieNode()

    function insert(word):
        node = root
        for each character ch in word:
            index = ch - 'a'
            if node.children[index] is null:
                node.children[index] = new TrieNode()
            node = node.children[index]
            node.prefixCount += 1       // this node is on the path
        node.endCount += 1              // word ends here

    function search(word):
        node = root
        for each character ch in word:
            index = ch - 'a'
            if node.children[index] is null:
                return false            // path doesn't exist
            node = node.children[index]
        return node.endCount > 0        // path exists, but is it a complete word?

    function startsWith(prefix):
        node = root
        for each character ch in prefix:
            index = ch - 'a'
            if node.children[index] is null:
                return false
            node = node.children[index]
        return true                     // prefix path exists

    function countWordsEqualTo(word):
        node = traverse(word)
        return node == null ? 0 : node.endCount

    function countWordsStartingWith(prefix):
        node = traverse(prefix)
        return node == null ? 0 : node.prefixCount

    function erase(word):
        node = root
        for each character ch in word:
            index = ch - 'a'
            node = node.children[index]
            node.prefixCount -= 1
        node.endCount -= 1
```

Insert creates nodes as needed and increments counters. Search follows existing nodes and checks endCount. startsWith just checks if the path exists. Erase assumes the word exists and decrements counters.

## Optimal Code

```java
class Trie {
    private int[][] children;
    private int[] endCount;
    private int[] prefixCount;
    private int nodeCount;

    public Trie() {
        // Pre-allocate for efficiency (adjust size as needed)
        int maxNodes = 60001; // 3*10^4 ops * 2000 chars worst case, but typically much less
        children = new int[maxNodes][26];
        endCount = new int[maxNodes];
        prefixCount = new int[maxNodes];
        nodeCount = 0;
        // Initialize root node (node 0)
        for (int i = 0; i < 26; i++) {
            children[0][i] = -1;
        }
        nodeCount = 1;
    }

    private int createNode() {
        int id = nodeCount++;
        for (int i = 0; i < 26; i++) {
            children[id][i] = -1;
        }
        endCount[id] = 0;
        prefixCount[id] = 0;
        return id;
    }

    public void insert(String word) {
        int node = 0;
        for (int i = 0; i < word.length(); i++) {
            int idx = word.charAt(i) - 'a';
            if (children[node][idx] == -1) {
                children[node][idx] = createNode();
            }
            node = children[node][idx];
            prefixCount[node]++;
        }
        endCount[node]++;
    }

    public boolean search(String word) {
        int node = 0;
        for (int i = 0; i < word.length(); i++) {
            int idx = word.charAt(i) - 'a';
            if (children[node][idx] == -1) {
                return false;
            }
            node = children[node][idx];
        }
        return endCount[node] > 0;
    }

    public boolean startsWith(String prefix) {
        int node = 0;
        for (int i = 0; i < prefix.length(); i++) {
            int idx = prefix.charAt(i) - 'a';
            if (children[node][idx] == -1) {
                return false;
            }
            node = children[node][idx];
        }
        return true;
    }

    public int countWordsEqualTo(String word) {
        int node = 0;
        for (int i = 0; i < word.length(); i++) {
            int idx = word.charAt(i) - 'a';
            if (children[node][idx] == -1) {
                return 0;
            }
            node = children[node][idx];
        }
        return endCount[node];
    }

    public int countWordsStartingWith(String prefix) {
        int node = 0;
        for (int i = 0; i < prefix.length(); i++) {
            int idx = prefix.charAt(i) - 'a';
            if (children[node][idx] == -1) {
                return 0;
            }
            node = children[node][idx];
        }
        return prefixCount[node];
    }

    public void erase(String word) {
        int node = 0;
        for (int i = 0; i < word.length(); i++) {
            int idx = word.charAt(i) - 'a';
            node = children[node][idx];
            prefixCount[node]--;
        }
        endCount[node]--;
    }
}
```

## Optimal Complexity

```
Time: O(L) per operation, where L = length of word/prefix
Space: O(N × L × 26) in the worst case, where N is number of insertions
```

Time: Each operation traverses the word character by character, doing O(1) work per character (array index lookup). So every operation is O(L). This is optimal — you can't do better than reading the entire word/prefix.

Space: In the worst case, if all words are completely different (no shared prefixes), each character creates a new node with 26 slots. With N words of average length L, that's O(N × L) nodes, each taking O(26) space. In practice, shared prefixes dramatically reduce this.

## Optimal Hints

- Hint 1: What if each character in a word mapped to a level in a tree?
- Hint 2: Use a tree where each node has up to 26 children, one per letter.
- Hint 3: To distinguish "app" (a word) from "app" (prefix of "apple"), mark nodes where words end.
- Hint 4: For counting operations, keep two counters: one for "words passing through" and one for "words ending here."
- Hint 5: Insert walks the tree creating nodes as needed, incrementing both counters. Search walks and checks endCount. Erase walks and decrements.
- Hint 6: Edge case — erase must only decrement, never delete nodes, because other words might share the path.

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
  <strong style="color:#a78bfa;font-size:14px">Optimal — Trie Tree with Counters</strong>
  <div style="margin-top:8px" id="tcBtns2"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="prevStep2()">← Prev</button>
    <button class="ctrl-btn" onclick="nextStep2()">Next →</button>
    <button class="ctrl-btn" id="playBtn2" onclick="togglePlay2()">▶ Play</button>
    <span id="stepCounter2" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="vizPanel2" style="min-height:250px;overflow:auto"></div>
    <div class="viz-state" id="statePanel2" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="logPanel2"></div>
    <div class="viz-code" id="codePanel2" style="margin-top:10px"></div>
    <div class="explanation-box" id="explPanel2"></div>
  </div>
</div>

<script>
const CODE2 = [
  "function insert(word):",
  "  node = root",
  "  for ch in word:",
  "    if children[ch] is null: create node",
  "    node = children[ch]",
  "    node.prefixCount++",
  "  node.endCount++",
  "",
  "function search(word):",
  "  traverse to end node",
  "  return endCount > 0"
];

const TC2 = [
  {
    name:"Basic Insert/Search",
    ops:[
      {op:"insert",arg:"apple"},
      {op:"search",arg:"apple",expect:true},
      {op:"search",arg:"app",expect:false},
      {op:"startsWith",arg:"app",expect:true},
      {op:"insert",arg:"app"},
      {op:"search",arg:"app",expect:true}
    ]
  },
  {
    name:"Counting & Erase",
    ops:[
      {op:"insert",arg:"apple"},
      {op:"insert",arg:"apple"},
      {op:"insert",arg:"apps"},
      {op:"countWordsEqualTo",arg:"apple",expect:2},
      {op:"countWordsStartingWith",arg:"app",expect:3},
      {op:"erase",arg:"apple"},
      {op:"countWordsEqualTo",arg:"apple",expect:1}
    ]
  },
  {
    name:"Edge: Single char",
    ops:[
      {op:"insert",arg:"a"},
      {op:"insert",arg:"ab"},
      {op:"search",arg:"a",expect:true},
      {op:"startsWith",arg:"a",expect:true},
      {op:"search",arg:"ab",expect:true},
      {op:"erase",arg:"a"},
      {op:"search",arg:"a",expect:false},
      {op:"startsWith",arg:"a",expect:true}
    ]
  }
];

// Trie simulation
class SimTrie {
  constructor(){this.nodes=[{ch:'root',children:{},ec:0,pc:0}];}
  getOrCreate(parentIdx,ch){
    if(!this.nodes[parentIdx].children[ch]){
      const id=this.nodes.length;
      this.nodes.push({ch,children:{},ec:0,pc:0});
      this.nodes[parentIdx].children[ch]=id;
    }
    return this.nodes[parentIdx].children[ch];
  }
  clone(){
    return JSON.parse(JSON.stringify(this.nodes));
  }
}

let currentTC2=0,currentStep2=0,steps2=[],playInterval2=null;
function buildSteps2(tc){
  steps2=[];
  const trie=new SimTrie();
  for(const o of tc.ops){
    if(o.op==="insert"){
      let node=0;const path=[0];
      for(const ch of o.arg){
        node=trie.getOrCreate(node,ch);
        trie.nodes[node].pc++;
        path.push(node);
      }
      trie.nodes[node].ec++;
      steps2.push({type:"insert",msg:`insert("${o.arg}")`,trie:trie.clone(),highlight:path,codeLine:6,
        expl:`Inserted "${o.arg}": walked/created path ${o.arg.split('').join('→')}. Incremented prefixCount on each node, endCount on last node.`,color:"#34d399"});
    } else if(o.op==="search"){
      let node=0;const path=[0];let found=true;
      for(const ch of o.arg){
        const cid=trie.nodes[node].children[ch];
        if(cid===undefined){found=false;break;}
        node=cid;path.push(node);
      }
      if(found)found=trie.nodes[node].ec>0;
      steps2.push({type:"search",msg:`search("${o.arg}") → ${found}`,trie:trie.clone(),highlight:path,codeLine:10,
        expl:`Searched "${o.arg}": traversed path. ${found?'endCount > 0 → word exists!':'Either path broke or endCount = 0 → not found.'}`,color:found?"#34d399":"#f87171"});
    } else if(o.op==="startsWith"){
      let node=0;const path=[0];let found=true;
      for(const ch of o.arg){
        const cid=trie.nodes[node].children[ch];
        if(cid===undefined){found=false;break;}
        node=cid;path.push(node);
      }
      steps2.push({type:"startsWith",msg:`startsWith("${o.arg}") → ${found}`,trie:trie.clone(),highlight:path,codeLine:10,
        expl:`Prefix check "${o.arg}": ${found?'path exists → some word has this prefix.':'path broke → no word has this prefix.'}`,color:found?"#34d399":"#f87171"});
    } else if(o.op==="countWordsEqualTo"){
      let node=0;const path=[0];let ok=true;
      for(const ch of o.arg){const cid=trie.nodes[node].children[ch];if(cid===undefined){ok=false;break;}node=cid;path.push(node);}
      const c=ok?trie.nodes[node].ec:0;
      steps2.push({type:"count",msg:`countWordsEqualTo("${o.arg}") → ${c}`,trie:trie.clone(),highlight:path,codeLine:10,
        expl:`Traversed to end of "${o.arg}". endCount = ${c}.`,color:"#4f8ff7"});
    } else if(o.op==="countWordsStartingWith"){
      let node=0;const path=[0];let ok=true;
      for(const ch of o.arg){const cid=trie.nodes[node].children[ch];if(cid===undefined){ok=false;break;}node=cid;path.push(node);}
      const c=ok?trie.nodes[node].pc:0;
      steps2.push({type:"count",msg:`countWordsStartingWith("${o.arg}") → ${c}`,trie:trie.clone(),highlight:path,codeLine:10,
        expl:`Traversed to end of "${o.arg}". prefixCount = ${c}. This means ${c} inserted words pass through this prefix.`,color:"#4f8ff7"});
    } else if(o.op==="erase"){
      let node=0;const path=[0];
      for(const ch of o.arg){node=trie.nodes[node].children[ch];trie.nodes[node].pc--;path.push(node);}
      trie.nodes[node].ec--;
      steps2.push({type:"erase",msg:`erase("${o.arg}")`,trie:trie.clone(),highlight:path,codeLine:6,
        expl:`Erased one copy of "${o.arg}": decremented prefixCount on each node and endCount on last.`,color:"#fbbf24"});
    }
  }
}
function renderTree(nodes,highlight){
  // Simple text-based tree rendering
  let html='<div style="font-family:JetBrains Mono,monospace;font-size:12px;line-height:2">';
  function dfs(idx,depth,prefix){
    const n=nodes[idx];
    const hl=highlight&&highlight.includes(idx);
    const color=hl?'#4f8ff7':'#71717a';
    const label=idx===0?'ROOT':n.ch;
    const info=idx===0?'':`  <span style="color:#71717a;font-size:10px">pc=${n.pc} ec=${n.ec}</span>`;
    const bg=hl?'rgba(79,143,247,0.1)':'transparent';
    html+=`<div style="margin-left:${depth*24}px;color:${color};background:${bg};border-radius:4px;padding:1px 6px;display:inline-block">${prefix}${label}${info}</div><br>`;
    const chs=Object.keys(n.children).sort();
    for(let i=0;i<chs.length;i++){
      const ch=chs[i];
      const last=i===chs.length-1;
      dfs(n.children[ch],depth+1,last?'└─ ':'├─ ');
    }
  }
  dfs(0,0,'');
  html+='</div>';
  return html;
}
function render2(){
  const s=steps2[currentStep2]||{trie:[{ch:'root',children:{},ec:0,pc:0}],highlight:[],msg:"Ready",codeLine:-1,expl:"Press Next to begin.",color:"#71717a"};
  document.getElementById("vizPanel2").innerHTML=renderTree(s.trie,s.highlight);
  document.getElementById("statePanel2").innerHTML=`<div>Operation: <span class="changed">${s.msg}</span></div><div>Total nodes: ${s.trie.length}</div>`;
  let codeHtml='';
  CODE2.forEach((l,i)=>{codeHtml+=`<div class="${i===s.codeLine?'active':'dim'}">${l}</div>`;});
  document.getElementById("codePanel2").innerHTML=codeHtml;
  let logHtml='';
  for(let i=0;i<=currentStep2&&i<steps2.length;i++){
    logHtml+=`<div class="log-entry" style="color:${steps2[i].color}">${i===currentStep2?'▶ ':'  '}${steps2[i].msg}</div>`;
  }
  document.getElementById("logPanel2").innerHTML=logHtml;
  document.getElementById("explPanel2").innerHTML=s.expl;
  document.getElementById("stepCounter2").textContent=`Step ${currentStep2+1}/${steps2.length}`;
}
function loadTC2(idx){
  currentTC2=idx;currentStep2=0;buildSteps2(TC2[idx]);
  document.querySelectorAll('.tc-btn2').forEach((b,i)=>{b.className=i===idx?'ctrl-btn active-tc tc-btn2':'ctrl-btn tc-btn2';});
  render2();
}
function prevStep2(){if(currentStep2>0){currentStep2--;render2();}}
function nextStep2(){if(currentStep2<steps2.length-1){currentStep2++;render2();}}
function togglePlay2(){
  if(playInterval2){clearInterval(playInterval2);playInterval2=null;document.getElementById("playBtn2").textContent="▶ Play";}
  else{playInterval2=setInterval(()=>{if(currentStep2<steps2.length-1)nextStep2();else togglePlay2();},1100);document.getElementById("playBtn2").textContent="⏸ Pause";}
}
let tcHtml2='';
TC2.forEach((tc,i)=>{tcHtml2+=`<button class="ctrl-btn tc-btn2" onclick="loadTC2(${i})">${tc.name}</button> `;});
document.getElementById("tcBtns2").innerHTML=tcHtml2;
loadTC2(0);
</script>
</div>
```

---

# Longest Word with All Prefixes

**Difficulty:** Medium
**LeetCode/Coding Ninjas:** https://www.naukri.com/code360/problems/complete-string_2687860
**GFG:** https://www.geeksforgeeks.org/problems/longest-string-with-all-prefixes/1

## Description

Given an array of N strings, find the longest string `s` such that **every prefix of `s`** is also present in the array. A string is called a "complete string" if all its prefixes exist in the array. If multiple complete strings have the same maximum length, return the lexicographically smallest one. If no complete string exists, return "None".

**Input format:**
- An integer N (number of strings)
- An array of N strings, each consisting of lowercase English letters

**Output format:**
- A single string — the longest complete string, or "None"

**Constraints:**
- 1 <= N <= 10^5
- 1 <= length of each string <= 10^5
- Total characters across all strings <= 10^5

**Example 1:**
```
Input: N=6, A=["n", "ni", "nin", "ninj", "ninja", "ninjak"]
Output: "ninjak"
```
Explanation: Consider "ninjak" — its prefixes are "n", "ni", "nin", "ninj", "ninja". ALL of these exist in the array. "ninjak" is the longest such string. Every prefix of it is present.

**Example 2:**
```
Input: N=2, A=["ab", "bc"]
Output: "None"
```
Explanation: "ab" has prefix "a" which is NOT in the array. "bc" has prefix "b" which is NOT in the array. Neither string has all its prefixes present, so return "None".

**Example 3:**
```
Input: N=4, A=["a", "ab", "abc", "b"]
Output: "abc"
```
Explanation: "abc" has prefixes "a", "ab" — both present. "b" has no non-trivial prefix to check (single char is trivially complete). Between "abc" (length 3) and "b" (length 1), "abc" is longer.

**Edge cases:**
- All single-character strings (each is trivially complete, return lexicographically smallest)
- No complete string exists at all
- Multiple strings of same max length — pick lexicographically smallest

## In-depth Explanation

**Reframe the problem:** For each string in the array, check if every one of its prefixes also exists in the array. Among all strings that pass this check, return the longest (tie-break: lexicographically smallest).

**Pattern recognition:** This is a Trie problem. The key insight is: if you insert all strings into a Trie, then a string is "complete" if and only if every node on its path from root to its end node has `endCount > 0` (i.e., some word in the array ends at every intermediate node). The clue is the phrase "all prefixes exist" — Tries naturally represent prefixes as paths.

**Real-world analogy:** Imagine building a ladder. Each rung is a prefix. You can only climb to a rung if the rung below it is solid (exists in the dictionary). "ninjak" has a solid ladder: n→ni→nin→ninj→ninja→ninjak. But "ab" is missing the "a" rung, so you can't even start climbing.

**Why naive thinking fails:** Brute force checks each string, generates all its prefixes, and checks each prefix in a HashSet. This works but generating and checking all prefixes takes O(L²) per string. Trie reduces it to O(L) per string.

**Approach overview:** Brute force: HashSet + prefix generation (O(N×L²)). Optimal: Trie-based — insert all words, then for each word walk the Trie and check if every intermediate node is a word-end.

**Key edge cases:** A single character is always complete (no proper prefix to check other than itself). If no word of length 1 exists, then NO longer word can be complete (because its first-character prefix would be missing).

**Interview cheat sheet:**
- Keywords: "all prefixes present", "complete string", "longest with valid prefix chain"
- Distinguisher: Not just "does a prefix exist?" but "do ALL prefixes exist?"
- **Aha moment:** In a Trie, checking if all prefixes exist = checking if every node on the word's path has endCount > 0.
- **Memory hook:** "Complete string = complete chain of endMarks in Trie path."

## Brute Force Intuition

Store all words in a HashSet. For each word, generate all its prefixes (substrings from index 0 to 1, 0 to 2, ..., 0 to len-1). If every prefix is found in the HashSet, the word is "complete." Track the longest complete word (tie-break lexicographically).

## Brute Force Step-by-Step Solution

**Opening:** We put all words in a HashSet for O(1) lookup. Then for each word, we check every prefix.

**Walkthrough with Example 1: A = ["n", "ni", "nin", "ninj", "ninja", "ninjak"]**

Step 1: Build HashSet = {"n", "ni", "nin", "ninj", "ninja", "ninjak"}.

Step 2: Check "n". Prefixes of "n" (excluding itself): none (length 1 has no proper prefix). A single character is trivially complete.
Result: "n" is complete. Best = "n" (length 1).

Step 3: Check "ni". Prefixes: "n" → found in set.
Result: "ni" is complete. Best = "ni" (length 2).

Step 4: Check "nin". Prefixes: "n" ✓, "ni" ✓.
Result: "nin" is complete. Best = "nin" (length 3).

Step 5: Check "ninj". Prefixes: "n" ✓, "ni" ✓, "nin" ✓.
Result: complete. Best = "ninj" (length 4).

Step 6: Check "ninja". Prefixes: "n" ✓, "ni" ✓, "nin" ✓, "ninj" ✓.
Result: complete. Best = "ninja" (length 5).

Step 7: Check "ninjak". Prefixes: "n" ✓, "ni" ✓, "nin" ✓, "ninj" ✓, "ninja" ✓.
Result: complete. Best = "ninjak" (length 6).

Answer: "ninjak".

**Correctness:** We exhaustively check every word and every prefix. The longest complete word is guaranteed to be found.

**Key invariant:** The HashSet contains all original words, so prefix lookups are O(L) per lookup (string hashing).

**Common mistakes:** Not considering the word itself as needing to be in the array (it always is, since we're iterating array elements). Forgetting lexicographic tie-breaking.

**30-second explanation:** "I put all words in a HashSet, then for each word I generate every prefix and check if it exists in the set. If all prefixes exist, the word is complete. I track the longest."

## Brute Force In-depth Intuition

The brute force exploits the definition directly. For a word of length L, there are L-1 proper prefixes to check. Each prefix is a substring creation (O(L)) and a HashSet lookup (O(L) for hashing). So per word it's O(L²). Across N words of max length L, total is O(N × L²). With the constraint that total characters ≤ 10^5, this is actually manageable in many cases, but it's suboptimal.

Why does the Trie improve this? Because the Trie doesn't need to regenerate each prefix string — it walks the path character by character, and at each node it simply checks the `endCount` flag. This avoids the O(L) cost of creating each prefix substring.

## Brute Force Algorithm

```
function longestCompleteString(words):
    wordSet = HashSet(words)
    best = "None"

    for each word in words:
        isComplete = true
        for length = 1 to word.length - 1:
            prefix = word.substring(0, length)
            if prefix not in wordSet:
                isComplete = false
                break

        if isComplete:
            if word.length > best.length:
                best = word
            else if word.length == best.length and word < best:
                best = word      // lexicographic tie-break

    return best
```

We iterate all words, generate each prefix by taking substrings, and check membership in the set. Track the best (longest, then lexicographically smallest).

## Brute Force Code

```java
class Solution {
    public String completeString(int n, String[] words) {
        HashSet<String> wordSet = new HashSet<>();
        for (String word : words) {
            wordSet.add(word);
        }

        String best = "";
        for (String word : words) {
            boolean isComplete = true;
            for (int len = 1; len < word.length(); len++) {
                String prefix = word.substring(0, len);
                if (!wordSet.contains(prefix)) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                if (word.length() > best.length()) {
                    best = word;
                } else if (word.length() == best.length()
                           && word.compareTo(best) < 0) {
                    best = word;
                }
            }
        }
        return best.isEmpty() ? "None" : best;
    }
}
```

## Brute Force Complexity

```
Time: O(N × L²) where L is max word length
Space: O(N × L) for the HashSet
```

For each of N words, we generate up to L-1 prefixes, each costing O(L) for substring creation and hashing. Total: O(N × L²). Space is O(N × L) for storing all words in the HashSet. Given the constraint that total characters ≤ 10^5, the actual time is bounded by O(sum_of_lengths²) which could be up to 10^10 in the worst case — too slow.

## Brute Force Hints

- Hint 1: What data structure lets you check if a prefix exists without regenerating the full prefix string each time?
- Hint 2: A Trie naturally represents all prefixes as paths from the root.
- Hint 3: If you insert all words into a Trie, you can walk any word's path and check each intermediate node.
- Hint 4: The check at each node is: "Does some word end here?" (i.e., is `endCount > 0`?)
- Hint 5: A word is complete if and only if every node on its Trie path (from root to its end) has `endCount > 0`.
- Hint 6: Don't forget: if no single-character word exists, then no longer word can be complete.

## Brute Force Visualization

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
  <strong style="color:#a78bfa;font-size:14px">Brute Force — HashSet Prefix Check</strong>
  <div style="margin-top:8px" id="tcBtnsB"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="bfPrev()">← Prev</button>
    <button class="ctrl-btn" onclick="bfNext()">Next →</button>
    <button class="ctrl-btn" id="bfPlayBtn" onclick="bfToggle()">▶ Play</button>
    <span id="bfStepCtr" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="bfViz" style="min-height:150px"></div>
    <div class="viz-state" id="bfState" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="bfLog"></div>
    <div class="viz-code" id="bfCode" style="margin-top:10px"></div>
    <div class="explanation-box" id="bfExpl"></div>
  </div>
</div>

<script>
const BF_CODE=["wordSet = HashSet(words)","for word in words:","  for len=1 to word.length-1:","    prefix = word[0..len]","    if prefix not in set: break","  if allFound: update best","return best"];
const BF_TC=[
  {name:"Basic",words:["n","ni","nin","ninj","ninja","ninjak"]},
  {name:"No complete",words:["ab","bc"]},
  {name:"Tie-break",words:["a","ab","abc","b","bc","bcd"]}
];
let bfI=0,bfS=0,bfSteps=[],bfPlay=null;
function bfBuild(tc){
  bfSteps=[];const set=new Set(tc.words);let best="";
  for(const w of tc.words){
    let ok=true,lastPfx="";
    for(let l=1;l<w.length;l++){
      const p=w.substring(0,l);
      const found=set.has(p);
      bfSteps.push({word:w,prefix:p,found,set:[...set],best,codeLine:found?4:4,
        msg:`Check prefix "${p}" of "${w}" → ${found?"✓ found":"✗ missing"}`,
        expl:`Checking if "${p}" exists in the HashSet for word "${w}". ${found?"Found! Continue checking next prefix.":"NOT found! Word is NOT complete."}`,
        color:found?"#34d399":"#f87171"});
      if(!found){ok=false;break;}
      lastPfx=p;
    }
    if(ok){
      if(w.length>best.length||(w.length===best.length&&w<best))best=w;
      bfSteps.push({word:w,prefix:w,found:true,set:[...set],best,codeLine:5,
        msg:`"${w}" is COMPLETE! Best = "${best}"`,
        expl:`All prefixes of "${w}" exist. Length ${w.length}. ${w===best?'New best!':'Not longer than current best "'+best+'".'}`,
        color:"#34d399"});
    }
  }
  bfSteps.push({word:"",prefix:"",found:true,set:[...set],best,codeLine:6,
    msg:`Answer: "${best||'None'}"`,expl:`Final answer: "${best||'None'}".`,color:"#a78bfa"});
}
function bfRender(){
  const s=bfSteps[bfS]||{word:"",prefix:"",set:[],best:"",codeLine:-1,msg:"Ready",expl:"Press Next.",color:"#71717a"};
  let viz='<div style="display:flex;flex-wrap:wrap;gap:6px">';
  for(const w of(bfSteps[0]?BF_TC[bfI].words:[])){
    const isCur=w===s.word;const clr=isCur?"#4f8ff7":"#3f3f46";
    viz+=`<div style="border:2px solid ${clr};border-radius:6px;padding:6px 10px;font-size:13px;font-family:monospace;color:${isCur?'#e4e4e7':'#71717a'}">${w}</div>`;
  }
  viz+='</div>';
  if(s.prefix&&s.word){viz+=`<div style="margin-top:10px;font-size:13px">Checking prefix: <span style="color:#fbbf24;font-weight:bold">"${s.prefix}"</span> of <span style="color:#4f8ff7">"${s.word}"</span></div>`;}
  document.getElementById("bfViz").innerHTML=viz;
  document.getElementById("bfState").innerHTML=`<div>Current word: <span class="changed">${s.word||"-"}</span></div><div>Best so far: <span class="changed">${s.best||"None"}</span></div>`;
  let ch='';BF_CODE.forEach((l,i)=>{ch+=`<div class="${i===s.codeLine?'active':'dim'}">${l}</div>`;});
  document.getElementById("bfCode").innerHTML=ch;
  let lh='';for(let i=0;i<=bfS&&i<bfSteps.length;i++){lh+=`<div class="log-entry" style="color:${bfSteps[i].color}">${i===bfS?'▶ ':'  '}${bfSteps[i].msg}</div>`;}
  document.getElementById("bfLog").innerHTML=lh;
  document.getElementById("bfExpl").innerHTML=s.expl;
  document.getElementById("bfStepCtr").textContent=`Step ${bfS+1}/${bfSteps.length}`;
}
function bfLoad(i){bfI=i;bfS=0;bfBuild(BF_TC[i]);document.querySelectorAll('.bftc').forEach((b,j)=>{b.className=j===i?'ctrl-btn active-tc bftc':'ctrl-btn bftc';});bfRender();}
function bfPrev(){if(bfS>0){bfS--;bfRender();}}
function bfNext(){if(bfS<bfSteps.length-1){bfS++;bfRender();}}
function bfToggle(){if(bfPlay){clearInterval(bfPlay);bfPlay=null;document.getElementById("bfPlayBtn").textContent="▶ Play";}else{bfPlay=setInterval(()=>{if(bfS<bfSteps.length-1)bfNext();else bfToggle();},900);document.getElementById("bfPlayBtn").textContent="⏸ Pause";}}
let bfTcH='';BF_TC.forEach((t,i)=>{bfTcH+=`<button class="ctrl-btn bftc" onclick="bfLoad(${i})">${t.name}</button> `;});
document.getElementById("tcBtnsB").innerHTML=bfTcH;
bfLoad(0);
</script>
</div>
```

## Optimal Intuition

Insert all words into a Trie. Then for each word, traverse its path in the Trie. At every node along the path, check if `endCount > 0` (meaning some word ends there, i.e., that prefix exists as a word). If every node passes, the word is "complete." Track the longest complete word. The Trie walk is O(L) per word — no substring creation needed.

## Optimal Step-by-Step Solution

**Opening:** We build a Trie from all words, then walk each word's path checking for endCount markers at every node.

**Walkthrough with Example 1: A = ["n", "ni", "nin", "ninj", "ninja", "ninjak"]**

Step 1: Insert all 6 words into Trie.
```
root → n(ec=1) → i(ec=1) → n(ec=1) → j(ec=1) → a(ec=1) → k(ec=1)
```
Every node has ec=1 because each prefix is itself a word in the array.

Step 2: Check "n". Path: root → n. Node n has ec=1 ✓. Complete! Best = "n".

Step 3: Check "ni". Path: root → n (ec=1 ✓) → i (ec=1 ✓). Complete! Best = "ni".

Step 4: Check "nin". Path: root → n ✓ → i ✓ → n ✓. Complete! Best = "nin".

Step 5: Check "ninj". All nodes have ec=1 ✓. Complete! Best = "ninj".

Step 6: Check "ninja". All ✓. Best = "ninja".

Step 7: Check "ninjak". All ✓. Best = "ninjak".

Answer: "ninjak" (length 6).

**Correctness:** The Trie path for any word contains exactly the nodes corresponding to all its prefixes. Checking `endCount > 0` at each node is equivalent to checking if that prefix exists as a word in the original array.

**Key invariant:** A node's `endCount > 0` if and only if some word in the array ends at that position.

**Common mistakes:** Forgetting to check the node for the word itself (the last node must also have endCount > 0, but it always will since the word itself is in the array). Not handling lexicographic tie-breaking.

**30-second explanation:** "I insert all words into a Trie. For each word, I walk its path and verify every node has endCount > 0, meaning that prefix exists as a word. I track the longest such complete string."

## Optimal In-depth Intuition

The Trie collapses the prefix-checking problem into a single traversal. In the brute force, we created substring objects and hashed them — O(L) per prefix, O(L²) per word. In the Trie, each "prefix check" is just looking at one node's endCount field — O(1). So checking all prefixes of a word is O(L) total.

Why is this the right data structure? The Trie literally organizes strings by their prefixes. Every prefix of "ninja" corresponds to a node on the path root→n→i→n→j→a. We're exploiting the Trie's structure where path = prefix.

An alternative would be sorting words by length and using DP: a word is complete if its (length-1) prefix is complete. This also works in O(N × L) using a HashSet, but the Trie approach is more natural and directly applicable.

## Optimal Algorithm

```
function longestCompleteString(words):
    // Step 1: Build Trie
    trie = new Trie()
    for each word in words:
        trie.insert(word)

    // Step 2: Check each word
    best = ""
    for each word in words:
        node = trie.root
        isComplete = true
        for each character ch in word:
            node = node.children[ch - 'a']
            if node.endCount == 0:
                isComplete = false
                break
        if isComplete:
            if word.length > best.length:
                best = word
            else if word.length == best.length and word < best:
                best = word

    return best == "" ? "None" : best
```

Two passes: first insert all words, then check each word by walking its Trie path.

## Optimal Code

```java
class Solution {
    static int[][] children;
    static int[] endCount;
    static int nodeCount;

    static int createNode() {
        int id = nodeCount++;
        for (int i = 0; i < 26; i++) {
            children[id][i] = -1;
        }
        endCount[id] = 0;
        return id;
    }

    static void insert(String word) {
        int node = 0;
        for (int i = 0; i < word.length(); i++) {
            int idx = word.charAt(i) - 'a';
            if (children[node][idx] == -1) {
                children[node][idx] = createNode();
            }
            node = children[node][idx];
        }
        endCount[node]++;
    }

    static boolean isComplete(String word) {
        int node = 0;
        for (int i = 0; i < word.length(); i++) {
            int idx = word.charAt(i) - 'a';
            node = children[node][idx];
            if (endCount[node] == 0) {
                return false;
            }
        }
        return true;
    }

    public static String completeString(int n, String[] words) {
        int maxNodes = 100002;
        children = new int[maxNodes][26];
        endCount = new int[maxNodes];
        nodeCount = 0;
        createNode(); // root

        for (String word : words) {
            insert(word);
        }

        String best = "";
        for (String word : words) {
            if (isComplete(word)) {
                if (word.length() > best.length()
                    || (word.length() == best.length()
                        && word.compareTo(best) < 0)) {
                    best = word;
                }
            }
        }
        return best.isEmpty() ? "None" : best;
    }
}
```

## Optimal Complexity

```
Time: O(N × L) where L is max word length (or O(total_characters))
Space: O(total_characters × 26) for the Trie
```

We insert N words into the Trie — O(total characters). Then we check each word by walking its path — O(L) per word. Total: O(N × L) or more precisely O(sum of all word lengths), which is at most 10^5. Space is dominated by the Trie: each character creates at most one node with 26 pointers.

## Optimal Hints

- Hint 1: Think about how you can check "does this prefix exist as a word" without creating the prefix string.
- Hint 2: A Trie path from root to any node IS a prefix. You just need to check markers along the way.
- Hint 3: After inserting all words, walk each word's path. At each node, check if endCount > 0.
- Hint 4: If any node on the path has endCount = 0, that prefix doesn't exist as a word — the word is NOT complete.
- Hint 5: Two passes: insert all, then check all. Track longest complete string with lexicographic tie-break.
- Hint 6: Edge: If the first character of a word doesn't have endCount > 0, the word can't be complete (prefix of length 1 is missing).

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
  <strong style="color:#a78bfa;font-size:14px">Optimal — Trie Path Verification</strong>
  <div style="margin-top:8px" id="optTcBtns"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="optPrev()">← Prev</button>
    <button class="ctrl-btn" onclick="optNext()">Next →</button>
    <button class="ctrl-btn" id="optPlayBtn" onclick="optToggle()">▶ Play</button>
    <span id="optStepCtr" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="optViz" style="min-height:200px;overflow:auto;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:2"></div>
    <div class="viz-state" id="optState" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="optLog"></div>
    <div class="viz-code" id="optCode" style="margin-top:10px"></div>
    <div class="explanation-box" id="optExpl"></div>
  </div>
</div>

<script>
const OPT_CODE=["trie = build from all words","for word in words:","  node = root","  for ch in word:","    node = children[ch]","    if endCount == 0: NOT complete","  word is complete → update best"];
const OPT_TC=[
  {name:"All complete",words:["n","ni","nin","ninj","ninja","ninjak"]},
  {name:"None complete",words:["ab","bc"]},
  {name:"Mixed",words:["a","ab","abc","b","bc","bcd"]}
];
// Simple trie sim
function buildOTrie(words){
  const nodes=[{ch:'R',children:{},ec:0}];
  function ins(w){
    let n=0;
    for(const c of w){
      if(!nodes[n].children[c]){const id=nodes.length;nodes.push({ch:c,children:{},ec:0});nodes[n].children[c]=id;}
      n=nodes[n].children[c];
    }
    nodes[n].ec++;
  }
  words.forEach(ins);
  return nodes;
}
let optI=0,optS=0,optSteps=[],optPlay=null;
function optBuild(tc){
  optSteps=[];
  const trie=buildOTrie(tc.words);
  optSteps.push({word:"-",highlight:[],best:"",codeLine:0,msg:"Trie built from all words",expl:"All words inserted into Trie. Now checking each word for completeness.",color:"#71717a",trie});
  let best="";
  for(const w of tc.words){
    let n=0,ok=true;const hl=[0];
    for(let i=0;i<w.length;i++){
      const c=w[i];
      n=trie[n].children[c];hl.push(n);
      if(trie[n].ec===0){
        optSteps.push({word:w,highlight:[...hl],best,codeLine:5,trie,
          msg:`"${w}": node '${c}' (prefix "${w.substring(0,i+1)}") has ec=0 → NOT complete`,
          expl:`Walking "${w}": at character '${c}' (prefix "${w.substring(0,i+1)}"), endCount=0. This prefix doesn't exist as a word → "${w}" is NOT complete.`,
          color:"#f87171"});
        ok=false;break;
      }
    }
    if(ok){
      if(w.length>best.length||(w.length===best.length&&w<best))best=w;
      optSteps.push({word:w,highlight:[...hl],best,codeLine:6,trie,
        msg:`"${w}": ALL nodes have ec>0 → COMPLETE! Best="${best}"`,
        expl:`Every node on the path for "${w}" has endCount > 0. All prefixes exist! Length ${w.length}. Best updated to "${best}".`,
        color:"#34d399"});
    }
  }
  optSteps.push({word:"",highlight:[],best,codeLine:6,trie,msg:`Answer: "${best||'None'}"`,expl:`Final answer: "${best||'None'}".`,color:"#a78bfa"});
}
function optRenderTree(trie,hl){
  let h='';
  function dfs(idx,d,pfx){
    const nd=trie[idx];const lit=hl&&hl.includes(idx);
    const clr=lit?(nd.ec>0?'#34d399':'#f87171'):'#71717a';
    const bg=lit?'rgba(79,143,247,0.08)':'transparent';
    const lbl=idx===0?'ROOT':nd.ch;
    const ecBadge=idx>0?` <span style="font-size:10px;color:${nd.ec>0?'#34d399':'#f87171'}">ec=${nd.ec}</span>`:'';
    h+=`<div style="margin-left:${d*20}px;color:${clr};background:${bg};border-radius:4px;padding:0 6px;display:inline-block">${pfx}${lbl}${ecBadge}</div><br>`;
    const chs=Object.keys(nd.children).sort();
    chs.forEach((c,i)=>dfs(nd.children[c],d+1,i===chs.length-1?'└─':'├─'));
  }
  dfs(0,0,'');return h;
}
function optRender(){
  const s=optSteps[optS]||{word:"",highlight:[],best:"",codeLine:-1,msg:"Ready",expl:"Press Next.",color:"#71717a",trie:[{ch:'R',children:{},ec:0}]};
  document.getElementById("optViz").innerHTML=optRenderTree(s.trie,s.highlight);
  document.getElementById("optState").innerHTML=`<div>Checking: <span class="changed">${s.word||"-"}</span></div><div>Best: <span class="changed">${s.best||"None"}</span></div>`;
  let ch='';OPT_CODE.forEach((l,i)=>{ch+=`<div class="${i===s.codeLine?'active':'dim'}">${l}</div>`;});
  document.getElementById("optCode").innerHTML=ch;
  let lh='';for(let i=0;i<=optS&&i<optSteps.length;i++){lh+=`<div class="log-entry" style="color:${optSteps[i].color}">${i===optS?'▶ ':'  '}${optSteps[i].msg}</div>`;}
  document.getElementById("optLog").innerHTML=lh;
  document.getElementById("optExpl").innerHTML=s.expl;
  document.getElementById("optStepCtr").textContent=`Step ${optS+1}/${optSteps.length}`;
}
function optLoad(i){optI=i;optS=0;optBuild(OPT_TC[i]);document.querySelectorAll('.opttc').forEach((b,j)=>{b.className=j===i?'ctrl-btn active-tc opttc':'ctrl-btn opttc';});optRender();}
function optPrev(){if(optS>0){optS--;optRender();}}
function optNext(){if(optS<optSteps.length-1){optS++;optRender();}}
function optToggle(){if(optPlay){clearInterval(optPlay);optPlay=null;document.getElementById("optPlayBtn").textContent="▶ Play";}else{optPlay=setInterval(()=>{if(optS<optSteps.length-1)optNext();else optToggle();},1000);document.getElementById("optPlayBtn").textContent="⏸ Pause";}}
let otH='';OPT_TC.forEach((t,i)=>{otH+=`<button class="ctrl-btn opttc" onclick="optLoad(${i})">${t.name}</button> `;});
document.getElementById("optTcBtns").innerHTML=otH;
optLoad(0);
</script>
</div>
```

---

# Number of Distinct Substrings in a String

**Difficulty:** Medium
**Coding Ninjas:** https://www.naukri.com/code360/problems/count-distinct-substrings_985292
**GFG:** https://www.geeksforgeeks.org/problems/number-of-distinct-subsequences0Remove/1

## Description

Given a string `s` of length N consisting of lowercase English letters, find the **number of distinct substrings** (including the empty string).

A substring is a contiguous sequence of characters within the string. Two substrings are distinct if they differ in at least one character position or have different lengths.

**Input format:**
- A string `s` of length N

**Output format:**
- An integer: the total count of distinct substrings (including the empty string "")

**Constraints:**
- 1 <= N <= 1000
- s consists of lowercase English letters

**Example 1:**
```
Input: s = "abab"
Output: 8
```
Explanation: The distinct substrings are: "", "a", "b", "ab", "ba", "aba", "bab", "abab". Note: "a" appears at positions 0 and 2, but counts only once. "ab" appears at positions 0 and 2, but counts only once. Total = 8 distinct substrings.

**Example 2:**
```
Input: s = "aaa"
Output: 4
```
Explanation: Distinct substrings: "", "a", "aa", "aaa". Despite "a" appearing 3 times and "aa" appearing 2 times, each is counted once. Total = 4.

**Example 3:**
```
Input: s = "abc"
Output: 7
```
Explanation: "", "a", "b", "c", "ab", "bc", "abc". All 6 non-empty substrings are distinct (no repeats). Plus empty string = 7.

**Edge cases:**
- Single character: answer = 2 ("" and the character)
- All same characters: answer = N + 1 ("", "a", "aa", "aaa", ..., "aaa...a")
- All distinct characters: answer = N*(N+1)/2 + 1 (maximum possible)

## In-depth Explanation

**Reframe the problem:** Count the number of unique nodes in a Trie built from all suffixes of the string (plus 1 for the empty string represented by the root).

**Pattern recognition:** This is a suffix Trie / Trie counting problem. The clue is "distinct substrings" — every substring of a string is a prefix of some suffix. If we insert all suffixes into a Trie, every node in the Trie corresponds to a unique substring. The count of nodes = count of distinct non-empty substrings.

**Real-world analogy:** Imagine writing every possible "ending" of the word on separate cards. For "abab": "abab", "bab", "ab", "b". Now organize these cards into a Trie. Each fork in the Trie represents a point where substrings diverge. The number of forks (nodes) = number of distinct substrings.

**Why naive thinking fails:** The brute force generates all O(N²) substrings and puts them in a HashSet. Each substring creation is O(N), and hashing is O(N), giving O(N³) total. For N=1000, that's 10^9 operations — too slow in many contexts.

**Approach overview:** Brute force: HashSet of all substrings O(N³). Optimal: Suffix Trie — insert all suffixes, count nodes. O(N²) time and space (which for N=1000 is 10^6 — very manageable).

**Key edge cases:** All same characters means maximum sharing in the Trie (only one path, N nodes). All distinct characters means no sharing (maximum nodes = N(N+1)/2).

**Interview cheat sheet:**
- Keywords: "distinct substrings", "count unique substrings"
- Distinguisher: This asks for count, not enumeration. Trie naturally deduplicates.
- **Aha moment:** Every substring = a prefix of some suffix. Insert all suffixes into a Trie; each node = one distinct substring.
- **Memory hook:** "Distinct substrings = nodes in suffix Trie."

## Brute Force Intuition

Generate every possible substring of the string using two nested loops (start index and end index). Add each substring to a HashSet, which automatically deduplicates. The final answer is the size of the HashSet plus 1 (for the empty string).

## Brute Force Step-by-Step Solution

**Opening:** We enumerate all substrings using two indices and collect them in a HashSet.

**Walkthrough with Example 1: s = "abab"**

Step 1: Initialize HashSet = {}. We'll try all starting positions 0,1,2,3.

Step 2: Start = 0. Generate substrings: "a" (0,1), "ab" (0,2), "aba" (0,3), "abab" (0,4).
Add each to set. Set = {"a", "ab", "aba", "abab"}.

Step 3: Start = 1. Generate: "b" (1,2), "ba" (1,3), "bab" (1,4).
Add each. Set = {"a", "ab", "aba", "abab", "b", "ba", "bab"}.

Step 4: Start = 2. Generate: "a" (2,3) — already in set! "ab" (2,4) — already in set!
Set unchanged = {"a", "ab", "aba", "abab", "b", "ba", "bab"}.

Step 5: Start = 3. Generate: "b" (3,4) — already in set!
Set unchanged.

Step 6: Final set size = 7. Add 1 for empty string. Answer = 8.

**Correctness:** We exhaustively generate all possible contiguous substrings. The HashSet handles deduplication. We never miss any substring because the double loop covers all (start, end) pairs.

**Key invariant:** The HashSet at any point contains exactly the distinct substrings we've seen so far.

**Common mistakes:** Forgetting the empty string. Off-by-one in the end index (use exclusive end). Not realizing substring creation itself is O(N).

**30-second explanation:** "I generate all N² substrings using nested loops, add them to a HashSet for deduplication, and return the set size plus one for the empty string."

## Brute Force In-depth Intuition

A string of length N has exactly N×(N+1)/2 substrings (including duplicates). We generate each one, taking O(N) per substring for creation and hashing. Total: O(N² × N) = O(N³). This is acceptable for very small N but for N=1000, it's 10^9 — borderline.

The fundamental inefficiency: we create full substring objects just to hash them. The Trie avoids this by building substrings character by character, sharing common prefixes automatically.

## Brute Force Algorithm

```
function countDistinctSubstrings(s):
    n = s.length
    substrings = HashSet()

    for start = 0 to n - 1:
        for end = start + 1 to n:
            substring = s[start..end]
            substrings.add(substring)

    return substrings.size() + 1    // +1 for empty string
```

Two nested loops generate all substrings. The HashSet auto-deduplicates. We add 1 for the empty string at the end.

## Brute Force Code

```java
class Solution {
    public int countDistinctSubstrings(String s) {
        int n = s.length();
        HashSet<String> substrings = new HashSet<>();

        for (int start = 0; start < n; start++) {
            for (int end = start + 1; end <= n; end++) {
                substrings.add(s.substring(start, end));
            }
        }

        return substrings.size() + 1; // +1 for empty string
    }
}
```

## Brute Force Complexity

```
Time: O(N³) — N² substrings, each O(N) to create and hash
Space: O(N² × N) = O(N³) — storing up to N²/2 unique substrings, each up to length N
```

The outer loop runs N times, inner loop runs up to N times, and substring creation is O(end - start) which averages O(N/2). In the worst case (all distinct characters), the HashSet stores N(N+1)/2 strings of average length N/3, consuming O(N³) space.

## Brute Force Hints

- Hint 1: Every substring of s is a prefix of some suffix. What data structure organizes strings by prefixes?
- Hint 2: A Trie! If you insert all suffixes of s into a Trie, what does each node represent?
- Hint 3: Each node in the suffix Trie corresponds to exactly one distinct substring.
- Hint 4: So the answer = number of nodes in the suffix Trie + 1 (for empty string = root).
- Hint 5: Insert suffix starting at index 0, then index 1, ..., then index N-1. Count new nodes created.
- Hint 6: For "aaa", suffixes are "aaa", "aa", "a". The Trie has only 3 nodes (a→a→a). Answer = 3 + 1 = 4.

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
  <strong style="color:#a78bfa;font-size:14px">Brute Force — HashSet of All Substrings</strong>
  <div style="margin-top:8px" id="dsBfTc"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="dsBfPrev()">← Prev</button>
    <button class="ctrl-btn" onclick="dsBfNext()">Next →</button>
    <button class="ctrl-btn" id="dsBfPlayBtn" onclick="dsBfToggle()">▶ Play</button>
    <span id="dsBfCtr" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="dsBfViz" style="min-height:120px"></div>
    <div class="viz-state" id="dsBfState" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="dsBfLog"></div>
    <div class="explanation-box" id="dsBfExpl"></div>
  </div>
</div>

<script>
const DS_BF_TC=[{name:"abab",s:"abab"},{name:"aaa",s:"aaa"},{name:"abc",s:"abc"}];
let dsBfI=0,dsBfS=0,dsBfSteps=[],dsBfPlay=null;
function dsBfBuild(tc){
  dsBfSteps=[];const set=new Set();const s=tc.s;const n=s.length;
  for(let i=0;i<n;i++){
    for(let j=i+1;j<=n;j++){
      const sub=s.substring(i,j);const isNew=!set.has(sub);
      set.add(sub);
      dsBfSteps.push({sub,start:i,end:j,isNew,setSize:set.size,set:[...set],
        msg:`s[${i}..${j}]="${sub}" → ${isNew?"NEW":"duplicate"}`,
        expl:`Substring "${sub}" from index ${i} to ${j}. ${isNew?"Added to set (new distinct substring).":"Already in set — skip."}`,
        color:isNew?"#34d399":"#fbbf24"});
    }
  }
  dsBfSteps.push({sub:"",start:-1,end:-1,isNew:false,setSize:set.size,set:[...set],
    msg:`Total distinct substrings: ${set.size} + 1(empty) = ${set.size+1}`,
    expl:`Found ${set.size} distinct non-empty substrings. Adding 1 for empty string. Answer = ${set.size+1}.`,
    color:"#a78bfa"});
}
function dsBfRender(){
  const s=dsBfSteps[dsBfS];if(!s)return;
  const str=DS_BF_TC[dsBfI].s;
  let viz=`<div style="margin-bottom:10px;font-size:16px;font-family:monospace;letter-spacing:4px">`;
  for(let i=0;i<str.length;i++){
    const hl=i>=s.start&&i<s.end;
    viz+=`<span style="color:${hl?'#4f8ff7':'#71717a'};${hl?'text-decoration:underline':''}">${str[i]}</span>`;
  }
  viz+=`</div>`;
  viz+=`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">`;
  for(const sub of s.set){
    const isCur=sub===s.sub;
    viz+=`<span style="background:${isCur?'rgba(79,143,247,0.2)':'#1a1a2e'};border:1px solid ${isCur?'#4f8ff7':'#333'};border-radius:4px;padding:2px 6px;font-size:11px;font-family:monospace">"${sub}"</span>`;
  }
  viz+=`</div>`;
  document.getElementById("dsBfViz").innerHTML=viz;
  document.getElementById("dsBfState").innerHTML=`<div>Current: <span class="changed">"${s.sub}"</span></div><div>Distinct count: <span class="changed">${s.setSize}</span></div>`;
  let lh='';for(let i=Math.max(0,dsBfS-8);i<=dsBfS&&i<dsBfSteps.length;i++){lh+=`<div class="log-entry" style="color:${dsBfSteps[i].color}">${i===dsBfS?'▶ ':'  '}${dsBfSteps[i].msg}</div>`;}
  document.getElementById("dsBfLog").innerHTML=lh;
  document.getElementById("dsBfExpl").innerHTML=s.expl;
  document.getElementById("dsBfCtr").textContent=`Step ${dsBfS+1}/${dsBfSteps.length}`;
}
function dsBfLoad(i){dsBfI=i;dsBfS=0;dsBfBuild(DS_BF_TC[i]);document.querySelectorAll('.dsbftc').forEach((b,j)=>{b.className=j===i?'ctrl-btn active-tc dsbftc':'ctrl-btn dsbftc';});dsBfRender();}
function dsBfPrev(){if(dsBfS>0){dsBfS--;dsBfRender();}}
function dsBfNext(){if(dsBfS<dsBfSteps.length-1){dsBfS++;dsBfRender();}}
function dsBfToggle(){if(dsBfPlay){clearInterval(dsBfPlay);dsBfPlay=null;document.getElementById("dsBfPlayBtn").textContent="▶ Play";}else{dsBfPlay=setInterval(()=>{if(dsBfS<dsBfSteps.length-1)dsBfNext();else dsBfToggle();},700);document.getElementById("dsBfPlayBtn").textContent="⏸ Pause";}}
let dsBfH='';DS_BF_TC.forEach((t,i)=>{dsBfH+=`<button class="ctrl-btn dsbftc" onclick="dsBfLoad(${i})">${t.name}</button> `;});
document.getElementById("dsBfTc").innerHTML=dsBfH;
dsBfLoad(0);
</script>
</div>
```

## Optimal Intuition

Insert all suffixes of the string into a Trie. Every new node created during insertion represents a new distinct substring. The total count of nodes in the Trie = the number of distinct non-empty substrings. Add 1 for the empty string (the root). This works because every substring is a prefix of some suffix, and the Trie captures exactly all distinct prefixes of all suffixes.

## Optimal Step-by-Step Solution

**Opening:** We insert all N suffixes into a Trie. Each time we create a new node, that's a new distinct substring. Total nodes + 1 = answer.

**Walkthrough with Example 1: s = "abab"**

Step 1: Insert suffix "abab" (starting at index 0).
Create nodes: a → b → a → b. New nodes = 4.
Trie:
```
root → a → b → a → b
```
Distinct substrings found so far: "a", "ab", "aba", "abab"

Step 2: Insert suffix "bab" (starting at index 1).
At root, child 'b' doesn't exist → create it. Then a → b.
New nodes = 3.
Trie:
```
root → a → b → a → b
     → b → a → b
```
New substrings: "b", "ba", "bab"

Step 3: Insert suffix "ab" (starting at index 2).
At root, child 'a' exists → follow. At 'a', child 'b' exists → follow. No new nodes!
New nodes = 0.
"ab" and "a" were already represented.

Step 4: Insert suffix "b" (starting at index 3).
At root, child 'b' exists → follow. No new nodes!
New nodes = 0.

Total nodes = 4 + 3 + 0 + 0 = 7. Answer = 7 + 1 (empty string) = 8.

**Correctness:** Every substring of s of the form s[i..j] is a prefix of the suffix s[i..n]. By inserting all suffixes, we ensure every possible prefix appears in the Trie. Duplicate substrings map to the same Trie node (no duplicate nodes are created), so node count = distinct substring count.

**Key invariant:** After inserting all suffixes, every distinct non-empty substring corresponds to exactly one node in the Trie.

**Common mistakes:** Forgetting to add 1 for the empty string. Counting nodes incorrectly (the root is the empty string, not a substring). Off-by-one on suffix start indices.

**30-second explanation:** "I insert every suffix of the string into a Trie. Each node represents a unique substring. Answer = total nodes + 1 for empty string."

## Optimal In-depth Intuition

The key mathematical insight: the set of all substrings of a string = the set of all prefixes of all suffixes. This is because any substring s[i..j] is a prefix (of length j-i) of the suffix s[i..n].

A Trie stores all distinct prefixes of its inserted strings as nodes. So a suffix Trie stores all distinct substrings as nodes. The Trie naturally deduplicates: if "ab" appears as a prefix of both "abab" and "ab", it maps to the same node in the Trie.

Why O(N²) and not better? In the worst case (all distinct characters), there are N(N+1)/2 distinct substrings, so any algorithm must take at least O(N²) to count them all. The suffix Trie achieves this bound.

For even better performance (O(N) or O(N log N)), one would use a Suffix Array + LCP Array, but that's beyond the scope of this Trie-focused problem.

Connection to other problems: This exact technique — inserting all suffixes into a Trie — is the foundation for substring search, longest repeated substring, and many text processing algorithms.

## Optimal Algorithm

```
function countDistinctSubstrings(s):
    root = new TrieNode()
    nodeCount = 0            // counts non-root nodes

    for start = 0 to s.length - 1:
        node = root
        for charIdx = start to s.length - 1:
            index = s[charIdx] - 'a'
            if node.children[index] is null:
                node.children[index] = new TrieNode()
                nodeCount += 1
            node = node.children[index]

    return nodeCount + 1     // +1 for empty string
```

For each starting position, we insert the suffix character by character. Whenever we create a new node, that's a new distinct substring. The loop naturally handles deduplication because existing nodes are reused.

## Optimal Code

```java
class Solution {
    public int countDistinctSubstrings(String s) {
        int n = s.length();
        int[][] children = new int[n * (n + 1) / 2 + 1][26];
        int nodeCount = 0;

        // Initialize root (node 0)
        for (int i = 0; i < 26; i++) {
            children[0][i] = -1;
        }
        nodeCount = 1; // root exists

        int totalNodes = 0; // non-root nodes = distinct non-empty substrings

        for (int start = 0; start < n; start++) {
            int node = 0; // start from root
            for (int charIdx = start; charIdx < n; charIdx++) {
                int idx = s.charAt(charIdx) - 'a';
                if (children[node][idx] == -1) {
                    // Create new node
                    int newNode = nodeCount++;
                    for (int k = 0; k < 26; k++) {
                        children[newNode][k] = -1;
                    }
                    children[node][idx] = newNode;
                    totalNodes++;
                }
                node = children[node][idx];
            }
        }

        return totalNodes + 1; // +1 for empty string
    }
}
```

## Optimal Complexity

```
Time: O(N²) where N = length of string
Space: O(N² × 26) for the Trie nodes
```

We insert N suffixes. The i-th suffix has length N-i. Total characters inserted = N + (N-1) + ... + 1 = N(N+1)/2 = O(N²). Each character insertion is O(1) (array index lookup). Space: at most N(N+1)/2 nodes, each with 26 pointers. For N=1000, that's ~500K nodes × 26 ≈ 13M integers — fits in memory comfortably.

## Optimal Hints

- Hint 1: Every substring is a prefix of some suffix. What if you stored all suffixes efficiently?
- Hint 2: Insert all N suffixes into a Trie. Each suffix starts at a different index.
- Hint 3: Each node created in the Trie corresponds to one distinct substring.
- Hint 4: Count the total number of nodes (excluding root). That's the number of distinct non-empty substrings.
- Hint 5: Don't forget to add 1 for the empty string (root node).
- Hint 6: For "aaa", inserting suffixes "aaa", "aa", "a" only creates 3 nodes (all on one path). Answer = 3 + 1 = 4.

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
  <strong style="color:#a78bfa;font-size:14px">Optimal — Suffix Trie Node Counting</strong>
  <div style="margin-top:8px" id="dsOptTc"></div>
  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
    <button class="ctrl-btn" onclick="dsOptPrev()">← Prev</button>
    <button class="ctrl-btn" onclick="dsOptNext()">Next →</button>
    <button class="ctrl-btn" id="dsOptPlayBtn" onclick="dsOptToggle()">▶ Play</button>
    <span id="dsOptCtr" style="font-size:12px;color:#71717a;margin-left:8px">Step 0/0</span>
  </div>
</div>

<div class="viz-grid">
  <div>
    <div class="viz-card" id="dsOptViz" style="min-height:200px;overflow:auto;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:2"></div>
    <div class="viz-state" id="dsOptState" style="margin-top:10px"></div>
  </div>
  <div>
    <div class="viz-card" style="max-height:200px;overflow-y:auto" id="dsOptLog"></div>
    <div class="viz-code" id="dsOptCode" style="margin-top:10px"></div>
    <div class="explanation-box" id="dsOptExpl"></div>
  </div>
</div>

<script>
const DS_OPT_CODE=["for start=0 to n-1:","  node = root","  for i=start to n-1:","    ch = s[i]","    if children[ch] is null:","      create new node; count++","    node = children[ch]","return count + 1"];
const DS_OPT_TC=[{name:"abab",s:"abab"},{name:"aaa",s:"aaa"},{name:"abc",s:"abc"}];
let dsOptI=0,dsOptS=0,dsOptSteps=[],dsOptPlay=null;
function dsOptBuild(tc){
  dsOptSteps=[];
  const s=tc.s;const n=s.length;
  const trie=[{ch:'R',children:{}}];let cnt=0;
  for(let st=0;st<n;st++){
    let nd=0;
    for(let i=st;i<n;i++){
      const c=s[i];const isNew=!trie[nd].children[c];
      if(isNew){const id=trie.length;trie.push({ch:c,children:{}});trie[nd].children[c]=id;cnt++;}
      const sub=s.substring(st,i+1);
      // Find highlight path
      const path=[0];let tmp=0;
      for(let k=st;k<=i;k++){tmp=trie[tmp].children[s[k]];path.push(tmp);}
      dsOptSteps.push({suffix:s.substring(st),sub,isNew,cnt,trie:JSON.parse(JSON.stringify(trie)),highlight:path,codeLine:isNew?5:6,
        msg:`suffix[${st}]: insert '${c}' → "${sub}" ${isNew?"NEW node":"exists"}`,
        expl:`Processing suffix "${s.substring(st)}": character '${c}' at position ${i}. Substring so far: "${sub}". ${isNew?`Node doesn't exist → created! Total nodes: ${cnt}.`:`Node exists → follow it. No new substring.`}`,
        color:isNew?"#34d399":"#fbbf24"});
      nd=trie[nd].children[c];
    }
  }
  dsOptSteps.push({suffix:"",sub:"",isNew:false,cnt,trie:JSON.parse(JSON.stringify(trie)),highlight:[],codeLine:7,
    msg:`Done! ${cnt} nodes + 1 (empty) = ${cnt+1}`,
    expl:`Total Trie nodes = ${cnt}. Each represents a distinct non-empty substring. Add 1 for empty string → Answer = ${cnt+1}.`,
    color:"#a78bfa"});
}
function dsOptTreeRender(trie,hl){
  let h='';
  function dfs(idx,d,pfx){
    const nd=trie[idx];const lit=hl&&hl.includes(idx);
    const clr=lit?'#4f8ff7':'#71717a';
    h+=`<div style="margin-left:${d*20}px;color:${clr};display:inline-block;padding:0 4px;border-radius:3px;${lit?'background:rgba(79,143,247,0.1)':''}">${pfx}${idx===0?'ROOT':nd.ch}</div><br>`;
    Object.keys(nd.children).sort().forEach((c,i,arr)=>{dfs(nd.children[c],d+1,i===arr.length-1?'└─':'├─');});
  }
  dfs(0,0,'');return h;
}
function dsOptRender(){
  const s=dsOptSteps[dsOptS];if(!s)return;
  document.getElementById("dsOptViz").innerHTML=dsOptTreeRender(s.trie,s.highlight);
  document.getElementById("dsOptState").innerHTML=`<div>Suffix: <span class="changed">"${s.suffix}"</span></div><div>Substring: <span class="changed">"${s.sub}"</span></div><div>Distinct count: <span class="changed">${s.cnt} + 1 = ${s.cnt+1}</span></div>`;
  let ch='';DS_OPT_CODE.forEach((l,i)=>{ch+=`<div class="${i===s.codeLine?'active':'dim'}">${l}</div>`;});
  document.getElementById("dsOptCode").innerHTML=ch;
  let lh='';for(let i=Math.max(0,dsOptS-10);i<=dsOptS&&i<dsOptSteps.length;i++){lh+=`<div class="log-entry" style="color:${dsOptSteps[i].color}">${i===dsOptS?'▶ ':'  '}${dsOptSteps[i].msg}</div>`;}
  document.getElementById("dsOptLog").innerHTML=lh;
  document.getElementById("dsOptExpl").innerHTML=s.expl;
  document.getElementById("dsOptCtr").textContent=`Step ${dsOptS+1}/${dsOptSteps.length}`;
}
function dsOptLoad(i){dsOptI=i;dsOptS=0;dsOptBuild(DS_OPT_TC[i]);document.querySelectorAll('.dsopttc').forEach((b,j)=>{b.className=j===i?'ctrl-btn active-tc dsopttc':'ctrl-btn dsopttc';});dsOptRender();}
function dsOptPrev(){if(dsOptS>0){dsOptS--;dsOptRender();}}
function dsOptNext(){if(dsOptS<dsOptSteps.length-1){dsOptS++;dsOptRender();}}
function dsOptToggle(){if(dsOptPlay){clearInterval(dsOptPlay);dsOptPlay=null;document.getElementById("dsOptPlayBtn").textContent="▶ Play";}else{dsOptPlay=setInterval(()=>{if(dsOptS<dsOptSteps.length-1)dsOptNext();else dsOptToggle();},800);document.getElementById("dsOptPlayBtn").textContent="⏸ Pause";}}
let dsOptH='';DS_OPT_TC.forEach((t,i)=>{dsOptH+=`<button class="ctrl-btn dsopttc" onclick="dsOptLoad(${i})">${t.name}</button> `;});
document.getElementById("dsOptTc").innerHTML=dsOptH;
dsOptLoad(0);
</script>
</div>
```
