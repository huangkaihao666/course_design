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
  Spin,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  RobotOutlined,
  BarChartOutlined,
  HeartOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface AnalysisProgressProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  totalComments: number;
  onViewResults: (analysisResult: any) => void;
}

interface AnalysisLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface AnalysisResult {
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
    avgSentiment: number;
  };
  boomReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  keyInsights: {
    insight: string;
    type: 'positive' | 'negative' | 'neutral';
  }[];
  recommendations: string[];
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  visible,
  onClose,
  productId,
  productName,
  totalComments,
  onViewResults
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'starting' | 'analyzing' | 'completed' | 'error'>('starting');
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    '初始化AI分析引擎',
    '加载评论数据',
    '情感分析处理',
    '爆款原因分析',
    '关键洞察提取',
    '生成改进建议',
    '生成分析报告'
  ];

  useEffect(() => {
    if (visible) {
      startAnalysis();
    }
  }, [visible]);

  const addLog = (message: string, type: AnalysisLog['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const startAnalysis = async () => {
    setProgress(0);
    setStatus('starting');
    setLogs([]);
    setCurrentStep(0);
    setAnalysisResult(null);

    addLog('开始AI评论分析...', 'info');
    addLog(`商品ID: ${productId}`, 'info');
    addLog(`商品名称: ${productName}`, 'info');
    addLog(`评论总数: ${totalComments}`, 'info');

    try {
      setStatus('analyzing');
      addLog('正在连接AI分析服务...', 'info');

      // 模拟分析进度
      const totalSteps = steps.length;
      let currentStepIndex = 0;

      const progressInterval = setInterval(() => {
        currentStepIndex++;
        setCurrentStep(currentStepIndex);
        const progressPercent = Math.min((currentStepIndex / totalSteps) * 100, 95);
        setProgress(progressPercent);

        if (currentStepIndex <= totalSteps) {
          addLog(`正在执行: ${steps[currentStepIndex - 1]}...`, 'info');
          
          // 模拟不同步骤的耗时
          if (currentStepIndex === 3) {
            addLog('检测到情感关键词: 满意、推荐、失望、质量好...', 'info');
          } else if (currentStepIndex === 4) {
            addLog('分析爆款原因: 性价比高、质量好、服务态度...', 'info');
          } else if (currentStepIndex === 5) {
            addLog('提取关键洞察: 用户最关注产品质量和性价比...', 'info');
          }
        }

        if (currentStepIndex >= totalSteps) {
          clearInterval(progressInterval);
          setProgress(100);
          setStatus('completed');
          addLog('AI分析完成！', 'success');
          addLog('正在生成分析报告...', 'info');
          
          // 模拟生成分析结果
          setTimeout(() => {
            const mockResult: AnalysisResult = {
              sentimentAnalysis: {
                positive: Math.floor(totalComments * 0.65),
                negative: Math.floor(totalComments * 0.15),
                neutral: Math.floor(totalComments * 0.20),
                avgSentiment: 3.8
              },
              boomReasons: [
                { reason: '性价比高', count: Math.floor(totalComments * 0.4), percentage: 40 },
                { reason: '质量好', count: Math.floor(totalComments * 0.35), percentage: 35 },
                { reason: '服务态度好', count: Math.floor(totalComments * 0.25), percentage: 25 }
              ],
              keyInsights: [
                { insight: '用户最关注产品的性价比', type: 'positive' },
                { insight: '质量问题是主要负面反馈', type: 'negative' },
                { insight: '服务态度获得一致好评', type: 'positive' }
              ],
              recommendations: [
                '继续保持高性价比策略',
                '加强产品质量控制',
                '继续提升客户服务质量'
              ]
            };
            
            setAnalysisResult(mockResult);
            addLog('分析报告生成完成！', 'success');
          }, 2000);
        }
      }, 1500);

    } catch (error) {
      setStatus('error');
      addLog(`分析失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'starting':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'analyzing':
        return <RobotOutlined style={{ color: '#1890ff' }} spin />;
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
      case 'analyzing':
        return `分析中... (${currentStep}/${steps.length} 步骤)`;
      case 'completed':
        return '分析完成';
      case 'error':
        return '分析失败';
      default:
        return '未知状态';
    }
  };

  const handleViewResults = () => {
    if (analysisResult) {
      onViewResults(analysisResult);
      onClose();
    }
  };

  return (
    <Modal
      title={
        <Space>
          {getStatusIcon()}
          <span>AI评论分析 - {productName}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        ...(status === 'completed' && analysisResult ? [
          <Button key="view" type="primary" icon={<EyeOutlined />} onClick={handleViewResults}>
            查看分析结果
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
            {currentStep > 0 && (
              <div>
                <Text strong>当前步骤: </Text>
                <Text>{steps[currentStep - 1]}</Text>
              </div>
            )}
          </Space>
        </Card>
      </div>

      {/* 分析结果预览 */}
      {analysisResult && (
        <div style={{ marginBottom: 24 }}>
          <Alert
            message="分析结果预览"
            description={
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="正面评论"
                    value={analysisResult.sentimentAnalysis.positive}
                    suffix={`(${((analysisResult.sentimentAnalysis.positive / totalComments) * 100).toFixed(1)}%)`}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<HeartOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="平均情感分"
                    value={analysisResult.sentimentAnalysis.avgSentiment}
                    suffix="/ 5"
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<BarChartOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="主要爆款原因"
                    value={analysisResult.boomReasons[0]?.reason || '无'}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
              </Row>
            }
            type="success"
            showIcon
          />
        </div>
      )}

      <div>
        <Title level={5}>分析日志</Title>
        <div style={{ 
          maxHeight: 300, 
          overflowY: 'auto', 
          border: '1px solid #f0f0f0', 
          borderRadius: 6,
          padding: 12
        }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
              <Spin size="small" /> 等待分析日志...
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

export default AnalysisProgress;
