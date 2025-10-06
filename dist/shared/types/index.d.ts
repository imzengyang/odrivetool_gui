export interface ODriveDevice {
    id: string;
    port: string;
    firmwareVersion: string;
    connected: boolean;
    serialNumber?: string;
    name?: string;
}
export interface MotorConfig {
    polePairs: number;
    kv: number;
    resistance: number;
    inductance: number;
    currentLimit: number;
    velocityLimit: number;
    accelerationLimit: number;
}
export interface EncoderConfig {
    mode: 'incremental' | 'absolute';
    cpr: number;
    bandwidth: number;
    calib_scan_distance: number;
    idx_search: boolean;
}
export declare enum ControlMode {
    POSITION = "position",
    VELOCITY = "velocity",
    CURRENT = "current",
    VOLTAGE = "voltage",
    IDLE = "idle"
}
export declare enum MotorState {
    IDLE = "idle",
    STARTUP_CALIBRATION = "startup_calibration",
    FULL_CALIBRATION_SEQUENCE = "full_calibration_sequence",
    MOTOR_CALIBRATION = "motor_calibration",
    SENSORLESS_CONTROL = "sensorless_control",
    ENCODER_INDEX_SEARCH = "encoder_index_search",
    ENCODER_OFFSET_CALIBRATION = "encoder_offset_calibration",
    CLOSED_LOOP_CONTROL = "closed_loop_control",
    LOCKIN_SPIN = "lockin_spin",
    ESCAPING = "escaping"
}
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
export interface FlowNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: Record<string, any>;
}
export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}
export interface FlowDefinition {
    id: string;
    name: string;
    description?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    createdAt: number;
    updatedAt: number;
}
export interface IPCMessage {
    type: string;
    payload?: any;
    requestId?: string;
}
export interface SerialPortEvent {
    type: 'connected' | 'disconnected' | 'data' | 'error';
    port: string;
    data?: any;
    error?: string;
}
export interface SafetyLimits {
    maxBusVoltage: number;
    maxPhaseCurrent: number;
    maxVelocity: number;
    maxAcceleration: number;
    maxTemperature: number;
}
export interface ConfigTemplate {
    id: string;
    name: string;
    description?: string;
    motor: MotorConfig;
    encoder: EncoderConfig;
    safety: SafetyLimits;
    isDefault: boolean;
}
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
export interface ODriveError {
    code: string;
    message: string;
    details?: any;
    timestamp: number;
}
export interface LogEntry {
    timestamp: number;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    context?: any;
}
