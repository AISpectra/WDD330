// src/js/ExternalServices.mjs
const baseURL = import.meta.env.VITE_SERVER_URL; // viene de tu .env

function convertToJson(res) {
  if (res.ok) return res.json();
  throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
}

export default class ExternalServices {
  constructor() {
    // No guardamos categoría; todo se pide dinámicamente
  }

  // Obtiene productos por categoría
  async getData(category) {
    const response = await fetch(
      `${baseURL}products/search/${encodeURIComponent(category)}`
    );
    const data = await convertToJson(response);
    return data.Result;
  }

  // Obtiene detalle por Id
  async findProductById(id) {
    const response = await fetch(
      `${baseURL}product/${encodeURIComponent(id)}`
    );
    const data = await convertToJson(response);
    return data.Result ?? data;
  }

  // 🔎 Búsqueda por término
  async search(term) {
    try {
      const res = await fetch(
        `${baseURL}products/search?q=${encodeURIComponent(term)}`
      );
      const data = await convertToJson(res);
      const result = data.Result ?? [];
      if (Array.isArray(result) && result.length) return result;
    } catch (_) {
      // fallback
    }

    const cats = ["tents", "backpacks", "sleeping-bags", "hammocks"];
    const all = [];
    for (const c of cats) {
      try {
        const res = await fetch(`${baseURL}products/search/${c}`);
        const data = await convertToJson(res);
        all.push(...(data.Result ?? []));
      } catch (_) {}
    }

    const q = term.toLowerCase();
    return all.filter(
      (p) =>
        (p.Name ?? "").toLowerCase().includes(q) ||
        (p.Brand?.Name ?? p.Brand ?? "").toLowerCase().includes(q)
    );
  }

  // 🛒 Enviar orden al backend
  async checkout(orderPayload) {
    const url = `${baseURL}checkout`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    };
    const resp = await fetch(url, options);
    if (!resp.ok) throw new Error(`Checkout failed: ${resp.status}`);
    return await resp.json();
  }
}
