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
    const response = await fetch(
      `${baseURL}products/search/${encodeURIComponent(category)}`
    );
    const data = await convertToJson(response);
    // La API devuelve { Result: [...] }
    return data.Result;
  }

  // Obtiene detalle por Id
  async findProductById(id) {
    const response = await fetch(
      `${baseURL}product/${encodeURIComponent(id)}`
    );
    const data = await convertToJson(response);
    // La API devuelve { Result: {...} } o el objeto directo
    return data.Result ?? data;
  }

  // 🔎 NUEVO: búsqueda por término
  async search(term) {
    // 1) Intentamos endpoint de búsqueda global (si existe)
    try {
      const res = await fetch(
        `${baseURL}products/search?q=${encodeURIComponent(term)}`
      );
      const data = await convertToJson(res);
      const result = data.Result ?? [];
      if (Array.isArray(result) && result.length) return result;
    } catch (e) {
      // ignoramos si falla y seguimos al fallback
    }

    // 2) Fallback: descargar todas las categorías y filtrar en cliente
    const cats = ["tents", "backpacks", "sleeping-bags", "hammocks"];
    const all = [];
    for (const c of cats) {
      try {
        const res = await fetch(`${baseURL}products/search/${c}`);
        const data = await convertToJson(res);
        all.push(...(data.Result ?? []));
      } catch (_) {
        // si falla una categoría la ignoramos
      }
    }

    const q = term.toLowerCase();
    return all.filter(
      (p) =>
        (p.Name ?? "").toLowerCase().includes(q) ||
        (p.Brand?.Name ?? p.Brand ?? "").toLowerCase().includes(q)
    );
  }
}

