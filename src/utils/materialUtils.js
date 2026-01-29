export const normalize = (s) => String(s || "").trim().toLowerCase();
export const safeId = (o) => o?.id || o?._id || "";

export function findMaterialExact(materials, name) {
  const want = normalize(name);
  return (materials || []).find((m) => normalize(m.name) === want) || null;
}

export function findMaterialContains(materials, term) {
  const want = normalize(term);
  return (materials || []).find((m) => normalize(m.name).includes(want)) || null;
}

export function firstVariantId(material) {
  const v = material?.variants;
  if (!Array.isArray(v) || v.length === 0) return "";
  return safeId(v[0]);
}
