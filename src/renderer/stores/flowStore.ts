import create from 'zustand';
import type { FlowDefinition } from '../../shared/types';

interface FlowStore {
  currentFlow: FlowDefinition | null;
  flows: FlowDefinition[];
  isRunning: boolean;
  isPaused: boolean;
  currentNodeId: string | null;
  
  // Actions
  setCurrentFlow: (flow: FlowDefinition | null) => void;
  setFlows: (flows: FlowDefinition[]) => void;
  setRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setCurrentNodeId: (nodeId: string | null) => void;
  
  // Methods
  initialize: () => Promise<void>;
  createNewFlow: () => void;
  loadFlowFromFile: (file: File) => void;
  saveCurrentFlow: () => void;
  startFlow: () => Promise<void>;
  pauseFlow: () => Promise<void>;
  resumeFlow: () => Promise<void>;
  stopFlow: () => Promise<void>;
  updateFlowState: (update: any) => void;
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  currentFlow: null,
  flows: [],
  isRunning: false,
  isPaused: false,
  currentNodeId: null,
  
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  setFlows: (flows) => set({ flows }),
  setRunning: (running) => set({ isRunning: running }),
  setPaused: (paused) => set({ isPaused: paused }),
  setCurrentNodeId: (nodeId) => set({ currentNodeId: nodeId }),
  
  initialize: async () => {
    try {
      // 初始化逻辑
    } catch (error) {
      console.error('Flow store initialization failed:', error);
    }
  },
  
  createNewFlow: () => {
    const newFlow: FlowDefinition = {
      id: Date.now().toString(),
      name: '新流程',
      description: '',
      nodes: [],
      edges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ currentFlow: newFlow });
  },
  
  loadFlowFromFile: (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target?.result as string);
        set({ currentFlow: flowData });
        console.log('Flow loaded successfully:', flowData.name);
      } catch (error) {
        console.error('Failed to load flow file:', error);
      }
    };
    reader.readAsText(file);
  },
  
  saveCurrentFlow: () => {
    const { currentFlow } = get();
    if (currentFlow) {
      const dataStr = JSON.stringify(currentFlow, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentFlow.name || 'flow'}.json`;
      link.click();
      URL.revokeObjectURL(url);
      console.log('Flow saved successfully:', currentFlow.name);
    }
  },
  
  startFlow: async () => {
    const { currentFlow } = get();
    if (!currentFlow) return;
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.flowStart(currentFlow);
        set({ isRunning: true, isPaused: false });
      }
    } catch (error) {
      console.error('Start flow failed:', error);
    }
  },
  
  pauseFlow: async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.flowPause();
        set({ isPaused: true });
      }
    } catch (error) {
      console.error('Pause flow failed:', error);
    }
  },
  
  resumeFlow: async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.flowResume();
        set({ isPaused: false });
      }
    } catch (error) {
      console.error('Resume flow failed:', error);
    }
  },
  
  stopFlow: async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.flowStop();
        set({ isRunning: false, isPaused: false, currentNodeId: null });
      }
    } catch (error) {
      console.error('Stop flow failed:', error);
    }
  },
  
  updateFlowState: (update) => {
    // 更新流程状态逻辑
    console.log('Update flow state:', update);
  },
}));
