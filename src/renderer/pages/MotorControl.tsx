import React from 'react';

const MotorControl: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">电机控制</h1>
      
      <div className="mb-6">
        <button className="emergency-stop">紧急停止</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">控制模式</h2>
            <p className="card-description">选择电机控制模式</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">控制模式</label>
              <select className="input">
                <option value="idle">空闲</option>
                <option value="position">位置控制</option>
                <option value="velocity">速度控制</option>
                <option value="current">电流控制</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">启用控制</label>
              <button className="btn-success">启用</button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">控制参数</h2>
            <p className="card-description">设置控制参数</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">位置设定值</label>
              <input type="range" className="slider" min="-100" max="100" />
              <div className="text-sm text-gray-600 mt-1">0</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">速度设定值</label>
              <input type="range" className="slider" min="-1000" max="1000" />
              <div className="text-sm text-gray-600 mt-1">0 rad/s</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电流设定值</label>
              <input type="range" className="slider" min="-10" max="10" />
              <div className="text-sm text-gray-600 mt-1">0 A</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="data-card">
          <div className="data-card-value">0.00</div>
          <div className="data-card-label">当前位置 (rad)</div>
        </div>
        <div className="data-card">
          <div className="data-card-value">0.00</div>
          <div className="data-card-label">当前速度 (rad/s)</div>
        </div>
        <div className="data-card">
          <div className="data-card-value">0.00</div>
          <div className="data-card-label">当前电流 (A)</div>
        </div>
      </div>
    </div>
  );
};

export default MotorControl;
