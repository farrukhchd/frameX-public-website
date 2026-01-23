import { parsePrintSize } from "../models/printSize";
import { parseMoulding } from "../models/moulding";
import { parseMaterial } from "../models/material";
import { parseCostFactor } from "../models/costFactor";

// const API_BASE = "https://admin.framex.pk/api";
const API_BASE = "http://localhost:5001/api";

/* ---------------- Print Sizes ---------------- */
export async function fetchPrintSizes() {
  const res = await fetch(`${API_BASE}/print-sizes`);
  if (!res.ok) throw new Error("Failed to fetch print sizes");
  const data = await res.json();
  return data.map(parsePrintSize).sort((a, b) => a.sort - b.sort);
}

/* ---------------- Mouldings ---------------- */
export async function fetchMouldings() {
  const res = await fetch(`${API_BASE}/mouldings`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Mouldings API error:", res.status, text);
    throw new Error("Failed to fetch mouldings");
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(parseMoulding) : [];
}

/* ---------------- Materials ---------------- */
export async function fetchMaterials() {
  const res = await fetch(`${API_BASE}/materials`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Materials API error:", res.status, text);
    throw new Error("Failed to fetch materials");
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(parseMaterial) : [];
}

/* ---------------- Cost Factors ---------------- */
export async function fetchCostFactors() {
  const res = await fetch(`${API_BASE}/cost-factors`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("CostFactors API error:", res.status, text);
    throw new Error("Failed to fetch cost factors");
  }
  const data = await res.json();
  return parseCostFactor(data);
}
/* ---------------- PostEx Cities ---------------- */
export async function fetchCities() {
  const res = await fetch(`${API_BASE}/postex/cities`);
  if (!res.ok) throw new Error(`Failed to load cities: ${res.status}`);

  const data = await res.json();

  if (Array.isArray(data)) {
    return data
      .map((c) => String(c?.operationalCityName || "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }

  throw new Error("Unexpected city response format");
}

/* ---------------- Orders: Guest Create ---------------- */
export async function createOrder(orderJson) {
  const res = await fetch(`${API_BASE}/orders/guest-create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderJson),
  });

  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text
  }

  if (!res.ok) {
    console.error("Create order API error:", res.status, data || text);
    throw new Error(data?.message || text || "Failed to create order");
  }

  return data?.orderId || data?.id || data;
}

export { API_BASE };
