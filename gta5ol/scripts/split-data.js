// scripts/split-data.js
const fs = require('fs');
const path = require('path');

// 读取原始大 JSON
const raw = fs.readFileSync('./data/vehicles.json', 'utf8');
const data = JSON.parse(raw);
const vehicles = data.vehicles;

// 确保目录存在
const dataDir = './data';
const detailsDir = path.join(dataDir, 'details');
if (!fs.existsSync(detailsDir)) fs.mkdirSync(detailsDir, { recursive: true });

// 1. 生成索引（精简字段）
const index = vehicles.map(v => ({
  id: v.id,
  name: v.name,
  category: v.category,
  difficulty: v.difficulty,
  description: v.description,
  update_date: v.update_date,
  bilibiliVideo: v.bilibiliVideo,
  // 取第一个变体的图片作为封面（如果没有则置空）
  coverImage: v.variants && v.variants.length > 0 ? v.variants[0].image : null,
  variantsCount: v.variants ? v.variants.length : 0
}));

fs.writeFileSync(
  path.join(dataDir, 'index.json'),
  JSON.stringify(index, null, 2)
);
console.log(`✅ 已生成索引，共 ${index.length} 辆`);

// 2. 每个车辆单独保存为详情文件
vehicles.forEach(v => {
  const fileName = `${v.id}.json`;
  const filePath = path.join(detailsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(v, null, 2));
});
console.log(`✅ 已生成 ${vehicles.length} 个详情文件`);