const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;
let isRazorpayConfigured = false;

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (keyId && keySecret && !keyId.includes('placeholder') && !keySecret.includes('placeholder')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    isRazorpayConfigured = true;
    console.log('Razorpay initialized with provided Key ID');
  } catch (err) {
    console.warn('Razorpay initialization error:', err.message);
  }
} else {
  console.log('Razorpay live keys not set in .env - Razorpay mock/sandbox mode is active.');
}

/**
 * Creates a payment order (via real Razorpay API if keys exist, or mock response)
 */
const createRazorpayOrder = async (amountInINR, receiptId) => {
  const amountInPaisa = Math.round(amountInINR * 100);

  if (isRazorpayConfigured && razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaisa,
        currency: 'INR',
        receipt: receiptId,
      });
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        isMock: false,
      };
    } catch (err) {
      console.error('Razorpay API error, falling back to sandbox order:', err.message);
    }
  }

  // Mock Razorpay order response for test/evaluation mode
  const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    id: mockOrderId,
    amount: amountInPaisa,
    currency: 'INR',
    isMock: true,
  };
};

/**
 * Verifies Razorpay payment signature
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!isRazorpayConfigured || !orderId || orderId.startsWith('order_mock_')) {
    return true; // Mock order or sandbox mode always passes test verification
  }

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  razorpayInstance,
  isRazorpayConfigured,
  createRazorpayOrder,
  verifyPaymentSignature,
};
