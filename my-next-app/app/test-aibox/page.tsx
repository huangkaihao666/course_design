'use client';

import { useState } from 'react';
import { aiboxClient } from '../utils/aibox-client';
import { CommentAnalysisRequest, AIBoxResponse } from '../types';

export default function TestAIBoxPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIBoxResponse | null>(null);
  const [formData, setFormData] = useState<CommentAnalysisRequest>({
    reviewBody: '[薄荷]环境：很金属风格，现代感十足！\\n三明治非常好吃，满口牛肉\\n柠檬苏打也很好喝！喜欢！酸酸甜甜，在夏天喝起来太爽了！',
    avgPrice: '69.07612456747405',
    cityName: '上海',
    dpPoiName: 'BAsdBAN',
    reviewCount: '2258',
    overallScore: '50',
    platformName: 'dp'
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await aiboxClient.analyzeComment(formData);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CommentAnalysisRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AIBox 工作流测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">评论分析测试</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评论内容 *
              </label>
              <textarea
                value={formData.reviewBody}
                onChange={(e) => handleInputChange('reviewBody', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="请输入评论内容"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  平均价格
                </label>
                <input
                  type="text"
                  value={formData.avgPrice || ''}
                  onChange={(e) => handleInputChange('avgPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="平均价格"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  城市名称
                </label>
                <input
                  type="text"
                  value={formData.cityName || ''}
                  onChange={(e) => handleInputChange('cityName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="城市名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  门店名称
                </label>
                <input
                  type="text"
                  value={formData.dpPoiName || ''}
                  onChange={(e) => handleInputChange('dpPoiName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="门店名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评论数量
                </label>
                <input
                  type="text"
                  value={formData.reviewCount || ''}
                  onChange={(e) => handleInputChange('reviewCount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="评论数量"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  总体评分
                </label>
                <input
                  type="text"
                  value={formData.overallScore || ''}
                  onChange={(e) => handleInputChange('overallScore', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="总体评分"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  平台名称
                </label>
                <input
                  type="text"
                  value={formData.platformName || ''}
                  onChange={(e) => handleInputChange('platformName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="平台名称"
                />
              </div>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={loading || !formData.reviewBody}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '分析中...' : '开始分析'}
            </button>
          </div>
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">分析结果</h2>
            
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center mb-2">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '分析成功' : '分析失败'}
                </span>
              </div>
              
              {result.success && result.data && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">爆火原因标签:</h3>
                  <p className="text-gray-700 mb-4">{result.data.tag || 'N/A'}</p>
                  
                  <h3 className="font-medium text-gray-900 mb-2">判断依据:</h3>
                  <p className="text-gray-700">{result.data.reason || 'N/A'}</p>
                </div>
              )}
              
              {!result.success && result.error && (
                <div className="mt-4">
                  <h3 className="font-medium text-red-800 mb-2">错误信息:</h3>
                  <p className="text-red-700">{result.error}</p>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">完整响应:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">API 使用说明</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium">1. 直接调用评论分析 API:</h3>
              <pre className="bg-gray-100 p-2 rounded mt-1">
{`POST /api/comment-analysis
Content-Type: application/json

{
  "reviewBody": "评论内容",
  "avgPrice": "69.07",
  "cityName": "上海",
  "dpPoiName": "门店名称",
  "reviewCount": "2258",
  "overallScore": "50",
  "platformName": "dp"
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">2. 使用客户端工具类:</h3>
              <pre className="bg-gray-100 p-2 rounded mt-1">
{`import { aiboxClient } from './app/utils/aibox-client';

const result = await aiboxClient.analyzeComment({
  reviewBody: '评论内容',
  // ... 其他可选参数
});`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">3. 通用工作流调用:</h3>
              <pre className="bg-gray-100 p-2 rounded mt-1">
{`POST /api/aibox
Content-Type: application/json

{
  "action": "execute-workflow",
  "data": {
    "botKey": "your-bot-key",
    "workflowKey": "your-workflow-key",
    "ext": { /* 工作流参数 */ },
    "humanId": "user-id",
    "token": "your-token"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
