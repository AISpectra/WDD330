import { loadHeaderFooter } from "./utils.mjs";
loadHeaderFooter();

import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

// fuente de datos (tents.json)
const dataSource = new ProductData("tents");

// leer el id desde la URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// contenedor donde vamos a mostrar el detalle
const productContainer = document.querySelector("#product-detail");

function productTemplate(product) {
  return `
    <article class="product">
      <img src="${product.Image}" alt="${product.Name}">
      <h1>${product.Name}</h1>
      <p class="brand">${product.Brand ?? ""}</p>
      <p class="price">$${product.FinalPrice}</p>
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </article>`;
}

function addProductToCart(product) {
  const cartItems = getLocalStorage("so-cart") || [];
  cartItems.push(product);
  setLocalStorage("so-cart", cartItems);
}

async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

async function init() {
  const product = await dataSource.findProductById(productId);
  productContainer.innerHTML = productTemplate(product);

  // ahora que ya está en el DOM el botón, agregamos el listener
  document
    .getElementById("addToCart")
    .addEventListener("click", addToCartHandler);
}

init();
