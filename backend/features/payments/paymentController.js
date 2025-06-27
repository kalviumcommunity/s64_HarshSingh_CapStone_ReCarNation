const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../../model/orderModel');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    // Validate required fields
    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and Order ID are required'
      });
    }

    // Check if order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, buyer: req.user._id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paisa and ensure it's an integer
      currency: currency,
      receipt: `order_rcpt_${orderId}`,
      notes: {
        orderId: orderId,
        userId: req.user._id.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      });
    }

    // Check if order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, buyer: req.user._id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate signature to verify payment
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update order with payment details
    order.paymentStatus = 'completed';
    order.status = 'processing';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();

    await order.save();

    // Populate order with product and seller details
    const updatedOrder = await Order.findById(orderId)
      .populate('product')
      .populate('seller', 'name email');

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, buyer: req.user._id })
      .populate('product')
      .populate('seller', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Return payment-related information
    const paymentInfo = {
      orderId: order._id,
      amount: order.price,
      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      paidAt: order.paidAt,
      product: order.product,
      seller: order.seller
    };

    res.status(200).json({
      success: true,
      data: paymentInfo
    });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// Refund payment (if needed)
exports.refundPayment = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    // Check if order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, buyer: req.user._id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is paid
    if (order.paymentStatus !== 'completed' || !order.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Order is not paid or payment ID not found'
      });
    }

    // Create refund
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: order.price * 100, // Amount in paisa
      notes: {
        reason: reason || 'Customer requested refund',
        orderId: orderId
      }
    });

    // Update order status
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    order.refundId = refund.id;
    order.refundedAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};