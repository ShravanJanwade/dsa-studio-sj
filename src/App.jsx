import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ProblemView from '@/components/ProblemView';
import ProblemEditor, { BulkUploadModal, AddNodeModal } from '@/components/editors/ProblemEditor';
import {
  supabase, fetchFullTree, fetchProblemFull, createTopic, createSubtopic,
  createProblem, updateProblem, updateProblemStatus, updateProblemNotes,
  bulkCreateProblems, deleteProblem, deleteTopic, deleteSubtopic,
  reorderTopics, reorderSubtopics, reorderProblems,
  updateVideoTimestamp, updateVideoNotes,
} from '@/lib/supabase';
import { STATUSES } from '@/lib/constants';
import { Zap, AlertCircle, RefreshCcw } from 'lucide-react';

export default function App() {
  // ─── State ───
  const [topics, setTopics] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // Only for first load
  const [error, setError] = useState(null);

  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selPath, setSelPath] = useState({ topicId: null, subId: null });

  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [expandedSubs, setExpandedSubs] = useState(new Set());
  const [search, setSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInit, setEditorInit] = useState(null);
  const [saving, setSaving] = useState(false);

  const [addNodeModal, setAddNodeModal] = useState({ open: false, type: '', topicId: null });
  const [bulkModal, setBulkModal] = useState({ open: false, topicId: null, subId: null });
  const [uploading, setUploading] = useState(false);

  // Notes debounce ref
  const notesTimer = useRef(null);
  const videoTimerRef = useRef(null);

  // ─── Silent tree refresh (no spinner) ───
  const refreshTree = useCallback(async () => {
    try {
      const tree = await fetchFullTree();
      setTopics(tree);
    } catch (e) {
      console.error('Refresh failed:', e);
    }
  }, []);

  // ─── Initial load (shows spinner only once) ───
  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const tree = await fetchFullTree();
        setTopics(tree);
        if (tree.length > 0) {
          setExpandedTopics(new Set([tree[0].id]));
          if (tree[0].subtopics?.length > 0) {
            setExpandedSubs(new Set([tree[0].subtopics[0].id]));
          }
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  // ─── Load selected problem details ───
  useEffect(() => {
    if (!selectedProblemId) { setSelectedProblem(null); return; }
    let cancelled = false;
    (async () => {
      const full = await fetchProblemFull(selectedProblemId);
      if (!cancelled) setSelectedProblem(full);
    })();
    return () => { cancelled = true; };
  }, [selectedProblemId]);

  // ─── Stats (computed from local state — instant) ───
  const stats = useMemo(() => {
    let total = 0, todo = 0, inProgress = 0, revision = 0, completed = 0;
    topics.forEach((t) =>
      (t.subtopics || []).forEach((s) =>
        (s.problems || []).forEach((p) => {
          total++;
          if (p.status === 'completed') completed++;
          else if (p.status === 'revision') revision++;
          else if (p.status === 'inProgress') inProgress++;
          else todo++;
        })
      )
    );
    return {
      total,
      pct: total ? Math.round((completed / total) * 100) : 0,
      todo, inProgress, revision, completed,
    };
  }, [topics]);

  // ─── Helper: update a problem in local topic tree ───
  const updateLocalProblem = useCallback((problemId, updates) => {
    setTopics((prev) => prev.map((t) => ({
      ...t,
      subtopics: (t.subtopics || []).map((s) => ({
        ...s,
        problems: (s.problems || []).map((p) =>
          p.id === problemId ? { ...p, ...updates } : p
        ),
      })),
    })));
  }, []);

  // ─── Helper: remove a problem from local tree ───
  const removeLocalProblem = useCallback((problemId) => {
    setTopics((prev) => prev.map((t) => ({
      ...t,
      subtopics: (t.subtopics || []).map((s) => ({
        ...s,
        problems: (s.problems || []).filter((p) => p.id !== problemId),
      })),
    })));
  }, []);

  // ─── Helper: remove a subtopic from local tree ───
  const removeLocalSubtopic = useCallback((subId) => {
    setTopics((prev) => prev.map((t) => ({
      ...t,
      subtopics: (t.subtopics || []).filter((s) => s.id !== subId),
    })));
  }, []);

  // ─── Helper: remove a topic from local tree ───
  const removeLocalTopic = useCallback((topicId) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  }, []);

  // ─── Handlers ───
  const toggleTopic = (id) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSub = (id) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectProblem = (problemId, topicId, subId) => {
    setSelectedProblemId(problemId);
    setSelPath({ topicId, subId });
  };

  const handleAddTopic = () => {
    setAddNodeModal({ open: true, type: 'topic', topicId: null });
  };

  const handleAddSubtopic = (topicId) => {
    setAddNodeModal({ open: true, type: 'subtopic', topicId });
  };

  const handleAddProblem = (topicId, subId) => {
    setSelPath({ topicId, subId });
    setEditorInit(null);
    setEditorOpen(true);
  };

  const handleEditProblem = () => {
    if (selectedProblem) {
      setEditorInit(selectedProblem);
      setEditorOpen(true);
    }
  };

  // ─── Save node: add topic/subtopic ───
  const handleSaveNode = async (name) => {
    setSaving(true);
    try {
      if (addNodeModal.type === 'topic') {
        const created = await createTopic(name);
        if (created) {
          // Optimistic: add to local state immediately
          setTopics((prev) => [...prev, { ...created, subtopics: [] }]);
          setExpandedTopics((prev) => new Set([...prev, created.id]));
        }
      } else {
        const created = await createSubtopic(addNodeModal.topicId, name);
        if (created) {
          // Optimistic: add subtopic to correct topic
          setTopics((prev) => prev.map((t) =>
            t.id === addNodeModal.topicId
              ? { ...t, subtopics: [...(t.subtopics || []), { ...created, problems: [] }] }
              : t
          ));
          setExpandedSubs((prev) => new Set([...prev, created.id]));
        }
      }
    } finally {
      setSaving(false);
      setAddNodeModal({ open: false, type: '', topicId: null });
    }
  };

  // ─── Save problem ───
  const handleSaveProblem = async (probData) => {
    setSaving(true);
    try {
      const { solutions, ...fields } = probData;
      const dbSolutions = (solutions || []).map((s) => ({
        ...s,
        hints: (s.hints || []).filter((h) => h.trim()),
      }));

      let result;
      if (editorInit?.id) {
        result = await updateProblem(editorInit.id, { ...fields, solutions: dbSolutions });
      } else {
        result = await createProblem(selPath.subId, { ...fields, solutions: dbSolutions });
      }

      if (result) {
        setSelectedProblemId(result.id);
        setSelectedProblem(result);
      }
      // Silent refresh to sync sidebar
      refreshTree();
    } finally {
      setSaving(false);
      setEditorOpen(false);
    }
  };

  // ─── Status change: OPTIMISTIC — instant UI update ───
  const handleStatusChange = async (status) => {
    if (!selectedProblem) return;
    // 1. Update local state immediately (no spinner, no reload)
    setSelectedProblem((prev) => ({ ...prev, status }));
    updateLocalProblem(selectedProblem.id, { status });
    // 2. Persist to DB in background
    updateProblemStatus(selectedProblem.id, status);
  };

  // ─── Notes: DEBOUNCED — updates locally instantly, saves after 800ms pause ───
  const handleNotesChange = (notes) => {
    if (!selectedProblem) return;
    // Update local state immediately
    setSelectedProblem((prev) => ({ ...prev, notes }));
    // Debounce the DB save
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      updateProblemNotes(selectedProblem.id, notes);
    }, 800);
  };
    // Video notes — save immediately (small data)
  const handleVideoNotesChange = (videoNotes) => {
    if (!selectedProblem) return;
    setSelectedProblem((prev) => ({ ...prev, video_notes: videoNotes }));
    updateVideoNotes(selectedProblem.id, videoNotes);
  };
 
  // Video timestamp — ONLY persist to DB, NO state update (avoids re-render which kills video)
  const handleVideoTimestampChange = useCallback((timestamp) => {
    if (!selectedProblem) return;
    clearTimeout(videoTimerRef.current);
    videoTimerRef.current = setTimeout(() => {
      updateVideoTimestamp(selectedProblem.id, timestamp);
    }, 5000);
  }, [selectedProblem]);
 

  // ─── Bulk upload ───
  const handleBulkUpload = (topicId, subId) => {
    setBulkModal({ open: true, topicId, subId });
  };

  const handleBulkSubmit = async (problems) => {
    setUploading(true);
    try {
      await bulkCreateProblems(bulkModal.subId, problems);
      // Silent refresh
      await refreshTree();
    } finally {
      setUploading(false);
      setBulkModal({ open: false, topicId: null, subId: null });
    }
  };

  // ─── Delete: OPTIMISTIC — remove from UI first, then DB ───
  const handleDeleteTopic = async (topicId) => {
    removeLocalTopic(topicId);
    if (selPath.topicId === topicId) { setSelectedProblemId(null); setSelectedProblem(null); }
    deleteTopic(topicId);
  };

  const handleDeleteSubtopic = async (subId) => {
    removeLocalSubtopic(subId);
    if (selPath.subId === subId) { setSelectedProblemId(null); setSelectedProblem(null); }
    deleteSubtopic(subId);
  };

  const handleDeleteProblem = async (problemId) => {
    removeLocalProblem(problemId);
    if (selectedProblemId === problemId) { setSelectedProblemId(null); setSelectedProblem(null); }
    deleteProblem(problemId);
  };

  // ─── Reorder: OPTIMISTIC — reorder locally, then persist ───
  const handleReorderTopics = (orderedIds) => {
    setTopics((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));
      return orderedIds.map((id) => map.get(id)).filter(Boolean);
    });
    reorderTopics(orderedIds); // fire-and-forget
  };

  const handleReorderSubtopics = (topicId, orderedIds) => {
    setTopics((prev) => prev.map((t) => {
      if (t.id !== topicId) return t;
      const map = new Map((t.subtopics || []).map((s) => [s.id, s]));
      return { ...t, subtopics: orderedIds.map((id) => map.get(id)).filter(Boolean) };
    }));
    reorderSubtopics(topicId, orderedIds); // fire-and-forget
  };

  const handleReorderProblems = (subtopicId, orderedIds) => {
    setTopics((prev) => prev.map((t) => ({
      ...t,
      subtopics: (t.subtopics || []).map((s) => {
        if (s.id !== subtopicId) return s;
        const map = new Map((s.problems || []).map((p) => [p.id, p]));
        return { ...s, problems: orderedIds.map((id) => map.get(id)).filter(Boolean) };
      }),
    })));
    reorderProblems(subtopicId, orderedIds); // fire-and-forget
  };

  // ─── No Supabase connection state ───
  if (!supabase) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-0 text-ink-1 font-sans">
        <div className="max-w-md text-center px-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f8ff7, #a78bfa)' }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1 className="text-2xl font-extrabold mb-3 -tracking-[0.03em]">DSA Studio</h1>
          <p className="text-sm text-ink-3 mb-6 leading-relaxed">
            Connect to Supabase to get started. Create a <code className="bg-white/5 px-1.5 py-0.5 rounded text-accent-purple font-mono text-xs">.env</code> file
            from <code className="bg-white/5 px-1.5 py-0.5 rounded text-accent-purple font-mono text-xs">.env.example</code> with
            your Supabase project URL and anon key.
          </p>
          <div className="bg-surface-2 rounded-lg p-5 text-left">
            <div className="text-2xs text-ink-4 font-semibold uppercase tracking-wider mb-3">Setup steps</div>
            <ol className="text-sm text-ink-3 space-y-2">
              <li className="flex gap-2">
                <span className="text-accent-blue font-mono font-bold text-xs">1.</span>
                Create a Supabase project at supabase.com
              </li>
              <li className="flex gap-2">
                <span className="text-accent-blue font-mono font-bold text-xs">2.</span>
                Run <code className="bg-white/5 px-1 rounded text-accent-purple font-mono text-2xs">supabase-schema.sql</code> in SQL Editor
              </li>
              <li className="flex gap-2">
                <span className="text-accent-blue font-mono font-bold text-xs">3.</span>
                Copy <code className="bg-white/5 px-1 rounded text-accent-purple font-mono text-2xs">.env.example</code> → <code className="bg-white/5 px-1 rounded text-accent-purple font-mono text-2xs">.env</code> with your keys
              </li>
              <li className="flex gap-2">
                <span className="text-accent-blue font-mono font-bold text-xs">4.</span>
                Run <code className="bg-white/5 px-1 rounded text-accent-purple font-mono text-2xs">npm run dev</code>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // ─── Initial loading spinner (shows ONLY on first load) ───
  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-0 text-ink-1 font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm text-ink-3">Loading your problems...</div>
        </div>
      </div>
    );
  }

  // ─── Error state ───
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-0 text-ink-1 font-sans">
        <div className="text-center max-w-sm">
          <AlertCircle size={32} className="text-accent-red mx-auto mb-3 opacity-60" />
          <div className="text-base font-semibold mb-2">Connection Error</div>
          <div className="text-sm text-ink-3 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-surface-3 border border-border-2 text-sm text-ink-2 cursor-pointer font-sans"
          >
            <RefreshCcw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Main layout ───
  return (
    <div className="h-screen flex bg-surface-1 text-ink-1 font-sans overflow-hidden">
      <Sidebar
        topics={topics}
        selectedProblemId={selectedProblemId}
        onSelectProblem={handleSelectProblem}
        onAddTopic={handleAddTopic}
        onAddSubtopic={handleAddSubtopic}
        onAddProblem={handleAddProblem}
        expandedTopics={expandedTopics}
        expandedSubs={expandedSubs}
        toggleTopic={toggleTopic}
        toggleSub={toggleSub}
        search={search}
        setSearch={setSearch}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        stats={stats}
        onBulkUpload={handleBulkUpload}
        onDeleteTopic={handleDeleteTopic}
        onDeleteSubtopic={handleDeleteSubtopic}
        onDeleteProblem={handleDeleteProblem}
        onReorderTopics={handleReorderTopics}
        onReorderSubtopics={handleReorderSubtopics}
        onReorderProblems={handleReorderProblems}
      />

       <ProblemView
        problem={selectedProblem}
        onEdit={handleEditProblem}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
        onVideoNotesChange={handleVideoNotesChange}
        onVideoTimestampChange={handleVideoTimestampChange}
      />


      <ProblemEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveProblem}
        initial={editorInit}
        saving={saving}
      />

      <AddNodeModal
        open={addNodeModal.open}
        onClose={() => setAddNodeModal({ open: false, type: '', topicId: null })}
        onSave={handleSaveNode}
        type={addNodeModal.type}
        saving={saving}
      />

      <BulkUploadModal
        open={bulkModal.open}
        onClose={() => setBulkModal({ open: false, topicId: null, subId: null })}
        onUpload={handleBulkSubmit}
        uploading={uploading}
      />
    </div>
  );
}