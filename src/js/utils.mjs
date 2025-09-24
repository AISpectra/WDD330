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
// Convierte un <form> en un objeto plano { name: value, ... }
export function formDataToJSON(formElement) {
  const fd = new FormData(formElement);
  return Object.fromEntries(fd.entries());
}

// Formatea un número como $0.00
export function formatCurrency(value) {
  const n = Number(value) || 0;
  return `$${n.toFixed(2)}`;
}

/* ============================================
   NUEVO: helpers para header/footer dinámicos
   ============================================ */

// Render de un único template + callback opcional
export function renderWithTemplate(template, parentElement, data = null, callback = null) {
  if (!parentElement || !template) return;
  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", template);
  if (typeof callback === "function") callback(parentElement, data);
}

// Cargar un HTML (partial) como string
export async function loadTemplate(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Template load error: ${path}`);
  return await res.text();
}

// (Opcional) actualizar contador del carrito en el header
function updateCartCount(root) {
  const el = root.querySelector("#cart-count");
  if (!el) return;
  const items = getLocalStorage("so-cart") || [];
  const count = items.length;
  el.textContent = count;
  el.hidden = count === 0;
}

// Cargar e inyectar header y footer
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
   Extra útil: obtener parámetros de la URL
   ============================================ */
export function getParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

function wireSearch(root) {
  const form = root.querySelector('#search-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = new FormData(form).get('q')?.trim();
    if (!term) return;
    // redirigir a la página de listado con ?q=
    window.location.href = `/product_listing/index.html?q=${encodeURIComponent(term)}`;
  });
}
