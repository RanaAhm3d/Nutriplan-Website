import { hideLoadingOverlay } from "./ui/common/loading.js";
import { getAllMeals } from "./api/mealsApi.js";
import { getAllProductsCategory } from "./api/productsApi.js";
import { updateFoodLogDate } from "./ui/foodLog/foodLogUi.js";
import { SetHeaderInfo } from "./ui/common/common.js";
import { displayMealsCategories } from "./ui/meals/mealsCategories.js";
import { displayMealsAreas } from "./ui/meals/mealsArea.js";

window.addEventListener("load", () => {
  setTimeout(() => hideLoadingOverlay(), 1000);
});

const navLinks = document.querySelectorAll(".nav-link");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const sidebar = document.querySelector("#sidebar");
const sidebarToggle = document.getElementById("header-menu-btn");
const sidebarClose = document.getElementById("sidebar-close-btn");

const sections = document.querySelectorAll(".app-section");
const recipesSearch = document.querySelector("#search-filters-section");
const mealCategories = document.querySelector("#meal-categories-section");
const mealDetailsSection = document.getElementById("meal-details");

const listViewBtn = document.getElementById("list-view-btn");
const gridViewBtn = document.getElementById("grid-view-btn");
const gridContainer = document.getElementById("recipes-grid");

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("active");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("active");
}

sidebarToggle.addEventListener("click", openSidebar);

sidebarClose.addEventListener("click", closeSidebar);

sidebarOverlay.addEventListener("click", closeSidebar);

function clearNavActive() {
  navLinks.forEach((link) => {
    link.classList.remove("bg-emerald-50", "text-emerald-700");
    link.classList.add("text-gray-600");
    const span = link.querySelector("span");
    if (span) {
      span.classList.remove("font-semibold");
      span.classList.add("font-medium");
    }
  });
}

function setNavActive(target) {
  const activeLink = document.querySelector(
    `.nav-link[data-target="${target}"]`,
  );
  if (activeLink) {
    activeLink.classList.remove("text-gray-600");
    activeLink.classList.add("bg-emerald-50", "text-emerald-700");

    const span = activeLink.querySelector("span");
    if (span) {
      span.classList.remove("font-medium");
      span.classList.add("font-semibold");
    }
  }
}

export function showSection(target) {
  sections.forEach((section) => {
    section.classList.add("hidden");
    mealDetailsSection.classList.add("hidden");
  });

  const sectionToShow = document.querySelector(
    `.app-section[data-section="${target}"]`,
  );
  if (sectionToShow) sectionToShow.classList.remove("hidden");

  if (target === "recipes") {
    recipesSearch.classList.remove("hidden");
    mealCategories.classList.remove("hidden");
    SetHeaderInfo(
      "Meals & Recipes",
      "Discover delicious and nutritious recipes tailored for you",
    );
  } else {
    recipesSearch.classList.add("hidden");
    mealCategories.classList.add("hidden");
    if (target === "products")
      SetHeaderInfo(
        "Product Scanner",
        "Search packaged foods by name or barcode",
      );
    else if (target === "foodlog")
      SetHeaderInfo("Food Log", "Track your daily nutrition and food intake");
  }

  clearNavActive();
  setNavActive(target);
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.target;
    if (!target) return;

    history.pushState(null, null, `#${target}`);

    showSection(target);
    closeSidebar();
  });
});

function switchView(mode) {
  const recipeCards = document.querySelectorAll(".recipe-card");

  const isList = mode === "list";

  listViewBtn.classList.toggle("bg-white", isList);
  listViewBtn.classList.toggle("shadow-sm", isList);

  gridViewBtn.classList.toggle("bg-white", !isList);
  gridViewBtn.classList.toggle("shadow-sm", !isList);

  gridContainer.classList.toggle("grid-cols-2", isList);
  gridContainer.classList.toggle("gap-4", isList);

  gridContainer.classList.toggle("grid-cols-4", !isList);
  gridContainer.classList.toggle("gap-5", !isList);

  recipeCards.forEach((card) => {
    const imageWrapper = card.querySelector(".relative");
    const badge = card.querySelector(".relative .absolute.bottom-3");
    const img = card.querySelector("img");

    card.classList.toggle("flex", isList);
    card.classList.toggle("flex-row", isList);
    card.classList.toggle("h-40", isList);

    imageWrapper.classList.toggle("h-48", !isList);
    imageWrapper.classList.toggle("h-full", isList);
    imageWrapper.classList.toggle("w-48", isList);
    imageWrapper.classList.toggle("flex-shrink-0", isList);

    badge?.classList.toggle("hidden", isList);
    img?.classList.toggle("h-full", !isList);
  });
}

listViewBtn.addEventListener("click", () => switchView("list"));
gridViewBtn.addEventListener("click", () => switchView("grid"));

function init() {
  getAllMeals();
  displayMealsCategories();
  displayMealsAreas();
  updateFoodLogDate();
  getAllProductsCategory();
  showSection("recipes");
}

init();
