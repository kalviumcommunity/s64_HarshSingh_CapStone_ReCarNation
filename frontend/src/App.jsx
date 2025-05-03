
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext, useAuth } from '@/context/AuthContext';
import Home from '@/pages/home';
import Login from '@/pages/auth';
import Profile from '@/pages/profile';
import SellCar from '@/pages/sellCar';
import BrowseCar from '@/pages/BrowseCars';
import AboutUs from '@/pages/static/AboutUs';
import Contact from '@/pages/static/Contact';
import HelpCenter from '@/pages/static/HelpCenter';
import TermsAndServices from '@/pages/static/TermsAndServices';
import PrivacyPolicy from '@/pages/static/PrivacyPolicy';
import MessagingPage from './pages/messegingPage';
import OrdersPage from './pages/orders';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useContext } from "react";
import Wishlist from '@/pages/Wishlist';
import CarDetails from '@/pages/carDetails';
import ProductCars from '@/pages/productCars';
import ProfileSettings from '@/pages/profileSettings';


function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function App() {
  return (

    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/about" element={<Layout><AboutUs /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/help" element={<Layout><HelpCenter /></Layout>} />
          <Route path="/terms" element={<Layout><TermsAndServices /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
          <Route path="/browse" element={<Layout><BrowseCar /></Layout>} />
          <Route path="/cars" element={<Layout><ProductCars /></Layout>} />
          <Route path="/car/:id" element={<Layout><CarDetails /></Layout>} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-settings"
            element={
              <ProtectedRoute>
                <Layout><ProfileSettings /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sellCar"
            element={
              <ProtectedRoute>
                <Layout><SellCar /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout><OrdersPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messaging/:id"
            element={
              <ProtectedRoute>
                <Layout><MessagingPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messaging/"
            element={
              <ProtectedRoute>
                <Layout><MessagingPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Layout><Wishlist /></Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;
