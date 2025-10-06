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
  App,
  Spin
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
  RiseOutlined,
  ShoppingOutlined,
  StarOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

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
  const [chartLoading, setChartLoading] = useState(false);

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
    setChartLoading(true);
    fetchStats();
    fetchProducts();
    setTimeout(() => setChartLoading(false), 1000);
  };

  // 情感分析饼图配置
  const sentimentChartData = {
    labels: ['正面', '负面', '中性'],
    datasets: [
      {
        data: [
          stats?.sentimentStats?.positive || 0,
          stats?.sentimentStats?.negative || 0,
          stats?.sentimentStats?.neutral || 0
        ],
        backgroundColor: [
          '#52c41a',
          '#ff4d4f',
          '#1890ff'
        ],
        borderColor: [
          '#52c41a',
          '#ff4d4f',
          '#1890ff'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const sentimentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}条 (${percentage}%)`;
          }
        }
      }
    }
  };

  // 评分分布柱状图配置
  const ratingChartData = {
    labels: ['1星', '2星', '3星', '4星', '5星'],
    datasets: [
      {
        label: '评论数量',
        data: [
          stats?.ratingDistribution?.[1] || 0,
          stats?.ratingDistribution?.[2] || 0,
          stats?.ratingDistribution?.[3] || 0,
          stats?.ratingDistribution?.[4] || 0,
          stats?.ratingDistribution?.[5] || 0
        ],
        backgroundColor: [
          '#ff4d4f',
          '#ff7a45',
          '#faad14',
          '#52c41a',
          '#1890ff'
        ],
        borderColor: [
          '#ff4d4f',
          '#ff7a45',
          '#faad14',
          '#52c41a',
          '#1890ff'
        ],
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const ratingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}条 (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // 商品类型分布环形图配置
  const productTypeChartData = {
    labels: stats?.productTypes?.map(item => item.type) || [],
    datasets: [
      {
        data: stats?.productTypes?.map(item => item.count) || [],
        backgroundColor: [
          '#1890ff',
          '#52c41a',
          '#faad14',
          '#ff4d4f',
          '#722ed1',
          '#13c2c2',
          '#eb2f96'
        ],
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  const productTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}个 (${percentage}%)`;
          }
        }
      }
    }
  };

  // 商品评论数量排行图配置
  const productRankingData = {
    labels: products.slice(0, 10).map(p => p.product_name || `商品${p.product_id}`),
    datasets: [
      {
        label: '评论数量',
        data: products.slice(0, 10).map(p => p.comment_count),
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const productRankingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
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
              {/* 情感分析饼图 */}
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <HeartOutlined style={{ color: '#ff4d4f' }} />
                      <span>情感分析分布</span>
                    </Space>
                  }
                  extra={<PieChartOutlined />}
                >
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
                              window.location.hash = '#comment-analytics';
                            }}
                          >
                            开始分析评论
                          </Button>
                        </Space>
                      </Empty>
                    </div>
                  ) : (
                    <div style={{ height: '300px', position: 'relative' }}>
                      <Spin spinning={chartLoading} tip="加载图表中...">
                        <Pie data={sentimentChartData} options={sentimentChartOptions} />
                      </Spin>
                    </div>
                  )}
                </Card>
              </Col>

              {/* 评分分布柱状图 */}
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <StarOutlined style={{ color: '#faad14' }} />
                      <span>评分分布</span>
                    </Space>
                  }
                  extra={<BarChartOutlined />}
                >
                  <div style={{ height: '300px', position: 'relative' }}>
                    <Spin spinning={chartLoading} tip="加载图表中...">
                      <Bar data={ratingChartData} options={ratingChartOptions} />
                    </Spin>
                  </div>
                </Card>
              </Col>

              {/* 商品类型分布环形图 */}
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <ShoppingOutlined style={{ color: '#1890ff' }} />
                      <span>商品类型分布</span>
                    </Space>
                  }
                  extra={<PieChartOutlined />}
                >
                  <div style={{ height: '300px', position: 'relative' }}>
                    <Spin spinning={chartLoading} tip="加载图表中...">
                      <Doughnut data={productTypeChartData} options={productTypeChartOptions} />
                    </Spin>
                  </div>
                </Card>
              </Col>

              {/* 商品评论数量排行 */}
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <RiseOutlined style={{ color: '#52c41a' }} />
                      <span>热门商品排行</span>
                    </Space>
                  }
                  extra={<TrophyOutlined />}
                >
                  <div style={{ height: '300px', position: 'relative' }}>
                    <Spin spinning={chartLoading} tip="加载图表中...">
                      <Bar data={productRankingData} options={productRankingOptions} />
                    </Spin>
                  </div>
                </Card>
              </Col>

              {/* 最近活动 */}
              <Col xs={24}>
                <Card 
                  title={
                    <Space>
                      <TrophyOutlined style={{ color: '#722ed1' }} />
                      <span>最近活动</span>
                    </Space>
                  }
                  extra={<RiseOutlined />}
                >
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
