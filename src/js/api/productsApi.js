import {
  displayProduct,
  displaySingleProduct,
  showProductsCategories,
} from "../ui/products/productsUI.js";
import {
  showProductsLoading,
  hideProductsLoading,
} from "../ui/common/loading.js";

const BASE_URL = "https://nutriplan-api.vercel.app/api/products";

export async function getProductsBySearch(product) {
  try {
    showProductsLoading();
    const res = await fetch(`${BASE_URL}/search?q=${product}&page=1&limit=all`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("Error searching products:", error);
  } finally {
    hideProductsLoading();
  }
}

export async function getProductsByBarcode(barcode) {
  try {
    showProductsLoading();
    const res = await fetch(`${BASE_URL}/barcode/${barcode}`);
    const data = await res.json();
    const product = data.result;
    displaySingleProduct(product, barcode);
  } catch (error) {
    console.log("Error fetching product by barcode:", error);
  } finally {
    hideProductsLoading();
  }
}

export async function getAllProductsCategory() {
  try {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    const categories = data.results;
    showProductsCategories(categories);
  } catch (error) {
    console.log("Error fetching categories:", error);
  }
}

export async function getProductsByCategory(category) {
  try {
    showProductsLoading();
    const res = await fetch(`${BASE_URL}/category/${category}`);
    const data = await res.json();
    const products = data.results;
    const total = data.pagination.total;
    displayProduct(products, total, category);
  } catch (error) {
    console.log("Error fetching products by category:", error);
  } finally {
    hideProductsLoading();
  }
}
