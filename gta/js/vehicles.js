// vehicles.js - 车辆数据管理器（支持多版本）
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
    this.version = this.getVersion();
    this.config = null;
    console.log('当前版本:', this.version);
  }

  getVersion() {
    const params = new URLSearchParams(window.location.search);
    return params.get('version') || 'gta5';
  }

  async loadConfig() {
    try {
      const response = await fetch('data/config.json');
      if (!response.ok) throw new Error('无法加载配置文件');
      this.config = await response.json();
      return this.config;
    } catch (error) {
      console.warn('加载配置失败，使用默认配置:', error);
      this.config = {
        versions: {
          gta5: { title: 'GTA5 故事模式 稀有载具收集', dataPath: 'data/gta5/' },
          gta5ol: { title: 'GTA5 Online 稀有载具收集', dataPath: 'data/gta5ol/' }
        }
      };
      return this.config;
    }
  }

  async loadVehicles() {
    console.log('开始加载车辆索引...');
    try {
      await this.loadConfig();
      
      const response = await fetch(`./data/${this.version}/index.json`);
      console.log('响应状态:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.vehicles = await response.json();
      console.log(`成功加载 ${this.vehicles.length} 个车辆索引`);

      this.vehicles.forEach(vehicle => {
        if (vehicle.category) {
          this.categories.add(vehicle.category);
        }
      });

      this.updatePageTitle();
      this.updateCategoryFilter();
      this.render();
      this.updateResultCount();
      this.setupSearch();
      this.highlightVersion();

    } catch (error) {
      console.error('加载失败:', error);
      this.showError('加载数据失败: ' + error.message);
    }
  }

  updatePageTitle() {
    const vc = this.config.versions[this.version];
    if (vc) {
      document.title = vc.title + ' - 载具列表';
      document.getElementById('pageTitle').textContent = vc.title + ' - 载具列表';
      document.getElementById('siteTitle').textContent = vc.title;
      document.getElementById('pageSubtitle').textContent = '🚗 稀有载具列表';
      
      const homeLink = document.getElementById('homeLink');
      if (homeLink) {
        homeLink.textContent = vc.navLabel || (this.version === 'gta5' ? 'GTA5首页' : 'GTA5OL首页');
        homeLink.href = `./index.html?version=${this.version}`;
      }
    }
  }

  highlightVersion() {
    document.querySelectorAll('.version-btn').forEach(btn => {
      btn.style.background = btn.dataset.version === this.version ? '#8b5cf6' : '#2d2d2d';
      btn.style.color = btn.dataset.version === this.version ? '#fff' : '#aaa';
    });
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

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && this.categories.has(categoryParam)) {
      filter.value = categoryParam;
      this.currentCategory = categoryParam;
    }
  }

  setupSearch() {
    console.log('设置搜索功能...');

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get('search');
      if (searchParam) {
        searchInput.value = searchParam;
        this.searchTerm = searchParam.toLowerCase();
      }

      searchInput.addEventListener('input', (e) => {
        console.log('搜索输入:', e.target.value);
        this.searchTerm = e.target.value.trim().toLowerCase();
        this.currentPage = 1;
        this.render();
        this.updateResultCount();
        this.updateURL();
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
        this.updateURL();
      });
    } else {
      console.error('未找到 #category-filter 元素');
    }
  }

  updateURL() {
    const url = new URL(window.location);
    if (this.currentCategory !== 'all') {
      url.searchParams.set('category', this.currentCategory);
    } else {
      url.searchParams.delete('category');
    }
    if (this.searchTerm) {
      url.searchParams.set('search', this.searchTerm);
    } else {
      url.searchParams.delete('search');
    }
    url.searchParams.set('version', this.version);
    window.history.pushState({}, '', url);
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

    // ⭐ 关键修改：图片路径改为版本目录下
    const imagePath = vehicle.coverImage 
      ? `data/${this.version}/images/${vehicle.coverImage}` 
      : 'images/placeholder.jpg';

    div.innerHTML = `
      <div class="card-image">
        <img 
          data-src="${imagePath}" 
          alt="${vehicle.name}" 
          class="lazy-image"
          loading="lazy"
          onerror="this.style.display='none'"
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
          <a href="vehicle-detail.html?id=${vehicle.id}&version=${this.version}" class="btn-view">查看详情</a>
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
    if (total === 0) {
      countElement.textContent = '暂无结果';
      return;
    }

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
              img.classList.remove('lazy-image');
            }
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('.lazy-image').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      document.querySelectorAll('.lazy-image').forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }
  }

  showError(message) {
    const container = document.getElementById('vehicle-container');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <h3>⚠️ 错误</h3>
          <p>${message}</p>
          <p style="margin-top:10px;font-size:0.9rem;color:#94a3b8;">
            提示：请确保 data/${this.version}/ 目录下有 index.json 文件
          </p>
        </div>
      `;
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