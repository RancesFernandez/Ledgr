export const isCountUnit = (unit) =>
  ["un", "unidad", "unidades", "ud", "u"].includes(
    String(unit || "").toLowerCase(),
  );
export function consumption(line, ingredient, sold, yieldCount) {
  const amount = (Number(line.qty) * Number(sold)) / Number(yieldCount);
  if (!Number.isFinite(amount) || amount <= 0)
    throw new Error(`Cantidad inválida de ${ingredient.name}.`);
  if (isCountUnit(ingredient.unit) && !Number.isInteger(amount))
    throw new Error(
      `La receta requiere ${amount} unidades de ${ingredient.name}. Las unidades no se pueden fraccionar: ajustá el rendimiento, la cantidad de la receta o la cantidad vendida.`,
    );
  return isCountUnit(ingredient.unit)
    ? amount
    : Math.round((amount + Number.EPSILON) * 1e8) / 1e8;
}
export function recipeCost(recipe, ingredients) {
  const raw = (recipe.ingredients || []).reduce(
    (sum, line) =>
      sum +
      Number(ingredients.find((i) => i.id === line.id)?.cost || 0) *
        Number(line.qty || 0),
    0,
  );
  const base = raw + Number(recipe.labor || 0);
  return (
    base +
    (recipe.overheadMode === "fixed"
      ? Number(recipe.overheadValue ?? recipe.overhead ?? 0)
      : (base * Number(recipe.overheadValue ?? recipe.overhead ?? 0)) / 100)
  );
}
export function sellingPrice(recipe, ingredients) {
  const cost =
    recipeCost(recipe, ingredients) / Math.max(1, Number(recipe.yield) || 1);
  if (recipe.priceSource !== "margin") return Number(recipe.price || 0);
  const value = Number(recipe.profitValue ?? recipe.margin ?? 0);
  return recipe.profitMode === "fixed"
    ? cost + value
    : cost * (1 + value / 100);
}
