'use client';

import React, { useState } from 'react';
import { LandingPrompt, SuggestedPrompts } from '@/components/landing-view';
import { Workspace } from '@/components/workspace-view';
import { MOCK_RESPONSES, MockResponse } from '@/lib/mock-data';

export default function Home() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [activeData, setActiveData] = useState<MockResponse | null>(null);

  const handleQuery = (query: string) => {
    // Determine query type for mock purposes
    let type: keyof typeof MOCK_RESPONSES = 'facility_search';
    
    if (query.toLowerCase().includes('desert') || query.toLowerCase().includes('region')) {
      type = 'regional_gap';
    } else if (query.toLowerCase().includes('claim') || query.toLowerCase().includes('lacking')) {
      type = 'validation';
    }

    setActiveData({
      ...MOCK_RESPONSES[type],
      query: query // Preserve the actual user query
    });
    setView('workspace');
  };

  const handleReset = () => {
    setView('landing');
    setActiveData(null);
  };

  if (view === 'workspace' && activeData) {
    return <Workspace data={activeData} onNewQuery={handleQuery} onReset={handleReset} />;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-hidden relative">
      <div className="container mx-auto py-12 relative z-10">
        <LandingPrompt onSubmit={handleQuery} />
        <SuggestedPrompts onSelect={handleQuery} />
      </div>
      
      {/* Subtle Light Background Decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-50 rounded-full blur-[120px]" />
      </div>
    </main>
  );
}
