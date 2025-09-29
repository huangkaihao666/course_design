'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  App,
  Form,
  Input,
  Select,
  Switch,
  Popconfirm,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ApiOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface WorkflowConfig {
  id: number;
  workflow_name: string;
  workflow_key: string;
  bot_key: string;
  human_id: string;
  token: string;
  workflow_type: string;
  description: string;
  prompt_template: string;
  required_params: string[];
  optional_params: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const WorkflowManagement: React.FC = () => {
  const { message } = App.useApp();
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowConfig | null>(null);
  const [form] = Form.useForm();

  // 获取工作流配置列表
  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow-configs');
      const result = await response.json();
      
      if (result.success) {
        setWorkflows(result.data);
      } else {
        message.error('获取工作流配置失败：' + result.error);
      }
    } catch (error) {
      message.error('获取工作流配置失败');
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存工作流配置
  const handleSave = async (values: any) => {
    try {
      const response = await fetch('/api/workflow-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          id: editingWorkflow?.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        message.success(editingWorkflow ? '工作流配置更新成功' : '工作流配置保存成功');
        setModalVisible(false);
        setEditingWorkflow(null);
        form.resetFields();
        fetchWorkflows();
      } else {
        message.error('保存失败：' + result.error);
      }
    } catch (error) {
      message.error('保存工作流配置失败');
      console.error('Error saving workflow:', error);
    }
  };

  // 删除工作流配置
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/workflow-configs?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('工作流配置删除成功');
        fetchWorkflows();
      } else {
        message.error('删除失败：' + result.error);
      }
    } catch (error) {
      message.error('删除工作流配置失败');
      console.error('Error deleting workflow:', error);
    }
  };

  // 切换工作流状态
  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch('/api/workflow-configs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_active: !isActive
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        message.success(isActive ? '工作流已停用' : '工作流已启用');
        fetchWorkflows();
      } else {
        message.error('状态切换失败：' + result.error);
      }
    } catch (error) {
      message.error('状态切换失败');
      console.error('Error toggling status:', error);
    }
  };

  // 测试工作流
  const handleTest = async (workflow: WorkflowConfig) => {
    try {
      const response = await fetch('/api/aibox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute-workflow',
          data: {
            botKey: workflow.bot_key,
            workflowKey: workflow.workflow_key,
            ext: {
              op_id: 0,
              prompt: workflow.prompt_template,
              content: '测试评论内容',
              product_name: '测试商品',
              rating: '8'
            },
            humanId: workflow.human_id,
            token: workflow.token
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('工作流测试成功');
      } else {
        message.error('工作流测试失败：' + result.error);
      }
    } catch (error) {
      message.error('工作流测试失败');
      console.error('Error testing workflow:', error);
    }
  };

  // 编辑工作流
  const handleEdit = (workflow: WorkflowConfig) => {
    setEditingWorkflow(workflow);
    form.setFieldsValue(workflow);
    setModalVisible(true);
  };

  // 新增工作流
  const handleAdd = () => {
    setEditingWorkflow(null);
    form.resetFields();
    setModalVisible(true);
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'workflow_name',
      key: 'workflow_name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'workflow_type',
      key: 'workflow_type',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          'sentiment_analysis': { color: 'blue', text: '情感分析' },
          'boom_reason': { color: 'green', text: '爆火原因' },
          'comment_analysis': { color: 'orange', text: '评论分析' },
          'custom': { color: 'purple', text: '自定义' }
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '工作流Key',
      dataIndex: 'workflow_key',
      key: 'workflow_key',
      width: 200,
      render: (text: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {text.length > 30 ? `${text.substring(0, 30)}...` : text}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Badge 
          status={isActive ? 'success' : 'default'} 
          text={isActive ? '启用' : '停用'} 
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: WorkflowConfig) => (
        <Space>
          <Tooltip title="测试工作流">
            <Button
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleTest(record)}
            >
              测试
            </Button>
          </Tooltip>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={record.is_active ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleToggleStatus(record.id, record.is_active)}
          >
            {record.is_active ? '停用' : '启用'}
          </Button>
          <Popconfirm
            title="确定删除这个工作流配置吗？"
            onConfirm={() => handleDelete(record.id)}
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              <ApiOutlined /> 工作流管理
            </Title>
            <Text type="secondary">
              管理AIBox工作流配置，包括情感分析、爆火原因分析等
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增工作流
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={workflows}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 个工作流`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingWorkflow ? '编辑工作流配置' : '新增工作流配置'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingWorkflow(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Form.Item
              name="workflow_name"
              label="工作流名称"
              rules={[{ required: true, message: '请输入工作流名称' }]}
            >
              <Input placeholder="请输入工作流名称" />
            </Form.Item>

            <Form.Item
              name="workflow_type"
              label="工作流类型"
              rules={[{ required: true, message: '请选择工作流类型' }]}
            >
              <Select placeholder="请选择工作流类型">
                <Option value="sentiment_analysis">情感分析</Option>
                <Option value="boom_reason">爆火原因分析</Option>
                <Option value="comment_analysis">评论分析</Option>
                <Option value="custom">自定义</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="workflow_key"
              label="工作流Key"
              rules={[{ required: true, message: '请输入工作流Key' }]}
            >
              <Input placeholder="请输入工作流Key" />
            </Form.Item>

            <Form.Item
              name="bot_key"
              label="Bot Key"
              rules={[{ required: true, message: '请输入Bot Key' }]}
            >
              <Input placeholder="请输入Bot Key" />
            </Form.Item>

            <Form.Item
              name="human_id"
              label="Human ID"
              rules={[{ required: true, message: '请输入Human ID' }]}
            >
              <Input placeholder="请输入Human ID" />
            </Form.Item>

            <Form.Item
              name="token"
              label="Token"
              rules={[{ required: true, message: '请输入Token' }]}
            >
              <Input.Password placeholder="请输入Token" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={3} placeholder="请输入工作流描述" />
            </Form.Item>

            <Form.Item
              name="prompt_template"
              label="提示词模板"
              rules={[{ required: true, message: '请输入提示词模板' }]}
            >
              <TextArea rows={6} placeholder="请输入提示词模板" />
            </Form.Item>

            <Form.Item
              name="required_params"
              label="必需参数"
            >
              <Select
                mode="tags"
                placeholder="请输入必需参数，按回车添加"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="optional_params"
              label="可选参数"
            >
              <Select
                mode="tags"
                placeholder="请输入可选参数，按回车添加"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="是否启用"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingWorkflow ? '更新' : '保存'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowManagement;
