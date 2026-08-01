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
        this.players = {
            me: { hand: [], tarot: [], wins: 0 },
            opp: { hand: [], tarot: [], wins: 0 }
        };
        this.players.me.wins = 0;
        this.players.opp.wins = 0;
        this.deck = [];
        // this.myHand = [];
        // this.oppHand = [];
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
        return this.selectedIndices.map(i => this.players.me.hand[i]);
    }
    dealWithWeight(myWeight, oppWeight, myRandomness = 1.0, oppRandomness = 1.0) {
        // 清空手牌
        this.players.me.hand = [];
        this.players.opp.hand = [];

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
            if (myCard) this.players.me.hand.push(myCard);
            if (oppCard) this.players.opp.hand.push(oppCard);
        }

        this.players.me.hand.sort((a, b) => a.rank - b.rank);
        this.players.opp.hand.sort((a, b) => a.rank - b.rank);
        this.deck = deck;
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

/**
 * 渲染指定玩家的手牌
 * @param {string} playerId - 'me' 或 'opp'
 * @param {boolean} animate - 是否播放动画
 */
function renderHand(playerId, animate = false) {
    const player = game.players[playerId];
    const container = document.getElementById(playerId === 'me' ? 'myHand' : 'oppHand');
    const countEl = document.getElementById(playerId === 'me' ? 'myCount' : 'oppCount');
    const isFaceUp = (playerId === 'me');

    container.innerHTML = '';
    // 为对手手牌添加叠放类
    container.classList.remove('hand-cards-opp');
    if (playerId === 'opp') {
        container.classList.add('hand-cards-opp');
    }
    
    const fragments = [];

    player.hand.forEach((card, idx) => {
        // 只有自己的牌才能被选中
        const selected = (playerId === 'me' && game.selectedIndices.includes(idx));
        const el = renderCard(card, isFaceUp, selected);

        // 点击事件：只有自己的牌可以点击选择
        if (playerId === 'me') {
            el.addEventListener('click', () => {
                if (game.isDealing || !game.isMyTurn || game.gameOver || !isConnected) return;
                const idx2 = game.selectedIndices.indexOf(idx);
                if (idx2 > -1) {
                    game.selectedIndices.splice(idx2, 1);
                } else {
                    game.selectedIndices.push(idx);
                }
                // 重新渲染自己的手牌（不需要动画）
                renderHand('me', false);
            });
        }

        // 先隐藏，用于动画
        el.style.opacity = '0';
        el.style.transition = 'none';
        container.appendChild(el);
        fragments.push({ el, idx });
    });

    // 更新计数
    countEl.textContent = player.hand.length;

    // 如果不需要动画，直接显示
    if (!animate) {
        fragments.forEach(({ el }) => { el.style.opacity = '1'; });
        return;
    }

    // ---- 动画逻辑（从原 renderMyHand 复制，适配 container） ----
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    requestAnimationFrame(() => {
        const rects = fragments.map(({ el }) => el.getBoundingClientRect());

        fragments.forEach(({ el }, i) => {
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
    renderHand('me', animate);
    renderHand('opp', animate);
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
            // 客机需要交换 players 数据（因为房主把自己当 me）
            if (!isHost) {
                // 交换 players
                const tempMe = data.players.opp;
                const tempOpp = data.players.me;
                game.players.me = tempMe;
                game.players.opp = tempOpp;

                // 交换塔罗牌
                window._myTarot = data.oppTarot;
                window._oppTarot = data.myTarot;

                // 交换 combo
                const tmpCombo = data.tarotCombos.opp;
                data.tarotCombos.opp = data.tarotCombos.my;
                data.tarotCombos.my = tmpCombo;
                window._tarotCombos = data.tarotCombos;

                // 交换 currentPlayer
                game.currentPlayer = data.currentPlayer === 'me' ? 'opp' : 'me';
            } else {
                // 房主直接使用
                game.players = data.players;
                window._myTarot = data.myTarot;
                window._oppTarot = data.oppTarot;
                window._tarotCombos = data.tarotCombos;
                game.currentPlayer = data.currentPlayer;
            }

            // ---- 以下是通用初始化逻辑（无论房主还是客机都执行） ----
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
            const oppIds = data.cardIds;
            oppIds.forEach(id => {
                const idx = game.players.opp.hand.findIndex(c => c.id === id);
                if (idx > -1) game.players.opp.hand.splice(idx, 1);
            });
            game.lastPlay = data.playType;
            game.lastPlayer = game.currentPlayer;
            game.currentPlayer = (game.currentPlayer === 'me' ? 'opp' : 'me');
            game.isMyTurn = (game.currentPlayer === 'me');
            renderPlay(data.cards, `对手出了 ${data.cards.length} 张`);
            setMessage('对手出牌，轮到你', 'info', 'play');
            updateUI();
            break;
        }
        case 'pass': {
            // 过牌后清空上一手牌，切换回合
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
//  辅助函数（用于拆分 startGameAsHost）
// ============================================================

/**
 * 处理上一局遗留的未来效果
 * 返回 { myWeight, oppWeight, myRandomness, oppRandomness, nextFirstPlayer }
 */
function handlePreviousFutureEffects() {
    let myWeight = 1.0;
    let oppWeight = 1.0;
    let myRandomness = 1.0;
    let oppRandomness = 1.0;

    if (!nextRoundTarotEffect) {
        return { myWeight, oppWeight, myRandomness, oppRandomness };
    }

    const effect = nextRoundTarotEffect;
    const player = effect.player;

    // 处理权重和随机性
    if (effect.effect.type === 'future_weight' || effect.effect.type === 'high_weights') {
        if (player === 'me') myWeight = effect.weightMod;
        else oppWeight = effect.weightMod;
    } else if (effect.effect.type === 'future_weight_bad') {
        if (player === 'me') {
            myWeight = effect.weightMod;
            myRandomness = effect.randomnessMod;
        } else {
            oppWeight = effect.weightMod;
            oppRandomness = effect.randomnessMod;
        }
    } else if (effect.effect.type === 'future_randomness') {
        if (player === 'me') myRandomness = effect.randomnessMod;
        else oppRandomness = effect.randomnessMod;
    }

    // 处理 gamble 类型
    if (effect.effect.type === 'future_weight_gamble') {
        const goodChance = effect.weightMod;
        const isGood = Math.random() < goodChance;
        const weight = isGood ? 1.3 : 0.7;
        const randomness = isGood ? 0.8 : (effect.randomnessMod || 0.7);
        if (player === 'me') {
            myWeight = weight;
            myRandomness = randomness;
        } else {
            oppWeight = weight;
            oppRandomness = randomness;
        }
    }

    // 处理先手控制
    if (effect.effect.type === 'future_forced_first') {
        nextFirstPlayer = 'me';
    } else if (effect.effect.type === 'future_forced_give_first') {
        nextFirstPlayer = 'opp';
    }

    // 处理高塔未来
    if (effect.effect.type === 'future_high_tower_positive' || effect.effect.type === 'future_high_tower_negative') {
        if (player === 'me') {
            myRandomness = effect.randomnessMod;
            myWeight = effect.weightMod;
        } else {
            oppRandomness = effect.randomnessMod;
            oppWeight = effect.weightMod;
        }
        nextRoundTarotEffect = null;
    }

    // 处理审判未来（标记待处理）
    if (effect.effect.type === 'future_judgment_positive' || effect.effect.type === 'future_judgment_negative') {
        window._pendingJudgment = effect;
        nextRoundTarotEffect = null;
    }

    // 处理战车未来正
    if (effect.effect.type === 'future_chariot_positive') {
        if (Math.random() < effect.effect.stealFirstChance) {
            nextFirstPlayer = (player === 'me') ? 'me' : 'opp';
        }
        nextRoundTarotEffect = null;
    }

    // 处理正义未来
    if (effect.effect.type === 'future_justice') {
        if (player === 'me') {
            myWeight = effect.weightMod;
            myRandomness = effect.randomnessMod;
        } else {
            oppWeight = effect.weightMod;
            oppRandomness = effect.randomnessMod;
        }
        nextRoundTarotEffect = null;
    }

    // 处理继承过去效果
    if (effect.effect.type === 'inherit_past') {
        window._inheritedPastEffect = effect.effect.pastEffect;
        nextRoundTarotEffect = null;
    }

    // 清空，避免重复使用
    nextRoundTarotEffect = null;

    return { myWeight, oppWeight, myRandomness, oppRandomness };
}

/**
 * 应用过去效果的先手抢夺逻辑
 */
function applyStealFirstChance(pastEffects) {
    if (pastEffects.me && pastEffects.me.stealFirstChance) {
        const currentFirst = nextFirstPlayer || 'me';
        if (currentFirst === 'opp' && Math.random() < pastEffects.me.stealFirstChance) {
            nextFirstPlayer = 'me';
        }
    }
    if (pastEffects.opp && pastEffects.opp.stealFirstChance) {
        const currentFirst = nextFirstPlayer || 'me';
        if (currentFirst === 'me' && Math.random() < pastEffects.opp.stealFirstChance) {
            nextFirstPlayer = 'opp';
        }
    }
}

/**
 * 执行发牌和应用过去效果
 */
function dealAndApplyPastEffects(pastEffects, myWeightMod, oppWeightMod, myRandomnessMod, oppRandomnessMod) {
    game.shuffle();
    game.dealWithWeight(myWeightMod, oppWeightMod, myRandomnessMod, oppRandomnessMod);
    applyPastEffect(pastEffects);
    if (window._inheritedPastEffect) {
        applyPastEffect({ me: window._inheritedPastEffect, opp: null });
        window._inheritedPastEffect = null;
    }
}

/**
 * 处理特殊未来效果（皇帝逆、女皇正、死神逆、炸弹检查、魔术师正、审判）
 */
function handleSpecialFutureEffects(myFutureEffect, oppFutureEffect, myPastEffect, oppPastEffect) {
    // 皇帝未来逆：计算高价值牌数量
    if (myFutureEffect && myFutureEffect.type === 'future_randomness_based_on_high_cards') {
        const highCards = game.players.me.hand.filter(c => c.rank >= 10).length;
        const boost = Math.min(highCards * 0.1, 0.6);
        nextRoundTarotEffect = {
            player: 'me',
            effect: { type: 'future_randomness' },
            randomnessMod: 1 + boost
        };
    }
    if (oppFutureEffect && oppFutureEffect.type === 'future_randomness_based_on_high_cards') {
        const highCards = game.players.opp.hand.filter(c => c.rank >= 10).length;
        const boost = Math.min(highCards * 0.1, 0.6);
        nextRoundTarotEffect = {
            player: 'opp',
            effect: { type: 'future_randomness' },
            randomnessMod: 1 + boost
        };
    }

    // 女皇未来正：额外抽牌替换最小牌
    if (myFutureEffect && myFutureEffect.type === 'extra_draw_replace') {
        if (game.deck.length > 0) {
            const newCard = game.deck.pop();
            let minIdx = 0, minRank = Infinity;
            game.players.me.hand.forEach((c, i) => {
                if (c.rank < minRank) { minRank = c.rank; minIdx = i; }
            });
            game.players.me.hand[minIdx] = newCard;
            game.players.me.hand.sort((a, b) => a.rank - b.rank);
        }
    }
    if (oppFutureEffect && oppFutureEffect.type === 'extra_draw_replace') {
        if (game.deck.length > 0) {
            const newCard = game.deck.pop();
            let minIdx = 0, minRank = Infinity;
            game.players.opp.hand.forEach((c, i) => {
                if (c.rank < minRank) { minRank = c.rank; minIdx = i; }
            });
            game.players.opp.hand[minIdx] = newCard;
            game.players.opp.hand.sort((a, b) => a.rank - b.rank);
        }
    }

    // 死神未来逆：延续过去效果
    if (myFutureEffect && myFutureEffect.type === 'inherit_past' && myPastEffect) {
        nextRoundTarotEffect = {
            player: 'me',
            effect: { type: 'inherit_past', pastEffect: { ...myPastEffect } }
        };
    }
    if (oppFutureEffect && oppFutureEffect.type === 'inherit_past' && oppPastEffect) {
        nextRoundTarotEffect = {
            player: 'opp',
            effect: { type: 'inherit_past', pastEffect: { ...oppPastEffect } }
        };
    }

    // 炸弹检查与重发
    if (nextRoundTarotEffect && nextRoundTarotEffect.reshuffleIfNoBomb) {
        const hasBomb = (hand) => {
            const counts = {};
            hand.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
            return Object.values(counts).some(v => v >= 4);
        };
        if (!hasBomb(game.players.me.hand) && !hasBomb(game.players.opp.hand)) {
            const w = nextRoundTarotEffect.reshuffleParams?.weight || 0.4;
            const r = nextRoundTarotEffect.reshuffleParams?.randomness || 1.8;
            game.dealWithWeight(w, w, r, r);
        }
    }

    // 魔术师未来正：补全顺子
    if (myFutureEffect && myFutureEffect.type === 'fill_straight') {
        fillStraight('me');
    }
    if (oppFutureEffect && oppFutureEffect.type === 'fill_straight') {
        fillStraight('opp');
    }

    // 审判未来
    if (window._pendingJudgment) {
        applyJudgmentEffect();
        window._pendingJudgment = null;
    }
}

/**
 * 补全顺子（魔术师未来正）
 */
function fillStraight(playerId) {
    const isMe = (playerId === 'me');
    const myHand = game.players.me.hand;
    const oppHand = game.players.opp.hand;
    const targetHand = isMe ? myHand : oppHand;
    const otherHand = isMe ? oppHand : myHand;

    const targetRanks = targetHand.filter(c => c.id !== '0' && c.id !== '21').map(c => c.rank).sort((a, b) => a - b);
    const otherRanks = otherHand.filter(c => c.id !== '0' && c.id !== '21').map(c => c.rank).sort((a, b) => a - b);

    let found = false;
    for (let i = 0; i <= targetRanks.length - 4 && !found; i++) {
        const window = targetRanks.slice(i, i + 4);
        let isConsecutive = true;
        for (let j = 1; j < window.length; j++) {
            if (window[j] - window[j-1] !== 1) { isConsecutive = false; break; }
        }
        if (isConsecutive) {
            const startRank = window[0];
            const endRank = window[window.length - 1];
            const missingRank = startRank - 1 >= 3 ? startRank - 1 : endRank + 1;
            if (otherRanks.includes(missingRank)) {
                const otherIdx = otherHand.findIndex(c => c.rank === missingRank && c.id !== '0' && c.id !== '21');
                if (otherIdx > -1) {
                    const targetCard = otherHand[otherIdx];
                    let maxIdx = 0, maxRank = -Infinity;
                    targetHand.forEach((c, i) => {
                        if (c.id !== '0' && c.id !== '21' && c.rank > maxRank) {
                            maxRank = c.rank;
                            maxIdx = i;
                        }
                    });
                    const oldCard = targetHand[maxIdx];
                    targetHand[maxIdx] = targetCard;
                    otherHand[otherIdx] = oldCard;
                    targetHand.sort((a, b) => a.rank - b.rank);
                    otherHand.sort((a, b) => a.rank - b.rank);
                    found = true;
                }
            }
        }
    }
}

/**
 * 应用审判效果
 */
function applyJudgmentEffect() {
    const effect = window._pendingJudgment;
    const isMyEffect = (effect.player === 'me');
    const myHand = isMyEffect ? game.players.me.hand : game.players.opp.hand;
    const oppHand = isMyEffect ? game.players.opp.hand : game.players.me.hand;

    if (effect.effect.type === 'future_judgment_positive') {
        const oppHasJoker = oppHand.some(c => c.id === '0' || c.id === '21');
        const myHasJoker = myHand.some(c => c.id === '0' || c.id === '21');
        if (oppHasJoker && !myHasJoker) {
            let maxIdx = 0, maxRank = -Infinity;
            myHand.forEach((c, i) => {
                if (c.id !== '0' && c.id !== '21' && c.rank > maxRank) {
                    maxRank = c.rank;
                    maxIdx = i;
                }
            });
            const myMaxCard = myHand[maxIdx];
            const oppJokerIdx = oppHand.findIndex(c => c.id === '0' || c.id === '21');
            if (oppJokerIdx > -1) {
                const oppJoker = oppHand[oppJokerIdx];
                myHand[maxIdx] = oppJoker;
                oppHand[oppJokerIdx] = myMaxCard;
                myHand.sort((a, b) => a.rank - b.rank);
                oppHand.sort((a, b) => a.rank - b.rank);
            }
        }
    } else if (effect.effect.type === 'future_judgment_negative') {
        const myHasJoker = myHand.some(c => c.id === '0' || c.id === '21');
        const oppHasJoker = oppHand.some(c => c.id === '0' || c.id === '21');
        if (myHasJoker && !oppHasJoker) {
            const myJokerIdx = myHand.findIndex(c => c.id === '0' || c.id === '21');
            if (myJokerIdx > -1) {
                const myJoker = myHand[myJokerIdx];
                let oppMaxIdx = 0, maxRank = -Infinity;
                oppHand.forEach((c, i) => {
                    if (c.rank > maxRank) { maxRank = c.rank; oppMaxIdx = i; }
                });
                const oppMaxCard = oppHand[oppMaxIdx];
                myHand[myJokerIdx] = oppMaxCard;
                oppHand[oppMaxIdx] = myJoker;
                myHand.sort((a, b) => a.rank - b.rank);
                oppHand.sort((a, b) => a.rank - b.rank);
            }
        }
    }
}


// ============================================================
//  游戏控制
// ============================================================
function startGameAsHost() {
    console.log('startGameAsHost 被调用');
    if (!isHost) return;

    // 1. 处理上一局的未来效果
    const futureResult = handlePreviousFutureEffects();
    let myWeight = futureResult.myWeight;
    let oppWeight = futureResult.oppWeight;
    let myRandomness = futureResult.myRandomness;
    let oppRandomness = futureResult.oppRandomness;

    // 2. 生成塔罗牌
    const { myCards: myTarot, oppCards: oppTarot } = drawTarotCardsForBoth();
    window._myTarot = myTarot;
    window._oppTarot = oppTarot;

    // 3. 解析塔罗牌效果
    const myEffects = parseTarotEffects('me', myTarot, myWins, oppWins);
    const oppEffects = parseTarotEffects('opp', oppTarot, myWins, oppWins);

    let myWeightMod = myEffects.weightMod;
    let myRandomnessMod = myEffects.randomnessMod;
    let myPastEffect = myEffects.pastEffect;
    let myFutureEffect = myEffects.futureEffect;
    let myFutureWeightMod = myEffects.futureWeightMod;
    let myFutureRandomnessMod = myEffects.futureRandomnessMod;

    let oppWeightMod = oppEffects.weightMod;
    let oppRandomnessMod = oppEffects.randomnessMod;
    let oppPastEffect = oppEffects.pastEffect;
    let oppFutureEffect = oppEffects.futureEffect;
    let oppFutureWeightMod = oppEffects.futureWeightMod;
    let oppFutureRandomnessMod = oppEffects.futureRandomnessMod;

    // 4. 应用组合效果
    const myCombined = applyComboEffects(myTarot, {
        weightMod: myWeightMod,
        randomnessMod: myRandomnessMod,
        pastEffect: myPastEffect,
        futureEffect: myFutureEffect,
        futureWeightMod: myFutureWeightMod,
        futureRandomnessMod: myFutureRandomnessMod
    }, 'me');

    const oppCombined = applyComboEffects(oppTarot, {
        weightMod: oppWeightMod,
        randomnessMod: oppRandomnessMod,
        pastEffect: oppPastEffect,
        futureEffect: oppFutureEffect,
        futureWeightMod: oppFutureWeightMod,
        futureRandomnessMod: oppFutureRandomnessMod
    }, 'opp');

    myWeightMod = myCombined.weightMod;
    myRandomnessMod = myCombined.randomnessMod;
    myPastEffect = myCombined.pastEffect;
    myFutureEffect = myCombined.futureEffect;
    myFutureWeightMod = myCombined.futureWeightMod;
    myFutureRandomnessMod = myCombined.futureRandomnessMod;

    oppWeightMod = oppCombined.weightMod;
    oppRandomnessMod = oppCombined.randomnessMod;
    oppPastEffect = oppCombined.pastEffect;
    oppFutureEffect = oppCombined.futureEffect;
    oppFutureWeightMod = oppCombined.futureWeightMod;
    oppFutureRandomnessMod = oppCombined.futureRandomnessMod;

    const pastEffects = {
        me: myPastEffect,
        opp: oppPastEffect
    };

    // 5. 应用先手抢夺
    applyStealFirstChance(pastEffects);

    // 6. 记录组合激活状态（UI特效）
    window._tarotCombos = {
        my: { activeCards: collectActiveCards(myTarot) },
        opp: { activeCards: collectActiveCards(oppTarot) }
    };

    // 7. 存储未来效果到下一局
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

    // 8. 发牌并应用过去效果
    dealAndApplyPastEffects(pastEffects, myWeightMod, oppWeightMod, myRandomnessMod, oppRandomnessMod);

    // 9. 处理特殊未来效果
    handleSpecialFutureEffects(myFutureEffect, oppFutureEffect, myPastEffect, oppPastEffect);

    // 10. 初始化游戏状态
    const first = nextFirstPlayer || 'me';
    game.currentPlayer = first;
    game.isMyTurn = (first === 'me');
    game.lastPlay = null;
    game.lastPlayer = null;
    game.passCount = 0;
    game.gameOver = false;
    game.selectedIndices = [];

    // 11. 发送网络数据
    sendData({
        type: 'init',
        players: {
            me: game.players.me,
            opp: game.players.opp
        },
        currentPlayer: first,
        myTarot: myTarot,
        oppTarot: oppTarot,
        tarotCombos: window._tarotCombos
    });

    // 12. UI 更新
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
}

function applyPastEffect(effects) {
    // effects: { me: { type, cardId, reversed }, opp: { ... } }
    ['me', 'opp'].forEach(playerId => {
        const effect = effects[playerId];
        if (!effect) return;

        const hand = game.players[playerId].hand;
        const otherHand = game.players[playerId === 'me' ? 'opp' : 'me'].hand;
        const deck = game.deck;

        // 内部函数用于检查并移除炸弹
        const checkAndRemoveBomb = (targetHand) => {
            const rankCount = {};
            targetHand.forEach(c => rankCount[c.rank] = (rankCount[c.rank] || 0) + 1);
            const bombRank = Object.keys(rankCount).find(r => rankCount[r] >= 4);
            if (bombRank) {
                const indices = [];
                targetHand.forEach((c, i) => {
                    if (c.rank === Number(bombRank)) indices.push(i);
                });
                const idx = indices.pop();
                const bombCard = targetHand[idx];
                let replacement = deck.find(c => c.rank !== bombCard.rank);
                if (replacement) {
                    targetHand[idx] = replacement;
                    const deckIdx = deck.indexOf(replacement);
                    if (deckIdx > -1) deck.splice(deckIdx, 1);
                    deck.push(bombCard);
                } else {
                    const otherHandLocal = (targetHand === hand) ? otherHand : hand;
                    const otherIdx = otherHandLocal.findIndex(c => c.rank !== bombCard.rank);
                    if (otherIdx > -1) {
                        const otherCard = otherHandLocal[otherIdx];
                        targetHand[idx] = otherCard;
                        otherHandLocal[otherIdx] = bombCard;
                    }
                }
                targetHand.sort((a, b) => a.rank - b.rank);
            }
        };

        // 根据 effect.type 处理
        switch (effect.type) {
            case 'force_3': {
                const has3 = hand.some(c => c.rank === 3);
                if (!has3) {
                    const minCard = hand.reduce((a, b) => a.rank < b.rank ? a : b);
                    const minIdx = hand.indexOf(minCard);
                    const threeCard = deck.find(c => c.rank === 3);
                    if (threeCard) {
                        hand[minIdx] = threeCard;
                        const deckIdx = deck.indexOf(threeCard);
                        if (deckIdx > -1) deck.splice(deckIdx, 1);
                    } else {
                        const oppThree = otherHand.find(c => c.rank === 3);
                        if (oppThree) {
                            const oppIdx = otherHand.indexOf(oppThree);
                            otherHand[oppIdx] = minCard;
                            hand[minIdx] = oppThree;
                        }
                    }
                    hand.sort((a, b) => a.rank - b.rank);
                    otherHand.sort((a, b) => a.rank - b.rank);
                }
                break;
            }
            case 'reshuffle': {
                const allCards = [...game.players.me.hand, ...game.players.opp.hand];
                for (let i = allCards.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
                }
                game.players.me.hand = allCards.slice(0, 16);
                game.players.opp.hand = allCards.slice(16);
                game.players.me.hand.sort((a, b) => a.rank - b.rank);
                game.players.opp.hand.sort((a, b) => a.rank - b.rank);
                break;
            }
            case 'swap_card': {
                const direction = effect.direction; // 'lowest' 或 'highest'
                if (hand.length === 0 || otherHand.length === 0) return;
                let targetIdx;
                if (direction === 'lowest') {
                    let minRank = Infinity;
                    hand.forEach((c, i) => {
                        if (c.rank < minRank) { minRank = c.rank; targetIdx = i; }
                    });
                } else {
                    let maxRank = -Infinity;
                    hand.forEach((c, i) => {
                        if (c.rank > maxRank) { maxRank = c.rank; targetIdx = i; }
                    });
                }
                const targetCard = hand[targetIdx];
                const randomIdx = Math.floor(Math.random() * otherHand.length);
                const randomCard = otherHand[randomIdx];
                hand[targetIdx] = randomCard;
                otherHand[randomIdx] = targetCard;
                hand.sort((a, b) => a.rank - b.rank);
                otherHand.sort((a, b) => a.rank - b.rank);
                break;
            }
            case 'magician_priestess_combo': {
                const oppHasFool = otherHand.some(c => c.id === '0');
                const oppHasWorld = otherHand.some(c => c.id === '21');
                let targetCard = null;
                if (oppHasFool && oppHasWorld) {
                    targetCard = deck.find(c => c.rank === 16);
                } else if (oppHasFool) {
                    targetCard = deck.find(c => c.id === '21');
                } else if (oppHasWorld) {
                    targetCard = deck.find(c => c.id === '0');
                }
                if (targetCard) {
                    let minIdx = 0;
                    let minRank = Infinity;
                    hand.forEach((c, i) => {
                        if (c.rank < minRank && c.id !== '0' && c.id !== '21') {
                            minRank = c.rank;
                            minIdx = i;
                        }
                    });
                    const oldCard = hand[minIdx];
                    hand[minIdx] = targetCard;
                    deck.push(oldCard);
                    const deckIdx = deck.indexOf(targetCard);
                    if (deckIdx > -1) deck.splice(deckIdx, 1);
                    hand.sort((a, b) => a.rank - b.rank);
                }
                break;
            }
            case 'hanged_man_past_positive': {
                if (hand.length === 0) return;
                let minIdx = 0;
                let minRank = Infinity;
                hand.forEach((c, i) => {
                    if (c.rank < minRank) { minRank = c.rank; minIdx = i; }
                });
                const minCard = hand[minIdx];
                const higherCards = deck.filter(c => c.rank > minCard.rank);
                if (higherCards.length > 0) {
                    const randomHigh = higherCards[Math.floor(Math.random() * higherCards.length)];
                    const deckIdx = deck.indexOf(randomHigh);
                    if (deckIdx > -1) {
                        hand[minIdx] = randomHigh;
                        deck[deckIdx] = minCard;
                        hand.sort((a, b) => a.rank - b.rank);
                    }
                }
                break;
            }
            case 'judgment_past_positive': {
                if (hand.length === 0 || otherHand.length === 0) return;
                let handMinIdx = 0, minRank = Infinity;
                hand.forEach((c, i) => {
                    if (c.rank < minRank) { minRank = c.rank; handMinIdx = i; }
                });
                const handMinCard = hand[handMinIdx];
                let oppMaxIdx = 0, maxRank = -Infinity;
                otherHand.forEach((c, i) => {
                    if (c.rank > maxRank) { maxRank = c.rank; oppMaxIdx = i; }
                });
                const oppMaxCard = otherHand[oppMaxIdx];
                hand[handMinIdx] = oppMaxCard;
                otherHand[oppMaxIdx] = handMinCard;
                hand.sort((a, b) => a.rank - b.rank);
                otherHand.sort((a, b) => a.rank - b.rank);
                break;
            }
            case 'judgment_past_negative': {
                if (hand.length === 0 || otherHand.length === 0) return;
                let handMaxIdx = 0, maxRank = -Infinity;
                hand.forEach((c, i) => {
                    if (c.rank > maxRank) { maxRank = c.rank; handMaxIdx = i; }
                });
                const handMaxCard = hand[handMaxIdx];
                let oppMinIdx = 0, minRank = Infinity;
                otherHand.forEach((c, i) => {
                    if (c.rank < minRank) { minRank = c.rank; oppMinIdx = i; }
                });
                const oppMinCard = otherHand[oppMinIdx];
                hand[handMaxIdx] = oppMinCard;
                otherHand[oppMinIdx] = handMaxCard;
                hand.sort((a, b) => a.rank - b.rank);
                otherHand.sort((a, b) => a.rank - b.rank);
                break;
            }
            case 'hanged_man_death_combo': {
                const nonJokerCards = hand.filter(c => c.id !== '0' && c.id !== '21');
                if (nonJokerCards.length < 3) return;
                const shuffled = nonJokerCards.sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, 3);
                const targetRank = selected[Math.floor(Math.random() * selected.length)].rank;
                const cardsOfRank = deck.filter(c => c.rank === targetRank && c.id !== '0' && c.id !== '21');
                if (cardsOfRank.length >= 3) {
                    for (let i = 0; i < 3; i++) {
                        const idx = hand.indexOf(selected[i]);
                        if (idx > -1) {
                            const newCard = cardsOfRank.pop();
                            const deckIdx = deck.indexOf(newCard);
                            if (deckIdx > -1) {
                                hand[idx] = newCard;
                                deck[deckIdx] = selected[i];
                            }
                        }
                    }
                    hand.sort((a, b) => a.rank - b.rank);
                } else {
                    const oppCardsOfRank = otherHand.filter(c => c.rank === targetRank && c.id !== '0' && c.id !== '21');
                    if (oppCardsOfRank.length >= 3) {
                        for (let i = 0; i < 3; i++) {
                            const idx = hand.indexOf(selected[i]);
                            if (idx > -1) {
                                const newCard = oppCardsOfRank.pop();
                                const oppIdx = otherHand.indexOf(newCard);
                                if (oppIdx > -1) {
                                    hand[idx] = newCard;
                                    otherHand[oppIdx] = selected[i];
                                }
                            }
                        }
                        hand.sort((a, b) => a.rank - b.rank);
                        otherHand.sort((a, b) => a.rank - b.rank);
                    }
                }
                break;
            }
            case 'lovers_devil_combo': {
                if (hand.length === 0 || otherHand.length === 0) return;
                let handMaxIdx = 0, maxRank = -Infinity;
                hand.forEach((c, i) => {
                    if (c.rank > maxRank) { maxRank = c.rank; handMaxIdx = i; }
                });
                const handMaxCard = hand[handMaxIdx];
                let oppMaxIdx = 0, oppMaxRank = -Infinity;
                otherHand.forEach((c, i) => {
                    if (c.rank > oppMaxRank) { oppMaxRank = c.rank; oppMaxIdx = i; }
                });
                const oppMaxCard = otherHand[oppMaxIdx];
                hand[handMaxIdx] = oppMaxCard;
                otherHand[oppMaxIdx] = handMaxCard;
                hand.sort((a, b) => a.rank - b.rank);
                otherHand.sort((a, b) => a.rank - b.rank);
                break;
            }
            case 'lovers_magician_combo': {
                const myCount = {};
                hand.forEach(c => myCount[c.rank] = (myCount[c.rank] || 0) + 1);
                const oppCount = {};
                otherHand.forEach(c => oppCount[c.rank] = (oppCount[c.rank] || 0) + 1);
                const mySingles = hand.filter(c => myCount[c.rank] === 1 && c.id !== '0' && c.id !== '21');
                const oppSingles = otherHand.filter(c => oppCount[c.rank] === 1 && c.id !== '0' && c.id !== '21');
                const myRanks = mySingles.map(c => c.rank);
                const oppRanks = oppSingles.map(c => c.rank);
                for (let r of myRanks) {
                    if (oppRanks.includes(r)) {
                        const myIdx = hand.findIndex(c => c.rank === r && c.id !== '0' && c.id !== '21');
                        const oppIdx = otherHand.findIndex(c => c.rank === r && c.id !== '0' && c.id !== '21');
                        if (myIdx > -1 && oppIdx > -1) {
                            const temp = hand[myIdx];
                            hand[myIdx] = otherHand[oppIdx];
                            otherHand[oppIdx] = temp;
                            break;
                        }
                    }
                }
                hand.sort((a, b) => a.rank - b.rank);
                otherHand.sort((a, b) => a.rank - b.rank);
                break;
            }
            case 'weight_random': {
                // 仅用于 noBomb 检查
                break;
            }
            default:
                break;
        }

        // 处理 noBomb（炸弹移除）
        if (effect.noBomb) {
            checkAndRemoveBomb(hand);
        }
    });
}

/**
 * 收集激活的组合牌ID（用于 UI 特效）
 */
function collectActiveCards(tarotCards) {
    const active = new Set();
    TAROT_COMBOS.forEach(config => {
        const allExist = config.cards.every(id => tarotCards.some(c => c.id === id));
        if (allExist) {
            config.cards.forEach(id => active.add(id));
        }
    });
    return [...active];
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
    indices.forEach(idx => game.players.me.hand.splice(idx, 1));
    game.selectedIndices = [];
    game.lastPlay = playType;
    game.lastPlayer = 'me';
    game.currentPlayer = 'opp';
    game.isMyTurn = false;
    game.passCount = 0;
    renderPlay(selected, `你出了 ${selected.length} 张`);
    setMessage('你出了牌，等待对手', 'info');
    sendData({ type: 'play', cards: selected, playType: playType, cardIds: cardIds });
    if (game.players.me.hand.length === 0) {
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

function parseTarotEffects(playerId, tarotCards, myWins, oppWins) {
    let weightMod = 1.0;
    let randomnessMod = 1.0;
    let pastEffect = null;
    let futureEffect = null;
    let futureWeightMod = 1.0;
    let futureRandomnessMod = 1.0;

    tarotCards.forEach((card, idx) => {
        const pos = ['past', 'present', 'future'][idx];
        const config = TAROT_EFFECTS[card.id];

        // 处理正义（特殊依赖比分）
        if (card.id === '11') {
            const diff = Math.abs(myWins - oppWins);
            let comboMultiplier;
            if (!card.reversed) {
                if (myWins > oppWins) comboMultiplier = Math.min(diff * 0.1 + 1, 2);
                else if (myWins < oppWins) comboMultiplier = 1 - Math.min(diff * 0.1, 0.9);
                else comboMultiplier = 1;
            } else {
                if (myWins < oppWins) comboMultiplier = Math.min(diff * 0.1 + 1, 2);
                else if (myWins > oppWins) comboMultiplier = 1 - Math.min(diff * 0.1, 0.9);
                else comboMultiplier = 1;
            }
            const wMod = 0.9 + comboMultiplier * 0.1;
            const rMod = 1.1 - comboMultiplier * 0.1;
            if (pos === 'past') {
                pastEffect = { type: 'weight_random', weightMod: wMod, randomnessMod: rMod };
                weightMod *= wMod;
                randomnessMod *= rMod;
            } else if (pos === 'future') {
                futureEffect = { type: 'future_justice', comboMultiplier, randomnessMod: rMod };
                futureWeightMod = wMod;
                futureRandomnessMod = rMod;
            }
            return;
        }

        if (!config) return;

        if (pos === 'past' && config.past) {
            const result = config.past(card.reversed);
            if (result) {
                pastEffect = { ...result, cardId: card.id, reversed: card.reversed };
                if (result.weightMod) weightMod *= result.weightMod;
                if (result.randomnessMod) randomnessMod *= result.randomnessMod;
            }
        } else if (pos === 'future' && config.future) {
            const result = config.future(card.reversed);
            if (result) {
                futureEffect = { ...result, cardId: card.id, reversed: card.reversed };
                if (result.weightMod) futureWeightMod = result.weightMod;
                if (result.randomnessMod) futureRandomnessMod = result.randomnessMod;
                // 特殊标记：战车未来逆
                if (result.type === 'future_chariot_negative_pending') {
                    window._pendingChariotNegative = playerId;
                    // 不存储为实际效果，清除
                    futureEffect = null;
                }
            }
        }
    });

    return { weightMod, randomnessMod, pastEffect, futureEffect, futureWeightMod, futureRandomnessMod };
}

/**
 * 应用组合效果
 * @param {Array} tarotCards - 三张塔罗牌
 * @param {Object} effects - 当前累积的效果对象 { weightMod, randomnessMod, pastEffect, futureEffect, futureWeightMod, futureRandomnessMod }
 * @param {string} playerId - 'me' 或 'opp'
 * @param {Object} playerContext - { playerId, myWins, oppWins }（用于动态判断）
 * @returns {Object} 修改后的效果对象
 */
function applyComboEffects(tarotCards, effects, playerId) {
    // 检查某张牌是否存在以及它的正逆位
    function getCardReversed(cardId) {
        const card = tarotCards.find(c => c.id === cardId);
        return card ? card.reversed : null;
    }

    // 判断组合的正逆位模式
    function getComboPattern(cardIds) {
        const reverseds = cardIds.map(id => getCardReversed(id));
        // 如果任何一张牌不存在，返回 null
        if (reverseds.some(r => r === null)) return null;
        const positiveCount = reverseds.filter(r => r === false).length;
        const negativeCount = reverseds.filter(r => r === true).length;
        if (negativeCount === 0) return 'positive';
        if (positiveCount === 0) return 'negative';
        return 'mixed';
    }

    // 复制效果对象，避免修改原对象
    const result = {
        weightMod: effects.weightMod || 1.0,
        randomnessMod: effects.randomnessMod || 1.0,
        pastEffect: effects.pastEffect || null,
        futureEffect: effects.futureEffect || null,
        futureWeightMod: effects.futureWeightMod || 1.0,
        futureRandomnessMod: effects.futureRandomnessMod || 1.0
    };

    // 遍历所有组合配置
    TAROT_COMBOS.forEach(config => {
        const pattern = getComboPattern(config.cards);
        if (!pattern) return; // 条件不满足

        // 选择对应的效果配置
        let effectConfig = null;
        if (config.any) {
            effectConfig = config.any;
        } else if (pattern === 'positive' && config.positive) {
            effectConfig = config.positive;
        } else if (pattern === 'negative' && config.negative) {
            effectConfig = config.negative;
        } else if (pattern === 'mixed' && config.mixed) {
            effectConfig = config.mixed;
        }

        if (!effectConfig) return;

        // 应用效果
        if (effectConfig.weightMod !== undefined) {
            result.weightMod = effectConfig.weightMod;
        }
        if (effectConfig.randomnessMod !== undefined) {
            result.randomnessMod = effectConfig.randomnessMod;
        }
        if (effectConfig.clearPastEffect) {
            result.pastEffect = null;
        }
        if (effectConfig.pastEffect) {
            result.pastEffect = effectConfig.pastEffect;
        }
        if (effectConfig.clearFutureEffect) {
            result.futureEffect = null;
        }
        if (effectConfig.futureEffect) {
            result.futureEffect = effectConfig.futureEffect;
        }
        if (effectConfig.futureWeightMod !== undefined) {
            result.futureWeightMod = effectConfig.futureWeightMod;
        }
        if (effectConfig.futureRandomnessMod !== undefined) {
            result.futureRandomnessMod = effectConfig.futureRandomnessMod;
        }
    });

    return result;
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
        game.players.me.wins++;
        myWins = game.players.me.wins; // 同步到全局，保持 UI 显示一致
        setMessage('🎉 你赢了！', 'win', 'play');
    } else {
        game.players.opp.wins++;
        oppWins = game.players.opp.wins;
        setMessage('😞 你输了', 'lose', 'play');
    }
    round++;
    // 设置下一局先手：输方先出
    nextFirstPlayer = (sender === 'host') ? 'opp' : 'me';

    // 处理战车未来逆：根据胜负调整下一局随机性
    if (window._pendingChariotNegative) {
        const player = window._pendingChariotNegative;
        const isMe = (player === 'me');
        const resultRandomness = iWon ? 1.5 : 0.5; // 胜利+50%，失败-50%
        // 存储到 nextRoundTarotEffect
        if (isMe) {
            nextRoundTarotEffect = {
                player: 'me',
                effect: { type: 'future_randomness' },
                randomnessMod: resultRandomness
            };
        } else {
            nextRoundTarotEffect = {
                player: 'opp',
                effect: { type: 'future_randomness' },
                randomnessMod: resultRandomness
            };
        }
        window._pendingChariotNegative = null;
    }

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