import React from "react";
import { moneyPKR } from "../utils/pricingUtils";

export default function PriceCard({ total, uploading, uploadProgress, onAddToCart }) {
  return (
    <div className="fx-stickyFooter">
      <div className="fx-footerInner">
        <div className="fx-priceBlock">
          <div className="fx-priceLabel">Total</div>
          <div className="fx-priceValue">{total == null ? "—" : moneyPKR(total)}</div>
        </div>

        <button
          className="fx-cta"
          type="button"
          disabled={uploading}
          onClick={onAddToCart}
          title={uploading ? `Uploading… ${uploadProgress}%` : "Add to cart"}
        >
          {uploading ? `Uploading… ${uploadProgress}%` : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
