# 电商评论分析系统

一个基于Next.js的全栈电商评论分析系统，集成Python爬虫获取淘宝/天猫商品评论，并进行情感分析和数据统计。

## 功能特性

- 🕷️ **评论爬取**: 集成Python爬虫，自动抓取商品评论
- 🧠 **情感分析**: 智能分析评论情感倾向（正面/负面/中性）
- 📊 **数据可视化**: 直观展示情感分布、评分统计等数据
- 🔍 **关键词提取**: 自动提取高频关键词，了解用户关注点
- 📱 **响应式设计**: 支持桌面和移动端访问

## 技术栈

### 前端
- **Next.js 15**: React全栈框架
- **TypeScript**: 类型安全的JavaScript
- **Tailwind CSS**: 现代CSS框架
- **Chart.js**: 数据可视化图表库
- **Lucide React**: 现代图标库

### 后端
- **Next.js API Routes**: 服务端API
- **Python 3**: 爬虫脚本
- **Requests**: HTTP请求库

## 快速开始

### 1. 安装依赖

```bash
# 安装Node.js依赖
pnpm install

# 安装Python依赖
cd ../pachong
pip3 install -r requirements.txt
```

### 2. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

### 3. 使用说明

1. **获取商品ID**:
   - 访问淘宝/天猫商品页面
   - 从URL中提取商品ID（如：`https://detail.tmall.com/item.htm?id=969932796642` 中的 `969932796642`）

2. **更新Cookies**（如需要）:
   - 打开浏览器开发者工具
   - 访问商品评论页面
   - 复制评论API请求的Cookie
   - 更新 `../pachong/spider.py` 中的cookies

3. **分析评论**:
   - 在输入框中输入商品ID
   - 点击"加载现有"查看已爬取的数据
   - 点击"重新爬取"获取最新评论数据

## API接口

### 爬取评论
```
POST /api/crawl
{
  "productId": "969932796642",
  "maxPages": 3
}
```

### 获取评论
```
GET /api/crawl?productId=969932796642
```

### 情感分析
```
POST /api/sentiment
{
  "comments": [...]
}
```

## 数据结构

### 评论数据
```typescript
interface Comment {
  user_nick: string;      // 用户昵称
  content: string;        // 评论内容
  rating: number;         // 评分 (1-10)
  date: string;           // 评论日期
  useful_count: number;   // 点赞数
  reply: string;          // 商家回复
  sku_info: string;       // 商品规格
  pics: string[];         // 评论图片
}
```

### 情感分析结果
```typescript
interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;          // 情感得分 (0-1)
  confidence: number;     // 置信度 (0-1)
}
```

## 项目结构

```
my-next-app/
├── app/
│   ├── api/                    # API路由
│   │   ├── crawl/             # 爬虫API
│   │   └── sentiment/         # 情感分析API
│   ├── components/            # React组件
│   │   └── CommentAnalytics.tsx
│   ├── types/                 # TypeScript类型定义
│   ├── utils/                 # 工具函数
│   └── page.tsx              # 主页面
├── pachong/                   # Python爬虫
│   ├── spider.py             # 爬虫主程序
│   ├── output/               # 爬取数据输出目录
│   └── requirements.txt      # Python依赖
└── README.md
```

## 开发指南

### 添加新的情感分析算法

1. 修改 `app/api/sentiment/route.ts` 中的 `analyzeSentiment` 函数
2. 可以集成第三方情感分析API或机器学习模型
3. 调整情感词典和权重

### 扩展数据可视化

1. 在 `app/components/CommentAnalytics.tsx` 中添加新的图表
2. 使用Chart.js支持的其他图表类型
3. 添加更多统计维度

### 优化爬虫

1. 修改 `pachong/spider.py` 中的爬取逻辑
2. 添加更多反爬虫措施
3. 支持更多电商平台

## 注意事项

- 请遵守网站的robots.txt和使用条款
- 合理控制爬取频率，避免对服务器造成压力
- 定期更新cookies以保持爬虫正常工作
- 仅用于学习和研究目的

## 许可证

MIT License