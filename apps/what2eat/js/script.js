// 菜品数据（你可以随时在这里增删改）
const dishes = [
    "红烧肉", "宫保鸡丁", "鱼香肉丝", "麻婆豆腐", "番茄炒蛋",
    "青椒肉丝", "回锅肉", "酸辣土豆丝", "糖醋排骨", "水煮鱼",
    "干锅牛蛙", "小炒黄牛肉", "口水鸡", "蒜蓉西兰花", "清蒸鲈鱼"
];

// 获取 DOM 元素
const resultEl = document.getElementById('result');
const btnEl = document.getElementById('pick-btn');

// 核心随机函数
function getRandomDish() {
    const randomIndex = Math.floor(Math.random() * dishes.length);
    return dishes[randomIndex];
}

// 抽取并更新 UI 的函数
function pickAndDisplay() {
    // 1. 闪动反馈（透明度变浅）
    resultEl.style.opacity = '0.6';
    resultEl.classList.remove('active');

    // 2. 延迟 200ms 后显示结果（更有仪式感）
    setTimeout(() => {
        const dish = getRandomDish();
        resultEl.textContent = dish;
        resultEl.style.opacity = '1';
        resultEl.classList.add('active'); // 变绿放大
    }, 200);
}

// 绑定点击事件
btnEl.addEventListener('click', pickAndDisplay);

// 页面加载完成时，先帮用户抽一道菜
window.addEventListener('DOMContentLoaded', () => {
    resultEl.textContent = getRandomDish();
    resultEl.classList.add('active');
});