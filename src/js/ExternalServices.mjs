// src/js/ExternalServices.mjs
const baseURL = import.meta.env.VITE_SERVER_URL; // from .env

// Parse body always; if not ok, throw a rich error object with the server JSON
export async function convertToJson(res) {
  const text = await res.text(); // read body even on 4xx
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text || "Unknown error" };
  }

  if (res.ok) return json;

  // Propagate details so UI can show specific messages (e.g., "Invalid Card Number")
  throw {
    name: "servicesError",
    status: res.status,
    message: json, // often { errors: [...] } or { message: "..." }
  };
}

export default class ExternalServices {
  // Productos por categoría
  async getData(category) {
    const response = await fetch(
      `${baseURL}products/search/${encodeURIComponent(category)}`
    );
    const data = await convertToJson(response);
    return data.Result;
  }

  // Detalle por Id
  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${encodeURIComponent(id)}`);
    const data = await convertToJson(response);
    return data.Result ?? data;
  }

  // 🔎 Búsqueda por término (intenta endpoint global y si no, fallback por categorías)
  async search(term) {
    try {
      const res = await fetch(
        `${baseURL}products/search?q=${encodeURIComponent(term)}`
      );
      const data = await convertToJson(res);
      const result = data.Result ?? [];
      if (Array.isArray(result) && result.length) return result;
    } catch {
      // fallback below
    }

    const cats = ["tents", "backpacks", "sleeping-bags", "hammocks"];
    const all = [];
    for (const c of cats) {
      try {
        const res = await fetch(`${baseURL}products/search/${c}`);
        const data = await convertToJson(res);
        all.push(...(data.Result ?? []));
      } catch {
        // ignore category failures
      }
    }

    const q = term.toLowerCase();
    return all.filter(
      (p) =>
        (p.Name ?? "").toLowerCase().includes(q) ||
        (p.Brand?.Name ?? p.Brand ?? "").toLowerCase().includes(q)
    );
  }

  // 🛒 Enviar orden al backend (POST) y devolver la respuesta o lanzar error con detalles
  async checkout(orderPayload) {
    const url = `${baseURL}checkout`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    };
    const res = await fetch(url, options);
    return convertToJson(res); // success => JSON; error => throws { name, status, message }
  }
}

