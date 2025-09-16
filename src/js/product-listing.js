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

  const query = getParam("q");              // búsqueda (?q=term)
  const category = getParam("category");   // categoría (?category=tents)

  const titleEl = qs("#listing-title");
  const dataSource = new ProductData();
  const listElement = document.querySelector(".product-list");

  if (query) {
    // 🔎 modo búsqueda
    if (titleEl) titleEl.textContent = `Search results for: "${query}"`;

    try {
      const results = await dataSource.search(query);
      const myList = new ProductList("search", dataSource, listElement);
      myList.renderList(results); // renderizamos directamente resultados
    } catch (err) {
      console.error("Search failed:", err);
      listElement.innerHTML = `<li>No results found for "${query}"</li>`;
    }
  } else {
    // 📂 modo categoría (default: tents)
    const cat = category || "tents";
    if (titleEl) titleEl.textContent = `Top Products: ${cat.replace("-", " ")}`;

    const myList = new ProductList(cat, dataSource, listElement);
    myList.init();
  }
})();


