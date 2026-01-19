import { getAllMealTypes, getMealsByCategory } from "../../api/mealsApi.js";
import { mealsStyle } from "../../config/Styles.js";

const categoriesGrid = document.getElementById("categories-grid");
categoriesGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".category-card");
  if (!card) return;

  const category = card.dataset.category;
  getMealsByCategory(category);
});

export async function displayMealsCategories() {
  const { results } = await getAllMealTypes();
  categoriesGrid.innerHTML = "";

  results.slice(0, 12).forEach((category) => {
    const config = mealsStyle[category.name];

    categoriesGrid.innerHTML += `
        <div
          class="category-card bg-gradient-to-br ${config.bgGradient} ${config.hoverBg} ${config.borderColor} rounded-xl p-3 border hover:border-opacity-100 hover:shadow-lg cursor-pointer transition-all group"
          data-category="${category.name}"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="text-white w-9 h-9 bg-gradient-to-br ${config.bgIcon} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
            >
              <i class="${config.icon}"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">${category.name}</h3>
            </div>
          </div>
        </div>
      `;
  });
}
