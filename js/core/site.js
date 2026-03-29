const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

if (navToggle && nav) {
  const closeNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(target) || navToggle.contains(target)) return;
    closeNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeNav();
    }
  });
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
