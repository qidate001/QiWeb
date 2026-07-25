document.addEventListener('DOMContentLoaded', () => {
    // 气运值概率计算器实现
    const luckSlider = document.getElementById('luck-slider');
    const luckDisplay = document.getElementById('luck-display');
    const pGood = document.getElementById('p-good');
    const pBad = document.getElementById('p-bad');
    const pNeutral = document.getElementById('p-neutral');

    function calculateProbabilities(L) {
        // 基础概率
        const P_good_base = 0.3;
        const P_bad_base = 0.2;
        const P_neutral_base = 0.5;
        const k = 0.002;

        // 影响量
        const E = L * k;

        // 初步调整
        let P_good_def = P_good_base + E;
        let P_bad_def = P_bad_base - E;
        let P_neutral_def = P_neutral_base;

        // 限制函数 (clamp)
        function clamp(val, min, max) {
            return Math.min(max, Math.max(min, val));
        }

        // 应用限制
        let P_good_clamp = clamp(P_good_def, 0.1, 0.6);
        let P_bad_clamp = clamp(P_bad_def, 0.1, 0.6);
        let P_neutral_clamp = P_neutral_def;

        // 重平衡总概率
        let P_total = P_good_clamp + P_bad_clamp + P_neutral_clamp;

        // 计算最终概率百分比，并且保留2位小数
        let P_good_final = (P_good_clamp / P_total) * 100;
        let P_bad_final = (P_bad_clamp / P_total) * 100;
        let P_neutral_final = (P_neutral_clamp / P_total) * 100;

        return {
            good: P_good_final.toFixed(2),
            bad: P_bad_final.toFixed(2),
            neutral: P_neutral_final.toFixed(2)
        };
    }

    function updateLuck() {
        const L = parseInt(luckSlider.value);
        luckDisplay.textContent = L;

        const probs = calculateProbabilities(L);
        
        pGood.textContent = probs.good + '%';
        pBad.textContent = probs.bad + '%';
        pNeutral.textContent = probs.neutral + '%';
    }

    // 初始化及监听滑动条事件
    luckSlider.addEventListener('input', updateLuck);
    updateLuck(); // 第一次加载时计算一下

    // ==========================================
    // 亮/暗 主题切换逻辑
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    
    // 1. 读取本地存储主题偏好，如果没有则默认使用暗色
    const currentTheme = localStorage.getItem('theme');
    
    // 处理 HTML 中默认的 class
    if (currentTheme === 'light') {
        // 如果用户上次切成了亮色，即便HTML有class也需要移除
        document.body.classList.remove('dark-theme');
        themeToggle.textContent = '🌓 暗色模式';
    } else {
        // 默认情况（或存了 'dark'），确保是暗色且按钮显示正确
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '🌞 亮色模式';
    }

    // 2. 绑定点击切换事件
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            // 切换 class
            document.body.classList.toggle('dark-theme');
            
            // 根据当前状态更新按钮文字以及本地存储
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '🌞 亮色模式';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '🌓 暗色模式';
            }
        });
    }
});