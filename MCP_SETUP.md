# Supabase MCP 配置指南

本文档说明如何配置官方Supabase MCP服务器，让AI助手能够直接与Supabase项目交互。

## 准备工作

### 1. 创建Supabase个人访问令牌(PAT)

1. 访问 [Supabase控制台](https://supabase.com/dashboard)
2. 点击右上角头像 → Settings
3. 导航到 "Access Tokens" 
4. 点击 "Create new token"
5. 输入描述："Cursor MCP Server"
6. **复制令牌** (只会显示一次，请妥善保存)

### 2. 获取项目引用ID

从项目控制台URL获取：
- URL格式：`https://supabase.com/dashboard/project/XXXXXXXXX`
- 其中 `XXXXXXXXX` 就是项目引用ID

或从项目设置获取：
- 项目 → Settings → General → Reference ID

## 配置步骤

### 配置 .cursor/mcp.json

已为你创建配置文件 `.cursor/mcp.json`，请按以下步骤完成配置：

1. **替换占位符**：
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--read-only",
           "--project-ref=YOUR_ACTUAL_PROJECT_REF"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "YOUR_ACTUAL_PAT_TOKEN"
         }
       }
     }
   }
   ```

2. **配置参数说明**：
   - `--read-only`: 只读模式，防止意外的数据库写操作（推荐）
   - `--project-ref`: 限制访问到特定项目（推荐）
   - `SUPABASE_ACCESS_TOKEN`: 身份验证令牌

## 可用功能

连接成功后，AI助手将能够：

### 数据库操作
- 列出数据库表结构
- 执行SQL查询（只读模式）
- 查看数据库扩展和迁移
- 生成TypeScript类型定义

### 项目管理
- 获取项目配置信息
- 查看项目日志和监控数据
- 获取API密钥和项目URL

### 开发支持
- 管理Edge Functions
- 查看存储配置
- 访问Supabase文档

## 验证连接

1. **重启Cursor**：重新启动Cursor以加载新配置
2. **检查MCP状态**：
   - 进入 Cursor Settings → MCP
   - 应该看到 "supabase" 服务器状态为绿色（活跃）
3. **测试功能**：询问AI助手关于你的数据库结构

## 故障排除

### 常见问题

1. **连接失败**：
   - 检查PAT令牌是否正确
   - 确认项目引用ID正确
   - 验证网络连接

2. **权限错误**：
   - 确保PAT令牌有足够权限
   - 检查项目访问权限

3. **Windows用户**：
   - 如果使用Windows，可能需要修改命令前缀：
   ```json
   "command": "cmd",
   "args": ["/c", "npx", "-y", "@supabase/mcp-server-supabase@latest", ...]
   ```

## 安全注意事项

1. **保护PAT令牌**：
   - 不要将令牌提交到版本控制
   - 考虑使用环境变量存储令牌
   - 定期轮换令牌

2. **权限最小化**：
   - 使用 `--read-only` 模式
   - 使用 `--project-ref` 限制项目范围

3. **监控使用**：
   - 定期检查Supabase使用日志
   - 监控API调用频率

## 进一步配置

### 移除只读限制（谨慎使用）
如需写操作权限，移除 `--read-only` 参数：
```json
"args": [
  "-y", 
  "@supabase/mcp-server-supabase@latest",
  "--project-ref=YOUR_PROJECT_REF"
]
```

### 启用特定功能组
使用 `--features` 参数启用特定功能：
```json
"args": [
  "-y",
  "@supabase/mcp-server-supabase@latest",
  "--features=database,docs,development"
]
```

可用功能组：`account`, `database`, `debug`, `development`, `docs`, `functions`, `branching`, `storage`

## 更新记录

- **创建日期**：2025年1月
- **最后更新**：使用最新的官方Supabase MCP服务器配置
- **版本**：基于 @supabase/mcp-server-supabase@latest 