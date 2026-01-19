import { displayFoodLog } from "../ui/foodLog/foodLogUi.js";


export function LoadCachedLogByDate(date) {
  const data = localStorage.getItem(date);

  if (data === null || data === "undefined") {
    return { calories: 0, items: 0 };
  }

  return JSON.parse(data);
}

export function CacheLogByDate(date, data) {
  localStorage.setItem(date, JSON.stringify(data));
}


export function getFoodLog() {
  return JSON.parse(localStorage.getItem("loggedItems") || "[]");
}

export function setFoodLog(data) {
  localStorage.setItem("loggedItems", JSON.stringify(data));
  displayFoodLog(data);
}
