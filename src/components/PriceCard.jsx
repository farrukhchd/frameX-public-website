import React from "react";
import { moneyPKR } from "../utils/pricingUtils";

export default function PriceCard({ total, uploading, uploadProgress, onAddToCart }) {
  return (
    <div className="fp3-card fp3-priceCard">
      <div className="fp3-priceRowModern">
        <div className="fp3-totalLbl">Total</div>
        <div className="fp3-priceValModern">{total == null ? "—" : moneyPKR(total)}</div>
      </div>

      <button
        className="fp3-ctaModern"
        type="button"
        disabled={uploading}
        onClick={onAddToCart}
        title={uploading ? `Uploading… ${uploadProgress}%` : "Add to cart"}
      >
        {uploading
          ? `UPLOADING… ${uploadProgress}%`
          : `ADD TO CART — ${total == null ? "Continue" : moneyPKR(total)}`}
      </button>
    </div>
  );
}
