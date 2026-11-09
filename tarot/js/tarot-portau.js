// ============================================================
//  js/tarot-portau.js
//  塔罗 Portau —— P2P 对战
// ============================================================

// ---------- 网络 / 身份 ----------
let peer = null;
let conn = null;
let isHost = false;
let myPeerId = '';
let isConnected = false;
let waitingForState = false;

// ---------- 游戏状态 ----------
let gameState = null;
let selectedCardId = null;
let pendingDiscardMode = false;

// ---------- DOM ----------
const boardEl = document.getElementById('board');
const myHandEl = document.getElementById('myHand');
const oppHandEl = document.getElementById('oppHand');
const myScoreEl = document.getElementById('myScore');
const oppScoreEl = document.getElementById('oppScore');
const deckInfoEl = document.getElementById('deckInfo');
const myCountEl = document.getElementById('myCount');
const oppCountEl = document.getElementById('oppCount');
const messageEl = document.getElementById('gameMessage');
const discardBtn = document.getElementById('discardBtn');
const redrawBtn = document.getElementById('redrawBtn');
const resetBtn = document.getElementById('resetBtn');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const peerIdInput = document.getElementById('peerIdInput');
const myPeerIdDisplay = document.getElementById('myPeerIdDisplay');

// ---------- 工具 ----------
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function setMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.style.borderLeftColor =
        type === 'win' ? '#69f0ae' :
        type === 'lose' ? '#ff7a7a' :
        type === 'warn' ? '#ffb84d' :
        '#ffd700';
}

function findCardInHand(cardId) {
    if (!gameState) return null;
    return gameState.hands.me.find(c => c.id === cardId) || null;
}

function getDeckCount() {
    if (!gameState) return 0;
    if (isHost) return gameState.deck.length;
    return gameState.deckCount || 0;
}

function isMyTurn() {
    return isConnected && gameState && !gameState.gameOver && gameState.currentPlayer === 'me';
}

// ---------- 得分计算 ----------
function calculateScore(board, slotIndex) {
    let leftIdx = -1;
    for (let i = slotIndex - 1; i >= 0; i--) {
        if (board[i]) { leftIdx = i; break; }
    }
    let rightIdx = -1;
    for (let i = slotIndex + 1; i < 14; i++) {
        if (board[i]) { rightIdx = i; break; }
    }

    if (leftIdx === -1 || rightIdx === -1) return 2;

    const leftGap = slotIndex - leftIdx - 1;
    const rightGap = rightIdx - slotIndex - 1;
    return leftGap === rightGap ? 7 : 4;
}

// ---------- 卡牌渲染 ----------
function createCardElement(card, faceUp = true) {
    const slot = document.createElement('div');
    slot.className = 'card-slot' + (faceUp ? ' flipped' : '');
    if (card) slot.dataset.cardId = card.id;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    // 背面
    const back = document.createElement('div');
    back.className = 'card-back';
    const backImg = document.createElement('img');
    backImg.src = BACK_IMG;
    backImg.alt = '牌背';
    back.appendChild(backImg);
    inner.appendChild(back);

    // 正面
    const front = document.createElement('div');
    front.className = 'card-front';
    if (card) {
        // 图片区（上方）
        const imgWrap = document.createElement('div');
        imgWrap.className = 'card-img-wrap';

        const img = document.createElement('img');
        img.src = IMG_BASE + card.id + '.png';
        img.alt = card.name;
        img.onerror = function () {
            // 图片加载失败：显示占位符号，同时下方牌名标签仍然显示
            this.style.display = 'none';
            const ph = document.createElement('div');
            ph.className = 'card-img-placeholder';
            ph.textContent = card.isMajor ? '✨' : card.suitSymbol;
            ph.style.color = card.isMajor ? '#ffd700' : '#d8c8e0';
            imgWrap.appendChild(ph);
        };
        imgWrap.appendChild(img);
        front.appendChild(imgWrap);

        // 牌名标签（底部，类似跑得快）
        const nameLabel = document.createElement('div');
        nameLabel.className = 'card-name-label' + (card.isMajor ? ' major' : '');
        nameLabel.textContent = card.name;
        front.appendChild(nameLabel);
    }
    inner.appendChild(front);
    slot.appendChild(inner);
    return slot;
}

// ---------- 渲染 ----------
function render() {
    if (!gameState) return;
    renderBoard();
    renderHand('me');
    renderHand('opp');
    myScoreEl.textContent = gameState.scores.me;
    oppScoreEl.textContent = gameState.scores.opp;
    deckInfoEl.textContent = '牌库 ' + getDeckCount();
    updateButtons();
}

function renderBoard() {
    boardEl.innerHTML = '';
    const selectedCard = selectedCardId ? findCardInHand(selectedCardId) : null;

    for (let i = 0; i < 14; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'board-slot';
        wrapper.dataset.slotIndex = i;

        const label = document.createElement('div');
        label.className = 'slot-label';
        label.textContent = RANK_LABELS[i];
        wrapper.appendChild(label);

        const cardContainer = document.createElement('div');
        cardContainer.className = 'slot-card-container';

        const card = gameState.board[i];
        if (card) {
            const cardEl = createCardElement(card, true);
            cardContainer.appendChild(cardEl);
            if (card.isMajor) wrapper.classList.add('has-major');
        } else {
            wrapper.classList.add('empty');
            if (selectedCard && isMyTurn()) {
                if (selectedCard.isMajor) {
                    wrapper.classList.add('can-place');
                } else if (selectedCard.rank - 1 === i) {
                    wrapper.classList.add('can-place', 'target-slot');
                }
            }
        }

        wrapper.appendChild(cardContainer);
        wrapper.addEventListener('click', () => onSlotClick(i));
        boardEl.appendChild(wrapper);
    }
}

function renderHand(player) {
    const container = player === 'me' ? myHandEl : oppHandEl;
    const hand = gameState.hands[player];
    const faceUp = (player === 'me');
    container.innerHTML = '';

    // 弃牌模式的视觉反馈
    if (player === 'me') {
        if (pendingDiscardMode) container.classList.add('discard-mode');
        else container.classList.remove('discard-mode');
    }

    hand.forEach((card) => {
        const el = createCardElement(card, faceUp);
        if (player === 'me') {
            if (selectedCardId === card.id) el.classList.add('selected');
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                onHandCardClick(card.id);
            });
        }
        container.appendChild(el);
    });

    if (player === 'me') myCountEl.textContent = hand.length;
    else oppCountEl.textContent = hand.length;
}

function updateButtons() {
    if (!gameState) {
        discardBtn.disabled = true;
        redrawBtn.disabled = true;
        return;
    }
    const myTurn = isMyTurn();
    // 弃牌按钮：回合内 && 本回合未弃过（允许分数变负）
    discardBtn.disabled = !myTurn || gameState.discardedThisTurn.me;
    redrawBtn.disabled = !myTurn;
}

// ---------- 交互 ----------
function onHandCardClick(cardId) {
    if (!isMyTurn()) return;
    if (gameState.gameOver) return;

    // 弃牌模式：点击手牌 = 指定弃掉这张
    if (pendingDiscardMode) {
        if (gameState.scores.me < 2) {
            setMessage('分数不足 2 分，无法弃牌', 'warn');
            pendingDiscardMode = false;
            render();
            return;
        }
        sendAction({ action: 'discard', cardId });
        pendingDiscardMode = false;
        selectedCardId = null;
        render();
        return;
    }

    // 正常模式：选中/取消选中
    selectedCardId = (selectedCardId === cardId) ? null : cardId;
    render();
}

function onSlotClick(slotIndex) {
    if (pendingDiscardMode) {
        setMessage('弃牌模式中：请点击手牌选择要弃掉的牌', 'warn');
        return;
    }
    if (!isMyTurn()) return;
    if (gameState.gameOver) return;
    if (!selectedCardId) {
        setMessage('请先选择一张手牌', 'info');
        return;
    }

    const card = findCardInHand(selectedCardId);
    if (!card) return;

    if (card.isMajor) {
        if (gameState.board[slotIndex]) {
            setMessage('该卡槽已被占用', 'lose');
            return;
        }
    } else {
        if (card.rank - 1 !== slotIndex) {
            setMessage('小阿卡纳只能放到对应的卡槽', 'lose');
            return;
        }
    }

    sendAction({ action: 'play', cardId: selectedCardId, slotIndex });
    selectedCardId = null;
    render();
}

// ---------- 游戏逻辑（主机权威） ----------
function handlePlay(player, cardId, slotIndex) {
    if (gameState.gameOver) return { ok: false, reason: '游戏已结束' };
    if (gameState.currentPlayer !== player) return { ok: false, reason: '不是你的回合' };

    const hand = gameState.hands[player];
    const cardIdx = hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return { ok: false, reason: '手牌中没有这张牌' };
    const card = hand[cardIdx];

    if (slotIndex < 0 || slotIndex >= 14) return { ok: false, reason: '无效卡槽' };

    let score = 0;
    let swapped = false;

    if (card.isMajor) {
        if (gameState.board[slotIndex]) return { ok: false, reason: '该卡槽已被占用' };
        gameState.board[slotIndex] = card;
        hand.splice(cardIdx, 1);
        score = calculateScore(gameState.board, slotIndex);
        gameState.scores[player] += score;
        drawCardFor(player);
    } else {
        const targetSlot = card.rank - 1;
        if (targetSlot !== slotIndex) return { ok: false, reason: '小阿卡纳只能放到对应卡槽' };
        const existing = gameState.board[targetSlot];
        if (existing) {
            if (existing.isMajor) {
                // 抢大阿卡纳：不得分，手牌交换
                gameState.board[targetSlot] = card;
                hand.splice(cardIdx, 1);
                hand.push(existing);
                swapped = true;
            } else {
                return { ok: false, reason: '该卡槽已被其他小阿卡纳占据' };
            }
        } else {
            gameState.board[targetSlot] = card;
            hand.splice(cardIdx, 1);
            score = calculateScore(gameState.board, targetSlot);
            gameState.scores[player] += score;
            drawCardFor(player);
        }
    }

    gameState.currentPlayer = (player === 'me' ? 'opp' : 'me');
    gameState.discardedThisTurn = { me: false, opp: false };
    gameState.lastAction = { player, type: 'play', cardName: card.name, score, swapped };

    return { ok: true, score, swapped };
}

function handleDiscard(player, cardId) {
    if (gameState.gameOver) return { ok: false, reason: '游戏已结束' };
    if (gameState.currentPlayer !== player) return { ok: false, reason: '不是你的回合' };
    if (gameState.discardedThisTurn[player]) return { ok: false, reason: '本回合已经弃过牌了' };

    const hand = gameState.hands[player];
    const cardIdx = hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return { ok: false, reason: '手牌中没有这张牌' };

    gameState.scores[player] -= 2;   // 允许扣到负分
    const discarded = hand.splice(cardIdx, 1)[0];
    gameState.deck.push(discarded);
    shuffle(gameState.deck);
    drawCardFor(player);
    gameState.discardedThisTurn[player] = true;
    gameState.lastAction = { player, type: 'discard', cardName: discarded.name };

    return { ok: true };
}

function handleRedraw(player) {
    if (gameState.gameOver) return { ok: false, reason: '游戏已结束' };
    if (gameState.currentPlayer !== player) return { ok: false, reason: '不是你的回合' };

    const hand = gameState.hands[player];
    hand.forEach(c => gameState.deck.push(c));
    hand.length = 0;
    shuffle(gameState.deck);
    for (let i = 0; i < 4 && gameState.deck.length > 0; i++) {
        hand.push(gameState.deck.pop());
    }

    gameState.currentPlayer = (player === 'me' ? 'opp' : 'me');
    gameState.discardedThisTurn = { me: false, opp: false };
    gameState.lastAction = { player, type: 'redraw' };

    return { ok: true };
}

function drawCardFor(player) {
    if (gameState.deck.length > 0) {
        gameState.hands[player].push(gameState.deck.pop());
    }
}

function checkGameOver() {
    if (gameState.board.every(c => c !== null)) {
        gameState.gameOver = true;
    }
}

// ---------- 主机处理操作 ----------
function handleAction(player, action) {
    let result;
    if (action.action === 'play') {
        result = handlePlay(player, action.cardId, action.slotIndex);
    } else if (action.action === 'discard') {
        result = handleDiscard(player, action.cardId);
    } else if (action.action === 'redraw') {
        result = handleRedraw(player);
    } else {
        result = { ok: false, reason: '未知操作' };
    }

    if (!result.ok) {
        if (player === 'me') setMessage(result.reason, 'lose');
        else setMessage('对手操作无效: ' + result.reason, 'info');
        if (isHost) sendStateToGuest();
        return;
    }

    checkGameOver();
    showActionMessage(player);
    render();

    if (gameState.gameOver) {
        showGameOverMessage();
    }

    if (isHost) sendStateToGuest();
}

function showActionMessage(player) {
    const la = gameState.lastAction;
    if (!la) return;
    const who = (la.player === 'me') ? '你' : '对手';

    if (la.type === 'play') {
        if (la.swapped) {
            setMessage(`${who}用 ${la.cardName} 抢走了大阿卡纳！`, 'info');
        } else {
            setMessage(`${who}出了 ${la.cardName}，得 ${la.score} 分`, 'info');
        }
    } else if (la.type === 'discard') {
        setMessage(`${who}弃掉了 ${la.cardName}（-2分）`, 'info');
    } else if (la.type === 'redraw') {
        setMessage(`${who}重抽了全部手牌，跳过本回合`, 'info');
    }
}

function showGameOverMessage() {
    if (gameState.scores.me > gameState.scores.opp) setMessage('🎉 你赢了！', 'win');
    else if (gameState.scores.me < gameState.scores.opp) setMessage('😞 你输了', 'lose');
    else setMessage('🤝 平局', 'info');
}

// ---------- 初始化游戏（主机） ----------
function startGameAsHost() {
    gameState = {
        board: new Array(14).fill(null),
        deck: buildPortauDeck(),
        hands: { me: [], opp: [] },
        scores: { me: 0, opp: 0 },
        currentPlayer: Math.random() < 0.5 ? 'me' : 'opp',
        discardedThisTurn: { me: false, opp: false },
        gameOver: false,
        lastAction: null
    };

    shuffle(gameState.deck);

    for (let i = 0; i < 4; i++) {
        gameState.hands.me.push(gameState.deck.pop());
        gameState.hands.opp.push(gameState.deck.pop());
    }

    generateInitialBoard();

    sendInitToGuest();
    render();

    if (gameState.currentPlayer === 'me') {
        setMessage('游戏开始！你先手', 'info');
    } else {
        setMessage('游戏开始！对手先手', 'info');
    }
}

// 开局只在卡池中随机抽 1 张放到对应卡位
function generateInitialBoard() {
    const board = gameState.board;
    const deck = gameState.deck;

    // 收集所有可放置的牌（大阿卡纳 → 任意空槽；小阿卡纳 → 对应槽需为空）
    const emptySlots = [];
    for (let i = 0; i < 14; i++) if (!board[i]) emptySlots.push(i);

    const placeable = [];
    deck.forEach((card, idx) => {
        if (card.isMajor) {
            placeable.push({ card, idx });
        } else {
            const slot = card.rank - 1;
            if (!board[slot]) placeable.push({ card, idx });
        }
    });

    if (placeable.length === 0) return;

    const pick = placeable[Math.floor(Math.random() * placeable.length)];
    const card = pick.card;
    const deckIdx = pick.idx;

    let slot;
    if (card.isMajor) {
        slot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    } else {
        slot = card.rank - 1;
    }

    board[slot] = card;
    deck.splice(deckIdx, 1);
}

// ---------- 网络 ----------
function mirrorState(s) {
    return {
        board: s.board,
        deckCount: s.deck.length,
        hands: { me: s.hands.opp, opp: s.hands.me },
        scores: { me: s.scores.opp, opp: s.scores.me },
        currentPlayer: s.currentPlayer === 'me' ? 'opp' : 'me',
        discardedThisTurn: { me: s.discardedThisTurn.opp, opp: s.discardedThisTurn.me },
        gameOver: s.gameOver,
        lastAction: s.lastAction ? {
            ...s.lastAction,
            player: s.lastAction.player === 'me' ? 'opp' : 'me'
        } : null
    };
}

function sendStateToGuest() {
    if (!conn || !conn.open) return;
    conn.send({ type: 'state', state: mirrorState(gameState) });
}

function sendInitToGuest() {
    if (!conn || !conn.open) return;
    conn.send({ type: 'init', state: mirrorState(gameState) });
}

function sendAction(action) {
    if (isHost) {
        handleAction('me', action);
    } else {
        if (waitingForState) return;
        waitingForState = true;
        if (conn && conn.open) {
            conn.send({ type: 'action', action });
        }
        setTimeout(() => { waitingForState = false; }, 3000);
    }
}

// ---------- PeerJS ----------
function initPeer() {
    peer = new Peer(undefined, { debug: 0 });
    peer.on('open', (id) => {
        myPeerId = id;
        myPeerIdDisplay.textContent = id;
        myPeerIdDisplay.title = '点击复制';
        myPeerIdDisplay.onclick = () => {
            navigator.clipboard.writeText(id).then(() => setMessage('房间号已复制！', 'info'));
        };
    });
    peer.on('connection', (c) => {
        if (conn) { c.close(); return; }
        conn = c;
        setupConnection();
    });
    peer.on('error', (err) => {
        setMessage('连接错误: ' + err.message, 'lose');
    });
}

function setupConnection() {
    const onOpen = () => {
        isConnected = true;
        if (isHost) startGameAsHost();
        else setMessage('已连接，等待房主开始...', 'info');
    };
    conn.on('open', onOpen);
    if (conn.open) onOpen();

    conn.on('data', (data) => {
        if (data.type === 'init') {
            gameState = data.state;
            render();
            if (gameState.currentPlayer === 'me') setMessage('游戏开始！你先手', 'info');
            else setMessage('游戏开始！对手先手', 'info');
        } else if (data.type === 'state') {
            onStateReceived(data.state);
            waitingForState = false;
        } else if (data.type === 'action') {
            if (isHost) handleAction('opp', data.action);
        }
    });

    conn.on('close', () => {
        isConnected = false;
        setMessage('连接已断开', 'lose');
        updateButtons();
    });
}

function onStateReceived(state) {
    gameState = state;
    render();
    showActionMessage();
    if (gameState.gameOver) showGameOverMessage();
}

// ---------- 事件绑定 ----------
createBtn.addEventListener('click', () => {
    isHost = true;
    if (!peer || peer.destroyed) initPeer();
    setMessage('等待对手加入...', 'info');
});

joinBtn.addEventListener('click', () => {
    const id = peerIdInput.value.trim();
    if (!id) { setMessage('请输入房间号', 'lose'); return; }
    if (!peer) { initPeer(); setTimeout(() => joinBtn.click(), 500); return; }
    isHost = false;
    if (conn) { conn.close(); conn = null; }
    conn = peer.connect(id, { reliable: true });
    setupConnection();
    setMessage('正在连接...', 'info');
});

discardBtn.addEventListener('click', () => {
    if (!isMyTurn()) return;
    if (gameState.gameOver) return;
    if (gameState.discardedThisTurn.me) {
        setMessage('本回合已经弃过牌了', 'warn');
        return;
    }
    if (gameState.scores.me < 2) {
        setMessage('分数不足 2 分，无法弃牌（当前 ' + gameState.scores.me + ' 分）', 'warn');
        return;
    }
    pendingDiscardMode = !pendingDiscardMode;
    if (pendingDiscardMode) {
        setMessage('弃牌模式：请点击手牌选择要弃掉的牌（-2分）', 'warn');
    } else {
        setMessage('已取消弃牌', 'info');
    }
    render();
});

redrawBtn.addEventListener('click', () => {
    if (!isMyTurn()) return;
    if (gameState.gameOver) return;
    if (!confirm('重抽全部手牌并跳过本回合，确定？')) return;
    sendAction({ action: 'redraw' });
});

resetBtn.addEventListener('click', () => {
    if (!isHost) { setMessage('只有房主可以重置游戏', 'info'); return; }
    if (!isConnected) return;
    pendingDiscardMode = false;
    selectedCardId = null;
    startGameAsHost();
});

// ---------- 大字模式切换 ----------
const largeFontBtn = document.getElementById('largeFontBtn');
largeFontBtn.addEventListener('click', () => {
    document.body.classList.toggle('large-mode');
    const isLarge = document.body.classList.contains('large-mode');
    largeFontBtn.textContent = isLarge ? '🔍 正常模式' : '🔍 大字模式';
});

// ---------- 启动 ----------
initPeer();
console.log('🎴 塔罗 Portau 已启动');