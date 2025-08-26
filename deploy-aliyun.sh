#!/bin/bash

# 阿里云OSS部署脚本
# 需要先安装阿里云CLI工具: pip install oss2

echo "🚀 开始部署到阿里云OSS..."

# 构建项目
echo "📦 构建项目..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败，dist目录不存在"
    exit 1
fi

echo "✅ 构建成功！"

# 部署到阿里云OSS
echo "☁️ 部署到阿里云OSS..."
echo "请确保已安装阿里云CLI工具并配置了访问密钥"
echo "安装命令: pip install oss2"
echo "配置命令: ossutil config"

# 使用ossutil上传文件
if command -v ossutil &> /dev/null; then
    echo "📤 上传文件到OSS..."
    # 请替换为你的OSS bucket名称和地域
    ossutil cp -r dist/ oss://your-bucket-name/ --endpoint=oss-cn-hangzhou.aliyuncs.com
    echo "✅ 部署完成！"
    echo "🌐 访问地址: https://your-bucket-name.oss-cn-hangzhou.aliyuncs.com/"
else
    echo "⚠️  未安装ossutil，请先安装阿里云CLI工具"
    echo "安装命令: pip install oss2"
    echo "或者手动上传dist目录到阿里云OSS"
fi

echo "🎉 部署脚本执行完成！"
