import React, { useState, useEffect } from 'react';
import { ParsedCommand, CommandParameter, ValidationResult } from '../../shared/types/commands';

interface DynamicCommandFormProps {
  command: ParsedCommand;
  onExecute: (commandKey: string, params: Record<string, any>) => void;
  onValidate?: (commandKey: string, validation: ValidationResult) => void;
  loading?: boolean;
}

/**
 * 动态命令表单组件 - 根据命令定义自动生成表单界面
 */
export const DynamicCommandForm: React.FC<DynamicCommandFormProps> = ({
  command,
  onExecute,
  onValidate,
  loading = false
}) => {
  const [params, setParams] = useState<Record<string, any>>({});
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: [], warnings: [] });
  const [generatedCommand, setGeneratedCommand] = useState<string>('');

  // 初始化默认参数
  useEffect(() => {
    const defaults: Record<string, any> = {};
    command.parameters.forEach(param => {
      if (param.default !== undefined) {
        defaults[param.name] = param.default;
      }
    });
    setParams(defaults);
  }, [command]);

  // 参数变化时验证和生成命令
  useEffect(() => {
    const validateParams = async () => {
      try {
        if (window.electronAPI) {
          const validationResult = await window.electronAPI.commandsValidate(command.key, params);
          setValidation(validationResult);
          onValidate?.(command.key, validationResult);
          
          // 如果验证通过，生成命令预览
          if (validationResult.valid) {
            try {
              const generatedCmd = await window.electronAPI.commandsExecute(command.key, params);
              setGeneratedCommand(generatedCmd);
            } catch (error) {
              console.error('生成命令失败:', error);
              setGeneratedCommand('');
            }
          } else {
            setGeneratedCommand('');
          }
        }
      } catch (error) {
        console.error('验证失败:', error);
        setValidation({ valid: false, errors: ['验证失败'], warnings: [] });
        setGeneratedCommand('');
      }
    };

    validateParams();
  }, [params, command, onValidate]);

  const handleParamChange = (paramName: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.valid) {
      onExecute(command.key, params);
    }
  };

  const renderParameterInput = (param: CommandParameter) => {
    const value = params[param.name] ?? '';
    const hasError = validation.errors.some(error => error.includes(param.name));

    if (param.options && param.options.length > 0) {
      // 选择框
      return (
        <select
          className={`input ${hasError ? 'border-red-500' : ''}`}
          value={value}
          onChange={(e) => handleParamChange(param.name, e.target.value)}
          required={param.required}
        >
          {param.required && !value && <option value="">请选择...</option>}
          {param.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // 根据参数类型渲染不同的输入框
    if (param.name.toLowerCase().includes('current') || 
        param.name.toLowerCase().includes('torque') ||
        param.name.toLowerCase().includes('voltage')) {
      // 数值输入框（带步长）
      return (
        <input
          type="number"
          step="0.01"
          className={`input ${hasError ? 'border-red-500' : ''}`}
          placeholder={param.placeholder}
          value={value}
          onChange={(e) => handleParamChange(param.name, parseFloat(e.target.value) || 0)}
          required={param.required}
        />
      );
    }

    if (param.name.toLowerCase().includes('pos') || 
        param.name.toLowerCase().includes('vel')) {
      // 数值输入框（位置和速度）
      return (
        <input
          type="number"
          step="0.1"
          className={`input ${hasError ? 'border-red-500' : ''}`}
          placeholder={param.placeholder}
          value={value}
          onChange={(e) => handleParamChange(param.name, parseFloat(e.target.value) || 0)}
          required={param.required}
        />
      );
    }

    // 默认文本输入框
    return (
      <input
        type="text"
        className={`input ${hasError ? 'border-red-500' : ''}`}
        placeholder={param.placeholder}
        value={value}
        onChange={(e) => handleParamChange(param.name, e.target.value)}
        required={param.required}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-lg mb-2">{command.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{command.description}</p>
        
        {command.template && (
          <div className="text-xs text-gray-500 mb-4 font-mono bg-white p-2 rounded border">
            模板: {command.template}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {command.parameters.map((param) => (
          <div key={param.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.placeholder || param.name}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderParameterInput(param)}
            {param.default !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                默认值: {param.default}
              </p>
            )}
          </div>
        ))}

        {/* 验证错误显示 */}
        {validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-red-800 mb-1">错误:</h4>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 验证警告显示 */}
        {validation.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">警告:</h4>
            <ul className="text-sm text-yellow-700 list-disc list-inside">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 执行按钮 */}
        <button
          type="submit"
          disabled={!validation.valid || loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '执行中...' : `执行 ${command.name}`}
        </button>
      </form>

      {/* 生成的命令预览 */}
      {validation.valid && generatedCommand && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-1">生成的命令:</h4>
          <code className="text-sm text-blue-700 font-mono">
            {generatedCommand}
          </code>
        </div>
      )}
    </div>
  );
};

export default DynamicCommandForm;
