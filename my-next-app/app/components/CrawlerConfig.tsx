'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Table,
  Tag,
  Popconfirm,
  Modal,
  Alert,
  App
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import CrawlProgress from './CrawlProgress';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CrawlerConfig {
  id?: number;
  product_id: string;
  product_name: string;
  cookies: string;
  max_pages: number;
  page_size: number;
  config_name?: string;
  config_description?: string;
  created_at?: string;
}

interface CrawlerConfigProps {
  onViewResults?: (productId: string) => void;
  onCrawlStart?: (config: CrawlerConfig) => void;
}

const CrawlerConfig: React.FC<CrawlerConfigProps> = ({ onViewResults, onCrawlStart }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [configs, setConfigs] = useState<CrawlerConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CrawlerConfig | null>(null);
  const [crawlProgressVisible, setCrawlProgressVisible] = useState(false);
  const [currentCrawlConfig, setCurrentCrawlConfig] = useState<CrawlerConfig | null>(null);

  // 获取爬虫配置列表
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spider-configs');
      const result = await response.json();
      
      if (result.success) {
        setConfigs(result.data);
      } else {
        message.error('获取配置列表失败：' + result.error);
      }
    } catch (error) {
      message.error('获取配置列表失败');
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存配置
  const handleSave = async (values: CrawlerConfig) => {
    try {
      const response = await fetch('/api/spider-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          id: editingConfig?.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        message.success(editingConfig ? '配置更新成功' : '配置保存成功');
        setModalVisible(false);
        setEditingConfig(null);
        form.resetFields();
        fetchConfigs();
      } else {
        message.error('保存失败：' + result.error);
      }
    } catch (error) {
      message.error('保存配置失败');
      console.error('Error saving config:', error);
    }
  };

  // 删除配置
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/spider-configs?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('配置删除成功');
        fetchConfigs();
      } else {
        message.error('删除失败：' + result.error);
      }
    } catch (error) {
      message.error('删除配置失败');
      console.error('Error deleting config:', error);
    }
  };

  // 开始爬取
  const handleCrawl = async (config: CrawlerConfig) => {
    setCurrentCrawlConfig(config);
    setCrawlProgressVisible(true);
    
    // 通知父组件爬取开始
    if (onCrawlStart) {
      onCrawlStart(config);
    }
  };

  // 查看爬取结果
  const handleViewResults = (productId: string) => {
    if (onViewResults) {
      onViewResults(productId);
    } else {
      message.info(`跳转到商品 ${productId} 的评论分析页面`);
    }
  };

  // 编辑配置
  const handleEdit = (config: CrawlerConfig) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setModalVisible(true);
  };

  // 新增配置
  const handleAdd = () => {
    setEditingConfig(null);
    form.resetFields();
    setModalVisible(true);
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const columns = [
    {
      title: '商品ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 120,
      render: (text: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150,
    },
    {
      title: 'Cookie状态',
      dataIndex: 'cookies',
      key: 'cookies',
      width: 120,
      render: (text: string) => (
        <Tag color={text ? 'green' : 'red'}>
          {text ? '已配置' : '未配置'}
        </Tag>
      ),
    },
    {
      title: '配置名称',
      dataIndex: 'config_name',
      key: 'config_name',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '最大页数',
      dataIndex: 'max_pages',
      key: 'max_pages',
      width: 100,
    },
    {
      title: '每页大小',
      dataIndex: 'page_size',
      key: 'page_size',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (text: string) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: CrawlerConfig) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleCrawl(record)}
          >
            爬取
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个配置吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <DatabaseOutlined /> 爬虫配置管理
            </Title>
            <Text type="secondary">
              管理商品评论爬取配置，设置商品ID、Cookie和爬取参数
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                size="large"
              >
                新增爬虫配置
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 快速配置提示 */}
        <Alert
          message="配置说明"
          description={
            <div>
              <p><strong>商品ID：</strong>从商品页面URL中获取的商品唯一标识符</p>
              <p><strong>Cookie：</strong>登录后的Cookie信息，用于身份验证</p>
              <p><strong>爬取参数：</strong>设置最大页数和每页评论数量</p>
              <p>点击"新增爬虫配置"按钮开始配置您的第一个爬虫任务</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Table
          columns={columns}
          dataSource={configs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条配置`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingConfig ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingConfig(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* 核心配置区域 */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            border: '1px solid #e9ecef'
          }}>
            <Title level={5} style={{ margin: '0 0 16px 0', color: '#1890ff' }}>
              🔧 核心配置
            </Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="product_id"
                  label="商品ID *"
                  rules={[{ required: true, message: '请输入商品ID' }]}
                >
                  <Input 
                    placeholder="请输入商品ID" 
                    size="large"
                    prefix="🛍️"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="product_name"
                  label="商品名称 *"
                  rules={[{ required: true, message: '请输入商品名称' }]}
                >
                  <Input 
                    placeholder="请输入商品名称" 
                    size="large"
                    prefix="📦"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="cookies"
              label="Cookie *"
              rules={[{ required: true, message: '请输入Cookie' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入完整的Cookie字符串，用于身份验证"
                style={{ fontSize: '14px' }}
              />
            </Form.Item>
          </div>

          {/* 爬取参数区域 */}
          <div style={{ 
            background: '#fff7e6', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            border: '1px solid #ffd591'
          }}>
            <Title level={5} style={{ margin: '0 0 16px 0', color: '#fa8c16' }}>
              ⚙️ 爬取参数
            </Title>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="max_pages"
                  label="最大页数"
                  rules={[{ required: true, message: '请输入最大页数' }]}
                  initialValue={3}
                >
                  <InputNumber
                    min={1}
                    max={50}
                    style={{ width: '100%' }}
                    placeholder="最大页数"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="page_size"
                  label="每页大小"
                  rules={[{ required: true, message: '请输入每页大小' }]}
                  initialValue={20}
                >
                  <InputNumber
                    min={1}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="每页大小"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* 可选配置区域 */}
          <div style={{ 
            background: '#f6ffed', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            border: '1px solid #b7eb8f'
          }}>
            <Title level={5} style={{ margin: '0 0 16px 0', color: '#52c41a' }}>
              📝 可选配置
            </Title>
            <Form.Item
              name="config_name"
              label="配置名称"
            >
              <Input placeholder="请输入配置名称（可选）" />
            </Form.Item>

            <Form.Item
              name="config_description"
              label="配置描述"
            >
              <TextArea
                rows={3}
                placeholder="请输入配置描述（可选）"
              />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingConfig ? '更新' : '保存'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 爬取进度弹窗 */}
      {currentCrawlConfig && (
        <CrawlProgress
          visible={crawlProgressVisible}
          onClose={() => setCrawlProgressVisible(false)}
          config={currentCrawlConfig}
          onViewResults={handleViewResults}
        />
      )}
    </div>
  );
};

export default CrawlerConfig;
