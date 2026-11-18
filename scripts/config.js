
/* =========================================================
   GRIEGOS STORE — CONFIGURACIÓN CENTRAL
   Archivo: scripts/config.js
   ========================================================= */

(() => {
  "use strict";

  const GRIEGOS_CONFIG = {

    /* IDENTIDAD */

    brand: {
      name: "GRIEGOS",
      storeName: "GRIEGOS FITNESS SHOP",
      slogan: "FUERZA. CULTURA. LEGADO."
    },

    /* MONEDA PRINCIPAL */

    currency: {
      code: "USD",
      symbol: "$",
      locale: "en-US"
    },

    /* CONTACTOS */

    contacts: {
      orders: "5353012721",
      support: "5350240814",
      advisor: "5355016605"
    },

    /* CATEGORÍAS */

    categories: [
      { id: "all", name: "Todos los productos" },
      { id: "suplementos", name: "Suplementos", subcategories: [
        { id: "creatinas", name: "Creatinas" },
        { id: "proteinas", name: "Proteínas" },
        { id: "salud-bienestar", name: "Salud y Bienestar" },
        { id: "pre-intra-entrenos", name: "Pre-entrenos e Intra-entrenos" },
        { id: "otros-suplementos", name: "Otros suplementos" }
      ] },
      { id: "accesorios", name: "Accesorios", subcategories: [
        { id: "equipamiento", name: "Equipamiento" },
        { id: "hidratacion", name: "Hidratación" },
        { id: "seguridad-proteccion", name: "Seguridad y protección" },
        { id: "tecnologia-deportiva", name: "Tecnología deportiva" }
      ] },
      { id: "ropa-deportiva", name: "Ropa deportiva", subcategories: [] }
    ],

    /* MÉTODOS DE PAGO */

    paymentMethods: [
      {
        id: "cup-cash",
        name: "Efectivo en CUP",
        currency: "CUP",
        requiresExchangeRate: true,
        exchangeRateKey: "usdToCupCash"
      },
      {
        id: "cup-transfer",
        name: "Transferencia en CUP",
        currency: "CUP",
        requiresExchangeRate: true,
        exchangeRateKey: "usdToCupTransfer"
      },
      {
        id: "usdt",
        name: "USDT",
        currency: "USDT",
        requiresExchangeRate: true,
        exchangeRateKey: "usdToUsdt"
      },
      {
        id: "zelle",
        name: "Zelle",
        currency: "USD",
        requiresExchangeRate: false
      },
      {
        id: "eur",
        name: "EUR",
        currency: "EUR",
        requiresExchangeRate: true,
        exchangeRateKey: "usdToEur"
      }
    ],

    /* TASAS DE CAMBIO */

    exchangeRates: {
      usdToCupCash: null,
      usdToCupTransfer: null,
      usdToEur: null,
      usdToUsdt: null,
      lastUpdated: null,
      source: null
    },

    /*
      No introducir tasas sin confirmación.
      Todas las equivalencias se calculan desde USD.
    */

    /* ENTREGA Y RECOGIDA */

    delivery: {

      modes: {
        delivery: "delivery",
        pickup: "pickup"
      },

      branches: [
        {
          id: "oeste",
          name: "Sede Oeste",
          municipality: "Playa",
          description: "Punto de recogida coordinado mediante cita."
        },
        {
          id: "este",
          name: "Sede Este",
          municipality: "Habana del Este",
          description: "Punto de recogida coordinado mediante cita."
        }
      ],

      shipping: {

        currency: "USD",

        freeDeliveryThresholdUSD: 100,

        freeDeliveryRule: "subtotal-greater-than-threshold",

        estimatedDeliveryHours: 24,

        requiresConfirmation: true,

        /* TARIFAS SEDE ESTE */

        tariffs: {

          este: [

            { zone: "Guanabo", price: 1.75 },

            { zone: "Peñas Altas", price: 2.00 },

            { zone: "Alturas de Marbella", price: 1.50 },

            { zone: "Juzti", price: 2.25 },

            { zone: "Campo Florido", price: 3.00 },

            { zone: "Alamar", price: 2.50 },

            { zone: "Cojímar", price: 3.25 },

            { zone: "Bahía", price: 3.25 },

            { zone: "Guanabacoa", price: 2.00 },

            { zone: "Regla", price: 3.75 },

            {
              zone: "Virgen del Camino, San Miguel y Cotorro",
              price: 5.00
            }

          ],

          /* TARIFAS SEDE OESTE */

          oeste: [

            { zone: "Jaimanitas", price: 1.00 },

            { zone: "Miramar", price: 1.50 },

            { zone: "Buena Vista", price: 1.50 },

            { zone: "Santa Fe, Playa", price: 1.50 },

            { zone: "Marianao", price: 2.00 },

            {
              zone: "La Lisa",
              minPrice: 1.75,
              maxPrice: 2.50
            },

            { zone: "Vedado", price: 2.50 },

            { zone: "Nuevo Vedado", price: 2.50 },

            { zone: "Centro Habana", price: 3.75 },

            { zone: "Plaza de la Revolución", price: 2.75 },

            { zone: "Cerro", price: 3.00 },

            { zone: "Santo Suárez", price: 3.00 },

            {
              zone: "Luyanó, Lawton y Víbora",
              price: 3.75
            },

            { zone: "Habana Vieja", price: 3.50 },

            { zone: "Arroyo Naranjo", price: 4.00 },

            { zone: "Boyeros", price: 4.00 },

            { zone: "Calabazar", price: 4.25 },

            { zone: "Santiago de las Vegas", price: 5.00 }

          ]
        }
      },

      policies: {
        pickupRequiresAppointment: true,
        pickupRequiresAvailabilityConfirmation: true,
        deliveryTimeIsEstimated: true,
        deliveryCostRequiresConfirmation: true,
        noPrivateAddressesPublished: true
      }
    },

    /* CARRITO */

    cart: {
      storageKey: "griegos_store_cart_v1",
      minimumQuantity: 1
    },

    /* DESCUENTOS */

    discounts: {
      defaultPercentage: 0
    },

    /* WHATSAPP */

    whatsapp: {

      baseUrl: "https://wa.me/+5353012721",

      messages: {

        order:
          "Hola, GRIEGOS. Quiero coordinar este pedido.",

        general:
          "Hola, GRIEGOS. Necesito información sobre la tienda.",

        advisor:
          "Hola, GRIEGOS. Quisiera información sobre asesoramiento."

      }
    },

    /* MENSAJES COMERCIALES */

    messages: {

      deliveryNotice:
        "El costo y la disponibilidad de la mensajería se confirman al coordinar el pedido.",

      pickupNotice:
        "Las recogidas en las sedes se coordinan previamente mediante cita y dependen de la disponibilidad del pedido.",

      paymentNotice:
        "Los importes finales y las tasas de cambio se confirman antes de completar el pedido.",

      freeDeliveryNotice:
        "Los pedidos superiores a 100 USD pueden optar por entrega gratuita, sujeto a las condiciones comerciales vigentes y confirmación.",

      pendingShippingNotice:
        "El costo de mensajería está pendiente de confirmación.",

      pendingExchangeNotice:
        "La tasa de cambio vigente se confirmará directamente con GRIEGOS."

    }

  };

  window.GRIEGOS_CONFIG = Object.freeze(GRIEGOS_CONFIG);

})();
