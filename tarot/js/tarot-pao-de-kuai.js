// ============================================================
//  牌组定义
// ============================================================
const SUITS = [
    { id: 'W', name: '权杖', element: '🔥', suit: '♣', color: 'black' },
    { id: 'C', name: '圣杯', element: '💧', suit: '♥', color: 'red' },
    { id: 'S', name: '宝剑', element: '💨', suit: '♠', color: 'black' },
    { id: 'P', name: '星币', element: '🌍', suit: '♦', color: 'red' }
];

// 定义牌面：rank 用于比大小，imgId 用于图片名称
const RANKS = [
    { rank: 3, label: '3', imgId: '3' },
    { rank: 4, label: '4', imgId: '4' },
    { rank: 5, label: '5', imgId: '5' },
    { rank: 6, label: '6', imgId: '6' },
    { rank: 7, label: '7', imgId: '7' },
    { rank: 8, label: '8', imgId: '8' },
    { rank: 9, label: '9', imgId: '9' },
    { rank: 10, label: '10', imgId: '10' },
    { rank: 11, label: '侍从', imgId: '侍从' },
    { rank: 12, label: '骑士', imgId: '骑士' },   // 原 J
    { rank: 13, label: '皇后', imgId: '皇后' },   // 原 Q
    { rank: 14, label: '国王', imgId: '国王' },   // 原 K
    { rank: 15, label: 'A', imgId: '1' },      // Ace
    { rank: 16, label: '2', imgId: '2' }
];

// 大阿卡纳（排除愚者 0 和世界 21）
const MAJOR_ARCANA = [
    { id: '1', name: '魔术师' },
    { id: '2', name: '女祭司' },
    { id: '3', name: '皇后' },
    { id: '4', name: '皇帝' },
    { id: '5', name: '教皇' },
    { id: '6', name: '恋人' },
    { id: '7', name: '战车' },
    { id: '8', name: '力量' },
    { id: '9', name: '隐者' },
    { id: '10', name: '命运之轮' },
    { id: '11', name: '正义' },
    { id: '12', name: '倒吊人' },
    { id: '13', name: '死神' },
    { id: '14', name: '节制' },
    { id: '15', name: '恶魔' },
    { id: '16', name: '高塔' },
    { id: '17', name: '星星' },
    { id: '18', name: '月亮' },
    { id: '19', name: '太阳' },
    { id: '20', name: '审判' }
];

const CARD_EFFECTS = {
    '10': {  // 命运之轮
        past: { positive: 'reshuffle', negative: 'force_3' },
        future: { positive: 'high_weights', negative: 'gamble' }
    }
};

// 图片路径
const IMG_BASE = './images/tarot_cards/';
const BACK_IMG = './images/tarot_cards/_.png';

function buildDeck() {
    const deck = [];
    SUITS.forEach(suit => {
        RANKS.forEach(r => {
            // 构建 id：花色 + imgId（如 W骑士、C1、S10）
            const id = suit.id + r.imgId;
            deck.push({
                id: id,
                suit: suit,
                rank: r.rank,
                label: r.label,
                name: suit.name + r.label,
                element: suit.element,
                suitSymbol: suit.suit,
                color: suit.color,
                isJoker: false
            });
        });
    });
    // 愚者和世界（图片名 0.png 和 21.png）
    deck.push({ id: '0', suit: null, rank: 17, label: '愚者', name: '愚者', element: '🎭', suitSymbol: '🃏', color: 'black', isJoker: true, jokerType: 'small' });
    deck.push({ id: '21', suit: null, rank: 18, label: '世界', name: '世界', element: '🌌', suitSymbol: '🃏', color: 'red', isJoker: true, jokerType: 'big' });
    return deck;
}

// 从大阿卡纳中抽三张不重复的牌，随机正逆位
function drawTarotCards() {
    const shuffled = [...MAJOR_ARCANA];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, 3);
    return selected.map(card => ({
        ...card,
        reversed: Math.random() < 0.5
    }));
}

// ============================================================
//  游戏逻辑（跑得快）
// ============================================================
class Game {
    constructor() { this.reset(); }
    reset() {
        this.deck = [];
        this.myHand = [];
        this.oppHand = [];
        this.currentPlay = null;
        this.currentPlayer = null; // 'me' 或 'opp'
        this.lastPlay = null;      // 上一手牌型
        this.lastPlayer = null;    // 上一手出牌者 'me' 或 'opp'
        this.gameOver = false;
        this.isMyTurn = false;
        this.isDealing = false;
        this.selectedIndices = [];
    }
    shuffle() {
        const d = buildDeck();
        for (let i = d.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [d[i], d[j]] = [d[j], d[i]];
        }
        this.deck = d;
    }
    deal() {
        this.myHand = [];
        this.oppHand = [];
        for (let i = 0; i < 16; i++) {
            this.myHand.push(this.deck.pop());
            this.oppHand.push(this.deck.pop());
        }
        this.myHand.sort((a, b) => a.rank - b.rank);
        this.oppHand.sort((a, b) => a.rank - b.rank);
    }
    static getPlayType(cards) {
        if (!cards || cards.length === 0) return null;
        const n = cards.length;
        const ranks = cards.map(c => c.rank).sort((a, b) => a - b);
        const rankCount = {};
        ranks.forEach(r => rankCount[r] = (rankCount[r] || 0) + 1);
        const counts = Object.values(rankCount);
        const uniqueRanks = Object.keys(rankCount).map(Number).sort((a, b) => a - b);

        // --- 单张 ---
        if (n === 1) return { type: 'single', rank: ranks[0], size: 1 };
        // --- 对子 ---
        if (n === 2 && counts.length === 1 && counts[0] === 2) return { type: 'pair', rank: ranks[0], size: 2 };
        // --- 三张 ---
        if (n === 3 && counts.length === 1 && counts[0] === 3) return { type: 'triple', rank: ranks[0], size: 3 };
        // --- 三带一 ---
        if (n === 4) {
            const three = Object.keys(rankCount).find(r => rankCount[r] === 3);
            const one = Object.keys(rankCount).find(r => rankCount[r] === 1);
            if (three && one) return { type: 'triple_one', rank: Number(three), size: 4 };
        }
        // --- 三带二 ---
        if (n === 5) {
            const three = Object.keys(rankCount).find(r => rankCount[r] === 3);
            const two = Object.keys(rankCount).find(r => rankCount[r] === 2);
            if (three && two) return { type: 'triple_two', rank: Number(three), size: 5 };
        }
        // --- 四带一 ---
        if (n === 5) {
            const four = Object.keys(rankCount).find(r => rankCount[r] === 4);
            const one = Object.keys(rankCount).find(r => rankCount[r] === 1);
            if (four && one) return { type: 'four_one', rank: Number(four), size: 5 };
        }
        // --- 炸弹 (四张相同) ---
        if (n === 4 && counts.length === 1 && counts[0] === 4) {
            return { type: 'bomb', rank: ranks[0], size: 4 };
        }
        // --- 鬼牌炸弹 ---
        if (n === 2 && cards.every(c => c.isJoker)) {
            return { type: 'joker_bomb', rank: 18, size: 2 };
        }
        // --- 姊妹对 (连续对子，至少2对，不含鬼牌) ---
        if (n >= 4 && n % 2 === 0 && counts.every(c => c === 2)) {
            const sorted = uniqueRanks;
            const allValid = sorted.every(r => r >= 3 && r <= 16); // 允许2参与
            if (allValid && sorted.length >= 2 && sorted[sorted.length - 1] - sorted[0] === sorted.length - 1) {
                return { type: 'pair_straight', rank: sorted[0], size: n };
            }
        }
        // --- 顺子 (至少5张，不包含鬼牌) ---
        if (n >= 5 && n <= 12 && counts.every(c => c === 1)) {
            const noJoker = ranks.every(r => r <= 16);
            if (noJoker) {
                let sorted = uniqueRanks.slice();
                let valid = false;
                let resultRank = null;

                // 情况1：标准顺子 3~15（不含2）
                const range1 = sorted.every(r => r >= 3 && r <= 15);
                if (range1 && sorted.length >= 5 && sorted[sorted.length - 1] - sorted[0] === sorted.length - 1) {
                    valid = true;
                    resultRank = sorted[0];
                }

                // 情况2：特殊顺子，允许 A→1，2→2
                if (!valid) {
                    let newRanks = sorted.map(r => {
                        if (r === 15) return 1;   // A→1
                        if (r === 16) return 2;   // 2→2
                        return r;
                    });
                    newRanks.sort((a, b) => a - b);
                    // 检查是否连续
                    let isConsecutive = true;
                    for (let i = 1; i < newRanks.length; i++) {
                        if (newRanks[i] - newRanks[i - 1] !== 1) {
                            isConsecutive = false;
                            break;
                        }
                    }
                    if (isConsecutive && newRanks.length >= 5 && newRanks[0] >= 1) {
                        valid = true;
                        resultRank = newRanks[0]; // 最小牌（可能是1代表A）
                    }
                }

                if (valid) {
                    return { type: 'straight', rank: resultRank, size: n };
                }
            }
        }
        return null;
    }
    static canBeat(play1, play2) {
        if (!play1) return false;
        if (!play2) return true;
        if (play1.type === 'joker_bomb') return true;
        if (play2.type === 'joker_bomb') return false;
        if (play1.type === 'bomb' && play2.type !== 'bomb') return true;
        if (play2.type === 'bomb' && play1.type !== 'bomb') return false;
        if (play1.type !== play2.type) return false;
        if (play1.size !== play2.size) return false;
        return play1.rank > play2.rank;
    }
    checkPlay(cards, lastPlay, lastPlayer, isMyTurn) {
        if (!isMyTurn) return { valid: false, reason: '不是你的回合' };
        if (cards.length === 0) return { valid: false, reason: '请选择至少一张牌' };
        const type = Game.getPlayType(cards);
        if (!type) return { valid: false, reason: '无效牌型' };
        // 如果有上一手牌且不是自己出的，必须打过
        if (lastPlay && lastPlayer !== null && lastPlayer !== 'me') {
            if (!Game.canBeat(type, lastPlay)) return { valid: false, reason: '打不过上一手' };
        }
        return { valid: true, type: type };
    }
    getSelectedCards() {
        return this.selectedIndices.map(i => this.myHand[i]);
    }
    dealWithWeight(myWeight, oppWeight, myRandomness = 1.0, oppRandomness = 1.0) {
        this.myHand = [];
        this.oppHand = [];

        let deck = buildDeck();
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        const getCardValue = (card) => {
            if (card.isJoker) return card.rank; // 17,18
            return card.rank;
        };

        const drawWeighted = (weight, randomness) => {
            if (deck.length === 0) return null;
            // 对每张牌的价值加入随机扰动
            const scored = deck.map(card => {
                const base = getCardValue(card);
                // 扰动范围：1 ± (randomness - 1) * 0.5
                const factor = 1 + (Math.random() - 0.5) * (randomness - 0.8) * 2;
                const adjusted = base * factor * weight;
                return { card, score: adjusted };
            });
            scored.sort((a, b) => b.score - a.score);
            const poolSize = Math.max(1, Math.floor(scored.length * Math.min(1, 1.0 / (weight * 0.8 + 0.2))));
            const idx = Math.floor(Math.random() * Math.min(poolSize, scored.length));
            const chosen = scored[idx].card;
            const deckIdx = deck.indexOf(chosen);
            if (deckIdx > -1) deck.splice(deckIdx, 1);
            return chosen;
        };

        for (let i = 0; i < 16; i++) {
            const myCard = drawWeighted(myWeight || 1.0, myRandomness || 1.0);
            const oppCard = drawWeighted(oppWeight || 1.0, oppRandomness || 1.0);
            if (myCard) this.myHand.push(myCard);
            if (oppCard) this.oppHand.push(oppCard);
        }

        this.myHand.sort((a, b) => a.rank - b.rank);
        this.oppHand.sort((a, b) => a.rank - b.rank);
        this.deck = deck;  // 保存剩余未发的牌
    }
}

// ============================================================
//  UI 控制
// ============================================================
const game = new Game();
let peer = null;
let conn = null;
let isHost = false;
let myPeerId = '';
let isConnected = false;
let nextFirstPlayer = ''; // 'me' 或 'opp'，用于下一局先手
let nextRoundTarotEffect = null; // 存储未来塔罗牌效果，格式：{ cardId, reversed, player: 'me'|'opp' }
let nextRoundRandomness = 1.0; // 默认 1.0（正常）
let currentRandomness = 1.0;   // 当前局用
let round = 1;
let myWins = 0,
    oppWins = 0;

// DOM 引用
const myHandEl = document.getElementById('myHand');
const oppHandEl = document.getElementById('oppHand');
const playCardsEl = document.getElementById('playCards');
const playInfoEl = document.getElementById('playInfo');
const myCountEl = document.getElementById('myCount');
const oppCountEl = document.getElementById('oppCount');
const messageEl = document.getElementById('gameMessage');
const myWinsEl = document.getElementById('myWins');
const oppWinsEl = document.getElementById('oppWins');
const roundInfoEl = document.getElementById('roundInfo');
const playBtn = document.getElementById('playBtn');
const passBtn = document.getElementById('passBtn');
const resetBtn = document.getElementById('resetBtn');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const peerIdInput = document.getElementById('peerIdInput');
const myPeerIdDisplay = document.getElementById('myPeerIdDisplay');

// 渲染卡牌
function renderCard(card, faceUp = true, selected = false) {
    const slot = document.createElement('div');
    slot.className = 'card-slot' + (faceUp ? ' flipped' : '') + (selected ? ' selected' : '');
    const inner = document.createElement('div');
    inner.className = 'card-inner';

    // 背面
    const back = document.createElement('div');
    back.className = 'card-back';
    const backImg = document.createElement('img');
    backImg.src = BACK_IMG;
    backImg.alt = '牌背';
    backImg.loading = 'lazy';
    back.appendChild(backImg);
    inner.appendChild(back);

    // 正面
    const front = document.createElement('div');
    front.className = 'card-front';
    const img = document.createElement('img');
    img.src = `${IMG_BASE}${card.id}.png`;
    img.alt = card.name;
    img.loading = 'lazy';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.onerror = function () {
        this.style.display = 'none';
        const span = document.createElement('span');
        span.textContent = card.name;
        span.style.color = '#ffd700';
        span.style.fontSize = '1.2rem';
        front.appendChild(span);
    };
    front.appendChild(img);

    // 在图片下方显示牌名
    const nameLabel = document.createElement('div');
    nameLabel.className = 'card-name-label';
    nameLabel.textContent = card.name;
    front.appendChild(nameLabel);

    inner.appendChild(front);
    slot.appendChild(inner);
    return slot;
}

function renderMyHand(animate = false) {

    myHandEl.innerHTML = '';
    const fragments = [];

    
    

    game.myHand.forEach((card, idx) => {
        const el = renderCard(card, true, game.selectedIndices.includes(idx));

        el.addEventListener('click', () => {
            if (game.isDealing || !game.isMyTurn || game.gameOver || !isConnected) return;
            const idx2 = game.selectedIndices.indexOf(idx);
            if (idx2 > -1) {
                game.selectedIndices.splice(idx2, 1);
            } else {
                game.selectedIndices.push(idx);
            }
            renderMyHand(); // 重新渲染
            // console.log('选中索引:', game.selectedIndices);
        });
        // 先隐藏
        el.style.opacity = '0';
        el.style.transition = 'none';
        myHandEl.appendChild(el);
        fragments.push({ el, idx, card });
    });

    myCountEl.textContent = game.myHand.length;

    if (!animate) {
        // 直接显示
        fragments.forEach(({ el }) => { el.style.opacity = '1'; });
        return;
    }

    // 获取牌桌中心（也可以指定位置）
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 等待布局稳定后获取每张牌的最终位置
    requestAnimationFrame(() => {
        const rects = fragments.map(({ el }) => el.getBoundingClientRect());

        fragments.forEach(({ el, idx }, i) => {
            const finalRect = rects[i];
            const startX = centerX - finalRect.width / 2;
            const startY = centerY - finalRect.height / 2;

            // 设置起始位置（相对于最终位置偏移）
            const dx = startX - finalRect.left;
            const dy = startY - finalRect.top;
            const rotation = (Math.random() - 0.5) * 60;
            const scale = 0.3 + Math.random() * 0.3;

            // 设置起始 transform
            el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}) rotate(${rotation}deg)`;
            el.style.opacity = '0';
            // 强制回流
            void el.offsetHeight;

            // 开始过渡到最终位置
            el.style.transition = `transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease`;
            el.style.transitionDelay = `${i * 0.08}s`;
            el.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
            el.style.opacity = '1';
        });

        // 动画结束后清理过渡（避免影响后续交互）
        const totalDelay = fragments.length * 0.08 + 0.8;
        setTimeout(() => {
            fragments.forEach(({ el }) => {
                el.style.transition = '';
                el.style.transitionDelay = '';
                el.style.transform = '';
                // 确保可见
                el.style.opacity = '1';
            });
        }, totalDelay * 1000);
    });
}

function renderOppHand(animate = false) {
    oppHandEl.innerHTML = '';
    const fragments = [];

    game.oppHand.forEach((card, idx) => {
        const el = renderCard(card, false); // 背面
        el.style.opacity = '0';
        el.style.transition = 'none';
        oppHandEl.appendChild(el);
        fragments.push({ el, idx });
    });

    oppCountEl.textContent = game.oppHand.length;

    if (!animate) {
        fragments.forEach(({ el }) => { el.style.opacity = '1'; });
        return;
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    requestAnimationFrame(() => {
        const rects = fragments.map(({ el }) => el.getBoundingClientRect());

        fragments.forEach(({ el, idx }, i) => {
            const finalRect = rects[i];
            const startX = centerX - finalRect.width / 2;
            const startY = centerY - finalRect.height / 2;

            const dx = startX - finalRect.left;
            const dy = startY - finalRect.top;
            const rotation = (Math.random() - 0.5) * 60;
            const scale = 0.3 + Math.random() * 0.3;

            el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}) rotate(${rotation}deg)`;
            el.style.opacity = '0';
            void el.offsetHeight;

            el.style.transition = `transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease`;
            el.style.transitionDelay = `${i * 0.08}s`;
            el.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
            el.style.opacity = '1';
        });

        const totalDelay = fragments.length * 0.08 + 0.8;
        setTimeout(() => {
            fragments.forEach(({ el }) => {
                el.style.transition = '';
                el.style.transitionDelay = '';
                el.style.transform = '';
                el.style.opacity = '1';
            });
        }, totalDelay * 1000);
    });
}

function renderPlay(cards, info, playType) {
    // 重新获取元素，确保不为 null
    const playCardsContainer = document.getElementById('playCards');
    const playInfoContainer = document.getElementById('playInfo');

    if (!playCardsContainer) {
        console.error('playCards element not found');
        return;
    }

    playCardsContainer.innerHTML = '';
    if (cards && cards.length > 0) {
        cards.forEach(c => {
            const el = renderCard(c, true, false);
            el.style.cursor = 'default';
            playCardsContainer.appendChild(el);
        });
    }

    let typeName = '';
    if (playType) {
        const typeMap = {
            single: '单张',
            pair: '对子',
            straight: '顺子',
            pair_straight: '姊妹对',
            triple: '三条',
            triple_one: '三带一',
            triple_two: '三带二',
            four_one: '四带一',
            bomb: '炸弹',
            joker_bomb: '鬼牌炸弹'
        };
        typeName = typeMap[playType.type] || '';
    }

    if (playInfoContainer) {
        playInfoContainer.textContent = (info || '') + (typeName ? ' (' + typeName + ')' : '');
    }
}

function updateUI(animate = false) {
    renderMyHand(animate);
    renderOppHand(animate);
    myWinsEl.textContent = myWins;
    oppWinsEl.textContent = oppWins;
    roundInfoEl.textContent = `第 ${round} 局`;
    playBtn.disabled = !game.isMyTurn || game.gameOver || !isConnected || game.isDealing;
    const canPass = game.isMyTurn && !game.gameOver && isConnected && game.lastPlay && game.lastPlayer !== 'me';
    passBtn.disabled = !canPass || game.isDealing;
}

function setMessage(msg, type = 'info', flashType = null) {
    messageEl.textContent = msg;
    messageEl.style.borderLeftColor = type === 'win' ? '#69f0ae' : type === 'lose' ? '#ff7a7a' : '#ffd700';
    // 移除之前的闪动类
    messageEl.classList.remove('flash-play', 'flash-pass');
    if (flashType) {
        messageEl.classList.add('flash-' + flashType);
        // 动画结束后自动移除类（防止累积）
        setTimeout(() => {
            messageEl.classList.remove('flash-' + flashType);
        }, 1600);
    }
}

function renderTarot() {
    const oppContainer = document.getElementById('oppTarot');
    const myContainer = document.getElementById('myTarot');
    if (!oppContainer || !myContainer) {
        console.warn('Tarot containers not found');
        return;
    }
    oppContainer.innerHTML = '';
    myContainer.innerHTML = '';

    // --- 添加标签 ---
    const oppLabel = document.createElement('div');
    oppLabel.className = 'tarot-column-label';
    oppLabel.textContent = '🎩 对手';
    oppContainer.appendChild(oppLabel);

    const myLabel = document.createElement('div');
    myLabel.className = 'tarot-column-label';
    myLabel.textContent = '🃏 我';
    myContainer.appendChild(myLabel);

    // ========== 对手的塔罗牌 ==========
    if (window._oppTarot && window._oppTarot.length === 3) {
        const positions = ['过去', '现在', '未来'];
        window._oppTarot.forEach((card, idx) => {
            const div = document.createElement('div');
            div.className = 'tarot-card-mini';

            // ★★★ 组合特效：检查对手的过去/未来是否激活 ★★★
            if (window._tarotCombos && window._tarotCombos.opp &&
                window._tarotCombos.opp.activeCards &&
                window._tarotCombos.opp.activeCards.includes(card.id)) {
                div.classList.add('tarot-combo-active');
            }

            // 位置标签
            const pos = document.createElement('div');
            pos.className = 'tarot-position';
            pos.textContent = positions[idx];
            div.appendChild(pos);

            // 图片
            const img = document.createElement('img');
            if (idx === 0) {
                // 过去：完全正面
                img.src = `${IMG_BASE}${card.id}.png`;
                img.alt = card.name;
                if (card.reversed) {
                    img.style.transform = 'rotate(180deg)';
                }
                const indicator = document.createElement('div');
                indicator.className = card.reversed ? 'tarot-reverse-indicator' : 'tarot-upright-indicator';
                indicator.textContent = card.reversed ? '逆位' : '正位';
                div.appendChild(indicator);
            } else if (idx === 1) {
                // 现在：完全背面
                div.classList.add('face-down');
                img.src = BACK_IMG;
                img.alt = '牌背';
            } else {
                // 未来：背面 + 正逆位指示
                div.classList.add('face-down');
                img.src = BACK_IMG;
                img.alt = '牌背';
                const indicator = document.createElement('div');
                indicator.className = card.reversed ? 'tarot-reverse-indicator' : 'tarot-upright-indicator';
                indicator.textContent = card.reversed ? '逆位' : '正位';
                div.appendChild(indicator);
            }
            div.appendChild(img);
            oppContainer.appendChild(div);
        });
    }

    // ========== 自己的塔罗牌 ==========
    if (window._myTarot && window._myTarot.length === 3) {
        const positions = ['过去', '现在', '未来'];
        window._myTarot.forEach((card, idx) => {
            const div = document.createElement('div');
            div.className = 'tarot-card-mini';

            // ★★★ 组合特效：检查自己的过去/未来是否激活 ★★★
            if (window._tarotCombos && window._tarotCombos.my &&
                window._tarotCombos.my.activeCards &&
                window._tarotCombos.my.activeCards.includes(card.id)) {
                div.classList.add('tarot-combo-active');
            }

            const pos = document.createElement('div');
            pos.className = 'tarot-position';
            pos.textContent = positions[idx];
            div.appendChild(pos);

            const img = document.createElement('img');
            img.src = `${IMG_BASE}${card.id}.png`;
            img.alt = card.name;
            if (card.reversed) {
                img.style.transform = 'rotate(180deg)';
            }
            div.appendChild(img);

            const indicator = document.createElement('div');
            indicator.className = card.reversed ? 'tarot-reverse-indicator' : 'tarot-upright-indicator';
            indicator.textContent = card.reversed ? '逆位' : '正位';
            div.appendChild(indicator);

            myContainer.appendChild(div);
        });
    }
}

// ============================================================
//  网络通信
// ============================================================
function initPeer() {
    peer = new Peer(undefined, { debug: 0 });
    peer.on('open', (id) => {
        myPeerId = id;
        myPeerIdDisplay.textContent = id;
        myPeerIdDisplay.title = '点击复制';
        myPeerIdDisplay.onclick = () => {
            navigator.clipboard.writeText(id).then(() => setMessage('房间号已复制！', 'info'));
        };
        setMessage('PeerJS 已就绪，创建或加入房间', 'info');
    });
    peer.on('connection', (c) => {
        if (conn) { c.close(); return; }
        conn = c;
        setupConnection();
        setMessage('对手已连接！开始游戏...', 'info');
    });
    peer.on('error', (err) => {
        console.error(err);
        setMessage('连接错误: ' + err.message, 'lose');
    });
}

function setupConnection() {
    const onOpen = () => {
        isConnected = true;
        setMessage('连接已建立！', 'info');
        if (isHost) {
            startGameAsHost();
        }
    };
    conn.on('open', onOpen);
    if (conn.open) {
        onOpen();
    }
    conn.on('data', (data) => handleData(data));
    conn.on('close', () => {
        isConnected = false;
        setMessage('连接已断开', 'lose');
        conn = null;
        game.gameOver = true;
        updateUI();
    });
}

function sendData(data) {
    if (conn && conn.open) {
        conn.send(data);
    } else {
        console.warn('连接未打开，数据未发送');
    }
}

function handleData(data) {
    const type = data.type;
    switch (type) {
        case 'init': {
            if (!isHost) {
                // 客机：交换手牌和塔罗牌
                const tmpHand = game.myHand;
                game.myHand = data.oppHand;
                game.oppHand = data.myHand;

                // 交换塔罗牌
                window._myTarot = data.oppTarot;
                window._oppTarot = data.myTarot;
                
                // ★ 接收组合状态并交换 my/opp
                window._tarotCombos = data.tarotCombos || { my: { past: false, future: false, activeCards: [] }, opp: { past: false, future: false, activeCards: [] } };
                // 交换 my 和 opp
                const tmpCombo = window._tarotCombos.my;
                window._tarotCombos.my = window._tarotCombos.opp;
                window._tarotCombos.opp = tmpCombo;

                game.currentPlayer = data.currentPlayer === 'me' ? 'opp' : 'me';
            } else {
                // 房主直接使用
                game.myHand = data.myHand;
                game.oppHand = data.oppHand;
                window._myTarot = data.myTarot;
                window._oppTarot = data.oppTarot;
                window._tarotCombos = data.tarotCombos || { my: { past: false, future: false, activeCards: [] }, opp: { past: false, future: false, activeCards: [] } };
                game.currentPlayer = data.currentPlayer;
            }

            // 统一用 game.currentPlayer === 'me' 判断是否自己的回合
            game.isMyTurn = (game.currentPlayer === 'me');
            game.lastPlay = null;
            game.lastPlayer = null;
            game.passCount = 0;
            game.gameOver = false;
            game.selectedIndices = [];
            setMessage('游戏开始！' + (game.isMyTurn ? '你先出牌' : '等待对手出牌'), 'info');
            
            game.isDealing = true;
            updateUI(true);
            const dealDuration = 16 * 0.08 + 0.8;
            setTimeout(() => {
                game.isDealing = false;
                updateUI();
            }, dealDuration * 1000);

            renderPlay(null, '');
            renderTarot();
            break;
        }
        case 'play': {
            // 对手出牌，移除对手手牌
            const oppIds = data.cardIds;
            if (isHost) {
                oppIds.forEach(id => {
                    const idx = game.oppHand.findIndex(c => c.id === id);
                    if (idx > -1) game.oppHand.splice(idx, 1);
                });
            } else {
                oppIds.forEach(id => {
                    const idx = game.oppHand.findIndex(c => c.id === id);
                    if (idx > -1) game.oppHand.splice(idx, 1);
                });
            }
            game.lastPlay = data.playType;
            game.lastPlayer = game.currentPlayer; // 对手出的
            game.currentPlayer = (game.currentPlayer === 'me' ? 'opp' : 'me');
            game.isMyTurn = (game.currentPlayer === 'me');
            renderPlay(data.cards, `对手出了 ${data.cards.length} 张`);
            setMessage('对手出牌，轮到你', 'info', 'play');
            // if (game.oppHand.length === 0) gameOver('opp');
            updateUI();
            break;
        }
        case 'pass': {
            // ★★★ 过牌后清空上一手牌，切换回合 ★★★
            game.lastPlay = null;
            game.lastPlayer = null;
            game.currentPlayer = (game.currentPlayer === 'me' ? 'opp' : 'me');
            game.isMyTurn = (game.currentPlayer === 'me');
            setMessage('对手过牌，轮到你', 'info', 'pass');
            updateUI();
            break;
        }
        case 'gameover': {
            handleGameOver(data.winner);
            if (isHost) {
                setTimeout(() => {
                    if (isConnected) startGameAsHost();
                }, 1500);
            }
            break;
        }
        default: break;
    }
}

// ============================================================
//  游戏控制
// ============================================================
function startGameAsHost() {
    console.log('startGameAsHost 被调用');
    if (!isHost) return;

    // ★ 检查是否有上一局的未来效果 ★
    let myWeight = 1.0;
    let oppWeight = 1.0;
    let myRandomness = 1.0;
    let oppRandomness = 1.0;

    if (nextRoundTarotEffect) {
        const effect = nextRoundTarotEffect;
        if (effect.player === 'me') {
            if (effect.effect.type === 'future_weight' || effect.effect.type === 'high_weights') {
                myWeight = effect.weightMod;
            } else if (effect.effect.type === 'future_weight_bad') {
                myWeight = effect.weightMod;
                myRandomness = effect.randomnessMod;
            } else if (effect.effect.type === 'future_randomness') {
                myRandomness = effect.randomnessMod;
            }
        } else if (effect.player === 'opp') {
            if (effect.effect.type === 'future_weight' || effect.effect.type === 'high_weights') {
                oppWeight = effect.weightMod;
            } else if (effect.effect.type === 'future_weight_bad') {
                oppWeight = effect.weightMod;
                oppRandomness = effect.randomnessMod;
            } else if (effect.effect.type === 'future_randomness') {
                oppRandomness = effect.randomnessMod;
            }
        }

        if (effect.effect.type === 'future_weight_gamble') {
            // 根据权重决定是好牌还是烂牌
            const goodChance = effect.weightMod; // 0.8 或 0.2 或 0.5
            if (Math.random() < goodChance) {
                // 好牌
                if (effect.player === 'me') {
                    myWeight = 1.3;
                    myRandomness = 0.8;
                } else {
                    oppWeight = 1.3;
                    oppRandomness = 0.8;
                }
            } else {
                // 烂牌（超级烂或普通烂）
                const badRandomness = effect.randomnessMod || 0.7;
                if (effect.player === 'me') {
                    myWeight = 0.7;
                    myRandomness = badRandomness;
                } else {
                    oppWeight = 0.7;
                    oppRandomness = badRandomness;
                }
            }
        }

        if (effect.effect.type === 'future_forced_first') {
            // 强制自己先手
            nextFirstPlayer = 'me';
            // 随机性调整已包含在 randomnessMod 中
        } else if (effect.effect.type === 'future_forced_give_first') {
            // 强制让先手
            nextFirstPlayer = 'opp';
            // 随机性调整已包含
        }

        // 高塔未来
        if (effect.effect.type === 'future_high_tower_positive') {
            if (effect.player === 'me') {
                myRandomness = effect.randomnessMod;
                myWeight = effect.weightMod;
            } else {
                oppRandomness = effect.randomnessMod;
                oppWeight = effect.weightMod;
            }
            nextRoundTarotEffect = null;
        }
        if (effect.effect.type === 'future_high_tower_negative') {
            if (effect.player === 'me') {
                myRandomness = effect.randomnessMod;
                myWeight = effect.weightMod;
            } else {
                oppRandomness = effect.randomnessMod;
                oppWeight = effect.weightMod;
            }
            nextRoundTarotEffect = null;
        }

        // 审判未来（在发牌后处理，因为要操作手牌）
        if (effect.effect.type === 'future_judgment_positive' || effect.effect.type === 'future_judgment_negative') {
            // 这些需要发牌后执行，标记为待处理
            window._pendingJudgment = effect;
            nextRoundTarotEffect = null;
        }

        // 清空，避免重复使用
        nextRoundTarotEffect = null;
    }

    // 在 startGameAsHost 开头，处理未来效果时添加
    if (nextRoundTarotEffect && nextRoundTarotEffect.effect.type === 'inherit_past') {
        const inherited = nextRoundTarotEffect.effect.pastEffect;
        // 直接应用该效果到当前局
        // 注意：此时牌还未发，所以我们需要在发牌后应用
        // 所以我们将这个效果保存起来，在发牌后应用
        // 简单做法：将 inherited 存入一个临时变量，在发牌后调用 applyPastEffect
        window._inheritedPastEffect = inherited;
        // 清空 nextRoundTarotEffect，避免重复
        nextRoundTarotEffect = null;
    }

    // 生成塔罗牌
    const { myCards: myTarot, oppCards: oppTarot } = drawTarotCardsForBoth();
    window._myTarot = myTarot;
    window._oppTarot = oppTarot;

    // 解析我的塔罗牌
    let myPastEffect = null;
    let myFutureEffect = null;
    let myWeightMod = 1.0;      // 过去权重调整
    let myRandomnessMod = 1.0;  // 过去随机性调整
    let myFutureWeightMod = 1.0;
    let myFutureRandomnessMod = 1.0;

    myTarot.forEach((card, idx) => {
        const position = ['past', 'present', 'future'][idx];
        if (position === 'past') {
            myPastEffect = { cardId: card.id, reversed: card.reversed };

            // 命运之轮
            if (card.id === '10') {
                if (!card.reversed) {
                    myPastEffect.type = 'reshuffle';
                } else {
                    myPastEffect.type = 'force_3';
                }
            }

            // 星星
            if (card.id === '17') {
                if (!card.reversed) {
                    // 正：低价值牌转换概率×1.25，对子概率×1.10
                    myWeightMod *= 1.10;
                    myRandomnessMod *= 0.90;
                } else {
                    // 逆：随机性+35%
                    myRandomnessMod *= 1.35;
                }
                myPastEffect.type = 'weight_random';
            }

            // 太阳
            if (card.id === '19') {
                if (!card.reversed) {
                    myWeightMod *= 1.25;
                    // 对子概率下降（用随机性模拟，降低牌值集中度）
                    myRandomnessMod *= 0.85;
                } else {
                    myWeightMod *= 0.70;
                    myRandomnessMod *= 1.25;
                }
                myPastEffect.type = 'weight_random';
            }

            // 月亮
            if (card.id === '18') {
                if (!card.reversed) {
                    myRandomnessMod *= 1.2;
                } else {
                    myRandomnessMod *= 0.8;
                    // 烂牌概率提升（权重降低）
                    myWeightMod *= 0.8;
                }
                myPastEffect.type = 'weight_random';
            }

            // 恶魔
            if (card.id === '15') {
                if (!card.reversed) {
                    // 正：高价值×1.25，单牌×1.25（高随机性）
                    myWeightMod *= 1.25;
                    myRandomnessMod *= 1.25;
                } else {
                    // 逆：低价值×0.85，组合×1.2（低随机性）
                    myWeightMod *= 0.85;
                    myRandomnessMod *= 0.80;
                    // 炸弹概率×0.01，标记 noBomb
                    if (!myPastEffect) myPastEffect = { type: 'weight_random' };
                    myPastEffect.noBomb = true;
                }
                if (!myPastEffect) myPastEffect = { type: 'weight_random' };
            }

            // 死神 (id: 13)
            if (card.id === '13') {
                myPastEffect = {
                    cardId: card.id,
                    reversed: card.reversed,
                    type: 'swap_card',
                    direction: card.reversed ? 'highest' : 'lowest'
                };
            }

            // 皇帝 (id: 4)
            if (card.id === '4') {
                if (!card.reversed) {
                    myWeightMod *= 1.1;
                    myRandomnessMod *= 0.9; // 对子/顺子概率提升
                } else {
                    myWeightMod *= 1.2;
                    myRandomnessMod *= 0.8; // 高价值提升，组合降低
                }
                myPastEffect = { type: 'weight_random' };
            }

            // 女皇 (id: 3)
            if (card.id === '3') {
                if (!card.reversed) {
                    myWeightMod *= 1.1;
                    myRandomnessMod *= 0.9; // 同花色概率提升（近似）
                } else {
                    myRandomnessMod *= 0.75; // 特殊组合概率降低
                }
                myPastEffect = { type: 'weight_random' };
            }

            // 魔术师 (id: 1)
            if (card.id === '1') {
                if (!card.reversed) {
                    // 正：顺子概率×1.3
                    myWeightMod *= 1.1;
                    myRandomnessMod *= 0.85; // 近似顺子提升
                } else {
                    // 逆：特殊组合×1.2，顺子×0.7
                    myWeightMod *= 1.1;
                    myRandomnessMod *= 0.85; // 组合提升
                    // 顺子下降通过后续组合覆盖
                }
                myPastEffect = { type: 'weight_random' };
            }

            // 女祭司 (id: 2)
            if (card.id === '2') {
                if (!card.reversed) {
                    myRandomnessMod *= 0.7; // 随机性-30%
                } else {
                    myRandomnessMod *= 1.3; // 随机性+30%
                }
                myPastEffect = { type: 'weight_random' };
            }

            // 隐者 (id: 9)
            if (card.id === '9') {
                if (!card.reversed) {
                    myWeightMod *= 1.05;
                    myRandomnessMod *= 0.8; // 组合概率×1.3，顺子×0.7
                } else {
                    myWeightMod *= 1.1;
                    myRandomnessMod *= 0.85; // 组合×0.7，三条×1.3
                }
                myPastEffect = { type: 'weight_random' };
            }

            // 倒吊人 (id: 12)
            if (card.id === '12') {
                if (!card.reversed) {
                    // 正：最低牌换更高牌（在 applyPastEffect 中处理）
                    myPastEffect = {
                        type: 'hanged_man_past_positive',
                        direction: 'higher'
                    };
                } else {
                    // 逆：强制让先手 + 好牌
                    // 先手权在 later 设置，这里标记
                    myPastEffect = {
                        type: 'hanged_man_past_negative',
                        giveFirst: true
                    };
                    // 好牌：权重提升
                    myWeightMod *= 1.2;
                    myRandomnessMod *= 0.9;
                }
            }

            // 高塔 (id: 16)
            if (card.id === '16') {
                if (!card.reversed) {
                    myRandomnessMod *= 2.0;      // 随机性 +100%
                    myWeightMod *= 1.3;          // 高价值 ×1.3
                } else {
                    myRandomnessMod *= 2.0;      // 随机性 +100%
                    myWeightMod *= 1.2;          // 对子/姊妹提升（近似）
                    myRandomnessMod *= 0.9;      // 组合概率提升
                }
                myPastEffect = { type: 'weight_random' };
            }

            // 审判 (id: 20)
            if (card.id === '20') {
                if (!card.reversed) {
                    // 正：己方散牌 ↔ 对方高价值牌
                    myPastEffect = {
                        type: 'judgment_past_positive',
                        swapType: 'scattered_to_high'
                    };
                } else {
                    // 逆：己方高价值牌 ↔ 对方散牌
                    myPastEffect = {
                        type: 'judgment_past_negative',
                        swapType: 'high_to_scattered'
                    };
                }
            }

        } else if (position === 'future') {
            myFutureEffect = { cardId: card.id, reversed: card.reversed };

            // 命运之轮
            if (card.id === '10') {
                if (!card.reversed) {
                    myFutureEffect.type = 'high_weights';
                    myFutureWeightMod = 1.3;
                } else {
                    myFutureEffect.type = 'gamble';
                }
            }

            // 星星
            if (card.id === '17') {
                if (!card.reversed) {
                    // 正：特殊组合概率×1.2
                    myFutureEffect.type = 'future_weight';
                    myFutureWeightMod = 1.10;
                    myFutureRandomnessMod = 0.90;
                } else {
                    // 逆：烂牌概率×0.8，高价值牌×1.2
                    myFutureEffect.type = 'future_weight_bad';
                    myFutureWeightMod = 1.20;
                    myFutureRandomnessMod = 1.20;
                }
            }

            // 太阳
            if (card.id === '19') {
                if (!card.reversed) {
                    myFutureEffect.type = 'future_weight';
                    myFutureWeightMod = 1.25;
                } else {
                    myFutureEffect.type = 'future_weight_bad';
                    myFutureWeightMod = 1.10;
                    myFutureRandomnessMod = 0.8;
                }
            }

            // 月亮
            if (card.id === '18') {
                if (!card.reversed) {
                    myFutureEffect.type = 'future_randomness';
                    myFutureRandomnessMod = 1.2;
                } else {
                    myFutureEffect.type = 'future_randomness';
                    myFutureRandomnessMod = 0.8;
                }
            }
            // 恶魔
            if (card.id === '15') {
                if (!card.reversed) {
                    // 正：下一局炸弹概率×1.5，若无炸弹则烂牌重发
                    myFutureEffect = {
                        type: 'future_bomb_boost',
                        bombBoost: 1.5,
                        reshuffleIfNoBomb: true,
                        reshuffleParams: { weight: 0.7, randomness: 1.5 }
                    };
                    myFutureWeightMod = 1.5;
                    myFutureRandomnessMod = 1.0;
                } else {
                    // 逆：低价值×1.15，高价值×1.15（权重1.15，极端）
                    myFutureEffect = {
                        type: 'future_weight',
                        weightMod: 1.15,
                        randomnessMod: 1.3
                    };
                    myFutureWeightMod = 1.15;
                    myFutureRandomnessMod = 1.3;
                }
            }

            // 死神未来
            if (card.id === '13') {
                if (!card.reversed) {
                    // 正：随机性+30%
                    myFutureEffect = { type: 'future_randomness' };
                    myFutureRandomnessMod = 1.3;
                } else {
                    // 逆：延续本局过去效果
                    myFutureEffect = {
                        type: 'inherit_past',
                        pastEffect: myPastEffect // 注意：myPastEffect 可能在后面被修改，最好复制一份
                    };
                    // 这里不设置 weightMod/randomnessMod，因为继承的是过去效果
                }
            }

            // 皇帝未来
            if (card.id === '4') {
                if (!card.reversed) {
                    // 正：随机性-20%
                    myFutureEffect = { type: 'future_randomness' };
                    myFutureRandomnessMod = 0.8;
                } else {
                    // 逆：根据本局高价值牌数量增加随机性
                    myFutureEffect = {
                        type: 'future_randomness_based_on_high_cards',
                    };
                    // 不在这里设置具体数值，在发牌后计算
                }
            }

            // 女皇未来
            if (card.id === '3') {
                if (!card.reversed) {
                    // 正：额外抽牌替换最小牌
                    myFutureEffect = { type: 'extra_draw_replace' };
                } else {
                    // 逆：对子概率×0.7，顺子概率×1.3
                    myFutureEffect = { type: 'future_weight' };
                    myFutureWeightMod = 1.0;
                    myFutureRandomnessMod = 0.7; // 近似
                }
            }

            // 魔术师未来
            if (card.id === '1') {
                if (!card.reversed) {
                    // 正：补全顺子
                    myFutureEffect = { type: 'fill_straight' };
                } else {
                    // 逆：高价值×1.3，烂牌
                    myFutureEffect = { type: 'future_weight_bad' };
                    myFutureWeightMod = 1.3;
                    myFutureRandomnessMod = 0.7;
                }
            }

            // 女祭司未来
            if (card.id === '2') {
                if (!card.reversed) {
                    myFutureEffect = { type: 'future_randomness' };
                    myFutureRandomnessMod = 0.7;
                } else {
                    myFutureEffect = { type: 'future_randomness' };
                    myFutureRandomnessMod = 1.3;
                }
            }

            // 隐者未来
            if (card.id === '9') {
                if (!card.reversed) {
                    // 正：80%好牌，20%超级烂牌
                    myFutureEffect = { type: 'future_weight_gamble' };
                    myFutureWeightMod = 0.8; // 好牌权重
                    myFutureRandomnessMod = 0.8; // 超级烂牌参数
                } else {
                    // 逆：80%烂牌，20%超级好牌
                    myFutureEffect = { type: 'future_weight_gamble' };
                    myFutureWeightMod = 0.2; // 好牌权重
                    myFutureRandomnessMod = 0.7; // 烂牌参数
                }
            }

            // 倒吊人未来
            if (card.id === '12') {
                if (!card.reversed) {
                    // 正：强制先手，随机性+30%
                    myFutureEffect = {
                        type: 'future_forced_first',
                        randomnessMod: 1.3
                    };
                    myFutureRandomnessMod = 1.3;
                } else {
                    // 逆：强制让先手，随机性-30%
                    myFutureEffect = {
                        type: 'future_forced_give_first',
                        randomnessMod: 0.7
                    };
                    myFutureRandomnessMod = 0.7;
                }
            }

            // 高塔未来
            if (card.id === '16') {
                if (!card.reversed) {
                    myFutureEffect = {
                        type: 'future_high_tower_positive',
                        randomnessMod: 2.0,
                        weightMod: 1.3
                    };
                    myFutureRandomnessMod = 2.0;
                    myFutureWeightMod = 1.3;
                } else {
                    myFutureEffect = {
                        type: 'future_high_tower_negative',
                        randomnessMod: 2.0,
                        weightMod: 0.7   // 低价值提升（权重降低）
                    };
                    myFutureRandomnessMod = 2.0;
                    myFutureWeightMod = 0.7;
                }
            }

            // 审判未来
            if (card.id === '20') {
                if (!card.reversed) {
                    myFutureEffect = {
                        type: 'future_judgment_positive'
                    };
                } else {
                    myFutureEffect = {
                        type: 'future_judgment_negative'
                    };
                }
            }
        }
    });

    // 解析对手的塔罗牌
    let oppPastEffect = null;
    let oppFutureEffect = null;
    let oppWeightMod = 1.0;      // 过去权重调整
    let oppRandomnessMod = 1.0;  // 过去随机性调整
    let oppFutureWeightMod = 1.0;
    let oppFutureRandomnessMod = 1.0;

    oppTarot.forEach((card, idx) => {
        const position = ['past', 'present', 'future'][idx];
        if (position === 'past') {
            oppPastEffect = { cardId: card.id, reversed: card.reversed };

            // 命运之轮
            if (card.id === '10') {
                if (!card.reversed) {
                    oppPastEffect.type = 'reshuffle';
                } else {
                    oppPastEffect.type = 'force_3';
                }
            }

            // 星星
            if (card.id === '17') {
                if (!card.reversed) {
                    // 正：低价值牌转换概率×1.25，对子概率×1.10
                    oppWeightMod *= 1.10;
                    oppRandomnessMod *= 0.90;
                } else {
                    // 逆：随机性+35%
                    oppRandomnessMod *= 1.35;
                }
                oppPastEffect.type = 'weight_random';
            }

            // 太阳
            if (card.id === '19') {
                if (!card.reversed) {
                    oppWeightMod *= 1.25;
                    // 对子概率下降（用随机性模拟，降低牌值集中度）
                    oppRandomnessMod *= 0.85;
                } else {
                    oppWeightMod *= 0.70;
                    oppRandomnessMod *= 1.25;
                }
                oppPastEffect.type = 'weight_random';
            }

            // 月亮
            if (card.id === '18') {
                if (!card.reversed) {
                    oppRandomnessMod *= 1.2;
                } else {
                    oppRandomnessMod *= 0.8;
                    // 烂牌概率提升（权重降低）
                    oppWeightMod *= 0.8;
                }
                oppPastEffect.type = 'weight_random';
            }

            // 恶魔
            if (card.id === '15') {
                if (!card.reversed) {
                    // 正：高价值×1.25，单牌×1.25（高随机性）
                    oppWeightMod *= 1.25;
                    oppRandomnessMod *= 1.25;
                } else {
                    // 逆：低价值×0.85，组合×1.2（低随机性）
                    oppWeightMod *= 0.85;
                    oppRandomnessMod *= 0.80;
                    // 炸弹概率×0.01，标记 noBomb
                    if (!oppPastEffect) oppPastEffect = { type: 'weight_random' };
                    oppPastEffect.noBomb = true;
                }
                if (!oppPastEffect) oppPastEffect = { type: 'weight_random' };
            }

            // 死神 (id: 13)
            if (card.id === '13') {
                oppPastEffect = {
                    cardId: card.id,
                    reversed: card.reversed,
                    type: 'swap_card',
                    direction: card.reversed ? 'highest' : 'lowest'
                };
            }

            // 皇帝 (id: 4)
            if (card.id === '4') {
                if (!card.reversed) {
                    oppWeightMod *= 1.1;
                    oppRandomnessMod *= 0.9; // 对子/顺子概率提升
                } else {
                    oppWeightMod *= 1.2;
                    oppRandomnessMod *= 0.8; // 高价值提升，组合降低
                }
                oppPastEffect = { type: 'weight_random' };
            }

            // 女皇 (id: 3)
            if (card.id === '3') {
                if (!card.reversed) {
                    oppWeightMod *= 1.1;
                    oppRandomnessMod *= 0.9; // 同花色概率提升（近似）
                } else {
                    oppRandomnessMod *= 0.75; // 特殊组合概率降低
                }
                oppPastEffect = { type: 'weight_random' };
            }

            // 魔术师 (id: 1)
            if (card.id === '1') {
                if (!card.reversed) {
                    // 正：顺子概率×1.3
                    oppWeightMod *= 1.1;
                    oppRandomnessMod *= 0.85; // 近似顺子提升
                } else {
                    // 逆：特殊组合×1.2，顺子×0.7
                    oppWeightMod *= 1.1;
                    oppRandomnessMod *= 0.85; // 组合提升
                    // 顺子下降通过后续组合覆盖
                }
                oppPastEffect = { type: 'weight_random' };
            }

            // 女祭司 (id: 2)
            if (card.id === '2') {
                if (!card.reversed) {
                    oppRandomnessMod *= 0.7; // 随机性-30%
                } else {
                    oppRandomnessMod *= 1.3; // 随机性+30%
                }
                oppPastEffect = { type: 'weight_random' };
            }

            // 隐者 (id: 9)
            if (card.id === '9') {
                if (!card.reversed) {
                    oppWeightMod *= 1.05;
                    oppRandomnessMod *= 0.8; // 组合概率×1.3，顺子×0.7
                } else {
                    oppWeightMod *= 1.1;
                    oppRandomnessMod *= 0.85; // 组合×0.7，三条×1.3
                }
                oppPastEffect = { type: 'weight_random' };
            }

            // 倒吊人 (id: 12)
            if (card.id === '12') {
                if (!card.reversed) {
                    // 正：最低牌换更高牌（在 applyPastEffect 中处理）
                    oppPastEffect = {
                        type: 'hanged_man_past_positive',
                        direction: 'higher'
                    };
                } else {
                    // 逆：强制让先手 + 好牌
                    // 先手权在 later 设置，这里标记
                    oppPastEffect = {
                        type: 'hanged_man_past_negative',
                        giveFirst: true
                    };
                    // 好牌：权重提升
                    oppWeightMod *= 1.2;
                    oppRandomnessMod *= 0.9;
                }
            }

            // 高塔 (id: 16)
            if (card.id === '16') {
                if (!card.reversed) {
                    oppRandomnessMod *= 2.0;      // 随机性 +100%
                    oppWeightMod *= 1.3;          // 高价值 ×1.3
                } else {
                    oppRandomnessMod *= 2.0;      // 随机性 +100%
                    oppWeightMod *= 1.2;          // 对子/姊妹提升（近似）
                    oppRandomnessMod *= 0.9;      // 组合概率提升
                }
                oppPastEffect = { type: 'weight_random' };
            }

            // 审判 (id: 20)
            if (card.id === '20') {
                if (!card.reversed) {
                    // 正：己方散牌 ↔ 对方高价值牌
                    oppPastEffect = {
                        type: 'judgment_past_positive',
                        swapType: 'scattered_to_high'
                    };
                } else {
                    // 逆：己方高价值牌 ↔ 对方散牌
                    oppPastEffect = {
                        type: 'judgment_past_negative',
                        swapType: 'high_to_scattered'
                    };
                }
            }
        } else if (position === 'future') {
            oppFutureEffect = { cardId: card.id, reversed: card.reversed };

            // 命运之轮
            if (card.id === '10') {
                if (!card.reversed) {
                    oppFutureEffect.type = 'high_weights';
                    oppFutureWeightMod = 1.3;
                } else {
                    oppFutureEffect.type = 'gamble';
                }
            }

            // 星星
            if (card.id === '17') {
                if (!card.reversed) {
                    // 正：特殊组合概率×1.2
                    oppFutureEffect.type = 'future_weight';
                    oppFutureWeightMod = 1.10;
                    oppFutureRandomnessMod = 0.90;
                } else {
                    // 逆：烂牌概率×0.8，高价值牌×1.2
                    oppFutureEffect.type = 'future_weight_bad';
                    oppFutureWeightMod = 1.20;
                    oppFutureRandomnessMod = 1.20;
                }
            }

            // 太阳
            if (card.id === '19') {
                if (!card.reversed) {
                    oppFutureEffect.type = 'future_weight';
                    oppFutureWeightMod = 1.25;
                } else {
                    oppFutureEffect.type = 'future_weight_bad';
                    oppFutureWeightMod = 1.10;
                    oppFutureRandomnessMod = 0.8;
                }
            }

            // 月亮
            if (card.id === '18') {
                if (!card.reversed) {
                    oppFutureEffect.type = 'future_randomness';
                    oppFutureRandomnessMod = 1.2;
                } else {
                    oppFutureEffect.type = 'future_randomness';
                    oppFutureRandomnessMod = 0.8;
                }
            }

            // 恶魔
            if (card.id === '15') {
                if (!card.reversed) {
                    // 正：下一局炸弹概率×1.5，若无炸弹则烂牌重发
                    oppFutureEffect = {
                        type: 'future_bomb_boost',
                        bombBoost: 1.5,
                        reshuffleIfNoBomb: true,
                        reshuffleParams: { weight: 0.7, randomness: 1.5 }
                    };
                    oppFutureWeightMod = 1.5;
                    oppFutureRandomnessMod = 1.0;
                } else {
                    // 逆：低价值×1.15，高价值×1.15（权重1.15，极端）
                    oppFutureEffect = {
                        type: 'future_weight',
                        weightMod: 1.15,
                        randomnessMod: 1.3
                    };
                    oppFutureWeightMod = 1.15;
                    oppFutureRandomnessMod = 1.3;
                }
            }

            // 死神未来
            if (card.id === '13') {
                if (!card.reversed) {
                    // 正：随机性+30%
                    oppFutureEffect = { type: 'future_randomness' };
                    oppFutureRandomnessMod = 1.3;
                } else {
                    // 逆：延续本局过去效果
                    oppFutureEffect = {
                        type: 'inherit_past',
                        pastEffect: oppPastEffect // 注意：oppPastEffect 可能在后面被修改，最好复制一份
                    };
                    // 这里不设置 weightMod/randomnessMod，因为继承的是过去效果
                }
            }

            // 皇帝未来
            if (card.id === '4') {
                if (!card.reversed) {
                    // 正：随机性-20%
                    oppFutureEffect = { type: 'future_randomness' };
                    oppFutureRandomnessMod = 0.8;
                } else {
                    // 逆：根据本局高价值牌数量增加随机性
                    oppFutureEffect = {
                        type: 'future_randomness_based_on_high_cards',
                    };
                    // 不在这里设置具体数值，在发牌后计算
                }
            }

            // 女皇未来
            if (card.id === '3') {
                if (!card.reversed) {
                    // 正：额外抽牌替换最小牌
                    oppFutureEffect = { type: 'extra_draw_replace' };
                } else {
                    // 逆：对子概率×0.7，顺子概率×1.3
                    oppFutureEffect = { type: 'future_weight' };
                    oppFutureWeightMod = 1.0;
                    oppFutureRandomnessMod = 0.7; // 近似
                }
            }

            // 魔术师未来
            if (card.id === '1') {
                if (!card.reversed) {
                    // 正：补全顺子
                    oppFutureEffect = { type: 'fill_straight' };
                } else {
                    // 逆：高价值×1.3，烂牌
                    oppFutureEffect = { type: 'future_weight_bad' };
                    oppFutureWeightMod = 1.3;
                    oppFutureRandomnessMod = 0.7;
                }
            }

            // 女祭司未来
            if (card.id === '2') {
                if (!card.reversed) {
                    oppFutureEffect = { type: 'future_randomness' };
                    oppFutureRandomnessMod = 0.7;
                } else {
                    oppFutureEffect = { type: 'future_randomness' };
                    oppFutureRandomnessMod = 1.3;
                }
            }

            // 隐者未来
            if (card.id === '9') {
                if (!card.reversed) {
                    // 正：80%好牌，20%超级烂牌
                    oppFutureEffect = { type: 'future_weight_gamble' };
                    oppFutureWeightMod = 0.8; // 好牌权重
                    oppFutureRandomnessMod = 0.8; // 超级烂牌参数
                } else {
                    // 逆：80%烂牌，20%超级好牌
                    oppFutureEffect = { type: 'future_weight_gamble' };
                    oppFutureWeightMod = 0.2; // 好牌权重
                    oppFutureRandomnessMod = 0.7; // 烂牌参数
                }
            }

            // 倒吊人未来
            if (card.id === '12') {
                if (!card.reversed) {
                    // 正：强制先手，随机性+30%
                    oppFutureEffect = {
                        type: 'future_forced_first',
                        randomnessMod: 1.3
                    };
                    oppFutureRandomnessMod = 1.3;
                } else {
                    // 逆：强制让先手，随机性-30%
                    oppFutureEffect = {
                        type: 'future_forced_give_first',
                        randomnessMod: 0.7
                    };
                    oppFutureRandomnessMod = 0.7;
                }
            }

            // 高塔未来
            if (card.id === '16') {
                if (!card.reversed) {
                    oppFutureEffect = {
                        type: 'future_high_tower_positive',
                        randomnessMod: 2.0,
                        weightMod: 1.3
                    };
                    oppFutureRandomnessMod = 2.0;
                    oppFutureWeightMod = 1.3;
                } else {
                    oppFutureEffect = {
                        type: 'future_high_tower_negative',
                        randomnessMod: 2.0,
                        weightMod: 0.7   // 低价值提升（权重降低）
                    };
                    oppFutureRandomnessMod = 2.0;
                    oppFutureWeightMod = 0.7;
                }
            }

            // 审判未来
            if (card.id === '20') {
                if (!card.reversed) {
                    oppFutureEffect = {
                        type: 'future_judgment_positive'
                    };
                } else {
                    oppFutureEffect = {
                        type: 'future_judgment_negative'
                    };
                }
            }
        }
    });


    // 检查我方的过去组合
    const myHasMagician = myTarot.some(c => c.id === '1');
    const myHasPriestess = myTarot.some(c => c.id === '2');
    const myHasEmpress = myTarot.some(c => c.id === '3');
    const myHasEmperor = myTarot.some(c => c.id === '4');
    const myHasHermit = myTarot.some(c => c.id === '9');
    const myHasHangedMan = myTarot.some(c => c.id === '12');
    const myHasDeath = myTarot.some(c => c.id === '13');
    const myHasDevil = myTarot.some(c => c.id === '15');
    const myHasStar = myTarot.some(c => c.id === '17');
    const myHasMoon = myTarot.some(c => c.id === '18');
    const myHasSun = myTarot.some(c => c.id === '19');
    if (myHasSun && myHasMoon) {
        const sunRev = myTarot.find(c => c.id === '19').reversed;
        const moonRev = myTarot.find(c => c.id === '18').reversed;
        if (!sunRev && !moonRev) {
            // 正正：高价值牌 ×1.30
            myWeightMod = 1.30;
            myRandomnessMod = 1.0; // 重置其他随机性调整
        } else if (sunRev && moonRev) {
            // 逆逆：随机性 +30%
            myRandomnessMod = 1.3;
            myWeightMod = 1.0;
        } else {
            // 一正一逆：无效化所有过去效果
            myWeightMod = 1.0;
            myRandomnessMod = 1.0;
            myPastEffect = null; // 清除过去效果
        }
    }

    // 检查我方的过去组合：星星 + 月亮
    if (myHasStar && myHasMoon) {
        // 随机性+50%，高价值牌×1.25
        myRandomnessMod = 1.5;
        myWeightMod = 1.25;
        // 清除单独效果（避免叠加）
        myPastEffect = null; // 因为组合效果已经覆盖了星星和月亮的单独效果
    }

    // 检查我方的过去组合：恶魔 + 太阳
    if (myHasDevil && myHasSun) {
        const devilRev = myTarot.find(c => c.id === '15').reversed;
        const sunRev = myTarot.find(c => c.id === '19').reversed;
        if (!devilRev && !sunRev) {
            // 正正：高价值×1.5，单牌×1.5，组合×0.425
            myWeightMod = 1.5;
            myRandomnessMod = 1.5;
            myPastEffect = null; // 清除特殊效果
        } else if (devilRev && sunRev) {
            // 逆逆：低价值×0.425，组合×1.4，炸弹概率×0
            myWeightMod = 0.425;
            myRandomnessMod = 0.7;
            myPastEffect = { type: 'weight_random', noBomb: true };
        } else {
            // 一正一逆：恢复默认
            myWeightMod = 1.0;
            myRandomnessMod = 1.0;
            myPastEffect = null;
        }
    }

    // 检查我方的未来组合：恶魔 + 太阳
    if (myHasDevil && myHasSun) {
        const devilRev = myTarot.find(c => c.id === '15').reversed;
        const sunRev = myTarot.find(c => c.id === '19').reversed;
        if (!devilRev && !sunRev) {
            // 正正：炸弹概率×0.85，若无炸弹则超级烂牌
            myFutureEffect = {
                type: 'future_bomb_boost',
                bombBoost: 0.85,
                reshuffleIfNoBomb: true,
                reshuffleParams: { weight: 0.4, randomness: 1.8 }
            };
            myFutureWeightMod = 0.85;
            myFutureRandomnessMod = 1.8;
        } else if (devilRev && sunRev) {
            // 逆逆：低价值×1.3，高价值×1.3
            myFutureEffect = {
                type: 'future_weight',
                weightMod: 1.3,
                randomnessMod: 1.5
            };
            myFutureWeightMod = 1.3;
            myFutureRandomnessMod = 1.5;
        } else {
            myFutureEffect = null;
        }
    }

    // 检查我方的过去组合：皇帝 + 女皇
    if (myHasEmperor && myHasEmpress) {
        // 顺子概率×1.2，同花色概率×2
        myWeightMod = 1.1;
        myRandomnessMod = 0.85;
        myPastEffect = null; // 清除单独效果（权重随机已处理）
    }

    // 检查我方的过去组合：魔术师 + 女祭司
    if (myHasMagician && myHasPriestess) {
        // 清除单独效果
        myPastEffect = null;
        myWeightMod = 1.0;
        myRandomnessMod = 1.0;
        // 标记为组合效果，在发牌后处理
        myPastEffect = { type: 'magician_priestess_combo' };
    }

    // 检查我方的未来组合：隐者 + 女祭司
    if (myHasHermit && myHasPriestess) {
        const hermitRev = myTarot.find(c => c.id === '9').reversed;
        const priestessRev = myTarot.find(c => c.id === '2').reversed;
        if (!hermitRev && !priestessRev) {
            // 正正：50%好牌，50%超级烂牌
            myFutureEffect = { type: 'future_weight_gamble' };
            myFutureWeightMod = 0.5;
            myFutureRandomnessMod = 0.5;
        } else if (hermitRev && priestessRev) {
            // 逆逆：50%烂牌，50%超级好牌
            myFutureEffect = { type: 'future_weight_gamble' };
            myFutureWeightMod = 0.5;
            myFutureRandomnessMod = 1.0;
        } else {
            // 一正一逆：50%烂牌，50%好牌
            myFutureEffect = { type: 'future_weight_gamble' };
            myFutureWeightMod = 0.5;
            myFutureRandomnessMod = 0.8;
        }
    }

    // 检查我方的未来组合：倒吊人 + 恶魔
    if (myHasHangedMan && myHasDevil) {
        const hangedRev = myTarot.find(c => c.id === '12').reversed;
        const devilRev = myTarot.find(c => c.id === '15').reversed;
        if (!hangedRev && !devilRev) {
            // 正正：炸弹概率×1.5，若无炸弹则好牌重发
            myFutureEffect = {
                type: 'future_bomb_boost',
                bombBoost: 1.5,
                reshuffleIfNoBomb: true,
                reshuffleParams: { weight: 1.3, randomness: 0.8 }  // 好牌参数
            };
            myFutureWeightMod = 1.5;
            myFutureRandomnessMod = 1.0;
        } else if (hangedRev && devilRev) {
            // 逆逆：低价值×1.2，高价值×1.2
            myFutureEffect = {
                type: 'future_weight',
                weightMod: 1.2,
                randomnessMod: 1.2
            };
            myFutureWeightMod = 1.2;
            myFutureRandomnessMod = 1.2;
        } else {
            // 一正一逆：炸弹概率×1.3
            myFutureEffect = {
                type: 'future_bomb_boost',
                bombBoost: 1.3,
                reshuffleIfNoBomb: false
            };
            myFutureWeightMod = 1.3;
            myFutureRandomnessMod = 1.0;
        }
    }

    // 检查我方的过去组合：倒吊人 + 死神
    if (myHasHangedMan && myHasDevil) {
        // 替换为三条
        myPastEffect = {
            type: 'hanged_man_death_combo'
        };
        // 清除其他过去效果
        myWeightMod = 1.0;
        myRandomnessMod = 1.0;
    }






    // 处理对手的组合
    const oppHasMagician = oppTarot.some(c => c.id === '1');
    const oppHasPriestess = oppTarot.some(c => c.id === '2');
    const oppHasEmpress = oppTarot.some(c => c.id === '3');
    const oppHasEmperor = oppTarot.some(c => c.id === '4');
    const oppHasHermit = oppTarot.some(c => c.id === '9');
    const oppHasHangedMan = oppTarot.some(c => c.id === '12');
    const oppHasDeath = oppTarot.some(c => c.id === '13');
    const oppHasDevil = oppTarot.some(c => c.id === '15');
    const oppHasStar = oppTarot.some(c => c.id === '17');
    const oppHasMoon = oppTarot.some(c => c.id === '18');
    const oppHasSun = oppTarot.some(c => c.id === '19');
    if (oppHasSun && oppHasMoon) {
        const sunRev = oppTarot.find(c => c.id === '19').reversed;
        const moonRev = oppTarot.find(c => c.id === '18').reversed;
        if (!sunRev && !moonRev) {
            // 正正：高价值牌 ×1.30
            oppWeightMod = 1.30;
            oppRandomnessMod = 1.0; // 重置其他随机性调整
        } else if (sunRev && moonRev) {
            // 逆逆：随机性 +30%
            oppRandomnessMod = 1.3;
            oppWeightMod = 1.0;
        } else {
            // 一正一逆：无效化所有过去效果
            oppWeightMod = 1.0;
            oppRandomnessMod = 1.0;
            oppPastEffect = null; // 清除过去效果
        }
    }

    // 检查对方的过去组合：星星 + 月亮
    if (oppHasStar && oppHasMoon) {
        oppRandomnessMod = 1.5;
        oppWeightMod = 1.25;
        oppPastEffect = null;
    }

    // 检查对方的未来组合：恶魔 + 太阳
    if (oppHasDevil && oppHasSun) {
        const devilRev = oppTarot.find(c => c.id === '15').reversed;
        const sunRev = oppTarot.find(c => c.id === '19').reversed;
        if (!devilRev && !sunRev) {
            // 正正：高价值×1.5，单牌×1.5，组合×0.425
            oppWeightMod = 1.5;
            oppRandomnessMod = 1.5;
            oppPastEffect = null; // 清除特殊效果
        } else if (devilRev && sunRev) {
            // 逆逆：低价值×0.425，组合×1.4，炸弹概率×0
            oppWeightMod = 0.425;
            oppRandomnessMod = 0.7;
            oppPastEffect = { type: 'weight_random', noBomb: true };
        } else {
            // 一正一逆：恢复默认
            oppWeightMod = 1.0;
            oppRandomnessMod = 1.0;
            oppPastEffect = null;
        }
    }

    // 检查对方的未来组合：恶魔 + 太阳
    if (oppHasDevil && oppHasSun) {
        const devilRev = oppTarot.find(c => c.id === '15').reversed;
        const sunRev = oppTarot.find(c => c.id === '19').reversed;
        if (!devilRev && !sunRev) {
            // 正正：炸弹概率×0.85，若无炸弹则超级烂牌
            oppFutureEffect = {
                type: 'future_bomb_boost',
                bombBoost: 0.85,
                reshuffleIfNoBomb: true,
                reshuffleParams: { weight: 0.4, randomness: 1.8 }
            };
            oppFutureWeightMod = 0.85;
            oppFutureRandomnessMod = 1.8;
        } else if (devilRev && sunRev) {
            // 逆逆：低价值×1.3，高价值×1.3
            oppFutureEffect = {
                type: 'future_weight',
                weightMod: 1.3,
                randomnessMod: 1.5
            };
            oppFutureWeightMod = 1.3;
            oppFutureRandomnessMod = 1.5;
        } else {
            oppFutureEffect = null;
        }
    }

    // 检查对方的过去组合：皇帝 + 女皇
    if (oppHasEmperor && oppHasEmpress) {
        oppWeightMod = 1.1;
        oppRandomnessMod = 0.85;
        oppPastEffect = null;
    }

    // 检查对方的过去组合：魔术师 + 女祭司
    if (oppHasMagician && oppHasPriestess) {
        oppPastEffect = null;
        oppWeightMod = 1.0;
        oppRandomnessMod = 1.0;
        oppPastEffect = { type: 'magician_priestess_combo' };
    }

    // 检查对方的未来组合：隐者 + 女祭司
    if (oppHasHermit && oppHasPriestess) {
        const hermitRev = oppTarot.find(c => c.id === '9').reversed;
        const priestessRev = oppTarot.find(c => c.id === '2').reversed;
        if (!hermitRev && !priestessRev) {
            // 正正：50%好牌，50%超级烂牌
            oppFutureEffect = { type: 'future_weight_gamble' };
            oppFutureWeightMod = 0.5;
            oppFutureRandomnessMod = 0.5;
        } else if (hermitRev && priestessRev) {
            // 逆逆：50%烂牌，50%超级好牌
            oppFutureEffect = { type: 'future_weight_gamble' };
            oppFutureWeightMod = 0.5;
            oppFutureRandomnessMod = 1.0;
        } else {
            // 一正一逆：50%烂牌，50%好牌
            oppFutureEffect = { type: 'future_weight_gamble' };
            oppFutureWeightMod = 0.5;
            oppFutureRandomnessMod = 0.8;
        }
    }
    
    // 检查对方的未来组合：倒吊人 + 恶魔
    if (oppHasHangedMan && oppHasDevil) {
        const hangedRev = oppTarot.find(c => c.id === '12').reversed;
        const devilRev = oppTarot.find(c => c.id === '15').reversed;
        if (!hangedRev && !devilRev) {
            // 正正：炸弹概率×1.5，若无炸弹则好牌重发
            oppFutureEffect = {
                type: 'future_bomb_boost',
                bombBoost: 1.5,
                reshuffleIfNoBomb: true,
                reshuffleParams: { weight: 1.3, randomness: 0.8 }  // 好牌参数
            };
            oppFutureWeightMod = 1.5;
            oppFutureRandomnessMod = 1.0;
        } else if (hangedRev && devilRev) {
            // 逆逆：低价值×1.2，高价值×1.2
            oppFutureEffect = {
                type: 'future_weight',
                weightMod: 1.2,
                randomnessMod: 1.2
            };
            oppFutureWeightMod = 1.2;
            oppFutureRandomnessMod = 1.2;
        } else {
            // 一正一逆：炸弹概率×1.3
            oppFutureEffect = {
                type: 'future_bomb_boost',
                bombBoost: 1.3,
                reshuffleIfNoBomb: false
            };
            oppFutureWeightMod = 1.3;
            oppFutureRandomnessMod = 1.0;
        }
    }

    // 检查对方的过去组合：倒吊人 + 死神
    if (oppHasHangedMan && oppHasDevil) {
        // 替换为三条
        oppPastEffect = {
            type: 'hanged_man_death_combo'
        };
        // 清除其他过去效果
        oppWeightMod = 1.0;
        oppRandomnessMod = 1.0;
    }






    // ===== 记录组合激活状态（用于特效） =====
    window._tarotCombos = {
        my: { activeCards: [] },
        opp: { activeCards: [] }
    };

    // 收集激活的牌ID
    const myActiveCards = [];
    if (myHasMagician && myHasPriestess) { myActiveCards.push('1', '2'); }
    if (myHasEmperor && myHasEmpress) { myActiveCards.push('3', '4'); }
    if (myHasHermit && myHasPriestess) { myActiveCards.push('9', '2'); }
    if (myHasHangedMan && myHasDevil) { myActiveCards.push('12', '15'); }
    if (myHasHangedMan && myHasDeath) { myActiveCards.push('12', '13'); }
    if (myHasDevil && myHasSun) { myActiveCards.push('15', '19'); }
    if (myHasStar && myHasMoon) { myActiveCards.push('17', '18'); }
    if (myHasSun && myHasMoon) { myActiveCards.push('19', '18'); }
    window._tarotCombos.my.activeCards = [...new Set(myActiveCards)];

    const oppActiveCards = [];
    if (oppHasMagician && oppHasPriestess) { oppActiveCards.push('1', '2'); }
    if (oppHasEmperor && oppHasEmpress) { oppActiveCards.push('3', '4'); }
    if (oppHasHermit && oppHasPriestess) { oppActiveCards.push('9', '2'); }
    if (oppHasHangedMan  && oppHasDevil) { oppActiveCards.push('12', '15'); }
    if (oppHasHangedMan  && oppHasDeath) { oppActiveCards.push('12', '13'); }
    if (oppHasDevil && oppHasSun) { oppActiveCards.push('15', '19'); }
    if (oppHasStar && oppHasMoon) { oppActiveCards.push('17', '18'); }
    if (oppHasSun && oppHasMoon) { oppActiveCards.push('19', '18'); }
    window._tarotCombos.opp.activeCards = [...new Set(oppActiveCards)];



    // ★ 应用过去效果（当前局） ★
    // 存储效果供发牌使用
    const pastEffects = {
        my: myPastEffect,
        opp: oppPastEffect
    };

    
    // 执行发牌（带权重）
    // 默认权重1.0
    let myWeightFinal = 1.0;
    let oppWeightFinal = 1.0;
    

    game.shuffle(); // 洗牌准备

    // 检查是否有未来效果需要传递到下一局
    if (myFutureEffect) {
        nextRoundTarotEffect = {
            player: 'me',
            effect: myFutureEffect,
            weightMod: myFutureWeightMod || 1.0,
            randomnessMod: myFutureRandomnessMod || 1.0
        };
    } else if (oppFutureEffect) {
        nextRoundTarotEffect = {
            player: 'opp',
            effect: oppFutureEffect,
            weightMod: oppFutureWeightMod || 1.0,
            randomnessMod: oppFutureRandomnessMod || 1.0
        };
    }

    // 最终权重和随机性
    let myFinalWeight = myWeightMod;
    let oppFinalWeight = oppWeightMod;
    let myFinalRandomness = myRandomnessMod;
    let oppFinalRandomness = oppRandomnessMod;

    // 执行发牌
    game.dealWithWeight(myFinalWeight, oppFinalWeight, myFinalRandomness, oppFinalRandomness);

    // 应用过去效果到已发的手牌
    applyPastEffect(pastEffects);

    // 检查 window._inheritedPastEffect 并应用
    if (window._inheritedPastEffect) {
        applyPastEffect({ my: window._inheritedPastEffect, opp: null });
        window._inheritedPastEffect = null;
    }

    

    
    // 处理皇帝未来逆：计算本局高价值牌数量（rank >= 10）
    if (myFutureEffect && myFutureEffect.type === 'future_randomness_based_on_high_cards') {
        const highCards = game.myHand.filter(c => c.rank >= 10).length;
        const boost = Math.min(highCards * 0.1, 0.6); // 每张+10%，最多60%
        const randomnessMod = 1 + boost;
        // 存储到 nextRoundTarotEffect（将在下一局应用）
        nextRoundTarotEffect = {
            player: 'me',
            effect: { type: 'future_randomness' },
            randomnessMod: randomnessMod
        };
    }
    // 对手同理
    if (oppFutureEffect && oppFutureEffect.type === 'future_randomness_based_on_high_cards') {
        const highCards = game.oppHand.filter(c => c.rank >= 10).length;
        const boost = Math.min(highCards * 0.1, 0.6);
        const randomnessMod = 1 + boost;
        nextRoundTarotEffect = {
            player: 'opp',
            effect: { type: 'future_randomness' },
            randomnessMod: randomnessMod
        };
    }
    
    // 处理女皇未来正：额外抽牌替换最小牌
    if (myFutureEffect && myFutureEffect.type === 'extra_draw_replace') {
        // 从牌组抽一张牌
        if (game.deck.length > 0) {
            const newCard = game.deck.pop();
            // 找到自己手牌中 rank 最小的牌
            let minIdx = 0;
            let minRank = Infinity;
            game.myHand.forEach((c, i) => {
                if (c.rank < minRank) { minRank = c.rank; minIdx = i; }
            });
            // 替换
            game.myHand[minIdx] = newCard;
            game.myHand.sort((a, b) => a.rank - b.rank);
        }
    }
    // 对手同理
    if (oppFutureEffect && oppFutureEffect.type === 'extra_draw_replace') {
        if (game.deck.length > 0) {
            const newCard = game.deck.pop();
            let minIdx = 0;
            let minRank = Infinity;
            game.oppHand.forEach((c, i) => {
                if (c.rank < minRank) { minRank = c.rank; minIdx = i; }
            });
            game.oppHand[minIdx] = newCard;
            game.oppHand.sort((a, b) => a.rank - b.rank);
        }
    }

    // 处理死神未来逆：延续本局过去效果
    if (myFutureEffect && myFutureEffect.type === 'inherit_past' && myPastEffect) {
        // 复制一份过去效果（避免引用）
        const inherited = { ...myPastEffect };
        nextRoundTarotEffect = {
            player: 'me',
            effect: { type: 'inherit_past', pastEffect: inherited }
        };
    }
    // 对手同理
    if (oppFutureEffect && oppFutureEffect.type === 'inherit_past' && oppPastEffect) {
        const inherited = { ...oppPastEffect };
        nextRoundTarotEffect = {
            player: 'opp',
            effect: { type: 'inherit_past', pastEffect: inherited }
        };
    }

    // 未来效果：炸弹检查与重发
    if (nextRoundTarotEffect && nextRoundTarotEffect.reshuffleIfNoBomb) {
        const hasBomb = (hand) => {
            const counts = {};
            hand.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
            return Object.values(counts).some(v => v >= 4);
        };
        // 检查双方是否有炸弹
        if (!hasBomb(game.myHand) && !hasBomb(game.oppHand)) {
            const w = nextRoundTarotEffect.reshuffleParams?.weight || 0.4;
            const r = nextRoundTarotEffect.reshuffleParams?.randomness || 1.8;
            game.dealWithWeight(w, w, r, r);
            // 注意：重发后，之前可能已应用的过去效果（如 force_3）会丢失，但 force_3 是在发牌后通过 applyPastEffect 处理的，所以我们需要重新应用？
            // 但我们还没有调用 applyPastEffect，所以重发后再调用 applyPastEffect 即可。
            // 所以把这段代码放在 applyPastEffect 之前，这样重发后还会执行 applyPastEffect。
        }
    }

    // 处理魔术师未来正：补全顺子
    if (myFutureEffect && myFutureEffect.type === 'fill_straight') {
        const myHand = game.myHand;
        const oppHand = game.oppHand;
        
        // 获取所有非鬼牌的rank（排除愚者0和世界21）
        const myRanks = myHand.filter(c => c.id !== '0' && c.id !== '21').map(c => c.rank).sort((a, b) => a - b);
        const oppRanks = oppHand.filter(c => c.id !== '0' && c.id !== '21').map(c => c.rank).sort((a, b) => a - b);
        
        // 检查是否有4个连续的牌（不包含2和鬼牌，rank 3-15）
        let found = false;
        for (let i = 0; i <= myRanks.length - 4 && !found; i++) {
            const window = myRanks.slice(i, i + 4);
            // 检查是否连续
            let isConsecutive = true;
            for (let j = 1; j < window.length; j++) {
                if (window[j] - window[j-1] !== 1) { isConsecutive = false; break; }
            }
            if (isConsecutive) {
                const startRank = window[0];
                const endRank = window[window.length - 1];
                // 检查能否形成5张顺子（即缺少一张牌）
                const missingRank = startRank - 1 >= 3 ? startRank - 1 : endRank + 1;
                // 检查该牌是否在对方手牌中
                if (oppRanks.includes(missingRank)) {
                    // 从对方手牌中取这张牌
                    const oppIdx = oppHand.findIndex(c => c.rank === missingRank && c.id !== '0' && c.id !== '21');
                    if (oppIdx > -1) {
                        const targetCard = oppHand[oppIdx];
                        // 找自己最大的非鬼牌
                        let maxIdx = 0;
                        let maxRank = -Infinity;
                        myHand.forEach((c, i) => {
                            if (c.id !== '0' && c.id !== '21' && c.rank > maxRank) {
                                maxRank = c.rank;
                                maxIdx = i;
                            }
                        });
                        const myOldCard = myHand[maxIdx];
                        // 交换
                        myHand[maxIdx] = targetCard;
                        oppHand[oppIdx] = myOldCard;
                        // 重新排序
                        myHand.sort((a, b) => a.rank - b.rank);
                        oppHand.sort((a, b) => a.rank - b.rank);
                        found = true;
                    }
                }
            }
        }
    }
    // 对手同理
    if (oppFutureEffect && oppFutureEffect.type === 'fill_straight') {
        const myHand = game.myHand;
        const oppHand = game.oppHand;
        
        const myRanks = myHand.filter(c => c.id !== '0' && c.id !== '21').map(c => c.rank).sort((a, b) => a - b);
        const oppRanks = oppHand.filter(c => c.id !== '0' && c.id !== '21').map(c => c.rank).sort((a, b) => a - b);
        
        let found = false;
        for (let i = 0; i <= oppRanks.length - 4 && !found; i++) {
            const window = oppRanks.slice(i, i + 4);
            let isConsecutive = true;
            for (let j = 1; j < window.length; j++) {
                if (window[j] - window[j-1] !== 1) { isConsecutive = false; break; }
            }
            if (isConsecutive) {
                const startRank = window[0];
                const endRank = window[window.length - 1];
                const missingRank = startRank - 1 >= 3 ? startRank - 1 : endRank + 1;
                if (myRanks.includes(missingRank)) {
                    // 从自己（我方）手牌中取这张牌
                    const myIdx = myHand.findIndex(c => c.rank === missingRank && c.id !== '0' && c.id !== '21');
                    if (myIdx > -1) {
                        const targetCard = myHand[myIdx];
                        // 找对手（对方）最大的非鬼牌
                        let maxIdx = 0;
                        let maxRank = -Infinity;
                        oppHand.forEach((c, i) => {
                            if (c.id !== '0' && c.id !== '21' && c.rank > maxRank) {
                                maxRank = c.rank;
                                maxIdx = i;
                            }
                        });
                        const oppOldCard = oppHand[maxIdx];
                        // 交换
                        oppHand[maxIdx] = targetCard;
                        myHand[myIdx] = oppOldCard;
                        oppHand.sort((a, b) => a.rank - b.rank);
                        myHand.sort((a, b) => a.rank - b.rank);
                        found = true;
                    }
                }
            }
        }
    }

    // 处理审判未来
    if (window._pendingJudgment) {
        const effect = window._pendingJudgment;
        const isMyEffect = (effect.player === 'me');
        const myHand = isMyEffect ? game.myHand : game.oppHand;
        const oppHand = isMyEffect ? game.oppHand : game.myHand;
        
        if (effect.effect.type === 'future_judgment_positive') {
            // 如果对方有愚者/世界，且自己没有
            const oppHasJoker = oppHand.some(c => c.id === '0' || c.id === '21');
            const myHasJoker = myHand.some(c => c.id === '0' || c.id === '21');
            if (oppHasJoker && !myHasJoker) {
                // 找自己最大的非鬼牌
                let maxIdx = 0;
                let maxRank = -Infinity;
                myHand.forEach((c, i) => {
                    if (c.id !== '0' && c.id !== '21' && c.rank > maxRank) {
                        maxRank = c.rank;
                        maxIdx = i;
                    }
                });
                const myMaxCard = myHand[maxIdx];
                // 找对方一张愚者/世界
                const oppJokerIdx = oppHand.findIndex(c => c.id === '0' || c.id === '21');
                if (oppJokerIdx > -1) {
                    const oppJoker = oppHand[oppJokerIdx];
                    // 交换
                    myHand[maxIdx] = oppJoker;
                    oppHand[oppJokerIdx] = myMaxCard;
                    myHand.sort((a, b) => a.rank - b.rank);
                    oppHand.sort((a, b) => a.rank - b.rank);
                }
            }
        } else if (effect.effect.type === 'future_judgment_negative') {
            // 如果自己有愚者/世界，且对方没有
            const myHasJoker = myHand.some(c => c.id === '0' || c.id === '21');
            const oppHasJoker = oppHand.some(c => c.id === '0' || c.id === '21');
            if (myHasJoker && !oppHasJoker) {
                // 找自己的愚者/世界
                const myJokerIdx = myHand.findIndex(c => c.id === '0' || c.id === '21');
                if (myJokerIdx > -1) {
                    const myJoker = myHand[myJokerIdx];
                    // 找对方最大牌
                    let oppMaxIdx = 0;
                    let maxRank = -Infinity;
                    oppHand.forEach((c, i) => {
                        if (c.rank > maxRank) { maxRank = c.rank; oppMaxIdx = i; }
                    });
                    const oppMaxCard = oppHand[oppMaxIdx];
                    // 交换
                    myHand[myJokerIdx] = oppMaxCard;
                    oppHand[oppMaxIdx] = myJoker;
                    myHand.sort((a, b) => a.rank - b.rank);
                    oppHand.sort((a, b) => a.rank - b.rank);
                }
            }
        }
        window._pendingJudgment = null;
    }





    // 使用 nextFirstPlayer 作为先手
    const first = nextFirstPlayer || 'me';
    game.currentPlayer = first;
    game.isMyTurn = (first === 'me');
    game.lastPlay = null;
    game.lastPlayer = null;
    game.passCount = 0;
    game.gameOver = false;
    game.selectedIndices = [];

    sendData({
        type: 'init',
        myHand: game.myHand,
        oppHand: game.oppHand,
        currentPlayer: first,
        myTarot: myTarot,
        oppTarot: oppTarot,
        tarotCombos: window._tarotCombos
    });

    setMessage('游戏开始！' + (game.isMyTurn ? '你先出牌' : '等待对手出牌'), 'info');

    // ---- 发牌动画 ----
    game.isDealing = true;
    updateUI(true); 
    
    // 触发动画
    // 16张牌 * 0.08s + 0.8s = 2.08s
    const dealDuration = 16 * 0.08 + 0.8;
    setTimeout(() => {
        game.isDealing = false;
        updateUI(); // 刷新按钮状态
    }, dealDuration * 1000);

    renderPlay(null, '');
    renderTarot();
}

function applyPastEffect(effects) {
    // effects: { my: { type, cardId, reversed }, opp: { ... } }

    // 处理玩家的过去效果
    if (effects.my) {
        const e = effects.my;
        if (e.type === 'force_3') {
            // 注入一张3，从对手或弃牌堆换一张3到玩家手牌
            const has3 = game.myHand.some(c => c.rank === 3);
            if (!has3) {
                // 找一张最小的牌替换为3
                const minCard = game.myHand.reduce((a, b) => a.rank < b.rank ? a : b);
                const minIdx = game.myHand.indexOf(minCard);
                // 从牌组中找一张3（如果牌组还有）
                const threeCard = game.deck.find(c => c.rank === 3);
                if (threeCard) {
                    game.myHand[minIdx] = threeCard;
                    // 从牌组移除
                    const deckIdx = game.deck.indexOf(threeCard);
                    if (deckIdx > -1) game.deck.splice(deckIdx, 1);
                } else {
                    // 牌组没有3，从对手手牌中交换
                    const oppThree = game.oppHand.find(c => c.rank === 3);
                    if (oppThree) {
                        const oppIdx = game.oppHand.indexOf(oppThree);
                        game.oppHand[oppIdx] = minCard;
                        game.myHand[minIdx] = oppThree;
                    }
                }
                // 重新排序
                game.myHand.sort((a, b) => a.rank - b.rank);
                game.oppHand.sort((a, b) => a.rank - b.rank);
            }
        } else if (e.type === 'reshuffle') {
            // 重新洗牌：合并两人手牌，重新分配（保持每人16张）
            // 但为了公平，只洗自己的牌
            // 更复杂：重新打乱所有手牌并重新分配
            // 简单：交换玩家和对手手牌？不，随机重洗
            const allCards = [...game.myHand, ...game.oppHand];
            for (let i = allCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
            }
            game.myHand = allCards.slice(0, 16);
            game.oppHand = allCards.slice(16);
            game.myHand.sort((a, b) => a.rank - b.rank);
            game.oppHand.sort((a, b) => a.rank - b.rank);
        } else if (e.type === 'swap_card') {
            const direction = e.direction; // 'lowest' 或 'highest'
            const myHand = game.myHand;
            const oppHand = game.oppHand;
            if (myHand.length === 0 || oppHand.length === 0) return;

            // 找出自己的目标牌
            let myTargetCard, myTargetIdx;
            if (direction === 'lowest') {
                // 最小价值牌（rank 最小）
                let minRank = Infinity;
                myHand.forEach((c, i) => {
                    if (c.rank < minRank) { minRank = c.rank; myTargetIdx = i; }
                });
            } else {
                // 最大价值牌
                let maxRank = -Infinity;
                myHand.forEach((c, i) => {
                    if (c.rank > maxRank) { maxRank = c.rank; myTargetIdx = i; }
                });
            }
            myTargetCard = myHand[myTargetIdx];

            // 从对方手牌随机选一张
            const oppRandomIdx = Math.floor(Math.random() * oppHand.length);
            const oppTargetCard = oppHand[oppRandomIdx];

            // 互换
            myHand[myTargetIdx] = oppTargetCard;
            oppHand[oppRandomIdx] = myTargetCard;

            // 重新排序（保持顺序）
            myHand.sort((a, b) => a.rank - b.rank);
            oppHand.sort((a, b) => a.rank - b.rank);
        } else if (e.type === 'magician_priestess_combo') {
            const myHand = game.myHand;
            const oppHand = game.oppHand;
            
            // 检查对方是否有愚者（id: '0'）和世界（id: '21'）
            const oppHasFool = oppHand.some(c => c.id === '0');
            const oppHasWorld = oppHand.some(c => c.id === '21');
            
            let targetCard = null;
            if (oppHasFool && oppHasWorld) {
                // 对方同时拥有愚者和世界 → 获得一张2
                targetCard = game.deck.find(c => c.rank === 16); // 找一张2
            } else if (oppHasFool) {
                // 对方只有愚者 → 获得世界
                targetCard = game.deck.find(c => c.id === '21');
            } else if (oppHasWorld) {
                // 对方只有世界 → 获得愚者
                targetCard = game.deck.find(c => c.id === '0');
            }
            
            if (targetCard) {
                // 替换自己最小的牌
                let minIdx = 0;
                let minRank = Infinity;
                myHand.forEach((c, i) => {
                    if (c.rank < minRank && c.id !== '0' && c.id !== '21') { // 不替换愚者和世界
                        minRank = c.rank;
                        minIdx = i;
                    }
                });
                const oldCard = myHand[minIdx];
                myHand[minIdx] = targetCard;
                // 将旧牌放回牌组
                game.deck.push(oldCard);
                // 从牌组移除目标牌
                const deckIdx = game.deck.indexOf(targetCard);
                if (deckIdx > -1) game.deck.splice(deckIdx, 1);
                // 重新排序
                myHand.sort((a, b) => a.rank - b.rank);
            }
        } else if (e.type === 'hanged_man_past_positive') {
            const myHand = game.myHand;
            const deck = game.deck;
            if (myHand.length === 0) return;
            // 找到自己最低价值牌（rank 最小）
            let minIdx = 0;
            let minRank = Infinity;
            myHand.forEach((c, i) => {
                if (c.rank < minRank) {
                    minRank = c.rank;
                    minIdx = i;
                }
            });
            const myMinCard = myHand[minIdx];
            // 从牌池中找一张比它 rank 高的牌
            const higherCards = deck.filter(c => c.rank > myMinCard.rank);
            if (higherCards.length > 0) {
                const randomHigh = higherCards[Math.floor(Math.random() * higherCards.length)];
                const deckIdx = deck.indexOf(randomHigh);
                if (deckIdx > -1) {
                    // 交换
                    myHand[minIdx] = randomHigh;
                    deck[deckIdx] = myMinCard;
                    // 重新排序
                    myHand.sort((a, b) => a.rank - b.rank);
                }
            }
        } else if (e.type === 'judgment_past_positive') {
            const myHand = game.myHand;
            const oppHand = game.oppHand;
            // 定义散牌：不属于任何牌型的单张（简化：只处理非对子、非顺子、非三条等）
            // 由于判断复杂，我们简单取最小的牌作为散牌，取对方最大的牌作为高价值牌
            if (myHand.length === 0 || oppHand.length === 0) return;
            // 自己最小牌
            let myMinIdx = 0;
            let minRank = Infinity;
            myHand.forEach((c, i) => {
                if (c.rank < minRank) { minRank = c.rank; myMinIdx = i; }
            });
            const myMinCard = myHand[myMinIdx];
            // 对方最大牌
            let oppMaxIdx = 0;
            let maxRank = -Infinity;
            oppHand.forEach((c, i) => {
                if (c.rank > maxRank) { maxRank = c.rank; oppMaxIdx = i; }
            });
            const oppMaxCard = oppHand[oppMaxIdx];
            // 交换
            myHand[myMinIdx] = oppMaxCard;
            oppHand[oppMaxIdx] = myMinCard;
            // 重新排序
            myHand.sort((a, b) => a.rank - b.rank);
            oppHand.sort((a, b) => a.rank - b.rank);
        } else if (e.type === 'judgment_past_negative') {
            const myHand = game.myHand;
            const oppHand = game.oppHand;
            if (myHand.length === 0 || oppHand.length === 0) return;
            // 自己最大牌
            let myMaxIdx = 0;
            let maxRank = -Infinity;
            myHand.forEach((c, i) => {
                if (c.rank > maxRank) { maxRank = c.rank; myMaxIdx = i; }
            });
            const myMaxCard = myHand[myMaxIdx];
            // 对方最小牌
            let oppMinIdx = 0;
            let minRank = Infinity;
            oppHand.forEach((c, i) => {
                if (c.rank < minRank) { minRank = c.rank; oppMinIdx = i; }
            });
            const oppMinCard = oppHand[oppMinIdx];
            // 交换
            myHand[myMaxIdx] = oppMinCard;
            oppHand[oppMinIdx] = myMaxCard;
            // 排序
            myHand.sort((a, b) => a.rank - b.rank);
            oppHand.sort((a, b) => a.rank - b.rank);
        } else if (e.type === 'hanged_man_death_combo') {
            const myHand = game.myHand;
            const deck = game.deck;
            // 选择三张非愚者/世界的牌（即非0和21）
            const nonJokerCards = myHand.filter(c => c.id !== '0' && c.id !== '21');
            if (nonJokerCards.length < 3) return;
            // 随机选三张
            const shuffled = nonJokerCards.sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 3);
            // 获取这三张牌的 rank（取众数，但我们要求三条，需要三张同 rank）
            // 我们随机选择一个 rank 作为目标三条
            const targetRank = selected[Math.floor(Math.random() * selected.length)].rank;
            // 从牌池找三张该 rank 的牌
            const cardsOfRank = deck.filter(c => c.rank === targetRank && c.id !== '0' && c.id !== '21');
            if (cardsOfRank.length >= 3) {
                // 用这三张替换选中的三张
                for (let i = 0; i < 3; i++) {
                    const idx = myHand.indexOf(selected[i]);
                    if (idx > -1) {
                        const newCard = cardsOfRank.pop();
                        const deckIdx = deck.indexOf(newCard);
                        if (deckIdx > -1) {
                            myHand[idx] = newCard;
                            deck[deckIdx] = selected[i];
                        }
                    }
                }
                myHand.sort((a, b) => a.rank - b.rank);
            } else {
                // 牌池不够，尝试从对手手牌换
                const oppHand = game.oppHand;
                const oppCardsOfRank = oppHand.filter(c => c.rank === targetRank && c.id !== '0' && c.id !== '21');
                if (oppCardsOfRank.length >= 3) {
                    for (let i = 0; i < 3; i++) {
                        const idx = myHand.indexOf(selected[i]);
                        if (idx > -1) {
                            const newCard = oppCardsOfRank.pop();
                            const oppIdx = oppHand.indexOf(newCard);
                            if (oppIdx > -1) {
                                myHand[idx] = newCard;
                                oppHand[oppIdx] = selected[i];
                            }
                        }
                    }
                    myHand.sort((a, b) => a.rank - b.rank);
                    oppHand.sort((a, b) => a.rank - b.rank);
                }
                // 如果还是失败，就什么都不做
            }
        }

        if (e.noBomb) {
            // 检查手牌是否有炸弹（四张相同）
            const checkAndRemoveBomb = (hand) => {
                const rankCount = {};
                hand.forEach(c => rankCount[c.rank] = (rankCount[c.rank] || 0) + 1);
                const bombRank = Object.keys(rankCount).find(r => rankCount[r] >= 4);
                if (bombRank) {
                    // 找到所有该 rank 的牌
                    const indices = [];
                    hand.forEach((c, i) => {
                        if (c.rank === Number(bombRank)) indices.push(i);
                    });
                    // 取最后一张
                    const idx = indices.pop();
                    const bombCard = hand[idx];
                    // 从牌组找一张不同 rank 的牌替换
                    let replacement = game.deck.find(c => c.rank !== bombCard.rank);
                    if (replacement) {
                        hand[idx] = replacement;
                        const deckIdx = game.deck.indexOf(replacement);
                        if (deckIdx > -1) game.deck.splice(deckIdx, 1);
                        // 将炸弹牌放回牌组
                        game.deck.push(bombCard);
                    } else {
                        // 牌组没有不同 rank，从对方手牌交换
                        const otherHand = (hand === game.myHand) ? game.oppHand : game.myHand;
                        const otherIdx = otherHand.findIndex(c => c.rank !== bombCard.rank);
                        if (otherIdx > -1) {
                            const otherCard = otherHand[otherIdx];
                            hand[idx] = otherCard;
                            otherHand[otherIdx] = bombCard;
                        }
                    }
                    // 重新排序
                    hand.sort((a, b) => a.rank - b.rank);
                }
            };
            checkAndRemoveBomb(game.myHand);
        }
    }

    // 同样处理对手的过去效果
    if (effects.opp) {
        const e = effects.opp;
        if (e.type === 'force_3') {
            const has3 = game.oppHand.some(c => c.rank === 3);
            if (!has3) {
                const minCard = game.oppHand.reduce((a, b) => a.rank < b.rank ? a : b);
                const minIdx = game.oppHand.indexOf(minCard);
                const threeCard = game.deck.find(c => c.rank === 3);
                if (threeCard) {
                    game.oppHand[minIdx] = threeCard;
                    const deckIdx = game.deck.indexOf(threeCard);
                    if (deckIdx > -1) game.deck.splice(deckIdx, 1);
                } else {
                    const myThree = game.myHand.find(c => c.rank === 3);
                    if (myThree) {
                        const myIdx = game.myHand.indexOf(myThree);
                        game.myHand[myIdx] = minCard;
                        game.oppHand[minIdx] = myThree;
                    }
                }
                game.myHand.sort((a, b) => a.rank - b.rank);
                game.oppHand.sort((a, b) => a.rank - b.rank);
            }
        } else if (e.type === 'reshuffle') {
            const allCards = [...game.myHand, ...game.oppHand];
            for (let i = allCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
            }
            game.myHand = allCards.slice(0, 16);
            game.oppHand = allCards.slice(16);
            game.myHand.sort((a, b) => a.rank - b.rank);
            game.oppHand.sort((a, b) => a.rank - b.rank);
        }

        // 在 applyPastEffect 中，处理完 force_3 和 reshuffle 之后，添加：
        if (e.noBomb) {
            // 检查手牌是否有炸弹（四张相同）
            const checkAndRemoveBomb = (hand) => {
                const rankCount = {};
                hand.forEach(c => rankCount[c.rank] = (rankCount[c.rank] || 0) + 1);
                const bombRank = Object.keys(rankCount).find(r => rankCount[r] >= 4);
                if (bombRank) {
                    // 找到所有该 rank 的牌
                    const indices = [];
                    hand.forEach((c, i) => {
                        if (c.rank === Number(bombRank)) indices.push(i);
                    });
                    // 取最后一张
                    const idx = indices.pop();
                    const bombCard = hand[idx];
                    // 从牌组找一张不同 rank 的牌替换
                    let replacement = game.deck.find(c => c.rank !== bombCard.rank);
                    if (replacement) {
                        hand[idx] = replacement;
                        const deckIdx = game.deck.indexOf(replacement);
                        if (deckIdx > -1) game.deck.splice(deckIdx, 1);
                        // 将炸弹牌放回牌组
                        game.deck.push(bombCard);
                    } else {
                        // 牌组没有不同 rank，从对方手牌交换
                        const otherHand = (hand === game.myHand) ? game.oppHand : game.myHand;
                        const otherIdx = otherHand.findIndex(c => c.rank !== bombCard.rank);
                        if (otherIdx > -1) {
                            const otherCard = otherHand[otherIdx];
                            hand[idx] = otherCard;
                            otherHand[otherIdx] = bombCard;
                        }
                    }
                    // 重新排序
                    hand.sort((a, b) => a.rank - b.rank);
                }
            };
            checkAndRemoveBomb(game.oppHand);
        }
    }
}

function playerPlay() {
    if (!game.isMyTurn || game.gameOver || !isConnected) return;
    const selected = game.getSelectedCards();
    if (selected.length === 0) { setMessage('请选择要出的牌', 'info'); return; }
    const result = game.checkPlay(selected, game.lastPlay, game.lastPlayer, true);
    if (!result.valid) { setMessage('出牌无效: ' + result.reason, 'lose'); return; }
    const playType = result.type;
    const cardIds = selected.map(c => c.id);
    const indices = game.selectedIndices.slice().sort((a, b) => b - a);
    indices.forEach(idx => game.myHand.splice(idx, 1));
    game.selectedIndices = [];
    game.lastPlay = playType;
    game.lastPlayer = 'me';
    game.currentPlayer = 'opp';
    game.isMyTurn = false;
    game.passCount = 0;
    renderPlay(selected, `你出了 ${selected.length} 张`);
    setMessage('你出了牌，等待对手', 'info');
    sendData({ type: 'play', cards: selected, playType: playType, cardIds: cardIds });
    if (game.myHand.length === 0) {
        gameOver();
        return;
    }
    updateUI();
}

function drawTarotCardsForBoth() {
    const shuffled = [...MAJOR_ARCANA];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, 6);
    const myCards = selected.slice(0, 3).map(card => ({
        ...card,
        reversed: Math.random() < 0.5
    }));
    const oppCards = selected.slice(3, 6).map(card => ({
        ...card,
        reversed: Math.random() < 0.5
    }));
    return { myCards, oppCards };
}

function playerPass() {
    if (!game.isMyTurn || game.gameOver || !isConnected) return;
    
    // ★ 清空所有选中的牌
    game.selectedIndices = [];
    
    // 清空上一手牌（表示放弃）
    game.lastPlay = null;
    game.lastPlayer = null;
    game.currentPlayer = 'opp';
    game.isMyTurn = false;
    setMessage('你过牌，等待对手', 'info');
    sendData({ type: 'pass' });
    updateUI();
}

function handleGameOver(sender) {
    // sender: 'host' 或 'guest'
    game.gameOver = true;
    let iWon = (isHost && sender === 'host') || (!isHost && sender === 'guest');
    if (iWon) {
        myWins++;
        setMessage('🎉 你赢了！', 'win');
    } else {
        oppWins++;
        setMessage('😞 你输了', 'lose');
    }
    round++;
    // 设置下一局先手：输方先出
    nextFirstPlayer = (sender === 'host') ? 'opp' : 'me';
    updateUI();
}

function gameOver() {
    const sender = isHost ? 'host' : 'guest';
    handleGameOver(sender);
    sendData({ type: 'gameover', winner: sender });
    if (isHost) {
        // 延迟 1.5 秒后重新开始，确保客机收到消息
        setTimeout(() => {
            startGameAsHost();
        }, 1500);
    }
}

// ============================================================
//  事件绑定
// ============================================================
createBtn.addEventListener('click', () => {
    if (peer) {
        if (conn) { conn.close(); conn = null; }
        isHost = true;
        // 随机先手
        nextFirstPlayer = Math.random() < 0.5 ? 'me' : 'opp';
        setMessage('等待对手加入...', 'info');
        if (peer.destroyed) initPeer();
    } else {
        initPeer();
        setTimeout(() => createBtn.click(), 500);
    }
});

joinBtn.addEventListener('click', () => {
    const id = peerIdInput.value.trim();
    if (!id) { setMessage('请输入房间号', 'lose'); return; }
    if (!peer) {
        initPeer();
        setTimeout(() => joinBtn.click(), 500);
        return;
    }
    if (conn) { conn.close(); conn = null; }
    conn = peer.connect(id, { reliable: true });
    isHost = false;
    setupConnection();
    setMessage('正在连接...', 'info');
});

playBtn.addEventListener('click', playerPlay);
passBtn.addEventListener('click', playerPass);
resetBtn.addEventListener('click', () => {
    if (isHost && isConnected) {
        startGameAsHost();
    } else {
        setMessage('只有房主可以重新开始', 'info');
    }
});

// ============================================================
//  大字模式切换
// ============================================================
const largeFontBtn = document.getElementById('largeFontBtn');
largeFontBtn.addEventListener('click', () => {
    document.body.classList.toggle('large-mode');
    const isLarge = document.body.classList.contains('large-mode');
    largeFontBtn.textContent = isLarge ? '🔍 正常模式' : '🔍 大字模式';
});

// 初始化
initPeer();
console.log('🎴 塔罗跑得快已启动');