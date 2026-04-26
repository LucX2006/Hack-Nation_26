import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ShieldCheck, Send, ChevronDown, ChevronUp, MessageSquare, Sparkles, Shield, BrainCircuit, Filter, Database } from 'lucide-react';
import { MockResponse, Constraint } from '../lib/mock-data';

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
  const [hoverSource, setHoverSource] = useState<'map' | 'sidebar' | null>(null);
  const [expandedReasoningId, setExpandedReasoningId] = useState<number | null>(null);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(true);
  
  // Resizing state
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [footerHeight, setFooterHeight] = useState(320);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingFooter, setIsResizingFooter] = useState(false);

  // Sync scroll ONLY when hoveredId changes from MAP source
  useEffect(() => {
    if (hoveredId && hoverSource === 'map') {
      const element = document.getElementById(`card-${hoveredId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [hoveredId, hoverSource]);

  const handleMapHover = useCallback((id: string | number | null) => {
    setHoverSource(id ? 'map' : null);
    setHoveredId(id);
  }, []);

  const handleSidebarHover = (id: string | number | null) => {
    setHoverSource(id ? 'sidebar' : null);
    setHoveredId(id);
  };

  // Resizing handlers
  const startResizingSidebar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  }, []);

  const startResizingFooter = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingFooter(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizingSidebar(false);
    setIsResizingFooter(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizingSidebar) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    }
    if (isResizingFooter) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 150 && newHeight < 600) {
        setFooterHeight(newHeight);
      }
    }
  }, [isResizingSidebar, isResizingFooter]);

  useEffect(() => {
    if (isResizingSidebar || isResizingFooter) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizingSidebar, isResizingFooter, resize, stopResizing]);

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
          <MapView data={data} isDarkMode={false} hoveredId={hoveredId} onHover={handleMapHover} />
        </div>

        {/* Sidebar Resize Handle (Invisible functional zone) */}
        <div 
          onMouseDown={startResizingSidebar}
          className="w-1 h-full cursor-col-resize z-30 bg-transparent"
        />

        {/* Right: Panels Area with Shadow and elevated z-index */}
        <aside 
          style={{ width: `${sidebarWidth}px` }}
          className="bg-white flex flex-col shrink-0 overflow-hidden z-10 shadow-[0_0_40px_rgba(0,0,0,0.08)] border-l border-slate-100 transition-[width] duration-75 ease-out"
        >
          
          {/* Upper Scrollable Part: Results */}
          <div className="flex-1 overflow-y-auto hide-scrollbar relative">
            
            {/* AI Reasoning Section */}
            {data.reasoning_steps && data.reasoning_steps.length > 0 && (
              <section className="p-6 border-b border-slate-50 bg-slate-50/30">
                <button 
                  onClick={() => setIsAiAnalysisOpen(!isAiAnalysisOpen)}
                  className="flex items-center justify-between w-full mb-4 text-slate-700 font-bold text-sm"
                >
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-blue-500" />
                    AI Query Analysis
                  </div>
                  {isAiAnalysisOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isAiAnalysisOpen && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Metrics Chips */}
                    <div className="flex flex-wrap gap-2">
                      {data.urgency && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${data.urgency === 'high' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          Urgency: {data.urgency}
                        </span>
                      )}
                      {data.candidate_pool_size !== undefined && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600">
                          <Database size={10} />
                          <span>Pool: {data.candidate_pool_size}</span>
                        </div>
                      )}
                    </div>

                    {/* Reasoning Steps */}
                    <div className="space-y-2">
                      {data.reasoning_steps.map((step: string, i: number) => (
                        <div key={i} className="flex gap-2 text-[11px] text-slate-500 leading-tight">
                          <span className="text-blue-400 font-bold">{i+1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Constraints / Filters */}
                    {data.constraints && data.constraints.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Filter size={10} />
                          <span>Applied Constraints</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {data.constraints.map((c: Constraint, i: number) => (
                            <div key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] text-slate-600 shadow-sm">
                              <span className="font-bold text-blue-500">{c.dimension}:</span> {String(c.value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            <section className="relative min-h-full">
              {/* Sticky Header with Fade Background */}
              <div className="sticky top-0 z-20 px-6 pt-6 pb-4 bg-white/95 backdrop-blur-sm border-b border-slate-50 flex items-center justify-between shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg">
                  {data.query_type === 'regional_gap' ? 'Regional Risk Rankings' : 'Facility Match Results'}
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                  {(data.ranking?.length || data.regions?.length || 0)} Results
                </span>
                {/* Visual fade extension */}
                <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-t from-transparent to-white/95 pointer-events-none" />
              </div>

              {/* Reduced pt to bring content higher up */}
              <div className="p-6 pt-4 pb-32 space-y-4 results-container hide-scrollbar">
                {data.query_type === 'regional_gap' ? (
                  [...data.regions]
                    .sort((a, b) => b.risk_score - a.risk_score)
                    .map((region) => {
                      const isHovered = hoveredId === region.region_id;
                    return (
                      <div 
                        key={region.region_id} 
                        id={`card-${region.region_id}`}
                        onMouseEnter={() => handleSidebarHover(region.region_id)}
                        onMouseLeave={() => handleSidebarHover(null)}
                        className={`card-3d-item p-4 bg-white border rounded-xl transition-all duration-300 cursor-pointer group ${isHovered ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-lg z-10' : 'border-slate-100 shadow-sm hover:border-blue-200'}`}
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
                        id={`card-${facility.rank}`}
                        onMouseEnter={() => handleSidebarHover(facility.rank)}
                        onMouseLeave={() => handleSidebarHover(null)}
                        className={`card-3d-item bg-white border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden ${isHovered ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-lg z-10' : 'border-slate-100 shadow-sm hover:border-blue-200'}`}
                      >

                        <div className="p-4" onClick={() => setExpandedReasoningId(isReasoningExpanded ? null : facility.rank)}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-semibold text-sm transition-colors pr-6 ${isHovered ? 'text-blue-600' : 'text-slate-800'}`}>
                              {facility.facility_name}
                            </h4>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-xs font-bold text-blue-500">#{facility.rank}</span>
                              {facility.trust_score !== undefined && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                  <Shield size={10} className={ facility.trust_score > 0.8 ? "text-green-500" : "text-amber-500" } />
                                  <span>Trust {(facility.trust_score * 100).toFixed(0)}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-3">{facility.district}, {facility.state}</p>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${isHovered ? 'bg-blue-600' : 'bg-blue-50'}`} style={{ width: `${facility.match_score * 100}%` }}></div>
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
              {/* Bottom Sticky Fade */}
              <div className="sticky-footer-fade" />
            </section>
          </div>

          {/* Footer Resize Handle (Invisible functional zone) */}
          <div 
            onMouseDown={startResizingFooter}
            className="h-1 w-full cursor-row-resize z-30 bg-transparent"
          />

          {/* Lower Part: Resizable Section with scrollable suggestions and fixed prompt bar */}
          <section 
            style={{ height: `${footerHeight}px` }}
            className="bg-slate-50/50 shrink-0 flex flex-col overflow-hidden"
          >
            {/* Scrollable Suggestions Area */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-6 pb-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold text-sm">
                  <div className="p-1 bg-blue-600 rounded text-white">
                    <MessageSquare size={14} />
                  </div>
                  <h3>Follow-up</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((q: string, i: number) => (
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
            </div>

            {/* Fixed Follow-up Prompt Area at the bottom of the section */}
            <div className="p-6 pt-2 bg-slate-50/80 backdrop-blur-sm">
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
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};
