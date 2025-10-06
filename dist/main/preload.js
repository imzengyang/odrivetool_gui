"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 定义暴露给渲染进程的 API
const electronAPI = {
    // 设备管理
    scanDevices: () => electron_1.ipcRenderer.invoke('serial:get-ports'),
    connectDevice: (port) => electron_1.ipcRenderer.invoke('serial:connect', port),
    disconnectDevice: () => electron_1.ipcRenderer.invoke('serial:disconnect'),
    // ODrive 协议操作
    odriveRead: (path) => electron_1.ipcRenderer.invoke('odrive:read', path),
    odriveWrite: (path, value) => electron_1.ipcRenderer.invoke('odrive:write', path, value),
    odriveRequestState: (state) => electron_1.ipcRenderer.invoke('odrive:write', `axis0.requested_state`, state),
    odriveStartTelemetry: (keys, rateHz) => electron_1.ipcRenderer.invoke('odrive:start-telemetry', keys, rateHz),
    odriveStopTelemetry: () => electron_1.ipcRenderer.invoke('odrive:stop-telemetry'),
    // 流程控制
    flowStart: (flowDefinition) => electron_1.ipcRenderer.invoke('flow-start', flowDefinition),
    flowPause: () => electron_1.ipcRenderer.invoke('flow-pause'),
    flowResume: () => electron_1.ipcRenderer.invoke('flow-resume'),
    flowStop: () => electron_1.ipcRenderer.invoke('flow-stop'),
    // 文件操作
    showSaveDialog: (options) => electron_1.ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('show-open-dialog', options),
    // 日志操作
    getLogs: () => electron_1.ipcRenderer.invoke('log:get-logs'),
    clearLogs: () => electron_1.ipcRenderer.invoke('log:clear'),
    // 命令系统
    commandsGetAll: () => electron_1.ipcRenderer.invoke('commands:get-all'),
    commandsGetCategories: () => electron_1.ipcRenderer.invoke('commands:get-categories'),
    commandsGetByCategory: (category) => electron_1.ipcRenderer.invoke('commands:get-by-category', category),
    commandsSearch: (query) => electron_1.ipcRenderer.invoke('commands:search', query),
    commandsValidate: (commandKey, params) => electron_1.ipcRenderer.invoke('commands:validate', commandKey, params),
    commandsExecute: (commandKey, params) => electron_1.ipcRenderer.invoke('commands:execute', commandKey, params),
    commandsGetDefaults: (commandKey) => electron_1.ipcRenderer.invoke('commands:get-defaults', commandKey),
    // 应用控制
    getAppVersion: () => electron_1.ipcRenderer.invoke('app:get-version'),
    quitApp: () => electron_1.ipcRenderer.invoke('app:quit'),
    // 通用调用方法
    invoke: (channel, ...args) => electron_1.ipcRenderer.invoke(channel, ...args),
    // 事件监听
    onDevicesScanned: (callback) => {
        electron_1.ipcRenderer.on('devices-scanned', (_, devices) => callback(devices));
    },
    onDeviceConnected: (callback) => {
        electron_1.ipcRenderer.on('device-connected', (_, device) => callback(device));
    },
    onDeviceDisconnected: (callback) => {
        electron_1.ipcRenderer.on('device-disconnected', () => callback());
    },
    onTelemetryData: (callback) => {
        electron_1.ipcRenderer.on('telemetry-data', (_, data) => callback(data));
    },
    onFlowUpdate: (callback) => {
        electron_1.ipcRenderer.on('flow-update', (_, update) => callback(update));
    },
    onEmergencyStop: (callback) => {
        electron_1.ipcRenderer.on('emergency-stop', () => callback());
    },
    onMenuNewFlow: (callback) => {
        electron_1.ipcRenderer.on('menu-new-flow', () => callback());
    },
    onMenuOpenFlow: (callback) => {
        electron_1.ipcRenderer.on('menu-open-flow', () => callback());
    },
    onMenuSaveFlow: (callback) => {
        electron_1.ipcRenderer.on('menu-save-flow', () => callback());
    },
    onMenuExportConfig: (callback) => {
        electron_1.ipcRenderer.on('menu-export-config', () => callback());
    },
    onMenuImportConfig: (callback) => {
        electron_1.ipcRenderer.on('menu-import-config', () => callback());
    },
    onMenuConnectDevice: (callback) => {
        electron_1.ipcRenderer.on('menu-connect-device', () => callback());
    },
    // 移除事件监听器
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
};
// 将 API 暴露给渲染进程
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
