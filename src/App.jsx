import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Plane,
  Ship,
  ShieldCheck,
  Camera,
  User,
  LogOut,
  Heart,
  Star,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Sliders,
  Link as LinkIcon,
  Package,
  ExternalLink,
  MessageSquarePlus,
  TrendingUp,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS } from './data/products';
import ProductImage from './components/ProductImage';
import { DEFAULT_CONFIG, calculateItemPricing } from './utils/pricing';

const DEMO_USERS = [
  {
    id: 'user-buyer-1',
    name: 'Олександр Байєр',
    email: 'buyer@chinadrop.ua',
    password: '123',
    role: 'buyer',
    telegram: '@alex_archive',
    novaPoshta: 'м. Київ, Відділення НП №42'
  },
  {
    id: 'user-admin-1',
    name: 'Власник ChinaDrop',
    email: 'admin@chinadrop.ua',
    password: 'admin',
    role: 'admin',
    telegram: '@chinadrop_owner',
    novaPoshta: 'м. Вінниця, Відділення НП №12'
  }
];

export default function App() {
  // Налаштування тарифів та комісії власника
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('cd_config_v2');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Товари
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('cd_products_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Відгуки
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('cd_reviews_v2');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Користувачі та поточна сесія
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('cd_users_v2');
    return saved ? JSON.parse(saved) : DEMO_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cd_session_v2');
    return saved ? JSON.parse(saved) : null;
  });

  // Замовлення
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('cd_orders_v2');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'ORD-8492',
            userId: 'user-buyer-1',
            customerName: 'Олександр Байєр',
            telegram: '@alex_archive',
            novaPoshta: 'м. Київ, Відділення НП №42',
            date: '20.11.2026',
            shippingType: 'air',
            status: 'На складі в Гуанчжоу (QC готовий)',
            items: [
              {
                title: 'Rick Owens Geobasket High-Top Leather',
                size: '43 EU',
                qty: 1,
                totalUah: 6780,
                commissionUah: 321
              }
            ],
            totalUah: 6780,
            ownerProfitUah: 321
          }
        ];
  });

  // Обране
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('cd_wishlist_v2');
    return saved ? JSON.parse(saved) : ['ro-geobasket-01', 'bal-3xl-03'];
  });

  // Кошик
  const [cart, setCart] = useState([]);

  // Фільтри та навігація
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'custom' | 'profile' | 'admin'
  const [selectedCategory, setSelectedCategory] = useState('Усі');
  const [selectedPlatform, setSelectedPlatform] = useState('Усі');
  const [searchQuery, setSearchQuery] = useState('');
  const [shippingType, setShippingType] = useState('air'); // 'air' | 'sea'
  const [includePhotoReport, setIncludePhotoReport] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});

  // Модальні вікна
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [toastMessage, setToastMessage] = useState('');

  // Форми авторизації
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    telegram: '',
    novaPoshta: ''
  });

  // Форма оформлення замовлення
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    telegram: '',
    novaPoshta: ''
  });

  // Форма викупу за посиланням
  const [customLinkForm, setCustomLinkForm] = useState({
    url: '',
    title: '',
    platform: 'Taobao',
    size: '43 EU / L',
    priceCny: 280,
    weightKg: 1.2
  });

  // Форма нового відгуку
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    size: '',
    tag: 'Топ батч 1:1',
    comment: ''
  });

  // Адмін-панель: вкладка та API імпорт
  const [adminSubTab, setAdminSubTab] = useState('rates'); // 'rates' | 'orders' | 'api'
  const [apiKey, setApiKey] = useState('tmapi_live_ua_98f2a10c4d77');
  const [apiSearchQuery, setApiSearchQuery] = useState('Rick Owens Ramones');
  const [apiImportForm, setApiImportForm] = useState({
    title: '',
    brand: 'Rick Owens',
    category: 'Взуття',
    platform: 'Taobao',
    batch: 'Top Batch 1:1',
    priceCny: 380,
    weightKg: 1.4,
    sizesStr: '40 EU, 41 EU, 42 EU, 43 EU, 44 EU',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85',
    sourceUrl: 'https://item.taobao.com/item.htm?id=8899112233'
  });
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Синхронізація з localStorage
  useEffect(() => {
    localStorage.setItem('cd_config_v2', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('cd_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cd_reviews_v2', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('cd_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cd_session_v2', JSON.stringify(currentUser));
      setCheckoutForm({
        customerName: currentUser.name || '',
        telegram: currentUser.telegram || '',
        novaPoshta: currentUser.novaPoshta || ''
      });
      setReviewForm((prev) => ({
        ...prev,
        author: currentUser.name || ''
      }));
    } else {
      localStorage.removeItem('cd_session_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cd_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cd_wishlist_v2', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Фільтрація товарів
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCat =
        selectedCategory === 'Усі' || item.category === selectedCategory;
      const matchPlat =
        selectedPlatform === 'Усі' || item.platform === selectedPlatform;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.batch.toLowerCase().includes(q);
      return matchCat && matchPlat && matchQuery;
    });
  }, [products, selectedCategory, selectedPlatform, searchQuery]);

  // Динамічний рейтинг товару з урахуванням відгуків
  const getProductStats = (product) => {
    const itemReviews = reviews.filter((r) => r.productId === product.id);
    if (itemReviews.length === 0) {
      return { avgRating: product.rating, count: 0, list: [] };
    }
    const sum = itemReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avgRating: (sum / itemReviews.length).toFixed(1),
      count: itemReviews.length,
      list: itemReviews
    };
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Видалено з обраного');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Додано в обране ❤️');
        return [...prev, productId];
      }
    });
  };

  const handleSelectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const addToCart = (product, customSize = null) => {
    const size =
      customSize || selectedSizes[product.id] || product.sizes?.[0] || 'One Size';
    const pricing = calculateItemPricing(
      product.priceCny,
      product.weightKg,
      shippingType,
      includePhotoReport,
      config
    );

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === product.id && i.size === size
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].qty += 1;
        return updated;
      }
      return [
        ...prev,
        {
          cartId: `${product.id}-${size}-${Date.now()}`,
          productId: product.id,
          title: product.title,
          brand: product.brand,
          platform: product.platform,
          image: product.image,
          category: product.category,
          size,
          priceCny: product.priceCny,
          weightKg: product.weightKg,
          qty: 1,
          ...pricing
        }
      ];
    });
    showToast(`Додано: ${product.title} (${size})`);
  };

  const handleAddCustomToCart = (e) => {
    e.preventDefault();
    if (!customLinkForm.url.trim()) {
      showToast('Вставте посилання з Pinduoduo або Taobao');
      return;
    }
    const fakeProduct = {
      id: `custom-${Date.now()}`,
      title:
        customLinkForm.title.trim() ||
        `Індивідуальний викуп (${customLinkForm.platform})`,
      brand: 'Custom Order',
      category: 'Аксесуари',
      platform: customLinkForm.platform,
      priceCny: Number(customLinkForm.priceCny) || 100,
      weightKg: Number(customLinkForm.weightKg) || 0.5,
      sizes: [customLinkForm.size || 'One Size'],
      image:
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=85'
    };
    addToCart(fakeProduct, customLinkForm.size || 'One Size');
    setIsCartOpen(true);
  };

  const cartTotals = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        const p = calculateItemPricing(
          item.priceCny,
          item.weightKg,
          shippingType,
          includePhotoReport,
          config
        );
        acc.totalUah += p.totalUah * item.qty;
        acc.commissionUah += p.commissionUah * item.qty;
        acc.deliveryUah += p.deliveryUah * item.qty;
        acc.weightKg += item.weightKg * item.qty;
        acc.count += item.qty;
        return acc;
      },
      { totalUah: 0, commissionUah: 0, deliveryUah: 0, weightKg: 0, count: 0 }
    );
  }, [cart, shippingType, includePhotoReport, config]);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!checkoutForm.telegram.trim() || !checkoutForm.novaPoshta.trim()) {
      showToast('Вкажіть Telegram та відділення Нової Пошти');
      return;
    }

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser?.id || 'guest',
      customerName: checkoutForm.customerName || 'Гість',
      telegram: checkoutForm.telegram,
      novaPoshta: checkoutForm.novaPoshta,
      date: new Date().toLocaleDateString('uk-UA'),
      shippingType,
      status: 'Очікує викуп байєром',
      items: cart.map((item) => {
        const p = calculateItemPricing(
          item.priceCny,
          item.weightKg,
          shippingType,
          includePhotoReport,
          config
        );
        return {
          title: item.title,
          size: item.size,
          qty: item.qty,
          totalUah: p.totalUah * item.qty,
          commissionUah: p.commissionUah * item.qty
        };
      }),
      totalUah: cartTotals.totalUah,
      ownerProfitUah: cartTotals.commissionUah
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCartOpen(false);
    showToast(`Замовлення ${newOrder.id} створено! Очікуйте повідомлення в Telegram.`);
  };

  // Авторизація та реєстрація
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === authForm.email.trim().toLowerCase() &&
          u.password === authForm.password
      );
      if (!found) {
        showToast('Невірний email або пароль');
        return;
      }
      setCurrentUser(found);
      setIsAuthOpen(false);
      showToast(`Вітаємо, ${found.name}!`);
    } else {
      if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password) {
        showToast('Заповніть імʼя, email та пароль');
        return;
      }
      if (users.some((u) => u.email.toLowerCase() === authForm.email.toLowerCase())) {
        showToast('Користувач з таким email вже існує');
        return;
      }
      const newUser = {
        id: `user-${Date.now()}`,
        name: authForm.name.trim(),
        email: authForm.email.trim(),
        password: authForm.password,
        role: 'buyer',
        telegram: authForm.telegram.trim() || '@client_ua',
        novaPoshta: authForm.novaPoshta.trim() || 'м. Київ, Відділення НП №1'
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsAuthOpen(false);
      showToast('Акаунт успішно створено!');
    }
  };

  const quickLogin = (role) => {
    const demo = users.find((u) => u.role === role);
    if (demo) {
      setCurrentUser(demo);
      setIsAuthOpen(false);
      if (role === 'admin') setActiveTab('admin');
      showToast(`Швидкий вхід: ${demo.name}`);
    }
  };

  // Додавання відгуку
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!activeProductModal) return;
    if (!reviewForm.comment.trim()) {
      showToast('Напишіть текст відгуку');
      return;
    }
    const newReview = {
      id: `rev-${Date.now()}`,
      productId: activeProductModal.id,
      author:
        reviewForm.author.trim() || currentUser?.name || 'Покупець з України',
      rating: Number(reviewForm.rating),
      size:
        reviewForm.size ||
        selectedSizes[activeProductModal.id] ||
        activeProductModal.sizes?.[0] ||
        'One Size',
      tag: reviewForm.tag,
      date: new Date().toLocaleDateString('uk-UA'),
      comment: reviewForm.comment.trim()
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewForm((prev) => ({ ...prev, comment: '' }));
    showToast('Дякуємо! Ваш відгук опубліковано.');
  };

  // Адмін: імпорт лоту з API Pinduoduo / Taobao
  const handleImportApiProduct = (e) => {
    e.preventDefault();
    if (!apiImportForm.title.trim()) {
      showToast('Вкажіть назву лоту');
      return;
    }
    const newProd = {
      id: `api-lot-${Date.now()}`,
      title: apiImportForm.title.trim(),
      brand: apiImportForm.brand.trim() || 'Archive',
      category: apiImportForm.category,
      platform: apiImportForm.platform,
      batch: apiImportForm.batch.trim() || 'Verified Seller',
      priceCny: Number(apiImportForm.priceCny) || 200,
      weightKg: Number(apiImportForm.weightKg) || 1.0,
      rating: 5.0,
      salesCount: 1,
      sizes: apiImportForm.sizesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      image: apiImportForm.image.trim(),
      sourceUrl: apiImportForm.sourceUrl.trim(),
      description:
        'Імпортовано через шлюз Pinduoduo/Taobao API. Перевірений продавець із високим рейтингом повернень.',
      specs: ['Прямий викуп зі складу в Китаї', 'Перевірка на брак перед відправкою']
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Лот "${newProd.title}" додано на вітрину!`);
  };

  const totalRevenueUah = useMemo(
    () => orders.reduce((s, o) => s + o.totalUah, 0),
    [orders]
  );
  const totalProfitUah = useMemo(
    () => orders.reduce((s, o) => s + o.ownerProfitUah, 0),
    [orders]
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Сповіщення */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-500 text-black font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Верхній інформаційний бар з актуальними тарифами */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Meest China 2026: Авіа ${config.meestAirUsdPerKg}/кг (9-12 дн.) · Море ${config.meestSeaUsdPerKg}/кг
            </span>
            <span className="hidden md:inline text-zinc-500">|</span>
            <span className="hidden md:inline font-mono">
              Курс викупу: 1¥ = {config.cnyToUah} ₴
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500">Склад у Гуанчжоу працює 24/7</span>
          </div>
        </div>
      </div>

      {/* Навігаційна шапка */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Логотип */}
          <button
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-black font-black flex items-center justify-center text-lg tracking-tighter group-hover:scale-105 transition">
              CD
            </div>
            <div>
              <div className="font-black tracking-tight text-base leading-none flex items-center gap-1.5">
                CHINADROP <span className="text-emerald-400">UA</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                Pindu & Tao Archive Proxy
              </div>
            </div>
          </button>

          {/* Вкладки */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'catalog'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Вітрина лотів
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
              Викуп за посиланням
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                Мій кабінет
              </button>
            )}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Кабінет власника ({config.commissionPercent}%)
            </button>
          </nav>

          {/* Праві дії: Акаунт + Кошик */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-xl text-sm transition"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {currentUser.name[0]}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[110px] truncate">
                    {currentUser.name}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setActiveTab('catalog');
                    showToast('Ви вийшли з акаунту');
                  }}
                  title="Вийти"
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-3.5 py-2 rounded-xl text-sm font-medium transition"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Увійти</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3.5 py-2 rounded-xl text-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Кошик</span>
              {cartTotals.count > 0 && (
                <span className="bg-black text-emerald-400 text-xs font-mono px-1.5 py-0.5 rounded-md">
                  {cartTotals.count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Мобільна навігація */}
        <div className="flex md:hidden border-t border-zinc-800/80 px-2 py-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            Каталог
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
              activeTab === 'custom' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            За посиланням
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
                activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
            >
              Кабінет
            </button>
          )}
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-zinc-400'
            }`}
          >
            Власник ({config.commissionPercent}%)
          </button>
        </div>
      </header>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'catalog' && (
          <>
            {/* Банер + перемикач доставки */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/30 border border-zinc-800 rounded-2xl p-5 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Прямий викуп з Pinduoduo та Taobao без китайської карти
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Архівний одяг, взуття та аксесуари під ключ у грн
                </h1>
                <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
                  Усі ціни вже включають викуп у Китаї, комісію сервісу ({config.commissionPercent}%) та доставку Meest China у ваше відділення Нової Пошти.
                </p>
              </div>

              {/* Перемикач тарифу доставки */}
              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shrink-0 space-y-2.5">
                <div className="text-xs font-medium text-zinc-400">
                  Спосіб доставки в Україну:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShippingType('air')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      shippingType === 'air'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Plane className="w-4 h-4 shrink-0" />
                    <div className="text-left">
                      <div>Авіа Meest</div>
                      <div className="text-[10px] opacity-80">
                        ${config.meestAirUsdPerKg}/кг · 9-12 дн.
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setShippingType('sea')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      shippingType === 'sea'
                        ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Ship className="w-4 h-4 shrink-0" />
                    <div className="text-left">
                      <div>Море Meest</div>
                      <div className="text-[10px] opacity-80">
                        ${config.meestSeaUsdPerKg}/кг · 35-45 дн.
                      </div>
                    </div>
                  </button>
                </div>

                <label className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80 cursor-pointer text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    Фотозвіт зі складу в Китаї (+${config.warehousePhotoUsd})
                  </span>
                  <input
                    type="checkbox"
                    checked={includePhotoReport}
                    onChange={(e) => setIncludePhotoReport(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Пошук та фільтри категорій */}
            <div className="flex flex-col md:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук: Rick Owens, Balenciaga, Margiela, S925, iPhone..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                {['Усі', 'Pinduoduo', 'Taobao'].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedPlatform === plat
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Пігулки категорій */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Сітка товарів */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const pricing = calculateItemPricing(
                  product.priceCny,
                  product.weightKg,
                  shippingType,
                  includePhotoReport,
                  config
                );
                const stats = getProductStats(product);
                const isLiked = wishlist.includes(product.id);
                const currentSize =
                  selectedSizes[product.id] || product.sizes?.[0] || 'One Size';

                return (
                  <div
                    key={product.id}
                    className="group bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col transition"
                  >
                    {/* Фото товару */}
                    <div
                      onClick={() => setActiveProductModal(product)}
                      className="relative h-64 cursor-pointer"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.title}
                        brand={product.brand}
                        category={product.category}
                        className="w-full h-full"
                      />

                      {/* Бейджі зверху */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            product.platform === 'Pinduoduo'
                              ? 'bg-orange-500 text-white'
                              : 'bg-amber-500 text-black'
                          }`}
                        >
                          {product.platform}
                        </span>
                        <span className="text-[10px] font-mono bg-black/75 backdrop-blur text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded-md">
                          {product.batch}
                        </span>
                      </div>

                      {/* Кнопка обраного */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur border border-zinc-700 flex items-center justify-center hover:scale-110 transition"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-zinc-300'
                          }`}
                        />
                      </button>

                      {/* Ціна в юанях та вага внизу фото */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
                        <span className="bg-black/80 backdrop-blur px-2 py-1 rounded-md text-zinc-300 border border-zinc-800">
                          Китай: ¥{product.priceCny} · {product.weightKg} кг
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProductModal(product);
                          }}
                          className="bg-black/80 backdrop-blur px-2 py-1 rounded-md text-amber-400 border border-zinc-800 flex items-center gap-1 hover:border-amber-400/50"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{stats.avgRating}</span>
                          <span className="text-zinc-400">({stats.count})</span>
                        </button>
                      </div>
                    </div>

                    {/* Контент картки */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase">
                          <span>{product.brand}</span>
                          <span>{product.category}</span>
                        </div>
                        <h3
                          onClick={() => setActiveProductModal(product)}
                          className="font-bold text-base text-zinc-100 hover:text-emerald-400 cursor-pointer mt-0.5 line-clamp-1 transition"
                        >
                          {product.title}
                        </h3>

                        {/* Швидкий вибір розміру */}
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="mt-3">
                            <div className="text-[11px] text-zinc-500 mb-1.5">
                              Розмір / модель:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {product.sizes.map((sz) => (
                                <button
                                  key={sz}
                                  onClick={() => handleSelectSize(product.id, sz)}
                                  className={`px-2 py-1 rounded-md text-[11px] font-mono border transition ${
                                    currentSize === sz
                                      ? 'bg-zinc-100 text-black border-zinc-100 font-bold'
                                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Підсумкова ціна в гривнях + кнопка */}
                      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] text-zinc-500">
                            Під ключ в Україні:
                          </div>
                          <div className="text-xl font-black text-emerald-400 font-mono">
                            {pricing.totalUah.toLocaleString('uk-UA')} ₴
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveProductModal(product)}
                            className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold transition"
                          >
                            Відгуки
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <Plus className="w-4 h-4" />
                            У кошик
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ВКЛАДКА: ВИКУП ЗА ВЛАСНИМ ПОСИЛАННЯМ */}
        {activeTab === 'custom' && (
          <div className="max-w-3xl mx-auto bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-2xl font-black mb-1">
              Викуп будь-якого лоту за вашим посиланням
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Знайшли товар у додатку Pinduoduo або Taobao? Вставте посилання нижче — ми викупимо його, перевіримо на складі в Гуанчжоу та відправимо в Україну.
            </p>

            <form onSubmit={handleAddCustomToCart} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Посилання на товар (Pinduoduo / Taobao) *
                </label>
                <input
                  type="url"
                  required
                  value={customLinkForm.url}
                  onChange={(e) =>
                    setCustomLinkForm({ ...customLinkForm, url: e.target.value })
                  }
                  placeholder="https://item.taobao.com/item.htm?id=..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Назва товару (для вашої зручності)
                  </label>
                  <input
                    type="text"
                    value={customLinkForm.title}
                    onChange={(e) =>
                      setCustomLinkForm({ ...customLinkForm, title: e.target.value })
                    }
                    placeholder="Наприклад: Худі Balenciaga чорне"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Розмір та колір
                  </label>
                  <input
                    type="text"
                    value={customLinkForm.size}
                    onChange={(e) =>
                      setCustomLinkForm({ ...customLinkForm, size: e.target.value })
                    }
                    placeholder="43 EU / Black"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Майданчик
                  </label>
                  <select
                    value={customLinkForm.platform}
                    onChange={(e) =>
                      setCustomLinkForm({
                        ...customLinkForm,
                        platform: e.target.value
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="Taobao">Taobao</option>
                    <option value="Pinduoduo">Pinduoduo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Ціна в Китаї (¥ юані)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customLinkForm.priceCny}
                    onChange={(e) =>
                      setCustomLinkForm({
                        ...customLinkForm,
                        priceCny: Number(e.target.value)
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Орієнтовна вага (кг)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={customLinkForm.weightKg}
                    onChange={(e) =>
                      setCustomLinkForm({
                        ...customLinkForm,
                        weightKg: Number(e.target.value)
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono outline-none"
                  />
                </div>
              </div>

              {/* Прозорий розрахунок */}
              {(() => {
                const p = calculateItemPricing(
                  Number(customLinkForm.priceCny) || 0,
                  Number(customLinkForm.weightKg) || 0.1,
                  shippingType,
                  includePhotoReport,
                  config
                );
                return (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>Викуп лоту ({customLinkForm.priceCny} ¥ × {config.cnyToUah} ₴):</span>
                      <span className="font-mono text-zinc-200">{p.baseUah} ₴</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Доставка Meest China ({shippingType === 'air' ? 'Авіа' : 'Море'}, {customLinkForm.weightKg} кг):</span>
                      <span className="font-mono text-zinc-200">{p.deliveryUah} ₴</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Комісія сервісу ({config.commissionPercent}%):</span>
                      <span className="font-mono text-zinc-200">{p.commissionUah} ₴</span>
                    </div>
                    {includePhotoReport && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Фотозвіт зі складу в Китаї:</span>
                        <span className="font-mono text-zinc-200">{p.photoReportUah} ₴</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-zinc-800 flex justify-between items-center font-bold text-base">
                      <span>Разом до сплати:</span>
                      <span className="text-emerald-400 font-mono text-xl">
                        {p.totalUah} ₴
                      </span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition"
              >
                Додати індивідуальне замовлення у кошик
              </button>
            </form>
          </div>
        )}

        {/* ВКЛАДКА: ОСОБИСТИЙ КАБІНЕТ ПОКУПЦЯ */}
        {activeTab === 'profile' && currentUser && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase">
                  Профіль клієнта · {currentUser.role === 'admin' ? 'Адміністратор' : 'Покупець'}
                </div>
                <h2 className="text-2xl font-black mt-0.5">{currentUser.name}</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {currentUser.email} · {currentUser.telegram} · {currentUser.novaPoshta}
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setActiveTab('catalog');
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-sm font-medium transition self-start"
              >
                Вийти з акаунту
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Мої замовлення */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-400" />
                  Історія моїх замовлень
                </h3>
                <div className="space-y-3">
                  {orders
                    .filter(
                      (o) =>
                        o.userId === currentUser.id ||
                        currentUser.role === 'admin'
                    )
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-400">
                            {ord.id}
                          </span>
                          <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                            {ord.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          Дата: {ord.date} · {ord.novaPoshta}
                        </div>
                        <div className="text-sm space-y-1 pt-1 border-t border-zinc-800/80">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-zinc-300">
                                {it.title} ({it.size}) ×{it.qty}
                              </span>
                              <span className="font-mono">{it.totalUah} ₴</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm">
                          <span>Разом:</span>
                          <span className="text-emerald-400 font-mono">
                            {ord.totalUah} ₴
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Обрані лоти */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  Збережені лоти ({wishlist.length})
                </h3>
                <div className="space-y-3">
                  {products
                    .filter((p) => wishlist.includes(p.id))
                    .map((prod) => {
                      const pr = calculateItemPricing(
                        prod.priceCny,
                        prod.weightKg,
                        shippingType,
                        includePhotoReport,
                        config
                      );
                      return (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 p-3 rounded-xl"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ProductImage
                              src={prod.image}
                              alt={prod.title}
                              brand={prod.brand}
                              category={prod.category}
                              className="w-14 h-14 rounded-lg shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-sm truncate">
                                {prod.title}
                              </div>
                              <div className="text-xs text-emerald-400 font-mono mt-0.5">
                                {pr.totalUah} ₴ · ¥{prod.priceCny}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(prod)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs shrink-0"
                          >
                            У кошик
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: КАБІНЕТ ВЛАСНИКА (ADMIN PANEL) */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {/* Метрики прибутку */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="text-xs text-zinc-400">Загальний оборот замовлень</div>
                <div className="text-2xl font-black font-mono mt-1">
                  {totalRevenueUah.toLocaleString('uk-UA')} ₴
                </div>
              </div>
              <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-5">
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Ваш чистий прибуток (комісія {config.commissionPercent}%)
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  +{totalProfitUah.toLocaleString('uk-UA')} ₴
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="text-xs text-zinc-400">Активних лотів на вітрині</div>
                <div className="text-2xl font-black font-mono mt-1">
                  {products.length} шт.
                </div>
              </div>
            </div>

            {/* Підвкладки адмінки */}
            <div className="flex gap-2 border-b border-zinc-800 pb-3">
              <button
                onClick={() => setAdminSubTab('rates')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  adminSubTab === 'rates'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                Комісія та тарифи Meest China
              </button>
              <button
                onClick={() => setAdminSubTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  adminSubTab === 'orders'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                Усі замовлення клієнтів ({orders.length})
              </button>
              <button
                onClick={() => setAdminSubTab('api')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminSubTab === 'api'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                API Pinduoduo / Taobao
              </button>
            </div>

            {adminSubTab === 'rates' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl space-y-4">
                <h3 className="font-bold text-lg">
                  Налаштування вашої комісії та тарифів доставки
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Ваша комісія сервісу (%)
                    </label>
                    <input
                      type="number"
                      value={config.commissionPercent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          commissionPercent: Number(e.target.value)
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Мінімальна комісія з лоту (грн)
                    </label>
                    <input
                      type="number"
                      value={config.minCommissionUah}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          minCommissionUah: Number(e.target.value)
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Курс юаня (1 ¥ у ₴)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={config.cnyToUah}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          cnyToUah: Number(e.target.value)
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Курс USD (для Meest China)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.usdToUah}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          usdToUah: Number(e.target.value)
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Meest China Авіа ($/кг)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.meestAirUsdPerKg}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          meestAirUsdPerKg: Number(e.target.value)
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Meest China Море ($/кг)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.meestSeaUsdPerKg}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          meestSeaUsdPerKg: Number(e.target.value)
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setConfig(DEFAULT_CONFIG);
                    showToast('Тарифи Meest China 2026 скинуто до базових');
                  }}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  Скинути до стандартних тарифів Meest China 2026
                </button>
              </div>
            )}

            {adminSubTab === 'orders' && (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-emerald-400">
                          {ord.id}
                        </span>
                        <span className="text-sm font-semibold">
                          {ord.customerName} ({ord.telegram})
                        </span>
                        <span className="text-xs text-zinc-500">{ord.date}</span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        Нова Пошта: {ord.novaPoshta} · Доставка:{' '}
                        {ord.shippingType === 'air' ? 'Авіа' : 'Море'}
                      </div>
                      <div className="text-xs text-zinc-300">
                        {ord.items
                          .map((i) => `${i.title} [${i.size}] ×${i.qty}`)
                          .join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-bold text-base">
                          {ord.totalUah} ₴
                        </div>
                        <div className="text-xs font-mono text-emerald-400">
                          Ваш заробіток: +{ord.ownerProfitUah} ₴
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            `Замовлення ${ord.id} | ${ord.customerName} (${ord.telegram}) | ${ord.novaPoshta} | Сума: ${ord.totalUah} грн`
                          );
                          setCopiedOrderId(ord.id);
                          setTimeout(() => setCopiedOrderId(null), 2000);
                        }}
                        className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="Скопіювати дані для викупу"
                      >
                        {copiedOrderId === ord.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminSubTab === 'api' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-lg">
                    Підключення агрегатора Pinduoduo / Taobao API
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Офіційні API Taobao Open Platform та Pinduoduo Open вимагають китайську юрособу (Business License). Для українських байєр-сервісів використовуються готові шлюзи{' '}
                    <span className="text-emerald-400 font-mono">TMAPI (tmapi.top)</span>,{' '}
                    <span className="text-emerald-400 font-mono">OTAPI</span> або{' '}
                    <span className="text-emerald-400 font-mono">RapidAPI Taobao Data</span>.
                  </p>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      API Token (TMAPI / OTAPI)
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Тестовий запит до бази Китаю
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={apiSearchQuery}
                        onChange={(e) => setApiSearchQuery(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `API шлюз активний: знайдено 148 продавців для "${apiSearchQuery}"`
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                      >
                        Перевірити
                      </button>
                    </div>
                  </div>
                </div>

                {/* Форма швидкого імпорту нового лоту */}
                <form
                  onSubmit={handleImportApiProduct}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3"
                >
                  <h3 className="font-bold text-lg">
                    Додати новий лот на вітрину
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Назва товару *"
                      value={apiImportForm.title}
                      onChange={(e) =>
                        setApiImportForm({ ...apiImportForm, title: e.target.value })
                      }
                      className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Бренд (Rick Owens)"
                      value={apiImportForm.brand}
                      onChange={(e) =>
                        setApiImportForm({ ...apiImportForm, brand: e.target.value })
                      }
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm"
                    />
                    <select
                      value={apiImportForm.category}
                      onChange={(e) =>
                        setApiImportForm({
                          ...apiImportForm,
                          category: e.target.value
                        })
                      }
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm"
                    >
                      {CATEGORIES.filter((c) => c !== 'Усі').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Ціна в ¥"
                      value={apiImportForm.priceCny}
                      onChange={(e) =>
                        setApiImportForm({
                          ...apiImportForm,
                          priceCny: Number(e.target.value)
                        })
                      }
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Вага (кг)"
                      value={apiImportForm.weightKg}
                      onChange={(e) =>
                        setApiImportForm({
                          ...apiImportForm,
                          weightKg: Number(e.target.value)
                        })
                      }
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Розміри через кому"
                      value={apiImportForm.sizesStr}
                      onChange={(e) =>
                        setApiImportForm({
                          ...apiImportForm,
                          sizesStr: e.target.value
                        })
                      }
                      className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                    <input
                      type="url"
                      placeholder="URL картинки"
                      value={apiImportForm.image}
                      onChange={(e) =>
                        setApiImportForm({ ...apiImportForm, image: e.target.value })
                      }
                      className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-xl text-sm transition"
                  >
                    Опублікувати лот у каталозі
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* МОДАЛЬНЕ ВІКНО ДЕТАЛЕЙ ТОВАРУ + СИСТЕМА ВІДГУКІВ */}
      {activeProductModal && (
        <div
          onClick={() => setActiveProductModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
          >
            <button
              onClick={() => setActiveProductModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ProductImage
                  src={activeProductModal.image}
                  alt={activeProductModal.title}
                  brand={activeProductModal.brand}
                  category={activeProductModal.category}
                  className="w-full h-80 rounded-2xl border border-zinc-800"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span>Оригінальний лот: {activeProductModal.platform}</span>
                  <a
                    href={activeProductModal.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Відкрити джерело <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span>{activeProductModal.brand}</span>
                    <span>·</span>
                    <span>{activeProductModal.batch}</span>
                  </div>
                  <h2 className="text-2xl font-black mt-1">
                    {activeProductModal.title}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    {activeProductModal.description}
                  </p>
                </div>

                <ul className="space-y-1 text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {activeProductModal.specs?.map((sp, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{sp}</span>
                    </li>
                  ))}
                </ul>

                {/* Розміри */}
                <div>
                  <div className="text-xs text-zinc-400 mb-1.5">Оберіть розмір:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProductModal.sizes?.map((sz) => {
                      const activeSz =
                        selectedSizes[activeProductModal.id] ||
                        activeProductModal.sizes[0];
                      return (
                        <button
                          key={sz}
                          onClick={() =>
                            handleSelectSize(activeProductModal.id, sz)
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                            activeSz === sz
                              ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Прозорий чек товару */}
                {(() => {
                  const pr = calculateItemPricing(
                    activeProductModal.priceCny,
                    activeProductModal.weightKg,
                    shippingType,
                    includePhotoReport,
                    config
                  );
                  return (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between text-zinc-400">
                        <span>Ціна в Китаї (¥{activeProductModal.priceCny}):</span>
                        <span className="font-mono text-zinc-200">{pr.baseUah} ₴</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Доставка Meest China ({activeProductModal.weightKg} кг):</span>
                        <span className="font-mono text-zinc-200">{pr.deliveryUah} ₴</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Комісія сервісу ({config.commissionPercent}%):</span>
                        <span className="font-mono text-zinc-200">{pr.commissionUah} ₴</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-base font-black">
                        <span>Разом:</span>
                        <span className="text-emerald-400 font-mono">
                          {pr.totalUah} ₴
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={() => {
                    addToCart(activeProductModal);
                    setActiveProductModal(null);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition"
                >
                  Додати у кошик
                </button>
              </div>
            </div>

            {/* СЕКЦІЯ ВІДГУКІВ */}
            <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Список відгуків */}
              <div className="lg:col-span-3 space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Відгуки покупців з України (
                  {reviews.filter((r) => r.productId === activeProductModal.id).length})
                </h3>

                {reviews.filter((r) => r.productId === activeProductModal.id)
                  .length === 0 ? (
                  <p className="text-sm text-zinc-500 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                    Поки немає відгуків на цей лот. Будьте першим, хто поділиться враженнями!
                  </p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {reviews
                      .filter((r) => r.productId === activeProductModal.id)
                      .map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-sm text-zinc-200">
                              {rev.author}
                            </div>
                            <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                              {'★'.repeat(rev.rating)}
                              <span className="text-zinc-500 ml-1">{rev.date}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                              {rev.tag}
                            </span>
                            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
                              Розмір: {rev.size}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Форма додавання відгуку */}
              <form
                onSubmit={handleAddReview}
                className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3"
              >
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
                  Залишити відгук
                </h4>

                <input
                  type="text"
                  placeholder="Ваше імʼя та місто (напр. Денис, Київ)"
                  value={reviewForm.author}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, author: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        rating: Number(e.target.value)
                      })
                    }
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs"
                  >
                    <option value={5}>★★★★★ (5/5)</option>
                    <option value={4}>★★★★☆ (4/5)</option>
                    <option value={3}>★★★☆☆ (3/5)</option>
                  </select>

                  <select
                    value={reviewForm.tag}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, tag: e.target.value })
                    }
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs"
                  >
                    <option value="Топ батч 1:1">Топ батч 1:1</option>
                    <option value="Ідеальний розмір">Ідеальний розмір</option>
                    <option value="Швидка доставка">Швидка доставка</option>
                    <option value="Товста бавовна">Товста бавовна</option>
                  </select>
                </div>

                <textarea
                  rows="3"
                  required
                  placeholder="Як якість матеріалів, фурнітури та відповідність розмірній сітці?"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none resize-none"
                />

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 rounded-lg text-xs transition"
                >
                  Опублікувати відгук
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО АВТОРИЗАЦІЇ / РЕЄСТРАЦІЇ */}
      {isAuthOpen && (
        <div
          onClick={() => setIsAuthOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative space-y-4"
          >
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  authMode === 'login'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400'
                }`}
              >
                Вхід в акаунт
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  authMode === 'register'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400'
                }`}
              >
                Реєстрація
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <input
                  type="text"
                  required
                  placeholder="Ваше імʼя *"
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, name: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                />
              )}

              <input
                type="email"
                required
                placeholder="Email *"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
              />

              <input
                type="password"
                required
                placeholder="Пароль *"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
              />

              {authMode === 'register' && (
                <>
                  <input
                    type="text"
                    placeholder="Ваш @telegram для фотозвіту"
                    value={authForm.telegram}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, telegram: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Місто та відділення Нової Пошти"
                    value={authForm.novaPoshta}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, novaPoshta: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-xl text-sm transition"
              >
                {authMode === 'login' ? 'Увійти' : 'Створити акаунт'}
              </button>
            </form>

            {/* Швидкий демо-вхід в 1 клік */}
            <div className="pt-3 border-t border-zinc-800">
              <div className="text-[11px] text-zinc-500 mb-2 text-center">
                Швидкий тест в 1 клік:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('buyer')}
                  className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium"
                >
                  Увійти як Покупець
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('admin')}
                  className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                >
                  Увійти як Власник
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* БОКОВА ПАНЕЛЬ КОШИКА */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border-l border-zinc-800 w-full max-w-md h-full flex flex-col p-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-black text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                Ваш кошик ({cartTotals.count})
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center text-zinc-500 py-16 text-sm">
                  Кошик порожній. Оберіть речі на вітрині або додайте власне посилання.
                </div>
              ) : (
                cart.map((item) => {
                  const p = calculateItemPricing(
                    item.priceCny,
                    item.weightKg,
                    shippingType,
                    includePhotoReport,
                    config
                  );
                  return (
                    <div
                      key={item.cartId}
                      className="flex gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-xl"
                    >
                      <ProductImage
                        src={item.image}
                        alt={item.title}
                        brand={item.brand}
                        category={item.category}
                        className="w-16 h-16 rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          Розмір: {item.size} · {item.weightKg} кг
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            {(p.totalUah * item.qty).toLocaleString('uk-UA')} ₴
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-400">
                              ×{item.qty}
                            </span>
                            <button
                              onClick={() =>
                                setCart((prev) =>
                                  prev.filter((c) => c.cartId !== item.cartId)
                                )
                              }
                              className="text-zinc-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <form
                onSubmit={handleCheckout}
                className="pt-4 border-t border-zinc-800 space-y-3"
              >
                <div className="text-xs space-y-1 text-zinc-400">
                  <div className="flex justify-between">
                    <span>Загальна вага посилки:</span>
                    <span className="font-mono text-zinc-200">
                      {cartTotals.weightKg.toFixed(2)} кг
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Комісія сервісу в чеку:</span>
                    <span className="font-mono text-zinc-200">
                      {cartTotals.commissionUah} ₴
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-1">
                    <span>До сплати під ключ:</span>
                    <span className="text-emerald-400 font-mono">
                      {cartTotals.totalUah.toLocaleString('uk-UA')} ₴
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Імʼя та прізвище отримувача *"
                  value={checkoutForm.customerName}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      customerName: e.target.value
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Ваш Telegram (@username) для фотозвіту *"
                  value={checkoutForm.telegram}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, telegram: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Місто та відділення / поштомат Нової Пошти *"
                  value={checkoutForm.novaPoshta}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      novaPoshta: e.target.value
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl text-sm transition"
                >
                  Оформити викуп із Китаю
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
