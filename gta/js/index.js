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

    // 更新页面标题
    document.title = vc.title;
    document.getElementById('pageTitle').textContent = vc.title;
    document.getElementById('siteTitle').textContent = vc.subtitle;

    // 更新导航链接
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

    // 加载统计数据
    await loadStats(version);

    // 加载分类和推荐
    await loadCategoriesAndRecommend(version);
}

// ============================================================
//  加载统计数据
// ============================================================
async function loadStats(version) {
    try {
        // 读取 index.json
        const response = await fetch(`data/${version}/index.json`);
        if (!response.ok) throw new Error('加载数据失败');

        const vehicles = await response.json();

        // 总载具数
        const totalVehicles = vehicles.length;

        // 变体总数：累加每个车辆的 variantsCount（如果不存在则回退为0）
        const totalVariants = vehicles.reduce((sum, v) => sum + (v.variantsCount || 0), 0);

        // 最后更新日期：取所有车辆中最大的 update_date
        let lastDate = '';
        vehicles.forEach(v => {
            if (v.update_date && (!lastDate || v.update_date > lastDate)) {
                lastDate = v.update_date;
            }
        });

        document.getElementById('totalVehicles').textContent = totalVehicles;
        document.getElementById('totalVariants').textContent = totalVariants;
        document.getElementById('lastUpdate').textContent = lastDate || '未知';

    } catch (error) {
        console.error('加载统计信息失败:', error);
        document.getElementById('totalVehicles').textContent = '加载失败';
        document.getElementById('totalVariants').textContent = '加载失败';
        document.getElementById('lastUpdate').textContent = '加载失败';
    }
}

// ============================================================
//  加载分类和推荐
// ============================================================
async function loadCategoriesAndRecommend(version) {
    try {
        const response = await fetch(`data/${version}/index.json`);
        if (!response.ok) throw new Error('加载索引失败');

        const vehicles = await response.json();

        // 提取分类
        const categories = new Set();
        vehicles.forEach(v => {
            if (v.category) categories.add(v.category);
        });

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

        // 推荐载具
        const recommendContainer = document.getElementById('recommendLinks');
        if (recommendContainer) {
            recommendContainer.innerHTML = '';
            const recommend = vehicles
                .filter(v => v.coverImage)
                .slice(0, 3);

            if (recommend.length === 0) {
                const fallback = vehicles.slice(0, 3);
                fallback.forEach(v => {
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

    } catch (error) {
        console.warn('加载分类/推荐失败:', error);
    }
}

// ============================================================
//  启动
// ============================================================
document.addEventListener('DOMContentLoaded', initPage);