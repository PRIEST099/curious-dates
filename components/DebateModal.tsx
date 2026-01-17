import React, { useState, useEffect } from 'react';
import { DebateData, TimelineEvent } from '../types';
import { generateDebate } from '../services/geminiService';
import { X, Users, MessageSquare, HelpCircle, Loader2, AlertCircle } from 'lucide-react';

interface DebateModalProps {
  event: TimelineEvent | null;
  onClose: () => void;
  onAskQuestion: (question: string) => void;
}

export const DebateModal: React.FC<DebateModalProps> = ({ event, onClose, onAskQuestion }) => {
  const [data, setData] = useState<DebateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'generic' | 'paused'>('none');
  const [activeTab, setActiveTab] = useState<'perspectives' | 'debate' | 'questions'>('perspectives');

  useEffect(() => {
    if (event) {
      setLoading(true);
      setData(null);
      setErrorType('none');

      generateDebate(event.title, event.description)
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          if (err.message && err.message.includes('SYSTEM_PAUSED')) {
            setErrorType('paused');
          } else {
            setErrorType('generic');
          }
        });
    }
  }, [event]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Historical Debate</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Event: <span className="font-semibold">{event.title}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full p-12">
              <Loader2 size={48} className="animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Summoning historical figures...</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Analyzing primary sources and generating perspectives.</p>
            </div>
          ) : errorType !== 'none' ? (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
               <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                 <AlertCircle size={48} className="text-red-500 dark:text-red-400" />
               </div>
               
               {errorType === 'paused' ? (
                 <>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">System Paused</h3>
                   <p className="text-gray-600 dark:text-gray-400 max-w-md">
                     The system is currently under maintenance by administrators. Debate generation is temporarily unavailable.
                   </p>
                 </>
               ) : (
                 <>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Generation Failed</h3>
                   <p className="text-gray-600 dark:text-gray-400 max-w-md">
                     We couldn't generate a debate for this event at this time. Please try again later.
                   </p>
                 </>
               )}
               
               <button 
                 onClick={onClose}
                 className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium rounded-lg transition-colors"
               >
                 Close
               </button>
             </div>
          ) : data ? (
            <div className="p-6 md:p-8">
               {/* Tabs */}
               <div className="flex space-x-2 mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
                 <button 
                   onClick={() => setActiveTab('perspectives')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'perspectives' ? 'bg-white dark:bg-gray-600 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}
                 >
                   <div className="flex items-center gap-2"><Users size={16}/> Perspectives</div>
                 </button>
                 <button 
                   onClick={() => setActiveTab('debate')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'debate' ? 'bg-white dark:bg-gray-600 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}
                 >
                   <div className="flex items-center gap-2"><MessageSquare size={16}/> Debate Script</div>
                 </button>
                 <button 
                   onClick={() => setActiveTab('questions')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'questions' ? 'bg-white dark:bg-gray-600 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}
                 >
                   <div className="flex items-center gap-2"><HelpCircle size={16}/> Key Questions</div>
                 </button>
               </div>

               {/* Tab Content */}
               <div className="animate-fade-in">
                 {activeTab === 'perspectives' && (
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {data.perspectives.map((p, i) => (
                       <div key={i} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6">
                         <div className="mb-4">
                           <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">{p.name}</h3>
                           <span className="text-xs uppercase tracking-wider font-semibold text-indigo-500 dark:text-indigo-400">{p.role}</span>
                         </div>
                         <p className="text-gray-800 dark:text-gray-200 mb-4 font-medium italic">"{p.summary}"</p>
                         <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{p.argument}</div>
                       </div>
                     ))}
                   </div>
                 )}

                 {activeTab === 'debate' && (
                   <div className="space-y-6 max-w-3xl mx-auto">
                     {data.exchanges.map((ex, i) => (
                       <div key={i} className={`flex gap-4 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white shadow-md ${i % 2 === 0 ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                           {ex.speaker.charAt(0)}
                         </div>
                         <div className={`flex-1 p-4 rounded-2xl ${i % 2 === 0 ? 'bg-indigo-50 dark:bg-indigo-900/30 rounded-tl-none' : 'bg-emerald-50 dark:bg-emerald-900/30 rounded-tr-none'}`}>
                           <p className="text-xs font-bold mb-1 opacity-70 dark:text-gray-300">{ex.speaker}</p>
                           <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{ex.text}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}

                 {activeTab === 'questions' && (
                   <div className="space-y-4 max-w-2xl mx-auto">
                     <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Click a question to ask the AI assistant for more details.</p>
                     {data.questions.map((q, i) => (
                       <button 
                         key={i}
                         onClick={() => {
                           onAskQuestion(q);
                           onClose(); // Optional: close debate to show chat
                         }}
                         className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                       >
                         <div className="flex justify-between items-center">
                           <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-800 dark:group-hover:text-indigo-300">{q}</span>
                           <HelpCircle size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                         </div>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
