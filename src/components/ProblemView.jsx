import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen, PenTool, BarChart3, Edit2, ExternalLink, ArrowUpRight,
  Lightbulb, List, Eye, Code2, Info, Layers, Footprints,
  Youtube, Maximize2, Minimize2, X, SplitSquareHorizontal, PanelLeftClose,
  ChevronLeft, ChevronRight, Keyboard, Sparkles, Zap,
} from 'lucide-react';
import { IconButton, DifficultyBadge, Select } from '@/components/ui/Primitives';
import CodePanel from '@/components/panels/CodePanel';
import MarkdownRenderer from '@/components/panels/MarkdownRenderer';
import { InterviewTimer, VizPanel, HintsPanel, ComplexityChart } from '@/components/panels/Widgets';
import VideoPlayer from '@/components/panels/VideoPlayer';
import DrawingCanvas from '@/components/panels/DrawingCanvas';
import DSTemplates from '@/components/panels/DSTemplates';
import { STATUSES, APPROACHES } from '@/lib/constants';
import VizSection from '@/components/viz-engine/VizSection';

// ═══ TAB DEFINITIONS ═══
const TABS = [
  { key: 'video', label: 'Video', icon: Youtube, shortcut: '1', color: '#f87171' },
  { key: 'problem', label: 'Problem', icon: BookOpen, shortcut: '2', color: '#4f8ff7' },
  { key: 'intuition', label: 'Intuition', icon: Lightbulb, shortcut: '3', color: '#fbbf24' },
  { key: 'steps', label: 'Steps', icon: Footprints, shortcut: '4', color: '#a78bfa' },
  { key: 'algorithm', label: 'Algorithm', icon: List, shortcut: '5', color: '#4f8ff7' },
  { key: 'code', label: 'Code', icon: Code2, shortcut: '6', color: '#34d399' },
  { key: 'dryrun', label: 'Dry Run', icon: Eye, shortcut: '7', color: '#a78bfa' },
  { key: 'notes', label: 'Notes', icon: PenTool, shortcut: '8', color: '#fb923c' },
  { key: 'complexity', label: 'Complexity', icon: BarChart3, shortcut: '9', color: '#22d3ee' },
];

// ═══ MAIN PROBLEM VIEW ═══
export default function ProblemView({
  problem, onEdit, onStatusChange, onNotesChange,
  onVideoNotesChange, onVideoTimestampChange,
}) {
  const [solIdx, setSolIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('video');
  const [canvasAPI, setCanvasAPI] = useState(null);
  const [prevTab, setPrevTab] = useState(null);
  const [animDir, setAnimDir] = useState('right');
  const contentRef = useRef(null);

  // Reset when problem changes
  useEffect(() => {
    setSolIdx(0);
    setActiveTab('video');
  }, [problem?.id]);

  // Keyboard shortcut: 1-9 for tabs, [ ] for prev/next
  useEffect(() => {
    const handler = (e) => {
      // Don't capture if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (!problem) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && num <= TABS.length) {
        e.preventDefault();
        switchTab(TABS[num - 1].key);
        return;
      }
      if (e.key === '[') {
        e.preventDefault();
        const idx = TABS.findIndex((t) => t.key === activeTab);
        if (idx > 0) switchTab(TABS[idx - 1].key);
      }
      if (e.key === ']') {
        e.preventDefault();
        const idx = TABS.findIndex((t) => t.key === activeTab);
        if (idx < TABS.length - 1) switchTab(TABS[idx + 1].key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, problem]);

  const switchTab = useCallback((key) => {
    const oldIdx = TABS.findIndex((t) => t.key === activeTab);
    const newIdx = TABS.findIndex((t) => t.key === key);
    setAnimDir(newIdx > oldIdx ? 'right' : 'left');
    setPrevTab(activeTab);
    setActiveTab(key);
  }, [activeTab]);

  // ═══ EMPTY STATE ═══
  if (!problem) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(79,143,247,0.06), rgba(167,139,250,0.06))' }}>
            <Sparkles size={36} className="opacity-25" />
          </div>
          <div className="text-xl text-ink-3 font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>DSA Studio</div>
          <div className="text-sm text-ink-4 mb-6 max-w-xs mx-auto leading-relaxed">
            Select a problem from the sidebar to start studying. Use keyboard shortcuts for fast navigation.
          </div>
          <div className="flex flex-col gap-2 text-xs text-ink-5">
            <div className="flex items-center justify-center gap-2">
              <kbd style={kbdStyle}>1</kbd>-<kbd style={kbdStyle}>9</kbd>
              <span>Switch tabs</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <kbd style={kbdStyle}>[</kbd><kbd style={kbdStyle}>]</kbd>
              <span>Prev / Next tab</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const solutions = problem.solutions || [];
  const sol = solutions[solIdx];
  const activeTabObj = TABS.find((t) => t.key === activeTab);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: '#0c0c0f' }}>
      {/* ─── HEADER BAR ─── */}
      <div style={{
        padding: '12px 24px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
        flexShrink: 0,
      }}>
        {/* Problem title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <h1 style={{
              fontSize: 20, fontWeight: 800, color: '#fafaf9',
              letterSpacing: '-0.03em', margin: 0, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{problem.name}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Quick links */}
            <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
              {problem.leetcode_url && (
                <a href={problem.leetcode_url} target="_blank" rel="noopener noreferrer" style={linkStyle('#fb923c')}>
                  <ExternalLink size={10} /> LC
                </a>
              )}
              {problem.gfg_url && (
                <a href={problem.gfg_url} target="_blank" rel="noopener noreferrer" style={linkStyle('#34d399')}>
                  <ExternalLink size={10} /> GFG
                </a>
              )}
              {problem.youtube_url && (
                <a href={problem.youtube_url} target="_blank" rel="noopener noreferrer" style={linkStyle('#f87171')}>
                  <Youtube size={10} /> YT
                </a>
              )}
            </div>
            <Select
              value={problem.status}
              onChange={onStatusChange}
              options={STATUSES.map((s) => ({ value: s.key, label: s.label }))}
            />
            <InterviewTimer />
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />
            <IconButton icon={Edit2} onClick={onEdit} title="Edit problem" />
          </div>
        </div>

        {/* ─── TAB BAR ─── */}
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 1,
          marginBottom: -1, // overlap the bottom border
        }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                title={`${tab.label} (${tab.shortcut})`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: '8px 8px 0 0',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12.5, fontWeight: active ? 650 : 500,
                  background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
                  color: active ? tab.color : '#52525b',
                  position: 'relative', transition: 'all 0.15s',
                  borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#a1a1aa'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#52525b'; }}
              >
                <Icon size={13} style={{ opacity: active ? 1 : 0.6 }} />
                {tab.label}
                <span style={{
                  fontSize: 9, color: active ? tab.color : '#2a2a33',
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                  padding: '1px 4px', borderRadius: 3,
                  background: active ? `${tab.color}12` : 'transparent',
                  transition: 'all 0.15s',
                }}>{tab.shortcut}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Solution selector (for relevant tabs) ─── */}
      {solutions.length > 1 && ['intuition', 'steps', 'algorithm', 'code', 'dryrun'].includes(activeTab) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          padding: '6px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(255,255,255,0.015)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: '#3f3f46', fontWeight: 600, marginRight: 8 }}>APPROACH</span>
          {solutions.map((s, i) => {
            const c = APPROACHES[s.approach_type] || APPROACHES.Optimal;
            const active = i === solIdx;
            return (
              <button key={s.id || i} onClick={() => setSolIdx(i)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 7,
                background: active ? c.bg : 'transparent',
                border: `1px solid ${active ? c.border : 'transparent'}`,
                color: active ? c.color : '#52525b',
                fontSize: 12, fontWeight: active ? 650 : 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: c.color, opacity: active ? 1 : 0.3,
                }} />
                {s.approach_type}
                {s.time_complexity && (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, opacity: 0.7 }}>
                    {s.time_complexity}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── TAB CONTENT ─── */}
      <div ref={contentRef} className="flex-1 overflow-hidden" style={{ position: 'relative' }}>
        <div className="tab-content-enter" key={activeTab} style={{
          height: '100%', overflow: 'auto',
          animation: 'tabFadeIn 0.2s ease-out',
        }}>
          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            <VideoPlayer
              url={problem.youtube_url}
              videoNotes={problem.video_notes || []}
              onVideoNotesChange={onVideoNotesChange}
              videoTimestamp={problem.video_timestamp || 0}
              onVideoTimestampChange={onVideoTimestampChange}
              notes={problem.notes}
              onNotesChange={onNotesChange}
              solution={sol}
            />
          )}

          {/* PROBLEM TAB */}
          {activeTab === 'problem' && (
            <div style={{ padding: 28, maxWidth: 900 }}>
              {problem.description && (
                <ContentSection
                  icon={BookOpen} iconColor="#4f8ff7" iconBg="rgba(79,143,247,0.1)"
                  title="Problem Statement"
                >
                  <MarkdownRenderer content={problem.description} />
                </ContentSection>
              )}
              {problem.in_depth_explanation && (
                <ContentSection
                  icon={Info} iconColor="#22d3ee" iconBg="rgba(34,211,238,0.1)"
                  title="In-depth Explanation" style={{ marginTop: 24 }}
                >
                  <MarkdownRenderer content={problem.in_depth_explanation} />
                </ContentSection>
              )}
              {!problem.description && !problem.in_depth_explanation && (
                <EmptyTabState icon={BookOpen} message="No problem statement added yet" sub="Edit the problem to add a description" />
              )}
            </div>
          )}

          {/* INTUITION TAB */}
          {activeTab === 'intuition' && (
            <div style={{ padding: 28, maxWidth: 900 }}>
              {sol?.intuition ? (
                <ContentSection icon={Lightbulb} iconColor="#fbbf24" iconBg="rgba(251,191,36,0.1)" title="Intuition">
                  <MarkdownRenderer content={sol.intuition} />
                </ContentSection>
              ) : (
                <EmptyTabState icon={Lightbulb} message="No intuition written yet" sub={solutions.length === 0 ? "Add a solution first" : "Edit the solution to add intuition"} />
              )}
              {sol?.hints && sol.hints.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <HintsPanel hints={sol.hints} />
                </div>
              )}
            </div>
          )}

          {/* STEPS TAB */}
          {activeTab === 'steps' && (
            <div style={{ padding: 28, maxWidth: 900 }}>
              {sol?.in_depth_intuition ? (
                <ContentSection icon={Footprints} iconColor="#a78bfa" iconBg="rgba(167,139,250,0.1)" title="Step-by-Step Walkthrough">
                  <MarkdownRenderer content={sol.in_depth_intuition} />
                </ContentSection>
              ) : (
                <EmptyTabState icon={Footprints} message="No step-by-step breakdown yet" sub="Edit the solution to add a walkthrough" />
              )}
            </div>
          )}

          {/* ALGORITHM TAB */}
          {activeTab === 'algorithm' && (
            <div style={{ padding: 28, maxWidth: 900 }}>
              {sol?.algorithm ? (
                <ContentSection icon={List} iconColor="#4f8ff7" iconBg="rgba(79,143,247,0.1)" title="Algorithm">
                  <MarkdownRenderer content={sol.algorithm} />
                </ContentSection>
              ) : (
                <EmptyTabState icon={List} message="No algorithm documented yet" sub="Edit the solution to add the algorithm" />
              )}
            </div>
          )}

          {/* CODE TAB */}
          {activeTab === 'code' && (
            <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {sol?.code ? (
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <CodePanel code={sol.code} language={sol.language || 'java'} visible onToggle={() => {}} />
                </div>
              ) : (
                <EmptyTabState icon={Code2} message="No code solution yet" sub="Edit the solution to add code" />
              )}
            </div>
          )}

          {/* DRY RUN TAB */}
          {activeTab === 'dryrun' && (
            <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {sol?.visualization_html || sol?.code ? (
                <div style={{ flex: 1 }}>
                  <VizSection
                    vizHtml={sol.visualization_html}
                    code={sol.code}
                    intuition={sol.intuition}
                    stepsText={sol.in_depth_intuition}
                    approachType={sol.approach_type}
                  />
                </div>
              ) : (
                <EmptyTabState icon={Eye} message="No code or visualization available" sub="Edit the solution to add code for the viz engine" />
              )}
            </div>
          )}

          {/* NOTES TAB — Enhanced with drawing canvas */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
              {/* Left: Text notes */}
              <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{
                  padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.015)',
                }}>
                  <PenTool size={13} style={{ color: '#fb923c' }} />
                  <span style={{ fontSize: 12, fontWeight: 650, color: '#a1a1aa' }}>Text Notes</span>
                  <span style={{ fontSize: 10, color: '#3f3f46', marginLeft: 'auto' }}>Markdown supported</span>
                </div>
                <textarea
                  value={problem.notes || ''}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Write notes, patterns, edge cases, mistakes to avoid...&#10;&#10;Tips:&#10;• Use ## for headings&#10;• Use ``` for code blocks&#10;• Use - for bullet points"
                  style={{
                    flex: 1, width: '100%', background: 'transparent',
                    border: 'none', padding: 16, fontSize: 13.5, color: '#b8b8be',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    resize: 'none', outline: 'none', lineHeight: 1.9,
                  }}
                />
              </div>

              {/* Right: Drawing canvas */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{
                  padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.015)',
                }}>
                  <Eye size={13} style={{ color: '#a78bfa' }} />
                  <span style={{ fontSize: 12, fontWeight: 650, color: '#a1a1aa' }}>Drawing Canvas</span>
                  <span style={{ fontSize: 10, color: '#3f3f46', marginLeft: 'auto' }}>
                    Draw data structures, dry run traces
                  </span>
                </div>
                <DSTemplates canvasAPI={canvasAPI} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <DrawingCanvas onTemplateReady={setCanvasAPI} />
                </div>
              </div>
            </div>
          )}

          {/* COMPLEXITY TAB */}
          {activeTab === 'complexity' && (
            <div style={{ overflow: 'auto', height: '100%' }}>
              {solutions.length > 0 ? (
                <ComplexityChart solutions={solutions} />
              ) : (
                <EmptyTabState icon={BarChart3} message="No solutions to compare" sub="Add solutions with time/space complexity" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM STATUS BAR ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 20px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.015)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: '#3f3f46' }}>
            {solutions.length} solution{solutions.length !== 1 ? 's' : ''}
          </span>
          {sol && (
            <span style={{ fontSize: 10, color: '#3f3f46' }}>
              {sol.approach_type} • {sol.time_complexity || '—'} / {sol.space_complexity || '—'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Keyboard size={10} style={{ color: '#2a2a33' }} />
          <span style={{ fontSize: 10, color: '#2a2a33' }}>
            Press <strong style={{ color: '#3f3f46' }}>1-9</strong> to switch tabs
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══ HELPER COMPONENTS ═══

function ContentSection({ icon: Icon, iconColor, iconBg, title, children, style = {} }) {
  return (
    <section style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: iconBg,
        }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 750, color: '#fafaf9', letterSpacing: '-0.02em' }}>{title}</span>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.02)', borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.05)', padding: 24,
      }}>
        {children}
      </div>
    </section>
  );
}

function EmptyTabState({ icon: Icon, message, sub }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: 400, color: '#2a2a33',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <Icon size={24} style={{ opacity: 0.3 }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#3f3f46', marginBottom: 4 }}>{message}</div>
      <div style={{ fontSize: 12, color: '#2a2a33' }}>{sub}</div>
    </div>
  );
}

// Styles
const kbdStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '2px 6px', borderRadius: 4,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#71717a', fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 700, minWidth: 20,
};

function linkStyle(color) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 11, color, textDecoration: 'none', fontWeight: 600,
    padding: '3px 8px', borderRadius: 5,
    background: `${color}12`, border: `1px solid ${color}20`,
    transition: 'all 0.15s',
  };
}