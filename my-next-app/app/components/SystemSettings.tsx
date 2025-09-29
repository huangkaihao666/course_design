'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Typography,
  Row,
  Col,
  Divider,
  Space,
  App,
  Alert,
  Statistic,
  Progress
} from 'antd';
import {
  SettingOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SystemSettings {
  database: {
    host: string;
    user: string;
    database: string;
    port: number;
  };
  aibox: {
    baseUrl: string;
    defaultTimeout: number;
    maxRetries: number;
  };
  crawler: {
    defaultMaxPages: number;
    defaultPageSize: number;
    requestDelay: number;
  };
  analysis: {
    batchSize: number;
    analysisDelay: number;
    enableCache: boolean;
  };
}

const SystemSettings: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);

  // 获取系统统计信息
  const fetchSystemStats = async () => {
    try {
      const [productsRes, workflowsRes] = await Promise.all([
        fetch('/api/products?action=stats'),
        fetch('/api/workflow-configs')
      ]);

      const productsResult = await productsRes.json();
      const workflowsResult = await workflowsRes.json();

      if (productsResult.success && workflowsResult.success) {
        setSystemStats({
          totalComments: productsResult.data.totalComments,
          uniqueProducts: productsResult.data.uniqueProducts,
          avgRating: productsResult.data.avgRating,
          totalWorkflows: workflowsResult.data.length,
          activeWorkflows: workflowsResult.data.filter((w: any) => w.is_active).length
        });
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  // 保存设置
  const handleSave = async (values: SystemSettings) => {
    setLoading(true);
    try {
      // 这里应该调用API保存设置到数据库
      // 目前只是模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('系统设置保存成功');
    } catch (error) {
      message.error('保存设置失败');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // 重置设置
  const handleReset = () => {
    form.resetFields();
    message.info('设置已重置为默认值');
  };

  // 测试数据库连接
  const testDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/products?action=stats');
      const result = await response.json();
      
      if (result.success) {
        message.success('数据库连接正常');
      } else {
        message.error('数据库连接失败：' + result.error);
      }
    } catch (error) {
      message.error('数据库连接测试失败');
    }
  };

  // 测试AIBox连接
  const testAIBoxConnection = async () => {
    try {
      const response = await fetch('/api/aibox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-config'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        message.success('AIBox连接正常');
      } else {
        message.error('AIBox连接失败：' + result.error);
      }
    } catch (error) {
      message.error('AIBox连接测试失败');
    }
  };

  useEffect(() => {
    fetchSystemStats();
    
    // 设置默认值
    form.setFieldsValue({
      database: {
        host: 'localhost',
        user: 'huangkaihao',
        database: 'curl_parser_db',
        port: 3306
      },
      aibox: {
        baseUrl: 'https://aibox.sankuai.com/aibox/chat',
        defaultTimeout: 30000,
        maxRetries: 3
      },
      crawler: {
        defaultMaxPages: 3,
        defaultPageSize: 20,
        requestDelay: 1000
      },
      analysis: {
        batchSize: 10,
        analysisDelay: 500,
        enableCache: true
      }
    });
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* 系统概览 */}
        <Col span={24}>
          <Card>
            <Title level={3} style={{ margin: 0, marginBottom: '16px' }}>
              <SettingOutlined /> 系统概览
            </Title>
            {systemStats && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={6}>
                  <Statistic
                    title="总评论数"
                    value={systemStats.totalComments}
                    prefix={<DatabaseOutlined />}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Statistic
                    title="商品数量"
                    value={systemStats.uniqueProducts}
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Statistic
                    title="工作流总数"
                    value={systemStats.totalWorkflows}
                    prefix={<ApiOutlined />}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Statistic
                    title="活跃工作流"
                    value={systemStats.activeWorkflows}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
              </Row>
            )}
            <div style={{ marginTop: '16px' }}>
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchSystemStats}
                >
                  刷新统计
                </Button>
                <Button 
                  icon={<DatabaseOutlined />} 
                  onClick={testDatabaseConnection}
                >
                  测试数据库
                </Button>
                <Button 
                  icon={<ApiOutlined />} 
                  onClick={testAIBoxConnection}
                >
                  测试AIBox
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* 数据库设置 */}
        <Col xs={24} lg={12}>
          <Card title="数据库设置">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <Form.Item
                name={['database', 'host']}
                label="数据库主机"
                rules={[{ required: true, message: '请输入数据库主机' }]}
              >
                <Input placeholder="localhost" />
              </Form.Item>

              <Form.Item
                name={['database', 'user']}
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="用户名" />
              </Form.Item>

              <Form.Item
                name={['database', 'database']}
                label="数据库名"
                rules={[{ required: true, message: '请输入数据库名' }]}
              >
                <Input placeholder="数据库名" />
              </Form.Item>

              <Form.Item
                name={['database', 'port']}
                label="端口"
                rules={[{ required: true, message: '请输入端口' }]}
              >
                <Input type="number" placeholder="3306" />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* AIBox设置 */}
        <Col xs={24} lg={12}>
          <Card title="AIBox设置">
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name={['aibox', 'baseUrl']}
                label="API地址"
                rules={[{ required: true, message: '请输入API地址' }]}
              >
                <Input placeholder="https://aibox.sankuai.com/aibox/chat" />
              </Form.Item>

              <Form.Item
                name={['aibox', 'defaultTimeout']}
                label="默认超时时间(ms)"
                rules={[{ required: true, message: '请输入超时时间' }]}
              >
                <Input type="number" placeholder="30000" />
              </Form.Item>

              <Form.Item
                name={['aibox', 'maxRetries']}
                label="最大重试次数"
                rules={[{ required: true, message: '请输入重试次数' }]}
              >
                <Input type="number" placeholder="3" />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 爬虫设置 */}
        <Col xs={24} lg={12}>
          <Card title="爬虫设置">
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name={['crawler', 'defaultMaxPages']}
                label="默认最大页数"
                rules={[{ required: true, message: '请输入最大页数' }]}
              >
                <Input type="number" placeholder="3" />
              </Form.Item>

              <Form.Item
                name={['crawler', 'defaultPageSize']}
                label="默认每页大小"
                rules={[{ required: true, message: '请输入每页大小' }]}
              >
                <Input type="number" placeholder="20" />
              </Form.Item>

              <Form.Item
                name={['crawler', 'requestDelay']}
                label="请求延迟(ms)"
                rules={[{ required: true, message: '请输入请求延迟' }]}
              >
                <Input type="number" placeholder="1000" />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 分析设置 */}
        <Col xs={24} lg={12}>
          <Card title="分析设置">
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name={['analysis', 'batchSize']}
                label="批处理大小"
                rules={[{ required: true, message: '请输入批处理大小' }]}
              >
                <Input type="number" placeholder="10" />
              </Form.Item>

              <Form.Item
                name={['analysis', 'analysisDelay']}
                label="分析延迟(ms)"
                rules={[{ required: true, message: '请输入分析延迟' }]}
              >
                <Input type="number" placeholder="500" />
              </Form.Item>

              <Form.Item
                name={['analysis', 'enableCache']}
                label="启用缓存"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 操作按钮 */}
        <Col span={24}>
          <Card>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={() => form.submit()}
              >
                保存设置
              </Button>
              <Button onClick={handleReset}>
                重置设置
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemSettings;
