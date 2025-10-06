import type { Metadata } from "next";
import "./globals.css";
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';

export const metadata: Metadata = {
  title: "Curl解析器 - 配置管理工具",
  description: "解析curl请求并管理爬虫配置参数",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <ConfigProvider locale={zhCN}>
          <App>
            {children}
          </App>
        </ConfigProvider>
      </body>
    </html>
  );
}
