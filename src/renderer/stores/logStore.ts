import create from 'zustand';
import type { LogEntry } from '../../shared/types';

interface LogStore {
  logs: LogEntry[];
  maxLogs: number;
  
  // Actions
  setLogs: (logs: LogEntry[]) => void;
  addLog: (level: LogEntry['level'], message: string, context?: any) => void;
  clearLogs: () => void;
  
  // Methods
  initialize: () => Promise<void>;
  getLogsByLevel: (level: LogEntry['level']) => LogEntry[];
  searchLogs: (query: string) => LogEntry[];
  exportLogs: (format: 'json' | 'csv') => string;
}

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],
  maxLogs: 1000,
  
  setLogs: (logs) => set({ logs }),
  
  addLog: (level, message, context) => {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
    };
    
    const { logs, maxLogs } = get();
    const updatedLogs = [...logs, logEntry];
    
    // 保持最大日志数量
    if (updatedLogs.length > maxLogs) {
      updatedLogs.splice(0, updatedLogs.length - maxLogs);
    }
    
    set({ logs: updatedLogs });
  },
  
  clearLogs: () => {
    set({ logs: [] });
  },
  
  initialize: async () => {
    try {
      if (window.electronAPI) {
        const logs = await window.electronAPI.getLogs();
        set({ logs });
      }
    } catch (error) {
      console.error('Log store initialization failed:', error);
    }
  },
  
  getLogsByLevel: (level) => {
    const { logs } = get();
    return logs.filter(log => log.level === level);
  },
  
  searchLogs: (query) => {
    const { logs } = get();
    const lowerQuery = query.toLowerCase();
    return logs.filter(log => 
      log.message.toLowerCase().includes(lowerQuery) ||
      (log.context && JSON.stringify(log.context).toLowerCase().includes(lowerQuery))
    );
  },
  
  exportLogs: (format) => {
    const { logs } = get();
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV 格式
      const headers = 'Timestamp,Level,Message,Context\n';
      const rows = logs.map(log => {
        const timestamp = new Date(log.timestamp).toISOString();
        const message = `"${log.message.replace(/"/g, '""')}"`;
        const context = log.context ? `"${JSON.stringify(log.context).replace(/"/g, '""')}"` : '';
        return `${timestamp},${log.level},${message},${context}`;
      }).join('\n');
      return headers + rows;
    }
  },
}));
