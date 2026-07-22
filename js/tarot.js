/**
 * tarot.js - 塔罗占卜核心逻辑 + AI 解读（多牌阵 · 左右布局）
 */

// ============================================
// 牌组数据（78张完整塔罗牌）
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
    // 权杖
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
    // 圣杯
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
    // 宝剑
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
    // 星币
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
// 牌阵定义（可扩展）
// ============================================
const SPREADS = {
    single: {
        id: 'single',
        label: '单牌占卜',
        badge: '1张',
        count: 1,
        positions: [
            { label: '核心指引' }
        ],
        // 布局渲染函数，返回 HTML 字符串
        render: (cards) => {
            return cards.map((card, i) => renderCard(card, i, SPREADS.single.positions[i]?.label)).join('');
        }
    },
    three: {
        id: 'three',
        label: '三牌占卜（时间之流）',
        badge: '3张',
        count: 3,
        positions: [
            { label: '过去 / 原因' },
            { label: '现在 / 行动' },
            { label: '未来 / 结果' }
        ],
        render: (cards) => {
            return cards.map((card, i) => renderCard(card, i, SPREADS.three.positions[i]?.label)).join('');
        }
    },
    choice: {
        id: 'choice',
        label: '抉择牌阵（二择一）',
        badge: '5张',
        count: 5,
        positions: [
            { label: '核心状态' },          // index 0
            { label: 'A 过程' },            // index 1
            { label: 'A 结果' },            // index 2
            { label: 'B 过程' },            // index 3
            { label: 'B 结果' }             // index 4
        ],
        render: (cards) => {
            // 定制布局：中心1张，左列2张，右列2张
            const center = cards[0] ? renderCard(cards[0], 0, '核心状态') : '';
            const leftCards = cards.slice(1, 3).map((c, i) => renderCard(c, i + 1, SPREADS.choice.positions[i + 1]?.label)).join('');
            const rightCards = cards.slice(3, 5).map((c, i) => renderCard(c, i + 3, SPREADS.choice.positions[i + 3]?.label)).join('');

            return `
                <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:30px;">
                    <div class="spread-branch">
                        <div class="branch-label">🌿 路径 A</div>
                        <div class="branch-cards">${leftCards}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                        ${center}
                        <div style="color:#6a5a7a; font-size:0.8rem; letter-spacing:1px;">⚖️ 抉择</div>
                    </div>
                    <div class="spread-branch">
                        <div class="branch-label">🌿 路径 B</div>
                        <div class="branch-cards">${rightCards}</div>
                    </div>
                </div>
            `;
        }
    }
};

// 当前选中的牌阵 ID
let currentSpreadId = 'three'; // 默认三牌

// ============================================
// 配置
// ============================================
const CONFIG = {
    IMG_BASE: '/images/tarot_cards/',
    BACK_IMG: '/images/tarot_cards/_.png',
    REVERSED_PROBABILITY: 0.5,
    FLIP_DELAY_BASE: 300,
    FLIP_DELAY_STEP: 200,
};

const AI_CONFIG = {
    WORKER_URL: 'https://tarot-api.qidate001.workers.dev',
    ENABLE_AI: true,
    TYPING_SPEED: 18,
};

// ============================================
// 状态
// ============================================
let currentCards = [];

// ============================================
// 辅助函数
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

// 渲染单张牌 HTML
function renderCard(card, index, label) {
    const imgSrc = `${CONFIG.IMG_BASE}${card.id}.png`;
    const reversedClass = card.isReversed ? 'reversed' : '';
    const labelHtml = label ? `<div class="card-label">${label}</div>` : '';
    return `
        <div class="card-slot" data-index="${index}" onclick="toggleCardFlip(${index})">
            ${labelHtml}
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
}

// ============================================
// 渲染牌阵
// ============================================
function renderSpread(cards) {
    const area = document.getElementById('spreadArea');
    const spread = SPREADS[currentSpreadId];
    if (!cards || cards.length === 0) {
        area.innerHTML = `<div class="placeholder-text">🃏 选择牌阵后点击「抽牌」</div>`;
        return;
    }
    // 根据牌阵的 render 方法生成 HTML
    const html = spread.render(cards);
    area.innerHTML = `<div class="spread-container">${html}</div>`;

    // 自动翻牌
    cards.forEach((_, index) => {
        setTimeout(() => {
            const slot = document.querySelector(`.card-slot[data-index="${index}"]`);
            if (slot) slot.classList.add('flipped');
        }, CONFIG.FLIP_DELAY_BASE + index * CONFIG.FLIP_DELAY_STEP);
    });
}

// ============================================
// 牌阵选择 UI
// ============================================
function initSpreadOptions() {
    const container = document.getElementById('spreadOptions');
    container.innerHTML = '';
    Object.values(SPREADS).forEach(spread => {
        const div = document.createElement('div');
        div.className = `spread-option${spread.id === currentSpreadId ? ' active' : ''}`;
        div.dataset.spreadId = spread.id;
        div.innerHTML = `
            <span>${spread.label}</span>
            <span class="badge">${spread.badge}</span>
        `;
        div.addEventListener('click', () => {
            // 切换激活状态
            document.querySelectorAll('.spread-option').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            currentSpreadId = spread.id;
            // 清空当前牌阵
            currentCards = [];
            renderSpread([]);
            document.getElementById('readingResult').innerHTML = `<p class="placeholder-text">✨ 已切换牌阵，请点击「抽牌」</p>`;
        });
        container.appendChild(div);
    });
}

// ============================================
// 抽牌逻辑
// ============================================
async function handleDraw() {
    const spread = SPREADS[currentSpreadId];
    const count = spread.count;
    const cards = drawRandomCards(count);
    currentCards = cards;

    // 渲染牌阵
    renderSpread(cards);

    // 显示解读占位
    const resultDiv = document.getElementById('readingResult');
    const cardInfo = buildCardInfoHTML(cards);
    resultDiv.innerHTML = `
        <h3>🔮 AI 塔罗解读</h3>
        <div style="margin-bottom:15px; padding:12px; background:rgba(255,215,0,0.05); border-radius:10px;">
            ${cardInfo}
        </div>
        <div class="markdown-body" id="typewriter-content" style="color:#d8c8e0; line-height:1.8; font-size:0.95rem; min-height:100px; max-height:600px; overflow-y:auto; padding:10px;">
            <span style="color:#6a5a7a;">✨ AI 正在思考中...</span>
        </div>
        <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,215,0,0.08); color:#6a5a7a; font-size:0.8rem; text-align:right;">
            <span id="typing-status">⏳ 正在连接 AI...</span>
        </div>
    `;

    const contentDiv = document.getElementById('typewriter-content');
    const statusSpan = document.getElementById('typing-status');

    // 获取用户问题
    const question = document.getElementById('questionInput').value.trim();

    let typewriter = null;
    let hasStarted = false;

    try {
        await getAIReading(
            cards,
            question,
            // onChunk
            (chunk, accumulated) => {
                if (!hasStarted) {
                    hasStarted = true;
                }
                if (!typewriter) {
                    typewriter = new Typewriter(contentDiv, {
                        speed: AI_CONFIG.TYPING_SPEED,
                        renderFn: (text) => {
                            try {
                                if (typeof marked !== 'undefined') return marked.parse(text);
                                return text;
                            } catch (e) { return text; }
                        },
                        onComplete: () => {
                            statusSpan.textContent = '✅ 解读完成';
                            statusSpan.style.color = '#69f0ae';
                        }
                    });
                    typewriter.start(accumulated);
                } else {
                    typewriter.updateContent(accumulated);
                }
                statusSpan.textContent = `✍️ 正在书写... (${accumulated.length} 字符)`;
            },
            // onComplete
            (result) => {
                if (!hasStarted && result && result.reading) {
                    contentDiv.innerHTML = '';
                    typewriter = new Typewriter(contentDiv, {
                        speed: AI_CONFIG.TYPING_SPEED,
                        renderFn: (text) => {
                            try {
                                if (typeof marked !== 'undefined') return marked.parse(text);
                                return text;
                            } catch (e) { return text; }
                        },
                        onComplete: () => {
                            statusSpan.textContent = '✅ 解读完成';
                            statusSpan.style.color = '#69f0ae';
                        }
                    });
                    typewriter.start(result.reading);
                    statusSpan.textContent = `✍️ 正在书写... (${result.reading.length} 字符)`;
                }
            }
        );
    } catch (error) {
        console.error('解读出错:', error);
        contentDiv.innerHTML = `
            <div style="color:#ff7a7a; padding:20px; background:rgba(255,0,0,0.1); border-radius:8px;">
                ⚠️ 解读生成失败，请稍后重试
                <br><small style="color:#6a5a7a;">${error.message || ''}</small>
            </div>
        `;
        statusSpan.textContent = '❌ 生成失败';
        statusSpan.style.color = '#ff7a7a';
    }
}

// ============================================
// AI 解读（流式）
// ============================================
async function getAIReading(cards, question = '', onChunk = null, onComplete = null) {
    if (!AI_CONFIG.ENABLE_AI) {
        const result = await getFallbackReading(cards);
        if (onComplete) onComplete(result);
        return result;
    }

    try {
        const response = await fetch(AI_CONFIG.WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cards: cards.map(card => ({
                    id: card.id,
                    name: card.name,
                    nameEn: card.nameEn,
                    isReversed: card.isReversed,
                })),
                question: question,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                const jsonStr = trimmed.slice(6);
                if (jsonStr === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(jsonStr);
                    const delta = parsed.choices?.[0]?.delta;
                    if (delta) {
                        const content = delta.content || '';
                        if (content) {
                            fullContent += content;
                            if (onChunk) onChunk(content, fullContent);
                        }
                    }
                } catch (e) {
                    console.debug('SSE parse error:', e);
                }
            }
        }

        // 处理剩余 buffer
        if (buffer.trim()) {
            const trimmed = buffer.trim();
            if (trimmed.startsWith('data: ')) {
                const jsonStr = trimmed.slice(6);
                if (jsonStr !== '[DONE]') {
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const delta = parsed.choices?.[0]?.delta;
                        if (delta) {
                            const content = delta.content || '';
                            if (content) {
                                fullContent += content;
                                if (onChunk) onChunk(content, fullContent);
                            }
                        }
                    } catch (e) { /* ignore */ }
                }
            }
        }

        const result = { success: true, reading: fullContent, cards };
        if (onComplete) onComplete(result);
        return result;

    } catch (error) {
        console.error('AI 解读失败:', error);
        const fallback = await getFallbackReading(cards);
        if (onComplete) onComplete(fallback);
        return fallback;
    }
}

async function getFallbackReading(cards) {
    // 简单降级 - 返回固定文本
    let text = '📖 塔罗解读（预生成版本）：\n\n';
    cards.forEach(card => {
        const orient = card.isReversed ? '逆位' : '正位';
        text += `【${card.name}】${orient}\n此牌暗示着内在的智慧与成长。请结合你的直觉来理解。\n\n`;
    });
    return { success: true, reading: text, isFallback: true };
}

// ============================================
// 辅助 UI 函数
// ============================================
function buildCardInfoHTML(cards) {
    let html = '';
    cards.forEach((card) => {
        const orientation = card.isReversed ? '逆位' : '正位';
        const cls = card.isReversed ? 'reversed' : 'upright';
        const icon = card.isReversed ? '⬇️' : '⬆️';
        html += `
            <div class="card-item">
                <span class="card-name">${card.name}</span>
                <span class="card-en">${card.nameEn}</span>
                <span class="orientation ${cls}">${icon} ${orientation}</span>
            </div>
        `;
    });
    return html;
}

function toggleCardFlip(index) {
    const slot = document.querySelector(`.card-slot[data-index="${index}"]`);
    if (slot) slot.classList.toggle('flipped');
}

function resetAll() {
    currentCards = [];
    renderSpread([]);
    document.getElementById('readingResult').innerHTML = `<p class="placeholder-text">点击「抽牌」开始你的占卜之旅...</p>`;
}

// ============================================
// 打字机效果类（不变，保留原有实现）
// ============================================
class Typewriter {
    constructor(element, options = {}) {
        this.element = element;
        this.speed = options.speed || 20;
        this.callback = options.onComplete || null;
        this.renderFn = options.renderFn || null;
        this.isRunning = false;
        this.isPaused = false;
        this.fullContent = '';
        this.displayedContent = '';
        this.charIndex = 0;
        this.timer = null;
        this.isFinished = false;
    }

    updateContent(newFullContent) {
        if (newFullContent.length < this.fullContent.length) return;
        if (newFullContent === this.fullContent) return;
        this.fullContent = newFullContent;
        if (this.isFinished) {
            this.isFinished = false;
            this.isRunning = true;
            this.typeNextChar();
            return;
        }
        if (!this.isRunning && !this.isPaused) {
            this.isRunning = true;
            this.typeNextChar();
        }
    }

    start(content) {
        this.stop();
        this.fullContent = content;
        this.displayedContent = '';
        this.charIndex = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.isFinished = false;
        this.element.innerHTML = '';
        this.typeNextChar();
    }

    typeNextChar() {
        if (!this.isRunning || this.isPaused) return;
        if (this.charIndex >= this.fullContent.length) {
            this.isRunning = false;
            this.isFinished = true;
            if (this.callback) this.callback();
            return;
        }
        const charsToAdd = 3;
        let endIndex = Math.min(this.charIndex + charsToAdd, this.fullContent.length);
        const chunk = this.fullContent.substring(this.charIndex, endIndex);
        this.displayedContent += chunk;
        this.charIndex = endIndex;

        if (this.renderFn) {
            this.element.innerHTML = this.renderFn(this.displayedContent);
        } else {
            this.element.textContent = this.displayedContent;
        }
        this.element.scrollTop = this.element.scrollHeight;

        const delay = this.calculateDelay(chunk);
        this.timer = setTimeout(() => this.typeNextChar(), delay);
    }

    calculateDelay(chunk) {
        const base = this.speed;
        if (chunk.includes('\n')) return base * 3;
        if (/[，。！？、；：""''（）]/.test(chunk)) return base * 2;
        return base * (0.5 + Math.random() * 0.5);
    }

    pause() {
        this.isPaused = true;
        if (this.timer) { clearTimeout(this.timer);
            this.timer = null; }
    }

    resume() {
        if (this.isPaused && this.isRunning) {
            this.isPaused = false;
            this.typeNextChar();
        }
    }

    finish() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.timer) clearTimeout(this.timer);
        this.displayedContent = this.fullContent;
        if (this.renderFn) {
            this.element.innerHTML = this.renderFn(this.fullContent);
        } else {
            this.element.textContent = this.fullContent;
        }
        this.charIndex = this.fullContent.length;
        this.isFinished = true;
        if (this.callback) this.callback();
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.timer) { clearTimeout(this.timer);
            this.timer = null; }
    }

    reset() {
        this.stop();
        this.fullContent = '';
        this.displayedContent = '';
        this.charIndex = 0;
        this.isFinished = false;
        this.element.innerHTML = '';
    }
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initSpreadOptions();
    renderSpread([]);
    document.getElementById('readingResult').innerHTML = `<p class="placeholder-text">选择牌阵，输入问题后点击「抽牌」</p>`;
    console.log('🔮 塔罗占卜已加载 (多牌阵版)');
    console.log(`📚 共 ${TAROT_DECK.length} 张牌，${Object.keys(SPREADS).length} 种牌阵`);
});