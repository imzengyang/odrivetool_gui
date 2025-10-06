import React from 'react';
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
  Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
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

  const recentActivities = [
    { time: '10:45', action: '设备连接成功', status: 'success' },
    { time: '10:42', action: '电机配置更新', status: 'info' },
    { time: '10:38', action: '流程执行完成', status: 'success' },
    { time: '10:35', action: '系统自检通过', status: 'success' }
  ];

  const quickActions = [
    { title: '设备扫描', icon: <Search className="w-5 h-5" />, color: 'blue', description: '扫描可用设备' },
    { title: '电机控制', icon: <Gamepad2 className="w-5 h-5" />, color: 'green', description: '快速控制面板' },
    { title: '数据导出', icon: <BarChart3 className="w-5 h-5" />, color: 'purple', description: '导出运行数据' },
    { title: '系统设置', icon: <Settings className="w-5 h-5" />, color: 'gray', description: '配置系统参数' }
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
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-sm">
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
              {new Date().toLocaleTimeString('zh-CN')}
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 - macOS风格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-5 hover:bg-white/90 transition-all duration-200">
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
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ${colors.icon} opacity-80`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 主要内容区域 - macOS风格 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 快速操作 */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
            <h2 className="text-base font-semibold text-gray-800 mb-3">快速操作</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const colors = getColorClasses(action.color);
                return (
                  <button
                    key={index}
                    className={`p-4 rounded-lg border ${colors.border} ${colors.bg} hover:bg-white/90 hover:shadow-sm transition-all duration-200 group`}
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
        </div>

        {/* 最近活动 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">最近活动</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            查看全部活动 →
          </button>
        </div>
      </div>

      {/* 系统状态面板 - macOS风格 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">系统状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center">
              <Cpu className="w-8 h-8 text-green-600" />
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-800">85%</span>
            </div>
            <p className="text-sm font-medium text-gray-800">CPU 使用率</p>
            <p className="text-xs text-gray-400">正常范围</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-800">60%</span>
            </div>
            <p className="text-sm font-medium text-gray-800">内存使用</p>
            <p className="text-xs text-gray-400">4.8GB / 8GB</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-orange-50 rounded-full flex items-center justify-center">
              <HardDrive className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-800">30%</span>
            </div>
            <p className="text-sm font-medium text-gray-800">磁盘使用</p>
            <p className="text-xs text-gray-400">45GB / 150GB</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
