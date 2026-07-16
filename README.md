# QiWeb

齐的网站 —— QisToolkit3 官网 & GTA5 车辆数据站

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://qidate001.github.io/QiWeb/)
[![Website](https://img.shields.io/badge/Website-www.qidate001.com-brightgreen)](http://www.qidate001.com/)
[![License](https://img.shields.io/badge/License-GPL--3.0-red)](LICENSE)

## 📖 项目简介

QiWeb 是 [QisToolkit3](https://github.com/qidate001/QisToolkit3) 的官方网站，同时也提供 **GTA5 线上/线下稀有车辆数据查询** 功能。项目采用纯静态页面 + JSON 数据存储，通过 GitHub Pages 自动部署。

当前主要功能模块：
- 🏠 **官网首页** — 项目介绍、导航入口
- 📦 **QisToolkit3 下载页** — 软件下载及文档
- 🚗 **GTA5 车辆数据库** — 分「线下模式」与「线上模式」两个独立模块
- 🔧 **管理后台** — 本地数据管理工具（`admin.html`）

---

## 🚀 在线访问

| 入口 | 地址 |
|------|------|
| 主站 | http://www.qidate001.com/ |
| GitHub Pages 镜像 | https://qidate001.github.io/QiWeb/ |
| GTA5 线下车辆 | `/gta5/` |
| GTA5 线上车辆 | `/gta5ol/` |

> ⚠️ 目前主站暂未配置 HTTPS 证书，建议使用 HTTP 访问或 GitHub Pages 镜像。

---

## 📁 项目结构

```
qiweb/
├── .github/workflows/          # GitHub Actions 自动部署
│   └── deploy.yml
├── css/                        # 全局样式
│   ├── style.css
│   ├── index_style.css
│   ├── contact.css
│   └── 404.css
├── js/                         # 全局 JS
├── images/                     # 站点公共图片
│   ├── favicon.ico
│   ├── QQ_*.png               # 联系 QQ 二维码
│   └── QisToolkit3_GitHub_Issues.png
├── docs/                       # 文档
│   └── QisToolkit3_EULA.html  # 最终用户许可协议
├── gta5/                       # GTA5 线下模式车辆模块
│   ├── index.html
│   ├── vehicles.html           # 车辆列表
│   ├── vehicle-detail.html     # 车辆详情页
│   ├── admin.html              # 管理后台（本地使用）
│   ├── admin-server.js         # 本地管理服务（Node.js）
│   ├── 服务启动.bat            # 一键启动脚本
│   ├── css/
│   ├── js/
│   ├── images/                 # 车辆截图
│   └── data/
│       ├── vehicles.json       # 主数据索引
│       ├── index.json
│       └── details/            # 各车辆详情 JSON
├── gta5ol/                     # GTA5 线上模式车辆模块（结构同 gta5/）
│   ├── index.html
│   ├── vehicles.html
│   ├── vehicle-detail.html
│   ├── admin.html
│   ├── admin-server.js
│   ├── 服务启动.bat
│   ├── css/
│   ├── js/
│   ├── images/
│   └── data/
│       ├── vehicles.json
│       ├── index.json
│       └── details/
├── index.html                  # 网站首页
├── about.html                  # 关于页面
├── contact.html                # 联系方式
├── 404.html                    # 自定义 404 页面
├── CNAME                       # 自定义域名 (www.qidate001.com)
├── LICENSE                     # GPL-3.0 许可证
└── .gitignore
```

---

## 🛠️ 技术栈

| 类型 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + 原生 JavaScript |
| 数据存储 | JSON 文件 (静态) |
| 本地服务 | Node.js (仅用于管理员后台) |
| 部署 | GitHub Pages + GitHub Actions |
| 版本管理 | Git |

---

## 🚗 GTA5 车辆数据库

### 线下模式 (`/gta5/`)
收录 GTA5 故事模式中可获取的稀有改装车辆，每辆车包含：
- 车辆名称、外观配色
- 获取方式说明
- 多角度截图
- 改装细节数据

### 线上模式 (`/gta5ol/`)
收录 GTA5 线上模式中的稀有载具，包括：
- 特殊改装版车辆（如磨损系列、沙滩聚会系列等）
- 每辆车详细数据 + 截图

> 📌 两个模块数据独立，因为线上/线下车辆的刷新机制和数据结构完全不同。未来可能增加 `gta6/` 模块。

---

## 🔧 本地开发 & 管理后台

### 环境要求
- 任意现代浏览器
- （仅管理员功能需要）Node.js 环境

### 启动本地服务
```bash
# 进入对应模块目录 (以 gta5ol 为例)
cd gta5ol

# 双击运行 服务启动.bat
# 或手动执行：
node admin-server.js
```

启动后访问 `http://localhost:3000/admin.html` 即可进入管理后台，进行车辆数据的增删改查操作。

> ⚠️ 管理后台仅供管理员在本地使用，云端部署时仅暴露静态页面，数据修改需在本地完成后再提交部署。

### 导出数据
管理员可在后台一键导出所有车辆数据为 JSON 文件，方便备份或迁移。

---

## 📦 QisToolkit3

QisToolkit3 是一款开源工具软件，本网站为其官方网站。

- **源码仓库**：[https://github.com/qidate001/QisToolkit3](https://github.com/qidate001/QisToolkit3)
- **许可协议**：[查看 EULA](/docs/QisToolkit3_EULA.html)

---

## 🔗 相关链接

| 链接 | 说明 |
|------|------|
| [GitHub 仓库](https://github.com/qidate001/QiWeb/) | 本站源码 |
| [QisToolkit3 仓库](https://github.com/qidate001/QisToolkit3) | 软件源码 |
| [提交 Issue](https://github.com/qidate001/QiWeb/issues) | 反馈网站问题 |

---

## 📄 许可证

本项目使用 **GPL-3.0** 许可证，详见 [LICENSE](LICENSE) 文件。

---

## 📬 联系方式

- QQ 群：见网站 [联系页面](http://www.qidate001.com/contact.html)
- GitHub Issues：欢迎提交反馈和建议

---

*最后更新：2026年7月*