export function parseMoulding(json) {
  const stockRaw = json.stock ?? json.in_stock ?? json.inStock ?? "";
  const statusRaw = json.status ?? json.is_active ?? json.active ?? "";

  return {
    id: json._id ?? json.id ?? "",
    code: json.code ?? "",
    name: json.name ?? "",
    tagline: json.tagline ?? null,
    description: json.description ?? null,
    material: json.material ?? "",
    stock: String(stockRaw ?? "").trim(),
    status: String(statusRaw ?? "").trim(),
    color: json.color ?? null,
    ratePerLength: Number(json.rate_per_length ?? json.ratePerLength ?? 0),
    width: Number(json.width ?? 0),
    cornerImage: json.corner_image ?? json.cornerImage ?? null,
    borderImage: json.border_image ?? json.borderImage ?? null,
    model3d: json.model_3d ?? json.model3d ?? null,
  };
}
