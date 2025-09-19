'use client';

import React from 'react';
import { Database, Edit, Download, Upload, Trash2, Settings, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ConfigPreset, SpiderConfig } from '../../types';

interface ConfigManagementAreaProps {
  configs: ConfigPreset[];
  selectedConfig: ConfigPreset | null;
  setSelectedConfig: (config: ConfigPreset | null) => void;
  loading: boolean;
  onDeleteConfig: (id: string) => void;
  onExportConfig: (config: SpiderConfig) => void;
  onExportToSpiderSystem: (config: SpiderConfig) => void;
  onCopyToClipboard: (text: string) => void;
  onSwitchToParser: () => void;
}

export default function ConfigManagementArea({
  configs,
  selectedConfig,
  setSelectedConfig,
  loading,
  onDeleteConfig,
  onExportConfig,
  onExportToSpiderSystem,
  onCopyToClipboard,
  onSwitchToParser
}: ConfigManagementAreaProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 配置列表 */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-fit">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">保存的配置</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">管理你的爬虫配置预设</p>
            </div>
          </div>
        </div>
        
        {configs.length === 0 ? (
          <div className="p-6 sm:p-8 lg:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">暂无保存的配置</h4>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">先解析curl命令并保存配置，然后就可以在这里管理了</p>
            <button
              onClick={onSwitchToParser}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
            >
              ✨ 去解析Curl
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {configs.map((config, index) => (
              <div key={config.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 break-words min-w-0">{config.name}</h4>
                    </div>
                    {config.description && (
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 bg-white px-2 sm:px-3 py-2 rounded-lg border border-gray-200 break-words">{config.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
                      <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium break-words">
                        🛍️ 商品ID: {config.config.productId}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        📅 {new Date(config.createdAt).toLocaleDateString()}
                      </span>
                      {config.updatedAt !== config.createdAt && (
                        <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          🔄 更新: {new Date(config.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:ml-6 min-w-0">
                    <button
                      onClick={() => setSelectedConfig(config)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-1 sm:gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                    >
                      <Edit className="w-3 h-3" />
                      <span className="hidden sm:inline">👁️ 查看</span>
                      <span className="sm:hidden">👁️</span>
                    </button>
                    <button
                      onClick={() => onExportConfig(config.config)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-1 sm:gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">📥 导出</span>
                      <span className="sm:hidden">📥</span>
                    </button>
                    <button
                      onClick={() => onExportToSpiderSystem(config.config)}
                      disabled={loading}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 flex items-center gap-1 sm:gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                    >
                      <Upload className="w-3 h-3" />
                      <span className="hidden sm:inline">🚀 同步</span>
                      <span className="sm:hidden">🚀</span>
                    </button>
                    <button
                      onClick={() => onDeleteConfig(config.id)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 flex items-center gap-1 sm:gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">🗑️ 删除</span>
                      <span className="sm:hidden">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 配置详情 */}
      {selectedConfig && (
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 animate-in slide-in-from-bottom duration-300 min-h-fit">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">配置详情</h3>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{selectedConfig.name}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedConfig(null)}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors self-start sm:self-auto"
            >
              ✕
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-3 sm:px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              <span className="ml-2 sm:ml-4 text-gray-300 text-xs sm:text-sm font-mono">config.json</span>
            </div>
            <div className="max-h-64 sm:max-h-96 overflow-y-auto">
              <SyntaxHighlighter
                language="json"
                style={tomorrow}
                className="text-xs sm:text-sm"
                customStyle={{
                  background: 'transparent',
                  padding: '1rem',
                  margin: 0,
                  borderRadius: '0',
                  overflow: 'hidden'
                }}
              >
                {JSON.stringify(selectedConfig.config, null, 2)}
              </SyntaxHighlighter>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-start">
            <button
              onClick={() => onExportConfig(selectedConfig.config)}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-1 sm:gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">📥 导出JSON</span>
              <span className="sm:hidden">📥 导出</span>
            </button>
            <button
              onClick={() => onExportToSpiderSystem(selectedConfig.config)}
              disabled={loading}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 flex items-center gap-1 sm:gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">🚀 同步到爬虫</span>
              <span className="sm:hidden">🚀 同步</span>
            </button>
            <button
              onClick={() => onCopyToClipboard(JSON.stringify(selectedConfig.config, null, 2))}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-1 sm:gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">📋 复制JSON</span>
              <span className="sm:hidden">📋 复制</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
