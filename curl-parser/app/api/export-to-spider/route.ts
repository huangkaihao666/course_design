import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SpiderConfig } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const { config }: { config: SpiderConfig } = await request.json();

    if (!config) {
      return NextResponse.json(
        { error: '配置数据不能为空' },
        { status: 400 }
      );
    }

    // 生成Python爬虫配置文件
    const spiderCode = generateSpiderCode(config);
    
    // 保存到pachong目录
    const spiderDir = path.join(process.cwd(), '..', 'pachong');
    const configSpiderPath = path.join(spiderDir, `spider_${config.productId}_${Date.now()}.py`);
    
    await fs.writeFile(configSpiderPath, spiderCode, 'utf-8');

    // 同时更新原始爬虫文件
    const originalSpiderPath = path.join(spiderDir, 'spider.py');
    const updatedOriginalCode = await updateOriginalSpider(originalSpiderPath, config);
    await fs.writeFile(originalSpiderPath, updatedOriginalCode, 'utf-8');

    return NextResponse.json({
      success: true,
      message: '配置已导出到爬虫系统',
      files: [
        configSpiderPath,
        originalSpiderPath
      ]
    });
  } catch (error) {
    console.error('导出配置失败:', error);
    return NextResponse.json(
      { error: '导出配置失败' },
      { status: 500 }
    );
  }
}

function generateSpiderCode(config: SpiderConfig): string {
  const headersStr = JSON.stringify(config.headers, null, 8);
  const cookiesStr = JSON.stringify(config.cookies);

  return `#!/usr/bin/env python3
"""
自动生成的淘宝/天猫商品评论爬虫
商品ID: ${config.productId}
生成时间: ${new Date().toLocaleString()}
"""

import requests
import time
import json
import urllib.parse
import re
import hashlib
import os
from fake_useragent import UserAgent


class TmallCommentSpider:
    """天猫商品评论爬虫 - 自动配置版本"""
    
    def __init__(self):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.base_url = "${config.baseUrl}"
        self.product_id = "${config.productId}"
        
        # 自动配置的请求头
        self.headers = ${headersStr}
        
        # 自动配置的cookies
        self.cookies_str = ${cookiesStr}
        
        if self.cookies_str:
            self.session.cookies.update(self._parse_cookies(self.cookies_str))
    
    def _parse_cookies(self, cookie_string):
        """解析cookie字符串为字典"""
        cookies = {}
        if cookie_string:
            for item in cookie_string.split('; '):
                if '=' in item:
                    key, value = item.split('=', 1)
                    cookies[key] = value
        return cookies
    
    def _extract_token(self, cookies_str):
        """从cookies中提取_m_h5_tk token"""
        match = re.search(r'_m_h5_tk=([^;]+)', cookies_str)
        if match:
            token_with_timestamp = match.group(1)
            token = token_with_timestamp.split('_')[0] if '_' in token_with_timestamp else token_with_timestamp
            return token
        return ""
    
    def _generate_signature(self, timestamp, data_str, token=""):
        """生成签名"""
        app_key = "12574478"
        if not token:
            sign_str = f"{timestamp}&{app_key}&{data_str}"
        else:
            sign_str = f"{token}&{timestamp}&{app_key}&{data_str}"
        return hashlib.md5(sign_str.encode('utf-8')).hexdigest()
    
    def _parse_jsonp_response(self, response_text):
        """解析JSONP响应"""
        match = re.search(r'mtopjsonp\\d+\\((.*)\\)', response_text)
        if match:
            json_str = match.group(1)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON解析错误: {e}")
                return None
        return None
    
    def _format_comments(self, raw_data):
        """格式化评论数据"""
        if not raw_data or 'data' not in raw_data:
            return []
        
        comments = []
        try:
            rate_list = raw_data['data'].get('rateList', [])
            
            for rate in rate_list:
                comment = {
                    'user_nick': rate.get('userNick', rate.get('reduceUserNick', '')),
                    'content': rate.get('feedback', ''),
                    'rating': int(rate.get('userStar', 0)),
                    'date': rate.get('feedbackDate', rate.get('createTime', '')),
                    'useful_count': 0,
                    'reply': rate.get('reply', ''),
                    'sku_info': rate.get('skuValueStr', ''),
                    'pics': []
                }
                
                if 'interactInfo' in rate and isinstance(rate['interactInfo'], dict):
                    comment['useful_count'] = int(rate['interactInfo'].get('likeCount', 0))
                
                if 'feedPicPathList' in rate and isinstance(rate['feedPicPathList'], list):
                    comment['pics'] = rate['feedPicPathList']
                
                comments.append(comment)
                
        except Exception as e:
            print(f"数据格式化错误: {e}")
        
        return comments
    
    def get_comments(self, page_no=1, page_size=${config.pageSize}):
        """获取商品评论"""
        t = str(int(time.time() * 1000))
        
        data_params = {
            "showTrueCount": ${config.apiParams.showTrueCount ? 'True' : 'False'},
            "auctionNumId": "${config.apiParams.auctionNumId}",
            "pageNo": page_no,
            "pageSize": page_size,
            "orderType": "${config.apiParams.orderType}",
            "searchImpr": "${config.apiParams.searchImpr}",
            "expression": "${config.apiParams.expression}",
            "skuVids": "${config.apiParams.skuVids}",
            "rateSrc": "${config.apiParams.rateSrc}",
            "rateType": "${config.apiParams.rateType}"
        }
        
        data_str = json.dumps(data_params, separators=(',', ':'))
        
        token = self._extract_token(self.cookies_str) if self.cookies_str else ""
        signature = self._generate_signature(t, data_str, token)
        
        url_params = {
            'jsv': '2.7.4',
            'appKey': '12574478',
            't': t,
            'sign': signature,
            'api': 'mtop.taobao.rate.detaillist.get',
            'v': '6.0',
            'isSec': '0',
            'ecode': '1',
            'timeout': '20000',
            'dataType': 'jsonp',
            'valueType': 'string',
            'type': 'jsonp',
            'callback': 'mtopjsonp12',
            'data': data_str
        }
        
        url = f"{self.base_url}?{urllib.parse.urlencode(url_params)}"
        
        try:
            response = self.session.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            json_data = self._parse_jsonp_response(response.text)
            
            if json_data:
                return {
                    'success': True,
                    'comments': self._format_comments(json_data),
                    'total': json_data.get('data', {}).get('total', 0)
                }
            else:
                return {'success': False, 'error': '响应解析失败'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_multiple_pages(self, max_pages=${config.maxPages}, page_size=${config.pageSize}, delay=2):
        """获取多页评论"""
        all_comments = []
        
        for page in range(1, max_pages + 1):
            print(f"正在获取第 {page} 页评论...")
            
            result = self.get_comments(page_no=page, page_size=page_size)
            
            if result['success']:
                comments = result['comments']
                if comments:
                    all_comments.extend(comments)
                    print(f"第 {page} 页获取到 {len(comments)} 条评论")
                else:
                    print(f"第 {page} 页没有更多评论")
                    break
            else:
                print(f"第 {page} 页获取失败: {result['error']}")
                break
            
            if page < max_pages:
                time.sleep(delay)
        
        return all_comments
    
    def save_to_file(self, comments, filename):
        """保存评论到文件"""
        try:
            os.makedirs('output', exist_ok=True)
            filepath = f"output/{filename}"
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(comments, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 数据已保存到: {filepath}")
            return filepath
        except Exception as e:
            print(f"❌ 保存失败: {e}")
            return None


def main():
    """主程序"""
    print("🛒 淘宝/天猫商品评论爬虫 (自动配置版)")
    print("=" * 50)
    
    spider = TmallCommentSpider()
    
    print(f"🎯 商品ID: {spider.product_id}")
    print(f"📡 开始获取评论数据...")
    
    comments = spider.get_multiple_pages()
    
    if comments:
        print(f"\\n🎉 成功获取 {len(comments)} 条评论")
        
        filename = f"comments_{spider.product_id}_{int(time.time())}.json"
        spider.save_to_file(comments, filename)
        
        print(f"\\n📝 评论预览:")
        for i, comment in enumerate(comments[:3], 1):
            print(f"\\n🔸 评论 {i}:")
            print(f"   用户: {comment['user_nick']}")
            print(f"   评分: {'★' * comment['rating']}")
            print(f"   内容: {comment['content'][:50]}...")
            print(f"   时间: {comment['date']}")
            if comment['useful_count'] > 0:
                print(f"   点赞: {comment['useful_count']}")
        
        print(f"\\n✅ 爬取完成！数据已保存。")
    else:
        print("❌ 未获取到任何评论数据")


if __name__ == "__main__":
    main()
`;
}

async function updateOriginalSpider(spiderPath: string, config: SpiderConfig): Promise<string> {
  try {
    const originalCode = await fs.readFile(spiderPath, 'utf-8');
    
    // 更新商品ID
    let updatedCode = originalCode.replace(
      /product_id = os\.getenv\('PRODUCT_ID', '[^']*'\)/,
      `product_id = os.getenv('PRODUCT_ID', '${config.productId}')`
    );
    
    // 更新cookies
    const cookiesRegex = /cookies = """[\s\S]*?"""/;
    const newCookiesStr = `cookies = """${config.cookies}"""`;
    updatedCode = updatedCode.replace(cookiesRegex, newCookiesStr);
    
    return updatedCode;
  } catch (error) {
    console.error('更新原始爬虫文件失败:', error);
    throw error;
  }
}
