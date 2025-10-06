import React from 'react';

const Telemetry: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">实时监控</h1>
      
      <div className="mb-6 flex space-x-4">
        <button className="btn-primary">开始监控</button>
        <button className="btn-secondary">暂停</button>
        <button className="btn-secondary">清除数据</button>
        <button className="btn-secondary">导出数据</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">总线电压</h2>
            <p className="card-description">实时电压监控</p>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">图表区域</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">电机速度</h2>
            <p className="card-description">实时速度监控</p>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">图表区域</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">电流监控</h2>
            <p className="card-description">实时电流监控</p>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">图表区域</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">温度监控</h2>
            <p className="card-description">实时温度监控</p>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">图表区域</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 card">
        <div className="card-header">
          <h2 className="card-title">数据统计</h2>
          <p className="card-description">实时数据统计信息</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">0.0 V</div>
            <div className="text-sm text-gray-600">当前电压</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">0.0 rad/s</div>
            <div className="text-sm text-gray-600">当前速度</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600">0.0 A</div>
            <div className="text-sm text-gray-600">当前电流</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger-600">0.0 °C</div>
            <div className="text-sm text-gray-600">当前温度</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Telemetry;
