import { clamp, parseSizeWH } from "./sizeUtils";

// Transparent PNG placeholder to preserve aspect (data URL)
export async function makeTransparentPngDataUrlForAspect(artSize, longEdge = 1200) {
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
export function resolveToSrc(img) {
  if (!img) return null;
  if (typeof img === "string") return img; // http(s), data:, blob:
  if (img instanceof Blob) return URL.createObjectURL(img); // File is a Blob
  return null;
}

/* ---------- Upload helpers ---------- */
export const srcToFile = async (src, name = "framex") => {
  if (src instanceof File) return src;

  const res = await fetch(src);
  if (!res.ok) throw new Error("Failed to read image for upload");
  const blob = await res.blob();

  const ext = blob.type?.split("/")?.[1] || "jpg";
  return new File([blob], `${name}.${ext}`, { type: blob.type || "image/jpeg" });
};

export const isFileLike = (x) => x instanceof File || x instanceof Blob;

export const toUploadFile = async (maybeFile, maybeSrc, name) => {
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
