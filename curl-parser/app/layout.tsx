import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
