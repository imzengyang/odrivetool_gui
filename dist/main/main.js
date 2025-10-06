"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const SerialPortManager_1 = require("./services/SerialPortManager");
const ODriveProtocol_1 = require("./services/ODriveProtocol");
const FlowRunner_1 = require("./services/FlowRunner");
const LogService_1 = require("./services/LogService");
class ODriveApp {
    constructor() {
        this.mainWindow = null;
        this.serialPortManager = new SerialPortManager_1.SerialPortManager();
        this.odriveProtocol = new ODriveProtocol_1.ODriveProtocol(this.serialPortManager);
        this.flowRunner = new FlowRunner_1.FlowRunner();
        this.logService = new LogService_1.LogService();
    }
    createWindow() {
        // 创建浏览器窗口 - 采用流行的16:10比例设计
        this.mainWindow = new electron_1.BrowserWindow({
            width: 1440, // 流行的笔记本屏幕宽度
            height: 900, // 16:10比例，适合工具类应用
            minWidth: 1280, // 最小宽度支持720p内容
            minHeight: 800, // 最小高度保证界面完整性
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: (0, path_1.join)(__dirname, 'preload.js'),
            },
            titleBarStyle: 'default',
            show: false,
            center: true, // 窗口居中显示
        });
        // 加载应用
        this.mainWindow.loadFile((0, path_1.join)(__dirname, '../renderer/index.html'));
        // 开发模式下打开开发者工具
        if (!electron_1.app.isPackaged) {
            this.mainWindow.webContents.openDevTools();
        }
        // 窗口准备好后显示
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });
        // 窗口关闭时清理资源
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
            this.cleanup();
        });
    }
    setupMenu() {
        const template = [
            {
                label: '文件',
                submenu: [
                    {
                        label: '新建流程',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => {
                            this.mainWindow?.webContents.send('menu-new-flow');
                        },
                    },
                    {
                        label: '打开流程',
                        accelerator: 'CmdOrCtrl+O',
                        click: () => {
                            this.mainWindow?.webContents.send('menu-open-flow');
                        },
                    },
                    {
                        label: '保存流程',
                        accelerator: 'CmdOrCtrl+S',
                        click: () => {
                            this.mainWindow?.webContents.send('menu-save-flow');
                        },
                    },
                    { type: 'separator' },
                    {
                        label: '导出配置',
                        click: () => {
                            this.mainWindow?.webContents.send('menu-export-config');
                        },
                    },
                    {
                        label: '导入配置',
                        click: () => {
                            this.mainWindow?.webContents.send('menu-import-config');
                        },
                    },
                    { type: 'separator' },
                    {
                        label: '退出',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => {
                            electron_1.app.quit();
                        },
                    },
                ],
            },
            {
                label: '设备',
                submenu: [
                    {
                        label: '扫描设备',
                        accelerator: 'CmdOrCtrl+R',
                        click: () => {
                            this.scanDevices();
                        },
                    },
                    {
                        label: '连接设备',
                        click: () => {
                            this.mainWindow?.webContents.send('menu-connect-device');
                        },
                    },
                    {
                        label: '断开设备',
                        click: () => {
                            this.disconnectDevice();
                        },
                    },
                ],
            },
            {
                label: '帮助',
                submenu: [
                    {
                        label: '关于',
                        click: () => {
                            electron_1.dialog.showMessageBox(this.mainWindow, {
                                type: 'info',
                                title: '关于 ODrive GUI',
                                message: 'ODrive 控制界面应用',
                                detail: '版本 1.0.0\n用于 ODrive v0.5.1 固件的电机控制与监控',
                            });
                        },
                    },
                ],
            },
        ];
        const menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
    }
    setupWindowShortcuts() {
        if (!this.mainWindow)
            return;
        // 窗口级别的紧急停止快捷键
        this.mainWindow.webContents.on('before-input-event', (event, input) => {
            // 当空格键被按下时触发紧急停止
            if (input.key === 'Space' && !input.meta && !input.control && !input.alt && !input.shift) {
                event.preventDefault();
                this.emergencyStop();
            }
            // 当 Ctrl+Space 被按下时也触发紧急停止
            if (input.key === 'Space' && (input.control || input.meta) && !input.alt && !input.shift) {
                event.preventDefault();
                this.emergencyStop();
            }
        });
    }
    setupIPC() {
        // 设备管理
        electron_1.ipcMain.handle('scan-devices', async () => {
            return await this.serialPortManager.scanDevices();
        });
        electron_1.ipcMain.handle('connect-device', async (_, port) => {
            return await this.serialPortManager.connect(port);
        });
        electron_1.ipcMain.handle('disconnect-device', async () => {
            return await this.serialPortManager.disconnect();
        });
        // ODrive 协议操作
        electron_1.ipcMain.handle('odrive-read', async (_, path) => {
            return await this.odriveProtocol.read(path);
        });
        electron_1.ipcMain.handle('odrive-write', async (_, path, value) => {
            return await this.odriveProtocol.write(path, value);
        });
        electron_1.ipcMain.handle('odrive-request-state', async (_, state) => {
            return await this.odriveProtocol.requestState(state);
        });
        electron_1.ipcMain.handle('odrive-start-telemetry', async (_, keys, rateHz) => {
            return await this.odriveProtocol.startTelemetry(keys, rateHz);
        });
        electron_1.ipcMain.handle('odrive-stop-telemetry', async () => {
            return await this.odriveProtocol.stopTelemetry();
        });
        // 流程控制
        electron_1.ipcMain.handle('flow-start', async (_, flowDefinition) => {
            return await this.flowRunner.start(flowDefinition);
        });
        electron_1.ipcMain.handle('flow-pause', async () => {
            return await this.flowRunner.pause();
        });
        electron_1.ipcMain.handle('flow-resume', async () => {
            return await this.flowRunner.resume();
        });
        electron_1.ipcMain.handle('flow-stop', async () => {
            return await this.flowRunner.stop();
        });
        // 文件操作
        electron_1.ipcMain.handle('show-save-dialog', async (_, options) => {
            return await electron_1.dialog.showSaveDialog(this.mainWindow, options);
        });
        electron_1.ipcMain.handle('show-open-dialog', async (_, options) => {
            return await electron_1.dialog.showOpenDialog(this.mainWindow, options);
        });
        // 日志操作
        electron_1.ipcMain.handle('get-logs', async () => {
            return this.logService.getLogs();
        });
        electron_1.ipcMain.handle('clear-logs', async () => {
            return this.logService.clearLogs();
        });
    }
    async scanDevices() {
        try {
            const devices = await this.serialPortManager.scanDevices();
            this.mainWindow?.webContents.send('devices-scanned', devices);
        }
        catch (error) {
            this.logService.error('扫描设备失败', error);
        }
    }
    async disconnectDevice() {
        try {
            await this.serialPortManager.disconnect();
            this.mainWindow?.webContents.send('device-disconnected');
        }
        catch (error) {
            this.logService.error('断开设备失败', error);
        }
    }
    async emergencyStop() {
        try {
            // 立即停止所有电机
            await this.odriveProtocol.emergencyStop();
            this.flowRunner.stop();
            this.mainWindow?.webContents.send('emergency-stop');
            this.logService.warn('紧急停止已触发');
        }
        catch (error) {
            // 即使紧急停止失败，也要确保流程停止和事件发送
            this.flowRunner.stop();
            this.mainWindow?.webContents.send('emergency-stop');
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('设备未连接')) {
                this.logService.warn('紧急停止: 设备未连接，仅停止本地流程');
            }
            else {
                this.logService.error('紧急停止失败', error);
            }
        }
    }
    cleanup() {
        this.serialPortManager.disconnect();
        this.odriveProtocol.stopTelemetry();
        this.flowRunner.stop();
    }
    async initialize() {
        await electron_1.app.whenReady();
        this.createWindow();
        this.setupMenu();
        this.setupWindowShortcuts();
        this.setupIPC();
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                electron_1.app.quit();
            }
        });
        electron_1.app.on('activate', () => {
            if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        });
    }
}
// 创建应用实例并初始化
const odriveApp = new ODriveApp();
odriveApp.initialize().catch((error) => {
    console.error('应用初始化失败', error);
    electron_1.app.quit();
});
