# 🚀 Pata Pal 部署指南

## ✅ 部署成功！

你的应用已经成功部署到：**https://pata-nsde3dl3i-mittels-projects.vercel.app**

## 🔑 配置百度API密钥（重要！）

为了让聊天和日记生成功能正常工作，你需要配置百度文心一言API：

### 步骤1：申请百度API密钥
1. 访问 [百度智能云控制台](https://console.bce.baidu.com/)
2. 注册/登录百度账号
3. 开通文心一言服务
4. 创建应用，获取 `API Key` 和 `Secret Key`

### 步骤2：在Vercel中配置环境变量
1. 访问 [Vercel项目页面](https://vercel.com/mittels-projects/pata-pal)
2. 点击 `Settings` 标签
3. 选择 `Environment Variables`
4. 添加以下环境变量：

```
BAIDU_API_KEY=你的百度API密钥
BAIDU_SECRET_KEY=你的百度密钥
```

5. 选择 `Production` 环境
6. 点击 `Save`
7. 重新部署项目

### 步骤3：重新部署
在Vercel控制台点击 `Redeploy` 按钮，或者运行：
```bash
npx vercel --prod
```

## 🌍 无需VPN访问

现在你的应用使用百度AI服务，**国内用户无需VPN即可正常使用**！

## 🔧 本地开发

```bash
npm install
npm run dev
```

## 📱 移动端适配

项目已配置Capacitor，支持iOS/Android原生应用开发。

## 🆘 常见问题

**Q: 聊天功能不工作？**
A: 检查百度API密钥是否正确配置

**Q: 如何更新应用？**
A: 推送代码到GitHub，Vercel会自动重新部署

**Q: 可以自定义域名吗？**
A: 可以，在Vercel设置中添加自定义域名




