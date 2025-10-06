import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">设置</h1>
      
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">通用设置</h2>
            <p className="card-description">应用的基本配置</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">语言</label>
              <select className="input">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主题</label>
              <select className="input">
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">开机自动启动</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">设备设置</h2>
            <p className="card-description">ODrive 设备连接配置</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">波特率</label>
              <select className="input">
                <option value="115200">115200</option>
                <option value="9600">9600</option>
                <option value="38400">38400</option>
                <option value="57600">57600</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">连接超时 (秒)</label>
              <input type="number" className="input" placeholder="5" min="1" max="30" />
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">自动重连</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">数据设置</h2>
            <p className="card-description">遥测和数据记录配置</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">采样频率 (Hz)</label>
              <input type="number" className="input" placeholder="50" min="1" max="1000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数据缓冲时间 (秒)</label>
              <input type="number" className="input" placeholder="60" min="10" max="300" />
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">自动保存数据</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数据保存路径</label>
              <div className="flex space-x-2">
                <input type="text" className="input flex-1" placeholder="./data" />
                <button className="btn-secondary">浏览</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">安全设置</h2>
            <p className="card-description">安全限制和保护配置</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">启用紧急停止快捷键</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大电压限制 (V)</label>
              <input type="number" className="input" placeholder="24" min="0" max="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大电流限制 (A)</label>
              <input type="number" className="input" placeholder="10" min="0" max="50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大速度限制 (rad/s)</label>
              <input type="number" className="input" placeholder="100" min="0" max="1000" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-4">
        <button className="btn-primary">保存设置</button>
        <button className="btn-secondary">重置默认</button>
        <button className="btn-secondary">导出配置</button>
        <button className="btn-secondary">导入配置</button>
      </div>
    </div>
  );
};

export default Settings;
