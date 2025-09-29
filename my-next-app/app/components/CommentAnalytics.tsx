'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Space,
  Button,
  Select,
  Spin,
  Alert,
  Typography,
  Divider,
  Tooltip,
  Badge,
  Empty,
  App
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  MessageOutlined,
  LikeOutlined,
  DislikeOutlined,
  MehOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  EyeOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { CommentWithAnalysis, SentimentAnalysisResult, BoomReasonAnalysisResult } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface CommentAnalyticsProps {
  productId?: string;
  onAnalyze?: (productId: string) => void;
}

const CommentAnalytics: React.FC<CommentAnalyticsProps> = ({ productId: propProductId, onAnalyze }) => {
  const { message } = App.useApp();
  const [comments, setComments] = useState<CommentWithAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<'sentiment_analysis' | 'boom_reason'>('sentiment_analysis');
  const [stats, setStats] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const [selectedProductId, setSelectedProductId] = useState<string>(propProductId || '');
  const [products, setProducts] = useState<any[]>([]);

  // 获取商品列表
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?action=list');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
        if (result.data.length > 0 && !selectedProductId) {
          setSelectedProductId(result.data[0].product_id);
        }
      } else {
        message.error('获取商品列表失败：' + result.error);
      }
    } catch (error) {
      message.error('获取商品列表失败');
      console.error('Error fetching products:', error);
    }
  };

  // 获取评论数据
  const fetchComments = async (productId: string) => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/comments?productId=${productId}`);
      const result = await response.json();
      
      if (result.success) {
        setComments(result.data as CommentWithAnalysis[]);
      } else {
        message.error('获取评论数据失败：' + result.error);
      }
    } catch (error) {
      message.error('获取评论数据失败');
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // 分析评论
  const analyzeComments = async () => {
    if (comments.length === 0) {
      message.warning('没有评论数据可分析');
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress({ current: 0, total: comments.length });
    
    try {
      // 逐条分析评论
      const updatedComments = [...comments];
      
      for (let i = 0; i < comments.length; i++) {
        try {
          const response = await fetch('/api/sentiment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              comments: [comments[i]],
              analysisType: analysisType
            }),
          });

          const result = await response.json();
          
          if (response.ok && result.comments && result.comments.length > 0) {
            updatedComments[i] = result.comments[0];
      } else {
            updatedComments[i] = {
              ...updatedComments[i],
              analysisError: result.error || '分析失败'
            };
          }
        } catch (error) {
          updatedComments[i] = {
            ...updatedComments[i],
            analysisError: '分析过程中出现错误'
          };
        }
        
        // 更新进度
        setAnalysisProgress({ current: i + 1, total: comments.length });
        
        // 更新评论列表（实时显示进度）
        setComments([...updatedComments]);
        
        // 添加小延迟，让用户看到进度
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      message.success(`分析完成！成功分析 ${updatedComments.filter(c => c.analysis).length} 条评论`);
      calculateStats(updatedComments);
      
    } catch (error) {
      message.error('分析过程中出现错误');
      console.error('Error analyzing comments:', error);
    } finally {
      setAnalyzing(false);
      setAnalysisProgress({ current: 0, total: 0 });
    }
  };

  // 计算统计数据
  const calculateStats = (commentsData: CommentWithAnalysis[]) => {
    const total = commentsData.length;
    const analyzed = commentsData.filter(c => c.analysis).length;
    const errors = commentsData.filter(c => c.analysisError).length;

    let sentimentStats = null;
    if (analysisType === 'sentiment_analysis') {
      const positive = commentsData.filter(c => 
        c.analysis && (c.analysis as SentimentAnalysisResult).emotion_type === 'positive'
      ).length;
      const negative = commentsData.filter(c => 
        c.analysis && (c.analysis as SentimentAnalysisResult).emotion_type === 'negative'
      ).length;
      const neutral = commentsData.filter(c => 
        c.analysis && (c.analysis as SentimentAnalysisResult).emotion_type === 'neutral'
      ).length;

      sentimentStats = {
        positive,
        negative,
        neutral,
        positiveRate: total > 0 ? Math.round((positive / total) * 100) : 0,
        negativeRate: total > 0 ? Math.round((negative / total) * 100) : 0,
        neutralRate: total > 0 ? Math.round((neutral / total) * 100) : 0,
      };
    }

    setStats({
      total,
      analyzed,
      errors,
      sentimentStats
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchComments(selectedProductId);
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (comments.length > 0) {
      calculateStats(comments);
    }
  }, [comments, analysisType]);

  // 获取情感标签颜色
  const getSentimentColor = (emotionType: string) => {
    switch (emotionType) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      case 'neutral': return 'blue';
      default: return 'default';
    }
  };

  // 获取情感图标
  const getSentimentIcon = (emotionType: string) => {
    switch (emotionType) {
      case 'positive': return <LikeOutlined />;
      case 'negative': return <DislikeOutlined />;
      case 'neutral': return <MehOutlined />;
      default: return <MessageOutlined />;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '用户',
      dataIndex: 'user_nick',
      key: 'user_nick',
      width: 100,
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 80 }}>
          {text}
        </Text>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (text: string) => (
        <Paragraph 
          ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
          style={{ margin: 0 }}
        >
          {text}
        </Paragraph>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating: number) => (
        <Badge 
          count={rating} 
          style={{ backgroundColor: rating >= 7 ? '#52c41a' : rating >= 4 ? '#faad14' : '#ff4d4f' }}
        />
      ),
    },
    {
      title: '分析结果',
      key: 'analysis',
      width: 200,
      render: (record: CommentWithAnalysis) => {
        if (record.analysisError) {
          return <Tag color="red">分析失败</Tag>;
        }
        
        if (!record.analysis) {
          return <Tag color="default">未分析</Tag>;
        }

        if (analysisType === 'sentiment_analysis') {
          const analysis = record.analysis as SentimentAnalysisResult;
          return (
            <Space direction="vertical" size="small">
              <Tag 
                color={getSentimentColor(analysis.emotion_type)}
                icon={getSentimentIcon(analysis.emotion_type)}
              >
                {analysis.emotion_type === 'positive' ? '正面' : 
                 analysis.emotion_type === 'negative' ? '负面' : '中性'}
              </Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                置信度: {Math.round(analysis.confidence_score * 100)}%
              </Text>
            </Space>
          );
        } else {
          const analysis = record.analysis as BoomReasonAnalysisResult;
          return (
            <Space direction="vertical" size="small">
              <Tag color="blue">{analysis.tag}</Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {analysis.reason}
              </Text>
            </Space>
          );
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (record: CommentWithAnalysis) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                // 这里可以添加查看详情的逻辑
                console.log('View details:', record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载评论数据中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <MessageOutlined /> 评论分析
            </Title>
            <Text type="secondary">
              共 {comments.length} 条评论
            </Text>
          </Col>
          <Col>
            <Space>
              <Select
                value={selectedProductId}
                onChange={setSelectedProductId}
                placeholder="选择商品"
                style={{ width: 200 }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {products.map(product => (
                  <Option key={product.product_id} value={product.product_id}>
                    {product.product_name} ({product.comment_count} 条评论)
                  </Option>
                ))}
              </Select>
              <Select
                value={analysisType}
                onChange={setAnalysisType}
                style={{ width: 150 }}
              >
                <Option value="sentiment_analysis">情感分析</Option>
                <Option value="boom_reason">爆火原因分析</Option>
              </Select>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={analyzing}
                onClick={analyzeComments}
                disabled={comments.length === 0}
              >
                {analyzing ? '分析中...' : '开始分析'}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchComments(selectedProductId)}
                disabled={!selectedProductId}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {!selectedProductId ? (
          <Empty 
            description="请先选择一个商品"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : comments.length === 0 ? (
          <Empty 
            description="该商品暂无评论数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => fetchComments(selectedProductId)}>
              重新加载
            </Button>
          </Empty>
        ) : analyzing ? (
          // 显示分析进度
          <Card style={{ textAlign: 'center', marginBottom: 24 }}>
            <Space direction="vertical" size="large">
              <div>
                <ThunderboltOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} spin />
                <Title level={3}>分析进行中...</Title>
                <Text type="secondary">
                  正在分析评论 {analysisProgress.current}/{analysisProgress.total}
                </Text>
              </div>
              <Progress 
                percent={Math.round((analysisProgress.current / analysisProgress.total) * 100)} 
                status="active" 
                strokeColor="#1890ff"
                style={{ maxWidth: 400, margin: '0 auto' }}
              />
              <Text type="secondary">
                {analysisType === 'sentiment_analysis' ? '情感分析' : '爆火原因分析'} 进行中...
              </Text>
            </Space>
          </Card>
        ) : (
          <>
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="总评论数"
                    value={stats?.total || 0}
                    prefix={<MessageOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="已分析"
                    value={stats?.analyzed || 0}
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="分析失败"
                    value={stats?.errors || 0}
                    prefix={<DislikeOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 情感分布 */}
            {analysisType === 'sentiment_analysis' && stats?.sentimentStats && (
              <Card title="情感分布" style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={stats.sentimentStats.positiveRate}
                        strokeColor="#52c41a"
                        format={() => (
                          <div>
                            <LikeOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
                            <div style={{ marginTop: '8px' }}>正面</div>
                </div>
                        )}
                      />
                      <div style={{ marginTop: '8px' }}>
                        {stats.sentimentStats.positive} 条评论
              </div>
            </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={stats.sentimentStats.negativeRate}
                        strokeColor="#ff4d4f"
                        format={() => (
                          <div>
                            <DislikeOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
                            <div style={{ marginTop: '8px' }}>负面</div>
            </div>
                        )}
                      />
                      <div style={{ marginTop: '8px' }}>
                        {stats.sentimentStats.negative} 条评论
                    </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={stats.sentimentStats.neutralRate}
                        strokeColor="#1890ff"
                        format={() => (
                          <div>
                            <MehOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                            <div style={{ marginTop: '8px' }}>中性</div>
                  </div>
                        )}
                      />
                      <div style={{ marginTop: '8px' }}>
                        {stats.sentimentStats.neutral} 条评论
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            {/* 错误提示 */}
            {stats?.errors > 0 && (
              <Alert
                message={`有 ${stats.errors} 条评论分析失败`}
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            {/* 评论表格 */}
            <Card title="评论详情">
              <Table
                columns={columns}
                dataSource={comments}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条评论`,
                }}
                scroll={{ x: 800 }}
              />
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};

export default CommentAnalytics;