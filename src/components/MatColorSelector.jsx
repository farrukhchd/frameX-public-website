import React from "react";
import { safeId } from "../utils/materialUtils";

export default function MatColorSelector({
  matColorVariants,
  selectedMatColor,
  setSelectedMatColor,
  matInches,
}) {
  return (
    <div className="fp3-card">
      <div className="fp3-secTitleModern">Mat Color</div>
      <div className="fp3-chipRowModern">
        {matColorVariants.map((v) => {
          const disabled = matInches === 0;
          const isSelected = safeId(selectedMatColor) === safeId(v);
          const label = v.thickness || "Color";

          return (
            <button
              key={safeId(v) || label}
              type="button"
              className={`fp3-chipModern ${isSelected ? "is-active" : ""} ${
                disabled ? "is-disabled" : ""
              }`}
              onClick={() => !disabled && setSelectedMatColor(v)}
              disabled={disabled}
            >
              {label}
            </button>
          );
        })}
      </div>

      {matInches === 0 ? (
        <div className="fp3-miniNote">Select a mat width to enable color.</div>
      ) : null}
    </div>
  );
}
