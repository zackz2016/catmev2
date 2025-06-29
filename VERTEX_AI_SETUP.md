# Google Cloud Vertex AI Imagen 设置指南

本文档介绍如何设置Google Cloud Vertex AI Imagen API，为standard和super套餐用户提供高质量的图片生成服务。

## 前置条件

1. 拥有Google Cloud Platform (GCP) 账户
2. 已启用计费功能的GCP项目
3. 已安装Google Cloud CLI (可选，但推荐)
4. **本地开发环境**：如需通过VPN访问Google服务，请参考 [VPN代理配置](#vpn代理配置本地开发) 部分

## VPN代理配置（本地开发）

如果您的本地环境无法直接访问Google服务，需要通过VPN代理访问，请按照以下步骤配置：

### 配置HTTP代理环境变量

在您的 `.env.local` 文件中添加以下代理配置：

```env
# HTTP 代理配置 (VPN)
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
NO_PROXY=localhost,127.0.0.1,::1,.local
```

### 代理配置说明

- **HTTP_PROXY**: HTTP请求使用的代理地址
- **HTTPS_PROXY**: HTTPS请求使用的代理地址（Google API使用HTTPS）
- **NO_PROXY**: 不使用代理的地址列表，通常包括本地地址

### 常见代理端口

| VPN软件 | 默认代理端口 | 配置示例 |
|---------|-------------|----------|
| Clash | 7890 | `http://127.0.0.1:7890` |
| V2rayN | 10809 | `http://127.0.0.1:10809` |
| Shadowsocks | 1080 | `http://127.0.0.1:1080` |
| 自定义 | 您的端口 | `http://127.0.0.1:YOUR_PORT` |

### 验证代理配置

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **检查控制台日志**：
   ```bash
   # 应该看到类似输出
   🔍 Vertex AI 可用性检查通过
   🎨 Vertex AI: 开始生成图片...
   ✅ Vertex AI 生成成功
   ```

3. **测试图片生成**：
   - 访问 `http://localhost:3000`
   - 使用付费账户生成图片
   - 检查响应中的 `apiUsed` 字段是否为 `vertex-ai`

### 代理故障排除

#### 1. 代理连接失败
```
Error: Failed to connect to proxy
```
**解决方案：**
- 确认VPN软件正在运行
- 检查代理端口是否正确
- 验证代理地址是否可访问

#### 2. 认证通过但API调用失败
```
Error: timeout of 30000ms exceeded
```
**解决方案：**
- 检查代理是否支持HTTPS
- 尝试增加超时时间
- 确认VPN节点可以访问Google服务

#### 3. 部分请求走代理，部分不走
**解决方案：**
- 确保 `HTTPS_PROXY` 配置正确
- 检查 `NO_PROXY` 配置是否过于宽泛
- 重启开发服务器使环境变量生效

## 步骤1：创建和配置GCP项目

### 1.1 创建新项目或选择现有项目
```bash
# 创建新项目
gcloud projects create your-project-id --name="CatMe Vertex AI"

# 设置当前项目
gcloud config set project your-project-id
```

### 1.2 启用必要的API
```bash
# 启用Vertex AI API
gcloud services enable aiplatform.googleapis.com

# 启用IAM API
gcloud services enable iam.googleapis.com

# 启用Cloud Resource Manager API
gcloud services enable cloudresourcemanager.googleapis.com
```

## 步骤2：创建服务账户

### 2.1 创建服务账户
```bash
gcloud iam service-accounts create catme-vertex-ai \
    --description="Service account for CatMe Vertex AI operations" \
    --display-name="CatMe Vertex AI"
```

### 2.2 分配必要权限
```bash
# 分配Vertex AI用户权限
gcloud projects add-iam-policy-binding your-project-id \
    --member="serviceAccount:catme-vertex-ai@your-project-id.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# 分配ML开发者权限（可选，用于更高级的功能）
gcloud projects add-iam-policy-binding your-project-id \
    --member="serviceAccount:catme-vertex-ai@your-project-id.iam.gserviceaccount.com" \
    --role="roles/ml.developer"
```

### 2.3 生成服务账户密钥
```bash
gcloud iam service-accounts keys create catme-vertex-ai-key.json \
    --iam-account=catme-vertex-ai@your-project-id.iam.gserviceaccount.com
```

## 步骤3：配置环境变量

在您的 `.env.local` 文件中添加以下配置：

```env
# Google Cloud Vertex AI 配置
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# 方法1：使用服务账户密钥文件（开发环境推荐）
GOOGLE_APPLICATION_CREDENTIALS=./path/to/catme-vertex-ai-key.json

# 方法2：直接使用环境变量（生产环境推荐）
GOOGLE_CLOUD_CLIENT_EMAIL=catme-vertex-ai@your-project-id.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 步骤4：验证配置

运行以下代码验证Vertex AI连接：

```bash
# 在项目根目录运行
npm run dev

# 访问 http://localhost:3000 并尝试生成图片
# 检查控制台日志是否有Vertex AI相关信息
```

## 支持的地区

Vertex AI Imagen 3.0当前支持的地区：
- `us-central1` (推荐)
- `us-east4`
- `us-west1`
- `europe-west4`
- `asia-northeast1`

## 定价信息

### Imagen 3.0 定价（截至2025年）
- 标准质量图片：$0.04 每张
- 高质量图片：$0.08 每张
- 1024x1024分辨率

### 估算月度成本
- Standard Plan: 假设500张图片/月 = $20-40
- Super Plan: 假设1000张图片/月 = $40-80

## 故障排除

### 常见错误及解决方案

#### 1. 认证错误
```
Error: Failed to authenticate with Google Cloud
```
**解决方案：**
- 检查服务账户密钥是否正确配置
- 确认环境变量名称拼写正确
- 验证服务账户权限

#### 2. API未启用错误
```
Error: API not enabled
```
**解决方案：**
- 确保已启用Vertex AI API
- 检查项目ID是否正确

#### 3. 配额超限错误
```
Error: Quota exceeded
```
**解决方案：**
- 检查Google Cloud配额限制
- 考虑请求增加配额
- 实现适当的重试机制

#### 4. 地区不支持错误
```
Error: Location not supported
```
**解决方案：**
- 使用支持的地区（建议us-central1）
- 更新环境变量中的GOOGLE_CLOUD_LOCATION

## 安全最佳实践

1. **密钥管理**
   - 不要将服务账户密钥提交到版本控制
   - 使用GitHub Secrets或其他密钥管理服务
   - 定期轮换密钥

2. **权限最小化**
   - 仅分配必要的IAM权限
   - 定期审查和清理不需要的权限

3. **监控和审计**
   - 启用Cloud Audit Logs
   - 监控API使用情况和成本
   - 设置预算警报

## 生产部署注意事项

1. **环境变量配置**
   - 在Vercel/Netlify等平台中正确设置环境变量
   - 使用平台的密钥管理功能

2. **错误处理**
   - 实现适当的错误处理和重试机制
   - 在Vertex AI不可用时回退到代理API

3. **成本控制**
   - 实现请求频率限制
   - 监控月度使用量
   - 设置成本警报

## 支持和帮助

- [Google Cloud Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)
- [Imagen API 参考](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- [定价详情](https://cloud.google.com/vertex-ai/pricing)
- [支持论坛](https://stackoverflow.com/questions/tagged/google-cloud-vertex-ai) 