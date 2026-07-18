// ============================================================
// cleaning-trash.js - 清理垃圾功能
// ============================================================

// ----- 垃圾数据（根据您提供的源代码整理）-----
const trashData = {
    system: {
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
    },
    game: {
        label: '游戏垃圾',
        icon: '🎮',
        items: [
            { name: 'i18nupdatemod', paths: ['%LocalAppData%\\.i18nupdatemod'] }
        ]
    },
    userSoftware: {
        label: '主要面向用户的软件垃圾',
        icon: '📦',
        items: [
            { name: '齐系列程序缓存', paths: ['C:\\QiAppDatas\\Temps'] },
            { name: 'IE 网页缓存', paths: ['%LocalAppData%\\Microsoft\\Windows\\WebCache', '%LocalAppData%\\Microsoft\\Internet Explorer\\CacheStorage'] },
            { name: 'Edge 视频解码统计信息', paths: ['%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\VideoDecodeStats'] },
            { name: 'Edge 日志', paths: ['%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Asset Store\\assets.db\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Asset Store\\assets.db\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\AutofillStrikeDatabase\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\AutofillStrikeDatabase\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\BudgetDatabase\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\BudgetDatabase\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\ClientCertificates\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\ClientCertificates\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\commerce_subscription_db\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\commerce_subscription_db\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\discounts_db\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\discounts_db\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Download Service\\EntryDB\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Download Service\\EntryDB\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\EdgeCoupons\\coupons_data.db\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\EdgeCoupons\\coupons_data.db\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\EdgePushStorageWithConnectTokenAndKey\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\EdgePushStorageWithConnectTokenAndKey\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\EdgePushStorageWithWinRt\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\EdgePushStorageWithWinRt\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\EntityExtraction\\EntityExtractionAssetStore.db\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\EntityExtraction\\EntityExtractionAssetStore.db\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Extension State\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Extension State\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Feature Engagement Tracker\\AvailabilityDB\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Feature Engagement Tracker\\AvailabilityDB\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Feature Engagement Tracker\\EventDB\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Feature Engagement Tracker\\EventDB\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\File System\\Origins\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\File System\\Origins\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\optimization_guide_hint_cache_store\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\optimization_guide_hint_cache_store\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\parcel_tracking_db\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\parcel_tracking_db\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\PersistentOriginTrials\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\PersistentOriginTrials\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Platform Notifications\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Platform Notifications\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\PriceComparison\\PriceComparisonAssetStore.db\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\PriceComparison\\PriceComparisonAssetStore.db\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Segmentation Platform\\SegmentInfoDB\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Segmentation Platform\\SegmentInfoDB\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Segmentation Platform\\SignalDB\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Segmentation Platform\\SignalDB\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Segmentation Platform\\SignalStorageConfigDB\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Segmentation Platform\\SignalStorageConfigDB\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Service Worker\\Database\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Service Worker\\Database\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Session Storage\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Session Storage\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\shared_proto_db\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\shared_proto_db\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\shared_proto_db\\metadata\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\shared_proto_db\\metadata\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Site Characteristics Database\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Site Characteristics Database\\LOG.old', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Sync Data\\LevelDB\\LOG', '%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Sync Data\\LevelDB\\LOG.old'] },
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
    },
    advancedSoftware: {
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
    }
};

// ----- 状态管理 -----
let scanCompleted = false;
let selectedItems = new Set();

// ----- 工具函数：展开环境变量 -----
function expandPath(path) {
    const env = {
        '%LocalAppData%': 'C:\\Users\\' + getUsername() + '\\AppData\\Local',
        '%LocalAppDataLow%': 'C:\\Users\\' + getUsername() + '\\AppData\\LocalLow',
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
    // 模拟获取用户名，实际使用中可从系统获取
    return 'User';
}

// ----- 渲染垃圾列表 -----
function renderTrashList() {
    const container = document.getElementById('cleaningList');
    if (!container) return;

    let html = '';

    for (const [categoryKey, category] of Object.entries(trashData)) {
        html += `
            <div class="trash-category">
                <div class="category-header">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-label">${category.label}</span>
                    <span class="category-count">${category.items.length} 项</span>
                </div>
                <div class="category-items">
        `;

        category.items.forEach((item, index) => {
            const itemId = `${categoryKey}-${index}`;
            const displayPaths = item.paths.map(p => expandPath(p)).join('<br>');
            html += `
                <div class="trash-item" data-id="${itemId}">
                    <label class="item-checkbox">
                        <input type="checkbox" data-id="${itemId}" ${selectedItems.has(itemId) ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <span class="item-name">${item.name}</span>
                    <span class="item-paths" title="${displayPaths.replace(/<br>/g, '\n')}">
                        ${displayPaths}
                    </span>
                    <span class="item-status">待扫描</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // 绑定复选框事件
    container.querySelectorAll('.trash-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function() {
            const id = this.dataset.id;
            if (this.checked) {
                selectedItems.add(id);
            } else {
                selectedItems.delete(id);
            }
            updateUI();
        });
    });

    updateUI();
}

// ----- 更新UI状态 -----
function updateUI() {
    const cleanBtn = document.getElementById('cleanBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const fileCount = document.getElementById('fileCount');
    const allCheckboxes = document.querySelectorAll('.trash-item input[type="checkbox"]');
    const checkedCount = document.querySelectorAll('.trash-item input[type="checkbox"]:checked').length;

    // 更新清理按钮
    cleanBtn.disabled = checkedCount === 0 || !scanCompleted;

    // 更新全选按钮
    const total = allCheckboxes.length;
    const checked = document.querySelectorAll('.trash-item input[type="checkbox"]:checked').length;
    if (checked === 0) {
        selectAllBtn.textContent = '☑ 全选';
    } else if (checked === total) {
        selectAllBtn.textContent = '☑ 取消全选';
    } else {
        selectAllBtn.textContent = '☑ 部分选中';
    }

    // 更新文件计数
    fileCount.textContent = `共 ${total} 项，已选 ${checked} 项`;
}

// ----- 扫描功能 -----
function scanTrash() {
    const statusEl = document.getElementById('scanStatus');
    const scanBtn = document.getElementById('scanBtn');

    statusEl.textContent = '⏳ 扫描中...';
    scanBtn.disabled = true;

    // 模拟扫描过程
    let progress = 0;
    const totalItems = document.querySelectorAll('.trash-item').length;

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 1;
        if (progress >= totalItems) {
            progress = totalItems;
            clearInterval(interval);
            completeScan();
        }

        // 更新状态显示
        const items = document.querySelectorAll('.trash-item');
        for (let i = 0; i < Math.min(progress, items.length); i++) {
            const statusEl2 = items[i].querySelector('.item-status');
            if (statusEl2) {
                // 随机模拟一些文件存在
                const exists = Math.random() > 0.3;
                statusEl2.textContent = exists ? '✅ 可清理' : '❌ 不存在';
                statusEl2.className = 'item-status ' + (exists ? 'status-exists' : 'status-missing');
            }
        }

        statusEl.textContent = `⏳ 扫描中... ${progress}/${totalItems}`;
    }, 100);

    function completeScan() {
        scanCompleted = true;
        statusEl.textContent = '✅ 扫描完成';
        scanBtn.disabled = false;
        updateUI();

        // 默认全选所有存在的项目
        document.querySelectorAll('.trash-item .item-status.status-exists').forEach(el => {
            const item = el.closest('.trash-item');
            if (item) {
                const cb = item.querySelector('input[type="checkbox"]');
                if (cb) {
                    cb.checked = true;
                    selectedItems.add(cb.dataset.id);
                }
            }
        });
        updateUI();
    }
}

// ----- 清理功能 -----
function cleanTrash() {
    if (!scanCompleted) return;

    const checkedItems = document.querySelectorAll('.trash-item input[type="checkbox"]:checked');
    if (checkedItems.length === 0) return;

    const statusEl = document.getElementById('scanStatus');
    statusEl.textContent = '⏳ 清理中...';

    // 模拟清理过程
    let cleaned = 0;
    const total = checkedItems.length;

    checkedItems.forEach((cb, index) => {
        const item = cb.closest('.trash-item');
        const statusEl2 = item.querySelector('.item-status');
        setTimeout(() => {
            cleaned++;
            statusEl2.textContent = '🗑️ 已清理';
            statusEl2.className = 'item-status status-cleaned';
            cb.disabled = true;
            statusEl.textContent = `⏳ 清理中... ${cleaned}/${total}`;

            if (cleaned === total) {
                statusEl.textContent = '✅ 清理完成！';
                document.getElementById('cleanBtn').disabled = true;
                updateUI();
            }
        }, 300 + index * 200);
    });
}

// ----- 全选/取消全选 -----
function toggleSelectAll() {
    const allCheckboxes = document.querySelectorAll('.trash-item input[type="checkbox"]:not(:disabled)');
    const checked = document.querySelectorAll('.trash-item input[type="checkbox"]:checked').length;
    const total = allCheckboxes.length;

    const shouldCheck = checked < total;

    allCheckboxes.forEach(cb => {
        cb.checked = shouldCheck;
        const id = cb.dataset.id;
        if (shouldCheck) {
            selectedItems.add(id);
        } else {
            selectedItems.delete(id);
        }
    });

    updateUI();
}

// ----- 初始化 -----
document.addEventListener('DOMContentLoaded', function() {
    renderTrashList();

    // 绑定按钮事件
    document.getElementById('scanBtn').addEventListener('click', scanTrash);
    document.getElementById('cleanBtn').addEventListener('click', cleanTrash);
    document.getElementById('selectAllBtn').addEventListener('click', toggleSelectAll);
});