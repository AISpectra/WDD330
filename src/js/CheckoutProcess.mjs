// src/js/CheckoutProcess.mjs
import { getLocalStorage, qs } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

function toMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

export default class CheckoutProcess {
  constructor() {
    this.cart = getLocalStorage("so-cart") || [];
    this.services = new ExternalServices();

    // referencias a la UI
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

    // totales
    this.subtotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.total = 0;
  }

  init() {
    // 1) calcular subtotal al cargar
    this.calcItemSubtotal();
    // 2) estimar tax + shipping + total (puedes recalcular al cambiar zip si quieres)
    this.recalculateTotals();

    // 3) listeners
    if (this.ui.zip) {
      this.ui.zip.addEventListener("input", () => this.recalculateTotals());
    }
    if (this.ui.form) {
      this.ui.form.addEventListener("submit", (e) => this.onSubmit(e));
    }
  }

  // Subtotal de líneas (asumimos qty=1 por ítem en el cart)
  calcItemSubtotal() {
    this.subtotal = this.cart.reduce(
      (sum, item) => sum + Number(item?.FinalPrice ?? 0) * Number(item?.quantity ?? 1),
      0
    );
    // pintar parcial
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

  // Convierte formData -> objeto
  formDataToJSON(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  // Empaqueta items al formato del backend
  packageItems(items) {
    return items.map((p) => ({
      id: p.Id,
      name: p.Name,
      price: Number(p.FinalPrice),
      quantity: Number(p.quantity ?? 1),
    }));
  }

  async onSubmit(e) {
    e.preventDefault();
    this.clearMessage();

    const form = this.ui.form;
    if (!form.checkValidity()) {
      this.showMessage("Please fill out all required fields.", "error");
      // lleva el foco al primer inválido
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // construir payload
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
      shipping: this.shipping,
      tax: this.tax.toFixed(2),
    };

    // bloquear botón mientras se envía
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const resp = await this.services.checkout(orderPayload);
      this.showMessage("Order placed successfully ✅", "success");
      // vaciar carrito si quieres:
      localStorage.removeItem("so-cart");
      // podrías redirigir a una página de confirmación
      // window.location.href = "/checkout/confirmation.html";
    } catch (err) {
      console.error(err);
      this.showMessage("There was a problem submitting your order. Please try again.", "error");
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
