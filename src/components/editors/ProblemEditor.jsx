import { useState, useEffect } from 'react';
import {
  Plus, X, Save, Upload, CheckCircle2, Lightbulb, List, Code2, Eye,
  Target, Info, Layers, FileText,
} from 'lucide-react';
import {
  Modal, Button, TextInput, TextArea, Select, FieldLabel, IconButton,
} from '@/components/ui/Primitives';
import { STATUSES } from '@/lib/constants';
import { parseUploadedFile } from '@/lib/parser';

const APPROACH_COLORS = {
  'Brute Force': { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
  'Better':      { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)' },
  'Optimal':     { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)' },
};

const SOL_FIELDS = [
  { key: 'intuition', label: 'Intuition', icon: Lightbulb, color: '#fbbf24' },
{ key: 'in_depth_intuition', label: 'Step-by-Step', icon: Layers, color: '#a78bfa' },  { key: 'algorithm', label: 'Algorithm', icon: List, color: '#4f8ff7' },
  { key: 'code', label: 'Code', icon: Code2, color: '#c084fc' },
  { key: 'visualization_html', label: 'Visualization', icon: Eye, color: '#34d399' },
  { key: 'hints', label: 'Hints', icon: Target, color: '#f87171' },
];

function emptyProblem() {
  return {
    name: '', difficulty: 'Medium', leetcode_url: '', gfg_url: '',
    status: 'todo', description: '', in_depth_explanation: '', notes: '', youtube_url: '',
    solutions: [emptySolution('Brute Force')],
  };
}

function emptySolution(type = 'Brute Force') {
  return {
    approach_type: type, intuition: '', in_depth_intuition: '', algorithm: '',
    code: '', language: 'java', time_complexity: '', space_complexity: '',
    visualization_html: '', hints: [''],
  };
}

export default function ProblemEditor({ open, onClose, onSave, initial, saving }) {
  const [prob, setProb] = useState(null);
  const [solIdx, setSolIdx] = useState(0);
  const [field, setField] = useState('intuition');
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    if (open) {
      if (initial) {
        // Convert from DB format: hints are objects with {text}
        const copy = JSON.parse(JSON.stringify(initial));
        (copy.solutions || []).forEach((s) => {
          if (s.hints) {
            s.hints = s.hints.map((h) => (typeof h === 'string' ? h : h.text || ''));
          } else {
            s.hints = [''];
          }
        });
        setProb(copy);
      } else {
        setProb(emptyProblem());
      }
      setSolIdx(0);
      setField('intuition');
      setUploadMsg('');
    }
  }, [open, initial]);

  if (!open || !prob) return null;

  const sol = prob.solutions[solIdx];

  const updateProb = (updates) => setProb({ ...prob, ...updates });
  const updateSol = (key, value) => {
    const sols = [...prob.solutions];
    sols[solIdx] = { ...sols[solIdx], [key]: value };
    setProb({ ...prob, solutions: sols });
  };

  const addSolution = () => {
    const used = new Set(prob.solutions.map((s) => s.approach_type));
    const next = ['Brute Force', 'Better', 'Optimal'].find((t) => !used.has(t)) || 'Optimal';
    setProb({ ...prob, solutions: [...prob.solutions, emptySolution(next)] });
    setSolIdx(prob.solutions.length);
  };

  const removeSolution = (idx) => {
    if (prob.solutions.length <= 1) return;
    setProb({ ...prob, solutions: prob.solutions.filter((_, i) => i !== idx) });
    setSolIdx(Math.max(0, solIdx - 1));
  };

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm,.md,.txt,.markdown,.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const result = await parseUploadedFile(file);

        if (result.mode === 'visualization') {
          updateSol('visualization_html', result.html);
          showMsg('Loaded visualization HTML');
          return;
        }

        if (result.problems && result.problems.length > 0) {
          const parsed = result.problems[0]; // Single problem mode in editor
          const merged = { ...prob };

          // Merge top-level fields
          if (parsed.name && !merged.name) merged.name = parsed.name;
          if (parsed.description) merged.description = parsed.description;
          if (parsed.in_depth_explanation) merged.in_depth_explanation = parsed.in_depth_explanation;
          if (parsed.difficulty) merged.difficulty = parsed.difficulty;
          if (parsed.leetcode_url) merged.leetcode_url = parsed.leetcode_url;
          if (parsed.gfg_url) merged.gfg_url = parsed.gfg_url;
          if (parsed.notes) merged.notes = parsed.notes;

          // Merge solutions
          if (parsed.solutions && parsed.solutions.length > 0) {
            for (const ps of parsed.solutions) {
              const existIdx = merged.solutions.findIndex(
                (s) => s.approach_type === ps.approach_type
              );
              if (existIdx >= 0) {
                const existing = merged.solutions[existIdx];
                merged.solutions[existIdx] = {
                  ...existing,
                  ...Object.fromEntries(
                    Object.entries(ps).filter(([k, v]) => {
                      if (!v) return false;
                      if (Array.isArray(v) && v.length === 0) return false;
                      return true;
                    })
                  ),
                };
              } else {
                merged.solutions.push({
                  ...emptySolution(ps.approach_type),
                  ...ps,
                  hints: ps.hints?.length ? ps.hints : [''],
                });
              }
            }
          }

          setProb(merged);
          showMsg(`Parsed: ${parsed.solutions?.length || 0} approach(es)`);
        }
      } catch (err) {
        console.error('File parse error:', err);
        showMsg('Error parsing file');
      }
    };
    input.click();
  };

  const showMsg = (msg) => {
    setUploadMsg(msg);
    setTimeout(() => setUploadMsg(''), 3000);
  };

  const handleSave = () => {
    // Clean up hints: filter empty strings
    const cleaned = {
      ...prob,
      solutions: prob.solutions.map((s, i) => ({
        ...s,
        position: i,
        hints: (s.hints || []).filter((h) => h.trim()),
      })),
    };
    onSave(cleaned);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Problem' : 'New Problem'} wide>
      <div className="flex flex-col gap-4">
        {/* ─── Top-level fields ─── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Problem name</FieldLabel>
            <TextInput value={prob.name} onChange={(v) => updateProb({ name: v })} placeholder="Two Sum, LRU Cache..." />
          </div>
          <div className="flex gap-2.5">
            <div className="flex-1">
              <FieldLabel>Difficulty</FieldLabel>
              <Select value={prob.difficulty} onChange={(v) => updateProb({ difficulty: v })} options={['Easy', 'Medium', 'Hard']} />
            </div>
            <div className="flex-1">
              <FieldLabel>Status</FieldLabel>
              <Select value={prob.status} onChange={(v) => updateProb({ status: v })} options={STATUSES.map((s) => ({ value: s.key, label: s.label }))} />
            </div>
          </div>
        </div>

       <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel>LeetCode URL</FieldLabel>
            <TextInput value={prob.leetcode_url} onChange={(v) => updateProb({ leetcode_url: v })} placeholder="https://leetcode.com/..." />
          </div>
          <div>
            <FieldLabel>GFG URL</FieldLabel>
            <TextInput value={prob.gfg_url} onChange={(v) => updateProb({ gfg_url: v })} placeholder="https://geeksforgeeks.org/..." />
          </div>
          <div>
            <FieldLabel>YouTube URL</FieldLabel>
            <TextInput value={prob.youtube_url} onChange={(v) => updateProb({ youtube_url: v })} placeholder="https://youtube.com/watch?v=..." />
          </div>
        </div>
 

        <div>
          <FieldLabel>Problem description</FieldLabel>
          <TextArea value={prob.description} onChange={(v) => updateProb({ description: v })} rows={3} placeholder="What does the problem ask? Input/output format, constraints..." />
        </div>

        <div>
          <FieldLabel>In-depth explanation (what to do & why)</FieldLabel>
          <TextArea value={prob.in_depth_explanation} onChange={(v) => updateProb({ in_depth_explanation: v })} rows={3} placeholder="Detailed explanation of the problem, edge cases, what approach to think about..." />
        </div>

        {/* ─── Solutions ─── */}
        <div className="border-t border-border-1 pt-4">
          <div className="flex items-center justify-between mb-3">
            <FieldLabel>Solution approaches</FieldLabel>
            <div className="flex gap-2 items-center">
              {uploadMsg && (
                <span className="text-2xs text-accent-green flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 size={12} /> {uploadMsg}
                </span>
              )}
              <Button onClick={handleFileUpload} variant="ghost" className="text-xs">
                <Upload size={12} /> Upload file
              </Button>
              <Button onClick={addSolution} variant="ghost" className="text-xs">
                <Plus size={12} /> Add approach
              </Button>
            </div>
          </div>

          {/* Approach tabs */}
          <div className="flex gap-1 mb-3.5">
            {prob.solutions.map((s, i) => {
              const c = APPROACH_COLORS[s.approach_type] || APPROACH_COLORS.Optimal;
              const active = i === solIdx;
              return (
                <div
                  key={i}
                  onClick={() => setSolIdx(i)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold transition-all"
                  style={{
                    background: active ? c.bg : 'transparent',
                    color: active ? c.color : '#4e4e58',
                    border: `1px solid ${active ? c.border : 'transparent'}`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color, opacity: active ? 1 : 0.4 }} />
                  {s.approach_type}
                  {prob.solutions.length > 1 && (
                    <X size={11} className="opacity-50 hover:opacity-100 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); removeSolution(i); }} />
                  )}
                </div>
              );
            })}
          </div>

          {sol && (
            <>
              {/* Solution meta */}
              <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                <div>
                  <FieldLabel>Type</FieldLabel>
                  <Select value={sol.approach_type} onChange={(v) => updateSol('approach_type', v)} options={['Brute Force', 'Better', 'Optimal']} />
                </div>
                <div>
                  <FieldLabel>Time complexity</FieldLabel>
                  <TextInput value={sol.time_complexity} onChange={(v) => updateSol('time_complexity', v)} placeholder="O(n^2)" mono />
                </div>
                <div>
                  <FieldLabel>Space complexity</FieldLabel>
                  <TextInput value={sol.space_complexity} onChange={(v) => updateSol('space_complexity', v)} placeholder="O(n)" mono />
                </div>
              </div>

              {/* Field tabs */}
              <div className="flex gap-px mb-3.5 border-b border-border-1">
                {SOL_FIELDS.map((f) => {
                  const Icon = f.icon;
                  const active = field === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setField(f.key)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans border-none cursor-pointer transition-all -mb-px"
                      style={{
                        background: 'transparent',
                        color: active ? f.color : '#4e4e58',
                        fontWeight: active ? 600 : 400,
                        borderBottom: active ? `2px solid ${f.color}` : '2px solid transparent',
                      }}
                    >
                      <Icon size={12} /> {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Field content */}
              {field === 'hints' ? (
                <div className="flex flex-col gap-2">
                  {(sol.hints || ['']).map((h, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-2xs text-ink-4 font-semibold min-w-[14px]">{i + 1}.</span>
                      <TextInput
                        value={h}
                        onChange={(v) => {
                          const hs = [...(sol.hints || [''])];
                          hs[i] = v;
                          updateSol('hints', hs);
                        }}
                        placeholder={`Hint ${i + 1}...`}
                      />
                      {i === (sol.hints || ['']).length - 1 && (
                        <IconButton icon={Plus} onClick={() => updateSol('hints', [...(sol.hints || ['']), ''])} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <TextArea
                  value={sol[field] || ''}
                  onChange={(v) => updateSol(field, v)}
                  rows={field === 'code' ? 14 : field === 'visualization_html' ? 10 : 8}
                  mono={field === 'code' || field === 'visualization_html'}
                  placeholder={
                    field === 'code' ? 'Paste solution code here...'
                    : field === 'visualization_html' ? 'Paste HTML for interactive visualization or upload .html file...'
                    : field === 'intuition' ? 'Write the core intuition in markdown...'
                    : field === 'in_depth_intuition' ? 'Deep dive into why this approach works, with examples...'
                    : field === 'algorithm' ? 'Write pseudocode or step-by-step algorithm...'
                    : `Write ${field} content in markdown...`
                  }
                />
              )}
            </>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border-1">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSave} variant="primary" disabled={!prob.name.trim() || saving}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══ BULK UPLOAD MODAL ═══
export function BulkUploadModal({ open, onClose, onUpload, uploading }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setPreview(null); setError(''); }
  }, [open]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');

    try {
      const result = await parseUploadedFile(file);
      if (result.mode === 'visualization') {
        setError('This file is a visualization HTML. Use the problem editor to add it to a specific solution.');
        return;
      }
      if (!result.problems || result.problems.length === 0) {
        setError('No problems found in the file. Check the format.');
        return;
      }
      setPreview(result.problems);
    } catch (err) {
      setError(`Parse error: ${err.message}`);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk Upload Problems" wide>
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Upload file</FieldLabel>
          <p className="text-xs text-ink-3 mb-3 leading-relaxed">
            Upload a markdown file with multiple problems separated by <code className="bg-white/5 px-1 rounded text-accent-purple font-mono text-2xs">---</code> or
            an Excel file where each row is a problem. Columns: name, difficulty, description,
            brute_intuition, brute_code, brute_time, optimal_intuition, etc.
          </p>
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-2 rounded-lg cursor-pointer hover:border-border-3 hover:bg-white/[0.02] transition-colors">
            <Upload size={24} className="text-ink-4 mb-2" />
            <span className="text-sm text-ink-3">Drop file here or click to browse</span>
            <span className="text-2xs text-ink-4 mt-1">.md, .html, .xlsx, .csv, .txt</span>
            <input type="file" className="hidden" accept=".md,.html,.htm,.xlsx,.xls,.csv,.txt,.markdown" onChange={handleFile} />
          </label>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-sm text-accent-red">
            {error}
          </div>
        )}

        {preview && (
          <div>
            <FieldLabel>Preview ({preview.length} problem{preview.length !== 1 ? 's' : ''} detected)</FieldLabel>
            <div className="max-h-60 overflow-y-auto border border-border-1 rounded-lg divide-y divide-border-1">
              {preview.map((p, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs font-mono text-ink-4 w-6">{i + 1}</span>
                  <span className="text-sm text-ink-1 font-medium flex-1">{p.name || '(unnamed)'}</span>
                  <span className="text-2xs text-ink-3">{p.difficulty}</span>
                  <span className="text-2xs text-ink-4">{p.solutions?.length || 0} solutions</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border-1">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button
            onClick={() => onUpload(preview)}
            variant="primary"
            disabled={!preview || preview.length === 0 || uploading}
          >
            <Upload size={13} /> {uploading ? 'Uploading...' : `Upload ${preview?.length || 0} problem(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══ ADD TOPIC / SUBTOPIC MODAL ═══
export function AddNodeModal({ open, onClose, onSave, type, saving }) {
  const [name, setName] = useState('');

  useEffect(() => { if (open) setName(''); }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={`Add ${type}`}>
      <FieldLabel>{type} name</FieldLabel>
      <TextInput
        value={name}
        onChange={setName}
        placeholder={type === 'topic' ? 'Graphs, DP, Trees...' : 'Shortest Path, BFS/DFS...'}
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onClose} variant="secondary">Cancel</Button>
        <Button onClick={() => onSave(name)} variant="primary" disabled={!name.trim() || saving}>
          <Plus size={13} /> {saving ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </Modal>
  );
}
