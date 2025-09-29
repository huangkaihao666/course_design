#!/usr/bin/env python3
"""
数据库读取模块 - 用于Python爬虫脚本直接读取数据库配置
"""

import mysql.connector
import json
import os
from typing import Dict, List, Optional

class DatabaseReader:
    """数据库读取器"""
    
    def __init__(self):
        self.db_config = {
            'host': 'localhost',
            'user': 'huangkaihao',
            'password': 'hkh618618',
            'database': 'curl_parser_db',
            'charset': 'utf8mb4',
            'autocommit': True
        }
    
    def get_connection(self):
        """获取数据库连接"""
        return mysql.connector.connect(**self.db_config)
    
    def get_spider_config_by_product_id(self, product_id: str) -> Optional[Dict]:
        """根据商品ID获取爬虫配置"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
            SELECT sc.*, cp.url, cp.method, cp.headers, cp.query_params
            FROM spider_configs sc 
            LEFT JOIN curl_parses cp ON sc.curl_parse_id = cp.id 
            WHERE sc.product_id = %s 
            ORDER BY sc.created_at DESC 
            LIMIT 1
            """
            
            cursor.execute(query, (product_id,))
            result = cursor.fetchone()
            
            if result:
                # 解析JSON字段
                if result.get('headers'):
                    result['headers'] = json.loads(result['headers'])
                if result.get('query_params'):
                    result['query_params'] = json.loads(result['query_params'])
            
            cursor.close()
            conn.close()
            
            return result
            
        except Exception as e:
            print(f"❌ 数据库读取失败: {e}")
            return None
    
    def get_all_spider_configs(self) -> List[Dict]:
        """获取所有爬虫配置"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
            SELECT sc.*, cp.url, cp.method, cp.headers, cp.query_params, cp.api_params
            FROM spider_configs sc 
            LEFT JOIN curl_parses cp ON sc.curl_parse_id = cp.id 
            ORDER BY sc.created_at DESC
            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            
            # 解析JSON字段
            for result in results:
                if result.get('headers'):
                    result['headers'] = json.loads(result['headers'])
                if result.get('query_params'):
                    result['query_params'] = json.loads(result['query_params'])
                if result.get('api_params'):
                    result['api_params'] = json.loads(result['api_params'])
            
            cursor.close()
            conn.close()
            
            return results
            
        except Exception as e:
            print(f"❌ 数据库读取失败: {e}")
            return []
    
    def save_comments(self, product_id: str, comments: List[Dict]) -> bool:
        """保存评论数据到数据库"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # 先删除该商品的旧评论
            cursor.execute("DELETE FROM comments WHERE product_id = %s", (product_id,))
            
            # 插入新评论
            insert_query = """
            INSERT INTO comments (product_id, user_nick, content, rating, date, useful_count, reply, sku_info, pics)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            for comment in comments:
                cursor.execute(insert_query, (
                    product_id,
                    comment.get('user_nick', ''),
                    comment.get('content', ''),
                    comment.get('rating', 0),
                    comment.get('date', ''),
                    comment.get('useful_count', 0),
                    comment.get('reply', ''),
                    comment.get('sku_info', ''),
                    json.dumps(comment.get('pics', []), ensure_ascii=False)
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"✅ 成功保存 {len(comments)} 条评论到数据库")
            return True
            
        except Exception as e:
            print(f"❌ 保存评论数据失败: {e}")
            return False
    
    def get_comments_by_product_id(self, product_id: str) -> List[Dict]:
        """根据商品ID获取评论数据"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = "SELECT * FROM comments WHERE product_id = %s ORDER BY date DESC"
            cursor.execute(query, (product_id,))
            results = cursor.fetchall()
            
            # 解析pics字段
            for result in results:
                if result.get('pics'):
                    result['pics'] = json.loads(result['pics'])
                else:
                    result['pics'] = []
            
            cursor.close()
            conn.close()
            
            return results
            
        except Exception as e:
            print(f"❌ 获取评论数据失败: {e}")
            return []


# 测试函数
def test_database_connection():
    """测试数据库连接"""
    db = DatabaseReader()
    
    # 测试连接
    try:
        conn = db.get_connection()
        print("✅ 数据库连接成功")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False


if __name__ == "__main__":
    # 测试数据库连接
    if test_database_connection():
        print("数据库模块测试通过")
    else:
        print("数据库模块测试失败")
