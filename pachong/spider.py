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
    
    def save_to_file(self, comments, filename):
        """保存评论到文件"""
        try:
            # 确保输出目录存在
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
    print("🛒 淘宝/天猫商品评论爬虫")
    print("=" * 50)
    
    # 设置cookies - 请替换为您的真实cookies
    cookies = """xlly_s=1; dnk=tb52079771; tracknick=tb52079771; lid=tb52079771; _l_g_=Ug%3D%3D; unb=2874571822; lgc=tb52079771; cookie1=VT5Zk6h2%2BqNVOo4UBujinMRjF69%2FJohkVTOspWEVctU%3D; login=true; wk_cookie2=11ef152c8328fbab96c52320c81863f0; cookie17=UUBfRqE2sd0fJQ%3D%3D; cookie2=1a394e6c096d55ee8ed6c05e8a3f252b; _nk_=tb52079771; cancelledSubSites=empty; sg=12e; t=8f8c6b0acfd465866dd8e9e2ef3f1e52; sn=; _tb_token_=e7f5e347e7467; wk_unb=UUBfRqE2sd0fJQ%3D%3D; isg=BG5utQ0ZipRSfP7w7mPZnAMPv8IwbzJpXA3g55g32nEsew7VAP-CeRR4MueXpCqB; mtop_partitioned_detect=1; _m_h5_tk=5f7522c0f877ac5dafdf35b8a07eb32f_1758283229092; _m_h5_tk_enc=3c5b2a313057701949621ec27491ac11; havana_sdkSilent=1758304110832; uc1=pas=0&cookie21=Vq8l%2BKCLjhS4UhJVbhgU&cookie16=UtASsssmPlP%2Ff1IHDsDaPRu%2BPw%3D%3D&cookie15=UIHiLt3xD8xYTw%3D%3D&cookie14=UoYbw12iqFcnxw%3D%3D&existShop=false; uc3=vt3=F8dD2k%2FkqtAXbdSM%2B0g%3D&lg2=U%2BGCWk%2F75gdr5Q%3D%3D&nk2=F5RAQI%2B%2FeGflCQ%3D%3D&id2=UUBfRqE2sd0fJQ%3D%3D; uc4=id4=0%40U2LNaXTVr%2BzfReMs%2FDEO6yqBBCVA&nk4=0%40FY4L7HCZjsAW%2BYbe61%2Be7QuxIflL; havana_lgc_exp=1789379310832; sgcookie=E100XRzzBI4FsakfR5IEXtyUYgxxKEGtdnkyO2fJpXfAjhUL2E2Q2Y5xL5OImz3taTq7qqEjpR8ahvSks4KoAceJyDoKXKyKy9k72W%2FJw3RpVjg33x7b2gWd3q%2FBl6UQPMEn; csg=fc7d23e6; tfstk=g80qHdYeiPDWOceYm4aNaIhj6CzYvPJBgVw_sfcgG-2DBIFg7xMujNGXDCRaUAebcrmbsNk7FA_sGVoR7XhtlIU6MrhYWPvBdeGZMjUT-tfViqylq5GlmiqMVzYi1dXkdeTIinVY5bvI5bKr38VgSS20nzAzOWs0SlVmZQPg1tjGoAAya5NOoO20sTcu9S4gIAqMazV__PVmIlArZX6_4k8ztoAz0VY5C3fTjJc0UNbh9SEcajI15NTQGoe3mV_gV4P40Jcq8zyvQ5on8oHHFiwmYDHUOxTluvlm3DqnoTvzWbiEQWuDtMyZHb0bqqA1v7UtmD4m7pWmgxkxkDcDFgPrqjgzV2vF7onoHDEZ5LTLlDGIWk0Du9e7v5kUo0JluvjzAOFklNgt0Ojam7FzdQRPMhrWYGIhYhsOXuD_aJOxMGITmdVzdQRPXGEv77yBMjC"""
    
    # 商品ID - 请替换为您要爬取的商品ID
    product_id = "901834866810"
    
    # 创建爬虫实例
    spider = TmallCommentSpider(cookies=cookies)
    
    print(f"🎯 商品ID: {product_id}")
    print(f"📡 开始获取评论数据...")
    
    # 获取评论数据（前3页，每页20条）
    comments = spider.get_multiple_pages(product_id, max_pages=3, page_size=20)
    
    if comments:
        print(f"\n🎉 成功获取 {len(comments)} 条评论")
        
        # 保存到文件
        filename = f"comments_{product_id}_{int(time.time())}.json"
        spider.save_to_file(comments, filename)
        
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
        
        print(f"\n✅ 爬取完成！数据已保存。")
    else:
        print("❌ 未获取到任何评论数据")


if __name__ == "__main__":
    main()
