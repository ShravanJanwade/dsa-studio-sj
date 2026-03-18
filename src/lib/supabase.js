import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase credentials missing. Create a .env file from .env.example.\n" +
      "The app will show empty state until connected.",
  );
}

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ═══ TOPICS ═══
export async function fetchTopics() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("position", { ascending: true });
  if (error) {
    console.error("fetchTopics:", error);
    return [];
  }
  return data;
}

export async function createTopic(name, icon = "folder") {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("topics")
    .insert({ name, icon })
    .select()
    .single();
  if (error) {
    console.error("createTopic:", error);
    return null;
  }
  return data;
}

export async function updateTopic(id, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("topics")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("updateTopic:", error);
    return null;
  }
  return data;
}

export async function deleteTopic(id) {
  if (!supabase) return false;
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) {
    console.error("deleteTopic:", error);
    return false;
  }
  return true;
}

// ═══ SUBTOPICS ═══
export async function fetchSubtopics(topicId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("subtopics")
    .select("*")
    .eq("topic_id", topicId)
    .order("position", { ascending: true });
  if (error) {
    console.error("fetchSubtopics:", error);
    return [];
  }
  return data;
}

export async function createSubtopic(topicId, name) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("subtopics")
    .insert({ topic_id: topicId, name })
    .select()
    .single();
  if (error) {
    console.error("createSubtopic:", error);
    return null;
  }
  return data;
}

export async function deleteSubtopic(id) {
  if (!supabase) return false;
  const { error } = await supabase.from("subtopics").delete().eq("id", id);
  if (error) {
    console.error("deleteSubtopic:", error);
    return false;
  }
  return true;
}

// ═══ PROBLEMS ═══
export async function fetchProblems(subtopicId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("subtopic_id", subtopicId)
    .order("position", { ascending: true });
  if (error) {
    console.error("fetchProblems:", error);
    return [];
  }
  return data;
}

export async function fetchProblemFull(problemId) {
  if (!supabase) return null;
  const { data: problem, error: pErr } = await supabase
    .from("problems")
    .select("*")
    .eq("id", problemId)
    .single();
  if (pErr) {
    console.error("fetchProblemFull:", pErr);
    return null;
  }

  const { data: solutions, error: sErr } = await supabase
    .from("solutions")
    .select("*")
    .eq("problem_id", problemId)
    .order("position", { ascending: true });
  if (sErr) {
    console.error("fetchSolutions:", sErr);
    return null;
  }

  // Fetch hints for each solution
  for (const sol of solutions) {
    const { data: hints, error: hErr } = await supabase
      .from("hints")
      .select("*")
      .eq("solution_id", sol.id)
      .order("position", { ascending: true });
    sol.hints = hErr ? [] : hints;
  }

  return { ...problem, solutions };
}

export async function createProblem(subtopicId, problemData) {
  if (!supabase) return null;
  const { solutions, ...probFields } = problemData;

  const { data: problem, error: pErr } = await supabase
    .from("problems")
    .insert({ subtopic_id: subtopicId, ...probFields })
    .select()
    .single();
  if (pErr) {
    console.error("createProblem:", pErr);
    return null;
  }

  if (solutions && solutions.length > 0) {
    for (let i = 0; i < solutions.length; i++) {
      const { hints, ...solFields } = solutions[i];
      const { data: sol, error: sErr } = await supabase
        .from("solutions")
        .insert({ problem_id: problem.id, position: i, ...solFields })
        .select()
        .single();
      if (sErr) {
        console.error("createSolution:", sErr);
        continue;
      }

      if (hints && hints.length > 0) {
        const hintRows = hints
          .filter((h) => (typeof h === "string" ? h.trim() : h.text?.trim()))
          .map((h, j) => ({
            solution_id: sol.id,
            text: typeof h === "string" ? h : h.text,
            position: j,
          }));
        if (hintRows.length > 0) {
          await supabase.from("hints").insert(hintRows);
        }
      }
    }
  }

  return fetchProblemFull(problem.id);
}

export async function updateProblem(problemId, problemData) {
  if (!supabase) return null;
  const { solutions, ...probFields } = problemData;

  const { error: pErr } = await supabase
    .from("problems")
    .update(probFields)
    .eq("id", problemId);
  if (pErr) {
    console.error("updateProblem:", pErr);
    return null;
  }

  if (solutions) {
    // Delete old solutions (cascade deletes hints)
    await supabase.from("solutions").delete().eq("problem_id", problemId);

    for (let i = 0; i < solutions.length; i++) {
      const { hints, id: _ignore, ...solFields } = solutions[i];
      const { data: sol, error: sErr } = await supabase
        .from("solutions")
        .insert({ problem_id: problemId, position: i, ...solFields })
        .select()
        .single();
      if (sErr) continue;

      if (hints && hints.length > 0) {
        const hintRows = hints
          .filter((h) => (typeof h === "string" ? h : h.text || "").trim())
          .map((h, j) => ({
            solution_id: sol.id,
            text: typeof h === "string" ? h : h.text,
            position: j,
          }));
        if (hintRows.length > 0) {
          await supabase.from("hints").insert(hintRows);
        }
      }
    }
  }

  return fetchProblemFull(problemId);
}

export async function updateProblemStatus(problemId, status) {
  if (!supabase) return false;
  const { error } = await supabase
    .from("problems")
    .update({ status })
    .eq("id", problemId);
  return !error;
}

export async function updateProblemNotes(problemId, notes) {
  if (!supabase) return false;
  const { error } = await supabase
    .from("problems")
    .update({ notes })
    .eq("id", problemId);
  return !error;
}

export async function deleteProblem(id) {
  if (!supabase) return false;
  const { error } = await supabase.from("problems").delete().eq("id", id);
  return !error;
}

// ═══ BULK CREATE (for file upload with multiple problems) ═══
export async function bulkCreateProblems(subtopicId, problemsArray) {
  if (!supabase) return [];
  const results = [];
  for (const prob of problemsArray) {
    const created = await createProblem(subtopicId, prob);
    if (created) results.push(created);
  }
  return results;
}

// ═══ FULL TREE FETCH (for sidebar) ═══
export async function fetchFullTree() {
  if (!supabase) return [];
  const topics = await fetchTopics();
  for (const topic of topics) {
    topic.subtopics = await fetchSubtopics(topic.id);
    for (const sub of topic.subtopics) {
      sub.problems = await fetchProblems(sub.id);
    }
  }
  return topics;
}
// ═══════════════════════════════════════════════
// ADD THESE FUNCTIONS TO THE END OF src/lib/supabase.js
// ═══════════════════════════════════════════════

// ═══ REORDER ═══
export async function reorderTopics(orderedIds) {
  if (!supabase) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("topics")
      .update({ position: i })
      .eq("id", orderedIds[i]);
  }
  return true;
}

export async function reorderSubtopics(topicId, orderedIds) {
  if (!supabase) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("subtopics")
      .update({ position: i })
      .eq("id", orderedIds[i]);
  }
  return true;
}

export async function reorderProblems(subtopicId, orderedIds) {
  if (!supabase) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("problems")
      .update({ position: i })
      .eq("id", orderedIds[i]);
  }
  return true;
}

// ═══ UPDATE YOUTUBE URL ═══
export async function updateProblemYoutube(problemId, youtubeUrl) {
  if (!supabase) return false;
  const { error } = await supabase
    .from("problems")
    .update({ youtube_url: youtubeUrl })
    .eq("id", problemId);
  return !error;
}
export async function updateVideoTimestamp(problemId, timestamp) {
  if (!supabase) return;
  await supabase
    .from("problems")
    .update({ video_timestamp: timestamp })
    .eq("id", problemId);
}

export async function updateVideoNotes(problemId, videoNotes) {
  if (!supabase) return;
  await supabase
    .from("problems")
    .update({ video_notes: videoNotes })
    .eq("id", problemId);
}
