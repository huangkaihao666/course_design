import axios from 'axios';
import { Comment, AnalysisResult } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60秒超时
});

// 爬取商品评论
export async function crawlComments(productId: string, maxPages: number = 3) {
  const response = await api.post('/crawl', {
    productId,
    maxPages
  });
  return response.data;
}

// 获取已爬取的评论
export async function getComments(productId: string) {
  const response = await api.get(`/crawl?productId=${productId}`);
  return response.data;
}

// 进行情感分析
export async function analyzeSentiment(comments: Comment[]): Promise<AnalysisResult> {
  const response = await api.post('/sentiment', { comments });
  return response.data.data;
}

// 格式化日期
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  } catch {
    return dateStr;
  }
}

// 获取情感标签颜色
export function getSentimentColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive':
      return '#10B981'; // green
    case 'negative':
      return '#EF4444'; // red
    case 'neutral':
      return '#6B7280'; // gray
    default:
      return '#6B7280';
  }
}

// 获取情感标签文本
export function getSentimentText(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive':
      return '正面';
    case 'negative':
      return '负面';
    case 'neutral':
      return '中性';
    default:
      return '未知';
  }
}

// 获取评分星级
export function getStarRating(rating: number): string {
  const fullStars = Math.floor(rating / 2);
  const halfStar = rating % 2 >= 1;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (halfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
}
