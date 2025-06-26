const Order = require('../../model/orderModel');
const Product = require('../../model/productsModel');
const User = require('../../model/userModel');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { productId, address, paymentStatus, paymentMethod } = req.body;
    const buyer = req.user._id;
    const product = await Product.findById(productId).populate('listedBy');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const order = new Order({
      buyer,
      seller: product.listedBy?._id || product.listedBy,
      product: productId,
      price: product.price,
      paymentStatus: paymentStatus || 'pending',
      paymentMethod: paymentMethod || 'cash',
      meetingLocation: address,
      meetingDate: new Date(), // default to now, can be updated later
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('product')
      .populate('seller', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update payment status for an order
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    
    // Find the order and make sure it belongs to the current user
    const order = await Order.findOne({ _id: orderId, buyer: req.user._id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update payment status
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'completed') {
      order.status = 'processing'; // Move to processing when payment is completed
    }
    
    await order.save();
    
    // Return updated order with populated fields
    const updatedOrder = await Order.findById(orderId)
      .populate('product')
      .populate('seller', 'name email');
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
