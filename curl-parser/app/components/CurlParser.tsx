'use client';

import React, { useState, useEffect } from 'react';
import { ParsedCurl, SpiderConfig, ConfigPreset } from '../types';
import HelpGuide from './HelpGuide';
import Header from './parser/Header';
import MessageAlerts from './parser/MessageAlerts';
import CurlInputArea from './parser/CurlInputArea';
import ParseResultArea from './parser/ParseResultArea';
import SaveConfigArea from './parser/SaveConfigArea';
import ConfigManagementArea from './parser/ConfigManagementArea';
import DataManagementArea from './parser/DataManagementArea';

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
  const [activeTab, setActiveTab] = useState<'parser' | 'configs' | 'database'>('parser');

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
      // 保存到数据库
      const dbResponse = await fetch('/api/save-parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsedData,
          configName,
          configDescription,
        }),
      });

      const dbResult = await dbResponse.json();

      if (dbResult.success) {
        // 同时保存到本地配置文件（保持原有功能）
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
          setSuccess('配置已保存到数据库和本地文件！');
          setConfigName('');
          setConfigDescription('');
          loadConfigs();
        } else {
          setSuccess('配置已保存到数据库，但本地文件保存失败');
          setConfigName('');
          setConfigDescription('');
        }
      } else {
        setError(dbResult.error || '数据库保存失败');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full pb-8">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <MessageAlerts
          error={error}
          success={success}
          onDismissError={() => setError(null)}
          onDismissSuccess={() => setSuccess(null)}
        />

        {activeTab === 'parser' && (
          <div className="space-y-4 sm:space-y-6">
            {/* 帮助指南和Curl输入区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <CurlInputArea
                curlInput={curlInput}
                setCurlInput={setCurlInput}
                loading={loading}
                onParseCurl={parseCurl}
                onLoadSample={loadSampleCurl}
                onCopyToClipboard={copyToClipboard}
              />
              
              {/* 帮助指南 */}
              <div className="lg:col-span-1">
                <HelpGuide />
              </div>
            </div>

            {/* 解析结果 */}
            <ParseResultArea
              parsedData={parsedData}
              loading={loading}
              onExportConfig={exportConfig}
              onExportToSpiderSystem={exportToSpiderSystem}
              onCopyToClipboard={copyToClipboard}
            />

            {/* 保存配置 */}
            <SaveConfigArea
              parsedData={parsedData}
              configName={configName}
              setConfigName={setConfigName}
              configDescription={configDescription}
              setConfigDescription={setConfigDescription}
              onSaveConfig={saveConfig}
            />
          </div>
        )}

        {activeTab === 'configs' && (
          <ConfigManagementArea
            configs={configs}
            selectedConfig={selectedConfig}
            setSelectedConfig={setSelectedConfig}
            loading={loading}
            onDeleteConfig={deleteConfig}
            onExportConfig={exportConfig}
            onExportToSpiderSystem={exportToSpiderSystem}
            onCopyToClipboard={copyToClipboard}
            onSwitchToParser={() => setActiveTab('parser')}
          />
        )}

        {activeTab === 'database' && (
          <DataManagementArea
            onCopyToClipboard={copyToClipboard}
          />
        )}
      </div>
    </div>
  );
}