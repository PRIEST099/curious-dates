export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Timeline {
  id: string;
  title: string;
  description: string;
  category: 'historical' | 'alternate';
  events: TimelineEvent[];
  isGenerated?: boolean;
}

export interface Perspective {
  name: string;
  role: string;
  summary: string;
  argument: string;
}

export interface Exchange {
  speaker: string;
  text: string;
}

export interface DebateData {
  topic: string;
  perspectives: Perspective[];
  exchanges: Exchange[];
  questions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
