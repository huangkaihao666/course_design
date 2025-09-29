'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Progress,
  Tabs,
  List,
  Badge,
  Divider,
  Empty,
  App
} from 'antd';
import {
  DatabaseOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  ReloadOutlined,
  EyeOutlined,
  PieChartOutlined,
  LineChartOutlined,
  HeartOutlined,
  DislikeOutlined,
  MehOutlined,
  TrophyOutlined,
  RiseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface DashboardStats {
  totalComments: number;
  uniqueProducts: number;
  avgRating: number;
  totalConfigs: number;
  analyzedComments: number;
  sentimentStats: {
    positive: number;
    negative: number;
    neutral: number;
  };
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  productTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    time: string;
    count: number;
  }>;
}

interface ProductData {
  product_id: string;
  product_name: string;
  comment_count: number;
  created_at: string;
  avg_rating?: number;
  sentiment_positive?: number;
  sentiment_negative?: number;
  sentiment_neutral?: number;
}

const Dashboard: React.FC = () => {
  const { message } = App.useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/products?action=stats');
      const result = await response.json();
      
      if (result.success) {
        // 如果数据库中没有分析数据，显示提示
        if (result.data.analyzedComments === 0) {
          message.info('暂无分析数据，请先进行评论分析');
        }
        setStats(result.data);
      } else {
        message.error('获取统计数据失败：' + result.error);
      }
    } catch (error) {
      message.error('获取统计数据失败');
      console.error('Error fetching stats:', error);
    }
  };

  // 获取商品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products?action=list');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        message.error('获取商品列表失败：' + result.error);
      }
    } catch (error) {
      message.error('获取商品列表失败');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新所有数据
  const handleRefresh = () => {
    fetchStats();
    fetchProducts();
  };

  useEffect(() => {
    fetchStats();
    fetchProducts();
  }, []);

  const columns = [
    {
      title: '商品ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 120,
      render: (text: string) => (
        <Text code>{text}</Text>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
    },
    {
      title: '评论数量',
      dataIndex: 'comment_count',
      key: 'comment_count',
      width: 120,
      render: (count: number) => (
        <Tag color="blue">{count} 条</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ProductData) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            // 这里可以添加查看详情的逻辑
            console.log('View product:', record);
          }}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <BarChartOutlined /> 数据概览
          </Title>
          <Text type="secondary">
            系统整体数据统计和商品信息概览
          </Text>
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新数据
          </Button>
        </Col>
      </Row>

      {/* 核心统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总评论数"
              value={stats?.totalComments || 0}
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="商品数量"
              value={stats?.uniqueProducts || 0}
              prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="已分析评论"
              value={stats?.analyzedComments || 0}
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="爬虫配置"
              value={stats?.totalConfigs || 0}
              prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview" items={[
        {
          key: 'overview',
          label: '数据概览',
          children: (
            <Row gutter={[16, 16]}>
              {/* 情感分析统计 */}
              <Col xs={24} lg={12}>
                <Card title="情感分析分布" extra={<PieChartOutlined />}>
                  {stats?.analyzedComments === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Empty 
                        description="暂无分析数据"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        <Space direction="vertical">
                          <Text type="secondary">请先进行评论分析</Text>
                          <Button 
                            type="primary" 
                            icon={<ThunderboltOutlined />}
                            onClick={() => {
                              // 通过URL hash跳转到评论分析页面
                              window.location.hash = '#comment-analytics';
                            }}
                          >
                            开始分析评论
                          </Button>
                        </Space>
                      </Empty>
                    </div>
                  ) : (
                    <Row gutter={16}>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <Progress
                            type="circle"
                            percent={stats?.sentimentStats ? Math.round((stats.sentimentStats.positive / (stats.sentimentStats.positive + stats.sentimentStats.negative + stats.sentimentStats.neutral)) * 100) : 0}
                            strokeColor="#52c41a"
                            format={() => (
                              <div>
                                <div style={{ fontSize: 24, color: '#52c41a' }}>
                                  {stats?.sentimentStats?.positive || 0}
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
                            percent={stats?.sentimentStats ? Math.round((stats.sentimentStats.neutral / (stats.sentimentStats.positive + stats.sentimentStats.negative + stats.sentimentStats.neutral)) * 100) : 0}
                            strokeColor="#1890ff"
                            format={() => (
                              <div>
                                <div style={{ fontSize: 24, color: '#1890ff' }}>
                                  {stats?.sentimentStats?.neutral || 0}
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
                            percent={stats?.sentimentStats ? Math.round((stats.sentimentStats.negative / (stats.sentimentStats.positive + stats.sentimentStats.negative + stats.sentimentStats.neutral)) * 100) : 0}
                            strokeColor="#ff4d4f"
                            format={() => (
                              <div>
                                <div style={{ fontSize: 24, color: '#ff4d4f' }}>
                                  {stats?.sentimentStats?.negative || 0}
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>负面</div>
                              </div>
                            )}
                          />
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card>
              </Col>

              {/* 评分分布 */}
              <Col xs={24} lg={12}>
                <Card title="评分分布" extra={<LineChartOutlined />}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = stats?.ratingDistribution?.[rating as keyof typeof stats.ratingDistribution] || 0;
                      const total = Object.values(stats?.ratingDistribution || {}).reduce((sum, val) => sum + val, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={rating}>
                          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Space>
                              <Badge count={rating} style={{ backgroundColor: rating >= 4 ? '#52c41a' : rating >= 3 ? '#faad14' : '#ff4d4f' }} />
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
              </Col>

              {/* 商品类型分布 */}
              <Col xs={24} lg={12}>
                <Card title="商品类型分布" extra={<PieChartOutlined />}>
                  <List
                    dataSource={stats?.productTypes || []}
                    renderItem={(item) => (
                      <List.Item>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text strong>{item.type}</Text>
                            <Text type="secondary">{item.count}个商品</Text>
                          </div>
                          <Progress 
                            percent={item.percentage} 
                            size="small" 
                            strokeColor="#1890ff"
                            showInfo={false}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.percentage}% 占比
                          </Text>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              {/* 最近活动 */}
              <Col xs={24} lg={12}>
                <Card title="最近活动" extra={<TrophyOutlined />}>
                  <List
                    dataSource={stats?.recentActivity || []}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Badge 
                              count={item.count} 
                              style={{ backgroundColor: item.type === 'comment' ? '#1890ff' : '#52c41a' }}
                            />
                          }
                          title={item.description}
                          description={item.time}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: 'products',
          label: '商品列表',
          children: (
            <Card title="商品列表">
              <Table
                columns={columns}
                dataSource={products}
                rowKey="product_id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 个商品`,
                }}
                scroll={{ x: 600 }}
              />
            </Card>
          )
        }
      ]} />
    </div>
  );
};

export default Dashboard;
