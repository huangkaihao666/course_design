'use client';

import React from 'react';
import { CheckCircle, Settings, Download, Upload } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ParsedCurl, SpiderConfig } from '../../types';

interface ParseResultAreaProps {
  parsedData: {
    parsed: ParsedCurl;
    config: SpiderConfig;
  } | null;
  loading: boolean;
  onExportConfig: (config: SpiderConfig) => void;
  onExportToSpiderSystem: (config: SpiderConfig) => void;
  onCopyToClipboard: (text: string) => void;
}

export default function ParseResultArea({
  parsedData,
  loading,
  onExportConfig,
  onExportToSpiderSystem,
  onCopyToClipboard
}: ParseResultAreaProps) {
  if (!parsedData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* 基本信息 */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 min-h-fit">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">解析结果</h3>
        </div>
        <div className="space-y-4">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <label className="block text-xs sm:text-sm font-semibold text-blue-700 mb-1">🌐 URL</label>
            <div className="text-xs sm:text-sm text-gray-700 break-all font-mono bg-white p-2 rounded-lg overflow-hidden">
              <span className="block truncate" title={parsedData.parsed.url}>
                {parsedData.parsed.url}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <label className="block text-xs sm:text-sm font-semibold text-purple-700 mb-1">📡 请求方法</label>
              <p className="text-xs sm:text-sm text-gray-700 font-bold break-words">{parsedData.parsed.method}</p>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
              <label className="block text-xs sm:text-sm font-semibold text-orange-700 mb-1">🛍️ 商品ID</label>
              <p className="text-xs sm:text-sm text-gray-700 font-bold break-words">{parsedData.config.productId}</p>
            </div>
          </div>
          
          {/* Cookie详细展示 */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-semibold text-yellow-700">🍪 Cookies ({Object.keys(parsedData.parsed.cookies).length} 个)</label>
              <button
                onClick={() => onCopyToClipboard(parsedData.config.cookies)}
                className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-lg transition-colors duration-200"
              >
                📋 复制
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {Object.keys(parsedData.parsed.cookies).length > 0 ? (
                Object.entries(parsedData.parsed.cookies).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-white p-2 rounded-lg border border-yellow-200">
                    <span className="text-xs font-mono text-gray-700 font-semibold">{key}:</span>
                    <span className="text-xs font-mono text-gray-600 break-all ml-2">{value}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">暂无Cookie</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <label className="block text-xs sm:text-sm font-semibold text-green-700 mb-1">📋 请求头</label>
              <p className="text-xs sm:text-sm text-gray-700 font-bold">{Object.keys(parsedData.parsed.headers).length} 个</p>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
              <label className="block text-xs sm:text-sm font-semibold text-indigo-700 mb-1">🔗 查询参数</label>
              <p className="text-xs sm:text-sm text-gray-700 font-bold">{Object.keys(parsedData.parsed.queryParams).length} 个</p>
            </div>
          </div>
        </div>
      </div>

      {/* 配置预览 */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 min-h-fit">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">爬虫配置</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onExportConfig(parsedData.config)}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center justify-center gap-1 sm:gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">📥 导出JSON</span>
              <span className="sm:hidden">📥 导出</span>
            </button>
            <button
              onClick={() => onExportToSpiderSystem(parsedData.config)}
              disabled={loading}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">🚀 同步到爬虫</span>
              <span className="sm:hidden">🚀 同步</span>
            </button>
          </div>
        </div>
        <div className="max-h-48 sm:max-h-64 overflow-y-auto bg-gray-900 rounded-xl border-2 border-gray-200">
          <SyntaxHighlighter
            language="json"
            style={tomorrow}
            className="text-xs"
            customStyle={{
              background: 'transparent',
              padding: '0.75rem',
              margin: 0,
              borderRadius: '0.75rem',
              overflow: 'hidden'
            }}
          >
            {JSON.stringify(parsedData.config, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
