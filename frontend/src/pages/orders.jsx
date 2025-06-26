import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/lib/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Calendar, MapPin, DollarSign, Package, User } from 'lucide-react';

const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching orders for user:', user);
        const response = await axiosInstance.get('/api/orders');
        console.log('Orders response:', response.data);
        setOrders(Array.isArray(response.data) ? response.data : response.data.orders || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayNow = async (orderId, amount) => {
    try {
      // You can implement different payment methods here
      // For now, let's show a simple confirmation
      const confirmed = window.confirm(`Pay ₹${amount?.toLocaleString()} for this order?`);
      
      if (confirmed) {
        // Here you would typically integrate with a payment gateway
        // For now, let's update the payment status to completed
        const response = await axiosInstance.put(`/api/orders/${orderId}/payment`, {
          paymentStatus: 'completed'
        });
        
        if (response.data) {
          // Refresh orders to show updated status
          const updatedOrders = orders.map(order => 
            order._id === orderId 
              ? { ...order, paymentStatus: 'completed' }
              : order
          );
          setOrders(updatedOrders);
          alert('Payment successful!');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  // Show loading screen during authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // If no user and not loading, they should be redirected to login
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <Link 
                to="/browse" 
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
              >
                Browse Cars
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">
                          {order.product?.make} {order.product?.model}
                        </h3>
                        <p className="text-sm text-gray-500">Order #{order._id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status || order.paymentStatus)}`}>
                        {order.status || order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Order Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>Location: {order.product?.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>Seller: {order.seller?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          {/* <DollarSign className="h-4 w-4 mr-2" /> */}
                          <span>Price: ₹{order.price?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Car className="h-4 w-4 mr-2" />
                          <span>Year: {order.product?.year}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        {order.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handlePayNow(order._id, order.price)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium mr-3"
                          >
                            Pay Now - ₹{order.price?.toLocaleString()}
                          </button>
                        )}
                      </div>
                      <Link 
                        to={`/car/${order.product?._id}`}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View Car Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;