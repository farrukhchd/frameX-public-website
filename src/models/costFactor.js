export function parseCostFactor(json) {
  return {
    labor_cost_per_item: Number(json?.labor_cost_per_item ?? 0),
    marketing_percent: Number(json?.marketing_percent ?? 0),
    daily_rent: Number(json?.daily_rent ?? 0),
    average_items_per_day: Number(json?.average_items_per_day ?? 1),
    profit_margin_percent: Number(json?.profit_margin_percent ?? 1),
  };
}
