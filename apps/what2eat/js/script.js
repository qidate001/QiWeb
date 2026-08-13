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

// ===== 2. 核心交互逻辑 =====
function setupInteractions() {
    // 互斥清理函数（用于肉类偏好和嘌呤关注）
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
        // 左键点击
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            let state = parseInt(btn.dataset.state || '0');
            const type = btn.dataset.type;

            // --- 互斥清理逻辑（添加了嘌呤） ---
            if (type === 'meat-base') clearExclusiveGroup('meat-base-filters', btn);
            if (type === 'meat-exclude') clearExclusiveGroup('meat-exclude-filters', btn);
            if (type === 'purine') clearExclusiveGroup('purine-filters', btn); 

            // --- 状态切换 ---
            if (type === 'avoid') {
                if (state === 1 || state === 2) btn.dataset.state = '0';
                else btn.dataset.state = '1';
            } else {
                if (state === 1) btn.dataset.state = '0';
                else btn.dataset.state = '1';
            }

            updateBtnClass(btn);
            saveAllStates();
            applyFilters();
        });

        // 右键逻辑：仅用于【忌口排除】
        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (btn.dataset.type !== 'avoid') return; 

            let state = parseInt(btn.dataset.state || '0');
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

// ===== 3. 样式更新 =====
function updateBtnClass(btn) {
    const state = parseInt(btn.dataset.state || '0');
    btn.classList.remove('active', 'state-include', 'state-exclude');

    if (btn.dataset.type === 'avoid') {
        if (state === 1) btn.classList.add('state-include');
        else if (state === 2) btn.classList.add('state-exclude');
    } else {
        if (state === 1) btn.classList.add('active');
    }
}

// ===== 4. 核心过滤算法（补上了嘌呤过滤） =====
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
    const selectedPurines = getSelectedLabels('purine'); // 获取嘌呤设置

    filteredDishes = allDishes.filter(dish => {
        // 1. 强制包含与排除
        for (let include of includeTags) {
            if (!dish.tags.includes(include)) return false;
        }
        for (let exclude of excludeTags) {
            if (dish.tags.includes(exclude)) return false;
        }
        // 2. 菜系过滤
        if (selectedCuisines.length > 0) {
            if (!selectedCuisines.includes(dish.cuisine)) return false;
        }
        // 3. 肉类基础过滤
        if (meatBase.length > 0) {
            if (meatBase.includes('素食') && dish.meat_type !== '无') return false;
        }
        // 4. 肉食限制过滤
        if (meatExcludes.length > 0) {
            const exc = meatExcludes[0];
            if (exc === '不吃红肉' && dish.meat_type === '红肉') return false;
            if (exc === '不吃白肉' && dish.meat_type === '白肉') return false;
            if (exc === '不吃海鲜' && dish.meat_type === '海鲜') return false;
        }
        // 5. 🧬 嘌呤过滤（补上了！）
        if (selectedPurines.length > 0) {
            const purinePref = selectedPurines[0];
            if (purinePref === '忌高嘌呤' && dish.purine_level === '高') return false;
        }

        return true;
    });

    // 更新 UI 状态
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

// ===== 5. 随机抽取 =====
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

// ===== 6. 持久化存储 =====
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

// ===== 7. 重置与启动 =====
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