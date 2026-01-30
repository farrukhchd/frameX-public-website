import React from "react";
import { safeId } from "../utils/materialUtils";

export default function MatColorSelector({
  matColorVariants,
  selectedMatColor,
  setSelectedMatColor,
  matInches,
}) {
  const disabled = matInches === 0;

  return (
    <section className="fx-card fx-section">
      <header className="fx-sectionHead">
        <div className="fx-sectionTitle">Mat Color</div>
        <div className="fx-sectionSub">
          {disabled ? "Select a mat width to enable color." : "Choose a finish that complements your photo."}
        </div>
      </header>

      <div className={`fx-chipRow ${disabled ? "is-disabledRow" : ""}`}>
        {matColorVariants.map((v) => {
          const isSelected = safeId(selectedMatColor) === safeId(v);
          const label = v.thickness || "Color";

          return (
            <button
              key={safeId(v) || label}
              type="button"
              className={`fx-chip ${isSelected ? "is-active" : ""}`}
              onClick={() => !disabled && setSelectedMatColor(v)}
              disabled={disabled}
              title={disabled ? "Select a mat width first" : "Select color"}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
