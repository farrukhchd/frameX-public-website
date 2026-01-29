import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseSizeWH, clamp } from "../utils/sizeUtils";
import PreviewTabs from "./PreviewTabs";
import PhotoStrip from "./PhotoStrip";

export default function PreviewStage({
  mode,
  setMode,

  finalPreviewImages,
  activePhoto,
  page,
  setPage,
  quantity,

  borderOverlay,
  model3dUrl,

  finalFrameSize,
  matInches,
  mountPaddingPx,

  selectedMatColor,
}) {
  const { w: sizeW, h: sizeH } = useMemo(() => parseSizeWH(finalFrameSize), [finalFrameSize]);
  const hasMat = Number(matInches || 0) > 0;

  // ✅ track photo natural size to determine orientation
  const [photoNat, setPhotoNat] = useState({ w: 0, h: 0 });

  // reset when photo changes
  useEffect(() => {
    setPhotoNat({ w: 0, h: 0 });
  }, [activePhoto]);

  // ✅ compute orientation
  const isPhotoLandscape = photoNat.w > 0 && photoNat.h > 0 ? photoNat.w >= photoNat.h : null;
  const isSizeLandscape = sizeW >= sizeH;

  // ✅ if photo orientation differs from size orientation, swap AR for preview
  const { w: outW, h: outH } = useMemo(() => {
    if (isPhotoLandscape == null) return { w: sizeW, h: sizeH };
    const mismatch = isPhotoLandscape !== isSizeLandscape;
    return mismatch ? { w: sizeH, h: sizeW } : { w: sizeW, h: sizeH };
  }, [sizeW, sizeH, isPhotoLandscape, isSizeLandscape]);

  // --- true inch-to-pixel scaling (same as your earlier version)
  const frameRef = useRef(null);
  const [pxPerInch, setPxPerInch] = useState(0);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const wPx = rect.width || 0;
      const hPx = rect.height || 0;
      if (wPx <= 0 || hPx <= 0 || outW <= 0 || outH <= 0) return;

      const ppi = Math.min(wPx / outW, hPx / outH);
      setPxPerInch(ppi);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [outW, outH]);

  const padPx = useMemo(() => {
    if (!hasMat) return 0;
    const raw = pxPerInch > 0 ? matInches * pxPerInch : Number(mountPaddingPx || 0);

    const maxPerSide = frameRef.current
      ? Math.min(frameRef.current.clientWidth, frameRef.current.clientHeight) * 0.4
      : 140;

    return Math.round(clamp(raw, 0, maxPerSide));
  }, [hasMat, matInches, pxPerInch, mountPaddingPx]);

  // ✅ mat color mapping (basic)
  const matLabel = String(selectedMatColor?.thickness || "").toLowerCase();
  const matColor =
    matLabel.includes("black") ? "#1c1c1c" :
    matLabel.includes("off") ? "#f3efe6" :
    matLabel.includes("cream") ? "#f3efe6" :
    matLabel.includes("white") ? "#fbfbfb" :
    "#fbfbfb";

  return (
    <div className="fp3-stageModern">
      <div className="fp3-viewportModern">
        {mode === "preview" ? (
          <div
            ref={frameRef}
            className="fp3-frame9Modern"
            style={{
              "--frame-url": borderOverlay ? `url("${borderOverlay}")` : "none",
              "--ar": `${outW}/${outH}`,
              "--pad": `${hasMat ? padPx : 50}px`,   // small reveal gap when no mat
              "--mat-color": matColor,
            }}
          >
            <div className={`fp3-frame9Opening ${hasMat ? "hasMat" : ""}`}>
              {hasMat ? (
                <div className="fp3-mountModern hasMat">
                  <img
                    className="fp3-photoModern"
                    src={activePhoto}
                    alt="Preview"
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      setPhotoNat({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
                    }}
                  />
                </div>
              ) : (
                <img
                  className="fp3-photoModern noMat"
                  src={activePhoto}
                  alt="Preview"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setPhotoNat({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
                  }}
                />
              )}
            </div>
          </div>
        ) : mode === "3d" ? (
          model3dUrl ? (
            <div className="fp3-modelWrap">
              <model-viewer
                src={model3dUrl}
                camera-controls
                auto-rotate
                ar
                ar-modes="webxr scene-viewer quick-look"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div className="fp3-modelBox">
              <div className="fp3-modelTitle">3D Preview</div>
              <div className="fp3-modelSub">No 3D model available for this frame.</div>
            </div>
          )
        ) : (
          <div className="fp3-modelBox">
            <div className="fp3-modelTitle">AR Preview</div>
            <div className="fp3-modelSub">
              Open this page on a mobile device. Use AR inside 3D mode (if supported).
            </div>
          </div>
        )}
      </div>

      <PreviewTabs mode={mode} setMode={setMode} />

      {finalPreviewImages.length > 1 ? (
        <PhotoStrip images={finalPreviewImages} page={page} setPage={setPage} />
      ) : (
        <div className="fp3-hintModern">Showing 1 of {quantity} image(s).</div>
      )}
    </div>
  );
}
