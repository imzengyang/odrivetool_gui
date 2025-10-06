import React, { useState, useEffect } from 'react';
import type { Node } from 'react-flow-renderer';
import { nodeTemplates } from './FlowCanvas';

interface NodePropertiesProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onNodeDelete: (nodeId: string) => void;
}

interface PropertyField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

// 节点类型对应的属性字段配置
const getNodeProperties = (nodeType: string): PropertyField[] => {
  const properties: Record<string, PropertyField[]> = {
    'connect': [
      {
        key: 'port',
        label: '串口端口',
        type: 'text',
        placeholder: 'COM3 或 /dev/ttyUSB0',
        description: 'ODrive 设备连接的串口端口'
      },
      {
        key: 'timeout',
        label: '连接超时 (ms)',
        type: 'number',
        min: 1000,
        max: 30000,
        step: 1000,
        placeholder: '5000',
        description: '连接超时时间，单位毫秒'
      },
      {
        key: 'baudRate',
        label: '波特率',
        type: 'select',
        options: ['9600', '115200', '230400', '460800', '921600'],
        description: '串口通信波特率'
      }
    ],
    'disconnect': [
      {
        key: 'graceful',
        label: '优雅断开',
        type: 'checkbox',
        description: '是否在断开前发送停止命令'
      }
    ],
    'set-param': [
      {
        key: 'path',
        label: '参数路径',
        type: 'text',
        placeholder: 'axis0.controller.vel_limit',
        description: 'ODrive 参数路径，如 axis0.controller.vel_limit'
      },
      {
        key: 'value',
        label: '参数值',
        type: 'text',
        placeholder: '10.0',
        description: '要设置的参数值'
      },
      {
        key: 'verify',
        label: '验证设置',
        type: 'checkbox',
        description: '设置后是否验证参数值'
      }
    ],
    'calibrate': [
      {
        key: 'type',
        label: '校准类型',
        type: 'select',
        options: ['motor', 'encoder', 'full'],
        description: '选择要执行的校准类型'
      },
      {
        key: 'calib_current',
        label: '校准电流 (A)',
        type: 'number',
        min: 0.1,
        max: 50,
        step: 0.1,
        placeholder: '10.0',
        description: '电机校准时的电流大小'
      },
      {
        key: 'calib_voltage',
        label: '校准电压 (V)',
        type: 'number',
        min: 1,
        max: 48,
        step: 0.1,
        placeholder: '12.0',
        description: '编码器校准时的电压大小'
      }
    ],
    'position-control': [
      {
        key: 'position',
        label: '目标位置',
        type: 'number',
        step: 0.01,
        placeholder: '0.0',
        description: '电机目标位置（圈数或弧度，取决于配置）'
      },
      {
        key: 'velocity_limit',
        label: '速度限制',
        type: 'number',
        min: 0,
        step: 0.1,
        placeholder: '10.0',
        description: '运动时的最大速度'
      },
      {
        key: 'current_limit',
        label: '电流限制',
        type: 'number',
        min: 0,
        step: 0.1,
        placeholder: '10.0',
        description: '运动时的最大电流'
      },
      {
        key: 'accel_limit',
        label: '加速度限制',
        type: 'number',
        min: 0,
        step: 0.1,
        placeholder: '2.0',
        description: '运动时的最大加速度'
      }
    ],
    'velocity-control': [
      {
        key: 'velocity',
        label: '目标速度',
        type: 'number',
        step: 0.01,
        placeholder: '0.0',
        description: '电机目标速度'
      },
      {
        key: 'current_limit',
        label: '电流限制',
        type: 'number',
        min: 0,
        step: 0.1,
        placeholder: '10.0',
        description: '速度控制时的最大电流'
      },
      {
        key: 'accel_limit',
        label: '加速度限制',
        type: 'number',
        min: 0,
        step: 0.1,
        placeholder: '2.0',
        description: '速度变化时的最大加速度'
      }
    ],
    'current-control': [
      {
        key: 'current',
        label: '目标电流',
        type: 'number',
        step: 0.01,
        placeholder: '0.0',
        description: '电机目标电流'
      },
      {
        key: 'current_ramp_rate',
        label: '电流变化率',
        type: 'number',
        min: 0,
        step: 0.1,
        placeholder: '1.0',
        description: '电流变化的最大速率'
      }
    ],
    'wait': [
      {
        key: 'duration',
        label: '等待时间 (ms)',
        type: 'number',
        min: 0,
        step: 100,
        placeholder: '1000',
        description: '等待的时间长度，单位毫秒'
      },
      {
        key: 'condition',
        label: '等待条件',
        type: 'text',
        placeholder: 'axis0.current_state == 8',
        description: '可选：等待特定条件满足后再继续'
      }
    ],
    'condition': [
      {
        key: 'condition',
        label: '条件表达式',
        type: 'text',
        placeholder: 'axis0.controller.pos_setpoint > 10',
        description: '判断条件，支持基本的比较运算'
      },
      {
        key: 'truePath',
        label: '真值路径',
        type: 'text',
        placeholder: 'node-5',
        description: '条件为真时跳转的节点ID'
      },
      {
        key: 'falsePath',
        label: '假值路径',
        type: 'text',
        placeholder: 'node-6',
        description: '条件为假时跳转的节点ID'
      }
    ],
    'loop': [
      {
        key: 'iterations',
        label: '循环次数',
        type: 'number',
        min: 1,
        step: 1,
        placeholder: '1',
        description: '循环执行的次数'
      },
      {
        key: 'breakCondition',
        label: '中断条件',
        type: 'text',
        placeholder: 'axis0.controller.pos_setpoint > 100',
        description: '可选：满足此条件时提前退出循环'
      },
      {
        key: 'targetNodeId',
        label: '目标节点',
        type: 'text',
        placeholder: 'node-3',
        description: '循环回到的节点ID'
      }
    ],
    'log': [
      {
        key: 'message',
        label: '日志消息',
        type: 'textarea',
        placeholder: '执行完成',
        description: '要记录的日志消息'
      },
      {
        key: 'level',
        label: '日志级别',
        type: 'select',
        options: ['info', 'warn', 'error', 'debug'],
        description: '日志的级别'
      },
      {
        key: 'includeData',
        label: '包含数据',
        type: 'checkbox',
        description: '是否在日志中包含当前设备数据'
      }
    ],
    'export': [
      {
        key: 'format',
        label: '导出格式',
        type: 'select',
        options: ['json', 'csv'],
        description: '数据导出的格式'
      },
      {
        key: 'filename',
        label: '文件名',
        type: 'text',
        placeholder: 'data_${timestamp}',
        description: '导出文件的名称，支持 ${timestamp} 变量'
      },
      {
        key: 'dataRange',
        label: '数据范围',
        type: 'select',
        options: ['all', 'last_1min', 'last_5min', 'last_10min', 'custom'],
        description: '要导出的数据时间范围'
      },
      {
        key: 'customRange',
        label: '自定义范围 (s)',
        type: 'number',
        min: 1,
        step: 1,
        placeholder: '60',
        description: '当选择自定义范围时的具体时间（秒）'
      }
    ],
    'error-handler': [
      {
        key: 'action',
        label: '处理动作',
        type: 'select',
        options: ['stop', 'retry', 'continue', 'jump'],
        description: '发生错误时的处理动作'
      },
      {
        key: 'retryCount',
        label: '重试次数',
        type: 'number',
        min: 0,
        step: 1,
        placeholder: '3',
        description: '选择重试时的最大重试次数'
      },
      {
        key: 'retryDelay',
        label: '重试延迟 (ms)',
        type: 'number',
        min: 0,
        step: 100,
        placeholder: '1000',
        description: '重试之间的延迟时间'
      },
      {
        key: 'jumpTarget',
        label: '跳转目标',
        type: 'text',
        placeholder: 'node-10',
        description: '选择跳转时的目标节点ID'
      }
    ],
    'emergency-stop': [
      {
        key: 'clearErrors',
        label: '清除错误',
        type: 'checkbox',
        description: '急停后是否清除设备错误状态'
      },
      {
        key: 'disableBrake',
        label: '释放刹车',
        type: 'checkbox',
        description: '急停后是否释放电机刹车'
      }
    ]
  };

  return properties[nodeType] || [];
};

export const NodeProperties: React.FC<NodePropertiesProps> = ({
  selectedNode,
  onNodeUpdate,
  onNodeDelete,
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [nodeName, setNodeName] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
      setNodeName(selectedNode.data.label || '');
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">属性面板</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-sm">选择一个节点查看属性</div>
          </div>
        </div>
      </div>
    );
  }

  const nodeType = selectedNode.data.type;
  const properties = getNodeProperties(nodeType);
  const template = nodeTemplates.find(t => t.type === nodeType);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    onNodeUpdate(selectedNode.id, {
      data: {
        ...selectedNode.data,
        config: newConfig,
      },
    });
  };

  const handleNameChange = (name: string) => {
    setNodeName(name);
    onNodeUpdate(selectedNode.id, {
      data: {
        ...selectedNode.data,
        label: name,
      },
    });
  };

  const handleResetToDefault = () => {
    if (template?.defaultConfig) {
      setConfig(template.defaultConfig);
      onNodeUpdate(selectedNode.id, {
        data: {
          ...selectedNode.data,
          config: template.defaultConfig,
        },
      });
    }
  };

  const renderField = (field: PropertyField) => {
    const value = config[field.key] ?? '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(field.key, parseFloat(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleConfigChange(field.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">启用</span>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">属性面板</h3>
          <button
            onClick={() => onNodeDelete(selectedNode.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            删除节点
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* 基本信息 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">基本信息</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  节点名称
                </label>
                <input
                  type="text"
                  value={nodeName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  节点类型
                </label>
                <div className="text-sm text-gray-900">
                  {template?.label || nodeType}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  节点ID
                </label>
                <div className="text-sm text-gray-500">
                  {selectedNode.id}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  位置
                </label>
                <div className="text-sm text-gray-900">
                  X: {Math.round(selectedNode.position.x)}, Y: {Math.round(selectedNode.position.y)}
                </div>
              </div>
            </div>
          </div>

          {/* 配置参数 */}
          {properties.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">配置参数</h4>
                <button
                  onClick={handleResetToDefault}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  重置为默认值
                </button>
              </div>
              
              <div className="space-y-4">
                {properties.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    {renderField(field)}
                    {field.description && (
                      <p className="mt-1 text-xs text-gray-500">
                        {field.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 节点描述 */}
          {template?.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">节点说明</h4>
              <p className="text-sm text-gray-600">
                {template.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
