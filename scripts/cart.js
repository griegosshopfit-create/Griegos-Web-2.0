
/* =========================================================
   GRIEGOS STORE — CARRITO Y CHECKOUT VISUAL
   Archivo: scripts/cart.js
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = window.GRIEGOS_CONFIG || {};
  const CALCULATORS = window.GRIEGOS_CALCULATORS || {};
  const PRODUCTS = window.GRIEGOS_PRODUCTS_MODULE || {};

  const STORAGE_KEY =
    CONFIG.cart?.storageKey || "griegos_store_cart_v1";

  const SELECTORS = {

    productGrid: "#product-grid",

    cartTrigger: "#cart-trigger",
    cartCount: "#cart-count",

    cartOverlay: "#cart-overlay",
    cartPanel: "#cart-panel",
    cartClose: "#cart-close",
    cartBackdrop: "#cart-backdrop",

    cartItems: "#cart-items",
    cartEmpty: "#cart-empty",
    cartSummary: "#cart-summary",

    cartSubtotal: "#cart-subtotal",
    cartDiscountRow: "#cart-discount-row",
    cartDiscount: "#cart-discount",
    cartShipping: "#cart-shipping",
    cartTotal: "#cart-total",

    checkoutTrigger: "#checkout-trigger",
    checkoutSection: "#checkout-section",
    checkoutBack: "#checkout-back",

    checkoutSubtotal: "#checkout-subtotal",
    checkoutDiscount: "#checkout-discount",
    checkoutShipping: "#checkout-shipping",
    checkoutTotal: "#checkout-total",

    continueShopping: "#continue-shopping",
    cartContinueBrowsing: "#cart-continue-browsing"

  };

  const state = {

    items: [],

    isOpen: false,

    initialized: false

  };

  /* UTILIDADES */

  function escapeHTML(value) {

    return String(value ?? "")

      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");

  }

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

  function formatPrice(value) {

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

  function getMinimumQuantity() {

    return Math.max(

      1,

      Math.floor(
        toNumber(CONFIG.cart?.minimumQuantity, 1)
      )

    );

  }

  function getStockLimit(product) {
    return Number.isSafeInteger(product?.stock)
      ? Math.max(0, product.stock)
      : 0;

  }

  function getProductSnapshot(product, quantity) {

    return {

      id: String(product.id),

      name: String(
        product.name ||
        product.title ||
        "Producto GRIEGOS"
      ),

      price: toNumber(product.price, 0),

      image: String(
        product.image ||
        product.imageUrl ||
        product.img ||
        ""
      ),

      category: String(product.category || ""),

      quantity: Math.max(

        getMinimumQuantity(),

        Math.floor(toNumber(quantity, 1))

      )

    };

  }

  function announce(message) {

    window.dispatchEvent(

      new CustomEvent("griegos:cart-message", {

        detail: {
          message: String(message || "")
        }

      })

    );

  }

  /* ALMACENAMIENTO */

  function loadCart() {

    try {

      const raw = window.localStorage.getItem(
        STORAGE_KEY
      );

      if (!raw) {

        state.items = [];

        return;

      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {

        state.items = [];

        return;

      }

      const restored = [];

      parsed.forEach(saved => {

        if (
          !saved ||
          saved.id === undefined
        ) {
          return;
        }

        const product = PRODUCTS.getById
          ? PRODUCTS.getById(saved.id)
          : null;

        if (
          !product ||
          !PRODUCTS.isAvailable?.(product) ||
          getStockLimit(product) <= 0
        ) {

          return;

        }

        const requestedQuantity = Math.max(

          getMinimumQuantity(),

          Math.floor(toNumber(saved.quantity, 1))

        );

        const quantity = Math.min(

          requestedQuantity,

          getStockLimit(product)

        );

        if (quantity < getMinimumQuantity()) {
          return;
        }

        const existing = restored.find(
          item => item.id === String(product.id)
        );

        if (existing) {

          existing.quantity = Math.min(

            existing.quantity + quantity,

            getStockLimit(product)

          );

        } else {

          restored.push(
            getProductSnapshot(product, quantity)
          );

        }

      });

      state.items = restored;

      saveCart();

    } catch (error) {

      console.error(
        "GRIEGOS STORE: no se pudo recuperar el carrito guardado.",
        error
      );

      state.items = [];

      announce("No se pudo recuperar el carrito guardado. Puedes iniciar uno nuevo.");

    }

  }

  function saveCart() {

    try {

      window.localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(state.items)

      );

      return true;

    } catch (error) {

      console.error(
        "GRIEGOS STORE: el navegador no permitió guardar el carrito.",
        error
      );

      announce(
        "No se pudo guardar el carrito en este navegador."
      );

      const warning = document.querySelector("#storage-warning");
      if (warning) {
        warning.hidden = false;
        warning.textContent = "El navegador no permite guardar el carrito. Se conservará solo durante esta visita.";
      }

      return false;

    }

  }

  /* PRODUCTOS Y CANTIDADES */

  function getCartItem(productId) {

    return state.items.find(

      item => String(item.id) === String(productId)

    ) || null;

  }

  function addProduct(productId) {

    const product = PRODUCTS.getById
      ? PRODUCTS.getById(productId)
      : null;

    if (!product) {

      console.error(
        `GRIEGOS STORE: no existe el producto ${productId}.`
      );

      announce("No se encontró este producto.");

      return false;

    }

    if (
      !PRODUCTS.isAvailable?.(product) ||
      getStockLimit(product) <= 0
    ) {

      announce(
        "Este producto no está disponible actualmente."
      );

      return false;

    }

    const current = getCartItem(productId);

    const nextQuantity =
      current ? current.quantity + 1 : getMinimumQuantity();

    if (nextQuantity > getStockLimit(product)) {

      announce(
        "No hay más unidades disponibles de este producto."
      );

      return false;

    }

    if (current) {

      current.quantity = nextQuantity;

    } else {

      state.items.push(

        getProductSnapshot(
          product,
          getMinimumQuantity()
        )

      );

    }

    saveCart();

    render();

    openCart();

    announce("Producto añadido al carrito.");

    return true;

  }

  function increaseQuantity(productId) {

    const item = getCartItem(productId);

    const product = PRODUCTS.getById
      ? PRODUCTS.getById(productId)
      : null;

    if (!item || !PRODUCTS.isAvailable?.(product)) return false;

    if (
      item.quantity + 1 >
      getStockLimit(product)
    ) {

      announce("Has alcanzado el stock disponible.");

      return false;

    }

    item.quantity += 1;

    saveCart();

    render();

    return true;

  }

  function decreaseQuantity(productId) {

    const item = getCartItem(productId);

    if (!item) return false;

    if (
      item.quantity <= getMinimumQuantity()
    ) {

      return removeProduct(productId);

    }

    item.quantity -= 1;

    saveCart();

    render();

    return true;

  }

  function removeProduct(productId) {

    const previousLength = state.items.length;

    state.items = state.items.filter(

      item => String(item.id) !== String(productId)

    );

    if (state.items.length === previousLength) {
      return false;
    }

    saveCart();

    render();

    announce("Producto eliminado del carrito.");

    return true;

  }

  function clearCart() {

    state.items = [];

    saveCart();

    render();

  }

  /* CÁLCULOS */

  function getCalculatorItems() {

    return state.items.map(item => ({

      id: item.id,

      price: item.price,

      quantity: item.quantity

    }));

  }

  function getCartSubtotal() {

    if (CALCULATORS.calculateSubtotal) {

      return CALCULATORS.calculateSubtotal(
        getCalculatorItems()
      );

    }

    return state.items.reduce(

      (sum, item) =>
        sum + item.price * item.quantity,

      0

    );

  }

  function getCurrentDeliveryDetails() {

    const mode = document.querySelector(
      "#delivery-mode"
    )?.value || "delivery";

    const branchSelect = document.querySelector(
      "#delivery-branch"
    );

    const zoneSelect = document.querySelector(
      "#delivery-zone"
    );

    const selectedZone =
      zoneSelect?.selectedOptions?.[0] || null;

    if (
      mode === "pickup" ||
      mode === "recogida"
    ) {

      return {

        deliveryMode: "pickup",

        branchId: branchSelect?.value || "",

        zoneName: ""

      };

    }

    return {

      deliveryMode: "delivery",

      branchId:
        selectedZone?.dataset?.branch || "",

      zoneName:
        selectedZone?.dataset?.zone || ""

    };

  }

  function getTotals() {

    const delivery = getCurrentDeliveryDetails();

    if (CALCULATORS.calculateTotal) {

      return CALCULATORS.calculateTotal({

        items: getCalculatorItems(),

        deliveryMode: delivery.deliveryMode,

        branchId: delivery.branchId,

        zoneName: delivery.zoneName

      });

    }

    const subtotal = getCartSubtotal();

    return {

      subtotal,

      discount: 0,

      subtotalAfterDiscount: subtotal,

      shipping: null,

      shippingDetails: {
        available: false,
        reason: "Calculadora no disponible."
      },

      total: null,

      totalAvailable: false

    };

  }

  /* CREAR ARTÍCULOS */

  function createCartItem(item) {

    const id = escapeHTML(item.id);

    const name = escapeHTML(item.name);

    const image = escapeHTML(item.image);

    const price = formatPrice(item.price);

    const itemSubtotal = formatPrice(
      item.price * item.quantity
    );

    const imageMarkup = image

      ? `
        <img
          class="cart-item__image"
          src="${image}"
          alt="${name}"
          loading="lazy"
          decoding="async"
        >
      `

      : `
        <div
          class="cart-item__image-placeholder"
          aria-label="Imagen no disponible"
        >
          G
        </div>
      `;

    return `

      <article
        class="cart-item"
        data-cart-item="${id}"
      >

        <div class="cart-item__image-wrap">

          ${imageMarkup}

        </div>

        <div class="cart-item__details">

          <h3 class="cart-item__title">
            ${name}
          </h3>

          <p class="cart-item__price">
            ${price}
          </p>

          <div class="cart-item__controls">

            <div
              class="quantity-control"
              aria-label="Cantidad de ${name}"
            >

              <button
                class="quantity-control__button"
                type="button"
                data-cart-decrease="${id}"
                aria-label="Reducir cantidad de ${name}"
              >
                −
              </button>

              <span
                class="quantity-control__value"
                aria-live="polite"
              >
                ${item.quantity}
              </span>

              <button
                class="quantity-control__button"
                type="button"
                data-cart-increase="${id}"
                ${item.quantity >= getStockLimit(PRODUCTS.getById?.(item.id)) ? "disabled" : ""}
                aria-label="Aumentar cantidad de ${name}"
              >
                +
              </button>

            </div>

            <button
              class="cart-item__remove"
              type="button"
              data-cart-remove="${id}"
            >
              Eliminar
            </button>

          </div>

          <p class="cart-item__subtotal">
            ${itemSubtotal}
          </p>

        </div>

      </article>

    `;

  }

  /* RESUMEN */

  function updateSummary(totals) {

    const setText = (selector, value) => {

      const element = document.querySelector(selector);

      if (element) {
        element.textContent = value;
      }

    };

    setText(
      SELECTORS.cartSubtotal,
      formatPrice(totals.subtotal)
    );

    setText(
      SELECTORS.cartDiscount,
      `−${formatPrice(totals.discount)}`
    );

    setText(
      SELECTORS.cartShipping,

      CALCULATORS.formatShipping(totals.shippingDetails)

    );

    setText(
      SELECTORS.cartTotal,

      totals.totalAvailable
        ? formatPrice(totals.total)
        : "Por confirmar"

    );

    setText(
      SELECTORS.checkoutSubtotal,
      formatPrice(totals.subtotal)
    );

    setText(
      SELECTORS.checkoutDiscount,
      `−${formatPrice(totals.discount)}`
    );

    setText(
      SELECTORS.checkoutShipping,

      CALCULATORS.formatShipping(totals.shippingDetails)

    );

    setText(
      SELECTORS.checkoutTotal,

      totals.totalAvailable
        ? formatPrice(totals.total)
        : "Por confirmar"

    );

    const discountRow = document.querySelector(
      SELECTORS.cartDiscountRow
    );

    if (discountRow) {

      discountRow.hidden = !(totals.discount > 0);

    }

    setText("#checkout-shipping-note",
      totals.shippingDetails.message || totals.shippingDetails.reason || "");

  }

  /* RENDERIZAR CARRITO */

  function render() {

    const activeControl = document.activeElement;
    const focusAttribute = ["data-cart-increase", "data-cart-decrease", "data-cart-remove"]
      .find(attribute => activeControl?.hasAttribute?.(attribute));
    const focusId = focusAttribute ? activeControl.getAttribute(focusAttribute) : null;

    const itemsContainer = document.querySelector(
      SELECTORS.cartItems
    );

    const emptyState = document.querySelector(
      SELECTORS.cartEmpty
    );

    const countElement = document.querySelector(
      SELECTORS.cartCount
    );

    const summary = document.querySelector(
      SELECTORS.cartSummary
    );

    const totalQuantity = state.items.reduce(

      (sum, item) => sum + item.quantity,

      0

    );

    if (countElement) {

      countElement.textContent =
        String(totalQuantity);

      countElement.hidden =
        totalQuantity === 0;

    }

    if (itemsContainer) {

      itemsContainer.innerHTML = state.items

        .map(createCartItem)

        .join("");

      itemsContainer
        .querySelectorAll(".cart-item__image")
        .forEach(image => {

          image.addEventListener("error", () => {

            const placeholder =
              document.createElement("div");

            placeholder.className =
              "cart-item__image-placeholder";

            placeholder.textContent = "G";

            image.replaceWith(placeholder);

          }, { once: true });

        });

    }

    if (emptyState) {

      emptyState.hidden =
        state.items.length > 0;

    }

    if (summary) {

      summary.hidden =
        state.items.length === 0;

    }

    if (focusAttribute && state.isOpen) {
      const controls = [...itemsContainer.querySelectorAll(`[${focusAttribute}]`)];
      let nextFocus = controls.find(control => control.getAttribute(focusAttribute) === focusId);
      if (nextFocus?.disabled) {
        nextFocus = [...itemsContainer.querySelectorAll("[data-cart-decrease]")]
          .find(control => control.getAttribute("data-cart-decrease") === focusId);
      }
      (nextFocus || document.querySelector(SELECTORS.cartClose))?.focus();
    }

    updateSummary(getTotals());

    const clearButton = document.querySelector("#cart-clear");
    if (clearButton) clearButton.hidden = state.items.length === 0;

    window.dispatchEvent(new CustomEvent("griegos:cart-updated"));

  }

  /* ABRIR CARRITO */

  let previousFocus = null;
  let backgroundElements = [];

  function openCart() {

    const overlay = document.querySelector(
      SELECTORS.cartOverlay
    );

    if (!overlay) return;

    if (!state.isOpen) {
      previousFocus = document.activeElement;
      backgroundElements = [...document.body.children]
        .filter(element => element !== overlay && element.tagName !== "SCRIPT" &&
          element.id !== "store-status" && element.id !== "storage-warning")
        .map(element => ({ element, inert: element.inert }));
      backgroundElements.forEach(({ element }) => { element.inert = true; });
    }

    overlay.hidden = false;

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    state.isOpen = true;

    document.body.classList.add(
      "cart-is-open"
    );

    document
      .querySelector(SELECTORS.cartTrigger)
      ?.setAttribute("aria-expanded", "true");

    document
      .querySelector(SELECTORS.cartClose)
      ?.focus();

  }

  /* CERRAR CARRITO */

  function closeCart() {

    const overlay = document.querySelector(
      SELECTORS.cartOverlay
    );

    if (!overlay) return;

    overlay.hidden = true;

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    state.isOpen = false;

    backgroundElements.forEach(({ element, inert }) => { element.inert = inert; });
    backgroundElements = [];
    if (previousFocus?.isConnected) previousFocus.focus();

    document.body.classList.remove(
      "cart-is-open"
    );

    document
      .querySelector(SELECTORS.cartTrigger)
      ?.setAttribute("aria-expanded", "false");

  }

  /* CHECKOUT */

  function openCheckout() {

    if (state.items.length === 0) {

      announce(
        "Añade al menos un producto antes de continuar."
      );

      return;

    }

    closeCart();

    const section = document.querySelector(
      SELECTORS.checkoutSection
    );

    if (!section) return;

    section.hidden = false;

    document.querySelector("#customer-name")?.focus({ preventScroll: true });

    section.scrollIntoView({

      behavior: "smooth",

      block: "start"

    });

  }

  function returnToCart() {

    const section = document.querySelector(
      SELECTORS.checkoutSection
    );

    if (section) {

      section.hidden = true;

    }

    openCart();

  }

  /* EVENTOS */

  function bindEvents() {

    document.querySelector("#cart-clear")?.addEventListener("click", () => {
      clearCart();
      document.querySelector(SELECTORS.cartClose)?.focus();
      announce("Carrito vaciado.");
    });

    document
      .querySelector(SELECTORS.productGrid)
      ?.addEventListener("click", event => {

        const button = event.target.closest(
          "[data-add-to-cart]"
        );

        if (button && !button.disabled) {

          addProduct(button.dataset.addToCart);

        }

      });

    document
      .querySelector(SELECTORS.cartItems)
      ?.addEventListener("click", event => {

        const increase = event.target.closest(
          "[data-cart-increase]"
        );

        const decrease = event.target.closest(
          "[data-cart-decrease]"
        );

        const remove = event.target.closest(
          "[data-cart-remove]"
        );

        if (increase) {

          increaseQuantity(
            increase.dataset.cartIncrease
          );

        } else if (decrease) {

          decreaseQuantity(
            decrease.dataset.cartDecrease
          );

        } else if (remove) {

          removeProduct(
            remove.dataset.cartRemove
          );

        }

      });

    document
      .querySelector(SELECTORS.cartTrigger)
      ?.addEventListener("click", openCart);

    document
      .querySelector(SELECTORS.cartClose)
      ?.addEventListener("click", closeCart);

    document
      .querySelector(SELECTORS.cartBackdrop)
      ?.addEventListener("click", closeCart);

    document
      .querySelector(SELECTORS.continueShopping)
      ?.addEventListener("click", closeCart);

    document
      .querySelector(SELECTORS.cartContinueBrowsing)
      ?.addEventListener("click", closeCart);

    document
      .querySelector(SELECTORS.checkoutTrigger)
      ?.addEventListener("click", openCheckout);

    document
      .querySelector(SELECTORS.checkoutBack)
      ?.addEventListener("click", returnToCart);

    document.addEventListener("keydown", event => {

      if (event.key === "Tab" && state.isOpen) {
        const panel = document.querySelector(SELECTORS.cartPanel);
        const controls = [...panel.querySelectorAll("button:not(:disabled), [href], [tabindex='0']")]
          .filter(element => element.getClientRects().length);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!panel.contains(document.activeElement)) {
          event.preventDefault(); (event.shiftKey ? last : first)?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }

      if (
        event.key === "Escape" &&
        state.isOpen
      ) {

        closeCart();

      }

    });

  }

  /* INICIALIZACIÓN */

  function init() {

    if (state.initialized) return;

    state.initialized = true;

    loadCart();

    bindEvents();

    render();

  }

  /* API PÚBLICA */

  window.GRIEGOS_CART = Object.freeze({

    init,

    render,

    open: openCart,

    close: closeCart,

    add: addProduct,

    increase: increaseQuantity,

    decrease: decreaseQuantity,

    remove: removeProduct,

    clear: clearCart,

    getItems: () =>
      state.items.map(item => ({ ...item })),

    getSubtotal: getCartSubtotal,

    getTotals,

    getDeliveryDetails: getCurrentDeliveryDetails

  });

})();
