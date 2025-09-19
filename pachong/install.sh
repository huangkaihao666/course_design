#!/bin/bash

echo "=== 淘宝/天猫评论爬虫 - 环境安装脚本 ==="
echo

# 检查Python是否安装
if command -v python3 &> /dev/null; then
    echo "✓ Python3 已安装: $(python3 --version)"
else
    echo "✗ 未找到Python3，请先安装Python"
    exit 1
fi

# 检查pip是否安装
if command -v pip3 &> /dev/null; then
    echo "✓ pip3 已安装"
else
    echo "✗ 未找到pip3，请先安装pip"
    exit 1
fi

echo
echo "正在安装依赖包..."

# 安装依赖
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ 依赖包安装完成"
else
    echo "✗ 依赖包安装失败"
    exit 1
fi

# 创建输出目录
mkdir -p output
echo "✓ 创建输出目录: output/"

echo
echo "=== 安装完成 ==="
echo
echo "使用方法："
echo "1. 运行简化版本: python3 run_spider.py"
echo "2. 运行完整版本: python3 tmall_spider.py"
echo "3. 查看说明文档: cat README.md"
echo
echo "注意：使用前请确保设置正确的cookies！"
