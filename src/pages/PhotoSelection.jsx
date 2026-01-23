import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import "../styles/photo-selection.css";
import "../styles/quantity.css";
import "../styles/print-size.css";
import "../styles/meta-strip.css";

/* =========================
   DropZone Component
   ========================= */
function DropZone({ onPick, onDropFiles, disabled }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`psel-drop ${dragOver ? "is-dragOver" : ""} ${
        disabled ? "is-disabled" : ""
      }`}
      role="button"
      tabIndex={0}
      onClick={() => !disabled && onPick()}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") onPick();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        if (disabled) return;

        const dropped = Array.from(e.dataTransfer?.files || []).filter((f) =>
          String(f.type || "").startsWith("image/")
        );
        if (dropped.length) onDropFiles(dropped);
      }}
    >
      <div className="psel-dropInner">
        <div className="psel-dropIcon" aria-hidden="true">
          ⬆️
        </div>
        <div className="psel-dropTitle">Drag & drop photos here</div>
        <div className="psel-dropSub">
          or <span className="psel-dropLink">browse files</span>
        </div>
        <div className="psel-dropHint">JPG / PNG — best quality recommended</div>
      </div>
    </div>
  );
}

/* =========================
   Duplicate detection
   ========================= */
function fileKey(f) {
  return `${f?.name || ""}__${f?.size || 0}__${f?.lastModified || 0}`;
}

export default function PhotoSelection() {
  const navigate = useNavigate();
  const { service } = useParams();
  const { state: payload } = useLocation();
  const inputRef = useRef(null);

  // safe redirect
  useEffect(() => {
    if (!payload?.selectedSize || payload?.quantity == null) {
      navigate("/start-framing", { replace: true });
    }
  }, [payload, navigate]);

  if (!payload?.selectedSize || payload?.quantity == null) return null;

  const { artSize, quantity, selectedSize } = payload;
  const required = Number(quantity);

  const serviceLabel =
    service === "photo-frame"
      ? "Photo Frame"
      : service === "only-prints"
      ? "Only Prints"
      : "Service";

  const [files, setFiles] = useState([]); // File[]
  const [info, setInfo] = useState("");

  const previews = useMemo(
    () =>
      files.map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
        key: fileKey(f),
      })),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const pickFiles = () => inputRef.current?.click();

  const addFiles = (incoming) => {
    const chosen = Array.from(incoming || []).filter((f) =>
      String(f.type || "").startsWith("image/")
    );
    if (!chosen.length) return;

    setFiles((prev) => {
      const prevKeys = new Set(prev.map(fileKey));
      const unique = [];
      let dupCount = 0;

      for (const f of chosen) {
        const k = fileKey(f);
        if (prevKeys.has(k)) {
          dupCount += 1;
          continue;
        }
        prevKeys.add(k);
        unique.push(f);
      }

      if (dupCount > 0) {
        setInfo(`Skipped ${dupCount} duplicate photo(s).`);
        window.setTimeout(() => setInfo(""), 2200);
      }

      const CAP = Math.max(required + 50, required);
      return [...prev, ...unique].slice(0, CAP);
    });
  };

  const onFilesChosen = (e) => {
    addFiles(e.target.files || []);
    e.target.value = "";
  };

  const removeAt = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const clearAll = () => {
    setFiles([]);
    setInfo("");
  };

  // EXACT RULES
  const selected = files.length;
  const canContinue = selected >= required;

  const isExact = selected === required;
  const isExtra = selected > required;

  const nextQty = isExtra ? selected : required;
  const ctaText = isExtra
    ? "Continue with all the selected images"
    : "Continue to Crop";

  return (
    <div className="psel-page">
      <SiteHeader />

      <div className="psel-shell">
        <div className="psel-panel">
          <div className="ps-kicker" style={{ marginBottom: 10 }}>
            {serviceLabel}
          </div>

          <h1 className="psel-title">Select photos</h1>

          <p className="psel-sub">
            Please select <strong>{required}</strong> photos. You can crop each photo
            in the next step.
          </p>

          <DropZone onPick={pickFiles} onDropFiles={addFiles} disabled={false} />

          <div className="psel-actionsRow">
            <button className="psel-btn" type="button" onClick={pickFiles}>
              Add photos
            </button>

            <button
              className="psel-btnGhost"
              type="button"
              onClick={clearAll}
              disabled={files.length === 0}
            >
              Clear all
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={onFilesChosen}
            />
          </div>

          {!canContinue ? (
            <div className="psel-countHint">
              Selected <strong>{selected}</strong> / {required}
            </div>
          ) : (
            <div className="psel-countHint ok">
              {isExtra
                ? `Selected ${selected}. Quantity will be updated to ${selected}.`
                : "Perfect — you selected the required photos."}
            </div>
          )}

          {info ? <div className="psel-info">{info}</div> : null}

          <div className="psel-grid">
            {previews.map((p, idx) => {
              const showExtraBadge = idx >= required; // ✅ same “extra badge” idea
              return (
                <div key={p.key} className="psel-tile">
                  <img className="psel-img" src={p.url} alt="Selected" />

                  <button
                    className="psel-remove"
                    type="button"
                    onClick={() => removeAt(idx)}
                    title="Remove"
                  >
                    ✕
                  </button>

                  {/* ✅ Extra badge (informational only) */}
                  {showExtraBadge ? <div className="psel-extraTag">Extra</div> : null}
                </div>
              );
            })}

            {/* placeholders only if missing required */}
            {Array.from({ length: Math.max(0, required - selected) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="psel-tile psel-empty"
                onClick={pickFiles}
                role="button"
                tabIndex={0}
              >
                <div className="psel-emptyText">+</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="psel-sticky">
        <div className="psel-stickyInner">
          <button
            className="psel-next"
            type="button"
            disabled={!canContinue}
            onClick={() => {
              navigate(`/start-framing/crop/${service}`, {
                state: {
                  ...payload,
                  localImages: files,
                  quantity: nextQty, // ✅ increases automatically if extras selected
                  printSize: selectedSize?.size ?? artSize,
                },
              });
            }}
          >
            {ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}
