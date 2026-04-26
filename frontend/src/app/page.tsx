'use client';

import React, { useState } from 'react';
import { LandingPrompt, SuggestedPrompts } from '@/components/landing-view';
import { Workspace } from '@/components/workspace-view';
import { MOCK_RESPONSES, MockResponse } from '@/lib/mock-data';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [activeData, setActiveData] = useState<MockResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuery = async (query: string) => {
    // Ensure the input field shows the current query (useful for suggestions)
    setSearchQuery(query);
    
    // Capture current query as context if we are already in workspace
    const previousQuery = activeData?.query || null;
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          previous_query: previousQuery
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();
      
      // Try to parse the notebook output if it's a JSON string
      let rawNotebookData: any;
      try {
        rawNotebookData = typeof result.notebook_output === 'string' 
          ? JSON.parse(result.notebook_output) 
          : result.notebook_output;
        
        // TRANSFORMER: Map Databricks results to Frontend MockResponse structure
        if (rawNotebookData && rawNotebookData.results) {
          const cityCoords: Record<string, [number, number]> = {
            'mumbai': [19.0760, 72.8777],
            'delhi': [28.6139, 77.2090],
            'bangalore': [12.9716, 77.5946],
            'kolkata': [22.5726, 88.3639],
            'chennai': [13.0827, 80.2707],
            'pune': [18.5204, 73.8567],
            'surat': [21.1702, 72.8311],
            'jaipur': [26.9124, 75.7873],
            'lucknow': [26.8467, 80.9462],
            'patna': [25.5941, 85.1376],
            'bihar': [25.0961, 85.3131]
          };

          const transformedRanking = rawNotebookData.results.map((item: any, idx: number) => {
            const rawCity = (item.city || "").toLowerCase();
            const matchedCityKey = Object.keys(cityCoords).find(key => rawCity.includes(key));
            const cityFallback = matchedCityKey ? cityCoords[matchedCityKey] : [20.5937, 78.9629];
            const jitter = () => (Math.random() - 0.5) * 0.15;

            return {
              rank: idx + 1,
              facility_name: item.name || "Unknown Facility",
              district: item.city || "Unknown District",
              state: item.state || "India",
              match_score: item.final_score || 0.5,
              trust_score: item.judge?.trust_penalty !== undefined ? (1.0 - item.judge.trust_penalty) : 0.8, // Calculated or default
              lat: item.lat || (cityFallback[0] + jitter()), 
              lng: item.lon || item.lng || (cityFallback[1] + jitter()),
              reasoning_summary: item.judge?.reasoning ? [item.judge.reasoning] : ["High quality healthcare match."]
            };
          });

          setActiveData({
            query: query,
            query_type: 'facility_search',
            ranking: transformedRanking,
            regions: []
          });
        } else {
          throw new Error("No results in notebook output");
        }
      } catch (e) {
        console.warn('Could not parse or map notebook output, falling back to mock:', e);
        let type: keyof typeof MOCK_RESPONSES = 'facility_search';
        if (query.toLowerCase().includes('desert') || query.toLowerCase().includes('region')) {
          type = 'regional_gap';
        }
        setActiveData({ ...MOCK_RESPONSES[type], query });
      }
      setView('workspace');
    } catch (error) {
      console.error('Error fetching analysis:', error);
      let type: keyof typeof MOCK_RESPONSES = 'facility_search';
      setActiveData({ ...MOCK_RESPONSES[type], query });
      setView('workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('landing');
    setActiveData(null);
    setSearchQuery(''); // Clear search box on reset
  };

  return (
    <>
      {isLoading && view === 'workspace' && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 p-8 bg-white shadow-2xl rounded-3xl border border-slate-100">
            <Loader2 className="text-blue-600 animate-spin" size={40} />
            <div className="text-center">
              <p className="text-slate-800 font-bold text-lg">Updating Analysis...</p>
              <p className="text-slate-500 text-sm italic">Recalculating based on your follow-up...</p>
            </div>
          </div>
        </div>
      )}

      {view === 'workspace' && activeData ? (
        <Workspace data={activeData} onNewQuery={handleQuery} onReset={handleReset} />
      ) : (
        <main className="min-h-screen bg-white text-slate-900 overflow-hidden relative flex flex-col items-center justify-center">
          <div className="container mx-auto py-12 relative z-10">
            <LandingPrompt 
              query={searchQuery} 
              setQuery={setSearchQuery} 
              onSubmit={handleQuery} 
              isLoading={isLoading} 
            />
            {!isLoading && (
              <SuggestedPrompts 
                onSelect={(q) => {
                  setSearchQuery(q); // First update the bar
                  handleQuery(q);   // Then trigger the search
                }} 
              />
            )}
            
            {isLoading && (
              <div className="mt-12 flex flex-col items-center gap-4 animate-in fade-in duration-700">
                <div className="p-4 bg-blue-50 rounded-full animate-spin">
                  <Loader2 className="text-blue-600" size={32} />
                </div>
                <div className="text-center">
                  <p className="text-slate-600 font-medium">Analyzing Healthcare Data via Databricks...</p>
                  <p className="text-slate-400 text-sm italic">This may take a minute while we run the analysis models.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Subtle Light Background Decoration */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-50 rounded-full blur-[120px]" />
          </div>
        </main>
      )}
    </>
  );
}
