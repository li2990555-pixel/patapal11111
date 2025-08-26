# 🇨🇳 国内部署指南

## 🚨 问题说明

Vercel部署的网站在国内访问不稳定，需要部署到国内服务器。

## 🌟 推荐方案

### 方案1：阿里云OSS + CDN（最推荐）

#### 优点：
- ✅ 国内访问极快
- ✅ 价格便宜（每月几块钱）
- ✅ 配置简单
- ✅ 支持HTTPS

#### 步骤：

1. **注册阿里云账号**
   - 访问 [阿里云官网](https://www.aliyun.com/)
   - 注册并实名认证

2. **开通OSS服务**
   - 搜索"对象存储OSS"
   - 开通服务

3. **创建Bucket**
   - 选择地域：建议选择离你最近的（如杭州、北京、深圳）
   - 设置Bucket名称
   - 选择"公共读"权限

4. **配置CDN加速**
   - 开通CDN服务
   - 添加加速域名
   - 配置HTTPS证书

5. **部署代码**
   ```bash
   # 构建项目
   npm run build
   
   # 使用阿里云CLI上传
   pip install oss2
   ossutil cp -r dist/ oss://your-bucket-name/
   ```

### 方案2：腾讯云COS + CDN

#### 优点：
- ✅ 国内访问快
- ✅ 价格合理
- ✅ 腾讯生态

#### 步骤：
1. 注册腾讯云账号
2. 开通对象存储COS
3. 创建存储桶
4. 配置CDN加速
5. 上传文件

### 方案3：华为云OBS + CDN

#### 优点：
- ✅ 国内访问稳定
- ✅ 华为生态
- ✅ 安全性高

### 方案4：GitHub Pages（相对稳定）

#### 优点：
- ✅ 免费
- ✅ 相对稳定
- ✅ 自动部署

#### 缺点：
- ⚠️ 偶尔访问慢
- ⚠️ 需要科学上网

## 🚀 快速部署命令

### 阿里云OSS部署：
```bash
# 1. 安装阿里云CLI
pip install oss2

# 2. 配置访问密钥
ossutil config

# 3. 构建并部署
npm run build
ossutil cp -r dist/ oss://your-bucket-name/
```

### GitHub Pages部署：
```bash
# 1. 推送到GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. 在GitHub设置中启用Pages
# Settings -> Pages -> Source -> Deploy from a branch
```

## 💰 费用估算

- **阿里云OSS**: 每月约2-5元
- **腾讯云COS**: 每月约2-5元  
- **华为云OBS**: 每月约2-5元
- **GitHub Pages**: 免费

## 🔧 本地测试

```bash
# 构建项目
npm run build

# 本地预览
npm run preview

# 或者使用Python简单服务器
cd dist
python -m http.server 8000
# 访问 http://localhost:8000
```

## 📱 移动端适配

所有部署方案都支持移动端，项目已配置响应式设计。

## 🆘 常见问题

**Q: 为什么选择阿里云OSS？**
A: 国内访问最快，价格便宜，配置简单

**Q: 可以同时部署多个平台吗？**
A: 可以，这样可以保证访问稳定性

**Q: 如何更新网站？**
A: 重新构建并上传到OSS，或配置自动部署

## 🎯 下一步

1. 选择部署方案
2. 注册相应云服务商账号
3. 按照步骤配置
4. 测试访问速度
5. 配置自动部署（可选）
