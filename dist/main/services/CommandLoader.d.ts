import { EventEmitter } from 'events';
import { CommandConfig, ParsedCommand, ValidationResult } from '../../shared/types/commands';
/**
 * 命令加载器 - 解析JSON配置文件并生成可执行的命令对象
 */
export declare class CommandLoader extends EventEmitter {
    private commands;
    private categories;
    private config;
    constructor();
    /**
     * 从JSON文件加载命令配置
     */
    loadFromFile(filePath: string): Promise<void>;
    /**
     * 从配置对象加载命令
     */
    loadFromConfig(config: CommandConfig): Promise<void>;
    /**
     * 解析单个命令定义
     */
    private parseCommand;
    /**
     * 模板插值 - 将参数值替换到模板中
     */
    private interpolateTemplate;
    /**
     * 验证参数
     */
    private validateParameters;
    /**
     * 获取所有命令（可序列化版本）
     */
    getAllCommands(): any[];
    /**
     * 根据key获取命令
     */
    getCommand(key: string): ParsedCommand | undefined;
    /**
     * 获取所有类别（可序列化版本）
     */
    getCategories(): any[];
    /**
     * 根据类别获取命令（可序列化版本）
     */
    getCommandsByCategory(category: string): any[];
    /**
     * 搜索命令（可序列化版本）
     */
    searchCommands(query: string): any[];
    /**
     * 获取配置信息
     */
    getConfig(): CommandConfig | null;
    /**
     * 验证命令参数
     */
    validateCommand(commandKey: string, params: Record<string, any>): ValidationResult;
    /**
     * 执行命令（生成命令字符串）
     */
    executeCommand(commandKey: string, params: Record<string, any>): string;
    /**
     * 获取命令的默认参数
     */
    getCommandDefaults(commandKey: string): Record<string, any>;
    /**
     * 清理资源
     */
    cleanup(): void;
}
export declare const commandLoader: CommandLoader;
