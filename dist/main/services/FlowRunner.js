"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowRunner = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const path_1 = require("path");
class FlowRunner extends events_1.EventEmitter {
    constructor() {
        super();
        this.workerProcess = null;
        this.currentFlow = null;
        this.executionState = {
            isRunning: false,
            isPaused: false,
            currentNodeId: null,
            startTime: null,
            elapsedTime: 0,
            logs: [],
        };
    }
    /**
     * 开始执行流程
     */
    async start(flowDefinition) {
        if (this.executionState.isRunning) {
            throw new Error('流程已在运行中');
        }
        try {
            this.currentFlow = flowDefinition;
            this.executionState = {
                isRunning: true,
                isPaused: false,
                currentNodeId: null,
                startTime: Date.now(),
                elapsedTime: 0,
                logs: [],
            };
            // 创建工作进程
            this.workerProcess = (0, child_process_1.fork)((0, path_1.join)(__dirname, 'FlowWorker.js'), [], {
                silent: true,
            });
            // 设置工作进程通信
            this.setupWorkerCommunication();
            // 发送流程定义给工作进程
            this.workerProcess.send({
                type: 'start',
                payload: flowDefinition,
            });
            this.emit('flow-started', flowDefinition);
        }
        catch (error) {
            this.executionState.isRunning = false;
            this.emit('flow-error', error);
            throw error;
        }
    }
    /**
     * 暂停流程执行
     */
    async pause() {
        if (!this.executionState.isRunning || this.executionState.isPaused) {
            return;
        }
        try {
            this.workerProcess.send({ type: 'pause' });
            this.executionState.isPaused = true;
            this.emit('flow-paused');
        }
        catch (error) {
            this.emit('flow-error', error);
            throw error;
        }
    }
    /**
     * 恢复流程执行
     */
    async resume() {
        if (!this.executionState.isRunning || !this.executionState.isPaused) {
            return;
        }
        try {
            this.workerProcess.send({ type: 'resume' });
            this.executionState.isPaused = false;
            this.emit('flow-resumed');
        }
        catch (error) {
            this.emit('flow-error', error);
            throw error;
        }
    }
    /**
     * 停止流程执行
     */
    async stop() {
        if (!this.executionState.isRunning) {
            return;
        }
        try {
            if (this.workerProcess) {
                this.workerProcess.send({ type: 'stop' });
                // 等待进程结束，最多等待5秒
                const timeout = setTimeout(() => {
                    if (this.workerProcess) {
                        this.workerProcess.kill('SIGKILL');
                    }
                }, 5000);
                this.workerProcess.on('exit', () => {
                    clearTimeout(timeout);
                });
            }
            this.executionState.isRunning = false;
            this.executionState.isPaused = false;
            this.emit('flow-stopped');
        }
        catch (error) {
            this.emit('flow-error', error);
            throw error;
        }
    }
    /**
     * 获取执行状态
     */
    getExecutionState() {
        return { ...this.executionState };
    }
    /**
     * 获取当前流程
     */
    getCurrentFlow() {
        return this.currentFlow;
    }
    /**
     * 设置工作进程通信
     */
    setupWorkerCommunication() {
        if (!this.workerProcess)
            return;
        // 监听工作进程消息
        this.workerProcess.on('message', (message) => {
            this.handleWorkerMessage(message);
        });
        // 监听工作进程错误
        this.workerProcess.on('error', (error) => {
            this.emit('flow-error', error);
            this.cleanup();
        });
        // 监听工作进程退出
        this.workerProcess.on('exit', (code, signal) => {
            if (code !== 0) {
                this.emit('flow-error', new Error(`工作进程异常退出: code ${code}, signal ${signal}`));
            }
            this.cleanup();
        });
        // 监听工作进程输出
        this.workerProcess.stdout?.on('data', (data) => {
            console.log('FlowWorker stdout:', data.toString());
        });
        this.workerProcess.stderr?.on('data', (data) => {
            console.error('FlowWorker stderr:', data.toString());
        });
    }
    /**
     * 处理工作进程消息
     */
    handleWorkerMessage(message) {
        switch (message.type) {
            case 'node-start':
                this.executionState.currentNodeId = message.payload.nodeId;
                this.emit('node-started', message.payload);
                break;
            case 'node-complete':
                this.emit('node-completed', message.payload);
                this.addLog(message.payload.nodeId, '节点执行完成', 'info');
                break;
            case 'node-error':
                this.emit('node-error', message.payload);
                this.addLog(message.payload.nodeId, `节点执行失败: ${message.payload.error}`, 'error');
                break;
            case 'flow-complete':
                this.executionState.isRunning = false;
                this.executionState.elapsedTime = Date.now() - (this.executionState.startTime || 0);
                this.emit('flow-completed', message.payload);
                this.cleanup();
                break;
            case 'flow-error':
                this.executionState.isRunning = false;
                this.emit('flow-error', new Error(message.payload.error));
                this.cleanup();
                break;
            case 'log':
                this.addLog(message.payload.nodeId, message.payload.message, message.payload.level);
                break;
            default:
                console.warn('未知的工作进程消息类型:', message.type);
        }
    }
    /**
     * 添加日志
     */
    addLog(nodeId, message, level) {
        const logEntry = {
            timestamp: Date.now(),
            nodeId,
            message,
            level,
        };
        this.executionState.logs.push(logEntry);
        this.emit('log-added', logEntry);
    }
    /**
     * 清理资源
     */
    cleanup() {
        if (this.workerProcess) {
            this.workerProcess.removeAllListeners();
            if (!this.workerProcess.killed) {
                this.workerProcess.kill();
            }
            this.workerProcess = null;
        }
        this.executionState.isRunning = false;
        this.executionState.isPaused = false;
    }
    /**
     * 验证流程定义
     */
    validateFlow(flowDefinition) {
        // 检查是否有节点
        if (!flowDefinition.nodes || flowDefinition.nodes.length === 0) {
            return false;
        }
        // 检查是否有起始节点
        const startNodes = flowDefinition.nodes.filter(node => node.type === 'start');
        if (startNodes.length === 0) {
            return false;
        }
        // 检查连接的有效性
        for (const edge of flowDefinition.edges) {
            const sourceNode = flowDefinition.nodes.find(n => n.id === edge.source);
            const targetNode = flowDefinition.nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) {
                return false;
            }
        }
        return true;
    }
    /**
     * 获取节点的下一个节点
     */
    getNextNodes(nodeId) {
        if (!this.currentFlow)
            return [];
        return this.currentFlow.edges
            .filter(edge => edge.source === nodeId)
            .map(edge => edge.target);
    }
    /**
     * 检查节点是否可以执行
     */
    canExecuteNode(nodeId) {
        if (!this.currentFlow)
            return false;
        const node = this.currentFlow.nodes.find(n => n.id === nodeId);
        if (!node)
            return false;
        // 检查所有前置节点是否已完成
        const incomingEdges = this.currentFlow.edges.filter(edge => edge.target === nodeId);
        for (const edge of incomingEdges) {
            // 这里需要检查前置节点的执行状态
            // 在实际实现中，需要维护节点执行状态
        }
        return true;
    }
}
exports.FlowRunner = FlowRunner;
