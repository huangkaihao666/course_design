'use client';

import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  BarChartOutlined,
  DatabaseOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  ApiOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

interface SidebarProps {
  selectedKey: string;
  onMenuClick: (key: string) => void;
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedKey, onMenuClick, collapsed }) => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <BarChartOutlined />,
      label: '数据概览',
    },
    {
      key: 'crawler',
      icon: <DatabaseOutlined />,
      label: '爬虫配置',
    },
    {
      key: 'analysis',
      icon: <ThunderboltOutlined />,
      label: '评论分析',
    },
    {
      key: 'workflow',
      icon: <ApiOutlined />,
      label: '工作流管理',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={250}
      style={{
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #f0f0f0',
        textAlign: collapsed ? 'center' : 'left'
      }}>
        <Title 
          level={4} 
          style={{ 
            margin: 0, 
            color: '#1890ff',
            fontSize: collapsed ? '16px' : '18px'
          }}
        >
          {collapsed ? '评论' : '评论分析系统'}
        </Title>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => onMenuClick(key)}
        style={{ 
          border: 'none',
          marginTop: '16px'
        }}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
