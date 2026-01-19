const BASE_URL = "https://nutriplan-api.vercel.app/api/nutrition";
const API_KEY = "WT2H0yI6iU4vFntd41ZgiJYDBUh0vl2qzxSKPuOi";

import { nutritionLoading } from "../ui/common/loading.js";

export async function getNutritionInfo(recipeName, ingredients) {
  nutritionLoading();
  try {
    const FormattedIngredients = ingredients.map((ing) =>
      `${ing.measure} ${ing.ingredient}`.trim()
    );
    const res = await fetch(`${BASE_URL}/analyze`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeName,
        ingredients: FormattedIngredients,
      }),
    });
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.log("Error analyzing recipe:", error);
  }
}
