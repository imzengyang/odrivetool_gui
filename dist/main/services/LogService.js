"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = require("path");
class LogService extends events_1.EventEmitter {
    constructor() {
        super();
        this.logs = [];
        this.maxLogEntries = 10000;
        this.isWriting = false;
        this.logFilePath = (0, path_1.join)(process.cwd(), 'logs', 'odrive.log');
        this.ensureLogDirectory();
        this.loadExistingLogs();
    }
    /**
     * 记录信息日志
     */
    info(message, context) {
        this.addLog('info', message, context);
    }
    /**
     * 记录警告日志
     */
    warn(message, context) {
        this.addLog('warn', message, context);
    }
    /**
     * 记录错误日志
     */
    error(message, context) {
        this.addLog('error', message, context);
    }
    /**
     * 记录调试日志
     */
    debug(message, context) {
        this.addLog('debug', message, context);
    }
    /**
     * 添加日志条目
     */
    addLog(level, message, context) {
        const logEntry = {
            timestamp: Date.now(),
            level,
            message,
            context,
        };
        this.logs.push(logEntry);
        // 限制日志条目数量
        if (this.logs.length > this.maxLogEntries) {
            this.logs = this.logs.slice(-this.maxLogEntries);
        }
        // 发出日志事件
        this.emit('log-added', logEntry);
        // 异步写入文件
        this.writeToFile(logEntry);
        // 控制台输出
        this.logToConsole(logEntry);
    }
    /**
     * 获取所有日志
     */
    getLogs() {
        return [...this.logs];
    }
    /**
     * 根据级别过滤日志
     */
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }
    /**
     * 根据时间范围过滤日志
     */
    getLogsByTimeRange(startTime, endTime) {
        return this.logs.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
    }
    /**
     * 搜索日志
     */
    searchLogs(query) {
        const lowerQuery = query.toLowerCase();
        return this.logs.filter(log => log.message.toLowerCase().includes(lowerQuery) ||
            (log.context && JSON.stringify(log.context).toLowerCase().includes(lowerQuery)));
    }
    /**
     * 清除所有日志
     */
    clearLogs() {
        this.logs = [];
        this.emit('logs-cleared');
        // 清空文件
        try {
            (0, fs_1.writeFileSync)(this.logFilePath, '', 'utf8');
        }
        catch (error) {
            console.error('清空日志文件失败:', error);
        }
    }
    /**
     * 导出日志
     */
    exportLogs(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.logs, null, 2);
        }
        else {
            // CSV 格式
            const headers = 'Timestamp,Level,Message,Context\n';
            const rows = this.logs.map(log => {
                const timestamp = new Date(log.timestamp).toISOString();
                const message = `"${log.message.replace(/"/g, '""')}"`;
                const context = log.context ? `"${JSON.stringify(log.context).replace(/"/g, '""')}"` : '';
                return `${timestamp},${log.level},${message},${context}`;
            }).join('\n');
            return headers + rows;
        }
    }
    /**
     * 确保日志目录存在
     */
    ensureLogDirectory() {
        const logDir = (0, path_1.join)(process.cwd(), 'logs');
        try {
            if (!(0, fs_1.existsSync)(logDir)) {
                require('fs').mkdirSync(logDir, { recursive: true });
            }
        }
        catch (error) {
            console.error('创建日志目录失败:', error);
        }
    }
    /**
     * 加载现有日志
     */
    loadExistingLogs() {
        try {
            if ((0, fs_1.existsSync)(this.logFilePath)) {
                let content;
                try {
                    // 尝试用 UTF-8 编码读取
                    content = (0, fs_1.readFileSync)(this.logFilePath, 'utf8');
                }
                catch (utf8Error) {
                    try {
                        // 如果 UTF-8 失败，尝试用其他编码
                        const buffer = (0, fs_1.readFileSync)(this.logFilePath);
                        content = buffer.toString('utf8', 0, buffer.length);
                    }
                    catch (otherError) {
                        console.warn('无法读取日志文件，将创建新文件:', otherError);
                        return;
                    }
                }
                // 检查内容是否为空或包含无效字符
                if (!content || content.trim().length === 0) {
                    console.info('日志文件为空，跳过加载');
                    return;
                }
                // 检查是否包含明显的编码错误
                if (content.includes('锟斤拷') || content.includes('')) {
                    console.warn('日志文件包含编码错误，将跳过现有日志');
                    return;
                }
                const lines = content.trim().split('\n').filter(line => line.trim());
                for (const line of lines) {
                    try {
                        // 跳过空行和明显无效的行
                        if (!line || line.length < 10)
                            continue;
                        // 检查是否为有效的 JSON 格式
                        if (!line.startsWith('{') || !line.endsWith('}')) {
                            continue;
                        }
                        const logEntry = JSON.parse(line);
                        if (this.isValidLogEntry(logEntry)) {
                            this.logs.push(logEntry);
                        }
                    }
                    catch (parseError) {
                        // 静默处理解析错误，避免启动时的错误日志
                        // console.debug('解析日志条目失败，跳过该行:', parseError.message);
                    }
                }
                // 限制加载的日志数量
                if (this.logs.length > this.maxLogEntries) {
                    this.logs = this.logs.slice(-this.maxLogEntries);
                }
                console.info(`成功加载 ${this.logs.length} 条历史日志`);
            }
        }
        catch (error) {
            console.warn('加载现有日志时发生错误，将创建新的日志文件:', error instanceof Error ? error.message : error);
        }
    }
    /**
     * 验证日志条目格式
     */
    isValidLogEntry(entry) {
        return (typeof entry === 'object' &&
            typeof entry.timestamp === 'number' &&
            typeof entry.level === 'string' &&
            typeof entry.message === 'string' &&
            ['info', 'warn', 'error', 'debug'].includes(entry.level));
    }
    /**
     * 写入文件
     */
    writeToFile(logEntry) {
        if (this.isWriting)
            return;
        this.isWriting = true;
        // 使用 setImmediate 避免阻塞
        setImmediate(() => {
            try {
                const logLine = JSON.stringify(logEntry) + '\n';
                require('fs').appendFileSync(this.logFilePath, logLine, 'utf8');
            }
            catch (error) {
                console.error('写入日志文件失败:', error);
            }
            finally {
                this.isWriting = false;
            }
        });
    }
    /**
     * 控制台输出
     */
    logToConsole(logEntry) {
        const timestamp = new Date(logEntry.timestamp).toISOString();
        const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}]`;
        switch (logEntry.level) {
            case 'error':
                console.error(prefix, logEntry.message, logEntry.context || '');
                break;
            case 'warn':
                console.warn(prefix, logEntry.message, logEntry.context || '');
                break;
            case 'debug':
                console.debug(prefix, logEntry.message, logEntry.context || '');
                break;
            default:
                console.log(prefix, logEntry.message, logEntry.context || '');
        }
    }
    /**
     * 获取日志统计信息
     */
    getLogStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {
                info: 0,
                warn: 0,
                error: 0,
                debug: 0,
            },
        };
        if (this.logs.length === 0) {
            return stats;
        }
        for (const log of this.logs) {
            stats.byLevel[log.level]++;
        }
        return {
            ...stats,
            oldestTimestamp: this.logs[0].timestamp,
            newestTimestamp: this.logs[this.logs.length - 1].timestamp,
        };
    }
    /**
     * 清理资源
     */
    cleanup() {
        this.removeAllListeners();
    }
}
exports.LogService = LogService;
