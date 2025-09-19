#!/bin/bash

# 美化版Curl解析器启动脚本

echo ""
echo "🎨✨ 启动美化版Curl解析器 ✨🎨"
echo "=========================================="
echo ""

# 检查依赖
echo "🔍 检查运行环境..."

if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
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
$PACKAGE_MANAGER install

echo ""
echo "🚀 启动服务..."
echo ""

# 启动开发服务器
echo "🎯 Curl解析器正在启动..."
echo "📍 访问地址: http://localhost:3001"
echo ""
echo "✨ 新功能特性："
echo "   🎨 全新美化界面设计"
echo "   🌈 渐变色彩搭配"
echo "   🎭 动画效果和过渡"
echo "   📱 响应式布局"
echo "   🔧 智能解析curl命令"
echo "   💾 配置管理功能"
echo ""
echo "🎪 使用流程："
echo "   1️⃣  粘贴你的curl命令"
echo "   2️⃣  点击'🚀 解析Curl'按钮"
echo "   3️⃣  查看解析结果和配置"
echo "   4️⃣  保存配置供以后使用"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "=========================================="
echo ""

# 启动开发服务器
$PACKAGE_MANAGER dev
