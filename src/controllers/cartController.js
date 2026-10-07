const Cart = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or update item in cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + Number(quantity);
      if (newQty <= 0) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].quantity = newQty;
      }
    } else if (Number(quantity) > 0) {
      cart.items.push({
        book: book._id,
        quantity: Number(quantity),
        price: book.price,
      });
    }

    // Calculate total price
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.book');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = cart.items.filter((item) => item.book.toString() !== bookId);
      cart.totalPrice = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      await cart.save();
      const populatedCart = await Cart.findById(cart._id).populate('items.book');
      return res.json(populatedCart);
    }

    res.status(404).json({ message: 'Cart not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      await cart.save();
    }
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};
