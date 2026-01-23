export default class CartMaterial {
  constructor({ name = "", variant = "" }) {
    this.name = name;
    this.variant = variant;
  }

  toJson() {
    return {
      name: this.name,
      variant: this.variant,
    };
  }

  static fromJson(json = {}) {
    return new CartMaterial({
      name: json.name ?? "",
      variant: json.variant ?? "",
    });
  }
}
