
/* =========================================================
   GRIEGOS STORE — INTEGRACIÓN PRINCIPAL
   Archivo: scripts/main.js
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = window.GRIEGOS_CONFIG || {};

  const PRODUCTS = window.GRIEGOS_PRODUCTS_MODULE || {};

  const CART = window.GRIEGOS_CART || {};

  const CALCULATORS = window.GRIEGOS_CALCULATORS || {};

  const SELECTORS = {

    menuToggle: "#menu-toggle",

    navigation: "#main-navigation",

    currentYear: "#current-year",

    contactWhatsApp: "#contact-whatsapp",

    checkoutForm: "#checkout-form",

    checkoutError: "#checkout-error",

    deliveryMode: "#delivery-mode",

    deliveryBranch: "#delivery-branch",

    deliveryBranchGroup: "#delivery-branch-group",

    deliveryZone: "#delivery-zone",

    deliveryZoneGroup: "#delivery-zone-group",

    customerAddress: "#customer-address",

    customerAddressGroup: "#customer-address-group",

    deliveryReference: "#delivery-reference",

    deliveryNotes: "#delivery-notes",

    customerName: "#customer-name",

    customerPhone: "#customer-phone",

    customerMunicipality: "#customer-municipality",

    paymentMethod: "#payment-method",

    exchangeNote: "#exchange-note"

  };

  let initialized = false;

  let statusTimeout;

  /* UTILIDADES */

  function getElement(selector) {

    return document.querySelector(selector);

  }

  function getValue(selector) {

    return getElement(selector)?.value?.trim() || "";

  }

  function formatUSD(value) {

    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(Number(value))
    ) {

      return "Por confirmar";

    }

    return new Intl.NumberFormat(

      CONFIG.currency?.locale || "en-US",

      {

        style: "currency",

        currency: CONFIG.currency?.code || "USD",

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

      }

    ).format(Number(value));

  }

  function normalizePhone(value) {

    return String(value || "")
      .replace(/[^\d]/g, "");

  }

  function setHidden(selector, hidden) {

    const element = getElement(selector);

    if (element) {

      element.hidden = Boolean(hidden);

    }

  }

  /* AÑO DEL FOOTER */

  function updateCurrentYear() {

    const year = getElement(
      SELECTORS.currentYear
    );

    if (year) {

      year.textContent =
        String(new Date().getFullYear());

    }

  }

  /* MENÚ MÓVIL */

  function closeMobileMenu() {

    const toggle = getElement(
      SELECTORS.menuToggle
    );

    const nav = getElement(
      SELECTORS.navigation
    );

    if (!toggle || !nav) return;

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

    nav.classList.remove("is-open");

    document.body.classList.remove(
      "mobile-menu-is-open"
    );

  }

  function toggleMobileMenu() {

    const toggle = getElement(
      SELECTORS.menuToggle
    );

    const nav = getElement(
      SELECTORS.navigation
    );

    if (!toggle || !nav) return;

    const open =
      toggle.getAttribute("aria-expanded") !== "true";

    toggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    nav.classList.toggle(
      "is-open",
      open
    );

    document.body.classList.toggle(
      "mobile-menu-is-open",
      open
    );

  }

  function initMobileMenu() {

    const toggle = getElement(
      SELECTORS.menuToggle
    );

    const nav = getElement(
      SELECTORS.navigation
    );

    if (!toggle || !nav) return;

    toggle.addEventListener(
      "click",
      toggleMobileMenu
    );

    nav.querySelectorAll("a").forEach(link => {

      link.addEventListener(
        "click",
        closeMobileMenu
      );

    });

    document.addEventListener("click", event => {

      const isOpen =
        toggle.getAttribute("aria-expanded") === "true";

      if (
        isOpen &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {

        closeMobileMenu();

      }

    });

    document.addEventListener("keydown", event => {

      if (event.key === "Escape") {

        closeMobileMenu();

      }

    });

    window.addEventListener("resize", () => {

      if (
        window.matchMedia &&
        !window.matchMedia("(max-width: 820px)").matches
      ) {

        closeMobileMenu();

      }

    });

  }

  /* WHATSAPP */

  function getWhatsAppUrl(phone, message = "") {

    const cleanPhone = String(phone || "")
      .replace(/\D/g, "");

    const baseUrl =
      (CONFIG.whatsapp?.baseUrl || "https://wa.me/").replace(/\/+\+?\d+\/?$/, "/").replace(/\/?$/, "/");

    return (
      `${baseUrl}${cleanPhone}` +
      `?text=${encodeURIComponent(message)}`
    );

  }

  function setWhatsAppLink(element, phone, message) {

    if (!element || !phone) return;

    element.href = getWhatsAppUrl(
      phone,
      message
    );

    element.target = "_blank";

    element.rel = "noopener noreferrer";

  }

  function initContactWhatsApp() {

    setWhatsAppLink(

      getElement(SELECTORS.contactWhatsApp),

      CONFIG.contacts?.support,

      CONFIG.whatsapp?.messages?.general ||
      "Hola, GRIEGOS. Necesito información."

    );

    document.querySelectorAll("[data-wa]").forEach(link => {

      const type = link.dataset.wa || "general";

      const contactKey = {
        order: "orders", orders: "orders",
        support: "support", general: "support", advisor: "advisor"
      }[type] || "support";

      const phone = CONFIG.contacts?.[contactKey];

      const message =
        CONFIG.whatsapp?.messages?.[type === "orders" ? "order" : type] ||
        CONFIG.whatsapp?.messages?.general ||
        "Hola, GRIEGOS.";

      setWhatsAppLink(
        link,
        phone,
        message
      );

    });

  }

  /* ZONAS DE MENSAJERÍA */

  function populateDeliveryZones() {

    const select = getElement(
      SELECTORS.deliveryZone
    );

    const branches =
      CONFIG.delivery?.branches || [];

    const tariffsByBranch =
      CONFIG.delivery?.shipping?.tariffs || {};

    if (!select) return;

    const previousValue = select.value;

    select.replaceChildren();

    const placeholder =
      document.createElement("option");

    placeholder.value = "";

    placeholder.textContent =
      "Selecciona tu zona";

    select.appendChild(placeholder);

    branches.forEach(branch => {

      const tariffs = Array.isArray(
        tariffsByBranch[branch.id]
      )
        ? tariffsByBranch[branch.id]
        : [];

      tariffs.forEach(tariff => {

        const option =
          document.createElement("option");

        option.value =
          `${branch.id}::${tariff.zone}`;

        option.textContent =
          `${tariff.zone} — ${branch.name}`;

        option.dataset.branch =
          branch.id;

        option.dataset.zone =
          tariff.zone;

        if (
          tariff.minPrice !== undefined &&
          tariff.maxPrice !== undefined
        ) {

          option.dataset.priceRange =
            `${tariff.minPrice}-${tariff.maxPrice}`;

        }

        select.appendChild(option);

      });

    });

    if (
      previousValue &&
      [...select.options].some(
        option => option.value === previousValue
      )
    ) {

      select.value = previousValue;

    }

  }

  /* MODALIDAD DE ENTREGA */

  function updateDeliveryFields() {

    const mode =
      getValue(SELECTORS.deliveryMode) || "delivery";

    const isPickup =
      mode === "pickup" ||
      mode === "recogida";

    const isDelivery = !isPickup;

    setHidden(
      SELECTORS.deliveryBranchGroup,
      !isPickup
    );

    setHidden(
      SELECTORS.deliveryZoneGroup,
      !isDelivery
    );

    setHidden(
      SELECTORS.customerAddressGroup,
      !isDelivery
    );

    const zone = getElement(
      SELECTORS.deliveryZone
    );

    const address = getElement(
      SELECTORS.customerAddress
    );

    const branch = getElement(
      SELECTORS.deliveryBranch
    );

    if (zone) { zone.required = isDelivery; zone.disabled = isPickup; }
    if (address) { address.required = isDelivery; address.disabled = isPickup; }
    if (branch) { branch.required = isPickup; branch.disabled = isDelivery; }

    updateExchangeNote();

    if (CART.render) {

      CART.render();

    }

  }

  /* MÉTODOS DE PAGO */

  function getPaymentMethod(paymentId) {

    return (CONFIG.paymentMethods || []).find(
      method => method.id === paymentId
    ) || null;

  }

  function formatConvertedAmount(amount, currency) {

    const fractionDigits =
      currency === "CUP" ? 0 : 2;

    return `${new Intl.NumberFormat("es-ES", {

      minimumFractionDigits: fractionDigits,

      maximumFractionDigits: fractionDigits

    }).format(amount)} ${currency}`;

  }

  function updateExchangeNote() {

    const note = getElement(
      SELECTORS.exchangeNote
    );

    if (!note) return;

    const method = getPaymentMethod(
      getValue(SELECTORS.paymentMethod)
    );

    if (
      !method ||
      !method.requiresExchangeRate
    ) {

      note.hidden = true;

      return;

    }

    note.hidden = false;

    const totals = CART.getTotals
      ? CART.getTotals()
      : null;

    if (
      !totals ||
      !totals.totalAvailable
    ) {

      note.textContent =
        CONFIG.messages?.pendingExchangeNotice ||
        "La tasa y el importe final se confirmarán con GRIEGOS.";

      return;

    }

    const conversion =
      CALCULATORS.convertFromUSD

        ? CALCULATORS.convertFromUSD(
            totals.total,
            method.id
          )

        : { available: false };

    note.textContent = conversion.available

      ? (
          `Equivalencia estimada: ` +
          `${formatConvertedAmount(
            conversion.amount,
            conversion.currency
          )}. ` +
          "La tasa se confirmará antes de completar el pedido."
        )

      : (
          conversion.reason ||
          CONFIG.messages?.pendingExchangeNotice ||
          "La tasa de cambio se confirmará con GRIEGOS."
        );

  }

  /* ERRORES DEL CHECKOUT */

  function showCheckoutError(message) {

    const error = getElement(
      SELECTORS.checkoutError
    );

    if (!error) {

      window.alert(message);

      return;

    }

    error.textContent = message;

    error.hidden = false;

    error.scrollIntoView({

      behavior: "smooth",

      block: "center"

    });

  }

  function clearCheckoutError() {

    const error = getElement(
      SELECTORS.checkoutError
    );

    if (!error) return;

    error.textContent = "";

    error.hidden = true;

  }

  /* VALIDAR FORMULARIO */

  function validateCheckoutForm() {

    const name = getValue(
      SELECTORS.customerName
    );

    const phone = getValue(
      SELECTORS.customerPhone
    );

    const municipality = getValue(
      SELECTORS.customerMunicipality
    );

    const mode = getValue(
      SELECTORS.deliveryMode
    );

    const payment = getValue(
      SELECTORS.paymentMethod
    );

    if (!/^\S+\s+\S/.test(name)) {

      return {
        valid: false,
        message: "Escribe tu nombre y apellidos."
      };

    }

    if (
      !/^[+\d\s().-]+$/.test(phone) ||
      normalizePhone(phone).length < 8 || normalizePhone(phone).length > 15
    ) {

      return {
        valid: false,
        message: "Escribe un número de teléfono válido."
      };

    }

    if (!municipality) {

      return {
        valid: false,
        message: "Escribe tu municipio."
      };

    }

    if (!mode) {

      return {
        valid: false,
        message: "Selecciona una modalidad de entrega."
      };

    }

    if (mode === "delivery") {

      const zone = getElement(
        SELECTORS.deliveryZone
      );

      const selected =
        zone?.selectedOptions?.[0];

      if (
        !zone?.value ||
        !selected?.dataset?.branch ||
        !selected?.dataset?.zone
      ) {

        return {
          valid: false,
          message: "Selecciona tu zona de mensajería."
        };

      }

      if (!CALCULATORS.findTariff(selected.dataset.branch, selected.dataset.zone)) {
        return { valid: false, message: "Selecciona una zona de mensajería válida." };
      }

      if (
        getValue(SELECTORS.customerAddress).length < 5
      ) {

        return {
          valid: false,
          message: "Escribe una dirección de entrega completa."
        };

      }

    } else if (
      mode === "pickup" ||
      mode === "recogida"
    ) {

      if (!(CONFIG.delivery?.branches || []).some(branch =>
        branch.id === getValue(SELECTORS.deliveryBranch)
      )) {

        return {
          valid: false,
          message: "Selecciona la sede de recogida."
        };

      }

    } else {

      return {
        valid: false,
        message: "La modalidad de entrega seleccionada no es válida."
      };

    }

    if (!getPaymentMethod(payment)) {

      return {
        valid: false,
        message: "Selecciona un método de pago válido."
      };

    }

    return {
      valid: true,
      message: ""
    };

  }

  /* DATOS DEL PEDIDO */

  function getBranchName(branchId) {

    const branch =
      (CONFIG.delivery?.branches || []).find(
        item => item.id === branchId
      );

    return branch?.name || branchId || "";

  }

  function getOrderDetails() {

    const mode = getValue(
      SELECTORS.deliveryMode
    );

    const selectedZone =
      getElement(SELECTORS.deliveryZone)
        ?.selectedOptions?.[0] || null;

    const branchId = (mode === "pickup" || mode === "recogida")

      ? getValue(SELECTORS.deliveryBranch)

      : (selectedZone?.dataset?.branch || "");

    const zoneName = mode === "delivery"

      ? (selectedZone?.dataset?.zone || "")

      : "";

    const paymentId = getValue(
      SELECTORS.paymentMethod
    );

    return {

      customer: {

        name: getValue(
          SELECTORS.customerName
        ),

        phone: getValue(
          SELECTORS.customerPhone
        ),

        municipality: getValue(
          SELECTORS.customerMunicipality
        )

      },

      delivery: {

        mode,

        branchId,

        branch: getBranchName(branchId),

        zone: zoneName,

        address: mode === "delivery" ? getValue(SELECTORS.customerAddress) : "",

        reference: getValue(
          SELECTORS.deliveryReference
        ),

        notes: getValue(
          SELECTORS.deliveryNotes
        )

      },

      payment: getPaymentMethod(paymentId),

      items: CART.getItems
        ? CART.getItems()
        : [],

      totals: CART.getTotals
        ? CART.getTotals()
        : null

    };

  }

  /* MENSAJE DE WHATSAPP */

  function buildWhatsAppOrderMessage(order) {

    const lines = [

      "🏛️ *SOLICITUD DE PEDIDO — GRIEGOS FITNESS SHOP*",

      "",

      "*DATOS DEL CLIENTE*",

      `Nombre: ${order.customer.name}`,

      `Teléfono: ${order.customer.phone}`,

      `Municipio: ${order.customer.municipality}`,

      "",

      "*PRODUCTOS*"

    ];

    order.items.forEach((item, index) => {

      lines.push(
        `${index + 1}. ${item.name}`
      );

      lines.push(
        `   Cantidad: ${item.quantity}`
      );

      lines.push(
        `   Precio unitario: ${formatUSD(item.price)}`
      );

      lines.push(
        `   Subtotal: ${formatUSD(
          Number(item.price) * Number(item.quantity)
        )}`
      );

    });

    lines.push(
      "",
      "*ENTREGA*"
    );

    if (
      order.delivery.mode === "pickup" ||
      order.delivery.mode === "recogida"
    ) {

      lines.push(
        "Modalidad: Recogida coordinada en sede"
      );

      lines.push(
        `Sede: ${order.delivery.branch}`
      );

      lines.push(CONFIG.messages?.pickupNotice || "Recogida mediante cita.");

    } else {

      lines.push(
        "Modalidad: Entrega a domicilio"
      );

      lines.push(
        `Zona: ${order.delivery.zone}`
      );

      lines.push(
        `Sede logística: ${order.delivery.branch}`
      );

      lines.push(
        `Dirección: ${order.delivery.address}`
      );

      if (order.delivery.reference) {

        lines.push(
          `Referencia: ${order.delivery.reference}`
        );

      }

    }

    if (order.delivery.notes) {

      lines.push(
        `Notas: ${order.delivery.notes}`
      );

    }

    lines.push(
      "",
      "*PAGO*",
      `Método seleccionado: ${order.payment?.name || "No especificado"}`
    );

    if (order.totals) {

      lines.push(
        "",
        "*RESUMEN EN USD*"
      );

      lines.push(
        `Subtotal: ${formatUSD(order.totals.subtotal)}`
      );

      lines.push(`Descuento: ${order.totals.discount > 0 ? "−" : ""}${formatUSD(order.totals.discount)}`);

      lines.push(

        `Mensajería: ${
          CALCULATORS.formatShipping(order.totals.shippingDetails)
        }`

      );

      lines.push(

        `Total estimado: ${
          order.totals.totalAvailable
            ? formatUSD(order.totals.total)
            : "Por confirmar"
        }`

      );

      const shippingNotice = order.totals.shippingDetails?.message || order.totals.shippingDetails?.reason;
      if (shippingNotice) lines.push(shippingNotice);

      if (
        order.payment?.requiresExchangeRate && CALCULATORS.convertFromUSD
      ) {

        const conversion =
          order.totals.totalAvailable ? CALCULATORS.convertFromUSD(
            order.totals.total,
            order.payment.id
          ) : { available: false };

        lines.push(

          `Equivalencia: ${
            conversion.available
              ? formatConvertedAmount(
                  conversion.amount,
                  conversion.currency
                )
              : "Pendiente de confirmar"
          }`

        );

      }

    }

    lines.push(

      "",

      "La disponibilidad, el costo final de entrega y la tasa de cambio deben ser confirmados por GRIEGOS.",

      "Este mensaje no confirma el pedido ni acredita un pago."

    );

    return lines.join("\n");

  }

  /* ENVIAR PEDIDO */

  function clearPreparedOrder() {
    const link = getElement("#whatsapp-order-link");
    if (link) {
      link.hidden = true;
      link.href = "#checkout-form";
    }
  }

  function submitCheckout(event) {

    event.preventDefault();

    clearCheckoutError();

    clearPreparedOrder();

    const items = CART.getItems
      ? CART.getItems()
      : [];

    if (!items.length) {

      showCheckoutError(
        "Tu carrito está vacío. Añade productos antes de continuar."
      );

      return;

    }

    const validation = validateCheckoutForm();

    if (!validation.valid) {

      showCheckoutError(validation.message);

      return;

    }

    const orderPhone =
      CONFIG.contacts?.orders;

    if (!orderPhone) {

      showCheckoutError(
        "No está configurado el número de WhatsApp para pedidos."
      );

      return;

    }

    const order = getOrderDetails();

    const message =
      buildWhatsAppOrderMessage(order);

    const url = getWhatsAppUrl(
      orderPhone,
      message
    );

    const preparedLink = getElement("#whatsapp-order-link");
    if (preparedLink) {
      preparedLink.href = url;
      preparedLink.hidden = false;
    }

    const newWindow = window.open(
      url,
      "_blank"
    );

    if (newWindow) {

      newWindow.opener = null;

    } else {

      showCheckoutError(
        "El navegador bloqueó la ventana de WhatsApp. " +
        "Usa el enlace «Abrir solicitud preparada en WhatsApp» para continuar."
      );

    }

  }

  /* INICIALIZAR CHECKOUT */

  function initCheckout() {

    const form = getElement(
      SELECTORS.checkoutForm
    );

    if (!form) return;

    populateDeliveryZones();

    form.addEventListener(
      "submit",
      submitCheckout
    );

    form.addEventListener("input", clearPreparedOrder);
    form.addEventListener("change", clearPreparedOrder);

    getElement(SELECTORS.deliveryMode)
      ?.addEventListener(
        "change",
        updateDeliveryFields
      );

    getElement(SELECTORS.deliveryZone)
      ?.addEventListener("change", () => {

        if (CART.render) {
          CART.render();
        }

        updateExchangeNote();

      });

    getElement(SELECTORS.deliveryBranch)
      ?.addEventListener("change", () => {

        if (CART.render) {
          CART.render();
        }

      });

    getElement(SELECTORS.paymentMethod)
      ?.addEventListener(
        "change",
        updateExchangeNote
      );

    updateDeliveryFields();

    updateExchangeNote();

  }

  /* INICIALIZACIÓN GENERAL */

  function init() {

    if (initialized) return;

    initialized = true;

    window.addEventListener("griegos:cart-updated", updateExchangeNote);
    window.addEventListener("griegos:cart-updated", clearPreparedOrder);
    window.addEventListener("griegos:cart-message", event => {
      const status = getElement("#store-status");
      if (!status) return;
      clearTimeout(statusTimeout);
      status.textContent = event.detail.message;
      statusTimeout = setTimeout(() => { status.textContent = ""; }, 5000);
    });

    updateCurrentYear();

    initMobileMenu();

    initContactWhatsApp();

    initCheckout();

    /*
      Primero se inicia el catálogo.
      Después se inicia el carrito.
    */

    if (PRODUCTS.init) {

      PRODUCTS.init();

    }

    if (CART.init) {

      CART.init();

    }

  }

  /* ARRANQUE SEGURO */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }

})();
