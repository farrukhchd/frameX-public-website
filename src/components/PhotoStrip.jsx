import React from "react";

export default function PhotoStrip({ images, page, setPage }) {
  return (
    <div className="fp3-photoStripModern">
      {images.map((url, idx) => (
        <button
          key={`${url}-${idx}`}
          type="button"
          className={`fp3-pThumbModern ${idx === page ? "is-active" : ""}`}
          onClick={() => setPage(idx)}
        >
          <img src={url} alt="" />
          <span className="fp3-pIndexModern">{idx + 1}</span>
        </button>
      ))}
    </div>
  );
}
