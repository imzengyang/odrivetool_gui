import create from 'zustand';
import type { TelemetryData } from '../../shared/types';

interface TelemetryStore {
  data: TelemetryData[];
  isRecording: boolean;
  isPaused: boolean;
  samplingRate: number;
  bufferSize: number;
  
  // Actions
  setData: (data: TelemetryData[]) => void;
  setRecording: (recording: boolean) => void;
  setPaused: (paused: boolean) => void;
  setSamplingRate: (rate: number) => void;
  setBufferSize: (size: number) => void;
  
  // Methods
  initialize: () => Promise<void>;
  addTelemetryData: (data: TelemetryData[]) => void;
  startTelemetry: () => Promise<void>;
  stopTelemetry: () => Promise<void>;
  pauseTelemetry: () => void;
  resumeTelemetry: () => void;
  clearData: () => void;
  exportData: (format: 'csv' | 'json') => void;
}

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  data: [],
  isRecording: false,
  isPaused: false,
  samplingRate: 50,
  bufferSize: 3000, // 60 seconds at 50Hz
  
  setData: (data) => set({ data }),
  setRecording: (recording) => set({ isRecording: recording }),
  setPaused: (paused) => set({ isPaused: paused }),
  setSamplingRate: (rate) => set({ samplingRate: rate }),
  setBufferSize: (size) => set({ bufferSize: size }),
  
  initialize: async () => {
    try {
      // 初始化逻辑
    } catch (error) {
      console.error('Telemetry store initialization failed:', error);
    }
  },
  
  addTelemetryData: (newData) => {
    const { data, bufferSize } = get();
    const updatedData = [...data, ...newData];
    
    // 保持缓冲区大小
    if (updatedData.length > bufferSize) {
      updatedData.splice(0, updatedData.length - bufferSize);
    }
    
    set({ data: updatedData });
  },
  
  startTelemetry: async () => {
    try {
      if (window.electronAPI) {
        const keys = ['vbus_voltage', 'ibus', 'vel_estimate', 'pos_estimate', 'temperature'];
        await window.electronAPI.odriveStartTelemetry(keys, get().samplingRate);
        set({ isRecording: true, isPaused: false });
      }
    } catch (error) {
      console.error('Start telemetry failed:', error);
    }
  },
  
  stopTelemetry: async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.odriveStopTelemetry();
        set({ isRecording: false, isPaused: false });
      }
    } catch (error) {
      console.error('Stop telemetry failed:', error);
    }
  },
  
  pauseTelemetry: () => {
    set({ isPaused: true });
  },
  
  resumeTelemetry: () => {
    set({ isPaused: false });
  },
  
  clearData: () => {
    set({ data: [] });
  },
  
  exportData: (format) => {
    const { data } = get();
    // 导出逻辑
    console.log(`Export data as ${format}:`, data.length, 'records');
  },
}));
