import React, { useState } from 'react';
import { Sparkles, Loader2, X, Clock, History } from 'lucide-react';
import { generateAlternateTimeline } from '../services/geminiService';
import { Timeline } from '../types';

interface WhatIfExplorerProps {
  onClose: () => void;
  onTimelineGenerated: (timeline: Timeline) => void;
}

export const WhatIfExplorer: React.FC<WhatIfExplorerProps> = ({ onClose, onTimelineGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'historical' | 'alternate'>('alternate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    const timeline = await generateAlternateTimeline(prompt, mode);

    if (timeline) {
      onTimelineGenerated(timeline);
      onClose();
    } else {
      setError("We encountered a temporal anomaly. Please try a different prompt.");
    }
    setIsGenerating(false);
  };

  const suggestions = mode === 'alternate' ? [
    "What if the Library of Alexandria never burned?",
    "What if Napoleon won the Battle of Waterloo?",
    "What if electricity was discovered in Ancient Rome?",
    "What if the dinosaurs never went extinct?"
  ] : [
    "The history of the Printing Press",
    "The rise and fall of the Samurai",
    "The Industrial Revolution in Britain",
    "The Space Race timeline"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${mode === 'alternate' ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-amber-600 via-orange-500 to-yellow-500'}`} />
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-50 ${mode === 'alternate' ? 'bg-purple-100' : 'bg-orange-100'}`} />
        <div className={`absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-50 ${mode === 'alternate' ? 'bg-indigo-100' : 'bg-amber-100'}`} />

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X size={24} />
        </button>

        <div className="relative z-10 text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${mode === 'alternate' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-700'}`}>
            {mode === 'alternate' ? <Sparkles size={32} /> : <History size={32} />}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Timeline Generator</h2>
          <p className="text-gray-600">Create a custom timeline using AI.</p>
        </div>

        {/* Mode Toggle */}
        <div className="relative z-10 flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setMode('alternate')}
              className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${mode === 'alternate' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Sparkles size={16} /> Alternate History
            </button>
            <button
              onClick={() => setMode('historical')}
              className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${mode === 'historical' ? 'bg-white shadow text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Clock size={16} /> Factual History
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="mb-6">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'alternate' ? "e.g. What if the internet was invented in 1950?" : "e.g. The history of Aviation"}
              className={`w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 transition-all outline-none ${mode === 'alternate' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-amber-500 focus:ring-amber-200'}`}
              disabled={isGenerating}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {!isGenerating ? (
            <div className="space-y-6">
              <button 
                type="submit" 
                disabled={!prompt.trim()}
                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'alternate' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-amber-600 to-orange-600'}`}
              >
                Generate Timeline & Images
              </button>

              <div className="text-left">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Try these suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className={`text-sm px-3 py-2 rounded-lg transition-colors ${mode === 'alternate' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
               <Loader2 size={32} className={`animate-spin mb-2 ${mode === 'alternate' ? 'text-purple-600' : 'text-amber-600'}`} />
               <p className="text-gray-600 font-medium">{mode === 'alternate' ? 'Rewriting history & Generating Art...' : 'Researching history & Generating Art...'}</p>
               <p className="text-xs text-gray-400 mt-1">This involves creating text and images, please wait.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
