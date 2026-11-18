
/* =========================================================
   GRIEGOS STORE — CATÁLOGO, BÚSQUEDA Y FILTROS
   Archivo: scripts/products.js
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = window.GRIEGOS_CONFIG || {};

  const SELECTORS = {

    grid: "#product-grid",

    search: "#product-search",

    sort: "#product-sort",

    empty: "#catalog-empty",

    clearFilters: "#clear-catalog-filters",

    categoryButtons: "[data-category]"

  };

  const state = {

    products: [],

    category: "all",

    subcategory: "all",

    search: "",

    sort: "featured",

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

  function normalizeText(value) {

    return String(value ?? "")

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      .toLowerCase()

      .trim();

  }

  function formatPrice(value) {

    if (
      value === null ||
      value === undefined ||
      value === "" ||
      !Number.isFinite(Number(value))
    ) {

      return "Consultar";

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

  function getProductName(product) {

    return String(
      product?.name ||
      product?.title ||
      "Producto GRIEGOS"
    );

  }

  function getProductImage(product) {

    return String(

      product?.image ||
      product?.imageUrl ||
      product?.img ||
      ""

    ).trim();

  }

  function getProductPrice(product) {

    if (typeof product?.price !== "number") return null;

    const price = Number(product?.price);

    return Number.isFinite(price) && price >= 0
      ? price
      : null;

  }

  function isAvailable(product) {

    if (!product || product.available === false || product.status?.startsWith("pending")) {
      return false;
    }

    if (!Number.isSafeInteger(product.stock) || product.stock <= 0) {

      return false;

    }

    return getProductPrice(product) !== null;

  }

  /* OBTENER PRODUCTOS */

  function getProductData() {

    if (!Array.isArray(window.GRIEGOS_PRODUCTS)) {

      console.error(
        "GRIEGOS STORE: window.GRIEGOS_PRODUCTS no existe. " +
        "Revisa data/products.js."
      );

      return [];

    }

    const ids = new Set();

    return window.GRIEGOS_PRODUCTS.filter(product => {

      if (
        !product ||
        product.id === undefined ||
        product.id === null
      ) {

        return false;

      }

      const id = String(product.id).trim();

      if (!id || ids.has(id)) {

        console.warn(
          `GRIEGOS STORE: ID vacío o duplicado: ${id || "(vacío)"}.`
        );

        return false;

      }

      ids.add(id);

      if (getProductPrice(product) === null) {

        if (product.price === null) return false; // Precio pendiente: no es un error de ejecución.

        console.warn(
          `GRIEGOS STORE: precio inválido en el producto ${id}.`
        );

        return false;

      }

      if (!(CONFIG.categories || []).some(category =>
        category.id !== "all" && category.id === product.category
      )) {
        console.warn(`GRIEGOS STORE: categoría inválida en ${id}.`);
        return false;
      }

      if (!getCategory(product.category)?.subcategories?.some(sub => sub.id === product.subcategory)) {
        console.warn(`GRIEGOS STORE: subcategoría inválida en ${id}.`);
        return false;
      }
      return !product.status?.startsWith("pending");

    });

  }

  /* BÚSQUEDA */

  function productMatchesSearch(product, term) {

    const values = [

      product.name,

      product.title,

      product.description,

      product.category,

      product.categoryLabel,

      product.subcategoryLabel,

      product.brand,

      product.tags,

      product.badge

    ];

    return normalizeText(

      values.flat().filter(Boolean).join(" ")

    ).includes(term);

  }

  /* FILTROS Y ORDENAMIENTO */

  function getFilteredProducts() {

    let products = [...state.products];

    if (state.category !== "all") {

      products = products.filter(
        product => product.category === state.category
      );

    }

    if (state.subcategory !== "all") {
      products = products.filter(product => product.subcategory === state.subcategory);
    }

    if (state.search) {

      const term = normalizeText(state.search);

      products = products.filter(
        product => productMatchesSearch(product, term)
      );

    }

    switch (state.sort) {

      case "price-asc":

        products.sort(
          (a, b) => getProductPrice(a) - getProductPrice(b)
        );

        break;

      case "price-desc":

        products.sort(
          (a, b) => getProductPrice(b) - getProductPrice(a)
        );

        break;

      case "name-asc":

        products.sort((a, b) =>
          getProductName(a).localeCompare(
            getProductName(b),
            "es"
          )
        );

        break;

      case "newest":

        products.sort((a, b) =>
          String(b.createdAt || "").localeCompare(
            String(a.createdAt || "")
          )
        );

        break;

      case "featured":

      default:

        products.sort((a, b) =>

          Number(Boolean(b.featured)) -
          Number(Boolean(a.featured))

        );

        break;

    }

    return products;

  }

  /* TARJETA DE PRODUCTO */

  function createProductCard(product) {

    const id = escapeHTML(product.id);

    const name = escapeHTML(
      getProductName(product)
    );

    const image = escapeHTML(
      getProductImage(product)
    );

    const description = escapeHTML(
      product.description || ""
    );

    const price = formatPrice(product.price);

    const available = isAvailable(product);

    const badgeText =
      product.badge ||
      (product.featured ? "Destacado" : "");

    const imageMarkup = image

      ? `
        <img
          class="product-card__image"
          src="${image}"
          alt="${name}"
          loading="lazy"
          decoding="async"
        >
      `

      : `
        <div
          class="product-card__image-placeholder"
          aria-label="Imagen no disponible"
        >
          GRIEGOS
        </div>
      `;

    return `

      <article
        class="product-card"
        data-product-id="${id}"
      >

        <div class="product-card__media">

          ${
            badgeText
              ? `
                <span class="product-card__badge">
                  ${escapeHTML(badgeText)}
                </span>
              `
              : ""
          }

          ${imageMarkup}

          ${
            available
              ? ""
              : `
                <span class="product-card__stock">
                  Agotado
                </span>
              `
          }

        </div>

        <div class="product-card__content">

          <p class="product-card__category">

            ${escapeHTML(
              getCategory(product.category)?.name + " / " +
              (getCategory(product.category)?.subcategories?.find(sub => sub.id === product.subcategory)?.name || product.subcategoryLabel) ||
              product.category ||
              ""
            )}

          </p>

          <h3 class="product-card__title">

            ${name}

          </h3>

          ${
            description
              ? `
                <p class="product-card__description">
                  ${description}
                </p>
              `
              : ""
          }

          <div class="product-card__footer">

            <span class="product-card__price">

              ${price}

            </span>

            <button
              class="product-card__button"
              type="button"
              data-add-to-cart="${id}"
              ${available ? "" : "disabled"}
              aria-label="${available ? "Añadir al carrito" : "No disponible"}: ${name}"
            >

              ${available ? "Añadir al carrito" : "No disponible"}

            </button>

          </div>

        </div>

      </article>

    `;

  }

  /* RENDERIZAR CATÁLOGO */

  function render() {

    const grid = document.querySelector(
      SELECTORS.grid
    );

    const empty = document.querySelector(
      SELECTORS.empty
    );

    if (!grid) {

      console.error(
        "GRIEGOS STORE: no se encontró #product-grid en el HTML."
      );

      return;

    }

    const products = getFilteredProducts();

    renderSubcategories();
    const status = document.querySelector("#catalog-status");
    if (status) {
      const category = getCategory(state.category);
      const sub = category?.subcategories?.find(item => item.id === state.subcategory);
      const counts = getSubcategoryCounts(state.category, state.subcategory);
      status.textContent = `${category?.name || "Todos los productos"}${sub ? " / " + sub.name : ""} · ${products.length} resultados. ` +
        (counts.pending ? `${counts.pending} productos pendientes de precio o stock; no están a la venta. ` : "") +
        (!products.length && !state.search && !counts.pending ? "No hay productos registrados en esta selección." : "");
    }

    grid.innerHTML = products
      .map(createProductCard)
      .join("");

    grid.setAttribute("aria-live", "polite");

    if (empty) {

      empty.hidden = products.length > 0;

    }

    grid
      .querySelectorAll(".product-card__image")
      .forEach(image => {

        image.addEventListener("error", () => {

          const placeholder =
            document.createElement("div");

          placeholder.className =
            "product-card__image-placeholder";

          placeholder.textContent = "GRIEGOS";

          placeholder.setAttribute(
            "aria-label",
            "Imagen no disponible"
          );

          image.replaceWith(placeholder);

        }, { once: true });

      });

  }

  /* SELECCIÓN DE CATEGORÍA */

  function setCategory(category, sync = true) {

    const validCategories =
      (CONFIG.categories || []).map(item => item.id);

    const nextCategory = category || "all";

    state.category = (
      validCategories.length &&
      !validCategories.includes(nextCategory)
    )
      ? "all"
      : nextCategory;

    state.subcategory = "all";

    document
      .querySelectorAll(SELECTORS.categoryButtons)
      .forEach(button => {

        const active =
          button.dataset.category === state.category;

        button.classList.toggle(
          "is-active",
          active
        );

        button.setAttribute(
          "aria-pressed",
          String(active)
        );

      });

    render();

    if (sync) syncURL();

  }

  /* BÚSQUEDA */

  function handleSearch(event) {

    state.search = event.target.value || "";

    render();

    syncURL(false);

  }

  /* ORDENAMIENTO */

  function handleSort(event) {

    state.sort = event.target.value || "featured";

    render();

    syncURL(false);

  }

  /* LIMPIAR FILTROS */

  function clearFilters() {

    state.search = "";

    state.sort = "featured";

    const search = document.querySelector(
      SELECTORS.search
    );

    const sort = document.querySelector(
      SELECTORS.sort
    );

    if (search) {
      search.value = "";
    }

    if (sort) {
      sort.value = "featured";
    }

    setCategory("all");

  }

  /* EVENTOS */

  function getCategory(id) {
    return (CONFIG.categories || []).find(category => category.id === id);
  }

  function getSubcategoryCounts(categoryId, subcategoryId = "all") {
    const matches = product => (categoryId === "all" || product.category === categoryId) &&
      (subcategoryId === "all" || product.subcategory === subcategoryId);
    const rows = state.products.filter(matches);
    return {
      available: rows.filter(isAvailable).length,
      soldOut: rows.filter(product => !isAvailable(product)).length,
      pending: (window.GRIEGOS_PENDING_PRODUCTS || []).filter(matches).length
    };
  }

  function renderSubcategories() {
    const container = document.querySelector("#subcategory-filters");
    if (!container) return;
    const category = getCategory(state.category);
    container.hidden = state.category === "all";
    if (container.hidden) { container.innerHTML = ""; return; }
    const chip = (id, label, suffix = "") => `<button type="button" class="subcategory-chip" data-subcategory="${escapeHTML(id)}" aria-pressed="${state.subcategory === id}">${escapeHTML(label)}${suffix ? `<span>${escapeHTML(suffix)}</span>` : ""}</button>`;
    container.innerHTML = chip("all", "Todos") + (category?.subcategories || [])
      .filter(sub => { const c = getSubcategoryCounts(state.category, sub.id); return c.available + c.soldOut + c.pending > 0; })
      .map(sub => {
        const c = getSubcategoryCounts(state.category, sub.id);
        const summary = [c.available ? `${c.available} disponibles` : "", c.soldOut ? `${c.soldOut} agotados` : "", c.pending ? `${c.pending} pendientes` : ""].filter(Boolean).join(" · ");
        return chip(sub.id, sub.name, summary);
      }).join("");
  }

  function setSubcategory(id, sync = true) {
    state.subcategory = id === "all" || getCategory(state.category)?.subcategories?.some(sub => sub.id === id) ? id : "all";
    render();
    if (sync) syncURL();
  }

  function syncURL(push = true) {
    if (!window.location || !window.history) return;
    const url = new URL(window.location.href);
    const values = { category: state.category, subcategory: state.subcategory, q: state.search, sort: state.sort };
    for (const [key, value] of Object.entries(values)) {
      if (!value || value === "all" || (key === "sort" && value === "featured")) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    if (url.href !== window.location.href) window.history[push ? "pushState" : "replaceState"](null, "", url.href);
  }

  function applyURL() {
    const params = new URLSearchParams(window.location?.search || "");
    state.search = params.get("q") || "";
    const sort = params.get("sort");
    state.sort = ["featured", "price-asc", "price-desc", "name-asc", "newest"].includes(sort) ? sort : "featured";
    const searchInput = document.querySelector(SELECTORS.search);
    const sortInput = document.querySelector(SELECTORS.sort);
    if (searchInput) searchInput.value = state.search;
    if (sortInput) sortInput.value = state.sort;
    setCategory(params.get("category"), false);
    setSubcategory(params.get("subcategory") || "all", false);
  }

  function bindEvents() {

    document.querySelector("#subcategory-filters")?.addEventListener("click", event => {
      const button = event.target.closest("[data-subcategory]");
      if (button) { setSubcategory(button.dataset.subcategory); document.querySelector(`#subcategory-filters [data-subcategory="${state.subcategory}"]`)?.focus(); }
    });
    document.querySelector("#reset-catalog-filters")?.addEventListener("click", clearFilters);
    window.addEventListener("popstate", applyURL);

    document
      .querySelectorAll(SELECTORS.categoryButtons)
      .forEach(button => {

        button.addEventListener("click", () => {

          setCategory(button.dataset.category);

        });

      });

    document
      .querySelector(SELECTORS.search)
      ?.addEventListener("input", handleSearch);

    document
      .querySelector(SELECTORS.sort)
      ?.addEventListener("change", handleSort);

    document
      .querySelector(SELECTORS.clearFilters)
      ?.addEventListener("click", clearFilters);

  }

  /* INICIALIZACIÓN */

  function init() {

    if (state.initialized) return;

    state.initialized = true;

    state.products = getProductData();

    bindEvents();

    applyURL();

  }

  /* API PÚBLICA */

  window.GRIEGOS_PRODUCTS_MODULE = Object.freeze({

    init,

    render,

    getAll: () => [...state.products],

    getById: id =>

      state.products.find(
        product => String(product.id) === String(id)
      ) || null,

    getFiltered: getFilteredProducts,

    setCategory,

    setSubcategory,

    getSubcategoryCounts,

    clearFilters,

    formatPrice,

    isAvailable

  });

})();
