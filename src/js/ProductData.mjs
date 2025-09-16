import { loadHeaderFooter } from "./utils.mjs";
loadHeaderFooter();

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  constructor(category) {
    this.category = category;
    // 👇 ahora toma los JSON desde /public/json
    this.path = `/json/${this.category}.json`;
  }

  getData() {
    return fetch(this.path)
      .then(convertToJson)
      .then((data) => data);
  }

  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }
}
