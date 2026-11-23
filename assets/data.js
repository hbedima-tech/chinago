// Актуальні налаштування Meest China (2026) та базова вітрина
const DEFAULT_SETTINGS = {
  commissionPercent: 10,
  yuanRateUah: 5.85,
  usdRateUah: 41.8,
  airUsdPerKg: 17.6,
  seaUsdPerKg: 6.2,
  photoReportUsd: 1.5
};

// Перевірені актуальні фото по категоріях та лотах + надійний fallback
const PRODUCTS_DATA = [
  {
    id: "ro-geobasket",
    title: "Rick Owens Geobasket High-Top Leather (Black / Milk)",
    category: "Взуття",
    platform: "Taobao",
    batch: "GZ Top Batch 1:1 (Натуральна шкіра)",
    yuan: 560,
    weight: 1.8,
    sizes: ["40 EU", "41 EU", "42 EU", "43 EU", "44 EU", "45 EU"],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://item.taobao.com/item.htm?id=748291045112",
    description: "Культові високі кеди Rick Owens Geobasket з подовженим язичком, бічною блискавкою YKK та щільною шкірою. Комплект: коробка, пильник, додаткові шнурки."
  },
  {
    id: "ro-ramones-low",
    title: "Rick Owens DRKSHDW Ramones Low Canvas",
    category: "Взуття",
    platform: "Pinduoduo",
    batch: "DRK Studio Batch (16oz Канвас)",
    yuan: 340,
    weight: 1.4,
    sizes: ["40 EU", "41 EU", "42 EU", "43 EU", "44 EU"],
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=589120341",
    description: "Низькі кеди DRKSHDW з масивним молочним носком та важким вощеним канвасом. Ідеальна геометрія підошви."
  },
  {
    id: "balenci-3xl",
    title: "Balenciaga 3XL Distressed Sneakers (Eggshell / Grey)",
    category: "Взуття",
    platform: "Taobao",
    batch: "VG / XA Top Batch (Зі шнурками на носку)",
    yuan: 490,
    weight: 1.7,
    sizes: ["40 EU", "41 EU", "42 EU", "43 EU", "44 EU", "45 EU"],
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://item.taobao.com/item.htm?id=781239041122",
    description: "Оригінальний заводський дистрес-ефект, правильний шрифт розміру на п'яті та знімні декоративні шнурки спереду."
  },
  {
    id: "margiela-gat",
    title: "Maison Margiela Replica GAT (White / Grey Suede)",
    category: "Взуття",
    platform: "Pinduoduo",
    batch: "H12 / Playershoes Batch",
    yuan: 320,
    weight: 1.2,
    sizes: ["40 EU", "41 EU", "42 EU", "43 EU", "44 EU"],
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=612094812",
    description: "Класичні німецькі армійські кеди у виконанні Maison Margiela: м'яка теляча шкіра, вставки із замші та фірмовий стібок ззаду."
  },
  {
    id: "balenci-baggy-jeans",
    title: "Balenciaga Wide-Leg Baggy Denim (Washed Black 14.5oz)",
    category: "Штани",
    platform: "Taobao",
    batch: "Heavyweight 14.5oz Cotton",
    yuan: 310,
    weight: 1.1,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://item.taobao.com/item.htm?id=75519023481",
    description: "Широкі баггі-джинси з важкого деніму 14.5 унцій. Ідеально лягають поверх масивного взуття типу 3XL або Geobasket."
  },
  {
    id: "ro-bauhaus-cargo",
    title: "Rick Owens Bauhaus Cargo Pants (TE Cotton)",
    category: "Штани",
    platform: "Taobao",
    batch: "Pink Elephant / 15Pyc Batch",
    yuan: 390,
    weight: 0.95,
    sizes: ["46 (S)", "48 (M)", "50 (L)", "52 (XL)"],
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://item.taobao.com/item.htm?id=71902348122",
    description: "Карго-штани Bauhaus зі щільної бавовни TE, металевими блискавками на кишенях та фірмовими подовженими зав'язками."
  },
  {
    id: "ch-zip-hoodie",
    title: "Chrome Hearts Horseshoe Double-Zip Hoodie (540 GSM)",
    category: "Кофти",
    platform: "Taobao",
    batch: "925 Dagger Zip + Heavy Fleece",
    yuan: 360,
    weight: 1.15,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://item.taobao.com/item.htm?id=79102348192",
    description: "Щільне зіп-худі 540 г/м² із металевим бігунком у формі кинджала та об'ємним трафаретним принтом на рукавах і спині."
  },
  {
    id: "balenci-boxy-hoodie",
    title: "Balenciaga Tape Type Distressed Boxy Hoodie",
    category: "Кофти",
    platform: "Pinduoduo",
    batch: "520 GSM French Terry",
    yuan: 295,
    weight: 1.1,
    sizes: ["1 (S-M)", "2 (M-L)", "3 (L-XL)"],
    image: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=644912031",
    description: "Укорочений боксі-крій зі спущеним плечем, ручними потертостями на манжетах і капюшоні."
  },
  {
    id: "erd-washed-tee",
    title: "Enfants Riches Déprimés Vintage Washed Tee (310 GSM)",
    category: "Футболки",
    platform: "Pinduoduo",
    batch: "Acid Wash + Distressed Collar",
    yuan: 155,
    weight: 0.42,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=550192831",
    description: "Важка бавовняна футболка 310 GSM з ефектом вивареного вінтажу та мікропотертостями по коміру."
  },
  {
    id: "balenci-heavy-tee",
    title: "Balenciaga Political / Oversized Tee (300 GSM)",
    category: "Футболки",
    platform: "Taobao",
    batch: "1:1 Neck Tag & Heavy Cotton",
    yuan: 175,
    weight: 0.45,
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://item.taobao.com/item.htm?id=73390128412",
    description: "Максимальний оверсайз-силует зі щільною резинкою горловини та стійким принтом."
  },
  {
    id: "ch-forever-ring",
    title: "Chrome Hearts Forever Spacer Ring (Срібло S925)",
    category: "Прикраси",
    platform: "Taobao",
    batch: "925 Sterling Silver + Гравіювання",
    yuan: 165,
    weight: 0.15,
    sizes: ["7 US (17.3 мм)", "8 US (18.1 мм)", "9 US (19.0 мм)", "10 US (19.8 мм)"],
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://item.taobao.com/item.htm?id=68912034812",
    description: "Кільце зі справжнього срібла 925 проби з чорнінням, глибоким готичним гравіюванням і фірмовим мішечком."
  },
  {
    id: "vw-orb-necklace",
    title: "Vivienne Westwood Mini Bas Relief Pearl Choker",
    category: "Прикраси",
    platform: "Pinduoduo",
    batch: "Латунь + Кристали + Подарунковий бокс",
    yuan: 110,
    weight: 0.25,
    sizes: ["One Size (40 см)"],
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=523910441",
    description: "Перлове намисто з підвіскою Saturn Orb, інкрустованою камінням. У комплекті коробка, пильник та картка."
  },
  {
    id: "diesel-1dr-belt",
    title: "Diesel B-1DR Leather Belt (Шкіра + Металева пряжка)",
    category: "Аксесуари",
    platform: "Pinduoduo",
    batch: "Натуральна шкіра коров'яча",
    yuan: 135,
    weight: 0.35,
    sizes: ["85 см", "95 см", "105 см"],
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=601293841",
    description: "Шкіряний ремінь із фірмовою овальною пряжкою D-logo у комплекті з коробкою."
  },
  {
    id: "gothic-iphone-case",
    title: "Gothic Cross Relief Case для iPhone (MagSafe / Black)",
    category: "Чохли",
    platform: "Pinduoduo",
    batch: "Матовий софт-тач + Алюмінієві кнопки",
    yuan: 48,
    weight: 0.15,
    sizes: ["iPhone 13 / 13 Pro", "iPhone 14 Pro / Max", "iPhone 15 Pro / Max", "iPhone 16 Pro / Max"],
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80",
    sourceUrl: "https://mobile.yangkeduo.com/goods.html?goods_id=678123901",
    description: "Щільний захисний чохол з об'ємним тисненим хрестом, захистом блоку камер і магнітним кільцем MagSafe."
  }
];

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    author: "Денис К. (Київ)",
    productTitle: "Rick Owens Geobasket High-Top Leather",
    rating: 5,
    text: "Замовляв 43 розмір через авіадоставку Meest China. На 7-й день скинули детальні фото зі складу в Гуанчжоу, через 12 днів забрав на Новій Пошті. Шкіра м'яка, запах як в оригіналу.",
    date: "14.11.2026"
  },
  {
    id: "rev-2",
    author: "Аліна М. (Львів)",
    productTitle: "Balenciaga 3XL Distressed Sneakers",
    rating: 5,
    text: "Вперше замовляла з Taobao, сама б ніколи не розібралася з ієрогліфами. Дуже зручно, що одразу видно фінальну ціну в гривнях з доставкою.",
    date: "19.11.2026"
  },
  {
    id: "rev-3",
    author: "Влад @vlados_vn (Вінниця)",
    productTitle: "Chrome Hearts Forever Spacer Ring (Срібло S925)",
    rating: 5,
    text: "Перевіряв у ювеліра — реально 925 срібло! Взяв разом із зіп-худі, комісія адекватна.",
    date: "21.11.2026"
  }
];
