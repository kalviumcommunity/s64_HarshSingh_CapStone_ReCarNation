import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/lib/axios';
import { initializeRazorpayPayment, formatAmount } from '@/utils/razorpay';
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get order details from location state if available
  const orderFromState = location.state?.order;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        if (orderFromState) {
          setOrder(orderFromState);
        } else {
          // Fetch order details from API
          const response = await axiosInstance.get(`/api/orders/${orderId}`);
          setOrder(response.data);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (user && orderId) {
      fetchOrderDetails();
    }
  }, [orderId, user, orderFromState]);

  const createRazorpayOrder = async (amount) => {
    try {
      console.log('Creating Razorpay order with:', { amount, orderId });
      const response = await axiosInstance.post('/api/payments/create-order', {
        amount: amount,
        currency: 'INR',
        orderId: orderId
      });
      console.log('Razorpay order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await axiosInstance.post('/api/payments/verify', {
        ...paymentData,
        orderId: orderId
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    try {
      setPaymentLoading(true);
      
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(order.price);
      
      // Determine the actual payment amount (test mode limitation)
      const isTestMode = import.meta.env.VITE_RAZORPAY_TEST_MODE === 'true';
      const paymentAmount = isTestMode && order.price > 50000 ? 50000 : order.price;
      
      // Initialize Razorpay payment
      await initializeRazorpayPayment({
        orderId: order._id,
        amount: paymentAmount,
        description: `Payment for ${order.product?.make} ${order.product?.model}`,
        orderRzpId: razorpayOrder.data?.id || razorpayOrder.id,
        userDetails: {
          name: user?.displayName || user?.name,
          email: user?.email,
          phone: user?.phone
        },
        onSuccess: async (response) => {
          try {
            // Verify payment on backend
            await verifyPayment(response);
            
            // Show success message and redirect
            alert('Payment successful! Your order has been confirmed.');
            navigate('/orders', { replace: true });
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
        },
        onDismiss: () => {
          console.log('Payment modal dismissed');
        }
      });
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/orders')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Order not found</div>
          <button
            onClick={() => navigate('/orders')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Car:</span>
                <span className="font-medium">
                  {order.product?.make} {order.product?.model} ({order.product?.year})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-sm">#{order._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seller:</span>
                <span className="font-medium">{order.seller?.name || 'Unknown'}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-orange-600">{formatAmount(order.price)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-900">Razorpay Secure Payment</h3>
                  <p className="text-sm text-blue-700">
                    Pay securely using Credit Card, Debit Card, Net Banking, UPI, or Wallet
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your payment information is encrypted and secure. We don't store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Test Mode Warning */}
          {import.meta.env.VITE_RAZORPAY_TEST_MODE === 'true' && order.price > 50000 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-6 w-6 text-yellow-600 mr-3">⚠️</div>
                <div>
                  <h3 className="font-medium text-yellow-800">Test Mode - Demo Payment</h3>
                  <p className="text-sm text-yellow-700">
                    This is a test transaction. The actual amount is {formatAmount(order.price)}, 
                    but you'll be charged ₹50,000 for demo purposes due to Razorpay test limits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Status Info */}
          {order.paymentStatus === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-green-800">Payment Already Completed</h3>
                  <p className="text-sm text-green-700">
                    This order has already been paid for.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pay Now Button */}
          {order.paymentStatus !== 'completed' && (
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2"
              >
                {paymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>
                      Pay {import.meta.env.VITE_RAZORPAY_TEST_MODE === 'true' && order.price > 50000 
                        ? '₹50,000 (Demo)' 
                        : formatAmount(order.price)}
                    </span>
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Payment will be processed instantly</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;