document.addEventListener('DOMContentLoaded', function () {
    const versionBadge = document.getElementById('versionBadge');
    if (versionBadge && typeof APP_CONFIG !== 'undefined') {
        versionBadge.textContent = APP_CONFIG.version;
    }

    // ============================================================
    // 题库加载功能
    // ============================================================

    // 题库文件列表（按用户提供的文件列表）
    const BANK_FILES = [
        '0.json',
        '人格障碍缩写.json',
        '八卦符号.json',
        '十二时辰.json',
        '十日终焉.json',
        '古代诗人称号.json',
        '我的世界：版本.json',
        '星际战甲.json',
        '星际战甲：玄骸属性.json',
        '星际战甲：虚空.json',
        '永恒论.json',
        '洪荒.json'
    ];

    const BASE_PATH = './data/sqaa/';
    let loadedBanks = {}; // { fileName: { name, questions, size, isTheme } }
    let totalQuestions = 0;

    // DOM 引用
    const loadBtn = document.getElementById('loadBtn');
    const loadStatus = document.getElementById('loadStatus');
    const loadProgress = document.getElementById('loadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const loadResult = document.getElementById('loadResult');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');

    const bankGrid = document.getElementById('bankGrid');
    const bankPlaceholder = document.getElementById('bankPlaceholder');
    const bankFooter = document.getElementById('bankFooter');
    const bankCount = document.getElementById('bankCount');
    const bankTotal = document.getElementById('bankTotal');

    const previewBox = document.getElementById('previewBox');
    const previewTitle = document.getElementById('previewTitle');
    const previewBody = document.getElementById('previewBody');
    const previewClose = document.getElementById('previewClose');

    // 加载题库
    async function loadAllBanks() {
        const startTime = Date.now();

        // 重置状态
        loadedBanks = {};
        totalQuestions = 0;
        loadBtn.disabled = true;
        loadBtn.style.opacity = '0.6';
        loadStatus.textContent = '⏳ 加载中...';
        loadResult.style.display = 'none';

        // 显示进度条
        loadProgress.style.display = 'block';
        const totalFiles = BANK_FILES.length;
        let completed = 0;
        let failedFiles = [];

        for (let i = 0; i < totalFiles; i++) {
            const fileName = BANK_FILES[i];
            try {
                const response = await fetch(BASE_PATH + fileName);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();

                // 判断是否为主题库（0.json）
                const isTheme = fileName === '0.json';

                // 存储题库信息
                loadedBanks[fileName] = {
                    name: fileName,
                    questions: data,
                    count: data.length,
                    size: new Blob([JSON.stringify(data)]).size,
                    isTheme: isTheme
                };

                totalQuestions += data.length;
                completed++;

            } catch (err) {
                console.warn(`加载 ${fileName} 失败:`, err);
                failedFiles.push(fileName);
                completed++;
            }

            // 更新进度
            const progress = Math.round((completed / totalFiles) * 100);
            progressFill.style.width = progress + '%';
            progressText.textContent = `${completed} / ${totalFiles}`;

            // 给UI一点喘息时间
            await new Promise(r => setTimeout(r, 50));
        }

        // 加载完成
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        loadBtn.disabled = false;
        loadBtn.style.opacity = '1';
        loadProgress.style.display = 'none';

        if (failedFiles.length === totalFiles) {
            // 全部失败
            loadStatus.textContent = '❌ 加载失败';
            resultIcon.textContent = '❌';
            resultText.textContent = `无法连接到题库服务器，请检查网络或路径`;
            loadResult.style.display = 'block';
            return;
        }

        // 显示加载结果
        loadStatus.textContent = `✅ 加载完成 (${elapsed}s)`;
        resultIcon.textContent = '✅';
        const successCount = totalFiles - failedFiles.length;
        const failMsg = failedFiles.length > 0 ? `，${failedFiles.length} 个失败` : '';
        resultText.textContent = `成功加载 ${successCount} 个题库${failMsg}，共 ${totalQuestions} 道题目`;
        loadResult.style.display = 'block';

        // 渲染题库列表
        renderBankList();

        // 更新统计
        bankCount.textContent = `${successCount} 个题库`;
        bankTotal.textContent = `📂 总题目：${totalQuestions} 道`;
        bankFooter.style.display = 'flex';
    }

    // 渲染题库列表
    function renderBankList() {
        const entries = Object.entries(loadedBanks);

        if (entries.length === 0) {
            bankPlaceholder.style.display = 'block';
            bankGrid.style.display = 'none';
            return;
        }

        bankPlaceholder.style.display = 'none';
        bankGrid.style.display = 'grid';
        bankGrid.innerHTML = '';

        // 按是否主题库排序（主题库排最前）
        entries.sort((a, b) => {
            if (a[1].isTheme && !b[1].isTheme) return -1;
            if (!a[1].isTheme && b[1].isTheme) return 1;
            return a[0].localeCompare(b[0]);
        });

        for (const [fileName, info] of entries) {
            const item = document.createElement('div');
            item.className = `bank-item ${info.isTheme ? 'featured' : ''}`;

            const icon = info.isTheme ? '⭐' : '📄';
            const typeLabel = info.isTheme ? '主题库 · 无限次' : '次题库 · 一次';
            const sizeKB = (info.size / 1024).toFixed(1);

            item.innerHTML = `
                <span class="bank-icon">${icon}</span>
                <span class="bank-name">${fileName}</span>
                <span class="bank-size">${sizeKB} KB</span>
                <span class="bank-type ${info.isTheme ? 'theme' : 'sub'}">${typeLabel}</span>
                <span class="bank-count">${info.count} 题</span>
                <button class="bank-preview-btn" data-file="${fileName}">预览</button>
            `;

            bankGrid.appendChild(item);
        }

        // 绑定预览按钮事件
        document.querySelectorAll('.bank-preview-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const fileName = this.dataset.file;
                openPreview(fileName);
            });
        });
    }

    // 打开预览
    function openPreview(fileName) {
        const info = loadedBanks[fileName];
        if (!info) return;

        previewTitle.textContent = `📖 ${fileName}（${info.count} 道题）`;
        previewBody.innerHTML = '';

        info.questions.forEach((q, idx) => {
            const div = document.createElement('div');
            div.className = 'preview-question';

            const correctLabel = ['A', 'B', 'C', 'D'][q.CorrectOptions - 1] || '?';

            div.innerHTML = `
                <div class="preview-q-header">
                    <span class="preview-q-num">#${idx + 1}</span>
                    <span class="preview-q-text">${q.Text}</span>
                </div>
                <div class="preview-q-options">
                    <span>A. ${q.OptionA || '—'}</span>
                    <span>B. ${q.OptionB || '—'}</span>
                    <span>C. ${q.OptionC || '—'}</span>
                    <span>D. ${q.OptionD || '—'}</span>
                </div>
                <div class="preview-q-answer">
                    ✅ 正确答案：<strong>${correctLabel}</strong>
                    ${q.Explanation ? `<span class="preview-q-explain">💬 ${q.Explanation}</span>` : ''}
                </div>
            `;

            previewBody.appendChild(div);
        });

        previewBox.style.display = 'block';
        previewBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 关闭预览
    previewClose.addEventListener('click', function () {
        previewBox.style.display = 'none';
    });

    // 点击预览外部关闭（点击背景）
    previewBox.addEventListener('click', function (e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // 绑定加载按钮
    loadBtn.addEventListener('click', loadAllBanks);

    // 如果有加载失败的，显示提示
    console.log('🧩 奇葩问答已准备就绪');
});