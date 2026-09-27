/*
 * TINHICO — MOBILE MENU
 * Handles:
 * - open / close
 * - aria-expanded / aria-hidden
 * - body scroll lock
 * - close on navigation
 * - Escape key
 */

(() => {
    "use strict";

    const toggle = document.querySelector(".header-menu-toggle");
    const menu = document.querySelector("#mobile-menu");

    if (!toggle || !menu) return;

    const links = Array.from(menu.querySelectorAll("a"));

    function openMenu() {
        menu.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Fechar menu");
        document.body.classList.add("is-menu-open");
    }

    function closeMenu() {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu");
        document.body.classList.remove("is-menu-open");
    }

    function toggleMenu() {
        if (menu.hidden) {
            openMenu();
        } else {
            closeMenu();
        }
    }

    toggle.addEventListener("click", toggleMenu);

    links.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !menu.hidden) {
            closeMenu();
            toggle.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900 && !menu.hidden) {
            closeMenu();
        }
    });
})();
