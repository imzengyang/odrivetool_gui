import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { SerialPortManager } from './services/SerialPortManager';
import { ODriveProtocol } from './services/ODriveProtocol';
import { commandLoader } from './services/CommandLoader';
import { LogService } from './services/LogService';

// 保持对窗口对象的全局引用
let mainWindow: BrowserWindow | null = null;
let serialManager: SerialPortManager | null = null;
let odriveProtocol: ODriveProtocol | null = null;
let logService: LogService | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow(): void {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
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
  } else {
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
async function initializeServices(): Promise<void> {
  try {
    // 初始化日志服务
    logService = new LogService();
    
    // 初始化串口管理器
    serialManager = new SerialPortManager();
    
    // 初始化ODrive协议
    odriveProtocol = new ODriveProtocol(serialManager);
    
    // 加载命令配置
    await commandLoader.loadFromFile(path.join(__dirname, '../../commands/odrive_v3_6.json'));
    
    // 设置事件监听器
    setupEventListeners();
    
    logService.info('应用服务初始化完成');
    
    // 发送初始化完成事件到渲染进程
    mainWindow?.webContents.send('services-initialized');
    
  } catch (error) {
    logService?.error('服务初始化失败:', error);
    mainWindow?.webContents.send('services-error', error);
  }
}

/**
 * 清理服务
 */
function cleanupServices(): void {
  try {
    odriveProtocol?.cleanup();
    serialManager?.cleanup();
    commandLoader?.cleanup();
    logService?.info('应用服务清理完成');
  } catch (error) {
    console.error('服务清理失败:', error);
  }
}

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow();
  
  // 设置菜单
  if (isDev) {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
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
  } else {
    Menu.setApplicationMenu(null);
  }
});

// IPC 处理程序

// 串口管理
ipcMain.handle('serial:get-ports', async () => {
  if (!serialManager) throw new Error('串口管理器未初始化');
  return await serialManager.scanDevices();
});

ipcMain.handle('serial:connect', async (event, port: string) => {
  if (!serialManager) throw new Error('串口管理器未初始化');
  return await serialManager.connect(port);
});

ipcMain.handle('serial:disconnect', async () => {
  if (!serialManager) throw new Error('串口管理器未初始化');
  return await serialManager.disconnect();
});

ipcMain.handle('serial:is-connected', () => {
  if (!serialManager) return false;
  return serialManager.isConnected();
});

ipcMain.handle('serial:write', async (event, data: string) => {
  if (!serialManager) throw new Error('串口管理器未初始化');
  return await serialManager.write(data);
});

// ODrive 协议
ipcMain.handle('odrive:read', async (event, path: string) => {
  if (!odriveProtocol) throw new Error('ODrive协议未初始化');
  return await odriveProtocol.read(path);
});

ipcMain.handle('odrive:write', async (event, path: string, value: any) => {
  if (!odriveProtocol) throw new Error('ODrive协议未初始化');
  return await odriveProtocol.write(path, value);
});

ipcMain.handle('odrive:emergency-stop', async () => {
  if (!odriveProtocol) throw new Error('ODrive协议未初始化');
  return await odriveProtocol.emergencyStop();
});

ipcMain.handle('odrive:start-telemetry', async (event, keys: string[], rateHz: number) => {
  if (!odriveProtocol) throw new Error('ODrive协议未初始化');
  return await odriveProtocol.startTelemetry(keys, rateHz);
});

ipcMain.handle('odrive:stop-telemetry', () => {
  if (!odriveProtocol) throw new Error('ODrive协议未初始化');
  odriveProtocol.stopTelemetry();
});

ipcMain.handle('odrive:calibrate-motor', async () => {
  if (!odriveProtocol) throw new Error('ODrive协议未初始化');
  return await odriveProtocol.calibrateMotor();
});

ipcMain.handle('odrive:calibrate-encoder', async () => {
  if (!odriveProtocol) throw new Error('ODrive协议未初始化');
  return await odriveProtocol.calibrateEncoder();
});

// 命令系统
ipcMain.handle('commands:get-all', () => {
  return commandLoader.getAllCommands();
});

ipcMain.handle('commands:get-categories', () => {
  return commandLoader.getCategories();
});

ipcMain.handle('commands:get-by-category', (event, category: string) => {
  return commandLoader.getCommandsByCategory(category);
});

ipcMain.handle('commands:search', (event, query: string) => {
  return commandLoader.searchCommands(query);
});

ipcMain.handle('commands:validate', (event, commandKey: string, params: Record<string, any>) => {
  return commandLoader.validateCommand(commandKey, params);
});

ipcMain.handle('commands:execute', (event, commandKey: string, params: Record<string, any>) => {
  return commandLoader.executeCommand(commandKey, params);
});

ipcMain.handle('commands:get-defaults', (event, commandKey: string) => {
  return commandLoader.getCommandDefaults(commandKey);
});

// 日志服务
ipcMain.handle('log:get-logs', () => {
  if (!logService) return [];
  return logService.getLogs();
});

ipcMain.handle('log:clear', () => {
  if (!logService) return;
  logService.clearLogs();
});

// 应用控制
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('app:quit', () => {
  app.quit();
});

// 设置事件监听器函数
function setupEventListeners(): void {
  if (!serialManager || !odriveProtocol || !logService) return;

  serialManager.on('connected', () => {
    mainWindow?.webContents.send('serial:connected');
  });

  serialManager.on('disconnected', () => {
    mainWindow?.webContents.send('serial:disconnected');
  });

  serialManager.on('data', (data: string) => {
    mainWindow?.webContents.send('serial:data', data);
  });

  serialManager.on('error', (error: any) => {
    mainWindow?.webContents.send('serial:error', error);
    logService?.error('串口错误:', error);
  });

  odriveProtocol.on('telemetry-data', (data: any) => {
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

commandLoader.on('commands-loaded', (data: any) => {
  mainWindow?.webContents.send('commands:loaded', data);
});

commandLoader.on('error', (error: any) => {
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
app.on('before-quit', () => {
  cleanupServices();
});
