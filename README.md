# 好运日历

一个面向分享的今日运势静态网页原型。

功能包括：

- 输入昵称生成专属今日好运签
- 选择星座或生肖生成今日运势
- 展示狼人杀当日抽奖运势
- 点灯祈福后修改抽奖运势
- 生成可复制的分享文案

## 部署

这是纯静态站点，适合直接部署到 GitHub Pages。

GitHub Pages 设置：

1. 进入仓库 Settings
2. 打开 Pages
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`，目录选择 `/root`
5. 保存后等待页面生成

## AI 后端

前端已经支持 AI 接口：在 `config.js` 里填入后端地址即可。

推荐免费方案：Cloudflare Workers AI。Cloudflare 官方文档显示 Workers AI 有每日免费额度，适合这种轻量生成场景。

部署思路：

1. 在 Cloudflare 创建 Worker
2. 绑定 Workers AI，变量名为 `AI`
3. 把 `worker-cloudflare-ai.js` 的内容放进 Worker
4. 发布 Worker，拿到接口 URL
5. 修改 `config.js`

```js
window.AI_FORTUNE_ENDPOINT = "https://你的-worker.workers.dev";
```

如果接口为空或请求失败，网页会自动使用本地规则兜底。
