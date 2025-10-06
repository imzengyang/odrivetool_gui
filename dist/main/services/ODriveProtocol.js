"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODriveProtocol = void 0;
const events_1 = require("events");
const SerialPortManager_1 = require("./SerialPortManager");
const types_1 = require("../../shared/types");
class ODriveProtocol extends events_1.EventEmitter {
    constructor(serialManager) {
        super();
        this.telemetryInterval = null;
        this.telemetryKeys = [];
        this.telemetryRate = 50; // Hz
        this.requestQueue = new Map();
        this.requestIdCounter = 0;
        this.serialManager = serialManager || new SerialPortManager_1.SerialPortManager();
        this.setupEventListeners();
    }
    /**
     * 设置串口管理器
     */
    setSerialManager(serialManager) {
        this.serialManager = serialManager;
        this.setupEventListeners();
    }
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.serialManager.on('data', (data) => {
            this.handleResponse(data);
        });
        this.serialManager.on('error', (error) => {
            this.emit('error', error);
        });
    }
    /**
     * 读取 ODrive 属性
     */
    async read(path) {
        return this.sendCommand(`r ${path}`);
    }
    /**
     * 写入 ODrive 属性
     */
    async write(path, value) {
        const command = `w ${path} ${value}`;
        const result = await this.sendCommand(command);
        if (!result.success) {
            throw new Error(`写入失败: ${result.error}`);
        }
    }
    /**
     * 请求状态切换
     */
    async requestState(state) {
        const axisPath = 'axis0.controller.config.control_mode';
        await this.write(axisPath, state);
    }
    /**
     * 紧急停止
     */
    async emergencyStop() {
        try {
            // 检查设备连接状态
            if (!this.serialManager.isConnected()) {
                console.warn('设备未连接，跳过紧急停止命令');
                this.emit('emergency-stop');
                return;
            }
            // 设置为 IDLE 状态
            await this.requestState('idle');
            // 清除错误
            await this.write('axis0.clear_errors', '');
            this.emit('emergency-stop');
        }
        catch (error) {
            console.error('紧急停止失败:', error);
            // 即使命令失败，也要触发紧急停止事件
            this.emit('emergency-stop');
            throw error;
        }
    }
    /**
     * 开始遥测数据流
     */
    async startTelemetry(keys, rateHz) {
        try {
            this.telemetryKeys = keys;
            this.telemetryRate = Math.min(rateHz, 100); // 限制最大频率
            // 停止现有的遥测
            this.stopTelemetry();
            // 开始定期发送数据请求
            const interval = 1000 / this.telemetryRate;
            this.telemetryInterval = setInterval(async () => {
                await this.requestTelemetryData();
            }, interval);
            this.emit('telemetry-started');
        }
        catch (error) {
            console.error('启动遥测失败:', error);
            throw error;
        }
    }
    /**
     * 停止遥测数据流
     */
    stopTelemetry() {
        if (this.telemetryInterval) {
            clearInterval(this.telemetryInterval);
            this.telemetryInterval = null;
        }
        this.emit('telemetry-stopped');
    }
    /**
     * 电机校准
     */
    async calibrateMotor() {
        try {
            // 开始电机校准
            await this.write('axis0.requested_state', 'motor_calibration');
            // 等待校准完成
            await this.waitForState('idle', 30000); // 30秒超时
            this.emit('motor-calibrated');
        }
        catch (error) {
            console.error('电机校准失败:', error);
            throw error;
        }
    }
    /**
     * 编码器校准
     */
    async calibrateEncoder() {
        try {
            // 开始编码器校准
            await this.write('axis0.requested_state', 'encoder_offset_calibration');
            // 等待校准完成
            await this.waitForState('idle', 30000); // 30秒超时
            this.emit('encoder-calibrated');
        }
        catch (error) {
            console.error('编码器校准失败:', error);
            throw error;
        }
    }
    /**
     * 发送命令并等待响应
     */
    async sendCommand(command) {
        return new Promise((resolve, reject) => {
            if (!this.serialManager.isConnected()) {
                reject(new Error('设备未连接'));
                return;
            }
            const requestId = `req_${this.requestIdCounter++}`;
            const fullCommand = `${command} #${requestId}`;
            // 设置超时
            const timeout = setTimeout(() => {
                this.requestQueue.delete(requestId);
                reject(new Error('命令超时'));
            }, 5000);
            // 存储回调
            this.requestQueue.set(requestId, {
                resolve,
                reject,
                timeout,
            });
            // 发送命令
            this.serialManager.write(fullCommand + '\n').catch((error) => {
                this.requestQueue.delete(requestId);
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
    /**
     * 处理响应数据
     */
    handleResponse(data) {
        try {
            // 检查是否为命令响应
            const requestIdMatch = data.match(/#(req_\d+)/);
            if (requestIdMatch) {
                const requestId = requestIdMatch[1];
                const callback = this.requestQueue.get(requestId);
                if (callback) {
                    this.requestQueue.delete(requestId);
                    clearTimeout(callback.timeout);
                    // 解析响应数据
                    const responseData = this.parseResponse(data);
                    callback.resolve(responseData);
                }
                return;
            }
            // 检查是否为遥测数据
            if (this.isTelemetryData(data)) {
                const telemetryData = this.parseTelemetryData(data);
                if (telemetryData) {
                    this.emit('telemetry-data', telemetryData);
                }
            }
        }
        catch (error) {
            console.error('处理响应失败:', error);
        }
    }
    /**
     * 解析响应数据
     */
    parseResponse(data) {
        // 移除请求ID
        const cleanData = data.replace(/#req_\d+/, '').trim();
        // 检查错误
        if (cleanData.includes('error') || cleanData.includes('failed')) {
            return {
                success: false,
                error: cleanData,
            };
        }
        // 尝试解析数值
        const numValue = parseFloat(cleanData);
        if (!isNaN(numValue)) {
            return {
                success: true,
                data: numValue,
            };
        }
        // 尝试解析布尔值
        if (cleanData === 'True' || cleanData === 'true') {
            return {
                success: true,
                data: true,
            };
        }
        if (cleanData === 'False' || cleanData === 'false') {
            return {
                success: true,
                data: false,
            };
        }
        // 返回字符串
        return {
            success: true,
            data: cleanData,
        };
    }
    /**
     * 检查是否为遥测数据
     */
    isTelemetryData(data) {
        // 遥测数据通常包含多个数值，用逗号分隔
        return data.includes(',') && !data.includes('#');
    }
    /**
     * 解析遥测数据
     */
    parseTelemetryData(data) {
        try {
            const values = data.split(',').map(v => parseFloat(v.trim()));
            if (values.length !== this.telemetryKeys.length) {
                return null;
            }
            const telemetryData = {
                timestamp: Date.now(),
                busVoltage: 0,
                busCurrent: 0,
                iq: 0,
                vq: 0,
                velocity: 0,
                position: 0,
                temperature: 0,
                axisState: types_1.MotorState.IDLE,
                controlMode: types_1.ControlMode.IDLE,
            };
            // 根据键名映射数值
            this.telemetryKeys.forEach((key, index) => {
                const value = values[index];
                if (isNaN(value))
                    return;
                switch (key) {
                    case 'vbus_voltage':
                        telemetryData.busVoltage = value;
                        break;
                    case 'ibus':
                        telemetryData.busCurrent = value;
                        break;
                    case 'iq':
                        telemetryData.iq = value;
                        break;
                    case 'vq':
                        telemetryData.vq = value;
                        break;
                    case 'vel_estimate':
                        telemetryData.velocity = value;
                        break;
                    case 'pos_estimate':
                        telemetryData.position = value;
                        break;
                    case 'temperature':
                        telemetryData.temperature = value;
                        break;
                    case 'current_state':
                        telemetryData.axisState = this.parseMotorState(value);
                        break;
                    case 'control_mode':
                        telemetryData.controlMode = this.parseControlMode(value);
                        break;
                }
            });
            return telemetryData;
        }
        catch (error) {
            console.error('解析遥测数据失败:', error);
            return null;
        }
    }
    /**
     * 请求遥测数据
     */
    async requestTelemetryData() {
        try {
            const commands = this.telemetryKeys.map(key => `r axis0.${key}`);
            const command = commands.join(' ; ') + ' #telemetry';
            await this.serialManager.write(command + '\n');
        }
        catch (error) {
            console.error('请求遥测数据失败:', error);
        }
    }
    /**
     * 等待状态变化
     */
    async waitForState(targetState, timeoutMs) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(async () => {
                try {
                    const currentState = await this.read('axis0.current_state');
                    if (currentState === targetState) {
                        clearInterval(interval);
                        resolve();
                    }
                    else if (Date.now() - startTime > timeoutMs) {
                        clearInterval(interval);
                        reject(new Error(`等待状态超时: ${targetState}`));
                    }
                }
                catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, 100);
        });
    }
    /**
     * 解析电机状态
     */
    parseMotorState(stateValue) {
        const stateMap = {
            0: types_1.MotorState.IDLE,
            1: types_1.MotorState.STARTUP_CALIBRATION,
            2: types_1.MotorState.FULL_CALIBRATION_SEQUENCE,
            3: types_1.MotorState.MOTOR_CALIBRATION,
            4: types_1.MotorState.SENSORLESS_CONTROL,
            5: types_1.MotorState.ENCODER_INDEX_SEARCH,
            6: types_1.MotorState.ENCODER_OFFSET_CALIBRATION,
            7: types_1.MotorState.CLOSED_LOOP_CONTROL,
            8: types_1.MotorState.LOCKIN_SPIN,
            9: types_1.MotorState.ESCAPING,
        };
        return stateMap[stateValue] || types_1.MotorState.IDLE;
    }
    /**
     * 解析控制模式
     */
    parseControlMode(modeValue) {
        const modeMap = {
            0: types_1.ControlMode.VOLTAGE,
            1: types_1.ControlMode.CURRENT,
            2: types_1.ControlMode.VELOCITY,
            3: types_1.ControlMode.POSITION,
        };
        return modeMap[modeValue] || types_1.ControlMode.IDLE;
    }
    /**
     * 清理资源
     */
    cleanup() {
        this.stopTelemetry();
        // 清理请求队列
        this.requestQueue.forEach(({ timeout }) => {
            clearTimeout(timeout);
        });
        this.requestQueue.clear();
        this.removeAllListeners();
    }
}
exports.ODriveProtocol = ODriveProtocol;
