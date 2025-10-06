import { EventEmitter } from 'events';
import { SerialPortManager } from './SerialPortManager';
export declare class ODriveProtocol extends EventEmitter {
    private serialManager;
    private telemetryInterval;
    private telemetryKeys;
    private telemetryRate;
    private requestQueue;
    private requestIdCounter;
    constructor(serialManager?: SerialPortManager);
    /**
     * 设置串口管理器
     */
    setSerialManager(serialManager: SerialPortManager): void;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 读取 ODrive 属性
     */
    read(path: string): Promise<any>;
    /**
     * 写入 ODrive 属性
     */
    write(path: string, value: any): Promise<void>;
    /**
     * 请求状态切换
     */
    requestState(state: string): Promise<void>;
    /**
     * 紧急停止
     */
    emergencyStop(): Promise<void>;
    /**
     * 开始遥测数据流
     */
    startTelemetry(keys: string[], rateHz: number): Promise<void>;
    /**
     * 停止遥测数据流
     */
    stopTelemetry(): void;
    /**
     * 电机校准
     */
    calibrateMotor(): Promise<void>;
    /**
     * 编码器校准
     */
    calibrateEncoder(): Promise<void>;
    /**
     * 发送命令并等待响应
     */
    private sendCommand;
    /**
     * 处理响应数据
     */
    private handleResponse;
    /**
     * 解析响应数据
     */
    private parseResponse;
    /**
     * 检查是否为遥测数据
     */
    private isTelemetryData;
    /**
     * 解析遥测数据
     */
    private parseTelemetryData;
    /**
     * 请求遥测数据
     */
    private requestTelemetryData;
    /**
     * 等待状态变化
     */
    private waitForState;
    /**
     * 解析电机状态
     */
    private parseMotorState;
    /**
     * 解析控制模式
     */
    private parseControlMode;
    /**
     * 清理资源
     */
    cleanup(): void;
}
