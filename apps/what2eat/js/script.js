// ===== 全局状态 =====
let allDishes = [];
let filteredDishes = [];
let currentSelection = null; // 当前抽中的菜名

// ===== DOM 元素 =====
const resultEl = document.getElementById('result');
const matchCountEl = document.getElementById('match-count');
const btnEl = document.getElementById('pick-btn');
const resetBtn = document.getElementById('reset-btn');
const avoidWrapper = document.getElementById('avoid-filters');
const cuisineWrapper = document.getElementById('cuisine-filters');

// ===== 1. 加载数据并初始化 =====
async function init() {
    try {
        const response = await fetch('data/dishes.json');
        allDishes = await response.json();
        
        // 提取所有标签和菜系，生成过滤器
        generateFilters();
        // 恢复本地存储的状态
        loadFilterState();
        // 应用过滤规则，刷新显示
        applyFilters();
    } catch (error) {
        console.error('加载失败:', error);
        resultEl.textContent = '😅 数据加载失败，请刷新';
    }
}

// ===== 2. 动态生成筛选标签 =====
function generateFilters() {
    const avoids = new Set();
    const cuisines = new Set();

    allDishes.forEach(dish => {
        cuisines.add(dish.cuisine);
        dish.tags.forEach(tag => avoids.add(tag));
    });

    // 渲染忌口按钮
    avoids.forEach(tag => {
        const btn = createTagBtn(tag, 'avoid');
        avoidWrapper.appendChild(btn);
    });

    // 渲染菜系按钮
    cuisines.forEach(cuisine => {
        const btn = createTagBtn(cuisine, 'cuisine');
        cuisineWrapper.appendChild(btn);
    });
}

// 创建单个标签按钮
function createTagBtn(label, type) {
    const btn = document.createElement('div');
    btn.className = 'tag-btn';
    btn.dataset.label = label;
    btn.dataset.type = type;
    btn.textContent = label;
    
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        saveFilterState();
        applyFilters();
    });
    return btn;
}

// ===== 3. 核心过滤算法 =====
function applyFilters() {
    // 获取当前选中的忌口和菜系
    const selectedAvoids = getSelectedLabels('avoid');
    const selectedCuisines = getSelectedLabels('cuisine');

    // 开始过滤
    filteredDishes = allDishes.filter(dish => {
        // 【1. 忌口筛选】：如果菜里有选中的忌口标签，直接淘汰
        for (let avoid of selectedAvoids) {
            if (dish.tags.includes(avoid)) return false;
        }
        // 【2. 菜系筛选】：如果选了菜系，必须匹配；如果没选任何菜系，不限制
        if (selectedCuisines.length > 0) {
            if (!selectedCuisines.includes(dish.cuisine)) return false;
        }
        return true;
    });

    // 更新列表数量提示
    if (filteredDishes.length === 0) {
        matchCountEl.textContent = '😭 当前没有符合条件的菜品，请放宽筛选';
        resultEl.className = 'result-card empty';
        resultEl.textContent = '放宽条件试试';
        btnEl.disabled = true;
    } else {
        matchCountEl.textContent = `找到 ${filteredDishes.length} 道菜`;
        btnEl.disabled = false;
        // 如果原来抽中的菜不在现在的结果里，自动重抽一个
        if (!currentSelection || !filteredDishes.some(d => d.name === currentSelection)) {
            pickAndDisplay();
        } else {
            resultEl.textContent = currentSelection;
            resultEl.className = 'result-card active';
        }
    }
}

// 获取当前所有激活标签的文本
function getSelectedLabels(type) {
    const btns = document.querySelectorAll(`.tag-btn[data-type="${type}"]`);
    return Array.from(btns).filter(btn => btn.classList.contains('active')).map(btn => btn.dataset.label);
}

// ===== 4. 随机抽取逻辑 =====
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

// ===== 5. 持久化存储 =====
function saveFilterState() {
    const activeTags = getSelectedLabels('avoid').concat(getSelectedLabels('cuisine'));
    localStorage.setItem('what2eat_filters', JSON.stringify(activeTags));
}

function loadFilterState() {
    const saved = localStorage.getItem('what2eat_filters');
    if (!saved) return;
    const activeTags = JSON.parse(saved);
    
    document.querySelectorAll('.tag-btn').forEach(btn => {
        if (activeTags.includes(btn.dataset.label)) {
            btn.classList.add('active');
        }
    });
}

// ===== 6. 绑定事件 =====
btnEl.addEventListener('click', pickAndDisplay);
resetBtn.addEventListener('click', () => {
    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
    saveFilterState();
    applyFilters();
});

// 启动应用
init();