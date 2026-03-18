import { useState } from 'react';
import { X } from 'lucide-react';

// ═══ ICON BUTTON ═══
export function IconButton({ icon: Icon, onClick, title, size = 15, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-sm border-none bg-transparent text-ink-3 cursor-pointer
        flex items-center justify-center transition-all duration-150
        hover:bg-white/[0.06] hover:text-ink-2 ${className}`}
    >
      <Icon size={size} />
    </button>
  );
}

// ═══ BUTTON ═══
const VARIANTS = {
  primary:   'bg-accent-blue text-white border-none hover:brightness-110',
  secondary: 'bg-surface-3 text-ink-2 border border-border-2 hover:bg-surface-4',
  ghost:     'bg-transparent text-ink-3 border-none hover:bg-white/[0.05] hover:text-ink-2',
  danger:    'bg-red-500/10 text-accent-red border border-red-500/20 hover:bg-red-500/20',
};

export function Button({ children, onClick, variant = 'secondary', disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-[7px] rounded-sm text-sm font-semibold cursor-pointer
        flex items-center gap-1.5 transition-all duration-150 font-sans
        disabled:opacity-40 disabled:cursor-default
        ${VARIANTS[variant] || VARIANTS.secondary} ${className}`}
    >
      {children}
    </button>
  );
}

// ═══ TEXT INPUT ═══
export function TextInput({ value, onChange, placeholder, mono, className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-surface-0 border border-border-2 rounded-sm px-3 py-2 text-sm
        text-ink-1 placeholder:text-ink-4 outline-none transition-colors
        ${mono ? 'font-mono' : 'font-sans'} ${className}`}
    />
  );
}

// ═══ TEXT AREA ═══
export function TextArea({ value, onChange, placeholder, rows = 4, mono }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full bg-surface-0 border border-border-2 rounded-sm px-3 py-2.5 text-sm
        text-ink-1 placeholder:text-ink-4 outline-none resize-y leading-relaxed transition-colors
        ${mono ? 'font-mono' : 'font-sans'}`}
    />
  );
}

// ═══ SELECT ═══
export function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-0 border border-border-2 rounded-sm px-3 py-2 text-sm
        text-ink-1 outline-none font-sans appearance-auto"
    >
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}

// ═══ FIELD LABEL ═══
export function FieldLabel({ children }) {
  return (
    <div className="text-2xs font-semibold text-ink-4 mb-1.5 uppercase tracking-[0.06em]">
      {children}
    </div>
  );
}

// ═══ MODAL ═══
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4
        bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-surface-1 border border-border-2 rounded-lg shadow-2xl
          w-full ${wide ? 'max-w-[960px]' : 'max-w-[640px]'} max-h-[85vh]
          flex flex-col animate-slide-up`}
        style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-1">
          <span className="text-base font-bold text-ink-1">{title}</span>
          <IconButton icon={X} onClick={onClose} />
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ═══ BADGE ═══
export function DifficultyBadge({ difficulty }) {
  const colors = {
    Easy:   'text-accent-green bg-accent-green/10 border-accent-green/20',
    Medium: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20',
    Hard:   'text-accent-red bg-accent-red/10 border-accent-red/20',
  };
  return (
    <span className={`text-2xs px-2 py-0.5 rounded-full border font-semibold
      ${colors[difficulty] || colors.Easy}`}>
      {difficulty}
    </span>
  );
}
