// 主题切换按钮逻辑
const themeBtn = document.getElementById('themeToggle');
const body = document.body;
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.add('light-theme');
    themeBtn.textContent = '☀️';
} else {
    body.classList.remove('light-theme');
    themeBtn.textContent = '🌙';
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    themeBtn.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// 配置填充
document.addEventListener('DOMContentLoaded', function () {
    if (typeof APP_CONFIG !== 'undefined') {
        document.getElementById('toolkitVersion').textContent = APP_CONFIG.version;
        document.getElementById('licenseLink').href = APP_CONFIG.urls.license;
        document.getElementById('baiduLink').href = APP_CONFIG.urls.baiduPan;
        document.getElementById('githubLink').href = APP_CONFIG.urls.github;
        document.getElementById('eulaLink').href = APP_CONFIG.urls.eula;
    }
});