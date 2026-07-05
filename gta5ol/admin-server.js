const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4866; // 或你自定义的端口
const DATA_DIR = path.join(__dirname, 'data');
const DETAILS_DIR = path.join(DATA_DIR, 'details');

if (!fs.existsSync(DETAILS_DIR)) fs.mkdirSync(DETAILS_DIR, { recursive: true });

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

    // 提供 admin.html 页面
    if (pathname === '/' || pathname === '/admin.html') {
        const filePath = path.join(__dirname, 'admin.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) { res.writeHead(404); res.end('admin.html not found'); return; }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    // 加载数据（从 vehicles.json 读取）
    if (pathname === '/api/load' && req.method === 'GET') {
        try {
            const raw = fs.readFileSync(path.join(DATA_DIR, 'vehicles.json'), 'utf8');
            const data = JSON.parse(raw);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(data));
        } catch (err) {
            // 文件不存在或解析失败，返回空数组
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ vehicles: [] }));
        }
        return;
    }

    // 保存数据（覆写所有文件）
    if (pathname === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                const vehicles = parsed.vehicles;
                if (!Array.isArray(vehicles)) throw new Error('数据格式错误');

                // 写入 vehicles.json
                fs.writeFileSync(
                    path.join(DATA_DIR, 'vehicles.json'),
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
                    path.join(DATA_DIR, 'index.json'),
                    JSON.stringify(index, null, 2),
                    'utf8'
                );

                // 写入 details/*.json
                vehicles.forEach(v => {
                    fs.writeFileSync(
                        path.join(DETAILS_DIR, `${v.id}.json`),
                        JSON.stringify(v, null, 2),
                        'utf8'
                    );
                });

                // 清理已删除的车辆详情文件
                const existing = fs.readdirSync(DETAILS_DIR);
                const currentIds = new Set(vehicles.map(v => `${v.id}.json`));
                let cleaned = 0;
                existing.forEach(file => {
                    if (!currentIds.has(file) && file.endsWith('.json')) {
                        fs.unlinkSync(path.join(DETAILS_DIR, file));
                        cleaned++;
                    }
                });

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    message: `✅ 成功覆写 ${vehicles.length} 辆载具${cleaned ? `，清理 ${cleaned} 个冗余文件` : ''}`
                }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // 其他请求返回 404
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n🚀 本地管理服务器已启动！`);
    console.log(`📂 项目目录: ${__dirname}`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`\n💡 请保持此终端运行，关闭即停止。\n`);
});