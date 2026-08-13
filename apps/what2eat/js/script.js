// ===== 全局状态 =====
let allDishes = [];
let filteredDishes = [];
let currentSelection = null;

// ===== DOM 元素 =====
const resultEl = document.getElementById('result');
const matchCountEl = document.getElementById('match-count');
const btnEl = document.getElementById('pick-btn');
const resetBtn = document.getElementById('reset-btn');

// ===== 1. 初始化加载数据 =====
async function init() {
    try {
        const apiUrl = 'https://what2eat.qidate001.workers.dev/api/dishes';
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            allDishes = await response.json();
            console.log('✅ 已成功从 Cloudflare D1 获取数据！');
        } else {
            throw new Error('API 未响应');
        }
    } catch (error) {
        console.warn('⚠️ 云端 API 加载失败，降级读取本地 data/dishes.json');
        const localResponse = await fetch('data/dishes.json');
        allDishes = await localResponse.json();
        console.log('✅ 已加载本地 JSON 数据');
    }

    generateFilters();
    loadAllStates();
    applyFilters();
}

function generateFilters() {
    const avoids = new Set();
    const cuisines = new Set();

    allDishes.forEach(dish => {
        cuisines.add(dish.cuisine);
        let tags = dish.tags;
        if (typeof tags === 'string') {
            try { tags = JSON.parse(tags); } catch (e) { tags = []; }
        }
        tags.forEach(tag => avoids.add(tag));
    });

    avoids.forEach(tag => {
        const btn = createTagBtn(tag, 'avoid');
        document.getElementById('avoid-filters').appendChild(btn);
    });

    cuisines.forEach(cuisine => {
        const btn = createTagBtn(cuisine, 'cuisine');
        document.getElementById('cuisine-filters').appendChild(btn);
    });

    setupInteractions();
}

function createTagBtn(label, type) {
    const btn = document.createElement('div');
    btn.className = 'tag-btn';
    btn.dataset.label = label;
    btn.dataset.type = type;
    btn.dataset.state = '0'; 
    btn.textContent = label;
    return btn;
}

// ===== 2. 核心交互逻辑 (重点修改了左右键逻辑) =====
function setupInteractions() {
    // 互斥清理函数
    function clearExclusiveGroup(wrapperId, exceptBtn) {
        const wrapper = document.getElementById(wrapperId);
        wrapper.querySelectorAll('.tag-btn').forEach(btn => {
            if (btn !== exceptBtn) {
                btn.dataset.state = '0';
                updateBtnClass(btn);
            }
        });
    }

    document.querySelectorAll('.tag-btn').forEach(btn => {
        // 【修改点 1】左键逻辑：只切换【包含】和【默认】
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            let state = parseInt(btn.dataset.state || '0');

            const type = btn.dataset.type;
            if (type === 'meat-base') clearExclusiveGroup('meat-base-filters', btn);
            if (type === 'meat-exclude') clearExclusiveGroup('meat-exclude-filters', btn);
            if (type === 'cuisine') clearExclusiveGroup('cuisine-filters', btn);

            // 左键点击：只有两种结果。
            // 如果是 1(包含) 或 2(排除)，左键一律归零(恢复默认)
            // 如果是 0(默认)，左键变为 1(包含)
            if (btn.dataset.type === 'avoid') {
                if (state === 1 || state === 2) {
                    btn.dataset.state = '0';
                } else {
                    btn.dataset.state = '1';
                }
            } else {
                // 其他互斥分组依然保持 0<->1 切换
                if (state === 1) btn.dataset.state = '0';
                else btn.dataset.state = '1';
            }

            updateBtnClass(btn);
            saveAllStates();
            applyFilters();
        });

        // 【修改点 2】右键逻辑：只切换【排除】和【默认】
        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (btn.dataset.type !== 'avoid') return; 

            let state = parseInt(btn.dataset.state || '0');

            // 右键点击：只有两种结果。
            // 如果是 1(包含) 或 2(排除)，右键一律归零(恢复默认)
            // 如果是 0(默认)，右键变为 2(排除)
            if (state === 1 || state === 2) {
                btn.dataset.state = '0';
            } else {
                btn.dataset.state = '2';
            }

            updateBtnClass(btn);
            saveAllStates();
            applyFilters();
        });
    });
}

// 根据状态更新样式
function updateBtnClass(btn) {
    const state = parseInt(btn.dataset.state || '0');
    btn.classList.remove('active', 'state-include', 'state-exclude');
    if (state === 1) btn.classList.add('state-include'); // 包含 (绿)
    if (state === 2) btn.classList.add('state-exclude'); // 排除 (红)
    // 兼容旧版单纯的 active (用于非 avoid 标签的互斥选中)
    if (state === 1 && btn.dataset.type !== 'avoid') {
        btn.classList.add('active');
    }
}

// ===== 3. 核心过滤算法 =====
function applyFilters() {
    const includeTags = [];
    const excludeTags = [];
    document.querySelectorAll('#avoid-filters .tag-btn').forEach(btn => {
        const state = parseInt(btn.dataset.state || '0');
        if (state === 1) includeTags.push(btn.dataset.label);
        else if (state === 2) excludeTags.push(btn.dataset.label);
    });

    const meatBase = getSelectedLabels('meat-base');
    const meatExcludes = getSelectedLabels('meat-exclude');
    const selectedCuisines = getSelectedLabels('cuisine');

    filteredDishes = allDishes.filter(dish => {
        for (let include of includeTags) {
            if (!dish.tags.includes(include)) return false;
        }
        for (let exclude of excludeTags) {
            if (dish.tags.includes(exclude)) return false;
        }
        if (selectedCuisines.length > 0) {
            if (!selectedCuisines.includes(dish.cuisine)) return false;
        }
        if (meatBase.length > 0) {
            if (meatBase.includes('素食') && dish.meat_type !== '无') return false;
        }
        if (meatExcludes.length > 0) {
            const exc = meatExcludes[0];
            if (exc === '不吃红肉' && dish.meat_type === '红肉') return false;
            if (exc === '不吃白肉' && dish.meat_type === '白肉') return false;
            if (exc === '不吃海鲜' && dish.meat_type === '海鲜') return false;
        }
        return true;
    });

    if (filteredDishes.length === 0) {
        matchCountEl.textContent = '😭 没有符合条件的菜品，放宽筛选';
        resultEl.className = 'result-card empty';
        resultEl.textContent = '放宽条件试试';
        btnEl.disabled = true;
    } else {
        matchCountEl.textContent = `找到 ${filteredDishes.length} 道菜`;
        btnEl.disabled = false;
        if (!currentSelection || !filteredDishes.some(d => d.name === currentSelection)) {
            pickAndDisplay();
        } else {
            resultEl.textContent = currentSelection;
            resultEl.className = 'result-card active';
        }
    }
}

function getSelectedLabels(type) {
    const btns = document.querySelectorAll(`.tag-btn[data-type="${type}"]`);
    return Array.from(btns).filter(btn => parseInt(btn.dataset.state || '0') === 1).map(btn => btn.dataset.label);
}

function getRandomDish() {
    if (filteredDishes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredDishes.length);
    return filteredDishes[randomIndex];
}

function pickAndDisplay() {
    if (btnEl.disabled) return;
    resultEl.style.opacity = '0.6';
    resultEl.classList.remove('active');
    setTimeout(() => {
        const dish = getRandomDish();
        if (dish) {
            currentSelection = dish.name;
            resultEl.textContent = dish.name;
            resultEl.style.opacity = '1';
            resultEl.className = 'result-card active';
        }
    }, 200);
}

// ===== 4. 持久化存储 =====
function saveAllStates() {
    const allTags = document.querySelectorAll('.tag-btn');
    const states = Array.from(allTags).map(btn => ({
        label: btn.dataset.label,
        type: btn.dataset.type,
        state: parseInt(btn.dataset.state || '0')
    }));
    localStorage.setItem('what2eat_filters_v2', JSON.stringify(states));
}

function loadAllStates() {
    const saved = localStorage.getItem('what2eat_filters_v2');
    if (!saved) return;
    const savedStates = JSON.parse(saved);
    savedStates.forEach(item => {
        const btn = document.querySelector(`.tag-btn[data-type="${item.type}"][data-label="${item.label}"]`);
        if (btn) {
            btn.dataset.state = item.state;
            updateBtnClass(btn);
        }
    });
}

// ===== 5. 重置与绑定 =====
resetBtn.addEventListener('click', () => {
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.dataset.state = '0';
        updateBtnClass(btn);
    });
    const defaultBtn = document.querySelector('.tag-btn[data-label="无偏好"]');
    if (defaultBtn) {
        defaultBtn.dataset.state = '1';
        updateBtnClass(defaultBtn);
    }
    saveAllStates();
    applyFilters();
});

btnEl.addEventListener('click', pickAndDisplay);
init();