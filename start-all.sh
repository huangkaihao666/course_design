#!/bin/bash

# 电商评论分析系统 - 全套启动脚本

echo "🚀 启动电商评论分析系统全套服务"
echo "================================="

# 检查依赖
echo "📋 检查运行环境..."

if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python3，请先安装Python3"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  未找到pnpm，使用npm代替"
    PACKAGE_MANAGER="npm"
else
    PACKAGE_MANAGER="pnpm"
fi

echo "✅ 运行环境检查通过"
echo ""

# 安装依赖
echo "📦 安装依赖包..."

# 安装Python依赖
echo "安装Python爬虫依赖..."
cd pachong
pip3 install -r requirements.txt
cd ..

# 安装评论分析系统依赖
echo "安装评论分析系统依赖..."
cd my-next-app
$PACKAGE_MANAGER install
cd ..

# 安装curl解析器依赖
echo "安装curl解析器依赖..."
cd curl-parser
$PACKAGE_MANAGER install
cd ..

echo "✅ 所有依赖安装完成"
echo ""

# 启动服务
echo "🌟 启动服务..."

# 启动curl解析器 (端口3001)
echo "启动curl解析器服务 (http://localhost:3001)..."
cd curl-parser
$PACKAGE_MANAGER dev &
CURL_PARSER_PID=$!
cd ..

# 等待curl解析器启动
sleep 3

# 启动评论分析系统 (端口3000)
echo "启动评论分析系统 (http://localhost:3000)..."
cd my-next-app
$PACKAGE_MANAGER dev &
ANALYTICS_PID=$!
cd ..

echo ""
echo "🎉 所有服务启动完成！"
echo "================================="
echo "📊 评论分析系统: http://localhost:3000"
echo "🔧 Curl解析器:   http://localhost:3001"
echo ""
echo "💡 使用流程："
echo "1. 在curl解析器中解析curl命令并保存配置"
echo "2. 生成的爬虫会自动同步配置参数"
echo "3. 在评论分析系统中查看和分析评论数据"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $CURL_PARSER_PID $ANALYTICS_PID 2>/dev/null; echo '✅ 所有服务已停止'; exit 0" INT

# 保持脚本运行
while true; do
    sleep 1
done
