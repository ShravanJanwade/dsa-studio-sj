import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pencil, Circle, Square, Minus, ArrowRight, Type, Eraser,
  Undo2, Redo2, Trash2, Download, MousePointer,
} from 'lucide-react';

// ═══════════════════════════════════════════════
// DRAWING CANVAS — Freehand + shapes for dry run
// ═══════════════════════════════════════════════

const TOOLS = [
  { key: 'select', icon: MousePointer, label: 'Select' },
  { key: 'pencil', icon: Pencil, label: 'Pencil' },
  { key: 'line', icon: Minus, label: 'Line' },
  { key: 'rect', icon: Square, label: 'Rectangle' },
  { key: 'circle', icon: Circle, label: 'Circle' },
  { key: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { key: 'text', icon: Type, label: 'Text' },
  { key: 'eraser', icon: Eraser, label: 'Eraser' },
];

const COLORS = [
  '#e4e4e7', '#93c5fd', '#a78bfa', '#34d399',
  '#fbbf24', '#f87171', '#fb923c', '#22d3ee',
  '#e879f9', '#4f8ff7',
];

const GRID_SIZE = 20;

export default function DrawingCanvas({ onTemplateReady }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#93c5fd');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [textInput, setTextInput] = useState(null);

  // Elements array — each item is a shape/stroke
  const [elements, setElements] = useState([]);

  // Save to history
  const pushHistory = useCallback((newElements) => {
    const trimmed = history.slice(0, historyIdx + 1);
    trimmed.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(trimmed);
    setHistoryIdx(trimmed.length - 1);
  }, [history, historyIdx]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIdx - 1])));
    } else if (historyIdx === 0) {
      setHistoryIdx(-1);
      setElements([]);
    }
  }, [historyIdx, history]);

  const redo = useCallback(() => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIdx + 1])));
    }
  }, [historyIdx, history]);

  const clearAll = useCallback(() => {
    setElements([]);
    pushHistory([]);
  }, [pushHistory]);

  // Expose addTemplate for DSTemplates
  useEffect(() => {
    if (onTemplateReady) {
      onTemplateReady({
        addElements: (newEls) => {
          setElements((prev) => {
            const merged = [...prev, ...newEls];
            pushHistory(merged);
            return merged;
          });
        },
        getCanvasSize: () => {
          const c = canvasRef.current;
          return c ? { w: c.width, h: c.height } : { w: 800, h: 600 };
        },
      });
    }
  }, [onTemplateReady, pushHistory]);

  // Resize canvas to fill container
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      const o = overlayRef.current;
      if (!c || !o) return;
      const parent = c.parentElement;
      const rect = parent.getBoundingClientRect();
      c.width = rect.width;
      c.height = rect.height;
      o.width = rect.width;
      o.height = rect.height;
      redraw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Redraw when elements change
  useEffect(() => { redraw(); }, [elements, showGrid]);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < c.width; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
      }
      for (let y = 0; y < c.height; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
      }
    }

    // Draw elements
    elements.forEach((el) => drawElement(ctx, el));
  }, [elements, showGrid]);

  function drawElement(ctx, el) {
    ctx.strokeStyle = el.color || '#93c5fd';
    ctx.fillStyle = el.color || '#93c5fd';
    ctx.lineWidth = el.strokeWidth || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (el.type) {
      case 'pencil':
        if (el.points && el.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(el.x1, el.y1);
        ctx.lineTo(el.x2, el.y2);
        ctx.stroke();
        break;
      case 'arrow': {
        ctx.beginPath();
        ctx.moveTo(el.x1, el.y1);
        ctx.lineTo(el.x2, el.y2);
        ctx.stroke();
        // Arrowhead
        const angle = Math.atan2(el.y2 - el.y1, el.x2 - el.x1);
        const headLen = 12;
        ctx.beginPath();
        ctx.moveTo(el.x2, el.y2);
        ctx.lineTo(el.x2 - headLen * Math.cos(angle - Math.PI / 6), el.y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(el.x2, el.y2);
        ctx.lineTo(el.x2 - headLen * Math.cos(angle + Math.PI / 6), el.y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
        break;
      }
      case 'rect':
        ctx.strokeRect(el.x, el.y, el.w, el.h);
        break;
      case 'filledRect':
        ctx.fillRect(el.x, el.y, el.w, el.h);
        break;
      case 'circle': {
        const rx = Math.abs(el.w) / 2;
        const ry = Math.abs(el.h) / 2;
        const cx = el.x + el.w / 2;
        const cy = el.y + el.h / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'filledCircle': {
        const rx2 = Math.abs(el.w) / 2;
        const ry2 = Math.abs(el.h) / 2;
        const cx2 = el.x + el.w / 2;
        const cy2 = el.y + el.h / 2;
        ctx.beginPath();
        ctx.ellipse(cx2, cy2, rx2, ry2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'text':
        ctx.font = `${el.fontSize || 14}px 'JetBrains Mono', 'Fira Code', monospace`;
        ctx.fillText(el.text, el.x, el.y);
        break;
      case 'eraser':
        if (el.points && el.points.length > 1) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = (el.strokeWidth || 2) * 5;
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
        }
        break;
    }
  }

  // Get mouse position relative to canvas
  const getPos = (e) => {
    const c = overlayRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    const pos = getPos(e);
    setDrawing(true);
    setStartPos(pos);

    if (tool === 'pencil' || tool === 'eraser') {
      setCurrentPath([pos]);
    } else if (tool === 'text') {
      setTextInput({ x: pos.x, y: pos.y, text: '' });
      setDrawing(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    const o = overlayRef.current;
    if (!o) return;
    const ctx = o.getContext('2d');
    ctx.clearRect(0, 0, o.width, o.height);

    if (tool === 'pencil' || tool === 'eraser') {
      setCurrentPath((prev) => [...prev, pos]);
      // Draw preview on overlay
      const el = {
        type: tool, points: [...currentPath, pos],
        color, strokeWidth,
      };
      drawElement(ctx, el);
    } else if (tool === 'line' || tool === 'arrow') {
      const el = {
        type: tool, x1: startPos.x, y1: startPos.y, x2: pos.x, y2: pos.y,
        color, strokeWidth,
      };
      drawElement(ctx, el);
    } else if (tool === 'rect') {
      const el = {
        type: 'rect', x: startPos.x, y: startPos.y,
        w: pos.x - startPos.x, h: pos.y - startPos.y,
        color, strokeWidth,
      };
      drawElement(ctx, el);
    } else if (tool === 'circle') {
      const el = {
        type: 'circle', x: startPos.x, y: startPos.y,
        w: pos.x - startPos.x, h: pos.y - startPos.y,
        color, strokeWidth,
      };
      drawElement(ctx, el);
    }
  };

  const handleMouseUp = (e) => {
    if (!drawing) return;
    setDrawing(false);
    const pos = getPos(e);
    const o = overlayRef.current;
    if (o) o.getContext('2d').clearRect(0, 0, o.width, o.height);

    let newEl = null;
    if (tool === 'pencil' || tool === 'eraser') {
      newEl = { type: tool, points: [...currentPath, pos], color, strokeWidth };
    } else if (tool === 'line' || tool === 'arrow') {
      newEl = { type: tool, x1: startPos.x, y1: startPos.y, x2: pos.x, y2: pos.y, color, strokeWidth };
    } else if (tool === 'rect') {
      newEl = { type: 'rect', x: startPos.x, y: startPos.y, w: pos.x - startPos.x, h: pos.y - startPos.y, color, strokeWidth };
    } else if (tool === 'circle') {
      newEl = { type: 'circle', x: startPos.x, y: startPos.y, w: pos.x - startPos.x, h: pos.y - startPos.y, color, strokeWidth };
    }

    if (newEl) {
      const next = [...elements, newEl];
      setElements(next);
      pushHistory(next);
    }
    setCurrentPath([]);
    setStartPos(null);
  };

  const handleTextSubmit = () => {
    if (textInput && textInput.text.trim()) {
      const el = {
        type: 'text', x: textInput.x, y: textInput.y,
        text: textInput.text, color, fontSize: strokeWidth * 6 + 8,
      };
      const next = [...elements, el];
      setElements(next);
      pushHistory(next);
    }
    setTextInput(null);
  };

  const exportPNG = () => {
    const c = canvasRef.current;
    if (!c) return;
    const link = document.createElement('a');
    link.download = 'dsa-dry-run.png';
    link.href = c.toDataURL('image/png');
    link.click();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (textInput) return; // don't capture while typing
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, textInput]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0c', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)', flexShrink: 0, flexWrap: 'wrap',
      }}>
        {/* Tools */}
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const active = tool === t.key;
          return (
            <button key={t.key} onClick={() => setTool(t.key)} title={t.label} style={{
              padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: active ? 'rgba(79,143,247,0.15)' : 'transparent',
              color: active ? '#93c5fd' : '#52525b', display: 'flex', alignItems: 'center',
              gap: 4, fontSize: 11, fontWeight: active ? 600 : 400, fontFamily: 'inherit',
              transition: 'all 0.12s',
            }}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />

        {/* Colors */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 16, height: 16, borderRadius: '50%', border: color === c ? '2px solid #fff' : '2px solid transparent',
              background: c, cursor: 'pointer', transition: 'all 0.12s',
              boxShadow: color === c ? `0 0 8px ${c}40` : 'none',
            }} />
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />

        {/* Stroke width */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#52525b', fontWeight: 600 }}>Size</span>
          <input type="range" min={1} max={8} value={strokeWidth} onChange={(e) => setStrokeWidth(+e.target.value)}
            style={{ width: 60, accentColor: '#4f8ff7' }} />
          <span style={{ fontSize: 10, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", minWidth: 16 }}>{strokeWidth}</span>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />

        {/* Actions */}
        <button onClick={undo} title="Undo (Ctrl+Z)" style={actionBtnStyle}>
          <Undo2 size={13} /> Undo
        </button>
        <button onClick={redo} title="Redo (Ctrl+Y)" style={actionBtnStyle}>
          <Redo2 size={13} /> Redo
        </button>
        <button onClick={clearAll} title="Clear All" style={{ ...actionBtnStyle, color: '#f87171' }}>
          <Trash2 size={13} /> Clear
        </button>
        <button onClick={exportPNG} title="Export PNG" style={actionBtnStyle}>
          <Download size={13} /> Export
        </button>

        <div style={{ flex: 1 }} />

        {/* Grid toggle */}
        <button onClick={() => setShowGrid(!showGrid)} style={{
          ...actionBtnStyle, color: showGrid ? '#93c5fd' : '#3f3f46',
        }}>
          Grid {showGrid ? 'On' : 'Off'}
        </button>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative', cursor: tool === 'text' ? 'text' : 'crosshair', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
        <canvas ref={overlayRef} style={{ position: 'absolute', inset: 0 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { if (drawing) handleMouseUp({ clientX: 0, clientY: 0 }); }}
        />
        {/* Text input overlay */}
        {textInput && (
          <input
            autoFocus
            value={textInput.text}
            onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); if (e.key === 'Escape') setTextInput(null); }}
            onBlur={handleTextSubmit}
            style={{
              position: 'absolute', left: textInput.x, top: textInput.y - 10,
              background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(79,143,247,0.4)',
              borderRadius: 4, color, padding: '4px 8px', fontSize: strokeWidth * 6 + 8,
              fontFamily: "'JetBrains Mono', monospace", outline: 'none', minWidth: 100,
            }}
          />
        )}
      </div>
    </div>
  );
}

const actionBtnStyle = {
  padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
  background: 'transparent', color: '#71717a', display: 'flex', alignItems: 'center',
  gap: 4, fontSize: 11, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.12s',
};
