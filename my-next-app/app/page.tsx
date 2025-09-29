'use client';

import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CrawlerConfig from './components/CrawlerConfig';
import CommentAnalytics from './components/CommentAnalytics';
import CommentResults from './components/CommentResults';
import AnalysisProgress from './components/AnalysisProgress';
import AnalysisResults from './components/AnalysisResults';
import WorkflowManagement from './components/WorkflowManagement';
import SystemSettings from './components/SystemSettings';

const { Header, Content } = Layout;

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [commentResults, setCommentResults] = useState<{
    visible: boolean;
    productId: string;
    productName: string;
  }>({ visible: false, productId: '', productName: '' });
  
  const [analysisProgress, setAnalysisProgress] = useState<{
    visible: boolean;
    productId: string;
    productName: string;
    totalComments: number;
  }>({ visible: false, productId: '', productName: '', totalComments: 0 });
  
  const [analysisResults, setAnalysisResults] = useState<{
    visible: boolean;
    productId: string;
    productName: string;
    totalComments: number;
    result: any;
  }>({ visible: false, productId: '', productName: '', totalComments: 0, result: null });
  
  const [currentCrawlConfig, setCurrentCrawlConfig] = useState<any>(null);

  const handleMenuClick = (key: string) => {
    setSelectedMenu(key);
  };

  const handleViewResults = (productId: string) => {
    // 从爬虫配置中获取商品名称
    const config = currentCrawlConfig || { product_name: `商品${productId}` };
    setCommentResults({ 
      visible: true, 
      productId, 
      productName: config.product_name || `商品${productId}` 
    });
  };

  const handleGoToAnalysis = (productId: string) => {
    // 直接跳转到评论分析页面
    const config = currentCrawlConfig || { product_name: `商品${productId}` };
    setCommentResults({ visible: false, productId: '', productName: '' });
    setSelectedMenu('analysis');
    // 可以在这里传递商品ID给CommentAnalytics组件
  };

  const handleBackFromResults = () => {
    setCommentResults({ visible: false, productId: '', productName: '' });
    setSelectedMenu('crawler');
  };

  const handleAnalyze = (productId: string) => {
    // 模拟获取商品名称和评论数量
    setAnalysisProgress({ 
      visible: true, 
      productId, 
      productName: `商品${productId}`,
      totalComments: 150 // 模拟评论数量
    });
  };

  const handleBackFromAnalysis = () => {
    setAnalysisResults({ visible: false, productId: '', productName: '', totalComments: 0, result: null });
    setCommentResults({ visible: true, productId: analysisResults.productId, productName: analysisResults.productName });
  };

  const handleViewAnalysisResults = (result: any) => {
    setAnalysisResults({
      visible: true,
      productId: analysisProgress.productId,
      productName: analysisProgress.productName,
      totalComments: analysisProgress.totalComments,
      result
    });
    setAnalysisProgress({ visible: false, productId: '', productName: '', totalComments: 0 });
  };

  const handleCrawlStart = (config: any) => {
    setCurrentCrawlConfig(config);
  };

  const renderContent = () => {
    // 如果显示分析结果页面
    if (analysisResults.visible) {
      return (
        <AnalysisResults
          productId={analysisResults.productId}
          productName={analysisResults.productName}
          totalComments={analysisResults.totalComments}
          analysisResult={analysisResults.result}
          onBack={handleBackFromAnalysis}
        />
      );
    }

    // 如果显示评论结果页面
    if (commentResults.visible) {
      return (
        <CommentResults 
          productId={commentResults.productId} 
          productName={commentResults.productName}
          onBack={handleBackFromResults}
          onGoToAnalysis={handleGoToAnalysis}
        />
      );
    }

    switch (selectedMenu) {
        case 'dashboard':
          return <Dashboard />;
      case 'crawler':
        return <CrawlerConfig onViewResults={handleViewResults} onCrawlStart={handleCrawlStart} />;
      case 'analysis':
        return <CommentAnalytics onAnalyze={handleAnalyze} />;
      case 'workflow':
        return <WorkflowManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Sidebar 
        selectedKey={selectedMenu}
        onMenuClick={handleMenuClick}
        collapsed={collapsed}
      />
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={{ margin: 0, color: '#1890ff' }}>
              {selectedMenu === 'dashboard' && '数据概览'}
              {selectedMenu === 'crawler' && '爬虫配置管理'}
              {selectedMenu === 'analysis' && '评论分析'}
              {selectedMenu === 'workflow' && '工作流管理'}
              {selectedMenu === 'settings' && '系统设置'}
            </h2>
          </div>
        </Header>

        <Content style={{ 
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* 分析进度弹窗 */}
      {analysisProgress.visible && (
        <AnalysisProgress
          visible={analysisProgress.visible}
          onClose={() => setAnalysisProgress({ visible: false, productId: '', productName: '', totalComments: 0 })}
          productId={analysisProgress.productId}
          productName={analysisProgress.productName}
          totalComments={analysisProgress.totalComments}
          onViewResults={handleViewAnalysisResults}
        />
      )}
    </Layout>
  );
}