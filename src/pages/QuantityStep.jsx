// src/pages/QuantityStep.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import "../styles/quantity.css";
import "../styles/meta-strip.css";

// IMPORTANT: ps-kicker styles live in print-size.css.
// Since this screen uses ps-kicker, we import that CSS too (no design change, only reuse).
import "../styles/print-size.css";

export default function QuantityStep() {
  const navigate = useNavigate();
  const { service } = useParams();
  const location = useLocation();

  // Data passed from SizeSelection
  const payload = location.state;

  // Guard: if user refreshes, route state is lost
  if (!payload?.selectedSize) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <SiteHeader />
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 18, textAlign: "center" }}>
          <div style={{ background: "#fff", border: "1px solid #eaeaea", padding: 24 }}>
            <h2 style={{ margin: 0 }}>Session expired</h2>
            <p style={{ marginTop: 10, color: "rgba(11,10,9,.7)", lineHeight: 1.6 }}>
              Please start again to continue your order.
            </p>
            <button
              style={{
                marginTop: 14,
                background: "#0B0A09",
                color: "#fff",
                border: "1px solid rgba(0,0,0,.2)",
                padding: "12px 16px",
                fontWeight: 900,
                cursor: "pointer",
              }}
              onClick={() => navigate("/start-framing")}
            >
              Start Framing
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { selectedSize, artType, artSize, printPrice } = payload;

  const serviceLabel =
    service === "photo-frame"
      ? "Photo Frame"
      : service === "empty-frame"
      ? "Empty Frame"
      : "Only Prints";

  const qtyOptions = useMemo(() => [1, 2, 3, 4, 5, 10, 15, 20], []);
  const [qty, setQty] = useState(1);

  const subtotal = Number(printPrice || 0) * qty; // still passed forward (not shown)

  return (
    <div className="qt-page">
      <SiteHeader />

      <div className="qt-container qt-centerAll">


        {/* Main card */}
        <div className="qt-card qt-cardCentered">
          {/* Reuse the same kicker style used on SizeSelection */}
          <div className="ps-kicker" style={{ marginBottom: 10 }}>
            {serviceLabel}
          </div>

          <h1 className="qt-h1 qt-center">Choose quantity</h1>

          <p className="qt-sub qt-center">
            Select how many copies you want. You can change this later before placing the final order.
          </p>

          <div className="qt-picker qt-pickerCentered">
            <div className="qt-stepper qt-stepperCentered">
              <button
                className="qt-stepBtn"
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>

              <div className="qt-stepValue">{qty}</div>

              <button className="qt-stepBtn" type="button" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>

            <div className="qt-quick qt-quickCentered">
              {qtyOptions.map((n) => (
                <button
                  key={n}
                  className={`qt-chip ${qty === n ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setQty(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="qt-sticky">
        <div className="qt-container qt-stickyInner">


<button
  className="qt-next"
  type="button"
onClick={() => {
  navigate(`/start-framing/photos/${service}`, {
    state: {
      ...payload,
      quantity: qty,
      subtotal, // keep for later
    },
  });
}}
>
  Next: Choose Photos
</button>

        </div>
      </div>
    </div>
  );
}
