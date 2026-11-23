// Актуальні тарифи Meest China (2026) та розрахунок вартості під ключ
export const DEFAULT_CONFIG = {
  cnyToUah: 5.95, // Внутрішній курс обміну UAH за 1 CNY (з урахуванням конвертації Alipay/WeChat)
  usdToUah: 41.8, // Курс долара для розрахунку тарифів Meest China
  commissionPercent: 10, // Ваша комісія сервісу (%)
  minCommissionUah: 80, // Мінімальна комісія з лоту (грн)
  meestAirUsdPerKg: 18.1, // Meest China Авіа у відділення Нової Пошти (9-12 днів)
  meestSeaUsdPerKg: 6.4, // Meest China Море у відділення Нової Пошти (35-45 днів)
  warehousePhotoUsd: 1.5 // Детальний фотозвіт зі складу в Гуанчжоу ($1.5 / лот)
};

export function calculateItemPricing(priceCny, weightKg, shippingType, includePhotoReport, config) {
  const baseUah = priceCny * config.cnyToUah;
  const rawCommission = baseUah * (config.commissionPercent / 100);
  const commissionUah = Math.max(rawCommission, config.minCommissionUah);

  const ratePerKg =
    shippingType === 'air' ? config.meestAirUsdPerKg : config.meestSeaUsdPerKg;
  const deliveryUsd = Math.max(weightKg, 0.1) * ratePerKg;
  const deliveryUah = deliveryUsd * config.usdToUah;

  const photoReportUah = includePhotoReport
    ? config.warehousePhotoUsd * config.usdToUah
    : 0;

  const totalUah = Math.round(baseUah + commissionUah + deliveryUah + photoReportUah);

  return {
    baseUah: Math.round(baseUah),
    commissionUah: Math.round(commissionUah),
    deliveryUah: Math.round(deliveryUah),
    photoReportUah: Math.round(photoReportUah),
    totalUah
  };
}
