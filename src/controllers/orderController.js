const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { createRazorpayOrder, verifyPaymentSignature } = require('../config/razorpay');

// @desc    Create a new order & generate Razorpay Payment Order ID
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    let orderItems = items;
    let totalAmount = 0;

    // If items not directly supplied in body, pull from user's Cart database
    if (!orderItems || orderItems.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'No order items specified and cart is empty' });
      }

      orderItems = cart.items.map((item) => ({
        book: item.book._id,
        title: item.book.title,
        price: item.price,
        quantity: item.quantity,
      }));
      totalAmount = cart.totalPrice;
    } else {
      // Calculate totalAmount from provided items
      totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid order amount' });
    }

    // 1. Create Order entry in database (status = pending)
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || {
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
      },
    });

    const createdOrder = await order.save();

    // 2. Generate Razorpay Order
    const razorpayOrder = await createRazorpayOrder(totalAmount, createdOrder._id.toString());
    createdOrder.razorpayOrderId = razorpayOrder.id;
    await createdOrder.save();

    res.status(201).json({
      order: createdOrder,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
        isMock: razorpayOrder.isMock,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment signature & update order status to paid
// @route   POST /api/orders/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (isValid) {
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      order.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
      order.razorpaySignature = razorpaySignature || 'mock_signature_valid';
      await order.save();

      // Clear user's cart after successful purchase
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });

      // Deduct stock for ordered books
      for (const item of order.items) {
        await Book.findByIdAndUpdate(item.book, {
          $inc: { stock: -item.quantity },
        });
      }

      res.json({
        message: 'Payment verified and order confirmed successfully',
        order,
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      res.status(400).json({ message: 'Invalid payment signature verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.book');
    if (order) {
      // Allow admin or the owner of the order to access it
      if (order.user.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's order history
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.book')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getOrderById,
  getMyOrders,
};
