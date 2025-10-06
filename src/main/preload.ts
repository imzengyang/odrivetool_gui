import { contextBridge, ipcRenderer } from 'electron';
import type { 
  ODriveDevice, 
  TelemetryData, 
  FlowDefinition, 
  IPCMessage,
  LogEntry,
  MotorConfig,
  EncoderConfig,
  ExportData
} from '../shared/types';

// 定义暴露给渲染进程的 API
const electronAPI = {
  // 设备管理
  scanDevices: () => ipcRenderer.invoke('scan-devices'),
  connectDevice: (port: string) => ipcRenderer.invoke('connect-device', port),
  disconnectDevice: () => ipcRenderer.invoke('disconnect-device'),

  // ODrive 协议操作
  odriveRead: (path: string) => ipcRenderer.invoke('odrive-read', path),
  odriveWrite: (path: string, value: any) => ipcRenderer.invoke('odrive-write', path, value),
  odriveRequestState: (state: string) => ipcRenderer.invoke('odrive-request-state', state),
  odriveStartTelemetry: (keys: string[], rateHz: number) => 
    ipcRenderer.invoke('odrive-start-telemetry', keys, rateHz),
  odriveStopTelemetry: () => ipcRenderer.invoke('odrive-stop-telemetry'),

  // 流程控制
  flowStart: (flowDefinition: FlowDefinition) => ipcRenderer.invoke('flow-start', flowDefinition),
  flowPause: () => ipcRenderer.invoke('flow-pause'),
  flowResume: () => ipcRenderer.invoke('flow-resume'),
  flowStop: () => ipcRenderer.invoke('flow-stop'),

  // 文件操作
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),

  // 日志操作
  getLogs: () => ipcRenderer.invoke('get-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),

  // 事件监听
  onDevicesScanned: (callback: (devices: ODriveDevice[]) => void) => {
    ipcRenderer.on('devices-scanned', (_, devices) => callback(devices));
  },
  onDeviceConnected: (callback: (device: ODriveDevice) => void) => {
    ipcRenderer.on('device-connected', (_, device) => callback(device));
  },
  onDeviceDisconnected: (callback: () => void) => {
    ipcRenderer.on('device-disconnected', () => callback());
  },
  onTelemetryData: (callback: (data: TelemetryData[]) => void) => {
    ipcRenderer.on('telemetry-data', (_, data) => callback(data));
  },
  onFlowUpdate: (callback: (update: any) => void) => {
    ipcRenderer.on('flow-update', (_, update) => callback(update));
  },
  onEmergencyStop: (callback: () => void) => {
    ipcRenderer.on('emergency-stop', () => callback());
  },
  onMenuNewFlow: (callback: () => void) => {
    ipcRenderer.on('menu-new-flow', () => callback());
  },
  onMenuOpenFlow: (callback: () => void) => {
    ipcRenderer.on('menu-open-flow', () => callback());
  },
  onMenuSaveFlow: (callback: () => void) => {
    ipcRenderer.on('menu-save-flow', () => callback());
  },
  onMenuExportConfig: (callback: () => void) => {
    ipcRenderer.on('menu-export-config', () => callback());
  },
  onMenuImportConfig: (callback: () => void) => {
    ipcRenderer.on('menu-import-config', () => callback());
  },
  onMenuConnectDevice: (callback: () => void) => {
    ipcRenderer.on('menu-connect-device', () => callback());
  },

  // 移除事件监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// 将 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明，供渲染进程使用
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
