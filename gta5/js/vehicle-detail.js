// vehicle-detail.js - 车辆详情页处理器（按需加载版）
class VehicleDetail {
  constructor() {
    this.vehicleId = null;
    this.vehicle = null;
    this.similarVehicles = [];
  }

  async loadDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    this.vehicleId = urlParams.get('id');

    console.log('加载车辆详情，ID:', this.vehicleId);

    if (!this.vehicleId) {
      this.showError('未指定载具ID');
      return;
    }

    try {
      // 只加载当前车辆的详情文件
      const response = await fetch(`./data/details/${this.vehicleId}.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - 可能该车辆详情文件不存在`);
      }
      this.vehicle = await response.json();
      console.log('找到车辆:', this.vehicle.name);

      // 渲染详情
      this.renderDetail();

      // 加载相关推荐（可选）
      this.loadSimilarVehicles();

      // 更新页面标题
      document.title = `GTA5 Online 稀有载具收集：${this.vehicle.name}`;

    } catch (error) {
      console.error('加载详情失败:', error);
      this.showError('加载详情失败，请确认已运行拆分脚本生成详情文件: ' + error.message);
    }
  }

  renderDetail() {
    const container = document.getElementById('vehicle-detail-container');
    if (!container) return;

    const { vehicle } = this;

    const variantsHTML = vehicle.variants.map(variant => this.renderVariant(variant)).join('');

    const methodsHTML = vehicle.methods && vehicle.methods.length > 0
      ? vehicle.methods.map(method => this.renderMethod(method)).join('')
      : '';

    container.innerHTML = `
      <div class="detail-header">
        <div class="breadcrumb">
          <a href="vehicles.html">载具列表</a> / 
          <a href="vehicles.html?category=${vehicle.category}">${vehicle.category}</a> / 
          <span>${vehicle.name}</span>
        </div>
        <h2>${vehicle.name}</h2>
        <div class="detail-meta">
          <span class="meta-tag category">${vehicle.category}</span>
          <span class="meta-tag difficulty">${vehicle.difficulty}</span>
          <span class="meta-tag date">${vehicle.update_date}</span>
          ${vehicle.bilibiliVideo ? `<a href="${vehicle.bilibiliVideo}" target="_blank" class="meta-tag video">📺 相关视频</a>` : ''}
        </div>
      </div>
      
      <div class="detail-description">
        <p>${vehicle.description}</p>
      </div>
      
      ${vehicle.variants.length > 0 ? `
        <div class="variants-section">
          <h3>🎨 载具变体</h3>
          <div class="variants-container">
            ${variantsHTML}
          </div>
        </div>
      ` : ''}
      
      ${vehicle.explosion_data && vehicle.explosion_data.length > 0 ? this.renderExplosionData(vehicle.explosion_data) : ''}
      
      ${vehicle.routeImage ? `
        <div class="route-section">
          <h3>🗺️ 获取路线图</h3>
          <img 
            data-src="./images/${vehicle.routeImage}" 
            alt="${vehicle.name}获取路线" 
            class="route-image lazy-image"
            loading="lazy"
            onerror="this.style.display='none'; console.error('无法加载图片:', this.dataset.src)"
          >
        </div>
      ` : ''}
      
      ${methodsHTML ? `
        <div class="methods-section">
          <h3>📋 获取方法</h3>
          <div class="methods-container">
            ${methodsHTML}
          </div>
        </div>
      ` : ''}
    `;

    this.setupLazyLoading();
    this.setupExplosionDataToggle();
  }

  renderVariant(variant) {
    const specsHTML = variant.specs.map(spec => {
      const colorClass = spec.isRare ? 'rare' :
        (spec.value === '未知' || spec.value === '无' ? 'unknown' : 'normal');

      return `
        <div class="spec-item" data-key="${spec.label}" data-rare="${spec.isRare}">
          <span class="spec-label">${spec.label}：</span>
          <span class="spec-value ${colorClass}">${spec.value}</span>
        </div>
      `;
    }).join('');

    const propertiesHTML = Object.entries(variant.properties).map(([key, value]) => {
      let className = '';
      if (key === '入库情况') {
        if (value.includes('黑名单')) className = 'storage-blacklist';
        else if (value.includes('直接入库')) className = 'storage-direct';
        else if (value.includes('复制车 / LSC')) className = 'storage-copy';
      } else if (key === '获取难度' || key === '收藏价值') {
        const rating = value.length;
        className = `rating-${rating}`;
      } else if (key === '车友会') {
        if (value.includes('完全继承')) className = 'meetup-full';
        else if (value.includes('会掉配件')) className = 'meetup-partial';
        else if (value.includes('无法继承')) className = 'meetup-none';
      }
      return `
        <div class="property-item">
          <span class="property-label">${key}：</span>
          <span class="property-value ${className}">${value}</span>
        </div>
      `;
    }).join('');

    const variantExplosionData = variant.explosion_data 
      ? this.renderVariantExplosionData(variant.name, variant.explosion_data)
      : '';

    return `
      <div class="variant-card">
        <div class="variant-image">
          <img 
            data-src="./images/${variant.image}" 
            alt="${this.vehicle.name} - ${variant.name}" 
            class="lazy-image"
            loading="lazy"
            onerror="this.style.display='none'; console.error('无法加载变体图片:', this.dataset.src)"
          >
          <div class="variant-name">${variant.name}</div>
        </div>
        <div class="variant-details">
          <div class="variant-specs">
            <h4>车辆配置</h4>
            ${specsHTML}
            ${variant.accessory ? `<div class="accessory-item">${variant.accessory}</div>` : ''}
          </div>
          <div class="variant-properties">
            <h4>车辆属性</h4>
            ${propertiesHTML}
          </div>
        </div>
        ${variantExplosionData}
      </div>
    `;
  }

  renderExplosionData(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const dataId = `explosion-data-${Date.now()}`;
    const formattedJson = this.syntaxHighlight(jsonString);

    return `
      <div class="explosion-data-section">
        <div class="section-header expandable" data-target="${dataId}">
          <h3>💥 瞬间爆炸数据</h3>
          <span class="expand-icon">▼</span>
        </div>
        <div id="${dataId}" class="explosion-data-content" style="display: none;">
          <div class="code-container">
            <pre class="json-code">${formattedJson}</pre>
            <button class="copy-btn" data-clipboard-text='${this.escapeHtml(jsonString)}'>
              📋 复制代码
            </button>
          </div>
          <p class="data-note">注：此数据可用于载具瞬间爆炸等特殊操作，请谨慎使用</p>
        </div>
      </div>
    `;
  }

  renderMethod(method) {
    const detailsHTML = method.details && Object.keys(method.details).length > 0
      ? `
        <div class="method-details">
          ${Object.entries(method.details).map(([key, value]) => `
            <div class="detail-row">
              <span class="detail-label">${key}：</span>
              <span class="detail-value">${value}</span>
            </div>
          `).join('')}
        </div>
      `
      : '';

    return `
      <div class="method-card">
        <div class="method-header">
          <span class="method-number">${method.number}</span>
          <h4>${method.title}</h4>
        </div>
        ${detailsHTML}
        ${method.intro ? `<p class="method-intro">${method.intro}</p>` : ''}
        <div class="method-description">
          ${method.description}
        </div>
        ${method.noteLink && method.noteText ? `
          <a href="${method.noteLink}" class="note-link">${method.noteText}</a>
        ` : ''}
      </div>
    `;
  }

  // 相关推荐（基于索引加载，保持轻量）
  async loadSimilarVehicles() {
    if (!this.vehicle) return;

    try {
      const response = await fetch('./data/index.json');
      if (!response.ok) return;
      const indexData = await response.json();

      const similar = indexData
        .filter(v => v.id !== this.vehicleId && v.category === this.vehicle.category)
        .slice(0, 3);

      if (similar.length === 0) return;

      const container = document.getElementById('similar-container');
      const section = document.getElementById('similar-vehicles');
      if (!container || !section) return;

      section.style.display = 'block';

      container.innerHTML = similar.map(vehicle => `
        <div class="similar-card">
          <img 
            data-src="${vehicle.coverImage ? `./images/${vehicle.coverImage}` : 'images/placeholder.jpg'}" 
            alt="${vehicle.name}" 
            class="lazy-image"
            loading="lazy"
            onerror="this.style.display='none'"
          >
          <div class="similar-info">
            <h4>${vehicle.name}</h4>
            <p>${vehicle.description ? vehicle.description.substring(0, 60) + '...' : ''}</p>
            <a href="vehicle-detail.html?id=${vehicle.id}" class="btn-view">查看详情</a>
          </div>
        </div>
      `).join('');

      this.setupLazyLoading(); // 重新绑定懒加载
    } catch (e) {
      console.warn('加载推荐失败:', e);
    }
  }

  // ---------- 辅助方法 ----------
  renderVariantExplosionData(variantName, explosionData) {
    const dataString = typeof explosionData === 'string' 
      ? explosionData 
      : JSON.stringify(explosionData);
    
    const dataId = `explosion-data-${this.vehicleId}-${variantName.replace(/\s+/g, '-')}`;
    const cleanData = dataString.replace(/[\n\t\r]/g, '').replace(/\s+/g, ' ');
    
    return `
      <div class="variant-explosion-section">
        <div class="explosion-toggle" data-target="${dataId}">
          <span class="toggle-icon">▶</span>
          <span class="toggle-text">💥 显示瞬间爆炸数据</span>
        </div>
        <div id="${dataId}" class="explosion-data-box" style="display: none;">
          <div class="data-container">
            <div class="data-content">
              <code class="explosion-code">${this.escapeHtml(cleanData)}</code>
              <button class="mini-copy-btn" data-clipboard-text="${this.escapeHtml(cleanData)}" title="复制代码">
                📋
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupExplosionDataToggle() {
    document.querySelectorAll('.variant-explosion-section .explosion-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.dataset.target;
        const content = document.getElementById(targetId);
        const icon = toggle.querySelector('.toggle-icon');
        
        if (content.style.display === 'none') {
          content.style.display = 'block';
          icon.textContent = '▼';
        } else {
          content.style.display = 'none';
          icon.textContent = '▶';
        }
      });
    });
    
    document.querySelectorAll('.mini-copy-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = button.dataset.clipboardText;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = button.textContent;
          button.textContent = '✅';
          button.style.background = '#2ecc71';
          setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
          }, 1500);
        }).catch(err => {
          console.error('复制失败:', err);
          button.textContent = '❌';
          button.style.background = '#e74c3c';
          setTimeout(() => {
            button.textContent = '📋';
            button.style.background = '';
          }, 1500);
        });
      });
    });

    // 原有的展开/收起（用于整体爆炸数据）
    document.querySelectorAll('.section-header.expandable').forEach(header => {
      header.addEventListener('click', () => {
        const targetId = header.dataset.target;
        const content = document.getElementById(targetId);
        const icon = header.querySelector('.expand-icon');
        if (content.style.display === 'none') {
          content.style.display = 'block';
          icon.textContent = '▲';
        } else {
          content.style.display = 'none';
          icon.textContent = '▼';
        }
      });
    });
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

  syntaxHighlight(json) {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
      function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showError(message) {
    const container = document.getElementById('vehicle-detail-container');
    if (container) {
      container.innerHTML = `
        <div class="error-container">
          <h3>⚠️ 错误</h3>
          <p>${message}</p>
          <a href="vehicles.html" class="btn-back">返回载具列表</a>
        </div>
      `;
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('车辆详情页初始化...');
  const vehicleDetail = new VehicleDetail();
  vehicleDetail.loadDetail();
});