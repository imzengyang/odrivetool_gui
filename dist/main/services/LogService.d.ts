import { EventEmitter } from 'events';
import type { LogEntry } from '../../shared/types';
export declare class LogService extends EventEmitter {
    private logs;
    private maxLogEntries;
    private logFilePath;
    private isWriting;
    constructor();
    /**
     * 记录信息日志
     */
    info(message: string, context?: any): void;
    /**
     * 记录警告日志
     */
    warn(message: string, context?: any): void;
    /**
     * 记录错误日志
     */
    error(message: string, context?: any): void;
    /**
     * 记录调试日志
     */
    debug(message: string, context?: any): void;
    /**
     * 添加日志条目
     */
    private addLog;
    /**
     * 获取所有日志
     */
    getLogs(): LogEntry[];
    /**
     * 根据级别过滤日志
     */
    getLogsByLevel(level: LogEntry['level']): LogEntry[];
    /**
     * 根据时间范围过滤日志
     */
    getLogsByTimeRange(startTime: number, endTime: number): LogEntry[];
    /**
     * 搜索日志
     */
    searchLogs(query: string): LogEntry[];
    /**
     * 清除所有日志
     */
    clearLogs(): void;
    /**
     * 导出日志
     */
    exportLogs(format?: 'json' | 'csv'): string;
    /**
     * 确保日志目录存在
     */
    private ensureLogDirectory;
    /**
     * 加载现有日志
     */
    private loadExistingLogs;
    /**
     * 验证日志条目格式
     */
    private isValidLogEntry;
    /**
     * 写入文件
     */
    private writeToFile;
    /**
     * 控制台输出
     */
    private logToConsole;
    /**
     * 获取日志统计信息
     */
    getLogStats(): {
        total: number;
        byLevel: Record<LogEntry['level'], number>;
        oldestTimestamp?: number;
        newestTimestamp?: number;
    };
    /**
     * 清理资源
     */
    cleanup(): void;
}
