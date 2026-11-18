
/* =========================================================
   GRIEGOS STORE — CÁLCULOS COMERCIALES
   Archivo: scripts/calculators.js
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = window.GRIEGOS_CONFIG || {};

  const SHIPPING = CONFIG.delivery?.shipping || {};

  const RATES = CONFIG.exchangeRates || {};

  /* UTILIDADES */

  function toNumber(value, fallback = 0) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }

  function roundMoney(value) {

    return Math.round(
      (toNumber(value) + Number.EPSILON) * 100
    ) / 100;

  }

  function normalizeText(value) {

    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  }

  /* SUBTOTAL */

  function calculateSubtotal(items = []) {

    if (!Array.isArray(items)) {
      return 0;
    }

    return roundMoney(

      items.reduce((sum, item) => {

        const price = Math.max(
          0,
          toNumber(item?.price)
        );

        const quantity = Math.max(
          0,
          Math.floor(toNumber(item?.quantity))
        );

        return sum + price * quantity;

      }, 0)

    );

  }

  /* DESCUENTOS */

  function calculateDiscount(
    subtotal,
    percentage = CONFIG.discounts?.defaultPercentage ?? 0
  ) {

    const base = Math.max(
      0,
      toNumber(subtotal)
    );

    const rate = Math.min(
      100,
      Math.max(0, toNumber(percentage))
    );

    return roundMoney(base * rate / 100);

  }

  /* TARIFAS */

  function getTariffs(branchId) {

    const tariffs = SHIPPING.tariffs || {};

    return Array.isArray(tariffs[branchId])
      ? tariffs[branchId]
      : [];

  }

  function findTariff(branchId, zoneName) {

    const target = normalizeText(zoneName);

    if (!branchId || !target) {
      return null;
    }

    return getTariffs(branchId).find(
      item => normalizeText(item.zone) === target
    ) || null;

  }

  /* CALCULAR MENSAJERÍA */

  function calculateShipping(branchId, zoneName) {

    const tariff = findTariff(branchId, zoneName);

    if (!tariff) {

      return {
        available: false,
        price: null,
        branch: branchId || null,
        zone: zoneName || null,
        reason: "Selecciona una zona de entrega válida."
      };

    }

    if (
      typeof tariff.price === "number" &&
      Number.isFinite(tariff.price) && tariff.price >= 0
    ) {

      return {

        available: true,

        price: roundMoney(tariff.price),

        branch: branchId,

        zone: tariff.zone,

        requiresConfirmation:
          SHIPPING.requiresConfirmation === true,

        reason:
          SHIPPING.requiresConfirmation === true
            ? "Tarifa estimada, sujeta a confirmación."
            : ""

      };

    }

    if (
      typeof tariff.minPrice === "number" &&
      typeof tariff.maxPrice === "number" &&
      Number.isFinite(tariff.minPrice) &&
      Number.isFinite(tariff.maxPrice) &&
      tariff.minPrice >= 0 && tariff.maxPrice >= tariff.minPrice
    ) {

      return {

        available: false,

        price: null,

        minPrice: roundMoney(tariff.minPrice),

        maxPrice: roundMoney(tariff.maxPrice),

        branch: branchId,

        zone: tariff.zone,

        requiresConfirmation: true,

        reason:
          `La mensajería para ${tariff.zone} requiere confirmación ` +
          `(rango ${roundMoney(tariff.minPrice).toFixed(2)}–` +
          `${roundMoney(tariff.maxPrice).toFixed(2)} USD).`

      };

    }

    return {

      available: false,

      price: null,

      branch: branchId,

      zone: tariff.zone,

      requiresConfirmation: true,

      reason: "La tarifa de esta zona debe confirmarse."

    };

  }

  /* ENTREGA GRATUITA */

  function qualifiesForFreeDelivery(subtotal) {

    const threshold = toNumber(
      SHIPPING.freeDeliveryThresholdUSD,
      100
    );

    return toNumber(subtotal) > threshold;

  }

  /* COSTO FINAL DE ENTREGA */

  function calculateFinalShipping({

    subtotal = 0,

    deliveryMode = "delivery",

    branchId = "",

    zoneName = ""

  } = {}) {

    if (
      deliveryMode === "pickup" ||
      deliveryMode === "recogida"
    ) {

      return {

        available: true,

        price: 0,

        free: true,

        mode: "pickup",

        requiresConfirmation: true,

        message:
          CONFIG.messages?.pickupNotice ||
          "Recogida coordinada mediante cita."

      };

    }

    const tariff = calculateShipping(branchId, zoneName);

    if (findTariff(branchId, zoneName) && qualifiesForFreeDelivery(subtotal)) {

      return {

        available: true,

        price: 0,

        free: true,

        mode: "delivery",

        requiresConfirmation: true,

        message:
          CONFIG.messages?.freeDeliveryNotice ||
          "Entrega gratuita sujeta a confirmación."

      };

    }

    return {

      ...tariff,

      free: false,

      mode: "delivery"

    };

  }

  /* TOTAL DEL PEDIDO */

  function calculateTotal({

    items = [],

    discountPercentage,

    deliveryMode = "delivery",

    branchId = "",

    zoneName = ""

  } = {}) {

    const subtotal = calculateSubtotal(items);

    const discount = calculateDiscount(
      subtotal,
      discountPercentage
    );

    const subtotalAfterDiscount = roundMoney(
      Math.max(0, subtotal - discount)
    );

    const shippingDetails = calculateFinalShipping({

      subtotal: subtotalAfterDiscount,

      deliveryMode,

      branchId,

      zoneName

    });

    const totalAvailable =
      shippingDetails.available === true;

    const shipping = totalAvailable
      ? toNumber(shippingDetails.price)
      : null;

    const total = totalAvailable
      ? roundMoney(subtotalAfterDiscount + shipping)
      : null;

    return {

      subtotal,

      discount,

      subtotalAfterDiscount,

      shipping,

      shippingDetails,

      total,

      totalAvailable

    };

  }

  /* MÉTODO DE PAGO */

  function getPaymentMethod(paymentMethodId) {

    return (CONFIG.paymentMethods || []).find(
      method => method.id === paymentMethodId
    ) || null;

  }

  /* CONVERSIÓN DE USD */

  function convertFromUSD(amountUSD, paymentMethodId) {

    if (typeof amountUSD !== "number" || !Number.isFinite(amountUSD * 100) || amountUSD < 0) {
      return { available: false, amount: null, currency: null,
        reason: "Importe pendiente de confirmación." };
    }

    const method = getPaymentMethod(paymentMethodId);

    if (!method) {

      return {
        available: false,
        amount: null,
        currency: null,
        reason: "Método de pago no reconocido."
      };

    }

    if (method.currency === "USD") {

      return {

        available: true,

        amount: roundMoney(amountUSD),

        currency: method.currency,

        rate: 1

      };

    }

    const key = method.exchangeRateKey;

    const rate = key
      ? toNumber(RATES[key], NaN)
      : NaN;

    if (!Number.isFinite(rate) || rate <= 0) {

      return {

        available: false,

        amount: null,

        currency: method.currency,

        reason:
          CONFIG.messages?.pendingExchangeNotice ||
          "Tasa de cambio pendiente de confirmación."

      };

    }

    const convertedAmount = amountUSD * rate;
    if (!Number.isFinite(convertedAmount) || !Number.isFinite(convertedAmount * 100)) {
      return { available: false, amount: null, currency: method.currency,
        reason: "Equivalencia pendiente de confirmación." };
    }

    return {

      available: true,

      amount: roundMoney(
        convertedAmount
      ),

      currency: method.currency,

      rate

    };

  }

  /* API PÚBLICA */

  function formatShipping(details = {}) {
    if (details.free) {
      return details.mode === "pickup" ? "0.00 USD (recogida)" : "0.00 USD (sujeto a confirmación)";
    }
    if (details.available) return `${details.price.toFixed(2)} USD (estimada)`;
    if (Number.isFinite(details.minPrice) && Number.isFinite(details.maxPrice)) {
      return `${details.minPrice.toFixed(2)}–${details.maxPrice.toFixed(2)} USD (por confirmar)`;
    }
    return "Por confirmar";
  }

  window.GRIEGOS_CALCULATORS = Object.freeze({

    toNumber,

    roundMoney,

    normalizeText,

    calculateSubtotal,

    calculateDiscount,

    getTariffs,

    findTariff,

    calculateShipping,

    formatShipping,

    qualifiesForFreeDelivery,

    calculateFinalShipping,

    calculateTotal,

    getPaymentMethod,

    convertFromUSD

  });

})();
