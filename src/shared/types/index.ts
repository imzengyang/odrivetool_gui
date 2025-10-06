// ODrive 设备相关类型
export interface ODriveDevice {
  id: string;
  port: string;
  firmwareVersion: string;
  connected: boolean;
  serialNumber?: string;
  name?: string;
}

// 电机配置类型
export interface MotorConfig {
  polePairs: number;
  kv: number;
  resistance: number;
  inductance: number;
  currentLimit: number;
  velocityLimit: number;
  accelerationLimit: number;
}

// 编码器配置类型
export interface EncoderConfig {
  mode: 'incremental' | 'absolute';
  cpr: number;
  bandwidth: number;
  calib_scan_distance: number;
  idx_search: boolean;
}

// 控制模式枚举
export enum ControlMode {
  POSITION = 'position',
  VELOCITY = 'velocity',
  CURRENT = 'current',
  VOLTAGE = 'voltage',
  IDLE = 'idle'
}

// 电机状态枚举
export enum MotorState {
  IDLE = 'idle',
  STARTUP_CALIBRATION = 'startup_calibration',
  FULL_CALIBRATION_SEQUENCE = 'full_calibration_sequence',
  MOTOR_CALIBRATION = 'motor_calibration',
  SENSORLESS_CONTROL = 'sensorless_control',
  ENCODER_INDEX_SEARCH = 'encoder_index_search',
  ENCODER_OFFSET_CALIBRATION = 'encoder_offset_calibration',
  CLOSED_LOOP_CONTROL = 'closed_loop_control',
  LOCKIN_SPIN = 'lockin_spin',
  ESCAPING = 'escaping'
}

// 实时数据类型
export interface TelemetryData {
  timestamp: number;
  busVoltage: number;
  busCurrent: number;
  iq: number;
  vq: number;
  velocity: number;
  position: number;
  temperature: number;
  axisState: MotorState;
  controlMode: ControlMode;
}

// 流程节点类型
export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

// 流程连接类型
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// 流程定义类型
export interface FlowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: number;
  updatedAt: number;
}

// IPC 通信消息类型
export interface IPCMessage {
  type: string;
  payload?: any;
  requestId?: string;
}

// 串口事件类型
export interface SerialPortEvent {
  type: 'connected' | 'disconnected' | 'data' | 'error';
  port: string;
  data?: any;
  error?: string;
}

// 安全限制类型
export interface SafetyLimits {
  maxBusVoltage: number;
  maxPhaseCurrent: number;
  maxVelocity: number;
  maxAcceleration: number;
  maxTemperature: number;
}

// 配置模板类型
export interface ConfigTemplate {
  id: string;
  name: string;
  description?: string;
  motor: MotorConfig;
  encoder: EncoderConfig;
  safety: SafetyLimits;
  isDefault: boolean;
}

// 导出数据类型
export interface ExportData {
  format: 'csv' | 'json';
  data: TelemetryData[];
  metadata: {
    firmwareVersion: string;
    deviceSerial?: string;
    templateName?: string;
    exportTime: number;
  };
}

// 错误类型
export interface ODriveError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// 日志类型
export interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: any;
}
