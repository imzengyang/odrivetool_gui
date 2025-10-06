import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Plug, 
  Settings, 
  Gamepad2, 
  Activity, 
  RotateCw, 
  Wrench,
  Bell,
  Terminal 
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '仪表板', icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/device', label: '设备管理', icon: <Plug className="w-4 h-4" /> },
    { path: '/motor-config', label: '电机配置', icon: <Settings className="w-4 h-4" /> },
    { path: '/motor-control', label: '电机控制', icon: <Gamepad2 className="w-4 h-4" /> },
    { path: '/telemetry', label: '实时监控', icon: <Activity className="w-4 h-4" /> },
    { path: '/flow', label: '流程设计', icon: <RotateCw className="w-4 h-4" /> },
    { path: '/command-center', label: '命令中心', icon: <Terminal className="w-4 h-4" /> },
    { path: '/settings', label: '设置', icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 - macOS风格 */}
      <div className="min-w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col">
        {/* 应用标题 - 简洁设计 */}
        <div className="px-6 py-5 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">OD</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">ODrive GUI</h1>
              <p className="text-xs text-gray-500">Control Tool</p>
            </div>
          </div>
        </div>
        
        {/* 导航菜单 - macOS风格 */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2 text-sm rounded transition-all duration-150 ${
                  location.pathname === item.path
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="mr-3 opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* 底部信息 - 简洁设计 */}
        <div className="px-4 py-3 border-t border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <div className="font-medium">v1.0.0</div>
              <div>Professional</div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* 主内容区域 - macOS风格 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 - 毛玻璃效果 */}
        <div className="h-14 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 flex items-center px-6">
          <div className="flex-1">
            <h2 className="text-base font-medium text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'ODrive GUI'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100/80 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-700">Connected</span>
            </div>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all duration-150">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* 页面内容 - 优化的间距 */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
