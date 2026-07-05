// vehicles.js - 车辆数据管理器（按需加载索引版）
console.log('vehicles.js 已加载');

class VehicleManager {
  constructor() {
    this.vehicles = [];
    this.filteredVehicles = [];
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.currentCategory = 'all';
    this.searchTerm = '';
    this.categories = new Set(['所有分类']);
  }

  async loadVehicles() {
    console.log('开始加载车辆索引...');
    try {
      // 只加载轻量索引
      const response = await fetch('./data/index.json');
      console.log('响应状态:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.vehicles = await response.json(); // 直接是数组
      console.log(`成功加载 ${this.vehicles.length} 个车辆索引`);

      // 提取分类
      this.vehicles.forEach(vehicle => {
        if (vehicle.category) {
          this.categories.add(vehicle.category);
        }
      });

      // 更新分类筛选器
      this.updateCategoryFilter();

      // 渲染车辆
      this.render();

      // 更新结果计数
      this.updateResultCount();

      // 设置搜索功能
      this.setupSearch();

    } catch (error) {
      console.error('加载失败:', error);
      this.showError('加载数据失败，请确保已运行拆分脚本生成 index.json: ' + error.message);
    }
  }

  updateCategoryFilter() {
    const filter = document.getElementById('category-filter');
    if (!filter) {
      console.error('未找到分类筛选器');
      return;
    }

    filter.innerHTML = '<option value="all">所有分类</option>';
    Array.from(this.categories)
      .filter(cat => cat !== '所有分类')
      .forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
      });
  }

  setupSearch() {
    console.log('设置搜索功能...');

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        console.log('搜索输入:', e.target.value);
        this.searchTerm = e.target.value.trim().toLowerCase();
        this.currentPage = 1;
        this.render();
        this.updateResultCount();
      });
    } else {
      console.error('未找到 #search-input 元素');
    }

    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        console.log('分类选择:', e.target.value);
        this.currentCategory = e.target.value;
        this.currentPage = 1;
        this.render();
        this.updateResultCount();
      });
    } else {
      console.error('未找到 #category-filter 元素');
    }
  }

  filterVehicles() {
    return this.vehicles.filter(vehicle => {
      const matchesCategory = this.currentCategory === 'all' ||
        vehicle.category === this.currentCategory;

      const matchesSearch = !this.searchTerm ||
        (vehicle.name && vehicle.name.toLowerCase().includes(this.searchTerm)) ||
        (vehicle.description && vehicle.description.toLowerCase().includes(this.searchTerm));

      return matchesCategory && matchesSearch;
    });
  }

  render() {
    const container = document.getElementById('vehicle-container');
    if (!container) {
      console.error('未找到 #vehicle-container 元素');
      return;
    }

    this.filteredVehicles = this.filterVehicles();
    console.log(`过滤后: ${this.filteredVehicles.length} 个车辆`);

    container.innerHTML = '';

    if (this.filteredVehicles.length === 0) {
      container.innerHTML = '<div class="no-results"><p>🔍 没有找到匹配的车辆</p></div>';
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageVehicles = this.filteredVehicles.slice(startIndex, endIndex);

    pageVehicles.forEach(vehicle => {
      const vehicleElement = this.createVehicleCard(vehicle);
      container.appendChild(vehicleElement);
    });

    this.renderPagination();
    this.setupLazyLoading();
  }

  createVehicleCard(vehicle) {
    const div = document.createElement('div');
    div.className = 'vehicle-card';
    div.dataset.id = vehicle.id;

    // 使用索引中的封面图字段
    const imagePath = vehicle.coverImage ? `images/${vehicle.coverImage}` : 'images/placeholder.jpg';

    div.innerHTML = `
      <div class="card-image">
        <img 
          data-src="${imagePath}" 
          alt="${vehicle.name}" 
          class="lazy-image"
          loading="lazy"
        >
        <div class="card-category">${vehicle.category}</div>
        <div class="card-difficulty">${vehicle.difficulty}</div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${vehicle.name}</h3>
        <p class="card-description">${vehicle.description || '无描述'}</p>
        <div class="card-meta">
          <span class="meta-item">📅 ${vehicle.update_date || '未知'}</span>
          <span class="meta-item">🎨 ${vehicle.variantsCount || 0}款</span>
        </div>
        <div class="card-actions">
          <a href="vehicle-detail.html?id=${vehicle.id}" class="btn-view">查看详情</a>
        </div>
      </div>
    `;

    return div;
  }

  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(this.filteredVehicles.length / this.itemsPerPage);

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '<div class="pagination">';

    if (this.currentPage > 1) {
      html += `<button class="page-btn prev" onclick="vehicleManager.goToPage(${this.currentPage - 1})">上一页</button>`;
    }

    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i === this.currentPage) {
        html += `<span class="page-number active">${i}</span>`;
      } else {
        html += `<button class="page-number" onclick="vehicleManager.goToPage(${i})">${i}</button>`;
      }
    }

    if (this.currentPage < totalPages) {
      html += `<button class="page-btn next" onclick="vehicleManager.goToPage(${this.currentPage + 1})">下一页</button>`;
    }

    html += '</div>';
    pagination.innerHTML = html;
  }

  goToPage(page) {
    this.currentPage = page;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.updateResultCount();
  }

  updateResultCount() {
    const countElement = document.getElementById('result-count');
    if (!countElement) return;

    const total = this.filteredVehicles.length;
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);

    countElement.textContent = `显示 ${start}-${end} 条，共 ${total} 条结果`;
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('.lazy-image').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  showError(message) {
    const container = document.getElementById('vehicle-container');
    if (container) {
      container.innerHTML =
        '<div class="error-message">' +
        '<h3>⚠️ 错误</h3>' +
        '<p>' + message + '</p>' +
        '</div>';
    }
  }
}

// 初始化
let vehicleManager;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 已加载，初始化 VehicleManager');
  vehicleManager = new VehicleManager();

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const search = urlParams.get('search');

  if (category && category !== 'all') {
    vehicleManager.currentCategory = category;
  }

  if (search) {
    vehicleManager.searchTerm = search.toLowerCase();
  }

  vehicleManager.loadVehicles();
  window.vehicleManager = vehicleManager;
});