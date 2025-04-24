import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Authentication from "./pages/auth";
import Profile from './pages/profile';
import Home from './pages/home';
import SellCar from './pages/sellCar';
import BrowseCar from './pages/browseCar';
import MessagingPage from './pages/messegingPage';
import OrdersPage from './pages/orders';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useContext } from "react";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
    </div>;
  }

  // Only redirect to login if we're sure the user is not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Layout Component for pages with header and footer
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes without header/footer */}
          <Route path="/login" element={<Authentication />} />
          <Route path="/register" element={<Authentication />} />
          
          {/* Routes with header/footer */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/home" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/browse" element={
            <Layout>
              <BrowseCar />
            </Layout>
          } />
          
          {/* Protected routes with header/footer */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sellCar" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SellCar />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Layout>
                  <OrdersPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messaging/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MessagingPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
