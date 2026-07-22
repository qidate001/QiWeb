/**
 * tarot.js - 塔罗占卜核心逻辑 + AI 解读
 * 支持 Cloudflare Worker 代理调用 DeepSeek API
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
// AI 解读配置
// ============================================
const AI_CONFIG = {
    WORKER_URL: 'https://tarot-api.qidate001.workers.dev',
    ENABLE_AI: true,
    FALLBACK_DATA: '/data/tarot-readings.json',
    TYPING_SPEED: 20, // 打字速度（毫秒/字符）
};

// ============================================
// 打字机效果类
// ============================================
class Typewriter {
    constructor(element, options = {}) {
        this.element = element;
        this.speed = options.speed || AI_CONFIG.TYPING_SPEED;
        this.callback = options.onComplete || null;
        this.isRunning = false;
        this.isPaused = false;
        this.content = '';
        this.displayContent = '';
        this.charIndex = 0;
        this.timer = null;
        
        // 存储需要渲染的 Markdown 缓存
        this.rawContent = '';
        this.renderFn = options.renderFn || null;
    }

    /**
     * 开始打字效果
     */
    start(content) {
        if (this.isRunning) {
            this.stop();
        }
        
        this.content = content;
        this.rawContent = content;
        this.charIndex = 0;
        this.displayContent = '';
        this.element.innerHTML = '';
        this.isRunning = true;
        this.isPaused = false;
        
        this.typeNextChar();
    }

    /**
     * 输入下一个字符
     */
    typeNextChar() {
        if (!this.isRunning || this.isPaused) {
            return;
        }

        if (this.charIndex >= this.content.length) {
            this.isRunning = false;
            if (this.callback) {
                this.callback();
            }
            return;
        }

        // 一次添加多个字符以提高效率（但保持流畅感）
        const charsToAdd = 3;
        let endIndex = Math.min(this.charIndex + charsToAdd, this.content.length);
        
        // 如果遇到换行符，一次性添加整行
        let nextNewline = this.content.indexOf('\n', this.charIndex);
        if (nextNewline !== -1 && nextNewline - this.charIndex < 20) {
            endIndex = nextNewline + 1;
        }

        const chunk = this.content.substring(this.charIndex, endIndex);
        this.displayContent += chunk;
        this.charIndex = endIndex;

        // 渲染 Markdown（如果提供了渲染函数）
        if (this.renderFn) {
            try {
                this.element.innerHTML = this.renderFn(this.displayContent);
            } catch (e) {
                this.element.textContent = this.displayContent;
            }
        } else {
            this.element.textContent = this.displayContent;
        }

        // 滚动到底部
        this.element.scrollTop = this.element.scrollHeight;

        // 计算下一个字符的延迟（动态速度，让阅读更自然）
        const delay = this.calculateDelay(chunk);
        this.timer = setTimeout(() => {
            this.typeNextChar();
        }, delay);
    }

    /**
     * 计算动态延迟
     */
    calculateDelay(chunk) {
        const baseSpeed = this.speed;
        
        // 如果 chunk 包含换行，稍微停顿
        if (chunk.includes('\n')) {
            return baseSpeed * 3;
        }
        
        // 如果 chunk 包含标点符号，稍微停顿
        if (/[，。！？、；：""''（）]/.test(chunk)) {
            return baseSpeed * 2;
        }
        
        // 随机变化，让打字更自然
        const randomFactor = 0.5 + Math.random() * 0.5;
        return baseSpeed * randomFactor;
    }

    /**
     * 暂停打字
     */
    pause() {
        this.isPaused = true;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    /**
     * 继续打字
     */
    resume() {
        if (this.isPaused && this.isRunning) {
            this.isPaused = false;
            this.typeNextChar();
        }
    }

    /**
     * 立即完成（跳转到最后）
     */
    finish() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        if (this.renderFn) {
            try {
                this.element.innerHTML = this.renderFn(this.content);
            } catch (e) {
                this.element.textContent = this.content;
            }
        } else {
            this.element.textContent = this.content;
        }
        
        if (this.callback) {
            this.callback();
        }
    }

    /**
     * 停止打字
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    /**
     * 重置
     */
    reset() {
        this.stop();
        this.content = '';
        this.displayContent = '';
        this.charIndex = 0;
        this.element.innerHTML = '';
    }
}

// ============================================
// AI 解读功能（支持SSE流式）
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
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 解码并添加到缓冲区
            buffer += decoder.decode(value, { stream: true });
            
            // 按行分割
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后不完整的行

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                
                // 只处理 data: 开头的行
                if (trimmedLine.startsWith('data: ')) {
                    const dataStr = trimmedLine.slice(6); // 去掉 "data: "
                    
                    // 跳过 [DONE]
                    if (dataStr === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(dataStr);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullContent += content;
                            if (onChunk) {
                                onChunk(content, fullContent);
                            }
                        }
                    } catch (e) {
                        // 如果解析失败，可能是格式问题，忽略
                        console.debug('解析 SSE 数据失败:', dataStr);
                    }
                }
            }
        }

        // 处理剩余的 buffer
        if (buffer.trim()) {
            const trimmedLine = buffer.trim();
            if (trimmedLine.startsWith('data: ')) {
                const dataStr = trimmedLine.slice(6);
                if (dataStr !== '[DONE]') {
                    try {
                        const parsed = JSON.parse(dataStr);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullContent += content;
                            if (onChunk) {
                                onChunk(content, fullContent);
                            }
                        }
                    } catch (e) {
                        // 忽略
                    }
                }
            }
        }

        const result = {
            success: true,
            reading: fullContent,
            cards: cards,
            timestamp: new Date().toISOString(),
        };

        if (onComplete) onComplete(result);
        return result;

    } catch (error) {
        console.error('AI 解读失败:', error);
        const fallback = await getFallbackReading(cards);
        if (onComplete) onComplete(fallback);
        return fallback;
    }
}

/**
 * 降级方案：使用预生成数据
 */
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
// 配置
// ============================================
const CONFIG = {
    IMG_BASE: '/images/tarot_cards/',
    BACK_IMG: '/images/tarot_cards/_.png',
    REVERSED_PROBABILITY: 0.5,
    FLIP_DELAY_BASE: 300,
    FLIP_DELAY_STEP: 200,
};

// ============================================
// 状态
// ============================================
let currentCards = [];

// ============================================
// 工具函数
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
// AI 解读功能
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
// 渲染函数
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
// 交互函数
// ============================================

async function drawCards(count = 3) {
    if (count < 1) count = 1;
    if (count > 10) count = 10;
    
    const cards = drawRandomCards(count);
    renderCards(cards);
    
    // 准备解读容器
    const resultDiv = document.getElementById('readingResult');
    const cardInfo = buildCardInfoHTML(cards);
    
    // 显示加载状态和牌面信息
    resultDiv.innerHTML = `
        <h3>🔮 AI 塔罗解读</h3>
        <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,215,0,0.05); border-radius: 10px;">
            ${cardInfo}
        </div>
        <div class="markdown-body" id="typewriter-content" style="color: #d8c8e0; line-height: 1.8; font-size: 0.95rem; min-height: 100px; max-height: 600px; overflow-y: auto; padding: 10px;">
            <span style="color: #6a5a7a;">✨ AI 正在思考中...</span>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,215,0,0.08); color: #6a5a7a; font-size: 0.8rem; text-align: right;">
            <span id="typing-status">⏳ 正在连接 AI...</span>
        </div>
    `;
    
    const contentDiv = document.getElementById('typewriter-content');
    const statusSpan = document.getElementById('typing-status');
    
    // 创建打字机实例
    let typewriter = null;
    let fullContent = '';
    
    try {
        // 调用流式 API
        const result = await getAIReading(
            cards, 
            '',
            // onChunk: 每收到一个 chunk 就更新
            (chunk, accumulated) => {
                fullContent = accumulated;
                if (!typewriter) {
                    // 首次收到内容，初始化打字机
                    typewriter = new Typewriter(contentDiv, {
                        speed: AI_CONFIG.TYPING_SPEED,
                        renderFn: (text) => {
                            try {
                                if (typeof marked !== 'undefined') {
                                    return marked.parse(text);
                                }
                                return text.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<br>').join('');
                            } catch (e) {
                                return text;
                            }
                        },
                        onComplete: () => {
                            statusSpan.textContent = '✅ 解读完成';
                            statusSpan.style.color = '#69f0ae';
                        }
                    });
                }
                
                // 如果打字机还没开始，或者已经完成，重新开始
                if (!typewriter.isRunning) {
                    typewriter.start(fullContent);
                }
                statusSpan.textContent = `✍️ 正在书写... (${fullContent.length} 字符)`;
            },
            // onComplete: 流式完成
            (result) => {
                if (!typewriter) {
                    // 如果没有打字机（极少情况），直接显示
                    try {
                        contentDiv.innerHTML = marked.parse(fullContent || result.reading);
                    } catch (e) {
                        contentDiv.textContent = fullContent || result.reading;
                    }
                    statusSpan.textContent = '✅ 解读完成';
                    statusSpan.style.color = '#69f0ae';
                }
            }
        );
        
        // 如果 result 已经有内容但没触发流式（fallback 情况）
        if (result && result.reading && !fullContent) {
            fullContent = result.reading;
            typewriter = new Typewriter(contentDiv, {
                speed: AI_CONFIG.TYPING_SPEED,
                renderFn: (text) => {
                    try {
                        if (typeof marked !== 'undefined') {
                            return marked.parse(text);
                        }
                        return text.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<br>').join('');
                    } catch (e) {
                        return text;
                    }
                },
                onComplete: () => {
                    statusSpan.textContent = '✅ 解读完成';
                    statusSpan.style.color = '#69f0ae';
                }
            });
            typewriter.start(fullContent);
        }
        
    } catch (error) {
        console.error('解读出错:', error);
        contentDiv.innerHTML = `
            <div style="color: #ff7a7a; padding: 20px; background: rgba(255,0,0,0.1); border-radius: 8px;">
                ⚠️ 解读生成失败，请稍后重试
                <br><small style="color: #6a5a7a;">${error.message || ''}</small>
            </div>
        `;
        statusSpan.textContent = '❌ 生成失败';
        statusSpan.style.color = '#ff7a7a';
    }
}

/**
 * 构建牌面信息 HTML
 */
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
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    renderCards([]);
    console.log('🔮 塔罗占卜已加载');
    console.log(`📚 共 ${TAROT_DECK.length} 张牌`);
    console.log('🤖 AI 解读已启用:', AI_CONFIG.ENABLE_AI);
});