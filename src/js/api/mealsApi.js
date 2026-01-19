import { handleLoading } from "../ui/common/loading.js";
import { displayRecipes } from "../ui/meals/recipesUI.js";

const BASE_URL = "https://nutriplan-api.vercel.app/api/meals";

export async function getAllMeals() {
  handleLoading();
  try {
    const res = await fetch(`${BASE_URL}/search?q=chicken&page=1&limit=25`);
    const data = await res.json();
    const allMeals = data.results;
    displayRecipes(allMeals);
  } catch (error) {
    console.log("Error fetching all meals:", error);
  }
}

export async function getMealById(id) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    const data = await res.json();
    return data.result;
  } catch (error) {
    console.log("Error fetching meal by ID:", error);
  }
}

export async function getMealsByCategory(category) {
  handleLoading();
  try {
    const res = await fetch(
      `${BASE_URL}/filter?category=${category}&page=1&limit=all`,
    );
    const data = await res.json();
    const allMeals = data.results;
    displayRecipes(allMeals.slice(0, 20), category);
  } catch (error) {
    console.log("Error filtering meals by category:", error);
  }
}

export async function getMealsByArea(area) {
  handleLoading();
  try {
    const res = await fetch(`${BASE_URL}/filter?area=${area}&page=1&limit=all`);
    const data = await res.json();
    const allMeals = data.results;
    displayRecipes(allMeals.slice(0, 20), "", area);
  } catch (error) {
    console.log("Error filtering meals by area:", error);
  }
}

export async function getMealBySearch(query) {
  handleLoading();
  try {
    const res = await fetch(`${BASE_URL}/search?q=${query}&page=1&limit=25`);
    const data = await res.json();
    const allMeals = data.results;
    displayRecipes(allMeals, "", "", query);
  } catch (error) {
    console.log("Error searching meals:", error);
  }
}

export async function getAllAreas() {
  try {
    const res = await fetch(`${BASE_URL}/areas`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("Error fetching area list:", error);
  }
}

export async function getAllMealTypes() {
  try {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("Error fetching category list:", error);
  }
}
