import { renderListWithTemplate } from "./utils.mjs";

// plantilla de cada tarjeta de producto
function productCardTemplate(product) {
  // Marca: puede venir como string u objeto
  const brand =
    typeof product.Brand === "string"
      ? product.Brand
      : (product.Brand?.Name || product.Brand?.BrandName || "");

  // Imagen: fuerza ruta absoluta
  const img = product.Image?.startsWith("/") ? product.Image : `/${product.Image}`;

  // Precio: formatea si es número
  const price =
    typeof product.FinalPrice === "number"
      ? product.FinalPrice.toFixed(2)
      : product.FinalPrice;

  return `
    <li class="product-card">
      <a href="/product_pages/index.html?id=${product.Id}">
        <img src="${img}" alt="${product.Name}" />
        ${brand ? `<h3 class="card__brand">${brand}</h3>` : ""}
        <h2 class="card__name">${product.Name}</h2>
        <p class="product-card__price">$${price}</p>
      </a>
    </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;       // "tents"
    this.dataSource = dataSource;   // instancia de ProductData
    this.listElement = listElement; // <ul class="product-list">
    this.list = [];
  }

  async init() {
    this.list = await this.dataSource.getData();
    this.renderList(this.list);
  }

  renderList(list) {
    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      list,
      "afterbegin",
      true
    );
  }
}
