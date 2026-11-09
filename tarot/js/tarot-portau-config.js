// ============================================================
//  js/tarot-portau-config.js
//  塔罗 Portau 配置：牌组定义 & 图片路径
// ============================================================

const SUITS = [
    { id: 'W', name: '权杖', symbol: '🔥', suitSymbol: '♣' },
    { id: 'C', name: '圣杯', symbol: '💧', suitSymbol: '♥' },
    { id: 'S', name: '宝剑', symbol: '💨', suitSymbol: '♠' },
    { id: 'P', name: '星币', symbol: '🌍', suitSymbol: '♦' }
];

// 14 个卡槽：A(1) ~ 10, 侍从, 骑士, 皇后, 国王
const RANK_IMGIDS = ['1','2','3','4','5','6','7','8','9','10','侍从','骑士','皇后','国王'];
const RANK_LABELS = ['A','2','3','4','5','6','7','8','9','10','侍从','骑士','皇后','国王'];

// 四张大阿卡纳
const MAJOR_CARDS = [
    { id: '10', name: '命运之轮' },
    { id: '11', name: '正义' },
    { id: '12', name: '倒吊人' },
    { id: '21', name: '世界' }
];

// 图片路径（如你的项目结构不同，请自行调整）
const IMG_BASE = './images/tarot_cards/';
const BACK_IMG = './images/tarot_cards/_.png';

/**
 * 构建 Portau 牌组：
 *  - 4 花色 × 14 张 = 56 张小阿卡纳
 *  - 4 张大阿卡纳
 *  - 共 60 张
 */
function buildPortauDeck() {
    const deck = [];

    SUITS.forEach(suit => {
        RANK_IMGIDS.forEach((imgId, idx) => {
            const rank = idx + 1; // 1-14
            deck.push({
                id: suit.id + imgId,          // 例如 W1, C10, S侍从, P国王
                name: suit.name + RANK_LABELS[idx],
                rank: rank,                    // 1-14
                isMajor: false,
                suitId: suit.id,
                suitName: suit.name,
                suitSymbol: suit.suitSymbol,
                symbol: suit.symbol,
                color: (suit.id === 'C' || suit.id === 'P') ? 'red' : 'black'
            });
        });
    });

    MAJOR_CARDS.forEach(m => {
        deck.push({
            id: m.id,                          // 10, 11, 12, 21
            name: m.name,
            rank: 0,                           // 大阿卡纳 rank=0
            isMajor: true,
            suitId: null,
            suitName: '大阿卡纳',
            suitSymbol: '🃏',
            symbol: '✨',
            color: 'gold'
        });
    });

    return deck;
}