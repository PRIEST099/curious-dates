import React, { useState } from 'react';
import { INITIAL_TIMELINES } from './constants';
import { Timeline, TimelineEvent } from './types';
import { TopicSelector } from './components/TopicSelector';
import { TimelineView } from './components/TimelineView';
import { DebateModal } from './components/DebateModal';
import { WhatIfExplorer } from './components/WhatIfExplorer';
import { ChatSidebar } from './components/ChatSidebar';
import { AdminPanel } from './components/AdminPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { LandingPage } from './components/LandingPage';
import { MessageCircle, Shield } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);

  // Application State
  const [timelines, setTimelines] = useState<Timeline[]>(INITIAL_TIMELINES);
  const [currentTimeline, setCurrentTimeline] = useState<Timeline | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Modal States
  const [isDebateOpen, setIsDebateOpen] = useState(false);
  const [debateEvent, setDebateEvent] = useState<TimelineEvent | null>(null);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string | undefined>(undefined);

  // Handlers
  const handleStartApp = () => {
    setShowLanding(false);
  };

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

  // Render Landing Page
  if (showLanding) {
    return (
      <>
        <ThemeToggle />
        <LandingPage onStart={handleStartApp} />
        {/* Admin Access Button (Bottom Left) - accessible from landing page too */}
        <button
          onClick={() => setIsAdminOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-gray-800 dark:bg-gray-900 hover:bg-gray-900 dark:hover:bg-black text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center opacity-50 hover:opacity-100 border border-gray-700"
          aria-label="Admin Panel"
        >
          <Shield size={20} />
        </button>
        {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
      </>
    );
  }

  // Render Main App
  return (
    <div className="min-h-screen bg-history-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      
      {/* Theme Toggle */}
      <ThemeToggle />

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

      {/* Admin Access Button (Bottom Left) */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-gray-800 dark:bg-gray-900 hover:bg-gray-900 dark:hover:bg-black text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center opacity-50 hover:opacity-100 border border-gray-700"
        aria-label="Admin Panel"
      >
        <Shield size={20} />
      </button>

      {/* Floating Chat Toggle (Always visible) */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 bg-gray-900 dark:bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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

      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
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