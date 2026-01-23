import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartStore, { CART_UPDATED_EVENT } from "../store/CartStore";
import "../styles/cart-sheet.css";

/* =========================
   Public helpers
   ========================= */
export function showCartSheet() {
  const el = document.getElementById("cart-sheet-root");
  if (!el) return;
  el.classList.add("open");
}

export function hideCartSheet() {
  const el = document.getElementById("cart-sheet-root");
  if (!el) return;
  el.classList.remove("open");
}

/* =========================
   Component
   ========================= */
export default function CartBottomSheet() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => CartStore.getItems());

  // ✅ instant updates across app
  useEffect(() => {
    const sync = () => setItems(CartStore.getItems());
    sync();

    window.addEventListener(CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CART_UPDATED_EVENT, sync);
  }, []);

  const total = useMemo(() => CartStore.getTotal(), [items]);

  return (
    <div
      id="cart-sheet-root"
      className="cartSheet"
      onClick={(e) => {
        if (e.target.id === "cart-sheet-root") hideCartSheet();
      }}
    >
      <div className="cartSheetCard">
        {/* Header */}
        <div className="cartSheetHeader">
          <h3>Cart</h3>
          <button type="button" onClick={hideCartSheet}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="cartSheetBody">
          {items.length === 0 ? (
            <div className="cartEmpty">Your cart is empty.</div>
          ) : (
            items.map((i, idx) => (
              <div key={idx} className="cartItemRow">
                <img
                  src={i.thumb || "https://placehold.co/120x120?text=FrameX"}
                  alt=""
                />

                <div className="cartItemMid">
                  <div className="cartItemTitle">{i.productType}</div>
                  <small className="cartItemSub">
                    Size: {i.size} • Frame: {i.frameSize} • Qty {i.quantity}
                  </small>
                </div>

                <div className="cartItemRight">
                  <strong>
                    Rs. {Math.round(i.sellingPrice * i.quantity)}
                  </strong>

                  <button
                    className="cartRemove"
                    type="button"
                    onClick={() => CartStore.removeItem(idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cartSheetFooter">
          <div className="cartTotal">
            Total: <strong>Rs. {Math.round(total)}</strong>
          </div>

          <button
            className="primary"
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              hideCartSheet();
              navigate("/checkout", {
                state: {
                  items: CartStore.getItems(),
                  total: CartStore.getTotal(),
                },
              });
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
