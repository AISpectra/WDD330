// src/js/cart.js
import {
  loadHeaderFooter,
  renderListWithTemplate,
  getLocalStorage,
  setLocalStorage,
  qs,
} from "./utils.mjs";

/* ---------- helpers de rendering ---------- */
function resolveImage(item) {
  const tryPaths = [
    item.PrimaryMedium,
    item.Image,
    item.ImageUrl,
    item.Images?.PrimaryMedium,
    item.Images?.PrimarySmall,
    item.Images?.PrimaryLarge,
  ].filter(Boolean);
  const src = tryPaths[0] || "/images/placeholder.png";
  return src.startsWith("/") ? src : `/${src}`;
}
function resolveName(item) {
  return item.Name || item.NameWithoutBrand || item.name || "Product";
}
function resolveUnitPrice(item) {
  return Number(item.FinalPrice ?? item.price ?? 0);
}
function money(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

/* ---------- plantilla de item con cantidad ---------- */
function cartItemTemplate(item) {
  const qty = Number(item.quantity ?? 1);
  const unit = resolveUnitPrice(item);
  const lineTotal = unit * qty;
  const name = resolveName(item);
  const img = resolveImage(item);
  const color = item.Color || item.Colors?.[0]?.ColorName || "";

  return `
    <li class="cart-card divider" data-id="${item.Id}">
      <a class="cart-card__image">
        <img src="${img}" alt="${name}" />
      </a>
      <div class="cart-card__content">
        <h2 class="card__name">${name}</h2>
        ${color ? `<p class="cart-card__color">${color}</p>` : ""}
        <div class="cart-card__qty">
          <button class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
          <input class="qty-input" type="number" min="1" inputmode="numeric"
                 value="${qty}" data-id="${item.Id}" aria-label="Quantity" />
          <button class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
          <button class="remove-btn" data-action="remove" aria-label="Remove">Remove</button>
        </div>
      </div>
      <div class="cart-card__prices">
        <p class="unit">Each: ${money(unit)}</p>
        <p class="line-total"><strong>${money(lineTotal)}</strong></p>
      </div>
    </li>
  `;
}

/* ---------- estado del carrito ---------- */
let cart = [];

/* ---------- persistencia + UI ---------- */
function saveCart(newCart) {
  cart = newCart;
  setLocalStorage("so-cart", cart);
}

function updateHeaderCount() {
  const el = document.querySelector("#cart-count");
  if (!el) return;
  const count = cart.reduce((a, it) => a + Number(it.quantity ?? 1), 0);
  el.textContent = count;
  el.hidden = count === 0;
}

function updateSummary() {
  const countEl = qs("#summary-count");
  const subtotalEl = qs("#summary-subtotal");
  const count = cart.reduce((a, it) => a + Number(it.quantity ?? 1), 0);
  const subtotal = cart.reduce(
    (a, it) => a + resolveUnitPrice(it) * Number(it.quantity ?? 1),
    0
  );
  if (countEl) countEl.textContent = count;
  if (subtotalEl) subtotalEl.textContent = money(subtotal);
}

function renderCart() {
  const listEl = qs(".product-list");
  renderListWithTemplate(cartItemTemplate, listEl, cart, "afterbegin", true);
  updateSummary();
  updateHeaderCount();
}

/* ---------- handlers de cantidad ---------- */
function setQuantity(id, qty) {
  const n = Math.max(0, Number(qty) || 0); // 0 elimina
  const idx = cart.findIndex((p) => String(p.Id) === String(id));
  if (idx === -1) return;

  if (n === 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].quantity = n;
  }
  saveCart(cart);
  renderCart();
}

function wireQuantityControls() {
  const listEl = qs(".product-list");
  if (!listEl) return;

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const li = e.target.closest("li[data-id]");
    if (!li) return;
    const id = li.dataset.id;
    const action = btn.dataset.action;

    const current = cart.find((p) => String(p.Id) === String(id));
    if (!current) return;
    const qty = Number(current.quantity ?? 1);

    if (action === "inc") setQuantity(id, qty + 1);
    if (action === "dec") setQuantity(id, qty - 1);
    if (action === "remove") setQuantity(id, 0);
  });

  // Cambios directos en el <input type="number">
  listEl.addEventListener("change", (e) => {
    const inp = e.target.closest(".qty-input");
    if (!inp) return;
    const id = inp.dataset.id;
    setQuantity(id, inp.value);
  });

  // Evitar negativos mientras se escribe
  listEl.addEventListener("input", (e) => {
    const inp = e.target.closest(".qty-input");
    if (!inp) return;
    if (inp.value === "") return; // deja vaciar y decidir en "change"
    if (Number(inp.value) < 1) inp.value = 1;
  });
}

/* ---------- init ---------- */
(async function init() {
  await loadHeaderFooter();
  cart = getLocalStorage("so-cart") || [];
  renderCart();
  wireQuantityControls();
})();
