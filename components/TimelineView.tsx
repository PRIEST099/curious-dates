import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Timeline, TimelineEvent } from '../types';
import { ArrowLeft, MessageSquare, Info, Link as LinkIcon, ExternalLink, Send, Sparkles, GitMerge, Clock, ChevronLeft, ChevronRight, FastForward, Rewind } from 'lucide-react';
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

// Helper to format year number back to string
const formatYearDisplay = (year: number) => {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year}`;
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

  // State for Time Travel Animation
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [travelYear, setTravelYear] = useState<number | null>(null);

  // Determine Prev/Next Events
  const currentIndex = selectedEvent ? timeline.events.findIndex(e => e.id === selectedEvent.id) : -1;
  const prevEvent = currentIndex > 0 ? timeline.events[currentIndex - 1] : null;
  const nextEvent = currentIndex >= 0 && currentIndex < timeline.events.length - 1 ? timeline.events[currentIndex + 1] : null;

  // Reset answer when event changes
  useEffect(() => {
    setAnswer(null);
    setQuestion('');
    setIsAsking(false);
  }, [selectedEventId]);

  // Auto-scroll to selected event on mount if provided, but only if NOT time traveling
  useEffect(() => {
    if (selectedEventId && containerRef.current && !isTimeTraveling) {
        const el = document.getElementById(`event-${selectedEventId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [selectedEventId, isTimeTraveling]);

  // Calculate the maximum gap between adjacent events in this timeline
  // This serves as the normalization baseline (value 1) for animation duration
  const maxTimelineGap = useMemo(() => {
    if (timeline.events.length < 2) return 1;
    let max = 0;
    for (let i = 0; i < timeline.events.length - 1; i++) {
        const y1 = parseYear(timeline.events[i].year);
        const y2 = parseYear(timeline.events[i+1].year);
        const gap = Math.abs(y2 - y1);
        if (gap > max) max = gap;
    }
    return max > 0 ? max : 1;
  }, [timeline]);

  // Logic to handle smooth "Time Travel" transition
  const handleTimeTravel = (targetEvent: TimelineEvent) => {
    if (!selectedEvent) {
        onSelectEvent(targetEvent);
        return;
    }

    const startYear = parseYear(selectedEvent.year);
    const endYear = parseYear(targetEvent.year);

    // If years are same or invalid, just jump
    if (startYear === endYear || isNaN(startYear) || isNaN(endYear)) {
        onSelectEvent(targetEvent);
        return;
    }

    setIsTimeTraveling(true);
    setTravelYear(startYear);

    // Dynamic Duration Calculation
    const jumpGap = Math.abs(endYear - startYear);
    
    // Normalize current jump against the max gap in the timeline
    const normalizedGap = jumpGap / maxTimelineGap;
    
    // Requirement: "value 1 being the highest gap to take 3 seconds"
    const calculatedDuration = normalizedGap * 3000;
    
    // UX Bounds:
    // Min: 1500ms (ensure animation is always perceptible and smooth)
    // Max: 5000ms (cap very large multi-event jumps to avoid boredom)
    const duration = Math.max(1500, Math.min(5000, calculatedDuration));
    
    const startTime = performance.now();

    const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease In Out Quintic (Power of 5)
        // This provides a much steeper acceleration curve than Cubic,
        // meaning it stays "slow" for longer at the start and end (more delay on edges).
        const ease = progress < 0.5 
            ? 16 * Math.pow(progress, 5) 
            : 1 - Math.pow(-2 * progress + 2, 5) / 2;

        const currentYearVal = Math.floor(startYear + (endYear - startYear) * ease);
        setTravelYear(currentYearVal);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete
            setIsTimeTraveling(false);
            onSelectEvent(targetEvent);
            setTravelYear(null);
        }
    };

    requestAnimationFrame(animate);
  };

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
        const threshold = Math.max(1, Math.abs(currentYear * 0.02));
        
        if (Math.abs(evYear - currentYear) <= threshold) {
           parallels.push({ timeline: tl, event: ev });
        }
      });
    });
    return parallels.slice(0, 2); // Limit to 2 per event to avoid clutter
  };

  return (
    <div className="flex flex-col h-screen bg-history-50 dark:bg-gray-950 transition-colors duration-300 relative">
      
      {/* Time Travel Overlay */}
      {isTimeTraveling && travelYear !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 dark:bg-black/50 backdrop-blur-md pointer-events-auto cursor-wait animate-fade-in">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 animate-pulse">Travelling through time</div>
            <div className="text-8xl font-serif font-bold text-gray-900 dark:text-white tabular-nums tracking-tighter drop-shadow-lg">
              {formatYearDisplay(travelYear)}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-none bg-white dark:bg-gray-900 border-b border-history-200 dark:border-gray-800 px-6 py-4 flex items-center shadow-sm z-20 transition-colors">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-history-100 dark:hover:bg-gray-800 rounded-full mr-4 transition-colors text-history-800 dark:text-gray-300"
        >
          <ArrowLeft />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{timeline.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{timeline.events.length} Events • {timeline.category === 'alternate' ? 'Alternate History' : 'Historical'}</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Timeline List (Left Panel) */}
        <div ref={containerRef} className="w-full md:w-1/2 lg:w-5/12 overflow-y-auto p-6 relative z-10 scrollbar-hide">
           {/* Vertical Line with Glow Effect during travel */}
           <div className={`absolute left-10 top-0 bottom-0 w-1 transition-all duration-300 ${isTimeTraveling ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-history-200 dark:bg-gray-800'}`} />

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
                       {/* Dotted line overlaying the main solid line - color matches background */}
                       <div className="absolute left-[39px] top-0 bottom-0 w-1 bg-history-50 dark:bg-gray-950 z-10 transition-colors"></div>
                       <div className="absolute left-[40px] top-0 bottom-0 w-0.5 border-l-2 border-dotted border-history-300 dark:border-gray-700 z-10"></div>
                       
                       <div className="flex items-center gap-2 text-history-500 dark:text-gray-500 opacity-70 hover:opacity-100 transition-opacity">
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
                        <div className="absolute left-[30px] top-3 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 z-20 flex items-center justify-center shadow-sm group-hover:border-indigo-500 transition-colors">
                            <GitMerge size={12} className="text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-indigo-100/50 dark:border-indigo-800 hover:border-indigo-200 dark:hover:border-indigo-600 rounded-lg p-3 transition-all flex items-center justify-between">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 dark:text-indigo-300 mb-0.5">Meanwhile in {p.timeline.title}</div>
                                <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{p.event.title} <span className="opacity-50 text-xs font-normal">({p.event.year})</span></div>
                            </div>
                            <ExternalLink size={14} className="text-indigo-300 dark:text-indigo-500 group-hover:text-indigo-500" />
                        </div>
                     </div>
                   ))}

                   {/* Main Event Card */}
                   <div 
                     id={`event-${event.id}`}
                     onClick={() => !isTimeTraveling && onSelectEvent(event)}
                     className={`relative pl-12 cursor-pointer group transition-all duration-300 mb-8 ${selectedEventId === event.id ? 'scale-105' : 'hover:scale-102'} ${isTimeTraveling ? 'pointer-events-none' : ''}`}
                   >
                     {/* Dot on line */}
                     <div className={`absolute left-[34px] top-6 w-4 h-4 rounded-full border-4 transition-colors z-20 
                       ${selectedEventId === event.id 
                         ? 'bg-white dark:bg-gray-900 border-history-600 dark:border-history-500 ring-2 ring-history-300 dark:ring-history-700' 
                         : 'bg-history-300 dark:bg-gray-600 border-history-50 dark:border-gray-950 group-hover:bg-history-500 dark:group-hover:bg-history-400'}`} 
                      />

                     <div className={`rounded-lg p-5 border transition-all shadow-sm 
                       ${selectedEventId === event.id 
                         ? 'bg-white dark:bg-gray-800 border-history-400 dark:border-history-600 ring-1 ring-history-200 dark:ring-history-800 shadow-md' 
                         : 'bg-white/80 dark:bg-gray-800/80 border-transparent dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'}`}>
                       
                       <span className="inline-block px-2 py-1 bg-history-100 dark:bg-gray-700 text-history-800 dark:text-gray-200 text-xs font-bold rounded mb-2">
                         {event.year}
                       </span>
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                       <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{event.description}</p>
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
          fixed inset-0 md:static md:inset-auto md:w-1/2 lg:w-7/12 
          bg-white dark:bg-gray-900 md:border-l border-history-200 dark:border-gray-800
          transition-all duration-300 transform z-30
          ${selectedEvent ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:opacity-50'}
          flex flex-col
        `}>
          {selectedEvent ? (
            <div className="h-full flex flex-col relative">
              
              {/* Sticky Detail Header with Navigation */}
              <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-20 p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => onSelectEvent(null as any)} className="md:hidden p-2 -ml-2 text-history-600 dark:text-gray-400">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Event Details</span>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => prevEvent && handleTimeTravel(prevEvent)}
                        disabled={!prevEvent || isTimeTraveling}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Previous Event"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={() => nextEvent && handleTimeTravel(nextEvent)}
                        disabled={!nextEvent || isTimeTraveling}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Next Event"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6 md:p-8 flex-grow">
                  <div className="mb-6 relative h-64 w-full rounded-xl overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-800 flex-shrink-0 group">
                    <img 
                      src={selectedEvent.imageUrl} 
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <span className="bg-history-600/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-white/20">{selectedEvent.year}</span>
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-gray-100 mb-4 leading-tight">{selectedEvent.title}</h1>
                  
                  <div className="prose prose-lg text-gray-700 dark:text-gray-300 mb-8 max-w-none">
                    <p>{selectedEvent.description}</p>
                  </div>

                  {/* Ask Question About Event Section */}
                  <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800/50">
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                      <Sparkles size={16} /> Ask about this event
                    </h3>
                    <form onSubmit={handleAskQuestion} className="flex gap-2">
                      <input 
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. Why did this happen? Who was involved?"
                        className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none text-sm transition-colors"
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
                      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-100 dark:border-indigo-800 text-sm text-gray-800 dark:text-gray-200 shadow-sm animate-fade-in">
                        <p>{answer}</p>
                      </div>
                    )}
                  </div>

                  {/* Related Events Section */}
                  {relatedEvents.length > 0 && (
                    <div className="mb-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <LinkIcon size={18} /> Related Events
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {relatedEvents.map((item) => (
                          <div 
                            key={item.event.id}
                            onClick={() => onNavigateToEvent(item.timeline, item.event)}
                            className="bg-history-50 dark:bg-gray-800 p-3 rounded-lg border border-history-100 dark:border-gray-700 hover:border-history-300 dark:hover:border-gray-500 cursor-pointer transition-all hover:shadow-sm group"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-history-600 dark:text-gray-400">{item.event.year}</span>
                              {item.timeline.id !== timeline.id && <ExternalLink size={12} className="text-gray-400" />}
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-200 line-clamp-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{item.event.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">{item.timeline.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                   {/* Debate Button */}
                   <button 
                      onClick={() => onOpenDebate(selectedEvent)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:translate-y-[-2px]"
                    >
                      <MessageSquare size={20} />
                      Debate This Event
                      <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded text-indigo-100">AI</span>
                   </button>
              </div>

              {/* Navigation Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 grid grid-cols-2 gap-4 z-20">
                    <button 
                        onClick={() => prevEvent && handleTimeTravel(prevEvent)}
                        disabled={!prevEvent || isTimeTraveling}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-medium transition-all ${
                            prevEvent 
                            ? 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200' 
                            : 'opacity-30 cursor-not-allowed text-gray-400'
                        }`}
                    >
                        <Rewind size={18} />
                        <div className="text-left hidden sm:block">
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-normal">Previous Event</div>
                            <div className="text-sm font-bold truncate max-w-[100px]">{prevEvent ? prevEvent.year : 'Start'}</div>
                        </div>
                        <span className="sm:hidden">Prev</span>
                    </button>

                    <button 
                        onClick={() => nextEvent && handleTimeTravel(nextEvent)}
                        disabled={!nextEvent || isTimeTraveling}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-medium transition-all ${
                            nextEvent 
                            ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' 
                            : 'opacity-30 cursor-not-allowed text-gray-400'
                        }`}
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-indigo-400 dark:text-indigo-500 font-normal">Next Event</div>
                            <div className="text-sm font-bold truncate max-w-[100px]">{nextEvent ? nextEvent.year : 'End'}</div>
                        </div>
                        <span className="sm:hidden">Next</span>
                        <FastForward size={18} />
                    </button>
              </div>

            </div>
          ) : (
            <div className="hidden md:flex h-full items-center justify-center text-gray-400 flex-col p-8 text-center bg-gray-50/50 dark:bg-black/20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                 <Info size={40} className="opacity-50" />
              </div>
              <p className="text-xl font-serif text-gray-600 dark:text-gray-400">Select an event from the timeline<br/>to begin exploring.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
