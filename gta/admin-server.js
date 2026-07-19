const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4867;
const BASE_DIR = __dirname;

// 所有版本列表
const VERSIONS = ['gta5', 'gta5ol'];

const server = http.createServer((req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const pathname = urlObj.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 加载数据
    if (pathname === '/api/load' && req.method === 'GET') {
        const version = urlObj.searchParams.get('version') || 'gta5';
        const dataDir = path.join(BASE_DIR, 'data', version);
        
        try {
            const raw = fs.readFileSync(path.join(dataDir, 'vehicles.json'), 'utf8');
            const data = JSON.parse(raw);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(data));
        } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ vehicles: [] }));
        }
        return;
    }

    // 保存数据
    if (pathname === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                const { vehicles, version = 'gta5' } = parsed;
                
                if (!Array.isArray(vehicles)) throw new Error('数据格式错误');

                const dataDir = path.join(BASE_DIR, 'data', version);
                const detailsDir = path.join(dataDir, 'details');
                const imagesDir = path.join(dataDir, 'images');
                
                if (!fs.existsSync(detailsDir)) {
                    fs.mkdirSync(detailsDir, { recursive: true });
                }
                if (!fs.existsSync(imagesDir)) {
                    fs.mkdirSync(imagesDir, { recursive: true });
                }

                // 写入 vehicles.json
                fs.writeFileSync(
                    path.join(dataDir, 'vehicles.json'),
                    JSON.stringify({ vehicles }, null, 2),
                    'utf8'
                );

                // 生成 index.json
                const index = vehicles.map(v => ({
                    id: v.id,
                    name: v.name,
                    category: v.category,
                    difficulty: v.difficulty,
                    description: v.description,
                    update_date: v.update_date,
                    bilibiliVideo: v.bilibiliVideo || '',
                    coverImage: v.variants?.[0]?.image || null,
                    variantsCount: v.variants?.length || 0
                }));
                fs.writeFileSync(
                    path.join(dataDir, 'index.json'),
                    JSON.stringify(index, null, 2),
                    'utf8'
                );

                // 写入详情文件
                vehicles.forEach(v => {
                    fs.writeFileSync(
                        path.join(detailsDir, `${v.id}.json`),
                        JSON.stringify(v, null, 2),
                        'utf8'
                    );
                });

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    message: `✅ 成功覆写 ${version} 版本 ${vehicles.length} 辆载具`
                }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // 提供 admin.html
    if (pathname === '/' || pathname === '/admin.html') {
        const filePath = path.join(BASE_DIR, 'admin.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) { res.writeHead(404); res.end('admin.html not found'); return; }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n🚀 本地管理服务器已启动！`);
    console.log(`📂 项目目录: ${BASE_DIR}`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`📋 支持版本: ${VERSIONS.join(', ')}`);
    console.log(`\n💡 请保持此终端运行，关闭即停止。\n`);
});