// src/pages/SizeSelection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { fetchPrintSizes } from "../services/apiService";
import "../styles/print-size.css";
import "../styles/meta-strip.css";

function SizeSelection() {
  const navigate = useNavigate();
  const { service } = useParams();

  const isPhotoFrame = service === "photo-frame";
  const isEmptyFrame = service === "empty-frame";
  const isOnlyPrints = service === "only-prints";

  const serviceLabel = isPhotoFrame
    ? "Photo Frame"
    : isOnlyPrints
      ? "Only Prints"
      : isEmptyFrame
        ? "Empty Frame"
        : "Service";


  const title = isEmptyFrame ? "Frame Size" : "Print Size";
  const heading = isEmptyFrame
    ? "Select a frame size"
    : isOnlyPrints
      ? "Select a print size"
      : "Select a print size";
  const fieldLabel = isEmptyFrame ? "Frame size" : "Print size";

  const helperText = isEmptyFrame
    ? "Choose the exact frame size you need. If you already have an artwork, select its size so the frame matches perfectly."
    : "Pick the print size you want. We’ll recommend the best framing options based on your selection.";

  const extraBullets = isEmptyFrame
    ? [
      "If your artwork is slightly smaller, we can use a mat to center it.",
      "All frames are wall-ready and easy to open.",
      "You’ll choose frame color and style on the next step.",
    ]
    : [
      "Higher sizes look better with higher resolution photos.",
      "You can add matting to enhance the presentation.",
      "Final frame price is calculated after frame selection.",
    ];

  // ---------- API-driven sizes (ONLY data source changed; design stays same) ----------
  const [sizes, setSizes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingSizes, setLoadingSizes] = useState(false);

  useEffect(() => {
    let mounted = true;

    setLoadingSizes(true);
    fetchPrintSizes()
      .then((data) => {
        if (!mounted) return;

        // data is already parsed + sorted in apiService
        setSizes(data);

        if (data && data.length > 0) {
          setSelected(data[0]);
        }
      })
      .catch(() => {
        // keep UI intact; you can add toast later
      })
      .finally(() => {
        if (mounted) setLoadingSizes(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // keep the screen stable even if API returns empty array
  const selectedSizeText = selected?.size ?? "-";

  const stickyRightText = isEmptyFrame
    ? "Next: Choose Frame Style"
    : "Next: Choose Quantity";

  return (
    <div className="ps-page">
      <SiteHeader />

      <main className="ps-main">
        <div className="ps-container">
          {/* Desktop layout: 2 columns (copy left, dropdown centered right) */}
          <div className="ps-layout">
            {/* Left info panel */}
            <section className="ps-card ps-info">
              <div className="ps-kicker">{serviceLabel}</div>
              <h1 className="ps-h1">{heading}</h1>
              <p className="ps-sub">{helperText}</p>

              <ul className="ps-bullets">
                {extraBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div className="ps-tip">
                <span className="ps-tipTitle">Tip:</span>{" "}
                {isEmptyFrame
                  ? "Measure your artwork edge-to-edge (width × height)."
                  : "For best results, use a sharp and well-lit photo."}
              </div>
            </section>

            {/* Right selection panel */}
            <section className="ps-card ps-selectCard">
              <div className="ps-selectHeader">
                <div>
                  <div className="ps-selectTitle">{fieldLabel}</div>
                  <div className="ps-selectDesc">
                    {isEmptyFrame
                      ? "Select the size of your frame."
                      : "Select the size of your print."}
                  </div>
                </div>
              </div>

              <div className="ps-selectWrap">
                <label className="ps-label" htmlFor="sizeSelect">
                  {fieldLabel}
                </label>

                <div className="ps-selectRow">
                  <select
                    id="sizeSelect"
                    className="ps-select"
                    value={selected?.id || ""}
                    disabled={loadingSizes || sizes.length === 0}
                    onChange={(e) => {
                      const next = sizes.find((s) => s.id === e.target.value);
                      if (next) setSelected(next);
                    }}
                  >
                    {sizes.length === 0 ? (
                      <option value="">
                        {loadingSizes ? "Loading sizes..." : "No sizes available"}
                      </option>
                    ) : (
                      sizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.size}
                        </option>
                      ))
                    )}
                  </select>

                  <span className="ps-chevron" aria-hidden>
                    ▾
                  </span>
                </div>
              </div>

              <div className="ps-priceBlock">
                <div className="ps-priceValue">
                  {isEmptyFrame
                    ? selected?.size ?? "-"
                    : selected
                      ? `Rs. ${Number(selected.price).toFixed(0)}`
                      : "-"}
                </div>

                <div className="ps-priceNote">
                  {isEmptyFrame
                    ? "Frame price is calculated after selecting frame style and material."
                    : isOnlyPrints
                      ? "This is print price per photo. You’ll crop next and then add to cart."
                      : "This is only print price. Total frame price is calculated after frame selection."}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="ps-sticky">
        <div className="ps-container ps-stickyInner">

          <button
            className="ps-next"
            type="button"
            disabled={loadingSizes || !selected}
            onClick={() => {
              // Empty frame goes to frame-style later; photo-frame/prints go to quantity
              if (isEmptyFrame) {
                alert("Next: Choose Frame Style (to be built)");
                return;
              }

              navigate(`/start-framing/quantity/${service}`, {
                state: {
                  service, // "photo-frame" | "only-prints" | "empty-frame"
                  selectedSize: selected, // {id,size,price,cost,sort}
                  artType: serviceLabel, // e.g. "Photo Frame"
                  artSize: selected?.size, // same as flutter override
                  printPrice: selected?.price ?? 0,
                  printCost: selected?.cost ?? 0,
                },
              });
            }}
          >
            {stickyRightText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SizeSelection;
