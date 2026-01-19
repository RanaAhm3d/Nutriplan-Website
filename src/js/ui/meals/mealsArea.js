import {
  getAllAreas,
  getAllMeals,
  getMealsByArea,
} from "../../api/mealsApi.js";

const areasContainer = document.querySelector(".areas");

areasContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const area = btn.dataset.area;

  areasContainer.querySelectorAll("button").forEach((b) => {
    b.classList.remove("bg-emerald-600", "text-white");
    b.classList.add("bg-gray-100", "text-gray-700");
  });

  btn.classList.add("bg-emerald-600", "text-white");
  btn.classList.remove("bg-gray-100", "text-gray-700");

  area === "all" ? getAllMeals() : getMealsByArea(area);
});

export async function displayMealsAreas(area) {
  const { results } = await getAllAreas(area);

  areasContainer.innerHTML += `
                <button
              class="px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
              data-area="all"
            >
              All Cuisines
            </button>
    `;
  results.forEach((area) => {
    areasContainer.innerHTML += `
            <button
              class=" px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
              data-area="${area.name}"
            >
              ${area.name}
            </button>
        `;
  });
}
