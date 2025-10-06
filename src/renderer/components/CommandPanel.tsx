import React, { useState } from 'react';
import { ParsedCommand, CommandCategory } from '../../shared/types/commands';
import DynamicCommandForm from './DynamicCommandForm';

interface CommandPanelProps {
  commands: ParsedCommand[];
  categories: CommandCategory[];
  onExecuteCommand: (commandKey: string, params: Record<string, any>) => void;
  loading?: boolean;
}

/**
 * 命令面板组件 - 在流程设计器中提供命令执行功能
 */
export const CommandPanel: React.FC<CommandPanelProps> = ({
  commands,
  categories,
  onExecuteCommand,
  loading = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedCommand, setSelectedCommand] = useState<ParsedCommand | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 获取所有类别选项
  const categoryOptions = ['全部', ...categories.map(cat => cat.name)];

  // 过滤命令
  const filteredCommands = commands.filter(command => {
    const matchesCategory = selectedCategory === '全部' || command.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.key.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleCommandSelect = (command: ParsedCommand) => {
    setSelectedCommand(command);
  };

  const handleExecuteCommand = (commandKey: string, params: Record<string, any>) => {
    onExecuteCommand(commandKey, params);
  };

  const handleBackToList = () => {
    setSelectedCommand(null);
  };

  return (
    <div className="h-full flex flex-col">
      {selectedCommand ? (
        // 命令详情和执行界面
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              onClick={handleBackToList}
            >
              ← 返回命令列表
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <DynamicCommandForm
              command={selectedCommand}
              onExecute={handleExecuteCommand}
              loading={loading}
            />
          </div>
        </div>
      ) : (
        // 命令列表界面
        <div className="flex-1 flex flex-col">
          {/* 搜索和筛选 */}
          <div className="p-4 space-y-3 border-b border-gray-200">
            <div>
              <input
                type="text"
                placeholder="搜索命令..."
                className="input w-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <select
                className="input w-full text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 命令列表 */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-sm">加载命令中...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCommands.map(command => (
                  <div
                    key={command.key}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50"
                    onClick={() => handleCommandSelect(command)}
                  >
                    <h4 className="font-medium text-sm text-gray-900">{command.name}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {command.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {command.category}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {command.parameters.length} 参数
                      </span>
                    </div>
                  </div>
                ))}

                {filteredCommands.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">没有找到匹配的命令</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部统计信息 */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              共 {commands.length} 个命令，显示 {filteredCommands.length} 个
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandPanel;
