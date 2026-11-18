/* Decorative motion is isolated from the catalogue and checkout scripts. */
(() => {
  "use strict";

  const page = document.querySelector(".store-page");
  const hero = page?.querySelector(".hero-section");
  const toggle = page?.querySelector(".store-motion-toggle");
  if (!page || !hero || !toggle) return;

  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const icon = toggle.querySelector(".store-motion-icon");
  const label = toggle.querySelector(".store-motion-label");
  let paused = false;
  let frame = 0;
  let heroTop = 0;
  let heroHeight = 1;
  let scrollRange = 1;

  function render() {
    frame = 0;
    if (paused || preference.matches || document.hidden) return;

    const scroll = window.scrollY;
    const progress = Math.min(1, Math.max(0, scroll / scrollRange));
    const heroProgress = Math.min(heroHeight, Math.max(0, scroll - heroTop));
    page.style.setProperty("--store-drift", `${(progress * 100).toFixed(2)}px`);
    page.style.setProperty("--hero-shift", `${(heroProgress * 0.12).toFixed(2)}px`);
  }

  function schedule() {
    if (!frame && !paused && !preference.matches && !document.hidden) {
      frame = window.requestAnimationFrame(render);
    }
  }

  function measure() {
    heroTop = hero.getBoundingClientRect().top + window.scrollY;
    heroHeight = hero.offsetHeight;
    scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    schedule();
  }

  function updateMotion() {
    const stopped = paused || preference.matches;
    page.dataset.motion = stopped ? "paused" : "active";
    toggle.hidden = preference.matches;
    toggle.setAttribute("aria-pressed", String(paused));
    icon.textContent = paused ? "▶" : "Ⅱ";
    label.textContent = paused ? "Activar movimiento" : "Pausar movimiento";

    if (stopped) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      page.style.removeProperty("--store-drift");
      page.style.removeProperty("--hero-shift");
    } else {
      measure();
    }
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
  });

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure, { once: true });
  document.addEventListener("visibilitychange", () => {
    page.toggleAttribute("data-motion-suspended", document.hidden);
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    } else {
      measure();
    }
  });
  preference.addEventListener("change", updateMotion);

  // Filtering changes page height, so keep the background's scroll range current.
  if ("ResizeObserver" in window) {
    new ResizeObserver(measure).observe(page.querySelector("main"));
  }
  updateMotion();
})();
