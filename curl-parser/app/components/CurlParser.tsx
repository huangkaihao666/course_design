'use client';

import React, { useState } from 'react';
import { ParsedCurl, SpiderConfig } from '../types';
import { App, Modal, Input, Form, Button } from 'antd';
import HelpGuide from './HelpGuide';
import Header from './parser/Header';
import MessageAlerts from './parser/MessageAlerts';
import CurlInputArea from './parser/CurlInputArea';
import ParseResultArea from './parser/ParseResultArea';
// 配置管理区域已移除
import DataManagementArea from './parser/DataManagementArea';

export default function CurlParser() {
  const { message } = App.useApp();
  const [curlInput, setCurlInput] = useState('');
  const [parsedData, setParsedData] = useState<{
    parsed: ParsedCurl;
    config: SpiderConfig;
  } | null>(null);
  // 配置管理状态已移除
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'parser' | 'database'>('parser');
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 配置管理逻辑已移除

  const parseCurl = async () => {
    if (!curlInput.trim()) {
      message.error('请输入curl命令');
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text);
        throw new Error('服务器返回了非JSON格式的响应');
      }

      const result = await response.json();

      if (result.success) {
        setParsedData(result.data);
        message.success('🎉 Curl命令解析成功！');
        // 显示保存确认对话框
        setSaveModalVisible(true);
      } else {
        message.error(result.error || '解析失败');
        setError(result.error || '解析失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
      setError('解析请求失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 配置删除逻辑已移除

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('📋 已复制到剪贴板！');
    }).catch(() => {
      message.error('复制失败，请手动复制');
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

  // 导出到爬虫系统逻辑已移除

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
    message.info('📝 示例curl命令已加载');
  };

  // 保存到数据库
  const handleSaveToDatabase = async (values: { productName: string; configName: string; configDescription: string }) => {
    if (!parsedData) return;

    try {
      setLoading(true);
      const saveResponse = await fetch('/api/save-parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsedData: {
            ...parsedData,
            config: {
              ...parsedData.config,
              productName: values.productName
            }
          },
          configName: values.configName,
          configDescription: values.configDescription,
        }),
      });

      const saveResult = await saveResponse.json();
      if (saveResult.success) {
        message.success('💾 数据已成功保存到数据库！');
        setSaveModalVisible(false);
        form.resetFields();
      } else {
        message.error('保存到数据库失败：' + saveResult.error);
      }
    } catch (saveError) {
      message.error('保存到数据库失败');
      console.error('保存到数据库失败:', saveError);
    } finally {
      setLoading(false);
    }
  };

  // 取消保存
  const handleCancelSave = () => {
    setSaveModalVisible(false);
    form.resetFields();
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
              onCopyToClipboard={copyToClipboard}
            />

          </div>
        )}

        {/* 配置管理界面已移除 */}

        {activeTab === 'database' && (
          <DataManagementArea
            onCopyToClipboard={copyToClipboard}
          />
        )}

        {/* 保存确认对话框 */}
        <Modal
          title="💾 保存配置到数据库"
          open={saveModalVisible}
          onCancel={handleCancelSave}
          footer={null}
          width={600}
          centered
        >
          <div className="p-4">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 解析信息</h4>
              <div className="text-sm text-blue-700">
                <p><strong>商品ID:</strong> {parsedData?.config.productId}</p>
                <p><strong>请求方法:</strong> {parsedData?.parsed.method}</p>
                <p><strong>URL:</strong> <span className="text-xs break-all">{parsedData?.parsed.url}</span></p>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveToDatabase}
              initialValues={{
                configName: `解析配置_${new Date().toLocaleString()}`,
                configDescription: '通过curl解析器生成的爬虫配置'
              }}
            >
              <Form.Item
                name="productName"
                label="🛍️ 商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
                extra="请输入这个curl请求对应的商品名称，这将用于爬虫配置管理"
              >
                <Input 
                  placeholder="例如：iPhone 15 Pro Max 256GB 深空黑色"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="configName"
                label="📝 配置名称"
                rules={[{ required: true, message: '请输入配置名称' }]}
              >
                <Input 
                  placeholder="配置名称"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="configDescription"
                label="📄 配置描述"
              >
                <Input.TextArea 
                  rows={3}
                  placeholder="配置描述（可选）"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex justify-end gap-3">
                  <Button onClick={handleCancelSave} size="large">
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    💾 保存到数据库
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </div>
  );
}