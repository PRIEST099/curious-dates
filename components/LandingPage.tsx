import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, GitMerge, Brain, ArrowRight, BookOpen, Shield, Zap, Layout, Dice5 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeDemo, setActiveDemo] = useState(0);

  // Simple auto-rotation for the hero visual
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev === 0 ? 1 : 0));
    }, 4000); // Slower rotation to let users read
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-history-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg shadow-indigo-500/30">
                <Clock size={20} />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight">Curious Dates</span>
        </div>
        <button 
          onClick={onStart}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all transform hover:scale-105 shadow-md shadow-indigo-500/20"
        >
          Launch App
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-6">
        {/* Background Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-[10%] w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-[96px] opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-[10%] w-72 h-72 bg-amber-300 dark:bg-amber-900 rounded-full mix-blend-multiply filter blur-[96px] opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-[20%] w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-[96px] opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide mb-6 border border-indigo-100 dark:border-indigo-800 backdrop-blur-sm">
              <Sparkles size={12} />
              <span>Powered by Google Gemini 2.0 Flash</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-[1.1] tracking-tight text-gray-900 dark:text-white">
              From the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">impossible past</span> <br/>
              to an <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">imaginable present</span>.
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Explore history as interactive timelines. Visualize cause and effect, or use AI to weave plausible "What If" scenarios where history took a different turn.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-bold rounded-full hover:shadow-xl hover:shadow-indigo-500/10 transition-all transform hover:-translate-y-1 flex items-center gap-2"
              >
                Start Exploring <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-lg font-bold rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                How it works
              </button>
            </div>
          </div>

          {/* Hero Visual / Mini Demo */}
          <div className="relative mx-auto lg:ml-auto w-full max-w-md perspective-1000 group cursor-pointer" onClick={onStart}>
             <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 transform transition-all duration-500 hover:rotate-y-6 hover:scale-105">
                
                {/* Timeline Line with Flow Animation */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-full">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent animate-pulse" style={{ animationDuration: '2s' }}></div>
                </div>
                
                {/* Event 1 */}
                <div className="relative pl-10 mb-6">
                    <div className="absolute left-[27px] top-1.5 w-4 h-4 bg-amber-500 rounded-full border-4 border-white dark:border-gray-900 z-10 shadow-sm"></div>
                    <div className="text-xs font-bold text-gray-400 mb-1">1969</div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="font-bold text-sm mb-1">Apollo 11 Landing</div>
                        <div className="text-xs text-gray-500">Neil Armstrong walks on the moon.</div>
                    </div>
                </div>

                {/* Event 2 (Branching) */}
                <div className="relative pl-10 mb-4">
                   <div className={`absolute left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 transition-colors duration-500 z-10 shadow-sm ${activeDemo === 0 ? 'bg-amber-500' : 'bg-purple-500'}`}></div>
                   <div className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-2">
                       {activeDemo === 0 ? "Historical Path" : "Alternate Path Detected"}
                       {activeDemo === 1 && <Sparkles size={10} className="text-purple-500 animate-spin-slow" />}
                   </div>
                   
                   <div className="relative h-24">
                       {/* Historical Option */}
                       <div className={`absolute inset-0 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-500 transform ${activeDemo === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                            <div className="font-bold text-sm mb-1 text-gray-900 dark:text-gray-100">Cold War Continues</div>
                            <div className="text-xs text-gray-500">The space race evolves into a Mars race by the 1980s.</div>
                       </div>
                       
                       {/* Alternate Option */}
                       <div className={`absolute inset-0 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 transition-all duration-500 transform ${activeDemo === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
                            <div className="flex items-center gap-1 mb-1">
                                <Sparkles size={12} className="text-purple-600" />
                                <div className="font-bold text-sm text-purple-900 dark:text-purple-300">Soviet Moon Base</div>
                            </div>
                            <div className="text-xs text-purple-700 dark:text-purple-400">First permanent lunar settlement established by USSR in 1975.</div>
                       </div>
                   </div>
                </div>

                 {/* Ghost Next Event - Hint at more */}
                 <div className="relative pl-10 opacity-40">
                    <div className="absolute left-[29px] top-1 w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-900"></div>
                    <div className="h-2 w-12 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-100 dark:bg-gray-800/50 rounded border border-dashed border-gray-300 dark:border-gray-700"></div>
                 </div>
                
                <div className="absolute top-4 right-4">
                     <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-gray-900 transition-colors relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Reimagine History</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              More than just dates. Experience causality, perspective, and imagination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-history-50 dark:bg-gray-800/50 border border-history-100 dark:border-gray-700 hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-900 transition-all group">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Interactive Timelines</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate factual chronological timelines. Visualize gaps and milestones instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-purple-50/50 dark:bg-gray-800/50 border border-purple-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Sparkles size={80} />
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm">
                <GitMerge size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Alternate Histories</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Ask "What If?" and watch the AI weave plausible diverging paths. See how one change ripples through time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-history-50 dark:bg-gray-800/50 border border-history-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Brain size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">AI Debates & Context</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Summon historical figures to debate events. Ask specific questions to understand the "Why".
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-900 transition-all group">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Dice5 size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Gamified Scenarios</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Perfect for Game Masters and Educators. Generate campaign settings or quiz scenarios instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 order-2 lg:order-1">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
                 <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                        <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    </div>
                    <span className="ml-auto text-xs font-mono text-gray-400">ANALYSIS_MODE: DIVERGENCE</span>
                 </div>
                 
                 <div className="flex gap-8 relative">
                    {/* Timeline A */}
                    <div className="flex-1 space-y-4 opacity-50 group-hover:opacity-100 transition-opacity">
                       <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Original Timeline</div>
                       <div className="pl-4 border-l-2 border-amber-200 dark:border-amber-900">
                          <p className="font-bold text-sm">1450</p>
                          <p className="text-xs text-gray-500">Printing Press Invented</p>
                       </div>
                       <div className="pl-4 border-l-2 border-amber-200 dark:border-amber-900">
                          <p className="font-bold text-sm">1517</p>
                          <p className="text-xs text-gray-500">Reformation Begins</p>
                       </div>
                    </div>

                    {/* Timeline B */}
                    <div className="flex-1 space-y-4 relative">
                        {/* Animated Branch Line */}
                        <div className="absolute -left-5 top-8 w-6 h-8 border-t-2 border-r-2 border-purple-300 dark:border-purple-700 rounded-tr-xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                           <div className="absolute -right-1 -top-1 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                        </div>

                       <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 pl-2">Divergence</div>
                       <div className="pl-4 border-l-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-r-lg -ml-4 transform group-hover:translate-x-1 transition-transform">
                          <p className="font-bold text-sm text-purple-900 dark:text-purple-100">1450</p>
                          <p className="text-xs text-purple-700 dark:text-purple-300">Press delayed by 100 years</p>
                       </div>
                       <div className="pl-4 border-l-2 border-purple-200 dark:border-purple-900">
                          <p className="font-bold text-sm">1550</p>
                          <p className="text-xs text-gray-500">Oral traditions strengthen</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Inspired by the paths not taken.</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Curious Dates was born from a fascination with the "Butterfly Effect" and games like <em>The Alters</em>. We wanted to build a tool that doesn't just list facts, but helps us understand the fragility of our current reality.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              By visualizing the branches of history, we gain a deeper appreciation for the events that shaped our world—and the infinite possibilities that didn't.
            </p>
            
            <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-2 text-sm font-medium">
                   <BookOpen size={16} className="text-gray-500" />
                   <span>Historical Accuracy</span>
                </div>
                <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                   <Sparkles size={16} />
                   <span>Creative Fiction</span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-900 text-white text-center px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-3xl mx-auto relative z-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to explore history?</h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                  Start your journey through time. Create your first timeline in seconds and see where curiosity takes you.
              </p>
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-white text-indigo-900 text-lg font-bold rounded-full hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Launch Interactive Demo
              </button>
              <p className="mt-4 text-xs text-indigo-300">No account required • Instant generation</p>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="font-serif text-2xl font-bold text-white mb-2">Curious Dates</div>
            <p className="text-sm">Built with Google Gemini API & React.</p>
          </div>
          
          <div className="flex gap-12 text-center">
             <div>
                <div className="flex items-center gap-2 justify-center mb-1 text-white font-bold text-xl">
                    <Zap size={20} className="text-yellow-400 fill-current" />
                    <span>Fast</span>
                </div>
                <p className="text-xs uppercase tracking-wider">Gemini 2.5 Flash</p>
             </div>
             <div>
                <div className="flex items-center gap-2 justify-center mb-1 text-white font-bold text-xl">
                    <Layout size={20} className="text-purple-400" />
                    <span>Deep</span>
                </div>
                <p className="text-xs uppercase tracking-wider">Gemini 3.0 Pro</p>
             </div>
          </div>

          <div className="flex gap-6">
            <button onClick={onStart} className="hover:text-white transition-colors text-sm font-medium">Demo</button>
            <a href="#" className="hover:text-white transition-colors text-sm font-medium">GitHub</a>
            <a href="#" className="hover:text-white transition-colors text-sm font-medium">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
