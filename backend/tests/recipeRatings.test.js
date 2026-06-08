const test = require("node:test");
const assert = require("node:assert/strict");
const { getRatingSummary, hasUserReviewed } = require("../utils/recipeRatings");

test("getRatingSummary returns zero values when there are no reviews", () => {
  assert.deepEqual(getRatingSummary([]), {
    rating: 0,
    ratingCount: 0,
    commentCount: 0,
  });
});

test("getRatingSummary calculates average rating and counts", () => {
  assert.deepEqual(
    getRatingSummary([{ rating: 5 }, { rating: 4 }, { rating: 3 }]),
    {
      rating: 4,
      ratingCount: 3,
      commentCount: 3,
    },
  );
});

test("hasUserReviewed detects existing review by user id", () => {
  const reviews = [
    { userId: { toString: () => "user-1" } },
    { userId: { toString: () => "user-2" } },
  ];

  assert.equal(hasUserReviewed(reviews, "user-2"), true);
  assert.equal(hasUserReviewed(reviews, "user-3"), false);
});
