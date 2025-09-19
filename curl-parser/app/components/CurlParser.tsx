'use client';

import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Download, 
  Upload, 
  Save, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Database
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ParsedCurl, SpiderConfig, ConfigPreset } from '../types';
import HelpGuide from './HelpGuide';

export default function CurlParser() {
  const [curlInput, setCurlInput] = useState('');
  const [parsedData, setParsedData] = useState<{
    parsed: ParsedCurl;
    config: SpiderConfig;
  } | null>(null);
  const [configs, setConfigs] = useState<ConfigPreset[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ConfigPreset | null>(null);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'parser' | 'configs'>('parser');

  // 加载保存的配置
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/config');
      const result = await response.json();
      if (result.success) {
        setConfigs(result.data);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const parseCurl = async () => {
    if (!curlInput.trim()) {
      setError('请输入curl命令');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse-curl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ curlCommand: curlInput }),
      });

      const result = await response.json();

      if (result.success) {
        setParsedData(result.data);
        setSuccess('curl命令解析成功！');
      } else {
        setError(result.error || '解析失败');
      }
    } catch (error) {
      setError('解析请求失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!parsedData || !configName.trim()) {
      setError('请先解析curl命令并输入配置名称');
      return;
    }

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configName,
          description: configDescription,
          config: parsedData.config,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('配置保存成功！');
        setConfigName('');
        setConfigDescription('');
        loadConfigs();
      } else {
        setError(result.error || '保存失败');
      }
    } catch (error) {
      setError('保存请求失败');
      console.error(error);
    }
  };

  const deleteConfig = async (id: string) => {
    if (!confirm('确定要删除这个配置吗？')) return;

    try {
      const response = await fetch(`/api/config?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('配置删除成功！');
        loadConfigs();
        if (selectedConfig?.id === id) {
          setSelectedConfig(null);
        }
      } else {
        setError(result.error || '删除失败');
      }
    } catch (error) {
      setError('删除请求失败');
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('已复制到剪贴板！');
    });
  };

  const exportConfig = (config: SpiderConfig) => {
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spider-config-${config.productId}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccess('配置文件已导出！');
  };

  const exportToSpiderSystem = async (config: SpiderConfig) => {
    try {
      setLoading(true);
      const response = await fetch('/api/export-to-spider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('配置已成功导出到爬虫系统！');
      } else {
        setError(result.error || '导出失败');
      }
    } catch (error) {
      setError('导出请求失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleCurl = () => {
    const sampleCurl = `curl 'https://h5api.m.taobao.com/h5/mtop.taobao.rate.detaillist.get/6.0/?jsv=2.7.4&appKey=12574478&t=1758284758370&sign=04c7df048bc9694ce772b76cd18f1ef3&api=mtop.taobao.rate.detaillist.get&v=6.0&isSec=0&ecode=1&timeout=20000&dataType=jsonp&valueType=string&type=jsonp&callback=mtopjsonp12&data=%7B%22showTrueCount%22%3Afalse%2C%22auctionNumId%22%3A%22943751893529%22%2C%22pageNo%22%3A1%2C%22pageSize%22%3A20%2C%22orderType%22%3A%22%22%2C%22searchImpr%22%3A%22-8%22%2C%22expression%22%3A%22%22%2C%22skuVids%22%3A%22%22%2C%22rateSrc%22%3A%22pc_rate_list%22%2C%22rateType%22%3A%22%22%7D' \\
  -H 'accept: */*' \\
  -H 'accept-language: zh-CN,zh;q=0.9' \\
  -H 'cache-control: no-cache' \\
  -b 't=8f8c6b0acfd465866dd8e9e2ef3f1e52; _tb_token_=e7f5e347e7467; thw=cn; sca=7620b646' \\
  -H 'pragma: no-cache' \\
  -H 'referer: https://item.taobao.com/' \\
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'`;
    setCurlInput(sampleCurl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页头 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Curl解析器 & 配置管理
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            智能解析curl请求，一键提取参数，轻松管理爬虫配置
          </p>
        </div>

        {/* 标签页 */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('parser')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'parser'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Code className="w-4 h-4" />
                Curl解析器
              </button>
              <button
                onClick={() => setActiveTab('configs')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'configs'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Database className="w-4 h-4" />
                配置管理
              </button>
            </nav>
          </div>
        </div>

        {/* 消息提示 */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-2xl shadow-lg flex items-center animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mr-3">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <span className="flex-1 font-medium">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-4 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-2xl shadow-lg flex items-center animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="flex-1 font-medium">{success}</span>
            <button 
              onClick={() => setSuccess(null)} 
              className="ml-4 w-6 h-6 flex items-center justify-center text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {activeTab === 'parser' && (
          <div className="space-y-6">
            {/* 帮助指南和Curl输入区域 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Curl输入区域 */}
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">输入Curl命令</h3>
                </div>
                <button
                  onClick={loadSampleCurl}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm"
                >
                  ✨ 加载示例
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={curlInput}
                  onChange={(e) => setCurlInput(e.target.value)}
                  className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-200 resize-none"
                  placeholder="🔗 在此粘贴你的curl命令...&#10;&#10;例如:&#10;curl 'https://h5api.m.taobao.com/...' \&#10;  -H 'accept: */*' \&#10;  -b 'cookies=value' ..."
                />
                {curlInput && (
                  <div className="absolute top-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm">
                    {curlInput.length} 字符
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={parseCurl}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Settings className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? '解析中...' : '🚀 解析Curl'}
                </button>
                {curlInput && (
                  <button
                    onClick={() => copyToClipboard(curlInput)}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    📋 复制
                  </button>
                )}
              </div>
              </div>
              
              {/* 帮助指南 */}
              <div className="xl:col-span-1">
                <HelpGuide />
              </div>
            </div>

            {/* 解析结果 */}
            {parsedData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 基本信息 */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">解析结果</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <label className="block text-sm font-semibold text-blue-700 mb-1">🌐 URL</label>
                      <p className="text-sm text-gray-700 break-all font-mono bg-white p-2 rounded-lg">{parsedData.parsed.url}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <label className="block text-sm font-semibold text-purple-700 mb-1">📡 请求方法</label>
                        <p className="text-sm text-gray-700 font-bold">{parsedData.parsed.method}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                        <label className="block text-sm font-semibold text-orange-700 mb-1">🛍️ 商品ID</label>
                        <p className="text-sm text-gray-700 font-bold">{parsedData.config.productId}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <label className="block text-sm font-semibold text-green-700 mb-1">📋 请求头</label>
                        <p className="text-sm text-gray-700 font-bold">{Object.keys(parsedData.parsed.headers).length} 个</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                        <label className="block text-sm font-semibold text-yellow-700 mb-1">🍪 Cookies</label>
                        <p className="text-sm text-gray-700 font-bold">{Object.keys(parsedData.parsed.cookies).length} 个</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 配置预览 */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">爬虫配置</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportConfig(parsedData.config)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Download className="w-4 h-4" />
                        📥 导出JSON
                      </button>
                      <button
                        onClick={() => exportToSpiderSystem(parsedData.config)}
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Upload className="w-4 h-4" />
                        🚀 同步到爬虫
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto bg-gray-900 rounded-xl border-2 border-gray-200">
                    <SyntaxHighlighter
                      language="json"
                      style={tomorrow}
                      className="text-xs"
                      customStyle={{
                        background: 'transparent',
                        padding: '1rem',
                        margin: 0,
                        borderRadius: '0.75rem'
                      }}
                    >
                      {JSON.stringify(parsedData.config, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            )}

            {/* 保存配置 */}
            {parsedData && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <Save className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">保存配置</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">📝 配置名称</label>
                    <input
                      type="text"
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-200"
                      placeholder="为这个配置起个名字..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">💭 配置描述</label>
                    <input
                      type="text"
                      value={configDescription}
                      onChange={(e) => setConfigDescription(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-200"
                      placeholder="简单描述一下用途（可选）"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={saveConfig}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    💾 保存配置
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'configs' && (
          <div className="space-y-6">
            {/* 配置列表 */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">保存的配置</h3>
                    <p className="text-sm text-gray-600 mt-1">管理你的爬虫配置预设</p>
                  </div>
                </div>
              </div>
              
              {configs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Database className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">暂无保存的配置</h4>
                  <p className="text-gray-600 mb-6">先解析curl命令并保存配置，然后就可以在这里管理了</p>
                  <button
                    onClick={() => setActiveTab('parser')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    ✨ 去解析Curl
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {configs.map((config, index) => (
                    <div key={config.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">{config.name}</h4>
                          </div>
                          {config.description && (
                            <p className="text-gray-700 mb-3 bg-white px-3 py-2 rounded-lg border border-gray-200">{config.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                              🛍️ 商品ID: {config.config.productId}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                              📅 {new Date(config.createdAt).toLocaleDateString()}
                            </span>
                            {config.updatedAt !== config.createdAt && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                🔄 更新: {new Date(config.updatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          <button
                            onClick={() => setSelectedConfig(config)}
                            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                          >
                            <Edit className="w-3 h-3" />
                            👁️ 查看
                          </button>
                          <button
                            onClick={() => exportConfig(config.config)}
                            className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                          >
                            <Download className="w-3 h-3" />
                            📥 导出
                          </button>
                          <button
                            onClick={() => exportToSpiderSystem(config.config)}
                            disabled={loading}
                            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                          >
                            <Upload className="w-3 h-3" />
                            🚀 同步
                          </button>
                          <button
                            onClick={() => deleteConfig(config.id)}
                            className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            🗑️ 删除
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
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">配置详情</h3>
                      <p className="text-sm text-gray-600">{selectedConfig.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConfig(null)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="bg-gray-900 rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="ml-4 text-gray-300 text-sm font-mono">config.json</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <SyntaxHighlighter
                      language="json"
                      style={tomorrow}
                      className="text-sm"
                      customStyle={{
                        background: 'transparent',
                        padding: '1.5rem',
                        margin: 0,
                        borderRadius: '0'
                      }}
                    >
                      {JSON.stringify(selectedConfig.config, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => exportConfig(selectedConfig.config)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    📥 导出JSON
                  </button>
                  <button
                    onClick={() => exportToSpiderSystem(selectedConfig.config)}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    🚀 同步到爬虫
                  </button>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedConfig.config, null, 2))}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    📋 复制JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
