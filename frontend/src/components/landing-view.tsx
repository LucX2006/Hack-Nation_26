import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface LandingPromptProps {
  onSubmit: (query: string) => void;
}

export const LandingPrompt: React.FC<LandingPromptProps> = ({ onSubmit }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          What healthcare gap should we analyze?
        </h1>
        <p className="text-lg text-slate-500">
          Ask about care access, facility readiness, or regional health deserts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl relative">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for facilities, regional gaps or validation checks..."
            className="w-full px-8 py-5 pr-16 text-lg rounded-full border border-slate-200 bg-white text-slate-900 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Search size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

interface SuggestedPromptsProps {
  onSelect: (query: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelect }) => {
  const prompts = [
    "Find the nearest facility in rural Bihar that can perform an emergency appendectomy and typically leverages parttime doctors",
    "Show the highest-risk medical deserts in India for dialysis, oncology, and emergency trauma",
    "Find facilities claiming advanced surgery but lacking supporting evidence such as anesthesia capability",
    "Which regions have weak neonatal and oxygen support coverage?",
    "What are the top trusted emergency-capable facilities in this region?"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-4 mt-8">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelect(prompt)}
          className="p-4 text-left bg-white border border-slate-100 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group shadow-sm"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="text-blue-500 mt-1 shrink-0" size={18} />
            <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900">
              {prompt}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
