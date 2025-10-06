import { CommandParameter, ValidationResult } from '../../shared/types/commands';

/**
 * 参数验证器 - 提供增强的参数验证功能
 */
export class ParameterValidator {
  
  /**
   * 验证单个参数
   */
  static validateParameter(
    param: CommandParameter, 
    value: any,
    context?: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查必需参数
    if (param.required && (value === undefined || value === null || value === '')) {
      errors.push(`参数 '${param.name}' 是必需的`);
      return { valid: false, errors, warnings };
    }

    // 如果参数不存在且不是必需的，跳过验证
    if (value === undefined) {
      return { valid: true, errors, warnings };
    }

    // 类型验证
    const typeValidation = this.validateParameterType(param, value);
    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);

    // 选项验证
    if (param.options && param.options.length > 0) {
      const optionValidation = this.validateParameterOptions(param, value);
      errors.push(...optionValidation.errors);
      warnings.push(...optionValidation.warnings);
    }

    // 范围验证
    const rangeValidation = this.validateParameterRange(param, value, context);
    errors.push(...rangeValidation.errors);
    warnings.push(...rangeValidation.warnings);

    // 业务逻辑验证
    const businessValidation = this.validateBusinessRules(param, value, context);
    errors.push(...businessValidation.errors);
    warnings.push(...businessValidation.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证参数类型
   */
  private static validateParameterType(
    param: CommandParameter, 
    value: any
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 根据参数名推断类型
    const expectedType = this.inferParameterType(param);

    if (expectedType === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`参数 '${param.name}' 必须是数字`);
      } else if (String(value) !== String(numValue)) {
        // 值被转换，添加警告
        warnings.push(`参数 '${param.name}' 的值 '${value}' 已转换为数字 ${numValue}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证参数选项
   */
  private static validateParameterOptions(
    param: CommandParameter, 
    value: any
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (param.options && param.options.length > 0) {
      const validValues = param.options.map(opt => opt.value);
      if (!validValues.includes(String(value))) {
        errors.push(
          `参数 '${param.name}' 的值 '${value}' 无效，有效值: ${validValues.join(', ')}`
        );
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证参数范围
   */
  private static validateParameterRange(
    param: CommandParameter, 
    value: any,
    context?: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return { valid: true, errors, warnings };
    }

    // 电流限制验证
    if (param.name.toLowerCase().includes('current')) {
      if (numValue < 0) {
        errors.push(`电流值不能为负数`);
      } else if (numValue > 100) {
        warnings.push(`电流值 ${numValue}A 较大，请确认安全性`);
      } else if (numValue > 50) {
        warnings.push(`电流值 ${numValue}A 较大，建议检查电机规格`);
      }
    }

    // 电压限制验证
    if (param.name.toLowerCase().includes('voltage')) {
      if (numValue < 0) {
        errors.push(`电压值不能为负数`);
      } else if (numValue > 60) {
        warnings.push(`电压值 ${numValue}V 较高，请确认电源规格`);
      }
    }

    // 速度限制验证
    if (param.name.toLowerCase().includes('vel') || param.name.toLowerCase().includes('speed')) {
      if (Math.abs(numValue) > 1000) {
        warnings.push(`速度值 ${numValue} 较高，请确认机械限制`);
      }
    }

    // 位置限制验证
    if (param.name.toLowerCase().includes('pos')) {
      if (Math.abs(numValue) > 100) {
        warnings.push(`位置值 ${numValue} 较大，请确认机械行程限制`);
      }
    }

    // 频率/带宽验证
    if (param.name.toLowerCase().includes('bandwidth') || param.name.toLowerCase().includes('frequency')) {
      if (numValue <= 0) {
        errors.push(`频率值必须大于0`);
      } else if (numValue > 10000) {
        warnings.push(`频率值 ${numValue}Hz 较高，可能导致系统不稳定`);
      }
    }

    // 增益参数验证
    if (param.name.toLowerCase().includes('gain')) {
      if (numValue < 0) {
        errors.push(`增益值不能为负数`);
      } else if (numValue > 1000) {
        warnings.push(`增益值 ${numValue} 较大，可能导致系统震荡`);
      }
    }

    // 超时时间验证
    if (param.name.toLowerCase().includes('timeout')) {
      if (numValue < 0) {
        errors.push(`超时时间不能为负数`);
      } else if (numValue > 300000) { // 5分钟
        warnings.push(`超时时间 ${numValue}ms 较长，可能影响响应性`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证业务规则
   */
  private static validateBusinessRules(
    param: CommandParameter, 
    value: any,
    context?: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return { valid: true, errors, warnings };
    }

    // 轴特定验证
    if (param.name === 'axis' && context) {
      if (![0, 1].includes(numValue)) {
        errors.push(`轴号必须是 0 或 1`);
      }
    }

    // 电机状态验证
    if (param.name === 'state') {
      const validStates = [1, 2, 3, 4, 5, 6, 7, 8];
      if (!validStates.includes(numValue)) {
        errors.push(`无效的状态值，有效值: ${validStates.join(', ')}`);
      }
    }

    // 控制模式验证
    if (param.name === 'mode' && param.name.toLowerCase().includes('control')) {
      const validModes = [1, 2, 3, 4];
      if (!validModes.includes(numValue)) {
        errors.push(`无效的控制模式，有效值: ${validModes.join(', ')}`);
      }
    }

    // 输入模式验证
    if (param.name === 'mode' && param.name.toLowerCase().includes('input')) {
      const validInputModes = [0, 1, 2, 3, 5, 6, 7];
      if (!validInputModes.includes(numValue)) {
        errors.push(`无效的输入模式，有效值: ${validInputModes.join(', ')}`);
      }
    }

    // 编码器CPR验证
    if (param.name === 'cpr') {
      if (numValue <= 0) {
        errors.push(`CPR值必须大于0`);
      } else if (numValue < 100) {
        warnings.push(`CPR值 ${numValue} 较低，可能影响精度`);
      } else if (numValue > 50000) {
        warnings.push(`CPR值 ${numValue} 较高，可能影响性能`);
      }
    }

    // 极对数验证
    if (param.name === 'pairs' || param.name === 'pole_pairs') {
      if (numValue <= 0) {
        errors.push(`极对数必须大于0`);
      } else if (numValue > 50) {
        warnings.push(`极对数 ${numValue} 较大，请确认电机规格`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * 推断参数类型
   */
  private static inferParameterType(param: CommandParameter): string {
    const name = param.name.toLowerCase();
    
    if (name.includes('current') || name.includes('voltage') || 
        name.includes('pos') || name.includes('vel') || 
        name.includes('torque') || name.includes('gain') ||
        name.includes('bandwidth') || name.includes('frequency') ||
        name.includes('timeout') || name.includes('rate') ||
        name.includes('limit') || name.includes('cpr') ||
        name.includes('pairs')) {
      return 'number';
    }
    
    if (name.includes('enable') || name.includes('use') || name.includes('true') || name.includes('false')) {
      return 'boolean';
    }
    
    return 'string';
  }

  /**
   * 验证参数组合
   */
  static validateParameterCombination(
    params: CommandParameter[],
    values: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证所有参数
    for (const param of params) {
      const validation = this.validateParameter(param, values[param.name], values);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    }

    // 组合验证规则
    this.validateParameterCombinations(params, values, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证参数组合规则
   */
  private static validateParameterCombinations(
    params: CommandParameter[],
    values: Record<string, any>,
    errors: string[],
    warnings: string[]
  ): void {
    // 速度与加速度比例验证
    if (values.vel_limit && values.accel_limit) {
      const ratio = Math.abs(Number(values.vel_limit)) / Math.abs(Number(values.accel_limit));
      if (ratio > 10) {
        warnings.push(`速度限制与加速度限制的比例较大 (${ratio.toFixed(1)}:1)，可能导致控制不平滑`);
      }
    }

    // 电流限制与电机类型验证
    if (values.current_lim && values.motor_type) {
      const current = Number(values.current_lim);
      const motorType = Number(values.motor_type);
      
      if (motorType === 1 && current > 5) { // 云台电机
        warnings.push(`云台电机的电流限制建议不超过5A，当前设置为${current}A`);
      }
    }

    // 编码器带宽与CPR验证
    if (values.bandwidth && values.cpr) {
      const bandwidth = Number(values.bandwidth);
      const cpr = Number(values.cpr);
      
      if (bandwidth > cpr / 4) {
        warnings.push(`编码器带宽 (${bandwidth}Hz) 建议不超过CPR/4 (${Math.floor(cpr/4)}Hz)，以避免噪声`);
      }
    }
  }

  /**
   * 获取参数建议值
   */
  static getParameterSuggestions(param: CommandParameter, context?: Record<string, any>): any[] {
    const suggestions: any[] = [];

    // 基于默认值
    if (param.default !== undefined) {
      suggestions.push(param.default);
    }

    // 基于参数类型的常见值
    const name = param.name.toLowerCase();
    
    if (name.includes('current')) {
      suggestions.push(1, 5, 10, 20);
    } else if (name.includes('voltage')) {
      suggestions.push(12, 24, 48);
    } else if (name.includes('bandwidth')) {
      suggestions.push(100, 500, 1000, 2000);
    } else if (name.includes('cpr')) {
      suggestions.push(1000, 2000, 4000, 8192);
    } else if (name.includes('pairs')) {
      suggestions.push(7, 14, 21);
    }

    // 去重并排序
    return [...new Set(suggestions)].sort((a, b) => a - b);
  }
}

export default ParameterValidator;
