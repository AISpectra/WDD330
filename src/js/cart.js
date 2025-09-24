import { loadHeaderFooter, renderListWithTemplate, getLocalStorage, qs } from "./utils.mjs";

function resolveImage(item) {
  // intentos en orden de preferencia
  const tryPaths = [
    item.PrimaryMedium,
    item.PrimaryLarge,
    item.Image,
    item.ImageUrl,
    item.Images?.PrimaryMedium,
    item.Images?.PrimaryLarge,
    item.Images?.PrimarySmall,
  ].filter(Boolean);

  let src = tryPaths[0] || "/images/placeholder.png";

  // si ya es una URL absoluta, la devolvemos tal cual
  if (/^https?:\/\//i.test(src)) return src;

  // si es relativa, asegurar que empiece con '/'
  return src.startsWith("/") ? src : `/${src}`;
}

function resolveName(item) {
  return item.Name || item.NameWithoutBrand || item.name || "Product";
}

function resolvePrice(item) {
  const price = Number(item.FinalPrice ?? item.price ?? 0);
  return price;
}

function cartItemTemplate(item) {
  const qty = item.quantity ?? 1;
  const price = resolvePrice(item);
  const name = resolveName(item);
  const img = resolveImage(item);
  const color = item.Color || item.Colors?.[0]?.ColorName || "";

  return `
    <li class="cart-card divider">
      <a class="cart-card__image">
        <img src="${img}" alt="${name}" />
      </a>
      <a>
        <h2 class="card__name">${name}</h2>
      </a>
      ${color ? `<p class="cart-card__color">${color}</p>` : ""}
      <p class="cart-card__quantity">qty: ${qty}</p>
      <p class="cart-card__price">$${(price).toFixed(2)}</p>
    </li>
  `;
}

function updateSummary(items) {
  const count = items.reduce((acc, it) => acc + (it.quantity ?? 1), 0);
  const subtotal = items.reduce(
    (acc, it) => acc + resolvePrice(it) * (it.quantity ?? 1),
    0
  );

  const countEl = qs("#summary-count");
  const subEl = qs("#summary-subtotal");
  if (countEl) countEl.textContent = count;
  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
}

async function init() {
  await loadHeaderFooter();

  const listEl = qs(".product-list");
  const items = getLocalStorage("so-cart") ?? [];

  renderListWithTemplate(cartItemTemplate, listEl, items, "afterbegin", true);
  updateSummary(items);
}

init();
