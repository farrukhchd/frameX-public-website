// src/pages/FrameSelection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { fetchMouldings } from "../services/apiService";
import "../styles/frame-selection.css";
import "../styles/quantity.css"; // reuse qt-meta strip styles
import "../styles/meta-strip.css";

export default function FrameSelection() {
  const navigate = useNavigate();
  const { service } = useParams();
  const location = useLocation();

  const payload = location.state;

  // Guard: if user refreshes and state is gone
  if (!payload?.selectedSize) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <SiteHeader />
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 18, textAlign: "center" }}>
          <div style={{ background: "#fff", border: "1px solid #eaeaea", padding: 24 }}>
            <h2 style={{ margin: 0 }}>Session expired</h2>
            <p style={{ marginTop: 10, color: "rgba(11,10,9,.7)", lineHeight: 1.6 }}>
              Please start again to continue.
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

  const { artType, artSize } = payload;

  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null); // null = All

  const colorFilters = useMemo(
    () => [
      { name: "All", color: null },
      { name: "White", color: "#ffffff" },
      { name: "Black", color: "#000000" },
      { name: "Golden", color: "#FFD700" },
      { name: "Brown", color: "#8B4513" },
      { name: "Silver", color: "#C0C0C0" },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchMouldings()
      .then((data) => mounted && setFrames(Array.isArray(data) ? data : []))
      .catch(() => mounted && setFrames([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filteredFrames = useMemo(() => {
    if (!selectedColor) return frames;
    const target = selectedColor.toLowerCase();
    return frames.filter((f) => (f.color ?? "").toLowerCase() === target);
  }, [frames, selectedColor]);

  const onSelectFrame = (frame) => {
    navigate(`/start-framing/frame-preview/${service}`, {
      state: {
        ...payload,
        frame,
      },
    });
  };

  return (
    <div className="fs-page">
      <SiteHeader />

      <div className="fs-shell">

        {/* ✅ White box wrapper like previous pages */}
        <div className="fs-panel">
          {/* Title */}
          <div className="fs-titleRow">
            <h1 className="fs-title">Select Frame</h1>
            <p className="fs-sub">
              Choose a style you love. Use color filters to narrow down options.
            </p>
          </div>

          {/* Color Filters */}
          <div className="fs-filters" aria-label="Frame color filters">
            <div className="fs-filterTrack">
              {colorFilters.map((f) => {
                const isActive =
                  (selectedColor === null && f.name === "All") ||
                  (selectedColor !== null && selectedColor === f.name);

                return (
                  <button
                    key={f.name}
                    type="button"
                    className={`fs-filter ${isActive ? "is-active" : ""}`}
                    onClick={() => setSelectedColor(f.name === "All" ? null : f.name)}
                  >
                    <span
                      className="fs-dot"
                      style={{ background: f.color ?? "transparent" }}
                      aria-hidden
                    >
                      {f.color === null ? "∞" : ""}
                    </span>
                    <span className="fs-filterName">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          <div className="fs-listWrap">
            {loading ? (
              <div className="fs-loading">Loading frames…</div>
            ) : (
              <div className="fs-list">
                {filteredFrames.map((frame) => (
                  <button
                    key={frame.id}
                    type="button"
                    className="fs-card"
                    onClick={() => onSelectFrame(frame)}
                  >
                    <div className="fs-thumb">
                      <img
                        src={frame.cornerImage || "https://placehold.co/160x160?text=Frame"}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/160x160?text=Frame";
                        }}
                      />
                    </div>

                    <div className="fs-body">
                      <div className="fs-name">{frame.name}</div>
                      {frame.tagline ? <div className="fs-tagline">{frame.tagline}</div> : null}

                      <div className="fs-metaLine">
                        <span className="fs-metaKey2">Material:</span>
                        <span className="fs-metaVal2">{frame.material || "-"}</span>
                      </div>
                    </div>

                    <div className="fs-arrow" aria-hidden>
                      ›
                    </div>
                  </button>
                ))}

                {!loading && filteredFrames.length === 0 ? (
                  <div className="fs-empty">No frames found for this filter.</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
