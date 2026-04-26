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

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();
      
      // Try to parse the notebook output if it's a JSON string
      let parsedData: MockResponse;
      try {
        parsedData = typeof result.notebook_output === 'string' 
          ? JSON.parse(result.notebook_output) 
          : result.notebook_output;
      } catch (e) {
        console.warn('Could not parse notebook output as JSON, falling back to mock mapping:', e);
        // Fallback-Logic: Map query to mock categories if Databricks doesn't return JSON yet
        let type: keyof typeof MOCK_RESPONSES = 'facility_search';
        if (query.toLowerCase().includes('desert') || query.toLowerCase().includes('region')) {
          type = 'regional_gap';
        } else if (query.toLowerCase().includes('claim') || query.toLowerCase().includes('lacking')) {
          type = 'validation';
        }
        parsedData = { ...MOCK_RESPONSES[type], query };
      }

      setActiveData(parsedData);
      setView('workspace');
    } catch (error) {
      console.error('Error fetching analysis:', error);
      // Optional: Show error to user or fallback to mock for demo purposes
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
  };

  if (view === 'workspace' && activeData) {
    return <Workspace data={activeData} onNewQuery={handleQuery} onReset={handleReset} />;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-hidden relative flex flex-col items-center justify-center">
      <div className="container mx-auto py-12 relative z-10">
        <LandingPrompt onSubmit={handleQuery} />
        {!isLoading && <SuggestedPrompts onSelect={handleQuery} />}
        
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
  );
}
