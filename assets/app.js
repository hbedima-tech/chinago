// State & Storage keys
const LS_KEYS = {
  SETTINGS: 'cd_settings_v1',
  USERS: 'cd_users_v1',
  CURRENT_USER: 'cd_current_user_v1',
  ORDERS: 'cd_orders_v1',
  REVIEWS: 'cd_reviews_v1',
  CART: 'cd_cart_v1'
};

let state = {
  settings: JSON.parse(localStorage.getItem(LS_KEYS.SETTINGS)) || { ...DEFAULT_SETTINGS },
  users: JSON.parse(localStorage.getItem(LS_KEYS.USERS)) || [
    {
      id: 'admin-1',
      name: 'Власник ChinaDrop',
      email: 'admin',
      password: 'admin',
      role: 'admin',
      telegram: '@chinadrop_owner',
      novaPoshta: 'м. Вінниця, Відділення №1'
    },
    {
      id: 'user-demo',
      name: 'Артем Коваль',
      email: 'user@example.com',
      password: 'user',
      role: 'buyer',
      telegram: '@artem_ua',
      novaPoshta: 'м. Київ, Відділення №45'
    }
  ],
  currentUser: JSON.parse(localStorage.getItem(LS_KEYS.CURRENT_USER)) || null,
  orders: JSON.parse(localStorage.getItem(LS_KEYS.ORDERS)) || [
    {
      id: 'ORD-261101',
      date: '20.11.2026 14:22',
      customerName: 'Артем Коваль',
      customerEmail: 'user@example.com',
      telegram: '@artem_ua',
      novaPoshta: 'м. Київ, Відділення №45',
      shippingType: 'air',
      items: [
        { title: 'Rick Owens DRKSHDW Ramones Low Canvas', size: '43 EU', yuan: 340, weight: 1.4, qty: 1 }
      ],
      totalYuan: 340,
      totalWeight: 1.4,
      deliveryUah: 1030,
      commissionUah: 199,
      totalUah: 3218,
      status: 'На складі в Гуанчжоу (Фото готові)'
    }
  ],
  reviews: JSON.parse(localStorage.getItem(LS_KEYS.REVIEWS)) || [...INITIAL_REVIEWS],
  cart: JSON.parse(localStorage.getItem(LS_KEYS.CART)) || [],
  shippingType: 'air',
  selectedCategory: 'Усі',
  selectedSizes: {}
};

function saveState() {
  localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(state.settings));
  localStorage.setItem(LS_KEYS.USERS, JSON.stringify(state.users));
  localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
  localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(state.orders));
  localStorage.setItem(LS_KEYS.REVIEWS, JSON.stringify(state.reviews));
  localStorage.setItem(LS_KEYS.CART, JSON.stringify(state.cart));
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3200);
}

// Price calculation engine
function calculateItemBreakdown(yuan, weight, shippingType = state.shippingType, includePhoto = false) {
  const s = state.settings;
  const baseUah = yuan * s.yuanRateUah;
  const commissionUah = baseUah * (s.commissionPercent / 100);
  const ratePerKg = shippingType === 'air' ? s.airUsdPerKg : s.seaUsdPerKg;
  const deliveryUah = weight * ratePerKg * s.usdRateUah;
  const photoUah = includePhoto ? s.photoReportUsd * s.usdRateUah : 0;
  const totalUah = Math.round(baseUah + commissionUah + deliveryUah + photoUah);

  return {
    baseUah: Math.round(baseUah),
    commissionUah: Math.round(commissionUah),
    deliveryUah: Math.round(deliveryUah),
    photoUah: Math.round(photoUah),
    totalUah
  };
}

// Navigation
function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove('hidden');

  const navBtn = document.querySelector(`.nav-btn[data-view="${viewName}"]`);
  if (navBtn) navBtn.classList.add('active');

  if (viewName === 'admin') renderAdminPanel();
  if (viewName === 'profile') renderProfile();
  if (viewName === 'reviews') renderReviews();
}

function setShippingType(type) {
  state.shippingType = type;
  document.getElementById('shipAirBtn').classList.toggle('active', type === 'air');
  document.getElementById('shipSeaBtn').classList.toggle('active', type === 'sea');
  renderHeroRates();
  renderCatalog();
  updateCustomCalc();
}

function renderHeroRates() {
  const s = state.settings;
  const box = document.getElementById('heroRatesBox');
  box.innerHTML = `
    <div style="font-weight:800; margin-bottom:6px; color:#fff;">Актуальні тарифи розрахунку:</div>
    <div>💱 Курс викупу: <b>${s.yuanRateUah} ₴ / 1 ¥</b></div>
    <div>✈️ Meest China Авіа: <b>$${s.airUsdPerKg}/кг</b> (9–12 днів)</div>
    <div>🚢 Meest China Море: <b>$${s.seaUsdPerKg}/кг</b> (35–45 днів)</div>
    <div style="margin-top:4px; color:#6ee7b7; font-size:12px;">Комісія сервісу (${s.commissionPercent}%) вже закладена у ціну</div>
  `;
}

// Catalog
function initCategories() {
  const cats = ['Усі', 'Взуття', 'Штани', 'Кофти', 'Футболки', 'Прикраси', 'Аксесуари', 'Чохли'];
  const container = document.getElementById('categoryPills');
  container.innerHTML = cats.map(c => `
    <button class="cat-pill ${state.selectedCategory === c ? 'active' : ''}" onclick="selectCategory('${c}')">${c}</button>
  `).join('');
}

function selectCategory(cat) {
  state.selectedCategory = cat;
  initCategories();
  renderCatalog();
}

function getFallbackSvg(title, category) {
  const safeTitle = encodeURIComponent(title.slice(0, 28));
  const safeCat = encodeURIComponent(category);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><rect width="600" height="420" fill="%23181b24"/><text x="50%" y="45%" fill="%23f97316" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">${safeCat}</text><text x="50%" y="55%" fill="%23e5e7eb" font-family="sans-serif" font-size="16" text-anchor="middle">${safeTitle}</text></svg>`;
}

function renderCatalog() {
  const grid = document.getElementById('productsGrid');
  const platform = document.getElementById('platformFilter').value;
  const query = document.getElementById('searchInput').value.trim().toLowerCase();

  const filtered = PRODUCTS_DATA.filter(item => {
    const matchCat = state.selectedCategory === 'Усі' || item.category === state.selectedCategory;
    const matchPlat = platform === 'all' || item.platform === platform;
    const matchQuery = !query || item.title.toLowerCase().includes(query) || item.batch.toLowerCase().includes(query);
    return matchCat && matchPlat && matchQuery;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="card-panel" style="grid-column:1/-1; text-align:center;">Нічого не знайдено. Спробуйте змінити фільтр або скористайтеся вкладкою <b>«Викуп за посиланням»</b>.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const chosenSize = state.selectedSizes[item.id] || item.sizes[0];
    const calc = calculateItemBreakdown(item.yuan, item.weight);
    const fallback = getFallbackSvg(item.title, item.category);

    return `
      <article class="product-card">
        <div class="product-img-wrap" onclick="openProductModal('${item.id}')">
          <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'" />
          <span class="platform-tag ${item.platform}">${item.platform}</span>
          <span class="batch-tag">${item.batch}</span>
        </div>
        <div class="product-body">
          <div class="product-cat">${item.category} • ~${item.weight} кг</div>
          <div class="product-title" onclick="openProductModal('${item.id}')">${item.title}</div>

          <div class="size-row">
            ${item.sizes.map(sz => `
              <button class="size-chip ${chosenSize === sz ? 'active' : ''}" onclick="pickCardSize('${item.id}', '${sz}')">${sz}</button>
            `).join('')}
          </div>

          <div class="price-box">
            <div>
              <div class="price-uah">${calc.totalUah.toLocaleString('uk-UA')} ₴</div>
              <div class="price-meta">¥${item.yuan} • під ключ (${state.shippingType === 'air' ? 'Авіа' : 'Море'})</div>
            </div>
            <button class="btn-primary" onclick="addCatalogItemToCart('${item.id}')">+ У кошик</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function pickCardSize(productId, size) {
  state.selectedSizes[productId] = size;
  renderCatalog();
}

function openProductModal(productId) {
  const item = PRODUCTS_DATA.find(p => p.id === productId);
  if (!item) return;
  const chosenSize = state.selectedSizes[item.id] || item.sizes[0];
  const calc = calculateItemBreakdown(item.yuan, item.weight);
  const fallback = getFallbackSvg(item.title, item.category);

  const box = document.getElementById('productModalContent');
  box.innerHTML = `
    <div class="modal-top">
      <span class="badge-soft">${item.platform} • ${item.batch}</span>
      <button class="close-btn" onclick="document.getElementById('productModal').classList.add('hidden')">✕</button>
    </div>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:20px;">
      <img src="${item.image}" alt="${item.title}" style="width:100%; height:290px; object-fit:cover; border-radius:12px;" onerror="this.onerror=null;this.src='${fallback}'" />
      <div style="display:flex; flex-direction:column; gap:12px;">
        <h3>${item.title}</h3>
        <p class="muted" style="font-size:13px;">${item.description}</p>
        <div>
          <div class="small muted" style="margin-bottom:6px;">Оберіть розмір / модель:</div>
          <div class="size-row">
            ${item.sizes.map(sz => `
              <button class="size-chip ${chosenSize === sz ? 'active' : ''}" onclick="pickCardSize('${item.id}', '${sz}'); openProductModal('${item.id}')">${sz}</button>
            `).join('')}
          </div>
        </div>
        <div class="calc-summary">
          <div>Викуп лоту в Китаї (¥${item.yuan}): <b>${calc.baseUah} ₴</b></div>
          <div>Доставка Meest China (${item.weight} кг, ${state.shippingType === 'air' ? 'Авіа' : 'Море'}): <b>${calc.deliveryUah} ₴</b></div>
          <div>Комісія сервісу (${state.settings.commissionPercent}%): <b>${calc.commissionUah} ₴</b></div>
          <div style="border-top:1px solid var(--border); padding-top:6px; font-size:16px;">Разом під ключ: <b>${calc.totalUah.toLocaleString('uk-UA')} ₴</b></div>
        </div>
        <div style="display:flex; gap:10px; margin-top:auto;">
          <button class="btn-primary w-full" onclick="addCatalogItemToCart('${item.id}'); document.getElementById('productModal').classList.add('hidden')">Додати у кошик (${chosenSize})</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('productModal').classList.remove('hidden');
}

// Custom link calculator
function updateCustomCalc() {
  const yuan = parseFloat(document.getElementById('customYuan')?.value) || 0;
  const weight = parseFloat(document.getElementById('customWeight')?.value) || 0;
  const photo = document.getElementById('customPhotoCheck')?.checked || false;
  const calc = calculateItemBreakdown(yuan, weight, state.shippingType, photo);

  const box = document.getElementById('customCalcBox');
  if (!box) return;
  box.innerHTML = `
    <div>Вартість товару в Китаї: <b>${calc.baseUah} ₴</b> (¥${yuan})</div>
    <div>Міжнародна доставка (${state.shippingType === 'air' ? 'Авіа' : 'Море'}, ${weight} кг): <b>${calc.deliveryUah} ₴</b></div>
    <div>Комісія сервісу (${state.settings.commissionPercent}%): <b>${calc.commissionUah} ₴</b></div>
    ${photo ? `<div>Фотозвіт зі складу в Гуанчжоу: <b>${calc.photoUah} ₴</b></div>` : ''}
    <div style="font-size:16px; color:#fff; border-top:1px solid var(--border); padding-top:6px;">
      Орієнтовна ціна під ключ: <b>${calc.totalUah.toLocaleString('uk-UA')} ₴</b>
    </div>
  `;
}

function addCustomOrderToCart(e) {
  e.preventDefault();
  const url = document.getElementById('customUrl').value.trim();
  const title = document.getElementById('customTitle').value.trim();
  const size = document.getElementById('customSize').value.trim();
  const yuan = parseFloat(document.getElementById('customYuan').value);
  const weight = parseFloat(document.getElementById('customWeight').value);
  const includePhoto = document.getElementById('customPhotoCheck').checked;

  state.cart.push({
    uid: 'custom-' + Date.now(),
    title: `[За посиланням] ${title}`,
    size,
    yuan,
    weight,
    includePhoto,
    sourceUrl: url,
    qty: 1
  });
  saveState();
  updateCartBadge();
  showToast('Індивідуальний лот додано в кошик!');
  e.target.reset();
  updateCustomCalc();
}

// Cart & Checkout
function addCatalogItemToCart(productId) {
  const item = PRODUCTS_DATA.find(p => p.id === productId);
  if (!item) return;
  const size = state.selectedSizes[item.id] || item.sizes[0];
  const existing = state.cart.find(c => c.productId === item.id && c.size === size);

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      uid: item.id + '-' + size,
      productId: item.id,
      title: item.title,
      size,
      yuan: item.yuan,
      weight: item.weight,
      includePhoto: true,
      sourceUrl: item.sourceUrl,
      qty: 1
    });
  }
  saveState();
  updateCartBadge();
  showToast(`Додано: ${item.title} (${size})`);
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

function openCart() {
  renderCart();
  document.getElementById('cartDrawer').classList.remove('hidden');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.add('hidden');
}

function removeFromCart(uid) {
  state.cart = state.cart.filter(i => i.uid !== uid);
  saveState();
  updateCartBadge();
  renderCart();
}

function renderCart() {
  const list = document.getElementById('cartItemsList');
  const footer = document.getElementById('cartFooter');

  if (!state.cart.length) {
    list.innerHTML = `<div class="muted" style="text-align:center; margin-top:40px;">Кошик порожній. Оберіть товари у каталозі або вставте посилання.</div>`;
    footer.innerHTML = '';
    return;
  }

  let totalUah = 0;
  let totalCommission = 0;
  let totalDelivery = 0;
  let totalYuan = 0;
  let totalWeight = 0;

  list.innerHTML = state.cart.map(item => {
    const calc = calculateItemBreakdown(item.yuan * item.qty, item.weight * item.qty, state.shippingType, item.includePhoto);
    totalUah += calc.totalUah;
    totalCommission += calc.commissionUah;
    totalDelivery += calc.deliveryUah;
    totalYuan += item.yuan * item.qty;
    totalWeight += item.weight * item.qty;

    return `
      <div class="cart-item">
        <div>
          <div style="font-weight:700; font-size:13px;">${item.title}</div>
          <div class="small muted">Розмір: ${item.size} • К-сть: ${item.qty} • Вага: ${(item.weight * item.qty).toFixed(2)} кг</div>
          <div style="font-weight:800; color:var(--accent); margin-top:4px;">${calc.totalUah.toLocaleString('uk-UA')} ₴</div>
        </div>
        <button class="btn-danger" onclick="removeFromCart('${item.uid}')">Видалити</button>
      </div>
    `;
  }).join('');

  const u = state.currentUser;
  footer.innerHTML = `
    <div style="font-size:13px; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between;"><span>Загальна вага (${state.shippingType === 'air' ? 'Авіа' : 'Море'}):</span><b>${totalWeight.toFixed(2)} кг</b></div>
      <div style="display:flex; justify-content:space-between; font-size:16px; margin-top:4px;"><span>До сплати під ключ:</span><b>${totalUah.toLocaleString('uk-UA')} ₴</b></div>
    </div>
    <form class="form-stack" onsubmit="checkoutOrder(event, ${totalYuan}, ${totalWeight.toFixed(2)}, ${totalDelivery}, ${totalCommission}, ${totalUah})">
      <input type="text" id="chkName" required placeholder="Ім'я та Прізвище" value="${u ? u.name : ''}" />
      <input type="text" id="chkTelegram" required placeholder="Ваш Telegram (@username для фотозвіту)" value="${u ? u.telegram : ''}" />
      <input type="text" id="chkNovaPoshta" required placeholder="Місто та відділення Нової Пошти" value="${u ? (u.novaPoshta || '') : ''}" />
      <button type="submit" class="btn-primary w-full">Оформити замовлення</button>
    </form>
  `;
}

function checkoutOrder(e, totalYuan, totalWeight, deliveryUah, commissionUah, totalUah) {
  e.preventDefault();
  const order = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    customerName: document.getElementById('chkName').value.trim(),
    customerEmail: state.currentUser ? state.currentUser.email : 'guest',
    telegram: document.getElementById('chkTelegram').value.trim(),
    novaPoshta: document.getElementById('chkNovaPoshta').value.trim(),
    shippingType: state.shippingType,
    items: [...state.cart],
    totalYuan,
    totalWeight,
    deliveryUah,
    commissionUah,
    totalUah,
    status: 'Нове замовлення (Очікує оплату)'
  };

  state.orders.unshift(order);
  state.cart = [];
  saveState();
  updateCartBadge();
  closeCart();
  showToast(`Замовлення ${order.id} створено! Перевірте історію в кабінеті.`);
  if (state.currentUser) {
    switchView(state.currentUser.role === 'admin' ? 'admin' : 'profile');
  }
}

// Reviews (Persistent in localStorage)
function initReviewProductsDropdown() {
  const sel = document.getElementById('revProduct');
  sel.innerHTML = PRODUCTS_DATA.map(p => `<option value="${p.title}">${p.title}</option>`).join('') +
    `<option value="Індивідуальний викуп за посиланням">Індивідуальний викуп за посиланням</option>`;
}

function renderReviews() {
  document.getElementById('navReviewsCount').textContent = state.reviews.length;
  const list = document.getElementById('reviewsList');

  if (!state.reviews.length) {
    list.innerHTML = `<div class="card-panel muted">Поки що немає відгуків. Будьте першим!</div>`;
    return;
  }

  const avg = (state.reviews.reduce((s, r) => s + Number(r.rating), 0) / state.reviews.length).toFixed(1);
  document.getElementById('avgRatingBadge').textContent = `Рейтинг: ${avg} ★ (${state.reviews.length})`;

  list.innerHTML = state.reviews.map(r => `
    <div class="review-card">
      <div class="review-top">
        <div>
          <strong>${r.author}</strong> • <span class="small muted">${r.date}</span>
          <div class="small" style="color:var(--accent); font-weight:600;">Лот: ${r.productTitle}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${'⭐'.repeat(r.rating)}</span>
          ${state.currentUser && state.currentUser.role === 'admin' ? `<button class="btn-danger" onclick="deleteReview('${r.id}')">Видалити</button>` : ''}
        </div>
      </div>
      <p style="font-size:14px; color:#e5e7eb; margin-top:6px;">${r.text}</p>
    </div>
  `).join('');
}

function submitReview(e) {
  e.preventDefault();
  const rev = {
    id: 'rev-' + Date.now(),
    author: document.getElementById('revAuthor').value.trim(),
    productTitle: document.getElementById('revProduct').value,
    rating: Number(document.getElementById('revRating').value),
    text: document.getElementById('revText').value.trim(),
    date: new Date().toLocaleDateString('uk-UA')
  };
  state.reviews.unshift(rev);
  saveState();
  renderReviews();
  e.target.reset();
  if (state.currentUser) document.getElementById('revAuthor').value = state.currentUser.name;
  showToast('Дякуємо! Ваш відгук збережено.');
}

function deleteReview(id) {
  state.reviews = state.reviews.filter(r => r.id !== id);
  saveState();
  renderReviews();
  showToast('Відгук видалено');
}

// Accounts & Auth
function renderAuthHeader() {
  const area = document.getElementById('authArea');
  const adminBtn = document.getElementById('navAdminBtn');

  if (!state.currentUser) {
    adminBtn.classList.add('hidden');
    area.innerHTML = `<button class="btn-primary" onclick="openAuthModal()">Увійти / Акаунт</button>`;
    return;
  }

  if (state.currentUser.role === 'admin') {
    adminBtn.classList.remove('hidden');
  } else {
    adminBtn.classList.add('hidden');
  }

  area.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="btn-outline" onclick="switchView('profile')">👤 ${state.currentUser.name}</button>
      <button class="btn-danger" onclick="logoutUser()" title="Вийти">Вийти</button>
    </div>
  `;
}

function openAuthModal() {
  document.getElementById('authModal').classList.remove('hidden');
}
function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function switchAuthTab(tab) {
  document.getElementById('tabLoginBtn').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegisterBtn').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  document.getElementById('authModalTitle').textContent = tab === 'login' ? 'Вхід в акаунт' : 'Реєстрація покупця';
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;

  const user = state.users.find(u => u.email.toLowerCase() === email && u.password === pass);
  if (!user) {
    alert('Невірний email/логін або пароль! Спробуйте демо-вхід нижче або зареєструйтеся.');
    return;
  }

  state.currentUser = user;
  saveState();
  renderAuthHeader();
  closeAuthModal();
  showToast(`Вітаємо, ${user.name}!`);
  if (user.role === 'admin') switchView('admin');
}

function quickDemoLogin(type) {
  const user = state.users.find(u => u.role === type);
  if (!user) return;
  state.currentUser = user;
  saveState();
  renderAuthHeader();
  closeAuthModal();
  showToast(`Вхід виконано: ${user.name}`);
  if (type === 'admin') switchView('admin');
}

function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  if (state.users.some(u => u.email.toLowerCase() === email)) {
    alert('Акаунт з таким Email вже існує!');
    return;
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name: document.getElementById('regName').value.trim(),
    email,
    telegram: document.getElementById('regTelegram').value.trim(),
    novaPoshta: document.getElementById('regNovaPoshta').value.trim(),
    password: document.getElementById('regPass').value,
    role: 'buyer'
  };

  state.users.push(newUser);
  state.currentUser = newUser;
  saveState();
  renderAuthHeader();
  closeAuthModal();
  showToast('Акаунт успішно створено!');
  switchView('profile');
}

function logoutUser() {
  state.currentUser = null;
  saveState();
  renderAuthHeader();
  switchView('catalog');
  showToast('Ви вийшли з акаунту');
}

function renderProfile() {
  const box = document.getElementById('profileContainer');
  const u = state.currentUser;
  if (!u) {
    box.innerHTML = `<p>Будь ласка, увійдіть в акаунт.</p>`;
    return;
  }

  const myOrders = state.orders.filter(o => o.customerEmail === u.email || o.telegram === u.telegram);

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
      <div>
        <h2>Особистий кабінет: ${u.name}</h2>
        <div class="muted small">Email: ${u.email} • Telegram: ${u.telegram} • Роль: ${u.role === 'admin' ? 'Власник / Адміністратор' : 'Покупець'}</div>
      </div>
      ${u.role === 'admin' ? `<button class="btn-primary" onclick="switchView('admin')">Перейти в адмінку замовлень →</button>` : ''}
    </div>

    <h3 style="margin-bottom:12px;">Ваша історія замовлень (${myOrders.length})</h3>
    ${myOrders.length ? `
      <div class="orders-admin-list">
        ${myOrders.map(o => `
          <div class="order-row">
            <div class="order-row-head">
              <strong>${o.id} від ${o.date}</strong>
              <span class="badge-soft">${o.status}</span>
            </div>
            <div class="small">${o.items.map(i => `${i.title} (${i.size}) × ${i.qty}`).join(', ')}</div>
            <div class="small muted">Доставка: ${o.novaPoshta} (${o.shippingType === 'air' ? 'Авіа' : 'Море'}, ${o.totalWeight} кг) • Сума: <b>${o.totalUah.toLocaleString('uk-UA')} ₴</b></div>
          </div>
        `).join('')}
      </div>
    ` : `<p class="muted">У вас ще немає оформлених замовлень.</p>`}
  `;
}

// Admin Panel
function renderAdminPanel() {
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    switchView('catalog');
    return;
  }

  const s = state.settings;
  document.getElementById('admCommission').value = s.commissionPercent;
  document.getElementById('admYuanRate').value = s.yuanRateUah;
  document.getElementById('admUsdRate').value = s.usdRateUah;
  document.getElementById('admAirUsd').value = s.airUsdPerKg;
  document.getElementById('admSeaUsd').value = s.seaUsdPerKg;

  const totalTurnover = state.orders.reduce((sum, o) => sum + Number(o.totalUah), 0);
  const totalProfit = state.orders.reduce((sum, o) => sum + Number(o.commissionUah), 0);

  document.getElementById('adminStatsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Усього замовлень</div>
      <div class="stat-val">${state.orders.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Загальний оборот</div>
      <div class="stat-val">${totalTurnover.toLocaleString('uk-UA')} ₴</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ваш чистий прибуток (комісія)</div>
      <div class="stat-val" style="color:var(--green);">+${totalProfit.toLocaleString('uk-UA')} ₴</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Зареєстрованих користувачів</div>
      <div class="stat-val">${state.users.length}</div>
    </div>
  `;

  const ordersBox = document.getElementById('adminOrdersList');
  if (!state.orders.length) {
    ordersBox.innerHTML = `<div class="muted">Замовлень ще немає.</div>`;
    return;
  }

  const statuses = [
    'Нове замовлення (Очікує оплату)',
    'Оплачено — викуповується на Pinduoduo/Taobao',
    'На складі в Гуанчжоу (Фото готові)',
    'Відправлено Meest China в Україну',
    'Прибуло на Нову Пошту / Виконано'
  ];

  ordersBox.innerHTML = state.orders.map(o => `
    <div class="order-row">
      <div class="order-row-head">
        <div>
          <strong>${o.id}</strong> • <span class="small muted">${o.date}</span>
          <div class="small">Клієнт: <b>${o.customerName}</b> (${o.telegram}) • НП: ${o.novaPoshta}</div>
        </div>
        <select onchange="updateOrderStatus('${o.id}', this.value)">
          ${statuses.map(st => `<option value="${st}" ${o.status === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>
      </div>
      <div style="font-size:13px; background:var(--surface); padding:8px 10px; border-radius:8px;">
        ${o.items.map(i => `• ${i.title} [<b>${i.size}</b>] — ¥${i.yuan} × ${i.qty}`).join('<br>')}
      </div>
      <div style="display:flex; justify-content:space-between; font-size:12px; flex-wrap:wrap; gap:8px;">
        <span>Закупівля: <b>¥${o.totalYuan}</b> | Вага: <b>${o.totalWeight} кг</b> (${o.shippingType === 'air' ? 'Авіа' : 'Море'})</span>
        <span>Сума клієнта: <b>${o.totalUah.toLocaleString('uk-UA')} ₴</b> | <b style="color:var(--green);">Ваш дохід: +${o.commissionUah} ₴</b></span>
      </div>
    </div>
  `).join('');
}

function updateOrderStatus(orderId, newStatus) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveState();
    showToast(`Статус ${orderId} оновлено`);
  }
}

function saveAdminSettings(e) {
  e.preventDefault();
  state.settings.commissionPercent = parseFloat(document.getElementById('admCommission').value);
  state.settings.yuanRateUah = parseFloat(document.getElementById('admYuanRate').value);
  state.settings.usdRateUah = parseFloat(document.getElementById('admUsdRate').value);
  state.settings.airUsdPerKg = parseFloat(document.getElementById('admAirUsd').value);
  state.settings.seaUsdPerKg = parseFloat(document.getElementById('admSeaUsd').value);
  saveState();
  renderHeroRates();
  renderCatalog();
  updateCustomCalc();
  renderAdminPanel();
  showToast('Тарифи та комісію збережено!');
}

function exportOrdersCSV() {
  const rows = [['ID', 'Дата', 'Клієнт', 'Telegram', 'Нова Пошта', 'Сума (грн)', 'Прибуток (грн)', 'Статус']];
  state.orders.forEach(o => {
    rows.push([o.id, o.date, o.customerName, o.telegram, o.novaPoshta, o.totalUah, o.commissionUah, o.status]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'chinadrop_orders.csv';
  link.click();
}

function closeModalOnBackdrop(e, modalId) {
  if (e.target.id === modalId) {
    document.getElementById(modalId).classList.add('hidden');
  }
}

// Init on load
window.addEventListener('DOMContentLoaded', () => {
  renderAuthHeader();
  renderHeroRates();
  initCategories();
  renderCatalog();
  updateCustomCalc();
  updateCartBadge();
  initReviewProductsDropdown();
  renderReviews();
});
