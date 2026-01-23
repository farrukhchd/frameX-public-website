import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";

import { fetchMaterials, fetchCostFactors, fetchMouldings } from "../services/apiService";

import "../styles/frame-preview.css";
import "../styles/meta-strip.css";

import CartStore from "../store/CartStore";
import CartItem from "../models/CartItem";
import CartMaterial from "../models/CartMaterial";
import uploadToS3 from "../services/uploadToS3";
import { showCartSheet } from "../components/CartBottomSheet";

/* ---------------------------
Helpers
--------------------------- */
const normalize = (s) => String(s || "").trim().toLowerCase();
const safeId = (o) => o?.id || o?._id || "";
const moneyPKR = (n) => `Rs. ${Math.round(Number(n || 0)).toLocaleString("en-PK")}`;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// accepts: 4x6, 4" x 6", 4 × 6
function parseSizeWH(raw) {
  const s = String(raw || "")
    .toLowerCase()
    .replaceAll('"', "")
    .replaceAll(" ", "")
    .replaceAll("×", "x");

  const parts = s.split("x");
  if (parts.length === 2) {
    const w = Number(parts[0]);
    const h = Number(parts[1]);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return { w, h };
  }
  return { w: 1, h: 1 };
}

function parseThicknessToInches(thickness) {
  const t = String(thickness ?? "").replaceAll('"', "").trim();
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

function calcFinalFrameSize(artSize, matInches) {
  if (!matInches) return artSize;
  const { w, h } = parseSizeWH(artSize);
  const add = matInches * 2;
  return `${w + add}x${h + add}`;
}

function formatSizeText(raw) {
  const { w, h } = parseSizeWH(raw);
  return `${w} x ${h}`;
}

// Transparent PNG placeholder to preserve aspect (data URL)
async function makeTransparentPngDataUrlForAspect(artSize, longEdge = 1200) {
  const { w, h } = parseSizeWH(artSize);
  const aspect = w / h || 1;

  let widthPx, heightPx;
  if (aspect >= 1) {
    widthPx = longEdge;
    heightPx = Math.round(longEdge / aspect);
  } else {
    heightPx = longEdge;
    widthPx = Math.round(longEdge * aspect);
  }
  widthPx = clamp(widthPx, 240, 2000);
  heightPx = clamp(heightPx, 240, 2000);

  const canvas = document.createElement("canvas");
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.clearRect(0, 0, widthPx, heightPx);
  return canvas.toDataURL("image/png");
}

// Resolve any possible image input to a usable <img src> string
function resolveToSrc(img) {
  if (!img) return null;
  if (typeof img === "string") return img; // http(s), data:, blob:
  if (img instanceof Blob) return URL.createObjectURL(img); // File is a Blob
  return null;
}

/* ---------- Upload helpers ---------- */
const srcToFile = async (src, name = "framex") => {
  if (src instanceof File) return src;

  const res = await fetch(src);
  if (!res.ok) throw new Error("Failed to read image for upload");
  const blob = await res.blob();

  const ext = blob.type?.split("/")?.[1] || "jpg";
  return new File([blob], `${name}.${ext}`, { type: blob.type || "image/jpeg" });
};

const isFileLike = (x) => x instanceof File || x instanceof Blob;

const toUploadFile = async (maybeFile, maybeSrc, name) => {
  // ✅ Prefer real File/Blob if still available
  if (isFileLike(maybeFile)) {
    const blob = maybeFile;
    const type = blob.type || "image/jpeg";
    const ext = type.split("/")[1] || "jpg";
    return blob instanceof File ? blob : new File([blob], `${name}.${ext}`, { type });
  }
  // fallback: src (http/data/blob) -> File
  return await srcToFile(maybeSrc, name);
};

/* ---------------------------
Dart-equivalent cost calculator
- matches your provided Dart logic
--------------------------- */
function calculateCostWeb({ artSize, selectedVariants, materials, costFactors }) {
  const clean = String(artSize || "")
    .replaceAll('"', "")
    .replaceAll(" ", "")
    .replaceAll("×", "x")
    .toLowerCase();

  const parts = clean.split("x");
  const width = parts.length === 2 ? Number(parts[0]) || 0 : 0;
  const height = parts.length === 2 ? Number(parts[1]) || 0 : 0;
  const squareFeet = (width * height) / 144;

  let cost = 0;

  // --- Material Cost
  Object.entries(selectedVariants || {}).forEach(([matId, variantId]) => {
    const material = (materials || []).find((m) => safeId(m) === matId);
    if (!material) return;

    const variant = (material.variants || []).find((v) => safeId(v) === variantId);
    if (!variant) return;

    const price = Number(variant.price ?? 0);
    if (!(price > 0)) return;

    const unit = String(variant.unit || "").toLowerCase();
    const materialCost = unit === "per square foot" ? squareFeet * price : price;
    cost += materialCost;
  });

  // --- Extra Cost Factors
  const laborBase = Number(costFactors?.labor_cost_per_item ?? 0);
  if (laborBase > 0) {
    const laborCost = laborBase + width * height * 0.5;
    cost += laborCost;
  }

  const marketingFlat = Number(costFactors?.marketing_percent ?? 0);
  if (marketingFlat > 0) {
    cost += marketingFlat;
  }

  const totalCost = cost;

  const profitMul = Number(costFactors?.profit_margin_percent ?? 1);
  const selling = totalCost * (profitMul || 1);

  return { totalCost, selling };
}

/* ---------------------------
Material helpers
--------------------------- */
function findMaterialExact(materials, name) {
  const want = normalize(name);
  return (materials || []).find((m) => normalize(m.name) === want) || null;
}
function findMaterialContains(materials, term) {
  const want = normalize(term);
  return (materials || []).find((m) => normalize(m.name).includes(want)) || null;
}
function firstVariantId(material) {
  const v = material?.variants;
  if (!Array.isArray(v) || v.length === 0) return "";
  return safeId(v[0]);
}

/* ============================================================
FramePreview
============================================================ */
export default function FramePreview() {
  const navigate = useNavigate();
  const { service } = useParams();
  const { state: payload } = useLocation();

  // Redirect safely if state missing
  useEffect(() => {
    if (!payload?.frame) navigate("/start-framing", { replace: true });
  }, [payload, navigate]);

  if (!payload?.frame) return null;

  const {
    artType = "Photo Frame",
    artSize = "4x6",
    selectedSize,
    quantity = 1,
    frame: initialFrame,
    printPrice = 0, 
    printCost = 0,  
    // ✅ preferred cross-route
    imageUrls = [],

    // fallback: File/Blob list (works best for upload)
    localImages = [],
  } = payload;

  const baseArtSizeText = selectedSize?.size || artSize;

  /* ---------- UI state ---------- */
  const [mode, setMode] = useState("preview"); // preview | 3d | ar
  const [page, setPage] = useState(0);

  const [selectedFrame, setSelectedFrame] = useState(initialFrame);

  // ✅ default NO MAT
  const [selectedMatWidth, setSelectedMatWidth] = useState(null); // Variant
  const [selectedMatColor, setSelectedMatColor] = useState(null); // Variant

  // upload UI (safe even if you don't show in UI yet)
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /* ---------- Build preview sources ---------- */
  const objectUrlsToRevoke = useRef([]);

  const previewSources = useMemo(() => {
    // cleanup previous object URLs
    objectUrlsToRevoke.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsToRevoke.current = [];

    // 1) If imageUrls were passed, use them directly
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      return imageUrls.filter(Boolean);
    }

    // 2) fallback: build URLs from Blobs (File is Blob)
    if (Array.isArray(localImages) && localImages.length > 0) {
      const list = localImages
        .map((img) => {
          const src = resolveToSrc(img);
          if (src && typeof img !== "string" && src.startsWith("blob:")) {
            objectUrlsToRevoke.current.push(src);
          }
          return src;
        })
        .filter(Boolean);

      return list;
    }

    return [];
  }, [imageUrls, localImages]);

  useEffect(() => {
    return () => {
      objectUrlsToRevoke.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlsToRevoke.current = [];
    };
  }, []);

  useEffect(() => setPage(0), [previewSources.length]);

  const isEmptyFrame =
    normalize(artType).includes("empty") || normalize(service).includes("empty");

  const [blankUrl, setBlankUrl] = useState("");
  useEffect(() => {
    let mounted = true;

    async function prepBlank() {
      if (!isEmptyFrame && previewSources.length > 0) return;
      const url = await makeTransparentPngDataUrlForAspect(baseArtSizeText, 1200);
      if (mounted) setBlankUrl(url);
    }

    prepBlank();
    return () => {
      mounted = false;
    };
  }, [isEmptyFrame, baseArtSizeText, previewSources.length]);

  const finalPreviewImages =
    previewSources.length > 0 ? previewSources : blankUrl ? [blankUrl] : [];

  const activePhoto =
    finalPreviewImages[page] || "https://placehold.co/1200x900?text=Your+Photo";

  /* ---------- Mat sizing ---------- */
  const matInches = parseThicknessToInches(selectedMatWidth?.thickness ?? "0");
  const finalFrameSize = useMemo(
    () => (matInches ? calcFinalFrameSize(baseArtSizeText, matInches) : baseArtSizeText),
    [baseArtSizeText, matInches]
  );

  /* ---------- Pricing data ---------- */
  const [materials, setMaterials] = useState([]);
  const [costFactors, setCostFactors] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [mats, factors] = await Promise.all([fetchMaterials(), fetchCostFactors()]);
        if (!alive) return;
        setMaterials(Array.isArray(mats) ? mats : []);
        setCostFactors(factors || null);
      } catch (e) {
        console.error("Failed to load materials/cost factors:", e);
        if (!alive) return;
        setMaterials([]);
        setCostFactors(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* ---------- Frame picker ---------- */
  const [frames, setFrames] = useState([]);
  const [framesLoading, setFramesLoading] = useState(false);
  const [showFramePicker, setShowFramePicker] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadFrames() {
      if (!showFramePicker || framesLoading || frames.length > 0) return;
      setFramesLoading(true);
      try {
        const list = await fetchMouldings();
        if (!mounted) return;
        setFrames(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Frames fetch failed:", e);
      } finally {
        if (mounted) setFramesLoading(false);
      }
    }

    loadFrames();
    return () => {
      mounted = false;
    };
  }, [showFramePicker, framesLoading, frames.length]);

  /* ---------- Materials mapping like Dart ---------- */
  const mountColorMaterial = useMemo(() => {
    return findMaterialContains(materials, "mount color") || findMaterialExact(materials, "Mount Color");
  }, [materials]);

  const mountSizeMaterial = useMemo(() => {
    return (
      findMaterialContains(materials, "mount size") ||
      findMaterialContains(materials, "mount width") ||
      findMaterialExact(materials, "Mount Size")
    );
  }, [materials]);

  const matWidthVariants = useMemo(() => {
    const v = mountSizeMaterial?.variants;
    if (Array.isArray(v) && v.length) return v;

    return [
      { _id: "mw0", thickness: '0"', price: 0, unit: "per item" },
      { _id: "mw1", thickness: '1"', price: 0, unit: "per item" },
      { _id: "mw2", thickness: '2"', price: 0, unit: "per item" },
      { _id: "mw3", thickness: '3"', price: 0, unit: "per item" },
      { _id: "mw4", thickness: '4"', price: 0, unit: "per item" },
      { _id: "mw5", thickness: '5"', price: 0, unit: "per item" },
    ];
  }, [mountSizeMaterial]);

  const matColorVariants = useMemo(() => {
    const v = mountColorMaterial?.variants;
    if (Array.isArray(v) && v.length) return v;

    return [
      { _id: "mc1", thickness: "White", price: 0, unit: "per item" },
      { _id: "mc2", thickness: "Off White", price: 0, unit: "per item" },
      { _id: "mc3", thickness: "Black", price: 0, unit: "per item" },
    ];
  }, [mountColorMaterial]);

  /* ---------- Build selectedVariants like Dart ---------- */
  const selectedVariants = useMemo(() => {
    const sel = {};

    if (selectedMatColor && mountColorMaterial) {
      sel[safeId(mountColorMaterial)] = safeId(selectedMatColor);
    }
    if (selectedMatWidth && mountSizeMaterial) {
      sel[safeId(mountSizeMaterial)] = safeId(selectedMatWidth);
    }

    for (const fixed of ["Glass", "Acrylic", "Wood Board", "Hanging Hardware"]) {
      const m = findMaterialExact(materials, fixed);
      if (!m) continue;
      const mId = safeId(m);
      sel[mId] = sel[mId] || firstVariantId(m);
    }

    return sel;
  }, [materials, selectedMatColor, selectedMatWidth, mountColorMaterial, mountSizeMaterial]);

  /* ---------- Pricing ---------- */
  const pricing = useMemo(() => {
    if (!materials.length || !costFactors) return { totalCost: null, selling: null };
    return calculateCostWeb({
      artSize: finalFrameSize,
      selectedVariants,
      materials,
      costFactors,
    });
  }, [materials, costFactors, finalFrameSize, selectedVariants]);

  const combined = useMemo(() => {
  const baseSell = Number(pricing?.selling ?? 0);
  const baseCost = Number(pricing?.totalCost ?? 0);

  const pSell = Number(printPrice || 0);
  const pCost = Number(printCost || 0);

  return {
    selling: (pricing?.selling == null ? null : baseSell + pSell),
    totalCost: (pricing?.totalCost == null ? null : baseCost + pCost),
  };
}, [pricing, printPrice, printCost]);


  /* ---------- Cart material builder ---------- */
  const buildCartMaterials = () => {
    if (!Array.isArray(materials) || materials.length === 0) return [];

    return materials.map((m) => {
      const mId = safeId(m);
      const chosenId = selectedVariants?.[mId];
      const v = (m.variants || []).find((x) => safeId(x) === chosenId) || (m.variants || [])[0];

      return new CartMaterial({
        name: m.name || "",
        variant: v?.thickness || v?.unit || "",
      });
    });
  };

  /* ---------- Add to cart (FIXED for multi-photo) ---------- */
  const onAddToCart = async () => {
    const cartMaterials = buildCartMaterials();

    // EMPTY frame OR no images => no uploads
    const emptyNoImage = isEmptyFrame || (Array.isArray(previewSources) && previewSources.length === 0);

    if (emptyNoImage) {
      const item = CartItem.emptyFrame({
        frameSize: finalFrameSize,
        moulding: selectedFrame,
        thumb: selectedFrame?.cornerImage || "",
        costPrice: Number(combined?.totalCost || 0),
        sellingPrice: Number(combined?.selling || 0),
        profit: Number(combined?.selling || 0) - Number(combined?.totalCost || 0),
        quantity: Number(quantity || 1),
      });

      CartStore.addItem(item);
      showCartSheet();
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const sources =
        Array.isArray(previewSources) && previewSources.length > 0
          ? previewSources
          : Array.isArray(imageUrls)
          ? imageUrls
          : [];

      if (sources.length === 0) {
        alert("No images found to upload. Please go back and select photos again.");
        return;
      }

      const uploadedUrls = [];

      for (let i = 0; i < sources.length; i++) {
        // ✅ Prefer original File/Blob from localImages if present
        const file = await toUploadFile(
          Array.isArray(localImages) ? localImages[i] : null,
          sources[i],
          `framex_${Date.now()}_${i}`
        );

        const url = await uploadToS3(file, "cart-uploads");
        uploadedUrls.push(url);

        const pct = Math.round(((i + 1) / sources.length) * 100);
        setUploadProgress(pct);
      }

      const thumb = uploadedUrls[0] || "";

      // one cart item per image (your existing behavior)
      uploadedUrls.forEach((url) => {
        const item = new CartItem({
          productType: artType,
          size: selectedSize?.size || artSize,
          frameSize: finalFrameSize,
          materials: cartMaterials,
          moulding: selectedFrame,
          image: url,
          thumb,
          costPrice: Number(pricing?.totalCost || 0),
          sellingPrice: Number(pricing?.selling || 0),
          profit: Number(pricing?.selling || 0) - Number(pricing?.totalCost || 0),
          quantity: 1,
        });

        CartStore.addItem(item);
      });

      showCartSheet();
    } catch (e) {
      console.error(e);
      alert(`❌ Failed to upload images: ${e?.message || e}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /* ---------- Preview rendering vars ---------- */
  const borderOverlay = selectedFrame?.borderImage || selectedFrame?.border_image || null;

  const { w: outW, h: outH } = useMemo(() => parseSizeWH(finalFrameSize), [finalFrameSize]);

  const mountPaddingPx = clamp(10 + matInches * 10, 10, 80);

  /* ---------- 3D model ---------- */
  const model3dUrl = selectedFrame?.model3d || selectedFrame?.model_3d || null;

  return (
    <div className="fp3-page">
      <SiteHeader />
      <div className="fp3-shell">
        <div className="fp3-gridModern">
          {/* LEFT */}
          <div className="fp3-left">
            <div className="fp3-stageModern">
              <div className="fp3-viewportModern">
                {mode === "preview" ? (
                  <div
                    className="fp3-frame9Modern"
                    style={{
                      "--frame-url": borderOverlay ? `url("${borderOverlay}")` : "none",
                      "--slice": 140,
                      "--border": 58,
                      "--ar": `${outW}/${outH}`,
                      "--pad": `${mountPaddingPx}px`,
                    }}
                  >
                    <div className={`fp3-mountModern ${matInches > 0 ? "hasMat" : ""}`}>
                      <img className="fp3-photoModern" src={activePhoto} alt="Preview" />
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

              {/* Buttons below preview */}
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

              {/* Thumbnails */}
              {finalPreviewImages.length > 1 ? (
                <div className="fp3-photoStripModern">
                  {finalPreviewImages.map((url, idx) => (
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
              ) : (
                <div className="fp3-hintModern">Showing 1 of {quantity} image(s).</div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="fp3-right">
            <div className="fp3-panelModern">
              <div className="fp3-topCard">
                <div className="fp3-kickerModern">
                  {String(service || "PHOTO FRAME").replaceAll("-", " ").toUpperCase()}
                </div>

                <div className="fp3-titleModern">{selectedFrame?.name || "Selected Frame"}</div>

                <div className="fp3-sublineModern">
                  Print size: <strong>{baseArtSizeText}</strong>
                  <span className="fp3-dot">•</span>
                  Final frame size: <strong>{formatSizeText(finalFrameSize)}</strong>
                </div>

                <div className="fp3-actionsRow">
                  <button className="fp3-ghostMini" type="button" onClick={() => setShowFramePicker(true)}>
                    Change frame
                  </button>
                </div>
              </div>

              {/* MAT WIDTH */}
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

              {/* MAT COLOR */}
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

                {matInches === 0 ? <div className="fp3-miniNote">Select a mat width to enable color.</div> : null}
              </div>

              {/* PRICE */}
              <div className="fp3-card fp3-priceCard">
                <div className="fp3-priceRowModern">
                  <div className="fp3-totalLbl">Total</div>
                  <div className="fp3-priceValModern">
                    {combined.selling == null ? "—" : moneyPKR(combined.selling)}
                  </div>
                </div>

                {/* Optional: show upload progress in button label only */}
                <button
                  className="fp3-ctaModern"
                  type="button"
                  disabled={uploading}
                  onClick={onAddToCart}
                  title={uploading ? `Uploading… ${uploadProgress}%` : "Add to cart"}
                >
                  {uploading
                    ? `UPLOADING… ${uploadProgress}%`
                    : `ADD TO CART — ${combined.selling == null ? "Continue" : moneyPKR(combined.selling)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame picker modal */}
      {showFramePicker ? (
        <div className="fp3-modalOverlay" role="dialog" aria-modal="true">
          <div className="fp3-modalCard">
            <div className="fp3-modalHeader">
              <div className="fp3-modalTitle">Choose a Frame</div>
              <button className="fp3-modalClose" onClick={() => setShowFramePicker(false)} type="button">
                ✕
              </button>
            </div>

            <div className="fp3-modalBody">
              {framesLoading ? (
                <div className="fp3-loading">Loading frames…</div>
              ) : (
                <div className="fp3-frameList">
                  {frames.map((f) => (
                    <button
                      type="button"
                      key={safeId(f) || f.code}
                      className={`fp3-frameRow ${safeId(selectedFrame) === safeId(f) ? "is-active" : ""}`}
                      onClick={() => {
                        setSelectedFrame(f);
                        setShowFramePicker(false);
                      }}
                    >
                      <div className="fp3-frameThumb">
                        {f.cornerImage ? <img src={f.cornerImage} alt="" /> : <div className="fp3-thumbPh" />}
                      </div>
                      <div className="fp3-frameInfo">
                        <div className="fp3-frameName">{f.name}</div>
                        <div className="fp3-frameMeta">
                          {f.material ? `Material: ${f.material}` : "—"}
                          <span className="fp3-dot">•</span>
                          {f.color ? String(f.color).toUpperCase() : "—"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
