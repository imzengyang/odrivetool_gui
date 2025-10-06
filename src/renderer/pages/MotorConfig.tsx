import React from 'react';

const MotorConfig: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">电机配置</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">电机参数</h2>
            <p className="card-description">配置电机的基本参数</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">极对数</label>
              <input type="number" className="input" placeholder="7" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kv 值</label>
              <input type="number" className="input" placeholder="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电阻 (Ω)</label>
              <input type="number" className="input" placeholder="0.1" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电感 (H)</label>
              <input type="number" className="input" placeholder="0.0001" step="0.00001" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">编码器配置</h2>
            <p className="card-description">配置编码器参数</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">模式</label>
              <select className="input">
                <option value="incremental">增量式</option>
                <option value="absolute">绝对式</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPR</label>
              <input type="number" className="input" placeholder="8192" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">带宽 (Hz)</label>
              <input type="number" className="input" placeholder="1000" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-4">
        <button className="btn-primary">保存配置</button>
        <button className="btn-secondary">重置</button>
        <button className="btn-warning">电机校准</button>
        <button className="btn-warning">编码器校准</button>
      </div>
    </div>
  );
};

export default MotorConfig;
