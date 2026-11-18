/* Decorative depth shared by the Academy and Odyssey entry points and libraries. */
(() => {
  "use strict";

  const page = document.querySelector(".ody-body");
  const navigation = page?.querySelector(".ody-nav-inner");
  const main = page?.querySelector("main");
  if (!page || !navigation || !main) return;

  const scene = document.createElement("div");
  scene.className = "ody-atmosphere";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = '<div class="ody-atmosphere-glow"></div><div class="ody-atmosphere-light"></div>';
  page.prepend(scene);

  const toggle = document.createElement("button");
  toggle.className = "ody-motion-toggle";
  toggle.type = "button";
  toggle.innerHTML = '<span class="ody-motion-icon" aria-hidden="true"></span><span class="ody-motion-label"></span>';
  navigation.append(toggle);

  const hero = page.querySelector(".ody-hero");
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const icon = toggle.querySelector(".ody-motion-icon");
  const label = toggle.querySelector(".ody-motion-label");
  let paused = false;
  let frame = 0;
  let heroTop = 0;
  let heroHeight = 0;
  let scrollRange = 1;

  function render() {
    frame = 0;
    if (paused || preference.matches || document.hidden) return;

    const scroll = window.scrollY;
    const progress = Math.min(1, Math.max(0, scroll / scrollRange));
    const heroProgress = Math.min(heroHeight, Math.max(0, scroll - heroTop));
    page.style.setProperty("--ody-drift", `${(progress * 96).toFixed(2)}px`);
    if (hero) page.style.setProperty("--ody-hero-shift", `${(heroProgress * 0.12).toFixed(2)}px`);
  }

  function schedule() {
    if (!frame && !paused && !preference.matches && !document.hidden) {
      frame = window.requestAnimationFrame(render);
    }
  }

  function measure() {
    if (hero) {
      heroTop = hero.getBoundingClientRect().top + window.scrollY;
      heroHeight = hero.offsetHeight;
    }
    scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    schedule();
  }

  function updateMotion() {
    const stopped = paused || preference.matches;
    page.dataset.odyMotion = stopped ? "paused" : "active";
    toggle.hidden = preference.matches;
    toggle.setAttribute("aria-pressed", String(paused));
    icon.textContent = paused ? "▶" : "Ⅱ";
    label.textContent = paused ? "Activar movimiento" : "Pausar movimiento";

    if (stopped) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      page.style.removeProperty("--ody-drift");
      page.style.removeProperty("--ody-hero-shift");
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
    page.toggleAttribute("data-ody-suspended", document.hidden);
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    } else {
      measure();
    }
  });
  preference.addEventListener("change", updateMotion);

  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(main);
  if (document.fonts) document.fonts.ready.then(measure);
  updateMotion();
})();
