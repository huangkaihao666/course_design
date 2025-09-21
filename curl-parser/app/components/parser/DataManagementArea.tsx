'use client';

import React, { useState, useEffect } from 'react';
import { Database, Trash2, Eye, Copy, Download } from 'lucide-react';

interface ParsedData {
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

interface DataManagementAreaProps {
  onCopyToClipboard: (text: string) => void;
}

export default function DataManagementArea({ onCopyToClipboard }: DataManagementAreaProps) {
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadParsedData();
  }, []);

  const loadParsedData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parsed-data');
      const result = await response.json();
      
      if (result.success) {
        setParsedData(result.data);
      } else {
        setError(result.error || '加载数据失败');
      }
    } catch (error) {
      setError('加载数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (id: number) => {
    if (!confirm('确定要删除这条解析数据吗？')) return;

    try {
      const response = await fetch(`/api/parsed-data?id=${id}&type=curl`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('数据删除成功！');
        loadParsedData();
      } else {
        setError(result.error || '删除失败');
      }
    } catch (error) {
      setError('删除请求失败');
      console.error(error);
    }
  };

  const copyProductId = (productId: string) => {
    onCopyToClipboard(productId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">数据库中的解析数据</h3>
        <button
          onClick={loadParsedData}
          disabled={loading}
          className="ml-auto px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? '加载中...' : '刷新'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-3">
        {parsedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无解析数据</p>
          </div>
        ) : (
          parsedData.map((data) => (
            <div key={data.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {data.method}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      ID: {data.id}
                    </span>
                    {data.config_name && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        {data.config_name}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">商品ID:</span>
                      <span className="font-mono bg-white px-2 py-1 rounded text-xs">
                        {data.product_id}
                      </span>
                      <button
                        onClick={() => copyProductId(data.product_id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                        title="复制商品ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 truncate" title={data.url}>
                      <span className="font-medium">URL:</span> {data.url}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>请求头: {data.header_count} 个</span>
                      <span>参数: {data.param_count} 个</span>
                      <span>Cookie长度: {data.cookie_length} 字符</span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      创建时间: {formatDate(data.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteData(data.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="删除数据"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
