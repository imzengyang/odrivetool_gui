"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialPortManager = void 0;
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
const events_1 = require("events");
class SerialPortManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.port = null;
        this.parser = null;
        this.connectedDevice = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }
    /**
     * 扫描可用的串口设备
     */
    async scanDevices() {
        try {
            const ports = await serialport_1.SerialPort.list();
            const odriveDevices = [];
            for (const portInfo of ports) {
                // 检查是否为 ODrive 设备（基于 VID/PID 或描述）
                if (this.isODriveDevice(portInfo)) {
                    const device = {
                        id: portInfo.path,
                        port: portInfo.path,
                        firmwareVersion: 'Unknown',
                        connected: false,
                        serialNumber: portInfo.serialNumber,
                        name: `ODrive (${portInfo.path})`,
                    };
                    odriveDevices.push(device);
                }
            }
            return odriveDevices;
        }
        catch (error) {
            console.error('扫描串口设备失败:', error);
            throw error;
        }
    }
    /**
     * 连接到指定端口
     */
    async connect(portPath) {
        try {
            if (this.port && this.port.isOpen) {
                await this.disconnect();
            }
            // 创建串口连接
            this.port = new serialport_1.SerialPort({
                path: portPath,
                baudRate: 115200,
                dataBits: 8,
                parity: 'none',
                stopBits: 1,
                autoOpen: false,
            });
            // 创建解析器
            this.parser = this.port.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\n' }));
            // 设置事件监听
            this.setupEventListeners();
            // 打开连接
            await new Promise((resolve, reject) => {
                this.port.open((error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
            // 获取设备信息
            const deviceInfo = await this.getDeviceInfo();
            this.connectedDevice = {
                id: portPath,
                port: portPath,
                firmwareVersion: deviceInfo.firmwareVersion,
                connected: true,
                serialNumber: deviceInfo.serialNumber,
                name: `ODrive (${portPath})`,
            };
            this.reconnectAttempts = 0;
            this.emit('connected', this.connectedDevice);
            return this.connectedDevice;
        }
        catch (error) {
            console.error('连接设备失败:', error);
            this.emit('error', { type: 'connection-error', error });
            throw error;
        }
    }
    /**
     * 断开连接
     */
    async disconnect() {
        try {
            if (this.port && this.port.isOpen) {
                this.port.close();
            }
            this.port = null;
            this.parser = null;
            if (this.connectedDevice) {
                this.connectedDevice.connected = false;
                const device = this.connectedDevice;
                this.connectedDevice = null;
                this.emit('disconnected', device);
            }
        }
        catch (error) {
            console.error('断开连接失败:', error);
            throw error;
        }
    }
    /**
     * 发送数据
     */
    async write(data) {
        if (!this.port || !this.port.isOpen) {
            throw new Error('设备未连接');
        }
        return new Promise((resolve, reject) => {
            this.port.write(data, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * 检查是否已连接
     */
    isConnected() {
        return this.port?.isOpen || false;
    }
    /**
     * 获取当前连接的设备
     */
    getConnectedDevice() {
        return this.connectedDevice;
    }
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        if (!this.port || !this.parser)
            return;
        // 数据接收
        this.parser.on('data', (data) => {
            try {
                const trimmedData = data.trim();
                if (trimmedData) {
                    this.emit('data', trimmedData);
                }
            }
            catch (error) {
                console.error('解析数据失败:', error);
            }
        });
        // 连接错误
        this.port.on('error', (error) => {
            console.error('串口错误:', error);
            this.emit('error', { type: 'port-error', error });
            // 尝试重连
            this.attemptReconnect();
        });
        // 连接关闭
        this.port.on('close', () => {
            console.log('串口连接已关闭');
            this.emit('disconnected', this.connectedDevice);
            // 尝试重连
            this.attemptReconnect();
        });
    }
    /**
     * 尝试重连
     */
    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('达到最大重连次数，停止重连');
            return;
        }
        this.reconnectAttempts++;
        console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(async () => {
            try {
                if (this.connectedDevice) {
                    await this.connect(this.connectedDevice.port);
                }
            }
            catch (error) {
                console.error('重连失败:', error);
                this.attemptReconnect();
            }
        }, this.reconnectDelay);
    }
    /**
     * 检查是否为 ODrive 设备
     */
    isODriveDevice(portInfo) {
        // 检查常见的 ODrive 设备标识
        const odriveIdentifiers = [
            'ODrive',
            'USB Serial',
            'CP210',
            'FTDI',
            'CH340',
        ];
        const manufacturer = portInfo.manufacturer?.toLowerCase() || '';
        const productId = portInfo.productId?.toLowerCase() || '';
        const vendorId = portInfo.vendorId?.toLowerCase() || '';
        return (odriveIdentifiers.some(id => manufacturer.includes(id.toLowerCase()) ||
            productId.includes(id.toLowerCase()) ||
            vendorId.includes(id.toLowerCase())) ||
            // 常见的 ODrive VID/PID 组合
            (vendorId === '1209' && productId === '0d32') || // ODrive v3.x
            (vendorId === '1209' && productId === '0d33') // ODrive v3.x variant
        );
    }
    /**
     * 获取设备信息
     */
    async getDeviceInfo() {
        try {
            // 发送获取固件版本的命令
            await this.write('odrv0.fw_version\n');
            // 等待响应
            const firmwareVersion = await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    resolve('Unknown');
                }, 2000);
                const onData = (data) => {
                    if (data.includes('fw_version') || data.includes('v0.5.1')) {
                        clearTimeout(timeout);
                        this.off('data', onData);
                        resolve(data.trim());
                    }
                };
                this.on('data', onData);
            });
            return {
                firmwareVersion: firmwareVersion.includes('v0.5.1') ? 'v0.5.1' : firmwareVersion,
                serialNumber: this.connectedDevice?.serialNumber || 'Unknown',
            };
        }
        catch (error) {
            console.error('获取设备信息失败:', error);
            return {
                firmwareVersion: 'Unknown',
                serialNumber: 'Unknown',
            };
        }
    }
    /**
     * 清理资源
     */
    cleanup() {
        this.disconnect();
        this.removeAllListeners();
    }
}
exports.SerialPortManager = SerialPortManager;
