// 转换旧页面为JSON的辅助工具
// 在浏览器控制台运行此代码可以将现有页面数据提取为JSON格式

function extractVehicleData() {
  const vehicles = [];
  const categories = new Set();
  
  // 遍历页面中的车辆项
  document.querySelectorAll('.expandable-item').forEach(item => {
    const titleElement = item.querySelector('.item-title');
    const links = item.querySelectorAll('a');
    const images = item.querySelectorAll('img');
    
    if (titleElement) {
      const name = titleElement.textContent.trim();
      let category = '';
      
      // 根据链接判断分类
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('./')) {
          if (href.includes('改车王系列')) category = '改车王系列';
          else if (href.includes('零散系列')) category = '零散系列';
        }
      });
      
      // 提取图片
      const variants = [];
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.includes('images/')) {
          const imageName = src.split('/').pop();
          variants.push({
            name: '未知变体',
            image: imageName,
            specs: {},
            properties: {}
          });
        }
      });
      
      if (name && category && variants.length > 0) {
        categories.add(category);
        
        vehicles.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          category: category,
          difficulty: '★★☆☆☆',
          description: '稀有载具',
          update_date: '2025-11-01',
          variants: variants,
          methods: []
        });
      }
    }
  });
  
  console.log('提取到的车辆数据:');
  console.log(JSON.stringify({ vehicles: vehicles }, null, 2));
  console.log('分类:', Array.from(categories));
  
  return { vehicles: vehicles };
}

// 运行提取函数
extractVehicleData();