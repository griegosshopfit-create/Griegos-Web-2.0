/* Links work without JavaScript; this controller only adds decorative motion. */
(() => {
  "use strict";

  const page = document.querySelector(".home-page");
  const portal = page?.querySelector(".home-portal");
  const toggle = page?.querySelector(".home-motion-toggle");
  if (!page || !portal || !toggle) return;

  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const icon = toggle.querySelector(".home-motion-icon");
  const label = toggle.querySelector(".home-motion-label");
  let paused = false;
  let visible = true;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let portalTop = 0;
  let portalWidth = 1;
  let portalHeight = 1;
  let boundsLeft = 0;

  function render() {
    frame = 0;
    if (paused || preference.matches || document.hidden || !visible) return;
    const scroll = Math.min(portalHeight, Math.max(0, window.scrollY - portalTop));
    page.style.setProperty("--home-pointer-x", `${pointerX.toFixed(2)}px`);
    page.style.setProperty("--home-pointer-y", `${pointerY.toFixed(2)}px`);
    page.style.setProperty("--home-scroll-y", `${(scroll * 0.06).toFixed(2)}px`);
  }

  function schedule() {
    if (!frame && !paused && !preference.matches && !document.hidden && visible) {
      frame = window.requestAnimationFrame(render);
    }
  }

  function measure() {
    const bounds = portal.getBoundingClientRect();
    portalTop = bounds.top + window.scrollY;
    boundsLeft = bounds.left;
    portalWidth = Math.max(1, bounds.width);
    portalHeight = Math.max(1, bounds.height);
    schedule();
  }

  function suspend() {
    const suspended = document.hidden || !visible;
    page.toggleAttribute("data-home-suspended", suspended);
    if (suspended) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    } else {
      measure();
    }
  }

  function updateMotion() {
    const stopped = paused || preference.matches;
    page.dataset.homeMotion = stopped ? "paused" : "active";
    toggle.hidden = preference.matches;
    toggle.setAttribute("aria-pressed", String(paused));
    const text = paused ? "Activar movimiento" : "Pausar movimiento";
    toggle.setAttribute("aria-label", text);
    toggle.title = text;
    icon.textContent = paused ? "▶" : "Ⅱ";
    label.textContent = text;

    if (stopped) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      ["--home-pointer-x", "--home-pointer-y", "--home-scroll-y"].forEach(name => page.style.removeProperty(name));
    } else {
      measure();
    }
  }

  portal.addEventListener("pointermove", event => {
    if (event.pointerType === "touch" || paused || preference.matches) return;
    const x = Math.min(1, Math.max(0, (event.clientX - boundsLeft) / portalWidth));
    const y = Math.min(1, Math.max(0, (event.clientY + window.scrollY - portalTop) / portalHeight));
    pointerX = (x - 0.5) * -14;
    pointerY = (y - 0.5) * -10;
    schedule();
  }, { passive: true });

  portal.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    schedule();
  });

  toggle.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure, { once: true });
  document.addEventListener("visibilitychange", suspend);
  preference.addEventListener("change", updateMotion);

  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(portal);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      suspend();
    }).observe(portal);
  }
  suspend();
  updateMotion();
})();
