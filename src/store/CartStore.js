import CartItem from "../models/CartItem";

const STORAGE_KEY = "framex_cart_v1";
export const CART_UPDATED_EVENT = "framex:cart-updated";

class CartStore {
  constructor() {
    this.items = [];
    this._load();
  }

  /* ---------- persistence ---------- */
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.items = parsed.map((i) => CartItem.fromJson(i));
    } catch (e) {
      console.error("Failed to load cart:", e);
      this.items = [];
    }
  }

  _emit() {
    // ✅ lets header, bottom sheet, checkout etc update instantly
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  }

  _save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.items.map((i) => i.toJson()))
    );
    this._emit(); // ✅ IMPORTANT
  }

  /* ---------- API ---------- */
  getItems() {
    return [...this.items];
  }

  getCount() {
    return this.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  }

  getTotal() {
    return this.items.reduce(
      (sum, i) => sum + Number(i.sellingPrice || 0) * (Number(i.quantity) || 0),
      0
    );
  }

  addItem(item) {
    this.items.push(item);
    this._save();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this._save();
  }

  updateQuantity(index, qty) {
    if (!this.items[index]) return;
    this.items[index].quantity = Math.max(1, Number(qty) || 1);
    this._save();
  }

  clear() {
    this.items = [];
    this._save();
  }
}

/* ---------- singleton ---------- */
const cartStore = new CartStore();
export default cartStore;
