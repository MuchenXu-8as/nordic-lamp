(function(){
  const S = window.NLStore;
  const I = window.I18n;

  const Site = {
    async renderHeader(){
      const h = document.getElementById('site-header');
      if (!h) return;
      const s = await S.Site.get();
      const brandHtml = s.logo
        ? `<img src="${s.logo}" alt="${s.brand}" />`
        : (s.brand || 'Nordic Lamp');
      h.className = 'site-header';
      h.innerHTML = `
        <div class="site-header-inner">
          <a class="brand" href="index.html">${brandHtml}</a>
          <nav id="primary-nav" class="nav-links">
            <a href="index.html" data-nav="home" data-i18n="nav.home">${I.t('nav.home')}</a>
            <a href="products.html" data-nav="products" data-i18n="nav.products">${I.t('nav.products')}</a>
            <a href="about.html" data-nav="about" data-i18n="nav.about">${I.t('nav.about')}</a>
            <a href="contact.html" data-nav="contact" data-i18n="nav.contact">${I.t('nav.contact')}</a>
            <a href="admin/index.html" data-i18n="nav.admin" style="border-bottom:1px dashed transparent;padding-bottom:2px;color:var(--muted);font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;">${I.t('nav.admin')}</a>
          </nav>
          <div id="lang-switch-slot"></div>
          <button class="nav-toggle" aria-label="Menu">☰</button>
        </div>
      `;
      const page = document.body.dataset.page;
      const active = h.querySelector(`[data-nav="${page}"]`);
      if (active) active.classList.add('active');
      const toggle = h.querySelector('.nav-toggle');
      toggle.addEventListener('click', () => h.querySelector('#primary-nav').classList.toggle('open'));
      I.buildSwitcher(document.getElementById('lang-switch-slot'));
    },

    async renderFooter(){
      const f = document.getElementById('site-footer');
      if (!f) return;
      const [s, cats] = await Promise.all([S.Site.get(), S.Categories.list()]);
      const brandHtml = s.logo
        ? `<img src="${s.logo}" alt="${s.brand}" />`
        : (s.brand || 'Nordic Lamp');
      f.className = 'site-footer';
      f.innerHTML = `
        <div class="footer-inner container">
          <div class="footer-col">
            <div class="footer-brand">${brandHtml}</div>
            <p style="max-width:42ch">${s.brandTag}</p>
          </div>
          <div class="footer-col">
            <h5 data-i18n="footer.shop">${I.t('footer.shop')}</h5>
            <a href="products.html" data-i18n="products.hero.title">${I.t('products.hero.title')}</a>
            ${cats.map(c=>`<a href="products.html?cat=${c.slug}">${I.categoryName(c.name)}</a>`).join('')}
          </div>
          <div class="footer-col">
            <h5 data-i18n="footer.company">${I.t('footer.company')}</h5>
            <a href="about.html" data-i18n="nav.about">${I.t('nav.about')}</a>
            <a href="contact.html" data-i18n="nav.contact">${I.t('nav.contact')}</a>
            <a href="#" data-i18n="home.contact.wholesale">${I.t('home.contact.wholesale')}</a>
          </div>
          <div class="footer-col">
            <h5 data-i18n="footer.connect">${I.t('footer.connect')}</h5>
            <a href="${s.socialIg}" data-i18n="footer.instagram">${I.t('footer.instagram')}</a>
            <a href="${s.socialFb}" data-i18n="footer.facebook">${I.t('footer.facebook')}</a>
            <a href="${s.socialPi}" data-i18n="footer.pinterest">${I.t('footer.pinterest')}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>${s.footerText}</span>
          <span>${s.contactEmail}</span>
        </div>
      `;
    },

    async applySiteSettings(){
      const s = await S.Site.get();
      document.title = `${s.brand} — ${s.brandTag}`;
      this.translateStaticTexts();
    },

    translateStaticTexts(){
      document.querySelectorAll('[data-text]').forEach(el => {
        const key = el.dataset.text;
        const translated = I.t(key);
        if (translated && translated !== key){
          el.textContent = translated;
        }
      });
      document.querySelectorAll('[data-placeholder]').forEach(el => {
        el.placeholder = I.t(el.dataset.placeholder);
      });
    },

    async onLangChange(){
      await Promise.all([
        this.renderHeader(),
        this.renderFooter(),
        this.applySiteSettings()
      ]);
      if (typeof window.HomePage !== 'undefined' && window.HomePage.onLangChange) window.HomePage.onLangChange();
      if (typeof window.ProductsPage !== 'undefined' && window.ProductsPage.onLangChange) window.ProductsPage.onLangChange();
      if (typeof window.ProductDetailPage !== 'undefined' && window.ProductDetailPage.onLangChange) window.ProductDetailPage.onLangChange();
      if (typeof window.AboutPage !== 'undefined' && window.AboutPage.onLangChange) window.AboutPage.onLangChange();
      if (typeof window.ContactPage !== 'undefined' && window.ContactPage.onLangChange) window.ContactPage.onLangChange();
    },

    productCard(p, catMap){
      const cat = (catMap && p.categoryId) ? catMap[p.categoryId] : null;
      const img = p.images && p.images[0] ? p.images[0] : '';
      const catName = cat ? I.categoryName(cat.name) : '';
      return `
        <a class="product-card" href="product.html?slug=${encodeURIComponent(p.slug || '')}&id=${encodeURIComponent(p.id)}">
          <div class="product-card-img">
            ${img ? `<img src="${img}" alt="${I.productName(p.name)}" />` : ''}
          </div>
          <p class="product-cat">${catName}</p>
          <h3>${I.productName(p.name)}</h3>
          <p class="product-price">${p.price || ''}</p>
        </a>
      `;
    }
  };

  const HomePage = {
    async init(){ await this.render(); },
    async render(){
      const grid = document.getElementById('featured-grid');
      if (!grid) return;
      const [featured, cats] = await Promise.all([S.Products.featured(), S.Categories.list()]);
      const catMap = {};
      cats.forEach(c => { catMap[c.id] = c; });
      grid.innerHTML = featured.length
        ? featured.map(p => Site.productCard(p, catMap)).join('')
        : `<p class="muted">—</p>`;
    },
    onLangChange(){ this.render(); }
  };

  const ProductsPage = {
    async init(){ await this.render(); },
    async render(){
      const grid = document.getElementById('products-grid');
      const filters = document.getElementById('filters');
      if (!grid) return;

      const urlCat = new URLSearchParams(location.search).get('cat');
      let currentCat = urlCat || 'all';

      const catsFromApi = await S.Categories.list();
      const cats = [{ id:'all', slug:'all', name: I.t('products.all') }].concat(catsFromApi);
      const labels = { all: I.t('products.all') };

      filters.innerHTML = cats.map(c => {
        const name = c.slug === 'all' ? labels.all : I.categoryName(c.name || '');
        return `<button class="filter-btn ${c.slug===currentCat?'active':''}" data-cat="${c.slug}">${name}</button>`;
      }).join('');

      const catMap = {};
      catsFromApi.forEach(c => { catMap[c.id] = c; });

      async function renderList(){
        let list;
        if (currentCat === 'all') list = await S.Products.list();
        else {
          const c = catsFromApi.find(x => x.slug === currentCat);
          list = c ? await S.Products.byCategory(c.id) : [];
        }
        grid.innerHTML = list.length
          ? list.map(p => Site.productCard(p, catMap)).join('')
          : `<p class="muted" style="grid-column:1/-1">—</p>`;
      }
      filters.onclick = async (e) => {
        const b = e.target.closest('.filter-btn');
        if (!b) return;
        currentCat = b.dataset.cat;
        filters.querySelectorAll('.filter-btn').forEach(x => x.classList.toggle('active', x===b));
        history.replaceState(null, '', `?cat=${currentCat}`);
        await renderList();
      };
      await renderList();
    },
    onLangChange(){ this.render(); }
  };

  const ProductDetailPage = {
    async init(){ await this.render(); },
    async render(){
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      const slug = params.get('slug');
      let p = null;
      if (id) p = await S.Products.get(id);
      if (!p && slug) p = await S.Products.getBySlug(slug);
      if (!p && id) p = await S.Products.getBySlug(id);
      const main = document.getElementById('gallery-main');
      const thumbs = document.getElementById('gallery-thumbs');
      const meta = document.getElementById('product-meta');
      if (!main || !thumbs || !meta) return;
      if (!p){ meta.innerHTML = `<p>${I.t('product.notFound')}</p>`; main.innerHTML = ''; thumbs.innerHTML = ''; return; }
      const cats = await S.Categories.list();
      const cat = cats.find(c => c.id === p.categoryId);
      const images = p.images && p.images.length ? p.images : [''];
      const name = I.productName(p.name);
      main.innerHTML = images[0] ? `<img src="${images[0]}" alt="${name}" />` : '';
      thumbs.innerHTML = images.map((img,i) =>
        `<div class="${i===0?'active':''}" data-i="${i}">${img ? `<img src="${img}" alt="" />` : ''}</div>`
      ).join('');
      thumbs.onclick = (e) => {
        const d = e.target.closest('div');
        if (!d) return;
        main.innerHTML = `<img src="${images[+d.dataset.i]}" alt="${name}" />`;
        thumbs.querySelectorAll('div').forEach(x=>x.classList.toggle('active', x===d));
      };
      const desc = I.productDesc(p.name, p.description || '');
      const specs = Object.entries(p.specs || {});
      meta.innerHTML = `
        <div class="tag">${cat ? I.categoryName(cat.name) : ''}</div>
        <h1>${name}</h1>
        <div class="price">${p.price || ''}</div>
        <p class="desc">${desc}</p>
        ${specs.length ? `
          <ul class="spec-list">
            ${specs.map(([k,v])=>`<li><span>${I.specKey(k)}</span><span>${v}</span></li>`).join('')}
          </ul>` : ''}
      `;
      if (typeof Site !== 'undefined' && Site.translateStaticTexts){
        Site.translateStaticTexts();
      }
      const form = document.getElementById('inquiry-form');
      if (form && !form._inited){
        form._inited = true;
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          try {
            await S.Inquiries.create({
              productId: p.id,
              productName: p.name,
              name: fd.get('name'),
              email: fd.get('email'),
              company: fd.get('company') || '',
              country: fd.get('country') || '',
              quantity: fd.get('quantity') || '',
              message: fd.get('message') || ''
            });
            alert(I.t('product.inquiry.success'));
            form.reset();
            if (typeof Site !== 'undefined' && Site.translateStaticTexts){
              Site.translateStaticTexts();
            }
          } catch(err){
            alert('Error: ' + (err.message || 'Failed'));
          }
        });
      }
    },
    onLangChange(){ this.render(); }
  };

  const AboutPage = {
    async init(){ await this.render(); },
    async render(){
      const img = document.getElementById('about-image');
      const body = document.getElementById('about-body');
      const intro = document.getElementById('about-intro');
      const s = await S.Site.get();
      if (img) img.src = s.aboutImage;
      if (intro) intro.textContent = s.aboutIntro;
      if (body) body.textContent = I.t('about.defaultBody') || s.aboutBody;
      document.title = `— ${s.brand}`;
    },
    onLangChange(){ this.render(); }
  };

  const ContactPage = {
    async init(){ await this.render(); },
    async render(){
      const s = await S.Site.get();
      const addr = document.getElementById('c-address'); if (addr) addr.textContent = s.contactAddress;
      const email = document.getElementById('c-email'); if (email) email.textContent = s.contactEmail;
      const phone = document.getElementById('c-phone'); if (phone) phone.textContent = s.contactPhone;
      const form = document.getElementById('contact-form');
      if (form && !form._inited){
        form._inited = true;
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          const nm = fd.get('name');
          const em = fd.get('email');
          const msg = fd.get('message');
          if (!nm || !em || !msg){
            alert(I.t('contact.required.name'));
            return;
          }
          try {
            await S.Inquiries.create({
              productId: '',
              productName: 'General Inquiry',
              name: nm,
              email: em,
              company: fd.get('company') || '',
              country: fd.get('country') || '',
              quantity: '',
              message: msg
            });
            alert(I.t('contact.form.success'));
            form.reset();
          } catch(err){
            alert('Error: ' + (err.message || 'Failed'));
          }
        });
      }
    },
    onLangChange(){ this.render(); }
  };

  window.Site = Site;
  window.HomePage = HomePage;
  window.ProductsPage = ProductsPage;
  window.ProductDetailPage = ProductDetailPage;
  window.AboutPage = AboutPage;
  window.ContactPage = ContactPage;
})();
