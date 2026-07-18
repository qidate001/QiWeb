// ============================================================
// cleaning-trash.js - 清理垃圾数据（静态列表）
// 微软文档风格 · 便于扩展
// ============================================================

// ----- 垃圾数据（根据您提供的源代码整理）-----
// 扩展时只需在对应分类的 items 数组中添加新对象即可
// 格式：{ name: '显示名称', paths: ['路径1', '路径2', ...] }

const trashData = [{
    id: 'system',
    label: '系统垃圾',
    icon: '🖥️',
    items: [
        { name: '系统缓存', paths: ['C:\\Windows\\Temp', 'C:\\Windows\\System32\\SleepStudy\\ScreenOn', 'C:\\Windows\\System32\\WDI'] },
        { name: '系统日志', paths: ['C:\\Windows\\Logs', 'C:\\Windows\\security\\logs', 'C:\\ProgramData\\Microsoft\\Network\\Downloader', 'C:\\Windows\\System32\\LogFiles', 'C:\\Windows\\System32\\WDI\\LogFiles', 'C:\\Windows\\Panther\\Rollback\\MachineIndependent\\Transformers\\CBS\\boot_volume\\WinLH\\WinSxS\\Catalogs'] },
        { name: '系统USO日志', paths: ['C:\\ProgramData\\USOShared\\Logs\\System', 'C:\\ProgramData\\USOShared\\Logs\\User'] },
        { name: '系统错误报告', paths: ['C:\\ProgramData\\Microsoft\\Windows\\WER\\ReportArchive', 'C:\\ProgramData\\Microsoft\\Windows\\WER\\ReportQueue', 'C:\\ProgramData\\Microsoft\\Windows\\WER\\Temp'] },
        { name: '本地程序缓存', paths: ['%LocalAppData%\\Temp'] },
        { name: '低优先级程序缓存', paths: ['%LocalAppDataLow%\\Temp'] },
        { name: '诊断报告', paths: ['%LocalAppData%\\ElevatedDiagnostics'] },
        { name: '最近启动', paths: ['%UserProfile%\\Recent'] },
        { name: '通用互联网临时文件', paths: ['%UserProfile%\\Cookies'] },
        { name: '缩略图缓存', paths: ['%LocalAppData%\\Microsoft\\Windows\\Explorer'] },
        { name: '驱动程序安装日志', paths: ['C:\\Windows\\DIFx.log'] },
        { name: '缓存的证书文件', paths: ['%LocalAppDataLow%\\Microsoft\\CryptnetUrlCache\\Content', 'C:\\Windows\\System32\\config\\systemprofile\\AppData\\LocalLow\\Microsoft\\CryptnetUrlCache\\Content', 'C:\\Windows\\System32\\config\\systemprofile\\AppData\\LocalLow\\Microsoft\\CryptnetUrlCache\\MetaData', 'C:\\Windows\\SysWOW64\\config\\systemprofile\\AppData\\LocalLow\\Microsoft\\CryptnetUrlCache\\Content', 'C:\\Windows\\SysWOW64\\config\\systemprofile\\AppData\\LocalLow\\Microsoft\\CryptnetUrlCache\\MetaData'] },
        { name: 'DX 接口日志', paths: ['C:\\Windows\\DirectX.log'] },
        { name: 'ISA 日志文件', paths: ['C:\\Windows\\PFRO.log'] },
        { name: 'DTC 安装日志', paths: ['C:\\Windows\\DtcInstall.log'] },
        { name: '系统安装错误日志', paths: ['C:\\Windows\\setuperr.log'] },
        { name: '系统更新日志', paths: ['C:\\Windows\\WindowsUpdate.log'] },
        { name: '系统更新信息', paths: ['C:\\Windows\\SoftwareDistribution\\DataStore\\Logs'] },
        { name: '系统更新下载', paths: ['C:\\Windows\\SoftwareDistribution\\Download'] },
        { name: '彩色日志', paths: ['%AppData%\\PLogs'] },
        { name: 'CRL缓存', paths: ['C:\\Users\\Administrator\\AppData\\LocalLow\\Microsoft\\CryptnetUrlCache\\Content', 'C:\\Users\\Administrator\\AppData\\LocalLow\\Microsoft\\CryptnetUrlCache\\MetaData'] },
        { name: 'Delivery Optimization日志', paths: ['C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Logs'] },
        { name: 'MS搜索缓存', paths: ['C:\\ProgramData\\Microsoft\\Search\\Data\\Applications\\Windows\\GatherLogs\\SystemIndex'] },
        { name: 'SubSystems', paths: ['C:\\Windows\\System32\\sru'] },
        { name: '3D着色器', paths: ['%LocalAppData%\\D3DSCache'] },
        { name: '.NET 全局程序集缓存', paths: ['C:\\Windows\\assembly'] },
        { name: '预读文件缓存', paths: ['C:\\Windows\\Prefetch'] },
        { name: '最近打开的文件', paths: ['%AppData%\\Microsoft\\Windows\\Recent'] }
    ]
}, {
    id: 'game',
    label: '游戏垃圾',
    icon: '🎮',
    items: [
        { name: 'i18nupdatemod', paths: ['%LocalAppData%\\.i18nupdatemod'] }
    ]
}, {
    id: 'userSoftware',
    label: '主要面向用户的软件垃圾',
    icon: '📦',
    items: [
        { name: '齐系列程序缓存', paths: ['C:\\QiAppDatas\\Temps'] },
        { name: 'IE 网页缓存', paths: ['%LocalAppData%\\Microsoft\\Windows\\WebCache', '%LocalAppData%\\Microsoft\\Internet Explorer\\CacheStorage'] },
        { name: 'Edge 视频解码统计信息', paths: ['%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\VideoDecodeStats'] },
        { name: 'Edge 日志', paths: ['%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\LOG.old'] },
        { name: 'Edge 缓存', paths: ['%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Code Cache', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Cache\\Cache_Data'] },
        { name: 'Edge 更新缓存', paths: ['C:\\Program Files (x86)\\Microsoft\\EdgeUpdate\\Download'] },
        { name: '酷狗歌曲缓存', paths: ['C:\\KuGou\\Temp', 'D:\\KuGou\\Temp', 'E:\\KuGou\\Temp', 'F:\\KuGou\\Temp'] },
        { name: '酷狗日志', paths: ['%AppData%\\KuGou8\\log'] },
        { name: '夸克浏览器 缓存', paths: ['%LocalAppData%\\Quark\\User Data\\Default\\Cache\\Cache_Data'] },
        { name: '酷狗安装日志', paths: ['%AppData%\\KuGou8\\Patch\\install.log'] },
        { name: '酷狗其他垃圾', paths: ['%AppData%\\KuGou8\\kugou.ini.bak'] },
        { name: 'Obsidian 更新', paths: ['%LocalAppData%\\obsidian-updater'] },
        { name: 'SMAPI 错误报告', paths: ['%AppData%\\StardewValley\\ErrorLogs\\SMAPI-latest.txt'] },
        { name: 'Adobe CR日志', paths: ['%LocalAppDataLow%\\Adobe\\CRLogs'] },
        { name: '腾讯程序日志', paths: ['%AppData%\\Tencent\\Logs'] },
        { name: '腾讯程序日志2', paths: ['%AppData%\\Tencent\\pallas\\teniodl\\Logs'] },
        { name: 'IDM下载数据', paths: ['%AppData%\\IDM\\DwnlData'] },
        { name: 'Unlocker日志', paths: ['C:\\Windows\\unlocker.log'] },
        { name: '暴雪战网', paths: ['C:\\ProgramData\\Battle.net\\Agent\\Logs', 'C:\\ProgramData\\Battle.net\\Setup\\fenris_2\\Logs', '%LocalAppData%\\Battle.net\\Logs', 'C:\\ProgramData\\Blizzard Entertainment\\Battle.net\\Cache', '%LocalAppData%\\Battle.net\\Cache'] },
        { name: 'Office16', paths: ['%LocalAppData%\\Microsoft\\Office\\16.0\\WebServiceCache\\AllUsers', '%AppData%\\Microsoft\\Office\\Recent'] },
        { name: 'MS Office', paths: ['%LocalAppData%\\Microsoft\\Office\\OTele', 'C:\\Windows\\System32\\config\\systemprofile\\AppData\\Local\\Microsoft\\Office\\OTele', 'C:\\Windows\\SysWOW64\\config\\systemprofile\\AppData\\Local\\Microsoft\\Office\\OTele'] }
    ]
}, {
    id: 'advancedSoftware',
    label: '主要面向高级用户的软件垃圾',
    icon: '🔧',
    items: [
        { name: 'Unistore缓存', paths: ['%LocalAppData%\\Comms\\Unistore\\data\\temp'] },
        { name: 'Xamarin日志', paths: ['%LocalAppData%\\Xamarin\\Logs'] },
        { name: 'MCreator日志', paths: ['%UserProfile%\\.mcreator\\logs'] },
        { name: 'MCreator构建缓存', paths: ['%UserProfile%\\.mcreator\\gradle\\.tmp'] },
        { name: 'NVIDIA计算缓存', paths: ['%AppData%\\NVIDIA\\ComputeCache'] },
        { name: 'FrameViewSDK', paths: ['C:\\ProgramData\\NVIDIA Corporation\\FrameViewSDK'] },
        { name: 'NVDisplay日志', paths: ['C:\\ProgramData\\NVIDIA\\DisplaySessionContainer1.log', 'C:\\ProgramData\\NVIDIA\\DisplaySessionContainer1.log.log_backup1', 'C:\\ProgramData\\NVIDIA\\DisplaySessionContainer2.log', 'C:\\ProgramData\\NVIDIA\\DisplaySessionContainer2.log.log_backup1'] },
        { name: 'MS Visual Studio 安装包', paths: ['C:\\ProgramData\\Microsoft\\VisualStudio\\Packages'] }
    ]
}];

// ----- 工具函数：展开环境变量 -----
function expandPath(path) {
    const env = {
        '%LocalAppData%': 'C:\\Users\\' + getUsername() + '\\AppData\\Local',
        '%LocalAppDataLow%': 'C:\\Users\\' + getUsername() + 'AppData\\LocalLow',
        '%AppData%': 'C:\\Users\\' + getUsername() + '\\AppData\\Roaming',
        '%UserProfile%': 'C:\\Users\\' + getUsername()
    };
    let result = path;
    for (const [key, value] of Object.entries(env)) {
        result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    return result;
}

function getUsername() {
    // 实际使用中可从系统获取，这里返回默认值
    return 'User';
}

// ----- 渲染垃圾列表 -----
function renderTrashList() {
    const container = document.getElementById('cleaningList');
    if (!container) return;

    let totalItems = 0;

    let html = '';

    trashData.forEach(category => {
        const items = category.items;
        totalItems += items.length;

        html += `
            <div class="trash-category">
                <div class="category-header">
                    <span class="col-icon">#</span>
                    <span class="col-name">${category.icon} ${category.label}</span>
                    <span class="col-path">路径</span>
                </div>
                <div class="category-body">
        `;

        items.forEach(item => {
            const pathLines = item.paths.map(p => `<span class="path-line">${expandPath(p)}</span>`).join('');
            html += `
                <div class="trash-item">
                    <span class="item-icon">📄</span>
                    <span class="item-name">${item.name}</span>
                    <span class="item-paths">${pathLines}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // 更新统计
    document.getElementById('totalCount').textContent = totalItems;
    document.getElementById('categoryCount').textContent = trashData.length;
}

// ----- 初始化 -----
document.addEventListener('DOMContentLoaded', function() {
    renderTrashList();
});