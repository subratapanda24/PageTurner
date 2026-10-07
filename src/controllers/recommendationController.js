const Order = require('../models/Order');
const Book = require('../models/Book');

// @desc    Get personalized book recommendations based on purchase history
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's orders
    const orders = await Order.find({ user: userId });

    const purchasedBookIds = new Set();
    const genreFrequency = {};
    const authorFrequency = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        purchasedBookIds.add(item.book.toString());
      });
    });

    if (purchasedBookIds.size > 0) {
      // Find details of purchased books to learn preferences
      const purchasedBooks = await Book.find({ _id: { $in: Array.from(purchasedBookIds) } });

      purchasedBooks.forEach((book) => {
        if (book.genre) {
          genreFrequency[book.genre] = (genreFrequency[book.genre] || 0) + 1;
        }
        if (book.author) {
          authorFrequency[book.author] = (authorFrequency[book.author] || 0) + 1;
        }
      });
    }

    // Sort top genres
    const favoriteGenres = Object.keys(genreFrequency).sort(
      (a, b) => genreFrequency[b] - genreFrequency[a]
    );

    let recommendations = [];

    if (favoriteGenres.length > 0) {
      // Find unpurchased books in favorite genres
      recommendations = await Book.find({
        _id: { $nin: Array.from(purchasedBookIds) },
        genre: { $in: favoriteGenres },
      })
        .sort({ averageRating: -1 })
        .limit(6);
    }

    // If not enough recommendations, fill with top-rated unpurchased books
    if (recommendations.length < 6) {
      const existingIds = new Set([
        ...Array.from(purchasedBookIds),
        ...recommendations.map((b) => b._id.toString()),
      ]);

      const topRated = await Book.find({ _id: { $nin: Array.from(existingIds) } })
        .sort({ averageRating: -1, numReviews: -1 })
        .limit(6 - recommendations.length);

      recommendations = [...recommendations, ...topRated];
    }

    res.json({
      recommendations,
      basedOnGenres: favoriteGenres,
      message: favoriteGenres.length > 0
        ? `Recommendations curated based on your favorite genres: ${favoriteGenres.join(', ')}`
        : 'Top rated recommendations selected for you',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecommendations,
};
