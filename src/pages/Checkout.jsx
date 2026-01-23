import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import CartStore from "../store/CartStore";
import OrderRequest from "../models/OrderRequest";
import { fetchCities, createOrder } from "../services/apiService";

const normalize = (s) => String(s || "").trim().toLowerCase();
const moneyPKR = (n) => `Rs. ${Math.round(Number(n || 0)).toLocaleString("en-PK")}`;

function isValidPkPhone(v) {
  return /^03\d{9}$/.test(String(v || "").trim());
}

export default function Checkout() {
  const navigate = useNavigate();

  // Your CartStore is not reactive, so we refresh like CartBottomSheet does (poll).
  const [items, setItems] = useState(CartStore.getItems());
  useEffect(() => {
    const t = setInterval(() => setItems(CartStore.getItems()), 400);
    return () => clearInterval(t);
  }, []);

  const subtotal = useMemo(() => CartStore.getTotal(), [items]);

  const totalQty = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
    [items]
  );

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Cities
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);

  // UI
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCities(true);
      setError("");
      try {
        const list = await fetchCities();
        if (!alive) return;
        setCities(list);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || String(e));
      } finally {
        if (alive) setLoadingCities(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Delivery: same rules as Dart
  const deliveryCharges = useMemo(() => {
    if (!selectedCity) return null; // show "—" until city selected
    if (totalQty >= 3) return 0;
    if (normalize(selectedCity) === "lahore") return 300;
    return 400;
  }, [selectedCity, totalQty]);

  const grandTotal = useMemo(() => {
    if (deliveryCharges == null) return null;
    return subtotal + deliveryCharges;
  }, [subtotal, deliveryCharges]);

  const validate = () => {
    if (!items.length) return "Cart is empty";
    if (!name.trim()) return "Name is required";
    if (!phone.trim()) return "Phone number required";
    if (!isValidPkPhone(phone)) return "Enter valid phone (11 digits, starts with 03)";
    if (!address.trim()) return "Address is required";
    if (!selectedCity) return "City is required";
    return "";
  };

  const placeOrder = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const req = new OrderRequest({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: selectedCity,
        paymentType: "COD",
        advance: 0,
        sendSMS: true,
        items, // CartItem objects -> toJson() exists (good) :contentReference[oaicite:0]{index=0}
        total: Number(grandTotal || 0),
        deliveryCharges: Number(deliveryCharges || 0),
        orderType: "normal",
        notes: notes.trim(),
      });

      const orderId = await createOrder(req.toJson());

      alert(`✅ Order placed successfully: ${orderId}`);

      CartStore.clear(); // your store supports this :contentReference[oaicite:1]{index=1}
      setItems(CartStore.getItems());

      // back to first step
      navigate("/start-framing", { replace: true });
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              border: "1px solid #ddd",
              background: "#fff",
              padding: "10px 12px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0 }}>Checkout</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 16 }}>
          {/* LEFT */}
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Order Summary</h3>

            {items.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {items.map((i, idx) => (
                  <div key={idx} style={rowStyle}>
                    <img
                      src={i.thumb || "https://placehold.co/120x120?text=FrameX"}
                      alt=""
                      style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>{i?.moulding?.name || i.productType}</div>
                      <div style={{ fontSize: 13, opacity: 0.75 }}>
                        {i.size} • Frame: {i.frameSize} • Qty {i.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 900 }}>{moneyPKR(i.sellingPrice * i.quantity)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 12, border: "1px dashed #ddd", borderRadius: 12 }}>
                Your cart is empty.
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0" }} />

            <h3>Customer Details</h3>

            {error ? (
              <div style={{ background: "#fff3f3", border: "1px solid #ffd1d1", padding: 10, borderRadius: 10, marginBottom: 12 }}>
                ❌ {error}
              </div>
            ) : null}

            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
              </Field>

              <Field label="Phone Number">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03314126391"
                  style={inputStyle}
                />
              </Field>

              <Field label="Address">
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={inputStyle} />
              </Field>

              <Field label="City">
                {loadingCities ? (
                  <div style={{ padding: 10 }}>Loading cities…</div>
                ) : (
                  <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={inputStyle}>
                    <option value="">Select city</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field label="Notes (Optional)">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ position: "sticky", top: 12, alignSelf: "start" }}>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>Total</h3>

              <Line label="Subtotal" value={moneyPKR(subtotal)} />
              <Line
                label="Delivery"
                value={
                  deliveryCharges == null
                    ? "—"
                    : deliveryCharges === 0
                    ? "Free"
                    : moneyPKR(deliveryCharges)
                }
              />

              <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />

              <Line
                label={<b>Total</b>}
                value={
                  grandTotal == null ? "—" : <b style={{ fontSize: 18 }}>{moneyPKR(grandTotal)}</b>
                }
              />

              <button
                type="button"
                onClick={placeOrder}
                disabled={placing || !items.length}
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "14px 14px",
                  borderRadius: 12,
                  border: "none",
                  cursor: placing ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  background: "#f4c542",
                }}
              >
                {placing ? "Placing Order…" : "Place Order"}
              </button>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                Payment Type: <b>COD</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

function Line({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
      <div style={{ opacity: 0.8 }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,.06)",
};

const rowStyle = {
  display: "flex",
  gap: 12,
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 12,
  alignItems: "center",
};

const inputStyle = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #e8e8e8",
  outline: "none",
};
