
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { X, Shield, Lock, Activity, Power, AlertTriangle, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Dashboard State
  const [stats, setStats] = useState(adminService.getStats());

  useEffect(() => {
    // Poll for stats updates if authenticated
    let interval: number;
    if (isAuthenticated) {
      interval = window.setInterval(() => {
        setStats(adminService.getStats());
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.login(password)) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const togglePause = () => {
    adminService.toggleSystemPause();
    setStats(adminService.getStats());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden text-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold">Admin Console</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-8">
                <Lock size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Please authenticate to manage the system.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Access Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password (hint: admin123)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Access Dashboard
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              {/* System Status Control */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-gray-200">
                    <Power size={18} /> System Status
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${stats.isPaused ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {stats.isPaused ? 'PAUSED' : 'ACTIVE'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-6">
                  {stats.isPaused 
                    ? "The API is currently blocked. Users cannot generate new content." 
                    : "The system is running normally. All AI features are available."}
                </p>

                <button
                  onClick={togglePause}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition-colors ${
                    stats.isPaused 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {stats.isPaused ? 'Resume System' : 'Pause System'}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                    <Activity size={14} /> Total API Calls
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.totalApiCalls}</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                     <AlertTriangle size={14} /> Status
                  </div>
                  <div className={`text-lg font-bold ${stats.isPaused ? 'text-red-400' : 'text-green-400'}`}>
                    {stats.isPaused ? 'Maintenance' : 'Operational'}
                  </div>
                </div>
              </div>

              {/* Recent Logs */}
              <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-3 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase text-gray-400">Live Logs</h4>
                  <RefreshCw size={12} className="text-gray-500 animate-spin-slow" />
                </div>
                <div className="h-40 overflow-y-auto p-3 font-mono text-xs text-gray-300 space-y-1 scrollbar-thin scrollbar-thumb-gray-600">
                  {stats.recentLogs.length === 0 ? (
                    <span className="text-gray-600 italic">No activity logs yet.</span>
                  ) : (
                    stats.recentLogs.map((log, i) => (
                      <div key={i} className="border-b border-gray-800 pb-1 last:border-0">{log}</div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
