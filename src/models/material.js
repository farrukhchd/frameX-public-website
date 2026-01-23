// Variant model (matches Dart)
export function parseVariant(json) {
  return {
    id: json?._id ?? null,
    thickness: json?.thickness ?? null,
    price: Number(json?.price ?? 0),
    unit: json?.unit ?? "per square foot",
  };
}

// Material model (matches Dart)
export function parseMaterial(json) {
  return {
    id: json?._id ?? "",
    name: json?.name ?? "",
    variants: Array.isArray(json?.variants)
      ? json.variants.map(parseVariant)
      : [],
  };
}
