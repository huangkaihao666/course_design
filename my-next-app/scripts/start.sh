#!/bin/bash

# 电商评论分析系统启动脚本

echo "🚀 启动电商评论分析系统"
echo "========================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  未找到pnpm，使用npm代替"
    PACKAGE_MANAGER="npm"
else
    PACKAGE_MANAGER="pnpm"
fi

echo "📦 安装依赖..."

# 安装Node.js依赖
echo "安装Node.js依赖..."
$PACKAGE_MANAGER install

# 安装Python依赖
echo "安装Python依赖..."
cd ../pachong
pip3 install -r requirements.txt
cd ../my-next-app

echo "✅ 依赖安装完成"
echo ""
echo "🌟 启动开发服务器..."
echo "访问地址: http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动开发服务器
$PACKAGE_MANAGER dev
