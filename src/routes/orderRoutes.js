const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getOrderById, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createOrder);
router.post('/verify', verifyPayment);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
