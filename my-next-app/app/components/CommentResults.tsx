'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Spin,
  Tabs,
  App
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  StarOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Comment {
  id: number;
  product_id: string;
  product_name: string;
  user_nick: string;
  content: string;
  rating: number;
  date: string;
  useful_count: number;
  reply: string;
  sku_info: string;
  pics: string[];
  created_at: string;
}

interface CommentResultsProps {
  productId: string;
  productName?: string;
  onBack: () => void;
  onGoToAnalysis?: (productId: string) => void;
}

const CommentResults: React.FC<CommentResultsProps> = ({ productId, productName, onBack, onGoToAnalysis }) => {
  const { message } = App.useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalComments: 0,
    avgRating: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  // 获取评论数据
  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments?productId=${productId}`);
      const result = await response.json();
      
      if (result.success) {
        setComments(result.data);
        calculateStats(result.data);
        
        // 如果评论数据为空，提示用户先爬取数据
        if (result.data.length === 0) {
          message.warning('该商品暂无评论数据，请先进行爬取');
        }
      } else {
        message.error('获取评论数据失败');
      }
    } catch (error) {
      message.error('获取评论数据失败');
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const calculateStats = (commentData: Comment[]) => {
    const total = commentData.length;
    const avgRating = total > 0 ? commentData.reduce((sum, comment) => sum + comment.rating, 0) / total : 0;
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    commentData.forEach(comment => {
      if (comment.rating >= 1 && comment.rating <= 5) {
        distribution[comment.rating as keyof typeof distribution]++;
      }
    });

    setStats({
      totalComments: total,
      avgRating: Number(avgRating.toFixed(1)),
      ratingDistribution: distribution
    });
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  // 表格列定义
  const columns = [
    {
      title: '用户',
      dataIndex: 'user_nick',
      key: 'user_nick',
      width: 120,
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff' }}>{text}</Text>
      )
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating: number) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <Text strong>{rating}</Text>
        </Space>
      )
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: 300 }}>
          <Text>{text}</Text>
        </div>
      )
    },
    {
      title: '有用数',
      dataIndex: 'useful_count',
      key: 'useful_count',
      width: 80,
      render: (count: number) => count > 0 ? <Tag color="blue">{count}</Tag> : '-'
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  // 评分分布组件
  const RatingDistribution = () => (
    <Card title="评分分布" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        {[5, 4, 3, 2, 1].map(rating => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalComments > 0 ? (count / stats.totalComments) * 100 : 0;
          
          return (
            <div key={rating}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <StarOutlined style={{ color: '#faad14' }} />
                  <Text>{rating}星</Text>
                </Space>
                <Space>
                  <Text>{count}条</Text>
                  <Text type="secondary">({percentage.toFixed(1)}%)</Text>
                </Space>
              </Space>
              <Progress 
                percent={percentage} 
                size="small" 
                strokeColor={rating >= 4 ? '#52c41a' : rating >= 3 ? '#faad14' : '#ff4d4f'}
                showInfo={false}
              />
            </div>
          );
        })}
      </Space>
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      {/* 头部 */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchComments} loading={loading}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />}>
            导出数据
          </Button>
          {onGoToAnalysis && (
            <Button 
              icon={<BarChartOutlined />} 
              type="primary" 
              onClick={() => onGoToAnalysis(productId)}
            >
              进入评论分析
            </Button>
          )}
        </Space>
        
        <Title level={2}>
          <EyeOutlined style={{ marginRight: 8 }} />
          评论分析结果
        </Title>
        <Text type="secondary">商品: {productName || `ID: ${productId}`}</Text>
      </div>

      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总评论数"
              value={stats.totalComments}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均评分"
              value={stats.avgRating}
              precision={1}
              prefix={<StarOutlined />}
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="好评率"
              value={stats.totalComments > 0 ? 
                ((stats.ratingDistribution[5] + stats.ratingDistribution[4]) / stats.totalComments * 100).toFixed(1) : 0
              }
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="差评率"
              value={stats.totalComments > 0 ? 
                ((stats.ratingDistribution[1] + stats.ratingDistribution[2]) / stats.totalComments * 100).toFixed(1) : 0
              }
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 内容区域 */}
      <Tabs defaultActiveKey="comments">
        <TabPane tab="评论列表" key="comments">
          <Card>
            <Table
              columns={columns}
              dataSource={comments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条评论`
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="评分分析" key="rating">
          <Row gutter={16}>
            <Col span={12}>
              <RatingDistribution />
            </Col>
            <Col span={12}>
              <Card title="评分趋势" size="small">
                <Alert
                  message="评分趋势分析"
                  description="这里可以添加评分趋势图表，显示不同时间段的评分变化"
                  type="info"
                  showIcon
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="情感分析" key="sentiment">
          <Card>
            <Alert
              message="情感分析功能"
              description="这里可以集成AI情感分析功能，对评论进行情感倾向分析"
              type="info"
              showIcon
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CommentResults;
