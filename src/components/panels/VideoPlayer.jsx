import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Youtube, Maximize2, Minimize2, X, SplitSquareHorizontal,
  Clock, Bookmark, Camera, Trash2, Play, Eye, List, Code2,
  ChevronDown, Bold, ListOrdered, Code, Heading, Minus,
  GripHorizontal, MonitorUp, AlertCircle,
} from 'lucide-react';
import MarkdownRenderer from '@/components/panels/MarkdownRenderer';
import CodePanel from '@/components/panels/CodePanel';
import { VizPanel } from '@/components/panels/Widgets';

// ═══ Helpers ═══
function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function fmtTime(s) {
  const sec = Math.floor(s || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}` : `${m}:${String(ss).padStart(2,'0')}`;
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ═══ Screen Capture — keeps stream alive for instant subsequent captures ═══
let screenStream = null;

async function captureScreenFrame() {
  // First call: browser shows "Choose what to share" dialog
  // After that: captures instantly with no popup
  if (!screenStream || !screenStream.active) {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'never', displaySurface: 'browser' },
      audio: false,
    });
    // When user clicks "Stop sharing", clean up
    screenStream.getVideoTracks()[0].onended = () => { screenStream = null; };
  }

  const track = screenStream.getVideoTracks()[0];

  // Create a temporary video element to read the current frame
  const video = document.createElement('video');
  video.srcObject = new MediaStream([track]);
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;

  await new Promise((r) => { video.onloadeddata = r; });
  // Small delay to ensure frame is rendered
  await new Promise((r) => setTimeout(r, 100));

  // Draw to canvas and compress
  const w = video.videoWidth;
  const h = video.videoHeight;
  const maxW = 1280;
  const scale = w > maxW ? maxW / w : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  video.srcObject = null; // release
  return canvas.toDataURL('image/png');
}

// ═══ YouTube postMessage controller ═══
function useYTControl(iframeRef) {
  const timeRef = useRef(0);
  useEffect(() => {
    const handler = (e) => {
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d?.event === 'infoDelivery' && d.info?.currentTime !== undefined)
          timeRef.current = d.info.currentTime;
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  const postCmd = useCallback((func, args) => {
    try { iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: args || [] }), '*'); } catch {}
  }, [iframeRef]);
  const listen = useCallback(() => {
    try { iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), '*'); } catch {}
  }, [iframeRef]);
  const seekTo = useCallback((s) => postCmd('seekTo', [s, true]), [postCmd]);
  const getTime = useCallback(() => timeRef.current, []);
  return { seekTo, getTime, listen };
}

// ═══ Small UI components ═══
function TimeBadge({ seconds, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
      background: 'rgba(79,143,247,0.12)', color: '#93c5fd',
      fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace",
      transition: 'background 0.15s', flexShrink: 0,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(79,143,247,0.25)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(79,143,247,0.12)'; }}
    ><Play size={9} fill="#93c5fd" /> {fmtTime(seconds)}</button>
  );
}

function TBtn({ icon: Icon, label, onClick, color }) {
  return (
    <button onClick={onClick} title={label} style={{
      padding: 5, borderRadius: 5, border: 'none', cursor: 'pointer',
      background: 'transparent', color: color || '#52525b', display: 'flex',
      alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = color || '#a1a1aa'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color || '#52525b'; }}
    ><Icon size={14} /></button>
  );
}

// ═══ MAIN VIDEO PLAYER ═══
export default function VideoPlayer({
  url, videoNotes = [], onVideoNotesChange,
  videoTimestamp = 0, onVideoTimestampChange,
  notes, onNotesChange, solution,
}) {
  const videoId = getYoutubeId(url);
  const [mode, setMode] = useState('inline');
  const [noteText, setNoteText] = useState('');
  const [bottomTab, setBottomTab] = useState(null);
  const [bottomH, setBottomH] = useState(260);
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState('');

  const iframeRef = useRef(null);
  const initialTsRef = useRef(videoTimestamp);
  const notesRef = useRef(null);
  const resizing = useRef(false);

  const { seekTo, getTime, listen } = useYTControl(iframeRef);

  // Auto-save timestamp — no state update, just DB persist
  useEffect(() => {
    const iv = setInterval(() => {
      const t = getTime();
      if (t > 0 && onVideoTimestampChange) onVideoTimestampChange(t);
    }, 10000);
    return () => clearInterval(iv);
  }, [getTime, onVideoTimestampChange]);

  useEffect(() => {
    return () => {
      const t = getTime();
      if (t > 0 && onVideoTimestampChange) onVideoTimestampChange(t);
    };
  }, []);

  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&start=${Math.floor(initialTsRef.current || 0)}`;
  const isOverlay = mode === 'fullscreen' || mode === 'split';

  const handleIframeLoad = () => { listen(); setTimeout(() => listen(), 2000); };

  // ── Insert at cursor in textarea ──
  const insertAtCursor = (text) => {
    const ta = notesRef.current;
    if (!ta) { onNotesChange((notes || '') + text); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    onNotesChange((notes || '').substring(0, start) + text + (notes || '').substring(end));
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + text.length; ta.focus(); }, 0);
  };

  // ── Bookmark ──
  const addBookmark = () => {
    const t = getTime();
    onVideoNotesChange([...videoNotes, {
      id: uid(), type: 'bookmark', content: noteText.trim() || 'Bookmarked',
      seconds: t, createdAt: Date.now(),
    }]);
    insertAtCursor(`\n🔖 [${fmtTime(t)}] ${noteText.trim() || 'Bookmarked'}\n`);
    setNoteText('');
  };

  // ── CAPTURE SCREENSHOT — one click, real image ──
  const captureScreenshot = async () => {
    setCapturing(true);
    setCaptureError('');
    try {
      const dataUrl = await captureScreenFrame();
      if (!dataUrl) throw new Error('No frame captured');
      const t = getTime();
      const caption = noteText.trim() || `Screenshot at ${fmtTime(t)}`;

      // Store the real image in video_notes
      onVideoNotesChange([...videoNotes, {
        id: uid(), type: 'capture', content: caption,
        seconds: t, image: dataUrl, createdAt: Date.now(),
      }]);

      // Insert clean text marker in notes — NO base64, just a reference
      insertAtCursor(`\n📸 [${fmtTime(t)}] ${caption}\n`);
      setNoteText('');
    } catch (err) {
      setCaptureError(err.name === 'NotAllowedError'
        ? 'Permission denied — click Capture and select your browser tab'
        : 'Capture failed — try again');
      setTimeout(() => setCaptureError(''), 4000);
    } finally {
      setCapturing(false);
    }
  };

  const insertTimestamp = () => insertAtCursor(`[${fmtTime(getTime())}] `);
  const deleteMoment = (id) => onVideoNotesChange(videoNotes.filter((n) => n.id !== id));
  const toolbarInsert = (before, after = '') => {
    const ta = notesRef.current; if (!ta) return;
    const sel = (notes || '').substring(ta.selectionStart, ta.selectionEnd);
    insertAtCursor(before + (sel || 'text') + after);
  };

  // ── Resize ──
  const onResizeStart = (e) => {
    e.preventDefault(); resizing.current = true;
    const startY = e.clientY, startH = bottomH;
    const onMove = (ev) => { if (resizing.current) setBottomH(Math.max(100, Math.min(500, startH + (startY - ev.clientY)))); };
    const onUp = () => { resizing.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── Stable iframe ──
  const videoIframe = (
    <iframe key={videoId} ref={iframeRef} src={embedUrl} onLoad={handleIframeLoad}
      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
  );

  // ── Mode bar ──
  const modeButtons = [
    { key: 'inline', icon: Youtube, label: 'Inline' },
    { key: 'split', icon: SplitSquareHorizontal, label: 'Split + Notes' },
    { key: 'fullscreen', icon: Maximize2, label: 'Theater' },
  ];
  const modeBar = (
    <div style={{ display: 'flex', gap: 3 }}>
      {modeButtons.map((m) => {
        const Icon = m.icon; const active = mode === m.key;
        return (
          <button key={m.key} onClick={() => setMode(m.key)} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7,
            background: active ? 'rgba(79,143,247,0.12)' : 'transparent',
            border: `1px solid ${active ? 'rgba(79,143,247,0.25)' : 'rgba(255,255,255,0.06)'}`,
            color: active ? '#93c5fd' : '#52525b', fontSize: 11, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}><Icon size={12} /> {m.label}</button>
        );
      })}
    </div>
  );

  // ── Bottom panel (Viz / Algo / Code) ──
  const bottomTabs = [
    { key: 'viz', icon: Eye, label: 'Visualization' },
    { key: 'algo', icon: List, label: 'Algorithm' },
    { key: 'code', icon: Code2, label: 'Code' },
  ];
  const bottomPanel = (
    <div style={{ flexShrink: 0 }}>
      {bottomTab && (
        <div onMouseDown={onResizeStart} style={{
          height: 8, cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)',
        }}><GripHorizontal size={14} style={{ color: '#2a2a33' }} /></div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px 12px',
        borderTop: bottomTab ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
        {bottomTabs.map((t) => {
          const Icon = t.icon; const active = bottomTab === t.key;
          return (
            <button key={t.key} onClick={() => setBottomTab(active ? null : t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6,
              background: active ? 'rgba(79,143,247,0.1)' : 'transparent',
              border: `1px solid ${active ? 'rgba(79,143,247,0.2)' : 'transparent'}`,
              color: active ? '#93c5fd' : '#3f3f46', fontSize: 11, fontWeight: 550,
              cursor: 'pointer', fontFamily: 'inherit',
            }}><Icon size={11} /> {t.label}</button>
          );
        })}
        {bottomTab && (
          <button onClick={() => setBottomTab(null)} style={{
            marginLeft: 'auto', padding: '3px 8px', borderRadius: 5, border: 'none',
            background: 'transparent', color: '#3f3f46', cursor: 'pointer', display: 'flex',
          }}><ChevronDown size={12} /></button>
        )}
      </div>
      {bottomTab && solution && (
        <div style={{ height: bottomH, overflowY: 'auto', padding: '0 12px 12px' }}>
          {bottomTab === 'viz' && solution.visualization_html && (
            <div style={{ background: '#0e0e12', borderRadius: 8, overflow: 'hidden' }}><VizPanel html={solution.visualization_html} /></div>
          )}
          {bottomTab === 'viz' && !solution.visualization_html && (
            <div style={{ color: '#3f3f46', fontSize: 12, fontStyle: 'italic', padding: 20, textAlign: 'center' }}>No visualization</div>
          )}
          {bottomTab === 'algo' && solution.algorithm && (
            <div style={{ background: '#0e0e12', borderRadius: 8, padding: 14 }}><MarkdownRenderer content={solution.algorithm} /></div>
          )}
          {bottomTab === 'algo' && !solution.algorithm && (
            <div style={{ color: '#3f3f46', fontSize: 12, fontStyle: 'italic', padding: 20, textAlign: 'center' }}>No algorithm</div>
          )}
          {bottomTab === 'code' && solution.code && (
            <div style={{ background: '#0e0e12', borderRadius: 8, overflow: 'auto', height: '100%' }}>
              <CodePanel code={solution.code} language={solution.language || 'java'} visible onToggle={() => {}} />
            </div>
          )}
          {bottomTab === 'code' && !solution.code && (
            <div style={{ color: '#3f3f46', fontSize: 12, fontStyle: 'italic', padding: 20, textAlign: 'center' }}>No code</div>
          )}
        </div>
      )}
    </div>
  );

  // ── Notes panel ──
  const notesPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#0a0a0c', overflow: 'hidden', height: '100%' }}>
      {/* Action bar */}
      <div style={{ display: 'flex', gap: 5, padding: '8px 12px', flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0, alignItems: 'center' }}>
        <button onClick={addBookmark} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7,
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
          color: '#fbbf24', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}><Bookmark size={12} /> Bookmark</button>
        <button onClick={captureScreenshot} disabled={capturing} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7,
          background: capturing ? 'rgba(167,139,250,0.2)' : 'rgba(167,139,250,0.1)',
          border: '1px solid rgba(167,139,250,0.2)',
          color: '#a78bfa', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          opacity: capturing ? 0.6 : 1,
        }}><Camera size={12} /> {capturing ? 'Capturing...' : 'Capture Screen'}</button>
        <button onClick={insertTimestamp} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7,
          background: 'rgba(79,143,247,0.1)', border: '1px solid rgba(79,143,247,0.2)',
          color: '#93c5fd', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}><Clock size={12} /> Timestamp</button>
        {captureError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.15)',
            borderRadius: 7, fontSize: 11, color: '#fca5a5' }}>
            <AlertCircle size={12} /> {captureError}
          </div>
        )}
      </div>

      {/* Quick note input */}
      <div style={{ padding: '6px 12px', flexShrink: 0 }}>
        <input value={noteText} onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addBookmark(); }}
          placeholder="Label for bookmark/capture (Enter to save)..."
          style={{
            width: '100%', padding: '7px 12px', borderRadius: 8,
            background: '#111114', border: '1px solid rgba(255,255,255,0.05)',
            color: '#b8b8be', fontSize: 12, outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Moments gallery */}
      {videoNotes.length > 0 && (
        <div style={{ padding: '6px 12px', flexShrink: 0, maxHeight: 280, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 650, color: '#3f3f46', textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: 5 }}>
            Moments ({videoNotes.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {videoNotes.map((n) => (
              <div key={n.id} style={{
                background: '#111114', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden',
              }}>
                {/* Real screenshot image — rendered as actual img, not base64 string */}
                {n.image && (
                  <img src={n.image} alt={n.content} style={{
                    width: '100%', maxHeight: 180, objectFit: 'contain',
                    display: 'block', background: '#000',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }} />
                )}
                {/* Info row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px' }}>
                  <TimeBadge seconds={n.seconds} onClick={() => seekTo(n.seconds)} />
                  <span style={{ flex: 1, fontSize: 12, color: '#a1a1aa', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</span>
                  {n.type === 'capture' && <Camera size={10} style={{ color: '#a78bfa', flexShrink: 0 }} />}
                  <button onClick={() => deleteMoment(n.id)} style={{
                    padding: 3, border: 'none', background: 'transparent',
                    color: '#1a1a20', cursor: 'pointer', display: 'flex', flexShrink: 0,
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a20'; }}
                  ><Trash2 size={10} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 1, padding: '4px 12px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0,
      }}>
        <TBtn icon={Bold} label="Bold" onClick={() => toolbarInsert('**', '**')} />
        <TBtn icon={Heading} label="Heading" onClick={() => insertAtCursor('\n## ')} />
        <TBtn icon={ListOrdered} label="Bullet" onClick={() => insertAtCursor('\n- ')} />
        <TBtn icon={Code} label="Code" onClick={() => toolbarInsert('\n```\n', '\n```\n')} />
        <TBtn icon={Minus} label="Divider" onClick={() => insertAtCursor('\n---\n')} />
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />
        <TBtn icon={Clock} label="Timestamp" onClick={insertTimestamp} color="#4f8ff7" />
        <TBtn icon={Camera} label="Capture" onClick={captureScreenshot} color="#a78bfa" />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: '#2a2a33' }}>Markdown</span>
      </div>

      {/* Notes textarea — NO images here, just clean text */}
      <div style={{ flex: 1, padding: '0 12px 8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <textarea ref={notesRef} value={notes || ''} onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Take notes while watching... screenshots appear in the Moments section above."
          style={{
            flex: 1, width: '100%', background: '#111114',
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8,
            padding: 12, fontSize: 13, color: '#b8b8be',
            fontFamily: "'JetBrains Mono',monospace", resize: 'none',
            outline: 'none', lineHeight: 1.8, minHeight: 0, marginTop: 6,
          }}
        />
      </div>

      {solution && bottomPanel}
    </div>
  );

  // ═══ RENDER ═══
  return (
    <>
      {/* Inline */}
      <div className="px-8 py-5 border-b border-border-1" style={{ display: isOverlay ? 'none' : 'block' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(248,113,113,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Youtube size={15} style={{ color: '#f87171' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fafaf9' }}>Video Explanation</span>
            {initialTsRef.current > 0 && (
              <span style={{ fontSize: 11, color: '#52525b', fontFamily: "'JetBrains Mono',monospace" }}>
                Resuming at {fmtTime(initialTsRef.current)}
              </span>
            )}
          </div>
          {modeBar}
        </div>
        {!isOverlay && (
          <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', aspectRatio: '16/9', maxHeight: 420 }}>
            {videoIframe}
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOverlay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'stretch' }}>
          <div style={{ width: '100%', height: '100%', background: '#08080a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)', flexShrink: 0, minHeight: 44,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {mode === 'fullscreen'
                  ? <Youtube size={15} style={{ color: '#f87171' }} />
                  : <SplitSquareHorizontal size={15} style={{ color: '#4f8ff7' }} />}
                <span style={{ fontSize: 13.5, fontWeight: 650, color: '#fafaf9' }}>
                  {mode === 'fullscreen' ? 'Theater Mode' : 'Video + Notes'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {modeBar}
                <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />
                <button onClick={() => setMode('inline')} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#a1a1aa', fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}><X size={13} /> Close</button>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{
                flex: mode === 'split' ? '0 0 55%' : '1 1 100%', background: '#000',
                borderRight: mode === 'split' ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>{videoIframe}</div>
              {mode === 'split' && (
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{notesPanel}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}