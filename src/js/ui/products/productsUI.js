import { getFoodLog, setFoodLog } from "../../storage/storage.js";
import {
  getProductsByBarcode,
  getProductsByCategory,
  getProductsBySearch,
} from "../../api/productsApi.js";
import { showErrorMessage, showSuccessMessage } from "../common/components.js";
import { LoggedItem } from "../../models/loggetItems.js";
import { calcPercent, limits } from "../../utilis/calculatePercent.js";
import {
  scoreBg,
  novaGroupBg,
  gradeStyle,
  novaStyle,
  CATEGORY_STYLES,
} from "../../config/Styles.js";
import { UpdateWeeklyDataOnAddingItem } from "../foodLog/foodLogUi.js";

const productsContainer = document.getElementById("products-grid");
const productsCount = document.getElementById("products-count");
const emptyState = document.getElementById("products-empty");
const productsCategoriesContainer =
  document.getElementById("product-categories");

window.currentProducts = [];

export async function loadProductsBySearch(query) {
  if (!query) return;

  const data = await getProductsBySearch(query);
  if (!data?.results) return;

  displayProduct(
    data.results.slice(0, 24),
    data.pagination?.total || data.results.length,
    query,
  );
}

export function displayProduct(products, total, query = "") {
  window.currentProducts = products;
  productsContainer.innerHTML = "";
  if (!products || products?.length === 0) {
    emptyState.classList.remove("hidden");
    productsCount.innerHTML = `No products found for "${query}" `;
    return;
  }
  emptyState.classList.add("hidden");
  productsCount.innerHTML = `Found ${total} products for "${query}" `;

  products?.forEach((product) => {
    const configScore = scoreBg[product.nutritionGrade?.toLowerCase().trim()];
    const configNova = novaGroupBg[product?.novaGroup];
    productsContainer.innerHTML += `
                      <div
                class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                data-barcode="${product?.barcode}"
                data-score = "${product?.nutritionGrade?.toLowerCase()}"
              >
                <div
                  class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                ${
                  product?.image
                    ? `                  
                  <img
                    class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    src="${product?.image}"
                    alt="${product?.name}"
                    loading="lazy"
                  />`
                    : `
                    <div class="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                        <i class="text-2xl text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-box" data-prefix="fas" data-icon="box" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"></path></svg></i>
                    </div>
                    `
                }


                  <!-- Nutri-Score Badge -->
                  <div
                    class="absolute top-2 left-2 ${configScore} text-white text-xs font-bold px-2 py-1 rounded uppercase"
                  >
                    Nutri-Score ${product.nutritionGrade?.toUpperCase()}
                  </div>

                  <!-- NOVA Badge -->
${
  product.novaGroup
    ? `
                    <div
                    class="absolute top-2 right-2 ${configNova} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                    title="NOVA ${product?.novaGroup}"
                  >
                    ${product?.novaGroup}
                  </div>
  `
    : ""
}
                </div>

                <div class="p-4">
                  <p
                    class="text-xs text-emerald-600 font-semibold mb-1 truncate"
                  >
                    ${product?.brand || "Unknown Brand"}
                  </p>
                  <h3
                    class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors"
                  >
                    ${product?.name}
                  </h3>

                  <div
                    class="flex items-center gap-3 text-xs text-gray-500 mb-3"
                  >
                    <span
                      ><i class="fa-solid fa-weight-scale mr-1"></i>250g</span
                    >
                    <span
                      ><i class="fa-solid fa-fire mr-1"></i>${
                        product.nutrients?.calories
                      } kcal/100g</span
                    >
                  </div>

                  <!-- Mini Nutrition -->
                  <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                      <p class="text-xs font-bold text-emerald-700">${product.nutrients?.protein?.toFixed(
                        1,
                      )}g</p>
                      <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                      <p class="text-xs font-bold text-blue-700">${product.nutrients?.carbs?.toFixed(
                        1,
                      )} g</p>
                      <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                      <p class="text-xs font-bold text-purple-700">${product.nutrients?.fat?.toFixed(
                        1,
                      )} g</p>
                      <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                      <p class="text-xs font-bold text-orange-700">${product.nutrients?.sugar?.toFixed(
                        1,
                      )} g</p>
                      <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                  </div>
                </div>
              </div>
        `;
  });
}

export function displaySingleProduct(product, barcode = "") {
  productsContainer.innerHTML = "";
  if (!product) {
    emptyState.classList.remove("hidden");
    productsCount.innerHTML = `No product found with barcode: ${barcode} `;
    showErrorMessage(`
        Product not found in database.
    `);
    return;
  }
  emptyState.classList.add("hidden");
  productsCount.innerHTML = `Found product: ${product?.name} `;

  productsContainer.innerHTML = `
  
                      <div
                class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                data-barcode="${product?.barcode}"
              >
                <div
                  class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                ${
                  product?.image
                    ? `                  
                  <img
                    class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    src="${product?.image}"
                    alt="${product?.name}"
                    loading="lazy"
                  />`
                    : `
                    <div class="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                        <i class="text-2xl text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-box" data-prefix="fas" data-icon="box" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"></path></svg></i>
                    </div>
                    `
                }

                  <!-- Nutri-Score Badge -->
                  <div
                    class="absolute top-2 left-2 ${
                      scoreBg[product.nutritionGrade?.toLowerCase().trim()] ||
                      "bg-gray-500"
                    } text-white text-xs font-bold px-2 py-1 rounded uppercase"
                  >
                    Nutri-Score ${product.nutritionGrade?.toUpperCase()}
                  </div>

                  <!-- NOVA Badge -->
${
  product?.novaGroup
    ? `
                    <div
                    class="absolute top-2 right-2 ${
                      novaGroupBg[product?.novaGroup]
                    } text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                    title="NOVA ${product?.novaGroup}"
                  >
                    ${product?.novaGroup}
                  </div>
  `
    : ""
}
                </div>

                <div class="p-4">
                  <p
                    class="text-xs text-emerald-600 font-semibold mb-1 truncate"
                  >
                    ${product?.brand || "Unknown Brand"}
                  </p>
                  <h3
                    class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors"
                  >
                    ${product?.name}
                  </h3>

                  <div
                    class="flex items-center gap-3 text-xs text-gray-500 mb-3"
                  >
                    <span
                      ><i class="fa-solid fa-weight-scale mr-1"></i>250g</span
                    >
                    <span
                      ><i class="fa-solid fa-fire mr-1"></i>${
                        product.nutrients?.calories
                      } kcal/100g</span
                    >
                  </div>

                  <!-- Mini Nutrition -->
                  <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                      <p class="text-xs font-bold text-emerald-700">${product.nutrients?.protein?.toFixed(
                        1,
                      )}g</p>
                      <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                      <p class="text-xs font-bold text-blue-700">${product.nutrients?.carbs?.toFixed(
                        1,
                      )} g</p>
                      <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                      <p class="text-xs font-bold text-purple-700">${product.nutrients?.fat?.toFixed(
                        1,
                      )} g</p>
                      <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                      <p class="text-xs font-bold text-orange-700">${product.nutrients?.sugar?.toFixed(
                        1,
                      )} g</p>
                      <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                  </div>
                </div>
              </div>
  `;
  window.currentProducts.push(product);
  if (barcode) {
    openProductModal(barcode);
  }
}

productsContainer.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;

  const barcode = card.dataset.barcode;
  openProductModal(barcode);
});

function openProductModal(barcode) {
  const product = window.currentProducts.find((p) => p.barcode === barcode);

  if (!product) return;

  renderProductModal(product);
}

function renderProductModal(product) {
  const { protein, carbs, fat, sugar, fiber } = product.nutrients;
  const configNova = novaStyle[product?.novaGroup];
  const configGrade = gradeStyle[product?.nutritionGrade?.toLowerCase()];

  const proteinPercent = calcPercent(protein, limits.protein);
  const carbsPercent = calcPercent(carbs, limits.carbs);
  const fatPercent = calcPercent(fat, limits.fat);
  const sugarPercent = calcPercent(sugar, limits.sugar);
  const oldModal = document.getElementById("product-detail-modal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "product-detail-modal";
  modal.className =
    "fixed inset-0 bg-black/50 flex items-center justify-center z-50";

  modal.innerHTML = `            <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                
        <div class="p-6">
            <!-- Header -->
            <div class="flex items-start gap-6 mb-6">
                <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    
                        ${
                          product.image
                            ? `<img src="${product?.image}" alt="${
                                product?.name
                              }" class="w-full h-full object-contain">`
                            : `<i class="text-4xl text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-box" data-prefix="fas" data-icon="box" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"></path></svg></i>`
                        }

                        
                    
                </div>
                <div class="flex-1">
                    <p class="text-sm text-emerald-600 font-semibold mb-1">${
                      product?.brand || "Unknown Brand"
                    }</p>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">${
                      product?.name
                    }</h2>
                    <p class="text-sm text-gray-500 mb-3">250g</p>
                    
                    <div class="flex items-center gap-3">
                        
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${
                              configGrade.color
                            }20">
                                <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold overflow-hidden" style="background-color: ${
                                  configGrade.color
                                }">
                                    ${product.nutritionGrade?.toUpperCase()}
                                </span>
                                <div>
                                    <p class="text-xs font-bold" style="color: ${
                                      configGrade.color
                                    }">Nutri-Score</p>
                                    <p class="text-[10px] text-gray-600">Bad</p>
                                </div>
                            </div>
                        
                        
                        
${
  product.novaGroup
    ? `                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${configNova.color}20">
                                <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${configNova.color}">
                                    ${product?.novaGroup}
                                </span>
                                <div>
                                    <p class="text-xs font-bold" style="color: ${configNova.color}">NOVA</p>
                                    <p class="text-[10px] text-gray-600">${configNova.label}</p>
                                </div>
                            </div>
`
    : ""
}
                        
                    </div>
                </div>
                <button class="close-product-modal text-gray-400 hover:text-gray-600">
                    <i class="text-2xl" data-fa-i2svg=""><svg class="svg-inline--fa fa-xmark" data-prefix="fas" data-icon="xmark" role="img" viewBox="0 0 384 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"></path></svg></i>
                </button>
            </div>
            
            <!-- Nutrition Facts -->
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="text-emerald-600" data-fa-i2svg=""><svg class="svg-inline--fa fa-chart-pie" data-prefix="fas" data-icon="chart-pie" role="img" viewBox="0 0 576 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M512.4 240l-176 0c-17.7 0-32-14.3-32-32l0-176c0-17.7 14.4-32.2 31.9-29.9 107 14.2 191.8 99 206 206 2.3 17.5-12.2 31.9-29.9 31.9zM222.6 37.2c18.1-3.8 33.8 11 33.8 29.5l0 197.3c0 5.6 2 11 5.5 15.3L394 438.7c11.7 14.1 9.2 35.4-6.9 44.1-34.1 18.6-73.2 29.2-114.7 29.2-132.5 0-240-107.5-240-240 0-115.5 81.5-211.9 190.2-234.8zM477.8 288l64 0c18.5 0 33.3 15.7 29.5 33.8-10.2 48.4-35 91.4-69.6 124.2-12.3 11.7-31.6 9.2-42.4-3.9L374.9 340.4c-17.3-20.9-2.4-52.4 24.6-52.4l78.2 0z"></path></svg></i>
                    Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
                </h3>
                
                <div class="text-center mb-4 pb-4 border-b border-emerald-200">
                    <p class="text-4xl font-bold text-gray-900">${
                      product?.nutrients?.calories
                    }</p>
                    <p class="text-sm text-gray-500">Calories</p>
                </div>
                
                <div class="grid grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-emerald-500 h-2 rounded-full" style="width: ${proteinPercent}%"></div>
                        </div>
                        <p class="text-lg font-bold text-emerald-600">${protein?.toFixed(
                          1,
                        )}g</p>
                        <p class="text-xs text-gray-500">Protein</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${carbsPercent}%"></div>
                        </div>
                        <p class="text-lg font-bold text-blue-600">${carbs?.toFixed(
                          1,
                        )}g</p>
                        <p class="text-xs text-gray-500">Carbs</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div class="bg-purple-500 h-2 rounded-full" style="width: ${fatPercent}%"></div>
                          </div>
                        <p class="text-lg font-bold text-purple-600">${fat?.toFixed(
                          1,
                        )}g</p>
                        <p class="text-xs text-gray-500">Fat</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-orange-500 h-2 rounded-full" style="width: ${sugarPercent}%"></div>
                        </div>
                        <p class="text-lg font-bold text-orange-600">${sugar?.toFixed(
                          1,
                        )}g</p>
                        <p class="text-xs text-gray-500">Sugar</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">9.4g</p>
                        <p class="text-xs text-gray-500">Saturated Fat</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">${fiber?.toFixed(
                          1,
                        )}g</p>
                        <p class="text-xs text-gray-500">Fiber</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">10g</p>
                        <p class="text-xs text-gray-500">Salt</p>
                    </div>
                </div>
            </div>
            
            <!-- Additional Info -->
            
                <div class="bg-gray-50 rounded-xl p-5 mb-6">
                    <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <i class="text-gray-600" data-fa-i2svg=""><svg class="svg-inline--fa fa-list" data-prefix="fas" data-icon="list" role="img" viewBox="0 0 512 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"></path></svg></i>
                        Ingredients
                    </h3>
                    <p class="text-sm text-gray-600 leading-relaxed">Gluten Free _Oats_ (44%), _Rice_ Syrup, Coconut Oil, Raisins (8%), Coconut Sugar, Rapeseed Oil, Dried Apple Pieces (5%), Cinnamon (Cassia).</p>
                </div>
            
            
            
            
            <!-- Actions -->
            <div class="flex gap-3">
                <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all" data-barcode="5060482840179">
                    <i class="mr-2" data-fa-i2svg=""><svg class="svg-inline--fa fa-plus" data-prefix="fas" data-icon="plus" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"></path></svg></i>Log This Food
                </button>
                <button class="close-product-modal-btn flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                    Close
                </button>
            </div>
        </div>
    
            </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-product-modal").addEventListener("click", () => {
    modal.remove();
  });

  modal
    .querySelector(".close-product-modal-btn")
    .addEventListener("click", () => {
      modal.remove();
    });

  modal.querySelector(".add-product-to-log").addEventListener("click", () => {
    product.type = "Product";
    const loggedProduct = new LoggedItem(product);

    const storedProducts = getFoodLog();
    storedProducts.push(loggedProduct);
    setFoodLog(storedProducts);
    UpdateWeeklyDataOnAddingItem(loggedProduct);
    showSuccessMessage(`
        ${product.name} logged to your daily intake! 📝
    `);
    modal.remove();
  });

  document.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

export function showProductsCategories(categories) {
  productsCategoriesContainer.innerHTML = "";
  categories?.slice(0, 9).forEach((category) => {
    const config = CATEGORY_STYLES[category?.name];
    productsCategoriesContainer.innerHTML += `
                  <button
                class="product-category-btn px-5 py-3 bg-gradient-to-r ${config.bg} text-white rounded-xl text-sm font-semibold whitespace-nowrap hover:shadow-lg transition-all"
              >
                <i class="fa-solid ${config.icon} mr-1.5"></i>${category?.name}
              </button>
    `;
  });

  const categoryButtons = document.querySelectorAll(".product-category-btn");
  categoryButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const selectedCategory = categories[index]?.name;
      getProductsByCategory(selectedCategory);
    });
  });
}

document.querySelectorAll(".nutri-score-filter").forEach((nutri) => {
  nutri.addEventListener("click", () => {
    document.querySelectorAll(".nutri-score-filter").forEach((d) => {
      d.style.boxShadow = "none";
    });

    nutri.style.boxShadow = "0 0 0 2px #111827";
    const grade = nutri.dataset.grade;
    const searchValue =
      document.getElementById("product-search-input").value.trim() || "";
    LoadProductsByGrade(grade, searchValue);
  });
});

async function LoadProductsByGrade(clickedGrade, query) {
  if (!query) {
    showErrorMessage("Please search for a product first");
    return;
  }
  let grade = clickedGrade;

  try {
    const productsData = await getProductsBySearch(query);
    const { results, pagination } = productsData;

    if (grade === "all") {
      displayProduct(results.slice(0, 24), pagination.total, `for "${query}"`);
      return;
    }

    const gradedProducts = results.filter(
      (product) => product?.nutritionGrade === grade,
    );

    if (gradedProducts.length === 0) {
      productsContainer.innerHTML = "";
      emptyState.classList.remove("hidden");
      productsCount.innerHTML = `Error searching products `;
      showErrorMessage(`Failed to search products. Please try again`);
      return;
    }

    displayProduct(
      gradedProducts.slice(0, 24),
      gradedProducts.length,
      `for "${query}"`,
    );
  } catch (error) {
    console.log(error);
  }
}

const searchInput = document.getElementById("product-search-input");
const searchBtn = document.getElementById("search-product-btn");

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  loadProductsBySearch(query);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    loadProductsBySearch(query);
  }
});

const barcodeSearchInput = document.getElementById("barcode-input");
const barcodeSearchBtn = document.getElementById("lookup-barcode-btn");
barcodeSearchBtn.addEventListener("click", () => {
  const query = barcodeSearchInput.value.trim();
  getProductsByBarcode(query);
});

barcodeSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = barcodeSearchInput.value.trim();
    getProductsByBarcode(query);
  }
});
