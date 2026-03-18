import { useMemo } from 'react';
import { tokenLines, TOKEN_COLORS } from '@/lib/tokenizer';

/** Inline markdown: **bold**, `code`, *italic* */
function InlineMd({ text }) {
  const parts = useMemo(() => {
    const result = [];
    const re = /(\*\*(.+?)\*\*)|(`([^`]+?)`)|(\*(.+?)\*)/g;
    let last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) result.push({ t: 'text', v: text.slice(last, m.index) });
      if (m[1]) result.push({ t: 'bold', v: m[2] });
      else if (m[3]) result.push({ t: 'code', v: m[4] });
      else if (m[5]) result.push({ t: 'em', v: m[6] });
      last = re.lastIndex;
    }
    if (last < text.length) result.push({ t: 'text', v: text.slice(last) });
    return result;
  }, [text]);

  return parts.map((p, i) => {
    if (p.t === 'bold') return <strong key={i} className="text-ink-1 font-semibold">{p.v}</strong>;
    if (p.t === 'code') return (
      <code key={i} style={{
        background: 'rgba(167,139,250,0.1)',
        color: '#c084fc',
        padding: '2px 7px',
        borderRadius: 5,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.88em',
        border: '1px solid rgba(167,139,250,0.12)',
      }}>
        {p.v}
      </code>
    );
    if (p.t === 'em') return <em key={i} className="text-ink-3">{p.v}</em>;
    return <span key={i}>{p.v}</span>;
  });
}

/**
 * Code block renderer — FIX: uses <pre> to preserve all whitespace/indentation.
 * Previously used <div> which collapses multiple spaces into one.
 */
function CodeBlock({ code }) {
  const lines = useMemo(() => tokenLines(code), [code]);
  return (
    <div style={{
      margin: '14px 0',
      background: '#08080b',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      overflow: 'auto',
    }}>
      <div style={{
        display: 'flex',
        padding: '16px 18px',
      }}>
        {/* Line numbers — also in a <pre> so spacing matches */}
        <pre style={{
          margin: 0,
          padding: 0,
          paddingRight: 16,
          background: 'transparent',
          border: 'none',
          textAlign: 'right',
          color: 'rgba(255,255,255,0.12)',
          userSelect: 'none',
          minWidth: 28,
          flexShrink: 0,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 11,
          lineHeight: '23px',
          whiteSpace: 'pre',
        }}>
          {lines.map((_, i) => i + 1).join('\n')}
        </pre>
        {/* Code content — <pre> preserves all indentation */}
        <pre style={{
          margin: 0,
          padding: 0,
          flex: 1,
          background: 'transparent',
          border: 'none',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13.5,
          lineHeight: '23px',
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
                      <span key={j} style={{
                        color: TOKEN_COLORS[tok.type] || TOKEN_COLORS.plain,
                        fontStyle: tok.type === 'comment' ? 'italic' : undefined,
                      }}>{tok.text}</span>
                    ))}
                    {'\n'}
                  </>
              }
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}

/** Block-level markdown parser + renderer */
export default function MarkdownRenderer({ content }) {
  const blocks = useMemo(() => {
    if (!content) return [];
    const result = [];
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const ln = lines[i];
      if (ln.startsWith('```')) {
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
        result.push({ type: 'code', text: codeLines.join('\n') });
        i++;
      }
      else if (ln.startsWith('### ')) { result.push({ type: 'h3', text: ln.slice(4) }); i++; }
      else if (ln.startsWith('## '))  { result.push({ type: 'h2', text: ln.slice(3) }); i++; }
      else if (ln.startsWith('# '))   { result.push({ type: 'h1', text: ln.slice(2) }); i++; }
      else if (/^[-*] /.test(ln)) {
        const items = [];
        while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
        result.push({ type: 'ul', items });
      }
      else if (/^\d+\. /.test(ln)) {
        const items = [];
        while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++; }
        result.push({ type: 'ol', items });
      }
      else if (ln.trim() === '') { i++; }
      else {
        let para = ln;
        i++;
        while (i < lines.length && lines[i].trim() !== '' && !/^[#`\-*]/.test(lines[i]) && !/^\d+\. /.test(lines[i])) {
          para += ' ' + lines[i]; i++;
        }
        result.push({ type: 'p', text: para });
      }
    }
    return result;
  }, [content]);

  if (!content) return null;

  return (
    <div style={{ lineHeight: 1.8, fontSize: 14.5 }}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h1': return (
            <h2 key={i} style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#fafaf9',
              margin: '24px 0 12px',
              letterSpacing: '-0.03em',
            }}>
              {b.text}
            </h2>
          );
          case 'h2': return (
            <h3 key={i} style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'rgba(250,250,249,0.9)',
              margin: '20px 0 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{
                width: 3,
                height: 18,
                background: 'linear-gradient(180deg, #4f8ff7, #a78bfa)',
                borderRadius: 2,
                flexShrink: 0,
              }} />
              {b.text}
            </h3>
          );
          case 'h3': return (
            <h4 key={i} style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#71717a',
              margin: '16px 0 6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {b.text}
            </h4>
          );
          case 'p': return (
            <p key={i} style={{
              color: '#b8b8be',
              margin: '8px 0',
              fontSize: 14.5,
              lineHeight: 1.85,
            }}>
              <InlineMd text={b.text} />
            </p>
          );
          case 'ul': return (
            <ul key={i} style={{ margin: '8px 0', listStyle: 'none', padding: 0 }}>
              {b.items.map((item, j) => (
                <li key={j} style={{
                  color: '#b8b8be',
                  fontSize: 14.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  margin: '6px 0',
                  lineHeight: 1.8,
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#4f8ff7',
                    marginTop: 9,
                    flexShrink: 0,
                  }} />
                  <span><InlineMd text={item} /></span>
                </li>
              ))}
            </ul>
          );
          case 'ol': return (
            <div key={i} style={{ margin: '8px 0' }}>
              {b.items.map((item, j) => (
                <div key={j} style={{
                  color: '#b8b8be',
                  fontSize: 14.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  margin: '6px 0',
                  lineHeight: 1.8,
                }}>
                  <span style={{
                    color: '#4f8ff7',
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    minWidth: 20,
                    marginTop: 2,
                    flexShrink: 0,
                  }}>
                    {j + 1}.
                  </span>
                  <span><InlineMd text={item} /></span>
                </div>
              ))}
            </div>
          );
          case 'code': return <CodeBlock key={i} code={b.text} />;
          default: return null;
        }
      })}
    </div>
  );
}