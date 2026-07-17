// ============================================================
// changelog.js - 齐的工具包3 更新日志数据与渲染逻辑
// ============================================================

// ---------- 更新日志数据 ----------
const changelogData = [
    {
        version: "v2.9.1",
        date: "2026-07-17",
        items: [
            "文本规则引擎新增 Suffix-Text 附加条件参数",
            "修复 Trim 相关 BUG，表达式左侧 Trim，右侧保留",
            "YtDlp 重命名增加手动执行按钮，便于调试",
            "YtDlp 默认重命名规则更新，支持 CN2+Suffix-Text",
            "修复 YtDlp 检查更新功能不可用的问题",
            "修复 YtDlp 重命名卡死问题（部分）",
            "引入 EasyHook 依赖，相关功能开发中",
            "更新 FFmpeg 至 8.1.2-full_build",
            "重启 QisToolkitIS 项目，WinUI3 方案探索中",
            "EULA 中增加 GitHub Releases 下载渠道",
            "MinSudo 提权方案优化，修复 UI 卡死问题",
            "奇葩问答读取逻辑重写，性能优化",
            "移除蓝奏云下载渠道，改至官网链接",
            "齐之防御新增 DELETE_FILE 命令"
        ]
    },
    {
        version: "v2.9",
        date: "2026-07-01",
        items: [
            "新增 -SPL 参数调用 SPL 启动程序",
            "引入 MinSudo 全新提权方案（Win10 可用）",
            "齐之防御合并入解决方案，完全重写",
            "高级修改系统工具新增大量 Windows 标识修改项",
            "基础工具添加任务管理器",
            "YtDlp 新增【文件命名】页，支持文本规则引擎",
            "齐之防御支持：文件锁定、关键进程标记、Kill进程、进程组管理"
        ]
    },
    {
        version: "v2.8.14",
        date: "2026-06-20",
        items: [
            "修复 YtDlp Playlist 参数 BUG",
            "YtDlp 粘贴板 URL 自动匹配下载",
            "更新 YtDlp 程序版本",
            "《问身 问己 问心》基础界面完成"
        ]
    },
    {
        version: "v2.8.13",
        date: "2026-06-10",
        items: [
            "修复《问身 问己 问心》开发者模式问题",
            "FFmpeg 工具重写导入逻辑，新增嵌入艺术图功能",
            "《问身 问己 问心》新增随机事件 · 宝箱系统",
            "YtDlp 自动下载配置改用 AutoDownloadConfig.txt"
        ]
    },
    {
        version: "v2.8.12",
        date: "2026-06-01",
        items: [
            "YtDlp 添加 Demo 程序绕过 YouTube 反爬",
            "FFmpeg 工具重大更新：视频/音频重编码、复制流、输入输出选项卡"
        ]
    },
    {
        version: "v2.8.11.1",
        date: "2026-05-28",
        items: [
            "YtDlp 下载片段功能 严重 BUG 修复"
        ]
    },
    {
        version: "v2.8.11",
        date: "2026-05-25",
        items: [
            "YtDlp 增加了下载片段功能",
            "优化部分代码"
        ]
    },
    {
        version: "v2.8.10",
        date: "2026-05-20",
        items: [
            "增加 IFEO 映像劫持工具的英文本地化",
            "增加此电脑命名空间工具的英文本地化",
            "增加常用普通功能工具的英文本地化",
            "增加系统服务工具的英文本地化",
            "增加扩展管理的英文本地化",
            "修复 YtDlp 指定下载保存路径缺失的问题",
            "移除 YtDlp 高级下载过滤器的包含字串表达式",
            "合并卸载程序项目到解决方案",
            "更新日志改用 Markdown 格式",
            "YtDlp 工具多项优化：禁止重复点击、HTML支持嵌入视频等"
        ]
    },
    {
        version: "v2.8.9",
        date: "2026-05-15",
        items: [
            "优化语言实现逻辑",
            "增加 EULA.txt",
            "增加主页的英文本地化",
            "优化软件设置的英文本地化",
            "增加清理垃圾的英文本地化",
            "增加奇葩问答的英文本地化",
            "增加万能工具的英文本本地化",
            "增加高级系统修改工具的英文本地化",
            "高级系统修改工具：登录消息移至系统信息模块",
            "高级系统修改工具：新增 Windows 系统标识模块",
            "命令行模式新增 -H / -Hide 参数支持隐藏窗口运行",
            "软件设置新增【下载/仓库/联系方式】专页"
        ]
    },
    {
        version: "v2.8.8.1",
        date: "2026-05-12",
        items: [
            "修复常用普通功能工具中【修复缩略图缓存】在 Win11 上的兼容性问题"
        ]
    },
    {
        version: "v2.8.8",
        date: "2026-05-10",
        items: [
            "引入 MinSudo 库作为提权的备用方案"
        ]
    },
    {
        version: "v2.8.7",
        date: "2026-05-05",
        items: [
            "主窗口子 Form 展示逻辑大改",
            "首页增加快捷键（Ctrl+Space 显示）",
            "高级修改系统工具新增【用户功能】栏目",
            "Shell 文件夹重定向工具修复部分问题",
            "下载提供 EXE 改为特殊自解压安装包模式",
            "命令行模式新增 -AC / -ArgC / -ArgCmd / -ArgCommand 执行单条命令并退出"
        ]
    },
    {
        version: "v2.8.6",
        date: "2026-04-28",
        items: [
            "新增工具：【Shell 文件夹重定向工具】",
            "常用普通功能工具新增【Shell 文件夹】页"
        ]
    },
    {
        version: "v2.8.5",
        date: "2026-04-20",
        items: [
            "《问身 问己 问心》：降低前期挣钱难度，工作经验获取上限提升",
            "《问身 问己 问心》：降低困难模式与普通模式难度，微调经济系统",
            "《问身 问己 问心》：新增道具：压缩饼干、矿泉水、瓶装饮料",
            "《问身 问己 问心》：修复大量 BUG",
            "YtDlp 工具新增【附加功能】页",
            "YtDlp 工具新增 DanmakuFactory，XML 转 ASS 字幕",
            "YtDlp 工具新增由元数据生成 HTML 静态网页功能",
            "YtDlp 工具修复变通参数路径 BUG"
        ]
    },
    {
        version: "v2.8.4",
        date: "2026-04-15",
        items: [
            "YtDlp 工具新增【调用程序】页（exec）",
            "YtDlp 工具支持自动下载弹幕并转格式（DanmakuFactory）"
        ]
    },
    {
        version: "v2.8.3",
        date: "2026-04-10",
        items: [
            "YtDlp 调用方式改进，路径含空格也可正常使用",
            "FFmpeg 重制启程",
            "更新 YtDlp 程序版本（026.02.21 → 026.03.17）",
            "更新 FFmpeg 程序版本（N-119595 → 8.1-full_build）",
            "内部框架略微变动"
        ]
    },
    {
        version: "v2.8.2",
        date: "2026-04-05",
        items: [
            "新增工具页【常用普通功能工具】",
            "万能工具排序并高亮【常用普通功能工具】和【高级修改系统工具】",
            "YtDlp 工具实装配置保存功能（DefaultConfig.xml）"
        ]
    },
    {
        version: "v2.8.1",
        date: "2026-03-28",
        items: [
            "卸载程序与齐之防御更换图标",
            "新增工具【随机垃圾笑话（JokeAPI）】",
            "齐之防御暂被强制禁用"
        ]
    },
    {
        version: "v2.8",
        date: "2026-03-20",
        items: [
            "新增【命令行模式】-c / -cmd / -command 启动",
            "万能工具新增【娱乐工具】页",
            "新增工具【随机获取短句（一言）】",
            "释放环境变量附带多个快捷方式"
        ]
    },
    {
        version: "v2.7",
        date: "2026-03-10",
        items: [
            "YtDlp 工具大量新增参数选项（网络、重试、元文件、认证、后期处理等）",
            "YtDlp 工具 UI 布局调整"
        ]
    },
    {
        version: "v2.6.2",
        date: "2026-03-01",
        items: [
            "YtDlp 工具增加预设下载过滤与下载限制",
            "YtDlp 工具增加高级下载过滤",
            "YtDlp 工具增加调试模式",
            "YtDlp 工具增加自动下载 ID 映射名称"
        ]
    },
    {
        version: "v2.6.1",
        date: "2026-02-25",
        items: [
            "修复 YtDlp 在含空格路径下的问题",
            "修复 YtDlp 工具一系列 BUG"
        ]
    },
    {
        version: "v2.6",
        date: "2026-02-20",
        items: [
            "YtDlp 增加 archive 增强功能",
            "YtDlp 增加自动下载功能",
            "YtDlp 强化异步操作"
        ]
    },
    {
        version: "v2.5.5",
        date: "2026-02-15",
        items: [
            "高级修改系统工具添加内部接口",
            "系统错误检查工具添加策略禁用相关修复",
            "更新 Geek，彻底移除 CQAA"
        ]
    },
    {
        version: "v2.5.4",
        date: "2026-02-10",
        items: [
            "增加完善日志（完整度 40%）",
            "yt-dlp 支持拖入 txt 导入 cookies",
            "yt-dlp 支持按 txt 每行一个下载视频"
        ]
    },
    {
        version: "v2.5.3",
        date: "2026-02-05",
        items: [
            "增加完善日志（完整度 30%）",
            "更新 yt-dlp 版本",
            "yt-dlp 支持 cookies.txt 下载"
        ]
    },
    {
        version: "v2.5.2",
        date: "2026-02-01",
        items: [
            "高级修改工具-系统功能禁用-通用功能：增加 Programs"
        ]
    },
    {
        version: "v2.5",
        date: "2026-01-25",
        items: [
            "清理垃圾增加清理项",
            "齐之防御修复部分问题",
            "万能工具增加文本处理工具",
            "高级修改工具增加【资源管理器】栏目",
            "高级文件操作工具增加 Json 语言键对比功能",
            "《问身 问己 问心》修改护身符价格，增加气运值变量"
        ]
    },
    {
        version: "v2.4.1",
        date: "2026-01-20",
        items: [
            "增加启动参数 -o",
            "万能工具-第三方软件功能页增加 PCL 功能"
        ]
    },
    {
        version: "v2.4",
        date: "2026-01-15",
        items: [
            "扩展管理添加第三方扩展工具 MAS 下载",
            "万能工具-第三方工具添加《MAS 激活工具》"
        ]
    },
    {
        version: "v2.3",
        date: "2026-01-10",
        items: [
            "万能工具-第三方工具添加《FFmpeg 工具》",
            "修复 yt-dlp 与 IDM 激活工具不可用的问题",
            "修复完整版未附带 IDM 激活工具的问题",
            "万能工具-软件工具添加【第三方软件功能页】",
            "扩展管理 QiCmd 支持自定义版本"
        ]
    },
    {
        version: "v2.2.2",
        date: "2026-01-05",
        items: [
            "QiCmd 同步更新为 0.3 版本",
            "扩展管理安装 QiCmd 会添加 qbat 打开方式"
        ]
    },
    {
        version: "v2.2.1",
        date: "2026-01-02",
        items: [
            "QiCmd 同步更新为 0.2 版本",
            "扩展管理增加防连续点击机制"
        ]
    },
    {
        version: "v2.2",
        date: "2025-12-28",
        items: [
            "《问身 问己 问心》神赐道具可随时进入神秘森林",
            "《问身 问己 问心》开始游戏后难度调整模块锁定",
            "《奇怪的食物》开发进度 10%",
            "我的世界等价交换快速定价工具框架搭建",
            "软件设置中添加扩展管理"
        ]
    },
    {
        version: "v2.1.3",
        date: "2025-12-20",
        items: [
            "高级文件操作-文本文件功能增加自定义规则修改文本文档",
            "隐藏部分工具（今天吃什么、软件下载、计算器）"
        ]
    },
    {
        version: "v2.1.2",
        date: "2025-12-15",
        items: [
            "高级系统修改工具-系统工具禁用改进数据获取算法",
            "自定义问答程序设计工具修复路径 BUG",
            "奇葩问答新增 66 道题目"
        ]
    },
    {
        version: "v2.1.1",
        date: "2025-12-10",
        items: [
            "高级系统修改工具-系统工具禁用增加 System 区块",
            "支持修改 LocalMachine 区",
            "修复部分报错问题"
        ]
    },
    {
        version: "v2.1",
        date: "2025-12-05",
        items: [
            "齐之防御修复进程卡死问题",
            "软件设置增加【动画推荐】栏目",
            "奇葩问答大幅增加题库"
        ]
    },
    {
        version: "v2.0.1",
        date: "2025-11-28",
        items: [
            "齐之防御修复部分情况无法运行的问题",
            "修复程序异常问题",
            "修复 Ctrl+Alt+ESC 无法正常退出的问题"
        ]
    },
    {
        version: "v2.0",
        date: "2025-11-20",
        items: [
            "增加重要工具：【齐之防御】",
            "增加工具：【高级修改系统工具】",
            "增加工具：【中等优先级自启动项工具】"
        ]
    },
    {
        version: "v1.9",
        date: "2025-11-10",
        items: [
            "《问身 问己 问心》修复死亡判断系统重大漏洞",
            "修复欺诈之面被动欺骗问题",
            "增强可扩展性",
            "为所有神赐道具赋予技能",
            "增加重要道具——理智精华",
            "增加保命道具：急救包、解毒剂、幸运符",
            "增加新关键数值：污染值",
            "修改知识区页，只能去对应信仰的神明处"
        ]
    },
    {
        version: "v1.8.8",
        date: "2025-11-01",
        items: [
            "《问身 问己 问心》修复重置后难度选项不生效的问题",
            "修复过热文本错误",
            "修复塔罗牌第18号月亮牌文本解释错误",
            "难度系统影响每日数值自然下降",
            "非困难模式下，重大负面随机事件不在世界一阶段出现"
        ]
    },
    {
        version: "v1.8.7.3",
        date: "2025-10-28",
        items: [
            "yt-dlp 工具修复使用快捷方式无法运行的问题"
        ]
    },
    {
        version: "v1.8.7.2",
        date: "2025-10-26",
        items: [
            "软件设置修复环境变量无法正常添加/删除的问题"
        ]
    },
    {
        version: "v1.8.7.1",
        date: "2025-10-25",
        items: [
            "万能工具修复第三方工具快捷方式无法运行的问题"
        ]
    },
    {
        version: "v1.8.7",
        date: "2025-10-20",
        items: [
            "增加了卸载程序"
        ]
    },
    {
        version: "v1.8.6",
        date: "2025-10-15",
        items: [
            "高级文件操作工具增加【对比复制】"
        ]
    },
    {
        version: "v1.8.5.1",
        date: "2025-10-12",
        items: [
            "高级文件操作工具修复文件删除左侧栏问题",
            "修复文本文件功能计数器逻辑错误",
            "增加【创建极限长度的文件】功能"
        ]
    },
    {
        version: "v1.8.5",
        date: "2025-10-08",
        items: [
            "垃圾清理扫描时实现实时显示"
        ]
    },
    {
        version: "v1.8.4",
        date: "2025-10-05",
        items: [
            "垃圾清理删除时实现实时显示"
        ]
    },
    {
        version: "v1.8.3.1",
        date: "2025-10-02",
        items: [
            "软件设置增加相关下载按钮"
        ]
    },
    {
        version: "v1.8.3",
        date: "2025-09-28",
        items: [
            "此电脑命名空间工具修复三处重大漏洞",
            "增加工具：【程序卸载注册表项工具】"
        ]
    },
    {
        version: "v1.8.2",
        date: "2025-09-25",
        items: [
            "此电脑命名空间工具增加预设系统文件夹的 GUID"
        ]
    },
    {
        version: "v1.8.1",
        date: "2025-09-22",
        items: [
            "此电脑命名空间工具可自由切换区块"
        ]
    },
    {
        version: "v1.8",
        date: "2025-09-20",
        items: [
            "增加工具：【此电脑命名空间工具】"
        ]
    },
    {
        version: "v1.7",
        date: "2025-09-15",
        items: [
            "yt-dlp 工具增加许多功能",
            "高级文件操作工具增加许多功能",
            "IFEO 映像劫持工具添增更多预设值"
        ]
    },
    {
        version: "v1.6",
        date: "2025-09-08",
        items: [
            "增加工具：【yt-dlp 工具】",
            "高级文件操作工具小优化"
        ]
    },
    {
        version: "v1.5",
        date: "2025-09-01",
        items: [
            "增加工具：【系统错误检查工具】",
            "增加工具：【计算器】",
            "文件操作增加高级模式"
        ]
    },
    {
        version: "v1.4.2 β1.5.1",
        date: "2025-08-25",
        items: [
            "修复奇怪问答仅出现问题 45 号题目的问题",
            "微调 IFEO 映像劫持工具界面"
        ]
    },
    {
        version: "v1.4.2 β1.5",
        date: "2025-08-20",
        items: [
            "新小游戏项目：【奇怪的食物】",
            "软件下载框架重写",
            "增加工具：【IFEO 映像劫持工具】"
        ]
    },
    {
        version: "v1.4.2 β1.4",
        date: "2025-08-15",
        items: [
            "奇葩问答回答错误时添加颜色提示"
        ]
    },
    {
        version: "v1.4.2 β1.3",
        date: "2025-08-12",
        items: [
            "奇葩问答回答错误时添加颜色提示"
        ]
    },
    {
        version: "v1.4.2 β1.2",
        date: "2025-08-10",
        items: [
            "奇葩问答新增 9 道题目"
        ]
    },
    {
        version: "v1.4.2 β1.1",
        date: "2025-08-08",
        items: [
            "修复清理垃圾扫描时报错的问题"
        ]
    },
    {
        version: "v1.4.2 β1",
        date: "2025-08-05",
        items: [
            "清理垃圾全面增强"
        ]
    },
    {
        version: "v1.4.1",
        date: "2025-08-01",
        items: [
            "修改系统密码功能移至【万能工具→系统工具→系统设置】",
            "增加功能栏：【命令行命令】"
        ]
    },
    {
        version: "v1.4",
        date: "2025-07-25",
        items: [
            "软件设置全面升级",
            "增加【文本处理工具】与【今天吃什么】",
            "增加【用系统级权限运行系统程序】",
            "主页新增【垃圾清理】功能",
            "奇葩问答新增更多题目",
            "生存挑战小游戏正式命名【问身 问己 问心】",
            "问心崖已开放",
            "附带【齐常用网站打开器】",
            "修复文件操作中【阅读文件】功能"
        ]
    },
    {
        version: "v1.3 β2",
        date: "2025-07-20",
        items: [
            "优化启动第三方工具【IDM 激活工具】，移除多余 CMD 窗口"
        ]
    }
];

// ---------- 渲染函数 ----------
function renderChangelog(containerId, showCount) {
    showCount = showCount || 5; // 默认显示 5 条
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '';
    const total = changelogData.length;
    const visible = Math.min(showCount, total);

    changelogData.forEach((log, index) => {
        const isHidden = index >= visible;
        const itemsHtml = log.items.map(item => `• ${item}`).join('<br>');
        html += `
            <div class="log-item ${isHidden ? 'more-log' : ''}" style="${isHidden ? 'display:none;' : ''}">
                <span class="log-version">${log.version}</span>
                <span class="log-date">${log.date}</span>
                <p>${itemsHtml}</p>
            </div>
        `;
    });

    // 如果有折叠的条目，添加切换按钮
    if (total > visible) {
        const hiddenCount = total - visible;
        html += `
            <button class="log-toggle-btn" onclick="toggleLogs('${containerId}')">
                显示更多 (${hiddenCount} 条)
            </button>
        `;
    }

    container.innerHTML = html;
}

// ---------- 切换函数 ----------
function toggleLogs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const moreLogs = container.querySelectorAll('.more-log');
    const btn = container.querySelector('.log-toggle-btn');
    if (!btn || moreLogs.length === 0) return;

    const isHidden = moreLogs[0].style.display === 'none';
    moreLogs.forEach(el => {
        el.style.display = isHidden ? 'block' : 'none';
    });
    btn.textContent = isHidden ? `收起 (${moreLogs.length} 条)` : `显示更多 (${moreLogs.length} 条)`;
}

// ---------- 自动初始化（页面加载后执行） ----------
document.addEventListener('DOMContentLoaded', function() {
    // 查找页面中带有 data-changelog 属性的容器
    const containers = document.querySelectorAll('[data-changelog]');
    containers.forEach(container => {
        const showCount = parseInt(container.getAttribute('data-show')) || 5;
        renderChangelog(container.id, showCount);
    });
});