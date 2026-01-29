import React, { useEffect, useMemo, useState } from "react";
import { fetchMouldings } from "../services/apiService";

export default function FrameGridPicker({
  selectedFrame,
  onSelect,
  title = "Change Frame",
  subtitle = "Pick a frame to update the preview.",
}) {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);

  // lightweight filters (optional but very useful in-preview)
  const [query, setQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("All"); // All | White | Black | etc.

  const colorFilters = useMemo(
    () => ["All", "White", "Black", "Golden", "Brown", "Silver"],
    []
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchMouldings()
      .then((data) => {
        if (!mounted) return;
        setFrames(Array.isArray(data) ? data : []);
      })
      .catch(() => mounted && setFrames([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const color = (selectedColor || "All").toLowerCase();

    return frames.filter((f) => {
      const matchesColor =
        color === "all" ? true : (f.color || "").toLowerCase() === color;

      const matchesQuery = q
        ? `${f.name || ""} ${f.tagline || ""} ${f.material || ""}`
            .toLowerCase()
            .includes(q)
        : true;

      return matchesColor && matchesQuery;
    });
  }, [frames, query, selectedColor]);

  return (
    <div className="fgp-wrap">
      <div className="fgp-head">
        <div>
          <div className="fgp-title">{title}</div>
          <div className="fgp-sub">{subtitle}</div>
        </div>
      </div>

      <div className="fgp-controls">
        <input
          className="fgp-search"
          placeholder="Search frames…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="fgp-select"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        >
          {colorFilters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="fgp-loading">Loading frames…</div>
      ) : (
        <div className="fgp-grid">
          {filtered.map((frame) => {
            const active = selectedFrame?.id === frame.id;

            return (
              <button
                key={frame.id}
                type="button"
                className={`fgp-card ${active ? "is-active" : ""}`}
                onClick={() => onSelect?.(frame)}
                title={frame.name || "Frame"}
              >
                <div className="fgp-thumb">
                  <img
                    src={frame.cornerImage || "https://placehold.co/200x200?text=Frame"}
                    alt={frame.name || "Frame"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/200x200?text=Frame";
                    }}
                  />
                </div>

                <div className="fgp-meta">
                  <div className="fgp-name">{frame.name || "—"}</div>
                  <div className="fgp-mini">
                    <span>{frame.color || "-"}</span>
                    <span className="fgp-dot">•</span>
                    <span>{frame.material || "-"}</span>
                  </div>
                </div>
              </button>
            );
          })}

          {!loading && filtered.length === 0 ? (
            <div className="fgp-empty">No frames found.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
