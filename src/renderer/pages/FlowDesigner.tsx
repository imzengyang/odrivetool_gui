import React, { useState, useCallback } from 'react';
import { FlowCanvas } from '../components/FlowCanvas';
import { NodeLibrary } from '../components/NodeLibrary';
import { NodeProperties } from '../components/NodeProperties';
import { useFlowStore } from '../stores/flowStore';
import type { Node, Edge } from 'react-flow-renderer';
import type { FlowNode, FlowEdge } from '../../shared/types';

const FlowDesigner: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { 
    currentFlow, 
    setCurrentFlow, 
    isRunning, 
    isPaused, 
    createNewFlow, 
    saveCurrentFlow, 
    startFlow, 
    pauseFlow, 
    resumeFlow, 
    stopFlow 
  } = useFlowStore();

  // 处理节点变化
  const handleNodesChange = useCallback((nodes: Node[]) => {
    if (!currentFlow) return;

    const flowNodes: FlowNode[] = nodes.map((node): FlowNode => ({
      id: node.id,
      type: node.data.type,
      position: node.position,
      data: node.data.config || {},
    }));

    const updatedFlow = {
      ...currentFlow,
      nodes: flowNodes,
      updatedAt: Date.now(),
    };

    setCurrentFlow(updatedFlow);
  }, [currentFlow, setCurrentFlow]);

  // 处理边变化
  const handleEdgesChange = useCallback((edges: Edge[]) => {
    if (!currentFlow) return;

    const flowEdges: FlowEdge[] = edges.map((edge): FlowEdge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined,
    }));

    const updatedFlow = {
      ...currentFlow,
      edges: flowEdges,
      updatedAt: Date.now(),
    };

    setCurrentFlow(updatedFlow);
  }, [currentFlow, setCurrentFlow]);

  // 处理节点拖拽开始
  const handleNodeDragStart = useCallback((_event: React.DragEvent, nodeType: string) => {
    // 可以在这里添加拖拽开始的逻辑
    console.log('Dragging node:', nodeType);
  }, []);

  // 处理节点选择
  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  // 处理节点更新
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<Node>) => {
    if (!currentFlow) return;

    // 更新流程中的节点
    const updatedNodes = currentFlow.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: updates.data || node.data,
          position: updates.position || node.position,
        };
      }
      return node;
    });

    const updatedFlow = {
      ...currentFlow,
      nodes: updatedNodes,
      updatedAt: Date.now(),
    };

    setCurrentFlow(updatedFlow);

    // 如果当前选中的节点被更新，也更新选中状态
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, ...updates });
    }
  }, [currentFlow, setCurrentFlow, selectedNode]);

  // 处理节点删除
  const handleNodeDelete = useCallback((nodeId: string) => {
    if (!currentFlow) return;

    // 从流程中删除节点
    const updatedNodes = currentFlow.nodes.filter((node) => node.id !== nodeId);
    const updatedEdges = currentFlow.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );

    const updatedFlow = {
      ...currentFlow,
      nodes: updatedNodes,
      edges: updatedEdges,
      updatedAt: Date.now(),
    };

    setCurrentFlow(updatedFlow);
    setSelectedNode(null);
  }, [currentFlow, setCurrentFlow]);

  // 处理新建流程
  const handleNewFlow = useCallback(() => {
    createNewFlow();
    setSelectedNode(null);
  }, [createNewFlow]);

  // 处理保存流程
  const handleSaveFlow = useCallback(() => {
    saveCurrentFlow();
  }, [saveCurrentFlow]);

  // 处理运行流程
  const handleStartFlow = useCallback(async () => {
    if (!currentFlow) return;
    
    try {
      await startFlow();
    } catch (error) {
      console.error('启动流程失败:', error);
    }
  }, [currentFlow, startFlow]);

  // 处理暂停流程
  const handlePauseFlow = useCallback(async () => {
    try {
      await pauseFlow();
    } catch (error) {
      console.error('暂停流程失败:', error);
    }
  }, [pauseFlow]);

  // 处理恢复流程
  const handleResumeFlow = useCallback(async () => {
    try {
      await resumeFlow();
    } catch (error) {
      console.error('恢复流程失败:', error);
    }
  }, [resumeFlow]);

  // 处理停止流程
  const handleStopFlow = useCallback(async () => {
    try {
      await stopFlow();
    } catch (error) {
      console.error('停止流程失败:', error);
    }
  }, [stopFlow]);

  // 处理文件操作
  const handleLoadFlow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const flowData = JSON.parse(e.target?.result as string);
            setCurrentFlow(flowData);
          } catch (error) {
            console.error('加载流程文件失败:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setCurrentFlow]);

  const handleExportFlow = useCallback(() => {
    if (!currentFlow) return;

    const dataStr = JSON.stringify(currentFlow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentFlow.name || 'flow'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentFlow]);

  const getFlowStatus = () => {
    if (isRunning) {
      return isPaused ? '已暂停' : '运行中';
    }
    return '空闲';
  };

  const getFlowStatusColor = () => {
    if (isRunning) {
      return isPaused ? 'text-yellow-600' : 'text-green-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">流程设计器</h1>
            {currentFlow && (
              <div className="text-sm text-gray-600">
                当前流程: <span className="font-medium">{currentFlow.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleNewFlow}
              className="btn-primary"
              disabled={isRunning}
            >
              新建流程
            </button>
            <button
              onClick={handleLoadFlow}
              className="btn-secondary"
              disabled={isRunning}
            >
              打开流程
            </button>
            <button
              onClick={handleSaveFlow}
              className="btn-secondary"
              disabled={isRunning}
            >
              保存流程
            </button>
            <button
              onClick={handleExportFlow}
              className="btn-secondary"
              disabled={isRunning || !currentFlow}
            >
              导出流程
            </button>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={handleStartFlow}
              className="btn-success"
              disabled={isRunning || !currentFlow || currentFlow.nodes.length === 0}
            >
              运行流程
            </button>
            <button
              onClick={handlePauseFlow}
              className="btn-warning"
              disabled={!isRunning || isPaused}
            >
              暂停流程
            </button>
            <button
              onClick={handleResumeFlow}
              className="btn-success"
              disabled={!isRunning || !isPaused}
            >
              恢复流程
            </button>
            <button
              onClick={handleStopFlow}
              className="btn-danger"
              disabled={!isRunning}
            >
              停止流程
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧节点库 */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <NodeLibrary onNodeDragStart={handleNodeDragStart} />
        </div>

        {/* 中间画布区域 */}
        <div className="flex-1 bg-gray-50">
          <FlowCanvas
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeSelect={handleNodeSelect}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
          />
        </div>

        {/* 右侧属性面板 */}
        <div className="w-80 bg-white border-l border-gray-200">
          <NodeProperties
            selectedNode={selectedNode}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
          />
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">流程状态:</span>
              <span className={`text-sm font-medium ${getFlowStatusColor()}`}>
                {getFlowStatus()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">节点数量:</span>
              <span className="text-sm font-medium text-gray-900">
                {currentFlow?.nodes.length || 0}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">连接数量:</span>
              <span className="text-sm font-medium text-gray-900">
                {currentFlow?.edges.length || 0}
              </span>
            </div>
          </div>
          
          {currentFlow && (
            <div className="text-xs text-gray-500">
              最后更新: {new Date(currentFlow.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowDesigner;
