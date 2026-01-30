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
    "https://placehold.co/160x160?text=Frame";

  return (
    <section className="fx-topIntro">
      <div className="fx-kicker">
        {String(service || "PHOTO FRAME").replaceAll("-", " ").toUpperCase()}
      </div>

      <div className="fx-titleRow">
        <div className="fx-titleBlock">
          <h1 className="fx-title">{selectedFrame?.name || "Selected Frame"}</h1>
          {selectedFrame?.tagline ? (
            <div className="fx-subtitle">{selectedFrame.tagline}</div>
          ) : null}

          <div className="fx-specLine">
            Print size: <strong>{baseArtSizeText}</strong>
            <span className="fx-dot">•</span>
            Final frame size: <strong>{formatSizeText(finalFrameSize)}</strong>
          </div>
        </div>

      </div>
    </section>
  );
}
