(function(){
  const API_BASE = (window.location.protocol === 'file:' || /localhost:808\d/.test(window.location.host))
    ? 'http://localhost:3000'
    : '';

  function token(){
    try { return sessionStorage.getItem('nl_auth_token') || ''; } catch(e){ return ''; }
  }

  async function request(path, opts = {}){
    const url = API_BASE + path;
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const tk = token();
    if (tk) headers['Authorization'] = 'Bearer ' + tk;

    const res = await fetch(url, Object.assign({ method: 'GET', headers }, opts));
    if (res.status === 401){
      try { sessionStorage.removeItem('nl_auth_token'); } catch(e){}
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    if (!res.ok){
      let msg = 'Request failed';
      try { const b = await res.json(); if (b && b.error) msg = b.error; } catch(e){}
      throw Object.assign(new Error(msg), { status: res.status });
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  }

  const API = {
    base: API_BASE,
    get: (path) => request(path),
    post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
    put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
    del: (path) => request(path, { method: 'DELETE' }),
    upload: (path, formData) => {
      const headers = {};
      const tk = token();
      if (tk) headers['Authorization'] = 'Bearer ' + tk;
      const url = API_BASE + path;
      return fetch(url, { method: 'POST', headers, body: formData }).then(async res => {
        if (res.status === 401) throw Object.assign(new Error('Unauthorized'), { status: 401 });
        if (!res.ok) throw Object.assign(new Error('Upload failed'), { status: res.status });
        return res.json();
      });
    },
    setToken: (t) => { try { sessionStorage.setItem('nl_auth_token', t || ''); } catch(e){} },
    getToken: () => token(),
    clearToken: () => { try { sessionStorage.removeItem('nl_auth_token'); } catch(e){} }
  };

  window.NLAPI = API;
})();
