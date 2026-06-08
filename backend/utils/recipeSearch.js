function buildRecipeSearchFilter(query = {}) {
  const { q, cuisine, meal, protein, carbs, fat } = query;
  const filter = { isPublic: true };

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { cuisine: { $regex: q, $options: "i" } },
      { meal: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }

  if (cuisine && cuisine !== "All") {
    filter.cuisine = cuisine;
  }

  if (meal && meal !== "All") {
    filter.meal = meal;
  }

  if (protein === "High") filter.protein = { $gte: 30 };
  if (protein === "Low") filter.protein = { $lte: 15 };

  if (carbs === "High") filter.carbs = { $gte: 60 };
  if (carbs === "Low") filter.carbs = { $lte: 30 };

  if (fat === "High") filter.fat = { $gte: 25 };
  if (fat === "Low") filter.fat = { $lte: 10 };

  return filter;
}

module.exports = {
  buildRecipeSearchFilter,
};
