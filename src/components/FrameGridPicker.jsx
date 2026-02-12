import React, { useEffect, useMemo, useState } from "react";
import { fetchMouldings } from "../services/apiService";

function resolveMediaUrl(url) {
  if (!url) return null;
  const u = String(url).trim();
  if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("blob:")) return u;
  if (u.startsWith("//")) return `${window.location.protocol}${u}`;
  if (u.startsWith("/")) return u;
  return `/${u.replace(/^\/+/, "")}`;
}

// Map your API color names to UI labels + a display swatch color
const COLOR_OPTIONS = [
  { key: "All", label: "All", swatch: null },
  { key: "Black", label: "Black", swatch: "#111111" },
  { key: "White", label: "White", swatch: "#f6f6f6" },
  { key: "Brown", label: "Brown", swatch: "#7a4a2a" },
  { key: "Golden", label: "Gold", swatch: "#c9a227" },
  { key: "Silver", label: "Silver", swatch: "#b9bcc3" },
];

export default function FrameGridPicker({
  selectedFrame,
  onSelect,
  title = "Frames",
  subtitle = "Choose a frame color, then pick a style.",
}) {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedColor, setSelectedColor] = useState("All");

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

  const filtered = useMemo(() => {
    const color = (selectedColor || "All").toLowerCase();

    return frames.filter((f) => {
      if (color === "all") return true;
      return (f.color || "").toLowerCase() === color;
    });
  }, [frames, selectedColor]);

  return (
    <section className="fx-card fx-section">
      <header className="fx-sectionHead">
        <div className="fx-sectionTitle">{title}</div>
        <div className="fx-sectionSub">{subtitle}</div>
      </header>

      {/* ✅ Color row (no search) */}
      <div className="fx-colorRow" role="tablist" aria-label="Frame colors">
        {COLOR_OPTIONS.map((c) => {
          const active = selectedColor === c.key;

          // "All" is a special pill button
          if (c.key === "All") {
            return (
              <button
                key={c.key}
                type="button"
                className={`fx-colorAll ${active ? "is-active" : ""}`}
                onClick={() => setSelectedColor(c.key)}
                role="tab"
                aria-selected={active}
              >
                All
              </button>
            );
          }

          return (
            <button
              key={c.key}
              type="button"
              className={`fx-colorDot ${active ? "is-active" : ""}`}
              onClick={() => setSelectedColor(c.key)}
              role="tab"
              aria-selected={active}
              title={c.label}
            >
              <span
                className="fx-colorDotFill"
                style={{
                  background: c.swatch,
                  borderColor: c.key === "White" ? "rgba(0,0,0,.18)" : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Frames */}
      {loading ? (
        <div className="fx-skeletonGrid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="fx-skelCard" />
          ))}
        </div>
      ) : (
        <div className="fx-frameGridScroll" role="region" aria-label="Frames list">

        <div className="fx-frameGrid">
          {filtered.map((frame) => {
            const active = selectedFrame?.id === frame.id;
            const imgSrc =
              resolveMediaUrl(frame.cornerImage) ||
              "https://placehold.co/100x100?text=Frame";

            return (
              <button
                key={frame.id || frame.code}
                type="button"
                className={`fx-frameCard ${active ? "is-active" : ""}`}
                onClick={() => onSelect?.(frame)}
                title={frame.name || frame.code || "Frame"}
              >
                <div className="fx-frameMedia">
                  <img
                    src={imgSrc}
                    alt={frame.code || frame.name || "Frame"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/100x100?text=Frame";
                    }}
                  />
                </div>

                <div className="fx-frameCodeOnly">
                  {frame.code || frame.name || "—"}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 ? (
            <div className="fx-empty">
              <div className="fx-emptyTitle">No frames in this color</div>
              <div className="fx-emptySub">Try another color.</div>
            </div>
          ) : null}
        </div>
        </div>
      )}
    </section>
  );
}
