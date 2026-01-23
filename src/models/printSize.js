export function parsePrintSize(json) {
  return {
    id: json._id,
    size: json.size,
    price: Number(json.price || 0),
    cost: Number(json.cost || 0),
    sort: json.sort ?? 0,
  };
}
