import { SetHeaderInfo } from "../common/common.js";
import { getNutritionInfo } from "../../api/nutritionApi.js";
import { LoggedItem } from "../../models/loggetItems.js";
import { getFoodLog, setFoodLog } from "../../storage/storage.js";
import { calcPercent, limits } from "../../utilis/calculatePercent.js";
import { getMealById } from "../../api/mealsApi.js";
import { ToggleSetUp } from "../common/components.js";
import { UpdateWeeklyDataOnAddingItem } from "../foodLog/foodLogUi.js";
import { SetLinkState } from "../common/common.js";

const mealDetailsSection = document.getElementById("meal-details");

let meal = null;
let nutriData = null;

export async function displayMealDetails(mealInstance, mealId) {
  meal = await getMealById(mealId);
  const { name, ingredients } = meal;

  SetLinkState(mealInstance);

  SetHeaderInfo(
    "Recipe Details",
    "View full recipe information and nutrition facts",
  );

  renderMealTemplate(meal);
  setupBackButton();

  nutriData = await getNutritionInfo(name, ingredients);

  if (nutriData) {
    renderNutritionFacts();
    enableLogButton();
  }
}

function renderMealTemplate(meal) {
  mealDetailsSection.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
        <i class="fa-solid fa-arrow-left"></i> Back to Recipes
      </button>

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div class="relative h-80 md:h-96">
          <img src="${meal.thumbnail}" alt="${
            meal.name
          }" class="w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="flex items-center gap-3 mb-3">
              <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${
                meal.category
              }</span>
              <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${
                meal.area
              }</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${
              meal.name
            }</h1>
            <div class="flex items-center gap-6 text-white/90">
              <span class="flex items-center gap-2"><i class="fa-solid fa-clock"></i> 30 min</span>
              <span class="flex items-center gap-2"><i class="fa-solid fa-utensils"></i> <span id="hero-servings">4 servings</span></span>
              <span class="flex items-center gap-2"><i class="fa-solid fa-fire"></i> <span id="hero-calories">Calculating...</span></span>
            </div>
          </div>
        </div>
      </div>

      <div id="action-button" class="flex flex-wrap gap-3 mb-8">
        <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed transition-all" disabled>
          <i class="fa-solid fa-spinner fa-spin"></i> Calculating...
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          ${renderIngredients(meal.ingredients)}
          ${renderInstructions(meal.instructions)}
          ${meal.youtube ? renderVideo(meal.youtube) : ""}
        </div>
        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-emerald-600"></i> Nutrition Facts
            </h2>
            <div id="nutrition-facts-container"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderIngredients(ingredients) {
  return `
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-list-check text-emerald-600"></i> Ingredients
        <span class="text-sm font-normal text-gray-500 ml-auto">${
          ingredients.length
        } items</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${ingredients
          .map(
            (ing) => `
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
            <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"/>
            <span class="text-gray-700"><span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderInstructions(instructions) {
  return `
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-shoe-prints text-emerald-600"></i> Instructions
      </h2>
      <div class="space-y-4">
        ${instructions
          .map(
            (ins, i) => `
          <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${
              i + 1
            }</div>
            <p class="text-gray-700 leading-relaxed pt-2">${ins}</p>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderVideo(url) {
  return `
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-video text-red-500"></i> Video Tutorial
      </h2>
      <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
        <iframe src="${url.replace(
          "watch?v=",
          "embed/",
        )}" class="absolute inset-0 w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

function setupBackButton() {
  document
    .getElementById("back-to-meals-btn")
    .addEventListener("click", ToggleSetUp);
}

function enableLogButton() {
  const actionBtn = document.getElementById("action-button");
  actionBtn.innerHTML = `
  <button id="log-meal-btn" 
  class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all" >
   <i class="fa-solid fa-clipboard-list"></i> 
   <span>Log This Meal</span>
    </button>`;

  document
    .getElementById("log-meal-btn")
    .addEventListener("click", openLogModal);
}

function renderNutritionFacts() {
  const {
    protein,
    carbs,
    fat,
    sugar,
    fiber,
    saturatedFat,
    calories,
    cholesterol,
    sodium,
  } = nutriData.perServing;

  const proteinPercent = calcPercent(protein, limits.protein);
  const carbsPercent = calcPercent(carbs, limits.carbs);
  const fatPercent = calcPercent(fat, limits.fat);
  const sugarPercent = calcPercent(sugar, limits.sugar);
  const fiberPercent = calcPercent(fiber, limits.fiber);
  const saturatedFatPercent = calcPercent(saturatedFat, limits.saturatedFat);

  document.getElementById("hero-calories").textContent =
    `${calories} cal/serving`;

  const container = document.getElementById("nutrition-facts-container");
  container.innerHTML = `
  
                    <p class="text-sm text-gray-500 mb-4">Per serving</p>

                  <div
                    class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl"
                  >
                    <p class="text-sm text-gray-600">Calories per serving</p>
                    <p class="text-4xl font-bold text-emerald-600">${nutriData.perServing.calories}</p>
                    <p class="text-xs text-gray-500 mt-1">Total: ${nutriData.totals.calories} cal</p>
                  </div>

                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span class="text-gray-700">Protein</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutriData.perServing.protein}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-emerald-500 h-2 rounded-full"
                        style="width: ${proteinPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span class="text-gray-700">Carbs</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutriData.perServing.carbs}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-blue-500 h-2 rounded-full"
                        style="width: ${carbsPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span class="text-gray-700">Fat</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutriData.perServing.fat}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-purple-500 h-2 rounded-full"
                        style="width: ${fatPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span class="text-gray-700">Fiber</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutriData.perServing.fiber}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-orange-500 h-2 rounded-full"
                        style="width: ${fiberPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                        <span class="text-gray-700">Sugar</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutriData.perServing.sugar}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-pink-500 h-2 rounded-full"
                        style="width: ${sugarPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <span class="text-gray-700">Saturated Fat</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutriData.perServing.saturatedFat}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-red-500 h-2 rounded-full"
                        style="width: ${saturatedFatPercent}%"
                      ></div>
                    </div>
                  </div>
                  
                  <div class="mt-6 pt-6 border-t border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Other</h3>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cholesterol</span>
                        <span class="font-medium">${nutriData.perServing.cholesterol}mg</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Sodium</span>
                        <span class="font-medium">${nutriData.perServing.sodium}mg</span>
                    </div>
                </div>
            </div>
                  </div>
  
  `;
}

function openLogModal() {
  const modalHTML = `
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="log-meal-modal">
            <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <div class="flex items-center gap-4 mb-6">
                    <img src="${meal.thumbnail}" alt="${meal.name}" class="w-16 h-16 rounded-xl object-cover">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
                        <p class="text-gray-500 text-sm">${meal.name}</p>
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
                    <div class="flex items-center gap-3">
                        <button id="decrease-servings"  class="serving-btn w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                            <i class="text-gray-600" data-fa-i2svg=""><svg class="svg-inline--fa fa-minus" data-prefix="fas" data-icon="minus" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z"></path></svg></i>
                        </button>
                        <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5" class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2">
                        <button id="increase-servings"class="serving-btn w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                            <i class="text-gray-600" data-fa-i2svg=""><svg class="svg-inline--fa fa-plus" data-prefix="fas" data-icon="plus" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"></path></svg></i>
                        </button>
                    </div>
                </div>
                
                
                <div class="bg-emerald-50 rounded-xl p-4 mb-6">
                    <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div>
                            <p class="text-lg font-bold text-emerald-600" id="modal-calories">${nutriData.perServing.calories}</p>
                            <p class="text-xs text-gray-500">Calories</p>
                        </div>
                        <div>
                            <p class="text-lg font-bold text-blue-600" id="modal-protein">${nutriData.perServing.protein}g</p>
                            <p class="text-xs text-gray-500">Protein</p>
                        </div>
                        <div>
                            <p class="text-lg font-bold text-amber-600" id="modal-carbs">${nutriData.perServing.carbs}g</p>
                            <p class="text-xs text-gray-500">Carbs</p>
                        </div>
                        <div>
                            <p class="text-lg font-bold text-purple-600" id="modal-fat"> ${nutriData.perServing.fat}g</p>
                            <p class="text-xs text-gray-500">Fat</p>
                        </div>
                    </div>
                </div>
                
                
                <div class="flex gap-3">
                    <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                        Cancel
                    </button>
                    <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                        <i class="mr-2" data-fa-i2svg=""><svg class="svg-inline--fa fa-clipboard-list" data-prefix="fas" data-icon="clipboard-list" role="img" viewBox="0 0 384 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M311.4 32l8.6 0c35.3 0 64 28.7 64 64l0 352c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l8.6 0C83.6 12.9 104.3 0 128 0L256 0c23.7 0 44.4 12.9 55.4 32zM248 112c13.3 0 24-10.7 24-24s-10.7-24-24-24L136 64c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0zM128 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm32 0c0 13.3 10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-112 0c-13.3 0-24 10.7-24 24zm0 128c0 13.3 10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-112 0c-13.3 0-24 10.7-24 24zM96 416a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"></path></svg></i>
                        Log Meal
                    </button>
                </div>
            </div>
        </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  document
    .getElementById("cancel-log-meal")
    .addEventListener("click", closeLogModal);
  document
    .getElementById("confirm-log-meal")
    .addEventListener("click", logMeal);
  document
    .querySelectorAll(".serving-btn")
    .forEach((btn) => btn.addEventListener("click", adjustServings));
  document.getElementById("log-meal-modal").addEventListener("click", (e) => {
    if (e.target.id === "log-meal-modal") closeLogModal();
  });
}

function closeLogModal() {
  document.getElementById("log-meal-modal")?.remove();
}

function adjustServings(e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const input = document.getElementById("meal-servings");

  const step = parseFloat(input.step);
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  let value = parseFloat(input.value);

  if (btn.id === "increase-servings" && value + step <= max) {
    input.value = (value + step).toFixed(1);
  }

  if (btn.id === "decrease-servings" && value - step >= min) {
    input.value = (value - step).toFixed(1);
  }
}

function logMeal() {
  const servings = parseFloat(document.getElementById("meal-servings").value);

  const mealForLog = {
    type: "Recipe",
    name: meal.name,
    thumbnail: meal.thumbnail,
    serving: servings,
    nutrients: {
      calories: nutriData.perServing.calories * servings,
      protein: nutriData.perServing.protein * servings,
      carbs: nutriData.perServing.carbs * servings,
      fat: nutriData.perServing.fat * servings,
    },
  };

  const loggedRecipe = new LoggedItem(mealForLog);
  const storedItems = getFoodLog();
  storedItems.push(loggedRecipe);
  setFoodLog(storedItems);
  UpdateWeeklyDataOnAddingItem(loggedRecipe);

  Swal.fire({
    title: "Meal Logged!",
    icon: "success",
    html: `<p class="text-gray-600">${
      meal.name
    } (${servings} serving) added to your daily log.</p>
           <p class="text-emerald-600 font-semibold mt-2">+${
             nutriData.perServing.calories * servings
           } calories</p>`,
    showConfirmButton: false,
    timer: 1500,
  });

  closeLogModal();
}
