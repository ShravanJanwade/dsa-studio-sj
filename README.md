# DSA Studio — Interview Prep Platform

A professional DSA cheat sheet and study platform with interactive visualizations, smart file parsing, and Supabase backend.

## Quick Setup

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) → New Project
- Copy your **Project URL** and **anon public key** from Settings → API

### 2. Run Database Schema
- Go to SQL Editor in your Supabase dashboard
- Copy and run the entire contents of `supabase-schema.sql`

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase URL and key
```

### 4. Install & Run
```bash
npm install
npm run dev
```

---

## Architecture

```
src/
├── App.jsx                          # Root: state, routing, Supabase orchestration
├── main.jsx                         # React entry point
├── index.css                        # Tailwind + global styles
├── lib/
│   ├── supabase.js                  # Supabase client + all CRUD operations
│   ├── parser.js                    # Smart file parser (md, html, xlsx)
│   ├── tokenizer.js                 # Java syntax tokenizer
│   └── constants.js                 # Design tokens, status/difficulty configs
├── components/
│   ├── Sidebar.jsx                  # Topic tree, search, progress stats
│   ├── ProblemView.jsx              # Main study view with split panels
│   ├── ui/
│   │   └── Primitives.jsx           # Button, Modal, Input, Select, Badge
│   ├── panels/
│   │   ├── CodePanel.jsx            # Syntax-highlighted code with line numbers
│   │   ├── MarkdownRenderer.jsx     # Markdown → React elements
│   │   └── Widgets.jsx              # Timer, Viz iframe, Hints, Complexity chart
│   └── editors/
│       └── ProblemEditor.jsx        # Create/edit modal + bulk upload modal
```

---

## File Upload Formats

### Single Problem (Markdown)

Use headings to mark sections. The parser detects approach type from heading text:

```markdown
# Problem Name

**Difficulty:** Hard
**LeetCode:** https://leetcode.com/problems/...

## Description
Problem statement here...

## In-depth Explanation
Detailed walkthrough of what the problem is really asking...

## Brute Force Intuition
Why this approach works...

## Brute Force In-depth Intuition
Deep dive with examples...

## Brute Force Algorithm
```pseudocode
step by step...
```

## Brute Force Code
```java
// your code
```

## Brute Force Complexity
Time: O(n^2)
Space: O(n)

## Brute Force Hints
- First hint
- Second hint

## Optimal Intuition
...

## Optimal Code
```java
// optimized code
```
```

### Bulk Upload (Multiple Problems)

Separate problems with `---`:

```markdown
# Two Sum
## Description
...
## Brute Force Code
...
---
# Three Sum
## Description
...
## Optimal Code
...
```

### Excel Upload

Columns (case-insensitive, underscores optional):

| name | difficulty | description | brute_intuition | brute_code | brute_time | optimal_intuition | optimal_code | optimal_time |
|------|-----------|-------------|-----------------|------------|------------|-------------------|--------------|--------------|

### HTML Visualization

Upload `.html` files directly — they render in a sandboxed iframe. The HTML should be self-contained with inline CSS/JS.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `topics` | Top-level categories (Graphs, DP, Arrays) |
| `subtopics` | Sub-categories within topics |
| `problems` | Individual problems with metadata |
| `solutions` | Approach variants (Brute/Better/Optimal) per problem |
| `hints` | Progressive hints per solution |

---

## Problem Fields

Each problem supports:
- **Description**: What the problem asks
- **In-depth Explanation**: Detailed walkthrough of what to do and why
- **Solutions** (1-3 per problem):
  - **Intuition**: Core idea in brief
  - **In-depth Intuition**: Deep dive with examples
  - **Algorithm**: Pseudocode / steps
  - **Code**: Syntax-highlighted Java (or any language)
  - **Visualization HTML**: Interactive dry-run widget
  - **Hints**: Progressive reveal (click to show)
  - **Time/Space Complexity**: With visual comparison chart

---

## Key Features

- **Interview Timer**: Configurable countdown (15-60 min) with visual progress
- **Smart File Parsing**: Auto-detects sections, approach types, URLs, difficulty
- **Bulk Upload**: Upload entire subtopic's worth of problems from one file
- **Syntax Highlighting**: Proper tokenizer for Java (keywords, types, strings, numbers, comments)
- **Markdown Rendering**: Full block-level parser rendered as React elements (no innerHTML)
- **Visualization Sandbox**: Any HTML renders in a secure iframe
- **Progress Tracking**: Status per problem with visual stats
- **Complexity Charts**: Log-scale area chart comparing approaches

## License

MIT
