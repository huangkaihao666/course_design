# Curl解析器 & 配置管理工具

一个专门用于解析curl请求并管理爬虫配置的Web应用，可以轻松提取curl命令中的参数并生成爬虫配置。

## 🚀 快速开始

### 启动服务

```bash
cd /Users/huangkaihao/Desktop/items/homework/course_design/curl-parser
pnpm install
pnpm dev
```

服务将在 http://localhost:3001 启动

## 📋 主要功能

### 1. Curl命令解析
- **智能解析**: 自动解析curl命令中的URL、请求头、Cookies等参数
- **参数提取**: 自动识别淘宝/天猫API中的商品ID、分页参数等
- **格式化显示**: 清晰展示解析结果

### 2. 配置管理
- **保存配置**: 将解析的参数保存为配置预设
- **配置列表**: 管理多个不同商品的配置
- **导出功能**: 将配置导出为JSON文件

### 3. 爬虫集成
- **自动生成**: 根据配置自动生成专用爬虫代码
- **参数同步**: 将配置同步到现有爬虫系统
- **即开即用**: 生成的爬虫可直接运行

## 🛠️ 使用方法

### 步骤1: 获取curl命令

1. 打开浏览器，访问淘宝/天猫商品页面
2. 打开开发者工具 (F12)
3. 切换到 Network 标签
4. 刷新页面或点击评论区域
5. 找到包含 `rate.detaillist` 的请求
6. 右键点击请求，选择 "Copy as cURL"

### 步骤2: 解析curl命令

1. 访问 http://localhost:3001
2. 将复制的curl命令粘贴到输入框
3. 点击"解析Curl"按钮
4. 查看解析结果和提取的参数

### 步骤3: 保存配置

1. 输入配置名称和描述
2. 点击"保存配置"
3. 配置会保存到本地，可在"配置管理"标签查看

### 步骤4: 导出到爬虫系统

1. 在配置详情页面点击"导出"
2. 系统会自动生成专用爬虫代码
3. 更新现有爬虫的配置参数

## 📊 解析的参数

### 基本信息
- **URL**: API请求地址
- **请求方法**: GET/POST
- **商品ID**: 从data参数中提取的auctionNumId

### 请求参数
- **Headers**: 所有请求头信息
- **Cookies**: 认证和会话信息
- **API参数**: 分页、排序、筛选等参数

### 爬虫配置
```json
{
  "productId": "943751893529",
  "cookies": "t=xxx; _tb_token_=xxx; ...",
  "maxPages": 3,
  "pageSize": 20,
  "headers": {
    "user-agent": "Mozilla/5.0...",
    "referer": "https://item.taobao.com/",
    ...
  },
  "baseUrl": "https://h5api.m.taobao.com/h5/mtop.taobao.rate.detaillist.get/6.0/",
  "apiParams": {
    "auctionNumId": "943751893529",
    "pageNo": 1,
    "pageSize": 20,
    ...
  }
}
```

## 🔧 API接口

### 解析curl命令
```
POST /api/parse-curl
{
  "curlCommand": "curl 'https://...' -H '...' ..."
}
```

### 管理配置
```
GET /api/config         # 获取所有配置
POST /api/config        # 保存新配置
PUT /api/config         # 更新配置
DELETE /api/config?id=  # 删除配置
```

### 导出到爬虫
```
POST /api/export-to-spider
{
  "config": { ... }
}
```

## 📁 文件结构

```
curl-parser/
├── app/
│   ├── api/                    # API路由
│   │   ├── parse-curl/         # curl解析API
│   │   ├── config/             # 配置管理API
│   │   └── export-to-spider/   # 爬虫集成API
│   ├── components/             # React组件
│   │   └── CurlParser.tsx      # 主界面组件
│   ├── types/                  # TypeScript类型
│   └── page.tsx               # 主页面
├── data/                      # 配置数据存储
│   └── configs.json          # 保存的配置文件
└── README.md
```

## 🎯 支持的curl格式

系统支持解析以下格式的curl命令：

1. **标准格式**:
   ```bash
   curl 'https://api.example.com' -H 'header: value' -b 'cookie=value'
   ```

2. **多行格式**:
   ```bash
   curl 'https://api.example.com' \
     -H 'header1: value1' \
     -H 'header2: value2' \
     -b 'cookie1=value1; cookie2=value2'
   ```

3. **淘宝API格式**:
   ```bash
   curl 'https://h5api.m.taobao.com/h5/mtop.taobao.rate.detaillist.get/6.0/?...' \
     -H 'accept: */*' \
     -b 't=xxx; _tb_token_=xxx; ...'
   ```

## ⚡ 特性

- **智能识别**: 自动识别淘宝/天猫评论API的特殊参数
- **参数验证**: 检查必要的认证信息和API参数
- **配置持久化**: 本地保存配置，重启后不丢失
- **代码生成**: 自动生成可运行的Python爬虫代码
- **错误处理**: 完善的错误提示和异常处理

## 🔄 与评论分析系统集成

这个curl解析器可以与主评论分析系统 (my-next-app) 配合使用：

1. 使用curl解析器提取和保存配置
2. 生成的爬虫代码可直接运行获取数据
3. 评论分析系统使用爬取的数据进行情感分析

## 📝 注意事项

- Cookies有时效性，需要定期更新
- 商品ID必须存在且有评论数据
- 生成的爬虫代码包含完整的认证信息
- 请遵守网站的使用条款和爬取频率限制

## 🛡️ 安全提醒

- 不要在公共环境中暴露包含个人信息的Cookies
- 定期清理保存的配置文件
- 生成的爬虫代码包含敏感信息，请妥善保管
