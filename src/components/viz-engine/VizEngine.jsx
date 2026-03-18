/**
 * VizEngine v5 — Hybrid: Universal Execution + Pre-built Tracer Fallback
 *
 * Pipeline:
 * 1. Try to detect pattern from code + hints (intuition/steps/approach)
 * 2. User picks test case or types custom input
 * 3. Attempt 1: Execute user's actual code (transpiled to JS) with recording
 * 4. Attempt 2: If execution fails, fall back to pre-built tracer
 * 5. SVG renderers show data structures at each step
 *
 * The engine now works with ANY code from ANY DSA problem.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, X, Cpu, Zap, AlertCircle, Eye, Code2, ChevronDown,
  Sparkles, RefreshCw, Terminal, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { detectPattern, getAllPatterns } from './CodeDetector';
import { parseInput, guessInputHint } from './InputParser';
import { TRACER_REGISTRY, normalizeInput } from './TracerFactory';
import { renderStructure } from './renderers';
import { executeCode, detectLanguage, enhancedDetect, transpileToJS } from './UniversalExecutor';

// ═══ Variable Table ═══
function VarTable({ variables, changedVars }) {
  const entries = Object.entries(variables || {});
  if (!entries.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
      {entries.map(([name, val]) => {
        const changed = changedVars?.has?.(name);
        const bg = changed ? 'rgba(251,191,36,0.06)' : 'transparent';
        const display = Array.isArray(val) ? `[${val.join(', ')}]`
          : (val && typeof val === 'object') ? JSON.stringify(val)
          : String(val ?? '—');
        return [
          <div key={name + 'k'} style={{ padding: '4px 12px 4px 8px', color: changed ? '#fbbf24' : '#52525b', fontWeight: 600, background: bg, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{name}</div>,
          <div key={name + 'v'} style={{ padding: '4px 8px', color: changed ? '#fbbf24' : '#b8b8be', background: bg, borderBottom: '1px solid rgba(255,255,255,0.02)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
            {display}{changed ? '  ←' : ''}
          </div>,
        ];
      })}
    </div>
  );
}

// ═══ Pseudocode with active line ═══
function PseudoView({ lines, active }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector('[data-hl]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [active]);
  return (
    <div ref={ref} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: '24px' }}>
      {(lines || []).map((line, i) => {
        const isActive = i === active;
        return (
          <div key={i} data-hl={isActive || undefined} style={{
            padding: '1px 10px', borderRadius: 4,
            background: isActive ? 'rgba(79,143,247,0.15)' : 'transparent',
            color: isActive ? '#93c5fd' : '#3f3f46',
            fontWeight: isActive ? 600 : 400, whiteSpace: 'pre',
            borderLeft: isActive ? '3px solid #4f8ff7' : '3px solid transparent',
          }}>{line}</div>
        );
      })}
    </div>
  );
}

// ═══ Source code display ═══
function SourceCode({ code, stepMessage }) {
  const lines = (code || '').split('\n');
  return (
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, lineHeight: '20px', maxHeight: 200, overflowY: 'auto', opacity: 0.6 }}>
      {lines.map((line, i) => (
        <div key={i} style={{ padding: '0 8px', color: '#3f3f46', whiteSpace: 'pre' }}>
          <span style={{ color: '#2a2a33', marginRight: 8, display: 'inline-block', width: 24, textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
          {line}
        </div>
      ))}
    </div>
  );
}

// ═══ Control Button ═══
function Btn({ icon: Icon, onClick, disabled, title: t }) {
  return (
    <button onClick={onClick} disabled={disabled} title={t} style={{
      padding: 7, borderRadius: 7, border: '1px solid rgba(255,255,255,0.06)',
      background: '#1a1a20', color: disabled ? '#2a2a33' : '#71717a',
      cursor: disabled ? 'default' : 'pointer', display: 'flex',
      opacity: disabled ? 0.4 : 1, transition: 'all 0.1s',
    }}><Icon size={14} /></button>
  );
}

// ═══ Method Badge ═══
function MethodBadge({ method, success }) {
  const isExec = method === 'exec';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6,
      background: isExec ? 'rgba(167,139,250,0.08)' : 'rgba(52,211,153,0.06)',
      border: `1px solid ${isExec ? 'rgba(167,139,250,0.15)' : 'rgba(52,211,153,0.1)'}`,
      fontSize: 10, fontWeight: 600,
      color: isExec ? '#c4b5fd' : '#6ee7b7',
    }}>
      {isExec ? <Terminal size={10} /> : <Cpu size={10} />}
      {isExec ? 'Code Execution' : 'Pre-built Tracer'}
      {success && <CheckCircle size={10} style={{ color: '#34d399' }} />}
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN VIZ ENGINE
// ═══════════════════════════════════════════════
export default function VizEngine({ code, defaultInput, intuition, stepsText, approachType }) {
  const detected = useMemo(() => detectPattern(code), [code]);
  const allPatterns = useMemo(() => getAllPatterns(), []);
  const detectedLang = useMemo(() => detectLanguage(code), [code]);
  const guessedInput = useMemo(() => guessInputHint(code), [code]);

  // Enhanced detection using hints
  const enhancedId = useMemo(() =>
    enhancedDetect(code, { intuition, steps: stepsText, algorithmName: approachType }),
  [code, intuition, stepsText, approachType]);

  const [patternId, setPatternId] = useState('');
  const [inputStr, setInputStr] = useState('');
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState('');
  const [showSource, setShowSource] = useState(false);
  const [vizMethod, setVizMethod] = useState(''); // 'exec' | 'tracer'
  const [showTranspiled, setShowTranspiled] = useState(false);

  const playRef = useRef(null);

  // Initialize from detected pattern
  useEffect(() => {
    const effectiveId = enhancedId || detected?.id || '';
    setPatternId(effectiveId);
    setInputStr(defaultInput || detected?.input || guessedInput || '');
    setSteps([]); setStepIdx(0); setPlaying(false); setError(''); setVizMethod('');
  }, [code]);

  const entry = TRACER_REGISTRY[patternId];
  const defaults = entry?.defaults || [];

  // ── Hybrid Run ──
  const handleRun = useCallback(() => {
    setError(''); setPlaying(false); setVizMethod('');

    const parsed = parseInput(inputStr);
    if (!parsed && inputStr.trim()) { setError('Could not parse input. Use: nums = [1,2,3], target = 9'); return; }
    if (!parsed) { setError('Enter a test case.'); return; }

    // ═══ ATTEMPT 1: Execute user's actual code ═══
    if (code) {
      try {
        const result = executeCode(code, parsed, detectedLang, {
          intuition, steps: stepsText, algorithmName: approachType,
        });

        if (result.steps.length >= 2 && !result.error) {
          // Execution succeeded with meaningful steps
          setSteps(result.steps);
          setStepIdx(0);
          setVizMethod('exec');
          return;
        }
        // If execution succeeded but only gave 1-2 trivial steps,
        // or had an error, fall through to tracer
        if (result.error) {
          console.warn('[VizEngine] Code execution failed, trying tracer:', result.error);
        }
      } catch (err) {
        console.warn('[VizEngine] Code execution exception:', err);
      }
    }

    // ═══ ATTEMPT 2: Pre-built tracer fallback ═══
    if (entry) {
      try {
        const normalized = normalizeInput(patternId, parsed);
        const result = entry.tracer(normalized);
        if (result && result.length > 0) {
          setSteps(result);
          setStepIdx(0);
          setVizMethod('tracer');
          return;
        }
      } catch (err) {
        console.warn('[VizEngine] Tracer failed:', err);
      }
    }

    // ═══ Both failed — try with the enhanced/hint-based pattern ID ═══
    const fallbackId = enhancedId || patternId;
    const fallbackEntry = TRACER_REGISTRY[fallbackId];
    if (fallbackEntry && fallbackId !== patternId) {
      try {
        const normalized = normalizeInput(fallbackId, parsed);
        const result = fallbackEntry.tracer(normalized);
        if (result && result.length > 0) {
          setSteps(result);
          setStepIdx(0);
          setVizMethod('tracer');
          return;
        }
      } catch (err) {
        // Final fallback failed
      }
    }

    // ═══ Nothing worked ═══
    setError(
      'Could not visualize this code. Tips:\n' +
      '• Make sure the input format matches the function parameters\n' +
      '• Try selecting the correct algorithm pattern from the dropdown\n' +
      '• Common format: nums = [1,2,3], target = 9'
    );
  }, [code, entry, patternId, inputStr, detectedLang, enhancedId, intuition, stepsText, approachType]);

  // Auto-play
  useEffect(() => {
    if (playing && steps.length > 0) {
      playRef.current = setInterval(() => {
        setStepIdx((p) => { if (p >= steps.length - 1) { setPlaying(false); return p; } return p + 1; });
      }, speed);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, steps.length]);

  const step = steps[stepIdx] || null;
  const structures = step?.structures || {};
  const highlights = step?.highlights || {};

  // Get transpiled code for debugging
  const transpiledCode = useMemo(() => {
    if (!code) return '';
    try { return transpileToJS(code, detectedLang); } catch { return '// Transpilation failed'; }
  }, [code, detectedLang]);

  // ═══ RENDER ═══
  const content = (
    <div style={{ fontFamily: 'system-ui,sans-serif', color: '#e4e4e7' }}>
      {/* Top bar: Detection info + pattern selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {/* Language badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6,
          background: 'rgba(79,143,247,0.06)', border: '1px solid rgba(79,143,247,0.1)',
        }}>
          <Code2 size={11} style={{ color: '#93c5fd' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase' }}>
            {detectedLang}
          </span>
        </div>

        {/* Pattern detection badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 8,
          background: (detected || enhancedId) ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.06)',
          border: `1px solid ${(detected || enhancedId) ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.1)'}`,
        }}>
          <Cpu size={13} style={{ color: (detected || enhancedId) ? '#34d399' : '#f87171' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: (detected || enhancedId) ? '#6ee7b7' : '#fca5a5' }}>
            {detected ? `Detected: ${detected.name}` : enhancedId ? `Hint: ${enhancedId}` : 'Auto-detect'}
          </span>
        </div>

        {/* Method badge (after run) */}
        {vizMethod && <MethodBadge method={vizMethod} success={steps.length > 0} />}

        {/* Pattern selector (manual override) */}
        <div style={{ position: 'relative' }}>
          <select value={patternId} onChange={(e) => {
            setPatternId(e.target.value);
            const p = allPatterns.find((x) => x.id === e.target.value);
            if (p) setInputStr(p.inputHint);
            setSteps([]); setStepIdx(0);
          }} style={{
            background: '#1a1a20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7,
            padding: '5px 28px 5px 10px', color: '#b8b8be', fontSize: 12, outline: 'none',
            fontFamily: "'JetBrains Mono',monospace", appearance: 'none', cursor: 'pointer',
          }}>
            <option value="">Auto (any code)</option>
            {allPatterns.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none' }} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Speed selector */}
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{
          background: '#1a1a20', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6,
          color: '#71717a', fontSize: 11, padding: '4px 8px', outline: 'none', fontFamily: 'inherit',
        }}>
          <option value={1200}>Slow</option>
          <option value={600}>Normal</option>
          <option value={300}>Fast</option>
          <option value={100}>Turbo</option>
        </select>
        <Btn icon={fullscreen ? Minimize2 : Maximize2} onClick={() => setFullscreen(!fullscreen)} title="Expand" />
      </div>

      {/* Default test cases for the pattern */}
      {defaults.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#3f3f46', fontWeight: 600, display: 'flex', alignItems: 'center', marginRight: 4 }}>PRESETS</span>
          {defaults.map((d, i) => (
            <button key={i} onClick={() => { setInputStr(d.input); setSteps([]); setStepIdx(0); }} style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 550,
              border: `1px solid ${inputStr === d.input ? 'rgba(79,143,247,0.25)' : 'rgba(255,255,255,0.06)'}`,
              background: inputStr === d.input ? 'rgba(79,143,247,0.1)' : 'transparent',
              color: inputStr === d.input ? '#93c5fd' : '#52525b', cursor: 'pointer', fontFamily: 'inherit',
            }}>{d.name}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <input value={inputStr} onChange={(e) => setInputStr(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRun(); }}
          placeholder={detected?.input || guessedInput || 'nums = [1,2,3], target = 3'}
          style={{
            flex: 1, background: '#111114', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '9px 14px', color: '#b8b8be', fontSize: 13,
            outline: 'none', fontFamily: "'JetBrains Mono',monospace",
          }}
        />
        <button onClick={handleRun} style={{
          padding: '9px 22px', borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(79,143,247,0.12))',
          border: '1px solid rgba(52,211,153,0.2)', color: '#6ee7b7', fontSize: 13,
          fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 6,
        }}><Zap size={14} /> Visualize</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 10, fontSize: 12, color: '#fca5a5', padding: '8px 12px', background: 'rgba(248,113,113,0.06)', borderRadius: 8, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <AlertCircle size={14} /> <strong>Visualization Error</strong>
          </div>
          {error}
        </div>
      )}

      {/* Controls */}
      {steps.length > 0 && (
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <Btn icon={SkipBack} onClick={() => { setStepIdx(0); setPlaying(false); }} disabled={stepIdx === 0} title="Start" />
          <Btn icon={ChevronLeft} onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0} title="Prev" />
          <button onClick={() => setPlaying(!playing)} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 20px', borderRadius: 8,
            background: playing ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)',
            border: `1px solid ${playing ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`,
            color: playing ? '#fca5a5' : '#6ee7b7', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
          </button>
          <Btn icon={ChevronRight} onClick={() => setStepIdx(Math.min(steps.length - 1, stepIdx + 1))} disabled={stepIdx >= steps.length - 1} title="Next" />
          <Btn icon={SkipForward} onClick={() => setStepIdx(steps.length - 1)} disabled={stepIdx >= steps.length - 1} title="End" />
          {/* Scrubber */}
          <div style={{ flex: 1, minWidth: 60, height: 4, background: '#1a1a20', borderRadius: 2, cursor: 'pointer' }}
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setStepIdx(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (steps.length - 1))); }}>
            <div style={{ height: '100%', width: `${steps.length > 1 ? (stepIdx / (steps.length - 1)) * 100 : 0}%`, background: 'linear-gradient(90deg,#34d399,#4f8ff7)', borderRadius: 2, transition: 'width 0.1s' }} />
          </div>
          <span style={{ fontSize: 12, color: '#52525b', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', minWidth: 50, textAlign: 'center' }}>
            {stepIdx + 1}/{steps.length}
          </span>
        </div>
      )}

      {/* Step message + explanation */}
      {step && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ padding: '8px 14px', borderRadius: 8, background: `${step.color || '#4f8ff7'}11`, border: `1px solid ${step.color || '#4f8ff7'}22`, fontSize: 13, color: step.color || '#93c5fd', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
            Step {stepIdx + 1}: {step.message}
          </div>
          {step.explanation && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#0e0e12', border: '1px solid rgba(255,255,255,0.04)', fontSize: 13.5, color: '#b8b8be', lineHeight: 1.7 }}>
              {step.explanation}
            </div>
          )}
        </div>
      )}

      {/* Main visualization grid */}
      {steps.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: fullscreen ? '1.3fr 0.7fr' : '1.15fr 0.85fr', gap: 12 }}>
          {/* LEFT: SVG structures + Variables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(structures).map(([id, struct]) => (
              <div key={id} style={{ background: '#0e0e12', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', padding: 12, overflow: 'hidden' }}>
                <div dangerouslySetInnerHTML={{ __html: renderStructure(struct.type, struct, highlights[id] || {}, fullscreen ? 620 : 440, 280) }} />
              </div>
            ))}
            {step && (
              <div style={{ background: '#0e0e12', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', padding: '10px 6px' }}>
                <div style={{ fontSize: 10, fontWeight: 650, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px 6px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>Variables & Memory</div>
                <VarTable variables={step.variables} changedVars={step.changedVars} />
              </div>
            )}
          </div>
          {/* RIGHT: Algorithm pseudocode + Log + Source */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {step?.codeLines?.length > 0 && (
              <div style={{ background: '#0e0e12', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', padding: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 650, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Algorithm {step.codeLine >= 0 ? `— Line ${step.codeLine + 1}` : ''}
                </div>
                <PseudoView lines={step.codeLines} active={step.codeLine} />
              </div>
            )}
            <div style={{ background: '#0e0e12', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', padding: 10, flex: 1, maxHeight: 300, overflowY: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 650, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Execution Log</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, lineHeight: 2 }}>
                {steps.slice(0, stepIdx + 1).map((s, i) => (
                  <div key={i} style={{ color: i === stepIdx ? (s.color || '#93c5fd') : '#3f3f46', fontWeight: i === stepIdx ? 600 : 400, paddingLeft: 4, borderLeft: i === stepIdx ? `2px solid ${s.color || '#4f8ff7'}` : '2px solid transparent' }}>
                    {i === stepIdx ? '▸ ' : '  '}{s.message}
                  </div>
                ))}
              </div>
            </div>
            {code && (
              <div style={{ background: '#0e0e12', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <button onClick={() => setShowSource(!showSource)} style={{
                  width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                  color: '#3f3f46', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 5, textAlign: 'left',
                }}><Code2 size={12} /> {showSource ? 'Hide' : 'Show'} Your Source Code</button>
                {showSource && <SourceCode code={code} stepMessage={step?.message} />}
              </div>
            )}
            {/* Debug: show transpiled code */}
            {code && (
              <div style={{ background: '#0e0e12', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <button onClick={() => setShowTranspiled(!showTranspiled)} style={{
                  width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                  color: '#2a2a33', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 5, textAlign: 'left',
                }}><Terminal size={12} /> {showTranspiled ? 'Hide' : 'Show'} Transpiled JS (debug)</button>
                {showTranspiled && <SourceCode code={transpiledCode} />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {steps.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: 36, color: '#3f3f46' }}>
          <Sparkles size={32} style={{ opacity: 0.2, marginBottom: 10 }} />
          <div style={{ fontSize: 14, marginBottom: 6, fontWeight: 600, color: '#52525b' }}>Universal Viz Engine</div>
          <div style={{ fontSize: 12, marginBottom: 4, color: '#3f3f46' }}>
            {code ? 'Enter a test case and click Visualize to see your code execute step-by-step' : 'Add code to the solution, then visualize it here'}
          </div>
          <div style={{ fontSize: 11, color: '#2a2a33', marginTop: 8, lineHeight: 1.8 }}>
            <div>✓ Works with Java, C++, Python, and JavaScript</div>
            <div>✓ Tries executing your actual code first</div>
            <div>✓ Falls back to pre-built algorithm tracers</div>
            <div>✓ Auto-detects algorithm pattern from code + context</div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.95)', padding: 20, overflowY: 'auto' }}
        onClick={(e) => { if (e.target === e.currentTarget) setFullscreen(false); }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', background: '#0a0a0c', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fafaf9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} style={{ color: '#a78bfa' }} /> Universal Viz Engine
            </div>
            <button onClick={() => setFullscreen(false)} style={{ padding: '5px 14px', borderRadius: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={13} /> Close
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
