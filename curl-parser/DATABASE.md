# 数据库配置说明

## 数据库信息
- **数据库名称**: `curl_parser_db`
- **用户名**: `huangkaihao`
- **密码**: `hkh618618`
- **主机**: `localhost`
- **端口**: `3306` (MySQL默认端口)

## 数据库结构

### 1. curl_parses 表
存储curl解析的基本信息：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| product_id | VARCHAR(100) | 商品ID |
| url | TEXT | 请求URL |
| method | VARCHAR(10) | 请求方法 |
| cookies | TEXT | 所有cookies，以分号分隔的字符串 |
| headers | JSON | 请求头，存储为JSON格式 |
| query_params | JSON | 查询参数，存储为JSON格式 |
| request_body | TEXT | 请求体 |
| base_url | TEXT | 基础URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2. spider_configs 表
存储解析后的爬虫配置：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| curl_parse_id | INT | 关联的curl解析ID |
| product_id | VARCHAR(100) | 商品ID |
| cookies | TEXT | cookies字符串 |
| max_pages | INT | 最大页数 |
| page_size | INT | 每页大小 |
| headers | JSON | 请求头配置 |
| base_url | TEXT | 基础URL |
| api_params | JSON | API参数配置 |
| config_name | VARCHAR(255) | 配置名称 |
| config_description | TEXT | 配置描述 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 3. curl_parse_summary 视图
方便查询解析数据的汇总信息。

## API接口

### 1. 保存解析数据
- **POST** `/api/save-parse`
- 保存curl解析数据到数据库

### 2. 获取解析数据
- **GET** `/api/parsed-data`
- **GET** `/api/parsed-data?productId=xxx` - 根据商品ID获取特定数据

### 3. 获取爬虫配置
- **GET** `/api/spider-configs`

### 4. 删除数据
- **DELETE** `/api/parsed-data?id=xxx&type=curl` - 删除curl解析数据
- **DELETE** `/api/parsed-data?id=xxx&type=spider` - 删除爬虫配置

## 使用方法

1. **解析curl命令**: 在解析器页面输入curl命令并解析
2. **保存到数据库**: 点击"保存配置"按钮，数据会自动保存到数据库
3. **查看数据库数据**: 切换到"数据库"标签页查看所有保存的数据
4. **管理数据**: 可以查看、复制、删除数据库中的解析数据

## 数据库连接配置

数据库连接配置位于 `lib/database.ts` 文件中：

```typescript
const dbConfig = {
  host: 'localhost',
  user: 'huangkaihao',
  password: 'hkh618618',
  database: 'curl_parser_db',
  charset: 'utf8mb4',
  timezone: '+08:00'
};
```

## 注意事项

1. 确保MySQL服务正在运行
2. 确保数据库用户有足够的权限
3. 所有时间字段使用UTC+8时区
4. JSON字段存储复杂数据结构，便于查询和处理
5. 外键约束确保数据一致性
