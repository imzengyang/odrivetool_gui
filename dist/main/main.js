"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const SerialPortManager_1 = require("./services/SerialPortManager");
const ODriveProtocol_1 = require("./services/ODriveProtocol");
const CommandLoader_1 = require("./services/CommandLoader");
const LogService_1 = require("./services/LogService");
// 保持对窗口对象的全局引用
let mainWindow = null;
let serialManager = null;
let odriveProtocol = null;
let logService = null;
const isDev = process.env.NODE_ENV === 'development';
function createWindow() {
    // 创建浏览器窗口
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../../assets/icon.png'),
        show: false,
        titleBarStyle: 'default'
    });
    // 加载应用
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
    // 窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        // 初始化服务
        initializeServices();
    });
    // 当窗口关闭时触发
    mainWindow.on('closed', () => {
        mainWindow = null;
        cleanupServices();
    });
}
/**
 * 初始化服务
 */
async function initializeServices() {
    try {
        // 初始化日志服务
        logService = new LogService_1.LogService();
        // 初始化串口管理器
        serialManager = new SerialPortManager_1.SerialPortManager();
        // 初始化ODrive协议
        odriveProtocol = new ODriveProtocol_1.ODriveProtocol(serialManager);
        // 加载命令配置
        await CommandLoader_1.commandLoader.loadFromFile(path.join(__dirname, '../../commands/odrive_v3_6.json'));
        // 设置事件监听器
        setupEventListeners();
        logService.info('应用服务初始化完成');
        // 发送初始化完成事件到渲染进程
        mainWindow?.webContents.send('services-initialized');
    }
    catch (error) {
        logService?.error('服务初始化失败:', error);
        mainWindow?.webContents.send('services-error', error);
    }
}
/**
 * 清理服务
 */
function cleanupServices() {
    try {
        odriveProtocol?.cleanup();
        serialManager?.cleanup();
        CommandLoader_1.commandLoader?.cleanup();
        logService?.info('应用服务清理完成');
    }
    catch (error) {
        console.error('服务清理失败:', error);
    }
}
// 当所有窗口关闭时退出应用
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// 应用准备就绪时创建窗口
electron_1.app.whenReady().then(() => {
    createWindow();
    // 设置菜单
    if (isDev) {
        electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate([
            {
                label: '开发',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { type: 'separator' },
                    { role: 'toggleDevTools' }
                ]
            }
        ]));
    }
    else {
        electron_1.Menu.setApplicationMenu(null);
    }
});
// IPC 处理程序
// 串口管理
electron_1.ipcMain.handle('serial:get-ports', async () => {
    if (!serialManager)
        throw new Error('串口管理器未初始化');
    return await serialManager.scanDevices();
});
electron_1.ipcMain.handle('serial:connect', async (event, port) => {
    if (!serialManager)
        throw new Error('串口管理器未初始化');
    return await serialManager.connect(port);
});
electron_1.ipcMain.handle('serial:disconnect', async () => {
    if (!serialManager)
        throw new Error('串口管理器未初始化');
    return await serialManager.disconnect();
});
electron_1.ipcMain.handle('serial:is-connected', () => {
    if (!serialManager)
        return false;
    return serialManager.isConnected();
});
electron_1.ipcMain.handle('serial:write', async (event, data) => {
    if (!serialManager)
        throw new Error('串口管理器未初始化');
    return await serialManager.write(data);
});
// ODrive 协议
electron_1.ipcMain.handle('odrive:read', async (event, path) => {
    if (!odriveProtocol)
        throw new Error('ODrive协议未初始化');
    return await odriveProtocol.read(path);
});
electron_1.ipcMain.handle('odrive:write', async (event, path, value) => {
    if (!odriveProtocol)
        throw new Error('ODrive协议未初始化');
    return await odriveProtocol.write(path, value);
});
electron_1.ipcMain.handle('odrive:emergency-stop', async () => {
    if (!odriveProtocol)
        throw new Error('ODrive协议未初始化');
    return await odriveProtocol.emergencyStop();
});
electron_1.ipcMain.handle('odrive:start-telemetry', async (event, keys, rateHz) => {
    if (!odriveProtocol)
        throw new Error('ODrive协议未初始化');
    return await odriveProtocol.startTelemetry(keys, rateHz);
});
electron_1.ipcMain.handle('odrive:stop-telemetry', () => {
    if (!odriveProtocol)
        throw new Error('ODrive协议未初始化');
    odriveProtocol.stopTelemetry();
});
electron_1.ipcMain.handle('odrive:calibrate-motor', async () => {
    if (!odriveProtocol)
        throw new Error('ODrive协议未初始化');
    return await odriveProtocol.calibrateMotor();
});
electron_1.ipcMain.handle('odrive:calibrate-encoder', async () => {
    if (!odriveProtocol)
        throw new Error('ODrive协议未初始化');
    return await odriveProtocol.calibrateEncoder();
});
// 命令系统
electron_1.ipcMain.handle('commands:get-all', () => {
    return CommandLoader_1.commandLoader.getAllCommands();
});
electron_1.ipcMain.handle('commands:get-categories', () => {
    return CommandLoader_1.commandLoader.getCategories();
});
electron_1.ipcMain.handle('commands:get-by-category', (event, category) => {
    return CommandLoader_1.commandLoader.getCommandsByCategory(category);
});
electron_1.ipcMain.handle('commands:search', (event, query) => {
    return CommandLoader_1.commandLoader.searchCommands(query);
});
electron_1.ipcMain.handle('commands:validate', (event, commandKey, params) => {
    return CommandLoader_1.commandLoader.validateCommand(commandKey, params);
});
electron_1.ipcMain.handle('commands:execute', (event, commandKey, params) => {
    return CommandLoader_1.commandLoader.executeCommand(commandKey, params);
});
electron_1.ipcMain.handle('commands:get-defaults', (event, commandKey) => {
    return CommandLoader_1.commandLoader.getCommandDefaults(commandKey);
});
// 日志服务
electron_1.ipcMain.handle('log:get-logs', () => {
    if (!logService)
        return [];
    return logService.getLogs();
});
electron_1.ipcMain.handle('log:clear', () => {
    if (!logService)
        return;
    logService.clearLogs();
});
// 应用控制
electron_1.ipcMain.handle('app:get-version', () => {
    return electron_1.app.getVersion();
});
electron_1.ipcMain.handle('app:quit', () => {
    electron_1.app.quit();
});
// 设置事件监听器函数
function setupEventListeners() {
    if (!serialManager || !odriveProtocol || !logService)
        return;
    serialManager.on('connected', () => {
        mainWindow?.webContents.send('serial:connected');
    });
    serialManager.on('disconnected', () => {
        mainWindow?.webContents.send('serial:disconnected');
    });
    serialManager.on('data', (data) => {
        mainWindow?.webContents.send('serial:data', data);
    });
    serialManager.on('error', (error) => {
        mainWindow?.webContents.send('serial:error', error);
        logService?.error('串口错误:', error);
    });
    odriveProtocol.on('telemetry-data', (data) => {
        mainWindow?.webContents.send('odrive:telemetry-data', data);
    });
    odriveProtocol.on('telemetry-started', () => {
        mainWindow?.webContents.send('odrive:telemetry-started');
    });
    odriveProtocol.on('telemetry-stopped', () => {
        mainWindow?.webContents.send('odrive:telemetry-stopped');
    });
    odriveProtocol.on('motor-calibrated', () => {
        mainWindow?.webContents.send('odrive:motor-calibrated');
    });
    odriveProtocol.on('encoder-calibrated', () => {
        mainWindow?.webContents.send('odrive:encoder-calibrated');
    });
    odriveProtocol.on('emergency-stop', () => {
        mainWindow?.webContents.send('odrive:emergency-stop');
    });
}
CommandLoader_1.commandLoader.on('commands-loaded', (data) => {
    mainWindow?.webContents.send('commands:loaded', data);
});
CommandLoader_1.commandLoader.on('error', (error) => {
    mainWindow?.webContents.send('commands:error', error);
    logService?.error('命令加载器错误:', error);
});
// 错误处理
process.on('uncaughtException', (error) => {
    logService?.error('未捕获的异常:', error);
    console.error('未捕获的异常:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    logService?.error('未处理的Promise拒绝:', reason);
    console.error('未处理的Promise拒绝:', reason);
});
// 应用退出前清理
electron_1.app.on('before-quit', () => {
    cleanupServices();
});
