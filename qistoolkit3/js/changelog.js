// changelog.js - 更新日志数据与渲染

// ============================================================
// 更新日志数据（从 markdown 转换而来）
// ============================================================
const CHANGELOG_DATA = [
  {
    "version": "v2.9.1.0",
    "date": "2026-07-17",
    "type": "minor",
    "content": [
      "为文本规则引擎引入了新的附加条件参数（Suffix-Text）",
      "为文本规则引擎修复了一系列Trim带来的BUG，现在表达式左侧的内容会被Trim，右侧不会",
      "为YtDlp工具的重命名增加了个手动执行的按钮，以便调试重命名规则表达式",
      "修改了YtDlp工具默认的重命名规则，现在会自动将多个空格合并为一个",
      "修复了YtDlp工具【检查更新 yt-dlp】因底层实现大改后未改用新实现方法导致功能实际不可用的问题",
      "修复了YtDlp工具执行重命名时有概率出现卡死的问题（但似乎没完全修好）",
      "引入了依赖EasyHook进行对其他程序的DLL注入，但其相关功能未完成",
      "更新了FFmpeg版本（8.1-full_build → 8.1.2-full_build）",
      "重新启用了QisToolkitIS（齐的工具包IS）项目",
      "增加全新项目WinUI3作为新IS的UI方案，但目前极其不稳定，暂不推荐使用",
      "为【最终用户许可协议】中下载链接中添加 GitHub Releases 渠道",
      "MinSudo提权方案再次修改实现，并增强了鲁棒性，修复了卡死UI线程的问题",
      "重写了奇葩问答的读取实现逻辑，现在支持更直观的字符串作为题库文件名，性能得到优化",
      "软件设置中移除蓝奏云下载渠道，改至官网链接",
      "齐之防御项目新增删除文件（DELETE_FILE|{FilePath}）",
      "引入EasyHook库，尽管相关功能还在开发……"
    ]
  },
  {
    "version": "v2.9.0.0",
    "date": "2026-06-20",
    "type": "major",
    "content": [
      "新增【-SPL <EXE>】即调用SPL启动某程序",
      "引入MinSudo（C++代码略改）到项目作为全新提权方案，由于本人水平有限，仅能在Win10保证奏效。Win11仍然依赖外部提权方案",
      "齐之防御项目 和 导入的SPL新提权方案MinSudo 合并入 齐的工具包3 解决方案",
      "高级修改系统工具 的 系统信息 中 新增大量 Windows系统标识 相关修改项",
      "基础工具添加任务管理器，用于结束任务 与 装载/卸载 关键进程",
      "为【YtDlp工具】增加了一个全新页【文件命名】用于自动给下载完成后的文件重命名。规则同文本规则",
      "重写了文本规则引擎",
      "重启齐之防御项目，完全重写代码"
    ]
  },
  {
    "version": "v2.8.14.0",
    "date": "2026-06-10",
    "type": "minor",
    "content": [
      "修复了【YtDlp工具】自动下载配置文件Playlist参数显式设置为false 会指定值的BUG",
      "修改了【YtDlp工具】使用粘贴板上的网址的一些BUG，现在会自动匹配URL进行下载了",
      "更新了YtDlp程序版本",
      "《问身 问己 问心》第一个副本基础界面已写好，基础玩法已定下"
    ]
  },
  {
    "version": "v2.8.13.0",
    "date": "2026-06-05",
    "type": "minor",
    "content": [
      "修复了【问身 问己 问心】开启了开发者模式的问题",
      "【FFmpeg工具】更新内容：再次彻底重写了导入文件的实现逻辑；默认保存位置改为 .\\yt-dlp\\Downloads\\output.mp4；增加了两个快捷操作按钮；在【流预设页】增加了嵌入艺术图的功能；重新布局了UI",
      "《问身 问己 问心》新增好随机事件，获得宝箱！会获得许多惊喜！",
      "【YtDlp工具】重制了自动下载的配置文件实现，现在弃用了旧的俩配置文件，改用新的 .\\yt-dlp\\AutoDownloadConfig.txt"
    ]
  },
  {
    "version": "v2.8.12.0",
    "date": "2026-05-30",
    "type": "minor",
    "content": [
      "【YtDlp工具】添加Demo程序依赖，以绕过YouTube反爬虫",
      "【FFmpeg工具】重大更新：完善了视频选项（视频重编码）；完善了音频选项（音频重编码）；完善了复制流相关选项；新增了输入输出选项卡；重写了导入导出文件的逻辑"
    ]
  },
  {
    "version": "v2.8.11.1",
    "date": "2026-05-25",
    "type": "patch",
    "content": [
      "【YtDlp工具】下载片段功能 严重BUG修复"
    ]
  },
  {
    "version": "v2.8.11.0",
    "date": "2026-05-24",
    "type": "minor",
    "content": [
      "【YtDlp工具】增加了下载片段功能",
      "优化部分代码"
    ]
  },
  {
    "version": "v2.8.10.0",
    "date": "2026-05-20",
    "type": "minor",
    "content": [
      "增加了【IEFO 映像劫持工具】的英文本地化",
      "增加了【此电脑命名空间工具】的英文本地化",
      "增加了【常用普通功能工具】的英文本地化",
      "增加了【系统服务工具】的英文本地化",
      "增加了【扩展管理】的英文本地化",
      "修复了【YtDlp工具】的【指定下载保存路径】在未保存选项的情况下缺失的问题",
      "移除了【YtDlp工具：高级下载过滤器】的包含字串表达式",
      "合并了【齐的工具包卸载程序项目】到了【齐的工具包】的解决方案中",
      "更新日志改用Markdown格式",
      "YtDlp工具修改：禁止重复点击下载；编辑高级下载过滤不再需要勾选启用高级下载过滤；HTML生成支持嵌入视频而非封面，需要手动勾选选项；优化了一些文本的表述；完成了大约20%的英文本地化"
    ]
  },
  {
    "version": "v2.8.9.0",
    "date": "2026-05-15",
    "type": "minor",
    "content": [
      "优化了语言实现逻辑",
      "增加了【最终用户许可协议.txt】",
      "增加了【主页】的英文本地化",
      "优化了【软件设置】的英文本地化",
      "增加了【清理垃圾】的英文本地化",
      "增加了【奇葩问答】的英文本地化",
      "增加了【万能工具】的英文本本地化",
      "增加了【高级系统修改工具】的英文本地化",
      "修改了【高级系统修改工具】的【登录消息】模块功能从【系统修改】转到了【系统信息】",
      "高级系统修改工具：在【系统信息】新增【Windows 系统标识】模块",
      "命令行模式：增加了启动参数【-H / -Hide】，支持以隐藏窗口运行",
      "软件设置：修改了布局，添加了齐的工具包3【下载/仓库/联系方式】专用页"
    ]
  },
  {
    "version": "v2.8.8.1",
    "date": "2026-05-10",
    "type": "patch",
    "content": [
      "修复了【常用普通功能工具】中的【修复缩略图缓存】功能在Windows 11上的兼容性问题"
    ]
  },
  {
    "version": "v2.8.8.0",
    "date": "2026-05-08",
    "type": "minor",
    "content": [
      "引入 MinSudo 库作为提权的备用方案"
    ]
  },
  {
    "version": "v2.8.7.0",
    "date": "2026-05-05",
    "type": "minor",
    "content": [
      "主窗口的子Form展示逻辑大改",
      "首页：增加一些快捷键，按Ctrl+Space显示",
      "高级修改系统工具：增加栏目【用户功能】，位于【万能工具→原创工具→高级工具→高级修改系统工具→主要功能→用户功能】",
      "Shell 文件夹重定向工具：修复部分问题",
      "下载提供EXE改为特殊自解压安装包模式",
      "一大堆不可见、零零散散且我自己也忘了的改动",
      "命令行模式：新增参数执行模式，使用参数【-AC / -ArgC / -ArgCmd / -ArgCommand】来执行单条命令并立即退出。需带引号包裹命令"
    ]
  },
  {
    "version": "v2.8.6.0",
    "date": "2026-04-30",
    "type": "minor",
    "content": [
      "新增工具：【Shell 文件夹重定向工具】用于强行重定向Shell文件夹（位于 万能工具→原创工具→高级工具）",
      "常用普通功能工具：新增【Shell 文件夹】页",
      "一大堆不可见、零零散散且我自己也忘了的改动"
    ]
  },
  {
    "version": "v2.8.5.0",
    "date": "2026-04-25",
    "type": "minor",
    "content": [
      "《问身 问己 问心》：降低了前期挣钱难度，工作经验获取上限提升（10/8/6 → 15/12/12）",
      "《问身 问己 问心》：降低了困难模式与普通模式的难度，微调经济系统",
      "《问身 问己 问心》：增加了道具：压缩饼干、矿泉水、瓶装饮料。这些道具可以随时使用增加 饥饿值/口渴值/心情值",
      "《问身 问己 问心》：修复了不少BUG",
      "YtDlp工具：新增【附加功能】页，此页会增加原创功能（非YtDlp自带的功能）",
      "YtDlp工具：新增DanmakuFactory，自动将XML字幕文件转换成ASS字幕文件",
      "YtDlp工具：新增功能，可以由元数据文件自动生成一个Html静态网页文件，以供用户查看",
      "YtDlp工具：修复了变通参数有重大路径BUG的问题",
      "YtDlp工具：修复了一系列其他bug"
    ]
  },
  {
    "version": "v2.8.4.0",
    "date": "2026-04-20",
    "type": "minor",
    "content": [
      "YtDlp工具新增【调用程序】页，即exec",
      "YtDlp工具现在支持自动下载弹幕并转格式了"
    ]
  },
  {
    "version": "v2.8.3.0",
    "date": "2026-04-15",
    "type": "minor",
    "content": [
      "YtDlp调用方式改进，现在路径中携带空格也可正常使用",
      "FFmpeg重制启程，现在只开了个头",
      "更新了YtDlp程序版本（026.02.21 → 026.03.17）",
      "更新了FFmpeg程序版本（N-119595-gb6803bf104-20250519 → 8.1-full_build）",
      "内部框架略微变动"
    ]
  },
  {
    "version": "v2.8.2.0",
    "date": "2026-04-10",
    "type": "minor",
    "content": [
      "新增工具页【常用普通功能工具】，增加一撮功能",
      "为万能工具进行排序，并高亮【常用普通功能工具】和【高级修改系统工具】",
      "YtDlp工具实装配置保存功能，保存在 .\\yt-dlp\\DefaultConfig.xml",
      "无数不可见改动"
    ]
  },
  {
    "version": "v2.8.1.0",
    "date": "2026-04-05",
    "type": "minor",
    "content": [
      "为卸载程序（Uninstall_QisToolkit3.exe）与齐之防御（QisDefense.exe）更换图标，以便辨认",
      "新增工具【随机垃圾笑话（JokeAPI）】工具，位于【万能工具 → 娱乐工具】",
      "齐之防御暂被强制禁用",
      "无数不可见改动"
    ]
  },
  {
    "version": "v2.8.0.0",
    "date": "2026-04-01",
    "type": "major",
    "content": [
      "齐的工具包新增全新模式【命令行模式】，使用参数【-c / -cmd / -command】启动，或在【软件设置】中点击【管理员权限命令行模式】或【System权限命令行模式】启动命令行",
      "万能工具新增【娱乐工具】页",
      "新增工具【随机获取短句（一言）】工具，位于【万能工具 → 娱乐工具】",
      "现在释放环境变量会附带多个快捷方式",
      "无数不可见改动"
    ]
  },
  {
    "version": "v2.7.0.0",
    "date": "2026-03-20",
    "type": "major",
    "content": [
      "YtDlp工具增加【基础参数】中的一系列【网络、重试机制等选项设置】参数选项",
      "YtDlp工具增加【文件参数】中的一系列【元文件系统】参数选项",
      "YtDlp工具增加【文件参数】中的一系列【详细指定下载保存路径】参数选项",
      "YtDlp工具增加【变通参数】中的一系列【连接变通方法】参数选项",
      "YtDlp工具增加【变通参数】中的一系列【下载间隔】参数选项",
      "YtDlp工具增加【变通参数】中的一系列【自定义HTTP头】参数选项",
      "YtDlp工具增加【格式字幕】中的一系列【格式策略参数】参数选项",
      "YtDlp工具增加【格式字幕】中的一系列【字幕参数】参数选项",
      "YtDlp工具增加【格式字幕】中的一系列【缩略图参数】参数选项",
      "YtDlp工具增加【认证参数】中的一系列【基础账号认证】参数选项",
      "YtDlp工具增加【认证参数】中的一系列【.netrc 认证系统】参数选项",
      "YtDlp工具增加【认证参数】中的一系列【Adobe Pass 认证系统】参数选项",
      "YtDlp工具增加【认证参数】中的一系列【SSL 客户端认证系统】参数选项",
      "YtDlp工具增加【后期处理】中的一系列【音频处理】参数选项",
      "YtDlp工具增加【后期处理】中的一系列【视频处理】参数选项",
      "YtDlp工具增加【后期处理】中的一系列【嵌入处理】参数选项",
      "YtDlp工具增加【后期处理】中的一系列【字幕格式处理与缩略图格式处理】参数选项",
      "YtDlp工具UI布局调整"
    ]
  },
  {
    "version": "v2.6.2.0",
    "date": "2026-03-10",
    "type": "minor",
    "content": [
      "YtDlp工具增加一系列预设下载过滤与下载限制",
      "YtDlp工具增加高级下载过滤（不完善）",
      "YtDlp工具增加调试模式（详细输出模式）",
      "YtDlp工具增加自动下载ID映射名称与相关功能",
      "YtDlp工具增加快速打开一些配置文件的按钮",
      "YtDlp工具调整了布局"
    ]
  },
  {
    "version": "v2.6.1.0",
    "date": "2026-03-05",
    "type": "minor",
    "content": [
      "修复了YtDlp在有空格的路径下会存在问题的问题",
      "修复了YtDlp工具一系列BUG"
    ]
  },
  {
    "version": "v2.6.0.0",
    "date": "2026-03-01",
    "type": "major",
    "content": [
      "YtDlp增加了 archive 增强功能",
      "YtDlp增加了 自动下载 功能",
      "YtDlp强化异步操作"
    ]
  },
  {
    "version": "v2.5.5.0",
    "date": "2026-02-25",
    "type": "minor",
    "content": [
      "为\"高级修改系统工具\"添加了内部接口",
      "为\"系统错误检查工具\"添加了策略禁用相关修复",
      "更新了 Geek，彻底移除了 CQAA",
      "若干不可见改动（我自己也忘了）"
    ]
  },
  {
    "version": "v2.5.4.0",
    "date": "2026-02-20",
    "type": "minor",
    "content": [
      "增加了完善了日志（完整度 40%）",
      "yt-dlp工具现在支持拖入txt文件来导入cookies了",
      "yt-dlp工具现在支持按txt每行一个来下载视频了",
      "yt-dlp工具隐藏了一些还在大饼阶段的功能选项（之前其实属于失误）",
      "若干不可见改动（我自己也忘了）"
    ]
  },
  {
    "version": "v2.5.3.0",
    "date": "2026-02-15",
    "type": "minor",
    "content": [
      "增加了完善了日志（完整度 30%）",
      "对yt-dlp版本进行了更新",
      "对yt-dlp工具进行增强，现在支持cookies.txt中的cookies进行下载了",
      "若干不可见改动（我自己也忘了）"
    ]
  },
  {
    "version": "v2.5.2.0",
    "date": "2026-02-10",
    "type": "minor",
    "content": [
      "高级修改工具-系统功能禁用-通用功能：增加 Programs 并调整布局",
      "若干不可见改动（我自己也忘了）"
    ]
  },
  {
    "version": "v2.5.0.0",
    "date": "2026-02-05",
    "type": "major",
    "content": [
      "清理垃圾：增加了一些清理项",
      "齐之防御：修复了基础版在无齐之防御的情况下激活齐之防御可能导致的问题",
      "万能工具：增加文本处理工具",
      "高级修改工具：增加栏目 资源管理器",
      "高级文件操作工具：增加功能Json语言键对比功能",
      "《问身 问己 问心》：修改了护身符道具价格",
      "《问身 问己 问心》：增加变量 气运值，详见游戏文档"
    ]
  },
  {
    "version": "v2.4.1.0",
    "date": "2026-01-30",
    "type": "minor",
    "content": [
      "齐的工具包3：增加启动参数 -o，详见 \"启动参数说明.txt\"",
      "万能工具-软件工具-第三方软件功能页：进行了详细分类",
      "万能工具-软件工具-第三方软件功能页-游戏娱乐：添加新功能模块 PCL 功能"
    ]
  },
  {
    "version": "v2.4.0.0",
    "date": "2026-01-25",
    "type": "major",
    "content": [
      "扩展管理：添加了新（第三方）扩展工具 MAS 下载",
      "万能工具-第三方工具：添加新工具《MAS 激活工具》"
    ]
  },
  {
    "version": "v2.3.0.0",
    "date": "2026-01-20",
    "type": "major",
    "content": [
      "万能工具-第三方工具：添加新工具《FFmpeg 工具》",
      "万能工具-第三方工具：修复了yt-dlp工具按钮与IDM 激活工具不可用的问题",
      "齐的工具包3 完整版：修复了最近几个版本未附带IDM 激活工具的问题",
      "万能工具-软件工具：添加工具页《第三方软件功能页》",
      "第三方软件功能页：添加第三方软件功能——微信",
      "扩展管理：下载的QiCmd不再是锁定最新版本，而是自定义版本，默认值是对应最新的版本",
      "扩展管理：修复了当ElseTool目录缺少时可能会导致下载失败的问题"
    ]
  },
  {
    "version": "v2.2.2.0",
    "date": "2026-01-15",
    "type": "minor",
    "content": [
      "《QiCmd》同步更新为0.3版本",
      "扩展管理-QiCmd：现在安装会添加qbat打开方式"
    ]
  },
  {
    "version": "v2.2.1.0",
    "date": "2026-01-12",
    "type": "minor",
    "content": [
      "《QiCmd》同步更新为0.2版本",
      "扩展管理：增加防连续点击按钮机制"
    ]
  },
  {
    "version": "v2.2.0.0",
    "date": "2026-01-10",
    "type": "major",
    "content": [
      "《问身 问己 问心》：现在当你有了神赐道具后将随时可进入神秘森林，不再受理智限制",
      "《问身 问己 问心》：现在开始游戏后难度调整模块将锁定",
      "《奇怪的食物》：开发进度 10%……",
      "我的世界等价交换快速定价工具：现在支持1.21.1的框架已经搭好",
      "扩展管理：现在在软件设置中添加了扩展管理，可以下载安装扩展啦！"
    ]
  },
  {
    "version": "v2.1.3.0",
    "date": "2026-01-05",
    "type": "minor",
    "content": [
      "高级文件操作-文本文件功能：增加自定义规则修改文本文档，详见文档——文本规则介绍.txt",
      "万能工具-原创工具-基础工具：将\"今天吃什么\"隐藏",
      "万能工具-原创工具-基础工具：将\"软件下载\"隐藏",
      "万能工具-原创工具-基础工具：将\"计算器\"隐藏"
    ]
  },
  {
    "version": "v2.1.2.0",
    "date": "2026-01-02",
    "type": "minor",
    "content": [
      "高级系统修改工具-系统工具禁用-通用功能：改进了获取数据算法（改用字典映射）",
      "高级系统修改工具-系统工具禁用-通用功能：现在切换区将会自动获取数据",
      "自定义问答程序设计工具：修复了运行空间路径BUG",
      "软件下载：修复了运行空间路径BUG",
      "奇葩问答：新增66道题目！"
    ]
  },
  {
    "version": "v2.1.1.0",
    "date": "2025-12-28",
    "type": "minor",
    "content": [
      "高级系统修改工具-系统工具禁用-通用功能：增加 System 区块",
      "高级系统修改工具-系统工具禁用-通用功能：现在可以修改LocalMachine区了",
      "高级系统修改工具-系统工具禁用-通用功能：修复了一些会导致报错的问题",
      "万能工具-系统工具-系统修改-系统开发者预留功能：现在彻底废弃了"
    ]
  },
  {
    "version": "v2.1.0.0",
    "date": "2025-12-25",
    "type": "major",
    "content": [
      "齐之防御：修复了进程卡死的问题",
      "软件设置：增加栏目\"动画推荐\"，开发中...",
      "奇葩问答：大幅增加了题库（大约是之前的 2 倍有余）"
    ]
  },
  {
    "version": "v2.0.1.0",
    "date": "2025-12-20",
    "type": "minor",
    "content": [
      "齐之防御：修复了部分情况无法运行的情况",
      "齐之防御：修复了程序异常的问题",
      "齐之防御：修复了Ctrl+Alt+ESC无法正常退出的问题"
    ]
  },
  {
    "version": "v2.0.0.0",
    "date": "2025-12-18",
    "type": "top",
    "content": [
      "增加重要工具：\"齐之防御\"",
      "增加工具：\"高级修改系统工具\"",
      "增加工具：\"中等优先级自启动项工具\""
    ]
  },
  {
    "version": "v1.9.0.0",
    "date": "2025-12-10",
    "type": "major",
    "content": [
      "《问身 问己 问心》：修复了死亡判断系统重大漏洞，无法判读通过等内容的问题",
      "《问身 问己 问心》：修复了欺诈之面被动欺骗，因死亡健康值归零死亡，但成功欺骗死亡，却无法正常重置健康值的问题",
      "《问身 问己 问心》：可扩展性得到了大幅增强",
      "《问身 问己 问心》：为所有神赐道具赋予了技能",
      "《问身 问己 问心》：增加了重要可堆叠道具——理智精华",
      "《问身 问己 问心》：增加了保命道具：急救包、解毒剂、幸运符",
      "《问身 问己 问心》：增加了新关键数值：污染值",
      "《问身 问己 问心》：修改了知识区页，现在只能去对应信仰的神明那里了（命运与欺诈除外，这俩最特殊）"
    ]
  },
  {
    "version": "v1.8.8.0",
    "date": "2025-12-05",
    "type": "minor",
    "content": [
      "《问身 问己 问心》：修复了重置后难度选项不生效的问题",
      "《问身 问己 问心》：修复了过热文本错误的问题",
      "《问身 问己 问心》：修复了塔罗牌第18号月亮牌文本解释错误的问题",
      "《问身 问己 问心》：现在难度系统会影响每天数值的自然下降",
      "《问身 问己 问心》：现在在非困难模式下，重大负面随机事件将不再会在世界一阶段的时候出现"
    ]
  },
  {
    "version": "v1.8.7.3",
    "date": "2025-12-02",
    "type": "patch",
    "content": [
      "yt-dlp 工具：修复了使用快捷方式无法运行的问题"
    ]
  },
  {
    "version": "v1.8.7.2",
    "date": "2025-12-01",
    "type": "patch",
    "content": [
      "软件设置：修复了环境变量无法正常添加/删除的问题"
    ]
  },
  {
    "version": "v1.8.7.1",
    "date": "2025-11-30",
    "type": "patch",
    "content": [
      "万能工具：修复了第三方工具使用快捷方式无法运行的问题"
    ]
  },
  {
    "version": "v1.8.7.0",
    "date": "2025-11-28",
    "type": "minor",
    "content": [
      "增加了卸载程序"
    ]
  },
  {
    "version": "v1.8.6.0",
    "date": "2025-11-25",
    "type": "minor",
    "content": [
      "高级文件操作工具：增加工具\"对比复制\""
    ]
  },
  {
    "version": "v1.8.5.1",
    "date": "2025-11-22",
    "type": "patch",
    "content": [
      "高级文件操作工具：修复了\"文件删除\"左侧栏中文件依旧存在的问题",
      "高级文件操作工具：修复了\"文本文件功能\"文件计数器逻辑错误的问题",
      "高级文件操作工具：增加了\"创建功能\"→\"特殊创建功能\"→\"创建极限长度的文件\"功能"
    ]
  },
  {
    "version": "v1.8.5.0",
    "date": "2025-11-20",
    "type": "minor",
    "content": [
      "垃圾清理：扫描垃圾时实现实时显示"
    ]
  },
  {
    "version": "v1.8.4.0",
    "date": "2025-11-18",
    "type": "minor",
    "content": [
      "垃圾清理：删除垃圾时实现实时显示"
    ]
  },
  {
    "version": "v1.8.3.1",
    "date": "2025-11-16",
    "type": "patch",
    "content": [
      "软件设置：增加相关下载按钮"
    ]
  },
  {
    "version": "v1.8.3.0",
    "date": "2025-11-15",
    "type": "minor",
    "content": [
      "此电脑命名空间工具：修复三处重大漏洞",
      "增加工具：\"程序卸载注册表项工具\""
    ]
  },
  {
    "version": "v1.8.2.0",
    "date": "2025-11-12",
    "type": "minor",
    "content": [
      "此电脑命名空间工具：增加预设系统文件夹的GUID"
    ]
  },
  {
    "version": "v1.8.1.0",
    "date": "2025-11-10",
    "type": "minor",
    "content": [
      "此电脑命名空间工具：可自由切换区块"
    ]
  },
  {
    "version": "v1.8.0.0",
    "date": "2025-11-08",
    "type": "major",
    "content": [
      "增加工具：\"此电脑命名空间工具\""
    ]
  },
  {
    "version": "v1.7.0.0",
    "date": "2025-11-05",
    "type": "major",
    "content": [
      "yt-dlp 工具：增加加许多功能",
      "高级文件操作工具：增加加许多功能",
      "IFEO映像劫持工具：添增了更多预设值"
    ]
  },
  {
    "version": "v1.6.0.0",
    "date": "2025-11-01",
    "type": "major",
    "content": [
      "增加工具：\"yt-dlp 工具\"",
      "高级文件操作工具：小优化"
    ]
  },
  {
    "version": "v1.5.0.0",
    "date": "2025-10-28",
    "type": "major",
    "content": [
      "增加工具：\"系统错误检查工具\"",
      "增加工具：\"计算器\"",
      "文件操作：增加高级模式"
    ]
  },
  {
    "version": "v1.4.2 β1.5.1",
    "date": "2025-10-25",
    "type": "patch",
    "content": [
      "修复了奇怪问答仅出现问题 45 号题目的问题",
      "微调 IFEO映像劫持工具 界面"
    ]
  },
  {
    "version": "v1.4.2 β1.5",
    "date": "2025-10-24",
    "type": "patch",
    "content": [
      "一个新小游戏项目：奇怪的食物",
      "软件下载框架重写",
      "增加工具：IFEO映像劫持工具（小技术突破~）"
    ]
  },
  {
    "version": "v1.4.2 β1.4",
    "date": "2025-10-22",
    "type": "patch",
    "content": [
      "为奇葩问答在回答错误时添加颜色提示"
    ]
  },
  {
    "version": "v1.4.2 β1.3",
    "date": "2025-10-21",
    "type": "patch",
    "content": [
      "为奇葩问答在回答错误时添加颜色提示"
    ]
  },
  {
    "version": "v1.4.2 β1.2",
    "date": "2025-10-20",
    "type": "patch",
    "content": [
      "为奇葩问答添加了 9 道题目"
    ]
  },
  {
    "version": "v1.4.2 β1.1",
    "date": "2025-10-19",
    "type": "patch",
    "content": [
      "修复了清理垃圾功能扫描时报错的问题"
    ]
  },
  {
    "version": "v1.4.2 β1",
    "date": "2025-10-18",
    "type": "minor",
    "content": [
      "清理垃圾全面增强"
    ]
  },
  {
    "version": "v1.4.1.0",
    "date": "2025-10-15",
    "type": "minor",
    "content": [
      "将修改系统密码功能移动到了\"万能工具\"→\"系统工具\"→\"系统设置\"中",
      "增加功能栏：\"命令行命令\"（位于\"万能工具\"→\"系统工具\"中）"
    ]
  },
  {
    "version": "v1.4.0.0",
    "date": "2025-10-12",
    "type": "major",
    "content": [
      "功能\"软件设置\"全面升级",
      "增加两个功能模块：文本处理工具与今天吃什么（位于\"万能工具\"→\"附带工具\"中）",
      "增加功能：\"用系统级权限运行系统程序\"（位于\"万能工具\"→\"系统工具\"中）",
      "增加主页功能：\"垃圾清理\"功能，强大无比！",
      "奇葩问答新增了更多题目",
      "生存挑战小游戏增加正式名称（问身 问己 问心）",
      "小游戏《问身 问己 问心》问心崖已开放",
      "现在附带了我的新项目：齐常用网站打开器",
      "修复了\"文件操作\"中的\"阅读文件\"功能不能阅读文件的问题"
    ]
  },
  {
    "version": "v1.3 β2",
    "date": "2025-10-05",
    "type": "patch",
    "content": [
      "优化了启动第三方工具\"IDM 激活工具\"功能，修复了会额外留下一个 CMD 窗口的问题"
    ]
  }
];

// ============================================================
// 辅助函数
// ============================================================

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
    }
    return dateStr;
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化版本号显示（去掉末尾的 .0）
function formatVersion(version) {
    return version.replace(/\.0$/, '');
}

// 获取版本类型标签配置
function getTypeConfig(type) {
    const configs = {
        'major': {
            label: '🚀 大版本',
            className: 'major'
        },
        'minor': {
            label: '✨ 小版本',
            className: 'minor'
        },
        'patch': {
            label: '🔧 补丁',
            className: 'patch'
        },
        'top': {
            label: '🌟 顶级版本',
            className: 'top'
        }
    };
    return configs[type] || configs['patch'];
}

// ============================================================
// 渲染函数
// ============================================================
function renderChangelog(containerId, showCount) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = CHANGELOG_DATA;
    const show = showCount || data.length;
    const displayData = data.slice(0, show);

    let html = '';
    displayData.forEach(item => {
        const type = item.type || 'patch';
        const typeConfig = getTypeConfig(type);
        const displayVersion = formatVersion(item.version);

        html += `
            <div class="log-item" data-version="${item.version}" data-type="${type}">
                <div class="log-meta">
                    <div class="log-version">
                        ${displayVersion}
                        <span class="version-tag ${typeConfig.className}">${typeConfig.label}</span>
                    </div>
                    <div class="log-date">${formatDate(item.date)}</div>
                </div>
                <div class="log-content">
                    <p>${item.content.map(line => `· ${escapeHtml(line)}`).join('<br>')}</p>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================
// 统计函数
// ============================================================
function getAllVersions() {
    return CHANGELOG_DATA.map(item => item.version);
}

function getLatestVersion() {
    return CHANGELOG_DATA.length > 0 ? CHANGELOG_DATA[0].version : '--';
}

function getTotalEntries() {
    let count = 0;
    CHANGELOG_DATA.forEach(item => {
        count += item.content.length;
    });
    return count;
}

// ============================================================
// 导出（供外部使用）
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CHANGELOG_DATA,
        renderChangelog,
        getAllVersions,
        getLatestVersion,
        getTotalEntries,
        formatVersion,
        getTypeConfig
    };
}

// ============================================================
// DOM 就绪后自动渲染
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否存在 changelog 容器（新页面）
    const container = document.getElementById('changelogTimeline');
    if (container) {
        renderChangelog('changelogTimeline');
    }

    // 兼容旧版 index.html 的更新日志区
    const oldContainer = document.getElementById('changelogContainer');
    if (oldContainer && oldContainer.dataset.changelog !== undefined) {
        const show = parseInt(oldContainer.dataset.show) || 5;
        renderOldStyleChangelog('changelogContainer', show);
    }
});

// ============================================================
// 兼容旧版 index.html 的渲染方式
// ============================================================
function renderOldStyleChangelog(containerId, showCount) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = CHANGELOG_DATA.slice(0, showCount);

    let html = '';
    data.forEach(item => {
        const displayVersion = formatVersion(item.version);
        html += `
            <div class="log-item" data-version="${item.version}">
                <span class="log-version">${displayVersion}</span>
                <span class="log-date">${formatDate(item.date)}</span>
                <p>${item.content.map(line => `· ${escapeHtml(line)}`).join('<br>')}</p>
            </div>
        `;
    });

    container.innerHTML = html;
}



// ============================================================
// 自动修正 type 字段（依据版本号变化段位）
// ============================================================
(function fixTypes() {
    // 解析版本号，提取前4段数字（不足补0）
    function parseVersion(ver) {
        const nums = ver.replace(/^v/, '').match(/\d+/g);
        if (!nums) return null;
        const arr = nums.map(Number);
        while (arr.length < 4) arr.push(0);
        return arr.slice(0, 4);
    }

    // 比较两个版本，返回 type
    function getType(v1, v2) {
        const a = parseVersion(v1);
        const b = parseVersion(v2);
        if (!a || !b) return 'patch';
        for (let i = 0; i < 4; i++) {
            if (a[i] !== b[i]) {
                if (i === 0) return 'top';
                if (i === 1) return 'major';
                if (i === 2) return 'minor';
                if (i === 3) return 'patch';
            }
        }
        return 'patch'; // 相同则视为补丁
    }

    // 遍历并修正
    for (let i = 0; i < CHANGELOG_DATA.length; i++) {
        const current = CHANGELOG_DATA[i];
        const next = CHANGELOG_DATA[i + 1];
        current.type = next ? getType(current.version, next.version) : 'patch';
    }

    // 输出修正后的完整数据（复制此输出替换原 CHANGELOG_DATA）
    console.log('修正后的 CHANGELOG_DATA：');
    console.log(JSON.stringify(CHANGELOG_DATA, null, 2));
})();