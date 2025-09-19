'use client';

import React from 'react';
import { 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  Code, 
  Download,
  Settings,
  Upload,
  Zap
} from 'lucide-react';

export default function HelpGuide() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">📚 使用指南</h3>
      </div>

      {/* 使用步骤 */}
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            1
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🔍 获取curl命令</h4>
            <p className="text-gray-600 text-sm mb-3">
              打开浏览器开发者工具，访问淘宝/天猫商品页面，在Network标签中找到评论API请求，复制为curl格式。
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-700 font-mono">
                curl 'https://h5api.m.taobao.com/h5/mtop.taobao.rate.detaillist.get/6.0/...'
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            2
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">⚡ 解析curl命令</h4>
            <p className="text-gray-600 text-sm mb-3">
              将curl命令粘贴到输入框，点击"🚀 解析Curl"按钮，系统会自动提取所有参数。
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Code className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">智能提取：URL、请求头、Cookies、商品ID等</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            3
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💾 保存配置</h4>
            <p className="text-gray-600 text-sm mb-3">
              为解析的配置命名并保存，方便以后复用和管理多个商品的配置。
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">支持配置管理、导出、删除等操作</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            4
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🚀 导出使用</h4>
            <p className="text-gray-600 text-sm mb-3">
              将配置导出为JSON文件或直接同步到爬虫系统，开始抓取数据。
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">导出JSON</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600">同步到爬虫</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能特性 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">✨ 功能特性</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>智能解析curl命令</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>自动提取商品ID</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>配置保存管理</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>一键导出配置</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>爬虫系统集成</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>美观现代界面</span>
          </div>
        </div>
      </div>

      {/* 快速链接 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-semibold text-gray-900 text-sm">🎯 快速开始</h5>
            <p className="text-xs text-gray-600 mt-1">点击下方按钮加载示例curl命令</p>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Zap className="w-4 h-4" />
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
