import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import { join } from 'path';
import { SerialPortManager } from './services/SerialPortManager';
import { ODriveProtocol } from './services/ODriveProtocol';
import { FlowRunner } from './services/FlowRunner';
import { LogService } from './services/LogService';

class ODriveApp {
  private mainWindow: BrowserWindow | null = null;
  private serialPortManager: SerialPortManager;
  private odriveProtocol: ODriveProtocol;
  private flowRunner: FlowRunner;
  private logService: LogService;

  constructor() {
    this.serialPortManager = new SerialPortManager();
    this.odriveProtocol = new ODriveProtocol(this.serialPortManager);
    this.flowRunner = new FlowRunner();
    this.logService = new LogService();
  }

  private createWindow(): void {
    // 创建浏览器窗口 - 采用流行的16:10比例设计
    this.mainWindow = new BrowserWindow({
      width: 1440,  // 流行的笔记本屏幕宽度
      height: 900,  // 16:10比例，适合工具类应用
      minWidth: 1280,  // 最小宽度支持720p内容
      minHeight: 800,   // 最小高度保证界面完整性
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'default',
      show: false,
      center: true,  // 窗口居中显示
    });

    // 加载应用
    this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    
    // 开发模式下打开开发者工具
    if (!app.isPackaged) {
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

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
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
              app.quit();
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
              dialog.showMessageBox(this.mainWindow!, {
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

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupWindowShortcuts(): void {
    if (!this.mainWindow) return;

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

  private setupIPC(): void {
    // 设备管理
    ipcMain.handle('scan-devices', async () => {
      return await this.serialPortManager.scanDevices();
    });

    ipcMain.handle('connect-device', async (_, port: string) => {
      return await this.serialPortManager.connect(port);
    });

    ipcMain.handle('disconnect-device', async () => {
      return await this.serialPortManager.disconnect();
    });

    // ODrive 协议操作
    ipcMain.handle('odrive-read', async (_, path: string) => {
      return await this.odriveProtocol.read(path);
    });

    ipcMain.handle('odrive-write', async (_, path: string, value: any) => {
      return await this.odriveProtocol.write(path, value);
    });

    ipcMain.handle('odrive-request-state', async (_, state: string) => {
      return await this.odriveProtocol.requestState(state);
    });

    ipcMain.handle('odrive-start-telemetry', async (_, keys: string[], rateHz: number) => {
      return await this.odriveProtocol.startTelemetry(keys, rateHz);
    });

    ipcMain.handle('odrive-stop-telemetry', async () => {
      return await this.odriveProtocol.stopTelemetry();
    });

    // 流程控制
    ipcMain.handle('flow-start', async (_, flowDefinition: any) => {
      return await this.flowRunner.start(flowDefinition);
    });

    ipcMain.handle('flow-pause', async () => {
      return await this.flowRunner.pause();
    });

    ipcMain.handle('flow-resume', async () => {
      return await this.flowRunner.resume();
    });

    ipcMain.handle('flow-stop', async () => {
      return await this.flowRunner.stop();
    });

    // 文件操作
    ipcMain.handle('show-save-dialog', async (_, options: any) => {
      return await dialog.showSaveDialog(this.mainWindow!, options);
    });

    ipcMain.handle('show-open-dialog', async (_, options: any) => {
      return await dialog.showOpenDialog(this.mainWindow!, options);
    });

    // 日志操作
    ipcMain.handle('get-logs', async () => {
      return this.logService.getLogs();
    });

    ipcMain.handle('clear-logs', async () => {
      return this.logService.clearLogs();
    });
  }

  private async scanDevices(): Promise<void> {
    try {
      const devices = await this.serialPortManager.scanDevices();
      this.mainWindow?.webContents.send('devices-scanned', devices);
    } catch (error) {
      this.logService.error('扫描设备失败', error);
    }
  }

  private async disconnectDevice(): Promise<void> {
    try {
      await this.serialPortManager.disconnect();
      this.mainWindow?.webContents.send('device-disconnected');
    } catch (error) {
      this.logService.error('断开设备失败', error);
    }
  }

  private async emergencyStop(): Promise<void> {
    try {
      // 立即停止所有电机
      await this.odriveProtocol.emergencyStop();
      this.flowRunner.stop();
      this.mainWindow?.webContents.send('emergency-stop');
      this.logService.warn('紧急停止已触发');
    } catch (error) {
      // 即使紧急停止失败，也要确保流程停止和事件发送
      this.flowRunner.stop();
      this.mainWindow?.webContents.send('emergency-stop');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('设备未连接')) {
        this.logService.warn('紧急停止: 设备未连接，仅停止本地流程');
      } else {
        this.logService.error('紧急停止失败', error);
      }
    }
  }

  private cleanup(): void {
    this.serialPortManager.disconnect();
    this.odriveProtocol.stopTelemetry();
    this.flowRunner.stop();
  }

  public async initialize(): Promise<void> {
    await app.whenReady();

    this.createWindow();
    this.setupMenu();
    this.setupWindowShortcuts();
    this.setupIPC();

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }
}

// 创建应用实例并初始化
const odriveApp = new ODriveApp();
odriveApp.initialize().catch((error) => {
  console.error('应用初始化失败', error);
  app.quit();
});
