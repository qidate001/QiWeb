/**
 * tarot.js - 塔罗占卜核心逻辑
 */

// ============================================
// 简易 Markdown 解析器（降级方案）
// ============================================
function simpleMarkdown(text) {
    if (!text) return '';
    // 转义 HTML 特殊字符（防止注入）
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // 粗体 **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // 斜体 *text* 或 _text_
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    // 行内代码 `code`
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    // 换行（保留段落）
    html = html.replace(/\n/g, '<br>');
    // 简单的标题（可选）
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    return html;
}

// ============================================
// 状态
// ============================================
let currentCards = [];

// 当前选中的牌阵 ID
let currentSpreadId = 'three'; // 默认三牌

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

    // ---- 定义渲染函数（支持降级） ----
    const renderMarkdown = (text) => {
        try {
            if (typeof marked !== 'undefined') {
                return marked.parse(text);
            }
            // 降级：使用简易解析
            return simpleMarkdown(text);
        } catch (e) {
            console.warn('Markdown 解析失败，使用简易解析:', e);
            return simpleMarkdown(text);
        }
    };

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
                        renderFn: renderMarkdown,
                        onComplete: () => {
                            statusSpan.textContent = '✅ 解读完成';
                            statusSpan.style.color = '#69f0ae';
                            // 完成时再强制渲染一次，确保完整内容正确
                            if (typewriter) {
                                const finalText = typewriter.fullContent;
                                contentDiv.innerHTML = renderMarkdown(finalText);
                            }
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
                        renderFn: renderMarkdown,
                        onComplete: () => {
                            statusSpan.textContent = '✅ 解读完成';
                            statusSpan.style.color = '#69f0ae';
                            // 完成时再强制渲染一次，确保完整内容正确
                            if (typewriter) {
                                const finalText = typewriter.fullContent;
                                contentDiv.innerHTML = renderMarkdown(finalText);
                            }
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

    const spread = SPREADS[currentSpreadId];

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
                spreadDescription: spread.description,
                positions: spread.positions,
                spreadId: currentSpreadId,
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

/**
 * 获取牌的降级含义（如果没有定义则返回通用）
 */
function getCardMeaning(card) {
    const meaning = FALLBACK_MEANINGS[card.id];
    if (!meaning) {
        // 未定义的小阿尔卡纳通用含义
        return {
            upright: '成长、机遇、平衡',
            reversed: '阻碍、延迟、需要反思'
        };
    }
    return meaning;
}

// ============================================
// 降级解读
// ============================================
async function getFallbackReading(cards) {
    // 获取当前牌阵信息
    const spread = SPREADS[currentSpreadId];
    const positions = spread.positions || [];

    let text = '📖 塔罗降级解读（AI 服务暂时不可用，以下为预置牌意）：\n\n';
    text += `您选择了「${spread.label}」，共 ${cards.length} 张牌。\n\n`;

    cards.forEach((card, index) => {
        const meaning = getCardMeaning(card);
        const orientation = card.isReversed ? '逆位' : '正位';
        const meaningText = card.isReversed ? meaning.reversed : meaning.upright;

        // 获取位置标签（如果有）
        const posLabel = positions[index]?.label || `位置 ${index + 1}`;
        text += `【${posLabel}】 ${card.name}（${card.nameEn}）— ${orientation}\n`;
        text += `  核心含义：${meaningText}\n`;
        text += `  提示：结合你目前的情况，这张牌在 ${posLabel} 的位置上，暗示着你需要关注此方面的能量流动。\n\n`;
    });

    // 添加整体总结（根据牌的数量和正逆位比例简单总结）
    const reversedCount = cards.filter(c => c.isReversed).length;
    const total = cards.length;
    let summary = '';
    if (reversedCount === 0) {
        summary = '所有牌均为正位，整体能量较为顺畅，发展态势积极。';
    } else if (reversedCount === total) {
        summary = '所有牌均为逆位，提示你可能面临较多阻碍，需要重新审视方向。';
    } else {
        summary = `有 ${reversedCount} 张逆位牌，建议关注这些位置的挑战，正位牌则为你提供支持。`;
    }
    text += `✨ 整体总结：${summary}\n\n`;
    text += '⚠️ 注意：此为降级解读，仅供参考。建议在 AI 恢复后重新抽牌以获得更深入的解析。';

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