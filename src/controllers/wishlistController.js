const User = require('../models/User');
const Book = require('../models/Book');

// @desc    Get logged in user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      count: user.wishlist.length,
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add book to user's wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const user = await User.findById(req.user._id);
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === bookId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(400).json({ message: 'Book is already in your wishlist' });
    }

    user.wishlist.push(bookId);
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    res.status(201).json({
      message: 'Book added to wishlist',
      wishlist: populatedUser.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove book from user's wishlist
// @route   DELETE /api/wishlist/:bookId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== bookId.toString()
    );
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json({
      message: 'Book removed from wishlist',
      wishlist: populatedUser.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
