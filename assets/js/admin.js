(function(){
  const S = window.NLStore;
  const API = window.NLAPI;

  const AdminLayout = {
    menu: [
      { key:'dashboard', name:'仪表盘', icon:'◈', href:'index.html' },
      { key:'products', name:'产品管理', icon:'◨', href:'products.html' },
      { key:'categories', name:'分类管理', icon:'≡', href:'categories.html' },
      { key:'inquiries', name:'询盘管理', icon:'✉', href:'inquiries.html' },
      { key:'settings', name:'站点设置', icon:'◎', href:'settings.html' },
      { key:'account', name:'账号设置', icon:'◉', href:'account.html' }
    ],
    async init(active){
      const wrap = document.createElement('aside');
      wrap.className = 'admin-sidebar';
      let brandText = 'Admin Panel';
      let brandLogo = '';
      try {
        const s = await S.Site.get();
        brandText = s.brand || 'Admin Panel';
        brandLogo = s.logo || '';
      } catch(e){}
      const brandHtml = brandLogo
        ? `<img src="${brandLogo}" alt="${brandText}" />`
        : brandText;
      wrap.innerHTML = `
        <div class="brand">${brandHtml}</div>
        <ul class="nav">
          ${AdminLayout.menu.map(m => `
            <li><a href="${m.href}" class="${m.key===active?'active':''}">
              <span class="icon">${m.icon}</span><span>${m.name}</span>
            </a></li>
          `).join('')}
        </ul>
        <button class="logout" onclick="AdminLayout.logout()">退出登录</button>
      `;
      document.body.prepend(wrap);

      let username = 'admin';
      try {
        const me = await API.get('/api/auth/me');
        if (me && me.user && me.user.username) username = me.user.username;
      } catch(e){}
      const topbar = document.createElement('div');
      topbar.className = 'admin-topbar';
      topbar.innerHTML = `
        <h2>${AdminLayout.menu.find(m=>m.key===active)?.name || ''}</h2>
        <div class="user">
          <span>${username}</span>
          <div class="avatar">${username.slice(0,1).toUpperCase()}</div>
        </div>
      `;
      const contentEl = document.querySelector('.admin-content');
      if (contentEl) contentEl.before(topbar);
      else document.body.prepend(topbar);
    },
    requireAuth(){
      if (!S.Admin.isLoggedIn()){
        location.href = 'login.html';
        return false;
      }
      return true;
    },
    logout(){
      if (confirm('确定要退出登录吗？')){
        S.Admin.logout();
        location.href = 'login.html';
      }
    }
  };

  const UI = {
    toast(msg, type=''){
      let t = document.querySelector('.toast');
      if (!t){
        t = document.createElement('div');
        t.className = 'toast';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.className = 'toast show ' + type;
      setTimeout(()=> t.classList.remove('show'), 2200);
    },
    confirm(msg, onOk){
      const mask = document.createElement('div');
      mask.className = 'modal-mask show';
      mask.innerHTML = `
        <div class="modal">
          <div class="modal-head"><h3>确认</h3><button class="close">✕</button></div>
          <div class="modal-body"><p>${msg}</p></div>
          <div class="modal-foot">
            <button class="btn" data-act="cancel">取消</button>
            <button class="btn btn-primary" data-act="ok">确定</button>
          </div>
        </div>
      `;
      document.body.appendChild(mask);
      const remove = () => mask.remove();
      mask.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.act === 'ok') { remove(); onOk && onOk(); }
        else remove();
      }));
    }
  };

  window.AdminLayout = AdminLayout;
  window.UI = UI;
})();
