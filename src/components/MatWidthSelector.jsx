import React from "react";
import { parseThicknessToInches } from "../utils/sizeUtils";
import { safeId } from "../utils/materialUtils";

export default function MatWidthSelector({
  matWidthVariants,
  selectedMatWidth,
  setSelectedMatWidth,
  setSelectedMatColor,
  matInches,
}) {
  return (
    <section className="fx-card fx-section">
      <header className="fx-sectionHead">
        <div className="fx-sectionTitle">Mat (Mount Width)</div>
        <div className="fx-sectionSub">Add a clean border for a gallery look.</div>
      </header>

      <div className="fx-chipRow">
        {matWidthVariants.map((v) => {
          const t = v.thickness ?? '0"';
          const inches = parseThicknessToInches(t);
          const isZero = inches === 0;

          const isSelected = isZero ? matInches === 0 : safeId(selectedMatWidth) === safeId(v);

          return (
            <button
              key={safeId(v) || t}
              type="button"
              className={`fx-chip ${isSelected ? "is-active" : ""}`}
              onClick={() => {
                if (isZero) {
                  setSelectedMatWidth(null);
                  setSelectedMatColor(null);
                  return;
                }
                setSelectedMatWidth(v);
              }}
            >
              {isZero ? "No Mat" : `${t} Mat`}
            </button>
          );
        })}
      </div>
    </section>
  );
}
