const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

if (menuButton && mobileMenu) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "メニューを開く");
    mobileMenu.hidden = true;
  };

  menuButton.addEventListener("click", () => {
    const nextOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(nextOpen));
    menuButton.setAttribute("aria-label", nextOpen ? "メニューを閉じる" : "メニューを開く");
    mobileMenu.hidden = !nextOpen;
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.matchMedia("(min-width: 821px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}
