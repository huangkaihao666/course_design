import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "商品评论分析系统",
  description: "基于AI工作流的智能评论情感分析系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${inter.variable} antialiased`}
      >
        <ConfigProvider 
          locale={zhCN}
          theme={{
            token: {
              // 主色调 - 浅蓝色系
              colorPrimary: '#1890ff',
              colorSuccess: '#52c41a',
              colorWarning: '#faad14',
              colorError: '#ff4d4f',
              colorInfo: '#1890ff',
              
              // 背景色系
              colorBgContainer: '#ffffff',
              colorBgElevated: '#fafafa',
              colorBgLayout: '#f5f5f5',
              colorBgSpotlight: '#f0f9ff',
              
              // 边框和分割线
              colorBorder: '#d9d9d9',
              colorBorderSecondary: '#f0f0f0',
              
              // 文字颜色
              colorText: '#262626',
              colorTextSecondary: '#8c8c8c',
              colorTextTertiary: '#bfbfbf',
              colorTextQuaternary: '#f0f0f0',
              
              // 圆角
              borderRadius: 8,
              borderRadiusLG: 12,
              borderRadiusSM: 6,
              
              // 阴影
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              boxShadowSecondary: '0 1px 4px rgba(0, 0, 0, 0.08)',
              
              // 字体
              fontSize: 14,
              fontSizeLG: 16,
              fontSizeSM: 12,
              fontSizeXL: 20,
              
              // 间距
              padding: 16,
              paddingLG: 24,
              paddingSM: 12,
              paddingXS: 8,
              
              // 高度
              controlHeight: 32,
              controlHeightLG: 40,
              controlHeightSM: 24,
            },
            components: {
              // 按钮组件
              Button: {
                borderRadius: 8,
                controlHeight: 36,
                paddingInline: 20,
                fontWeight: 500,
              },
              // 卡片组件
              Card: {
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                paddingLG: 24,
              },
              // 表格组件
              Table: {
                borderRadius: 8,
                headerBg: '#fafafa',
                rowHoverBg: '#f0f9ff',
              },
              // 输入框组件
              Input: {
                borderRadius: 8,
                controlHeight: 36,
                paddingInline: 12,
              },
              // 选择器组件
              Select: {
                borderRadius: 8,
                controlHeight: 36,
              },
              // 标签组件
              Tag: {
                borderRadius: 6,
                fontSize: 12,
                lineHeight: 1.4,
              },
              // 进度条组件
              Progress: {
                borderRadius: 4,
              },
              // 统计组件
              Statistic: {
                titleFontSize: 14,
                contentFontSize: 24,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              },
            },
          }}
        >
          <App>
            {children}
          </App>
        </ConfigProvider>
      </body>
    </html>
  );
}
