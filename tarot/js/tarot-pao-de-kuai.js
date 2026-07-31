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
    const isFaceUp = (playerId === 'me'); // 自己的牌正面，对手背面

    container.innerHTML = '';
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

        if (effect.effect.type === 'future_chariot_positive') {
            if (Math.random() < effect.effect.stealFirstChance) {
                // 抢夺先手
                nextFirstPlayer = (effect.player === 'me') ? 'me' : 'opp';
            }
            // 清空效果
            nextRoundTarotEffect = null;
        }

        if (effect.effect.type === 'future_justice') {
            if (effect.player === 'me') {
                myWeight = effect.weightMod;
                myRandomness = effect.randomnessMod;
            } else {
                oppWeight = effect.weightMod;
                oppRandomness = effect.randomnessMod;
            }
            nextRoundTarotEffect = null;
        }

        // 清空，避免重复使用
        nextRoundTarotEffect = null;
    }

    if (nextRoundTarotEffect && nextRoundTarotEffect.effect.type === 'inherit_past') {
        const inherited = nextRoundTarotEffect.effect.pastEffect;
        window._inheritedPastEffect = inherited;

        // 清空 nextRoundTarotEffect，避免重复
        nextRoundTarotEffect = null;
    }

    // 生成塔罗牌
    const { myCards: myTarot, oppCards: oppTarot } = drawTarotCardsForBoth();
    window._myTarot = myTarot;
    window._oppTarot = oppTarot;

    // ===== 使用通用解析函数 =====
    const myEffects = parseTarotEffects('me', myTarot, myWins, oppWins);
    const oppEffects = parseTarotEffects('opp', oppTarot, myWins, oppWins);

    // 从解析结果中提取变量，保持与原变量名一致，方便后续组合代码使用
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

    // 存储过去效果（供 applyPastEffect 使用）
    const pastEffects = {
        me: myPastEffect,
        opp: oppPastEffect
    };

    

    if (myPastEffect && myPastEffect.stealFirstChance) {
        const currentFirst = nextFirstPlayer || 'me';
        if (currentFirst === 'opp' && Math.random() < myPastEffect.stealFirstChance) {
            nextFirstPlayer = 'me';
        }
    }
    if (oppPastEffect && oppPastEffect.stealFirstChance) {
        const currentFirst = nextFirstPlayer || 'me';
        if (currentFirst === 'me' && Math.random() < oppPastEffect.stealFirstChance) {
            nextFirstPlayer = 'opp';
        }
    }


    // 检查我方的过去组合
    const myHasMagician = myTarot.some(c => c.id === '1');
    const myHasPriestess = myTarot.some(c => c.id === '2');
    const myHasEmpress = myTarot.some(c => c.id === '3');
    const myHasEmperor = myTarot.some(c => c.id === '4');
    const myHasPope = myTarot.some(c => c.id === '5');
    const myHasLovers = myTarot.some(c => c.id === '6');
    const myHasChariot = myTarot.some(c => c.id === '7');
    const myHasStrength = myTarot.some(c => c.id === '8');
    const myHasHermit = myTarot.some(c => c.id === '9');
    const myHasJustice = myTarot.some(c => c.id === '11');
    const myHasHangedMan = myTarot.some(c => c.id === '12');
    const myHasDeath = myTarot.some(c => c.id === '13');
    const myHasTemperance = myTarot.some(c => c.id === '14');
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

    // 检查我方的过去组合：恋人 + 恶魔
    if (myHasLovers && myHasDevil) {
        myPastEffect = { type: 'lovers_devil_combo' };
        myWeightMod = 1.0;
        myRandomnessMod = 1.0;
    }

    // 检查我方的过去组合：恋人 + 魔术师
    if (myHasLovers && myHasMagician) {
        myPastEffect = { type: 'lovers_magician_combo' };
        myWeightMod = 1.0;
        myRandomnessMod = 1.0;
    }

    // 检查我方的过去组合：战车 + 力量
    if (myHasChariot && myHasStrength) {
        myWeightMod = 1.3;
        myRandomnessMod = 0.7;
        myPastEffect = {
            type: 'chariot_strength_combo',
            stealFirstChance: 0.5
        };
    }

    // 检查我方的未来组合：皇帝 + 教皇
    if (myHasEmperor && myHasPope) {
        myFutureEffect = {
            type: 'future_weight_gamble',
            weightMod: 0.8,
            randomnessMod: 0.3  // 超级好牌
        };
        myFutureWeightMod = 0.8;
        myFutureRandomnessMod = 0.3;
    }

    // 检查我方的未来组合：节制 + 恶魔
    if (myHasTemperance && myHasDevil) {
        myFutureEffect = {
            type: 'future_bomb_boost',
            bombBoost: 1.4,
            reshuffleIfNoBomb: false
        };
        myFutureWeightMod = 1.4;
        myFutureRandomnessMod = 1.0;
    }

    // 检查我方的过去组合：太阳 + 月亮 + 星星
    if (myHasSun && myHasMoon && myHasStar) {
        // 高价值×1.3，低价值×1.3，顺子×1.3，对子×1.3，随机-20%
        myWeightMod = 1.3;
        myRandomnessMod = 0.8;
        myPastEffect = null;  // 清除单独效果
    }






    // 处理对手的组合
    const oppHasMagician = oppTarot.some(c => c.id === '1');
    const oppHasPriestess = oppTarot.some(c => c.id === '2');
    const oppHasEmpress = oppTarot.some(c => c.id === '3');
    const oppHasEmperor = oppTarot.some(c => c.id === '4');
    const oppHasPope = oppTarot.some(c => c.id === '5');
    const oppHasLovers = oppTarot.some(c => c.id === '6');
    const oppHasChariot = oppTarot.some(c => c.id === '7');
    const oppHasStrength = oppTarot.some(c => c.id === '8');
    const oppHasHermit = oppTarot.some(c => c.id === '9');
    const oppHasJustice = oppTarot.some(c => c.id === '11');
    const oppHasHangedMan = oppTarot.some(c => c.id === '12');
    const oppHasDeath = oppTarot.some(c => c.id === '13');
    const oppHasTemperance = oppTarot.some(c => c.id === '14');
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

    // 检查对方的过去组合：恋人 + 恶魔
    if (oppHasLovers && oppHasDevil) {
        oppPastEffect = { type: 'lovers_devil_combo' };
        oppWeightMod = 1.0;
        oppRandomnessMod = 1.0;
    }

    // 检查对方的过去组合：恋人 + 魔术师
    if (oppHasLovers && oppHasMagician) {
        oppPastEffect = { type: 'lovers_magician_combo' };
        oppWeightMod = 1.0;
        oppRandomnessMod = 1.0;
    }

    // 检查对方的过去组合：战车 + 力量
    if (oppHasChariot && oppHasStrength) {
        oppWeightMod = 1.3;
        oppRandomnessMod = 0.7;
        oppPastEffect = {
            type: 'chariot_strength_combo',
            stealFirstChance: 0.5
        };
    }

    // 检查对方的未来组合：皇帝 + 教皇
    if (oppHasEmperor && oppHasPope) {
        oppFutureEffect = {
            type: 'future_weight_gamble',
            weightMod: 0.8,
            randomnessMod: 0.3  // 超级好牌
        };
        oppFutureWeightMod = 0.8;
        oppFutureRandomnessMod = 0.3;
    }

    // 检查对方的未来组合：节制 + 恶魔
    if (oppHasTemperance && oppHasDevil) {
        oppFutureEffect = {
            type: 'future_bomb_boost',
            bombBoost: 1.4,
            reshuffleIfNoBomb: false
        };
        oppFutureWeightMod = 1.4;
        oppFutureRandomnessMod = 1.0;
    }

    // 检查对方的过去组合：太阳 + 月亮 + 星星
    if (oppHasSun && oppHasMoon && oppHasStar) {
        // 高价值×1.3，低价值×1.3，顺子×1.3，对子×1.3，随机-20%
        oppWeightMod = 1.3;
        oppRandomnessMod = 0.8;
        oppPastEffect = null;  // 清除单独效果
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
    if (myHasEmperor && myHasPope) { myActiveCards.push('4', '5'); }
    if (myHasLovers && myHasDevil) { myActiveCards.push('6', '15'); }
    if (myHasLovers && myHasMagician) { myActiveCards.push('6', '1'); }
    if (myHasChariot && myHasStrength) { myActiveCards.push('7', '8'); }
    if (myHasHermit && myHasPriestess) { myActiveCards.push('9', '2'); }
    if (myHasHangedMan && myHasDevil) { myActiveCards.push('12', '15'); }
    if (myHasHangedMan && myHasDeath) { myActiveCards.push('12', '13'); }
    if (myHasTemperance && myHasDevil) { myActiveCards.push('14', '15'); }
    if (myHasDevil && myHasSun) { myActiveCards.push('15', '19'); }
    if (myHasStar && myHasMoon) { myActiveCards.push('17', '18'); }
    if (myHasSun && myHasMoon) { myActiveCards.push('19', '18'); }
    if (myHasSun && myHasMoon && myHasStar) { myActiveCards.push('19', '18', '17'); }
    window._tarotCombos.my.activeCards = [...new Set(myActiveCards)];

    const oppActiveCards = [];
    if (oppHasEmperor && oppHasPope) { oppActiveCards.push('4', '5'); }
    if (oppHasMagician && oppHasPriestess) { oppActiveCards.push('1', '2'); }
    if (oppHasEmperor && oppHasEmpress) { oppActiveCards.push('3', '4'); }
    if (oppHasLovers && oppHasDevil) { oppActiveCards.push('6', '15'); }
    if (oppHasLovers && oppHasMagician) { oppActiveCards.push('6', '1'); }
    if (oppHasChariot && oppHasStrength) { oppActiveCards.push('7', '8'); }
    if (oppHasHermit && oppHasPriestess) { oppActiveCards.push('9', '2'); }
    if (oppHasHangedMan  && oppHasDevil) { oppActiveCards.push('12', '15'); }
    if (oppHasHangedMan  && oppHasDeath) { oppActiveCards.push('12', '13'); }
    if (oppHasTemperance && oppHasDevil) { oppActiveCards.push('14', '15'); }
    if (oppHasDevil && oppHasSun) { oppActiveCards.push('15', '19'); }
    if (oppHasStar && oppHasMoon) { oppActiveCards.push('17', '18'); }
    if (oppHasSun && oppHasMoon) { oppActiveCards.push('19', '18'); }
    if (oppHasSun && oppHasMoon && oppHasStar) { oppActiveCards.push('19', '18', '17'); }
    window._tarotCombos.opp.activeCards = [...new Set(oppActiveCards)];



    // ★ 应用过去效果（当前局） ★
    // 存储效果供发牌使用
    // const pastEffects = {
    //     my: myPastEffect,
    //     opp: oppPastEffect
    // };

    
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
        const highCards = game.players.me.hand.filter(c => c.rank >= 10).length;
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
        const highCards = game.players.opp.hand.filter(c => c.rank >= 10).length;
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
            game.players.me.hand.forEach((c, i) => {
                if (c.rank < minRank) { minRank = c.rank; minIdx = i; }
            });
            // 替换
            game.players.me.hand[minIdx] = newCard;
            game.players.me.hand.sort((a, b) => a.rank - b.rank);
        }
    }
    // 对手同理
    if (oppFutureEffect && oppFutureEffect.type === 'extra_draw_replace') {
        if (game.deck.length > 0) {
            const newCard = game.deck.pop();
            let minIdx = 0;
            let minRank = Infinity;
            game.players.opp.hand.forEach((c, i) => {
                if (c.rank < minRank) { minRank = c.rank; minIdx = i; }
            });
            game.players.opp.hand[minIdx] = newCard;
            game.players.opp.hand.sort((a, b) => a.rank - b.rank);
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
        if (!hasBomb(game.players.me.hand) && !hasBomb(game.players.opp.hand)) {
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
        const myHand = game.players.me.hand;
        const oppHand = game.players.opp.hand;
        
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
        const myHand = game.players.me.hand;
        const oppHand = game.players.opp.hand;
        
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
        const myHand = isMyEffect ? game.players.me.hand : game.players.opp.hand;
        const oppHand = isMyEffect ? game.players.opp.hand : game.players.me.hand;
        
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
        players: {
            me: game.players.me,
            opp: game.players.opp
        },
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
    } else {
        game.players.opp.wins++;
        oppWins = game.players.opp.wins;
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