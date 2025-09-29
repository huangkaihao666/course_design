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
              colorPrimary: '#1890ff',
              borderRadius: 6,
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
