import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

// fuente de datos (tents.json)
const dataSource = new ProductData("tents");

// el UL de index.html
const listElement = document.querySelector(".product-list");

// pinta la lista
const productList = new ProductList("tents", dataSource, listElement);
productList.init();
