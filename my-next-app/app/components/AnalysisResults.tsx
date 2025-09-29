'use client';

import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Progress,
  Tag,
  List,
  Statistic,
  Alert,
  Divider,
  Timeline,
  Badge
} from 'antd';
import {
  ArrowLeftOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  BulbOutlined,
  TrophyOutlined,
  RiseOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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

interface AnalysisResultsProps {
  productId: string;
  productName: string;
  totalComments: number;
  analysisResult: AnalysisResult;
  onBack: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  productId,
  productName,
  totalComments,
  analysisResult,
  onBack
}) => {
  const getSentimentColor = (type: string) => {
    switch (type) {
      case 'positive': return '#52c41a';
      case 'negative': return '#ff4d4f';
      case 'neutral': return '#1890ff';
      default: return '#666';
    }
  };

  const getSentimentIcon = (type: string) => {
    switch (type) {
      case 'positive': return <HeartOutlined style={{ color: '#52c41a' }} />;
      case 'negative': return <ThunderboltOutlined style={{ color: '#ff4d4f' }} />;
      case 'neutral': return <BarChartOutlined style={{ color: '#1890ff' }} />;
      default: return <EyeOutlined />;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 头部 */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回
          </Button>
        </Space>
        
        <Title level={2}>
          <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
          AI评论分析结果
        </Title>
        <Text type="secondary">商品: {productName} (ID: {productId}) | 总评论数: {totalComments}</Text>
      </div>

      {/* 情感分析概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="正面评论"
              value={analysisResult.sentimentAnalysis.positive}
              suffix={`(${((analysisResult.sentimentAnalysis.positive / totalComments) * 100).toFixed(1)}%)`}
              valueStyle={{ color: '#52c41a' }}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="负面评论"
              value={analysisResult.sentimentAnalysis.negative}
              suffix={`(${((analysisResult.sentimentAnalysis.negative / totalComments) * 100).toFixed(1)}%)`}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="中性评论"
              value={analysisResult.sentimentAnalysis.neutral}
              suffix={`(${((analysisResult.sentimentAnalysis.neutral / totalComments) * 100).toFixed(1)}%)`}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均情感分"
              value={analysisResult.sentimentAnalysis.avgSentiment}
              suffix="/ 5"
              valueStyle={{ color: '#faad14' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 爆款原因分析 */}
        <Col span={12}>
          <Card title="🔥 爆款原因分析" extra={<ThunderboltOutlined />}>
            <List
              dataSource={analysisResult.boomReasons}
              renderItem={(item, index) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Space>
                        <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                        <Text strong>{item.reason}</Text>
                      </Space>
                      <Text type="secondary">{item.count}条评论</Text>
                    </div>
                    <Progress 
                      percent={item.percentage} 
                      size="small" 
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.percentage}% 的用户提到此原因
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 关键洞察 */}
        <Col span={12}>
          <Card title="💡 关键洞察" extra={<BulbOutlined />}>
            <Timeline
              items={analysisResult.keyInsights.map((insight, index) => ({
                dot: getSentimentIcon(insight.type),
                children: (
                  <div>
                    <Text style={{ color: getSentimentColor(insight.type) }}>
                      {insight.insight}
                    </Text>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 改进建议 */}
      <Card title="📋 改进建议" extra={<TrophyOutlined />}>
        <List
          dataSource={analysisResult.recommendations}
          renderItem={(recommendation, index) => (
            <List.Item>
              <Space>
                <Badge count={index + 1} style={{ backgroundColor: '#52c41a' }} />
                <Text>{recommendation}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* 情感分布图 */}
      <Card title="📊 情感分布" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Math.round((analysisResult.sentimentAnalysis.positive / totalComments) * 100)}
                strokeColor="#52c41a"
                format={() => (
                  <div>
                    <div style={{ fontSize: 24, color: '#52c41a' }}>
                      {analysisResult.sentimentAnalysis.positive}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>正面</div>
                  </div>
                )}
              />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Math.round((analysisResult.sentimentAnalysis.neutral / totalComments) * 100)}
                strokeColor="#1890ff"
                format={() => (
                  <div>
                    <div style={{ fontSize: 24, color: '#1890ff' }}>
                      {analysisResult.sentimentAnalysis.neutral}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>中性</div>
                  </div>
                )}
              />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Math.round((analysisResult.sentimentAnalysis.negative / totalComments) * 100)}
                strokeColor="#ff4d4f"
                format={() => (
                  <div>
                    <div style={{ fontSize: 24, color: '#ff4d4f' }}>
                      {analysisResult.sentimentAnalysis.negative}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>负面</div>
                  </div>
                )}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* 总结 */}
      <Alert
        message="分析总结"
        description={
          <div>
            <Paragraph>
              基于对 <Text strong>{totalComments}</Text> 条评论的AI分析，该商品整体表现{' '}
              <Tag color={analysisResult.sentimentAnalysis.avgSentiment >= 4 ? 'success' : 'warning'}>
                {analysisResult.sentimentAnalysis.avgSentiment >= 4 ? '优秀' : '良好'}
              </Tag>
              ，主要优势是 <Text strong>{analysisResult.boomReasons[0]?.reason}</Text>，
              建议重点关注 <Text strong>{analysisResult.recommendations[0]}</Text>。
            </Paragraph>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default AnalysisResults;
