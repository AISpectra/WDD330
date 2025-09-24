// src/js/checkout.js
import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

// evita top-level await en build
(async () => {
  try {
    await loadHeaderFooter();
  } catch (e) {
    console.warn("Header/Footer failed to load:", e);
  }

  const cp = new CheckoutProcess();
  cp.init();
})();
