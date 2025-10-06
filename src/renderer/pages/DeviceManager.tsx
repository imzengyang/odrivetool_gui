import React, { useState } from 'react';

const DeviceManager: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // 模拟设备数据
  const devices = [
    {
      id: 'odrive-001',
      name: 'ODrive v3.6',
      serial: '0x12345678',
      firmware: '0.5.6',
      status: 'connected',
      voltage: '24.2V',
      current: '0.5A',
      temperature: '35°C'
    },
    {
      id: 'odrive-002',
      name: 'ODrive v3.6',
      serial: '0x87654321',
      firmware: '0.5.4',
      status: 'available',
      voltage: '--',
      current: '--',
      temperature: '--'
    }
  ];

  const handleScan = () => {
    setIsScanning(true);
    // 模拟扫描过程
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'available':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '已连接';
      case 'available':
        return '可用';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">设备管理</h1>
          <p className="text-gray-600 mt-1">扫描和管理连接的 ODrive 设备</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
              isScanning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            }`}
          >
            {isScanning ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>扫描中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🔍</span>
                <span>扫描设备</span>
              </div>
            )}
          </button>
          <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-center space-x-2">
              <span>🔄</span>
              <span>刷新</span>
            </div>
          </button>
        </div>
      </div>

      {/* 设备统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">📡</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">总设备数</p>
              <p className="text-xl font-bold text-gray-900">{devices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">已连接</p>
              <p className="text-xl font-bold text-gray-900">
                {devices.filter(d => d.status === 'connected').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600">⚡</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">平均电压</p>
              <p className="text-xl font-bold text-gray-900">24.2V</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-purple-600">🌡️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">平均温度</p>
              <p className="text-xl font-bold text-gray-900">35°C</p>
            </div>
          </div>
        </div>
      </div>

      {/* 设备列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">设备列表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  设备信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  序列号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  固件版本
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  电压
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  电流
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  温度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device) => (
                <tr
                  key={device.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                    selectedDevice === device.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">OD</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{device.name}</div>
                        <div className="text-sm text-gray-500">ID: {device.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{device.serial}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{device.firmware}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(device.status)}`}>
                      {getStatusText(device.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{device.voltage}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{device.current}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{device.temperature}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {device.status === 'connected' ? (
                        <>
                          <button className="text-blue-600 hover:text-blue-900 font-medium">
                            配置
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="text-red-600 hover:text-red-900 font-medium">
                            断开
                          </button>
                        </>
                      ) : (
                        <button className="text-green-600 hover:text-green-900 font-medium">
                          连接
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 设备详情面板 */}
      {selectedDevice && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">设备详情</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">基本信息</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">设备型号:</span>
                  <span className="text-sm font-medium text-gray-900">ODrive v3.6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">序列号:</span>
                  <span className="text-sm font-medium text-gray-900">0x12345678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">固件版本:</span>
                  <span className="text-sm font-medium text-gray-900">0.5.6</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">实时数据</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">总线电压:</span>
                  <span className="text-sm font-medium text-gray-900">24.2V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">电流消耗:</span>
                  <span className="text-sm font-medium text-gray-900">0.5A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">温度:</span>
                  <span className="text-sm font-medium text-gray-900">35°C</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">快速操作</h4>
              <div className="space-y-2">
                <button className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-150 shadow-sm hover:shadow-md">
                  设备配置
                </button>
                <button className="w-full px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-150 shadow-sm hover:shadow-md">
                  电机校准
                </button>
                <button className="w-full px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-150 shadow-sm hover:shadow-md">
                  查看日志
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManager;
