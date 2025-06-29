# VPN代理配置快速指南

本指南帮助您在本地开发环境中配置VPN代理，使Node.js应用能够通过代理访问Google Cloud服务。

## 🔄 代理方案说明

本项目支持两种代理配置方案：

### 方案1：环境变量代理（默认尝试）
- 通过设置 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量
- Node.js自动识别并使用代理
- 配置简单，但兼容性可能有限

### 方案2：全局代理Agent（当前实施）⭐
- 使用 `https-proxy-agent` 包在应用层配置代理
- 在模块加载时设置全局代理Agent
- 兼容性更好，专门针对Google Cloud SDK优化

如果方案1不生效，项目会自动使用方案2。

## 📦 方案2依赖要求

方案2需要额外的npm包支持：

```bash
# 安装代理Agent包（已预装）
npm install https-proxy-agent http-proxy-agent
```

这些包已经添加到项目依赖中，无需手动安装。

## 🚀 快速配置（3分钟完成）

### 步骤1：确认代理信息

确认您的VPN代理设置：
- **代理地址**：通常是 `127.0.0.1` 或 `localhost`
- **代理端口**：常见端口见下表

| VPN软件 | 默认HTTP代理端口 |
|---------|-----------------|
| **Clash** | 7890 |
| **V2rayN** | 10809 |
| **Shadowsocks** | 1080 |
| **Surge** | 6152 |
| **Quantumult X** | 9993 |

### 步骤2：创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```env
# HTTP 代理配置 (VPN)
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
NO_PROXY=localhost,127.0.0.1,::1,.local

# 其他环境变量...
# 复制 env.example 中的其他配置并填入实际值
```

### 步骤3：验证配置

```bash
# 1. 测试代理配置（方案2）
node test-proxy.js

# 2. 启动开发服务器
npm run dev

# 3. 观察控制台输出
# 方案2应该看到：
# 🔗 配置全局代理支持...
# ✅ HTTPS全局代理已配置: http://127.0.0.1:7890
# 🔗 Vertex AI 将通过全局代理连接Google服务
# 🔍 Vertex AI 可用性检查通过
```

## 🔧 高级配置

### 自定义代理端口

如果您使用自定义端口，请修改代理地址：

```env
# 示例：使用端口8080
HTTP_PROXY=http://127.0.0.1:8080
HTTPS_PROXY=http://127.0.0.1:8080
```

### 代理认证（如需要）

如果代理需要用户名密码：

```env
HTTP_PROXY=http://username:password@127.0.0.1:7890
HTTPS_PROXY=http://username:password@127.0.0.1:7890
```

### 排除本地地址

`NO_PROXY` 配置哪些地址不使用代理：

```env
# 标准配置：排除本地地址
NO_PROXY=localhost,127.0.0.1,::1,.local

# 扩展配置：排除内网地址
NO_PROXY=localhost,127.0.0.1,::1,.local,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
```

## 🔍 故障排除

### 问题1：代理连接失败

**错误信息：**
```
Error: connect ECONNREFUSED 127.0.0.1:7890
```

**解决方案：**
1. ✅ 确认VPN软件正在运行
2. ✅ 检查代理端口是否正确
3. ✅ 在VPN软件中启用"局域网连接"或"允许来自局域网的连接"

### 问题2：API调用超时

**错误信息：**
```
Error: timeout of 30000ms exceeded
```

**解决方案：**
1. ✅ 确认VPN节点可以访问Google服务
2. ✅ 尝试切换不同的VPN节点
3. ✅ 检查代理是否支持HTTPS流量

### 问题3：部分请求不走代理

**现象：** 有些API正常，有些失败

**解决方案：**
1. ✅ 确保 `HTTPS_PROXY` 已配置（Google API使用HTTPS）
2. ✅ 重启开发服务器使环境变量生效
3. ✅ 检查 `NO_PROXY` 配置是否过于宽泛

### 问题4：环境变量不生效

**解决方案：**
1. ✅ 确认 `.env.local` 文件在项目根目录
2. ✅ 确认文件名正确（不是 `.env.local.txt`）
3. ✅ 重启 `npm run dev`
4. ✅ 检查变量名拼写是否正确

## 🧪 测试代理配置

### 方法1：使用curl测试

```bash
# 在命令行测试代理连接
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
curl -I https://www.google.com
```

### 方法2：Node.js测试脚本

创建 `test-proxy.js`：

```javascript
const https = require('https');

// 测试Google连接
const options = {
  hostname: 'www.google.com',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('✅ 代理连接成功！状态码:', res.statusCode);
});

req.on('error', (e) => {
  console.error('❌ 代理连接失败:', e.message);
});

req.end();
```

运行测试：
```bash
node test-proxy.js
```

## 📝 常见VPN软件配置

### Clash for Windows
1. 打开Clash → 设置 → 网络设置
2. 确认HTTP代理端口（默认7890）
3. 启用"允许局域网连接"

### V2rayN
1. 右键系统托盘图标 → 参数设置
2. 查看"本地监听端口"（默认10809）
3. 确认"允许来自局域网的连接"已勾选

### Shadowsocks
1. 右键系统托盘图标 → 选项设置
2. 查看"本地端口"（默认1080）
3. 确认"允许来自局域网的连接"已启用

## 🔒 安全提醒

1. **生产环境**: 生产部署时不要包含代理配置
2. **敏感信息**: `.env.local` 已被git忽略，不会上传到代码仓库
3. **端口安全**: 确保代理端口仅本地访问，不要对外暴露

## 📚 相关文档

- [Vertex AI 完整设置指南](./VERTEX_AI_SETUP.md)
- [Node.js HTTP代理官方文档](https://nodejs.org/api/http.html#http_http_request_options_callback)
- [Google Cloud 代理配置](https://cloud.google.com/docs/authentication/external/workforce#proxy) 