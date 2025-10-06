import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DeviceManager from './pages/DeviceManager';
import MotorConfig from './pages/MotorConfig';
import MotorControl from './pages/MotorControl';
import Telemetry from './pages/Telemetry';
import FlowDesigner from './pages/FlowDesigner';
import Settings from './pages/Settings';
import { useDeviceStore } from './stores/deviceStore';
import { useTelemetryStore } from './stores/telemetryStore';
import { useFlowStore } from './stores/flowStore';
import { useLogStore } from './stores/logStore';

function App() {
  const [isReady, setIsReady] = useState(false);
  const deviceStore = useDeviceStore();
  const telemetryStore = useTelemetryStore();
  const flowStore = useFlowStore();
  const logStore = useLogStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('开始初始化应用...');
        
        // 检查 electronAPI 是否可用
        if (!window.electronAPI) {
          console.warn('electronAPI 不可用，使用模拟数据');
          setIsReady(true);
          return;
        }

        // 初始化各个 store
        console.log('初始化 stores...');
        await Promise.all([
          deviceStore.initialize(),
          telemetryStore.initialize(),
          flowStore.initialize(),
          logStore.initialize()
        ]);

        // 设置全局事件监听
        console.log('设置事件监听器...');
        setupGlobalEventListeners();

        console.log('应用初始化完成');
        setIsReady(true);
      } catch (error) {
        console.error('应用初始化失败:', error);
        // 即使初始化失败，也要显示应用
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  const setupGlobalEventListeners = () => {
    // 监听设备连接状态变化
    if (window.electronAPI) {
      window.electronAPI.onDevicesScanned((devices) => {
        deviceStore.setDevices(devices);
      });

      window.electronAPI.onDeviceConnected((device) => {
        deviceStore.setConnectedDevice(device);
        logStore.addLog('info', `设备已连接: ${device.name}`);
      });

      window.electronAPI.onDeviceDisconnected(() => {
        deviceStore.setConnectedDevice(null);
        telemetryStore.stopTelemetry();
        logStore.addLog('info', '设备已断开连接');
      });

      window.electronAPI.onTelemetryData((data) => {
        telemetryStore.addTelemetryData(data);
      });

      window.electronAPI.onFlowUpdate((update) => {
        flowStore.updateFlowState(update);
      });

      window.electronAPI.onEmergencyStop(() => {
        logStore.addLog('warn', '紧急停止已触发');
        flowStore.stopFlow();
      });

      // 菜单事件
      window.electronAPI.onMenuNewFlow(() => {
        flowStore.createNewFlow();
      });

      window.electronAPI.onMenuOpenFlow(() => {
        // 触发打开流程对话框
        document.getElementById('open-flow-input')?.click();
      });

      window.electronAPI.onMenuSaveFlow(() => {
        flowStore.saveCurrentFlow();
      });

      window.electronAPI.onMenuExportConfig(() => {
        // 触发导出配置对话框
        deviceStore.exportConfiguration();
      });

      window.electronAPI.onMenuImportConfig(() => {
        // 触发导入配置对话框
        document.getElementById('import-config-input')?.click();
      });

      window.electronAPI.onMenuConnectDevice(() => {
        // 触发连接设备对话框
        deviceStore.showConnectDialog();
      });
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          {/* 应用Logo - macOS风格 */}
          <div className="w-16 h-16 bg-white rounded flex items-center justify-center shadow-lg mx-auto mb-8">
            <span className="text-2xl font-bold text-blue-600">OD</span>
          </div>
          
          {/* 加载动画 - 简洁风格 */}
          <div className="relative w-12 h-12 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-gray-300 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          
          {/* 加载文字 */}
          <h1 className="text-xl font-semibold text-gray-800 mb-2">ODrive GUI</h1>
          <p className="text-gray-500 text-sm mb-8">专业电机控制工具</p>
          
          {/* 状态文字 */}
          <p className="text-gray-400 text-sm">正在初始化...</p>
          
          {/* 版本信息 */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-gray-400 text-xs">v1.0.0 Professional</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/device" element={<DeviceManager />} />
        <Route path="/motor-config" element={<MotorConfig />} />
        <Route path="/motor-control" element={<MotorControl />} />
        <Route path="/telemetry" element={<Telemetry />} />
        <Route path="/flow" element={<FlowDesigner />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      
      {/* 隐藏的文件输入 */}
      <input
        id="open-flow-input"
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            flowStore.loadFlowFromFile(file);
          }
        }}
      />
      
      <input
        id="import-config-input"
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            deviceStore.importConfiguration(file);
          }
        }}
      />
    </Layout>
  );
}

export default App;
