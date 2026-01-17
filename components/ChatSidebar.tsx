import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Trash2, History } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  context: string; // "Viewing: [Event Name]" or "Browsing: [Topic]"
  initialQuestion?: string;
  onClearInitialQuestion: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  isOpen, 
  onClose, 
  context, 
  initialQuestion,
  onClearInitialQuestion
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your historical assistant. Ask me anything about the timeline or events you're exploring.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle incoming initial question from other components
  useEffect(() => {
    if (initialQuestion && isOpen) {
      handleSend(initialQuestion);
      onClearInitialQuestion();
    }
  }, [initialQuestion, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await generateChatResponse(
      messages.filter(m => m.id !== 'welcome'), 
      context, 
      text
    );

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
  };

  const handleClear = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: "Conversation cleared. What would you like to discuss now?",
      timestamp: Date.now()
    }]);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-history-50">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
               <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">History Assistant</h3>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">{context}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <button onClick={handleClear} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Clear Chat">
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-indigo-600 text-white'}`}>
                {msg.role === 'user' ? <User size={14} /> : <History size={14} />}
              </div>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gray-800 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                 <History size={14} />
               </div>
               <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
