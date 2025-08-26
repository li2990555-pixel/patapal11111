import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 阿里云OSS部署脚本
console.log('🚀 开始部署到阿里云OSS...');

// 检查dist目录
const distPath = './dist';
if (!fs.existsSync(distPath)) {
    console.log('❌ dist目录不存在，请先运行 npm run build');
    process.exit(1);
}

console.log('✅ 找到dist目录');

// 显示部署选项
console.log('\n📋 部署选项：');
console.log('1. 手动上传到阿里云OSS控制台');
console.log('2. 使用阿里云CLI工具');
console.log('3. 使用Node.js脚本上传');

console.log('\n🌟 推荐方案1（最简单）：');
console.log('1. 访问 https://oss.console.aliyun.com/');
console.log('2. 创建Bucket（选择公共读权限）');
console.log('3. 上传dist目录中的所有文件');
console.log('4. 配置CDN加速（可选）');

console.log('\n📁 需要上传的文件：');
listFiles(distPath, '');

console.log('\n🔧 如果你想使用CLI工具：');
console.log('1. 下载阿里云CLI: https://help.aliyun.com/document_detail/120075.html');
console.log('2. 配置AccessKey和SecretKey');
console.log('3. 运行: ossutil cp -r dist/ oss://your-bucket-name/');

console.log('\n🎉 部署说明完成！');

function listFiles(dir, prefix) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            listFiles(filePath, prefix + '  ');
        } else {
            const size = (stat.size / 1024).toFixed(2);
            console.log(`${prefix}📄 ${file} (${size} KB)`);
        }
    });
}
