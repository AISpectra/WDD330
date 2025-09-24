// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// Renderiza una lista usando una función plantilla (lo que ya tenías)
export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (!parentElement) return;
  if (clear) parentElement.innerHTML = "";
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

/* ============================================
   NUEVO: helpers genéricos para formularios/moneda
   ============================================ */
export function formDataToJSON(formElement) {
  const fd = new FormData(formElement);
  return Object.fromEntries(fd.entries());
}
export function formatCurrency(value) {
  const n = Number(value) || 0;
  return `$${n.toFixed(2)}`;
}

/* ============================================
   NUEVO: alertas (errores / info)
   ============================================ */
export function clearAlerts() {
  document.querySelectorAll(".app-alert").forEach((el) => el.remove());
}
export function alertMessage(message, scroll = true, type = "error") {
  // elimina alertas previas
  clearAlerts();
  // contenedor principal donde insertar la alerta
  const main = document.querySelector("main") || document.body;
  const div = document.createElement("div");
  div.className = `app-alert app-alert--${type}`;
  div.setAttribute("role", type === "error" ? "alert" : "status");
  div.innerHTML = `
    <div class="app-alert__content">
      ${typeof message === "string" ? message : sanitizeJSON(message)}
    </div>
    <button class="app-alert__close" aria-label="Close">&times;</button>
  `;
  // cerrar alerta
  div.querySelector(".app-alert__close").addEventListener("click", () => div.remove());
  // insertar al inicio de <main>
  main.prepend(div);
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}
// helper para mostrar objetos JSON de error de forma legible
function sanitizeJSON(obj) {
  try {
    if (typeof obj === "string") return obj;
    return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
  } catch {
    return "An unexpected error occurred.";
  }
}

/* ============================================
   helpers para header/footer dinámicos
   ============================================ */
export function renderWithTemplate(template, parentElement, data = null, callback = null) {
  if (!parentElement || !template) return;
  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", template);
  if (typeof callback === "function") callback(parentElement, data);
}
export async function loadTemplate(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Template load error: ${path}`);
  return await res.text();
}
function updateCartCount(root) {
  const el = root.querySelector("#cart-count");
  if (!el) return;
  const items = getLocalStorage("so-cart") || [];
  const count = items.length;
  el.textContent = count;
  el.hidden = count === 0;
}
export async function loadHeaderFooter() {
  const [headerHTML, footerHTML] = await Promise.all([
    loadTemplate("/partials/header.html"),
    loadTemplate("/partials/footer.html"),
  ]);
  const headerEl = qs("#site-header");
  const footerEl = qs("#site-footer");
  renderWithTemplate(headerHTML, headerEl, null, (root) => {
    updateCartCount(root);
    wireSearch(root);
  });
  renderWithTemplate(footerHTML, footerEl);
}

/* ============================================
   Parámetros de URL
   ============================================ */
export function getParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

function wireSearch(root) {
  const form = root.querySelector("#search-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = new FormData(form).get("q")?.trim();
    if (!term) return;
    window.location.href = `/product_listing/index.html?q=${encodeURIComponent(term)}`;
  });
}

/* ============================================
   Estilos mínimos para la alerta (opcional)
   Añade esto a tu CSS real si lo prefieres
   ============================================ */
// Puedes mover estos estilos a style.css
const style = document.createElement("style");
style.textContent = `
.app-alert{background:#ffecec;color:#b00020;border:1px solid #f5c2c7;border-radius:8px;padding:12px 16px;margin:12px 0;display:flex;justify-content:space-between;align-items:start;gap:12px;box-shadow:0 2px 6px rgba(0,0,0,.06)}
.app-alert--info{background:#ecf3ff;color:#0b5394;border-color:#b7d1ff}
.app-alert__content{flex:1;word-break:break-word}
.app-alert__close{background:transparent;border:none;font-size:20px;line-height:1;cursor:pointer;color:inherit}
`;
document.head.appendChild(style);
