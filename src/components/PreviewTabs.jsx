import React from "react";

export default function PreviewTabs({ mode, setMode }) {
  return (
    <div className="fp3-tabsBelow">
      <button
        type="button"
        className={`fp3-tabBtn ${mode === "preview" ? "is-active" : ""}`}
        onClick={() => setMode("preview")}
      >
        Preview
      </button>
      <button
        type="button"
        className={`fp3-tabBtn ${mode === "3d" ? "is-active" : ""}`}
        onClick={() => setMode("3d")}
      >
        3D
      </button>
      <button
        type="button"
        className={`fp3-tabBtn ${mode === "ar" ? "is-active" : ""}`}
        onClick={() => setMode("ar")}
      >
        AR
      </button>
    </div>
  );
}
