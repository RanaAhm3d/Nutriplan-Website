export const limits = {
  protein: 50,
  carbs: 300,
  fat: 70,
  sugar: 50,
  fiber: 30,
  saturatedFat: 10,
};

export function calcPercent(value, max) {
  if (!max || max === 0) return 0;
  return Math.min(Math.round((value / max) * 100), 100);
}
