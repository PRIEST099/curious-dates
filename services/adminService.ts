
// Simple singleton to manage admin state
// In a real app, this would sync with a backend database

interface AdminState {
  isPaused: boolean;
  totalApiCalls: number;
  logs: string[];
}

const STORAGE_KEY = 'curious_dates_admin_state';

class AdminService {
  private state: AdminState;

  constructor() {
    // Load from local storage or default
    const saved = localStorage.getItem(STORAGE_KEY);
    this.state = saved ? JSON.parse(saved) : {
      isPaused: false,
      totalApiCalls: 0,
      logs: []
    };
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  // Authentication (Simple Demo)
  login(password: string): boolean {
    return password === 'admin123'; // Hardcoded for demo purposes
  }

  // System Control
  toggleSystemPause(): boolean {
    this.state.isPaused = !this.state.isPaused;
    this.log(this.state.isPaused ? 'System Paused by Admin' : 'System Resumed by Admin');
    this.save();
    return this.state.isPaused;
  }

  isSystemPaused(): boolean {
    return this.state.isPaused;
  }

  // Usage Tracking
  trackUsage(model: string, type: string) {
    this.state.totalApiCalls++;
    this.log(`API Call: ${type} (${model})`);
    this.save();
  }

  getStats() {
    return {
      isPaused: this.state.isPaused,
      totalApiCalls: this.state.totalApiCalls,
      recentLogs: this.state.logs.slice(0, 50) // Return last 50 logs
    };
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.state.logs.unshift(`[${timestamp}] ${message}`);
    // Keep log size manageable
    if (this.state.logs.length > 100) {
      this.state.logs.pop();
    }
  }

  // Helper to throw if paused
  checkSystemAvailability() {
    if (this.state.isPaused) {
      throw new Error("SYSTEM_PAUSED: The system is currently under maintenance. Please try again later.");
    }
  }
}

export const adminService = new AdminService();
