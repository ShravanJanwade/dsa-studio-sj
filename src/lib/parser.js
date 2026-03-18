/**
 * Smart File Parser
 * Handles: .md, .html, .xlsx/.xls, .txt
 *
 * Section detection now includes:
 * - "Step by Step Solution" → maps to in_depth_intuition
 * - "Walkthrough" → maps to in_depth_intuition
 * - "Detailed Approach" → maps to in_depth_intuition
 */

const SECTION_MAP = [
  // More specific first
  {
    keys: [
      "step by step solution",
      "step-by-step solution",
      "step by step approach",
      "step-by-step approach",
      "walkthrough",
      "detailed solution",
      "detailed approach",
      "approach walkthrough",
    ],
    field: "in_depth_intuition",
  },
  {
    keys: [
      "in-depth intuition",
      "in depth intuition",
      "deep intuition",
      "detailed intuition",
      "intuition explained",
    ],
    field: "in_depth_intuition",
  },
  {
    keys: [
      "in-depth explanation",
      "in depth explanation",
      "deep explanation",
      "detailed explanation",
      "explanation in depth",
    ],
    field: "in_depth_explanation",
  },
  {
    keys: [
      "intuition",
      "core idea",
      "thought process",
      "key insight",
      "approach idea",
    ],
    field: "intuition",
  },
  {
    keys: [
      "description",
      "problem statement",
      "statement",
      "problem description",
      "what to do",
    ],
    field: "description",
  },
  {
    keys: [
      "visualization",
      "dry run",
      "visual",
      "interactive",
      "diagram",
      "animation",
    ],
    field: "visualization_html",
  },
  {
    keys: ["algorithm", "pseudocode", "pseudo code", "steps", "procedure"],
    field: "algorithm",
  },
  {
    keys: [
      "code",
      "solution code",
      "implementation",
      "java solution",
      "python solution",
    ],
    field: "code",
  },
  {
    keys: [
      "time complexity",
      "time and space",
      "complexity analysis",
      "complexity",
    ],
    field: "_complexity",
  },
  { keys: ["space complexity"], field: "_space" },
  { keys: ["hint", "tips", "clue"], field: "_hints" },
  { keys: ["note", "observation", "remark"], field: "_notes" },
];

const APPROACH_MAP = [
  {
    keys: [
      "brute force",
      "brute",
      "naive",
      "straightforward",
      "basic approach",
    ],
    type: "Brute Force",
  },
  {
    keys: ["better", "improved", "optimized approach", "moderate"],
    type: "Better",
  },
  {
    keys: [
      "optimal",
      "efficient",
      "best",
      "tarjan",
      "o(n)",
      "o(v+e)",
      "o(v + e)",
    ],
    type: "Optimal",
  },
];

function detectApproach(text) {
  const lower = text.toLowerCase();
  for (const a of APPROACH_MAP) {
    if (a.keys.some((k) => lower.includes(k))) return a.type;
  }
  return null;
}

function detectSection(text) {
  const lower = text.toLowerCase();
  for (const s of SECTION_MAP) {
    if (s.keys.some((k) => lower.includes(k))) return s.field;
  }
  return null;
}

function extractComplexity(text) {
  const timeMatch = text.match(/[Tt]ime[:\s]*?(O\([^)]+\))/);
  const spaceMatch = text.match(/[Ss]pace[:\s]*?(O\([^)]+\))/);
  const standalone = text.match(/O\([^)]+\)/g);
  return {
    time: timeMatch ? timeMatch[1] : standalone?.[0] || "",
    space: spaceMatch ? spaceMatch[1] : standalone?.[1] || "",
  };
}

function extractCodeBlock(text) {
  const match = text.match(/```\w*\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

export function parseSingleProblem(content) {
  const lines = content.split("\n");
  const result = {
    name: "",
    difficulty: "Medium",
    description: "",
    in_depth_explanation: "",
    leetcode_url: "",
    gfg_url: "",
    solutions: [],
  };

  let currentApproach = null;
  let currentSection = null;
  let approachData = {};
  let buffer = [];
  let problemMeta = {};

  const firstH1 = lines.find((l) => /^# /.test(l));
  if (firstH1) result.name = firstH1.replace(/^# /, "").trim();

  const lcMatch = content.match(/https?:\/\/(www\.)?leetcode\.com\/[^\s)]+/);
  const gfgMatch = content.match(
    /https?:\/\/(www\.)?geeksforgeeks\.org\/[^\s)]+/,
  );
  const ytMatch = content.match(
    /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[^\s)]+/,
  );
  if (lcMatch) result.leetcode_url = lcMatch[0];
  if (gfgMatch) result.gfg_url = gfgMatch[0];
  if (ytMatch) result.youtube_url = ytMatch[0];

  const diffMatch = content.match(/\b(Easy|Medium|Hard)\b/i);
  if (diffMatch)
    result.difficulty =
      diffMatch[1].charAt(0).toUpperCase() +
      diffMatch[1].slice(1).toLowerCase();

  const flush = () => {
    if (!currentSection || buffer.length === 0) {
      buffer = [];
      return;
    }
    const text = buffer.join("\n").trim();
    if (!text) {
      buffer = [];
      return;
    }

    if (!currentApproach) {
      if (currentSection === "description") result.description = text;
      else if (currentSection === "in_depth_explanation")
        result.in_depth_explanation = text;
      else if (currentSection === "_notes") problemMeta.notes = text;
    } else {
      if (!approachData[currentApproach]) {
        approachData[currentApproach] = { approach_type: currentApproach };
      }
      const ad = approachData[currentApproach];

      if (currentSection === "_complexity") {
        const c = extractComplexity(text);
        ad.time_complexity = c.time || ad.time_complexity || "";
        ad.space_complexity = c.space || ad.space_complexity || "";
      } else if (currentSection === "_space") {
        const c = extractComplexity(text);
        ad.space_complexity = c.space || c.time || "";
      } else if (currentSection === "_hints") {
        ad.hints = text
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim())
          .filter(Boolean);
      } else if (currentSection === "code") {
        ad.code = extractCodeBlock(text);
      } else if (currentSection === "_notes") {
        // skip
      } else {
        ad[currentSection] = text;
      }
    }
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flush();
      const title = headingMatch[2].trim();
      const approach = detectApproach(title);
      const section = detectSection(title);

      if (approach) {
        currentApproach = approach;
        currentSection = section || "intuition";
      } else if (section) {
        currentSection = section;
      } else {
        if (headingMatch[1] === "#" && !result.name) {
          result.name = title;
        }
        currentSection = detectSection(title) || currentSection;
      }
    } else {
      buffer.push(line);
    }
  }
  flush();

  result.solutions = Object.values(approachData).map((a, i) => ({
    approach_type: a.approach_type,
    intuition: a.intuition || "",
    in_depth_intuition: a.in_depth_intuition || "",
    algorithm: a.algorithm || "",
    code: a.code || "",
    language: "java",
    time_complexity: a.time_complexity || "",
    space_complexity: a.space_complexity || "",
    visualization_html: a.visualization_html || "",
    hints: a.hints || [],
    position: i,
  }));

  if (problemMeta.notes) result.notes = problemMeta.notes;
  return result;
}

export function parseMultiProblem(content) {
  const separator = /\n---+\n|(?=^# Problem[:\s])/gm;
  const chunks = content.split(separator).filter((c) => c.trim());

  if (chunks.length <= 1) {
    const h1Splits = content
      .split(
        /(?=^# (?!.*(?:Brute|Better|Optimal|Intuition|Algorithm|Code|Hint|Description|Explanation|Step)))/gm,
      )
      .filter((c) => c.trim());
    if (h1Splits.length > 1) {
      return h1Splits.map((chunk) => parseSingleProblem(chunk));
    }
    return [parseSingleProblem(content)];
  }

  return chunks.map((chunk) => parseSingleProblem(chunk));
}

export function parseExcel(workbook) {
  const XLSX = window.XLSX || null;
  if (!XLSX) return [];

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const colMap = (row, ...candidates) => {
    for (const c of candidates) {
      const key = Object.keys(row).find(
        (k) =>
          k.toLowerCase().replace(/[_\s-]/g, "") ===
          c.toLowerCase().replace(/[_\s-]/g, ""),
      );
      if (key && row[key]) return String(row[key]).trim();
    }
    return "";
  };

  return rows
    .map((row) => {
      const problem = {
        name: colMap(row, "name", "problem", "title", "problemname"),
        difficulty: colMap(row, "difficulty", "diff", "level") || "Medium",
        description: colMap(
          row,
          "description",
          "problemstatement",
          "statement",
          "desc",
        ),
        in_depth_explanation: colMap(
          row,
          "indepthexplanation",
          "explanation",
          "detailedexplanation",
          "indepth",
        ),
        leetcode_url: colMap(row, "leetcodeurl", "leetcode", "lcurl", "lc"),
        gfg_url: colMap(row, "gfgurl", "gfg", "geeksforgeeks"),
        solutions: [],
      };

      const approaches = [
        { prefix: "brute", type: "Brute Force" },
        { prefix: "better", type: "Better" },
        { prefix: "optimal", type: "Optimal" },
      ];

      for (const { prefix, type } of approaches) {
        const intuition = colMap(
          row,
          `${prefix}intuition`,
          `${prefix}_intuition`,
        );
        const code = colMap(row, `${prefix}code`, `${prefix}_code`);
        if (intuition || code) {
          problem.solutions.push({
            approach_type: type,
            intuition,
            in_depth_intuition: colMap(
              row,
              `${prefix}indepthintuition`,
              `${prefix}_in_depth_intuition`,
              `${prefix}_step_by_step`,
              `${prefix}_walkthrough`,
            ),
            algorithm: colMap(
              row,
              `${prefix}algorithm`,
              `${prefix}_algorithm`,
              `${prefix}_algo`,
            ),
            code,
            language:
              colMap(row, `${prefix}language`, `${prefix}_lang`) || "java",
            time_complexity: colMap(
              row,
              `${prefix}time`,
              `${prefix}_time_complexity`,
              `${prefix}timecomplexity`,
            ),
            space_complexity: colMap(
              row,
              `${prefix}space`,
              `${prefix}_space_complexity`,
              `${prefix}spacecomplexity`,
            ),
            visualization_html: colMap(
              row,
              `${prefix}visualization`,
              `${prefix}_visualization`,
              `${prefix}_viz`,
            ),
            hints: colMap(row, `${prefix}hints`, `${prefix}_hints`)
              .split(/[;\n]/)
              .map((h) => h.trim())
              .filter(Boolean),
          });
        }
      }
      return problem;
    })
    .filter((p) => p.name);
}

export async function parseUploadedFile(file) {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop();

  if (ext === "html" || ext === "htm") {
    const text = await file.text();
    return { mode: "visualization", html: text };
  }

  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const problems = parseExcel(workbook);
    return { mode: problems.length > 1 ? "multi" : "single", problems };
  }

  const text = await file.text();
  const hasSeparators =
    /\n---+\n/.test(text) || (text.match(/^# Problem[:\s]/gm) || []).length > 1;
  const multiH1 =
    (
      text.match(
        /^# (?!.*(?:Brute|Better|Optimal|Intuition|Algorithm|Code|Hint|Description|Explanation|Step))/gm,
      ) || []
    ).length > 1;

  if (hasSeparators || multiH1) {
    const problems = parseMultiProblem(text);
    return { mode: problems.length > 1 ? "multi" : "single", problems };
  }

  const problem = parseSingleProblem(text);
  return { mode: "single", problems: [problem] };
}
