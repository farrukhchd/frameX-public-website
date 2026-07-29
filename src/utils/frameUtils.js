const AVAILABLE_STOCK_VALUES = new Set([
  "in stock",
  "instock",
  "yes",
  "true",
  "available",
  "1",
]);
const ACTIVE_STATUS_VALUES = new Set([
  "active",
  "true",
  "1",
  "available",
]);

export function isFrameAvailable(frame) {
  if (!frame || typeof frame !== "object") return false;

  const stockValue = frame.stock ?? frame.in_stock ?? frame.inStock ?? "";
  const statusValue = frame.status ?? frame.is_active ?? frame.active ?? "";

  const stock = String(stockValue ?? "").trim().toLowerCase();
  const status = String(statusValue ?? "").trim().toLowerCase();

  const hasStock = AVAILABLE_STOCK_VALUES.has(stock);
  const isActive = status === "" ? true : ACTIVE_STATUS_VALUES.has(status);

  return hasStock && isActive;
}

export function filterAvailableFrames(frames) {
  if (!Array.isArray(frames)) return [];
  return frames.filter(isFrameAvailable);
}
