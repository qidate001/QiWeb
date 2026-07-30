# QiWeb

齐的网站 —— 个人作品集门户 · GTA5 稀有载具图鉴 · QisToolkit3 官网 · 塔罗牌占卜

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://qidate001.github.io/QiWeb/)
[![Website](https://img.shields.io/badge/Website-www.qidate001.com-brightgreen)](http://www.qidate001.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## 📖 项目简介

QiWeb 是一个多功能静态站点，聚合了作者个人作品与兴趣项目的展示入口。站点包含三大核心功能模块：

- 🚗 **GTA5 稀有载具图鉴** — 收录线下/线上模式稀有改装车辆，含详细数据与多角度截图
- 🧰 **QisToolkit3 官网** — 开源工具套件的官方网站，提供功能介绍、下载入口与更新日志
- 🔮 **塔罗牌占卜** — 在线占卜体验 + 塔罗牌图鉴，含完整 78 张牌面展示

站点采用 **纯静态页面 + JSON 数据存储**，通过 GitHub Pages 自动部署。

---

## 🌐 在线访问

| 入口 | 地址 |
|------|------|
| 主站 | https://www.qidate001.com/ |
| GitHub Pages 镜像 | https://qidate001.github.io/QiWeb/ |
| **GTA5 载具图鉴** | https://www.qidate001.com/gta/ |
| └ 线下模式 | https://www.qidate001.com/gta/index.html?version=gta5 |
| └ 线上模式 | https://www.qidate001.com/gta/index.html?version=gta5ol |
| **QisToolkit3 官网** | https://www.qidate001.com/qistoolkit3/ |
| └ 问身 问己 问心 | https://www.qidate001.com/qistoolkit3/survival-challenge-game/ |
| **塔罗牌占卜** | https://www.qidate001.com/tarot |
| **塔罗牌图鉴** | https://www.qidate001.com/tarot/tarot-gallery |
| **塔罗21点** | https://www.qidate001.com/tarot/tarot-blackjack |
| **塔罗跑得快** | https://www.qidate001.com/tarot/tarot-pao-de-kuai |

---

## 🛠️ 技术栈

| 类型 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + 原生 JavaScript |
| 数据存储 | JSON 文件 (静态) |
| 本地服务 | Node.js (仅用于管理员后台) |
| 部署 | GitHub Pages + GitHub Actions |
| 版本管理 | Git |
| 许可证 | Apache 2.0 |

---

## 🚗 GTA5 稀有载具图鉴

### 线下模式 (`?version=gta5`)
收录 GTA5 故事模式中可获取的稀有改装车辆，每辆车包含：
- 车辆名称
- 外观配色配件
- 实机截图
- 详细获取方式说明（大多给一个获取攻略视频）
- 瞬间爆炸载具JSON

### 线上模式 (`?version=gta5ol`)
收录 GTA5 线上模式中的稀有载具，包括：
- 特殊改装版车辆（磨损系列、沙滩聚会系列、科学家系列等）
- 每辆车详细数据 + 多张截图
- 部分车辆附有获取路线指引

> 📌 两个模块共用同一套前端页面，通过 URL 参数 `?version=gta5` / `?version=gta5ol` 切换数据源，实现代码复用与数据分离。

---

## 🧰 QisToolkit3 官网

QisToolkit3 是一款开源工具套件，官网位于 `/qistoolkit3/`，提供：

- **项目介绍** — 软件功能概述与界面展示
- **工具导航** — 各子工具入口（文件操作、文本生成、系统清理等）
- **更新日志** — 版本迭代记录
- **下载入口** — 引导用户获取软件

> 源码仓库：[https://github.com/qidate001/QisToolkit3](https://github.com/qidate001/QisToolkit3)

---

## 🔮 塔罗牌占卜

站点提供两套塔罗相关页面：

| 页面 | 路径 | 功能 |
|------|------|------|
| 占卜页 | `/tarot` | 在线塔罗牌占卜体验，可抽取牌阵并查看释义 |
| 图鉴页 | `/tarot/docs/tarot-gallery` | 完整 78 张塔罗牌面展示（含大阿尔卡纳 + 四组小阿尔卡纳） |
| 免责声明 | `/tarot/docs/tarot` | 占卜服务声明与须知 |

塔罗牌图片资源位于 `/tarot/images/tarot_cards/`，共 78 张高清牌面。

---

## 🔧 本地开发 & 管理后台

### 环境要求
- 任意现代浏览器
- （仅管理员功能需要）Node.js 环境

### 启动本地服务（GTA 数据管理）
```bash
# 进入 gta 模块目录
cd gta

# 双击运行 服务启动.bat
# 或手动执行：
node admin-server.js
```

启动后访问 `http://localhost:4867` 即可进入管理后台，进行车辆数据的增删改查操作。

> ⚠️ 管理后台仅供管理员在本地使用，云端部署时仅暴露静态页面。数据修改需在本地完成后再提交部署。

---

## 🚀 部署

本项目通过 **GitHub Actions** 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动执行 `deploy.yml` 工作流
3. 站点自动发布到 GitHub Pages
4. 通过 `CNAME` 文件绑定自定义域名 `www.qidate001.com`

### 手动预览
如需本地预览，可使用任意静态服务器：
```bash
# Python 3
python -m http.server 8080

# Node.js (serve)
npx serve .
```

---

## 🔗 相关链接

| 链接 | 说明 |
|------|------|
| [GitHub 仓库](https://github.com/qidate001/QiWeb/) | 本站源码 |
| [QisToolkit3 仓库](https://github.com/qidate001/QisToolkit3) | 工具套件源码 |
| [提交 Issue](https://github.com/qidate001/QiWeb/issues) | 反馈网站问题 |

---

## 📄 许可证

本项目使用 **Apache License 2.0** 许可证，详见 [LICENSE](LICENSE) 文件。

---

## 📬 联系方式

- **QQ 群**：见网站 [联系页面](https://www.qidate001.com/contact.html)
- **GitHub Issues**：欢迎提交反馈和建议

---

*最后更新：2026年7月30日*