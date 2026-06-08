const test = require("node:test");
const assert = require("node:assert/strict");
const { buildRecipeSearchFilter } = require("../utils/recipeSearch");

test("buildRecipeSearchFilter always limits public feed search to public recipes", () => {
  assert.deepEqual(buildRecipeSearchFilter({}), { isPublic: true });
});

test("buildRecipeSearchFilter builds text search across recipe fields", () => {
  const filter = buildRecipeSearchFilter({ q: "ramen" });

  assert.equal(filter.isPublic, true);
  assert.equal(filter.$or.length, 5);
  assert.deepEqual(filter.$or[0], {
    title: { $regex: "ramen", $options: "i" },
  });
});

test("buildRecipeSearchFilter ignores All filters and applies selected filters", () => {
  assert.deepEqual(
    buildRecipeSearchFilter({
      cuisine: "All",
      meal: "Dinner",
      protein: "High",
      carbs: "Low",
      fat: "High",
    }),
    {
      isPublic: true,
      meal: "Dinner",
      protein: { $gte: 30 },
      carbs: { $lte: 30 },
      fat: { $gte: 25 },
    },
  );
});
