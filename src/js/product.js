// product.js
import { loadHeaderFooter, getParam, getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ExternalServices.mjs";

loadHeaderFooter();

// 👉 la nueva clase ProductData YA NO recibe categoría.
//    (usa el baseURL de .env y pide por id cuando hace falta)
const dataSource = new ProductData();

// lee el id desde la URL. Aceptamos ?product=... o ?id=...
const productId = getParam("product") || getParam("id");

// contenedor del detalle
const productContainer = document.querySelector("#product-detail");

// utilidades de formateo y extracción
function formatPrice(value) {
  if (typeof value === "number") return value.toFixed(2);
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : value ?? "";
}

function getBrand(product) {
  return (
    product?.Brand?.Name ||
    product?.Brand?.BrandName ||
    product?.Brand ||
    ""
  );
}

function getImage(product) {
  // Con el API nuevo suele venir PrimaryLarge para detalle.
  // Dejamos fallbacks por si acaso.
  return (
    product?.PrimaryLarge ||
    product?.PrimaryMedium ||
    product?.Image ||
    product?.Images?.PrimaryLarge ||
    product?.Images?.Primary?.Large ||
    "" // último recurso
  );
}

function productTemplate(product) {
  const img = getImage(product);
  const brand = getBrand(product);
  const price = formatPrice(product?.FinalPrice ?? product?.ListPrice);

  return `
    <article class="product">
      ${img ? `<img src="${img}" alt="${product?.Name ?? ""}">` : ""}
      <h1>${product?.Name ?? ""}</h1>
      ${brand ? `<p class="brand">${brand}</p>` : ""}
      ${price ? `<p class="price">$${price}</p>` : ""}
      <button id="addToCart" data-id="${product?.Id}">Add to Cart</button>
    </article>`;
}

function addProductToCart(product) {
  const cartItems = getLocalStorage("so-cart") || [];
  cartItems.push(product);
  setLocalStorage("so-cart", cartItems);
}

async function addToCartHandler(e) {
  try {
    const id = e.target.dataset.id;
    if (!id) return;
    const product = await dataSource.findProductById(id);
    if (!product) return;
    addProductToCart(product);
    // (opcional) feedback rápido al usuario
    e.target.textContent = "Added!";
    setTimeout(() => (e.target.textContent = "Add to Cart"), 800);
  } catch (err) {
    console.error("Add to cart failed:", err);
  }
}

async function init() {
  try {
    if (!productId) {
      productContainer.innerHTML = `<p>Missing product id.</p>`;
      return;
    }

    const product = await dataSource.findProductById(productId);
    if (!product) {
      productContainer.innerHTML = `<p>Product not found.</p>`;
      return;
    }

    productContainer.innerHTML = productTemplate(product);

    // listener del botón (ya existe tras render)
    document
      .getElementById("addToCart")
      .addEventListener("click", addToCartHandler);
  } catch (err) {
    console.error(err);
    productContainer.innerHTML = `<p>There was a problem loading the product.</p>`;
  }
}

init();
