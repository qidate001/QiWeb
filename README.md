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
| **塔罗牌占卜** | https://www.qidate001.com/tarot |
| **塔罗牌图鉴** | https://www.qidate001.com/tarot/tarot-gallery |

---

<!-- ## 📁 项目结构

```
qiweb/
├── .github/workflows/          # GitHub Actions 自动部署
│   └── deploy.yml
├── css/                        # 全局样式
│   ├── index_style.css         # 首页样式
│   ├── tarot.css               # 塔罗占卜样式
│   ├── tarot-gallery.css       # 塔罗图鉴样式
│   ├── docs-tarot.css          # 塔罗文档样式
│   ├── contact.css             # 联系页样式
│   ├── 404.css                 # 404 页面样式
│   ├── style.css               # 基础通用样式
│   └── gta5lo.css              # GTA 图鉴样式（兼容旧版）
├── js/                         # 全局 JavaScript
│   ├── tarot.js                # 塔罗占卜逻辑
│   ├── tarot_config.js         # 塔罗牌配置数据
│   └── config.js               # 站点通用配置
├── images/                     # 站点公共图片资源
│   ├── favicon.ico
│   ├── tarot_cards/            # 塔罗牌全套 78 张牌面图片
│   ├── QQ_*.png                # 联系 QQ 二维码
│   └── QisToolkit3_GitHub_Issues.png
├── docs/                       # 文档目录
│   ├── tarot.html              # 塔罗牌免责声明
│   ├── tarot-gallery.html      # 塔罗牌图鉴
│   └── QisToolkit3_EULA.html   # 最终用户许可协议
├── gta/                        # GTA5 稀有载具图鉴模块
│   ├── index.html              # 图鉴首页（通过 ?version= 参数切换模式）
│   ├── vehicles.html           # 车辆列表页
│   ├── vehicle-detail.html     # 车辆详情页
│   ├── admin.html              # 管理后台（本地使用）
│   ├── admin-server.js         # 本地管理服务（Node.js）
│   ├── 服务启动.bat            # 一键启动脚本
│   ├── css/                    # 模块样式
│   ├── js/                     # 模块脚本
│   └── data/
│       ├── config.json         # 数据源配置（gta5 / gta5ol）
│       ├── gta5/               # 线下模式数据
│       │   ├── vehicles.json   # 车辆索引
│       │   ├── index.json      # 首页展示配置
│       │   ├── images/         # 车辆截图
│       │   └── details/        # 各车辆详情 JSON
│       └── gta5ol/             # 线上模式数据（结构同 gta5/）
├── qistoolkit3/                # QisToolkit3 官网
│   ├── index.html              # 官网首页
│   ├── home.html               # 项目主页
│   ├── changelog.html          # 更新日志
│   ├── files-operation.html    # 文件操作工具页
│   ├── text-generate.html      # 文本生成工具页
│   ├── text-generate-plus.html # 文本生成增强版
│   ├── cleaning-up-trash.html  # 系统清理工具页
│   ├── tools/                  # 工具集子页面
│   ├── css/                    # 各页面样式
│   ├── js/                     # 各页面脚本
│   └── images/                 # 截图素材
├── index.html                  # 网站首页
├── about.html                  # 关于页面
├── contact.html                # 联系方式
├── tarot.html                  # 塔罗牌占卜页
├── 404.html                    # 自定义 404 页面
├── CNAME                       # 自定义域名 (www.qidate001.com)
├── LICENSE                     # Apache 2.0 许可证
└── .gitignore
``` -->

> ⚠️ `qistoolkit3/` 下的 `game-tools.html`、`options.html`、`strange-question-and-answer.html` 为规划中但尚未完成的模块，当前为占位文件。

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
- 车辆名称、品牌
- 外观配色方案
- 详细获取方式说明
- 多角度实机截图
- 改装部件数据

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
| 图鉴页 | `/docs/tarot-gallery` | 完整 78 张塔罗牌面展示（含大阿尔卡纳 + 四组小阿尔卡纳） |
| 免责声明 | `/docs/tarot` | 占卜服务声明与须知 |

塔罗牌图片资源位于 `/images/tarot_cards/`，共 78 张高清牌面。

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

启动后访问 `http://localhost:3000/admin.html` 即可进入管理后台，进行车辆数据的增删改查操作。

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

*最后更新：2026年7月*