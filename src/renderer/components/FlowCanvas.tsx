import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  NodeTypes,
  Handle,
  Position,
} from 'react-flow-renderer';
import { useFlowStore } from '../stores/flowStore';
import { flowNodeGenerator } from '../services/FlowNodeGenerator';
import type { FlowNode as FlowNodeType, DynamicNodeType } from '../../shared/types';

// 节点类型定义
interface CustomNodeData {
  label: string;
  description: string;
  type: string;
  config?: Record<string, any>;
  status?: 'idle' | 'running' | 'completed' | 'error';
}

// 自定义节点组件
const CustomNode: React.FC<{ data: CustomNodeData; selected: boolean }> = ({ data, selected }) => {
  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      'connect': 'bg-blue-100 border-blue-300',
      'disconnect': 'bg-red-100 border-red-300',
      'set-param': 'bg-purple-100 border-purple-300',
      'calibrate': 'bg-yellow-100 border-yellow-300',
      'position-control': 'bg-green-100 border-green-300',
      'velocity-control': 'bg-cyan-100 border-cyan-300',
      'current-control': 'bg-orange-100 border-orange-300',
      'wait': 'bg-gray-100 border-gray-300',
      'condition': 'bg-indigo-100 border-indigo-300',
      'loop': 'bg-pink-100 border-pink-300',
      'log': 'bg-teal-100 border-teal-300',
      'export': 'bg-lime-100 border-lime-300',
      'error-handler': 'bg-red-100 border-red-300',
      'emergency-stop': 'bg-red-200 border-red-400',
    };
    return colors[type] || 'bg-gray-100 border-gray-300';
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      'idle': '',
      'running': 'ring-2 ring-blue-500',
      'completed': 'ring-2 ring-green-500',
      'error': 'ring-2 ring-red-500',
    };
    return colors[status || 'idle'] || '';
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[150px] ${getNodeColor(data.type)} ${selected ? 'ring-2 ring-blue-500' : ''} ${getStatusColor(data.status)}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-600 border-2 border-white"
      />
      <div className="text-sm font-medium text-gray-900">{data.label}</div>
      <div className="text-xs text-gray-600 mt-1">{data.description}</div>
      {data.config && (
        <div className="text-xs text-gray-500 mt-2">
          {Object.entries(data.config).map(([key, value]) => (
            <div key={key}>{key}: {String(value)}</div>
          ))}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-600 border-2 border-white"
      />
    </div>
  );
};

// 节点类型配置
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// 节点模板
const nodeTemplates = [
  {
    type: 'connect',
    label: '连接设备',
    description: '连接到 ODrive 设备',
    defaultConfig: { port: '', timeout: 5000 },
  },
  {
    type: 'disconnect',
    label: '断开设备',
    description: '断开设备连接',
    defaultConfig: {},
  },
  {
    type: 'set-param',
    label: '设置参数',
    description: '配置电机参数',
    defaultConfig: { path: '', value: '' },
  },
  {
    type: 'calibrate',
    label: '电机校准',
    description: '执行电机校准',
    defaultConfig: { type: 'motor' },
  },
  {
    type: 'position-control',
    label: '位置控制',
    description: '控制电机位置',
    defaultConfig: { position: 0, velocity_limit: 10 },
  },
  {
    type: 'velocity-control',
    label: '速度控制',
    description: '控制电机速度',
    defaultConfig: { velocity: 0, current_limit: 10 },
  },
  {
    type: 'current-control',
    label: '电流控制',
    description: '控制电机电流',
    defaultConfig: { current: 0 },
  },
  {
    type: 'wait',
    label: '等待',
    description: '等待指定时间',
    defaultConfig: { duration: 1000 },
  },
  {
    type: 'condition',
    label: '条件分支',
    description: '根据条件分支',
    defaultConfig: { condition: '', truePath: '', falsePath: '' },
  },
  {
    type: 'loop',
    label: '循环',
    description: '重复执行操作',
    defaultConfig: { iterations: 1, breakCondition: '' },
  },
  {
    type: 'log',
    label: '记录日志',
    description: '记录执行日志',
    defaultConfig: { message: '', level: 'info' },
  },
  {
    type: 'export',
    label: '导出数据',
    description: '导出运行数据',
    defaultConfig: { format: 'json', filename: '' },
  },
  {
    type: 'error-handler',
    label: '错误处理',
    description: '处理执行错误',
    defaultConfig: { action: 'stop', retryCount: 0 },
  },
  {
    type: 'emergency-stop',
    label: '急停',
    description: '紧急停止所有电机',
    defaultConfig: {},
  },
];

interface FlowCanvasProps {
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeSelect?: (node: Node | null) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<Node>) => void;
  onNodeDelete?: (nodeId: string) => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({ 
  onNodesChange, 
  onEdgesChange, 
  onNodeSelect, 
  onNodeUpdate, 
  onNodeDelete 
}) => {
  const { currentFlow, isRunning, currentNodeId } = useFlowStore();
  const [dynamicNodeTypes, setDynamicNodeTypes] = useState<DynamicNodeType[]>([]);

  // 加载动态节点类型
  useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        const commands = await window.electronAPI.commandsGetAll();
        const nodeTypes = flowNodeGenerator.getAllNodeTypes(commands);
        setDynamicNodeTypes(nodeTypes);
      } catch (error) {
        console.error('加载节点类型失败:', error);
      }
    };
    loadNodeTypes();
  }, []);

  // 转换流程数据为 ReactFlow 格式
  const initialNodes = useMemo(() => {
    if (!currentFlow?.nodes) return [];
    
    return currentFlow.nodes.map((node: FlowNodeType): Node => {
      // 尝试从动态节点类型中获取信息
      const dynamicNodeType = dynamicNodeTypes.find(t => t.type === node.type);
      const staticTemplate = nodeTemplates.find(t => t.type === node.type);
      
      return {
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          label: dynamicNodeType?.name || staticTemplate?.label || node.type,
          description: dynamicNodeType?.description || staticTemplate?.description || '',
          type: node.type,
          config: node.data,
          status: isRunning && currentNodeId === node.id ? 'running' : 'idle',
          icon: dynamicNodeType?.icon,
          color: dynamicNodeType?.color,
        },
      };
    });
  }, [currentFlow?.nodes, isRunning, currentNodeId, dynamicNodeTypes]);

  const initialEdges = useMemo(() => {
    if (!currentFlow?.edges) return [];
    
    return currentFlow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'smoothstep',
      animated: isRunning && currentNodeId === edge.source,
    }));
  }, [currentFlow?.edges, isRunning, currentNodeId]);

  const [nodes, setNodes, onNodesChangeHandler] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState(initialEdges);

  // 处理节点变化
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChangeHandler(changes);
    
    if (currentFlow && onNodesChange) {
      const updatedNodes = changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((node: Node) => node.id !== change.id);
        }
        return acc;
      }, nodes);
      
      onNodesChange(updatedNodes);
    }
  }, [nodes, currentFlow, onNodesChange, onNodesChangeHandler]);

  // 处理边变化
  const handleEdgesChange = useCallback((changes: any[]) => {
    onEdgesChangeHandler(changes);
    
    if (currentFlow && onEdgesChange) {
      const updatedEdges = changes.reduce((acc: Edge[], change) => {
        if (change.type === 'remove') {
          return acc.filter((edge: Edge) => edge.id !== change.id);
        }
        return acc;
      }, edges);
      
      onEdgesChange(updatedEdges);
    }
  }, [edges, currentFlow, onEdgesChange, onEdgesChangeHandler]);

  // 处理连接
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    
    const newEdge: Edge = {
      ...params,
      source: params.source,
      target: params.target,
      type: 'smoothstep',
      id: `edge-${Date.now()}`,
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    
    if (currentFlow && onEdgesChange) {
      const updatedEdges = [...edges, newEdge];
      onEdgesChange(updatedEdges);
    }
  }, [setEdges, edges, currentFlow, onEdgesChange]);

  // 处理节点选择
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  }, [onNodeSelect]);

  // 处理画布点击（取消选择）
  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // 处理节点更新
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<Node>) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
    
    if (onNodeUpdate) {
      onNodeUpdate(nodeId, updates);
    }
  }, [setNodes, onNodeUpdate]);

  // 处理节点删除
  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    if (onNodeDelete) {
      onNodeDelete(nodeId);
    }
    
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [setNodes, setEdges, onNodeDelete, onNodeSelect]);

  // 拖拽处理
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) {
      return;
    }

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left - 75,
      y: event.clientY - reactFlowBounds.top - 25,
    };

    // 优先查找动态节点类型
    const dynamicNodeType = dynamicNodeTypes.find(t => t.type === type);
    const staticTemplate = nodeTemplates.find(t => t.type === type);
    
    const nodeType = dynamicNodeType || staticTemplate;
    if (!nodeType) return;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        label: nodeType.name || nodeType.label,
        description: nodeType.description,
        type: nodeType.type,
        config: nodeType.defaultConfig || {},
        icon: dynamicNodeType?.icon,
        color: dynamicNodeType?.color,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    
    if (currentFlow && onNodesChange) {
      const updatedNodes = [...nodes, newNode];
      onNodesChange(updatedNodes);
    }
  }, [setNodes, nodes, currentFlow, onNodesChange, dynamicNodeTypes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap />
        <Background variant={'dots' as any} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export { nodeTemplates };
export type { CustomNodeData };
