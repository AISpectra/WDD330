// src/js/ProductData.mjs
const baseURL = import.meta.env.VITE_SERVER_URL; // viene de tu .env

function convertToJson(res) {
  if (res.ok) return res.json();
  throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
}

export default class ProductData {
  constructor() {
    // Ya no guardamos category ni path. Con la API no hacen falta.
  }

  // Obtiene productos por categoría
  async getData(category) {
    const response = await fetch(`${baseURL}products/search/${encodeURIComponent(category)}`);
    const data = await convertToJson(response);
    // La API devuelve { Result: [...] }
    return data.Result;
  }

  // Obtiene detalle por Id
  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${encodeURIComponent(id)}`);
    const data = await convertToJson(response);
    // La API devuelve { Result: {...} } o el objeto directo
    return data.Result ?? data;
  }
}
