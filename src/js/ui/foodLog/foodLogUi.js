import { showSection } from "../../main.js";
import { hideLoadingOverlay } from "../common/loading.js";
import {
  getFoodLog,
  setFoodLog,
  LoadCachedLogByDate,
  CacheLogByDate,
} from "../../storage/storage.js";
import { showDeletedFoodLogMessage } from "../common/components.js";
import { SetLinkState } from "../common/common.js";

const foodLogDate = document.getElementById("foodlog-date");
const foodLogContainer = document.getElementById("logged-items-list");
const loggedCount = document.getElementById("logged-count");
const clearAllBtn = document.getElementById("clear-foodlog");

document.addEventListener("DOMContentLoaded", () => {
  displayFoodLog(getFoodLog());
  RenderWeeklyOverview();
});

const DAILY_GOALS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
};

export function updateFoodLogDate() {
  const today = getTodayString();
  foodLogDate.textContent = today;
}

function getTodayString() {
  const today = new Date();

  const options = {
    weekday: "long",
    month: "short",
    day: "numeric",
  };

  return today.toLocaleDateString("en-US", options);
}

function calculateTotals(loggedFood) {
  return loggedFood.reduce(
    (totals, food) => {
      totals.calories += food.nutrition.calories || 0;
      totals.protein += food.nutrition.protein || 0;
      totals.carbs += food.nutrition.carbs || 0;
      totals.fat += food.nutrition.fat || 0;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function RemoveDataFromWeeklyOverview(item) {
  const today = new Date().toDateString();
  const itemDate = new Date(item.loggedAt).toDateString();

  if (itemDate === today) {
    let cachedLogged = LoadCachedLogByDate(today);
    cachedLogged.calories -= item.nutrition.calories;
    cachedLogged.items -= 1;

    CacheLogByDate(today, cachedLogged);
  }
  RenderWeeklyOverview();
}

export function UpdateWeeklyDataOnAddingItem(item) {
  const currentDay = new Date(item.loggedAt).toDateString();
  let cachedLogged = LoadCachedLogByDate(currentDay);
  cachedLogged.calories += item.nutrition.calories;
  cachedLogged.items += 1;
  CacheLogByDate(currentDay, cachedLogged);

  RenderWeeklyOverview();
}

function RenderWeeklyOverview() {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  const weeklyOverviewContainer = document.getElementById("weekly-chart");
  weeklyOverviewContainer.innerHTML = "";

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    const selectedDate = today.getDate() - i;
    date.setDate(selectedDate);
    const dayName = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const isToday = i === 0;

    const dateToRender = new Date(
      today.getFullYear(),
      today.getMonth(),
      selectedDate,
    ).toDateString();

    const cachedLogged = LoadCachedLogByDate(dateToRender);

    weeklyOverviewContainer.innerHTML += `
    <div class="text-center  ${isToday ? "bg-indigo-100 rounded-xl" : ""}">
    <p class="text-xs text-gray-500 mb-1">${dayName}</p>
    <p class="text-sm font-medium text-gray-900">${dayNumber}</p>
    <div class="mt-2 ${cachedLogged.calories > 0 ? "text-emerald-600" : "text-gray-300"}  ">
      <p class="text-lg font-bold">${cachedLogged.calories}</p>
      <p class="text-xs">kcal</p>
      ${cachedLogged.items > 0 ? `<p class="text-xs text-gray-400 mt-1">${cachedLogged.items} items</p>` : ""} 
    </div>
    </div>`;
  }

  RenderWeeklySummary();
}

function RenderWeeklySummary() {
  let averageCalories = 0;
  let totalItems = 0;
  let achievedDailyGoals = 0;
  for (let i = 6; i >= 0; i--) {
    const today = new Date();
    const selectedDate = today.getDate() - i;
    const dateToRender = new Date(
      today.getFullYear(),
      today.getMonth(),
      selectedDate,
    ).toDateString();

    averageCalories += LoadCachedLogByDate(dateToRender).calories;
    totalItems += LoadCachedLogByDate(dateToRender).items;
    averageCalories > 1600 && averageCalories < 2400
      ? achievedDailyGoals++
      : null;
  }
  averageCalories /= 7;
  averageCalories = Math.round(averageCalories);

  const summaryContainer = document.getElementById("weekly-summary");

  summaryContainer.innerHTML = `
    <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
          <i class="text-emerald-600 text-xl fa-solid fa-chart-line"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Weekly Average</p>
          <p class="text-xl font-bold text-gray-900">${averageCalories} kcal</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <i class="text-blue-600 text-xl fa-solid fa-utensils"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Items This Week</p>
          <p class="text-xl font-bold text-gray-900">${totalItems} items</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <i class="text-purple-600 text-xl fa-solid fa-bullseye"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Days On Goal</p>
          <p class="text-xl font-bold text-gray-900">${achievedDailyGoals} / 7</p>
        </div>
      </div>
    </div>
  `;
}

function updateNutritionBars(loggedFood) {
  const totals = calculateTotals(loggedFood);

  updateBar("calories", totals.calories, DAILY_GOALS.calories);
  updateBar("protein", totals.protein, DAILY_GOALS.protein);
  updateBar("carbs", totals.carbs, DAILY_GOALS.carbs);
  updateBar("fat", totals.fat, DAILY_GOALS.fat);
}

function updateBar(type, value, max) {
  const percentRaw = (value / max) * 100;
  const percent = Math.min(percentRaw, 100).toFixed(0);

  const bar = document.getElementById(`${type}-bar`);
  const percentText = document.getElementById(`${type}-percent`);
  const valueText = document.getElementById(`${type}-value`);

  let unit = "";
  switch (type) {
    case "calories":
      unit = "kcal";
      break;
    case "protein":
    case "carbs":
    case "fat":
      unit = "g";
      break;
  }

  bar.style.width = `${percent}%`;
  percentText.textContent = `${percent}%`;
  valueText.textContent = `${Math.round(value)} ${unit}`;

  if (value > max) {
    bar.classList.remove(
      "bg-emerald-500",
      "bg-blue-500",
      "bg-amber-500",
      "bg-purple-500",
    );
    bar.classList.add("bg-red-500");
    percentText.classList.add("text-red-600");
    valueText.classList.add("text-red-600");
  } else {
    bar.classList.remove("bg-red-500");
    percentText.classList.remove("text-red-600");
    valueText.classList.remove("text-red-600");

    const colors = {
      calories: "bg-emerald-500",
      protein: "bg-blue-500",
      carbs: "bg-amber-500",
      fat: "bg-purple-500",
    };

    bar.classList.add(colors[type]);
  }
}

export function displayFoodLog(loggedFood) {
  foodLogContainer.innerHTML = "";
  if (loggedFood.length === 0) {
    clearAllBtn.classList.add("hidden");
    updateNutritionBars([]);

    loggedCount.textContent = `Logged Items (0)`;
    foodLogContainer.innerHTML = `
<div class="text-center py-12">
                    <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="text-3xl text-gray-300" data-fa-i2svg=""><svg class="svg-inline--fa fa-utensils" data-prefix="fas" data-icon="utensils" role="img" viewBox="0 0 512 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M63.9 14.4C63.1 6.2 56.2 0 48 0s-15.1 6.2-16 14.3L17.9 149.7c-1.3 6-1.9 12.1-1.9 18.2 0 45.9 35.1 83.6 80 87.7L96 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7 0-6.1-.6-12.2-1.9-18.2L223.9 14.3C223.1 6.2 216.2 0 208 0s-15.1 6.2-15.9 14.4L178.5 149.9c-.6 5.7-5.4 10.1-11.1 10.1-5.8 0-10.6-4.4-11.2-10.2L143.9 14.6C143.2 6.3 136.3 0 128 0s-15.2 6.3-15.9 14.6L99.8 149.8c-.5 5.8-5.4 10.2-11.2 10.2-5.8 0-10.6-4.4-11.1-10.1L63.9 14.4zM448 0C432 0 320 32 320 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-448c0-17.7-14.3-32-32-32z"></path></svg></i>
                    </div>
                    <p class="text-gray-500 font-medium mb-2">No food logged today</p>
                    <p class="text-gray-400 text-sm mb-4">Start tracking your nutrition by logging meals or scanning products</p>
                    <div class="flex justify-center gap-3">
                        <a id="browse-recipes-btn" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all" data-target="foodlog#meals">
                            <i data-fa-i2svg=""><svg class="svg-inline--fa fa-plus" data-prefix="fas" data-icon="plus" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"></path></svg></i>
                            Browse Recipes
                        </a>
                        <a href="#products" id="scan-product-btn" class="nav-link inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                            <i data-fa-i2svg=""><svg class="svg-inline--fa fa-barcode" data-prefix="fas" data-icon="barcode" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M32 32C14.3 32 0 46.3 0 64L0 448c0 17.7 14.3 32 32 32s32-14.3 32-32L64 64c0-17.7-14.3-32-32-32zm88 0c-13.3 0-24 10.7-24 24l0 400c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24zm72 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384c0-17.7-14.3-32-32-32s-32 14.3-32 32zm208-8l0 400c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24s-24 10.7-24 24zm-96 0l0 400c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24s-24 10.7-24 24z"></path></svg></i>
                            Scan Product
                        </a>
                    </div>
                </div>
                
    `;
    const browseRecipesBtn = document.getElementById("browse-recipes-btn");
    browseRecipesBtn.addEventListener("click", (e) => {
      // e.preventDefault();
      showSection("recipes");
      SetLinkState(e.target);
    });

    const scanProductBtn = document.getElementById("scan-product-btn");
    scanProductBtn.addEventListener("click", () => {
      const appLoadingOverlay = document.getElementById("app-loading-overlay");
      if (!appLoadingOverlay) return;

      appLoadingOverlay.style.display = "flex";
      appLoadingOverlay.style.opacity = "1";
      appLoadingOverlay.style.transition = "opacity 0.3s ease-in";

      setTimeout(() => {
        showSection("products");
        appLoadingOverlay.style.display = "none";
        hideLoadingOverlay();
      }, 800);
    });
  } else {
    clearAllBtn.classList.remove("hidden");
    updateNutritionBars(loggedFood);

    loggedCount.textContent = `Logged Items (${loggedFood.length})`;
    loggedFood.forEach((food) => {
      const time = new Date(food.loggedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      foodLogContainer.innerHTML += `<div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
                        <div class="flex items-center gap-4">
                          ${
                            food.type === "Product"
                              ? `    <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <i class="text-blue-600 text-xl" data-fa-i2svg=""><svg class="svg-inline--fa fa-box" data-prefix="fas" data-icon="box" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"></path></svg></i>
                                        </div>`
                              : `<img src="${food.image}" alt="${food.image}" class="w-14 h-14 rounded-xl object-cover">`
                          }
                        
                            <div>
                                <p class="font-semibold text-gray-900">${
                                  food.name
                                }</p>
                                <p class="text-sm text-gray-500">
                                
                                    ${
                                      food.type === "Product"
                                        ? food.brand
                                        : `${food.serving} serving`
                                    }
                                    <span class="mx-1">•</span>
                                    <span class="${
                                      food.type === "Product"
                                        ? "text-blue-600"
                                        : "text-emerald-600"
                                    } ">${food.type}</span>
                                </p>
                                <p class="text-xs text-gray-400 mt-1">${time}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="text-right">
                                <p class="text-lg font-bold text-emerald-600">${
                                  food.nutrition.calories
                                }</p>
                                <p class="text-xs text-gray-500">kcal</p>
                            </div>
                            <div class="hidden md:flex gap-2 text-xs text-gray-500">
                                <span class="px-2 py-1 bg-blue-50 rounded">${food.nutrition.protein.toFixed(
                                  0,
                                )}g P</span>
                                <span class="px-2 py-1 bg-amber-50 rounded">${food.nutrition.carbs.toFixed(
                                  0,
                                )}g C</span>
                                <span class="px-2 py-1 bg-purple-50 rounded">${food.nutrition.fat.toFixed(
                                  0,
                                )}g F</span>
                            </div>
                            <button  class="remove-foodlog-item text-gray-400 hover:text-red-500 transition-all p-2" >
                                <i data-fa-i2svg=""><svg class="svg-inline--fa fa-trash-can" data-prefix="fas" data-icon="trash-can" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M136.7 5.9C141.1-7.2 153.3-16 167.1-16l113.9 0c13.8 0 26 8.8 30.4 21.9L320 32 416 32c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 8.7-26.1zM32 144l384 0 0 304c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-304zm88 64c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24z"></path></svg></i>
                            </button>
                        </div>
                    </div>`;
    });
  }
}

clearAllBtn.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will remove all logged foods!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, clear all",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      const loggedItems = getFoodLog();
      loggedItems.forEach((item) => {
        RemoveDataFromWeeklyOverview(item);
      });
      localStorage.removeItem("loggedItems");
      displayFoodLog([]);

      Swal.fire({
        title: "Cleared!",
        text: "Your food log has been cleared successfully 🧹",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      showDeletedFoodLogMessage(`Todays's log cleared`);
    }
  });
});

foodLogContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove-foodlog-item");
  if (!btn) return;

  const index = [
    ...foodLogContainer.querySelectorAll(".remove-foodlog-item"),
  ].indexOf(btn);

  const stored = getFoodLog();
  RemoveDataFromWeeklyOverview(stored[index]);
  stored.splice(index, 1);
  showDeletedFoodLogMessage(`Item removed from log`);
  setFoodLog(stored);
  displayFoodLog(stored);
});
