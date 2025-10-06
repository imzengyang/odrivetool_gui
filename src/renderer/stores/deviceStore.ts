import create from 'zustand';
import type { ODriveDevice } from '../../shared/types';

interface DeviceStore {
  devices: ODriveDevice[];
  connectedDevice: ODriveDevice | null;
  isScanning: boolean;
  isLoading: boolean;
  
  // Actions
  setDevices: (devices: ODriveDevice[]) => void;
  setConnectedDevice: (device: ODriveDevice | null) => void;
  setScanning: (scanning: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // Methods
  initialize: () => Promise<void>;
  scanDevices: () => Promise<void>;
  connectDevice: (port: string) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  exportConfiguration: () => void;
  importConfiguration: (file: File) => void;
  showConnectDialog: () => void;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  connectedDevice: null,
  isScanning: false,
  isLoading: false,
  
  setDevices: (devices) => set({ devices }),
  setConnectedDevice: (device) => set({ connectedDevice: device }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  initialize: async () => {
    set({ isLoading: true });
    try {
      // 初始化逻辑
    } catch (error) {
      console.error('Device store initialization failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  scanDevices: async () => {
    set({ isScanning: true });
    try {
      if (window.electronAPI) {
        const devices = await window.electronAPI.scanDevices();
        set({ devices });
      }
    } catch (error) {
      console.error('Scan devices failed:', error);
    } finally {
      set({ isScanning: false });
    }
  },
  
  connectDevice: async (port: string) => {
    set({ isLoading: true });
    try {
      if (window.electronAPI) {
        const device = await window.electronAPI.connectDevice(port);
        set({ connectedDevice: device });
      }
    } catch (error) {
      console.error('Connect device failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  disconnectDevice: async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.disconnectDevice();
        set({ connectedDevice: null });
      }
    } catch (error) {
      console.error('Disconnect device failed:', error);
    }
  },
  
  exportConfiguration: () => {
    // 导出配置逻辑
    console.log('Export configuration');
  },
  
  importConfiguration: (file: File) => {
    // 导入配置逻辑
    console.log('Import configuration:', file.name);
  },
  
  showConnectDialog: () => {
    // 显示连接对话框
    console.log('Show connect dialog');
  },
}));
