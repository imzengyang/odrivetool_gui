import { ParsedCommand } from './commands';
/**
 * 流程设计器相关类型定义
 */
export interface FlowNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: FlowNodeData;
}
export interface FlowNodeData {
    label: string;
    description?: string;
    commandKey?: string;
    commandParams?: Record<string, any>;
    inputs?: FlowNodePort[];
    outputs?: FlowNodePort[];
    config?: Record<string, any>;
}
export interface FlowNodePort {
    id: string;
    name: string;
    type: 'input' | 'output';
    dataType: 'command' | 'data' | 'control' | 'error';
}
export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    data?: any;
}
export interface FlowDefinition {
    id: string;
    name: string;
    description?: string;
    version: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    metadata: {
        createdAt: string;
        updatedAt: string;
        author?: string;
        tags?: string[];
    };
}
export interface DynamicNodeType {
    type: string;
    category: string;
    name: string;
    description: string;
    command: ParsedCommand;
    icon?: string;
    color?: string;
    inputs: FlowNodePort[];
    outputs: FlowNodePort[];
    defaultConfig?: Record<string, any>;
}
export interface FlowExecutionState {
    status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
    currentNodeId?: string;
    executionLog: FlowExecutionLogEntry[];
    variables: Record<string, any>;
    startTime?: number;
    endTime?: number;
}
export interface FlowExecutionLogEntry {
    timestamp: number;
    nodeId: string;
    nodeName: string;
    type: 'start' | 'success' | 'error' | 'warning' | 'info';
    message: string;
    data?: any;
}
export interface NodeExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
}
