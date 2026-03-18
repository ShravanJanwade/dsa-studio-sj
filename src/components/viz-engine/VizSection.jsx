import { useState } from 'react';
import { Eye, Cpu } from 'lucide-react';
import { VizPanel } from '@/components/panels/Widgets';
import VizEngine from '@/components/viz-engine/VizEngine';

export default function VizSection({ vizHtml, code, intuition, stepsText, approachType }) {
  const [tab, setTab] = useState(vizHtml ? 'html' : 'engine');
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {vizHtml && <TabBtn active={tab === 'html'} onClick={() => setTab('html')} icon={Eye} label="Uploaded Viz" />}
        <TabBtn active={tab === 'engine'} onClick={() => setTab('engine')} icon={Cpu} label="Viz Engine" />
      </div>
      {tab === 'html' && vizHtml && (
        <div style={{ background: '#0e0e12', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <VizPanel html={vizHtml} />
        </div>
      )}
      {tab === 'engine' && (
        <div style={{ background: '#0e0e12', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 16 }}>
          <VizEngine code={code} intuition={intuition} stepsText={stepsText} approachType={approachType} />
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 7,
      background: active ? 'rgba(79,143,247,0.1)' : 'transparent',
      border: `1px solid ${active ? 'rgba(79,143,247,0.2)' : 'rgba(255,255,255,0.06)'}`,
      color: active ? '#93c5fd' : '#52525b', fontSize: 11.5, fontWeight: 550,
      cursor: 'pointer', fontFamily: 'inherit',
    }}><Icon size={12} /> {label}</button>
  );
}
