import React, { useState, useEffect } from 'react';
import { flowNodeGenerator } from '../services/FlowNodeGenerator';
import type { DynamicNodeType } from '../../shared/types/flow';

interface NodeLibraryProps {
  onNodeDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export const NodeLibrary: React.FC<NodeLibraryProps> = ({ onNodeDragStart }) => {
  const [nodeTypes, setNodeTypes] = useState<DynamicNodeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNodeTypes();
  }, []);

  const loadNodeTypes = async () => {
    try {
      // 获取命令数据
      const commands = await window.electronAPI.commandsGetAll();
      
      // 生成节点类型
      const generatedNodes = flowNodeGenerator.getAllNodeTypes(commands);
      setNodeTypes(generatedNodes);
    } catch (error) {
      console.error('加载节点类型失败:', error);
    } finally {
      setLoading(false);
    }
  };
  const getNodeColor = (nodeType: DynamicNodeType) => {
    const color = nodeType.color || '#6B7280';
    return `border-opacity-30 bg-opacity-10 hover:bg-opacity-20`;
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    onNodeDragStart(event, nodeType);
  };

  return (
    <div className="w-full h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">节点库</h3>
        <p className="text-sm text-gray-600 mt-1">拖拽节点到画布</p>
      </div>
      
      <div className="p-4 space-y-3 overflow-y-auto max-h-[600px]">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>加载节点库中...</p>
          </div>
        ) : (
          <>
            {/* 按类别分组显示节点 */}
            {Object.entries(
              nodeTypes.reduce((groups, node) => {
                if (!groups[node.category]) {
                  groups[node.category] = [];
                }
                groups[node.category].push(node);
                return groups;
              }, {} as Record<string, DynamicNodeType[]>)
            ).map(([category, nodes]) => (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">{nodes[0]?.icon || '📦'}</span>
                  {category}
                  <span className="ml-2 text-xs text-gray-500">({nodes.length})</span>
                </h4>
                <div className="space-y-2">
                  {nodes.map((nodeType) => (
                    <div
                      key={nodeType.type}
                      className={`p-3 border-2 rounded cursor-move transition-all hover:shadow-md border-l-4`}
                      style={{
                        borderColor: nodeType.color + '40',
                        borderLeftColor: nodeType.color,
                        backgroundColor: nodeType.color + '10'
                      }}
                      draggable
                      onDragStart={(event) => onDragStart(event, nodeType.type)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg flex-shrink-0">
                          {nodeType.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {nodeType.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {nodeType.description}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-white px-2 py-1 rounded">
                              {nodeType.inputs.length} 输入
                            </span>
                            <span className="text-xs bg-white px-2 py-1 rounded">
                              {nodeType.outputs.length} 输出
                            </span>
                          </div>
                          {nodeType.defaultConfig && Object.keys(nodeType.defaultConfig).length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <div className="font-medium">默认配置:</div>
                              <div className="mt-1 space-y-1">
                                {Object.entries(nodeType.defaultConfig).slice(0, 2).map(([key, value]) => (
                                  <div key={key} className="truncate">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                                {Object.keys(nodeType.defaultConfig).length > 2 && (
                                  <div className="text-gray-400">...</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <div className="font-medium mb-2">使用说明:</div>
          <ul className="space-y-1">
            <li>• 拖拽节点到画布添加</li>
            <li>• 点击节点编辑配置</li>
            <li>• 拖拽连接点创建连线</li>
            <li>• 右键节点删除</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
