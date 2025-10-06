import { ParsedCommand, CommandCategory } from '../../shared/types/commands';
import { DynamicNodeType, FlowNodePort } from '../../shared/types/flow';

/**
 * 流程节点生成器 - 基于命令定义动态生成流程节点类型
 */
export class FlowNodeGenerator {
  
  /**
   * 根据命令生成节点类型
   */
  generateNodeType(command: ParsedCommand): DynamicNodeType {
    const inputs = this.generateInputPorts(command);
    const outputs = this.generateOutputPorts(command);
    
    return {
      type: `command_${command.key}`,
      category: command.category,
      name: command.name,
      description: command.description,
      command: command,
      icon: this.getIconForCategory(command.category),
      color: this.getColorForCategory(command.category),
      inputs,
      outputs,
      defaultConfig: this.generateDefaultConfig(command)
    };
  }

  /**
   * 批量生成节点类型
   */
  generateNodeTypes(commands: ParsedCommand[]): DynamicNodeType[] {
    return commands.map(command => this.generateNodeType(command));
  }

  /**
   * 按类别生成节点类型
   */
  generateNodeTypesByCategory(categories: CommandCategory[]): Record<string, DynamicNodeType[]> {
    const result: Record<string, DynamicNodeType[]> = {};
    
    categories.forEach(category => {
      result[category.name] = category.commands.map(command => 
        this.generateNodeType(command)
      );
    });

    return result;
  }

  /**
   * 生成输入端口
   */
  private generateInputPorts(command: ParsedCommand): FlowNodePort[] {
    const ports: FlowNodePort[] = [
      {
        id: 'trigger',
        name: '触发',
        type: 'input',
        dataType: 'control'
      }
    ];

    // 为参数添加输入端口（可选）
    if (command.parameters.length > 0) {
      ports.push({
        id: 'params',
        name: '参数',
        type: 'input',
        dataType: 'data'
      });
    }

    return ports;
  }

  /**
   * 生成输出端口
   */
  private generateOutputPorts(command: ParsedCommand): FlowNodePort[] {
    const ports: FlowNodePort[] = [
      {
        id: 'success',
        name: '成功',
        type: 'output',
        dataType: 'control'
      },
      {
        id: 'error',
        name: '错误',
        type: 'output',
        dataType: 'error'
      }
    ];

    // 如果是读取命令，添加数据输出端口
    if (command.key.includes('read_') || command.template.startsWith('r ')) {
      ports.push({
        id: 'data',
        name: '数据',
        type: 'output',
        dataType: 'data'
      });
    }

    return ports;
  }

  /**
   * 生成默认配置
   */
  private generateDefaultConfig(command: ParsedCommand): Record<string, any> {
    const config: Record<string, any> = {
      timeout: 5000,
      retryCount: 0
    };

    // 添加参数默认值
    command.parameters.forEach(param => {
      if (param.default !== undefined) {
        config[param.name] = param.default;
      }
    });

    return config;
  }

  /**
   * 根据类别获取图标
   */
  private getIconForCategory(category: string): string {
    const iconMap: Record<string, string> = {
      '系统管理': '⚙️',
      '轴控制': '🎛️',
      '运动控制': '🚀',
      '错误管理': '⚠️',
      '状态读取': '📊',
      '系统配置': '🔧',
      '电机配置': '⚡',
      '编码器配置': '🔄',
      '控制器配置': '🎮',
      '轨迹规划': '📈',
      '安全配置': '🛡️'
    };

    return iconMap[category] || '📦';
  }

  /**
   * 根据类别获取颜色
   */
  private getColorForCategory(category: string): string {
    const colorMap: Record<string, string> = {
      '系统管理': '#6B7280',
      '轴控制': '#3B82F6',
      '运动控制': '#10B981',
      '错误管理': '#EF4444',
      '状态读取': '#8B5CF6',
      '系统配置': '#F59E0B',
      '电机配置': '#EC4899',
      '编码器配置': '#14B8A6',
      '控制器配置': '#F97316',
      '轨迹规划': '#6366F1',
      '安全配置': '#84CC16'
    };

    return colorMap[category] || '#6B7280';
  }

  /**
   * 生成特殊节点类型（非命令节点）
   */
  generateSpecialNodeTypes(): DynamicNodeType[] {
    return [
      {
        type: 'start',
        category: '控制',
        name: '开始',
        description: '流程开始节点',
        command: {} as ParsedCommand,
        icon: '🚀',
        color: '#10B981',
        inputs: [],
        outputs: [
          {
            id: 'start',
            name: '开始',
            type: 'output',
            dataType: 'control'
          }
        ]
      },
      {
        type: 'end',
        category: '控制',
        name: '结束',
        description: '流程结束节点',
        command: {} as ParsedCommand,
        icon: '🏁',
        color: '#EF4444',
        inputs: [
          {
            id: 'end',
            name: '结束',
            type: 'input',
            dataType: 'control'
          }
        ],
        outputs: []
      },
      {
        type: 'delay',
        category: '控制',
        name: '延迟',
        description: '延迟等待节点',
        command: {} as ParsedCommand,
        icon: '⏱️',
        color: '#F59E0B',
        inputs: [
          {
            id: 'trigger',
            name: '触发',
            type: 'input',
            dataType: 'control'
          }
        ],
        outputs: [
          {
            id: 'complete',
            name: '完成',
            type: 'output',
            dataType: 'control'
          }
        ],
        defaultConfig: {
          delayMs: 1000
        }
      },
      {
        type: 'condition',
        category: '控制',
        name: '条件判断',
        description: '条件分支节点',
        command: {} as ParsedCommand,
        icon: '🔀',
        color: '#8B5CF6',
        inputs: [
          {
            id: 'trigger',
            name: '触发',
            type: 'input',
            dataType: 'control'
          },
          {
            id: 'condition',
            name: '条件',
            type: 'input',
            dataType: 'data'
          }
        ],
        outputs: [
          {
            id: 'true',
            name: '真',
            type: 'output',
            dataType: 'control'
          },
          {
            id: 'false',
            name: '假',
            type: 'output',
            dataType: 'control'
          }
        ],
        defaultConfig: {
          condition: 'true'
        }
      },
      {
        type: 'loop',
        category: '控制',
        name: '循环',
        description: '循环节点',
        command: {} as ParsedCommand,
        icon: '🔄',
        color: '#06B6D4',
        inputs: [
          {
            id: 'trigger',
            name: '触发',
            type: 'input',
            dataType: 'control'
          }
        ],
        outputs: [
          {
            id: 'loop',
            name: '循环',
            type: 'output',
            dataType: 'control'
          },
          {
            id: 'complete',
            name: '完成',
            type: 'output',
            dataType: 'control'
          }
        ],
        defaultConfig: {
          count: 1,
          currentIndex: 0
        }
      }
    ];
  }

  /**
   * 获取所有节点类型（包括命令节点和特殊节点）
   */
  getAllNodeTypes(commands: ParsedCommand[]): DynamicNodeType[] {
    const commandNodes = this.generateNodeTypes(commands);
    const specialNodes = this.generateSpecialNodeTypes();
    
    return [...specialNodes, ...commandNodes];
  }

  /**
   * 按类别分组节点类型
   */
  getNodeTypesByCategory(commands: ParsedCommand[]): Record<string, DynamicNodeType[]> {
    const allNodes = this.getAllNodeTypes(commands);
    const grouped: Record<string, DynamicNodeType[]> = {};

    allNodes.forEach(node => {
      if (!grouped[node.category]) {
        grouped[node.category] = [];
      }
      grouped[node.category].push(node);
    });

    return grouped;
  }

  /**
   * 搜索节点类型
   */
  searchNodeTypes(nodes: DynamicNodeType[], query: string): DynamicNodeType[] {
    const lowerQuery = query.toLowerCase();
    return nodes.filter(node => 
      node.name.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      node.category.toLowerCase().includes(lowerQuery) ||
      node.type.toLowerCase().includes(lowerQuery)
    );
  }
}

// 单例实例
export const flowNodeGenerator = new FlowNodeGenerator();
