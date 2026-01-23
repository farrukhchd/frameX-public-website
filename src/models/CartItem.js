import CartMaterial from "./CartMaterial";

/**
 * CartItem
 * - Stores a cart line item
 * - toJson() MUST be backend-safe
 */
export default class CartItem {
  constructor({
    productType = "Photo Frame",
    size = "",
    frameSize = "",
    materials = [],
    moulding = null, // can be object or string
    image = "",
    thumb = "",
    costPrice = 0,
    sellingPrice = 0,
    profit = 0,
    quantity = 1,
  } = {}) {
    this.productType = productType;
    this.size = size;
    this.frameSize = frameSize;
    this.materials = Array.isArray(materials)
      ? materials.map((m) => (m instanceof CartMaterial ? m : new CartMaterial(m)))
      : [];
    this.moulding = moulding;
    this.image = image;
    this.thumb = thumb;
    this.costPrice = Number(costPrice || 0);
    this.sellingPrice = Number(sellingPrice || 0);
    this.profit = Number(profit || 0);
    this.quantity = Number(quantity || 1);
  }

  static emptyFrame({
    frameSize = "",
    moulding = null,
    thumb = "",
    costPrice = 0,
    sellingPrice = 0,
    profit = 0,
    quantity = 1,
  } = {}) {
    return new CartItem({
      productType: "Empty Frame",
      size: "",
      frameSize,
      materials: [],
      moulding,
      image: "",
      thumb,
      costPrice,
      sellingPrice,
      profit,
      quantity,
    });
  }

  /**
   * IMPORTANT:
   * Backend expects moulding as STRING.
   * You asked to send CODE instead of id.
   */
  toJson() {
    const mouldingCode =
      typeof this.moulding === "string"
        ? this.moulding
        : this.moulding?.code || null;

    return {
      productType: this.productType,
      size: this.size,
      frameSize: this.frameSize,
      materials: (this.materials || []).map((m) =>
        typeof m?.toJson === "function" ? m.toJson() : m
      ),
      moulding: mouldingCode, // ✅ CODE (string)
      image: this.image,
      thumb: this.thumb,
      costPrice: this.costPrice,
      sellingPrice: this.sellingPrice,
      profit: this.profit,
      quantity: this.quantity,
    };
  }

  /**
   * When reading from storage/server, rebuild a CartItem.
   */
  static fromJson(json) {
    if (!json) return new CartItem();

    return new CartItem({
      productType: json.productType,
      size: json.size,
      frameSize: json.frameSize,
      materials: Array.isArray(json.materials) ? json.materials : [],
      moulding: json.moulding ?? null, // will be string code now
      image: json.image,
      thumb: json.thumb,
      costPrice: json.costPrice,
      sellingPrice: json.sellingPrice,
      profit: json.profit,
      quantity: json.quantity,
    });
  }
}
