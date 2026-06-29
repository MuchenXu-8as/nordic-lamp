(function(){
  const TRANSLATIONS = {
    en: {
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.admin': 'Admin',
      'nav.whatsapp': 'WhatsApp',
      'brand.tag': 'Nordic Lighting · Considered Design',

      'home.eyebrow': 'Nordic Lighting · Since 2008',
      'home.heroTitle': 'Timeless Light, Considered Design.',
      'home.heroSub': 'A refined collection of handcrafted lamps designed for calm, modern interiors — where form follows feeling.',
      'home.explore': 'Explore the Collection',
      'home.ourStory': 'Our Story',
      'home.featured': 'Featured',
      'home.collection': 'Our Collection',
      'home.viewAll': 'View all',
      'home.about.title': 'Made with intention.',
      'home.about.readMore': 'Read more',
      'home.about.intro': 'We believe lighting is the quietest, most generous form of design. Every piece in our collection is considered — shaped by natural materials, soft light, and the rituals of everyday life.',
      'home.contact.title': 'Work with us.',
      'home.contact.wholesale': 'Wholesale',
      'home.contact.support': 'Support',
      'home.contact.showroom': 'Showroom',

      'products.hero.title': 'All Lighting',
      'products.hero.desc': 'A carefully curated collection of lamps — each piece designed for calm, considered interiors.',
      'products.all': 'All',
      'products.wholesale': 'For wholesale inquiries, please contact us at',

      'product.inquiry.title': 'Send an inquiry',
      'product.inquiry.desc': 'We welcome wholesale and custom orders. We will reply within 1-2 business days.',
      'product.inquiry.name': 'Your Name',
      'product.inquiry.email': 'Email',
      'product.inquiry.company': 'Company',
      'product.inquiry.country': 'Country',
      'product.inquiry.quantity': 'Quantity',
      'product.inquiry.message': 'Message',
      'product.inquiry.submit': 'Submit Inquiry',
      'product.inquiry.success': 'Thank you! Your inquiry has been sent. We will reply within 1-2 business days.',
      'product.inquiry.quantity.placeholder': 'e.g. 10 pcs',
      'product.inquiry.message.placeholder': 'Tell us about your project...',
      'product.notFound': 'Product not found.',

      'about.title': 'Quiet objects, considered lives.',
      'about.defaultIntro': 'We believe lighting is the quietest, most generous form of design.',
      'about.defaultBody': 'Founded in 2008 in Stockholm, Nordic Lamp began as a small studio of ceramicists and woodworkers. Today we partner with independent designers across Scandinavia, producing a quiet catalogue of lamps intended to age gracefully.',

      'contact.title': 'Get in touch.',
      'contact.info.title': 'Contact Information',
      'contact.wholesale.title': 'Wholesale',
      'contact.wholesale.desc': 'We supply to boutiques, designers and architects worldwide. Minimum order from 10 units.',
      'contact.wholesale.cta': 'Contact Wholesale',
      'contact.form.title': 'Send a Message',
      'contact.form.name': 'Your Name',
      'contact.form.email': 'Email',
      'contact.form.company': 'Company',
      'contact.form.country': 'Country',
      'contact.form.message': 'Message',
      'contact.form.submit': 'Send Message',
      'contact.form.success': 'Thank you! Your message has been sent.',
      'contact.form.message.placeholder': 'How can we help?',
      'contact.required.name': 'Please enter your name',
      'contact.required.email': 'Please enter your email',
      'contact.required.message': 'Please enter a message',

      'footer.shop': 'Shop',
      'footer.company': 'Company',
      'footer.connect': 'Connect',
      'footer.instagram': 'Instagram',
      'footer.facebook': 'Facebook',
      'footer.pinterest': 'Pinterest',

      'nav.about.eyebrow': 'About',
      'nav.contact.eyebrow': 'Contact',
      'home.contact.title': 'Work with us.',
      'home.featured': 'Featured',
    },
    ru: {
      'nav.home': 'Главная',
      'nav.products': 'Продукция',
      'nav.about': 'О нас',
      'nav.contact': 'Контакты',
      'nav.admin': 'Админ-панель',
      'nav.whatsapp': 'WhatsApp',
      'brand.tag': 'Nordic Lighting · Осмысленный дизайн',

      'home.eyebrow': 'Nordic Lighting · С 2008 года',
      'home.heroTitle': 'Вечный свет, осмысленный дизайн.',
      'home.heroSub': 'Изысканная коллекция ламп ручной работы для спокойных, современных интерьеров — где форма следует за ощущением.',
      'home.explore': 'Посмотреть коллекцию',
      'home.ourStory': 'Наша история',
      'home.featured': 'Рекомендуем',
      'home.collection': 'Наша коллекция',
      'home.viewAll': 'Все товары →',
      'home.about.title': 'Сделано с намерением.',
      'home.about.readMore': 'Читать больше',
      'home.about.intro': 'Мы верим, что свет — это самая тихая и щедрая форма дизайна. Каждая деталь в нашей коллекции продумана — создана из натуральных материалов, мягкого света и ритуалов повседневной жизни.',
      'home.contact.title': 'Сотрудничество.',
      'home.contact.wholesale': 'Опт',
      'home.contact.support': 'Поддержка',
      'home.contact.showroom': 'Шоурум',

      'products.hero.title': 'Все светильники',
      'products.hero.desc': 'Тщательно отобранная коллекция ламп — каждая создана для спокойных, продуманных интерьеров.',
      'products.all': 'Все',
      'products.wholesale': 'По оптовым вопросам свяжитесь с нами',

      'product.inquiry.title': 'Отправить запрос',
      'product.inquiry.desc': 'Мы рады оптовым и индивидуальным заказам. Отвечаем в течение 1-2 рабочих дней.',
      'product.inquiry.name': 'Ваше имя',
      'product.inquiry.email': 'Электронная почта',
      'product.inquiry.company': 'Компания',
      'product.inquiry.country': 'Страна',
      'product.inquiry.quantity': 'Количество',
      'product.inquiry.message': 'Сообщение',
      'product.inquiry.submit': 'Отправить запрос',
      'product.inquiry.success': 'Спасибо! Ваш запрос отправлен. Мы ответим в течение 1-2 рабочих дней.',
      'product.inquiry.quantity.placeholder': 'например, 10 шт',
      'product.inquiry.message.placeholder': 'Расскажите о вашем проекте...',
      'product.notFound': 'Продукт не найден.',

      'about.title': 'Тихие предметы, осмысленная жизнь.',
      'about.defaultIntro': 'Мы верим, что свет — это самая тихая и щедрая форма дизайна.',
      'about.defaultBody': 'Основана в Стокгольме в 2008 году. Nordic Lamp началась как маленькая студия керамистов и столяров. Сегодня мы сотрудничаем с независимыми дизайнерами по всему Скандинавии, создавая сдержанную коллекцию ламп, предназначенных для долгой службы.',

      'contact.title': 'Свяжитесь с нами.',
      'contact.info.title': 'Контактная информация',
      'contact.wholesale.title': 'Опт',
      'contact.wholesale.desc': 'Мы поставляем в бутики, дизайнерам и архитекторам по всему миру. Минимальный заказ — от 10 единиц.',
      'contact.wholesale.cta': 'Связаться по опту',
      'contact.form.title': 'Отправить сообщение',
      'contact.form.name': 'Ваше имя',
      'contact.form.email': 'Электронная почта',
      'contact.form.company': 'Компания',
      'contact.form.country': 'Страна',
      'contact.form.message': 'Сообщение',
      'contact.form.submit': 'Отправить сообщение',
      'contact.form.success': 'Спасибо! Ваше сообщение отправлено.',
      'contact.form.message.placeholder': 'Как мы можем помочь?',
      'contact.required.name': 'Пожалуйста, введите имя',
      'contact.required.email': 'Пожалуйста, введите электронную почту',
      'contact.required.message': 'Пожалуйста, введите сообщение',

      'footer.shop': 'Магазин',
      'footer.company': 'Компания',
      'footer.connect': 'Мы в соцсетях',
      'footer.instagram': 'Instagram',
      'footer.facebook': 'Facebook',
      'footer.pinterest': 'Pinterest',

      'nav.about.eyebrow': 'О нас',
      'nav.contact.eyebrow': 'Контакты',
      'home.contact.title': 'Сотрудничество.',
      'home.featured': 'Рекомендуем',
    }
  };

  const RUSSIAN_CATEGORIES = {
    'pendant': 'Подвесные',
    'table-lamp': 'Настольные',
    'floor-lamp': 'Напольные',
    'wall-sconce': 'Настенные'
  };
  const RUSSIAN_PRODUCTS = {
    'Mora Pendant': 'Подвесная Mora',
    'Linen Shade Table Lamp': 'Настольная лампа с льняным абажуром',
    'Vasa Floor Lamp': 'Напольная лампа Vasa',
    'Söder Sconce': 'Настенный светильник Söder',
    'Granite Table Lamp': 'Настольная лампа Granite',
    'Birch Pendant': 'Подвесная Birch',
    'Malmö Floor Lamp': 'Напольная Malmö',
    'Kivik Sconce': 'Настенный Kivik',
    'Tiveden Pendant': 'Подвесная Tiveden',
    'Ljus Table Lamp': 'Настольная лампа Ljus',
    'Skog Floor Lamp': 'Напольная лампа Skog',
    'Strand Sconce': 'Настенный Strand'
  };
  const RUSSIAN_DESCRIPTIONS = {
    'Mora Pendant': 'Подвесной светильник из выдувного опалового стекла с латунным основанием. Шелковый шнур регулируется по высоте.',
    'Linen Shade Table Lamp': 'Тумба из цельного дуба с льняным абажуром. Регулируемая яркость.',
    'Vasa Floor Lamp': 'Минималистичный напольный светильник в матовом черном цвете с хлопковым абажуром.',
    'Söder Sconce': 'Керамический настенный светильник с рифленой глазурью. Возможна проводная или штепсельная установка.',
    'Granite Table Lamp': 'Выточена из цельного куска шведского гранита. Каждый экземпляр уникален.',
    'Birch Pendant': 'Подвесная лампа из березового шпона с теплым пробковым внутренним слоем и хлопковым шнуром.',
    'Malmö Floor Lamp': 'Треугольный напольник из цельного ясеня с бумажным абажуром.',
    'Kivik Sconce': 'Настенный светильник из латуни с матовым стеклянным рассеивателем.',
    'Tiveden Pendant': 'Подвесной светильник из муранского стекла с медной арматурой. Регулируется по высоте.',
    'Ljus Table Lamp': 'Компактная настольная лампа из фарфора с хлопковым абажуром.',
    'Skog Floor Lamp': 'Напольный светильник из дуба с бумажным абажуром в японском стиле.',
    'Strand Sconce': 'Настенный светильник с двумя стеклянными колпачками и латунным крепежом.'
  };
  const RUSSIAN_SPECS = {
    'Material': 'Материал',
    'Finish': 'Отделка',
    'Wattage': 'Мощность',
    'Warranty': 'Гарантия',
    'Height': 'Высота',
    'Diameter': 'Диаметр',
    'Projection': 'Вынос'
  };

  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'nl_lang';

  const I18n = {
    current: DEFAULT_LANG,

    init(){
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('[I18n] init() called, saved from localStorage =', JSON.stringify(saved));
      this.current = (saved === 'ru' || saved === 'en') ? saved : DEFAULT_LANG;
      console.log('[I18n] init() resolved current language =', this.current, '(default:', DEFAULT_LANG, ')');
      document.documentElement.lang = this.current === 'ru' ? 'ru' : 'en';
      console.log('[I18n] init() set <html lang> to', document.documentElement.lang);
      this.applyToStaticTexts();
      console.log('[I18n] init() complete, language =', this.current);
    },

    setLang(lang){
      console.log('[I18n] setLang() called with target =', lang, ', current =', this.current);
      if (lang !== 'en' && lang !== 'ru') {
        console.warn('[I18n] setLang() rejected invalid language:', lang);
        return;
      }
      this.current = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      console.log('[I18n] setLang() persisted "' + lang + '" to localStorage key "' + STORAGE_KEY + '", reading back =', localStorage.getItem(STORAGE_KEY));
      document.documentElement.lang = lang === 'ru' ? 'ru' : 'en';
      console.log('[I18n] setLang() set <html lang> to', document.documentElement.lang);
      this.applyToStaticTexts();
      console.log('[I18n] setLang() applyToStaticTexts() done');
      if (typeof window.Site !== 'undefined' && window.Site.onLangChange){
        console.log('[I18n] setLang() dispatching Site.onLangChange');
        window.Site.onLangChange(lang);
      }
      if (typeof window.ProductDetailPage !== 'undefined' && window.ProductDetailPage.onLangChange){
        console.log('[I18n] setLang() dispatching ProductDetailPage.onLangChange');
        window.ProductDetailPage.onLangChange(lang);
      }
      if (typeof window.HomePage !== 'undefined' && window.HomePage.onLangChange){
        console.log('[I18n] setLang() dispatching HomePage.onLangChange');
        window.HomePage.onLangChange(lang);
      }
      if (typeof window.ProductsPage !== 'undefined' && window.ProductsPage.onLangChange){
        console.log('[I18n] setLang() dispatching ProductsPage.onLangChange');
        window.ProductsPage.onLangChange(lang);
      }
      console.log('[I18n] setLang() complete →', lang);
    },

    t(key){
      const dict = TRANSLATIONS[this.current] || TRANSLATIONS.en;
      return dict[key] || TRANSLATIONS.en[key] || key;
    },

    // Category name translation
    categoryName(engName){
      if (this.current === 'ru'){
        const slug = (engName || '').toLowerCase().replace(/[^a-z]+/g, '-');
        return RUSSIAN_CATEGORIES[slug] || engName;
      }
      return engName;
    },

    // Product name translation
    productName(engName){
      if (this.current === 'ru') return RUSSIAN_PRODUCTS[engName] || engName;
      return engName;
    },

    // Product description translation
    productDesc(engName, origDesc){
      if (this.current === 'ru') return RUSSIAN_DESCRIPTIONS[engName] || origDesc;
      return origDesc;
    },

    // Spec key translation
    specKey(key){
      if (this.current === 'ru') return RUSSIAN_SPECS[key] || key;
      return key;
    },

    applyToStaticTexts(){
      console.log('[I18n] applyToStaticTexts() running, current language =', this.current);
      document.documentElement.lang = this.current === 'ru' ? 'ru' : 'en';
      const brandTag = this.t('brand.tag');
      document.title = brandTag ? `${brandTag.split('·')[0].trim()} — ${brandTag}` : document.title;
      console.log('[I18n] applyToStaticTexts() updated document.title =', document.title);

      const h1 = document.querySelector('h1');
      if (h1){
        const key = this._guessH1Key(h1.textContent);
        console.log('[I18n] applyToStaticTexts() guessed h1 key =', key, ', applying =', key ? this.t(key) : '(none)');
        if (key) h1.textContent = this.t(key);
      }

      const els = document.querySelectorAll('[data-text]');
      let updated = 0;
      els.forEach(el => {
        const key = el.dataset.text;
        const translated = this.t(key);
        if (translated && translated !== key){
          el.textContent = translated;
          updated++;
        }
      });
      console.log('[I18n] applyToStaticTexts() translated', updated, 'elements with [data-text]');
    },

    _guessH1Key(text){
      if (!text) return null;
      const s = text.trim().toLowerCase();
      if (s.includes('timeless') || s.includes('вечный')) return 'home.heroTitle';
      if (s.includes('all lighting') || s.includes('все светильники')) return 'products.hero.title';
      if (s.includes('quiet object') || s.includes('тихие предметы')) return 'about.title';
      if (s.includes('get in touch') || s.includes('свяжитесь')) return 'contact.title';
      return null;
    },

    // Build a language switcher element
    buildSwitcher(container){
      if (!container) return;
      container.innerHTML = `
        <div class="lang-switch" role="group" aria-label="Language">
          <button type="button" class="lang-btn ${this.current==='en'?'active':''}" data-lang="en">EN</button>
          <button type="button" class="lang-btn ${this.current==='ru'?'active':''}" data-lang="ru">RU</button>
        </div>
      `;
      container.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lng = btn.dataset.lang;
          this.setLang(lng);
          this.buildSwitcher(container);
        });
      });
    }
  };

  window.NLI18n = I18n;
  window.I18n = I18n;
})();
