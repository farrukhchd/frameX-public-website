export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// accepts: 4x6, 4" x 6", 4 × 6
export function parseSizeWH(raw) {
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

export function parseThicknessToInches(thickness) {
  const t = String(thickness ?? "").replaceAll('"', "").trim();
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

export function calcFinalFrameSize(artSize, matInches) {
  if (!matInches) return artSize;
  const { w, h } = parseSizeWH(artSize);
  const add = matInches * 2;
  return `${w + add}x${h + add}`;
}

export function formatSizeText(raw) {
  const { w, h } = parseSizeWH(raw);
  return `${w} x ${h}`;
}
