/**
 * tarot.js - 塔罗占卜核心逻辑
 * 包含78张完整塔罗牌数据、抽牌、翻牌、解读等功能
 */

// ============================================
// 1. 牌组数据（78张完整塔罗牌）
// ============================================
const TAROT_DECK = [
    // ===== 大阿尔卡纳 (22张) =====
    { id: '0', name: '愚者', nameEn: 'The Fool', arcana: 'major' },
    { id: '1', name: '魔术师', nameEn: 'The Magician', arcana: 'major' },
    { id: '2', name: '女祭司', nameEn: 'The High Priestess', arcana: 'major' },
    { id: '3', name: '皇后', nameEn: 'The Empress', arcana: 'major' },
    { id: '4', name: '皇帝', nameEn: 'The Emperor', arcana: 'major' },
    { id: '5', name: '教皇', nameEn: 'The Hierophant', arcana: 'major' },
    { id: '6', name: '恋人', nameEn: 'The Lovers', arcana: 'major' },
    { id: '7', name: '战车', nameEn: 'The Chariot', arcana: 'major' },
    { id: '8', name: '力量', nameEn: 'Strength', arcana: 'major' },
    { id: '9', name: '隐者', nameEn: 'The Hermit', arcana: 'major' },
    { id: '10', name: '命运之轮', nameEn: 'Wheel of Fortune', arcana: 'major' },
    { id: '11', name: '正义', nameEn: 'Justice', arcana: 'major' },
    { id: '12', name: '倒吊人', nameEn: 'The Hanged Man', arcana: 'major' },
    { id: '13', name: '死神', nameEn: 'Death', arcana: 'major' },
    { id: '14', name: '节制', nameEn: 'Temperance', arcana: 'major' },
    { id: '15', name: '恶魔', nameEn: 'The Devil', arcana: 'major' },
    { id: '16', name: '高塔', nameEn: 'The Tower', arcana: 'major' },
    { id: '17', name: '星星', nameEn: 'The Star', arcana: 'major' },
    { id: '18', name: '月亮', nameEn: 'The Moon', arcana: 'major' },
    { id: '19', name: '太阳', nameEn: 'The Sun', arcana: 'major' },
    { id: '20', name: '审判', nameEn: 'Judgement', arcana: 'major' },
    { id: '21', name: '世界', nameEn: 'The World', arcana: 'major' },

    // ===== 权杖 W (14张) =====
    { id: 'W1', name: '权杖一', nameEn: 'Ace of Wands', arcana: 'minor' },
    { id: 'W2', name: '权杖二', nameEn: 'Two of Wands', arcana: 'minor' },
    { id: 'W3', name: '权杖三', nameEn: 'Three of Wands', arcana: 'minor' },
    { id: 'W4', name: '权杖四', nameEn: 'Four of Wands', arcana: 'minor' },
    { id: 'W5', name: '权杖五', nameEn: 'Five of Wands', arcana: 'minor' },
    { id: 'W6', name: '权杖六', nameEn: 'Six of Wands', arcana: 'minor' },
    { id: 'W7', name: '权杖七', nameEn: 'Seven of Wands', arcana: 'minor' },
    { id: 'W8', name: '权杖八', nameEn: 'Eight of Wands', arcana: 'minor' },
    { id: 'W9', name: '权杖九', nameEn: 'Nine of Wands', arcana: 'minor' },
    { id: 'W10', name: '权杖十', nameEn: 'Ten of Wands', arcana: 'minor' },
    { id: 'W侍从', name: '权杖侍从', nameEn: 'Page of Wands', arcana: 'minor' },
    { id: 'W骑士', name: '权杖骑士', nameEn: 'Knight of Wands', arcana: 'minor' },
    { id: 'W皇后', name: '权杖皇后', nameEn: 'Queen of Wands', arcana: 'minor' },
    { id: 'W国王', name: '权杖国王', nameEn: 'King of Wands', arcana: 'minor' },

    // ===== 圣杯 C (14张) =====
    { id: 'C1', name: '圣杯一', nameEn: 'Ace of Cups', arcana: 'minor' },
    { id: 'C2', name: '圣杯二', nameEn: 'Two of Cups', arcana: 'minor' },
    { id: 'C3', name: '圣杯三', nameEn: 'Three of Cups', arcana: 'minor' },
    { id: 'C4', name: '圣杯四', nameEn: 'Four of Cups', arcana: 'minor' },
    { id: 'C5', name: '圣杯五', nameEn: 'Five of Cups', arcana: 'minor' },
    { id: 'C6', name: '圣杯六', nameEn: 'Six of Cups', arcana: 'minor' },
    { id: 'C7', name: '圣杯七', nameEn: 'Seven of Cups', arcana: 'minor' },
    { id: 'C8', name: '圣杯八', nameEn: 'Eight of Cups', arcana: 'minor' },
    { id: 'C9', name: '圣杯九', nameEn: 'Nine of Cups', arcana: 'minor' },
    { id: 'C10', name: '圣杯十', nameEn: 'Ten of Cups', arcana: 'minor' },
    { id: 'C侍从', name: '圣杯侍从', nameEn: 'Page of Cups', arcana: 'minor' },
    { id: 'C骑士', name: '圣杯骑士', nameEn: 'Knight of Cups', arcana: 'minor' },
    { id: 'C皇后', name: '圣杯皇后', nameEn: 'Queen of Cups', arcana: 'minor' },
    { id: 'C国王', name: '圣杯国王', nameEn: 'King of Cups', arcana: 'minor' },

    // ===== 宝剑 S (14张) =====
    { id: 'S1', name: '宝剑一', nameEn: 'Ace of Swords', arcana: 'minor' },
    { id: 'S2', name: '宝剑二', nameEn: 'Two of Swords', arcana: 'minor' },
    { id: 'S3', name: '宝剑三', nameEn: 'Three of Swords', arcana: 'minor' },
    { id: 'S4', name: '宝剑四', nameEn: 'Four of Swords', arcana: 'minor' },
    { id: 'S5', name: '宝剑五', nameEn: 'Five of Swords', arcana: 'minor' },
    { id: 'S6', name: '宝剑六', nameEn: 'Six of Swords', arcana: 'minor' },
    { id: 'S7', name: '宝剑七', nameEn: 'Seven of Swords', arcana: 'minor' },
    { id: 'S8', name: '宝剑八', nameEn: 'Eight of Swords', arcana: 'minor' },
    { id: 'S9', name: '宝剑九', nameEn: 'Nine of Swords', arcana: 'minor' },
    { id: 'S10', name: '宝剑十', nameEn: 'Ten of Swords', arcana: 'minor' },
    { id: 'S侍从', name: '宝剑侍从', nameEn: 'Page of Swords', arcana: 'minor' },
    { id: 'S骑士', name: '宝剑骑士', nameEn: 'Knight of Swords', arcana: 'minor' },
    { id: 'S皇后', name: '宝剑皇后', nameEn: 'Queen of Swords', arcana: 'minor' },
    { id: 'S国王', name: '宝剑国王', nameEn: 'King of Swords', arcana: 'minor' },

    // ===== 星币 P (14张) =====
    { id: 'P1', name: '星币一', nameEn: 'Ace of Pentacles', arcana: 'minor' },
    { id: 'P2', name: '星币二', nameEn: 'Two of Pentacles', arcana: 'minor' },
    { id: 'P3', name: '星币三', nameEn: 'Three of Pentacles', arcana: 'minor' },
    { id: 'P4', name: '星币四', nameEn: 'Four of Pentacles', arcana: 'minor' },
    { id: 'P5', name: '星币五', nameEn: 'Five of Pentacles', arcana: 'minor' },
    { id: 'P6', name: '星币六', nameEn: 'Six of Pentacles', arcana: 'minor' },
    { id: 'P7', name: '星币七', nameEn: 'Seven of Pentacles', arcana: 'minor' },
    { id: 'P8', name: '星币八', nameEn: 'Eight of Pentacles', arcana: 'minor' },
    { id: 'P9', name: '星币九', nameEn: 'Nine of Pentacles', arcana: 'minor' },
    { id: 'P10', name: '星币十', nameEn: 'Ten of Pentacles', arcana: 'minor' },
    { id: 'P侍从', name: '星币侍从', nameEn: 'Page of Pentacles', arcana: 'minor' },
    { id: 'P骑士', name: '星币骑士', nameEn: 'Knight of Pentacles', arcana: 'minor' },
    { id: 'P皇后', name: '星币皇后', nameEn: 'Queen of Pentacles', arcana: 'minor' },
    { id: 'P国王', name: '星币国王', nameEn: 'King of Pentacles', arcana: 'minor' },
];

// ============================================
// 2. 配置
// ============================================
const CONFIG = {
    IMG_BASE: '/images/tarot_cards/',
    BACK_IMG: '/images/tarot_cards/_.png',
    REVERSED_PROBABILITY: 0.5, // 逆位概率 50%
    FLIP_DELAY_BASE: 300, // 翻牌延迟基数(ms)
    FLIP_DELAY_STEP: 200, // 每张牌递增延迟(ms)
};

// ============================================
// 3. 状态
// ============================================
let currentCards = []; // 当前抽出的牌 [{ id, name, nameEn, isReversed }]
let isFlipped = false; // 是否已翻牌

// ============================================
// 4. 工具函数
// ============================================

/**
 * Fisher-Yates 洗牌算法
 */
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 从牌组中随机抽取 n 张牌（不重复）
 * 每张牌独立决定是否逆位
 */
function drawRandomCards(n) {
    if (n > TAROT_DECK.length) {
        console.warn('抽取数量超过牌组总数，调整为最大数量');
        n = TAROT_DECK.length;
    }
    const shuffled = shuffleArray(TAROT_DECK);
    return shuffled.slice(0, n).map(card => ({
        ...card,
        isReversed: Math.random() < CONFIG.REVERSED_PROBABILITY,
    }));
}

/**
 * 获取牌图片路径
 */
function getCardImagePath(cardId) {
    return `${CONFIG.IMG_BASE}${cardId}.png`;
}

// ============================================
// 5. 渲染函数
// ============================================

/**
 * 渲染牌阵
 */
function renderCards(cards) {
    const area = document.getElementById('spreadArea');
    const resultDiv = document.getElementById('readingResult');

    if (!cards || cards.length === 0) {
        area.innerHTML = `<div class="placeholder-text">🃏 点击下方按钮开始抽牌</div>`;
        resultDiv.innerHTML = `<p class="placeholder-text">点击「抽牌」开始你的占卜之旅...</p>`;
        currentCards = [];
        isFlipped = false;
        return;
    }

    currentCards = cards;
    isFlipped = false;

    // 生成牌面HTML
    area.innerHTML = cards.map((card, index) => {
        const imgSrc = getCardImagePath(card.id);
        const reversedClass = card.isReversed ? 'reversed' : '';
        // 用 data-name 存牌名，用于CSS伪元素显示
        return `
            <div class="card-slot" data-index="${index}" onclick="toggleCardFlip(${index})">
                <div class="card-inner">
                    <div class="card-back">
                        <img src="${CONFIG.BACK_IMG}" alt="牌背" loading="lazy">
                    </div>
                    <div class="card-front ${reversedClass}" data-name="${card.name}">
                        <img src="${imgSrc}" alt="${card.name}" loading="lazy">
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 自动翻牌（带延迟动画）
    cards.forEach((_, index) => {
        setTimeout(() => {
            const slot = document.querySelector(`.card-slot[data-index="${index}"]`);
            if (slot) {
                slot.classList.add('flipped');
                // 触发翻牌完成事件
                if (index === cards.length - 1) {
                    isFlipped = true;
                }
            }
        }, CONFIG.FLIP_DELAY_BASE + index * CONFIG.FLIP_DELAY_STEP);
    });

    // 更新解读区
    updateReading(cards);
}

/**
 * 更新解读区
 */
function updateReading(cards) {
    const resultDiv = document.getElementById('readingResult');
    if (!cards || cards.length === 0) {
        resultDiv.innerHTML = `<p class="placeholder-text">点击「抽牌」开始你的占卜之旅...</p>`;
        return;
    }

    let html = `<h3>🔮 占卜解读</h3>`;

    cards.forEach((card, i) => {
        const orientationText = card.isReversed ? '逆位' : '正位';
        const orientationClass = card.isReversed ? 'reversed' : 'upright';
        const orientationIcon = card.isReversed ? '⬇️' : '⬆️';

        html += `
            <div class="card-item">
                <span class="card-name">${card.name}</span>
                <span class="card-en">${card.nameEn}</span>
                <span class="orientation ${orientationClass}">${orientationIcon} ${orientationText}</span>
            </div>
        `;
    });

    // 添加解读提示（可扩展为更详细的解读）
    const hasReversed = cards.some(c => c.isReversed);
    const allReversed = cards.every(c => c.isReversed);
    let note = '💡 正位代表积极、显化的能量；逆位代表内在课题、阻碍或需要反思的方向。';
    if (allReversed && cards.length > 1) {
        note = '🌙 所有牌均为逆位，提示你当前可能需要深入内省，重新审视当前的处境。';
    } else if (hasReversed) {
        note = '⚖️ 牌阵中既有正位也有逆位，暗示着平衡与挑战并存，需要综合考量。';
    } else if (cards.length === 1 && !cards[0].isReversed) {
        note = '🌟 这张正位牌带来积极的能量，鼓励你把握当下的机遇。';
    }

    html += `<div class="reading-note">${note}</div>`;
    resultDiv.innerHTML = html;
}

// ============================================
// 6. 交互函数（暴露到全局）
// ============================================

/**
 * 抽牌主函数
 * @param {number} count - 抽取牌的数量
 */
function drawCards(count = 3) {
    if (count < 1) count = 1;
    if (count > 10) count = 10; // 限制最多10张
    const cards = drawRandomCards(count);
    renderCards(cards);
}

/**
 * 手动翻转单张牌
 */
function toggleCardFlip(index) {
    const slot = document.querySelector(`.card-slot[data-index="${index}"]`);
    if (slot) {
        slot.classList.toggle('flipped');
    }
}

/**
 * 重置所有牌
 */
function resetAll() {
    renderCards([]);
    // 清空解读区
    document.getElementById('readingResult').innerHTML =
        `<p class="placeholder-text">点击「抽牌」开始你的占卜之旅...</p>`;
}

/**
 * 获取当前牌阵数据（可用于发送到后端API）
 */
function getCurrentReading() {
    return currentCards.map(card => ({
        id: card.id,
        name: card.name,
        nameEn: card.nameEn,
        isReversed: card.isReversed,
        arcana: card.arcana,
    }));
}

// ============================================
// 7. 初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // 显示初始状态
    renderCards([]);

    // 键盘快捷键支持
    document.addEventListener('keydown', function(e) {
        if (e.key === 'r' || e.key === 'R') {
            drawCards(3);
        } else if (e.key === '1') {
            drawCards(1);
        } else if (e.key === 'Escape') {
            resetAll();
        }
    });

    console.log('🔮 塔罗占卜已加载');
    console.log(`📚 共 ${TAROT_DECK.length} 张牌`);
    console.log('⌨️ 快捷键: [R] 抽三张 [1] 抽一张 [Esc] 重置');
});

// ============================================
// 8. 导出（模块化支持）
// ============================================
// 如果使用 ES Module，可以取消注释以下内容
// export {
//     TAROT_DECK,
//     drawCards,
//     drawRandomCards,
//     toggleCardFlip,
//     resetAll,
//     getCurrentReading,
//     CONFIG,
// };