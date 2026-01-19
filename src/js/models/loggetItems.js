export class LoggedItem {
  constructor(item) {
    this.type = item.type;
    this.name = item.name;
    this.brand = item.brand || null;
    this.serving = item.serving || 1;
    this.image = item.thumbnail || null;

    this.nutrition = {
      calories: item.nutrients?.calories || 0,
      protein: item.nutrients?.protein || 0,
      carbs: item.nutrients?.carbs || 0,
      fat: item.nutrients?.fat || 0,
    };

    this.loggedAt = new Date().toISOString();
  }
}
