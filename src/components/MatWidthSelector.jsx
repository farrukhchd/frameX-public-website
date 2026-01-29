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
    <div className="fp3-card">
      <div className="fp3-secTitleModern">Mat (Mount Width)</div>
      <div className="fp3-chipRowModern">
        {matWidthVariants.map((v) => {
          const t = v.thickness ?? '0"';
          const inches = parseThicknessToInches(t);
          const isZero = inches === 0;

          const isSelected = isZero ? matInches === 0 : safeId(selectedMatWidth) === safeId(v);

          return (
            <button
              key={safeId(v) || t}
              type="button"
              className={`fp3-chipModern ${isSelected ? "is-active" : ""}`}
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
    </div>
  );
}
