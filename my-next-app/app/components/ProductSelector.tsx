'use client';

import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Play, Settings, MessageSquare, Star, Calendar, User } from 'lucide-react';

interface ProductData {
  id: number;
  product_id: string;
  url: string;
  method: string;
  created_at: string;
  header_count: number;
  param_count: number;
  cookie_length: number;
  config_name?: string;
  config_description?: string;
}

interface CommentData {
  id: number;
  product_id: string;
  product_name: string;
  user_nick: string;
  content: string;
  rating: number;
  date: string;
  useful_count: number;
  reply: string;
  sku_info: string;
  pics: string[];
  created_at: string;
  updated_at: string;
}

interface ProductSelectorProps {
  onProductSelect: (productId: string) => void;
  onCrawlStart: (productId: string, maxPages: number) => void;
}

export default function ProductSelector({ onProductSelect, onCrawlStart }: ProductSelectorProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [maxPages, setMaxPages] = useState(3);
  const [activeTab, setActiveTab] = useState<'curl' | 'comments'>('curl');

  useEffect(() => {
    loadProducts();
    loadComments();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/curl-data?type=all');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error || '加载商品列表失败');
      }
    } catch (error) {
      setError('加载商品列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch('/api/curl-data?type=comments');
      const result = await response.json();
      
      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('加载评论数据失败:', error);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    onProductSelect(productId);
  };

  const handleCrawlStart = () => {
    if (selectedProduct) {
      onCrawlStart(selectedProduct, maxPages);
      // 爬取完成后刷新评论数据
      setTimeout(() => {
        loadComments();
      }, 3000);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'curl') {
      loadProducts();
    } else {
      loadComments();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getCommentsByProductId = (productId: string) => {
    return comments.filter(comment => comment.product_id === productId);
  };

  const getUniqueProductIds = () => {
    const productIds = new Set(comments.map(comment => comment.product_id));
    return Array.from(productIds);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">商品数据管理</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('curl')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
            activeTab === 'curl'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          CURL解析数据
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
            activeTab === 'comments'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          评论数据 ({comments.length})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {activeTab === 'curl' ? (
          <>
            {/* 爬取设置 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">最大页数:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxPages}
                    onChange={(e) => setMaxPages(parseInt(e.target.value) || 3)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={handleCrawlStart}
                  disabled={!selectedProduct || loading}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  开始爬取
                </button>
              </div>
            </div>

            {/* CURL商品列表 */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>加载中...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无商品数据</p>
                  <p className="text-sm">请先在curl解析器中解析并保存商品数据</p>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedProduct === product.product_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleProductSelect(product.product_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            {product.method}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            ID: {product.id}
                          </span>
                          {product.config_name && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                              {product.config_name}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="font-mono text-gray-800">
                            商品ID: {product.product_id}
                          </div>
                          
                          <div className="text-xs text-gray-500 truncate" title={product.url}>
                            URL: {product.url}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>请求头: {product.header_count} 个</span>
                            <span>参数: {product.param_count} 个</span>
                            <span>Cookie: {product.cookie_length} 字符</span>
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            创建时间: {formatDate(product.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedProduct === product.product_id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedProduct === product.product_id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* 评论数据列表 */
          <div className="max-h-96 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>加载中...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无评论数据</p>
                <p className="text-sm">请先爬取商品评论数据</p>
              </div>
            ) : (
              getUniqueProductIds().map((productId) => {
                const productComments = getCommentsByProductId(productId);
                const avgRating = productComments.reduce((sum, comment) => sum + comment.rating, 0) / productComments.length;
                const productName = productComments[0]?.product_name || `商品ID: ${productId}`;
                
                return (
                  <div key={productId} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                          {productName}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                          ID: {productId}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          {productComments.length} 条评论
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleProductSelect(productId)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-200"
                      >
                        选择此商品
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {productComments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">{comment.user_nick}</span>
                              <div className="flex items-center gap-1">
                                {renderStars(comment.rating)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {comment.date}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{comment.content}</p>
                          {comment.sku_info && (
                            <div className="mt-1 text-xs text-gray-500">
                              SKU: {comment.sku_info}
                            </div>
                          )}
                        </div>
                      ))}
                      {productComments.length > 3 && (
                        <div className="text-center text-xs text-gray-500 py-2">
                          还有 {productComments.length - 3} 条评论...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
