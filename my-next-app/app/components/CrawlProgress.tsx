'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Progress,
  Typography,
  Space,
  Button,
  Card,
  List,
  Tag,
  Alert,
  Spin
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface CrawlProgressProps {
  visible: boolean;
  onClose: () => void;
  config: {
    product_id: string;
    product_name: string;
    max_pages: number;
    page_size: number;
  };
  onViewResults: (productId: string) => void;
}

interface CrawlLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const CrawlProgress: React.FC<CrawlProgressProps> = ({
  visible,
  onClose,
  config,
  onViewResults
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'starting' | 'crawling' | 'completed' | 'error'>('starting');
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [crawlResult, setCrawlResult] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (visible) {
      startCrawl();
    }
  }, [visible]);

  const addLog = (message: string, type: CrawlLog['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const startCrawl = async () => {
    setProgress(0);
    setStatus('starting');
    setLogs([]);
    setCurrentPage(0);
    setCrawlResult(null);

    addLog('开始爬取任务...', 'info');
    addLog(`商品ID: ${config.product_id}`, 'info');
    addLog(`商品名称: ${config.product_name}`, 'info');
    addLog(`最大页数: ${config.max_pages}`, 'info');
    addLog(`每页数量: ${config.page_size}`, 'info');

    try {
      setStatus('crawling');
      addLog('正在连接爬虫服务...', 'info');

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setCurrentPage(prev => {
          const newPage = prev + 1;
          const progressPercent = Math.min((newPage / config.max_pages) * 80, 80);
          setProgress(progressPercent);
          addLog(`正在爬取第 ${newPage} 页数据...`, 'info');
          return newPage;
        });
      }, 2000);

      // 真正调用爬取API
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: config.product_id,
          maxPages: config.max_pages,
          pageSize: config.page_size
        }),
      });

      // 停止模拟进度
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('爬取请求失败');
      }

      const result = await response.json();
      
      if (result.success) {
        setProgress(100);
        setStatus('completed');
        addLog('爬取完成！', 'success');
        addLog(`成功获取 ${result.data?.length || 0} 条评论`, 'success');
        addLog('数据已保存到数据库！', 'success');
        
        setCrawlResult({
          totalComments: result.data?.length || 0,
          pages: config.max_pages,
          success: true
        });
      } else {
        throw new Error(result.error || '爬取失败');
      }

    } catch (error) {
      setStatus('error');
      addLog(`爬取失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'starting':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'crawling':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <LoadingOutlined />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'starting':
        return '准备中...';
      case 'crawling':
        return `爬取中... (${currentPage}/${config.max_pages} 页)`;
      case 'completed':
        return '爬取完成';
      case 'error':
        return '爬取失败';
      default:
        return '未知状态';
    }
  };

  const handleViewResults = () => {
    onViewResults(config.product_id);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          {getStatusIcon()}
          <span>爬取进度 - {config.product_name}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        ...(status === 'completed' ? [
          <Button key="view" type="primary" icon={<EyeOutlined />} onClick={handleViewResults}>
            查看结果
          </Button>
        ] : [])
      ]}
      maskClosable={false}
      closable={status === 'completed' || status === 'error'}
    >
      <div style={{ marginBottom: 24 }}>
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>当前状态: </Text>
              <Tag color={status === 'completed' ? 'success' : status === 'error' ? 'error' : 'processing'}>
                {getStatusText()}
              </Tag>
            </div>
            <div>
              <Text strong>进度: </Text>
              <Progress 
                percent={Math.round(progress)} 
                status={status === 'error' ? 'exception' : status === 'completed' ? 'success' : 'active'}
                strokeColor={status === 'completed' ? '#52c41a' : '#1890ff'}
              />
            </div>
            {crawlResult && (
              <Alert
                message="爬取结果"
                description={
                  <div>
                    <p>总评论数: {crawlResult.totalComments}</p>
                    <p>爬取页数: {crawlResult.pages}</p>
                    <p>状态: 成功</p>
                  </div>
                }
                type="success"
                showIcon
              />
            )}
          </Space>
        </Card>
      </div>

      <div>
        <Title level={5}>执行日志</Title>
        <div style={{ 
          maxHeight: 300, 
          overflowY: 'auto', 
          border: '1px solid #f0f0f0', 
          borderRadius: 6,
          padding: 12
        }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
              <Spin size="small" /> 等待日志...
            </div>
          ) : (
            <List
              size="small"
              dataSource={logs}
              renderItem={(log) => (
                <List.Item style={{ padding: '4px 0' }}>
                  <Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      [{log.timestamp}]
                    </Text>
                    <Text 
                      type={log.type === 'error' ? 'danger' : log.type === 'success' ? 'success' : undefined}
                    >
                      {log.message}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CrawlProgress;
