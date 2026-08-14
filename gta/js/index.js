// ============================================================
//  工具函数：获取当前版本
// ============================================================
function getVersion() {
    const params = new URLSearchParams(window.location.search);
    return params.get('version') || 'gta5';
}

// ============================================================
//  加载配置
// ============================================================
async function loadConfig() {
    try {
        const response = await fetch('data/config.json');
        if (!response.ok) throw new Error('无法加载配置文件');
        return await response.json();
    } catch (error) {
        console.warn('加载配置失败，使用默认配置:', error);
        return {
            default: 'gta5',
            versions: {
                gta5: {
                    title: 'GTA5 故事模式 稀有载具收集',
                    subtitle: 'GTA5 故事模式 稀有载具收集',
                    navLabel: 'GTA5首页',
                    dataPath: 'data/gta5/'
                },
                gta5ol: {
                    title: 'GTA5 Online 稀有载具收集',
                    subtitle: 'GTA5 Online 稀有载具收集',
                    navLabel: 'GTA5OL首页',
                    dataPath: 'data/gta5ol/'
                }
            }
        };
    }
}

// ============================================================
//  加载车辆索引数据
// ============================================================
async function loadVehicleIndex(version) {
    try {
        const response = await fetch(`data/${version}/index.json`);
        if (!response.ok) throw new Error('加载数据失败');
        return await response.json();
    } catch (error) {
        console.warn('加载车辆索引失败:', error);
        return [];
    }
}

// ============================================================
//  加载任务角色映射配置文件
// ============================================================
async function loadTaskRoles(version) {
    try {
        const response = await fetch(`data/${version}/task-roles.json`);
        if (!response.ok) throw new Error('任务角色配置不存在');
        return await response.json();
    } catch (error) {
        console.warn('加载任务角色配置失败，将使用默认样式:', error);
        return {}; // 失败时返回空对象，不影响主功能
    }
}

// ============================================================
//  渲染快速开始区域
// ============================================================
function renderQuickStart(version, vehicles, taskRoles) {
    const container = document.querySelector('.quick-links');
    if (!container) return;

    // 清空原有内容
    container.innerHTML = '';

    if (version === 'gta5') {
        // ===== GTA5 故事模式：上下两行，主线内部三列 =====
        const mainCategories = [];
        const sideCategories = [];

        // 遍历所有载具，提取分类并按前缀归类
        vehicles.forEach(v => {
            if (v.category) {
                if (v.category.startsWith('主线')) {
                    mainCategories.push(v.category);
                } else if (v.category.startsWith('支线')) {
                    sideCategories.push(v.category);
                }
            }
        });

        // 去重
        const uniqueMain = [...new Set(mainCategories)];
        const uniqueSide = [...new Set(sideCategories)];

        let html = '<div class="gta5-story-grid">';

        // 1. 生成【主线任务】大卡片（内部三列，带角色标识）
        if (uniqueMain.length > 0) {
            html += `
                <div class="story-module-card main-module">
                    <div class="module-header">
                        <span class="module-icon">🎯</span>
                        <h3>主线任务</h3>
                        <span class="module-count">${uniqueMain.length} 个分类</span>
                    </div>
                    <div class="module-list grid-4">
                        ${uniqueMain.map(cat => {
                            const displayName = cat.replace(/^主线[：:]/, '');
                            // 👇 从配置文件中读取角色，读取不到则 fallback 为 default
                            const role = taskRoles[displayName] || 'default';
                            return `<a href="vehicles.html?category=${encodeURIComponent(cat)}&version=gta5" class="task-link role-${role}">${displayName}</a>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // 2. 生成【陌生人与怪胎】大卡片（内部两列，无角色标识）
        if (uniqueSide.length > 0) {
            html += `
                <div class="story-module-card side-module">
                    <div class="module-header">
                        <span class="module-icon">👥</span>
                        <h3>陌生人与怪胎</h3>
                        <span class="module-count">${uniqueSide.length} 个分类</span>
                    </div>
                    <div class="module-list grid-3">
                        ${uniqueSide.map(cat => {
                            const displayName = cat.replace(/^支线[：:]/, '');
                            return `<a href="vehicles.html?category=${encodeURIComponent(cat)}&version=gta5" class="task-link">${displayName}</a>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html || '<p style="text-align:center; color:#94a3b8;">暂无分类数据</p>';

    } else {
        // ===== GTA5 Online：保持原来的三块结构 =====
        container.innerHTML = `
            <div class="quick-item">
                <h3>按分类浏览</h3>
                <ul id="categoryLinks"></ul>
            </div>
            <div class="quick-item">
                <h3>推荐载具</h3>
                <ul id="recommendLinks"></ul>
            </div>
            <div class="quick-item">
                <h3>基础知识</h3>
                <ul>
                    <li><a href="常识/市中心改车王.html">市中心改车王</a></li>
                    <li><a href="#">卡视野技巧</a></li>
                    <li><a href="#">种子车概念</a></li>
                </ul>
            </div>
        `;

        // 动态填充分类和推荐
        const categories = new Set();
        vehicles.forEach(v => { if (v.category) categories.add(v.category); });
        const categoryContainer = document.getElementById('categoryLinks');
        if (categoryContainer) {
            categoryContainer.innerHTML = '';
            categories.forEach(cat => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `vehicles.html?category=${encodeURIComponent(cat)}&version=${version}`;
                a.textContent = cat;
                li.appendChild(a);
                categoryContainer.appendChild(li);
            });
        }
        const recommendContainer = document.getElementById('recommendLinks');
        if (recommendContainer) {
            recommendContainer.innerHTML = '';
            const recommend = vehicles.filter(v => v.coverImage).slice(0, 3);
            if (recommend.length === 0) {
                vehicles.slice(0, 3).forEach(v => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `vehicle-detail.html?id=${v.id}&version=${version}`;
                    a.textContent = v.name;
                    li.appendChild(a);
                    recommendContainer.appendChild(li);
                });
            } else {
                recommend.forEach(v => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `vehicle-detail.html?id=${v.id}&version=${version}`;
                    a.textContent = v.name;
                    li.appendChild(a);
                    recommendContainer.appendChild(li);
                });
            }
        }
    }
}

// ============================================================
//  页面初始化
// ============================================================
async function initPage() {
    const version = getVersion();
    const config = await loadConfig();
    const vc = config.versions[version];

    if (!vc) {
        console.error('未知版本:', version);
        return;
    }

    // 更新页面标题、导航等
    document.title = vc.title;
    document.getElementById('pageTitle').textContent = vc.title;
    document.getElementById('siteTitle').textContent = vc.subtitle;

    const versionHomeLink = document.querySelector('nav ul li a[href*="index.html"]');
    if (versionHomeLink) {
        versionHomeLink.textContent = vc.navLabel;
        versionHomeLink.href = `./index.html?version=${version}`;
    }

    const vehiclesLink = document.getElementById('vehiclesLink');
    if (vehiclesLink) {
        vehiclesLink.href = `./vehicles.html?version=${version}`;
    }

    const enterLink = document.getElementById('enterVehiclesLink');
    if (enterLink) {
        enterLink.href = `vehicles.html?version=${version}`;
    }

    // 高亮当前版本按钮
    document.querySelectorAll('.version-btn').forEach(btn => {
        btn.style.background = btn.dataset.version === version ? '#8b5cf6' : '#2d2d2d';
        btn.style.color = btn.dataset.version === version ? '#fff' : '#aaa';
    });

    // 1. 加载车辆数据
    const vehicles = await loadVehicleIndex(version);

    // 2. 加载角色映射配置
    const taskRoles = await loadTaskRoles(version);

    // 3. 根据版本渲染快速开始区域（同时传入角色配置）
    renderQuickStart(version, vehicles, taskRoles);

    // 4. 更新统计信息
    const totalVehicles = vehicles.length;
    const totalVariants = vehicles.reduce((sum, v) => sum + (v.variantsCount || 0), 0);
    let lastDate = '';
    vehicles.forEach(v => {
        if (v.update_date && (!lastDate || v.update_date > lastDate)) {
            lastDate = v.update_date;
        }
    });

    document.getElementById('totalVehicles').textContent = totalVehicles;
    document.getElementById('totalVariants').textContent = totalVariants;
    document.getElementById('lastUpdate').textContent = lastDate || '未知';
}

// ============================================================
//  启动
// ============================================================
document.addEventListener('DOMContentLoaded', initPage);