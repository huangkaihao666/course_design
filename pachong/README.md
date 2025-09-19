# 淘宝/天猫商品评论爬虫

一个简单的Python爬虫工具，用于抓取淘宝/天猫商品的用户评论数据。

## 快速开始

### 1. 安装依赖
```bash
pip3 install -r requirements.txt
```

### 2. 运行爬虫
```bash
python3 spider.py
```

### 3. 查看结果
- 评论数据保存在 `output/` 目录
- 文件格式：`comments_商品ID_时间戳.json`

## 自定义配置

### 更换商品
1. 从商品页面URL获取商品ID：
   ```
   https://detail.tmall.com/item.htm?id=901834866810
   商品ID：901834866810
   ```

2. 修改 `spider.py` 第224行：
   ```python
   product_id = "您的商品ID"
   ```

### 更新Cookies
当出现"非法请求"错误时，需要更新cookies：

1. 浏览器登录淘宝账号
2. 访问商品详情页
3. F12 → Network → 刷新页面
4. 找到包含 `rate.detaillist` 的请求
5. 复制Cookie值
6. 更新 `spider.py` 第219行：
   ```python
   cookies = """您的新cookies"""
   ```

### 调整参数
修改 `spider.py` 第233行：
```python
# 获取页数（建议1-5页）
comments = spider.get_multiple_pages(product_id, max_pages=3)
```

## 常见问题

- **FAIL_SYS_ILLEGAL_ACCESS错误**：cookies过期，需要重新获取
- **获取空数据**：检查商品ID是否正确，确认商品有评论
- **请求频率限制**：减少页数或增加延迟时间

## 输出数据格式
```json
{
  "user_nick": "用户昵称",
  "content": "评论内容", 
  "rating": 5,
  "date": "2024-01-15",
  "useful_count": 3,
  "sku_info": "商品规格",
  "pics": ["图片链接"],
  "reply": "商家回复"
}
```

## 免责声明
仅供学习研究使用，请遵守相关法律法规。