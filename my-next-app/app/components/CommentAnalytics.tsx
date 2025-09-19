'use client';

import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Search, Download, RefreshCw, TrendingUp, MessageCircle, Star } from 'lucide-react';
import { crawlComments, getComments, analyzeSentiment, getSentimentColor, getSentimentText, getStarRating } from '../utils/api';
import { CommentWithSentiment, Statistics } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function CommentAnalytics() {
  const [productId, setProductId] = useState('969932796642');
  const [comments, setComments] = useState<CommentWithSentiment[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setCrawlLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载已有评论数据
  const loadExistingComments = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const result = await getComments(productId);
      if (result.success && result.data.length > 0) {
        const analysisResult = await analyzeSentiment(result.data);
        setComments(analysisResult.comments);
        setStatistics(analysisResult.statistics);
      } else {
        setComments([]);
        setStatistics(null);
      }
    } catch (err) {
      setError('加载评论失败');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // 爬取新评论
  const handleCrawl = async () => {
    try {
      setCrawlLoading(true);
      setError(null);
      
      const result = await crawlComments(productId, 3);
      if (result.success) {
        const analysisResult = await analyzeSentiment(result.data);
        setComments(analysisResult.comments);
        setStatistics(analysisResult.statistics);
      } else {
        setError(result.error || '爬取失败');
      }
    } catch (err) {
      setError('爬取评论失败');
      console.error(err);
    } finally {
      setCrawlLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadExistingComments();
  }, []);

  // 情感分布图表数据
  const sentimentChartData = {
    labels: ['正面', '负面', '中性'],
    datasets: [
      {
        data: statistics ? [
          statistics.sentimentDistribution.positive,
          statistics.sentimentDistribution.negative,
          statistics.sentimentDistribution.neutral
        ] : [0, 0, 0],
        backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // 评分分布图表数据
  const ratingChartData = {
    labels: ['1-2分', '3-4分', '5-6分', '7-8分', '9-10分'],
    datasets: [
      {
        label: '评论数量',
        data: statistics ? [
          statistics.ratingDistribution[1],
          statistics.ratingDistribution[2],
          statistics.ratingDistribution[3],
          statistics.ratingDistribution[4],
          statistics.ratingDistribution[5],
        ] : [0, 0, 0, 0, 0],
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页头 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">电商评论分析系统</h1>
          <p className="text-gray-600">分析商品评论的情感倾向和用户反馈趋势</p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品ID
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入商品ID"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadExistingComments}
                disabled={analyzing}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {analyzing ? '加载中...' : '加载现有'}
              </button>
              <button
                onClick={handleCrawl}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? '爬取中...' : '重新爬取'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {statistics && (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总评论数</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">平均评分</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.averageRating}/10</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">正面评论</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.sentimentDistribution.positive}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Download className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">负面评论</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.sentimentDistribution.negative}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">情感分布</h3>
                <div className="h-64">
                  <Doughnut 
                    data={sentimentChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">评分分布</h3>
                <div className="h-64">
                  <Bar 
                    data={ratingChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 关键词云 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">热门关键词</h3>
              <div className="flex flex-wrap gap-2">
                {statistics.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    style={{ fontSize: `${Math.max(12, Math.min(20, keyword.count * 2))}px` }}
                  >
                    {keyword.word} ({keyword.count})
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 评论列表 */}
        {comments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">评论详情</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.slice(0, 10).map((comment, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{comment.user_nick}</span>
                      <span 
                        className="px-2 py-1 rounded-full text-xs text-white"
                        style={{ backgroundColor: getSentimentColor(comment.sentiment.sentiment) }}
                      >
                        {getSentimentText(comment.sentiment.sentiment)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-500">{getStarRating(comment.rating)}</div>
                      <div className="text-sm text-gray-500">{comment.date}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  {comment.sku_info && (
                    <p className="text-sm text-gray-500">规格: {comment.sku_info}</p>
                  )}
                  {comment.pics.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {comment.pics.slice(0, 3).map((pic, picIndex) => (
                        <img
                          key={picIndex}
                          src={`https:${pic}`}
                          alt="评论图片"
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
