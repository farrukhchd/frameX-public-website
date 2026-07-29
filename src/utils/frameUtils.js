export function isFrameAvailable(frame) {
  if (!frame || typeof frame !== "object") return false;

  const stock = String(frame.stock ?? "").trim().toLowerCase();
  const status = String(frame.status ?? "").trim().toLowerCase();

  return (stock === "in stock" || stock === "instock") && status === "active";
}

export function filterAvailableFrames(frames) {
  if (!Array.isArray(frames)) return [];
  return frames.filter(isFrameAvailable);
}
