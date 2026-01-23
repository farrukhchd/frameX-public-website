export function parseMoulding(json) {
  return {
    id: json._id ?? json.id ?? "",
    code: json.code ?? "",
    name: json.name ?? "",
    tagline: json.tagline ?? null,
    description: json.description ?? null,
    material: json.material ?? "",
    stock: json.stock ?? "",
    status: json.status ?? "",
    color: json.color ?? null,
    ratePerLength: Number(json.rate_per_length ?? json.ratePerLength ?? 0),
    width: Number(json.width ?? 0),
    cornerImage: json.corner_image ?? json.cornerImage ?? null,
    borderImage: json.border_image ?? json.borderImage ?? null,
    model3d: json.model_3d ?? json.model3d ?? null,
  };
}
