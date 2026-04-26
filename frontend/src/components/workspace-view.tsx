import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ShieldCheck, Info, Send } from 'lucide-react';
import { MockResponse } from '../lib/mock-data';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./map-view'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
      Loading Maps Analysis...
    </div>
  )
});

interface WorkspaceProps {
  data: MockResponse;
  onNewQuery: (query: string) => void;
  onReset: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ data, onNewQuery, onReset }) => {
  const [followUp, setFollowUp] = useState('');
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUp.trim()) {
      onNewQuery(followUp);
      setFollowUp('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden">
      {/* Top Bar with Shadow */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-6 shrink-0 z-20 shadow-md">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-blue-600 font-bold text-xl shrink-0 hover:text-blue-700 transition-colors"
        >
          <ShieldCheck size={28} />
          <span>HealthPlan AI</span>
        </button>
        <div className="flex-1">
          <div className="text-xs text-slate-400 font-medium truncate max-w-xl">
            Active Query: <span className="text-slate-600 italic">"{data.query}"</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Left: Real Map Area */}
        <div className="flex-1 relative bg-slate-100 z-0">
          <MapView data={data} isDarkMode={false} hoveredId={hoveredId} onHover={setHoveredId} />
        </div>

        {/* Right: Panels Area with Shadow and elevated z-index */}
        <aside className="w-[450px] bg-white flex flex-col shrink-0 overflow-y-auto z-10 shadow-[0_0_40px_rgba(0,0,0,0.08)] border-l border-slate-100">

          {/* Upper Panel: Results Table */}
          <section className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">
                {data.query_type === 'regional_gap' ? 'Regional Risk Rankings' : 'Facility Match Results'}
              </h3>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded">
                {data.ranking.length || data.regions.length} items
              </span>
            </div>

            <div className="space-y-4 px-1 py-1">
              {data.query_type === 'regional_gap' ? (
                data.regions.map((region) => {
                  const isHovered = hoveredId === region.region_id;
                  return (
                    <div 
                      key={region.region_id} 
                      onMouseEnter={() => setHoveredId(region.region_id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`p-4 bg-white border rounded-xl transition-all cursor-pointer group ${isHovered ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-[0_15px_35px_rgba(0,0,0,0.16),0_0_15px_rgba(0,0,0,0.1)]' : 'border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.06)] hover:border-blue-200 hover:shadow-[0_15px_35px_rgba(0,0,0,0.16),0_0_15px_rgba(0,0,0,0.1)]'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold transition-colors ${isHovered ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'}`}>{region.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${region.risk_score > 0.8 ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                          Risk: {(region.risk_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Coverage: {(region.coverage_score * 100).toFixed(0)}%</span>
                        <span>Confidence: {(region.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                data.ranking.map((facility) => {
                  const isHovered = hoveredId === facility.rank;
                  return (
                    <div 
                      key={facility.rank} 
                      onMouseEnter={() => setHoveredId(facility.rank)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`p-4 bg-white border rounded-xl transition-all cursor-pointer group ${isHovered ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-[0_15px_35px_rgba(0,0,0,0.16),0_0_15px_rgba(0,0,0,0.1)]' : 'border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.06)] hover:border-blue-200 hover:shadow-[0_15px_35px_rgba(0,0,0,0.16),0_0_15px_rgba(0,0,0,0.1)]'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-semibold transition-colors ${isHovered ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'}`}>{facility.facility_name}</h4>
                        <span className="text-xs font-bold text-blue-600">#{facility.rank}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3">{facility.district}, {facility.state}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-colors ${isHovered ? 'bg-blue-600' : 'bg-blue-500'}`} style={{ width: `${facility.match_score * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Match {(facility.match_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Lower Panel: Reasoning & Trust */}
          <section className="p-6 space-y-8 flex-1 flex flex-col">
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                  <Info size={18} />
                </div>
                <h3>Reasoning & Evidence</h3>
              </div>

              <div className="space-y-4">
                {(data.ranking[0]?.reasoning_summary || data.regions[0]?.supporting_facts || []).map((text, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${data.query_type === 'regional_gap' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-slate-600 leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Prompt Field - Fully Rounded with Shadow */}
            <div className="mt-auto">
              <form onSubmit={handleFollowUpSubmit} className="relative group">
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="w-full bg-white border border-slate-200 rounded-full py-4 pl-6 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.1)] group-hover:shadow-[0_6px_35px_rgba(0,0,0,0.15)]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};
