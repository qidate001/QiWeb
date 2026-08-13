// 用一个空数组接收数据
let dishes = [];

const resultEl = document.getElementById('result');
const btnEl = document.getElementById('pick-btn');

// 1. 异步加载 JSON 数据
async function loadData() {
    try {
        // 注意路径：从 js/ 目录往上一级，再进 data/ 目录
        const response = await fetch('./data/dishes.json');
        if (!response.ok) throw new Error('网络响应异常');
        
        dishes = await response.json();
        
        // 数据加载完成后，立刻给用户显示一道菜，避免空白
        pickAndDisplay();
    } catch (error) {
        console.error('数据加载失败:', error);
        resultEl.textContent = '😅 数据加载失败，请刷新重试';
        resultEl.style.color = '#e74c3c';
    }
}

// 2. 核心随机抽取函数
function getRandomDish() {
    if (dishes.length === 0) return '暂无数据';
    const randomIndex = Math.floor(Math.random() * dishes.length);
    return dishes[randomIndex];
}

// 3. 抽取并更新 UI（保留你原来的闪动效果）
function pickAndDisplay() {
    // 闪烁反馈
    resultEl.style.opacity = '0.6';
    resultEl.classList.remove('active');

    // 延迟 200ms 后显示（更有仪式感）
    setTimeout(() => {
        const dish = getRandomDish();
        resultEl.textContent = dish;
        resultEl.style.opacity = '1';
        resultEl.classList.add('active'); 
    }, 200);
}

// 4. 绑定点击事件
btnEl.addEventListener('click', pickAndDisplay);

// 5. 页面启动，先加载数据
loadData();