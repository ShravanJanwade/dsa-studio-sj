import { useMemo, useState } from 'react';
import { Copy, CheckCircle2, Eye, EyeOff, Code2 } from 'lucide-react';
import { tokenLines, TOKEN_COLORS } from '@/lib/tokenizer';

export default function CodePanel({ code, language = 'java', visible, onToggle }) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => tokenLines(code || ''), [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col bg-surface-0 rounded-lg border border-border-1 overflow-hidden h-full">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-1 shrink-0"
        style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex gap-[6px]">
            <span className="w-[9px] h-[9px] rounded-full bg-accent-red/60" />
            <span className="w-[9px] h-[9px] rounded-full bg-accent-amber/60" />
            <span className="w-[9px] h-[9px] rounded-full bg-accent-green/60" />
          </div>
          <span className="text-xs text-ink-4 font-medium ml-1.5 uppercase tracking-wider">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs
              border-none bg-transparent cursor-pointer font-sans transition-all
              hover:bg-white/[0.05]"
            style={{ color: copied ? '#34d399' : '#52525b' }}
          >
            {copied
              ? <><CheckCircle2 size={12} /> Copied</>
              : <><Copy size={12} /> Copy</>}
          </button>
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-ink-4
              border-none bg-transparent cursor-pointer font-sans transition-all
              hover:bg-white/[0.05] hover:text-ink-3"
          >
            {visible ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Show</>}
          </button>
        </div>
      </div>

      {/* Code body — FIX: <pre> preserves all whitespace/indentation */}
      {visible && (
        <div className="flex-1 overflow-auto p-4">
          <div style={{ display: 'flex' }}>
            {/* Line numbers in <pre> so spacing matches code */}
            <pre style={{
              margin: 0,
              padding: 0,
              paddingRight: 18,
              background: 'transparent',
              border: 'none',
              textAlign: 'right',
              color: 'rgba(255,255,255,0.1)',
              userSelect: 'none',
              minWidth: 36,
              flexShrink: 0,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontSize: 12,
              lineHeight: '24px',
              whiteSpace: 'pre',
            }}>
              {lines.map((_, i) => i + 1).join('\n')}
            </pre>
            {/* Code tokens inside <pre> — this is the indentation fix */}
            <pre style={{
              margin: 0,
              padding: 0,
              flex: 1,
              background: 'transparent',
              border: 'none',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontSize: 13.5,
              lineHeight: '24px',
              whiteSpace: 'pre',
              overflowX: 'auto',
              tabSize: 4,
            }}>
              {lines.map((line, i) => (
                <span key={i}>
                  {line.length === 0
                    ? '\n'
                    : <>
                        {line.map((tok, j) => (
                          <span
                            key={j}
                            style={{
                              color: TOKEN_COLORS[tok.type] || TOKEN_COLORS.plain,
                              fontStyle: tok.type === 'comment' ? 'italic' : undefined,
                            }}
                          >
                            {tok.text}
                          </span>
                        ))}
                        {'\n'}
                      </>
                  }
                </span>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}