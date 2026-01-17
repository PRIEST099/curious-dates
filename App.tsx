import React, { useState } from 'react';
import { INITIAL_TIMELINES } from './constants';
import { Timeline, TimelineEvent } from './types';
import { TopicSelector } from './components/TopicSelector';
import { TimelineView } from './components/TimelineView';
import { DebateModal } from './components/DebateModal';
import { WhatIfExplorer } from './components/WhatIfExplorer';
import { ChatSidebar } from './components/ChatSidebar';
import { MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  // Application State
  const [timelines, setTimelines] = useState<Timeline[]>(INITIAL_TIMELINES);
  const [currentTimeline, setCurrentTimeline] = useState<Timeline | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Modal States
  const [isDebateOpen, setIsDebateOpen] = useState(false);
  const [debateEvent, setDebateEvent] = useState<TimelineEvent | null>(null);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string | undefined>(undefined);

  // Handlers
  const handleSelectTimeline = (timeline: Timeline) => {
    setCurrentTimeline(timeline);
    setSelectedEventId(null);
  };

  const handleSelectEvent = (event: TimelineEvent) => {
    setSelectedEventId(event.id);
  };

  const handleNavigateToEvent = (timeline: Timeline, event: TimelineEvent) => {
    setCurrentTimeline(timeline);
    setSelectedEventId(event.id);
  };

  const handleBackToTopics = () => {
    setCurrentTimeline(null);
    setSelectedEventId(null);
  };

  const handleOpenDebate = (event: TimelineEvent) => {
    setDebateEvent(event);
    setIsDebateOpen(true);
  };

  const handleAskQuestionFromDebate = (question: string) => {
    setChatInitialQuestion(question);
    setIsChatOpen(true);
  };

  const handleTimelineGenerated = (newTimeline: Timeline) => {
    setTimelines(prev => [newTimeline, ...prev]);
    setCurrentTimeline(newTimeline);
  };

  // Derived context string for AI Chat
  const getContextString = () => {
    if (debateEvent && isDebateOpen) return `Debating event: ${debateEvent.title}`;
    if (selectedEventId && currentTimeline) {
      const event = currentTimeline.events.find(e => e.id === selectedEventId);
      return event ? `Viewing event: ${event.title} (${event.year})` : `Viewing timeline: ${currentTimeline.title}`;
    }
    if (currentTimeline) return `Browsing timeline: ${currentTimeline.title}`;
    return "Topic Selection";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Main Content Area */}
      <main className="h-full">
        {currentTimeline ? (
          <TimelineView 
            timeline={currentTimeline}
            timelines={timelines}
            selectedEventId={selectedEventId}
            onBack={handleBackToTopics}
            onSelectEvent={handleSelectEvent}
            onNavigateToEvent={handleNavigateToEvent}
            onOpenDebate={handleOpenDebate}
          />
        ) : (
          <TopicSelector 
            timelines={timelines}
            onSelect={handleSelectTimeline}
            onOpenWhatIf={() => setIsWhatIfOpen(true)}
          />
        )}
      </main>

      {/* Floating Chat Toggle (Always visible) */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ask History AI
        </span>
      </button>

      {/* Modals & Overlays */}
      {isWhatIfOpen && (
        <WhatIfExplorer 
          onClose={() => setIsWhatIfOpen(false)} 
          onTimelineGenerated={handleTimelineGenerated}
        />
      )}

      {isDebateOpen && (
        <DebateModal 
          event={debateEvent}
          onClose={() => setIsDebateOpen(false)}
          onAskQuestion={handleAskQuestionFromDebate}
        />
      )}

      <ChatSidebar 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        context={getContextString()}
        initialQuestion={chatInitialQuestion}
        onClearInitialQuestion={() => setChatInitialQuestion(undefined)}
      />

    </div>
  );
};

export default App;