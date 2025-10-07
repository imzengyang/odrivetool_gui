import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  RotateCw, 
  Thermometer, 
  Search, 
  Gamepad2, 
  BarChart3, 
  Settings, 
  Plug,
  Cpu,
  HardDrive,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('zh-CN'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const stats = [
    {
      title: '设备状态',
      value: '已连接',
      icon: <Plug className="w-5 h-5" />,
      color: 'green',
      trend: '+1',
      description: 'ODrive 设备在线'
    },
    {
      title: '总线电压',
      value: '24.0V',
      icon: <Zap className="w-5 h-5" />,
      color: 'blue',
      trend: '稳定',
      description: '正常工作范围'
    },
    {
      title: '电机速度',
      value: '3000 RPM',
      icon: <RotateCw className="w-5 h-5" />,
      color: 'purple',
      trend: '+150',
      description: '当前转速'
    },
    {
      title: '系统温度',
      value: '42°C',
      icon: <Thermometer className="w-5 h-5" />,
      color: 'orange',
      trend: '正常',
      description: '温度在安全范围'
    }
  ];

  const quickActions = [
    { title: '设备连接', icon: <Plug className="w-5 h-5" />, color: 'blue', description: '连接ODrive设备', path: '/device' },
    { title: '电机控制', icon: <Gamepad2 className="w-5 h-5" />, color: 'green', description: '快速控制面板', path: '/motor-control' },
    { title: '实时监控', icon: <Activity className="w-5 h-5" />, color: 'purple', description: '查看实时数据', path: '/telemetry' },
    { title: '流程设计', icon: <BarChart3 className="w-5 h-5" />, color: 'orange', description: '设计自动化流程', path: '/flow' }
  ];

  const systemControls = [
    { 
      title: '紧急停止', 
      icon: <AlertTriangle className="w-5 h-5" />, 
      color: 'red', 
      description: '立即停止所有电机',
      action: 'emergency-stop'
    },
    { 
      title: '导出配置', 
      icon: <Download className="w-5 h-5" />, 
      color: 'blue', 
      description: '保存当前配置',
      action: 'export-config'
    },
    { 
      title: '导入配置', 
      icon: <Upload className="w-5 h-5" />, 
      color: 'green', 
      description: '加载配置文件',
      action: 'import-config'
    },
    { 
      title: '系统重置', 
      icon: <RefreshCw className="w-5 h-5" />, 
      color: 'gray', 
      description: '重启系统',
      action: 'system-reset'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      green: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'text-green-600'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: 'text-blue-600'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: 'text-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: 'text-orange-600'
      },
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: 'text-gray-600'
      }
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* 欢迎标题 - macOS风格 */}
      <div className="bg-white/70 backdrop-blur-xl rounded p-6 border border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">欢迎使用 ODrive GUI</h1>
            <p className="text-gray-500">专业电机控制工具</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">系统正常</span>
            </div>
            <div className="text-sm text-gray-400">
              {currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 - macOS风格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded border border-gray-200/50 p-5 hover:bg-white/90 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-800 mb-2">{stat.value}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{stat.description}</p>
                </div>
                <div className={`w-10 h-10 rounded ${colors.bg} flex items-center justify-center ${colors.icon} opacity-80`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 主要内容区域 - macOS风格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 快速操作 */}
        <div className="bg-white/80 backdrop-blur-sm rounded border border-gray-200/50 p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">快速操作</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const colors = getColorClasses(action.color);
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`p-4 rounded border ${colors.border} ${colors.bg} hover:bg-white/90 hover:shadow-sm transition-all duration-200 group cursor-pointer`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="group-hover:scale-105 transition-transform duration-200 opacity-80">
                        {action.icon}
                      </div>
                      <div className="text-left">
                        <h3 className={`text-sm font-medium ${colors.text}`}>{action.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
        </div>

        {/* 系统控制 */}
        <div className="bg-white/80 backdrop-blur-sm rounded border border-gray-200/50 p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">系统控制</h2>
          <div className="grid grid-cols-2 gap-3">
            {systemControls.map((control, index) => {
              const colors = getColorClasses(control.color);
              return (
                <button
                  key={index}
                  className={`p-4 rounded border ${colors.border} ${colors.bg} hover:bg-white/90 hover:shadow-sm transition-all duration-200 group ${
                    control.action === 'emergency-stop' ? 'hover:bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`group-hover:scale-105 transition-transform duration-200 opacity-80 ${
                      control.action === 'emergency-stop' ? 'text-red-600' : ''
                    }`}>
                      {control.icon}
                    </div>
                    <div className="text-left">
                      <h3 className={`text-sm font-medium ${colors.text}`}>{control.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{control.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Dashboard;
