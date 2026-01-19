export function showErrorMessage(message) {
  const errorToast = document.createElement("div");
  errorToast.className =
    "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 toast-notification";
  errorToast.innerHTML = message;
  document.body.appendChild(errorToast);
  setTimeout(() => {
    errorToast.remove();
  }, 2000);
}

export function showDeletedFoodLogMessage(message) {
  let toast = document.createElement("div");
  toast.className =
    "fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 toast-notification";
  toast.innerHTML = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

export function showSuccessMessage(message) {
  const successToast = document.createElement("div");
  successToast.className =
    "fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 toast-notification";
  successToast.innerHTML = message;
  document.body.appendChild(successToast);
  setTimeout(() => {
    successToast.remove();
  }, 2000);
}

export function ToggleSetUp() {
  document.querySelector("#meal-categories-section").classList.toggle("hidden");
  document.querySelector("#search-filters-section").classList.toggle("hidden");
  document.getElementById("all-recipes-section").classList.toggle("hidden");
  document.getElementById("meal-details").classList.toggle("hidden");
}
