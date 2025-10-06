import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { 
  CommandConfig, 
  CommandDefinition, 
  ParsedCommand, 
  CommandCategory, 
  ValidationResult,
  CommandParameter 
} from '../../shared/types/commands';

/**
 * 命令加载器 - 解析JSON配置文件并生成可执行的命令对象
 */
export class CommandLoader extends EventEmitter {
  private commands: Map<string, ParsedCommand> = new Map();
  private categories: Map<string, CommandCategory> = new Map();
  private config: CommandConfig | null = null;

  constructor() {
    super();
  }

  /**
   * 从JSON文件加载命令配置
   */
  async loadFromFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.resolve(filePath);
      const fileContent = fs.readFileSync(absolutePath, 'utf8');
      const config: CommandConfig = JSON.parse(fileContent);
      
      await this.loadFromConfig(config);
      this.emit('loaded', { filePath, commandCount: this.commands.size });
    } catch (error) {
      this.emit('error', error);
      throw new Error(`加载命令配置失败: ${error}`);
    }
  }

  /**
   * 从配置对象加载命令
   */
  async loadFromConfig(config: CommandConfig): Promise<void> {
    this.config = config;
    this.commands.clear();
    this.categories.clear();

    // 解析每个命令定义
    for (const cmdDef of config.commands) {
      const parsedCommand = this.parseCommand(cmdDef);
      this.commands.set(parsedCommand.key, parsedCommand);

      // 按类别组织命令
      if (!this.categories.has(cmdDef.category)) {
        this.categories.set(cmdDef.category, {
          name: cmdDef.category,
          commands: []
        });
      }
      
      const category = this.categories.get(cmdDef.category)!;
      category.commands.push(parsedCommand);
    }

    this.emit('commands-loaded', {
      commandCount: this.commands.size,
      categoryCount: this.categories.size
    });
  }

  /**
   * 解析单个命令定义
   */
  private parseCommand(def: CommandDefinition): ParsedCommand {
    return {
      key: def.key,
      name: def.name,
      description: def.description,
      category: def.category,
      template: def.template,
      parameters: def.params,
      
      // 执行函数 - 根据模板和参数生成最终命令
      execute: (params: Record<string, any>): string => {
        return this.interpolateTemplate(def.template, params);
      },

      // 验证函数 - 验证参数的有效性
      validate: (params: Record<string, any>): ValidationResult => {
        return this.validateParameters(def.params, params);
      }
    };
  }

  /**
   * 模板插值 - 将参数值替换到模板中
   */
  private interpolateTemplate(template: string, params: Record<string, any>): string {
    let result = template;
    
    // 替换简单占位符 {param}
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    }

    // 替换条件占位符 {axis} -> axis0 或 axis1
    if (params.axis !== undefined) {
      const axisRegex = /\{axis\}/g;
      result = result.replace(axisRegex, `axis${params.axis}`);
    }
    
    // 替换条件占位符 axis{axis} -> axis0 或 axis1
    if (params.axis !== undefined) {
      const conditionalAxisRegex = /axis\{axis\}/g;
      result = result.replace(conditionalAxisRegex, `axis${params.axis}`);
    }

    return result;
  }

  /**
   * 验证参数
   */
  private validateParameters(
    paramDefs: CommandParameter[], 
    params: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const paramDef of paramDefs) {
      const value = params[paramDef.name];
      
      // 检查必需参数
      if (paramDef.required && (value === undefined || value === null || value === '')) {
        errors.push(`参数 '${paramDef.name}' 是必需的`);
        continue;
      }

      // 如果参数不存在且不是必需的，跳过验证
      if (value === undefined) {
        continue;
      }

      // 检查选项值
      if (paramDef.options && paramDef.options.length > 0) {
        const validValues = paramDef.options.map(opt => opt.value);
        if (!validValues.includes(String(value))) {
          errors.push(
            `参数 '${paramDef.name}' 的值 '${value}' 无效，有效值: ${validValues.join(', ')}`
          );
        }
      }

      // 数值范围检查（如果有默认值，可以作为参考）
      if (paramDef.default !== undefined && typeof paramDef.default === 'number') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          // 这里可以添加更复杂的范围验证逻辑
          if (numValue < 0 && paramDef.name.includes('current')) {
            warnings.push(`参数 '${paramDef.name}' 为负值，请确认是否正确`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取所有命令（可序列化版本）
   */
  getAllCommands(): any[] {
    return Array.from(this.commands.values()).map(cmd => ({
      key: cmd.key,
      name: cmd.name,
      description: cmd.description,
      category: cmd.category,
      template: cmd.template,
      parameters: cmd.parameters
    }));
  }

  /**
   * 根据key获取命令
   */
  getCommand(key: string): ParsedCommand | undefined {
    return this.commands.get(key);
  }

  /**
   * 获取所有类别（可序列化版本）
   */
  getCategories(): any[] {
    return Array.from(this.categories.values()).map(cat => ({
      name: cat.name,
      commands: cat.commands.map(cmd => ({
        key: cmd.key,
        name: cmd.name,
        description: cmd.description,
        category: cmd.category,
        template: cmd.template,
        parameters: cmd.parameters
      }))
    }));
  }

  /**
   * 根据类别获取命令（可序列化版本）
   */
  getCommandsByCategory(category: string): any[] {
    const cat = this.categories.get(category);
    if (!cat) return [];
    
    return cat.commands.map(cmd => ({
      key: cmd.key,
      name: cmd.name,
      description: cmd.description,
      category: cmd.category,
      template: cmd.template,
      parameters: cmd.parameters
    }));
  }

  /**
   * 搜索命令（可序列化版本）
   */
  searchCommands(query: string): any[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllCommands().filter(cmd => 
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery) ||
      cmd.key.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 获取配置信息
   */
  getConfig(): CommandConfig | null {
    return this.config;
  }

  /**
   * 验证命令参数
   */
  validateCommand(commandKey: string, params: Record<string, any>): ValidationResult {
    const command = this.getCommand(commandKey);
    if (!command) {
      return {
        valid: false,
        errors: [`命令 '${commandKey}' 不存在`],
        warnings: []
      };
    }

    return command.validate(params);
  }

  /**
   * 执行命令（生成命令字符串）
   */
  executeCommand(commandKey: string, params: Record<string, any>): string {
    const command = this.getCommand(commandKey);
    if (!command) {
      throw new Error(`命令 '${commandKey}' 不存在`);
    }

    // 先验证参数
    const validation = command.validate(params);
    if (!validation.valid) {
      throw new Error(`参数验证失败: ${validation.errors.join(', ')}`);
    }

    return command.execute(params);
  }

  /**
   * 获取命令的默认参数
   */
  getCommandDefaults(commandKey: string): Record<string, any> {
    const command = this.getCommand(commandKey);
    if (!command) {
      return {};
    }

    const defaults: Record<string, any> = {};
    for (const param of command.parameters) {
      if (param.default !== undefined) {
        defaults[param.name] = param.default;
      }
    }

    return defaults;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.commands.clear();
    this.categories.clear();
    this.config = null;
    this.removeAllListeners();
  }
}

// 单例实例
export const commandLoader = new CommandLoader();
