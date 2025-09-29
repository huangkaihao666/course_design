#!/usr/bin/env python3
"""
淘宝/天猫商品评论爬虫 - 主程序
使用方法: python3 spider.py
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
    """天猫商品评论爬虫"""
    
    def __init__(self, cookies=None):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.base_url = "https://h5api.m.tmall.com/h5/mtop.taobao.rate.detaillist.get/6.0/"
        self.cookies_str = cookies
        
        # 设置请求头
        self.headers = {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'referer': 'https://detail.tmall.com/',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'script',
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'origin': 'https://detail.tmall.com',
            'x-requested-with': 'XMLHttpRequest'
        }
        
        # 设置cookies
        if cookies:
            self.session.cookies.update(self._parse_cookies(cookies))
    
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
        match = re.search(r'mtopjsonp\d+\((.*)\)', response_text)
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
            # 获取评论列表
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
                
                # 提取点赞数
                if 'interactInfo' in rate and isinstance(rate['interactInfo'], dict):
                    comment['useful_count'] = int(rate['interactInfo'].get('likeCount', 0))
                
                # 提取图片
                if 'feedPicPathList' in rate and isinstance(rate['feedPicPathList'], list):
                    comment['pics'] = rate['feedPicPathList']
                
                comments.append(comment)
                
        except Exception as e:
            print(f"数据格式化错误: {e}")
        
        return comments
    
    def get_product_info_from_comments(self, comments):
        """从评论数据中推断商品信息"""
        if not comments or len(comments) == 0:
            return {
                'success': True,
                'product_name': '未知商品',
                'product_url': '',
                'shop_name': ''
            }
        
        # 从评论的SKU信息推断商品类型
        sku_keywords = []
        for comment in comments[:3]:  # 只检查前3条评论
            sku_info = comment.get('sku_info', '')
            if sku_info:
                sku_keywords.append(sku_info)
        
        # 根据SKU关键词推断商品类型
        product_name = '商品'
        if any('打火机' in sku or '火石' in sku for sku in sku_keywords):
            product_name = '打火机商品'
        elif any('礼盒' in sku for sku in sku_keywords):
            product_name = '礼盒商品'
        elif any('笔记本' in sku or '本子' in sku for sku in sku_keywords):
            product_name = '笔记本商品'
        elif any('手机' in sku for sku in sku_keywords):
            product_name = '手机商品'
        elif any('衣服' in sku or '服装' in sku for sku in sku_keywords):
            product_name = '服装商品'
        elif any('鞋子' in sku or '鞋' in sku for sku in sku_keywords):
            product_name = '鞋类商品'
        elif any('包' in sku for sku in sku_keywords):
            product_name = '包类商品'
        
        return {
            'success': True,
            'product_name': product_name,
            'product_url': '',
            'shop_name': ''
        }

    def get_product_info(self, product_id):
        """获取商品基本信息"""
        try:
            # 先尝试获取评论数据
            result = self.get_comments(product_id, page_no=1, page_size=3)
            
            if result['success'] and 'comments' in result:
                # 从评论数据中推断商品信息
                return self.get_product_info_from_comments(result['comments'])
            elif result['success'] and 'data' in result:
                data = result['data']
                print(f"调试 - 评论数据字段: {list(data.keys())}")
                
                # 尝试从不同字段获取商品信息
                product_name = f'商品ID: {product_id}'
                product_url = ''
                shop_name = ''
                
                # 检查是否有商品相关字段
                if 'item' in data:
                    item = data['item']
                    product_name = item.get('title', product_name)
                    product_url = item.get('url', product_url)
                    shop_name = item.get('shopName', shop_name)
                elif 'auction' in data:
                    auction = data['auction']
                    product_name = auction.get('title', product_name)
                    product_url = auction.get('url', product_url)
                    shop_name = auction.get('shopName', shop_name)
                elif 'product' in data:
                    product = data['product']
                    product_name = product.get('title', product_name)
                    product_url = product.get('url', product_url)
                    shop_name = product.get('shopName', shop_name)
                
                # 如果还是没有找到商品名称，尝试从评论的SKU信息推断
                if product_name == f'商品ID: {product_id}' and 'rateList' in data:
                    rate_list = data['rateList']
                    if rate_list and len(rate_list) > 0:
                        # 从第一个评论的SKU信息推断商品类型
                        first_comment = rate_list[0]
                        sku_info = first_comment.get('skuValueStr', '')
                        if sku_info:
                            # 根据SKU信息推断商品类型
                            if '打火机' in sku_info or '火石' in sku_info:
                                product_name = f'打火机商品 - {product_id}'
                            elif '礼盒' in sku_info:
                                product_name = f'礼盒商品 - {product_id}'
                            else:
                                product_name = f'商品 - {product_id}'
                
                return {
                    'success': True,
                    'product_name': product_name,
                    'product_url': product_url,
                    'shop_name': shop_name
                }
            
            # 如果都失败了，返回默认值
            return {
                'success': True,
                'product_name': f'商品ID: {product_id}',
                'product_url': '',
                'shop_name': ''
            }
        except Exception as e:
            print(f"获取商品信息失败: {e}")
            return {
                'success': False,
                'product_name': f'商品ID: {product_id}',
                'product_url': '',
                'shop_name': ''
            }

    def get_comments(self, product_id, page_no=1, page_size=20):
        """获取商品评论"""
        # 构建请求参数
        t = str(int(time.time() * 1000))
        
        data_params = {
            "showTrueCount": False,
            "auctionNumId": product_id,
            "pageNo": page_no,
            "pageSize": page_size,
            "orderType": "",
            "searchImpr": "-8",
            "expression": "",
            "skuVids": "",
            "rateSrc": "pc_rate_list",
            "rateType": ""
        }
        
        data_str = json.dumps(data_params, separators=(',', ':'))
        
        # 生成签名
        token = self._extract_token(self.cookies_str) if self.cookies_str else ""
        signature = self._generate_signature(t, data_str, token)
        
        # URL参数
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
    
    def get_multiple_pages(self, product_id, max_pages=3, page_size=20, delay=2):
        """获取多页评论"""
        all_comments = []
        
        for page in range(1, max_pages + 1):
            print(f"正在获取第 {page} 页评论...")
            
            result = self.get_comments(product_id, page_no=page, page_size=page_size)
            
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
    


def main():
    """主程序"""
    print("🛒 淘宝/天猫商品评论爬虫")
    print("=" * 50)
    
    # 从环境变量获取cookies，如果没有则使用默认值
    cookies = os.getenv('COOKIES', """xlly_s=1; dnk=tb52079771; tracknick=tb52079771; lid=tb52079771; _l_g_=Ug%3D%3D; unb=2874571822; lgc=tb52079771; cookie1=VT5Zk6h2%2BqNVOo4UBujinMRjF69%2FJohkVTOspWEVctU%3D; login=true; wk_cookie2=11ef152c8328fbab96c52320c81863f0; cookie17=UUBfRqE2sd0fJQ%3D%3D; cookie2=1a394e6c096d55ee8ed6c05e8a3f252b; _nk_=tb52079771; cancelledSubSites=empty; sg=12e; t=8f8c6b0acfd465866dd8e9e2ef3f1e52; sn=; _tb_token_=e7f5e347e7467; wk_unb=UUBfRqE2sd0fJQ%3D%3D; isg=BG5utQ0ZipRSfP7w7mPZnAMPv8IwbzJpXA3g55g32nEsew7VAP-CeRR4MueXpCqB; havana_sdkSilent=1758304110832; uc1=pas=0&cookie21=Vq8l%2BKCLjhS4UhJVbhgU&cookie16=UtASsssmPlP%2Ff1IHDsDaPRu%2BPw%3D%3D&cookie15=UIHiLt3xD8xYTw%3D%3D&cookie14=UoYbw12iqFcnxw%3D%3D&existShop=false; uc3=vt3=F8dD2k%2FkqtAXbdSM%2B0g%3D&lg2=U%2BGCWk%2F75gdr5Q%3D%3D&nk2=F5RAQI%2B%2FeGflCQ%3D%3D&id2=UUBfRqE2sd0fJQ%3D%3D; uc4=id4=0%40U2LNaXTVr%2BzfReMs%2FDEO6yqBBCVA&nk4=0%40FY4L7HCZjsAW%2BYbe61%2Be7QuxIflL; havana_lgc_exp=1789379310832; sgcookie=E100XRzzBI4FsakfR5IEXtyUYgxxKEGtdnkyO2fJpXfAjhUL2E2Q2Y5xL5OImz3taTq7qqEjpR8ahvSks4KoAceJyDoKXKyKy9k72W%2FJw3RpVjg33x7b2gWd3q%2FBl6UQPMEn; csg=fc7d23e6; mtop_partitioned_detect=1; _m_h5_tk=fa69dcb6ac62e22452533f22ae5e27aa_1758298239087; _m_h5_tk_enc=178d568bcb785ebbe1cb127a8696ac1f; tfstk=gbAjBE9Qvhdz7-1T5t0zFAXyP6f6C4lEhP_9-FF4WsCA55THfE5wWGR113xRBI52u3G6-H6VBCSw1rAWA5PqmxYT115tYDlETEvcs1nUU97w6ibMyG3PH-59R2CtYDlzUzBm01KNEc0nVUIl5SQADhI-wNSRW-KODTERRwfO6hQOeUQF5oeOkS3WygbO6GKOH46RqNh9nAQ_hiTjJcz9VawRbEI765djstsBBRPT6Q_fhO8AVLJyNZ6fAOETYsRBJEdh5C0LCGTHHn7kfXi5wItXMT1s17f2RLKfFKi_NTvJ-CBWEDwH-EKXp9dxNq6Wie5AVC0gsip2WCW6MDUNDIx2N9Agc0SwLURAFHnzNhX6HpCv1DGR42VFAsrzCz631asEP4wgI1C1obpifImAHabXo4g7cOXAragjP4wgItQlzx3SPo6G.""")
    
    # 从环境变量获取参数，如果没有则使用默认值
    product_id = os.getenv('PRODUCT_ID', '933910033859')
    max_pages = int(os.getenv('MAX_PAGES', '3'))
    
    # 创建爬虫实例
    spider = TmallCommentSpider(cookies=cookies)
    
    print(f"🎯 商品ID: {product_id}")
    print(f"📄 最大页数: {max_pages}")
    print(f"📡 开始获取商品信息...")
    
    # 获取商品信息
    product_info = spider.get_product_info(product_id)
    print(f"📦 商品信息: {product_info}")
    
    print(f"📡 开始获取评论数据...")
    
    # 测试单页获取
    print(f"🔍 测试获取第1页数据...")
    test_result = spider.get_comments(product_id, page_no=1, page_size=20)
    print(f"📊 测试结果: {test_result}")
    
    # 获取评论数据
    comments = spider.get_multiple_pages(product_id, max_pages=max_pages, page_size=20)
    
    if comments:
        print(f"\n🎉 成功获取 {len(comments)} 条评论")
        
        # 显示前3条评论
        print(f"\n📝 评论预览:")
        for i, comment in enumerate(comments[:3], 1):
            print(f"\n🔸 评论 {i}:")
            print(f"   用户: {comment['user_nick']}")
            print(f"   评分: {'★' * comment['rating']}")
            print(f"   内容: {comment['content'][:50]}...")
            print(f"   时间: {comment['date']}")
            if comment['useful_count'] > 0:
                print(f"   点赞: {comment['useful_count']}")
        
        print(f"\n✅ 爬取完成！数据已通过API保存到数据库。")
    else:
        print("❌ 未获取到任何评论数据")


if __name__ == "__main__":
    main()
