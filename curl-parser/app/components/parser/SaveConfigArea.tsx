'use client';

import React from 'react';
import { Save } from 'lucide-react';
import { SpiderConfig } from '../../types';

interface SaveConfigAreaProps {
  parsedData: {
    parsed: any;
    config: SpiderConfig;
  } | null;
  configName: string;
  setConfigName: (value: string) => void;
  configDescription: string;
  setConfigDescription: (value: string) => void;
  onSaveConfig: () => void;
}

export default function SaveConfigArea({
  parsedData,
  configName,
  setConfigName,
  configDescription,
  setConfigDescription,
  onSaveConfig
}: SaveConfigAreaProps) {
  if (!parsedData) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 min-h-fit">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <Save className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">保存配置</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">📝 配置名称</label>
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-200 text-sm"
            placeholder="为这个配置起个名字..."
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">💭 配置描述</label>
          <input
            type="text"
            value={configDescription}
            onChange={(e) => setConfigDescription(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-200 text-sm"
            placeholder="简单描述一下用途（可选）"
          />
        </div>
      </div>
      <div className="mt-4 sm:mt-6">
        <button
          onClick={onSaveConfig}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
        >
          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
          💾 保存配置
        </button>
      </div>
    </div>
  );
}
