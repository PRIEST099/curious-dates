import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Timeline, TimelineEvent } from '../types';
import { ArrowLeft, MessageSquare, Info, Link as LinkIcon, ExternalLink, Send, Sparkles, GitMerge, Clock } from 'lucide-react';
import { askEventSpecificQuestion } from '../services/geminiService';

interface TimelineViewProps {
  timeline: Timeline;
  timelines: Timeline[];
  selectedEventId: string | null;
  onBack: () => void;
  onSelectEvent: (event: TimelineEvent) => void;
  onNavigateToEvent: (timeline: Timeline, event: TimelineEvent) => void;
  onOpenDebate: (event: TimelineEvent) => void;
}

// Helper to parse year strings like "2560 BC", "1969", "AD 500" into numbers
const parseYear = (yearStr: string): number => {
  const match = yearStr.match(/(\d+)/);
  if (!match) return 0;
  
  let val = parseInt(match[0]);
  
  // Check for BC/BCE
  if (yearStr.match(/bc|b\.c\.|bce/i)) {
    val = -val;
  }
  
  return val;
};

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  timeline, 
  timelines,
  selectedEventId, 
  onBack, 
  onSelectEvent,
  onNavigateToEvent,
  onOpenDebate
}) => {
  const selectedEvent = timeline.events.find(e => e.id === selectedEventId);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for specific event question
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  // Reset answer when event changes
  useEffect(() => {
    setAnswer(null);
    setQuestion('');
    setIsAsking(false);
  }, [selectedEventId]);

  // Auto-scroll to selected event on mount if provided
  useEffect(() => {
    if (selectedEventId && containerRef.current) {
        const el = document.getElementById(`event-${selectedEventId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [selectedEventId]);

  // Calculate related events based on keyword matching (for the Detail View)
  const relatedEvents = useMemo(() => {
    if (!selectedEvent) return [];

    const getWords = (text: string) => text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const stopWords = new Set(['this', 'that', 'with', 'from', 'were', 'when', 'into']);
    
    const sourceWords = new Set([
      ...getWords(selectedEvent.title), 
      ...getWords(selectedEvent.description)
    ].filter(w => !stopWords.has(w)));
    
    const candidates: { event: TimelineEvent, timeline: Timeline, score: number }[] = [];
    
    for (const tl of timelines) {
      for (const ev of tl.events) {
        // Skip current event
        if (ev.id === selectedEvent.id) continue;
        
        const targetWords = [
          ...getWords(ev.title), 
          ...getWords(ev.description)
        ].filter(w => !stopWords.has(w));

        let score = 0;
        targetWords.forEach(w => {
           if (sourceWords.has(w)) score++;
        });
        
        // Boost score if same timeline (contextually relevant)
        if (tl.id === timeline.id) score += 0.5;

        if (score > 1) { // Threshold to avoid weak matches
          candidates.push({ event: ev, timeline: tl, score });
        }
      }
    }
    
    return candidates.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [selectedEvent, timelines, timeline.id]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !question.trim()) return;

    setIsAsking(true);
    setAnswer(null);
    const result = await askEventSpecificQuestion(selectedEvent.title, selectedEvent.description, question);
    setAnswer(result);
    setIsAsking(false);
  };

  // Helper to find parallel events in other timelines
  const getParallelEvents = (currentEvent: TimelineEvent) => {
    const currentYear = parseYear(currentEvent.year);
    const parallels: { timeline: Timeline, event: TimelineEvent }[] = [];
    
    timelines.forEach(tl => {
      if (tl.id === timeline.id) return;
      
      tl.events.forEach(ev => {
        const evYear = parseYear(ev.year);
        // Dynamic threshold: 1% of the year value or at least 1 year.
        // E.g., for 2000 BC, matches within +/- 20 years. For 1990, matches within +/- 20 years.
        // Let's tighten it for modern history manually if needed, but 2% is a decent heuristic for "around the same time".
        const threshold = Math.max(1, Math.abs(currentYear * 0.02));
        
        if (Math.abs(evYear - currentYear) <= threshold) {
           parallels.push({ timeline: tl, event: ev });
        }
      });
    });
    return parallels.slice(0, 2); // Limit to 2 per event to avoid clutter
  };

  return (
    <div className="flex flex-col h-screen bg-history-50">
      {/* Header */}
      <div className="flex-none bg-white border-b border-history-200 px-6 py-4 flex items-center shadow-sm z-20">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-history-100 rounded-full mr-4 transition-colors"
        >
          <ArrowLeft className="text-history-800" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{timeline.title}</h2>
          <p className="text-sm text-gray-500">{timeline.events.length} Events • {timeline.category === 'alternate' ? 'Alternate History' : 'Historical'}</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Timeline List (Left Panel) */}
        <div ref={containerRef} className="w-full md:w-1/2 lg:w-5/12 overflow-y-auto p-6 relative z-10 scrollbar-hide">
           {/* Vertical Line */}
           <div className="absolute left-10 top-0 bottom-0 w-1 bg-history-200" />

           <div className="space-y-2">
             {timeline.events.map((event, index) => {
               const prevEvent = index > 0 ? timeline.events[index - 1] : null;
               const currentYear = parseYear(event.year);
               const prevYear = prevEvent ? parseYear(prevEvent.year) : null;
               let yearGap = 0;
               if (prevYear !== null) {
                 yearGap = currentYear - prevYear;
               }

               const parallelEvents = getParallelEvents(event);

               return (
                 <React.Fragment key={event.id}>
                   {/* Time Gap Visualization */}
                   {yearGap > 5 && (
                     <div className="pl-12 py-6 relative">
                       {/* Dotted line overlaying the main solid line */}
                       <div className="absolute left-[39px] top-0 bottom-0 w-1 bg-history-50 z-10"></div>
                       <div className="absolute left-[40px] top-0 bottom-0 w-0.5 border-l-2 border-dotted border-history-300 z-10"></div>
                       
                       <div className="flex items-center gap-2 text-history-500 opacity-70 hover:opacity-100 transition-opacity">
                         <Clock size={14} />
                         <span className="text-xs font-medium italic">
                           {yearGap} years later...
                         </span>
                       </div>
                     </div>
                   )}

                   {/* Parallel Timeline Events */}
                   {parallelEvents.map((p, pIdx) => (
                     <div 
                       key={`parallel-${event.id}-${pIdx}`}
                       onClick={(e) => {
                         e.stopPropagation();
                         onNavigateToEvent(p.timeline, p.event);
                       }}
                       className="relative pl-12 mb-4 group cursor-pointer"
                     >
                        <div className="absolute left-[30px] top-3 w-6 h-6 rounded-full bg-white border border-indigo-200 z-20 flex items-center justify-center shadow-sm group-hover:border-indigo-500 transition-colors">
                            <GitMerge size={12} className="text-indigo-500" />
                        </div>
                        <div className="bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 hover:border-indigo-200 rounded-lg p-3 transition-all flex items-center justify-between">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-0.5">Meanwhile in {p.timeline.title}</div>
                                <div className="text-sm font-medium text-indigo-900">{p.event.title} <span className="opacity-50 text-xs font-normal">({p.event.year})</span></div>
                            </div>
                            <ExternalLink size={14} className="text-indigo-300 group-hover:text-indigo-500" />
                        </div>
                     </div>
                   ))}

                   {/* Main Event Card */}
                   <div 
                     id={`event-${event.id}`}
                     onClick={() => onSelectEvent(event)}
                     className={`relative pl-12 cursor-pointer group transition-all duration-300 mb-8 ${selectedEventId === event.id ? 'scale-105' : 'hover:scale-102'}`}
                   >
                     {/* Dot on line */}
                     <div className={`absolute left-[34px] top-6 w-4 h-4 rounded-full border-4 transition-colors z-20 ${selectedEventId === event.id ? 'bg-white border-history-600 ring-2 ring-history-300' : 'bg-history-300 border-history-50 group-hover:bg-history-500'}`} />

                     <div className={`rounded-lg p-5 border transition-all shadow-sm ${selectedEventId === event.id ? 'bg-white border-history-400 ring-1 ring-history-200 shadow-md' : 'bg-white/80 border-transparent hover:bg-white hover:shadow-md'}`}>
                       <span className="inline-block px-2 py-1 bg-history-100 text-history-800 text-xs font-bold rounded mb-2">
                         {event.year}
                       </span>
                       <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                       <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                     </div>
                   </div>
                 </React.Fragment>
               );
             })}
           </div>
           
           {/* Spacer at bottom */}
           <div className="h-24" />
        </div>

        {/* Event Detail (Right Panel - Desktop) */}
        <div className={`
          fixed inset-0 md:static md:inset-auto md:w-1/2 lg:w-7/12 bg-white md:border-l border-history-200 
          transition-transform duration-300 transform z-30
          ${selectedEvent ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:opacity-50'}
          flex flex-col
        `}>
          {selectedEvent ? (
            <div className="h-full overflow-y-auto p-8 flex flex-col">
              <div className="md:hidden mb-4">
                <button onClick={() => onSelectEvent(null as any)} className="text-history-600 font-medium flex items-center">
                  <ArrowLeft size={16} className="mr-1"/> Back to Timeline
                </button>
              </div>

              <div className="mb-6 relative h-64 w-full rounded-xl overflow-hidden shadow-lg bg-gray-200 flex-shrink-0">
                <img 
                  src={selectedEvent.imageUrl} 
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-history-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{selectedEvent.year}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">{selectedEvent.title}</h1>
              
              <div className="prose prose-lg text-gray-700 mb-6 flex-grow">
                <p>{selectedEvent.description}</p>
              </div>

              {/* Ask Question About Event Section */}
              <div className="mb-8 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Sparkles size={16} /> Ask about this event
                </h3>
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input 
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Why did this happen? Who was involved?"
                    className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none text-sm"
                    disabled={isAsking}
                  />
                  <button 
                    type="submit" 
                    disabled={isAsking || !question.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isAsking ? <span className="animate-spin block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <Send size={18} />}
                  </button>
                </form>
                {answer && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-100 text-sm text-gray-800 shadow-sm animate-fade-in">
                    <p>{answer}</p>
                  </div>
                )}
              </div>

              {/* Related Events Section */}
              {relatedEvents.length > 0 && (
                <div className="mb-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <LinkIcon size={18} /> Related Events
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedEvents.map((item) => (
                      <div 
                        key={item.event.id}
                        onClick={() => onNavigateToEvent(item.timeline, item.event)}
                        className="bg-history-50 p-3 rounded-lg border border-history-100 hover:border-history-300 cursor-pointer transition-all hover:shadow-sm group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-history-600">{item.event.year}</span>
                          {item.timeline.id !== timeline.id && <ExternalLink size={12} className="text-gray-400" />}
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-indigo-700">{item.event.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 truncate">{item.timeline.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-gray-100">
                <button 
                  onClick={() => onOpenDebate(selectedEvent)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  <MessageSquare size={20} />
                  Debate This Event
                </button>
                <p className="text-center sm:text-left text-xs text-gray-400 mt-2">
                  AI will generate historical perspectives for discussion.
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex h-full items-center justify-center text-gray-400 flex-col p-8 text-center">
              <Info size={48} className="mb-4 opacity-50" />
              <p className="text-xl">Select an event from the timeline to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
