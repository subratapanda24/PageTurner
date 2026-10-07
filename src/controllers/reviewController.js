const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');

// @desc    Create new review for a book
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Verify if user has purchased this book (or is admin)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.book': bookId,
    });

    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Only verified purchasers can rate and review this book. Please purchase the book first.',
      });
    }

    // Check if user already reviewed this book
    const alreadyReviewed = await Review.findOne({
      book: bookId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already submitted a review for this book' });
    }

    const review = await Review.create({
      book: bookId,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
    });

    // Recalculate book average rating and review count
    const reviews = await Review.find({ book: bookId });
    book.numReviews = reviews.length;
    book.averageRating = Number(
      (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1)
    );

    await book.save();

    res.status(201).json({
      message: 'Review added successfully',
      review,
      updatedBookRating: book.averageRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a book
// @route   GET /api/reviews/book/:id
// @access  Public
const getReviewsByBook = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
  getReviewsByBook,
};
