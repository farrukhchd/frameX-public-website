import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import Cropper from "react-easy-crop";

import uploadToS3 from "../services/uploadToS3";
import CartStore from "../store/CartStore";
import CartItem from "../models/CartItem";
import { showCartSheet } from "../components/CartBottomSheet";

import "../styles/crop-images.css";
import "../styles/meta-strip.css";

/* =========================
   Helpers
   ========================= */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parseRatio(s) {
  const clean = String(s || "")
    .replaceAll(" ", "")
    .replaceAll('"', "")
    .replaceAll("×", "x")
    .toLowerCase();

  const parts = clean.split("x");
  const x = parts.length === 2 ? Number(parts[0]) : 1;
  const y = parts.length === 2 ? Number(parts[1]) : 1;

  if (Number.isFinite(x) && Number.isFinite(y) && x > 0 && y > 0) return x / y;
  return 1;
}

// zoom needed so the image covers crop area (so panning is possible)
function getCoverZoom(mediaW, mediaH, cropW, cropH) {
  const zoomX = cropW / mediaW;
  const zoomY = cropH / mediaH;
  return Math.max(zoomX, zoomY);
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

function getRadianAngle(deg) {
  return (deg * Math.PI) / 180;
}

function rotateSize(width, height, rotation) {
  const rad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

/**
 * Correct crop output for react-easy-crop + rotation/flip:
 * - Draw rotated/flipped image onto safe canvas (bounding box)
 * - Crop using pixelCrop coordinates (relative to safe canvas)
 * - Export JPG
 */
async function getCroppedFile(imageSrc, pixelCrop, rotation, flipX, flipY) {
  const image = await createImage(imageSrc);

  const rotRad = getRadianAngle(rotation);
  const { width: bW, height: bH } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // safe canvas for rotation
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = Math.ceil(bW);
  canvas.height = Math.ceil(bH);

  // Fill white background to avoid black
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // move to center, rotate, flip, draw
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotRad);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // crop canvas
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) throw new Error("Canvas not supported");

  croppedCanvas.width = Math.round(pixelCrop.width);
  croppedCanvas.height = Math.round(pixelCrop.height);

  croppedCtx.fillStyle = "#ffffff";
  croppedCtx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);

  croppedCtx.drawImage(
    canvas,
    Math.round(pixelCrop.x),
    Math.round(pixelCrop.y),
    Math.round(pixelCrop.width),
    Math.round(pixelCrop.height),
    0,
    0,
    Math.round(pixelCrop.width),
    Math.round(pixelCrop.height)
  );

  const blob = await new Promise((resolve) =>
    croppedCanvas.toBlob(resolve, "image/jpeg", 0.95)
  );
  if (!blob) throw new Error("Failed to export crop");

  return new File([blob], `framex_crop_${Date.now()}.jpg`, {
    type: "image/jpeg",
  });
}

/* =========================
   Component
   ========================= */
export default function CropImages() {
  const navigate = useNavigate();
  const { service } = useParams();
  const { state: payload } = useLocation();

  // ✅ Redirect safely (NOT during render)
  useEffect(() => {
    if (!payload?.localImages || !payload?.quantity) {
      navigate("/start-framing", { replace: true });
    }
  }, [payload, navigate]);

  if (!payload?.localImages || !payload?.quantity) return null;

  const { artType, artSize, quantity, selectedSize, localImages } = payload;

  // Aspect ratio (print size)
  const baseAspect = useMemo(
    () => parseRatio(selectedSize?.size || artSize),
    [selectedSize, artSize]
  );

  // ✅ build object URLs + cleanup
  const urlsRef = useRef([]);
  useEffect(() => {
    // cleanup old
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    // create new
    urlsRef.current = (localImages || [])
      .map((f) => (f instanceof Blob ? URL.createObjectURL(f) : null))
      .filter(Boolean);

    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // current index
  const [index, setIndex] = useState(0);

  // ✅ Crop frame orientation (Landscape / Portrait)
  // This toggles the crop aspect (w/h <-> h/w) without rotating the image itself.
  const [orientation, setOrientation] = useState("landscape");
  const [aspect, setAspect] = useState(baseAspect);

  // Reset orientation/aspect whenever the selected size changes
  useEffect(() => {
    setOrientation("landscape");
    setAspect(baseAspect);
  }, [baseAspect]);

  const toggleOrientation = () => {
    setAreas((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });

    setOrientation((prev) => (prev === "landscape" ? "portrait" : "landscape"));

    setAspect((a) => {
      if (!a || !Number.isFinite(a)) return a;
      return 1 / a;
    });

    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  // store crops/files
  const [areas, setAreas] = useState(Array(localImages.length).fill(null));
  const [files, setFiles] = useState(Array(localImages.length).fill(null));
  const [busy, setBusy] = useState(false);

  // ✅ We measure the crop container to compute crop-area size.
  const wrapRef = useRef(null);
  const [wrapSize, setWrapSize] = useState({ width: 0, height: 0 });
  const [mediaSize, setMediaSize] = useState({ width: 0, height: 0 });

  // Observe wrapper resize
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;

    const ro = new ResizeObserver((entries) => {
      const r = entries?.[0]?.contentRect;
      if (!r) return;
      setWrapSize({ width: r.width, height: r.height });
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  // Compute the actual crop-area box that fits in wrapper with given aspect ratio
  const cropAreaSize = useMemo(() => {
    const W = wrapSize.width;
    const H = wrapSize.height;
    if (!W || !H) return { width: 0, height: 0 };

    const wrapRatio = W / H;
    // if wrapper is wider than target aspect, height constrains
    if (wrapRatio > aspect) {
      const height = H;
      const width = height * aspect;
      return { width, height };
    }
    // width constrains
    const width = W;
    const height = width / aspect;
    return { width, height };
  }, [wrapSize, aspect]);

  // ✅ Force minimum zoom so image fully covers crop area (no bands, panning allowed)
  useEffect(() => {
    if (!mediaSize.width || !cropAreaSize.width) return;

    const zCover = getCoverZoom(
      mediaSize.width,
      mediaSize.height,
      cropAreaSize.width,
      cropAreaSize.height
    );

    const minZoom = Math.max(1, zCover + 0.02);
    setZoom((prev) => (prev < minZoom ? minZoom : prev));
  }, [mediaSize, cropAreaSize, index]);

  const onCropComplete = (_, pixels) => {
    setAreas((prev) => {
      const next = [...prev];
      next[index] = pixels;
      return next;
    });
  };

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
  };

  /* =========================
     Prints-only: upload + add to cart (no FramePreview screen)
     ========================= */
  const addPrintsToCart = async (croppedFiles) => {
    // Upload all cropped files
    const uploadedUrls = [];
    for (let i = 0; i < croppedFiles.length; i++) {
      const f = croppedFiles[i];
      if (!f) throw new Error("Missing cropped image file");
      const url = await uploadToS3(f, "cart-uploads");
      uploadedUrls.push(url);
    }

    const thumb = uploadedUrls[0] || "";

    // ✅ keep your existing architecture: one cart item per image
    uploadedUrls.forEach((url) => {
      const item = new CartItem({
        productType: "Only Prints",
        size: selectedSize?.size || artSize,
        frameSize: selectedSize?.size || artSize, // for display consistency
        materials: [],
        moulding: null,
        image: url,
        thumb,
        costPrice: Number(printCost || 0),
        sellingPrice: Number(printPrice || 0),
        profit: Number(printPrice || 0) - Number(printCost || 0),
        quantity: 1,
      });
      CartStore.addItem(item);
    });

    showCartSheet();
  };

  const cropCurrent = async () => {
    const area = areas[index];
    if (!area) return;

    setBusy(true);
    try {
      const file = await getCroppedFile(
        urlsRef.current[index],
        area,
        rotation,
        flipX,
        flipY
      );

      const nextFiles = [...files];
      nextFiles[index] = file;
      setFiles(nextFiles);

      // last image
      if (index === localImages.length - 1) {
        const finalFiles = localImages.map((f, i) => nextFiles[i] || f);

        // ✅ prints-only: finish here => upload + add to cart
        if (service === "only-prints") {
          await addPrintsToCart(finalFiles);

          // go back to first step, cart sheet stays open
          navigate("/start-framing", { replace: true });
          return;
        }

        // ✅ existing flow: go to frame preview
        navigate(`/start-framing/frames/${service}`, {
          state: {
            ...payload,
            localImages: finalFiles,
          },
        });
        return;
      }

      setIndex((i) => i + 1);
      reset();
    } catch (e) {
      console.error(e);
      alert("Crop failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const currentUrl = urlsRef.current[index];

  return (
    <div className="cis-page">
      <SiteHeader />

      <div className="cis-shell">
        {/* Crop panel */}
        <div className="cis-panel">
          <div className="cis-progress">
            Picture {index + 1} of {localImages.length}
          </div>

          <div className="cis-cropWrap" ref={wrapRef}>
            {currentUrl ? (
              <Cropper
                image={currentUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={(z) => setZoom(clamp(z, 1, 6))}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                objectFit="contain"
                restrictPosition={true}
                onMediaLoaded={(m) =>
                  setMediaSize({
                    width: m.naturalWidth || m.width || 0,
                    height: m.naturalHeight || m.height || 0,
                  })
                }
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  height: "100%",
                }}
              >
                Loading…
              </div>
            )}
          </div>

          <div className="cis-controls">
            <button
              className="cis-iconBtn"
              type="button"
              onClick={() => setRotation((r) => r - 90)}
              title="Rotate left"
            >
              ⟲
            </button>

            <button
              className="cis-iconBtn"
              type="button"
              onClick={() => setRotation((r) => r + 90)}
              title="Rotate right"
            >
              ⟳
            </button>

            {/* ✅ Portrait/Landscape toggle (crop frame orientation) */}
            <button
              className={`cis-iconBtn ${
                orientation === "portrait" ? "active" : ""
              }`}
              type="button"
              onClick={toggleOrientation}
              title={
                orientation === "portrait"
                  ? "Portrait crop"
                  : "Landscape crop"
              }
            >
              {orientation === "portrait" ? "📱" : "🖥️"}
            </button>

            <button
              className="cis-iconBtn"
              type="button"
              onClick={() => setFlipX((v) => !v)}
              title="Flip horizontally"
            >
              ⇋
            </button>

            <button
              className="cis-iconBtn danger"
              type="button"
              onClick={reset}
              title="Reset"
            >
              ↺
            </button>
          </div>

          <div className="cis-zoomRow">
            <span className="cis-zoomLabel">Zoom</span>
            <input
              className="cis-range"
              type="range"
              min="1"
              max="6"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="cis-sticky">
        <div className="cis-stickyInner">
          <button
            className="cis-next"
            type="button"
            disabled={busy}
            onClick={cropCurrent}
          >
            {index === localImages.length - 1
              ? service === "prints-only"
                ? "Crop & Add Prints to Cart"
                : "Crop & Choose Frame"
              : "Crop This Image"}
          </button>
        </div>
      </div>
    </div>
  );
}
