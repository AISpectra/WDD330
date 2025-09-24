// src/js/CheckoutProcess.mjs
import { getLocalStorage, qs } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

function toMoney(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

export default class CheckoutProcess {
  constructor() {
    this.cart = getLocalStorage("so-cart") || [];
    this.services = new ExternalServices();

    // Referencias UI
    this.ui = {
      count: qs("#summary-count"),
      subtotal: qs("#summary-subtotal"),
      tax: qs("#summary-tax"),
      shipping: qs("#summary-shipping"),
      total: qs("#summary-total"),
      form: qs("#checkout-form"),
      zip: qs("#zip"),
      msg: qs("#checkout-message"),
    };

    // Totales
    this.subtotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.total = 0;
  }

  init() {
    // 1) calcular subtotal al cargar
    this.calcItemSubtotal();
    // 2) calcular tax + shipping + total
    this.recalculateTotals();

    // 3) listeners
    if (this.ui.zip) {
      this.ui.zip.addEventListener("input", () => this.recalculateTotals());
    }
    if (this.ui.form) {
      this.ui.form.addEventListener("submit", (e) => this.onSubmit(e));
    }
  }

  // Subtotal de líneas (qty=1 por ítem salvo que venga quantity)
  calcItemSubtotal() {
    this.subtotal = this.cart.reduce((sum, item) => {
      const unit =
        Number(item?.FinalPrice) ||
        Number(item?.price) ||
        0;
      const qty = Number(item?.quantity ?? 1);
      return sum + unit * qty;
    }, 0);

    if (this.ui.count) this.ui.count.textContent = this.cart.length;
    if (this.ui.subtotal) this.ui.subtotal.textContent = toMoney(this.subtotal);
  }

  // Tax 6% + Shipping ($10 el primero + $2 cada adicional) + Total
  recalculateTotals() {
    const itemsCount = this.cart.length;
    this.shipping = itemsCount > 0 ? 10 + Math.max(0, itemsCount - 1) * 2 : 0;
    this.tax = this.subtotal * 0.06;
    this.total = this.subtotal + this.tax + this.shipping;

    if (this.ui.tax) this.ui.tax.textContent = toMoney(this.tax);
    if (this.ui.shipping) this.ui.shipping.textContent = toMoney(this.shipping);
    if (this.ui.total) this.ui.total.textContent = toMoney(this.total);
  }

  // Convierte formData -> objeto plano
  formDataToJSON(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  // Empaqueta items al formato del backend
  packageItems(items) {
    return items.map((p) => ({
      id: p.Id ?? p.id,
      name: p.Name ?? p.name ?? "",
      price: Number(p.FinalPrice ?? p.price ?? 0),
      quantity: Number(p.quantity ?? 1),
    }));
  }

  async onSubmit(e) {
    e.preventDefault();
    this.clearMessage();

    const form = this.ui.form;
    if (!form) return;

    // Validación nativa
    if (!form.checkValidity()) {
      form.reportValidity?.();
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      this.showMessage("Please fill out all required fields.", "error");
      return;
    }

    // Construir payload
    const data = this.formDataToJSON(form);
    const orderPayload = {
      orderDate: new Date().toISOString(),
      fname: data.fname,
      lname: data.lname,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zip,
      cardNumber: data.cardNumber,
      expiration: data.expiration,
      code: data.code,
      items: this.packageItems(this.cart),
      orderTotal: this.total.toFixed(2),
      shipping: Number(this.shipping),
      tax: this.tax.toFixed(2),
    };

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await this.services.checkout(orderPayload);
      // Éxito: limpiar carrito y redirigir
      localStorage.removeItem("so-cart");
      window.location.href = "/checkout/success.html";
    } catch (err) {
      // err.message puede ser string u objeto (si viene del backend)
      console.error("Checkout failed:", err);
      const friendly =
        (typeof err?.message === "string" && err.message) ||
        err?.message?.message ||
        err?.message?.errors ||
        "There was a problem submitting your order. Please try again.";
      this.showMessage(friendly, "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  showMessage(text, type = "info") {
    if (!this.ui.msg) return;
    this.ui.msg.textContent = text;
    this.ui.msg.className = `status ${type}`;
  }

  clearMessage() {
    if (!this.ui.msg) return;
    this.ui.msg.textContent = "";
    this.ui.msg.className = "status";
  }
}
