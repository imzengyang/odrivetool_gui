# ODrive GUI - ODrive 控制桌面应用

一个基于 Electron + React + TypeScript 的跨平台桌面应用，用于 ODrive v0.5.1 固件的电机控制、配置、实时监控与流程自动化。

## 功能特性

### 🔌 设备连接与管理
- 自动检测 ODrive USB 设备
- 固件版本检查（确认 v0.5.1）
- 连接/断开控制，实时状态显示
- 设备锁定机制，仅允许单设备运行流程

### ⚙️ 电机配置
- 电机参数设置：极对数、Kv、电阻、电感
- 编码器配置：模式（增量/绝对）、CPR
- 校准操作：电机校准、编码器校准
- 配置保存/导入导出（JSON 格式）

### 🎮 电机控制
- 控制模式：位置、速度、电流/力矩
- UI 控件：滑块、输入框、启用/禁用开关
- 安全控制：紧急停止按钮（全局快捷键），限速/限流/限压保护

### 📊 实时监控与可视化
- 监控指标：总线电压、电流、转速、温度、控制状态
- Chart.js 折线图实时刷新，支持暂停/回放
- 数据管理：环形缓冲（60s 默认），CSV/JSON 导出

### 🔄 流程控制（React Flow）
- 拖拽节点构建流程
- 丰富的节点类型：连接、断开、设置参数、校准、控制、等待、条件分支、循环等
- 运行控制：运行/暂停/继续/中止
- 安全机制：运行前安全检查清单
- 流程保存为 JSON，可导入复用

### 🛡️ 安全与保护
- 软限/硬限模板系统
- 急停机制：UI 按钮+键盘快捷键
- 上电默认：设备初始为 Idle，不加载危险配置

## 技术栈

- **前端**: React 18 + TypeScript + TailwindCSS + Chart.js + React Flow
- **桌面框架**: Electron
- **通信**: Node.js + serialport（USB 串口通信）
- **构建工具**: Vite + Electron-builder

## 项目结构

```
odrivegui/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── main.ts          # 主进程入口
│   │   ├── preload.ts       # 预加载脚本
│   │   └── services/        # 主进程服务
│   │       ├── SerialPortManager.ts    # 串口管理
│   │       ├── ODriveProtocol.ts       # ODrive 协议
│   │       ├── FlowRunner.ts           # 流程运行器
│   │       └── LogService.ts           # 日志服务
│   ├── renderer/             # React 渲染进程
│   │   ├── components/       # React 组件
│   │   ├── pages/           # 页面组件
│   │   ├── stores/          # 状态管理
│   │   ├── utils/           # 工具函数
│   │   ├── App.tsx          # 应用根组件
│   │   └── main.tsx         # 渲染进程入口
│   └── shared/              # 共享类型定义
│       └── types/           # TypeScript 类型
├── docs/                    # 文档
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 开发环境设置

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Git

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd odrivegui

# 安装依赖
npm install
```

### 开发模式运行

```bash
# 启动开发服务器
npm run dev
```

这将同时启动：
- Vite 开发服务器（前端热重载）
- Electron 主进程

### 构建项目

```bash
# 构建渲染进程
npm run build:renderer

# 构建主进程
npm run build:main

# 构建整个项目
npm run build
```

### 打包发布

```bash
# 打包应用（生成安装包）
npm run dist

# 仅打包（不生成安装包）
npm run pack
```

## 主要组件说明

### 主进程服务

1. **SerialPortManager**: 串口设备管理，自动检测 ODrive 设备
2. **ODriveProtocol**: ODrive 协议解析，处理命令发送和响应解析
3. **FlowRunner**: 流程执行引擎，支持独立进程运行
4. **LogService**: 日志服务，支持多级别日志和文件导出

### 渲染进程页面

1. **Dashboard**: 仪表板，显示设备状态和关键指标
2. **DeviceManager**: 设备管理，扫描和连接 ODrive 设备
3. **MotorConfig**: 电机配置，设置电机和编码器参数
4. **MotorControl**: 电机控制，实时控制电机运动
5. **Telemetry**: 遥测监控，实时数据可视化
6. **FlowDesigner**: 流程设计器，拖拽式流程编辑
7. **Settings**: 设置页面，应用配置和偏好设置

### 状态管理

使用 Zustand 进行状态管理，包括：
- deviceStore: 设备连接状态
- telemetryStore: 遥测数据管理
- flowStore: 流程状态管理
- logStore: 日志管理

## 安全特性

### 紧急停止
- 全局快捷键：空格键 / Ctrl+空格
- UI 紧急停止按钮
- 自动切换到安全状态

### 限制保护
- 软限制：超过时提示用户确认
- 硬限制：超过时拒绝执行
- 分层限制：驱动器 → 电机类型 → 项目模板

### 通信安全
- CRC 校验确保数据完整性
- 超时和重试机制
- 错误处理和恢复

## 开发指南

### 添加新的流程节点类型

1. 在 `src/renderer/components/FlowNodes/` 中创建新节点组件
2. 在 `src/main/services/FlowWorker.ts` 中添加节点执行逻辑
3. 更新节点类型定义和注册

### 扩展 ODrive 协议

1. 在 `src/main/services/ODriveProtocol.ts` 中添加新的命令方法
2. 更新类型定义 `src/shared/types/index.ts`
3. 在渲染进程中添加相应的 UI 控件

### 自定义主题

修改 `tailwind.config.js` 中的主题配置，或在 `src/renderer/index.css` 中添加自定义样式。

## 故障排除

### 常见问题

1. **设备连接失败**
   - 检查 USB 驱动是否正确安装
   - 确认设备固件版本为 v0.5.1
   - 检查串口权限（Linux/macOS）

2. **编译错误**
   - 确保安装了所有依赖：`npm install`
   - 检查 Node.js 版本是否符合要求
   - 清除缓存：`npm run clean && npm install`

3. **打包失败**
   - 检查 Electron-builder 配置
   - 确保所有平台依赖已安装
   - 检查代码签名配置（生产环境）

### 调试模式

开发模式下，Electron 会自动打开开发者工具。也可以手动打开：
- Windows/Linux: `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

## 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至开发团队

---

**注意**: 本应用专为 ODrive v0.5.1 固件设计，使用前请确认设备固件版本正确。
