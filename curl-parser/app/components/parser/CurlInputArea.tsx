'use client';

import React from 'react';
import { Code, Settings, Copy } from 'lucide-react';
import { message } from 'antd';

interface CurlInputAreaProps {
  curlInput: string;
  setCurlInput: (value: string) => void;
  loading: boolean;
  onParseCurl: () => void;
  onLoadSample: () => void;
  onCopyToClipboard: (text: string) => void;
}

export default function CurlInputArea({
  curlInput,
  setCurlInput,
  loading,
  onParseCurl,
  onLoadSample,
  onCopyToClipboard
}: CurlInputAreaProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 min-h-[700px] sm:min-h-[800px] lg:min-h-[900px] xl:min-h-[1000px]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Code className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">输入Curl命令</h3>
        </div>
        <button
          onClick={onLoadSample}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm self-start sm:self-auto"
        >
          ✨ 加载示例
        </button>
      </div>
      
      <div className="relative">
        <textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          className="w-full h-64 sm:h-80 lg:h-96 xl:h-[28rem] p-3 sm:p-4 border-2 border-gray-200 rounded-xl font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-200 resize-none overflow-x-auto"
          placeholder="🔗 在此粘贴你的curl命令...&#10;&#10;例如:&#10;curl 'https://h5api.m.taobao.com/...' \&#10;  -H 'accept: */*' \&#10;  -b 'cookies=value' ..."
        />
        {curlInput && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm">
            {curlInput.length} 字符
          </div>
        )}
      </div>
      
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={onParseCurl}
          disabled={loading}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
        >
          <Settings className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '解析中...' : '🚀 解析Curl'}
        </button>
        {curlInput && (
          <button
            onClick={() => onCopyToClipboard(curlInput)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
          >
            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            📋 复制
          </button>
        )}
      </div>

      {/* 输入统计和快速操作 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 字符统计 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-semibold text-blue-700">字符统计</span>
            </div>
            <div className="text-lg font-bold text-blue-900">{curlInput.length}</div>
            <div className="text-xs text-blue-600">字符</div>
          </div>

          {/* 行数统计 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-semibold text-green-700">行数统计</span>
            </div>
            <div className="text-lg font-bold text-green-900">{curlInput.split('\n').length}</div>
            <div className="text-xs text-green-600">行</div>
          </div>

          {/* 参数预估 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-semibold text-purple-700">参数预估</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {curlInput.match(/-[HhBbXx]/g)?.length || 0}
            </div>
            <div className="text-xs text-purple-600">个参数</div>
          </div>

          {/* 复杂度评估 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-semibold text-orange-700">复杂度</span>
            </div>
            <div className="text-lg font-bold text-orange-900">
              {curlInput.length > 1000 ? '高' : curlInput.length > 500 ? '中' : '低'}
            </div>
            <div className="text-xs text-orange-600">复杂度</div>
          </div>
        </div>

        {/* 快速操作按钮 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCurlInput('')}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🗑️ 清空
          </button>
          <button
            onClick={() => {
              const textarea = document.querySelector('textarea');
              if (textarea) {
                textarea.focus();
                textarea.select();
              }
            }}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🎯 全选
          </button>
          <button
            onClick={() => {
              const formatted = curlInput
                .split('\\')
                .map(line => line.trim())
                .join(' \\\n  ');
              setCurlInput(formatted);
            }}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ✨ 格式化
          </button>
          <button
            onClick={() => {
              const minified = curlInput.replace(/\s+/g, ' ').trim();
              setCurlInput(minified);
            }}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📦 压缩
          </button>
        </div>
      </div>
    </div>
  );
}
