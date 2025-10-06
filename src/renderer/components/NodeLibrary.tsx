import React from 'react';
import { nodeTemplates } from './FlowCanvas';

interface NodeLibraryProps {
  onNodeDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export const NodeLibrary: React.FC<NodeLibraryProps> = ({ onNodeDragStart }) => {
  const getNodeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'connect': '🔌',
      'disconnect': '🔌',
      'set-param': '⚙️',
      'calibrate': '🎯',
      'position-control': '📍',
      'velocity-control': '🚀',
      'current-control': '⚡',
      'wait': '⏰',
      'condition': '🔀',
      'loop': '🔄',
      'log': '📝',
      'export': '💾',
      'error-handler': '⚠️',
      'emergency-stop': '🛑',
    };
    return icons[type] || '📦';
  };

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      'connect': 'border-blue-300 bg-blue-50 hover:bg-blue-100',
      'disconnect': 'border-red-300 bg-red-50 hover:bg-red-100',
      'set-param': 'border-purple-300 bg-purple-50 hover:bg-purple-100',
      'calibrate': 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
      'position-control': 'border-green-300 bg-green-50 hover:bg-green-100',
      'velocity-control': 'border-cyan-300 bg-cyan-50 hover:bg-cyan-100',
      'current-control': 'border-orange-300 bg-orange-50 hover:bg-orange-100',
      'wait': 'border-gray-300 bg-gray-50 hover:bg-gray-100',
      'condition': 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100',
      'loop': 'border-pink-300 bg-pink-50 hover:bg-pink-100',
      'log': 'border-teal-300 bg-teal-50 hover:bg-teal-100',
      'export': 'border-lime-300 bg-lime-50 hover:bg-lime-100',
      'error-handler': 'border-red-300 bg-red-50 hover:bg-red-100',
      'emergency-stop': 'border-red-400 bg-red-100 hover:bg-red-200',
    };
    return colors[type] || 'border-gray-300 bg-gray-50 hover:bg-gray-100';
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
        {nodeTemplates.map((template) => (
          <div
            key={template.type}
            className={`p-3 border-2 rounded cursor-move transition-colors ${getNodeColor(template.type)}`}
            draggable
            onDragStart={(event) => onDragStart(event, template.type)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl flex-shrink-0">
                {getNodeIcon(template.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">
                  {template.label}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {template.description}
                </div>
                {template.defaultConfig && Object.keys(template.defaultConfig).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="font-medium">默认配置:</div>
                    <div className="mt-1 space-y-1">
                      {Object.entries(template.defaultConfig).map(([key, value]) => (
                        <div key={key} className="truncate">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
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
