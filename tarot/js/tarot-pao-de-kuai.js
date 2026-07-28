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
    { rank: 3,  label: '3',   imgId: '3' },
    { rank: 4,  label: '4',   imgId: '4' },
    { rank: 5,  label: '5',   imgId: '5' },
    { rank: 6,  label: '6',   imgId: '6' },
    { rank: 7,  label: '7',   imgId: '7' },
    { rank: 8,  label: '8',   imgId: '8' },
    { rank: 9,  label: '9',   imgId: '9' },
    { rank: 10, label: '10',  imgId: '10' },
    { rank: 11, label: '侍从', imgId: '侍从' },
    { rank: 12, label: '骑士', imgId: '骑士' },   // 原 J
    { rank: 13, label: '皇后', imgId: '皇后' },   // 原 Q
    { rank: 14, label: '国王', imgId: '国王' },   // 原 K
    { rank: 15, label: 'A',   imgId: '1' },      // Ace
    { rank: 16, label: '2',   imgId: '2' }
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
            if (allValid && sorted.length >= 2 && sorted[sorted.length-1] - sorted[0] === sorted.length - 1) {
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
                if (range1 && sorted.length >= 5 && sorted[sorted.length-1] - sorted[0] === sorted.length-1) {
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
                        if (newRanks[i] - newRanks[i-1] !== 1) {
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
    dealWithWeight(myWeight, oppWeight) {
        // myWeight: 玩家的权重乘数（1.0 为正常）
        // oppWeight: 对手的权重乘数
        this.myHand = [];
        this.oppHand = [];

        // 构建完整牌组
        let deck = buildDeck();
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // 根据权重分配牌：权重越高，越可能拿到好牌
        // 策略：先发基础牌，再用权重微调
        // 为了简化，我们用权重影响抽牌时的"价值倾向"
        // 对于每张牌，给一个"价值分"，权重高的玩家更容易拿到高分牌
        
        // 定义牌的价值分（rank越高分越高，但鬼牌特殊）
        const getCardValue = (card) => {
            if (card.isJoker) return card.rank; // 17,18
            return card.rank; // 3~16
        };

        // 抽牌函数（带权重）
        const drawWeighted = (weight) => {
            if (deck.length === 0) return null;
            // 权重影响：抽取前 weight 倍的概率偏向高分牌
            // 实现：按权重对牌排序，然后随机抽取前 N 张中的一张
            const sorted = [...deck].sort((a, b) => (getCardValue(b) - getCardValue(a)) * weight);
            const poolSize = Math.max(1, Math.floor(deck.length * Math.min(1, weight / 2)));
            const idx = Math.floor(Math.random() * Math.min(poolSize, sorted.length));
            const card = sorted[idx];
            const deckIdx = deck.indexOf(card);
            if (deckIdx > -1) deck.splice(deckIdx, 1);
            return card;
        };

        // 发牌：每人16张
        for (let i = 0; i < 16; i++) {
            const myCard = drawWeighted(myWeight || 1.0);
            const oppCard = drawWeighted(oppWeight || 1.0);
            if (myCard) this.myHand.push(myCard);
            if (oppCard) this.oppHand.push(oppCard);
        }

        this.myHand.sort((a, b) => a.rank - b.rank);
        this.oppHand.sort((a, b) => a.rank - b.rank);
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

function renderMyHand() {
    myHandEl.innerHTML = '';
    game.myHand.forEach((card, idx) => {
        const el = renderCard(card, true, game.selectedIndices.includes(idx));
        el.addEventListener('click', () => {
            if (!game.isMyTurn || game.gameOver || !isConnected) return;
            const idx2 = game.selectedIndices.indexOf(idx);
            if (idx2 > -1) {
                game.selectedIndices.splice(idx2, 1);
            } else {
                game.selectedIndices.push(idx);
            }
            renderMyHand();
        });
        myHandEl.appendChild(el);
    });
    myCountEl.textContent = game.myHand.length;
}

function renderOppHand() {
    oppHandEl.innerHTML = '';
    game.oppHand.forEach((card) => {
        const el = renderCard(card, false); // 背面
        oppHandEl.appendChild(el);
    });
    oppCountEl.textContent = game.oppHand.length;
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

function updateUI() {
    renderMyHand();
    renderOppHand();
    myWinsEl.textContent = myWins;
    oppWinsEl.textContent = oppWins;
    roundInfoEl.textContent = `第 ${round} 局`;
    playBtn.disabled = !game.isMyTurn || game.gameOver || !isConnected;
    // 过牌按钮：只有轮到自己的回合、游戏未结束、上一手牌存在且不是自己出的才能过牌
    const canPass = game.isMyTurn && !game.gameOver && isConnected && game.lastPlay && game.lastPlayer !== 'me';
    passBtn.disabled = !canPass;
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

    // 对手的塔罗牌
    if (window._oppTarot && window._oppTarot.length === 3) {
        const positions = ['过去', '现在', '未来'];
        window._oppTarot.forEach((card, idx) => {
            const div = document.createElement('div');
            div.className = 'tarot-card-mini';
            
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
                // 正逆位指示
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
                // 显示正逆位标签在背面
                const indicator = document.createElement('div');
                indicator.className = card.reversed ? 'tarot-reverse-indicator' : 'tarot-upright-indicator';
                indicator.textContent = card.reversed ? '逆位' : '正位';
                div.appendChild(indicator);
            }
            div.appendChild(img);
            oppContainer.appendChild(div);
        });
    }

    // 自己的塔罗牌（全部正面）
    if (window._myTarot && window._myTarot.length === 3) {
        const positions = ['过去', '现在', '未来'];
        window._myTarot.forEach((card, idx) => {
            const div = document.createElement('div');
            div.className = 'tarot-card-mini';
            
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
                window._myTarot = data.oppTarot;   // 客机自己的
                window._oppTarot = data.myTarot;   // 对手的
                game.currentPlayer = data.currentPlayer === 'me' ? 'opp' : 'me';
            } else {
                game.myHand = data.myHand;
                game.oppHand = data.oppHand;
                window._myTarot = data.myTarot;
                window._oppTarot = data.oppTarot;
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
            updateUI();
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

    // ===== 🧪 测试模式：强制产生效果 =====
    // 取消注释下面任意一行，强制触发对应效果

    // 测试1：强制自己的过去抽到“命运之轮正位”（重新洗牌）
    // window._FORCE_MY_PAST = { cardId: '10', reversed: false };

    // 测试2：强制自己的过去抽到“命运之轮逆位”（必定有3）
    // window._FORCE_MY_PAST = { cardId: '10', reversed: true };

    // 测试3：强制自己的未来抽到“命运之轮正位”（高牌权重 1.3）
    // window._FORCE_MY_FUTURE = { cardId: '10', reversed: false };

    // 测试4：强制自己的未来抽到“命运之轮逆位”（50%好/烂）
    // window._FORCE_MY_FUTURE = { cardId: '10', reversed: true };
    // ==========================================

    // ★ 检查是否有上一局的未来效果 ★
    let myWeight = 1.0;
    let oppWeight = 1.0;

    if (nextRoundTarotEffect) {
        const effect = nextRoundTarotEffect;
        if (effect.player === 'me') {
            if (effect.effect.type === 'high_weights') {
                myWeight = 1.3; // 高牌权重增加
            } else if (effect.effect.type === 'gamble') {
                // 50%概率好牌，50%烂牌
                if (Math.random() < 0.5) {
                    myWeight = 1.3;
                } else {
                    myWeight = 0.7;
                }
            }
        } else if (effect.player === 'opp') {
            if (effect.effect.type === 'high_weights') {
                oppWeight = 1.3;
            } else if (effect.effect.type === 'gamble') {
                if (Math.random() < 0.5) {
                    oppWeight = 1.3;
                } else {
                    oppWeight = 0.7;
                }
            }
        }
        // 清空，避免重复使用
        nextRoundTarotEffect = null;
    }

    // 生成塔罗牌
    const myTarot = drawTarotCards();
    const oppTarot = drawTarotCards();
    window._myTarot = myTarot;
    window._oppTarot = oppTarot;

    // ★ 解析塔罗牌效果，计算发牌权重 ★
    let myPastEffect = null;
    let oppPastEffect = null;
    let myFutureEffect = null;
    let oppFutureEffect = null;

    // 解析我的塔罗牌
    myTarot.forEach((card, idx) => {
        const position = ['past', 'present', 'future'][idx];
        if (position === 'past') {
            myPastEffect = { cardId: card.id, reversed: card.reversed };
            // 命运之轮 过去效果
            if (card.id === '10') {
                if (!card.reversed) {
                    // 正：随机重新洗牌（即再次打乱，但牌不变）
                    // 这里我们用特殊标记，在发牌后执行
                    myPastEffect.type = 'reshuffle';
                } else {
                    // 逆：必定有一张3
                    myPastEffect.type = 'force_3';
                }
            }
        } else if (position === 'future') {
            myFutureEffect = { cardId: card.id, reversed: card.reversed };
            if (card.id === '10') {
                if (!card.reversed) {
                    // 正：高牌权重
                    myFutureEffect.type = 'high_weights';
                } else {
                    // 逆：50%好牌 50%烂牌
                    myFutureEffect.type = 'gamble';
                }
            }
        }
    });

    // 同样解析对手的塔罗牌
    oppTarot.forEach((card, idx) => {
        const position = ['past', 'present', 'future'][idx];
        if (position === 'past') {
            oppPastEffect = { cardId: card.id, reversed: card.reversed };
            if (card.id === '10') {
                if (!card.reversed) {
                    oppPastEffect.type = 'reshuffle';
                } else {
                    oppPastEffect.type = 'force_3';
                }
            }
        } else if (position === 'future') {
            oppFutureEffect = { cardId: card.id, reversed: card.reversed };
            if (card.id === '10') {
                if (!card.reversed) {
                    oppFutureEffect.type = 'high_weights';
                } else {
                    oppFutureEffect.type = 'gamble';
                }
            }
        }
    });

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

    // 如果过去效果是 force_3，需要在发牌后注入3
    // 如果过去效果是 reshuffle，发牌后再洗牌（发牌正常，然后重新排序）

    // ★ 先正常发牌（权重默认1.0，后续再调整） ★
    game.shuffle(); // 洗牌准备
    // 生成牌组并分配（由于 dealWithWeight 需要 deck，我们直接用 game.deal() 后再处理）
    // 但为了支持权重，我们直接调用 dealWithWeight
    // 如果未来有效果，会影响下一局，暂时忽略

    // 检查是否有未来效果需要传递到下一局
    if (myFutureEffect) {
        nextRoundTarotEffect = { player: 'me', effect: myFutureEffect };
    } else if (oppFutureEffect) {
        nextRoundTarotEffect = { player: 'opp', effect: oppFutureEffect };
    }

    // 应用权重：如果有未来效果且是 high_weights，当前局不受影响，下一局生效
    // 所以当前局权重为1.0
    // 但如果未来效果是 gamble，当前局也不受影响

    // 但过去效果会影响当前局
    // force_3: 发牌后注入一张3
    // reshuffle: 发牌后重新洗牌（但牌不变）

    // 执行发牌
    game.dealWithWeight(myWeightFinal, oppWeightFinal);

    // ★ 应用过去效果到已发的手牌 ★
    applyPastEffect(pastEffects);

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
        oppTarot: oppTarot
    });

    setMessage('游戏开始！' + (game.isMyTurn ? '你先出牌' : '等待对手出牌'), 'info');
    updateUI();
    renderPlay(null, '');
    renderTarot();
}

function applyPastEffect(effects) {
    // effects: { my: { type, cardId, reversed }, opp: { ... } }

    // 处理玩家的过去效果
    if (effects.my) {
        const e = effects.my;
        if (e.type === 'force_3') {
            // 注入一张3：从对手或弃牌堆换一张3到玩家手牌
            // 简单实现：从牌组中找一张3，如果牌组没有则从对手手牌交换
            // 由于牌组已为空（发牌后剩余26张），我们直接交换
            // 更简单：从对手手牌中拿一张3，换一张玩家手中的牌
            // 但我们不能直接操作对手牌，所以从已发牌中寻找
            // 策略：从玩家手牌中移除一张最小牌，从对手手牌中拿一张3
            // 但为了公平，我们直接“创造”一张3，用一张2替换
            // 极端情况：玩家已经有3，则什么都不做
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

function playerPass() {
    if (!game.isMyTurn || game.gameOver || !isConnected) return;
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