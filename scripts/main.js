import { initRevealAnimations } from "./ui/reveal.js";
import { initPromiseVoiceWidget } from "./ui/widget.js";

const PROMISE_ELEVENLABS_AGENT_ID = "agent_4501kksmbgj2fwnrzpkzjdk06bej";
const THEME_KEY = "promise-theme";

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-links]");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  const page = document.body.dataset.page || "";
  document.querySelectorAll("[data-nav-page]").forEach((link) => {
    if (link.dataset.navPage === page) {
      link.classList.add("active");
    }
  });
}

function setFooterYear() {
  const target = document.querySelector("[data-current-year]");
  if (target) {
    target.textContent = String(new Date().getFullYear());
  }
}

const LOGO_LIGHT = "./assets/brand/LOGO-OSCURO.png";  // dark logo for light bg
const LOGO_DARK = "./assets/brand/LOGO-CLARO.png";   // light logo for dark bg

function updateThemeAssets() {
  const isDark = document.documentElement.dataset.theme === "dark";
  const logoSrc = isDark ? LOGO_DARK : LOGO_LIGHT;
  document.querySelectorAll(".brand-logo").forEach((img) => {
    img.src = logoSrc;
  });
  // Update widget badge visual state
  const widgetRoot = document.querySelector("[data-promise-widget-root]");
  if (widgetRoot) {
    widgetRoot.dataset.theme = isDark ? "dark" : "light";
  }
}

function initThemeToggle() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(THEME_KEY);
  const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (preferredDark ? "dark" : "light");
  root.dataset.theme = initialTheme;
  updateThemeAssets();

  const navShell = document.querySelector(".nav-shell");
  if (!navShell || navShell.querySelector("[data-theme-toggle]")) {
    return;
  }

  let actionWrap = navShell.querySelector(".nav-actions");
  if (!actionWrap) {
    actionWrap = document.createElement("div");
    actionWrap.className = "nav-actions";
    navShell.append(actionWrap);
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.dataset.themeToggle = "true";
  button.setAttribute("aria-label", "Cambiar entre modo claro y oscuro");

  const updateLabel = () => {
    const isDark = root.dataset.theme !== "light";
    button.textContent = isDark ? "Modo claro" : "Modo oscuro";
  };

  button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, root.dataset.theme);
    updateLabel();
    updateThemeAssets();
  });

  updateLabel();
  actionWrap.append(button);
}

function initSectionNavigation() {
  const sections = Array.from(document.querySelectorAll("main > section"));
  if (sections.length < 2) return;

  const nav = document.createElement("nav");
  nav.className = "section-nav";
  nav.setAttribute("aria-label", "Navegación entre secciones");
  nav.innerHTML = `
    <button type="button" class="section-nav-btn" data-dir="up" aria-label="Sección anterior">&#8593;</button>
    <button type="button" class="section-nav-btn" data-dir="down" aria-label="Siguiente sección">&#8595;</button>
  `;
  document.body.append(nav);

  function getCurrentIndex() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].offsetTop <= scrollY) return i;
    }
    return 0;
  }

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-dir]");
    if (!btn) return;
    const current = getCurrentIndex();
    const next = btn.dataset.dir === "up"
      ? Math.max(0, current - 1)
      : Math.min(sections.length - 1, current + 1);
    sections[next].scrollIntoView({ behavior: "smooth" });
  });
}

function initCtaWidget() {
  document.querySelectorAll("[data-open-widget]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const launcher = document.querySelector(".widget-toggle");
      if (launcher) launcher.click();
    });
  });
}

export function initSharedExperience() {
  initNavigation();
  initThemeToggle();
  setFooterYear();
  initRevealAnimations();
  initSectionNavigation();
  initCtaWidget();
  initPromiseVoiceWidget({
    mode: import.meta.env.VITE_ELEVENLABS_MODE || "live",
    agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID || PROMISE_ELEVENLABS_AGENT_ID,
    title: "Promi, agente asesor",
    logoSrc: "./assets/brand/ISOLOGO-CLARO.png"
  });
}
