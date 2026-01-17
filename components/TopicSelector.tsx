import React from 'react';
import { Timeline } from '../types';
import { BookOpen, Sparkles, Clock, PenTool } from 'lucide-react';

interface TopicSelectorProps {
  timelines: Timeline[];
  onSelect: (timeline: Timeline) => void;
  onOpenWhatIf: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({ timelines, onSelect, onOpenWhatIf }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12 mt-12">
        <h1 className="text-4xl font-serif text-gray-900 dark:text-gray-100 mb-4 transition-colors">Curious Dates</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors">
          Explore the annals of history or reshape them with your imagination. 
          Select a timeline to begin your journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {/* Create New Card */}
        <div 
          onClick={onOpenWhatIf}
          className="group relative h-64 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 cursor-pointer shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden border border-transparent dark:border-indigo-500/30"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Sparkles size={100} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between text-white">
            <div>
              <div className="bg-white/20 w-fit p-2 rounded-lg mb-4 backdrop-blur-sm">
                <PenTool size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Timeline Generator</h3>
              <p className="text-indigo-100">Generate a custom timeline for any historical topic or create a "What If" alternate history scenario.</p>
            </div>
            <div className="flex items-center font-semibold group-hover:underline">
              Start creating &rarr;
            </div>
          </div>
        </div>

        {/* Timeline Cards */}
        {timelines.map((timeline) => (
          <div 
            key={timeline.id}
            onClick={() => onSelect(timeline)}
            className="group relative h-64 bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:border-gray-500 transition-all transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 text-gray-100 dark:text-gray-700 group-hover:text-history-100 dark:group-hover:text-gray-600 transition-colors">
              {timeline.category === 'alternate' ? <Sparkles size={120} /> : <Clock size={120} />}
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className={`w-fit p-2 rounded-lg mb-4 ${
                  timeline.category === 'alternate' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' 
                    : 'bg-history-100 text-history-700 dark:bg-amber-900/50 dark:text-amber-300'
                }`}>
                  {timeline.category === 'alternate' ? <Sparkles size={20} /> : <BookOpen size={20} />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 transition-colors">{timeline.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 transition-colors">{timeline.description}</p>
              </div>
              <div className="flex items-center text-sm font-semibold text-history-600 dark:text-gray-400 group-hover:text-history-800 dark:group-hover:text-gray-200 transition-colors">
                {timeline.events.length} Events &rarr;
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
