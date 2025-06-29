# Vertex AI 快速设置指南

## 🚀 最快5分钟配置Vertex AI

### 步骤1: 检查当前状态
当前修复已完成：
- ✅ 套餐检测问题已修复（数据库表名）
- ✅ Vertex AI代码已优化使用官方SDK
- ❌ 需要配置Google Cloud环境变量

### 步骤2: 最简配置方案

#### 方案A: 使用现有Google账户（推荐）
```bash
# 1. 创建Google Cloud项目（免费）
https://console.cloud.google.com/projectcreate

# 2. 启用Vertex AI API
https://console.cloud.google.com/apis/library/aiplatform.googleapis.com

# 3. 创建服务账户
https://console.cloud.google.com/iam-admin/serviceaccounts
- 点击"创建服务账户"
- 名称：catme-vertex-ai
- 角色：Vertex AI User

# 4. 下载密钥文件
- 点击创建的服务账户
- 选择"密钥"选项卡
- "添加密钥" -> "创建新密钥" -> JSON
- 下载文件重命名为 google-credentials.json
```

#### 方案B: 使用环境变量（生产环境）
```env
# 在 .env.local 中添加
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

### 步骤3: 验证配置

1. 将下载的密钥文件放在项目根目录，命名为 `google-credentials.json`
2. 在 `.env.local` 中添加配置：
```env
GOOGLE_CLOUD_PROJECT_ID=你的项目ID
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

3. 重启开发服务器：
```bash
npm run dev
```

4. 测试生成图片，查看控制台日志

### 步骤4: 故障排除

#### 错误1: "项目ID未配置"
```
解决：确保 .env.local 文件中有 GOOGLE_CLOUD_PROJECT_ID
```

#### 错误2: "认证失败"
```
解决：检查 google-credentials.json 文件路径和权限
```

#### 错误3: "API未启用"
```
解决：在Google Cloud Console启用Vertex AI API
https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
```

### 临时降级方案

如果Vertex AI仍有问题，系统会自动降级到代理API：
- 所有用户都使用Gemini反向代理
- 不影响基本功能
- 稍后可以重新配置Vertex AI

### 成本说明

- Google Cloud新用户有$300免费额度
- Vertex AI Imagen每张图片约$0.04
- 月度估算：500张图片 = $20

### 快速检查命令

```bash
# 检查环境变量
echo $GOOGLE_CLOUD_PROJECT_ID

# 检查凭据文件
ls -la google-credentials.json

# 检查API启用状态
gcloud services list --enabled --filter="aiplatform"
```

## 🎯 当前状态

✅ **已修复**: 套餐检测错误，付费用户现在会尝试使用Vertex AI
⚠️ **待配置**: Google Cloud环境变量和认证
🔄 **自动降级**: Vertex AI失败时自动使用代理API

配置完成后，Standard/Super用户将享受高质量的Vertex AI图片生成服务！ 