// src/js/product-listing.js
import { loadHeaderFooter, getParam, qs } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

(async function init() {
  try {
    // carga header/footer; si falla, no bloquea el resto
    await loadHeaderFooter();
  } catch (err) {
    console.error("Header/Footer load failed:", err);
  }

  const category = getParam("category") || "tents";

  // título dinámico
  const titleEl = qs("#listing-title");
  if (titleEl) titleEl.textContent = `Top Products: ${category.replace("-", " ")}`;

  const dataSource = new ProductData(); // sin categoría
  const listElement = document.querySelector(".product-list");

  const myList = new ProductList(category, dataSource, listElement);
  myList.init();
})();

