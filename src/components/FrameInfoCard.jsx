import React from "react";
import { formatSizeText } from "../utils/sizeUtils";

function resolveMediaUrl(url) {
  if (!url) return null;

  const u = String(url).trim();
  if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("blob:")) return u;
  if (u.startsWith("//")) return `${window.location.protocol}${u}`;
  if (u.startsWith("/")) return u;
  return `/${u.replace(/^\/+/, "")}`;
}

export default function FrameInfoCard({
  service,
  selectedFrame,
  baseArtSizeText,
  finalFrameSize,
}) {
  const imgSrc =
    resolveMediaUrl(selectedFrame?.cornerImage) ||
    "https://placehold.co/140x140?text=Frame";

  return (
    <div className="fp3-topCard">
      <div className="fp3-kickerModern">
        {String(service || "PHOTO FRAME").replaceAll("-", " ").toUpperCase()}
      </div>

      <div className="fp3-infoTopRow">
        <div style={{ minWidth: 0 }}>
          <div className="fp3-titleModern">
            {selectedFrame?.name || "Selected Frame"}
          </div>
          {selectedFrame?.tagline ? (
            <div className="fp3-sublineModern" style={{ marginTop: 4, opacity: 0.75 }}>
              {selectedFrame.tagline}
            </div>
          ) : null}
        </div>

        <div className="fp3-selectedFrameThumb" title={selectedFrame?.name || ""}>
          <img
            src={imgSrc}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/140x140?text=Frame";
            }}
          />
        </div>
      </div>

      <div className="fp3-sublineModern">
        Print size: <strong>{baseArtSizeText}</strong>
        <span className="fp3-dot">•</span>
        Final frame size: <strong>{formatSizeText(finalFrameSize)}</strong>
      </div>
    </div>
  );
}
