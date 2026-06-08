function getRatingSummary(reviews = []) {
  const ratingCount = reviews.length;

  if (ratingCount === 0) {
    return {
      rating: 0,
      ratingCount: 0,
      commentCount: 0,
    };
  }

  const totalRating = reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0,
  );

  return {
    rating: totalRating / ratingCount,
    ratingCount,
    commentCount: ratingCount,
  };
}

function hasUserReviewed(reviews = [], userId) {
  return reviews.some((review) => review.userId?.toString() === userId);
}

module.exports = {
  getRatingSummary,
  hasUserReviewed,
};
