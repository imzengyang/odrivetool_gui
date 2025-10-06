import { EventEmitter } from 'events';
import type { FlowDefinition } from '../../shared/types';
interface FlowExecutionState {
    isRunning: boolean;
    isPaused: boolean;
    currentNodeId: string | null;
    startTime: number | null;
    elapsedTime: number;
    logs: Array<{
        timestamp: number;
        nodeId: string;
        message: string;
        level: 'info' | 'warn' | 'error';
    }>;
}
export declare class FlowRunner extends EventEmitter {
    private workerProcess;
    private executionState;
    private currentFlow;
    constructor();
    /**
     * 开始执行流程
     */
    start(flowDefinition: FlowDefinition): Promise<void>;
    /**
     * 暂停流程执行
     */
    pause(): Promise<void>;
    /**
     * 恢复流程执行
     */
    resume(): Promise<void>;
    /**
     * 停止流程执行
     */
    stop(): Promise<void>;
    /**
     * 获取执行状态
     */
    getExecutionState(): FlowExecutionState;
    /**
     * 获取当前流程
     */
    getCurrentFlow(): FlowDefinition | null;
    /**
     * 设置工作进程通信
     */
    private setupWorkerCommunication;
    /**
     * 处理工作进程消息
     */
    private handleWorkerMessage;
    /**
     * 添加日志
     */
    private addLog;
    /**
     * 清理资源
     */
    private cleanup;
    /**
     * 验证流程定义
     */
    private validateFlow;
    /**
     * 获取节点的下一个节点
     */
    private getNextNodes;
    /**
     * 检查节点是否可以执行
     */
    private canExecuteNode;
}
export {};
