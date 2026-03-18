/** Shared design constants used across components */

export const STATUSES = [
  { key: 'todo', label: 'To Do', dot: '#52525b', ring: '#3f3f46' },
  { key: 'inProgress', label: 'In Progress', dot: '#f59e0b', ring: '#92400e' },
  { key: 'revision', label: 'Revision', dot: '#a78bfa', ring: '#5b21b6' },
  { key: 'completed', label: 'Completed', dot: '#34d399', ring: '#065f46' },
];

export const DIFFICULTIES = {
  Easy:   { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)' },
  Medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)' },
  Hard:   { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
};

export const APPROACHES = {
  'Brute Force': { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
  'Better':      { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)' },
  'Optimal':     { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)' },
};

export const TOPIC_ICONS = {
  graph: 'Layers',
  dp: 'Brain',
  array: 'Hash',
  search: 'Target',
  tree: 'GitBranch',
  string: 'Type',
  heap: 'Triangle',
  stack: 'Layers',
  folder: 'FolderOpen',
};
