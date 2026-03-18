import { useState, useRef } from 'react';
import {
  ChevronDown, ChevronLeft, Plus, Search, Menu, Zap, Trash2,
  FolderOpen, Layers, Brain, Hash, Target, GitBranch, Type, Triangle,
  Upload, GripVertical,
} from 'lucide-react';
import { IconButton } from '@/components/ui/Primitives';
import { STATUSES, DIFFICULTIES } from '@/lib/constants';

const ICON_MAP = {
  graph: Layers, dp: Brain, array: Hash, search: Target,
  tree: GitBranch, string: Type, heap: Triangle, stack: Layers, folder: FolderOpen,
};

// ═══ Drag & Drop Hook ═══
function useDragReorder(items, onReorder) {
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  const onDragStart = (idx) => (e) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Firefox needs this
    // Make drag preview semi-transparent
    setTimeout(() => { if (e.target) e.target.style.opacity = '0.4'; }, 0);
  };

  const onDragEnd = (e) => {
    e.target.style.opacity = '1';
    if (dragIdx.current !== null && dragOverIdx.current !== null && dragIdx.current !== dragOverIdx.current) {
      const reordered = [...items];
      const [moved] = reordered.splice(dragIdx.current, 1);
      reordered.splice(dragOverIdx.current, 0, moved);
      onReorder(reordered.map((item) => item.id));
    }
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  const onDragOver = (idx) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIdx.current = idx;
  };

  return { onDragStart, onDragEnd, onDragOver };
}

// ═══ Action Button (premium) ═══
function ActionBtn({ icon: Icon, onClick, title, color = '#52525b', hoverColor = '#a1a1aa', danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 5, borderRadius: 6, border: 'none', cursor: 'pointer',
        background: hov ? (danger ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.06)') : 'transparent',
        color: hov ? (danger ? '#f87171' : hoverColor) : color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      <Icon size={14} />
    </button>
  );
}

// ═══ SIDEBAR ═══
export default function Sidebar({
  topics, selectedProblemId, onSelectProblem, onAddTopic, onAddSubtopic,
  onAddProblem, expandedTopics, expandedSubs, toggleTopic, toggleSub,
  search, setSearch, collapsed, setCollapsed, stats, onBulkUpload,
  onDeleteTopic, onDeleteSubtopic, onDeleteProblem,
  onReorderTopics, onReorderSubtopics, onReorderProblems,
}) {
  const topicDrag = useDragReorder(topics, onReorderTopics);

  return (
    <div
      className="flex flex-col h-full bg-surface-0 border-r border-border-1 transition-all duration-300 shrink-0"
      style={{ width: collapsed ? 56 : 296 }}
    >
      {/* Logo header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '14px 12px' : '16px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.04)', minHeight: 56,
      }}>
        {!collapsed && (
          <>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #4f8ff7, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79,143,247,0.25)',
            }}>
              <Zap size={15} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 750, color: '#fafaf9', letterSpacing: '-0.03em' }}>DSA Studio</div>
              <div style={{ fontSize: 10, color: '#52525b', letterSpacing: '0.02em', marginTop: -1 }}>Interview Prep</div>
            </div>
          </>
        )}
        <IconButton icon={collapsed ? Menu : ChevronLeft} onClick={() => setCollapsed(!collapsed)} size={17} />
      </div>

      {collapsed ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 14 }}>
          <IconButton icon={Search} onClick={() => setCollapsed(false)} size={17} />
          <IconButton icon={Plus} onClick={() => { setCollapsed(false); onAddTopic(); }} size={17} />
        </div>
      ) : (
        <>
          {/* Search */}
          <div style={{ padding: '12px 14px 6px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: 10, color: '#3f3f46' }} />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems..."
                style={{
                  width: '100%', background: '#111114',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10,
                  paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
                  fontSize: 13, color: '#b8b8be', outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Topic tree */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px' }}>
            {topics.map((topic, tIdx) => (
              <TopicNode
                key={topic.id}
                topic={topic}
                idx={tIdx}
                selectedProblemId={selectedProblemId}
                onSelectProblem={onSelectProblem}
                onAddSubtopic={onAddSubtopic}
                onAddProblem={onAddProblem}
                expanded={expandedTopics.has(topic.id)}
                expandedSubs={expandedSubs}
                toggleTopic={toggleTopic}
                toggleSub={toggleSub}
                search={search}
                onBulkUpload={onBulkUpload}
                onDeleteTopic={onDeleteTopic}
                onDeleteSubtopic={onDeleteSubtopic}
                onDeleteProblem={onDeleteProblem}
                onReorderSubtopics={onReorderSubtopics}
                onReorderProblems={onReorderProblems}
                topicDrag={topicDrag}
              />
            ))}
          </div>

          {/* Add topic button */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <button
              onClick={onAddTopic}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                border: '1px dashed rgba(255,255,255,0.08)', background: 'transparent',
                color: '#3f3f46', fontSize: 12.5, cursor: 'pointer', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(79,143,247,0.3)'; e.currentTarget.style.color = '#4f8ff7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#3f3f46'; }}
            >
              <Plus size={15} /> New topic
            </button>
          </div>

          {/* Stats */}
          {stats && stats.total > 0 && (
            <div style={{ padding: '12px 14px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ background: '#111114', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Progress</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#b8b8be' }}>{stats.pct}%</span>
                </div>
                <div style={{ height: 6, background: '#1a1a20', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ height: '100%', width: `${stats.pct}%`, background: 'linear-gradient(90deg, #4f8ff7, #34d399)', borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                  {STATUSES.map((s) => (
                    <div key={s.key} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 750, color: s.dot, fontVariantNumeric: 'tabular-nums' }}>{stats[s.key] || 0}</div>
                      <div style={{ fontSize: 9, color: '#3f3f46', marginTop: 2, fontWeight: 500 }}>{s.label.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══ TOPIC NODE ═══
function TopicNode({
  topic, idx, selectedProblemId, onSelectProblem, onAddSubtopic, onAddProblem,
  expanded, expandedSubs, toggleTopic, toggleSub, search, onBulkUpload,
  onDeleteTopic, onDeleteSubtopic, onDeleteProblem,
  onReorderSubtopics, onReorderProblems, topicDrag,
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[topic.icon] || FolderOpen;
  const cnt = (topic.subtopics || []).reduce((a, s) => a + (s.problems || []).length, 0);
  const hasMatch = (topic.subtopics || []).some((sub) =>
    (sub.problems || []).some((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
  );
  if (search && !hasMatch) return null;
  const exp = expanded || !!search;

  const subDrag = useDragReorder(topic.subtopics || [], (orderedIds) => onReorderSubtopics(topic.id, orderedIds));

  return (
    <div style={{ marginBottom: 3 }}
      draggable onDragStart={topicDrag.onDragStart(idx)}
      onDragEnd={topicDrag.onDragEnd} onDragOver={topicDrag.onDragOver(idx)}>
      <div
        onClick={() => toggleTopic(topic.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
          background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'background 0.12s',
        }}
      >
        {/* Drag handle */}
        <span style={{ color: '#2a2a33', cursor: 'grab', display: 'flex', flexShrink: 0 }}
          onMouseDown={(e) => e.stopPropagation()}>
          <GripVertical size={12} />
        </span>
        <span style={{ color: '#3f3f46', transition: 'transform 0.15s', transform: exp ? 'rotate(0)' : 'rotate(-90deg)', display: 'flex' }}>
          <ChevronDown size={13} />
        </span>
        <Icon size={15} style={{ color: '#4f8ff7', opacity: 0.7, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 650, color: '#fafaf9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topic.name}</span>
        <span style={{ fontSize: 10.5, color: '#3f3f46', background: '#1a1a20', padding: '2px 8px', borderRadius: 10, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{cnt}</span>
        {/* Action buttons — visible on hover */}
        {hovered && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <ActionBtn icon={Plus} onClick={(e) => { e.stopPropagation(); onAddSubtopic(topic.id); }} title="Add subtopic" hoverColor="#4f8ff7" />
            <ActionBtn icon={Trash2} onClick={(e) => { e.stopPropagation(); if (confirm('Delete topic "' + topic.name + '" and all its contents?')) onDeleteTopic(topic.id); }} title="Delete topic" danger />
          </div>
        )}
      </div>
      {exp && (
        <div style={{ marginLeft: 20, paddingLeft: 14, borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
          {(topic.subtopics || []).map((sub, sIdx) => (
            <SubtopicNode
              key={sub.id}
              sub={sub}
              idx={sIdx}
              topicId={topic.id}
              selectedProblemId={selectedProblemId}
              onSelectProblem={onSelectProblem}
              onAddProblem={onAddProblem}
              expanded={expandedSubs.has(sub.id)}
              toggleSub={toggleSub}
              search={search}
              onBulkUpload={onBulkUpload}
              onDeleteSubtopic={onDeleteSubtopic}
              onDeleteProblem={onDeleteProblem}
              onReorderProblems={onReorderProblems}
              subDrag={subDrag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ SUBTOPIC NODE ═══
function SubtopicNode({
  sub, idx, topicId, selectedProblemId, onSelectProblem, onAddProblem,
  expanded, toggleSub, search, onBulkUpload,
  onDeleteSubtopic, onDeleteProblem, onReorderProblems, subDrag,
}) {
  const [hovered, setHovered] = useState(false);
  const filtered = (sub.problems || []).filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );
  if (search && !filtered.length) return null;
  const exp = expanded || !!search;

  const probDrag = useDragReorder(filtered, (orderedIds) => onReorderProblems(sub.id, orderedIds));

  return (
    <div style={{ marginBottom: 2 }}
      draggable onDragStart={subDrag.onDragStart(idx)}
      onDragEnd={subDrag.onDragEnd} onDragOver={subDrag.onDragOver(idx)}>
      <div
        onClick={() => toggleSub(sub.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
          background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'background 0.12s',
        }}
      >
        <span style={{ color: '#2a2a33', cursor: 'grab', display: 'flex', flexShrink: 0 }}
          onMouseDown={(e) => e.stopPropagation()}>
          <GripVertical size={10} />
        </span>
        <span style={{ color: '#3f3f46', transition: 'transform 0.15s', transform: exp ? 'rotate(0)' : 'rotate(-90deg)', display: 'flex' }}>
          <ChevronDown size={11} />
        </span>
        <span style={{ flex: 1, fontSize: 12.5, color: '#71717a', fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</span>
        {hovered && (
          <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <ActionBtn icon={Upload} onClick={(e) => { e.stopPropagation(); onBulkUpload(topicId, sub.id); }} title="Bulk upload" hoverColor="#4f8ff7" />
            <ActionBtn icon={Plus} onClick={(e) => { e.stopPropagation(); onAddProblem(topicId, sub.id); }} title="Add problem" hoverColor="#34d399" />
            <ActionBtn icon={Trash2} onClick={(e) => { e.stopPropagation(); if (confirm('Delete subtopic "' + sub.name + '"?')) onDeleteSubtopic(sub.id); }} title="Delete subtopic" danger />
          </div>
        )}
      </div>
      {exp && (
        <div style={{ marginLeft: 10 }}>
          {filtered.map((prob, pIdx) => (
            <ProblemItem
              key={prob.id}
              prob={prob}
              idx={pIdx}
              active={selectedProblemId === prob.id}
              topicId={topicId}
              subId={sub.id}
              onSelectProblem={onSelectProblem}
              onDeleteProblem={onDeleteProblem}
              probDrag={probDrag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ PROBLEM ITEM ═══
function ProblemItem({ prob, idx, active, topicId, subId, onSelectProblem, onDeleteProblem, probDrag }) {
  const [hovered, setHovered] = useState(false);
  const status = STATUSES.find((s) => s.key === prob.status) || STATUSES[0];
  const diff = DIFFICULTIES[prob.difficulty] || DIFFICULTIES.Easy;

  return (
    <div
      draggable
      onDragStart={probDrag.onDragStart(idx)}
      onDragEnd={probDrag.onDragEnd}
      onDragOver={probDrag.onDragOver(idx)}
      onClick={() => onSelectProblem(prob.id, topicId, subId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
        transition: 'all 0.15s', marginBottom: 2,
        background: active ? 'rgba(79,143,247,0.1)' : hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: active ? '1px solid rgba(79,143,247,0.2)' : '1px solid transparent',
      }}
    >
      {/* Drag handle */}
      <span style={{ color: '#1a1a20', cursor: 'grab', display: 'flex', flexShrink: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#3f3f46'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a20'; }}>
        <GripVertical size={10} />
      </span>
      {/* Status dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: status.dot, flexShrink: 0,
        boxShadow: `0 0 0 2px #0a0a0c, 0 0 0 3px ${status.ring}`,
      }} />
      {/* Name */}
      <span style={{
        flex: 1, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: active ? '#93c5fd' : '#b8b8be', fontWeight: active ? 600 : 400,
      }}>{prob.name}</span>
      {/* Difficulty badge */}
      <span style={{
        fontSize: 10, fontWeight: 650, padding: '2px 8px', borderRadius: 10, flexShrink: 0,
        color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`,
      }}>{prob.difficulty[0]}</span>
      {/* Delete on hover */}
      {hovered && (
        <ActionBtn icon={Trash2} onClick={(e) => { e.stopPropagation(); if (confirm('Delete "' + prob.name + '"?')) onDeleteProblem(prob.id); }}
          title="Delete" danger />
      )}
    </div>
  );
}