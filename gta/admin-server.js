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

    // 获取列表（按 index.json 顺序）
    if (pathname === '/api/list' && req.method === 'GET') {
        const version = urlObj.searchParams.get('version') || 'gta5';
        const dataDir = path.join(BASE_DIR, 'data', version);
        const detailsDir = path.join(dataDir, 'details');
        const indexFile = path.join(dataDir, 'index.json');

        try {
            let orderedIds = [];
            // 1. 尝试从 index.json 读取顺序
            if (fs.existsSync(indexFile)) {
                const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
                orderedIds = indexData.map(item => item.id);
                console.log(`📋 从 index.json 读取顺序: ${orderedIds.length} 辆`);
            }

            // 2. 读取所有详情文件
            const vehicles = [];
            if (fs.existsSync(detailsDir)) {
                const files = fs.readdirSync(detailsDir);
                
                // 如果 index.json 存在，按 index 顺序加载
                if (orderedIds.length > 0) {
                    // 按 index 顺序遍历
                    orderedIds.forEach(id => {
                        const file = files.find(f => f === `${id}.json`);
                        if (file) {
                            try {
                                const content = fs.readFileSync(path.join(detailsDir, file), 'utf8');
                                vehicles.push(JSON.parse(content));
                            } catch (e) {
                                console.warn('读取文件失败:', file);
                            }
                        }
                    });
                    
                    // 补充 index 中没有但实际存在的文件（放在后面）
                    files.forEach(file => {
                        if (file.endsWith('.json')) {
                            const id = file.replace('.json', '');
                            if (!orderedIds.includes(id)) {
                                try {
                                    const content = fs.readFileSync(path.join(detailsDir, file), 'utf8');
                                    vehicles.push(JSON.parse(content));
                                } catch (e) {
                                    console.warn('读取文件失败:', file);
                                }
                            }
                        }
                    });
                } else {
                    // 没有 index.json，按文件名排序
                    files.sort();
                    files.forEach(file => {
                        if (file.endsWith('.json')) {
                            try {
                                const content = fs.readFileSync(path.join(detailsDir, file), 'utf8');
                                vehicles.push(JSON.parse(content));
                            } catch (e) {
                                console.warn('读取文件失败:', file);
                            }
                        }
                    });
                }
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ vehicles }));
        } catch (err) {
            console.error('/api/list 错误:', err);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ vehicles: [] }));
        }
        return;
    }

    // 加载数据（老接口）
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

                // 写入 details/*.json（保持顺序，按数组顺序保存）
                vehicles.forEach(v => {
                    fs.writeFileSync(
                        path.join(detailsDir, `${v.id}.json`),
                        JSON.stringify(v, null, 2),
                        'utf8'
                    );
                });

                // 生成 index.json（按传入顺序）
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

                // 清理冗余文件（不在 vehicles 列表中的）
                const existingFiles = fs.readdirSync(detailsDir);
                const currentIds = new Set(vehicles.map(v => `${v.id}.json`));
                let cleaned = 0;
                existingFiles.forEach(file => {
                    if (!currentIds.has(file) && file.endsWith('.json')) {
                        fs.unlinkSync(path.join(detailsDir, file));
                        cleaned++;
                    }
                });

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    message: `✅ 成功保存 ${vehicles.length} 辆载具 (${version})${cleaned ? `，清理 ${cleaned} 个冗余文件` : ''}`
                }));
            } catch (err) {
                console.error('/api/save 错误:', err);
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

    // 在 admin-server.js 中添加 /api/list 接口
    if (pathname === '/api/list' && req.method === 'GET') {
        const version = urlObj.searchParams.get('version') || 'gta5';
        const detailsDir = path.join(BASE_DIR, 'data', version, 'details');
        
        try {
            const files = fs.readdirSync(detailsDir);
            const vehicles = [];
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const content = fs.readFileSync(path.join(detailsDir, file), 'utf8');
                        vehicles.push(JSON.parse(content));
                    } catch (e) {
                        console.warn('读取文件失败:', file);
                    }
                }
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ vehicles }));
        } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ vehicles: [] }));
        }
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