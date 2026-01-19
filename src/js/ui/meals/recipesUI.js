import { getMealBySearch, getAllMeals } from "../../api/mealsApi.js";
import { displayMealDetails } from "../meals/mealDetailsUI.js";
import { ToggleSetUp } from "../common/components.js";

export async function displayRecipes(
  recipes = [],
  category = "",
  area = "",
  query = "",
) {
  let text;
  if (category) {
    text = `Showing ${recipes?.length} ${category} recipes`;
  } else if (area) {
    text = `Showing ${recipes?.length} ${area} recipes`;
  } else if (query) {
    text = `Showing ${recipes?.length} recipes  for "${query}"`;
  } else {
    text = `Showing ${recipes?.length} recipes`;
  }
  document.getElementById("recipes-count").innerHTML = text;
  const recipesContainer = document.getElementById("recipes-grid");
  recipesContainer.innerHTML = "";
  if (recipes?.length === 0) {
    recipesContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">No recipes found</p>
        <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
      </div>
    `;
    return;
  }
  recipes?.forEach((recipe) => {
    recipesContainer.innerHTML += `
                <div
                onclick="GetRecipeDetails(this, '${recipe?.id}')"
              class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              data-meal-id="${recipe?.id}"
              data-target="meal/${recipe.name.replace(" ", "-").toLowerCase()}"
            >
              <div class="relative h-48 overflow-hidden">
                <img
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src="${recipe?.thumbnail}"
                  alt="${recipe?.name}"
                  loading="lazy"
                />
                <div class="absolute bottom-3 left-3 flex gap-2">
                  <span
                    class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"
                  >
                    ${recipe?.category}
                  </span>
                  <span
                    class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white"
                  >
                    ${recipe?.area}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <h3
                  class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
                >
                ${recipe?.name}
                </h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                  ${recipe?.instructions[0]}
                </p>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-gray-900">
                    <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                    ${recipe?.category}
                  </span>
                  <span class="font-semibold text-gray-500">
                    <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                    ${recipe?.area}
                  </span>
                </div>
              </div>
            </div>
    `;
  });
}

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query === "") {
    getAllMeals();
  } else {
    getMealBySearch(query);
  }
});

window.GetRecipeDetails = function (meal, mealId) {
  displayMealDetails(meal, mealId);
  ToggleSetUp();
};
