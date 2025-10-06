/**
 * ODrive命令系统类型定义
 */
export interface CommandParameter {
    name: string;
    required: boolean;
    default?: any;
    placeholder?: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
}
export interface CommandDefinition {
    key: string;
    name: string;
    template: string;
    description: string;
    category: string;
    params: CommandParameter[];
}
export interface CommandConfig {
    version: string;
    gui_version: string;
    transport: string;
    newline: string;
    commands: CommandDefinition[];
}
export interface ParsedCommand {
    key: string;
    name: string;
    description: string;
    category: string;
    template: string;
    parameters: CommandParameter[];
    execute: (params: Record<string, any>) => string;
    validate: (params: Record<string, any>) => ValidationResult;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface CommandCategory {
    name: string;
    commands: ParsedCommand[];
}
export interface CommandExecutionContext {
    axis?: number;
    [key: string]: any;
}
