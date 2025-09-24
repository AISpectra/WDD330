// src/js/checkout.js
import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

(async () => {
  try {
    await loadHeaderFooter();
  } catch (e) {
    console.warn("Header/Footer failed to load:", e);
  }

  // Inicializa el flujo de checkout. Dentro de CheckoutProcess.init()
  // se debe enganchar el submit del formulario (#checkout-form)
  // y manejar la validación, el checkout y la redirección a success.
  const cp = new CheckoutProcess();
  cp.init();
})();

