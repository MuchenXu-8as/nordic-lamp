(function(){
  const API = (typeof window.NLAPI !== 'undefined') ? window.NLAPI : {
    base: '',
    get: () => Promise.reject(new Error('NLAPI not ready')),
    post: () => Promise.reject(new Error('NLAPI not ready')),
    put: () => Promise.reject(new Error('NLAPI not ready')),
    del: () => Promise.reject(new Error('NLAPI not ready'))
  };

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  function first(arr){ return arr && arr.length ? arr[0] : null; }
  function rest(arr){ return arr && arr.length ? arr.slice(1) : []; }

  const Site = {
    get: () => API.get('/api/site/settings').then(r => r.data),
    save: (s) => API.put('/api/site/settings', s).then(r => r.data)
  };

  const Categories = {
    list: () => API.get('/api/categories').then(r => r.data),
    get: (id) => API.get('/api/categories').then(r => r.data.find(c => c.id === id)),
    findBySlug: (slug) => API.get('/api/categories').then(r => r.data.find(c => c.slug === slug)),
    saveAll: (arr) => Promise.all(arr.map(c => c.id
      ? API.put('/api/categories/' + encodeURIComponent(c.id), c)
      : API.post('/api/categories', c))),
    create: (data) => API.post('/api/categories', data).then(r => r.data),
    update: (id, data) => API.put('/api/categories/' + encodeURIComponent(id), data).then(r => r.data),
    remove: (id) => API.del('/api/categories/' + encodeURIComponent(id)),
    reorder: (ids) => API.post('/api/categories/reorder', ids)
  };

  const Products = {
    list: () => API.get('/api/products').then(r => r.data),
    featured: () => API.get('/api/products').then(r => r.data.filter(p => p.featured)),
    byCategory: (catId) => API.get('/api/products').then(r => r.data.filter(p => p.categoryId === catId)),
    get: (id) => API.get('/api/products/' + encodeURIComponent(id)).then(r => r.data).catch(e => null),
    getBySlug: (slug) => API.get('/api/products/slug/' + encodeURIComponent(slug)).then(r => r.data).catch(e => null),
    saveAll: (arr) => Promise.all(arr.map(p => p.id
      ? API.put('/api/products/' + encodeURIComponent(p.id), p)
      : API.post('/api/products', p))),
    create: (data) => API.post('/api/products', data).then(r => r.data),
    update: (id, data) => API.put('/api/products/' + encodeURIComponent(id), data).then(r => r.data),
    remove: (id) => API.del('/api/products/' + encodeURIComponent(id)),
    reorder: (ids) => API.post('/api/products/reorder', ids)
  };

  const Inquiries = {
    list: () => API.get('/api/inquiries').then(r => r.data),
    get: (id) => API.get('/api/inquiries').then(r => r.data.find(i => i.id === id)),
    create: (data) => API.post('/api/inquiries', data).then(r => r.data),
    update: (id, data) => API.put('/api/inquiries/' + encodeURIComponent(id), data).then(r => r.data),
    remove: (id) => API.del('/api/inquiries/' + encodeURIComponent(id)),
    stats: () => API.get('/api/inquiries/stats').then(r => {
      const d = r.data || {};
      return {
        total: d.total || 0,
        new: d.new || 0,
        contacted: d.contacted || 0,
        quoted: d.quoted || 0,
        won: d.won || 0,
        lost: d.lost || 0
      };
    })
  };

  const Admin = {
    get: () => Promise.resolve({ username: 'admin', password: '' }),
    login: (u, p) => API.post('/api/auth/login', { username: u, password: p }).then(r => {
      if (r && r.token) { API.setToken(r.token); return true; }
      return false;
    }).catch(() => false),
    changeCredentials: (u, p) => {
      const payload = {};
      if (u !== undefined) payload.username = u;
      if (p !== undefined) payload.newPassword = p;
      return API.put('/api/auth/change-password', payload).then(r => true).catch(() => false);
    },
    logout: () => { API.clearToken(); },
    isLoggedIn: () => !!API.getToken(),
    setSession: () => {}
  };

  window.NLStore = { Site, Categories, Products, Inquiries, Admin, uid };
  window.NL = window.NLStore;
})();
