import { safeId } from "./materialUtils";

export const moneyPKR = (n) =>
  `Rs. ${Math.round(Number(n || 0)).toLocaleString("en-PK")}`;

export function calculateCostWeb({
  artSize,
  selectedVariants,
  materials,
  costFactors,
  frame, // moulding object
}) {
  const clean = String(artSize || "")
    .replaceAll('"', "")
    .replaceAll(" ", "")
    .replaceAll("×", "x")
    .toLowerCase();

  const parts = clean.split("x");
  const width = parts.length === 2 ? Number(parts[0]) || 0 : 0;
  const height = parts.length === 2 ? Number(parts[1]) || 0 : 0;

  const squareFeet = (width * height) / 144;

  // perimeter
  const perimeterInches = 2 * (width + height);
  const runningFeet = perimeterInches / 12;

  let cost = 0;

  // --- Material Cost (existing)
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

  // ✅ Frame/Moulding cost (NEW)
  // Your API gives: rate_per_length (e.g., 200)
  const frameRate = Number(frame?.rate_per_length ?? frame?.ratePerLength ?? 0);
  if (frameRate > 0) {
      const perimeterInches = 2 * (width + height);
      const runningFeet = perimeterInches / 12;
    // Treat as per running-foot
    cost += runningFeet * frameRate;
  }

  // --- Extra Cost Factors (existing)
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
