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

const TAROT_EFFECTS = {
    // ========== 1 魔术师 ==========
    '1': {
        past: (reversed) => ({
            type: 'weight_random',
            weightMod: 1.1,
            randomnessMod: 0.85
        }),
        future: (reversed) => reversed
            ? { type: 'future_weight_bad', weightMod: 1.3, randomnessMod: 0.7 }
            : { type: 'fill_straight' }
    },

    // ========== 2 女祭司 ==========
    '2': {
        past: (reversed) => ({
            type: 'weight_random',
            randomnessMod: reversed ? 1.3 : 0.7
        }),
        future: (reversed) => ({
            type: 'future_randomness',
            randomnessMod: reversed ? 1.3 : 0.7
        })
    },

    // ========== 3 女皇 ==========
    '3': {
        past: (reversed) => reversed
            ? { type: 'weight_random', randomnessMod: 0.75 }
            : { type: 'weight_random', weightMod: 1.1, randomnessMod: 0.9 },
        future: (reversed) => reversed
            ? { type: 'future_weight', weightMod: 1.0, randomnessMod: 0.7 }
            : { type: 'extra_draw_replace' }
    },

    // ========== 4 皇帝 ==========
    '4': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 1.2, randomnessMod: 0.8 }
            : { type: 'weight_random', weightMod: 1.1, randomnessMod: 0.9 },
        future: (reversed) => reversed
            ? { type: 'future_randomness_based_on_high_cards' }
            : { type: 'future_randomness', randomnessMod: 0.8 }
    },

    // ========== 5 教皇 ==========
    '5': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 1.15, randomnessMod: 0.8 }
            : { type: 'weight_random', weightMod: 1.1, randomnessMod: 1.3 },
        future: (reversed) => reversed
            ? { type: 'future_weight_gamble', weightMod: 0.5, randomnessMod: 0.7 }
            : { type: 'future_weight_gamble', weightMod: 0.8, randomnessMod: 0.8 }
    },

    // ========== 6 恋人 ==========
    '6': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 1.1, randomnessMod: 0.8 }
            : { type: 'weight_random', weightMod: 1.15, randomnessMod: 0.85 },
        future: (reversed) => reversed
            ? { type: 'future_weight', weightMod: 0.9, randomnessMod: 0.7 }
            : { type: 'future_weight', weightMod: 1.1, randomnessMod: 0.8 }
    },

    // ========== 7 战车 ==========
    '7': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 1.3, randomnessMod: 0.85 }
            : { type: 'chariot_past_positive', stealFirstChance: 0.3, weightMod: 1.2 },
        future: (reversed) => reversed
            ? { type: 'future_chariot_negative_pending' }  // 特殊处理
            : { type: 'future_chariot_positive', stealFirstChance: 0.5 }
    },

    // ========== 8 力量 ==========
    '8': {
        past: (reversed) => ({
            type: 'weight_random',
            weightMod: reversed ? 1.2 : 1.3
        }),
        future: (reversed) => reversed
            ? { type: 'future_forced_give_first' }
            : { type: 'future_weight_gamble', weightMod: 0.8, randomnessMod: 0.8 }
    },

    // ========== 9 隐者 ==========
    '9': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 1.1, randomnessMod: 0.85 }
            : { type: 'weight_random', weightMod: 1.05, randomnessMod: 0.8 },
        future: (reversed) => reversed
            ? { type: 'future_weight_gamble', weightMod: 0.2, randomnessMod: 0.7 }
            : { type: 'future_weight_gamble', weightMod: 0.8, randomnessMod: 0.8 }
    },

    // ========== 10 命运之轮 ==========
    '10': {
        past: (reversed) => ({
            type: reversed ? 'force_3' : 'reshuffle'
        }),
        future: (reversed) => reversed
            ? { type: 'gamble' }
            : { type: 'high_weights', weightMod: 1.3 }
    },

    // ========== 11 正义 ==========
    // （依赖比分，单独处理，此处留空）

    // ========== 12 倒吊人 ==========
    '12': {
        past: (reversed) => reversed
            ? { type: 'hanged_man_past_negative', giveFirst: true, weightMod: 1.2, randomnessMod: 0.9 }
            : { type: 'hanged_man_past_positive', direction: 'higher' },
        future: (reversed) => reversed
            ? { type: 'future_forced_give_first', randomnessMod: 0.7 }
            : { type: 'future_forced_first', randomnessMod: 1.3 }
    },

    // ========== 13 死神 ==========
    '13': {
        past: (reversed) => ({
            type: 'swap_card',
            direction: reversed ? 'highest' : 'lowest'
        }),
        future: (reversed) => reversed
            ? { type: 'inherit_past' }
            : { type: 'future_randomness', randomnessMod: 1.3 }
    },

    // ========== 14 节制 ==========
    '14': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 1.2, randomnessMod: 1.88 }
            : { type: 'weight_random', weightMod: 1.2, randomnessMod: 0.8 },
        future: (reversed) => reversed
            ? { type: 'future_randomness', randomnessMod: 2.28 }
            : { type: 'future_weight', weightMod: 1.3, randomnessMod: 0.7 }
    },

    // ========== 15 恶魔 ==========
    '15': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 0.85, randomnessMod: 0.80, noBomb: true }
            : { type: 'weight_random', weightMod: 1.25, randomnessMod: 1.25 },
        future: (reversed) => reversed
            ? { type: 'future_weight', weightMod: 1.15, randomnessMod: 1.3 }
            : {
                type: 'future_bomb_boost',
                bombBoost: 1.5,
                reshuffleIfNoBomb: true,
                reshuffleParams: { weight: 0.7, randomness: 1.5 },
                weightMod: 1.5,
                randomnessMod: 1.0
              }
    },

    // ========== 16 高塔 ==========
    '16': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 1.2, randomnessMod: 1.8 }  // 2.0 * 0.9
            : { type: 'weight_random', weightMod: 1.3, randomnessMod: 2.0 },
        future: (reversed) => reversed
            ? { type: 'future_high_tower_negative', randomnessMod: 2.0, weightMod: 0.7 }
            : { type: 'future_high_tower_positive', randomnessMod: 2.0, weightMod: 1.3 }
    },

    // ========== 17 星星 ==========
    '17': {
        past: (reversed) => reversed
            ? { type: 'weight_random', randomnessMod: 1.35 }
            : { type: 'weight_random', weightMod: 1.10, randomnessMod: 0.90 },
        future: (reversed) => reversed
            ? { type: 'future_weight_bad', weightMod: 1.20, randomnessMod: 1.20 }
            : { type: 'future_weight', weightMod: 1.10, randomnessMod: 0.90 }
    },

    // ========== 18 月亮 ==========
    '18': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 0.8, randomnessMod: 0.8 }
            : { type: 'weight_random', randomnessMod: 1.2 },
        future: (reversed) => reversed
            ? { type: 'future_randomness', randomnessMod: 0.8 }
            : { type: 'future_randomness', randomnessMod: 1.2 }
    },

    // ========== 19 太阳 ==========
    '19': {
        past: (reversed) => reversed
            ? { type: 'weight_random', weightMod: 0.70, randomnessMod: 1.25 }
            : { type: 'weight_random', weightMod: 1.25, randomnessMod: 0.85 },
        future: (reversed) => reversed
            ? { type: 'future_weight_bad', weightMod: 1.10, randomnessMod: 0.8 }
            : { type: 'future_weight', weightMod: 1.25 }
    },

    // ========== 20 审判 ==========
    '20': {
        past: (reversed) => reversed
            ? { type: 'judgment_past_negative', swapType: 'high_to_scattered' }
            : { type: 'judgment_past_positive', swapType: 'scattered_to_high' },
        future: (reversed) => reversed
            ? { type: 'future_judgment_negative' }
            : { type: 'future_judgment_positive' }
    }
};

const CARD_EFFECTS = {
    '10': {  // 命运之轮
        past: { positive: 'reshuffle', negative: 'force_3' },
        future: { positive: 'high_weights', negative: 'gamble' }
    }
};

// 图片路径
const IMG_BASE = './images/tarot_cards/';
const BACK_IMG = './images/tarot_cards/_.png';