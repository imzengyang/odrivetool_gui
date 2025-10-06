import React, { useState, useEffect } from 'react';
import { ParsedCommand, CommandCategory } from '../../shared/types/commands';
import { flowNodeGenerator } from '../services/FlowNodeGenerator';
import CommandLibrary from '../components/CommandLibrary';

interface CommandCenterProps {
  onExecuteCommand: (commandKey: string, params: Record<string, any>) => void;
  loading?: boolean;
}

/**
 * 命令中心页面 - 集成命令库和流程节点生成
 */
export const CommandCenter: React.FC<CommandCenterProps> = ({
  onExecuteCommand,
  loading = false
}) => {
  const [commands, setCommands] = useState<ParsedCommand[]>([]);
  const [categories, setCategories] = useState<CommandCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'commands' | 'nodes'>('commands');
  const [nodeTypes, setNodeTypes] = useState<any[]>([]);

  useEffect(() => {
    // 加载命令数据
    loadCommands();
  }, []);

  const loadCommands = async () => {
    try {
      // 通过IPC获取命令数据
      const allCommands = await window.electronAPI.invoke('commands:get-all');
      const allCategories = await window.electronAPI.invoke('commands:get-categories');
      
      setCommands(allCommands);
      setCategories(allCategories);

      // 生成流程节点类型
      const generatedNodes = flowNodeGenerator.getAllNodeTypes(allCommands);
      setNodeTypes(generatedNodes);
    } catch (error) {
      console.error('加载命令失败:', error);
    }
  };

  const handleExecuteCommand = (commandKey: string, params: Record<string, any>) => {
    onExecuteCommand(commandKey, params);
  };

  const renderNodeTypes = () => {
    const groupedNodes = flowNodeGenerator.getNodeTypesByCategory(commands);
    
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">流程节点类型</h2>
          <p className="text-sm text-gray-600 mt-1">
            基于命令定义自动生成的流程节点，可用于流程设计器
          </p>
        </div>

        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-md font-medium text-gray-800 flex items-center">
              <span className="mr-2">
                {nodes[0]?.icon || '📦'}
              </span>
              {category}
              <span className="ml-2 text-sm text-gray-500">
                ({nodes.length} 个节点)
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nodes.map((node) => (
                <div
                  key={node.type}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderColor: node.color + '40' }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-sm"
                      style={{ backgroundColor: node.color + '20' }}
                    >
                      {node.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {node.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {node.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {node.inputs.length} 输入
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {node.outputs.length} 输出
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'commands'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('commands')}
          >
            命令库
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'nodes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('nodes')}
          >
            流程节点
          </button>
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'commands' && (
          <CommandLibrary
            commands={commands}
            categories={categories}
            onExecuteCommand={handleExecuteCommand}
            loading={loading}
          />
        )}

        {activeTab === 'nodes' && (
          <div className="h-full overflow-y-auto p-6">
            {renderNodeTypes()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandCenter;
