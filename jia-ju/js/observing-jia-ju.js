// ================================================================
//  1. 观测数据池（共 36 条，保证内容丰富）
// ================================================================
const OBSERVATIONS = [
    "加橘正四仰八叉地躺在沙发上，肚皮朝上，睡得像个橘色的小太阳。",
    "加橘蹲在窗台上，用尾巴轻轻敲击玻璃，仿佛在敲摩斯密码。",
    "加橘一头扎进纸箱里，只露出一截橘色的尾巴尖，像一团毛线球。",
    "加橘在键盘上走来走去，踩出了一串神秘的字符，仿佛在写诗。",
    "加橘对着窗外的飞鸟发出「咕噜咕噜」的感叹，像是在点评。",
    "加橘把脸埋进你的咖啡杯里，闻了闻，然后一脸嫌弃地走开。",
    "加橘在猫抓板上卖力地磨爪子，抓得木屑纷飞，十分投入。",
    "加橘蜷在路由器上，像一团橘色的暖宝宝，散发着 warmth。",
    "加橘用头蹭着你的手，发出呼噜呼噜的声音，要求摸摸。",
    "加橘在阳台的花盆边沿上走平衡木，像一位杂技演员。",
    "加橘把毛线球推到了柜子底下，然后趴在地上用爪子去掏。",
    "加橘站在书架最高层，俯视整个客厅，像一位君王巡视领地。",
    "加橘在厨房里对着空碗喵喵叫，控诉没有猫粮，十分委屈。",
    "加橘钻进被窝里，只露出一个橘色的圆脑袋，像个小馒头。",
    "加橘在落地窗前伸了个大大的懒腰，然后打了个哈欠。",
    "加橘用爪子扒拉你的手机，好像在帮你解锁，但其实是捣乱。",
    "加橘在角落里盯着飞蛾，脖子跟着转来转去，像在看球赛。",
    "加橘躺在你的衣服堆里，把卫衣帽子当成了猫窝，十分舒适。",
    "加橘在跑步机上慢悠悠地散步，像在走T台，步伐优雅。",
    "加橘蹲在门口，用尾巴扫过门缝，似乎在探测什么神秘信号。",
    "加橘在猫爬架的顶端打盹，阳光洒在橘色的毛发上，闪闪发光。",
    "加橘用爪子蘸了一下水杯里的水，然后舔了舔爪子，品味人生。",
    "加橘在客厅里狂奔，像一团橘色的闪电，活力四射。",
    "加橘趴在你的膝盖上，用爪子轻轻按你的手，像是在按摩。",
    "加橘在窗帘后面露出半个身子，偷偷观察你的一举一动。",
    "加橘把猫粮碗里的粮一粒粒叼出来，摆成奇怪的几何图形。",
    "加橘在镜子前盯着自己，歪着头看了很久，陷入沉思。",
    "加橘跳到冰箱顶上，居高临下地看着你，带着一丝傲娇。",
    "加橘在暖气片旁边蜷成一团，像一块烤得恰到好处的吐司。",
    "加橘用鼻子碰了碰你的鼻子，然后舔了一下你的脸，表示友好。",
    "加橘在纸箱里转了三圈才坐下，然后满意地叹了口气。",
    "加橘把拖鞋当成了假想敌，又扑又咬，玩得不亦乐乎。",
    "加橘蹲在路由器上，用爪子按了一下指示灯，仿佛在重启网络。",
    "加橘在阳台的阳光下翻了个身，眯起眼睛，露出了惬意的表情。",
    "加橘用尾巴卷住你的手腕，像是在和你握手。",
    "加橘在猫砂盆里刨了半天，然后若无其事地走开，什么都没发生。"
];

// 备注池（6 条）
const REMARKS = [
    "加橘今天心情不错，建议多陪它玩耍 🎾",
    "加橘似乎有点困了，不要打扰它 😴",
    "加橘正在思考猫生，请保持安静 🤔",
    "加橘饿了，快去开罐头 🥫",
    "加橘在暗中观察你，小心被它盯上 👀",
    "加橘进入了「禅」模式，不可打扰 🧘"
];

// 状态池（6 条）
const STATUSES = [
    "活跃", "慵懒", "专注", "警觉", "惬意", "神秘"
];

// ================================================================
//  2. 伪随机数生成器 (mulberry32)
// ================================================================
function mulberry32(a) {
    return function () {
        a |= 0;
        a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// ================================================================
//  3. 核心逻辑：基于时间种子生成观测结果
// ================================================================
const INTERVAL_MS = 10 * 60 * 1000; // 10 分钟

function getSeed() {
    return Math.floor(Date.now() / INTERVAL_MS);
}

function generateObservation(seed) {
    const rng = mulberry32(seed);

    // 主结果
    const obsIndex = Math.floor(rng() * OBSERVATIONS.length);
    const mainResult = OBSERVATIONS[obsIndex];

    // 备注
    const remarkIndex = Math.floor(rng() * REMARKS.length);
    const remark = REMARKS[remarkIndex];

    // 状态
    const statusIndex = Math.floor(rng() * STATUSES.length);
    const status = STATUSES[statusIndex];

    // 报告编号 (基于种子 + 哈希)
    const idNum = (Math.abs((seed * 9301 + 49297) % 100000) + 10000) % 10000;
    const reportId = '#' + String(idNum).padStart(4, '0');

    // 猫的表情 (基于种子)
    const emojis = ['🐱', '😺', '😸', '😻', '😽', '😹'];
    const emojiIndex = Math.floor(rng() * emojis.length);
    const catEmoji = emojis[emojiIndex];

    return {
        mainResult,
        remark,
        status,
        reportId,
        catEmoji,
        seed,
    };
}

// ================================================================
//  4. UI 渲染
// ================================================================
const elements = {
    reportCard: document.getElementById('reportCard'),
    reportId: document.getElementById('reportId'),
    reportTime: document.getElementById('reportTime'),
    mainResult: document.getElementById('mainResult'),
    catAvatar: document.getElementById('catAvatar'),
    seedDisplay: document.getElementById('seedDisplay'),
    statusDisplay: document.getElementById('statusDisplay'),
    remarkDisplay: document.getElementById('remarkDisplay'),
    timerBar: document.getElementById('timerBar'),
    timerText: document.getElementById('timerText'),
    btnObserve: document.getElementById('btnObserve'),
};

let currentSeed = getSeed();
let currentData = null;

// 格式化时间
function formatTime(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 更新倒计时
function updateTimer() {
    const now = Date.now();
    const elapsed = now % INTERVAL_MS;
    const remaining = INTERVAL_MS - elapsed;
    const totalSec = Math.floor(remaining / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pct = (remaining / INTERVAL_MS) * 100;

    elements.timerBar.style.width = pct + '%';
    elements.timerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// 渲染观测结果
function renderObservation(seed, animate = true) {
    const data = generateObservation(seed);
    currentData = data;

    // 主结果
    elements.mainResult.textContent = data.mainResult;
    elements.catAvatar.textContent = data.catEmoji;

    // 报告 ID & 时间
    elements.reportId.textContent = data.reportId;
    elements.reportTime.textContent = formatTime(Date.now());

    // 元数据
    elements.seedDisplay.textContent = data.seed;
    elements.statusDisplay.textContent = data.status;
    elements.remarkDisplay.textContent = data.remark;

    // 动画
    if (animate) {
        elements.reportCard.classList.remove('flip');
        // 强制重绘
        void elements.reportCard.offsetWidth;
        elements.reportCard.classList.add('flip');

        elements.mainResult.classList.remove('pop');
        void elements.mainResult.offsetWidth;
        elements.mainResult.classList.add('pop');
    }

    // 更新倒计时
    updateTimer();
}

// 检查种子是否变化，若变化则重新渲染
function checkAndRefresh() {
    const newSeed = getSeed();
    if (newSeed !== currentSeed) {
        currentSeed = newSeed;
        renderObservation(currentSeed, true);
    } else {
        // 仅更新时间 & 倒计时
        elements.reportTime.textContent = formatTime(Date.now());
        updateTimer();
    }
}

// ================================================================
//  5. 事件绑定 & 启动
// ================================================================

// 点击 "再观测一次" —— 重新显示当前种子对应的结果（带动画）
elements.btnObserve.addEventListener('click', () => {
    // 用当前种子重新渲染（强制动画）
    renderObservation(currentSeed, true);
    // 但时间要更新
    elements.reportTime.textContent = formatTime(Date.now());
});

// 每秒更新倒计时 & 检查种子变化
setInterval(() => {
    checkAndRefresh();
}, 1000);

// 首次渲染
currentSeed = getSeed();
renderObservation(currentSeed, true);

// 额外：页面可见性变化时立即检查（防止切后台太久）
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkAndRefresh();
    }
});

// 窗口尺寸变化时保持倒计时精确（但无额外操作）
console.log('🔭 观测加橘已启动！每 10 分钟刷新一次观测结果。');
console.log('🐈 当前种子:', currentSeed);