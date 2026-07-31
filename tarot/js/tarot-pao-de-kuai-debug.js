// ============================================================
//  🧪 调试控制台：强制塔罗牌
// ============================================================
window.debugTarot = {
    // 强制设置：{ past: { id, reversed }, present: { id, reversed }, future: { id, reversed } }
    forced: null,
    
    // 预设组合
    presets: {
        // 太阳+月亮（过去组合）
        sun_moon_past: {
            past: { id: '19', reversed: false },
            present: { id: '1', reversed: false },
            future: { id: '2', reversed: false }
        },
        // 太阳+月亮（逆位组合）
        sun_moon_past_rev: {
            past: { id: '19', reversed: true },
            present: { id: '1', reversed: false },
            future: { id: '2', reversed: false }
        },
        // 星星+月亮（过去组合）
        star_moon_past: {
            past: { id: '17', reversed: false },
            present: { id: '1', reversed: false },
            future: { id: '2', reversed: false }
        },
        // 恶魔+太阳（过去组合）
        devil_sun_past: {
            past: { id: '15', reversed: false },
            present: { id: '1', reversed: false },
            future: { id: '19', reversed: false }
        },
        // 恶魔+太阳（未来组合）
        devil_sun_future: {
            past: { id: '1', reversed: false },
            present: { id: '2', reversed: false },
            future: { id: '15', reversed: false }
        },
        // 命运之轮逆位（测试 force_3）
        wheel_rev: {
            past: { id: '10', reversed: true },
            present: { id: '1', reversed: false },
            future: { id: '2', reversed: false }
        },
        // 全部默认
        clear: null
    },
    
    // 应用预设
    use: function(name) {
        if (this.presets[name] !== undefined) {
            this.forced = this.presets[name];
            console.log(`✅ 已应用预设: ${name}`, this.forced);
            // 重置游戏以生效
            if (isHost && isConnected) {
                startGameAsHost();
            } else {
                console.warn('⚠️ 请先成为房主并建立连接');
            }
        } else {
            console.warn('❌ 未知预设:', name);
            console.log('可用预设:', Object.keys(this.presets));
        }
    },
    
    // 清空强制
    clear: function() {
        this.forced = null;
        console.log('✅ 已清空强制塔罗牌');
        if (isHost && isConnected) {
            startGameAsHost();
        }
    },
    
    // 显示当前状态
    status: function() {
        console.log('当前强制:', this.forced || '无');
        console.log('预设列表:', Object.keys(this.presets));
    }
};

// 修改 drawTarotCards 支持强制
const _originalDrawTarotCards = drawTarotCards;
drawTarotCards = function() {
    if (window.debugTarot && window.debugTarot.forced) {
        const forced = window.debugTarot.forced;
        // 生成三张牌，past/present/future 分别对应 index 0/1/2
        const result = [
            { id: forced.past?.id || '1', name: MAJOR_ARCANA.find(c => c.id === (forced.past?.id || '1'))?.name || '魔术师', reversed: forced.past?.reversed || false },
            { id: forced.present?.id || '2', name: MAJOR_ARCANA.find(c => c.id === (forced.present?.id || '2'))?.name || '女祭司', reversed: forced.present?.reversed || false },
            { id: forced.future?.id || '3', name: MAJOR_ARCANA.find(c => c.id === (forced.future?.id || '3'))?.name || '皇后', reversed: forced.future?.reversed || false }
        ];
        console.log('🧪 强制塔罗牌:', result);
        return result;
    }
    return _originalDrawTarotCards();
};

console.log('🧪 调试控制台已加载');
console.log('使用方法:');
console.log('  debugTarot.use("sun_moon_past")  - 强制太阳+月亮组合');
console.log('  debugTarot.use("star_moon_past")  - 强制星星+月亮组合');
console.log('  debugTarot.use("devil_sun_past")  - 强制恶魔+太阳组合');
console.log('  debugTarot.use("wheel_rev")       - 强制命运之轮逆位');
console.log('  debugTarot.clear()               - 清空强制');
console.log('  debugTarot.status()              - 查看当前状态');
console.log('可用预设:', Object.keys(window.debugTarot.presets));