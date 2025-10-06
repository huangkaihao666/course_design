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
  App,
  Image,
  Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  StarOutlined,
  BarChartOutlined,
  PictureOutlined,
  MessageOutlined,
  ShoppingOutlined
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

interface CrawlRecord {
  id: number;
  product_id: string;
  product_name: string;
  config_name?: string;
  created_at: string;
  last_crawl_at?: string;
  crawl_count: number;
  success_count: number;
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
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [crawlRecords, setCrawlRecords] = useState<CrawlRecord[]>([]);
  const [selectedCrawlRecord, setSelectedCrawlRecord] = useState<CrawlRecord | null>(null);

  // 获取爬取记录
  const fetchCrawlRecords = async () => {
    try {
      const response = await fetch(`/api/spider-configs?productId=${productId}`);
      const result = await response.json();
      
      if (result.success) {
        // 按创建时间降序排序（最新的在前）
        const sortedRecords = result.data.sort((a: CrawlRecord, b: CrawlRecord) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCrawlRecords(sortedRecords);
        // 如果有爬取记录，默认选择最新的
        if (sortedRecords.length > 0) {
          setSelectedCrawlRecord(sortedRecords[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching crawl records:', error);
    }
  };

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
    fetchCrawlRecords();
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
      width: 80,
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
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: 200 }}>
          <Text>{text}</Text>
        </div>
      )
    },
    {
      title: '图片',
      dataIndex: 'pics',
      key: 'pics',
      width: 100,
      render: (pics: string[]) => {
        if (!pics || pics.length === 0) return '-';
        return (
          <Button
            type="link"
            size="small"
            icon={<PictureOutlined style={{ color: '#52c41a' }} />}
            onClick={() => {
              setPreviewImages(pics);
              setImagePreviewVisible(true);
            }}
          >
            {pics.length}张
          </Button>
        );
      }
    },
    {
      title: 'SKU信息',
      dataIndex: 'sku_info',
      key: 'sku_info',
      width: 120,
      render: (sku: string) => {
        if (!sku || sku.trim() === '') return '-';
        return (
          <Space>
            <ShoppingOutlined style={{ color: '#1890ff' }} />
            <Text ellipsis style={{ maxWidth: 100 }} title={sku}>
              {sku}
            </Text>
          </Space>
        );
      }
    },
    {
      title: '回复',
      dataIndex: 'reply',
      key: 'reply',
      width: 120,
      render: (reply: string) => {
        if (!reply || reply.trim() === '') return '-';
        return (
          <Space>
            <MessageOutlined style={{ color: '#722ed1' }} />
            <Text ellipsis style={{ maxWidth: 100 }} title={reply}>
              {reply}
            </Text>
          </Space>
        );
      }
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
      width: 100,
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
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">商品: {productName || `ID: ${productId}`}</Text>
          {crawlRecords.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ marginRight: 8 }}>爬取记录:</Text>
              <Space wrap>
                {crawlRecords.map((record) => (
                  <Button
                    key={record.id}
                    size="small"
                    type={selectedCrawlRecord?.id === record.id ? 'primary' : 'default'}
                    onClick={() => setSelectedCrawlRecord(record)}
                    style={{ textAlign: 'left', height: 'auto', padding: '4px 8px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                        {record.product_name}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {record.config_name || `配置 ${record.id}`}
                        {record.last_crawl_at && (
                          <span style={{ marginLeft: 4 }}>
                            ({new Date(record.last_crawl_at).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </div>
      </div>

      {/* 爬取记录信息 */}
      {selectedCrawlRecord && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ margin: 0 }}>
                📊 当前爬取记录: {selectedCrawlRecord.product_name}
              </Title>
              <div style={{ marginTop: 4, fontSize: '14px', color: '#666' }}>
                配置: {selectedCrawlRecord.config_name || `配置 ${selectedCrawlRecord.id}`}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <Text type="secondary">创建时间: </Text>
                  <Text>{new Date(selectedCrawlRecord.created_at).toLocaleString()}</Text>
                </div>
                {selectedCrawlRecord.last_crawl_at && (
                  <div>
                    <Text type="secondary">最后爬取: </Text>
                    <Text>{new Date(selectedCrawlRecord.last_crawl_at).toLocaleString()}</Text>
                  </div>
                )}
                <div>
                  <Text type="secondary">爬取次数: </Text>
                  <Text strong style={{ color: '#1890ff' }}>{selectedCrawlRecord.crawl_count}</Text>
                </div>
                <div>
                  <Text type="secondary">成功次数: </Text>
                  <Text strong style={{ color: '#52c41a' }}>{selectedCrawlRecord.success_count}</Text>
                </div>
                <div>
                  <Text type="secondary">成功率: </Text>
                  <Text strong style={{ 
                    color: selectedCrawlRecord.crawl_count > 0 && 
                           (selectedCrawlRecord.success_count / selectedCrawlRecord.crawl_count) >= 0.8 
                           ? '#52c41a' : '#faad14' 
                  }}>
                    {selectedCrawlRecord.crawl_count > 0 
                      ? ((selectedCrawlRecord.success_count / selectedCrawlRecord.crawl_count) * 100).toFixed(1)
                      : 0}%
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

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
              scroll={{ x: 1200 }}
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

      {/* 图片预览Modal */}
      <Modal
        title="评论图片预览"
        open={imagePreviewVisible}
        onCancel={() => setImagePreviewVisible(false)}
        footer={null}
        width={800}
        centered
      >
        <Image.PreviewGroup>
          {previewImages.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`评论图片 ${index + 1}`}
              style={{ margin: '8px', maxWidth: '200px', maxHeight: '200px' }}
            />
          ))}
        </Image.PreviewGroup>
      </Modal>
    </div>
  );
};

export default CommentResults;
