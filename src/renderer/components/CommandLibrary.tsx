import React, { useState, useEffect } from 'react';
import { ParsedCommand, CommandCategory } from '../../shared/types/commands';
import DynamicCommandForm from './DynamicCommandForm';

interface CommandLibraryProps {
  commands: ParsedCommand[];
  categories: CommandCategory[];
  onExecuteCommand: (commandKey: string, params: Record<string, any>) => void;
  loading?: boolean;
}

/**
 * 命令库组件 - 展示所有可用命令并提供执行界面
 */
export const CommandLibrary: React.FC<CommandLibraryProps> = ({
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

  return (
    <div className="flex h-full">
      {/* 命令列表 */}
      <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 搜索框 */}
          <div>
            <input
              type="text"
              placeholder="搜索命令..."
              className="input w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 类别选择 */}
          <div>
            <select
              className="input w-full"
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

          {/* 命令列表 */}
          <div className="space-y-2">
            {filteredCommands.map(command => (
              <div
                key={command.key}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCommand?.key === command.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleCommandSelect(command)}
              >
                <h4 className="font-medium text-sm">{command.name}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {command.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {command.category}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {command.parameters.length} 参数
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredCommands.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>没有找到匹配的命令</p>
            </div>
          )}
        </div>
      </div>

      {/* 命令详情和执行 */}
      <div className="w-1/2 overflow-y-auto">
        {selectedCommand ? (
          <div className="p-4">
            <div className="mb-4">
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedCommand(null)}
              >
                ← 返回命令列表
              </button>
            </div>
            
            <DynamicCommandForm
              command={selectedCommand}
              onExecute={handleExecuteCommand}
              loading={loading}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">选择一个命令</p>
              <p className="text-sm">从左侧列表中选择要执行的命令</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandLibrary;
