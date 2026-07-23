// ============================================
// 牌组数据（78张完整塔罗牌）
// ============================================
const TAROT_DECK = [
    // 大阿尔卡纳
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

    // 权杖
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

    // 圣杯
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

    // 宝剑
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

    // 星币
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
// 降级牌意词典（仅作备用，AI不可用时使用）
// ============================================
// ============================================
// 降级牌意词典（全 78 张牌）
// ============================================
const FALLBACK_MEANINGS = {
    // ---------- 大阿尔卡纳 ----------
    '0': { upright: '新的开始、冒险、信任', reversed: '鲁莽、冒险过度、不负责任' },
    '1': { upright: '创造力、自信、行动力', reversed: '操纵、犹豫、缺乏方向' },
    '2': { upright: '直觉、潜意识、内在智慧', reversed: '忽视直觉、缺乏洞察' },
    '3': { upright: '丰收、母性、创造力', reversed: '依赖、缺乏成长、创造力受阻' },
    '4': { upright: '权威、稳定、结构', reversed: '专制、僵化、过度控制' },
    '5': { upright: '传统、教导、精神指引', reversed: '教条、束缚、盲目遵循' },
    '6': { upright: '爱情、和谐、选择', reversed: '失衡、逃避责任、关系紧张' },
    '7': { upright: '胜利、意志力、前进', reversed: '冲突、鲁莽、失控' },
    '8': { upright: '勇气、耐心、内在力量', reversed: '怀疑、软弱、滥用力量' },
    '9': { upright: '内省、智慧、独处', reversed: '孤独、保守、拒绝帮助' },
    '10': { upright: '命运、转变、机缘', reversed: '抗拒变化、厄运、掌控欲' },
    '11': { upright: '公正、诚实、平衡', reversed: '不公、偏见、逃避责任' },
    '12': { upright: '牺牲、等待、新视角', reversed: '无谓牺牲、拖延、固执' },
    '13': { upright: '结束、转变、新生', reversed: '抗拒结束、固守过去、停滞' },
    '14': { upright: '平衡、调和、耐心', reversed: '失衡、急躁、冲突' },
    '15': { upright: '诱惑、物质、欲望', reversed: '挣脱束缚、觉醒、理智' },
    '16': { upright: '突变、颠覆、破碎', reversed: '避免灾难、缓慢崩溃、洞察' },
    '17': { upright: '希望、灵感、宁静', reversed: '失望、缺乏灵感、消极' },
    '18': { upright: '潜意识、直觉、不安', reversed: '恐惧、迷失、隐藏的真相' },
    '19': { upright: '成功、活力、乐观', reversed: '失败、悲观、能量枯竭' },
    '20': { upright: '觉醒、重生、审判', reversed: '逃避真相、自我怀疑、延迟' },
    '21': { upright: '完成、整合、圆满', reversed: '未完成、缺乏联系、无法满足' },

    // ---------- 权杖 (Wands) ----------
    'W1': { upright: '行动力、新机会、热情', reversed: '延误、缺乏动力、错失良机' },
    'W2': { upright: '计划、决策、未来展望', reversed: '犹豫不决、恐惧、停滞' },
    'W3': { upright: '探索、远见、合作', reversed: '延迟、目光短浅、独自承担' },
    'W4': { upright: '庆祝、稳固、和谐', reversed: '不稳定、过度庆祝、缺乏根基' },
    'W5': { upright: '竞争、冲突、挑战', reversed: '内耗、避免冲突、混乱' },
    'W6': { upright: '胜利、认可、自信', reversed: '骄傲、失败、缺乏支持' },
    'W7': { upright: '防御、坚持、勇气', reversed: '放弃、处于劣势、压力过大' },
    'W8': { upright: '快速行动、沟通、自由', reversed: '急躁、仓促决定、混乱' },
    'W9': { upright: '韧性、警惕、忍耐', reversed: '疲惫、防守过度、孤立' },
    'W10': { upright: '负担、责任、成功', reversed: '崩溃、无法承担、压力过大' },
    'W侍从': { upright: '热情、新想法、行动', reversed: '轻率、冲动、缺乏方向' },
    'W骑士': { upright: '行动、冒险、加速', reversed: '鲁莽、急躁、冲突' },
    'W皇后': { upright: '自信、热情、创造力', reversed: '嫉妒、霸道、自我中心' },
    'W国王': { upright: '领导力、远见、成熟', reversed: '独裁、固执、滥用权力' },

    // ---------- 圣杯 (Cups) ----------
    'C1': { upright: '情感开始、爱意、直觉', reversed: '情感压抑、空虚、创造力受阻' },
    'C2': { upright: '联结、和谐、合作', reversed: '分离、误解、不平衡' },
    'C3': { upright: '欢乐、庆祝、友谊', reversed: '过度放纵、孤立、短暂快乐' },
    'C4': { upright: '内省、反思、舒适', reversed: '冷漠、错失机会、停滞' },
    'C5': { upright: '失落、悲伤、后悔', reversed: '接受、前进、放下过去' },
    'C6': { upright: '回忆、纯真、过去', reversed: '沉溺过往、不切实际、逃避' },
    'C7': { upright: '幻想、选择、错觉', reversed: '清醒、现实、面对真相' },
    'C8': { upright: '离开、转变、勇敢', reversed: '恐惧改变、停滞、逃避' },
    'C9': { upright: '满足、梦想成真、幸福', reversed: '空虚、不满足、物质主义' },
    'C10': { upright: '圆满、家庭、和谐', reversed: '家庭冲突、破裂、孤立' },
    'C侍从': { upright: '情感开始、敏感、直觉', reversed: '情绪化、爱幻想、不成熟' },
    'C骑士': { upright: '浪漫、理想、温柔', reversed: '逃避、失望、情绪操纵' },
    'C皇后': { upright: '深情、关怀、直觉', reversed: '依赖、占有欲、情绪化' },
    'C国王': { upright: '情感稳定、智慧、宽容', reversed: '冷酷、情感操控、不忠' },

    // ---------- 宝剑 (Swords) ----------
    'S1': { upright: '清晰、真理、决断', reversed: '混乱、误解、犹豫' },
    'S2': { upright: '僵持、抉择、逃避', reversed: '释放、决断、勇气' },
    'S3': { upright: '心碎、痛苦、分离', reversed: '疗愈、倾诉、宽恕' },
    'S4': { upright: '休息、恢复、静养', reversed: '过度休息、逃避、停滞' },
    'S5': { upright: '冲突、好胜、卑鄙', reversed: '和解、抛弃、自我反省' },
    'S6': { upright: '过渡、疗愈、前进', reversed: '困在痛苦、拒绝愈合、停滞' },
    'S7': { upright: '欺骗、隐藏、策略', reversed: '暴露、诚实、直面后果' },
    'S8': { upright: '束缚、限制、无助', reversed: '释放、自由、解脱' },
    'S9': { upright: '焦虑、恐惧、噩梦', reversed: '希望、面对恐惧、获得支持' },
    'S10': { upright: '毁灭、绝望、终结', reversed: '重生、觉醒、放下' },
    'S侍从': { upright: '警觉、理性、沟通', reversed: '多疑、言语伤人、固执' },
    'S骑士': { upright: '果断、行动、冒险', reversed: '鲁莽、攻击性、冲动' },
    'S皇后': { upright: '智慧、独立、清晰', reversed: '尖刻、冷酷、孤独' },
    'S国王': { upright: '权威、理性、公正', reversed: '独断、冷酷、滥用权威' },

    // ---------- 星币 (Pentacles) ----------
    'P1': { upright: '财富、机遇、潜力', reversed: '错过机会、吝啬、不安全' },
    'P2': { upright: '平衡、灵活、适应', reversed: '失衡、财务压力、混乱' },
    'P3': { upright: '协作、计划、工匠精神', reversed: '缺乏合作、低质量、不专注' },
    'P4': { upright: '占有、控制、安全感', reversed: '吝啬、物质主义、财务焦虑' },
    'P5': { upright: '贫困、失落、无助', reversed: '转机、援助、精神富有' },
    'P6': { upright: '慷慨、分享、公平', reversed: '贪婪、施舍、不平等' },
    'P7': { upright: '耐心、收获、投资', reversed: '焦虑、等待、缺乏回报' },
    'P8': { upright: '勤奋、技能、专注', reversed: '倦怠、缺乏动力、马虎' },
    'P9': { upright: '丰盛、成果、自足', reversed: '依赖、虚荣、过度追求物质' },
    'P10': { upright: '财富、传承、稳定', reversed: '财务危机、家族不和、失落' },
    'P侍从': { upright: '学习、实践、稳健', reversed: '懒惰、拖延、缺乏规划' },
    'P骑士': { upright: '效率、稳定、责任', reversed: '固执、守旧、乏味' },
    'P皇后': { upright: '务实、滋养、安全感', reversed: '物质主义、过度保护、浪费' },
    'P国王': { upright: '财富、稳定、掌控', reversed: '贪婪、保守、滥用财富' },
};

// ============================================
// 牌阵定义（可扩展）
// ============================================
const SPREADS = {
    single: {
        id: 'single',
        label: '单牌占卜',
        badge: '1张',
        count: 1,
        description: '牌阵：单牌占卜。这张牌代表问题核心或当下的指引，请直接解读这张牌的核心含义。',
        positions: [
            { label: '核心指引' }
        ],
        // 布局渲染函数，返回 HTML 字符串
        render: (cards) => {
            return cards.map((card, i) => renderCard(card, i, SPREADS.single.positions[i]?.label)).join('');
        }
    },
    three: {
        id: 'three',
        label: '三牌占卜',
        badge: '3张',
        count: 3,
        description: '牌阵：三牌占卜（时间之流）。左为过去/原因，中为现在/行动，右为未来/结果。请按时间顺序解读。',
        positions: [
            { label: '过去 / 原因' },
            { label: '现在 / 行动' },
            { label: '未来 / 结果' }
        ],
        render: (cards) => {
            return cards.map((card, i) => renderCard(card, i, SPREADS.three.positions[i]?.label)).join('');
        }
    },
    choice: {
        id: 'choice',
        label: '抉择牌阵',
        badge: '5张',
        count: 5,
        description: '牌阵：抉择牌阵（二择一）。中心为问题核心，左列为路径A（过程+结果），右列为路径B（过程+结果）。请对比两条路径的利弊。',
        positions: [
            { label: '核心状态' },          // index 0
            { label: 'A 过程' },            // index 1
            { label: 'A 结果' },            // index 2
            { label: 'B 过程' },            // index 3
            { label: 'B 结果' }             // index 4
        ],
        render: (cards) => {
            // 定制布局：中心1张，左列2张，右列2张
            const center = cards[0] ? renderCard(cards[0], 0, '核心状态') : '';
            const leftCards = cards.slice(1, 3).map((c, i) => renderCard(c, i + 1, SPREADS.choice.positions[i + 1]?.label)).join('');
            const rightCards = cards.slice(3, 5).map((c, i) => renderCard(c, i + 3, SPREADS.choice.positions[i + 3]?.label)).join('');

            return `
                <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:30px;">
                    <div class="spread-branch">
                        <div class="branch-label">🌿 路径 A</div>
                        <div class="branch-cards">${leftCards}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                        ${center}
                        <div style="color:#6a5a7a; font-size:0.8rem; letter-spacing:1px;">⚖️ 抉择</div>
                    </div>
                    <div class="spread-branch">
                        <div class="branch-label">🌿 路径 B</div>
                        <div class="branch-cards">${rightCards}</div>
                    </div>
                </div>
            `;
        }
    },
    horseshoe: {
        id: 'horseshoe',
        label: '马蹄铁牌阵',
        badge: '7张',
        count: 7,
        description: '牌阵：马蹄铁牌阵（倒U型，7张）。从①过去根基开始，沿弧线到②现在、③近未来，经过④障碍挑战，到⑤环境他人、⑥优势建议，最后⑦最终结果。请按这个时间线和逻辑进行解读。',
        positions: [
            { label: '① 过去 / 根基' },
            { label: '② 现在 / 现状' },
            { label: '③ 近未来（1个月内）' },
            { label: '④ 障碍 / 挑战' },
            { label: '⑤ 环境 / 他人影响' },
            { label: '⑥ 优势 / 建议行动' },
            { label: '⑦ 最终结果' }
        ],
        render: (cards) => {
            const card0 = cards[0] ? renderCard(cards[0], 0, '① 过去/根基') : '';
            const card1 = cards[1] ? renderCard(cards[1], 1, '② 现在/现状') : '';
            const card2 = cards[2] ? renderCard(cards[2], 2, '③ 近未来') : '';
            const card3 = cards[3] ? renderCard(cards[3], 3, '④ 障碍/挑战') : '';
            const card4 = cards[4] ? renderCard(cards[4], 4, '⑤ 环境/他人') : '';
            const card5 = cards[5] ? renderCard(cards[5], 5, '⑥ 优势/建议') : '';
            const card6 = cards[6] ? renderCard(cards[6], 6, '⑦ 最终结果') : '';

            return `
                <div style="display:flex; flex-direction:column; align-items:center; gap:12px; width:100%; padding:10px 0;">
                    <!-- 顶部行：③ 近未来  ④ 障碍/挑战  ⑤ 环境/他人 -->
                    <div style="display:flex; justify-content:center; gap:60px;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                            ${card2}
                            <div style="color:#6a5a7a; font-size:0.6rem;">左弧上</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                            ${card3}
                            <div style="color:#6a5a7a; font-size:0.6rem;">顶弧中</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                            ${card4}
                            <div style="color:#6a5a7a; font-size:0.6rem;">右弧上</div>
                        </div>
                    </div>
                    
                    <!-- 中间行：② 现在/现状（左）  ⑥ 优势/建议（右） -->
                    <!-- 使用负margin让左右两张牌向外突出，形成马蹄铁的弧度 -->
                    <div style="display:flex; justify-content:space-between; width:100%; max-width:700px; margin-top:5px; padding:0 20px;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px; margin-left:-55px;">
                            ${card1}
                            <div style="color:#6a5a7a; font-size:0.6rem;">左弧下</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px; margin-right:-55px;">
                            ${card5}
                            <div style="color:#6a5a7a; font-size:0.6rem;">右弧下</div>
                        </div>
                    </div>
                    
                    <!-- 底部行：① 过去/根基（左）  ⑦ 最终结果（右） -->
                    <!-- 底部行与中间行的左右两端对齐 -->
                    <div style="display:flex; justify-content:space-between; width:100%; max-width:700px; margin-top:5px; padding:0 20px;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px; margin-left:-75px;">
                            ${card0}
                            <div style="color:#6a5a7a; font-size:0.6rem;">底弧左</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px; margin-right:-75px;">
                            ${card6}
                            <div style="color:#6a5a7a; font-size:0.6rem;">底弧右</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    celtcross: {
        id: 'celtcross',
        label: '凯尔特十字牌阵',
        badge: '10张',
        count: 10,
        description: '牌阵：凯尔特十字牌阵（10张）。中央十字区：①核心现状、②挑战阻力（横跨）、③过去远因、④近期状态、⑤可能目标、⑥下一步。右侧列：⑦自我看法、⑧外界环境、⑨希望恐惧、⑩最终结局。请综合十字与右侧信息。',
        positions: [
            { label: '① 核心现状' },
            { label: '② 挑战/阻力' },
            { label: '③ 过去远因' },
            { label: '④ 近期状态' },
            { label: '⑤ 可能性/目标' },
            { label: '⑥ 下一步发展' },
            { label: '⑦ 自我看法' },
            { label: '⑧ 外界环境' },
            { label: '⑨ 希望/恐惧' },
            { label: '⑩ 最终结局' }
        ],
        render: (cards) => {
            const card0 = cards[0] ? renderCard(cards[0], 0, '① 核心现状') : '';
            const card1 = cards[1] ? renderCard(cards[1], 1, '② 挑战/阻力') : '';
            const card2 = cards[2] ? renderCard(cards[2], 2, '③ 过去远因') : '';
            const card3 = cards[3] ? renderCard(cards[3], 3, '④ 近期状态') : '';
            const card4 = cards[4] ? renderCard(cards[4], 4, '⑤ 可能性/目标') : '';
            const card5 = cards[5] ? renderCard(cards[5], 5, '⑥ 下一步发展') : '';
            const card6 = cards[6] ? renderCard(cards[6], 6, '⑦ 自我看法') : '';
            const card7 = cards[7] ? renderCard(cards[7], 7, '⑧ 外界环境') : '';
            const card8 = cards[8] ? renderCard(cards[8], 8, '⑨ 希望/恐惧') : '';
            const card9 = cards[9] ? renderCard(cards[9], 9, '⑩ 最终结局') : '';

            return `
                <div style="display:flex; justify-content:center; align-items:flex-start; gap:40px; width:100%; padding:10px 0; flex-wrap:wrap;">
                    
                    <!-- 左侧：中央十字区 -->
                    <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                        <!-- 顶部：⑤ 可能性/目标 -->
                        <div style="display:flex; justify-content:center;">
                            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                                ${card4}
                                <div style="color:#6a5a7a; font-size:0.6rem;">⑤ 上方</div>
                            </div>
                        </div>
                        
                        <!-- 中间行：④ 左侧 | 中心十字（①+②） | ⑥ 右侧 -->
                        <div style="display:flex; justify-content:center; align-items:center; gap:25px;">
                            <!-- ④ 左侧 -->
                            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                                ${card3}
                                <div style="color:#6a5a7a; font-size:0.6rem;">④ 左侧</div>
                            </div>
                            
                            <!-- 中心十字：① + ②（②横跨在①之上，旋转90°并缩小） -->
                            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                                <div style="display:flex; justify-content:center; align-items:center; position:relative; width:150px; height:250px;">
                                    <!-- ① 核心现状（底层，完整显示） -->
                                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1;">
                                        ${card0}
                                    </div>
                                    <!-- ② 挑战/阻力（上层，旋转90°横跨，缩小到75%让①露出来） -->
                                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%) rotate(90deg) scale(0.72); z-index:2; transform-origin:center center;">
                                        ${card1}
                                    </div>
                                </div>
                                <div style="color:#6a5a7a; font-size:0.6rem; margin-top:5px;">① 中心 ＋ ② 横跨</div>
                            </div>
                            
                            <!-- ⑥ 右侧 -->
                            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                                ${card5}
                                <div style="color:#6a5a7a; font-size:0.6rem;">⑥ 右侧</div>
                            </div>
                        </div>
                        
                        <!-- 底部：③ 过去远因 -->
                        <div style="display:flex; justify-content:center;">
                            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                                ${card2}
                                <div style="color:#6a5a7a; font-size:0.6rem;">③ 下方</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 右侧：辅助列（从下往上：⑦→⑧→⑨→⑩） -->
                    <div style="display:flex; flex-direction:column-reverse; align-items:center; gap:15px; border-left:1px solid rgba(255,215,0,0.12); padding-left:30px; min-height:420px; justify-content:center;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                            ${card6}
                            <div style="color:#6a5a7a; font-size:0.6rem;">⑦ 自我看法</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                            ${card7}
                            <div style="color:#6a5a7a; font-size:0.6rem;">⑧ 外界环境</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                            ${card8}
                            <div style="color:#6a5a7a; font-size:0.6rem;">⑨ 希望/恐惧</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                            ${card9}
                            <div style="color:#6a5a7a; font-size:0.6rem;">⑩ 最终结局</div>
                        </div>
                    </div>
                    
                </div>
            `;
        }
    },
    venus: {
        id: 'venus',
        label: '维纳斯之爱牌阵',
        badge: '8张',
        count: 8,
        description: '牌阵：维纳斯之爱牌阵（8张，菱形布局）。上下为①你的内心和⑧关系走向，中间左列（②③④）分别为你的行为、你对他期待、你的情感发展；中间右列（⑤⑥⑦）分别为对方内心、对方行为、对方期待。请对比双方状态并推演关系走向。',
        
        positions: [
            { label: '① 你的内心' },
            { label: '② 你的行为' },
            { label: '③ 你对他期待' },
            { label: '④ 你的情感发展' },
            { label: '⑤ 对方内心' },
            { label: '⑥ 对方行为' },
            { label: '⑦ 对方期待' },
            { label: '⑧ 关系走向' }
        ],
        render: (cards) => {
            const card0 = cards[0] ? renderCard(cards[0], 0, '① 你的内心') : '';
            const card1 = cards[1] ? renderCard(cards[1], 1, '② 你的行为') : '';
            const card2 = cards[2] ? renderCard(cards[2], 2, '③ 你对他期待') : '';
            const card3 = cards[3] ? renderCard(cards[3], 3, '④ 你的情感发展') : '';
            const card4 = cards[4] ? renderCard(cards[4], 4, '⑤ 对方内心') : '';
            const card5 = cards[5] ? renderCard(cards[5], 5, '⑥ 对方行为') : '';
            const card6 = cards[6] ? renderCard(cards[6], 6, '⑦ 对方期待') : '';
            const card7 = cards[7] ? renderCard(cards[7], 7, '⑧ 关系走向') : '';

            return `
                <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:flex-start; gap:40px; width:100%; padding:10px 0;">
                    <!-- 左侧牌阵 (你的部分) -->
                    <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
                        <div>${card0}</div>
                        <div style="display:flex; gap:25px;">
                            <div>${card1}</div>
                            <div>${card2}</div>
                        </div>
                        <div>${card3}</div>
                        <div style="color:#6a5a7a; font-size:0.7rem; letter-spacing:1px; margin-top:6px;">💖 你的部分</div>
                    </div>

                    <!-- 右侧牌阵 (对方的部分) -->
                    <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
                        <div>${card4}</div>
                        <div style="display:flex; gap:25px;">
                            <div>${card5}</div>
                            <div>${card6}</div>
                        </div>
                        <div>${card7}</div>
                        <div style="color:#6a5a7a; font-size:0.7rem; letter-spacing:1px; margin-top:6px;">💫 对方的部分</div>
                    </div>
                </div>
            `;
        }
    }
};

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

const AI_CONFIG = {
    WORKER_URL: 'https://tarot-api.qidate001.workers.dev',
    ENABLE_AI: true,
    TYPING_SPEED: 18,
};