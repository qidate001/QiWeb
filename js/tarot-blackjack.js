// ============================================================
//  塔罗21点
// ============================================================

const DECK = typeof TAROT_DECK !== 'undefined' ? TAROT_DECK : [];
const IMG_BASE = typeof CONFIG !== 'undefined' ? CONFIG.IMG_BASE : '/images/tarot_cards/';
const BACK_IMG = typeof CONFIG !== 'undefined' ? CONFIG.BACK_IMG : '/images/tarot_cards/_.png';

// ---------- 牌点映射 ----------
function getCardValue(card) {
    const id = card.id;
    if (/^[0-9]+$/.test(id)) {
        const num = parseInt(id);
        return num;
    }
    const match = id.match(/^([WCSP])(\d+)$/);
    if (match) {
        const num = parseInt(match[2]);
        if (num >= 2 && num <= 10) return num;
        if (num === 1) return 11;
    }
    if (id.includes('侍从')) return 11;
    if (id.includes('骑士')) return 12;
    if (id.includes('王后') || id.includes('皇后')) return 13;
    if (id.includes('国王')) return 14;
    return 10;
}

function isAce(card) {
    const id = card.id;
    return /^[WCSP]1$/.test(id) || id === '1';
}

function calcHandTotal(hand) {
    let total = 0;
    let aces = 0;
    hand.forEach(card => {
        if (isAce(card)) { aces++; total += 11; } else { total += getCardValue(card); }
    });
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

// ---------- 游戏状态 ----------
const game = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    round: 0,
    maxRounds: 3,
    phase: 'idle',
    isGameOver: false,
};

// ---------- DOM 引用 ----------
const playerHandEl = document.getElementById('playerHand');
const dealerHandEl = document.getElementById('dealerHand');
const playerTotalEl = document.getElementById('playerTotal');
const dealerTotalEl = document.getElementById('dealerTotal');
const playerWinsEl = document.getElementById('playerWins');
const dealerWinsEl = document.getElementById('dealerWins');
const roundInfoEl = document.getElementById('roundInfo');
const gameMessageEl = document.getElementById('gameMessage');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const newGameBtn = document.getElementById('newGameBtn');

// ---------- 工具函数 ----------
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createDeck() { return DECK.map(c => ({ ...c })); }

function drawCard() {
    if (game.deck.length === 0) {
        game.deck = shuffleArray(createDeck());
    }
    return game.deck.pop();
}

function createCardElement(card, isFaceDown = false) {
    const slot = document.createElement('div');
    slot.className = 'card-slot';
    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const back = document.createElement('div');
    back.className = 'card-back';
    const backImg = document.createElement('img');
    backImg.src = BACK_IMG;
    backImg.alt = '牌背';
    backImg.loading = 'lazy';
    back.appendChild(backImg);

    const front = document.createElement('div');
    front.className = 'card-front';
    if (card.isReversed) front.classList.add('reversed');
    const frontImg = document.createElement('img');
    frontImg.src = `${IMG_BASE}${card.id}.png`;
    frontImg.alt = card.name;
    frontImg.loading = 'lazy';
    front.appendChild(frontImg);
    front.dataset.name = card.name;

    inner.appendChild(back);
    inner.appendChild(front);
    slot.appendChild(inner);

    if (!isFaceDown) {
        slot.classList.add('flipped');
    }
    slot.dataset.cardId = card.id;
    return slot;
}

function clearHands() {
    playerHandEl.innerHTML = '';
    dealerHandEl.innerHTML = '';
    updateTotalDisplay();
}

function updateTotalDisplay() {
    const pTotal = calcHandTotal(game.playerHand);
    const dTotal = calcHandTotal(game.dealerHand);
    playerTotalEl.innerHTML =
        `点数：<span class="total-num">${pTotal}</span>${pTotal > 21 ? ' <span class="bust">💥 爆牌</span>' : ''}${pTotal === 21 && game.playerHand.length === 2 ? ' <span class="blackjack">✨ 黑杰克</span>' : ''}`;
    if (game.phase === 'dealerTurn' || game.phase === 'gameOver' || game.phase === 'idle') {
        dealerTotalEl.innerHTML =
            `点数：<span class="total-num">${dTotal}</span>${dTotal > 21 ? ' <span class="bust">💥 爆牌</span>' : ''}`;
    } else {
        if (game.dealerHand.length > 0) {
            const firstVal = getCardValue(game.dealerHand[0]);
            dealerTotalEl.innerHTML = `点数：<span class="total-num">${firstVal}</span> + ?`;
        } else {
            dealerTotalEl.innerHTML = `点数：<span class="total-num">0</span>`;
        }
    }
}

function updateScoreboard() {
    playerWinsEl.textContent = game.playerScore;
    dealerWinsEl.textContent = game.dealerScore;
    roundInfoEl.textContent = `第 ${game.round} / ${game.maxRounds} 局`;
}

function setMessage(text, type = 'info') {
    gameMessageEl.textContent = text;
    gameMessageEl.style.borderLeftColor = type === 'win' ? '#69f0ae' : type === 'lose' ? '#ff7a7a' : '#ffd700';
}

function setButtonsEnabled(hit, stand, newGame = true) {
    hitBtn.disabled = !hit;
    standBtn.disabled = !stand;
    newGameBtn.disabled = !newGame;
}

// ---------- 核心游戏函数 ----------
function startRound() {
    if (game.isGameOver) {
        resetGame();
        return;
    }
    game.playerHand = [];
    game.dealerHand = [];
    game.round++;
    game.phase = 'playerTurn';

    game.playerHand.push(drawCard());
    game.dealerHand.push(drawCard());

    renderHands();
    updateTotalDisplay();
    updateScoreboard();

    const pTotal = calcHandTotal(game.playerHand);
    if (pTotal === 21) {
        setMessage('🎉 玩家21点！', 'win');
        game.phase = 'dealerTurn';
        revealDealerCard();
        dealerPlay();
        return;
    }

    setMessage('你的回合，选择要牌或停牌', 'info');
    setButtonsEnabled(true, true, false);
}

function renderHands() {
    playerHandEl.innerHTML = '';
    game.playerHand.forEach(card => {
        const el = createCardElement(card, false);
        playerHandEl.appendChild(el);
    });

    dealerHandEl.innerHTML = '';
    game.dealerHand.forEach((card, index) => {
        const isFaceDown = (index === 0 && game.phase !== 'dealerTurn' && game.phase !== 'gameOver');
        const el = createCardElement(card, isFaceDown);
        if (isFaceDown) {
            el.dataset.hidden = 'true';
        }
        dealerHandEl.appendChild(el);
    });
}

function revealDealerCard() {
    const cards = dealerHandEl.querySelectorAll('.card-slot');
    if (cards.length >= 1) {
        const first = cards[0];
        if (first.dataset.hidden === 'true') {
            first.classList.add('flipped');
            first.dataset.hidden = 'false';
        }
    }
    updateTotalDisplay();
}

function playerHit() {
    if (game.phase !== 'playerTurn') return;
    const card = drawCard();
    game.playerHand.push(card);
    const el = createCardElement(card, false);
    playerHandEl.appendChild(el);
    const total = calcHandTotal(game.playerHand);
    updateTotalDisplay();

    if (total > 21) {
        setMessage('💥 爆牌！你输了这一局', 'lose');
        game.phase = 'dealerTurn';
        endRound('lose');
        return;
    }
    if (total === 21) {
        setMessage('🎯 21点！自动停牌', 'win');
        playerStand();
        return;
    }
    setMessage(`当前点数 ${total}，继续要牌或停牌`, 'info');
}

function playerStand() {
    if (game.phase !== 'playerTurn') return;
    setMessage('你选择停牌，庄家回合...', 'info');
    game.phase = 'dealerTurn';
    revealDealerCard();
    dealerPlay();
}

function dealerPlay() {
    if (game.phase !== 'dealerTurn') return;
    let total = calcHandTotal(game.dealerHand);
    if (total < 17) {
        const card = drawCard();
        game.dealerHand.push(card);
        const el = createCardElement(card, false);
        dealerHandEl.appendChild(el);
        updateTotalDisplay();
        if (calcHandTotal(game.dealerHand) > 21) {
            setMessage('庄家爆牌！你赢了这一局！', 'win');
            endRound('win');
            return;
        }
        setTimeout(() => dealerPlay(), 500);
    } else {
        setMessage('庄家停牌，结算...', 'info');
        const pTotal = calcHandTotal(game.playerHand);
        const dTotal = calcHandTotal(game.dealerHand);
        let result = '';
        if (dTotal > 21) result = 'win';
        else if (pTotal > 21) result = 'lose';
        else if (pTotal > dTotal) result = 'win';
        else if (pTotal < dTotal) result = 'lose';
        else result = 'push';
        endRound(result);
    }
}

function endRound(result) {
    game.phase = 'gameOver';
    if (result === 'win') {
        game.playerScore++;
        setMessage('🎉 你赢了这一局！', 'win');
    } else if (result === 'lose') {
        game.dealerScore++;
        setMessage('😞 你输了这一局', 'lose');
    } else {
        setMessage('🤝 平局', 'info');
    }
    revealDealerCard();
    updateTotalDisplay();
    updateScoreboard();

    if (game.playerScore >= 2) {
        setMessage('🏆 恭喜你赢得整场比赛！', 'win');
        game.isGameOver = true;
        setButtonsEnabled(false, false, true);
        return;
    } else if (game.dealerScore >= 2) {
        setMessage('😔 庄家赢得整场比赛', 'lose');
        game.isGameOver = true;
        setButtonsEnabled(false, false, true);
        return;
    }

    if (game.round >= game.maxRounds) {
        if (game.playerScore > game.dealerScore) {
            setMessage('🏆 最终胜利者：玩家！', 'win');
        } else if (game.playerScore < game.dealerScore) {
            setMessage('😔 最终胜利者：庄家', 'lose');
        } else {
            setMessage('🤝 最终平局', 'info');
        }
        game.isGameOver = true;
        setButtonsEnabled(false, false, true);
        return;
    }

    setButtonsEnabled(false, false, true);
    setTimeout(() => {
        if (!game.isGameOver) {
            startRound();
        }
    }, 1500);
}

function resetGame() {
    game.playerScore = 0;
    game.dealerScore = 0;
    game.round = 0;
    game.isGameOver = false;
    game.phase = 'idle';
    game.playerHand = [];
    game.dealerHand = [];
    game.deck = shuffleArray(createDeck());
    clearHands();
    updateScoreboard();
    setMessage('新游戏开始！点击「新游戏」发牌', 'info');
    setButtonsEnabled(false, false, true);
    setTimeout(() => {
        if (!game.isGameOver) {
            startRound();
        }
    }, 400);
}

function initGame() {
    game.deck = shuffleArray(createDeck());
    resetGame();
    hitBtn.addEventListener('click', playerHit);
    standBtn.addEventListener('click', playerStand);
    newGameBtn.addEventListener('click', function () {
        if (game.isGameOver) {
            resetGame();
        } else {
            if (confirm('确定要重新开始吗？当前进度将丢失。')) {
                resetGame();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    if (DECK.length === 0) {
        alert('塔罗牌数据加载失败，请检查 tarot_config.js 是否存在。');
        return;
    }
    initGame();
});

console.log('🎴 塔罗21点 - 全屏沉浸版已启动');