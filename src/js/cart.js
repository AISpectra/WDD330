import { loadHeaderFooter } from "./utils.mjs";
loadHeaderFooter();

import { getLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
}

function cartItemTemplate(item) {
  // Imagen: asegurar ruta absoluta
  const img = item.Image?.startsWith("/") ? item.Image : `/${item.Image}`;

  // Color: evitar error si Colors no existe
  const color = item.Colors?.[0]?.ColorName ?? "";

  // Precio: si es número, lo formatea
  const price =
    typeof item.FinalPrice === "number"
      ? item.FinalPrice.toFixed(2)
      : item.FinalPrice;

  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${img}" alt="${item.Name}" />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${color}</p>
    <p class="cart-card__quantity">qty: 1</p>
    <p class="cart-card__price">$${price}</p>
  </li>`;
}

renderCartContents();
