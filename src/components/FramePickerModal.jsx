import React from "react";
import { safeId } from "../utils/materialUtils";

export default function FramePickerModal({
  open,
  onClose,
  framesLoading,
  frames,
  selectedFrame,
  onSelectFrame,
}) {
  if (!open) return null;

  return (
    <div className="fp3-modalOverlay" role="dialog" aria-modal="true">
      <div className="fp3-modalCard">
        <div className="fp3-modalHeader">
          <div className="fp3-modalTitle">Choose a Frame</div>
          <button className="fp3-modalClose" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="fp3-modalBody">
          {framesLoading ? (
            <div className="fp3-loading">Loading frames…</div>
          ) : (
            <div className="fp3-frameList">
              {frames.map((f) => (
                <button
                  type="button"
                  key={safeId(f) || f.code}
                  className={`fp3-frameRow ${
                    safeId(selectedFrame) === safeId(f) ? "is-active" : ""
                  }`}
                  onClick={() => onSelectFrame(f)}
                >
                  <div className="fp3-frameThumb">
                    {f.cornerImage ? <img src={f.cornerImage} alt="" /> : <div className="fp3-thumbPh" />}
                  </div>

                  <div className="fp3-frameInfo">
                    <div className="fp3-frameName">{f.name}</div>
                    <div className="fp3-frameMeta">
                      {f.material ? `Material: ${f.material}` : "—"}
                      <span className="fp3-dot">•</span>
                      {f.color ? String(f.color).toUpperCase() : "—"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
