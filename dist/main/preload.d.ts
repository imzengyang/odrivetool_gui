import type { ODriveDevice, TelemetryData, FlowDefinition } from '../shared/types';
declare const electronAPI: {
    scanDevices: () => Promise<any>;
    connectDevice: (port: string) => Promise<any>;
    disconnectDevice: () => Promise<any>;
    odriveRead: (path: string) => Promise<any>;
    odriveWrite: (path: string, value: any) => Promise<any>;
    odriveRequestState: (state: string) => Promise<any>;
    odriveStartTelemetry: (keys: string[], rateHz: number) => Promise<any>;
    odriveStopTelemetry: () => Promise<any>;
    flowStart: (flowDefinition: FlowDefinition) => Promise<any>;
    flowPause: () => Promise<any>;
    flowResume: () => Promise<any>;
    flowStop: () => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
    showOpenDialog: (options: any) => Promise<any>;
    getLogs: () => Promise<any>;
    clearLogs: () => Promise<any>;
    onDevicesScanned: (callback: (devices: ODriveDevice[]) => void) => void;
    onDeviceConnected: (callback: (device: ODriveDevice) => void) => void;
    onDeviceDisconnected: (callback: () => void) => void;
    onTelemetryData: (callback: (data: TelemetryData[]) => void) => void;
    onFlowUpdate: (callback: (update: any) => void) => void;
    onEmergencyStop: (callback: () => void) => void;
    onMenuNewFlow: (callback: () => void) => void;
    onMenuOpenFlow: (callback: () => void) => void;
    onMenuSaveFlow: (callback: () => void) => void;
    onMenuExportConfig: (callback: () => void) => void;
    onMenuImportConfig: (callback: () => void) => void;
    onMenuConnectDevice: (callback: () => void) => void;
    removeAllListeners: (channel: string) => void;
};
declare global {
    interface Window {
        electronAPI: typeof electronAPI;
    }
}
export {};
