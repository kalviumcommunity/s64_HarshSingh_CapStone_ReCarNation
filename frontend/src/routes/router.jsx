import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Home from '../pages/home';
import Login from '../pages/auth';
import Register from '../pages/auth';
import SellCar from '../pages/SellCar';
import CarDetails from '../pages/CarDetails';
import Profile from '../pages/profile';
import BrowseCars from '../pages/browseCars';
import Wishlist from '../pages/Wishlist';
import MessagingPage from '../pages/messagingPage';
import PrivacyPolicy from '../pages/static/PrivacyPolicy';
import HelpCenter from '../pages/static/HelpCenter';
import TermsOfService from '../pages/static/TermsAndServices';
import AboutUs from '../pages/static/AboutUs';
import ContactUs from '../pages/static/Contact';
import Order from '../pages/orders';
// import NotFound from '../pages/NotFound'; 

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading, user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('[router.jsx/ProtectedRoute] Auth State:', {
      path: location.pathname,
      isAuthenticated,
      loading,
      hasUser: !!user,
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname, isAuthenticated, loading, user, token]);

  if (loading) {
    console.log('[router.jsx/ProtectedRoute] Loading state, showing loader');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('[router.jsx/ProtectedRoute] Not authenticated, redirecting to login', {
      from: location.pathname,
      hasToken: !!token,
      hasUser: !!user
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('[router.jsx/ProtectedRoute] Access granted to:', location.pathname);
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, loading, user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('[router.jsx/AppRoutes] Auth State Update:', {
      isAuthenticated,
      loading,
      hasUser: !!user,
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, loading, user, token]);

  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            (() => {
              console.log('[router.jsx/AppRoutes] Already authenticated, redirecting from login to home');
              return <Navigate to="/" replace />;
            })()
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            (() => {
              console.log('[router.jsx/AppRoutes] Already authenticated, redirecting from register to home');
              return <Navigate to="/" replace />;
            })()
          ) : (
            <Register />
          )
        }
      />
      <Route
        path="/sell-car"
        element={
          <ProtectedRoute>
            <Layout><SellCar /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/car/:id" element={<Layout><CarDetails /></Layout>} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        }
      />
      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="/browse" element={<Layout><BrowseCars /></Layout>} />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Layout><Wishlist /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Layout><MessagingPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout><Order /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/help-center" element={<Layout><HelpCenter /></Layout>} />
      <Route path="/terms" element={<Layout><TermsOfService /></Layout>} />
      <Route path="/about" element={<Layout><AboutUs /></Layout>} />
      <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 