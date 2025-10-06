import { EventEmitter } from 'events';
import type { ODriveDevice } from '../../shared/types';
export declare class SerialPortManager extends EventEmitter {
    private port;
    private parser;
    private connectedDevice;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    constructor();
    /**
     * 扫描可用的串口设备
     */
    scanDevices(): Promise<ODriveDevice[]>;
    /**
     * 连接到指定端口
     */
    connect(portPath: string): Promise<ODriveDevice>;
    /**
     * 断开连接
     */
    disconnect(): Promise<void>;
    /**
     * 发送数据
     */
    write(data: string | Buffer): Promise<void>;
    /**
     * 检查是否已连接
     */
    isConnected(): boolean;
    /**
     * 获取当前连接的设备
     */
    getConnectedDevice(): ODriveDevice | null;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 尝试重连
     */
    private attemptReconnect;
    /**
     * 检查是否为 ODrive 设备
     */
    private isODriveDevice;
    /**
     * 获取设备信息
     */
    private getDeviceInfo;
    /**
     * 清理资源
     */
    cleanup(): void;
}
