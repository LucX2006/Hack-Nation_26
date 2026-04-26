import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ShieldCheck, Send, ChevronDown, ChevronUp, MessageSquare, Sparkles } from 'lucide-react';
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
  const [expandedReasoningId, setExpandedReasoningId] = useState<number | null>(null);

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUp.trim()) {
      onNewQuery(followUp);
      setFollowUp('');
    }
  };

  const suggestedQuestions = [
    "Are there better options within 50km?",
    "Which facility has the highest trust score for surgery?",
    "Show me the regional risk for this district.",
    "What are the common trust flags for these results?"
  ];

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
          
          {/* Upper Scrollable Part: Results */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <section className="p-6 border-b border-slate-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg">
                  {data.query_type === 'regional_gap' ? 'Regional Risk Rankings' : 'Facility Match Results'}
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
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
                        className={`p-4 bg-white border rounded-xl transition-all cursor-pointer group ${isHovered ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-lg' : 'border-slate-100 shadow-sm hover:border-blue-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-semibold transition-colors ${isHovered ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'}`}>{region.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${region.risk_score > 0.8 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
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
                    const isReasoningExpanded = expandedReasoningId === facility.rank;
                    
                    return (
                      <div 
                        key={facility.rank} 
                        onMouseEnter={() => setHoveredId(facility.rank)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`bg-white border rounded-xl transition-all cursor-pointer group flex flex-col overflow-hidden ${isHovered ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-lg' : 'border-slate-100 shadow-sm hover:border-blue-200'}`}
                      >
                        <div className="p-4" onClick={() => setExpandedReasoningId(isReasoningExpanded ? null : facility.rank)}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-semibold text-sm transition-colors pr-6 ${isHovered ? 'text-blue-600' : 'text-slate-800'}`}>
                              {facility.facility_name}
                            </h4>
                            <span className="text-xs font-bold text-blue-500 shrink-0">#{facility.rank}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-3">{facility.district}, {facility.state}</p>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${isHovered ? 'bg-blue-600' : 'bg-blue-500'}`} style={{ width: `${facility.match_score * 100}%` }}></div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Match {(facility.match_score * 100).toFixed(0)}%</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-blue-600/70 font-medium">
                            <span>Show reasoning</span>
                            {isReasoningExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </div>
                        </div>

                        {isReasoningExpanded && (
                          <div className="px-4 pb-4 pt-2 bg-blue-50/30 border-t border-blue-50 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex gap-2">
                              <Sparkles size={12} className="text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                                {facility.reasoning_summary?.[0] || "No specific reasoning available."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Lower Part: Sticky Suggestions & Input */}
          <section className="p-6 bg-slate-50/50 border-t border-slate-100 shrink-0 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold text-sm">
                <div className="p-1 bg-blue-600 rounded text-white">
                  <MessageSquare size={14} />
                </div>
                <h3>Suggested Follow-up</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button 
                    key={i}
                    onClick={() => onNewQuery(q)}
                    className="text-left px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm active:scale-[0.98]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Follow-up Prompt Field */}
            <form onSubmit={handleFollowUpSubmit} className="relative group">
              <input
                type="text"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="w-full bg-white border border-slate-200 rounded-full py-3.5 pl-5 pr-12 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm group-hover:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
          </section>
        </aside>
      </main>
    </div>
  );
};
