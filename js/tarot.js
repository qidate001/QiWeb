/**
 * tarot.js - 塔罗占卜核心逻辑 + AI 解读
 * 支持 Cloudflare Worker 代理调用 DeepSeek API
 */

// ============================================
// 1. 牌组数据（78张完整塔罗牌）
// ============================================
const TAROT_DECK = [
    // 大阿尔卡纳 (22张)
    { id: '0', name: '愚者', nameEn: 'The Fool' },
    { id: '1', name: '魔术师', nameEn: 'The Magician' },
    { id: '2', name: '女祭司', nameEn: 'The High Priestess' },
    { id: '3', name: '皇后', nameEn: 'The Empress' },
    { id: '4', name: '皇帝', nameEn: 'The Emperor' },
    { id: '5', name: '教皇', nameEn: 'The Hierophant' },
    { id: '6', name: '恋人', nameEn: 'The Lovers' },
    { id: '7', name: '战车', nameEn: 'The Chariot' },
    { id: '8', name: '力量', nameEn: 'Strength' },
    { id: '9', name: '隐者', nameEn: 'The Hermit' },
    { id: '10', name: '命运之轮', nameEn: 'Wheel of Fortune' },
    { id: '11', name: '正义', nameEn: 'Justice' },
    { id: '12', name: '倒吊人', nameEn: 'The Hanged Man' },
    { id: '13', name: '死神', nameEn: 'Death' },
    { id: '14', name: '节制', nameEn: 'Temperance' },
    { id: '15', name: '恶魔', nameEn: 'The Devil' },
    { id: '16', name: '高塔', nameEn: 'The Tower' },
    { id: '17', name: '星星', nameEn: 'The Star' },
    { id: '18', name: '月亮', nameEn: 'The Moon' },
    { id: '19', name: '太阳', nameEn: 'The Sun' },
    { id: '20', name: '审判', nameEn: 'Judgement' },
    { id: '21', name: '世界', nameEn: 'The World' },

    // 权杖 W
    { id: 'W1', name: '权杖一', nameEn: 'Ace of Wands' },
    { id: 'W2', name: '权杖二', nameEn: 'Two of Wands' },
    { id: 'W3', name: '权杖三', nameEn: 'Three of Wands' },
    { id: 'W4', name: '权杖四', nameEn: 'Four of Wands' },
    { id: 'W5', name: '权杖五', nameEn: 'Five of Wands' },
    { id: 'W6', name: '权杖六', nameEn: 'Six of Wands' },
    { id: 'W7', name: '权杖七', nameEn: 'Seven of Wands' },
    { id: 'W8', name: '权杖八', nameEn: 'Eight of Wands' },
    { id: 'W9', name: '权杖九', nameEn: 'Nine of Wands' },
    { id: 'W10', name: '权杖十', nameEn: 'Ten of Wands' },
    { id: 'W侍从', name: '权杖侍从', nameEn: 'Page of Wands' },
    { id: 'W骑士', name: '权杖骑士', nameEn: 'Knight of Wands' },
    { id: 'W皇后', name: '权杖皇后', nameEn: 'Queen of Wands' },
    { id: 'W国王', name: '权杖国王', nameEn: 'King of Wands' },

    // 圣杯 C
    { id: 'C1', name: '圣杯一', nameEn: 'Ace of Cups' },
    { id: 'C2', name: '圣杯二', nameEn: 'Two of Cups' },
    { id: 'C3', name: '圣杯三', nameEn: 'Three of Cups' },
    { id: 'C4', name: '圣杯四', nameEn: 'Four of Cups' },
    { id: 'C5', name: '圣杯五', nameEn: 'Five of Cups' },
    { id: 'C6', name: '圣杯六', nameEn: 'Six of Cups' },
    { id: 'C7', name: '圣杯七', nameEn: 'Seven of Cups' },
    { id: 'C8', name: '圣杯八', nameEn: 'Eight of Cups' },
    { id: 'C9', name: '圣杯九', nameEn: 'Nine of Cups' },
    { id: 'C10', name: '圣杯十', nameEn: 'Ten of Cups' },
    { id: 'C侍从', name: '圣杯侍从', nameEn: 'Page of Cups' },
    { id: 'C骑士', name: '圣杯骑士', nameEn: 'Knight of Cups' },
    { id: 'C皇后', name: '圣杯皇后', nameEn: 'Queen of Cups' },
    { id: 'C国王', name: '圣杯国王', nameEn: 'King of Cups' },

    // 宝剑 S
    { id: 'S1', name: '宝剑一', nameEn: 'Ace of Swords' },
    { id: 'S2', name: '宝剑二', nameEn: 'Two of Swords' },
    { id: 'S3', name: '宝剑三', nameEn: 'Three of Swords' },
    { id: 'S4', name: '宝剑四', nameEn: 'Four of Swords' },
    { id: 'S5', name: '宝剑五', nameEn: 'Five of Swords' },
    { id: 'S6', name: '宝剑六', nameEn: 'Six of Swords' },
    { id: 'S7', name: '宝剑七', nameEn: 'Seven of Swords' },
    { id: 'S8', name: '宝剑八', nameEn: 'Eight of Swords' },
    { id: 'S9', name: '宝剑九', nameEn: 'Nine of Swords' },
    { id: 'S10', name: '宝剑十', nameEn: 'Ten of Swords' },
    { id: 'S侍从', name: '宝剑侍从', nameEn: 'Page of Swords' },
    { id: 'S骑士', name: '宝剑骑士', nameEn: 'Knight of Swords' },
    { id: 'S皇后', name: '宝剑皇后', nameEn: 'Queen of Swords' },
    { id: 'S国王', name: '宝剑国王', nameEn: 'King of Swords' },

    // 星币 P
    { id: 'P1', name: '星币一', nameEn: 'Ace of Pentacles' },
    { id: 'P2', name: '星币二', nameEn: 'Two of Pentacles' },
    { id: 'P3', name: '星币三', nameEn: 'Three of Pentacles' },
    { id: 'P4', name: '星币四', nameEn: 'Four of Pentacles' },
    { id: 'P5', name: '星币五', nameEn: 'Five of Pentacles' },
    { id: 'P6', name: '星币六', nameEn: 'Six of Pentacles' },
    { id: 'P7', name: '星币七', nameEn: 'Seven of Pentacles' },
    { id: 'P8', name: '星币八', nameEn: 'Eight of Pentacles' },
    { id: 'P9', name: '星币九', nameEn: 'Nine of Pentacles' },
    { id: 'P10', name: '星币十', nameEn: 'Ten of Pentacles' },
    { id: 'P侍从', name: '星币侍从', nameEn: 'Page of Pentacles' },
    { id: 'P骑士', name: '星币骑士', nameEn: 'Knight of Pentacles' },
    { id: 'P皇后', name: '星币皇后', nameEn: 'Queen of Pentacles' },
    { id: 'P国王', name: '星币国王', nameEn: 'King of Pentacles' },
];

// ============================================
// 2. AI 解读配置
// ============================================
const AI_CONFIG = {
    WORKER_URL: 'https://tarot-api.qidate001.workers.dev',
    ENABLE_AI: true,
    FALLBACK_DATA: '/data/tarot-readings.json',
};

// ============================================
// 3. 配置
// ============================================
const CONFIG = {
    IMG_BASE: '/images/tarot_cards/',
    BACK_IMG: '/images/tarot_cards/_.png',
    REVERSED_PROBABILITY: 0.5,
    FLIP_DELAY_BASE: 300,
    FLIP_DELAY_STEP: 200,
};

// ============================================
// 4. 状态
// ============================================
let currentCards = [];

// ============================================
// 5. 工具函数
// ============================================
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function drawRandomCards(n) {
    if (n > TAROT_DECK.length) n = TAROT_DECK.length;
    const shuffled = shuffleArray(TAROT_DECK);
    return shuffled.slice(0, n).map(card => ({
        ...card,
        isReversed: Math.random() < CONFIG.REVERSED_PROBABILITY,
    }));
}

// ============================================
// 6. AI 解读功能
// ============================================

async function getAIReading(cards, question = '') {
    if (!AI_CONFIG.ENABLE_AI) {
        return getFallbackReading(cards);
    }

    try {
        const response = await fetch(AI_CONFIG.WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cards: cards.map(card => ({
                    id: card.id,
                    name: card.name,
                    nameEn: card.nameEn,
                    isReversed: card.isReversed,
                })),
                question: question,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'AI 解读失败');
        }

        return {
            success: true,
            reading: data.reading,
            cards: data.cards,
            timestamp: data.timestamp,
        };

    } catch (error) {
        console.error('AI 解读失败:', error);
        return getFallbackReading(cards);
    }
}

async function getFallbackReading(cards) {
    try {
        const response = await fetch(AI_CONFIG.FALLBACK_DATA);
        if (!response.ok) throw new Error('加载降级数据失败');
        
        const readings = await response.json();
        let result = '📖 塔罗解读（预生成版本）：\n\n';
        
        cards.forEach(card => {
            const orientation = card.isReversed ? 'reversed' : 'upright';
            const reading = readings[card.id]?.[orientation] || '暂无解读';
            result += `【${card.name}】${card.isReversed ? '（逆位）' : '（正位）'}\n${reading}\n\n`;
        });
        
        return {
            success: true,
            reading: result,
            isFallback: true,
        };
    } catch (error) {
        return {
            success: false,
            error: '无法获取解读，请稍后重试',
        };
    }
}

// ============================================
// 7. 渲染函数
// ============================================

function renderCards(cards) {
    const area = document.getElementById('spreadArea');
    const resultDiv = document.getElementById('readingResult');

    if (!cards || cards.length === 0) {
        area.innerHTML = `<div class="placeholder-text">🃏 点击下方按钮开始抽牌</div>`;
        resultDiv.innerHTML = `<p class="placeholder-text">点击「抽牌」开始你的占卜之旅...</p>`;
        currentCards = [];
        return;
    }

    currentCards = cards;

    area.innerHTML = cards.map((card, index) => {
        const imgSrc = `${CONFIG.IMG_BASE}${card.id}.png`;
        const reversedClass = card.isReversed ? 'reversed' : '';
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

    cards.forEach((_, index) => {
        setTimeout(() => {
            const slot = document.querySelector(`.card-slot[data-index="${index}"]`);
            if (slot) slot.classList.add('flipped');
        }, CONFIG.FLIP_DELAY_BASE + index * CONFIG.FLIP_DELAY_STEP);
    });
}

function updateReading(cards) {
    const resultDiv = document.getElementById('readingResult');
    if (!cards || cards.length === 0) {
        resultDiv.innerHTML = `<p class="placeholder-text">点击「抽牌」开始你的占卜之旅...</p>`;
        return;
    }

    let html = `<h3>🔮 占卜解读</h3>`;
    cards.forEach((card) => {
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

    const hasReversed = cards.some(c => c.isReversed);
    let note = '💡 正位代表积极、显化的能量；逆位代表内在课题、阻碍或需要反思的方向。';
    if (cards.every(c => c.isReversed) && cards.length > 1) {
        note = '🌙 所有牌均为逆位，提示你当前可能需要深入内省，重新审视当前的处境。';
    } else if (hasReversed) {
        note = '⚖️ 牌阵中既有正位也有逆位，暗示着平衡与挑战并存，需要综合考量。';
    }
    html += `<div class="reading-note">${note}</div>`;
    resultDiv.innerHTML = html;
}

function updateReadingWithAI(cards, reading) {
    const resultDiv = document.getElementById('readingResult');
    
    // 牌面信息
    let cardInfo = '';
    cards.forEach((card) => {
        const orientation = card.isReversed ? '逆位' : '正位';
        const cls = card.isReversed ? 'reversed' : 'upright';
        const icon = card.isReversed ? '⬇️' : '⬆️';
        cardInfo += `
            <div class="card-item">
                <span class="card-name">${card.name}</span>
                <span class="card-en">${card.nameEn}</span>
                <span class="orientation ${cls}">${icon} ${orientation}</span>
            </div>
        `;
    });
    
    // 使用 marked 渲染 Markdown
    let formattedReading = '';
    try {
        // 如果 marked 可用，渲染 Markdown
        if (typeof marked !== 'undefined') {
            formattedReading = marked.parse(reading);
        } else {
            // 降级方案：简单处理换行
            formattedReading = reading
                .split('\n')
                .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
                .join('');
        }
    } catch (e) {
        console.warn('Markdown 渲染失败，使用纯文本:', e);
        formattedReading = reading
            .split('\n')
            .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
            .join('');
    }
    
    resultDiv.innerHTML = `
        <h3>🔮 AI 塔罗解读</h3>
        <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,215,0,0.05); border-radius: 10px;">
            ${cardInfo}
        </div>
        <div class="markdown-body" style="color: #d8c8e0; line-height: 1.8; font-size: 0.95rem;">
            ${formattedReading}
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,215,0,0.08); color: #6a5a7a; font-size: 0.8rem; text-align: right;">
            由 DeepSeek AI 生成 · ${new Date().toLocaleString()}
        </div>
    `;
}

// ============================================
// 8. 交互函数
// ============================================

async function drawCards(count = 3) {
    if (count < 1) count = 1;
    if (count > 10) count = 10;
    
    const cards = drawRandomCards(count);
    renderCards(cards);
    
    // 显示加载状态
    const resultDiv = document.getElementById('readingResult');
    resultDiv.innerHTML = `
        <h3>🔮 正在解读中...</h3>
        <div style="text-align: center; padding: 20px;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,215,0,0.1); border-top-color: #ffd700; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: #b8a0c0; margin-top: 10px;">AI 正在分析牌阵，请稍候...</p>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    
    try {
        const result = await getAIReading(cards, '');
        
        if (result.success) {
            updateReadingWithAI(cards, result.reading);
        } else {
            throw new Error(result.error || '解读失败');
        }
    } catch (error) {
        console.error('解读出错:', error);
        updateReading(cards);
        const resultDiv = document.getElementById('readingResult');
        resultDiv.innerHTML += `
            <div style="color: #ff7a7a; margin-top: 10px; padding: 10px; background: rgba(255,0,0,0.1); border-radius: 8px;">
                ⚠️ AI 解读暂时不可用，已显示基础信息
            </div>
        `;
    }
}

function toggleCardFlip(index) {
    const slot = document.querySelector(`.card-slot[data-index="${index}"]`);
    if (slot) {
        slot.classList.toggle('flipped');
    }
}

function resetAll() {
    renderCards([]);
    document.getElementById('readingResult').innerHTML =
        `<p class="placeholder-text">点击「抽牌」开始你的占卜之旅...</p>`;
}

// ============================================
// 9. 初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    renderCards([]);
    console.log('🔮 塔罗占卜已加载');
    console.log(`📚 共 ${TAROT_DECK.length} 张牌`);
    console.log('🤖 AI 解读已启用:', AI_CONFIG.ENABLE_AI);
});