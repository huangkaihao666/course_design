'use client';

import React from 'react';
import { Code, Database, Server } from 'lucide-react';

interface HeaderProps {
  activeTab: 'parser' | 'configs' | 'database';
  setActiveTab: (tab: 'parser' | 'configs' | 'database') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <>
      {/* 页头 */}
      <div className="mb-6 sm:mb-8 text-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Code className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Curl解析器 & 配置管理
          </h1>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          智能解析curl请求，一键提取参数，轻松管理爬虫配置
        </p>
      </div>

      {/* 标签页 */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-1 sm:p-2">
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('parser')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'parser'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Code className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Curl解析器</span>
              <span className="sm:hidden">解析器</span>
            </button>
            <button
              onClick={() => setActiveTab('configs')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'configs'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">配置管理</span>
              <span className="sm:hidden">配置</span>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'database'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Server className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">数据库</span>
              <span className="sm:hidden">数据</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
